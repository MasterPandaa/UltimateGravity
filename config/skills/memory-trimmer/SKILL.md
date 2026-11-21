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

## 4. MaxIM Dual-Bound Compaction Standard (Absorbed from `arXiv:2611.12825`)

When compacting persistent memory stores and trajectory histories:
1. **Predictive Sufficiency**: Retain high-utility forward-looking context (unresolved bugs, invariant rules, schema contracts).
2. **Recursive Consistency**: Retain only factually verified records supported by deterministic tool executions. Prune repetitive intermediate trials and speculative reasoning.

---

## 5. Offline Sleep Consolidation & Rehearsal (Absorbed from `arXiv:2606.03979`)

To prevent catastrophic forgetting across continuous system interactions:
1. **Consolidate State**: Run `memory-trimmer.js trim` to purge dead telemetry and deduplicate failure trajectories.
2. **Execute Rehearsal Gate**: Run `bench-runner.js run` to assert 100% pass rate across baseline system invariants before closing memory updates.
