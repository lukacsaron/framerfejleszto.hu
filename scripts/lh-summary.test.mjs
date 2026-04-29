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
