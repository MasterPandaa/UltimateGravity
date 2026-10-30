---
name: raven-dispatcher
description: "[EverMind-AI / Raven Execution Plane] Multi-agent task partitioning and context-bleed barrier for Antigravity Tri-Role subagents (collision-free DAG, disjoint file ownership, Step 0 injection)."
---

# Raven Multi-Agent Execution Plane

Multi-agent coordination protocol inspired by EverMind-AI Raven ("The Harness of Harnesses"). Partitions complex engineering goals across Antigravity Tri-Role specialists while strictly isolating context and preventing concurrent file edit collisions.

---

## 1. Core Invariants
- **Collision-Free Partitioning**: Target files are divided into mutually disjoint sets per specialist role.
- **Context Bleed Barrier**: Raw subagent logs remain inside isolated subagent contexts (`Workspace: 'branch'`); only synthesized deliverables return to the main loop.
- **Mandatory Step 0 Gate**: Injects canonical skill ingestion blocks before subagent file access.

---

## 2. CLI Workflow

### A. Partition Goal into Collision-Free Tri-Role DAG
Generate structured subagent briefs with disjoint file boundaries:
```bash
node C:\Users\Luthfi\.gemini\scripts\raven-dispatcher.js plan --goal "<high-level-objective>" --files "<file1,file2,file3>" [--workspace branch]
```

### B. Synthesize Subagent Reports
Distill isolated subagent artifacts into a compact summary:
```bash
node C:\Users\Luthfi\.gemini\scripts\raven-dispatcher.js synthesize --reports "<report1.json,report2.json>" [--out "<summary.json>"]
```

---

## 3. Evidence & Acceptance Gate
- Subagent file sets must have zero overlap ($\text{Set}_A \cap \text{Set}_B = \emptyset$).
- Subagents run in isolated workspace (`branch` or `share`).
- Synthesis eliminates raw terminal outputs, reporting verified exit codes and diffs only.
