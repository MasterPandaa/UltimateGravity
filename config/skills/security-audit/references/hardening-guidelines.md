# Hardening Guidelines: Security Headers & CI/CD Integrity

## 1. Mandatory HTTP Security Headers

Production web servers and API gateways must return the following defensive response headers:

```http
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), camera=(), microphone=()
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none';
```

---

## 2. CI/CD Pipeline & GitHub Actions Hardening

1. **Pin Actions by Full Commit SHA**: Never pin third-party actions to mutable tags (e.g. `actions/checkout@v4` $\rightarrow$ use `actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11`).
2. **Minimize Token Permissions**: Default to read-only permissions in workflow headers:
   ```yaml
   permissions:
     contents: read
   ```
3. **Prevent Script Injection in Workflows**: Never inline untrusted context variables (`github.event.pull_request.title`, `github.event.issue.body`) into `run:` bash steps. Map them to environment variables first:
   ```yaml
   # GOOD:
   env:
     PR_TITLE: ${{ github.event.pull_request.title }}
   run: echo "$PR_TITLE"
   ```
