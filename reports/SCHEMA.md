# WPWW Research Result Schema

All built-in and manually added lab programs should emit a common result object.

```json
{
  "runId": "uuid-or-local-id",
  "timestampUtc": "ISO-8601",
  "mode": "SIMULATED",
  "adapter": "plugin-id",
  "scenario": "scenario-id",
  "target": "wpww-closed-lab",
  "status": "PASS",
  "durationMs": 42.1,
  "metrics": {
    "requests": 1,
    "errors": 0,
    "detected": true,
    "blocked": true,
    "recovered": true
  },
  "evidence": [],
  "notes": []
}
```

Allowed status values: `PASS`, `FAIL`, `UNKNOWN`, `NOT_CONFIGURED`.

`mode` must identify simulated runs explicitly. Reports may aggregate multiple adapters and scenarios while retaining raw evidence.
