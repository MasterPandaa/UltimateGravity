# Web-Bench Absorption & Local Agent Regression Framework

This reference formalizes the adaptation of three pioneering web evaluation methodologies into Antigravity's local evaluation harness:
1. **ByteDance Web-Bench** (arXiv:2505.07473): Sequential state dependency ($N \to N+1$).
2. **TIGER-AI-Lab WebsiteBench** (OpenReview): Dual-gate verification (Visual SSIM + Semantic DOM).
3. **Halluminate WebBench**: Action taxonomy & real-world friction matrix (READ, CRUD, Resilience).

---

## 1. Architectural Principles

### A. Sequential State Accumulation (ByteDance)
Traditional single-turn evaluations fail to capture multi-file drift and accumulated refactor breaks.
- **Contract:** A test case consists of $N$ dependent sequential steps.
- **Rule:** Step $K$ must satisfy its own assertions while maintaining 100% compliance with non-regression contracts from Step $1 \dots K-1$.
- **Metric:** Sequential pass consistency:
  $$\text{pass}^K = \prod_{i=1}^K \mathbb{I}(\text{Step}_i \text{ passes without breaking Steps } 1 \dots i-1)$$

### B. Dual-Gate Verification (TIGER-AI-Lab)
Prevents the **Visual-Structural Gap** where generated code appears correct visually but lacks semantic integrity or state robustness.
- **Gate 1 (Structural & Functional):**
  - Schema validity (Zod/Pydantic).
  - TypeScript compiler integrity (`tsc --noEmit`).
  - Accessibility & semantic tags (`<nav>`, `<main>`, `aria-*`).
- **Gate 2 (Visual Fidelity):**
  - Playwright automated headless screenshots.
  - Normalized SSIM (Structural Similarity Index) comparison against baseline mockups:
    $$\text{SSIM}(x, y) \ge 0.98$$

### C. Action Taxonomy & Resilience (Halluminate)
Classifies web and autonomous agent interactions into three distinct failure surfaces:
- **`READ`**: Idempotent data extraction, robust against dynamic DOM hydration.
- **`CRUD / MUTATION`**: State mutations with mandatory pre-action interstitial dismissal (modals, overlays).
- **`FRICTION_RESILIENCE`**: Handling stale elements, rate limits, and strict anti-bot boundaries (zero CAPTCHA bypass).

---

## 2. CLI Execution Standard

The benchmark runner is located at `~/.gemini/scripts/bench-runner.js`:

```bash
# Run all benchmark suites
node ~/.gemini/scripts/bench-runner.js run

# Run specific suite with k=3 trials
node ~/.gemini/scripts/bench-runner.js run --suite code-sequential --k 3

# View historical regression scorecard
node ~/.gemini/scripts/bench-runner.js scorecard

# Run Stage 1 static token hygiene audit
node ~/.gemini/scripts/bench-runner.js audit
```

---

## 3. Suite Organization

All evaluation datasets reside in `~/.gemini/benchmarks/`:
- `core-rules.jsonl`: System invariants, token ceilings, Quad-Role alignment, and script syntax integrity.
- `code-sequential.jsonl`: Sequential full-stack dependency workflows and state accumulation.
- `browser-resilience.jsonl`: Browser action taxonomy, interstitial handling, and dual-gate checks.
