# Sticky Scroll Navbar + Sidebar Menu

**Goal:** When the user scrolls past the main navbar, a compact sticky bar appears at the top with the 22 DESIGN logo (left) and an orange hamburger button (right). The hamburger opens a right-side sidebar containing the 5 nav links and CTA button.

## Scroll Behavior

- The existing `FFNav` in `HeroA.jsx` is `position: relative` and scrolls away naturally — no changes to it.
- A new `StickyNav` component is rendered alongside `FFNav`. It is `position: fixed; top: 0` and hidden by default.
- When the user scrolls past ~80px (roughly the height of `FFNav`), `StickyNav` slides in from the top via a CSS transform transition.
- When the user scrolls back to top (below the threshold), it slides back out.
- Scroll detection: `useEffect` with a scroll event listener and a boolean state (`isScrolled`). Threshold: 80px.

## Sticky Bar

- Full viewport width, white background, `z-index: 50`.
- Height: ~56px, padding: `12px 30px`.
- Max-width content: `1200px`, centered.
- **Left:** 22 DESIGN logo — the text "22" in the existing brand font inside a dark `--c-midnight-950` rounded-rect badge (~48x48px). This is a simplified inline logo, not the full `FFLogo` component (which includes the "/framer.fejlesztő.hu" sub-brand).
- **Right:** Orange (`--c-orange-600`) rounded-rect button (~44x44px, border-radius ~10px) containing a white 3-line hamburger icon (SVG, 3 horizontal lines).
- Subtle bottom border: `1px solid rgba(15,30,60,0.08)`.
- Slide-in animation: `transform: translateY(-100%)` → `translateY(0)`, transition `0.3s ease-out`.

## Sidebar Menu

- Opens from the **right** when hamburger is clicked.
- **Overlay:** Full-screen, `background: rgba(15,30,60,0.4)`, `z-index: 51`, click to close.
- **Panel:** `position: fixed; right: 0; top: 0; height: 100vh; width: 320px`, white background, `z-index: 52`.
- Slide-in: `transform: translateX(100%)` → `translateX(0)`, transition `0.3s ease-out`.
- **Close button:** Top-right corner of the panel, X icon.
- **Content:** 
  - 5 nav links stacked vertically, styled as full-width dark midnight pills (same style as main nav links but larger padding, `padding: 14px 24px`).
  - Links: Probléma (#problem), Folyamat (#process), Framer (#benefits), Munkáink (#works), GYIK (#faq).
  - CTA button at bottom: "Beszéljük meg" using `FFButton variant="dark"`.
- Clicking a nav link closes the sidebar.
- Pressing Escape closes the sidebar.
- `body` scroll is locked while sidebar is open (`overflow: hidden` on body).

## File Structure

- **New:** `src/components/StickyNav.jsx` — StickyNav + SidebarMenu components (~80-100 lines total). Both components in one file since they share open/close state.
- **Modify:** `src/styles/main.css` — Add sticky nav, sidebar, overlay CSS.
- **Modify:** `src/components/HeroA.jsx` — Import and render `StickyNav` alongside `FFNav`.

## What Stays the Same

- `FFNav` component — untouched.
- `FFLogo`, `FFButton` — reused as-is (FFButton for sidebar CTA).
- `Primitives.jsx` — no changes.
- All existing nav link targets and labels.
