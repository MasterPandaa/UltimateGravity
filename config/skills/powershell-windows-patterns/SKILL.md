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

### 3. Safe UTF-8 File Reading & Writing
Always specify `-Encoding utf8` to prevent Windows ANSI / Windows-1252 corruption:
```powershell
# Reading:
$content = Get-Content -Path "config.json" -Raw -Encoding utf8

# Writing:
$jsonString | Set-Content -Path "output.json" -Encoding utf8
```
