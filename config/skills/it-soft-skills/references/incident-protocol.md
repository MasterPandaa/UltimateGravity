# Incident Response & Operational Resilience Protocol

> Standard operating procedure for high-pressure production incidents, outages, and emergency responses.

---

## 1. Core Operating Philosophy
- **Calmness is an Operational Skill**: Panic induces runaway diffs, untested commands, and secondary outages. Adrenaline must be replaced with checklists and protocols.
- **Mitigate Before Diagnosing**: Service restoration (rollback, failover, feature toggle, rate-limiting) strictly precedes root-cause investigation. Stabilize first, analyze later.
- **Single-Change Invariant**: Execute one mutation at a time. Record every action, timestamp, operator, and observed delta.
- **Blamelessness**: Searching for scapegoats impairs recovery speed and suppresses transparent reporting.

---

## 2. The 9-Stage Incident Lifecycle

```
[1. Calm] ──> [2. Roles] ──> [3. Triage & SEV] ──> [4. Recent Changes] ──> [5. Mitigate]
                                                                                │
[9. Post-Mortem] <── [8. Recovery] <── [7. Broadcast] <── [6. Structured Diag] <┘
```

1. **Stage 1: Operational Pause (30 Seconds)**
   - Take a breath. Summarize the observed symptom in one factual sentence without emotional inflation.
2. **Stage 2: Declare Incident & Assign Roles**
   - **Incident Commander (IC)**: Holds decision-making authority; directs the response; protects responders from external distraction.
   - **Operator**: Solely responsible for executing mutations and diagnostic commands.
   - **Communicator**: Sole liaison to stakeholders, leadership, and users.
   - **Scribe**: Logs all decisions, command outputs, timestamps, and hypotheses in the incident war room.
3. **Stage 3: Impact Triage & SEV Assignment**
   - Determine active business impact, affected users, data integrity exposure, and assign severity (SEV-1 to SEV-4 via `references/priority-matrix.md`).
4. **Stage 4: Inspect Recent Changes First**
   - Over 80% of production outages are triggered by recent modifications. Inspect:
     - Deployments and release commits within the last 24 hours.
     - Configuration, DNS, CDN, and firewall updates.
     - Certificate expirations and cloud provider health status.
5. **Stage 5: Immediate Mitigation (Safe Restoration)**
   - Prioritize the fastest, most reversible mitigation:
     - Roll back to the last known healthy release.
     - Divert traffic via load balancer or regional failover.
     - Disable failing feature flags or non-critical background jobs.
6. **Stage 6: Structured Hypothesis Testing**
   - Author $\ge 3$ ranked hypotheses. Run the cheapest, non-destructive verification first.
   - Verify logs completely; never assume an error cause without attributing log lines or exit codes.
7. **Stage 7: Regular Stakeholder Broadcast**
   - Transmit status updates every 15–30 minutes adhering to `references/stakeholder-translation.md`.
8. **Stage 8: Recovery Verification Gate**
   - Do not claim recovery on gut feeling. Assert health across 3 gates:
     1. Key service telemetry (latency p95, error rate $< 0.1\%$).
     2. Synthetic smoke and end-to-end transaction test passes.
     3. 15-minute stable observation window under production traffic.
9. **Stage 9: Blameless Post-Mortem & Action Items**
   - Convene a blameless retrospective within $\le 5$ business days using `references/blameless-postmortem.md`.

---

## 3. Security Incident Protocol Addendum
When unauthorized access, credential leakage, or exploitation is detected:
1. **Isolate, Do Not Blindly Terminate**: Sever network ingress/egress to prevent lateral movement while preserving volatile memory and forensic artifacts.
2. **Rotate Credentials Immediately**: Invalidate compromised API keys, database credentials, and session tokens.
3. **Preserve Forensic Logs**: Archive access logs, VPC flow logs, and audit trails to tamper-proof storage.
4. **Strict Need-to-Know Communication**: Avoid broadcasting internal vulnerabilities to public channels until remediation is complete.

---

## 4. Hard Guardrails (Anti-Panic Invariants)
- **Prohibited**: Blind mass-deletions (`rm -rf`, `DROP TABLE`, `git push --force`).
- **Prohibited**: Applying multiple simultaneous fixes without isolated verification.
- **Prohibited**: Declaring recovery without machine-verified metrics and test assertions.
- **Prohibited**: Blaming individuals or vendor personnel.
