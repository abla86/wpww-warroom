import { AttackVector } from '../types';
import { MASTER_ATTACK_CATALOG } from '../data/attackCatalog';

export interface AttackCoverageSummary {
  total: number;
  byCategory: Record<string, number>;
  automatedThreats: number;
  credentialAttacks: number;
  aiSecurityAttacks: number;
  dosDdosAttacks: number;
  safeSimulationCount: number;
}

export function buildAttackCoverageSummary(attacks: AttackVector[] = MASTER_ATTACK_CATALOG): AttackCoverageSummary {
  const byCategory = attacks.reduce<Record<string, number>>((acc, attack) => {
    acc[attack.category] = (acc[attack.category] ?? 0) + 1;
    return acc;
  }, {});

  return {
    total: attacks.length,
    byCategory,
    automatedThreats: attacks.filter((a) => a.category === 'automated_abuse').length,
    credentialAttacks: attacks.filter((a) => a.category === 'credential_attack').length,
    aiSecurityAttacks: attacks.filter((a) => a.category === 'ai_security').length,
    dosDdosAttacks: attacks.filter((a) => a.category === 'dos' || a.category === 'ddos').length,
    safeSimulationCount: attacks.filter((a) => a.safeSimulation === true).length,
  };
}
