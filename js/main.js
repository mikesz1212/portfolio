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

  /** Same scattered layout on every reload (fixed seed, not a single row). */
  function computeScatteredPositions(projects) {
    let seed = 20260521;
    const rng = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    const sorted = [...projects].sort((a, b) => a.id.localeCompare(b.id));
    const placed = [];
    const minDistance = 12;
    const map = {};

    function inContactZone(left, top) {
      return left > 60 && top > 50;
    }

    for (const project of sorted) {
      let positioned = false;
      for (let attempt = 0; attempt < 120; attempt++) {
        const top = 12 + rng() * 58;
        const left = 6 + rng() * 76;
        if (inContactZone(left, top)) continue;

        const crowded = placed.some(
          (p) => Math.hypot(left - p.left, top - p.top) < minDistance
        );
        if (!crowded) {
          placed.push({ left, top });
          map[project.id] = {
            top: `${top.toFixed(1)}%`,
            left: `${left.toFixed(1)}%`,
          };
          positioned = true;
          break;
        }
      }

      if (!positioned) {
        const i = placed.length;
        map[project.id] = {
          top: `${(15 + i * 11).toFixed(1)}%`,
          left: `${(8 + i * 13).toFixed(1)}%`,
        };
        placed.push({ left: 8 + i * 13, top: 15 + i * 11 });
      }
    }

    return map;
  }

  const iconPositions = computeScatteredPositions(PROJECTS);

  function createDesktopIcon(project) {
    const pos = iconPositions[project.id];
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "desktop-icon";
    btn.setAttribute("aria-label", `Open ${project.label}`);
    btn.style.top = pos.top;
    btn.style.left = pos.left;

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
