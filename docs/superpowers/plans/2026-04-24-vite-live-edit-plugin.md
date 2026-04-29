# Vite Live Edit Plugin — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Vite plugin that lets you click text in the browser, see its source location, edit it inline (writes back to source via HMR), or leave annotations stored in a local JSON file.

**Architecture:** Three-layer Vite plugin — (1) Babel transform injects `data-live-*` source location attributes into JSX at compile time, (2) dev server middleware provides API routes for file writing and annotation CRUD, (3) vanilla JS overlay injected via `transformIndexHtml` handles the UI (popover, mode switching, keyboard shortcuts). All dev-only — zero production footprint.

**Tech Stack:** Vite 8 plugin API, `@babel/core` + `@babel/traverse` (already available via `@vitejs/plugin-react`), vanilla JS overlay (no React dependency for the overlay itself).

---

## File Structure

```
src/plugins/live-edit/
├── index.js               — Plugin entry: composes all three layers into a Vite plugin
├── babel-transform.js     — Babel visitor that injects data-live-* attributes
├── server-middleware.js   — configureServer hook: /__live-edit/* API routes
├── overlay.js             — Client-side overlay (injected into HTML, vanilla JS)
└── overlay.css            — Scoped overlay styles

Root files:
  vite.config.js           — Modified: import and register liveEdit()
  .gitignore               — Modified: add .annotations.json and .superpowers/
```

---

### Task 1: Plugin Skeleton + Vite Integration

**Files:**
- Create: `src/plugins/live-edit/index.js`
- Modify: `vite.config.js`
- Modify: `.gitignore`

This task wires up an empty plugin that Vite recognizes. No functionality yet — just the shell.

- [ ] **Step 1: Create the plugin entry file**

```js
// src/plugins/live-edit/index.js

export function liveEdit(options = {}) {
  const config = {
    shortcut: options.shortcut || 'ctrl+e',
    annotationsFile: options.annotationsFile || '.annotations.json',
    editor: options.editor || 'vscode',
  };

  return {
    name: 'vite-plugin-live-edit',
    apply: 'serve', // dev only

    configResolved(resolvedConfig) {
      config.root = resolvedConfig.root;
    },

    transformIndexHtml(html) {
      // Will inject overlay script + styles in Task 4
      return html;
    },

    configureServer(server) {
      // Will add middleware in Task 3
    },
  };
}
```

- [ ] **Step 2: Register the plugin in vite.config.js**

Replace the full `vite.config.js` with:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { liveEdit } from './src/plugins/live-edit/index.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), liveEdit()],
  server: {
    watch: {
      // Include framer/ directory (outside src/) in HMR watching
      ignored: ['!**/framer/**'],
    },
  },
})
```

- [ ] **Step 3: Add `.annotations.json` and `.superpowers/` to .gitignore**

Append to `.gitignore`:

```
# Live edit plugin
.annotations.json
.superpowers/
```

- [ ] **Step 4: Verify the dev server starts with the plugin**

Run: `npm run dev`
Expected: Dev server starts without errors on http://localhost:5173. No visible changes to the site yet.

- [ ] **Step 5: Commit**

```bash
git add src/plugins/live-edit/index.js vite.config.js .gitignore
git commit -m "feat(live-edit): add plugin skeleton and vite integration"
```

---

### Task 2: Babel Transform — Inject Source Location Attributes

**Files:**
- Create: `src/plugins/live-edit/babel-transform.js`
- Modify: `src/plugins/live-edit/index.js`

This is the core piece — a Babel plugin that adds `data-live-file`, `data-live-line`, and `data-live-col` to every JSX element that contains text content.

- [ ] **Step 1: Create the Babel transform**

```js
// src/plugins/live-edit/babel-transform.js

import { declare } from '@babel/helper-plugin-utils';
import { relative } from 'path';

export default function liveEditBabelPlugin(rootDir) {
  return declare((api) => {
    api.assertVersion(7);

    return {
      name: 'live-edit-source-loc',
      visitor: {
        JSXOpeningElement(path, state) {
          const filename = state.filename;
          if (!filename) return;

          // Skip if already has data-live-file (avoid double-injection)
          const existing = path.node.attributes.find(
            (attr) => attr.type === 'JSXAttribute' && attr.name?.name === 'data-live-file'
          );
          if (existing) return;

          // Check if this element contains text content
          const parent = path.parentPath;
          if (!parent || parent.node.type !== 'JSXElement') return;

          const hasTextContent = parent.node.children.some(
            (child) =>
              // Direct text: <h2>Hello</h2>
              (child.type === 'JSXText' && child.value.trim().length > 0) ||
              // Expression text: <h2>{"Hello"}</h2> or <h2>{`Hello`}</h2>
              (child.type === 'JSXExpressionContainer' &&
                (child.expression.type === 'StringLiteral' ||
                  child.expression.type === 'TemplateLiteral'))
          );

          if (!hasTextContent) return;

          const relPath = relative(rootDir, filename);
          const { line, column } = path.node.loc.start;

          const t = api.types;

          path.node.attributes.push(
            t.jsxAttribute(
              t.jsxIdentifier('data-live-file'),
              t.stringLiteral(relPath)
            ),
            t.jsxAttribute(
              t.jsxIdentifier('data-live-line'),
              t.stringLiteral(String(line))
            ),
            t.jsxAttribute(
              t.jsxIdentifier('data-live-col'),
              t.stringLiteral(String(column))
            )
          );
        },

        // Handle text in array literals that get mapped into JSX
        // e.g. const items = ['foo', 'bar']; items.map(t => <li>{t}</li>)
        // The <li> won't have JSXText children — the variable `t` is an Identifier.
        // We can't trace that at compile time. Instead, also tag elements whose
        // children include JSXExpressionContainer with an Identifier or
        // MemberExpression (likely dynamic text from a variable or object).
        // This gives the overlay the file + line of the JSX element itself,
        // which is still useful for locating the component.
      },
    };
  });
}
```

- [ ] **Step 2: Wire the Babel transform into the plugin**

Update `src/plugins/live-edit/index.js`:

```js
// src/plugins/live-edit/index.js

import liveEditBabelPlugin from './babel-transform.js';

export function liveEdit(options = {}) {
  const config = {
    shortcut: options.shortcut || 'ctrl+e',
    annotationsFile: options.annotationsFile || '.annotations.json',
    editor: options.editor || 'vscode',
    root: '',
  };

  return [
    {
      name: 'vite-plugin-live-edit',
      apply: 'serve',

      configResolved(resolvedConfig) {
        config.root = resolvedConfig.root;
      },

      transformIndexHtml(html) {
        // Will inject overlay in Task 4
        return html;
      },

      configureServer(server) {
        // Will add middleware in Task 3
      },
    },
    {
      name: 'vite-plugin-live-edit-babel',
      apply: 'serve',

      config() {
        // Inject our Babel plugin into @vitejs/plugin-react's Babel pipeline
        // by returning a config that merges into the resolved config
        return {
          // We'll use Vite's transform hook instead
        };
      },

      transform(code, id) {
        // Only process JSX files in src/
        if (!id.endsWith('.jsx') && !id.endsWith('.tsx')) return null;
        if (id.includes('node_modules')) return null;
        if (!config.root) return null;

        // Use Babel to transform
        return transformWithBabel(code, id, config.root);
      },
    },
  ];
}

async function transformWithBabel(code, filename, rootDir) {
  const { transformAsync } = await import('@babel/core');

  const result = await transformAsync(code, {
    filename,
    plugins: [liveEditBabelPlugin(rootDir)],
    parserOpts: {
      plugins: ['jsx'],
    },
    // Don't transform anything else — just inject attributes
    configFile: false,
    babelrc: false,
    sourceMaps: true,
  });

  if (!result || !result.code) return null;

  return {
    code: result.code,
    map: result.map,
  };
}
```

- [ ] **Step 3: Verify attributes appear in the browser**

Run: `npm run dev`
Open http://localhost:5173 in browser. Open DevTools, inspect any text element (e.g. a `<h2>`) in the Sections area.

Expected: The element has `data-live-file="src/components/Sections.jsx"`, `data-live-line`, and `data-live-col` attributes.

- [ ] **Step 4: Verify production build is unaffected**

Run: `npm run build`
Expected: Build succeeds. Inspect `dist/` output — no `data-live-*` attributes present (plugin has `apply: 'serve'`).

- [ ] **Step 5: Commit**

```bash
git add src/plugins/live-edit/babel-transform.js src/plugins/live-edit/index.js
git commit -m "feat(live-edit): add babel transform for source location injection"
```

---

### Task 3: Server Middleware — File Writing + Annotations API

**Files:**
- Create: `src/plugins/live-edit/server-middleware.js`
- Modify: `src/plugins/live-edit/index.js`

API routes on the Vite dev server for saving edits and managing annotations.

- [ ] **Step 1: Create the server middleware**

```js
// src/plugins/live-edit/server-middleware.js

import { readFile, writeFile } from 'fs/promises';
import { resolve, relative, normalize } from 'path';
import { randomBytes } from 'crypto';

export function createMiddleware(config) {
  const { root, annotationsFile } = config;
  const annotationsPath = resolve(root, annotationsFile);

  // Validate that a file path is within the project root
  function validatePath(filePath) {
    const resolved = resolve(root, filePath);
    const rel = relative(root, resolved);
    if (rel.startsWith('..') || resolve(root, rel) !== resolved) {
      throw new Error(`Path traversal blocked: ${filePath}`);
    }
    return resolved;
  }

  async function readAnnotations() {
    try {
      const raw = await readFile(annotationsPath, 'utf-8');
      return JSON.parse(raw);
    } catch {
      return { version: 1, annotations: [] };
    }
  }

  async function writeAnnotations(data) {
    await writeFile(annotationsPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  }

  // Parse JSON body from request
  function parseBody(req) {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error('Invalid JSON'));
        }
      });
      req.on('error', reject);
    });
  }

  function sendJson(res, data, status = 200) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }

  return function middleware(req, res, next) {
    if (!req.url.startsWith('/__live-edit/')) return next();

    const route = req.url.replace('/__live-edit', '');

    // POST /save — write edit back to source
    if (req.method === 'POST' && route === '/save') {
      parseBody(req)
        .then(async ({ file, line, col, oldText, newText }) => {
          const absPath = validatePath(file);
          const source = await readFile(absPath, 'utf-8');
          const lines = source.split('\n');

          // Find the oldText in the source
          const lineIdx = line - 1;
          if (lineIdx < 0 || lineIdx >= lines.length) {
            return sendJson(res, { ok: false, error: `Line ${line} out of range` }, 400);
          }

          // Search from the target line for the old text
          const searchArea = lines.slice(lineIdx).join('\n');
          const textIdx = searchArea.indexOf(oldText);
          if (textIdx === -1) {
            return sendJson(res, {
              ok: false,
              error: `Text not found at ${file}:${line}. File may have changed.`,
            }, 400);
          }

          // Replace in the full source
          const beforeSearchArea = lines.slice(0, lineIdx).join('\n');
          const prefix = beforeSearchArea ? beforeSearchArea + '\n' : '';
          const newSource =
            prefix +
            searchArea.slice(0, textIdx) +
            newText +
            searchArea.slice(textIdx + oldText.length);

          await writeFile(absPath, newSource, 'utf-8');
          sendJson(res, { ok: true, file, line });
        })
        .catch((e) => sendJson(res, { ok: false, error: e.message }, 500));
      return;
    }

    // POST /annotate — save an annotation
    if (req.method === 'POST' && route === '/annotate') {
      parseBody(req)
        .then(async ({ file, line, currentText, suggestedText, note }) => {
          const data = await readAnnotations();
          data.annotations.push({
            id: randomBytes(6).toString('hex'),
            file,
            line: Number(line),
            currentText,
            suggestedText,
            note: note || '',
            createdAt: new Date().toISOString(),
          });
          await writeAnnotations(data);
          sendJson(res, { ok: true, count: data.annotations.length });
        })
        .catch((e) => sendJson(res, { ok: false, error: e.message }, 500));
      return;
    }

    // GET /annotations — list all annotations
    if (req.method === 'GET' && route === '/annotations') {
      readAnnotations()
        .then((data) => sendJson(res, data))
        .catch((e) => sendJson(res, { ok: false, error: e.message }, 500));
      return;
    }

    // DELETE /annotations/:id — remove an annotation
    const deleteMatch = route.match(/^\/annotations\/(.+)$/);
    if (req.method === 'DELETE' && deleteMatch) {
      const id = deleteMatch[1];
      readAnnotations()
        .then(async (data) => {
          const before = data.annotations.length;
          data.annotations = data.annotations.filter((a) => a.id !== id);
          if (data.annotations.length === before) {
            return sendJson(res, { ok: false, error: 'Annotation not found' }, 404);
          }
          await writeAnnotations(data);
          sendJson(res, { ok: true, remaining: data.annotations.length });
        })
        .catch((e) => sendJson(res, { ok: false, error: e.message }, 500));
      return;
    }

    next();
  };
}
```

- [ ] **Step 2: Wire middleware into the plugin**

In `src/plugins/live-edit/index.js`, update the `configureServer` hook in the first plugin object:

Replace the `configureServer` function body from:
```js
      configureServer(server) {
        // Will add middleware in Task 3
      },
```
to:
```js
      configureServer(server) {
        const { createMiddleware } = await import('./server-middleware.js');
        // Need to make this work synchronously — use the return function pattern
      },
```

Actually, replace the entire first plugin object's `configureServer` with this pattern. The full updated first plugin in `index.js`:

```js
    {
      name: 'vite-plugin-live-edit',
      apply: 'serve',

      configResolved(resolvedConfig) {
        config.root = resolvedConfig.root;
      },

      transformIndexHtml(html) {
        // Will inject overlay in Task 4
        return html;
      },

      configureServer(server) {
        // Return a function so middleware is added after Vite's internal middleware
        return () => {
          import('./server-middleware.js').then(({ createMiddleware }) => {
            server.middlewares.use(createMiddleware(config));
          });
        };
      },
    },
```

Wait — `configureServer` with a returned function adds post-middleware. But we want our routes available immediately. Let's use direct `server.middlewares.use` instead. Update to:

```js
      configureServer(server) {
        const { createMiddleware } = loadMiddleware();
        server.middlewares.use(createMiddleware(config));
      },
```

Since we're using ESM and top-level imports work fine, simplify — import at the top of `index.js`:

Update the full `src/plugins/live-edit/index.js` to:

```js
// src/plugins/live-edit/index.js

import liveEditBabelPlugin from './babel-transform.js';
import { createMiddleware } from './server-middleware.js';

export function liveEdit(options = {}) {
  const config = {
    shortcut: options.shortcut || 'ctrl+e',
    annotationsFile: options.annotationsFile || '.annotations.json',
    editor: options.editor || 'vscode',
    root: '',
  };

  return [
    {
      name: 'vite-plugin-live-edit',
      apply: 'serve',

      configResolved(resolvedConfig) {
        config.root = resolvedConfig.root;
      },

      transformIndexHtml(html) {
        // Will inject overlay in Task 4
        return html;
      },

      configureServer(server) {
        server.middlewares.use(createMiddleware(config));
      },
    },
    {
      name: 'vite-plugin-live-edit-babel',
      apply: 'serve',

      transform(code, id) {
        if (!id.endsWith('.jsx') && !id.endsWith('.tsx')) return null;
        if (id.includes('node_modules')) return null;
        if (!config.root) return null;

        return transformWithBabel(code, id, config.root);
      },
    },
  ];
}

async function transformWithBabel(code, filename, rootDir) {
  const { transformAsync } = await import('@babel/core');

  const result = await transformAsync(code, {
    filename,
    plugins: [liveEditBabelPlugin(rootDir)],
    parserOpts: {
      plugins: ['jsx'],
    },
    configFile: false,
    babelrc: false,
    sourceMaps: true,
  });

  if (!result || !result.code) return null;

  return {
    code: result.code,
    map: result.map,
  };
}
```

- [ ] **Step 3: Test the save endpoint**

Run: `npm run dev`

In a separate terminal:
```bash
curl -X POST http://localhost:5173/__live-edit/save \
  -H 'Content-Type: application/json' \
  -d '{"file":"src/components/Sections.jsx","line":42,"col":0,"oldText":"A PROBLÉMA × MEGOLDÁS","newText":"PROBLÉMA × MEGOLDÁS"}'
```

Expected: `{"ok":true,"file":"src/components/Sections.jsx","line":42}` and the text changes in the source file. The browser hot-reloads.

Revert the change after testing:
```bash
git checkout src/components/Sections.jsx
```

- [ ] **Step 4: Test the annotations endpoints**

```bash
# Create an annotation
curl -X POST http://localhost:5173/__live-edit/annotate \
  -H 'Content-Type: application/json' \
  -d '{"file":"src/components/Sections.jsx","line":42,"currentText":"A PROBLÉMA × MEGOLDÁS","suggestedText":"PROBLÉMA ÉS MEGOLDÁS","note":"simpler"}'

# List annotations
curl http://localhost:5173/__live-edit/annotations
```

Expected: Annotation created, `.annotations.json` file appears in project root. GET returns the annotation.

- [ ] **Step 5: Commit**

```bash
git add src/plugins/live-edit/server-middleware.js src/plugins/live-edit/index.js
git commit -m "feat(live-edit): add server middleware for save and annotations API"
```

---

### Task 4: Overlay — Core Framework + Mode Switching

**Files:**
- Create: `src/plugins/live-edit/overlay.css`
- Create: `src/plugins/live-edit/overlay.js`
- Modify: `src/plugins/live-edit/index.js`

The overlay is injected as raw HTML/JS/CSS into the page via `transformIndexHtml`. It's vanilla JS — no React — to avoid interfering with the app.

- [ ] **Step 1: Create overlay styles**

```css
/* src/plugins/live-edit/overlay.css */

[data-live-edit-overlay] {
  --le-bg: rgba(15, 15, 15, 0.92);
  --le-border: rgba(255, 255, 255, 0.12);
  --le-text: #e0e0e0;
  --le-text-muted: rgba(255, 255, 255, 0.5);
  --le-accent-edit: #4fc3f7;
  --le-accent-annotate: #ffb74d;
  --le-radius: 10px;
  --le-font: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  font-family: var(--le-font);
  font-size: 13px;
  line-height: 1.4;
  color: var(--le-text);
}

/* Floating pill button */
.le-pill {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 99999;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: var(--le-bg);
  border: 1px solid var(--le-border);
  border-radius: 20px;
  cursor: pointer;
  user-select: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  backdrop-filter: blur(12px);
}

.le-pill:hover {
  border-color: rgba(255, 255, 255, 0.25);
}

.le-pill[data-mode="edit"] {
  border-color: var(--le-accent-edit);
  box-shadow: 0 0 12px rgba(79, 195, 247, 0.2);
}

.le-pill[data-mode="annotate"] {
  border-color: var(--le-accent-annotate);
  box-shadow: 0 0 12px rgba(255, 183, 77, 0.2);
}

.le-pill-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--le-text-muted);
  transition: background 0.15s;
}

.le-pill[data-mode="edit"] .le-pill-dot { background: var(--le-accent-edit); }
.le-pill[data-mode="annotate"] .le-pill-dot { background: var(--le-accent-annotate); }

.le-pill-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.le-pill-shortcut {
  font-size: 10px;
  color: var(--le-text-muted);
  margin-left: 4px;
}

/* Hover highlight on editable elements */
[data-live-edit-active] [data-live-file]:hover {
  outline: 1px solid var(--le-accent-edit, #4fc3f7);
  outline-offset: 2px;
  cursor: pointer;
  border-radius: 2px;
}

[data-live-edit-active="annotate"] [data-live-file]:hover {
  outline-color: var(--le-accent-annotate);
}

/* Popover */
.le-popover {
  position: fixed;
  z-index: 100000;
  width: 360px;
  background: var(--le-bg);
  border: 1px solid var(--le-border);
  border-radius: var(--le-radius);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(12px);
  padding: 16px;
  display: none;
}

.le-popover.visible {
  display: block;
}

.le-popover-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.le-popover-source {
  font-size: 11px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: var(--le-accent-edit);
  text-decoration: none;
  cursor: pointer;
}

.le-popover-source:hover {
  text-decoration: underline;
}

.le-popover-close {
  background: none;
  border: none;
  color: var(--le-text-muted);
  cursor: pointer;
  font-size: 16px;
  padding: 0 4px;
}

.le-popover-close:hover {
  color: var(--le-text);
}

.le-popover label {
  display: block;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--le-text-muted);
  margin-bottom: 4px;
}

.le-popover textarea,
.le-popover input[type="text"] {
  width: 100%;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--le-border);
  border-radius: 6px;
  color: var(--le-text);
  font-family: var(--le-font);
  font-size: 13px;
  padding: 8px 10px;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
}

.le-popover textarea:focus,
.le-popover input[type="text"]:focus {
  border-color: rgba(255, 255, 255, 0.3);
}

.le-popover textarea {
  min-height: 60px;
}

.le-popover-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  justify-content: flex-end;
}

.le-popover-actions button {
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid var(--le-border);
  background: transparent;
  color: var(--le-text);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}

.le-popover-actions button:hover {
  background: rgba(255, 255, 255, 0.06);
}

.le-popover-actions button.le-primary {
  background: var(--le-accent-edit);
  color: #000;
  border-color: transparent;
}

.le-popover-actions button.le-primary:hover {
  opacity: 0.9;
}

.le-popover-actions button.le-primary-annotate {
  background: var(--le-accent-annotate);
  color: #000;
  border-color: transparent;
}

/* Annotation markers */
.le-annotation-marker {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--le-accent-annotate);
  border: 2px solid var(--le-bg);
  cursor: pointer;
  z-index: 99998;
  transform: translate(-50%, -50%);
}

.le-annotation-marker:hover {
  transform: translate(-50%, -50%) scale(1.3);
}
```

- [ ] **Step 2: Create the overlay JavaScript**

```js
// src/plugins/live-edit/overlay.js

(function () {
  'use strict';

  const CONFIG = window.__LIVE_EDIT_CONFIG__ || {};
  const MODES = ['off', 'edit', 'annotate'];
  let currentMode = 'off';
  let popoverEl = null;
  let pillEl = null;
  let activeTarget = null;

  // Check query param for initial mode
  const params = new URLSearchParams(window.location.search);
  if (params.get('live-edit') === 'true') currentMode = 'edit';
  if (params.get('live-edit') === 'annotate') currentMode = 'annotate';

  // ── Pill (floating toggle button) ──

  function createPill() {
    const pill = document.createElement('div');
    pill.className = 'le-pill';
    pill.setAttribute('data-mode', currentMode);
    pill.innerHTML = `
      <span class="le-pill-dot"></span>
      <span class="le-pill-label">Off</span>
      <span class="le-pill-shortcut">${CONFIG.shortcut || 'Ctrl+E'}</span>
    `;
    pill.addEventListener('click', cycleMode);
    return pill;
  }

  function updatePill() {
    if (!pillEl) return;
    pillEl.setAttribute('data-mode', currentMode);
    const label = pillEl.querySelector('.le-pill-label');
    label.textContent = currentMode === 'off' ? 'Live Edit' : currentMode.charAt(0).toUpperCase() + currentMode.slice(1);
  }

  // ── Mode management ──

  function cycleMode() {
    const idx = MODES.indexOf(currentMode);
    currentMode = MODES[(idx + 1) % MODES.length];
    applyMode();
  }

  function applyMode() {
    updatePill();
    closePopover();

    if (currentMode === 'off') {
      document.body.removeAttribute('data-live-edit-active');
    } else {
      document.body.setAttribute('data-live-edit-active', currentMode);
    }
  }

  // ── Popover ──

  function createPopover() {
    const el = document.createElement('div');
    el.className = 'le-popover';
    el.innerHTML = `
      <div class="le-popover-header">
        <a class="le-popover-source" href="#" target="_blank"></a>
        <button class="le-popover-close">&times;</button>
      </div>
      <div class="le-popover-body"></div>
      <div class="le-popover-actions"></div>
    `;
    el.querySelector('.le-popover-close').addEventListener('click', closePopover);
    return el;
  }

  function positionPopover(targetEl) {
    const rect = targetEl.getBoundingClientRect();
    const popRect = popoverEl.getBoundingClientRect();

    let top = rect.bottom + 8;
    let left = rect.left;

    // Keep within viewport
    if (top + popRect.height > window.innerHeight - 20) {
      top = rect.top - popRect.height - 8;
    }
    if (left + popRect.width > window.innerWidth - 20) {
      left = window.innerWidth - popRect.width - 20;
    }
    if (left < 20) left = 20;
    if (top < 20) top = 20;

    popoverEl.style.top = top + 'px';
    popoverEl.style.left = left + 'px';
  }

  function openEditPopover(targetEl) {
    const file = targetEl.getAttribute('data-live-file');
    const line = targetEl.getAttribute('data-live-line');
    const col = targetEl.getAttribute('data-live-col');
    const text = targetEl.textContent.trim();

    activeTarget = targetEl;

    const editor = CONFIG.editor || 'vscode';
    const editorUrl = `${editor}://file/${encodeURIComponent(CONFIG.root + '/' + file)}:${line}:${col}`;

    const sourceLink = popoverEl.querySelector('.le-popover-source');
    sourceLink.textContent = `${file}:${line}`;
    sourceLink.href = editorUrl;

    const body = popoverEl.querySelector('.le-popover-body');
    body.innerHTML = `
      <label>Text</label>
      <textarea class="le-edit-text">${escapeHtml(text)}</textarea>
    `;

    const actions = popoverEl.querySelector('.le-popover-actions');
    actions.innerHTML = `
      <button class="le-cancel">Cancel</button>
      <button class="le-primary le-save">Save <kbd style="opacity:0.6;font-size:10px">⌘↵</kbd></button>
    `;

    actions.querySelector('.le-cancel').addEventListener('click', closePopover);
    actions.querySelector('.le-save').addEventListener('click', () => saveEdit(file, line, col, text));

    const textarea = body.querySelector('.le-edit-text');
    textarea.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        saveEdit(file, line, col, text);
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        closePopover();
      }
    });

    popoverEl.classList.add('visible');
    positionPopover(targetEl);
    textarea.focus();
    textarea.select();
  }

  function openAnnotatePopover(targetEl) {
    const file = targetEl.getAttribute('data-live-file');
    const line = targetEl.getAttribute('data-live-line');
    const text = targetEl.textContent.trim();

    activeTarget = targetEl;

    const sourceLink = popoverEl.querySelector('.le-popover-source');
    sourceLink.textContent = `${file}:${line}`;
    sourceLink.href = '#';

    const body = popoverEl.querySelector('.le-popover-body');
    body.innerHTML = `
      <label>Current text</label>
      <textarea class="le-current-text" readonly style="opacity:0.6;resize:none;min-height:40px">${escapeHtml(text)}</textarea>
      <label style="margin-top:10px">Suggested text</label>
      <textarea class="le-suggested-text" placeholder="Your suggestion..."></textarea>
      <label style="margin-top:10px">Note (optional)</label>
      <input type="text" class="le-note" placeholder="Why this change?" />
    `;

    const actions = popoverEl.querySelector('.le-popover-actions');
    actions.innerHTML = `
      <button class="le-cancel">Cancel</button>
      <button class="le-primary-annotate le-save-annotation">Save Annotation</button>
    `;

    actions.querySelector('.le-cancel').addEventListener('click', closePopover);
    actions.querySelector('.le-save-annotation').addEventListener('click', () => {
      saveAnnotation(file, line, text);
    });

    popoverEl.classList.add('visible');
    positionPopover(targetEl);
    body.querySelector('.le-suggested-text').focus();
  }

  function closePopover() {
    if (popoverEl) popoverEl.classList.remove('visible');
    activeTarget = null;
  }

  // ── API calls ──

  async function saveEdit(file, line, col, oldText) {
    const textarea = popoverEl.querySelector('.le-edit-text');
    const newText = textarea.value;

    if (newText === oldText) {
      closePopover();
      return;
    }

    try {
      const res = await fetch('/__live-edit/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file, line: Number(line), col: Number(col), oldText, newText }),
      });
      const data = await res.json();

      if (data.ok) {
        closePopover();
        // HMR will handle the update
      } else {
        textarea.style.borderColor = '#ef5350';
        console.error('[live-edit] Save failed:', data.error);
      }
    } catch (e) {
      console.error('[live-edit] Save error:', e);
    }
  }

  async function saveAnnotation(file, line, currentText) {
    const suggestedText = popoverEl.querySelector('.le-suggested-text').value;
    const note = popoverEl.querySelector('.le-note').value;

    if (!suggestedText.trim()) return;

    try {
      const res = await fetch('/__live-edit/annotate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file, line: Number(line), currentText, suggestedText, note }),
      });
      const data = await res.json();

      if (data.ok) {
        closePopover();
      } else {
        console.error('[live-edit] Annotate failed:', data.error);
      }
    } catch (e) {
      console.error('[live-edit] Annotate error:', e);
    }
  }

  // ── Click handling ──

  function handleClick(e) {
    if (currentMode === 'off') return;

    // Ignore clicks on the overlay itself
    if (e.target.closest('[data-live-edit-overlay]')) return;

    // Find the closest element with source location
    const target = e.target.closest('[data-live-file]');
    if (!target) return;

    e.preventDefault();
    e.stopPropagation();

    if (currentMode === 'edit') {
      openEditPopover(target);
    } else if (currentMode === 'annotate') {
      openAnnotatePopover(target);
    }
  }

  // ── Keyboard shortcut ──

  function handleKeydown(e) {
    // Parse shortcut string like "ctrl+e"
    const shortcut = (CONFIG.shortcut || 'ctrl+e').toLowerCase();
    const parts = shortcut.split('+');
    const key = parts.pop();
    const needsCtrl = parts.includes('ctrl');
    const needsMeta = parts.includes('meta') || parts.includes('cmd');
    const needsShift = parts.includes('shift');
    const needsAlt = parts.includes('alt');

    if (e.key.toLowerCase() !== key) return;
    if (needsCtrl && !e.ctrlKey) return;
    if (needsMeta && !e.metaKey) return;
    if (needsShift && !e.shiftKey) return;
    if (needsAlt && !e.altKey) return;

    // Don't trigger when typing in inputs
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT' || e.target.isContentEditable) return;

    e.preventDefault();
    cycleMode();
  }

  // ── Escape key ──

  function handleEscape(e) {
    if (e.key === 'Escape') {
      if (popoverEl && popoverEl.classList.contains('visible')) {
        closePopover();
      } else if (currentMode !== 'off') {
        currentMode = 'off';
        applyMode();
      }
    }
  }

  // ── Utilities ──

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Initialize ──

  function init() {
    const container = document.createElement('div');
    container.setAttribute('data-live-edit-overlay', '');

    pillEl = createPill();
    popoverEl = createPopover();

    container.appendChild(pillEl);
    container.appendChild(popoverEl);
    document.body.appendChild(container);

    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('keydown', handleEscape);

    applyMode();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
```

- [ ] **Step 3: Inject overlay via transformIndexHtml**

Update the `transformIndexHtml` hook in `src/plugins/live-edit/index.js`. Replace:

```js
      transformIndexHtml(html) {
        // Will inject overlay in Task 4
        return html;
      },
```

With:

```js
      transformIndexHtml(html) {
        const overlayStylePath = '/@fs' + new URL('./overlay.css', import.meta.url).pathname;
        const overlayScriptPath = '/@fs' + new URL('./overlay.js', import.meta.url).pathname;

        return html.replace(
          '</head>',
          `<link rel="stylesheet" href="${overlayStylePath}" />\n</head>`
        ).replace(
          '</body>',
          `<script>window.__LIVE_EDIT_CONFIG__ = ${JSON.stringify({
            shortcut: config.shortcut,
            editor: config.editor,
            root: config.root,
          })};</script>\n` +
          `<script src="${overlayScriptPath}"></script>\n</body>`
        );
      },
```

- [ ] **Step 4: Verify the overlay appears**

Run: `npm run dev`
Open http://localhost:5173

Expected:
- A small floating pill in the bottom-right corner showing "Live Edit" with a dot
- Pressing `Ctrl+E` cycles through: Edit (blue) → Annotate (orange) → Off
- Clicking the pill also cycles modes
- In Edit mode, hovering text elements shows a blue outline
- Clicking a text element opens the floating popover with the source location and a textarea

- [ ] **Step 5: Test the full edit flow**

1. Press `Ctrl+E` to enter Edit mode
2. Click on a heading like "HOGYAN DOLGOZUNK"
3. The popover should show `src/components/Sections.jsx:152` and the text
4. Change the text and press `Cmd+Enter`
5. The page should hot-reload with the new text

Revert after testing:
```bash
git checkout src/components/Sections.jsx
```

- [ ] **Step 6: Test the annotation flow**

1. Press `Ctrl+E` twice to enter Annotate mode
2. Click on a heading
3. Fill in suggested text and a note
4. Click "Save Annotation"
5. Check that `.annotations.json` appears in the project root with the annotation

- [ ] **Step 7: Commit**

```bash
git add src/plugins/live-edit/overlay.css src/plugins/live-edit/overlay.js src/plugins/live-edit/index.js
git commit -m "feat(live-edit): add overlay UI with edit and annotate popovers"
```

---

### Task 5: Polish + Edge Cases

**Files:**
- Modify: `src/plugins/live-edit/overlay.js`
- Modify: `src/plugins/live-edit/overlay.css`
- Modify: `src/plugins/live-edit/babel-transform.js`

Handle remaining edge cases and polish the experience.

- [ ] **Step 1: Handle elements with dynamic text from variables**

Some elements render text from variables (e.g. `{t}` inside a `.map()`). These elements won't have `data-live-file` themselves, but the parent element or surrounding JSX might. Update the click handler to walk up the DOM to find the nearest element with source info.

In `overlay.js`, the `handleClick` function already does `e.target.closest('[data-live-file]')` which handles this. But we should also tag elements that render expressions (identifiers, member expressions) so they're at least clickable with the component's location.

Update `babel-transform.js` — extend the `hasTextContent` check to also match expression containers with identifiers:

Replace the `hasTextContent` check:

```js
          const hasTextContent = parent.node.children.some(
            (child) =>
              // Direct text: <h2>Hello</h2>
              (child.type === 'JSXText' && child.value.trim().length > 0) ||
              // Expression text: <h2>{"Hello"}</h2> or <h2>{`Hello`}</h2>
              (child.type === 'JSXExpressionContainer' &&
                (child.expression.type === 'StringLiteral' ||
                  child.expression.type === 'TemplateLiteral'))
          );
```

With:

```js
          const hasTextContent = parent.node.children.some(
            (child) =>
              // Direct text: <h2>Hello</h2>
              (child.type === 'JSXText' && child.value.trim().length > 0) ||
              // Expression: <h2>{"Hello"}</h2>, <h2>{`Hello`}</h2>, <h2>{variable}</h2>, <h2>{obj.prop}</h2>
              (child.type === 'JSXExpressionContainer' &&
                (child.expression.type === 'StringLiteral' ||
                  child.expression.type === 'TemplateLiteral' ||
                  child.expression.type === 'Identifier' ||
                  child.expression.type === 'MemberExpression'))
          );
```

- [ ] **Step 2: Prevent overlay from interfering with site interactions when off**

In `overlay.css`, ensure the click handler in `overlay.js` only captures clicks when a mode is active. The `handleClick` function already returns early when `currentMode === 'off'`, but add `pointer-events: none` to the highlight styles when off:

Add to `overlay.css`:

```css
/* When mode is off, don't interfere with hover states */
body:not([data-live-edit-active]) [data-live-file] {
  /* No overlay styles applied */
}
```

This is already handled since the `[data-live-edit-active]` selector only matches when the attribute is present. No change needed here.

- [ ] **Step 3: Add visual feedback for save success/failure**

In `overlay.js`, update the `saveEdit` function to show brief feedback. After the `if (data.ok)` block, add a brief flash:

Replace the `saveEdit` function's success handling:

```js
      if (data.ok) {
        closePopover();
        // HMR will handle the update
      } else {
```

With:

```js
      if (data.ok) {
        // Brief green flash on the target element before HMR refreshes it
        if (activeTarget) {
          activeTarget.style.outline = '2px solid #66bb6a';
          activeTarget.style.outlineOffset = '2px';
        }
        closePopover();
      } else {
```

- [ ] **Step 4: Add `?live-edit` query param support to URL without reload**

In `overlay.js`, update `cycleMode` to update the URL without reloading:

Add after `applyMode()` inside `cycleMode`:

```js
    // Update URL query param
    const url = new URL(window.location);
    if (currentMode === 'off') {
      url.searchParams.delete('live-edit');
    } else {
      url.searchParams.set('live-edit', currentMode);
    }
    window.history.replaceState({}, '', url);
```

- [ ] **Step 5: Verify everything works end-to-end**

Run: `npm run dev`

Test:
1. Open http://localhost:5173
2. Pill visible in bottom-right, says "Live Edit"
3. `Ctrl+E` → Edit mode (blue), hover highlights text elements
4. Click a heading → popover with source link + textarea
5. Change text, `Cmd+Enter` → saves, page updates via HMR
6. `Ctrl+E` → Annotate mode (orange)
7. Click text → annotate popover, fill in suggestion, save
8. `Ctrl+E` → Off mode, no interference with site
9. Add `?live-edit=true` to URL → starts in edit mode
10. Click source link in popover → opens file in VS Code
11. `npm run build` → succeeds, no overlay or attributes in production

- [ ] **Step 6: Commit**

```bash
git add src/plugins/live-edit/
git commit -m "feat(live-edit): polish overlay, handle dynamic text, add visual feedback"
```

---

### Task 6: Integration Smoke Test + Cleanup

**Files:**
- Possibly modify: `src/plugins/live-edit/overlay.js` (if issues found)
- Possibly modify: `src/plugins/live-edit/babel-transform.js` (if issues found)

Final integration testing against the actual 22.design site content.

- [ ] **Step 1: Test with array-rendered content**

The site's `PROCESS_STEPS`, `BENEFITS`, and FAQ arrays render text through `.map()`. Verify:
1. Enter Edit mode
2. Click on a process step title (e.g. "Kiválasztjuk a legjobb utat.")
3. Popover should appear with a source location pointing to `Sections.jsx`
4. Edit the text and save — verify it updates

- [ ] **Step 2: Test with the before/after slider section**

The slider has text inside `.map()` calls (lines 72-77, 89-94 of Sections.jsx). Verify these elements are clickable and editable.

- [ ] **Step 3: Test with nested components**

Click text inside `<Reveal>` wrappers, `<FFButton>` components, etc. The `data-live-file` should be on the inner text-containing element, and `closest('[data-live-file]')` should find it.

- [ ] **Step 4: Verify no style conflicts**

Browse the full page in each mode. Check that:
- The hover outlines don't clash with existing styles
- The popover is readable against both light and dark sections
- The pill doesn't overlap the site's own fixed elements
- Custom cursor (CustomCursor component) doesn't conflict

- [ ] **Step 5: Clean up any test artifacts**

```bash
rm -f .annotations.json
git checkout src/components/Sections.jsx
```

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat(live-edit): complete vite-plugin-live-edit implementation"
```
