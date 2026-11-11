# Deep Architecture Investigation & Understanding-First Synthesis

> **Pattern Origin**: Absorbed from `shareAI-lab/lab-skills` (`research-analysis/deep-architecture-research` & `understanding-first-report`).  
> **Purpose**: Clarify ambiguous problem spaces, reconstruct cross-turn engineering intent, and trace ground-truth source evidence before committing to structural changes.

---

## 1. The Investigation Triad

Before modifying legacy architecture or choosing technical dependencies, execute the 3-point investigative probe:

1. **Source-Level Ground Truth**: Inspect real source implementations, type contracts, and runtime exports rather than trusting outdated marketing claims, forum posts, or abstract documentation.
2. **Commit & Architectural History**: Trace `git log -S` and PR discussion records to understand *why* current constraints or idiosyncrasies were originally introduced.
3. **Calibrated Edge Boundary**: Identify breaking updates, platform limitations (e.g. Windows paths, memory footprints), and disputed scenarios before writing code.

---

## 2. Understanding-First Problem Space Synthesis

When returning to extended, multi-turn technical sessions or complex user requests:

1. **Quote Anchor**: Quote the exact original user requirement or problem statement before providing technical analysis.
2. **Context Reconstruction**: Identify what is established fact, what is an active hypothesis, and what questions remain open.
3. **Spatial Problem Mapping**: Use structured ASCII/Markdown maps to represent dependencies, conflict boundaries, and architectural layers rather than flat, unstructured bullet lists.
4. **Attention-Friendly Decision Order**: Present recommendations in reverse cognitive load order:
   - *Decision & Core Verdict* (Immediate 1-line answer)
   - *Concrete Evidence & Proof Points* (Code diffs, test logs)
   - *Underlying Trade-offs & Invariants* (Memory, complexity, maintenance cost)
   - *Next Action* (Specific 1-click step)
