#!/usr/bin/env python3
"""Static analyzer for responsive layout issues (zero external dependencies, standard library only).

Scans HTML/CSS/SCSS/JSX/TSX/Vue/Svelte/Astro/PHP/Blade/etc. and detects patterns that
frequently cause non-responsive UI defects. Results are diagnostic HINTS, not verdicts:
verify each finding within its surrounding source context.

Examples:
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
    "no-viewport-meta": "Add <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"> inside <head>.",
    "viewport-fixed-width": "Replace fixed pixel width with width=device-width, initial-scale=1.",
    "viewport-blocks-zoom": "Remove user-scalable=no / maximum-scale=1; blocks accessibility zooming without fixing responsive layout.",
    "fixed-width-px": "Replace with width: 100% + max-width, or min(100%, Nrem), or fluid grid/flexbox.",
    "fixed-min-width-px": "Large min-width forces overflow on mobile; use min(100%, N) or wrap in a scroll container.",
    "fixed-height-px": "Use min-height / padding / aspect-ratio to prevent content clipping.",
    "100vh": "Use min-height: 100dvh with 100vh fallback (mobile address bar resize affects vh).",
    "100vw": "100vw includes scrollbar width triggering horizontal overflow; use 100% or inset: 0.",
    "vw-font-no-clamp": "Wrap in clamp(min, calc(rem + vw), max) to preserve user zoom and prevent ballooning on large displays.",
    "root-font-px": "Leave root at 100% or use rem/clamp; rigid root px inhibits user browser accessibility preferences.",
    "page-zoom-or-scale": "Avoid global zoom/scale hacks; fix relative units and fluid layout primitives.",
    "overflow-x-hidden": "Often masks root causes; locate offending overflowing elements (see references/diagnosis-checklist.md #8).",
    "small-font": "Text <12px is illegible on mobile; increase size unless legal fine print or micro-captions.",
    "device-specific-breakpoint": "Device-specific breakpoints rot quickly; derive breakpoints from content breakdown points, not device model names.",
    "tailwind-arbitrary-width": "Replace w-[NNNpx] with w-full max-w-* or responsive utility variants (sm:/md:/lg:).",
    "tailwind-h-screen": "Replace h-screen with min-h-dvh (Tailwind 3.4+) or min-h-[100dvh].",
    "tailwind-unprefixed-grid": "Unprefixed grid-cols-N applies to mobile viewports; start mobile-first with grid-cols-1 then sm:/md:grid-cols-N.",
    "inline-style-width": "Rigid pixel width in inline styles or JS; use relative percentages or responsive CSS classes.",
    "table-no-wrapper": "Wrap <table> in overflow-x: auto container or collapse into cards on narrow screens.",
    "img-fixed-width-attr": "Large width attribute without CSS max-width: 100%; ensure img { max-width: 100%; height: auto } is defined.",
    "no-media-queries": "No @media queries found; verify if layout is purely intrinsic fluid or add structural breakpoints.",
    "desktop-first-only": "Only max-width media queries detected; consider mobile-first architecture using min-width.",
    "no-tablet-breakpoint": "No breakpoints found between 600-1100px; verify tablet portrait/landscape layouts.",
    "no-large-screen-handling": "No handling for >=1600px screens; inspect container max-width and TV/4K/ultrawide scaling.",
    "no-box-sizing": "Add *, *::before, *::after { box-sizing: border-box } so padding does not inflate box dimensions.",
    "no-img-max-width": "Missing img { max-width: 100% }; unconstrained images will overflow containers.",
    "hover-only": ":hover present without @media (hover: hover); ensure touch interfaces can access interactive features.",
    "no-dvh-with-vh": "No dvh/svh dynamic viewport units found while 100vh is active.",
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
            print(f"[warning] path not found: {p}", file=sys.stderr)
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
                    if e.name in SKIP_DIRS or e.name.startswith("."):
                        continue
                    stack.append(e)
                elif e.is_file():
                    yield e


def suffix_of(p: Path) -> str:
    name = p.name.lower()
    if name.endswith(".blade.php"):
        return ".blade.php"
    return p.suffix.lower()


def read_text(p: Path) -> str | None:
    try:
        if p.stat().st_size > MAX_FILE_BYTES:
            return None
        return p.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return None


def strip_css_comments(text: str) -> str:
    return re.sub(r"/\*.*?\*/", "", text, flags=re.S)


def snippet_of(line: str, maxlen: int = 120) -> str:
    s = re.sub(r"\s+", " ", line).strip()
    return (s[: maxlen - 3] + "...") if len(s) > maxlen else s


RE_WIDTH_PX = re.compile(r"(?<![-\w])(?<!min-)(?<!max-)(width|inline-size)\s*:\s*(\d+)(?:\.\d+)?px\b", re.I)
RE_MINWIDTH_PX = re.compile(r"(?<![-\w])(min-width|min-inline-size)\s*:\s*(\d+)(?:\.\d+)?px\b", re.I)
RE_HEIGHT_PX = re.compile(r"(?<![-\w])(?<!min-)(?<!max-)(height|block-size)\s*:\s*(\d+)(?:\.\d+)?px\b", re.I)
RE_100VH = re.compile(r"(?<![-\w])(height|min-height)\s*:\s*100vh\b", re.I)
RE_VW_FONT = re.compile(r"font-size\s*:\s*[^;}]*?\d+(?:\.\d+)?vw\b", re.I)
RE_ZOOM = re.compile(r"(?<![-\w])zoom\s*:\s*[^;}\s]+", re.I)
RE_OVERFLOWX = re.compile(r"overflow-x\s*:\s*hidden\b", re.I)
RE_SMALL_FONT = re.compile(r"font-size\s*:\s*([1-9]|1[01])(?:\.\d+)?px\b", re.I)
RE_MEDIA_PX = re.compile(r"@media[^{]*\(\s*(?:min-|max-)?(?:width|inline-size)\s*:\s*(\d+(?:\.\d+)?)(px|em|rem)\b", re.I)
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

    # --- viewport meta (full document files only) ---
    if is_markup and re.search(r"<head[\s>]", text, re.I) and re.search(r"<html[\s>]|<!doctype", text, re.I):
        ctx["full_documents"] += 1
        vp = RE_VIEWPORT.search(text) or RE_VIEWPORT_ALT.search(text)
        if not vp:
            findings.append(Finding("no-viewport-meta", "high", rel, 1, "<head> without <meta name=viewport>",
                                    "Document is missing viewport meta tag"))
        else:
            tag = vp.group(0)
            line_no = text[: vp.start()].count("\n") + 1
            if re.search(r"width\s*=\s*\d+", tag) and "device-width" not in tag:
                findings.append(Finding("viewport-fixed-width", "high", rel, line_no, snippet_of(tag),
                                        "Viewport declares fixed pixel width"))
            if re.search(r"user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\.0)?\b", tag, re.I):
                findings.append(Finding("viewport-blocks-zoom", "medium", rel, line_no, snippet_of(tag),
                                        "Viewport blocks user zoom"))
            if "initial-scale" not in tag:
                findings.append(Finding("viewport-fixed-width", "low", rel, line_no, snippet_of(tag),
                                        "Viewport without initial-scale=1"))

    if RE_TAILWIND_MARK.search(text[:3000]) or "tailwind" in path.name.lower():
        ctx["tailwind"] = True

    # --- project context ---
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

    # --- line by line rules ---
    for i, raw in enumerate(lines, start=1):
        line = raw
        if len(line) > 600:
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
                                                f"fixed width {val}px (exceeds many mobile viewports)"))
                for m in RE_MINWIDTH_PX.finditer(line):
                    val = int(m.group(2))
                    if val >= 481:
                        findings.append(Finding("fixed-min-width-px", "medium", rel, i, snippet_of(line),
                                                f"min-width {val}px forces overflow on small screens"))
                for m in RE_HEIGHT_PX.finditer(line):
                    val = int(m.group(2))
                    if val >= 400:
                        findings.append(Finding("fixed-height-px", "low", rel, i, snippet_of(line),
                                                f"fixed height {val}px may clip dynamic content"))
                if RE_VW_FONT.search(line) and "clamp(" not in line and "min(" not in line and "max(" not in line:
                    findings.append(Finding("vw-font-no-clamp", "medium", rel, i, snippet_of(line),
                                            "vw-based font-size without clamp()"))
                if RE_ZOOM.search(line):
                    findings.append(Finding("page-zoom-or-scale", "medium", rel, i, snippet_of(line),
                                            "zoom property detected"))
                if RE_OVERFLOWX.search(line):
                    findings.append(Finding("overflow-x-hidden", "info", rel, i, snippet_of(line),
                                            "overflow-x: hidden; verify whether masking layout root cause"))
                if RE_SMALL_FONT.search(line):
                    findings.append(Finding("small-font", "low", rel, i, snippet_of(line),
                                            "font-size under 12px"))
                if RE_100VH.search(line):
                    ctx["vh_lines"].append((rel, i, snippet_of(line)))
                if re.search(r"(?<![-\w])(?:min-)?width\s*:\s*100vw\b|(?<![-\w])(?:left|right)\s*:\s*[^;]*100vw", line, re.I):
                    findings.append(Finding("100vw", "medium", rel, i, snippet_of(line),
                                            "100vw triggers overflow when vertical scrollbar is present"))
            else:
                for m in RE_MEDIA_PX.finditer(line):
                    raw_v = m.group(1)
                    if m.group(2).lower() == "px" and raw_v.split(".")[0] in DEVICE_BP:
                        findings.append(Finding("device-specific-breakpoint", "low", rel, i, snippet_of(line),
                                                f"breakpoint {raw_v}px resembles a specific device model"))

        # Tailwind / utility classes and inline styles (markup + script)
        if is_markup or is_script:
            for m in RE_TW_ARB_W.finditer(line):
                val = int(m.group(1))
                if val >= 481:
                    findings.append(Finding("tailwind-arbitrary-width", "medium", rel, i, snippet_of(line),
                                            f"fixed pixel width class {val}px"))
            if RE_TW_H_SCREEN.search(line):
                findings.append(Finding("tailwind-h-screen", "low", rel, i, snippet_of(line),
                                        "h-screen = 100vh; clips on mobile viewports with browser address bars"))
            if RE_TW_GRID.search(line) and not RE_TW_GRID_RESP.search(line):
                findings.append(Finding("tailwind-unprefixed-grid", "low", rel, i, snippet_of(line),
                                        "grid-cols-N (>=3) without responsive prefix"))
            if "style" in line.lower() or "sx=" in line or "css`" in line or "styled" in line:
                mm = RE_STYLE_ATTR_W.search(line) or RE_INLINE_W.search(line)
                if mm:
                    val = int(mm.group(1))
                    if val >= 481 and ("style" in line.lower() or "sx=" in line):
                        findings.append(Finding("inline-style-width", "medium", rel, i, snippet_of(line),
                                                f"inline width {val}px"))
            if is_markup:
                mi = RE_IMG_W_ATTR.search(line)
                if mi and int(mi.group(1)) >= 481:
                    ctx["img_fixed_attrs"].append((rel, i, snippet_of(line)))
                if re.search(r"<table\b", line, re.I):
                    ctx["tables"].append((rel, i, snippet_of(line)))

    # root font px (multiline)
    if is_style or is_markup:
        for m in RE_ROOT_FONT_PX.finditer(clean):
            size = float(m.group(1))
            if size < 16 or size > 18:
                ln = clean[: m.start()].count("\n") + 1
                findings.append(Finding("root-font-px", "low", rel, ln, snippet_of(m.group(0).strip().replace("\n", " ")),
                                        f"root font-size {size:g}px"))


def finalize(ctx: dict, findings: list, scanned_any: bool):
    for rel, ln, snip in ctx["vh_lines"]:
        sev = "low" if ctx["has_dvh"] else "medium"
        findings.append(Finding("100vh", sev, rel, ln, snip,
                                "100vh on mobile viewports includes address bar area" +
                                (" (project uses dvh/svh elsewhere)" if ctx["has_dvh"] else "")))

    for rel, ln, snip in ctx["tables"]:
        try:
            lines = Path(rel).read_text(encoding="utf-8", errors="ignore").splitlines()
        except OSError:
            continue
        window = "\n".join(lines[max(0, ln - 4): ln]).lower()
        if not re.search(r"overflow|table-responsive|table-scroll|scroll|overflow-x-auto|responsive", window):
            findings.append(Finding("table-no-wrapper", "low", rel, ln, snip,
                                    "<table> without visible scroll wrapper nearby"))

    css_all = "\n".join(ctx["css_text_parts"])
    css_no_media = re.sub(r"@media[^{]*\{", "{", css_all)
    has_css = ctx["files_scanned_css"] > 0

    if ctx["img_fixed_attrs"] and not ctx["img_maxw"]:
        for rel, ln, snip in ctx["img_fixed_attrs"][:20]:
            findings.append(Finding("img-fixed-width-attr", "medium", rel, ln, snip,
                                    "image with large width attribute without project-wide img{max-width:100%}"))

    if has_css:
        vals = ctx["media_values"]
        if ctx["media_count"] == 0 and not ctx["tailwind"]:
            findings.append(Finding("no-media-queries", "medium", "(project)", 0, "",
                                    "No @media queries found in scanned CSS"))
        if ctx["media_max"] > 0 and ctx["media_min"] == 0:
            findings.append(Finding("desktop-first-only", "low", "(project)", 0,
                                    f"{ctx['media_max']} max-width queries, 0 min-width queries",
                                    "Desktop-first approach"))
        if vals:
            if not any(600 <= v <= 1100 for v in vals):
                findings.append(Finding("no-tablet-breakpoint", "medium", "(project)", 0,
                                        f"breakpoints detected: {sorted(set(int(v) for v in vals))}",
                                        "No breakpoints found between 600-1100px"))
            if not any(v >= 1600 for v in vals) and not _has_container_cap(css_no_media):
                findings.append(Finding("no-large-screen-handling", "medium", "(project)", 0,
                                        f"largest breakpoint: {int(max(vals))}px",
                                        "No breakpoint >=1600px and no container max-width detected"))
        elif has_css and not ctx["tailwind"] and not _has_container_cap(css_no_media):
            findings.append(Finding("no-large-screen-handling", "medium", "(project)", 0, "",
                                    "No breakpoint or container max-width detected for large displays"))
        if not ctx["box_sizing"] and not ctx["tailwind"]:
            findings.append(Finding("no-box-sizing", "low", "(project)", 0, "", "box-sizing: border-box not found"))
        if not ctx["img_maxw"] and not ctx["tailwind"]:
            findings.append(Finding("no-img-max-width", "low", "(project)", 0, "", "img{max-width:100%} not found"))
        if ctx["hover_count"] >= 3 and not ctx["hover_guard"]:
            findings.append(Finding("hover-only", "low", "(project)", 0, f"{ctx['hover_count']} :hover rules",
                                    "Missing @media (hover: hover)"))


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
    print("# Responsive Audit Report\n")
    print(f"Scanned files: {scanned}  |  Findings: {len(findings)}")
    counts = defaultdict(int)
    for f in findings:
        counts[f.severity] += 1
    print("Summary: " + ", ".join(f"{k}={counts[k]}" for k in ("high", "medium", "low", "info")) + "\n")
    if not findings:
        print("No problematic patterns detected statically. This is NOT dynamic proof; "
              "verify in live browsers (scripts/screenshot_matrix.py).")
        return
    for rule, items, hidden in group_and_limit(findings, max_per_rule):
        sev = min((i.severity for i in items), key=lambda s: SEVERITY_ORDER[s])
        print(f"## [{sev.upper()}] {rule}  ({len(items)} findings)")
        advice = TEXT_ADVICE.get(rule)
        if advice:
            print(f"Advice: {advice}")
        for it in items[:max_per_rule]:
            loc = f"{it.file}:{it.line}" if it.line else it.file
            print(f"- {loc}  {it.message}")
            if it.snippet:
                print(f"    {it.snippet}")
        if hidden:
            print(f"- ... and {hidden} more (increase --max-per-rule to display all)")
        print()
    print("Note: This scanner is heuristic (regex). Inspect findings within surrounding code context, "
          "then verify on multiple viewports.")


def main(argv=None):
    ap = argparse.ArgumentParser(description="Static audit for responsive layout defects.")
    ap.add_argument("paths", nargs="+", help="directories or files to audit")
    ap.add_argument("--json", action="store_true", help="output JSON instead of human-readable text")
    ap.add_argument("--max-per-rule", type=int, default=8, help="maximum examples per rule in text report")
    ap.add_argument("--fail-on", choices=["high", "medium", "low"], default=None,
                    help="exit with code 1 if findings meet or exceed this severity")
    args = ap.parse_args(argv)

    findings, scanned = run(args.paths, args.max_per_rule)
    if scanned == 0:
        print("No scannable files found (supported extensions: html, css, scss, jsx, tsx, vue, svelte, php, etc.).",
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
