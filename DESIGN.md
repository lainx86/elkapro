# ELKAPRO — Arus Menjadi Logika

An interactive art installation for the Electrical & Programming division of Aterkia Diponegoro Team. The subject is electricity and computation. The original Aterkia logo is the only nautical image.

## Visual language

The experience is one continuous spatial composition, with no cards, navigation sections, scroll snapping, or hard scene cuts. Native vertical scrolling traverses metal lightning, circuitry, and a diamond framework before continuing into a field of blue-white light filaments, architectural code-brace tunnel, and spatial network constellation. The lightning and chip leave completely during the handoff to the filament field. Large typography sits behind the sculpture at the opening; smaller narrative text floats above it during the journey.

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
| 0–0.11 | A chrome lightning sculpture intersecting orbital conductors | ELKAPRO / Arus menjadi logika |
| 0.095–0.245 | The sculpture contracts toward a chip while circuit routes expand | Mengalir. Terhubung. |
| 0.24–0.405 | Ordered points and HTML code fragments emerge around the processor | Logika yang menggerakkan. |
| 0.415–0.54 | Original diamond ending becomes an interlude | Arus menjadi logika. / Perjalanan belum selesai |
| 0.5–0.705 | Open light filaments curve around a spatial signal field, with travelling light pulses | Yang tak terlihat. Kini terbaca. |
| 0.65–0.87 | Camera enters a corridor of oversized code braces and binary fragments | Masuk ke bahasa mesin. |
| 0.82–1 | Open constellation of connected nodes with moving data packets | Satu titik. Ribuan arah. |
| 0.95–1 | Network remains as the original logo and replay control return | Semua terhubung. |

Overlapping progress windows crossfade the visual composition; text is never simultaneously readable at full strength. Desktop scroll height is 1500svh; mobile is 1200svh. The first half preserves the old journey's physical scroll distance: 700svh on desktop and 550svh on mobile. Portrait framing uses a separate camera path. Camera movement is controlled by scroll; ambient motion and subtle mouse response add life while stationary. Replay appears only at the new endpoint.

## Accessibility and resilience

All meaningful copy is HTML. Decorative 3D, numerical readouts, and example code are hidden from assistive technology. Inactive narrative text is inert and hidden from the accessibility tree. Controls use native buttons and links, visible focus rings, and touch targets of at least 44px.

Reduced motion follows the OS setting until explicitly overridden with the “Gerak minim” control. The preference persists locally when storage is available. Reduced mode keeps the camera static, disables ambient movement, and crossfades the new installations without the tunnel fly-through. WebGL failure or context loss reveals matching SVG lightning, filaments, braces, and network artwork without blocking the narrative. No JavaScript leaves a static artwork and an explanatory message.

The signal field uses 72 fine paths with vertex-color gradients, five narrow luminous cores, and instanced travelling pulses. It has no solid metallic sheet or spectrum bars. The strands share a batched geometry to keep draw calls low; portrait framing rotates the field diagonally below the copy.

No generated images, third-party media requests, audio, analytics, backend, or telemetry. Repeated geometry uses instancing or merged buffers; pixel ratio and mobile particle counts are capped. Rendering pauses while the document is hidden.
