from __future__ import annotations

import hashlib
import json
import os
import random
import time
from dataclasses import dataclass, field
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

BASE_URL = os.getenv("WPWW_URL", "http://127.0.0.1:8080").rstrip("/")
LOG_PATH = Path(os.getenv("EVOLUTION_LOG", "data/attacker_evolution.jsonl"))
STATE_PATH = Path(os.getenv("EVOLUTION_STATE", "data/attacker_state.json"))
STEPS = max(1, min(int(os.getenv("EVOLUTION_STEPS", "12")), 100))
EPSILON = min(max(float(os.getenv("EVOLUTION_EPSILON", "0.20")), 0.0), 1.0)
PAUSE_SECONDS = max(0.0, float(os.getenv("EVOLUTION_PAUSE", "2")))


@dataclass(frozen=True)
class Scenario:
    name: str
    path: str
    method: str = "GET"
    payload: dict | None = None
    reward_statuses: tuple[int, ...] = (200,)


# Closed-world scenarios: only WPWW's own routes are reachable.
SCENARIOS = (
    Scenario("controlled_probe", "/api/simulate", "POST", None, (200,)),
    Scenario("health_observation", "/healthz", "GET", None, (200,)),
    Scenario("warroom_observation", "/api/warroom", "GET", None, (200,)),
    Scenario("incident_observation", "/api/incidents", "GET", None, (200,)),
    Scenario("unknown_route", "/api/evolution-lab/unknown", "GET", None, (404,)),
)


@dataclass
class Agent:
    stats: dict[str, dict[str, float]] = field(
        default_factory=lambda: {s.name: {"alpha": 1.0, "beta": 1.0} for s in SCENARIOS}
    )
    previous_hash: str = "GENESIS"

    def load(self) -> None:
        try:
            if not STATE_PATH.exists():
                return
            state = json.loads(STATE_PATH.read_text(encoding="utf-8"))
            for scenario in SCENARIOS:
                saved = state.get("stats", {}).get(scenario.name)
                if isinstance(saved, dict):
                    self.stats[scenario.name]["alpha"] = max(1.0, float(saved.get("alpha", 1.0)))
                    self.stats[scenario.name]["beta"] = max(1.0, float(saved.get("beta", 1.0)))
            self.previous_hash = str(state.get("previousHash", "GENESIS"))
        except (OSError, TypeError, ValueError, json.JSONDecodeError):
            self.previous_hash = "GENESIS"

    def save(self) -> None:
        STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
        tmp = STATE_PATH.with_suffix(".tmp")
        tmp.write_text(
            json.dumps({"stats": self.stats, "previousHash": self.previous_hash}, indent=2),
            encoding="utf-8",
        )
        tmp.replace(STATE_PATH)

    def choose(self) -> Scenario:
        if random.random() < EPSILON:
            return random.choice(SCENARIOS)
        sampled = {
            name: random.betavariate(values["alpha"], values["beta"])
            for name, values in self.stats.items()
        }
        chosen = max(sampled, key=sampled.get)
        return next(s for s in SCENARIOS if s.name == chosen)

    def learn(self, scenario: Scenario, status: int, response_ms: float) -> tuple[float, str]:
        useful = status in scenario.reward_statuses
        reward = 1.0 if useful else -0.5
        if response_ms < 1000:
            reward += 0.1
        if status >= 500 or status == 0:
            reward -= 0.5
        if useful:
            self.stats[scenario.name]["alpha"] += 1.0
        else:
            self.stats[scenario.name]["beta"] += 1.0
        return reward, "useful" if useful else "rejected"

    def record(self, step: int, scenario: Scenario, status: int, response_ms: float, reward: float, outcome: str) -> None:
        LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
        event = {
            "timestampUtc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "step": step,
            "mode": "SIMULATED",
            "scenario": scenario.name,
            "path": scenario.path,
            "method": scenario.method,
            "responseStatus": status,
            "responseMs": round(response_ms, 2),
            "reward": round(reward, 4),
            "outcome": outcome,
            "posterior": self.stats[scenario.name],
            "previousHash": self.previous_hash,
        }
        canonical = json.dumps(event, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
        event["eventHash"] = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
        with LOG_PATH.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(event, ensure_ascii=False, separators=(",", ":")) + "\n")
        self.previous_hash = event["eventHash"]


def request(scenario: Scenario) -> tuple[int, object, float]:
    started = time.perf_counter()
    req = Request(f"{BASE_URL}{scenario.path}", method=scenario.method)
    if scenario.payload is not None:
        req.data = json.dumps(scenario.payload).encode("utf-8")
        req.add_header("Content-Type", "application/json")
    try:
        with urlopen(req, timeout=5) as response:
            raw = response.read().decode("utf-8", errors="replace")
            try:
                body = json.loads(raw)
            except json.JSONDecodeError:
                body = raw
            return response.status, body, (time.perf_counter() - started) * 1000
    except HTTPError as exc:
        raw = exc.read().decode("utf-8", errors="replace")
        try:
            body = json.loads(raw)
        except json.JSONDecodeError:
            body = raw
        return exc.code, body, (time.perf_counter() - started) * 1000
    except (URLError, TimeoutError, OSError) as exc:
        return 0, {"error": str(exc)}, (time.perf_counter() - started) * 1000


def main() -> int:
    print(f"WPWW Evolution Lab: {BASE_URL}")
    print(f"bounded steps={STEPS}, epsilon={EPSILON:.2f}")
    agent = Agent()
    agent.load()
    for step in range(1, STEPS + 1):
        scenario = agent.choose()
        status, body, response_ms = request(scenario)
        reward, outcome = agent.learn(scenario, status, response_ms)
        agent.record(step, scenario, status, response_ms, reward, outcome)
        agent.save()
        print(f"[{step:02d}/{STEPS}] {scenario.name:<24} HTTP {status:<3} {response_ms:7.1f}ms reward={reward:+.2f} outcome={outcome}")
        if PAUSE_SECONDS:
            time.sleep(PAUSE_SECONDS)
    print("Final posterior parameters:")
    for name, values in sorted(agent.stats.items()):
        print(f"  {name:<24} alpha={values['alpha']:.2f} beta={values['beta']:.2f}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
