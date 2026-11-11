#Requires -Version 5.1
<#
.SYNOPSIS
  Windows Security Audit - Industrial-Grade Comprehensive READ-ONLY Baseline Collector.

.DESCRIPTION
  Collects security configuration and threat telemetry across Windows OS, Microsoft Defender,
  Memory Integrity (HVCI), LSA Protection, BitLocker, Persistence, Network Sockets, Root CAs,
  Developer Stack, and Modern AI Agent / MCP Configurations.
    - READ-ONLY: Does NOT alter settings, kill processes, delete files, or install anything.
    - LOCAL: Does NOT transmit data outside this machine (Zero network egress).
    - EXPORTS: Writes structured telemetry to -OutDir (audit.json + findings.csv).

.PARAMETER OutDir
  Output directory for structured audit artifacts (default: Desktop\WinSecAudit_<timestamp>).
.PARAMETER Quick
  Fast audit mode (skips slow operations: deep Authenticode checks, 5s CPU sampling, browser extension manifests).
.PARAMETER WebRoot
  Optional web project path(s) to scan for webshell patterns and exposed credentials (.env).
#>
[CmdletBinding()]
param(
    [string]$OutDir = (Join-Path $env:USERPROFILE ("Desktop\WinSecAudit_" + (Get-Date -Format 'yyyyMMdd_HHmmss'))),
    [switch]$Quick,
    [string[]]$WebRoot
)

$ErrorActionPreference = 'SilentlyContinue'
$script:IsAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
$script:Findings = New-Object System.Collections.ArrayList
$script:Data = [ordered]@{}
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

# Common Living-off-the-Land (LOLBin) & Fileless Command Patterns
$script:SuspCmd = '(?i)(\s-e(nc|ncodedcommand)?\s+[A-Za-z0-9+/=]{20,}|FromBase64String|\bIEX\b|Invoke-Expression|DownloadString|DownloadFile|Invoke-WebRequest.*\|\s*iex|mshta(\.exe)?\s|wscript(\.exe)?\s.*\.(js|vbs)|regsvr32.*(/i:|scrobj)|rundll32.*(javascript:|https?:)|bitsadmin.*/transfer|certutil.*-(urlcache|decode)|-w(indowstyle)?\s+hidden|curl.*\|\s*(sh|bash|powershell))'

function Add-Finding {
    param(
        [string]$Area,
        [ValidateSet('Critical','High','Medium','Low','Info')][string]$Severity,
        [string]$Title,
        [string]$Evidence = '',
        [string]$Suggestion = ''
    )
    [void]$script:Findings.Add([pscustomobject]@{
        Area        = $Area
        Severity    = $Severity
        Title       = $Title
        Evidence    = $Evidence
        Suggestion  = $Suggestion
    })
}

function Invoke-Section {
    param([string]$Name, [scriptblock]$Code)
    Write-Host ("[*] " + $Name) -ForegroundColor Cyan
    try {
        $script:Data[$Name] = & $Code
    } catch {
        $script:Data[$Name] = @{ error = $_.Exception.Message }
        Add-Finding $Name 'Info' 'Section execution failed' $_.Exception.Message 'Rerun PowerShell as Administrator or inspect manually.'
    }
}

function Get-RegValue {
    param([string]$Path, [string]$Name)
    try { (Get-ItemProperty -LiteralPath $Path -Name $Name -ErrorAction Stop).$Name } catch { $null }
}

function Test-UserWritable {
    param([string]$Path)
    if (-not $Path) { return $false }
    if ($Path -match '(?i)\\Microsoft\\Windows Defender\\|\\WindowsApps\\') { return $false }
    return ($Path -match '(?i)\\(AppData|Temp|Downloads|Users\\Public|ProgramData|\$Recycle\.Bin)\\')
}

function Get-Short {
    param([string]$Text, [int]$Max = 300)
    if (-not $Text) { return '' }
    $t = ($Text -replace '\s+', ' ').Trim()
    if ($t.Length -gt $Max) { $t.Substring(0, $Max) + '...' } else { $t }
}

if (-not $script:IsAdmin) {
    Add-Finding 'Audit' 'Info' 'Script running without Administrator privileges' 'Certain checks (BitLocker, Security EventLogs, SMB) will be incomplete.' 'Rerun PowerShell with "Run as administrator" for comprehensive coverage.'
}

# ------------------------------------------------------------------ 1. SYSTEM & PATCHING
Invoke-Section 'System' {
    $os = Get-CimInstance Win32_OperatingSystem
    $cv = 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion'
    $build = [int]$os.BuildNumber
    $hot = Get-HotFix | Where-Object { $_.InstalledOn } | Sort-Object InstalledOn -Descending | Select-Object -First 5
    $last = ($hot | Select-Object -First 1).InstalledOn

    if ($build -lt 22000) {
        Add-Finding 'Patching' 'High' 'Windows 10 has passed End-of-Life (October 14, 2025)' ("Build $build") 'Upgrade to Windows 11 or enroll in ESU to receive ongoing security patches.'
    }
    if ($last -and ((Get-Date) - $last).Days -gt 45) {
        Add-Finding 'Patching' 'High' 'Latest Windows Hotfix older than 45 days' ("Last hotfix: " + $last.ToString('yyyy-MM-dd')) 'Run Windows Update to ensure latest Patch Tuesday security fixes are installed.'
    }
    $up = (Get-Date) - $os.LastBootUpTime
    if ($up.Days -gt 30) {
        Add-Finding 'Patching' 'Low' 'System Uptime > 30 days (pending reboot for patches)' ("Uptime: " + $up.Days + " days") 'Reboot workstation to finalize security updates.'
    }

    [pscustomobject]@{
        Caption        = $os.Caption
        Version        = $os.Version
        Build          = $build
        DisplayVersion = (Get-RegValue $cv 'DisplayVersion')
        UBR            = (Get-RegValue $cv 'UBR')
        InstallDate    = $os.InstallDate.ToString('s')
        LastBoot       = $os.LastBootUpTime.ToString('s')
        RecentHotfix   = @($hot | ForEach-Object { $_.HotFixID + ' ' + $_.InstalledOn.ToString('yyyy-MM-dd') })
        Computer       = $env:COMPUTERNAME
        User           = $env:USERNAME
        IsAdmin        = $script:IsAdmin
    }
}

# ------------------------------------------------------------------ 2. DEFENDER & ASR
$script:AsrMap = @{
    '56a863a9-875e-4185-98a7-b882c64b5ce5' = 'Block abuse of exploited vulnerable signed drivers (BYOVD)'
    '9e6c4e1f-7d60-472f-ba1a-a39ef669e4b2' = 'Block credential stealing from Windows LSASS'
    'be9ba2d9-53ea-4cdc-84e5-9b1eeee46550' = 'Block executable content from email client and webmail'
    '5beb7efe-fd9a-4556-801d-275e5ffc04cc' = 'Block obfuscated scripts'
    'd3e037e1-3eb8-44c8-a917-57927947596d' = 'Block JS/VBS from launching downloaded executable content'
    '3b576869-a4ec-4529-8536-b80a7769e899' = 'Block Office applications from creating executable content'
    'd4f940ab-401b-4efc-aadc-ad5f3c50688a' = 'Block all Office applications from creating child processes'
    '75668c1f-73b5-4cf0-bb93-3ecf5cb7cc84' = 'Block Office applications from injecting code into other processes'
    '92e97fa1-2edf-4476-bdd6-9dd0b4dddc7b' = 'Block Win32 API calls from Office macros'
    'c1db55ab-c21a-4637-bb3f-a12568109d35' = 'Use advanced protection against ransomware'
    'e6db77e5-3df2-4cf1-b95a-636979351e5b' = 'Block persistence through WMI event subscription'
    'd1e49aac-8f56-4280-b9ba-993a6d77406c' = 'Block process creations originating from PSExec and WMI'
    'b2b3f03d-6a65-4f7b-a9c7-1c7ef74a9ba4' = 'Block untrusted and unsigned processes that run from USB'
    '01443614-cd74-433a-b99e-2ecdc07bfc25' = 'Block executable files unless they meet prevalence/age criteria'
    '7674ba52-37eb-4a4f-a9a1-f0f9a1619a2c' = 'Block Adobe Reader from creating child processes'
    'a8f5898e-1dc8-49a9-9878-85004b8a61e6' = 'Block webshell creation for Servers'
}
$script:AsrCore = @(
    '56a863a9-875e-4185-98a7-b882c64b5ce5',
    '9e6c4e1f-7d60-472f-ba1a-a39ef669e4b2',
    'be9ba2d9-53ea-4cdc-84e5-9b1eeee46550',
    '5beb7efe-fd9a-4556-801d-275e5ffc04cc',
    'd3e037e1-3eb8-44c8-a917-57927947596d',
    '3b576869-a4ec-4529-8536-b80a7769e899',
    'd4f940ab-401b-4efc-aadc-ad5f3c50688a',
    '92e97fa1-2edf-4476-bdd6-9dd0b4dddc7b',
    'c1db55ab-c21a-4637-bb3f-a12568109d35',
    'e6db77e5-3df2-4cf1-b95a-636979351e5b'
)

Invoke-Section 'Defender' {
    $st = Get-MpComputerStatus
    $pref = Get-MpPreference
    $av3 = @(Get-CimInstance -Namespace 'root/SecurityCenter2' -ClassName AntiVirusProduct | ForEach-Object { $_.displayName })

    if (-not $st) {
        Add-Finding 'Defender' 'Medium' 'Microsoft Defender status unreadable' ("Registered AV: " + ($av3 -join ', ')) 'Verify an active antivirus is running.'
    } else {
        if (-not $st.RealTimeProtectionEnabled) {
            Add-Finding 'Defender' 'High' 'Real-time Antivirus Protection is DISABLED' ("Registered AV: " + ($av3 -join ', ')) 'Enable Real-time protection immediately.'
        }
        if (-not $st.IsTamperProtected) {
            Add-Finding 'Defender' 'Medium' 'Defender Tamper Protection is DISABLED' '' 'Enable Tamper Protection in Windows Security to block malware from turning off Defender.'
        }
        if (-not $st.BehaviorMonitorEnabled) {
            Add-Finding 'Defender' 'Medium' 'Behavior Monitoring is DISABLED' '' 'Enable Behavior Monitoring.'
        }
        if ($st.AntivirusSignatureAge -gt 7) {
            Add-Finding 'Defender' 'Medium' 'Antivirus Signatures Outdated' ("Signature Age: " + $st.AntivirusSignatureAge + " days") 'Update Defender signatures via Update-MpSignature.'
        }
    }

    $excl = @()
    if ($pref) {
        foreach ($k in 'ExclusionPath','ExclusionExtension','ExclusionProcess') {
            foreach ($v in @($pref.$k)) { if ($v) { $excl += ($k + ': ' + $v) } }
        }
        if ($excl.Count -gt 0 -and ($excl -join ' ') -notmatch 'Must be an administrator') {
            Add-Finding 'Defender' 'Medium' ("Defender Exclusions Detected: " + $excl.Count) ((Get-Short ($excl -join '; ') 400)) 'Malware often adds silent exclusions. Verify all entries.'
        }
        if ($pref.PUAProtection -ne 1) {
            Add-Finding 'Defender' 'Low' 'Potentially Unwanted Application (PUA) Protection is Inactive' '' 'Enable PUA Protection via Set-MpPreference -PUAProtection Enabled.'
        }
        if ($pref.EnableNetworkProtection -ne 1) {
            Add-Finding 'Defender' 'Low' 'Network Protection is not in Block Mode' ("Current: " + $pref.EnableNetworkProtection) 'Configure Network Protection to Block (1) or Audit (2).'
        }
        if ($pref.MAPSReporting -eq 0) {
            Add-Finding 'Defender' 'Low' 'Cloud-delivered Protection (MAPS) is DISABLED' '' 'Enable Cloud protection for rapid zero-day detection.'
        }
    }

    $asr = @()
    $ids = @($pref.AttackSurfaceReductionRules_Ids); $acts = @($pref.AttackSurfaceReductionRules_Actions)
    for ($i = 0; $i -lt $ids.Count; $i++) {
        if ($ids[$i]) {
            $asr += [pscustomobject]@{
                Id     = $ids[$i]
                Name   = $script:AsrMap[$ids[$i].ToLower()]
                Action = $acts[$i]
            }
        }
    }
    $missing = @()
    foreach ($core in $script:AsrCore) {
        $hit = $asr | Where-Object { $_.Id.ToLower() -eq $core -and $_.Action -eq 1 }
        if (-not $hit) { $missing += $script:AsrMap[$core] }
    }
    if ($missing.Count -gt 0) {
        Add-Finding 'Defender' 'Low' ("Core ASR Rules Not in Block Mode: " + $missing.Count + " of " + $script:AsrCore.Count) ((Get-Short ($missing -join '; ') 500)) 'Enable ASR rules progressively: Audit first (Action 2), then Block (Action 1).'
    }

    $threats = @(Get-MpThreatDetection | Sort-Object InitialDetectionTime -Descending | Select-Object -First 15 | ForEach-Object {
        [pscustomobject]@{
            Time          = $_.InitialDetectionTime.ToString('s')
            ThreatID      = $_.ThreatID
            Resources     = (Get-Short ($_.Resources -join ',') 200)
            ActionSuccess = $_.ActionSuccess
        }
    })
    $bad = @($threats | Where-Object { $_.ActionSuccess -eq $false })
    if ($bad.Count -gt 0) {
        Add-Finding 'Defender' 'High' 'Active Malware Threat Detection FAILED Remediation' ((Get-Short ($bad | ForEach-Object { $_.Resources }) 300)) 'Run Full Scan + Microsoft Defender Offline Scan; investigate potential machine compromise.'
    }

    [pscustomobject]@{
        ThirdPartyAV     = $av3
        Status           = ($st | Select-Object AMServiceEnabled,AntivirusEnabled,RealTimeProtectionEnabled,BehaviorMonitorEnabled,IsTamperProtected,AntivirusSignatureAge)
        Exclusions       = $excl
        ASR              = $asr
        RecentDetections = $threats
    }
}

# ------------------------------------------------------------------ 3. RANSOMWARE PROTECTION
Invoke-Section 'RansomwareProtection' {
    $pref = Get-MpPreference
    $cfa = $pref.EnableControlledFolderAccess
    if ($cfa -ne 1) {
        Add-Finding 'Ransomware' 'Medium' 'Controlled Folder Access (Ransomware Guard) not in Block Mode' ("Current: $cfa (0=Off, 1=Block, 2=Audit)") 'Enable Controlled Folder Access to protect critical user directories.'
    }
    $shadows = @(Get-CimInstance Win32_ShadowCopy)
    if ($shadows.Count -eq 0) {
        Add-Finding 'Ransomware' 'Medium' 'No Volume Shadow Copies (VSS) Detected' '' 'Enable System Protection on system drives; maintain offline/immutable backups.'
    }
    $bcd = ''
    if ($script:IsAdmin) {
        $bcd = (bcdedit /enum '{current}' 2>&1 | Select-String -Pattern 'recoveryenabled|bootstatuspolicy' | ForEach-Object { $_.Line.Trim() }) -join ' | '
        if ($bcd -match '(?i)recoveryenabled\s+No' -or $bcd -match '(?i)bootstatuspolicy\s+IgnoreAllFailures') {
            Add-Finding 'Ransomware' 'High' 'Boot Recovery Settings Weakened (Ransomware/Wiper signature)' $bcd 'Restore boot recovery: bcdedit /set {current} recoveryenabled Yes.'
        }
    }
    $onedrive = [bool](Get-Process OneDrive)
    [pscustomobject]@{
        ControlledFolderAccess  = $cfa
        ProtectedFolders        = @($pref.ControlledFolderAccessProtectedFolders)
        ShadowCopies            = $shadows.Count
        BootSettings            = $bcd
        OneDriveRunning         = $onedrive
    }
}

# ------------------------------------------------------------------ 4. MEMORY INTEGRITY & BOOT
Invoke-Section 'MemoryIntegrityAndBoot' {
    $dg = Get-CimInstance -Namespace 'root\Microsoft\Windows\DeviceGuard' -ClassName Win32_DeviceGuard
    $running = @($dg.SecurityServicesRunning); $conf = @($dg.SecurityServicesConfigured)
    $vbs = $dg.VirtualizationBasedSecurityStatus
    $hvci = $running -contains 2
    $credGuard = $running -contains 1
    $hvciReg = Get-RegValue 'HKLM:\SYSTEM\CurrentControlSet\Control\DeviceGuard\Scenarios\HypervisorEnforcedCodeIntegrity' 'Enabled'

    if (-not $hvci) {
        Add-Finding 'MemoryIntegrity' 'Medium' 'Memory Integrity (HVCI) is NOT Running' ("VBS=$vbs; Registry Enabled=$hvciReg") 'Enable Core Isolation > Memory Integrity in Windows Security settings.'
    }
    if (-not $credGuard) {
        Add-Finding 'MemoryIntegrity' 'Info' 'Credential Guard is not running' '' 'Optional security feature available on Windows Enterprise/Education and Pro.'
    }
    $blk = Get-RegValue 'HKLM:\SYSTEM\CurrentControlSet\Control\CI\Config' 'VulnerableDriverBlocklistEnable'
    if ($blk -eq 0) {
        Add-Finding 'MemoryIntegrity' 'High' 'Microsoft Vulnerable Driver Blocklist is DISABLED' '' 'Enable blocklist to prevent Bring Your Own Vulnerable Driver (BYOVD) kernel exploits.'
    }
    $ppl = Get-RegValue 'HKLM:\SYSTEM\CurrentControlSet\Control\Lsa' 'RunAsPPL'
    if (-not $ppl -or $ppl -eq 0) {
        Add-Finding 'MemoryIntegrity' 'Low' 'LSA Protection (RunAsPPL) is INACTIVE' '' 'Enable RunAsPPL to prevent LSASS credential dumping (Mimikatz).'
    }
    $wd = Get-RegValue 'HKLM:\SYSTEM\CurrentControlSet\Control\SecurityProviders\WDigest' 'UseLogonCredential'
    if ($wd -eq 1) {
        Add-Finding 'MemoryIntegrity' 'High' 'WDigest plaintext password caching is ENABLED in memory' '' 'Set UseLogonCredential=0 immediately.'
    }
    $sb = $null; try { $sb = Confirm-SecureBootUEFI -ErrorAction Stop } catch { $sb = 'Not supported / Legacy BIOS' }
    if ($sb -eq $false) {
        Add-Finding 'Boot' 'High' 'Secure Boot is DISABLED' '' 'Enable Secure Boot in UEFI firmware to block bootkits.'
    }
    $tpm = Get-Tpm
    if ($tpm -and -not $tpm.TpmPresent) {
        Add-Finding 'Boot' 'Medium' 'Trusted Platform Module (TPM) not detected' '' 'Verify fTPM/PTT in BIOS settings.'
    }

    [pscustomobject]@{
        VBSStatus              = $vbs
        HVCI                   = $hvci
        CredentialGuard        = $credGuard
        VulnerableDriverBlock  = $blk
        LsaRunAsPPL            = $ppl
        WDigest                = $wd
        SecureBoot             = $sb
        TPM                    = ($tpm | Select-Object TpmPresent,TpmReady,TpmEnabled)
    }
}

# ------------------------------------------------------------------ 5. BASIC PROTECTION & ACCOUNTS
Invoke-Section 'ProtectionBasics' {
    $bl = @(Get-BitLockerVolume | Select-Object MountPoint,VolumeStatus,ProtectionStatus,EncryptionMethod)
    $osv = $bl | Where-Object { $_.MountPoint -eq ($env:SystemDrive + '\') -or $_.MountPoint -eq $env:SystemDrive }
    if ($script:IsAdmin -and $osv -and $osv.ProtectionStatus -ne 'On') {
        Add-Finding 'Encryption' 'Medium' 'System drive BitLocker / Device Encryption is INACTIVE' ("Status: " + $osv.ProtectionStatus) 'Enable BitLocker to secure data-at-rest.'
    }
    $fw = @(Get-NetFirewallProfile | Select-Object Name,Enabled,DefaultInboundAction)
    foreach ($p in $fw) {
        if (-not $p.Enabled) {
            Add-Finding 'Firewall' 'High' ("Windows Firewall Profile " + $p.Name + " is DISABLED") '' 'Enable all firewall profiles.'
        }
    }
    $uac = Get-RegValue 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System' 'EnableLUA'
    if ($uac -eq 0) {
        Add-Finding 'Accounts' 'High' 'User Account Control (UAC) is DISABLED' '' 'Enable UAC.'
    }
    $smb = $null; if ($script:IsAdmin) { $smb = Get-SmbServerConfiguration | Select-Object EnableSMB1Protocol }
    if ($smb -and $smb.EnableSMB1Protocol) {
        Add-Finding 'Network' 'High' 'Deprecated SMBv1 protocol is ENABLED' '' 'Disable SMBv1 to block WannaCry-style lateral movement.'
    }
    $rdp = Get-RegValue 'HKLM:\SYSTEM\CurrentControlSet\Control\Terminal Server' 'fDenyTSConnections'
    $nla = Get-RegValue 'HKLM:\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp' 'UserAuthentication'
    if ($rdp -eq 0) {
        $sev = 'Medium'; if ($nla -eq 0) { $sev = 'High' }
        Add-Finding 'Network' $sev 'Remote Desktop (RDP) is ENABLED' ("NLA=" + $nla) 'Disable RDP if unused; mandate Network Level Authentication (NLA) + MFA.'
    }
    $users = @(Get-LocalUser | Select-Object Name,Enabled,PasswordRequired)
    foreach ($u in $users) {
        if ($u.Name -eq 'Guest' -and $u.Enabled) {
            Add-Finding 'Accounts' 'Medium' 'Guest account is ENABLED' '' 'Disable Guest account.'
        }
        if ($u.Enabled -and -not $u.PasswordRequired) {
            Add-Finding 'Accounts' 'Medium' ("Account without password required: " + $u.Name) '' 'Enforce strong password or Windows Hello.'
        }
    }

    [pscustomobject]@{
        BitLocker   = $bl
        Firewall    = $fw
        UAC_Enabled = ($uac -ne 0)
        SMB1        = ($smb.EnableSMB1Protocol)
        RDP_Enabled = ($rdp -eq 0)
    }
}

# ------------------------------------------------------------------ 6. PRIVACY & SENSORS
Invoke-Section 'Privacy' {
    $tele = Get-RegValue 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection' 'AllowTelemetry'
    $ad = Get-RegValue 'HKCU:\Software\Microsoft\Windows\CurrentVersion\AdvertisingInfo' 'Enabled'
    if ($ad -eq 1) {
        Add-Finding 'Privacy' 'Low' 'Windows Advertising ID is ACTIVE' '' 'Disable in Settings > Privacy & security > General.'
    }
    $cap = @()
    foreach ($c in 'microphone','webcam','location') {
        $base = "HKCU:\Software\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\$c"
        foreach ($root in @($base, ($base + '\NonPackaged'))) {
            Get-ChildItem -LiteralPath $root | ForEach-Object {
                if ($_.PSChildName -eq 'NonPackaged') { return }
                $v = Get-ItemProperty -LiteralPath $_.PSPath
                if ($v.Value -eq 'Allow') {
                    $stop = [int64]$v.LastUsedTimeStop; $start = [int64]$v.LastUsedTimeStart
                    $inUse = ($start -gt 0 -and $stop -eq 0)
                    $lastUsed = ''; if ($start -gt 0) { try { $lastUsed = [DateTime]::FromFileTimeUtc($start).ToString('s') } catch { } }
                    $cap += [pscustomobject]@{ Capability = $c; App = ($_.PSChildName -replace '#', '\'); LastUsedUtc = $lastUsed; InUseNow = $inUse }
                }
            }
        }
    }
    foreach ($x in ($cap | Where-Object { $_.InUseNow })) {
        Add-Finding 'Privacy' 'Medium' ("Application actively utilizing sensor: " + $x.Capability) $x.App 'Verify this application; investigate potential spyware/RAT if unrecognized.'
    }

    [pscustomobject]@{
        TelemetryPolicy            = $tele
        AdvertisingId              = $ad
        AppsAllowedMicCamLocation  = $cap
    }
}

# ------------------------------------------------------------------ 7. PERSISTENCE (AUTORUNS, WMI, IFEO)
Invoke-Section 'Persistence' {
    $out = [ordered]@{}
    $runPaths = 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run','HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnce','HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Run','HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run','HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnce'
    $run = @()
    foreach ($p in $runPaths) {
        $k = Get-ItemProperty -LiteralPath $p
        if ($k) {
            $k.PSObject.Properties | Where-Object { $_.Name -notmatch '^PS' } | ForEach-Object {
                $run += [pscustomobject]@{ Location = $p; Name = $_.Name; Command = (Get-Short ([string]$_.Value) 400) }
            }
        }
    }
    foreach ($r in $run) {
        if ($r.Command -match $script:SuspCmd) {
            Add-Finding 'Persistence' 'High' ("Suspicious Autorun Command Detected: " + $r.Name) ($r.Location + ' => ' + $r.Command) 'Investigate immediately; quarantine if unrecognized.'
        } elseif (Test-UserWritable $r.Command) {
            Add-Finding 'Persistence' 'Low' ("Autorun executes binary from user-writable directory: " + $r.Name) $r.Command 'Verify digital signature and file provenance.'
        }
    }
    $out.RunKeys = $run

    $tasks = @(Get-ScheduledTask | Where-Object { $_.TaskPath -notlike '\Microsoft\*' -and $_.State -ne 'Disabled' } | ForEach-Object {
        $a = (@($_.Actions) | ForEach-Object { ([string]$_.Execute + ' ' + [string]$_.Arguments).Trim() }) -join ' | '
        [pscustomobject]@{ Task = ($_.TaskPath + $_.TaskName); Action = (Get-Short $a 400) }
    })
    foreach ($t in $tasks) {
        if ($t.Action -match $script:SuspCmd) {
            Add-Finding 'Persistence' 'High' ("Suspicious Scheduled Task: " + $t.Task) $t.Action 'Investigate task author and command line.'
        }
    }
    $out.ScheduledTasks = $tasks

    $wmi = @()
    foreach ($cls in '__EventFilter','CommandLineEventConsumer','ActiveScriptEventConsumer') {
        Get-CimInstance -Namespace 'root\subscription' -ClassName $cls | ForEach-Object {
            $wmi += [pscustomobject]@{ Class = $cls; Name = $_.Name; Detail = (Get-Short ([string]($_.CommandLineTemplate + $_.ScriptText + $_.Query)) 300) }
        }
    }
    $wmiBad = @($wmi | Where-Object { $_.Class -ne '__EventFilter' -and $_.Name -ne 'SCM Event Log Consumer' })
    if ($wmiBad.Count -gt 0) {
        Add-Finding 'Persistence' 'High' 'Non-Standard WMI Event Consumer Detected (Fileless persistence technique)' ((Get-Short ($wmiBad | ForEach-Object { $_.Name + ':' + $_.Detail }) 400)) 'Investigate WMI subscription payload.'
    }
    $out.WmiSubscriptions = $wmi

    $ifeo = @(Get-ChildItem 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options' | ForEach-Object {
        $d = Get-RegValue $_.PSPath 'Debugger'
        if ($d) { [pscustomobject]@{ Target = $_.PSChildName; Debugger = $d } }
    })
    if ($ifeo.Count -gt 0) {
        Add-Finding 'Persistence' 'High' 'IFEO Debugger Hook Installed (Execution Hijacking / AV Sabotage)' ((Get-Short ($ifeo | ForEach-Object { $_.Target + '=>' + $_.Debugger }) 300)) 'Investigate debugger hook targets (frequently used by debloaters or malware to hijack processes).'
    }
    $out.IFEO = $ifeo

    [pscustomobject]$out
}

# ------------------------------------------------------------------ 8. NETWORK & PROCESS FORENSICS
Invoke-Section 'NetworkAndProcesses' {
    $procs = @{}; Get-Process | ForEach-Object { $procs[[int]$_.Id] = $_ }
    $riskyPorts = @(21,23,1433,2375,3306,5432,6379,9200,11211,27017)
    $listen = @(Get-NetTCPConnection -State Listen | ForEach-Object {
        $p = $procs[[int]$_.OwningProcess]
        [pscustomobject]@{ Address = $_.LocalAddress; Port = $_.LocalPort; PID = $_.OwningProcess; Process = $p.ProcessName; Path = $p.Path }
    })
    foreach ($l in $listen) {
        $exposed = ($l.Address -eq '0.0.0.0' -or $l.Address -eq '::')
        if ($exposed -and ($riskyPorts -contains [int]$l.Port)) {
            Add-Finding 'Network' 'Medium' ("Sensitive database/service port open to 0.0.0.0: " + $l.Port) ($l.Process + ' ' + $l.Path) 'Bind service strictly to 127.0.0.1 or firewall.'
        }
        if ($exposed -and (Test-UserWritable $l.Path)) {
            Add-Finding 'Network' 'Medium' ("Process in user-writable directory listening on port " + $l.Port) ($l.Process + ' ' + $l.Path) 'Verify listening process provenance.'
        }
    }
    $miner = @(3333,4444,5555,7777,14433,14444,45700)
    $conn = @(Get-NetTCPConnection -State Established | Where-Object { $_.RemoteAddress -notmatch '^(127\.|::1|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|fe80|0\.0\.0\.0|::$)' } | Select-Object -First 300 | ForEach-Object {
        $p = $procs[[int]$_.OwningProcess]
        [pscustomobject]@{ Remote = ($_.RemoteAddress + ':' + $_.RemotePort); Process = $p.ProcessName; PID = $_.OwningProcess; Path = $p.Path }
    })
    foreach ($c in $conn) {
        $rp = [int](($c.Remote -split ':')[-1])
        if ($miner -contains $rp) {
            Add-Finding 'Cryptojacker' 'Medium' ("Outbound connection to mining pool port: " + $c.Remote) ($c.Process + ' ' + $c.Path) 'Investigate CPU usage and process origin.'
        }
        if (Test-UserWritable $c.Path) {
            Add-Finding 'Network' 'Low' ("Process in user-writable directory connected to internet: " + $c.Process) ($c.Remote + ' ' + $c.Path) 'Verify Authenticode signature.'
        }
    }

    $hosts = @(Get-Content "$env:SystemRoot\System32\drivers\etc\hosts" | Where-Object { $_ -and $_ -notmatch '^\s*#' })
    $hostsOdd = @($hosts | Where-Object { $_ -notmatch '^\s*(127\.0\.0\.1|0\.0\.0\.0|::1)\s' })
    if ($hostsOdd.Count -gt 0) {
        Add-Finding 'Network' 'Medium' 'Hosts file maps domain to non-loopback IP' ((Get-Short ($hostsOdd -join '; ') 300)) 'Inspect hosts file for DNS hijacking.'
    }

    $roots = @(Get-ChildItem 'Cert:\LocalMachine\Root' | Where-Object { $_.Subject -match "eMudhra|DO_NOT_TRUST|Fiddler|Charles|mitmproxy" -or $_.NotAfter -lt (Get-Date) } | ForEach-Object {
        [pscustomobject]@{ Subject = $_.Subject; Thumbprint = $_.Thumbprint; NotAfter = $_.NotAfter.ToString('s') }
    })
    if ($roots.Count -gt 0) {
        Add-Finding 'Adware' 'Medium' ("Untrusted, expired or distrusted Root CAs detected: " + $roots.Count) ((Get-Short ($roots | ForEach-Object { $_.Subject }) 300)) 'Review and remove untrusted root certificates.'
    }

    [pscustomobject]@{
        ListeningPorts      = $listen
        EstablishedOutbound = $conn
        HostsEntries        = $hosts
        FlaggedRootCerts    = $roots
    }
}

# ------------------------------------------------------------------ 9. SCRIPTING, LOLBINS & CONSOLE HISTORY
Invoke-Section 'ScriptingAndMacro' {
    $sbl = Get-RegValue 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging' 'EnableScriptBlockLogging'
    if ($sbl -ne 1) {
        Add-Finding 'Fileless' 'Low' 'PowerShell Script Block Logging is NOT Enabled' '' 'Enable Script Block Logging to generate Event ID 4104 telemetry.'
    }
    $runmru = @()
    $k = Get-ItemProperty -LiteralPath 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\RunMRU'
    if ($k) {
        $k.PSObject.Properties | Where-Object { $_.Name -notmatch '^(PS|MRUList)' } | ForEach-Object { $runmru += (Get-Short ([string]$_.Value) 300) }
    }
    foreach ($r in ($runmru | Where-Object { $_ -match $script:SuspCmd })) {
        Add-Finding 'Malvertising' 'High' 'Win+R RunMRU History Contains Suspicious Command (ClickFix / Fake CAPTCHA vector)' $r 'Investigate potential infostealer payload.'
    }

    $hist = @()
    $hp = $null; try { $hp = (Get-PSReadLineOption).HistorySavePath } catch { }
    if (-not $hp) { $hp = Join-Path $env:APPDATA 'Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt' }
    if (Test-Path -LiteralPath $hp) {
        $hist = @(Get-Content -LiteralPath $hp -Tail 3000 | Where-Object { $_ -match $script:SuspCmd } | Select-Object -Last 15 | ForEach-Object { Get-Short $_ 200 })
        if ($hist.Count -gt 0) {
            Add-Finding 'Fileless' 'Low' 'PowerShell History Contains Risky Command Patterns' ((Get-Short ($hist -join ' || ') 400)) 'Review commands for unauthorized LOLBin execution.'
        }
    }

    [pscustomobject]@{
        ScriptBlockLogging  = ($sbl -eq 1)
        SuspiciousPSHistory = $hist
    }
}

# ------------------------------------------------------------------ 10. DISKS & PARTITIONS
Invoke-Section 'DisksAndPartitions' {
    $pd = @(Get-PhysicalDisk | Select-Object FriendlyName,MediaType,HealthStatus,OperationalStatus,@{n='SizeGB';e={ [math]::Round($_.Size / 1GB, 1) }})
    foreach ($d in $pd) {
        if ($d.HealthStatus -ne 'Healthy') {
            Add-Finding 'Disk' 'High' ("Physical Disk Unhealthy: " + $d.FriendlyName) ($d.HealthStatus + ' / ' + $d.OperationalStatus) 'Backup critical data immediately.'
        }
    }
    $disks = @(Get-Disk | Select-Object Number,FriendlyName,PartitionStyle,IsBoot,IsSystem,OperationalStatus)
    foreach ($d in $disks) {
        if ($d.PartitionStyle -eq 'MBR' -and $d.IsBoot) {
            Add-Finding 'Disk' 'Low' 'Boot disk uses legacy MBR partition style instead of GPT/UEFI' '' 'Modern Windows security features (HVCI, Secure Boot) require GPT/UEFI.'
        }
    }
    $vols = @(Get-Volume | Where-Object { $_.DriveLetter } | Select-Object DriveLetter,DriveType,HealthStatus,@{n='FreePct';e={ if ($_.Size) { [math]::Round(100 * $_.SizeRemaining / $_.Size, 1) } else { 0 } }})
    foreach ($v in $vols) {
        if ($v.DriveType -eq 'Fixed' -and $v.FreePct -lt 10) {
            Add-Finding 'Disk' 'Medium' ("Low disk space on volume " + $v.DriveLetter + ": " + $v.FreePct + "% free") '' 'Free disk space to ensure VSS and Windows Update succeed.'
        }
    }

    [pscustomobject]@{
        PhysicalDisks = $pd
        Volumes       = $vols
    }
}

# ------------------------------------------------------------------ 11. SOFTWARE & DEVELOPER RUNTIMES
Invoke-Section 'SoftwareAndStack' {
    function Get-ToolVersion {
        param([string]$Cmd, [string[]]$ArgList)
        $c = Get-Command $Cmd -CommandType Application | Select-Object -First 1
        if (-not $c) { return $null }
        $o = (& $c.Source @ArgList 2>&1 | Out-String).Trim()
        $o = ($o -replace "`0", '')
        [pscustomobject]@{ Tool = $Cmd; Path = $c.Source; Output = (Get-Short $o 300) }
    }
    $tools = @()
    foreach ($t in @(@('php','-v'),@('composer','--version'),@('node','-v'),@('npm','-v'),@('pnpm','-v'),@('python','--version'),@('pip','--version'),@('git','--version'),@('docker','--version'),@('nginx','-v'),@('go','version'),@('dotnet','--version'))) {
        $r = Get-ToolVersion $t[0] @($t[1]); if ($r) { $tools += $r }
    }
    $xampp = @('C:\xampp','C:\laragon','C:\wamp64','C:\wamp') | Where-Object { Test-Path $_ }
    if ($xampp) {
        Add-Finding 'Stack' 'Info' 'Local Web Stack Detected (XAMPP/Laragon/WAMP)' ($xampp -join ', ') 'Verify PHP >= patched release against CVE-2024-4577 and ensure MySQL root password is set.'
    }

    # Optional WebRoot Scan
    $web = @()
    if ($WebRoot) {
        $pat = @(
            '(?i)eval\s*\(\s*(base64_decode|gzinflate|str_rot13)\s*\(',
            '(?i)\b(assert|system|shell_exec|passthru|exec)\s*\(\s*\$_(GET|POST|REQUEST)',
            '(?i)child_process.*(exec|spawn)\w*\s*\(.*req\.(body|query|params)'
        )
        foreach ($root in $WebRoot) {
            $files = Get-ChildItem -LiteralPath $root -Recurse -File -Include *.php,*.phtml,*.js,*.mjs -Force | Where-Object { $_.FullName -notmatch '\\node_modules\\' -and $_.Length -lt 2MB }
            foreach ($m in ($files | Select-String -Pattern $pat | Select-Object -First 200)) {
                $web += [pscustomobject]@{ File = $m.Path; Line = $m.LineNumber; Match = (Get-Short $m.Line 160) }
            }
            foreach ($e in (Get-ChildItem -LiteralPath $root -Recurse -File -Force -Filter '.env*' | Where-Object { $_.FullName -notmatch '\\node_modules\\|\\vendor\\' })) {
                $flags = @(Get-Content -LiteralPath $e.FullName | Select-String -Pattern '^(APP_DEBUG|APP_ENV)\s*=' | ForEach-Object { $_.Line.Trim() })
                if ($e.FullName -match '(?i)\\(public|public_html|www|htdocs|wwwroot)\\') {
                    Add-Finding 'WebApp' 'High' 'Secret .env file located inside publicly served web directory' $e.FullName 'Move .env outside document root and rotate all secrets.'
                }
                if ($flags -contains 'APP_DEBUG=true') {
                    Add-Finding 'WebApp' 'Medium' 'APP_DEBUG=true in Laravel environment' $e.FullName 'Set APP_DEBUG=false in production.'
                }
            }
        }
        if ($web.Count -gt 0) {
            Add-Finding 'WebApp' 'High' ("Webshell / Command Execution Pattern Found in WebRoot: " + $web.Count) ((Get-Short ($web | Select-Object -First 3 | ForEach-Object { $_.File + ':' + $_.Line }) 400)) 'Manually review matches.'
        }
    }

    [pscustomobject]@{
        DiscoveredTools = $tools
        WebScan         = $web
    }
}

# ------------------------------------------------------------------ 12. AI AGENT & MCP SECURITY
Invoke-Section 'AiAgentAndMcp' {
    $mcpConfigs = @(
        "$env:APPDATA\Claude\claude_desktop_config.json",
        "$env:USERPROFILE\.cursor\mcp.json",
        "$env:USERPROFILE\.railway\config.json"
    )
    $found = @()
    foreach ($cfg in $mcpConfigs) {
        if (Test-Path $cfg) {
            $raw = Get-Content -Path $cfg -Raw -ErrorAction SilentlyContinue
            $hasUnpinned = ($raw -match '(?i)npx\s+-y\s+[^@]+(@latest|\s)')
            $hasPlainKey = ($raw -match '(?i)(sk-[a-zA-Z0-9_-]{20,}|AKIA[0-9A-Z]{16})')
            if ($hasUnpinned) {
                Add-Finding 'AiAgent' 'Medium' "Unpinned npx invocation in MCP configuration ($([System.IO.Path]::GetFileName($cfg)))" "Pattern: npx -y without pinned semantic version" "Pin package versions (e.g. package@1.2.3) to prevent supply chain compromise."
            }
            if ($hasPlainKey) {
                Add-Finding 'AiAgent' 'High' "Plaintext API Key detected in MCP configuration ($([System.IO.Path]::GetFileName($cfg)))" "High-entropy API key pattern detected" "Move credentials to secure environment variables or vault."
            }
            $found += [pscustomobject]@{ Path = $cfg; UnpinnedNpx = $hasUnpinned; HasPlaintextKey = $hasPlainKey }
        }
    }

    $aiPorts = @(4000, 11434, 8080, 5000)
    $exposedAi = @()
    foreach ($p in $aiPorts) {
        $conns = @(Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue)
        foreach ($c in $conns) {
            if ($c.LocalAddress -eq '0.0.0.0' -or $c.LocalAddress -eq '::') {
                Add-Finding 'AiAgent' 'High' "Local AI Daemon listening on all interfaces (0.0.0.0:$p)" "Port $p is exposed to LAN" "Rebind local AI daemon strictly to 127.0.0.1."
                $exposedAi += $c
            }
        }
    }

    [pscustomobject]@{
        DiscoveredMcpConfigs = $found
        ExposedAiDaemons     = $exposedAi
    }
}

# ------------------------------------------------------------------ EXPORT ARTIFACTS
$script:Data['Findings'] = $script:Findings
$script:Data['Meta'] = [ordered]@{
    Generated = (Get-Date).ToString('s')
    Host      = $env:COMPUTERNAME
    Admin     = $script:IsAdmin
    Quick     = [bool]$Quick
    PSVersion = $PSVersionTable.PSVersion.ToString()
}

$jsonPath = Join-Path $OutDir 'audit.json'
$csvPath = Join-Path $OutDir 'findings.csv'

$script:Data | ConvertTo-Json -Depth 7 | Out-File -FilePath $jsonPath -Encoding UTF8
$script:Findings | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8

$order = 'Critical','High','Medium','Low','Info'
Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "             WINDOWS SECURITY AUDIT SUMMARY REPORT              " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
foreach ($sev in $order) {
    $n = @($script:Findings | Where-Object { $_.Severity -eq $sev }).Count
    $color = 'Gray'
    if ($sev -eq 'Critical' -or $sev -eq 'High') { $color = 'Red' }
    elseif ($sev -eq 'Medium') { $color = 'Yellow' }
    Write-Host ("{0,-10} : {1}" -f $sev, $n) -ForegroundColor $color
}
Write-Host "----------------------------------------------------------------"
$script:Findings | Sort-Object { $order.IndexOf($_.Severity) } | Select-Object -First 25 | ForEach-Object {
    Write-Host ("[{0,-6}] {1}: {2}" -f $_.Severity, $_.Area, $_.Title)
}
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "Artifacts Exported To : $OutDir" -ForegroundColor Green
Write-Host "  - Telemetry JSON    : $jsonPath"
Write-Host "  - Findings CSV      : $csvPath"
Write-Host "================================================================" -ForegroundColor Cyan
