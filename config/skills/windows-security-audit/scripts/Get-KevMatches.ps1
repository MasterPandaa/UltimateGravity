#Requires -Version 5.1
<#
.SYNOPSIS
  Correlates installed Windows software against the CISA Known Exploited Vulnerabilities (KEV) catalog.

.DESCRIPTION
  Downloads the official public JSON feed from CISA (cisa.gov) and matches installed application
  names and display versions locally. Does not transmit any telemetry externally.

.PARAMETER Years
  Year threshold for dateAdded (default is 3 years).
.PARAMETER OutFile
  Optional path to export findings as CSV.
#>
[CmdletBinding()]
param(
    [int]$Years = 3,
    [string]$OutFile
)

$ErrorActionPreference = 'Stop'
$url = 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json'

try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Write-Host "[*] Fetching CISA KEV Feed from cisa.gov..." -ForegroundColor Cyan
    $kev = Invoke-RestMethod -Uri $url -TimeoutSec 60
} catch {
    Write-Host "[!] Failed to fetch CISA KEV: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Manual catalog available at: https://www.cisa.gov/known-exploited-vulnerabilities-catalog"
    exit 1
}

$cut = (Get-Date).AddYears(-$Years)
$keys = @(
    'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*',
    'HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*',
    'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*'
)
$apps = @(Get-ItemProperty -Path $keys -ErrorAction SilentlyContinue | Where-Object { $_.DisplayName } | Select-Object DisplayName, DisplayVersion -Unique)

# Alias map: CISA KEV uses component names; installed software uses product names.
$alias = @{
    'chromium'   = @('Chrome', 'Edge', 'Brave', 'Opera', 'Vivaldi')
    'webkit'     = @('Safari', 'iTunes')
    'win32k'     = @()
    'internet explorer' = @()
}

$kevHits = New-Object System.Collections.ArrayList
$recentWindows = New-Object System.Collections.ArrayList

foreach ($v in $kev.vulnerabilities) {
    $added = [datetime]$v.dateAdded
    if ($added -lt $cut) { continue }
    $product = [string]$v.product
    $vendor = [string]$v.vendorProject

    if ($vendor -eq 'Microsoft' -and $product -match '^(Windows|Win32k|Windows .*)$') {
        if ($added -gt (Get-Date).AddDays(-90)) { [void]$recentWindows.Add($v) }
        continue
    }
    $candidates = @($product)
    foreach ($k in $alias.Keys) {
        if ($product.ToLower().StartsWith($k)) {
            $candidates += $alias[$k]
        }
    }

    foreach ($c in $candidates) {
        if (-not $c -or $c.Length -lt 4) { continue }
        $hit = $apps | Where-Object { $_.DisplayName.IndexOf($c, [StringComparison]::OrdinalIgnoreCase) -ge 0 } | Select-Object -First 1
        if ($hit) {
            [void]$kevHits.Add([pscustomobject]@{
                DateAdded      = $v.dateAdded
                CVE            = $v.cveID
                Installed      = ($hit.DisplayName + ' ' + $hit.DisplayVersion)
                KevProduct     = ($vendor + ' ' + $product)
                Name           = $v.vulnerabilityName
                RansomwareUse  = $v.knownRansomwareCampaignUse
                RequiredAction = $v.requiredAction
            })
            break
        }
    }
}

Write-Host "`n=== CISA KEV MATCHES ON INSTALLED SOFTWARE ($($kevHits.Count)) ===" -ForegroundColor Yellow
if ($kevHits.Count -eq 0) {
    Write-Host "[+] Zero known exploited vulnerabilities matched installed software inventory." -ForegroundColor Green
} else {
    $kevHits | Format-Table DateAdded, CVE, Installed, RansomwareUse -AutoSize
}

if ($recentWindows.Count -gt 0) {
    Write-Host "`n[*] Recent Windows OS KEV entries (<90 days, verify patch level): $($recentWindows.Count) CVEs" -ForegroundColor Cyan
    $recentWindows | Select-Object -First 5 | Format-Table dateAdded, cveID, vulnerabilityName -AutoSize
}

if ($OutFile) {
    $kevHits | Export-Csv -NoTypeInformation -Path $OutFile -Encoding utf8
    Write-Host "[+] Exported KEV findings to: $OutFile" -ForegroundColor Green
}
