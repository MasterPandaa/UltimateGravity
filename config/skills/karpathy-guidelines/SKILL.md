---
name: karpathy-guidelines
description: "[Surgical Coding & Anti-Complexity Guidelines] Operational guidelines to prevent over-engineering, enforce surgical edits, surface hidden assumptions, and define verifiable success criteria. DO NOT USE for domain architecture patterns (use codebase-design or clean-code-fullstack)."
license: MIT
---

# Karpathy Guidelines & Anti-Overengineering Guard

> Invariant: Surgical simplicity over speculative bloat. Bias toward caution and zero dead code.

## 1. Think Before Coding
- State assumptions explicitly; never pick silently when multiple interpretations exist.
- Surface tradeoffs upfront; push back pro-actively if a simpler, safer approach exists.

## 2. Simplicity & Anti-Overengineering (Stop-That-Shit Axioms)
- **Minimum Necessary Code**: No unrequested features, no single-use abstractions, no speculative configurability.
- **No Unprompted Checksums/Hashing**: Never calculate, output, or persist SHA256/MD5 hashes unless demanded.
- **Anti-Defensive Paranoia**: No defensive `try/catch` wrappers or null checks for impossible edge cases. Fail fast.
- **Strict Scope Locking**: A localized bug fix must never reformat whole files, reorder keys, or add unsolicited docs.

## 3. Surgical Changes (Anti-Band-Aid & Anti-Anchor)
- Target edits precisely to prevent diff regressions; never copy legacy debt or anti-patterns.
- **Anti-Band-Aid Hard Gate**: Never slap patches over rotten architecture; refactor touched root seams cleanly.
- Clean up orphans: remove imports, variables, or functions rendered unused by your mutation.

## 4. Goal-Driven Execution & Bounded Verification
- Transform requests into verifiable goals (reproduce deterministically -> surgical fix -> verified clean run).
- For UI changes, do not rely solely on compiler output; verify live browser rendering and 4 UI states.
- **Bounded Verification Ceiling**: Cap verification at 1–2 targeted rounds. Never spin in infinite re-verification loops that burn token budget without new evidence.
