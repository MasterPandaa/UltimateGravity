# Windows OS Hardening & Protection Architecture

This guide details configuration baselines, registry keys, and PowerShell commands to harden Windows workstations against ransomware, kernel driver attacks, credential dumping, and persistence.

---

## 1. Microsoft Defender & Attack Surface Reduction (ASR)

Microsoft Defender Attack Surface Reduction (ASR) rules block common attacker techniques before code execution occurs.

### A. The 10 Core ASR Rules

| Rule ID (GUID) | Human-Readable Protection Name | Recommended Mode |
|---|---|---|
| `56a863a9-875e-4185-98a7-b882c64b5ce5` | Block abuse of exploited vulnerable signed drivers (BYOVD) | **Block (1)** |
| `9e6c4e1f-7d60-472f-ba1a-a39ef669e4b2` | Block credential stealing from Windows Local Security Authority (LSASS) | **Block (1)** |
| `be9ba2d9-53ea-4cdc-84e5-9b1eeee46550` | Block executable content from email client and webmail | **Block (1)** |
| `5beb7efe-fd9a-4556-801d-275e5ffc04cc` | Block obfuscated scripts | **Block (1)** |
| `d3e037e1-3eb8-44c8-a917-57927947596d` | Block JavaScript or VBScript from launching downloaded executable content | **Block (1)** |
| `3b576869-a4ec-4529-8536-b80a7769e899` | Block Office applications from creating executable content | **Block (1)** |
| `d4f940ab-401b-4efc-aadc-ad5f3c50688a` | Block all Office applications from creating child processes | **Block (1)** |
| `92e97fa1-2edf-4476-bdd6-9dd0b4dddc7b` | Block Win32 API calls from Office macros | **Block (1)** |
| `c1db55ab-c21a-4637-bb3f-a12568109d35` | Use advanced protection against ransomware | **Block (1)** |
| `e6db77e5-3e12-4247-81dd-3ae7777381db` | Block persistence through WMI event subscription | **Block (1)** |

*Note: For production developer machines, test in Audit mode (Action `2`) first to detect legitimate build tooling before switching to Block mode (Action `1`).*

---

## 2. Memory Integrity, LSA Protection & Kernel Security

### A. Virtualization-Based Security (VBS) & Hypervisor-Protected Code Integrity (HVCI)
- **Mechanism**: VBS isolates a secure memory region from the normal OS kernel. HVCI uses hardware virtualization to enforce that only verified, signed code can run in kernel mode.
- **Verification**:
  ```powershell
  Get-CimInstance -ClassName Win32_DeviceGuard -Namespace root\Microsoft\Windows\DeviceGuard | Select-Object VirtualizationBasedSecurityStatus, SecurityServicesRunning
  ```
  - `VirtualizationBasedSecurityStatus = 2` (VBS running).
  - `SecurityServicesRunning` containing `2` indicates HVCI / Memory Integrity is active.

### B. LSA Protection (RunAsPPL)
- **Mechanism**: Configures `lsass.exe` as a Protected Process Light (PPL). Unsigned processes cannot open read/write handles to LSASS memory, neutralizing tools like Mimikatz.
- **Verification**:
  ```powershell
  Get-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Lsa" -Name "RunAsPPL"
  ```
  - `RunAsPPL = 1` or `2` (Enabled).

---

## 3. Ransomware & Data Recovery Safeguards

### A. Controlled Folder Access (CFA)
- Blocks untrusted applications from modifying files inside protected folders (Documents, Pictures, Desktop, and custom development directories).
- **Verification**:
  ```powershell
  (Get-MpPreference).EnableControlledFolderAccess
  ```
  - `0` = Disabled, `1` = Block, `2` = Audit.

### B. Volume Shadow Copies (VSS) & Offline Backups
- Ransomware precursors consistently attempt to purge shadow copies (`vssadmin delete shadows /all /quiet`).
- **Verification**:
  ```powershell
  vssadmin list shadows
  ```
- **Rule of Resilience**: Shadow copies are an ephemeral line of defense. The only reliable defense against destructive wipers and ransomware is an **immutable, offline, or versioned 3-2-1 backup strategy**.

### C. BitLocker Drive Encryption
- Protects data-at-rest against physical theft and offline boot tampering.
- **Verification**:
  ```powershell
  Get-BitLockerVolume | Select-Object MountPoint, EncryptionMethod, VolumeStatus, ProtectionStatus
  ```
  - Desired: `ProtectionStatus = On`, `EncryptionMethod = XtsAes128` or `XtsAes256`.

---

## 4. Disk Health, Layout & Boot Integrity

- **Partition Style**: Modern Windows 11 requires **GPT** partition style paired with **UEFI** and **Secure Boot** (`Confirm-SecureBootUEFI` returns `True`).
- **Recovery Environment (WinRE)**:
  - Check WinRE status: `reagentc /info`. Ensure Windows Recovery Environment is *Enabled*.
- **SMART Health**:
  ```powershell
  Get-Disk | Select-Object Number, FriendlyName, HealthStatus, OperationalStatus
  ```
  - Any `HealthStatus` other than `Healthy` demands immediate data backup.
