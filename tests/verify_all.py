import json
import os
import sys
import time
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

BASE_URL = os.getenv("WPWW_URL", "http://127.0.0.1:8080")


def get(path: str):
    req = Request(f"{BASE_URL}{path}")
    with urlopen(req, timeout=5) as response:
        raw = response.read().decode("utf-8")
        try:
            body = json.loads(raw)
        except json.JSONDecodeError:
            body = raw
        return response.status, body


def post(path: str):
    req = Request(f"{BASE_URL}{path}", method="POST")
    with urlopen(req, timeout=8) as response:
        raw = response.read().decode("utf-8")
        try:
            body = json.loads(raw)
        except json.JSONDecodeError:
            body = raw
        return response.status, body


def wait_for(path: str, attempts: int = 30) -> None:
    for _ in range(attempts):
        try:
            status, _ = get(path)
            if status == 200:
                return
        except Exception:
            pass
        time.sleep(1)
    raise RuntimeError(f"Endpoint did not become ready: {path}")


def check(name, fn):
    try:
        ok = bool(fn())
    except (HTTPError, URLError, TimeoutError, ValueError, RuntimeError, OSError) as exc:
        print(f"[FAIL] {name}: {exc}")
        return False
    except Exception as exc:
        print(f"[FAIL] {name}: unexpected error: {exc}")
        return False
    print(f"[{'PASS' if ok else 'FAIL'}] {name}")
    return ok


def main() -> int:
    print(f"WPWW E2E verification: {BASE_URL}")
    wait_for("/healthz")

    checks = [
        ("frontend-load", lambda: get("/")[0] == 200),
        ("health-contract", lambda: get("/healthz")[0] == 200),
        (
            "warroom-json-contract",
            lambda: (
                get("/api/warroom")[0] == 200
                and isinstance(get("/api/warroom")[1], dict)
                and "radar" in get("/api/warroom")[1]
            ),
        ),
        (
            "warroom-events-array",
            lambda: isinstance(get("/api/warroom")[1].get("radar", {}).get("events", []), list),
        ),
        (
            "simulator-contract",
            lambda: (
                post("/api/simulate")[0] == 200
                and post("/api/simulate")[1].get("action") == "defensive-probe"
            ),
        ),
    ]

    passed = sum(check(name, fn) for name, fn in checks)
    total = len(checks)
    print(f"{passed}/{total} checks passed")
    return 0 if passed == total else 1


if __name__ == "__main__":
    sys.exit(main())
