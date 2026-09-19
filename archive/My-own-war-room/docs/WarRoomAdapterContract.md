# WarRoom Adapter Contract

The adapter is the presentation boundary between the authoritative SecurityEngine and the existing WarRoom UI.

## Authoritative engine data

- `result`: `SimulationResult`
- `topology.nodes`: updated `AgentNode[]`
- `topology.edges`: updated `NetworkEdge[]`
- `defenses`: updated `DefenseModule[]`
- `timelineView`: engine `SimulationStep[]`
- `auditView`: presentation mapping of engine `AuditLogEntry[]`

## Legacy presentation data

`legacyEvaluation` exists only for compatibility with the existing forensic/radar presentation. Its `entropy` value is calculated from the raw payload and is **not** a SecurityEngine result field.

The adapter must not invent attacker IP, geo/ASN, cryptographic hashes, countermeasures, or entropy as engine output.

## UI rule

Consumers must use:

```ts
sim.result
sim.topology
sim.defenses
sim.timelineView
sim.auditView
sim.legacyEvaluation
```

They must not read:

```ts
sim.nodes
sim.edges
sim.evaluation
sim.entropy
```

## Integration boundary

`WarRoomSecurityAdapter.ts` remains a compatibility entry point and re-exports the canonical `WarRoomAdapter`. SecurityEngine remains unchanged by the presentation layer.
