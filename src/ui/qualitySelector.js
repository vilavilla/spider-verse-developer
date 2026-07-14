import { QUALITY_PRESETS } from "../utils/responsive.js";

export function createQualitySelector({ sceneApp, notify }) {
  const select = document.querySelector("#quality-select");
  select.value = sceneApp.getQuality();

  async function handleChange() {
    select.disabled = true;
    try {
      await sceneApp.setQuality(select.value);
      notify("GPU", `${QUALITY_PRESETS[select.value].label} mode selected`);
    } catch (error) {
      console.error("Unable to change quality:", error);
      notify("ERR", "Graphics mode could not be changed");
      select.value = sceneApp.getQuality();
    } finally {
      select.disabled = false;
    }
  }

  select.addEventListener("change", handleChange);
  return () => select.removeEventListener("change", handleChange);
}
