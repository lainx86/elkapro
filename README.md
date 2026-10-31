# ELKAPRO — Arus Menjadi Logika

A continuous-scroll 3D art website for Aterkia's Electrical & Programming division. Built with Vite, TypeScript, Three.js, and GSAP ScrollTrigger. All artwork is procedural geometry or SVG; the original supplied Aterkia logo is included unchanged.

The extended journey continues beyond the original ending: a blue-white filament field, a tunnel of code braces, and a network constellation replace the lightning and chip. Scroll distance is doubled while preserving the pacing of the first half. Replay is available at the new ending.

At 62.5–71.5% scroll, the light paths deform into the code braces at constant opacity. The same luminous cores become the metallic tunnel structure; the camera enters once the passage has formed. This geometry morph is reversible, and the SVG fallback uses matching source/target curves.

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

`npm test` verifies readable copy intervals, reverse/direct seeking, camera framing, reduced motion, morph continuity, SVG coordinates, and selective-bloom isolation/state restoration. `npm run build` checks TypeScript and creates the deployable static `dist/` directory. There is no backend and no environment variable configuration.

## Source

- `src/main.ts`: HTML presentation, the single scroll timeline, motion preferences, and controls.
- `src/world.ts`: the Three.js installation, camera paths, adaptive rendering, and cleanup.
- `src/circuit-bloom.ts`: HDR selective bloom, surface occlusion, bounded optical buffers, and transparent compositing.
- `src/continuation.ts`: filament field, code tunnel, network constellation, and the continuation camera path.
- `src/filament-field.ts`: shared filament/brace curves, line morph targets, moving pulses, and SVG fallback deformation.
- `src/journey.ts`: the deterministic progress-to-scene mapping.
- `src/style.css`: responsive layout, typography, focus states, and fallback art presentation.
- `DESIGN.md`: visual decisions, narrative, and accessibility behavior.

## Browser acceptance checks

Use a WebGL2-capable browser. Check start, 17%, 32%, the old endpoint at 50%, filament field at 60%, code tunnel at 76%, network at 90%, and the new ending at desktop, tablet, 390px portrait, and landscape. Inspect the 62.5–71.5% join slowly in both directions: strands must bend and widen into braces, without fading, disappearing, or changing identity. Scroll quickly, reload midway, resize, and rotate the viewport. The original lightning and chip must disappear by 56%; the network must remain visible at the new ending. Test keyboard-only use, replay, and reduced motion. Disable WebGL to inspect the SVG curve morph. Background the tab to confirm rendering pauses.

At the circuit, check for a fine luminous trace and a soft optical bloom, with travelling signals noticeably brighter. The glow must follow the visible source pixels, without rectangular bands, discs, or light leaking through the chip. Check camera movement, resize, and the adjacent story states. Automated tests verify selective rendering, occlusion materials, buffer limits, HDR fallback, and restoration after render errors. The bloom composite also passed standalone GLSL ES shader compilation/linking; this is not a substitute for visual WebGL QA.

The connected browser was unavailable during the initial implementation. TypeScript, production build, and timeline tests can run locally; visual device QA remains a separate check until browser access is available.

## Hosting

`.openai/hosting.json` identifies the private Sites project and serves `dist/`. Keep the Site identity when deploying updates. The published site requires owner authentication. Do not place credentials in source or the archive.
