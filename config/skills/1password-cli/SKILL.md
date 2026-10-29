---
name: 1password-cli
description: "[1Password CLI Secret Injector] Secure credential management and headless secret injection via 1Password CLI (op run/inject). DO NOT USE for application-level environment variable configuration or public configs."
---

# 1Password CLI (`op`)

The definitive credentials management and secret injection suite for autonomous agents and developer tooling. Integrates the 1Password CLI (`op`) to enable seamless access to vaults, tokens, and environment variables with zero credential leakage into logs, shell history, chat contexts, or persistent storage.

---

## Non-Negotiable Security Rules & Guardrails

### 1. The Zero-Disk Secret Ingestion Gate
- **Never Write Secrets to Disk**: Never write plaintext secrets, API tokens, private keys, or `.env` files with real credentials to the workspace or filesystem.
- **Process Memory Injection Only**: Always inject credentials dynamically at execution time via `op run -- ...` or piped templates via `op inject`.
- **Zero Console Echo**: Never use `echo "$SECRET"`, `printenv`, or similar commands that dump secrets into stdout, logs, or agent conversation transcripts.

### 2. Vault Scoping & Principle of Least Privilege
- **Scoped Service Accounts**: In automated/agentic environments, always use dedicated Service Accounts (`OP_SERVICE_ACCOUNT_TOKEN`) restricted to specific vaults rather than global personal credentials.
- **Biometric or Session Gating**: On interactive workstations, rely on desktop integration biometrics (Touch ID / Windows Hello) or ephemeral CLI session tokens (`eval $(op signin)`).

---

## Operating Modes

| Mode | Domain | Primary Focus | Commands & Syntax |
|---|---|---|---|
| **Mode 1: Process Environment Injection** | Ephemeral process execution | Launch child processes with environment variables resolved in-memory. | `op run --env-file=.env.template -- <command>` |
| **Mode 2: Template Secret Injection** | In-memory configuration templating | Render config templates with `op://vault/item/field` references without disk writes. | `op inject -i config.tmpl.yaml` |
| **Mode 3: Vault & Credential Inspection** | Metadata and verification | Verify authentication, list accessible vaults, and read individual fields safely. | `op whoami`, `op vault list`, `op item get <item> --fields ...` |
| **Mode 4: CI/CD & Headless Service Accounts** | Automation & pipeline security | Configure non-interactive runners with service account tokens and strict permissions. | `export OP_SERVICE_ACCOUNT_TOKEN=...` |

---

## Standard Workflows & Patterns

### 1. Running Commands with Secret Injection (`op run`)
Create an environment template file (e.g. `.env.template`) containing secret references instead of values:
```bash
# .env.template (Safe to commit to Git)
DATABASE_URL=op://Production/db/connection-string
STRIPE_SECRET_KEY=op://Finance/stripe-api/secret-key
OPENAI_API_KEY=op://AI-Services/openai/credential
```
Execute your script or build tool with the secrets dynamically populated in-process:
```bash
op run --env-file=.env.template -- npm run dev
# Or for a single tool command:
op run --env-file=.env.template -- python scripts/deploy.py
```

### 2. Rendering Dynamic Configuration Files
When a tool strictly requires a configuration file at runtime:
```bash
# Generate config on-the-fly and pipe directly to stdout or ephemeral process stdin
op inject -i configs/app.template.json | docker login --username user --password-stdin
```

### 3. Reading Specific Fields Programmatically
Retrieve only the exact required field without dumping the entire item JSON:
```bash
# Retrieve a single field securely
op item get "Postgres Prod" --fields password --reveal
```

---

## Security Verification Checklist

- [ ] Does `.env.template` only contain `op://` reference URIs and no raw keys?
- [ ] Is `.env` or any file containing plaintext credentials listed in `.gitignore`?
- [ ] Are stdout and stderr streams free of raw credentials during script execution?
- [ ] Is `OP_SERVICE_ACCOUNT_TOKEN` scoped to the minimal necessary vaults?
- [ ] Did `op whoami` successfully confirm the expected account/vault identity before running scripts?
