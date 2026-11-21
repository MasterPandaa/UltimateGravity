# The 5 Pillars of Production Harness Engineering

Authoritative architecture specification for autonomous AI coding agent harnesses. Synthesizes industry research from OpenAI Codex agent-first harness standards, Anthropic Effective Agents guidelines, and WalkingLabs' `learn-harness-engineering` curriculum.

---

## 🧭 Paradigm Shift: Prompt Engineering vs. Harness Engineering

| Dimension | Prompt Engineering (Brittle / Toy) | Harness Engineering (Autonomous / Production) |
|---|---|---|
| **Primary Focus** | What you say to the model (wording, few-shot examples, system prompt prose). | The external environment, constraints, feedback loops, and verification gates surrounding the agent. |
| **Failure Mode** | Hallucinations, premature completion declarations, context degradation, runaway diffs. | Deterministic guardrails, automated error recovery, atomic rollback, strict diff ceilings. |
| **Context Strategy** | Monolithic prompt dumps (stuffing entire codebases or rules into system prompts). | **Progressive Disclosure**: Lean entry points ($L_0 \le 60$), on-demand reference loading, disk-backed state. |
| **Verification** | Agent claims: *"I have fixed the issue and everything works."* | **The Iron Law**: Objective machine proof (compiler exit code 0, test assertions, linter passes) required before completion. |

---

## 🏛️ The 5 Pillars of an Agent Harness

```
┌────────────────────────────────────────────────────────────────────────┐
│                   AUTONOMOUS AGENT HARNESS RUNTIME                     │
├───────────────────┬───────────────────┬────────────────────────────────┤
│ 1. INSTRUCTIONS   │ 2. STATE LAYER    │ 3. VERIFICATION LAYER          │
│ • Progressive     │ • Disk-Persisted  │ • The Iron Law (Exit Code 0)   │
│   Disclosure      │ • Task DAG State  │ • Deterministic Assertions     │
│ • L0 Line Budgets │ • Atomic Snapshots│ • Compiler / Linter Gates      │
├───────────────────┴───────────────────┴────────────────────────────────┤
│ 4. SCOPE BOUNDARIES                   │ 5. LIFECYCLE & HANDOFF         │
│ • Disjoint Seams & Diff Ceilings      │ • Standardized Initialization  │
│ • Anti-Blast-Radius Invariants        │ • Instant Rollback Triggers    │
└───────────────────────────────────────┴────────────────────────────────┘
```

### Pillar 1: Instructions Layer (Progressive Disclosure)
- **Anti-Monolith Invariant**: Avoid bloated system prompts that exhaust attention headroom. Rules files (`GEMINI.md`, `AGENTS.md`) must strictly define behavioral invariants, destructive boundaries, and security standards—not tutorials.
- **Strict $L_0$ Line Budget**: Skill entry files (`SKILL.md`) should remain $\le 60$ lines (ideal) to $120$ lines (maximum). Detailed procedural SOPs reside in on-demand `references/*.md` loaded only when triggered.
- **Tri-Component Separation of Concerns (SoC)**:
  - *Rules*: Hard invariants and security boundaries.
  - *Skills*: On-demand procedural workflows.
  - *Hooks*: Deterministic linters, formatters, and sanity checks shifted out of LLM reasoning.

### Pillar 2: State Layer (Multi-Session Continuity)
- **Disk-Backed State of Record**: Long-running or multi-step tasks must persist progress to disk (`progress.md`, task DAG state machines). Ephemeral chat memory is lossy; the filesystem is the single source of truth.
- **Atomic Checkpointing**: Capture snapshots prior to mutations (`step-checkpoint`). If an execution path fails or the server restarts, the harness resumes from the last valid checkpoint rather than restarting from scratch.

### Pillar 3: Verification Layer (The Iron Law of Verification)
- **Evidence-First Delivery**: Completion claims lacking fresh compiler or test verification logs are strictly classified as hallucinations.
- **Tri-Layer Grading**:
  1. *Deterministic Code Checks*: Fast exit-code, schema, and regex validations run first.
  2. *Probabilistic Critic Passes*: LLM-as-a-judge or adversarial falsification for nuanced criteria.
  3. *Human-in-the-Loop Spot Checks*: Targeted sampling for high-impact edge cases.
- **Absolute Test Integrity**: Removing assertions, skipping broken tests, or inflating timeouts to achieve green exit codes is strictly barred.

### Pillar 4: Scope Boundaries (Blast-Radius Confinement)
- **Seam Isolation**: Limit task execution to 1–3 target files and $< 100$ lines modified per turn unless an architectural refactor is explicitly authorized.
- **Disjoint File Ownership**: In multi-agent squad workflows, agents work in isolated branch workspaces (`Workspace: 'branch'`) with non-overlapping file sets to eliminate git merge collisions and context bleed.

### Pillar 5: Lifecycle & Handoff (Continuous Safety Net)
- **Automated Shadow Copies**: Capture automatic pre-edit snapshots (`file-rewind`) before every file mutation, enabling instant rollback if unexpected regressions occur.
- **Runtime Feedback Loops**: Translate terminal stdout/stderr back into the agent context immediately, allowing rapid hypothesis-driven self-correction.
- **Deploy Rollback Triggers**: Define automated rollback conditions (e.g., 5xx error spikes $> 1\%$, latency degradation $> 2\times$) before declaring releases complete.

---

## 🛠️ Antigravity Platform Implementation Mapping

| Harness Pillar | Antigravity Native Capability |
|---|---|
| **1. Instructions** | `GEMINI.md` Tri-Component SoC, `harness-distiller`, Progressive Disclosure reference trees. |
| **2. State** | `task-dag` DAG state machine, `step-checkpoint` time-travel snapshots, `supermemory` MCP. |
| **3. Verification** | `verification-before-completion`, `diagnosing-bugs` 4-step loop, `qa-skills`, `eval-harness`. |
| **4. Scope** | Solo Direct Mode default, `raven-dispatcher` disjoint DAG partitioning, branch isolation. |
| **5. Lifecycle** | `file-rewind` shadow copies, `persistent-shell` (`agy-exec`), `diagnostic-watchdog-hook`. |

---

## 🔄 SkillOpt: Textual Gradient Descent & Instruction Optimization

Absorbed from Microsoft Research's `microsoft/SkillOpt` (*Text-space Optimization for Frozen LLM Agents*):

1. **Instruction as Trainable State**:
   - Rather than attempting brute-force prompt inflation or fine-tuning model parameters, treat the compact skill document (`SKILL.md`) as the primary trainable state ($S$).
2. **Trajectory-Driven Credit Assignment**:
   - When an agent encounters an execution failure or test regression, analyze the trajectory to isolate the exact instruction clause, missing precondition, or tacit assumption responsible for the error.
   - Prohibit destructive full-file rewrites; perform surgical credit attribution.
3. **Surgical Delta Mutations**:
   - Apply minimal verifiable edits ($\le 50$ lines) to the target instruction text, preserving existing behavioral invariants.
4. **Validation-Gated Updates**:
   - Never commit an instruction change without validating against a split/benchmark or dry-run test suite to prove regression-free improvement.


---

## 🛡️ Autonomous Skill Layer & Sandboxing (Absorbed from `tigerless-labs/autoharness`)

Specifications for agents that dynamically distill, refine, and evolve skills from working sessions:

1. **Self-Authored Partitioning (Write-Boundary Separation)**:
   - Automated skill distillation/learning engines are **strictly barred** from modifying human-authored root rules (`GEMINI.md`, core invariants, or primary curated skills).
   - Dynamically synthesized or evolved skills must reside in an isolated ephemeral partition (`~/.gemini/learned_skills/` or equivalent), preventing machine-generated prompt pollution from corrupting system rules.
2. **Session Provenance Traceability**:
   - Every synthesized skill must carry an immutable provenance header:
     - `origin_session`: Conversation ID or transcript hash where the pattern was proven.
     - `failure_signature`: The exact runtime crash, friction, or test failure that prompted the distillation.
     - `timestamp`: ISO-8601 creation date.
     - `verified_trials`: Number of consecutive clean runs ($k \ge 3$) validating the skill before promotion.
3. **Automated Deduplication & Pruning**:
   - Automatically merge near-duplicate skills operating on the same scenario and prune dormant/unused skills to maintain the anti-sprawl limit ($10 \le \text{active skills} \le 25$).


---

## 🧬 The Two-Level Automated Harness Evolution Framework (Absorbed from Sylph.AI, arXiv:2604.21003)

Formalizes the elimination of the manual "Harness Engineering Bottleneck" via a recursive two-tier optimization architecture:

### 1. Level 1: The Harness Evolution Loop (Task-Specific Optimization)
For any target domain task $T$, optimizes harness configuration $\mathcal{H}$ through an adversarial closed-loop triad:
- **Worker Agent ($W_{\mathcal{H}}$)**: Executes task $T$ under active harness $\mathcal{H}^{(t)}$.
- **Evaluator Agent ($V$)**: Adversarially diagnoses execution traces $\tau^{(t)}$, pinpoints root causes of failures, and assigns calibrated performance scores $D^{(t)}$.
- **Evolution Agent ($E$)**: Ingests historical execution logs $H^{(t)} = \{(\mathcal{H}^{(i)}, \tau^{(i)}, D^{(i)})\}_{i=1}^t$ and synthesizes surgical harness mutations $\mathcal{H}^{(t+1)}$.
- **Convergence Condition**:
  $$\mathcal{H}^* = \arg\max_{\mathcal{H}} \text{Score}(W_{\mathcal{H}}, T)$$

### 2. Level 2: The Meta-Evolution Loop (Cross-Domain Meta-Learning)
Optimizes the evolution blueprint itself across a broad task distribution $\mathcal{T}_{\text{meta}}$:
$$\Lambda = [W_{\mathcal{H}}, \mathcal{H}^{(0)}, V, E]$$
- **Meta-Learning Objective**: Discovers the optimal baseline harness seed $\mathcal{H}^{(0)}$, adversarial evaluation rubrics $V$, and mutation strategies $E$ that minimize steps to convergence on unseen tasks.
- **Rapid Convergence Invariant**: When presented with an arbitrary novel domain $T_{\text{novel}}$, the meta-learned blueprint $\Lambda^{(\text{best})}$ must converge to a production-ready harness in $\le 3$ automated iterations without human prompt engineering.

### 3. Cost & Stability Guardrails
To prevent automated harness evolution from becoming an unbounded token sink:
- **Annealed Mutation Budget ($b_t$)**: Mutation edits are strictly bounded per round to prevent catastrophic drift.
- **Noise-Adjusted Floor**: Candidate harness $\mathcal{H}'$ must beat baseline score by at least the empirical noise margin ($\delta$).
- **Token-ROI Invariant**: Any harness expansion $\Delta C$ must be strictly justified by verified performance lift $\Delta S$.


---

## 🏛️ The 7 Canonical Subsystems of Production Harnesses (Absorbed from Barbaste et al., arXiv:2609.00006)

Empirical source-code study across 11 production coding agents (Claude Code, Codex CLI, Gemini CLI, Mistral Vibe, OpenHands, Aider, Mini-SWE-Agent, Hermes, Pi, OpenCode, OpenClaw) formalizing the fundamental equation:
$$\text{Agent} = \text{Model} + \text{Harness}$$

### The 7 Canonical Subsystems:
1. **The Agent Loop**: Minimalist ReAct execution cycle, deterministic turn lifecycle, stop conditions, and cycle-detection guards. Bypasses bloated frameworks in favor of transparent loops.
2. **LLM Provider Layer**: Token budgeting, model fallback routing, streaming parsers, and prompt payload size constraints.
3. **Tools & Execution Sandbox**: High-precision surgical mutation (`edit_file`), syntax-aware AST validation, safe command execution, and directory confinement.
4. **Memory & Context Management**: Disk-backed state, bounded context windows, progressive disclosure, and Grep-over-Embeddings lexical search.
5. **Safety & Permissions Controls**: Approval gates for destructive actions (Git force push, DB drop), path traversal boundaries, and anti-leak sanitization.
6. **Multi-Agent Orchestration**: Disjoint file ownership, isolated branch sandboxes, context packets, and dependency DAGs.
7. **Extension Surfaces**: Declarative file-based skills (`SKILL.md`) and Model Context Protocol (MCP) tool integration.


---

## 🌙 The Offline Sleep & Synthetic Rehearsal Paradigm (Absorbed from Behrouz et al., Google Research, arXiv:2606.03979)

Biologically-inspired memory consolidation and anti-catastrophic forgetting protocol adapted for agent harness engineering:

### 1. Active (Wake) Phase
- Interactive execution turns addressing user requests.
- Ephemeral state generation (scratch files, temporary execution logs, trial commands).

### 2. Offline (Sleep) Phase: Consolidation & Dreaming Rehearsal
When a long-running session concludes or persistent rules are mutated:
1. **Memory Consolidation**:
   - Upward distillation of short-term interaction traces into long-term system rules or `SKILL.md` workflows via `memory-trimmer` and `harness-distiller`.
   - Purge ephemeral scratch files and deduplicate failure trajectories.
2. **Synthetic Rehearsal Gate (Anti-Catastrophic Forgetting)**:
   - Before promoting new skills or committing system rule updates, run the automated benchmark runner (`bench-runner.js run`).
   - Mathematically verifies that newly consolidated knowledge does not regress or break existing system invariants (100% pass rate requirement).
