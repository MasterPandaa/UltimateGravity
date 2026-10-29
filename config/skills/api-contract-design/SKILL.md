---
name: api-contract-design
description: "[API & Interface Contract Architect] Pre-implementation API contract design and rigorous 10-step review rubric (REST, GraphQL, gRPC). Enforces Hyrum's law, atomic idempotency claims, structured error envelopes, and zero-breaking-change evolution. DO NOT USE for frontend data fetching (use frontend-api-integration) or raw database query tuning (use sql-optimization)."
---

# API & Interface Contract Design

## Table of Contents
- [Overview](#overview)
- [When to Use vs Negative Boundaries](#when-to-use-vs-negative-boundaries)
- [Phase 1: Core Architectural Laws](#phase-1-core-architectural-laws)
- [Phase 2: Standard Contract Scaffolding (`api-contract.md`)](#phase-2-standard-contract-scaffolding-api-contractmd)
- [Phase 3: The 10-Step Deterministic Review Rubric](#phase-3-the-10-step-deterministic-review-rubric)
- [Phase 4: Financial-Grade Atomic Idempotency](#phase-4-financial-grade-atomic-idempotency)
- [Phase 5: Reference Grounding & Anti-Hallucination Gate](#phase-5-reference-grounding--anti-hallucination-gate)
- [Phase 6: Review Verdict & Severity Schema](#phase-6-review-verdict--severity-schema)

---

## Overview
This skill governs the specification, scaffolding, and pre-implementation auditing of public and internal API contracts. It guarantees that endpoints, payloads, error envelopes, and authentication boundaries are rigorously defined, backward-compatible, and locked down before any implementation code is written.

---

## When to Use vs Negative Boundaries

### Use When:
- Designing new REST, GraphQL, or gRPC endpoints before backend coding starts.
- Creating the shared data exchange contract (`api-contract.md` or OpenAPI spec).
- Generating shared TypeScript type definitions between frontend and backend.
- Auditing proposed endpoint changes for breaking modifications or architectural drift.
- Establishing idempotency keys for side-effecting financial, email, or webhook transactions.

### DO NOT USE For:
- Writing client-side data fetching queries or TanStack Query hooks (use `frontend-api-integration`).
- Profiling SQL query execution plans or indexing database tables (use `sql-optimization`).
- Auditing deployed runtime vulnerabilities or live penetration testing (use `security-audit`).
- Reviewing Git diffs of already written code (use `code-review`).

---

## Phase 1: Core Architectural Laws

### 1. Hyrum's Law
> *"With a sufficient number of users of an API, all observable behaviors of your system will be depended on by somebody, regardless of what you promise in the contract."*
- **Design Rule**: Every public behavior—ordering, header casing, error message text, timing, and HTTP status codes—becomes a de facto contract.
- Never expose internal database column names, internal IDs, or stack traces.
- Treat every external or third-party response as untrusted data; validate at system boundaries before consumption.

### 2. The One-Version Rule
- Avoid forcing consumers to choose between incompatible versions. Diamond dependency problems arise when microservices depend on conflicting versions of a shared contract.
- **Rule**: Extend rather than fork. Prefer additive changes over breaking changes.

### 3. Boundary Validation (Zod / Pydantic)
- Validate at the ingress boundary (route handlers, webhook receivers, third-party payloads).
- Trust internal code once it passes boundary validation; avoid redundant internal validation layers.

---

## Phase 2: Standard Contract Scaffolding (`api-contract.md`)
Every feature touching APIs must scaffold `docs/api-contract.md` (or output it into the task workspace) before code generation:

```markdown
# API Contract: [Feature Name]

## 1. Endpoints Overview
| Method | Path | Auth | Tenant Scoped | Description |
| :--- | :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/workspaces/:id/invoices` | Bearer JWT | Yes | Generates billing invoice |
| `GET`  | `/api/v1/workspaces/:id/invoices` | Bearer JWT | Yes | List paginated invoices |

## 2. Request / Response Contracts
### `POST /api/v1/workspaces/:id/invoices`
**Headers:**
- `Idempotency-Key`: UUIDv4 (Mandatory for mutating billing events)

**Request Body Schema:**
```typescript
interface CreateInvoiceRequest {
  currency: 'USD' | 'EUR' | 'IDR';
  items: Array<{
    description: string;
    quantity: number;
    unitPriceCents: number;
  }>;
  dueDate: string; // ISO-8601
}
```

**Success Response (`201 Created`):**
```typescript
interface InvoiceResponseEnvelope {
  data: {
    id: string; // Branded UUID
    workspaceId: string;
    totalAmountCents: number;
    status: 'DRAFT' | 'ISSUED' | 'PAID';
    createdAt: string; // ISO-8601
  };
}
```

**Standard Error Response Schema:**
```typescript
interface APIErrorEnvelope {
  error: {
    code: string;       // UPPER_SNAKE machine-readable (e.g. "VALIDATION_ERROR")
    message: string;    // Human-readable summary
    details?: unknown;  // Granular field validation mapping
  };
}
```
```

---

## Phase 3: The 10-Step Deterministic Review Rubric
Before any backend implementation starts, evaluate the proposed contract against these 10 gates:

1. **Extraction Completeness**: Are all methods, paths, request bodies, response shapes, status codes, and auth scopes enumerable?
2. **Naming & Path Consistency**:
   - Resources must use plural nouns, zero verbs (`/invoices`, not `/getInvoices` or `/createInvoice`).
   - Hierarchy reflects ownership (`/projects/:id/tasks`, not `/get-project-tasks`).
   - Query parameters in `camelCase`, URL paths in `kebab-case`.
3. **HTTP Method Semantics**:
   - `GET`: Safe, strictly read-only, zero side-effects, cacheable.
   - `POST`: Create resource or non-idempotent action.
   - `PUT`: Complete idempotent replacement.
   - `PATCH`: Partial idempotent mutation.
   - `DELETE`: Idempotent resource destruction (returns 204 or 200).
4. **Envelope & Nullability Hygiene**:
   - Consistent envelope (`{ data: ... }` across all endpoints).
   - Explicit nullables (`description: string | null`, never unstated omissions).
   - Zero unstructured wildcard fields (`metadata: any` is forbidden without schema).
5. **Error Contract Semantic Mapping**:
   - `400`: Syntactically invalid client request.
   - `401`: Unauthenticated (missing/invalid token).
   - `403`: Authenticated but unauthorized (RBAC/permissions).
   - `404`: Target resource does not exist.
   - `409`: State conflict (duplicate uniqueness or version mismatch).
   - `422`: Semantic validation failure (Zod/Pydantic error payload).
   - `500`: Internal unexpected server error (no leaked stack traces).
6. **Authentication & Multi-Tenant Scoping**:
   - Every mutating endpoint enforces authentication.
   - Multi-tenant data models must require explicit tenant context (`workspaceId`, `organizationId`).
7. **Pagination Contracts**:
   - List endpoints must enforce pagination (`cursor` or `page`/`pageSize`).
   - Default page size must be capped (default: 20, max: 100); unlimited queries are prohibited.
   - Returns navigation metadata (`hasMore: boolean`, `nextCursor: string | null`, `totalCount: number`).
8. **Idempotency Strategy**:
   - All mutation endpoints triggering financial charges, emails, or webhooks must support `Idempotency-Key`.
9. **Evolution & Backward Compatibility**:
   - Prefer addition over modification. Optional fields may be added; never delete or rename existing fields without a formal deprecation window.
10. **Alignment with Existing System Conventions**:
    - Response envelopes, casing conventions, and error codes must match existing codebase conventions.

---

## Phase 4: Financial-Grade Atomic Idempotency

### Preventing Time-of-Check to Time-of-Use (TOCTOU)
Idempotency claims must be executed atomically at the persistence layer using a database unique constraint:

```typescript
// ATOMIC INSERT PATTERN
// 1. Client provides Idempotency-Key
const key = req.headers['idempotency-key'];
const requestHash = crypto.createHash('sha256').update(JSON.stringify(req.body)).digest('hex');

try {
  // Step 1: Claim the key atomically via unique constraint
  await db.idempotencyKeys.insert({
    key,
    state: 'IN_PROGRESS',
    requestHash,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 86400 * 1000) // 24h lease
  });
} catch (error) {
  if (isUniqueConstraintViolation(error)) {
    const existing = await db.idempotencyKeys.find(key);
    
    // Guard: Prevent key reuse with a different payload
    if (existing.requestHash !== requestHash) {
      return res.status(422).json({
        error: {
          code: 'IDEMPOTENCY_KEY_PAYLOAD_MISMATCH',
          message: 'Idempotency key was previously used with a different request payload.'
        }
      });
    }
    
    if (existing.state === 'IN_PROGRESS') {
      return res.status(409).json({
        error: { code: 'CONCURRENT_REQUEST', message: 'Request currently processing. Retry shortly.' }
      });
    }
    
    // Return cached response
    return res.status(existing.responseStatus).json(existing.responseBody);
  }
  throw error;
}

// Step 2: Execute side-effecting operation
const result = await processFinancialCharge(req.body);

// Step 3: Seal cached response
await db.idempotencyKeys.update(key, {
  state: 'SUCCEEDED',
  responseStatus: 201,
  responseBody: result
});
```

---

## Phase 5: Reference Grounding & Anti-Hallucination Gate
When drafting or reviewing an API contract:
1. Every external parameter, rate limit, header requirement, or third-party SDK behavior must be grounded in primary documentation or verified via MCP `context7`.
2. Any recalled or assumed behavior not backed by observed documentation must be flagged:
   `[ungrounded: <contract assumptions>]`
3. Contracts with more than 2 ungrounded markers cannot receive a `READY_TO_IMPLEMENT` verdict.

---

## Phase 6: Review Verdict & Severity Schema
Every contract audit concludes with a structured assessment:

### Severity Levels:
- **P0 (Blocker)**: Missing auth, unhandled financial TOCTOU race conditions, breaking change without migration, or missing tenant scoping.
- **P1 (High)**: Inconsistent error structure, missing pagination on unbounded lists, or HTTP method misuse.
- **P2 (Minor)**: Casing inconsistency, ambiguous field naming, or missing description comments.

### Verdict Output Template:
```markdown
### API Contract Audit Verdict
- **Status**: [READY_TO_IMPLEMENT | NEEDS_REVISION | BLOCKED]
- **Summary**: <1-2 sentences summarizing contract maturity>

#### Findings Breakdown:
- [P0/P1/P2] Gate X: <Specific finding with exact endpoint, field, and recommended resolution>

#### Architectural Grounding:
- Grounded References: <Documentation or schema paths verified>
- Ungrounded Markers: <Any remaining [ungrounded] assumptions>
```
