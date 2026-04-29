# Lighthouse Summary

- url: http://localhost:4173/
- preset: mobile
- fetched: 2026-04-29T20:43:04.648Z

## Scores

| Category | Score | Status |
| --- | ---: | :---: |
| Performance | 73 | ⚠️ |
| Accessibility | 94 | ✅ |
| Best Practices | 96 | ✅ |
| SEO | 83 | ⚠️ |

## Top opportunities

| Audit | Est. savings | Top offenders |
| --- | ---: | --- |
| Eliminate render-blocking resources | 1650 ms | `https://fonts.googleapis.com/css2?family=Archivo+Black&family=Big+Shoulders+Dis…`<br>`https://fonts.googleapis.com/css2?family=Archivo+Black&family=Big+Shoulders+Dis…`<br>`http://localhost:4173/assets/index-BIvCOaEi.css` |
| Reduce unused JavaScript | 840 ms | `http://localhost:4173/assets/index-DxuOG-Om.js` |
| Properly size images | 150 ms | `http://localhost:4173/assets/illustrations/ai-brain-head.avif`<br>`https://framerusercontent.com/images/3OnQEmmXWGgyAjtgmLzHmifDzYc.png?scale-down…` |
| Reduce unused CSS | 150 ms | `http://localhost:4173/assets/index-BIvCOaEi.css`<br>`body { --framer-will-change-override: none; } …` |
| Defer offscreen images | 39 KiB | `http://localhost:4173/assets/flourishes/star-white.avif`<br>`http://localhost:4173/assets/flourishes/flower-blue-drawn.avif`<br>`http://localhost:4173/assets/flourishes/star-yellow.avif` |

## Diagnostics

- **Max Potential First Input Delay** — 180 ms
- **Browser errors were logged to the console**
- **Minimize main-thread work** — 2.7 s
- **Ensure text remains visible during webfont load**
- **Largest Contentful Paint element** — 4,800 ms
- **Image elements do not have explicit `width` and `height`**
- **Missing source maps for large first-party JavaScript**
- **Heading elements are not in a sequentially-descending order**
- **Links do not have a discernible name**
- **Avoid enormous network payloads** — Total size was 13,502 KiB
- **Avoid an excessive DOM size** — 1,370 elements
- **Document does not have a meta description**
- **robots.txt is not valid** — 16 errors found
- **Font display** — Est savings of 20 ms
- **Forced reflow**
- **Improve image delivery** — Est savings of 22 KiB
- **Network dependency tree**
- **Render blocking requests** — Est savings of 1,650 ms

## Metrics

| Metric | Value |
| --- | ---: |
| First Contentful Paint | 3.6 s |
| Largest Contentful Paint | 4.8 s |
| Total Blocking Time | 140 ms |
| Cumulative Layout Shift | 0.033 |
| Speed Index | 3.6 s |
| Time to Interactive | 4.8 s |
