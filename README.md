# ELKAPRO — Rayakan Perih, Rayakan Letih, Rayaka Juara!

A continuous-scroll 3D art website for Aterkia's Electrical & Programming division. Built with Vite, TypeScript, Three.js, and GSAP ScrollTrigger. All artwork is procedural geometry or SVG; the original supplied Aterkia logo is included unchanged.

The journey follows lightning, chip circuitry, and code imagery before ending with the original Aterkia logo, replay control, and Program/Elektrikal learning tabs in that same viewport. Circuit paths and travelling signals use HDR bloom. Scroll height remains 800svh on desktop and 650svh on mobile; no learning section is added below it.

## Run locally

Requires Node.js 22.18+ (or Node.js 24+) and npm.

```bash
npm ci
npm run dev
```

Open the Local URL printed by Vite. Scroll forward and backward to control the installation. “Gerak minim” uses a stationary composition; “Ulangi perjalanan” returns to the beginning.

```bash
npm test
npm run build
npm run preview
```

`npm test` verifies readable copy intervals, timeline continuity, reverse/direct seeking, selective-bloom isolation/state restoration, topic preview limits, catalog filtering, tab keyboard/hash mapping, and preservation of the supplied SSH commands. `npm run build` checks TypeScript and creates the deployable static `dist/` directory. There is no backend and no environment variable configuration.

## Source

- `src/main.ts`: HTML presentation, the single scroll timeline, motion preferences, and controls.
- `src/world.ts`: the Three.js installation, camera paths, adaptive rendering, and cleanup.
- `src/selective-bloom.ts`: HDR bloom for the circuit; surface occlusion, bounded optical buffers, and transparent compositing.
- `src/journey.ts`: the deterministic progress-to-scene mapping.
- `src/topics.ts`: shared topic data; currently one Program topic (Git dan GitHub) and no Elektrikal topics.
- `src/materials.ts`: accessible Program/Elektrikal tabs, capped homepage preview, and full catalog.
- `materi/index.html`: the full catalog; `/materi/#elektrikal` opens the empty Elektrikal tab.
- `materi/git-github/index.html`: authored chapters 0–1, three SVG illustrations, and chapter/OS navigation.
- `isi-materi/Program/1-Git-dan-Github/`: original chapter Markdown. The reading page is static HTML; reflect future source edits there too, and rerun the command-preservation test.
- `src/lesson.ts`: one-time SVG connector reveals, honoring motion preferences.
- `vite.config.ts`: the three static HTML entry points.
- `src/style.css`: responsive layout, typography, focus states, and fallback art presentation.
- `DESIGN.md`: visual decisions, narrative, and accessibility behavior.

## Browser acceptance checks

Use a WebGL2-capable browser. Check start, circuit at 34%, code imagery at 64%, and the logo/replay ending at 100% on desktop, tablet, 390px portrait, and landscape. Scroll quickly and backward, reload midway, resize, and rotate the viewport. The progress indicator must reach 100 at the visible ending, with no extra empty scroll. At the ending, switch Program/Elektrikal with mouse and keyboard (arrows, Home/End); the viewport must not move and Elektrikal must show its empty state. Follow Git dan GitHub to chapters 0–1; check chapter, Windows, and Linux anchors and keyboard scrolling in long code blocks, then return to the catalog. Check each of the three chapter-0 diagrams with normal and reduced motion. “Semua materi” must preserve the chosen field; reload each route directly. Verify the homepage preview is capped at three if more topics are added to `src/topics.ts`. Test keyboard-only use, replay, and reduced motion. Disable WebGL to inspect the SVG artwork. Background the tab to confirm rendering pauses.

At the circuit, check for a fine luminous trace and a soft optical bloom, with travelling signals noticeably brighter. The glow must follow the visible source pixels, without rectangular bands, discs, or light leaking through the chip. Check camera movement, resize, and the adjacent story states. Automated tests verify selective rendering, occlusion materials, buffer limits, HDR fallback, and restoration after render errors. The bloom composite also passed standalone GLSL ES shader compilation/linking; this is not a substitute for visual WebGL QA.

The connected browser was unavailable during the initial implementation. TypeScript, production build, and timeline tests can run locally; visual device QA remains a separate check until browser access is available.

## Hosting

`.openai/hosting.json` identifies the private Sites project and serves `dist/`. Keep the Site identity when deploying updates. The published site requires owner authentication. Do not place credentials in source or the archive.
