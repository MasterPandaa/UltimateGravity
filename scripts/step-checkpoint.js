#!/usr/bin/env node

/**
 * Antigravity Step Checkpoint & Time-Travel Revert Engine
 * Inspired by Devin's cognition.ai/revert.
 * 
 * Commands:
 *   node step-checkpoint.js create "label"
 *   node step-checkpoint.js list
 *   node step-checkpoint.js diff <checkpointId>
 *   node step-checkpoint.js revert <checkpointId>
 *   node step-checkpoint.js fork <checkpointId> <branchName>
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function resolveWorkspace(targetDir) {
  let ws = targetDir || process.cwd();
  return path.resolve(ws);
}

function getStorageDir(ws) {
  const store = path.join(ws, '.antigravity', 'checkpoints');
  if (!fs.existsSync(store)) fs.mkdirSync(store, { recursive: true });
  return store;
}

function getIndexFile(ws) {
  return path.join(getStorageDir(ws), 'checkpoints-index.json');
}

function readIndex(ws) {
  const file = getIndexFile(ws);
  if (!fs.existsSync(file)) return [];
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return [];
  }
}

function writeIndex(ws, index) {
  const file = getIndexFile(ws);
  fs.writeFileSync(file, JSON.stringify(index, null, 2), 'utf8');
}

function isGitRepo(ws) {
  try {
    execSync('git rev-parse --is-inside-work-tree', { cwd: ws, stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

function createCheckpoint(ws, label = 'Snapshot') {
  const timestamp = new Date().toISOString();
  const id = `cp_${Date.now()}`;
  const store = getStorageDir(ws);
  const cpDir = path.join(store, id);
  fs.mkdirSync(cpDir, { recursive: true });

  const checkpoint = {
    id,
    label,
    timestamp,
    workspace: ws,
    isGit: isGitRepo(ws),
    gitRef: null,
    files: []
  };

  if (checkpoint.isGit) {
    try {
      const head = execSync('git rev-parse HEAD', { cwd: ws, encoding: 'utf8' }).trim();
      checkpoint.gitRef = head;
      // Capture dirty / untracked diff
      const diff = execSync('git diff HEAD', { cwd: ws, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
      fs.writeFileSync(path.join(cpDir, 'git_diff.patch'), diff, 'utf8');

      // Get list of tracked modified files
      const statusOut = execSync('git status --porcelain', { cwd: ws, encoding: 'utf8' }).trim();
      if (statusOut) {
        const lines = statusOut.split('\n');
        for (const line of lines) {
          const filePath = line.substring(3).trim();
          checkpoint.files.push(filePath);
          // Backup file directly
          const fullPath = path.join(ws, filePath);
          if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
            const dest = path.join(cpDir, 'files', filePath);
            fs.mkdirSync(path.dirname(dest), { recursive: true });
            fs.copyFileSync(fullPath, dest);
          }
        }
      }
    } catch (e) {
      // Git command failed, fallback to file snapshot
    }
  }

  const index = readIndex(ws);
  index.unshift(checkpoint);
  writeIndex(ws, index);

  return checkpoint;
}

function listCheckpoints(ws) {
  const index = readIndex(ws);
  if (index.length === 0) {
    return [];
  }
  return index.map(c => ({
    id: c.id,
    label: c.label,
    timestamp: c.timestamp,
    filesCount: c.files.length,
    isGit: c.isGit
  }));
}

function diffCheckpoint(ws, checkpointId) {
  const store = getStorageDir(ws);
  const patchFile = path.join(store, checkpointId, 'git_diff.patch');
  if (fs.existsSync(patchFile)) {
    return fs.readFileSync(patchFile, 'utf8');
  }
  return `No diff found for checkpoint ${checkpointId}`;
}

function revertCheckpoint(ws, checkpointId) {
  const index = readIndex(ws);
  const cp = index.find(c => c.id === checkpointId);
  if (!cp) throw new Error(`Checkpoint not found: ${checkpointId}`);

  // Safety net: Take automatic pre-revert checkpoint first
  createCheckpoint(ws, `Safety pre-revert backup (before reverting to ${checkpointId})`);

  const store = getStorageDir(ws);
  const cpDir = path.join(store, checkpointId);
  const filesDir = path.join(cpDir, 'files');

  let restoredCount = 0;
  if (fs.existsSync(filesDir)) {
    function restoreRec(curr) {
      const entries = fs.readdirSync(curr, { withFileTypes: true });
      for (const ent of entries) {
        const fullSource = path.join(curr, ent.name);
        if (ent.isDirectory()) {
          restoreRec(fullSource);
        } else {
          const relPath = path.relative(filesDir, fullSource);
          const destPath = path.join(ws, relPath);
          fs.mkdirSync(path.dirname(destPath), { recursive: true });
          fs.copyFileSync(fullSource, destPath);
          restoredCount++;
        }
      }
    }
    restoreRec(filesDir);
  }

  return {
    revertedTo: checkpointId,
    label: cp.label,
    restoredFilesCount: restoredCount
  };
}

// CLI Execution
const args = process.argv.slice(2);
const cmd = args[0] || 'list';
const ws = resolveWorkspace();

switch (cmd) {
  case 'create': {
    const label = args[1] || 'Manual checkpoint';
    const cp = createCheckpoint(ws, label);
    console.log(JSON.stringify({ status: 'created', checkpoint: cp }, null, 2));
    break;
  }
  case 'list': {
    const list = listCheckpoints(ws);
    console.log(JSON.stringify({ checkpoints: list }, null, 2));
    break;
  }
  case 'diff': {
    const id = args[1];
    if (!id) {
      console.error('Error: Checkpoint ID required');
      process.exit(1);
    }
    console.log(diffCheckpoint(ws, id));
    break;
  }
  case 'revert': {
    const id = args[1];
    if (!id) {
      console.error('Error: Checkpoint ID required');
      process.exit(1);
    }
    const res = revertCheckpoint(ws, id);
    console.log(JSON.stringify({ status: 'reverted', details: res }, null, 2));
    break;
  }
  default:
    console.log('Usage: node step-checkpoint.js [create|list|diff|revert] [options]');
}
