/**
 * session-end-cleanup.js
 * Hook yang berjalan saat session berakhir:
 * - Mencetak reminder wajib ke agent: simpan context ke Supermemory
 * - Log session end timestamp ke file
 *
 * CATATAN: Supermemory tidak bisa di-call langsung dari hook script
 * (tidak ada API key di hook context). Hook ini hanya mencetak reminder
 * ke stdout agar agent melihatnya sebagai context injection.
 */

const fs = require('fs');
const path = require('path');

const LOG_PATH = 'C:\\Users\\Luthfi\\.gemini\\scripts\\logs\\session-end.log';

const logDir = path.dirname(LOG_PATH);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const ts = new Date().toISOString();
fs.appendFileSync(LOG_PATH, `[${ts}] Session ended.\n`, 'utf8');

// Context injection ke agent via stdout
// Antigravity hook akan memasukkan ini ke context window agent
console.log(`
[SESSION-END REMINDER] Sesi Antigravity berakhir pada ${ts}.
Wajib dipenuhi sebelum menutup percakapan:
1. Panggil supermemory add_memory untuk menyimpan keputusan arsitektural penting dari sesi ini.
2. Jika ada bug atau violation baru yang ditemukan, catat ke VIOLATIONS_LEDGER.md.
3. Bersihkan scratch files sementara yang tidak diperlukan.
`);

process.exit(0);
