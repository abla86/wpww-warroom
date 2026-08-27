from __future__ import annotations

import csv
import io
import json
from datetime import datetime, timezone
from html import escape


def build_report(events: list[dict], title: str = "WPWW War Room Report") -> dict:
    threats = [e for e in events if str(e.get("severity", "")).upper() in {"WARNING", "CRITICAL"}]
    return {
        "title": title,
        "generatedAtUtc": datetime.now(timezone.utc).isoformat(),
        "summary": {
            "totalEvents": len(events),
            "threatEvents": len(threats),
            "criticalEvents": sum(1 for e in threats if str(e.get("severity", "")).upper() == "CRITICAL"),
        },
        "events": events,
    }


def to_json(report: dict) -> str:
    return json.dumps(report, ensure_ascii=False, indent=2)


def to_csv(report: dict) -> str:
    rows = report.get("events", [])
    output = io.StringIO()
    fields = sorted({key for row in rows for key in row.keys()}) if rows else ["eventId", "timestampUtc", "type", "severity", "mode"]
    writer = csv.DictWriter(output, fieldnames=fields)
    writer.writeheader()
    for row in rows:
        writer.writerow({field: json.dumps(row[field], ensure_ascii=False) if isinstance(row.get(field), (dict, list)) else row.get(field, "") for field in fields})
    return output.getvalue()


def to_html(report: dict) -> str:
    rows = report.get("events", [])
    body = "".join(
        f"<tr><td>{escape(str(e.get('timestampUtc', '')))}</td><td>{escape(str(e.get('type', e.get('scenario', ''))))}</td><td>{escape(str(e.get('severity', '')))}</td><td>{escape(str(e.get('mode', '')))}</td></tr>"
        for e in rows
    )
    return f"""<!doctype html>
<html lang='en'>
<head><meta charset='utf-8'><title>{escape(report['title'])}</title><style>
body{{font-family:system-ui,sans-serif;margin:32px;background:#0b1020;color:#eef2ff}}
.card{{padding:18px;border:1px solid #27324a;border-radius:12px;background:#11182a;margin-bottom:18px}}
table{{width:100%;border-collapse:collapse}}th,td{{padding:9px;border-bottom:1px solid #27324a;text-align:left}}
</style></head><body><div class='card'><h1>{escape(report['title'])}</h1><p>Generated: {escape(report['generatedAtUtc'])}</p><p>Total events: {report['summary']['totalEvents']} · Threat events: {report['summary']['threatEvents']} · Critical: {report['summary']['criticalEvents']}</p></div><div class='card'><table><thead><tr><th>Time</th><th>Type</th><th>Severity</th><th>Mode</th></tr></thead><tbody>{body}</tbody></table></div></body></html>"""
