---
name: harness2
description: "[Google Harness² Recursive Open-World Engine] 8-component modular tree (c1..c8), Propose-Probe-Compose cycle for open-world tasks without ground truth, and cross-task Persistent Improvement Library."
---

# HARNESS² — Operational Procedure

> Invariant: When modifying a component, all omitted components are strictly inherited. Verify open-world adaptations via Behavioral Contrast.

## 1. Quick Start Commands
\`\`\`powershell
# 1. Audit the 8 modular components (c1..c8)
node C:\Users\Luthfi\.gemini\scripts\harness2.js tree

# 2. Propose a targeted mutation on a component seam
node C:\Users\Luthfi\.gemini\scripts\harness2.js ppc-propose --component c4 --target "<skill>" --reason "<why>"

# 3. Evaluate behavioral contrast between baseline and probe candidate
node C:\Users\Luthfi\.gemini\scripts\harness2.js ppc-contrast --baseline <base> --candidate <cand>

# 4. Record proven adaptation into Persistent Improvement Library
node C:\Users\Luthfi\.gemini\scripts\harness2.js record-learning --task "<name>" --component c4 --insight "<lesson>"

# 5. Inspect Persistent Improvement Library
node C:\Users\Luthfi\.gemini\scripts\harness2.js library
\`\`\`

## 2. The 8 Modular Components (`c1..c8`)
- `c1`: System Prompt | `c2`: Boundary Invariants & Guardrails
- `c3`: Dual Memory   | `c4`: Modular Skills Catalog
- `c5`: Tool Guidance | `c6`: Deterministic Engine Scripts
- `c7`: Subagents     | `c8`: Lifecycle Hooks

## 3. The Propose–Probe–Compose (PPC) Cycle
1. **Baseline**: Observe unassisted task execution (exit codes, errors, warnings).
2. **Propose**: Draft candidate edit targeting the failure seam ($L_0 \le 60$ lines).
3. **Probe**: Run candidate in isolated branch without ground truth.
4. **Compose**: Use behavioral contrast to merge only if error is eliminated without regression.
