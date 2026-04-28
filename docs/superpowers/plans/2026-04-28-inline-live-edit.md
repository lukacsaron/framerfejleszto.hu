# Inline Live Edit Mode — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a third "Inline" mode to the live-edit overlay where clicking a tagged element makes the element itself `contentEditable` in place, instead of opening a popover. The popover Edit mode is preserved as a separate mode and serves as auto-fallback for split-text elements.

**Architecture:** All changes are confined to two files in the existing dev-only overlay layer — `src/plugins/live-edit/overlay.js` (vanilla JS IIFE injected via `transformIndexHtml`) and `src/plugins/live-edit/overlay.css`. No server or babel-transform changes. The existing `/__live-edit/save` endpoint is reused unchanged.

**Tech Stack:** Vanilla JS (no React in the overlay), `contentEditable`, `MutationObserver`, the existing `fetch('/__live-edit/save')` endpoint.

**Verification model:** No automated test framework exists in this repo. Every task ends with a manual browser verification step using `npm run dev`. The dev server must be running for verification.

---

## File Structure

Modified files only:

```
src/plugins/live-edit/
├── overlay.js   — Add inline-mode logic, source pill, save/cancel, mode cycle changes
└── overlay.css  — Add inline-mode styles, source pill styles, mode color changes
```

Spec reference: `docs/superpowers/specs/2026-04-28-inline-live-edit-design.md`

---

### Task 1: Extend mode cycle to three modes

**Files:**
- Modify: `src/plugins/live-edit/overlay.js`
- Modify: `src/plugins/live-edit/overlay.css`

The pill currently cycles `null → 'edit' → 'annotate' → null`. After this task it cycles `null → 'inline' → 'edit' → 'annotate' → null`. Inline does not yet do anything on click — that comes in later tasks. This task only updates mode state, label, color, and URL query param.

- [ ] **Step 1: Update `cycleMode()` in `overlay.js`**

Replace the body of `cycleMode()` (currently `overlay.js:71-76`):

```js
function cycleMode() {
  if (mode === null) mode = 'inline';
  else if (mode === 'inline') mode = 'edit';
  else if (mode === 'edit') mode = 'annotate';
  else mode = null;
  applyMode();
}
```

- [ ] **Step 2: Update `updatePill()` in `overlay.js`**

Replace `updatePill()` (currently `overlay.js:60-67`):

```js
function updatePill() {
  if (!pill) return;
  pill.setAttribute('data-mode', mode || '');
  var label = pill.querySelector('.le-pill-label');
  if (mode === 'inline') label.textContent = 'Inline Edit';
  else if (mode === 'edit') label.textContent = 'Edit Mode';
  else if (mode === 'annotate') label.textContent = 'Annotate';
  else label.textContent = 'Live Edit';
}
```

- [ ] **Step 3: Update `updateQueryParam()` in `overlay.js`**

Replace `updateQueryParam()` (currently `overlay.js:89-99`):

```js
function updateQueryParam() {
  var url = new URL(window.location.href);
  if (mode === 'inline') {
    url.searchParams.set('live-edit', 'inline');
  } else if (mode === 'edit') {
    url.searchParams.set('live-edit', 'true');
  } else if (mode === 'annotate') {
    url.searchParams.set('live-edit', 'annotate');
  } else {
    url.searchParams.delete('live-edit');
  }
  window.history.replaceState(null, '', url.toString());
}
```

- [ ] **Step 4: Update `init()` in `overlay.js` to recognise `?live-edit=inline`**

Replace the query-param block inside `init()` (currently `overlay.js:371-379`):

```js
var params = new URLSearchParams(window.location.search);
var leParam = params.get('live-edit');
if (leParam === 'inline') {
  mode = 'inline';
  applyMode();
} else if (leParam === 'annotate') {
  mode = 'annotate';
  applyMode();
} else if (leParam === 'true' || leParam === '1') {
  mode = 'edit';
  applyMode();
}
```

- [ ] **Step 5: Add the inline pill style and re-color the Edit popover pill**

In `overlay.css`, locate the `[data-live-edit-overlay]` block (line 1) and add a new custom property at the end of its rule body:

```css
[data-live-edit-overlay] {
  /* ... existing properties ... */
  --le-accent-popover: #ba68c8;
}
```

Then replace the existing `.le-pill[data-mode="edit"]` rule (currently `overlay.css:38-41`) and the matching dot rule (`overlay.css:56`) with:

```css
.le-pill[data-mode="inline"] {
  border-color: var(--le-accent-edit);
  box-shadow: 0 0 12px rgba(79, 195, 247, 0.2);
}

.le-pill[data-mode="edit"] {
  border-color: var(--le-accent-popover);
  box-shadow: 0 0 12px rgba(186, 104, 200, 0.2);
}

.le-pill[data-mode="inline"] .le-pill-dot { background: var(--le-accent-edit); }
.le-pill[data-mode="edit"] .le-pill-dot { background: var(--le-accent-popover); }
.le-pill[data-mode="annotate"] .le-pill-dot { background: var(--le-accent-annotate); }
```

(The `annotate` dot rule already exists at `overlay.css:57` — leave it as-is or drop the duplicate.)

- [ ] **Step 6: Manual verification**

Run: `npm run dev`

Open the dev URL. Press `Ctrl+E` four times in a row and confirm the pill cycles:

| Press # | Pill label | Pill border |
|---|---|---|
| 1 | Inline Edit | blue |
| 2 | Edit Mode | violet |
| 3 | Annotate | orange |
| 4 | Live Edit | white/grey (off) |

Confirm the URL updates accordingly: `?live-edit=inline`, `?live-edit=true`, `?live-edit=annotate`, no param.

Reload the page with `?live-edit=inline` in the URL and confirm Inline mode auto-activates.

- [ ] **Step 7: Commit**

```bash
git add src/plugins/live-edit/overlay.js src/plugins/live-edit/overlay.css
git commit -m "feat(live-edit): add inline mode to pill cycle"
```

---

### Task 2: Inline-mode hover affordance

**Files:**
- Modify: `src/plugins/live-edit/overlay.css`

In Inline mode, hovering an editable element should show a text cursor (because the user is about to type into it). Hovering a split-text element (those with `data-live-text`) should show a pointer cursor (because the click opens a popover, not inline edit).

This task is CSS-only. The existing CSS at `overlay.css:72-81` already covers Edit and Annotate hover. We add Inline cases.

- [ ] **Step 1: Add inline-mode hover rules**

In `overlay.css`, after the existing block:

```css
[data-live-edit-active] [data-live-file]:hover {
  outline: 1px solid var(--le-accent-edit, #4fc3f7);
  outline-offset: 2px;
  cursor: pointer;
  border-radius: 2px;
}

[data-live-edit-active="annotate"] [data-live-file]:hover {
  outline-color: var(--le-accent-annotate);
}
```

Add:

```css
[data-live-edit-active="inline"] [data-live-file]:hover {
  cursor: text;
}

[data-live-edit-active="inline"] [data-live-file][data-live-text]:hover {
  cursor: pointer;
}

[data-live-edit-active="edit"] [data-live-file]:hover {
  outline-color: var(--le-accent-popover);
}
```

(The third rule above re-colors the popover-mode hover outline to match its pill color.)

- [ ] **Step 2: Manual verification**

In Inline mode, hover an `<h2>` like "Miért válassz minket?" — cursor should be `text`. Hover a typewriter headline that has `data-live-text` — cursor should be `pointer`. Switch to Edit mode — hover outline should be violet. Switch to Annotate mode — hover outline should be orange.

- [ ] **Step 3: Commit**

```bash
git add src/plugins/live-edit/overlay.css
git commit -m "feat(live-edit): add inline-mode hover cursors and per-mode outline colors"
```

---

### Task 3: Route clicks in inline mode

**Files:**
- Modify: `src/plugins/live-edit/overlay.js`

When the user clicks a tagged element in Inline mode, branch on whether it has `data-live-text`:

- Has `data-live-text` → open the existing popover (`openEditPopover`).
- No `data-live-text` → call a new stub `openInlineEdit` that just logs for now.

This isolates the routing change so we can verify it before wiring up `contentEditable`.

- [ ] **Step 1: Add a stub `openInlineEdit` in `overlay.js`**

Add this function above `handleClick` (around `overlay.js:295`):

```js
// ── Inline Edit ──────────────────────────────────────────

function openInlineEdit(target) {
  // Stub — full implementation in later tasks
  console.log('[live-edit] openInlineEdit', target);
}
```

- [ ] **Step 2: Update `handleClick` in `overlay.js`**

Replace the bottom of `handleClick` (currently `overlay.js:325-329`):

```js
if (mode === 'edit') {
  openEditPopover(target);
} else if (mode === 'annotate') {
  openAnnotatePopover(target);
}
```

With:

```js
if (mode === 'inline') {
  if (target.hasAttribute('data-live-text')) {
    openEditPopover(target);
  } else {
    openInlineEdit(target);
  }
} else if (mode === 'edit') {
  openEditPopover(target);
} else if (mode === 'annotate') {
  openAnnotatePopover(target);
}
```

- [ ] **Step 3: Manual verification**

Open the dev console. Switch to Inline mode. Click a non-typewriter heading or paragraph. Console should log `[live-edit] openInlineEdit <element>`. Click a typewriter headline. The Edit popover should open as today.

- [ ] **Step 4: Commit**

```bash
git add src/plugins/live-edit/overlay.js
git commit -m "feat(live-edit): route inline-mode clicks with split-text fallback"
```

---

### Task 4: Activate contentEditable + render source pill

**Files:**
- Modify: `src/plugins/live-edit/overlay.js`
- Modify: `src/plugins/live-edit/overlay.css`

This is the substantive task. Clicking a tagged element in Inline mode now:

1. Stashes the original text.
2. Sets `contentEditable=true` and `data-live-editing` on the element.
3. Focuses it (browser places caret at click position by default).
4. Mounts a floating source pill anchored above the element.
5. Wires Escape to cancel, blur to "close" (still no save yet — Task 6).

Save and paste handling come in later tasks.

- [ ] **Step 1: Add module-scoped state for the active inline edit**

Near the top of the IIFE, after the existing `var activeTarget = null;` (`overlay.js:12`), add:

```js
var inlineEdit = null; // { target, originalText, sourcePill, observer } | null
```

- [ ] **Step 2: Replace the stub `openInlineEdit` with the real implementation**

Replace the stub from Task 3 with:

```js
function openInlineEdit(target) {
  // If another inline edit is open, close it first (commits or cancels per blur path)
  if (inlineEdit) closeInlineEdit({ save: false });

  var file = target.getAttribute('data-live-file');
  var line = target.getAttribute('data-live-line') || '1';
  var col = target.getAttribute('data-live-col') || '1';
  var originalText = getDirectText(target);

  target.setAttribute('contenteditable', 'true');
  target.setAttribute('data-live-editing', '');
  target.focus();

  var sourcePill = createSourcePill(file, line, col);
  positionSourcePill(sourcePill, target);

  inlineEdit = { target: target, originalText: originalText, file: file, line: line, col: col, sourcePill: sourcePill };

  target.addEventListener('keydown', handleInlineKeydown);
  target.addEventListener('blur', handleInlineBlur);
}
```

- [ ] **Step 3: Add `closeInlineEdit`, `handleInlineKeydown`, `handleInlineBlur`**

Add these below `openInlineEdit`:

```js
function closeInlineEdit(opts) {
  if (!inlineEdit) return;
  var t = inlineEdit.target;
  var original = inlineEdit.originalText;

  t.removeEventListener('keydown', handleInlineKeydown);
  t.removeEventListener('blur', handleInlineBlur);

  if (!opts || !opts.save) {
    t.textContent = original;
  }

  t.removeAttribute('contenteditable');
  t.removeAttribute('data-live-editing');

  if (inlineEdit.sourcePill && inlineEdit.sourcePill.parentNode) {
    inlineEdit.sourcePill.parentNode.removeChild(inlineEdit.sourcePill);
  }

  inlineEdit = null;
}

function handleInlineKeydown(e) {
  if (e.key === 'Escape') {
    e.preventDefault();
    closeInlineEdit({ save: false });
  }
  // Cmd+Enter handler comes in Task 6
}

function handleInlineBlur() {
  // Blur path becomes save-on-blur in Task 6. For now, just close without saving.
  if (inlineEdit) closeInlineEdit({ save: false });
}
```

- [ ] **Step 4: Add `createSourcePill` and `positionSourcePill`**

Add below the inline-edit handlers:

```js
function createSourcePill(file, line, col) {
  var pill = document.createElement('a');
  pill.setAttribute('data-live-edit-overlay', '');
  pill.className = 'le-source-pill';
  pill.href = editorUrl(file, line, col);
  pill.textContent = file + ':' + line;
  // Stash the default label so setSourcePillState can restore it after error states.
  pill.dataset.defaultText = file + ':' + line;
  document.body.appendChild(pill);
  return pill;
}

function positionSourcePill(pill, target) {
  var rect = target.getBoundingClientRect();
  // Default: above the target, left-aligned
  var top = rect.top - 28;
  var left = rect.left;

  // If no room above, place below
  if (top < 8) {
    top = rect.bottom + 8;
  }
  // Keep within viewport
  if (left + 200 > window.innerWidth) {
    left = window.innerWidth - 200;
  }
  if (left < 8) left = 8;

  pill.style.top = top + 'px';
  pill.style.left = left + 'px';
}
```

- [ ] **Step 5: Stop the global Escape handler from interfering**

`handleEscape` (`overlay.js:352-362`) currently handles Escape for popover and mode-cycle-cancel. We need it to leave inline-edit Escape to `handleInlineKeydown`. Replace `handleEscape`:

```js
function handleEscape(e) {
  if (e.key !== 'Escape') return;

  // Inline edit Escape is handled by the element's own keydown listener
  if (inlineEdit) return;

  if (popover && popover.classList.contains('visible')) {
    closePopover();
    e.stopPropagation();
  } else if (mode) {
    mode = null;
    applyMode();
  }
}
```

- [ ] **Step 6: Add CSS for `[data-live-editing]` and `.le-source-pill`**

In `overlay.css`, add after the existing `[data-live-edit-active="..."]` hover rules:

```css
[data-live-editing] {
  outline: 2px solid var(--le-accent-edit) !important;
  outline-offset: 2px;
  background: rgba(79, 195, 247, 0.06);
  border-radius: 2px;
}

.le-source-pill {
  position: fixed;
  z-index: 100000;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: var(--le-bg);
  border: 1px solid var(--le-border);
  border-radius: 12px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 11px;
  color: var(--le-accent-edit);
  text-decoration: none;
  backdrop-filter: blur(12px);
  cursor: pointer;
}

.le-source-pill:hover {
  text-decoration: underline;
}
```

- [ ] **Step 7: Manual verification**

Switch to Inline mode. Click a non-typewriter `<h2>` or `<p>`. Expect:

- The element gets a solid blue outline + faint blue background.
- A small monospace pill appears above (or below) it showing `path/to/file.jsx:N`.
- The text cursor blinks inside the element at the click position.
- Typing modifies the text in place.
- Pressing Escape restores the original text and removes the outline + pill.
- Clicking outside the element (anywhere else on the page) also restores the original text and clears the UI (because Task 6 hasn't added save-on-blur yet).

Click on the source pill — it should open `vscode://file/...` (or whatever editor URL is configured). Note: clicking the pill currently triggers the element's blur, which restores the text. That's a known issue resolved in Task 8.

- [ ] **Step 8: Commit**

```bash
git add src/plugins/live-edit/overlay.js src/plugins/live-edit/overlay.css
git commit -m "feat(live-edit): activate contentEditable and source pill in inline mode"
```

---

### Task 5: Strip formatting on paste

**Files:**
- Modify: `src/plugins/live-edit/overlay.js`

`contentEditable` accepts pasted HTML by default. Pasting from a styled source (Slack, Notion, Word) would inject `<span style="...">` and friends, which would then be saved back as the new text and corrupt the JSX.

- [ ] **Step 1: Add `handleInlinePaste`**

Below `handleInlineBlur`:

```js
function handleInlinePaste(e) {
  e.preventDefault();
  var text = (e.clipboardData || window.clipboardData).getData('text/plain');
  document.execCommand('insertText', false, text);
}
```

- [ ] **Step 2: Wire it in `openInlineEdit`**

Inside `openInlineEdit`, alongside the existing `target.addEventListener` calls, add:

```js
target.addEventListener('paste', handleInlinePaste);
```

- [ ] **Step 3: Wire teardown in `closeInlineEdit`**

Inside `closeInlineEdit`, alongside the existing `removeEventListener` calls, add:

```js
t.removeEventListener('paste', handleInlinePaste);
```

- [ ] **Step 4: Manual verification**

Open a webpage with formatted text (e.g., a Notion doc). Copy a styled heading. In Inline mode, edit a tagged element and paste. The pasted content should be plain text only — no inherited fonts, colors, or sizes.

- [ ] **Step 5: Commit**

```bash
git add src/plugins/live-edit/overlay.js
git commit -m "feat(live-edit): strip formatting on paste during inline edit"
```

---

### Task 6: Save on Cmd+Enter and on blur

**Files:**
- Modify: `src/plugins/live-edit/overlay.js`

Wire the actual save path. Cmd+Enter (or Ctrl+Enter) and blur both POST to `/__live-edit/save`. Empty/whitespace-only or unchanged text is treated as cancel.

- [ ] **Step 1: Update `handleInlineKeydown`**

Replace the previous `handleInlineKeydown`:

```js
function handleInlineKeydown(e) {
  if (e.key === 'Escape') {
    e.preventDefault();
    closeInlineEdit({ save: false });
  } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault();
    closeInlineEdit({ save: true });
  }
}
```

- [ ] **Step 2: Update `handleInlineBlur`**

Replace the previous `handleInlineBlur`:

```js
function handleInlineBlur() {
  if (inlineEdit) closeInlineEdit({ save: true });
}
```

- [ ] **Step 3: Implement save inside `closeInlineEdit`**

Replace `closeInlineEdit`:

```js
function closeInlineEdit(opts) {
  if (!inlineEdit) return;
  var ie = inlineEdit;
  // Mark closed first so re-entrancy from blur events during save is a no-op
  inlineEdit = null;

  var t = ie.target;
  t.removeEventListener('keydown', handleInlineKeydown);
  t.removeEventListener('blur', handleInlineBlur);
  t.removeEventListener('paste', handleInlinePaste);

  var newText = (t.textContent || '').trim();
  var oldText = ie.originalText;
  var shouldSave = opts && opts.save && newText.length > 0 && newText !== oldText;

  if (!shouldSave) {
    t.textContent = oldText;
    teardownInlineUI(ie);
    return;
  }

  // Visually freeze: pull contentEditable off so the user can't keep typing during save
  t.removeAttribute('contenteditable');
  setSourcePillState(ie.sourcePill, 'saving');

  fetch('/__live-edit/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file: ie.file,
      line: Number(ie.line),
      col: Number(ie.col),
      oldText: oldText,
      newText: newText,
    }),
  })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.ok) {
        flashOutline(t, '#66bb6a');
        setSourcePillState(ie.sourcePill, 'saved');
        setTimeout(function () { teardownInlineUI(ie); }, 600);
      } else {
        flashOutline(t, '#ef5350');
        setSourcePillState(ie.sourcePill, 'error', data.error || 'Save failed');
        // Restore editability so the user can retry
        t.setAttribute('contenteditable', 'true');
        t.setAttribute('data-live-editing', '');
        inlineEdit = ie;
        t.addEventListener('keydown', handleInlineKeydown);
        t.addEventListener('blur', handleInlineBlur);
        t.addEventListener('paste', handleInlinePaste);
      }
    })
    .catch(function (err) {
      flashOutline(t, '#ef5350');
      setSourcePillState(ie.sourcePill, 'error', err.message);
      t.setAttribute('contenteditable', 'true');
      t.setAttribute('data-live-editing', '');
      inlineEdit = ie;
      t.addEventListener('keydown', handleInlineKeydown);
      t.addEventListener('blur', handleInlineBlur);
      t.addEventListener('paste', handleInlinePaste);
    });
}

function teardownInlineUI(ie) {
  ie.target.removeAttribute('contenteditable');
  ie.target.removeAttribute('data-live-editing');
  if (ie.sourcePill && ie.sourcePill.parentNode) {
    ie.sourcePill.parentNode.removeChild(ie.sourcePill);
  }
}

function flashOutline(el, color) {
  var prev = el.style.outline;
  el.style.outline = '2px solid ' + color;
  setTimeout(function () { el.style.outline = prev; }, 600);
}

function setSourcePillState(pill, state, message) {
  if (!pill) return;
  pill.classList.remove('saving', 'saved', 'error');
  if (state) pill.classList.add(state);
  if (state === 'error' && message) {
    pill.textContent = message;
  } else {
    // Restore the file:line label for non-error states (saving, saved, default).
    pill.textContent = pill.dataset.defaultText || '';
  }
}
```

- [ ] **Step 4: Add CSS for source pill states**

In `overlay.css`, add below the `.le-source-pill` rule:

```css
.le-source-pill.saving { color: var(--le-text-muted); }
.le-source-pill.saved { color: #66bb6a; }
.le-source-pill.error { color: #ef5350; border-color: #ef5350; }
```

- [ ] **Step 5: Manual verification**

Run `npm run dev`. Switch to Inline mode. Click a non-typewriter `<h2>` (e.g. on `src/components/Sections.jsx`).

| Action | Expected |
|---|---|
| Type new text, press Cmd+Enter | Pill shows `saved`, element flashes green, file on disk updates, HMR reloads page with new text. |
| Type new text, click outside element | Same as above (blur triggers save). |
| Type new text, press Escape | No request fired, element returns to original text. |
| Click element, press Escape immediately | No request, no change. |
| Type new text matching original, press Cmd+Enter | No request fired (treated as cancel). |
| Clear all text, press Cmd+Enter | No request fired (empty after trim → cancel). |

To test error path: temporarily edit the source file from another editor between page-load and save, so `oldText` no longer matches. Cmd+Enter → red flash, pill shows error, element remains editable.

Confirm the actual file on disk changed by running:

```bash
git diff src/components/Sections.jsx
```

- [ ] **Step 6: Commit**

```bash
git add src/plugins/live-edit/overlay.js src/plugins/live-edit/overlay.css
git commit -m "feat(live-edit): wire inline-edit save on cmd+enter and blur"
```

---

### Task 7: Source-pill click should not trigger blur-save

**Files:**
- Modify: `src/plugins/live-edit/overlay.js`

If the user clicks the source pill while editing, the element loses focus and `handleInlineBlur` fires, which currently saves whatever's in the element. The intent of clicking the pill is "open this in my editor," not "save now." We need to suppress the blur-save when the click target is the source pill.

The pattern: `mousedown` on the pill fires before `blur`. Set a flag in `mousedown`, check it in `handleInlineBlur`.

- [ ] **Step 1: Add a suppress flag and `mousedown` handler when creating the pill**

Replace `createSourcePill`:

```js
function createSourcePill(file, line, col) {
  var pill = document.createElement('a');
  pill.setAttribute('data-live-edit-overlay', '');
  pill.className = 'le-source-pill';
  pill.href = editorUrl(file, line, col);
  pill.textContent = file + ':' + line;
  pill.dataset.defaultText = file + ':' + line;
  // Prevent the blur-save when the user clicks the pill itself.
  pill.addEventListener('mousedown', function (e) {
    if (inlineEdit) inlineEdit.suppressBlurSave = true;
  });
  document.body.appendChild(pill);
  return pill;
}
```

- [ ] **Step 2: Honour the flag in `handleInlineBlur`**

Replace `handleInlineBlur`:

```js
function handleInlineBlur() {
  if (!inlineEdit) return;
  if (inlineEdit.suppressBlurSave) {
    inlineEdit.suppressBlurSave = false;
    // Re-focus on next tick so the user stays in the edit
    var t = inlineEdit.target;
    setTimeout(function () {
      if (inlineEdit && inlineEdit.target === t) t.focus();
    }, 0);
    return;
  }
  closeInlineEdit({ save: true });
}
```

- [ ] **Step 3: Manual verification**

Switch to Inline mode. Click an editable element. Type some new text but do NOT press Cmd+Enter. Click the source pill. Expected:

- The browser attempts to open the editor URL (or the OS asks for a handler).
- The element does NOT save — the typed text is still there, the element is still editable, and focus returns to it.

After confirming the pill works, click anywhere else on the page (not the pill, not the element) — that should still trigger save-on-blur as before.

- [ ] **Step 4: Commit**

```bash
git add src/plugins/live-edit/overlay.js
git commit -m "feat(live-edit): suppress blur-save when clicking source pill"
```

---

### Task 8: Re-position the source pill on scroll/resize

**Files:**
- Modify: `src/plugins/live-edit/overlay.js`

The source pill is `position: fixed` with viewport coordinates derived from `getBoundingClientRect()` at open time. If the user scrolls during the edit, the pill stays put while the element moves — they detach. Add scroll/resize listeners while an inline edit is active.

- [ ] **Step 1: Add `repositionSourcePill` and wire scroll/resize listeners**

In `openInlineEdit`, after `inlineEdit = { ... };`, add:

```js
window.addEventListener('scroll', repositionInlineUI, true);
window.addEventListener('resize', repositionInlineUI);
```

In `teardownInlineUI`, before removing the pill, add:

```js
window.removeEventListener('scroll', repositionInlineUI, true);
window.removeEventListener('resize', repositionInlineUI);
```

(Also call the same removal at the top of the unsaved-cancel path inside `closeInlineEdit`. Cleanest: move the listener removal into `teardownInlineUI` only, and call `teardownInlineUI(ie)` from BOTH the cancel branch and the success branch. Currently the cancel branch already calls `teardownInlineUI(ie)`, so this works as-is.)

Add the new function:

```js
function repositionInlineUI() {
  if (!inlineEdit) return;
  positionSourcePill(inlineEdit.sourcePill, inlineEdit.target);
}
```

- [ ] **Step 2: Manual verification**

Switch to Inline mode. Click an element near the top of a long page. Scroll down a bit while the element is still in view — the pill should stay attached above (or below) the element. Resize the browser window — the pill should stay attached. Scroll the element out of view — the pill follows it off-screen (acceptable; the user can scroll back).

- [ ] **Step 3: Commit**

```bash
git add src/plugins/live-edit/overlay.js
git commit -m "feat(live-edit): keep source pill attached on scroll and resize"
```

---

### Task 9: Detect external re-renders and abort the edit

**Files:**
- Modify: `src/plugins/live-edit/overlay.js`

If React re-renders the element while the user is editing (e.g., HMR fires for an unrelated file, or app state changes), the user's in-progress text would be silently overwritten. Watch for childList changes and abort the edit if detected.

The abort path: just call `closeInlineEdit({ save: false })`. The user loses their in-progress text, but at least the UI doesn't appear broken (orphaned source pill, stuck contentEditable). This is a graceful degradation, not a recovery.

- [ ] **Step 1: Add a `MutationObserver` in `openInlineEdit`**

Inside `openInlineEdit`, after the listener registrations and before storing `inlineEdit = { ... }`, add:

```js
var observer = new MutationObserver(function (mutations) {
  if (!inlineEdit) return;
  for (var i = 0; i < mutations.length; i++) {
    var m = mutations[i];
    // Ignore character-data mutations from the user typing
    if (m.type === 'characterData') continue;
    if (m.type === 'childList') {
      // The user typing inserts text nodes; only react if a non-text child appears
      // OR if our target is removed from the DOM (parent re-render replaced it).
      var nonText = false;
      for (var j = 0; j < m.addedNodes.length; j++) {
        if (m.addedNodes[j].nodeType !== 3) { nonText = true; break; }
      }
      if (nonText || !document.body.contains(target)) {
        closeInlineEdit({ save: false });
        return;
      }
    }
  }
});
observer.observe(target, { childList: true, characterData: true, subtree: false });
```

Then store the observer on `inlineEdit`:

```js
inlineEdit = {
  target: target,
  originalText: originalText,
  file: file,
  line: line,
  col: col,
  sourcePill: sourcePill,
  observer: observer,
};
```

- [ ] **Step 2: Disconnect the observer in `teardownInlineUI`**

Update `teardownInlineUI`:

```js
function teardownInlineUI(ie) {
  if (ie.observer) ie.observer.disconnect();
  window.removeEventListener('scroll', repositionInlineUI, true);
  window.removeEventListener('resize', repositionInlineUI);
  ie.target.removeAttribute('contenteditable');
  ie.target.removeAttribute('data-live-editing');
  if (ie.sourcePill && ie.sourcePill.parentNode) {
    ie.sourcePill.parentNode.removeChild(ie.sourcePill);
  }
}
```

(Move the `window.removeEventListener` lines from Task 8's notes here so cleanup is centralised.)

- [ ] **Step 3: Manual verification**

Open the dev server. In Inline mode, click an editable element on the home page. While the edit is active (cursor blinking, source pill visible), open another file in your editor (e.g. add a comment in `src/main.jsx` and save). Vite should HMR-reload that change.

Expected:

- The inline edit closes silently (no crash, no orphaned source pill, no `contentEditable` attribute left dangling on the element).
- The page continues to function normally.

(Verify no orphaned source pill in DevTools: inspect `<body>` and confirm no `.le-source-pill` element remains.)

- [ ] **Step 4: Commit**

```bash
git add src/plugins/live-edit/overlay.js
git commit -m "feat(live-edit): abort inline edit when target is re-rendered"
```

---

### Task 10: End-to-end smoke test

**Files:** none (manual run-through)

Final verification across all paths. Run `npm run dev` and exercise each path against a real source file. This is a checklist; if any item fails, fix it and re-commit before considering the feature done.

- [ ] **Inline mode pill cycle**

Press `Ctrl+E` four times. Pill cycles `Inline Edit` (blue) → `Edit Mode` (violet) → `Annotate` (orange) → `Live Edit` (off).

- [ ] **Inline edit on plain `<h2>`**

In Inline mode, click an `<h2>` like "Miért válassz minket?" in `src/components/Sections.jsx`. Element becomes editable, source pill appears showing `src/components/Sections.jsx:N`. Type new text, press Cmd+Enter. File updates, HMR reloads, new text is rendered.

- [ ] **Inline edit on `<p>`**

Click a paragraph (e.g. a description text). Same flow as `<h2>`. Verify multi-line is preserved on Enter (plain Enter inserts a newline; the saved file should contain the newline as `\n` in the JSX text).

- [ ] **Inline edit on typewriter falls back to popover**

Click a typewriter headline (one with `data-live-text`). The Edit popover opens, NOT inline edit. Verify save through the popover still works.

- [ ] **Escape cancels**

Click element, type new text, press Escape. Element returns to original text. No request fired (verify in DevTools Network tab).

- [ ] **Blur saves**

Click element, type new text, click somewhere else (not the source pill). Save fires.

- [ ] **Source pill click opens editor without saving**

Click element, type new text, click the source pill. Editor URL opens. Element remains editable, typed text is preserved.

- [ ] **Empty edit cancels**

Click element, select all, delete, press Cmd+Enter. No request fired. Element returns to original.

- [ ] **No-op edit cancels**

Click element, change a character then change it back, press Cmd+Enter. No request fired.

- [ ] **Paste strips formatting**

Copy styled text from another tab. Paste into the editing element. Only plain text appears.

- [ ] **External re-render aborts gracefully**

Start an inline edit. Trigger HMR by saving an unrelated file. Inline edit closes silently, no orphans.

- [ ] **URL param boots into inline mode**

Reload with `?live-edit=inline`. Pill shows `Inline Edit`. Hover affordance is active.

- [ ] **Existing Edit (popover) and Annotate modes still work**

Cycle to Edit mode, click a tagged element, popover opens with violet pill accent. Save through popover works. Cycle to Annotate, click element, annotation popover opens, save annotation. Confirm `.annotations.json` is updated.

- [ ] **No regressions in production build**

Run `npm run build`. Confirm build succeeds. Inspect the built HTML in `dist/` and confirm none of the live-edit overlay JS or CSS is included (the plugin is `apply: 'serve'` only).

- [ ] **Final commit (only if any fixes were made above)**

```bash
git add -A
git commit -m "fix(live-edit): smoke-test fixes for inline mode"
```

---

## Out of Scope Reminders

These are explicitly NOT part of this plan (per the spec):

- Recovering an in-progress edit when React re-renders mid-edit (Task 9 aborts; doesn't recover).
- Inline editing of split-text elements (typewriter) — Task 3 falls back to popover.
- Multi-element bulk edits.
- Production-build behaviour (plugin remains dev-only).
- Changes to annotation storage or API.
