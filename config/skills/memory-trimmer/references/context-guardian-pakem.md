# Context Guardian: Safe Compaction & Session Handoff Pakem

> **Pattern Origin**: Absorbed from `rizalkr/agy-setup` (§8 External Proposal Protocol).

This reference governs context health, safe compaction timing, and session boundary transitions to prevent mid-task amnesia and context rot.

---

## 1. The Core Invariant: Never Compact Mid-Task

Compacting context while in the middle of an unresolved task is a critical agent failure mode:
- **The Failure**: Compacting while a bug is unresolved, a test is failing, or an edit is half-applied causes instantaneous amnesia of active stack traces, variable states, and root-cause hypotheses.
- **The Rule**: Always drive the current atomic action to a clean boundary (file reverted, test verified green, or edit completed) before compacting.

---

## 2. Two-Zone Context Scale & Advisory Triggers

When conversation history scales or token thresholds are reached:

### A. Yellow Zone (Zona Kuning: 75–119 steps or ~85k–135k tokens)
1. **If Mid-Task (Active Unfinished Fix or Edit)**:
   - State: `[Zona Kuning - <steps> steps / ~<tokens>k tokens | Status: Belum Aman Compact]`
   - Directive: Advise completing the active sub-task first. Never suggest `/compact` until the baseline is clean.
2. **If Milestone Just Finished (Work Remains)**:
   - State: `[Zona Kuning - <steps> steps / ~<tokens>k tokens | Status: Aman untuk Compact]`
   - Directive: Provide a ready-to-copy compaction command:
     ```text
     /compact Pertahankan konteks: <key files, architectural decisions, verified exit codes>. Selanjutnya: <exact next task>.
     ```
3. **If All Tasks Finished**:
   - Advise starting a fresh session (`/clear` or New Conversation) for the next unrelated task.

### B. Red Zone (Zona Merah: $\ge 120$ steps or $\ge 135k$ tokens)
1. **If All Tasks Finished**:
   - State: `[Zona Merah - <steps> steps / ~<tokens>k tokens | Semua Tugas Selesai]`
   - Directive: Recommend closing the session and provide a New Session Handoff Prompt for follow-up work.
2. **If Tasks Remain Unfinished**:
   - State: `[Zona Merah - <steps> steps / ~<tokens>k tokens | Konteks Berat]`
   - Directive: Complete the immediate atomic mutation, then provide BOTH choices:
     1. **Same-Session Compact Prompt**:
        ```text
        /compact Pertahankan konteks: <key files, schema contracts, current progress>. Lanjutkan: <exact next task>.
        ```
     2. **New-Session Handoff Prompt (Alternative via `/clear`)**:
        A self-contained 3–5 line prompt the user can paste into a brand-new conversation to reset context to zero with full task continuity.
