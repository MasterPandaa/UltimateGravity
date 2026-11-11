# Threat Intelligence Sources & Live Advisory Feeds

Static lists of vulnerabilities become obsolete rapidly. This guide provides primary threat intelligence repositories, APIs, and query procedures to maintain fresh security telemetry during audits.

---

## 1. Primary Vulnerability Databases

1. **CISA Known Exploited Vulnerabilities (KEV) Catalog**:
   - URL: `https://www.cisa.gov/known-exploited-vulnerabilities-catalog`
   - JSON Feed: `https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json`
   - Standard: Represents zero-days and vulnerabilities actively leveraged in real-world attacks. Run `scripts/Get-KevMatches.ps1` to correlate installed Windows software automatically against this feed.
2. **Microsoft Security Response Center (MSRC)**:
   - URL: `https://msrc.microsoft.com/update-guide`
   - Standard: Primary source for monthly Patch Tuesday advisories, Windows OS zero-days, and security updates for Microsoft Edge, Defender, and kernel components.
3. **National Vulnerability Database (NVD / NIST)**:
   - URL: `https://nvd.nist.gov/`
   - Standard: Definitive CVSS v3.1 / v4 scoring and CWE taxonomic classifications.
4. **GitHub Security Advisories (GHSA)**:
   - URL: `https://github.com/advisories`
   - Standard: Real-time supply-chain intelligence across npm, PyPI, Go, Composer, and NuGet packages.
5. **Google Chrome Releases Blog**:
   - URL: `https://chromereleases.googleblog.com/search/label/Stable%20updates`
   - Standard: Tracks zero-day in-the-wild exploitation of Chromium V8 and WebRTC engines.

---

## 2. Fresh Intel Query Procedure (Phase 1 Audit Gate)

Before finalizing any audit report, execute live web searches using current year and month parameters:
- `"<Current Month> <Current Year> Patch Tuesday exploited zero-day Windows"`
- `"CISA KEV added <Current Month> <Current Year>"`
- `"Google Chrome stable update CVE zero-day in the wild <Current Month> <Current Year>"`
- `"<Installed Language / Framework> security advisory <Current Year>"`
