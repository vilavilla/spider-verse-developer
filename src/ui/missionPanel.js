import { gsap } from "gsap";

export function createMissionPanel({ notify, playSound }) {
  const panel = document.querySelector("#mission");
  const backdrop = document.querySelector("#mission-backdrop");
  const openButtons = [...document.querySelectorAll("[data-open-mission]")];
  const closeButtons = [...document.querySelectorAll("[data-close-mission]")];
  const placeholderButtons = [...document.querySelectorAll("[data-placeholder-link]")];
  const githubButton = panel.querySelector("[data-github-link]");
  let lastFocused;
  let openState = false;

  function open() {
    if (openState) return;
    openState = true;
    lastFocused = document.activeElement;
    backdrop.hidden = false;
    panel.style.visibility = "visible";
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    playSound?.("panel");
    gsap.fromTo(panel, { yPercent: 105 }, { yPercent: 0, duration: document.body.classList.contains("reduce-motion") ? .01 : .72, ease: "power4.out", onComplete: () => closeButtons[0]?.focus() });
    gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: .35 });
  }

  function close() {
    if (!openState) return;
    openState = false;
    const duration = document.body.classList.contains("reduce-motion") ? .01 : .46;
    gsap.to(panel, {
      yPercent: 105,
      duration,
      ease: "power3.in",
      onComplete: () => {
        panel.classList.remove("is-open");
        panel.setAttribute("aria-hidden", "true");
        panel.style.visibility = "hidden";
        backdrop.hidden = true;
        lastFocused?.focus?.();
      },
    });
    gsap.to(backdrop, { opacity: 0, duration });
  }

  openButtons.forEach((button) => button.addEventListener("click", open));
  closeButtons.forEach((button) => button.addEventListener("click", close));
  backdrop.addEventListener("click", close);
  placeholderButtons.forEach((button) => button.addEventListener("click", () => {
    notify("EDIT", `Replace the ${button.dataset.placeholderLink} placeholder before publishing`);
  }));
  githubButton?.addEventListener("click", () => {
    if (window.location.hostname.endsWith("github.io")) {
      const owner = window.location.hostname.split(".")[0];
      const repository = window.location.pathname.split("/").filter(Boolean)[0];
      const repositoryUrl = repository
        ? `https://github.com/${owner}/${repository}`
        : `https://github.com/${owner}`;
      window.open(repositoryUrl, "_blank", "noopener,noreferrer");
      return;
    }
    notify("GIT", "The repository link activates automatically on GitHub Pages");
  });

  panel.addEventListener("keydown", (event) => {
    if (event.key !== "Tab" || !openState) return;
    const focusable = [...panel.querySelectorAll("button:not([disabled]), a[href], select")];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  return { open, close, isOpen: () => openState };
}
