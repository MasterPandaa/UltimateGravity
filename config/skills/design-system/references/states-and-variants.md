# States and Variants

Component state definitions and variant patterns.

## Interactive States

### State Definitions

| State | Trigger | Visual Change |
|-------|---------|---------------|
| default | None | Base appearance |
| hover | Mouse over | Slight color shift |
| focus | Tab/click | Focus ring |
| active | Mouse down | Darkest color |
| disabled | disabled attr | Reduced opacity |
| loading | Async action | Spinner + opacity |

### State Priority

When multiple states apply, priority (highest to lowest):

1. disabled
2. loading
3. active
4. focus
5. hover
6. default

### State Transitions

```css
/* Standard transition for interactive elements */
.interactive {
  transition-property: color, background-color, border-color, box-shadow;
  transition-duration: var(--duration-fast);
  transition-timing-function: ease-in-out;
}
```

| Transition | Duration | Easing |
|------------|----------|--------|
| Color changes | 150ms | ease-in-out |
| Background | 150ms | ease-in-out |
| Transform | 200ms | ease-out |
| Opacity | 150ms | ease |
| Shadow | 200ms | ease-out |

### Micro-Interaction Motion Tokens & Origin-Aware Transitions (Absorbed from `Jakubantalik/transitions.dev`)

Standardized CSS custom property motion tokens for fluid, tactile component interactions:

#### 1. Micro-Interaction Token Scale
```css
:root {
  /* Durations */
  --motion-duration-instant: 100ms;   /* Toggle active states, icon clicks */
  --motion-duration-fast: 150ms;      /* Tooltips, dropdown items, badge pops */
  --motion-duration-normal: 250ms;    /* Modal reveals, dialog scales, sliding tabs */
  --motion-duration-deliberate: 350ms;/* Drawers, accordion expansions */

  /* Easing Curves */
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);       /* General UI transitions */
  --ease-decelerate: cubic-bezier(0, 0, 0.2, 1);     /* Incoming elements (popover/dialog) */
  --ease-accelerate: cubic-bezier(0.4, 0, 1, 1);     /* Outgoing elements (dismissals) */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);  /* Micro-bounces (badges, toggles) */
}
```

#### 2. Origin-Aware Component Transitions
- **Dropdowns & Popovers**:
  ```css
  .dropdown-menu {
    transform-origin: top left;
    transition: transform var(--motion-duration-fast) var(--ease-decelerate),
                opacity var(--motion-duration-fast) var(--ease-standard);
  }
  .dropdown-menu[data-state="closed"] {
    transform: scale(0.95);
    opacity: 0;
    pointer-events: none;
  }
  ```
- **Notification Badges & Counters**:
  ```css
  .badge-pop {
    transform-origin: center;
    transition: transform var(--motion-duration-fast) var(--ease-spring);
  }
  .badge-pop[data-animating="true"] {
    transform: scale(1.2);
  }
  ```
- **Input Error Shakes**:
  ```css
  @keyframes error-shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-4px); }
    40%, 80% { transform: translateX(4px); }
  }
  .input-error {
    animation: error-shake 200ms var(--ease-standard);
  }
  ```

## Focus States

### Focus Ring Spec

```css
/* Standard focus ring */
.focusable:focus-visible {
  outline: none;
  box-shadow: 0 0 0 var(--ring-offset) var(--color-background),
              0 0 0 calc(var(--ring-offset) + var(--ring-width)) var(--ring-color);
}
```

| Property | Value |
|----------|-------|
| Ring width | 2px |
| Ring offset | 2px |
| Ring color | primary (blue-500) |
| Offset color | background |

### Focus Within

```css
/* Container focus when child is focused */
.container:focus-within {
  border-color: var(--color-ring);
}
```

## Disabled States

### Visual Treatment

```css
.disabled {
  opacity: var(--opacity-disabled); /* 0.5 */
  pointer-events: none;
  cursor: not-allowed;
}
```

| Property | Disabled Value |
|----------|----------------|
| Opacity | 50% |
| Pointer events | none |
| Cursor | not-allowed |
| Background | muted |
| Color | muted-foreground |

### Accessibility

- Use `aria-disabled="true"` for semantic disabled
- Use `disabled` attribute for form elements
- Maintain sufficient contrast (3:1 minimum)

## Loading States

### Spinner Placement

| Component | Spinner Position |
|-----------|------------------|
| Button | Replace icon or center |
| Input | Trailing position |
| Card | Center overlay |
| Page | Center of viewport |

### Loading Treatment

```css
.loading {
  position: relative;
  pointer-events: none;
}

.loading::after {
  content: '';
  /* spinner styles */
}

.loading > * {
  opacity: 0.7;
}
```

## Error States

### Visual Indicators

```css
.error {
  border-color: var(--color-error);
  color: var(--color-error);
}

.error:focus-visible {
  box-shadow: 0 0 0 2px var(--color-background),
              0 0 0 4px var(--color-error);
}
```

| Element | Error Treatment |
|---------|-----------------|
| Input border | red-500 |
| Input focus ring | red/20% |
| Helper text | red-600 |
| Icon | red-500 |

### Error Messages

- Position below input
- Use error color
- Include icon for accessibility
- Clear on valid input

## Variant Patterns

### Color Variants

```css
/* Pattern for color variants */
.component {
  --component-bg: var(--color-primary);
  --component-fg: var(--color-primary-foreground);
  background: var(--component-bg);
  color: var(--component-fg);
}

.component.secondary {
  --component-bg: var(--color-secondary);
  --component-fg: var(--color-secondary-foreground);
}

.component.destructive {
  --component-bg: var(--color-destructive);
  --component-fg: var(--color-destructive-foreground);
}
```

### Size Variants

```css
/* Pattern for size variants */
.component {
  --component-height: 40px;
  --component-padding: var(--space-4);
  --component-font: var(--font-size-sm);
}

.component.sm {
  --component-height: 32px;
  --component-padding: var(--space-3);
  --component-font: var(--font-size-xs);
}

.component.lg {
  --component-height: 48px;
  --component-padding: var(--space-6);
  --component-font: var(--font-size-base);
}
```

## Accessibility Requirements

### Color Contrast

| Element | Minimum Ratio |
|---------|---------------|
| Normal text | 4.5:1 |
| Large text (18px+) | 3:1 |
| UI components | 3:1 |
| Focus indicator | 3:1 |

### State Indicators

- Never rely on color alone
- Use icons, text, or patterns
- Ensure focus is visible
- Provide loading announcements

### ARIA States

```html
<!-- Disabled -->
<button disabled aria-disabled="true">Submit</button>

<!-- Loading -->
<button aria-busy="true" aria-describedby="loading-text">
  <span id="loading-text" class="sr-only">Loading...</span>
</button>

<!-- Error -->
<input aria-invalid="true" aria-describedby="error-msg">
<span id="error-msg" role="alert">Error message</span>
```

---

## ⚡ High-Craft Micro-Interactions & GPU Animation Invariants

> **Pattern Origin**: Absorbed from `emilkowalski/skills` (§8 External Proposal Protocol).

Craft-driven micro-interactions and GPU-optimized animation invariants for zero-jank UI:

### 1. GPU Compositor Exclusivity
- Animate **strictly** compositor-friendly properties: `transform` and `opacity`.
- **Prohibited in animations/transitions**: `width`, `height`, `top`, `left`, `margin`, `padding`, `border-width`. These trigger expensive CPU reflow/layout recalculations and cause frame drops.
- When expanding containers or sliding accordions, use scale transforms or CSS Grid `grid-template-rows: 0fr -> 1fr` rather than animating height directly.

### 2. Direct DOM Mutations for Frame Loops
- For continuous gesture tracking, pointer-follow, drag-and-drop, or spring physics, mutate `ref.current.style.transform` directly instead of triggering React state updates on every animation frame. React component re-rendering at 60/120Hz creates unnecessary garbage collection pauses.

### 3. Tactile Physicality
- **Active State Feedback**: Apply subtle tactile compression on click/press:
  ```css
  .button-tactile:active {
    transform: scale(0.97);
    transition-duration: 100ms;
  }
  ```
- **Optical Typography Tuning**:
  - Tighten letter spacing on large display headings (`tracking-[-0.02em]` / `-0.015em`) for cohesive visual density.
  - Constrain body line length to a maximum measure of 65 characters (`max-w-[65ch]`).
  - Mandate `tabular-nums` (`font-variant-numeric: tabular-nums`) for all countdowns, stock tickers, metrics, and timestamps to eliminate horizontal layout jitter as digits change.
