from __future__ import annotations

import json
import time
import uuid
from dataclasses import dataclass, asdict
from pathlib import Path
import os

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = Path(os.getenv("WPWW_DATA_DIR", ROOT / "data"))
INCIDENTS_PATH = DATA_DIR / "incidents.jsonl"

STATES = ("DETECTED", "CLASSIFIED", "CONTAINED", "RECORDED", "RECOVERED", "CLOSED")

@dataclass
class Incident:
    incident_id: str
    created_utc: str
    state: str
    severity: str
    source: str
    mode: str
    title: str
    events: int = 0


def now() -> str:
    return __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat()


def create_incident(title: str, source: str, severity: str = "WARNING", mode: str = "LIVE") -> Incident:
    incident = Incident(str(uuid.uuid4()), now(), "DETECTED", severity, source, mode, title)
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with INCIDENTS_PATH.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(asdict(incident), ensure_ascii=False) + "\n")
    return incident


def list_incidents() -> list[Incident]:
    if not INCIDENTS_PATH.exists():
        return []
    items: list[Incident] = []
    with INCIDENTS_PATH.open("r", encoding="utf-8") as fh:
        for line in fh:
            try:
                raw = json.loads(line)
                items.append(Incident(**raw))
            except (json.JSONDecodeError, TypeError):
                continue
    return items


def transition(incident: Incident, new_state: str) -> Incident:
    if new_state not in STATES:
        raise ValueError(f"Invalid incident state: {new_state}")
    incident.state = new_state
    return incident


def main() -> int:
    for incident in list_incidents()[-10:]:
        print(json.dumps(asdict(incident), ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
