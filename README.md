# framerfejleszto.hu

A one-page Hungarian landing site selling [22.design](https://22.design/)'s Framer build service. Live at [framerfejleszto.hu](https://framerfejleszto.hu).

## The pitch

> **WEBOLDAL ~~HETEK~~ HELYETT NAPOK ALATT.**
> *A website in days, not weeks.*

Framer's speed plus a senior design team: premium sites, editable by the client afterwards, with no developer in the loop. Five to ten working days, 120+ projects, a 99 Lighthouse score.

The page walks through the problem, the process, why Framer, the work, and an FAQ. Full copy and section-by-section structure in [WEBSITE-CONTENTS.md](WEBSITE-CONTENTS.md), in Hungarian.

## The irony, acknowledged

A site advertising Framer development, built in React. Framer is right for the client sites we sell; this one needed a custom scroll-linked hero, a mouse-tracked before/after comparison card, and a live Framer-editor mockup, so it got hand-built.

## Two pieces of tooling worth a look

### `src/plugins/live-edit/`

A Vite plugin that makes the running dev site editable in place. Hit `ctrl+e`, click any text node, type. A Babel transform tags every JSX text node with its source location, an overlay handles the editing, and a dev-server middleware writes the change back into the `.jsx` file on disk.

Built because copy review over Slack screenshots is slow. A copywriter can open localhost, fix the wording where they can see it, and the change lands in the source.

Dev only, `apply: 'serve'`. It never ships.

### `scripts/lh-audit.mjs`

Runs Lighthouse against a URL and writes a timestamped report into `docs/lighthouse/`. `npm run audit:summary` diffs the runs so you can see whether a change helped.

```bash
npm run audit                    # mobile preset
npm run audit:desktop
npm run audit:summary
```

Every report in `docs/lighthouse/` is a real run against the staging URL. That is how the 99 in the hero copy got earned rather than asserted.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173, with live-edit on ctrl+e
npm run build
npm run preview
```

```bash
docker build -t ff-landing .
docker run -p 8080:80 ff-landing
```

## Stack

React 19, Vite, framer-motion, [Lenis](https://lenis.darkroom.engineering/) for smooth scroll. Design tokens in `src/styles/tokens.css`. Custom cursor, magnetic buttons, split-text reveals and count-ups all live in `src/components/animations/`.

Imagery is AVIF throughout. The illustration set is 22.design's collage style.

## License

Code is MIT. The 22.design brand, the illustrations and the client logos are not.
