export type GroundingSource = {
  id: string;
  title: string;
  uri?: string;
  content: string;
  trust: 'approved' | 'unverified';
};

export type GroundedContext = {
  query: string;
  sources: GroundingSource[];
  generatedAt: string;
};

export type AgentActionRequest = {
  action: string;
  reason: string;
  requiresApproval: true;
};

export function buildGroundedContext(query: string, sources: GroundingSource[]): GroundedContext {
  return {
    query: query.trim(),
    sources: sources.filter((source) => source.trust === 'approved'),
    generatedAt: new Date().toISOString(),
  };
}

export function buildAgentActionRequest(action: string, reason: string): AgentActionRequest {
  return { action: action.trim(), reason: reason.trim(), requiresApproval: true };
}

export function canAgentInfluenceSecurityDecision(request: AgentActionRequest): false {
  void request;
  return false;
}

export type SecurityEvidenceRecord = {
  id: string;
  simulationId: string;
  attackVectorId: string | number;
  verdict: string;
  sourceIds: string[];
  createdAt: string;
};

export function buildSecurityEvidenceRecord(
  simulationId: string,
  attackVectorId: string | number,
  verdict: string,
  context: GroundedContext,
): SecurityEvidenceRecord {
  return {
    id: `evidence_${simulationId}_${String(attackVectorId)}`,
    simulationId,
    attackVectorId,
    verdict,
    sourceIds: context.sources.map((source) => source.id),
    createdAt: new Date().toISOString(),
  };
}

export function buildAnalystBrief(
  context: GroundedContext,
  verdict: string,
): string {
  const sourceTitles = context.sources.map((source) => source.title).join('; ');
  return [
    `Security verdict: ${verdict}`,
    `Grounded query: ${context.query}`,
    sourceTitles ? `Approved sources: ${sourceTitles}` : 'Approved sources: none',
    'AI output is advisory and cannot override the SecurityEngine decision.',
  ].join('\\n');
}
