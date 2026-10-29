#!/usr/bin/env python3
"""
hitl_loop.py: Native Cross-Platform Human-In-The-Loop Execution Runner
Replaces bash-only scripts for running test loops and verifying assertions across Windows and Linux.
"""

import sys
import subprocess
import argparse
from pathlib import Path

def run_command(command: str) -> int:
    print(f"\n[HITL-LOOP] Executing: {command}")
    process = subprocess.run(command, shell=True)
    return process.returncode

def main():
    parser = argparse.ArgumentParser(description="Cross-Platform Human-in-the-Loop Test Loop Runner")
    parser.add_argument("command", help="Command to execute in loop (e.g. npx playwright test)")
    parser.add_argument("--max-retries", type=int, default=3, help="Max retry iterations on failure")

    args = parser.parse_args()

    for attempt in range(1, args.max_retries + 1):
        print(f"\n=== Attempt {attempt} of {args.max_retries} ===")
        code = run_command(args.command)
        if code == 0:
            print("\n[SUCCESS] Test command passed with exit code 0.")
            sys.exit(0)
        else:
            print(f"\n[FAILED] Attempt {attempt} failed with exit code {code}.")
            if attempt < args.max_retries:
                try:
                    response = input("Do you want to retry after code remediation? [Y/n]: ").strip().lower()
                    if response in ["n", "no"]:
                        print("User aborted retry loop.")
                        sys.exit(code)
                except EOFError:
                    pass

    print("\n[EXHAUSTED] Max retries reached without passing.")
    sys.exit(1)

if __name__ == "__main__":
    main()
