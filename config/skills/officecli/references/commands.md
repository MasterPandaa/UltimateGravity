# OfficeCLI Detailed Reference & Architecture

## Overview
`OfficeCLI` is a standalone cross-platform C#/.NET binary distributed via GitHub Releases and npm (`@officecli/officecli`). It bypasses the need for Microsoft Office installation, COM interop, or unzipping OpenXML packages directly.

## Supported Formats
- **DOCX**: Paragraphs, runs, tables, headers, footers, inline shapes, styles.
- **XLSX**: Sheets, cells, formula engine (350+ Excel functions), styles, conditional formatting, rows/columns insertion.
- **PPTX**: Slides, shapes, text frames, notes, visual rendering to image (PNG/JPEG) or HTML.

## CLI Command Flags
- `--json`: Forces structured output in JSON format. Crucial for AI agent automated parsing.
- `--path <xpath-like-selector>`: Targets specific nodes in document trees (e.g. `/slide[1]/shape[2]`, `/body/table[1]/row[2]/cell[1]`).
- `--output <path>`: Destination path for mutations or rendered images.
- `--sheet <name>`: Target worksheet in Excel workbooks.
- `--range <A1:Bn>`: Bounding cell range for read/write operations.

## Security & Isolation
- Operates strictly locally as an ephemeral process.
- No network telemetry or external server connections required for document processing.
- Zero resident memory overhead when not actively running.
