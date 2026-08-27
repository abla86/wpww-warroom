from __future__ import annotations

import itertools
import json
import os
import time
import uuid
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Iterable


ALLOWED_MODES = {"single", "pairwise", "matrix", "pipeline"}
ALLOWED_SIDES = {"red", "blue", "data", "observability", "reporting"}


@dataclass(frozen=True)
class Participant:
    id: str
    name: str
    side: str
    enabled: bool = True
    target: str = "wpww-local"
    metadata: dict | None = None

    def validate(self) -> None:
        if not self.id or not self.name:
            raise ValueError("Participant id/name is required")
        if self.side not in ALLOWED_SIDES:
            raise ValueError(f"Unsupported side: {self.side}")
        if self.target != "wpww-local":
            raise ValueError("Participants are restricted to the WPWW local lab")


@dataclass
class Observation:
    participant_id: str
    timestamp_utc: str
    status: str
    http_status: int | None = None
    latency_ms: float | None = None
    evidence: dict | None = None


@dataclass
class Experiment:
    experiment_id: str
    mode: str
    participants: list[Participant]
    started_utc: str
    finished_utc: str | None = None
    observations: list[Observation] | None = None
    status: str = "CREATED"

    def to_json(self) -> str:
        return json.dumps(
            asdict(self),
            ensure_ascii=False,
            indent=2,
            sort_keys=True,
            default=lambda value: asdict(value),
        )


def select_pairs(participants: Iterable[Participant], mode: str) -> list[tuple[Participant, Participant | None]]:
    selected = [p for p in participants if p.enabled]
    for participant in selected:
        participant.validate()

    if mode == "single":
        return [(p, None) for p in selected]

    red = [p for p in selected if p.side == "red"]
    blue = [p for p in selected if p.side == "blue"]

    if mode in {"pairwise", "pipeline"}:
        return [(r, b) for r in red for b in blue]

    if mode == "matrix":
        return [(r, b) for r, b in itertools.product(red, blue)]

    raise ValueError(f"Unknown experiment mode: {mode}")


def new_experiment(participants: list[Participant], mode: str) -> Experiment:
    if mode not in ALLOWED_MODES:
        raise ValueError(f"Unsupported mode: {mode}")
    selected = [p for p in participants if p.enabled]
    if not selected:
        raise ValueError("No enabled participants")
    return Experiment(
        experiment_id=f"exp-{uuid.uuid4().hex[:12]}",
        mode=mode,
        participants=selected,
        started_utc=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        observations=[],
        status="RUNNING",
    )


def finish_experiment(experiment: Experiment) -> Experiment:
    experiment.finished_utc = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    experiment.status = "COMPLETED"
    return experiment


def persist_experiment(experiment: Experiment, directory: str = "data/experiments") -> Path:
    path = Path(directory)
    path.mkdir(parents=True, exist_ok=True)
    target = path / f"{experiment.experiment_id}.json"
    target.write_text(experiment.to_json(), encoding="utf-8")
    return target


def demo_plan(participants: list[Participant], mode: str) -> list[dict]:
    return [
        {
            "experiment_id": f"plan-{uuid.uuid4().hex[:10]}",
            "mode": mode,
            "red": left.id,
            "blue": right.id if right else None,
            "scope": "wpww-local",
        }
        for left, right in select_pairs(participants, mode)
    ]


if __name__ == "__main__":
    default = [
        Participant("red-evolution", "Evolution Lab", "red"),
        Participant("blue-radar", "Security Radar", "blue"),
    ]
    print(json.dumps(demo_plan(default, os.getenv("WPWW_LAB_MODE", "pairwise")), indent=2))
