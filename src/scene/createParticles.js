import * as THREE from "three";

export function createParticles(scene, preset) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(preset.particles * 3);
  const speeds = new Float32Array(preset.particles);

  for (let index = 0; index < preset.particles; index += 1) {
    const i3 = index * 3;
    positions[i3] = (Math.random() - 0.5) * 110;
    positions[i3 + 1] = Math.random() * 44 - 4;
    positions[i3 + 2] = -Math.random() * 95 + 12;
    speeds[index] = 0.25 + Math.random() * 0.55;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0xcce8ff,
    size: preset.label === "Cinematic" ? 0.1 : 0.075,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geometry, material);
  points.name = "ambient-particles";
  scene.add(points);

  return {
    points,
    update(delta, elapsed) {
      const array = geometry.attributes.position.array;
      for (let index = 0; index < preset.particles; index += 1) {
        const i3 = index * 3;
        array[i3 + 1] += delta * speeds[index] * 0.4;
        array[i3] += Math.sin(elapsed * 0.35 + index) * delta * 0.025;
        if (array[i3 + 1] > 42) array[i3 + 1] = -4;
      }
      geometry.attributes.position.needsUpdate = true;
    },
  };
}
