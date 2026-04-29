# Lighthouse Summary

- url: https://framerfejleszto.prototype.loginet.tech/
- preset: mobile
- fetched: 2026-04-29T19:10:10.468Z

## Scores

| Category | Score | Status |
| --- | ---: | :---: |
| Performance | 71 | ⚠️ |
| Accessibility | 94 | ✅ |
| Best Practices | 96 | ✅ |
| SEO | 83 | ⚠️ |

## Top opportunities

| Audit | Est. savings | Top offenders |
| --- | ---: | --- |
| Eliminate render-blocking resources | 2250 ms | `https://fonts.googleapis.com/css2?family=Archivo+Black&family=Big+Shoulders+Dis…`<br>`https://framerfejleszto.prototype.loginet.tech/assets/index-BIvCOaEi.css`<br>`https://fonts.googleapis.com/css2?family=Archivo+Black&family=Big+Shoulders+Dis…` |
| Reduce unused JavaScript | 680 ms | `https://framerfejleszto.prototype.loginet.tech/assets/index-DxuOG-Om.js` |
| Reduce unused CSS | 150 ms | `https://framerfejleszto.prototype.loginet.tech/assets/index-BIvCOaEi.css`<br>`body { --framer-will-change-override: none; } …` |
| Properly size images | 64 KiB | `https://framerfejleszto.prototype.loginet.tech/assets/illustrations/ai-brain-he…`<br>`https://framerusercontent.com/images/3OnQEmmXWGgyAjtgmLzHmifDzYc.png?scale-down…` |

## Diagnostics

- **Max Potential First Input Delay** — 140 ms
- **Browser errors were logged to the console**
- **Minimize main-thread work** — 2.3 s
- **Ensure text remains visible during webfont load**
- **Largest Contentful Paint element** — 4,510 ms
- **Image elements do not have explicit `width` and `height`**
- **Missing source maps for large first-party JavaScript**
- **Heading elements are not in a sequentially-descending order**
- **Links do not have a discernible name**
- **Serve static assets with an efficient cache policy** — 20 resources found
- **Avoid enormous network payloads** — Total size was 13,292 KiB
- **Avoid an excessive DOM size** — 1,370 elements
- **Document does not have a meta description**
- **robots.txt is not valid** — 16 errors found
- **Use efficient cache lifetimes** — Est savings of 9,396 KiB
- **Font display** — Est savings of 30 ms
- **Forced reflow**
- **Improve image delivery** — Est savings of 22 KiB
- **Network dependency tree**
- **Render blocking requests** — Est savings of 2,250 ms

## Metrics

| Metric | Value |
| --- | ---: |
| First Contentful Paint | 4.4 s |
| Largest Contentful Paint | 4.5 s |
| Total Blocking Time | 50 ms |
| Cumulative Layout Shift | 0 |
| Speed Index | 5.7 s |
| Time to Interactive | 4.6 s |
