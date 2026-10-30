<#
.SYNOPSIS
  Universal AI Watermark & Metadata Sanitizer for Documents, Images, and Text.
.DESCRIPTION
  Cleans invisible Unicode, C2PA manifests, EXIF/XMP tags, and AI provenance metadata
  from PDF, DOCX, SVG, PNG, WebP, Markdown, and HTML files.
.EXAMPLE
  .\clean-file.ps1 "report.pdf" --in-place
  .\clean-file.ps1 "diagram.svg"
#>
param(
  [Parameter(Mandatory=$true, Position=0)]
  [string]$Path,
  [switch]$InPlace,
  [switch]$Json
)

$scriptPath = "C:\Users\Luthfi\.gemini\tools\watermarks-remover\service\scripts\clean_file.py"

if (-not (Test-Path $Path)) {
  Write-Error "File target tidak ditemukan: $Path"
  exit 1
}

$pyArgs = @($scriptPath, $Path)
if ($InPlace) { $pyArgs += "--in-place" }
if ($Json) { $pyArgs += "--json" }

python $pyArgs
