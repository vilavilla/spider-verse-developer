export function createLoader(manager) {
  const root = document.querySelector("#loader");
  const bar = document.querySelector("#loader-bar");
  const progress = document.querySelector("#loader-progress");

  const update = (value) => {
    const safeValue = Math.max(0, Math.min(100, Math.round(value)));
    bar.style.width = `${safeValue}%`;
    progress.value = `${safeValue}%`;
    progress.textContent = `${safeValue}%`;
  };

  manager.onStart = (_url, loaded, total) => update((loaded / total) * 100);
  manager.onProgress = (_url, loaded, total) => update((loaded / total) * 100);
  manager.onError = (url) => {
    progress.textContent = `Unable to prepare ${url}`;
  };

  return {
    complete() {
      update(100);
      requestAnimationFrame(() => root.classList.add("is-hidden"));
    },
  };
}
