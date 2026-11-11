<div align="right"><strong>🇨🇳 </strong> | <a href="./skills-graph_EN.md">🇬🇧 English</a></div>

# Skills 

 `skills/{zh|en}/` [](../SKILL_MATRIX.md)

## 

```mermaid
flowchart LR
    D[] --> S[]
    S --> P[]
    P --> E[]
    E --> R[]
    R --> O[]
    O --> I[]

    C[Core QA Skills] --- D
    G[Engineering QA Skills] --- S
    G --- P
    G --- E
    Q[Production Quality Skills] --- R
    Q --- O
    A[AI Native QA Skills] --- D
    A --- P
    A --- E
    H[Skill Engineering\n] --- I
```

`Core QA Skills → Engineering QA Skills → Production Quality Skills → AI Native QA Skills`

## v1.5.2 Composition Catalog

- [ Composition Catalog](skills-composition.md) `docs/governance/skill-composition.yaml` / Skill 
- `discover-testing`  `reference.md`  Router  Skill 
- Composition 

## 

|  |  |  |
| --- | --- | --- |
| v1.1  | `requirement-quality-review` → `requirements-analysis` `requirement-ambiguity-analysis` / `requirement-consistency-analysis` / `requirement-conflict-detection` / `requirement-traceability-analysis` |  |
| v1.1  | `business-rule-extraction``technical-design-quality-review``api-design-quality-review``database-design-quality-review``observability-design-review``error-handling-design-review``test-scope-analysis` `business-rule` / `architecture` / `coverage_analysis`  |  |
| v1.1  | `test-gap-analysis``risk-based-testing``edge-case-discovery``negative-scenario-discovery``test-data-requirement-analysis` | / |
|  | `requirements-analysis` → `test-strategy` → `test-case-writing` → `functional-testing` |  |
|  | `change-impact-analysis` → `regression-scope-analysis` → `regression-test-selection` |  |
| API  | `api-contract-testing` → `api-testing` → `test-reporting` |  |
|  | `performance-workload-modeling` → `performance-testing` → `performance-result-analysis` → `capacity-planning-analysis` |  |
|  | `metrics-anomaly-analysis` → `distributed-trace-analysis` → `production-incident-analysis` → `root-cause-analysis` |  |
| AI  | `ai-feature-testing` → `llm-evaluation-design` → `llm-testing` → `prompt-injection-testing` |  |
| Agent  | `ai-agent-testing` → `agent-tool-testing` → `prompt-injection-testing` |  |

## v2.0 Test Engineering 

|  |  |  |
| --- | --- | --- |
| v2.0  | `decision-table-testing``state-transition-testing``boundary-value-testing``equivalence-partitioning``pairwise-testing``combinatorial-testing``model-based-testing``property-based-testing``metamorphic-testing` |  |
| v2.0 API  | `api-schema-validation` → `api-negative-testing` → `api-error-contract-testing` `api-idempotency-testing` / `api-pagination-testing` / `api-rate-limit-testing` / `api-version-compatibility-testing` |  |
| v2.0 UI  | `ui-test-strategy` → `ui-test-selector-review` → `ui-test-wait-strategy-review` `visual-regression-testing` / `cross-browser-testing` | UI  |
| v2.0  | `test-code-review` → `mutation-testing-analysis` `mock-quality-review` / `test-suite-health-analysis` | Mock  |

 `discover-testing`

## v3-v4 Phase 3 

|  |  |  |
| --- | --- | --- |
|  | `reliability-testing` → `resilience-testing` → `failover-testing` / `recovery-testing` `retry-testing` / `timeout-testing` / `circuit-breaker-testing` / `dependency-failure-testing` / `disaster-recovery-testing` / `chaos-testing` |  |
|  API  | `security-requirement-review` → `authentication-testing` / `authorization-testing` → `session-security-testing` / `api-security-testing`;  `threat-modeling` / `secrets-exposure-review` |  |
|  | `quality-gate-design` → `quality-metrics-design` → `quality-dashboard-design` `quality-debt-analysis` / `quality-maturity-assessment` / `test-effectiveness-analysis` / `automation-roi-analysis` / `testing-bottleneck-analysis` / `regression-optimization` / `ci-test-optimization` / `test-runtime-optimization` / `test-maintenance-cost-analysis` / `quality-productivity-metrics` |  |
| AI Native quality | `rag-retrieval-testing` → `rag-quality-testing` → `llm-hallucination-testing` / `llm-consistency-testing``prompt-testing`  `prompt-regression`  | RAG  LLM grounding |
| Agent quality and safety | `agent-loop-testing` → `agent-memory-testing` / `agent-permission-testing` → `agent-failure-recovery-testing` / `agent-long-running-testing` / `multi-agent-testing` / `ai-safety-testing` | Agent  |

 Project  v3-v4 Phase 3  17  Batch 1  25  Batch 2  `Done` `Match → RED  →  → `  `In Progress → Done`  `UNASSESSED``prompt-regression-testing`  `prompt-testing` 

## 

- `ai-assisted-testing`  **AI for QA** Testing for AI
-  Skill 
- `skill-engineering`  Skill  QA 
- v1.1  Skill 
- v1.1  Skill 
- v1.1  Skill  Skill 
- v2.0 Test Engineering 25  Skill  Skill 
- v2.0 Skill  EvalAPI/UI//
- v3-v4 Phase 3  Skill /Project 
- v3-v4 Phase 3  QE  AI Native Skill RAG/LLMAgent 

## 

- [](skills-index.md)
- [](../governance/QA_SKILLS_EVOLUTION_ROADMAP.md)
- [English roadmap](../governance/QA_SKILLS_EVOLUTION_ROADMAP_EN.md)
- [v1.1  Phase 1](../governance/PHASE_1_REQUIREMENTS_QUALITY.md)
- [v3-v4 Phase 3](../governance/PHASE_3_V3_V4.md)
- [v1.0 ](../governance/SKILL_GOVERNANCE_V1.md)
- [v1.4 Phase 0 ](../governance/PHASE_0_V1_4_CLOSEOUT.md)
- [v1.1–v1.4 Shift Left ](../governance/SHIFT_LEFT_MILESTONE.md)
- [ Skill 15 ](../governance/CANDIDATE_SKILL_15_STEP_TEMPLATE.md)
