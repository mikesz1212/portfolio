/**
 * Case-study layouts with embeds, custom project templates, logo tiles
 */
const CaseStudyLayout = (() => {
  function normalizeBody(project) {
    if (Array.isArray(project.body) && project.body.length) {
      return project.body.filter(Boolean);
    }
    return [];
  }

  function getTitle(project) {
    return project.title || project.label || "Project";
  }

  function url(path) {
    return ContentLoader.assetUrl(path);
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function formatParagraph(text) {
    const normalized = String(text).replace(/\u2014/g, "-").replace(/—/g, "-");
    const safe = escapeHtml(normalized);
    return safe.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  }

  function isLogoCell(project, src) {
    return project.logoImages && project.logoImages.includes(src);
  }

  function getEmbedForImage(project, src) {
    if (project.imageEmbeds && project.imageEmbeds[src]) {
      return project.imageEmbeds[src];
    }
    if (project.imageLinks && project.imageLinks[src]) {
      const link = project.imageLinks[src];
      if (MediaEmbed.detect(link)) return link;
    }
    return null;
  }

  function isVerticalEmbed(url) {
    const type = MediaEmbed.detect(url);
    return type === "tiktok" || type === "instagram";
  }

  function renderImageCell(src, alt, project) {
    const embedUrl = getEmbedForImage(project, src);
    if (embedUrl && MediaEmbed.detect(embedUrl)) {
      const vertical = isVerticalEmbed(embedUrl);
      const cellClass = vertical
        ? "case-study__cell case-study__cell--embed-vertical"
        : "case-study__cell case-study__cell--embed";
      return `<div class="${cellClass}">${MediaEmbed.render(embedUrl, alt, { vertical })}</div>`;
    }

    const logoClass = isLogoCell(project, src) ? " case-study__cell--logo" : "";
    const link = project.imageLinks && project.imageLinks[src];
    const img = `<img src="${url(src)}" alt="${escapeHtml(alt)}" loading="lazy" onerror="this.parentElement.classList.add('is-broken')">`;
    const inner = link && !MediaEmbed.detect(link)
      ? `<a href="${escapeHtml(link)}" class="case-study__img-link" target="_blank" rel="noopener">${img}</a>`
      : img;
    return `<div class="case-study__cell${logoClass}">${inner}</div>`;
  }

  function renderTextBlock(project) {
    const title = getTitle(project);
    const paragraphs = normalizeBody(project)
      .map((p) => `<p>${formatParagraph(p)}</p>`)
      .join("");
    const subtitle = project.subtitle
      ? `<p class="case-study__subtitle">${escapeHtml(project.subtitle)}</p>`
      : "";
    const client = project.client
      ? `<p class="case-study__client">Client: <strong>${escapeHtml(project.client)}</strong></p>`
      : "";

    return `
      <div class="case-study__text case-study__text--top">
        <h2 class="case-study__title">${escapeHtml(title)}</h2>
        ${subtitle}
        <div class="case-study__body">${paragraphs}</div>
        ${client}
      </div>
    `;
  }

  function renderHeroImage(heroSrc, project) {
    const alt = getTitle(project);
    const embedUrl = getEmbedForImage(project, heroSrc);
    const fitClass = project.heroFit === true ? " case-study__hero-img--fit" : " case-study__hero-img--column";
    const compactClass = project.compactHero ? " case-study__hero-img--compact" : "";

    if (embedUrl && MediaEmbed.detect(embedUrl)) {
      return `<div class="case-study__hero-img${fitClass}${compactClass}">${MediaEmbed.render(embedUrl, alt)}</div>`;
    }

    const logoClass = isLogoCell(project, heroSrc) ? " case-study__cell--logo" : "";
    const img = `<img src="${url(heroSrc)}" alt="${escapeHtml(alt)}" loading="lazy" onerror="this.parentElement.classList.add('is-broken')">`;
    return `<div class="case-study__hero-img${fitClass}${compactClass}"><div class="case-study__hero-inner${logoClass}">${img}</div></div>`;
  }

  function renderHeroRow(project, heroSrc, alignTop) {
    const alignClass = alignTop ? "case-study__row--hero-top" : "";
    const heroClass = heroSrc
      ? `case-study__row--hero ${alignClass}`
      : `case-study__row--hero case-study__row--hero-text-only ${alignClass}`;

    const heroInner = heroSrc ? renderHeroImage(heroSrc, project) : "";

    return `
      <section class="case-study__row ${heroClass}">
        ${renderTextBlock(project)}
        ${heroInner}
      </section>
    `;
  }

  function renderGalleryRow(sources, cols, project) {
    const cells = sources.map((src) => renderImageCell(src, getTitle(project), project)).join("");
    return `<section class="case-study__row case-study__row--gallery cols-${cols}">${cells}</section>`;
  }

  function renderFooterEmbeds(project) {
    let html = "";
    if (project.videoDrive) {
      html += MediaEmbed.renderBlock(project.videoDrive, getTitle(project));
    }
    if (project.videoYoutube) {
      html += MediaEmbed.renderBlock(project.videoYoutube, getTitle(project));
    }
    if (project.embeds) {
      project.embeds.forEach((u) => {
        html += MediaEmbed.renderBlock(u, getTitle(project));
      });
    }
    return html;
  }

  function renderNativeVideos(project) {
    const videos = (project.videos || []).filter(Boolean);
    return videos
      .map(
        (src) => `
      <section class="case-study__row case-study__row--video">
        <video class="case-study__video" controls playsinline preload="metadata" src="${url(src)}"></video>
      </section>`
      )
      .join("");
  }

  function renderSocialEmbedCell(embedUrl, title) {
    return `<div class="case-study__cell case-study__cell--embed-vertical case-study__cell--lipton-social">${MediaEmbed.render(embedUrl, title, { vertical: true, lipton: true })}</div>`;
  }

  function buildLiptonLayout(project) {
    const title = getTitle(project);
    const row123 = [
      "assets/projects/lipton-snowfest/1.png",
      "assets/projects/lipton-snowfest/2.png",
      "assets/projects/lipton-snowfest/3.png",
    ];
    const hero4 = "assets/projects/lipton-snowfest/4.jpg";
    const gallery = [
      "assets/projects/lipton-snowfest/5.jpg",
      "assets/projects/lipton-snowfest/6.webp",
      "assets/projects/lipton-snowfest/7.webp",
    ];
    const links = project.imageLinks || {};

    return `
      <article class="case-study case-study--lipton">
        ${renderHeroRow({ ...project, heroFit: false }, hero4, true)}
        <section class="case-study__row case-study__row--gallery case-study__row--social cols-3">
          ${row123
            .map((src) => {
              const embedUrl = links[src];
              if (embedUrl) return renderSocialEmbedCell(embedUrl, title);
              return renderImageCell(src, title, project);
            })
            .join("")}
        </section>
        ${renderGalleryRow(gallery, 3, project)}
      </article>
    `;
  }

  function buildStackedLayout(project) {
    const media = project.images || [];
    const hero = media[0];
    const rest = media.slice(1);
    const heroProject = {
      ...project,
      heroFit: project.heroFit === true,
      compactHero: project.compactHero || false,
    };

    let gallery = "";
    let i = 0;
    let pattern = 2;
    while (i < rest.length) {
      const count = Math.min(pattern, rest.length - i);
      gallery += renderGalleryRow(rest.slice(i, i + count), count, project);
      i += count;
      pattern = pattern === 2 ? 3 : 2;
    }

    return `
      <article class="case-study">
        ${hero ? renderHeroRow(heroProject, hero, true) : renderTextBlock(project)}
        ${gallery}
        ${renderNativeVideos(project)}
        ${renderFooterEmbeds(project)}
      </article>
    `;
  }

  function buildDefaultLayout(project) {
    if (project.layout === "lipton") return buildLiptonLayout(project);

    const images = project.images || [];
    if (images.length === 0 && normalizeBody(project).length === 0) {
      return `<div class="mac-window__placeholder">Brak treści w tym projekcie.</div>`;
    }

    return buildStackedLayout(project);
  }

  function render(project) {
    return buildDefaultLayout(project);
  }

  async function renderAsync(project) {
    let body = normalizeBody(project);
    if (!body.length && typeof ContentLoader !== "undefined") {
      const loaded = await ContentLoader.loadBody(project);
      if (loaded.length) body = loaded.map((p) => p.replace(/\u2014/g, "-").replace(/—/g, "-"));
    }
    return buildDefaultLayout({ ...project, body });
  }

  function usesCaseStudy(project) {
    return project.type === "folder";
  }

  return { render, renderAsync, usesCaseStudy };
})();
