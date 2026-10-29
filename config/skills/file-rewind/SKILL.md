---
name: file-rewind
description: "[Continuous File History & Instant Rewind Safety Net] Inspect, diff, and restore automatic file version snapshots captured before mutations. Use when inspecting change history, recovering from bad edits, or rolling back files."
allowed-tools: run_command, read_file
tags: [safety, file-history, rollback, undo, versioning]
---

# file-rewind

Continuous shadow-copy file history and zero-git rollback engine for Antigravity.
Automatically activated via `PreToolUse` hook before any `edit_file` or `write_file` operation.

## CLI Usage

```powershell
# List all modified files and version counts in the current session
file-rewind list

# View detailed version timeline of a specific file
file-rewind history "src/components/App.tsx"

# Compare a historical snapshot with the current file
file-rewind diff "src/components/App.tsx" 1

# Restore file to a previous version (creates a pre-restore backup first)
file-rewind restore "src/components/App.tsx" 1

# Undo the very last file modification in the session
file-rewind undo-last
```

## Storage Location

Snapshots and manifests are stored per-conversation in:
`C:\Users\Luthfi\.gemini\antigravity\file-history\<conversationId>\`
- `manifest.json`: Tracks file versions, timestamps, hashes, and tool actions.
- `snapshots/`: Contains immutable `.bak` file snapshots.

## Key Safety Guarantees

1. **Zero-Git Dependency**: Works immediately on unstaged files, gitignored files, or non-git folders.
2. **Reversible Rollbacks**: Restoring an old version automatically captures the *current* state as a new version before overwriting, allowing rollbacks to be undone.
3. **v0 New File Tracking**: Files created fresh during a session have a recorded `v0` state; restoring to `v0` cleanly removes the newly created file.
