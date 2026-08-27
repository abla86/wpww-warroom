from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = Path(os.getenv("WPWW_DATA_DIR", ROOT / "data"))
STORE = DATA_DIR / "wpww_store.jsonl"
OUT = DATA_DIR / "wpww_snapshot.json"


def read_jsonl(path: Path) -> list[dict]:
    if not path.exists():
        return []
    items = []
    with path.open("r", encoding="utf-8") as fh:
        for line in fh:
            try:
                value = json.loads(line)
                if isinstance(value, dict):
                    items.append(value)
            except json.JSONDecodeError:
                continue
    return items


def build_snapshot() -> dict:
    events = read_jsonl(STORE)
    threats = sum(1 for event in events if event.get("threat_detected") is True)
    return {
        "generatedUtc": datetime.now(timezone.utc).isoformat(),
        "eventCount": len(events),
        "threatCount": threats,
        "events": events[-100:],
    }


def export_snapshot(path: Path = OUT) -> Path:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    snapshot = build_snapshot()
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(path)
    return path


if __name__ == "__main__":
    print(export_snapshot())
