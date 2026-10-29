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
