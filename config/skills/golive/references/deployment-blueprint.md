# Deployment Blueprint & Ownership Handover Rubric

Template and operational specification for planning and completing safe production handovers under the `golive` protocol.

---

## 1. Blueprint Artifact Template (`deployment-blueprint.md`)

```markdown
# Production Deployment Blueprint: [Project Name]
*Generated at: [Timestamp]*

### 1. Detected Stack Requirements
- **Frontend / SSR**: [e.g. Next.js 15 App Router -> Vercel]
- **Relational Storage**: [e.g. PostgreSQL 16 -> Supabase]
- **Custom Domain**: [e.g. app.example.com -> Cloudflare DNS]
- **Third-Party Services**: [e.g. Stripe Billing, Resend SMTP]

### 2. Action Plan & Provider Mutations
| Provider | Target Resource | Action | Auth Method |
|---|---|---|---|
| Supabase | Database `db-prod` | Apply SQL migrations | CLI / MCP session |
| Vercel | Project `app-prod` | `vercel --prod` deploy | Local CLI token |
| Cloudflare | CNAME `app.example.com` | Create DNS record | API token |
| Stripe | Webhook Endpoint | Register `https://.../api/webhooks/stripe` | Stripe CLI |

### 3. Required Environment Secrets
- [ ] `DATABASE_URL` (Supabase Connection Pooler)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`
- [ ] `RESEND_API_KEY`

> [!WARNING]
> Production deploys modify live infrastructure. Do you approve proceeding with this plan?
```

---

## 2. Verification Rubric (Post-Deploy Checks)
1. **HTTP Status & Headers**: Verify `200 OK` on root URL and critical routes.
2. **TLS / SSL Certificate**: Confirm valid HTTPS termination without handshake errors.
3. **Database Health**: Verify successful connection pooler query (`SELECT 1`).
4. **Webhook Handshake**: Send test ping event to webhook endpoints and assert `200` response.

---

## 3. Ownership Handover Document (`INFRASTRUCTURE.md`)
Upon deployment completion, dump a permanent ownership inventory at the project root documenting live URLs, resource IDs, provider dashboards, and maintenance commands.
