/**
 * Antigravity Workspace Indexer Hook
 * Handles SessionStart, PostToolUse (edit_file|write_file), and PreInvocation.
 */

const fs = require('fs');
const path = require('path');
const { scanWorkspace, updateFile, getPromptContext } = require('./workspace-indexer');

function log(msg) {
  try {
    const logDir = 'C:\\Users\\Luthfi\\.gemini\\scripts\\logs';
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    fs.appendFileSync(path.join(logDir, 'workspace-indexer.log'), `[${new Date().toISOString()}] ${msg}\n`, 'utf8');
  } catch (e) {}
}

let inputData = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
  inputData += chunk;
});

process.stdin.on('end', () => {
  try {
    if (!inputData.trim()) {
      process.stdout.write(JSON.stringify({}));
      process.exit(0);
    }

    const payload = JSON.parse(inputData);
    const wsPaths = payload.workspacePaths || [];
    const targetWs = (wsPaths.length > 0 && fs.existsSync(wsPaths[0])) ? wsPaths[0] : process.cwd();

    // 1. SessionStart Event
    if (payload.conversationId && !payload.toolCall && payload.invocationNum === undefined && !payload.stepIdx) {
      log(`SessionStart for workspace: ${targetWs}`);
      const summary = scanWorkspace(targetWs);
      const topExts = Object.entries(summary.extensionDistribution || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([ext, count]) => `${ext}(${count})`)
        .join(', ');

      const contextMsg = `[Workspace Overview]: Root: ${summary.workspacePath} | Files: ${summary.totalFiles} [${topExts}] | Key Files: ${(summary.keyProjectFiles || []).join(', ') || 'none'}`;

      const response = {
        injectSteps: [
          {
            systemMessage: {
              systemMessage: contextMsg
            }
          }
        ]
      };
      process.stdout.write(JSON.stringify(response));
      process.exit(0);
    }

    // 2. PostToolUse Event
    if (payload.toolCall) {
      const toolName = payload.toolCall.name;
      const targetPath = payload.toolCall.args?.Path;
      if (targetPath && (toolName === 'edit_file' || toolName === 'write_file')) {
        log(`PostToolUse update for ${targetPath}`);
        updateFile(targetPath, targetWs);
      }
      process.stdout.write(JSON.stringify({}));
      process.exit(0);
    }

    // 3. PreInvocation Event
    if (payload.invocationNum !== undefined) {
      const promptCtx = getPromptContext(targetWs);
      if (promptCtx) {
        const response = {
          injectSteps: [
            {
              ephemeralMessage: promptCtx
            }
          ]
        };
        process.stdout.write(JSON.stringify(response));
        process.exit(0);
      }
    }

    // Default fallback
    process.stdout.write(JSON.stringify({}));
  } catch (err) {
    log(`Hook Error: ${err.message}`);
    process.stdout.write(JSON.stringify({}));
  } finally {
    process.exit(0);
  }
});
