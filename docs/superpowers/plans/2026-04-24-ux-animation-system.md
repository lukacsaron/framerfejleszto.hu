# UX Animation & Microinteraction System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a comprehensive animation system with Lenis smooth scroll, context-aware custom cursor, Framer Motion reveals, microinteractions, and cinematic showpiece treatments on Portfolio, Process, and Trust sections.

**Architecture:** 4-layer animation system — Foundation (Lenis + Cursor), Reveal System (Framer Motion viewport triggers replacing useReveal), Microinteractions (hover/gesture enhancements on all interactive elements), and Cinematic Showpieces (scroll-driven treatments on 3 key sections). HeroA.jsx stays completely untouched.

**Tech Stack:** React 19, Framer Motion, Lenis, Vite

**Note:** This project has no test framework. Verification steps use the Vite dev server (`npm run dev`) and browser inspection. Each task includes specific visual verification criteria.

---

## File Structure

```
src/
├── main.jsx                          # Modify: wrap App in LenisProvider
├── App.jsx                           # Modify: add CustomCursor, remove useReveal call
├── components/
│   ├── animations/
│   │   ├── Reveal.jsx                # Create: base reveal + RevealGroup + variants
│   │   ├── CustomCursor.jsx          # Create: context-aware cursor component
│   │   ├── MagneticButton.jsx        # Create: magnetic wrapper for FFButton
│   │   ├── CountUp.jsx               # Create: number count-up animation
│   │   ├── TextSplit.jsx             # Create: word splitting for mask reveals
│   │   └── ScrollVelocity.jsx        # Create: Lenis velocity → CSS variable bridge
│   ├── HeroA.jsx                     # UNTOUCHED
│   ├── StickyNav.jsx                 # Modify: add spring entrance animation
│   ├── Sections.jsx                  # Modify: wrap sections in Reveal, add showpiece treatments
│   ├── Primitives.jsx                # Modify: wrap FFButton in MagneticButton, enhance FFStamp
│   └── Icons.jsx                     # UNTOUCHED
├── providers/
│   └── LenisProvider.jsx             # Create: Lenis smooth scroll wrapper
├── hooks/
│   ├── useMagnetic.js                # Create: magnetic effect hook
│   └── useMouseParallax.js           # Create: mouse-position parallax hook
└── styles/
    ├── tokens.css                    # Modify: add motion tokens
    ├── main.css                      # Modify: cursor hiding, velocity skew, update reveal classes
    └── animations.css                # Create: Ken Burns, pulse keyframes
```

---

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install framer-motion and lenis**

```bash
cd /Users/alukacs/Code/22.design && npm install framer-motion lenis
```

- [ ] **Step 2: Verify installation**

```bash
cd /Users/alukacs/Code/22.design && node -e "require('framer-motion'); require('lenis'); console.log('OK')"
```

Expected: `OK` printed without errors.

- [ ] **Step 3: Verify dev server still works**

```bash
cd /Users/alukacs/Code/22.design && npm run dev &
```

Open http://localhost:5173 — site should render identically to before.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add framer-motion and lenis dependencies"
```

---

### Task 2: Add Motion Tokens to CSS

**Files:**
- Modify: `src/styles/tokens.css` (after line 128)
- Create: `src/styles/animations.css`

- [ ] **Step 1: Add motion tokens to tokens.css**

Add after the existing easing tokens (line 128 area, after `--ease-spring`):

```css
  /* ── motion: durations ── */
  --dur-fast:    150ms;
  --dur-normal:  300ms;
  --dur-slow:    600ms;
  --dur-reveal:  600ms;

  /* ── motion: scroll velocity ── */
  --scroll-velocity: 0;
```

- [ ] **Step 2: Create animations.css with keyframes**

Create `src/styles/animations.css`:

```css
/* ── Ken Burns drift (portfolio cards) ── */
@keyframes ken-burns {
  0% {
    transform: scale(1) translateX(0);
  }
  100% {
    transform: scale(1.03) translateX(10px);
  }
}

.ken-burns-active {
  animation: ken-burns 8s ease-in-out forwards;
}

/* ── Cursor pulse (CTA sections) ── */
@keyframes cursor-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.3);
    opacity: 0;
  }
}

/* ── Handle breathing (slider) ── */
@keyframes handle-breathe {
  0%, 100% {
    transform: translateX(-50%) scale(1);
  }
  50% {
    transform: translateX(-50%) scale(1.08);
  }
}

/* ── Scroll velocity skew ── */
.ff-velocity-skew {
  transform: skewY(calc(var(--scroll-velocity, 0) * 1deg));
  transition: transform 0.3s ease-out;
}

/* ── Hide native cursor when custom cursor active ── */
@media (pointer: fine) {
  .cursor-active,
  .cursor-active * {
    cursor: none !important;
  }
}

/* ── Hide custom cursor on touch devices ── */
@media (pointer: coarse) {
  .ff-custom-cursor {
    display: none !important;
  }
}
```

- [ ] **Step 3: Import animations.css in main.jsx**

In `src/main.jsx`, add the import after the main.css import (line 3):

```jsx
import './styles/animations.css'
```

- [ ] **Step 4: Verify no style regressions**

Open http://localhost:5173 — site should look identical. Check devtools for the new CSS variables.

- [ ] **Step 5: Commit**

```bash
git add src/styles/tokens.css src/styles/animations.css src/main.jsx
git commit -m "feat: add motion tokens and animation keyframes"
```

---

### Task 3: Lenis Smooth Scroll Provider

**Files:**
- Create: `src/providers/LenisProvider.jsx`
- Create: `src/components/animations/ScrollVelocity.jsx`
- Modify: `src/main.jsx`

- [ ] **Step 1: Create LenisProvider**

Create `src/providers/LenisProvider.jsx`:

```jsx
import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

export default function LenisProvider({ children }) {
  const lenisRef = useRef(null)

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      duration: 1.2,
    })
    lenisRef.current = lenis

    let lastVelocity = 0

    function raf(time) {
      lenis.raf(time)

      const velocity = Math.min(Math.abs(lenis.velocity) / 1000, 3)
      if (Math.abs(velocity - lastVelocity) > 0.01) {
        document.documentElement.style.setProperty('--scroll-velocity', velocity.toFixed(3))
        lastVelocity = velocity
      }

      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
      document.documentElement.style.setProperty('--scroll-velocity', '0')
    }
  }, [])

  return children
}
```

- [ ] **Step 2: Wrap App in LenisProvider in main.jsx**

Modify `src/main.jsx` to wrap App:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/main.css'
import './styles/animations.css'
import LenisProvider from './providers/LenisProvider'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LenisProvider>
      <App />
    </LenisProvider>
  </StrictMode>
)
```

- [ ] **Step 3: Verify smooth scroll works**

Open http://localhost:5173. Scroll the page — it should feel buttery smooth with slight momentum. Open devtools and inspect `document.documentElement` — the `--scroll-velocity` custom property should update as you scroll.

- [ ] **Step 4: Commit**

```bash
git add src/providers/LenisProvider.jsx src/main.jsx
git commit -m "feat: add Lenis smooth scroll provider with velocity tracking"
```

---

### Task 4: Custom Cursor Component

**Files:**
- Create: `src/components/animations/CustomCursor.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create CustomCursor component**

Create `src/components/animations/CustomCursor.jsx`:

```jsx
import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

const CURSOR_STATES = {
  default:   { size: 12, label: null, blend: 'difference' },
  link:      { size: 48, label: null, blend: 'difference' },
  portfolio: { size: 80, label: 'Megnézem', blend: 'exclusion' },
  slider:    { size: 40, label: '↔', blend: 'difference' },
  image:     { size: 60, label: '⌕', blend: 'difference' },
  faq:       { size: 40, label: '+', blend: 'difference' },
  text:      { size: 6, label: null, blend: 'difference', isLine: true },
  cta:       { size: 48, label: null, blend: 'difference', pulse: true },
  dark:      { size: 12, label: null, blend: 'difference', isDark: true },
}

export default function CustomCursor() {
  const [state, setState] = useState('default')
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const springX = useSpring(cursorX, { damping: 25, stiffness: 300 })
  const springY = useSpring(cursorY, { damping: 25, stiffness: 300 })
  const isTouch = useRef(false)

  useEffect(() => {
    // Detect touch device
    const mq = window.matchMedia('(pointer: coarse)')
    isTouch.current = mq.matches
    if (isTouch.current) return

    document.body.classList.add('cursor-active')

    function onMouseMove(e) {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
    }

    function onMouseOver(e) {
      const target = e.target.closest('[data-cursor]')
      if (target) {
        setState(target.dataset.cursor)
      } else {
        // Auto-detect dark sections for cursor inversion
        const section = e.target.closest('.ff-section.dark, .ff-hero-wrap')
        setState(section ? 'dark' : 'default')
      }
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    document.addEventListener('mouseover', onMouseOver, { passive: true })

    return () => {
      document.body.classList.remove('cursor-active')
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseover', onMouseOver)
    }
  }, [cursorX, cursorY])

  // Don't render on touch devices
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null
  }

  const cur = CURSOR_STATES[state] || CURSOR_STATES.default

  return (
    <motion.div
      className="ff-custom-cursor"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        x: springX,
        y: springY,
        pointerEvents: 'none',
        zIndex: 9999,
        mixBlendMode: cur.blend,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        translateX: '-50%',
        translateY: '-50%',
      }}
      animate={{
        width: cur.isLine ? 2 : cur.size,
        height: cur.isLine ? 24 : cur.size,
        borderRadius: cur.isLine ? 1 : cur.size / 2,
      }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
    >
      {/* Main dot */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          backgroundColor: 'white',
        }}
      />

      {/* Pulse ring for CTA */}
      {cur.pulse && (
        <motion.div
          style={{
            position: 'absolute',
            inset: -4,
            borderRadius: '50%',
            border: '1px solid white',
            animation: 'cursor-pulse 1.5s ease-in-out infinite',
          }}
        />
      )}

      {/* Label */}
      {cur.label && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          style={{
            position: 'relative',
            zIndex: 1,
            color: state === 'portfolio' ? 'white' : 'black',
            fontSize: state === 'portfolio' ? 12 : 14,
            fontWeight: 700,
            fontFamily: 'var(--ff-body)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            userSelect: 'none',
          }}
        >
          {cur.label}
        </motion.span>
      )}
    </motion.div>
  )
}
```

- [ ] **Step 2: Add CustomCursor to App.jsx**

Modify `src/App.jsx`. Add the import and render CustomCursor at the top of the return JSX:

```jsx
import { useReveal } from './components/Primitives'
import HeroA from './components/HeroA'
import StickyNav from './components/StickyNav'
import { ProblemSolution, ProcessSection, Benefits, TrustSection, Portfolio, FAQSection, FinalCTA, Footer } from './components/Sections'
import CustomCursor from './components/animations/CustomCursor'

export default function App() {
  useReveal()

  return (
    <div style={{ background: 'var(--bg-page)' }}>
      <CustomCursor />
      <HeroA />
      <StickyNav />
      <ProblemSolution />
      <ProcessSection />
      <Benefits />
      <TrustSection />
      <Portfolio />
      <FAQSection />
      <FinalCTA />
      <Footer />
    </div>
  )
}
```

- [ ] **Step 3: Add data-cursor attributes to key elements**

This step adds `data-cursor` attributes throughout the codebase. These are small, targeted edits.

In `src/components/Primitives.jsx`, on the FFButton `<button>` element (line 23), add `data-cursor="link"`:

```jsx
<button className={`ff-btn ${variant}`} onClick={onClick} data-cursor="link" {...rest}>
```

In `src/components/Sections.jsx`:

On the portfolio section's project cards (the `.ff-port-card` link, around line 256), add `data-cursor="portfolio"`:
```jsx
<a href={p.link} target="_blank" className="ff-port-card" data-cursor="portfolio" style={{background: p.bg}} key={i}>
```

On the problem/solution slider container (around line 42), add `data-cursor="slider"`:
```jsx
<div className="slider-wrap" data-cursor="slider" onMouseMove={onMove} onTouchMove={onTouch}>
```

On each FAQ item (around line 305), add `data-cursor="faq"`:
```jsx
<div className={`ff-faq-item ${open === i ? 'open' : ''}`} key={i} data-cursor="faq">
```

On the FinalCTA section wrapper (around line 323), add `data-cursor="cta"`:
```jsx
<section className="ff-section paper ff-reveal" id="final" data-cursor="cta">
```

In `src/components/StickyNav.jsx`, on each nav link (around line 82), add `data-cursor="link"`:
```jsx
<a href={l.href} className="ff-sidebar-link" data-cursor="link" onClick={() => setOpen(false)}>
```

- [ ] **Step 4: Verify cursor behavior**

Open http://localhost:5173. The native cursor should be hidden. A white dot should follow the mouse with slight spring lag. Hover over:
- Buttons → cursor grows to 48px
- Portfolio cards → cursor shows "Megnézem" at 80px
- FAQ items → cursor shows "+" at 40px
- FinalCTA → cursor pulses

On mobile (use devtools device mode), no custom cursor should render.

- [ ] **Step 5: Commit**

```bash
git add src/components/animations/CustomCursor.jsx src/App.jsx src/components/Primitives.jsx src/components/Sections.jsx src/components/StickyNav.jsx
git commit -m "feat: add context-aware custom cursor with data-cursor attributes"
```

---

### Task 5: Magnetic Button Effect

**Files:**
- Create: `src/hooks/useMagnetic.js`
- Create: `src/components/animations/MagneticButton.jsx`
- Modify: `src/components/Primitives.jsx`

- [ ] **Step 1: Create useMagnetic hook**

Create `src/hooks/useMagnetic.js`:

```js
import { useRef, useCallback } from 'react'

export default function useMagnetic(strength = 0.3, radius = 40) {
  const ref = useRef(null)

  const onMouseMove = useCallback((e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    const maxDist = Math.max(rect.width, rect.height) / 2 + radius

    if (dist < maxDist) {
      const pull = (1 - dist / maxDist) * strength
      el.style.transform = `translate(${dx * pull}px, ${dy * pull}px)`
    }
  }, [strength, radius])

  const onMouseLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.transform = ''
    el.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
    setTimeout(() => {
      if (el) el.style.transition = ''
    }, 400)
  }, [])

  return { ref, onMouseMove, onMouseLeave }
}
```

- [ ] **Step 2: Create MagneticButton wrapper**

Create `src/components/animations/MagneticButton.jsx`:

```jsx
import { useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

export default function MagneticButton({ children, strength = 0.3, radius = 40 }) {
  const ref = useRef(null)

  const onMouseMove = useCallback((e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    const maxDist = Math.max(rect.width, rect.height) / 2 + radius

    if (dist < maxDist) {
      const pull = (1 - dist / maxDist) * strength
      el.style.transform = `translate(${dx * pull}px, ${dy * pull}px)`
    }
  }, [strength, radius])

  const onMouseLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.transform = ''
    el.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
    setTimeout(() => {
      if (el) el.style.transition = ''
    }, 400)
  }, [])

  // Skip magnetic on touch devices
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return children
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ display: 'inline-block' }}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 3: Wrap FFButton in MagneticButton**

Modify `src/components/Primitives.jsx`. Update the FFButton component:

```jsx
import MagneticButton from './animations/MagneticButton'

// ... existing code ...

export function FFButton({ variant = 'orange', children, icon, onClick, magnetic = true, ...rest }) {
  const btn = (
    <button className={`ff-btn ${variant}`} onClick={onClick} data-cursor="link" {...rest}>
      <span>{children}</span>
      <span className="ic">{icon || <Arrow />}</span>
    </button>
  )
  return magnetic ? <MagneticButton>{btn}</MagneticButton> : btn
}
```

- [ ] **Step 4: Verify magnetic effect**

Open http://localhost:5173. Hover near any button — it should shift subtly toward the cursor (max ~4px). Moving the mouse away should spring it back smoothly. On mobile/touch devtools, the button should behave normally without magnetic effect.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useMagnetic.js src/components/animations/MagneticButton.jsx src/components/Primitives.jsx
git commit -m "feat: add magnetic button effect with touch device fallback"
```

---

### Task 6: Framer Motion Reveal System

**Files:**
- Create: `src/components/animations/Reveal.jsx`
- Modify: `src/styles/main.css` (lines 736-737)

- [ ] **Step 1: Create Reveal and RevealGroup components**

Create `src/components/animations/Reveal.jsx`:

```jsx
import { motion } from 'framer-motion'

const variants = {
  fadeUp: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  },
  maskReveal: {
    hidden: { y: '100%' },
    visible: { y: 0 },
  },
  eyebrow: {
    hidden: { opacity: 0, letterSpacing: '0.3em' },
    visible: { opacity: 1, letterSpacing: '0.1em' },
  },
  slideRight: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  scaleUp: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
}

export function Reveal({
  children,
  variant = 'fadeUp',
  delay = 0,
  duration = 0.6,
  amount = 0.12,
  className = '',
  style,
  as = 'div',
}) {
  const Component = motion[as] || motion.div
  const v = variants[variant] || variants.fadeUp

  return (
    <Component
      className={`ff-velocity-skew ${className}`}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={v}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </Component>
  )
}

export function MaskReveal({ children, delay = 0, className = '', as = 'div' }) {
  const Component = motion[as] || motion.div
  return (
    <div style={{ overflow: 'hidden' }} className={className}>
      <Component
        initial={{ y: '100%' }}
        whileInView={{ y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{
          duration: 0.6,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </Component>
    </div>
  )
}

export function RevealGroup({
  children,
  stagger = 0.08,
  className = '',
  style,
  amount = 0.12,
}) {
  return (
    <motion.div
      className={`ff-velocity-skew ${className}`}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

export function RevealChild({ children, variant = 'fadeUp', className = '', style }) {
  const v = variants[variant] || variants.fadeUp
  return (
    <motion.div
      className={className}
      style={style}
      variants={v}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 2: Update main.css reveal classes**

In `src/styles/main.css`, find the `.ff-reveal` rules (around lines 736-737). Remove them or comment them out — Framer Motion now handles reveals:

Replace:
```css
.ff-reveal{opacity:0;transform:translateY(24px);transition:opacity .7s var(--ease-out),transform .7s var(--ease-out)}
.ff-reveal.in{opacity:1;transform:none}
```

With:
```css
/* Legacy reveal classes removed — now handled by Framer Motion <Reveal> components */
```

- [ ] **Step 3: Verify Reveal components render correctly**

This step is a sanity check. Import `Reveal` in App.jsx temporarily and wrap any section:

```jsx
import { Reveal } from './components/animations/Reveal'
```

Wrap one section (e.g. Benefits) in `<Reveal>` and confirm it fades in on scroll. Then revert the temporary test — the real integration happens in Task 8.

- [ ] **Step 4: Commit**

```bash
git add src/components/animations/Reveal.jsx src/styles/main.css
git commit -m "feat: add Framer Motion reveal system (Reveal, MaskReveal, RevealGroup)"
```

---

### Task 7: CountUp and TextSplit Utilities

**Files:**
- Create: `src/components/animations/CountUp.jsx`
- Create: `src/components/animations/TextSplit.jsx`

- [ ] **Step 1: Create CountUp component**

Create `src/components/animations/CountUp.jsx`:

```jsx
import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

export default function CountUp({ value, prefix = '', suffix = '', duration = 1.5, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return

    const num = parseFloat(value)
    if (isNaN(num)) {
      setDisplay(value)
      return
    }

    const start = performance.now()
    const dur = duration * 1000

    function tick(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / dur, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(num * eased))

      if (progress < 1) {
        requestAnimationFrame(tick)
      } else {
        setDisplay(num)
      }
    }

    requestAnimationFrame(tick)
  }, [inView, value, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}{display}{suffix}
    </span>
  )
}
```

- [ ] **Step 2: Create TextSplit component**

Create `src/components/animations/TextSplit.jsx`:

```jsx
import { motion } from 'framer-motion'

export default function TextSplit({ text, stagger = 0.03, className = '', as = 'span' }) {
  const words = text.split(' ')
  const Component = motion[as] || motion.span

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
      style={{ display: 'inline' }}
    >
      {words.map((word, i) => (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden' }}>
          <motion.span
            style={{ display: 'inline-block' }}
            variants={{
              hidden: { y: '100%', opacity: 0 },
              visible: { y: 0, opacity: 1 },
            }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 && '\u00A0'}
        </span>
      ))}
    </Component>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/animations/CountUp.jsx src/components/animations/TextSplit.jsx
git commit -m "feat: add CountUp and TextSplit animation utilities"
```

---

### Task 8: Integrate Reveals into All Sections

**Files:**
- Modify: `src/components/Sections.jsx`
- Modify: `src/App.jsx`

This is the largest task. It wraps every section's content in the appropriate Reveal components, replacing the old `ff-reveal` class approach.

- [ ] **Step 1: Remove useReveal from App.jsx**

In `src/App.jsx`, remove the `useReveal` import and call:

```jsx
import HeroA from './components/HeroA'
import StickyNav from './components/StickyNav'
import { ProblemSolution, ProcessSection, Benefits, TrustSection, Portfolio, FAQSection, FinalCTA, Footer } from './components/Sections'
import CustomCursor from './components/animations/CustomCursor'

export default function App() {
  return (
    <div style={{ background: 'var(--bg-page)' }}>
      <CustomCursor />
      <HeroA />
      <StickyNav />
      <ProblemSolution />
      <ProcessSection />
      <Benefits />
      <TrustSection />
      <Portfolio />
      <FAQSection />
      <FinalCTA />
      <Footer />
    </div>
  )
}
```

- [ ] **Step 2: Add Reveal imports to Sections.jsx**

At the top of `src/components/Sections.jsx`, add:

```jsx
import { Reveal, MaskReveal, RevealGroup, RevealChild } from './animations/Reveal'
import CountUp from './animations/CountUp'
```

- [ ] **Step 3: Wrap ProblemSolution section content in Reveal**

In the ProblemSolution component, remove the `ff-reveal` class from the `<section>` element and wrap the section head and slider in Reveal components. The section tag stays for layout, but the inner content animates:

Replace the `<section className="ff-section dark ff-reveal" id="problem">` with `<section className="ff-section dark" id="problem">`.

Wrap the `.ff-section-head` div inside a `<Reveal>`:
```jsx
<Reveal>
  <div className="ff-section-head">
    {/* existing eyebrow, heading, body */}
  </div>
</Reveal>
```

Wrap the `.slider-wrap` inside a `<Reveal delay={0.2}>`:
```jsx
<Reveal delay={0.2}>
  <div className="slider-wrap" data-cursor="slider" ...>
    {/* existing slider content */}
  </div>
</Reveal>
```

- [ ] **Step 4: Wrap ProcessSection content in Reveal**

Remove `ff-reveal` from section tag. Wrap the section head in `<Reveal>`. Wrap the steps grid in `<RevealGroup>` and each step card in `<RevealChild variant="slideRight">`:

```jsx
<section className="ff-section sunken" id="process">
  <div className="ff-container">
    <Reveal>
      <div className="ff-section-head">
        {/* existing heading content */}
      </div>
    </Reveal>
    <RevealGroup className="ff-process-grid" stagger={0.12}>
      {PROCESS_STEPS.map((s, i) => (
        <RevealChild variant="slideRight" key={i}>
          <div
            className={`ff-process-card ${hovered === i ? 'featured' : ''}`}
            onMouseEnter={() => setHovered(i)}
            style={hovered === i ? { background: colors[i].bg, color: colors[i].color } : {}}
          >
            {/* existing card content */}
          </div>
        </RevealChild>
      ))}
    </RevealGroup>
  </div>
</section>
```

- [ ] **Step 5: Wrap Benefits content in Reveal**

Remove `ff-reveal` from section tag. Wrap heading in `<Reveal>`. Wrap the benefits grid in `<RevealGroup>` and each benefit card in `<RevealChild>`:

```jsx
<section className="ff-section paper" id="benefits">
  <div className="ff-container">
    <Reveal>
      <div className="ff-section-head centered">
        {/* existing heading */}
      </div>
    </Reveal>
    <RevealGroup className="ff-benefits-grid" stagger={0.08}>
      {BENEFITS.map((b, i) => (
        <RevealChild key={i}>
          <div className="ff-benefit-card">
            {/* existing card content */}
          </div>
        </RevealChild>
      ))}
    </RevealGroup>
  </div>
</section>
```

- [ ] **Step 6: Wrap TrustSection content in Reveal**

Remove `ff-reveal` from section tag. Wrap the quote in `<Reveal>`, the illustration in `<Reveal delay={0.15}>`:

```jsx
<section className="ff-section sunken">
  <div className="ff-container">
    <Reveal>
      <div className="ff-trust-content">
        {/* existing quote content */}
      </div>
    </Reveal>
    <Reveal delay={0.15}>
      {/* existing illustration/team content */}
    </Reveal>
  </div>
</section>
```

- [ ] **Step 7: Wrap Portfolio content in Reveal with CountUp**

Remove `ff-reveal` from section tag. Wrap heading in `<Reveal>`. Wrap the portfolio grid in `<RevealGroup>` and each card in `<RevealChild variant="scaleUp">`. Replace stat text with `<CountUp>`:

For each portfolio card's stat, replace the static text (e.g. `+22%`) with:
```jsx
<CountUp value={22} prefix="+" suffix="%" />
```

Do this for each project's stat value. Parse the numeric value from each `p.stat` string.

- [ ] **Step 8: Wrap FAQSection content in Reveal**

Remove `ff-reveal` from section tag. Wrap heading in `<Reveal>`. Wrap each FAQ item in `<Reveal delay={i * 0.06}>`:

```jsx
<section className="ff-section paper" id="faq">
  <div className="ff-container">
    <Reveal>
      <div className="ff-section-head centered">
        {/* heading */}
      </div>
    </Reveal>
    {FAQS.map((f, i) => (
      <Reveal key={i} delay={i * 0.06}>
        <div className={`ff-faq-item ${open === i ? 'open' : ''}`} data-cursor="faq">
          {/* existing FAQ content */}
        </div>
      </Reveal>
    ))}
  </div>
</section>
```

- [ ] **Step 9: Wrap FinalCTA content in Reveal**

Remove `ff-reveal` from section tag. Wrap content in `<Reveal>`:

```jsx
<section className="ff-section paper" id="final" data-cursor="cta">
  <div className="ff-container">
    <Reveal>
      {/* existing CTA content */}
    </Reveal>
  </div>
</section>
```

- [ ] **Step 10: Wrap Footer in Reveal**

Wrap the footer columns in `<RevealGroup stagger={0.06}>` and each column in `<RevealChild>`.

- [ ] **Step 11: Verify all sections animate on scroll**

Open http://localhost:5173. Scroll through the entire page. Each section should:
- Fade in as it enters viewport
- Cards should stagger in sequence
- Process cards should slide from left
- Portfolio cards should scale up
- Stats should count up from 0
- No section should be invisible or stuck at opacity 0

- [ ] **Step 12: Commit**

```bash
git add src/components/Sections.jsx src/App.jsx
git commit -m "feat: integrate Framer Motion reveals into all sections, replace useReveal"
```

---

### Task 9: StickyNav Spring Entrance

**Files:**
- Modify: `src/components/StickyNav.jsx`

- [ ] **Step 1: Add Framer Motion spring entrance to StickyNav**

Modify `src/components/StickyNav.jsx`. Import motion from framer-motion and replace the outer `<div>` for the sticky bar with a `motion.div` that animates based on the `scrolled` state:

```jsx
import { motion, AnimatePresence } from 'framer-motion'
```

Replace the sticky bar div:
```jsx
<AnimatePresence>
  {scrolled && (
    <motion.div
      className="ff-sticky-bar visible"
      initial={{ y: '-100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '-100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      {/* existing sticky bar content */}
    </motion.div>
  )}
</AnimatePresence>
```

Remove the conditional `visible` class since AnimatePresence now handles show/hide. The CSS `.ff-sticky-bar` should always have `position: fixed` and the visibility styles can be simplified.

- [ ] **Step 2: Verify spring entrance**

Open http://localhost:5173. Scroll past the hero — the sticky nav should spring down from the top with a slight overshoot. Scroll back up past the hero — it should slide up and disappear.

- [ ] **Step 3: Commit**

```bash
git add src/components/StickyNav.jsx
git commit -m "feat: add spring entrance animation to sticky navigation"
```

---

### Task 10: Navigation Link Underline Animation

**Files:**
- Modify: `src/styles/main.css`

- [ ] **Step 1: Add underline slide animation to nav links**

In `src/styles/main.css`, find the sidebar link styles (around line 900-910). Add an `::after` pseudo-element for the underline animation:

```css
.ff-sidebar-link {
  position: relative;
}

.ff-sidebar-link::after {
  content: '';
  position: absolute;
  bottom: 8px;
  left: 24px;
  right: 24px;
  height: 2px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s var(--ease-out);
}

.ff-sidebar-link:hover::after {
  transform: scaleX(1);
}
```

- [ ] **Step 2: Verify underline animation**

Open http://localhost:5173 on mobile viewport (or click hamburger). Open sidebar — hover over nav links. An underline should slide in from the left on hover.

- [ ] **Step 3: Commit**

```bash
git add src/styles/main.css
git commit -m "feat: add sliding underline animation to navigation links"
```

---

### Task 11: Portfolio Card Hover Interactions

**Files:**
- Create: `src/hooks/useMouseParallax.js`
- Modify: `src/components/Sections.jsx` (Portfolio section)
- Modify: `src/styles/main.css`

- [ ] **Step 1: Create useMouseParallax hook**

Create `src/hooks/useMouseParallax.js`:

```js
import { useRef, useCallback } from 'react'

export default function useMouseParallax(maxOffset = 8) {
  const ref = useRef(null)

  const onMouseMove = useCallback((e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    const img = el.querySelector('.ff-port-img')
    if (img) {
      img.style.transform = `translate(${x * maxOffset}px, ${y * maxOffset}px)`
    }
  }, [maxOffset])

  const onMouseLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    const img = el.querySelector('.ff-port-img')
    if (img) {
      img.style.transition = 'transform 0.4s var(--ease-out)'
      img.style.transform = ''
      setTimeout(() => {
        if (img) img.style.transition = ''
      }, 400)
    }
  }, [])

  return { ref, onMouseMove, onMouseLeave }
}
```

- [ ] **Step 2: Add hover interactions to Portfolio cards in Sections.jsx**

In the Portfolio component, apply mouse parallax to each card. Import the hook and apply it to each card. Since we have 4 cards, we need refs for each. Use a simpler inline approach instead:

Add the parallax event handlers directly to each portfolio card `<a>` element:

```jsx
<a
  href={p.link}
  target="_blank"
  className="ff-port-card"
  data-cursor="portfolio"
  style={{ background: p.bg }}
  key={i}
  onMouseMove={(e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    const img = e.currentTarget.querySelector('.ff-port-img')
    if (img) img.style.transform = `translate(${x * 8}px, ${y * 8}px)`
  }}
  onMouseLeave={(e) => {
    const img = e.currentTarget.querySelector('.ff-port-img')
    if (img) {
      img.style.transition = 'transform 0.4s var(--ease-out)'
      img.style.transform = ''
      setTimeout(() => { if (img) img.style.transition = '' }, 400)
    }
  }}
>
```

- [ ] **Step 3: Add portfolio card hover CSS enhancements**

In `src/styles/main.css`, find the portfolio card styles (around line 623-652). Add:

```css
.ff-port-card .ff-port-img {
  will-change: transform;
}

.ff-port-card:hover .ff-port-stat {
  animation: stat-pulse 0.3s var(--ease-spring);
}

@keyframes stat-pulse {
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.ff-port-card:hover .ff-port-tag {
  transition: opacity 0.2s, transform 0.2s;
}
```

- [ ] **Step 4: Verify portfolio card interactions**

Open http://localhost:5173. Scroll to portfolio section. Hover over a card — the image should shift subtly following the mouse (max 8px). The stat number should pulse once. Moving mouse away should spring the image back smoothly.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useMouseParallax.js src/components/Sections.jsx src/styles/main.css
git commit -m "feat: add mouse parallax and hover interactions to portfolio cards"
```

---

### Task 12: Process Card Hover Enhancements

**Files:**
- Modify: `src/styles/main.css`

- [ ] **Step 1: Add process card hover animations**

In `src/styles/main.css`, find the process card styles (around line 574-600). Add/enhance:

```css
.ff-process-card {
  transition: background 0.5s var(--ease-out), color 0.5s var(--ease-out);
  overflow: hidden;
  position: relative;
}

.ff-process-card .ff-process-icon {
  transition: transform 0.5s var(--ease-spring);
}

.ff-process-card:hover .ff-process-icon {
  animation: icon-wiggle 0.5s var(--ease-spring);
}

@keyframes icon-wiggle {
  20% { transform: rotate(10deg); }
  60% { transform: rotate(-5deg); }
  100% { transform: rotate(0deg); }
}

.ff-process-card .ff-process-num {
  transition: transform 0.3s var(--ease-spring);
}

.ff-process-card:hover .ff-process-num {
  transform: scale(1.15);
}
```

- [ ] **Step 2: Verify process card interactions**

Open http://localhost:5173. Scroll to process section. Hover over each step card — the icon should do a playful wiggle, and the step number should scale up slightly.

- [ ] **Step 3: Commit**

```bash
git add src/styles/main.css
git commit -m "feat: add icon wiggle and number scale to process card hovers"
```

---

### Task 13: Benefit Card Hover Enhancements

**Files:**
- Modify: `src/styles/main.css`

- [ ] **Step 1: Add benefit card hover animations**

In `src/styles/main.css`, find the benefit card styles (around line 602-620). Add:

```css
.ff-benefit-card {
  transition: transform 0.3s var(--ease-out), box-shadow 0.3s var(--ease-out);
}

.ff-benefit-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--sh-md);
}

.ff-benefit-card .ff-benefit-icon {
  transition: transform 0.5s var(--ease-spring), filter 0.6s ease;
}

.ff-benefit-card:hover .ff-benefit-icon {
  animation: icon-bounce 0.5s var(--ease-spring);
  filter: hue-rotate(15deg);
}

@keyframes icon-bounce {
  40% { transform: translateY(-6px); }
  100% { transform: translateY(0); }
}
```

- [ ] **Step 2: Verify benefit card interactions**

Open http://localhost:5173. Scroll to benefits section. Hover over each card — it should lift 4px with a deeper shadow. The icon should bounce and shift color slightly.

- [ ] **Step 3: Commit**

```bash
git add src/styles/main.css
git commit -m "feat: add lift, bounce, and hue-shift to benefit card hovers"
```

---

### Task 14: FAQ Accordion AnimatePresence

**Files:**
- Modify: `src/components/Sections.jsx` (FAQSection)

- [ ] **Step 1: Replace FAQ max-height transition with AnimatePresence**

In `src/components/Sections.jsx`, import `AnimatePresence` and `motion` from framer-motion at the top:

```jsx
import { motion, AnimatePresence } from 'framer-motion'
```

In the FAQSection component, replace the answer rendering with AnimatePresence. Instead of relying on CSS max-height, render the answer conditionally:

```jsx
{FAQS.map((f, i) => (
  <Reveal key={i} delay={i * 0.06}>
    <div className={`ff-faq-item ${open === i ? 'open' : ''}`} data-cursor="faq">
      <button className="ff-faq-q" onClick={() => setOpen(open === i ? null : i)}>
        <span>{f.q}</span>
        <motion.span
          className="ff-faq-icon"
          animate={{ rotate: open === i ? 45 : 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
        >
          +
        </motion.span>
      </button>
      <AnimatePresence>
        {open === i && (
          <motion.div
            className="ff-faq-a"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingBottom: 20 }}>{f.a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </Reveal>
))}
```

- [ ] **Step 2: Update FAQ CSS to remove old max-height transition**

In `src/styles/main.css`, find the FAQ styles (around line 675-695). Remove any `max-height` and `overflow: hidden` transitions on `.ff-faq-a` since AnimatePresence now handles this. Keep the base styling (padding, font-size, etc.).

Also add a background tint for the open item:

```css
.ff-faq-item.open {
  background: var(--bg-surface);
  border-radius: var(--r-card);
}
```

- [ ] **Step 3: Verify FAQ animations**

Open http://localhost:5173. Scroll to FAQ section. Click a question — the answer should smoothly expand with height animation. The plus icon should spring-rotate to an X (45deg). Click again — it should smoothly collapse. The open item should have a subtle background tint.

- [ ] **Step 4: Commit**

```bash
git add src/components/Sections.jsx src/styles/main.css
git commit -m "feat: replace FAQ max-height with Framer Motion AnimatePresence"
```

---

### Task 15: FFStamp Hover & Easter Egg

**Files:**
- Modify: `src/components/Primitives.jsx`
- Modify: `src/styles/main.css`

- [ ] **Step 1: Add hover speed-up and click Easter egg to FFStamp**

In `src/components/Primitives.jsx`, modify the FFStamp component to add hover and click interactions:

```jsx
import { useState, useCallback } from 'react'

export function FFStamp({ className = '', spin = true, size = 140 }) {
  const [fast, setFast] = useState(false)
  const [clicking, setClicking] = useState(false)

  const onClick = useCallback(() => {
    setClicking(true)
    setTimeout(() => setClicking(false), 400)
  }, [])

  return (
    <div
      className={`ff-stamp ${className} ${fast ? 'ff-stamp-fast' : ''} ${clicking ? 'ff-stamp-click' : ''}`}
      style={{ width: size, height: size }}
      onMouseEnter={() => setFast(true)}
      onMouseLeave={() => setFast(false)}
      onClick={onClick}
    >
      <img src="/stamp-ring.svg" className={`ff-stamp-ring ${spin ? 'spinning' : ''}`} alt="" />
      <img src="/stamp-22.svg" className="ff-stamp-logo" alt="22" />
    </div>
  )
}
```

- [ ] **Step 2: Add stamp hover/click CSS**

In `src/styles/main.css`, find the stamp styles and add:

```css
.ff-stamp {
  transition: transform 0.3s var(--ease-spring);
}

.ff-stamp:hover {
  transform: scale(1.05);
}

.ff-stamp-fast .ff-stamp-ring.spinning {
  animation-duration: 4s !important;
}

.ff-stamp-click .ff-stamp-ring.spinning {
  animation-duration: 0.4s !important;
}
```

- [ ] **Step 3: Verify stamp interactions**

Open http://localhost:5173. Find the stamp (FinalCTA section). Hover over it — it should scale up slightly and the ring should spin faster (4s vs 18s). Click it — the ring should do a fast full spin (0.4s). Mouse away — it should spring back to normal size and speed.

- [ ] **Step 4: Commit**

```bash
git add src/components/Primitives.jsx src/styles/main.css
git commit -m "feat: add hover speed-up and click easter egg to FFStamp"
```

---

### Task 16: Problem/Solution Slider Enhancements

**Files:**
- Modify: `src/components/Sections.jsx` (ProblemSolution)
- Modify: `src/styles/main.css`

- [ ] **Step 1: Add handle breathing pulse and label fading**

In `src/components/Sections.jsx`, in the ProblemSolution component, add a `dragging` state and apply it to the handle and labels:

```jsx
const [dragging, setDragging] = useState(false)
```

On the slider container, add `onMouseDown={() => setDragging(true)}` and on `window` mouseup/touchend set it back to false (add to existing event handling).

On the handle element, add a class based on dragging state:
```jsx
<div className={`slider-handle ${dragging ? 'grabbing' : 'idle'}`} style={{ left: `${split}%` }}>
```

For the before/after labels, add opacity based on split position:
```jsx
<span className="slider-label left" style={{ opacity: split > 30 ? 1 : 0 }}>Előtte</span>
<span className="slider-label right" style={{ opacity: split < 70 ? 1 : 0 }}>Utána</span>
```

- [ ] **Step 2: Add slider CSS enhancements**

In `src/styles/main.css`, add:

```css
.slider-handle.idle {
  animation: handle-breathe 2s ease-in-out infinite;
}

.slider-handle.grabbing {
  animation: none;
  cursor: grabbing;
}

.slider-label {
  position: absolute;
  top: 16px;
  font-size: var(--fs-eyebrow);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.slider-label.left {
  left: 16px;
}

.slider-label.right {
  right: 16px;
}
```

- [ ] **Step 3: Verify slider enhancements**

Open http://localhost:5173. Scroll to the problem/solution slider. The handle should pulse gently when idle. Grab and drag — pulse stops. Before/after labels should fade based on slider position.

- [ ] **Step 4: Commit**

```bash
git add src/components/Sections.jsx src/styles/main.css
git commit -m "feat: add breathing handle and dynamic labels to problem/solution slider"
```

---

### Task 17: Cinematic Portfolio Section (Ken Burns + Rotation)

**Files:**
- Modify: `src/components/Sections.jsx` (Portfolio section)
- Modify: `src/styles/main.css`

- [ ] **Step 1: Add alternating rotation to portfolio card reveals**

In the Portfolio component's RevealGroup, modify each RevealChild to alternate rotation:

```jsx
<RevealChild
  variant="scaleUp"
  key={i}
  style={{ '--reveal-rotate': i % 2 === 0 ? '-1deg' : '1deg' }}
>
```

Update the `scaleUp` variant in `src/components/animations/Reveal.jsx` to include rotation from CSS variable. Actually, it's simpler to add the rotation directly as a custom motion on the portfolio cards:

In the Portfolio component, replace `<RevealChild variant="scaleUp">` with a `motion.div`:

```jsx
<motion.div
  key={i}
  variants={{
    hidden: { opacity: 0, scale: 0.95, rotate: i % 2 === 0 ? -1 : 1 },
    visible: { opacity: 1, scale: 1, rotate: 0 },
  }}
  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
>
  <a href={p.link} ... >
    {/* card content */}
  </a>
</motion.div>
```

- [ ] **Step 2: Add Ken Burns trigger via IntersectionObserver**

In the Portfolio component, add a useEffect that observes each card image and adds the `ken-burns-active` class when fully visible:

```jsx
import { useEffect, useRef } from 'react'

// Inside Portfolio component:
const gridRef = useRef(null)

useEffect(() => {
  const mq = window.matchMedia('(max-width: 768px)')
  if (mq.matches) return // skip on mobile

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target.querySelector('.ff-port-img')
          if (img) img.classList.add('ken-burns-active')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.8 }
  )

  const cards = gridRef.current?.querySelectorAll('.ff-port-card')
  cards?.forEach((card) => observer.observe(card))

  return () => observer.disconnect()
}, [])
```

Add `ref={gridRef}` to the portfolio grid container.

- [ ] **Step 3: Verify cinematic portfolio effects**

Open http://localhost:5173. Scroll to portfolio section. Cards should fade in with a slight rotation that straightens. Once fully visible, card images should begin a slow Ken Burns drift (subtle scale + translate over 8s). On mobile viewport, Ken Burns should not activate.

- [ ] **Step 4: Commit**

```bash
git add src/components/Sections.jsx src/components/animations/Reveal.jsx src/styles/main.css
git commit -m "feat: add alternating rotation reveals and Ken Burns effect to portfolio"
```

---

### Task 18: Cinematic Process Section (Scroll-Pinned Sequence)

**Files:**
- Modify: `src/components/Sections.jsx` (ProcessSection)
- Modify: `src/styles/main.css`

- [ ] **Step 1: Rebuild ProcessSection with scroll-driven sticky reveal**

Replace the ProcessSection component with a scroll-pinned version. The outer container is tall (~150vh) to create scroll room, while the inner content stays sticky:

```jsx
import { useScroll, useTransform, motion } from 'framer-motion'

function ProcessSection() {
  const [hovered, setHovered] = useState(0)
  const containerRef = useRef(null)
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const colors = [
    { bg: 'var(--c-mustard)', color: 'var(--fg-1)' },
    { bg: 'var(--c-violet-100)', color: 'var(--fg-1)' },
    { bg: 'var(--c-mint)', color: 'var(--fg-1)' },
  ]

  if (isMobile) {
    // Mobile: standard staggered reveals, no pinning
    return (
      <section className="ff-section sunken" id="process">
        <div className="ff-container">
          <Reveal>
            <div className="ff-section-head">
              <div>
                <span className="ff-eyebrow">Hogyan működik</span>
                <h2>3 lépésben kész</h2>
              </div>
              <p className="ff-section-body">A folyamatunk átlátható és gyors.</p>
            </div>
          </Reveal>
          <RevealGroup className="ff-process-grid" stagger={0.15}>
            {PROCESS_STEPS.map((s, i) => (
              <RevealChild variant="fadeUp" key={i}>
                <div className="ff-process-card" style={{ background: colors[i].bg, color: colors[i].color }}>
                  <span className="ff-process-num">{s.n}</span>
                  <span className="ff-eyebrow">{s.label}</span>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </RevealChild>
            ))}
          </RevealGroup>
        </div>
      </section>
    )
  }

  return (
    <section
      ref={containerRef}
      className="ff-process-scroll-container"
      id="process"
      style={{ height: '250vh', position: 'relative' }}
    >
      <div className="ff-process-sticky" style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: 'var(--bg-sunken)',
      }}>
        <div className="ff-container">
          <Reveal>
            <div className="ff-section-head">
              <div>
                <span className="ff-eyebrow">Hogyan működik</span>
                <h2>3 lépésben kész</h2>
              </div>
              <p className="ff-section-body">A folyamatunk átlátható és gyors.</p>
            </div>
          </Reveal>
          <div className="ff-process-grid">
            {PROCESS_STEPS.map((s, i) => (
              <ProcessStep
                key={i}
                step={s}
                index={i}
                color={colors[i]}
                progress={scrollYProgress}
              />
            ))}
          </div>
          {/* Connecting line */}
          <svg className="ff-process-line" style={{
            position: 'absolute',
            top: '50%',
            left: '10%',
            width: '80%',
            height: 4,
            overflow: 'visible',
          }}>
            <motion.line
              x1="0" y1="2" x2="100%" y2="2"
              stroke="var(--c-violet-200)"
              strokeWidth="2"
              strokeDasharray="4 4"
              style={{
                pathLength: useTransform(scrollYProgress, [0, 1], [0, 1]),
              }}
            />
          </svg>
        </div>
      </div>
    </section>
  )
}

function ProcessStep({ step, index, color, progress }) {
  const start = index / 3
  const end = (index + 1) / 3

  const opacity = useTransform(progress, [start, start + 0.1], [0, 1])
  const y = useTransform(progress, [start, start + 0.15], [40, 0])
  const scale = useTransform(progress, [start, start + 0.1], [0.9, 1])

  return (
    <motion.div
      className="ff-process-card"
      style={{
        opacity,
        y,
        scale,
        background: color.bg,
        color: color.color,
      }}
    >
      <span className="ff-process-num">{step.n}</span>
      <span className="ff-eyebrow">{step.label}</span>
      <h3>{step.title}</h3>
      <p>{step.desc}</p>
    </motion.div>
  )
}
```

- [ ] **Step 2: Add process scroll container CSS**

In `src/styles/main.css`, add:

```css
.ff-process-scroll-container {
  padding: 0;
}

.ff-process-sticky .ff-process-grid {
  position: relative;
  z-index: 1;
}

.ff-process-line {
  z-index: 0;
  pointer-events: none;
}
```

- [ ] **Step 3: Verify scroll-pinned process section**

Open http://localhost:5173. Scroll to the process section. The section should stay pinned to the viewport. As you scroll, each of the 3 steps should reveal one at a time (fade in, slide up, scale). A dotted connecting line should draw between them. After all 3 are revealed, the section should unpin and normal scrolling resumes. On mobile viewport, it should be a simple staggered reveal (no pinning).

- [ ] **Step 4: Commit**

```bash
git add src/components/Sections.jsx src/styles/main.css
git commit -m "feat: add scroll-pinned sequential reveal to process section"
```

---

### Task 19: Cinematic Trust Section (Quote Word Opacity + Spring Quote Mark)

**Files:**
- Modify: `src/components/Sections.jsx` (TrustSection)

- [ ] **Step 1: Add scroll-linked word opacity and spring quotation mark**

Rebuild TrustSection with cinematic treatments:

```jsx
import { useScroll, useTransform, motion } from 'framer-motion'

function TrustSection() {
  const sectionRef = useRef(null)
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const quoteText = "A 22.design csapatával dolgozni igazi élmény volt. Profi, gyors, és az eredmény minden várakozásunkat felülmúlta."
  const words = quoteText.split(' ')

  // Parallax for illustration
  const illustrationY = useTransform(scrollYProgress, [0, 1], [40, -40])

  return (
    <section className="ff-section sunken" ref={sectionRef}>
      <div className="ff-container">
        {/* Quotation mark with spring */}
        <motion.div
          className="ff-quote-mark"
          initial={{ scale: 2, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: 'spring', damping: 8, stiffness: 80 }}
        >
          &ldquo;
        </motion.div>

        {/* Word-by-word opacity reveal */}
        <blockquote className="ff-trust-quote">
          {isMobile ? (
            <Reveal><p>{quoteText}</p></Reveal>
          ) : (
            <p>
              {words.map((word, i) => (
                <WordReveal
                  key={i}
                  word={word}
                  index={i}
                  total={words.length}
                  progress={scrollYProgress}
                />
              ))}
            </p>
          )}
        </blockquote>

        {/* Illustration with parallax */}
        <motion.div className="ff-trust-illustration" style={{ y: illustrationY }}>
          {/* existing illustration content */}
        </motion.div>

        {/* Star rating stagger */}
        <motion.div
          className="ff-trust-stars"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.span
              key={star}
              variants={{
                hidden: { scale: 0, opacity: 0 },
                visible: { scale: 1, opacity: 1 },
              }}
              transition={{ type: 'spring', damping: 12, stiffness: 200 }}
            >
              ★
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function WordReveal({ word, index, total, progress }) {
  const start = index / total * 0.6
  const end = start + 0.15
  const opacity = useTransform(progress, [start, end], [0.15, 1])

  return (
    <motion.span style={{ opacity, display: 'inline-block', marginRight: '0.3em' }}>
      {word}
    </motion.span>
  )
}
```

**Note:** This task requires adapting to the actual TrustSection's exact content structure. Read the existing component to match its quote text and elements precisely. The code above shows the pattern — adapt the quote text, illustration, and star rendering to match what's actually in the component.

- [ ] **Step 2: Verify trust section animations**

Open http://localhost:5173. Scroll to the trust section. The large quotation mark should spring in from 2x scale, overshooting slightly before settling. As you scroll through the section, each word of the quote should fade from dim (0.15 opacity) to full (1.0) based on scroll progress. Stars should pop in one by one with scale spring. On mobile, the quote should do a simple fade-in instead of word-by-word.

- [ ] **Step 3: Commit**

```bash
git add src/components/Sections.jsx
git commit -m "feat: add cinematic quote reveal with word opacity and spring quotation mark"
```

---

### Task 20: Final Polish & Cleanup

**Files:**
- Modify: `src/components/Primitives.jsx` (remove unused useReveal)
- Verify: all files

- [ ] **Step 1: Clean up useReveal**

In `src/components/Primitives.jsx`, the `useReveal` hook (lines 57-66) is no longer used. Remove it and its export. Check if anything else imports it:

```bash
grep -r "useReveal" src/
```

If nothing imports it (after App.jsx was cleaned in Task 8), delete the hook function. If HeroA.jsx or anything else still uses it, leave it.

- [ ] **Step 2: Remove unused ff-reveal CSS if no elements use the class**

```bash
grep -r "ff-reveal" src/
```

If the class is still used in HeroA.jsx (the hero section we didn't touch), keep the CSS. If nothing uses it, remove the commented-out CSS from Task 6.

- [ ] **Step 3: Full visual regression test**

Open http://localhost:5173. Scroll through the entire page top to bottom. Check:

1. Hero loads correctly (UNTOUCHED)
2. Smooth scroll feels buttery
3. Custom cursor follows mouse, changes state per element
4. Sticky nav springs down on scroll
5. ProblemSolution slider handle breathes, labels fade
6. Process section pins and reveals steps sequentially
7. Benefits cards lift and bounce on hover
8. Trust section quote reveals word-by-word
9. Portfolio cards have parallax hover, Ken Burns, count-up stats
10. FAQ accordion animates height smoothly with spring rotation
11. FinalCTA stamp speeds up on hover, Easter egg on click
12. Footer columns stagger in
13. Scroll velocity skew is subtle during fast scroll
14. Mobile viewport: cursor hidden, no pinning, simpler animations

- [ ] **Step 4: Commit final cleanup**

```bash
git add -A
git commit -m "chore: clean up unused useReveal hook and finalize animation system"
```

---

## Task Dependency Graph

```
Task 1 (deps) → Task 2 (tokens) → Task 3 (Lenis)
                                 → Task 4 (Cursor)
                                 → Task 5 (Magnetic)
                                 → Task 6 (Reveal system)
                                 → Task 7 (CountUp + TextSplit)

Task 6 + 7 → Task 8 (Integrate reveals into sections)

Task 4 → Task 8 (data-cursor attributes already on elements)

Task 8 → Task 9 (StickyNav)
      → Task 10 (Nav underlines)
      → Task 11 (Portfolio hovers)
      → Task 12 (Process hovers)
      → Task 13 (Benefit hovers)
      → Task 14 (FAQ AnimatePresence)
      → Task 15 (Stamp)
      → Task 16 (Slider)

Tasks 11-16 → Task 17 (Cinematic portfolio)
            → Task 18 (Cinematic process)
            → Task 19 (Cinematic trust)

Tasks 17-19 → Task 20 (Final polish)
```

Tasks 3, 4, 5, 6, 7 can run in parallel after Task 2.
Tasks 9-16 can run in parallel after Task 8.
Tasks 17, 18, 19 can run in parallel after the microinteraction tasks.
