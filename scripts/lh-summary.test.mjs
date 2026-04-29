import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  parseArgs,
  buildScoresSection,
} from './lh-summary.mjs';

const FIXTURE_DIR = 'scripts/__fixtures__';
const fixture = JSON.parse(readFileSync(join(FIXTURE_DIR, 'baseline.report.json'), 'utf8'));

test('parseArgs reads --in flag', () => {
  const args = parseArgs(['node', 'lh-summary.mjs', '--in=docs/lighthouse/foo']);
  assert.equal(args.in, 'docs/lighthouse/foo');
});

test('parseArgs reads positional folder when no --in', () => {
  const args = parseArgs(['node', 'lh-summary.mjs', 'docs/lighthouse/bar']);
  assert.equal(args.in, 'docs/lighthouse/bar');
});

test('parseArgs throws when no folder given', () => {
  assert.throws(() => parseArgs(['node', 'lh-summary.mjs']), /folder required/i);
});

test('buildScoresSection renders table with pass/fail markers (threshold 90)', () => {
  const md = buildScoresSection(fixture);
  assert.match(md, /## Scores/);
  assert.match(md, /Performance/);
  assert.match(md, /Accessibility/);
  assert.match(md, /Best Practices/);
  assert.match(md, /SEO/);
  // every row contains either ✅ or ⚠️
  const rows = md.split('\n').filter((l) => l.startsWith('|') && !l.includes('---') && !l.includes('Category'));
  assert.ok(rows.length === 4, `expected 4 score rows, got ${rows.length}`);
  for (const row of rows) {
    assert.ok(row.includes('✅') || row.includes('⚠️'), `row missing marker: ${row}`);
  }
});

import { buildOpportunitiesSection } from './lh-summary.mjs';

test('buildOpportunitiesSection lists audits with savings, sorted desc by ms', () => {
  const md = buildOpportunitiesSection(fixture);
  assert.match(md, /## Top opportunities/);
  // Must be a markdown table with the right header
  assert.match(md, /\| Audit \| Est\. savings \| Top offenders \|/);
  // Pull rows
  const rows = md.split('\n').filter((l) => l.startsWith('|') && !l.match(/^\|\s*-/) && !l.includes('Audit |'));
  assert.ok(rows.length > 0, 'expected at least one opportunity row');
  // Each row has 3 pipe-separated cells
  for (const row of rows) {
    const cells = row.split('|').slice(1, -1);
    assert.equal(cells.length, 3, `row should have 3 cells: ${row}`);
  }
});

test('buildOpportunitiesSection emits "(none)" when there are no opportunities', () => {
  const empty = { audits: {}, categories: { performance: { auditRefs: [] } } };
  const md = buildOpportunitiesSection(empty);
  assert.match(md, /## Top opportunities/);
  assert.match(md, /\(none\)/);
});

import { buildDiagnosticsSection } from './lh-summary.mjs';

test('buildDiagnosticsSection lists failing non-opportunity audits', () => {
  const md = buildDiagnosticsSection(fixture);
  assert.match(md, /## Diagnostics/);
  // bullet list, not a table
  const bullets = md.split('\n').filter((l) => l.startsWith('- '));
  // Real fixture has at least some failing audits
  assert.ok(bullets.length > 0, 'expected at least one diagnostic bullet');
});

test('buildDiagnosticsSection skips audits with score === 1', () => {
  const lhr = {
    audits: {
      passing: { id: 'passing', title: 'All good', score: 1 },
      failing: { id: 'failing', title: 'Bad thing', score: 0.4, displayValue: '5 issues' },
    },
  };
  const md = buildDiagnosticsSection(lhr);
  assert.doesNotMatch(md, /All good/);
  assert.match(md, /Bad thing/);
  assert.match(md, /5 issues/);
});

test('buildDiagnosticsSection skips audits already counted as opportunities', () => {
  const lhr = {
    audits: {
      opp:   { id: 'opp',   title: 'Defer JS', score: 0.5, details: { overallSavingsMs: 200 } },
      diag:  { id: 'diag',  title: 'Bad thing', score: 0.4 },
    },
  };
  const md = buildDiagnosticsSection(lhr);
  assert.doesNotMatch(md, /Defer JS/);
  assert.match(md, /Bad thing/);
});

import { buildMetricsSection } from './lh-summary.mjs';

test('buildMetricsSection emits a row for each canonical metric', () => {
  const md = buildMetricsSection(fixture);
  assert.match(md, /## Metrics/);
  for (const m of ['First Contentful Paint', 'Largest Contentful Paint', 'Total Blocking Time', 'Cumulative Layout Shift', 'Speed Index']) {
    assert.match(md, new RegExp(m), `missing metric: ${m}`);
  }
});

test('buildMetricsSection handles missing audits gracefully', () => {
  const md = buildMetricsSection({ audits: {} });
  assert.match(md, /## Metrics/);
  assert.match(md, /First Contentful Paint/);
  // missing values rendered as —
  assert.match(md, /—/);
});

import { buildSummary } from './lh-summary.mjs';

test('buildSummary concatenates all sections in order with H1 header', () => {
  const md = buildSummary(fixture, { url: 'https://example.com', preset: 'mobile' });
  // header
  assert.match(md, /^# Lighthouse Summary/m);
  assert.match(md, /https:\/\/example\.com/);
  assert.match(md, /preset: mobile/);
  // sections in order
  const idxScores = md.indexOf('## Scores');
  const idxOpps = md.indexOf('## Top opportunities');
  const idxDiag = md.indexOf('## Diagnostics');
  const idxMetrics = md.indexOf('## Metrics');
  assert.ok(idxScores > -1 && idxOpps > idxScores && idxDiag > idxOpps && idxMetrics > idxDiag,
    'sections out of order or missing');
});

test('buildDiagnosticsSection skips canonical metric audits', () => {
  const lhr = {
    audits: {
      'first-contentful-paint': { id: 'first-contentful-paint', title: 'First Contentful Paint', score: 0.5, displayValue: '4 s' },
      'largest-contentful-paint': { id: 'largest-contentful-paint', title: 'Largest Contentful Paint', score: 0.5, displayValue: '4.5 s' },
      'total-blocking-time': { id: 'total-blocking-time', title: 'Total Blocking Time', score: 0.5, displayValue: '300 ms' },
      'cumulative-layout-shift': { id: 'cumulative-layout-shift', title: 'Cumulative Layout Shift', score: 0.5, displayValue: '0.1' },
      'speed-index': { id: 'speed-index', title: 'Speed Index', score: 0.5, displayValue: '5 s' },
      'interactive': { id: 'interactive', title: 'Time to Interactive', score: 0.5, displayValue: '4 s' },
      'real-diagnostic': { id: 'real-diagnostic', title: 'Real diagnostic finding', score: 0.4 },
    },
  };
  const md = buildDiagnosticsSection(lhr);
  assert.doesNotMatch(md, /First Contentful Paint/);
  assert.doesNotMatch(md, /Largest Contentful Paint/);
  assert.doesNotMatch(md, /Total Blocking Time/);
  assert.doesNotMatch(md, /Cumulative Layout Shift/);
  assert.doesNotMatch(md, /Speed Index/);
  assert.doesNotMatch(md, /Time to Interactive/);
  assert.match(md, /Real diagnostic finding/);
});
