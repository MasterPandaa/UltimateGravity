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
