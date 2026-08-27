import os
import time
from datetime import datetime, timezone

import requests

SERVICES = [
    ("WPWW", os.getenv("WPWW_URL", "http://wpww-warroom:8080/healthz")),
    ("Security Radar", os.getenv("RADAR_URL", "http://host.docker.internal:5080/health")),
]
INTERVAL_SECONDS = float(os.getenv("SNIFFER_INTERVAL", "10"))
TIMEOUT_SECONDS = float(os.getenv("SNIFFER_TIMEOUT", "2"))


def check(name: str, url: str) -> dict:
    started = time.perf_counter()
    try:
        response = requests.get(url, timeout=TIMEOUT_SECONDS)
        latency_ms = round((time.perf_counter() - started) * 1000, 2)
        return {
            "timestampUtc": datetime.now(timezone.utc).isoformat(),
            "service": name,
            "url": url,
            "statusCode": response.status_code,
            "healthy": response.ok,
            "latencyMs": latency_ms,
        }
    except requests.RequestException as exc:
        latency_ms = round((time.perf_counter() - started) * 1000, 2)
        return {
            "timestampUtc": datetime.now(timezone.utc).isoformat(),
            "service": name,
            "url": url,
            "statusCode": 0,
            "healthy": False,
            "latencyMs": latency_ms,
            "error": str(exc),
        }


def run() -> None:
    print("WPWW Network Sniffer started")
    while True:
        for name, url in SERVICES:
            result = check(name, url)
            print(result, flush=True)
        time.sleep(INTERVAL_SECONDS)


if __name__ == "__main__":
    run()
