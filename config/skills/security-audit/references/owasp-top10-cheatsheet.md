# OWASP Top 10 & API Security Cheat Sheet

This reference details the core vulnerability vectors, code-level indicators, and mandatory remediation patterns for application and API security audits.

---

## 1. Injection (SQL, NoSQL, Command)
- **CWE-89 (SQLi)**:
  - *Vulnerable*: `db.query(f"SELECT * FROM accounts WHERE id = '{user_id}'")`
  - *Remediation*: Always use parameterized queries or type-safe ORM prepared statements: `db.query("SELECT * FROM accounts WHERE id = $1", [user_id])`.
- **CWE-78 (Command Injection)**:
  - *Vulnerable*: `subprocess.run(f"ping {host}", shell=True)`
  - *Remediation*: Pass arguments as arrays without invoking shell interpreter: `subprocess.run(["ping", "-c", "1", host], shell=False)`.

---

## 2. Broken Object Level Authorization (BOLA / IDOR)
- **API1:2023**: Occurs when an API endpoint takes an object ID directly from client requests without verifying whether the requesting user owns that object.
  - *Vulnerable*:
    ```python
    @app.get("/api/documents/{doc_id}")
    def get_doc(doc_id: int):
        return db.query(Document).filter(Document.id == doc_id).first()
    ```
  - *Remediation*: Enforce tenant/ownership boundaries on every query:
    ```python
    @app.get("/api/documents/{doc_id}")
    def get_doc(doc_id: int, current_user = Depends(get_current_user)):
        doc = db.query(Document).filter(Document.id == doc_id, Document.tenant_id == current_user.tenant_id).first()
        if not doc:
            raise HTTPException(status_code=404)
        return doc
    ```

---

## 3. Server-Side Request Forgery (SSRF)
- **CWE-918**:
  - *Vulnerable*: Fetching a user-supplied URL directly via `requests.get(target_url)`.
  - *Remediation*: Validate scheme (`http`, `https` only), resolve DNS, and block private/loopback IP spaces (`127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.169.254`).

---

## 4. Modern Attack Payloads & Bypass Heuristics (PayloadsAllTheThings Patterns)

> **Pattern Origin**: Absorbed heuristics from `swisskyrepo/payloadsallthethings` (§8 External Proposal Protocol).

### A. SQLi WAF & Filter Bypass Heuristics
- **Whitespace Obfuscation**: Replace literal spaces with inline comments (`SELECT/**/password/**/FROM/**/users`), URL encodings (`%20`, `%09`, `%0a`, `%0b`, `%0c`, `%0d`, `%a0`), or parenthesis wrapping: `SELECT(id)FROM(users)WHERE(id=1)`.
- **String & Concatenation Evasion**:
  - MySQL / SQLite: `CONCAT('ad','min')`, `'ad'||'min'`, or hex literals: `0x61646d696e`.
  - Postgres: `CHR(97)||CHR(100)||CHR(109)||CHR(105)||CHR(110)`.
- **Comment Termination Variations**: Modern parser variants exploit `-- -`, `--+`, `#`, `/*`, or NULL-byte injection `;%00`.

### B. SSRF Cloud Metadata & DNS Rebinding Bypasses
- **Alternative IP Representations**: Defeat basic regex IP filters targeting `169.254.169.254` (AWS/GCP metadata) and `127.0.0.1`:
  - Decimal notation: `http://2852039166/` (resolves to `169.254.169.254`), `http://2130706433/` (`127.0.0.1`).
  - Hexadecimal notation: `http://0xa9fea9fe/`, `http://0x7f000001/`.
  - IPv6 mapped: `http://[::ffff:169.254.169.254]/`, `http://[::1]/`.
  - Enclosed alphanumerics / short forms: `http://127.1/`, `http://0/`.
- **DNS Rebinding & Redirect Chains**:
  - Attacker domain configured with 0-second TTL initially resolving to public IP (passes filter), subsequent query resolves to `127.0.0.1`.
  - HTTP `302/307` redirect from allowed external host pointing directly to internal link-local addresses.
  - *Remediation Invariant*: Always re-resolve DNS immediately prior to socket connect and disable automated redirect following on client sessions.

### C. Prototype Pollution & Property Injection (Node.js/JS)
- **Attack Vectors**: Recursive object merge, clone, or query-string parser functions accepting unvalidated user keys:
  - Payload keys: `__proto__.polluted`, `constructor.prototype.polluted`.
- **Audit Verification Invariants**:
  - Assert that object creations use `Object.create(null)` or `Map` collections when mapping arbitrary user keys.
  - Validate and reject any JSON payload keys matching `__proto__`, `constructor`, or `prototype` before deep assign or merge.

### D. CRLF & Header Injection (Response Splitting)
- **Vector**: User input concatenated into response headers (`Set-Cookie`, `Location`) without stripping `%0d%0a` (`\r\n`).
- **Remediation**: Strip all CR (`\r`) and LF (`\n`) characters from header values; use modern HTTP frameworks that reject control characters in header setters.

---

## 4. Common AI-Generated Code Vulnerability Signatures

> **Pattern Origin**: Absorbed from `avivgerz-hue/vibe-shield` (§8 External Proposal Protocol).

Audits 4 high-frequency architectural blindspots produced by LLM code generation:

### A. Unauthenticated Mutating Endpoints (CWE-306)
- **Vector**: Coding agents frequently generate `DELETE`, `PUT`, or `POST` API handlers (e.g. Next.js `app/api/.../route.ts`) that parse JSON and mutate database rows without session verification.
- **Remediation**: Mandate authentication middleware and tenant ownership verification (`WHERE id = :id AND tenant_id = :session.tenant_id`) before any mutating query.

### B. Missing Database Row Level Security (RLS / CWE-284)
- **Vector**: Migration scripts generated for Supabase, PostgreSQL, or SQLite create new tables but omit RLS policies.
- **Remediation**: Always append `ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;` and define explicit `CREATE POLICY` statements for select, insert, update, and delete operations.

### C. Client-Side Secret Leakage via Framework Prefixes (CWE-200)
- **Vector**: Storing private tokens in `.env` with public framework prefixes (`NEXT_PUBLIC_STRIPE_SECRET`, `VITE_ADMIN_KEY`), causing build bundlers to embed plaintext credentials into client JavaScript bundles.
- **Remediation**: Strictly enforce server-only access for credentials; restrict public prefixes solely to non-sensitive publishable IDs.

### D. Production Source Map & Debug Exposure (CWE-548)
- **Vector**: Build configurations with `productionSourceMap: true` or `sourcemap: true` in `vite.config.ts` / `next.config.js` shipping raw TypeScript source code, backend route logic, and internal API contracts to public production assets.
- **Remediation**: Disable source maps in production builds (`sourcemap: false` or `hidden-source-map` for private Sentry upload only).

