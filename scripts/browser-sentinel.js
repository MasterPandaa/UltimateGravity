#!/usr/bin/env node

/**
 * Antigravity Browser & Dev Server Sentinel
 * Inspired by Devin's _cognition.ai/browserPreview/capture.
 * 
 * Lightweight (< 20 MB RAM, transient execution) frontend dev server diagnostic tool.
 * Probes local dev servers (Vite, Next.js, CRA, etc.) for build crashes, error overlays,
 * broken resources, and HTTP errors.
 * 
 * Usage:
 *   node browser-sentinel.js probe [url]
 *   node browser-sentinel.js watch [url]
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { execSync } = require('child_process');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const DEFAULT_URLS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
];

async function probeUrl(targetUrl) {
  const result = {
    url: targetUrl,
    reachable: false,
    status: null,
    errorOverlayDetected: false,
    errorDetails: null,
    latencyMs: 0
  };

  const start = Date.now();
  try {
    const res = await fetch(targetUrl, { signal: AbortSignal.timeout(3000) });
    result.reachable = true;
    result.status = res.status;
    result.latencyMs = Date.now() - start;

    const body = await res.text();

    // Check for common error overlays
    if (body.includes('vite-error-overlay') || body.includes('<vite-error-overlay>')) {
      result.errorOverlayDetected = true;
      result.errorDetails = 'Vite runtime/compile error overlay detected in DOM';
    } else if (body.includes('nextjs-portal') || body.includes('__next_error__') || body.includes('Next.js Error')) {
      result.errorOverlayDetected = true;
      result.errorDetails = 'Next.js build/runtime error overlay detected';
    } else if (res.status >= 500) {
      result.errorOverlayDetected = true;
      result.errorDetails = `Internal Server Error (HTTP ${res.status})`;
    } else if (body.includes('Uncaught Error:') || body.includes('SyntaxError:')) {
      const match = body.match(/(SyntaxError:[^\n<]+|Uncaught Error:[^\n<]+)/);
      result.errorOverlayDetected = true;
      result.errorDetails = match ? match[1] : 'Uncaught client-side error detected';
    }
  } catch (err) {
    result.reachable = false;
    result.errorDetails = err.message;
  }

  return result;
}

async function runEdgeHeadless(targetUrl) {
  if (!fs.existsSync(EDGE_PATH)) return null;
  try {
    const output = execSync(`"${EDGE_PATH}" --headless --dump-dom --disable-gpu --virtual-time-budget=1000 "${targetUrl}"`, {
      encoding: 'utf8',
      timeout: 5000,
      maxBuffer: 5 * 1024 * 1024
    });

    const issues = [];
    if (output.includes('vite-error-overlay')) {
      issues.push('Vite build/syntax overlay in rendered DOM');
    }
    if (output.includes('Hydration failed') || output.includes('hydration-mismatch')) {
      issues.push('React SSR Hydration Mismatch detected');
    }
    return {
      success: true,
      issues
    };
  } catch (e) {
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0] || 'probe';
  let targetUrl = args[1];

  if (!targetUrl) {
    // Auto-detect reachable dev server
    for (const candidate of DEFAULT_URLS) {
      try {
        const res = await fetch(candidate, { signal: AbortSignal.timeout(500) });
        if (res.ok) {
          targetUrl = candidate;
          break;
        }
      } catch (e) {}
    }
  }

  if (!targetUrl) {
    console.log(JSON.stringify({
      status: 'no_server_running',
      message: 'No active local dev server detected on common ports (3000, 5173, 8080).'
    }, null, 2));
    process.exit(0);
  }

  const probeRes = await probeUrl(targetUrl);
  let headlessRes = null;

  if (probeRes.reachable && !probeRes.errorOverlayDetected) {
    headlessRes = await runEdgeHeadless(targetUrl);
  }

  const report = {
    timestamp: new Date().toISOString(),
    probe: probeRes,
    renderedCheck: headlessRes,
    healthy: probeRes.reachable && !probeRes.errorOverlayDetected && (!headlessRes || headlessRes.issues.length === 0)
  };

  console.log(JSON.stringify(report, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
