# The 21 Laws of UX: Complete Psychology & Design Architecture (Jon Yablonski / LawsOfUX.com)

Kompilasi otoritatif dan ensiklopedia lengkap **21 Hukum Psikologi UX** karya Jon Yablonski (menggabungkan edisi buku cetak O'Reilly Media dan koleksi lengkap [LawsOfUX.com](https://lawsofux.com/)). Panduan ini mengintegrasikan prinsip psikologi kognitif, persepsi Gestalt, heuristik interaksi, dan etika desain ke dalam rekayasa antarmuka modern (React, Tailwind CSS, shadcn/ui).

---

## Taksonomi 4 Kategori 21 Hukum UX

```
                             [ 21 LAWS OF UX ]
                                     │
    ┌────────────────┬───────────────┴───────────────┬────────────────┐
    ▼                ▼                               ▼                ▼
[HEURISTIK]     [GESTALT]                    [COGNITIVE BIAS]     [PRINSIP DESAIN]
- Fitts's Law   - Common Region              - Aesthetic-Usability - Goal-Gradient
- Hick's Law    - Proximity                  - Doherty Threshold   - Humane Design
- Jakob's Law   - Similarity                 - Occam's Razor       - Intentional Friction
- Miller's Law  - Uniform Connectedness      - Pareto (80/20)
- Parkinson's   - Prägnanz (Simplicity)      - Peak-End Rule
- Postel's Law                               - Serial Position
- Tesler's Law                               - Von Restorff
                                             - Zeigarnik Effect
```

---

## Kategori 1: Heuristic Interaction Laws (7 Hukum)

### 1. Jakob’s Law
- **Dalil**: *"Users spend most of their time on other sites."*
- **Penjelasan**: Pengguna menghabiskan $90\%$ waktunya di situs/aplikasi lain, sehingga mereka mengharapkan aplikasi Anda memiliki pola navigasi dan interaksi yang sama dengan pengalaman yang telah mereka kenal.
- **Implementasi Teknis**:
  - Pertahankan konvensi standar: tombol *Back* di kiri atas, keranjang belanja/profil di kanan atas, *bottom navigation* di mobile, ikon kaca pembesar untuk pencarian.
  - **Prinsip Emas**: *"Inovasi pada VALUE produk, patuhi konvensi pada NAVIGASI"* (*Don't make the user think*).

### 2. Fitts’s Law
- **Formula Matematika**:
  $$T = a + b \log_2 \left( \frac{2D}{W} \right)$$
  Di mana $T$ adalah waktu reaksi, $D$ adalah jarak (*distance*) ke target, dan $W$ adalah lebar (*width*) target.
- **Implementasi Teknis**:
  - Tombol aksi primer (*Primary CTA*) harus berukuran besar ($h \ge 48\text{–}52\text{px}$, `w-full` di mobile).
  - Letakkan CTA di zona jangkauan jempol (*Thumb Zone* di bagian bawah layar).
  - Elemen interaktif kecil (ikon close $16\text{px}$) wajib diperluas area kliknya minimal $44\times 44\text{px}$ menggunakan pseudo-element `span.absolute -inset-2`.

### 3. Hick’s Law (Hick-Hyman Law)
- **Formula Matematika**:
  $$RT = a + b \log_2(n + 1)$$
  Di mana $RT$ adalah waktu reaksi (*reaction time*) dan $n$ adalah jumlah opsi stimuli.
- **Implementasi Teknis**:
  - Terlalu banyak opsi memicu *Analysis Paralysis* (kebingungan memilih).
  - Terapkan **Progressive Disclosure**: tampilkan hanya 1 tindakan primer dominan, dan sembunyikan opsi lanjutan di balik accordion, toggle, atau tab sekunder.

### 4. Miller’s Law
- **Dalil Kognitif**: Kapasitas memori kerja jangka pendek (*working memory*) manusia terbatas pada $7 \pm 2$ bongkahan (*chunks*) informasi.
- **Implementasi Teknis**:
  - **Information Chunking**: Kelompokkan menu navbar/kategori utama maksimal 5–7 item.
  - Pisahkan nomor telepon (`(0812) 345-6789`) dan nomor kartu kredit (`4408 6753 0912 3456`) ke dalam blok-blok 4 digit.
  - Pecah formulir panjang menjadi grup-grup ringkas berisi 3–5 field per langkah.

### 5. Parkinson’s Law
- **Dalil**: *"Work expands so as to fill the time available for its completion."*
- **Implementasi Teknis**:
  - Proses checkout atau pengisian form yang tidak dibatasi atau terlalu santai membuat pengguna menunda-nunda dan akhirnya batal bertransaksi.
  - Manfaatkan fitur efisiensi waktu: auto-fill alamat via geolokasi, integrasi pembayaran 1-klik (Apple Pay), dan batas waktu reservasi tiket/promo (*urgency timer*) yang nyata.

### 6. Postel’s Law (Robustness Principle)
- **Dalil**: *"Be conservative in what you do, be liberal in what you accept from others."*
- **Implementasi Teknis**:
  - **Di Depan (Permisif)**: Form toleran terhadap variasi ketikan user (auto-trim spasi email, terima no. HP dengan spasi/strip/awalan 0 atau 62, terima angka ribuan titik atau koma).
  - **Di Belakang (Ketat)**: Backend selalu menormalkan data ke format baku sebelum masuk database (telepon $\to$ E.164, uang $\to$ integer cents, waktu $\to$ ISO 8601 UTC).

### 7. Tesler’s Law (Law of Conservation of Complexity)
- **Dalil**: Setiap proses memiliki jumlah kompleksitas inheren yang tidak dapat dihilangkan; pilihannya adalah **apakah kompleksitas ditanggung pengguna atau diserap oleh sistem/developer**.
- **Implementasi Teknis**:
  - Jangan bebani user dengan konfigurasi manual yang bisa diotomatisasi sistem.
  - Contoh: Alamat pengiriman otomatis mewarisi (*inherit*) alamat penagihan; email client otomatis memprediksi penerima dan mengisi subjek.

---

## Kategori 2: Gestalt Perception Principles (5 Hukum)

### 8. Law of Common Region
- **Dalil**: Elemen-elemen yang berada di dalam satu batas wilayah tertutup (*enclosed boundary*) otomatis dipersepsikan sebagai satu kelompok fungsional.
- **Implementasi Teknis**:
  - Bungkus elemen terkait ke dalam kontainer kartu (`bg-card rounded-lg border p-4`).
  - Gunakan garis pembagi (*divider line*) atau warna latar belakang yang kontras halus untuk memisahkan grup data.

### 9. Law of Proximity
- **Dalil**: Objek-objek yang posisinya saling berdekatan secara spasial dianggap memiliki relasi makna yang lebih erat dibanding objek yang berjauhan.
- **Implementasi Teknis**:
  - Jarak internal (label ke input: `gap-1.5` / $4\text{–}6\text{px}$) wajib jauh lebih rapat dibanding jarak antar-grup input (`space-y-4` / $16\text{px}$).
  - Heading selalu wajib lebih menempel ke konten miliknya dibanding ke seksi sebelumnya: pastikan selalu $\text{Margin-Top} > \text{Margin-Bottom}$ (`mt-8 mb-2`).

### 10. Law of Similarity
- **Dalil**: Elemen yang memiliki kesamaan karakteristik visual (warna, ukuran, bentuk, tipografi) dipersepsikan memiliki fungsi yang serupa.
- **Implementasi Teknis**:
  - Semua link yang bisa diklik harus memiliki gaya visual yang konsisten (misal warna biru dengan garis bawah saat hover).
  - Jangan gunakan bentuk tombol (*pill/rounded rectangle*) untuk badge status yang tidak bisa diklik (agar user tidak mengira badge tersebut adalah tombol).

### 11. Law of Uniform Connectedness
- **Dalil**: Elemen-elemen yang dihubungkan secara fisik oleh garis visual atau warna penghubung dipersepsikan lebih terikat erat daripada sekadar elemen yang diletakkan berdekatan.
- **Implementasi Teknis**:
  - Komponen **Stepper / Wizard Timeline**: Garis horizontal/vertikal solid yang menghubungkan lingkaran nomor langkah 1 $\to$ 2 $\to$ 3 secara tegas menandakan alur berurutan.

### 12. Law of Prägnanz (Law of Simplicity)
- **Dalil**: Mata dan otak manusia cenderung memproses dan mereduksi visual yang kompleks menjadi bentuk yang paling sederhana, simetris, dan stabil.
- **Implementasi Teknis**:
  - Gunakan bentuk geometris murni (lingkaran, bujur sangkar, rounded rectangle) dalam menyusun hierarki antarmuka.
  - Hindari bentuk-bentuk poligon rumit asimetris tanpa alasan fungsional yang jelas.

---

## Kategori 3: Cognitive Biases & Psychological Effects (7 Hukum)

### 13. Aesthetic–Usability Effect
- **Dalil**: Desain visual yang menarik dinilai secara intuitif (System 1) sebagai produk yang **lebih mudah digunakan dan lebih andal** (*halo effect*).
- **Implementasi Teknis**:
  - Estetika bukan sekadar kosmetik, melainkan fondasi kepercayaan. Visual yang rapi membuat user jauh lebih toleran terhadap kesalahan teknis kecil.

### 14. Doherty Threshold
- **Dalil**: Produktivitas dan keterlibatan pengguna melonjak secara eksponensial ketika respons komputer berada di bawah **400 milidetik** ($< 400\text{ms}$).
- **Implementasi Teknis**:
  - Terapkan **Optimistic UI** (update layar instan dalam $0\text{–}50\text{ms}$ dengan rollback jika request server gagal).
  - Gunakan **Skeleton Screens** ($<100\text{ms}$) dan prefetching saat hover link untuk menjaga fokus pengguna tanpa jeda tunggu.

### 15. Occam’s Razor (Law of Parsimony)
- **Dalil**: *"Entia non sunt multiplicanda praeter necessitatem"* — Jika ada dua desain yang sama-sama memecahkan masalah, **pilih desain dengan asumsi dan elemen paling sedikit**.
- **Implementasi Teknis**:
  - Hapus elemen dekoratif yang tidak memiliki tujuan (misal gradien berlebih, bayangan blok tebal, atau teks penjelasan berulang).
  - Pertahankan esensi antarmuka tanpa mengurangi fungsi utama.

### 16. Pareto Principle (The 80/20 Rule)
- **Dalil**: Sekitar $80\%$ dampak atau hasil penggunaan berasal dari $20\%$ komponen kunci.
- **Implementasi Teknis**:
  - $80\%$ pengguna software hanya memakai $20\%$ fitur utama setiap hari.
  - Fokuskan optimasi performa, polesan mikro-interaksi, dan pengujian QA pada 20% jalur emas (*golden paths*) tersebut (misal: onboarding, search, checkout).

### 17. Peak–End Rule
- **Dalil**: Manusia mengingat pengalaman bukan dari rata-rata matematis sepanjang waktu, melainkan dari **titik puncak emosi (*peak*)** dan **kesan akhirnya (*end*)**.
- **Implementasi Teknis**:
  - Rancang akhir alur yang memikat: halaman sukses pembayaran dengan mikro-animasi konfeti, atau laporan rekap tahunan (Spotify Wrapped).
  - Redam frustrasi menunggu dengan transparansi operasional dan animasi bergerak (Uber idleness aversion).

### 18. Serial Position Effect (Primacy & Recency Effect)
- **Dalil**: Dalam suatu urutan daftar, item yang berada di **urutan pertama (*Primacy*)** dan **urutan terakhir (*Recency*)** paling mudah diingat, sedangkan item di tengah paling cepat dilupakan.
- **Implementasi Teknis**:
  - Letakkan item navigasi paling penting di posisi paling kiri (Home) dan paling kanan (Profile / Cart / CTA Utama) pada navbar.
  - Pada daftar fitur landing page, taruh fitur unggulan terkuat di urutan pertama dan penutup penawaran di urutan terakhir.

### 19. Von Restorff Effect (The Isolation Effect)
- **Dalil**: Ketika terdapat beberapa objek yang serupa, objek yang memiliki perbedaan visual paling kontras adalah yang paling mudah diingat dan paling cepat menarik atensi.
- **Implementasi Teknis**:
  - Berikan isolasi visual pada tombol aksi penting (merah untuk tombol hapus akun).
  - Pada tabel harga, buat kartu paket *"Paling Populer"* sedikit lebih tinggi ($h + 8\text{px}$) dengan border aksen dan badge pembeda.

### 20. Zeigarnik Effect
- **Dalil**: Otak manusia mengalami ketegangan kognitif terhadap **tugas yang belum selesai**, sehingga tugas tersebut lebih mudah diingat dan memicu dorongan kuat untuk menuntaskannya.
- **Implementasi Teknis**:
  - Tampilkan indikator kelengkapan profil: *"Profil Anda baru 70% lengkap. Tambahkan foto untuk mencapai 100%"*.
  - Tampilkan checklist onboarding dengan status interaktif untuk memancing user menuntaskan konfigurasi awal.

---

## Kategori 4: Prinsip Desain Terapan & Etika (2 Prinsip)

### 21. Goal-Gradient Effect & Humane Intentional Friction
- **Goal-Gradient Effect (Clark Hull)**: Kecepatan usaha dan motivasi manusia meningkat secara eksponensial seiring semakin dekatnya garis akhir. Terapkan kemajuan awal buatan (*Endowed Progress*: mulai dari 25% terisi) dan berikan micro-milestones saat progress $\ge 80\%$.
- **Intentional Friction (Etika Desain & Anti-Dark Patterns)**:
  - Pasang gesekan yang disengaja (*intentional friction*) pada aksi berbahaya (modal konfirmasi pengetikan nama database untuk aksi penghapusan permanen) untuk memicu System 2 thinking.
  - Tolak keras *Dark Patterns* (dilarang *confirmshaming*, *forced action*, atau *intermittent variable rewards* adiktif ala mesin judi).
