/**
 * Memory Trimmer & Context Diet Engine (Antigravity 2.0)
 *
 * Inspired by yu-xiao-sheng/codex-memory-trim:
 * 1. Audits memory stores (skill-usage.json, mad-rsi-failures.json, VIOLATIONS_LEDGER.md).
 * 2. Prunes dead/archived skill telemetry and stale references.
 * 3. Deduplicates failure trajectories and compresses memory representations.
 * 4. Eliminates context pollution and reduces permanent token footprint.
 *
 * Zero external dependencies (Pure Node.js standard library).
 */

const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.join(process.env.USERPROFILE || 'C:\\Users\\Luthfi', '.gemini', 'config');
const SKILLS_DIR = path.join(CONFIG_DIR, 'skills');
const BUILTIN_SKILLS_DIR = path.join(process.env.USERPROFILE || 'C:\\Users\\Luthfi', '.gemini', 'antigravity', 'builtin', 'skills');

const USAGE_PATH = path.join(CONFIG_DIR, 'skill-usage.json');
const FAILURES_PATH = path.join(CONFIG_DIR, 'mad-rsi-failures.json');
const VIOLATIONS_PATH = path.join(CONFIG_DIR, 'VIOLATIONS_LEDGER.md');

function printHelp() {
  console.log(`
Memory Trimmer & Context Diet CLI:
  node memory-trimmer.js audit
      Audits all memory stores for dead entries, duplicates, stale context, and token bloat.

  node memory-trimmer.js trim [--dry-run]
      Prunes dead skill telemetry, deduplicates failure records, and compresses memory stores.

  node memory-trimmer.js status
      Displays a compact summary of active memory footprints.
`);
}

function getExistingSkillNames() {
  const skills = new Set();
  if (fs.existsSync(SKILLS_DIR)) {
    fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .forEach(d => skills.add(d.name));
  }
  if (fs.existsSync(BUILTIN_SKILLS_DIR)) {
    fs.readdirSync(BUILTIN_SKILLS_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .forEach(d => skills.add(d.name));
  }
  return skills;
}

/**
 * 1. AUDIT: Analyzes memory stores for bloat, dead entries, and duplicates
 */
function auditMemory() {
  const existingSkills = getExistingSkillNames();
  const report = {
    timestamp: new Date().toISOString(),
    stores: {}
  };

  // Audit skill-usage.json
  if (fs.existsSync(USAGE_PATH)) {
    try {
      const usage = JSON.parse(fs.readFileSync(USAGE_PATH, 'utf8'));
      const allKeys = Object.keys(usage);
      const deadKeys = allKeys.filter(k => !existingSkills.has(k));

      report.stores['skill-usage.json'] = {
        sizeBytes: fs.statSync(USAGE_PATH).size,
        totalEntries: allKeys.length,
        deadEntries: deadKeys.length,
        deadKeys: deadKeys,
        status: deadKeys.length > 0 ? 'NEEDS_TRIM' : 'CLEAN'
      };
    } catch (e) {
      report.stores['skill-usage.json'] = { error: e.message };
    }
  }

  // Audit mad-rsi-failures.json
  if (fs.existsSync(FAILURES_PATH)) {
    try {
      const failures = JSON.parse(fs.readFileSync(FAILURES_PATH, 'utf8'));
      const seen = new Set();
      let duplicates = 0;

      failures.forEach(f => {
        const key = `${f.model}::${f.error}`;
        if (seen.has(key)) {
          duplicates++;
        } else {
          seen.add(key);
        }
      });

      report.stores['mad-rsi-failures.json'] = {
        sizeBytes: fs.statSync(FAILURES_PATH).size,
        totalEntries: failures.length,
        uniqueSignatures: seen.size,
        duplicates: duplicates,
        status: duplicates > 0 ? 'NEEDS_TRIM' : 'CLEAN'
      };
    } catch (e) {
      report.stores['mad-rsi-failures.json'] = { error: e.message };
    }
  }

  // Audit VIOLATIONS_LEDGER.md
  if (fs.existsSync(VIOLATIONS_PATH)) {
    const raw = fs.readFileSync(VIOLATIONS_PATH, 'utf8');
    const lines = raw.split(/\r?\n/);
    const violations = (raw.match(/### \[VIO-[^\]]+\]/g) || []).length;

    report.stores['VIOLATIONS_LEDGER.md'] = {
      sizeBytes: fs.statSync(VIOLATIONS_PATH).size,
      totalLines: lines.length,
      violationsCount: violations,
      status: lines.length > 300 ? 'CONSIDER_ARCHIVE' : 'CLEAN'
    };
  }

  console.log('\n=== [MEMORY TRIMMER AUDIT REPORT] ===');
  console.log(JSON.stringify(report, null, 2));
  return report;
}

/**
 * 2. TRIM: Safely prunes dead entries, deduplicates, and saves backups
 */
function trimMemory(dryRun = false) {
  console.log(`\n=== [MEMORY TRIMMER EXECUTION${dryRun ? ' (DRY RUN)' : ''}] ===`);
  const existingSkills = getExistingSkillNames();
  let totalSavedBytes = 0;

  // Trim skill-usage.json
  if (fs.existsSync(USAGE_PATH)) {
    const raw = fs.readFileSync(USAGE_PATH, 'utf8');
    const initialSize = Buffer.byteLength(raw, 'utf8');
    const usage = JSON.parse(raw);
    const cleanedUsage = {};
    let prunedCount = 0;

    Object.entries(usage).forEach(([key, val]) => {
      if (existingSkills.has(key)) {
        cleanedUsage[key] = val;
      } else {
        prunedCount++;
      }
    });

    const newRaw = JSON.stringify(cleanedUsage, null, 2);
    const newSize = Buffer.byteLength(newRaw, 'utf8');
    const delta = initialSize - newSize;
    totalSavedBytes += Math.max(0, delta);

    console.log(`\n[skill-usage.json]:`);
    console.log(`  - Pruned Dead Skills: ${prunedCount}`);
    console.log(`  - Retained Active:    ${Object.keys(cleanedUsage).length}`);
    console.log(`  - Size Reduction:     ${delta > 0 ? `-${delta} bytes` : '0 bytes'}`);

    if (!dryRun && prunedCount > 0) {
      fs.writeFileSync(`${USAGE_PATH}.bak`, raw, 'utf8');
      fs.writeFileSync(USAGE_PATH, newRaw, 'utf8');
      console.log(`  ✅ Backup created and pruned store updated.`);
    }
  }

  // Trim mad-rsi-failures.json
  if (fs.existsSync(FAILURES_PATH)) {
    const raw = fs.readFileSync(FAILURES_PATH, 'utf8');
    const initialSize = Buffer.byteLength(raw, 'utf8');
    const failures = JSON.parse(raw);

    // Group by signature and retain the latest 5 instances per error
    const map = new Map();
    failures.forEach(f => {
      const sig = `${f.model}::${f.error}`;
      if (!map.has(sig)) {
        map.set(sig, []);
      }
      map.get(sig).push(f);
    });

    const deduplicated = [];
    let trimmedEntries = 0;

    map.forEach(entries => {
      // Sort newest first
      entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const capped = entries.slice(0, 5); // Keep max 5 latest occurrences
      trimmedEntries += (entries.length - capped.length);
      deduplicated.push(...capped);
    });

    const newRaw = JSON.stringify(deduplicated, null, 2);
    const newSize = Buffer.byteLength(newRaw, 'utf8');
    const delta = initialSize - newSize;
    totalSavedBytes += Math.max(0, delta);

    console.log(`\n[mad-rsi-failures.json]:`);
    console.log(`  - Deduplicated/Capped: ${trimmedEntries} excess records removed`);
    console.log(`  - High-Density Pool:   ${deduplicated.length} active records`);
    console.log(`  - Size Reduction:      ${delta > 0 ? `-${delta} bytes` : '0 bytes'}`);

    if (!dryRun && trimmedEntries > 0) {
      fs.writeFileSync(`${FAILURES_PATH}.bak`, raw, 'utf8');
      fs.writeFileSync(FAILURES_PATH, newRaw, 'utf8');
      console.log(`  ✅ Backup created and failure pool compacted.`);
    }
  }

  console.log(`\n🎉 Total Memory Diet Savings: ~${totalSavedBytes} bytes (~${Math.round(totalSavedBytes / 4)} tokens saved per inspection).`);
}

/**
 * 3. STATUS: Compact health overview
 */
function showStatus() {
  const audit = auditMemory();
  console.log('\n=== [MEMORY HEALTH SUMMARY] ===');
  Object.entries(audit.stores).forEach(([store, info]) => {
    const statusIcon = info.status === 'CLEAN' ? '✅' : '⚠️';
    console.log(`${statusIcon} ${store.padEnd(25)}: ${info.sizeBytes || 0} bytes | Status: ${info.status}`);
  });
}

// CLI Dispatcher
const rawArgs = process.argv.slice(2);
const command = rawArgs[0];

if (!command || command === '--help' || command === '-h') {
  printHelp();
  process.exit(0);
}

if (command === 'audit') {
  auditMemory();
} else if (command === 'trim') {
  const dryRun = rawArgs.includes('--dry-run');
  trimMemory(dryRun);
} else if (command === 'status') {
  showStatus();
} else {
  console.error(`Unknown command: ${command}`);
  printHelp();
  process.exit(1);
}
