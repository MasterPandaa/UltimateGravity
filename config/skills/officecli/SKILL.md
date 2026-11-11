---
name: officecli
description: "[Autonomous Microsoft Office CLI Suite] Inspects, edits, extracts, calculates formulas, and renders .docx, .xlsx, and .pptx files via standalone binary with zero external Office dependencies."
---

# OfficeCLI — Autonomous Office Document Suite

Standalone CLI (`officecli`) enabling AI agents to read, query, edit, and render Microsoft Office files (`.docx`, `.xlsx`, `.pptx`) using path addressing and deterministic JSON without Office installations or COM automation.

---

## 1. On-Demand Installation & Health Check
Verify `officecli` on PATH before invoking. If not installed, install globally:
```powershell
if (-not (Get-Command officecli -ErrorAction SilentlyContinue)) {
    npm install -g @officecli/officecli
}
officecli --version
```

---

## 2. Core Operations & Path Addressing
Always append `--json` to retrieve structured machine-readable responses.

### A. Word Documents (`.docx`)
```bash
# Read structure or text by section/paragraph path
officecli docx read document.docx --path "/body/p[1]" --json
# Insert or replace text at target path
officecli docx edit document.docx --path "/body/p[1]" --value "New Content" --json
```

### B. Excel Spreadsheets (`.xlsx`)
```bash
# Inspect sheet names and cell ranges
officecli xlsx read sheet.xlsx --sheet "Sheet1" --range "A1:D10" --json
# Write values, evaluate formulas, or add rows
officecli xlsx write sheet.xlsx --sheet "Sheet1" --cell "B2" --value "=SUM(B3:B10)" --json
```

### C. PowerPoint Presentations (`.pptx`)
```bash
# Query shapes and slide layout
officecli pptx read deck.pptx --path "/slide[1]/shape[1]" --json
# Render slide to visual preview for layout/overflow inspection
officecli pptx render deck.pptx --slide 1 --output preview.png
```

---

## 3. Invariants & Output Contract
1. **Never parse raw OOXML**: Use path addressing (`/slide[n]/shape[k]`) rather than modifying unzipped XML.
2. **Deterministic Output**: Always pass `--json` to eliminate stdout parsing ambiguity.
3. **Visual Verification**: For layout-sensitive slides or reports, render output and verify layout integrity.
