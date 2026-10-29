---
name: karpathy-guidelines
description: "[Surgical Coding & Anti-Complexity Guidelines] Operational guidelines to prevent over-engineering, enforce surgical edits, surface hidden assumptions, and define verifiable success criteria. DO NOT USE for domain architecture patterns (use codebase-design or clean-code-fullstack)."
license: MIT
---

# Karpathy Guidelines

Behavioral guidelines to reduce common LLM coding mistakes, derived from [Andrej Karpathy's observations](https://x.com/karpathy/status/2015883857489522876) on LLM coding pitfalls.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes (Anti-Band-Aid & Anti-Anchor)

**Touch what you must with precision. But NEVER leave rotten foundations intact.**

When editing existing code:
- Use targeted edits to prevent accidental diff regressions.
- Match clean existing project conventions, but **NEVER mimic legacy technical debt or anti-patterns** (Legacy is a baseline, NOT ground truth).
- **Anti-Band-Aid Hard Gate**: Do not slap quick patches over fundamentally flawed architectures. If the touched function, component, or contract has structural defects, surface them and refactor cleanly.
- If you notice unrelated dead code or latent bugs, explicitly report them to the user with a recommended fix.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Clean up any dead code in the touched surface.

The test: Every changed line should either trace directly to the user's request OR eliminate architectural technical debt in the touched component.

## 4. Goal-Driven Execution & Verification

**Define verifiable success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Reproduce the bug deterministically, fix root cause, verify clean run"
- "Refactor X" → "Ensure tests pass, AND verify that existing tests aren't stale (Stale QA Invalidation)"
- "UI modification" → "Do NOT rely only on TypeScript compile (`tsc`); verify live browser rendering, console hydration errors, and 4 UI states"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.
