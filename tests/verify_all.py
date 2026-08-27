import json
import os
import sys
import time
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

BASE_URL = os.getenv("WPWW_URL", "http://127.0.0.1:8080")


def request(path: str, method: str = "GET") -> tuple[int, object]:
    req = Request(f"{BASE_URL}{path}", method=method)
    try:
        with urlopen(req, timeout=8) as response:
            raw = response.read().decode("utf-8")
            try:
                body = json.loads(raw)
            except json.JSONDecodeError:
                body = raw
            return response.status, body
    except HTTPError as exc:
        raw = exc.read().decode("utf-8", errors="replace")
        try:
            body = json.loads(raw)
        except json.JSONDecodeError:
            body = raw
        return exc.code, body


def wait_for_health(attempts: int = 30) -> None:
    for _ in range(attempts):
        try:
            status, _ = request("/healthz")
            if status == 200:
                return
        except (URLError, OSError, TimeoutError):
            pass
        time.sleep(1)
    raise RuntimeError("WPWW /healthz did not become ready")


def check(name: str, fn) -> bool:
    try:
        ok = bool(fn())
    except Exception as exc:
        print(f"[FAIL] {name}: {exc}")
        return False
    print(f"[{'PASS' if ok else 'FAIL'}] {name}")
    return ok


def main() -> int:
    print(f"WPWW E2E verification: {BASE_URL}")
    wait_for_health()

    frontend_status, _ = request("/")
    health_status, health_body = request("/healthz")
    war_status, war_body = request("/api/warroom")
    simulation_status, simulation_body = request("/api/simulate", "POST")

    checks = [
        ("frontend-load", frontend_status == 200),
        ("health-contract", health_status == 200 and isinstance(health_body, dict)),
        (
            "warroom-contract",
            war_status == 200
            and isinstance(war_body, dict)
            and isinstance(war_body.get("radar"), dict)
            and "health" in war_body["radar"]
            and "api" in war_body["radar"],
        ),
        (
            "event-feed-shape",
            war_status == 200
            and isinstance(war_body, dict)
            and isinstance(war_body.get("radar", {}).get("events"), list),
        ),
        (
            "simulator-contract",
            simulation_status == 200
            and isinstance(simulation_body, dict)
            and simulation_body.get("action") == "defensive-probe"
            and isinstance(simulation_body.get("upstreamStatus"), int),
        ),
    ]

    passed = 0
    for name, condition in checks:
        if check(name, lambda condition=condition: condition):
            passed += 1

    total = len(checks)
    print(f"{passed}/{total} checks passed")
    return 0 if passed == total else 1


if __name__ == "__main__":
    sys.exit(main())
