# Section Headline Typewriter Animation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add typewriter character-by-character reveal animation to all section h2 headlines, triggered once on scroll into viewport.

**Architecture:** New `TypewriterReveal` component in Reveal.jsx using Framer Motion's `staggerChildren` orchestration to reveal characters sequentially. CSS cursor pseudo-element blinks then vanishes. Sections.jsx swaps `<Reveal><h2>` wrappers for `<TypewriterReveal as="h2">`.

**Tech Stack:** React, Framer Motion, CSS keyframes

**Spec:** `docs/superpowers/specs/2026-04-24-section-headline-typewriter-design.md`

---

### Task 1: Add cursor CSS to main.css

**Files:**
- Modify: `src/styles/main.css` (append after existing animation styles)

- [ ] **Step 1: Add typewriter cursor styles**

Add the following at the end of `src/styles/main.css`, before the closing media queries (or at end of file if no closing queries):

```css
/* ── Typewriter cursor ── */
.typewriter-cursor {
  position: relative;
}

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

- [ ] **Step 2: Verify dev server shows no errors**

Run: `npm run dev` (if not already running)
Open browser, confirm no CSS parse errors in console.

- [ ] **Step 3: Commit**

```bash
git add src/styles/main.css
git commit -m "style: add typewriter cursor CSS and blink keyframe"
```

---

### Task 2: Build TypewriterReveal component in Reveal.jsx

**Files:**
- Modify: `src/components/animations/Reveal.jsx`

- [ ] **Step 1: Add the `flattenChildren` utility and `TypewriterReveal` component**

Add the following imports at the top of `src/components/animations/Reveal.jsx`:

```jsx
import { useState, Children, isValidElement, cloneElement } from 'react'
```

Then add the following after the existing `RevealChild` component (before the file ends):

```jsx
/* ── Typewriter helpers ── */

const charVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

function flattenChildren(children) {
  const result = []
  Children.forEach(children, (child) => {
    if (child == null || child === false || child === '') return

    if (typeof child === 'string') {
      for (const ch of child) {
        if (ch === ' ') {
          result.push({ type: 'space' })
        } else {
          result.push({ type: 'char', char: ch })
        }
      }
      return
    }

    if (isValidElement(child)) {
      // Preserve <br /> as-is
      if (child.type === 'br') {
        result.push({ type: 'br' })
        return
      }

      // For elements with children (e.g. styled <span>), recurse into their
      // children but tag each resulting item with the wrapper props so we can
      // re-wrap them when rendering.
      const innerItems = flattenChildren(child.props.children)
      const wrapperProps = { ...child.props }
      delete wrapperProps.children
      const wrapperType = child.type

      for (const item of innerItems) {
        result.push({ ...item, wrapperType, wrapperProps })
      }
    }
  })
  return result
}

export function TypewriterReveal({
  children,
  as = 'h2',
  charStagger = 0.03,
  className = '',
  style,
  amount = 0.12,
}) {
  const [done, setDone] = useState(false)
  const Component = motion[as] || motion.h2
  const items = flattenChildren(children)

  // Group consecutive items that share the same wrapper so we can wrap them
  // in a single element (e.g. a colored <span>).
  const rendered = []
  let i = 0
  while (i < items.length) {
    const item = items[i]

    if (item.type === 'br') {
      rendered.push(<br key={`br-${i}`} />)
      i++
      continue
    }

    if (item.type === 'space') {
      const space = (
        <motion.span
          key={`sp-${i}`}
          variants={charVariants}
          transition={{ duration: 0.02 }}
          style={{ display: 'inline-block', width: '0.3em' }}
        >
          {'\u00A0'}
        </motion.span>
      )
      if (item.wrapperType) {
        const Wrapper = item.wrapperType
        rendered.push(
          <Wrapper key={`sp-w-${i}`} {...item.wrapperProps}>
            {space}
          </Wrapper>
        )
      } else {
        rendered.push(space)
      }
      i++
      continue
    }

    // item.type === 'char'
    // Collect consecutive chars that share the same wrapper
    if (item.wrapperType) {
      const Wrapper = item.wrapperType
      const wp = item.wrapperProps
      const group = []
      while (
        i < items.length &&
        items[i].wrapperType === Wrapper &&
        JSON.stringify(items[i].wrapperProps) === JSON.stringify(wp)
      ) {
        const it = items[i]
        if (it.type === 'br') break
        if (it.type === 'space') {
          group.push(
            <motion.span
              key={`sp-${i}`}
              variants={charVariants}
              transition={{ duration: 0.02 }}
              style={{ display: 'inline-block', width: '0.3em' }}
            >
              {'\u00A0'}
            </motion.span>
          )
        } else {
          group.push(
            <motion.span
              key={`ch-${i}`}
              variants={charVariants}
              transition={{ duration: 0.02 }}
              style={{ display: 'inline-block' }}
            >
              {it.char}
            </motion.span>
          )
        }
        i++
      }
      rendered.push(
        <Wrapper key={`wrap-${i}`} {...wp}>
          {group}
        </Wrapper>
      )
    } else {
      rendered.push(
        <motion.span
          key={`ch-${i}`}
          variants={charVariants}
          transition={{ duration: 0.02 }}
          style={{ display: 'inline-block' }}
        >
          {item.char}
        </motion.span>
      )
      i++
    }
  }

  return (
    <Component
      className={`typewriter-cursor ${done ? 'typewriter-cursor--done' : ''} ${className}`}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: charStagger } },
      }}
      onAnimationComplete={() => {
        setTimeout(() => setDone(true), 1000)
      }}
    >
      {rendered}
    </Component>
  )
}
```

- [ ] **Step 2: Verify the file parses without errors**

Check the dev server terminal for compilation errors. Open the browser — existing page should still work (TypewriterReveal is exported but not yet used).

- [ ] **Step 3: Commit**

```bash
git add src/components/animations/Reveal.jsx
git commit -m "feat: add TypewriterReveal component with character splitting"
```

---

### Task 3: Integrate TypewriterReveal into Sections.jsx — ProblemSolution

**Files:**
- Modify: `src/components/Sections.jsx`

- [ ] **Step 1: Add TypewriterReveal to imports**

At the top of `src/components/Sections.jsx`, find the existing Reveal imports:

```jsx
import { Reveal, RevealGroup, RevealChild, MaskReveal } from './animations/Reveal'
```

Change to:

```jsx
import { Reveal, RevealGroup, RevealChild, MaskReveal, TypewriterReveal } from './animations/Reveal'
```

- [ ] **Step 2: Replace ProblemSolution h2 (~line 38-56)**

Find:
```jsx
        <Reveal>
          <div className="ff-section-head">
            <div>
              <div className="ff-eyebrow" style={{ color: 'var(--c-orange-600)' }}>A PROBLÉMA × MEGOLDÁS</div>
              <h2 style={{ color: '#fff' }}>
                <span style={{
                  display: 'inline',
                  background: 'var(--c-midnight-800)',
                  padding: '0 12px',
                  boxDecorationBreak: 'clone',
                  WebkitBoxDecorationBreak: 'clone',
                }}>A régi megközelítés lassú. A no-code gyorsabb, egyszerűbb.</span>
              </h2>
            </div>
```

Replace with:
```jsx
        <Reveal>
          <div className="ff-section-head">
            <div>
              <div className="ff-eyebrow" style={{ color: 'var(--c-orange-600)' }}>A PROBLÉMA × MEGOLDÁS</div>
              <TypewriterReveal style={{ color: '#fff' }}>
                <span style={{
                  display: 'inline',
                  background: 'var(--c-midnight-800)',
                  padding: '0 12px',
                  boxDecorationBreak: 'clone',
                  WebkitBoxDecorationBreak: 'clone',
                }}>A régi megközelítés lassú. A no-code gyorsabb, egyszerűbb.</span>
              </TypewriterReveal>
            </div>
```

Note: The outer `<Reveal>` stays — it wraps the entire section-head (eyebrow + h2 + lead paragraph). The `TypewriterReveal` replaces just the `<h2>`.

- [ ] **Step 3: Verify in browser**

Scroll to the ProblemSolution section. The headline should type in character by character with a blinking cursor that vanishes.

- [ ] **Step 4: Commit**

```bash
git add src/components/Sections.jsx
git commit -m "feat: typewriter animation on ProblemSolution headline"
```

---

### Task 4: Integrate TypewriterReveal — Process section

**Files:**
- Modify: `src/components/Sections.jsx`

- [ ] **Step 1: Replace Process h2 (~line 153)**

Find:
```jsx
              <h2>ELSŐ HÍVÁSTÓL ÉLES OLDALIG<br />3 LÉPÉSBEN.</h2>
```

Replace with:
```jsx
              <TypewriterReveal>ELSŐ HÍVÁSTÓL ÉLES OLDALIG<br />3 LÉPÉSBEN.</TypewriterReveal>
```

- [ ] **Step 2: Verify in browser**

Scroll to the Process section. Headline types in, cursor blinks twice then vanishes.

- [ ] **Step 3: Commit**

```bash
git add src/components/Sections.jsx
git commit -m "feat: typewriter animation on Process headline"
```

---

### Task 5: Integrate TypewriterReveal — Benefits section

**Files:**
- Modify: `src/components/Sections.jsx`

- [ ] **Step 1: Replace Benefits h2 (~line 201)**

Find:
```jsx
              <h2>A FRAMER NEM CSAK<br />GYORS. <span style={{ color: 'var(--c-orange-600)' }}>OKOS IS.</span></h2>
```

Replace with:
```jsx
              <TypewriterReveal>A FRAMER NEM CSAK<br />GYORS. <span style={{ color: 'var(--c-orange-600)' }}>OKOS IS.</span></TypewriterReveal>
```

- [ ] **Step 2: Verify in browser**

Scroll to Benefits. The colored "OKOS IS." span should type in with the correct orange color.

- [ ] **Step 3: Commit**

```bash
git add src/components/Sections.jsx
git commit -m "feat: typewriter animation on Benefits headline"
```

---

### Task 6: Integrate TypewriterReveal — VibeCoding section

**Files:**
- Modify: `src/components/Sections.jsx`

- [ ] **Step 1: Replace VibeCoding h2 (~lines 231-235)**

Find:
```jsx
              <h2>
                NÉHA AZ{' '}
                <span style={{ color: 'var(--c-mint-500)' }}>EGYSZERŰBB</span>
                {' '}DÖNTÉS A JÓ DÖNTÉS
              </h2>
```

Replace with:
```jsx
              <TypewriterReveal>
                NÉHA AZ{' '}
                <span style={{ color: 'var(--c-mint-500)' }}>EGYSZERŰBB</span>
                {' '}DÖNTÉS A JÓ DÖNTÉS
              </TypewriterReveal>
```

- [ ] **Step 2: Verify in browser**

Scroll to VibeCoding. The mint-colored "EGYSZERŰBB" should type in with correct color.

- [ ] **Step 3: Commit**

```bash
git add src/components/Sections.jsx
git commit -m "feat: typewriter animation on VibeCoding headline"
```

---

### Task 7: Integrate TypewriterReveal — Trust section

**Files:**
- Modify: `src/components/Sections.jsx`

- [ ] **Step 1: Replace Trust h3 (~lines 344-346)**

Find:
```jsx
            <Reveal delay={0.1}>
              <h3>100% SENIOR.<br />0% KAMU.</h3>
            </Reveal>
```

Replace with:
```jsx
            <Reveal delay={0.1}>
              <TypewriterReveal as="h3">100% SENIOR.<br />0% KAMU.</TypewriterReveal>
            </Reveal>
```

Note: Uses `as="h3"` since this section uses h3. The outer `<Reveal delay={0.1}>` stays for the delay.

- [ ] **Step 2: Verify in browser**

Scroll to the Trust/KIK VAGYUNK section. Headline types in character by character.

- [ ] **Step 3: Commit**

```bash
git add src/components/Sections.jsx
git commit -m "feat: typewriter animation on Trust headline"
```

---

### Task 8: Integrate TypewriterReveal — Portfolio section

**Files:**
- Modify: `src/components/Sections.jsx`

- [ ] **Step 1: Replace Portfolio h2 (~line 474)**

Find:
```jsx
              <h2>NEM HIRDETJÜK MAGUNKAT.<br /><span style={{ color: 'var(--c-orange-600)' }}>AZ ÜGYFELEINK IGEN.</span></h2>
```

Replace with:
```jsx
              <TypewriterReveal>NEM HIRDETJÜK MAGUNKAT.<br /><span style={{ color: 'var(--c-orange-600)' }}>AZ ÜGYFELEINK IGEN.</span></TypewriterReveal>
```

- [ ] **Step 2: Verify in browser**

Scroll to Portfolio. Headline types in, orange span colors correctly.

- [ ] **Step 3: Commit**

```bash
git add src/components/Sections.jsx
git commit -m "feat: typewriter animation on Portfolio headline"
```

---

### Task 9: Integrate TypewriterReveal — FAQ section

**Files:**
- Modify: `src/components/Sections.jsx`

- [ ] **Step 1: Replace FAQ h2 (~line 573)**

Find:
```jsx
              <h2 style={{ fontFamily: 'var(--ff-display)', textTransform: 'uppercase', fontSize: 'clamp(36px, 4.6vw, 64px)', letterSpacing: '-0.02em', lineHeight: 0.95, margin: '0 0 20px' }}>VÁLASZOK,<br />MIELŐTT<br />MEGKÉRDEZNÉD.</h2>
```

Replace with:
```jsx
              <TypewriterReveal style={{ fontFamily: 'var(--ff-display)', textTransform: 'uppercase', fontSize: 'clamp(36px, 4.6vw, 64px)', letterSpacing: '-0.02em', lineHeight: 0.95, margin: '0 0 20px' }}>VÁLASZOK,<br />MIELŐTT<br />MEGKÉRDEZNÉD.</TypewriterReveal>
```

- [ ] **Step 2: Verify in browser**

Scroll to FAQ. All three lines type in sequence across the line breaks.

- [ ] **Step 3: Commit**

```bash
git add src/components/Sections.jsx
git commit -m "feat: typewriter animation on FAQ headline"
```

---

### Task 10: Integrate TypewriterReveal — FinalCTA section

**Files:**
- Modify: `src/components/Sections.jsx`

- [ ] **Step 1: Replace FinalCTA h2 (~lines 628-630)**

Find:
```jsx
          <Reveal delay={0.2}>
            <h2>HA NEMCSAK <span className="orange">SZÉP DIZÁJNT</span>,<br />HANEM <span className="hot">KONVERZIÓNÖVEKEDÉST</span> IS<br />SZERETNÉL: <span className="hot">ITT KEZDJÜK</span>.</h2>
          </Reveal>
```

Replace with:
```jsx
          <Reveal delay={0.2}>
            <TypewriterReveal>HA NEMCSAK <span className="orange">SZÉP DIZÁJNT</span>,<br />HANEM <span className="hot">KONVERZIÓNÖVEKEDÉST</span> IS<br />SZERETNÉL: <span className="hot">ITT KEZDJÜK</span>.</TypewriterReveal>
          </Reveal>
```

Note: The outer `<Reveal delay={0.2}>` stays — it provides the delay before the typewriter starts. The `TypewriterReveal` replaces just the `<h2>`.

- [ ] **Step 2: Verify in browser**

Scroll to FinalCTA. The `.orange` and `.hot` class spans should type in with their CSS-defined colors.

- [ ] **Step 3: Commit**

```bash
git add src/components/Sections.jsx
git commit -m "feat: typewriter animation on FinalCTA headline"
```

---

### Task 11: Full-page visual verification

**Files:** None (verification only)

- [ ] **Step 1: Full scroll-through test**

Open the site in browser. Scroll from top to bottom at a natural pace. For each section headline, verify:
- Characters appear one by one left-to-right
- Colored spans render with correct colors
- Line breaks (`<br />`) work — cursor moves to next line
- Cursor blinks ~2 times after typing completes, then vanishes instantly
- Animation fires only once (scroll back up and down — should not replay)

- [ ] **Step 2: Check for timing issues**

If any headline feels too slow (especially the longer ones like FinalCTA), adjust `charStagger` prop on that specific `<TypewriterReveal>` instance. For example:
```jsx
<TypewriterReveal charStagger={0.025}>...</TypewriterReveal>
```

- [ ] **Step 3: Check mobile viewport**

Open Chrome DevTools, toggle device toolbar (responsive mode). Verify headlines type correctly at mobile widths — character wrapping should work naturally since each char is `display: inline-block`.

- [ ] **Step 4: Final commit if any tuning was needed**

```bash
git add -A
git commit -m "fix: tune typewriter timing and mobile layout"
```
