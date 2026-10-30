# Anime.js v4: Standar Integrasi Frontend & Full-Stack

Panduan teknis resmi penggunaan **Anime.js v4** dalam arsitektur Full-Stack modern (Next.js App Router, React 19, TypeScript, Vite).

---

## 1. Instalasi Proyek (Project-Level Dependency)

Anime.js adalah dependensi runtime aplikasi, bukan perkakas CLI global. Pasang langsung di dalam direktori proyek web Anda:

```bash
npm install animejs
# atau
pnpm add animejs
# atau
yarn add animejs
```

---

## 2. Batas Arsitektural SSR & React Lifecycle (`useAnime` Hook)

Karena Anime.js mengakses objek DOM (`document`, `window`, `requestAnimationFrame`), manipulasi animasi **wajib diisolasi di Client Component** (`'use client'`) dan dibersihkan saat unmount untuk mencegah *memory leak*.

### Pola Reusable Hook (`useAnime.ts`)

```typescript
// src/hooks/use-anime.ts
'use client';

import { useEffect, useRef } from 'react';
import { animate } from 'animejs';

type AnimateParams = Parameters<typeof animate>[1];

export function useAnime<T extends HTMLElement>(
  params: AnimateParams | (() => AnimateParams),
  deps: React.DependencyList = []
) {
  const elementRef = useRef<T | null>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    // 1. Hormati preferensi aksesibilitas pengguna
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) return;

    // 2. Inisialisasi animasi
    const resolvedParams = typeof params === 'function' ? params() : params;
    const animation = animate(elementRef.current, resolvedParams);

    // 3. Cleanup wajib saat komponen unmount atau deps berubah
    return () => {
      animation.pause();
    };
  }, deps);

  return elementRef;
}
```

---

## 3. Penerapan pada 4 UI States

### A. Loading State (Stagger Skeletons)
Gunakan utilitas `stagger` bawaan v4 untuk memunculkan deretan elemen skeleton tanpa CLS (*Cumulative Layout Shift*):

```typescript
import { animate, stagger } from 'animejs';

export function animateSkeletonList(selector: string) {
  return animate(selector, {
    opacity: [0.4, 0.9],
    duration: 750,
    delay: stagger(80),
    loop: true,
    alternate: true,
    ease: 'inOutQuad',
  });
}
```

### B. Success State (SVG Checkmark Line Drawing)
Gunakan `animate.setDashoffset` untuk efek animasi menggambar garis ikon SVG centang:

```typescript
import { animate } from 'animejs';

export function animateSuccessCheckmark(pathElement: SVGPathElement) {
  return animate(pathElement, {
    strokeDashoffset: [animate.setDashoffset, 0],
    duration: 700,
    ease: 'outQuart',
  });
}
```

### C. Error State (Form Input Micro-Shake)
Memberikan respons fisik instan saat validasi backend/Zod gagal:

```typescript
import { animate } from 'animejs';

export function animateErrorShake(inputElement: HTMLElement) {
  return animate(inputElement, {
    x: [-8, 8, -6, 6, -3, 3, 0],
    duration: 380,
    ease: 'outQuad',
  });
}
```

---

## 4. Aturan Performa & Kualitas (Zero AI Slop)

1. **GPU Composite Only**: Animasikan properti `x`, `y`, `scale`, `rotate`, `opacity`. Dilarang menganimasikan `top`, `left`, `width`, `height`, atau `margin` dinamis karena memicu *browser reflow*.
2. **Durasi Natural**:
   - Feedback tombol: 100–150 ms
   - Transisi dialog/state: 200–300 ms
   - SVG reveal / visual hero: 500–700 ms
3. **Exit Faster than Entrance**: Animasi elemen keluar (hilang) harus 1.5x lebih cepat daripada animasi elemen masuk.
