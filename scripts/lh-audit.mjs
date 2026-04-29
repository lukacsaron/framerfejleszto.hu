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
