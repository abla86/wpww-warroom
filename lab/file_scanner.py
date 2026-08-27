from __future__ import annotations

import hashlib
import json
import os
from datetime import datetime, timezone
from pathlib import Path

USER_FILES_DIR = Path(os.getenv("WPWW_USER_FILES_DIR", "/app/user_files"))
DATA_DIR = Path(os.getenv("WPWW_DATA_DIR", "/data"))
SNAPSHOT_FILE = DATA_DIR / "user_files_audit.json"


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def audit_user_documents() -> dict:
    USER_FILES_DIR.mkdir(parents=True, exist_ok=True)
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    files = []
    for path in sorted(USER_FILES_DIR.rglob("*")):
        if not path.is_file():
            continue
        stat = path.stat()
        files.append(
            {
                "path": str(path.relative_to(USER_FILES_DIR)).replace("\\", "/"),
                "size": stat.st_size,
                "sha256": _sha256(path),
                "modifiedUtc": datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat(),
            }
        )

    result = {
        "generatedAtUtc": datetime.now(timezone.utc).isoformat(),
        "root": str(USER_FILES_DIR),
        "fileCount": len(files),
        "files": files,
    }
    SNAPSHOT_FILE.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
    return result


if __name__ == "__main__":
    print(json.dumps(audit_user_documents(), indent=2, ensure_ascii=False))
