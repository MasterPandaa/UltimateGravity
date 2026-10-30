# Matriks Ukuran Uji

Angka di bawah adalah **piksel CSS (viewport)** yang umum ditemui, bukan resolusi fisik panel. Nilainya perkiraan dan berubah antar model; pakai sebagai sampel yang mewakili kelas, bukan daftar device wajib. Uji juga ukuran **di antara** ini dengan menyeret lebar jendela dari 320px ke 2560px; bug sering muncul di lebar yang tidak mewakili device mana pun.

## Daftar isi
1. Matriks inti
2. Tambahan situasional
3. Rasio aspek yang perlu diingat
4. Prosedur uji manual
5. Kriteria lulus

## 1. Matriks inti (minimal)

| Kelas | Viewport (CSS px) | Alasan |
|---|---|---|
| HP kecil | 360x640 (juga uji lebar 320) | Android kelas bawah; lebar paling sempit realistis |
| HP modern | 390x844 / 412x915 | Mayoritas HP sekarang |
| HP landscape | 844x390 | Tinggi sangat pendek; menguji `vh` dan header fixed |
| Tablet portrait | 768x1024 / 820x1180 | Zona "nanggung", sering rusak |
| Tablet landscape | 1024x768 / 1180x820 | Sidebar + konten |
| Laptop | 1366x768 / 1440x900 | Desktop kecil umum |
| Desktop FHD | 1920x1080 | Desktop dan TV 1080p |
| QHD / 2K | 2560x1440 | Konten sering melar di sini |
| Ultrawide | 3440x1440 | Rasio 21:9, uji `max-width` |
| 4K | 3840x2160 (@1x) | Jika browser melaporkan penuh; banyak yang @2x sehingga viewport 1920x1080 |

## 2. Tambahan situasional
- Foldable terlipat (layar luar sempit): sekitar 280-360 lebar.
- Foldable terbuka: sekitar 600-900 lebar, hampir persegi.
- TV: sering 960x540 @2x, 1280x720 @1.5x, atau 1920x1080 @1x. Ukur di perangkat; lihat `large-screens-tv.md`.
- Layar kios portrait (1080x1920) dan signage.
- Zoom browser 200% pada 1280px (setara viewport ~640px) dan 400% (~320px): uji reflow.
- Ukuran teks sistem diperbesar (Android "font size", iOS "Larger Text").
- Jendela browser desktop disempitkan / split-screen tablet (1/3, 1/2 layar).

## 3. Rasio aspek yang perlu diingat
Rasio hanya penting untuk elemen tinggi-layar-penuh dan hero. Rentang praktis:
- Sangat tinggi: HP modern sekitar 9:19.5 sampai 9:21.
- Standar: 16:9 (desktop, TV), 16:10 (laptop).
- Mendekati persegi: tablet 4:3, foldable terbuka.
- Sangat lebar: 21:9, 32:9.

Desain jangan bergantung pada rasio tertentu. Pakai `min-height` + konten yang mengalir, dan `aspect-ratio` hanya untuk media. Jika elemen harus "pas satu layar", beri `min-height: 100dvh` dan biarkan tumbuh, jangan `height: 100vh` dengan konten yang bisa terpotong.

## 4. Prosedur uji manual
1. Buka DevTools -> mode responsif. Mulai 320px, seret perlahan ke 2560px. Catat lebar tempat sesuatu rusak (itu kandidat breakpoint **berbasis konten**).
2. Putar orientasi (landscape) untuk HP dan tablet.
3. Zoom 200%.
4. Jalankan snippet pelaku-overflow (checklist bagian 8) di tiap lebar bermasalah.
5. Layar besar: uji 1920, 2560, 3440, 3840; periksa panjang baris, margin, dan ukuran teks.
6. Cek di perangkat nyata minimal satu iOS Safari dan satu Android Chrome; keduanya punya perilaku `vh`/toolbar/safe-area yang berbeda dari emulator.

## 5. Kriteria lulus
- Tidak ada scroll horizontal pada semua lebar 320-3840px (kecuali kontainer yang memang sengaja scroll, seperti tabel).
- Tidak ada teks/tombol terpotong atau saling tindih.
- Teks isi >= 16px di HP; tidak ada teks < 12px selain legal/caption.
- Target sentuh >= 44px di layar sentuh.
- Prosa <= ~75 karakter per baris di layar besar.
- Di layar besar, konten terpusat/terbatas dan terbaca dari jarak sewajarnya.
- Zoom 200% dan landscape tetap dapat dipakai.
