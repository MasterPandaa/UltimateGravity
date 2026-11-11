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
