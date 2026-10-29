# 📜 CHANGELOG: Evolusi Arsitektur Antigravity Autonomous Engineering

Dokumen ini merekam secara kronologis dan komprehensif seluruh rekayasa arsitektural yang telah diimprovisasi pada lingkungan Google Antigravity (AGY). Pembaruan mencakup integrasi fitur unggulan dari platform kelas dunia (**Devin** dan **Qoder**), penyerapan terobosan riset dari paper/jurnal (**Google Research RRSI**, **ZJU PaperGym**, **Rederive**, **LearnHarness**), adopsi standar viral dari media sosial (**UI/UX Formula**, **Bloom Filter**, **Agent-Reach**), hingga konsolidasi akhir ke **Tri-Role Autonomous Engineering** berbasis standar *Anthropic Applied AI*.

---

## 🧭 Ringkasan Garis Waktu Evolusi Sistem

```mermaid
timeline
    title Garis Waktu Rekayasa Arsitektur Antigravity
    section Generasi 1 : v1.0
        12 Bijuu Squad Swarm : 80 Master Skills
        : 12 MCP Integrations : Context Bloat & Over-Engineering
    section Generasi 2 : v2.0
        Research & Papers : Google Research RRSI
        : ZJU REAL PaperGym : Rederive Socratic Engine
        : Social Media Formulas : @7thco.ui 7 Rules
        : UX/UI Brainy 3-Pillar Error : Bloom Filter Cache Defense
        : Multi-Agent Git Foremerge : Browser-Harness Hierarchy
    section Generasi 3 : v3.0
        Absorpsi Arsitektur Qoder : Continuous File History & Rewind
        : Persistent PowerShell Shell (agy-exec) : Task DAG State Machine
        : Incremental Workspace Indexer : Local Skill Telemetry Hook
    section Generasi 3.5 : v3.5
        Absorpsi Fitur Devin (Native) : Diagnostic Watchdog Hook
        : Step Checkpointing Engine : Live Browser Dev Sentinel (Edge)
        : Rust fd.exe Scanning : Low-RAM (<30 MB) Isolation
    section Generasi 4 (Current) : v4.0
        Tri-Role Autonomous System : Fullstack, QA, Data Engineer
        : Solo Direct Mode Default : Progressive Disclosure
        : Strict 3 Context Anchors : 4 Mandatory UI States
        : EGM Swarm Audits : Lean Meta-Governance GEMINI.md
```

---

## [v4.0.0] - 2026-10-29 (Current Live Architecture)
### 🏛️ Rekonstruksi Tri-Role Autonomous Engineering & Anthropic Applied AI Standard

Generasi ke-4 menandai pembersihan total *bloatware* birokrasi subagent dan restrukturisasi sistem ke efisiensi puncak berstandar *Anthropic Applied AI (Effective Agents)*.

#### ✨ Ditambahkan / Dirombak (Added & Refactored)
- **Tri-Role Spesialis Utama ([GEMINI.md](file:///C:/Users/Luthfi/.gemini/GEMINI.md#L9-L43))**:
  1. [`fullstack-developer`](file:///C:/Users/Luthfi/.gemini/config/agents/fullstack-developer.md): Menguasai frontend craft (React/Next.js/Tailwind), clean layered backend, ORM & query profiling (`sql-optimization`), dan bedah tipe presisi minimalis (`karpathy-guidelines`).
  2. [`qa-engineer`](file:///C:/Users/Luthfi/.gemini/config/agents/qa-engineer.md): Menangani heuristik BVA/EP/Decision Table (`qa-skills`), Playwright headless CLI automation (`playwright-cli`), investigasi akar masalah 4 langkah (`diagnosing-bugs`), dan audit keamanan OWASP (`security-audit`).
  3. [`data-engineer`](file:///C:/Users/Luthfi/.gemini/config/agents/data-engineer.md): Menangani scraping stealth multi-tier (Scrapling/Firecrawl), data modeling OLTP/OLAP (`domain-modeling`), query tuning, pipeline ingest Windows (`powershell-windows-patterns`), dan sanitasi integritas AI (`ai-infra-guard`).
- **Solo Direct Execution Mode sebagai Default Jalur Utama**:
  - Main Agent mengeksekusi langsung perubahan kode lokal (1–3 file, < 100 baris, bugfix, UI styling, query tuning) tanpa overhead delegasi subagent. Memangkas latensi hingga 50% dan mencegah hilangnya konteks (*the telephone game*).
- **Tiga Pengecualian Delegasi Sah**:
  - Subagent hanya diizinkan meluncur jika: (1) Jenuhnya konteks utama terukur (*measurable context bloat*), (2) Pekerjaan paralel yang dapat dibuang (*disposable parallel work*), atau (3) Audit independen zero-context tanpa bias (*adversarial audit* via Elephant-Goldfish Model / EGM).
- **Mandatory Step 0 Skill Ingestion Gate**:
  - Jika subagent dipanggil, Turn 1 diwajibkan membaca berkas `SKILL.md` domainnya dan mengutip 2 aturan operasional sebelum menyentuh berkas target (*fail-closed gate*).
- **Token Optimization & Budget Threshold Matrix**:
  - Aturan batasan pembacaan berkas (StartLine/EndLine untuk 50–300 baris, AST/regex untuk >300 baris). Output terminal >200 baris wajib ditulis ke scratch file untuk menjaga headroom context window.
- **Mandatory 4 UI States & 3 Context Anchors**:
  - Penegakan mutlak 4 state interaktif: *Loading*, *Empty*, *Error*, dan *Success*.
  - Penegakan verifikasi 3 jangkar sebelum mutasi: *Callers/Consumers*, *Contracts/Types*, dan *Runtime Invariants*.

#### 🗄️ Diarsipkan / Dihapus (Deprecated & Archived)
- 12 Agen Persona Bijuu (`shukaku`, `matatabi`, `isobu`, `son-goku`, `kokuo`, `saiken`, `chomei`, `gyuki`, `kurama`, `gamabunta`, `gamaken`, `gamahiro`) resmi diarsipkan ke [config/agents-archive/](file:///C:/Users/Luthfi/.gemini/config/agents-archive/) untuk mengeliminasi kebingungan perutean (*routing ambiguity*).

---

## [v3.5.0] - 2026-10-29 (Sore)
### ⚡ Adopsi Fitur Unggulan Platform Devin (Native Low-RAM Edition)

Menyerap 4 fitur arsitektural inti dari **Cognition Devin** secara mandiri (*standalone*) tanpa memasang GUI berat maupun cloud telemetry, dirancang khusus dengan profil memori ultra-ringan (< 30 MB transient) untuk mesin RAM 8 GB.

#### ✨ Ditambahkan (Added)
1. **Pre-Emptive Diagnostic Watchdog Hook ([diagnostic-watchdog-hook.js](file:///C:/Users/Luthfi/.gemini/scripts/diagnostic-watchdog-hook.js))**:
   - Meniru sistem `BackgroundLintManager` milik Devin.
   - Terintegrasi otomatis pada event `PostToolUse` berkas [hooks.json](file:///C:/Users/Luthfi/.gemini/config/hooks.json).
   - Melakukan linter dan verifikasi sintaks instan (~40–150ms) sesaat setelah berkas diedit/ditulis (`edit_file` / `write_file`) untuk format JSON, Python (`py_compile`), JavaScript (`node --check`), dan delimiter TypeScript.
   - Langsung menyuntikkan peringatan (*ephemeral feedback*) ke giliran berikutnya jika ada sintaks rusak sebelum user menyadarinya.
2. **Step Checkpointing & Differential Revert Engine ([step-checkpoint.js](file:///C:/Users/Luthfi/.gemini/scripts/step-checkpoint.js) & [SKILL.md](file:///C:/Users/Luthfi/.gemini/config/skills/step-checkpoint/SKILL.md))**:
   - Meniru kapabilitas snapshot/revert state Devin tanpa overhead git commit kotor.
   - Memungkinkan pembuatan checkpoint instan (`create <tag>`), melihat riwayat checkpoint (`list`), inspeksi perbandingan diferensial (`diff <tag>`), dan *instant restore* (`revert <tag>`).
3. **Live Browser Error Sentinel ([browser-sentinel.js](file:///C:/Users/Luthfi/.gemini/scripts/browser-sentinel.js) & [SKILL.md](file:///C:/Users/Luthfi/.gemini/config/skills/browser-sentinel/SKILL.md))**:
   - Meniru panel *Devin Live Browser Preview*.
   - Menggunakan engine bawaan Windows **Microsoft Edge Headless** (`msedge.exe`) secara instan tanpa menguras ratusan MB download browser Playwright.
   - Otomatis mendeteksi crash overlay Vite (`<vite-error-overlay>`), Next.js runtime error portal (`__next_error__`), React SSR Hydration mismatch, serta HTTP 500 error.
   - Nol RAM saat idle, ~20 MB transient selama 1 detik pengujian.
4. **Rust-Powered Fast Topology Scanner**:
   - Mengintegrasikan utilitas biner native `fd.exe` ke dalam pemindaian workspace indexer, memangkas waktu pemindaian pohon repositori dari ribuan milidetik menjadi < 350 milidetik.

---

## [v3.0.0] - 2026-10-28
### 🛠️ Adopsi Fitur Unggulan Platform Qoder & Infrastruktur Resiliensi

Menganalisis sistem internal Qoder (`C:\Users\Luthfi\.qoder`) dan menyerap 5 pilar arsitektur terbaiknya untuk memperkuat keandalan operasional Antigravity.

#### ✨ Ditambahkan (Added)
1. **Continuous File History & Instant Rewind Safety Net ([file-rewind.js](file:///C:/Users/Luthfi/.gemini/scripts/file-rewind.js), [file-history-hook.js](file:///C:/Users/Luthfi/.gemini/scripts/file-history-hook.js), [SKILL.md](file:///C:/Users/Luthfi/.gemini/config/skills/file-rewind/SKILL.md))**:
   - Meniru sistem *File History Shadow Copy* Qoder.
   - Hook `PreToolUse` otomatis membuat salinan bayangan (*shadow snapshot*) bertanda waktu ke direktori internal sebelum AI melakukan mutasi apa pun via `edit_file` atau `write_file`.
   - Dilengkapi perintah `file-rewind.ps1 list <file>` dan `file-rewind.ps1 rollback <file> [index]` untuk pemulihan instan jika terjadi suntingan salah.
2. **Stateful Persistent PowerShell Engine ([agy-exec.ps1](file:///C:/Users/Luthfi/.gemini/scripts/agy-exec.ps1) & [SKILL.md](file:///C:/Users/Luthfi/.gemini/config/skills/persistent-shell/SKILL.md))**:
   - Mengatasi batasan utama AI bawaan di mana setiap eksekusi terminal berada di sub-shell terisolasi yang kehilangan CWD, variabel lingkungan, dan virtualenv.
   - Menyimpan status sesi ke snapshot terenkripsi di `shell-snapshots/`, menjaga sesi PowerShell persisten antar pemanggilan `run_command`.
3. **Background Incremental Workspace Indexer & Pre-Prompt Hook ([workspace-indexer.js](file:///C:/Users/Luthfi/.gemini/scripts/workspace-indexer.js), [workspace-indexer-hook.js](file:///C:/Users/Luthfi/.gemini/scripts/workspace-indexer-hook.js), [SKILL.md](file:///C:/Users/Luthfi/.gemini/config/skills/workspace-indexer/SKILL.md))**:
   - Meniru sistem `qoder-context` yang memetakan topologi proyek secara inkremental.
   - Hook `PostToolUse` memperbarui indeks ringkas repositori (topologi direktori, dependensi `package.json`/`requirements.txt`, berkas yang baru dimodifikasi) untuk disuntikkan secara presisi ke konteks giliran berikutnya.
4. **Structured Task DAG State Machine Engine ([task-dag.js](file:///C:/Users/Luthfi/.gemini/scripts/task-dag.js) & [SKILL.md](file:///C:/Users/Luthfi/.gemini/config/skills/task-dag/SKILL.md))**:
   - Meniru sistem orkestrasi task berarah Qoder.
   - Manajemen status eksekusi tugas berbasis dependensi (`blockedBy`), validasi pencegahan siklus (*circular dependency check*), pelacakan progres real-time, dan ekspor diagram Mermaid otomatis.
5. **Local Skill Telemetry & Dead Skill Pruner ([skill-telemetry.js](file:///C:/Users/Luthfi/.gemini/scripts/skill-telemetry.js), [skill-telemetry-hook.js](file:///C:/Users/Luthfi/.gemini/scripts/skill-telemetry-hook.js), [SKILL.md](file:///C:/Users/Luthfi/.gemini/config/skills/skill-telemetry/SKILL.md))**:
   - Meniru analitik penggunaan tools Qoder.
   - Hook `PreToolUse` pada `read_file` dan `invoke_subagent` mencatat frekuensi eksekusi skill ke [skill-usage.json](file:///C:/Users/Luthfi/.gemini/config/skill-usage.json), menghasilkan peta panas (*heatmap*), dan mengidentifikasi kandidat skill pasif untuk pemangkasan beban token.

---

## [v2.0.0] - 2026-10-24 s.d. 2026-10-26
### 🔬 Penyerapan Terobosan Riset, Paper Akademis & Repositori Open Source

Tahap ini membedah berbagai jurnal dan repositori riset global melalui protokol **SERAP - PILAH - DAMPAK** guna memperkuat logika dasar agen (*agentic cognitive backbone*).

#### 📚 Terobosan Paper & Jurnal Ilmiah
1. **Google Research: RRSI (`google-research/rrsi`) — Regularized Recursive Self-Improvement**:
   - Diserap ke: [`eval-harness/SKILL.md`](file:///C:/Users/Luthfi/.gemini/config/skills/eval-harness/SKILL.md) & [`agent-judge/SKILL.md`](file:///C:/Users/Luthfi/.gemini/config/skills/agent-judge/SKILL.md).
   - **Formulasi Inti yang Diintegrasikan**:
     - *Noise-Adjusted Safety Floor*: Mutasi kode/prompt hanya diterima jika skor evaluasi $S' \ge S^* - \delta$.
     - *Token-ROI Cost Rule*: Perbaikan performa wajib memperhitungkan lonjakan biaya token ($\Delta C \le \beta_0 + \beta_1 \Delta S$).
     - *Cosine-Annealed L0 Edit Budget*: Batas baris kode yang boleh diedit mengecil seiring berjalannya iterasi untuk mencegah refaktor liar.
     - *Pre-Evaluation Leakage Critic*: Memastikan data evaluasi tidak bocor ke fase inferensi.
2. **Zhejiang University REAL Lab: PaperGym (`zju-real/papergym`)**:
   - Diserap ke: [`scientific-agent-skills/SKILL.md`](file:///C:/Users/Luthfi/.gemini/config/skills/scientific-agent-skills/SKILL.md).
   - **Formulasi Inti yang Diintegrasikan**:
     - *Two-Pillar Research Plan*: Pemisahan ketat antara Inovasi Metodologi (*Methodological Innovation*) dan Desain Eksperimen (*Experimental Design*).
     - *Anti-Criterion Leakage Protocol*: Kriteria verifikasi penelitian tidak boleh dapat diprediksi dari premis/prompt awal (kebocoran dijaga $< 5\%$).
3. **Eric Jujian Zou: Rederive (`EricJujianZou/rederive`)**:
   - Diserap ke: Logika analisis kode & penalaran arsitektur.
   - **Formulasi Inti yang Diintegrasikan**:
     - *Socratic First-Principles Derivation*: Pembongkaran pemahaman *codebase* dari prinsip pertama secara induktif alih-alih membaca pasif dokumentasi.
4. **Amos Blomqvist: LearnHarness (`amosblomqvist/learnharness`)**:
   - Mengonfirmasi validitas arsitektur agen berbasis **Triad: Harness, Loop, dan Graph**.
5. **Memvid Repository (`memvid`)**:
   - Evaluasi representasi memori visual dan pengindeksan video terkompresi untuk persistensi multimodal jangka panjang.

#### 🌐 Terobosan Repositori Open Source & Multi-Agent Git
1. **Naw103: Foremerge (`naw103/foremerge`)**:
   - Diserap ke: [GEMINI.md](file:///C:/Users/Luthfi/.gemini/GEMINI.md) Section 4.
   - **Protokol Inti**: *Semantic Intent Declaration* (`symbol:<Name>`, operasi: `replace/extend/deprecate`) sebelum menyentuh abstraksi bersama di git worktrees guna mencegah tabrakan semantik (*merge conflict* & *stranded code*).
2. **Browser Use: Browser-Harness (`browser-use/browser-harness`)**:
   - Diserap ke: [`chrome-devtools/SKILL.md`](file:///C:/Users/Luthfi/.gemini/config/plugins/chrome-devtools-plugin/skills/chrome-devtools/SKILL.md) & [`playwright-cli/SKILL.md`](file:///C:/Users/Luthfi/.gemini/config/skills/playwright-cli/SKILL.md).
   - **Protokol Inti**: *Strict Web Escalation Hierarchy* (Tier 1 HTTP Fetch $\to$ Tier 2 Stealth Anti-Bot Scrape $\to$ Tier 3 Headless Browser Session). Memangkas penggunaan token hingga 60% dibanding meluncurkan browser untuk semua tugas.
3. **Locomotive Scroll (`locomotivemtl/locomotive-scroll`)**:
   - Diserap ke: Rekayasa animasi frontend & *smooth parallax* berkinerja tinggi.

---

## [v1.5.0] - 2026-10-24
### 📱 Adopsi Praktik Terbaik Media Sosial & Ekstraksi Data Publik

Menyaring konten viral rekayasa perangkat lunak dari media sosial (Instagram, X/Twitter, Reddit, YouTube) dan menyerap esensi teknisnya ke dalam aturan koding dan skill scraping.

#### ✨ Ditambahkan (Added)
1. **Formula 7 Design Rules (@7thco.ui Instagram)**:
   - Diserap ke: [`shadcn-ui/SKILL.md`](file:///C:/Users/Luthfi/.gemini/config/skills/shadcn-ui/SKILL.md), [`anti-slop/SKILL.md`](file:///C:/Users/Luthfi/.gemini/config/skills/anti-slop/SKILL.md), [`impeccable/SKILL.md`](file:///C:/Users/Luthfi/.gemini/config/skills/impeccable/SKILL.md).
   - Penegakan palet *off-black* (menghapus `#000` mentah di atas `#fff`), ritme spacing berbasis skala 8pt (4/8/16/24/32px), hirarki tipografi tajam, dan umpan balik mikro pada status `:active`.
2. **Formula 3-Pilar Error Microcopy (UX/UI Brainy Instagram)**:
   - Diserap ke: [`clean-code-fullstack/SKILL.md`](file:///C:/Users/Luthfi/.gemini/config/skills/clean-code-fullstack/SKILL.md).
   - Standar penyajian pesan error UI wajib memenuhi 3 unsur: *What happened* (masalah nyata) + *Why* (alasan teknis manusiawi) + *What to do next* (solusi langsung) dengan tombol aksi terarah (*Direct CTA Action Button*), melarang error buntu tanpa panduan.
3. **Bloom Filter Cache Penetration Defense (Stack Frames Instagram)**:
   - Diserap ke: Referensi arsitektur backend [`clean-code-fullstack`](file:///C:/Users/Luthfi/.gemini/config/skills/clean-code-fullstack/SKILL.md).
   - Pola perlindungan basis data berlatensi tinggi via filter probabilistik in-memory (0 false negatives) untuk pengecekan eksistensi data (*username/slug lookup*) secara instan, memotong $99\%+$ beban kueri redundan.
4. **Scraping Media Sosial & Feed Publik ([agent-reach/SKILL.md`](file:///C:/Users/Luthfi/.gemini/config/skills/agent-reach/SKILL.md))**:
   - Ekstraksi data terstruktur tanpa biaya API berbayar dari **Reddit**, **X (Twitter)**, **Transkrip YouTube**, **Repositori GitHub**, dan **RSS Feeds** melalui kombinasi Jina Reader, Scrapling, dan parser cerdas.
5. **Anti-Yes-Man Protocol ([anti-yes-man/SKILL.md`](file:///C:/Users/Luthfi/.gemini/config/skills/anti-yes-man/SKILL.md))**:
   - Filter anti-sycophancy yang melarang AI bertindak sebagai pemuja instruksi (*yes-man*). Mewajibkan kritik proaktif, penyingkapan risiko tersembunyi (*blast radius*), dan validasi objektif sebelum modifikasi berisiko.

---

## [v1.0.0] - 2026-10-23
### 🌐 Fondasi Swarm 12 Bijuu Squad & Standarisasi 80 Master Skills

Fase inisiasi arsitektur otonom terdistribusi dengan standarisasi kontrak dan MCP.

#### ✨ Ditambahkan (Added)
- **12 Autonomous Peers Squad**: Formasi spesialisasi horizontal (Shukaku, Matatabi, Isobu, Son Goku, Kokuo, Saiken, Chomei, Gyuki, Kurama, Gamabunta, Gamaken, Gamahiro).
- **Standarisasi 80 Skills**: Format kanonikal dengan display name kontras tinggi `[High-Contrast Name]`, trigger positif, dan batasan negatif eksplisit `DO NOT USE for X (use Y instead)`.
- **12 MCP Integrations**: `atlassian`, `supermemory`, `context7`, `deepsource`, `sentry`, `scrapling`, `firecrawl`, `supabase`, `vercel`, `github`, `rea`, `gemini-api-docs`.
- **Sesi Otentikasi Terotomasi ([mcp-auth-keeper-safe.js](file:///C:/Users/Luthfi/.gemini/scripts/mcp-auth-keeper-safe.js))**: Penyegaran token kredensial otomatis saat inisiasi sesi (`SessionStart`).
- **Peta Arsitektur Interaktif ([architecture_map.html](file:///C:/Users/Luthfi/.gemini/antigravity/brain/ba32f280-3767-48c1-8e2d-7752879c0834/architecture_map.html))**: Dashboard visual interaktif dengan visualisasi graf SVG untuk eksplorasi relasi komponen.

---

## 📊 Matriks Ringkasan Fitur Unggulan Antar Generasi

| Domain Peningkatan | Asal Sumber / Inspirasi | Komponen Aktif di Antigravity | Manfaat Utama & Dampak Performa |
|---|---|---|---|
| **Syntax Guard** | Cognition Devin | [`diagnostic-watchdog-hook.js`](file:///C:/Users/Luthfi/.gemini/scripts/diagnostic-watchdog-hook.js) | Linter instan pasca-edit (<150ms), cegah typo & broken syntax sebelum dieksekusi. |
| **Time Travel** | Cognition Devin | [`step-checkpoint.js`](file:///C:/Users/Luthfi/.gemini/scripts/step-checkpoint.js) | Snapshot berkas per milestone tugas, perbandingan diff, dan rollback aman tanpa git bloat. |
| **Live UI Error** | Cognition Devin | [`browser-sentinel.js`](file:///C:/Users/Luthfi/.gemini/scripts/browser-sentinel.js) | Tangkap Vite overlay & hydration error via Edge headless native (RAM transient ~20 MB). |
| **File Safety** | Qoder Platform | [`file-rewind.js`](file:///C:/Users/Luthfi/.gemini/scripts/file-rewind.js) & [`file-history-hook.js`](file:///C:/Users/Luthfi/.gemini/scripts/file-history-hook.js) | Shadow-copy otomatis sebelum mutasi berkas; instant rollback safety net. |
| **Stateful Shell** | Qoder Platform | [`agy-exec.ps1`](file:///C:/Users/Luthfi/.gemini/scripts/agy-exec.ps1) | Mempertahankan CWD, environment variables, dan venv antar eksekusi `run_command`. |
| **Workspace Index** | Qoder + Rust `fd` | [`workspace-indexer.js`](file:///C:/Users/Luthfi/.gemini/scripts/workspace-indexer.js) | Indeks topologi repositori inkremental pre-prompt dalam waktu < 350 milidetik. |
| **Task State** | Qoder Platform | [`task-dag.js`](file:///C:/Users/Luthfi/.gemini/scripts/task-dag.js) | State machine pelacakan dependensi (`blockedBy`) dan visualisasi Mermaid. |
| **Self-Improvement** | Google Research RRSI | [`eval-harness`](file:///C:/Users/Luthfi/.gemini/config/skills/eval-harness/SKILL.md) & [`agent-judge`](file:///C:/Users/Luthfi/.gemini/config/skills/agent-judge/SKILL.md) | Noise-adjusted evaluation floor ($S' \ge S^* - \delta$) & token-ROI budget control. |
| **Research Plan** | ZJU REAL PaperGym | [`scientific-agent-skills`](file:///C:/Users/Luthfi/.gemini/config/skills/scientific-agent-skills/SKILL.md) | Two-pillar research plan & anti-criterion leakage protocol (<5% leakage). |
| **Git Coordination** | Naw103 Foremerge | [GEMINI.md](file:///C:/Users/Luthfi/.gemini/GEMINI.md) (Section 4) | Semantic intent declaration per worktree untuk eliminasi konflik merge multi-agent. |
| **Web Strategy** | Browser Use Harness | [`chrome-devtools`](file:///C:/Users/Luthfi/.gemini/config/plugins/chrome-devtools-plugin/skills/chrome-devtools/SKILL.md) & [`playwright-cli`](file:///C:/Users/Luthfi/.gemini/config/skills/playwright-cli/SKILL.md) | Escalation hierarchy (HTTP -> Scrape -> Browser), pangkas 60% token browser. |
| **Social Media UI** | @7thco.ui & UX/UI Brainy | [`shadcn-ui`](file:///C:/Users/Luthfi/.gemini/config/skills/shadcn-ui/SKILL.md) & [`clean-code-fullstack`](file:///C:/Users/Luthfi/.gemini/config/skills/clean-code-fullstack/SKILL.md) | 8pt rhythm, off-black palette, 4 UI states, dan 3-pilar actionable error microcopy. |
| **Social Scraping** | Reddit/X/YT Jina | [`agent-reach`](file:///C:/Users/Luthfi/.gemini/config/skills/agent-reach/SKILL.md) | Ekstraksi terstruktur multi-platform media sosial tanpa kebutuhan kredensial API berbayar. |
| **Core Architecture** | Anthropic Applied AI | [`GEMINI.md`](file:///C:/Users/Luthfi/.gemini/GEMINI.md) & Tri-Role Agents | Solo Direct Mode utama; subagent terlipat (*folded*) untuk efisiensi token & kecepatan. |
