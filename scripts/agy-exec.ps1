<#
.SYNOPSIS
    Antigravity Persistent Shell Execution Engine (agy-exec)
.DESCRIPTION
    Executes PowerShell commands while preserving Working Directory, Environment Variables, 
    Virtualenvs, and Shell State across separate command executions (similar to Qoder's shell-snapshots).
.EXAMPLE
    agy-exec "cd C:\Users; $env:MY_FLAG = 'active'"
    agy-exec "pwd; echo $env:MY_FLAG" # Preserves C:\Users and 'active'!
#>
[CmdletBinding()]
param (
    [Parameter(Position=0, ValueFromRemainingArguments=$true)]
    [string[]]$CommandArgs,

    [string]$ConversationId = "default-session",

    [switch]$NoPersist
)

$Command = ($CommandArgs -join ' ')
if (-not $Command) {
    Write-Error "No command specified for agy-exec."
    exit 1
}

$SNAPSHOT_ROOT = "C:\Users\Luthfi\.gemini\antigravity\shell-snapshots"
$sessionDir = Join-Path $SNAPSHOT_ROOT $ConversationId

if (-not (Test-Path $sessionDir)) {
    New-Item -ItemType Directory -Path $sessionDir -Force | Out-Null
}

$stateFilePs1  = Join-Path $sessionDir "session-init.ps1"
$stateFileJson = Join-Path $sessionDir "session-env.json"
$historyLog    = Join-Path $sessionDir "command-history.log"

# 1. Restore previous state if available
if (Test-Path $stateFilePs1) {
    try {
        . $stateFilePs1
    } catch {
        Write-Warning "Failed to load previous session-init.ps1: $_"
    }
}

# 2. Record pre-execution baseline
$initialLocation = (Get-Location).Path
$initialEnv = @{}
Get-ChildItem env: | ForEach-Object { $initialEnv[$_.Name] = $_.Value }

# 3. Log command
$timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
Add-Content -Path $historyLog -Value "[$timestamp] [START] cwd=$initialLocation | cmd=$Command" -Encoding UTF8

# 4. Execute the command
$commandSuccess = $true
$exitCode = 0
try {
    Invoke-Expression $Command
    if ($LASTEXITCODE -ne $null) {
        $exitCode = $LASTEXITCODE
    }
} catch {
    $commandSuccess = $false
    $exitCode = 1
    Write-Error $_
}

# 5. Detect and save state mutations (unless -NoPersist is specified)
if (-not $NoPersist) {
    $finalLocation = (Get-Location).Path

    # Find new or modified environment variables
    $envDeltas = @{}
    Get-ChildItem env: | ForEach-Object {
        $name = $_.Name
        $val = $_.Value
        if (-not $initialEnv.ContainsKey($name) -or ($initialEnv[$name] -ne $val)) {
            $envDeltas[$name] = $val
        }
    }

    # Find removed environment variables
    $removedEnv = @()
    foreach ($k in $initialEnv.Keys) {
        if (-not (Test-Path "env:$k")) {
            $removedEnv += $k
        }
    }

    # Read existing JSON state if present
    $persistedState = @{
        conversationId = $ConversationId
        cwd = $finalLocation
        updatedAt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        env = @{}
    }

    if (Test-Path $stateFileJson) {
        try {
            $existing = Get-Content $stateFileJson -Raw | ConvertFrom-Json
            if ($existing.env) {
                foreach ($prop in $existing.env.PSObject.Properties) {
                    $persistedState.env[$prop.Name] = $prop.Value
                }
            }
        } catch {}
    }

    # Apply deltas to persisted state
    $persistedState.cwd = $finalLocation
    foreach ($k in $envDeltas.Keys) {
        $persistedState.env[$k] = $envDeltas[$k]
    }
    foreach ($k in $removedEnv) {
        if ($persistedState.env.ContainsKey($k)) {
            $persistedState.env.Remove($k)
        }
    }

    # Save JSON state
    $persistedState | ConvertTo-Json -Depth 5 | Set-Content -Path $stateFileJson -Encoding UTF8

    # Generate session-init.ps1 for fast dot-sourcing in next turn
    $initLines = @(
        "# Antigravity Shell Snapshot Init",
        "# Generated at: $($persistedState.updatedAt)",
        "Set-Location `"$($finalLocation.Replace('`"', '```"'))`""
    )

    foreach ($k in $persistedState.env.Keys) {
        $escapedVal = $persistedState.env[$k].Replace('`', '``').Replace('"', '`"')
        $initLines += "`$env:$k = `"$escapedVal`""
    }

    $initLines | Set-Content -Path $stateFilePs1 -Encoding UTF8
    Add-Content -Path $historyLog -Value "[$((Get-Date).ToString('yyyy-MM-ddTHH:mm:ss.fffZ'))] [END] exitCode=$exitCode cwd=$finalLocation modifiedEnv=$($envDeltas.Keys -join ',')" -Encoding UTF8
}

exit $exitCode
