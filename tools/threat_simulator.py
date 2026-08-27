import os
import time
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

BASE_URL = os.getenv("WPWW_URL", "http://wpww-warroom:8080")
INTERVAL = max(5, int(os.getenv("SIMULATOR_INTERVAL", "15")))


def run_probe() -> None:
    req = Request(f"{BASE_URL}/api/simulate", method="POST")
    try:
        with urlopen(req, timeout=8) as response:
            print(f"[WPWW SIM] controlled probe -> HTTP {response.status}")
    except HTTPError as exc:
        print(f"[WPWW SIM] upstream HTTP error -> {exc.code}")
    except (URLError, TimeoutError, OSError) as exc:
        print(f"[WPWW SIM] WPWW unavailable -> {exc}")


def main() -> None:
    print(f"WPWW Threat Simulator | interval={INTERVAL}s | target=WPWW only")
    while True:
        run_probe()
        time.sleep(INTERVAL)


if __name__ == "__main__":
    main()
