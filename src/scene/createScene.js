import * as THREE from "three";
import { createCity } from "./createCity.js";
import { createLighting } from "./createLighting.js";
import { createParticles } from "./createParticles.js";
import { createCameraControls } from "../interactions/cameraControls.js";
import { QUALITY_PRESETS } from "../utils/responsive.js";
import { disposeObject3D } from "../utils/dispose.js";

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

export async function createScene({ canvas, quality, loadingManager, reducedMotion }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x03040a);
  scene.fog = new THREE.FogExp2(0x070918, 0.018);

  const camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 220);
  camera.position.set(0, 11.5, 30);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: quality !== "performance", powerPreference: "high-performance", alpha: false });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  const preset = QUALITY_PRESETS[quality];
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, preset.pixelRatio));
  renderer.shadowMap.enabled = preset.shadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const cameraRig = createCameraControls(camera, canvas, reducedMotion);
  let city;
  let particles;
  let lights;

  const stageNames = ["lighting", "procedural-city", "ambient-particles"];
  stageNames.forEach((name) => loadingManager.itemStart(name));

  const buildStage = async (name, factory) => {
    await nextFrame();
    const result = factory();
    loadingManager.itemEnd(name);
    return result;
  };

  lights = await buildStage("lighting", () => createLighting(scene, preset));
  city = await buildStage("procedural-city", () => createCity(scene, preset));
  particles = await buildStage("ambient-particles", () => createParticles(scene, preset));

  const clock = new THREE.Clock();
  let running = true;
  let frameId = 0;
  let currentQuality = quality;

  const stats = { fps: 0, objectCount: city.objectCount, frames: 0, sampleStart: performance.now() };

  function render() {
    if (!running) return;
    const delta = Math.min(clock.getDelta(), 0.05);
    const elapsed = clock.elapsedTime;
    particles.update(delta, elapsed);
    cameraRig.controls.update();
    renderer.render(scene, camera);

    stats.frames += 1;
    const now = performance.now();
    if (now - stats.sampleStart >= 500) {
      stats.fps = Math.round((stats.frames * 1000) / (now - stats.sampleStart));
      stats.frames = 0;
      stats.sampleStart = now;
    }
    frameId = requestAnimationFrame(render);
  }

  async function setQuality(nextQuality) {
    if (nextQuality === currentQuality) return;
    const nextPreset = QUALITY_PRESETS[nextQuality];
    currentQuality = nextQuality;
    cameraRig.controls.enabled = false;

    disposeObject3D(city.group);
    disposeObject3D(particles.points);
    disposeObject3D(lights.group);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, nextPreset.pixelRatio));
    renderer.shadowMap.enabled = nextPreset.shadows;
    lights = createLighting(scene, nextPreset);
    city = createCity(scene, nextPreset);
    particles = createParticles(scene, nextPreset);
    stats.objectCount = city.objectCount;
    cameraRig.controls.enabled = true;
  }

  let resizeTimer;
  function resize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      const ratio = QUALITY_PRESETS[currentQuality].pixelRatio;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, ratio));
      renderer.setSize(window.innerWidth, window.innerHeight, false);
    }, 100);
  }

  function handleVisibility() {
    running = !document.hidden;
    if (running) {
      clock.getDelta();
      render();
    } else {
      cancelAnimationFrame(frameId);
    }
  }

  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", handleVisibility);
  render();

  return {
    scene,
    camera,
    renderer,
    cameraRig,
    lights: () => lights,
    city: () => city,
    stats,
    getQuality: () => currentQuality,
    setQuality,
    destroy() {
      running = false;
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
      cameraRig.controls.dispose();
      disposeObject3D(city.group);
      disposeObject3D(particles.points);
      disposeObject3D(lights.group);
      renderer.dispose();
    },
  };
}
