from __future__ import annotations

import json
import os
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = Path(os.getenv("WPWW_DATA_DIR", ROOT / "data"))
STORE_PATH = DATA_DIR / "wpww_store.jsonl"
BACKUP_PATH = STORE_PATH.with_suffix(".jsonl.bak")

# Auto-heal is deliberately limited to local runtime state.
# It never rewrites source code, secrets, workflows or infrastructure files.

def ensure_data_dir() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    print(f"[OK] data directory: {DATA_DIR}")


def repair_jsonl() -> int:
    if not STORE_PATH.exists():
        print("[INFO] no event store yet; it will be created on first write")
        return 0

    valid: list[str] = []
    corrupted = 0

    with STORE_PATH.open("r", encoding="utf-8") as handle:
        for line in handle:
            raw = line.strip()
            if not raw:
                continue
            try:
                value = json.loads(raw)
                if isinstance(value, dict):
                    valid.append(json.dumps(value, ensure_ascii=False, separators=(",", ":")))
                else:
                    corrupted += 1
            except json.JSONDecodeError:
                corrupted += 1

    if corrupted == 0:
        print("[OK] event store JSONL integrity")
        return 0

    shutil.copy2(STORE_PATH, BACKUP_PATH)
    temp = STORE_PATH.with_suffix(".jsonl.tmp")
    with temp.open("w", encoding="utf-8") as handle:
        for line in valid:
            handle.write(line + "\n")
    temp.replace(STORE_PATH)

    print(f"[FIXED] removed {corrupted} corrupt event lines")
    print(f"[BACKUP] {BACKUP_PATH}")
    return corrupted


def validate_structure() -> int:
    required = [
        ROOT / "server.js",
        ROOT / "package.json",
        ROOT / "Dockerfile",
        ROOT / "docker-compose.yml",
        ROOT / "public" / "index.html",
        ROOT / "tests" / "verify_all.py",
    ]
    missing = [str(path.relative_to(ROOT)) for path in required if not path.is_file()]
    if missing:
        print("[FAIL] required files missing:")
        for item in missing:
            print(f"       {item}")
        return len(missing)
    print("[OK] required project structure")
    return 0


def main() -> int:
    print("WPWW Auto-Heal & Repair")
    print("Scope: runtime state only; source/configuration is never rewritten automatically")

    errors = validate_structure()
    try:
        ensure_data_dir()
        repair_jsonl()
    except OSError as exc:
        print(f"[FAIL] auto-heal filesystem operation: {exc}")
        errors += 1

    print(f"Result: {'PASS' if errors == 0 else 'FAIL'}")
    return 0 if errors == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
