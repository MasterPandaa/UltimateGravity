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
$cleanConvId = ($ConversationId -replace '[^a-zA-Z0-9_-]', '')
if (-not $cleanConvId) { $cleanConvId = "default-session" }
$sessionDir = Join-Path $SNAPSHOT_ROOT $cleanConvId

if (-not (Test-Path $sessionDir)) {
    New-Item -ItemType Directory -Path $sessionDir -Force | Out-Null
}

$stateFileJson = Join-Path $sessionDir "session-env.json"
$historyLog    = Join-Path $sessionDir "command-history.log"

# 1. Restore previous state safely from JSON (immune to injection)
if (Test-Path $stateFileJson) {
    try {
        $saved = Get-Content $stateFileJson -Raw | ConvertFrom-Json
        if ($saved.cwd -and (Test-Path -LiteralPath $saved.cwd)) {
            Set-Location -LiteralPath $saved.cwd
        }
        if ($saved.env) {
            foreach ($prop in $saved.env.PSObject.Properties) {
                [System.Environment]::SetEnvironmentVariable($prop.Name, [string]$prop.Value, 'Process')
            }
        }
    } catch {
        Write-Warning "Failed to restore previous state from session-env.json: $_"
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
    # Compute environment deltas (with sensitive token/credential filter)
    $secretFilter = '(?i)(KEY|TOKEN|SECRET|PASSWORD|AUTH|CREDENTIAL|PRIVATE|JWT|BEARER|OPENAI|SUPABASE)'
    $envDeltas = @{}
    Get-ChildItem env: | ForEach-Object {
        $name = $_.Name
        $val = $_.Value
        if ($name -notmatch $secretFilter) {
            if (-not $initialEnv.ContainsKey($name) -or ($initialEnv[$name] -ne $val)) {
                $envDeltas[$name] = $val
            }
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
        conversationId = $cleanConvId
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

    # Clean up legacy session-init.ps1 if lingering
    $legacyPs1 = Join-Path $sessionDir "session-init.ps1"
    if (Test-Path $legacyPs1) {
        Remove-Item -Path $legacyPs1 -Force -ErrorAction SilentlyContinue
    }

    Add-Content -Path $historyLog -Value "[$((Get-Date).ToString('yyyy-MM-ddTHH:mm:ss.fffZ'))] [END] exitCode=$exitCode cwd=$finalLocation modifiedEnv=$($envDeltas.Keys -join ',')" -Encoding UTF8
}

exit $exitCode
