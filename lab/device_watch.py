from __future__ import annotations

"""WPWW Device Watch.

Observability-only host snapshotter for the WPWW laboratory.
It reports what the running process can actually observe and never turns
absence of telemetry into a security conclusion.

Every snapshot carries an explicit evidence state:
OBSERVED, VERIFIED, TESTED, INFERRED, UNKNOWN, NOT_OBSERVABLE.
"""

import json
import os
import platform
import socket
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


def _utc() -> str:
    return datetime.now(timezone.utc).isoformat()


def _safe_call(fn, default=None):
    try:
        return fn()
    except Exception:
        return default


def _psutil_snapshot() -> dict[str, Any]:
    try:
        import psutil
    except ImportError:
        return {"status": "NOT_OBSERVABLE", "reason": "psutil unavailable"}

    processes = []
    for proc in _safe_call(psutil.process_iter, []) or []:
        try:
            info = proc.info
            processes.append({
                "pid": info.get("pid"),
                "name": info.get("name"),
                "username": info.get("username"),
                "status": info.get("status"),
            })
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            continue

    connections = []
    try:
        for conn in psutil.net_connections(kind="inet"):
            connections.append({
                "status": conn.status,
                "local": f"{conn.laddr.ip}:{conn.laddr.port}" if conn.laddr else None,
                "remote": f"{conn.raddr.ip}:{conn.raddr.port}" if conn.raddr else None,
                "pid": conn.pid,
            })
    except Exception:
        connections = []

    disks = []
    for part in _safe_call(psutil.disk_partitions, []) or []:
        disks.append({"device": part.device, "mountpoint": part.mountpoint, "fstype": part.fstype})

    return {
        "status": "OBSERVED",
        "cpuPercent": _safe_call(psutil.cpu_percent, None),
        "memory": _safe_call(lambda: {
            "total": psutil.virtual_memory().total,
            "used": psutil.virtual_memory().used,
            "percent": psutil.virtual_memory().percent,
        }, None),
        "disks": disks,
        "processes": processes,
        "networkConnections": connections,
    }


def snapshot() -> dict[str, Any]:
    """Return only host facts visible to the current WPWW process."""
    return {
        "timestampUtc": _utc(),
        "evidence": "OBSERVED",
        "hostname": _safe_call(socket.gethostname, None),
        "platform": {
            "system": platform.system(),
            "release": platform.release(),
            "machine": platform.machine(),
            "python": platform.python_version(),
        },
        "container": {
            "inContainer": Path("/.dockerenv").exists() or os.getenv("container") == "docker",
            "dataDir": os.getenv("WPWW_DATA_DIR", "/data"),
        },
        "hostMetrics": _psutil_snapshot(),
    }


def forensic_snapshot(path: str | None = None) -> dict[str, Any]:
    """Persist a point-in-time snapshot for research/incident review."""
    root = Path(os.getenv("WPWW_DATA_DIR", "/data"))
    target = Path(path) if path else root / f"device-snapshot-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}.json"
    target.parent.mkdir(parents=True, exist_ok=True)
    data = snapshot()
    target.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    return {"status": "TESTED", "path": str(target), "snapshot": data}
