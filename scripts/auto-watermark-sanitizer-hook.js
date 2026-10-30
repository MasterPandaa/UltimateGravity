/**
 * Antigravity Automated Zero-Watermark & Provenance Sanitizer Hook
 * Event: PostToolUse (edit_file|write_file)
 * Automatically strips invisible Unicode, C2PA manifests, EXIF tags, and AI provenance
 * from generated documents (PDF, DOCX, MD, HTML) and visual media (SVG, PNG, JPG, WebP).
 */

const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

function log(msg) {
  try {
    const logDir = 'C:\\Users\\Luthfi\\.gemini\\scripts\\logs';
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    fs.appendFileSync(path.join(logDir, 'watermark-sanitizer.log'), `[${new Date().toISOString()}] ${msg}\n`, 'utf8');
  } catch (e) {}
}

const SUPPORTED_EXTS = new Set([
  '.pdf', '.docx', '.xlsx', '.pptx', '.odt',
  '.svg', '.png', '.jpg', '.jpeg', '.webp',
  '.md', '.html'
]);

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
    if (!payload.toolCall) {
      process.stdout.write(JSON.stringify({}));
      process.exit(0);
    }

    const toolName = payload.toolCall.name;
    const targetPath = payload.toolCall.args?.Path;

    if (!targetPath || (toolName !== 'edit_file' && toolName !== 'write_file')) {
      process.stdout.write(JSON.stringify({}));
      process.exit(0);
    }

    const ext = path.extname(targetPath).toLowerCase();
    if (!SUPPORTED_EXTS.has(ext)) {
      process.stdout.write(JSON.stringify({}));
      process.exit(0);
    }

    const normalized = path.normalize(targetPath);

    // Skip internal configs, git internals, node_modules, and the remover tool itself
    if (
      normalized.includes('\\.gemini\\config\\') ||
      normalized.includes('\\.gemini\\antigravity\\brain\\') && (normalized.endsWith('transcript.jsonl') || normalized.endsWith('.log')) ||
      normalized.includes('\\.git\\') ||
      normalized.includes('\\node_modules\\') ||
      normalized.includes('\\tools\\watermarks-remover\\')
    ) {
      process.stdout.write(JSON.stringify({}));
      process.exit(0);
    }

    if (!fs.existsSync(normalized)) {
      process.stdout.write(JSON.stringify({}));
      process.exit(0);
    }

    const cleanerScript = 'C:\\Users\\Luthfi\\.gemini\\tools\\watermarks-remover\\service\\scripts\\clean_file.py';
    
    // Execute sanitizer in-place
    execFile('python', [cleanerScript, normalized, '--in-place', '-q'], { timeout: 4000 }, (err, stdout, stderr) => {
      if (err) {
        log(`Sanitize error for ${normalized}: ${err.message}`);
      } else {
        log(`Successfully sanitized ${normalized}`);
        // Clean up .bak file if generated
        const bakFile = `${normalized}.bak`;
        if (fs.existsSync(bakFile)) {
          try { fs.unlinkSync(bakFile); } catch (e) {}
        }
      }
      process.stdout.write(JSON.stringify({}));
      process.exit(0);
    });

  } catch (err) {
    log(`Hook Error: ${err.message}`);
    process.stdout.write(JSON.stringify({}));
    process.exit(0);
  }
});
