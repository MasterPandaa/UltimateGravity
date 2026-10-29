<#
.SYNOPSIS
    Antigravity File Rewind PowerShell Wrapper
.DESCRIPTION
    Quick CLI to list, inspect, and rewind file versions captured automatically before mutations.
.EXAMPLE
    file-rewind list
    file-rewind history path/to/file.ts
    file-rewind restore path/to/file.ts 1
    file-rewind undo-last
#>
param (
    [Parameter(Position=0)]
    [string]$Command = "list",

    [Parameter(Position=1)]
    [string]$TargetFile,

    [Parameter(Position=2)]
    [string]$Version,

    [Parameter(Position=3)]
    [string]$ConversationId
)

$scriptPath = "C:\Users\Luthfi\.gemini\scripts\file-rewind.js"
if (-not (Test-Path $scriptPath)) {
    Write-Error "file-rewind.js not found at $scriptPath"
    exit 1
}

$nodeArgs = @($scriptPath, $Command)
if ($TargetFile) { $nodeArgs += $TargetFile }
if ($Version) { $nodeArgs += $Version }
if ($ConversationId) { $nodeArgs += $ConversationId }

& node $nodeArgs
