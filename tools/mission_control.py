from __future__ import annotations

import json
import os
import time
from dataclasses import dataclass, asdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = Path(os.getenv("WPWW_DATA_DIR", ROOT / "data"))
STATE_PATH = DATA_DIR / "mission_control.json"

MODES = {"LIVE", "DEMO"}
FLAGS = {
    "radar", "telemetry", "simulator", "audio", "history",
    "incidentMode", "snapshotExport", "eventHistory", "autoHeal"
}

@dataclass
class MissionState:
    mode: str = "LIVE"
    radar: bool = True
    telemetry: bool = False
    simulator: bool = True
    audio: bool = True
    history: bool = True
    incidentMode: bool = True
    snapshotExport: bool = True
    eventHistory: bool = True
    autoHeal: bool = True
    lockdown: bool = False


def load_state() -> MissionState:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not STATE_PATH.exists():
        state = MissionState()
        STATE_PATH.write_text(json.dumps(asdict(state), indent=2), encoding="utf-8")
        return state
    try:
        raw = json.loads(STATE_PATH.read_text(encoding="utf-8"))
        clean = {k: v for k, v in raw.items() if k in MissionState.__dataclass_fields__}
        state = MissionState(**clean)
        if state.mode not in MODES:
            state.mode = "LIVE"
        return state
    except (OSError, json.JSONDecodeError, TypeError):
        return MissionState()


def save_state(state: MissionState) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    tmp = STATE_PATH.with_suffix(".tmp")
    tmp.write_text(json.dumps(asdict(state), indent=2), encoding="utf-8")
    tmp.replace(STATE_PATH)


def set_flag(state: MissionState, name: str, value: bool) -> MissionState:
    if name not in FLAGS:
        raise ValueError(f"Unknown feature flag: {name}")
    setattr(state, name, bool(value))
    return state


def set_mode(state: MissionState, mode: str) -> MissionState:
    mode = mode.upper()
    if mode not in MODES:
        raise ValueError(f"Mode must be one of {sorted(MODES)}")
    state.mode = mode
    return state


def main() -> int:
    state = load_state()
    print(json.dumps(asdict(state), indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
