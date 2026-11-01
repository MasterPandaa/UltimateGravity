# Viewport Test Matrix

The values below represent common **CSS pixels (viewport dimensions)**, not physical panel resolutions. Use them as representative samples across device classes rather than an exhaustive device list. Always test viewport dimensions **between** these breakpoints by resizing browser windows continuously from 320px to 2560px; edge-case layout regressions often emerge at intermediate widths.

## Table of Contents
1. Core Matrix
2. Situational Additions
3. Aspect Ratios to Remember
4. Manual Test Procedure
5. Pass / Certification Criteria

## 1. Core Matrix (Minimum Baseline)

| Class | Viewport (CSS px) | Rationale |
|---|---|---|
| Compact Mobile | 360x640 (also test 320px) | Entry-level Android; narrowest realistic modern viewport |
| Modern Mobile | 390x844 / 412x915 | Mainstream iOS and Android devices |
| Landscape Mobile | 844x390 | Constrained vertical height; tests `vh` and fixed headers |
| Portrait Tablet | 768x1024 / 820x1180 | Intermediate breakpoint zone, frequently neglected |
| Landscape Tablet | 1024x768 / 1180x820 | Multi-column layouts + sidebars |
| Laptop | 1366x768 / 1440x900 | Common compact desktop display resolutions |
| FHD Desktop | 1920x1080 | Standard 1080p monitors and TV displays |
| QHD / 2K | 2560x1440 | Unconstrained layouts frequently stretch here |
| Ultrawide | 3440x1440 | 21:9 aspect ratio; tests `max-width` containment |
| 4K UHD | 3840x2160 (@1x) | Native 4K scaling; many report @2x DPR (1920x1080 viewport) |

## 2. Situational Additions
- Foldable Outer Display (narrow folded screen): ~280–360px width.
- Foldable Unfolded (inner display): ~600–900px width, nearly square aspect ratio.
- Connected TVs: often 960x540 @2x, 1280x720 @1.5x, or 1920x1080 @1x. Measure in-device (see `large-screens-tv.md`).
- Kiosk Displays & Digital Signage (portrait 1080x1920).
- Browser Zoom (200% at 1280px equivalent to ~640px viewport; 400% zoom equivalent to ~320px): verifies reflow compliance.
- Scaled System Fonts (Android "Font Size", iOS "Larger Text").
- Desktop Split-Screen / Tablet Multitasking (1/3, 1/2 screen splits).

## 3. Aspect Ratios to Remember
Aspect ratios are critical primarily for full-screen hero elements and media wrappers:
- Ultra-Tall: Modern mobile (9:19.5 to 9:21).
- Standard: 16:9 (Desktop, TV), 16:10 (Laptops).
- Near-Square: 4:3 Tablets, unfolded foldables.
- Ultrawide: 21:9, 32:9.

Never tie component layout strictly to an aspect ratio. Rely on `min-height` with natural content flow, reserving `aspect-ratio` for media containers. If a section must fill the screen, assign `min-height: 100dvh` and allow expansion, avoiding rigid `height: 100vh` which clips overflowing content.

## 4. Manual Test Procedure
1. Open DevTools Responsive Design Mode. Start at 320px and smoothly drag width to 2560px. Note widths where content breaks (these are content-driven breakpoint candidates).
2. Switch orientation to landscape on mobile and tablet presets.
3. Test 200% browser zoom.
4. Execute the overflow-detector snippet at problematic widths.
5. Large screens: test at 1920, 2560, 3440, and 3840px; inspect line lengths, margins, and text scale.
6. Verify on at least one physical iOS Safari and Android Chrome device (address bar and safe-area behaviors differ from emulators).

## 5. Pass Criteria
- Zero unexpected horizontal scrolling across all viewports (320px to 3840px).
- Zero clipped or overlapping text, buttons, or form controls.
- Body copy font size >= 16px on mobile; no text < 12px except legal disclaimers.
- Tap targets >= 44x44px on coarse pointer devices.
- Prose line length <= ~75 characters per line on large viewports.
- Centered, bounded content containers on large screens.
- Usable functionality maintained under 200% zoom and landscape orientations.
