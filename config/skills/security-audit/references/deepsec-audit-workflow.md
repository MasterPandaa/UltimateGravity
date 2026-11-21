# DeepSec Two-Pass Adversarial Security Audit Protocol

Authoritative operational specification for conducting high-precision, low-false-positive vulnerability audits and penetration reviews across codebases, APIs, and AI agent harnesses. Inspired by Vercel Labs' `deepsec` architecture.

---

## 🧭 The Core Dilemma: Eliminating Single-Pass False Positives

Single-pass AI security reviews suffer from severe false-positive rates (~40–60%), flagging benign idiomatic patterns, unreachable execution branches, and framework-level abstractions as "critical vulnerabilities".

To achieve production-grade precision, **all security reviews must execute the Two-Pass Adversarial Revalidation Protocol**:
```
Untrusted Input ──> [Stage 1: Surface Scan] ──> [Stage 2: Taint Investigation] ──> [Stage 3: Adversarial Falsification] ──> [Stage 4: Enriched Export]
                                                          │                                      │
                                                   (Vulnerability                        (Attempts to DISPROVE
                                                     Hypothesis)                           or REPRODUCE)
```

---

## 🛠️ The 4-Stage Audit Pipeline

### Stage 1: Static Surface & Sink Mapping
Scan entry points and sensitive execution sinks using AST queries or ripgrep (`rg`):
- **Entry Points (Untrusted Sources)**: HTTP route params (`req.params`, `req.query`, `req.body`), headers, cookies, webhooks, file uploads, CLI arguments, environment variable overrides.
- **Sensitive Sinks**:
  - *SQL / ORM Sinks*: Raw queries, unparameterized strings (`queryRawUnsafe`, string formatting in SQL).
  - *Command Sinks*: `child_process.exec`, `os.system`, `subprocess.Popen(shell=True)`.
  - *Rendering Sinks*: `dangerouslySetInnerHTML`, `v-html`, unescaped template interpolation.
  - *Filesystem Sinks*: `fs.readFile`, `path.join` with unsanitized user path segments (Path Traversal).
  - *Network Sinks*: Server-side fetch/axios targeting user-supplied URLs (SSRF).

### Stage 2: Taint Investigation (Hypothesis Formulation)
Trace data flow from Source to Sink:
1. Identify all transformations, parsers, and intermediate variable assignments.
2. Note missing validation seams or type-coercion pitfalls.
3. Formulate an initial **Vulnerability Hypothesis** specifying:
   - Target Sink and CWE classification.
   - Theoretical input payload triggering execution.
   - Assumed blast radius.

### Stage 3: Adversarial Revalidation & Falsification (The Critical Gate)
Before reporting any finding to the user or opening an issue, switch to an **Adversarial Critic Persona**. The critic's sole objective is to **DISPROVE** the finding using this 4-step checklist:

| Check | Falsification Criteria (If YES &rarr; Discard as False Positive) |
|---|---|
| **1. Upstream Middleware Guard** | Is the endpoint guarded by authentication/authorization middleware (e.g., admin-only role guard, JWT validator) that renders the attacker model invalid? |
| **2. Framework Auto-Sanitization** | Does the framework/ORM automatically parameterize or escape inputs (e.g., Prisma prepared statements, React JSX automatic HTML escaping, Zod schema coercion)? |
| **3. Path Unreachability** | Is the execution path dead code, gated by an impossible condition, or strictly limited to local development/test environments? |
| **4. Reproducible Exploit Seam** | Can a deterministic Proof-of-Concept (curl payload, unit test, mock input) be constructed? **If a working PoC cannot be modeled even theoretically, the finding is unverified.** |

*Decision Rule*:
- If the critic **successfully falsifies** the hypothesis &rarr; **DISCARD SILENTLY** or downgrade to an informational code hygiene note.
- If the critic **fails to falsify** the hypothesis &rarr; **CONFIRM VULNERABILITY**, calibrate severity, and proceed to Stage 4.

### Stage 3.1: Call-Graph Reachability Invariant (Absorbed from Endor Labs Agent Kit)
When auditing third-party dependencies (SCA triage):
1. **The Reachability Filter**: Up to 80% of CVE alerts reported by package scanners (`npm audit`, `pip check`) originate from dormant functions never imported or reachable from application entry points.
2. **AST Reachability Verification**:
   - Trace the AST import graph from route handlers and service entry points to the vulnerable library function.
   - If the vulnerable symbol/method is never reachable along any execution path, classify as **DORMANT / LOW PRIORITY**.
   - Prohibit aggressive major version upgrades that break backward compatibility solely to silence an unreachable vulnerability alert.

### Stage 4: Context Enrichment & Minimal Surgical Patch
Enrich confirmed findings with actionable engineering context:
1. **Git Context**: Identify the introducing commit, author, and recency (`git log -S <symbol>`).
2. **Minimal Drop-In Patch**: Provide the exact, surgical code replacement fixing the sink without altering business logic.
3. **Regression Test**: Specify a negative test case (unit test or integration test) that asserts payload rejection.

---

## 📊 Severity Classification & Threshold Matrix

| Severity | Exploitability | Impact | Action SLA |
|---|---|---|---|
| **CRITICAL** | Remote, unauthenticated, zero-interaction | Full RCE, unauthenticated DB dump, auth bypass | Immediate blocker; halt release |
| **HIGH** | Authenticated low-privilege or trivial exploit | IDOR/BOLA cross-tenant read/write, SSRF to cloud metadata | Fix before merge |
| **MEDIUM** | Requires specific preconditions or social engineering | Stored XSS, missing rate limiting on non-auth routes | Track in backlog sprint |
| **LOW / INFO** | Theoretical or defense-in-depth improvement | Missing security headers, verbose error messages | Next scheduled cleanup |

### HackerOne VRT Calibration & 7-Question Validation Gate (Absorbed from `Claude-BugHunter`)
To prevent severity inflation and false-positive churn, align findings to Bugcrowd / HackerOne Vulnerability Rating Taxonomy (VRT) and assert the **7-Question Validation Gate**:
1. **Source Reachability**: Is the target sink reachable from an untrusted user input boundary?
2. **Reproducible PoC**: Can a deterministic proof-of-concept (curl command or unit test assertion) be modeled?
3. **Framework Bypass Proof**: Are framework-level protections (ORM escaping, auto-sanitization, middleware auth) demonstrably bypassed?
4. **Concrete Business Impact**: Does the finding prove direct data loss, authorization breach, or service disruption (not theoretical style advice)?
5. **AST Reachability**: For CVE/SCA dependencies, is the vulnerable method actively invoked in application code paths (zero dormant alerts)?
6. **Surgical Remediation**: Does the proposed patch directly close the vulnerability without breaking business logic?
7. **Regression Guard**: Is an automated negative test provided to ensure the vulnerability cannot silently reappear?

---

## 📝 Enriched Security Finding Schema

When outputting confirmed findings, format strictly as follows:
```markdown
[CONFIRMED SECURITY FINDING - TWO-PASS VERIFIED]
- Title              : <Vulnerability Title>
- Severity           : CRITICAL / HIGH / MEDIUM / LOW
- CWE / OWASP        : <e.g., CWE-89: SQL Injection | OWASP Top 10 A03:2021>
- Target Location    : <path/to/file#Lxx-Lyy>
- Source-to-Sink Map : <Source input> ──> <Intermediate transform> ──> <Vulnerable sink>
- Falsification Proof: <Detailed explanation of why framework protections/middleware fail to stop this>
- Reproducible PoC   : `<Payload / curl snippet demonstrating execution>`
- Surgical Patch     :
  ```diff
  - <vulnerable line>
  + <safe parameterized line>
  ```
- Regression Test    : `<Description or code snippet of automated test preventing regression>`
```

---

## 🛡️ STRIDE Pre-Implementation Threat Modeling & Trust Boundaries

> Absorbed from `inbharatai/claude-skills` (`threat-modeler`). Architectural threat modeling conducted during system design *prior* to code implementation.

### 1. The STRIDE Categorization Matrix
| Threat Category | Target Property | Primary Attack Vector | Mandatory Architectural Defense |
|---|---|---|---|
| **S**poofing | Authenticity | Pretending to be another user, service, or machine. | Multi-factor authentication, cryptographic signatures, strict JWT validation, mutual TLS. |
| **T**ampering | Integrity | Modifying data in transit or memory without authorization. | Cryptographic hashes, TLS 1.3, DB constraints, immutable append-only logs, signed tokens. |
| **R**epudiation | Non-repudiation | Denying an action took place due to absent audit trails. | Append-only audit logs with request IDs, timestamps, immutable storage (WORM), digital signatures. |
| **I**nformation Disclosure | Confidentiality | Exposing confidential data, tokens, or PII to untrusted actors. | Encryption at rest (AES-256) & transit (TLS), least privilege RBAC, secret masking in logs, zero plain secrets. |
| **D**enial of Service | Availability | Exhausting CPU, memory, connection pools, or bandwidth. | Rate limiting (Token Bucket / Leaky Bucket), request timeouts, circuit breakers, query pagination, CDN caching. |
| **E**levation of Privilege | Authorization | Gaining unauthorized administrative or cross-tenant permissions. | Strict server-side resource-level authorization (BOLA/IDOR defense), least-privilege service accounts, no role spoofing. |

### 2. Trust Boundaries & Data Flow Diagrams (DFDs)
Map all system data flows across 4 distinct trust boundaries:
1. **Public / Untrusted Zone**: Client browsers, external mobile devices, 3rd-party webhook callers.
2. **DMZ / Perimeter Zone**: Reverse proxies, API gateways, Cloudflare WAF, load balancers.
3. **Internal Core Zone**: Application microservices, message queues, private RPC handlers.
4. **Secure Data Vault**: Relational databases, object storage, KMS key stores.

*Invariant*: Every data flow that crosses a boundary from a lower-trust zone to a higher-trust zone must enforce **strict boundary validation (Zod/Pydantic)** and **cryptographic identity verification**.
