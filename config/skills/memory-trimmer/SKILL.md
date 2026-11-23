---
name: memory-trimmer
description: "[Memory Trimmer & Context Diet Engine] Audits and prunes dead skill telemetry, deduplicates failure trajectories, and prevents stale memory bloat and context pollution."
---

# Memory Trimmer & Context Diet Engine

Routine maintenance and memory diet engine for Antigravity 2.0 (inspired by yu-xiao-sheng/codex-memory-trim). Prevents context pollution, eliminates stale constraints, and keeps persistent memory stores within tight token budgets.

---

## 1. Core Functions
- **Dead Memory Pruner**: Eliminates telemetry and references to deleted or archived skills.
- **Trajectory Deduplicator**: Caps and deduplicates repetitive failure records in `mad-rsi-failures.json`.
- **Zero-Data-Loss Safety Net**: Automatically generates `.bak` copies before any store modification.

---

## 2. CLI Workflow

### A. Audit Memory Stores
Scan persistent stores for bloat, dead keys, and duplicates:
```bash
node C:\Users\Luthfi\.gemini\scripts\memory-trimmer.js audit
```

### B. Execute Memory Trim / Diet
Prune dead entries and compact memory files:
```bash
node C:\Users\Luthfi\.gemini\scripts\memory-trimmer.js trim
```

### C. Quick Memory Health Status
```bash
node C:\Users\Luthfi\.gemini\scripts\memory-trimmer.js status
```

---

## 3. Evidence & Acceptance Gate
- Audit confirms all stores report `status: "CLEAN"`.
- Total dead entries count === 0.
- Token headroom preserved without impacting active session context.

---

## 4. Compaction Standards & Context Guardian Pakem
- **MaxIM Dual-Bound Compaction (arXiv:2611.12825)**: Enforce Predictive Sufficiency (forward utility) and Recursive Consistency (factually verified records).
- **Offline Sleep Consolidation (arXiv:2606.03979)**: Consolidate state via `memory-trimmer.js trim` and run rehearsal gate `bench-runner.js run`.
- **Context Guardian & Never Compact Mid-Task (rizalkr/agy-setup)**: For Yellow/Red zone thresholds and safe compaction prompts, consult [`references/context-guardian-pakem.md`](references/context-guardian-pakem.md).
