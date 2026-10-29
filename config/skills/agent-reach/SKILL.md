---
name: agent-reach
description: "[Multi-Platform Web & Feed Scraper] Direct data extraction without paid APIs from Reddit, X/Twitter, YouTube transcripts, GitHub repositories, and RSS feeds via Jina reader and scrapers. DO NOT USE for developer discussions strictly restricted to the last 30 days (use last30days-skill)."
---

# Agent Reach

Empowers the agent to search, pull, and scrape unstructured web content across multiple platforms with zero API fees, feeding clean structured data directly into the pipeline.

## Capabilities & Platform Routing

| Target Platform | Tool / Method | Recommended Invocation Pattern |
| :--- | :--- | :--- |
| **General Web Pages** | Jina Reader / Scrapling | Prepend URL with `https://r.jina.ai/<url>` or use `scrapling.make_request` / `fetch` |
| **Reddit Discussions** | Public JSON Endpoints / Scrapling | Append `.json` to any Reddit URL (e.g., `https://www.reddit.com/r/webdev/comments/...json`) to get structured JSON directly without rate-limit blocking |
| **YouTube Videos** | `yt-dlp` CLI / Transcripts | Run `yt-dlp --write-sub --skip-download <url>` to pull subtitle transcript without downloading video |
| **GitHub Repos** | `gh` CLI / GitHub MCP | Use `gh api /repos/{owner}/{repo}/...` or `github` MCP tools to fetch raw code, commits, and tree |
| **X / Twitter** | Nitter / Jina Twitter | Fetch through public mirrors or use Jina Reader on tweet URLs (`https://r.jina.ai/https://x.com/...`) |
| **RSS / Atom Feeds** | Direct HTTP Request | Use `scrapling.make_request` to parse raw XML into structured posts |

## Operational Rules for Data Engineers (Saiken)
1. **Rate-Limit & Politeness**: Always include a 1–2 second pause between sequential batch requests to avoid IP bans.
2. **Defensive Parsing**: Always validate the content-type and check for empty strings, CAPTCHA blocks, or 403 errors before piping into database/analyst.
3. **Structured Handoff**: Format extracted data into structured JSON with metadata:
   - `source_url`
   - `timestamp`
   - `title`
   - `author`
   - `clean_text`
4. **Local Fallback**: If remote endpoints fail, fallback to local headless browser via `openbrowser` or `playwright-cli`.
