# Agent Optimization Levers & Evidence Rubric

> **Origin & Attribution**: Distilled and absorbed from Microsoft Research's **Agent Lightning** (`microsoft/agent-lightning`) under the Antigravity Autonomous Engineering System (§8 External Proposal Protocol).

This reference provides a structured action space, empirical evidence interpretation rubric, and trade-off matrix for optimizing AI agents against benchmarks without mutating their deployment contract.

---

## 1. Core Principles of Agent Optimization

1. **Frontier Shift over Architecture Complexity**:
   The objective of agent optimization is not adopting the most complex architecture, but shifting the Pareto frontier across four interacting dimensions: **Accuracy**, **Cost**, **Latency**, and **Reliability**.

2. **Development Budget vs. Deployed Cost**:
   - **Development Budget**: Resources spent during search, evaluation, and calibration (creating room to explore and learn).
   - **Deployed Cost**: Per-run inference and execution expense on live tasks.
   A higher development budget must NOT translate into higher per-task operational costs for the deployed agent.

3. **Evidence-Based Termination**:
   An optimization cycle is complete when measured changes no longer yield Pareto improvements within the remaining evaluation budget, not simply when the first plausible candidate succeeds.

---

## 2. The 12-Lever Action Space Matrix

| Lever | Target Surface | Trigger / Useful Signal | Main Trade-off & Risk |
|---|---|---|---|
| **1. Input Grounding** | Context & state visible to model | Relevant deployment-visible context or tool output is missing | Longer context can dilute attention or increase token cost |
| **2. Output Contract** | Schema, serialization, types, file layout | Agent work is logical but rejected by consumer or parser | Risk of overfitting to specific evaluator quirks |
| **3. Prompt Engineering** | Priorities, behavioral invariants, constraints | Instructions are ignored, misunderstood, or hallucinated | Brittle gains; prompt drift across model upgrades |
| **4. Deterministic Tools** | Code execution, calculations, static checks | Model approximates work that deterministic code executes reliably | Code maintenance overhead and new external failure modes |
| **5. Model Selection** | Base model tier and cognitive capabilities | Primary model lacks prerequisite reasoning capacity | Cost, latency, and rate-limit constraints |
| **6. Reasoning Effort** | Extended thinking token allocation | Grounded edge cases remain unsolved despite correct inputs | Cost and latency grow nonlinearly |
| **7. Failure Isolation** | Sandbox boundaries, process separation | Individual task failures crash the pipeline or poison state | Isolation prevents contamination but does not fix the failed task |
| **8. Conditional Repair** | Target retry informed by failure evidence | Deployment-visible assertion or linter exposes a recoverable flaw | Additional token cost and potential regression loops |
| **9. Task Routing** | Dispatching by complexity or domain | Predictable variance in task difficulty or failure risk | Router misclassification risk and operational complexity |
| **10. Planning & Interaction** | Multi-step DAG, tool order, review gates | Long-horizon tasks lose track of subgoals or drift | Excess state tracking and control-flow latency overhead |
| **11. Retrieval (RAG)** | External index and knowledge injection | Factual accuracy depends on external dynamic corpus | Retrieval noise, stale vectors, and query latency |
| **12. Critique & Selection** | Self-refinement, multi-candidate voting | Diverse independent attempts surface complementary signals | Multiplies inference calls, latency, and cost |

---

## 3. Evidence-Reading & Diagnostic Rubric

Interpreting evaluation traces requires distinguishing signal types:

### A. Deterministic vs. Stochastic Failure Signals
- **Deterministic Signals** (Exceptions, exit codes, schema validation failures, timeouts):
  Objective, repeatable signals that warrant deterministic checks or programmatic recovery loops.
- **Stochastic / Semantic Signals** (Plausible prose that is factually wrong):
  Retrying with identical context repeats the identical error. Requires grounding with net-new information, tool verification, or structural prompt constraints.

### B. Shared Blindness vs. Diverse Failures
- **Shared Blindness**: All candidate runs fail at the same step. Indicates an upstream contract mismatch, missing tool, or context absence. Routing or voting will NOT solve this.
- **Diverse Failures**: Different attempts fail in varied, uncorrelated ways. Indicates that critique, ensemble voting, or multi-sample selection ($\text{pass}@k$) will yield Pareto gains.

### C. Lever Interactions
- Reasoning effort cannot compensate for absent input grounding.
- Conditional repair cannot fix systematic schema violations without net-new error feedback in the retry prompt.
- Global model escalation across all tasks is inefficient compared to conditional escalation triggered by deterministic gates.

---

## 4. Invariant Boundaries

1. **Preserve External Contracts**: Any optimization must maintain existing CLI, API, or function signatures.
2. **Zero Benchmark Leakage**: Never expose held-out ground truth, test-set labels, or synthetic evaluation answers to the deployed execution path.
3. **Immutable Scorer**: Treat test harnesses and validation rubrics as immutable external evaluators.
