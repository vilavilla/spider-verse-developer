import { gsap } from "gsap";

export function createSpiderSense({ sceneApp, onStateChange, playSound }) {
  const root = document.querySelector("#experience");
  const flash = document.querySelector("#sense-flash");
  let active = false;
  let timeline;

  function setActive(value) {
    active = value;
    root.classList.toggle("spider-sense", value);
    onStateChange?.(value);
  }

  function deactivate() {
    timeline?.kill();
    gsap.killTweensOf([flash, sceneApp.lights().redLight, sceneApp.camera]);
    gsap.to(flash, { opacity: 0, duration: .3 });
    gsap.to(sceneApp.lights().redLight, { intensity: 0, duration: .35 });
    gsap.to(sceneApp.camera, { fov: 46, duration: .55, ease: "power2.out", onUpdate: () => sceneApp.camera.updateProjectionMatrix() });
    setActive(false);
  }

  function activate() {
    if (active) {
      deactivate();
      return false;
    }
    setActive(true);
    playSound?.("sense");
    const reduced = sceneApp.cameraRig.isReducedMotion();
    timeline = gsap.timeline({ onComplete: deactivate });
    timeline
      .to(flash, { opacity: reduced ? .16 : .72, duration: reduced ? .02 : .09 })
      .to(flash, { opacity: .08, duration: reduced ? .05 : .32 })
      .to(sceneApp.lights().redLight, { intensity: reduced ? 7 : 42, duration: reduced ? .02 : .12 }, 0)
      .to(sceneApp.lights().redLight, { intensity: 3, duration: .45 }, .14)
      .to(sceneApp.camera, { fov: reduced ? 46 : 42.5, duration: reduced ? .02 : .28, ease: "power2.out", onUpdate: () => sceneApp.camera.updateProjectionMatrix() }, 0)
      .to({}, { duration: reduced ? .25 : 1.2 })
      .to(sceneApp.camera, { fov: 46, duration: reduced ? .03 : .72, ease: "power2.inOut", onUpdate: () => sceneApp.camera.updateProjectionMatrix() })
      .to(sceneApp.lights().redLight, { intensity: 0, duration: .5 }, "<");
    return true;
  }

  return { activate, deactivate, isActive: () => active };
}
