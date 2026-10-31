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
| 0.5–0.625 | Open light filaments curve around a spatial signal field, with travelling light pulses | Yang tak terlihat. Kini terbaca. |
| 0.625–0.715 | Filaments deform into ten pairs of braces; the same luminous cores thicken and become metal | Light becomes architecture |
| 0.715–0.87 | Camera advances through the formed corridor; binary fragments grow into the passage | Masuk ke bahasa mesin. |
| 0.82–1 | Open constellation of connected nodes with moving data packets | Satu titik. Ribuan arah. |
| 0.95–1 | Network remains as the original logo and replay control return | Semua terhubung. |

The filament-to-code handoff is a continuous geometry morph at constant opacity. Source and destination share curve samples and transforms; there is no object replacement or camera reset at this join. Pulses follow the interpolated curves. The camera waits until assembly completes, then moves down the passage. Other narrative boundaries retain their existing choreography; text is never simultaneously readable at full strength. Desktop scroll height is 1500svh; mobile is 1200svh. The first half preserves the old journey's physical scroll distance: 700svh on desktop and 550svh on mobile. Replay appears only at the new endpoint.

## Accessibility and resilience

All meaningful copy is HTML. Decorative 3D, numerical readouts, and example code are hidden from assistive technology. Inactive narrative text is inert and hidden from the accessibility tree. Controls use native buttons and links, visible focus rings, and touch targets of at least 44px.

Reduced motion follows the OS setting until explicitly overridden with the “Gerak minim” control. The preference persists locally when storage is available. Reduced mode keeps the camera static and disables ambient movement. Geometry assembly remains controlled directly by scrolling. WebGL failure or context loss reveals the SVG artwork; its filament path deforms into the braces using the same source and target curves. No JavaScript leaves a static artwork and an explanatory message.

The signal field uses 72 fine paths with vertex-color gradients, 20 luminous cores, and instanced travelling pulses. Cores have matching source/target tube topology, allowing both positions and normals to morph while the material changes from luminous blue-white to metal. The strands share a batched geometry; portrait framing rotates the field diagonally and then aligns it with the tunnel. No geometry is regenerated per frame.

No generated images, third-party media requests, audio, analytics, backend, or telemetry. Repeated geometry uses instancing or merged buffers; pixel ratio and mobile particle counts are capped. Rendering pauses while the document is hidden.
