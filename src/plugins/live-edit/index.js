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
