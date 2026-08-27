from __future__ import annotations

import json
import os
from pathlib import Path
from threading import RLock
from typing import Any

ROOT = Path(os.getenv("WPWW_DATA_DIR", "/data"))
CONTROL_PATH = ROOT / "master-control.json"
REPORT_PATH = ROOT / "report-control.json"

_lock = RLock()

DEFAULT = {
    "role": "MASTER",
    "workspace": "SANDBOX",
    "workspaceOpen": True,
    "allowRuntimeSwitching": True,
    "allowModuleEditing": True,
    "allowParameterEditing": True,
    "allowReportEditing": True,
    "allowDatabaseSelection": True,
    "allowExperimentSelection": True,
    "allowCodeEditing": False,
    "auditAllChanges": True,
}


def _read(path: Path, fallback: dict[str, Any]) -> dict[str, Any]:
    if not path.exists():
        return dict(fallback)
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
        return value if isinstance(value, dict) else dict(fallback)
    except (OSError, json.JSONDecodeError):
        return dict(fallback)


def get_master_control() -> dict[str, Any]:
    with _lock:
        return _read(CONTROL_PATH, DEFAULT)


def set_master_control(**changes: Any) -> dict[str, Any]:
    with _lock:
        state = get_master_control()
        state.update(changes)
        ROOT.mkdir(parents=True, exist_ok=True)
        tmp = CONTROL_PATH.with_suffix(".tmp")
        tmp.write_text(json.dumps(state, indent=2, ensure_ascii=False), encoding="utf-8")
        tmp.replace(CONTROL_PATH)
        return state


def get_report_control() -> dict[str, Any]:
    with _lock:
        return _read(REPORT_PATH, {})


def set_report_control(config: dict[str, Any]) -> dict[str, Any]:
    with _lock:
        ROOT.mkdir(parents=True, exist_ok=True)
        tmp = REPORT_PATH.with_suffix(".tmp")
        tmp.write_text(json.dumps(config, indent=2, ensure_ascii=False), encoding="utf-8")
        tmp.replace(REPORT_PATH)
        return config


def is_master() -> bool:
    return get_master_control().get("role") == "MASTER"


def require_master() -> None:
    if not is_master():
        raise PermissionError("MASTER access required")
