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
const crypto = require('crypto');
const { execFileSync } = require('child_process');

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

function checkRepeatTool(toolCall) {
  if (!toolCall || !toolCall.name) return null;

  const logDir = 'C:\\Users\\Luthfi\\.gemini\\scripts\\logs';
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  const historyFile = path.join(logDir, 'tool-call-history.json');

  let history = [];
  try {
    if (fs.existsSync(historyFile)) {
      history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
    }
  } catch (e) {
    history = [];
  }

  // Generate fingerprint of tool arguments
  const argsStr = JSON.stringify(toolCall.args || {});
  const argHash = crypto.createHash('md5').update(argsStr).digest('hex').slice(0, 8);
  const currentEntry = { name: toolCall.name, hash: argHash, ts: Date.now() };

  // Calculate streak of identical consecutive calls
  let streak = 1;
  for (let i = history.length - 1; i >= 0; i--) {
    const prev = history[i];
    // Ignore calls older than 5 minutes
    if (Date.now() - prev.ts > 300000) break;
    if (prev.name === currentEntry.name && prev.hash === currentEntry.hash) {
      streak++;
    } else {
      break;
    }
  }

  // Update rolling history (keep last 20)
  history.push(currentEntry);
  if (history.length > 20) history = history.slice(-20);
  try {
    fs.writeFileSync(historyFile, JSON.stringify(history), 'utf8');
  } catch (e) {}

  // Check DSH thresholds: 3, 5, 8
  if (streak === 3 || streak === 5 || streak >= 8) {
    return {
      streak,
      toolName: toolCall.name,
      message: `[Repeat-Tool Sentinel Alert]: Tool "${toolCall.name}" has been called ${streak} consecutive times with matching parameters. You may be stuck in a repetitive loop. Please step back, re-examine assumptions, or switch strategy (diagnosing-bugs hypothesis loop) instead of repeating the same action.`
    };
  }

  return null;
}

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

    const messages = [];

    // 1. Repeat-Tool Sentinel Check (DeepSeek Harness Inspired)
    const repeatAlert = checkRepeatTool(toolCall);
    if (repeatAlert) {
      log(repeatAlert.message);
      messages.push(repeatAlert.message);
    }

    // 2. Syntax / Compiler Check on modified files
    if ((toolName === 'edit_file' || toolName === 'write_file') && targetPath) {
      const issue = checkDiagnostics(targetPath);
      if (issue) {
        log(`Diagnostic issue found in ${targetPath}: ${issue.message}`);
        messages.push(`[Diagnostic Watchdog Alert]: File "${path.basename(targetPath)}" has a syntax/compiler issue after modification:\n${issue.message}\nPlease resolve this issue before finishing.`);
      }
    }

    if (messages.length > 0) {
      const response = {
        injectSteps: messages.map(msg => ({ ephemeralMessage: msg }))
      };
      process.stdout.write(JSON.stringify(response));
      process.exit(0);
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

    // 0. High-Priority Security & Secret Leak Check
    const secretIssue = checkSecretLeak(content, filePath);
    if (secretIssue) return secretIssue;

    // 0B. Code/Command Injection Sink Heuristic
    const injectionIssue = checkCommandInjectionSink(content, ext);
    if (injectionIssue) return injectionIssue;

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
        execFileSync('python', ['-m', 'py_compile', filePath], {
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
        execFileSync('node', ['--check', filePath], {
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
          execFileSync(localTsc, ['--noEmit', '--skipLibCheck', filePath], {
            cwd: curr,
            timeout: 3000,
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: true
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

    // 5. PowerShell Files (.ps1)
    if (ext === '.ps1') {
      const delimiterErr = checkBalancedDelimiters(content);
      if (delimiterErr) {
        return {
          type: 'powershell_syntax_error',
          message: `PowerShell Syntax Issue: ${delimiterErr}`
        };
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

function checkSecretLeak(content, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  // Skip non-code files, documentation, and system transcript logs
  if (ext === '.md' || ext === '.log' || filePath.includes('.system_generated') || filePath.includes('.git')) return null;

  const patterns = [
    { name: 'OpenAI/Anthropic API Key', regex: /\b(sk-[a-zA-Z0-9_-]{20,}|sk-ant-[a-zA-Z0-9_-]{20,})\b/ },
    { name: 'GitHub Personal Access Token', regex: /\b(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{82})\b/ },
    { name: 'AWS Access Key ID', regex: /\bAKIA[0-9A-Z]{16}\b/ },
    { name: 'Private Key Header', regex: /-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/ }
  ];

  for (const p of patterns) {
    if (p.regex.test(content)) {
      return {
        type: 'secret_leak_alert',
        message: `[CRITICAL SECURITY ALERT]: Hardcoded ${p.name} detected! Remove plaintext credentials and use environment variables immediately.`
      };
    }
  }
  return null;
}

function checkCommandInjectionSink(content, ext) {
  if (ext === '.js' || ext === '.ts' || ext === '.mjs') {
    if (/\b(exec|execSync)\s*\(\s*`[^`]*\$\{/i.test(content) || /\b(exec|execSync)\s*\(\s*['"][^'"]*['"]\s*\+/i.test(content)) {
      return {
        type: 'command_injection_risk',
        message: `[SECURITY WARNING]: Potential command injection sink detected in exec/execSync. Avoid string interpolation/concatenation; use execFile or spawn with argument arrays instead.`
      };
    }
  } else if (ext === '.py') {
    if (/\bos\.system\s*\(\s*f?["'][^"']*["']\s*(\+|\.format|\%)/i.test(content) || /\bos\.system\s*\(\s*f["']/i.test(content)) {
      return {
        type: 'command_injection_risk',
        message: `[SECURITY WARNING]: Potential command injection sink detected in os.system(). Use subprocess.run([...], check=True) with argument lists instead.`
      };
    }
  }
  return null;
}
