// src/plugins/live-edit/server-middleware.js

import { readFile, writeFile } from 'fs/promises';
import { resolve, relative } from 'path';
import { randomBytes } from 'crypto';
import { parse as babelParse } from '@babel/parser';
import _traverse from '@babel/traverse';
const traverse = _traverse.default || _traverse;

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

  function findAllIndexes(source, needle) {
    if (!needle) return [];
    const out = [];
    let from = 0;
    while (true) {
      const i = source.indexOf(needle, from);
      if (i === -1) break;
      out.push({ index: i, length: needle.length });
      from = i + needle.length;
    }
    return out;
  }

  // Match `needle` in `source` while treating "rendered whitespace" loosely.
  // The browser hands us the DOM-rendered text (single space, no newlines),
  // but the source file may have:
  //   - literal newlines + JSX indentation between segments
  //   - JSX whitespace expressions like `{' '}` or `{" "}` to force a space
  // Both render to a single space in the DOM. We expand each whitespace run
  // in the pattern to a class that also accepts these JSX expressions, so
  // the search lines up with the on-disk source regardless of formatting.
  function findAllIndexesFlexWhitespace(source, needle) {
    if (!needle.trim()) return [];
    const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // One DOM-whitespace-equivalent unit:
    //   \s                     real whitespace
    //   \{['"] ... ['"]\}      JSX whitespace expression like {' '} / {" "}
    //   <br\s*/?>              JSX line break (renders as space/newline)
    // `+` makes runs of these match together.
    const WS_UNIT = "(?:\\s|\\{['\"]\\s*['\"]\\}|<br\\s*/?>)";
    const flexible = escaped.replace(/\s+/g, WS_UNIT + '+');
    const re = new RegExp(flexible, 'g');
    const out = [];
    let m;
    while ((m = re.exec(source)) !== null) {
      out.push({ index: m.index, length: m[0].length });
      if (m[0].length === 0) re.lastIndex++;
    }
    return out;
  }

  function lineColToOffset(source, line, col) {
    const targetLine = Math.max(1, Number(line) || 1);
    const targetCol = Math.max(1, Number(col) || 1);
    let offset = 0;
    let curLine = 1;
    while (curLine < targetLine) {
      const nl = source.indexOf('\n', offset);
      if (nl === -1) return source.length;
      offset = nl + 1;
      curLine++;
    }
    return Math.min(source.length, offset + (targetCol - 1));
  }

  // Locate the JSX element whose opening tag starts at `line:col` (matching
  // the `data-live-line` / `data-live-col` attributes the babel transform
  // injected). Returns the babel JSXElement node, or null if not found / if
  // parsing fails.
  function findJSXElementAt(source, line, col) {
    let ast;
    try {
      ast = babelParse(source, {
        sourceType: 'module',
        errorRecovery: true,
        plugins: ['jsx', 'typescript'],
      });
    } catch {
      return null;
    }
    let result = null;
    traverse(ast, {
      JSXOpeningElement(path) {
        const loc = path.node.loc;
        if (!loc) return;
        // babel column is 0-based; data-live-col stores the same value.
        if (loc.start.line === line && loc.start.column === col) {
          result = path.parentPath.node;
          path.stop();
        }
      },
    });
    return result;
  }

  // True when the JSXElement holds text we can replace literally (direct
  // JSXText, JSX fragments containing literals, inline formatting elements,
  // <br/>, etc.). False when its only content is variable interpolation
  // (`{s.title}`), which lives in a data structure elsewhere — those cases
  // need the whole-file fallback search.
  function hasInlineEditableContent(element) {
    if (!element || !element.children) return false;
    for (const c of element.children) {
      if (c.type === 'JSXText' && c.value.trim().length > 0) return true;
      if (c.type === 'JSXElement') return true;
      if (c.type === 'JSXExpressionContainer') {
        const e = c.expression;
        if (
          e.type === 'StringLiteral' ||
          (e.type === 'TemplateLiteral' && e.expressions.length === 0)
        ) {
          return true;
        }
      }
    }
    return false;
  }

  return function middleware(req, res, next) {
    if (!req.url.startsWith('/__live-edit/')) return next();

    const route = req.url.replace('/__live-edit', '');

    // POST /save — write edit back to source.
    //
    // Strategy:
    //   1. Parse the source as JSX, find the element at `line:col`
    //      (the same position the babel transform recorded as data-live-line
    //      / data-live-col). If that element has inline-editable content
    //      (direct JSXText, formatting tags, <br/>, etc.) we replace the
    //      byte range between its opening `>` and closing `<`. This is
    //      whitespace-, entity-, and JSX-construct-agnostic — no matching.
    //   2. Otherwise (e.g. `<h4>{s.title}</h4>` whose text lives in a
    //      separate data array), fall back to a whole-file text search
    //      using `oldText`. Exact match first, then a whitespace-tolerant
    //      regex for legacy callers.
    if (req.method === 'POST' && route === '/save') {
      parseBody(req)
        .then(async ({ file, line, col, oldText, newText }) => {
          const absPath = validatePath(file);
          const source = await readFile(absPath, 'utf-8');
          const lineNum = Number(line);
          const colNum = Number(col);

          // 1) AST-based replacement.
          const element = findJSXElementAt(source, lineNum, colNum);
          if (
            element &&
            element.openingElement &&
            element.closingElement &&
            hasInlineEditableContent(element)
          ) {
            const startIdx = element.openingElement.end;
            const endIdx = element.closingElement.start;
            const newSource =
              source.slice(0, startIdx) + newText + source.slice(endIdx);
            await writeFile(absPath, newSource, 'utf-8');
            return sendJson(res, { ok: true, file, line, mode: 'ast' });
          }

          // 2) Fallback: whole-file search for data-driven content.
          let matches = findAllIndexes(source, oldText);
          if (matches.length === 0) {
            matches = findAllIndexesFlexWhitespace(source, oldText);
          }
          if (matches.length === 0) {
            return sendJson(res, {
              ok: false,
              error: `Text not found in ${file}. File may have changed.`,
            }, 400);
          }

          const targetOffset = lineColToOffset(source, lineNum, colNum);
          const best = matches.reduce((acc, m) =>
            Math.abs(m.index - targetOffset) < Math.abs(acc.index - targetOffset) ? m : acc
          , matches[0]);

          const newSource =
            source.slice(0, best.index) + newText + source.slice(best.index + best.length);

          await writeFile(absPath, newSource, 'utf-8');
          sendJson(res, { ok: true, file, line, mode: 'fallback', matches: matches.length });
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
