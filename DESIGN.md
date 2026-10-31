# ELKAPRO — Arus Menjadi Logika

An interactive art installation for the Electrical & Programming division of Aterkia Diponegoro Team. The subject is electricity and computation. The original Aterkia logo is the only nautical image.

## Visual language

The experience is one continuous spatial composition, with no cards, navigation sections, scroll snapping, or hard scene cuts. Native vertical scrolling traverses an installation built from beveled metal lightning, orbital conductors, PCB traces, a processor, and a diamond framework. Large typography sits behind the sculpture at the opening; smaller narrative text floats above it during the journey.

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
| 0–0.22 | A chrome lightning sculpture intersecting orbital conductors | ELKAPRO / Arus menjadi logika |
| 0.19–0.49 | The sculpture contracts toward a chip while circuit routes expand | Mengalir. Terhubung. |
| 0.48–0.81 | Ordered points and HTML code fragments emerge around the processor | Logika yang menggerakkan. |
| 0.83–1 | The field resolves into nested diamond outlines | Arus menjadi logika. / Original Aterkia lockup |

Overlapping progress windows crossfade the visual composition; text is never simultaneously readable at full strength. Desktop scroll height is 800svh; mobile is 650svh. Portrait framing uses a separate camera spline. Camera movement is controlled by scroll; ambient motion and subtle mouse response add life while stationary.

## Accessibility and resilience

All meaningful copy is HTML. Decorative 3D, numerical readouts, and example code are hidden from assistive technology. Inactive narrative text is inert and hidden from the accessibility tree. Controls use native buttons and links, visible focus rings, and touch targets of at least 44px.

Reduced motion follows the OS setting until explicitly overridden with the “Gerak minim” control. The preference persists locally when storage is available. Reduced mode keeps the camera and sculpture static and updates the narrative on scroll. WebGL failure or context loss reveals the native SVG artwork without blocking the narrative. No JavaScript leaves a static artwork and an explanatory message.

No generated images, third-party media requests, audio, analytics, backend, or telemetry. Repeated geometry uses instancing or merged buffers; pixel ratio and mobile particle counts are capped. Rendering pauses while the document is hidden.
