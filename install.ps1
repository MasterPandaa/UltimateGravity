# ==============================================================================
# UltimateGravity v4.6.0 One-Click Installer
# Tri-Role Autonomous Engineering System for Google Antigravity (AGY)
# ==============================================================================

$ErrorActionPreference = "Stop"

$currentDir = $PSScriptRoot
$targetRoot = Join-Path $env:USERPROFILE ".gemini"
$timestamp  = Get-Date -Format "yyyyMMdd-HHmmss"

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "   🌌 UltimateGravity v4.6.0 — One-Click Master Installer          " -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "Target Installation : $targetRoot" -ForegroundColor Yellow

# 1. Cek Prasyarat Sistem (Node.js & Python)
Write-Host "`n[1/7] Memeriksa prasyarat sistem..." -ForegroundColor Green

$hasNode = Get-Command node -ErrorAction SilentlyContinue
if (-not $hasNode) {
    Write-Warning "Node.js belum terdeteksi di PATH! Skrip hooks (watchdog, indexer, distiller) memerlukan Node.js."
    Write-Warning "Silakan unduh dan pasang Node.js LTS dari: https://nodejs.org"
} else {
    $nodeVer = & node -v
    Write-Host "[OK] Node.js terdeteksi: $nodeVer" -ForegroundColor Green
}

$hasPython = Get-Command python -ErrorAction SilentlyContinue
if (-not $hasPython) {
    Write-Warning "Python belum terdeteksi di PATH! Hook watermark-sanitizer dan skrip pendukung membutuhkan Python."
} else {
    $pyVer = & python --version 2>&1
    Write-Host "[OK] Python terdeteksi: $pyVer" -ForegroundColor Green
}

# 2. Backup Konfigurasi Lama (Jika Ada)
if (Test-Path $targetRoot) {
    $backupDir = "$targetRoot.backup-$timestamp"
    Write-Host "`n[2/7] Ditemukan instalasi lama. Membuat cadangan aman ke:" -ForegroundColor Yellow
    Write-Host "  -> $backupDir" -ForegroundColor DarkGray
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

    if (Test-Path (Join-Path $targetRoot "GEMINI.md")) {
        Copy-Item -Path (Join-Path $targetRoot "GEMINI.md") -Destination (Join-Path $backupDir "GEMINI.md") -Force
    }
    if (Test-Path (Join-Path $targetRoot "config\hooks.json")) {
        Copy-Item -Path (Join-Path $targetRoot "config\hooks.json") -Destination (Join-Path $backupDir "hooks.json") -Force
    }
}

# 3. Buat Struktur Folder Target
Write-Host "`n[3/7] Menyiapkan struktur direktori .gemini..." -ForegroundColor Green
$directoriesToEnsure = @(
    $targetRoot,
    (Join-Path $targetRoot "bin"),
    (Join-Path $targetRoot "config"),
    (Join-Path $targetRoot "config\agents"),
    (Join-Path $targetRoot "config\skills"),
    (Join-Path $targetRoot "config\plugins"),
    (Join-Path $targetRoot "scripts"),
    (Join-Path $targetRoot "scripts\logs"),
    (Join-Path $targetRoot "tools"),
    (Join-Path $targetRoot "tools\watermarks-remover"),
    (Join-Path $targetRoot "antigravity\file-history"),
    (Join-Path $targetRoot "antigravity\tasks"),
    (Join-Path $targetRoot "antigravity\workspace-index"),
    (Join-Path $targetRoot "antigravity\shell-snapshots")
)

foreach ($dir in $directoriesToEnsure) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

# 4. Salin Seluruh Aset Arsitektur (bin, agents, skills, plugins, tools, scripts)
Write-Host "`n[4/7] Menyalin aset arsitektur (bin, agents, skills, plugins, tools, scripts)..." -ForegroundColor Green

# Salin bin/ (fd.exe dan 18 .bat CLI wrappers)
Copy-Item -Path (Join-Path $currentDir "bin\*") -Destination (Join-Path $targetRoot "bin") -Recurse -Force
Write-Host "[OK] 18 CLI Tools & wrappers tersalin ke bin/." -ForegroundColor Green

# Salin CHANGELOG.md
if (Test-Path (Join-Path $currentDir "CHANGELOG.md")) {
    Copy-Item -Path (Join-Path $currentDir "CHANGELOG.md") -Destination (Join-Path $targetRoot "CHANGELOG.md") -Force
}

# Salin config/agents (Tri-Role)
Copy-Item -Path (Join-Path $currentDir "config\agents\*") -Destination (Join-Path $targetRoot "config\agents") -Recurse -Force

# Salin config/skills (35 active curated skills)
Copy-Item -Path (Join-Path $currentDir "config\skills\*") -Destination (Join-Path $targetRoot "config\skills") -Recurse -Force

# Salin config/plugins (3 active plugins)
Copy-Item -Path (Join-Path $currentDir "config\plugins\*") -Destination (Join-Path $targetRoot "config\plugins") -Recurse -Force

# Salin tools/watermarks-remover
if (Test-Path (Join-Path $currentDir "tools\watermarks-remover")) {
    Copy-Item -Path (Join-Path $currentDir "tools\watermarks-remover\*") -Destination (Join-Path $targetRoot "tools\watermarks-remover") -Recurse -Force
    Write-Host "[OK] Tools watermarks-remover tersalin ke tools/." -ForegroundColor Green
}

# Salin mcp_config jika belum ada
$targetMcp = Join-Path $targetRoot "config\mcp_config.json"
if (-not (Test-Path $targetMcp)) {
    Copy-Item -Path (Join-Path $currentDir "config\mcp_config.template.json") -Destination $targetMcp -Force
    Write-Host "[OK] Membuat mcp_config.json baru dari template." -ForegroundColor Green
} else {
    Write-Host "[OK] Mempertahankan mcp_config.json yang sudah ada sebelumnya." -ForegroundColor DarkGray
}

# 5. Normalisasi Jalur Pengguna (User Path Substitution)
Write-Host "`n[5/7] Menyesuaikan jalur sistem ke profil pengguna Anda ($env:USERPROFILE)..." -ForegroundColor Green

# Normalisasi GEMINI.md
$geminiSrc = Get-Content -Path (Join-Path $currentDir "GEMINI.md") -Raw -Encoding UTF8
$geminiNormalized = $geminiSrc -replace "C:[\\/]Users[\\/][^\\/]+[\\/]\.gemini", $targetRoot
$geminiNormalized | Set-Content -Path (Join-Path $targetRoot "GEMINI.md") -Encoding UTF8 -Force

# Normalisasi hooks.json
$hooksSrc = Get-Content -Path (Join-Path $currentDir "config\hooks.json") -Raw -Encoding UTF8
$escapedTarget = $targetRoot.Replace("\", "\\")
$hooksNormalized = $hooksSrc -replace "C:\\\\Users\\\\[^\\\\]+\\\\\.gemini", $escapedTarget
$hooksNormalized | Set-Content -Path (Join-Path $targetRoot "config\hooks.json") -Encoding UTF8 -Force

# Salin & Normalisasi Scripts
Get-ChildItem -Path (Join-Path $currentDir "scripts") -File | ForEach-Object {
    $scriptContent = Get-Content -Path $_.FullName -Raw -Encoding UTF8
    $normalizedScript = $scriptContent -replace "C:[\\/]Users[\\/][^\\/]+[\\/]\.gemini", $targetRoot
    $normalizedScript = $normalizedScript -replace "C:\\\\Users\\\\[^\\\\]+\\\\\.gemini", $escapedTarget
    $destScript = Join-Path $targetRoot "scripts\$($_.Name)"
    $normalizedScript | Set-Content -Path $destScript -Encoding UTF8 -Force
}

# 6. Daftarkan ~/.gemini/bin ke User PATH Windows
Write-Host "`n[6/7] Mendaftarkan direktori bin ke User PATH Windows..." -ForegroundColor Green
$binDir = Join-Path $targetRoot "bin"
$currentUserPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if ($currentUserPath -notlike "*$binDir*") {
    $newUserPath = if ([string]::IsNullOrEmpty($currentUserPath)) { $binDir } else { "$currentUserPath;$binDir" }
    [Environment]::SetEnvironmentVariable("PATH", $newUserPath, "User")
    Write-Host "[OK] Direktori $binDir berhasil didaftarkan ke User PATH!" -ForegroundColor Green
    Write-Host "     (Anda bisa menjalankan CLI 'file-rewind', 'task-dag', 'harness-distiller', 'rrsi-eval', 'fd' dari direktori mana saja)" -ForegroundColor DarkGray
} else {
    Write-Host "[OK] Direktori bin sudah terdaftar di User PATH." -ForegroundColor DarkGray
}

# 7. Uji Validasi Cepat (Smoke Test)
Write-Host "`n[7/7] Menjalankan uji verifikasi integritas..." -ForegroundColor Green
$testScript = Join-Path $targetRoot "scripts\diagnostic-watchdog-hook.js"
if (Test-Path $testScript) {
    Write-Host "[OK] Diagnostic Watchdog Hook siap di: $testScript" -ForegroundColor Green
}
$testDistiller = Join-Path $targetRoot "scripts\harness-distiller.js"
if (Test-Path $testDistiller) {
    Write-Host "[OK] Harness-Zero Distiller siap di: $testDistiller" -ForegroundColor Green
}
$testIndexer = Join-Path $targetRoot "bin\fd.exe"
if (Test-Path $testIndexer) {
    Write-Host "[OK] Fast Rust Indexer (fd.exe) siap di: $testIndexer" -ForegroundColor Green
}

Write-Host "`n==================================================================" -ForegroundColor Cyan
Write-Host "   🎉 [SUCCESS] ULTIMATE GRAVITY v4.6.0 TELAH AKTIF LENGKAP!     " -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "Semua aturan, 3 Agen Inti, 35 Skills kurasi, Hooks otomatis,"
Write-Host "18 CLI Tools, serta Watermark Sanitizer kini terpasang dan siap digunakan."
Write-Host "Buka atau restart IDE Antigravity Anda untuk mulai bekerja!`n"
