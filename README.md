# WPWW War Room

Standalone live operations and research lab for controlled security, resilience, observability and verification experiments.

## Core

WPWW provides one local control plane for:

- live/DEMO modes
- Mission Control feature flags
- Security Radar state
- controlled simulation
- alerts with cooldown
- incident history
- local lockdown/reset state
- event replay
- report generation
- Auto-Heal runtime repair
- Evolution Lab
- module/plugin inventory
- deterministic E2E verification
- GitHub Actions CI

Unavailable upstream services are shown as `UNKNOWN`, `DOWN` or `OFFLINE`. WPWW does not turn a container build into a claim of production health.

## Research Lab

The repository includes an extensible lab contract for manually adding software, databases, telemetry systems and analysis tools.

Experiment modes:

- `single`
- `pairwise`
- `matrix`
- `pipeline`

Every participant is validated as `wpww-local`. A plugin cannot turn the experiment engine into an arbitrary remote-target runner.

## Database matrix

Available as opt-in Docker profiles:

- PostgreSQL
- MySQL
- MariaDB
- MongoDB
- Redis
- SQLite lab volume

These are not started by the default WPWW command.

## Tool matrix

The lab manifest contains opt-in adapters for established tools including:

- OWASP ZAP
- Semgrep
- Trivy
- Gitleaks
- Playwright
- pytest
- Prometheus
- Grafana
- OpenTelemetry
- Loki
- Jaeger

A manifest entry does not mean the external product is installed. Disabled adapters are explicitly reported as not installed until their entrypoint exists.

## Evolution Lab

`evolution-attacker/` is a bounded adaptive experiment against WPWW's own fixed local scenarios. The agent uses exploration/learning to choose among controlled observations, records latency/reward/state, and writes a forensic log. It does not accept arbitrary targets.

Run:

```powershell
docker compose --profile evolution up --build
```

## Optional profiles

```powershell
docker compose --profile telemetry up --build

docker compose --profile simulation up --build
docker compose --profile evolution up --build
```

Combine profiles:

```powershell
docker compose --profile telemetry --profile simulation --profile evolution up --build
```

## Local dashboard

```powershell
docker compose up --build -d
```

Open `http://localhost:8080`.

## Reports

The Research Lab report contract supports:

- JSON
- CSV
- HTML

PDF is reserved for the report adapter layer and should only be marked available when the PDF generator is actually installed and tested in CI.

## Security and secrets

Secrets are never committed to the repository. Webhook URLs and signature secrets are supplied through environment variables or external secret stores. The signature module uses a secret outside source control.

## CI

`.github/workflows/ci.yml` validates source syntax, runtime-state repair, module inventory, required files, Docker startup, `/healthz`, the full verification suite and Mission Control checks. Failures collect container diagnostics before teardown.

## Extension workflow

1. Add the plugin definition to `lab/plugin-manifest.json`.
2. Add its implementation under the declared entrypoint.
3. Mark it `enabled: false` until the implementation is present and tested.
4. Add its result mapping to the common experiment/report schema.
5. Enable it only after the corresponding smoke/E2E checks are green.

## Safety boundary

WPWW is designed as a local controlled laboratory. Red-side modules are scenario-driven and bounded to WPWW-owned endpoints. Blue-side modules observe, detect, rate-limit, quarantine or report within the same controlled lab. No component is intended to scan, attack or interfere with arbitrary external systems.

## Change-control audit

The repository uses an auditable change-control record. Material changes must be traceable to an approved scope, the resulting Git diff, and verification evidence.
