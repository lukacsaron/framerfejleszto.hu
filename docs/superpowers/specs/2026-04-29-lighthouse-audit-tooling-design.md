# Lighthouse Audit Tooling — Design

**Date:** 2026-04-29
**Status:** Approved (brainstorm)
**Target site:** https://framerfejleszto.prototype.loginet.tech/ (staging)
**Baseline scores (mobile, PSI):** Performance 57 · Accessibility 83 · Best Practices 100 · SEO 83

---

## 1. Goal

Add tooling to this repo that runs detailed Lighthouse audits against staging, captures the full audit JSON, and emits a diffable markdown summary that drives a prioritized fix backlog. Use that data to take staging from 57/83/100/83 → 90+ across all four categories. Each fix cycle re-runs the audit so improvements are verifiable and committed alongside the code change.

**Non-goals:** building a UI feature that displays Lighthouse data; auditing arbitrary URLs in production; CI integration (out of scope for v1; can be added later by wiring the same script into a workflow).

---

## 2. Dependencies

Add to `devDependencies` only — zero runtime impact, no bundle change.

| Package | Version | Purpose |
| --- | --- | --- |
| `lighthouse` | ^12.x | Audit engine (same one Chrome DevTools uses) |
| `chrome-launcher` | ^1.x | Boots a headless Chrome for the run |

`chrome-launcher` resolves a local Chromium install or downloads one on first use (~150 MB cached on disk). No system dependencies beyond what `chrome-launcher` already requires.

---

## 3. `package.json` scripts

```json
"scripts": {
  "audit":         "node scripts/lh-audit.mjs",
  "audit:desktop": "node scripts/lh-audit.mjs --preset=desktop",
  "audit:summary": "node scripts/lh-summary.mjs"
}
```

- `npm run audit` — runs the audit *and* generates the summary in one go. Mobile preset by default (matches PSI's default form factor + Slow 4G throttling).
- `npm run audit:desktop` — desktop preset (faster CPU, no network throttling) for sanity-checking.
- `npm run audit:summary` — escape hatch to re-summarize an existing `report.json` without re-running the audit. Takes a `--in=<folder>` flag.

CLI flags accepted by `lh-audit.mjs`:

- `--url=<url>` (default: hardcoded staging URL constant in the script)
- `--preset=mobile|desktop` (default: `mobile`)
- `--out=<folder>` (default: auto-generated `docs/lighthouse/YYYY-MM-DD-HHMM-<preset>/`)

---

## 4. Output layout

```
docs/lighthouse/
  2026-04-29-1430-mobile/
    report.html        ← human-browsable, share-ready
    report.json        ← raw audit data, every detail
    summary.md         ← parsed top-opportunities + scores + metrics
  2026-04-29-1500-mobile/
    ...
```

- Folder name format: `YYYY-MM-DD-HHMM-<preset>`.
- All three artifacts committed to git so runs are diffable across time.
- No retention/cleanup automation — manual prune if the folder grows large.

---

## 5. `scripts/lh-audit.mjs`

Responsibilities:

1. Parse CLI flags (`--url`, `--preset`, `--out`).
2. Launch headless Chrome via `chrome-launcher` on a free port.
3. Run `lighthouse(url, { port, output: ['html','json'] }, config)` where `config` includes the preset's `formFactor`, `screenEmulation`, and `throttling` (mobile uses Slow 4G defaults; desktop disables throttling and uses a desktop emulation profile).
4. Write `report.html` and `report.json` to the output folder.
5. Invoke `lh-summary.mjs` on the JSON to produce `summary.md`.
6. Print to stdout: the four scores, the LCP/TBT/CLS metrics, and the path to `summary.md`.
7. Always close the Chrome instance, even on error.

Estimated size: ~80 lines. Pure ESM, no transpilation.

---

## 6. `scripts/lh-summary.mjs`

Reads `report.json` (path from `--in=<folder>` or first positional arg) and writes `summary.md` next to it. Emits these sections:

### Scores
Four-category table with score + ✅/⚠️ vs. a 90 threshold.

### Top opportunities
Sorted desc by `details.overallSavingsMs` (or `overallSavingsBytes` when ms is absent). Table columns:

| Audit | Est. savings | Top offenders |
| --- | --- | --- |

"Top offenders" lists the first 3 URLs / DOM selectors from `details.items[]` truncated to ~80 chars each.

### Diagnostics
Failing audits (`score < 1`) that aren't opportunities — e.g. unused JS, render-blocking resources, CLS contributors. One-line summary per audit (title + display value).

### Metrics
FCP · LCP · TBT · CLS · SI · TTI with raw values + thresholds.

Estimated size: ~100 lines. Node stdlib only (`fs`, `path`).

---

## 7. Iterative fix workflow

Once tooling is in:

1. **Baseline run** — `npm run audit`, commit the output folder. This produces the initial backlog.
2. **Pick targets** — read `summary.md`, take the top 1–3 opportunities by estimated savings.
3. **Implement** — fix in this codebase (e.g. lazy-load Framer iframe, defer non-critical CSS, add `loading="lazy"` to images, remove unused JS, fix a11y attributes).
4. **Deploy** to staging.
5. **Verify** — `npm run audit` again. New dated folder. Diff `summary.md` against the prior run to confirm the score moved.
6. **Commit** the code fixes and the new audit folder together so each win is traceable.

The first audit drives the initial backlog. Subsequent audits replace human guesswork ("did that help?") with data.

---

## 8. Out of scope (deferred)

- CI/CD integration (run on every PR, fail below threshold)
- Multi-page audits (only the landing page for now)
- Authenticated routes
- Lighthouse CI's `assert` config
- Performance budget JSON

These are easy to layer on later — the script is the foundation.

---

## 9. Risks / open questions

- **Chromium download size** on `npm install` for new contributors. Acceptable for a small team; revisit if it becomes friction.
- **Audit variance run-to-run** — Lighthouse warns scores can swing ±5 points. We accept this; the *opportunities* list is more stable than the score number.
- **Staging environment differences from prod** — fixes verified on staging may behave differently in prod. Acceptable since staging *is* the prod build right now.
