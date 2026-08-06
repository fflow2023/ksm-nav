document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const themeButton = document.getElementById("theme-button");
  const projectsContainer = document.getElementById("projects-container");
  const setlistCount = document.getElementById("setlist-count");

  const updateThemeButton = () => {
    const isDark = root.dataset.theme === "dark";
    themeButton.setAttribute("aria-label", isDark ? "Switch to Room Mode" : "Switch to Stage Mode");
    themeButton.querySelector(".theme-button-label").textContent = isDark ? "ROOM" : "STAGE";
  };

  updateThemeButton();

  themeButton.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", root.dataset.theme);
    updateThemeButton();
  });

  const extractAccent = (color, index) => {
    const configuredColor = typeof color === "string" ? color.match(/#[0-9a-fA-F]{6}/)?.[0] : null;
    const fallbacks = ["#ee2437", "#f0b90b", "#2da765", "#2aafd0", "#7657d6"];
    return configuredColor || fallbacks[index % fallbacks.length];
  };

  const createArrow = () => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M5 12h13M14 7l5 5-5 5");
    svg.appendChild(path);
    return svg;
  };

  const renderProjects = () => {
    const projects = typeof ksmConfig !== "undefined" ? ksmConfig.projects : undefined;

    if (!Array.isArray(projects)) {
      setlistCount.textContent = "SETLIST UNAVAILABLE";
      const message = document.createElement("p");
      message.className = "projects-error";
      message.textContent = "Setlist failed to load. Please refresh the page.";
      projectsContainer.appendChild(message);
      return;
    }

    setlistCount.textContent = `${String(projects.length).padStart(2, "0")} TRACKS / ON STAGE`;

    projects.forEach((project, index) => {
      const card = document.createElement("a");
      card.href = project.url;
      card.className = "project-row";
      card.target = "_blank";
      card.rel = "noopener noreferrer";
      card.setAttribute("role", "listitem");
      card.style.setProperty("--project-accent", extractAccent(project.color, index));
      card.style.setProperty("--entry-delay", `${120 + index * 70}ms`);

      const number = document.createElement("span");
      number.className = "project-number";
      number.textContent = `TRACK ${String(index + 1).padStart(2, "0")}`;

      const copy = document.createElement("span");
      copy.className = "project-copy";

      const title = document.createElement("span");
      title.className = "project-title";
      title.textContent = project.title;

      const description = document.createElement("span");
      description.className = "project-description";
      description.textContent = project.description;

      copy.append(title, description);

      const address = document.createElement("span");
      address.className = "project-address";
      try {
        address.textContent = new URL(project.url).hostname.toUpperCase();
      } catch {
        address.textContent = "LIVE STAGE";
      }

      const launch = document.createElement("span");
      launch.className = "project-launch";
      launch.append("OPEN", createArrow());

      card.append(number, copy, address, launch);
      projectsContainer.appendChild(card);
    });
  };

  renderProjects();

  const picoPass = document.getElementById("pico-pass");
  const picoImage = document.getElementById("pico-img");
  const picoDots = [...picoPass.querySelectorAll(".pico-dots i")];
  const picoImages = [
    "assets/ksm_pico1.webp",
    "assets/ksm_pico2.webp",
    "assets/ksm_pico3.webp",
  ];

  picoImages.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
  let currentPicoIndex = 0;
  let pointerId = null;
  let startPointer = { x: 0, y: 0 };
  let startPosition = { x: 0, y: 0 };
  let didDrag = false;

  const cyclePico = () => {
    currentPicoIndex = (currentPicoIndex + 1) % picoImages.length;
    picoImage.src = picoImages[currentPicoIndex];
    picoDots.forEach((dot, index) => dot.classList.toggle("is-active", index === currentPicoIndex));
    picoPass.classList.remove("is-changing");
    requestAnimationFrame(() => picoPass.classList.add("is-changing"));
  };

  const clampPassPosition = (x, y) => {
    const margin = 10;
    const maxX = Math.max(margin, window.innerWidth - picoPass.offsetWidth - margin);
    const maxY = Math.max(margin, window.innerHeight - picoPass.offsetHeight - margin);
    return {
      x: Math.min(Math.max(margin, x), maxX),
      y: Math.min(Math.max(margin, y), maxY),
    };
  };

  picoPass.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const rect = picoPass.getBoundingClientRect();
    pointerId = event.pointerId;
    startPointer = { x: event.clientX, y: event.clientY };
    startPosition = { x: rect.left, y: rect.top };
    didDrag = false;
    picoPass.setPointerCapture(pointerId);
    picoPass.classList.add("is-grabbing");
    picoPass.style.left = `${rect.left}px`;
    picoPass.style.top = `${rect.top}px`;
    picoPass.style.right = "auto";
    picoPass.style.bottom = "auto";
  });

  picoPass.addEventListener("pointermove", (event) => {
    if (event.pointerId !== pointerId) return;
    const dx = event.clientX - startPointer.x;
    const dy = event.clientY - startPointer.y;
    if (Math.hypot(dx, dy) > 4) didDrag = true;
    if (!didDrag) return;
    const next = clampPassPosition(startPosition.x + dx, startPosition.y + dy);
    picoPass.style.left = `${next.x}px`;
    picoPass.style.top = `${next.y}px`;
  });

  const endPicoPointer = (event) => {
    if (event.pointerId !== pointerId) return;
    picoPass.classList.remove("is-grabbing");
    if (picoPass.hasPointerCapture(pointerId)) picoPass.releasePointerCapture(pointerId);
    pointerId = null;
    if (!didDrag) cyclePico();
  };

  picoPass.addEventListener("pointerup", endPicoPointer);
  picoPass.addEventListener("pointercancel", endPicoPointer);

  picoPass.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      cyclePico();
    }
  });

  window.addEventListener("resize", () => {
    if (!picoPass.style.left) return;
    const rect = picoPass.getBoundingClientRect();
    const next = clampPassPosition(rect.left, rect.top);
    picoPass.style.left = `${next.x}px`;
    picoPass.style.top = `${next.y}px`;
  });
});
