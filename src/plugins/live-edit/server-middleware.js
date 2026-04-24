// src/plugins/live-edit/server-middleware.js

import { readFile, writeFile } from 'fs/promises';
import { resolve, relative } from 'path';
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
