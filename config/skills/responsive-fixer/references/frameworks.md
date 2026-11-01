# Framework Responsive Guidelines

Implement fixes leveraging native framework mechanisms to preserve maintainability and consistency. Option names and configuration APIs evolve across major releases; verify against the exact installed framework version before applying modifications.

## Table of Contents
1. Plain CSS / SCSS
2. Tailwind CSS
3. Bootstrap
4. MUI, Chakra UI, Ant Design (React)
5. General React / Next.js
6. Vue / Nuxt / Svelte / Angular
7. CMS & Server-Rendered Templates (WordPress, Laravel Blade, etc.)
8. Flutter
9. React Native
10. Native Android / iOS
11. HTML Email (Special Constraints)

## 1. Plain CSS / SCSS
- Begin from `assets/responsive-base.css`, replacing rigid values identified during audits.
- SCSS: Centralize breakpoints in a single map and mixin, eliminating magic numbers:
  ```scss
  $bp: (sm: 40rem, md: 48rem, lg: 64rem, xl: 80rem, xxl: 96rem, tv: 120rem);
  @mixin up($k) { @media (min-width: map-get($bp, $k)) { @content; } }
  ```

## 2. Tailwind CSS
- Mobile-first by design: unprefixed utility classes apply universally; `md:` targets viewports >= 768px. Common antipattern: writing `grid-cols-3` without prefix forces 3 columns on mobile; correct to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.
- Avoid arbitrary rigid dimensions (`w-[640px]`, `h-[500px]`, large `min-w-[...]`); prefer `w-full max-w-2xl`, `min-h-*`, and `aspect-video`.
- Viewport heights: convert `h-screen` to `min-h-dvh` (available in Tailwind 3.4+; older releases use `min-h-[100dvh]`).
- Bounded container: `mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8`.
- Flex/grid items containing long text: add `min-w-0`; wrap data tables in `overflow-x-auto`.
- Large displays: extend breakpoint scales.
  - v3 (`tailwind.config.js`): `theme: { extend: { screens: { '3xl': '1920px', '4xl': '2560px' } } }`
  - v4 (CSS theme variables): `@theme { --breakpoint-3xl: 120rem; --breakpoint-4xl: 160rem; }`
  Then consume `3xl:max-w-[100rem] 4xl:text-xl`.
- Safe areas: `pb-[env(safe-area-inset-bottom)]`.

## 3. Bootstrap
- Use the 12-column grid system: `col-12 col-md-6 col-lg-4` (ordered mobile-to-desktop); avoid overriding column widths with px styles.
- Bootstrap 5.x breakpoints: sm 576, md 768, lg 992, xl 1200, xxl 1400px. Add large display support via Sass by updating `$grid-breakpoints` and `$container-max-widths` maps prior to importing Bootstrap.
- Tables: `<div class="table-responsive">`. Images: `img-fluid`. Embeds: `ratio ratio-16x9`.
- Full-screen sections: replace `vh-100` with `min-vh-100`.

## 4. MUI, Chakra UI, Ant Design (React)
- MUI: Use responsive object syntax `sx={{ width: { xs: '100%', md: 480 } }}`, responsive `Grid`/`Stack` props, `Container maxWidth="lg"`. Configure custom breakpoints via `createTheme({ breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536, tv: 1920 } } })`. Use `useMediaQuery(theme.breakpoints.down('md'))` strictly for DOM structural transitions, not styling achievable via CSS.
- MUI Typography: apply `responsiveFontSizes(theme)` or `clamp()` theme variants.
- Chakra UI: responsive array/object props `w={{ base: '100%', md: '480px' }}`.
- Ant Design: responsive `Row`/`Col` grids (`xs/sm/md/lg/xl/xxl`); `Table scroll={{ x: 'max-content' }}`; responsive `Modal` widths.

## 5. General React / Next.js
- Prioritize CSS for layout adaptability; use JavaScript (`matchMedia`, `useMediaQuery`) exclusively for structural DOM shifts (e.g. mobile drawer vs. desktop sidebar).
- SSR & Hydration: Never read `window.innerWidth` during initial render (causes hydration mismatches and layout flashes). Initialize with neutral CSS state, hydrating client state inside `useEffect` or relying on CSS toggles.
- Canvas & Chart wrappers: Ensure parent elements declare dimensions via CSS and libraries re-measure via `ResizeObserver`.
- Next.js: declare viewports via `export const viewport` (App Router) or `<meta>` in `_document`/`Head` (Pages Router); utilize `next/image` with accurate `sizes`.

## 6. Vue / Nuxt / Svelte / Angular
- Vue/Nuxt/Svelte: same principles as React; avoid calculating dimensions in JavaScript when CSS suffices. Use `useMediaQuery` (VueUse) where necessary.
- Angular: consume `@angular/cdk/layout` `BreakpointObserver` for structural shifts. Wrap Angular Material `mat-table` in `overflow: auto`.
- Scoped CSS: verify responsive media queries are not blocked by specificity; avoid `!important`.

## 7. CMS & Server-Rendered Templates
- Inspect root layout templates (`header.php`, master layout, `base.html`) for proper viewport meta tags.
- WordPress: Most modern themes are responsive; regressions typically stem from third-party plugins, custom HTML blocks, or unwrapped iframes/tables. Add responsive wrapper classes via child themes or custom CSS.
- Laravel Blade / Django / Rails: apply responsive structural fixes to base layouts and partials before patching individual pages.

## 8. Flutter
- Avoid hardcoded pixel dimensions. Rely on `LayoutBuilder` (available parent width), `MediaQuery.sizeOf(context)`, `Flexible`/`Expanded`, `Wrap`, `FittedBox`, `AspectRatio`, and `ConstrainedBox(maxWidth)`.
- Material 3 Window Size Classes (in dp): compact < 600, medium 600-839, expanded 840-1199, large 1200-1599, extra-large >= 1600. Morph navigation patterns: bottom navigation bar (compact) -> navigation rail (medium) -> permanent drawer (expanded+).
- Constrain large display content with `Center` + `ConstrainedBox(constraints: BoxConstraints(maxWidth: 1200))`.
- Wrap content in `SafeArea` to handle device notches; test high `textScaler` settings with `Flexible` and ellipsis overflow to prevent RenderFlex overflows.

## 9. React Native
- Use Flexbox, percentage dimensions, and `useWindowDimensions()` (reactive to orientation and split-screen changes). Avoid static `Dimensions.get('window')` at module scope.
- Consume `SafeAreaView` from `react-native-safe-area-context`.
- Images: declare `resizeMode` and `aspectRatio` rather than rigid dimensions.
- Tablets: constrain container `maxWidth`; adopt multi-column layouts at widths >= 600dp.
- TV (react-native-tvos): handle spatial focus and remote navigation via `hasTVPreferredFocus` and `TVFocusGuideView`.

## 10. Native Android / iOS
- Android: `ConstraintLayout`, `dp/sp` dimensions, resource qualifiers (`layout-sw600dp`, `values-w840dp`), Compose `WindowSizeClass`.
- iOS: Auto Layout, size classes, safe area layout guides, Dynamic Type; avoid hardcoded frames.

## 11. HTML Email (Special Constraints)
HTML emails run on constrained rendering engines with uneven media query support. Rely on fluid table structures (`width: 100%; max-width: 600px`), `max-width: 100%` on images, and validate across target email clients. Do not apply modern CSS recipes (such as `clamp()` or grid) directly to HTML email templates.
