# QA Wiki & Testing Terminology Glossary
Source: [inaodeng.com/en/wiki/](https://inaodeng.com/en/wiki/) & Awesome QA Skills Knowledge Base

A comprehensive dictionary and reference of software testing concepts, methodologies, test levels, and quality assurance principles.

---

## 1. Test Levels & Testing Types

- **Unit Testing:** Testing isolated functions, classes, or modules independently of external dependencies, usually using mocks and stubs.
- **Integration Testing:** Verifying communication, data exchange, and contracts between multiple collaborating components, databases, or third-party services.
- **System Testing:** Testing the fully integrated application as a whole against specified business and functional requirements.
- **End-to-End (E2E) Testing:** Testing real user workflows from start to finish across browser/mobile client, backend APIs, and data layers.
- **Regression Testing:** Re-running test suites or selected risk-focused tests to ensure new code changes or bug fixes did not break existing behavior.
- **Smoke / Sanity Testing:** High-level subset of tests verifying core application health before proceeding with detailed testing or deployment.
- **Exploratory Testing:** Simultaneous learning, test design, and test execution guided by charters, heuristics, and tester intuition.
- **Accessibility Testing (a11y):** Evaluating software against WCAG (Web Content Accessibility Guidelines), keyboard navigation, ARIA, and assistive technology requirements.

---

## 2. Test Design Techniques & Heuristics

- **Equivalence Partitioning (EP):** Dividing input domains into classes where software is expected to behave identically; testing representative valid and invalid partitions.
- **Boundary Value Analysis (BVA):** Testing extreme edges of input ranges: minimum, just above minimum, nominal, just below maximum, maximum, and off-boundary values.
- **Decision Table Testing:** Tabulating combinations of logical conditions (inputs) and corresponding actions (outputs) to test complex business rules systematically.
- **State Transition Testing:** Modeling system states, events/triggers, transitions, and guard conditions, verifying both valid paths and invalid state attempts.
- **Pairwise / Combinatorial Testing:** Covering all possible discrete parameter pairs or n-way interactions to maximize combinatorial coverage while preventing test suite explosion.
- **Property-Based Testing (PBT):** Specifying invariant properties that must hold true for all generated inputs (e.g. idempotency, reversibility, commutativity).
- **Metamorphic Testing:** Verifying metamorphic relations across transformed inputs when an exact test oracle is unavailable or ambiguous.

---

## 3. Test Doubles & Isolation

- **Dummy:** Objects passed around but never actually used (e.g., filling parameter lists).
- **Stub:** Objects providing predefined, canned answers to calls made during the test.
- **Spy:** Stubs that also record information about how they were called (arguments, call counts).
- **Mock:** Objects pre-programmed with expectations about which calls they should receive; test verification fails if expectations are not met.
- **Fake:** Working implementations with shortcuts making them unsuitable for production (e.g. in-memory SQLite database instead of PostgreSQL).

---

## 4. Advanced Quality Engineering Concepts

- **Flaky Test:** A test that exhibits both passing and failing results without code changes; commonly caused by race conditions, network variance, unseeded randomness, or timezone bugs.
- **Mutation Testing:** Introducing deliberate faults ("mutants") into source code to verify whether existing test suites catch ("kill") them, measuring test suite quality beyond line coverage.
- **Quality Gates:** Objective criteria (unit coverage threshold, zero critical bugs, security scan pass, latency P95 < SLA) required before promoting code between deployment environments.
- **Shift-Left Quality:** Moving testing and quality practices earlier into the development lifecycle (requirements review, architecture testability, API contract design).
- **Shift-Right Quality:** Testing and monitoring in production environments through canary releases, feature flags, distributed tracing, and synthetic monitors.
- **Chaos Engineering:** Intentionally injecting faults (latency, packet loss, killed instances, partitioned databases) into production-like environments to prove system resilience.
