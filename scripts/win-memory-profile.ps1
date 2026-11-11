<#
.SYNOPSIS
    Windows Host Memory & Process Profile Analyzer for Antigravity Security Sentinel.
.DESCRIPTION
    Analyzes process memory usage (Working Set, Private Bytes), handle counts, and
    identifies runaway or orphaned background developer processes (node, python, chrome, git).
    Supports delta sampling to detect active memory leaks over time.
.PARAMETER Top
    Number of top memory-consuming processes to display. Default is 15.
.PARAMETER FilterName
    Filter processes matching a name pattern (e.g. 'node', 'python', 'chrome').
.PARAMETER DetectOrphans
    Inspect and flag lingering/orphaned developer processes.
.PARAMETER SampleCount
    Number of samples for leak growth detection. Default is 1 (instant snapshot).
.PARAMETER IntervalSeconds
    Interval in seconds between samples when SampleCount > 1. Default is 2.
.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\win-memory-profile.ps1 -Top 10
    powershell -ExecutionPolicy Bypass -File .\win-memory-profile.ps1 -DetectOrphans
    powershell -ExecutionPolicy Bypass -File .\win-memory-profile.ps1 -FilterName node -SampleCount 3 -IntervalSeconds 2
#>

[CmdletBinding()]
param (
    [int]$Top = 15,
    [string]$FilterName = $null,
    [switch]$DetectOrphans,
    [int]$SampleCount = 1,
    [int]$IntervalSeconds = 2
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Format-BytesToMB([double]$bytes) {
    return [Math]::Round($bytes / 1MB, 2)
}

function Get-ProcessMetrics {
    param([string]$NameFilter = $null)

    $processes = if ($NameFilter) {
        Get-Process -Name "*$NameFilter*" -ErrorAction SilentlyContinue
    } else {
        Get-Process -ErrorAction SilentlyContinue
    }

    $results = @()
    foreach ($p in $processes) {
        try {
            $ws = Format-BytesToMB $p.WorkingSet64
            $pm = Format-BytesToMB $p.PrivateMemorySize64
            $handles = $p.HandleCount
            $cpu = if ($p.CPU) { [Math]::Round($p.CPU, 2) } else { 0 }

            $results += [PSCustomObject]@{
                Id          = $p.Id
                ProcessName = $p.ProcessName
                WorkingSetMB = $ws
                PrivateMB   = $pm
                Handles     = $handles
                CPUSec      = $cpu
                StartTime   = try { $p.StartTime.ToString("yyyy-MM-dd HH:mm:ss") } catch { "N/A" }
            }
        } catch {
            # Skip inaccessible system processes
        }
    }
    return $results
}

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  ANTIGRAVITY SYSTEM SECURITY SENTINEL: WINDOWS MEMORY PROFILER  " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "Timestamp : $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "Host OS   : $([System.Environment]::OSVersion.VersionString)"
Write-Host "Target    : $(if ($FilterName) { "Filtered by '$FilterName'" } else { "All System Processes" })"
Write-Host ""

if ($DetectOrphans) {
    Write-Host "[*] Auditing Lingering / Orphan Developer Daemons..." -ForegroundColor Yellow
    $orphanTargets = @("node", "python", "chrome", "msedge", "git", "playwright")
    $foundOrphans = @()

    foreach ($t in $orphanTargets) {
        $procs = @(Get-ProcessMetrics -NameFilter $t)
        if ($procs.Count -gt 0) {
            $foundOrphans += $procs
        }
    }

    if ($foundOrphans.Count -eq 0) {
        Write-Host "[+] Zero orphaned developer daemons detected. Clean state." -ForegroundColor Green
    } else {
        Write-Host "[!] Found $($foundOrphans.Count) developer process instances running:" -ForegroundColor Red
        $foundOrphans | Sort-Object -Property PrivateMB -Descending | Format-Table -Property Id, ProcessName, PrivateMB, WorkingSetMB, Handles, StartTime -AutoSize
    }
    Write-Host ""
}

if ($SampleCount -gt 1) {
    Write-Host "[*] Commencing Delta Growth Sampling ($SampleCount samples @ ${IntervalSeconds}s intervals)..." -ForegroundColor Yellow
    $baseline = @{}
    (Get-ProcessMetrics -NameFilter $FilterName) | ForEach-Object { $baseline[$_.Id] = $_ }

    for ($i = 2; $i -le $SampleCount; $i++) {
        Start-Sleep -Seconds $IntervalSeconds
    }

    $finalSample = Get-ProcessMetrics -NameFilter $FilterName
    $deltaReport = @()

    foreach ($curr in $finalSample) {
        if ($baseline.ContainsKey($curr.Id)) {
            $base = $baseline[$curr.Id]
            $deltaPrivate = [Math]::Round($curr.PrivateMB - $base.PrivateMB, 2)
            $deltaHandles = $curr.Handles - $base.Handles

            if ($deltaPrivate -gt 0.5 -or $deltaHandles -gt 10) {
                $deltaReport += [PSCustomObject]@{
                    Id           = $curr.Id
                    ProcessName  = $curr.ProcessName
                    PrivateMB    = $curr.PrivateMB
                    PrivateDelta = "+$deltaPrivate MB"
                    Handles      = $curr.Handles
                    HandleDelta  = "+$deltaHandles"
                }
            }
        }
    }

    if ($deltaReport.Count -eq 0) {
        Write-Host "[+] Zero continuous memory leaks or handle bloat detected across sample window." -ForegroundColor Green
    } else {
        Write-Host "[!] POTENTIAL MEMORY/HANDLE LEAK DETECTED:" -ForegroundColor Red
        $deltaReport | Sort-Object -Property PrivateMB -Descending | Format-Table -AutoSize
    }
} else {
    Write-Host "[*] Top $Top Processes by Private Bytes (Memory Footprint):" -ForegroundColor Green
    $topMemory = (Get-ProcessMetrics -NameFilter $FilterName) | Sort-Object -Property PrivateMB -Descending | Select-Object -First $Top
    $topMemory | Format-Table -Property Id, ProcessName, PrivateMB, WorkingSetMB, Handles, CPUSec -AutoSize
}

Write-Host "=================================================================" -ForegroundColor Cyan
