import json
import os
import sys
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

BASE_URL = os.getenv("WPWW_URL", "http://127.0.0.1:8080")


def request(path: str, method: str = "GET"):
    req = Request(f"{BASE_URL}{path}", method=method)
    try:
        with urlopen(req, timeout=5) as response:
            raw = response.read().decode("utf-8")
            try:
                body = json.loads(raw)
            except json.JSONDecodeError:
                body = raw
            return response.status, body
    except HTTPError as exc:
        return exc.code, None
    except (URLError, TimeoutError, OSError) as exc:
        raise RuntimeError(f"Kunne ikke nå WPWW: {exc}") from exc


def health():
    status, body = request("/healthz")
    print(f"Health: HTTP {status}")
    print(json.dumps(body, ensure_ascii=False, indent=2))
    return 0 if status == 200 else 1


def status():
    code, body = request("/api/warroom")
    print(f"WarRoom API: HTTP {code}")
    print(json.dumps(body, ensure_ascii=False, indent=2))
    return 0 if code == 200 else 1


def probe():
    code, body = request("/api/simulate", method="POST")
    print(f"Controlled probe: HTTP {code}")
    print(json.dumps(body, ensure_ascii=False, indent=2))
    return 0 if code == 200 and isinstance(body, dict) else 1


def main():
    print("WPWW // WAR ROOM CLI")
    command = sys.argv[1].lower() if len(sys.argv) > 1 else "help"
    try:
        if command == "health":
            return health()
        if command == "status":
            return status()
        if command == "probe":
            return probe()
        print("Usage: python tools/cli.py [health|status|probe|help]")
        return 0
    except RuntimeError as exc:
        print(f"FAIL: {exc}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
