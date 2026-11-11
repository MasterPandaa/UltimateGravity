# 4-Step Hierarchical Context Compaction Protocol

> **Pattern Origin**: Absorbed from `shareAI-lab/learn-claude-code` (Lesson s08 *Context Compact*).  
> **Purpose**: Prevent attention degradation and quadratic KV-cache cost growth in long-running engineering sessions.

---

## 1. The Compaction Philosophy

The harness manages context window health proactively before token exhaustion. Long sessions suffer from **quadratic attention rot**, where intermediate tool results drown out original instructions.

Instead of blunt history truncations that cause amnesia, compaction operates across a **4-tier cascading hierarchy**, shedding ephemeral execution debris first and protecting core system invariants last.

```
Incoming Tokens Accumulate
         │
         ▼
[Step 1: Snip Compact]      ───► Truncate oversized tool outputs (>50 lines) to head/tail + exit code.
         │
         ▼ (If still > budget)
[Step 2: Micro Compact]     ───► Strip verbose input arguments & intermediate scratch payloads (>5 turns old).
         │
         ▼ (If still > budget)
[Step 3: Macro History]     ───► Synthesize completed milestone turns into structured delta summaries.
         │
         ▼ (Immutable Core)
[Step 4: Invariant Anchor]  ───► Protect system instructions, active task contracts, and latest 3 turns.
```

---

## 2. Compaction Execution Tiers

### Tier 1: Snip Compaction (Tool Result Pruning)
- **Target**: Raw terminal outputs, file dumps, compiler logs, and test traces.
- **Rule**: Retain first 15 lines (command & initialization) + last 25 lines (stack trace, summary, exit code). Middle content is snipped with `[... <N> lines omitted for context hygiene ...]`.
- **Threshold**: Terminal outputs exceeding 50 lines.

### Tier 2: Micro Compaction (Metadata Stripping)
- **Target**: Tool calls older than 5 interaction turns.
- **Rule**: Replace raw payload JSON with semantic signatures:
  - *Before*: `edit_file(Path: "src/server.ts", Target: "...", Replacement: "...")` (3,000 tokens)
  - *After*: `edit_file(Path: "src/server.ts", Target: "[50 lines modified]") -> OK (Exit 0)` (20 tokens)
- **Preservation**: Do not prune file paths, error codes, or user questions.

### Tier 3: Macro History Digest (Milestone Compression)
- **Target**: Multiturn investigative cycles, failed hypothesis tests, and resolved subtasks.
- **Rule**: Consolidate multi-turn dialogue into a single structured digest:
  ```markdown
  ### 📜 Archived Milestone (Turns 4–12):
  - **Goal**: Implement OAuth callback handler.
  - **Explored**: Tested PKCE verification; failed on missing client secret header.
  - **Resolution**: Refactored `authService.verify()` to inject header; tests passed (exit 0).
  - **Artifacts Modified**: `src/auth.ts`, `tests/auth.test.ts`.
  ```

### Tier 4: Invariant Anchoring (Never Compacted)
- `GEMINI.md` governance invariants and active role definitions.
- The root user prompt and current active acceptance criteria.
- Active DAG state (`task-dag status`) and consumed contract packets.
- The most recent 3 conversational turns.

---

## 3. KV-Cache Optimization Guidelines

1. **Prefix Invariance**: System prompts, agent rules, and static tools must remain byte-identical at the head of the context to maximize KV-cache reuse discounts (up to 80% cost savings).
2. **Append-Only Trimming**: When pruning history, prefer replacing middle turn contents with fixed-length digests rather than shifting whole message indices.
3. **Budget Ceilings**:
   - Light/Solo sessions: Maintain active context under 50,000 tokens.
   - Heavy subagent branches: Bound active context between 50,000–100,000 tokens.
