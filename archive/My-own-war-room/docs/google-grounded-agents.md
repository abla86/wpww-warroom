# Google Grounded Agents architecture — WarRoom integration

Google's current Firebase documentation calls Firebase Data Connect **Firebase SQL Connect**. SQL Connect is backed by Cloud SQL for PostgreSQL and supports vector search, authentication and local emulation.

| Capability | WarRoom use |
| --- | --- |
| SQL / PostgreSQL | Persistent incidents, simulations, evidence and audit records |
| Vector search | Similar-incident and threat-pattern retrieval |
| RAG | Grounded threat intelligence and defensive context |
| AI agent | Analyst assistance, triage and explanation |
| Authentication | Role-based security-operations access |
| Emulator | Local integration testing |
| Generated typed SDK | Stable data contract |

## Security boundary

The agent remains advisory unless an explicit authenticated policy permits an action.

request → validation → attack classification → defense policy → simulation/action decision → audit event

Retrieved documents, vector matches and model output must not directly override security policy.

Google's documentation also warns that AI-generated SQL Connect output can be inaccurate and should be validated before production use.

## Recommended WarRoom integration

1. Keep SecurityEngine as the canonical deterministic security engine.
2. Persist SimulationResult and audit events through SQL Connect.
3. Index approved threat intelligence and evidence for retrieval.
4. Use RAG for grounded analyst context.
5. Use an agent layer for explanation and investigation assistance.
6. Require the existing policy engine to approve consequential operations.

## Frontend

The reference architecture uses Next.js. WarRoom should not introduce a second security engine if Next.js is later adopted; it should remain an application shell around the canonical engine.

## Official documentation

- https://firebase.google.com/docs/sql-connect
- https://firebase.google.com/docs/sql-connect/ai-assistance
- https://firebase.google.com/docs/ai-assistance/agent-skills