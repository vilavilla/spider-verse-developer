import { QUALITY_PRESETS } from "./responsive.js";

export function createPerformanceMonitor({ sceneApp, webShooter, spiderSense }) {
  const panel = document.querySelector("#performance-panel");
  const toggle = document.querySelector("#performance-toggle");
  const fields = {
    fps: document.querySelector("#stat-fps"),
    webs: document.querySelector("#stat-webs"),
    objects: document.querySelector("#stat-objects"),
    sense: document.querySelector("#stat-sense"),
    quality: document.querySelector("#stat-quality"),
  };

  function update() {
    fields.fps.textContent = sceneApp.stats.fps || "—";
    fields.webs.textContent = webShooter.getActiveCount();
    fields.objects.textContent = sceneApp.stats.objectCount.toLocaleString();
    fields.sense.textContent = spiderSense.isActive() ? "ACTIVE" : "STANDBY";
    fields.quality.textContent = QUALITY_PRESETS[sceneApp.getQuality()].label.toUpperCase();
  }

  function togglePanel() {
    const next = !panel.classList.contains("is-open");
    panel.classList.toggle("is-open", next);
    panel.setAttribute("aria-hidden", String(!next));
    toggle.setAttribute("aria-expanded", String(next));
    if (next) update();
  }

  toggle.addEventListener("click", togglePanel);
  const timer = window.setInterval(update, 500);
  update();

  return {
    close() {
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");
    },
    destroy() {
      clearInterval(timer);
      toggle.removeEventListener("click", togglePanel);
    },
  };
}
