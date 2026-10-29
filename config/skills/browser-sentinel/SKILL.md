---
name: browser-sentinel
description: "[Frontend Dev Server & Live Error Sentinel] Instant, zero-bloat diagnostic probe for local web servers (Vite, Next.js, React). Detects runtime build crashes, error overlays, and React hydration errors using native Edge engine. Inspired by Devin's browser preview capture."
allowed-tools: run_command, read_file
tags: [frontend, debugging, dev-server, vite, nextjs, react, errors]
---

# Browser Sentinel (Frontend Dev Server & Live Error Sentinel)

This skill provides ultra-lightweight, zero-bloat frontend error surveillance directly inside Antigravity without requiring external heavy browser automation servers or background daemons.

## When to Use
- After modifying frontend components (React, Next.js, Vue, Vite, Tailwind).
- To verify that a local development server is running cleanly and not throwing runtime error overlays or hydration mismatches.
- Fulfills the **Live Browser Visual Verification Gate** mandated in engineering standards.

## Usage & Commands

Run via the lightweight standalone script:
`node C:\Users\Luthfi\.gemini\scripts\browser-sentinel.js probe [url]`

### 1. Auto-Detect Active Local Server
Probes common local ports (`3000`, `5173`, `8080`) automatically:
```powershell
node C:\Users\Luthfi\.gemini\scripts\browser-sentinel.js probe
```

### 2. Probe a Specific URL
```powershell
node C:\Users\Luthfi\.gemini\scripts\browser-sentinel.js probe http://localhost:5173
```

## Diagnostics Detected
1. **Error Overlays**: `<vite-error-overlay>`, Next.js error portals (`__next_error__`), Webpack crash screens.
2. **SSR Hydration Errors**: Uncaught React hydration mismatches between server and client render.
3. **HTTP Failures**: 500 Internal Server Errors, uncaught syntax or import exceptions in client bundle.

## Memory & Performance Invariant
- **RAM Footprint**: ~0 MB when idle, < 25 MB during execution.
- **Engine**: Uses native Microsoft Edge engine (`msedge.exe`) with `--headless --dump-dom`, requiring zero extra npm packages or daemon processes.
