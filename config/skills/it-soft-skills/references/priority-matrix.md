# Incident Severity & Priority Triage Matrix

> Operational calibration for categorizing engineering incidents, technical backlog items, and competing deadlines by business impact.

---

## 1. Incident Severity Classification (SEV-1 to SEV-4)

| Severity Level | Definition & Business Impact Scope | Initial Response SLA | Status Update Cadence | Escalation & Notification Scope |
|---|---|---|---|---|
| **SEV-1 (Critical / Outage)** | Core revenue-generating path or public system completely offline. Data loss risk or active security breach. $> 25\%$ user base blocked with no workaround. | $< 15$ Minutes | Every 15–20 Minutes | All hands, Engineering Leadership, C-Level, Public Status Page. |
| **SEV-2 (Major Degradation)** | Significant business impact. Core system impaired but functional via degraded fallback, or critical sub-service down affecting $< 25\%$ users. No clean workaround. | $< 30$ Minutes | Every 30–45 Minutes | Incident Commander, Service Tech Leads, Customer Support Lead. |
| **SEV-3 (Minor / Workaround Available)** | Non-critical functionality degraded or broken. Viable manual workaround exists. Impact confined to a small subset of non-paying or internal users. | $< 4$ Hours | Every 2–4 Hours | Owning Engineering Team, Service Scribe. |
| **SEV-4 (Low / Cosmetic)** | Cosmetic bug, minor UI typo, non-blocking telemetry irregularity, or documentation inconsistency. Zero transaction disruption. | Next Business Day | As part of regular sprint cadence | Product Backlog, Routine Sprint Review. |

---

## 2. Business Impact vs. Artificial Urgency Calibration

When multiple stakeholders demand simultaneous emergency intervention, evaluate along two independent orthogonal axes:

```
           HIGH BUSINESS IMPACT
                    │
   [Q2: Strategic]  │  [Q1: True Emergency]
   Plan architecture│  Drop everything,
   and schedule CI  │  stabilize immediately
   gates            │  (SEV-1 / SEV-2)
────────────────────┼────────────────────
 LOW URGENCY        │        HIGH URGENCY
                    │
   [Q4: Eliminate]  │  [Q3: Distractor]
   Log to backlog   │  Negotiate workaround,
   or deprioritize  │  filter artificial panic
                    │
            LOW BUSINESS IMPACT
```

### Triaging Heuristics:
1. **The Volume Bias Trap (The Loudest Voice Fallacy)**:
   - High perceived urgency from a single loud stakeholder does not equal high business impact.
   - Assert: *Does this impair critical transactions, breach legal SLAs, or compromise security?* If no, assign SEV-3/4 regardless of volume.
2. **Blast Radius Measurement**:
   - Total impact = $(\text{Number of Impacted Accounts}) \times (\text{Financial/Data Severity per Account})$.
3. **The Workaround Test**:
   - If an automated or documented manual procedure restores full user capability in $< 5$ minutes, downgrade incident urgency by one level.
