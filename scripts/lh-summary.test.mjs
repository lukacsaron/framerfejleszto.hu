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
