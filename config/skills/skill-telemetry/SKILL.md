---
name: skill-telemetry
description: "[Local Skill Telemetry & Usage Heatmap] Tracks skill invocation frequencies, generates activity heatmaps, and identifies dormant skill pruning candidates to optimize context budget."
allowed-tools: run_command, read_file
tags: [telemetry, metrics, heatmap, pruning, optimization]
---

# skill-telemetry

Local analytics engine and usage heatmap for the Antigravity skill catalog.
Automatically tracks which skills are actually being read or delegated, identifying unused or dormant skills to keep token catalog overhead lean.

## CLI Usage

```powershell
# View full catalog ranking by usage count and status
skill-usage list

# Display ASCII heatmap bar chart of the top 15 most active skills
skill-usage heatmap

# Identify dormant/unused skills that are candidates for pruning
skill-usage prune-candidates [daysThreshold]

# Manually record an invocation
skill-usage record <skillName>

# Reset telemetry data
skill-usage reset
```

## Activity Tiers

| Status | Invocations | Meaning |
|---|---|---|
| `[VERY HOT]` | $\ge 10$ uses | Core daily skill, high priority |
| `[HOT]` | $5 - 9$ uses | Frequently invoked domain tool |
| `[ACTIVE]` | $1 - 4$ uses | Actively utilized |
| `[DORMANT]` | $0$ uses | Never invoked; candidate for archiving |

## Storage Location

`C:\Users\Luthfi\.gemini\config\skill-usage.json`
Recorded automatically via `PreToolUse` hook on `read_file` (matching `SKILL.md`) and `invoke_subagent`.
