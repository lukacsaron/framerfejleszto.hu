# Vite Live Edit Plugin — Design Spec

**Date:** 2026-04-24  
**Status:** Draft  
**Scope:** Reusable Vite + React dev tool for inline text editing and annotation

## Overview

A standalone Vite plugin (`vite-plugin-live-edit`) that lets you click on any text element in the browser, see its exact source location, and either edit it inline (writes back to source) or leave an annotation (stored locally as JSON). Dev mode only — zero footprint in production.

## User

Developer/designer who wants to:
- Quickly edit copy without hunting through JSX files
- See changes in context immediately via HMR
- Leave text suggestions/notes anchored to specific elements for later review

## Integration

One line in `vite.config.js`:

```js
import { liveEdit } from 'vite-plugin-live-edit'

export default defineConfig({
  plugins: [react(), liveEdit()]
})
```

## Architecture

```
vite-plugin-live-edit/
├── index.js               — Plugin entry: wires together all three layers
├── babel-transform.js     — Compile-time: injects data-live-* attrs into JSX text nodes
├── server-middleware.js   — Dev server: API routes for saving edits + managing annotations
└── overlay/               — Client runtime: popover UI, mode switching, keyboard shortcuts
    ├── overlay.js         — Main overlay logic (injected via Vite's transformIndexHtml)
    ├── popover.js         — Floating edit/annotate popover component
    └── styles.css         — Overlay styles (scoped, won't leak into app)
```

### Layer 1: Babel Transform

Runs only in dev mode as part of the Vite build pipeline. Walks the JSX AST looking for text content (JSX text nodes, string literals in JSX expressions, template literals) and injects source location attributes.

**Injected attributes:**
- `data-live-file` — relative path from project root (e.g. `src/components/Sections.jsx`)
- `data-live-line` — line number in source
- `data-live-col` — column offset

**Example transform:**

```jsx
// Source:
<h2>Miért válassz minket?</h2>

// Dev output:
<h2 data-live-file="src/components/Sections.jsx"
    data-live-line="142"
    data-live-col="8">
  Miért válassz minket?
</h2>
```

**Edge cases:**
- **Array-defined content** (e.g. `PROCESS_STEPS`, `BENEFITS` arrays): the transform traces the string literal back to where it's defined in the array, not where it's rendered via `.map()`.
- **Template literals / string concatenation**: marks the location of the template; edit replaces the whole template.
- **Nested components**: attributes propagate to the outermost DOM element containing the text.
- **Production builds**: the plugin is a no-op — zero attributes, zero overhead.

### Layer 2: Server Middleware

API routes registered on the Vite dev server. All file paths are resolved and validated to stay within the project root (no path traversal).

**`POST /__live-edit/save`** — Write edits back to source

```json
// Request:
{ "file": "src/components/Sections.jsx", "line": 142, "col": 8,
  "oldText": "Miért válassz minket?", "newText": "Miért minket?" }

// Response:
{ "ok": true, "file": "src/components/Sections.jsx", "line": 142 }
```

- Reads the source file, locates the exact text at the given line+col
- Validates that `oldText` matches what's currently there (prevents stale edits)
- Replaces the text, writes the file
- Vite HMR detects the change and hot-reloads

**`POST /__live-edit/annotate`** — Save an annotation

```json
{ "file": "src/components/Sections.jsx", "line": 142,
  "currentText": "Miért válassz minket?",
  "suggestedText": "Miért válassz profi Framer fejlesztőt?",
  "note": "stronger CTA" }
```

**`GET /__live-edit/annotations`** — List all annotations (reads `.annotations.json`)

**`DELETE /__live-edit/annotations/:id`** — Remove an annotation after applying/dismissing

### Layer 3: Overlay UI

Injected into the page via Vite's `transformIndexHtml` hook. All CSS scoped under `[data-live-edit-overlay]`. Renders outside the React root at the `<body>` level.

**Three states:**
1. **Off** — overlay inactive, site behaves normally
2. **Edit mode** — click any text to open the edit popover
3. **Annotate mode** — click any text to leave a suggestion/note

**Activation (multiple entry points):**
- `Ctrl+E` keyboard shortcut — cycles: Off → Edit → Annotate → Off
- Floating pill button in bottom-right corner — shows current mode, click to cycle
- `?live-edit=true` or `?live-edit=annotate` query param — opens directly in that mode

**When a mode is active:**
- Elements with `data-live-*` attributes get a subtle highlight on hover (light outline + background tint)
- Cursor changes to indicate clickability
- Floating pill shows current mode with colored indicator

**Edit popover (on click in edit mode):**
- Anchored near clicked element (smart viewport positioning)
- Source location as clickable link: `Sections.jsx:142` (opens via `vscode://file/...`)
- Textarea with current text, auto-focused
- Save (`Cmd+Enter`) / Cancel (`Escape`)
- After save, popover closes and page hot-reloads

**Annotate popover (on click in annotate mode):**
- Source location (read-only)
- Current text (read-only)
- Suggested text (textarea)
- Note field (optional, one-line input)
- Save annotation button — writes to `.annotations.json`

**Annotation markers:**
- Small dot/badge on elements that have annotations (visible in all modes)
- Click marker to view annotation, then Apply (writes to source + removes annotation) or Dismiss (removes annotation)

## Annotations File

`.annotations.json` in project root (gitignored):

```json
{
  "version": 1,
  "annotations": [
    {
      "id": "a1b2c3",
      "file": "src/components/Sections.jsx",
      "line": 142,
      "currentText": "Miért válassz minket?",
      "suggestedText": "Miért válassz profi Framer fejlesztőt?",
      "note": "stronger CTA",
      "createdAt": "2026-04-24T14:30:00Z"
    }
  ]
}
```

## Plugin Configuration

Optional overrides in `vite.config.js`:

```js
liveEdit({
  shortcut: 'ctrl+e',                    // keyboard shortcut to cycle modes
  annotationsFile: '.annotations.json',   // annotations file path
  editor: 'vscode'                        // for "open in editor" links ('vscode', 'cursor', 'webstorm')
})
```

## Security

- All file paths resolved and validated to stay within the project root
- `oldText` validation prevents writing to files modified since page load
- Dev mode only — the entire plugin is a no-op in production builds
- Overlay CSS fully scoped to prevent style leaking into app

## Out of Scope

- Multi-user / collaborative editing
- Non-React frameworks (could be extended later)
- Visual/CSS editing (text content only)
- CMS integration or content management UI
- Deployed/production usage
