# Sumber Registry & Multi-Source Discovery untuk Agent Skills

Dokumen ini memetakan sumber-sumber resmi dan komunitas untuk menemukan Agent Skills berkualitas tinggi yang kompatibel dengan Antigravity:

## 1. Vercel Skills Open Registry (skills.sh)
- **Engine**: `npx --yes skills`
- **Cakupan**: 350.000+ skills lintas ekosistem (Antigravity, Claude Code, Cursor, Codex).
- **Perintah CLI Cepat**:
  ```powershell
  # Cari skill berdasarkan keyword
  npx --yes skills find "<keyword>" --json
  
  # Cek daftar skill di dalam repo sebelum install
  npx --yes skills add <owner/repo> --list
  
  # Install non-interaktif dengan menyalin berkas
  npx --yes skills add <owner/repo@skill> --agent antigravity --copy -y
  ```

## 2. MCP Servers Open Directory (mcpservers.org)
- **URL**: `https://mcpservers.org/id/agent-skills`
- **Fokus**: Skill resmi dari vendor (Anthropic, Supabase, Vercel, Microsoft, Cloudflare, GitHub).
- **Metode Pengambilan**: Gunakan `scrapling` tool `make_request` untuk mengekstrak markdown instruksi.

## 3. GitHub Search & Direct Repositories
- **Query Format**: `topic:agent-skills <keyword>` atau `filename:SKILL.md <keyword>`
- **Keunggulan**: Memungkinkan inspeksi kode mentah, commit provenance, dan verifikasi keamanan sebelum diunduh.
