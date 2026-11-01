# Frontend: Engineering Standards & Practical Guidelines

## Table of Contents
1. Component Structure & Architecture
2. State & Data Fetching
3. Mandatory 4 UI States
4. UX & Feedback
5. Accessibility (a11y)
6. Responsive Layouts & Theming
7. Performance & Optimization
8. Design Tokens
9. Consistency Patterns
10. Micro-Craft Math & Polish (Interfaces / Jakub Krehel)
11. Visual Design Tactics (Refactoring UI / Adam Wathan & Steve Schoger)
12. Mascot & App Icon Architecture (IP as Logo Formula - s1dashu)
13. Visual Subtraction & Single Focus (oil-ui Framework)
14. Animation & Motion Engineering (Emil Kowalski Protocol)

---

## 1. Component Structure & Architecture
- One component, one responsibility. If a component name requires "And", break it apart.
- Separate **presentation** (receiving props, rendering DOM) from **orchestration** (fetching data, wiring callbacks).
- Props: explicit, strongly typed, with sensible defaults. Avoid passing large nested objects when only two fields are consumed.
- Composition (children/slots) is strictly superior to stacked boolean flags (`isPrimary`, `isLarge`, `isGhost`); declare discrete `variant` and `size` unions.
- Feature-folder topology: `features/orders/{components,hooks,api,types}`; generic UI primitives reside in `ui/`.
- File and component naming follow project conventions (`PascalCase` for components, `camelCase` for hooks prefixed with `use`).

## 2. State & Data Fetching
- Co-locate state **as close as possible** to its consumers; lift state only when shared between siblings.
- Server data is not ordinary local state: utilize caching and invalidation layers (TanStack Query, SWR, or framework native). Never copy server state into local state without justification.
- Derived state is **computed**, not stored (prevent out-of-sync state synchronization traps).
- Forms: single source of truth per field, validation on blur and submit, field-level error messages, and disabled duplicate submission handling.
- URL as state: filters, active tabs, pagination, and shareable parameters belong in query strings.

## 3. Mandatory 4 UI States
Every data view must explicitly handle 4 states:
- **Loading:** skeletons mirroring final layout geometry (zero layout shifts); avoid full-page spinners for lists.
- **Empty:** explain why the view is empty and offer a concrete next action (CTA).
- **Error (3-Pillar Formula):** Avoid raw technical codes (e.g. Error 403). Deliver three structured elements:
  1. *What happened*: human-friendly status ("Access Denied").
  2. *Why*: contextual reason ("This document was set to private by its owner").
  3. *What to do next*: direct action button (*Direct CTA Button*) that resolves the condition ("Request Access", "Update Payment Method", "Trim File Size"), not merely a generic retry button.
- **Success:** polished state, handling edge-case data volumes (empty, sparse, dense, long alphanumeric strings).
*Additions*: Partial failures, offline states, and optimistic updates with deterministic rollbacks.

## 4. UX & Feedback
- Continuous feedback for user actions: buttons display loading indicators, success confirmed via toast/inline notices, failures explained with remediation paths.
- Destructive actions require explicit confirmation or undo; button labels use action verbs ("Delete Order", not "OK").
- One primary action per screen; secondary actions de-emphasized visually.
- Prevent layout shifts during asset loads (reserve dimensional space for images, skeletons, and embeds).
- Concise copy tailored to audience, with localized number and date formats.

## 5. Accessibility (a11y)
- Semantic HTML (`button`, `a`, `nav`, `main`, `label`, `ul`) prioritized over `div` with `onClick`.
- Every input linked to a `<label>`; icon-only buttons include `aria-label`; meaningful images declare `alt`, decorative images declare `alt=""`.
- Visible focus rings maintained (`:focus-visible`); logical tab sequence; modal dialogs trap focus and close on `Escape`.
- Contrast ratio >= 4.5:1 for body copy; information conveyed through multiple channels, never color alone.
- Tap targets >= 44x44px.
- Dynamic DOM mutations announced to screen readers via `aria-live`.
- Honor `prefers-reduced-motion` and `prefers-color-scheme`.

## 6. Responsive Layouts & Theming
- Mobile-first methodology; flex/grid and relative units.
- Tables and code blocks scroll inside their own containers, never breaking document width.
- Avoid rigid pixel widths and heights for content surfaces.
- Theming managed through CSS custom properties, avoiding duplicate style trees.

## 7. Performance & Optimization
- Measure before optimizing. Baseline optimizations: route-based code splitting, responsive lazy-loaded images, virtualized long lists.
- Avoid expensive re-renders: stable keys for lists, `memo`/`useMemo` applied only upon measured profiling need.
- Animate only GPU-composited properties (`transform` and `opacity`).
- Debounce search inputs; abort stale HTTP requests via `AbortController`.

## 8. Design Tokens
Centralize tokens for: semantic colors (`--color-bg`, `--color-text`, `--color-accent`, `--color-danger`), 8pt spacing scales (4/8/12/16/24/32px...), typography (scales, weights, line heights), radii, shadows, and animation easing. Components consume tokens, never raw hex/pixel literals.

## 9. Consistency Patterns
- One pattern per task (one fetching library, one form handler, one modal architecture).
- Uniform event prop naming: `onChange`, `onSubmit`, `onClose`.
- Centralized mapping of backend API error codes to human-readable UI error microcopy.
- Standardized UI primitives (buttons, inputs, cards) imported from shared library.

---

## 10. Micro-Craft Math & Polish (Interfaces / Jakub Krehel)
- **Nested Border Radius Math**: Proportional concentric radii:
  $$R_{\text{outer}} = R_{\text{inner}} + \text{Padding}$$
  *(If $R_{\text{inner}} \le 0$, then $R_{\text{outer}} \le \text{Padding}$. Prevents awkward optical dissonance on cards wrapping images or buttons).*
- **Tabular Numbers for Data & Metrics**: Apply `font-variant-numeric: tabular-nums` (Tailwind: `tabular-nums`) to tables, timers, financial figures, percentages, and badges to eliminate layout jitter during updates.
- **Optical Icon & Text Alignment**: Match SVG `stroke-width` to companion typography `font-weight`:
  - Regular text (`font-normal` / 400) $\rightarrow$ `stroke-[1.5]` to `stroke-[1.75]`
  - Medium text (`font-medium` / 500) $\rightarrow$ `stroke-2`
  - Semibold/Bold text (`font-semibold` / 600+) $\rightarrow$ `stroke-[2.25]` to `stroke-[2.5]`
  - Always use `currentColor` to automatically inherit `:hover`, `:active`, and `:focus` color tokens.
- **Physical Button Micro-Scale Feedback**:
  - Interactive press response:
    `:active { transform: scale(0.97); transition: transform 100ms cubic-bezier(0.16, 1, 0.3, 1); }`
  - Smooth release with zero visual lag.
- **Typographic Polish & Anti-Orphan**:
  - Apply `text-wrap: balance` to headings (h1, h2, h3) to prevent single orphan words on wrap.
  - Use typographic apostrophes `’` (`&rsquo;` / U+2019) for prose copy rather than programmer straight quotes `'`.

---

## 11. Visual Design Tactics (Refactoring UI / Adam Wathan & Steve Schoger)
- **Contrast-Based Visual Hierarchy**:
  - Do not rely solely on font size. De-emphasize secondary content using muted text colors (`text-slate-500` / `text-muted-foreground`) or lighter font weights.
  - Three Emphasis Tiers:
    - *High Emphasis*: Dark / High Contrast + `font-semibold` / `font-bold` + Base Size.
    - *Medium Emphasis*: Dark / Medium + `font-normal` + Base Size.
    - *Low Emphasis*: Muted / Gray + `font-normal` + Compact Size (`text-xs` / `text-sm`).
- **Bounded Spacing & Law of Proximity**:
  - Avoid arbitrary pixel gaps (`13px`, `27px`). Follow geometric 4px/8px scales: `4, 8, 12, 16, 24, 32, 48, 64px`.
  - Spacing between related items must be tighter than unrelated items:
    - Label to input: `4px` to `8px` (`gap-1.5` / `gap-2`).
    - Between form fields: `16px` to `24px` (`space-y-4` / `space-y-6`).
    - Between container sections: `32px` to `48px` (`gap-8` / `gap-12`).
- **Depth, Surface Lighting, & Multi-Layered Shadows**:
  - Avoid harsh, opaque black shadows. Use layered ambient + directional shadows (Tailwind `shadow-sm` / `shadow-md`).
  - *Dark Mode Depth*: Depth in dark mode is achieved via **Surface Lightness Elevation**, not shadows:
    - Level 0 (Base Background): `#09090B`
    - Level 1 (Cards / Panels): `#18181B`
    - Level 2 (Modals / Popovers / Dropdowns): `#27272A`
- **Color Strategy: Tinted Greys & Off-Blacks**:
  - Never use pure `#000000` on pure `#ffffff` (causes optical eye fatigue / vibration). Use off-black: `#0F172A` (Slate), `#18181B` (Zinc), or `#111827` (Gray).
  - *Tinted Greys*: Add a subtle saturation bias matching the primary brand color to harmonize the UI palette.
- **Element Max-Widths & Whitespace Discipline**:
  - Prevent desktop inputs and buttons from stretching full-width (constrain via `max-w-xs` or `max-w-md`).
  - When in doubt, grant layout elements more room to breathe.

---

## 12. Mascot & App Icon Architecture (IP as Logo Formula - s1dashu)
- **Anti-"Logo" Prompt Trap**: When authoring image generation prompts, STRICTLY PROHIBIT words like `"logo"`, `"brand mark"`, or `"app icon"`. Diffusion models hallucinate unwanted text and frames. Instruct the subject as a complete character on a 1:1 canvas.
- **Complexity Budget (32×32 Favicon Test)**:
  - Construct main silhouettes using **4–7 large, soft, rounded geometric shapes**.
  - Must remain clearly legible at **32×32 px**. Remove fur textures, armor plates, screws, and intricate outlines.
- **Exactly 3 Semantic Colors**:
  - Exactly **2 IP character colors** + **1 solid muted background color**.
- **Lower-Left Emergence Composition**:
  - Subject emerges from the lower-left corner, occupying 85–95% of canvas area, dynamic and approachable.
- **Standard Prompt Skeleton**:
  ```text
  Create one complete full-bleed 1:1 square image.
  Background: fill the entire square with solid <muted_background_color>.
  Subject: place one extremely simplified, cute, endearing <subject> character, reduced to one soft rounded continuous silhouette and one defining feature.
  Complexity: use only 4-7 large basic shapes and at most two broad internal color regions. Use two simple eyes and add one tiny mouth only when helpful. Remove every nonessential line, outline, texture, and decoration. Keep the character readable at 32x32.
  Color behavior: use exactly three semantic colors: exactly two character base colors plus the background color.
  Composition: keep the character upright and emerging from the lower-left corner, filling about 85-95% of the square. Never center or bottom-center.
  Style: lovable appeal, large soft forms, compact proportions, thick rounded contours, clean graphic treatment with barely-there, subtle neo-skeuomorphic depth.
  Constraints: No text, no watermark, no borders, no frames, no presentation cards, no extra subjects, no photorealistic textures, no sharp tips, no harsh drop shadows.
  ```

---

## 13. Visual Subtraction & Single Focus (oil-ui Framework)
- **Single Focus Axiom (One Hero, One Action)**:
  - Every viewport surface must have **1 dominant visual focal point** and **1 primary CTA**.
  - Secondary actions MUST be demoted to `variant="outline"` or `variant="ghost"`. Stacking multiple solid primary buttons triggers cognitive decision paralysis.
- **Visual Subtraction Checklist**:
  - *Anti Box-in-a-Box*: Never nest bordered/shadowed cards inside another card. Use clean whitespace for grouping.
  - *Anti Divider Pollution*: Avoid horizontal `<hr>` dividers when `gap-6` or `space-y-6` provides clean separation.
  - *Anti Useless Badges*: Strip decorative pills that convey no operational status.
- **Grayscale-First Hierarchy Check**:
  - Establish contrast and visual hierarchy in monochrome first. If relationships are indistinguishable without accent color, the structural layout is defective.

---

## 14. Animation & Motion Engineering (Emil Kowalski Protocol)
- **Core Doctrine**: *"Sometimes the best animation is no animation."* Motion must feel like natural physics, never drawing attention to itself.
- **The 4-Question Gate**:
  1. *Frequency Gate*: High-frequency actions (shortcuts, tab switches, command palettes triggered >30x daily) **MUST NEVER BE ANIMATED** (0ms instant transition).
  2. *Purpose Gate*: Animations must serve one of 3 functions: *Feedback* (press response), *Spatial Consistency* (drawer origin), or *State Indication* (smooth data updates).
  3. *Strict Timing Budget*:
     - *Micro-interactions (press / tap)*: **100–160ms** (easing: `cubic-bezier(0.16, 1, 0.3, 1)`).
     - *Tooltips, Dropdowns, Popovers*: **150–250ms** (fade + scale `0.96` $\to$ `1.0`).
     - *Modal Dialogs, Sheets, Drawers*: **250–350ms** (maximum 400ms).
     - *Absolute Ceiling*: UI animations exceeding 500ms are strictly prohibited.
  4. *GPU Compositor Performance Gate*:
     - Animate only GPU properties: `transform` (scale, translate) and `opacity`.
     - **STRICTLY PROHIBITED** to animate layout properties (`width`, `height`, `top`, `left`, `margin`, `padding`, `border-width`), which trigger CPU reflows (FPS dropping from 60 to 20). Use FLIP techniques if container dimensions must morph.
- **Motion Accessibility**:
  - Honor OS settings: `@media (prefers-reduced-motion: reduce)`. Disable spatial translations, retaining only subtle opacity crossfades.


---

## 15. Modern Web Interface Guidelines (Vercel Web Interface Standards)
Adopted from Vercel Labs (*vercel-labs/web-interface-guidelines*) to guarantee accessibility, mobile ergonomics, and Next.js SSR hydration safety:
- **Focus Ring Accessibility (`:focus-visible`)**:
  - **STRICTLY PROHIBITED** to strip focus outlines (`:focus { outline: none; }` or `outline-none`) without providing an explicit replacement focus ring.
  - Apply `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary` so keyboard navigators have crisp focus indicators, while mouse clicks do not trigger unwanted rings.
- **Next.js SSR Hydration Safety**:
  - Prevent React SSR hydration mismatches:
    - Never nest buttons inside links: avoid `<button>` inside `<Link>` or `<a>` (use component composition via `asChild` or style the anchor as a button).
    - Never nest block elements inside paragraphs: avoid `<div>` or `<p>` nested within `<p>`.
    - For client-dependent values (e.g., local dates, OS detection, or `localStorage`), defer rendering until post-mount using a standard `useEffect` / `isMounted` flag or `suppressHydrationWarning`.
- **Mobile Ergonomics & Touch Targets**:
  - **Minimum Touch Target of $44 \times 44\text{px}$**: Every mobile interactive element (buttons, hamburger menus, checkboxes) must have an effective tap area of at least $44 \times 44\text{px}$ (apply transparent padding or pseudo-elements `after:absolute after:-inset-2` when icons measure 16–20px).
  - **Safe Area Insets Handling**:
    - Fixed and sticky containers on mobile must accommodate notches and home indicators:
      `padding-bottom: env(safe-area-inset-bottom);`
      `padding-top: env(safe-area-inset-top);`
- **Form Ergonomics & Virtual Keyboards**:
  - Always declare appropriate `autoComplete` attributes (`autoComplete="email"`, `autoComplete="current-password"`, `autoComplete="one-time-code"`).
  - Use `inputMode="numeric"` for numerical/PIN/OTP fields to trigger numeric keypads automatically on iOS and Android.
  - Use `enterKeyHint="search"`, `"next"`, or `"done"` to customize mobile virtual keyboard action labels.
- **Data Typography & Glyphs**:
  - Apply `font-variant-numeric: tabular-nums` (Tailwind: `tabular-nums`) to clocks, stopwatches, monetary amounts, and tabular data to prevent horizontal character jitter.
  - Employ true typographic glyphs: curly apostrophes (`’` not `'`), true ellipses (`…` not `...`), and proportional en/em dashes.


---

## 16. Stageshow High-Craft UI Showcase & Bento Grid Protocol (Benji Taylor Design Standards)
Adopted from Benji Taylor's *stageshow* design doctrine (Head of Design at X and SpaceX/xAI) for constructing realistic product showcases, faux UI stills, and feature bento grids:

- **Realistic Window & Device Shells**:
  - **macOS / Browser Chrome Titlebars**:
    - Include authentic traffic lights with calibrated colors: Red (`#FF5F56`), Yellow (`#FFBD2E`), Green (`#27C93F`), sized to $12\times 12\text{px}$ with $8\text{px}$ gap.
    - Outer container requires subtle border framing (`border border-white/10 dark:border-white/10 border-black/5`), smooth rounded corners (`rounded-xl` or `rounded-2xl`), and optional frosted glass backdrop (`backdrop-blur-md bg-background/80`).
    - Titlebar must maintain balanced vertical rhythm (height $36–44\text{px}$) with optional centered URL pill or subtle window title in `text-xs text-muted-foreground font-medium`.
- **Asymmetric Feature Bento Grids**:
  - **Visual Hierarchy & Weighting**:
    - Avoid identical symmetrical $2\times 2$ or $3\times 3$ grid boxes with equal visual weight.
    - Anchor the grid around **1 dominant Hero Card** (spanning 2 columns or 2 rows) featuring a live interactive widget, graphical preview, or rich metric visualization.
    - Surround with 2–3 compact supporting cards displaying complementary micro-features (e.g., metric badge, toggle switch preview, code snippet).
  - **Zero Dead Whitespace**:
    - Bento cards must contain intentional visual payloads (real UI components, SVG sparklines, or status indicators). Do not leave empty space merely padded with generic paragraph text.
    - Apply consistent inner padding (`p-6` or `p-8`) and internal card border radius ($R_{\text{inner}} = R_{\text{outer}} - \text{padding}$).
- **Scripted Cursor Simulation (Interactive Product Stills)**:
  - When showcasing interactive product workflows without video rendering overhead, simulate live user interaction using pure CSS/React:
    - Render an authentic SVG cursor (`pointer-events-none absolute z-50 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]`).
    - Script keyframe coordinates between interactive targets (e.g., moving from a table row to an action button).
    - Trigger tactile hover feedback (`scale-105`) and simulated click ripples (`scale-95 duration-100`) as the cursor reaches target coordinates.
- **Component Stage Verification**:
  - Always mount showcase components within an isolated preview stage (bounded container with dark/light mode toggle and responsive breakpoint controls) to verify optical alignment, contrast ratios, and layout stability before declaring completion.
