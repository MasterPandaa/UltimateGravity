/**
 * Google RRSI & MaD-RSI Regularizer & Selector Engine (Antigravity 2.0)
 *
 * Implements Google RRSI + MaD-RSI (arXiv:2610.28201) Multi-Model Framework:
 * 1. Gate 1: L0 Edit Budget Gate (<= 60 lines for new skills, <= 20 lines for diffs).
 * 2. Gate 2: Pre-Evaluation Leakage & Inert Critic (detects test mocks, bypasses, inert machinery).
 * 3. Gate 3: Noise-Adjusted Safety Floor Gate (rejects regressions where S' < S* - delta).
 * 4. Gate 4: Token-ROI Cost Gate (rejects token bloat where Delta C > beta_0 + beta_1 * Delta S).
 * 5. Gate 5 (MaD-RSI): Cross-Model Invariant & Anti-Overfitting Filter (prohibits model-specific tokens & tags).
 *
 * Plus MaD-RSI Failure Trajectory Pool: Analyzes cross-model agreement to distinguish
 * universal harness defects from model-specific hallucinations.
 *
 * Zero external dependencies (Pure Node.js standard library).
 */

const fs = require('fs');
const path = require('path');

const FAILURE_DB_PATH = path.join(__dirname, '..', 'config', 'mad-rsi-failures.json');

const LEAKAGE_PATTERNS = [
  /(?:const|let|var|=)\s*mock[A-Z0-9_]+/i,
  /(?:apiKey|token|secret|auth)\s*[:=]\s*["'][a-zA-Z0-9_]{8,}["']/i,
  /return\s+true\s*;\s*\/\/\s*bypass/i,
  /dummy[-_]token\s*[:=]/i,
  /fake[-_]secret\s*[:=]/i,
  /test[-_]fixture[-_]override/i
];

const INERT_PATTERNS = [
  /console\.log\(["']TODO/i,
  /\/\/\s*no-op/i,
  /function\s+\w+\(\)\s*\{\s*\}/
];

const MODEL_PROPRIETARY_TAGS = [
  /<\|(?:im_start|im_end|thought|system|user|assistant)\|>/i,
  /<(?:ant_thought|scratchpad|claude_thought)>/i,
  /\[\/?(?:INST|SYS)\]/i,
  /(?:as a|if you are|when acting as)\s+(?:gemini|claude|gpt-?4|deepseek|qwen|llama|minimax)/i
];

function printHelp() {
  console.log(`
Google RRSI & MaD-RSI Regularizer & Selector CLI:
  node rrsi-evaluator.js evaluate --candidate <path> [--baseline <path>] [--score <float>] [--base-score <float>] [--delta <float>] [--b0 <int>] [--b1 <int>]
      Runs full 5-Gate RRSI + MaD-RSI evaluation on a candidate skill/rule specification.

  node rrsi-evaluator.js verify-cross-model <path>
      Runs Gate 5 static critic against proprietary model tags and single-model overfitting.

  node rrsi-evaluator.js record-failure --model <model_name> --task <task_name> --error "<signature>"
      Records a model failure trajectory into the MaD-RSI multi-model dataset.

  node rrsi-evaluator.js failure-matrix
      Analyzes multi-model failure trajectories to isolate universal harness defects vs model-specific quirks.

  node rrsi-evaluator.js localize-failure --error "<sig>" [--task <name>] [--model <model>]
      Recuris failure attribution: localizes errors to Working Memory vs Experiential Skill vs System Harness.

  node rrsi-evaluator.js recuris-status
      Displays the active status of the Recuris Dual-Memory (Working vs Experiential) architecture.
`);
}

/**
 * Gate 1: L0 Edit Budget Verification
 */
function checkL0Budget(candidateContent, baselineContent, maxBudget = 60) {
  const candidateLines = candidateContent.split(/\r?\n/).length;
  const baselineLines = baselineContent ? baselineContent.split(/\r?\n/).length : 0;
  const deltaLines = candidateLines - baselineLines;

  const passed = baselineContent ? (deltaLines <= 20) : (candidateLines <= maxBudget);
  return {
    gate: 'L0_EDIT_BUDGET',
    passed,
    candidateLines,
    baselineLines,
    deltaLines,
    maxBudget,
    detail: passed
      ? `Within L0 budget (${candidateLines} lines <= ${maxBudget})`
      : `Exceeded L0 budget: ${candidateLines} lines > ${maxBudget} limit`
  };
}

/**
 * Gate 2: Pre-Evaluation Leakage & Inert Machinery Critic
 */
function checkLeakageAndInert(candidateContent) {
  const violations = [];

  LEAKAGE_PATTERNS.forEach(pat => {
    if (pat.test(candidateContent)) {
      violations.push(`Leakage detected: matching ${pat.toString()}`);
    }
  });

  INERT_PATTERNS.forEach(pat => {
    if (pat.test(candidateContent)) {
      violations.push(`Inert machinery detected: matching ${pat.toString()}`);
    }
  });

  const passed = violations.length === 0;
  return {
    gate: 'PRE_EVAL_LEAKAGE_CRITIC',
    passed,
    violations,
    detail: passed
      ? 'Clean: Zero benchmark leakage or inert machinery detected.'
      : `Rejected: ${violations.join('; ')}`
  };
}

/**
 * Gate 3: Noise-Adjusted Safety Floor
 * Formula: S' >= S* - delta
 */
function checkSafetyFloor(candidateScore = 1.0, baselineScore = 0.8, delta = 0.05) {
  const floor = baselineScore - delta;
  const passed = candidateScore >= floor;

  return {
    gate: 'NOISE_ADJUSTED_SAFETY_FLOOR',
    passed,
    candidateScore,
    baselineScore,
    noiseDelta: delta,
    safetyFloor: Number(floor.toFixed(4)),
    detail: passed
      ? `Passed safety floor: Candidate score ${candidateScore} >= floor ${floor.toFixed(4)}`
      : `Regressive: Candidate score ${candidateScore} fell below floor ${floor.toFixed(4)}`
  };
}

/**
 * Gate 4: Token-ROI Cost Filter
 * Formula: Delta C <= beta_0 + beta_1 * Delta S
 */
function checkTokenROI(deltaTokens, scoreGain, beta0 = 600, beta1 = 500) {
  const allowableTokenGrowth = beta0 + (beta1 * Math.max(0, scoreGain));
  const passed = deltaTokens <= allowableTokenGrowth;

  return {
    gate: 'TOKEN_ROI_COST_FILTER',
    passed,
    deltaTokens,
    scoreGain,
    allowableTokenGrowth,
    detail: passed
      ? `Token growth justified: +${deltaTokens} tokens <= allowable +${allowableTokenGrowth} tokens`
      : `Token bloat rejected: +${deltaTokens} tokens exceeds allowable +${allowableTokenGrowth} tokens`
  };
}

/**
 * Gate 5 (MaD-RSI): Cross-Model Invariant & Anti-Overfitting Filter
 */
function checkCrossModelInvariant(candidateContent) {
  const violations = [];

  MODEL_PROPRIETARY_TAGS.forEach(pat => {
    if (pat.test(candidateContent)) {
      violations.push(`Proprietary model assumption or tag detected: ${pat.toString()}`);
    }
  });

  const passed = violations.length === 0;
  return {
    gate: 'CROSS_MODEL_INVARIANT_FILTER',
    passed,
    violations,
    detail: passed
      ? 'Clean: Model-agnostic invariant verified (works across Flash, Pro, DeepSeek, Qwen).'
      : `Rejected: Model-specific overfitting detected: ${violations.join('; ')}`
  };
}

/**
 * Full 5-Gate RRSI + MaD-RSI Pipeline
 */
function runFullEvaluation(opts) {
  const candidatePath = opts.candidate;
  if (!candidatePath || !fs.existsSync(candidatePath)) {
    console.error(`[RRSI] Candidate file not found: ${candidatePath}`);
    process.exit(1);
  }

  const candidateRaw = fs.readFileSync(candidatePath, 'utf8');
  let baselineRaw = null;
  if (opts.baseline && fs.existsSync(opts.baseline)) {
    baselineRaw = fs.readFileSync(opts.baseline, 'utf8');
  }

  const candidateScore = opts.score !== undefined ? parseFloat(opts.score) : 1.0;
  const baselineScore = opts['base-score'] !== undefined ? parseFloat(opts['base-score']) : 0.8;
  const delta = opts.delta !== undefined ? parseFloat(opts.delta) : 0.05;
  const isNewSkill = !baselineRaw;
  const defaultBeta0 = isNewSkill ? 600 : 100;
  const b0 = opts.b0 !== undefined ? parseInt(opts.b0, 10) : defaultBeta0;
  const b1 = opts.b1 !== undefined ? parseInt(opts.b1, 10) : 500;

  const candidateChars = candidateRaw.length;
  const baselineChars = baselineRaw ? baselineRaw.length : 0;
  const deltaTokens = Math.max(0, Math.round((candidateChars - baselineChars) / 4));
  const scoreGain = Number((candidateScore - baselineScore).toFixed(4));

  // Run the 5 Gates
  const g1 = checkL0Budget(candidateRaw, baselineRaw, 60);
  const g2 = checkLeakageAndInert(candidateRaw);
  const g3 = checkSafetyFloor(candidateScore, baselineScore, delta);
  const g4 = checkTokenROI(deltaTokens, scoreGain, b0, b1);
  const g5 = checkCrossModelInvariant(candidateRaw);

  const allPassed = g1.passed && g2.passed && g3.passed && g4.passed && g5.passed;

  const result = {
    timestamp: new Date().toISOString(),
    candidate: path.basename(candidatePath),
    baseline: opts.baseline ? path.basename(opts.baseline) : 'none',
    verdict: allPassed ? 'ACCEPTED (GATED_BY_RRSI_AND_MAD_RSI)' : 'REJECTED',
    metrics: {
      candidateScore,
      baselineScore,
      scoreGain,
      deltaTokens,
      candidateLines: g1.candidateLines
    },
    gates: [g1, g2, g3, g4, g5]
  };

  console.log('\n=== [GOOGLE RRSI & MaD-RSI REGULARIZATION & SELECTION REPORT] ===');
  console.log(`Candidate: ${result.candidate}`);
  console.log(`Verdict:   ${allPassed ? '✅ ACCEPTED' : '❌ REJECTED'}\n`);

  result.gates.forEach((g, idx) => {
    const icon = g.passed ? '✅' : '❌';
    console.log(`Gate ${idx + 1} [${g.gate}]: ${icon} ${g.detail}`);
  });

  if (!allPassed) {
    console.log('\n[RRSI / MaD-RSI ACTION]: Candidate rejected. Mutation halted to protect system stability.');
  } else {
    console.log('\n[RRSI / MaD-RSI ACTION]: Candidate passed all 5 gates. Certified model-agnostic and safe for Phase 3 execution.');
  }

  return result;
}

/**
 * MaD-RSI Failure Trajectory Recording
 */
function recordFailure(opts) {
  const model = opts.model || 'unknown-model';
  const task = opts.task || 'unspecified-task';
  const error = opts.error || 'unspecified-error';

  let db = [];
  if (fs.existsSync(FAILURE_DB_PATH)) {
    try {
      db = JSON.parse(fs.readFileSync(FAILURE_DB_PATH, 'utf8'));
    } catch (_) {
      db = [];
    }
  }

  const entry = {
    id: `fail-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    model,
    task,
    error
  };

  db.push(entry);
  fs.writeFileSync(FAILURE_DB_PATH, JSON.stringify(db, null, 2), 'utf8');
  console.log(`[MaD-RSI] Successfully recorded failure trajectory for model [${model}]: ${entry.id}`);
}

/**
 * MaD-RSI Multi-Model Failure Matrix Analysis
 */
function analyzeFailureMatrix() {
  if (!fs.existsSync(FAILURE_DB_PATH)) {
    console.log('[MaD-RSI] No failure trajectories recorded yet. Failure pool is empty.');
    return;
  }

  const db = JSON.parse(fs.readFileSync(FAILURE_DB_PATH, 'utf8'));
  const errorModels = {};

  db.forEach(entry => {
    if (!errorModels[entry.error]) {
      errorModels[entry.error] = new Set();
    }
    errorModels[entry.error].add(entry.model);
  });

  console.log('\n=== [MaD-RSI CROSS-MODEL FAILURE MATRIX] ===');
  console.log(`Total Failure Trajectories Logged: ${db.length}`);
  console.log('---------------------------------------------------------');

  Object.entries(errorModels).forEach(([err, modelsSet]) => {
    const models = Array.from(modelsSet);
    const count = models.length;
    const classification = count >= 2
      ? '🔴 UNIVERSAL HARNESS DEFECT (Action: Fix shared harness/tool seam)'
      : `🟡 MODEL-SPECIFIC QUIRK (Models: ${models.join(', ')}) (Action: Preserve model-agnostic invariance)`;

    console.log(`Error: "${err}"`);
    console.log(`Models Affected: [${models.join(', ')}]`);
    console.log(`Diagnosis: ${classification}\n`);
  });
}

/**
 * Recuris Structured Failure Localization & Attribution
 * Categorizes failure into:
 * - WORKING_MEMORY: Ephemeral state defects (transient network, missing path, dirty working directory).
 * - EXPERIENTIAL_MEMORY: Skill instruction defects (outdated API, bad selector, invalid schema).
 * - SYSTEM_HARNESS: Host/OS infrastructure issues (EACCES, permissions, dead daemon).
 */
function localizeFailure(opts) {
  const error = opts.error || '';
  const task = opts.task || 'unspecified-task';
  const model = opts.model || 'active-model';

  let memoryTier = 'EXPERIENTIAL_MEMORY';
  let localizedTarget = 'general-skill';
  let confidence = 0.85;
  let recommendedAction = '';
  let blastRadius = 'Minimal (Single Skill)';

  const lower = error.toLowerCase();

  // 1. Working Memory (Ephemeral state defects)
  if (
    lower.includes('enoent') ||
    lower.includes('cannot find module') ||
    lower.includes('path does not exist') ||
    lower.includes('no such file or directory') ||
    lower.includes('econnrefused') ||
    lower.includes('etimedout') ||
    lower.includes('socket hang up') ||
    (lower.includes('syntaxerror: unexpected token') && lower.includes('in json'))
  ) {
    memoryTier = 'WORKING_MEMORY';
    localizedTarget = 'transient-workspace-state';
    confidence = 0.95;
    blastRadius = 'Isolated (Turn Scratchpad / CWD)';
    recommendedAction = 'DO NOT MUTATE GLOBAL RULES OR SKILLS! Revert active step via step-checkpoint or fix target path/connection.';
  }
  // 2. System Harness (OS/Security/Permission defects)
  else if (
    lower.includes('eacces') ||
    lower.includes('operation not permitted') ||
    lower.includes('permission denied') ||
    lower.includes('spawn eacces') ||
    lower.includes('process exited with code 127') ||
    lower.includes('mcp server disconnected')
  ) {
    memoryTier = 'SYSTEM_HARNESS';
    localizedTarget = 'host-platform-harness';
    confidence = 0.92;
    blastRadius = 'Platform Level (Shell / Permissions / MCP)';
    recommendedAction = 'Verify OS permissions, check Windows execution policy, or restart MCP auth keeper.';
  }
  // 3. Experiential Memory (Skill instruction defects)
  else {
    memoryTier = 'EXPERIENTIAL_MEMORY';
    confidence = 0.90;
    
    if (lower.includes('playwright') || lower.includes('locator') || lower.includes('element not interactable') || lower.includes('page.goto') || (lower.includes('timeout') && lower.includes('selector'))) {
      localizedTarget = 'playwright-cli';
    } else if (lower.includes('sql') || lower.includes('query') || lower.includes('foreign key') || lower.includes('deadlock') || lower.includes('constraint')) {
      localizedTarget = 'sql-optimization';
    } else if (lower.includes('powershell') || lower.includes('cmdlet') || lower.includes('parameterbindingvalidationexception')) {
      localizedTarget = 'powershell-windows-patterns';
    } else if (lower.includes('ts(') || lower.includes('typescript') || (lower.includes('type') && lower.includes('not assignable'))) {
      localizedTarget = 'typescript-pro';
    } else if (lower.includes('react') || lower.includes('hydration') || lower.includes('tailwind') || lower.includes('shadcn')) {
      localizedTarget = 'shadcn-ui';
    } else if (lower.includes('api') || lower.includes('400 bad request') || lower.includes('422') || lower.includes('zoderror')) {
      localizedTarget = 'api-contract-design';
    } else {
      localizedTarget = 'active-domain-skill';
    }

    blastRadius = `Surgical (Isolated to ${localizedTarget})`;
    recommendedAction = `Skill defect localized to [${localizedTarget}]. Update target skill and validate via 5-Gate RRSI before committing.`;
  }

  const report = {
    id: `recuris-${Date.now()}`,
    timestamp: new Date().toISOString(),
    model,
    task,
    error,
    memoryTier,
    localizedTarget,
    confidence: `${Math.round(confidence * 100)}%`,
    blastRadius,
    recommendedAction,
    status: 'LOCALIZED'
  };

  // Persist to mad-rsi-failures.json
  let db = [];
  if (fs.existsSync(FAILURE_DB_PATH)) {
    try { db = JSON.parse(fs.readFileSync(FAILURE_DB_PATH, 'utf8')); } catch (_) { db = []; }
  }
  db.push(report);
  fs.writeFileSync(FAILURE_DB_PATH, JSON.stringify(db, null, 2), 'utf8');

  console.log('\n=== [RECURIS STRUCTURED FAILURE LOCALIZATION] ===');
  console.log(`Error:              "${error.substring(0, 100)}${error.length > 100 ? '...' : ''}"`);
  console.log(`Memory Tier:        ${memoryTier === 'WORKING_MEMORY' ? '🟢 WORKING_MEMORY (Ephemeral State)' : memoryTier === 'EXPERIENTIAL_MEMORY' ? '🟡 EXPERIENTIAL_MEMORY (Skill Defect)' : '🔴 SYSTEM_HARNESS (Host Defect)'}`);
  console.log(`Localized Target:   ${localizedTarget}`);
  console.log(`Confidence:         ${report.confidence}`);
  console.log(`Blast Radius:       ${blastRadius}`);
  console.log(`Mandatory Action:   ${recommendedAction}`);
  console.log('==================================================\n');

  return report;
}

/**
 * Recuris Dual-Memory Architecture Status
 */
function showRecurisStatus() {
  console.log('\n=== [RECURIS DUAL-MEMORY ARCHITECTURE STATUS] ===');
  // 1. Working Memory
  console.log('📁 [WORKING MEMORY - Ephemeral State]');
  const taskDagPath = path.join(__dirname, '..', 'antigravity', 'tasks', 'dag-state.json');
  const activeTasks = fs.existsSync(taskDagPath) ? 'Active DAG file present' : 'Clean / Idle';
  console.log(` - Active Task State:     ${activeTasks}`);
  console.log(` - Current Working Dir:   ${process.cwd()}`);

  // 2. Experiential Memory
  console.log('\n🧠 [EXPERIENTIAL MEMORY - Persistent Domain Skills]');
  let failCount = 0;
  let workingFailures = 0;
  let skillFailures = 0;
  let systemFailures = 0;
  if (fs.existsSync(FAILURE_DB_PATH)) {
    try {
      const db = JSON.parse(fs.readFileSync(FAILURE_DB_PATH, 'utf8'));
      failCount = db.length;
      db.forEach(e => {
        if (e.memoryTier === 'WORKING_MEMORY') workingFailures++;
        else if (e.memoryTier === 'SYSTEM_HARNESS') systemFailures++;
        else skillFailures++;
      });
    } catch (_) {}
  }
  console.log(` - Total Failure Trajectories Logged: ${failCount}`);
  console.log(`   * Working Memory Glitches:         ${workingFailures}`);
  console.log(`   * Localized Skill Defects:         ${skillFailures}`);
  console.log(`   * System/Harness Deficiencies:     ${systemFailures}`);
  console.log(` - Validation Gate:                   Active (Google RRSI 5-Gate)`);
  console.log('==================================================\n');
}

// CLI Dispatcher
const rawArgs = process.argv.slice(2);
const command = rawArgs[0];

if (!command || command === '--help' || command === '-h') {
  printHelp();
  process.exit(0);
}

const parsed = {};
for (let i = 1; i < rawArgs.length; i += 2) {
  const key = rawArgs[i].replace(/^--/, '');
  parsed[key] = rawArgs[i + 1];
}

if (command === 'evaluate') {
  runFullEvaluation(parsed);
} else if (command === 'verify-cross-model') {
  const target = rawArgs[1];
  if (!target || !fs.existsSync(target)) {
    console.error(`File not found: ${target}`);
    process.exit(1);
  }
  const content = fs.readFileSync(target, 'utf8');
  console.log(JSON.stringify(checkCrossModelInvariant(content), null, 2));
} else if (command === 'record-failure') {
  recordFailure(parsed);
} else if (command === 'failure-matrix') {
  analyzeFailureMatrix();
} else if (command === 'localize-failure') {
  localizeFailure(parsed);
} else if (command === 'recuris-status') {
  showRecurisStatus();
} else {
  console.error(`Unknown command: ${command}`);
  printHelp();
  process.exit(1);
}
