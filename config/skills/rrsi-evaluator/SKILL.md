---
name: rrsi-evaluator
description: "[Google RRSI & MaD-RSI Regularizer] 5-Gate mathematical filter and cross-model failure matrix for self-improving agents (L0 budget, leakage critic, safety floor, token-ROI, and multi-model invariant)."
---

# Google RRSI & MaD-RSI Regularizer Engine

Mathematical control plane for Recursive Self-Improvement in Antigravity 2.0 (Google RRSI + MaD-RSI arXiv:2610.28201). Prevents prompt drift, benchmark gaming, and single-model overfitting across heterogeneous LLMs.

---

## 1. The 5 Non-Negotiable Gates
1. **$L_0$ Edit Budget Gate**: Bounds line changes ($\le 60$ lines for new skills, $\le 20$ lines for diffs).
2. **Pre-Evaluation Leakage Critic**: Blocks test mocks, auth bypasses, and inert no-op machinery.
3. **Noise-Adjusted Safety Floor Gate**: Rejects regressions where $S' < S^* - \delta$ ($\delta = 0.05$).
4. **Token-ROI Cost Gate**: Rejects token growth where $\Delta C > \beta_0 + \beta_1 \Delta S$.
5. **Cross-Model Invariant Gate (MaD-RSI)**: Blocks proprietary model tags and single-model overfitting.

---

## 2. CLI Workflow

### A. Run Full 5-Gate RRSI + MaD-RSI Evaluation
```bash
node C:\Users\Luthfi\.gemini\scripts\rrsi-evaluator.js evaluate --candidate "<path-to-skill>" [--baseline "<path>"] [--score <float>] [--base-score <float>]
```

### B. Screen Cross-Model Neutrality
```bash
node C:\Users\Luthfi\.gemini\scripts\rrsi-evaluator.js verify-cross-model "<path-to-skill>"
```

### C. Log & Diagnose Multi-Model Failure Matrix
```bash
node C:\Users\Luthfi\.gemini\scripts\rrsi-evaluator.js record-failure --model <model> --task <task> --error "<sig>"
node C:\Users\Luthfi\.gemini\scripts\rrsi-evaluator.js failure-matrix
```

---

## 3. Evidence & Acceptance Gate
- All 5 gates must report `✅`.
- Universal harness defects (multimodel agreement $\ge 2$) take priority over model-specific quirks.
