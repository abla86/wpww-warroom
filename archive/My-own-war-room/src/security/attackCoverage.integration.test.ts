import assert from 'node:assert/strict';
import { MASTER_ATTACK_CATALOG } from '../data/attackCatalog';
import { buildAttackCoverageSummary } from './attackCoverage';

const summary = buildAttackCoverageSummary();

assert.equal(summary.total, MASTER_ATTACK_CATALOG.length);
assert.ok(summary.automatedThreats >= 1);
assert.ok(summary.credentialAttacks >= 2);
assert.ok(summary.aiSecurityAttacks >= 14);
assert.ok(summary.dosDdosAttacks >= 1);
assert.equal(summary.safeSimulationCount, summary.total);

const requiredOatIds = Array.from({ length: 21 }, (_, index) => 1001 + index);
for (const id of requiredOatIds) {
  assert.ok(MASTER_ATTACK_CATALOG.some((attack) => attack.id === id), 'Missing OAT vector ' + id);
}

for (const requiredName of [
  'TIP: Task-in-Prompt Attack',
  'MCP Tool Poisoning',
  'MCP Rug Pull / Tool Definition Drift',
]) {
  assert.ok(MASTER_ATTACK_CATALOG.some((attack) => attack.name === requiredName), 'Missing ' + requiredName);
}

console.log('Attack catalog verification: PASS (' + summary.total + ' vectors)');
