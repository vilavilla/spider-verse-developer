import * as THREE from "three";
import { gsap } from "gsap";
import { QUALITY_PRESETS } from "../utils/responsive.js";

const MAX_WEBS = 6;

export function createWebShooter({ sceneApp, surface, onLaunch, onImpact, reducedMotion }) {
  const isMotionReduced = () => sceneApp.cameraRig.isReducedMotion?.() ?? reducedMotion;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const activeWebs = [];
  const webMaterial = new THREE.LineBasicMaterial({ color: 0xdaf5ff, transparent: true, opacity: 0.94, toneMapped: false });
  const filamentMaterial = new THREE.LineBasicMaterial({ color: 0xb9eaff, transparent: true, opacity: 0.62, toneMapped: false });
  const impactMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, side: THREE.DoubleSide, toneMapped: false });
  const impactGeometry = new THREE.RingGeometry(0.16, 0.22, 28);

  function removeWeb(record) {
    if (!record || record.removed) return;
    record.removed = true;
    record.timeline?.kill();
    record.group.traverse((child) => {
      if (child.geometry !== impactGeometry) child.geometry?.dispose?.();
    });
    record.group.removeFromParent();
    const index = activeWebs.indexOf(record);
    if (index >= 0) activeWebs.splice(index, 1);
  }

  function createFilaments(point, normal, count) {
    const group = new THREE.Group();
    const tangentA = new THREE.Vector3(1, 0, 0);
    if (Math.abs(normal.dot(tangentA)) > 0.9) tangentA.set(0, 1, 0);
    tangentA.cross(normal).normalize();
    const tangentB = new THREE.Vector3().crossVectors(normal, tangentA).normalize();
    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * Math.PI * 2 + Math.random() * 0.24;
      const length = 0.6 + Math.random() * 0.85;
      const end = point.clone()
        .addScaledVector(tangentA, Math.cos(angle) * length)
        .addScaledVector(tangentB, Math.sin(angle) * length)
        .addScaledVector(normal, 0.03);
      const geometry = new THREE.BufferGeometry().setFromPoints([point, end]);
      group.add(new THREE.Line(geometry, filamentMaterial));
    }
    return group;
  }

  function shootAt(clientX, clientY, isSynthetic = false) {
    const { camera } = sceneApp;
    const rect = surface.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    const hit = raycaster.intersectObjects(sceneApp.city().raycastTargets, false)[0];
    if (!hit) return false;

    const destination = hit.point.clone();
    const origin = camera.localToWorld(new THREE.Vector3(pointer.x * 0.11, -0.32, -1.25));
    const distance = origin.distanceTo(destination);
    const midpoint = origin.clone().lerp(destination, 0.52);
    const direction = destination.clone().sub(origin).normalize();
    const side = new THREE.Vector3().crossVectors(direction, camera.up).normalize();
    midpoint.addScaledVector(side, (Math.random() - 0.5) * Math.min(5, distance * 0.16));
    midpoint.y += Math.min(2.8, distance * 0.07) + (Math.random() - 0.5) * 0.8;

    const controlA = origin.clone().lerp(midpoint, 0.54).add(new THREE.Vector3(0, -0.45, 0));
    const controlB = midpoint.clone().lerp(destination, 0.6).addScaledVector(side, (Math.random() - 0.5) * 1.4);
    const curve = new THREE.CatmullRomCurve3([origin, controlA, midpoint, controlB, destination], false, "catmullrom", 0.55);
    const segments = Math.max(34, Math.min(86, Math.round(distance * 1.55)));
    const points = curve.getPoints(segments);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    geometry.setDrawRange(0, 1);
    const line = new THREE.Line(geometry, webMaterial);

    const group = new THREE.Group();
    group.add(line);
    scene.add(group);

    const record = { group, timeline: null, removed: false };
    activeWebs.push(record);
    if (activeWebs.length > MAX_WEBS) removeWeb(activeWebs[0]);
    onLaunch?.(isSynthetic);

    const draw = { count: 1 };
    const motionReduced = isMotionReduced();
    const duration = motionReduced ? 0.08 : Math.min(0.48, 0.18 + distance * 0.006);
    record.timeline = gsap.timeline({
      onComplete: () => gsap.delayedCall(motionReduced ? 1.2 : 4.1, () => {
        gsap.to(group.scale, { x: 0.99, y: 1.01, z: 0.99, duration: 0.1, yoyo: true, repeat: 1 });
        gsap.delayedCall(motionReduced ? .05 : .5, () => removeWeb(record));
      }),
    });
    record.timeline.to(draw, {
      count: points.length,
      duration,
      ease: "power3.out",
      onUpdate: () => geometry.setDrawRange(0, Math.ceil(draw.count)),
    }).call(() => {
      const normal = hit.face?.normal?.clone().transformDirection(hit.object.matrixWorld) ?? direction.clone().negate();
      const ring = new THREE.Mesh(impactGeometry, impactMaterial);
      ring.position.copy(destination).addScaledVector(normal, 0.03);
      ring.quaternion.copy(camera.quaternion);
      ring.scale.setScalar(0.1);
      group.add(ring);

      const filamentCount = QUALITY_PRESETS[sceneApp.getQuality()].webFilaments;
      const filaments = createFilaments(destination, normal, filamentCount);
      group.add(filaments);
      gsap.to(ring.scale, { x: 1, y: 1, z: 1, duration: motionReduced ? .02 : .18, ease: "back.out(3)" });
      gsap.to(filaments.scale, { x: 1.08, y: 1.08, z: 1.08, duration: .2, yoyo: true, repeat: 1 });
      sceneApp.cameraRig.impact();
      onImpact?.();
    });
    return true;
  }

  function handlePointer(event) {
    if (event.button !== undefined && event.button !== 0) return;
    if (event.target.closest("button, a, select, input, .mission-panel")) return;
    shootAt(event.clientX, event.clientY);
  }

  function shootRandom() {
    const rect = surface.getBoundingClientRect();
    const x = rect.left + rect.width * (0.35 + Math.random() * 0.5);
    const y = rect.top + rect.height * (0.2 + Math.random() * 0.58);
    return shootAt(x, y, true);
  }

  surface.addEventListener("pointerdown", handlePointer);

  return {
    shootAt,
    shootRandom,
    getActiveCount: () => activeWebs.length,
    destroy() {
      surface.removeEventListener("pointerdown", handlePointer);
      [...activeWebs].forEach(removeWeb);
      webMaterial.dispose();
      filamentMaterial.dispose();
      impactMaterial.dispose();
      impactGeometry.dispose();
    },
  };
}
