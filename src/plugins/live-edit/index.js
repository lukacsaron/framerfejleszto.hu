// src/plugins/live-edit/index.js

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import liveEditBabelPlugin from './babel-transform.js';
import { createMiddleware } from './server-middleware.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const overlayCSS = readFileSync(join(__dirname, 'overlay.css'), 'utf-8');
const overlayJS = readFileSync(join(__dirname, 'overlay.js'), 'utf-8');

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
        return html
          .replace('</head>', `<style>${overlayCSS}</style>\n</head>`)
          .replace(
            '</body>',
            `<script>window.__LIVE_EDIT_CONFIG__ = ${JSON.stringify({
              shortcut: config.shortcut,
              editor: config.editor,
              root: config.root,
            })};</script>\n` +
            `<script>${overlayJS}</script>\n</body>`
          );
      },

      configureServer(server) {
        server.middlewares.use(createMiddleware(config));
      },
    },
    {
      name: 'vite-plugin-live-edit-babel',
      apply: 'serve',
      enforce: 'pre',

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
