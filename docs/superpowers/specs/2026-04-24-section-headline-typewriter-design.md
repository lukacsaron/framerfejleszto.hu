# Section Headline Typewriter Animation

**Date:** 2026-04-24  
**Status:** Draft

## Summary

Add a classic typewriter reveal animation to all section h2 headlines. Characters appear one by one left-to-right with a blinking cursor that vanishes after typing completes. Triggers once on scroll into viewport, consistent with the existing `whileInView: { once: true }` pattern.

## Scope

All section h2s in Sections.jsx: ProblemSolution, Process, Benefits, VibeCoding, Trust, Portfolio, FAQ, FinalCTA.

The hero headline (HeroA.jsx) is **not** affected — it keeps its existing cascading span reveal.

## Approach

New `TypewriterReveal` component exported from `src/components/animations/Reveal.jsx`. Integrates with the existing Framer Motion animation system rather than creating a parallel one.

## TypewriterReveal Component

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Headline content (text, `<br />`, styled `<span>`s) |
| `as` | `string` | `'h2'` | HTML element to render as |
| `charStagger` | `number` | `0.03` | Seconds between each character reveal |
| `className` | `string` | `''` | Additional CSS classes |
| `style` | `object` | `undefined` | Inline styles passed through |
| `amount` | `number` | `0.12` | Viewport intersection threshold |

### Character Splitting

A `flattenChildren(children)` utility recursively walks the React children tree:

- **String nodes:** Split into individual characters. Each character becomes a `motion.span` with `display: 'inline-block'` (spaces get `'\u00A0'` and `width: '0.3em'`).
- **`<br />` elements:** Preserved as-is in the sequence.
- **`<span>` elements with styles/classes:** The span's text children are split into characters, each wrapped in a `motion.span`, then the group is re-wrapped in the original span with its styles preserved.

### Animation

The container (`motion[as]`) uses Framer Motion's orchestration:

```
initial="hidden"
whileInView="visible"
viewport={{ once: true, amount }}
variants={{
  hidden: {},
  visible: { transition: { staggerChildren: charStagger } }
}}
```

Each character `motion.span`:

```
variants={{
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
}}
transition={{ duration: 0.02 }}
```

Characters snap in (near-instant 0.02s duration) rather than fading, to create a sharp typewriter feel.

### Cursor

- Implemented as a `::after` pseudo-element on the container via a `.typewriter-cursor` class.
- Vertical bar: 2.5px wide, `1em` tall, `currentColor`.
- Blinks via `@keyframes cursor-blink` at 530ms intervals (opacity toggle 0/1 with `steps(1)`).
- After `onAnimationComplete` fires on the container, a short `setTimeout` (~1s, allowing ~2 blinks) adds `.typewriter-cursor--done` which sets the cursor to `display: none` instantly.

### Cursor CSS

```css
.typewriter-cursor::after {
  content: '';
  display: inline-block;
  width: 2.5px;
  height: 1em;
  background: currentColor;
  margin-left: 2px;
  vertical-align: baseline;
  animation: cursor-blink 0.53s steps(1) infinite;
}

.typewriter-cursor--done::after {
  display: none;
}

@keyframes cursor-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
```

## Integration in Sections.jsx

Current pattern:
```jsx
<Reveal>
  <h2>HEADLINE TEXT</h2>
</Reveal>
```

New pattern:
```jsx
<TypewriterReveal as="h2">
  HEADLINE TEXT
</TypewriterReveal>
```

Props like `className`, `style`, and `delay` pass through. Existing Reveal wrappers around h2 elements are replaced — the TypewriterReveal handles its own viewport detection.

## Timing Calibration

With `charStagger: 0.03`:
- 20-character headline: ~0.6s total typing time
- 30-character headline: ~0.9s
- 50-character headline: ~1.5s

This keeps shorter headlines snappy and longer ones still under 2 seconds. The prop is tunable per-instance if any headline feels too slow.

## Edge Cases

- **Multi-line headlines (with `<br />`):** Line breaks are preserved in the character sequence. The cursor naturally moves to the next line when the `<br />` is reached.
- **Colored spans:** Style/class attributes are preserved on the wrapping span. Characters inside inherit the color.
- **Empty text nodes:** Skipped by the flattener.
- **Accessibility:** The full text content is present in the DOM from initial render (just `opacity: 0`), so screen readers see the complete headline. No `aria-hidden` tricks needed.

## Files Changed

| File | Change |
|------|--------|
| `src/components/animations/Reveal.jsx` | Add `TypewriterReveal` component and `flattenChildren` utility |
| `src/components/Sections.jsx` | Replace `<Reveal><h2>` with `<TypewriterReveal as="h2">` for all section headlines |
| `src/styles/main.css` | Add `.typewriter-cursor`, `.typewriter-cursor--done`, and `@keyframes cursor-blink` |
