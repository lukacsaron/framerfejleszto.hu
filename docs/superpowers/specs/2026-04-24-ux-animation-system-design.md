# UX Animation & Microinteraction System Design

**Date:** 2026-04-24
**Approach:** Showpiece Sections (playful + cinematic blend)
**Direction:** Personality-forward microinteractions everywhere, cinematic scroll-driven treatment on 3 key sections

## Tech Stack Additions

| Library | Purpose | Bundle Impact |
|---|---|---|
| **Framer Motion** | Scroll animations, gestures, layout animations, AnimatePresence | ~30kb gzipped |
| **Lenis** | Smooth scroll, scroll velocity exposure | ~5kb gzipped |
| Custom cursor system | React context + `motion.div` | Internal, no dependency |

## Architecture

The animation system is organized in 4 layers, from most global to most specific:

### Layer 1: Foundation

#### Lenis Smooth Scroll
- Wrap the app in a Lenis provider at root level (`App.jsx`)
- Config: `lerp: 0.1`, `duration: 1.2`
- Expose scroll velocity as a CSS custom property `--scroll-velocity` on `document.documentElement`
- Update via `requestAnimationFrame` in the Lenis scroll callback
- Used by other layers for velocity-reactive effects

#### Context-Aware Custom Cursor
A `motion.div` fixed to viewport, rendered at root level. Follows mouse with spring physics (`damping: 25, stiffness: 300`). Uses React context to allow any component to set cursor state.

**Cursor States:**

| Context | Visual | Size | Behavior |
|---|---|---|---|
| Default | White dot, `mix-blend-mode: difference` | 12px | Follows mouse with spring |
| Links / Buttons | Scale up, magnetic pull | 48px | Button shifts 2-4px toward cursor |
| Portfolio cards | Label "Megnezem", blend exclusion | 80px | Label fades in |
| Problem/Solution slider | Horizontal resize arrows | 40px | Icon swap |
| Images | Subtle zoom icon | 60px | Icon appears |
| FAQ items | Plus/arrow icon | 40px | Icon swap |
| Text blocks | Thin vertical line | 6px wide | Shrinks to reading indicator |
| Dark sections | Inverted (dark dot, light blend) | 12px | Auto-detects section background |
| CTA sections | Pulsing ring | 48px | Ring scales in/out on loop |

**Implementation:**
- Use `data-cursor="type"` attributes on elements (e.g. `data-cursor="portfolio"`, `data-cursor="link"`)
- The `CustomCursor` component uses a global `mouseover` listener to read the nearest `data-cursor` attribute from the hovered element (via `event.target.closest('[data-cursor]')`)
- This avoids coupling every component to a cursor context — just add an attribute
- Hidden on touch devices via `@media (pointer: coarse)` — don't render the element at all

#### Magnetic Buttons
- All `FFButton` components wrapped in a magnetic container
- On `mouseMove` within 40px radius: button translates toward cursor position (max 4px displacement)
- Spring back on `mouseLeave`
- Background fill: `clipPath: circle()` expands from cursor entry point on hover
- Scale: `1.03` on hover, `0.97` on press

### Layer 2: Scroll Reveal System

Replace the existing `useReveal` IntersectionObserver hook with a Framer Motion-based reveal system.

#### Base Reveal Component
- `<Reveal>` wrapper component using `motion.div`
- Triggers on `whileInView` with `viewport={{ once: true, amount: 0.12 }}`
- Default animation: `opacity: 0 → 1`, `y: 30 → 0`, `duration: 0.6`
- Accepts `variant` prop for different reveal styles

#### Staggered Children
- `<RevealGroup>` component that uses `staggerChildren: 0.08` in transition
- Wraps sibling elements (cards, list items)
- Each child is a `motion.div` that inherits the stagger timing

#### Per-Element Reveal Variants

| Element | Variant Name | Animation |
|---|---|---|
| Section headings | `maskReveal` | `overflow: hidden` wrapper, text `translateY: 100% → 0` |
| Eyebrow labels | `eyebrow` | Fade in + `letterSpacing: '0.3em' → '0.1em'` |
| Body paragraphs | `fadeUp` | Default fade up, 0.1s delay after heading |
| Benefit cards | `fadeUp` + stagger | Stagger 0.08s between cards |
| Process cards | `slideRight` | `x: -40 → 0` + `opacity`, staggered |
| Portfolio cards | `scaleUp` | `scale: 0.95 → 1` + `opacity`, staggered |
| Trust quote | `fadeIn` | Fade, then quotation mark springs in separately |
| Stats/numbers | `countUp` | Numeric count from 0 to final value, 1.5s duration |
| CTA sections | `fadeUp` | Text fades, buttons spring in 0.2s after |
| Footer columns | `fadeUp` + stagger | Left-to-right stagger |

#### Scroll Velocity Skew
- All revealed content gets a subtle `skewY` driven by `--scroll-velocity`
- Range: `0deg` at rest, `1-2deg` during fast scroll
- Applied via a CSS rule: `transform: skewY(calc(var(--scroll-velocity) * 1deg))`
- Transition: `transform 0.3s ease-out` so it settles smoothly

### Layer 3: Microinteractions

#### Navigation Links
- Underline slides in from left: `scaleX: 0 → 1`, `transform-origin: left`
- Active link has persistent underline
- StickyNav entrance: `y: '-100%' → 0` with spring, `backdropFilter` fades in

#### Portfolio Cards
- Mouse-position parallax on image: `translateX/Y` mapped to mouse position within card, max 8px displacement
- Tag chips micro-stagger on hover (subtle `opacity: 0.7 → 1` + `y: 2 → 0`, 0.03s stagger)
- Gradient overlay hue shifts on hover (`filter: hue-rotate(10deg)`)
- Stat numbers pulse once on hover (`scale: 1 → 1.1 → 1`, 0.3s)
- Custom cursor shows "Megnezem" label

#### Process Cards
- Background color fills from bottom via `clipPath: inset(100% 0 0 0) → inset(0)` on hover
- Icon wiggle: `rotate: [0, 10, -5, 0]` sequence, 0.5s
- Step number: `scale: 1 → 1.15` on hover

#### Benefit Cards
- Card lifts: `translateY: -4px`, shadow deepens on hover
- Icon bounce: `y: [0, -6, 0]` with spring physics
- Icon background: slow `hue-rotate` on hover (CSS `filter` transition, 0.6s)

#### FAQ Accordion
- Replace `max-height` transition with Framer Motion `AnimatePresence` + `motion.div` with `height: auto` animation
- Plus → X rotation: current 45deg rotation enhanced with spring (`damping: 15, stiffness: 200`)
- Answer text: fast mask reveal on each line (stagger 0.03s)
- Open item gets subtle background tint (`backgroundColor` transition)

#### Problem/Solution Slider
- Handle breathing pulse when idle: `scale: [1, 1.08, 1]` on 2s loop, stops on grab
- Before/after labels fade based on slider position (left label fades as slider moves right, vice versa)
- Cursor swaps to horizontal resize arrows on hover

#### Rotating Stamp (FFStamp)
- Spin accelerates on hover: `animation-duration` from `18s → 4s`
- Click Easter egg: fast 360deg spin in 0.4s
- Subtle `scale: 1.05` with spring on hover

### Layer 4: Cinematic Showpiece Sections

#### Portfolio Section -- Scroll-Driven Showcase
- Cards reveal with staggered `scale: 0.95 → 1` + `opacity: 0 → 1`
- Alternating slight rotation on reveal: odd cards `rotate: -1deg → 0`, even cards `rotate: 1deg → 0`
- Background gradient per card shifts subtly with scroll progress (Framer Motion `useScroll` + `useTransform`)
- Ken Burns effect on card images: once card is fully in viewport, image gets slow CSS animation: `translateX: 0 → 10px` + `scale: 1 → 1.03` over 8s, triggered by adding a class via IntersectionObserver
- Stats count up from 0 to final number when first revealed (e.g. "0%" → "+22%"), 1.5s duration, ease-out
- **Mobile:** Basic staggered fade-up only, no rotation, no Ken Burns

#### Process Section -- Scroll-Pinned Sequence
- Implemented with Framer Motion `useScroll` on a tall container (~150vh height)
- As user scrolls through the container, steps reveal sequentially based on scroll progress:
  - `0% → 33%`: Step 1 reveals (number scales in from 200% → 100%, icon SVG path draws in, title mask reveals, description fades up)
  - `33% → 66%`: Step 2 reveals (same sequence)
  - `66% → 100%`: Step 3 reveals (same sequence)
- A connecting line draws between steps as they reveal (SVG path with `pathLength` animation, horizontal on desktop, vertical on mobile)
- The section content stays centered/sticky within the viewport during scroll via `position: sticky`
- After all 3 steps are revealed, sticky positioning ends and normal scroll resumes
- **Mobile:** Skip sticky/pinning entirely. Standard staggered reveals with each step fading up as it enters viewport normally.

#### Trust Section -- Dramatic Quote Reveal
- Large quotation mark: `scale: 2 → 1` with heavy spring (`damping: 8, stiffness: 80`) — it overshoots slightly and settles
- Quote text word-by-word opacity reveal: each word's opacity maps from `0.15` to `1.0` based on scroll progress through the section (using `useScroll` + `useTransform` per word)
- Team illustration: parallax offset at 0.8x scroll speed relative to text
- Star rating: stars pop in one by one, `scale: [0, 1.2, 1]` with 0.1s stagger between stars
- **Mobile:** Skip word-by-word scroll-linked opacity. Use simple fade-in for quote text. Keep star stagger.

## Mobile Strategy

| Feature | Desktop | Mobile (≤768px) |
|---|---|---|
| Custom cursor | Full context-aware system | Hidden entirely |
| Smooth scroll (Lenis) | Enabled | Enabled (reduced lerp: 0.15) |
| Scroll velocity skew | Active | Disabled |
| Magnetic buttons | Active | Disabled (no hover on touch) |
| Parallax depth | Multi-layer | Max 2 layers, reduced displacement |
| Process pinning | Sticky scroll-driven | Standard staggered reveals |
| Word-by-word opacity | Scroll-linked | Simple fade-in |
| Ken Burns on portfolio | Active | Disabled |
| Card rotation on reveal | Active | Disabled |
| Character-level text split | Where used | Word-level fallback |
| Spring physics | Standard damping | Stiffer values for snappier feel |

## Performance Considerations

- Animate only `transform` and `opacity` for GPU compositing
- `will-change: transform` on elements that animate frequently (cursor, parallax layers)
- Lenis scroll callback uses `requestAnimationFrame` — no redundant rAF wrapping
- IntersectionObserver for Ken Burns trigger (no scroll listener for this)
- All viewport-triggered animations use `once: true` — they fire once and stop observing
- Lazy-load Framer Motion's `AnimatePresence` only where needed (FAQ, potentially modals)
- Total new JS budget: ~35kb gzipped (Framer Motion + Lenis)

## File Structure

```
src/
├── components/
│   ├── animations/
│   │   ├── Reveal.jsx          # Base reveal component + variants
│   │   ├── RevealGroup.jsx     # Staggered children container
│   │   ├── CustomCursor.jsx    # Cursor component + context provider
│   │   ├── MagneticButton.jsx  # Magnetic wrapper for FFButton
│   │   ├── CountUp.jsx         # Number count-up animation
│   │   ├── TextSplit.jsx       # Character/word splitting for reveals
│   │   └── ScrollVelocity.jsx  # Lenis velocity → CSS variable bridge
│   ├── HeroA.jsx               # UNTOUCHED
│   ├── StickyNav.jsx           # Enhanced with spring entrance
│   ├── Sections.jsx            # Enhanced with reveal system + showpiece treatments
│   ├── Primitives.jsx          # FFButton gets magnetic wrapper, FFStamp gets hover/click effects
│   └── Icons.jsx               # Unchanged
├── hooks/
│   ├── useMagnetic.js          # Magnetic effect hook
│   └── useMouseParallax.js     # Mouse-position parallax for cards
├── providers/
│   └── LenisProvider.jsx       # Lenis smooth scroll wrapper
└── styles/
    ├── tokens.css              # Add motion tokens (spring configs, durations)
    ├── main.css                # Add velocity skew rule, cursor hiding
    └── animations.css          # New: keyframes for Ken Burns, pulse, etc.
```

## What Stays Untouched

- **HeroA.jsx** — All current hero animations preserved exactly as-is (staggered word reveals, SVG strike-through, scroll parallax, design/live auto-toggle, flourishes)
- **Core layout and content structure** — No changes to page flow, section order, or content
- **Icons.jsx** — No changes
