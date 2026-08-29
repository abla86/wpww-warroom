#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import sys
import time
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

BASE = os.getenv("WPWW_URL", "http://127.0.0.1:8080")


def call(path: str, method: str = "GET", payload: dict | None = None) -> tuple[int, object]:
    data = None
    headers = {}
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = Request(f"{BASE}{path}", method=method, data=data, headers=headers)
    try:
        with urlopen(req, timeout=8) as response:
            raw = response.read().decode("utf-8")
            try:
                return response.status, json.loads(raw)
            except json.JSONDecodeError:
                return response.status, raw
    except HTTPError as exc:
        raw = exc.read().decode("utf-8", errors="replace")
        try:
            return exc.code, json.loads(raw)
        except json.JSONDecodeError:
            return exc.code, raw


def wait_ready() -> None:
    for _ in range(30):
        try:
            status, body = call("/healthz")
            if status == 200 and isinstance(body, dict) and body.get("status") == "Healthy":
                return
        except (URLError, OSError, TimeoutError):
            pass
        time.sleep(1)
    raise RuntimeError("WPWW never became ready")


def main() -> int:
    wait_ready()
    checks: list[tuple[str, bool]] = []

    status, body = call("/api/warroom")
    checks.append(("warroom-contract", status == 200 and isinstance(body, dict)))

    status, body = call("/api/mode", "POST", {"mode": "DEMO"})
    checks.append(("demo-mode", status == 200 and isinstance(body, dict) and body.get("mode") == "DEMO"))

    status, body = call("/api/simulate", "POST")
    probe_id = body.get("incidentId") if isinstance(body, dict) else None
    checks.append(("controlled-probe", status == 200 and isinstance(body, dict) and body.get("statusCode") == 403 and body.get("action") == "BLOCK_403"))

    status, body = call("/api/incidents")
    checks.append(("incident-feed", status == 200 and isinstance(body, dict) and isinstance(body.get("incidents"), list)))

    status, body = call("/api/report.json")
    checks.append(("report-contract", status == 200 and isinstance(body, dict) and isinstance(body.get("summary"), dict)))

    if probe_id:
        status, body = call(f"/api/replay/{probe_id}")
        checks.append(("event-replay", status == 200 and isinstance(body, dict) and isinstance(body.get("replay"), list)))
    else:
        checks.append(("event-replay", False))

    status, body = call("/api/alerts/test", "POST")
    checks.append(("alert-test", status == 200 and isinstance(body, dict) and "alert" in body))

    status, body = call("/api/lockdown", "POST")
    checks.append(("local-lockdown", status == 200 and isinstance(body, dict) and body.get("lockdown") is True and body.get("externalSystemsAffected") is False))

    status, body = call("/api/lockdown/reset", "POST")
    checks.append(("lockdown-reset", status == 200 and isinstance(body, dict) and body.get("lockdown") is False and body.get("externalSystemsAffected") is False))

    status, body = call("/api/mode", "POST", {"mode": "LIVE"})
    checks.append(("live-mode", status == 200 and isinstance(body, dict) and body.get("mode") == "LIVE"))

    status, body = call("/api/route-that-does-not-exist")
    checks.append(("unknown-route", status == 404 and isinstance(body, dict) and body.get("code") == 404))

    failed = [name for name, ok in checks if not ok]
    for name, ok in checks:
        print(f"[{'PASS' if ok else 'FAIL'}] {name}")

    print(f"{len(checks) - len(failed)}/{len(checks)} mission checks passed")
    if failed:
        print("Failed:", ", ".join(failed))
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
