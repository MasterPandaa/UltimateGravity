# DeepSeek Harness Compaction & Infinite Loop Sentinel Specification

Authoritative specification for automated terminal log compaction and cyclic tool execution prevention. Absorbed from **DeepSeek Harness** (`@deepseek-ai/dsh-compaction-tool-result-pruner` and `@deepseek-ai/dsh-repeat-tool-reminder`).

---

## 1. Context Ballooning from Raw Terminal Logs

In autonomous coding, raw terminal outputs from package managers (`npm install`, `cargo build`), test runners (`vitest`, `playwright`, `pytest`), or system diagnostics frequently produce $10,000\text{--}50,000+$ characters of repetitive progress indicators, warnings, and dependency trees.

Dumping raw verbose logs directly into the agent context causes:
1. **Working Context Degradation**: Squeezes out critical architectural invariants and active task plans.
2. **Quadratic Attention Inflation**: Degrades LLM recall precision on specific error lines.
3. **Host Memory Contention**: Bloats process memory on RAM-constrained machines (Windows 8GB RAM).

---

## 2. Head/Tail Compaction Protocol ($\ge 8\text{ KB}$)

From DSH's tool result pruner architecture, we enforce the **4KB Head + 1KB Tail** compaction heuristic:

```
┌─────────────────────────────────────────────────────────────────┐
│ RAW TOOL OUTPUT (> 8,192 chars / ~2,000+ tokens)                │
├─────────────────────────────────────────────────────────────────┤
│ HEAD (First 4,096 chars):                                       │
│ • Command invocation flags, working directory, initial config   │
│ • First error occurrence / compilation startup banner           │
├─────────────────────────────────────────────────────────────────┤
│ [PRUNED]: Repetitive progress bars, neutral informational logs  │
│ "... Truncated N chars (~M lines) to preserve token budget ..." │
├─────────────────────────────────────────────────────────────────┤
│ TAIL (Last 1,024 chars):                                        │
│ • Fatal exception summary, exit code, failing assertion stack   │
└─────────────────────────────────────────────────────────────────┘
```

### Mathematical Invariant:
$$\text{Max Inline Log Footprint} \le 5,120 \text{ chars } (\approx 1,280 \text{ tokens})$$

When terminal output exceeds 8,192 characters, execute compaction via:
```powershell
node C:\Users\Luthfi\.gemini\scripts\compact-log.js <log-file-path> [--inplace]
```
For outputs exceeding 12,500 tokens ($\approx 50\text{ KB}$), write the full raw log to `scratch/` and return only the structured failure digest to context (Spill Policy).

---

## 3. Repeat-Tool Sentinel Protocol (Anti-Loop Guard)

To eliminate cyclic failure loops where the agent blindly repeats an identical tool call without modifying its strategy:

### Trigger Thresholds:
* **Threshold 1 (Streak = 3)**: Soft warning. Agent must verify if target file was actually changed or if terminal error was transient.
* **Threshold 2 (Streak = 5)**: Strategy shift mandatory. Agent is prohibited from repeating the exact same command. Must invoke the 4-step hypothesis loop (`diagnosing-bugs`).
* **Threshold 3 (Streak = 8)**: Hard escalation. Request user confirmation or fail gracefully rather than consuming turns in a doom-loop.

### Sentinel Action Vector:
```
[Identical Tool Call Streak: N]
       │
       ├─ N < 3 ──► Normal Execution
       ├─ N = 3 ──► Ephemeral Warning: Re-check inputs & target file state
       ├─ N = 5 ──► Switch to Hypothesis Isolation (Scientific Bug Loop)
       └─ N >= 8 ──► Hard Stop / Ask User via ask_question
```
The sentinel is continuously enforced via [`diagnostic-watchdog-hook.js`](file:///C:/Users/Luthfi/.gemini/scripts/diagnostic-watchdog-hook.js) on every tool completion.

---

## 4. Action-Preserving Tool Observation Distillation (Tsinghua Coca-Cola Protocol)

> Grounded in the empirical findings of arXiv:2611.06500 (*Tools Need Not Speak in Text: Latent Context Compression for Agents*, Tsinghua University).

In multi-step autonomous agent operations, tools frequently emit voluminous, unstructured observations (raw API JSON responses, extensive web search dumps, wide-scope `git log`/`grep` tables, or verbose MCP payloads).

Empirical research reveals that **70.01% to 89.24%** of raw observation tokens constitute non-actionable boilerplate (HTTP headers, markup tags, redundant metadata, and whitespace). Retaining this raw data directly in the conversational context window:
1. Causes **Quadratic Self-Attention Degradation**, diluting model focus from high-level objectives.
2. Increases end-to-end turn latency by **24% to 56%**.
3. Inflates conversational working memory without altering the agent's downstream decision.

### The Actionable Triad Invariant ($\ge 4\text{ KB}$ Observation Gate)

Whenever a tool call produces an observation exceeding $4,096$ characters ($\approx 1,000$ tokens), the agent must not maintain the unpruned raw payload within conversational working context. Instead, distill the observation into **The Actionable Triad**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ RAW TOOL OBSERVATION (≥ 4 KB / API dumps, broad searches, file listings)│
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
           Action-Preserving Distillation Invariant
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ THE ACTIONABLE TRIAD (< 500 tokens)                                     │
│                                                                         │
│ 1. OUTCOME:       [SUCCESS | PARTIAL | FAIL] + Exit status code         │
│ 2. CRITICAL DELTA:Only key identifiers, error stacks, changed lines,   │
│                   or URLs required for the immediate next turn          │
│ 3. SPILL POINTER: Absolute path to raw payload persisted on disk        │
│                   (e.g., scratch/tool-output-<hash>.json or packet)    │
└─────────────────────────────────────────────────────────────────────────┘
```

### Operational Rules for Autonomous Loops:
1. **Never Hold Broad Raw Payloads**: If querying an API or search engine, extract only the targeted fields (`id`, `url`, `error.message`, `diff`), discarding headers and metadata.
2. **Deterministic Spill-to-Disk**: Write full observations exceeding $4\text{ KB}$ to `scratch/` before reasoning. If deep inspection is needed in later steps, read target line windows via `read_file` rather than holding the entire stream in context.
3. **Preserve Action Distribution**: The distilled observation must retain 100% of the facts necessary to make the same operational choice as the full text would warrant.
