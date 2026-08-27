from __future__ import annotations

import csv
import io
import json
from datetime import datetime, timezone
from html import escape
from pathlib import Path
from typing import Any


def build_report(experiment: dict[str, Any]) -> dict[str, Any]:
    observations = experiment.get("observations") or []
    latencies = [float(o["latency_ms"]) for o in observations if o.get("latency_ms") is not None]
    failed = [o for o in observations if str(o.get("status", "")).upper() in {"FAIL", "ERROR", "DOWN"}]
    return {
        "reportVersion": "1.0",
        "generatedAtUtc": datetime.now(timezone.utc).isoformat(),
        "experiment": experiment,
        "summary": {
            "observationCount": len(observations),
            "failureCount": len(failed),
            "meanLatencyMs": round(sum(latencies) / len(latencies), 2) if latencies else None,
            "maxLatencyMs": round(max(latencies), 2) if latencies else None,
            "status": experiment.get("status", "UNKNOWN"),
        },
    }


def to_json(report: dict[str, Any]) -> str:
    return json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True)


def to_csv(report: dict[str, Any]) -> str:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["experiment_id", "mode", "participant_id", "timestamp_utc", "status", "http_status", "latency_ms"])
    exp = report.get("experiment", {})
    for obs in exp.get("observations", []) or []:
        writer.writerow([
            exp.get("experiment_id"),
            exp.get("mode"),
            obs.get("participant_id"),
            obs.get("timestamp_utc"),
            obs.get("status"),
            obs.get("http_status"),
            obs.get("latency_ms"),
        ])
    return output.getvalue()


def to_html(report: dict[str, Any]) -> str:
    summary = report.get("summary", {})
    rows = []
    for obs in report.get("experiment", {}).get("observations", []) or []:
        rows.append(
            "<tr>" + "".join([
                f"<td>{escape(str(obs.get('participant_id','')))}</td>",
                f"<td>{escape(str(obs.get('status','')))}</td>",
                f"<td>{escape(str(obs.get('http_status','')))}</td>",
                f"<td>{escape(str(obs.get('latency_ms','')))}</td>",
            ]) + "</tr>"
        )
    return f"""<!doctype html>
<html lang=\"en\"><head><meta charset=\"utf-8\"><title>WPWW Lab Report</title>
<style>body{{font-family:Inter,Segoe UI,Arial,sans-serif;background:#08111f;color:#e8eef7;margin:30px}}table{{border-collapse:collapse;width:100%}}th,td{{border:1px solid #29405f;padding:8px;text-align:left}}th{{background:#10233a}}.metric{{display:inline-block;margin-right:24px;padding:14px;border:1px solid #29405f;border-radius:10px}}</style>
</head><body><h1>WPWW Research Lab Report</h1>
<div class=\"metric\">Observations: {summary.get('observationCount')}</div>
<div class=\"metric\">Failures: {summary.get('failureCount')}</div>
<div class=\"metric\">Mean latency: {summary.get('meanLatencyMs')}</div>
<div class=\"metric\">Max latency: {summary.get('maxLatencyMs')}</div>
<table><thead><tr><th>Participant</th><th>Status</th><th>HTTP</th><th>Latency ms</th></tr></thead><tbody>{''.join(rows)}</tbody></table>
</body></html>"""


def write_all(report: dict[str, Any], directory: str = "data/reports") -> dict[str, Path]:
    root = Path(directory)
    root.mkdir(parents=True, exist_ok=True)
    experiment_id = report.get("experiment", {}).get("experiment_id", "wpww-report")
    paths = {
        "json": root / f"{experiment_id}.json",
        "csv": root / f"{experiment_id}.csv",
        "html": root / f"{experiment_id}.html",
    }
    paths["json"].write_text(to_json(report), encoding="utf-8")
    paths["csv"].write_text(to_csv(report), encoding="utf-8")
    paths["html"].write_text(to_html(report), encoding="utf-8")
    return paths
