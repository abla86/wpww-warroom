from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BASE = os.getenv("WPWW_URL", "http://localhost:8080")


def run_control_panel() -> int:
    script = ROOT / "lab" / "control_panel.py"
    if not script.is_file():
        print(f"Control panel mangler: {script}")
        return 1
    env = os.environ.copy()
    env["WPWW_URL"] = BASE
    return subprocess.call([sys.executable, str(script)], cwd=ROOT, env=env)


def print_help() -> None:
    print("""
WPWW // Unified Application

Kjør:
  python wpww.py control    åpner kontrollpanelet
  python wpww.py status     viser health-status via HTTP
  python wpww.py help       viser denne hjelpen

Standard URL: http://localhost:8080
""")


def main() -> int:
    command = sys.argv[1].lower() if len(sys.argv) > 1 else "control"
    if command == "control":
        return run_control_panel()
    if command == "help":
        print_help()
        return 0
    if command == "status":
        import urllib.request
        try:
            with urllib.request.urlopen(f"{BASE}/healthz", timeout=4) as response:
                print(response.read().decode("utf-8", errors="replace"))
                return 0
        except Exception as exc:
            print(f"WPWW unavailable: {exc}")
            return 1
    print_help()
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
