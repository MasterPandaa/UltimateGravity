---
name: token-optimizer
description: "[Startup Token Optimizer & Context Diet Engine] Audits and eliminates Turn-0 startup token bloat across GEMINI.md, rules, skill frontmatters, and MCP schemas using Progressive Disclosure."
---

# STARTUP TOKEN OPTIMIZER — Operational Procedure

> Invariant: Keep startup context lean (< 2,500 tokens). Every byte in root rules and skill descriptions is paid on every turn.

## 1. Quick Start & Diagnostic Commands
```powershell
# 1. Audit startup token overhead (GEMINI.md, rules, skill catalog)
node C:\Users\Luthfi\.gemini\scripts\token-optimizer.js measure

# 2. Lint instructions for monolithic bloat, large code fences, and oversized descriptions
node C:\Users\Luthfi\.gemini\scripts\token-optimizer.js audit

# 3. Simulate progressive disclosure savings on a target rule file
node C:\Users\Luthfi\.gemini\scripts\token-optimizer.js simulate <path-to-file>

# 4. Scaffold an ultra-lean on-demand skill (< 60 lines)
node C:\Users\Luthfi\.gemini\scripts\token-optimizer.js scaffold <skill-name>

# 5. Extract structural AST skeleton from files > 300 lines (Zed-inspired)
node C:\Users\Luthfi\.gemini\scripts\ast-outline.js <path-to-file>

# 6. Compact voluminous logs (>8KB) to Head 4KB + Tail 1KB (DSH-inspired)
node C:\Users\Luthfi\.gemini\scripts\compact-log.js <log-path> [--inplace]
```

## 2. Progressive Disclosure Rules
1. **Root Rules (`GEMINI.md`)**: Must contain ONLY behavioral invariants and semantic pointers (Target: $\le 150-200$ lines).
2. **Skill Frontmatter**: Description length MUST NOT exceed 400 characters to prevent system prompt saturation.
3. **Procedural SOPs**: Never embed large bash scripts or tutorial walkthroughs in root rules; offload to on-demand `SKILL.md`.
4. **Verification**: Always run `measure` and `audit` before committing instruction changes.

## 3. Hierarchical Context Management & Structural Indexing
1. **LSM Active Context Pruning**: For long-running sessions, consult [`references/lsm-context-pruning.md`](references/lsm-context-pruning.md) to apply the 3-Tier LSM Active Context Pruning model to keep active turns bounded within 50K–150K tokens.
2. **Zed AST Outline Slicing**: For large source files (> 300 lines), consult [`references/zed-ast-outline-pruning.md`](references/zed-ast-outline-pruning.md) to extract AST skeletons prior to surgical edits, cutting discovery token tax by $\ge 88\%$.
3. **DSH Compaction & Loop Sentinel**: For outputs $> 8\text{KB}$ or cyclic tool calls, consult [`references/dsh-compaction-and-loop-sentinel.md`](references/dsh-compaction-and-loop-sentinel.md) to enforce Head 4KB + Tail 1KB log compaction and the 3/5/8 repeat-tool sentinel.
