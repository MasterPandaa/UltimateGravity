# Community Failure Modes & Anti-Pattern Catalog

> **Pattern Origin**: Synthesized from community post-mortems across Reddit (`r/google_antigravity`, `r/vibecoding`) and Hacker News discussions.  
> **Purpose**: Systematic detection and mitigation of recurring failure modes in LLM agent sessions.

---

## 1. Top 4 Failure Modes in Autonomous Sessions

| Failure Mode | Root Cause / Manifestation | UltimateGravity Defense |
|---|---|---|
| **1. The Politeness Trap (Waffling)** | Agent spends hundreds of tokens apologizing for previous tool errors, reciting pleasantries, and discussing intentions rather than executing commands. | **Zero-Fluff Invariant**: Pre-prompt mandate prohibiting apologies and pleasantries; enforce direct execution with sub-second terminal invocation. |
| **2. UI Mock Data Hallucination** | Agent generates static mock arrays, lorem ipsum text, or fake inline objects instead of wiring real database schemas or REST/GraphQL endpoints. | **Ground-Truth Anchor (§4.B)**: Mandate real contract verification; reject fake mocks in production code; require live dev-server browser sentinel verification. |
| **3. Quota Drain & 429 Cascade** | Agent accumulates thousands of lines of raw compiler/terminal output across 20+ turns, filling KV-cache and triggering rate limits. | **4-Step Compaction**: Snip compact terminal outputs >50 lines; maintain active context under 50,000 tokens; switch heavy MCPs to sleep mode (`mcp-profile`). |
| **4. Unstructured Chatbot Drift** | Treating complex refactors as casual chat requests without planning, resulting in fragmented partial edits. | **Task DAG & Solo Direct Mode**: Deconstruct requests into dependency-aware tasks (`task-dag`); enforce plan-first execution before modifying source files. |

---

## 2. Detection & Grading Rubric

When supervising or auditing agent sessions:
1. **Apology Density Check**: Any response containing phrases like *"I apologize for the oversight"*, *"You are completely right"*, or *"Let me try again"* receives an immediate demerit in `agent-judge`.
2. **Mock Leak Check**: Search diffs for `const mockData = [...]` or hardcoded dummy IDs in API consumer components.
3. **Turn Budget Check**: If an agent takes $>3$ turns without producing a terminal verification command, flag as *Speculative Stalling*.
