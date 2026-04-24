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
