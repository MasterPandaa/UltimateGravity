#!/usr/bin/env node
/**
 * Head/Tail Log Compactor (DeepSeek Harness Inspired)
 * 
 * Automatically compacts voluminous terminal and command outputs exceeding 8KB.
 * Preserves Head 4KB (initialization/flags) + Tail 1KB (exit code/fatal stack)
 * while pruning redundant intermediate lines to protect context window limits.
 * 
 * Usage:
 *   node C:\Users\Luthfi\.gemini\scripts\compact-log.js <file-path> [--inplace]
 *   node C:\Users\Luthfi\.gemini\scripts\compact-log.js --text "<content>"
 */

const fs = require('fs');
const path = require('path');

const THRESHOLD_CHARS = 8192; // 8 KB
const HEAD_CHARS = 4096;      // 4 KB
const TAIL_CHARS = 1024;      // 1 KB

function compactText(text) {
  if (!text || text.length <= THRESHOLD_CHARS) {
    return text;
  }

  const head = text.slice(0, HEAD_CHARS);
  const tail = text.slice(-TAIL_CHARS);
  const prunedChars = text.length - (HEAD_CHARS + TAIL_CHARS);
  const prunedLines = text.slice(HEAD_CHARS, -TAIL_CHARS).split(/\r?\n/).length;

  return `${head}\n\n[... DSH-Compaction: Truncated ${prunedChars} chars (~${prunedLines} lines) to preserve token budget ...]\n\n${tail}`;
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log(`Usage: node C:\\Users\\Luthfi\\.gemini\\scripts\\compact-log.js <file-path> [--inplace]`);
  process.exit(1);
}

if (args[0] === '--text') {
  const input = args.slice(1).join(' ');
  process.stdout.write(compactText(input));
  process.exit(0);
}

const targetFile = args[0];
if (!fs.existsSync(targetFile)) {
  console.error(`[ERROR] File not found: ${targetFile}`);
  process.exit(1);
}

const raw = fs.readFileSync(targetFile, 'utf8');
const compacted = compactText(raw);

if (args.includes('--inplace')) {
  fs.writeFileSync(targetFile, compacted, 'utf8');
  console.log(`[INFO] Compacted in-place: ${targetFile} (${raw.length} -> ${compacted.length} chars)`);
} else {
  process.stdout.write(compacted);
}
