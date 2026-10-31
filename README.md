# ELKAPRO — Arus Menjadi Logika

A continuous-scroll 3D art website for Aterkia's Electrical & Programming division. Built with Vite, TypeScript, Three.js, and GSAP ScrollTrigger. All artwork is procedural geometry or SVG; the original supplied Aterkia logo is included unchanged.

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

`npm test` verifies clamping, readable copy intervals, timeline continuity, and reverse/direct seeking. `npm run build` checks TypeScript and creates the deployable static `dist/` directory. There is no backend and no environment variable configuration.

## Source

- `src/main.ts`: HTML presentation, the single scroll timeline, motion preferences, and controls.
- `src/world.ts`: the Three.js installation, camera paths, adaptive rendering, and cleanup.
- `src/journey.ts`: the deterministic progress-to-scene mapping.
- `src/style.css`: responsive layout, typography, focus states, and fallback art presentation.
- `DESIGN.md`: visual decisions, narrative, and accessibility behavior.

## Browser acceptance checks

Use a WebGL2-capable browser. Check start, 34%, 64%, and end at desktop, tablet, 390px portrait, and landscape. Scroll backward and quickly across transitions; reload midway; resize and rotate the viewport. Text must remain readable with no horizontal overflow, empty scene, or discontinuous camera reset. Test keyboard-only use, replay, reduced-motion system settings and the manual override. Disable WebGL to inspect the SVG fallback. Background the tab to confirm rendering pauses.

The connected browser was unavailable during the initial implementation. TypeScript, production build, and timeline tests can run locally; visual device QA remains a separate check until browser access is available.

## Hosting

`.openai/hosting.json` identifies the private Sites project and serves `dist/`. Keep the Site identity when deploying updates. The published site requires owner authentication. Do not place credentials in source or the archive.
