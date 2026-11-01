# 3-Tier LSM Active Context Pruning (ACP) Specification

Authoritative architecture specification for model-driven, long-running context compression in autonomous coding agents. Inspired by database storage engines (Log-Structured Merge trees) and Ran Xianglei's `billion-context` architecture.

---

## 🧭 The Long-Session Dilemma: Context Rot & Quadratic Token Tax

In long-running autonomous development sessions (spanning hundreds of turns, multi-file refactors, or multi-hour debugging pipelines), naive context management fails in two distinct ways:

1. **Unbounded Context Ballooning**: Accumulating 500K–1M+ raw tokens causes quadratic self-attention degradation (*"context rot"*), where LLM reasoning becomes distracted by stale terminal dumps, deprecated code drafts, and repetitive tool calls. It also destroys KV prefix-caching and inflates costs.
2. **Lossy Blind Compaction**: Naive one-shot summarization wipes out granular function signatures, exact error traces, and commit histories, forcing agents into catastrophic amnesia.

To achieve perpetual multi-day session continuity, the agent harness implements **Hierarchical LSM Active Context Pruning (ACP)**.

---

## 🏛️ The 3-Tier LSM Context Pruning Hierarchy

```
┌────────────────────────────────────────────────────────────────────────┐
│                   ACTIVE CONTEXT WINDOW (50K–150K)                     │
├────────────────────────────────────────────────────────────────────────┤
│ TIER 2: CONDENSED SEMANTIC ANCHORS (Session Head ~2K–5K tokens)        │
│ • Architecture decisions, fixed bug ledgers, active task objectives    │
├────────────────────────────────────────────────────────────────────────┤
│ TIER 1: MILESTONE DIFF DIGESTS (Intermediate ~20K–40K tokens)          │
│ • Structured summaries of completed task phases                        │
│ • Files touched, key schema changes, resolved failure signatures       │
├────────────────────────────────────────────────────────────────────────┤
│ TIER 0: ACTIVE WORKING SET (Recent ~20K–50K tokens)                    │
│ • 100% Raw, uncompressed execution: current diffs, recent tool outputs │
└────────────────────────────────────────────────────────────────────────┘
```

### Tier 0: Active Working Set (Raw Immediate Context)
- **Token Ceiling**: ~20,000 to 50,000 tokens.
- **Content**: The most recent 5–10 execution turns, unmodified tool inputs/outputs, fresh terminal traces, and active file inspection buffers.
- **Policy**: Kept 100% uncompressed and high-fidelity. No pruning or lossy transformation is permitted on active working files.

### Tier 1: Milestone Diff Digests (Generational Compression)
- **Trigger**: When active turns push context toward $\ge 120,000$ tokens, the oldest slice of Tier 0 is folded into Tier 1.
- **Content**: Replaces raw tool dumps with a structured **Milestone Digest**:
  ```markdown
  [MILESTONE DIGEST: Task Phase X]
  - Target: Added auth middleware and JWT session validation
  - Files Modified: src/auth/jwt.ts (+42/-5), src/routes/auth.ts (+18/-2)
  - Key Invariant: Enforced httpOnly cookie with SameSite=Strict
  - Verification: 6 unit tests passing (exit code 0)
  ```
- **Policy**: Eliminates repetitive raw stdout/stderr logs while strictly preserving modified file paths, exported symbol names, and verification outcomes.

### Tier 2: Condensed Semantic Anchors (Persistent Base)
- **Trigger**: When Tier 1 digests accumulate over multiple work sessions.
- **Content**: Consolidated single-line semantic pointers placed at the head of the session context, summarizing core milestones and architectural constraints.
- **Policy**: Remains static at the top of the context window to maximize prefix-cache hits across turns.

---

## 🔄 Reversibility & Lossless Decompression

Pruning does **NOT** mean destructive deletion:
1. **Lossless Disk of Record**: The underlying system maintains exact, verbatim session history on disk ([`transcript.jsonl`](file:///C:/Users/Luthfi/.gemini/antigravity/brain/b03090d3-6b80-481a-bf9e-cfcbc81d6b58/.system_generated/logs/transcript.jsonl) and `transcript_full.jsonl`).
2. **On-Demand Decompression**: If a subsequent task requires exact stack traces or historical file states from an earlier compressed turn, the agent uses targeted search tools (e.g., Ripgrep `rg` on transcript files or `read_file` with StartLine/EndLine offsets) to selectively restore raw details into Tier 0.

---

## 📊 Prefix-Cache Stability & Bounded Context Invariant

- **Target Operating Band**: Keep active turn context strictly bounded within **50,000 to 150,000 tokens**.
- **Prefix-Cache Maximization**: Because Tier 2 anchors and system instructions remain identical across turns, LLM inference engines hit KV prefix caches consistently, cutting latency by up to $3\times$ and token billing by up to $80\%$.
- **Attention Sharpness**: Eliminates distracting noise, allowing the model's full attention capacity to focus exclusively on the active bug seam or feature implementation.
