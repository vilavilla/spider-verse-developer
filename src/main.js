import * as THREE from "three";
import { gsap } from "gsap";
import "./styles.css";
import { createScene } from "./scene/createScene.js";
import { createWebShooter } from "./interactions/webShooter.js";
import { createLoader } from "./ui/loader.js";
import { createNotifications } from "./ui/notifications.js";
import { detectInitialQuality, prefersReducedMotion } from "./utils/responsive.js";
import { createSoundSystem } from "./utils/sound.js";

function supportsWebGL() {
  try {
    const probe = document.createElement("canvas");
    return Boolean(window.WebGLRenderingContext && (probe.getContext("webgl2") || probe.getContext("webgl")));
  } catch {
    return false;
  }
}

async function bootstrap() {
  if (!supportsWebGL()) {
    document.querySelector("#loader").classList.add("is-hidden");
    document.querySelector("#webgl-fallback").hidden = false;
    return;
  }

  const canvas = document.querySelector("#city-canvas");
  const surface = document.querySelector("#experience");
  const loadingManager = new THREE.LoadingManager();
  const loader = createLoader(loadingManager);
  const notify = createNotifications();
  const sound = createSoundSystem();
  const reducedMotion = prefersReducedMotion();
  document.body.classList.toggle("reduce-motion", reducedMotion);

  try {
    const sceneApp = await createScene({
      canvas,
      quality: detectInitialQuality(),
      loadingManager,
      reducedMotion,
    });

    const webShooter = createWebShooter({
      sceneApp,
      surface,
      reducedMotion,
      onLaunch: () => sound.play("web"),
      onImpact: () => sound.play("impact"),
    });

    const soundToggle = document.querySelector("#sound-toggle");
    soundToggle.addEventListener("click", async () => {
      const enabled = await sound.toggle();
      soundToggle.setAttribute("aria-pressed", String(enabled));
      soundToggle.setAttribute("aria-label", enabled ? "Disable sound" : "Enable sound");
      soundToggle.querySelector(".sound-label").textContent = enabled ? "SOUND ON" : "SOUND OFF";
      notify("AUDIO", enabled ? "Sound enabled" : "Sound disabled");
    });

    const motionToggle = document.querySelector("#motion-toggle");
    motionToggle.setAttribute("aria-pressed", String(reducedMotion));
    motionToggle.setAttribute("aria-label", reducedMotion ? "Enable full motion" : "Reduce motion");
    motionToggle.querySelector(".motion-label").textContent = reducedMotion ? "MOTION OFF" : "MOTION ON";
    motionToggle.addEventListener("click", () => {
      const next = !document.body.classList.contains("reduce-motion");
      document.body.classList.toggle("reduce-motion", next);
      sceneApp.cameraRig.setReducedMotion(next);
      motionToggle.setAttribute("aria-pressed", String(next));
      motionToggle.setAttribute("aria-label", next ? "Enable full motion" : "Reduce motion");
      motionToggle.querySelector(".motion-label").textContent = next ? "MOTION OFF" : "MOTION ON";
      notify("≈", next ? "Reduced motion enabled" : "Full motion enabled");
    });

    const [
      { createMissionPanel },
      { createQualitySelector },
      { createPerformanceMonitor },
      { createSpiderSense },
      { createKeyboardControls },
    ] = await Promise.all([
      import("./ui/missionPanel.js"),
      import("./ui/qualitySelector.js"),
      import("./utils/performance.js"),
      import("./interactions/spiderSense.js"),
      import("./interactions/keyboardControls.js"),
    ]);

    const missionPanel = createMissionPanel({ notify, playSound: (name) => sound.play(name) });
    const spiderSense = createSpiderSense({ sceneApp, playSound: (name) => sound.play(name) });
    const performanceMonitor = createPerformanceMonitor({ sceneApp, webShooter, spiderSense });
    createQualitySelector({ sceneApp, notify });
    createKeyboardControls({
      webShooter,
      spiderSense,
      cameraRig: sceneApp.cameraRig,
      missionPanel,
      notify,
      onEscape: () => performanceMonitor.close(),
    });

    document.querySelector("#enter-button").addEventListener("click", () => {
      webShooter.shootRandom();
      notify("W", "Web launched — welcome to the city");
    });

    window.__SPIDER_DEV__ = { sceneApp, webShooter, spiderSense, missionPanel };
    loader.complete();

    gsap.from(".hero > *", {
      y: reducedMotion ? 0 : 30,
      opacity: 0,
      duration: reducedMotion ? 0.01 : 0.9,
      stagger: reducedMotion ? 0 : 0.08,
      ease: "power3.out",
      delay: reducedMotion ? 0 : 0.2,
    });
  } catch (error) {
    console.error("Spider-Verse scene failed to initialize:", error);
    document.querySelector("#loader-progress").textContent = "Scene initialization failed. Please refresh.";
  }
}

bootstrap();
