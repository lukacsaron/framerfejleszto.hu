# Hero Floating Playful Icons

## Summary

Replace the left spinning 22/circle and caesar statue collage in the hero section with 6 floating, draggable playful icons scattered across the hero. Keep the right-side spinning 22/circle, and the existing asterisk-mint and star-yellow flourishes.

## Removals

In `src/components/HeroA.jsx`:
- Line 48: `<FFStamp className="collage-on-only" onDark={true} />` (left spinning circle)
- Line 51: `<img src="/assets/illustrations/caesar-3d-glasses.avif" .../>` (caesar statue collage)

## Assets

Copy 6 AVIF files from `_raw/playful-icons/` to `public/assets/flourishes/` with descriptive names:

| Source hash filename | Target name | Description |
|---|---|---|
| HFUIGUaHHZR4YYSX02yJLGrcXc.avif | plus-purple.avif | Purple plus/cross |
| PGayuae1UWXsbtjwhwWLHNHjg.avif | arrow-orange-drawn.avif | Orange arrow (drawn style) |
| X2pNnw4Ng6ks4T2XaNyK4Z1NNo.avif | flower-blue-drawn.avif | Blue flower/blob |
| jDOUhg937AGv6wy69je6ADL4oA.avif | asterisk-green.avif | Green asterisk |
| uEOwv9nJCJ9UVVsNxCFdFYMYuQ.avif | star-white.avif | White star/sparkle |
| x2yzGuv4TF2RnJZjUrwWIAAAQjk.avif | starburst-yellow.avif | Yellow starburst |

## FloatingIcon Component

A small React component in `HeroA.jsx` (not a separate file — it's only used here):

```jsx
function FloatingIcon({ src, style, className }) {
  // ref for the img element
  // track dragging state, pointer offset, and current translated position
  // onPointerDown: pause CSS animation, capture offset, setPointerCapture
  // onPointerMove: update translate transform
  // onPointerUp: resume CSS animation from new position
  // render: <img> with className="ff-flourish ff-float {className}" and combined inline style
}
```

Pointer events API for cross-device (mouse + touch) support. `setPointerCapture` ensures drag continues even if pointer leaves the element.

## Icon Placement

All positioned absolutely inside `.ff-hero-inner`. Hand-picked positions to scatter around edges, avoiding the central headline/CTA zone:

| Icon | Position | Size | Rotation |
|---|---|---|---|
| plus-purple | top: 30px, left: 8% | 55px | -12deg |
| arrow-orange-drawn | top: 180px, right: 5% | 48px | 8deg |
| flower-blue-drawn | bottom: 220px, left: 4% | 60px | 15deg |
| asterisk-green | top: 100px, left: 18% | 45px | -5deg |
| star-white | bottom: 180px, right: 12% | 50px | 20deg |
| starburst-yellow | top: 60px, right: 20% | 52px | -8deg |

Positions will be tuned visually after first render.

## CSS Animations

Six `@keyframes` variations for organic feel, added to `src/styles/main.css` near the existing `@keyframes ff-spin`:

```css
.ff-float { cursor: grab; pointer-events: auto; }
.ff-float:active { cursor: grabbing; }
.ff-float.dragging { animation-play-state: paused !important; }

.ff-float-1 { animation: ff-float-1 8s ease-in-out infinite alternate; }
.ff-float-2 { animation: ff-float-2 10s ease-in-out infinite alternate; }
.ff-float-3 { animation: ff-float-3 7s ease-in-out infinite alternate; }
.ff-float-4 { animation: ff-float-4 9s ease-in-out infinite alternate; }
.ff-float-5 { animation: ff-float-5 11s ease-in-out infinite alternate; }
.ff-float-6 { animation: ff-float-6 6.5s ease-in-out infinite alternate; }
```

Each keyframe combines translateX, translateY, and rotate with different ranges:
- Vertical drift: 8-15px
- Horizontal sway: 4-8px  
- Rotation: 3-8deg
- All gentle and slow

## Drag Behavior

1. `pointerdown`: Add `.dragging` class (pauses animation), record pointer offset from element, call `setPointerCapture`
2. `pointermove`: Update element `transform: translate(dx, dy) rotate(Xdeg)` to follow pointer
3. `pointerup`: Remove `.dragging` class, store final position so animation resumes from new location

The existing `.ff-flourish` class sets `pointer-events: none` — the floating icons override this with `pointer-events: auto` via the `.ff-float` class.

## What Stays Unchanged

- Right-side FFStamp (lines 53-55)
- Asterisk-mint flourish (line 49)
- Star-yellow flourish (line 50)
- All other hero content (headline, badges, CTAs, animated stage)
