---
name: security-audit
description: "[Application & API Security Pentest Audit] Rigorous security audit based on OWASP Top 10, API Security Top 10, CWE standards (SQLi, IDOR/BOLA, SSRF, XSS, auth bypass, secret leaks). DO NOT USE for routine PR diff reviews (use code-review) or LLM prompt security (use ai-infra-guard)."
---

# Security Audit: Vulnerability & Compliance Playbook

Guides Security Auditor (Isobu) and QA (Gyuki) in conducting rigorous, evidence-based security audits and penetration verification across application codebases, APIs, and AI agent skills.

## Table of Contents

- [Cloudflare 6-Phase Vulnerability Discovery Harness](#cloudflare-6-phase-vulnerability-discovery-harness)
- [Core Vulnerability Vectors to Audit](#core-vulnerability-vectors-to-audit)
- [5. Vibe-Coding Pre-Launch Safety Gate (Pencegahan Kebocoran Data & Runaway Billing)](#5-vibe-coding-pre-launch-safety-gate-pencegahan-kebocoran-data-runaway-billing)
- [Security Audit Report Format](#security-audit-report-format)

---

## Cloudflare 6-Phase Vulnerability Discovery Harness

1. **Attack Surface Mapping**:
   - Map all public, authenticated, and internal entry points (routes, controllers, WebSocket handlers, webhooks, CLI commands).
   - Identify trust boundaries: user-to-server, server-to-database, service-to-service, and LLM-to-tool boundaries.

2. **Threat Modeling & Attacker Profiles**:
   - Unauthenticated external attacker (credential stuffing, DDoS, BOLA, injection, SSRF).
   - Authenticated low-privilege tenant (privilege escalation, IDOR, data leakage across orgs).
   - Malicious insider / supply chain (compromised dependencies, poisoned prompts, leaked tokens).

3. **Static Analysis & Taint Tracking (Sources to Sinks)**:
   - Identify untrusted sources: `req.body`, `req.query`, `req.headers`, file uploads, external webhook payloads.
   - Trace flow to sensitive sinks: database queries (SQLi/NoSQLi), shell commands (RCE), HTML outputs (XSS), file paths (Path Traversal), redirect URLs (Open Redirect).
   - Verify proper validation and escaping exists strictly *between* source and sink.

4. **Trail of Bits Variant Analysis**:
   - When one flaw is discovered, grep and search AST for all similar patterns across the entire codebase.
   - Check if the root cause affects sibling endpoints, helper functions, or copied boilerplate.

5. **Deterministic Proof-of-Concept & Impact Analysis**:
   - Confirm exploitability without relying on theoretical assumptions.
   - Assess blast radius: data confidentiality loss, data integrity compromise, availability denial, or remote code execution.

6. **Surgical Remediation & Regression Safeguards**:
   - Provide concrete, minimal, drop-in replacement code.
   - Add negative tests / security test cases to ensure the vulnerability cannot resurface.

---

## Core Vulnerability Vectors to Audit

### 1. Authentication & Session Management
- [ ] **Hardcoded Secrets**: Scan for API keys, private tokens, database passwords, or JWT secrets committed in source code or git history.
- [ ] **Token Expiration & Invalidation**: Verify JWTs have realistic expiration times and are properly revoked on logout/blacklisted.
- [ ] **Password Hashing**: Enforce bcrypt, argon2, or scrypt with adequate work factors. Never accept plain MD5 or SHA1.
- [ ] **Session Fixation & Hijacking**: Ensure session IDs are regenerated upon privilege change (e.g. login).

### 2. Injection & Data Sanitization
- [ ] **SQL / ORM Injection**: Verify parameterized queries are used exclusively. Flag any raw string concatenation (`query = f"SELECT * FROM users WHERE id = {id}"`).
- [ ] **Cross-Site Scripting (XSS)**: Verify user input is escaped before rendering. Flag dangerous functions (`dangerouslySetInnerHTML`, `v-html`, unescaped raw HTML).
- [ ] **Command & Code Injection**: Audit shell execution points (`exec`, `spawn`, `os.system`, `eval`). Ensure inputs are strictly validated or passed via argument arrays, never raw command strings.
- [ ] **Server-Side Request Forgery (SSRF)**: Validate external URLs against private IP ranges (`10.0.0.0/8`, `127.0.0.0/8`, `192.168.0.0/16`, cloud metadata `169.254.169.254`).

### 3. API & Authorization Flaws (OWASP API Top 10)
- [ ] **BOLA / IDOR (Broken Object Level Authorization)**: Verify user A cannot read/modify user B's records simply by changing the ID in the URL (`/api/orders/123`). Ensure database queries filter by tenant/owner ID.
- [ ] **BFLA (Broken Function Level Authorization)**: Check that admin routes (`/api/admin/*`) enforce strict role guards on the server side, not just UI visibility.
- [ ] **Mass Assignment**: Ensure request bodies cannot overwrite sensitive entity fields (e.g., `isAdmin`, `verified`, `balance`, `role`).
- [ ] **Missing Rate Limiting**: Check that authentication endpoints (login, password reset, OTP verification) have strict IP and account-level rate limits.

### 4. Dependency, CI/CD & Configuration Security
- [ ] **CORS Misconfiguration**: Flag wildcards (`Access-Control-Allow-Origin: *`) combined with `Allow-Credentials: true`.
- [ ] **Security Headers**: Verify presence of `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, and `X-Frame-Options`.
- [ ] **CI/CD Pipeline Security**: Audit GitHub Actions workflows for script injections via pull_request context or untrusted expressions.

---

## 5. Vibe-Coding Pre-Launch Safety Gate (Data Leakage & Runaway Billing Prevention)

AI-generated applications (*vibe coding* via Lovable, Bolt, Cursor, Claude Code) often prioritize rapid feature delivery but remain fragile under public scrutiny. Before publishing production URLs, **verify these 4 deterministic safety gates**:

1. **Database Row Level Security (RLS) Gate (Lovable 170-App Breach Pattern)**:
   - Supabase/Firebase public keys (`anon_key` / `publishable_key`) live in client browsers. This is **ONLY SECURE** if RLS is enabled on **EVERY** table:
     ```sql
     ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
     -- Explicit policy required; without a policy, table is completely inaccessible:
     CREATE POLICY "Users can only read own data" ON public.users
       FOR SELECT USING (auth.uid() = id);
     ```
   - **Audit Check**: Ensure no table lacks RLS that allows unauthenticated `SELECT *` or `DELETE` from the browser console.
2. **Secret API Key & Git Hygiene Gate**:
   - Never place `service_role_key`, `OPENAI_API_KEY`, or private credentials in frontend variables (`NEXT_PUBLIC_*` or `VITE_*`) as they bundle into client JavaScript.
   - Verify `.gitignore`: Ensure `.env`, `.env.local`, `.env.production` are strictly excluded from public Git repositories.
3. **Rate Limiting & Anti-Spam Gate (Token Depletion Protection)**:
   - Enforce strict rate limiters (Upstash, Cloudflare, or sliding window middleware) on:
     - Authentication, OTP, and password reset endpoints (prevents credential stuffing and SMS/email bombing).
     - AI/LLM invocation endpoints (prevents automated bots from depleting API credit balances in minutes).
4. **Cloud Runaway Billing & Hard Limits Gate ($72k Milkie Way Pattern)**:
   - **Critical Warning**: Cloud provider budget alerts **DO NOT STOP** billing when breached; they only send notification emails.
   - Enforce **Hard Limits**: Set `max_instances` on serverless/Cloud Run, configure hard monthly spending caps on AI providers, and enforce strict execution timeouts (10–15s) to prevent runaway billing loops.

---

## Security Audit Report Format
When logging security findings, use this format:
```
[SECURITY FINDING]
- Title       : <Vulnerability Title>
- Severity    : CRITICAL / HIGH / MEDIUM / LOW
- CWE / OWASP : <e.g. CWE-89: SQL Injection / OWASP API1:2023 BOLA>
- Location    : <path/to/file#Lxx-Lyy>
- Evidence    : <Code snippet showing vulnerable pattern>
- Impact      : <Potential attack vector and consequence>
- Remediation : <Concrete replacement code fix>
- Variant Risk: <Other endpoints/files potentially affected>
```
