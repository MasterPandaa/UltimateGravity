/**
 * session-end-cleanup.js
 * Hook executed when a session terminates:
 * - Emits mandatory reminder to agent: persist context to Supermemory
 * - Logs session end timestamp to file
 *
 * NOTE: Supermemory cannot be called directly from hook scripts
 * (no API key in hook context). This hook emits reminders to stdout
 * so Antigravity injects it into agent context.
 */

const fs = require('fs');
const path = require('path');

const LOG_PATH = 'C:\\Users\\Luthfi\\.gemini\\scripts\\logs\\session-end.log';

const logDir = path.dirname(LOG_PATH);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const ts = new Date().toISOString();
fs.appendFileSync(LOG_PATH, `[${ts}] Session ended.\n`, 'utf8');

// Context injection to agent via stdout
console.log(`
[SESSION-END REMINDER] Antigravity session ended at ${ts}.
Mandatory actions before closing the conversation:
1. Call supermemory add_memory to persist key architectural decisions from this session.
2. If new bugs or violations were detected, log them in VIOLATIONS_LEDGER.md.
3. Clean up temporary scratch files that are no longer needed.
`);

process.exit(0);
