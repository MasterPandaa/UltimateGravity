---
name: token-optimizer
description: "[Startup Token Optimizer & Context Diet Engine] Audits and eliminates Turn-0 startup token bloat across GEMINI.md, rules, skill frontmatters, and MCP schemas using Progressive Disclosure."
---

# STARTUP TOKEN OPTIMIZER — Operational Procedure

> Invariant: Keep startup context lean (< 2,500 tokens). Every byte in root rules and skill descriptions is paid on every turn.

## 1. Quick Start & Diagnostic Commands
\`\`\`powershell
# 1. Audit startup token overhead (GEMINI.md, rules, skill catalog)
node C:\Users\Luthfi\.gemini\scripts\token-optimizer.js measure

# 2. Lint instructions for monolithic bloat, large code fences, and oversized descriptions
node C:\Users\Luthfi\.gemini\scripts\token-optimizer.js audit

# 3. Simulate progressive disclosure savings on a target rule file
node C:\Users\Luthfi\.gemini\scripts\token-optimizer.js simulate <path-to-file>

# 4. Scaffold an ultra-lean on-demand skill (< 60 lines)
node C:\Users\Luthfi\.gemini\scripts\token-optimizer.js scaffold <skill-name>
\`\`\`

## 2. Progressive Disclosure Rules
1. **Root Rules (`GEMINI.md`)**: Must contain ONLY behavioral invariants and semantic pointers (Target: $\le 150-200$ lines).
2. **Skill Frontmatter**: Description length MUST NOT exceed 400 characters to prevent system prompt saturation.
3. **Procedural SOPs**: Never embed large bash scripts or tutorial walkthroughs in root rules; offload to on-demand `SKILL.md`.
4. **Verification**: Always run `measure` and `audit` before committing instruction changes.

## 3. Hierarchical Context Management
For long-running sessions, consult [`references/lsm-context-pruning.md`](references/lsm-context-pruning.md) to apply the 3-Tier LSM Active Context Pruning model (Tier 0 Working Set, Tier 1 Milestone Digests, Tier 2 Condensed Anchors) to keep active turns bounded within 50K–150K tokens.
