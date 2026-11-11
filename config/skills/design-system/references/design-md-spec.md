# Workspace `DESIGN.md` Specification for AI Agents

> Adopted from the `voltagent/awesome-design-md` pattern. Acts as the workspace-level Single Source of Truth (SSoT) for frontend UI aesthetics, design tokens, and component behavior.

---

## 1. Role & Placement
* **Location**: Place `DESIGN.md` at the root of the active frontend project workspace (`./DESIGN.md`).
* **Authority**: Takes precedence over generic defaults. Subagents (specifically `fullstack-developer`) and frontend skills (`impeccable`, `anti-slop`, `design-system`, `shadcn-ui`) inspect this file before generating UI code or Tailwind classes.
* **On-Demand Catalog**: Pre-engineered brand templates (Linear, Stripe, Vercel, Supabase) can be fetched on-demand from `https://github.com/voltagent/awesome-design-md`.

---

## 2. Standard Structure of a `DESIGN.md`

A compliant `DESIGN.md` should define:

### A. Theme & Surfaces
```markdown
## Color System
- Canvas (Background): `#09090b` (Dark) / `#ffffff` (Light)
- Surface (Card/Modal): `#18181b` with `border: 1px solid rgba(255, 255, 255, 0.08)`
- Primary Accent: Brand hex (e.g., `#5E6AD2` Linear blue, `#00DC82` Nuxt green)
- Text Hierarchy:
  - Heading: `#FAFAFA`
  - Body: `#A1A1AA`
  - Muted/Subtle: `#71717A`
```

### B. Typography & Spacing Rhythm
* **Font Stacks**: Specify display (e.g. `Geist`, `Inter`), mono, and body.
* **Scale**: Base font size (`14px` or `16px`), line-heights, letter-tracking (`tracking-tight` on headings).
* **Grid**: 4pt / 8pt spacing rhythm (`gap-2`, `p-4`, `p-6`).

### C. Component Invariants & 4 States
* **Buttons**: Height, radius (e.g. `rounded-full` vs `rounded-md`), hover brightness, `:active` scale (`active:scale-[0.98]`).
* **Cards**: Border opacity, subtle background gradient or glassmorphism if applicable.
* **4 UI States**: Explicit rules for Loading (skeleton), Empty (CTA), Error (retry prompt), Success.

### D. Anti-Slop Enforcement
* No generic bright purple gradients on dark backgrounds without brand justification.
* No raw unstyled centered container layouts.
* Enforce WCAG AA contrast (minimum 4.5:1 for body copy).
