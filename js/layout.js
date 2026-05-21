/**
 * Case-study layout: text + hero image, gallery rows, videos — full-size media.
 */
const CaseStudyLayout = (() => {
  function normalizeBody(project) {
    if (Array.isArray(project.body)) return project.body.filter(Boolean);
    if (project.description) {
      return project.description.split(/\n\n+/).map((s) => s.trim()).filter(Boolean);
    }
    return [];
  }

  function normalizeMedia(project) {
    if (project.media && project.media.length) {
      return project.media.map((item) =>
        typeof item === "string"
          ? { type: item.match(/\.(mp4|webm|mov)$/i) ? "video" : "image", src: item }
          : item
      );
    }

    const items = [];
    (project.images || []).forEach((src) => items.push({ type: "image", src }));
    (project.videos || []).forEach((src) => items.push({ type: "video", src }));
    return items;
  }

  function getTitle(project) {
    return project.title || project.label || "Project";
  }

  function url(path) {
    return ContentLoader.assetUrl(path);
  }

  function renderImage(src, alt) {
    return `<img src="${url(src)}" alt="${escapeHtml(alt)}" loading="lazy" onerror="this.parentElement.classList.add('is-broken')">`;
  }

  function renderVideo(src) {
    return `
      <section class="case-study__row case-study__row--video">
        <video class="case-study__video" controls playsinline preload="metadata" src="${url(src)}">
          <a href="${url(src)}">Download video</a>
        </video>
      </section>
    `;
  }

  function renderGalleryRow(sources, cols, alt) {
    const cells = sources
      .map((src) => `<div class="case-study__cell">${renderImage(src, alt)}</div>`)
      .join("");
    return `<section class="case-study__row case-study__row--gallery cols-${cols}">${cells}</section>`;
  }

  function renderMediaFlow(rest, alt) {
    let html = "";
    const imageBuffer = [];
    let pattern = 2;

    function flushImages() {
      while (imageBuffer.length > 0) {
        const count = Math.min(pattern, imageBuffer.length);
        const row = imageBuffer.splice(0, count);
        html += renderGalleryRow(row, count, alt);
        pattern = pattern === 2 ? 3 : 2;
      }
    }

    for (const item of rest) {
      if (item.type === "video") {
        flushImages();
        pattern = 2;
        html += renderVideo(item.src);
      } else {
        imageBuffer.push(item.src);
      }
    }
    flushImages();
    return html;
  }

  function renderHeroRow(project, heroSrc) {
    const title = getTitle(project);
    const paragraphs = normalizeBody(project)
      .map((p) => `<p>${escapeHtml(p)}</p>`)
      .join("");

    const subtitle = project.subtitle
      ? `<p class="case-study__subtitle">${escapeHtml(project.subtitle)}</p>`
      : "";

    const client = project.client
      ? `<p class="case-study__client">Client <strong>${escapeHtml(project.client)}</strong></p>`
      : "";

    const heroCell = heroSrc
      ? `<div class="case-study__hero-img">${renderImage(heroSrc, title)}</div>`
      : "";

    const heroClass = heroSrc
      ? "case-study__row--hero"
      : "case-study__row--hero case-study__row--hero-text-only";

    return `
      <section class="case-study__row ${heroClass}">
        <div class="case-study__text">
          <h2 class="case-study__title">${escapeHtml(title)}</h2>
          ${subtitle}
          <div class="case-study__body" data-body-slot>${paragraphs}</div>
          ${client}
        </div>
        ${heroCell}
      </section>
    `;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function buildLayout(project) {
    const media = normalizeMedia(project);
    const title = getTitle(project);
    const firstImageIdx = media.findIndex((m) => m.type === "image");
    const heroSrc = firstImageIdx >= 0 ? media[firstImageIdx].src : null;
    const rest =
      firstImageIdx >= 0
        ? [...media.slice(0, firstImageIdx), ...media.slice(firstImageIdx + 1)]
        : media;

    if (media.length === 0 && normalizeBody(project).length === 0) {
      return `<div class="mac-window__placeholder">Add images, videos, or a .docx / .txt description to assets/projects/${project.id}/</div>`;
    }

    return `
      <article class="case-study">
        ${renderHeroRow(project, heroSrc)}
        ${renderMediaFlow(rest, title)}
      </article>
    `;
  }

  function render(project) {
    return buildLayout(project);
  }

  async function renderAsync(project) {
    const loadedBody = await ContentLoader.loadBody(project);
    const merged = { ...project, body: loadedBody };
    return buildLayout(merged);
  }

  function usesCaseStudy(project) {
    return (
      project.type === "folder" ||
      project.contentLayout === "case-study" ||
      (project.images && project.images.length > 0) ||
      (project.videos && project.videos.length > 0) ||
      (project.media && project.media.length > 0)
    );
  }

  return { render, renderAsync, usesCaseStudy };
})();
