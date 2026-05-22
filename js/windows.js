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

  function renderNotesBody() {
    const link =
      "https://www.youtube.com/watch?v=ZJL4UGSbeFg&list=RDZJL4UGSbeFg&start_radio=1";
    return `
      <div class="simple-window">
        <p><a href="${link}" target="_blank" rel="noopener">${link}</a></p>
      </div>
    `;
  }

  function renderTrashBody() {
    return `
      <div class="simple-window">
        <p class="simple-window__quote">Who knows how many „bold” and „out of the box” ideas :((((</p>
      </div>
    `;
  }

  function renderFolderBody(project) {
    return `<p class="case-study__loading">Loading project…</p>`;
  }

  function renderPdfBody(project) {
    const pdfPath = project.pdf;
    let viewer = renderPlaceholder(
      "Dodaj plik PDF do assets/cv.pdf (lub zmień ścieżkę w desktop-extras.js)."
    );

    if (assetExists(pdfPath)) {
      const src = `${ContentLoader.assetUrl(pdfPath)}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;
      viewer = `
        <div class="mac-window__pdf-viewer">
          <embed
            class="mac-window__pdf-embed"
            src="${src}"
            type="application/pdf"
            title="${project.label}"
          />
        </div>
      `;
    }

    if (pdfPath && assetExists(pdfPath)) {
      return viewer;
    }
    return `<div class="simple-window">${viewer}</div>`;
  }

  function renderBody(project) {
    switch (project.type) {
      case "notes":
        return renderNotesBody();
      case "trash":
        return renderTrashBody();
      case "folder":
        return renderFolderBody(project);
      case "pdf":
        return renderPdfBody(project);
      default:
        return `<p>${project.description || "No content yet."}</p>`;
    }
  }

  function isCaseStudyBody(project) {
    return project.type === "folder";
  }

  function needsSimpleBody(project) {
    return project.type === "notes" || project.type === "trash" || project.type === "pdf";
  }

  function getBodyClass(project) {
    if (isCaseStudyBody(project)) return "mac-window__body mac-window__body--case-study";
    if (project.type === "pdf") return "mac-window__body mac-window__body--simple mac-window__body--pdf";
    if (needsSimpleBody(project)) return "mac-window__body mac-window__body--simple";
    return "mac-window__body";
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
      focusWindow(openWindows.get(project.id));
      return;
    }

    const win = document.createElement("div");
    win.className = "mac-window";
    win.dataset.projectId = project.id;
    win.setAttribute("role", "dialog");
    win.setAttribute("aria-label", project.label);

    const bodyClass = getBodyClass(project);

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
          MediaEmbed.wireDriveVideos(bodyEl);
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
