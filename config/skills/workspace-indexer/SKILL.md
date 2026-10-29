---
name: workspace-indexer
description: "[Background Workspace Indexer & Topology Scanner] Scans file distribution, manifest keys, and recently modified files. Injects context automatically via hooks on SessionStart and PostToolUse."
allowed-tools: run_command, read_file
tags: [indexing, workspace, topology, context, ast]
---

# workspace-indexer

High-speed incremental workspace topology indexer for Antigravity (analogous to Qoder's `qoder-context` daemon).
Scans thousands of files in milliseconds, caches extension distributions, detects key manifests (`package.json`, `Cargo.toml`, `requirements.txt`), and tracks recently modified files.

## CLI Usage

```powershell
# Scan current workspace or specific directory
workspace-index scan [path/to/project]

# View current topology summary and recent files
workspace-index status

# Inspect full summary details
workspace-index summary

# Query prompt context snippet
workspace-index get-prompt-context
```

## Hook Integration

- **`SessionStart`**: Automatically scans the workspace root and injects an initial workspace topology system message.
- **`PostToolUse (edit_file|write_file)`**: Incrementally updates file timestamps and sizes in the index in sub-millisecond time.
- **`PreInvocation`**: Injects an ephemeral context update with recently touched files.

## Storage Location

`C:\Users\Luthfi\.gemini\antigravity\workspace-index\<workspaceHash>\`
- `workspace-summary.json`: High-level topology, extension distribution, and recent files.
- `file-index.json`: Flat hashmap of relative file paths, sizes, and mtimes.
