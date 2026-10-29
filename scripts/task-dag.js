#!/usr/bin/env node

/**
 * Antigravity Structured Task DAG Engine
 * Dependency-aware state machine for orchestrating complex agent workflows.
 *
 * Usage:
 *   node task-dag.js init [conversationId]
 *   node task-dag.js create --subject "Title" [--desc "Details"] [--blockedBy "1,2"] [--agent "kokuo"]
 *   node task-dag.js list [conversationId]
 *   node task-dag.js next [conversationId]
 *   node task-dag.js start <id> [conversationId]
 *   node task-dag.js complete <id> [--result "output"] [conversationId]
 *   node task-dag.js fail <id> [--reason "error"] [conversationId]
 *   node task-dag.js graph [conversationId]
 */

const fs = require('fs');
const path = require('path');

const TASKS_ROOT = 'C:\\Users\\Luthfi\\.gemini\\antigravity\\tasks';

function resolveSessionDir(conversationId) {
  if (conversationId) {
    const custom = path.join(TASKS_ROOT, conversationId);
    if (!fs.existsSync(custom)) fs.mkdirSync(custom, { recursive: true });
    return custom;
  }

  // Find most recent or default
  if (!fs.existsSync(TASKS_ROOT)) fs.mkdirSync(TASKS_ROOT, { recursive: true });
  const sessions = fs.readdirSync(TASKS_ROOT, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => ({
      name: d.name,
      path: path.join(TASKS_ROOT, d.name),
      mtime: fs.statSync(path.join(TASKS_ROOT, d.name)).mtimeMs
    }))
    .sort((a, b) => b.mtime - a.mtime);

  if (sessions.length > 0) return sessions[0].path;

  const defaultDir = path.join(TASKS_ROOT, 'default-session');
  if (!fs.existsSync(defaultDir)) fs.mkdirSync(defaultDir, { recursive: true });
  return defaultDir;
}

function loadDag(sessionDir) {
  const dagPath = path.join(sessionDir, 'dag.json');
  if (!fs.existsSync(dagPath)) {
    const initial = {
      conversationId: path.basename(sessionDir),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      highwatermark: 0,
      tasks: {}
    };
    fs.writeFileSync(dagPath, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  try {
    return JSON.parse(fs.readFileSync(dagPath, 'utf8'));
  } catch (e) {
    return { conversationId: path.basename(sessionDir), tasks: {}, highwatermark: 0 };
  }
}

function saveDag(sessionDir, dag) {
  dag.updatedAt = new Date().toISOString();
  const dagPath = path.join(sessionDir, 'dag.json');
  fs.writeFileSync(dagPath, JSON.stringify(dag, null, 2), 'utf8');

  // Also write individual task JSONs for locking compatibility
  const tasksDir = path.join(sessionDir, 'tasks');
  if (!fs.existsSync(tasksDir)) fs.mkdirSync(tasksDir, { recursive: true });

  for (const [id, t] of Object.entries(dag.tasks)) {
    fs.writeFileSync(path.join(tasksDir, `${id}.json`), JSON.stringify(t, null, 2), 'utf8');
  }
}

function updateTaskReadiness(dag) {
  for (const t of Object.values(dag.tasks)) {
    if (t.status === 'pending' || t.status === 'blocked') {
      const allUpstreamDone = (t.blockedBy || []).every(depId => {
        const dep = dag.tasks[depId];
        return dep && dep.status === 'completed';
      });

      if (allUpstreamDone) {
        t.status = 'ready';
      } else {
        t.status = 'blocked';
      }
    }
  }
}

function cmdCreate(options, conversationId) {
  const sessionDir = resolveSessionDir(conversationId);
  const dag = loadDag(sessionDir);

  const nextId = String((dag.highwatermark || 0) + 1);
  dag.highwatermark = parseInt(nextId, 10);

  const blockedBy = options.blockedBy ? options.blockedBy.split(',').map(s => s.trim()).filter(Boolean) : [];

  const task = {
    id: nextId,
    subject: options.subject || `Task ${nextId}`,
    description: options.desc || '',
    assignedAgent: options.agent || 'solo',
    status: 'pending',
    blocks: [],
    blockedBy,
    createdAt: new Date().toISOString(),
    startedAt: null,
    completedAt: null,
    result: null
  };

  // Register in upstream tasks' `blocks` list
  for (const depId of blockedBy) {
    if (dag.tasks[depId]) {
      if (!dag.tasks[depId].blocks) dag.tasks[depId].blocks = [];
      if (!dag.tasks[depId].blocks.includes(nextId)) {
        dag.tasks[depId].blocks.push(nextId);
      }
    }
  }

  dag.tasks[nextId] = task;
  updateTaskReadiness(dag);
  saveDag(sessionDir, dag);

  console.log(`[DAG Task Created] ID: #${nextId} | Subject: "${task.subject}" | Initial Status: ${task.status} | BlockedBy: [${blockedBy.join(', ')}]`);
}

function cmdList(conversationId) {
  const sessionDir = resolveSessionDir(conversationId);
  const dag = loadDag(sessionDir);
  updateTaskReadiness(dag);
  saveDag(sessionDir, dag);

  const taskList = Object.values(dag.tasks).sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10));

  console.log(`\n=== Task DAG State: ${dag.conversationId} ===\n`);
  if (taskList.length === 0) {
    console.log('No tasks in DAG. Use "task-dag create --subject <title>" to add one.');
    return;
  }

  console.log('ID'.padEnd(5) + 'Status'.padEnd(14) + 'Agent'.padEnd(12) + 'Blocked By'.padEnd(16) + 'Subject');
  console.log('-'.repeat(85));

  for (const t of taskList) {
    const statusIcon = {
      'ready': '[READY]   ',
      'in_progress': '[RUNNING] ',
      'completed': '[DONE]    ',
      'blocked': '[BLOCKED] ',
      'failed': '[FAILED]  ',
      'pending': '[PENDING] '
    }[t.status] || `[${t.status}]`;

    const blockedStr = (t.blockedBy && t.blockedBy.length > 0) ? `[#${t.blockedBy.join(', #')}]` : '-';
    console.log(
      `#${t.id}`.padEnd(5) +
      statusIcon.padEnd(14) +
      t.assignedAgent.padEnd(12) +
      blockedStr.padEnd(16) +
      t.subject
    );
  }

  const completed = taskList.filter(t => t.status === 'completed').length;
  console.log(`\nProgress: ${completed}/${taskList.length} completed (${Math.round((completed / taskList.length) * 100)}%)\n`);
}

function cmdNext(conversationId) {
  const sessionDir = resolveSessionDir(conversationId);
  const dag = loadDag(sessionDir);
  updateTaskReadiness(dag);
  saveDag(sessionDir, dag);

  const readyTasks = Object.values(dag.tasks).filter(t => t.status === 'ready');
  if (readyTasks.length === 0) {
    const inProgress = Object.values(dag.tasks).filter(t => t.status === 'in_progress');
    if (inProgress.length > 0) {
      console.log(`No ready unstarted tasks. Active tasks in progress: #${inProgress.map(t => t.id).join(', #')}`);
    } else {
      console.log('No tasks are currently ready to execute.');
    }
    return;
  }

  const next = readyTasks[0];
  console.log(`\nNext Ready Task: #${next.id} - "${next.subject}"`);
  console.log(`Assigned Agent: ${next.assignedAgent}`);
  if (next.description) console.log(`Description: ${next.description}`);
  console.log(`To start: task-dag start ${next.id}\n`);
}

function cmdStart(id, conversationId) {
  const sessionDir = resolveSessionDir(conversationId);
  const dag = loadDag(sessionDir);
  updateTaskReadiness(dag);

  const t = dag.tasks[id];
  if (!t) {
    console.error(`Task #${id} not found.`);
    process.exit(1);
  }

  if (t.status === 'blocked') {
    const unresolved = t.blockedBy.filter(depId => dag.tasks[depId]?.status !== 'completed');
    console.error(`CANNOT START Task #${id}: Blocked by unresolved dependencies: [#${unresolved.join(', #')}]`);
    process.exit(1);
  }

  if (t.status === 'completed') {
    console.warn(`Task #${id} is already marked completed.`);
    return;
  }

  t.status = 'in_progress';
  t.startedAt = new Date().toISOString();
  saveDag(sessionDir, dag);
  console.log(`[Task Started] #${id}: "${t.subject}" (in_progress)`);
}

function cmdComplete(id, result, conversationId) {
  const sessionDir = resolveSessionDir(conversationId);
  const dag = loadDag(sessionDir);

  const t = dag.tasks[id];
  if (!t) {
    console.error(`Task #${id} not found.`);
    process.exit(1);
  }

  t.status = 'completed';
  t.completedAt = new Date().toISOString();
  if (result) t.result = result;

  // Auto-unblock downstream dependencies
  updateTaskReadiness(dag);
  saveDag(sessionDir, dag);

  console.log(`[Task Completed] #${id}: "${t.subject}"`);

  // Check which downstream tasks became ready
  const unblocked = (t.blocks || []).map(bId => dag.tasks[bId]).filter(d => d && d.status === 'ready');
  if (unblocked.length > 0) {
    console.log(`Downstream tasks now READY to run: #${unblocked.map(u => u.id + ' ("' + u.subject + '")').join(', ')}`);
  }
}

function cmdFail(id, reason, conversationId) {
  const sessionDir = resolveSessionDir(conversationId);
  const dag = loadDag(sessionDir);

  const t = dag.tasks[id];
  if (!t) {
    console.error(`Task #${id} not found.`);
    process.exit(1);
  }

  t.status = 'failed';
  t.failedAt = new Date().toISOString();
  t.failureReason = reason || 'Unspecified failure';

  saveDag(sessionDir, dag);
  console.log(`[Task Failed] #${id}: "${t.subject}" - Reason: ${t.failureReason}`);
}

function cmdGraph(conversationId) {
  const sessionDir = resolveSessionDir(conversationId);
  const dag = loadDag(sessionDir);
  updateTaskReadiness(dag);

  const lines = ['```mermaid', 'graph TD'];

  const styleClasses = {
    'completed': 'fill:#22c55e,stroke:#15803d,color:#ffffff',
    'in_progress': 'fill:#3b82f6,stroke:#1d4ed8,color:#ffffff',
    'ready': 'fill:#eab308,stroke:#a16207,color:#ffffff',
    'blocked': 'fill:#64748b,stroke:#334155,color:#ffffff',
    'failed': 'fill:#ef4444,stroke:#b91c1c,color:#ffffff',
    'pending': 'fill:#94a3b8,stroke:#475569,color:#ffffff'
  };

  const taskList = Object.values(dag.tasks);
  if (taskList.length === 0) {
    console.log('No tasks in DAG.');
    return;
  }

  for (const t of taskList) {
    const label = `"${t.id}: ${t.subject.replace(/"/g, "'")} [${t.status}]"`;
    lines.push(`    T${t.id}[${label}]`);
    lines.push(`    style T${t.id} ${styleClasses[t.status] || styleClasses.pending}`);

    for (const bId of (t.blocks || [])) {
      lines.push(`    T${t.id} --> T${bId}`);
    }
  }

  lines.push('```');
  console.log(lines.join('\n'));
}

// Simple CLI arg parser
const rawArgs = process.argv.slice(2);
const command = rawArgs[0] || 'list';

function parseFlags(args) {
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
      flags[key] = val;
      if (val !== true) i++;
    }
  }
  return flags;
}

const flags = parseFlags(rawArgs.slice(1));

switch (command) {
  case 'create':
    cmdCreate(flags, flags.session);
    break;
  case 'list':
    cmdList(flags.session || rawArgs[1]);
    break;
  case 'next':
    cmdNext(flags.session || rawArgs[1]);
    break;
  case 'start':
    if (!rawArgs[1]) { console.error('Usage: start <id>'); process.exit(1); }
    cmdStart(rawArgs[1], flags.session || rawArgs[2]);
    break;
  case 'complete':
    if (!rawArgs[1]) { console.error('Usage: complete <id> [--result "output"]'); process.exit(1); }
    cmdComplete(rawArgs[1], flags.result, flags.session || rawArgs[2]);
    break;
  case 'fail':
    if (!rawArgs[1]) { console.error('Usage: fail <id> [--reason "error"]'); process.exit(1); }
    cmdFail(rawArgs[1], flags.reason, flags.session || rawArgs[2]);
    break;
  case 'graph':
    cmdGraph(flags.session || rawArgs[1]);
    break;
  default:
    console.log('Commands: create, list, next, start, complete, fail, graph');
}
