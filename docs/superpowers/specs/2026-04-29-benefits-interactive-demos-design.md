---
name: Benefits — interactive USP demos
description: Replace the six static USP cards under "A FRAMER NEM CSAK GYORS, OKOS IS" with the interactive `BenefitsRich` variant from the FF.hu handoff bundle. Section header is preserved.
status: draft
---

# Benefits — interactive USP demos

## Goal

Replace the six static icon+title+body cards in the "Miért a Framer?" section with the `BenefitsRich` variant from the FF.hu handoff bundle (`ff-hu-22-design-system/project/FFBenefitDemos.jsx` + `benefit-demos.css`). Each card now contains a self-contained mini-demo that auto-loops on viewport entry.

The section header (eyebrow, headline, lead, with `Reveal` + `TypewriterReveal` wrappers) is unchanged.

## Scope

In scope (the only things that change):
- The card grid + card markup directly below the section header inside `#benefits`.
- A new icon (`Globe`) added to `src/components/Icons.jsx` because card 6 (CDN) requires it and it isn't currently exported.

Out of scope:
- Section eyebrow, headline (`A FRAMER NEM CSAK GYORS. OKOS IS.`), lead copy.
- Hero, ProblemSolution, ProcessSection, VibeCoding, Trust, Portfolio, FAQ, FinalCTA, Footer.
- Design tokens (`tokens.css`), shared animations (`animations.css`).
- Old `Benefits` data/function once removed (no compatibility shim required — single consumer is `App.jsx`).

## Card layout (from handoff)

- Container: `.bdemo-grid` — 4-column CSS grid, 24px gap, dark cards on the existing paper section.
- Cards 1, 2, 5, 6: `span-1` (= 2 grid cols → 2 cards per row).
- Cards 3 (Animations), 4 (Pricing): `span-2` (= 4 grid cols → full row).
- ≤1100px breakpoint: grid collapses to 2 cols and all cards span the full row.
- Card chrome: midnight-950 background, soft inner shine, rounded 22px, padding 28px. Header row = icon tile + h4 + 1-line body. Demo body = inset rounded panel, min-height 220px.

## Six demos

Each demo is a small React component that uses `IntersectionObserver` to start its animation when scrolled into view. All visuals use existing CSS tokens (`--c-midnight-950`, `--c-orange-500/600`, `--c-violet-500/600`, `--c-mint-500`, `--c-slate-400/500`, `--ff-display`, `--ff-body`, `--ease-out`).

1. `DemoLanding` — mock browser; rows (hero / stats / cards / footer-CTA) fade-up in sequence on a 1.4s tick. Hover speeds the cycle up. Caption: `Hős → Stat → Kártya → CTA — minden a helyén.`
2. `DemoEdit` — typewriter cycling through 3 CMS headlines (delete → retype). "Mentés…/Mentve ✓" pill flips during edits. Caption: `Marketinges szerkeszti. Te csak nézed.`
3. `DemoAnimations` — 3-up grid: 3D-tilt card driven by mouse, magnetic CTA, auto-scrolling marquee. Caption: `Pár kattintás. Nem több órányi munka.`
4. `DemoPricing` — three horizontal bars animating their `width` from 0 → target on view, staggered by 0.18s. Footer shows `−89%` callout.
5. `DemoLighthouse` — four SVG gauges (`stroke-dasharray` transition from 0 → score) for Performance / Accessibility / Best practices / SEO, plus a small FCP/LCP/CLS metrics row.
6. `DemoCDN` — stylised dotted world-map SVG (320×140 viewBox) with 6 nodes (SF, NYC, LON, BUD, SGP, SYD); a 1.3s tick advances the active arc + node. Pulsing "99.99% uptime" status pill.

Hungarian copy in card titles/bodies follows the handoff (`FFBenefitDemos.jsx`, `BENEFIT_CARDS`) verbatim.

## File plan

1. **New** `src/components/BenefitsRich.jsx`
   - Exports `BenefitsRich` (default).
   - Inlines the 6 demo components and the `Gauge` helper.
   - Internal hooks: `useInView` (IntersectionObserver, threshold 0.4) and inline hover state.
   - Uses existing `Reveal` and `TypewriterReveal` wrappers for the section header so it matches the rest of the site's reveal rhythm.
   - Imports icons from `./Icons` (`Rocket`, `Pencil`, `Bolt`, `Leaf`, `Globe`).

2. **New** `src/styles/benefit-demos.css`
   - Verbatim port of `ff-hu-22-design-system/project/benefit-demos.css`.
   - All custom-property references already exist in `tokens.css`.

3. **Edit** `src/components/Icons.jsx`
   - Add `Globe` (stroke-style SVG matching the existing icon family — viewBox 24, strokeWidth 2). Used by `DemoCDN` card head.

4. **Edit** `src/main.jsx`
   - Add `import './styles/benefit-demos.css'` after the existing CSS imports.

5. **Edit** `src/App.jsx`
   - Replace `Benefits` import with `BenefitsRich` from `./components/BenefitsRich`.
   - Replace `<Benefits />` with `<BenefitsRich />` in the same slot.

6. **Edit** `src/components/Sections.jsx`
   - Remove the now-unused `Benefits` export, the `BENEFITS` data array, and the icon imports that become unused (`Rocket`, `Pencil`, `Leaf`, `Bolt`, `Sparkle`, `Cloud`) — keep any that are still referenced elsewhere in the file.

## Verification

- `npm run build` succeeds (Vite build → no missing imports / unresolved CSS vars).
- `npm run dev` shows the section under `#benefits` rendering 6 dark cards with animated demos. Spot-check each demo:
  - Landing: rows cascade in, repeat.
  - Edit: text deletes/retypes through 3 headlines.
  - Animations: card tilts on mousemove, magnet button follows cursor inside its area, marquee auto-scrolls.
  - Pricing: bars grow on scroll into view.
  - Lighthouse: gauges sweep from 0 to score on scroll into view.
  - CDN: pulsing dot, active arc cycles through nodes.
- Resize to ~1024px: grid collapses to 2 cols, every card full row.
- No console warnings about missing keys, missing icons, or unknown CSS vars.

## Risks / non-issues

- **Two `Bolt` usages** (cards 3 + 5 both use Bolt). That matches the handoff intent — flagged but accepted. Anim card uses Bolt for "speed of building", SEO card uses Bolt for "speed of loading".
- **`useReveal`** in the handoff `FullSite` wrapper is not needed here — we're only porting the cards, not the full-site stitching helper.
- **No data deps:** demos are self-contained; no API, no shared state. Removing them or the section can't break anything else.
