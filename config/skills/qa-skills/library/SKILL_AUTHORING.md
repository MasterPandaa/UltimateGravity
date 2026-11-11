<div align="right"><strong>🇨🇳 </strong> | <a href="./SKILL_AUTHORING_EN.md">🇬🇧 English</a></div>

# Skill Authoring Guide skill-up / Agent Skills

 [alibaba/skill-up](https://github.com/alibaba/skill-up)  [Agent Skills ](https://agentskills.io/skill-creation/best-practices)  QA skill  coding agent  skill 

## 

Skill ****

1. ****`description`  Agent  skill
2. ****`SKILL.md` 
3. **** prompt 
4. **** skill  `evals/` `skill-up` 

## SKILL.md 

### Frontmatter

```yaml
---
name: skill-name
description: Use this skill when ...; triggers include  and English triggers.
---
```

- `name``agents/openai.yaml`  `metadata.key` 
- `description``Use this skill when...` ****  ****≤1024 
-  `when` / triggers

### 

1. ****2–4 
2. **** `prompts/<name>.md`
3. ****Agent /
4. **** **  `references/``examples/``scripts/``output-formats.md` references/
5. **** skill-up / agentskills  validation loop
6. **** skill  gotchas

`SKILL.md`  ~500  skill 

###  prompts/ 

- `prompts/` ****
- `SKILL.md`  prompt // prompts
-  `references/`  `prompts/` SKILL 

## evals/skill-up

 [skill-up ](https://alibaba.github.io/skill-up/zh/guide/writing-evals) 

```text
<skill>/
  SKILL.md
  prompts/
  evals/
    eval.yaml
    cases/
      basic-success.yaml
      edge-incomplete-input.yaml
    fixtures/          # 
```



-  skill  **2–3**  +  + /
-  `judge.type: rule_based` `script` `api-test-bruno` `agent_judge`
-  `benchmark.enabled: true`  with/without skill 
-  skill  `evals/fixtures/`  OpenAPI/curl/ `evals/trigger_queries.json`description 
- `environment.type: none`  QA skill/ `opensandbox` / `docker`
-  skill  skill →  prompt/ skill → 
- 
- `title` 



```bash
python3 scripts/scaffold_skill_evals.py --skill skills/zh/testing-types/functional-testing
python3 scripts/scaffold_skill_evals.py --all-missing --lang zh
```

 skill-up  Agent Engine Codex / Claude

```bash
#  CLI
curl -fsSL https://raw.githubusercontent.com/alibaba/skill-up/main/install.sh | bash

#  YAML check_skills_quality.sh
bash scripts/validate_skill_evals.sh

#  .skill-up-workspaces/ skills/
bash scripts/run_skill_eval.sh skills/zh/testing-types/functional-testing/evals/eval.yaml \
  --include-case-name "basic-success"

#  --output-dir
mkdir -p .skill-up-workspaces
skill-up run skills/zh/testing-types/functional-testing/evals/eval.yaml \
  --engine codex \
  --include-case-name "basic-success" \
  --output-dir .skill-up-workspaces/functional-testing
```

skill-upper

```bash
npx skills add https://github.com/alibaba/skill-up/tree/main/skills/skill-upper -g -a codex -y
#  skill-upper / skill
```

Codex  `~/.codex/skills/skill-upper`



- `title`  `:`  `skill-up validate` 
-  prompt  `Open Questions`
-  `<skill>-workspace/` gitignore

## Distribution Compatibility

`skills` CLI `skill-up` Skill  [`docs/integrations/SKILLS_CLI_INTEGRATION.md`](../docs/integrations/SKILLS_CLI_INTEGRATION.md)

- leaf Skill `SKILL.md` frontmatter  `name`  CLI  `--skill` ID 
-  Skill 
- leaf Skill  `SKILL.md`promptmetadata 
- EN/ZH  canonical name ID target 
- `description`  discovery metadata QA 
- `SKILL.md`promptexamplesreferences  scripts  Skill 
-  `bash scripts/check_skills_quality.sh`  `bash scripts/check_skills_cli_compatibility.sh`

 Skill  Skill  `skill-up` eval gate 

 [skill-upper](https://github.com/alibaba/skill-up/tree/main/skills/skill-upper) →  →  SKILL/prompt  eval →  → 

 skill-upper

```bash
npx skills add https://github.com/alibaba/skill-up/tree/main/skills/skill-upper -g -a codex -y
```

## description 

- 
-  skill 
-  CSV  vs Excel  description 
-  skill-up / 

## 

-  prompt  tokencookie
- skill A  markdown  skill B 
-  `Reference/`  skill
- 

## 

```bash
bash scripts/check_skills_quality.sh
```
