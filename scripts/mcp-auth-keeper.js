/**
 * Auto MCP Auth Keeper & Token Refresher for Antigravity
 * Checks and automatically refreshes tokens for Atlassian, Firecrawl, Vercel, Supermemory, Sentry
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const AUTH_DIR = 'C:\\Users\\Luthfi\\.mcp-auth\\mcp-remote-v1';

async function postRequest(urlStr, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const postBody = typeof data === 'string' ? data : JSON.stringify(data);
    const reqHeaders = {
      ...headers,
      'Content-Length': Buffer.byteLength(postBody)
    };

    const req = https.request(url, {
      method: 'POST',
      headers: reqHeaders
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);
    req.write(postBody);
    req.end();
  });
}

async function refreshAtlassian(clientInfo, tokens, tokenFile) {
  console.log('[Atlassian] Token expired or expiring soon. Refreshing via auth.atlassian.com...');
  const res = await postRequest('https://auth.atlassian.com/oauth/token', {
    grant_type: 'refresh_token',
    client_id: clientInfo.client_id,
    client_secret: clientInfo.client_secret,
    refresh_token: tokens.refresh_token
  }, { 'Content-Type': 'application/json' });

  if (res.status === 200 && res.data.access_token) {
    tokens.access_token = res.data.access_token;
    if (res.data.refresh_token) tokens.refresh_token = res.data.refresh_token;
    tokens.expires_in = res.data.expires_in;
    tokens.expires_at = Date.now() + (res.data.expires_in * 1000);
    fs.writeFileSync(tokenFile, JSON.stringify(tokens, null, 2));
    console.log(`[Atlassian] Refreshed successfully! Valid until ${new Date(tokens.expires_at).toLocaleString()}`);
    return { ok: true, status: 'refreshed' };
  } else {
    console.error('[Atlassian] Refresh failed:', res.data || res.raw);
    return { ok: false, error: res.data || res.raw };
  }
}

async function refreshFirecrawl(clientInfo, tokens, tokenFile) {
  console.log('[Firecrawl] Token expired or expiring soon. Refreshing via api.firecrawl.dev...');
  const res = await postRequest('https://www.firecrawl.dev/api/oauth/token', {
    grant_type: 'refresh_token',
    client_id: clientInfo.client_id,
    refresh_token: tokens.refresh_token
  }, { 'Content-Type': 'application/json' });

  if (res.status === 200 && res.data.access_token) {
    tokens.access_token = res.data.access_token;
    if (res.data.refresh_token) tokens.refresh_token = res.data.refresh_token;
    tokens.expires_in = res.data.expires_in;
    tokens.expires_at = Date.now() + (res.data.expires_in * 1000);
    fs.writeFileSync(tokenFile, JSON.stringify(tokens, null, 2));
    console.log(`[Firecrawl] Refreshed successfully! Valid until ${new Date(tokens.expires_at).toLocaleString()}`);
    return { ok: true, status: 'refreshed' };
  } else {
    console.error('[Firecrawl] Refresh failed:', res.data || res.raw);
    return { ok: false, error: res.data || res.raw };
  }
}

async function refreshVercel(clientInfo, tokens, tokenFile) {
  console.log('[Vercel] Token expired or expiring soon. Refreshing via api.vercel.com...');
  const querystring = require('querystring');
  const postData = querystring.stringify({
    grant_type: 'refresh_token',
    client_id: clientInfo.client_id,
    refresh_token: tokens.refresh_token
  });

  const res = await postRequest('https://api.vercel.com/login/oauth/token', postData, {
    'Content-Type': 'application/x-www-form-urlencoded'
  });

  if (res.status === 200 && res.data.access_token) {
    tokens.access_token = res.data.access_token;
    if (res.data.refresh_token) tokens.refresh_token = res.data.refresh_token;
    if (res.data.expires_in) {
      tokens.expires_in = res.data.expires_in;
      tokens.expires_at = Date.now() + (res.data.expires_in * 1000);
    }
    fs.writeFileSync(tokenFile, JSON.stringify(tokens, null, 2));
    console.log(`[Vercel] Refreshed successfully! Valid until ${new Date(tokens.expires_at).toLocaleString()}`);
    return { ok: true, status: 'refreshed' };
  } else {
    console.error('[Vercel] Refresh failed:', res.data || res.raw);
    return { ok: false, error: res.data || res.raw };
  }
}

async function refreshSupermemory(clientInfo, tokens, tokenFile) {
  console.log('[Supermemory] Token expired or expiring soon. Refreshing via api.supermemory.ai...');
  const querystring = require('querystring');
  const postData = querystring.stringify({
    grant_type: 'refresh_token',
    client_id: clientInfo.client_id,
    refresh_token: tokens.refresh_token
  });

  const res = await postRequest('https://api.supermemory.ai/api/auth/oauth2/token', postData, {
    'Content-Type': 'application/x-www-form-urlencoded'
  });

  if (res.status === 200 && res.data.access_token) {
    tokens.access_token = res.data.access_token;
    if (res.data.refresh_token) tokens.refresh_token = res.data.refresh_token;
    if (res.data.expires_in) {
      tokens.expires_in = res.data.expires_in;
      tokens.expires_at = Date.now() + (res.data.expires_in * 1000);
    }
    fs.writeFileSync(tokenFile, JSON.stringify(tokens, null, 2));
    console.log(`[Supermemory] Refreshed successfully! Valid until ${new Date(tokens.expires_at).toLocaleString()}`);
    return { ok: true, status: 'refreshed' };
  } else {
    console.error('[Supermemory] Refresh failed:', res.data || res.raw);
    return { ok: false, error: res.data || res.raw };
  }
}

async function refreshSupabase(clientInfo, tokens, tokenFile) {
  console.log('[Supabase] Token expired or expiring soon. Refreshing via api.supabase.com...');
  const querystring = require('querystring');
  const postData = querystring.stringify({
    grant_type: 'refresh_token',
    refresh_token: tokens.refresh_token,
    client_id: clientInfo.client_id,
    client_secret: clientInfo.client_secret
  });
  const authHeader = 'Basic ' + Buffer.from(`${clientInfo.client_id}:${clientInfo.client_secret}`).toString('base64');
  const res = await postRequest('https://api.supabase.com/v1/oauth/token', postData, {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': authHeader
  });

  if (res.status === 200 && res.data.access_token) {
    tokens.access_token = res.data.access_token;
    if (res.data.refresh_token) tokens.refresh_token = res.data.refresh_token;
    if (res.data.expires_in) {
      tokens.expires_in = res.data.expires_in;
      tokens.expires_at = Date.now() + (res.data.expires_in * 1000);
    }
    fs.writeFileSync(tokenFile, JSON.stringify(tokens, null, 2));
    console.log(`[Supabase] Refreshed successfully! Valid until ${new Date(tokens.expires_at).toLocaleString()}`);
    return { ok: true, status: 'refreshed' };
  } else {
    console.error('[Supabase] Refresh failed:', res.data || res.raw);
    return { ok: false, error: res.data || res.raw };
  }
}

async function refreshDeepSource(clientInfo, tokens, tokenFile) {
  console.log('[DeepSource] Token expired or expiring soon. Refreshing via app.deepsource.com...');
  const querystring = require('querystring');
  const postData = querystring.stringify({
    grant_type: 'refresh_token',
    refresh_token: tokens.refresh_token,
    client_id: clientInfo.client_id
  });
  const res = await postRequest('https://app.deepsource.com/mcp/o/token/', postData, {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'MCP CLI Proxy/0.14.3'
  });

  if (res.status === 200 && res.data.access_token) {
    tokens.access_token = res.data.access_token;
    if (res.data.refresh_token) tokens.refresh_token = res.data.refresh_token;
    if (res.data.expires_in) {
      tokens.expires_in = res.data.expires_in;
      tokens.expires_at = Date.now() + (res.data.expires_in * 1000);
    }
    fs.writeFileSync(tokenFile, JSON.stringify(tokens, null, 2));
    console.log(`[DeepSource] Refreshed successfully! Valid until ${new Date(tokens.expires_at).toLocaleString()}`);
    return { ok: true, status: 'refreshed' };
  } else {
    console.error('[DeepSource] Refresh failed:', res.data || res.raw);
    return { ok: false, error: res.data || res.raw };
  }
}

async function checkAll() {
  console.log('=== Checking & Maintaining MCP Remote Tokens ===');
  if (!fs.existsSync(AUTH_DIR)) {
    console.log('Auth directory not found.');
    return;
  }

  const files = fs.readdirSync(AUTH_DIR);
  for (const f of files) {
    if (f.endsWith('_client_info.json')) {
      const tokenFile = path.join(AUTH_DIR, f.replace('_client_info.json', '_tokens.json'));
      const clientInfoFile = path.join(AUTH_DIR, f);
      if (!fs.existsSync(tokenFile)) continue;

      const clientInfo = JSON.parse(fs.readFileSync(clientInfoFile, 'utf8'));
      const tokens = JSON.parse(fs.readFileSync(tokenFile, 'utf8'));
      const issuer = clientInfo.issuer || f;
      const now = Date.now();
      const isExpiring = tokens.expires_at ? (tokens.expires_at - now < 15 * 60 * 1000) : false;

      if (isExpiring && tokens.refresh_token) {
        if (issuer.includes('atlassian')) {
          await refreshAtlassian(clientInfo, tokens, tokenFile);
        } else if (issuer.includes('firecrawl')) {
          await refreshFirecrawl(clientInfo, tokens, tokenFile);
        } else if (issuer.includes('vercel')) {
          await refreshVercel(clientInfo, tokens, tokenFile);
        } else if (issuer.includes('supermemory')) {
          await refreshSupermemory(clientInfo, tokens, tokenFile);
        } else if (issuer.includes('supabase')) {
          await refreshSupabase(clientInfo, tokens, tokenFile);
        } else if (issuer.includes('deepsource')) {
          await refreshDeepSource(clientInfo, tokens, tokenFile);
        } else {
          console.log(`[${issuer}] Expiring soon (${new Date(tokens.expires_at).toLocaleString()}), refresh token present.`);
        }
      } else {
        const exp = tokens.expires_at ? new Date(tokens.expires_at).toLocaleString() : 'No exp';
        const isExp = tokens.expires_at ? (tokens.expires_at < now) : false;
        console.log(`[${issuer}] Valid: ${!isExp} | Expires: ${exp}`);
      }
    }
  }
  console.log('=== MCP Remote Maintenance Complete ===');
}

checkAll().catch(console.error);
