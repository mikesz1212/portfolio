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

  function googleDrivePreview(url) {
    const m = url.match(/\/file\/d\/([^/]+)/);
    if (!m) return "";
    return `https://drive.google.com/file/d/${m[1]}/preview`;
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

  function detect(url) {
    if (!url) return null;
    const u = url.trim();
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
      const src = googleDrivePreview(url);
      if (!src) return "";
      return `<iframe ${iframeAttrs(safeLabel, `case-study__video-embed--drive${vertical}`)} src="${src}"></iframe>`;
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

  return { detect, render, renderBlock, youtubeEmbed, googleDrivePreview };
})();
