#!/usr/bin/env python3
"""
schema_validator.py: Deterministic Data Schema, Null Anomaly & Destructive Query Validator
"""

import sys
import re
import json
import csv
import argparse
from pathlib import Path
from typing import Dict, List, Any, Tuple

# Patterns that indicate unconstrained destructive operations
DESTRUCTIVE_SQL_PATTERNS = [
    (r"(?i)\bDROP\s+(?:TABLE|DATABASE|SCHEMA|VIEW)\b", "CRITICAL: DROP statement detected"),
    (r"(?i)\bTRUNCATE\s+TABLE\b", "CRITICAL: TRUNCATE statement detected"),
    (r"(?i)\bDELETE\s+FROM\s+([A-Za-z0-9_]+)\s*(?:;|\Z)", "CRITICAL: DELETE without WHERE clause detected"),
    (r"(?i)\bUPDATE\s+([A-Za-z0-9_]+)\s+SET\s+[^;]+(?:\s+WHERE\s+1\s*=\s*1\s*(?:;|\Z)|;|\Z)", "CRITICAL: Unconstrained UPDATE detected"),
]

def check_query_safety(query: str) -> List[str]:
    """Inspects a query string for destructive or unsafe operations."""
    violations = []
    clean_query = query.strip()
    for pattern, message in DESTRUCTIVE_SQL_PATTERNS:
        if re.search(pattern, clean_query):
            violations.append(message)
    return violations

def validate_json_records(data: List[Dict[str, Any]], required_fields: List[str]) -> Tuple[int, List[str]]:
    """Validates records against required keys and profiles null anomalies."""
    issues = []
    total_records = len(data)
    if total_records == 0:
        return 0, ["Dataset is empty"]

    field_null_counts = {field: 0 for field in required_fields}
    
    for idx, row in enumerate(data):
        for field in required_fields:
            if field not in row or row[field] is None or row[field] == "":
                field_null_counts[field] += 1
                if len(issues) < 10:  # Cap detailed output
                    issues.append(f"Row {idx}: Missing or null required field '{field}'")

    for field, null_count in field_null_counts.items():
        if null_count > 0:
            null_pct = (null_count / total_records) * 100
            if null_pct > 20:
                issues.append(f"WARNING: High null anomaly in field '{field}': {null_pct:.1f}% ({null_count}/{total_records})")

    return total_records, issues

def main():
    parser = argparse.ArgumentParser(description="Deterministic Data & Query Safety Validator")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Check query
    query_parser = subparsers.add_parser("check-query", help="Check SQL query for destructive patterns")
    query_parser.add_argument("query", help="Raw SQL string to evaluate")

    # Validate file
    val_parser = subparsers.add_parser("validate-json", help="Validate JSON dataset")
    val_parser.add_argument("file", help="Path to JSON file (array of objects)")
    val_parser.add_argument("--required", required=True, help="Comma-separated required field names")

    args = parser.parse_args()

    if args.command == "check-query":
        violations = check_query_safety(args.query)
        if violations:
            print("[QUERY SAFETY VIOLATION DETECTED]")
            for v in violations:
                print(f"  - {v}")
            sys.exit(1)
        else:
            print("Query passed safety gate: No unconstrained destructive operations.")
            sys.exit(0)

    elif args.command == "validate-json":
        file_path = Path(args.file)
        if not file_path.exists():
            print(f"File not found: {file_path}")
            sys.exit(1)
        
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            if not isinstance(data, list):
                print("Error: JSON root must be an array of objects.")
                sys.exit(1)
        except Exception as e:
            print(f"Invalid JSON format: {e}")
            sys.exit(1)

        required = [r.strip() for r in args.required.split(",") if r.strip()]
        total, issues = validate_json_records(data, required)
        print(f"Analyzed {total} record(s). Found {len(issues)} issue(s).")
        for issue in issues[:10]:
            print(f"  - {issue}")
        
        if any("CRITICAL" in i or "Missing" in i for i in issues):
            sys.exit(1)
        sys.exit(0)

if __name__ == "__main__":
    main()
