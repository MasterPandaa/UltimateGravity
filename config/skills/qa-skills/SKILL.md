---
name: qa-skills
description: "[QA Strategy & Test Heuristics Matrix] Comprehensive testing heuristics (Boundary Value Analysis, Equivalence Partitioning, Decision Tables, test matrices, and Go/No-Go release gating). DO NOT USE for executing live headless browser runs (use playwright-cli) or runtime bug root-cause loops (use diagnosing-bugs)."
---

# 🛡️ QA Skills: Software Quality Engineering & Testing Suite

A unified, production-grade Quality Assurance and Testing knowledge and execution suite based on **Awesome QA Skills**, **Nao Deng's QA Skill Library**, the **QA Wiki glossary**, and the **Test Automation Guild**.

---

## 🧭 Capabilities & Layer Structure

The suite organizes software quality engineering across **4 Capability Layers** and **Cross-Stage Workflows**:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   Cross-Stage Testing Workflows                        │
│   discover-testing · daily-testing-workflow · sprint-testing-workflow │
│   release-testing-workflow · multi-role-quality-synthesis              │
└────────────────────────────────────────────────────────────────────────┘
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       ▼                            ▼                            ▼
┌──────────────┐             ┌──────────────┐             ┌──────────────┐
│   Core QA    │             │ Engineering  │             │  Production  │
│    Skills    │             │  QA Skills   │             │   Quality    │
└──────────────┘             └──────────────┘             └──────────────┘
                                    │
                                    ▼
                             ┌──────────────┐
                             │  AI Native   │
                             │  QA Skills   │
                             └──────────────┘
```

1. **Cross-Stage Workflows:** End-to-end orchestration across requirements discovery, daily testing routines, sprint iterations, and release Go/No-Go gates.
2. **Core QA Skills:** Requirements analysis, test strategy, test case generation, test case reviews, and formal heuristics (BVA, Equivalence Partitioning, Decision Tables, Pairwise, State Transitions).
3. **Engineering QA Skills:** API testing (contracts, idempotency, rate limits), UI automation (Playwright, Cypress), performance engineering (k6, Gatling, JMeter), security, and CI integration.
4. **Production Quality Skills:** Release verification, synthetic monitoring, distributed tracing, metrics anomaly analysis, and incident root cause analysis.
5. **AI Native QA Skills:** Testing AI-enabled features, LLM evaluations, RAG pipelines, prompt injection / safety boundaries, and Autonomous Agent verification (tool use, loops, memory, recovery).

---

## 🚀 When & How to Use (Trigger Guidelines)

Activate this skill whenever the user or task involves:
- **Writing, reviewing, or improving test cases:** Unit, integration, E2E, manual, or automated tests.
- **Designing test strategies or quality plans:** From PRDs, user stories, or architecture specs.
- **API testing:** REST, GraphQL, or gRPC contract testing, error contracts, idempotency, or pagination.
- **UI & Browser test automation:** Playwright, Cypress, Selenium, or WebdriverIO.
- **Performance & Load testing:** Workload modeling, stress/spike testing with k6, Gatling, or JMeter.
- **Security & Reliability:** Auth/authz testing, rate limiting, SQL/XSS/injection testing, fault injection.
- **Testing AI / LLM / Agent systems:** RAG fidelity, hallucination evaluation, prompt injection, agent loops, agent tool call assertions.
- **Release governance:** Go/No-Go sign-offs, defect triage, regression test selection, release checklists.

---

## 🗂️ Reference Map & Progressive Disclosure

When deeper domain specifics, templates, or checklists are required, read the matching reference file:

- **[Catalog & Inventory](references/skills-index_EN.md):** Complete catalog of all 164 individual skills with canonical IDs.
- **[Composition Routes](references/skills-composition_EN.md):** Pre-mapped combinations pairing 1 primary skill with at most 1 helper.
- **[Cross-Stage Workflows](references/workflows.md):** Daily, sprint, and release workflows, Go/No-Go decision matrix, and 5 quality perspectives (QA, Product, UX, Tech, Delivery).
- **[Core QA Test Design](references/core-qa-design.md):** Formal testing techniques (2/3-value BVA, Equivalence Partitioning, Decision Tables, Pairwise, State Machines).
- **[Test Automation Guild](references/automation-guild.md):** Architecture guides for Playwright, Cypress, REST Assured, pytest, k6, Gatling, and CI/CD pipelines.
- **[QA Wiki Glossary](references/qa-wiki-glossary.md):** Comprehensive definitions of testing types, test pyramids, test doubles, flaky tests, and quality gates.
- **[AI Native QA & Agent Testing](references/ai-native-qa.md):** In-depth testing guides for LLMs, RAG systems, prompt injections, and autonomous agents.
- **[Detailed Prompt & Template Library](library/):** Complete library of canonical prompts, output templates, and evals under `library/en/` and `library/zh/`.

---

## 📋 Execution Protocol & Quality Bar

When producing testing outputs (test plans, cases, automation scripts, or reviews), always adhere to:

1. **Evidence-Based & Traceable:** Map every test case to a specific requirement, acceptance criterion, or risk.
2. **Clear Preconditions & Exact Expected Results:** State initial state, exact input data, and unambiguous expected assertions (status codes, state changes, UI elements).
3. **Balanced Coverage (Happy + Boundary + Negative):** Never output only happy-path scenarios. Always include edge cases, boundary values, and error-handling conditions.
4. **Actionable Automation:** Provide runnable, self-contained automation code (e.g., Playwright or pytest scripts) that avoids brittle locators and hardcoded sleeps.
5. **Human-in-the-Loop Clarity:** When evaluating release readiness, clearly distinguish between blocker defects, acceptable risks, and human-decision items.
6. **Universal Anti-Anchor Bias & Stale QA Invalidation**: Legacy test cases, past green reports, and existing automated test scripts are **STRICTLY PROHIBITED** from being treated as "ground truth". Requirements change, code evolves, and dependencies shift over time. An old test passing often merely means it is testing defunct invariants or completely missing newly introduced regressions in touched surfaces. Always re-verify current requirements, query the change impact surface (via Graphify/dependency tree), invalidate stale test scripts, and write new assertions reflecting modern expectations. Never certify a release based on obsolete green suites.
7. **Live Browser Visual & Console Gate (UI Testing)**: For frontend surfaces, headless compiler or unit tests passing is NOT sufficient. The tester must verify live browser rendering, inspect console logs for React hydration errors (e.g. `<button>` inside `<Link>`), and assert that all 4 UI states (loading, empty, error, success) render properly without layout shifts.
