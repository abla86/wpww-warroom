from __future__ import annotations

import csv
import hashlib
import html
import io
import json
import os
import random
import time
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Lock
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

PORT = int(os.getenv("WPWW_LAB_PORT", "8085"))
DATA_DIR = Path(os.getenv("WPWW_DATA_DIR", "/data"))
EVENT_LOG = DATA_DIR / "wpww_events.jsonl"
MAX_EVENTS = int(os.getenv("WPWW_MAX_EVENTS", "1000"))
PERSONALITY = os.getenv("WPWW_PERSONALITY", "cozy")

FORBIDDEN_KEYWORDS = [
    "BAD_ACTOR", "DROP TABLE", "OR 1=1", "<script>", "B64:", "PATH_TRAVERSAL", "ADMIN_PASS"
]

EASTER_EGGS = [
    "Giraffen passer på. Finn din egen bug.",
    "403. Dask på lanken. WPWW holder døren.",
    "Probe fanget. Kaffen er fortsatt varm.",
]

SCENARIOS = [
    {"id": "clean", "name": "Clean traffic", "payload": {"materialId": 1, "companyId": "NORMAL_USER_TEST"}},
    {"id": "deception", "name": "Controlled deception", "payload": {"materialId": 99, "companyId": "BAD_ACTOR_PROBE"}},
    {"id": "malformed", "name": "Malformed payload", "payload": {"materialId": -1, "companyId": "DROP TABLE TEST"}},
    {"id": "encoded", "name": "Encoded marker", "payload": {"materialId": 42, "companyId": "B64:CONTROLLED_TEST"}},
]

FLAGS = {
    "simulator": os.getenv("WPWW_ENABLE_SIMULATOR", "true").lower() == "true",
    "telemetry": os.getenv("WPWW_ENABLE_TELEMETRY", "false").lower() == "true",
    "audio": os.getenv("WPWW_ENABLE_AUDIO", "true").lower() == "true",
    "history": os.getenv("WPWW_ENABLE_HISTORY", "true").lower() == "true",
    "alerts": os.getenv("WPWW_ENABLE_ALERTS", "true").lower() == "true",
    "replay": os.getenv("WPWW_ENABLE_REPLAY", "true").lower() == "true",
    "reports": os.getenv("WPWW_ENABLE_REPORTS", "true").lower() == "true",
    "evolution": os.getenv("WPWW_ENABLE_EVOLUTION", "true").lower() == "true",
}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def stable_hash(value: object) -> str:
    raw = json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(",", ":")).encode()
    return hashlib.sha256(raw).hexdigest()


@dataclass
class Event:
    id: str
    timestampUtc: str
    mode: str
    source: str
    type: str
    severity: str
    action: str
    statusCode: int
    details: dict
    previousHash: str
    hash: str = ""


class Store:
    def __init__(self) -> None:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        self.lock = Lock()
        self.events: list[Event] = []
        self.previous_hash = "GENESIS"
        self._load()

    def _load(self) -> None:
        if not EVENT_LOG.exists():
            return
        for line in EVENT_LOG.read_text(encoding="utf-8").splitlines()[-MAX_EVENTS:]:
            try:
                row = json.loads(line)
                self.events.append(Event(**row))
                self.previous_hash = row.get("hash") or self.previous_hash
            except (TypeError, ValueError, json.JSONDecodeError):
                continue

    def add(self, *, mode: str, source: str, type_: str, severity: str, action: str, status: int, details: dict) -> Event:
        with self.lock:
            event = Event(
                id=f"wpww-{int(time.time()*1000)}-{random.randrange(16**6):06x}",
                timestampUtc=utc_now(),
                mode=mode,
                source=source,
                type=type_,
                severity=severity,
                action=action,
                statusCode=status,
                details=details,
                previousHash=self.previous_hash,
            )
            material = asdict(event)
            event.hash = stable_hash(material)
            self.previous_hash = event.hash
            self.events.insert(0, event)
            self.events = self.events[:MAX_EVENTS]
            with EVENT_LOG.open("a", encoding="utf-8") as handle:
                handle.write(json.dumps(asdict(event), ensure_ascii=False, separators=(",", ":")) + "\n")
            return event

    def recent(self, limit: int = 100) -> list[dict]:
        with self.lock:
            return [asdict(e) for e in self.events[: max(1, min(limit, MAX_EVENTS))]]

    def clear(self) -> None:
        with self.lock:
            self.events.clear()
            self.previous_hash = "GENESIS"
            EVENT_LOG.unlink(missing_ok=True)


STORE = Store()
MODE = {"value": "LIVE"}
LOCKDOWN = {"value": False}
ALERT = {"enabled": FLAGS["alerts"], "configured": bool(os.getenv("WPWW_WEBHOOK_URL"))}


def personality_message(event: dict | None = None) -> str:
    if PERSONALITY != "cozy":
        return "WPWW operational."
    if LOCKDOWN["value"]:
        return "🔒 Lokal lockdown er aktiv. WPWW passer på labben."
    if not event:
        return "☕ WarRoom er online. Giraffen passer på."
    sev = event.get("severity")
    if sev == "CRITICAL":
        return "🚨 Nå følger vi ekstra godt med."
    if sev == "WARNING":
        return random.choice(EASTER_EGGS)
    return "🟢 Alt rolig. Kaffen er varm."


def classify(payload: dict) -> tuple[int, str, str]:
    body = json.dumps(payload, ensure_ascii=False)
    threat = any(word.lower() in body.lower() for word in FORBIDDEN_KEYWORDS)
    if threat:
        return 403, "BLOCK_403", "WARNING"
    if int(payload.get("materialId", 0)) <= 0:
        return 404, "NOT_FOUND", "INFO"
    return 200, "ALLOW_200", "INFO"


def local_scenario(scenario: dict) -> dict:
    status, action, severity = classify(scenario["payload"])
    event = STORE.add(
        mode=MODE["value"] if not (MODE["value"] == "LIVE" and scenario["id"] != "clean") else "SIMULATED",
        source="wpww-lab",
        type_=f"SCENARIO_{scenario['id'].upper()}",
        severity=severity,
        action=action,
        status=status,
        details={"scenario": scenario["name"], "payload": scenario["payload"], "easterEgg": personality_message({"severity": severity})},
    )
    return asdict(event)


def csv_report(report: dict) -> str:
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["id", "timestampUtc", "mode", "source", "type", "severity", "action", "statusCode", "hash"])
    for row in report.get("events", []):
        writer.writerow([row["id"], row["timestampUtc"], row["mode"], row["source"], row["type"], row["severity"], row["action"], row["statusCode"], row["hash"]])
    return buf.getvalue()


def html_report(report: dict) -> str:
    rows = []
    for row in report.get("events", []):
        rows.append("<tr>" + "".join(f"<td>{html.escape(str(row.get(k, '')))}</td>" for k in ("timestampUtc", "mode", "type", "severity", "action", "statusCode")) + "</tr>")
    return """<!doctype html><html lang='no'><head><meta charset='utf-8'><title>WPWW Research Report</title><style>body{font-family:system-ui;padding:2rem;background:#10151c;color:#e5eef7}table{width:100%;border-collapse:collapse}th,td{padding:.5rem;border-bottom:1px solid #334155;text-align:left}</style></head><body><h1>WPWW Research Report</h1><p>Generated: %s</p><table><thead><tr><th>Time</th><th>Mode</th><th>Type</th><th>Severity</th><th>Action</th><th>Status</th></tr></thead><tbody>%s</tbody></table></body></html>""" % (html.escape(report["generatedAtUtc"]), "".join(rows))


def make_report() -> dict:
    events = STORE.recent(MAX_EVENTS)
    return {
        "generatedAtUtc": utc_now(),
        "mode": MODE["value"],
        "summary": {
            "totalEvents": len(events),
            "warnings": sum(e["severity"] == "WARNING" for e in events),
            "critical": sum(e["severity"] == "CRITICAL" for e in events),
            "blocked": sum(e["action"].startswith("BLOCK") for e in events),
        },
        "events": events,
    }


def evolution_run(steps: int = 12) -> dict:
    steps = max(1, min(steps, 100))
    weights = {s["id"]: 1.0 for s in SCENARIOS}
    observations = []
    for _ in range(steps):
        selected = random.choice(SCENARIOS) if random.random() < 0.20 else max(SCENARIOS, key=lambda s: weights[s["id"]])
        event = local_scenario(selected)
        reward = 0.1 if event["statusCode"] in (200, 404) else -0.1
        weights[selected["id"]] = round(max(0.1, weights[selected["id"]] + reward), 4)
        observations.append({"scenario": selected["id"], "reward": reward, "statusCode": event["statusCode"], "weights": dict(weights)})
    return {"steps": steps, "weights": weights, "observations": observations}


class Handler(BaseHTTPRequestHandler):
    def _json(self, status: int, data: dict | list) -> None:
        raw = json.dumps(data, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(raw)

    def do_GET(self) -> None:
        path = self.path.split("?", 1)[0]
        if path in ("/", "/index.html"):
            payload = {"service": "WPWW Unified Lab", "status": "UP", "message": personality_message()}
            self._json(200, payload)
        elif path == "/healthz":
            self._json(200, {"status": "Healthy", "service": "WPWW Unified Lab", "mode": MODE["value"], "lockdown": LOCKDOWN["value"]})
        elif path == "/audit-logs":
            self._json(200, STORE.recent())
        elif path == "/help":
            text = "WPWW Unified Lab\n\nModes: LIVE/DEMO\nScenario API: POST /api/scenario\nEvolution API: POST /api/evolution\nReports: /api/report.json /api/report.csv /api/report.html\nIncidents: /api/incidents\nReset: POST /api/reset\nLockdown: POST /api/lockdown\n"
            self.send_response(200); self.send_header("Content-Type", "text/plain; charset=utf-8"); self.end_headers(); self.wfile.write(text.encode())
        elif path == "/api/warroom":
            self._json(200, {"timestampUtc": utc_now(), "wpww": {"mode": MODE["value"], "lockdown": LOCKDOWN["value"], "flags": FLAGS, "alerts": ALERT}, "message": personality_message(), "radar": {"health": "UP", "api": "UP", "events": STORE.recent(50)}})
        elif path == "/api/incidents":
            self._json(200, {"mode": MODE["value"], "incidents": STORE.recent(100)})
        elif path == "/api/report.json":
            self._json(200, make_report())
        elif path == "/api/report.csv":
            raw = csv_report(make_report()).encode(); self.send_response(200); self.send_header("Content-Type", "text/csv; charset=utf-8"); self.end_headers(); self.wfile.write(raw)
        elif path == "/api/report.html":
            raw = html_report(make_report()).encode(); self.send_response(200); self.send_header("Content-Type", "text/html; charset=utf-8"); self.end_headers(); self.wfile.write(raw)
        else:
            self._json(404, {"error": "Route not found", "code": 404})

    def do_POST(self) -> None:
        path = self.path.split("?", 1)[0]
        length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(length) if length else b"{}"
        try:
            payload = json.loads(body.decode("utf-8"))
        except json.JSONDecodeError:
            payload = {}

        if path == "/api/mode":
            requested = str(payload.get("mode", "LIVE")).upper()
            if requested not in {"LIVE", "DEMO"}:
                return self._json(400, {"error": "mode must be LIVE or DEMO"})
            MODE["value"] = requested
            event = STORE.add(mode=requested, source="mission-control", type_="MODE_CHANGED", severity="INFO", action="MODE_SET", status=200, details={"mode": requested})
            return self._json(200, {"mode": requested, "eventId": event.id})

        if path == "/api/scenario":
            if not FLAGS["simulator"]:
                return self._json(409, {"error": "Simulator disabled"})
            scenario_id = str(payload.get("scenario", "clean"))
            scenario = next((s for s in SCENARIOS if s["id"] == scenario_id), None)
            if scenario is None:
                return self._json(400, {"error": "Unknown controlled scenario"})
            return self._json(200, local_scenario(scenario))

        if path == "/api/evolution":
            if not FLAGS["evolution"]:
                return self._json(409, {"error": "Evolution disabled"})
            steps = int(payload.get("steps", 12))
            return self._json(200, evolution_run(steps))

        if path == "/api/lockdown":
            LOCKDOWN["value"] = True
            event = STORE.add(mode=MODE["value"], source="mission-control", type_="LOCAL_LOCKDOWN", severity="CRITICAL", action="LOCAL_ONLY_LOCKDOWN", status=200, details={"externalSystemsAffected": False})
            return self._json(200, {"lockdown": True, "externalSystemsAffected": False, "eventId": event.id})

        if path == "/api/lockdown/reset":
            LOCKDOWN["value"] = False
            event = STORE.add(mode=MODE["value"], source="mission-control", type_="LOCAL_LOCKDOWN_RESET", severity="INFO", action="RESET", status=200, details={"externalSystemsAffected": False})
            return self._json(200, {"lockdown": False, "eventId": event.id})

        if path == "/api/history/clear" or path == "/api/reset":
            STORE.clear()
            return self._json(200, {"cleared": True})

        if path == "/api/alerts/test":
            event = STORE.add(mode=MODE["value"], source="mission-control", type_="ALERT_TEST", severity="WARNING", action="ALERT_TEST", status=200, details={"configured": ALERT["configured"]})
            return self._json(200, {"eventId": event.id, "alert": {"enabled": ALERT["enabled"], "configured": ALERT["configured"]}})

        self._json(404, {"error": "Route not found", "code": 404})

    def log_message(self, fmt: str, *args) -> None:
        print(f"[WPWW] {fmt % args}")


def run() -> None:
    server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print(f"☕ WPWW Unified Lab online on :{PORT} — {personality_message()}")
    server.serve_forever()


if __name__ == "__main__":
    run()
