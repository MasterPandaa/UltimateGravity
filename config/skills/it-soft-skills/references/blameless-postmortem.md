# Blameless Post-Mortem & RCA Calibration Specification

> Engineering standard for conducting blameless incident retrospectives, root-cause analyses, and action-item tracking.

---

## 1. Blameless Retrospective Principles
- **Systemic Attribution**: Outages are failures of architecture, missing test suites, or deficient validation harnesses—never human mistakes.
- **Counterfactual Fallacy Prevention**: Avoid *"Could have / Should have"* statements. Focus on what conditions made the failure inevitable and why the harness failed to catch it before production.
- **Actionable Prevention**: A post-mortem is complete only when automated preventative gates (linter, CI test, architecture invariant, or canary rollback) are scheduled or deployed.

---

## 2. Tri-Label Confidence Calibration
To prevent unverified speculation from masquerading as ground truth, every assertion in technical diagnoses and post-mortems must carry one of three explicit confidence labels:

1. **`[Confirmed]`**:
   - Backed by physical proof: explicit stack trace, timestamped log entry, reproduction script, or failing test assertion with verified exit code.
2. **`[High Probability]`**:
   - Supported by strong correlational evidence (e.g., metric spikes aligned with deploy timestamp, error counts matching database pool exhaustion) but lacks direct instrumentation confirmation.
3. **`[Speculative/Hypothesis]`**:
   - Unproven theory or plausible conjecture. Must include a falsification test or required data source to verify or disprove.

---

## 3. The 3-Tier Root Cause Anatomy
Never stop at the immediate trigger. Decompose incidents into 3 distinct layers:
1. **The Trigger**: The proximate event that initiated failure (e.g., a query containing unescaped null characters).
2. **The Latent Root Cause**: The underlying systemic flaw (e.g., ORM schema definition omitted strict nullability checks, allowing bad state to persist).
3. **The Enabling Factor (Detection Gap)**: Why the harness failed to catch the defect earlier (e.g., integration tests mocked the database layer instead of running against a live schema).

---

## 4. Standard Blameless Post-Mortem Template

```markdown
# Incident Post-Mortem: [Incident Title]
**Date**: YYYY-MM-DD  
**Severity**: [SEV-1 / SEV-2 / SEV-3]  
**Incident Commander**: [Name/Role]  
**Lead Scribe**: [Name/Role]  
**Total Downtime / Degradation**: [Duration, e.g., 42 minutes]  

---

### 1. Executive Summary
- **Symptom & Business Impact**: [1-2 sentences summarizing revenue, transaction, or user impact]
- **Root Cause Summary**: [1 sentence explaining the systemic failure]
- **Final Resolution**: [What action restored service health]

---

### 2. Impact Ledger
- **Impacted Services**: [Service A, Service B, Database Region]
- **Customer Impact**: [e.g., 14,200 requests returned HTTP 500; 320 checkout carts dropped]
- **Data Integrity**: [Confirmed zero data loss / Data restored from backup at timestamp]
- **SLA Breach**: [Yes/No - detail breach duration]

---

### 3. Chronological Timeline (UTC)
- **HH:MM**: [Event] Deployment `v2.4.1` initiated by CI pipeline.
- **HH:MM**: [Event] First HTTP 500 alert fired on `/api/v1/checkout`.
- **HH:MM**: [Action] Incident declared (SEV-1); IC established war room.
- **HH:MM**: [Action] Rollback to `v2.4.0` triggered by Operator.
- **HH:MM**: [Verification] Rollback completed; error rates returned to baseline $< 0.05\%$.
- **HH:MM**: [Resolution] Incident closed after 15-minute verification window.

---

### 4. Root Cause Analysis
- **Trigger**: [Confirmed] [Proximate cause, e.g., unindexed query caused table lock]
- **Latent Root Cause**: [Confirmed] [Underlying architecture defect]
- **Detection Gap**: [Confirmed] [Why staging / tests failed to identify before deploy]

---

### 5. Preventative Action Items (Automated CI/Harness Gates)
| Action Item | Type | Owner | Target Date | Verification Proof |
|---|---|---|---|---|
| Add composite index on `(user_id, status)` | Preventative | Data Engineer | 2026-11-25 | `EXPLAIN ANALYZE` proof |
| Add CI migration lock timeout check | Guardrail | Fullstack Dev | 2026-11-28 | CI test assertion |
| Add synthetic health probe for checkout API | Detection | QA Engineer | 2026-11-24 | Alert rule active in monitoring |
```
