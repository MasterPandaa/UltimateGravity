---
name: golive
description: "[Safe Production Deployment Protocol] Direct-to-account deployment workflow (Detect -> Plan -> Approve -> Apply -> Verify) across Vercel, Supabase, Cloudflare, and Stripe with zero telemetry and hard approval gating."
---

# GoLive — Safe Production Deployment Protocol

Direct-to-account full-stack deployment protocol ensuring zero lock-in, direct infrastructure ownership, and mandatory human confirmation before touching production.

---

## 1. The 5-Step Deployment Lifecycle

### Step 1: Detect (Infrastructure Audit)
Scan project files to identify required cloud services:
* **Hosting**: Next.js, Vite, or static build artifacts (`vercel.json`, `package.json`).
* **Database**: PostgreSQL schema or Supabase migrations (`supabase/migrations`).
* **DNS & Domains**: Custom domain records or routing rules.
* **Integrations**: Stripe checkout/webhooks, Resend transactional email.

### Step 2: Plan (Blueprint Formulation)
Generate a structured markdown deployment plan (`deployment-blueprint.md`):
* Detail exact resources to provision, environment variables, and target providers.
* Surface estimated costs, domain mappings, and secret dependencies.

### Step 3: Approve (Mandatory Hard Guardrail §5)
* **HALT**: Never execute deployments or DNS updates without explicit user confirmation.
* Present the blueprint and request confirmation via the `ask_question` tool or prompt.

### Step 4: Apply (Direct-to-Account Provisioning)
Execute provisioning using authenticated local CLI sessions or MCP servers:
* **Frontend**: `vercel --prod` or `wrangler pages deploy`.
* **Database**: `supabase db push` or execute SQL migrations.
* **Payments & Email**: Configure Stripe test/live webhooks and Resend API keys.

### Step 5: Verify & Handover
1. Probe live endpoints: verify HTTP 200, SSL termination, and API health checks.
2. Generate `INFRASTRUCTURE.md` at project root documenting resource IDs and links.

---

## 2. Invariants & Guardrails
1. **Zero Secret Leakage**: Never log, print, or commit plaintext API keys or service tokens.
2. **Double-Confirmation Gate**: Production deploys require explicit human consent (§5).
3. **No Third-Party Intermediaries**: Deploy strictly to user-owned provider accounts.
