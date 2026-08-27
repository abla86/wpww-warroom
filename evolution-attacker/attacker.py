from __future__ import annotations

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
STEPS = max(1, min(int(os.getenv("EVOLUTION_STEPS", "12")), 100))
EPSILON = min(max(float(os.getenv("EVOLUTION_EPSILON", "0.20")), 0.0), 1.0)
PAUSE_SECONDS = max(0.0, float(os.getenv("EVOLUTION_PAUSE", "2")))


@dataclass(frozen=True)
class Scenario:
    name: str
    path: str
    method: str = "POST"
    payload: dict | None = None


SCENARIOS = (
    Scenario("controlled_probe", "/api/simulate", "POST", None),
    Scenario("health_observation", "/healthz", "GET", None),
    Scenario("warroom_observation", "/api/warroom", "GET", None),
    Scenario("unknown_route", "/api/evolution-lab/unknown", "GET", None),
)


@dataclass
class Agent:
    weights: dict[str, float] = field(default_factory=lambda: {s.name: 1.0 for s in SCENARIOS})

    def choose(self) -> Scenario:
        if random.random() < EPSILON:
            return random.choice(SCENARIOS)
        names = list(self.weights)
        values = [max(self.weights[n], 0.1) for n in names]
        chosen = random.choices(names, weights=values, k=1)[0]
        return next(s for s in SCENARIOS if s.name == chosen)

    def learn(self, name: str, status: int, response_ms: float) -> float:
        # Reward useful bounded observations rather than "breaking" a service.
        reward = 0.0
        if status in (200, 404):
            reward += 0.10
        if response_ms < 1000:
            reward += 0.05
        if status == 500:
            reward -= 0.25
        self.weights[name] = max(0.1, round(self.weights[name] + reward, 4))
        return reward

    def record(self, scenario: Scenario, status: int, response_ms: float, reward: float, body: object) -> None:
        LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
        event = {
            "timestampUtc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "mode": "SIMULATED",
            "scenario": scenario.name,
            "path": scenario.path,
            "method": scenario.method,
            "responseStatus": status,
            "responseMs": round(response_ms, 2),
            "reward": reward,
            "weights": self.weights,
            "responseType": type(body).__name__,
        }
        with LOG_PATH.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(event, ensure_ascii=False, separators=(",", ":")) + "\n")


def request(scenario: Scenario) -> tuple[int, object, float]:
    started = time.perf_counter()
    req = Request(f"{BASE_URL}{scenario.path}", method=scenario.method)
    if scenario.payload is not None:
        raw = json.dumps(scenario.payload).encode("utf-8")
        req.data = raw
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

    for step in range(1, STEPS + 1):
        scenario = agent.choose()
        status, body, response_ms = request(scenario)
        reward = agent.learn(scenario.name, status, response_ms)
        agent.record(scenario, status, response_ms, reward, body)
        print(f"[{step:02d}/{STEPS}] {scenario.name:<22} HTTP {status:<3} {response_ms:7.1f}ms reward={reward:+.2f}")
        if PAUSE_SECONDS:
            time.sleep(PAUSE_SECONDS)

    print("Final strategy weights:")
    for name, weight in sorted(agent.weights.items()):
        print(f"  {name:<22} {weight:.4f}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
