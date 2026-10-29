#!/usr/bin/env node

/**
 * Antigravity Workspace Indexer & Topology Scanner
 * Fast, incremental file tree and project metadata scanner.
 *
 * Usage:
 *   node workspace-indexer.js scan [dir]
 *   node workspace-indexer.js status
 *   node workspace-indexer.js summary
 *   node workspace-indexer.js update-file <filePath>
 *   node workspace-indexer.js get-prompt-context
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const FD_BIN = 'C:\\Users\\Luthfi\\.gemini\\bin\\fd.exe';

const INDEX_ROOT = 'C:\\Users\\Luthfi\\.gemini\\antigravity\\workspace-index';

const IGNORED_DIRS = new Set([
  '.git', 'node_modules', 'dist', 'build', 'out', 'bin', 'obj',
  '.cache', '.next', '.nuxt', '__pycache__', '.pytest_cache',
  'file-history', 'shell-snapshots', 'tasks', 'tmp', 'coverage'
]);

const IGNORED_EXTS = new Set([
  '.exe', '.dll', '.bin', '.obj', '.so', '.dylib', '.zip', '.tar', '.gz',
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.mp4', '.webm', '.pdf',
  '.woff', '.woff2', '.ttf', '.eot', '.map', '.lock'
]);

function getWorkspaceHash(wsPath) {
  return crypto.createHash('sha256').update(path.resolve(wsPath).toLowerCase()).digest('hex').substring(0, 16);
}

function resolveStorage(wsPath = process.cwd()) {
  const hash = getWorkspaceHash(wsPath);
  const dir = path.join(INDEX_ROOT, hash);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return {
    dir,
    summaryFile: path.join(dir, 'workspace-summary.json'),
    indexFile: path.join(dir, 'file-index.json'),
    metaFile: path.join(INDEX_ROOT, 'last-active.json')
  };
}

function scanWorkspace(rootDir = process.cwd()) {
  const absRoot = path.resolve(rootDir);
  const storage = resolveStorage(absRoot);

  const startMs = Date.now();
  const fileEntries = [];
  const extCounts = {};
  const keyFiles = [];

  const KEY_PATTERNS = [
    'package.json', 'tsconfig.json', 'Cargo.toml', 'go.mod', 'pyproject.toml',
    'requirements.txt', 'composer.json', 'pom.xml', 'build.gradle',
    'README.md', 'GEMINI.md', 'AGENTS.md', 'QODER.md', '.env.example'
  ];

  function walk(currentDir, depth = 0) {
    if (depth > 12) return;
    let entries;
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch (e) {
      return;
    }

    for (const ent of entries) {
      const name = ent.name;
      if (name.startsWith('.') && name !== '.env.example' && name !== '.agents') {
        if (ent.isDirectory()) continue;
      }
      if (IGNORED_DIRS.has(name.toLowerCase())) continue;

      const fullPath = path.join(currentDir, name);

      if (ent.isDirectory()) {
        walk(fullPath, depth + 1);
      } else if (ent.isFile()) {
        const ext = path.extname(name).toLowerCase() || '[none]';
        if (IGNORED_EXTS.has(ext)) continue;

        try {
          const stat = fs.statSync(fullPath);
          const relPath = path.relative(absRoot, fullPath);

          extCounts[ext] = (extCounts[ext] || 0) + 1;

          if (KEY_PATTERNS.includes(name)) {
            keyFiles.push(relPath);
          }

          fileEntries.push({
            relPath,
            size: stat.size,
            mtimeMs: stat.mtimeMs,
            ext
          });
        } catch (e) {}
      }
    }
  }

  let usedFd = false;
  if (fs.existsSync(FD_BIN)) {
    try {
      const excludes = Array.from(IGNORED_DIRS).map(d => `--exclude "${d}"`).join(' ');
      const rawOut = execSync(`"${FD_BIN}" --type f ${excludes} . "${absRoot}"`, {
        encoding: 'utf8',
        maxBuffer: 15 * 1024 * 1024,
        timeout: 3000
      });
      const lines = rawOut.split('\n');
      for (const rawLine of lines) {
        const fullPath = rawLine.trim();
        if (!fullPath) continue;
        const name = path.basename(fullPath);
        const ext = path.extname(name).toLowerCase() || '[none]';
        if (IGNORED_EXTS.has(ext)) continue;
        try {
          const stat = fs.statSync(fullPath);
          const relPath = path.relative(absRoot, fullPath);
          extCounts[ext] = (extCounts[ext] || 0) + 1;
          if (KEY_PATTERNS.includes(name)) keyFiles.push(relPath);
          fileEntries.push({ relPath, size: stat.size, mtimeMs: stat.mtimeMs, ext });
        } catch (e) {}
      }
      usedFd = true;
    } catch (e) {
      usedFd = false;
    }
  }

  if (!usedFd) {
    walk(absRoot);
  }

  // Sort by modification time (most recent first)
  fileEntries.sort((a, b) => b.mtimeMs - a.mtimeMs);

  const durationMs = Date.now() - startMs;
  const recentFiles = fileEntries.slice(0, 15).map(f => ({
    relPath: f.relPath,
    size: f.size,
    modifiedAt: new Date(f.mtimeMs).toISOString()
  }));

  const summary = {
    workspacePath: absRoot,
    workspaceHash: getWorkspaceHash(absRoot),
    scannedAt: new Date().toISOString(),
    durationMs,
    totalFiles: fileEntries.length,
    extensionDistribution: extCounts,
    keyProjectFiles: keyFiles,
    recentModifiedFiles: recentFiles
  };

  fs.writeFileSync(storage.summaryFile, JSON.stringify(summary, null, 2), 'utf8');

  // Compact file map for rapid lookup
  const fileIndex = {};
  for (const f of fileEntries) {
    fileIndex[f.relPath] = { size: f.size, mtimeMs: f.mtimeMs };
  }
  fs.writeFileSync(storage.indexFile, JSON.stringify(fileIndex), 'utf8');

  // Record as active workspace
  fs.writeFileSync(storage.metaFile, JSON.stringify({
    lastActiveHash: summary.workspaceHash,
    lastActivePath: absRoot,
    updatedAt: new Date().toISOString()
  }, null, 2), 'utf8');

  return summary;
}

function updateFile(filePath, wsPath = process.cwd()) {
  const absRoot = path.resolve(wsPath);
  const storage = resolveStorage(absRoot);
  const absFile = path.resolve(filePath);
  const relPath = path.relative(absRoot, absFile);

  if (!fs.existsSync(storage.summaryFile)) {
    return scanWorkspace(absRoot);
  }

  try {
    const summary = JSON.parse(fs.readFileSync(storage.summaryFile, 'utf8'));
    let fileIndex = {};
    if (fs.existsSync(storage.indexFile)) {
      fileIndex = JSON.parse(fs.readFileSync(storage.indexFile, 'utf8'));
    }

    if (fs.existsSync(absFile)) {
      const stat = fs.statSync(absFile);
      fileIndex[relPath] = { size: stat.size, mtimeMs: stat.mtimeMs };

      // Update recent files list
      summary.recentModifiedFiles = summary.recentModifiedFiles.filter(f => f.relPath !== relPath);
      summary.recentModifiedFiles.unshift({
        relPath,
        size: stat.size,
        modifiedAt: new Date(stat.mtimeMs).toISOString()
      });
      if (summary.recentModifiedFiles.length > 15) summary.recentModifiedFiles.pop();
    } else {
      delete fileIndex[relPath];
      summary.recentModifiedFiles = summary.recentModifiedFiles.filter(f => f.relPath !== relPath);
    }

    summary.totalFiles = Object.keys(fileIndex).length;
    summary.updatedAt = new Date().toISOString();

    fs.writeFileSync(storage.summaryFile, JSON.stringify(summary, null, 2), 'utf8');
    fs.writeFileSync(storage.indexFile, JSON.stringify(fileIndex), 'utf8');
    return summary;
  } catch (e) {
    return scanWorkspace(absRoot);
  }
}

function getPromptContext(wsPath = process.cwd()) {
  const storage = resolveStorage(wsPath);
  if (!fs.existsSync(storage.summaryFile)) {
    scanWorkspace(wsPath);
  }

  try {
    const summary = JSON.parse(fs.readFileSync(storage.summaryFile, 'utf8'));
    const topExts = Object.entries(summary.extensionDistribution || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([ext, count]) => `${ext}: ${count}`)
      .join(', ');

    const recent = (summary.recentModifiedFiles || [])
      .slice(0, 5)
      .map(f => f.relPath)
      .join(', ');

    return `[Workspace Index]: ${summary.totalFiles} files (${topExts}) | Key Files: ${(summary.keyProjectFiles || []).join(', ') || 'none'} | Recently Modified: ${recent || 'none'}`;
  } catch (e) {
    return '';
  }
}

// CLI Handling
const args = process.argv.slice(2);
const cmd = args[0] || 'status';

switch (cmd) {
  case 'scan': {
    const targetDir = args[1] || process.cwd();
    console.log(`Scanning workspace at: ${path.resolve(targetDir)}...`);
    const s = scanWorkspace(targetDir);
    console.log(`Scan completed in ${s.durationMs}ms: ${s.totalFiles} files indexed.`);
    console.log(`Key project files found: ${s.keyProjectFiles.join(', ') || 'none'}`);
    break;
  }
  case 'status':
  case 'summary': {
    const storage = resolveStorage(args[1] || process.cwd());
    if (!fs.existsSync(storage.summaryFile)) {
      console.log('No index found for this workspace. Run "node workspace-indexer.js scan" first.');
      process.exit(0);
    }
    const s = JSON.parse(fs.readFileSync(storage.summaryFile, 'utf8'));
    console.log(`\n=== Workspace Topology: ${s.workspacePath} ===`);
    console.log(`Total files: ${s.totalFiles} | Scanned at: ${s.scannedAt} (${s.durationMs}ms)`);
    console.log(`Key project files: ${s.keyProjectFiles.join(', ') || 'none'}`);
    console.log(`Top file types:`, s.extensionDistribution);
    console.log(`\nRecently Modified:`);
    for (const f of s.recentModifiedFiles.slice(0, 8)) {
      console.log(`  - ${f.relPath} (${f.size} B) [${f.modifiedAt}]`);
    }
    break;
  }
  case 'update-file': {
    if (!args[1]) {
      console.error('Usage: update-file <filePath>');
      process.exit(1);
    }
    updateFile(args[1], args[2] || process.cwd());
    console.log(`Index updated for: ${args[1]}`);
    break;
  }
  case 'get-prompt-context': {
    const ctx = getPromptContext(args[1] || process.cwd());
    console.log(ctx);
    break;
  }
  default:
    console.log('Available commands: scan [dir], status, summary, update-file <filePath>, get-prompt-context');
}

module.exports = { scanWorkspace, updateFile, getPromptContext, resolveStorage };
