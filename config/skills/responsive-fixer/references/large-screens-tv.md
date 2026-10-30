# Layar Besar, Ultrawide, 4K, dan TV

Dua keluhan yang sering tertukar: **"terlalu kecil dan lapang"** (konten kecil di tengah layar luas) dan **"terlalu besar / terpotong"** (elemen raksasa, tidak muat). Penyebabnya berbeda, jadi ukur dulu sebelum mengubah apa pun.

## Daftar isi
1. Ukur dulu: viewport TV tidak bisa ditebak
2. Terlalu kecil di layar besar
3. Terlalu besar di TV
4. Mode TV (10-foot UI)
5. Margin aman (overscan)
6. Fokus dan navigasi remote
7. Kanvas tetap (signage, kiosk, dashboard)
8. Ultrawide
9. Checklist cepat

## 1. Ukur dulu: viewport TV tidak bisa ditebak
Browser TV melaporkan ukuran berbeda antar merek, OS, dan mode. Yang sering ditemui: 1920x1080 @1x, 1280x720 @1.5x, 960x540 @2x, dan 3840x2160 @1x atau @2x. Panel 4K tidak otomatis berarti viewport 3840px.

Tampilkan angka sebenarnya di perangkat/emulator target (tempel sementara di halaman, atau query `?debug`):
```html
<script>
  const info = () => `${innerWidth}x${innerHeight} @${devicePixelRatio}x | screen ${screen.width}x${screen.height}`;
  const d = document.createElement('div');
  d.style.cssText = 'position:fixed;left:0;bottom:0;z-index:99999;background:#000;color:#0f0;font:16px monospace;padding:4px';
  const tick = () => d.textContent = info();
  document.body.append(d); tick(); addEventListener('resize', tick);
</script>
```
Dengan angka itu Anda tahu apakah masalahnya skala (DPR/zoom) atau memang CSS yang tidak punya penanganan layar besar. Jangan menyatakan "beres di TV" tanpa data seperti ini.

## 2. Terlalu kecil di layar besar
Gejala: konten mungil di tengah, ruang kosong melimpah, atau teks 14px terbaca kecil dari sofa. Penyebab umum: tidak ada `max-width`, tipografi berhenti di ukuran desktop, tidak ada tingkat skala di atas 1440px.

Perbaikan bertahap:
1. **Batasi dan pusatkan** konten (container `min(100% - gutter, 80rem)`), jangan biarkan melar; beri `--container-wide` bila UI memang padat (dashboard).
2. **Skalakan root font** di layar besar, supaya semua ukuran `rem` (teks, spasi, ikon) ikut membesar proporsional. Aman karena opt-in lewat atribut:
   ```css
   @media (min-width: 160rem) { html[data-scale="auto"] { font-size: 112.5%; } }  /* >= 2560px */
   @media (min-width: 200rem) { html[data-scale="auto"] { font-size: 137.5%; } }  /* >= 3200px */
   ```
   Pasang `<html data-scale="auto">` hanya setelah memastikan seluruh UI memakai `rem`. Nilai px tetap tidak ikut membesar; konversi dulu (px / 16 = rem).
3. **Tingkatkan batas atas `clamp()`** untuk heading/hero agar tidak berhenti di 2.7rem pada layar 4K.
4. **Batasi panjang baris** (`max-width: 65ch`); layar lebar membuat baris terlalu panjang dan sulit dibaca. Gunakan kolom (`columns`), grid, atau ruang margin.
5. **Grid menambah kolom, bukan melebarkan kartu**: pola `auto-fit/minmax` dengan `max-width` container sudah mengurus ini.

## 3. Terlalu besar di TV
Gejala: elemen raksasa, teks memenuhi layar, sebagian terpotong. Penyebab umum:
- Ukuran berbasis `vw`/`vh` tanpa batas atas, atau `html { font-size: Nvw }` yang tumbuh tanpa kendali.
- Skala root diterapkan di atas viewport yang **sudah** diperbesar oleh DPR TV (mis. 960x540 @2x lalu root font dinaikkan lagi). Double-scaling.
- `zoom`/`transform: scale()` global ditumpuk dengan skala bawaan TV.
- Tinggi `vh` pada rasio non-16:9 (mis. TV portrait signage).

Perbaikan: ukur viewport (bagian 1), hapus skala ganda, beri batas `clamp()` pada semua ukuran berbasis `vw`, dan pilih **satu** strategi skala (root font **atau** kanvas tetap, bukan keduanya).

## 4. Mode TV (10-foot UI)
Jika produknya memang dilihat dari jauh (aplikasi TV, dashboard ruang rapat), buat mode khusus yang bersumber dari satu aturan skala: 1rem sebanding dengan lebar layar, sehingga tampilan identik di semua resolusi TV.
```css
html[data-ui="tv"] { font-size: clamp(8px, 1.25vw, 64px); }  /* 1rem = 1/80 lebar layar: 24px @1920, 16px @1280 */
html[data-ui="tv"] body { font-size: 1rem; line-height: 1.4; }  /* ~24px @1080p: batas bawah nyaman dari jauh */
html[data-ui="tv"] .tv-safe { padding: max(3vh, 1rem) max(3.5vw, 1rem); }
```
Konsekuensi: semua ukuran harus dalam `rem`/`%`/`fr`; piksel tetap tidak ikut skala. Untuk teks, pegangan umum: isi ~24px dan tidak ada yang di bawah ~20px pada 1080p; judul 40px ke atas. Kontras tinggi, hindari teks tipis.

Menyalakan mode TV: lebih andal dengan sinyal eksplisit (parameter `?ui=tv`, pengaturan aplikasi, atau build TV) daripada menebak. Jika harus menebak, UA sniffing hanya sebagai petunjuk:
```js
const ua = navigator.userAgent;
const looksLikeTV = /SMART-TV|SmartTV|Tizen|Web0S|WebOS|NetCast|HbbTV|Android TV|GoogleTV|BRAVIA|AFT[A-Z]|VIDAA|CrKey/i.test(ua);
const explicit = new URLSearchParams(location.search).get('ui');
if (explicit === 'tv' || (explicit == null && looksLikeTV)) document.documentElement.dataset.ui = 'tv';
```
Daftar UA ini heuristik, tidak lengkap, dan berubah antar firmware; tetap sediakan override manual.

## 5. Margin aman (overscan)
TV lama memotong tepi layar (overscan); banyak TV modern tidak, tetapi tepi tetap enak dilihat bila diberi napas. Beri jarak sekitar 3-5% dari tepi untuk konten penting (judul, tombol, subtitle), sementara latar boleh penuh sampai tepi (`.tv-safe` di atas).

## 6. Fokus dan navigasi remote
Remote/D-pad tidak punya kursor.
- Semua elemen interaktif harus bisa difokus (`button`, `a[href]`, atau `tabindex="0"`), dengan urutan DOM logis.
- Fokus sangat terlihat; jangan hanya mengandalkan warna tipis:
  ```css
  :focus-visible { outline: 0.2rem solid #fff; outline-offset: 0.2rem; box-shadow: 0 0 0 0.35rem #1a73e8; }
  .tile:focus-visible { transform: scale(1.06); transition: transform .12s; }
  ```
- Hindari fungsi yang hanya ada pada `:hover`.
- Navigasi 2D (grid kartu) sering perlu penanganan tombol panah sendiri (`keydown` ArrowLeft/Right/Up/Down -> fokus ke elemen tetangga). Beberapa platform TV punya spatial navigation bawaan atau library; cek dokumentasi platform target.
- Tombol Back/Enter berbeda per platform (kode tombol remote bervariasi); jangan hardcode tanpa memeriksa platform.
- Scroll: gunakan `scroll-margin`/`scrollIntoView({block: 'nearest', inline: 'nearest'})` saat fokus berpindah.

## 7. Kanvas tetap (signage, kiosk, dashboard)
Untuk tampilan yang desainnya memang satu ukuran (mis. dashboard 1920x1080 di layar ruang kontrol) dan interaksinya minim, memperbesar/mengecilkan seluruh kanvas dengan letterbox lebih sederhana dan konsisten daripada membuat semuanya fluid. Ini satu-satunya kasus di mana `transform: scale()` global dibenarkan.
```html
<div id="stage"> ...desain 1920x1080... </div>
```
```css
html, body { margin: 0; height: 100%; overflow: hidden; background: #000; }
#stage { position: fixed; left: 50%; top: 50%; width: 1920px; height: 1080px;
         transform-origin: center center; }
```
```js
const W = 1920, H = 1080, stage = document.getElementById('stage');
const fit = () => {
  const s = Math.min(innerWidth / W, innerHeight / H);
  stage.style.transform = `translate(-50%, -50%) scale(${s})`;
};
addEventListener('resize', fit); fit();
```
Batasan: teks bisa sedikit buram pada skala non-bulat, input teks di layar sentuh kecil menjadi sulit, dan tidak cocok untuk situs konten biasa yang dibuka di HP. Jangan pakai pola ini untuk halaman yang diharapkan responsif di perangkat sentuh.

## 8. Ultrawide
- Rasio 21:9 / 32:9: pertahankan `max-width` container; sisa ruang jadi margin. Jangan ikat tinggi hero ke lebar (`vw`).
- Dashboard yang harus memanfaatkan lebar: tambah kolom (grid `auto-fit`) dan batasi lebar tiap kartu, bukan memperlebarnya.
- Video/gambar hero: `object-fit: cover` dengan `object-position` yang menjaga subjek; uji pada 3440x1440.
- Elemen `position: fixed` di sudut jauh mudah luput dari pandangan; kelompokkan dekat konten utama.

## 9. Checklist cepat
- [ ] Ukuran viewport + DPR target sudah diukur.
- [ ] Container berbatas; baris prosa <= ~75 karakter.
- [ ] Hanya satu strategi skala (root font **atau** kanvas tetap).
- [ ] Semua ukuran berbasis `vw` punya `clamp()` dan batas atas.
- [ ] Ukuran UI dalam `rem` (bila pakai skala root).
- [ ] Margin aman 3-5% untuk konten kunci di TV.
- [ ] Fokus terlihat dan bisa dijangkau dengan remote.
- [ ] Diuji di emulator/perangkat target; hal yang belum diuji disebutkan terus terang.
