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

PORT = int(os.getenv("WPWW_LAB_PORT", "8080"))
DATA_DIR = Path(os.getenv("WPWW_DATA_DIR", "/data"))
USER_FILES_DIR = Path(os.getenv("WPWW_USER_FILES_DIR", str(DATA_DIR / "user_files")))
EVENT_LOG = DATA_DIR / "wpww_events.jsonl"
MAX_EVENTS = int(os.getenv("WPWW_MAX_EVENTS", "1000"))
PERSONALITY = os.getenv("WPWW_PERSONALITY", "cozy")
TELEMETRY_ENABLED = os.getenv("WPWW_ENABLE_TELEMETRY", "true").lower() == "true"

FORBIDDEN_KEYWORDS = [
    "BAD_ACTOR", "DROP TABLE", "OR 1=1", "<script>", "B64:",
    "PATH_TRAVERSAL", "ADMIN_PASS"
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
    "telemetry": TELEMETRY_ENABLED,
    "audio": os.getenv("WPWW_ENABLE_AUDIO", "true").lower() == "true",
    "history": os.getenv("WPWW_ENABLE_HISTORY", "true").lower() == "true",
    "alerts": os.getenv("WPWW_ENABLE_ALERTS", "true").lower() == "true",
    "replay": os.getenv("WPWW_ENABLE_REPLAY", "true").lower() == "true",
    "reports": os.getenv("WPWW_ENABLE_REPORTS", "true").lower() == "true",
    "evolution": os.getenv("WPWW_ENABLE_EVOLUTION", "true").lower() == "true",
    "fileAudit": os.getenv("WPWW_ENABLE_FILE_AUDIT", "true").lower() == "true",
    "databaseLab": os.getenv("WPWW_ENABLE_DATABASE_LAB", "true").lower() == "true",
    "pluginLab": os.getenv("WPWW_ENABLE_PLUGIN_LAB", "true").lower() == "true",
}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def stable_hash(value: object) -> str:
    raw = json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(",", ":")).encode()
    return hashlib.sha256(raw).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def file_inventory() -> dict[str, dict]:
    USER_FILES_DIR.mkdir(parents=True, exist_ok=True)
    result: dict[str, dict] = {}
    for path in sorted(USER_FILES_DIR.rglob("*")):
        if not path.is_file():
            continue
        relative = path.relative_to(USER_FILES_DIR).as_posix()
        stat = path.stat()
        result[relative] = {
            "sha256": sha256_file(path),
            "size": stat.st_size,
            "mtimeUtc": datetime.fromtimestamp(stat.st_mtime, timezone.utc).isoformat(),
        }
    return result


def file_audit() -> dict:
    if not FLAGS["fileAudit"]:
        return {"enabled": False, "clean": None, "fileCount": 0, "files": {}}
    current = file_inventory()
    baseline_path = DATA_DIR / "user_files_baseline.json"
    try:
        baseline = json.loads(baseline_path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        baseline = {}
    added = sorted(set(current) - set(baseline)) if baseline else []
    removed = sorted(set(baseline) - set(current)) if baseline else []
    modified = sorted(
        name for name in set(current) & set(baseline)
        if current[name].get("sha256") != baseline[name].get("sha256")
    ) if baseline else []
    return {
        "enabled": True,
        "directory": str(USER_FILES_DIR),
        "fileCount": len(current),
        "baselinePresent": bool(baseline),
        "added": added,
        "removed": removed,
        "modified": modified,
        "clean": not added and not removed and not modified if baseline else True,
        "files": current,
    }


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
        USER_FILES_DIR.mkdir(parents=True, exist_ok=True)
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
                event = Event(**row)
                self.events.append(event)
                self.previous_hash = event.hash or self.previous_hash
            except (TypeError, ValueError, json.JSONDecodeError):
                continue

    def add(self, *, mode: str, source: str, type_: str, severity: str,
            action: str, status: int, details: dict) -> Event:
        with self.lock:
            event = Event(
                id=f"wpww-{int(time.time() * 1000)}-{random.randrange(16**6):06x}",
                timestampUtc=utc_now(), mode=mode, source=source, type=type_,
                severity=severity, action=action, statusCode=status,
                details=details, previousHash=self.previous_hash,
            )
            event.hash = stable_hash(asdict(event))
            self.previous_hash = event.hash
            self.events.insert(0, event)
            self.events = self.events[:MAX_EVENTS]
            with EVENT_LOG.open("a", encoding="utf-8") as handle:
                handle.write(json.dumps(asdict(event), ensure_ascii=False, separators=(",", ":")) + "\n")
            return event

    def recent(self, limit: int = 100) -> list[dict]:
        with self.lock:
            limit = max(1, min(limit, MAX_EVENTS))
            return [asdict(e) for e in self.events[:limit]]

    def clear(self) -> None:
        with self.lock:
            self.events.clear()
            self.previous_hash = "GENESIS"
            EVENT_LOG.unlink(missing_ok=True)


STORE = Store()
MODE = {"value": "LIVE"}
LOCKDOWN = {"value": False}
ALERT = {"enabled": FLAGS["alerts"], "configured": bool(os.getenv("WPWW_WEBHOOK_URL"))}


def _module_snapshot() -> dict:
    try:
        from module_control import snapshot
        return snapshot()
    except Exception as exc:
        return {"status": "UNKNOWN", "error": str(exc)}


def _module_update(module_id: str, payload: dict) -> dict:
    from module_control import set_module
    kwargs = {key: payload[key] for key in ("selected", "locked", "mode") if key in payload}
    return set_module(module_id, **kwargs)


def _device_snapshot() -> dict:
    if not TELEMETRY_ENABLED:
        return {"status": "NOT_APPLICABLE", "enabled": False}
    try:
        from device_watch import snapshot
        return snapshot()
    except Exception as exc:
        return {"status": "UNKNOWN", "enabled": True, "error": str(exc)}


def _telemetry() -> dict:
    if not TELEMETRY_ENABLED:
        return {"status": "NOT_APPLICABLE", "enabled": False}
    try:
        from telemetry_collector import snapshot
        return snapshot()
    except Exception:
        return _device_snapshot()


def _capabilities() -> dict:
    try:
        from capability_registry import snapshot
        return snapshot()
    except Exception as exc:
        return {"status": "UNKNOWN", "error": str(exc), "tools": [], "databases": {}}


def personality_message(event: dict | None = None) -> str:
    if PERSONALITY != "cozy":
        return "WPWW operational."
    if LOCKDOWN["value"]:
        return "🔒 Lokal lockdown er aktiv. WPWW passer på labben."
    if not event:
        return "☕ WarRoom er online. Giraffen passer på."
    severity = event.get("severity")
    if severity == "CRITICAL":
        return "🚨 Nå følger vi ekstra godt med."
    if severity == "WARNING":
        return random.choice(EASTER_EGGS)
    return "🟢 Alt rolig. Kaffen er varm."


def classify(payload: dict) -> tuple[int, str, str]:
    body = json.dumps(payload, ensure_ascii=False)
    if any(word.lower() in body.lower() for word in FORBIDDEN_KEYWORDS):
        return 403, "BLOCK_403", "WARNING"
    try:
        material_id = int(payload.get("materialId", 0))
    except (TypeError, ValueError):
        return 400, "BAD_REQUEST", "WARNING"
    if material_id <= 0:
        return 404, "NOT_FOUND", "INFO"
    return 200, "ALLOW_200", "INFO"


def local_scenario(scenario: dict) -> dict:
    status, action, severity = classify(scenario["payload"])
    event = STORE.add(
        mode=MODE["value"], source="wpww-lab",
        type_=f"SCENARIO_{scenario['id'].upper()}", severity=severity,
        action=action, status=status,
        details={"scenario": scenario["name"], "payload": scenario["payload"]},
    )
    result = asdict(event)
    result["target"] = "Security Radar controlled route"
    return result


def battle_snapshot() -> dict:
    try:
        from battle_lab import BattleLab
        return {"status": "OBSERVED", **BattleLab().snapshot()}
    except Exception as exc:
        return {"status": "UNKNOWN", "error": str(exc)}


def make_report() -> dict:
    events = STORE.recent(MAX_EVENTS)
    return {
        "generatedAtUtc": utc_now(), "mode": MODE["value"],
        "summary": {
            "totalEvents": len(events),
            "warnings": sum(e["severity"] == "WARNING" for e in events),
            "critical": sum(e["severity"] == "CRITICAL" for e in events),
            "blocked": sum(e["action"].startswith("BLOCK") for e in events),
            "userFiles": file_audit().get("fileCount", 0),
        },
        "files": file_audit(), "modules": _module_snapshot(),
        "telemetry": _telemetry(), "deviceWatch": _device_snapshot(),
        "capabilities": _capabilities(), "battleLab": battle_snapshot(),
        "events": events,
    }


def csv_report(report: dict) -> str:
    buf = io.StringIO(); writer = csv.writer(buf)
    writer.writerow(["id", "timestampUtc", "mode", "source", "type", "severity", "action", "statusCode", "hash"])
    for row in report.get("events", []):
        writer.writerow([row[k] for k in ["id", "timestampUtc", "mode", "source", "type", "severity", "action", "statusCode", "hash"]])
    return buf.getvalue()


def html_report(report: dict) -> str:
    rows = []
    for row in report.get("events", []):
        cells = "".join(f"<td>{html.escape(str(row.get(k, '')))}</td>" for k in ("timestampUtc", "mode", "type", "severity", "action", "statusCode"))
        rows.append(f"<tr>{cells}</tr>")
    return (
        "<!doctype html><html lang='no'><head><meta charset='utf-8'>"
        "<title>WPWW Research Report</title>"
        "<style>body{font-family:system-ui;padding:2rem;background:#10151c;color:#e5eef7}"
        "table{width:100%;border-collapse:collapse}th,td{padding:.5rem;border-bottom:1px solid #334155;text-align:left}</style>"
        f"</head><body><h1>WPWW Research Report</h1><p>Generated: {html.escape(report['generatedAtUtc'])}</p>"
        f"<pre>{html.escape(json.dumps(report['summary'], ensure_ascii=False, indent=2))}</pre>"
        "<table><thead><tr><th>Time</th><th>Mode</th><th>Type</th><th>Severity</th><th>Action</th><th>Status</th></tr></thead>"
        f"<tbody>{''.join(rows)}</tbody></table></body></html>"
    )


def evolution_run(steps: int = 12) -> dict:
    steps = max(1, min(int(steps), 100))
    weights = {scenario["id"]: 1.0 for scenario in SCENARIOS}
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

    def _read_json(self) -> dict:
        try:
            length = max(0, min(int(self.headers.get("Content-Length", "0")), 1_000_000))
        except (TypeError, ValueError):
            raise ValueError("Invalid Content-Length")
        raw = self.rfile.read(length)
        if not raw:
            return {}
        value = json.loads(raw.decode("utf-8", errors="strict"))
        if not isinstance(value, dict):
            raise ValueError("JSON object required")
        return value

    def do_GET(self) -> None:
        path = self.path.split("?", 1)[0]
        if path in ("/", "/index.html"):
            return self._json(200, {"service": "WPWW Unified War Room", "status": "UP", "message": personality_message()})
        if path == "/healthz":
            return self._json(200, {"status": "Healthy", "service": "WPWW Unified War Room", "mode": MODE["value"], "lockdown": LOCKDOWN["value"], "modules": _module_snapshot(), "telemetry": _telemetry(), "capabilities": _capabilities()})
        if path == "/audit-logs": return self._json(200, STORE.recent())
        if path == "/api/warroom":
            return self._json(200, {"timestampUtc": utc_now(), "wpww": {"mode": MODE["value"], "lockdown": LOCKDOWN["value"], "flags": FLAGS, "alerts": ALERT}, "message": personality_message(), "files": file_audit(), "modules": _module_snapshot(), "telemetry": _telemetry(), "capabilities": _capabilities(), "battleLab": battle_snapshot(), "radar": {"health": "UP", "api": "UP", "events": STORE.recent(50)}})
        if path == "/api/modules": return self._json(200, _module_snapshot())
        if path == "/api/telemetry": return self._json(200, _device_snapshot())
        if path == "/api/capabilities": return self._json(200, _capabilities())
        if path == "/api/incidents": return self._json(200, {"mode": MODE["value"], "incidents": STORE.recent(100)})
        if path == "/api/files": return self._json(200, file_audit())
        if path == "/api/device-watch": return self._json(200, _device_snapshot())
        if path == "/api/tools": return self._json(200, _capabilities().get("tools", []))
        if path == "/api/databases": return self._json(200, _capabilities().get("databases", {}))
        if path == "/api/battle": return self._json(200, battle_snapshot())
        if path == "/api/report.json": return self._json(200, make_report())
        if path == "/api/report.csv":
            raw = csv_report(make_report()).encode(); self.send_response(200); self.send_header("Content-Type", "text/csv; charset=utf-8"); self.end_headers(); self.wfile.write(raw); return
        if path == "/api/report.html":
            raw = html_report(make_report()).encode(); self.send_response(200); self.send_header("Content-Type", "text/html; charset=utf-8"); self.end_headers(); self.wfile.write(raw); return
        if path == "/help":
            raw = ("WPWW Unified War Room\n\nLIVE/DEMO: POST /api/mode\nScenario: POST /api/scenario\nEvolution: POST /api/evolution\nModules: GET /api/modules, POST /api/modules/<id>\nTelemetry: GET /api/telemetry\nCapabilities: GET /api/capabilities\nBattleLab: GET /api/battle\nTools: GET /api/tools\nDatabases: GET /api/databases\nFiles: GET /api/files, POST /api/files/baseline\nReports: /api/report.json /api/report.csv /api/report.html\nIncidents: /api/incidents\nLockdown: POST /api/lockdown\nReset: POST /api/reset\n").encode(); self.send_response(200); self.send_header("Content-Type", "text/plain; charset=utf-8"); self.end_headers(); self.wfile.write(raw); return
        return self._json(404, {"error": "Route not found", "status": "NOT_FOUND"})

    def do_POST(self) -> None:
        path = self.path.split("?", 1)[0]
        try:
            payload = self._read_json()
        except (ValueError, UnicodeDecodeError, json.JSONDecodeError) as exc:
            return self._json(400, {"error": "Invalid JSON request", "detail": str(exc), "status": "BAD_REQUEST"})
        if path == "/api/mode":
            mode = str(payload.get("mode", "")).upper()
            if mode not in {"LIVE", "DEMO"}: return self._json(400, {"error": "mode must be LIVE or DEMO", "status": "BAD_REQUEST"})
            MODE["value"] = mode; STORE.add(mode=mode, source="control-panel", type_="MODE_CHANGE", severity="INFO", action="MODE_UPDATED", status=200, details={"mode": mode}); return self._json(200, {"mode": mode, "status": "UPDATED"})
        if path == "/api/lockdown":
            LOCKDOWN["value"] = True; STORE.add(mode=MODE["value"], source="control-panel", type_="LOCKDOWN", severity="WARNING", action="LOCKDOWN_ENABLED", status=200, details={}); return self._json(200, {"lockdown": True, "status": "UPDATED"})
        if path == "/api/lockdown/reset":
            LOCKDOWN["value"] = False; STORE.add(mode=MODE["value"], source="control-panel", type_="LOCKDOWN", severity="INFO", action="LOCKDOWN_DISABLED", status=200, details={}); return self._json(200, {"lockdown": False, "status": "UPDATED"})
        if path == "/api/reset": STORE.clear(); return self._json(200, {"status": "RESET"})
        if path in {"/api/simulate", "/api/scenario"}:
            scenario_id = "deception" if path == "/api/simulate" else str(payload.get("scenario", "deception")).strip()
            scenario = next((item for item in SCENARIOS if item["id"] == scenario_id), None)
            if scenario is None: return self._json(404, {"error": "Unknown scenario", "status": "NOT_FOUND"})
            return self._json(200, local_scenario(scenario))
        if path == "/api/evolution":
            try: steps = int(payload.get("steps", 12))
            except (TypeError, ValueError): return self._json(400, {"error": "steps must be an integer", "status": "BAD_REQUEST"})
            return self._json(200, evolution_run(steps))
        if path.startswith("/api/modules/"):
            module_id = path.removeprefix("/api/modules/").strip()
            if not module_id: return self._json(400, {"error": "module id required", "status": "BAD_REQUEST"})
            try: result = _module_update(module_id, payload)
            except Exception as exc: return self._json(500, {"error": "Module update failed", "detail": str(exc), "status": "ERROR"})
            STORE.add(mode=MODE["value"], source="module-control", type_="MODULE_CHANGE", severity="INFO", action="MODULE_UPDATED", status=200, details={"module": module_id, "changes": payload}); return self._json(200, result)
        if path == "/api/files/baseline":
            baseline_path = DATA_DIR / "user_files_baseline.json"; baseline_path.parent.mkdir(parents=True, exist_ok=True); inventory = file_inventory(); baseline_path.write_text(json.dumps(inventory, indent=2, ensure_ascii=False), encoding="utf-8"); STORE.add(mode=MODE["value"], source="file-audit", type_="FILE_BASELINE", severity="INFO", action="BASELINE_UPDATED", status=200, details={"path": str(baseline_path), "fileCount": len(inventory)}); return self._json(200, {"status": "BASELINE_UPDATED", "files": inventory})
        if path == "/api/alerts/test":
            configured = bool(os.getenv("WPWW_WEBHOOK_URL")); STORE.add(mode=MODE["value"], source="alerting", type_="ALERT_TEST", severity="INFO", action="ALERT_TESTED", status=200, details={"configured": configured}); return self._json(200, {"status": "TESTED", "configured": configured})
        return self._json(404, {"error": "Route not found", "status": "NOT_FOUND"})


def run() -> None:
    server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print(f"WPWW War Room listening on :{PORT}")
    server.serve_forever()


if __name__ == "__main__":
    run()
