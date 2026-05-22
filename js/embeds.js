/** YouTube, TikTok, Instagram, Google Drive embeds */
const MediaEmbed = (() => {
  const REFERRER_POLICY = "strict-origin-when-cross-origin";

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function embedOrigin() {
    if (typeof window !== "undefined" && window.location?.origin) {
      return window.location.origin;
    }
    return "https://mikesz1212.github.io";
  }

  function googleDriveFileId(url) {
    const m = String(url || "").match(/\/file\/d\/([^/]+)/);
    return m ? m[1] : "";
  }

  function googleDrivePreview(url) {
    const id = googleDriveFileId(url);
    if (!id) return "";
    return `https://drive.google.com/file/d/${id}/preview`;
  }

  function googleDriveStreamUrl(id) {
    if (!id) return "";
    return `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`;
  }

  function googleDriveThumbnailUrl(id) {
    if (!id) return "";
    return `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w1280`;
  }

  function googleDriveViewUrl(url) {
    const id = googleDriveFileId(url);
    if (!id) return url || "";
    return `https://drive.google.com/file/d/${id}/view`;
  }

  function renderDriveIframe(url, label, vertical, scaled) {
    const src = googleDrivePreview(url);
    if (!src) return "";
    const safeLabel = escapeHtml(label || "Video");
    const verticalClass = vertical ? " case-study__video-embed--vertical" : "";
    const scaledClass = scaled ? " case-study__drive-iframe-wrap--scaled" : "";
    return `<div class="case-study__drive-iframe-wrap${scaledClass}">
      <iframe ${iframeAttrs(safeLabel, `case-study__video-embed--drive${verticalClass}`)} src="${escapeHtml(src)}"></iframe>
    </div>`;
  }

  function renderDriveOpenLink(url) {
    const viewUrl = escapeHtml(googleDriveViewUrl(url));
    return `<a class="case-study__drive-open" href="${viewUrl}" target="_blank" rel="noopener noreferrer">Open in Google Drive</a>`;
  }

  function renderDriveVideo(url, label, vertical) {
    const id = googleDriveFileId(url);
    const stream = googleDriveStreamUrl(id);
    if (!stream) return renderDriveIframe(url, label, vertical, false);
    const safeLabel = escapeHtml(label || "Video");
    const viewUrl = escapeHtml(googleDriveViewUrl(url));
    const poster = googleDriveThumbnailUrl(id);
    const posterAttr = poster ? ` poster="${escapeHtml(poster)}"` : "";
    const verticalClass = vertical ? " case-study__video--vertical" : "";
    const driveUrl = escapeHtml(String(url || ""));
    return `<div class="case-study__drive-player" data-drive-url="${driveUrl}" data-drive-label="${safeLabel}" data-drive-vertical="${vertical ? "1" : "0"}">
      <video class="case-study__video case-study__video--drive${verticalClass}" controls playsinline preload="metadata"${posterAttr} title="${safeLabel}">
        <source src="${escapeHtml(stream)}" type="video/mp4">
      </video>
      ${renderDriveOpenLink(url)}
    </div>`;
  }

  function useScaledDriveIframe() {
    return window.matchMedia("(max-width: 767px)").matches;
  }

  function fallbackDrivePlayer(wrap) {
    const url = wrap.dataset.driveUrl;
    if (!url || wrap.dataset.driveFallback === "1") return;
    wrap.dataset.driveFallback = "1";
    const label = wrap.dataset.driveLabel || "Video";
    const vertical = wrap.dataset.driveVertical === "1";
    const scaled = useScaledDriveIframe();
    wrap.classList.add("case-study__drive-player--fallback");
    wrap.innerHTML = `${renderDriveIframe(url, label, vertical, scaled)}${renderDriveOpenLink(url)}`;
  }

  function wireDriveVideos(root) {
    if (!root) return;
    root.querySelectorAll(".case-study__drive-player video").forEach((video) => {
      if (video.dataset.driveWired === "1") return;
      video.dataset.driveWired = "1";
      video.addEventListener("error", () => fallbackDrivePlayer(video.closest(".case-study__drive-player")));
    });
  }

  function youtubeEmbed(url) {
    let id = "";
    try {
      const u = new URL(url.trim());
      if (u.hostname.includes("youtu.be")) {
        id = u.pathname.slice(1).split("/")[0].split("?")[0];
      } else {
        id = u.searchParams.get("v") || "";
      }
    } catch {
      return "";
    }
    if (!id) return "";
    const origin = encodeURIComponent(embedOrigin());
    return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&origin=${origin}`;
  }

  function tiktokEmbed(url) {
    const m = url.match(/video\/(\d+)/);
    if (!m) return "";
    return `https://www.tiktok.com/embed/v2/${m[1]}`;
  }

  function instagramEmbed(url) {
    const reel = url.match(/reels\/([^/?]+)/) || url.match(/reel\/([^/?]+)/);
    if (reel) return `https://www.instagram.com/reel/${reel[1]}/embed`;
    const post = url.match(/instagram\.com\/p\/([^/?]+)/);
    if (post) return `https://www.instagram.com/p/${post[1]}/embed`;
    return "";
  }

  function assetUrl(path) {
    if (typeof ContentLoader !== "undefined" && ContentLoader.assetUrl) {
      return ContentLoader.assetUrl(path);
    }
    return path
      .split("/")
      .map((part, i) => (i === 0 || !part ? part : encodeURIComponent(part)))
      .join("/");
  }

  function isLocalVideoPath(url) {
    const u = String(url || "").trim();
    return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(u) && !/^https?:\/\//i.test(u);
  }

  function detect(url) {
    if (!url) return null;
    const u = url.trim();
    if (isLocalVideoPath(u)) return "file";
    if (u.includes("drive.google.com")) return "drive";
    if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
    if (u.includes("tiktok.com")) return "tiktok";
    if (u.includes("instagram.com")) return "instagram";
    return null;
  }

  function iframeAttrs(title, extraClass) {
    return `class="case-study__video-embed${extraClass ? ` ${extraClass}` : ""}" title="${title}" referrerpolicy="${REFERRER_POLICY}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"`;
  }

  function render(url, label, options = {}) {
    const type = detect(url);
    const safeLabel = escapeHtml(label || "Media");
    const vertical = options.vertical ? " case-study__video-embed--vertical" : "";

    if (type === "drive") {
      return renderDriveVideo(url, label, options.vertical);
    }

    if (type === "file") {
      const src = assetUrl(url.trim());
      return `<video class="case-study__video" controls playsinline preload="metadata" title="${safeLabel}" src="${escapeHtml(src)}"></video>`;
    }

    if (type === "youtube") {
      const src = youtubeEmbed(url);
      if (!src) return "";
      return `<iframe ${iframeAttrs(safeLabel, vertical)} src="${src}"></iframe>`;
    }

    if (type === "tiktok") {
      const src = tiktokEmbed(url);
      if (!src) return "";
      const liptonClass = options.lipton ? " case-study__video-embed--lipton-native" : "";
      const sizeAttrs = options.lipton ? ' width="270" height="480"' : "";
      return `<iframe ${iframeAttrs(safeLabel, `case-study__video-embed--social${vertical}${liptonClass}`)} src="${src}"${sizeAttrs}></iframe>`;
    }

    if (type === "instagram") {
      const src = instagramEmbed(url);
      if (!src) return "";
      const liptonClass = options.lipton ? " case-study__video-embed--lipton-native" : "";
      const sizeAttrs = options.lipton ? ' width="270" height="480"' : "";
      return `<iframe ${iframeAttrs(safeLabel, `case-study__video-embed--social${vertical}${liptonClass}`)} src="${src}"${sizeAttrs}></iframe>`;
    }

    return "";
  }

  function renderBlock(url, label, options = {}) {
    const inner = render(url, label, options);
    if (!inner) return "";
    const rowClass = options.vertical
      ? "case-study__row case-study__row--embed case-study__row--embed-vertical"
      : "case-study__row case-study__row--embed";
    return `<section class="${rowClass}">${inner}</section>`;
  }

  return {
    detect,
    render,
    renderBlock,
    wireDriveVideos,
    youtubeEmbed,
    googleDrivePreview,
    googleDriveFileId,
    googleDriveStreamUrl,
  };
})();
