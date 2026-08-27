from __future__ import annotations

import json
import sys


def run(plugin_id: str, *, scope: str = "wpww-local") -> int:
    if scope != "wpww-local":
        print(json.dumps({"status": "REJECTED", "reason": "plugin scope must be wpww-local"}))
        return 2
    print(json.dumps({
        "plugin": plugin_id,
        "status": "AVAILABLE",
        "scope": scope,
        "message": "Adapter contract is installed; implementation may be enabled explicitly."
    }))
    return 0


if __name__ == "__main__":
    plugin = sys.argv[1] if len(sys.argv) > 1 else "plugin-stub"
    raise SystemExit(run(plugin))
