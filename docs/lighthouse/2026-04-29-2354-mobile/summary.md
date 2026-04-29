# Lighthouse Summary

- url: http://localhost:4173/
- preset: mobile
- fetched: 2026-04-29T21:54:54.356Z

## Scores

| Category | Score | Status |
| --- | ---: | :---: |
| Performance | 61 | ⚠️ |
| Accessibility | 100 | ✅ |
| Best Practices | 100 | ✅ |
| SEO | 100 | ✅ |

## Top opportunities

| Audit | Est. savings | Top offenders |
| --- | ---: | --- |
| Eliminate render-blocking resources | 1050 ms | `http://localhost:4173/assets/index-DOVUDIF7.css` |
| Reduce unused JavaScript | 450 ms | `http://localhost:4173/assets/framer-Dbxtze8D.js`<br>`http://localhost:4173/assets/motion-KfE5h-Dd.js`<br>`http://localhost:4173/assets/react-vendor-k0NuY1BK.js` |
| Properly size images | 150 ms | `https://framerusercontent.com/images/3OnQEmmXWGgyAjtgmLzHmifDzYc.png?scale-down…` |
| Reduce unused CSS | 150 ms | `http://localhost:4173/assets/index-DOVUDIF7.css`<br>`body { --framer-will-change-override: none; } …` |

## Diagnostics

- **Max Potential First Input Delay** — 180 ms
- **Minimize main-thread work** — 3.1 s
- **Ensure text remains visible during webfont load**
- **Largest Contentful Paint element** — 7,150 ms
- **Missing source maps for large first-party JavaScript**
- **Avoid enormous network payloads** — Total size was 13,820 KiB
- **Avoid an excessive DOM size** — 1,384 elements
- **Font display** — Est savings of 30 ms
- **Forced reflow**
- **Improve image delivery** — Est savings of 46 KiB
- **Network dependency tree**
- **Render blocking requests** — Est savings of 1,050 ms

## Metrics

| Metric | Value |
| --- | ---: |
| First Contentful Paint | 6.2 s |
| Largest Contentful Paint | 7.2 s |
| Total Blocking Time | 60 ms |
| Cumulative Layout Shift | 0.033 |
| Speed Index | 6.2 s |
| Time to Interactive | 7.2 s |
