# Large Displays, Ultrawide, 4K, and Connected TV

Two complaints are often confused: **"too small and cavernous"** (tiny content isolated in vast screen space) versus **"too large / clipped"** (massive oversized elements exceeding viewport boundaries). Because their root causes differ, measure before applying modifications.

## Table of Contents
1. Measure First: TV Viewports Cannot Be Guessed
2. Too Small on Large Displays
3. Too Large on Connected TVs
4. TV Mode (10-Foot UI)
5. Safe Margins (Overscan Buffer)
6. Focus States & Remote D-Pad Navigation
7. Fixed Canvas (Signage, Kiosks, Dashboards)
8. Ultrawide Monitors (21:9, 32:9)
9. Quick Verification Checklist

## 1. Measure First: TV Viewports Cannot Be Guessed
Smart TV web runtimes report disparate viewport dimensions across manufacturers, operating systems, and display modes. Frequent viewports: 1920x1080 @1x, 1280x720 @1.5x, 960x540 @2x, and 3840x2160 @1x or @2x. A 4K physical panel does not automatically indicate a 3840px CSS viewport.

Display the empirical metrics on the target hardware or emulator:
```html
<script>
  const info = () => `${innerWidth}x${innerHeight} @${devicePixelRatio}x | screen ${screen.width}x${screen.height}`;
  const d = document.createElement('div');
  d.style.cssText = 'position:fixed;left:0;bottom:0;z-index:99999;background:#000;color:#0f0;font:16px monospace;padding:4px';
  const tick = () => d.textContent = info();
  document.body.append(d); tick(); addEventListener('resize', tick);
</script>
```
These metrics reveal whether the defect is driven by DPR zoom scaling or missing CSS containment on wide screens.

## 2. Too Small on Large Displays
Symptom: Minuscule content clustered in the center, excessive dead space, or 14px body copy illegible from 10 feet away. Root causes: uncapped containers, typography capped at standard desktop sizes, missing scale tiers above 1440px.

Resolution steps:
1. **Constrain & Center**: Bounded container (`min(100% - gutter, 80rem)`); provide `--container-wide` for dense data dashboards.
2. **Scale Root Typography**: Proportionately scale root `rem` units across large viewports:
   ```css
   @media (min-width: 160rem) { html[data-scale="auto"] { font-size: 112.5%; } }  /* >= 2560px */
   @media (min-width: 200rem) { html[data-scale="auto"] { font-size: 137.5%; } }  /* >= 3200px */
   ```
   Apply `<html data-scale="auto">` only after verifying all dimensions rely on `rem` tokens.
3. **Elevate Upper `clamp()` Bounds**: Ensure heading tokens do not plateau prematurely at 2.7rem on 4K monitors.
4. **Constrain Prose Line Length**: Enforce `max-width: 65ch` to preserve reading ergonomics.
5. **Grids Multiply Columns Rather Than Stretching Cards**: Use `auto-fit/minmax` patterns with bounded container max-widths.

## 3. Too Large on Connected TVs
Symptom: Gargantuan elements, oversized typography, content clipping off-screen. Root causes:
- Unbounded `vw`/`vh` units, or uncontrolled `html { font-size: Nvw }`.
- Double-scaling: Applying root font scaling on top of viewports already scaled up by TV device pixel ratios (e.g. 960x540 @2x).
- Stacking global `transform: scale()` on top of native TV zoom.
- Rigid `vh` heights on non-16:9 displays (e.g. portrait signage).

Resolution: Measure viewport metrics (Section 1), strip redundant scaling, apply upper `clamp()` bounds to `vw` units, and choose **one** scaling strategy (root font scaling **or** letterboxed canvas, never both).

## 4. TV Mode (10-Foot UI)
For interfaces viewed from 10 feet away (TV apps, conference room dashboards), establish a dedicated scale standard where 1rem corresponds proportionally to screen width:
```css
html[data-ui="tv"] { font-size: clamp(8px, 1.25vw, 64px); }  /* 1rem = 1/80 screen width: 24px @1920, 16px @1280 */
html[data-ui="tv"] body { font-size: 1rem; line-height: 1.4; }  /* ~24px @1080p: comfortable viewing baseline */
html[data-ui="tv"] .tv-safe { padding: max(3vh, 1rem) max(3.5vw, 1rem); }
```
Rule of thumb: Body copy ~24px, never dropping below ~20px on 1080p displays; headings 40px+. High contrast, bold weights.

Activation: Rely on explicit parameters (`?ui=tv` or app build configs). User-Agent heuristics can serve as hints:
```js
const ua = navigator.userAgent;
const looksLikeTV = /SMART-TV|SmartTV|Tizen|Web0S|WebOS|NetCast|HbbTV|Android TV|GoogleTV|BRAVIA|AFT[A-Z]|VIDAA|CrKey/i.test(ua);
const explicit = new URLSearchParams(location.search).get('ui');
if (explicit === 'tv' || (explicit == null && looksLikeTV)) document.documentElement.dataset.ui = 'tv';
```

## 5. Safe Margins (Overscan Buffer)
Legacy cathode ray and budget flat panels clip outer display edges (overscan). Allocate a 3–5% safe buffer around critical interactive elements (headings, action buttons, subtitles) while allowing background assets to bleed edge-to-edge.

## 6. Focus States & Remote D-Pad Navigation
TV remotes lack pointer cursors:
- All interactive controls must be focusable (`button`, `a[href]`, `tabindex="0"`) following logical DOM order.
- Pronounced visual focus states:
  ```css
  :focus-visible { outline: 0.2rem solid #fff; outline-offset: 0.2rem; box-shadow: 0 0 0 0.35rem #1a73e8; }
  .tile:focus-visible { transform: scale(1.06); transition: transform .12s; }
  ```
- Eliminate interactions relying exclusively on `:hover`.
- Implement spatial navigation for 2D card grids (intercepting `ArrowLeft/Right/Up/Down` keydown events).
- Scrolling: invoke `scrollIntoView({block: 'nearest', inline: 'nearest'})` upon focus transitions.

## 7. Fixed Canvas (Signage, Kiosks, Dashboards)
For single-resolution displays (e.g. 1920x1080 NOC dashboards) with minimal interaction, scaling the entire canvas with letterboxing is cleaner than complex fluid responsive rules. This is the only scenario where global `transform: scale()` is justified:
```html
<div id="stage"> ...1920x1080 design... </div>
```
```css
html, body { margin: 0; height: 100%; overflow: hidden; background: #000; }
#stage {
  position: fixed; left: 50%; top: 50%; width: 1920px; height: 1080px;
  transform-origin: center center;
}
```
```js
const W = 1920, H = 1080, stage = document.getElementById('stage');
const fit = () => {
  const s = Math.min(innerWidth / W, innerHeight / H);
  stage.style.transform = `translate(-50%, -50%) scale(${s})`;
};
addEventListener('resize', fit); fit();
```
Limitation: Not suitable for touch-first responsive mobile web applications.

## 8. Ultrawide Monitors (21:9, 32:9)
- Maintain container `max-width`; distribute remaining horizontal space as margins. Do not tie hero element heights to viewport width (`vw`).
- Multi-metric dashboards: multiply grid columns via `auto-fit`, constraining individual card widths.
- Video and hero graphics: use `object-fit: cover` with focal `object-position` verified at 3440x1440.
- Group fixed chrome near the main content axis rather than stranding buttons at far screen corners.

## 9. Quick Verification Checklist
- [ ] Viewport dimensions + target DPR measured empirically.
- [ ] Bounded containers; prose line lengths <= ~75 characters.
- [ ] Single scaling strategy selected (root font scaling OR fixed letterboxed canvas).
- [ ] All `vw` measurements enclosed within upper-bounded `clamp()` functions.
- [ ] Layout dimensions declared in `rem` units (if leveraging root scaling).
- [ ] 3–5% safe margins preserved for key interactive elements.
- [ ] High-contrast `:focus-visible` states validated for remote D-pads.
- [ ] Empirical validation completed on target hardware or emulator.
