import * as THREE from "three";

export function createLighting(scene, preset) {
  const group = new THREE.Group();
  group.name = "city-lighting";

  const hemisphere = new THREE.HemisphereLight(0x536ba7, 0x08050a, 1.25);
  group.add(hemisphere);

  const moonLight = new THREE.DirectionalLight(0x9cc8ff, preset.shadows ? 2.6 : 1.9);
  moonLight.position.set(16, 34, 18);
  moonLight.castShadow = preset.shadows;
  moonLight.shadow.mapSize.set(preset.label === "Cinematic" ? 2048 : 1024, preset.label === "Cinematic" ? 2048 : 1024);
  moonLight.shadow.camera.near = 1;
  moonLight.shadow.camera.far = 120;
  moonLight.shadow.camera.left = -42;
  moonLight.shadow.camera.right = 42;
  moonLight.shadow.camera.top = 45;
  moonLight.shadow.camera.bottom = -25;
  group.add(moonLight);

  const redLight = new THREE.PointLight(0xff183b, 0, 62, 1.7);
  redLight.position.set(15, 14, -10);
  group.add(redLight);

  const blueAccent = new THREE.PointLight(0x296dff, preset.label === "Cinematic" ? 18 : 9, 52, 2);
  blueAccent.position.set(-18, 8, -18);
  group.add(blueAccent);

  const moon = new THREE.Mesh(
    new THREE.CircleGeometry(5.4, 48),
    new THREE.MeshBasicMaterial({ color: 0xddeaff, fog: false, toneMapped: false }),
  );
  moon.position.set(26, 27, -78);
  moon.renderOrder = -1;
  group.add(moon);

  const halo = new THREE.Mesh(
    new THREE.CircleGeometry(9.6, 48),
    new THREE.MeshBasicMaterial({ color: 0x6b8cca, transparent: true, opacity: 0.08, fog: false, depthWrite: false, toneMapped: false }),
  );
  halo.position.copy(moon.position);
  halo.position.z += 0.2;
  group.add(halo);

  scene.add(group);
  return { group, redLight, moonLight };
}
