# Inline Live Edit Mode — Design Spec

**Date:** 2026-04-28
**Status:** Draft
**Scope:** Adds an in-place editing mode to the existing `vite-plugin-live-edit` overlay
**Related:** `2026-04-24-vite-live-edit-plugin-design.md` (original plugin spec)

## Overview

The current Edit mode opens a floating popover with a textarea when a tagged element is clicked. This spec adds a third mode — **Inline Edit** — where clicking a tagged element makes the element itself editable in place via `contentEditable`. The edit happens at the actual position, with the actual typography, of the rendered text.

The existing popover-based Edit mode is preserved as a separate mode (used for split-text elements that can't be edited inline, and as an explicit choice for any element).

## Mode Model

The pill cycle expands from two modes to three:

```
Off → Inline → Edit (popover) → Annotate → Off
```

Trigger: `Ctrl+E` keyboard shortcut, or click the floating pill. URL query param expands accordingly:

- `?live-edit=inline` — open in Inline mode
- `?live-edit=true` — open in Edit (popover) mode (preserved from current behavior)
- `?live-edit=annotate` — open in Annotate mode

Pill colors:

- Inline → `--le-accent-edit` (existing blue, `#4fc3f7`)
- Edit (popover) → new `--le-accent-popover` (violet, `#ba68c8`)
- Annotate → `--le-accent-annotate` (existing orange, `#ffb74d`)

This re-colors the existing Edit popover pill so the two edit modes are visually distinct.

## Click → Activate Inline Edit

When the user clicks a `[data-live-file]` element while in Inline mode:

1. **Find the editable ancestor** using the existing `findEditableAncestor` walk (skips `[data-live-edit-skip]`).
2. **Branch on `data-live-text`:**
   - **Has `data-live-text`** (split-text components like `TypewriterReveal`) → open the existing Edit popover instead. Inline editing is not possible since the DOM is per-character spans.
   - **No `data-live-text`** → activate inline edit on the element.
3. **Activate inline edit:**
   - Set `contentEditable="true"` on the element.
   - Set `data-live-editing` attribute on the element so CSS can style it.
   - Stash `getDirectText(element)` in a JS closure as `originalText` (used as `oldText` on save and to restore on cancel).
   - Focus the element. Do NOT override the caret position — the browser places it at the click point by default.
4. **Mount the source pill** — a small floating element anchored above the target (below if no room above), showing `file:line` as a clickable link to `editorUrl(file, line, col)`. Reuses the viewport-positioning logic from the existing popover.

Only one element is editable at a time. Clicking a different editable element commits the current edit via blur, then opens inline edit on the new target.

## Commit / Cancel

| Action | Behavior |
|---|---|
| **Cmd+Enter** (or **Ctrl+Enter**) | Save: POST `element.textContent` to `/__live-edit/save` with stashed `oldText`. |
| **Escape** | Cancel: restore `element.textContent` to `originalText`, exit edit. |
| **Blur** (focus leaves element) | Save (same path as Cmd+Enter). |
| **Enter** alone | Insert newline (default contentEditable behavior, not intercepted). |
| **Click on source pill** | Open editor URL. Suppress the blur-save that would otherwise fire (the click was on a deliberate UI affordance, not "I'm done editing"). |

After save:

- Brief green outline flash on the element (existing pattern from `saveEdit`).
- Source pill shows `.saved` state for ~600ms.
- Vite HMR detects the source change and hot-reloads — React re-renders with the new text.
- On HMR-driven re-render, `data-live-editing` is removed naturally (new element).

After cancel:

- Element's text restored, `contentEditable` unset, `data-live-editing` removed, source pill removed.
- No server call.

After save error:

- Red outline flash, source pill shows `.error` with the error message (replaces current `alert()` for this path).
- Element remains editable so the user can fix the issue and retry.

## Edge Cases

### React re-render during an active edit

Possible if HMR fires for an unrelated reason, or if a parent component triggers a re-render. The user's in-progress text would be wiped.

**Mitigation:** while an inline edit is active, attach a `MutationObserver` watching the element for `childList` changes and the `data-live-editing` attribute disappearing. If detected with text content not matching what the user typed, the edit is silently aborted (their in-progress text is lost — same outcome as the user being mid-typing when HMR fires today). This is a graceful failure, not a recovery path. Acceptable because:

- HMR only fires on source-file save, which the user isn't doing mid-edit.
- Re-renders from app state are rare during dev-mode editing sessions.
- Building a full recovery system (re-attach editor to the new node, replay typed text) is over-engineering for a dev tool.

### Pasting rich content

`paste` listener on the editing element calls `e.preventDefault()` then inserts plain text via `document.execCommand('insertText', false, e.clipboardData.getData('text/plain'))`. Otherwise pasted HTML would be saved back into a JSX text node and break it.

### Whitespace and empty edits

- Trim leading/trailing whitespace on save (matches existing `getDirectText`).
- If trimmed `newText` is empty, treat as cancel — never write an empty string back to source.
- If `newText === oldText` after trim, treat as cancel (no-op save).

### Nested editable elements

The babel transform already tags only elements with literal text content as their direct children, and `findEditableAncestor` walks up to the closest tagged element. No change needed.

### Click outside while editing

Treated as blur → save. If the user wanted to abandon the edit, they should press Escape.

## CSS Additions to `overlay.css`

```css
/* Inline mode hover affordance */
[data-live-edit-active="inline"] [data-live-file]:hover {
  outline: 1px solid var(--le-accent-edit);
  outline-offset: 2px;
  cursor: text;
  border-radius: 2px;
}

/* Split-text elements show a different cursor (popover, not inline) */
[data-live-edit-active="inline"] [data-live-file][data-live-text]:hover {
  cursor: pointer;
}

/* Active inline edit */
[data-live-editing] {
  outline: 2px solid var(--le-accent-edit);
  outline-offset: 2px;
  background: rgba(79, 195, 247, 0.06);
  border-radius: 2px;
}

/* Floating source pill */
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

.le-source-pill.saving { color: var(--le-text-muted); }
.le-source-pill.saved { color: #66bb6a; }
.le-source-pill.error { color: #ef5350; }

/* New violet accent for popover Edit mode */
[data-live-edit-overlay] { --le-accent-popover: #ba68c8; }

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
```

## JS Changes to `overlay.js`

- `cycleMode()` — extend cycle: `null → 'inline' → 'edit' → 'annotate' → null`.
- `applyMode()` — set `data-live-edit-active` to the new mode value (`inline` is added to existing `edit`/`annotate`).
- `updateQueryParam()` — add `?live-edit=inline` case.
- `updatePill()` — add `'Inline Edit'` label.
- `handleClick()` — when `mode === 'inline'`:
  - If target has `data-live-text` → call existing `openEditPopover(target)`.
  - Otherwise → call new `openInlineEdit(target)`.
- New `openInlineEdit(target)`:
  - Stash `originalText`.
  - Set `contentEditable`, `data-live-editing`, focus, mount source pill.
  - Attach `keydown` (Cmd+Enter / Escape), `blur`, `paste` listeners.
- New `closeInlineEdit({ save })` — common teardown for save/cancel paths.
- New `createSourcePill(target, file, line, col)` and `positionSourcePill(target)` — viewport-aware positioning, reused logic.
- New `MutationObserver` setup inside `openInlineEdit` to detect external re-renders.

## Configuration

No new plugin options. Existing `shortcut`, `editor`, and `root` config are reused.

## Out of Scope

- Recovering an in-progress edit when React re-renders mid-edit.
- Inline editing of split-text elements (typewriter) — falls back to popover.
- Multi-element bulk edits.
- Inline editing in production builds (plugin remains dev-only).
- Changing the storage / API for annotations.
