export function createKeyboardControls({ webShooter, spiderSense, cameraRig, missionPanel, notify, onEscape }) {
  function handleKey(event) {
    if (event.target.matches("input, textarea, select")) return;
    const key = event.key.toLowerCase();

    if (["arrowleft", "arrowright", " "].includes(key)) event.preventDefault();

    if (key === "w") {
      webShooter.shootRandom();
      notify("W", "Web launched");
    } else if (key === "s") {
      const activated = spiderSense.activate();
      notify("S", activated ? "Spider-Sense activated" : "Spider-Sense deactivated");
    } else if (key === "o") {
      cameraRig.controls.autoRotate = !cameraRig.controls.autoRotate;
      notify("O", `Auto-orbit ${cameraRig.controls.autoRotate ? "enabled" : "disabled"}`);
    } else if (key === "r") {
      cameraRig.reset();
      notify("R", "Camera restored");
    } else if (key === "arrowleft") {
      cameraRig.rotate(-1);
      notify("←", "Camera rotated left");
    } else if (key === "arrowright") {
      cameraRig.rotate(1);
      notify("→", "Camera rotated right");
    } else if (key === " ") {
      cameraRig.jump();
      notify("␣", "Web-jump initiated");
    } else if (key === "escape") {
      missionPanel.close();
      spiderSense.deactivate();
      onEscape?.();
      notify("ESC", "Panels closed");
    }
  }

  window.addEventListener("keydown", handleKey);
  return () => window.removeEventListener("keydown", handleKey);
}
