# WPWW War Room

Standalone live operations dashboard for controlled security, resilience and verification demonstrations.

## What it does

WPWW reads live state from the configured Security Radar and presents it as a War Room view rather than hardcoded green status.

It shows:

- overall defensive posture
- Security Radar health and API status
- rate-limiting and structured-event capability state
- recent security events
- a bounded defensive simulator action
- service/capability matrix
- automatic browser refresh every 3 seconds
- a short Web Audio alert when a new event appears

Unavailable upstream data is shown as `UNKNOWN`, `DOWN` or `OFFLINE` rather than being presented as successful.

## Run locally

```powershell
docker compose up --build -d
```

Open:

`http://localhost:8080`

## Configuration

By default WPWW expects Security Radar at:

`http://host.docker.internal:5080`

Override with:

```powershell
$env:RADAR_URL="http://localhost:5080"
docker compose up --build -d
```

The simulator does not accept arbitrary targets. It calls one configured controlled Security Radar route only.

## Architecture

```text
Browser
   |
   v
WPWW War Room
   |
   +--> /api/warroom
   |       |
   |       +--> Security Radar /health
   |       +--> Security Radar /api/status
   |       +--> Security Radar /api/events
   |
   +--> /api/simulate
           |
           +--> configured defensive route only
```

The browser never receives the upstream Radar base URL as a configurable attack target from user input.

## CI

`.github/workflows/ci.yml` automatically:

1. validates the Node server and required files
2. builds the container
3. starts WPWW in Docker Compose
4. verifies the HTTP frontend
5. verifies the `/api/warroom` JSON contract
6. collects container diagnostics on failure
7. tears down the test environment

## Safety boundary

WPWW is a defensive demonstration and monitoring interface for systems you control. The simulator is deliberately bounded and does not provide arbitrary scanning, target selection, credential attacks or destructive actions.

## Scope

WPWW is intentionally standalone. It can monitor the Azure/Kubernetes showcase without being part of that repository, and it can later be extended with CI, Kubernetes and FinOps adapters without coupling its core UI to a single infrastructure stack.

## Current verification state

The repository documents configuration and behavior that can be checked locally. It does not claim an upstream service is healthy when that service is unavailable, and it does not treat a successful container build as proof of production runtime behavior.
