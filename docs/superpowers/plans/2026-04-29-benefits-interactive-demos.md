# Benefits — Interactive USP Demos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the six static USP cards under "A FRAMER NEM CSAK GYORS, OKOS IS." with the interactive `BenefitsRich` variant from the FF.hu handoff bundle, while keeping the existing section header, eyebrow, and lead untouched.

**Architecture:** Add a self-contained `BenefitsRich.jsx` that owns the new dark-card grid plus six tightly-coupled demo subcomponents. Port the demo CSS verbatim into a new stylesheet that uses tokens already defined in `tokens.css`. Add one missing icon (`Globe`) to the existing icon set. Swap the App-level usage and remove the now-unused `Benefits` function and its data array from `Sections.jsx`.

**Tech Stack:** React 19 (project uses standard hooks), framer-motion (already in `Reveal`/`TypewriterReveal` wrappers), CSS custom properties from `src/styles/tokens.css`, Vite. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-04-29-benefits-interactive-demos-design.md`

---

## File Map

| Action  | Path                                              | Responsibility                                            |
| ------- | ------------------------------------------------- | --------------------------------------------------------- |
| Create  | `src/components/BenefitsRich.jsx`                 | Section + 6 demo subcomponents + `useInView`/`Gauge` helpers |
| Create  | `src/styles/benefit-demos.css`                    | Card grid + demo-specific styles (port from handoff)      |
| Modify  | `src/components/Icons.jsx`                        | Export new `Globe` icon                                   |
| Modify  | `src/main.jsx`                                    | Import the new stylesheet                                 |
| Modify  | `src/App.jsx`                                     | Swap `Benefits` → `BenefitsRich`                          |
| Modify  | `src/components/Sections.jsx`                     | Remove `Benefits`, `BENEFITS`, dead icon imports          |

There are no tests in this codebase (no `*.test.*` files, no test runner in `package.json`); the project is a marketing landing site verified by `npm run build` + visual smoke-test in `npm run dev`. Tasks therefore use build success and an explicit dev-server visual checklist as the verification gate.

---

## Task 1: Add Globe icon

**Files:**
- Modify: `src/components/Icons.jsx`

The handoff card 6 (`DemoCDN`) needs a globe-style icon. The existing icon set uses stroke SVGs in a `viewBox="0 0 24 24"` with `strokeWidth="2"` (see `Cloud`, `Leaf`, `Pencil`). Match that style.

- [ ] **Step 1: Add `Globe` export to Icons.jsx**

Open `src/components/Icons.jsx` and append after the existing `Cloud` export:

```jsx
export const Globe = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a13 13 0 010 18M12 3a13 13 0 000 18"/></svg>
);
```

- [ ] **Step 2: Verify the file still parses**

Run: `npm run build`
Expected: build succeeds with no errors. (`Globe` isn't imported anywhere yet, so it's a dead export at this point — that's fine.)

- [ ] **Step 3: Commit**

```bash
git add src/components/Icons.jsx
git commit -m "feat(icons): add Globe icon for upcoming CDN demo card"
```

---

## Task 2: Port benefit-demos.css

**Files:**
- Create: `src/styles/benefit-demos.css`

Verbatim port of `ff-hu-22-design-system/project/benefit-demos.css` from the handoff. All `var(--c-*)`, `var(--ff-*)`, and `var(--ease-out)` references are already declared in `src/styles/tokens.css` (verified during brainstorming).

- [ ] **Step 1: Create `src/styles/benefit-demos.css`**

Create the file with this exact contents:

```css
/* ═══ Benefit demo styles ═══ */

.bdemo-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;
  align-items: stretch;
}
.bdemo-card.span-1 { grid-column: span 2; }
.bdemo-card.span-2 { grid-column: span 4; }
@media (max-width: 1100px) {
  .bdemo-grid { grid-template-columns: repeat(2, 1fr); }
  .bdemo-card.span-1, .bdemo-card.span-2 { grid-column: span 2; }
}

.bdemo-card {
  background: var(--c-midnight-950); color: #fff;
  border-radius: 22px; padding: 28px;
  display: flex; flex-direction: column; gap: 22px;
  box-shadow: 0 1px 0 rgba(255,255,255,0.04) inset, 0 30px 60px -30px rgba(15,27,61,0.5);
  position: relative; overflow: hidden;
}
.bdemo-card::before {
  content: ""; position: absolute; inset: 0;
  background: radial-gradient(circle at 100% 0%, rgba(255,102,0,0.10), transparent 50%);
  pointer-events: none;
}
.bdemo-card-head { display: flex; gap: 18px; align-items: flex-start; position: relative; }
.bdemo-card-head .ic {
  flex: 0 0 48px; width: 48px; height: 48px;
  border-radius: 12px; background: rgba(255,255,255,0.08);
  display: grid; place-items: center; color: var(--c-orange-500);
}
.bdemo-card-head .ic svg { width: 22px; height: 22px; }
.bdemo-card-head h4 {
  font-family: var(--ff-display); text-transform: uppercase;
  font-size: 22px; line-height: 1.05; letter-spacing: -0.01em;
  margin: 0 0 8px; color: #fff;
}
.bdemo-card-head p { font-size: 14px; line-height: 1.5; color: rgba(255,255,255,0.7); margin: 0; }
.bdemo-card-body {
  flex: 1; min-height: 220px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
  padding: 20px;
  display: flex; flex-direction: column; justify-content: center;
  position: relative;
}
.bdemo-caption {
  font-size: 12px; color: rgba(255,255,255,0.5);
  text-transform: uppercase; letter-spacing: 0.12em; font-weight: 700;
  margin-top: 14px;
}

/* ─── Demo 1: Mini landing ─── */
.bdemo-landing { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.bdemo-bezel {
  width: 100%; max-width: 360px; aspect-ratio: 1.4 / 1;
  background: #0E1224; border-radius: 10px; overflow: hidden;
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: 0 20px 40px -20px rgba(0,0,0,0.6);
  display: flex; flex-direction: column;
}
.bdemo-chrome {
  height: 22px; background: #15182B; display: flex; align-items: center;
  padding: 0 8px; gap: 5px; border-bottom: 1px solid rgba(255,255,255,0.05);
}
.bdemo-chrome span { width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,0.2); }
.bdemo-chrome span:first-child { background: #FF5F57; }
.bdemo-chrome span:nth-child(2) { background: #FEBC2E; }
.bdemo-chrome span:nth-child(3) { background: #28C840; }
.bdemo-url {
  margin-left: auto; margin-right: auto; font-size: 9px; color: rgba(255,255,255,0.55);
  background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 4px;
}
.bdemo-page {
  flex: 1; padding: 12px; display: flex; flex-direction: column; gap: 8px;
  background: linear-gradient(180deg, #F5EEFF, #fff);
}
.bd-row {
  opacity: 0; transform: translateY(14px);
  transition: opacity .5s var(--ease-out), transform .5s var(--ease-out);
}
.bd-row.on { opacity: 1; transform: translateY(0); }
.bd-row.hero { display: grid; grid-template-columns: 1fr 28%; gap: 8px; align-items: end; padding-bottom: 6px; border-bottom: 1px dashed rgba(15,27,61,0.12); }
.bd-row.hero .h1 { height: 10px; background: var(--c-midnight-950); border-radius: 3px; width: 80%; }
.bd-row.hero .h2 { height: 5px; background: rgba(15,27,61,0.5); border-radius: 3px; width: 60%; margin-top: 4px; }
.bd-row.hero .cta { height: 18px; background: var(--c-orange-600); border-radius: 4px; }
.bd-row.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.bd-row.stats div { background: #fff; border: 1px solid rgba(15,27,61,0.08); border-radius: 6px; padding: 6px; text-align: left; }
.bd-row.stats b { display: block; font-family: var(--ff-display); font-size: 14px; line-height: 1; color: var(--c-midnight-950); letter-spacing: -0.02em; }
.bd-row.stats span { font-size: 7px; letter-spacing: 0.1em; color: rgba(15,27,61,0.5); text-transform: uppercase; }
.bd-row.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.bd-row.cards div { aspect-ratio: 1.2/1; background: rgba(151,71,255,0.18); border-radius: 6px; }
.bd-row.cards div:nth-child(2) { background: rgba(255,102,0,0.18); }
.bd-row.cards div:nth-child(3) { background: rgba(75,194,146,0.18); }
.bd-row.footer .ftr-cta {
  height: 22px; border-radius: 11px;
  background: linear-gradient(90deg, var(--c-violet-500), var(--c-orange-500));
  width: 60%; margin: 0 auto;
}

/* ─── Demo 2: CMS edit ─── */
.bdemo-edit { display: flex; flex-direction: column; align-items: stretch; gap: 12px; }
.bdemo-cms {
  background: #15182B; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px;
  overflow: hidden;
}
.bdemo-cms-head {
  height: 32px; background: rgba(255,255,255,0.04);
  display: flex; align-items: center; padding: 0 12px; gap: 8px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  font-size: 11px;
}
.bdemo-cms-head .dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,0.2); }
.bdemo-cms-head .dot:first-child { background: #FF5F57; }
.bdemo-cms-head .dot:nth-child(2) { background: #FEBC2E; }
.bdemo-cms-head .dot:nth-child(3) { background: #28C840; }
.bdemo-cms-tab {
  background: rgba(255,255,255,0.06); padding: 3px 10px; border-radius: 4px;
  color: rgba(255,255,255,0.7); font-size: 10px; letter-spacing: 0.06em;
  margin-left: 6px;
}
.bdemo-cms-save { margin-left: auto; color: var(--c-mint-500); font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
.bdemo-cms-body { padding: 18px 16px 16px; }
.bdemo-cms-label {
  font-size: 9px; letter-spacing: 0.16em; color: rgba(255,255,255,0.45);
  text-transform: uppercase; margin-bottom: 8px;
}
.bdemo-cms-input {
  background: rgba(255,255,255,0.06); border-radius: 8px; padding: 12px 14px;
  display: flex; align-items: center; gap: 4px;
  font-family: var(--ff-display); font-size: 22px; letter-spacing: -0.01em;
  color: #fff; min-height: 56px;
  border: 1.5px solid var(--c-violet-500);
  box-shadow: 0 0 0 4px rgba(151,71,255,0.18);
}
.bdemo-cms-input .txt { line-height: 1.1; }
.bdemo-cms-input .caret {
  display: inline-block; width: 2px; height: 24px; background: var(--c-orange-500);
  animation: bdemo-blink 1s steps(2) infinite;
}
@keyframes bdemo-blink { 50% { opacity: 0; } }
.bdemo-cms-row { display: flex; align-items: center; justify-content: space-between; margin-top: 14px; }
.bdemo-cms-chip {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(75,194,146,0.14); color: var(--c-mint-500);
  font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;
  padding: 5px 10px; border-radius: 999px;
}
.bdemo-cms-chip .dot-g {
  width: 6px; height: 6px; border-radius: 50%; background: var(--c-mint-500);
  box-shadow: 0 0 0 3px rgba(75,194,146,0.3);
}
.bdemo-cms-meta { font-size: 10px; color: rgba(255,255,255,0.4); letter-spacing: 0.04em; }

/* ─── Demo 3: Animations ─── */
.bdemo-anim { display: flex; flex-direction: column; gap: 14px; }
.bdemo-anim-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.bdemo-anim-cell {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  background: rgba(255,255,255,0.03); border-radius: 10px; padding: 14px;
  border: 1px solid rgba(255,255,255,0.05);
  min-height: 150px;
  justify-content: center;
}
.bdemo-anim-tag {
  font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.5);
  font-weight: 700;
}
/* Tilt card */
.bdemo-tilt-card {
  width: 110px; height: 80px; border-radius: 10px;
  background: linear-gradient(135deg, var(--c-orange-500), var(--c-violet-500));
  position: relative; overflow: hidden;
  transition: transform .15s ease;
  box-shadow: 0 12px 24px rgba(0,0,0,0.3);
  display: grid; place-items: center;
  cursor: pointer;
}
.bdt-shine {
  position: absolute; inset: 0;
  background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%);
  pointer-events: none;
}
.bdt-stamp {
  font-family: var(--ff-display); font-size: 26px; color: #fff; letter-spacing: -0.04em;
  position: relative; z-index: 1;
}
.bdt-stamp sup { font-size: 10px; letter-spacing: 0.18em; vertical-align: super; margin-left: 2px; }
.bdt-label {
  position: absolute; bottom: 6px; right: 8px;
  font-size: 7px; letter-spacing: 0.18em; font-weight: 800; color: #fff; text-transform: uppercase;
  background: rgba(0,0,0,0.25); padding: 3px 6px; border-radius: 3px;
}
/* Magnet button */
.bdemo-magnet-area {
  width: 100%; height: 86px; display: grid; place-items: center;
  position: relative;
}
.bdemo-magnet-btn {
  background: var(--c-orange-600); color: #fff; border: none;
  font-family: var(--ff-body); font-weight: 800;
  font-size: 12px; letter-spacing: 0.06em;
  padding: 10px 16px; border-radius: 999px; cursor: pointer;
  transition: transform .25s cubic-bezier(.2,.8,.2,1);
  box-shadow: 0 10px 20px rgba(255,102,0,0.3);
  text-transform: uppercase;
}
/* Marquee */
.bdemo-marquee {
  width: 100%; overflow: hidden; height: 40px;
  background: var(--c-violet-600); border-radius: 6px;
  display: flex; align-items: center;
  position: relative; mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
}
.bdm-track {
  display: flex; gap: 22px; padding-left: 22px;
  white-space: nowrap; will-change: transform;
}
.bdm-track span {
  font-family: var(--ff-display); font-size: 16px; color: #fff;
  letter-spacing: 0.06em; flex-shrink: 0;
}
.bdemo-marquee.on .bdm-track {
  animation: bdemo-marquee-scroll 8s linear infinite;
}
@keyframes bdemo-marquee-scroll {
  to { transform: translateX(-50%); }
}

/* ─── Demo 4: Pricing ─── */
.bdemo-price { display: flex; flex-direction: column; gap: 14px; height: 100%; }
.bdemo-price-head {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 13px; color: rgba(255,255,255,0.7);
}
.bdemo-price-tag {
  background: rgba(255,255,255,0.06); padding: 3px 10px; border-radius: 4px;
  font-size: 9px; letter-spacing: 0.16em; font-weight: 800; text-transform: uppercase;
  color: rgba(255,255,255,0.5);
}
.bdemo-price-bars { display: flex; flex-direction: column; gap: 14px; }
.bdp-row { display: flex; flex-direction: column; gap: 6px; }
.bdp-label { font-size: 12px; color: rgba(255,255,255,0.65); font-weight: 600; }
.bdp-row.highlight .bdp-label { color: var(--c-orange-500); font-weight: 800; }
.bdp-track {
  height: 28px; background: rgba(255,255,255,0.05); border-radius: 6px;
  overflow: hidden; position: relative;
}
.bdp-fill {
  height: 100%; border-radius: 6px;
  display: flex; align-items: center; justify-content: flex-end;
  padding: 0 12px;
  transition: width 1.1s cubic-bezier(.2,.8,.2,1);
  position: relative;
}
.bdp-amount {
  font-family: var(--ff-display); font-size: 13px; color: #fff;
  letter-spacing: -0.01em; white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.bdemo-price-foot {
  display: flex; align-items: baseline; gap: 12px;
  padding-top: 12px; border-top: 1px dashed rgba(255,255,255,0.1);
  font-size: 12px; color: rgba(255,255,255,0.65);
}
.bdp-save {
  font-family: var(--ff-display); font-size: 28px; color: var(--c-mint-500);
  letter-spacing: -0.03em; line-height: 1;
}

/* ─── Demo 5: Lighthouse ─── */
.bdemo-lh { display: flex; flex-direction: column; gap: 14px; }
.bdemo-lh-head { display: flex; align-items: center; gap: 10px; font-size: 12px; color: rgba(255,255,255,0.7); }
.bdemo-lh-pill {
  background: var(--c-mint-500); color: #14213D;
  font-size: 9px; font-weight: 900; letter-spacing: 0.16em; text-transform: uppercase;
  padding: 4px 8px; border-radius: 4px;
}
.bdemo-lh-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.bdemo-gauge { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.bdemo-gauge svg { width: 70px; height: 70px; }
.bdemo-gauge-label {
  font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase;
  color: rgba(255,255,255,0.6); font-weight: 700; text-align: center;
}
.bdemo-lh-foot { display: flex; flex-direction: column; gap: 8px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.1); }
.lf-bar { height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; position: relative; }
.lf-bar::before {
  content: ""; position: absolute; left: 12%; top: 0; bottom: 0; width: 2px; background: var(--c-orange-500);
}
.lf-bar-fill { display: block; height: 100%; background: linear-gradient(90deg, var(--c-mint-500), var(--c-mint-500) 30%, transparent); transition: width 1.4s ease; }
.lf-meta { display: flex; justify-content: space-between; font-size: 11px; color: rgba(255,255,255,0.65); }
.lf-meta b { color: #fff; font-family: var(--ff-display); font-size: 14px; letter-spacing: -0.02em; margin-right: 4px; }

/* ─── Demo 6: CDN map ─── */
.bdemo-cdn { display: flex; flex-direction: column; gap: 12px; }
.bdemo-cdn-head { display: flex; justify-content: space-between; align-items: center; font-size: 11px; }
.bdemo-cdn-status {
  display: inline-flex; align-items: center; gap: 7px;
  color: var(--c-mint-500); font-weight: 700; letter-spacing: 0.04em;
}
.dot-pulse {
  width: 7px; height: 7px; border-radius: 50%; background: var(--c-mint-500);
  display: inline-block; position: relative;
  box-shadow: 0 0 0 0 rgba(75,194,146,0.6);
  animation: bdemo-pulse 1.6s infinite;
}
@keyframes bdemo-pulse {
  0% { box-shadow: 0 0 0 0 rgba(75,194,146,0.6); }
  70% { box-shadow: 0 0 0 8px rgba(75,194,146,0); }
  100% { box-shadow: 0 0 0 0 rgba(75,194,146,0); }
}
.bdemo-cdn-meta { color: rgba(255,255,255,0.45); font-size: 10px; letter-spacing: 0.04em; }
.bdemo-cdn-map {
  background: radial-gradient(ellipse at center, rgba(151,71,255,0.18), transparent 70%), rgba(0,0,0,0.2);
  border-radius: 8px; padding: 10px; aspect-ratio: 320/140;
  border: 1px solid rgba(255,255,255,0.05);
}
.bdemo-cdn-map svg { width: 100%; height: 100%; display: block; }
.bdemo-cdn-foot {
  display: flex; gap: 16px;
  padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.1);
  font-size: 11px; color: rgba(255,255,255,0.6);
}
.bdemo-cdn-foot b { color: #fff; font-family: var(--ff-display); font-size: 14px; letter-spacing: -0.02em; margin-right: 4px; }
```

- [ ] **Step 2: Wire the stylesheet into the app**

Open `src/main.jsx` and add the new import directly after `import './styles/animations.css'`:

```jsx
import './styles/main.css'
import './styles/animations.css'
import './styles/benefit-demos.css'
```

- [ ] **Step 3: Verify the build still passes**

Run: `npm run build`
Expected: build succeeds. The CSS is loaded but no markup uses it yet — there's nothing to look at on screen.

- [ ] **Step 4: Commit**

```bash
git add src/styles/benefit-demos.css src/main.jsx
git commit -m "feat(styles): add benefit-demos stylesheet for interactive USP cards"
```

---

## Task 3: Create BenefitsRich.jsx with section shell + helpers

**Files:**
- Create: `src/components/BenefitsRich.jsx`

This task adds the file with the section header (using the existing `Reveal` + `TypewriterReveal` like the other sections), the `useInView` hook, the `Gauge` helper, and a placeholder card grid that renders only the card heads (no demos yet). Subsequent tasks fill in each demo. This keeps each commit independently shippable.

The component does NOT yet replace `Benefits` in `App.jsx`; that wiring happens in Task 10 after all demos exist.

- [ ] **Step 1: Create the file with section header, helpers, and a no-demo card list**

Create `src/components/BenefitsRich.jsx` with this exact contents:

```jsx
import { useState, useEffect, useRef } from 'react';
import { Rocket, Pencil, Bolt, Leaf, Globe } from './Icons';
import { Reveal, TypewriterReveal } from './animations/Reveal';

function useInView(threshold = 0.4) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { threshold },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function useHover() {
  const [h, setH] = useState(false);
  return [h, { onMouseEnter: () => setH(true), onMouseLeave: () => setH(false) }];
}

function Gauge({ value, label, color, delay = 0 }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  return (
    <div className="bdemo-gauge">
      <svg viewBox="0 0 80 80" width="80" height="80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="6" />
        <circle
          cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          transform="rotate(-90 40 40)"
          style={{ transition: `stroke-dasharray 1.4s cubic-bezier(.2,.8,.2,1) ${delay}s` }}
        />
        <text x="40" y="46" textAnchor="middle" fontSize="22" fontWeight="900" fill="#fff" fontFamily="Big Shoulders Display, Arial, sans-serif">{value}</text>
      </svg>
      <div className="bdemo-gauge-label">{label}</div>
    </div>
  );
}

// Demo placeholders — filled in by later tasks
function DemoLanding()    { return <div className="bdemo bdemo-landing" />; }
function DemoEdit()       { return <div className="bdemo bdemo-edit" />; }
function DemoAnimations() { return <div className="bdemo bdemo-anim" />; }
function DemoPricing()    { return <div className="bdemo bdemo-price" />; }
function DemoLighthouse() { return <div className="bdemo bdemo-lh" />; }
function DemoCDN()        { return <div className="bdemo bdemo-cdn" />; }

const BENEFIT_CARDS = [
  { icon: <Rocket />,  title: 'Tökéletes kampány-landing oldalakhoz',           body: 'Villámgyors, reszponzív, látványos. Minden, amire egy értékesítési felületnek szüksége van.',                                       Demo: DemoLanding,    span: 1 },
  { icon: <Pencil />,  title: 'Te is tudod szerkeszteni',                        body: 'CMS a tartalomhoz, vizuális szerkesztő a designhoz. Ha van a csapatban digitálisan jártas marketinges, teljes az ownership — ügynökségre sincs szükség.', Demo: DemoEdit,       span: 1 },
  { icon: <Bolt />,    title: 'Animációk, amik máshol luxusnak számítanak',      body: 'Mikrointerakciók, hover-effektek, scroll-animációk. Egyedi fejlesztésnél órákba és extra költségbe kerülnek. Framer-ben ugyanez pár kattintás.',          Demo: DemoAnimations, span: 2 },
  { icon: <Leaf />,    title: 'Fenntartható és transzparens árazás',             body: 'Nincs dupla költség design + fejlesztésre, külön alvállalkozókra. Transzparens Framer előfizetés, havi díjjal.',                                          Demo: DemoPricing,    span: 2 },
  { icon: <Bolt />,    title: 'SEO és villámgyors betöltés',                     body: 'Beépített SEO, global CDN, Lighthouse 90+. Nem kell plugint vadászni, hogy az oldalad megfeleljen a sztenderdeknek.',                                     Demo: DemoLighthouse, span: 1 },
  { icon: <Globe />,   title: 'Hosting nélküli hosting',                         body: 'Nincs szerver, nem kell rendszergazda. A Framer cloud üzemelteti: automatikus SSL, global CDN, 99.9% uptime.',                                            Demo: DemoCDN,        span: 1 },
];

export default function BenefitsRich() {
  return (
    <section className="ff-section paper" id="benefits">
      <div className="ff-container">
        <Reveal>
          <div className="ff-section-head">
            <div>
              <div className="ff-eyebrow" style={{ color: 'var(--c-orange-600)' }}>MIÉRT A FRAMER?</div>
              <TypewriterReveal>A FRAMER NEM CSAK<br />GYORS.<br /><span style={{ color: 'var(--c-orange-600)' }}>OKOS IS.</span></TypewriterReveal>
            </div>
            <p className="lead">Miért a Framert választjuk a legtöbb no-code design & fejlesztés projektünkhöz? Összegyűjtöttük a 6 legfontosabb okot.</p>
          </div>
        </Reveal>
        <div className="bdemo-grid">
          {BENEFIT_CARDS.map((b, i) => {
            const Demo = b.Demo;
            return (
              <article key={i} className={`bdemo-card span-${b.span}`}>
                <div className="bdemo-card-head">
                  <div className="ic">{b.icon}</div>
                  <div>
                    <h4>{b.title}</h4>
                    <p>{b.body}</p>
                  </div>
                </div>
                <div className="bdemo-card-body"><Demo /></div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export { useInView, useHover, Gauge };
```

> The five `useHover`/`useInView`/`Gauge` exports at the bottom let later tasks import the helpers if they need to extract demos. They're internal-use; nothing outside this file should import them.

> **Why placeholder demo functions now:** keeps Task 3 commit independently buildable (no missing references), so each subsequent demo task is a small targeted commit.

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: build succeeds. (`BenefitsRich` isn't yet imported by `App.jsx`, so it's a dead export — fine.)

- [ ] **Step 3: Commit**

```bash
git add src/components/BenefitsRich.jsx
git commit -m "feat(benefits): scaffold BenefitsRich with section header and card list"
```

---

## Task 4: Implement DemoLanding

**Files:**
- Modify: `src/components/BenefitsRich.jsx` (replace placeholder `DemoLanding`)

A miniature browser frame whose page rows (hero / stats / cards / footer-CTA) cascade in. While idle the section auto-cycles with a 1.4s `setInterval`. While hovered the active row index advances faster via a derived value off `Date.now()`.

- [ ] **Step 1: Replace the `DemoLanding` placeholder**

In `src/components/BenefitsRich.jsx`, find:

```jsx
function DemoLanding()    { return <div className="bdemo bdemo-landing" />; }
```

Replace with:

```jsx
function DemoLanding() {
  const [ref, inView] = useInView();
  const [hover, hoverHandlers] = useHover();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => setTick(t => (t + 1) % 4), 1400);
    return () => clearInterval(id);
  }, [inView]);

  const active = hover ? Math.floor(Date.now() / 350) % 4 : tick;
  return (
    <div ref={ref} {...hoverHandlers} className="bdemo bdemo-landing">
      <div className="bdemo-bezel">
        <div className="bdemo-chrome">
          <span /><span /><span />
          <div className="bdemo-url">framerfejlesztő.hu</div>
        </div>
        <div className="bdemo-page">
          <div className={`bd-row hero ${active >= 0 ? 'on' : ''}`}>
            <div className="h1" />
            <div className="h2" />
            <div className="cta" />
          </div>
          <div className={`bd-row stats ${active >= 1 ? 'on' : ''}`}>
            <div><b>120+</b><span>projekt</span></div>
            <div><b>5–10</b><span>nap</span></div>
            <div><b>99</b><span>Lighthouse</span></div>
          </div>
          <div className={`bd-row cards ${active >= 2 ? 'on' : ''}`}>
            <div /><div /><div />
          </div>
          <div className={`bd-row footer ${active >= 3 ? 'on' : ''}`}>
            <div className="ftr-cta" />
          </div>
        </div>
      </div>
      <div className="bdemo-caption">Hős → Stat → Kártya → CTA — minden a helyén.</div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/BenefitsRich.jsx
git commit -m "feat(benefits): implement landing-cascade demo card"
```

---

## Task 5: Implement DemoEdit

**Files:**
- Modify: `src/components/BenefitsRich.jsx` (replace placeholder `DemoEdit`)

Typewriter that cycles through three CMS headlines. State machine: `phase 0 = idle` (typed full target visible) → pause → `phase 1 = deleting` → empty → `phase 2 = typing next target` → repeat.

> Note: this is a literal port of the handoff implementation. The closure inside `setText` calls `setTimeout(tick, …)`, so the recursion is via the timer chain, not React renders. Don't refactor — the port works.

- [ ] **Step 1: Replace the `DemoEdit` placeholder**

In `src/components/BenefitsRich.jsx`, find:

```jsx
function DemoEdit()       { return <div className="bdemo bdemo-edit" />; }
```

Replace with:

```jsx
function DemoEdit() {
  const [ref, inView] = useInView();
  const [text, setText] = useState('Új kampány indul kedden');
  const [editing, setEditing] = useState(false);
  const [phase, setPhase] = useState(0); // 0=idle, 1=delete, 2=type
  const targets = [
    'Új kampány indul kedden',
    'Black Friday — most 50% kedvezmény',
    'Új termékkollekció: Tavasz 2026',
  ];
  const idx = useRef(0);

  useEffect(() => {
    if (!inView) return;
    let timer;
    const tick = () => {
      const target = targets[idx.current];
      setText(prev => {
        if (prev === target) {
          timer = setTimeout(() => {
            idx.current = (idx.current + 1) % targets.length;
            setEditing(true); setPhase(1);
            tick();
          }, 1700);
          return prev;
        }
        if (phase === 1) {
          if (prev.length === 0) { setPhase(2); return prev; }
          timer = setTimeout(tick, 35);
          return prev.slice(0, -1);
        }
        if (prev.length < target.length) {
          timer = setTimeout(tick, 60);
          return target.slice(0, prev.length + 1);
        }
        timer = setTimeout(() => { setEditing(false); }, 800);
        return prev;
      });
    };
    timer = setTimeout(tick, 600);
    return () => { clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, phase]);

  return (
    <div ref={ref} className="bdemo bdemo-edit">
      <div className="bdemo-cms">
        <div className="bdemo-cms-head">
          <span className="dot" /><span className="dot" /><span className="dot" />
          <span className="bdemo-cms-tab">CMS / Hero / headline</span>
          <span className="bdemo-cms-save">{editing ? 'Mentés…' : 'Mentve ✓'}</span>
        </div>
        <div className="bdemo-cms-body">
          <div className="bdemo-cms-label">HEADLINE</div>
          <div className="bdemo-cms-input">
            <span className="txt">{text}</span>
            {editing && <span className="caret" />}
          </div>
          <div className="bdemo-cms-row">
            <div className="bdemo-cms-chip"><span className="dot-g" /> Élő</div>
            <div className="bdemo-cms-meta">v 2.14 · 4 mp után publikál</div>
          </div>
        </div>
      </div>
      <div className="bdemo-caption">Marketinges szerkeszti. Te csak nézed.</div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/BenefitsRich.jsx
git commit -m "feat(benefits): implement CMS edit typewriter demo card"
```

---

## Task 6: Implement DemoAnimations

**Files:**
- Modify: `src/components/BenefitsRich.jsx` (replace placeholder `DemoAnimations`)

Three cells side-by-side: a 3D-tilt card driven by mousemove (rotateX/Y derived from cursor), a "magnetic" CTA button that translates ~35% of the cursor offset inside its area, and an auto-marquee that runs only when the cell is in view.

- [ ] **Step 1: Replace the `DemoAnimations` placeholder**

In `src/components/BenefitsRich.jsx`, find:

```jsx
function DemoAnimations() { return <div className="bdemo bdemo-anim" />; }
```

Replace with:

```jsx
function DemoAnimations() {
  const [ref, inView] = useInView();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);
  const [magnet, setMagnet] = useState({ x: 0, y: 0 });
  const btnAreaRef = useRef(null);

  const onTiltMove = (e) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: -py * 14, y: px * 18 });
  };
  const onTiltLeave = () => setTilt({ x: 0, y: 0 });
  const onMagnet = (e) => {
    if (!btnAreaRef.current) return;
    const r = btnAreaRef.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    setMagnet({ x: (e.clientX - cx) * 0.35, y: (e.clientY - cy) * 0.35 });
  };
  const onMagnetLeave = () => setMagnet({ x: 0, y: 0 });

  return (
    <div ref={ref} className="bdemo bdemo-anim">
      <div className="bdemo-anim-grid">
        <div className="bdemo-anim-cell">
          <div
            ref={cardRef}
            className="bdemo-tilt-card"
            onMouseMove={onTiltMove}
            onMouseLeave={onTiltLeave}
            style={{ transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
          >
            <div className="bdt-shine" />
            <div className="bdt-stamp">22<sup>!</sup></div>
            <div className="bdt-label">3D TILT</div>
          </div>
          <span className="bdemo-anim-tag">Mozgasd</span>
        </div>
        <div className="bdemo-anim-cell">
          <div
            ref={btnAreaRef}
            className="bdemo-magnet-area"
            onMouseMove={onMagnet}
            onMouseLeave={onMagnetLeave}
          >
            <button
              className="bdemo-magnet-btn"
              style={{ transform: `translate(${magnet.x}px, ${magnet.y}px)` }}
            >Beszéljük meg →</button>
          </div>
          <span className="bdemo-anim-tag">Mágneses</span>
        </div>
        <div className="bdemo-anim-cell">
          <div className={`bdemo-marquee ${inView ? 'on' : ''}`}>
            <div className="bdm-track">
              <span>FRAMER</span><span>★</span><span>22!</span><span>HUNGARY</span>
              <span>FRAMER</span><span>★</span><span>22!</span><span>HUNGARY</span>
            </div>
          </div>
          <span className="bdemo-anim-tag">Marquee</span>
        </div>
      </div>
      <div className="bdemo-caption">Pár kattintás. Nem több órányi munka.</div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/BenefitsRich.jsx
git commit -m "feat(benefits): implement animations showcase demo card"
```

---

## Task 7: Implement DemoPricing

**Files:**
- Modify: `src/components/BenefitsRich.jsx` (replace placeholder `DemoPricing`)

Three horizontal bars whose `width` transitions from `0%` → target `fill` percentage when the section is in view, staggered with `transitionDelay`. Shows `Ft` formatted amounts and a `−89%` callout in the foot.

- [ ] **Step 1: Replace the `DemoPricing` placeholder**

In `src/components/BenefitsRich.jsx`, find:

```jsx
function DemoPricing()    { return <div className="bdemo bdemo-price" />; }
```

Replace with:

```jsx
function DemoPricing() {
  const [ref, inView] = useInView();
  const items = [
    { label: 'Hagyományos ügynökség', amount: 8500000, fill: 1,    color: 'var(--c-slate-400)' },
    { label: 'In-house dev + designer', amount: 4200000, fill: 0.49, color: 'var(--c-slate-500)' },
    { label: 'framerfejlesztő.hu',     amount: 950000,  fill: 0.11, color: 'var(--c-orange-600)', highlight: true },
  ];
  const fmt = (n) => n.toLocaleString('hu-HU') + ' Ft';
  return (
    <div ref={ref} className="bdemo bdemo-price">
      <div className="bdemo-price-head">
        <span>Egy landing page költsége</span>
        <span className="bdemo-price-tag">éves ÁTLAG</span>
      </div>
      <div className="bdemo-price-bars">
        {items.map((it, i) => (
          <div key={i} className={`bdp-row ${it.highlight ? 'highlight' : ''}`}>
            <div className="bdp-label">{it.label}</div>
            <div className="bdp-track">
              <div
                className="bdp-fill"
                style={{
                  width: inView ? (it.fill * 100) + '%' : 0,
                  background: it.color,
                  transitionDelay: (i * 0.18) + 's',
                }}
              >
                <span className="bdp-amount">{fmt(it.amount)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bdemo-price-foot">
        <span className="bdp-save">−89%</span>
        <span>versus ügynökség, ugyanaz a minőség</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/BenefitsRich.jsx
git commit -m "feat(benefits): implement pricing comparison demo card"
```

---

## Task 8: Implement DemoLighthouse

**Files:**
- Modify: `src/components/BenefitsRich.jsx` (replace placeholder `DemoLighthouse`)

Four `Gauge` SVGs (using the `Gauge` helper already added in Task 3) animating from 0 to their score on viewport entry, plus a small FCP/LCP/CLS metrics row.

- [ ] **Step 1: Replace the `DemoLighthouse` placeholder**

In `src/components/BenefitsRich.jsx`, find:

```jsx
function DemoLighthouse() { return <div className="bdemo bdemo-lh" />; }
```

Replace with:

```jsx
function DemoLighthouse() {
  const [ref, inView] = useInView();
  const scores = [
    { label: 'Performance',   value: 99,  color: '#4BC292' },
    { label: 'Accessibility', value: 96,  color: '#4BC292' },
    { label: 'Best practices', value: 100, color: '#4BC292' },
    { label: 'SEO',           value: 98,  color: '#4BC292' },
  ];
  return (
    <div ref={ref} className="bdemo bdemo-lh">
      <div className="bdemo-lh-head">
        <span className="bdemo-lh-pill">LIGHTHOUSE</span>
        <span>framerfejlesztő.hu — átlagos pontszámok</span>
      </div>
      <div className="bdemo-lh-grid">
        {scores.map((s, i) => (
          <Gauge key={i} value={inView ? s.value : 0} label={s.label} color={s.color} delay={i * 0.18} />
        ))}
      </div>
      <div className="bdemo-lh-foot">
        <div className="lf-bar"><span className="lf-bar-fill" style={{ width: inView ? '12%' : 0 }} /></div>
        <div className="lf-meta">
          <span><b>0.8s</b> First Contentful Paint</span>
          <span><b>1.2s</b> Largest Contentful Paint</span>
          <span><b>0</b> Cumulative Layout Shift</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/BenefitsRich.jsx
git commit -m "feat(benefits): implement Lighthouse-gauges demo card"
```

---

## Task 9: Implement DemoCDN

**Files:**
- Modify: `src/components/BenefitsRich.jsx` (replace placeholder `DemoCDN`)

A stylised dotted world-map SVG (320×140 viewBox) with 6 nodes that cycle highlight on a 1.3s tick, plus a pulsing "99.99% uptime" status pill.

- [ ] **Step 1: Replace the `DemoCDN` placeholder**

In `src/components/BenefitsRich.jsx`, find:

```jsx
function DemoCDN()        { return <div className="bdemo bdemo-cdn" />; }
```

Replace with:

```jsx
function DemoCDN() {
  const [ref, inView] = useInView();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => setTick(t => t + 1), 1300);
    return () => clearInterval(id);
  }, [inView]);

  const nodes = [
    { x: 40,  y: 60,  label: 'SF'  },
    { x: 90,  y: 50,  label: 'NYC' },
    { x: 145, y: 56,  label: 'LON' },
    { x: 165, y: 60,  label: 'BUD' },
    { x: 230, y: 78,  label: 'SGP' },
    { x: 260, y: 110, label: 'SYD' },
  ];
  return (
    <div ref={ref} className="bdemo bdemo-cdn">
      <div className="bdemo-cdn-head">
        <span className="bdemo-cdn-status"><i className="dot-pulse" /> 99.99% uptime · ma</span>
        <span className="bdemo-cdn-meta">automatikus SSL · global CDN · 0 üzemeltetés</span>
      </div>
      <div className="bdemo-cdn-map">
        <svg viewBox="0 0 320 140" preserveAspectRatio="xMidYMid meet">
          <g fill="rgba(255,255,255,0.08)">
            {Array.from({ length: 80 }).map((_, i) => {
              const x = (i % 20) * 16 + 8;
              const y = Math.floor(i / 20) * 28 + 14;
              const isLand = (
                (x < 80 && y > 28 && y < 100) ||
                (x > 80 && x < 175 && y > 24 && y < 90) ||
                (x > 175 && x < 280 && y > 28 && y < 95) ||
                (x > 200 && x < 270 && y > 95)
              );
              return isLand ? <circle key={i} cx={x} cy={y} r="1.6" /> : null;
            })}
          </g>
          {nodes.slice(0, -1).map((n, i) => {
            const m = nodes[i + 1];
            const mx = (n.x + m.x) / 2;
            const my = (n.y + m.y) / 2 - 12;
            const active = (tick % nodes.length) === i;
            return (
              <path
                key={i}
                d={`M ${n.x} ${n.y} Q ${mx} ${my} ${m.x} ${m.y}`}
                stroke={active ? 'var(--c-orange-600)' : 'rgba(255,255,255,0.18)'}
                strokeWidth={active ? '1.5' : '1'} fill="none"
                strokeDasharray={active ? '4 3' : '0'}
              />
            );
          })}
          {nodes.map((n, i) => {
            const active = (tick % nodes.length) === i;
            return (
              <g key={i}>
                <circle
                  cx={n.x} cy={n.y} r={active ? 7 : 4}
                  fill={active ? 'var(--c-orange-600)' : '#fff'}
                  opacity={active ? 0.25 : 0.5}
                  style={{ transition: 'all .4s' }}
                />
                <circle cx={n.x} cy={n.y} r="2.5" fill={active ? 'var(--c-orange-600)' : '#fff'} />
                <text x={n.x} y={n.y - 8} fontSize="6" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontWeight="700" letterSpacing="0.5">{n.label}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="bdemo-cdn-foot">
        <span><b>{nodes.length * 47}+</b> edge node</span>
        <span><b>~28ms</b> EU latency</span>
        <span><b>auto</b> SSL</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/BenefitsRich.jsx
git commit -m "feat(benefits): implement CDN-map demo card"
```

---

## Task 10: Wire BenefitsRich into App and remove old Benefits

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/Sections.jsx`

This is the actual swap. After this task the page renders the new section.

- [ ] **Step 1: Update App.jsx imports and JSX**

Open `src/App.jsx`. Replace the import block:

```jsx
import HeroA from './components/HeroA';
import StickyNav from './components/StickyNav';
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
import CustomCursor from './components/animations/CustomCursor';
```

with:

```jsx
import HeroA from './components/HeroA';
import StickyNav from './components/StickyNav';
import {
  ProblemSolution,
  ProcessSection,
  VibeCodingSection,
  TrustSection,
  Portfolio,
  FAQSection,
  FinalCTA,
  Footer,
} from './components/Sections';
import BenefitsRich from './components/BenefitsRich';
import CustomCursor from './components/animations/CustomCursor';
```

Then replace `<Benefits />` with `<BenefitsRich />` in the same slot:

```jsx
      <ProcessSection />
      <BenefitsRich />
      <VibeCodingSection />
```

- [ ] **Step 2: Remove `Benefits` and `BENEFITS` from Sections.jsx**

Open `src/components/Sections.jsx`.

Delete the `Benefits (grid)` block (the comment banner, the `BENEFITS` array, and the entire `export function Benefits() { … }`). It's the section between the line `/* ═════════ Benefits (grid) ═════════ */` and the next banner `/* ═════════ Vibe-Coding — PhenoGyde Showcase ═════════ */` — remove the entire `Benefits` block, but keep the `Vibe-Coding` banner and what follows.

After deletion, audit the icon import on line 3:

```jsx
import { Arrow, ArrowUpRight, Plus, Rocket, Pencil, Leaf, Bolt, Sparkle, Cloud } from './Icons';
```

For each of `Rocket`, `Pencil`, `Leaf`, `Bolt`, `Sparkle`, `Cloud`: search the rest of `Sections.jsx` for the identifier (e.g. `Grep` for `\bRocket\b`). If a name has zero remaining references, drop it from the import. Keep `Arrow`, `ArrowUpRight`, `Plus` (used by ProcessSection / FAQSection / FinalCTA).

Expected resulting import (verify by searching for each name before deleting):

```jsx
import { Arrow, ArrowUpRight, Plus } from './Icons';
```

> If your search shows any of `Rocket/Pencil/Leaf/Bolt/Sparkle/Cloud` is still referenced (e.g. inside a future helper you missed), keep that name in the import. The rule is: drop only what is genuinely unused.

- [ ] **Step 3: Verify build passes**

Run: `npm run build`
Expected: build succeeds with no errors. Specifically, no "X is defined but never used" or "Y is not defined" errors.

- [ ] **Step 4: Visual smoke test**

Run: `npm run dev` (background it, or open in another shell).

Open the site. Scroll to the "Miért a Framer?" section and verify, in order:

1. Section header still says **MIÉRT A FRAMER?** eyebrow + the typewriter headline.
2. 6 dark cards rendered in a 4-column grid: cards 1, 2, 5, 6 are half-width; cards 3 (Animations) and 4 (Pricing) span the full row.
3. **Card 1 (Landing):** rows cascade in, repeats every ~1.4s.
4. **Card 2 (Edit):** text deletes itself and re-types through 3 different headlines.
5. **Card 3 (Animations):** moving the mouse over the gradient card tilts it; the orange "Beszéljük meg →" button follows the cursor inside its area; the violet marquee strip auto-scrolls.
6. **Card 4 (Pricing):** three bars grow in from the left when scrolled into view; the −89% callout shows in the foot.
7. **Card 5 (Lighthouse):** four green gauges sweep from 0 to 99/96/100/98.
8. **Card 6 (CDN):** dotted world-map with a pulsing green status pill; an orange node + arc cycles through SF → NYC → LON → BUD → SGP → SYD.

Resize the window to ~1024px wide. The grid collapses to 2 cols and every card becomes full-row.

Open DevTools console: no errors, no missing-key warnings, no unknown-CSS-var warnings.

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx src/components/Sections.jsx
git commit -m "feat(benefits): swap to interactive BenefitsRich and remove legacy cards"
```

---

## Self-Review

**Spec coverage:** Each spec section maps to a task —
- "Card layout" → CSS in Task 2 (`.bdemo-grid`, `.bdemo-card.span-1/2`, `@media (max-width:1100px)`).
- Demos 1–6 → Tasks 4–9.
- "File plan" → file map at the top, files touched in Tasks 1, 2, 3, 10.
- "Verification" → Task 10 step 4 visual checklist.
- "Risks / non-issues" → noted (two `Bolt` usages preserved by design; old `Benefits` removal addressed in Task 10 step 2).

**Placeholder scan:** No "TBD" / "implement later" / "appropriate error handling" / "similar to Task N" placeholders found. Every code-changing step contains the actual code.

**Type/identifier consistency:**
- `useInView` (no args / one optional arg) — declared once in Task 3, used in Tasks 4, 5, 6, 7, 8, 9. ✔
- `useHover` — declared once in Task 3, used only in Task 4. ✔
- `Gauge({ value, label, color, delay })` — declared once in Task 3, used in Task 8. ✔
- `BENEFIT_CARDS` field shape (`icon`, `title`, `body`, `Demo`, `span`) — defined once in Task 3, demo function names (`DemoLanding` … `DemoCDN`) match the placeholders defined in Task 3 and replaced in Tasks 4–9. ✔
- Icons used: `Rocket, Pencil, Bolt, Leaf, Globe` — `Globe` added in Task 1, others already in `Icons.jsx`. ✔
- Removal in Task 10 keeps the icons that are still used elsewhere in `Sections.jsx`; drop rule explicit. ✔

No issues found.

---

**Plan complete and saved to `docs/superpowers/plans/2026-04-29-benefits-interactive-demos.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks. Best for keeping the main thread's context window light across 10 tasks.

**2. Inline Execution** — I run the tasks here, batched with a checkpoint after Task 3 (scaffold) and Task 10 (final swap). Faster end-to-end since the changes are small and tightly coupled to one file.

Which approach?