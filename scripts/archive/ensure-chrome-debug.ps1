<#
.SYNOPSIS
    Automated Chrome Remote Debugging Controller for AI Agents (Antigravity)
.DESCRIPTION
    Ensures Google Chrome is actively listening on port 9222 for Chrome DevTools MCP,
    OpenBrowser, and Playwright workflows. If port 9222 is closed, launches Chrome
    cleanly in background/headless mode with dedicated profile isolation.
#>

param(
    [int]$Port = 9222,
    [string]$ProfileDir = "C:\Users\Luthfi\.chrome-debug-profile",
    [switch]$Visible = $false
)

$ErrorActionPreference = "Stop"

function Test-ChromeDebugPort {
    param([int]$CheckPort)
    try {
        $res = Invoke-RestMethod -Uri "http://127.0.0.1:$CheckPort/json/version" -TimeoutSec 1 -ErrorAction Stop
        if ($res.Browser) {
            return $true
        }
        return $false
    } catch {
        return $false
    }
}

if (Test-ChromeDebugPort -CheckPort $Port) {
    Write-Output "[OK] Chrome Remote Debugging is already running on port $Port."
    exit 0
}

# Locate Chrome executable
$chromePaths = @(
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
)

$chromeExe = $null
foreach ($path in $chromePaths) {
    if (Test-Path $path) {
        $chromeExe = $path
        break
    }
}

if (-not $chromeExe) {
    Write-Error "Google Chrome executable not found on standard paths."
    exit 1
}

if (-not (Test-Path $ProfileDir)) {
    New-Item -ItemType Directory -Path $ProfileDir -Force | Out-Null
}

$argList = @(
    "--remote-debugging-port=$Port",
    "--remote-allow-origins=*",
    "--user-data-dir=`"$ProfileDir`"",
    "--no-first-run",
    "--no-default-browser-check"
)

if (-not $Visible) {
    $argList += "--headless=new"
    $argList += "--disable-gpu"
    $argList += "--no-sandbox"
}

Write-Output "[INFO] Spawning background Chrome instance on port $Port..."
Start-Process -FilePath $chromeExe -ArgumentList ($argList -join " ") -WindowStyle Hidden

# Verify within 5 seconds
$ready = $false
for ($i = 0; $i -lt 10; $i++) {
    Start-Sleep -Milliseconds 500
    if (Test-ChromeDebugPort -CheckPort $Port) {
        $ready = $true
        break
    }
}

if ($ready) {
    Write-Output "[SUCCESS] Chrome Remote Debugging active and listening on http://127.0.0.1:$Port."
    exit 0
} else {
    Write-Error "Chrome started but remote debugging port $Port did not respond."
    exit 1
}
