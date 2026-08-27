from __future__ import annotations

from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from threading import RLock
from typing import Dict, List


@dataclass
class LabNode:
    node_id: str
    side: str
    kind: str
    enabled: bool = True
    locked: bool = False
    mode: str = "default"
    strength: float = 1.0
    cooperation: float = 0.0
    replication: float = 0.0
    detection: float = 0.0
    containment: float = 0.0


class BattleLab:
    """Deterministic local Red/Blue simulation model.

    This models hostile behavior rather than executing real malware or spreading
    outside the WPWW laboratory.
    """

    def __init__(self) -> None:
        self._lock = RLock()
        self.nodes: Dict[str, LabNode] = {}
        self.history: List[dict] = []
        self.reset()

    def reset(self) -> None:
        with self._lock:
            self.nodes = {
                "red-sim": LabNode("red-sim", "red", "threat-simulator", strength=1.0, cooperation=0.5, replication=0.6),
                "red-evolution": LabNode("red-evolution", "red", "adaptive-scenario", strength=1.1, cooperation=0.8, replication=0.5),
                "blue-firewall": LabNode("blue-firewall", "blue", "firewall", strength=1.0, detection=0.7, containment=0.8),
                "blue-radar": LabNode("blue-radar", "blue", "detection", strength=1.0, detection=0.9, containment=0.5),
                "blue-quarantine": LabNode("blue-quarantine", "blue", "quarantine", strength=0.9, detection=0.6, containment=0.95),
            }
            self.history = []

    def configure(self, node_id: str, **changes) -> dict:
        with self._lock:
            node = self.nodes[node_id]
            if node.locked:
                raise PermissionError(f"Module {node_id} is locked")
            for field in (
                "enabled", "mode", "strength", "cooperation", "replication",
                "detection", "containment",
            ):
                if field in changes:
                    value = changes[field]
                    if field != "mode":
                        value = float(value) if field not in {"enabled"} else bool(value)
                    setattr(node, field, value)
            if "locked" in changes:
                node.locked = bool(changes["locked"])
            return asdict(node)

    def snapshot(self) -> dict:
        with self._lock:
            return {"nodes": [asdict(n) for n in self.nodes.values()], "history": list(self.history)}

    def run_round(self) -> dict:
        with self._lock:
            red = [n for n in self.nodes.values() if n.side == "red" and n.enabled]
            blue = [n for n in self.nodes.values() if n.side == "blue" and n.enabled]

            red_pressure = sum(n.strength * (1 + n.replication * 0.5 + n.cooperation * 0.25) for n in red)
            blue_response = sum(n.strength * (n.detection * 0.6 + n.containment * 0.4) for n in blue)
            outcome = "contained" if blue_response >= red_pressure else "pressure_maintained"

            event = {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "red_pressure": round(red_pressure, 4),
                "blue_response": round(blue_response, 4),
                "outcome": outcome,
                "red_nodes": [n.node_id for n in red],
                "blue_nodes": [n.node_id for n in blue],
            }
            self.history.append(event)
            self.history = self.history[-500:]
            return event
