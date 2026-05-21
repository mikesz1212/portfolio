/**
 * Loads description text from .txt or .docx files in project folders.
 */
const ContentLoader = (() => {
  function splitParagraphs(text) {
    const byDouble = text
      .split(/\n\s*\n+/)
      .map((s) => s.replace(/\s+/g, " ").trim())
      .filter(Boolean);

    if (byDouble.length > 1) return byDouble;

    return text
      .split("\n")
      .map((s) => s.replace(/\s+/g, " ").trim())
      .filter((line) => {
        if (!line) return false;
        if (/^Client\s/i.test(line)) return false;
        if (line.length < 50 && !line.includes(".")) return false;
        return true;
      });
  }

  function assetUrl(path) {
    return path
      .split("/")
      .map((part, i) => (i === 0 || !part ? part : encodeURIComponent(part)))
      .join("/");
  }

  async function loadTxt(path) {
    const res = await fetch(assetUrl(path));
    if (!res.ok) throw new Error(`Failed to load ${path}`);
    const text = await res.text();
    return splitParagraphs(text);
  }

  async function loadDocx(path) {
    if (typeof mammoth === "undefined") {
      throw new Error("Mammoth not loaded");
    }
    const res = await fetch(assetUrl(path));
    if (!res.ok) throw new Error(`Failed to load ${path}`);
    const buffer = await res.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return splitParagraphs(result.value);
  }

  async function loadTextFile(path) {
    const lower = path.toLowerCase();
    if (lower.endsWith(".docx")) return loadDocx(path);
    if (lower.endsWith(".txt")) return loadTxt(path);
    throw new Error(`Unsupported text file: ${path}`);
  }

  function normalizeManualBody(project) {
    if (Array.isArray(project.body)) return project.body.filter(Boolean);
    if (project.description) {
      return project.description.split(/\n\n+/).map((s) => s.trim()).filter(Boolean);
    }
    return [];
  }

  async function loadBody(project) {
    const manual = normalizeManualBody(project);

    if (project.textFile) {
      try {
        const fromFile = await loadTextFile(project.textFile);
        if (fromFile.length > 0) return fromFile;
      } catch (err) {
        console.warn("Could not load text file:", project.textFile, err);
      }
    }

    if (typeof PROJECT_TEXT !== "undefined" && PROJECT_TEXT[project.id]?.length) {
      return PROJECT_TEXT[project.id];
    }

    return manual;
  }

  return { loadBody, assetUrl };
})();
