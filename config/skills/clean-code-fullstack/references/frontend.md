# Frontend: Standar Praktis

## Daftar isi
1. Struktur dan komponen
2. State dan data
3. Empat keadaan UI
4. UX
5. Aksesibilitas
6. Responsif dan tema
7. Performa
8. Token desain
9. Pola konsistensi

## 1. Struktur dan komponen
- Satu komponen, satu tujuan. Bila nama komponen membutuhkan "And", pecah.
- Pisahkan **presentasi** (menerima props, merender) dari **orkestrasi** (mengambil data, menghubungkan aksi).
- Props: eksplisit, bertipe, dengan default masuk akal. Hindari meneruskan objek besar bila hanya dua field dipakai.
- Komposisi (children/slot) lebih baik daripada props boolean yang bertumpuk (`isPrimary`, `isLarge`, `isGhost`...); gunakan `variant` dan `size` bernilai terbatas.
- Folder per fitur: `features/orders/{components,hooks,api,types}`; elemen UI generik di `ui/`.
- Nama berkas dan komponen mengikuti konvensi proyek (umumnya `PascalCase` untuk komponen, `camelCase` untuk hook diawali `use`).

## 2. State dan data
- State diletakkan **sedekat mungkin** dengan pemakainya; angkat hanya bila dua saudara membutuhkannya.
- Data dari server bukan state biasa: pakai lapisan fetching dengan cache, deduplikasi, dan invalidasi (mis. TanStack Query, SWR, atau setara di framework). Jangan menyalin data server ke state lokal tanpa alasan.
- State turunan **dihitung**, bukan disimpan (hindari state yang harus disinkronkan dengan state lain).
- Form: satu sumber kebenaran per field, validasi di submit dan saat blur, pesan error per field, dan nonaktifkan submit ganda.
- URL adalah state: filter, halaman, tab yang layak dibagikan masuk ke query string.

## 3. Empat keadaan UI
Setiap tampilan data harus menangani:
- **Loading:** skeleton yang menyerupai bentuk akhir, bukan layar kosong; hindari spinner untuk daftar.
- **Kosong:** jelaskan mengapa kosong dan tawarkan tindakan berikutnya.
- **Error (Formula 3-Pilar):** Hindari kode teknis mentah (Error 403). Sajikan tiga elemen terstruktur:
  1. *What happened*: status objektif ramah manusia ("Akses ditolak").
  2. *Why*: alasan konteks ("File ini disetel privat oleh pemilik").
  3. *What to do next*: tombol aksi langsung (*Direct CTA Button*) yang menyelesaikan masalah ("Minta Akses", "Ganti Kartu", "Pangkas Ukuran"), bukan hanya tombol retry generik.
- **Sukses:** keadaan normal, termasuk data sangat panjang, banyak, atau sedikit.
Tambahan: keadaan **parsial** (sebagian gagal), **offline**, dan **optimistic update** bila aksinya cepat dan jarang gagal (dengan rollback).

## 4. UX
- Umpan balik untuk setiap aksi: tombol menunjukkan sedang proses, hasil dikonfirmasi (toast/inline), kegagalan dijelaskan dan bisa diulang.
- Aksi destruktif: konfirmasi atau undo; label tombol memakai kata kerja jelas ("Hapus pesanan", bukan "OK").
- Satu aksi utama per layar; aksi sekunder lebih rendah secara visual.
- Pesan error: apa yang terjadi, mengapa, dan apa yang bisa dilakukan user.
- Jangan memindahkan layout saat konten dimuat (reservasi ruang untuk gambar dan skeleton).
- Teks ringkas, bahasa sesuai audiens, format tanggal/angka mengikuti lokal user.

## 5. Aksesibilitas (wajib)
- Elemen semantik (`button`, `a`, `nav`, `main`, `label`, `ul`) sebelum `div` dengan `onClick`.
- Setiap input punya `label` terhubung; ikon-saja punya `aria-label`; gambar bermakna punya `alt`, dekoratif `alt=""`.
- Fokus selalu terlihat; urutan tab logis; dialog menjebak fokus dan bisa ditutup dengan Esc.
- Kontras teks minimal 4.5:1; informasi tidak hanya lewat warna.
- Target sentuh minimal sekitar 44px.
- Pembaruan dinamis penting diumumkan (`aria-live`).
- Hormati `prefers-reduced-motion` dan `prefers-color-scheme`.

## 6. Responsif dan tema
- Mulai dari layar kecil (mobile-first); gunakan flex/grid dan satuan relatif.
- Tabel atau kode lebar menggulir di dalam wadahnya sendiri, bukan halaman.
- Hindari lebar dan tinggi piksel kaku untuk konten teks.
- Tema gelap/terang lewat variabel CSS, bukan duplikasi gaya.

## 7. Performa
- Ukur sebelum mengoptimasi. Optimasi default: kode dibelah per rute, gambar berukuran sesuai dan malas dimuat, daftar panjang divirtualisasi.
- Hindari render ulang mahal: kunci stabil pada daftar, `memo`/`useMemo` hanya setelah terbukti perlu.
- Animasikan `transform` dan `opacity`.
- Debounce input pencarian; batalkan request yang sudah usang.

## 8. Token desain
Satu tempat untuk: warna (semantik: `--color-bg`, `--color-text`, `--color-accent`, `--color-danger`), skala spasi (4/8/12/16/24/32...), tipografi (ukuran, berat, tinggi baris), radius, bayangan, durasi dan easing animasi. Komponen memakai token, bukan nilai mentah.

## 9. Pola konsistensi
- Satu cara untuk tugas yang sama (satu pola fetching, satu pola form, satu pola modal).
- Nama event/prop seragam: `onChange`, `onSubmit`, `onClose`.
- Format respons error dari API dipetakan di **satu** tempat ke pesan UI.
- Semua tombol, input, dan kartu berasal dari komponen bersama.
