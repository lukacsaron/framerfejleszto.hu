# Sticky Navbar + Sidebar Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a sticky compact navbar (logo + hamburger) that appears on scroll, with a right-side sidebar menu containing the 5 nav links and CTA.

**Architecture:** New `StickyNav.jsx` component containing the sticky bar and sidebar. Scroll detection via `useEffect` + scroll listener. CSS animations for slide-in/out. Wired into `HeroA.jsx` alongside existing `FFNav`.

**Tech Stack:** React, CSS (no libraries)

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/components/StickyNav.jsx` | Create | Sticky bar + sidebar + scroll detection + open/close state |
| `src/styles/main.css` | Modify (append) | Sticky bar, sidebar, overlay, animation CSS |
| `src/components/HeroA.jsx` | Modify (line 3, 20) | Import and render StickyNav |

---

### Task 1: Create StickyNav component

**Files:**
- Create: `src/components/StickyNav.jsx`

- [ ] **Step 1: Create the StickyNav component file**

```jsx
import { useState, useEffect } from 'react';
import { Arrow } from './Icons';
import { FFButton } from './Primitives';

const NAV_LINKS = [
  { label: 'Probléma', href: '#problem' },
  { label: 'Folyamat', href: '#process' },
  { label: 'Framer', href: '#benefits' },
  { label: 'Munkáink', href: '#works' },
  { label: 'GYIK', href: '#faq' },
];

export default function StickyNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      {/* Sticky bar */}
      <div className={`ff-sticky-bar ${scrolled ? 'visible' : ''}`}>
        <div className="ff-sticky-inner">
          <a href="#" className="ff-sticky-logo">
            <span>22</span>
            <span className="ff-sticky-logo-sub">DESIGN</span>
          </a>
          <button
            className="ff-hamburger"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
              <rect y="0" width="20" height="2" rx="1" fill="#fff" />
              <rect y="6" width="20" height="2" rx="1" fill="#fff" />
              <rect y="12" width="20" height="2" rx="1" fill="#fff" />
            </svg>
          </button>
        </div>
      </div>

      {/* Sidebar overlay */}
      {open && (
        <div className="ff-sidebar-overlay" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar panel */}
      <div className={`ff-sidebar ${open ? 'open' : ''}`}>
        <button
          className="ff-sidebar-close"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M2 2l14 14M16 2L2 16" />
          </svg>
        </button>
        <nav className="ff-sidebar-links">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={href}
              className="ff-sidebar-link"
              href={href}
              onClick={() => setOpen(false)}
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="ff-sidebar-cta">
          <FFButton variant="dark" icon={<Arrow />} onClick={() => setOpen(false)}>
            Beszéljük meg
          </FFButton>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Verify file was created correctly**

Run: `cat src/components/StickyNav.jsx | head -5`
Expected: Shows the import lines.

---

### Task 2: Add CSS for sticky bar, sidebar, and overlay

**Files:**
- Modify: `src/styles/main.css` (append after line 625)

- [ ] **Step 1: Append sticky nav and sidebar CSS to main.css**

Add the following block after the last line of `main.css` (after `.ff-reveal.in { opacity: 1; transform: none; }`):

```css

/* ═══════════════════════ Sticky Nav ═══════════════════════ */
.ff-sticky-bar {
  position: fixed; top: 0; left: 0; right: 0;
  z-index: 50; background: #fff;
  border-bottom: 1px solid rgba(15,30,60,0.08);
  transform: translateY(-100%);
  transition: transform .3s var(--ease-out);
}
.ff-sticky-bar.visible { transform: translateY(0); }
.ff-sticky-inner {
  display: flex; align-items: center; justify-content: space-between;
  max-width: 1200px; margin: 0 auto;
  padding: 12px 30px; height: 56px;
}
.ff-sticky-logo {
  display: inline-flex; align-items: center; gap: 4px;
  background: var(--c-midnight-950); color: #fff;
  padding: 8px 12px; border-radius: 10px;
  font-family: var(--ff-display); font-size: 22px; font-weight: 900;
  letter-spacing: -0.04em; line-height: 1;
  text-decoration: none;
}
.ff-sticky-logo-sub {
  font-family: var(--ff-body); font-size: 8px; font-weight: 800;
  letter-spacing: 0.14em; text-transform: uppercase;
  writing-mode: vertical-lr; text-orientation: mixed;
  line-height: 1;
}
.ff-hamburger {
  width: 44px; height: 44px; border-radius: 10px;
  background: var(--c-orange-600); border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s var(--ease-out);
}
.ff-hamburger:hover { background: var(--c-orange-700); }

/* ═══════════════════════ Sidebar ═══════════════════════ */
.ff-sidebar-overlay {
  position: fixed; inset: 0;
  background: rgba(15,30,60,0.4);
  z-index: 51;
  animation: ff-fade-in .2s ease-out;
}
@keyframes ff-fade-in { from { opacity: 0; } to { opacity: 1; } }

.ff-sidebar {
  position: fixed; top: 0; right: 0; bottom: 0;
  width: 320px; max-width: 85vw;
  background: #fff; z-index: 52;
  padding: 24px;
  display: flex; flex-direction: column;
  transform: translateX(100%);
  transition: transform .3s var(--ease-out);
}
.ff-sidebar.open { transform: translateX(0); }
.ff-sidebar-close {
  align-self: flex-end;
  width: 40px; height: 40px; border-radius: 8px;
  border: none; background: transparent; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: var(--c-midnight-950);
  transition: background .15s var(--ease-out);
}
.ff-sidebar-close:hover { background: rgba(15,30,60,0.06); }
.ff-sidebar-links {
  display: flex; flex-direction: column; gap: 8px;
  margin-top: 32px; flex: 1;
}
.ff-sidebar-link {
  padding: 14px 24px; border-radius: 999px;
  font-family: var(--ff-body); font-weight: 500; font-size: 14px;
  letter-spacing: 0.04em; text-transform: uppercase;
  color: #fff; text-decoration: none;
  background: var(--c-midnight-950);
  transition: background .15s var(--ease-out);
}
.ff-sidebar-link:hover { background: rgba(15,30,60,0.7); }
.ff-sidebar-cta { margin-top: auto; padding-top: 24px; }
.ff-sidebar-cta .ff-btn { width: 100%; justify-content: center; }
```

- [ ] **Step 2: Verify CSS was appended**

Run: `tail -5 src/styles/main.css`
Expected: Shows the last few lines of the sidebar CSS.

---

### Task 3: Wire StickyNav into HeroA

**Files:**
- Modify: `src/components/HeroA.jsx:3,20`

- [ ] **Step 1: Add import**

Add after the existing import line `import { FFNav, FFButton, FFStamp } from './Primitives';` (line 3):

```jsx
import StickyNav from './StickyNav';
```

- [ ] **Step 2: Render StickyNav alongside FFNav**

Replace line 20:
```jsx
      <FFNav onDark={true} />
```

With:
```jsx
      <StickyNav />
      <FFNav onDark={true} />
```

- [ ] **Step 3: Visual verification**

Run: `npm run dev`
Open the site in a browser. Verify:
- On page load, only the original `FFNav` is visible
- Scrolling past ~80px causes the sticky bar to slide in from the top
- Sticky bar has: 22 DESIGN logo badge (left), orange hamburger (right)
- Clicking hamburger opens sidebar from right with overlay
- Sidebar has 5 nav links as dark pills + "Beszéljük meg" CTA at bottom
- Clicking a link closes the sidebar
- Clicking overlay closes the sidebar
- Pressing Escape closes the sidebar
- Scrolling back to top hides the sticky bar
