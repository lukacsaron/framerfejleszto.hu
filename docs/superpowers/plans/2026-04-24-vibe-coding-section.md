# Vibe-Coding Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new "Emerald Deep" section between Benefits and Trust on the 22.design landing page, showcasing the PhenoGyde ACQ Riport 2026 as proof that 22.design picks the right tool for the job.

**Architecture:** New `VibeCodingSection` component added to `Sections.jsx` (following the existing single-file pattern). New `.ff-section.emerald` CSS modifier and emerald design tokens added to `tokens.css` and `main.css`. Real PhenoGyde screenshots displayed in a browser-frame mockup.

**Tech Stack:** React 19, Framer Motion (Reveal/RevealGroup), plain CSS with design tokens, Vite

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/styles/tokens.css` | Add emerald color tokens |
| Modify | `src/styles/main.css` | Add `.ff-section.emerald` and `.ff-vibe-*` styles |
| Modify | `src/components/Sections.jsx` | Add `VibeCodingSection` component |
| Modify | `src/App.jsx` | Import and place `VibeCodingSection` between Benefits and Trust |
| Add | `public/assets/illustrations/phenogyde-report-*.avif` | PhenoGyde screenshot(s) — user-provided |

---

### Task 1: Add Emerald Design Tokens

**Files:**
- Modify: `src/styles/tokens.css:10-15` (after existing midnight tokens)

- [ ] **Step 1: Add emerald tokens to tokens.css**

In `src/styles/tokens.css`, after the `--c-indigo-deep` line (line 14), add:

```css
  --c-emerald-900: #064E3B;
  --c-emerald-800: #0A2F1F;
  --grad-emerald:  linear-gradient(170deg, #064E3B 0%, #0A2F1F 50%, #0F1B3D 100%);
```

- [ ] **Step 2: Verify dev server renders without errors**

Run: `npm run dev`
Expected: No CSS parse errors, page loads normally.

- [ ] **Step 3: Commit**

```bash
git add src/styles/tokens.css
git commit -m "feat: add emerald color tokens for vibe-coding section"
```

---

### Task 2: Add Emerald Section CSS

**Files:**
- Modify: `src/styles/main.css:504` (after `.ff-section.paper`)

- [ ] **Step 1: Add `.ff-section.emerald` modifier and all vibe-coding section styles**

In `src/styles/main.css`, after `.ff-section.paper { background: var(--bg-page); }` (line 504), add:

```css
.ff-section.emerald {
  background: var(--grad-emerald);
  color: #fff;
}
.ff-section.emerald .ff-eyebrow { color: var(--c-mint-500); }
.ff-section.emerald .ff-section-head .lead { color: rgba(255,255,255,0.72); }
.ff-section.emerald .ff-section-head .lead strong { color: #fff; font-weight: 700; }

/* ── Vibe-coding showcase ── */
.ff-vibe-showcase {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 48px;
  align-items: start;
}

.ff-vibe-client-label {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: rgba(255,255,255,0.45);
  margin-bottom: 6px;
}
.ff-vibe-client-name {
  font-family: var(--ff-display);
  font-size: 22px;
  color: #fff;
  margin-bottom: 4px;
}
.ff-vibe-project-name {
  font-size: 15px;
  color: rgba(255,255,255,0.6);
  margin-bottom: 20px;
}
.ff-vibe-desc {
  font-size: 14px;
  line-height: 1.5;
  color: rgba(255,255,255,0.55);
  margin-bottom: 28px;
}

.ff-vibe-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.ff-vibe-stat {
  border-left: 2px solid var(--c-mint-500);
  padding-left: 12px;
}
.ff-vibe-stat-num {
  font-family: var(--ff-display);
  font-size: 26px;
  color: var(--c-mint-500);
  line-height: 1.1;
}
.ff-vibe-stat-label {
  font-size: 12px;
  color: rgba(255,255,255,0.45);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* ── Browser frame mockup ── */
.ff-vibe-browser {
  background: #1a1a2e;
  border-radius: 12px;
  border: 1.5px solid rgba(255,255,255,0.12);
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(0,0,0,0.4);
}
.ff-vibe-browser-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: rgba(255,255,255,0.06);
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.ff-vibe-browser-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
}
.ff-vibe-browser-url {
  font-size: 11px;
  color: rgba(255,255,255,0.3);
  margin-left: 8px;
  font-family: monospace;
}
.ff-vibe-browser-content {
  line-height: 0;
}
.ff-vibe-browser-content img {
  width: 100%;
  height: auto;
  display: block;
}

/* ── Vibe CTA ── */
.ff-vibe-cta {
  margin-top: 48px;
}
.ff-vibe-cta .ff-btn.mint {
  background: var(--c-mint-500);
  color: var(--c-emerald-800);
  border: 2px solid var(--c-emerald-800);
  box-shadow: var(--sh-brut-sm);
}
.ff-vibe-cta .ff-btn.mint:hover {
  box-shadow: 6px 6px 0 0 var(--c-black);
  transform: translate(-1px, -1px);
}
```

- [ ] **Step 2: Add responsive overrides**

In the existing `@media (max-width: 768px)` block (around line 819), add:

```css
  .ff-vibe-showcase { grid-template-columns: 1fr; gap: 32px; }
```

In the existing `@media (max-width: 480px)` block (around line 898), add:

```css
  .ff-vibe-stats { gap: 12px; }
  .ff-vibe-stat-num { font-size: 22px; }
```

- [ ] **Step 3: Verify no CSS parse errors**

Run: `npm run dev`
Expected: Page loads, no errors in console.

- [ ] **Step 4: Commit**

```bash
git add src/styles/main.css
git commit -m "feat: add emerald section and vibe-coding showcase CSS"
```

---

### Task 3: Build `VibeCodingSection` Component

**Files:**
- Modify: `src/components/Sections.jsx` (add new export after `Benefits`, before `TrustSection`)

- [ ] **Step 1: Add `VibeCodingSection` component**

In `src/components/Sections.jsx`, between the `Benefits` component (ends line 289) and the `TrustSection` comment (line 291), add:

```jsx
/* ═════════ Vibe-Coding — PhenoGyde Showcase ═════════ */
export function VibeCodingSection() {
  return (
    <section className="ff-section emerald" id="vibe">
      <div className="ff-container">
        <Reveal>
          <div className="ff-section-head">
            <div>
              <div className="ff-eyebrow">NEM MINDEN PROJEKTHEZ KELL FRAMER</div>
              <h2>
                NÉHA AZ{' '}
                <span style={{ color: 'var(--c-mint-500)' }}>EGYSZERŰBB</span>
                {' '}DÖNTÉS A JÓ DÖNTÉS
              </h2>
            </div>
            <p className="lead">
              Framer ügynökség vagyunk — és ezt mondjuk:{' '}
              <strong>nem mindig a Framer a válasz.</strong>{' '}
              Amikor ügyfelünk 150 oldalas interaktív piackutatást kért tele 3D
              térképekkel, élő grafikonokkal és komplex adatvizualizációval, nem
              erőltettük a Framert. AI-gyorsított fejlesztéssel építettük meg —
              mert a jó döntés az, ami a projekthez illik, nem ami a portfóliónkhoz.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="ff-vibe-showcase">
            <div>
              <div className="ff-vibe-client-label">Ügyfél</div>
              <div className="ff-vibe-client-name">PhenoGyde</div>
              <div className="ff-vibe-project-name">ACQ Riport 2026 — Magyarország</div>
              <p className="ff-vibe-desc">
                A magyar bankkártya-elfogadási piac teljes feltérképezése: 23
                szolgáltató, mystery shopping, kereskedői ügyfélút-elemzés,
                versenyképességi scoring.
              </p>
              <div className="ff-vibe-stats">
                <div className="ff-vibe-stat">
                  <div className="ff-vibe-stat-num">150+</div>
                  <div className="ff-vibe-stat-label">Oldal</div>
                </div>
                <div className="ff-vibe-stat">
                  <div className="ff-vibe-stat-num">100+</div>
                  <div className="ff-vibe-stat-label">Grafikon</div>
                </div>
                <div className="ff-vibe-stat">
                  <div className="ff-vibe-stat-num">10+</div>
                  <div className="ff-vibe-stat-label">3D térkép</div>
                </div>
                <div className="ff-vibe-stat">
                  <div className="ff-vibe-stat-num">23</div>
                  <div className="ff-vibe-stat-label">Szolgáltató</div>
                </div>
              </div>
            </div>

            <div className="ff-vibe-browser">
              <div className="ff-vibe-browser-bar">
                <div className="ff-vibe-browser-dot" />
                <div className="ff-vibe-browser-dot" />
                <div className="ff-vibe-browser-dot" />
                <span className="ff-vibe-browser-url">phenogyde.com/acq-riport-2026</span>
              </div>
              <div className="ff-vibe-browser-content">
                <img
                  src="/assets/illustrations/phenogyde-report-overview.avif"
                  alt="PhenoGyde ACQ Riport 2026 — interaktív piackutatás"
                />
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.25}>
          <div className="ff-vibe-cta">
            <FFButton variant="mint" icon={<Arrow />}>Pitchelj minket</FFButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify the component renders (will show broken image until screenshot is added)**

Run: `npm run dev`
Expected: Component renders with emerald background, text visible, image placeholder broken (expected — screenshot not yet added).

- [ ] **Step 3: Commit**

```bash
git add src/components/Sections.jsx
git commit -m "feat: add VibeCodingSection component with PhenoGyde showcase"
```

---

### Task 4: Wire Up in App.jsx

**Files:**
- Modify: `src/App.jsx:3-4` (import list) and `src/App.jsx:23-24` (component placement)

- [ ] **Step 1: Add VibeCodingSection to the import**

In `src/App.jsx`, add `VibeCodingSection` to the import from `./components/Sections`:

```jsx
import {
  ProblemSolution,
  ProcessSection,
  Benefits,
  VibeCodingSection,
  TrustSection,
  Portfolio,
  FAQSection,
  FinalCTA,
  Footer,
} from './components/Sections';
```

- [ ] **Step 2: Place VibeCodingSection between Benefits and TrustSection**

In the JSX, between `<Benefits />` and `<TrustSection />`:

```jsx
      <Benefits />
      <VibeCodingSection />
      <TrustSection />
```

- [ ] **Step 3: Verify full page renders correctly**

Run: `npm run dev`
Expected: Page loads. Scrolling past Benefits reveals the emerald section, then Trust follows. The section has the correct gradient background, mint accents, all text visible.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "feat: wire VibeCodingSection between Benefits and Trust"
```

---

### Task 5: Add PhenoGyde Screenshot

**Files:**
- Add: `public/assets/illustrations/phenogyde-report-overview.avif`

- [ ] **Step 1: Obtain and place screenshot**

The user needs to provide a real screenshot from the PhenoGyde ACQ Report. Save it as `public/assets/illustrations/phenogyde-report-overview.avif`.

If the image is provided in a different format (PNG/JPG), convert:

```bash
npx avif --input public/assets/illustrations/phenogyde-report-overview.png --output public/assets/illustrations/ --quality 70
```

Or if `avif` tools aren't available, use the PNG/JPG directly and update the `src` in the component.

- [ ] **Step 2: Verify the image displays correctly in the browser frame**

Run: `npm run dev`
Expected: Screenshot renders inside the browser-frame mockup, fills the width, no overflow or aspect ratio issues.

- [ ] **Step 3: Commit**

```bash
git add public/assets/illustrations/phenogyde-report-overview.avif
git commit -m "feat: add PhenoGyde report screenshot for vibe-coding section"
```

---

### Task 6: Add `mint` Button Variant to Primitives

**Files:**
- Modify: `src/styles/main.css` (wherever `.ff-btn` variants are defined)

- [ ] **Step 1: Find existing button variant styles**

Search for `.ff-btn.white` or `.ff-btn.dark` in `main.css` to locate the button variant block.

- [ ] **Step 2: Add the mint variant**

After the last `.ff-btn` variant, add:

```css
.ff-btn.mint {
  background: var(--c-mint-500);
  color: var(--c-emerald-800);
  border-color: var(--c-emerald-800);
}
.ff-btn.mint:hover {
  background: var(--c-mint-600);
}
```

Note: The `FFButton` component in `Primitives.jsx` already passes the `variant` prop as a CSS class (`ff-btn ${variant}`), so no JS changes needed — only the CSS class definition.

- [ ] **Step 3: Verify the mint button renders correctly in the section**

Run: `npm run dev`
Expected: The "Pitchelj minket" button in the vibe-coding section has a mint green background with dark text and neobrutalist shadow.

- [ ] **Step 4: Commit**

```bash
git add src/styles/main.css
git commit -m "feat: add mint button variant for emerald section CTA"
```

---

### Task 7: Visual QA and Polish

**Files:**
- Possibly modify: `src/styles/main.css` (responsive tweaks)

- [ ] **Step 1: Test desktop layout (1440px+)**

Open dev tools, set viewport to 1440px. Verify:
- Emerald gradient is visible and distinct from surrounding sections
- Two-column showcase layout: info left, browser frame right
- Stats grid is 2x2
- Browser frame has visible dots, URL, and screenshot
- CTA button is mint green with shadow

- [ ] **Step 2: Test tablet layout (768px)**

Set viewport to 768px. Verify:
- Showcase stacks to single column (info on top, browser frame below)
- All text remains readable
- No horizontal overflow

- [ ] **Step 3: Test mobile layout (375px)**

Set viewport to 375px. Verify:
- Section padding reduces appropriately
- Stats grid remains 2x2 but with tighter spacing
- Browser frame mockup scales down cleanly
- CTA button is full-width or centered

- [ ] **Step 4: Fix any issues found**

Apply CSS fixes as needed in `main.css`.

- [ ] **Step 5: Commit final polish**

```bash
git add src/styles/main.css
git commit -m "fix: responsive polish for vibe-coding section"
```
