---
name: harness-distiller
description: "[Harness-Zero Discovery & Distillation Engine] Scans session transcripts to detect execution friction and recurring errors, distilling lean zero-slop .agents or SKILL.md specs adhering strictly to L0 line budgets (<=60 lines)."
---

# Harness-Zero Distiller & Discovery Engine

Autonomous discovery and distillation engine for Antigravity 2.0. Translates operational friction, repeated failure signatures, and emerging capabilities into compact, deterministic skill and rule specifications.

---

## 1. Operating Principles
- **Agent-as-Harness Distillation**: Avoid prompt-slop and scaffolding bloat. Distill the minimal procedural invariant.
- **Strict $L_0$ Line Budget**: Skill files must remain $\le 60$ lines to protect the context window.
- **Code-as-Agent-Harness**: Offload algorithmic or deterministic logic to native companion scripts (`node`, `python`, `powershell`), never to unconstrained LLM prompt prose.

---

## 2. CLI Workflow

### A. Scan Active Session Transcript
Detect friction points, tool failures, and churned files from the current conversation:
```bash
node C:\Users\Luthfi\.gemini\scripts\harness-distiller.js scan
```

### B. Distill Lean Skill Specification
Generate a zero-slop, calibrated `.agents` or `SKILL.md` file:
```bash
node C:\Users\Luthfi\.gemini\scripts\harness-distiller.js distill --name <skill-name> --desc "<concise-summary>" --triggers "<when-to-trigger>" --steps "<step1>;<step2>;<step3>" [--script "<companion-script-path>"] [--out "<path-to-SKILL.md>"]
```

### C. Verify Harness Quality & $L_0$ Compliance
Verify that YAML frontmatter is valid, brackets are safe, lines are within budget, and AI slop phrases are purged:
```bash
node C:\Users\Luthfi\.gemini\scripts\harness-distiller.js verify "<path-to-skill-or-rule>"
```

---

## 3. Evidence & Acceptance Gate
1. Scan output reports clear failure signatures and candidate proposals.
2. Distilled spec passes `verify` with 0 format errors and 0 slop warnings.
3. Total lines $\le 60$ lines.

---

## 4. Production Harness Architecture Reference
Consult [`references/harness-engineering-pillars.md`](references/harness-engineering-pillars.md) for the 5-Pillar Harness Engineering standard (Instructions, State, Verification, Scope Boundaries, and Lifecycle Handoff).
