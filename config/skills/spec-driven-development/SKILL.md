---
name: spec-driven-development
description: "[Spec-Driven Development Lifecycle Engine] Rigorous 5-stage agile specification framework (Constitution -> Spec -> Plan -> Tasks -> Verify). DO NOT USE for direct Jira ticket creation from Confluence (use spec-to-backlog)."
---

# Spec-Driven Development (SDD) & Agile Lifecycles

Bridges user requirements and autonomous agent execution through structured specifications, eliminating ambiguous assumptions before code is written.

## The 6-Stage SDD Lifecycle

```text
[1. Constitution] -> [2. Product Spec] -> [2.5 Grill with Docs] -> [3. Technical Plan] -> [4. Task Graph] -> [5. Build & Verify]
```

### Stage 1: The Constitution (`CONSTITUTION.md`)
Defines the non-negotiable boundaries, coding standards, language versions, design tokens, and guardrails for the repository.
- Coding paradigm & lint rules
- Security & secret handling policies
- Zero-tolerance constraints (e.g., no raw SQL in controllers, no any in TypeScript)

### Stage 2: The Product Spec (`SPEC.md`)
Focuses strictly on **What** and **Why** without implementation clutter:
- User Personas & Scenarios
- Acceptance Criteria using strict Given/When/Then formatting:
  ```gherkin
  Scenario: User submits invalid email
    Given the user is on the checkout page
    When they enter an email without an '@' symbol and submit
    Then an inline validation error is displayed
    And the submit button remains disabled
  ```
- Boundary cases, negative flows, and failure modes.

### Stage 2.5: Socratic Alignment & Architectural Interrogation (`grill-with-docs`)
Before committing to a technical plan or code, subject the specification to active interrogation:
- **Glossary Cross-Examination**: Cross-check all terminology against `GLOSSARY.md`. Challenge any ambiguous or conflicting nouns ("You call this an 'Account' here, but GLOSSARY defines 'Customer' and 'User'").
- **ADR Conformance**: Audit proposed design against Architecture Decision Records (`docs/adr/`). Flag any proposal that quietly reverses or contradicts an established ADR without explicit acknowledgment.
- **Codebase Reality Check**: Verify stated assumptions against actual current code paths. Flag optimistic assumptions ("The spec assumes users have a single role, but schema supports multi-tenant roles").
- **Edge-Case Stress Testing**: Invent hostile scenarios, concurrency races, failure cascades, and offline states. Probe boundary conditions until the spec is robust.
- **Socratic First-Principles Derivation (Rederive)**: Gunakan metodologi Rederive untuk menguji pemahaman arsitektur: ajukan masalah telanjang tanpa nama framework, suntikkan kendala bertahap, dan pandu perancang menurunkan kembali pola solusi secara mandiri.

### Stage 3: The Technical Plan (`PLAN.md` / `ARCHITECTURE.md`)
Defines **How** the product spec will be fulfilled:
- System components & data model / ERD
- API Contract: Endpoints, request schemas, status codes, and error payloads
- File Boundaries: Explicitly assign which files belong to frontend vs backend (`OWNS` map).

### Stage 4: The Task Breakdown (`.agents/backlog/` or Jira)
Breaks the plan into small, logically sequenced implementation tickets:
- Each ticket is atomic (can be completed in a single session).
- Declares explicit blocking dependencies (`Blocked by #101`).
- Defines verifiable acceptance proof (e.g., unit test passes, API returns 200).

### Stage 5: Execution & Verification
- Worker subagents build against the frozen spec.
- QA validates against Given/When/Then acceptance criteria.
- Reviewer audits diff against Constitution standards.
