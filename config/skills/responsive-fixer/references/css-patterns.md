# Resep CSS Responsif

Resep siap tempel. Semua memakai CSS modern yang didukung browser evergreen (`clamp()`, `min()`, `dvh`, container queries, `aspect-ratio`). Untuk browser lama, fallback disebut di tempatnya.

## Daftar isi
1. Fondasi dokumen
2. Container fluid dengan batas
3. Grid otomatis
4. Sidebar yang bisa kolaps tanpa media query
5. Anak flex/grid yang menolak mengecil
6. Tipografi fluid
7. Spasi fluid
8. Gambar, video, iframe, canvas
9. Tabel
10. Form dan input
11. Modal / dialog
12. Navigasi
13. Tinggi layar penuh dan safe-area
14. Hover vs sentuh
15. Container queries
16. Breakpoint: kapan dan berapa
17. Teks panjang
18. Landscape HP / layar pendek

## 1. Fondasi dokumen
```html
<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```
`viewport-fit=cover` hanya diperlukan bila memakai `env(safe-area-inset-*)`; tanpa itu, hilangkan.
```css
*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
body { margin: 0; overflow-wrap: break-word; }
img, video { max-width: 100%; height: auto; }
```

## 2. Container fluid dengan batas
```css
:root {
  --gutter: clamp(1rem, 4vw, 3rem);
  --container: 80rem;      /* ~1280px */
  --container-wide: 100rem;
}
.container {
  width: min(100% - 2 * var(--gutter), var(--container));
  margin-inline: auto;
}
```
Ganti `width: 1200px` / `max-width: 1200px; width: 95%` dengan pola di atas. Di layar besar konten berhenti melebar; di HP gutter menyusut otomatis. `min()` didukung browser sejak 2020. Fallback lama: `width: 100%; max-width: 80rem; padding-inline: 1rem;`.

## 3. Grid otomatis
```css
.grid {
  --min: 16rem;
  display: grid;
  gap: clamp(1rem, 2vw, 2rem);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--min)), 1fr));
}
```
Jumlah kolom menyesuaikan lebar tanpa media query. `min(100%, ...)` mencegah kartu lebih lebar dari kontainer di layar 320px. Gunakan `auto-fill` (bukan `auto-fit`) bila ingin kolom kosong tetap menyisakan ruang saat itemnya sedikit.

Kolom tetap untuk layout halaman (mis. konten + aside):
```css
.page { display: grid; gap: var(--gutter); grid-template-columns: minmax(0, 1fr); }
@media (min-width: 64rem) { .page { grid-template-columns: minmax(0, 1fr) 20rem; } }
```
`minmax(0, 1fr)` (bukan `1fr` polos) mencegah konten panjang mendorong kolom melebihi kontainer.

## 4. Sidebar yang bisa kolaps tanpa media query
```css
.with-sidebar { display: flex; flex-wrap: wrap; gap: var(--gutter); }
.with-sidebar > :first-child { flex: 1 1 16rem; }          /* sidebar */
.with-sidebar > :last-child  { flex: 999 1 0; min-inline-size: 60%; }  /* konten */
```
Saat ruang kurang dari ~16rem + 60% konten, sidebar otomatis turun ke atas konten. Untuk aplikasi dengan sidebar navigasi tetap (dashboard), gunakan drawer di layar kecil:
```css
.app { display: grid; grid-template-columns: minmax(0, 1fr); min-height: 100dvh; }
.app__sidebar { position: fixed; inset: 0 auto 0 0; width: min(18rem, 85vw);
  transform: translateX(-100%); transition: transform .2s; z-index: 50; }
.app__sidebar[data-open="true"] { transform: none; }
@media (min-width: 64rem) {
  .app { grid-template-columns: 16rem minmax(0, 1fr); }
  .app__sidebar { position: sticky; top: 0; height: 100dvh; transform: none; }
}
```

## 5. Anak flex/grid yang menolak mengecil
Item flex/grid punya `min-width: auto`, sehingga tidak bisa lebih kecil dari isinya (tabel, `pre`, teks tanpa spasi). Itu penyebab klasik scroll horizontal.
```css
.flex-child, .grid-child { min-width: 0; }
pre, code, .scroll-x { max-width: 100%; overflow-x: auto; }
```

## 6. Tipografi fluid
Skala dengan basis `rem` + `vw` di dalam `clamp()`, interpolasi linear dari lebar 320px ke 1440px (rasio 1.25). Karena ada komponen `rem`, zoom/pengaturan ukuran teks pengguna tetap berpengaruh.
```css
:root {
  --step--1: clamp(0.8rem,   0.771rem + 0.143vw, 0.9rem);
  --step-0:  clamp(1rem,     0.964rem + 0.179vw, 1.125rem);
  --step-1:  clamp(1.25rem,  1.205rem + 0.223vw, 1.406rem);
  --step-2:  clamp(1.563rem, 1.507rem + 0.279vw, 1.758rem);
  --step-3:  clamp(1.953rem, 1.883rem + 0.349vw, 2.197rem);
  --step-4:  clamp(2.441rem, 2.354rem + 0.436vw, 2.747rem);
}
body { font-size: var(--step-0); line-height: 1.5; }
h1 { font-size: var(--step-4); line-height: 1.15; }
h2 { font-size: var(--step-3); line-height: 1.2; }
h3 { font-size: var(--step-2); }
small, .caption { font-size: var(--step--1); }
p { max-width: 65ch; }
```
Untuk menyesuaikan ke desain sendiri: `clamp(MIN, INTERSEP + SLOPE*vw, MAX)` dengan `SLOPE = (MAX - MIN) / (lebarMax - lebarMin)` dan `INTERSEP = MIN - SLOPE * lebarMin` (semua dalam px, lalu bagi 16 untuk rem; slope dikali 100 untuk `vw`). Batas atas `MAX` yang membuat teks tidak menjadi raksasa di layar lebar.

Untuk layar sangat besar (TV/4K), lihat skala root di `large-screens-tv.md` agar token ini ikut membesar.

## 7. Spasi fluid
```css
:root {
  --space-s: clamp(0.5rem, 0.4rem + 0.5vw, 0.75rem);
  --space-m: clamp(1rem, 0.8rem + 1vw, 1.5rem);
  --space-l: clamp(2rem, 1.4rem + 3vw, 4rem);
}
section { padding-block: var(--space-l); }
```
Ganti `padding: 64px` yang sama di semua layar dengan token seperti ini.

## 8. Gambar, video, iframe, canvas
```css
img, video { max-width: 100%; height: auto; }
.media { aspect-ratio: 16 / 9; width: 100%; }
.media > img, .media > video { width: 100%; height: 100%; object-fit: cover; }
.embed { position: relative; aspect-ratio: 16 / 9; width: 100%; }
.embed > iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
```
Gambar responsif dengan resolusi sesuai:
```html
<img src="foto-800.jpg" width="1600" height="900" alt="..."
     srcset="foto-480.jpg 480w, foto-800.jpg 800w, foto-1600.jpg 1600w"
     sizes="(min-width: 64rem) 50vw, 100vw">
```
Chart (Chart.js dan sejenis): bungkus canvas dalam div ber-`position: relative` dengan tinggi berbasis `aspect-ratio`/`min-height`, dan aktifkan opsi responsive library-nya (Chart.js: `responsive: true, maintainAspectRatio: false`). Library yang tidak otomatis resize perlu `ResizeObserver` pada wrapper yang memanggil `chart.resize()`.

## 9. Tabel
Opsi A, scroll horizontal terkontrol (paling aman, tidak mengubah markup tabel):
```html
<div class="table-scroll" role="region" aria-label="Tabel data" tabindex="0">
  <table>...</table>
</div>
```
```css
.table-scroll { max-width: 100%; overflow-x: auto; }
.table-scroll table { min-width: 36rem; width: 100%; border-collapse: collapse; }
```
Opsi B, jadi kartu di layar kecil (butuh `data-label` di tiap `td`):
```css
@media (max-width: 40rem) {
  table, thead, tbody, tr, th, td { display: block; }
  thead { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); }
  tr { margin-block: 0 1rem; border: 1px solid #ddd; border-radius: .5rem; }
  td { display: flex; justify-content: space-between; gap: 1rem; padding: .5rem .75rem; }
  td::before { content: attr(data-label); font-weight: 600; }
}
```
Opsi B mengubah semantik tabel bagi pembaca layar; pakai hanya untuk tabel sederhana dan pertahankan Opsi A bila tabel kompleks.

## 10. Form dan input
```css
input, select, textarea, button { font: inherit; }
input:not([type="checkbox"]):not([type="radio"]), select, textarea {
  width: 100%; max-width: 100%;
  font-size: max(1rem, 16px);      /* mencegah zoom otomatis iOS saat fokus */
  min-height: 2.75rem;
}
.field-row { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr)); }
```
Jangan menyelesaikan masalah zoom iOS dengan `maximum-scale=1`.

## 11. Modal / dialog
```css
.modal {
  width: min(100% - 2rem, 40rem);
  max-height: calc(100dvh - 2rem);   /* fallback: calc(100vh - 2rem) ditulis sebelum baris ini */
  overflow: auto;
  margin: auto;
}
@media (max-width: 40rem) {          /* sheet penuh di HP, opsional */
  .modal--sheet { width: 100%; max-height: 92dvh; margin-block-end: 0; border-radius: 1rem 1rem 0 0; }
}
```
Pastikan tombol aksi tetap terlihat: jadikan footer `position: sticky; bottom: 0` di dalam area scroll modal.

## 12. Navigasi
Pola paling tahan banting: tampilkan tautan inline bila muat, kolaps ke tombol menu bila tidak. Dengan breakpoint:
```css
.nav__toggle { display: inline-flex; }
.nav__list { display: none; flex-direction: column; }
.nav[data-open="true"] .nav__list { display: flex; }
@media (min-width: 48rem) {
  .nav__toggle { display: none; }
  .nav__list { display: flex; flex-direction: row; gap: 1.5rem; }
}
```
Untuk banyak item (7+), pertimbangkan menu "More" atau bar scroll horizontal dengan `overflow-x: auto; scroll-snap-type: x proximity`. Pastikan toggle punya `aria-expanded` dan `aria-controls`.

## 13. Tinggi layar penuh dan safe-area
```css
.full { min-height: 100vh; min-height: 100dvh; }   /* fallback dulu, lalu dvh */
.hero { min-height: min(100svh, 56rem); }          /* svh = viewport terkecil, tidak loncat */
.bottom-bar {
  position: fixed; inset-inline: 0; bottom: 0;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
.page { padding-inline: max(var(--gutter), env(safe-area-inset-left, 0px)) max(var(--gutter), env(safe-area-inset-right, 0px)); }
```
`dvh` menyesuaikan saat toolbar browser muncul/hilang, `svh` konstan (viewport saat toolbar tampil), `lvh` saat toolbar tersembunyi. Pakai `min-height`, bukan `height`, agar konten tidak terpotong.

## 14. Hover vs sentuh
```css
@media (hover: hover) and (pointer: fine) {
  .card:hover { transform: translateY(-2px); }
  .menu-item:hover > .submenu { display: block; }
}
@media (pointer: coarse) {
  button, [role="button"], select, summary, input:not([type="checkbox"]):not([type="radio"]) { min-height: 44px; }
  .icon-btn { min-width: 44px; }
}
```
Submenu yang hanya terbuka lewat hover harus punya pemicu klik/tap (tombol dengan `aria-expanded`).

## 15. Container queries
Pakai saat **komponen** (kartu, widget) harus beradaptasi pada lebar tempatnya berada, bukan lebar layar. Sangat berguna untuk komponen yang dipakai di sidebar dan di area utama.
```css
.card-wrap { container-type: inline-size; }
.card { display: grid; gap: 1rem; }
@container (min-width: 28rem) {
  .card { grid-template-columns: 10rem 1fr; }
}
```
Didukung browser evergreen modern; untuk target browser/TV lama, sediakan tata letak dasar yang tetap layak tanpa aturan `@container`.

## 16. Breakpoint: kapan dan berapa
- Tulis **mobile-first**: gaya dasar untuk layar kecil, tambah `@media (min-width: ...)`.
- Gunakan `em`/`rem` pada media query (mis. `48em` = 768px bila font 16px) supaya ikut zoom/ukuran teks pengguna.
- Titik awal yang masuk akal (sesuaikan dengan titik rusak sebenarnya): 40rem (640), 48rem (768), 64rem (1024), 80rem (1280), 96rem (1536), 120rem (1920), 160rem (2560).
- Tambah breakpoint **hanya** ketika sesuatu rusak/tidak optimal; hindari membuat satu per device.
- Hindari tumpang tindih `max-width: 768px` dan `min-width: 768px` (keduanya aktif di tepat 768px); gunakan `min-width: 48rem` dan `max-width: 47.99rem`, atau range syntax `@media (width < 48rem)` / `(48rem <= width < 64rem)`.

## 17. Teks panjang
```css
.break { overflow-wrap: anywhere; }              /* URL, email, token, nama panjang */
.clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
```
`.truncate` di dalam flex/grid wajib `min-width: 0` pada item induknya.

## 18. Landscape HP / layar pendek
```css
@media (max-height: 30rem) and (orientation: landscape) {
  .hero { min-height: 0; padding-block: 1rem; }
  .header--sticky { position: static; }       /* header fixed memakan sepertiga tinggi */
  .modal { max-height: 100dvh; }
}
```
Hindari tinggi elemen berbasis `vh` (mis. `height: 60vh` untuk hero) yang menjadi terlalu kecil/besar di orientasi ini; pakai `min-height` dengan batas (`clamp(14rem, 50svh, 40rem)`).
