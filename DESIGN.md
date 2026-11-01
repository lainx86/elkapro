# ELKAPRO — Rayakan Perih, Rayakan Letih, Rayaka Juara!

An interactive art installation for the Electrical & Programming division of Aterkia Diponegoro Team. The subject is electricity and computation. The original Aterkia logo is the only nautical image.

## Visual language

The experience is one continuous spatial composition, with no visible story sections, scroll snapping, or hard scene cuts. Native vertical scrolling traverses metal lightning, circuitry, and a diamond framework before ending with the Aterkia logo, replay control, and a compact learning picker in the same final viewport. Large typography sits behind the sculpture at the opening; smaller narrative text floats above it during the journey.

| Role | Value |
| --- | --- |
| Background | `#030916` |
| Brand blue | `#0050B8`, sampled approximately from the supplied logo |
| Primary text | `#F3F7FF` |
| Secondary text | `#A3B3C8` |
| Energy / focus | `#78C8FF` |
| Metal | `#BAC7DB` with environment reflections |
| Display and body | Space Grotesk, 400–700, self-hosted |
| Technical annotations | IBM Plex Mono, 400, self-hosted |
| Page inset | `clamp(22px, 3.5vw, 64px)` |
| Small-screen breakpoint | `600px` |
| Intermediate breakpoint | `900px` |

These are the initial project-specific values. They are provisional pending visual review on the target devices; they do not claim to be an existing Aterkia design system. Fonts are distributed under their included SIL Open Font License in the respective `@fontsource` packages.

## Choreography

A single GSAP timeline maps document scroll to progress 0–1. `journeyState()` is the shared deterministic mapping for presentation and scene geometry. Values are evaluated from absolute progress, allowing reverse scroll and direct entry into the middle of the page.

| Progress | Visual direction | Copy |
| --- | --- | --- |
| 0–0.22 | A chrome lightning sculpture intersecting orbital conductors | ELKAPRO / Rayakan Perih, Rayakan Letih, Rayaka Juara! |
| 0.19–0.49 | The sculpture contracts toward a chip while circuit routes expand | Mengalir. Terhubung. |
| 0.48–0.81 | Ordered points and HTML code fragments emerge around the processor | Logika yang menggerakkan. |
| 0.83–1 | The field resolves into nested diamond outlines with the original logo and replay | Rayakan Perih, Rayakan Letih, Rayaka Juara! |

Desktop scroll height is 800svh; mobile is 650svh. The complete journey maps directly to progress 0–1, and the learning picker appears within the existing ending. No content follows the journey and its scroll height is unchanged. Portrait framing uses a separate camera path. Text is never simultaneously readable at full strength.

## Accessibility and resilience

All meaningful copy is HTML. Decorative 3D, numerical readouts, and example code are hidden from assistive technology. Inactive narrative text is inert and hidden from the accessibility tree. Controls use native buttons and links, visible focus rings, and touch targets of at least 44px.

Reduced motion follows the OS setting until explicitly overridden with the “Gerak minim” control. The preference persists locally when storage is available. Reduced mode keeps the camera static and disables ambient movement. WebGL failure or context loss reveals the SVG artwork. No JavaScript leaves a static artwork and an explanatory message.

## Optical illumination

Circuit traces and travelling pulses are HDR light sources. The pulses have smaller hot cores and roughly six times the trace luminance. Both are tone mapped in the main image, and visible emission feeds a selective UnrealBloomPass with five Gaussian blur scales. Brightness produces the optical spread; there are no halo ribbons, radial discs, or camera-facing particle planes.

The sharp base image is drawn normally. A bounded-resolution half-float emission buffer renders the circuit sources with black surface occluders, so hidden lights do not shine through solid geometry. Only the blurred result is added over the base using an alpha-aware premultiplied composite. HTML typography and transparent canvas regions remain visible. Bloom follows the circuit choreography. Devices without half-float color support retain the tone-mapped sources; a failed optical pass restores rendering state and leaves the scene running.

No generated images, third-party media requests, audio, analytics, backend, or telemetry. Repeated geometry uses instancing or merged buffers; pixel ratio and mobile particle counts are capped. Rendering pauses while the document is hidden.

## Learning entry

The last viewport pairs the closing identity with a compact navy learning picker. Program and Elektrikal are accessible tabs, with arrows and Home/End keys, roving tab focus, and labelled panels. The complete picker follows the ending's visibility and inert state; switching tabs never scrolls the page. Mobile stacks the closing text and picker within the same screen and reduces the logo lockup to preserve space.

The homepage previews at most three matching topics from `src/topics.ts`. “Semua materi” opens `/materi/`, a separate catalog showing all topics in the selected field. The only current topic is Program → Git dan GitHub. Elektrikal has an explicit empty state. `/materi/git-github/` is a separate reading page with clearly labelled dummy copy for introduction, discussion, and practice; it contains no actual lesson or grading. Catalog and lesson routes do not load Three.js. Their styling retains the site's navy, ice blue, Space Grotesk, and IBM Plex Mono.
