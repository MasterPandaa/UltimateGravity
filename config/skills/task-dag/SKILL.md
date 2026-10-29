---
name: task-dag
description: "[Structured Task DAG Engine] Dependency-aware state machine for managing task execution order, DAG blockers (blockedBy), progress tracking, and Mermaid graph exports."
allowed-tools: run_command, read_file
tags: [orchestration, tasks, dag, state-machine, workflow]
---

# task-dag

Structured, dependency-aware task orchestration engine for Antigravity.
Prevents execution race conditions and dropped sub-tasks by enforcing strict DAG dependency rules (`ready`, `in_progress`, `completed`, `blocked`, `failed`).

## Quick CLI Usage

```powershell
# Create tasks with dependency edges
task-dag create --subject "Design DB Schema" --agent "kokuo"
task-dag create --subject "Implement Backend API" --blockedBy "1" --agent "kokuo"
task-dag create --subject "Develop Frontend UI" --blockedBy "1" --agent "son-goku"
task-dag create --subject "Run E2E Regression" --blockedBy "2,3" --agent "gyuki"

# View current DAG state table and progress percentage
task-dag list

# Query the next ready unstarted task
task-dag next

# Start execution (fails immediately if blocked by upstream tasks!)
task-dag start 1

# Mark completed (automatically unblocks downstream tasks)
task-dag complete 1 --result "Schema written to db/schema.sql"

# Export visual Mermaid flowchart of the DAG
task-dag graph
```

## Task Lifecycle States

| State | Description | Transition Rule |
|---|---|---|
| `pending` | Task registered in DAG | Default on creation |
| `ready` | All `blockedBy` tasks are completed | Transitioned automatically by engine |
| `in_progress` | Currently being executed by agent | Set via `task-dag start <id>` |
| `completed` | Verified finished | Set via `task-dag complete <id>` |
| `blocked` | 1 or more upstream tasks are incomplete | Engine blocks execution |
| `failed` | Task failed verification | Set via `task-dag fail <id>` |

## Storage Location

`C:\Users\Luthfi\.gemini\antigravity\tasks\<conversationId>\`
- `dag.json`: Master dependency graph.
- `tasks/<id>.json`: Atomic task records.
