# GEPA Multi-Objective Pareto Frontier Optimization

> Mathematical reference adapted from Nous Research (`hermes-agent-self-evolution`) and integrated into Google RRSI Gate 4 (Token-ROI Cost Gate).

---

## 1. Core Thesis & Self-Assessment Bias Elimination
When agents evolve their own prompts, skills, or code, they often suffer from **Self-Assessment Bias**—favoring overly verbose instructions or complex abstractions that feel sophisticated but provide negligible accuracy gains while dramatically inflating token costs.

To prevent prompt bloat and runaway execution overhead, mutations must be evaluated across a **Multi-Objective Pareto Frontier** balancing:
1. **Task Performance / Accuracy ($S$)**: Score across empirical benchmarks.
2. **Resource Consumption / Token Tax ($C$)**: Context window tokens and latency.

---

## 2. Pareto Dominance Formulation

Let a proposed prompt, skill, or code mutation be $x'$, compared to the baseline $x$:

### A. Strict Pareto Dominance
A candidate $x'$ dominates $x$ ($x' \succ x$) if and only if:
$$S(x') \ge S(x) \quad \text{and} \quad C(x') \le C(x)$$
with at least one strict inequality.

### B. Regularized Trade-Off Boundary (Gate 4)
When a candidate increases accuracy ($S(x') > S(x)$) but also increases token cost ($C(x') > C(x)$), it is accepted **only** if the marginal benefit exceeds the Pareto exchange threshold:
$$\Delta C \le \beta_0 + \beta_1 \Delta S$$
Where:
* $\Delta S = S(x') - S(x)$ (accuracy improvement).
* $\Delta C = C(x') - C(x)$ (token cost increase).
* $\beta_0, \beta_1$: Regularization parameters penalizing context bloat.

Any candidate where $\Delta C > \beta_0 + \beta_1 \Delta S$ is rejected as **Non-Pareto Inefficient** (Bloat).

---

## 3. Operational Rules for Antigravity Mutations
1. **No Free Token Expansion**: Adding new instructions, examples, or validation steps must yield a statistically verifiable lift in task success.
2. **Offline Trace Verification**: Never evaluate a prompt mutation within the same conversational turn that generated it. Verify independently against clean baseline logs.
3. **Pareto Pruning**: Periodically prune dormant prompt instructions that do not sit on the Pareto-optimal frontier.
