#!/usr/bin/env node

/**
 * Antigravity Tiered Governance Manager (Skills & Agents)
 * Seamlessly activate and archive skills and agents between Tier 1 (Active) and Tier 2 (Archive).
 *
 * Usage:
 *   node tier-manager.js status
 *   node tier-manager.js skill-activate <name>
 *   node tier-manager.js skill-archive <name>
 *   node tier-manager.js agent-activate <name>
 *   node tier-manager.js agent-archive <name>
 *   node tier-manager.js optimize-all
 */

const fs = require('fs');
const path = require('path');

const CONFIG_ROOT = 'C:\\Users\\Luthfi\\.gemini\\config';
const SKILLS_ACTIVE = path.join(CONFIG_ROOT, 'skills');
const SKILLS_ARCHIVE = path.join(CONFIG_ROOT, 'archive', 'skills');
const AGENTS_ACTIVE = path.join(CONFIG_ROOT, 'agents');
const AGENTS_ARCHIVE = path.join(CONFIG_ROOT, 'agents-archive');

// Ensure directories exist
for (const dir of [SKILLS_ACTIVE, SKILLS_ARCHIVE, AGENTS_ACTIVE, AGENTS_ARCHIVE]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function getDirs(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  return fs.readdirSync(dirPath, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
}

function getFiles(dirPath, ext = '.md') {
  if (!fs.existsSync(dirPath)) return [];
  return fs.readdirSync(dirPath, { withFileTypes: true })
    .filter(d => d.isFile() && d.name.endsWith(ext))
    .map(d => d.name.slice(0, -ext.length));
}

function skillActivate(name) {
  const clean = name.trim();
  const src = path.join(SKILLS_ARCHIVE, clean);
  const dest = path.join(SKILLS_ACTIVE, clean);

  if (!fs.existsSync(src)) {
    console.error(`Skill "${clean}" not found in archive (${SKILLS_ARCHIVE}).`);
    return false;
  }
  if (fs.existsSync(dest)) {
    console.log(`Skill "${clean}" is already active.`);
    return true;
  }

  fs.renameSync(src, dest);
  console.log(`[ACTIVATED] Skill "${clean}" -> Moved to Tier 1 Active.`);
  return true;
}

function skillArchive(name) {
  const clean = name.trim();
  const src = path.join(SKILLS_ACTIVE, clean);
  const dest = path.join(SKILLS_ARCHIVE, clean);

  if (!fs.existsSync(src)) {
    console.error(`Skill "${clean}" not found in active skills (${SKILLS_ACTIVE}).`);
    return false;
  }
  if (fs.existsSync(dest)) {
    // If destination already exists, remove it first to avoid collision
    fs.rmSync(dest, { recursive: true, force: true });
  }

  fs.renameSync(src, dest);
  console.log(`[ARCHIVED] Skill "${clean}" -> Moved to Tier 2 Archive.`);
  return true;
}

function agentActivate(name) {
  const clean = name.trim().replace(/\.md$/i, '');
  const src = path.join(AGENTS_ARCHIVE, `${clean}.md`);
  const dest = path.join(AGENTS_ACTIVE, `${clean}.md`);

  if (!fs.existsSync(src)) {
    console.error(`Agent "${clean}" not found in archive (${AGENTS_ARCHIVE}).`);
    return false;
  }
  if (fs.existsSync(dest)) {
    console.log(`Agent "${clean}" is already active.`);
    return true;
  }

  fs.renameSync(src, dest);
  console.log(`[ACTIVATED] Agent "${clean}" -> Moved to Core Active Squad.`);
  return true;
}

function agentArchive(name) {
  const clean = name.trim().replace(/\.md$/i, '');
  const src = path.join(AGENTS_ACTIVE, `${clean}.md`);
  const dest = path.join(AGENTS_ARCHIVE, `${clean}.md`);

  if (!fs.existsSync(src)) {
    console.error(`Agent "${clean}" not found in active agents (${AGENTS_ACTIVE}).`);
    return false;
  }
  if (fs.existsSync(dest)) {
    fs.unlinkSync(dest);
  }

  fs.renameSync(src, dest);
  console.log(`[ARCHIVED] Agent "${clean}" -> Moved to On-Demand Agents Archive.`);
  return true;
}

function cmdStatus() {
  const activeSkills = getDirs(SKILLS_ACTIVE);
  const archivedSkills = getDirs(SKILLS_ARCHIVE);
  const activeAgents = getFiles(AGENTS_ACTIVE);
  const archivedAgents = getFiles(AGENTS_ARCHIVE);

  console.log(`\n=== Antigravity Tiered Governance Status ===\n`);
  console.log(`Skills: ${activeSkills.length} Active (Tier 1) | ${archivedSkills.length} Archived (Tier 2)`);
  console.log(`Agents: ${activeAgents.length} Active Squad     | ${archivedAgents.length} Archived On-Demand`);

  console.log(`\n--- Active Skills (${activeSkills.length}) ---`);
  console.log(activeSkills.join(', ') || 'None');

  console.log(`\n--- Active Agents Squad (${activeAgents.length}) ---`);
  console.log(activeAgents.join(', ') || 'None');

  console.log(`\n--- Archived Specialty Agents (${archivedAgents.length}) ---`);
  console.log(archivedAgents.join(', ') || 'None');
  console.log('');
}

// Recommended Tier 1 Core Skills List
const TIER1_SKILLS = new Set([
  // Core Architecture & Engineering
  'clean-code-fullstack',
  'typescript-pro',
  'powershell-windows-patterns',
  'karpathy-guidelines',
  'codebase-design',
  'api-contract-design',
  'tdd',
  'sql-optimization',
  // Frontend & Craft
  'shadcn-ui',
  'impeccable',
  'anti-slop',
  'design-system',
  'frontend-api-integration',
  // Data Engineering & Ingestion
  'agent-reach',
  'domain-modeling',
  // Quality & Testing
  'qa-skills',
  'playwright-cli',
  'diagnosing-bugs',
  'eval-harness',
  'click-path-logic-auditor',
  // Security
  'security-audit',
  'ai-infra-guard',
  '1password-cli',
  'setup-pre-commit',
  'code-review',
  // System Resilience & Governance (Antigravity Core)
  'file-rewind',
  'persistent-shell',
  'task-dag',
  'workspace-indexer',
  'skill-telemetry',
  'spec-driven-development',
  'agent-judge',
  'anti-yes-man',
  'response-quality',
  'find-skills',
  'skill-creator'
]);

// Tri-Role Core Squad List
const TIER1_AGENTS = new Set([
  'fullstack-developer',
  'qa-engineer',
  'data-engineer'
]);

function cmdOptimizeAll() {
  console.log('\n>>> Executing Tiered Optimization: Archiving non-core skills & specialty agents...\n');

  // 1. Optimize Skills
  const currentSkills = getDirs(SKILLS_ACTIVE);
  let skillsArchivedCount = 0;

  for (const s of currentSkills) {
    if (!TIER1_SKILLS.has(s.toLowerCase())) {
      skillArchive(s);
      skillsArchivedCount++;
    }
  }

  // 2. Optimize Agents
  const currentAgents = getFiles(AGENTS_ACTIVE);
  let agentsArchivedCount = 0;

  for (const a of currentAgents) {
    if (!TIER1_AGENTS.has(a.toLowerCase())) {
      agentArchive(a);
      agentsArchivedCount++;
    }
  }

  console.log(`\n>>> Optimization Complete!`);
  console.log(`Archived ${skillsArchivedCount} specialty skills and ${agentsArchivedCount} specialty agents.`);
  cmdStatus();
}

// CLI router
const args = process.argv.slice(2);
const cmd = args[0] || 'status';

switch (cmd) {
  case 'status':
    cmdStatus();
    break;
  case 'skill-activate':
    if (!args[1]) { console.error('Usage: skill-activate <name>'); process.exit(1); }
    skillActivate(args[1]);
    break;
  case 'skill-archive':
    if (!args[1]) { console.error('Usage: skill-archive <name>'); process.exit(1); }
    skillArchive(args[1]);
    break;
  case 'agent-activate':
    if (!args[1]) { console.error('Usage: agent-activate <name>'); process.exit(1); }
    agentActivate(args[1]);
    break;
  case 'agent-archive':
    if (!args[1]) { console.error('Usage: agent-archive <name>'); process.exit(1); }
    agentArchive(args[1]);
    break;
  case 'optimize-all':
    cmdOptimizeAll();
    break;
  default:
    console.log('Commands: status, skill-activate <name>, skill-archive <name>, agent-activate <name>, agent-archive <name>, optimize-all');
}
