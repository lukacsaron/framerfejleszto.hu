// src/plugins/live-edit/babel-transform.js

import { relative } from 'path';

export default function liveEditBabelPlugin(rootDir) {
  return function (api) {
    const t = api.types;

    return {
      name: 'live-edit-source-loc',
      visitor: {
        JSXOpeningElement(path, state) {
          const filename = state.filename;
          if (!filename) return;

          // Skip if already has data-live-file (avoid double-injection)
          const existing = path.node.attributes.find(
            (attr) =>
              attr.type === 'JSXAttribute' &&
              attr.name?.name === 'data-live-file'
          );
          if (existing) return;

          // Check if this element contains text content
          const parent = path.parentPath;
          if (!parent || parent.node.type !== 'JSXElement') return;

          const hasTextContent = parent.node.children.some(
            (child) =>
              // Direct text: <h2>Hello</h2>
              (child.type === 'JSXText' && child.value.trim().length > 0) ||
              // Expression text: <h2>{"Hello"}</h2>, <h2>{`Hello`}</h2>,
              // or {variable}/{obj.prop} where the literal lives in a data
              // structure elsewhere. The save endpoint locates the string
              // by searching the whole file, so cross-line refs work.
              (child.type === 'JSXExpressionContainer' &&
                (child.expression.type === 'StringLiteral' ||
                  child.expression.type === 'TemplateLiteral' ||
                  child.expression.type === 'Identifier' ||
                  child.expression.type === 'MemberExpression'))
          );

          if (!hasTextContent) return;

          const relPath = relative(rootDir, filename);
          const { line, column } = path.node.loc.start;

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
      },
    };
  };
}
