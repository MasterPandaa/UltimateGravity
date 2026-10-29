---
name: step-checkpoint
description: "[Time-Travel Step Checkpoint & Revert Engine] Capture workspace snapshots, inspect diffs, and safely revert or fork states from previous steps without data loss. Inspired by Devin's revert engine."
allowed-tools: run_command, read_file
tags: [checkpoint, revert, time-travel, git, snapshot, safety]
---

# Step Checkpoint & Time-Travel Revert Engine

This skill provides native time-travel checkpointing for Antigravity, allowing agents and developers to capture atomic workspace states before major changes, preview diffs, and safely revert to any earlier step.

## When to Use
- Before performing complex multi-file refactoring, large migrations, or risky operations.
- When an agent wants to record an explicit milestone in a multi-turn task.
- When a user asks to "revert to step X", "undo the last changes", or "show what changed since step Y".

## Commands & Usage

All actions are executed via the lightweight standalone script:
`node C:\Users\Luthfi\.gemini\scripts\step-checkpoint.js <command> [args]`

### 1. Create a Checkpoint
Captures the current state of modified files and git diffs:
```powershell
node C:\Users\Luthfi\.gemini\scripts\step-checkpoint.js create "Before adding auth middleware"
```

### 2. List Checkpoints
View all recorded checkpoints in the current workspace:
```powershell
node C:\Users\Luthfi\.gemini\scripts\step-checkpoint.js list
```

### 3. Diff Against a Checkpoint
Inspect what has changed between the current state and a specific checkpoint:
```powershell
node C:\Users\Luthfi\.gemini\scripts\step-checkpoint.js diff <checkpointId>
```

### 4. Revert to a Checkpoint
Restores workspace files to the specified checkpoint. A safety pre-revert checkpoint is taken automatically before rolling back, ensuring zero data loss:
```powershell
node C:\Users\Luthfi\.gemini\scripts\step-checkpoint.js revert <checkpointId>
```

## Performance & Memory Invariant
- **Transient**: Runs in < 150ms per command.
- **RAM Footprint**: ~0 MB idle, < 25 MB during execution.
- **Safety**: Never performs destructive deletions without creating an automated backup first.
