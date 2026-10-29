#!/usr/bin/env python3
"""
secret_scrubber.py: Deterministic Secret, Token, and Cookie Redactor for Playwright Traces & Storage States
Neutralizes authorization headers, JWTs, sensitive cookies, and passwords before public upload.
"""

import sys
import re
import json
import argparse
from pathlib import Path
from typing import Any, Tuple

# Patterns identifying sensitive dictionary keys
SENSITIVE_KEYS = [
    r"(?i)token",
    r"(?i)auth",
    r"(?i)bearer",
    r"(?i)secret",
    r"(?i)password",
    r"(?i)session",
    r"(?i)cookie",
    r"(?i)apikey",
    r"(?i)api_key",
    r"(?i)access_token",
    r"(?i)refresh_token"
]

JWT_REGEX = re.compile(r"eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}")
BEARER_REGEX = re.compile(r"(?i)\bBearer\s+[A-Za-z0-9_\-\.]{15,}")

def scrub_data(obj: Any) -> Tuple[Any, int]:
    """Recursively traverses JSON-compatible objects and redacts sensitive data."""
    redacted_count = 0

    if isinstance(obj, dict):
        new_dict = {}
        # Special case: Cookie object format in Playwright storageState ({name: 'session_id', value: 'xyz'})
        is_cookie_like = "name" in obj and "value" in obj
        cookie_is_sensitive = False
        if is_cookie_like:
            cookie_is_sensitive = any(re.search(pattern, str(obj["name"])) for pattern in SENSITIVE_KEYS)

        for k, v in obj.items():
            if is_cookie_like and k == "value" and cookie_is_sensitive:
                new_dict[k] = "[REDACTED]"
                redacted_count += 1
                continue

            is_sensitive_key = any(re.search(pattern, str(k)) for pattern in SENSITIVE_KEYS)
            if is_sensitive_key and isinstance(v, (str, int, float)):
                new_dict[k] = "[REDACTED]"
                redacted_count += 1
            else:
                scrubbed_val, count = scrub_data(v)
                new_dict[k] = scrubbed_val
                redacted_count += count
        return new_dict, redacted_count

    elif isinstance(obj, list):
        new_list = []
        for item in obj:
            scrubbed_item, count = scrub_data(item)
            new_list.append(scrubbed_item)
            redacted_count += count
        return new_list, redacted_count

    elif isinstance(obj, str):
        subbed, count1 = JWT_REGEX.subn("[REDACTED_JWT]", obj)
        subbed, count2 = BEARER_REGEX.subn("Bearer [REDACTED_TOKEN]", subbed)
        return subbed, (count1 + count2)

    return obj, 0

def main():
    parser = argparse.ArgumentParser(description="Deterministic Secret Scrubber for Playwright Artifacts")
    parser.add_argument("file", help="Path to JSON file (storageState, har, or trace JSON)")
    parser.add_argument("--out", default="", help="Path for output (overwrites input if omitted)")

    args = parser.parse_args()
    input_path = Path(args.file)

    if not input_path.exists():
        print(f"Error: File not found: {input_path}")
        sys.exit(1)

    try:
        with open(input_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"Failed to read/parse JSON: {e}")
        sys.exit(1)

    clean_data, redractions = scrub_data(data)
    out_path = Path(args.out) if args.out else input_path

    try:
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(clean_data, f, indent=2)
    except Exception as e:
        print(f"Failed to write output: {e}")
        sys.exit(1)

    print(f"Scrubbed {input_path} -> {out_path} ({redractions} sensitive value(s) redacted).")

if __name__ == "__main__":
    main()
