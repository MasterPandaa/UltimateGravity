# Stakeholder Communication & Technical Translation Matrix

> Protocols for translating complex technical realities into transparent, empathetic, and actionable communication across organizational tiers.

---

## 1. Bottom Line Up Front (BLUF) Principle
Technical communication must inverted-pyramid: state the impact, current status, and required decision/next steps first, followed by supporting technical details.

```
[Level 1: BLUF] ──> Impact (1 Sentence) + Current Status + Next Update Time
[Level 2: Scope] ──> Who/What is affected + Workarounds for users
[Level 3: Technical Details] ──> Root causes, logs, and system metrics (Engineer tier only)
```

---

## 2. The 4-Tier Audience Matrix

| Audience Tier | Primary Objective | Tone & Focus | Forbidden Anti-Patterns | Recommended Format |
|---|---|---|---|---|
| **Executive / C-Level** | Business decisions, revenue impact, regulatory risk, and ETA. | Concise, strategic, quantitative. Focus on cost, customer churn, and resolution timeline. | Raw stack traces, deep architectural jargon, ambiguous ETAs. | Executive Summary: 3–5 bullet points with clear decision options & recommendations. |
| **External Client** | Service reliability, SLA conformance, transparency, and accountability. | Professional, formal, ownership-oriented, dependable. | Shifting blame to cloud vendors/subcontractors, over-promising unverified fixes. | Structured Incident Update with verified milestone timestamps. |
| **End-User** | "Can I use the app right now?" and "How do I unblock my workflow?" | Empathetic, supportive, jargon-free, patient. | Acronyms (DNS, CDN, CORS), technical excuses, defensive pushback. | Actionable steps: 1-2 sentence status + clear numbered workaround instructions. |
| **Technical Engineer** | Root cause diagnosis, exact reproducibility, and verifiable fix. | Precise, objective, grounded in physical metrics. | Vague hand-waving, omitting version numbers or reproduction steps. | Comprehensive technical report: logs, diffs, schema contracts, and CLI commands. |

---

## 3. The 3-Question Ceiling (Discovery & Scope Clarification)
When receiving ambiguous requirements, bug reports, or feature requests:
- **Rule**: Ask a **maximum of 3 high-impact clarifying questions** (`ask_question`).
- **Rationale**: Bombarding users with long questionnaires paralyzes forward momentum and causes cognitive fatigue.
- **Protocol**:
  1. Target only missing information with high branch factor (e.g., target environment, reproduction trigger, expected output).
  2. For secondary ambiguities, state explicit default assumptions: *"Proceeding under the assumption that environment is production-replica; reply if staging should be used."*

---

## 4. Empathetic De-escalation & Non-Blaming Phrasing
When interacting with frustrated or alarmed users:
1. **Acknowledge and Validate Urgency**: Confirm that their difficulty is understood without defensive justifications:
   - *Good*: *"I understand this checkout error directly halts transactions during peak hours. We have halted new deploys and are actively investigating."*
   - *Bad*: *"The system is working fine according to our dashboards, you probably entered invalid data."*
2. **Replace Speculation with Concrete Update Cadences**:
   - Never say: *"We will fix this shortly."*
   - Always say: *"Mitigation is underway; the next verified status update will be provided in 20 minutes (at 14:30 UTC)."*
3. **Blameless Phrasing**:
   - Never attribute outages to individual engineers (e.g., *"John pushed broken code"*).
   - Attribute causes to missing systemic guardrails: *"The validation schema lacked an assertion for null values during peak loads; we are adding automated CI gates to prevent recurrence."*

---

## 5. Standard Status Broadcast Template

```markdown
### 📢 System Status Update
- **Summary**: [1 sentence describing what happened and the business impact]
- **Current Status**: [Investigating / Mitigating / Monitoring / Resolved]
- **Impact Scope**: [Services, regions, and percentage of users affected]
- **Active Actions**: [What the engineering team is currently doing]
- **User Workaround**: [Actionable steps users can take right now to remain unblocked, if available]
- **Next Update**: [Exact time of next broadcast, e.g. 15:00 UTC]
```
