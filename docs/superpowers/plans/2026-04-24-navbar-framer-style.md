# Navbar Framer Style Migration

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the current `FFNav` navbar to match the visual style of the Framer-exported 22.design header — solid dark pill buttons, refined CTA, tighter spacing — while keeping the existing menu items and anchor links.

**Architecture:** Pure CSS changes in `src/styles/main.css`. No component changes needed. The Framer component itself (275KB generated code) is not imported — we extract its visual language into our existing stylesheet.

**Tech Stack:** CSS, existing CSS custom properties from `tokens.css`

---

### Task 1: Update nav container layout

**Files:**
- Modify: `src/styles/main.css:70-75` (`.ff-nav` block)

- [ ] **Step 1: Update `.ff-nav` padding and max-width**

Change the nav container to match Framer header dimensions: 28px top padding, 30px horizontal, 1200px max-width.

```css
/* ═══════════════════════ Nav ═══════════════════════ */
.ff-nav {
  display: flex; align-items: center; gap: 14px;
  padding: 28px 30px 0px 30px; max-width: 1200px; margin: 0 auto;
  position: relative; z-index: 20;
}
```

- [ ] **Step 2: Visual check**

Run: `npm run dev` (or whatever dev server command)
Verify the nav is slightly narrower and the top padding matches the Framer header.

---

### Task 2: Restyle nav links as solid dark pills

**Files:**
- Modify: `src/styles/main.css:97-108` (`.ff-nav-links` and `.ff-nav-link` blocks)

- [ ] **Step 1: Update nav link gap and link styling**

Replace the transparent-border pills with solid midnight-blue background pills matching the Framer header.

```css
.ff-nav-links { display: flex; gap: 8px; margin-left: 32px; }
.ff-nav-link {
  padding: 10px 20px; border-radius: 999px;
  font-family: var(--ff-body); font-weight: 500; font-size: 13px;
  letter-spacing: 0.04em; text-transform: uppercase;
  color: #fff; text-decoration: none; border: none;
  background: var(--c-midnight-950);
  transition: all .15s var(--ease-out); cursor: pointer;
}
.ff-nav.on-dark .ff-nav-link { background: var(--c-midnight-950); color: #fff; }
.ff-nav.on-dark .ff-nav-link:hover { background: rgba(15,30,60,0.7); }
.ff-nav.on-light .ff-nav-link { background: var(--c-midnight-950); color: #fff; }
.ff-nav.on-light .ff-nav-link:hover { background: rgba(15,30,60,0.7); }
```

- [ ] **Step 2: Visual check**

Verify the nav links now appear as solid dark rounded pills with white text, matching the Framer screenshot.

---

### Task 3: Restyle the CTA button for nav context

**Files:**
- Modify: `src/styles/main.css:109` (`.ff-nav-cta`)

- [ ] **Step 1: Update CTA positioning and button override**

The CTA should match the "LET'S TALK ->" style from the Framer header: white background, dark rounded border, no box-shadow, positioned at far right.

```css
.ff-nav-cta { margin-left: auto; }
.ff-nav-cta .ff-btn {
  padding: 14px 24px 14px 28px;
  border: 2px solid var(--c-midnight-950);
  box-shadow: none;
  font-size: 13px;
  letter-spacing: 0.06em;
}
.ff-nav-cta .ff-btn:hover { transform: none; box-shadow: none; }
.ff-nav-cta .ff-btn:active { transform: none; box-shadow: none; }
```

- [ ] **Step 2: Visual check**

Verify the CTA button appears as a clean rounded pill without the brutalist box-shadow, matching the Framer header's "LET'S TALK" button.

---

### Task 4: Final visual verification and commit

- [ ] **Step 1: Side-by-side comparison**

Open the dev server and compare the navbar against the Framer screenshot. Check:
- Dark pill buttons for menu items
- White/bordered CTA button on the right
- Proper spacing and alignment
- Hover states work on both dark and light backgrounds

- [ ] **Step 2: Commit**

```bash
git add src/styles/main.css
git commit -m "style: restyle navbar to match Framer header design

Solid midnight-blue pill buttons, refined CTA without box-shadow,
tighter spacing matching the 22.design Framer component layout."
```
