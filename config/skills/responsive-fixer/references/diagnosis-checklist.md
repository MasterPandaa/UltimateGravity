# Checklist Diagnosis Responsif

Gunakan setelah menjalankan `scripts/audit_responsive.py`. Centang per lapisan; tiap "tidak" adalah kandidat akar masalah.

## Daftar isi
1. Dokumen
2. Layout
3. Tipografi dan spasi
4. Media
5. Komponen
6. Interaksi dan perangkat
7. Layar besar / TV
8. Pelaku overflow (cara berburu)

## 1. Dokumen
- [ ] `<meta name="viewport" content="width=device-width, initial-scale=1">` ada di setiap template/halaman root (juga halaman error, login, dan embed).
- [ ] Tidak ada `user-scalable=no`, `maximum-scale=1`, atau `width=1024`/angka tetap di viewport.
- [ ] `<!doctype html>` ada (tanpa itu browser masuk quirks mode dan perhitungan box berubah).
- [ ] `box-sizing: border-box` global.
- [ ] `html`/`body` tidak memaksa `width: NNNpx` atau `min-width` besar.
- [ ] Root font-size tidak dikunci di px kecil (hack `html { font-size: 10px }`) tanpa kompensasi; biarkan 100% (16px) atau `62.5%` yang disadari.

## 2. Layout
- [ ] Container punya `max-width` + gutter fluid; tidak ada `width: 1200px` tetap.
- [ ] Grid/kolom memakai `fr`, `minmax()`, `auto-fit/auto-fill`, atau flex dengan `flex-wrap`, bukan persen yang dijumlah manual.
- [ ] Anak flex/grid yang berisi teks panjang/tabel/`pre` punya `min-width: 0` (default `min-width: auto` membuatnya menolak mengecil).
- [ ] Sidebar/aside: di layar kecil jadi drawer/stack, bukan menjepit konten.
- [ ] Ada penanganan layar menengah (600-1100px) dan landscape HP (tinggi < 500px).
- [ ] Tinggi tidak dikunci (`height: 600px`); gunakan `min-height`, padding, atau `aspect-ratio`.
- [ ] `position: fixed/sticky` (header, bottom bar, FAB, toast) tidak menutupi konten penting dan memperhitungkan safe-area.
- [ ] `overflow: hidden` pada kontainer tidak memotong dropdown/tooltip di layar sempit.

## 3. Tipografi dan spasi
- [ ] Ukuran dasar teks >= 16px di HP; skala heading fluid (`clamp()`), tidak melonjak drastis antar breakpoint.
- [ ] Tidak ada `font-size: Nvw` murni; jika ada, dibungkus `clamp(min, calc, max)` dan menyertakan `rem`.
- [ ] Line-height tanpa satuan (mis. `1.5`), bukan px.
- [ ] Teks panjang aman: `overflow-wrap: anywhere`/`break-word` untuk URL, kode, nama panjang.
- [ ] Panjang baris prosa dibatasi (`max-width: 60-75ch`) di layar lebar.
- [ ] Padding/margin memakai `rem`/`clamp()`/`gap`, bukan px besar yang sama di semua layar (padding 64px di HP memakan separuh lebar).

## 4. Media
- [ ] `img, video` -> `max-width: 100%; height: auto`.
- [ ] Gambar punya atribut `width`/`height` (untuk rasio, mencegah layout shift) **dan** CSS `height: auto`.
- [ ] `srcset`/`sizes` untuk gambar besar; `object-fit` untuk thumbnail/hero.
- [ ] `iframe`, peta, embed video dibungkus `aspect-ratio` + `width: 100%`.
- [ ] `canvas`/chart (Chart.js, ECharts, D3) di-resize saat container berubah (`responsive: true`, `ResizeObserver`), bukan ukuran awal tetap.
- [ ] SVG punya `viewBox` dan tidak memakai `width/height` tetap berukuran besar.
- [ ] Background hero memakai `background-size: cover` + `min-height`, bukan `height` px.

## 5. Komponen
- [ ] Tabel: wrapper scroll, atau transformasi kartu; kolom prioritas.
- [ ] Form: label di atas input di layar kecil; input `width: 100%`; grup input tidak `white-space: nowrap`.
- [ ] Modal/dialog: `max-width: min(100% - 2rem, 40rem)`, `max-height: 100dvh`, konten scroll internal.
- [ ] Navbar: ada pola kolaps (hamburger/drawer); item tidak tumpang tindih di 768px.
- [ ] Dropdown/popover: tidak keluar viewport (flip/shift, atau sheet penuh di HP).
- [ ] Tabs: bisa di-scroll horizontal atau jadi select di HP.
- [ ] Carousel/slider: lebar slide relatif, bukan px; mendukung swipe.
- [ ] Dashboard: kartu stack di HP; chart tidak diberi tinggi tetap kaku.

## 6. Interaksi dan perangkat
- [ ] Target sentuh >= 44x44 (Apple) / 48dp (Material); batas minimal WCAG 2.2 adalah 24x24 dengan jarak.
- [ ] Hover bukan satu-satunya cara membuka fungsi; efek hover dibungkus `@media (hover: hover)`.
- [ ] Input `font-size >= 16px` (cegah zoom otomatis iOS), `inputmode`/`type` sesuai.
- [ ] `100vh` diganti `100dvh`/`svh` (dengan fallback) untuk elemen layar penuh.
- [ ] `env(safe-area-inset-*)` untuk bar fixed (butuh `viewport-fit=cover`).
- [ ] Orientasi tidak dikunci tanpa alasan; landscape diuji.
- [ ] Zoom 200% dan ukuran teks besar dari OS tidak merusak layout (reflow di lebar 320px).
- [ ] `prefers-reduced-motion` dihormati bila ada animasi besar.

## 7. Layar besar / TV
- [ ] Container dibatasi; konten tidak mepet kiri di 2560/3840px.
- [ ] Ada skala untuk layar besar (root font atau token) bila UI dimaksudkan dilihat dari jauh.
- [ ] Tidak ada elemen berbasis `vw`/`vh` tanpa batas atas.
- [ ] Margin aman 3-5% di sekeliling (TV lama punya overscan).
- [ ] Fokus terlihat jelas (`:focus-visible`) dan urutan fokus logis untuk remote/D-pad.
- [ ] Sudah diukur `innerWidth x innerHeight @ devicePixelRatio` pada perangkat/emulator target.

## 8. Berburu pelaku overflow
Tempel di console DevTools pada lebar bermasalah; elemen yang melewati tepi viewport diberi garis merah:

```js
(() => {
  const vw = document.documentElement.clientWidth;
  const bad = [...document.querySelectorAll('body *')].filter(el => {
    const r = el.getBoundingClientRect();
    return r.width && (r.right > vw + 1 || r.left < -1);
  });
  bad.forEach(el => el.style.outline = '2px solid red');
  console.table(bad.slice(0, 30).map(el => ({
    tag: el.tagName, cls: String(el.className).slice(0, 60),
    width: Math.round(el.getBoundingClientRect().width),
    right: Math.round(el.getBoundingClientRect().right)
  })));
})();
```

Pelaku yang paling sering: tabel, `pre`, gambar dengan atribut `width` besar, input dengan `size`, elemen `100vw`, `transform: translateX` dari animasi, dropdown `position: absolute` yang keluar kanan, flex item tanpa `min-width: 0`, dan string panjang tanpa spasi.
