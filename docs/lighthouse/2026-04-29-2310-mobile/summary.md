# Lighthouse Summary

- url: http://localhost:4173/
- preset: mobile
- fetched: 2026-04-29T21:10:57.944Z

## Scores

| Category | Score | Status |
| --- | ---: | :---: |
| Performance | 76 | ⚠️ |
| Accessibility | 100 | ✅ |
| Best Practices | 100 | ✅ |
| SEO | 100 | ✅ |

## Top opportunities

| Audit | Est. savings | Top offenders |
| --- | ---: | --- |
| Eliminate render-blocking resources | 1350 ms | `http://localhost:4173/assets/index-DOVUDIF7.css` |
| Reduce unused JavaScript | 600 ms | `http://localhost:4173/assets/index-wVjWfA3t.js` |
| Properly size images | 150 ms | `http://localhost:4173/assets/illustrations/ai-brain-head.avif`<br>`https://framerusercontent.com/images/3OnQEmmXWGgyAjtgmLzHmifDzYc.png?scale-down…` |
| Reduce unused CSS | 150 ms | `http://localhost:4173/assets/index-DOVUDIF7.css`<br>`body { --framer-will-change-override: none; } …` |
| Defer offscreen images | 39 KiB | `http://localhost:4173/assets/flourishes/star-white.avif`<br>`http://localhost:4173/assets/flourishes/flower-blue-drawn.avif`<br>`http://localhost:4173/assets/flourishes/star-yellow.avif` |

## Diagnostics

- **Max Potential First Input Delay** — 140 ms
- **Minimize main-thread work** — 2.4 s
- **Ensure text remains visible during webfont load**
- **Largest Contentful Paint element** — 4,580 ms
- **Image elements do not have explicit `width` and `height`**
- **Missing source maps for large first-party JavaScript**
- **Avoid enormous network payloads** — Total size was 13,543 KiB
- **Avoid an excessive DOM size** — 1,370 elements
- **Font display** — Est savings of 20 ms
- **Forced reflow**
- **Improve image delivery** — Est savings of 22 KiB
- **Network dependency tree**
- **Render blocking requests** — Est savings of 1,350 ms

## Metrics

| Metric | Value |
| --- | ---: |
| First Contentful Paint | 3.3 s |
| Largest Contentful Paint | 4.6 s |
| Total Blocking Time | 100 ms |
| Cumulative Layout Shift | 0.033 |
| Speed Index | 3.3 s |
| Time to Interactive | 4.6 s |
