"""WPWW WarRoom - Interaktiv lærings- og simuleringsmatrise.

This module is deliberately data-driven. It does not execute arbitrary commands,
launch external attack tools, or alter host security controls. It records the
learning model, selectable scenarios, references, and empirical evidence state
used by the WPWW local laboratory.

Evidence is never promoted automatically. A module being present or enabled is
not evidence that it has been tested successfully.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, asdict, field
from pathlib import Path
from threading import RLock
from typing import Any

try:
    from .quality_evidence import Evidence, EvidenceStatus, quality_refs
except ImportError:  # direct execution from /app/lab
    from quality_evidence import Evidence, EvidenceStatus, quality_refs


ROOT = Path(__file__).resolve().parent
MATRIX_PATH = Path(__import__("os").getenv("WPWW_LEARNING_MATRIX", "/data/learning_matrix.json"))
_LOCK = RLock()


@dataclass(frozen=True)
class MatrixEntry:
    id: str
    name: str
    side: str
    category: str
    level: str
    description: str
    objective: str
    quality_standards: tuple[str, ...]
    evidence: Evidence
    tags: tuple[str, ...] = field(default_factory=tuple)
    enabled: bool = True

    def to_dict(self) -> dict[str, Any]:
        value = asdict(self)
        value["quality_standards"] = list(self.quality_standards)
        value["tags"] = list(self.tags)
        value["evidence"] = self.evidence.to_dict()
        return value


DEFAULT_ENTRIES: tuple[MatrixEntry, ...] = (
    MatrixEntry(
        id="red-controlled-probe",
        name="Controlled Probe",
        side="red",
        category="scenario",
        level="beginner",
        description="A deterministic local probe used to test the defensive decision path.",
        objective="Verify that a known test condition is detected and recorded.",
        quality_standards=quality_refs("web"),
        evidence=Evidence.now(
            EvidenceStatus.OBSERVED,
            source="WPWW matrix definition",
            method="Static configuration review",
            notes="Scenario is defined; runtime success still requires a real test.",
        ),
        tags=("red", "probe", "deterministic"),
    ),
    MatrixEntry(
        id="red-malformed-input",
        name="Malformed Input Lab",
        side="red",
        category="input-testing",
        level="intermediate",
        description="Controlled malformed input for validating error handling and resilience.",
        objective="Confirm invalid input is rejected deterministically and logged.",
        quality_standards=quality_refs("web"),
        evidence=Evidence.now(
            EvidenceStatus.NOT_TESTED,
            source="WPWW matrix definition",
            method="Awaiting runtime verification",
        ),
        tags=("red", "validation", "400"),
    ),
    MatrixEntry(
        id="blue-security-radar",
        name="Security Radar",
        side="blue",
        category="detection",
        level="intermediate",
        description="WPWW detection layer for controlled lab traffic and deception scenarios.",
        objective="Detect defined conditions and produce auditable events.",
        quality_standards=quality_refs("web"),
        evidence=Evidence.now(
            EvidenceStatus.OBSERVED,
            source="lab/wpww_unit.py",
            method="Code inspection",
            reference="WPWW runtime classifier",
        ),
        tags=("blue", "detection", "radar"),
    ),
    MatrixEntry(
        id="blue-file-integrity",
        name="File Integrity Audit",
        side="blue",
        category="integrity",
        level="beginner",
        description="SHA-256 inventory and baseline comparison for files exposed to the lab.",
        objective="Detect additions, removals, or modifications against a known baseline.",
        quality_standards=quality_refs("data"),
        evidence=Evidence.now(
            EvidenceStatus.OBSERVED,
            source="lab/wpww_unit.py",
            method="Code inspection",
            reference="file_inventory/file_audit",
        ),
        tags=("blue", "integrity", "sha256"),
    ),
)


def _default_state() -> dict[str, Any]:
    return {
        "version": "1.0",
        "entries": [entry.to_dict() for entry in DEFAULT_ENTRIES],
        "selection": {},
    }


def load_matrix() -> dict[str, Any]:
    with _LOCK:
        if not MATRIX_PATH.exists():
            return _default_state()
        try:
            data = json.loads(MATRIX_PATH.read_text(encoding="utf-8"))
            if not isinstance(data, dict) or not isinstance(data.get("entries"), list):
                return _default_state()
            return data
        except (OSError, json.JSONDecodeError):
            return _default_state()


def save_matrix(data: dict[str, Any]) -> None:
    with _LOCK:
        MATRIX_PATH.parent.mkdir(parents=True, exist_ok=True)
        temp = MATRIX_PATH.with_suffix(".tmp")
        temp.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
        temp.replace(MATRIX_PATH)


def entries(side: str | None = None, level: str | None = None) -> list[dict[str, Any]]:
    rows = load_matrix().get("entries", [])
    if side:
        rows = [row for row in rows if str(row.get("side", "")).lower() == side.lower()]
    if level:
        rows = [row for row in rows if str(row.get("level", "")).lower() == level.lower()]
    return rows


def select(entry_id: str, selected: bool = True) -> dict[str, Any]:
    with _LOCK:
        data = load_matrix()
        known = {row.get("id") for row in data.get("entries", [])}
        if entry_id not in known:
            raise KeyError(f"Unknown matrix entry: {entry_id}")
        data.setdefault("selection", {})[entry_id] = bool(selected)
        save_matrix(data)
        return {"id": entry_id, "selected": bool(selected)}


def selected_entries(side: str | None = None) -> list[dict[str, Any]]:
    data = load_matrix()
    selection = data.get("selection", {})
    result = []
    for row in data.get("entries", []):
        if not row.get("enabled", True):
            continue
        if not selection.get(row.get("id"), False):
            continue
        if side and row.get("side") != side:
            continue
        result.append(row)
    return result


def verify_record(entry_id: str, status: EvidenceStatus, *, source: str, method: str,
                  reference: str | None = None, notes: str = "") -> dict[str, Any]:
    """Record empirical evidence for one matrix entry.

    The caller must supply the evidence status explicitly. This prevents a
    successful-looking configuration from silently becoming a PASS.
    """
    with _LOCK:
        data = load_matrix()
        for row in data.get("entries", []):
            if row.get("id") == entry_id:
                row["evidence"] = Evidence.now(
                    status, source=source, method=method,
                    reference=reference, notes=notes,
                ).to_dict()
                save_matrix(data)
                return row
        raise KeyError(f"Unknown matrix entry: {entry_id}")


def summary() -> dict[str, Any]:
    rows = entries()
    counts: dict[str, int] = {}
    for row in rows:
        status = str(row.get("evidence", {}).get("status", EvidenceStatus.UNKNOWN))
        counts[status] = counts.get(status, 0) + 1
    return {
        "total": len(rows),
        "bySide": {
            "red": sum(row.get("side") == "red" for row in rows),
            "blue": sum(row.get("side") == "blue" for row in rows),
        },
        "evidence": counts,
        "selected": len(selected_entries()),
    }


if __name__ == "__main__":
    print(json.dumps({"summary": summary(), "entries": entries()}, indent=2, ensure_ascii=False))
