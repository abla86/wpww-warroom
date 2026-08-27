from __future__ import annotations

"""WPWW WarRoom - unified local application launcher.

This file is the single human-facing entry point for the repository. It does
not replace the individual laboratory modules; it composes the modules that
already exist into one process and one operator experience.

Design rules:
* One local HTTP runtime on port 8080.
* Existing modules remain independently importable and testable.
* Optional modules are reported as UNKNOWN/NOT_AVAILABLE rather than faked.
* No real malware execution, propagation, destructive counter-attack, or
  external-target operation is performed by this launcher.
* MASTER authorization remains external-secret/session based.
"""

import os
import sys
import threading
import time
from pathlib import Path
from typing import Callable

ROOT = Path(__file__).resolve().parent
LAB = ROOT / "lab"
if str(LAB) not in sys.path:
    sys.path.insert(0, str(LAB))

PORT = int(os.getenv("WPWW_LAB_PORT", "8080"))


def _optional_start(name: str, target_name: str) -> str:
    """Start an optional module if it exposes a runnable function."""
    try:
        module = __import__(name)
    except Exception as exc:
        return f"{name}: UNKNOWN ({exc})"

    target: Callable | None = getattr(module, target_name, None)
    if target is None:
        return f"{name}: AVAILABLE (no background runner)"

    threading.Thread(target=target, name=f"wpww-{name}", daemon=True).start()
    return f"{name}: STARTED"


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

    # The unified runtime is the only HTTP server. Other modules are composed
    # as libraries/background services so that no duplicate 8085/8080 server
    # can accidentally be started.
    status = [
        _optional_start("auto_healer", "run_auto_heal"),
    ]
    print("\nModule startup:")
    for item in status:
        print(f"  • {item}")

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
