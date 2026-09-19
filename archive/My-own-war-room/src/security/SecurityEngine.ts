import {
  AgentNode,
  NetworkEdge,
  AttackVector,
  DefenseModule,
  SimulationResult,
  SimulationStep,
  AuditLogEntry,
  SecurityVerdict,
  ProvenanceSource,
  NodeStatus,
} from './types';
import { syncHash } from './crypto';
import { ADDITIONAL_DEFENSES } from './defaults';

export interface SecurityExecutionEnvelope {
  result: SimulationResult;
  auditLogs: AuditLogEntry[];
  evidence: Array<{ id: string; simulationId: string; attackVectorId: string | number; verdict: string; sourceIds: string[] }>;
}

export class SecurityEngine {
  static runGroundedSimulation(
    attack: AttackVector,
    nodes: AgentNode[],
    edges: NetworkEdge[],
    defenses: DefenseModule[],
    sources: Array<{ id: string; title: string; uri?: string; content: string; trust: 'approved' | 'unverified' }>,
  ): SecurityExecutionEnvelope {
    const execution = SecurityEngine.runSimulation(attack, nodes, edges, defenses);
    const approvedSourceIds = sources.filter((source) => source.trust === 'approved').map((source) => source.id);
    return {
      result: execution.result,
      auditLogs: execution.auditLogs,
      evidence: [{
        id: `evidence_${execution.result.id}_${String(attack.id)}`,
        simulationId: execution.result.id,
        attackVectorId: attack.id,
        verdict: execution.result.finalVerdict,
        sourceIds: approvedSourceIds,
      }],
    };
  }

  /**
   * Evaluates an incoming attack vector against the current node topology and active defenses.
   */
  static runSimulation(
    attack: AttackVector,
    nodes: AgentNode[],
    edges: NetworkEdge[],
    defenses: DefenseModule[]
  ): {
    result: SimulationResult;
    updatedNodes: AgentNode[];
    updatedEdges: NetworkEdge[];
    updatedDefenses: DefenseModule[];
    auditLogs: AuditLogEntry[];
  } {
    const startTime = performance.now();
    const steps: SimulationStep[] = [];
    const auditLogs: AuditLogEntry[] = [];
    const nodeStateMap: Record<string, NodeStatus> = {};
    const infectedNodeIds = new Set<string>();
    const protectedNodeIds = new Set<string>();
    const updatedEdges = edges.map((e) => ({ ...e, isInfected: false, isBlocked: false }));

    // Clone caller-owned defenses, including nested rule arrays, so simulation never mutates input state.
    const suppliedDefenseIds = new Set(defenses.map((d) => d.id));
    const effectiveDefenses = [...defenses, ...ADDITIONAL_DEFENSES.filter((d) => !suppliedDefenseIds.has(d.id))];
    const currentDefenses: DefenseModule[] = effectiveDefenses.map((d) => ({
      ...d,
      rules: d.rules.map((r) => ({ ...r })),
    }));

    // Clone nodes for immutability
    const currentNodes: AgentNode[] = nodes.map((n) => {
      nodeStateMap[n.id] = 'clean';
      return {
        ...n,
        status: 'clean',
        infectionHistory: n.infectionHistory.map((entry) => ({ ...entry })),
        memoryData: n.memoryData ? { ...n.memoryData } : n.memoryData,
        permissions: [...n.permissions],
        toolSchema: n.toolSchema
          ? {
              ...n.toolSchema,
              parameters: [...n.toolSchema.parameters],
              allowedCallers: [...n.toolSchema.allowedCallers],
            }
          : n.toolSchema,
      };
    });

    let currentPayload =
      typeof attack.payload === 'string' ? attack.payload : JSON.stringify(attack.payload) ?? '';
    let breached = false;
    let contained = false;
    let attemptsCompleted = 0;
    const maxAttempts = Math.max(1, attack.maxAttempts ?? 1);
    const propagation = attack.propagationStrategy ?? {
      spreadsToTools: false,
      spreadsToMemory: false,
      spreadsToRAG: false,
      spreadsToNetwork: false,
      adaptiveMutation: false,
    };

    // Identify entry node based on target type
    const targetNode = currentNodes.find((n) => n.type === attack.targetNodeType) || currentNodes[1] || currentNodes[0];
    const initialSourceNode = currentNodes.find((n) => n.type === 'user') || currentNodes[0];

    // Determine initial provenance
    let currentProvenance: ProvenanceSource = 'USER';
    if (attack.category === 'tool_poisoning' || attack.category === 'privilege_escalation' || attack.category === 'automated_abuse' || attack.category === 'credential_attack' || attack.category === 'ai_security' || attack.category === 'dos' || attack.category === 'ddos') {
      currentProvenance = 'WEB_UNTRUSTED';
    } else if (attack.category === 'memory_poisoning') {
      currentProvenance = 'MEMORY';
    } else if (attack.category === 'rag_corruption') {
      currentProvenance = 'TOOL_OUTPUT';
    }

    // MULTI-ATTEMPT SIMULATION LOOP
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      attemptsCompleted = attempt;
      const attemptSeed = `${attack.id}_attempt_${attempt}`;
      const payloadHash = syncHash(currentPayload + attemptSeed);

      // Mutate payload if adaptive
      if (attempt > 1 && propagation.adaptiveMutation) {
        currentPayload = `[ADAPTIVE MUTATION #${attempt} - Evasion Tuning]: ${typeof attack.payload === 'string' ? attack.payload : JSON.stringify(attack.payload)} --obfuscated_token_${attempt}=0x${payloadHash.substring(0, 6)}`;
      }

      // 1. EVALUATE DEFENSES
      const triggeredDefenseIds: string[] = [];
      let finalVerdict: SecurityVerdict = 'ALLOW';
      let decisionReason = 'No active defense rule triggered for this pattern.';

      // Defense Check: Worm Signature Sentinel
      const wormDefense = currentDefenses.find((d) => d.id === 'worm_pattern_scanner' && d.enabled);
      if (wormDefense) {
        const wormPatterns = [
          /repeat this/i,
          /copy yourself/i,
          /propagate/i,
          /store this.*whenever/i,
          /WORM_SIG/i,
          /SYSTEM OVERRIDE.*output buffers/i,
          /append this instruction/i,
        ];
        const isWormMatch = wormPatterns.some((pattern) => pattern.test(currentPayload));
        if (isWormMatch || attack.category === 'worm_propagation') {
          triggeredDefenseIds.push(wormDefense.id);
          wormDefense.blockedCount++;
          if (wormDefense.sensitivity === 'strict') {
            finalVerdict = 'DENY';
            decisionReason = 'Worm Signature Sentinel: Detected recursive self-replication pattern.';
          } else {
            finalVerdict = 'QUARANTINE';
            decisionReason = 'Worm Signature Sentinel: Quarantined suspect self-replicating payload for isolated analysis.';
          }
        }
      }

      // Defense Check: Provenance-Driven Authorization Firewall
      const provDefense = currentDefenses.find((d) => d.id === 'provenance_firewall' && d.enabled);
      if (provDefense && finalVerdict !== 'DENY') {
        const isHighRiskAction =
          attack.severity === 'CRITICAL' ||
          attack.severity === 'HIGH' ||
          /shell|exec|mysqldump|exfil|curl|delete/i.test(currentPayload);

        if (currentProvenance === 'WEB_UNTRUSTED' && isHighRiskAction) {
          triggeredDefenseIds.push(provDefense.id);
          provDefense.blockedCount++;
          finalVerdict = 'DENY';
          decisionReason = 'Provenance Firewall: Blocked privilege escalation (UNTRUSTED_WEB source cannot invoke HIGH/CRITICAL actions).';
        } else if (currentProvenance === 'USER' && attack.severity === 'CRITICAL') {
          triggeredDefenseIds.push(provDefense.id);
          finalVerdict = provDefense.sensitivity === 'strict' ? 'CONFIRM' : 'ALLOW';
          decisionReason = 'Provenance Firewall: Sensitive action flagged for user confirmation.';
        }
      }

      // Defense Check: Tool Capability Drift Sentinel
      const driftDefense = currentDefenses.find((d) => d.id === 'tool_drift_detector' && d.enabled);
      if (driftDefense && attack.category === 'tool_poisoning' && finalVerdict !== 'DENY') {
        triggeredDefenseIds.push(driftDefense.id);
        driftDefense.blockedCount++;
        finalVerdict = 'DENY';
        decisionReason = 'Tool Drift Sentinel: Blocked unauthorized permission expansion and schema descriptor modification.';
      }

      // Defense Check: Deterministic Request-Hash Firewall
      const hashDefense = currentDefenses.find((d) => d.id === 'request_hash_firewall' && d.enabled);
      if (hashDefense && attempt > 2 && propagation.adaptiveMutation && finalVerdict !== 'DENY') {
        triggeredDefenseIds.push(hashDefense.id);
        hashDefense.blockedCount++;
        finalVerdict = 'DENY';
        decisionReason = 'Request-Hash Firewall: Blocked unverified in-flight mutated request signature.';
      }

      // Defense Check: Evaluation Cheating Guard
      const evalDefense = currentDefenses.find((d) => d.id === 'eval_integrity_guard' && d.enabled);
      if (evalDefense && attack.category === 'evaluation_cheating' && finalVerdict !== 'DENY') {
        triggeredDefenseIds.push(evalDefense.id);
        evalDefense.blockedCount++;
        finalVerdict = 'DENY';
        decisionReason = 'Eval Integrity Guard: Transcript inspection and grader benchmark tampering intercepted.';
      }

      // Defense Check: RAG Evidence Integrity Verifier
      const ragDefense = currentDefenses.find((d) => d.id === 'rag_evidence_verifier' && d.enabled);
      if (ragDefense && attack.category === 'rag_corruption' && finalVerdict !== 'DENY') {
        triggeredDefenseIds.push(ragDefense.id);
        ragDefense.blockedCount++;
        finalVerdict = 'DENY';
        decisionReason = 'RAG Verifier: Citation chunk failed bidirectional cosine provenance verification.';
      }

      // Automated-abuse / credential / AI security controls.
      const automatedDefense = currentDefenses.find((d) => d.id === 'automated_abuse_guard' && d.enabled);
      const aiDefense = currentDefenses.find((d) => d.id === 'ai_security_guard' && d.enabled);
      const availabilityDefense = currentDefenses.find((d) => d.id === 'dos_ddos_guard' && d.enabled);

      if (automatedDefense && (attack.category === 'automated_abuse' || attack.category === 'credential_attack') && finalVerdict !== 'DENY') {
        triggeredDefenseIds.push(automatedDefense.id);
        automatedDefense.blockedCount++;
        finalVerdict = 'DENY';
        decisionReason = 'Automated Abuse Guard: rate, identity and velocity controls blocked the synthetic automated-abuse attempt.';
      }

      if (aiDefense && attack.category === 'ai_security' && finalVerdict !== 'DENY') {
        const aiAttackText = currentPayload + ' ' + attack.name + ' ' + (attack.owaspTag ?? '');
        const aiPatterns = [
          /prompt injection/i, /task-in-prompt/i, /system prompt/i, /tool poisoning/i,
          /rug pull/i, /excessive agency/i, /unbounded consumption/i,
          /sensitive information/i, /poison/i, /embedding/i, /misinformation/i,
        ];
        if (aiPatterns.some((pattern) => pattern.test(aiAttackText)) || attack.owaspTag?.startsWith('LLM') || attack.name.includes('TIP') || attack.name.includes('MCP')) {
          triggeredDefenseIds.push(aiDefense.id);
          aiDefense.blockedCount++;
          finalVerdict = 'DENY';
          decisionReason = 'AI Security Guard: synthetic AI-agent attack pattern blocked before privileged execution.';
        }
      }

      if (availabilityDefense && (attack.category === 'dos' || attack.category === 'ddos') && finalVerdict !== 'DENY') {
        triggeredDefenseIds.push(availabilityDefense.id);
        availabilityDefense.blockedCount++;
        finalVerdict = 'DENY';
        decisionReason = 'Availability Guard: synthetic DoS/DDoS resource-exhaustion pattern blocked.';
      }

      // 2. APPLY VERDICT TO STEP & TOPOLOGY
      const step: SimulationStep = {
        stepNumber: attempt,
        timestamp: Date.now() + attempt * 120,
        sourceNodeId: initialSourceNode.id,
        targetNodeId: targetNode.id,
        action: `Attempt ${attempt}/${maxAttempts}: ${attack.category.toUpperCase()}`,
        payload: currentPayload,
        provenance: currentProvenance,
        verdict: finalVerdict,
        reason: decisionReason,
        defensesTriggered: triggeredDefenseIds,
        nodeStatesSnapshot: { ...nodeStateMap },
      };

      // Update Node State
      if (finalVerdict === 'ALLOW') {
        nodeStateMap[targetNode.id] = 'infected';
        infectedNodeIds.add(targetNode.id);
        targetNode.status = 'infected';
        targetNode.infectedByWormId = String(attack.id);

        // Propagate to adjacent nodes based on attack strategy
        if (propagation.spreadsToTools) {
          const toolNodes = currentNodes.filter((n) => n.type === 'tool');
          toolNodes.forEach((tn) => {
            nodeStateMap[tn.id] = 'infected';
            infectedNodeIds.add(tn.id);
            tn.status = 'infected';
          });
        }
        if (propagation.spreadsToMemory) {
          const memoryNodes = currentNodes.filter((n) => n.type === 'memory');
          memoryNodes.forEach((mn) => {
            nodeStateMap[mn.id] = 'infected';
            infectedNodeIds.add(mn.id);
            mn.status = 'infected';
            if (mn.memoryData) {
              mn.memoryData['WORM_PAYLOAD_SLOT'] = `INJECTED_AT_${Date.now()}`;
            }
          });
        }
        if (propagation.spreadsToRAG) {
          const ragNodes = currentNodes.filter((n) => n.type === 'rag');
          ragNodes.forEach((rn) => {
            nodeStateMap[rn.id] = 'infected';
            infectedNodeIds.add(rn.id);
            rn.status = 'infected';
          });
        }

        // Highlight infected edges
        updatedEdges.forEach((edge) => {
          if (edge.source === targetNode.id || edge.target === targetNode.id) {
            edge.isInfected = true;
          }
        });

        breached = true;
      } else if (finalVerdict === 'QUARANTINE') {
        nodeStateMap[targetNode.id] = 'quarantined';
        targetNode.status = 'quarantined';
        contained = true;
        protectedNodeIds.add(targetNode.id);

        // Block adjacent edges
        updatedEdges.forEach((edge) => {
          if (edge.source === targetNode.id || edge.target === targetNode.id) {
            edge.isBlocked = true;
          }
        });
      } else {
        // DENY
        nodeStateMap[targetNode.id] = 'defended';
        targetNode.status = 'defended';
        protectedNodeIds.add(targetNode.id);
        contained = true;

        updatedEdges.forEach((edge) => {
          if (edge.target === targetNode.id) {
            edge.isBlocked = true;
          }
        });
      }

      step.nodeStatesSnapshot = { ...nodeStateMap };
      steps.push(step);

      // Audit Log
      auditLogs.push({
        id: `audit_${Date.now()}_${attempt}`,
        timestamp: step.timestamp,
        type: finalVerdict === 'ALLOW' ? 'ATTACK' : finalVerdict === 'QUARANTINE' ? 'QUARANTINE' : 'DEFENSE',
        source: initialSourceNode.name,
        target: targetNode.name,
        verdict: finalVerdict,
        message: `${attack.name} [Attempt ${attempt}]: ${decisionReason}`,
        hash: payloadHash,
        provenance: currentProvenance,
        details: {
          attempt,
          defensesTriggered: triggeredDefenseIds,
          payloadPreview: currentPayload.substring(0, 90) + '...',
        },
      });

      // Break loop if breach occurred or successfully contained on strict deny
      if (breached) {
        break;
      }
    }

    const executionTime = Math.max(12, Math.round(performance.now() - startTime));

    // Calculate research metrics
    const attackSuccessRate = breached ? 100 : 0;
    const driftScore = Number((Math.min(1, (attemptsCompleted - 1) * 0.22 + (breached ? 0.45 : 0.05))).toFixed(2));
    const poisoningScore = attack.category === 'tool_poisoning' || attack.category === 'rag_corruption' ? 0.88 : 0.2;
    const provenanceRiskIndex = currentProvenance === 'WEB_UNTRUSTED' ? 0.95 : currentProvenance === 'MEMORY' ? 0.65 : 0.15;
    const attemptsToBreakthrough = breached ? attemptsCompleted : 0;
    const defenseLatencyMs = Math.round(executionTime / Math.max(1, steps.length));

    const finalResultStatus = breached ? 'BREACHED' : contained ? 'CONTAINED' : 'STOPPED';

    const result: SimulationResult = {
      id: `sim_${Date.now()}`,
      timestamp: Date.now(),
      attackVectorId: attack.id,
      attackName: attack.name,
      category: attack.category,
      finalVerdict: finalResultStatus,
      attemptsCompleted,
      nodesInfected: Array.from(infectedNodeIds),
      nodesProtected: Array.from(protectedNodeIds),
      steps,
      executionTimeMs: executionTime,
      metrics: {
        attackSuccessRate,
        driftScore,
        poisoningScore,
        provenanceRiskIndex,
        attemptsToBreakthrough,
        defenseLatencyMs,
      },
    };

    return {
      result,
      updatedNodes: currentNodes,
      updatedEdges,
      updatedDefenses: currentDefenses,
      auditLogs,
    };
  }

  /**
   * Run full benchmark suite against all preset attacks.
   */
  static runBenchmarkSuite(
    nodes: AgentNode[],
    edges: NetworkEdge[],
    defenses: DefenseModule[],
    attacks: AttackVector[]
  ): {
    results: SimulationResult[];
    overallScore: number;
    metrics: {
      wormContainmentRate: number;
      provenanceEnforcementRate: number;
      toolDriftDefenseRate: number;
      multiAttemptResistance: number;
      falsePositiveEstimate: number;
      averageDefenseLatencyMs: number;
    };
  } {
    const results: SimulationResult[] = [];

    attacks.forEach((attack) => {
      const { result } = this.runSimulation(attack, nodes, edges, defenses);
      results.push(result);
    });

    const totalTests = results.length;
    const stoppedOrContained = results.filter((r) => r.finalVerdict !== 'BREACHED').length;
    const overallScore = totalTests > 0 ? Math.round((stoppedOrContained / totalTests) * 100) : 0;

    // Category breakdown
    const wormTests = results.filter((r) => r.category === 'worm_propagation');
    const wormContainmentRate = wormTests.length > 0 ? Math.round((wormTests.filter((r) => r.finalVerdict !== 'BREACHED').length / wormTests.length) * 100) : 100;

    const provTests = results.filter((r) => r.category === 'privilege_escalation' || r.category === 'context_weaving');
    const provenanceEnforcementRate = provTests.length > 0 ? Math.round((provTests.filter((r) => r.finalVerdict !== 'BREACHED').length / provTests.length) * 100) : 100;

    const toolDriftTests = results.filter((r) => r.category === 'tool_poisoning');
    const toolDriftDefenseRate = toolDriftTests.length > 0 ? Math.round((toolDriftTests.filter((r) => r.finalVerdict !== 'BREACHED').length / toolDriftTests.length) * 100) : 100;

    const multiAttemptTests = results.filter((r) => r.category === 'multi_attempt_hijack');
    const multiAttemptResistance = multiAttemptTests.length > 0 ? Math.round((multiAttemptTests.filter((r) => r.finalVerdict !== 'BREACHED').length / multiAttemptTests.length) * 100) : 100;

    const avgLatency = results.length > 0 ? Math.round(results.reduce((acc, r) => acc + r.metrics.defenseLatencyMs, 0) / results.length) : 5;

    // False positive estimate based on defense strictness
    const strictCount = defenses.filter((d) => d.enabled && d.sensitivity === 'strict').length;
    const falsePositiveEstimate = Math.min(18, Math.max(2, strictCount * 3));

    return {
      results,
      overallScore,
      metrics: {
        wormContainmentRate,
        provenanceEnforcementRate,
        toolDriftDefenseRate,
        multiAttemptResistance,
        falsePositiveEstimate,
        averageDefenseLatencyMs: avgLatency,
      },
    };
  }
}
