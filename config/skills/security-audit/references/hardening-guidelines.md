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

---

## 3. Infrastructure as Code (IaC) & Container Hardening (Checkov Invariants)

> **Pattern Origin**: Absorbed declarative policy heuristics from `bridgecrewio/checkov` (§8 External Proposal Protocol).

### A. Dockerfile Static Security Invariants
When authoring or reviewing container builds, assert 5 static security invariants:
1. **Rootless User Invariant (CKV_DOCKER_3)**:
   - Prohibit running containers as default root. Explicitly specify a dedicated non-root user and group before `ENTRYPOINT`/`CMD`:
     ```dockerfile
     RUN addgroup -S appgroup && adduser -S appuser -G appgroup
     USER appuser
     ```
2. **Immutable Digest Pinning (CKV_DOCKER_2)**:
   - Base images must be pinned to immutable SHA256 digests or exact semver tags. Strictly ban `:latest`, unversioned tags, or floating major versions.
3. **Zero Plaintext Secrets in ENV/ARG (CKV_DOCKER_4)**:
   - Never embed credentials, API tokens, or private keys in `ENV` or `ARG` instructions (they persist in image layers). Use secret build mounts:
     ```dockerfile
     RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm install
     ```
4. **Mandatory Production Healthcheck (CKV_DOCKER_7)**:
   - Containers serving network services must define an explicit `HEALTHCHECK` instruction to enable orchestration liveness/readiness probes:
     ```dockerfile
     HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD curl -f http://localhost:8080/health || exit 1
     ```
5. **Clean Package Cache (CKV_DOCKER_8)**:
   - Clear package manager indices within the same layer to eliminate bloat and obsolete CVE surface (`rm -rf /var/lib/apt/lists/*` or `apk add --no-cache`).

### B. Cloud & IaC Declarative Assertions (Terraform & Kubernetes)
1. **Zero Unrestricted Management Ingress (CKV_AWS_24 / CKV_AZURE_9)**:
   - Security groups must never expose management ports (`22` SSH, `3389` RDP, `5432` Postgres, `3306` MySQL) to `0.0.0.0/0`. Restrict ingress strictly to bastion or VPC CIDRs.
2. **Object Storage Public Access & Encryption (CKV_AWS_19 / CKV_GCP_6)**:
   - All cloud storage buckets must enforce public access block configurations (`block_public_acls = true`, `block_public_policy = true`) and default server-side encryption enabled (SSE-KMS or AES-256).
3. **Kubernetes Workload SecurityContext (CKV_K8S_16 / CKV_K8S_20)**:
   - Pod and container manifests must enforce:
     ```yaml
     securityContext:
       allowPrivilegeEscalation: false
       readOnlyRootFilesystem: true
       runAsNonRoot: true
       capabilities:
         drop:
           - ALL
     ```

---

## 4. Antigravity Agent Runtime Hardening & Setup Defenses

> **Pattern Origin**: Absorbed from `esrakadah/agy-setup-audit` (§8 External Proposal Protocol).

Mitigates silent agent configuration vulnerabilities and prevents unverified runtime modifications.

### A. The 5 Antigravity Silent Failure Invariants
1. **Rule File 24KB Truncation Cap**:
   - Files under `.agents/rules/` and `GEMINI.md` exceeding **24,000 bytes** are silently truncated by the Antigravity runtime at byte 24,000 without emitting an error.
   - *Defense*: Enforce an 80% warning threshold (19,200 bytes) and modularize rules via `@[label](path)` includes before exceeding 20KB.
2. **Aggregate Rule Token Budget (20,000 Tokens)**:
   - Total active rules injected on Turn 0 must stay below 20,000 tokens (~80,000 bytes). Exceeding this dilutes LLM attention and triggers instruction drop-off.
3. **Reviewer & Critic Tool Isolation**:
   - Subagents assigned to review, audit, lint, or security critic roles must have strictly **read-only** tool allowlists (`read_file`, `search_web`, `send_message`, `ask_question`).
   - Granting write tools (`write_file`, `edit_file`, `run_command`) to adversarial reviewer roles creates unauthorized workspace mutation risks.
4. **Tool Schema Identifier Hygiene**:
   - Misspelling native or MCP tool names in subagent manifests (e.g., `veiw_file` instead of `read_file` or `view_file`) causes the agent runtime to stall indefinitely waiting for non-existent tools.
5. **AST PreToolUse Protected Branch & Force-Push Guard**:
   - Intercept shell execution (`run_command`) at the AST segment level.
   - Deny commands containing destructive git operations against protected branches (`main`, `master`):
     - Blanket pushes: `git push --all`, `git push --mirror`.
     - Direct protected pushes: `git push origin main`, `git push origin master`.
     - Force pushes: `-f`, `--force`, `--force-with-lease` without explicit double-confirmation.
