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
