---
name: anti-slop
description: "[UI Cliche Purger] & Editorial Quality Gate] Subtractive quality gate that strips repetitive AI tropes, boilerplate, and generic templates from UI designs, code comments, and copy. Use as a final pass before delivering frontend interfaces. DO NOT USE for component library implementations (use shadcn-ui)."
---

# Anti-Slop: Subtractive Quality Filter

Acts as a ruthless filter to catch and eliminate lazy, predictable patterns typical of raw AI generation. Pairs as a complementary audit layer with aesthetic design skills like `taste-skill` and `shadcn-ui`.

## Hard Gates: What Is Strictly Banned

### 1. UI Anti-Patterns
- **Multiple Hero Buttons (Twinning CTAs)**: Ban multiple solid filled primary buttons competing for visual attention on the same screen (Rule: Max 1 hero primary button per viewport; others must be outline/ghost).
- **Pure Black on Pure White Cliché**: Ban harsh `#000000` text directly on `#FFFFFF` surfaces (causes optical vibration; enforce off-black `#0F172A`/`#18181B` and off-white `#F8FAFC`).
- **Missing Interaction States (Rage-Click Inducers)**: Ban interactive buttons without distinct `:active` (pressed scale) and loading spinner states.
- **Arbitrary Odd Spacing**: Ban unaligned, guessing-game spacing values (e.g. 13px, 17px, 21px). Enforce strict 8pt grid tokens (`4px`, `8px`, `16px`, `24px`, `32px`).
- **The AI Purple/Pink Gradient**: Ban `#8B5CF6` to `#EC4899` gradient hero backgrounds or text clips unless explicitly branded.
- **The "Bento Grid" Default**: Ban 3-column equal-height bento grids with arbitrary floating cards that have no informational hierarchy.
- **Sparkle Clichés**: Ban decorative sparkle icons (`✨`, `SparklesIcon`) on buttons, headers, or feature lists to indicate "AI power".
- **Uniform Rounded Corners**: Ban mindless `rounded-2xl` on every nested element. Vary radius with intent (`rounded-sm` for tags, `rounded-lg` for cards, `rounded-none` for crisp editorial layouts).
- **Generic Beta Badges**: Ban "v1.0 is live!" or "Now in Public Beta" pills that serve no real functional purpose.

### 2. Copywriting Clichés
- **AI Hype Verbs**: Ban "Unleash", "Elevate", "Supercharge", "Transform", "Revolutionize", "Seamless", "Delve", "Game-changer".
- **Forced Triads**: Ban groups of three adjective bullet points structured as "X, Y, and Z" when two or four are more accurate.
- **Stock AI Contrast Openers**: Ban "In today's fast-paced digital world..." or "Whether you are an X or a Y...".
- **The Hollow Closer**: Ban "The future is here, and it starts with you."

### 3. Code Anti-Patterns
- **Narrative Commenting**: Ban comments that merely restate the code:
  ```typescript
  // BAD: Increment counter by 1
  count += 1;
  ```
- **Premature Abstraction**: Ban wrapping a simple 5-line utility into an `AbstractFactoryManagerProvider` class.
- **Placeholder Hand-waving**: Ban `// TODO: Add error handling here` in production deliverables.

## Delivery Verification Gate
Before claiming a frontend or written deliverable complete, run the Anti-Slop Check:
- [ ] No banned verbs in headlines
- [ ] No generic purple hero gradient
- [ ] Typography uses high-contrast weights, not default Inter medium
- [ ] Layout matches the specific content shape, not a template wireframe
- [ ] Code comments explain *why*, never *what*
