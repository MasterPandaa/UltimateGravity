#!/usr/bin/env node

/**
 * Antigravity File Rewind CLI
 * Inspect, diff, and restore file versions captured by file-history-hook.
 *
 * Usage:
 *   node file-rewind.js list [conversationId]
 *   node file-rewind.js history <filePath> [conversationId]
 *   node file-rewind.js diff <filePath> <version> [conversationId]
 *   node file-rewind.js restore <filePath> <version> [conversationId]
 *   node file-rewind.js undo-last [conversationId]
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const HISTORY_ROOT = 'C:\\Users\\Luthfi\\.gemini\\antigravity\\file-history';

function resolveSessionDir(conversationId) {
  if (conversationId) {
    const custom = path.join(HISTORY_ROOT, conversationId);
    if (fs.existsSync(custom)) return custom;
  }

  // Look for most recent session directory in HISTORY_ROOT
  if (!fs.existsSync(HISTORY_ROOT)) return null;
  const sessions = fs.readdirSync(HISTORY_ROOT, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => ({
      name: d.name,
      path: path.join(HISTORY_ROOT, d.name),
      mtime: fs.statSync(path.join(HISTORY_ROOT, d.name)).mtimeMs
    }))
    .sort((a, b) => b.mtime - a.mtime);

  return sessions.length > 0 ? sessions[0].path : null;
}

function loadManifest(sessionDir) {
  if (!sessionDir) return null;
  const manifestPath = path.join(sessionDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (e) {
    return null;
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function cmdList(conversationId) {
  const sessionDir = resolveSessionDir(conversationId);
  if (!sessionDir) {
    console.log('No file history found.');
    return;
  }
  const manifest = loadManifest(sessionDir);
  if (!manifest || Object.keys(manifest.files).length === 0) {
    console.log('No modified files recorded in session:', path.basename(sessionDir));
    return;
  }

  console.log(`\n=== File History for Session: ${manifest.conversationId} ===\n`);
  console.log('Path'.padEnd(65) + 'Versions'.padEnd(12) + 'Last Modified');
  console.log('-'.repeat(100));

  for (const [filePath, meta] of Object.entries(manifest.files)) {
    const versions = meta.versions.filter(v => v.version > 0);
    const lastVer = versions[versions.length - 1];
    const time = lastVer ? new Date(lastVer.timestamp).toLocaleString() : 'N/A';
    const displayPath = filePath.length > 60 ? '...' + filePath.slice(-57) : filePath;
    console.log(displayPath.padEnd(65) + `${versions.length} ver`.padEnd(12) + time);
  }
  console.log('\nUse "node file-rewind.js history <filePath>" to see all versions.');
}

function cmdHistory(targetFile, conversationId) {
  const sessionDir = resolveSessionDir(conversationId);
  const manifest = loadManifest(sessionDir);
  if (!manifest) {
    console.error('Session history not found.');
    return;
  }

  const resolved = path.resolve(targetFile);
  const meta = manifest.files[resolved] || Object.values(manifest.files).find(f => f.originalPath.toLowerCase() === resolved.toLowerCase());

  if (!meta) {
    console.error(`File not tracked in history: ${targetFile}`);
    return;
  }

  console.log(`\n=== Version History for: ${meta.originalPath} ===\n`);
  console.log('Ver'.padEnd(6) + 'Size'.padEnd(12) + 'Timestamp'.padEnd(25) + 'Tool'.padEnd(15) + 'Snapshot File');
  console.log('-'.repeat(90));

  for (const v of meta.versions) {
    if (v.version === 0) {
      console.log(`v0`.padEnd(6) + `[New File]`.padEnd(12) + `${new Date(v.timestamp).toLocaleString()}`.padEnd(25) + `${v.tool}`.padEnd(15) + `(File created)`);
    } else {
      console.log(`v${v.version}`.padEnd(6) + `${formatBytes(v.size)}`.padEnd(12) + `${new Date(v.timestamp).toLocaleString()}`.padEnd(25) + `${v.tool}`.padEnd(15) + `${v.snapshotFile}`);
    }
  }

  console.log('\nCommands:');
  console.log(`  node file-rewind.js restore "${targetFile}" <version>`);
  console.log(`  node file-rewind.js diff "${targetFile}" <version>\n`);
}

function cmdDiff(targetFile, versionNum, conversationId) {
  const sessionDir = resolveSessionDir(conversationId);
  const manifest = loadManifest(sessionDir);
  if (!manifest) return;

  const resolved = path.resolve(targetFile);
  const meta = manifest.files[resolved] || Object.values(manifest.files).find(f => f.originalPath.toLowerCase() === resolved.toLowerCase());

  if (!meta) {
    console.error(`File not tracked: ${targetFile}`);
    return;
  }

  const ver = parseInt(versionNum, 10);
  const targetVer = meta.versions.find(v => v.version === ver);
  if (!targetVer || !targetVer.snapshotPath || !fs.existsSync(targetVer.snapshotPath)) {
    console.error(`Version v${ver} snapshot not found for ${targetFile}`);
    return;
  }

  const oldContent = fs.readFileSync(targetVer.snapshotPath, 'utf8');
  const currentContent = fs.existsSync(meta.originalPath) ? fs.readFileSync(meta.originalPath, 'utf8') : '[FILE DELETED]';

  console.log(`\n=== Diff: v${ver} (Snapshot) vs Current (${path.basename(meta.originalPath)}) ===\n`);
  const oldLines = oldContent.split(/\r?\n/);
  const currentLines = currentContent.split(/\r?\n/);

  console.log(`Snapshot v${ver} lines: ${oldLines.length} | Current lines: ${currentLines.length}`);
  console.log(`Snapshot SHA: ${targetVer.sha256.substring(0, 12)}...\n`);
}

function cmdRestore(targetFile, versionNum, conversationId) {
  const sessionDir = resolveSessionDir(conversationId);
  const manifest = loadManifest(sessionDir);
  if (!manifest) return;

  const resolved = path.resolve(targetFile);
  const meta = manifest.files[resolved] || Object.values(manifest.files).find(f => f.originalPath.toLowerCase() === resolved.toLowerCase());

  if (!meta) {
    console.error(`File not tracked: ${targetFile}`);
    return;
  }

  const ver = parseInt(versionNum, 10);
  const targetVer = meta.versions.find(v => v.version === ver);
  if (!targetVer) {
    console.error(`Version v${ver} not found.`);
    return;
  }

  // Before restoring, capture current state as safety backup
  if (fs.existsSync(meta.originalPath)) {
    const currentBytes = fs.readFileSync(meta.originalPath);
    const safetyVer = (meta.currentVersion || 0) + 1;
    meta.currentVersion = safetyVer;
    const baseName = path.basename(meta.originalPath).replace(/[^a-zA-Z0-9._-]/g, '_');
    const safetyName = `${baseName}@v${safetyVer}_pre_restore_${Date.now()}.bak`;
    const safetyPath = path.join(sessionDir, 'snapshots', safetyName);
    fs.writeFileSync(safetyPath, currentBytes);

    meta.versions.push({
      version: safetyVer,
      snapshotFile: safetyName,
      snapshotPath: safetyPath,
      timestamp: new Date().toISOString(),
      tool: 'file-rewind-safety',
      action: 'pre_restore_backup',
      size: currentBytes.length,
      sha256: crypto.createHash('sha256').update(currentBytes).digest('hex')
    });
  }

  if (ver === 0) {
    // Revert file creation -> delete file
    if (fs.existsSync(meta.originalPath)) {
      fs.unlinkSync(meta.originalPath);
      console.log(`[RESTORED v0] File was created in this session; removed: ${meta.originalPath}`);
    }
  } else {
    // Restore file content from snapshot
    const backupContent = fs.readFileSync(targetVer.snapshotPath);
    fs.writeFileSync(meta.originalPath, backupContent);
    console.log(`[RESTORED v${ver}] Successfully restored: ${meta.originalPath} (${formatBytes(backupContent.length)})`);
  }

  // Update manifest
  fs.writeFileSync(path.join(sessionDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
}

function cmdUndoLast(conversationId) {
  const sessionDir = resolveSessionDir(conversationId);
  const manifest = loadManifest(sessionDir);
  if (!manifest || !manifest.timeline || manifest.timeline.length === 0) {
    console.log('No actions in timeline to undo.');
    return;
  }

  const lastAction = manifest.timeline[manifest.timeline.length - 1];
  console.log(`Undoing last action: ${lastAction.type} on ${lastAction.filePath} (version ${lastAction.version})...`);
  cmdRestore(lastAction.filePath, lastAction.version, conversationId);
}

// Entrypoint
const args = process.argv.slice(2);
const cmd = args[0] || 'list';

switch (cmd) {
  case 'list':
    cmdList(args[1]);
    break;
  case 'history':
    if (!args[1]) {
      console.error('Usage: node file-rewind.js history <filePath> [conversationId]');
      process.exit(1);
    }
    cmdHistory(args[1], args[2]);
    break;
  case 'diff':
    if (!args[1] || !args[2]) {
      console.error('Usage: node file-rewind.js diff <filePath> <version> [conversationId]');
      process.exit(1);
    }
    cmdDiff(args[1], args[2], args[3]);
    break;
  case 'restore':
    if (!args[1] || !args[2]) {
      console.error('Usage: node file-rewind.js restore <filePath> <version> [conversationId]');
      process.exit(1);
    }
    cmdRestore(args[1], args[2], args[3]);
    break;
  case 'undo-last':
    cmdUndoLast(args[1]);
    break;
  default:
    console.log('Unknown command. Available: list, history, diff, restore, undo-last');
}
