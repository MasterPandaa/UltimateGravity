# Responsive Diagnosis Checklist

Use after running `scripts/audit_responsive.py`. Audit each layer systematically; every unchecked item indicates a probable root cause.

## Table of Contents
1. Document Foundation
2. Layout Shell
3. Typography & Spacing
4. Media & Assets
5. Components
6. Interaction & Device Capabilities
7. Large Displays & Connected TV
8. Overflow Hunt (DevTools Snippet)

## 1. Document Foundation
- [ ] `<meta name="viewport" content="width=device-width, initial-scale=1">` present across all templates/root pages (including error, login, and embed pages).
- [ ] No `user-scalable=no`, `maximum-scale=1`, or rigid `width=1024` viewport locks.
- [ ] Valid `<!doctype html>` present (omission triggers browser quirks mode and distorts box sizing).
- [ ] Global `box-sizing: border-box` applied.
- [ ] `html`/`body` does not force rigid `width: NNNpx` or oversized `min-width`.
- [ ] Root font size is not locked to small px values (e.g. `html { font-size: 10px }`) without compensation; preserve 100% (16px) or deliberate `62.5%`.

## 2. Layout Shell
- [ ] Containers declare fluid `max-width` + gutters; no fixed `width: 1200px`.
- [ ] Grid/columns utilize `fr`, `minmax()`, `auto-fit/auto-fill`, or flex with `flex-wrap` rather than manually summed percentages.
- [ ] Flex/grid children holding long text, tables, or `pre` blocks declare `min-width: 0` (default `min-width: auto` prevents shrinking).
- [ ] Sidebar/aside transforms to a drawer or vertical stack on small screens rather than crushing main content.
- [ ] Intermediate viewports (600–1100px) and landscape mobile (height < 500px) are explicitly handled.
- [ ] Heights are not rigidly locked (`height: 600px`); use `min-height`, padding, or `aspect-ratio`.
- [ ] `position: fixed/sticky` elements (headers, bottom bars, FABs, toasts) do not obscure interactive content and respect safe areas.
- [ ] `overflow: hidden` on layout containers does not clip critical dropdowns or tooltips on narrow viewports.

## 3. Typography & Spacing
- [ ] Base copy font size >= 16px on mobile; headings scale fluidly via `clamp()` without abrupt breakpoint jumps.
- [ ] Raw unbounded `font-size: Nvw` is prohibited; enclose within `clamp(min, calc, max)` incorporating `rem`.
- [ ] Line heights are unitless (e.g. `1.5`) rather than fixed px values.
- [ ] Long strings are protected: `overflow-wrap: anywhere` or `break-word` for URLs, code snippets, and long identifiers.
- [ ] Prose line length is constrained (`max-width: 60-75ch`) on wide viewports.
- [ ] Padding and margins rely on `rem`, `clamp()`, or `gap`, avoiding rigid pixel offsets that consume viewport space on mobile.

## 4. Media & Assets
- [ ] `img, video` rules enforce `max-width: 100%; height: auto`.
- [ ] Images retain `width`/`height` attributes (aspect ratio hinting to prevent CLS) paired with CSS `height: auto`.
- [ ] `srcset`/`sizes` utilized for responsive imagery; `object-fit` applied to thumbnails/hero banners.
- [ ] `iframe`, map embeds, and video players are wrapped in responsive containers (`aspect-ratio` + `width: 100%`).
- [ ] Charts and canvas elements (Chart.js, ECharts, D3) re-render on container resize via `ResizeObserver` or `responsive: true`.
- [ ] Vector SVGs declare `viewBox` and omit oversized hardcoded `width/height` attributes.
- [ ] Hero backgrounds utilize `background-size: cover` paired with `min-height`.

## 5. Components
- [ ] Data tables: scrollable wrapper provided, or transformed to card layouts on mobile; priority columns established.
- [ ] Forms: stacked labels above inputs on narrow screens; inputs set to `width: 100%`; form groups avoid `white-space: nowrap`.
- [ ] Modals/dialogs: `max-width: min(100% - 2rem, 40rem)`, `max-height: 100dvh`, internal scrolling enabled.
- [ ] Navigation: collapsible menu pattern (hamburger/drawer) implemented; nav items do not collide at 768px.
- [ ] Dropdowns/popovers: viewport collision detection enabled (flip/shift, or full-width sheet on mobile).
- [ ] Tabs: horizontal scroll or select-dropdown fallback on mobile viewports.
- [ ] Carousels/sliders: relative slide widths, touch swipe support enabled.
- [ ] Dashboards: metric cards stack cleanly; charts avoid rigid pixel heights.

## 6. Interaction & Device Capabilities
- [ ] Tap targets meet or exceed 44x44px (Apple) / 48dp (Material); minimum WCAG 2.2 threshold is 24x24px with spacing.
- [ ] Hover is never the exclusive trigger for core workflows; hover styles wrapped in `@media (hover: hover)`.
- [ ] Input font size >= 16px (prevents iOS Safari auto-zoom), with appropriate `inputmode` and `type` attributes.
- [ ] `100vh` replaced with `100dvh` / `svh` (with fallback) for full-screen sections.
- [ ] `env(safe-area-inset-*)` incorporated for fixed chrome (requires `viewport-fit=cover`).
- [ ] Orientation locks avoided; landscape mobile thoroughly validated.
- [ ] 200% browser zoom and OS-level text scaling maintain usable layouts (reflow down to 320px).
- [ ] `prefers-reduced-motion` honored for large motion and parallax effects.

## 7. Large Displays & Connected TV
- [ ] Content containers constrained; layouts do not hug left margin at 2560px or 3840px.
- [ ] Scale factor applied to root tokens for 10-foot viewing distances.
- [ ] No unbounded `vw`/`vh` font or dimension declarations.
- [ ] Safe-action margins (3–5% overscan buffer) preserved for TV displays.
- [ ] High-contrast `:focus-visible` states and logical spatial navigation order for remote D-pads.
- [ ] Empirical `innerWidth x innerHeight @ devicePixelRatio` verified on target hardware/emulators.

## 8. Overflow Hunt (DevTools Console Snippet)
Execute in DevTools console on problematic viewports; overflowing elements are highlighted with red outlines:

```js
(() => {
  const vw = document.documentElement.clientWidth;
  const bad = [...document.querySelectorAll('body *')].filter(el => {
    const r = el.getBoundingClientRect();
    return r.width && (r.right > vw + 1 || r.left < -1);
  });
  bad.forEach(el => el.style.outline = '2px solid red');
  console.table(bad.slice(0, 30).map(el => ({
    tag: el.tagName, cls: String(el.className).slice(0, 60),
    width: Math.round(el.getBoundingClientRect().width),
    right: Math.round(el.getBoundingClientRect().right)
  })));
})();
```

Common culprits: unwrapped tables, `pre` code blocks, images with oversized inline `width`, inputs with large `size` attributes, `100vw` elements, unconstrained CSS animations (`translateX`), right-aligned absolute dropdowns, flex items lacking `min-width: 0`, and unbreakable alphanumeric strings.
