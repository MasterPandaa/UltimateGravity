# Review Checklist Kode

Jalankan sebelum menyerahkan kode Deep. Untuk Lean, cukup bagian A dan sebagian D.

## A. Korektness
- [ ] Jalur sukses berjalan; sudah ditelusuri atau dijalankan?
- [ ] Dua jalur gagal terpikirkan (input salah, dependensi gagal)?
- [ ] Kasus batas: kosong, null, nol, besar, karakter khusus, zona waktu?
- [ ] Tidak ada import, variabel, atau fungsi yang hilang atau tidak terpakai?
- [ ] Tipe dan nama konsisten antar-file (frontend ke API ke database)?
- [ ] Tidak ada balapan atau efek ganda pada aksi yang bisa terulang?

## B. Keterbacaan dan konsistensi
- [ ] Nama menjelaskan niat dan mengikuti konvensi proyek?
- [ ] Fungsi dan komponen satu tanggung jawab, pendek?
- [ ] Tidak ada duplikasi mencolok atau angka/string ajaib?
- [ ] Komentar menjelaskan "mengapa", bukan "apa"?
- [ ] Gaya sama dengan kode sekitar (format, kutipan, indentasi)?
- [ ] Hanya mengubah yang diminta; temuan lain dicatat, tidak diam-diam diubah?

## C. Frontend khusus
- [ ] Loading, kosong, error, sukses semua ditangani?
- [ ] Elemen semantik, label, fokus terlihat, navigasi keyboard?
- [ ] Layar sempit dan teks panjang aman?
- [ ] Warna, spasi, tipografi dari token, bukan nilai mentah?
- [ ] Aksi destruktif dikonfirmasi atau bisa di-undo; tombol tidak bisa di-submit ganda?
- [ ] Reduced motion dan kontras dipertimbangkan?

## D. Backend khusus
- [ ] Input divalidasi di batas; query berparameter?
- [ ] Otorisasi diperiksa per sumber daya di server?
- [ ] Rahasia tidak ada di kode atau log?
- [ ] Error terstruktur, kode status tepat, tanpa kebocoran detail internal?
- [ ] Operasi multi-langkah dalam transaksi; tidak ada N+1 yang jelas?
- [ ] Daftar dipaginasi; panggilan luar punya timeout?
- [ ] Migrasi aman dan bisa dibalik?

## E. Penyerahan
- [ ] Kode lengkap dan bisa dijalankan tanpa menebak?
- [ ] Ada perintah untuk menjalankan atau menguji?
- [ ] Asumsi, hal yang belum diuji, dan risiko dinyatakan jujur?
- [ ] Penjelasan ringkas; tidak menguraikan yang sudah jelas dari kode?

## Rubrik cepat (1-5)

| Dimensi | 1 | 3 | 5 |
|---|---|---|---|
| Korektness | tidak jalan | jalan di kasus normal | jalan, kasus batas ditangani |
| Konsistensi | gaya campur aduk | sebagian seragam | seragam dengan proyek |
| Ketahanan | mudah rusak | error dasar ditangani | kegagalan direncanakan |
| Keterbacaan | membingungkan | dapat dipahami dengan usaha | langsung jelas |
| Keamanan/aksesibilitas | diabaikan | sebagian | sistematis |

Target: tidak ada dimensi di bawah 4.
