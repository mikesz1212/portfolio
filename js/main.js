(function () {
  const iconsContainer = document.getElementById("desktop-icons");

  const ICON_PATHS = {
    folder: "assets/icons/folder.svg",
    pdf: "assets/icons/pdf.png",
    audio: "assets/icons/audio.svg",
    notes: "assets/icons/notes.png",
    trash: "assets/icons/trash.png",
  };

  const ALL_DESKTOP_ITEMS = [
    ...PROJECTS,
    ...(typeof DESKTOP_EXTRAS !== "undefined" ? DESKTOP_EXTRAS : []),
  ];

  /**
   * Fixed irregular slots — pre-checked to avoid portfolio text + contact card.
   * One slot per icon; order filled alphabetically (anchors first).
   */
  const LAYOUT = {
    desktop: {
      portfolio: { leftMin: 30, leftMax: 70, topMin: 17, topMax: 53 },
      contact: { leftMin: 52, topMin: 38 },
      slots: [
        { left: 11, top: 10 },
        { left: 11, top: 28 },
        { left: 11, top: 46 },
        { left: 11, top: 64 },
        { left: 24, top: 14 },
        { left: 24, top: 66 },
        { left: 77, top: 10 },
        { left: 77, top: 28 },
        { left: 77, top: 46 },
        { left: 77, top: 64 },
        { left: 11, top: 78 },
      ],
      slotById: {
        "iga-lancome": 0,
        "hbo-alice": 1,
        "kizo": 2,
        "lavazza-wosp": 6,
        "lipton-snowfest": 7,
        "mcdonalds": 8,
        "notes": 4,
        pezet: 5,
        tenders: 3,
        trash: 9,
        cv: 10,
      },
    },
    mobile: {
      portfolio: { leftMin: 24, leftMax: 76, topMin: 15, topMax: 44 },
      /* ~19% vertical step within each column */
      slots: [
        { left: 14, top: 5 },
        { left: 14, top: 24 },
        { left: 14, top: 43 },
        { left: 14, top: 62 },
        { left: 14, top: 78 },
        { left: 82, top: 5 },
        { left: 82, top: 24 },
        { left: 82, top: 43 },
        { left: 82, top: 62 },
        { left: 82, top: 76 },
        { left: 48, top: 5 },
      ],
      slotById: {
        "iga-lancome": 0,
        "hbo-alice": 1,
        "kizo": 2,
        tenders: 3,
        trash: 4,
        pezet: 5,
        "lipton-snowfest": 6,
        "mcdonalds": 7,
        "lavazza-wosp": 8,
        cv: 9,
        notes: 10,
      },
    },
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

  function getConfig() {
    return window.innerWidth < 768 ? LAYOUT.mobile : LAYOUT.desktop;
  }

  function formatPos(left, top) {
    return { top: `${top.toFixed(1)}%`, left: `${left.toFixed(1)}%` };
  }

  function computeIconPositions() {
    const cfg = getConfig();
    const slots = cfg.slots;
    const map = {};

    ALL_DESKTOP_ITEMS.forEach((item) => {
      const idx = cfg.slotById[item.id];
      if (idx == null || !slots[idx]) return;
      const s = slots[idx];
      map[item.id] = formatPos(s.left, s.top);
    });

    return map;
  }

  let iconPositions = computeIconPositions();

  function applyIconPositions() {
    ALL_DESKTOP_ITEMS.forEach((item) => {
      const btn = iconsContainer.querySelector(`[data-icon-id="${item.id}"]`);
      if (!btn) return;
      const pos = iconPositions[item.id];
      if (!pos) return;
      btn.style.top = pos.top;
      btn.style.left = pos.left;
    });
  }

  function relayoutDesktopIcons() {
    iconPositions = computeIconPositions();
    applyIconPositions();
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(relayoutDesktopIcons, 250);
  });

  function createDesktopIcon(item) {
    const pos = iconPositions[item.id];
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "desktop-icon";
    btn.dataset.iconId = item.id;
    btn.setAttribute("aria-label", `Open ${item.label}`);
    if (pos) {
      btn.style.top = pos.top;
      btn.style.left = pos.left;
    }

    btn.innerHTML = `
      ${createIconGraphic(item)}
      <span class="desktop-icon__label">${item.label}</span>
    `;

    btn.addEventListener("click", () => WindowManager.open(item));
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
    ALL_DESKTOP_ITEMS.forEach((item) => {
      iconsContainer.appendChild(createDesktopIcon(item));
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
