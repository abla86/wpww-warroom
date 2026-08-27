"""WPWW unified capability registry.

Provides one read-only inventory of the capabilities that exist in the repo and
clearly separates implementation status from verification status. This keeps the
WarRoom honest: a configured adapter is not automatically a working adapter.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "lab" / "plugin-manifest.json"
TOOLS = ROOT / "config" / "tool-matrix.json"
DATABASES = ROOT / "config" / "database-matrix.json"


def _read(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
        return value if isinstance(value, dict) else {}
    except (OSError, json.JSONDecodeError):
        return {}


def snapshot() -> dict[str, Any]:
    manifest = _read(MANIFEST)
    tools = _read(TOOLS)
    databases = _read(DATABASES)
    plugins = manifest.get("plugins", [])
    return {
        "evidenceRule": "Do not convert IMPLEMENTED to PASS without an executed test.",
        "plugins": plugins if isinstance(plugins, list) else [],
        "tools": tools.get("tools", []) if isinstance(tools.get("tools", []), list) else [],
        "databases": databases,
        "counts": {
            "plugins": len(plugins) if isinstance(plugins, list) else 0,
            "tools": len(tools.get("tools", [])) if isinstance(tools.get("tools", []), list) else 0,
            "adapterNotInstalled": sum(
                1 for p in plugins
                if isinstance(p, dict) and p.get("status") == "ADAPTER_NOT_INSTALLED"
            ) if isinstance(plugins, list) else 0,
        },
    }
