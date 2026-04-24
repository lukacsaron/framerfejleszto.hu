# Hero Floating Playful Icons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the left spinning circle and caesar collage with 6 floating, draggable playful icons scattered across the hero section.

**Architecture:** Copy 6 icon assets to `public/assets/flourishes/`, add a `FloatingIcon` component inline in HeroA.jsx that handles CSS-animated floating + pointer-event-based dragging, add float keyframes to main.css. Remove two existing elements.

**Tech Stack:** React 19, vanilla CSS animations, Pointer Events API

---

### Task 1: Copy and rename icon assets

**Files:**
- Copy: `_raw/playful-icons/*.avif` → `public/assets/flourishes/`

- [ ] **Step 1: Copy and rename all 6 icons**

```bash
cp _raw/playful-icons/HFUIGUaHHZR4YYSX02yJLGrcXc.avif public/assets/flourishes/plus-purple.avif
cp _raw/playful-icons/PGayuae1UWXsbtjwhwWLHNHjg.avif public/assets/flourishes/arrow-orange-drawn.avif
cp _raw/playful-icons/X2pNnw4Ng6ks4T2XaNyK4Z1NNo.avif public/assets/flourishes/flower-blue-drawn.avif
cp _raw/playful-icons/jDOUhg937AGv6wy69je6ADL4oA.avif public/assets/flourishes/asterisk-green.avif
cp _raw/playful-icons/uEOwv9nJCJ9UVVsNxCFdFYMYuQ.avif public/assets/flourishes/star-white.avif
cp _raw/playful-icons/x2yzGuv4TF2RnJZjUrwWIAAAQjk.avif public/assets/flourishes/starburst-yellow.avif
```

- [ ] **Step 2: Verify files exist**

```bash
ls -la public/assets/flourishes/{plus-purple,arrow-orange-drawn,flower-blue-drawn,asterisk-green,star-white,starburst-yellow}.avif
```

Expected: All 6 files listed with sizes between 2-10 KB.

- [ ] **Step 3: Commit**

```bash
git add public/assets/flourishes/{plus-purple,arrow-orange-drawn,flower-blue-drawn,asterisk-green,star-white,starburst-yellow}.avif
git commit -m "feat: add playful icon assets for hero floating elements"
```

---

### Task 2: Add float CSS animations

**Files:**
- Modify: `src/styles/main.css:226-228` (after the flourishes section)

- [ ] **Step 1: Add float animation styles after line 228 in main.css**

Insert the following right after the `.ff-wash.lilac` rule (line 230) and before the `/* Hero A */` comment (line 232):

```css
/* Floating playful icons */
.ff-float {
  cursor: grab;
  pointer-events: auto;
  will-change: transform;
  transition: filter 0.2s ease;
}
.ff-float:hover { filter: brightness(1.15); }
.ff-float:active { cursor: grabbing; }
.ff-float.dragging { animation-play-state: paused !important; cursor: grabbing; }

.ff-float-1 { animation: ff-float-1 8s ease-in-out infinite alternate; }
.ff-float-2 { animation: ff-float-2 10s ease-in-out infinite alternate; }
.ff-float-3 { animation: ff-float-3 7s ease-in-out infinite alternate; }
.ff-float-4 { animation: ff-float-4 9s ease-in-out infinite alternate; }
.ff-float-5 { animation: ff-float-5 11s ease-in-out infinite alternate; }
.ff-float-6 { animation: ff-float-6 6.5s ease-in-out infinite alternate; }

@keyframes ff-float-1 {
  from { transform: translate(0, 0) rotate(0deg); }
  to   { transform: translate(6px, -12px) rotate(5deg); }
}
@keyframes ff-float-2 {
  from { transform: translate(0, 0) rotate(0deg); }
  to   { transform: translate(-5px, -10px) rotate(-4deg); }
}
@keyframes ff-float-3 {
  from { transform: translate(0, 0) rotate(0deg); }
  to   { transform: translate(8px, -14px) rotate(6deg); }
}
@keyframes ff-float-4 {
  from { transform: translate(0, 0) rotate(0deg); }
  to   { transform: translate(-4px, -8px) rotate(-3deg); }
}
@keyframes ff-float-5 {
  from { transform: translate(0, 0) rotate(0deg); }
  to   { transform: translate(7px, -11px) rotate(5deg); }
}
@keyframes ff-float-6 {
  from { transform: translate(0, 0) rotate(0deg); }
  to   { transform: translate(-6px, -15px) rotate(-7deg); }
}

@media (prefers-reduced-motion: reduce) {
  .ff-float { animation: none !important; }
}
```

- [ ] **Step 2: Verify CSS is valid**

```bash
npx vite build --mode development 2>&1 | head -5
```

Expected: No CSS parse errors.

- [ ] **Step 3: Commit**

```bash
git add src/styles/main.css
git commit -m "feat: add CSS float animations for playful hero icons"
```

---

### Task 3: Add FloatingIcon component and update HeroA

**Files:**
- Modify: `src/components/HeroA.jsx`

- [ ] **Step 1: Add the FloatingIcon component at the top of HeroA.jsx**

Insert the following after the import statements (after line 6) and before the `export default function HeroA()` line:

```jsx
function FloatingIcon({ src, style, className, alt = '' }) {
  const ref = useRef(null);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });

  const onPointerDown = (e) => {
    const el = ref.current;
    if (!el) return;
    dragging.current = true;
    el.classList.add('dragging');
    el.setPointerCapture(e.pointerId);
    const rect = el.getBoundingClientRect();
    offset.current = { x: e.clientX - rect.left - rect.width / 2, y: e.clientY - rect.top - rect.height / 2 };
  };

  const onPointerMove = (e) => {
    if (!dragging.current) return;
    const el = ref.current;
    const parent = el.offsetParent;
    if (!el || !parent) return;
    const parentRect = parent.getBoundingClientRect();
    const x = e.clientX - parentRect.left - el.offsetLeft - el.offsetWidth / 2 - offset.current.x;
    const y = e.clientY - parentRect.top - el.offsetTop - el.offsetHeight / 2 - offset.current.y;
    pos.current = { x, y };
    el.style.transform = `translate(${x}px, ${y}px)`;
  };

  const onPointerUp = () => {
    const el = ref.current;
    if (!el) return;
    dragging.current = false;
    el.classList.remove('dragging');
    // Keep the element at its dropped position by setting CSS custom properties
    // that offset the animation origin
    el.style.setProperty('--float-x', `${pos.current.x}px`);
    el.style.setProperty('--float-y', `${pos.current.y}px`);
    el.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
  };

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={`ff-flourish ff-float ${className}`}
      style={{ ...style, touchAction: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      draggable={false}
    />
  );
}
```

- [ ] **Step 2: Remove the left FFStamp and caesar collage, add FloatingIcons**

In `HeroA.jsx`, replace lines 48-51:

```jsx
        <FFStamp className="collage-on-only" onDark={true} />
        <img src="/assets/flourishes/asterisk-mint.avif" className="ff-flourish" style={{ top: 40, left: '6%', width: 52, transform: 'rotate(-10deg)' }} alt="" />
        <img src="/assets/flourishes/star-yellow.avif" className="ff-flourish" style={{ top: 140, right: '8%', width: 60, transform: 'rotate(12deg)' }} alt="" />
        <img src="/assets/illustrations/caesar-3d-glasses.avif" className="ff-flourish" style={{ top: 90, left: '2%', width: 120, transform: 'rotate(-6deg)', zIndex: 1 }} alt="" />
```

with:

```jsx
        <img src="/assets/flourishes/asterisk-mint.avif" className="ff-flourish" style={{ top: 40, left: '6%', width: 52, transform: 'rotate(-10deg)' }} alt="" />
        <img src="/assets/flourishes/star-yellow.avif" className="ff-flourish" style={{ top: 140, right: '8%', width: 60, transform: 'rotate(12deg)' }} alt="" />

        <FloatingIcon src="/assets/flourishes/plus-purple.avif" className="ff-float-1" style={{ top: 30, left: '8%', width: 55 }} />
        <FloatingIcon src="/assets/flourishes/arrow-orange-drawn.avif" className="ff-float-2" style={{ top: 180, right: '5%', width: 48 }} />
        <FloatingIcon src="/assets/flourishes/flower-blue-drawn.avif" className="ff-float-3" style={{ bottom: 220, left: '4%', width: 60 }} />
        <FloatingIcon src="/assets/flourishes/asterisk-green.avif" className="ff-float-4" style={{ top: 100, left: '18%', width: 45 }} />
        <FloatingIcon src="/assets/flourishes/star-white.avif" className="ff-float-5" style={{ bottom: 180, right: '12%', width: 50 }} />
        <FloatingIcon src="/assets/flourishes/starburst-yellow.avif" className="ff-float-6" style={{ top: 60, right: '20%', width: 52 }} />
```

- [ ] **Step 3: Verify the dev server renders correctly**

```bash
npm run dev
```

Open the browser, check:
- Left spinning circle is gone
- Caesar statue is gone
- Right spinning circle is still there
- 6 playful icons are visible, floating gently
- Icons are draggable with mouse and touch
- Existing asterisk-mint and star-yellow flourishes are unchanged
- After dragging an icon and releasing, the float animation resumes

- [ ] **Step 4: Commit**

```bash
git add src/components/HeroA.jsx
git commit -m "feat: replace hero collage elements with floating draggable playful icons"
```

---

### Task 4: Visual tuning

**Files:**
- Modify: `src/components/HeroA.jsx` (icon positions/sizes)
- Modify: `src/styles/main.css` (animation parameters)

- [ ] **Step 1: Tune icon positions in the browser**

With the dev server running, adjust the `top/left/right/bottom/width` values on each `FloatingIcon` in HeroA.jsx until the icons are well-distributed:
- No icons overlapping the headline text
- No icons overlapping the CTA buttons
- Icons spread across left, right, top, and bottom edges
- Sizes feel balanced (not all the same, but nothing dominant)

- [ ] **Step 2: Tune animation feel**

Adjust keyframe values in main.css if needed:
- Movement should feel gentle, like swimming/floating — not jerky
- Different icons should not move in sync — check that durations are varied enough
- Rotation should be subtle (under 8deg)

- [ ] **Step 3: Test responsiveness**

Resize the browser to mobile widths. Check:
- Icons don't overflow the hero container
- Icons don't stack on top of each other awkwardly
- Consider hiding some icons on very small screens if they crowd the text

If mobile needs fixes, add a media query:
```css
@media (max-width: 640px) {
  .ff-float { width: 30px !important; }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/HeroA.jsx src/styles/main.css
git commit -m "fix: tune floating icon positions and animation feel"
```
