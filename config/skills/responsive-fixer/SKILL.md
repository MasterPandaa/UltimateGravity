---
name: responsive-fixer
description: "[Multi-Device Responsive Fixer] Diagnosis & repair of web/app layouts across screen sizes (mobile, tablet, desktop, TV/4K, ultrawide). Resolves horizontal scrolling, layout overflow, broken modals/tables, 100vh clipping, fluid typography (clamp), and CSS/Tailwind breakpoints. Triggers on: responsive, mobile-friendly, overflow, breakpoint, layout distortion."
---

# Responsive Fixer

This skill fixes systems (websites, web applications, dashboards, hybrid/native apps) whose visual presentation degrades outside specific screen dimensions. Common symptoms include: broken layouts on mobile and tablets, elements appearing oversized or minuscule on large TVs/monitors, unexpected horizontal scrolling, or overlapping content.

## Core Principles

Nearly all responsive issues originate from a few recurring root causes: fixed pixel widths, missing viewport meta tags, unconstrained `100vh`, unbounded widths on large displays, and rigid pixel fonts. Fix issues at the **root** (base CSS, layout shells, design tokens) rather than patching individual pages. Per-device patches (`@media (max-width: 375px)`) merely push issues onto subsequent devices.

1. **Fluid First, Breakpoints Second**: Use `%`, `fr`, `minmax()`, `clamp()`, `min()`, `rem`, `ch`, and `aspect-ratio`. Breakpoints should only be used for structural transitions (e.g. converting a sidebar to a drawer, collapsing 3 columns to 1), dictated by **content breakdown**, not device names.
2. **Mobile-First with `min-width`, Capped for Large Displays**: Establish mobile foundations first, then set upper boundaries for wide viewports (container max-width, bounded font scales). Without caps, wide monitors stretch layouts excessively.
3. **Three Failure Zones**: Small (<640px: overflow, tap targets, font sizes), medium (640-1100px: awkward tablet/landscape layouts), and large (>=1600px: stretched containers, tiny text, TV 10-foot scale). Audit all three zones, not just mobile.
4. **Preserve Valid Desktop Baselines**: Maintain visual fidelity at original design widths; fixes should be additive or replace rigid values with equivalent fluid values.
5. **Prove via Measurement**: A layout is only verified as responsive after empirical testing across the dimension matrix (Step 4).

## Workflow

### Step 0 - Understand Context
Determine the stack (Vanilla HTML/CSS, Tailwind, Bootstrap, React/Vue/Angular, CMS / Blade, Flutter/React Native) and specific failure symptoms. If code is available, inspect it directly rather than asking unnecessary questions.

### Step 1 - Audit
1. Run the static analyzer:
   ```bash
   python3 scripts/audit_responsive.py <project-folder> [--json] [--max-per-rule 8]
   ```
   Inspect identified violations ordered by severity (missing viewport tags, rigid px widths, `100vh`/`100vw`, unconstrained `vw` fonts, missing medium/large breakpoints, unwrapped tables).
2. Manually inspect layout shells: root HTML / `index.html`, root layouts (`App`, `layout.tsx`, master blade), global reset CSS, and navigation/sidebar/table/modal components.
3. For layer-by-layer audit checklists, consult `references/diagnosis-checklist.md`.

### Step 2 - Diagnosis
Map symptoms to root causes and apply patterns from `references/css-patterns.md`:

| Symptom | Probable Cause | Corrective Direction |
|---|---|---|
| Page zoomed out on mobile, tiny text | Missing `<meta viewport>` or fixed `width=1024` | Add `width=device-width, initial-scale=1`; replace fixed widths with fluid values |
| Horizontal scroll on mobile | `width: NNNpx`, `100vw` + scrollbar, unconstrained tables/code/images, negative margins, flex/grid children without `min-width: 0` | Identify exact offending element via `scripts/screenshot_matrix.py`; do not mask with `overflow-x: hidden` on body |
| Broken on tablet / landscape mobile | Missing intermediate breakpoints; rigid sidebars; `vh`-based heights | Add intermediate handling: `auto-fit/minmax`, flex-wrap, container queries; `min-height` instead of `height` |
| Clipped bottom on mobile browsers | `100vh` includes browser address bar chrome | Use `min-height: 100dvh` with `100vh` fallback |
| Content obscured by notch / home bar | Missing safe-area insets | `viewport-fit=cover` + `env(safe-area-inset-*)` |
| iOS auto-zooms on input focus | Input `font-size` < 16px | Set inputs to minimum 16px font size; never disable zoom via `user-scalable=no` |
| Hover menus non-functional on touch | `:hover` exclusive interaction | Use `@media (hover: hover)` for hover, provide click/tap fallback |
| Small, unclickable buttons | Tap target < 44px | Enforce `min-height/min-width` 44px on `pointer: coarse` |
| Overflown data tables | Broad table in narrow container | Add `overflow-x: auto` wrapper, or render as cards on mobile |
| Distorted images / video / iframes | Fixed `width`/`height` attributes | Set `max-width: 100%; height: auto`, `aspect-ratio`, and `object-fit` |
| Overly small on TV / large displays | Uncapped layout, tiny px fonts | Add container `max-width`, scaled root fonts, `clamp()` typography |
| Overly large on TV, clipped elements | Uncapped `vw` units or unexpected TV DPR reporting | Measure `innerWidth`/`devicePixelRatio`, bound with `clamp()`, set safe margins |
| Ultrawide (21:9, 32:9) stretched layout | Unbounded full-width layout | Constrain container width; distribute extra space via margins |
| Foldable / resized window broken | Fixed px assumptions, `user-scalable=no` | Use relative units; test at 280-360px widths and 200% zoom |

### Step 3 - Repair (Order of Precedence)
1. **Document Foundation**: viewport meta, `box-sizing: border-box`, `text-size-adjust`, `max-width: 100%` on media. Use `assets/responsive-base.css` if needed.
2. **Layout Shell**: fluid bounded containers (`width: min(100% - 2*gutter, max)`), header/sidebar/footer. Transform fixed sidebars to flex-wrap or drawers on mobile.
3. **Grids & Components**: convert rigid columns to `repeat(auto-fit, minmax(min(100%, 16rem), 1fr))`; apply `min-width: 0` to flex/grid children.
4. **Typography & Spacing**: fluid scales with bounded `clamp()` (incorporating `rem` to preserve user zoom); constrain prose with `max-width: 65ch`.
5. **Media**: `max-width: 100%`, `aspect-ratio`, `srcset/sizes`.
6. **Touch & Inputs**: font-size >= 16px, 44px tap targets, `hover: hover`, safe areas, `dvh`.
7. **Large Displays & TV**: see `references/large-screens-tv.md` (root scaling, safe action margins, D-pad focus).
8. **Frameworks**: apply through native framework mechanisms (Tailwind breakpoint configs, Bootstrap Sass maps, MUI themes, Flutter `LayoutBuilder`) - see `references/frameworks.md`.

### Step 4 - Verification
Order of verification options:
1. **Automated (Playwright)**: `python3 scripts/screenshot_matrix.py <url-or-file.html> --preset quick --out shots/`.
2. **Guided Manual**: Open `assets/viewport-tester.html` in browser across responsive presets.
3. **Checklist Reasoning**: Step through `references/device-matrix.md` if no browser execution environment is available.

Success criteria: zero horizontal scroll across all viewports; zero clipped elements; legible typography (>=16px base on mobile); accessible tap targets; balanced large-display containers; preserved legacy desktop layouts.

### Step 5 - Reporting
Summarize findings clearly:
```
## Findings & Results
- Root Cause: <1-3 concrete points>
- Modifications: <file -> changes and rationale>
- Verified On: <viewports/tools used>
- Risks / Unverified Scenarios: <e.g., specific hardware TVs>
- Reproduction / Verification Steps: <commands or steps>
```

## Anti-Patterns to Avoid

- `user-scalable=no` / `maximum-scale=1`: Blocks user zoom (accessibility violation) and masks bad layouts.
- `overflow-x: hidden` on `html/body` to conceal symptoms without eliminating the overflowing element.
- Massive `!important` declarations, or breakpoints named after specific devices (iPhone 12, iPad).
- `font-size: Nvw` without `clamp()` (breaks zoom and balloons on TV displays).
- Hiding core content on mobile (`display: none`) without explicit product alignment.
- Using `zoom` or `transform: scale()` across entire documents except for fixed-aspect signage/kiosks.

## References

- `references/diagnosis-checklist.md` - Layer-by-layer audit checklist.
- `references/css-patterns.md` - Production-ready CSS patterns.
- `references/large-screens-tv.md` - Ultrawide, 4K, TV, and 10-foot UI standards.
- `references/frameworks.md` - Framework-specific responsive conventions.
- `references/device-matrix.md` - Viewport test matrix.
