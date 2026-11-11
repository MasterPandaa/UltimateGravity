# Backend: Practical Engineering Standards

## Table of Contents
1. Layered Architecture & Separation of Concerns
2. API Design & Contracts
3. Data & Persistence
4. Security & Hardening
5. Error Handling & Structured Logging
6. Concurrency & Reliability
7. Environment Configuration
8. Testing Strategy
9. Canonical Architecture Example
10. Data Pipeline & Scraping Ingestion Standards (Declarative Schemas & Supply-Chain Defense)

---

## 1. Layered Architecture & Separation of Concerns
Enforce a minimum three-tier architecture:
- **Transport** (routes/controllers): parse requests, validate input shapes, invoke domain services, map domain outputs to HTTP responses. Zero business logic.
- **Service / Domain**: pure business rules; completely decoupled from HTTP semantics and specific database mechanisms.
- **Data Access** (repositories): queries and transactions; the exclusive boundary holding SQL or ORM dependencies.
Dependencies are injected to guarantee testability. Feature-based structure: `orders/{route,service,repo,schema,test}`.

## 2. API Design & Contracts
- Resource-oriented URLs using plural nouns (`/orders`); actions map to HTTP verbs; non-CRUD actions modeled as sub-resources (`POST /orders/{id}/cancel`).
- Accurate HTTP status codes: 200/201/204 for success, 400 bad input, 401 unauthenticated, 403 forbidden, 404 not found, 409 conflict, 422 unprocessable entity, 429 rate limited, 5xx server failures.
- Lists are always paginated (cursor-based pagination preferred over offset for scale) with deterministic sorting.
- Re-triable client operations (e.g. payments, order creation) support **Idempotency Keys**.
- Explicit API versioning for breaking changes; never alter the semantic meaning of existing fields.
- Uniform response envelopes: consistent casing (`camelCase` or `snake_case`), ISO 8601 UTC timestamps.
- Canonical contract documentation (OpenAPI / Type-Safe RPC) feeding client SDKs.
- Structured error envelope format:
```json
{ "error": { "code": "VALIDATION_FAILED", "message": "Invalid email address", "fields": { "email": "invalid format" } } }
```

## 3. Data & Persistence
- Normalized relational schemas; foreign keys, `NOT NULL`, `UNIQUE` constraints, and indexes reflect business invariants.
- Sequential, atomic, and reversible migrations; never mutate executed migration files.
- Multi-step modifications executed inside ACID **transactions**.
- Prevent N+1 queries: fetch relations via joins or batch lookups (`DataLoader`).
- Currency / Money: smallest integer minor units (cents) or arbitrary-precision decimals; never floating-point.
- Timestamps: store in UTC; format in user locale at boundary edges.
- Soft deletes (`deleted_at`) applied strictly upon documented business requirement, accounting for unique index constraints.
- Indexes aligned to empirical query plans (`EXPLAIN ANALYZE`).
- **Cache Penetration Defense (Bloom Filter)**: For high-frequency lookups (username availability, coupon codes, unique slugs), position an in-memory or Redis Bloom Filter ahead of the database. Exploit zero false negatives (if the filter reports 'definitely absent', 100% skip database queries) to eliminate 99%+ of redundant queries.

## 4. Security & Hardening
- Validate **all** input at boundaries (types, length, range, regex). Reject unrecognized fields.
- Parameterized queries exclusively; string concatenation in SQL or shell executions is strictly forbidden.
- Authentication: expirable session tokens or JWTs; password hashing using slow algorithms (Argon2id, bcrypt, scrypt) with cryptographic salts.
- Authorization verified **per resource** on the server (never assume simple login status); mitigate BOLA/IDOR by filtering records by ownership context.
- Secrets injected via environment variables or secret managers; never hardcoded in source control or printed to logs.
- Strict CORS policies, security headers (CSP, HSTS), payload size limits, rate limiting on sensitive endpoints (login, password reset).
- Error envelopes sent to clients must never leak internal stack traces or database queries.
- File uploads: enforce MIME type validation, file size limits, store outside webroot, never trust client-provided filenames.

## 5. Error Handling & Structured Logging
- Differentiate **expected operational errors** (validation failures, not found, conflicts; mapped to 4xx) from **unexpected system failures** (bugs, network drops; mapped to 5xx with trace logging).
- Centralized error-handling middleware mapping exceptions to standard response schemas.
- Never swallow exceptions; handle where remediation is possible or propagate with contextual error tags.
- Structured JSON logging with request correlation IDs, accurate severity levels (info/warn/error), sanitized of credentials, PII, and tokens.
- Log messages convey contextual facts, avoiding ambiguous "error occurred" strings.

## 6. Concurrency & Reliability
- Anticipate duplicate and concurrent requests: rely on unique constraints, row-level locks, or optimistic concurrency control (`version` column).
- Outbound third-party calls: enforce strict timeouts, bounded retries with exponential backoff and jitter, circuit breakers.
- Offload long-running tasks to background job queues; respond promptly with polling or webhook callbacks.
- Background workers must be idempotent and safely re-executable.
- Graceful shutdown handlers and container health probes (liveness/readiness).

## 7. Environment Configuration
- Environment-specific values managed via environment variables, validated at startup (fail-fast on missing keys).
- Secure defaults; experimental features gated behind feature flags.
- Avoid scattered `if (env === 'production')` conditionals; encapsulate environment differences within configuration providers.

## 8. Testing Strategy & Tooling
- **Unit Tests:** pure domain logic, fast execution, zero external I/O.
- **Integration Tests:** routes + services + live test databases (or containers) for primary happy paths and failure branches.
- **Contract Tests:** verify responses adhere strictly to schemas consumed by frontend clients.
- **Python Tooling Standard**: Use `ruff` (`ruff check` and `ruff format`) as the primary Rust-based linter/formatter in Python projects for sub-second, zero-overhead linting without heavy legacy toolchains.
- **Cloud Endpoint Decoupling Invariant**: Never hardcode cloud provider URLs (AWS S3, Supabase, DynamoDB) inside service code or test harnesses. Always bind endpoints to environment variables (`AWS_ENDPOINT_URL`, `SUPABASE_URL`, `S3_ENDPOINT`). This enables integration tests to seamlessly target local in-memory mocks (MSW, MinIO, or lightweight emulators) without code modifications or heavy container daemons.
- Mandatory edge cases: empty inputs, duplicate keys, boundary values, unprivileged actors, duplicate requests, dependency timeouts.
- Test behavior, not internal implementation; test names describe scenarios and expected outcomes.
- Test fixtures produced through factories; tests must be isolated and order-independent.

## 9. Canonical Architecture Example (TypeScript)
```ts
// orders/schema.ts: Boundary validation
export const CreateOrder = z.object({
  items: z.array(z.object({ productId: z.string(), qty: z.number().int().positive() })).min(1),
});

// orders/service.ts: Domain business logic (HTTP-agnostic)
export async function createOrder(deps: Deps, userId: string, input: CreateOrderInput) {
  const products = await deps.repo.getProducts(input.items.map(i => i.productId));
  if (products.length !== input.items.length) throw new NotFoundError("PRODUCT_NOT_FOUND");
  const totalMinor = calculateTotalMinor(products, input.items);
  return deps.repo.insertOrder({ userId, items: input.items, totalMinor }); // Single atomic transaction
}

// orders/route.ts: Transport layer
router.post("/orders", auth, async (req, res) => {
  const input = CreateOrder.parse(req.body); // 422 handled via central middleware
  const order = await createOrder(deps, req.user.id, input);
  res.status(201).json({ data: order });
});
```

---

## 10. Data Pipeline & Scraping Ingestion Standards (Declarative Schemas & Supply-Chain Defense)

### A. Declarative Schema-Driven Extraction (Inspired by `xscrape`)
When transforming raw extracted HTML strings into structured datasets:
1. **Decouple Fetching from Parsing**:
   - Use dedicated Tier-1 scrapers (Scrapling, Firecrawl, Jina Reader) to handle stealth anti-bot bypass and raw HTML acquisition.
   - Never write fragile ad-hoc regex expressions or unstructured selector loops for document transformation.
2. **Standard Schema Binding (Zod / Pydantic)**:
   - Pair extraction primitives (`text`, `attr`, `nested`, `many`) directly with runtime schema validation.
   - Enforce type coercion explicitly (e.g., `z.coerce.number()` for stringified HTML counters or timestamps).
   - If target HTML structure shifts, fail fast with a structured diagnostic error instead of silently returning corrupted or `undefined` records into downstream storage.

### B. Windows Supply-Chain Security & Dependency Defense (Inspired by Lisdex Hermes Research)
Scraper repositories and utility packages on Windows are primary lure vectors for Malware-as-a-Service (MaaS) loaders (e.g., PyMapper / Hermes infostealers):
1. **Zero-Trust Dependency Provenance**:
   - Never run unverified `pip install` or `npm install` directly from untrusted third-party scraper repositories without auditing package sources and lockfiles.
2. **Lifecycle Script Audit**:
   - Inspect package scripts (`package.json` -> `postinstall` / `preinstall`, Python `setup.py`, and `__init__.py`) for memory-injection hooks, hidden process spawns (`hVNC`), or obfuscated network calls prior to execution.
3. **Execution Context & Credential Isolation**:
   - Scraping pipelines must run in isolated sub-processes.
   - Never expose active browser session profiles, developer SSH keys, JWT tokens, or environment credentials to the runtime scope of external scraping scripts.
