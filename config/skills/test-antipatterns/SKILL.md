---
name: test-antipatterns
description: "[Test Smells & Flakiness Purger] Detects and fixes testing anti-patterns including flaky tests, assertion roulette, overmocking, and brittle over-specification across Jest, Vitest, Pytest, and Go."
allowed-tools: run_command, read_file, edit_file
tags: [qa, testing, antipatterns, flaky-tests, quality, refactoring]
---

# Test Anti-Pattern Detection & Remediation

Identifies and surgically eliminates brittle, flaky, slow, or tightly-coupled test code across unit, integration, and E2E suites.

> 📖 **Full Catalog & Code Recipes**: [antipattern-catalog.md](references/antipattern-catalog.md)

---

## 1. The 4-Step Remediation SOP

1. **Framework & Smells Probing**:
   - Detect runner (`jest`, `vitest`, `pytest`, `go test`) via project manifests.
   - Scan for anti-pattern markers:
     - *Flaky Timing*: `sleep`, `setTimeout`, `time.Sleep` $\longrightarrow$ replace with event polling / condition waiting.
     - *Focus Leaks*: `.only(`, `fit(`, `fdescribe` $\longrightarrow$ strip focused test flags before commit.
     - *State Bleed*: mutable state in `beforeAll` / module-level variables $\longrightarrow$ isolate fixtures per test case.
     - *Over-Mocking*: mocking internal private classes or third-party libraries $\longrightarrow$ mock only external I/O boundaries.
2. **Consult Anti-Pattern Reference**:
   - Map discovered test smells to specific categories in [antipattern-catalog.md](references/antipattern-catalog.md):
     - *Category 1*: Brittle Tests (Implementation detail testing, brittle locators, fragile assertions).
     - *Category 2*: Flaky Tests (Timing assumptions, non-deterministic input, shared mutable state).
     - *Category 3*: Slow Tests (Excessive setup, redundant DB seeders, unmocked network).
     - *Category 4*: Low-Value Tests (Assertion roulette, test duplication, tautological tests).
     - *Category 5*: Mocking Anti-Patterns (Mocking what you don't own, mock return value coupling).
3. **Surgical Refactoring Contract**:
   - Test observable behavior, never internal implementation state.
   - Every assertion failure must produce a distinct, actionable error message.
   - Never weaken or delete test assertions simply to make failing tests pass.
4. **Deterministic Green Verification**:
   - Run the updated test suite $\ge 3$ consecutive times to prove zero stochastic flakiness.
