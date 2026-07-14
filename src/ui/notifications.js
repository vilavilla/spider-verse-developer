export function createNotifications(container = document.querySelector("#toasts")) {
  return function notify(key, message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<strong>${key}</strong><span>${message}</span>`;
    container.append(toast);

    window.setTimeout(() => {
      toast.classList.add("is-leaving");
      toast.addEventListener("animationend", () => toast.remove(), { once: true });
    }, 1800);
  };
}
