---
name: responsive-fixer
description: Mendiagnosis dan memperbaiki tampilan web/aplikasi yang belum responsif di semua ukuran dan rasio layar - berantakan di HP/tablet, horizontal scroll, teks terlalu kecil/besar, layout pecah di layar menengah, terlalu besar atau terlalu kecil di TV/4K/ultrawide, 100vh terpotong, notch/safe-area, tabel/gambar/modal meluber. Gunakan skill ini setiap kali pengguna menyebut responsive, responsif, mobile-friendly, media query, breakpoint, viewport, "tidak pas di layar", "overflow", "kebesaran", "kekecilan", "scaling", atau mengeluh tampilan rusak di device tertentu (HP, tablet, TV, monitor besar, foldable, landscape) - bahkan jika kata "responsive" tidak disebut. Also use for fixing responsive/adaptive design, fluid typography, and cross-device or TV/large-screen UI in HTML/CSS/Tailwind/Bootstrap/React/Vue/Angular/Flutter/React Native.
---

# Responsive Fixer

Skill ini untuk memperbaiki sistem (website, web app, dashboard, aplikasi hybrid/native) yang tampilannya hanya bagus di satu ukuran layar. Gejalanya biasanya: berantakan di HP dan tablet, layar TV/monitor besar terlihat kebesaran atau kekecilan, ada scroll horizontal, atau elemen saling tindih.

## Prinsip inti

Hampir semua masalah responsif berasal dari sedikit akar masalah yang berulang (lebar px tetap, viewport meta hilang, `100vh`, tidak ada batas lebar di layar besar, font px kaku). Karena itu perbaiki di **akar** (base CSS, layout shell, token), bukan menambal satu per satu per halaman. Tambalan per device (`@media (max-width: 375px)`) membuat masalah pindah ke device berikutnya.

1. **Fluid dulu, breakpoint belakangan.** Pakai `%`, `fr`, `minmax()`, `clamp()`, `min()`, `rem`, `ch`, `aspect-ratio`. Breakpoint hanya untuk perubahan struktur (sidebar jadi drawer, 3 kolom jadi 1), dan ditentukan oleh **konten** yang mulai rusak, bukan nama device.
2. **Mobile-first dengan `min-width`**, lalu **beri batas atas** untuk layar besar (max-width container, skala font terbatas). Tanpa batas atas, layar lebar akan membuat konten melar dan kekecilan.
3. **Tiga zona gagal berbeda:** kecil (<640px: overflow, tap target, font), menengah (640-1100px: layout "nanggung" di tablet/landscape), besar (>=1600px: konten melar, teks kecil, atau skala TV). Periksa ketiganya, jangan hanya HP.
4. **Jangan merusak tampilan desktop yang sudah benar.** Pertahankan hasil di lebar desain aslinya; perubahan harus aditif atau menggantikan nilai kaku dengan nilai fluid yang setara di lebar itu.
5. **Buktikan dengan pengukuran**, bukan perkiraan. Klaim "sudah responsif" hanya boleh setelah dicek di matriks ukuran (lihat Langkah 4).

## Alur kerja

### Langkah 0 - Pahami konteks (singkat)
Tentukan stack (HTML/CSS biasa, Tailwind, Bootstrap, React/Vue/Angular, CMS seperti WordPress/Laravel Blade, atau Flutter/React Native) dan gejala spesifik yang dilihat pengguna. Kalau kode tersedia, baca kodenya dulu daripada bertanya. Bertanya hanya jika benar-benar buntu (misalnya tidak ada kode dan tidak ada gambaran stack); sebutkan asumsi Anda lalu lanjut.

Jika pengguna hanya mendeskripsikan masalah tanpa kode, berikan diagnosis berdasarkan tabel gejala di bawah plus resep perbaikan yang bisa langsung ditempel, dan minta file/struktur proyek untuk perbaikan yang presisi.

### Langkah 1 - Audit
1. Jalankan pemindai statis (cepat, tanpa dependensi):
   ```bash
   python3 scripts/audit_responsive.py <folder-proyek> [--json] [--max-per-rule 8]
   ```
   Hasilnya daftar temuan berurutan keparahan (viewport meta, lebar px kaku, `100vh`/`100vw`, font `vw` tanpa `clamp`, tidak ada breakpoint menengah/besar, tabel tanpa wrapper, dll.). Anggap ini **petunjuk**, bukan vonis: verifikasi tiap temuan dengan membaca konteksnya.
2. Baca manual "cangkang" layout: file HTML root / `index.html`, layout utama (`App`, `layout.tsx`, master blade), CSS global/reset, dan komponen navigasi/sidebar/tabel/modal. Di sinilah akar masalah biasanya bersembunyi.
3. Untuk daftar pemeriksaan lengkap per lapisan, baca `references/diagnosis-checklist.md`.

### Langkah 2 - Diagnosis
Petakan gejala ke penyebab memakai tabel ini, lalu pilih resep dari `references/css-patterns.md`.

| Gejala | Penyebab paling mungkin | Arah perbaikan |
|---|---|---|
| Halaman tampak "diperkecil" di HP, teks mungil | `<meta viewport>` hilang atau `width=1024`; layout lebar tetap | Pasang `width=device-width, initial-scale=1`; ganti lebar tetap dengan fluid |
| Scroll horizontal di HP | Elemen `width: NNNpx`, `100vw` + scrollbar, tabel/`pre`/gambar lebar, margin negatif, teks panjang tanpa pemotongan, anak flex/grid tanpa `min-width: 0` | Cari pelaku sebenarnya (lihat `scripts/screenshot_matrix.py`), jangan tutup dengan `overflow-x: hidden` di body |
| Berantakan di tablet / landscape HP | Hanya ada breakpoint "HP" dan "desktop"; sidebar/kolom tetap; tinggi berbasis `vh` | Tambah penanganan menengah: `auto-fit/minmax`, flex-wrap, container query; `min-height` bukan `height` |
| Bagian bawah terpotong / loncat di browser HP | `100vh` termasuk area address bar | `min-height: 100dvh` dengan fallback `100vh` |
| Konten tertutup notch / home bar / poni | Tidak ada safe-area | `viewport-fit=cover` + `env(safe-area-inset-*)` |
| iOS zoom sendiri saat fokus ke input | `font-size` input < 16px | Input minimal 16px; jangan "memperbaiki" dengan `user-scalable=no` |
| Menu hover tidak jalan di layar sentuh | Interaksi hanya `:hover` | `@media (hover: hover)` untuk hover, sediakan klik/tap |
| Tombol sulit ditekan | Target sentuh < 44px | `min-height/min-width` 44px pada `pointer: coarse` |
| Tabel meluber | Tabel lebar di kontainer sempit | Wrapper `overflow-x: auto`, atau ubah jadi kartu di layar kecil |
| Gambar/video/iframe gepeng atau meluber | Atribut `width`/`height` kaku, tanpa `max-width` | `max-width: 100%; height: auto`, `aspect-ratio`, `object-fit` |
| **Di TV/monitor besar terlalu kecil**, ada ruang kosong luas | Tanpa batas lebar, font px kecil, tidak ada skala untuk layar besar | Container `max-width`, root font skala bertahap, tipografi `clamp()` dengan batas atas besar |
| **Di TV terlalu besar**, elemen raksasa, terpotong | Ukuran berbasis `vw` tanpa batas, root font diskalakan berlebihan, atau TV melaporkan viewport tak terduga (mis. 960x540 @2x) | Ukur `innerWidth`/`devicePixelRatio` di perangkat nyata, tambahkan batas `clamp()`, atur margin aman |
| Layout ultrawide (21:9, 32:9) melar | Tidak ada `max-width`; layout mengikuti lebar penuh | Batasi container; sebar ekstra ruang sebagai margin |
| Foldable / jendela diubah ukuran / zoom 200% rusak | Asumsi ukuran tetap, `user-scalable=no`, unit px | Unit relatif, uji pada lebar 280-360px dan zoom 200% |

### Langkah 3 - Perbaiki (urutan penting)
Kerjakan dari fondasi ke detail; setiap tingkat mengurangi pekerjaan di tingkat berikutnya.

1. **Fondasi dokumen**: viewport meta, `box-sizing: border-box`, `text-size-adjust`, `max-width: 100%` untuk media. Boleh mulai dari `assets/responsive-base.css` (drop-in, aman, ber-komentar) lalu sesuaikan dengan token/gaya proyek.
2. **Cangkang layout**: container fluid dengan batas (`width: min(100% - 2*gutter, max)`), header/sidebar/footer. Sidebar tetap -> pola flex-wrap atau drawer di layar kecil.
3. **Grid dan komponen**: kolom kaku -> `repeat(auto-fit, minmax(min(100%, 16rem), 1fr))`; anak flex/grid diberi `min-width: 0`; kartu, form, modal, tabel mengikuti resep.
4. **Tipografi dan spasi**: skala fluid dengan `clamp()` berbatas atas dan bawah (menyertakan `rem` agar zoom pengguna tetap bekerja); line-length prosa `max-width: 65ch`.
5. **Media**: gambar `max-width: 100%`, `aspect-ratio`, `srcset/sizes` bila relevan, iframe/peta dibungkus rasio.
6. **Input dan sentuh**: font input >= 16px, target sentuh, `hover: hover`, `pointer: coarse`, safe-area, `dvh`.
7. **Layar besar dan TV**: baca `references/large-screens-tv.md` (skala root, margin aman, navigasi fokus/D-pad, kanvas tetap untuk signage). Aktifkan hanya jika konteksnya memang layar besar/TV.
8. **Framework**: terapkan lewat mekanisme framework-nya (config breakpoint Tailwind, Sass map Bootstrap, theme MUI, `LayoutBuilder` Flutter, dst.) - lihat `references/frameworks.md`. Jangan menumpuk CSS liar di atas framework yang punya sistemnya sendiri.

### Langkah 4 - Verifikasi
Pilih yang tersedia, urut dari paling kuat:

1. **Otomatis (Playwright)**: `python3 scripts/screenshot_matrix.py <url-atau-file.html> --preset quick --out shots/`. Mengambil screenshot di matriks ukuran, mengukur scroll horizontal, menyebut elemen penyebab overflow, menandai halaman yang "diperkecil" di HP (lebar layout tidak sama dengan lebar device, tanda viewport meta hilang/kaku), teks < 12px, target sentuh kecil, dan baris teks terlalu panjang di layar besar. Preset: `quick`, `full`, `tv`, atau `--sizes 390x844,1920x1080@2`. Jika Playwright/Chromium belum terpasang, skrip memberi instruksi instalasi; bila lingkungan tidak punya internet, lewati ke opsi 2.
2. **Manual terpandu**: buka `assets/viewport-tester.html` di browser; masukkan URL atau path, lalu geser antar preset (HP, tablet, laptop, TV, ultrawide) dan mode matriks. Catatan: iframe tidak meniru DPR/sentuh, hanya lebar-tinggi.
3. **Penalaran dengan checklist** di `references/device-matrix.md` bila tidak ada cara menjalankan browser. Katakan terus terang bahwa ini belum diuji di browser sungguhan.

Lulus berarti: tidak ada scroll horizontal di semua ukuran; tidak ada elemen terpotong; teks terbaca (>= 16px basis di HP); target sentuh nyaman; di layar besar konten terbatas dan seimbang; tampilan desktop lama tidak berubah tanpa alasan.

### Langkah 5 - Laporan
Tulis ringkas dengan format ini (sesuaikan bahasa dengan pengguna):

```
## Hasil
- Akar masalah: <1-3 poin, bukan daftar gejala>
- Perubahan: <file -> apa yang diubah dan mengapa>
- Diverifikasi di: <ukuran/alat yang benar-benar dipakai>
- Belum terverifikasi / risiko: <jujur, termasuk perangkat nyata seperti TV tertentu>
- Cara menguji sendiri: <perintah atau langkah singkat>
```

Bila proyek diubah dari upload, simpan hasilnya di `/mnt/user-data/outputs/` (file yang berubah, atau zip proyek bila banyak) dan sertakan ringkasan perubahan.

## Hal yang dihindari

- `user-scalable=no` / `maximum-scale=1`: memblokir zoom (masalah aksesibilitas) dan bukan solusi responsif.
- `overflow-x: hidden` di `html/body` sebagai penutup gejala; temukan elemen penyebabnya.
- `!important` massal, atau breakpoint per nama device (iPhone 12, iPad). Ukuran device terus berubah.
- `font-size: Nvw` tanpa `clamp()` (merusak zoom dan jadi raksasa di TV).
- Menyembunyikan konten di mobile (`display: none`) sebagai "perbaikan" tanpa persetujuan pengguna.
- `zoom` atau `transform: scale()` pada seluruh halaman, **kecuali** untuk kanvas desain tetap (signage, dashboard kiosk) - lihat `references/large-screens-tv.md`.
- Mengklaim sudah beres di TV tanpa pengukuran: viewport TV sangat bervariasi antar merek/OS.

## Referensi

- `references/diagnosis-checklist.md` - checklist audit per lapisan (dokumen, layout, tipografi, media, interaksi, layar besar)
- `references/css-patterns.md` - resep CSS siap pakai (container, grid, sidebar, tabel, form, modal, nav, safe-area, fluid type, container query)
- `references/large-screens-tv.md` - ultrawide, 4K, TV, 10-foot UI, kanvas tetap
- `references/frameworks.md` - Tailwind, Bootstrap, MUI/Chakra, Vue/Angular, CMS, Flutter, React Native, native
- `references/device-matrix.md` - matriks ukuran uji dan catatan rasio
- `scripts/audit_responsive.py`, `scripts/screenshot_matrix.py` - alat audit dan verifikasi
- `assets/responsive-base.css`, `assets/viewport-tester.html` - fondasi CSS dan penguji manual
