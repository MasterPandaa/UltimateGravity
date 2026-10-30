#!/usr/bin/env python3
"""Pemindai statis masalah responsif (tanpa dependensi, hanya stdlib).

Memindai HTML/CSS/SCSS/JSX/TSX/Vue/Svelte/Astro/PHP/Blade/dll. dan melaporkan pola yang
sering menjadi akar masalah tampilan tidak responsif. Hasilnya PETUNJUK, bukan vonis:
verifikasi setiap temuan dengan membaca konteksnya.

Contoh:
  python3 audit_responsive.py ./my-project
  python3 audit_responsive.py ./my-project --json --max-per-rule 5
  python3 audit_responsive.py ./src/styles.css ./index.html --fail-on high
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

SEVERITY_ORDER = {"high": 0, "medium": 1, "low": 2, "info": 3}

SKIP_DIRS = {
    "node_modules", ".git", ".hg", ".svn", "dist", "build", "out", ".next", ".nuxt",
    ".svelte-kit", ".output", "vendor", "coverage", "__pycache__", ".venv", "venv",
    "bower_components", ".cache", ".turbo", "storybook-static", "public/build",
}
MARKUP_EXT = {".html", ".htm", ".php", ".erb", ".twig", ".njk", ".liquid", ".ejs",
              ".hbs", ".jsp", ".cshtml", ".razor", ".astro", ".vue", ".svelte", ".blade.php"}
STYLE_EXT = {".css", ".scss", ".sass", ".less", ".styl", ".pcss"}
SCRIPT_EXT = {".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"}
ALL_EXT = MARKUP_EXT | STYLE_EXT | SCRIPT_EXT
MAX_FILE_BYTES = 2_000_000
MIN_FILE_SKIP_SUFFIX = (".min.css", ".min.js", ".bundle.js", ".chunk.js")

TEXT_ADVICE = {
    "no-viewport-meta": "Tambahkan <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"> di <head>.",
    "viewport-fixed-width": "Ganti width tetap dengan width=device-width, initial-scale=1.",
    "viewport-blocks-zoom": "Hapus user-scalable=no / maximum-scale=1; memblokir zoom (aksesibilitas) dan bukan solusi responsif.",
    "fixed-width-px": "Ganti dengan width: 100% + max-width, atau min(100%, Nrem), atau grid/flex fluid.",
    "fixed-min-width-px": "min-width besar memaksa overflow di HP; pakai min(100%, N) atau pindah ke wrapper scroll.",
    "fixed-height-px": "Gunakan min-height / padding / aspect-ratio agar konten tidak terpotong.",
    "100vh": "Pakai min-height: 100dvh dengan fallback 100vh (bar alamat browser HP memengaruhi vh).",
    "100vw": "100vw termasuk scrollbar sehingga memicu scroll horizontal; pakai 100% atau inset: 0.",
    "vw-font-no-clamp": "Bungkus clamp(min, calc(rem + vw), max) agar zoom tetap bekerja dan tidak raksasa di TV.",
    "root-font-px": "Biarkan root 100% atau gunakan rem/clamp; font root px kaku menghambat skala dan preferensi pengguna.",
    "page-zoom-or-scale": "Hindari zoom/scale global sebagai solusi; perbaiki unit dan layout (kanvas tetap hanya untuk signage).",
    "overflow-x-hidden": "Biasanya menutupi gejala; cari elemen penyebab overflow (lihat references/diagnosis-checklist.md bagian 8).",
    "small-font": "Teks <12px sulit dibaca di HP; naikkan kecuali legal/caption.",
    "device-specific-breakpoint": "Breakpoint per device cepat usang; tentukan dari titik rusak konten, bukan nama device.",
    "tailwind-arbitrary-width": "Ganti w-[NNNpx] dengan w-full max-w-* atau kelas responsif (sm:/md:/lg:).",
    "tailwind-h-screen": "Ganti h-screen dengan min-h-dvh (Tailwind 3.4+) atau min-h-[100dvh].",
    "tailwind-unprefixed-grid": "grid-cols-N tanpa prefix berlaku di HP; mulai dari grid-cols-1 lalu sm:/md:/lg:grid-cols-N.",
    "inline-style-width": "Lebar piksel kaku di style/JS; gunakan nilai relatif atau CSS class responsif.",
    "table-no-wrapper": "Bungkus <table> dengan div overflow-x: auto atau ubah jadi kartu di layar kecil.",
    "img-fixed-width-attr": "Atribut width besar tanpa CSS max-width:100%; tambahkan img { max-width:100%; height:auto }.",
    "no-media-queries": "Tidak ada @media sama sekali; pastikan layout memang fluid sepenuhnya atau tambahkan breakpoint struktural.",
    "desktop-first-only": "Hanya max-width media query (desktop-first); pertimbangkan mobile-first dengan min-width.",
    "no-tablet-breakpoint": "Tidak ada breakpoint di rentang 600-1100px; periksa tampilan tablet/landscape.",
    "no-large-screen-handling": "Tidak ada penanganan layar >=1600px; periksa max-width container dan skala di TV/4K/ultrawide.",
    "no-box-sizing": "Tambahkan *, *::before, *::after { box-sizing: border-box } agar padding tidak membuat elemen melebar.",
    "no-img-max-width": "Tidak ditemukan img { max-width: 100% }; gambar besar bisa meluber.",
    "hover-only": "Ada :hover tapi tidak ada @media (hover: hover); pastikan fungsi tidak hanya bisa lewat hover.",
    "no-dvh-with-vh": "Tidak ada unit dvh/svh sementara 100vh dipakai.",
}


class Finding:
    __slots__ = ("rule", "severity", "file", "line", "snippet", "message")

    def __init__(self, rule, severity, file, line, snippet, message):
        self.rule = rule
        self.severity = severity
        self.file = file
        self.line = line
        self.snippet = snippet
        self.message = message

    def to_dict(self):
        return {"rule": self.rule, "severity": self.severity, "file": self.file,
                "line": self.line, "snippet": self.snippet, "message": self.message,
                "advice": TEXT_ADVICE.get(self.rule, "")}


def iter_files(paths):
    for p in paths:
        p = Path(p)
        if p.is_file():
            yield p
            continue
        if not p.is_dir():
            print(f"[peringatan] path tidak ditemukan: {p}", file=sys.stderr)
            continue
        stack = [p]
        while stack:
            d = stack.pop()
            try:
                entries = sorted(d.iterdir())
            except OSError:
                continue
            for e in entries:
                if e.is_dir():
                    if e.name in SKIP_DIRS or e.name.startswith(".") and e.name not in {".storybook"}:
                        continue
                    stack.append(e)
                elif e.is_file():
                    yield e


def suffix_of(path: Path) -> str:
    name = path.name.lower()
    if name.endswith(".blade.php"):
        return ".blade.php"
    return path.suffix.lower()


def read_text(path: Path):
    try:
        if path.stat().st_size > MAX_FILE_BYTES:
            return None
        return path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return None


def strip_css_comments(text: str) -> str:
    """Hapus komentar /* */ tetapi pertahankan jumlah baris agar nomor baris tetap akurat."""
    return re.sub(r"/\*.*?\*/", lambda m: "\n" * m.group(0).count("\n"), text, flags=re.S)


def snippet_of(line: str, width: int = 140) -> str:
    s = line.strip()
    return s if len(s) <= width else s[: width - 3] + "..."


# ---------- aturan regex per baris ----------
RE_WIDTH_PX = re.compile(r"(?<![-\w])(width)\s*:\s*(\d{3,5})(?:\.\d+)?px", re.I)
RE_MINWIDTH_PX = re.compile(r"(?<![\w])(min-width)\s*:\s*(\d{3,5})(?:\.\d+)?px", re.I)
RE_HEIGHT_PX = re.compile(r"(?<![-\w])(height)\s*:\s*(\d{3,5})(?:\.\d+)?px", re.I)
RE_100VH = re.compile(r"(?<![\w-])(?:min-|max-)?height\s*:\s*100vh|\b100vh\b", re.I)
RE_100VW = re.compile(r"(?<![\w.])100vw\b", re.I)
RE_VW_FONT = re.compile(r"font-size\s*:\s*[\d.]+vw\b", re.I)
RE_ZOOM = re.compile(r"(?<![-\w])zoom\s*:\s*(?!1\b|1\.0\b|normal|reset|inherit|initial|unset)[\d.]+", re.I)
RE_OVERFLOWX = re.compile(r"overflow(?:-x)?\s*:\s*hidden", re.I)
RE_SMALL_FONT = re.compile(r"font-size\s*:\s*(?:[0-9]|1[01])(?:\.\d+)?px", re.I)
RE_MEDIA_PX = re.compile(r"@media[^{]*?\((?:max|min)-width\s*:\s*(\d+(?:\.\d+)?)(px|em|rem)\s*\)", re.I)
RE_MEDIA_ANY = re.compile(r"@media\b", re.I)
RE_MEDIA_MAX = re.compile(r"\(\s*max-width\s*:", re.I)
RE_MEDIA_MIN = re.compile(r"\(\s*min-width\s*:", re.I)
RE_MEDIA_RANGE = re.compile(r"@media[^{]*\(\s*(?:width|inline-size)\s*(?:<=?|>=?)|@media[^{]*\d\s*(?:<=?|>=?)\s*width", re.I)
RE_ROOT_FONT_PX = re.compile(r"(?:^|[\s,}])(?:html|:root)\s*\{[^{}]*?font-size\s*:\s*(\d+(?:\.\d+)?)px", re.I | re.S)
RE_TW_ARB_W = re.compile(r"(?<![\w:-])(?:(?:min-)?w)-\[(\d{3,4})px\]")
RE_TW_H_SCREEN = re.compile(r"(?<![\w-])(?:min-|max-)?h-screen\b")
RE_TW_GRID = re.compile(r"(?<![\w:-])grid-cols-([3-9]|1[0-2])\b")
RE_TW_GRID_RESP = re.compile(r"\b(?:sm|md|lg|xl|2xl|@\w+):grid-cols-")
RE_INLINE_W = re.compile(
    r"(?<![-\w.])(?:min)?[wW]idth\s*[:=]\s*[{]?\s*['\"]?(\d{3,4})(?:px)?['\"]?\s*[},;]?", re.I)
RE_STYLE_ATTR_W = re.compile(r"style\s*=\s*(?:\"[^\"]*|'[^']*)\bwidth\s*:\s*(\d{3,4})px", re.I)
RE_IMG_W_ATTR = re.compile(r"<img\b[^>]*\bwidth\s*=\s*[\"']?(\d{3,4})[\"']?", re.I)
RE_HOVER = re.compile(r":hover\b")
RE_HOVER_GUARD = re.compile(r"\(\s*(?:any-)?hover\s*:\s*hover\s*\)", re.I)
RE_VIEWPORT = re.compile(r"<meta[^>]+name\s*=\s*[\"']viewport[\"'][^>]*>", re.I)
RE_VIEWPORT_ALT = re.compile(r"<meta[^>]+content\s*=\s*[\"'][^\"']*[\"'][^>]+name\s*=\s*[\"']viewport[\"'][^>]*>", re.I)
RE_BOX_SIZING = re.compile(r"box-sizing\s*:\s*border-box", re.I)
RE_IMG_MAXW = re.compile(r"(?:img|picture|video|svg|\.img-fluid)[^{}]*\{[^{}]*max-width\s*:\s*100%", re.I | re.S)
RE_DVH = re.compile(r"\b\d+(?:\.\d+)?(?:dvh|svh|lvh)\b|\bmin-h-dvh\b|\bh-dvh\b|100dvh|100svh", re.I)
RE_TAILWIND_MARK = re.compile(r"tailwind", re.I)
DEVICE_BP = {"320", "360", "375", "390", "393", "412", "414", "428", "430", "568", "667", "736", "812", "844", "896", "926", "932"}


def media_values_px(text: str):
    vals = []
    for m in RE_MEDIA_PX.finditer(text):
        v = float(m.group(1))
        if m.group(2).lower() in ("em", "rem"):
            v *= 16
        vals.append(v)
    return vals


def scan_file(path: Path, text: str, ext: str, ctx: dict, findings: list):
    rel = str(path)
    is_style = ext in STYLE_EXT
    is_markup = ext in MARKUP_EXT
    is_script = ext in SCRIPT_EXT
    clean = strip_css_comments(text) if (is_style or is_markup) else text
    lines = clean.splitlines()

    # --- viewport meta (hanya file dokumen penuh) ---
    if is_markup and re.search(r"<head[\s>]", text, re.I) and re.search(r"<html[\s>]|<!doctype", text, re.I):
        ctx["full_documents"] += 1
        vp = RE_VIEWPORT.search(text) or RE_VIEWPORT_ALT.search(text)
        if not vp:
            findings.append(Finding("no-viewport-meta", "high", rel, 1, "<head> tanpa <meta name=viewport>",
                                    "Dokumen tidak memiliki meta viewport"))
        else:
            tag = vp.group(0)
            line_no = text[: vp.start()].count("\n") + 1
            if re.search(r"width\s*=\s*\d+", tag) and "device-width" not in tag:
                findings.append(Finding("viewport-fixed-width", "high", rel, line_no, snippet_of(tag),
                                        "Viewport memakai lebar piksel tetap"))
            if re.search(r"user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\.0)?\b", tag, re.I):
                findings.append(Finding("viewport-blocks-zoom", "medium", rel, line_no, snippet_of(tag),
                                        "Viewport memblokir zoom pengguna"))
            if "initial-scale" not in tag:
                findings.append(Finding("viewport-fixed-width", "low", rel, line_no, snippet_of(tag),
                                        "Viewport tanpa initial-scale=1"))

    if RE_TAILWIND_MARK.search(text[:3000]) or "tailwind" in path.name.lower():
        ctx["tailwind"] = True

    # --- konteks proyek ---
    if is_style or is_markup:
        ctx["css_text_parts"].append(clean)
        mv = media_values_px(clean)
        ctx["media_values"].extend(mv)
        ctx["media_count"] += len(RE_MEDIA_ANY.findall(clean))
        ctx["media_max"] += len(RE_MEDIA_MAX.findall(clean))
        ctx["media_min"] += len(RE_MEDIA_MIN.findall(clean)) + len(RE_MEDIA_RANGE.findall(clean))
        ctx["hover_count"] += len(RE_HOVER.findall(clean))
        if RE_HOVER_GUARD.search(clean):
            ctx["hover_guard"] = True
        if RE_BOX_SIZING.search(clean):
            ctx["box_sizing"] = True
        if RE_IMG_MAXW.search(clean):
            ctx["img_maxw"] = True
        if RE_DVH.search(clean):
            ctx["has_dvh"] = True
        ctx["files_scanned_css"] += 1

    if is_script or is_markup:
        if RE_DVH.search(text):
            ctx["has_dvh"] = True

    # --- aturan per baris ---
    in_media_header = False
    for i, raw in enumerate(lines, start=1):
        line = raw
        if len(line) > 600:  # kemungkinan minified; potong agar tidak berat
            line = line[:600]
        stripped = line.strip()
        if not stripped:
            continue
        is_media_line = stripped.startswith("@media") or stripped.startswith("@container")

        if is_style or is_markup:
            if not is_media_line:
                for m in RE_WIDTH_PX.finditer(line):
                    val = int(m.group(2))
                    if val >= 481:
                        sev = "high" if val >= 700 else "medium"
                        findings.append(Finding("fixed-width-px", sev, rel, i, snippet_of(line),
                                                f"width tetap {val}px (lebih lebar dari banyak layar HP)"))
                for m in RE_MINWIDTH_PX.finditer(line):
                    val = int(m.group(2))
                    if val >= 481:
                        findings.append(Finding("fixed-min-width-px", "medium", rel, i, snippet_of(line),
                                                f"min-width {val}px dapat memaksa overflow di layar kecil"))
                for m in RE_HEIGHT_PX.finditer(line):
                    val = int(m.group(2))
                    if val >= 400:
                        findings.append(Finding("fixed-height-px", "low", rel, i, snippet_of(line),
                                                f"height tetap {val}px dapat memotong konten"))
                if RE_VW_FONT.search(line) and "clamp(" not in line and "min(" not in line and "max(" not in line:
                    findings.append(Finding("vw-font-no-clamp", "medium", rel, i, snippet_of(line),
                                            "font-size berbasis vw tanpa clamp()"))
                if RE_ZOOM.search(line):
                    findings.append(Finding("page-zoom-or-scale", "medium", rel, i, snippet_of(line),
                                            "Properti zoom terdeteksi"))
                if RE_OVERFLOWX.search(line):
                    findings.append(Finding("overflow-x-hidden", "info", rel, i, snippet_of(line),
                                            "overflow hidden; periksa apakah menutupi gejala"))
                if RE_SMALL_FONT.search(line):
                    findings.append(Finding("small-font", "low", rel, i, snippet_of(line),
                                            "font-size di bawah 12px"))
                if RE_100VH.search(line):
                    ctx["vh_lines"].append((rel, i, snippet_of(line)))
                if re.search(r"(?<![-\w])(?:min-)?width\s*:\s*100vw\b|(?<![-\w])(?:left|right)\s*:\s*[^;]*100vw", line, re.I):
                    findings.append(Finding("100vw", "medium", rel, i, snippet_of(line),
                                            "100vw memicu overflow bila ada scrollbar vertikal"))
            else:
                for m in RE_MEDIA_PX.finditer(line):
                    raw_v = m.group(1)
                    if m.group(2).lower() == "px" and raw_v.split(".")[0] in DEVICE_BP:
                        findings.append(Finding("device-specific-breakpoint", "low", rel, i, snippet_of(line),
                                                f"breakpoint {raw_v}px menyerupai ukuran device tertentu"))

        # Tailwind / utility classes dan inline style (markup + script)
        if is_markup or is_script:
            for m in RE_TW_ARB_W.finditer(line):
                val = int(m.group(1))
                if val >= 481:
                    findings.append(Finding("tailwind-arbitrary-width", "medium", rel, i, snippet_of(line),
                                            f"kelas lebar piksel tetap {val}px"))
            if RE_TW_H_SCREEN.search(line):
                findings.append(Finding("tailwind-h-screen", "low", rel, i, snippet_of(line),
                                        "h-screen = 100vh; di HP bisa terpotong"))
            if RE_TW_GRID.search(line) and not RE_TW_GRID_RESP.search(line):
                findings.append(Finding("tailwind-unprefixed-grid", "low", rel, i, snippet_of(line),
                                        "grid-cols-N (>=3) tanpa varian responsif"))
            if "style" in line.lower() or "sx=" in line or "css`" in line or "styled" in line:
                mm = RE_STYLE_ATTR_W.search(line) or RE_INLINE_W.search(line)
                if mm:
                    val = int(mm.group(1))
                    if val >= 481 and ("style" in line.lower() or "sx=" in line):
                        findings.append(Finding("inline-style-width", "medium", rel, i, snippet_of(line),
                                                f"lebar inline {val}px"))
            if is_markup:
                mi = RE_IMG_W_ATTR.search(line)
                if mi and int(mi.group(1)) >= 481:
                    ctx["img_fixed_attrs"].append((rel, i, snippet_of(line)))
                if re.search(r"<table\b", line, re.I):
                    ctx["tables"].append((rel, i, snippet_of(line)))

    # root font px (multi-baris)
    if is_style or is_markup:
        for m in RE_ROOT_FONT_PX.finditer(clean):
            size = float(m.group(1))
            if size < 16 or size > 18:
                ln = clean[: m.start()].count("\n") + 1
                findings.append(Finding("root-font-px", "low", rel, ln, snippet_of(m.group(0).strip().replace("\n", " ")),
                                        f"font-size root {size:g}px"))


def finalize(ctx: dict, findings: list, scanned_any: bool):
    # 100vh: naikkan ke medium hanya bila proyek tidak memakai dvh/svh sama sekali
    for rel, ln, snip in ctx["vh_lines"]:
        sev = "low" if ctx["has_dvh"] else "medium"
        findings.append(Finding("100vh", sev, rel, ln, snip,
                                "100vh pada layar HP termasuk area bar alamat" +
                                (" (proyek sudah memakai dvh/svh di tempat lain)" if ctx["has_dvh"] else "")))

    for rel, ln, snip in ctx["tables"]:
        # dianggap berpembungkus jika beberapa baris sebelumnya ada overflow / table-responsive / scroll
        try:
            lines = Path(rel).read_text(encoding="utf-8", errors="ignore").splitlines()
        except OSError:
            continue
        window = "\n".join(lines[max(0, ln - 4): ln]).lower()
        if not re.search(r"overflow|table-responsive|table-scroll|scroll|overflow-x-auto|responsive", window):
            findings.append(Finding("table-no-wrapper", "low", rel, ln, snip,
                                    "<table> tanpa pembungkus scroll terlihat di dekatnya"))

    css_all = "\n".join(ctx["css_text_parts"])
    css_no_media = re.sub(r"@media[^{]*\{", "{", css_all)  # max-width di dalam @media bukan batas container
    has_css = ctx["files_scanned_css"] > 0

    if ctx["img_fixed_attrs"] and not ctx["img_maxw"]:
        for rel, ln, snip in ctx["img_fixed_attrs"][:20]:
            findings.append(Finding("img-fixed-width-attr", "medium", rel, ln, snip,
                                    "gambar dengan atribut width besar dan tidak ada img{max-width:100%} di proyek"))

    if has_css:
        vals = ctx["media_values"]
        if ctx["media_count"] == 0 and not ctx["tailwind"]:
            findings.append(Finding("no-media-queries", "medium", "(proyek)", 0, "",
                                    "Tidak ada @media di CSS yang dipindai"))
        if ctx["media_max"] > 0 and ctx["media_min"] == 0:
            findings.append(Finding("desktop-first-only", "low", "(proyek)", 0,
                                    f"{ctx['media_max']} query max-width, 0 query min-width",
                                    "Pendekatan desktop-first"))
        if vals:
            if not any(600 <= v <= 1100 for v in vals):
                findings.append(Finding("no-tablet-breakpoint", "medium", "(proyek)", 0,
                                        f"breakpoint ditemukan: {sorted(set(int(v) for v in vals))}",
                                        "Tidak ada breakpoint antara 600-1100px"))
            if not any(v >= 1600 for v in vals) and not _has_container_cap(css_no_media):
                findings.append(Finding("no-large-screen-handling", "medium", "(proyek)", 0,
                                        f"breakpoint terbesar: {int(max(vals))}px",
                                        "Tidak ada breakpoint >=1600px dan tidak terdeteksi max-width container"))
        elif has_css and not ctx["tailwind"] and not _has_container_cap(css_no_media):
            findings.append(Finding("no-large-screen-handling", "medium", "(proyek)", 0, "",
                                    "Tidak ada breakpoint/max-width container yang terdeteksi untuk layar besar"))
        if not ctx["box_sizing"] and not ctx["tailwind"]:
            findings.append(Finding("no-box-sizing", "low", "(proyek)", 0, "", "box-sizing: border-box tidak ditemukan"))
        if not ctx["img_maxw"] and not ctx["tailwind"]:
            findings.append(Finding("no-img-max-width", "low", "(proyek)", 0, "", "img{max-width:100%} tidak ditemukan"))
        if ctx["hover_count"] >= 3 and not ctx["hover_guard"]:
            findings.append(Finding("hover-only", "low", "(proyek)", 0, f"{ctx['hover_count']} aturan :hover",
                                    "Tidak ada @media (hover: hover)"))


def _has_container_cap(css: str) -> bool:
    return bool(re.search(r"max-width\s*:\s*(?:\d{3,4}px|\d+(?:\.\d+)?(?:rem|em|ch)|min\()", css, re.I) or
                re.search(r"width\s*:\s*min\(", css, re.I) or "max-w-" in css or "container" in css.lower())


def run(paths, max_per_rule: int):
    ctx = {
        "full_documents": 0, "css_text_parts": [], "media_values": [], "media_count": 0,
        "media_max": 0, "media_min": 0, "hover_count": 0, "hover_guard": False,
        "box_sizing": False, "img_maxw": False, "has_dvh": False, "tailwind": False,
        "vh_lines": [], "tables": [], "img_fixed_attrs": [], "files_scanned_css": 0,
    }
    findings: list[Finding] = []
    scanned = 0
    for f in iter_files(paths):
        ext = suffix_of(f)
        if ext not in ALL_EXT or f.name.lower().endswith(MIN_FILE_SKIP_SUFFIX):
            continue
        text = read_text(f)
        if text is None:
            continue
        scanned += 1
        scan_file(f, text, ext, ctx, findings)
    finalize(ctx, findings, scanned > 0)
    return findings, scanned


def group_and_limit(findings, max_per_rule):
    by_rule = defaultdict(list)
    for f in findings:
        by_rule[f.rule].append(f)
    out = []
    for rule, items in by_rule.items():
        items.sort(key=lambda x: (x.file, x.line))
        out.append((rule, items, max(0, len(items) - max_per_rule)))
    out.sort(key=lambda t: (min(SEVERITY_ORDER[i.severity] for i in t[1]), -len(t[1]), t[0]))
    return out


def print_report(findings, scanned, max_per_rule):
    print("# Laporan audit responsif\n")
    print(f"File dipindai: {scanned}  |  Temuan: {len(findings)}")
    counts = defaultdict(int)
    for f in findings:
        counts[f.severity] += 1
    print("Ringkasan: " + ", ".join(f"{k}={counts[k]}" for k in ("high", "medium", "low", "info")) + "\n")
    if not findings:
        print("Tidak ada pola bermasalah yang terdeteksi secara statis. Ini BUKAN bukti responsif; "
              "verifikasi di browser (scripts/screenshot_matrix.py).")
        return
    for rule, items, hidden in group_and_limit(findings, max_per_rule):
        sev = min((i.severity for i in items), key=lambda s: SEVERITY_ORDER[s])
        print(f"## [{sev.upper()}] {rule}  ({len(items)} temuan)")
        advice = TEXT_ADVICE.get(rule)
        if advice:
            print(f"Saran: {advice}")
        for it in items[:max_per_rule]:
            loc = f"{it.file}:{it.line}" if it.line else it.file
            print(f"- {loc}  {it.message}")
            if it.snippet:
                print(f"    {it.snippet}")
        if hidden:
            print(f"- ... dan {hidden} lagi (naikkan --max-per-rule untuk melihat semua)")
        print()
    print("Catatan: pemindai ini heuristik (regex). Verifikasi tiap temuan dengan membaca konteksnya, "
          "lalu uji di berbagai ukuran layar.")


def main(argv=None):
    ap = argparse.ArgumentParser(description="Audit statis masalah responsif.")
    ap.add_argument("paths", nargs="+", help="folder atau file untuk dipindai")
    ap.add_argument("--json", action="store_true", help="keluarkan JSON, bukan teks")
    ap.add_argument("--max-per-rule", type=int, default=8, help="maksimum contoh per aturan di laporan teks")
    ap.add_argument("--fail-on", choices=["high", "medium", "low"], default=None,
                    help="exit code 1 jika ada temuan pada tingkat ini atau lebih tinggi")
    args = ap.parse_args(argv)

    findings, scanned = run(args.paths, args.max_per_rule)
    if scanned == 0:
        print("Tidak ada file yang bisa dipindai (ekstensi didukung: html, css, scss, jsx, tsx, vue, svelte, php, dll.).",
              file=sys.stderr)
    if args.json:
        payload = {"scanned_files": scanned, "count": len(findings),
                   "findings": [f.to_dict() for f in sorted(findings, key=lambda x: (SEVERITY_ORDER[x.severity], x.file, x.line))]}
        print(json.dumps(payload, ensure_ascii=False, indent=2))
    else:
        print_report(findings, scanned, args.max_per_rule)

    if args.fail_on:
        limit = SEVERITY_ORDER[args.fail_on]
        if any(SEVERITY_ORDER[f.severity] <= limit for f in findings):
            return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
