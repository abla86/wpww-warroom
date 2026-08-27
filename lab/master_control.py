from __future__ import annotations

import hashlib
import hmac
import json
import os
import secrets
import time
from pathlib import Path
from threading import RLock
from typing import Any

ROOT = Path(os.getenv("WPWW_DATA_DIR", "/data"))
CONTROL_PATH = ROOT / "master-control.json"
REPORT_PATH = ROOT / "report-control.json"
SESSION_PATH = ROOT / "master-session.json"
MASTER_KEY_ENV = "WPWW_MASTER_KEY"
SESSION_TTL_SECONDS = max(300, int(os.getenv("WPWW_MASTER_SESSION_TTL", "3600")))

_lock = RLock()

DEFAULT = {
    "role": "USER",
    "workspace": "SANDBOX",
    "workspaceOpen": True,
    "allowRuntimeSwitching": False,
    "allowModuleEditing": False,
    "allowParameterEditing": False,
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
    except (OSError, json.JSONDecodeError):
        return dict(fallback)
    return value if isinstance(value, dict) else dict(fallback)


def _write_atomic(path: Path, value: dict[str, Any]) -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + ".tmp")
    temp.write_text(json.dumps(value, indent=2, ensure_ascii=False), encoding="utf-8")
    temp.replace(path)


def _master_key() -> bytes | None:
    secret = os.getenv(MASTER_KEY_ENV, "")
    return secret.encode("utf-8") if secret else None


def get_master_control() -> dict[str, Any]:
    with _lock:
        return _read(CONTROL_PATH, DEFAULT)


def set_master_control(**changes: Any) -> dict[str, Any]:
    with _lock:
        state = _read(CONTROL_PATH, DEFAULT)
        state.update(changes)
        _write_atomic(CONTROL_PATH, state)
        return state


def get_report_control() -> dict[str, Any]:
    with _lock:
        return _read(REPORT_PATH, {})


def set_report_control(config: dict[str, Any]) -> dict[str, Any]:
    with _lock:
        _write_atomic(REPORT_PATH, config)
        return config


def issue_master_session() -> dict[str, Any]:
    """Issue a short-lived MASTER session using the external master secret.

    The actual master secret is never written to GitHub, the control JSON, or
    the session file. Only a SHA-256 digest of a random session token is
    persisted. The secret therefore remains an environment/secret-store value.
    """
    with _lock:
        if _master_key() is None:
            raise RuntimeError(f"{MASTER_KEY_ENV} is not configured")

        now = int(time.time())
        token = secrets.token_urlsafe(32)
        state = {
            "tokenHash": hashlib.sha256(token.encode("utf-8")).hexdigest(),
            "issuedAt": now,
            "expiresAt": now + SESSION_TTL_SECONDS,
            "role": "MASTER",
        }
        _write_atomic(SESSION_PATH, state)
        return {"role": "MASTER", "token": token, "expiresAt": state["expiresAt"]}


def verify_master_session(token: str | None) -> bool:
    if not token:
        return False
    with _lock:
        state = _read(SESSION_PATH, {})
        try:
            expires_at = int(state.get("expiresAt", 0))
        except (TypeError, ValueError):
            return False
        stored_hash = str(state.get("tokenHash", ""))
        if not stored_hash or expires_at <= int(time.time()):
            return False
        actual_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
        return hmac.compare_digest(actual_hash, stored_hash)


def revoke_master_session() -> None:
    with _lock:
        SESSION_PATH.unlink(missing_ok=True)


def is_master(session_token: str | None = None) -> bool:
    return verify_master_session(session_token)


def require_master(session_token: str | None = None) -> None:
    if not is_master(session_token):
        raise PermissionError("Valid MASTER session required")


def sign_control_action(action: str, session_token: str) -> str:
    """Sign an authenticated control action with the external master key."""
    require_master(session_token)
    key = _master_key()
    if key is None:
        raise RuntimeError(f"{MASTER_KEY_ENV} is not configured")
    return hmac.new(key, action.encode("utf-8"), hashlib.sha256).hexdigest()
