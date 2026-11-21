---
name: powershell-windows-patterns
description: "[Native Windows PowerShell Engineering] Object pipeline scripting, safe parameter escaping, path normalization, and non-blocking background jobs on Windows. DO NOT USE for cross-platform Bash scripting."
---

# PowerShell Windows Patterns

The definitive Windows PowerShell engineering and system interaction suite for autonomous AI coding agents. Designed to prevent command-line quoting errors, pipeline serialization failures, execution policy traps, and path delimiter bugs when interacting with Windows native environments.

---

## Non-Negotiable Windows Core Rules & Quoting Gates

### 1. The Literal String & Escaping Gate
- **Never Mix Bash Escaping in PowerShell**: Windows PowerShell does not use backslash `\` as an escape character; it uses the backtick `` ` ``.
  ```powershell
  # CORRECT:
  Write-Host "Value: `$variable"
  # INCORRECT (Bash style):
  Write-Host "Value: \$variable"
  ```
- **Forward Slash Normalization**: Always use forward slashes `/` for cross-platform file paths and Node.js/Python scripts, even on Windows (`src/components/App.tsx`). When invoking native Windows executables requiring drive paths, use `Join-Path` or double quotes around full paths: `"C:/Users/Luthfi/..."`.

### 2. Standard Streams & Pipeline Object Discipline
- **Text vs Object Streams**: PowerShell pipelines pass rich .NET objects, not raw text strings. When outputting for tools or external CLIs, pipe through `Out-String` or format cleanly:
  ```powershell
  Get-ChildItem -Path . | Select-Object -ExpandProperty Name
  ```
- **Process Exit Code Checking**: After running external binaries, never assume success without inspecting `$LASTEXITCODE`:
  ```powershell
  & git status
  if ($LASTEXITCODE -ne 0) { throw "Git command failed with exit code $LASTEXITCODE" }
  ```

---

## Operating Modes

| Mode | Domain | Primary Focus | PowerShell Commands / Idioms |
|---|---|---|---|
| **Mode 1: Non-Blocking Background Jobs** | Async process management | Spawning, polling, and receiving output from background tasks without blocking. | `Start-Job`, `Get-Job`, `Receive-Job`, `Stop-Job` |
| **Mode 2: Path & Filesystem Navigation** | File and folder manipulation | Safe path resolution, UTF-8 file reads/writes, and recursive search without hanging. | `Test-Path`, `Join-Path`, `Get-ChildItem -Filter`, `Resolve-Path` |
| **Mode 3: External Binary & Tool Invocation** | Command execution & quoting | Using call operator `&`, passing arrays of arguments, escaping double-quotes safely. | `& $exe @arguments`, `Start-Process -NoNewWindow` |
| **Mode 4: System Telemetry & Process Control** | Monitoring & resource limits | Inspecting running processes, CPU/memory consumption, and terminating hung tasks. | `Get-Process`, `Stop-Process -Force`, `Measure-Command` |

---

## Standard Patterns & Reference Implementation

### 1. Robust Argument Array Invocation (No Quoting Bugs)
Never concatenate commands as fragile strings. Use PowerShell splatting or argument arrays:
```powershell
$gitArgs = @("commit", "-m", "fix: resolve race condition in auth handler")
& git @gitArgs
if ($LASTEXITCODE -ne 0) {
    Write-Error "Git commit failed."
}
```

### 2. Background Task Execution Pattern
```powershell
# Spawn job cleanly with argument isolation
$job = Start-Job -ScriptBlock {
    param($workingDir, $logFile)
    Set-Location $workingDir
    npm test *>&1 | Out-File -FilePath $logFile -Encoding utf8
} -ArgumentList (Get-Location).Path, "task.log"

# Poll status without spinning
Wait-Job -Id $job.Id -Timeout 60
$output = Receive-Job -Id $job.Id
Remove-Job -Id $job.Id
```

### 3. Safe UTF-8 (No-BOM) File Writing & Reading
> [!WARNING]
> In Windows PowerShell 5.1, `Set-Content -Encoding utf8` and `Out-File -Encoding utf8` prepend a 3-byte Byte Order Mark (BOM: `EF BB BF`). Strict JSON parsers (`JSON.parse`), YAML frontmatter parsers, and Electron runtimes will crash with `Unexpected token` or fail to detect `---`.
> **Always write UTF-8 without BOM** for machine-consumed configs, JSON, YAML, and source code:

```powershell
# Reading (safe in PS 5.1 & PS 7+):
$content = Get-Content -Path "config.json" -Raw -Encoding utf8

# Writing WITHOUT BOM (Universal .NET No-BOM UTF-8 standard):
$noBomUtf8 = [System.Text.UTF8Encoding]::new($false)
[System.IO.File]::WriteAllText($filePath, $content, $noBomUtf8)
```

### 4. Cross-Platform ZIP Archiving (Forward Slash Invariant)
> [!WARNING]
> In Windows PowerShell 5.1, `Compress-Archive` stores directory separators as Windows backslashes (`\`), producing invalid ZIP entries like `agents\Data Engineer.md` instead of standard `agents/Data Engineer.md`. Package loaders (e.g. Qoder, VS Code extensions, npm tarballs) fail to resolve root manifests like `.qoder-plugin/plugin.json`.
> **Always normalize ZIP entry paths to forward slashes (`/`)** using .NET `ZipFile` or Python:

```powershell
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($sourceDir, $zipPath)
```

### 5. High-Performance Text & Code Search (ripgrep / rg)
### 4. High-Performance Text & Code Search (ripgrep / rg)
For rapid codebase scanning across directories, use the native Rust binary `rg.exe` (globally available in `C:/Users/Luthfi/.gemini/antigravity/bin`):
```powershell
# Fast case-insensitive search (auto-ignores .git, node_modules, and binaries):
rg -i "search_pattern" ./src

# Search specific file extensions:
rg "useState" -g "*.tsx" -g "*.ts" ./src

# Return only matching file paths:
rg -l "target_export" ./src
```
*Rule of thumb*: Use `rg` for instant sub-second text/regex searching across codebases; use `Select-String` only when integrating directly into pure in-memory .NET object pipelines.