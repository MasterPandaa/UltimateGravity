# Code Review Checklist & Quality Rubric

Run before delivering Deep-mode changes. For Lean-mode, sections A and portions of D are sufficient.

## Table of Contents
- [A. Correctness](#a-correctness)
- [B. Readability & Consistency](#b-readability--consistency)
- [C. Frontend-Specific](#c-frontend-specific)
- [D. Backend-Specific](#d-backend-specific)
- [E. Handoff & Delivery](#e-handoff--delivery)
- [Rapid Quality Rubric (1–5)](#rapid-quality-rubric-15)
- [F. 6-Dimensional Technical Debt Audit](#f-6-dimensional-technical-debt-audit-anthropic-framework)
- [G. Pre-Flight Protocol & Rollback Triggers](#g-pre-flight-protocol--rollback-triggers-anthropic-deploy-checklist)

---

## A. Correctness
- [ ] Happy path verified end-to-end; traced or executed.
- [ ] Failure paths considered (invalid inputs, network timeouts, dependency drops).
- [ ] Boundary conditions verified: empty collections, null/undefined, zero, numeric extremes, time zones.
- [ ] No missing or unused imports, variables, or functions.
- [ ] Types and identifiers match consistently across layers (frontend to API to database).
- [ ] Race conditions and idempotent execution verified for repeatable actions.

## B. Readability & Consistency
- [ ] Identifiers clearly reflect intent and follow established conventions.
- [ ] Functions and components adhere to single-responsibility principle.
- [ ] No magic numbers or copy-pasted abstractions.
- [ ] Comments document the "why", not the obvious "what".
- [ ] Formatting matches surrounding codebase (indentation, semicolons, quotes).
- [ ] Changes are scoped strictly to requested boundaries; unrelated issues are noted, not silently edited.

## C. Frontend-Specific
- [ ] Loading, Empty, Error, and Success states fully handled.
- [ ] Semantic elements, visible focus indicators, keyboard navigation, accessible labels.
- [ ] Layout resilient on narrow viewports and under long alphanumeric strings.
- [ ] Colors, typography, and spacing consumed from design tokens, not raw literals.
- [ ] Destructive actions confirmed; double-submission prevented on forms.
- [ ] `prefers-reduced-motion` and WCAG contrast verified.

## D. Backend-Specific
- [ ] Inputs validated strictly at boundaries; parameterized queries exclusively.
- [ ] Authorization asserted per resource on the server.
- [ ] Secrets omitted from code and logs.
- [ ] Structured error envelopes; accurate HTTP status codes; no internal stack trace leaks.
- [ ] Multi-step mutations executed in atomic transactions; zero N+1 queries.
- [ ] Lists paginated deterministically; outbound requests carry timeouts.
- [ ] Database migrations backward-compatible and reversible.

## E. Handoff & Delivery
- [ ] Code is self-contained and runnable without guesswork.
- [ ] Verification command or test invocation provided.
- [ ] Assumptions, unverified scenarios, and risks transparently communicated.
- [ ] Summary is concise, avoiding redundant narration of self-evident code lines.

---

## Rapid Quality Rubric (1–5)

| Dimension | 1 | 3 | 5 |
|---|---|---|---|
| Correctness | Broken / Fails | Works in happy path | Works; all edge cases handled |
| Consistency | Inconsistent style | Partially uniform | Fully aligned with repo conventions |
| Resilience | Fragile / Crashes | Basic errors caught | Failures planned and mitigated |
| Readability | Cryptic / Obvoluted | Understandable with effort | Immediately obvious |
| Security & a11y | Disregarded | Partially addressed | Systematically enforced |

*Target*: No dimension below score 4.

---

## F. 6-Dimensional Technical Debt Audit (Anthropic Framework)
Use when auditing legacy codebases or scheduling targeted refactors:

| Debt Category | Real-World Symptom | Mitigation Action |
|---|---|---|
| **1. Code Debt** | Duplicated logic, magic numbers, god-functions (>100 lines), premature abstractions | Extract pure modules, apply Karpathy Guidelines |
| **2. Architecture Debt** | Leaky modular boundaries, incorrect data models, cross-domain database coupling | Enforce strict public interface seams, event decoupling |
| **3. Test Debt** | Low coverage, flaky tests, assertion roulette, absence of seam tests | Purge test smells, enforce $\text{CRAP} < 10$ & Mutation Testing |
| **4. Dependency Debt** | Outdated packages (>2 major versions), abandoned libraries, active CVEs | Dependency audit, staged updates with regression suites |
| **5. Documentation Debt** | Outdated READMEs, missing runbooks, tribal knowledge trapped in silos | Author self-contained docs, Repo Wiki, Markdown specs |
| **6. Infrastructure Debt** | Manual deploys, absence of rollback automation, missing structured metrics | Automate CI/CD pipelines, configure health probes |

**Prioritization Matrix ($\text{Priority} = \text{Impact} \times \text{Risk}$)**:
- **Impact (1–5)**: How severely does this debt impede daily velocity?
- **Risk (1–5)**: What is the worst-case blast radius if this debt manifests in production?
*Execution Rule*: Prioritize refactoring tasks scoring $\ge 15$. Ignore aesthetic refactors scoring $< 8$ to prevent non-essential busywork.

---

## G. Pre-Flight Protocol & Rollback Triggers (Anthropic Deploy Checklist)
Verify prior to certifying code for production release:
- **Pre-Flight Sanity Gate**:
  - [ ] Database migrations are backward-compatible (add nullable columns; never drop or rename active columns in-place).
  - [ ] Target environment variables (`.env`) verified without exposing raw secrets.
  - [ ] All public API endpoints preserve type contracts without breaking changes.
- **Deterministic Rollback Triggers**:
  Execute an immediate rollback if within 5–15 minutes post-deployment:
  - HTTP 5xx error rate spikes $> 1\%$ above baseline.
  - P95 latency increases $> 2\times$ over previous release.
  - Core transactional failures (login, payment, checkout) occur $> 0$ times.

---

## H. Thinker-Executor Planning Protocol & Verification Mapping (Absorbed from `shadcn/improve`)

Enforces a rigorous division of labor between architectural planning and code execution:

1. **The Read-Only Thinker Invariant**:
   - When conducting codebase audits, architectural refactoring, or multi-module bug investigations, the agent adopts a **strict Read-Only Thinker role**.
   - Prohibit immediate code mutations before formulating a file-cited, step-by-step implementation plan.
2. **Deterministic Verification Mapping**:
   - The Thinker must inspect project manifests (`package.json`, `pyproject.toml`, `Cargo.toml`) and explicitly record the exact verification commands before planning code edits:
     - **Build**: `pnpm build` / `npm run build`
     - **Test**: `pnpm test` / `pytest`
     - **Lint**: `pnpm lint` / `ruff check`
     - **Typecheck**: `pnpm tsc --noEmit` / `mypy`
3. **Bounded Plan Contract for the Executor**:
   - The resulting plan acts as a closed, verifiable contract for execution turns:
     - Lists target files and exact LOC boundaries.
     - Outlines the 4 UI states (if frontend) or transaction boundaries (if backend).
     - Mandates fresh execution of the mapped verification commands before declaring completion.
4. **Structured Plan Annotation & State Gating (Absorbed from `Plannotator`)**:
   - **Plan State Machine**:
     $$\text{PROPOSED} \longrightarrow \text{CRITIQUED / ANNOTATED} \longrightarrow \text{REVISED} \longrightarrow \text{LOCKED}$$
   - **Structured Review Feedback Schema**:
     Any human-in-the-loop review feedback, user critique, or subagent plan review must resolve into atomic structured directives:
     - `[REJECT: step_id, rationale]`: Step rejected; requires alternative approach.
     - `[MODIFY: step_id, diff_spec]`: Targeted edit to a specific step's file scope or implementation detail.
     - `[REPLACE: step_id, new_step_spec]`: Wholesale substitution of an execution step.
   - **Execution Lock Invariant**:
     - The Executor agent is **strictly prohibited** from performing write mutations (`edit_file`, `write_file`, destructive shell commands) while the plan is in `PROPOSED` or `CRITIQUED` state.
     - Execution may commence **only** once the plan transitions to `LOCKED` (confirmed via explicit user approval or verified deterministic plan validation).


---

## I. PRD-to-Engineering Acceptance Criteria Matrix (Absorbed from `phuryn/pm-skills`)

Bridges high-level product intent and user stories into deterministic engineering contracts and automated assertions:

1. **The 3-Layer Decomposition Flow**:
   - **Layer 1: Product Intent & User Story**:
     - *Format*: `As a [user role], I want to [action], so that [business value].`
     - Identifies the user persona, trigger event, and expected business outcome.
   - **Layer 2: Deterministic Data Contract**:
     - *Schema Definition*: Strict boundary validation (Zod, Pydantic, or JSON Schema) specifying exact input bounds, allowed enums, and required headers.
     - *State & Response Codes*: Explicit HTTP status mapping (200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 429 Rate Limited).
     - *State Machine Transitions*: Valid initial state $\to$ action $\to$ validated terminal state.
   - **Layer 3: Falsifiable Acceptance Assertions**:
     - *Automated Test Mapping*: Every acceptance criterion must map directly to an executable test suite (Vitest, Playwright, or pytest) with exit code 0.
     - *Zero Ambiguity*: Prohibit subjective clauses ("Must be fast and responsive"); enforce quantified SLAs (e.g., $P95 < 250\text{ms}$, layout shift $\text{CLS} < 0.1$).

2. **Non-Functional Invariant Gate**:
   - **4 UI States**: Explicitly verify Loading, Empty, Error, and Success states before PR sign-off.
   - **Idempotency**: Verify that network retries or double form submissions do not produce duplicate records or side effects.
   - **Security Boundary**: Assert authentication, authorization per tenant/user, and absence of plaintext credential logging.
