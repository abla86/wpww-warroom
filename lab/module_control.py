from __future__ import annotations

import json
import os
from pathlib import Path
from threading import RLock
from typing import Any

CONTROL_PATH = Path(os.getenv("WPWW_MODULE_CONTROL", "/data/module-control.json"))
MANIFEST_PATH = Path(os.getenv("WPWW_PLUGIN_MANIFEST", "/app/lab/plugin-manifest.json"))

_lock = RLock()


def _defaults() -> dict[str, Any]:
    return {
        "control": {
            "defaultLocked": False,
            "defaultSelected": True,
            "requireExplicitRun": True,
            "allowRuntimeSwitching": True,
            "allowModuleExclusion": True,
            "allowAlternativeSelection": True,
            "maxConcurrentExperiments": 1,
        },
        "moduleState": {},
    }


def load() -> dict[str, Any]:
    with _lock:
        if CONTROL_PATH.exists():
            try:
                data = json.loads(CONTROL_PATH.read_text(encoding="utf-8"))
                if isinstance(data, dict):
                    return data
            except (OSError, json.JSONDecodeError):
                pass
        return _defaults()


def save(data: dict[str, Any]) -> None:
    CONTROL_PATH.parent.mkdir(parents=True, exist_ok=True)
    temp = CONTROL_PATH.with_suffix(".tmp")
    temp.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    temp.replace(CONTROL_PATH)


def manifest() -> list[dict[str, Any]]:
    if not MANIFEST_PATH.exists():
        return []
    try:
        data = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
        plugins = data.get("plugins", [])
        return plugins if isinstance(plugins, list) else []
    except (OSError, json.JSONDecodeError):
        return []


def catalog() -> list[dict[str, Any]]:
    state = load()
    states = state.setdefault("moduleState", {})
    result = []
    for plugin in manifest():
        pid = plugin.get("id")
        if not pid:
            continue
        current = states.get(pid, {})
        result.append({
            **plugin,
            "selected": current.get("selected", state["control"].get("defaultSelected", True)),
            "locked": current.get("locked", state["control"].get("defaultLocked", False)),
            "mode": current.get("mode", "default"),
        })
    return result


def set_module(module_id: str, *, selected: bool | None = None, locked: bool | None = None,
               mode: str | None = None) -> dict[str, Any]:
    with _lock:
        data = load()
        states = data.setdefault("moduleState", {})
        current = dict(states.get(module_id, {}))
        if selected is not None:
            current["selected"] = bool(selected)
        if locked is not None:
            current["locked"] = bool(locked)
        if mode is not None:
            current["mode"] = str(mode)
        states[module_id] = current
        save(data)
        return current


def selected_modules(side: str | None = None) -> list[dict[str, Any]]:
    items = [m for m in catalog() if m.get("selected") and not m.get("locked")]
    if side:
        items = [m for m in items if m.get("side") == side]
    return items


def snapshot() -> dict[str, Any]:
    return {"control": load().get("control", {}), "modules": catalog()}
