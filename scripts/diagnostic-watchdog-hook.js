/**
 * Antigravity Diagnostic Watchdog Hook (PostToolUse)
 * Inspired by Devin's BackgroundLintManager.
 * Automatically inspects files immediately after edit_file or write_file.
 * If syntax or fatal linter errors are introduced, it alerts the agent via ephemeralMessage.
 * 
 * Execution time: < 300ms | RAM footprint: < 25 MB (Transient, exits immediately)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function log(msg) {
  try {
    const logDir = 'C:\\Users\\Luthfi\\.gemini\\scripts\\logs';
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    fs.appendFileSync(path.join(logDir, 'diagnostic-watchdog.log'), `[${new Date().toISOString()}] ${msg}\n`, 'utf8');
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
    const toolCall = payload.toolCall || {};
    const toolName = toolCall.name || '';
    const targetPath = toolCall.args?.Path;

    if ((toolName === 'edit_file' || toolName === 'write_file') && targetPath) {
      const issue = checkDiagnostics(targetPath);
      if (issue) {
        log(`Diagnostic issue found in ${targetPath}: ${issue.message}`);
        const response = {
          injectSteps: [
            {
              ephemeralMessage: `[Diagnostic Watchdog Alert]: File "${path.basename(targetPath)}" has a syntax/compiler issue after modification:\n${issue.message}\nPlease resolve this issue before finishing.`
            }
          ]
        };
        process.stdout.write(JSON.stringify(response));
        process.exit(0);
      }
    }

    process.stdout.write(JSON.stringify({}));
  } catch (err) {
    log(`Hook Error: ${err.message}`);
    process.stdout.write(JSON.stringify({}));
  } finally {
    process.exit(0);
  }
});

function checkDiagnostics(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;

    const ext = path.extname(filePath).toLowerCase();
    const content = fs.readFileSync(filePath, 'utf8');

    // 1. JSON Files
    if (ext === '.json') {
      try {
        JSON.parse(content);
      } catch (err) {
        return {
          type: 'json_syntax_error',
          message: `JSON SyntaxError: ${err.message}`
        };
      }
    }

    // 2. Python Files (.py)
    if (ext === '.py') {
      try {
        // python -m py_compile validates syntax without executing
        execSync(`python -m py_compile "${filePath}"`, {
          timeout: 2000,
          stdio: ['pipe', 'pipe', 'pipe']
        });
      } catch (err) {
        const stderr = err.stderr ? err.stderr.toString('utf8').trim() : err.message;
        const cleanErr = stderr.split('\n').slice(-4).join('\n');
        return {
          type: 'python_syntax_error',
          message: cleanErr || 'Python syntax validation failed'
        };
      }
    }

    // 3. JavaScript Files (.js, .mjs, .cjs)
    if (ext === '.js' || ext === '.mjs' || ext === '.cjs') {
      try {
        execSync(`node --check "${filePath}"`, {
          timeout: 2000,
          stdio: ['pipe', 'pipe', 'pipe']
        });
      } catch (err) {
        const stderr = err.stderr ? err.stderr.toString('utf8').trim() : err.message;
        const cleanErr = stderr.split('\n').slice(-4).join('\n');
        return {
          type: 'javascript_syntax_error',
          message: cleanErr || 'JavaScript syntax check failed'
        };
      }
    }

    // 4. TypeScript & TSX Files (.ts, .tsx)
    if (ext === '.ts' || ext === '.tsx') {
      // Step 4A: Check for local tsc in project
      const dir = path.dirname(filePath);
      let curr = dir;
      let localTsc = null;
      for (let i = 0; i < 5; i++) {
        const candidate = path.join(curr, 'node_modules', '.bin', 'tsc.cmd');
        if (fs.existsSync(candidate)) {
          localTsc = candidate;
          break;
        }
        const parent = path.dirname(curr);
        if (parent === curr) break;
        curr = parent;
      }

      if (localTsc) {
        try {
          execSync(`"${localTsc}" --noEmit --skipLibCheck "${filePath}"`, {
            cwd: curr,
            timeout: 3000,
            stdio: ['pipe', 'pipe', 'pipe']
          });
        } catch (err) {
          const stdout = err.stdout ? err.stdout.toString('utf8').trim() : '';
          const stderr = err.stderr ? err.stderr.toString('utf8').trim() : '';
          const combined = (stdout || stderr).split('\n').filter(l => l.includes('error TS')).slice(0, 3).join('\n');
          if (combined) {
            return {
              type: 'typescript_error',
              message: combined
            };
          }
        }
      } else {
        // Fast structural delimiter check (unclosed braces, parens, brackets, backticks)
        const delimiterErr = checkBalancedDelimiters(content);
        if (delimiterErr) {
          return {
            type: 'delimiter_error',
            message: delimiterErr
          };
        }
      }
    }

    return null;
  } catch (e) {
    return null;
  }
}

function checkBalancedDelimiters(content) {
  // Fast sanity check for unmatched braces/brackets/quotes that break TS code
  const stack = [];
  let inString = false;
  let stringChar = '';
  let inLineComment = false;
  let inBlockComment = false;

  const lines = content.split('\n');
  for (let l = 0; l < lines.length; l++) {
    const line = lines[l];
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const next = line[i + 1];

      if (inLineComment) continue;

      if (inBlockComment) {
        if (char === '*' && next === '/') {
          inBlockComment = false;
          i++;
        }
        continue;
      }

      if (char === '/' && next === '/' && !inString) {
        inLineComment = true;
        break;
      }

      if (char === '/' && next === '*' && !inString) {
        inBlockComment = true;
        i++;
        continue;
      }

      if ((char === '"' || char === "'" || char === '`') && (i === 0 || line[i - 1] !== '\\')) {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (stringChar === char) {
          inString = false;
        }
        continue;
      }

      if (inString) continue;

      if (char === '{' || char === '(' || char === '[') {
        stack.push({ char, line: l + 1, col: i + 1 });
      } else if (char === '}' || char === ')' || char === ']') {
        if (stack.length === 0) {
          return `Unmatched closing '${char}' at line ${l + 1}, column ${i + 1}`;
        }
        const last = stack.pop();
        const expected = last.char === '{' ? '}' : last.char === '(' ? ')' : ']';
        if (char !== expected) {
          return `Mismatched bracket: expected '${expected}' for '${last.char}' (line ${last.line}), but found '${char}' at line ${l + 1}, col ${i + 1}`;
        }
      }
    }
    inLineComment = false;
    // Multi-line template literals (`...`) can span lines, single/double quotes cannot
    if (inString && stringChar !== '`') {
      return `Unclosed string quote '${stringChar}' at line ${l + 1}`;
    }
  }

  if (stack.length > 0) {
    const unclosed = stack.pop();
    return `Unclosed '${unclosed.char}' opened at line ${unclosed.line}, column ${unclosed.col}`;
  }

  return null;
}
