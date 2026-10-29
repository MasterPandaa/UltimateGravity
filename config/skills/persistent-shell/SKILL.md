---
name: persistent-shell
description: "[Persistent Shell & Environment Engine] Preserves working directory (CWD), environment variables, virtualenvs, and session state across multiple run_command executions via agy-exec."
allowed-tools: run_command, read_file
tags: [shell, persistence, environment, powershell, session]
---

# persistent-shell

State-preserving execution wrapper for Antigravity on Windows.
Solves the stateless `run_command` limitation by capturing and re-hydrating environment variables, activated virtual environments, and working directory changes between separate command calls.

## How to Execute Persistent Commands

Instead of running bare commands that lose state on completion:
```powershell
# Run through agy-exec to persist CWD and environment variables:
agy-exec.ps1 -Command "Set-Location 'D:\my-project'; `$env:NODE_ENV = 'development'"

# In the next turn, CWD and $env:NODE_ENV remain active!
agy-exec.ps1 -Command "Get-Location; echo `$env:NODE_ENV"
```

## Supported State Restorations

1. **Current Working Directory (`$PWD`)**: Navigating via `cd` or `Set-Location` persists into subsequent turns.
2. **Environment Variables (`$env:*`)**: Any newly set or modified variable is serialized to `session-env.json`.
3. **Python Virtual Environments**: Running `. .\venv\Scripts\Activate.ps1` sets `$env:VIRTUAL_ENV` and updates `$PATH`, which persists automatically.
4. **Command Audit Log**: All commands and exits are timestamped in `command-history.log`.

## Storage Location

Snapshots are stored in:
`C:\Users\Luthfi\.gemini\antigravity\shell-snapshots\<conversationId>\`
- `session-env.json`: Machine-readable state.
- `session-init.ps1`: Generated PowerShell re-hydration script dot-sourced at the start of each turn.
- `command-history.log`: Execution audit trail.

## Options

- `-ConversationId <id>`: Scope state to a specific session (defaults to `default-session`).
- `-NoPersist`: Run command under current session state without saving mutations.
