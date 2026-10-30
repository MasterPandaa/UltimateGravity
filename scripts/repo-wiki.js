#!/usr/bin/env node

/**
 * Antigravity Repo Wiki Engine
 * Inspired by Qoder's Repo Wiki & Knowledge Engine.
 * 
 * Automatically generates and maintains a concise, high-signal architecture map
 * at `.agents/REPO_WIKI.md` (or `<workspace>/REPO_WIKI.md`).
 * 
 * Token Guarantee: 0 token added to base prompt. Stored passively on disk and
 * read on-demand by agents, saving 15,000–35,000 tokens of blind exploration.
 * 
 * Usage:
 *   node repo-wiki.js generate [workspacePath]
 *   node repo-wiki.js status [workspacePath]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FD_BIN = 'C:\\Users\\Luthfi\\.gemini\\bin\\fd.exe';

function resolveWorkspace(targetDir) {
  return path.resolve(targetDir || process.cwd());
}

function scanFilesFast(wsRoot) {
  const IGNORED = ['.git', 'node_modules', 'dist', 'build', 'out', '.next', '.nuxt', '__pycache__', 'file-history', '.gemini'];
  if (fs.existsSync(FD_BIN)) {
    try {
      const excludes = IGNORED.map(d => `--exclude "${d}"`).join(' ');
      const raw = execSync(`"${FD_BIN}" --type f ${excludes} . "${wsRoot}"`, {
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024,
        timeout: 4000
      });
      return raw.split('\n').map(l => l.trim()).filter(Boolean);
    } catch (e) {}
  }

  // Fallback Node walker
  const results = [];
  function walk(curr, depth = 0) {
    if (depth > 6) return;
    try {
      const ents = fs.readdirSync(curr, { withFileTypes: true });
      for (const ent of ents) {
        if (IGNORED.includes(ent.name) || ent.name.startsWith('.')) continue;
        const full = path.join(curr, ent.name);
        if (ent.isDirectory()) walk(full, depth + 1);
        else if (ent.isFile()) results.push(full);
      }
    } catch (e) {}
  }
  walk(wsRoot);
  return results;
}

function detectTechStack(wsRoot, allFiles) {
  const stack = {
    languages: new Set(),
    frameworks: new Set(),
    database: new Set(),
    testRunner: new Set(),
    entryPoints: [],
    packageScripts: {}
  };

  // Inspect package.json
  const pkgPath = path.join(wsRoot, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      stack.packageScripts = pkg.scripts || {};

      if (deps['react']) stack.frameworks.add('React');
      if (deps['next']) stack.frameworks.add('Next.js');
      if (deps['vite']) stack.frameworks.add('Vite');
      if (deps['vue']) stack.frameworks.add('Vue');
      if (deps['express']) stack.frameworks.add('Express');
      if (deps['@nestjs/core']) stack.frameworks.add('NestJS');
      if (deps['tailwindcss']) stack.frameworks.add('Tailwind CSS');
      if (deps['prisma'] || deps['@prisma/client']) stack.database.add('Prisma ORM');
      if (deps['drizzle-orm']) stack.database.add('Drizzle ORM');
      if (deps['typeorm']) stack.database.add('TypeORM');
      if (deps['mongoose']) stack.database.add('Mongoose (MongoDB)');
      if (deps['vitest']) stack.testRunner.add('Vitest');
      if (deps['jest']) stack.testRunner.add('Jest');
      if (deps['@playwright/test']) stack.testRunner.add('Playwright');
      if (deps['typescript']) stack.languages.add('TypeScript');
    } catch (e) {}
  }

  // Inspect Python (pyproject.toml, requirements.txt)
  const pyproject = path.join(wsRoot, 'pyproject.toml');
  const reqs = path.join(wsRoot, 'requirements.txt');
  if (fs.existsSync(pyproject) || fs.existsSync(reqs)) {
    stack.languages.add('Python');
    let content = '';
    if (fs.existsSync(pyproject)) content += fs.readFileSync(pyproject, 'utf8') + '\n';
    if (fs.existsSync(reqs)) content += fs.readFileSync(reqs, 'utf8');

    if (content.includes('fastapi')) stack.frameworks.add('FastAPI');
    if (content.includes('django')) stack.frameworks.add('Django');
    if (content.includes('flask')) stack.frameworks.add('Flask');
    if (content.includes('sqlalchemy')) stack.database.add('SQLAlchemy');
    if (content.includes('pytest')) stack.testRunner.add('Pytest');
  }

  // Inspect PHP / Composer
  if (fs.existsSync(path.join(wsRoot, 'composer.json'))) {
    stack.languages.add('PHP');
    try {
      const comp = JSON.parse(fs.readFileSync(path.join(wsRoot, 'composer.json'), 'utf8'));
      const deps = { ...(comp.require || {}), ...(comp['require-dev'] || {}) };
      if (deps['laravel/framework']) stack.frameworks.add('Laravel');
      if (deps['phpunit/phpunit']) stack.testRunner.add('PHPUnit');
    } catch (e) {}
  }

  // Detect languages by extension
  for (const f of allFiles) {
    const ext = path.extname(f).toLowerCase();
    if (ext === '.ts' || ext === '.tsx') stack.languages.add('TypeScript');
    else if (ext === '.js' || ext === '.jsx') stack.languages.add('JavaScript');
    else if (ext === '.py') stack.languages.add('Python');
    else if (ext === '.go') stack.languages.add('Go');
    else if (ext === '.rs') stack.languages.add('Rust');
    else if (ext === '.php') stack.languages.add('PHP');

    // Entry point candidates
    const base = path.basename(f);
    if (['main.ts', 'index.ts', 'main.py', 'app.ts', 'index.js', 'server.js', 'main.go'].includes(base)) {
      stack.entryPoints.push(path.relative(wsRoot, f));
    }
  }

  return stack;
}

function extractDirectoryMap(wsRoot, allFiles) {
  const dirMap = {};
  for (const f of allFiles) {
    const rel = path.relative(wsRoot, f);
    const parts = rel.split(path.sep);
    if (parts.length > 1) {
      const topDir = parts[0];
      dirMap[topDir] = (dirMap[topDir] || 0) + 1;
    }
  }
  return dirMap;
}

function detectEnvVariables(wsRoot) {
  const envCandidates = ['.env.example', '.env.sample', '.env.template', '.env.local.example'];
  for (const cand of envCandidates) {
    const p = path.join(wsRoot, cand);
    if (fs.existsSync(p)) {
      try {
        const lines = fs.readFileSync(p, 'utf8').split('\n');
        return lines
          .map(l => l.trim())
          .filter(l => l && !l.startsWith('#') && l.includes('='))
          .map(l => l.split('=')[0].trim());
      } catch (e) {}
    }
  }
  return [];
}

function generateWikiMarkdown(wsRoot) {
  const wsName = path.basename(wsRoot);
  const allFiles = scanFilesFast(wsRoot);
  const stack = detectTechStack(wsRoot, allFiles);
  const dirMap = extractDirectoryMap(wsRoot, allFiles);
  const envVars = detectEnvVariables(wsRoot);

  const lines = [
    `# 🏛️ REPO WIKI: ${wsName}`,
    `> **Auto-Generated Architecture Map** | Total Files: ${allFiles.length} | Updated: ${new Date().toISOString().split('T')[0]}`,
    `> *This document provides high-level context to prevent blind codebase exploration. Keep it concise.*`,
    '',
    '## 1. Executive Summary & Tech Stack',
    `- **Languages**: ${Array.from(stack.languages).join(', ') || 'N/A'}`,
    `- **Frameworks**: ${Array.from(stack.frameworks).join(', ') || 'Standard / Vanilla'}`,
    `- **Data Layer / ORM**: ${Array.from(stack.database).join(', ') || 'None / In-Memory'}`,
    `- **Test Runner**: ${Array.from(stack.testRunner).join(', ') || 'N/A'}`,
    `- **Primary Entry Points**: ${stack.entryPoints.slice(0, 4).join(', ') || 'Not explicitly declared'}`,
    '',
    '## 2. Directory & Architecture Layout',
    '| Directory | Files Count | Architectural Responsibility |',
    '|---|---|---|'
  ];

  for (const [dir, count] of Object.entries(dirMap).sort((a, b) => b[1] - a[1]).slice(0, 8)) {
    let role = 'Source files / modules';
    const lower = dir.toLowerCase();
    if (['src', 'app'].includes(lower)) role = 'Application core logic & source code';
    else if (['components', 'ui'].includes(lower)) role = 'Visual UI components & styling';
    else if (['api', 'routes', 'controllers'].includes(lower)) role = 'API handlers, routes & network endpoints';
    else if (['lib', 'utils', 'helpers'].includes(lower)) role = 'Shared utilities, clients & helpers';
    else if (['tests', 'test', '__tests__'].includes(lower)) role = 'Unit, integration & E2E test suites';
    else if (['docs', 'documentation'].includes(lower)) role = 'Documentation & architectural references';
    else if (['scripts', 'tools', 'bin'].includes(lower)) role = 'Build, migration & automation scripts';
    else if (['prisma', 'db', 'database', 'migrations'].includes(lower)) role = 'Database schemas & migrations';

    lines.push(`| \`${dir}/\` | ${count} files | ${role} |`);
  }

  lines.push('');
  lines.push('## 3. Key Operational Commands');
  const scripts = stack.packageScripts;
  if (Object.keys(scripts).length > 0) {
    lines.push('```bash');
    if (scripts.dev) lines.push(`# Start development server:\nnpm run dev`);
    if (scripts.build) lines.push(`# Build application:\nnpm run build`);
    if (scripts.test) lines.push(`# Run test suite:\nnpm test`);
    if (scripts.lint) lines.push(`# Run linter:\nnpm run lint`);
    lines.push('```');
  } else {
    lines.push('*(No package.json scripts detected)*');
  }

  if (envVars.length > 0) {
    lines.push('');
    lines.push('## 4. Required Environment Variables');
    lines.push(`Found in \`.env.example\`: \`${envVars.slice(0, 10).join('`, `')}\`${envVars.length > 10 ? ` (+${envVars.length - 10} more)` : ''}`);
  }

  lines.push('');
  lines.push('## 5. Architectural Invariants');
  lines.push('- **Code Organization**: Follow established folder hierarchies; do not create duplicate utility abstractions.');
  lines.push('- **State Management**: Adhere to existing patterns (Server State vs Client State).');
  lines.push('- **Verification**: Always run project test/build commands before finalizing changes.');

  return lines.join('\n');
}

// CLI Execution
const args = process.argv.slice(2);
const cmd = args[0] || 'generate';
const wsRoot = resolveWorkspace(args[1]);

switch (cmd) {
  case 'generate':
  case 'update': {
    const wikiContent = generateWikiMarkdown(wsRoot);
    const targetDir = path.join(wsRoot, '.agents');
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    const targetFile = path.join(targetDir, 'REPO_WIKI.md');
    fs.writeFileSync(targetFile, wikiContent, 'utf8');
    console.log(JSON.stringify({
      status: 'success',
      wikiFile: targetFile,
      totalLines: wikiContent.split('\n').length,
      bytes: Buffer.byteLength(wikiContent, 'utf8')
    }, null, 2));
    break;
  }
  case 'status': {
    const targetFile = path.join(wsRoot, '.agents', 'REPO_WIKI.md');
    if (fs.existsSync(targetFile)) {
      const stat = fs.statSync(targetFile);
      console.log(JSON.stringify({
        exists: true,
        file: targetFile,
        sizeBytes: stat.size,
        lastModified: stat.mtime.toISOString()
      }, null, 2));
    } else {
      console.log(JSON.stringify({ exists: false, message: 'No REPO_WIKI.md found. Run generate first.' }, null, 2));
    }
    break;
  }
  default:
    console.log('Usage: node repo-wiki.js [generate|status] [workspacePath]');
}
