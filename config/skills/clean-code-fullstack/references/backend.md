# Backend: Practical Engineering Standards

## Table of Contents
1. Layered Architecture & Separation of Concerns
2. API Design & Contracts
3. Data & Persistence
4. Security & Hardening
5. Error Handling & Structured Logging
6. Concurrency & Reliability
7. Environment Configuration
8. Testing Strategy & Tooling
9. Canonical Architecture Example (TypeScript)
10. Data Pipeline & Scraping Ingestion Standards (Declarative Schemas & Supply-Chain Defense)
11. Filesystem-First API Contracts & Zero-Cloud Mocking
12. Production Container Hardening Invariants (Dockerfile & Compose)
13. RAG & Multimodal Ingestion Architecture (-> [rag-architecture.md](file:///C:/Users/Luthfi/.gemini/config/skills/clean-code-fullstack/references/rag-architecture.md))
14. Agentic Systems & LLM Observability (-> [agentic-systems.md](file:///C:/Users/Luthfi/.gemini/config/skills/clean-code-fullstack/references/agentic-systems.md))

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

### C. Anti-Bot Network Hardening & TLS Fingerprint Impersonation (Absorbed from `curl-impersonate`)
Standard HTTP clients (`requests`, basic `fetch`, bare `curl`) emit non-browser JA3/JA4 TLS fingerprints and HTTP/2 settings that modern WAFs (Cloudflare, Akamai, Datadome) block with 403 Forbidden:
1. **The TLS Impersonation Rule**:
   - For direct HTTP extraction on Cloudflare-protected endpoints without full headless browser overhead, use `curl_cffi` (Python) or `curl-impersonate` bindings:
     ```python
     from curl_cffi import requests
     # Mimics real Chrome/Edge TLS ciphers, extension ordering, and HTTP/2 settings
     response = requests.get(url, impersonate="chrome124")
     ```
2. **Extraction Tier Hierarchy**:
   - **Tier-0 (Fastest / Lowest RAM)**: Direct `curl_cffi` impersonation (sub-100ms, minimal CPU/memory).
   - **Tier-1 (Advanced Stealth)**: `Scrapling` MCP / `Firecrawl` MCP (built-in stealth bypass with dynamic header and proxy rotation).
   - **Tier-2 (Headless Browser)**: Full headless browser (`Playwright` / `browser` subagent) only when client JavaScript rendering, complex DOM hydration, or manual interaction is strictly required.

---

## 11. Filesystem-First API Contracts & Zero-Cloud Mocking

> Grounded in the architectural absorption of the `postman` plugin methodology into local, offline-first development.

1. **OpenAPI / JSON Schema as Single Source of Truth**:
   - Store API definitions as version-controlled artifacts (`api/openapi.yaml` or `contracts/*.ts`) directly in the repository filesystem.
   - Prohibit managing API contracts solely within remote proprietary cloud dashboards.
2. **Local Schema-Driven Mock Handlers**:
   - Synthesize offline test mock handlers (via MSW / Vitest / lightweight HTTP handlers) directly from OpenAPI schemas and TypeScript types.
   - Test suites must execute completely offline in sub-seconds without relying on external cloud mock servers.
3. **The 4 Invariant Assertions on Every API Endpoint**:
   - *Status Contract*: Assert exact HTTP status codes (200 OK vs 201 Created vs 204 No Content).
   - *Strict Response Envelope*: Assert that response payload conforms strictly to the schema (rejecting unexpected extra properties).
   - *Latency SLA*: Local test assertions must fail if synthetic execution exceeds bounded SLA (< 300ms for unit mocks, < 1000ms for local integration).
   - *Idempotency Guarantee*: Repeating `POST` or `PUT` operations with identical `Idempotency-Key` or payload must yield identical database state and deterministic responses.

---

## 12. Production Container Hardening Invariants (Dockerfile & Compose)

> Absorbed from `inbharatai/claude-skills` (`dockerfile-builder` & `compose-creator`). Enforces production-grade security, deterministic caching, and minimal attack surface.

### A. The 5 Dockerfile Production Invariants
1. **Multi-Stage Build Isolation**:
   - Separate build-time tooling (`builder` stage) from runtime execution (`runner` stage).
   - The final runner stage must strictly use minimal base images (`alpine`, `distroless`, or `-slim`), copying only compiled artifacts (`dist/`, `.next/standalone`) and production dependencies (`node_modules --omit=dev`).
2. **Deterministic Layer Ordering (Cache Optimization)**:
   - Copy dependency manifests (`package.json`, `pnpm-lock.yaml`, `requirements.txt`, `go.mod`) and install dependencies *before* copying application source code (`COPY . .`).
   - Ensures routine code edits do not invalidate heavy dependency download layers.
3. **Non-Root Execution Guard (CWE-250)**:
   - Containers must never run as root (`UID 0`). Explicitly create and switch to a dedicated unprivileged user before starting the application:
     ```dockerfile
     RUN addgroup -S appgroup && adduser -S appuser -G appgroup
     USER appuser
     ```
4. **Active Liveness & Healthcheck Probes**:
   - Always declare explicit healthcheck directives for orchestrator monitoring:
     ```dockerfile
     HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
       CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1
     ```
5. **Zero-Secret Invariant in Build Context**:
   - Never copy `.env` files, production credentials, or SSH keys into image layers. Pass build-time secrets exclusively via Docker BuildKit secret mounts (`RUN --mount=type=secret...`) or runtime environment variables.

### B. Compose Hardening
- Specify resource limits (`cpus`, `memory`) on every service to prevent host exhaustion.
- Store state strictly in named volumes, never unanchored host root mounts.
- Bind internal services (Postgres, Redis) to private container networks without exposing ports to `0.0.0.0` unless external access is explicitly required.

---

## 13. RAG, Retrieval & Multimodal Ingestion Architecture

> Full architectural standards for production RAG pipelines, hybrid search, hierarchical auto-merging chunking, and multimodal document decomposition are maintained in dedicated reference:  
> 📖 **[rag-architecture.md](file:///C:/Users/Luthfi/.gemini/config/skills/clean-code-fullstack/references/rag-architecture.md)**
>
> - **4-Stage Pipeline**: Semantic chunking with 10–15% overlap, dense/sparse Reciprocal Rank Fusion (RRF), cross-encoder reranking, and Recall@5 $\ge 0.85$ gates.
> - **Advanced Retrieval (LlamaIndex)**: Sentence Window Retrieval (focal-context decoupling) and Auto-Merging Hierarchical Retriever (child-to-parent quorum thresholding).
> - **Multimodal Ingestion (RAG-Anything)**: 4-stream modality decomposition (Text AST, Table HTML/Markdown, LaTeX equations, VLM image captions) with cross-modal co-reference binding.

---

## 14. Agentic Systems, Memory Graphs & Observability

> Production engineering standards for choosing agent frameworks, dynamic temporal memory graphs, and non-blocking OpenTelemetry tracing are maintained in dedicated reference:  
> 📖 **[agentic-systems.md](file:///C:/Users/Luthfi/.gemini/config/skills/clean-code-fullstack/references/agentic-systems.md)**
>
> - **Framework Archetypes**: PydanticAI (type-safe Python), Google ADK (Gemini enterprise), LangGraph (cyclical state machines), OpenAI Agents (handoffs).
> - **Dynamic Knowledge Graph Memory (Graphiti + Cognee)**: Deterministic Pydantic ontology blueprinting, Bi-temporal modeling (`valid_time` vs `transaction_time`), causal edge invalidation, and zero-daemon embedded profile (NetworkX/SQLite/LanceDB) for host RAM conservation.
> - **Production Observability (Langfuse + Opik)**: Hierarchical OTel span trees (Trace $\rightarrow$ Turn $\rightarrow$ LLM $\rightarrow$ Tool), token & USD cost accounting, and non-blocking asynchronous export ($< 5$ms overhead).
