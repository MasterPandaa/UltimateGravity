---
name: it-soft-skills
description: "[IT Soft Skills & Incident Orchestrator] Multi-stakeholder communication (Executive/Client/User/Engineer), blameless incident response protocols, and SEV triage."
allowed-tools: run_command, read_file, edit_file
tags: [soft-skills, communication, incident-response, triage, post-mortem]
---

# IT Soft Skills & Incident Orchestrator

Translates technical excellence into disciplined human-centric execution, stakeholder alignment, and blameless operational resilience.

## 1. Step 0: Situation Classification
Before acting, classify the request along 3 axes:
1. **Urgency**: Active production incident / outage vs. normal advisory / delivery.
2. **Audience**: Executive/Management, External Client, End-User, or Technical Engineer.
3. **Core Need**: Stated ask vs. underlying business objective.

## 2. Situation Routing Matrix

| Signal in Request | Primary Protocol | Reference Module |
|---|---|---|
| "down", "outage", "production incident", "urgent", "hacked" | Incident Resilience (Mitigate first, calm, SEV triage) | `references/incident-protocol.md` |
| Explaining to Management / Client / Non-Technical Users | Adaptive Translation (BLUF, impact over jargon) | `references/stakeholder-translation.md` |
| Ambiguous requirements or scope explosion | Discovery Questions (3-Question Ceiling) | `references/stakeholder-translation.md` |
| Frustrated, angry, or panicked user | De-escalation & Empathetic Communication | `references/stakeholder-translation.md` |
| Post-incident review, RCA, recurring failure | Blameless Post-Mortem & Confidence Calibration | `references/blameless-postmortem.md` |
| Multi-task backlog, competing deadlines, SEV level | Business Impact vs. Urgency Triage | `references/priority-matrix.md` |

## 3. Standard Execution Sequence
1. **Listen & Clarify**: Confirm core need; enforce $\le 3$ questions ceiling if ambiguous.
2. **Classify & Triage**: Map severity (`references/priority-matrix.md`).
3. **Translate**: Communicate according to audience tier (`references/stakeholder-translation.md`).
4. **Document**: Record immutable decisions and blameless post-mortems (`references/blameless-postmortem.md`).

## 4. Incident Override Sequence (Outage / Production Failure)
1. **Stabilize First**: Rollback / failover / disable feature before deep root-cause diagnosis.
2. **Assign Roles**: Incident Commander (decides), Operator (executes), Communicator (updates), Scribe (timeline).
3. **Inspect Recent Changes**: 80% of outages stem from recent deployments or config mutations.
4. **Broadcast Updates**: Periodic status broadcast every 15–30 minutes (`references/stakeholder-translation.md`).
5. **Verify Recovery**: Check objective metrics and functional test assertions before declaring resolved.
6. **Blameless Post-Mortem**: Document root causes, latencies, and prevention items within 5 business days.

## 5. Universal Output Contract
- **Executive Summary**: 1–2 sentences bottom-line impact.
- **Factual Ledger**: `[Confirmed]` (proven by physical logs/tests) vs. `[Speculative]` (hypotheses).
- **Rollback & Blast Radius**: Mandatory for every system modification.
- **Next Steps**: Exact actions, owners, and update cadence.
