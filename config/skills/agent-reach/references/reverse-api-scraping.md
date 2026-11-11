# Reverse-API Network Inspection & Direct HTTP Extraction

> Grounded in the architectural absorption of `goodnight000/api-anything` into Google Antigravity Data Engineering.

---

## 1. The Reverse-API Paradigm (Token & Latency Efficiency)

A pervasive anti-pattern in agentic web scraping is relying on full headless browser rendering (Playwright, Puppeteer, DOM dumping). 

```text
❌ TRADITIONAL HEADLESS BROWSER SCRAPING:
Target URL -> Launch Chromium -> Render Full DOM -> Dump HTML -> LLM parses 50,000+ tokens
Latency: 5,000ms - 15,000ms | Token Tax: ~50,000 tokens | Fragility: High (DOM class changes)

✅ REVERSE-API DIRECT EXTRACTION:
Target URL -> Inspect XHR/Fetch Endpoint -> Replay Direct HTTP Request -> Clean JSON payload
Latency: <300ms | Token Tax: ~500 tokens (90-99% reduction) | Fragility: Low (API stability)
```

Modern web applications (React, Next.js, Vue, mobile backends) hydrate their UI using internal JSON APIs (`/api/...`, `graphql`, `/v1/...`). Extracting this internal endpoint once transforms any dynamic website into a direct, low-overhead API for `data-engineer`.

---

## 2. 4-Step Reverse-API SOP

### Step 1: Endpoint Discovery via Network Inspection
Capture internal requests using Chrome DevTools MCP or browser sentinel:
- Filter network requests for `resourceType: "fetch"` or `"xhr"`.
- Inspect `content-type: application/json`.
- Identify the request URL, query parameters, and payload structure.

### Step 2: Minimal Header Distillation
Web APIs often reject requests missing basic browser context. Extract and preserve the minimal required headers:
```json
{
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...",
  "Accept": "application/json",
  "Referer": "https://example.com/search",
  "Authorization": "Bearer <token-if-present>"
}
```
*Strip tracking, analytics, and telemetry headers to prevent header bloat.*

### Step 3: Direct HTTP Replay (Zero Browser Overhead)
Execute the query using lightweight HTTP clients (`scrapling.make_request`, Node `fetch`, or Python `requests`):
```python
import requests

url = "https://api.example.com/v1/search"
params = {"query": "vector databases", "limit": 20}
headers = {"User-Agent": "Mozilla/5.0 ...", "Accept": "application/json"}

response = requests.get(url, params=params, headers=headers)
data = response.json() # Clean, structured payload ready for ETL
```

### Step 4: Self-Healing & Drift Detection
If the internal API returns `401 Unauthorized`, `403 Forbidden`, or `404 Not Found` (indicating a route migration or rotated token):
1. **Trigger Re-Learning**: Spin up a single isolated browser turn (`Workspace: 'branch'`).
2. **Re-capture Network Trace**: Observe the new endpoint path or updated session token.
3. **Persist Request Template**: Save the updated template into the pipeline configuration.
4. **Resume Direct HTTP**: All subsequent runs return to lightweight HTTP execution.

---

## 3. Operational Rules for Data Engineers
1. **Never dump full HTML DOM when an internal JSON endpoint exists.** Always check network calls before resorting to DOM parsing.
2. **Sanitize Secrets**: Store session cookies or tokens locally in environment variables; never commit plaintext session tokens.
3. **Politeness & Rate Limits**: Enforce jittered delays (500ms–2000ms) between sequential HTTP requests to respect target origin rate limits.

---

## 4. Automated Type-Safe Client Synthesis (Zod / Pydantic)

> Grounded in the architectural absorption of `kalil0321/reverse-api-engineer`.

Rather than writing unstructured ad-hoc scripts, synthesize a typed, resilient client wrapper directly from the captured network trace without installing external generators:

### A. Contract Schema Inference (Zod / TypeScript)
```typescript
import { z } from 'zod';

export const SearchResultSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().url(),
  metrics: z.object({ views: z.number().optional(), score: z.number().default(0) }).optional()
});

export const SearchResponseSchema = z.object({
  results: z.array(SearchResultSchema),
  total: z.number()
});
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
```

### B. Resilient Client Wrapper
```typescript
export class TargetApiClient {
  constructor(private baseUrl: string, private sessionToken?: string) {}

  async search(query: string, limit = 20): Promise<SearchResponse> {
    const res = await fetch(`${this.baseUrl}/v1/search?q=${encodeURIComponent(query)}&limit=${limit}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...',
        'Accept': 'application/json',
        ...(this.sessionToken ? { 'Authorization': `Bearer ${this.sessionToken}` } : {})
      }
    });

    if (!res.ok) throw new Error(`API call failed: ${res.status} ${res.statusText}`);
    const raw = await res.json();
    return SearchResponseSchema.parse(raw); // Runtime validation catches breaking upstream drift
  }
}
```

### Invariants:
1. **Zero External Binary**: Generate typed clients directly using native TypeScript/Zod or Python/Pydantic without installing heavy external CLI tools.
2. **Runtime Contract Guard**: Always validate incoming JSON through schemas to isolate downstream database/pipeline layers from silent upstream format shifts.
