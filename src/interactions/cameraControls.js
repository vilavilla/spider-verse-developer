import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { gsap } from "gsap";

export function createCameraControls(camera, canvas, reducedMotion = false) {
  let motionReduced = reducedMotion;
  const controls = new OrbitControls(camera, canvas);
  const home = { x: 0, y: 11.5, z: 30, tx: 0, ty: 8, tz: -24 };
  controls.target.set(home.tx, home.ty, home.tz);
  controls.enableDamping = true;
  controls.dampingFactor = 0.055;
  controls.enablePan = false;
  controls.minDistance = 16;
  controls.maxDistance = 52;
  controls.minPolarAngle = Math.PI * 0.22;
  controls.maxPolarAngle = Math.PI * 0.54;
  controls.autoRotate = !motionReduced;
  controls.autoRotateSpeed = 0.28;
  controls.saveState();

  const setEnabled = (enabled) => { controls.enabled = enabled; };

  function reset() {
    controls.enabled = false;
    const target = controls.target;
    gsap.to(camera.position, { x: home.x, y: home.y, z: home.z, duration: motionReduced ? 0.01 : 1.25, ease: "power3.inOut" });
    gsap.to(target, {
      x: home.tx, y: home.ty, z: home.tz,
      duration: motionReduced ? 0.01 : 1.25,
      ease: "power3.inOut",
      onUpdate: () => controls.update(),
      onComplete: () => { controls.enabled = true; },
    });
  }

  function rotate(direction) {
    controls.enabled = false;
    const angle = direction * 0.2;
    const offsetX = camera.position.x - controls.target.x;
    const offsetZ = camera.position.z - controls.target.z;
    const next = {
      x: controls.target.x + offsetX * Math.cos(angle) - offsetZ * Math.sin(angle),
      z: controls.target.z + offsetX * Math.sin(angle) + offsetZ * Math.cos(angle),
    };
    gsap.to(camera.position, {
      ...next,
      duration: motionReduced ? 0.01 : 0.55,
      ease: "power2.out",
      onUpdate: () => controls.update(),
      onComplete: () => { controls.enabled = true; },
    });
  }

  function jump() {
    const startY = camera.position.y;
    gsap.timeline().to(camera.position, { y: startY + (motionReduced ? 0.5 : 2.2), duration: motionReduced ? .05 : .24, ease: "power2.out" })
      .to(camera.position, { y: startY, duration: motionReduced ? .05 : .48, ease: "bounce.out" });
  }

  function impact() {
    if (motionReduced) return;
    const baseX = camera.position.x;
    const baseY = camera.position.y;
    gsap.timeline().to(camera.position, { x: baseX + .12, y: baseY - .08, duration: .055 })
      .to(camera.position, { x: baseX - .08, y: baseY + .04, duration: .055 })
      .to(camera.position, { x: baseX, y: baseY, duration: .12, ease: "power2.out" });
  }

  function setReducedMotion(value) {
    motionReduced = value;
    if (value) controls.autoRotate = false;
  }

  return { controls, reset, rotate, jump, impact, setEnabled, setReducedMotion, isReducedMotion: () => motionReduced };
}
