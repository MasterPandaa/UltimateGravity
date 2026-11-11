# Autonomous Ratchet Loop Protocol

> Adapted from Andrej Karpathy's `autoresearch` framework (`karpathy/autoresearch`). Generalizes the autonomous overnight research loop for software engineering, query tuning, bundle optimization, and test-driven refactoring.

---

## 1. The Core Paradigm: Human as Engineering Director
Instead of micromanaging each code edit, the developer acts as **Engineering Director**:
* Define direction, boundaries, and invariants in a steering document (`program.md`, `strategy.md`, or the task prompt).
* Let the autonomous agent loop through iterative hypotheses against a single objective scalar metric.

---

## 2. The 4-Step Autonomous Ratchet Loop

```
  ┌────────────────────────────────────────────────────────┐
  │ 1. Steering & Hypothesis (program.md)                  │
  └───────────────────────────┬────────────────────────────┘
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │ 2. Surgical Mutation (Atomic Code / Query Edit)        │
  └───────────────────────────┬────────────────────────────┘
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │ 3. Bounded Evaluation (Strict Timebox & Scalar Metric) │
  └───────────────────────────┬────────────────────────────┘
                              ▼
                Metric Improved & Tests Pass?
               /                             \
        [ YES ]                               [ NO / CRASH ]
          ▼                                         ▼
  ┌───────────────────────┐               ┌────────────────────────┐
  │ 4A. Ratchet Forward   │               │ 4B. Hard Revert        │
  │     (git commit)      │               │     (step-checkpoint / │
  └───────────┬───────────┘               │      git revert)       │
              │                           └───────────┬────────────┘
              └───────────────►◄──────────────────────┘
                              │
                    Next Hypothesis Loop
```

### Step 1: Hypothesis Formulation
* Identify a single, measurable bottleneck (e.g. SQL slow query, React render cascade, bundle size bloat).
* Formulate an atomic change addressing the root cause (no speculative bundling of multiple unrelated edits).

### Step 2: Surgical Mutation
* Apply targeted edits strictly adhering to `karpathy-guidelines` (minimum necessary lines, no unrequested abstractions).

### Step 3: Bounded Evaluation & Objective Scalar Metric
* Run an automated benchmark under a strict wall-clock timeout (e.g., 30–120 seconds).
* Evaluate against an objective scalar metric $M$:
  - **Latency / Execution Time**: Lower is better ($M_{\text{new}} < M_{\text{baseline}}$).
  - **Memory / Allocations**: Lower is better ($M_{\text{new}} \le M_{\text{baseline}}$).
  - **Test Pass Rate**: Higher is better (must remain 100% pass).
  - **Bundle Size**: Lower is better ($KB_{\text{new}} < KB_{\text{baseline}}$).

### Step 4: The Ratchet Gate (Binary Decision)
* **Ratchet Forward (Keep)**: If all regression tests pass AND the scalar metric strictly improves:
  - Create a clean git commit with quantitative evidence in the commit message.
  - Update the baseline: $M_{\text{baseline}} \leftarrow M_{\text{new}}$.
* **Hard Revert (Discard)**: If tests fail, syntax errors occur, or the metric does not improve:
  - Immediately revert workspace to the last clean checkpoint (`step-checkpoint` or `git checkout -- .`).
  - Never keep "partially working" code or accumulate speculative regressions across turns.

---

## 3. Operational Guardrails
1. **Safety Floor**: Weakening assertions or disabling tests to improve the metric is strictly forbidden.
2. **Iteration Ceiling**: Autonomous loops must be bounded (default: max 5–10 iterations) to avoid runaway token consumption.
3. **Evidence Log**: Record each iteration's hypothesis, diff, and metric delta in a compact markdown table.
