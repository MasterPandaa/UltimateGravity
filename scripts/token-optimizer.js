#!/usr/bin/env node

/**
 * Startup Token Optimizer & Context Diet Engine (Antigravity 2.0)
 *
 * Inspired by nadimtuhin/claude-token-optimizer:
 * 1. Measures startup token tax (Turn 0 payload: GEMINI.md, rules, skills index, MCP schemas).
 * 2. Audits monolithic instruction bloat, procedural anti-patterns, and oversized skill frontmatters.
 * 3. Enforces Progressive Disclosure (invariants in root rules, deep SOPs in on-demand skills).
 * 4. Simulates and verifies token savings across sessions.
 *
 * Zero external dependencies (Pure Node.js standard library).
 */

const fs = require('fs');
const path = require('path');

const USER_HOME = process.env.USERPROFILE || 'C:\\Users\\Luthfi';
const GEMINI_HOME = path.join(USER_HOME, '.gemini');
const GLOBAL_GEMINI_MD = path.join(GEMINI_HOME, 'GEMINI.md');
const CONFIG_DIR = path.join(GEMINI_HOME, 'config');
const SKILLS_DIR = path.join(CONFIG_DIR, 'skills');
const BUILTIN_SKILLS_DIR = path.join(GEMINI_HOME, 'antigravity', 'builtin', 'skills');
const PLUGINS_DIR = path.join(CONFIG_DIR, 'plugins');

/**
 * Fast & accurate token estimator for mixed Markdown/Code.
 * Uses empirical Gemini/Claude BPE character-to-token ratios:
 * - Prose & Markdown headers: ~3.8 chars/token
 * - Code fences & structured JSON: ~3.2 chars/token
 */
function estimateTokens(text) {
  if (!text || typeof text !== 'string') return 0;
  
  let codeChars = 0;
  let proseChars = 0;
  let inCodeBlock = false;

  const lines = text.split('\n');
  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      codeChars += line.length + 1;
      continue;
    }
    if (inCodeBlock) {
      codeChars += line.length + 1;
    } else {
      proseChars += line.length + 1;
    }
  }

  const codeTokens = Math.ceil(codeChars / 3.2);
  const proseTokens = Math.ceil(proseChars / 3.8);
  return codeTokens + proseTokens;
}

function printHelp() {
  console.log(`
Antigravity Startup Token Optimizer CLI:
  node token-optimizer.js measure [targetDir]
      Measures startup token overhead across GEMINI.md, rules, skills metadata, and MCPs.

  node token-optimizer.js audit [filePath|targetDir]
      Lints instruction files for monolithic bloat, procedural slop, and oversized skill descriptions.

  node token-optimizer.js simulate <filePath>
      Simulates token savings by extracting procedural SOPs into on-demand progressive skills.

  node token-optimizer.js scaffold <skill-name>
      Generates an ultra-lean on-demand SKILL.md template adhering to L0 <= 60 lines.
`);
}

/**
 * Scans all active skills and calculates the system prompt overhead
 * injected via the <skills> block (name + description).
 */
function measureSkillsCatalog() {
  const skills = [];
  const scanDirs = [
    { root: SKILLS_DIR, type: 'Global' },
    { root: BUILTIN_SKILLS_DIR, type: 'Builtin' }
  ];

  // Scan plugins if any
  if (fs.existsSync(PLUGINS_DIR)) {
    try {
      const plugins = fs.readdirSync(PLUGINS_DIR, { withFileTypes: true });
      for (const p of plugins) {
        if (p.isDirectory()) {
          const pSkillDir = path.join(PLUGINS_DIR, p.name, 'skills');
          if (fs.existsSync(pSkillDir)) {
            scanDirs.push({ root: pSkillDir, type: `Plugin:${p.name}` });
          }
        }
      }
    } catch (_) {}
  }

  for (const { root, type } of scanDirs) {
    if (!fs.existsSync(root)) continue;
    const entries = fs.readdirSync(root, { withFileTypes: true });
    for (const ent of entries) {
      if (!ent.isDirectory()) continue;
      const skillFile = path.join(root, ent.name, 'SKILL.md');
      if (fs.existsSync(skillFile)) {
        try {
          const content = fs.readFileSync(skillFile, 'utf8');
          // Extract frontmatter
          const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
          let desc = '';
          if (match) {
            const descMatch = match[1].match(/description:\s*(?:>|\|)?\s*([^\r\n]+(?:\r?\n\s+[^\r\n]+)*)/);
            if (descMatch) {
              desc = descMatch[1].replace(/\r?\n\s+/g, ' ').trim();
            }
          }
          const promptRepresentation = `- ${ent.name} (${skillFile}): ${desc}\n`;
          const tokens = estimateTokens(promptRepresentation);
          skills.push({
            name: ent.name,
            type,
            path: skillFile,
            descLength: desc.length,
            tokens,
            promptRepresentation
          });
        } catch (_) {}
      }
    }
  }

  return skills;
}

/**
 * 1. MEASURE: Full startup tax breakdown
 */
function measureStartupTokens(targetDir) {
  const wsDir = targetDir ? path.resolve(targetDir) : process.cwd();
  console.log(`\n======================================================================`);
  console.log(` 📊 ANTIGRAVITY STARTUP TOKEN OVERHEAD AUDIT`);
  console.log(` Target Workspace: ${wsDir}`);
  console.log(`======================================================================\n`);

  const breakdown = [];
  let totalTokens = 0;

  // 1. Global GEMINI.md
  if (fs.existsSync(GLOBAL_GEMINI_MD)) {
    const content = fs.readFileSync(GLOBAL_GEMINI_MD, 'utf8');
    const lines = content.split('\n').length;
    const tokens = estimateTokens(content);
    totalTokens += tokens;
    breakdown.push({
      component: 'Global Rules (GEMINI.md)',
      path: GLOBAL_GEMINI_MD,
      lines,
      bytes: Buffer.byteLength(content, 'utf8'),
      tokens,
      status: tokens > 3500 ? '[BLOAT]' : tokens > 2000 ? '[WARN]' : '[OPTIMAL]'
    });
  }

  // 2. Workspace Rules (GEMINI.md / CLAUDE.md / .agents/rules)
  const wsFiles = [
    path.join(wsDir, 'GEMINI.md'),
    path.join(wsDir, 'CLAUDE.md'),
    path.join(wsDir, 'AGENTS.md')
  ];

  for (const wf of wsFiles) {
    if (fs.existsSync(wf) && wf !== GLOBAL_GEMINI_MD) {
      const content = fs.readFileSync(wf, 'utf8');
      const lines = content.split('\n').length;
      const tokens = estimateTokens(content);
      totalTokens += tokens;
      breakdown.push({
        component: `Workspace Rule (${path.basename(wf)})`,
        path: wf,
        lines,
        bytes: Buffer.byteLength(content, 'utf8'),
        tokens,
        status: tokens > 1500 ? '[BLOAT]' : tokens > 800 ? '[WARN]' : '[OPTIMAL]'
      });
    }
  }

  // Check .agents/rules/*.md
  const agentsRulesDir = path.join(wsDir, '.agents', 'rules');
  if (fs.existsSync(agentsRulesDir)) {
    const rFiles = fs.readdirSync(agentsRulesDir).filter(f => f.endsWith('.md'));
    for (const rf of rFiles) {
      const fullP = path.join(agentsRulesDir, rf);
      const content = fs.readFileSync(fullP, 'utf8');
      const lines = content.split('\n').length;
      const tokens = estimateTokens(content);
      totalTokens += tokens;
      breakdown.push({
        component: `Modular Rule (.agents/rules/${rf})`,
        path: fullP,
        lines,
        bytes: Buffer.byteLength(content, 'utf8'),
        tokens,
        status: tokens > 600 ? '[BLOAT]' : tokens > 300 ? '[WARN]' : '[OPTIMAL]'
      });
    }
  }

  // 3. Skills Catalog Metadata Injected into System Prompt
  const skills = measureSkillsCatalog();
  const skillsTokens = skills.reduce((acc, s) => acc + s.tokens, 0);
  totalTokens += skillsTokens;
  breakdown.push({
    component: `Skills Catalog Index (${skills.length} skills injected into prompt)`,
    path: `Multiple (${SKILLS_DIR})`,
    lines: skills.length,
    bytes: skills.reduce((acc, s) => acc + Buffer.byteLength(s.promptRepresentation, 'utf8'), 0),
    tokens: skillsTokens,
    status: skillsTokens > 2500 ? '[BLOAT]' : skillsTokens > 1500 ? '[WARN]' : '[OPTIMAL]'
  });

  // Print Table
  console.log(`| Component | Lines | Chars/Bytes | Est. Tokens | Status |`);
  console.log(`| :--- | :---: | :---: | :---: | :---: |`);
  for (const b of breakdown) {
    console.log(`| ${b.component} | ${b.lines} | ${b.bytes} B | ~${b.tokens.toLocaleString()} | ${b.status} |`);
  }
  console.log(`| -------------------------------- | ----- | ----------- | ----------- | --------- |`);
  console.log(`| **TOTAL TURN-0 STARTUP PAYLOAD** | - | - | **~${totalTokens.toLocaleString()} tokens** | ${totalTokens > 8000 ? '🚨 HIGH BLOAT' : totalTokens > 5000 ? '⚠️ MODERATE' : '✅ HEALTHY LEAN'} |\n`);

  // Comparative Cost & Session Analysis
  console.log(`💡 Session Overhead Analysis:`);
  console.log(` - Single Turn Overhead: ~${totalTokens.toLocaleString()} tokens`);
  console.log(` - 20-Turn Conversation Startup Tax: ~${(totalTokens * 20).toLocaleString()} tokens loaded across turns`);
  console.log(` - Unoptimized Monolithic Baseline (e.g. 11k Claude.md): ~11,000 tokens/turn`);
  if (totalTokens < 11000) {
    const savings = 11000 - totalTokens;
    const pct = Math.round((savings / 11000) * 100);
    console.log(` - Progressive Disclosure Savings: ~${savings.toLocaleString()} tokens saved per turn (${pct}% reduction)`);
  }
  console.log(`======================================================================\n`);
}

/**
 * 2. AUDIT: Deep linting of rule files and skill frontmatter
 */
function auditInstructions(targetPath) {
  const target = targetPath ? path.resolve(targetPath) : GLOBAL_GEMINI_MD;
  console.log(`\n======================================================================`);
  console.log(` 🔍 AUDIT & LINT: INSTRUCTION TOKEN HYGIENE`);
  console.log(` Target: ${target}`);
  console.log(`======================================================================\n`);

  const issues = [];

  function checkFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const tokens = estimateTokens(content);
    const relName = path.relative(GEMINI_HOME, filePath);

    // Rule 1: Monolithic line budget
    if (lines.length > 250) {
      issues.push({
        severity: 'HIGH',
        file: relName,
        msg: `File has ${lines.length} lines (~${tokens} tokens). Violates soft budget (<= 150-200 lines). Risk of attention dilution.`
      });
    } else if (lines.length > 150) {
      issues.push({
        severity: 'MEDIUM',
        file: relName,
        msg: `File has ${lines.length} lines. Approaching upper soft threshold (150 lines).`
      });
    }

    // Rule 2: Large code fences inside rule file
    let inFence = false;
    let fenceStart = 0;
    let fenceContent = [];
    lines.forEach((l, idx) => {
      if (l.trim().startsWith('```')) {
        if (!inFence) {
          inFence = true;
          fenceStart = idx + 1;
          fenceContent = [];
        } else {
          inFence = false;
          if (fenceContent.length > 20) {
            issues.push({
              severity: 'HIGH',
              file: `${relName}:${fenceStart}`,
              msg: `Procedural code fence of ${fenceContent.length} lines embedded in rule file. Monolithic anti-pattern: Move code examples to a dedicated SKILL.md!`
            });
          }
        }
      } else if (inFence) {
        fenceContent.push(l);
      }
    });

    // Rule 3: ASCII / Markdown tables > 25 lines
    let tableLines = 0;
    let tableStart = 0;
    lines.forEach((l, idx) => {
      if (l.trim().startsWith('|') && l.trim().endsWith('|')) {
        if (tableLines === 0) tableStart = idx + 1;
        tableLines++;
      } else {
        if (tableLines > 25) {
          issues.push({
            severity: 'MEDIUM',
            file: `${relName}:${tableStart}`,
            msg: `Large table (${tableLines} lines) consumes high token density. Consider moving to reference doc.`
          });
        }
        tableLines = 0;
      }
    });
  }

  // Check target or default
  if (fs.statSync(target).isDirectory()) {
    const files = fs.readdirSync(target, { withFileTypes: true });
    for (const f of files) {
      if (f.isFile() && f.name.endsWith('.md')) {
        checkFile(path.join(target, f.name));
      }
    }
  } else {
    checkFile(target);
  }

  // Audit Skill Frontmatter Descriptions (> 400 chars)
  const skills = measureSkillsCatalog();
  skills.forEach(s => {
    if (s.descLength > 400) {
      issues.push({
        severity: 'MEDIUM',
        file: `Skill: ${s.name} (${s.path})`,
        msg: `YAML frontmatter description is ${s.descLength} characters (> 400 chars). Inflates system prompt on every turn!`
      });
    }
  });

  // Report
  if (issues.length === 0) {
    console.log(`✅ EXCELLENT: No instruction bloat or procedural anti-patterns detected!`);
    console.log(`All files respect Progressive Disclosure and token budget constraints.\n`);
  } else {
    console.log(`⚠️ FOUND ${issues.length} TOKEN HYGIENE ISSUES:\n`);
    issues.forEach((iss, i) => {
      const badge = iss.severity === 'HIGH' ? '🔴 [CRITICAL]' : '🟡 [WARNING]';
      console.log(`${i + 1}. ${badge} ${iss.file}`);
      console.log(`   ${iss.msg}\n`);
    });
  }
  console.log(`======================================================================\n`);
}

/**
 * 3. SIMULATE: Demonstrates token reduction from progressive disclosure
 */
function simulateSavings(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const origTokens = estimateTokens(content);

  // Progressive disclosure simulation: retain headers + first 2 lines of each section + pointers
  let optimizedLines = [];
  let inCode = false;

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue; // Offload code blocks to skill
    if (line.trim().startsWith('#') || line.trim().startsWith('-') || line.trim().startsWith('>')) {
      optimizedLines.push(line);
    }
  }

  const optimizedContent = optimizedLines.join('\n');
  const optTokens = estimateTokens(optimizedContent);
  const diff = origTokens - optTokens;
  const pct = Math.round((diff / origTokens) * 100);

  console.log(`\n======================================================================`);
  console.log(` 📉 PROGRESSIVE DISCLOSURE SIMULATION`);
  console.log(` Target: ${filePath}`);
  console.log(`======================================================================`);
  console.log(` - Original Payload:     ${lines.length} lines | ~${origTokens.toLocaleString()} tokens`);
  console.log(` - Optimized Invariants: ${optimizedLines.length} lines | ~${optTokens.toLocaleString()} tokens`);
  console.log(` - Offloaded to Skills:   ~${diff.toLocaleString()} tokens (${pct}% reduction)`);
  console.log(` - Estimated 50-Turn Savings: ~${(diff * 50).toLocaleString()} tokens`);
  console.log(`======================================================================\n`);
}

/**
 * 4. SCAFFOLD: Generates an ultra-lean on-demand SKILL.md template
 */
function scaffoldSkill(skillName) {
  if (!skillName) {
    console.error('Error: Skill name is required.');
    process.exit(1);
  }

  const targetDir = path.join(SKILLS_DIR, skillName);
  if (fs.existsSync(targetDir)) {
    console.error(`Error: Skill directory already exists: ${targetDir}`);
    process.exit(1);
  }

  fs.mkdirSync(targetDir, { recursive: true });
  const skillFile = path.join(targetDir, 'SKILL.md');

  const template = `---
name: ${skillName}
description: "[Brief Domain Tag] High-precision procedural instructions for ${skillName} (< 400 chars)."
---

# ${skillName.toUpperCase()} — Operational Procedure

> Invariant: This skill is loaded on-demand only when triggered. Zero startup token tax.

## 1. Quick Start / Standard Procedure
1. Step 1: Specific deterministic action.
2. Step 2: Verification seam.
3. Step 3: Confirmation and evidence check.

## 2. Command Reference
\`\`\`powershell
# Clean native command execution
npm test
\`\`\`

## 3. Boundary & Error Conditions
- Check input types and contracts before mutation.
- Verify return code == 0 before claiming success.
`;

  fs.writeFileSync(skillFile, template, 'utf8');
  const tokens = estimateTokens(template);
  const lines = template.split('\n').length;

  console.log(`\n✅ Created on-demand skill at: ${skillFile}`);
  console.log(` - Lines: ${lines} (adheres to L0 <= 60 lines)`);
  console.log(` - Token Footprint: ~${tokens} tokens (only consumed when active!)\n`);
}

// CLI Dispatcher
const args = process.argv.slice(2);
const command = args[0] || 'help';

switch (command) {
  case 'measure':
  case 'status':
    measureStartupTokens(args[1]);
    break;
  case 'audit':
  case 'lint':
    auditInstructions(args[1]);
    break;
  case 'simulate':
    simulateSavings(args[1]);
    break;
  case 'scaffold':
    scaffoldSkill(args[1]);
    break;
  case 'help':
  default:
    printHelp();
    break;
}
