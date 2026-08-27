"""WPWW Auto-Healer / resilience coordinator.

This module monitors the unified WPWW runtime without silently claiming that a
component was repaired. It records an observation when a configured artifact is
missing or unreadable and keeps remediation conservative: restart orchestration
is delegated to the container runtime rather than spawning uncontrolled child
processes from the lab.
"""

from __future__ import annotations

import json
import os
import time
from pathlib import Path
from threading import Event, Thread
from typing import Any

DATA_DIR = Path(os.getenv("WPWW_DATA_DIR", "/data"))
STATE_FILE = DATA_DIR / "auto_healer_state.json"
INTERVAL = max(1.0, float(os.getenv("WPWW_HEAL_INTERVAL", "20")))
MAX_EVENT_LOG_BYTES = max(1_048_576, int(os.getenv("WPWW_MAX_EVENT_LOG_BYTES", str(20 * 1024 * 1024))))
EVENT_LOG = DATA_DIR / "wpww_events.jsonl"


class AutoHealer:
    """Conservative resilience monitor for the single WPWW runtime."""

    def __init__(self) -> None:
        self._stop = Event()
        self._thread: Thread | None = None
        DATA_DIR.mkdir(parents=True, exist_ok=True)

    def snapshot(self) -> dict[str, Any]:
        return {
            "enabled": True,
            "intervalSeconds": INTERVAL,
            "eventLogPresent": EVENT_LOG.exists(),
            "eventLogBytes": EVENT_LOG.stat().st_size if EVENT_LOG.exists() else 0,
            "maxEventLogBytes": MAX_EVENT_LOG_BYTES,
            "containerRestartPolicy": os.getenv("WPWW_RESTART_POLICY", "unless-stopped"),
        }

    def rotate_event_log(self) -> dict[str, Any]:
        if not EVENT_LOG.exists():
            return {"status": "NOT_APPLICABLE", "reason": "event log does not exist"}
        size = EVENT_LOG.stat().st_size
        if size <= MAX_EVENT_LOG_BYTES:
            return {"status": "NOT_REQUIRED", "bytes": size}

        backup = EVENT_LOG.with_suffix(".jsonl.1")
        try:
            EVENT_LOG.replace(backup)
            result = {"status": "OBSERVED_AND_REPAIRED", "action": "ROTATED", "bytes": size, "backup": str(backup)}
            STATE_FILE.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
            return result
        except OSError as exc:
            result = {"status": "FAIL", "action": "ROTATE", "error": str(exc)}
            STATE_FILE.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
            return result

    def check_once(self) -> dict[str, Any]:
        result = self.rotate_event_log()
        result["snapshot"] = self.snapshot()
        return result

    def _run(self) -> None:
        while not self._stop.wait(INTERVAL):
            try:
                print(f"[AUTO-HEAL] {json.dumps(self.check_once(), ensure_ascii=False)}")
            except Exception as exc:
                print(f"[AUTO-HEAL] FAIL: {exc}")

    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            return
        self._stop.clear()
        self._thread = Thread(target=self._run, name="wpww-auto-healer", daemon=True)
        self._thread.start()

    def stop(self) -> None:
        self._stop.set()
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=2)


def run_auto_heal() -> None:
    """Compatibility entry point for the existing WPWW master startup."""
    healer = AutoHealer()
    healer.start()
    try:
        while True:
            time.sleep(3600)
    except KeyboardInterrupt:
        healer.stop()


if __name__ == "__main__":
    run_auto_heal()
