# 19 Micro-Interaction & Design Engineering Rules (Interfaces.dev / Jakub Krehel)

Compilation of micro-interaction and design engineering principles that separate ordinary UI from exceptional craft. Adapted from `jakubkrehel/make-interfaces-feel-better`.

---

## 1. Concentric Border Radius
Disproportionate nested rounded corners cause visual dissonance.
- **Formula**:
  $$\text{outerRadius} = \text{innerRadius} + \text{padding}$$
- **Tailwind Example**:
  If an outer container specifies padding `p-3` (12px) and an inner element declares `rounded-md` (6px), the outer container **must** declare `rounded-[18px]` ($6 + 12 = 18\text{px}$).
  ```html
  <!-- Outer Container: p-3 (12px), radius 18px -->
  <div class="rounded-[18px] p-3 bg-card border">
    <!-- Inner Element: radius 6px (rounded-md) -->
    <div class="rounded-md bg-muted p-2">
      Harmonious Content
    </div>
  </div>
  ```

---

## 2. Optical Over Geometric Alignment
Mathematical or geometric centers frequently appear off-center to the human eye due to asymmetrical visual weight distribution.
- **Play Buttons**: Triangle glyphs appear left-heavy when geometrically centered. Shift triangles $1\text{–}2\text{px}$ to the right (`translate-x-0.5`).
- **Icon + Text Pairing**: Glyphs with ascenders/descenders (e.g. diagonal arrows or exclamation marks) require a manual Y-axis nudge (`translate-y-[1px]`) to align with font cap-height.
- **Badges**: Badge status copy often looks vertically low; add minor top padding or apply `leading-none`.

---

## 3. Layered Shadows for Elevation, Borders for Structure
Never rely on thick borders for elevation, and avoid single dense, opaque shadows.
- **Borders**: Strictly reserved for structural delimiters, layout grids, and active/focus states.
- **Layered Shadows**: Deploy 2–3 stepped transparent shadow tiers (ambient lighting + directional lighting) for natural depth:
  ```css
  /* Layered Elevation Shadow */
  box-shadow: 
    0 1px 2px 0 rgb(0 0 0 / 0.05),
    0 4px 6px -1px rgb(0 0 0 / 0.08),
    0 12px 24px -4px rgb(0 0 0 / 0.06);
  ```

---

## 4. Interruptible CSS Transitions
Avoid `@keyframes` for interactive user-triggered state transitions (hover, accordion expansion, dropdown toggles).
- **Rationale**: `@keyframes` cannot be interrupted smoothly. If the cursor exits before completion, elements snap abruptly back to start.
- **Remedy**: Use CSS `transition` or spring physics (`motion/react`). When reversed mid-flight, transitions interpolate fluidly from their instantaneous coordinates.
  ```css
  /* Interruptible Transition */
  .interactive-pill {
    transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1), background-color 150ms ease;
  }
  ```

---

## 5. Split & Stagger Enter Animations
Avoid animating elements inside a container as a single massive block; split them into semantic chunks.
- Apply stepped staggers ($60\text{–}100\text{ms}$) across semantic blocks (Heading $\to$ Description $\to$ Primary Action $\to$ Media).
- **Constraint**: **NEVER** animate or stagger routine, high-frequency actions (dropdown menus, submit buttons, autocomplete lists). Reserve staggers for initial page loads or hero cards.

---

## 6. Subtle Contextual Exit Animations
Exit states must animate faster and more subtly than entrance animations.
- Use small directional vertical shifts (`translateY` $4\text{–}8\text{px}$) towards the logical exit path.
- Configure exit durations $60\text{–}70\%$ faster than enter durations, applying `ease-out` in both directions:
  ```tsx
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } }}
    exit={{ opacity: 0, y: -4, transition: { duration: 0.15, ease: "easeOut" } }}
  />
  ```

---

## 7. Contextual Icon Animations (Pop & Settle)
When swapping status icons (Copy $\to$ Copied checkmark, Play $\to$ Pause, Bookmark $\to$ Bookmarked):
- Combine 3 properties:
  1. **Scale**: $0.25 \to 1$
  2. **Opacity**: $0 \to 1$
  3. **Blur**: $4\text{px} \to 0\text{px}$
- Apply a zero-bounce spring curve:
  ```tsx
  <motion.div
    initial={{ scale: 0.25, opacity: 0, filter: "blur(4px)" }}
    animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
    exit={{ scale: 0.25, opacity: 0, filter: "blur(4px)" }}
    transition={{ type: "spring", duration: 0.3, bounce: 0 }}
  >
    <Check className="h-4 w-4" />
  </motion.div>
  ```

---

## 8. Native Font Smoothing
Ensure browser rendering matches Figma clarity across WebKit and macOS:
```css
body, html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

---

## 9. Tabular Numbers (Anti-Layout Shift)
For dynamic counters, timestamps, pricing tables, metrics, or timers, proportional figures trigger horizontal jitter upon updates.
- Enforce:
  ```css
  font-variant-numeric: tabular-nums;
  /* Tailwind utility: */
  className="tabular-nums font-mono" /* or tabular-nums alone */
  ```

---

## 10. Modern Text Wrapping (Balance & Pretty)
Eliminate typographic widows and orphan words on trailing lines.
- **Headings**: Declare `text-wrap: balance` (Tailwind: `text-balance`).
- **Body Copy**: Declare `text-wrap: pretty` (Tailwind: `text-pretty`) to distribute characters harmoniously.
  ```html
  <h2 class="text-2xl font-bold tracking-tight text-balance">Enterprise System Deployments Made Effortless</h2>
  <p class="text-muted-foreground text-pretty max-w-prose">Automate production workloads with verifiable reliability.</p>
  ```

---

## 11. Subtle Image Outlines (Light & Dark Mode)
Graphics placed on backgrounds lose boundary definition when tones align (white photo on white card, dark screenshot in dark mode).
- Apply a 1px low-opacity outline:
  - **Light Mode**: `oklch(0 0 0 / 0.08)` or `border-black/10` (pure black with low opacity).
  - **Dark Mode**: `oklch(1 0 0 / 0.12)` or `border-white/10` (pure white with low opacity).
- **Prohibited**: Flat gray borders (`#CCCCCC` or `#333333`) which appear muddy and unpolished.

---

## 12. Precise Scale on Press (Tactile Micro-Feedback)
Provide immediate tactile feedback on interactive controls during press states:
- Scale target: `active:scale-[0.96]`.
- **Ceiling**: Never scale below `0.95` (feels broken or collapsed).
- Add gentle transitions: `transition-transform duration-100 ease-out`.

---

## 13. Skip Animation on Initial Page Load
When users refresh or open a route containing `AnimatePresence`, do not animate existing persistent components from zero opacity unless part of an intentional hero reveal.
- Pass `initial={false}` to `AnimatePresence`:
  ```tsx
  <AnimatePresence initial={false}>
    {isOpen && <Panel key="panel" />}
  </AnimatePresence>
  ```

---

## 14. Never Use `transition: all`
- `transition: all` triggers expensive style recalculations for non-composited properties (`height`, `width`, `margin`, `padding`, `box-shadow`), compromising GPU performance.
- **Rule**: Explicitly declare targeted animated properties:
  ```css
  /* Bad */
  transition: all 0.2s ease;

  /* Good */
  transition: transform 0.2s ease, opacity 0.2s ease, background-color 0.15s ease;
  ```

---

## 15. Use `will-change` Sparingly
- Never apply `will-change: transform` across all elements in permanent CSS trees (wastes GPU VRAM layer memory).
- Apply `will-change` strictly to actively animating elements, clearing it upon animation termination, or restricting strictly to `transform, opacity, filter`.

---

## 16. Minimum Interactive Hit Area
Small controls (modal close buttons, action dots, compact toggles) trigger misclicks when hit targets are constrained.
- **Mobile / Touch**: Minimum $44 \times 44\text{px}$ (WCAG baseline).
- **Desktop**: Minimum $40 \times 40\text{px}$.
- **Pseudo-Element Hit Box**: When a visual glyph is only $16\text{px}$ or $20\text{px}$, expand the hit area without modifying layout geometry via a pseudo-element:
  ```html
  <button class="relative p-1">
    <X className="h-4 w-4" />
    <span class="absolute -inset-2" aria-hidden="true" />
  </button>
  ```

---

## 17. Match Icon Stroke to Text Weight
Mismatches between icon stroke weights and adjacent font weights trigger visual imbalance.
- **Font Weight 400 (Regular)**: `stroke-width={1.5}` on Lucide icons.
- **Font Weight 500 (Medium)**: `stroke-width={1.75}`.
- **Font Weight 600 (Semibold / Bold)**: `stroke-width={2.0}`.
  ```tsx
  {/* Semibold button text + stroke-2 icon */}
  <Button className="font-semibold gap-2">
    <Plus className="h-4 w-4" strokeWidth={2} />
    New Project
  </Button>
  ```

---

## 18. Single SVG Recolored via `currentColor`
Do not load two separate SVG files to represent active/inactive or hover states.
- Structure a single SVG with outline paths, controlling fills dynamically via `currentColor` or opacity classes:
  ```tsx
  <Heart 
    className={cn(
      "h-5 w-5 transition-colors", 
      isLiked ? "fill-primary text-primary" : "fill-transparent text-muted-foreground"
    )} 
  />
  ```

---

## 19. Motion Restraint & The 10% Speed Audit
To verify interfaces are free of micro-flicker or subpixel jitter:
- Open **Chrome DevTools $\to$ More Tools $\to$ Animations**.
- Slow animation speed to **10%** (0.1x speed).
- Click buttons, trigger dropdowns, open modals, and audit:
  1. Do borders flash or clip?
  2. Do hover transitions snap awkwardly when the cursor exits rapidly?
  3. Does typography undergo subpixel position shifting during scale transitions?
- Resolve micro-defects prior to client handoff.
