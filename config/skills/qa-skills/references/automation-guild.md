# Test Automation Guild Guide & Best Practices
Source: [inaodeng.com/en/guild/](https://inaodeng.com/en/guild/) & Awesome QA Skills Automation Suite

This guide provides technical roadmaps, framework architectures, best practices, and CI integration patterns for UI, API, and Performance Test Automation.

---

## 1. UI Automation Testing

### Primary Tool: Playwright (Recommended)
- **Strengths:** Native support for Chromium, Firefox, WebKit; out-of-the-box auto-waiting; network interception; multi-tab and multi-origin; trace viewer; parallel test execution.
- **Pattern:** Page Object Model (POM) or Component Object Model (COM) with fixtures.
- **Locator Strategy:**
  1. Priority 1 (User-facing / Semantic): `getByRole()`, `getByLabel()`, `getByPlaceholder()`, `getByText()`
  2. Priority 2 (Test ID): `getByTestId()` (e.g. `data-testid`)
  3. Avoid: brittle CSS paths (`div > div:nth-child(2) > span`) or XPath unless dealing with shadow DOM boundaries without ARIA support.
- **Auto-waiting vs Explicit Waits:** Rely on web-first assertions (`expect(locator).toBeVisible()`, `expect(locator).toHaveText()`). Never use hard-coded `sleep` or fixed timeouts.
- **Trace Viewer & Debugging:** Configure `trace: 'on-first-retry'` or `'retain-on-failure'` in CI for rapid root-cause diagnosis.

### Alternative Tool: Cypress
- **Strengths:** Interactive runner, time-travel debugging, rich ecosystem of plugins, easy stubbing of network requests (`cy.intercept`).
- **Best for:** Single-domain web apps, rapid frontend developer-driven unit/component and E2E testing.
- **Considerations:** Limited multi-tab/multi-window support; single browser per test cycle; asynchronous commands queued via internal chain.

---

## 2. API Automation Testing

### Tools Ecosystem by Language & Stack
| Language / Tool | Target Stack | Core Features & Strengths |
| :--- | :--- | :--- |
| **REST Assured** | Java / JVM | BDD syntax (`given().when().then()`), JSONPath/XMLPath validation, seamless OAuth/cookie session handling, schema validation. |
| **pytest + Requests / HTTPX** | Python | Fixture-based test data management, parameterized test suites, async HTTP with HTTPX, rich plugin ecosystem (`pytest-xdist`, `allure-pytest`). |
| **SuperTest** | Node.js / Express | In-process HTTP testing against Node.js web frameworks without starting a real TCP port, fast execution in unit/integration pipelines. |
| **Bruno / Postman** | CLI / GUI Collections | Git-friendly collection files (Bruno markup or Postman JSON), Newman/Bruno CLI runners for CI integration, environment variable chaining. |

### API Testing Heuristics & Checklist
1. **Contract & Schema Validation:** Validate JSON/OpenAPI schema, required vs optional properties, data types, enum boundaries.
2. **Status Codes & Headers:** Verify RFC compliant HTTP status codes (200, 201, 204, 400, 401, 403, 404, 409, 422, 429, 500, 503), `Content-Type`, cache control headers.
3. **Idempotency:** Verify repeated `GET`, `PUT`, `DELETE` operations produce consistent outcomes and idempotency keys work for critical `POST` payments or orders.
4. **Pagination & Query Parameters:** Test limit, offset/cursor, boundary limits (0, 1, max, max+1, negative), ordering (ASC/DESC), filter combinations.
5. **Rate Limiting & Throttling:** Confirm `X-RateLimit-*` or `Retry-After` headers and appropriate `429 Too Many Requests` behavior.
6. **Negative & Error Contracts:** Malformed payloads, missing required fields, SQL/XSS payload injection, unexpected headers, type mismatches, empty strings.

---

## 3. Performance & Load Automation Testing

### Primary Tools: k6, Gatling, Apache JMeter
- **k6 (Recommended for Modern CI/CD):**
  - Scripting: Modern JavaScript (ES6) / TypeScript.
  - Resource footprint: Go runtime, extremely lightweight virtual user (VU) management.
  - Metrics: Built-in `http_req_duration`, `http_req_failed`, custom Trend and Rate metrics.
  - Thresholds: Fail CI builds when SLA breached (e.g. `http_req_duration: ['p(95)<300', 'p(99)<600']`, `http_req_failed: ['rate<0.01']`).
- **Gatling:**
  - High concurrency, asynchronous Akka engine, Scala/Java/Kotlin DSL, HTML performance reports.
- **Apache JMeter:**
  - Traditional enterprise standard, multi-protocol support (JDBC, JMS, SOAP, HTTP), GUI test planner with headless CLI runner.

### Load Test Profiles & Workload Modeling
1. **Smoke Test:** Minimal VUs (1-2) to ensure scripts run and assertions succeed against target environment.
2. **Load Test:** Simulate expected average peak traffic over sustained periods (e.g. 100-500 VUs over 30 mins) to measure baseline latency and throughput.
3. **Stress Test:** Push traffic beyond normal peak until the system breaks or throttles, identifying the exact breaking point and failure modes.
4. **Spike Test:** Sudden massive traffic surge (e.g. flash sale) to test auto-scaling responsiveness, queueing, and fallback handling.
5. **Soak / Endurance Test:** Moderate load over extended duration (hours or days) to detect memory leaks, connection pool exhaustion, or disk exhaustion.

---

## 4. Continuous Integration (CI/CD) Workflow Standards

- **Fast Feedback Loop:** Run unit and critical API smoke tests on every PR commit (< 5 minutes).
- **Parallelization:** Shard E2E tests across matrix runners in GitHub Actions / GitLab CI.
- **Test Artifacts:** Store screenshots, videos, trace files, and Allure / HTML test reports as CI build artifacts on failure.
- **Flaky Test Quarantine:** Automatically flag and quarantine flaky tests rather than letting them block releases, logging them to a dedicated defect queue.
