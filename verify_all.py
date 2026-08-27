import json
import os
import sys
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

BASE = os.getenv("WPWW_URL", "http://127.0.0.1:8080")


def request(path, method="GET"):
    req = Request(
        f"{BASE}{path}",
        method=method,
        headers={"Accept": "application/json"},
    )
    try:
        with urlopen(req, timeout=5) as response:
            body = response.read().decode("utf-8", errors="replace")
            return response.status, body
    except HTTPError as exc:
        return exc.code, exc.read().decode("utf-8", errors="replace")
    except URLError as exc:
        return 0, str(exc.reason)


def check(results, name, condition, detail):
    results.append((name, condition, detail))
    print(f"[{ 'PASS' if condition else 'FAIL' }] {name}: {detail}")


def main():
    print(f"WPWW full verification: {BASE}\n")
    results = []

    status, body = request("/")
    check(results, "dashboard-load", status == 200, f"HTTP {status}")

    status, body = request("/healthz")
    healthy = False
    if status == 200:
        try:
            healthy = json.loads(body).get("status") == "Healthy"
        except json.JSONDecodeError:
            pass
    check(results, "wpww-health", healthy, f"HTTP {status}")

    status, body = request("/api/warroom")
    warroom = None
    if status == 200:
        try:
            warroom = json.loads(body)
        except json.JSONDecodeError:
            warroom = None
    check(results, "warroom-api", isinstance(warroom, dict), f"HTTP {status}")

    if isinstance(warroom, dict):
        radar = warroom.get("radar", {})
        check(
            results,
            "warroom-radar-state",
            radar.get("health") in {"UP", "DOWN", "UNKNOWN"},
            f"health={radar.get('health')}",
        )
        check(
            results,
            "warroom-event-schema",
            isinstance(radar.get("events", []), list),
            f"events={len(radar.get('events', []))}",
        )
        check(
            results,
            "warroom-capability-schema",
            radar.get("capabilities") is None or isinstance(radar.get("capabilities"), dict),
            "capabilities is object or unavailable",
        )

    status, body = request("/api/simulate", method="POST")
    simulation = None
    if status == 200:
        try:
            simulation = json.loads(body)
        except json.JSONDecodeError:
            simulation = None
    check(results, "bounded-simulator", isinstance(simulation, dict), f"HTTP {status}")
    if isinstance(simulation, dict):
        check(
            results,
            "simulator-target-bounded",
            simulation.get("target") == "Security Radar controlled route",
            str(simulation.get("target")),
        )
        check(
            results,
            "simulator-no-arbitrary-target",
            "arbitrary" not in str(simulation).lower(),
            "no arbitrary target field exposed",
        )

    status, body = request("/missing-route-should-be-404")
    check(results, "not-found", status == 404, f"HTTP {status}")

    failed = [r for r in results if not r[1]]
    print("\n" + "=" * 56)
    print(f"WPWW verification: {len(results) - len(failed)}/{len(results)} checks passed")
    if failed:
        print("Failed checks:")
        for name, _, detail in failed:
            print(f" - {name}: {detail}")
        return 1

    print("ALL WPWW CHECKS PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(main())
