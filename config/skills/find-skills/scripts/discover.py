#!/usr/bin/env python
import sys
import subprocess
import json
import re

def search_skills(query):
    print(f"[*] Searching open skills registry for: '{query}'...")
    try:
        cmd = ["npx", "--yes", "skills", "find", query]
        proc = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=20)
        lines = proc.stdout.splitlines()
        
        results = []
        current = None
        for line in lines:
            line_str = line.strip()
            if "@" in line_str and ("installs" in line_str or "install with" not in line_str.lower()):
                parts = line_str.split()
                slug = parts[0]
                installs = parts[1] if len(parts) > 1 and parts[1].isdigit() else "N/A"
                current = {"slug": slug, "installs": installs, "url": ""}
                results.append(current)
            elif line_str.startswith("└") and current:
                current["url"] = line_str.replace("└", "").strip()
        
        return results
    except Exception as e:
        print(f"[!] Error querying registry: {e}")
        return []

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python discover.py <keyword>")
        sys.exit(1)
    
    keyword = " ".join(sys.argv[1:])
    matches = search_skills(keyword)
    print(f"[+] Found {len(matches)} matching skills:")
    for i, m in enumerate(matches[:10], 1):
        print(f" {i:2d}. {m['slug']:<50} | Installs: {m['installs']:<5} | URL: {m['url']}")
