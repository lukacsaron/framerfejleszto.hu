# Lighthouse Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move staging from 76 / 94 / 96 / 83 to ≥ 90 across all four Lighthouse categories by working through every finding from `docs/lighthouse/2026-04-29-2219-mobile/summary.md`.

**Architecture:** Sequenced fixes grouped by edit surface — Section A self-hosts fonts (kills #1 perf finding), Sections B–C clean `index.html`/JSX content + a11y, then Audit Checkpoint 1 verifies. Sections D–F upgrade the build/serve pipeline (vite-imagetools, Vite chunks, nginx caching+compression), then Checkpoint 2. Section G surgically tackles the remaining performance gap (lazy-load Motion/Lenis/Unframer, DOM trim, console + reflow profile), then Checkpoint 3.

**Tech Stack:** Vite 8 + React 19 + framer-motion + lenis + unframer; ESM (`"type": "module"`); existing `npm run audit` produces the diffable `summary.md` we use to verify each checkpoint; new devDep: `vite-imagetools@^7`. Nginx config under `nginx.conf` deploys to staging.

---

## File Structure

**Files this plan creates:**

- `public/fonts/archivo-black-400.woff2` — self-hosted font binary
- `public/fonts/big-shoulders-display-700.woff2`
- `public/fonts/big-shoulders-display-800.woff2`
- `public/fonts/big-shoulders-display-900.woff2`
- `public/fonts/titillium-web-300.woff2`
- `public/fonts/titillium-web-400.woff2`
- `public/fonts/titillium-web-600.woff2`
- `public/fonts/titillium-web-700.woff2`
- `public/fonts/titillium-web-900.woff2`
- `public/fonts/indie-flower-400.woff2`
- `src/styles/fonts.css` — `@font-face` rules
- `public/robots.txt` — minimal valid policy
- `src/assets/images/` directory (Vite-bundled images, replaces `public/assets/illustrations/` etc.)
- `docs/lighthouse/<timestamp>-mobile/` checkpoint folders × 3

**Files this plan modifies:**

- `index.html` — remove Google Fonts links, add font preload, meta description, OG tags, favicon link
- `src/main.jsx` — import `fonts.css`
- `src/components/HeroA.jsx` — image refactors, a11y attrs, dimensions
- `src/components/Sections.jsx` — image refactors, a11y attrs, dimensions, heading order audit
- `src/components/Primitives.jsx` — image refactor (`22-ring.avif`, `22-number.png`)
- `src/components/BenefitsRich.jsx` — DOM trim (G3), heading order audit
- `src/components/StickyNav.jsx` — link a11y if applicable
- `src/components/Icons.jsx` — link a11y if applicable
- `src/providers/LenisProvider.jsx` — defer init to idle (G2)
- `src/App.jsx` — `React.lazy` non-hero sections (G2)
- `vite.config.js` — `imagetools()` plugin, `manualChunks`, `sourcemap: 'hidden'`, `liveEdit` dev-only gate
- `nginx.conf` — caching + gzip + headers
- `package.json` — add `vite-imagetools` devDep

---

## Task 1: Audit checkpoint 0 (baseline freeze)

Make the *current* state diffable against future runs.

**Files:**
- Create (via running): `docs/lighthouse/<timestamp>-mobile/{report.html,report.json,summary.md}`

- [ ] **Step 1: Run baseline audit**

Run: `npm run audit`

Expected: completes in 30–90 s, prints scores around `Performance 76 · Accessibility 94 · Best Practices 96 · SEO 83` (variance ±5).

- [ ] **Step 2: Commit baseline run**

```bash
git add docs/lighthouse
git commit -m "chore(audit): baseline before lighthouse fixes"
```

---

## Task 2: Download self-hosted font files

The four families currently loaded from `fonts.googleapis.com`. Use [google-webfonts-helper](https://gwfh.mranftl.com/fonts) (or hand download) to grab woff2-only files.

**Files:**
- Create: `public/fonts/archivo-black-400.woff2`
- Create: `public/fonts/big-shoulders-display-700.woff2`
- Create: `public/fonts/big-shoulders-display-800.woff2`
- Create: `public/fonts/big-shoulders-display-900.woff2`
- Create: `public/fonts/titillium-web-300.woff2`
- Create: `public/fonts/titillium-web-400.woff2`
- Create: `public/fonts/titillium-web-600.woff2`
- Create: `public/fonts/titillium-web-700.woff2`
- Create: `public/fonts/titillium-web-900.woff2`
- Create: `public/fonts/indie-flower-400.woff2`

- [ ] **Step 1: Create the fonts directory**

```bash
mkdir -p public/fonts
```

- [ ] **Step 2: Download via google-webfonts-helper**

For each family, visit https://gwfh.mranftl.com/fonts and:
1. Search the family name
2. Set "Charsets" to **latin + latin-ext** (the site uses Hungarian)
3. Set "Styles" to the weights listed below
4. Set "Best support (.woff2)" only
5. Download the zip, extract, copy the `.woff2` files into `public/fonts/`, renaming to the convention `<family-slug>-<weight>.woff2` (lowercase, hyphenated, e.g. `big-shoulders-display-800.woff2`)

Required files (must be exactly these names):

| Family | Weights | File names |
| --- | --- | --- |
| Archivo Black | 400 | `archivo-black-400.woff2` |
| Big Shoulders Display | 700, 800, 900 | `big-shoulders-display-{700,800,900}.woff2` |
| Titillium Web | 300, 400, 600, 700, 900 | `titillium-web-{300,400,600,700,900}.woff2` |
| Indie Flower | 400 | `indie-flower-400.woff2` |

- [ ] **Step 3: Verify all 10 files present and non-empty**

Run: `ls -lh public/fonts/`

Expected: 10 `.woff2` files, each between 10 KB and 50 KB. Total under ~250 KB.

- [ ] **Step 4: Commit**

```bash
git add public/fonts/
git commit -m "feat(fonts): add self-hosted font binaries (10 woff2 files)"
```

---

## Task 3: Write `src/styles/fonts.css`

`@font-face` rules using the new files, all `font-display: swap`.

**Files:**
- Create: `src/styles/fonts.css`

- [ ] **Step 1: Create the file**

Create `src/styles/fonts.css` with exactly this content:

```css
/* Self-hosted webfonts. font-display: swap to avoid blocking text render. */

@font-face {
  font-family: 'Archivo Black';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/archivo-black-400.woff2') format('woff2');
}

@font-face {
  font-family: 'Big Shoulders Display';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('/fonts/big-shoulders-display-700.woff2') format('woff2');
}
@font-face {
  font-family: 'Big Shoulders Display';
  font-style: normal;
  font-weight: 800;
  font-display: swap;
  src: url('/fonts/big-shoulders-display-800.woff2') format('woff2');
}
@font-face {
  font-family: 'Big Shoulders Display';
  font-style: normal;
  font-weight: 900;
  font-display: swap;
  src: url('/fonts/big-shoulders-display-900.woff2') format('woff2');
}

@font-face {
  font-family: 'Titillium Web';
  font-style: normal;
  font-weight: 300;
  font-display: swap;
  src: url('/fonts/titillium-web-300.woff2') format('woff2');
}
@font-face {
  font-family: 'Titillium Web';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/titillium-web-400.woff2') format('woff2');
}
@font-face {
  font-family: 'Titillium Web';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('/fonts/titillium-web-600.woff2') format('woff2');
}
@font-face {
  font-family: 'Titillium Web';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('/fonts/titillium-web-700.woff2') format('woff2');
}
@font-face {
  font-family: 'Titillium Web';
  font-style: normal;
  font-weight: 900;
  font-display: swap;
  src: url('/fonts/titillium-web-900.woff2') format('woff2');
}

@font-face {
  font-family: 'Indie Flower';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/indie-flower-400.woff2') format('woff2');
}
```

- [ ] **Step 2: Import from `src/main.jsx`**

Modify `src/main.jsx` — add the fonts import as the FIRST CSS import (before `main.css`):

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/fonts.css'
import './styles/main.css'
import './styles/animations.css'
import './styles/benefit-demos.css'
import LenisProvider from './providers/LenisProvider'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LenisProvider>
      <App />
    </LenisProvider>
  </StrictMode>,
)
```

- [ ] **Step 3: Start dev server, verify fonts load**

Run: `npm run dev` (background it or open a separate terminal). Visit `http://localhost:5173`. Open DevTools → Network → filter by "Font" → reload. You should see `.woff2` requests served from `/fonts/...` (not `fonts.gstatic.com`). Heading text should still render in the design fonts.

If a font appears to fall back to a generic family, the file name doesn't match what the CSS references — fix the file name and re-verify.

Stop the dev server when done.

- [ ] **Step 4: Commit**

```bash
git add src/styles/fonts.css src/main.jsx
git commit -m "feat(fonts): add @font-face rules for self-hosted fonts"
```

---

## Task 4: Update `index.html` (fonts removed, meta description, OG tags, favicon, preload)

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace `index.html` with the new version**

Replace the file's entire content with:

```html
<!doctype html>
<html lang="hu">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <title>framerfejleszto.hu | Prémium weboldalak Framer-ben</title>
    <meta name="description" content="Prémium weboldalak Framer-ben napok alatt. 22.design senior csapata, transzparens árazás, beépített SEO és villámgyors betöltés. Élő demó és pitch." />

    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />

    <!-- Preload above-the-fold heading font (verified hero uses Big Shoulders Display 800 via --ff-display-alt) -->
    <link rel="preload" href="/fonts/big-shoulders-display-800.woff2" as="font" type="font/woff2" crossorigin />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://framerfejleszto.hu/" />
    <meta property="og:title" content="framerfejleszto.hu | Prémium weboldalak Framer-ben" />
    <meta property="og:description" content="Framer + senior 22.design csapat. Weboldal napok alatt, nem hetek alatt." />
    <meta property="og:image" content="/favicon.svg" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="framerfejleszto.hu | Prémium weboldalak Framer-ben" />
    <meta name="twitter:description" content="Framer + senior 22.design csapat. Weboldal napok alatt, nem hetek alatt." />
    <meta name="twitter:image" content="/favicon.svg" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

NOTE: `og:image` and `twitter:image` point at `/favicon.svg` as a temporary placeholder. A 1200×630 PNG share image is a future task — not in this plan.

- [ ] **Step 2: Verify the hero heading font assumption**

Quick sanity check: confirm the hero heading uses Big Shoulders Display 800. Open `src/components/HeroA.jsx`, find the main `<h1>` (likely with class `ff-hero-title` or similar). Inspect the corresponding CSS in `src/styles/main.css` — it should use `font-family: var(--ff-display-alt)` (which resolves to Big Shoulders Display) and `font-weight: 800` or in the 700–900 range.

If the hero uses weight 900 instead of 800, update the preload line to point at `big-shoulders-display-900.woff2`. If the hero uses Archivo Black (`var(--ff-display)`) instead, update to `archivo-black-400.woff2`.

If the assumption holds (most likely case), no change needed.

- [ ] **Step 3: Run dev server and verify**

Run: `npm run dev`

Open http://localhost:5173, confirm:
- No requests to `fonts.googleapis.com` or `fonts.gstatic.com` in the Network tab
- Hero heading renders in the right font (no FOUT visible if preload works)
- Page title in browser tab matches

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat(html): self-hosted fonts, meta description, OG tags, favicon link, preload"
```

---

## Task 5: Add `public/robots.txt`

**Files:**
- Create: `public/robots.txt`

- [ ] **Step 1: Create the file**

Create `public/robots.txt` with exactly:

```
User-agent: *
Allow: /

Sitemap: https://framerfejleszto.hu/sitemap.xml
```

- [ ] **Step 2: Verify it's served correctly in dev**

Run: `npm run dev`. Visit http://localhost:5173/robots.txt — should display the file content (not the SPA's index.html). Stop dev server.

- [ ] **Step 3: Commit**

```bash
git add public/robots.txt
git commit -m "feat(seo): add public/robots.txt"
```

---

## Task 6: A11y / SEO mechanical fixes — image dimensions

Add explicit `width` + `height` attributes to every `<img>` in JSX. The values are the *intrinsic* pixel dimensions of the source files (not the rendered CSS size). For all the AVIF flourishes the source is at 2x the rendered size; for illustrations the source files vary. The simplest correct values come from inspecting each file.

**Files:**
- Modify: `src/components/HeroA.jsx`
- Modify: `src/components/Sections.jsx`
- Modify: `src/components/Primitives.jsx`

Strategy: for each `<img>`, look up the source file's intrinsic dimensions with `file public/assets/path/to/image.ext` (or open in Finder Info pane) and pass those as `width` and `height` props. The CSS already handles responsive sizing.

NOTE: This task is interleaved with Task 9's image-pipeline refactor. To avoid double work, **Task 6 only adds dimensions to images that will REMAIN as `<img src="/assets/...">` — i.e., the Framer CDN images and any image that doesn't move into `src/assets/images/`**. Owned images that move to `src/assets/images/` get their dimensions from `vite-imagetools` automatically in Task 9.

For this plan, the images that stay as URL strings (and need manual `width`/`height` here):
- `framerusercontent.com/...` images in `HeroA.jsx`
- Any `public/assets/...` image you decide to leave in place

- [ ] **Step 1: Find all framerusercontent images**

Run: `grep -n "framerusercontent" src/components/*.jsx`

Capture each file:line. There's likely just one in `HeroA.jsx:169`.

- [ ] **Step 2: Find their intrinsic dimensions**

Open each `framerusercontent.com` URL in a browser, right-click → "Open image in new tab", check the rendered dimensions in the URL params or via the browser's image properties. The URL has `width=`/`height=` query params already on `HeroA.jsx:169`:
```
?scale-down-to=512&width=1063&height=685
```
So intrinsic dims are 1063×685.

- [ ] **Step 3: Add `width` and `height` props**

For `HeroA.jsx:169`, change:

```jsx
<img src="https://framerusercontent.com/images/3OnQEmmXWGgyAjtgmLzHmifDzYc.png?scale-down-to=512&width=1063&height=685" />
```

to:

```jsx
<img
  src="https://framerusercontent.com/images/3OnQEmmXWGgyAjtgmLzHmifDzYc.png?scale-down-to=512&width=1063&height=685"
  width={1063}
  height={685}
  alt=""
/>
```

(Add `alt=""` if missing — decorative images get empty alt.)

Repeat for any other framerusercontent images found in Step 1.

- [ ] **Step 4: Run dev server and verify nothing broke visually**

Run: `npm run dev`. Visit http://localhost:5173. Confirm:
- The image still appears in the correct location
- No layout shift on load (DevTools → Performance → Record → reload → look at CLS)
- Page renders normally

Stop dev server.

- [ ] **Step 5: Commit**

```bash
git add src/components/
git commit -m "fix(a11y): add explicit width/height to non-bundled <img> elements"
```

---

## Task 7: A11y mechanical fixes — accessible names for icon-only links/buttons

Find icon-only `<a>` and `<button>` elements and add `aria-label`.

**Files:**
- Modify: `src/components/HeroA.jsx`
- Modify: `src/components/StickyNav.jsx`
- Modify: `src/components/Sections.jsx` (footer social links likely)
- Modify: `src/components/Icons.jsx` (if it exports icon buttons)

- [ ] **Step 1: Find candidates**

Run:
```bash
grep -nE '<(a|button)[^>]*>(\s*<svg|\s*<img|\s*\{<)' src/components/*.jsx
```

Each match is a potential icon-only interactive element. Read each in context — if the surrounding element has visible text content, no fix needed. If it's truly icon-only, it needs `aria-label`.

Common locations to check explicitly:
- `HeroA.jsx`: the editor-toolbar mockup buttons (lines around 220–230 from prior context)
- `Sections.jsx` footer: social links
- `StickyNav.jsx`: any icon-only nav items

- [ ] **Step 2: Add aria-labels**

For each icon-only `<a>` with no visible text:

```jsx
// before
<a href="https://twitter.com/22design"><TwitterIcon /></a>

// after
<a href="https://twitter.com/22design" aria-label="Twitter">
  <TwitterIcon aria-hidden="true" />
</a>
```

For each icon-only `<button>`:

```jsx
// before
<button onClick={...}><MenuIcon /></button>

// after
<button onClick={...} aria-label="Menü megnyitása">
  <MenuIcon aria-hidden="true" />
</button>
```

Use Hungarian for user-facing labels (the site's lang is `hu`). For purely decorative icons (the Framer editor mockup toolbar in `HeroA.jsx` is not interactive — it's a visual mockup), no aria is needed; ensure the parent element has `role="img"` and `aria-label` describing the whole mockup, OR `aria-hidden="true"` if it's purely decorative and the real meaning is conveyed by neighboring text.

- [ ] **Step 3: Run dev server, click around, no regressions**

Run: `npm run dev`. Tab through the page with keyboard, screen reader if available — links and buttons should announce a meaningful name.

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add src/components/
git commit -m "fix(a11y): add aria-label to icon-only links and buttons"
```

---

## Task 8: A11y mechanical fixes — heading hierarchy

The audit flags "Heading elements not in a sequentially-descending order". Find skipped levels and fix.

**Files:**
- Modify: `src/components/HeroA.jsx` (probably contains the only h1)
- Modify: `src/components/Sections.jsx` (most h2s and h3s)
- Modify: `src/components/BenefitsRich.jsx` (h2/h3 mix)

- [ ] **Step 1: Map current heading structure**

Run:
```bash
grep -nE '<h[1-6]' src/components/*.jsx
```

Read the output and write the heading tree top-to-bottom (the order they appear in `App.jsx`). Check for skipped levels (h1 → h3 with no h2; h2 → h4; etc.).

- [ ] **Step 2: Fix the skipped levels**

For each skipped level, change the element to the correct level. Visual size is preserved by the existing CSS class — only the semantic element changes:

```jsx
// before (h2 → h4 skip)
<h4 className="ff-section-title">Section title</h4>

// after
<h3 className="ff-section-title">Section title</h3>
```

If the existing CSS targets the element + class (e.g. `h4.ff-section-title`), update the CSS to target the class only, OR add the new selector alongside.

- [ ] **Step 3: Verify**

Run: `npm run dev`. Page should look identical. Open DevTools → Elements → expand and skim through to confirm headings are now sequential.

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add src/components/ src/styles/
git commit -m "fix(a11y): correct heading hierarchy to be sequentially-descending"
```

---

## Task 9: Audit Checkpoint 1 (after fonts + content + a11y)

Validate Sections A, B, C from the spec.

**Files:**
- Create (via running): `docs/lighthouse/<timestamp>-mobile/`

- [ ] **Step 1: Deploy the changes to staging**

The audit hits staging, not local. Push the changes through your existing deploy flow (whatever that is for this repo — if it's a manual deploy, do that; if it's via a Coolify/CI on push to main, push the branch and wait for the deploy).

If unclear how staging deploys: ask. If staging is auto-deployed from main, this plan should run on a feature branch and the audit checkpoints can use a local `npm run preview` against a `vite build` instead — but that bypasses nginx caching. Best path: deploy to staging.

- [ ] **Step 2: Run the audit**

Run: `npm run audit`

Expected (mobile floors per spec § Section H):
- Performance ≥ 80
- Accessibility ≥ 96
- Best Practices ≥ 96
- SEO ≥ 90

Open the new `docs/lighthouse/<timestamp>-mobile/summary.md` and verify Top opportunities no longer includes "Eliminate render-blocking resources" pointing at fonts, AND Diagnostics no longer includes "Document does not have a meta description" or "robots.txt is not valid".

- [ ] **Step 3: If a floor isn't met, triage**

If Performance < 80 or any other category is below floor:
1. Read the new `summary.md` Top opportunities and Diagnostics
2. Identify the regression or unaddressed finding
3. Pause this plan, fix, re-audit, then continue

If floors are met, proceed.

- [ ] **Step 4: Commit the audit run**

```bash
git add docs/lighthouse
git commit -m "chore(audit): checkpoint 1 — after fonts + content + a11y"
```

---

## Task 10: Install `vite-imagetools`

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the plugin**

Run: `npm install --save-dev vite-imagetools@^7`

Expected: package added to `devDependencies`.

- [ ] **Step 2: Verify import works**

Run: `node -e "import('vite-imagetools').then(m => console.log('ok', typeof m.imagetools))"`

Expected stdout: `ok function`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add vite-imagetools devDep"
```

---

## Task 11: Move owned images into `src/assets/images/`

**Files:**
- Move: `public/assets/illustrations/*` → `src/assets/images/illustrations/*`
- Move: `public/assets/flourishes/*` → `src/assets/images/flourishes/*`
- Move: `public/assets/22-logo.avif` → `src/assets/images/22-logo.avif`
- Move: `public/assets/22-logo.svg` → `src/assets/images/22-logo.svg` (SVGs don't need imagetools but consolidate location)
- Move: `public/assets/22-number.png` → `src/assets/images/22-number.png`
- Move: `public/assets/22-ring.avif` → `src/assets/images/22-ring.avif`

NOTE: Videos in `public/assets/videos/` STAY in `public` — Vite doesn't optimize videos and they're streamed differently. Don't move them.

- [ ] **Step 1: Move the directories with `git mv`**

```bash
mkdir -p src/assets/images
git mv public/assets/illustrations src/assets/images/illustrations
git mv public/assets/flourishes src/assets/images/flourishes
git mv public/assets/22-logo.avif src/assets/images/22-logo.avif
git mv public/assets/22-logo.svg src/assets/images/22-logo.svg
git mv public/assets/22-number.png src/assets/images/22-number.png
git mv public/assets/22-ring.avif src/assets/images/22-ring.avif
```

(`git mv` preserves history; raw `mv` would not.)

- [ ] **Step 2: Verify only `videos/` remains under `public/assets/`**

Run: `ls public/assets/`

Expected: only `videos`. (If anything else exists, check whether it's referenced in JSX and decide case-by-case.)

- [ ] **Step 3: Don't commit yet** — Task 12 updates the consumers; commit together.

---

## Task 12: Configure Vite — `imagetools` plugin + `manualChunks` + sourcemap + dev-only `liveEdit`

**Files:**
- Modify: `vite.config.js`

- [ ] **Step 1: Replace `vite.config.js`**

Replace the file's content with:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { imagetools } from 'vite-imagetools'
import { liveEdit } from './src/plugins/live-edit/index.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    imagetools(),
    ...(mode === 'development' ? [liveEdit()] : []),
  ],
  server: {
    watch: {
      // Include framer/ directory (outside src/) in HMR watching
      ignored: ['!**/framer/**'],
    },
  },
  build: {
    sourcemap: 'hidden',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'motion': ['framer-motion'],
          'lenis': ['lenis'],
          'framer': ['unframer'],
        },
      },
    },
  },
}))
```

- [ ] **Step 2: Verify build succeeds even though JSX still references the old `/assets/...` paths**

Run: `npm run build`

Expected: build completes (the still-old `<img src="/assets/...">` URLs will now 404 in the prod bundle since the files moved, but the BUILD itself doesn't fail — Vite doesn't fail on missing public-folder assets).

If build fails for ANY OTHER reason, debug before continuing.

- [ ] **Step 3: Don't commit yet** — Task 13 fixes the JSX. Commit together with Task 12.

---

## Task 13: Refactor JSX to import images via vite-imagetools

For each `<img src="/assets/...">` reference, replace with an import-based reference. Keep one image — the LCP candidate — eager; everything else `loading="lazy"`.

**Files:**
- Modify: `src/components/HeroA.jsx`
- Modify: `src/components/Sections.jsx`
- Modify: `src/components/Primitives.jsx`

- [ ] **Step 1: Identify the LCP image**

Open the latest `docs/lighthouse/<latest>-mobile/report.json`. Search for `"id":"largest-contentful-paint-element"`. The audit details include the DOM selector for the LCP element. If it's an `<img>`, that's the LCP candidate.

If it's a `<h1>` or text node (likely — the hero title is bold and big), there's no specific LCP image. In that case, just keep the editor mockup (`framerusercontent.com` in `HeroA.jsx`) as `loading="eager" fetchpriority="high"` since it's clearly above the fold, and lazy-load everything else.

- [ ] **Step 2: Refactor flourish images in `HeroA.jsx`**

Each flourish `<img>` (lines ~138–144) currently looks like:

```jsx
<img src="/assets/flourishes/star-yellow.avif" className="ff-flourish" style={{ top: 140, right: '8%', width: 60, transform: 'rotate(12deg)' }} alt="" />
```

Refactor at the top of the file:

```jsx
import starYellow from '../assets/images/flourishes/star-yellow.avif?w=60;120&format=avif&as=srcset'
// ...repeat for each flourish file used in HeroA
```

Then replace each img:

```jsx
<img
  srcSet={starYellow}
  sizes="60px"
  width={60}
  height={60}
  loading="lazy"
  className="ff-flourish"
  style={{ top: 140, right: '8%', width: 60, transform: 'rotate(12deg)' }}
  alt=""
/>
```

NOTE on syntax: `?w=60;120` generates 60w + 120w variants for 1x/2x DPR. `&format=avif` keeps AVIF (the source already is). `&as=srcset` returns a single srcset string.

For images of different rendered sizes, adjust `?w=` to match the real CSS width × {1, 2}.

For `FloatingIcon` usages — if `FloatingIcon` is a component that takes `src` as a prop, you may need to refactor `FloatingIcon` to accept `srcSet` + `width` + `height` as well, OR pass the imported image's `.src` as `src` plus the dimensions. Read `FloatingIcon`'s definition (probably in `Primitives.jsx`) and adapt accordingly. If unclear, pass `src={starYellow.split(' ')[0]}` (first variant URL) as a fallback.

- [ ] **Step 3: Refactor illustration images in `Sections.jsx` and `Primitives.jsx`**

Same pattern. Examples from the codebase:

`Sections.jsx:81`:
```jsx
// before
<img src="/assets/illustrations/caesar-ui-collage.avif" />

// after
import caesarUiCollage from '../assets/images/illustrations/caesar-ui-collage.avif?w=400;800;1200&format=avif&as=picture'
// ...
<picture>
  <source type="image/avif" srcSet={caesarUiCollage.sources.avif} />
  <img
    src={caesarUiCollage.img.src}
    width={caesarUiCollage.img.w}
    height={caesarUiCollage.img.h}
    loading="lazy"
    alt=""
  />
</picture>
```

`Primitives.jsx:67–68`:
```jsx
// before
<img className={`ff-stamp-ring ${spin ? 'spinning' : ''}`} src="/assets/22-ring.avif" alt="" />
<img className="ff-stamp-logo" src="/assets/22-number.png" alt="22" />

// after
import twentyTwoRing from '../assets/images/22-ring.avif?w=200;400&format=avif&as=srcset'
import twentyTwoNumber from '../assets/images/22-number.png?w=120;240&format=avif;webp;png&as=picture'
// ...
<img
  className={`ff-stamp-ring ${spin ? 'spinning' : ''}`}
  srcSet={twentyTwoRing}
  sizes="200px"
  width={200}
  height={200}
  loading="lazy"
  alt=""
/>
<picture>
  <source type="image/avif" srcSet={twentyTwoNumber.sources.avif} />
  <source type="image/webp" srcSet={twentyTwoNumber.sources.webp} />
  <img
    className="ff-stamp-logo"
    src={twentyTwoNumber.img.src}
    width={twentyTwoNumber.img.w}
    height={twentyTwoNumber.img.h}
    loading="lazy"
    alt="22"
  />
</picture>
```

(Adjust the `?w=` widths to fit real rendering sizes — read the CSS for each class to confirm.)

- [ ] **Step 4: Verify dev server**

Run: `npm run dev`. Visit http://localhost:5173. Confirm:
- All images render correctly
- No 404s in Network tab
- Below-fold images don't load until you scroll (DevTools Network tab; lazy ones load late)

If anything breaks: most common issue is a typo in the import path. Check the import path matches `src/assets/images/...`.

Stop dev server.

- [ ] **Step 5: Verify production build**

Run: `npm run build`

Expected: completes without error. Output should show generated AVIF/WebP variants under `dist/assets/`.

- [ ] **Step 6: Commit Tasks 11 + 12 + 13 together**

```bash
git add public/assets src/assets vite.config.js src/components/
git commit -m "feat(images): vite-imagetools pipeline + refactor JSX to bundled imports"
```

---

## Task 14: Tune Framer CDN images

`framerusercontent.com` images can't go through vite-imagetools. Tune their query params and add `srcset` manually.

**Files:**
- Modify: `src/components/HeroA.jsx`

- [ ] **Step 1: Find all framerusercontent images**

Run: `grep -n "framerusercontent" src/components/*.jsx`

(There's at least the editor mockup at `HeroA.jsx:169` — there may be more.)

- [ ] **Step 2: For each one, build a srcset using CDN params**

Framer CDN params:
- `?scale-down-to=N` — caps longest edge at N
- `?width=N&height=M` — dimensions
- Combine: `?scale-down-to=512&width=1063&height=685`

Generate a `srcset` with 2–3 widths. Example for the editor mockup:

```jsx
// before
<img
  src="https://framerusercontent.com/images/3OnQEmmXWGgyAjtgmLzHmifDzYc.png?scale-down-to=512&width=1063&height=685"
  width={1063}
  height={685}
  alt=""
/>

// after — keeps eager since this is likely above-the-fold hero content
<img
  src="https://framerusercontent.com/images/3OnQEmmXWGgyAjtgmLzHmifDzYc.png?scale-down-to=1024"
  srcSet="
    https://framerusercontent.com/images/3OnQEmmXWGgyAjtgmLzHmifDzYc.png?scale-down-to=512 512w,
    https://framerusercontent.com/images/3OnQEmmXWGgyAjtgmLzHmifDzYc.png?scale-down-to=1024 1024w,
    https://framerusercontent.com/images/3OnQEmmXWGgyAjtgmLzHmifDzYc.png?scale-down-to=1600 1600w
  "
  sizes="(max-width: 768px) 100vw, 1024px"
  width={1063}
  height={685}
  loading="eager"
  fetchpriority="high"
  alt=""
/>
```

For Framer CDN images BELOW the fold (if any), use `loading="lazy"` instead.

- [ ] **Step 3: Run dev, verify**

Run: `npm run dev`. Check the image renders, scroll-to-it (if not above-the-fold), Network tab shows the right variant served by CDN.

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add src/components/HeroA.jsx
git commit -m "feat(images): srcset + tuned scale-down for Framer CDN images"
```

---

## Task 15: Update `nginx.conf`

**Files:**
- Modify: `nginx.conf`

- [ ] **Step 1: Replace `nginx.conf`**

Replace the file's content with:

```nginx
server {
  listen 3567;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  # gzip compression
  gzip on;
  gzip_vary on;
  gzip_proxied any;
  gzip_comp_level 6;
  gzip_min_length 256;
  gzip_types
    text/plain text/css text/xml text/javascript
    application/javascript application/json application/xml
    application/rss+xml application/atom+xml
    image/svg+xml font/woff2;

  # Security headers (apply to all responses)
  add_header X-Content-Type-Options nosniff always;
  add_header Referrer-Policy strict-origin-when-cross-origin always;
  add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

  # HTML — short cache, must revalidate so deploys take effect immediately
  location = /index.html {
    add_header Cache-Control "no-cache, must-revalidate" always;
    expires 0;
  }

  # Hashed assets (Vite emits content-hashed filenames in /assets/) — 1 year immutable
  location /assets/ {
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable" always;
    try_files $uri =404;
  }

  # Self-hosted fonts under /fonts/ — 1 year (filename includes weight, fonts rarely change)
  location /fonts/ {
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable" always;
    try_files $uri =404;
  }

  # Other static (favicon, robots.txt, og-image) — 1 day
  location ~* \.(svg|ico|txt|xml|webmanifest)$ {
    expires 1d;
    add_header Cache-Control "public, max-age=86400" always;
    try_files $uri =404;
  }

  # SPA fallback
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

NOTE on brotli: Brotli requires the `ngx_brotli` module to be compiled into nginx, which the default `nginx:alpine` image does NOT include. We're shipping gzip-only and accepting the small additional gain brotli would give. If a follow-up plan wants brotli, swap the base image (`fholzer/nginx-brotli` or build a custom one).

- [ ] **Step 2: Verify nginx config syntax (if Docker is available locally)**

If you have Docker locally and want to verify before deploy:

```bash
docker run --rm -v "$PWD/nginx.conf:/etc/nginx/conf.d/default.conf:ro" nginx:alpine nginx -t
```

Expected: `nginx: configuration file /etc/nginx/nginx.conf test is successful`.

If Docker isn't readily available, skip — the Coolify/staging deploy will catch syntax errors.

- [ ] **Step 3: Commit**

```bash
git add nginx.conf
git commit -m "feat(nginx): caching + gzip + security headers"
```

---

## Task 16: Audit Checkpoint 2 (after images + Vite + nginx)

**Files:**
- Create (via running): `docs/lighthouse/<timestamp>-mobile/`

- [ ] **Step 1: Deploy to staging**

Push the changes through your deploy flow. Wait for staging to update — including the nginx restart that picks up the new config.

- [ ] **Step 2: Verify nginx is serving with the new config**

Use curl to spot-check:

```bash
curl -sI https://framerfejleszto.prototype.loginet.tech/ | grep -i "cache-control\|content-encoding\|x-content-type"
curl -sI "https://framerfejleszto.prototype.loginet.tech/assets/<some-hashed-asset>" | grep -i "cache-control\|content-encoding"
```

Expected on the asset response:
- `Cache-Control: public, max-age=31536000, immutable`
- `Content-Encoding: gzip` (for text assets)

If these headers aren't present, the deploy didn't pick up the new config. Diagnose before re-running the audit.

- [ ] **Step 3: Run the audit**

Run: `npm run audit`

Expected:
- Performance ≥ 88
- Accessibility ≥ 96
- Best Practices ≥ 96
- SEO ≥ 90

Open the new `summary.md`. Verify Top opportunities no longer includes "Use efficient cache lifetimes" or "Properly size images". "Reduce unused JavaScript" should show smaller savings (chunks help long-term, but the first-load gain is modest).

- [ ] **Step 4: If a floor isn't met, triage**

Same as Task 9 Step 3 — read summary.md, fix, re-audit.

- [ ] **Step 5: Commit**

```bash
git add docs/lighthouse
git commit -m "chore(audit): checkpoint 2 — after images + Vite + nginx"
```

---

## Task 17: G1 — Console errors

**Files:**
- Vary, depending on findings

- [ ] **Step 1: Capture console output on staging**

Open https://framerfejleszto.prototype.loginet.tech/ in Chrome. Open DevTools → Console. Reload. Capture all error/warning messages.

- [ ] **Step 2: Triage each**

For each message:

- **Application bug** (e.g. `Cannot read property 'X' of undefined`) — fix the offending JS in `src/`. Standard bug fix.
- **Deprecation warning** (e.g. `findDOMNode is deprecated`) — update the call site if it's our code; document and accept if it's from a dependency.
- **Network 404** (e.g. `Failed to load resource: ...`) — find the missing asset. Common cause: a `.map` file referenced from a `.js`/`.css` after the sourcemap mode change. The `sourcemap: 'hidden'` setting we put in `vite.config.js` should have prevented this — if a 404 on `.map` files appears, the build wasn't regenerated. Re-deploy.
- **Framer-internal warnings** — if the message originates from `framerusercontent.com` or `unframer`/`framer-motion` internals and we cannot suppress without forking, document the message in this task's commit body and accept.

- [ ] **Step 3: Commit fixes**

If any application code changed:

```bash
git add src/
git commit -m "fix(console): clear browser console errors"
```

If only documentation/no fix is possible:

```bash
git commit --allow-empty -m "chore(console): document remaining Framer-internal warnings

Captured Framer warnings cannot be suppressed without forking unframer/framer-motion.
Acceptable per spec § Section G.1."
```

---

## Task 18: G2 — Lazy-load Lenis init

**Files:**
- Modify: `src/providers/LenisProvider.jsx`

- [ ] **Step 1: Defer Lenis initialization to idle**

Replace `src/providers/LenisProvider.jsx` content with:

```jsx
import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

export default function LenisProvider({ children }) {
  const lenisRef = useRef(null)

  useEffect(() => {
    let lenis
    let rafId
    let cancelled = false
    let lastVelocity = 0

    function raf(time) {
      if (!lenis || cancelled) return
      lenis.raf(time)

      const velocity = Math.min(Math.abs(lenis.velocity) / 1000, 3)
      if (Math.abs(velocity - lastVelocity) > 0.01) {
        document.documentElement.style.setProperty('--scroll-velocity', velocity.toFixed(3))
        lastVelocity = velocity
      }

      rafId = requestAnimationFrame(raf)
    }

    function init() {
      if (cancelled) return
      lenis = new Lenis({ lerp: 0.1, duration: 1.2 })
      lenisRef.current = lenis
      rafId = requestAnimationFrame(raf)
    }

    // Defer Lenis init until the browser is idle, so it doesn't compete with hydration / first paint.
    const ric = window.requestIdleCallback || ((cb) => setTimeout(cb, 1))
    const idleId = ric(init, { timeout: 2000 })

    return () => {
      cancelled = true
      if (rafId) cancelAnimationFrame(rafId)
      if (window.cancelIdleCallback && typeof idleId === 'number') {
        window.cancelIdleCallback(idleId)
      }
      if (lenis) {
        lenis.destroy()
        document.documentElement.style.setProperty('--scroll-velocity', '0')
      }
    }
  }, [])

  return children
}
```

- [ ] **Step 2: Run dev server, verify smooth scrolling still works**

Run: `npm run dev`. Visit page, scroll. Lenis-driven smooth scrolling should kick in within ~1–2 seconds of page load (slight visible delay is acceptable — the goal is to free up the main thread during initial render).

Stop dev server.

- [ ] **Step 3: Commit**

```bash
git add src/providers/LenisProvider.jsx
git commit -m "perf: defer Lenis init to requestIdleCallback"
```

---

## Task 19: G2 — Lazy-load below-fold sections

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Replace `src/App.jsx`**

Replace with:

```jsx
import { lazy, Suspense } from 'react';
import HeroA from './components/HeroA';
import StickyNav from './components/StickyNav';
import CustomCursor from './components/animations/CustomCursor';

const ProblemSolution = lazy(() => import('./components/Sections').then((m) => ({ default: m.ProblemSolution })));
const ProcessSection = lazy(() => import('./components/Sections').then((m) => ({ default: m.ProcessSection })));
const VibeCodingSection = lazy(() => import('./components/Sections').then((m) => ({ default: m.VibeCodingSection })));
const TrustSection = lazy(() => import('./components/Sections').then((m) => ({ default: m.TrustSection })));
const Portfolio = lazy(() => import('./components/Sections').then((m) => ({ default: m.Portfolio })));
const FAQSection = lazy(() => import('./components/Sections').then((m) => ({ default: m.FAQSection })));
const FinalCTA = lazy(() => import('./components/Sections').then((m) => ({ default: m.FinalCTA })));
const Footer = lazy(() => import('./components/Sections').then((m) => ({ default: m.Footer })));
const BenefitsRich = lazy(() => import('./components/BenefitsRich'));

export default function App() {
  return (
    <div style={{ background: 'var(--bg-page)' }}>
      <CustomCursor />
      <HeroA />
      <StickyNav />
      <Suspense fallback={null}>
        <ProblemSolution />
        <ProcessSection />
        <BenefitsRich />
        <VibeCodingSection />
        <TrustSection />
        <Portfolio />
        <FAQSection />
        <FinalCTA />
        <Footer />
      </Suspense>
    </div>
  );
}
```

NOTE: `Sections.jsx` exports many named components from the same module, so all `lazy()` calls hit the same chunk on first below-fold reveal. That's fine — Vite splits this naturally.

NOTE on `HeroA`: stays static — it's the above-the-fold critical path and contains the LCP element.

- [ ] **Step 2: Run dev server, verify**

Run: `npm run dev`. Visit page. Initial render should feel snappier (above-fold paints first). Scrolling should not show flickering as below-fold sections load — the `fallback={null}` is invisible. If you see a brief blank stretch, that's the Suspense boundary loading the chunk; should be < 100 ms locally.

Stop dev server.

- [ ] **Step 3: Verify production build**

Run: `npm run build`

Expected: build output shows separate chunks (e.g. `Sections-<hash>.js`, `BenefitsRich-<hash>.js`).

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "perf: lazy-load below-fold sections via React.lazy + Suspense"
```

---

## Task 20: G3 — DOM size investigation in `BenefitsRich.jsx`

The DOM size finding (1370 elements) is largely from the marquee duplication in `BenefitsRich`. This task is investigative — outcome may be a fix, may be a "documented and accepted" if structural change is too risky.

**Files:**
- Modify: `src/components/BenefitsRich.jsx` (potentially)

- [ ] **Step 1: Measure current DOM contribution**

Open https://framerfejleszto.prototype.loginet.tech/ in Chrome. DevTools → Elements → click the body → in the Console, run:

```js
document.body.querySelectorAll('*').length
```

Note the number (should be ~1370).

Then collapse `BenefitsRich`'s root in DevTools and re-run the query (you can also use `document.querySelectorAll('.bd-row, .bdemo *').length` or similar if you can find the right scoping selector). Compare — the delta is `BenefitsRich`'s contribution.

- [ ] **Step 2: Identify the dominant subtree**

Read `BenefitsRich.jsx` (full file). The marquee animations (e.g. `DemoAnimations`, the `bd-row.cards`/`bd-row.stats` rows) likely render duplicated elements for the infinite-loop effect. Count how many `<div>` or `<svg>` elements each demo card renders.

- [ ] **Step 3: Decide and implement**

**If the dominant subtree is a marquee with literal element duplication** (e.g. mapping over the array twice for visual loop):
- Refactor to render the array once and use CSS `transform: translateX(-100%)` on a clone-via-`::after` pseudo-element OR use `IntersectionObserver` to mount only what's visible.
- This is risky — preserve the visual animation behavior. Run `npm run dev` and confirm the marquee still loops smoothly.

**If the dominant subtree is just dense (no obvious cuts)**:
- Time-bound to 2 hours. If no clear cut emerges, document the largest contributor in this task's commit message and accept.

**Either way:**
- After any change, manually verify the page in `npm run dev` end-to-end. The marquee animations are known-fragile (multiple "stabilize marquee" commits in history).

- [ ] **Step 4: Commit**

If a fix landed:

```bash
git add src/components/BenefitsRich.jsx
git commit -m "perf(benefits): trim DOM size by NN elements

Reduced <description of what changed>. Verified marquee still loops infinitely
via npm run dev manual check."
```

If no fix (documented and accepted):

```bash
git commit --allow-empty -m "chore(benefits): document DOM size investigation

Investigated DOM size finding (1370 elements). Largest contributor is the
infinite-marquee duplication in BenefitsRich, which is required for the
visual effect. Structural change deemed too risky for this plan; accepting
current state. Re-evaluate if Performance < 90 after all other fixes."
```

---

## Task 21: G4 — Forced reflow profile (time-boxed 1 hour)

**Files:**
- Vary, depending on findings

- [ ] **Step 1: Find the offending JS**

Open `docs/lighthouse/<latest-checkpoint-folder>/report.html` in a browser. Navigate to the "Performance" / "Long tasks" section. The "Avoid forced reflows" diagnostic should list specific JS lines.

Alternatively, open Chrome DevTools → Performance tab → record a page reload → look for purple "Layout" bars triggered by yellow "Scripting" — those are forced reflows.

Common culprits in this codebase:
- `LenisProvider`'s RAF loop reads `lenis.velocity` and writes `style.setProperty('--scroll-velocity', ...)` on every frame — write-after-read pattern, but the read is from JS state (Lenis's own variable), not a layout query, so should be fine.
- Scroll handlers in `StickyNav` or `CustomCursor` that call `getBoundingClientRect()` then mutate styles synchronously.

- [ ] **Step 2: Fix or accept**

If a clear culprit emerges within 1 hour:
- Standard fix is batching: read all layout values first, then write all style mutations. Use `requestAnimationFrame` to separate read and write phases.

If no clear culprit emerges within 1 hour:
- Document and accept. Lighthouse's forced-reflow detector has false positives for some animation patterns.

- [ ] **Step 3: Commit**

If a fix landed:

```bash
git add src/
git commit -m "perf: batch DOM reads/writes to avoid forced reflow"
```

If no fix:

```bash
git commit --allow-empty -m "chore(perf): forced-reflow investigation time-boxed

Investigated 'Forced reflow' diagnostic. Could not identify a single hot path
within the time budget. Accepting current state."
```

---

## Task 22: Audit Checkpoint 3 (final)

**Files:**
- Create (via running): `docs/lighthouse/<timestamp>-mobile/`

- [ ] **Step 1: Deploy to staging**

Push all G-section changes through your deploy flow.

- [ ] **Step 2: Run the audit**

Run: `npm run audit`

Target floors per spec § Section H:
- Performance ≥ 90
- Accessibility ≥ 96 (likely 100)
- Best Practices = 100
- SEO ≥ 90 (likely 100)

- [ ] **Step 3: If a floor isn't met**

Read the new `summary.md`. The remaining opportunities should be small. Possible follow-ups:
- If Performance is 87–89, consider: brotli (requires nginx image swap), full marquee restructure (a separate larger plan), or third-party font subsetting.
- If everything else hits ≥ 90 but Performance is in the high 80s due to LCP > 2.5 s, the LCP element selector (in `report.json`'s `largest-contentful-paint-element` audit) tells you what to optimize next.

Open a follow-up plan; don't extend this one indefinitely.

- [ ] **Step 4: Commit**

```bash
git add docs/lighthouse
git commit -m "chore(audit): checkpoint 3 — after deep dive (final)"
```

---

## Task 23: Final validation

- [ ] **Step 1: Lint passes**

Run: `npm run lint`

If new errors appear in files this plan touched, fix them. Pre-existing errors in untouched files are not this plan's responsibility.

- [ ] **Step 2: Build passes**

Run: `npm run build`

Expected: clean build, no warnings about missing assets or unresolved imports.

- [ ] **Step 3: Existing audit-script tests still pass**

Run: `node --test scripts/lh-summary.test.mjs`

Expected: 13/13 (these tests cover the audit tooling, which this plan doesn't change but verifying nothing got broken).

- [ ] **Step 4: Open the final summary.md and skim**

Run: `cat docs/lighthouse/<final-checkpoint>/summary.md`

Confirm: scores are at or above target; Top opportunities and Diagnostics are short and contain only items we explicitly accepted.

- [ ] **Step 5: Final commit (if any uncommitted lint fixes)**

```bash
git status
# if clean, skip; otherwise commit
```

---

## What this plan does NOT cover (deferred)

- 1200×630 OG share image (placeholder is `/favicon.svg`)
- Sitemap generation (the `robots.txt` references one that doesn't exist yet — fine for the audit, not fine for SEO long-term)
- Brotli compression (requires nginx image swap)
- CI integration of the audit (e.g. fail PR builds below threshold)
- Multi-page audit (currently only the landing page)
- Dependency updates / Framer/Lenis/Motion version bumps for perf gains

If Checkpoint 3 doesn't hit Performance ≥ 90, the most likely next plan is the marquee restructure or a deeper Framer-runtime inspection.
