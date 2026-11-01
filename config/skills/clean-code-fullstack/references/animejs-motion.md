# Anime.js v4: Frontend & Full-Stack Integration Standards

Technical guide for integrating **Anime.js v4** within modern full-stack architectures (Next.js App Router, React 19, TypeScript, Vite).

---

## 1. Project-Level Installation
Anime.js is an application runtime dependency, not a global CLI utility. Install directly in your web project directory:

```bash
npm install animejs
# or
pnpm add animejs
# or
yarn add animejs
```

---

## 2. SSR Boundaries & React Lifecycle (`useAnime` Hook)
Because Anime.js accesses browser DOM objects (`document`, `window`, `requestAnimationFrame`), animations **must be isolated in Client Components** (`'use client'`) and cleaned up on unmount to prevent memory leaks.

### Reusable Hook Pattern (`useAnime.ts`)

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

    // 1. Honor user accessibility preferences
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) return;

    // 2. Initialize animation
    const resolvedParams = typeof params === 'function' ? params() : params;
    const animation = animate(elementRef.current, resolvedParams);

    // 3. Mandatory cleanup on component unmount or deps change
    return () => {
      animation.pause();
    };
  }, deps);

  return elementRef;
}
```

---

## 3. Application Across Mandatory 4 UI States

### A. Loading State (Staggered Skeletons)
Use v4's built-in `stagger` utility to render skeleton elements smoothly with zero cumulative layout shift (CLS):

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
Use `animate.setDashoffset` for smooth SVG icon stroke reveals:

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
Provide instant physical feedback when validation fails:

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

## 4. Performance & Motion Invariants
1. **GPU Composited Only**: Animate exclusively `x`, `y`, `scale`, `rotate`, and `opacity`. Never animate layout properties (`top`, `left`, `width`, `height`, `margin`) to avoid triggering CPU reflows.
2. **Natural Durations**:
   - Button micro-press: 100–150 ms
   - Dialog / state transitions: 200–300 ms
   - SVG line reveal / visual hero: 500–700 ms
3. **Exit Faster than Entrance**: Exit transitions must complete approximately 1.5x faster than entrance animations.
