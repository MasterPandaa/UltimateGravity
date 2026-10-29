#!/usr/bin/env node

/**
 * Antigravity Skill Telemetry & Usage Heatmap
 * Tracks skill invocations, identifies dead skills, and generates usage metrics.
 *
 * Usage:
 *   node skill-telemetry.js list
 *   node skill-telemetry.js heatmap
 *   node skill-telemetry.js prune-candidates
 *   node skill-telemetry.js record <skillName>
 *   node skill-telemetry.js reset
 */

const fs = require('fs');
const path = require('path');

const TELEMETRY_FILE = 'C:\\Users\\Luthfi\\.gemini\\config\\skill-usage.json';
const SKILLS_DIR = 'C:\\Users\\Luthfi\\.gemini\\config\\skills';

function loadUsage() {
  if (!fs.existsSync(TELEMETRY_FILE)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(TELEMETRY_FILE, 'utf8'));
  } catch (e) {
    return {};
  }
}

function saveUsage(data) {
  const dir = path.dirname(TELEMETRY_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(TELEMETRY_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function recordSkillUsage(skillName) {
  if (!skillName) return;
  const cleanName = skillName.trim().toLowerCase();
  const data = loadUsage();

  const now = new Date().toISOString();
  if (!data[cleanName]) {
    data[cleanName] = {
      usageCount: 1,
      firstUsedAt: now,
      lastUsedAt: now
    };
  } else {
    data[cleanName].usageCount = (data[cleanName].usageCount || 0) + 1;
    data[cleanName].lastUsedAt = now;
  }

  saveUsage(data);
}

function getAllInstalledSkills() {
  if (!fs.existsSync(SKILLS_DIR)) return [];
  return fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory() && fs.existsSync(path.join(SKILLS_DIR, d.name, 'SKILL.md')))
    .map(d => d.name);
}

function cmdList() {
  const data = loadUsage();
  const installed = getAllInstalledSkills();
  const entries = [];

  for (const skill of installed) {
    const stat = data[skill.toLowerCase()] || { usageCount: 0, lastUsedAt: null };
    entries.push({
      name: skill,
      count: stat.usageCount,
      lastUsed: stat.lastUsedAt ? new Date(stat.lastUsedAt) : null
    });
  }

  entries.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  console.log(`\n=== Antigravity Skill Telemetry & Usage Heatmap ===\n`);
  console.log(`Total Installed Skills: ${installed.length} | Tracked Active: ${Object.keys(data).length}\n`);

  console.log('Rank'.padEnd(6) + 'Skill Name'.padEnd(35) + 'Uses'.padEnd(10) + 'Status'.padEnd(12) + 'Last Used');
  console.log('-'.repeat(80));

  entries.forEach((e, idx) => {
    let status = 'DORMANT';
    if (e.count >= 10) status = 'VERY HOT';
    else if (e.count >= 5) status = 'HOT';
    else if (e.count >= 1) status = 'ACTIVE';

    const lastUsedStr = e.lastUsed ? e.lastUsed.toLocaleString() : 'Never';
    console.log(
      `#${idx + 1}`.padEnd(6) +
      e.name.padEnd(35) +
      `${e.count}`.padEnd(10) +
      `[${status}]`.padEnd(12) +
      lastUsedStr
    );
  });
  console.log('');
}

function cmdHeatmap() {
  const data = loadUsage();
  const sorted = Object.entries(data).sort((a, b) => b[1].usageCount - a[1].usageCount).slice(0, 15);

  if (sorted.length === 0) {
    console.log('No usage data recorded yet.');
    return;
  }

  const maxVal = sorted[0][1].usageCount || 1;
  const BAR_MAX = 30;

  console.log(`\n=== Top 15 Most Active Skills ===\n`);
  for (const [name, stat] of sorted) {
    const barLen = Math.max(1, Math.round((stat.usageCount / maxVal) * BAR_MAX));
    const bar = '■'.repeat(barLen);
    console.log(`${name.padEnd(30)} | ${bar} (${stat.usageCount})`);
  }
  console.log('');
}

function cmdPruneCandidates(daysThreshold = 30) {
  const data = loadUsage();
  const installed = getAllInstalledSkills();
  const now = Date.now();
  const thresholdMs = daysThreshold * 24 * 60 * 60 * 1000;

  const unused = [];
  const stale = [];

  for (const skill of installed) {
    const stat = data[skill.toLowerCase()];
    if (!stat || stat.usageCount === 0) {
      unused.push(skill);
    } else if (stat.lastUsedAt && (now - new Date(stat.lastUsedAt).getTime() > thresholdMs)) {
      stale.push({ name: skill, count: stat.usageCount, lastUsedAt: stat.lastUsedAt });
    }
  }

  console.log(`\n=== Skill Pruning Candidates (Context Optimization) ===\n`);
  console.log(`Never Used (${unused.length} skills):`);
  if (unused.length === 0) {
    console.log('  None! All skills have been invoked at least once.');
  } else {
    for (const u of unused) console.log(`  - ${u}`);
  }

  if (stale.length > 0) {
    console.log(`\nInactive > ${daysThreshold} Days (${stale.length} skills):`);
    for (const s of stale) {
      console.log(`  - ${s.name} (${s.count} past uses, last: ${s.lastUsedAt})`);
    }
  }
  console.log('\nPruning dormant skills reduces catalog token weight.\n');
}

// CLI Handling
if (require.main === module) {
  const args = process.argv.slice(2);
  const cmd = args[0] || 'list';

  switch (cmd) {
    case 'list':
    case 'status':
      cmdList();
      break;
    case 'heatmap':
      cmdHeatmap();
      break;
    case 'prune-candidates':
      cmdPruneCandidates(args[1] ? parseInt(args[1], 10) : 30);
      break;
    case 'record':
      if (!args[1]) { console.error('Usage: record <skillName>'); process.exit(1); }
      recordSkillUsage(args[1]);
      console.log("Recorded usage for: " + args[1]);
      break;
    case 'reset':
      saveUsage({});
      console.log('Skill telemetry reset to empty.');
      break;
    default:
      console.log('Commands: list, heatmap, prune-candidates, record <skillName>, reset');
  }
}

module.exports = { recordSkillUsage, loadUsage };

