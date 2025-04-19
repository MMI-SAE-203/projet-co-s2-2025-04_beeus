import { useEffect } from "react";

export default function Chargement({
  containerId = "",
  spinnerId = "loading-spinner",
}) {
  useEffect(() => {
    const spinner = document.getElementById(spinnerId);
    const container = document.getElementById(containerId);
    if (!spinner || !container) return;

    const observer = new MutationObserver(() => {
      if (container.querySelector("div")) {
        spinner.style.display = "none";
        container.classList.remove("hidden");
        observer.disconnect();
      }
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
    });

    const timeout = setTimeout(() => {
      spinner.style.display = "none";
      container.classList.remove("hidden");
      observer.disconnect();
    }, 3000);

    return () => clearTimeout(timeout);
  }, [containerId, spinnerId]);

  return null;
}
