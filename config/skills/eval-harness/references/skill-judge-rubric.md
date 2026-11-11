# Skill Judge: 5-Dimension Diagnostic Rubric for Agent Skills

> **Pattern Origin**: Absorbed from `shareAI-lab/lab-skills` (`agent-development/skill-judge`).  
> **Purpose**: Standardized evaluation rubric for auditing existing and proposed agent skills against prompt pollution, instruction sprawl, and execution ambiguity.

---

## 1. Evaluation Dimensions

Every candidate skill must be scored (1–5 scale) across five orthogonal dimensions before absorption into the system:

### D1: Trigger Timing & Sensitivity
- **Definition**: Does the YAML frontmatter description trigger *only* when the skill is genuinely needed, without leaking into unrelated tasks?
- **Pass Criteria**:
  - Description length $\le 400$ characters.
  - Contains explicit trigger keywords and anti-trigger boundaries (`DO NOT USE for...`).
  - Zero false-positive activation on general coding/chat turns.

### D2: Expert Knowledge Density
- **Definition**: Does the skill provide specialized, non-obvious operational procedures, edge-case contracts, and battle-tested constraints rather than repeating generic LLM knowledge?
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

### D4: Freedom Calibration
- **Definition**: Does the skill strike the correct balance between deterministic constraints and model autonomy?
- **Pass Criteria**:
  - High-blast-radius actions (schema drops, force pushes, secret handling) are locked with deterministic gates.
  - Code authoring and surgical refactoring leave syntactic freedom to the model's domain training.

### D5: Completion & Verification Criteria
- **Definition**: Are the success criteria falsifiable and provable via executable commands?
- **Pass Criteria**:
  - Each task defines verifiable acceptance criteria (e.g., exit code 0, regex match, visual regression pass).
  - Prohibits vague declarations ("Ensure everything works smoothly").

---

## 2. Scoring & Decision Gate

| Total Score | Classification | Action |
|---|---|---|
| **23 – 25** | *Exemplary* | Merge directly into primary skills pool. |
| **18 – 22** | *Needs Refinement* | Absorb patterns into existing `references/`; reject raw root skill. |
| **< 18** | *Deficient / Bloat* | Strict rejection; archive or discard. |
