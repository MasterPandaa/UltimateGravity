# Developer Stack, Live CVEs, and AI Agent / MCP Security

Modern developer workstations host complex ecosystems of runtimes, package managers, web servers, and local AI agent infrastructure. This guide provides audit procedures for local development stacks and AI agent execution environments.

---

## 1. Local Runtime Inventory & Live Advisory Checklist

When auditing a Windows developer machine, map installed tools into their respective categories and verify against recent CVEs (last 3 years):

| Stack / Tool | Identification Command | Critical Security Vectors to Verify |
|---|---|---|
| **PHP & Laravel** | `php -v`, `composer -V` | **CVE-2024-4577** (PHP-CGI Argument Injection on Windows Best-Fit charset $\to$ RCE, especially on XAMPP/Laragon). Check `APP_DEBUG=false` in Laravel, ensure `APP_KEY` is rotated if leaked, and run `composer audit`. |
| **Node.js & Next.js** | `node -v`, `npm -v` | **CVE-2024-27980** ("BatBadBut" batch file execution RCE via `child_process`). **CVE-2025-29927** (Next.js middleware authorization bypass). **CVE-2025-55182** (React Server Components RCE). Run `npm audit` / `pnpm audit` and inspect `postinstall` scripts for supply-chain worms (Shai-Hulud). |
| **Python & Pip** | `python --version`, `pip -V` | PyPI supply-chain trojans (typosquatting, in-memory PyMapper loaders), virtualenv isolation, unpinned requirements, cleartext API keys in `.env`. |
| **Go & .NET** | `go version`, `dotnet --version` | Run `govulncheck ./...` for Go modules; run `dotnet list package --vulnerable --include-transitive` for NuGet dependencies. |
| **Java & JVM** | `java -version` | Audit against Log4Shell (CVE-2021-44228), Spring4Shell, JNDI injection sinks, Tomcat patch levels. |
| **Web Servers (Nginx/Apache)** | `nginx -v`, `httpd -v` | HTTP/2 Rapid Reset (CVE-2023-44487), path traversal, exposure of `.git` or `.env` directories via incorrect location blocks. |
| **Git & GitHub CLI** | `git --version`, `gh --version` | **CVE-2024-32002** (RCE during `git clone --recursive` via malicious submodules with case-insensitive Windows path traversal). Patch Git to $\ge 2.45.1$. |
| **Browsers (Chrome/Edge)** | Check registry / Settings | Zero-day V8 type confusion, WebRTC buffer overflows. Verify running stable release against the latest Chrome Release Blog. |

---

## 2. AI Agents, MCP (Model Context Protocol), and Local AI Gateways

AI coding agents and tool-calling interfaces introduce novel attack vectors including indirect prompt injection, unpinned package execution, and over-privileged host mounts.

### A. Local MCP Configuration Security
Inspect local MCP server configurations:
- **Claude Desktop**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Cursor IDE**: `%USERPROFILE%\.cursor\mcp.json`
- **VS Code / Windsurf**: Workspace-level `.vscode/mcp.json`
- **Railway CLI**: `%USERPROFILE%\.railway\config.json`

#### Critical Audit Checks:
1. **Unpinned `npx` / `uvx` Invocations**:
   - Flag entries running `npx -y <package>@latest` or `uvx <tool>`. An attacker compromising the npm/PyPI registry can execute arbitrary code on the developer's host machine.
   - *Remediation*: Pin packages to strict semantic versions (`npx -y package@1.2.3`) or use locally audited binaries.
2. **Excessive Directory Mounting**:
   - Ensure filesystem MCP servers do not mount root drives (`C:\`) or sensitive user directories (`C:\Users\<user>`, `%USERPROFILE%\.ssh`).
   - *Remediation*: Restrict MCP mounts strictly to specific project workspaces.
3. **Hardcoded API Keys in Configs**:
   - Check MCP configuration files for plaintext keys (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, database connection strings).
   - *Remediation*: Pass credentials via secure environment variables or secret vaults.

### B. Local AI Gateways & Daemon Binding
Developers frequently run local LLM proxies (LiteLLM, Ollama, LM Studio, vLLM).

- **Ollama**: Default port `11434`
- **LiteLLM**: Default port `4000`
- **LocalAI / Text-Gen**: Default port `8080` / `5000`

#### Security Invariant:
Verify via `Get-NetTCPConnection` that these daemons bind **strictly to loopback (`127.0.0.1` / `::1`)**:
```powershell
Get-NetTCPConnection -LocalPort 4000, 11434, 8080 -ErrorAction SilentlyContinue | Select-Object LocalAddress, LocalPort, State, OwningProcess
```
> [!CAUTION]
> If any local AI daemon binds to `0.0.0.0`, any device on the local network (LAN/Wi-Fi) can issue unauthenticated inference calls, extract embeddings, or potentially trigger local server-side request forgery (SSRF) and file read vulnerabilities.

---

## 3. Webroot & Webshell Scanning ("PHP2Shell" / "Node2Shell")

The colloquial terms "PHP2Shell" or "Node2Shell" refer to webshells or reverse shells dropped into local web directories (e.g. `C:\xampp\htdocs` or project folders).

When scanning projects with `-WebRoot`:
- Flag files containing obfuscated execution wrappers: `eval(base64_decode(...))`, `assert($_POST[...])`, `system($_GET[...])`, `passthru(...)`, `shell_exec(...)`.
- For Node.js projects, flag dynamic child process spawns with unvalidated socket payloads: `require('child_process').exec(socket.read())`.
