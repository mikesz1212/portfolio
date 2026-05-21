const WindowManager = (() => {
  const container = () => document.getElementById("windows");
  let zIndex = 100;
  const openWindows = new Map();

  function assetExists(path) {
    return path && path.length > 0;
  }

  function renderPlaceholder(text) {
    return `<div class="mac-window__placeholder">${text}</div>`;
  }

  function renderFolderBody(project) {
    return `<p class="case-study__loading">Loading project…</p>`;
  }

  function renderPdfBody(project) {
    const pdfPath = project.pdf;
    let viewer = renderPlaceholder("PDF coming soon — add deck.pdf to assets/projects/loreal/");

    if (project.contentStatus === "ready" && assetExists(pdfPath)) {
      viewer = `
        <iframe class="mac-window__pdf" src="${pdfPath}" title="${project.label}"></iframe>
        <a class="mac-window__pdf-link" href="${pdfPath}" target="_blank" rel="noopener">Open PDF in new tab</a>
      `;
    }

    return `
      <h3>${project.label}</h3>
      <p>${project.description || ""}</p>
      ${viewer}
    `;
  }

  function renderAudioBody(project) {
    let player = renderPlaceholder("Audio coming soon — add track.mp3 to assets/projects/pezet/");

    if (project.contentStatus === "ready" && assetExists(project.audio)) {
      player = `<audio class="mac-window__audio" controls src="${project.audio}">Your browser does not support audio.</audio>`;
    }

    return `
      <h3>${project.label}</h3>
      <p>${project.description || ""}</p>
      ${player}
    `;
  }

  function renderImageBody(project) {
    if (CaseStudyLayout.usesCaseStudy(project)) {
      return `<p class="case-study__loading">Loading project…</p>`;
    }

    let img = renderPlaceholder("Image coming soon");

    if (project.contentStatus === "ready" && assetExists(project.hero)) {
      img = `<img class="mac-window__hero" src="${project.hero}" alt="${project.label}" loading="lazy">`;
    } else if (assetExists(project.hero)) {
      img = `<img class="mac-window__hero" src="${project.hero}" alt="${project.label}" loading="lazy" onerror="this.outerHTML='<div class=\\'mac-window__placeholder\\'>Image coming soon</div>'">`;
    }

    return `
      <h3>${project.label}</h3>
      <p>${project.description || ""}</p>
      ${img}
    `;
  }

  function renderBody(project) {
    switch (project.type) {
      case "folder":
        return renderFolderBody(project);
      case "pdf":
        return renderPdfBody(project);
      case "audio":
        return renderAudioBody(project);
      case "image":
        return renderImageBody(project);
      default:
        return `<p>${project.description || "No content yet."}</p>`;
    }
  }

  function isCaseStudyBody(project) {
    return (
      project.type === "folder" ||
      (project.type === "image" && CaseStudyLayout.usesCaseStudy(project))
    );
  }

  function focusWindow(el) {
    zIndex += 1;
    el.style.zIndex = String(zIndex);
    openWindows.forEach((node) => node.classList.remove("is-focused"));
    el.classList.add("is-focused");
  }

  function setupDrag(el, titlebar) {
    let startX = 0;
    let startY = 0;
    let originLeft = 0;
    let originTop = 0;

    function onPointerDown(e) {
      if (e.target.closest(".traffic--close")) return;
      focusWindow(el);
      startX = e.clientX;
      startY = e.clientY;
      originLeft = el.offsetLeft;
      originTop = el.offsetTop;
      titlebar.setPointerCapture(e.pointerId);
      titlebar.addEventListener("pointermove", onPointerMove);
      titlebar.addEventListener("pointerup", onPointerUp);
      titlebar.addEventListener("pointercancel", onPointerUp);
    }

    function onPointerMove(e) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      el.style.left = `${originLeft + dx}px`;
      el.style.top = `${originTop + dy}px`;
    }

    function onPointerUp(e) {
      titlebar.releasePointerCapture(e.pointerId);
      titlebar.removeEventListener("pointermove", onPointerMove);
      titlebar.removeEventListener("pointerup", onPointerUp);
      titlebar.removeEventListener("pointercancel", onPointerUp);
    }

    titlebar.addEventListener("pointerdown", onPointerDown);
  }

  function closeWindow(el) {
    const id = el.dataset.projectId;
    el.classList.remove("is-open");
    el.classList.add("is-closing");

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const delay = reducedMotion ? 0 : 200;

    setTimeout(() => {
      el.remove();
      openWindows.delete(id);
    }, delay);
  }

  function open(project) {
    if (openWindows.has(project.id)) {
      const existing = openWindows.get(project.id);
      focusWindow(existing);
      return;
    }

    const win = document.createElement("div");
    win.className = "mac-window";
    win.dataset.projectId = project.id;
    win.setAttribute("role", "dialog");
    win.setAttribute("aria-label", project.label);

    const bodyClass = isCaseStudyBody(project)
      ? "mac-window__body mac-window__body--case-study"
      : "mac-window__body";

    win.innerHTML = `
      <div class="mac-window__chrome">
        <div class="mac-window__toolbar">
          <div class="mac-window__traffic">
            <button type="button" class="traffic traffic--close" aria-label="Close window"></button>
            <span class="traffic traffic--min" aria-hidden="true"></span>
            <span class="traffic traffic--zoom" aria-hidden="true"></span>
          </div>
          <span class="mac-window__title">${project.label}</span>
        </div>
        <div class="${bodyClass}">
          ${renderBody(project)}
        </div>
      </div>
    `;

    container().appendChild(win);
    openWindows.set(project.id, win);

    const titlebar = win.querySelector(".mac-window__toolbar");
    const closeBtn = win.querySelector(".traffic--close");
    const bodyEl = win.querySelector(".mac-window__body");

    setupDrag(win, titlebar);
    closeBtn.addEventListener("click", () => closeWindow(win));
    win.addEventListener("mousedown", () => focusWindow(win));

    if (isCaseStudyBody(project)) {
      CaseStudyLayout.renderAsync(project).then((html) => {
        if (openWindows.has(project.id) && bodyEl) {
          bodyEl.innerHTML = html;
        }
      });
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        win.classList.add("is-open");
        focusWindow(win);
      });
    });
  }

  function closeTopmost() {
    let top = null;
    let topZ = -1;
    openWindows.forEach((el) => {
      const z = parseInt(el.style.zIndex || "0", 10);
      if (z >= topZ) {
        topZ = z;
        top = el;
      }
    });
    if (top) closeWindow(top);
  }

  return { open, closeTopmost };
})();
