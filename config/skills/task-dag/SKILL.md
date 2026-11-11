---
name: task-dag
description: "[Structured Task DAG Engine] Dependency-aware state machine managing execution order (blockedBy), data-edge context packets (consumes), and Mermaid graph exports."
allowed-tools: run_command, read_file
tags: [orchestration, tasks, dag, state-machine, context-packet, workflow]
---

# task-dag

Structured, dependency-aware task orchestration engine with zero-bleed context packets.
Enforces execution order (`blockedBy`), data dependencies (`consumes`), and lifecycle states (`ready`, `in_progress`, `completed`, `blocked`, `failed`).

## Quick CLI Usage

```powershell
# Create tasks with execution edges (blockedBy) and data edges (consumes)
task-dag create --subject "Design DB Schema" --agent "data-engineer"
task-dag create --subject "Implement Backend API" --blockedBy "1" --consumes "1" --agent "fullstack-developer"
task-dag create --subject "Run E2E Regression" --blockedBy "2" --consumes "2" --agent "qa-engineer"

# Inspect DAG status, progress, and next executable task
task-dag list
task-dag next

# Execution lifecycle & context packet generation
task-dag start 1
task-dag complete 1 --result "Postgres auth schema" --files "db/schema.sql"

# Resolve zero-bleed context packet for downstream subagents
task-dag packet 2 [--out "packet-2.md"]

# Export visual Mermaid flowchart with execution and data edges
task-dag graph
```

## Lifecycle States & Storage

| State | Description | Transition Rule |
|---|---|---|
| `pending` / `blocked` | Registered or waiting on upstream | Default; unblocks when all `blockedBy` complete |
| `ready` / `in_progress` | Ready or executing | Started via `task-dag start <id>` |
| `completed` / `failed` | Verified finished or rejected | Finished via `task-dag complete` / `fail` |

Storage: `C:\Users\Luthfi\.gemini\antigravity\tasks\<conversationId>\` (`dag.json`, `tasks/<id>.json`, `packets/<id>.json`).
Deep Reference: [`context-packet-spec-driven.md`](file:///C:/Users/Luthfi/.gemini/config/skills/task-dag/references/context-packet-spec-driven.md).
