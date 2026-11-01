# Responsive CSS Patterns

Drop-in responsive recipes leveraging modern CSS supported by evergreen browsers (`clamp()`, `min()`, `dvh`, container queries, `aspect-ratio`). Legacy fallbacks are noted inline.

## Table of Contents
1. Document Foundation
2. Fluid Bounded Containers
3. Intrinsic Auto Grids
4. Collapsible Sidebar without Media Queries
5. Flex & Grid Children Resisting Shrinking
6. Fluid Typography
7. Fluid Spacing
8. Images, Videos, Iframes, & Canvas
9. Data Tables
10. Forms & Inputs
11. Modals & Dialogs
12. Navigation Patterns
13. Full Viewport Heights & Safe Areas
14. Hover vs. Touch Interaction
15. Container Queries
16. Breakpoint Selection & Units
17. Long Strings & Truncation
18. Landscape Mobile & Constrained Heights

## 1. Document Foundation
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```
`viewport-fit=cover` is only required when consuming `env(safe-area-inset-*)`; omit otherwise.
```css
*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
body { margin: 0; overflow-wrap: break-word; }
img, video { max-width: 100%; height: auto; }
```

## 2. Fluid Bounded Containers
```css
:root {
  --gutter: clamp(1rem, 4vw, 3rem);
  --container: 80rem;      /* ~1280px */
  --container-wide: 100rem;
}
.container {
  width: min(100% - 2 * var(--gutter), var(--container));
  margin-inline: auto;
}
```
Replace rigid `width: 1200px` or `max-width: 1200px; width: 95%` with the pattern above. On large viewports content stops expanding; on mobile gutters contract fluidly. Supported natively across browsers since 2020. Legacy fallback: `width: 100%; max-width: 80rem; padding-inline: 1rem;`.

## 3. Intrinsic Auto Grids
```css
.grid {
  --min: 16rem;
  display: grid;
  gap: clamp(1rem, 2vw, 2rem);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--min)), 1fr));
}
```
Column counts adapt intrinsically to container width without media queries. `min(100%, ...)` ensures cards never exceed container width on 320px screens. Use `auto-fill` (rather than `auto-fit`) if empty columns should retain allocated track space when item counts are small.

Fixed multi-column page layouts (e.g., content + aside):
```css
.page { display: grid; gap: var(--gutter); grid-template-columns: minmax(0, 1fr); }
@media (min-width: 64rem) { .page { grid-template-columns: minmax(0, 1fr) 20rem; } }
```
`minmax(0, 1fr)` (instead of bare `1fr`) prevents overflowing content from pushing column tracks beyond container bounds.

## 4. Collapsible Sidebar without Media Queries
```css
.with-sidebar { display: flex; flex-wrap: wrap; gap: var(--gutter); }
.with-sidebar > :first-child { flex: 1 1 16rem; }                       /* sidebar */
.with-sidebar > :last-child  { flex: 999 1 0; min-inline-size: 60%; }  /* main content */
```
When available horizontal space drops below ~16rem + 60% content width, the sidebar automatically wraps above content. For dashboard shells with persistent sidebars, deploy a drawer on mobile viewports:
```css
.app { display: grid; grid-template-columns: minmax(0, 1fr); min-height: 100dvh; }
.app__sidebar {
  position: fixed; inset: 0 auto 0 0; width: min(18rem, 85vw);
  transform: translateX(-100%); transition: transform .2s; z-index: 50;
}
.app__sidebar[data-open="true"] { transform: none; }
@media (min-width: 64rem) {
  .app { grid-template-columns: 16rem minmax(0, 1fr); }
  .app__sidebar { position: sticky; top: 0; height: 100dvh; transform: none; }
}
```

## 5. Flex & Grid Children Resisting Shrinking
Flex and grid items default to `min-width: auto`, preventing them from shrinking narrower than their contents (tables, code blocks, unbroken strings). This is the classic cause of mobile horizontal scrolling.
```css
.flex-child, .grid-child { min-width: 0; }
pre, code, .scroll-x { max-width: 100%; overflow-x: auto; }
```

## 6. Fluid Typography
Scale typography based on `rem` + `vw` within `clamp()`, interpolating linearly between 320px and 1440px viewports (1.25 ratio). Incorporating `rem` ensures user browser zoom and OS text preferences are preserved:
```css
:root {
  --step--1: clamp(0.8rem,   0.771rem + 0.143vw, 0.9rem);
  --step-0:  clamp(1rem,     0.964rem + 0.179vw, 1.125rem);
  --step-1:  clamp(1.25rem,  1.205rem + 0.223vw, 1.406rem);
  --step-2:  clamp(1.563rem, 1.507rem + 0.279vw, 1.758rem);
  --step-3:  clamp(1.953rem, 1.883rem + 0.349vw, 2.197rem);
  --step-4:  clamp(2.441rem, 2.354rem + 0.436vw, 2.747rem);
}
body { font-size: var(--step-0); line-height: 1.5; }
h1 { font-size: var(--step-4); line-height: 1.15; }
h2 { font-size: var(--step-3); line-height: 1.2; }
h3 { font-size: var(--step-2); }
small, .caption { font-size: var(--step--1); }
p { max-width: 65ch; }
```
To calculate custom clamps: `clamp(MIN, INTERCEPT + SLOPE*vw, MAX)` where `SLOPE = (MAX - MIN) / (maxWidth - minWidth)` and `INTERCEPT = MIN - SLOPE * minWidth`. The `MAX` bound guarantees text never becomes gargantuan on wide monitors.

For ultra-large displays (TV/4K), see root scaling in `large-screens-tv.md`.

## 7. Fluid Spacing
```css
:root {
  --space-s: clamp(0.5rem, 0.4rem + 0.5vw, 0.75rem);
  --space-m: clamp(1rem, 0.8rem + 1vw, 1.5rem);
  --space-l: clamp(2rem, 1.4rem + 3vw, 4rem);
}
section { padding-block: var(--space-l); }
```
Replace fixed `padding: 64px` with bounded fluid tokens.

## 8. Images, Videos, Iframes, & Canvas
```css
img, video { max-width: 100%; height: auto; }
.media { aspect-ratio: 16 / 9; width: 100%; }
.media > img, .media > video { width: 100%; height: 100%; object-fit: cover; }
.embed { position: relative; aspect-ratio: 16 / 9; width: 100%; }
.embed > iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
```
Responsive resolution switching:
```html
<img src="photo-800.jpg" width="1600" height="900" alt="..."
     srcset="photo-480.jpg 480w, photo-800.jpg 800w, photo-1600.jpg 1600w"
     sizes="(min-width: 64rem) 50vw, 100vw">
```
Canvas charts (Chart.js / ECharts): Wrap canvas inside a `position: relative` container with `aspect-ratio`/`min-height`, and enable library responsiveness (`responsive: true, maintainAspectRatio: false`). For libraries without automatic resizing, attach a `ResizeObserver` on the wrapper triggering `chart.resize()`.

## 9. Data Tables
Option A: Controlled horizontal scroll (safest, preserves table markup and accessibility):
```html
<div class="table-scroll" role="region" aria-label="Data Table" tabindex="0">
  <table>...</table>
</div>
```
```css
.table-scroll { max-width: 100%; overflow-x: auto; }
.table-scroll table { min-width: 36rem; width: 100%; border-collapse: collapse; }
```
Option B: Card transformation on small viewports (requires `data-label` on each `td`):
```css
@media (max-width: 40rem) {
  table, thead, tbody, tr, th, td { display: block; }
  thead { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); }
  tr { margin-block: 0 1rem; border: 1px solid #ddd; border-radius: .5rem; }
  td { display: flex; justify-content: space-between; gap: 1rem; padding: .5rem .75rem; }
  td::before { content: attr(data-label); font-weight: 600; }
}
```
Option B alters table semantics for screen readers; reserve for simple key-value tables and prefer Option A for complex datasets.

## 10. Forms & Inputs
```css
input, select, textarea, button { font: inherit; }
input:not([type="checkbox"]):not([type="radio"]), select, textarea {
  width: 100%; max-width: 100%;
  font-size: max(1rem, 16px);      /* prevents iOS Safari auto-zoom on focus */
  min-height: 2.75rem;
}
.field-row { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr)); }
```
Never resolve iOS auto-zoom by setting `maximum-scale=1`.

## 11. Modals & Dialogs
```css
.modal {
  width: min(100% - 2rem, 40rem);
  max-height: calc(100dvh - 2rem);   /* fallback: calc(100vh - 2rem) placed before this line */
  overflow: auto;
  margin: auto;
}
@media (max-width: 40rem) {          /* full-width sheet on mobile */
  .modal--sheet { width: 100%; max-height: 92dvh; margin-block-end: 0; border-radius: 1rem 1rem 0 0; }
}
```
Keep action buttons visible: establish modal footers as `position: sticky; bottom: 0` inside the scroll container.

## 12. Navigation Patterns
Progressive collapse pattern:
```css
.nav__toggle { display: inline-flex; }
.nav__list { display: none; flex-direction: column; }
.nav[data-open="true"] .nav__list { display: flex; }
@media (min-width: 48rem) {
  .nav__toggle { display: none; }
  .nav__list { display: flex; flex-direction: row; gap: 1.5rem; }
}
```
For deep menu hierarchies (7+ items), adopt a "More" dropdown or horizontal scrollable bar with `overflow-x: auto; scroll-snap-type: x proximity`. Ensure toggles declare `aria-expanded` and `aria-controls`.

## 13. Full Viewport Heights & Safe Areas
```css
.full { min-height: 100vh; min-height: 100dvh; }   /* fallback first, then dvh */
.hero { min-height: min(100svh, 56rem); }          /* svh = smallest viewport, avoids browser chrome jump */
.bottom-bar {
  position: fixed; inset-inline: 0; bottom: 0;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
.page { padding-inline: max(var(--gutter), env(safe-area-inset-left, 0px)) max(var(--gutter), env(safe-area-inset-right, 0px)); }
```
`dvh` dynamically tracks browser address bar transitions; `svh` represents static minimal viewport height with chrome visible. Always use `min-height` rather than fixed `height`.

## 14. Hover vs. Touch Interaction
```css
@media (hover: hover) and (pointer: fine) {
  .card:hover { transform: translateY(-2px); }
  .menu-item:hover > .submenu { display: block; }
}
@media (pointer: coarse) {
  button, [role="button"], select, summary, input:not([type="checkbox"]):not([type="radio"]) { min-height: 44px; }
  .icon-btn { min-width: 44px; }
}
```
Submenus exposed via hover must provide an explicit click/tap trigger button with `aria-expanded`.

## 15. Container Queries
Use when **components** (cards, widgets) must adapt to their immediate parent container width rather than overall viewport dimensions:
```css
.card-wrap { container-type: inline-size; }
.card { display: grid; gap: 1rem; }
@container (min-width: 28rem) {
  .card { grid-template-columns: 10rem 1fr; }
}
```
Supported across modern evergreen browsers; establish a viable mobile-first layout fallback for legacy runtimes.

## 16. Breakpoint Selection & Units
- Author **mobile-first**: base styles target small screens, augmented via `@media (min-width: ...)`.
- Use `em`/`rem` units in media queries (e.g. `48em` = 768px at 16px root) to preserve user font zoom scaling.
- Clean starting baselines: `40rem` (640px), `48rem` (768px), `64rem` (1024px), `80rem` (1280px), `96rem` (1536px), `120rem` (1920px), `160rem` (2560px).
- Add breakpoints **only** when layout integrity breaks; never create per-device breakpoints.
- Avoid collision between `max-width: 768px` and `min-width: 768px` (both active at exactly 768px); use range syntax `@media (width < 48rem)` or `(48rem <= width < 64rem)`.

## 17. Long Strings & Truncation
```css
.break { overflow-wrap: anywhere; }              /* URLs, tokens, unbroken strings */
.clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
```
`.truncate` inside flex or grid containers requires `min-width: 0` on its immediate parent item.

## 18. Landscape Mobile & Constrained Heights
```css
@media (max-height: 30rem) and (orientation: landscape) {
  .hero { min-height: 0; padding-block: 1rem; }
  .header--sticky { position: static; }       /* fixed headers consume a third of screen height */
  .modal { max-height: 100dvh; }
}
```
Avoid rigid `vh` heights (e.g. `height: 60vh` for heroes) in landscape mobile; rely on bounded `min-height: clamp(14rem, 50svh, 40rem)`.
