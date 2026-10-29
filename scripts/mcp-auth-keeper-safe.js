/**
 * mcp-auth-keeper-safe.js
 * Wrapper dengan error handling & exit code yang proper
 * agar Antigravity session hook tidak silent fail
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const SCRIPT_PATH = path.join('C:\\Users\\Luthfi\\.gemini\\scripts\\mcp-auth-keeper.js');
const LOG_PATH = path.join('C:\\Users\\Luthfi\\.gemini\\scripts\\logs\\auth-keeper.log');
const TIMEOUT_MS = 15000; // 15 detik max — jangan hang session

// Pastikan log directory ada
const logDir = path.dirname(LOG_PATH);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}\n`;
  // stdout minimal (untuk Antigravity hook context), diagnostics ke log file
  fs.appendFileSync(LOG_PATH, line, 'utf8');
}

async function main() {
  if (!fs.existsSync(SCRIPT_PATH)) {
    log(`ERROR: mcp-auth-keeper.js tidak ditemukan di ${SCRIPT_PATH}`);
    process.stderr.write(`[AUTH-KEEPER] WARN: Script tidak ditemukan — skip auth refresh.\n`);
    process.exit(0); // Jangan blok session karena script hilang
  }

  try {
    log('SessionStart: menjalankan mcp-auth-keeper.js...');
    const result = execSync(`node "${SCRIPT_PATH}"`, {
      timeout: TIMEOUT_MS,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    log('OK: ' + result.trim().split('\n').slice(-2).join(' | '));
    process.exit(0);
  } catch (err) {
    if (err.code === 'ETIMEDOUT' || err.signal === 'SIGTERM') {
      log(`TIMEOUT: auth-keeper melebihi ${TIMEOUT_MS}ms — session tetap dilanjutkan`);
      process.stderr.write(`[AUTH-KEEPER] WARN: Timeout setelah ${TIMEOUT_MS}ms — MCP tokens mungkin belum di-refresh.\n`);
    } else {
      log(`ERROR: ${err.message}`);
      process.stderr.write(`[AUTH-KEEPER] ERROR: ${err.message}\n`);
    }
    // Selalu exit(0) — jangan blok session Antigravity karena auth keeper gagal
    process.exit(0);
  }
}

main();
