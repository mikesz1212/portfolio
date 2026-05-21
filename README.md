# 00s Desktop Portfolio

Standalone HTML portfolio with a Tumblr / early-2000s desktop aesthetic. Open `index.html` in any browser — no server required.

## Contact box

Edit your details in **`js/contact.js`** — email, phone, social links, and a short note. The card appears on the bottom-right of the desktop.

## Quick start

1. Double-click `index.html` (or right-click → Open With → browser).
2. Click any desktop icon to open a Mac OS 9–style project window.
3. Press **Escape** to close the topmost window.

## Replace the wallpaper

Export your Canva background as **`assets/wallpaper.jpg`**. Until then, a neutral placeholder SVG is used automatically.

Recommended size: 1920×1080 or larger, JPG or WebP (rename to `.jpg` if needed).

## Add project content

Edit **`js/projects.js`** for each project.

### Folder projects (scrollable case-study layout)

Drop images in **`images[]` in order**. The layout builds automatically:

1. **First image** — shown beside the text (hero column)
2. **Next 2 images** — one row, two columns
3. **Next 3 images** — one row, three columns
4. Pattern repeats (2, then 3, then 2…) as you add more

| Field | Purpose |
|-------|---------|
| `title` | Bold heading (e.g. `"LIPTON X SNOWFEST"`) |
| `subtitle` | Italic line under the title |
| `body` | Optional fallback paragraphs if no text file |
| `textFile` | Path to `.txt` or `.docx` — copy is loaded into the description automatically |
| `client` | Shown as `Client **Name**` at the bottom of the text block |
| `images` | Ordered image paths — shown **full size** (never cropped) |
| `videos` | Ordered `.mp4` paths — full-width players after the image rows |
| `contentStatus` | Set to `"ready"` when all assets exist |

**Text from Word:** drop a `.docx` in the project folder, then convert once (macOS):

```bash
textutil -convert txt -stdout "assets/projects/my-project/description.docx" > "assets/projects/my-project/description.txt"
```

Point `textFile` at the `.txt`. Copy is also cached in `js/project-text.js` for offline viewing.

**Videos:** add paths to `videos[]` — they appear full-width in order (after the hero image, mixed with gallery rows).

Example:

```js
{
  id: "lipton-snowfest",
  type: "folder",
  title: "LIPTON X SNOWFEST",
  subtitle: "event production & creative",
  client: "Lipton",
  body: [
    "First paragraph of project story.",
    "Second paragraph with more detail.",
  ],
  images: [
    "assets/projects/lipton-snowfest/01.jpg",
    "assets/projects/lipton-snowfest/02.jpg",
    "assets/projects/lipton-snowfest/03.jpg",
    "assets/projects/lipton-snowfest/04.jpg",
    "assets/projects/lipton-snowfest/05.jpg",
    "assets/projects/lipton-snowfest/06.jpg",
  ],
}
```

Windows open **almost full screen**; scroll inside the window to see all rows.

### Other project types

| Field | Purpose |
|-------|---------|
| `contentStatus` | Set to `"ready"` when assets are in place |
| `description` | Fallback text if `body` is not used |
| `hero` | Single image (simple image projects without `images[]`) |
| `pdf` / `audio` | Path to PDF or MP3 |

### Asset folders

| Project | Folder | Expected files |
|---------|--------|----------------|
| Iga Świątek x Lancome | `assets/projects/iga-lancome/` | `01.jpg`, `02.jpg`, … |
| TENDERS | `assets/projects/tenders/` | gallery images |
| McDonald's | `assets/projects/mcdonalds/` | gallery images |
| Lavazza x WOŚP | `assets/projects/lavazza-wosp/` | gallery images |
| L'Oreal.pdf | `assets/projects/loreal/` | `deck.pdf` |
| PEZET X POPKILLERY.mp3 | `assets/projects/pezet/` | `track.mp3` |
| KIZO.webp | `assets/projects/kizo/` | `hero.webp` |
| Lipton x SNOWFEST.jpg | `assets/projects/lipton-snowfest/` | `01.jpg` … `06.jpg` (ordered) |

### Example: mark a folder project as ready

```js
{
  id: "mcdonalds",
  contentStatus: "ready",
  title: "MCDONALD'S",
  subtitle: "summer campaign",
  client: "McDonald's",
  body: [
    "Social and OOH campaign for McDonald's summer menu.",
  ],
  images: [
    "assets/projects/mcdonalds/01.jpg",
    "assets/projects/mcdonalds/02.jpg",
    "assets/projects/mcdonalds/03.jpg",
  ],
}
```

### Example: PDF project

```js
{
  id: "loreal-pdf",
  contentStatus: "ready",
  pdf: "assets/projects/loreal/deck.pdf",
}
```

### Example: audio project

```js
{
  id: "pezet-mp3",
  contentStatus: "ready",
  audio: "assets/projects/pezet/track.mp3",
}
```

## Adjust icon positions

In `js/projects.js`, each project has `position: { top: "8%", left: "12%" }`. Tweak percentages to match your wallpaper layout.

## Add a 9th project

1. Copy a project block in `js/projects.js` and give it a new `id`, `label`, `type`, and `position`.
2. Create `assets/projects/your-project-id/` for media.
3. No other files need changes — icons and windows are generated from `PROJECTS`.

## File structure

```
portfolio/
  index.html
  css/
    desktop.css
    mac-window.css
  js/
    projects.js    ← edit content here
    layout.js      ← auto case-study grid
    windows.js
    main.js
  css/
    case-study.css
  assets/
    wallpaper.jpg
    icons/
    projects/
```

## Deploy later

Upload the entire `portfolio` folder to Netlify, GitHub Pages, or any static host. All paths are relative.

## Notes

- PDF iframes may be blocked on `file://` in some browsers; use “Open PDF in new tab” or deploy to a host.
- Image thumbnails on the desktop use `onerror` fallbacks until files exist.
