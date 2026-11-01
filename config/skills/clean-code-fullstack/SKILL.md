---
name: clean-code-fullstack
description: "[Clean Code Fullstack Architecture Standards] Comprehensive engineering standards for layered architecture, idempotency, service boundaries, data validation (Zod/Pydantic), error handling, and 4 UI states. DO NOT USE for specific UI component syntax (use shadcn-ui) or PR diff reviews (use code-review)."
---

# Clean Code Fullstack

Writing clean code is an operational discipline. High-quality code is not the cleverest solution, but the one that **future developers can read, modify, and trust without friction**.

## Table of Contents

- [Core Principles](#core-principles)
- [Choosing the Execution Mode](#choosing-the-execution-mode)
- [The 6-Phase Pipeline](#the-6-phase-pipeline)
- [Cross-Layer Consistency](#cross-layer-consistency)
- [Domain Standards: Frontend vs. Backend](#domain-standards-frontend-vs-backend)
- [Common Anti-Patterns](#common-anti-patterns)
- [References](#references)

---

## Core Principles

1. **Consistency over Personal Taste (With Anti-Anchor Gate)**: Comply with clean existing project conventions (naming, structure, formatting, libraries). Never impose personal stylistic habits on an established codebase. **HOWEVER**, consistency must NEVER be used to propagate legacy technical debt, security flaws, or broken patterns. Legacy code is a baseline, NOT ground truth. If existing conventions violate clean architecture, elevate them cleanly rather than replicating rot.
2. **Simplicity First**: Implement the simplest architecture that solves current requirements. Extract abstractions only after a pattern repeats at least 3 times (Rule of Three). Avoid premature over-engineering.
3. **Single Responsibility per Unit**: Every function, component, and module must perform one discrete task described accurately by its name.
4. **Failure as a Normal Path**: Loading, empty, error, and invalid data states (the mandatory 4 UI states) must be designed upfront, never patched as an afterthought.
5. **Runnable & Complete Deliverables**: Deliver fully functional code (valid imports, configuration, usage examples) verified against regressions. Never leave hidden placeholders such as `// TODO implement`.
6. **Honesty Regarding Limitations & Calibrated Advice**: Explicitly communicate assumptions, unverified edge cases, trade-offs, and risks. Proactively advise and critique if an architectural design or user request is flawed.

---

## Choosing the Execution Mode

| Scenario | Mode | Execution Pattern |
|---|---|---|
| Bug fixes, minor markup/CSS adjustments, surgical patches (< 30 lines) | **Patch (Surgical)** | Direct `read_file` and `edit_file` on target lines to avoid regressions. Must fix root cause; never band-aid rotten code. |
| Single-file component or standalone utility function | **Lean** | Read surrounding context, write clean correct changes, verify cleanly against regressions. |
| Multi-file architecture, API + UI integration, database migrations, major refactors | **Deep** | Write structured plan (contracts, interfaces, risks), build layer-by-layer, double-check correctness then readability. |

---

## The 6-Phase Pipeline

### Phase 1: Context Ingestion (Anti-Blindness)
- Ingest full surrounding module context (imports, callers, router wrappers) before modifying code.
- User constraints (no new dependencies, specific framework versions, public API stability) are mandatory invariants.
- Query codebase graph (via Graphify) or dependency tree for multi-file impact.

### Phase 2: Contract Design Before Implementation
Establish structural interfaces upfront:
- **Input/Output**: Data shapes, nullability, error types.
- **Architectural Seams**: UI does not construct SQL; HTTP controllers do not house business logic; domain entities are framework-agnostic.
- **Fullstack Contracts**: Finalize API schemas (path, HTTP method, payload, status codes, error models) before developing frontend or backend layers.

### Phase 3: Structural Organization
- Organize by feature or domain rather than file type in non-trivial codebases.
- Explicit naming: `calculateInvoiceTotal` instead of `process`; `isEmailVerified` instead of `flag`.
- Small functions with minimal parameters (use typed option objects when exceeding 3 arguments).
- Eliminate magic numbers and unanchored string literals; centralize configuration constants.

### Phase 4: Implementation
- Execution order: Types/schemas ➔ Core logic ➔ Adapters/routes ➔ Error handling ➔ Visual polish.
- Enforce validation at **system boundaries** (user inputs, network requests, third-party webhooks), avoiding redundant defensive checks internally.
- Comments must explain **why**, not **what**.
- Fix the root cause: Avoid superficial one-line patches that leave latent architectural flaws.

### Phase 5: Verification & Quality Gates (Live Verification Gate)
- Execute test suites or linter checks when tooling is available.
- **Stale QA Invalidation**: Invalidate old test cases if requirements or touched boundaries changed. Do not trust legacy green tests blindly.
- **Frontend Verification**: Do NOT declare success based solely on TypeScript compile (`tsc`). Verify live browser runtime, check console for React hydration errors (e.g. `<button>` in `<a>`), and audit loading, empty, error, and overflowing data states.

### Phase 6: Delivery
Structured handoff format:
1. **Summary**: What was created/fixed, architectural decisions, and explicit assumptions.
2. **Code / Patch**: Full path declarations; surgical diffs for brownfield modifications.
3. **Execution / Test Instructions**: Concrete command lines to run and verify the work.
4. **Notes & Risk Evaluation**: Residual risks, trade-offs, and proactive recommendations.

---

## Cross-Layer Consistency

Enforce strict parity between frontend and backend contracts:
- **Domain Terminology**: Use unified entity names across layers (`order` rather than mixing `order`, `purchase`, and `transaction`).
- **Data Shapes**: Share common schema definitions (TypeScript types generated from OpenAPI / Prisma / Zod).
- **Date, Monetary & Identifier Formats**: ISO 8601 UTC strings for dates; integer cents or decimal strings for currency (never floating-point numbers); opaque strings for entity IDs.
- **Unified Error Model**: Standard structure (e.g. `{ "error": { "code", "message", "fields" } }`) mapped cleanly to user-friendly UI toasts or field errors.
- **Postel's Law (Robustness Principle)**:
  - *Tolerant Ingestion*: Accept common user input variations (auto-trim email whitespaces, accept formatted phone numbers).
  - *Strict Persistence & Egress*: Normalize data into canonical representations (E.164 phone formats, integer cents) before storage and egress.

---

## Domain Standards: Frontend vs. Backend

### Frontend Standards (`references/frontend.md`)
- Modular, composable components; state localized to consumers; server data managed via structured caching layers (React Query/SWR) rather than raw `useEffect` calls.
- Four mandatory UI states: Loading, Empty, Error, and Success.
- Accessibility (a11y): Semantic HTML, descriptive labels, visible focus rings, WCAG contrast ratios, keyboard navigation, `prefers-reduced-motion`.
- Consistent styling via centralized design tokens (colors, spacing, typography, radii).

### Backend Standards (`references/backend.md`)
- Layered architecture: Transport (controllers) ➔ Application (services) ➔ Domain (entities) ➔ Infrastructure (database/APIs).
- Idempotent and predictable REST/GraphQL endpoints; accurate HTTP status codes; cursor or page-based pagination on collections.
- Security by default: Strict input sanitization, parameterized SQL queries, resource-level authorization (RBAC/ABAC), vault-managed secrets, modern password hashing (Argon2id/bcrypt).
- Structured logging with contextual correlation IDs, database transactions for multi-step operations, reversible forward migrations.

---

## Common Anti-Patterns

- Code that functions on happy paths but crashes on empty or failed responses.
- Monolithic files or functions exceeding single-responsibility boundaries.
- Copy-pasting identical logic blocks across components with minor variations.
- Vague identifiers (`data`, `temp`, `handle`, `util`, `manager`).
- Swallowing exceptions (`catch {}` blocks) or silently returning generic `null` values.
- Committing secrets, API keys, or production environment variables into repositories.
- String-concatenated SQL queries or unescaped `innerHTML` rendering.
- Global state for values that belong locally; unnecessary multi-layer prop drilling.
- Adding large dependencies to solve minor utility tasks.
- Rewriting entire source files when a targeted surgical patch suffices.
- Slapping superficial band-aid patches on fundamentally broken architectures instead of refactoring root causes.
- Declaring UI work complete based solely on compiler output (`tsc`) without verifying live browser rendering or console errors.
- Blindly trusting legacy code or obsolete test cases as absolute truth (Anchor Bias).

---

## References
- `references/frontend.md`: Components, state management, UI states, accessibility, performance, and design tokens.
- `references/backend.md`: Layering, API design, persistence, security, error handling, logging, and concurrency.
- `references/review-checklist.md`: Review rubrics and verification gates prior to code submission.
- `references/animejs-motion.md`: Anime.js v4 integration standards, SSR-safe custom hooks (`useAnime`), memory leak cleanup, and 4 UI states motion.
- `references/gsap-motion.md`: GreenSock GSAP integration standards, useGSAP context cleanup, autoAlpha vs opacity, and timeline sequencing.
