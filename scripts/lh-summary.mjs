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

function truncate(s, n) {
  if (!s) return '';
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

function formatSavings(audit) {
  const ms = audit.details?.overallSavingsMs;
  const bytes = audit.details?.overallSavingsBytes;
  if (ms && ms > 0) return `${Math.round(ms)} ms`;
  if (bytes && bytes > 0) return `${(bytes / 1024).toFixed(0)} KiB`;
  return '—';
}

function topOffenders(audit) {
  const items = audit.details?.items;
  if (!Array.isArray(items) || items.length === 0) return '—';
  const labels = items.slice(0, 3).map((it) => {
    const raw = it.url || it.node?.selector || it.source?.url || it.label || '';
    return truncate(String(raw), 80);
  });
  return labels.filter(Boolean).map((l) => `\`${l}\``).join('<br>') || '—';
}

export function buildOpportunitiesSection(lhr) {
  const audits = lhr.audits || {};
  const opps = Object.values(audits)
    .filter((a) => {
      const ms = a.details?.overallSavingsMs;
      const bytes = a.details?.overallSavingsBytes;
      return (ms && ms > 0) || (bytes && bytes > 0);
    })
    .sort((a, b) => {
      const am = a.details?.overallSavingsMs ?? 0;
      const bm = b.details?.overallSavingsMs ?? 0;
      if (am !== bm) return bm - am;
      const ab = a.details?.overallSavingsBytes ?? 0;
      const bb = b.details?.overallSavingsBytes ?? 0;
      return bb - ab;
    });

  const lines = ['## Top opportunities', ''];
  if (opps.length === 0) {
    lines.push('(none)');
    return lines.join('\n');
  }
  lines.push('| Audit | Est. savings | Top offenders |');
  lines.push('| --- | ---: | --- |');
  for (const a of opps) {
    lines.push(`| ${a.title} | ${formatSavings(a)} | ${topOffenders(a)} |`);
  }
  return lines.join('\n');
}
