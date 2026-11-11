/**
 * mcp-profile.js
 * Lean utility to toggle heavy MCP servers on/off to prevent tool sprawl.
 * Moves schemas between <appDataDir>\mcp and <config>\archive\mcp_archive\cached_schemas
 */
const fs = require('fs');
const path = require('path');

const MCP_ACTIVE_DIR = 'C:\\Users\\Luthfi\\.gemini\\antigravity\\mcp';
const MCP_ARCHIVE_DIR = 'C:\\Users\\Luthfi\\.gemini\\config\\archive\\mcp_archive\\cached_schemas';
const MCP_CONFIG_FILE = 'C:\\Users\\Luthfi\\.gemini\\config\\mcp_config.json';
const MCP_ALL_CONFIG = 'C:\\Users\\Luthfi\\.gemini\\config\\archive\\mcp_archive\\mcp_config.all.json';

const action = process.argv[2] || 'status';
const targetServer = process.argv[3];

function listStatus() {
  console.log('=== MCP Server Profile Status ===');
  const active = fs.existsSync(MCP_ACTIVE_DIR) ? fs.readdirSync(MCP_ACTIVE_DIR) : [];
  const archived = fs.existsSync(MCP_ARCHIVE_DIR) ? fs.readdirSync(MCP_ARCHIVE_DIR) : [];

  console.log('\n[ACTIVE SERVERS]:');
  active.forEach(s => {
    const files = fs.readdirSync(path.join(MCP_ACTIVE_DIR, s)).filter(f => f.endsWith('.json'));
    console.log(`  - ${s.padEnd(25)} : ${files.length} tools`);
  });

  console.log('\n[ARCHIVED / SLEEPING SERVERS]:');
  archived.forEach(s => {
    const sPath = path.join(MCP_ARCHIVE_DIR, s);
    if (fs.statSync(sPath).isDirectory()) {
      const files = fs.readdirSync(sPath).filter(f => f.endsWith('.json'));
      console.log(`  - ${s.padEnd(25)} : ${files.length} tools`);
    }
  });
}

function enableServer(name) {
  if (!name) return console.error('Please specify server name to enable.');
  const src = path.join(MCP_ARCHIVE_DIR, name);
  const dst = path.join(MCP_ACTIVE_DIR, name);
  if (!fs.existsSync(src)) {
    return console.error(`Server '${name}' not found in archive: ${src}`);
  }
  fs.renameSync(src, dst);

  // Sync mcp_config.json from mcp_config.all.json if entry exists
  if (fs.existsSync(MCP_ALL_CONFIG) && fs.existsSync(MCP_CONFIG_FILE)) {
    const allCfg = JSON.parse(fs.readFileSync(MCP_ALL_CONFIG, 'utf8'));
    const curCfg = JSON.parse(fs.readFileSync(MCP_CONFIG_FILE, 'utf8'));
    if (allCfg.mcpServers && allCfg.mcpServers[name]) {
      curCfg.mcpServers[name] = allCfg.mcpServers[name];
      fs.writeFileSync(MCP_CONFIG_FILE, JSON.stringify(curCfg, null, 2), 'utf8');
    }
  }
  console.log(`Server '${name}' enabled and restored to active pool.`);
}

function disableServer(name) {
  if (!name) return console.error('Please specify server name to disable.');
  const src = path.join(MCP_ACTIVE_DIR, name);
  const dst = path.join(MCP_ARCHIVE_DIR, name);
  if (!fs.existsSync(src)) {
    return console.error(`Server '${name}' not found in active pool: ${src}`);
  }
  if (!fs.existsSync(MCP_ARCHIVE_DIR)) fs.mkdirSync(MCP_ARCHIVE_DIR, { recursive: true });
  fs.renameSync(src, dst);

  // Remove from mcp_config.json
  if (fs.existsSync(MCP_CONFIG_FILE)) {
    const curCfg = JSON.parse(fs.readFileSync(MCP_CONFIG_FILE, 'utf8'));
    if (curCfg.mcpServers && curCfg.mcpServers[name]) {
      delete curCfg.mcpServers[name];
      fs.writeFileSync(MCP_CONFIG_FILE, JSON.stringify(curCfg, null, 2), 'utf8');
    }
  }
  console.log(`Server '${name}' disabled and moved to archive.`);
}

switch (action) {
  case 'status':
  case 'list':
    listStatus();
    break;
  case 'enable':
    enableServer(targetServer);
    break;
  case 'disable':
    disableServer(targetServer);
    break;
  default:
    console.log('Usage: node mcp-profile.js [status|enable <name>|disable <name>]');
}
