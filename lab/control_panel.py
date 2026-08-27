from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from typing import Any

import requests

BASE_URL = os.getenv("WPWW_URL", "http://localhost:8080")
USER_FILES = Path(os.getenv("WPWW_USER_FILES", "user_files"))
ALLOWED_EXTENSIONS = {".json", ".txt", ".md", ".py"}
TIMEOUT = float(os.getenv("WPWW_CONTROL_TIMEOUT", "4"))


def request(path: str, method: str = "GET", payload: dict[str, Any] | None = None) -> tuple[int, Any]:
    try:
        response = requests.request(method, f"{BASE_URL}{path}", json=payload, timeout=TIMEOUT)
        try:
            body: Any = response.json()
        except ValueError:
            body = response.text
        return response.status_code, body
    except requests.RequestException as exc:
        return 0, {"error": str(exc)}


def show_health() -> None:
    status, body = request("/healthz")
    print(json.dumps({"http": status, "body": body}, ensure_ascii=False, indent=2))


def show_warroom() -> None:
    status, body = request("/api/warroom")
    print(json.dumps({"http": status, "body": body}, ensure_ascii=False, indent=2))


def set_mode() -> None:
    value = input("Mode [LIVE/DEMO]: ").strip().upper()
    status, body = request("/api/mode", "POST", {"mode": value})
    print(json.dumps({"http": status, "body": body}, ensure_ascii=False, indent=2))


def toggle_lockdown() -> None:
    status, state = request("/healthz")
    enabled = bool(state.get("lockdown")) if isinstance(state, dict) else False
    path = "/api/lockdown/reset" if enabled else "/api/lockdown"
    status, body = request(path, "POST")
    print(json.dumps({"http": status, "body": body}, ensure_ascii=False, indent=2))


def controlled_probe() -> None:
    status, body = request("/api/simulate", "POST")
    print(json.dumps({"http": status, "body": body}, ensure_ascii=False, indent=2))


def test_alert() -> None:
    status, body = request("/api/alerts/test", "POST")
    print(json.dumps({"http": status, "body": body}, ensure_ascii=False, indent=2))


def list_user_files() -> list[Path]:
    if not USER_FILES.exists():
        return []
    return sorted(
        p for p in USER_FILES.iterdir()
        if p.is_file() and p.suffix.lower() in ALLOWED_EXTENSIONS
    )


def inspect_user_file() -> None:
    files = list_user_files()
    if not files:
        print(f"Ingen støttede filer i {USER_FILES.resolve()}")
        return
    for index, path in enumerate(files, 1):
        print(f"[{index}] {path.name}")
    try:
        index = int(input("Velg fil for visning: ").strip()) - 1
        selected = files[index]
    except (ValueError, IndexError):
        print("Ugyldig valg.")
        return
    print(f"\n--- {selected.name} ---")
    print(selected.read_text(encoding="utf-8", errors="replace"))
    print("--- slutt ---")


def menu() -> None:
    while True:
        print("""
============================================================
                 WPWW WAR ROOM CONTROL PANEL
============================================================
 [1] System health
 [2] Full War Room state
 [3] LIVE / DEMO
 [4] Local lockdown / reset
 [5] Controlled defensive probe
 [6] Test alerts
 [7] Inspect user_files
 [8] Exit
============================================================
""")
        choice = input("Velg: ").strip()
        if choice == "1":
            show_health()
        elif choice == "2":
            show_warroom()
        elif choice == "3":
            set_mode()
        elif choice == "4":
            toggle_lockdown()
        elif choice == "5":
            controlled_probe()
        elif choice == "6":
            test_alert()
        elif choice == "7":
            inspect_user_file()
        elif choice == "8":
            return
        else:
            print("Ugyldig valg.")


if __name__ == "__main__":
    menu()
