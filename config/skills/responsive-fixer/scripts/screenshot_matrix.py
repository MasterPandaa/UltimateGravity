#!/usr/bin/env python3
"""Automated responsive testing: screenshot capture + multi-viewport layout measurement (Playwright).

For each viewport size, this script:
  - captures a screenshot,
  - detects horizontal overflow and identifies offending elements,
  - counts text elements < 12px, undersized touch targets (on touch viewports), and overlong prose lines.

Examples:
  python3 screenshot_matrix.py index.html --preset quick --out shots/
  python3 screenshot_matrix.py http://localhost:3000 /about --preset full
  python3 screenshot_matrix.py index.html --sizes 390x844,1920x1080@2,960x540@2
  python3 screenshot_matrix.py index.html --preset tv --full-page

Prerequisites (one-time): pip install playwright && playwright install chromium
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from urllib.parse import urljoin

# name, width, height, dpr, mobile(touch)
PRESETS = {
    "quick": [
        ("phone-small", 360, 640, 2, True),
        ("phone", 390, 844, 3, True),
        ("phone-landscape", 844, 390, 3, True),
        ("tablet", 768, 1024, 2, True),
        ("tablet-landscape", 1024, 768, 2, True),
        ("laptop", 1366, 768, 1, False),
        ("desktop-fhd", 1920, 1080, 1, False),
        ("ultrawide", 3440, 1440, 1, False),
    ],
    "full": [
        ("narrow-320", 320, 568, 2, True),
        ("phone-small", 360, 640, 2, True),
        ("phone", 390, 844, 3, True),
        ("phone-large", 430, 932, 3, True),
        ("phone-landscape", 844, 390, 3, True),
        ("foldable-open", 717, 512, 2, True),
        ("tablet", 768, 1024, 2, True),
        ("tablet-large", 820, 1180, 2, True),
        ("tablet-landscape", 1024, 768, 2, True),
        ("tablet-pro", 1024, 1366, 2, True),
        ("laptop", 1366, 768, 1, False),
        ("laptop-hd", 1440, 900, 2, False),
        ("desktop-fhd", 1920, 1080, 1, False),
        ("qhd", 2560, 1440, 1, False),
        ("ultrawide", 3440, 1440, 1, False),
        ("uhd-4k", 3840, 2160, 1, False),
    ],
    "tv": [
        ("tv-540-2x", 960, 540, 2, False),
        ("tv-720", 1280, 720, 1, False),
        ("tv-720-1.5x", 1280, 720, 1.5, False),
        ("tv-1080", 1920, 1080, 1, False),
        ("tv-4k-1x", 3840, 2160, 1, False),
        ("tv-4k-2x", 1920, 1080, 2, False),
    ],
}

MEASURE_JS = r"""
() => {
  const de = document.documentElement;
  const vw = de.clientWidth;
  const out = {innerWidth: window.innerWidth, innerHeight: window.innerHeight, dpr: window.devicePixelRatio,
               clientW: vw, scrollW: de.scrollWidth, bodyScrollW: document.body ? document.body.scrollWidth : 0,
               hasViewportMeta: !!document.querySelector('meta[name=viewport]'),
               offenders: [], smallText: 0, smallTargets44: 0, smallTargets24: 0, longLines: 0, totalLinks: 0};
  const sel = (el) => {
    let s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    const c = (typeof el.className === 'string' ? el.className : '').trim().split(/\s+/).filter(Boolean).slice(0, 3);
    if (c.length) s += '.' + c.join('.');
    return s;
  };
  const clippedByAncestor = (el) => {
    let p = el.parentElement;
    while (p && p !== document.body && p !== document.documentElement) {
      const o = getComputedStyle(p);
      if (/(auto|scroll|hidden|clip)/.test(o.overflowX)) return true;
      p = p.parentElement;
    }
    return false;
  };
  const seen = new Set();
  const all = document.querySelectorAll('body *');
  const interactive = 'a[href],button,input:not([type=hidden]),select,textarea,summary,[role=button],[tabindex]:not([tabindex="-1"])';
  for (const el of all) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.position === 'fixed' && cs.opacity === '0') continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    if ((r.right > vw + 1 || r.left < -1) && !clippedByAncestor(el)) {
      if (!(el.parentElement && seen.has(el.parentElement))) {
        if (out.offenders.length < 15) {
          out.offenders.push({selector: sel(el), width: Math.round(r.width), left: Math.round(r.left),
                              right: Math.round(r.right), over: Math.round(r.right - vw)});
        }
      }
      seen.add(el);
    }
    // small text: direct text nodes
    let hasText = false;
    for (const n of el.childNodes) { if (n.nodeType === 3 && n.textContent.trim().length > 1) { hasText = true; break; } }
    if (hasText) {
      const fs = parseFloat(cs.fontSize);
      if (fs < 12) out.smallText++;
      if (el.tagName === 'P' && el.textContent.length > 200) {
        const cpl = r.width / (fs * 0.5);
        if (cpl > 110) out.longLines++;
      }
    }
    if (el.matches(interactive)) {
      out.totalLinks++;
      if (r.width < 24 || r.height < 24) out.smallTargets24++;
      if (r.width < 44 || r.height < 44) out.smallTargets44++;
    }
  }
  return out;
}
"""


def parse_sizes(spec: str):
    sizes = []
    for part in spec.split(","):
        part = part.strip()
        m = re.fullmatch(r"(\d+)x(\d+)(?:@([\d.]+))?", part)
        if not m:
            raise SystemExit(f"Invalid --sizes format: '{part}' (e.g. 390x844 or 1920x1080@2)")
        w, h = int(m.group(1)), int(m.group(2))
        dpr = float(m.group(3)) if m.group(3) else 1
        touch = w <= 1100 and (m.group(3) is not None and dpr >= 2 or w <= 820)
        sizes.append((f"{w}x{h}" + (f"@{m.group(3)}x" if m.group(3) else ""), w, h, dpr, touch))
    return sizes


def to_url(target: str, base: str | None) -> str:
    if re.match(r"^https?://", target) or target.startswith("file://"):
        return target
    if base and target.startswith("/"):
        return urljoin(base, target)
    p = Path(target)
    if p.exists():
        return p.resolve().as_uri()
    if base:
        return urljoin(base, target)
    raise SystemExit(f"Target not found: {target} (provide an http(s):// URL or existing file path)")


def slug(url: str) -> str:
    s = re.sub(r"^[a-z]+://", "", url)
    s = re.sub(r"[^A-Za-z0-9]+", "-", s).strip("-")
    return s[-60:] or "page"


def main(argv=None):
    ap = argparse.ArgumentParser(description="Multi-viewport screenshot capture and responsive metric audit.")
    ap.add_argument("targets", nargs="+", help="URL (http/https), HTML file path, or relative path to first URL")
    ap.add_argument("--preset", choices=sorted(PRESETS), default="quick")
    ap.add_argument("--sizes", help="custom size list, e.g. 390x844,1920x1080@2 (overrides --preset)")
    ap.add_argument("--out", default="responsive-shots", help="output directory")
    ap.add_argument("--full-page", action="store_true", help="capture full-page height screenshot")
    ap.add_argument("--timeout", type=int, default=30000, help="navigation timeout (ms)")
    ap.add_argument("--wait", type=int, default=400, help="delay after resize (ms)")
    ap.add_argument("--no-screenshots", action="store_true", help="measure metrics only, skip saving images")
    ap.add_argument("--strict", action="store_true", help="exit with code 1 if horizontal scroll detected")
    args = ap.parse_args(argv)

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("Playwright is not installed. Run:\n  pip install playwright\n  playwright install chromium",
              file=sys.stderr)
        return 2

    sizes = parse_sizes(args.sizes) if args.sizes else PRESETS[args.preset]
    base = args.targets[0] if re.match(r"^https?://", args.targets[0]) else None
    urls = [to_url(t, base) for t in args.targets]
    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    results = []
    with sync_playwright() as pw:
        try:
            browser = pw.chromium.launch()
        except Exception as e:
            print("Failed to launch Chromium: " + str(e).splitlines()[0] +
                  "\nRun: playwright install chromium", file=sys.stderr)
            return 2
        for url in urls:
            for name, w, h, dpr, touch in sizes:
                ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=dpr,
                                          is_mobile=touch, has_touch=touch)
                page = ctx.new_page()
                entry = {"url": url, "size": name, "width": w, "height": h, "dpr": dpr, "touch": touch}
                try:
                    try:
                        page.goto(url, wait_until="networkidle", timeout=args.timeout)
                    except Exception:
                        page.goto(url, wait_until="load", timeout=args.timeout)
                    page.wait_for_timeout(args.wait)
                    m = page.evaluate(MEASURE_JS)
                    entry.update(m)
                    entry["overflowX"] = m["scrollW"] > m["clientW"] + 1
                    # on touch devices, layout width differing from device width indicates zoomed out viewport
                    entry["layoutMismatch"] = bool(touch and abs(m["clientW"] - w) > 1)
                    if not args.no_screenshots:
                        shot = out_dir / f"{slug(url)}__{name}.png"
                        page.screenshot(path=str(shot), full_page=args.full_page)
                        entry["screenshot"] = str(shot)
                except Exception as e:
                    entry["error"] = str(e).splitlines()[0]
                finally:
                    ctx.close()
                results.append(entry)
                if "error" in entry:
                    flag = "ERROR"
                elif entry.get("overflowX"):
                    flag = "OVERFLOW"
                elif entry.get("layoutMismatch"):
                    flag = "VIEWPORT"
                else:
                    flag = "ok"
                print(f"[{flag:8}] {name:18} {w}x{h}@{dpr}x  {url}")
        browser.close()

    (out_dir / "report.json").write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    write_markdown(out_dir / "report.md", results)
    print(f"\nReport: {out_dir / 'report.md'}  |  Data: {out_dir / 'report.json'}")
    bad = [r for r in results if r.get("overflowX")]
    mism = [r for r in results if r.get("layoutMismatch")]
    errs = [r for r in results if "error" in r]
    print(f"Summary: {len(results)} tests, {len(bad)} with horizontal scroll, "
          f"{len(mism)} with layout width != device width, {len(errs)} errors.")
    if args.strict and (bad or mism or errs):
        return 1
    return 0


def write_markdown(path: Path, results):
    L = ["# Responsive Matrix Report", "",
         "| Viewport | Layout Width (clientWidth) | Scroll-X | Text <12px | Targets <44px | Targets <24px | Long Lines | Viewport Meta |",
         "|---|---|---|---|---|---|---|---|"]
    for r in results:
        if "error" in r:
            L.append(f"| {r['size']} | {r['width']}x{r['height']} | ERROR: {r['error']} | | | | | |")
            continue
        lw = f"{r['clientW']}px" + (f" (device {r['width']}px: MISMATCH)" if r.get("layoutMismatch") else "")
        L.append("| {size} | {lw} | {ox} | {st} | {t44} | {t24} | {ll} | {vm} |".format(
            size=r["size"], lw=lw,
            ox=f"YES (+{r['scrollW'] - r['clientW']}px)" if r["overflowX"] else "no",
            st=r["smallText"], t44=r["smallTargets44"] if r["touch"] else "-",
            t24=r["smallTargets24"] if r["touch"] else "-", ll=r["longLines"],
            vm="present" if r["hasViewportMeta"] else "MISSING"))
    L += ["", "Note: 'Targets' measured only on touch viewports. 'Long lines' = paragraphs > ~110 chars per line "
          "(estimate). MISMATCH on touch viewports indicates layout width does not match device width: page is "
          "scaled down (missing/rigid viewport meta or wide content). Inspect screenshots visually.", ""]
    offenders = [(r["size"], r["offenders"]) for r in results if r.get("offenders")]
    if offenders:
        L += ["## Elements Overflowing Viewport Edge", ""]
        for size, offs in offenders:
            L.append(f"### {size}")
            for o in offs:
                L.append(f"- `{o['selector']}`: width={o['width']}px, right={o['right']}px (+{o['over']}px overflow)")
        L.append("")
    path.write_text("\n".join(L), encoding="utf-8")


if __name__ == "__main__":
    sys.exit(main())
