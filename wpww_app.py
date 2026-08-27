from __future__ import annotations

"""WPWW WarRoom - unified local application launcher.

This file is the single human-facing entry point for the repository. It composes
existing modules into one operator experience while preserving their individual
APIs and tests.

Runtime principles:
* One local HTTP runtime on port 8080.
* Existing modules remain independently importable/testable.
* Optional integrations are reported as AVAILABLE/UNKNOWN/NOT_AVAILABLE.
* Simulation remains local and deterministic; no real malware execution,
  propagation, destructive counter-attack, or external-target operation is
  performed by this launcher.
* MASTER authorization is handled by the existing secret/session layer.
* Background services are started only when they expose a safe runner and are
  explicitly enabled by configuration.
"""

import importlib
import os
import sys
import threading
from pathlib import Path
from typing import Callable

ROOT = Path(__file__).resolve().parent
LAB = ROOT / "lab"
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
if str(LAB) not in sys.path:
    sys.path.insert(0, str(LAB))

PORT = int(os.getenv("WPWW_LAB_PORT", "8080"))

# Modules that are safe to initialize/import as part of the single application.
# They are libraries or status providers; the unified HTTP server remains the
# only HTTP listener owned by this launcher.
CORE_MODULES = (
    "quality_evidence",
    "learning_matrix",
    "module_control",
    "access_control",
    "master_control",
    "battle_lab",
    "experiment_engine",
    "report_formats",
    "file_auditor",
    "file_scanner",
    "telemetry_collector",
    "device_watch",
    "capability_registry",
)

BACKGROUND_MODULES = (
    ("auto_healer", "run_auto_heal", "WPWW_ENABLE_AUTO_HEAL"),
)


def _enabled(env_name: str, default: bool = True) -> bool:
    value = os.getenv(env_name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _import_status(name: str) -> dict[str, str]:
    """Import a module and return a factual availability record."""
    try:
        module = importlib.import_module(name)
    except Exception as exc:  # startup should report, not hide, import failure
        return {"module": name, "status": "UNKNOWN", "detail": str(exc)}
    return {
        "module": name,
        "status": "AVAILABLE",
        "detail": getattr(module, "__doc__", "").strip().splitlines()[0] if module.__doc__ else "loaded",
    }


def _optional_start(name: str, target_name: str, env_name: str) -> dict[str, str]:
    """Start a background service only when explicitly enabled."""
    if not _enabled(env_name, default=True):
        return {"module": name, "status": "DISABLED"}

    try:
        module = importlib.import_module(name)
    except Exception as exc:
        return {"module": name, "status": "UNKNOWN", "detail": str(exc)}

    target: Callable | None = getattr(module, target_name, None)
    if target is None:
        return {"module": name, "status": "AVAILABLE", "detail": "no background runner"}

    thread = threading.Thread(
        target=target,
        name=f"wpww-{name}",
        daemon=True,
    )
    thread.start()
    return {"module": name, "status": "STARTED"}


def module_manifest() -> list[dict[str, str]]:
    """Return startup status for every library module without mutating state."""
    return [_import_status(name) for name in CORE_MODULES]


def startup_snapshot() -> dict:
    """Build a factual launcher status object suitable for diagnostics."""
    return {
        "service": "WPWW Unified WarRoom",
        "port": PORT,
        "coreModules": module_manifest(),
        "background": [
            {
                "module": name,
                "enabled": _enabled(env_name, default=True),
                "runner": target,
            }
            for name, target, env_name in BACKGROUND_MODULES
        ],
    }


def print_banner() -> None:
    print("\n" + "=" * 72)
    print("🦒 WPWW WARROOM // UNIFIED APPLICATION")
    print("=" * 72)
    print(f"Local API : http://127.0.0.1:{PORT}")
    print("Dashboard : http://127.0.0.1:8080/")
    print("Help      : http://127.0.0.1:8080/help")
    print("=" * 72)


def start_core() -> None:
    """Run the existing unified WPWW HTTP core."""
    from wpww_unit import run
    run()


def launch() -> None:
    print_banner()

    statuses = []
    print("\nCore module discovery:")
    for row in module_manifest():
        statuses.append(row)
        detail = f" — {row['detail']}" if row.get("detail") else ""
        print(f"  • {row['module']}: {row['status']}{detail}")

    print("\nBackground services:")
    for name, target, env_name in BACKGROUND_MODULES:
        row = _optional_start(name, target, env_name)
        statuses.append(row)
        detail = f" — {row['detail']}" if row.get("detail") else ""
        print(f"  • {row['module']}: {row['status']}{detail}")

    print("\nStarting unified WPWW core...")
    start_core()


if __name__ == "__main__":
    try:
        launch()
    except KeyboardInterrupt:
        print("\nWPWW stopped by operator.")
        raise SystemExit(0)
    except Exception as exc:
        print(f"\nWPWW startup failed: {exc}", file=sys.stderr)
        raise SystemExit(1)
