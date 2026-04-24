# Vibe-Coding Section — Design Spec

**Date:** 2026-04-24
**Status:** Approved

## Overview

A new full-width section for the 22.design landing page that introduces vibe-coding as a legitimate capability. The core message is provocative honesty: "We're a Framer agency telling you that sometimes you don't need Framer." The PhenoGyde ACQ Riport 2026 serves as concrete proof.

## Position in Page Flow

Between **Benefits** (#4, Framer advantages) and **Trust** (#5, social proof). This placement creates a natural pivot: after selling Framer as the default tool, the page surprises the visitor by saying "and when the project calls for it, we go even simpler."

## Tone & Framing

**Provocative/contrarian.** The section earns trust through honesty — a design agency that doesn't push its primary tool when it's not the right fit. This positions 22.design as project-first, not tool-first.

## Color Territory — Emerald Deep

A new color palette that doesn't exist elsewhere on the page, signaling "this is something different."

- **Background:** `linear-gradient(170deg, #064E3B 0%, #0A2F1F 50%, #0F1B3D 100%)` — deep forest green fading into the existing midnight
- **Accent color:** `#4BC292` (mint — exists in the token palette but unused as a section-defining color)
- **Text:** White primary, `rgba(255,255,255,0.72)` for body, `rgba(255,255,255,0.45)` for labels
- **Rationale:** Cool emerald creates a strong visual break from the warm violet/orange sections above and below. The gradient's tail anchoring into `#0F1B3D` connects it back to the site's existing dark palette, preventing it from feeling foreign.

## Content Structure

### Beat 1 — Headline Block (top, left-aligned)

- **Eyebrow:** `NEM MINDEN PROJEKTHEZ KELL FRAMER` — mint color, 11px, 800 weight, uppercase, with `::before` line decoration (matching existing eyebrow pattern)
- **Headline:** `NÉHA AZ EGYSZERŰBB DÖNTÉS A JÓ DÖNTÉS` — Archivo Black, uppercase, with "EGYSZERŰBB" in mint accent
- **Subtext:** ~2 sentences:
  > Framer ügynökség vagyunk — és ezt mondjuk: **nem mindig a Framer a válasz.** Amikor ügyfelünk 150 oldalas interaktív piackutatást kért tele 3D térképekkel, élő grafikonokkal és komplex adatvizualizációval, nem erőltettük a Framert. AI-gyorsított fejlesztéssel építettük meg — mert a jó döntés az, ami a projekthez illik, nem ami a portfóliónkhoz.

### Beat 2 — PhenoGyde Showcase (two-column)

**Left column (info + stats):**
- Client label: `ÜGYFÉL` (muted uppercase)
- Client name: `PhenoGyde` (Archivo Black, 22px)
- Project name: `ACQ Riport 2026 — Magyarország` (muted)
- Description: ~1-2 sentences about the report scope (23 providers, mystery shopping, merchant journey analysis, competitive scoring)
- Stats grid (2x2):
  - `150+` Oldal
  - `100+` Grafikon
  - `10+` 3D térkép
  - `23` Szolgáltató
- Each stat has a left mint border accent, Archivo Black number, muted uppercase label

**Right column (visual proof):**
- Real screenshot(s) from the PhenoGyde ACQ Report displayed inside a browser-frame mockup
- Browser frame: dark background, dot-trio bar, URL showing `phenogyde.com/acq-riport-2026`
- The screenshot should show a data-rich page (charts, sidebar navigation, heatmaps) to convey the complexity and quality of the deliverable

### Beat 3 — CTA (bottom)

- Standard `Pitchelj minket` button
- Mint green fill (`#4BC292`), dark text, neobrutalist box-shadow (`4px 4px 0 0 #000`), pill border-radius
- Same interaction pattern as other CTAs on the page (shadow shift on hover)

## CSS Implementation Notes

- New section modifier class: `.ff-section.emerald` with the gradient background and mint accent overrides
- Follows existing `.ff-section` padding and max-width conventions
- The browser-frame mockup is a purely decorative component — styled div with border-radius, subtle border, and box-shadow
- Screenshots are static `.avif` images placed in `public/assets/illustrations/`
- All text uses existing font tokens (`--ff-display`, `--ff-body`)
- Stats use existing eyebrow/label patterns
- Responsive: two-column showcase stacks to single column on mobile (info on top, screenshot below)
- Scroll reveal: `.ff-reveal` class on headline block, stats, and screenshot for staggered entrance

## New Design Tokens

Add to `tokens.css`:
```css
--c-emerald-900: #064E3B;
--c-emerald-800: #0A2F1F;
--grad-emerald: linear-gradient(170deg, #064E3B 0%, #0A2F1F 50%, #0F1B3D 100%);
```

The mint accent (`--c-mint-500: #4BC292`) already exists.

## Component

New component: `VibeCodingSection` — either added to `Sections.jsx` (following the existing pattern of all sections in one file) or as a standalone `VibeCodingSection.jsx` if it grows large enough to warrant separation.

## What This Section Does NOT Include

- No link to the live PhenoGyde report
- No structural/layout breaks (no horizontal scroll, no parallax, no split-screen)
- No new animations beyond the standard `.ff-reveal` scroll entrance
- No "vibe-coding" jargon in the user-facing copy — the concept is communicated through the narrative, not the label
