# Token Architecture

Three-layer token system for scalable, themeable design systems.

## Layer Overview

```
┌─────────────────────────────────────────┐
│  Component Tokens                       │  Per-component overrides
│  --button-bg, --card-padding            │
├─────────────────────────────────────────┤
│  Semantic Tokens                        │  Purpose-based aliases
│  --color-primary, --spacing-section     │
├─────────────────────────────────────────┤
│  Primitive Tokens                       │  Raw design values
│  --color-blue-600, --space-4            │
└─────────────────────────────────────────┘
```

## Why Three Layers?

| Layer | Purpose | When to Change |
|-------|---------|----------------|
| Primitive | Base values (colors, sizes) | Rarely - foundational |
| Semantic | Meaning assignment | Theme switching |
| Component | Component customization | Per-component needs |

## Layer 1: Primitive Tokens

Raw design values without semantic meaning.

```css
:root {
  /* Colors */
  --color-gray-50: #F9FAFB;
  --color-gray-900: #111827;
  --color-blue-500: #3B82F6;
  --color-blue-600: #2563EB;

  /* Spacing (4px base) */
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-4: 1rem;     /* 16px */
  --space-6: 1.5rem;   /* 24px */

  /* Typography */
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;

  /* Radius */
  --radius-sm: 0.25rem;
  --radius-default: 0.5rem;
  --radius-lg: 0.75rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgb(0 0 0 / 0.05);
  --shadow-default: 0 1px 3px rgb(0 0 0 / 0.1);
}
```

## Layer 2: Semantic Tokens

Purpose-based aliases that reference primitives.

```css
:root {
  /* Background */
  --color-background: var(--color-gray-50);
  --color-foreground: var(--color-gray-900);

  /* Primary */
  --color-primary: var(--color-blue-600);
  --color-primary-hover: var(--color-blue-700);

  /* Secondary */
  --color-secondary: var(--color-gray-100);
  --color-secondary-foreground: var(--color-gray-900);

  /* Muted */
  --color-muted: var(--color-gray-100);
  --color-muted-foreground: var(--color-gray-500);

  /* Destructive */
  --color-destructive: var(--color-red-600);
  --color-destructive-foreground: white;

  /* Spacing */
  --spacing-component: var(--space-4);
  --spacing-section: var(--space-6);
}
```

## Layer 3: Component Tokens

Component-specific tokens referencing semantic layer.

```css
:root {
  /* Button */
  --button-bg: var(--color-primary);
  --button-fg: white;
  --button-hover-bg: var(--color-primary-hover);
  --button-padding-x: var(--space-4);
  --button-padding-y: var(--space-2);
  --button-radius: var(--radius-default);

  /* Input */
  --input-bg: var(--color-background);
  --input-border: var(--color-gray-300);
  --input-focus-ring: var(--color-primary);
  --input-padding: var(--space-2) var(--space-3);

  /* Card */
  --card-bg: var(--color-background);
  --card-border: var(--color-gray-200);
  --card-padding: var(--space-4);
  --card-radius: var(--radius-lg);
  --card-shadow: var(--shadow-default);
}
```

## Dark Mode

Override semantic tokens for dark theme:

```css
.dark {
  --color-background: var(--color-gray-900);
  --color-foreground: var(--color-gray-50);
  --color-muted: var(--color-gray-800);
  --color-muted-foreground: var(--color-gray-400);
  --color-secondary: var(--color-gray-800);
}
```

## Naming Convention

```
--{category}-{item}-{variant}-{state}

Examples:
--color-primary           # category-item
--color-primary-hover     # category-item-state
--button-bg-hover         # component-property-state
--space-section-sm        # category-semantic-variant
```

## Categories

| Category | Examples |
|----------|----------|
| color | primary, secondary, muted, destructive |
| space | 1, 2, 4, 8, section, component |
| font-size | xs, sm, base, lg, xl |
| radius | sm, default, lg, full |
| shadow | sm, default, lg |
| duration | fast, normal, slow |

## File Organization

```
tokens/
├── primitives.css     # Raw values
├── semantic.css       # Purpose aliases
├── components.css     # Component tokens
└── index.css          # Imports all
```

Or single file with layer comments:

```css
/* === PRIMITIVES === */
:root { ... }

/* === SEMANTIC === */
:root { ... }

/* === COMPONENTS === */
:root { ... }

/* === DARK MODE === */
.dark { ... }
```

## Migration from Flat Tokens

Before (flat):
```css
--button-primary-bg: #2563EB;
--button-secondary-bg: #F3F4F6;
```

After (three-layer):
```css
/* Primitive */
--color-blue-600: #2563EB;
--color-gray-100: #F3F4F6;

/* Semantic */
--color-primary: var(--color-blue-600);
--color-secondary: var(--color-gray-100);

/* Component */
--button-bg: var(--color-primary);
--button-secondary-bg: var(--color-secondary);
```

## W3C DTCG Alignment

Token JSON format (W3C Design Tokens Community Group):

```json
{
  "color": {
    "blue": {
      "600": {
        "$value": "#2563EB",
        "$type": "color"
      }
    }
  }
}
```

---

## Agent-Ready Design Tokens & Anti-Arbitrary Value Invariants (Meta Astryx Protocol)

> Grounded in the architectural absorption of Meta's `meta/astryx` design system into Antigravity.

When AI agents construct user interfaces, they frequently suffer from **Arbitrary Value Hallucinations**—injecting unanchored pixel widths (`w-[318px]`), custom hex colors (`bg-[#232b3e]`), and ad-hoc padding (`p-[17px]`). This causes layout fragmentation, breaks theme switching, and pollutes codebases.

### 1. The Zero-Arbitrary Value Invariant
```text
❌ ARBITRARY VALUE INJECTION:
<div className="w-[342px] bg-[#1a1f2c] p-[18px] text-[#f1f5f9] rounded-[7px]">
Fragility: High | Theme-Safe: No | Design System Compliance: 0%

✅ SEMANTIC TOKEN BINDING:
<div className="w-full max-w-sm bg-card p-4 text-card-foreground rounded-lg border border-border">
Fragility: Zero | Theme-Safe: 100% (Light/Dark/High-Contrast) | Compliance: Strict
```

### 2. The 3 Agent Rules for UI Construction
1. **Never use inline arbitrary hex codes or arbitrary bracket units in Tailwind/CSS**:
   - If a layout requires a constraint, use standard scale tokens (`max-w-xs`, `max-w-md`, `max-w-xl`, `space-y-4`).
   - If a color is needed, reference semantic tokens (`bg-primary`, `text-muted-foreground`, `border-border`), never raw primitive names (`bg-blue-600`) in component views.
2. **Semantic Decoupling for Theme Invariance**:
   - Component templates must be 100% agnostic to light or dark mode. The semantic CSS variable layer (`.dark { --background: ... }`) resolves color adaptation automatically.
3. **Closed Vocabulary Verification**:
   - If a design requirement appears to require a non-existent token, do not invent one inline. Flag the missing design token or map it to the closest approved semantic token.

---

## 📐 Rad Spacing: Gestalt Proximity & The ~40% Rule

> Absorbed from `nolanperk/rad-spacing`. Enforces visual hierarchy through mathematical spacing ratios based on container nesting depth.

### 1. Hierarchy Nesting Depth
Map spacing from outermost containers to innermost elements:
$$\text{Page Container} \longrightarrow \text{Section} \longrightarrow \text{Card} \longrightarrow \text{Card Content} \longrightarrow \text{Inline Grouping}$$

### 2. The ~40% Ratio Rule
- Each parent level receives approximately **$1.4\times$** the spacing of its child level (or conversely, child spacing is $\approx 0.6\times$ parent).
- Snap results to the nearest **8px increment**. If the $0.6$ ratio lands closer to a 4px increment, snap to 4px instead.
- **Base Anchor**: 8px (`spacing/sm`) for tightest grouping (e.g. label-to-input or icon-to-text).

### 3. Semantic Spacing Token Scale
| Token | Pixel Value | Hierarchy Role | Example Mapping |
|---|---|---|---|
| `spacing/xs` | 4px | Micro-alignment | Icon padding, tag internal gap, inline badges |
| `spacing/sm` | 8px | Tight grouping | Label to input, icon to text, tightly coupled pairs |
| `spacing/md` | 12px | Sibling separation | Form fields within one section, button group gap |
| `spacing/lg` | 16px | Component separation | Card content padding, distinct form sections |
| `spacing/xl` | 24px | Container framing | Card padding, modal internal margins |
| `spacing/2xl` | 32px | Section boundary | Section gap, grid spacing, sidebar padding |
| `spacing/3xl` | 48px | Page-level framing | Page hero spacing, major layout block margins |

---

## 🔍 Design System Drift Audit Protocol

> Absorbed from `edenspiekermann/Skills`. Eliminates design-system integration drift across Figma and code implementations.

### 1. Core Drift Types & Detection Checks
| Drift Category | Anomaly Signature | Agent Remediation Protocol |
|---|---|---|
| **Unbound Colors** | Raw hex values (`#3B82F6`, `rgb(...)`) used in fills/strokes instead of semantic color variables. | Replace with semantic variable (`--color-primary`, `bg-primary`). |
| **Arbitrary Spacing** | Hardcoded padding/margins (`p-[13px]`, `gap-5`) violating the 4px/8px scale. | Re-align using the ~40% rule to nearest semantic token (`spacing/md` or `spacing/lg`). |
| **Local Overrides** | Detached component instances or rogue inline CSS overrides breaking parent variants. | Re-attach to canonical component variant or define approved props/slots. |
| **Unlinked Typography** | Inline `font-size` or `line-height` not mapped to typographic scales (`--font-size-*`). | Re-bind to semantic text tokens (`text-sm`, `text-base`, `text-lg`). |

### 2. Execution Gate
Before shipping any UI component or Figma frame:
1. Run static audit: Assert zero raw hex codes outside primitive definitions.
2. Assert zero arbitrary Tailwind bracket notation (`-[...]`).
3. Assert all container hierarchy levels follow the ~40% spacing progression.

---

## 🛡️ Agent-Prescriptive Lint Diagnostics (Absorbed from `@shadcn/lint`)

> Inspired by `@shadcn/lint`. Converts design system violations from cryptic compiler warnings into actionable, agent-prescriptive replacement recipes.

### 1. The Prescriptive Diagnostic Pattern
Instead of generic ESLint warnings (e.g. *"Unexpected arbitrary value"*), diagnostics for coding agents must provide the exact reason and the prescribed token:

```text
❌ CRYPTIC LINT ERROR (HUMAN-ORIENTED):
warning: Avoid arbitrary Tailwind values 'p-[14px]'  tailwindcss/no-arbitrary-value

✅ AGENT-PRESCRIPTIVE DIAGNOSTIC (@shadcn/lint PATTERN):
[DESIGN SYSTEM VIOLATION] file: src/components/SettingsCard.tsx#L24
- Offending Class : p-[14px]
- Rule Violated   : Arbitrary spacing brackets break the 4px/8px design scale (~40% rule).
- Prescribed Token: Use 'p-3' (12px - spacing/md) or 'p-4' (16px - spacing/lg).
- Quick-Fix Recipe: Replace className="p-[14px]" with className="p-4"
```

### 2. The 3 Prescriptive Invariants for Frontend Tooling
1. **Component Contract Preservation**:
   - Standard components (`Button`, `Badge`, `Input`) define their own internal padding and height variants (`size="sm"`, `size="default"`, `size="lg"`).
   - Prohibit external padding overrides (e.g. `<Button className="p-6">`). Diagnostic must prescribe: *"Remove external padding; pass size prop or customize component variant in components/ui/button.tsx"*.
2. **Color Token Enforcement**:
   - Catch raw hex patterns (`bg-[#111827]`, `text-[#3B82F6]`) and prescribe semantic CSS variable mappings (`bg-background`, `text-primary`).
3. **Typography Scale Enforcement**:
   - Catch arbitrary text sizes (`text-[15px]`, `leading-[22px]`) and prescribe standard typographic tokens (`text-sm`, `text-base`).

---

## 🌐 DOM Design Token Extraction & Shadcn Theme Mapping Protocol (Absorbed from `Manavarya09/design-extract`)

When reverse-engineering a live reference website's design system or replicating visual aesthetics from web inspections:

### 1. Computed Style Extraction via Browser Engine
Extract computed CSS properties directly from rendered DOM nodes via Playwright or Chrome DevTools:

```javascript
// Browser evaluation snippet for token harvesting
const extractElementTokens = () => {
  const styles = window.getComputedStyle(document.body);
  const elements = Array.from(document.querySelectorAll('*'));
  
  // 1. Color Palette Extraction: Collect background, text, and border colors
  const colors = elements.map(el => {
    const cs = window.getComputedStyle(el);
    return [cs.backgroundColor, cs.color, cs.borderColor];
  }).flat().filter(c => c && c !== 'rgba(0, 0, 0, 0)');

  // 2. Font Ramps: Collect font-family, sizes, and weights from headings & body
  const fontSizes = [...new Set(elements.map(el => window.getComputedStyle(el).fontSize))];
  const borderRadii = [...new Set(elements.map(el => window.getComputedStyle(el).borderRadius))];

  return { colors, fontSizes, borderRadii };
};
```

### 2. Clustering & Normalization Rules
1. **Delta-E Color Clustering**:
   - Convert extracted RGB/Hex strings to HSL.
   - Cluster near-duplicate shades within perceptual distance ($\Delta E < 3.0$). Map the dominant dark surface to `--background` and the dominant brand saturation to `--primary`.
2. **Modular Typography Scale Alignment**:
   - Sort extracted font sizes ascending. Align sizes to the closest standard Tailwind/Design-System step (`12px` &rarr; `text-xs`, `14px` &rarr; `text-sm`, `16px` &rarr; `text-base`, `24px` &rarr; `text-2xl`, `32px` &rarr; `text-4xl`).
3. **Corner Radius Normalization**:
   - Map prevailing corner curves: $\le 4\text{px} \to \text{rounded-sm}$, $6\text{–}8\text{px} \to \text{rounded-md}$, $\ge 12\text{px} \to \text{rounded-lg}$.

### 3. Direct Shadcn Theme Variable Generator
Map the normalized clusters directly to standard `shadcn/ui` CSS variables in `globals.css`:

```css
:root {
  --background: <extracted-surface-hsl>;
  --foreground: <extracted-body-text-hsl>;
  --primary: <extracted-brand-accent-hsl>;
  --primary-foreground: <high-contrast-text-hsl>;
  --muted: <extracted-subtle-surface-hsl>;
  --muted-foreground: <extracted-secondary-text-hsl>;
  --border: <extracted-divider-hsl>;
  --radius: <extracted-dominant-radius>;
}
```

---

## 🎨 Semantic DESIGN.md Specification Contract

> **Pattern Origin**: Absorbed from `google-labs-code/stitch-skills` and `arumwu/design-md-skill` (§8 External Proposal Protocol).

To prevent agents from hallucinating arbitrary palettes, random spacing, and disjointed components, frontend projects should declare a root `DESIGN.md` establishing a single source of design truth before code generation.

### 1. The 5 Core Contract Surfaces
1. **Brand Character & Mood**: 1-sentence brand anchor (e.g. *"Technical minimalism with high information density, like Linear"* or *"Editorial typography with warm paper textures, like Stripe"*).
2. **Semantic Color Roles**:
   - Explicit mappings for Canvas, Foreground, Primary, Subtle/Muted, Borders, and Accent.
   - Separate definitions for Light and Dark modes guaranteeing WCAG AA/AAA compliance.
3. **Typography & Readability Hierarchy**:
   - Display font vs Body font declaration.
   - Standard reading measure: 45–75 characters per line (`max-w-prose`).
   - Tabular numerals (`font-mono` or `font-feature-settings: 'tnum'`) mandated for currency, timestamps, and metric tables.
4. **Elevation & Depth Scale**:
   - Levels 0–3 defined: Flat (borders only, 0 shadow), Raised (hairline border + subtle shadow), Floating (modals/popovers with scrim).
5. **Component Density & Radii**:
   - Compact (8px base padding, 4–6px radius) vs Spacious (16px base padding, 8–12px radius).

