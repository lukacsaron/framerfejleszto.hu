#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PASS_THRESHOLD = 0.9;
const CATEGORY_ORDER = [
  ['performance', 'Performance'],
  ['accessibility', 'Accessibility'],
  ['best-practices', 'Best Practices'],
  ['seo', 'SEO'],
];

export function parseArgs(argv) {
  const out = { in: null };
  for (const a of argv.slice(2)) {
    if (a.startsWith('--in=')) out.in = a.slice('--in='.length);
    else if (!a.startsWith('--')) out.in = a;
  }
  if (!out.in) throw new Error('input folder required: pass --in=<folder> or as positional arg');
  return out;
}

export function buildScoresSection(lhr) {
  const lines = ['## Scores', '', '| Category | Score | Status |', '| --- | ---: | :---: |'];
  for (const [id, label] of CATEGORY_ORDER) {
    const cat = lhr.categories[id];
    const score = cat ? Math.round(cat.score * 100) : 0;
    const marker = (cat?.score ?? 0) >= PASS_THRESHOLD ? '✅' : '⚠️';
    lines.push(`| ${label} | ${score} | ${marker} |`);
  }
  return lines.join('\n');
}
