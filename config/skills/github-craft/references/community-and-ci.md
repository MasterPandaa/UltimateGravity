# Community Governance & CI/CD Pipeline Standard

> Engineering specification for achieving a 100% GitHub Community Health score and setting up verifiable GitHub Actions CI pipelines.

---

## 1. The 100% GitHub Community Health Standard

GitHub's Community Profile endpoint (`repos/<owner>/<repo>/community/profile`) measures repository trust and maturity. A health score below 70% repels serious contributors and enterprise adopters.

To achieve **100% Health Percentage**, every repository must include these root and `.github/` assets:

| Asset | Location | Purpose |
|---|---|---|
| `README.md` | Root | Value proposition, architecture, quickstart, and author attribution. |
| `LICENSE` | Root | Permissive open-source license (MIT, Apache 2.0). |
| `SECURITY.md` | Root | Responsible vulnerability disclosure, supported versions, and SLA. |
| `CONTRIBUTING.md` | Root | Pull request standards, machine verification criteria, and branch conventions. |
| `CODE_OF_CONDUCT.md` | Root | Contributor Covenant v2.1 professional community guidelines. |
| `PULL_REQUEST_TEMPLATE.md` | `.github/` | Verification evidence checklist, test logs, and blast-radius assertions. |
| `bug_report.yml` | `.github/ISSUE_TEMPLATE/` | Interactive GitHub Issue Form for bug reproduction. |
| `feature_request.yml` | `.github/ISSUE_TEMPLATE/` | Interactive GitHub Issue Form for enhancement proposals. |
| `config.yml` | `.github/ISSUE_TEMPLATE/` | Directs general Q&A to GitHub Discussions. |

---

## 2. GitHub Actions CI Pipeline Specification

Claiming that an agent or repository enforces "The Iron Law of Verification" is hollow without automated machine proof on every push and pull request.

### Standard Workflow (`.github/workflows/bench.yml`)
```yaml
name: CI & Benchmark Verification

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  benchmark:
    name: Run Benchmark Regression Suite
    runs-on: windows-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Prepare Test Fixtures
        run: |
          if (!(Test-Path "config/mcp_config.json")) {
            Copy-Item "config/mcp_config.template.json" "config/mcp_config.json" -Force
          }
          if (!(Test-Path "config/skill-usage.json")) {
            '{"security-audit":{"usageCount":1},"clean-code-fullstack":{"usageCount":1}}' | Out-File -FilePath "config/skill-usage.json" -Encoding utf8
          }
        shell: pwsh

      - name: Run Benchmark Regression Suite
        run: node scripts/bench-runner.js run
```

### CI Invariants
1. **Deterministic Exit Codes**: The test runner must explicitly call `process.exit(1)` when any test fails or when regressions are detected.
2. **Fresh Clone Portability**: The pipeline must handle fresh checkouts gracefully without expecting existing user profile paths (`C:/Users/...`).
3. **Execution SLA**: Benchmark runs should complete within $\le 30$ seconds to prevent PR review bottlenecks.

---

## 3. Community Feature Configuration via `gh` CLI

```powershell
# Enable Discussions and disable dead Wiki tab
gh repo edit <owner>/<repo> `
  --enable-discussions `
  --enable-wiki=false

# Verify Community Profile Health
gh api repos/<owner>/<repo>/community/profile --jq '.health_percentage'
# => 100
```
