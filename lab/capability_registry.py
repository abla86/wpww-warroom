"""WPWW unified capability registry.

One source of truth for the capabilities already represented in the repository.
The registry deliberately separates:
  * catalogued        -> declared in a manifest/matrix
  * implemented       -> a local adapter/module exists
  * observed          -> the local runtime exposed the capability
  * verified/tested   -> an actual test proved the integration

Nothing is reported as PASS merely because a name exists in configuration.
"""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
LAB = ROOT / "lab"
MANIFEST = LAB / "plugin-manifest.json"
TOOLS = ROOT / "config" / "tool-matrix.json"
DATABASES = ROOT / "config" / "database-matrix.json"
FEATURES = ROOT / "config" / "feature-profile.json"
RESEARCH = ROOT / "config" / "research-lab.json"


def _read(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
        return value if isinstance(value, dict) else {}
    except (OSError, json.JSONDecodeError):
        return {}


def _module_exists(entrypoint: str | None) -> bool:
    if not entrypoint:
        return False
    path = ROOT / entrypoint
    return path.is_file()


def _plugin_status(plugin: dict[str, Any]) -> str:
    declared = str(plugin.get("status", "UNKNOWN"))
    entrypoint = plugin.get("entrypoint")
    if declared == "ADAPTER_NOT_INSTALLED":
        return declared
    if entrypoint and _module_exists(entrypoint):
        return "IMPLEMENTED"
    if declared == "IMPLEMENTED":
        return "DECLARED_BUT_MISSING"
    return declared


def _tool_status(tool: dict[str, Any]) -> str:
    # A tool matrix is a catalogue, not proof of local installation.
    profile = str(tool.get("profile", tool.get("id", "unknown")))
    import_map = {
        "pytest": "pytest",
        "playwright": "playwright",
    }
    import_name = import_map.get(profile)
    if import_name:
        try:
            return "AVAILABLE" if importlib.util.find_spec(import_name) else "NOT_INSTALLED"
        except (ImportError, ValueError):
            return "NOT_INSTALLED"
    return "CATALOGUED"


def _database_status(database: dict[str, Any]) -> str:
    # External DBs are not assumed reachable. SQLite is available in the Python runtime.
    if database.get("id") == "sqlite":
        return "AVAILABLE"
    return "OPT_IN_NOT_STARTED"


def snapshot() -> dict[str, Any]:
    manifest = _read(MANIFEST)
    tools_matrix = _read(TOOLS)
    databases_matrix = _read(DATABASES)
    features = _read(FEATURES)
    research = _read(RESEARCH)

    raw_plugins = manifest.get("plugins", [])
    plugins = [
        {**plugin, "runtimeStatus": _plugin_status(plugin)}
        for plugin in raw_plugins
        if isinstance(plugin, dict)
    ] if isinstance(raw_plugins, list) else []

    raw_tools = tools_matrix.get("tools", [])
    tools = [
        {**tool, "runtimeStatus": _tool_status(tool)}
        for tool in raw_tools
        if isinstance(tool, dict)
    ] if isinstance(raw_tools, list) else []

    raw_databases = databases_matrix.get("databases", [])
    databases = [
        {**database, "runtimeStatus": _database_status(database)}
        for database in raw_databases
        if isinstance(database, dict)
    ] if isinstance(raw_databases, list) else []

    implemented = sum(p.get("runtimeStatus") == "IMPLEMENTED" for p in plugins)
    adapter_missing = sum(p.get("runtimeStatus") == "ADAPTER_NOT_INSTALLED" for p in plugins)
    tools_available = sum(t.get("runtimeStatus") == "AVAILABLE" for t in tools)
    db_available = sum(d.get("runtimeStatus") == "AVAILABLE" for d in databases)

    return {
        "evidenceRule": "Catalogued is not Verified; Implemented is not PASS without an executed test.",
        "plugins": plugins,
        "tools": tools,
        "databases": databases,
        "config": {
            "featuresPresent": bool(features),
            "researchLabPresent": bool(research),
            "toolsPolicy": tools_matrix.get("policy", {}),
            "databasePolicy": databases_matrix.get("policy", {}),
        },
        "counts": {
            "plugins": len(plugins),
            "implementedPlugins": implemented,
            "adapterNotInstalled": adapter_missing,
            "tools": len(tools),
            "availableTools": tools_available,
            "databases": len(databases),
            "availableDatabases": db_available,
        },
    }


if __name__ == "__main__":
    print(json.dumps(snapshot(), ensure_ascii=False, indent=2, sort_keys=True))
