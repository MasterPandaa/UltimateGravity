# GreenSock GSAP Motion Protocol: Animation Standards & Anti-Leak

Canonical reference guide for engineering high-craft interactive web animations using **GSAP (GreenSock Animation Platform)** cleanly, eliminating memory leaks in React/Next.js, and sustaining 60 FPS performance.

---

## 1. React / Next.js Integration & Context Cleanup (Mandatory useGSAP)

The most common AI failure when authoring GSAP in React is **memory leaks** and duplicate animation triggers caused by React 18+ render cycles (*StrictMode remounting*).

### Standard Rules:
- **Always use `@gsap/react` and the `useGSAP` hook**:
  Never use raw `useEffect` without properly cleaning up `gsap.context()`. The `useGSAP` hook automatically wraps animations in a `gsap.context()` and reverts all timelines when the component unmounts.

```tsx
// ✅ CORRECT: Using useGSAP with automatic scoping
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export function HeroFeature() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // All selectors inside are automatically scoped to containerRef!
      gsap.from(".card", {
        y: 40,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out",
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="grid grid-cols-3 gap-6">
      <div className="card">Feature 1</div>
      <div className="card">Feature 2</div>
      <div className="card">Feature 3</div>
    </div>
  );
}
```

---

## 2. `autoAlpha` vs. `opacity` (Pointer Events Block Bug)

- **The Pitfall**: Setting `opacity: 0` only conceals elements visually. The transparent element **remains in the DOM and intercepts pointer/click events**, blocking user interactions with underlying buttons.
- **Canonical Solution**: Always use **`autoAlpha`** instead of `opacity`.
  - `autoAlpha: 0` $\to$ Sets `opacity: 0` AND `visibility: hidden` (element does not block pointer events).
  - `autoAlpha: 1` $\to$ Sets `visibility: visible` AND animates `opacity: 1`.

```javascript
// ❌ WRONG (Blocks user clicks on underlying elements)
gsap.to(".modal", { opacity: 0, duration: 0.3 });

// ✅ CORRECT (Safe & zero pointer-event obstruction)
gsap.to(".modal", { autoAlpha: 0, duration: 0.3 });
```

---

## 3. GPU Compositor Optimization: Transform Coordinates

- **Strictly Prohibited**: Animating layout properties: `top`, `left`, `right`, `bottom`, `width`, `height`, `margin`, `padding`. These trigger CPU-bound *layout thrashing* and reflows.
- **Always Use GPU Transforms**:
  - Use `x` and `y` (pixel translations).
  - Use `xPercent` and `yPercent` for translations relative to element dimensions (e.g., centering via `xPercent: -50, yPercent: -50`).
  - Use `scale` and `rotation`.

```javascript
// ❌ WRONG (CPU Layout Reflow - Jitters on mobile)
gsap.to(".box", { left: 200, top: 100 });

// ✅ CORRECT (GPU Hardware Accelerated - 60 FPS)
gsap.to(".box", { x: 200, y: 100, force3D: true });
```

---

## 4. Timeline Position Parameters (Precision Sequencing)

When choreographing animation sequences via `gsap.timeline()`, avoid brittle hardcoded delays (`delay: 1.2`). Use **position parameters**:

| Parameter | Meaning | Example |
|---|---|---|
| `"+=0.2"` | Delay 0.2s after the previous animation finishes | `.to(".el2", { x: 100 }, "+=0.2")` |
| `"-=0.2"` | Overlap: start 0.2s BEFORE previous animation finishes | `.to(".el2", { x: 100 }, "-=0.2")` |
| `"<"` | Start **simultaneously** with the start of previous animation | `.to(".icon", { scale: 1.2 }, "<")` |
| `"<0.1"` | Start 0.1s after the start of previous animation | `.to(".text", { autoAlpha: 1 }, "<0.1")` |
| `">"` | Start immediately when previous animation ends (default) | `.to(".el2", { x: 100 }, ">")` |

---

## 5. ScrollTrigger Best Practices & Responsive Layouts

When using the `ScrollTrigger` plugin:
1. **Register Plugin Once**: `gsap.registerPlugin(ScrollTrigger);` at entry point or root file.
2. **Remove `markers: true`**: Never leave `markers: true` in production environments.
3. **Responsive via `gsap.matchMedia()`**:
   Use `gsap.matchMedia()` so scroll-driven animations cleanly disable or adapt on mobile viewports.

```tsx
useGSAP(() => {
  const mm = gsap.matchMedia();

  mm.add("(min-width: 768px)", () => {
    // Desktop animation: pin and scrub
    gsap.to(".hero-video", {
      scrollTrigger: {
        trigger: ".hero-container",
        start: "top top",
        end: "+=1000",
        scrub: 1,
        pin: true,
      },
      scale: 1.5,
    });
  });

  mm.add("(max-width: 767px)", () => {
    // Mobile animation: gentle fade without expensive pinning
    gsap.to(".hero-video", {
      scrollTrigger: {
        trigger: ".hero-container",
        start: "top 80%",
      },
      autoAlpha: 1,
    });
  });
});
```
