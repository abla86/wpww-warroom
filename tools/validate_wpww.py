import os
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = [
    Path("server.js"),
    Path("package.json"),
    Path("Dockerfile"),
    Path("docker-compose.yml"),
    Path("public/index.html"),
    Path("tests/verify_all.py"),
]
OPTIONAL_MODULES = {
    "network-sniffer": ["network-sniffer/sniffer.py", "network-sniffer/Dockerfile"],
    "cli": ["tools/cli.py"],
    "threat-simulator": ["tools/threat_simulator.py", "tools/Dockerfile"],
}

def main() -> int:
    errors = 0
    print("WPWW structural validation")
    for rel in REQUIRED:
        path = ROOT / rel
        if path.is_file() and path.stat().st_size > 0:
            print(f"[PASS] {rel}")
        else:
            print(f"[FAIL] missing or empty: {rel}")
            errors += 1

    print("\nOptional modules:")
    for name, files in OPTIONAL_MODULES.items():
        present = all((ROOT / f).is_file() and (ROOT / f).stat().st_size > 0 for f in files)
        print(f"[{'PASS' if present else 'WARN'}] {name}")
        if not present:
            print(f"       expected: {', '.join(files)}")

    for key in ["WPWW_PORT", "RADAR_URL", "SIMULATE_PATH"]:
        if os.getenv(key):
            print(f"[PASS] env {key}")
        else:
            print(f"[INFO] env {key} uses compose/default configuration")

    print(f"\nResult: {'PASS' if errors == 0 else 'FAIL'}")
    return 0 if errors == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
