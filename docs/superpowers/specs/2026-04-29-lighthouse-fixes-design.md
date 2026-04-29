# Lighthouse Fixes — Design

**Date:** 2026-04-29
**Status:** Approved (brainstorm)
**Target site:** https://framerfejleszto.prototype.loginet.tech/ (staging)
**Baseline scores (mobile, latest audit `docs/lighthouse/2026-04-29-2219-mobile/`):**
- Performance **76** ⚠️
- Accessibility **94** ✅
- Best Practices **96** ✅
- SEO **83** ⚠️

**Goal:** All four categories ≥ 90, working through every finding in the latest `summary.md`. Verify by re-running `npm run audit` at three checkpoints; commit each new audit folder so progression is diffable.

**Out of scope:** auditing additional pages (this design targets the landing page only); CI integration; performance budgets; redesign of components beyond what's required to address findings.

---

## Section A — Self-host Google Fonts

**Problem:** `index.html` loads `fonts.googleapis.com/css2?...` directly. Lighthouse: render-blocking 1.65s. Also surfaces "Ensure text remains visible during webfont load" and "Font display 20 ms".

**Approach:**

1. Use `google-webfonts-helper` (or hand download) to fetch **woff2 only** for the four families:
   - **Archivo Black** — 400
   - **Big Shoulders Display** — 700, 800, 900
   - **Titillium Web** — 300, 400, 600, 700, 900
   - **Indie Flower** — 400
2. Place files under `public/fonts/`.
3. Create `src/styles/fonts.css` with `@font-face` rules. All families use `font-display: swap`.
4. Import `fonts.css` from `src/main.jsx` so Vite hashes and bundles the CSS.
5. Remove the three `<link>` tags pointing at `fonts.googleapis.com` / `fonts.gstatic.com` from `index.html`.
6. Add a `<link rel="preload" as="font" type="font/woff2" crossorigin>` for the single above-the-fold heading font (Big Shoulders Display weight 800 — the hero "WEBOLDAL HETEK helyett NAPOK ALATT" title).

**Expected impact:** Eliminates the 1.65s render-blocking finding, removes the third-party DNS round-trip, fixes the font-display warning. Estimated +5–8 Performance points on its own.

**Risk:** Font binaries add ~80–150 KB to the repo (one-time cost, aggressively cached after first load).

---

## Section B — `index.html` + content fixes

**Problem:** Missing meta description; no `robots.txt`; favicon not declared; no Open Graph tags.

**Approach:**

1. **Meta description** — add a Hungarian description (~150 chars) summarizing the offer. Draft to be confirmed during implementation:
   > "Prémium weboldalak Framer-ben napok alatt. 22.design senior csapata, transzparens árazás, beépített SEO és villámgyors betöltés. Élő demó és pitch."
2. **Open Graph + Twitter** — add `og:title`, `og:description`, `og:image` (path to a 1200×630 share image — placeholder if not yet designed; falls back to favicon), `og:url`, `og:type=website`, `twitter:card=summary_large_image`.
3. **Favicon link** — add `<link rel="icon" href="/favicon.svg" type="image/svg+xml" />` (currently missing in `index.html`; the file already exists at `public/favicon.svg`).
4. **`public/robots.txt`** — minimal valid policy:
   ```
   User-agent: *
   Allow: /

   Sitemap: https://framerfejleszto.hu/sitemap.xml
   ```
   Sitemap line stays even without an actual sitemap; the file just needs valid syntax to clear the audit. Sitemap generation is a future task.
5. **Title tag** — keep current `framerfejleszto.hu | Prémium weboldalak Framer-ben`. Verify it ranks well for the keyword later; not in scope here.

**Expected impact:** SEO 83 → ≥ 90 by itself. Fixes "Document does not have a meta description" and "robots.txt is not valid".

---

## Section C — A11y / SEO mechanical fixes in JSX

**Problem:** Heading hierarchy out of order; links/buttons without accessible names; `<img>` elements missing explicit dimensions.

**Approach:**

1. **Heading hierarchy** — scan all components in `src/components/` for skipped levels (e.g., `h1` → `h3` with no `h2`). Fix by changing the element to the correct level; preserve visual styling via existing CSS. Likely files based on prior audits: `HeroA.jsx`, `Sections.jsx`, `BenefitsRich.jsx`, `FAQ.jsx`.
2. **Discernible names** — find:
   - Icon-only `<a>` elements (likely social/footer links and the Framer editor toolbar mockup in `HeroA.jsx`)
   - Icon-only `<button>` elements
   Add `aria-label` with descriptive text (Hungarian where user-facing, English-OK where decorative-only and aria-hidden is acceptable instead).
3. **Image dimensions** — every `<img>` gets explicit `width` and `height` attributes. The intrinsic dimensions in pixels — CSS handles responsive sizing, the attributes prevent layout shift.
4. **`lang="hu"`** — already present on `<html>`, no change needed.

**Expected impact:** Accessibility 94 → 100, plus locks CLS at 0 (currently 0.033, edge of "good"). Resolves "Heading elements not in order", "Links do not have a discernible name", "Image elements do not have explicit width and height".

---

## Section D — Image pipeline (`vite-imagetools` + refactor)

**Problem:** "Properly size images" (160 ms), "Defer offscreen images" (29 KiB), oversized PNGs in `public/assets/illustrations/`, no `loading="lazy"`, no responsive `srcset`.

**Approach:**

1. **Add `vite-imagetools@^7`** as a devDep. Register in `vite.config.js`:
   ```js
   import { imagetools } from 'vite-imagetools'
   // plugins: [react(), liveEdit(), imagetools()]
   ```
2. **Move owned images** from `public/assets/illustrations/` (and any other `public/assets/` images referenced in JSX) to `src/assets/images/` (or similar) — Vite plugins only see imports through the bundler, not raw `public/` URL refs.
3. **Refactor every owned-image `<img>`** to use the bundler:
   ```jsx
   import heroBrain from '../assets/images/illustrations/ai-brain-hero.png?w=400;800;1200&format=avif;webp;png&as=picture'
   // ...
   <picture>
     <source type="image/avif" srcSet={heroBrain.sources.avif} />
     <source type="image/webp" srcSet={heroBrain.sources.webp} />
     <img src={heroBrain.img.src} width={heroBrain.img.w} height={heroBrain.img.h} loading="lazy" alt="..." />
   </picture>
   ```
   For inline-sized images, the simpler `?w=...&format=avif;webp;png&as=srcset` syntax suffices.
4. **Hero image stays eager** — the LCP candidate (likely the editor mockup or first illustration in `HeroA.jsx`) gets `loading="eager"` + `fetchpriority="high"`. All other images: `loading="lazy"`.
5. **Framer CDN images** (`framerusercontent.com/...`) — the plugin can't process these. Hand-tune:
   - Cap `?scale-down-to=` to a sensible mobile width (1024 for hero, 512 for cards).
   - Add `srcset` with 2–3 widths using the CDN's own `width=`/`scale-down-to=` params.
   - Add `loading="lazy"` to anything below the fold.

**Expected impact:** Resolves "Properly size images" + "Defer offscreen images" + "Image elements do not have explicit width and height" (when combined with Section C). Cuts mobile bytes shipped substantially. Estimated +3–5 Performance points.

**Risk:** vite-imagetools changes how images are referenced everywhere. Build time grows (AVIF generation is slow). One-time refactor cost, sustainable for future images.

---

## Section E — Vite build config

**Problem:** "Reduce unused JavaScript" (600 ms savings on `index-*.js`), "Missing source maps for large first-party JavaScript", monolithic main bundle invalidates cache on any change.

**Approach:**

1. **Replace `vite.config.js`:**
   ```js
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'
   import { imagetools } from 'vite-imagetools'
   import { liveEdit } from './src/plugins/live-edit/index.js'

   export default defineConfig(({ mode }) => ({
     plugins: [
       react(),
       imagetools(),
       ...(mode === 'development' ? [liveEdit()] : []),
     ],
     server: {
       watch: {
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
2. **`liveEdit` dev-only.** Currently in the plugins array unconditionally. Wrap in mode check (above) so it doesn't ship to production.
3. **`sourcemap: 'hidden'`** — generates `.map` files but doesn't reference them in `.js`/`.css`, so Lighthouse's "Missing source maps" diagnostic clears without exposing source to public. Maps stay available for stack-trace decoding tools that fetch the map file directly.
4. **Verify minification** is on by default (Vite uses esbuild; should already be fine — confirm during implementation).

**Expected impact:** Better long-term cache hit ratio. Vendor chunks (motion, lenis, react) change rarely; app code changes don't invalidate them. Resolves "Missing source maps". Modest Performance impact (~+1–2 points) directly, larger UX impact for repeat visitors.

---

## Section F — `nginx.conf` (caching + compression + headers)

**Problem:** "Use efficient cache lifetimes" (9.4 MB savings claimed); "Avoid enormous network payloads" (13 MB total transfer); "Serve static assets with an efficient cache policy" (20 resources flagged); no compression; no security headers.

**Approach:**

Replace `nginx.conf` with:

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

  # brotli (gated on module availability — verified during implementation)
  # If the nginx alpine image has ngx_brotli compiled in, enable:
  # brotli on;
  # brotli_comp_level 6;
  # brotli_types <same list as gzip>;

  # Security headers
  add_header X-Content-Type-Options nosniff always;
  add_header Referrer-Policy strict-origin-when-cross-origin always;
  add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

  # HTML — short cache, must revalidate
  location = /index.html {
    add_header Cache-Control "no-cache, must-revalidate" always;
    expires 0;
  }

  # Hashed assets (Vite emits content-hashed filenames) — 1 year immutable
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

**Expected impact:** Resolves "Use efficient cache lifetimes" + "Serve static assets with an efficient cache policy" (~9.4 MB savings). gzip roughly halves text-asset transfer (~13 MB → ~6 MB), addressing "Avoid enormous network payloads". Adds X-Content-Type-Options + Referrer-Policy + Permissions-Policy for the Best Practices security audits. Estimated +3–5 Performance, +1–3 Best Practices.

**Risk:** nginx must be redeployed on staging for these to take effect. Brotli is conditional — implementation step verifies the module is present in the image; if not, gzip alone is still a major win.

---

## Section G — Deep dive (Performance > 90 push)

After Sections A–F, expected Performance score is roughly 85–88. To clear 90, the following surgical work:

### G1. Console errors (Best Practices 96 → 100)

- Open staging in Chrome DevTools, capture console output.
- Likely culprits: a deprecated React API warning, a Framer-internal warning, or a 404 on a missing asset (often an OG image referenced before it exists).
- Triage: 1-line fixes go in this section. Framer-internal warnings we cannot suppress are documented and accepted.

### G2. Lazy-load heavy libraries

`framer-motion`, `lenis`, `unframer` together make up the bulk of the JS bundle. Currently all imported synchronously.

- **`framer-motion`** — for components below the fold (Benefits, FAQ, Works, Footer), wrap usage with `React.lazy(() => import('./Component'))` + `<Suspense fallback={null}>`. Above-the-fold (HeroA) keeps the static import.
- **`lenis`** — currently initialized on mount. Defer init to `requestIdleCallback` (with `setTimeout(..., 0)` fallback) so it doesn't compete with hydration.
- **`unframer`** — same lazy treatment as motion. Hero usage may stay eager.

**Files affected:** `src/App.jsx` (lazy-load route/section components), wherever Lenis is initialized (likely `src/main.jsx` or a provider).

### G3. DOM size trim (1370 → < 800)

- **Marquee duplication** in `BenefitsRich.jsx` — likely duplicates content for the infinite-loop effect. Audit: see if a single set of elements with CSS `transform` translation works (with cloning only what's actually visible).
- **Off-screen card mounting** — if `BenefitsRich` mounts all cards at once, consider `IntersectionObserver`-based lazy mount.
- **Time-bounded:** if the structural fix isn't obvious in 2 hours of investigation, document the largest contributor and accept the partial fix.

### G4. Forced reflow profile

- Run `npm run audit` once locally (already does).
- Open `report.html` → Performance → Long tasks → identify the offending JS line.
- Fix is usually batching DOM reads/writes in an animation loop (`requestAnimationFrame`-based reads instead of synchronous reads inside event handlers).
- **Time-bounded:** 1 hour. If not obvious, document and skip.

**Expected impact (G1–G4 combined):** Performance 88 → 90+, Best Practices 96 → 100, TBT down significantly.

**Risk:** G3 is the riskiest — could touch the marquee logic, which has a long history (multiple "fix(benefits): stabilize..." commits). Handle carefully; preserve the user-facing animation behavior.

---

## Section H — Verification cadence

Re-run `npm run audit` and commit the new audit folder at three checkpoints:

| Checkpoint | After sections | Target floor |
| --- | --- | --- |
| 1 | A, B, C | Perf ≥ 80, SEO ≥ 90, A11y ≥ 96, BP ≥ 96 |
| 2 | D, E, F | Perf ≥ 88, SEO ≥ 90, A11y ≥ 96, BP ≥ 96 |
| 3 | G | Perf ≥ 90, SEO ≥ 90, A11y ≥ 96, BP = 100 |

If a checkpoint underperforms its floor, triage from the new `summary.md` before proceeding. The diffable summaries make this fast.

---

## Risks & open questions

- **Sequencing.** Sections D and E both touch `vite.config.js`. Section D's plugin registration must merge cleanly with Section E's `build.rollupOptions`. Implementation plan handles ordering.
- **Brotli availability** in the staging nginx image — to verify in implementation. Falls back to gzip-only.
- **Marquee touch (G3)** — known-fragile area. Plan must include explicit "verify animation still loops infinitely" manual check.
- **Self-hosted font files** add to repo size. Acceptable; one-time cost.
- **Framer CDN images** are partially out of our control. Tuning query params helps but won't reach perfect.
- **Lighthouse score variance** ±3–5 points is normal. We treat checkpoint floors as approximate; the *opportunities list* shrinking is the real signal.
