/**
 * Antigravity Skill Telemetry Hook
 * Listens on PreToolUse for read_file on SKILL.md and invoke_subagent.
 */

const { recordSkillUsage } = require('./skill-telemetry');

let inputData = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
  inputData += chunk;
});

process.stdin.on('end', () => {
  try {
    if (!inputData.trim()) {
      process.stdout.write(JSON.stringify({ decision: 'allow' }));
      process.exit(0);
    }

    const payload = JSON.parse(inputData);
    const toolCall = payload.toolCall || {};
    const toolName = toolCall.name;
    const args = toolCall.args || {};

    // 1. Detect read_file on SKILL.md
    if (toolName === 'read_file' && args.Path) {
      const match = args.Path.match(/[\\/]skills[\\/]([^\\/]+)[\\/]SKILL\.md/i);
      if (match && match[1]) {
        recordSkillUsage(match[1]);
      }
    }

    // 2. Detect invoke_subagent with skills
    if (toolName === 'invoke_subagent') {
      const prompt = args.Prompt || '';
      const skillMatches = prompt.matchAll(/[\\/]skills[\\/]([^\\/]+)[\\/]SKILL\.md/gi);
      for (const m of skillMatches) {
        if (m[1]) recordSkillUsage(m[1]);
      }
    }
  } catch (e) {
    // Fail-safe: never crash or block
  } finally {
    process.stdout.write(JSON.stringify({ decision: 'allow' }));
    process.exit(0);
  }
});
