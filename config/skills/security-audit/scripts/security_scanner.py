#!/usr/bin/env python3
"""
security_scanner.py: Deterministic Static Application Security Testing (SAST) Scanner
Audits source code for hardcoded secrets, SQL injection formatting, command injection sinks,
and unsafe DOM rendering patterns.
"""

import sys
import os
import re
import argparse
from pathlib import Path
from dataclasses import dataclass
from typing import List

@dataclass
class Vulnerability:
    severity: str
    rule_id: str
    file_path: str
    line_number: int
    snippet: str
    message: str

# Deterministic SAST Rule Set
SECURITY_RULES = [
    # 1. Hardcoded Secrets
    (
        r"(?i)\b(?:aws_access_key_id|aws_secret_access_key|api_key|apikey|private_key|secret_key|jwt_secret)\s*=\s*[\"'][A-Za-z0-9_\-\.]{12,}[\"']",
        "CRITICAL",
        "SEC-SECRET-001",
        "Hardcoded API key, private key, or credential assignment detected."
    ),
    (
        r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----",
        "CRITICAL",
        "SEC-SECRET-002",
        "Unencrypted Private Key block embedded in source code."
    ),
    # 2. SQL Injection string formatting
    (
        r"(?i)(?:execute|query|raw)\s*\(\s*f[\"'].*?\b(?:SELECT|INSERT|UPDATE|DELETE)\b.*?\{",
        "HIGH",
        "SEC-SQLI-001",
        "SQL query constructed using Python f-string interpolation. Vulnerable to SQL injection."
    ),
    (
        r"(?i)(?:execute|query|raw)\s*\(\s*[\"'].*?\b(?:SELECT|INSERT|UPDATE|DELETE)\b.*?[\"']\s*\+",
        "HIGH",
        "SEC-SQLI-002",
        "SQL query constructed via string concatenation (+). Use parameterized queries."
    ),
    # 3. Command Injection Sinks
    (
        r"\bos\.system\s*\(",
        "HIGH",
        "SEC-CMD-001",
        "Direct system shell invocation. Vulnerable to command injection if unquoted."
    ),
    (
        r"\bsubprocess\.(?:call|run|Popen)\s*\(.*?\bshell\s*=\s*True\b",
        "HIGH",
        "SEC-CMD-002",
        "Subprocess execution with shell=True detected. Pass argument list with shell=False."
    ),
    (
        r"\b(?:eval|exec)\s*\(",
        "HIGH",
        "SEC-EXEC-001",
        "Dynamic code evaluation via interpreter call."
    ),
    # 4. Unsafe DOM rendering
    (
        r"dangerouslySetInnerHTML\s*=",
        "MEDIUM",
        "SEC-XSS-001",
        "dangerouslySetInnerHTML detected. Ensure input is sanitized with DOMPurify."
    ),
    (
        r"\bv-html\s*=",
        "MEDIUM",
        "SEC-XSS-002",
        "v-html directive detected. Potential Cross-Site Scripting (XSS) sink."
    ),
]

IGNORE_DIRS = {".git", "node_modules", "vendor", "dist", "build", ".venv", "venv", "__pycache__"}

def scan_file(file_path: Path) -> List[Vulnerability]:
    findings = []
    try:
        content = file_path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return findings

    for line_idx, line in enumerate(content.splitlines(), start=1):
        line_clean = line.strip()
        if not line_clean or line_clean.startswith("//") or line_clean.startswith("#"):
            continue

        for pattern, severity, rule_id, message in SECURITY_RULES:
            if re.search(pattern, line):
                findings.append(Vulnerability(
                    severity=severity,
                    rule_id=rule_id,
                    file_path=str(file_path),
                    line_number=line_idx,
                    snippet=line_clean[:120],
                    message=message
                ))
    return findings

def scan_directory(target_dir: Path, extensions: List[str]) -> List[Vulnerability]:
    all_findings = []
    for ext in extensions:
        for file_path in target_dir.rglob(f"*.{ext}"):
            if any(part in IGNORE_DIRS or part.startswith(".") for part in file_path.parts):
                continue
            all_findings.extend(scan_file(file_path))
    return all_findings

def main():
    parser = argparse.ArgumentParser(description="Deterministic SAST Security Scanner")
    parser.add_argument("path", default=".", nargs="?", help="Directory or file to scan")
    parser.add_argument("--ext", default="py,ts,js,jsx,tsx,go,java,php", help="Comma-separated file extensions")
    parser.add_argument("--fail-on", choices=["CRITICAL", "HIGH", "MEDIUM", "LOW"], default="HIGH", help="Severity threshold to return non-zero exit code")

    args = parser.parse_args()
    target_path = Path(args.path)
    extensions = [e.strip() for e in args.ext.split(",") if e.strip()]

    if not target_path.exists():
        print(f"Error: Path does not exist: {target_path}")
        sys.exit(1)

    findings = scan_file(target_path) if target_path.is_file() else scan_directory(target_path, extensions)

    severity_counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
    for f in findings:
        if f.severity in severity_counts:
            severity_counts[f.severity] += 1

    print(f"\n=== SAST Security Scan Report for: {target_path} ===")
    print(f"Total findings: {len(findings)} (CRITICAL: {severity_counts['CRITICAL']}, HIGH: {severity_counts['HIGH']}, MEDIUM: {severity_counts['MEDIUM']})\n")

    for f in findings:
        print(f"[{f.severity}] {f.rule_id} at {f.file_path}:{f.line_number}")
        print(f"  Message: {f.message}")
        print(f"  Snippet: {f.snippet}\n")

    thresholds = {"CRITICAL": 1, "HIGH": 2, "MEDIUM": 3, "LOW": 4}
    threshold_val = thresholds.get(args.fail_on, 2)

    has_blocking_violations = False
    for sev, count in severity_counts.items():
        if count > 0 and thresholds.get(sev, 4) <= threshold_val:
            has_blocking_violations = True
            break

    if has_blocking_violations:
        print("[RESULT: FAILED] Blocking vulnerabilities detected.")
        sys.exit(1)
    else:
        print("[RESULT: PASSED] Codebase cleared security gates.")
        sys.exit(0)

if __name__ == "__main__":
    main()
