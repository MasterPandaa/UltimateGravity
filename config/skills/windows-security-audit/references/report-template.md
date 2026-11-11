# Windows Security Audit Report Template

When delivering a Windows security audit, adhere strictly to this structured format. Ensure sensitive secrets, passwords, and tokens are masked.

---

```markdown
# 🛡️ Windows Security & Threat Audit Report

**Host Name**   : <COMPUTERNAME>
**Audit Date**  : <YYYY-MM-DD HH:MM:SS>
**Auditor**     : Security Engineer (AppSec Sentinel)
**OS Version**  : <Windows Edition, Version, Build>
**Elevation**   : <Administrator / Standard User>

---

## 1. Executive Summary
- **Overall Posture**: SECURE / ATTENTION REQUIRED / CRITICAL RISK
- **Key Summary**: <1-2 paragraphs summarizing hardening posture, active threat signs, and software currency>
- **Finding Totals**: 
  - 🚨 Critical : <Count>
  - ⚠️ High     : <Count>
  - 🟡 Medium   : <Count>
  - 🔵 Low      : <Count>
  - ℹ️ Info     : <Count>

---

## 2. Threat Intel Snapshot (Live Data)
- **CISA KEV Matches**     : <List of matching installed software or "None">
- **Patch Tuesday Status** : <Last hotfix date and patch freshness>
- **Zero-Day Exposure**    : <Status of Chromium, Next.js, PHP, or Windows zero-days>

---

## 3. Detailed Findings & Recommendations

### [FINDING-01] <Title>
- **Severity**    : CRITICAL / HIGH / MEDIUM / LOW / INFO
- **Confidence**  : Confirmed / Suspicious / Informational
- **Area**        : Ransomware / Memory Integrity / Persistence / Network / AI-Agent / Stack
- **Evidence**    : `<Concrete telemetry, registry key, process path, or command snippet>`
- **Impact**      : <Blast radius and exploitability description>
- **Remediation** : `<Concrete PowerShell or configuration command to harden>`
- **Rollback**    : `<Command to revert if business disruption occurs>`

---

## 4. Verified Strong Baselines (Passed Checks)
- [x] Microsoft Defender Real-Time & Tamper Protection: Active
- [x] LSA Protection (RunAsPPL): Enforced
- [x] Disk Health (SMART): All drives Healthy
- [x] ...

---

## 5. Audit Boundaries & Out-of-Scope Limitations
- *Example*: Kernel-level rootkits or dormant logic bombs cannot be completely verified without offline boot media or specialized EDR.
- *Example*: Some checks were skipped due to running as non-elevated user.
```
