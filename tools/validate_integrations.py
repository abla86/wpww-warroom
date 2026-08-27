#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def load(name: str) -> dict:
    path = ROOT / "config" / name
    with path.open(encoding="utf-8") as fh:
        return json.load(fh)


def unique_ids(items: list[dict]) -> bool:
    ids = [item.get("id") for item in items]
    return len(ids) == len(set(ids)) and all(ids)


def main() -> int:
    db = load("database-matrix.json")
    tools = load("tool-matrix.json")
    profiles = load("feature-profile.json")

    databases = db.get("databases", [])
    integrations = tools.get("tools", [])
    errors: list[str] = []

    if not db.get("defaultEnabled") is False:
        errors.append("database-matrix must default to disabled")
    if not tools.get("defaultEnabled") is False:
        errors.append("tool-matrix must default to disabled")
    if not unique_ids(databases):
        errors.append("database IDs must be unique and non-empty")
    if not unique_ids(integrations):
        errors.append("tool IDs must be unique and non-empty")

    for policy_name, policy in (("database", db.get("policy", {})), ("tool", tools.get("policy", {}))):
        if policy.get("secretsViaEnvironment") is False:
            errors.append(f"{policy_name} policy must require secrets via environment")
        if policy.get("optInOnly") is False:
            errors.append(f"{policy_name} policy must remain opt-in")

    profile_map = profiles.get("profiles", {})
    if "minimal" not in profile_map or profile_map["minimal"] != ["core"]:
        errors.append("minimal profile must contain only core")
    if profiles.get("default") != "minimal":
        errors.append("default profile must remain minimal")

    if errors:
        for error in errors:
            print(f"[FAIL] {error}")
        return 1

    print(f"[PASS] databases={len(databases)} tools={len(integrations)} profiles={len(profile_map)}")
    print("[PASS] All optional integrations are policy-gated and disabled by default.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
