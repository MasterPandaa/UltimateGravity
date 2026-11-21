# Skill Judge: 6-Dimension Diagnostic Rubric & Skill Lift Framework

> **Pattern Origin**: Absorbed and unified from:
> 1. `shareAI-lab/lab-skills`: 5-dimension diagnostic grading.
> 2. `Evol-ai/SkillCompass`: 6-dimension quality scoring and Weakest-Link diagnosis.
> 3. `NVIDIA/SkillEvaluator`: Multi-tier evaluation, semantic overlap analysis, and empirical Skill Lift.
> 4. `MrBinnacle/skill-harness`: Invocation attributability check (anti-false-positive gating).
> 5. `joeseesun/qiaomu-meta-skill`: Prior-art synthesis and negative trigger distractor evaluations.

---

## 1. The 6-Dimension Quality Framework

Every candidate or existing skill must be scored on a 1–5 scale across six orthogonal dimensions:

### D1: Trigger Precision & Sensitivity (Anti-Trigger Guard)
- **Definition**: Does the YAML frontmatter description trigger *only* when the skill is genuinely needed, without leaking into unrelated tasks?
- **Pass Criteria**:
  - Description length $\le 400$ characters.
  - Contains explicit trigger keywords and anti-trigger boundaries (`DO NOT USE for...`).
  - Zero false-positive activation on general coding/chat turns.

### D2: Expert Knowledge Density
- **Definition**: Does the skill provide specialized, non-obvious operational procedures, edge-case contracts, and battle-tested constraints rather than repeating generic LLM training weights?
- **Pass Criteria**:
  - Contains concrete configuration tables, error codes, regexes, or CLI flags.
  - Zero generic conversational filler ("Make sure to write clean code").
  - Direct, prescriptive SOP steps (*Step 1 ➔ Step 2 ➔ Step 3*).

### D3: Instruction Sprawl & L0 Budget
- **Definition**: Does the root `SKILL.md` maintain a lean token footprint to preserve system context?
- **Pass Criteria**:
  - Root `SKILL.md` line count $L_0 \le 60$ lines (Harness-Zero standard).
  - Deep architectural background offloaded to `references/<topic>.md`.
  - Reference chaining limited to at most 1 hop.

### D4: Freedom Calibration & Guardrails
- **Definition**: Does the skill strike the correct balance between deterministic constraints and model autonomy?
- **Pass Criteria**:
  - High-blast-radius actions (schema drops, force pushes, secret handling) are locked with deterministic gates.
  - Code authoring and surgical refactoring leave syntactic freedom to the model's domain training.

### D5: Falsifiable Verification & Acceptance Tests
- **Definition**: Are the success criteria falsifiable and provable via executable commands?
- **Pass Criteria**:
  - Each task defines verifiable acceptance criteria (e.g., exit code 0, regex match, visual regression pass).
  - Prohibits vague declarations ("Ensure everything works smoothly").

### D6: Idempotency & Drift Resistance
- **Definition**: Does repeated invocation produce predictable, consistent state without side-effect accumulation or context rot?
- **Pass Criteria**:
  - Repeated executions on the same target yield identical, deterministic diffs.
  - Clean rollback / restore mechanics for failed operations.

---

## 2. Weakest-Link Diagnosis Gate (Evol-ai Pattern)

Composite score alone is insufficient; a skill with an average score of 4.2 can still crash an agent if its trigger precision is broken ($D_1 = 1$).

- **The Weakest-Link Invariant**:
  $$\text{Admission Gate} = \left(\sum_{i=1}^6 D_i \ge 24\right) \land \left(\min_{i \in [1..6]} D_i \ge 4\right)$$
- If any single dimension scores $\le 3$, the skill is rejected or quarantined for surgical refinement regardless of overall score.

---

## 3. Empirical Skill Lift & Attributability (NVIDIA & MrBinnacle Patterns)

### A. Skill Lift & Token-ROI Formula
A skill must empirically prove that it outperforms a skill-free baseline agent without imposing disproportionate token overhead.

$$\text{Skill Lift} = \text{PassRate}_{\text{with\_skill}} - \text{PassRate}_{\text{baseline\_no\_skill}}$$

$$\text{Lift-ROI} = \frac{\Delta \text{PassRate}}{\Delta \text{Tokens}} \ge \beta$$

- **Decision Rule**: If $\text{Skill Lift} \le 0$ or $\Delta \text{PassRate}$ does not justify token cost growth, the skill represents negative lift (instruction clutter) and is banned.

### B. Invocation Attributability Check (MrBinnacle)
To prevent **False Positive Evaluations** where an LLM solves a benchmark task purely from pre-trained weights:
1. Every evaluation trace must verify that the target skill file or its registered tools were actively ingested/called during the turn.
2. If a test case passes but trace audit reveals zero access to the skill, the result is flagged as `UNATTRIBUTED_PASS` and discarded from the skill's lift score.

---

## 4. Negative Trigger Distractor Suites (Qiaomu & ALEX-nlp Patterns)

Every new skill must be validated against a **3-Tier Distractor Suite** before shipping:
1. **Lexical Distractor**: Tasks containing similar keywords but requiring general tool knowledge (e.g., mentioning "database" when testing a specialized migration skill).
2. **Adjacent Domain Distractor**: Tasks belonging to a sibling specialist role (e.g., frontend styling vs fullstack backend API).
3. **General Conversational Turn**: Everyday developer queries where the skill must remain dormant.

- **Gate**: Negative Trigger Accuracy must be **100%** (zero false activations across distractor suites).

---

## 5. Semantic Overlap & Redundancy Gate (NVIDIA Tier 2)

Before admitting a new skill into `~/.gemini/config/skills/`:
- Calculate keyword and trigger overlap against all currently active skills.
- Overlap threshold must remain **$< 30\%$**. If semantic overlap exceeds 30%, the new procedure must be merged into the existing skill's `references/` rather than creating a new standalone unit.
