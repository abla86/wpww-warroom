#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
PLUGIN_ROOT = ROOT / "plugins"
REQUIRED = {"id", "name", "version", "category", "enabledByDefault", "targetPolicy", "entrypoint", "healthcheck", "reportAdapter"}


def load_plugins() -> list[dict[str, Any]]:
    plugins: list[dict[str, Any]] = []
    if not PLUGIN_ROOT.exists():
        return plugins
    for manifest in sorted(PLUGIN_ROOT.glob("*/plugin.json")):
        with manifest.open(encoding="utf-8") as fh:
            data = json.load(fh)
        data["_path"] = str(manifest.parent.relative_to(ROOT))
        plugins.append(data)
    return plugins


def validate(plugin: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    missing = REQUIRED - set(plugin)
    errors.extend(f"missing:{key}" for key in sorted(missing))
    if plugin.get("targetPolicy") != "closed-lab-only":
        errors.append("targetPolicy must be closed-lab-only")
    if plugin.get("enabledByDefault") is not False:
        errors.append("enabledByDefault must be false")
    return errors


def main() -> int:
    plugins = load_plugins()
    seen: set[str] = set()
    failures = 0
    for plugin in plugins:
        plugin_id = str(plugin.get("id", ""))
        if plugin_id in seen:
            print(f"[FAIL] duplicate plugin id: {plugin_id}")
            failures += 1
        seen.add(plugin_id)
        errors = validate(plugin)
        if errors:
            print(f"[FAIL] {plugin_id or plugin.get('_path')}: {', '.join(errors)}")
            failures += 1
        else:
            print(f"[PASS] {plugin_id} ({plugin.get('category')})")
    print(f"plugins={len(plugins)} failures={failures}")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
