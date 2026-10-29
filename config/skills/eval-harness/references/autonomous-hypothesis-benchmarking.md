# Autonomous Hypothesis Testing & Benchmark Loop

Governs the execution of iterative experiment loops, automated benchmark sweeps, and empirical hypothesis verification for autonomous agents.

---

## 1. The 4-Stage Autonomous Experiment Loop

```
[1. Formulate Hypothesis]
         │
         ▼
[2. Provision Workspace & Run Benchmark]
         │
         ▼
[3. Score & Extract Traces]
         │
         ▼
[4. Refine Hypothesis & Record Findings]
```

### Stage 1: Formulate Concrete Hypothesis
- Explicit statement of expected delta: *"Replacing dynamic string concatenation with AST parameterization will reduce SQL injection vulnerabilities from 12% to 0% with <= 5ms latency overhead."*
- Define independent variable (prompt change, model tier, tool schema) and dependent variable (pass@k, latency, token spend).

### Stage 2: Provision Workspace & Run Benchmark
- Scaffold an isolated run directory (e.g., `scratch/experiments/exp_YYYYMMDD_HHMM/`).
- Fix random seeds and temperature to minimize stochastic noise.
- Execute test runner across $N$ iterations ($N \ge 5$).

### Stage 3: Score & Extract Traces
- Run deterministic assertions first (exit codes, schema checks).
- Run calibrated model judge on remaining semantic criteria.
- Aggregate pass@k and token expenditure metrics into `experiment_results.json`.

### Stage 4: Refine & Conclude
- If hypothesis passes: establish candidate prompt/code as the new baseline.
- If hypothesis fails: log negative result, extract failure patterns, and formulate refined test condition.


---

## 2. Regularized Selection & Optimization (RRSI Formulation)

To prevent catastrophic overfitting, noise chasing, and token explosion during autonomous experiment loops:

### A. Pre-Evaluation Leakage Screen
Before executing benchmark runners, screen candidate diffs against:
1. **Deterministic Denylist**: Grader paths, test-case IDs, hidden assertion strings, credentials, or magic constants.
2. **Intent Review**: Disqualify changes that only make sense for the current test cases rather than general engineering rules. Reject inert machinery that adds uncalled or dead code.

### B. Mathematical Selection Gate Formulation
For candidate $H'$ with score $S'$ and relative token cost change $\Delta C = (C' - C_t) / C_t$:
- Score delta: $\Delta S = S' - S_t$
- **True Gain ($\Delta S > \delta$)**: Admissible only if token growth stays within budget:
  $$\Delta C \le \beta_0 + \beta_1 \Delta S$$
- **Inside Noise Band ($|\Delta S| \le \delta$)**: Admissible only if it improves efficiency or introduces verified structural mechanisms:
  $$w_s \Delta S - w_c \Delta C + w_n \nu(l') > 0$$
- **Noise-Adjusted Floor**: Candidate must satisfy:
  $$S' \ge S^* - \delta$$
  where $S^*$ is the best incumbent score and $\delta$ is the empirical noise band.
- **Annealed L0 Edit Budget**:
  $$b_t = \left\lceil b_{\min} + (b_{\max} - b_{\min}) \cdot \frac{1}{2} \left(1 + \cos\left(\frac{\pi t}{T}\right)\right) \right\rceil$$
  Anneals from coordinated exploration ($b_{\max}$) to sparse attributable edits ($b_{\min} = 1$).
