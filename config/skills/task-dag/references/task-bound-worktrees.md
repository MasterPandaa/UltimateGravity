# Task-Bound Git Worktree Isolation Architecture

> **Pattern Origin**: Absorbed from `shareAI-lab/learn-claude-code` (Lesson s13 *Agent Teams & Worktree Task Isolation*).  
> **Purpose**: Prevent file edit collisions, index locks, and build contamination during parallel multi-subagent execution.

---

## 1. The Multi-Agent Collision Hazard

When multiple autonomous agents (e.g. `fullstack-developer` and `qa-engineer`) execute concurrently in a shared workspace:
- File write operations can overwrite concurrent changes without atomic locks.
- `package-lock.json`, `target/`, or `node_modules` caches collide during parallel builds.
- Git index locks (`.git/index.lock`) throw runtime exceptions when two agents commit simultaneously.

**The Solution**: Bind each long-running or parallel subagent task to an ephemeral **Git Worktree**.

```
Master Workspace (CWD)
       │
       ├── .git/ (Shared object store)
       │
       ├── worktree/task-T1-api/      (Owned by fullstack-developer: isolated src/api/)
       │     └── branch: agent/T1-api
       │
       └── worktree/task-T2-tests/    (Owned by qa-engineer: isolated tests/e2e/)
             └── branch: agent/T2-tests
```

---

## 2. Worktree Lifecycle Protocol

### Phase 1: Provisioning
When a task in `task-dag` is marked as parallelizable across disjoint domains:
```powershell
# Create an isolated worktree branched from current main
git worktree add -b "agent/$taskId" ".worktrees/$taskId" HEAD
```

### Phase 2: Isolated Execution & Verification
- The assigned subagent operates exclusively inside `.worktrees/$taskId`.
- Builds, test suites, and temporary scratch files remain fully sandboxed.
- Verification commands run within the worktree context.

### Phase 3: Fast-Forward Merge & Cleanup
Once acceptance criteria pass with exit code 0:
```powershell
# Merge changes back into main branch
git merge --ff-only "agent/$taskId"

# Remove the ephemeral worktree and branch
git worktree remove ".worktrees/$taskId"
git branch -d "agent/$taskId"
```

---

## 3. Invariants & Guardrails

1. **Shared Repository Storage**: Worktrees share the underlying `.git` object database; no duplicate `.git` directories or multi-gigabyte repository clones are created on disk.
2. **Disjoint Path Boundary**: Subagents assigned to worktrees must declare disjoint file ownership sets in their DAG context packets (`--consumes`).
3. **Emergency Pruning**: If a subagent crashes or is aborted, orphan worktrees must be cleaned with `git worktree prune` to avoid stale handle locks on Windows.
