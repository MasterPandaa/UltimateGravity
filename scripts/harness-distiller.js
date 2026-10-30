/**
 * Harness-Zero Distiller & Discovery Engine (Antigravity 2.0)
 *
 * Implements Phase 1 of the Self-Evolving Agent Harness:
 * 1. Session Scan: Analyzes conversation transcripts to detect friction points, recurring errors, and capability gaps.
 * 2. Distillation: Generates lean, zero-slop .agents / SKILL.md specs adhering strictly to L0 budget (<=60 lines).
 * 3. Verification: Validates YAML frontmatter, line budgets, and deterministic code seams.
 *
 * Zero external dependencies (Pure Node.js standard library).
 */

const fs = require('fs');
const path = require('path');

const FORBIDDEN_SLOP_PHRASES = [
  'in order to',
  'please make sure to',
  'it is recommended to',
  'this skill is designed to',
  'as an ai',
  'delve into',
  'testament to',
  'multifaceted',
  'furthermore',
  'moreover'
];

function printHelp() {
  console.log(`
Harness-Zero Distiller & Discovery Engine CLI:
  node harness-distiller.js scan [transcript_path]
      Scans conversation transcript for recurring tool failures, exceptions, and bottlenecks.

  node harness-distiller.js distill --name <name> --desc <desc> --triggers <triggers> --steps <steps> [--script <script_path_or_inline>] [--out <output_path>]
      Distills a lean, regularized Antigravity skill specification (L0 line-budget <= 60 lines).

  node harness-distiller.js verify <skill_or_rule_path>
      Verifies a skill/rule file against YAML schema, L0 line budgets, and anti-slop rules.
`);
}

/**
 * 1. SCAN SESSION: Scans transcript.jsonl for friction, failure patterns, and bottlenecks
 */
function scanSession(transcriptPath) {
  let resolvedPath = transcriptPath;

  if (!resolvedPath) {
    // Attempt auto-discovery in user's active brain directory
    const brainDir = path.join(process.env.USERPROFILE || 'C:\\Users\\Luthfi', '.gemini', 'antigravity', 'brain');
    if (fs.existsSync(brainDir)) {
      const convs = fs.readdirSync(brainDir, { withFileTypes: true })
        .filter(d => d.isDirectory() && !d.name.startsWith('.'))
        .map(d => ({
          name: d.name,
          time: fs.statSync(path.join(brainDir, d.name)).mtimeMs
        }))
        .sort((a, b) => b.time - a.time);

      if (convs.length > 0) {
        resolvedPath = path.join(brainDir, convs[0].name, '.system_generated', 'logs', 'transcript.jsonl');
      }
    }
  }

  if (!resolvedPath || !fs.existsSync(resolvedPath)) {
    console.error(`[Harness-Zero] Transcript not found: ${resolvedPath || 'None specified'}`);
    process.exit(1);
  }

  console.log(`[Harness-Zero] Scanning transcript: ${resolvedPath}`);
  const lines = fs.readFileSync(resolvedPath, 'utf8').split('\n').filter(Boolean);

  const stats = {
    totalSteps: lines.length,
    toolCalls: 0,
    toolErrors: 0,
    errorCategories: {},
    repeatedFiles: {},
    failedCommands: [],
    frictionPoints: []
  };

  lines.forEach((line, idx) => {
    try {
      const entry = JSON.parse(line);

      if (entry.tool_calls && Array.isArray(entry.tool_calls)) {
        stats.toolCalls += entry.tool_calls.length;
        entry.tool_calls.forEach(tc => {
          if (tc.args) {
            let p = tc.args.Path || tc.args.path;
            if (p) {
              p = p.replace(/^["']|["']$/g, '').trim();
              stats.repeatedFiles[p] = (stats.repeatedFiles[p] || 0) + 1;
            }
          }
        });
      }

      if (entry.status === 'ERROR') {
        stats.toolErrors++;
        const errPreview = (entry.content || '').substring(0, 120).replace(/\r?\n/g, ' ');
        stats.frictionPoints.push({
          step: entry.step_index ?? idx,
          type: 'STATUS_ERROR',
          detail: errPreview
        });
      }

      const content = entry.content || '';
      if (typeof content === 'string') {
        if (/Command exited with code [^0]/i.test(content) || /failed to parse/i.test(content) || /Exception/i.test(content) || /SyntaxError/i.test(content)) {
          stats.toolErrors++;
          const match = content.match(/(?:Command exited with code [^0]|failed to parse[^\n]+|Exception:[^\n]+)/i);
          const signature = match ? match[0] : 'Unknown tool error';
          stats.errorCategories[signature] = (stats.errorCategories[signature] || 0) + 1;
          stats.failedCommands.push({
            step: entry.step_index ?? idx,
            signature: signature
          });
        }
      }
    } catch (_) {
      // Ignore JSON parse errors for corrupted lines
    }
  });

  const highFrictionFiles = Object.entries(stats.repeatedFiles)
    .filter(([_, count]) => count >= 4)
    .map(([file, count]) => ({ file: path.basename(file), fullPath: file, touches: count }));

  const report = {
    totalSteps: stats.totalSteps,
    totalToolCalls: stats.toolCalls,
    errorRatePercent: stats.toolCalls ? ((stats.toolErrors / stats.toolCalls) * 100).toFixed(1) : '0.0',
    totalErrors: stats.toolErrors,
    errorBreakdown: stats.errorCategories,
    highFrictionFiles,
    discoveryCandidates: []
  };

  // Heuristic proposal generation
  if (stats.toolErrors > 0) {
    report.discoveryCandidates.push({
      type: 'RESILIENCE_HARNESS',
      trigger: 'Command exit errors / parsing exceptions detected',
      recommendation: 'Create deterministic pre-flight linter or validation script before mutation'
    });
  }
  if (highFrictionFiles.length > 0) {
    report.discoveryCandidates.push({
      type: 'FILE_SURGERY_HARNESS',
      trigger: `Files touched >= 4 times: ${highFrictionFiles.map(f => f.file).join(', ')}`,
      recommendation: 'Target files suffer from churn; distill modular seam or extract state to helper script'
    });
  }

  console.log('\n=== [HARNESS-ZERO DISCOVERY REPORT] ===');
  console.log(JSON.stringify(report, null, 2));
  return report;
}

/**
 * 2. DISTILL DRAFT: Distills a lean Antigravity skill adhering to L0 <= 60 lines
 */
function distillDraft(args) {
  const name = args.name;
  const desc = args.desc || 'Distilled autonomous skill';
  const triggers = args.triggers || 'Trigger condition description';
  const steps = args.steps ? args.steps.split(';') : ['Step 1: Execute verification', 'Step 2: Produce output'];
  const companionScript = args.script || null;
  const outPath = args.out || path.join(process.cwd(), `${name}.SKILL.md`);

  if (!name) {
    console.error('[Harness-Zero] Missing required --name argument');
    process.exit(1);
  }

  // Construct zero-slop Markdown + YAML
  const lines = [];
  lines.push('---');
  lines.push(`name: ${name}`);
  lines.push(`description: "${desc.replace(/"/g, '\\"')}"`);
  lines.push('---');
  lines.push('');
  lines.push(`# ${name.replace(/-/g, ' ').toUpperCase()}`);
  lines.push('');
  lines.push('## Operational Invariant');
  lines.push(`- **Trigger**: ${triggers}`);
  lines.push(`- **Boundary**: Strict deterministic execution; zero prompt-slop.`);
  lines.push('');
  lines.push('## Execution Protocol');
  steps.forEach((step, idx) => {
    lines.push(`${idx + 1}. ${step.trim()}`);
  });
  lines.push('');

  if (companionScript) {
    lines.push('## Deterministic Code Seam');
    lines.push('```bash');
    lines.push(`node ${companionScript}`);
    lines.push('```');
    lines.push('');
  }

  lines.push('## Evidence Verification');
  lines.push('- Check exit code === 0.');
  lines.push('- Capture compact output; reject unverified assertions.');

  const content = lines.join('\n');
  const lineCount = lines.length;

  if (lineCount > 60) {
    console.warn(`[Harness-Zero Warning] Generated skill exceeds L0 budget: ${lineCount} lines > 60 lines.`);
  }

  const outDir = path.dirname(outPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(outPath, content, 'utf8');
  console.log(`[Harness-Zero] Successfully distilled skill (${lineCount} lines) at: ${outPath}`);
}

/**
 * 3. VERIFY FORMAT: Checks YAML, L0 line budgets, and slop dictionary
 */
function verifyFormat(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`[Harness-Zero] File does not exist: ${filePath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/);
  const totalLines = lines.length;

  const errors = [];
  const warnings = [];

  // Frontmatter check
  if (!raw.startsWith('---')) {
    errors.push('Missing YAML frontmatter opener (---) at line 1');
  } else {
    const endFm = raw.indexOf('\n---', 3);
    if (endFm === -1) {
      errors.push('Missing YAML frontmatter closing tag (---)');
    } else {
      const fmContent = raw.substring(3, endFm);
      if (!/name:\s*[\w-]+/.test(fmContent)) {
        errors.push("YAML frontmatter missing valid 'name:' key");
      }
      if (!/description:\s*["'][^"']+["']|description:\s*[^"'\n]+/.test(fmContent)) {
        errors.push("YAML frontmatter missing valid 'description:' key");
      }
      // Check for unquoted brackets in description
      const descMatch = fmContent.match(/description:\s*(.+)/);
      if (descMatch && descMatch[1]) {
        const val = descMatch[1].trim();
        if ((val.startsWith('[') || val.startsWith('{')) && !val.startsWith('"') && !val.startsWith("'")) {
          errors.push('Unquoted bracket in YAML frontmatter causes parser failure');
        }
      }
    }
  }

  // L0 Budget check
  if (totalLines > 60) {
    warnings.push(`Exceeds recommended Harness-Zero L0 edit budget (${totalLines} lines > 60 lines). Consider pruning.`);
  }

  // Anti-Slop Check
  const lower = raw.toLowerCase();
  FORBIDDEN_SLOP_PHRASES.forEach(phrase => {
    if (lower.includes(phrase)) {
      warnings.push(`Contains AI slop filler phrase: "${phrase}"`);
    }
  });

  console.log(`\n=== [HARNESS-ZERO VERIFICATION: ${path.basename(filePath)}] ===`);
  console.log(`- Total Lines: ${totalLines} (L0 Budget Target: <= 60)`);
  console.log(`- Format Errors: ${errors.length}`);
  console.log(`- Fluff/Slop Warnings: ${warnings.length}`);

  if (errors.length > 0) {
    console.log('\n[FAIL] Format Errors:');
    errors.forEach(e => console.log(`  ❌ ${e}`));
  }
  if (warnings.length > 0) {
    console.log('\n[WARNINGS / PRUNING OPPORTUNITIES]:');
    warnings.forEach(w => console.log(`  ⚠️  ${w}`));
  }
  if (errors.length === 0 && warnings.length === 0) {
    console.log('\n✅ [PASS] 100% Lean, Zero-Slop, Validated Antigravity Harness Spec.');
  }

  return { errors, warnings, totalLines };
}

// CLI Argument Dispatcher
const args = process.argv.slice(2);
const command = args[0];

if (!command || command === '--help' || command === '-h') {
  printHelp();
  process.exit(0);
}

if (command === 'scan') {
  scanSession(args[1]);
} else if (command === 'verify') {
  verifyFormat(args[1]);
} else if (command === 'distill') {
  const parsed = {};
  for (let i = 1; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '');
    parsed[key] = args[i + 1];
  }
  distillDraft(parsed);
} else {
  console.error(`Unknown command: ${command}`);
  printHelp();
  process.exit(1);
}
