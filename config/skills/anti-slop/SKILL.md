---
name: anti-slop
description: "[UI & Content Anti-Slop Gatekeeper] Ruthlessly eliminates generic AI tropes, empty boilerplate, and cliched templates across UI designs, code comments, and copy. Consults references/anti-ai-slop-guide.md for deep humanization."
---

# Anti-Slop: Subtractive Quality Filter

Acts as a ruthless filter to eliminate lazy, predictable patterns typical of raw AI generation. For deep editorial writing, humanization workflows, and visual asset audits, read: **[references/anti-ai-slop-guide.md](references/anti-ai-slop-guide.md)**.

## Hard Gates: What Is Strictly Banned

### 1. UI & Visual Anti-Patterns
- **Multiple Hero Buttons**: Max 1 solid primary button per viewport; others must be outline/ghost (*One Hero, One Action*).
- **Pure Black on White & AI Purple**: Ban `#000000` on `#FFFFFF` (use `#0F172A`/`#18181B`) and generic `#8B5CF6` purple/pink glow.
- **Box-in-a-Box & Divider Clutter**: Ban cards inside cards with borders/shadows (use whitespace). Ban gratuitous `<hr>` borders.
- **Grayscale Hierarchy Failure**: Structure and data hierarchy must be 100% decipherable in monochrome before adding color.
- **Literal Visual Metaphors**: Ban brains with circuits for AI, lightbulbs for ideas, and fake bento-grids.
- **9-Pass UI Refactoring Pipeline**: When refactoring AI-generated screens, execute in strict sequential order: Spacing &rarr; Color &rarr; Icons &rarr; Copy &rarr; Type &rarr; Layout &rarr; Details &rarr; Visuals &rarr; Motion ([`references/anti-ai-slop-guide.md`](references/anti-ai-slop-guide.md)).

### 2. Copywriting & Text Slop
- **3 Core Diagnostic Tests**:
  - *Topic-Swap Test*: If a paragraph fits another topic by changing 2 words, it is empty fluff—cut it.
  - *So What? Test*: Every claim must carry a tangible consequence or metric for the reader.
  - *Anti-Fence-Sitting*: Ban diplomatic cop-outs (*"depends on individual preference"*); take a firm conditional stance.
- **Banned AI-isms**: Ban "navigate the landscape", "tapestry", "digital era", "not just X but also Y", "delve", "beacon", "elevate", "in today's fast-paced world", and "it is important to note that".
- **Anti-Hallucinated Experience**: Never fabricate personal stories, quotes, or fake data. Use honest facts or `[FILL: verified project data]`.

### 3. Code Anti-Patterns
- **Narrative Commenting**: Ban comments merely restating code (`// increment count by 1`). Explain *why*, never *what*.
- **Premature Abstraction & TODO Stubs**: Ban `AbstractFactoryManagerProvider` and `// TODO: implement later` stubs.

## Delivery Verification Gate
Before claiming a deliverable complete, run the Anti-Slop Check:
- [ ] Passed Topic-Swap and "So What?" tests (no generic fluff or fence-sitting)
- [ ] No invented personal anecdotes or unverified metrics
- [ ] Single Focus: Exactly one dominant hero element and one primary action per viewport
- [ ] Visual Subtraction: No nested box-in-a-box or divider clutter
- [ ] Code comments explain *why*, never *what* (no fake TODO stubs)
