from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
from datetime import datetime, timezone

DATA_DIR = Path(os.getenv("WPWW_DATA_DIR", "/data"))
USER_FILES_DIR = Path(os.getenv("WPWW_USER_FILES_DIR", "/data/user_files"))
BASELINE_PATH = DATA_DIR / "user_files_baseline.json"


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def inventory() -> dict[str, dict]:
    USER_FILES_DIR.mkdir(parents=True, exist_ok=True)
    result: dict[str, dict] = {}
    for path in sorted(USER_FILES_DIR.rglob("*")):
        if not path.is_file():
            continue
        relative = path.relative_to(USER_FILES_DIR).as_posix()
        stat = path.stat()
        result[relative] = {
            "sha256": sha256_file(path),
            "size": stat.st_size,
            "mtimeUtc": datetime.fromtimestamp(stat.st_mtime, timezone.utc).isoformat(),
        }
    return result


def load_baseline() -> dict[str, dict]:
    try:
        return json.loads(BASELINE_PATH.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        return {}


def save_baseline(data: dict[str, dict]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    BASELINE_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def audit(create_baseline: bool = False) -> dict:
    current = inventory()
    baseline = load_baseline()

    added = sorted(set(current) - set(baseline))
    removed = sorted(set(baseline) - set(current))
    modified = sorted(
        name for name in set(current) & set(baseline)
        if current[name]["sha256"] != baseline[name].get("sha256")
    )

    if create_baseline or not baseline:
        save_baseline(current)
        baseline = current
        added, removed, modified = [], [], []

    return {
        "timestampUtc": utc_now(),
        "directory": str(USER_FILES_DIR),
        "fileCount": len(current),
        "baselinePresent": bool(baseline),
        "added": added,
        "removed": removed,
        "modified": modified,
        "clean": not added and not removed and not modified,
        "files": current,
    }


if __name__ == "__main__":
    report = audit(create_baseline=os.getenv("WPWW_CREATE_USER_BASELINE", "false").lower() == "true")
    print(json.dumps(report, ensure_ascii=False, indent=2))
