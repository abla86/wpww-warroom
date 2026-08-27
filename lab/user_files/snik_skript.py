from __future__ import annotations

import json
import os
import urllib.request

WPWW_URL = os.getenv("WPWW_URL", "http://localhost:8080").rstrip("/")


def request(path: str) -> tuple[int, object]:
    req = urllib.request.Request(f"{WPWW_URL}{path}", method="GET")
    try:
        with urllib.request.urlopen(req, timeout=3) as response:
            raw = response.read().decode("utf-8", errors="replace")
            try:
                return response.status, json.loads(raw)
            except json.JSONDecodeError:
                return response.status, raw
    except Exception as exc:
        return 0, {"error": str(exc)}


def run_controlled_scenario() -> None:
    print("[WPWW INSIDER SCENARIO] Controlled simulation only")
    status, state = request("/api/warroom")
    print(f"War Room status: HTTP {status}")
    if isinstance(state, dict):
        print(f"Mode: {state.get('wpww', {}).get('mode', 'UNKNOWN')}")
        print(f"Lockdown: {state.get('wpww', {}).get('lockdown', 'UNKNOWN')}")
        print("No defense settings are changed and no logs are exfiltrated.")


if __name__ == "__main__":
    run_controlled_scenario()
