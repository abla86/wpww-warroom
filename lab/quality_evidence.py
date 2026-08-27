"""WPWW Quality & Evidence primitives.

Keeps a strict distinction between what the system observed, verified, tested,
and what remains unknown. This module never upgrades an evidence state merely
because a module is configured or listed in a manifest.
"""

from __future__ import annotations

from dataclasses import dataclass, asdict
from enum import StrEnum
from datetime import datetime, timezone
from typing import Iterable


class EvidenceStatus(StrEnum):
    OBSERVED = "OBSERVED"
    VERIFIED = "VERIFIED"
    TESTED = "TESTED"
    PASS = "PASS"
    FAIL = "FAIL"
    UNKNOWN = "UNKNOWN"
    NOT_TESTED = "NOT_TESTED"
    NOT_APPLICABLE = "NOT_APPLICABLE"


@dataclass(frozen=True)
class Evidence:
    status: EvidenceStatus
    source: str
    checked_at_utc: str
    method: str
    reference: str | None = None
    notes: str = ""

    @classmethod
    def now(
        cls,
        status: EvidenceStatus,
        *,
        source: str,
        method: str,
        reference: str | None = None,
        notes: str = "",
    ) -> "Evidence":
        return cls(
            status=status,
            source=source,
            checked_at_utc=datetime.now(timezone.utc).isoformat(),
            method=method,
            reference=reference,
            notes=notes,
        )

    def to_dict(self) -> dict:
        return asdict(self)


def quality_refs(kind: str) -> tuple[str, ...]:
    """Return relevant quality references without claiming compliance.

    The references are intentionally descriptive. WPWW must still perform and
    record the controls needed for any real compliance claim.
    """
    key = kind.lower().strip()
    mapping = {
        "web": ("OWASP Top 10", "NIST SP 800-53"),
        "container": ("CIS Docker Benchmarks", "NIST SP 800-53"),
        "kubernetes": ("CIS Kubernetes Benchmark", "NIST SP 800-53"),
        "code": ("OWASP SAMM", "NIST SP 800-53"),
        "data": ("NIST SP 800-53", "CIS Controls"),
        "general": ("NIST SP 800-53", "CIS Controls", "OWASP Top 10"),
    }
    return mapping.get(key, mapping["general"])


def summarize_evidence(items: Iterable[Evidence]) -> dict:
    rows = list(items)
    counts = {status.value: 0 for status in EvidenceStatus}
    for item in rows:
        counts[item.status.value] += 1
    return {"count": len(rows), "counts": counts, "items": [item.to_dict() for item in rows]}
