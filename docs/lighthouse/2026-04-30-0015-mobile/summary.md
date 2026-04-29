# Lighthouse Summary

- url: http://localhost:4173/
- preset: mobile
- fetched: 2026-04-29T22:15:36.099Z

## Scores

| Category | Score | Status |
| --- | ---: | :---: |
| Performance | 85 | ⚠️ |
| Accessibility | 100 | ✅ |
| Best Practices | 100 | ✅ |
| SEO | 100 | ✅ |

## Top opportunities

| Audit | Est. savings | Top offenders |
| --- | ---: | --- |
| Eliminate render-blocking resources | 750 ms | `http://localhost:4173/assets/index-JTgGlIo5.css` |
| Properly size images | 310 ms | `https://framerusercontent.com/images/3OnQEmmXWGgyAjtgmLzHmifDzYc.png?scale-down…` |
| Reduce unused JavaScript | 160 ms | `http://localhost:4173/assets/motion-DntqvNC1.js` |

## Diagnostics

- **Minimize main-thread work** — 2.8 s
- **Largest Contentful Paint element** — 3,790 ms
- **Avoid enormous network payloads** — Total size was 12,510 KiB
- **Avoid an excessive DOM size** — 1,384 elements
- **Forced reflow**
- **Improve image delivery** — Est savings of 28 KiB
- **Network dependency tree**
- **Render blocking requests** — Est savings of 750 ms

## Metrics

| Metric | Value |
| --- | ---: |
| First Contentful Paint | 2.6 s |
| Largest Contentful Paint | 3.8 s |
| Total Blocking Time | 20 ms |
| Cumulative Layout Shift | 0.001 |
| Speed Index | 2.6 s |
| Time to Interactive | 3.8 s |
