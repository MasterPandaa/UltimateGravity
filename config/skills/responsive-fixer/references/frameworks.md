# Panduan per Framework

Terapkan perbaikan lewat mekanisme bawaan framework supaya konsisten dan mudah dirawat. Versi dan nama opsi berubah antar rilis; jika proyek memakai versi tertentu, cocokkan dengan dokumentasi resmi versi itu sebelum mengubah konfigurasi.

## Daftar isi
1. CSS biasa / SCSS
2. Tailwind CSS
3. Bootstrap
4. MUI, Chakra, Ant Design (React)
5. React / Next.js umum
6. Vue / Nuxt / Svelte / Angular
7. CMS dan template server (WordPress, Laravel Blade, dsb.)
8. Flutter
9. React Native
10. Android / iOS native
11. Email HTML (catatan)

## 1. CSS biasa / SCSS
- Mulai dari `assets/responsive-base.css`, lalu ganti nilai kaku di CSS yang ada (lihat temuan audit).
- SCSS: jadikan breakpoint satu map dan satu mixin; hindari angka sihir tersebar.
  ```scss
  $bp: (sm: 40rem, md: 48rem, lg: 64rem, xl: 80rem, xxl: 96rem, tv: 120rem);
  @mixin up($k) { @media (min-width: map-get($bp, $k)) { @content; } }
  ```

## 2. Tailwind CSS
- Sudah mobile-first: kelas tanpa prefix berlaku untuk semua layar, `md:` berarti >= 768px. Bug umum: menulis `grid-cols-3` tanpa prefix sehingga 3 kolom di HP; perbaiki jadi `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.
- Hindari `w-[640px]`, `h-[500px]`, `min-w-[...]` besar; ganti `w-full max-w-2xl`, `min-h-*`, `aspect-video`.
- Tinggi layar: `h-screen` -> `min-h-dvh` (tersedia di Tailwind 3.4+; versi lama pakai `min-h-[100dvh]`).
- Container: `mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8`.
- Flex/grid dengan konten panjang: tambah `min-w-0`; tabel: bungkus `overflow-x-auto`.
- Layar besar: tambah breakpoint.
  - v3 (`tailwind.config.js`): `theme: { extend: { screens: { '3xl': '1920px', '4xl': '2560px' } } }`
  - v4 (CSS): `@theme { --breakpoint-3xl: 120rem; --breakpoint-4xl: 160rem; }`
  Lalu `3xl:max-w-[100rem] 4xl:text-xl`, dst.
- Hover: bungkus dengan varian `hover:` hanya untuk interaksi tambahan; gunakan `@media (hover: hover)` bila perlu (varian `hover:` pada Tailwind v4 sudah dibatasi ke perangkat yang mendukung hover; v3 tidak).
- Safe-area: `pb-[env(safe-area-inset-bottom)]`.

## 3. Bootstrap
- Gunakan sistem grid-nya: `col-12 col-md-6 col-lg-4` (urut dari kecil ke besar); jangan menimpa lebar kolom dengan px.
- Breakpoint 5.x: sm 576, md 768, lg 992, xl 1200, xxl 1400. Tambah layar besar lewat Sass: tambahkan entri di map `$grid-breakpoints` dan `$container-max-widths` sebelum meng-import Bootstrap.
- Tabel: `<div class="table-responsive">`. Gambar: `img-fluid`. Embed: `ratio ratio-16x9`.
- Tinggi layar penuh: ganti `vh-100` dengan `min-vh-100` (dan pertimbangkan `dvh` kustom).
- Bootstrap 3/4 lama: pastikan viewport meta ada dan hindari `.container` bersarang dengan lebar px kustom.

## 4. MUI, Chakra, Ant Design (React)
- MUI: gunakan `sx={{ width: { xs: '100%', md: 480 } }}`, `Grid`/`Stack` dengan nilai responsif, `Container maxWidth="lg"`; tema: `createTheme({ breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536, tv: 1920 } } })` (tambahan breakpoint kustom perlu augmentasi tipe di TypeScript). Hook `useMediaQuery(theme.breakpoints.down('md'))` untuk perubahan struktur, bukan untuk gaya yang bisa lewat CSS.
- Tipografi MUI: `responsiveFontSizes(theme)` atau `clamp()` pada varian tema.
- Chakra: prop responsif array/objek `w={{ base: '100%', md: '480px' }}`; `breakpoints` di tema untuk layar besar.
- Ant Design: `Row`/`Col` dengan `xs/sm/md/lg/xl/xxl`; `Table` dengan `scroll={{ x: 'max-content' }}`; `Modal` dengan `width` responsif atau `style={{ maxWidth: 'calc(100vw - 2rem)' }}`.

## 5. React / Next.js umum
- Prioritaskan CSS untuk responsivitas; gunakan JS (`matchMedia`, `useMediaQuery`) hanya untuk perubahan struktur DOM (mis. drawer vs sidebar).
- SSR/hidrasi: jangan memakai `window.innerWidth` saat render pertama (mismatch hidrasi dan flash layout). Mulai dengan nilai netral/CSS, lalu perbarui di `useEffect`; atau gunakan CSS untuk menyembunyikan/menampilkan.
- Komponen chart/peta: pastikan wrapper punya ukuran lewat CSS dan library melakukan resize (ResizeObserver).
- Next.js: viewport diatur lewat `export const viewport` (App Router) atau `<meta>` di `_document`/`Head` (Pages Router); gunakan `next/image` dengan `sizes` yang tepat.

## 6. Vue / Nuxt / Svelte / Angular
- Vue/Nuxt/Svelte: sama seperti React; hindari penghitungan ukuran di JS bila CSS bisa. `useMediaQuery` (VueUse) atau `matchMedia` bila diperlukan.
- Angular: `@angular/cdk/layout` `BreakpointObserver` untuk perubahan struktur; Angular Material memakai grid sendiri, hindari lebar px kaku pada `mat-sidenav`/`mat-table`, bungkus tabel dalam `overflow: auto`.
- Scoped CSS: pastikan aturan responsif tidak terblokir spesifisitas; hindari `!important`.

## 7. CMS dan template server
- Cari viewport meta di template induk (header.php, layout master, base.html); satu tempat biasanya cukup.
- WordPress: kebanyakan tema modern sudah responsif; masalahnya umumnya di CSS kustom, plugin, blok HTML kustom, atau tabel/iframe tertanam. Bungkus konten ter-embed, gunakan "Additional CSS" atau child theme, jangan edit tema induk.
- Laravel Blade / Django / Rails: perbaiki di layout dasar dan komponen partial; lalu halaman individual.
- Page builder (Elementor, dll.): atur nilai per breakpoint di builder bila tersedia, bukan CSS tambahan yang bertabrakan.

## 8. Flutter
- Hindari ukuran piksel tetap untuk layout. Gunakan `LayoutBuilder` (lebar tersedia di konteks induk) dan `MediaQuery.sizeOf(context)` (ukuran layar), `Flexible`/`Expanded`, `Wrap`, `FittedBox`, `AspectRatio`, `ConstrainedBox(maxWidth)`.
- Kelas ukuran jendela Material 3 (dalam dp): compact < 600, medium 600-839, expanded 840-1199, large 1200-1599, extra-large >= 1600. Ganti navigasi: bottom bar (compact) -> rail (medium) -> drawer permanen (expanded+). Paket `flutter_adaptive_scaffold` membantu pola ini.
- Batasi lebar konten di layar besar dengan `Center` + `ConstrainedBox(constraints: BoxConstraints(maxWidth: 1200))`.
- `SafeArea` untuk notch; `OrientationBuilder` untuk landscape; uji `textScaleFactor`/`TextScaler` besar agar teks tidak overflow (`Flexible`, `maxLines`, `overflow`).
- Overflow kuning-hitam (RenderFlex overflowed) -> bungkus anak dengan `Expanded`/`Flexible` atau `SingleChildScrollView`.
- Desktop/web/TV: jangan menaikkan skala seluruh aplikasi dengan `Transform.scale`; sesuaikan token ukuran per kelas jendela.

## 9. React Native
- Gunakan flexbox, persentase, dan `useWindowDimensions()` (reaktif terhadap rotasi/split-screen). Hindari `Dimensions.get('window')` di level modul, nilainya tidak ikut berubah.
- `SafeAreaView` dari `react-native-safe-area-context` (bukan yang bawaan lama).
- Gambar: `resizeMode`, `aspectRatio`, bukan lebar/tinggi tetap.
- Tablet: batasi `maxWidth` konten, pertimbangkan layout dua kolom di lebar >= 600dp.
- Skala font: hormati `allowFontScaling`; uji ukuran font sistem terbesar. Library skala (mis. react-native-size-matters) membantu, tetapi beri batas agar tidak membengkak di tablet.
- TV (react-native-tvos): fokus dan `hasTVPreferredFocus`/`TVFocusGuideView` untuk navigasi remote; baca dokumentasi platform.

## 10. Android / iOS native
- Android: `ConstraintLayout`, `dp/sp`, resource qualifier (`layout-sw600dp`, `values-w840dp`), `WindowSizeClass` (Compose), pertimbangkan foldable (`WindowManager`).
- iOS: Auto Layout, size classes, safe area layout guide, Dynamic Type; hindari frame hardcode.

## 11. Email HTML (catatan)
Email memakai subset CSS terbatas; media query tidak didukung merata. Gunakan tabel fluid `width: 100%; max-width: 600px`, gambar `max-width: 100%`, dan uji di klien target. Jangan menerapkan resep CSS modern di sini begitu saja.
