import * as THREE from "three";

const seeded = (seed) => {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
};

export function createCity(scene, preset) {
  const random = seeded(197701);
  const group = new THREE.Group();
  group.name = "procedural-city";

  const buildingGeometry = new THREE.BoxGeometry(1, 1, 1);
  const buildingMaterial = new THREE.MeshStandardMaterial({
    color: 0x0b1020,
    roughness: 0.78,
    metalness: 0.24,
  });
  const buildings = new THREE.InstancedMesh(buildingGeometry, buildingMaterial, preset.buildings);
  buildings.name = "instanced-buildings";
  buildings.castShadow = preset.shadows;
  buildings.receiveShadow = preset.shadows;

  const dummy = new THREE.Object3D();
  const windowTransforms = [];
  const coolWindowTransforms = [];
  const columns = Math.ceil(Math.sqrt(preset.buildings * 1.9));

  for (let index = 0; index < preset.buildings; index += 1) {
    const lane = index % columns;
    const row = Math.floor(index / columns);
    const x = (lane - columns / 2) * 5.6 + (random() - 0.5) * 1.5;
    const z = -7 - row * 6.8 - random() * 2.2;
    const edgeBoost = Math.max(0, 1 - Math.abs(x) / 50);
    const width = 2.2 + random() * 2.6;
    const depth = 2.8 + random() * 3.4;
    const height = 5 + random() * 17 + edgeBoost * random() * 10;

    dummy.position.set(x, height / 2 - 2.2, z);
    dummy.scale.set(width, height, depth);
    dummy.rotation.y = (random() - 0.5) * 0.05;
    dummy.updateMatrix();
    buildings.setMatrixAt(index, dummy.matrix);

    const floors = Math.min(12, Math.max(2, Math.floor(height / 2.1)));
    const windowColumns = Math.max(1, Math.floor(width / 1.15));
    for (let floor = 1; floor < floors; floor += 1) {
      for (let col = 0; col < windowColumns; col += 1) {
        if (random() > preset.windowChance) continue;
        const transform = {
          x: x + (col - (windowColumns - 1) / 2) * 0.86,
          y: floor * 1.72 - 1.15,
          z: z + depth / 2 + 0.012,
          scaleX: Math.min(0.5, width / (windowColumns * 1.8)),
        };
        (random() > 0.22 ? windowTransforms : coolWindowTransforms).push(transform);
      }
    }
  }
  buildings.instanceMatrix.needsUpdate = true;
  group.add(buildings);

  const addWindows = (transforms, color, opacity) => {
    if (!transforms.length) return;
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, toneMapped: false, side: THREE.DoubleSide });
    const windows = new THREE.InstancedMesh(geometry, material, transforms.length);
    transforms.forEach((item, index) => {
      dummy.position.set(item.x, item.y, item.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(item.scaleX, 0.56, 1);
      dummy.updateMatrix();
      windows.setMatrixAt(index, dummy.matrix);
    });
    windows.instanceMatrix.needsUpdate = true;
    windows.name = "instanced-windows";
    group.add(windows);
  };
  addWindows(windowTransforms, 0xffdba2, 0.92);
  addWindows(coolWindowTransforms, 0x8fd5ff, 0.82);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(150, 150),
    new THREE.MeshStandardMaterial({ color: 0x03050c, roughness: 0.96, metalness: 0.1 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -2.25, -44);
  ground.receiveShadow = preset.shadows;
  group.add(ground);

  const fallback = new THREE.Mesh(
    new THREE.PlaneGeometry(160, 100),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }),
  );
  fallback.position.set(0, 22, -76);
  fallback.name = "web-fallback-plane";
  group.add(fallback);

  scene.add(group);
  return { group, raycastTargets: [buildings, fallback], objectCount: preset.buildings + windowTransforms.length + coolWindowTransforms.length };
}
