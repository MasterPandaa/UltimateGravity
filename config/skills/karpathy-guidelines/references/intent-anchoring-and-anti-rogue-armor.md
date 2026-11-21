# Intent Anchoring & Anti-Rogue Armor Plates Protocol

> **Pattern Origin**: Absorbed from kishi27's *External Harness Control Theory* (`note.com/kishi27`).  
> **Purpose**: Prevent agent drift, speculative over-engineering, and "misguided kindness" (rewriting untouched files or assuming unverified fixes).

---

## 1. The "Misguided Kindness" Hazard

Fast, capable models (e.g. Gemini, Claude, GPT) often act like eager, unmonitored pilots:
- When asked to fix a CSS margin, the agent refactors the entire component hierarchy.
- When asked to inspect an API contract, the agent mutates database migrations or adds speculative mock files.
- The agent apologizes profusely for minor errors while continuing to produce speculative edits.

This is **Misguided Kindness**: the model hallucinates user helpfulness by doing *more* than asked, inadvertently corrupting surrounding architecture and polluting git diffs.

---

## 2. The 3-Layer External Armor Plates

To convert an unpredictable agent loop into a disciplined, obedient engineering partner, the harness enforces **Three Armor Plates**:

```
[User Task]
     │
     ▼
┌────────────────────────────────────────────────────────┐
│ Armor Plate 1: Intent Anchoring                       │
│  - Mode 1: READ_ONLY (Discovery, AST scanning, audit)  │
│  - Mode 2: SURGICAL_EDIT (Targeted file, <=50 lines)   │
│  - Transition Gate: Mutation prohibited in Mode 1.     │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Armor Plate 2: Destructive Operation Gateways          │
│  - Pre-mutation snapshot (file-rewind / step-checkpoint)│
│  - Hard guardrail: git push --force / DROP TABLE       │
│  - Immediate halt if file outside active scope.        │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Armor Plate 3: Diff & Syntax Boundary Safety           │
│  - Strict single-contiguous edit block via edit_file   │
│  - Pre-commit AST syntax validation (watchdog hook)    │
│  - UTF-8 and newline integrity verification            │
└────────────────────────────────────────────────────────┘
```

---

## 3. Operational Rules

1. **State Isolation**: Never execute edit operations during discovery turns. Read first, diagnose root causes, then perform surgical edits.
2. **Blast Radius Cap**: Edits must strictly touch only the files named in the task scope. Modifying adjacent utility or config files requires explicit user confirmation.
3. **No Unprompted Redesigns**: Maintain existing codebase formatting, docstrings, and architectural patterns. Refactoring is strictly forbidden unless explicitly requested.

---

## 4. Superpowers Tactical Engineering: MVBR & Assumption Inversion

> Grounded in the architectural absorption of the `superpowers` plugin into surgical software engineering.

### A. Minimal Verifiable Blast Radius (MVBR)
1. **Zero-Creep Constraint**: If fixing a bug in `auth.service.ts`, modifying adjacent formatters or helper functions in `user.util.ts` is strictly prohibited unless directly required by the contract.
2. **Backward-Compatible Seams**: Ensure new parameters or schema changes maintain compatibility with existing callers. Never break existing unit tests in unrelated domains to accommodate a local change.
3. **Deterministic Diff Budget**: Brownfield edits should stay bounded ($< 50$ lines changed per file) whenever possible. If an edit exceeds 100 lines, pause and verify whether an architectural abstraction is being prematurely forced.

### B. Tacit Assumption Inversion
Before writing implementation code, surface and invert the 3 most common invisible assumptions:
1. *Input Format Invariant*: Do not assume input data is clean, non-null, or within typical size bounds. Add explicit runtime boundary parsing (Zod/Pydantic/Guard clauses).
2. *Network & State Invariant*: Do not assume remote services, databases, or local file systems are always responsive. Define timeouts, retry ceilings, and deterministic fallback responses.
3. *Execution Idempotency*: Do not assume operations run once. Design state mutations (database writes, file writes, notifications) so that a repeated execution produces the same consistent system state.
