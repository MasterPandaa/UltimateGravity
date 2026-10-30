/**
 * EverMind-AI / Raven Multi-Agent Execution Plane (Antigravity 2.0)
 *
 * Implements Phase 3 of the Self-Evolving Agent Architecture:
 * 1. Collision-Free Subagent DAG Partitioning: Assigns tasks to Tri-Role Specialists (fullstack, qa, data).
 * 2. File Ownership Invariant: Disjoint file write sets to eliminate concurrent write races.
 * 3. Step 0 Skill Ingestion Formatting: Formats invocation prompts conforming to GEMINI.md Step 0 protocol.
 * 4. Context Bleed Barrier: Synthesizes subagent deliverables into a clean, zero-slop summary.
 *
 * Zero external dependencies (Pure Node.js standard library).
 */

const fs = require('fs');
const path = require('path');

const ROLE_ROUTING = {
  frontend: 'fullstack-developer',
  backend: 'fullstack-developer',
  api: 'fullstack-developer',
  ui: 'fullstack-developer',
  test: 'qa-engineer',
  qa: 'qa-engineer',
  e2e: 'qa-engineer',
  security: 'qa-engineer',
  leak: 'qa-engineer',
  scrape: 'data-engineer',
  sql: 'data-engineer',
  database: 'data-engineer',
  etl: 'data-engineer'
};

function printHelp() {
  console.log(`
EverMind-AI / Raven Multi-Agent Execution Plane CLI:
  node raven-dispatcher.js plan --goal "<objective>" --files "<file1,file2,...>" [--workspace <branch|share|inherit>]
      Generates collision-free execution DAG and Step 0 invocation briefs for Tri-Role subagents.

  node raven-dispatcher.js synthesize --reports "<report1_path,report2_path>" [--out <summary_path>]
      Synthesizes isolated subagent outputs, eliminating raw log bloat from the main context.
`);
}

/**
 * Classify file path or task domain to a Tri-Role specialist
 */
function classifyDomain(filePath) {
  const p = filePath.toLowerCase();
  if (p.includes('test') || p.includes('spec') || p.includes('qa') || p.includes('audit')) {
    return 'qa-engineer';
  }
  if (p.includes('sql') || p.includes('scrape') || p.includes('etl') || p.includes('pipeline') || p.includes('migration')) {
    return 'data-engineer';
  }
  return 'fullstack-developer';
}

/**
 * 1. PLAN & PARTITION: Creates collision-free DAG plan for Tri-Role Subagents
 */
function planSubtasks(args) {
  const goal = args.goal || 'Parallel task execution';
  const rawFiles = args.files ? args.files.split(',').map(f => f.trim()).filter(Boolean) : [];
  const workspaceMode = args.workspace || 'branch';

  const partitions = {
    'fullstack-developer': [],
    'qa-engineer': [],
    'data-engineer': []
  };

  rawFiles.forEach(f => {
    const role = classifyDomain(f);
    partitions[role].push(f);
  });

  const subagents = [];

  Object.entries(partitions).forEach(([role, files]) => {
    if (files.length > 0) {
      const prompt = `[MANDATORY STEP 0 - COMPLEMENTARY SKILLS INGESTION GATE]:
Your first tool call (Turn 1 / Step 1) MUST ingest your domain's Complementary Skill cluster:
Primary Entry: C:\\Users\\Luthfi\\.gemini\\config\\agents\\${role}.md
Quote at least 2 specific operational rules before touching target files!

[MANDATORY STEP 1 - TASK EXECUTION]:
Goal: ${goal}
Exclusive File Ownership:
${files.map(f => `- ${f}`).join('\n')}
(Do NOT touch files outside your assigned ownership set).
Deliverable: Return verified exit code and structured diff summary.`;

      subagents.push({
        role,
        typeName: role,
        workspace: workspaceMode,
        files,
        prompt
      });
    }
  });

  const plan = {
    timestamp: new Date().toISOString(),
    goal,
    workspaceMode,
    totalSubagents: subagents.length,
    collisionFreeInvariant: 'VERIFIED (Disjoint File Ownership)',
    subagents
  };

  console.log('\n=== [RAVEN MULTI-AGENT EXECUTION PLAN] ===');
  console.log(JSON.stringify(plan, null, 2));
  return plan;
}

/**
 * 2. SYNTHESIZE: Condenses subagent outputs into a compact executive summary
 */
function synthesizeReports(args) {
  const rawReportPaths = args.reports ? args.reports.split(',').map(p => p.trim()).filter(Boolean) : [];
  const outPath = args.out || null;

  const summary = {
    timestamp: new Date().toISOString(),
    totalReports: rawReportPaths.length,
    status: 'COMPLETE',
    findings: [],
    artifacts: []
  };

  rawReportPaths.forEach(rp => {
    if (fs.existsSync(rp)) {
      const content = fs.readFileSync(rp, 'utf8');
      const lines = content.split(/\r?\n/);
      summary.findings.push({
        source: path.basename(rp),
        lines: lines.length,
        excerpt: lines.slice(0, 5).join(' ').substring(0, 150)
      });
    } else {
      summary.findings.push({
        source: path.basename(rp),
        status: 'FILE_NOT_FOUND'
      });
    }
  });

  console.log('\n=== [RAVEN DISTILLED SYNTHESIS] ===');
  console.log(JSON.stringify(summary, null, 2));

  if (outPath) {
    fs.writeFileSync(outPath, JSON.stringify(summary, null, 2), 'utf8');
    console.log(`[Raven] Saved synthesized report at: ${outPath}`);
  }

  return summary;
}

// CLI Argument Dispatcher
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

if (command === 'plan') {
  planSubtasks(parsed);
} else if (command === 'synthesize') {
  synthesizeReports(parsed);
} else {
  console.error(`Unknown command: ${command}`);
  printHelp();
  process.exit(1);
}
