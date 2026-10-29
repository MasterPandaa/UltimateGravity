---
name: shadcn-ui
description: "[shadcn/ui & Radix Component System] Implementation guide for modern shadcn/ui components built on Radix UI Primitives, Tailwind CSS, Lucide Icons, and CVA. Use when authoring or modifying UI components in React, Vite, and Next.js. DO NOT USE for visual design critique or general polish (use impeccable) or converting raw screenshots to HTML (use html-anything)."
---

# shadcn/ui — Modern Frontend Engineering & Anti-Slop UI Architecture

Comprehensive implementation guide for production-grade web interfaces utilizing **shadcn/ui**, **Radix UI**, **Tailwind CSS**, and **Lucide Icons**.

## Table of Contents

- [1. Design Principles & Anti-Slop UI](#1-design-principles-anti-slop-ui)
- [2. Foundation Utility: `cn()`](#2-fondasi-utilitas-cn)
- [3. Core Component Best Practices & Patterns](#3-komponen-inti-best-practice-pola)
- [4. Theming & Dark Mode Architecture](#4-theming-dark-mode-architecture)
- [5. Golden Rules of UI/UX Components (7 Design Rules)](#5-golden-rules-of-uiux-components-7-design-rules)
- [6. Precision Micro-Interactions & UX Laws (Interfaces.dev)](#6-precision-micro-interactions-ux-laws-interfacesdev)
- [7. UI Verification Checklist](#7-ui-verification-checklist)
- [8. References](#8-references)

---

## 1. Design Principles & Anti-Slop UI

1. **Copy-Paste Philosophy (Owned Code)**: Components are copied directly into the workspace repository (`components/ui/`), not imported as immutable black-box npm packages.
2. **Accessible by Default**: Powered by Radix UI primitives with built-in ARIA attributes, keyboard navigation, and focus management conforming to WCAG 2.1 AA standards.
3. **Restrained Anti-Slop Palette**: Reject saturated purple-on-black AI gradient clichés. Build on calm semantic scales (`slate`, `zinc`, `neutral`) with intentional high-contrast accents.
4. **Idempotent Component Variants**: Leverage `class-variance-authority` (cva) for type-safe variants (`variant`, `size`, `intent`).

---

## 2. Foundation Utility: `cn()`

Always use `cn()` for class composition, combining `clsx` (conditional classes) and `tailwind-merge` (conflict resolution):

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 3. Core Component Best Practices & Patterns

### A. Buttons (`components/ui/button.tsx`)
Always define explicit interactive states:
```typescript
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

### B. Dialogs & Modals (`components/ui/dialog.tsx`)
- Always include `DialogTitle` and `DialogDescription` for screen-reader accessibility.
- Never place overflowing, uncontained forms inside dialogs without explicit scroll boundaries (`max-h-[85vh] overflow-y-auto`).

---

## 4. Theming & Dark Mode Architecture

- Rely strictly on CSS custom variables defined in `globals.css` with semantic tokens:
  - `--background`, `--foreground`
  - `--card`, `--card-foreground`
  - `--primary`, `--primary-foreground`
  - `--muted`, `--muted-foreground`
  - `--border`, `--input`, `--ring`
- Implement theme toggling via `next-themes` or local class-based dark mode toggles applied to the `<html>` root.

---

## 5. Golden Rules of UI/UX Components (7 Design Rules)

Apply these 7 deterministic rules across all interface components:

1. **60–30–10 Color Distribution Rule**:
   - **60% Dominant (Background)**: Clean visual foundation (`bg-background`, off-white or off-black).
   - **30% Secondary (Surfaces & Cards)**: Structure and contrast (`bg-card`, sidebar, borders, tab navigation).
   - **10% Accent (Interactive Focus)**: Reserved strictly for primary CTAs (`bg-primary`), active status badges, or selected toggles. Never use accent colors on passive visual elements.
2. **One Primary Hero Button per View**:
   - Exactly **ONE solid primary filled button** per viewport or major card container.
   - Secondary actions must use `outline` or `secondary`; tertiary actions use `ghost` or `link`.
3. **Four Interactive Button States (Anti Rage-Click)**:
   - **Hover**: *"I am clickable"* (`hover:opacity-90` or subtle tint shift).
   - **Pressed / Active**: *"Interaction acknowledged"* (`active:scale-[0.98]` tactile micro-feedback).
   - **Loading**: *"Processing"* (button disabled, text replaced with inline SVG spinner, double-clicks blocked).
   - **Success / Resolved**: Brief confirmation state (checkmark or transient green state) before resetting.
4. **Button Sizing & Touch Targets**:
   - **Small (`h-8 px-3 text-xs` / 32–36px)**: Dense data tables, toolbars, filter badges.
   - **Medium (`h-10 px-4 text-sm` / 40–44px)**: Default for forms, dialog actions, and card CTAs.
   - **Large (`h-12 px-6 text-base` / 48–52px)**: Hero page CTAs and mobile touch targets (meeting WCAG 44–48px threshold).
5. **Systematic 8pt Spacing Grid**:
   - `4px` (`gap-1`): Tight spacing between inline icons and text labels.
   - `8px` (`gap-2`): Standard spacing between elements in a unified control group.
   - `16px` (`p-4` / `gap-4`): Standard internal padding for cards and input containers.
   - `24px–32px` (`gap-6` / `gap-8`): Section spacing between distinct content groups.
   - Forbid arbitrary non-scale values: `margin: 13px`, `padding: 21px`.
6. **No Pure Black (#000000) & No Pure White (#FFFFFF)**:
   - Avoid stark `#000000` text on `#FFFFFF` (triggers optical vibration and eye strain).
   - Use tinted off-blacks (`#0F172A`, `#111827`, `#18181B`) and off-whites (`#F8FAFC`, `#F9FAFB`, `#F4F4F5`).
7. **Line Length Boundaries (The 45–75 Character Rule)**:
   - Wrap description text with `max-w-prose` (~65ch) to prevent visual fatigue on widescreen displays.

---

## 6. Precision Micro-Interactions & UX Laws (Interfaces.dev)

Enforce fine-grained craftsmanship principles across interactive elements:

1. **Concentric Border Radius**:
   - Outer container radius must match: $\text{outerRadius} = \text{innerRadius} + \text{padding}$.
   - Example: Container with `p-3` (12px) and inner child `rounded-md` (6px) requires outer `rounded-[18px]` ($6 + 12$).
2. **Optical Over Geometric Alignment**:
   - Play buttons / triangular icons: offset $1\text{–}2\text{px}$ to the right (`translate-x-0.5`) to balance optical center.
   - Icons beside text: align vertical axis with `translate-y-[1px]` to match font cap-height.
3. **Layered Shadows for Depth, Borders for Structure**:
   - Avoid heavy borders to create 3D bevels. Use 2–3 layered low-opacity box-shadows for elevation.
4. **Tabular Numbers & Modern Wrapping**:
   - Enforce `tabular-nums` on dynamic counters, timers, and prices to eliminate horizontal layout jitter.
   - Use `text-balance` on headings and `text-pretty` on body paragraphs.
5. **Icon Stroke Parity**:
   - Regular text (400) ➔ Lucide `strokeWidth={1.5}`.
   - Medium text (500) ➔ Lucide `strokeWidth={1.75}`.
   - Semibold text (600) ➔ Lucide `strokeWidth={2.0}`.
6. **Minimum Click Target**:
   - At least $44 \times 44\text{px}$ on touch/mobile, $40 \times 40\text{px}$ on desktop. Expand tiny $16\text{px}$ icons with `span.absolute -inset-2`.
7. **Subtle Image Outlines**:
   - Add a 1px transparent outline to avatars/images: `border-black/10` in light mode, `border-white/10` in dark mode.
8. **Tactile Press Feedback**:
   - Provide micro-scaling on click: `active:scale-[0.96]` (never below 0.95 to prevent sunken visuals).
9. **Law of Proximity (Gestalt)**:
   - Label-to-input gap must be tight (`gap-1.5` / 6px); group gaps wide (`space-y-4` / 16px). Headings must anchor closer to their following content ($	ext{mt} > 	ext{mb}$).
10. **Goal-Gradient Effect**:
    - Multi-step flows: show pre-completed initial progress ("1/4 completed: Account Initialized") to accelerate user completion momentum.
11. **Miller's Law ($7 \pm 2$ Chunking)**:
    - Restrict primary navigation menus to 5–7 items maximum. Group secondary actions into categories.
12. **Aesthetic-Usability Effect**:
    - Users perceive visually refined interfaces as easier to learn and more trustworthy (*halo effect*).
13. **Doherty Threshold (< 400ms Feedback)**:
    - Every interactive control must deliver visual feedback within 400ms (ideally < 150ms). Use skeleton screens and optimistic state updates.
14. **Jakob's Law**:
    - Adhere to platform navigation standards (cart top-right, search magnifying glass, standard back arrows). Innovate on product value, not navigation patterns.
15. **Fitts's Law (Thumb Zone)**:
    - Position primary mobile CTAs in the bottom thumb reach zone. Provide full-width touch surfaces (`w-full`, $h \ge 48\text{px}$).
16. **Hick's Law (Progressive Disclosure)**:
    - Decision time scales logarithmically with choices: $T = b \cdot \log_2(n + 1)$. Present exactly one primary action per screen; tuck advanced configurations behind toggles or accordions.

---

## 7. UI Verification Checklist

- [ ] Four mandatory UI states implemented (Loading, Empty, Error, Success).
- [ ] No unstyled native inputs; all forms wrapped with Radix/shadcn controllers.
- [ ] Keyboard navigation verified (Tab, Enter, Space, Escape on dialogs/menus).
- [ ] Dark mode tested: semantic color tokens verified without low-contrast anomalies.
- [ ] Mobile viewport tested: zero horizontal scroll overflow.

---

## 8. References
- Official shadcn/ui components: [ui.shadcn.com](https://ui.shadcn.com)
- Radix UI Primitives: [radix-ui.com/primitives](https://www.radix-ui.com/primitives)
- Micro-interactions & Craft: [interfaces.dev](https://interfaces.dev)
