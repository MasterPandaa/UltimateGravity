# Backend: Standar Praktis

## Daftar isi
1. Lapisan dan struktur
2. Desain API
3. Data dan database
4. Keamanan
5. Error dan logging
6. Konkurensi dan keandalan
7. Konfigurasi
8. Testing
9. Contoh kerangka

## 1. Lapisan dan struktur
Tiga lapisan minimum:
- **Transport** (route/controller): memparse request, memvalidasi bentuk, memanggil layanan, memetakan hasil ke respons HTTP. Tidak berisi aturan bisnis.
- **Layanan/domain:** aturan bisnis murni, tidak tahu HTTP maupun detail database.
- **Akses data** (repository): query dan transaksi; satu-satunya tempat yang tahu SQL/ORM.
Dependensi diinjeksikan agar bisa diuji. Struktur per fitur: `orders/{route,service,repo,schema,test}`.

## 2. Desain API
- Sumber daya berupa kata benda jamak (`/orders`), aksi lewat method HTTP; aksi yang bukan CRUD murni boleh sub-sumber daya (`POST /orders/{id}/cancel`).
- Kode status tepat: 200/201/204 sukses, 400 input salah, 401 belum autentikasi, 403 tidak berhak, 404 tidak ada, 409 konflik, 422 validasi, 429 batas laju, 5xx kegagalan server.
- Daftar selalu dipaginasi (cursor lebih stabil daripada offset untuk data besar), dengan urutan deterministik.
- Operasi yang bisa diulang klien (pembayaran, pembuatan) mendukung **kunci idempotensi**.
- Versi API bila perubahan merusak; jangan mengubah arti field yang sudah ada.
- Respons konsisten: pembungkus yang sama, nama field `camelCase` atau `snake_case` (pilih satu), tanggal ISO 8601 UTC.
- Dokumentasikan kontrak (OpenAPI) dan jadikan sumber bagi tipe klien bila memungkinkan.
- Skema error tunggal, contoh:
```json
{ "error": { "code": "VALIDATION_FAILED", "message": "Email tidak valid", "fields": { "email": "format salah" } } }
```

## 3. Data dan database
- Skema dinormalisasi secukupnya; kunci asing, `NOT NULL`, `UNIQUE`, dan indeks mencerminkan aturan bisnis, bukan hanya aplikasi.
- Migrasi berurutan, kecil, dapat dibalik; tidak mengedit migrasi yang sudah dijalankan.
- Operasi multi-langkah dalam **transaksi**.
- Hindari N+1: ambil relasi dengan join atau batch.
- Uang: bilangan bulat satuan terkecil atau tipe decimal, bukan float.
- Waktu: simpan UTC; konversi di tepi.
- Hapus lunak (`deleted_at`) hanya bila ada kebutuhan bisnis; jelaskan konsekuensinya pada unique/indeks.
- Indeks berdasar pola query nyata; periksa rencana eksekusi untuk query lambat.
- **Pencegahan Cache Penetration (Bloom Filter):** Untuk validasi frekuensi tinggi per-keystroke (ketersediaan username, kupon, slug unik), pasang Bloom Filter in-memory (atau Redis Bloom) di depan database. Manfaatkan sifat *Zero False Negatives* (bila filter menyatakan 'pasti tidak ada', 100% tidak ada di DB) untuk memotong beban query 99%+, dan hanya query database jika filter menyatakan 'mungkin ada'.

## 4. Keamanan
- Validasi **semua** input di batas (tipe, panjang, rentang, format). Tolak yang tidak dikenal.
- Query berparameter; tidak pernah menyambung string SQL/perintah shell dari input.
- Autentikasi: sesi atau token dengan masa berlaku; kata sandi di-hash dengan algoritma lambat khusus (argon2id, bcrypt, scrypt) dan garam.
- Otorisasi diperiksa **per sumber daya** di sisi server (jangan hanya "sudah login"); cegah IDOR dengan memfilter berdasar pemilik.
- Rahasia dari lingkungan atau pengelola rahasia; tidak pernah di repositori atau log.
- CORS sempit, header keamanan, batas ukuran body, batas laju pada endpoint sensitif (login, reset kata sandi).
- Pesan error ke klien tidak membocorkan detail internal (jejak stack, SQL).
- Unggahan file: batasi tipe dan ukuran, simpan di luar webroot, jangan percaya nama atau MIME dari klien.

## 5. Error dan logging
- Bedakan **error yang diharapkan** (validasi, tidak ditemukan, konflik; dipetakan ke 4xx) dari **kegagalan tak terduga** (bug, dependensi mati; 5xx, dicatat dengan jejak).
- Satu penangan error terpusat yang memetakan ke skema error tunggal.
- Jangan menelan exception; tangani di tempat yang bisa berbuat sesuatu atau teruskan dengan konteks.
- Log terstruktur (JSON) dengan ID korelasi per request, tingkat yang benar (info/warn/error), tanpa data pribadi, kata sandi, atau token.
- Pesan log menjelaskan apa yang terjadi dan konteksnya, bukan hanya "error".

## 6. Konkurensi dan keandalan
- Anggap request bisa datang ganda atau bersamaan: gunakan kunci unik, transaksi, atau kontrol versi (optimistic locking) untuk mencegah balapan.
- Panggilan ke layanan luar: timeout eksplisit, coba ulang terbatas dengan backoff dan jitter, pemutus sirkuit bila perlu.
- Kerja berat atau lambat dipindah ke antrean/pekerja latar; respons cepat dengan status yang bisa dipantau.
- Pekerja latar idempoten: aman dijalankan ulang.
- Penutupan anggun (graceful shutdown) dan pemeriksaan kesehatan (liveness/readiness).

## 7. Konfigurasi
- Semua nilai yang berubah antar-lingkungan lewat variabel lingkungan, divalidasi saat startup (gagal cepat bila hilang).
- Default aman; fitur eksperimen di balik flag.
- Tidak ada kondisi `if (env === 'production')` yang tersebar; pusatkan perbedaan di konfigurasi.

## 8. Testing
- **Unit:** aturan bisnis murni, cepat, tanpa I/O.
- **Integrasi:** route + layanan + database nyata (atau kontainer uji) untuk jalur utama dan kasus gagal.
- **Kontrak:** bentuk respons sesuai skema yang dipakai frontend.
- Kasus batas wajib: input kosong, duplikat, nilai ekstrem, pengguna tak berhak, permintaan ganda, kegagalan dependensi.
- Uji perilaku, bukan implementasi; nama uji menjelaskan skenario dan hasil yang diharapkan.
- Data uji dibuat lewat pabrik/fixture, tidak bergantung urutan uji.

## 9. Contoh kerangka (TypeScript, gaya umum)
```ts
// orders/schema.ts: validasi di batas
export const CreateOrder = z.object({
  items: z.array(z.object({ productId: z.string(), qty: z.number().int().positive() })).min(1),
});

// orders/service.ts: aturan bisnis, tidak tahu HTTP
export async function createOrder(deps: Deps, userId: string, input: CreateOrderInput) {
  const products = await deps.repo.getProducts(input.items.map(i => i.productId));
  if (products.length !== input.items.length) throw new NotFoundError("PRODUCT_NOT_FOUND");
  const totalMinor = calculateTotalMinor(products, input.items);
  return deps.repo.insertOrder({ userId, items: input.items, totalMinor }); // satu transaksi di repo
}

// orders/route.ts: transport
router.post("/orders", auth, async (req, res) => {
  const input = CreateOrder.parse(req.body);              // 422 bila gagal (via penangan terpusat)
  const order = await createOrder(deps, req.user.id, input);
  res.status(201).json({ data: order });
});
```
Catatan: contoh menampilkan pemisahan lapisan, bukan pustaka wajib; sesuaikan dengan stack proyek.
