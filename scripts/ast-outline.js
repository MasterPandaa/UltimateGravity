#!/usr/bin/env node
/**
 * AST Outline Extractor (Zed-Inspired Tree-Sitter & Structural Outline Pattern)
 * 
 * Extracts high-level structural signatures (classes, functions, interfaces, types, exports)
 * from large source files without dumping implementation bodies into the LLM context.
 * 
 * Usage:
 *   node C:\Users\Luthfi\.gemini\scripts\ast-outline.js <file-path> [--max-depth <n>]
 */

const fs = require('fs');
const path = require('path');

function getOutline(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`[ERROR] File not found: ${filePath}`);
    process.exit(1);
  }

  const stat = fs.statSync(filePath);
  if (!stat.isFile()) {
    console.error(`[ERROR] Target is not a file: ${filePath}`);
    process.exit(1);
  }

  const ext = path.extname(filePath).toLowerCase();
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/);
  const totalLines = lines.length;

  console.log(`\n📄 [AST OUTLINE] ${path.resolve(filePath)}`);
  console.log(`📊 Total Lines: ${totalLines} | Size: ${(stat.size / 1024).toFixed(1)} KB`);
  console.log(`----------------------------------------------------------------------`);

  const results = [];

  // Patterns for TypeScript / JavaScript
  const controlKeywords = new Set(['if', 'for', 'while', 'switch', 'catch', 'finally', 'with', 'return']);
  const tsJsPatterns = [
    { type: 'class', regex: /^\s*(export\s+)?(abstract\s+)?class\s+([A-Za-z0-9_$]+)/ },
    { type: 'interface', regex: /^\s*(export\s+)?interface\s+([A-Za-z0-9_$]+)/ },
    { type: 'type', regex: /^\s*(export\s+)?type\s+([A-Za-z0-9_$]+)\s*=/ },
    { type: 'enum', regex: /^\s*(export\s+)?enum\s+([A-Za-z0-9_$]+)/ },
    { type: 'function', regex: /^\s*(export\s+)?(async\s+)?function\s+([A-Za-z0-9_$]+)/ },
    { type: 'arrow-const', regex: /^\s*(export\s+)?const\s+([A-Za-z0-9_$]+)\s*=\s*(async\s*)?\([^)]*\)\s*(=>|:)/ },
    { 
      type: 'method', 
      regex: /^\s*(public|private|protected|static|async|\*)*\s*([A-Za-z0-9_$]+)\s*\([^)]*\)\s*(:\s*[^;{]+)?\s*\{/,
      validate: (match) => {
        const id = match[2];
        return id && !controlKeywords.has(id);
      }
    },
  ];

  // Patterns for Python
  const pyPatterns = [
    { type: 'class', regex: /^(\s*)class\s+([A-Za-z0-9_]+)(\([^)]*\))?:/ },
    { type: 'def', regex: /^(\s*)(async\s+)?def\s+([A-Za-z0-9_]+)\s*\([^)]*\)(\s*->\s*[^:]+)?:/ },
    { type: 'decorator', regex: /^(\s*)@([A-Za-z0-9_.]+)/ },
  ];

  // Patterns for Go / Rust
  const goRustPatterns = [
    { type: 'go-type', regex: /^\s*type\s+([A-Za-z0-9_]+)\s+(struct|interface)/ },
    { type: 'go-func', regex: /^\s*func\s+(\([^)]+\)\s+)?([A-Za-z0-9_]+)\s*\([^)]*\)/ },
    { type: 'rust-struct', regex: /^\s*(pub\s+)?(struct|enum|trait)\s+([A-Za-z0-9_]+)/ },
    { type: 'rust-impl', regex: /^\s*impl(\s*<[^>]+>)?\s+([A-Za-z0-9_]+)/ },
    { type: 'rust-fn', regex: /^\s*(pub\s+)?(async\s+)?fn\s+([A-Za-z0-9_]+)/ },
  ];

  let activePatterns = tsJsPatterns;
  if (['.py'].includes(ext)) {
    activePatterns = pyPatterns;
  } else if (['.go', '.rs'].includes(ext)) {
    activePatterns = goRustPatterns;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      continue;
    }

    for (const p of activePatterns) {
      const match = line.match(p.regex);
      if (match) {
        if (p.validate && !p.validate(match)) {
          continue;
        }
        // Truncate long inline blocks
        let displayLine = trimmed;
        if (displayLine.length > 100) {
          displayLine = displayLine.slice(0, 97) + '...';
        }
        // Remove trailing braces/colons for clean signature display
        displayLine = displayLine.replace(/\s*\{?\s*$/, '');
        results.push({ lineNum: i + 1, text: displayLine, type: p.type });
        break;
      }
    }
  }

  if (results.length === 0) {
    console.log(`[INFO] No top-level structural signatures detected. File may be declarative or data-only.`);
  } else {
    results.forEach(r => {
      const lineStr = String(r.lineNum).padStart(5, ' ');
      console.log(`L${lineStr} | ${r.text}`);
    });
  }

  console.log(`----------------------------------------------------------------------`);
  console.log(`💡 Found ${results.length} structural symbols. Use \`read_file\` with StartLine/EndLine for targeted inspection.\n`);
}

const targetPath = process.argv[2];
if (!targetPath) {
  console.log(`Usage: node C:\\Users\\Luthfi\\.gemini\\scripts\\ast-outline.js <file-path>`);
  process.exit(1);
}

getOutline(targetPath);
