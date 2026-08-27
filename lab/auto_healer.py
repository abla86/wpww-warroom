"""WPWW Auto-Healer / resilience coordinator.

This module is part of the single WPWW runtime. It observes the local runtime,
rotates oversized event logs without deleting evidence, and records observations
through the existing WPWW event store when that store is available.

Important evidence rule: detecting a condition is not the same as proving that
it was repaired. Results therefore distinguish OBSERVED, NOT_REQUIRED,
FAIL and OBSERVED_AND_REPAIRED.
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
MAX_EVENT_LOG_BYTES = max(
    1_048_576,
    int(os.getenv("WPWW_MAX_EVENT_LOG_BYTES", str(20 * 1024 * 1024))),
)
EVENT_LOG = DATA_DIR / "wpww_events.jsonl"


class AutoHealer:
    """Conservative resilience monitor for the single WPWW runtime."""

    def __init__(self) -> None:
        self._stop = Event()
        self._thread: Thread | None = None
        DATA_DIR.mkdir(parents=True, exist_ok=True)

    def snapshot(self) -> dict[str, Any]:
        """Return the current observable state without claiming health."""
        try:
            event_log_bytes = EVENT_LOG.stat().st_size if EVENT_LOG.exists() else 0
        except OSError:
            event_log_bytes = -1
        return {
            "enabled": True,
            "intervalSeconds": INTERVAL,
            "eventLogPresent": EVENT_LOG.exists(),
            "eventLogBytes": event_log_bytes,
            "maxEventLogBytes": MAX_EVENT_LOG_BYTES,
            "containerRestartPolicy": os.getenv("WPWW_RESTART_POLICY", "unless-stopped"),
        }

    def _record_event(self, result: dict[str, Any]) -> None:
        """Record through the unified Store when running inside WPWW."""
        try:
            from wpww_unit import MODE, STORE

            status = result.get("status", "UNKNOWN")
            severity = "ERROR" if status == "FAIL" else "INFO"
            action = str(result.get("action", status))
            STORE.add(
                mode=MODE["value"],
                source="auto-healer",
                type_="AUTO_HEAL",
                severity=severity,
                action=action,
                status=500 if status == "FAIL" else 200,
                details=result,
            )
        except Exception:
            # Observability must never take down the runtime.
            return

    def rotate_event_log(self) -> dict[str, Any]:
        """Archive an oversized log without claiming that data is deleted or fixed."""
        try:
            if not EVENT_LOG.exists():
                return {"status": "NOT_REQUIRED", "reason": "event log does not exist"}

            size = EVENT_LOG.stat().st_size
            if size <= MAX_EVENT_LOG_BYTES:
                return {"status": "NOT_REQUIRED", "bytes": size}

            # Preserve evidence. Do not overwrite an existing archive.
            stamp = time.strftime("%Y%m%d-%H%M%S", time.gmtime())
            backup = EVENT_LOG.with_name(f"wpww_events-{stamp}.jsonl")
            if backup.exists():
                suffix = 1
                while True:
                    candidate = EVENT_LOG.with_name(f"wpww_events-{stamp}-{suffix}.jsonl")
                    if not candidate.exists():
                        backup = candidate
                        break
                    suffix += 1

            EVENT_LOG.replace(backup)
            return {
                "status": "OBSERVED_AND_REPAIRED",
                "action": "LOG_ROTATED",
                "bytes": size,
                "archive": str(backup),
            }
        except OSError as exc:
            return {"status": "FAIL", "action": "LOG_ROTATE", "error": str(exc)}

    def check_once(self) -> dict[str, Any]:
        """Perform one bounded resilience pass."""
        result = self.rotate_event_log()
        result["snapshot"] = self.snapshot()
        self._record_event(result)
        try:
            STATE_FILE.write_text(
                json.dumps(result, indent=2, ensure_ascii=False),
                encoding="utf-8",
            )
        except OSError:
            pass
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
        self._thread = Thread(
            target=self._run,
            name="wpww-auto-healer",
            daemon=True,
        )
        self._thread.start()

    def stop(self) -> None:
        self._stop.set()
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=2)


def run_auto_heal() -> None:
    """Compatibility entry point for existing startup code."""
    healer = AutoHealer()
    healer.start()
    try:
        while True:
            time.sleep(3600)
    except KeyboardInterrupt:
        healer.stop()


if __name__ == "__main__":
    run_auto_heal()
