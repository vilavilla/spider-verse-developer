export const QUALITY_PRESETS = Object.freeze({
  performance: {
    label: "Performance",
    buildings: 78,
    windowChance: 0.24,
    particles: 180,
    pixelRatio: 1,
    shadows: false,
    webFilaments: 3,
  },
  balanced: {
    label: "Balanced",
    buildings: 128,
    windowChance: 0.38,
    particles: 420,
    pixelRatio: 1.5,
    shadows: true,
    webFilaments: 5,
  },
  cinematic: {
    label: "Cinematic",
    buildings: 190,
    windowChance: 0.52,
    particles: 760,
    pixelRatio: 2,
    shadows: true,
    webFilaments: 7,
  },
});

export function isMobileDevice() {
  return window.matchMedia("(max-width: 760px), (pointer: coarse)").matches;
}

export function detectInitialQuality() {
  const lowMemory = navigator.deviceMemory && navigator.deviceMemory <= 4;
  return isMobileDevice() || lowMemory ? "performance" : "balanced";
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
