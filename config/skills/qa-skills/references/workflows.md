# QA Cross-Stage Testing Workflows
Source: Awesome QA Skills (`testing-workflows`) & [inaodeng.com/en/qaskills/](https://inaodeng.com/en/qaskills/)

A structured guide for executing end-to-end testing workflows and multi-role quality synthesis.

---

## 1. Workflow Catalog

| Workflow | Primary Purpose | Key Activities |
| :--- | :--- | :--- |
| **`discover-testing`** | Pre-execution skill router. | Evaluates request goal & capability layer, selecting exactly 1 primary testing skill (+ at most 1 helper). |
| **`daily-testing-workflow`** | Daily cadence testing routine. | Morning plan alignment, test execution, defect triage & retesting, end-of-day quality sign-off. |
| **`sprint-testing-workflow`** | Iteration / Sprint lifecycle QA. | Sprint planning acceptance criteria review, in-sprint testing, sprint review readiness, retrospective defect analysis. |
| **`release-testing-workflow`** | Pre-release to post-release governance. | Regression scope selection, release sanity, Go/No-Go decision matrix, release notes audit, post-deployment smoke & monitoring. |
| **`multi-role-quality-synthesis`** | Unified quality view across roles. | Consolidates disparate reports from QA, Product, UX, Tech, and Delivery into a single actionable quality executive summary without losing nuances. |

---

## 2. Multi-Role Quality Perspectives

When assessing a feature, system change, or release, evaluate quality through the 5 essential perspectives:

1. **QA Quality Perspective (`qa-quality-perspective`):**
   - Testability of code and architecture.
   - Risk-driven test coverage (happy paths vs boundary vs negative).
   - Defect severity, blast radius, and edge case exposure.
   - Clear criteria for testing completion.

2. **Product Quality Perspective (`product-quality-perspective`):**
   - Business value delivery and user story intent.
   - Acceptance criteria completeness (Given-When-Then clarity).
   - Business rule consistency across user segments.
   - Compliance, billing, and transactional integrity.

3. **UX Quality Perspective (`ux-quality-perspective`):**
   - Information architecture and layout hierarchy.
   - Interaction states (loading, empty, success, error, partially disabled).
   - Responsive behavior across breakpoints (mobile, tablet, desktop).
   - Accessibility (WCAG 2.1 AA, color contrast, keyboard navigable, screen reader labels).

4. **Technical Quality Perspective (`technical-quality-perspective`):**
   - API contract stability and backward compatibility.
   - Database schema migrations, indexing, and transactional boundaries.
   - Observability (structured logging, tracing spans, Prometheus metrics).
   - Error handling, timeouts, retries, and circuit breakers.

5. **Project Delivery Perspective (`project-delivery-perspective`):**
   - Schedule, milestone constraints, and deployment dependencies.
   - Go/No-Go trade-offs and residual risk acceptance.
   - Rollback procedures and feature flag fallback configurations.

---

## 3. Release Go/No-Go Decision Matrix

Evaluate the following criteria before signing off on any production release:

| Gate | Requirement | Status / Action |
| :--- | :--- | :--- |
| **Critical Defects** | Zero unresolved Blockers or P0/P1 bugs. | If open: **NO-GO** unless temporary workaround approved by Stakeholders. |
| **Automated Tests** | 100% pass rate on smoke suite; >98% on regression suite. | Investigate and fix failures before approval. |
| **Performance SLA** | P95 latency and error rate within predefined SLA. | Reject if regression >15% compared to baseline. |
| **Security Scan** | Clean SAST, DAST, and dependency vulnerability scans. | Patch or obtain CVE waiver. |
| **Rollback Plan** | Tested rollback script, database down-migration verified. | Mandatory requirement for **GO**. |
