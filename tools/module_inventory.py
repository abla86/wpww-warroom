from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

REQUIRED = {
    "core": ["server.js", "package.json", "Dockerfile", "docker-compose.yml"],
    "ui": ["public/index.html", "public/reaction.js"],
    "tests": ["tests/verify_all.py"],
    "automation": [
        "tools/auto_heal.py",
        "tools/validate_wpww.py",
        "tools/mission_control.py",
        "tools/incident_engine.py",
        "tools/report_export.py",
    ],
    "telemetry": ["network-sniffer/sniffer.py", "network-sniffer/Dockerfile"],
    "evolution": ["evolution-attacker/attacker.py", "evolution-attacker/README.md"],
}


def inventory() -> dict:
    result: dict[str, dict] = {}
    for group, paths in REQUIRED.items():
        entries = {}
        for item in paths:
            entries[item] = (ROOT / item).is_file()
        result[group] = entries
    return result


def main() -> int:
    data = inventory()
    missing = [path for group in data.values() for path, exists in group.items() if not exists]
    print(json.dumps(data, indent=2))
    if missing:
        print("MISSING:")
        for item in missing:
            print(f" - {item}")
        return 1
    print("WPWW module inventory: COMPLETE")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
