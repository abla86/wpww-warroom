.PHONY: up down test telemetry simulate cli-health cli-status cli-probe

up:
	docker compose up --build -d

down:
	docker compose down -v

test:
	python3 tests/verify_all.py

telemetry:
	docker compose --profile telemetry up --build -d

simulate:
	docker compose --profile simulation up --build -d

cli-health:
	python3 tools/cli.py health

cli-status:
	python3 tools/cli.py status

cli-probe:
	python3 tools/cli.py probe
