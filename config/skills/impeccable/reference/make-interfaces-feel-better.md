# 19 Micro-Interaction & Design Engineering Rules (Interfaces.dev / Jakub Krehel)

Kompilasi prinsip rekayasa desain antarmuka mikro (*design engineering*) yang membedakan UI standar dari kerajinan tingkat tinggi (*exceptional craft*). Diadaptasi langsung dari `jakubkrehel/make-interfaces-feel-better`.

---

## 1. Concentric Border Radius
Sudut melengkung bersarang (*nested rounded corners*) yang tidak proporsional membuat UI terasa canggung.
- **Formula Mutlak**:
  $$\text{outerRadius} = \text{innerRadius} + \text{padding}$$
- **Contoh Tailwind**:
  Jika container luar memiliki padding `p-3` (12px) dan elemen dalam `rounded-md` (6px), maka container luar **wajib** menggunakan `rounded-[18px]` ($6 + 12 = 18\text{px}$).
  ```html
  <!-- Container Luar: p-3 (12px), radius 18px -->
  <div class="rounded-[18px] p-3 bg-card border">
    <!-- Elemen Dalam: radius 6px (rounded-md) -->
    <div class="rounded-md bg-muted p-2">
      Konten Selaras
    </div>
  </div>
  ```

---

## 2. Optical Over Geometric Alignment
Pusat matematis/geometris sering kali terlihat salah di mata manusia karena distribusi bobot visual yang asimetris.
- **Play Button**: Ikon segitiga selalu terlihat terlalu ke kiri jika diletakkan di tengah geometris. Geser segitiga secara manual $1\text{–}2\text{px}$ ke kanan (`translate-x-0.5`).
- **Icon + Text Pairing**: Ikon dengan aksen tinggi/rendah (misal panah miring atau tanda seru) butuh penyesuaian sumbu Y manual `translate-y-[1px]` agar selaras dengan cap-height font.
- **Badges**: Teks badge status sering terlihat terlalu rendah; beri sedikit padding atas atau kompensasi `leading-none`.

---

## 3. Layered Shadows for Elevation, Borders for Structure
Jangan gunakan border tebal untuk memberikan kesan timbul (*elevation*), dan jangan gunakan satu shadow pekat tunggal.
- **Borders**: Khusus digunakan untuk pembagi struktural, garis kisi (*layout divider*), dan active/focus state.
- **Layered Shadows**: Gunakan 2–3 lapisan shadow transparan bertingkat (ambient light + directional light) untuk kedalaman alami:
  ```css
  /* Layered Elevation Shadow */
  box-shadow: 
    0 1px 2px 0 rgb(0 0 0 / 0.05),
    0 4px 6px -1px rgb(0 0 0 / 0.08),
    0 12px 24px -4px rgb(0 0 0 / 0.06);
  ```

---

## 4. Interruptible CSS Transitions
Hindari `@keyframes` untuk transisi state interaktif yang dipicu user (seperti hover, expand, atau dropdown).
- **Alasan**: `@keyframes` tidak bisa diinterupsi dengan mulus. Jika kursor keluar sebelum animasi selesai, elemen akan tersentak (*snap*) kembali ke awal.
- **Solusi**: Gunakan CSS `transition` atau Spring physics (`motion/react`). Jika kursor keluar di tengah jalan, transisi akan berbalik secara organik dari posisi saat itu.
  ```css
  /* Good: Interruptible */
  .interactive-pill {
    transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1), background-color 150ms ease;
  }
  ```

---

## 5. Split & Stagger Enter Animations
Animasi masuk elemen dalam kontainer jangan digerakkan sekaligus sebagai satu blok masif, tetapi pisah menjadi potongan semantik (*chunks*).
- Berikan jeda bertingkat (*stagger*) sekitar $60\text{–}100\text{ms}$ antar-potongan semantik (Heading $\to$ Deskripsi $\to$ Aksi $\to$ Visual).
- **Batasan**: **JANGAN PERNAH** menganimasikan/men-stagger elemen pada interaksi rutin frekuensi tinggi (misal dropdown menu, tombol submit, autocomplete). Stagger hanya untuk halaman awal (*initial load*) atau kartu hero.

---

## 6. Subtle Contextual Exit Animations
Elemen yang keluar dari layar (*exit state*) harus lebih halus dan lebih cepat daripada saat masuk.
- Gunakan pergeseran vertikal kecil (`translateY` $4\text{–}8\text{px}$) ke arah logis keluarannya.
- Terapkan durasi $60\text{–}70\%$ lebih cepat dari enter, dengan `ease-out` untuk kedua arah:
  ```tsx
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } }}
    exit={{ opacity: 0, y: -4, transition: { duration: 0.15, ease: "easeOut" } }}
  />
  ```

---

## 7. Contextual Icon Animations (Pop & Settle)
Saat mengganti ikon status (misal: Copy $\to$ Copied checkmark, Play $\to$ Pause, Bookmark $\to$ Bookmarked):
- Kombinasikan 3 properti:
  1. **Scale**: $0.25 \to 1$
  2. **Opacity**: $0 \to 1$
  3. **Blur**: $4\text{px} \to 0\text{px}$
- Gunakan spring tanpa pantulan liar (*zero bounce*):
  ```tsx
  <motion.div
    initial={{ scale: 0.25, opacity: 0, filter: "blur(4px)" }}
    animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
    exit={{ scale: 0.25, opacity: 0, filter: "blur(4px)" }}
    transition={{ type: "spring", duration: 0.3, bounce: 0 }}
  >
    <Check className="h-4 w-4" />
  </motion.div>
  ```

---

## 8. Native Font Smoothing
Pastikan rendering font di browser webkit/macOS setajam di Figma:
```css
body, html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

---

## 9. Tabular Numbers (Anti-Layout Shift)
Untuk angka dinamis, counter, jam, harga, statistik, atau stopwatch, angka proporsional standar menyebabkan getaran horizontal (*jitter*) saat angka berubah.
- Wajib gunakan:
  ```css
  font-variant-numeric: tabular-nums;
  /* Tailwind utility: */
  className="tabular-nums font-mono" /* atau cukup tabular-nums */
  ```

---

## 10. Modern Text Wrapping (Balance & Pretty)
Hindari kata tunggal yang jatuh sendirian di baris baru (*widows / orphans*).
- **Headings (Judul)**: Wajib gunakan `text-wrap: balance` (`balance` di Tailwind).
- **Body Copy (Paragraf)**: Gunakan `text-wrap: pretty` (`pretty` di Tailwind) untuk membagi tipografi secara proporsional.
  ```html
  <h2 class="text-2xl font-bold tracking-tight text-balance">Peluncuran Fitur Mutakhir Tanpa Kendala</h2>
  <p class="text-muted-foreground text-pretty max-w-prose">Dapatkan kemudahan otomatisasi sistem kami.</p>
  ```

---

## 11. Subtle Image Outlines (Light & Dark Mode)
Gambar di atas latar belakang sering kali kehilangan batas tepi jika warnanya mirip (misal foto putih di background putih, atau screenshot gelap di dark mode).
- Berikan outline 1px tipis dengan opacity rendah:
  - **Light Mode**: `oklch(0 0 0 / 0.08)` atau `border-black/10` (hitam murni dengan transparansi rendah).
  - **Dark Mode**: `oklch(1 0 0 / 0.12)` atau `border-white/10` (putih murni dengan transparansi rendah).
- **DILARANG**: Menggunakan border abu-abu flat (`#CCCCCC` atau `#333333`) karena akan terlihat kusam dan murahan.

---

## 12. Precise Scale on Press (Tactile Micro-Feedback)
Beri respons fisik saat tombol ditekan (*press/active state*):
- Gunakan skala tepat: `active:scale-[0.96]`.
- **Batas Kritis**: Jangan pernah lebih kecil dari `0.95` (akan terasa seperti tombol menciut rusak atau tenggelam).
- Tambahkan transisi lembut: `transition-transform duration-100 ease-out`.

---

## 13. Skip Animation on Page Load
Saat user me-refresh atau pertama kali membuka halaman yang memiliki `AnimatePresence`, jangan paksa elemen yang sudah ada untuk fade-in dari ketiadaan kecuali itu hero reveal yang disengaja.
- Tambahkan properti `initial={false}` pada `AnimatePresence`:
  ```tsx
  <AnimatePresence initial={false}>
    {isOpen && <Panel key="panel" />}
  </AnimatePresence>
  ```

---

## 14. Never Use `transition: all`
- `transition: all` memicu kalkulasi ulang properti CSS yang mahal (`height`, `width`, `margin`, `padding`, `box-shadow`) dan merusak performa GPU.
- **Aturan**: Selalu nyatakan properti target secara eksplisit:
  ```css
  /* Bad */
  transition: all 0.2s ease;

  /* Good */
  transition: transform 0.2s ease, opacity 0.2s ease, background-color 0.15s ease;
  ```

---

## 15. Use `will-change` Sparingly
- Jangan sembarangan menambahkan `will-change: transform` pada semua elemen di CSS permanen (ini memakan alokasi layer memori VRAM yang berlebihan).
- Gunakan `will-change` **hanya** pada elemen yang sedang aktif dianimasikan, lalu lepas kembali setelah animasi selesai, atau batasi hanya untuk `transform, opacity, filter`.

---

## 16. Minimum Interactive Hit Area
Elemen kecil (ikon close, action dots, toggle kecil) sangat rentan meleset saat diklik.
- **Mobile / Touch**: Minimal $44 \times 44\text{px}$ (standar WCAG).
- **Desktop**: Minimal $40 \times 40\text{px}$.
- **Trik Pseudo-Element**: Jika ikon visual hanya berukuran $16\text{px}$ atau $20\text{px}$, perluas area klik tanpa mengubah tata letak dengan pseudo-element `::after`:
  ```html
  <button class="relative p-1">
    <X className="h-4 w-4" />
    <span class="absolute -inset-2" aria-hidden="true" />
  </button>
  ```

---

## 17. Match Icon Stroke to Text Weight
Ketebalan garis ikon (*stroke weight*) yang tidak cocok dengan font di sebelahnya menciptakan ketimpangan visual instan.
- **Font Weight 400 (Regular)**: Gunakan `stroke-width={1.5}` pada Lucide icons.
- **Font Weight 500 (Medium)**: Gunakan `stroke-width={1.75}`.
- **Font Weight 600 (Semibold / Bold)**: Gunakan `stroke-width={2.0}`.
  ```tsx
  {/* Semibold button text + stroke-2 icon */}
  <Button className="font-semibold gap-2">
    <Plus className="h-4 w-4" strokeWidth={2} />
    Tambah Proyek
  </Button>
  ```

---

## 18. One SVG, Recolored via `currentColor`
Jangan muat dua file SVG berbeda hanya untuk state default dan state aktif/hover.
- Buat satu SVG dengan struktur: outline sebagai path utama, dan isi fill dikontrol dinamis via `currentColor` atau opacity fill:
  ```tsx
  <Heart 
    className={cn(
      "h-5 w-5 transition-colors", 
      isLiked ? "fill-primary text-primary" : "fill-transparent text-muted-foreground"
    )} 
  />
  ```

---

## 19. Motion Restraint & The 10% Speed Audit
Untuk memastikan antarmuka bebas dari glitch, flicker, atau layout shift mikro:
- Buka **Chrome DevTools $\to$ More Tools $\to$ Animations**.
- Perlambat kecepatan hingga **10%** (0.1x speed).
- Klik seluruh tombol, buka dropdown, trigger modal, dan amati:
  1. Apakah ada border yang berkedip?
  2. Apakah transisi hover terputus (*snap*) saat kursor keluar cepat?
  3. Apakah teks mengalami subpixel shift saat diskalakan?
- Perbaiki setiap cacat mikro tersebut sebelum menyerahkan antarmuka ke user.
