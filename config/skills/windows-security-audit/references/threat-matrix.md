# Windows Threat & Behavioral IoC Reference Matrix

This reference maps Windows threat categories and attacker techniques to observable behavioral Indicators of Compromise (IoCs), live telemetry checks, and verified hardening mitigations.

---

## 1. Malware & Behavioral IoC Matrix

| Threat Category | Behavioral Mechanism & Windows Telemetry Signatures | Telemetry / Audit Command | Defensive Hardening & Remediation |
|---|---|---|---|
| **Ransomware & Wiper** | Mass file extension mutation, deletion of Volume Shadow Copies (`vssadmin delete shadows`), tampering with BCD (`bcdedit /set {default} recoveryenabled No`), killing AV/backup processes, and external staging. | `Get-MpPreference` (`EnableControlledFolderAccess`), `vssadmin list shadows`, `Get-BitLockerVolume`, inspection of shadow storage (`Win32_ShadowStorage`). | Enable Controlled Folder Access (mode `1`), Microsoft Defender Tamper Protection, BitLocker (XTS-AES 256), and immutable/offline 3-2-1 backups. |
| **Rootkit & Kernel Exploit** | Malicious kernel drivers (`.sys`), Bring Your Own Vulnerable Driver (BYOVD) abuse, bootkit MBR/VBR overwrites, and unsigned kernel modules. | `Win32_DeviceGuard` (`SecurityServicesRunning` includes `2` for HVCI), `Confirm-SecureBootUEFI`, Microsoft Vulnerable Driver Blocklist enabled. | Enable Memory Integrity (HVCI), Secure Boot (UEFI), and enforce Microsoft Vulnerable Driver Blocklist. |
| **RAM Scraper & Credential Dumper** | Opening handles to `lsass.exe` to harvest NTLM hashes or plaintext memory (e.g. Mimikatz), browser password scraping, DPAPI blob extraction. | `HKLM:\SYSTEM\CurrentControlSet\Control\Lsa` -> `RunAsPPL` (`1` or `2`), `SecurityServicesRunning` includes `1` (Credential Guard). | Enforce LSA Protection as Protected Process Light (`RunAsPPL = 1` or `2`), enable Windows Defender Credential Guard. |
| **Fileless Malware & LOLBins** | Living-off-the-Land Binaries (`powershell.exe -enc`, `mshta.exe`, `rundll32.exe`, `certutil -urlcache`, `bitsadmin /transfer`, `wscript.exe`), script injection into legitimate system processes. | PowerShell console history inspection, Event ID 4104 (Script Block Logging), Defender ASR Rules (`5beb7efe-fd9a-4556-801d-275e5ffc04cc` for obfuscated scripts). | Enable PowerShell Script Block Logging, Constrained Language Mode (CLM), and ASR rules blocking obfuscated scripts and LOLBin child spawns. |
| **Trojan, RAT & Backdoor** | Execution from user-writable directories (`%APPDATA%`, `%TEMP%`, `C:\Users\Public`), persistence in Run/RunOnce registry keys, IFEO Debugger hijacking, and periodic C2 network beacons. | `Get-CimInstance Win32_StartupCommand`, `Get-NetTCPConnection -State Established`, checking IFEO registry keys (`HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options`). | Isolate unknown binaries, verify Authenticode signatures (`Get-AuthenticodeSignature`), check hash on VirusTotal, purge rogue Run keys. |
| **Botnet & Cryptojacker** | High idle CPU/GPU consumption, outbound connections to mining pool ports (`3333`, `4444`, `5555`, `7777`, `14444`), periodic task scheduling, rogue Docker containers. | Sampling process CPU (`Get-Process | Sort-Object CPU -Descending`), monitoring outbound TCP connections to non-standard ports. | Block outbound Stratum mining ports in Windows Firewall, inspect and terminate unauthorized mining tasks and rogue containers. |
| **Keylogger, Spyware & Stalkerware** | Input hook installation (`SetWindowsHookEx`), unauthorized background audio/camera access, broad browser extension permissions (`<all_urls>`, `nativeMessaging`). | Query Windows Privacy registry for active sensor usage (`InUseNow` on Microphone/Camera/Location), audit installed browser extensions in user profiles. | Revoke global app permissions in Windows Privacy settings, uninstall unverified browser extensions, enforce ASR LSASS blocking. |
| **USB "Shortcut Virus" & Removable Worms** | Hiding real folders on USB drives (`attrib +h +s`), replacing them with `.lnk` shortcut files executing malicious VBS/PowerShell payloads. | Inspect removable drive volumes for hidden folders paired with identical `.lnk` files, inspect AutoRun configurations. | Never click `.lnk` shortcuts on external USB drives; unhide original files via `attrib -h -s /s /d X:\*.*` only after AV disinfection; disable AutoPlay. |
| **Adware, Malvertising & Rogue Root CAs** | Browser hijackers, proxy auto-config (PAC) redirection, DNS tampering, rogue local MITM Root Certificates (e.g., Fiddler, Charles, distrusted eMudhra CAs). | `Get-ChildItem Cert:\LocalMachine\Root`, `Get-DnsClientServerAddress`, inspection of `C:\Windows\System32\drivers\etc\hosts`. | Remove untrusted root CAs from `Cert:\LocalMachine\Root`, lock DNS to authenticated resolvers (1.1.1.1, 9.9.9.9), verify `hosts` file integrity. |
| **Logic Bomb** | Dormant destructive code scheduled to execute upon specific conditions (e.g. date, employee termination, missing check-in ping). | Audit non-Microsoft Scheduled Tasks, WMI `__EventConsumer` subscriptions, and CI/CD cron jobs. *Note: Pure logic bombs cannot be detected by signature prior to triggering.* | Rigorous code reviews, strict principle of least privilege, dual-authorization on scheduled maintenance scripts, immutable backups. |

---

## 2. Evidence Grading Standard

Every finding during a Windows Security Audit must be graded into one of three confidence tiers:

1. **Confirmed (`Terkonfirmasi`)**:
   - Supported by $\ge 2$ independent telemetry signals (e.g., unsigned binary in `%TEMP%` + persistent Run key + outbound connection to suspicious IP).
   - Confirmed by Microsoft Defender active malware threat event that failed automatic remediation.
   - Known malicious hash verified via threat intelligence.
2. **Suspicious (`Mencurigakan`)**:
   - Single strong behavioral anomaly (e.g., IFEO Debugger hijacking a system utility, WMI ActiveScript consumer, unsigned kernel driver).
   - Legitimate software exhibiting risky configuration (e.g., development server binding to `0.0.0.0`).
3. **Informational (`Informasi`)**:
   - Hardening gap without evidence of active exploitation (e.g., UAC enabled at default instead of Always Notify, Controlled Folder Access in Audit mode).
