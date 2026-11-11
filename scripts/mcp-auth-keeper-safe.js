/**
 * mcp-auth-keeper-safe.js
 * Wrapper with proper error handling & exit codes
 * to prevent Antigravity session hooks from failing silently
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const SCRIPT_PATH = path.join('C:\\Users\\Luthfi\\.gemini\\scripts\\mcp-auth-keeper.js');
const LOG_PATH = path.join('C:\\Users\\Luthfi\\.gemini\\scripts\\logs\\auth-keeper.log');
const TIMEOUT_MS = 15000; // 15 seconds max — do not hang session

// Ensure log directory exists
const logDir = path.dirname(LOG_PATH);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}\n`;
  // Minimal stdout (for Antigravity hook context), diagnostics to log file
  fs.appendFileSync(LOG_PATH, line, 'utf8');
}

async function main() {
  if (!fs.existsSync(SCRIPT_PATH)) {
    log(`ERROR: mcp-auth-keeper.js not found at ${SCRIPT_PATH}`);
    process.stderr.write(`[AUTH-KEEPER] WARN: Script not found — skipping auth refresh.\n`);
    process.exit(0); // Do not block session if script is missing
  }

  try {
    log('SessionStart: running mcp-auth-keeper.js...');
    const result = execSync(`node "${SCRIPT_PATH}"`, {
      timeout: TIMEOUT_MS,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    log('OK: ' + result.trim().split('\n').slice(-2).join(' | '));
    process.exit(0);
  } catch (err) {
    if (err.code === 'ETIMEDOUT' || err.signal === 'SIGTERM') {
      log(`TIMEOUT: auth-keeper exceeded ${TIMEOUT_MS}ms — session proceeding`);
      process.stderr.write(`[AUTH-KEEPER] WARN: Timeout after ${TIMEOUT_MS}ms — MCP tokens may not be refreshed.\n`);
    } else {
      log(`ERROR: ${err.message}`);
      process.stderr.write(`[AUTH-KEEPER] ERROR: ${err.message}\n`);
    }
    // Always exit(0) — do not block Antigravity session if auth keeper fails
    process.exit(0);
  }
}

main();
