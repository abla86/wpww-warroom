"""WPWW Unified Telemetry Collector.

Collects bounded host/container telemetry that is useful for experiments and
health reports. The collector intentionally avoids packet capture, credential
access, or arbitrary command execution. All values are observations; the
collector never upgrades an observation to PASS by itself.
"""

from __future__ import annotations

import os
import platform
from datetime import datetime, timezone
from typing import Any

try:
    import psutil  # type: ignore
except ImportError:  # pragma: no cover
    psutil = None


MAX_PROCESSES = max(1, int(os.getenv("WPWW_TELEMETRY_MAX_PROCESSES", "25")))


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def snapshot() -> dict[str, Any]:
    """Return one bounded, non-destructive telemetry snapshot."""
    result: dict[str, Any] = {
        "timestampUtc": _utc_now(),
        "evidenceStatus": "OBSERVED",
        "platform": platform.platform(),
        "python": platform.python_version(),
        "pid": os.getpid(),
    }

    if psutil is None:
        result["status"] = "NOT_AVAILABLE"
        result["reason"] = "psutil is not installed"
        return result

    try:
        vm = psutil.virtual_memory()
        result["memory"] = {
            "total": vm.total,
            "available": vm.available,
            "percent": vm.percent,
        }
    except (OSError, RuntimeError):
        result["memory"] = {"status": "UNKNOWN"}

    try:
        result["cpu"] = {
            "percent": psutil.cpu_percent(interval=0.0),
            "count": psutil.cpu_count(logical=True),
            "loadAverage": list(os.getloadavg()) if hasattr(os, "getloadavg") else None,
        }
    except (OSError, RuntimeError):
        result["cpu"] = {"status": "UNKNOWN"}

    try:
        disk = psutil.disk_usage("/")
        result["disk"] = {
            "total": disk.total,
            "free": disk.free,
            "percent": disk.percent,
        }
    except (OSError, RuntimeError):
        result["disk"] = {"status": "UNKNOWN"}

    try:
        net = psutil.net_io_counters()
        result["network"] = {
            "bytesSent": net.bytes_sent,
            "bytesRecv": net.bytes_recv,
            "packetsSent": net.packets_sent,
            "packetsRecv": net.packets_recv,
        }
    except (OSError, RuntimeError):
        result["network"] = {"status": "UNKNOWN"}

    processes: list[dict[str, Any]] = []
    try:
        for proc in psutil.process_iter(["pid", "name", "status"]):
            info = proc.info
            processes.append({
                "pid": info.get("pid"),
                "name": info.get("name"),
                "status": info.get("status"),
            })
            if len(processes) >= MAX_PROCESSES:
                break
    except (psutil.Error, OSError):
        pass

    result["processes"] = processes
    result["processCountSampled"] = len(processes)
    return result


def record_snapshot() -> dict[str, Any]:
    """Record telemetry through the existing WPWW Store when available."""
    data = snapshot()
    try:
        from wpww_unit import MODE, STORE

        STORE.add(
            mode=MODE["value"],
            source="telemetry",
            type_="TELEMETRY_SNAPSHOT",
            severity="INFO",
            action="OBSERVED",
            status=200,
            details=data,
        )
    except Exception:
        data["recordStatus"] = "UNKNOWN"
    else:
        data["recordStatus"] = "RECORDED"
    return data


if __name__ == "__main__":
    print(snapshot())
