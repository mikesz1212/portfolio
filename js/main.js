(function () {
  const iconsContainer = document.getElementById("desktop-icons");

  const ICON_PATHS = {
    folder: "assets/icons/folder.svg",
    pdf: "assets/icons/pdf.svg",
    audio: "assets/icons/audio.svg",
  };

  function createIconGraphic(project) {
    if (project.iconType === "image" && project.thumbnail) {
      const tall = project.thumbnailTall ? " desktop-icon__thumb--tall" : "";
      return `
        <div class="desktop-icon__thumb${tall}">
          <img src="${project.thumbnail}" alt="" onerror="this.parentElement.innerHTML='<span style=color:#888;font-size:10px>No img</span>'">
        </div>
      `;
    }

    const src = ICON_PATHS[project.iconType] || ICON_PATHS.folder;
    return `
      <div class="desktop-icon__graphic">
        <img src="${src}" alt="" width="64" height="64">
      </div>
    `;
  }

  function createDesktopIcon(project) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "desktop-icon";
    btn.setAttribute("aria-label", `Open ${project.label}`);
    btn.style.top = project.position.top;
    btn.style.left = project.position.left;

    btn.innerHTML = `
      ${createIconGraphic(project)}
      <span class="desktop-icon__label">${project.label}</span>
    `;

    btn.addEventListener("click", () => WindowManager.open(project));
    return btn;
  }

  function initContact() {
    const el = document.getElementById("contact-card");
    if (!el || typeof CONTACT === "undefined") return;

    const items = CONTACT.lines
      .map((line) => {
        const value = line.href
          ? `<a class="contact-card__value" href="${line.href}" target="_blank" rel="noopener">${line.value}</a>`
          : `<span class="contact-card__value">${line.value}</span>`;
        return `
          <li class="contact-card__item">
            <span class="contact-card__label">${line.label}</span>
            ${value}
          </li>
        `;
      })
      .join("");

    const note = CONTACT.note
      ? `<p class="contact-card__note">${CONTACT.note}</p>`
      : "";

    el.innerHTML = `
      <h2 class="contact-card__title">${CONTACT.title}</h2>
      <ul class="contact-card__list">${items}</ul>
      ${note}
    `;
  }

  function initDesktop() {
    PROJECTS.forEach((project) => {
      iconsContainer.appendChild(createDesktopIcon(project));
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      WindowManager.closeTopmost();
    }
  });

  function updateClock() {
    const el = document.getElementById("menubar-clock");
    if (!el) return;
    const now = new Date();
    const opts = { weekday: "short", hour: "numeric", minute: "2-digit" };
    el.textContent = now.toLocaleString("en-US", opts);
  }

  updateClock();
  setInterval(updateClock, 30000);

  initContact();
  initDesktop();
})();
