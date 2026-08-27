from __future__ import annotations

import json
import os
from pathlib import Path
from threading import RLock
from typing import Any

ACCESS_PATH = Path(os.getenv("WPWW_ACCESS_CONTROL", "/data/access-control.json"))
MASTER_KEY_ENV = "WPWW_MASTER_KEY"
_lock = RLock()

DEFAULTS: dict[str, Any] = {
    "roles": {
        "USER": {
            "description": "Read-only study access with explicitly enabled safe controls",
            "permissions": [
                "view_dashboard",
                "view_events",
                "view_reports",
                "run_enabled_experiments",
            ],
        },
        "MASTER": {
            "description": "Full owner/operator control of the WPWW laboratory",
            "permissions": ["*"],
        },
    },
    "master": {
        "configured": False,
        "authEnv": MASTER_KEY_ENV,
        "authMethod": "time_limited_session",
    },
    "runtime": {
        "defaultRole": "USER",
        "requireMasterForConfigChanges": True,
        "requireMasterForModuleChanges": True,
        "requireMasterForCodeChanges": True,
    },
}


def _load() -> dict[str, Any]:
    if ACCESS_PATH.exists():
        try:
            data = json.loads(ACCESS_PATH.read_text(encoding="utf-8"))
            if isinstance(data, dict):
                return data
        except (OSError, json.JSONDecodeError):
            pass
    return json.loads(json.dumps(DEFAULTS))


def _save(data: dict[str, Any]) -> None:
    ACCESS_PATH.parent.mkdir(parents=True, exist_ok=True)
    tmp = ACCESS_PATH.with_suffix(".tmp")
    tmp.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    tmp.replace(ACCESS_PATH)


def configure_master_key_from_environment() -> dict[str, Any]:
    """Record whether an external master secret is configured.

    The secret value is never persisted. Privileged authentication is performed
    through master_control.verify_master_session().
    """
    with _lock:
        data = _load()
        key = os.getenv(MASTER_KEY_ENV, "").strip()
        data.setdefault("master", {})["configured"] = bool(key)
        data["master"]["authMethod"] = "time_limited_session"
        _save(data)
        return {"configured": bool(key), "authEnv": MASTER_KEY_ENV, "authMethod": "time_limited_session"}


def authenticate(role: str, presented_key: str | None = None, session_token: str | None = None) -> bool:
    """Authenticate USER or MASTER without storing the master secret.

    MASTER authentication prefers the short-lived master session implemented by
    master_control. The legacy presented-key argument remains accepted for API
    compatibility but is no longer sufficient on its own.
    """
    role = role.upper().strip()
    if role == "USER":
        return True
    if role != "MASTER":
        return False

    try:
        from master_control import verify_master_session
        if verify_master_session(session_token):
            return True
    except (ImportError, OSError, ValueError):
        return False

    return False


def has_permission(role: str, permission: str) -> bool:
    role = role.upper().strip()
    data = _load()
    permissions = data.get("roles", {}).get(role, {}).get("permissions", [])
    return "*" in permissions or permission in permissions


def can(
    role: str,
    permission: str,
    presented_key: str | None = None,
    session_token: str | None = None,
) -> bool:
    if not authenticate(role, presented_key, session_token):
        return False
    return has_permission(role, permission)


def access_snapshot() -> dict[str, Any]:
    data = _load()
    return {
        "roles": data.get("roles", {}),
        "master": data.get("master", {}),
        "runtime": data.get("runtime", {}),
    }
