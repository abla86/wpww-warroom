from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "lab" / "plugin-manifest.json"
STUB = ROOT / "plugins" / "plugin_stub.py"
REQUIRED_KEYS = {"id", "name", "side", "kind", "entrypoint", "enabled"}
VALID_SIDES = {"red", "blue", "data", "observability", "reporting"}


def main() -> int:
    if not MANIFEST.is_file():
        print("[FAIL] plugin manifest missing")
        return 1
    if not STUB.is_file():
        print("[FAIL] plugin stub missing")
        return 1

    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    if data.get("scope") != "wpww-local":
        print("[FAIL] manifest scope is not wpww-local")
        return 1

    plugins = data.get("plugins")
    if not isinstance(plugins, list) or not plugins:
        print("[FAIL] no plugins registered")
        return 1

    ids: set[str] = set()
    failed = 0
    for plugin in plugins:
        if not REQUIRED_KEYS.issubset(plugin):
            print(f"[FAIL] missing keys: {plugin}")
            failed += 1
            continue
        if plugin["id"] in ids:
            print(f"[FAIL] duplicate id: {plugin['id']}")
            failed += 1
        ids.add(plugin["id"])
        if plugin["side"] not in VALID_SIDES:
            print(f"[FAIL] invalid side: {plugin['id']}")
            failed += 1
        entrypoint = ROOT / plugin["entrypoint"]
        # Core implementations must exist. Explicitly disabled adapters may point to a
        # documented adapter path that will be created before enabling it.
        if plugin["enabled"] and not entrypoint.is_file():
            print(f"[FAIL] enabled entrypoint missing: {plugin['id']} -> {entrypoint}")
            failed += 1
        elif not entrypoint.is_file():
            print(f"[INFO] disabled adapter not implemented: {plugin['id']}")
        else:
            print(f"[PASS] {plugin['id']}")

    print(f"Validated {len(plugins)} plugin definitions")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
