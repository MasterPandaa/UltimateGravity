/**
 * Antigravity File History Hook (PreToolUse)
 * Automatically takes a continuous shadow-copy of any file about to be edited or overwritten.
 * Output: { "decision": "allow" }
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function log(msg) {
  try {
    const logDir = path.join('C:\\Users\\Luthfi\\.gemini\\scripts\\logs');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    const logFile = path.join(logDir, 'file-history.log');
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`, 'utf8');
  } catch (e) {
    // ignore logging errors
  }
}

let inputData = '';

process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
  inputData += chunk;
});

process.stdin.on('end', () => {
  try {
    if (!inputData.trim()) {
      process.stdout.write(JSON.stringify({ decision: 'allow' }));
      process.exit(0);
    }

    const payload = JSON.parse(inputData);
    const toolCall = payload.toolCall || {};
    const toolName = toolCall.name || '';
    const args = toolCall.args || {};
    const targetPath = args.Path;
    const conversationId = payload.conversationId || 'default-session';
    const stepIdx = payload.stepIdx !== undefined ? payload.stepIdx : null;

    if ((toolName === 'edit_file' || toolName === 'write_file') && targetPath) {
      processFileBackup(targetPath, toolName, conversationId, stepIdx);
    }
  } catch (err) {
    log(`Hook Error: ${err.message}`);
  } finally {
    // Guarantee { "decision": "allow" } is returned to Antigravity
    process.stdout.write(JSON.stringify({ decision: 'allow' }));
    process.exit(0);
  }
});

function processFileBackup(filePath, toolName, conversationId, stepIdx) {
  try {
    const resolvedPath = path.resolve(filePath);

    // Skip backing up internal directories
    const normalized = resolvedPath.toLowerCase();
    if (
      normalized.includes('\\file-history\\') ||
      normalized.includes('/file-history/') ||
      normalized.includes('\\.git\\') ||
      normalized.includes('/.git/') ||
      normalized.includes('\\node_modules\\') ||
      normalized.includes('/node_modules/')
    ) {
      return;
    }

    const historyRoot = 'C:\\Users\\Luthfi\\.gemini\\antigravity\\file-history';
    const sessionDir = path.join(historyRoot, conversationId);
    const snapshotsDir = path.join(sessionDir, 'snapshots');

    if (!fs.existsSync(snapshotsDir)) {
      fs.mkdirSync(snapshotsDir, { recursive: true });
    }

    const manifestPath = path.join(sessionDir, 'manifest.json');
    let manifest = { conversationId, files: {}, timeline: [] };

    if (fs.existsSync(manifestPath)) {
      try {
        manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      } catch (e) {
        manifest = { conversationId, files: {}, timeline: [] };
      }
    }

    const fileKey = resolvedPath;
    if (!manifest.files[fileKey]) {
      manifest.files[fileKey] = {
        originalPath: resolvedPath,
        versions: [],
        currentVersion: 0,
        createdAt: new Date().toISOString()
      };
    }

    const fileMeta = manifest.files[fileKey];

    if (fs.existsSync(resolvedPath)) {
      const content = fs.readFileSync(resolvedPath);
      const hash = crypto.createHash('sha256').update(content).digest('hex');

      // Check if content changed from last version to avoid duplicate snapshots
      const lastVersion = fileMeta.versions[fileMeta.versions.length - 1];
      if (lastVersion && lastVersion.sha256 === hash) {
        log(`Skipping duplicate backup for ${resolvedPath} (identical hash)`);
        return;
      }

      const nextVersion = (fileMeta.currentVersion || 0) + 1;
      fileMeta.currentVersion = nextVersion;

      // Safe filename: sanitizedBaseName@v{N}_{timestamp}.bak
      const baseName = path.basename(resolvedPath).replace(/[^a-zA-Z0-9._-]/g, '_');
      const snapshotFileName = `${baseName}@v${nextVersion}_${Date.now()}.bak`;
      const snapshotFilePath = path.join(snapshotsDir, snapshotFileName);

      fs.writeFileSync(snapshotFilePath, content);

      const record = {
        version: nextVersion,
        snapshotFile: snapshotFileName,
        snapshotPath: snapshotFilePath,
        timestamp: new Date().toISOString(),
        stepIdx,
        tool: toolName,
        action: 'backup_before_mutation',
        size: content.length,
        sha256: hash
      };

      fileMeta.versions.push(record);
      manifest.timeline.push({
        type: 'backup',
        filePath: resolvedPath,
        version: nextVersion,
        stepIdx,
        timestamp: record.timestamp,
        tool: toolName
      });

      log(`[v${nextVersion}] Backed up ${resolvedPath} -> ${snapshotFileName} (${content.length} bytes)`);
    } else {
      // Target file doesn't exist yet (write_file creating a new file)
      const record = {
        version: 0,
        snapshotFile: null,
        timestamp: new Date().toISOString(),
        stepIdx,
        tool: toolName,
        action: 'file_created',
        note: 'File does not exist yet; will be created by this tool call'
      };

      if (!fileMeta.versions.some(v => v.version === 0)) {
        fileMeta.versions.push(record);
        manifest.timeline.push({
          type: 'created',
          filePath: resolvedPath,
          version: 0,
          stepIdx,
          timestamp: record.timestamp,
          tool: toolName
        });
        log(`Recorded new file creation intent for ${resolvedPath}`);
      }
    }

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  } catch (err) {
    log(`Backup Exception for ${filePath}: ${err.message}`);
  }
}
