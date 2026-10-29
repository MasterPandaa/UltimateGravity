---
name: eval-harness
description: "[Evaluation-Driven Development Harness] Code-based and model-based grading pipelines, pass@k metrics, and prompt/output regression suites. DO NOT USE for manual exploratory browser QA (use playwright-cli or chrome-devtools)."
---

# Eval Harness (Evaluation-Driven Development)

The formal testing and evaluation suite for AI-assisted workflows. Eval Harness treats evaluations as quantitative unit tests for LLMs and agentic systems, enabling empirical tracking of capabilities, regressions, and stochastic stability.

---

## Non-Negotiable Core Rules & Metric Standards

### 1. The Tri-Layer Grading Hierarchy
Every evaluation harness must support three complementary grading layers:
1. **Deterministic Code-Based Grading**: Fast, unyielding assertions (JSON schema validation, regex matching, AST parsing, exit codes). Must always run first.
2. **Probabilistic Model-Based Grading (LLM-as-a-Judge)**: Rubric-based scoring for nuanced criteria (reasoning coherence, tone, safety, semantic accuracy). Must use a higher-tier or independent judge model with few-shot calibrations.
3. **Human-in-the-Loop (HITL) Spot Checks**: Calibrated random sample audits to measure and maintain judge alignment.

### 2. Standard Reliability Metrics
Do not rely on a single run to validate stochastic agent behavior. Report standard pass metrics:
- **$\text{pass}@k$**: The probability that at least 1 of $k$ generated attempts passes the evaluation suite.
- **$\text{pass}^k$ (All-Pass)**: The probability that all $k$ consecutive runs pass (strict reliability threshold for mission-critical automation).

### 3. Regularized Recursive Improvement (RRSI Principles)
When running iterative experiment loops or self-improving prompt/harness cycles:
- **Pre-Evaluation Leakage Critic**: Screen candidate diffs *prior to evaluation* to block task-specific cheating, hardcoded benchmark values, and inert machinery.
- **Noise-Adjusted Floor**: Discard apparent gains within stochastic noise: candidate score $S'$ must satisfy $S' \ge S^* - \delta$, where $\delta$ is the empirical noise band.
- **Token-ROI Cost Rule**: Relative token growth ($\Delta C$) must be justified by measured score gain ($\Delta S$): $\Delta C \le \beta_0 + \beta_1 \Delta S$.
- **Annealed Edit Budget ($b_t$)**: Bound independent edits per round using cosine annealing, transitioning from coordinated multi-edits to sparse attributable changes ($b_{\min}=1$).

---

## Operating Modes

| Mode | Domain | Primary Focus | Methodology |
|---|---|---|---|
| **Mode 1: Eval Spec Authoring** | Benchmark creation | Define test cases, input fixtures, target outputs, and grading rubrics. | JSON Lines dataset (`evals.jsonl`) |
| **Mode 2: Deterministic Runner & Scoring** | Test suite execution | Run agent pipeline across $N$ trials, record traces, compute pass rates. | Automated batch runner script |
| **Mode 3: LLM Judge Calibration** | Model-based evaluation | Evaluate semantic quality using structured 1–5 rubrics with rationale output. | Multi-dimensional scoring rubrics |
| **Mode 4: Regression & Diff Analysis** | Performance change tracking | Compare baseline vs candidate model runs, flag degraded prompts or tools. | Scorecard diff & win/loss matrix |
| **Mode 5: Autonomous Experiment & Hypothesis Loop** | Empirical research & optimization | Run multi-round automated experiment loops, record traces, refine hypotheses ([`autonomous-hypothesis-benchmarking.md`](references/autonomous-hypothesis-benchmarking.md)). | Prompt tuning sweeps, model regression benchmarking. |

---

## Eval Dataset & Rubric Specification

### 1. Test Case Schema (`evals.jsonl`)
```json
{
  "id": "eval-auth-001",
  "category": "security_sanitization",
  "prompt": "Create an endpoint handler for password reset tokens.",
  "expected_patterns": ["crypto.randomBytes", "hash", "expiresAt"],
  "forbidden_patterns": ["Math.random", "password.*in.*log"],
  "deterministic_assertions": [
    "response.status == 200",
    "token_entropy_bits >= 128"
  ],
  "judge_rubric": {
    "security_rigor": "Does the code properly invalidate previous tokens upon issuance?",
    "error_handling": "Are database errors caught without leaking stack traces?"
  }
}
```

### 2. Eval Runner Implementation Pattern
```python
# scripts/run_eval.py
import json, statistics

def evaluate_trial(case, output):
    # Layer 1: Code-based check
    for forbidden in case.get("forbidden_patterns", []):
        if forbidden in output:
            return {"passed": False, "reason": f"Violated forbidden pattern: {forbidden}"}
    
    for expected in case.get("expected_patterns", []):
        if expected not in output:
            return {"passed": False, "reason": f"Missing required pattern: {expected}"}
            
    return {"passed": True, "score": 1.0}
```

### 3. Reporting Scorecard
```markdown
## 📊 Eval Scorecard: Prompt v2.1 vs Baseline
- **Total Test Cases**: 50
- **Trials per Case (k)**: 3
- **Pass@1**: 84.0% (+6.2% vs Baseline)
- **Pass@3**: 96.0% (+2.0% vs Baseline)
- **Pass^3 (Strict Consistency)**: 74.0% (+12.0% vs Baseline)
- **Regressions**: 1 case failed previously passing checks (eval-auth-008)
```
