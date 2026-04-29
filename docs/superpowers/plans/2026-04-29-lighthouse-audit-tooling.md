# Lighthouse Audit Tooling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `npm run audit` tooling to this repo that produces detailed Lighthouse audit reports + a diffable markdown summary, then capture a baseline run for staging.

**Architecture:** Two ESM Node scripts under `scripts/`. `lh-audit.mjs` is glue — boots Chrome via `chrome-launcher`, invokes the `lighthouse` library, writes `report.html` + `report.json` to `docs/lighthouse/<timestamp-preset>/`, then calls the summary script. `lh-summary.mjs` is pure data transformation: read `report.json`, write `summary.md` with scores/opportunities/diagnostics/metrics. Audit script is verified by running it; summary script is TDD'd against a real fixture captured from the first audit run.

**Tech Stack:** Node ESM (existing project is `"type": "module"`), `lighthouse@^12`, `chrome-launcher@^1`, `node:test` + `node:assert` (stdlib, no extra devDeps).

---

## File Structure

**Files this plan creates:**
- `scripts/lh-audit.mjs` — audit runner (~80 lines)
- `scripts/lh-summary.mjs` — JSON → markdown summary (~100 lines)
- `scripts/lh-summary.test.mjs` — unit tests for the summary
- `scripts/__fixtures__/baseline.report.json` — real Lighthouse JSON, captured during Task 3, used by tests
- `docs/lighthouse/<timestamp-mobile>/{report.html,report.json,summary.md}` — first baseline run, committed

**Files this plan modifies:**
- `package.json` — add `lighthouse` + `chrome-launcher` devDeps and three scripts (`audit`, `audit:desktop`, `audit:summary`)

No changes to source `src/` files in this plan — those come in *later* plans driven by the baseline summary.

---

## Task 1: Install dependencies and add scripts

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install lighthouse and chrome-launcher as devDeps**

Run from project root:

```bash
npm install --save-dev lighthouse@^12 chrome-launcher@^1
```

Expected: both packages added to `devDependencies` in `package.json`. `npm` may emit warnings about Chromium download — that's expected.

- [ ] **Step 2: Add audit scripts to package.json**

Open `package.json`, replace the `"scripts"` block with:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "audit": "node scripts/lh-audit.mjs",
  "audit:desktop": "node scripts/lh-audit.mjs --preset=desktop",
  "audit:summary": "node scripts/lh-summary.mjs"
}
```

- [ ] **Step 3: Verify install succeeded**

Run: `node -e "import('lighthouse').then(m => console.log('ok', typeof m.default))"`
Expected stdout: `ok function`

Run: `node -e "import('chrome-launcher').then(m => console.log('ok', typeof m.launch))"`
Expected stdout: `ok function`

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(audit): add lighthouse and chrome-launcher devDeps + npm scripts"
```

---

## Task 2: Implement `scripts/lh-audit.mjs`

**Files:**
- Create: `scripts/lh-audit.mjs`

This script is verified by running, not by unit tests. Logic is mostly orchestration of external libraries.

- [ ] **Step 1: Write the script**

Create `scripts/lh-audit.mjs` with exactly this content:

```javascript
#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const DEFAULT_URL = 'https://framerfejleszto.prototype.loginet.tech/';

function parseArgs(argv) {
  const args = { url: DEFAULT_URL, preset: 'mobile', out: null };
  for (const a of argv.slice(2)) {
    if (a.startsWith('--url=')) args.url = a.slice('--url='.length);
    else if (a.startsWith('--preset=')) args.preset = a.slice('--preset='.length);
    else if (a.startsWith('--out=')) args.out = a.slice('--out='.length);
  }
  if (args.preset !== 'mobile' && args.preset !== 'desktop') {
    throw new Error(`--preset must be 'mobile' or 'desktop' (got '${args.preset}')`);
  }
  return args;
}

function timestampSlug() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

function buildConfig(preset) {
  if (preset === 'desktop') {
    return {
      extends: 'lighthouse:default',
      settings: {
        formFactor: 'desktop',
        screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false },
        throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1, requestLatencyMs: 0, downloadThroughputKbps: 0, uploadThroughputKbps: 0 },
        emulatedUserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    };
  }
  return { extends: 'lighthouse:default', settings: { formFactor: 'mobile' } };
}

async function run() {
  const args = parseArgs(process.argv);
  const slug = timestampSlug();
  const outDir = args.out
    ? resolve(args.out)
    : resolve(`docs/lighthouse/${slug}-${args.preset}`);
  mkdirSync(outDir, { recursive: true });

  console.log(`[lh-audit] url=${args.url} preset=${args.preset}`);
  console.log(`[lh-audit] writing to ${outDir}`);

  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new', '--no-sandbox'] });
  let runnerResult;
  try {
    runnerResult = await lighthouse(
      args.url,
      { port: chrome.port, output: ['html', 'json'], logLevel: 'error' },
      buildConfig(args.preset),
    );
  } finally {
    await chrome.kill();
  }

  if (!runnerResult) throw new Error('Lighthouse returned no result');

  const [htmlReport, jsonReport] = runnerResult.report;
  writeFileSync(join(outDir, 'report.html'), htmlReport);
  writeFileSync(join(outDir, 'report.json'), jsonReport);

  const lhr = runnerResult.lhr;
  const score = (id) => Math.round((lhr.categories[id]?.score ?? 0) * 100);
  console.log(`[lh-audit] Performance ${score('performance')} · Accessibility ${score('accessibility')} · Best Practices ${score('best-practices')} · SEO ${score('seo')}`);

  const summaryRes = spawnSync('node', ['scripts/lh-summary.mjs', `--in=${outDir}`], { stdio: 'inherit' });
  if (summaryRes.status !== 0) {
    console.warn(`[lh-audit] summary script exited ${summaryRes.status} — raw report still available at ${outDir}`);
  }

  console.log(`[lh-audit] done: ${join(outDir, 'summary.md')}`);
}

run().catch((err) => {
  console.error('[lh-audit] failed:', err);
  process.exit(1);
});
```

- [ ] **Step 2: Verify it parses**

Run: `node --check scripts/lh-audit.mjs`
Expected: no output, exit 0.

- [ ] **Step 3: Verify CLI flag parsing without launching Chrome**

Run: `node -e "import('./scripts/lh-audit.mjs').catch(()=>{})"` — this just ensures the module loads. Don't run the full audit yet (that's Task 3).

Expected: process exits cleanly because no real audit is started; module loads without import errors.

- [ ] **Step 4: Commit**

```bash
git add scripts/lh-audit.mjs
git commit -m "feat(audit): add scripts/lh-audit.mjs"
```

---

## Task 3: Run the first audit to capture a real fixture

This is intentionally placed BEFORE the summary script so we can TDD the summary against real Lighthouse JSON, not hand-crafted fakes. The summary script doesn't exist yet, so the audit script's `spawnSync` to `lh-summary.mjs` will warn — that's expected and fine. The HTML and JSON reports get written regardless.

**Files:**
- Create (via running): `docs/lighthouse/<timestamp>-mobile/report.{html,json}`
- Create (by copying): `scripts/__fixtures__/baseline.report.json`

- [ ] **Step 1: Run a mobile audit against staging**

Run: `npm run audit`

Expected:
- Console shows `[lh-audit] url=https://framerfejleszto.prototype.loginet.tech/ preset=mobile`
- Console shows `[lh-audit] Performance NN · Accessibility NN · Best Practices NN · SEO NN` (numbers ~57/83/100/83 ± Lighthouse variance)
- A warning like `summary script exited ... raw report still available at ...` — this is expected since `lh-summary.mjs` doesn't exist yet
- Files exist: `docs/lighthouse/<timestamp>-mobile/report.html` and `report.json`

If the run fails before writing files, debug and re-run before proceeding.

- [ ] **Step 2: Capture the fixture**

Run (replace `<timestamp>` with the actual folder name from Step 1):

```bash
mkdir -p scripts/__fixtures__
cp docs/lighthouse/<timestamp>-mobile/report.json scripts/__fixtures__/baseline.report.json
```

Verify: `ls -lh scripts/__fixtures__/baseline.report.json` shows a multi-MB file.

- [ ] **Step 3: Commit the baseline run + fixture**

```bash
git add docs/lighthouse scripts/__fixtures__
git commit -m "chore(audit): capture baseline mobile audit and summary fixture"
```

---

## Task 4: TDD `scripts/lh-summary.mjs` — scores section

Build the summary script in slices, test-first. Each task adds one section.

**Files:**
- Create: `scripts/lh-summary.test.mjs`
- Create: `scripts/lh-summary.mjs`

- [ ] **Step 1: Write the failing test for `parseArgs`**

Create `scripts/lh-summary.test.mjs`:

```javascript
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
```

- [ ] **Step 2: Run the test to confirm it fails**

Run: `node --test scripts/lh-summary.test.mjs`
Expected: FAIL with `Cannot find module './lh-summary.mjs'` or similar.

- [ ] **Step 3: Create minimal `scripts/lh-summary.mjs` with `parseArgs` and `buildScoresSection`**

```javascript
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
```

- [ ] **Step 4: Run the tests, confirm pass**

Run: `node --test scripts/lh-summary.test.mjs`
Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add scripts/lh-summary.mjs scripts/lh-summary.test.mjs
git commit -m "feat(audit): summary parseArgs + scores section"
```

---

## Task 5: Add opportunities section

**Files:**
- Modify: `scripts/lh-summary.test.mjs`
- Modify: `scripts/lh-summary.mjs`

- [ ] **Step 1: Add failing tests for `buildOpportunitiesSection`**

Append to `scripts/lh-summary.test.mjs`:

```javascript
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
```

- [ ] **Step 2: Run, confirm fail**

Run: `node --test scripts/lh-summary.test.mjs`
Expected: 2 new tests fail with `buildOpportunitiesSection is not a function` or similar.

- [ ] **Step 3: Implement `buildOpportunitiesSection`**

Append to `scripts/lh-summary.mjs`:

```javascript
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
```

- [ ] **Step 4: Run, confirm pass**

Run: `node --test scripts/lh-summary.test.mjs`
Expected: all tests pass (6 total now).

- [ ] **Step 5: Commit**

```bash
git add scripts/lh-summary.mjs scripts/lh-summary.test.mjs
git commit -m "feat(audit): summary opportunities section"
```

---

## Task 6: Add diagnostics section

Diagnostics = audits with `score < 1` that aren't already in the opportunities list.

**Files:**
- Modify: `scripts/lh-summary.test.mjs`
- Modify: `scripts/lh-summary.mjs`

- [ ] **Step 1: Add failing tests**

Append to `scripts/lh-summary.test.mjs`:

```javascript
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
```

- [ ] **Step 2: Run, confirm fail**

Run: `node --test scripts/lh-summary.test.mjs`
Expected: 3 new tests fail.

- [ ] **Step 3: Implement `buildDiagnosticsSection`**

Append to `scripts/lh-summary.mjs`:

```javascript
function isOpportunity(a) {
  const ms = a.details?.overallSavingsMs;
  const bytes = a.details?.overallSavingsBytes;
  return (ms && ms > 0) || (bytes && bytes > 0);
}

export function buildDiagnosticsSection(lhr) {
  const audits = Object.values(lhr.audits || {});
  const diags = audits
    .filter((a) => typeof a.score === 'number' && a.score < 1)
    .filter((a) => !isOpportunity(a));

  const lines = ['## Diagnostics', ''];
  if (diags.length === 0) {
    lines.push('(none)');
    return lines.join('\n');
  }
  for (const a of diags) {
    const dv = a.displayValue ? ` — ${a.displayValue}` : '';
    lines.push(`- **${a.title}**${dv}`);
  }
  return lines.join('\n');
}
```

- [ ] **Step 4: Run, confirm pass**

Run: `node --test scripts/lh-summary.test.mjs`
Expected: all 9 tests pass.

- [ ] **Step 5: Commit**

```bash
git add scripts/lh-summary.mjs scripts/lh-summary.test.mjs
git commit -m "feat(audit): summary diagnostics section"
```

---

## Task 7: Add metrics section

Metrics = the canonical performance numbers (FCP, LCP, TBT, CLS, SI, TTI), pulled from `lhr.audits[<id>]`.

**Files:**
- Modify: `scripts/lh-summary.test.mjs`
- Modify: `scripts/lh-summary.mjs`

- [ ] **Step 1: Add failing tests**

Append to `scripts/lh-summary.test.mjs`:

```javascript
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
```

- [ ] **Step 2: Run, confirm fail**

Run: `node --test scripts/lh-summary.test.mjs`
Expected: 2 new tests fail.

- [ ] **Step 3: Implement `buildMetricsSection`**

Append to `scripts/lh-summary.mjs`:

```javascript
const METRICS = [
  ['first-contentful-paint', 'First Contentful Paint'],
  ['largest-contentful-paint', 'Largest Contentful Paint'],
  ['total-blocking-time', 'Total Blocking Time'],
  ['cumulative-layout-shift', 'Cumulative Layout Shift'],
  ['speed-index', 'Speed Index'],
  ['interactive', 'Time to Interactive'],
];

export function buildMetricsSection(lhr) {
  const audits = lhr.audits || {};
  const lines = ['## Metrics', '', '| Metric | Value |', '| --- | ---: |'];
  for (const [id, label] of METRICS) {
    const a = audits[id];
    const value = a?.displayValue ?? '—';
    lines.push(`| ${label} | ${value} |`);
  }
  return lines.join('\n');
}
```

- [ ] **Step 4: Run, confirm pass**

Run: `node --test scripts/lh-summary.test.mjs`
Expected: all 11 tests pass.

- [ ] **Step 5: Commit**

```bash
git add scripts/lh-summary.mjs scripts/lh-summary.test.mjs
git commit -m "feat(audit): summary metrics section"
```

---

## Task 8: Wire `main()` so the script writes `summary.md`

**Files:**
- Modify: `scripts/lh-summary.test.mjs`
- Modify: `scripts/lh-summary.mjs`

- [ ] **Step 1: Add failing test for `buildSummary` (composition)**

Append to `scripts/lh-summary.test.mjs`:

```javascript
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
```

- [ ] **Step 2: Run, confirm fail**

Run: `node --test scripts/lh-summary.test.mjs`
Expected: 1 new test fails.

- [ ] **Step 3: Implement `buildSummary` and `main()`**

Append to `scripts/lh-summary.mjs`:

```javascript
export function buildSummary(lhr, meta = {}) {
  const url = meta.url ?? lhr.finalDisplayedUrl ?? lhr.requestedUrl ?? '';
  const preset = meta.preset ?? lhr.configSettings?.formFactor ?? '';
  const fetchedAt = lhr.fetchTime ?? '';
  const header = [
    '# Lighthouse Summary',
    '',
    `- url: ${url}`,
    `- preset: ${preset}`,
    `- fetched: ${fetchedAt}`,
    '',
  ].join('\n');
  return [
    header,
    buildScoresSection(lhr),
    '',
    buildOpportunitiesSection(lhr),
    '',
    buildDiagnosticsSection(lhr),
    '',
    buildMetricsSection(lhr),
    '',
  ].join('\n');
}

function detectPresetFromFolder(folder) {
  if (folder.endsWith('-desktop')) return 'desktop';
  if (folder.endsWith('-mobile')) return 'mobile';
  return '';
}

async function main() {
  const args = parseArgs(process.argv);
  const reportPath = join(args.in, 'report.json');
  const lhr = JSON.parse(readFileSync(reportPath, 'utf8'));
  const md = buildSummary(lhr, { preset: detectPresetFromFolder(args.in) });
  const outPath = join(args.in, 'summary.md');
  writeFileSync(outPath, md);
  console.log(`[lh-summary] wrote ${outPath}`);
}

const isMain = import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('lh-summary.mjs');
if (isMain) {
  main().catch((err) => {
    console.error('[lh-summary] failed:', err);
    process.exit(1);
  });
}
```

- [ ] **Step 4: Run unit tests, confirm pass**

Run: `node --test scripts/lh-summary.test.mjs`
Expected: all 12 tests pass.

- [ ] **Step 5: Run summary against the fixture folder end-to-end**

Pick the baseline folder from Task 3 (replace `<timestamp>` accordingly) and run:

```bash
node scripts/lh-summary.mjs --in=docs/lighthouse/<timestamp>-mobile
```

Expected:
- stdout: `[lh-summary] wrote docs/lighthouse/<timestamp>-mobile/summary.md`
- file exists with H1, four sections, populated tables.

Open the file and skim it — should look correct, with real audit titles and savings numbers.

- [ ] **Step 6: Commit**

```bash
git add scripts/lh-summary.mjs scripts/lh-summary.test.mjs docs/lighthouse
git commit -m "feat(audit): summary composition + main entrypoint"
```

---

## Task 9: End-to-end re-run with summary integration

Now `scripts/lh-summary.mjs` exists, so `npm run audit` should produce a complete output (no warning).

**Files:**
- Create (via running): `docs/lighthouse/<new-timestamp>-mobile/{report.html,report.json,summary.md}`

- [ ] **Step 1: Run the full audit**

Run: `npm run audit`

Expected:
- `[lh-audit]` console output with scores
- `[lh-summary] wrote docs/lighthouse/<timestamp>-mobile/summary.md` (no warning this time)
- All three files present in the new dated folder.

- [ ] **Step 2: Verify the summary**

Run (replace `<timestamp>`):

```bash
head -50 docs/lighthouse/<timestamp>-mobile/summary.md
```

Expected: H1, the four sections, with real data.

- [ ] **Step 3: Commit the verification run**

```bash
git add docs/lighthouse
git commit -m "chore(audit): end-to-end verification run"
```

---

## Task 10: Final validation

- [ ] **Step 1: Run unit tests once more**

Run: `node --test scripts/lh-summary.test.mjs`
Expected: 12 tests pass.

- [ ] **Step 2: Lint passes**

Run: `npm run lint`
Expected: no errors. (If new errors appear in `scripts/`, address them — we're adding files to a project with existing lint config.)

- [ ] **Step 3: Confirm `package.json` scripts work**

Run each:

```bash
npm run audit:summary -- --in=docs/lighthouse/<latest>-mobile
```

Expected: `[lh-summary] wrote ...`. (No re-run of Lighthouse needed.)

Optionally: `npm run audit:desktop` to capture a desktop baseline. Commit the result if you want a desktop baseline alongside the mobile one.

- [ ] **Step 4: Final commit (if any uncommitted changes)**

```bash
git status
# if nothing to commit, skip
```

---

## What this plan does NOT include (deferred to follow-up plans)

These come *after* the baseline summary is in hand and we know what to fix:

- Actual perf fixes in `src/` (lazy-load Framer iframes, defer non-critical CSS, image `loading="lazy"`, remove unused JS, fix a11y attrs, etc.)
- A11y/SEO fixes
- CI integration
- Performance budget JSON
- Multi-page or authenticated audits

Each of those is a separate plan, written after reading the baseline `summary.md`.
