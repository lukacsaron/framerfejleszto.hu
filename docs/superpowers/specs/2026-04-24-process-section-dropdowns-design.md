# Process Section — Expandable Dropdown Steps

## Summary

Transform the Process section's 3 step cards into accordion-style dropdowns that reveal subprocess details (bullet sub-steps + timeline badge) when clicked. This gives prospective clients visibility into the real workflow depth without cluttering the summary view.

## Interaction Model

- **Accordion** — one step open at a time; clicking another closes the current
- **Step 01 starts open** on page load (featured/colored state)
- **Clicking anywhere on a step card** toggles it (not just the arrow)
- The **featured color** (orange/violet/mint) follows whichever step is open
- **Arrow rotation**: 0deg → 90deg (right → down) via spring animation (`type: 'spring', damping: 15, stiffness: 200`)
- **Dropdown panel** animates with `AnimatePresence` — `height: 0 → auto`, `opacity: 0 → 1`, easing `[0.22, 1, 0.36, 1]`, duration 0.3s (same pattern as FAQ section)

## Data Structure

Each step gains two new fields:

```js
{
  n: '01',
  label: 'PLATFORM',
  title: 'Kiválasztjuk a legjobb utat.',
  desc: '...',
  timeline: '1–2 nap',
  steps: [
    'Célok és elvárások tisztázása egy rövid hívás keretében',
    'Platform-ajánlás: Framer, Webflow, vagy egyedi fejlesztés',
    'Tartalom- és funkcióigények felmérése',
    'Projekt ütemterv és mérföldkövek rögzítése',
  ],
}
```

## Content

### 01 PLATFORM — Kiválasztjuk a legjobb utat.

**Timeline:** 1–2 nap

- Célok és elvárások tisztázása egy rövid hívás keretében
- Platform-ajánlás: Framer, Webflow, vagy egyedi fejlesztés
- Tartalom- és funkcióigények felmérése
- Projekt ütemterv és mérföldkövek rögzítése

### 02 DESIGN — UX/UI tervezés, felesleges körök nélkül.

**Timeline:** 1–2 hét

- Wireframe és oldalstruktúra kialakítása
- High-fidelity UI design Figmában (desktop + mobil)
- 2–3 iterációs kör, valós időben egyeztetve
- Design system és komponenskönyvtár átadása

### 03 IMPLEMENTÁCIÓ — Framer-ben életre keltjük.

**Timeline:** 1–2 hét

- Pixel-pontos Framer fejlesztés, reszponzívan
- CMS beállítás a szerkeszthető tartalomhoz
- SEO, analytics, form integráció
- Tesztelés, élesítés, 30 perces onboarding a szerkesztéshez

## Visual Treatment

- **Expanded panel** appears below the existing description text, inside the card
- **Sub-steps**: simple list with small dot/dash markers, inheriting the step's current text color
- **Timeline badge**: small uppercase pill styled like eyebrow labels (11px, 800 weight, 0.16em letter-spacing), positioned top-right of the expanded panel
- **No layout shift** on the number, label, or title when expanding — only the panel area grows
- Collapsed steps retain their current appearance (number, label, title, description all visible)

## Components Changed

- `src/components/Sections.jsx` — `ProcessSection` component and `PROCESS_STEPS` data
- `src/styles/main.css` — new `.ff-proc-detail`, `.ff-proc-detail-list`, `.ff-proc-timeline` styles

## Animation Details

- Arrow rotation: `motion.button` with `animate={{ rotate: isOpen ? 90 : 0 }}`, spring transition
- Panel expand/collapse: `AnimatePresence` wrapping a `motion.div` with `initial={{ height: 0, opacity: 0 }}`, `animate={{ height: 'auto', opacity: 1 }}`, `exit={{ height: 0, opacity: 0 }}`
- Consistent with the existing FAQ accordion pattern
