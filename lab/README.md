# WPWW Research Lab

The lab is extensible by design. Add new attack-simulation, defence, analysis, database, telemetry, or report plugins without modifying WPWW core.

## Extension model

Each plugin declares:

- `id`
- `name`
- `side`: `red`, `blue`, `data`, `observability`, or `reporting`
- `kind`
- `entrypoint`
- `enabledByDefault`
- `requires`
- `outputs`
- `safetyScope`

Plugins are opt-in. Unknown or malformed plugins are reported as `INVALID` and never started.

## Experiment modes

- `single`: one participant
- `pairwise`: A against B
- `matrix`: every selected red/blue combination
- `pipeline`: scenario -> detection -> response -> measurement -> report

All experiments are local-lab scoped. No plugin may accept an arbitrary external target from the experiment API.
