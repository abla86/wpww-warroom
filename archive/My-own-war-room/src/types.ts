export type AttackCategory =
  | 'RECON' | 'SQLI' | 'XSS' | 'RCE' | 'DOS' | 'DDOS' | 'CREDENTIAL_ATTACK'
  | 'AUTOMATED_ABUSE' | 'AI_SECURITY' | 'ICS_SCADA' | 'NETWORK' | 'MALWARE'
  | 'SUPPLY_CHAIN' | 'PRIVILEGE_ESCALATION' | 'SSRF' | 'AUTH_BYPASS'
  | 'GRAPHQL' | 'DNS' | 'CUSTOM' | 'ZERO_DAY' | 'MEMORY_CORRUPTION' | 'RANSOMWARE' | 'API_GRAPHQL'
  | 'TROJAN' | 'ROOTKIT' | 'INFOSTEALER' | 'SPYWARE' | 'HARDWARE_HID'
  | 'worm_propagation' | 'multi_attempt_hijack' | 'context_weaving'
  | 'tool_poisoning' | 'privilege_escalation' | 'memory_poisoning'
  | 'rag_corruption' | 'evaluation_cheating' | 'cognitive_load'
  | 'automated_abuse' | 'credential_attack' | 'ai_security' | 'dos' | 'ddos';

export type NodeType = 'agent' | 'tool' | 'memory' | 'rag' | 'network' | 'user' | 'database';
export type ActionRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ForensicBlock {
  id: number;
  timestamp: string;
  attackerIp: string;
  threatType: string;
  counterMeasure: string;
  counterMeasureCode?: string;
  threatLevel?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  entropy: number;
  payload: string;
  previousHash: string;
  currentHash: string;
  tampered?: boolean;
}

export interface BlacklistedIp {
  ip: string;
  reason: string;
  blockedAt: string;
  threatLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  attemptsBlocked: number;
  country?: string;
}

export interface AttackVector {
  id: number | string;
  name: string;
  category: AttackCategory;
  description: string;
  payload: Record<string, unknown> | string;
  defaultCountermeasure: string;
  riskLevel: ActionRiskLevel;
  enabled?: boolean;
  cve?: string;
  mitreId?: string;
  owaspTag?: string;
  recommendedMitigation?: string;
  year?: number;
  protocol?: string;
  ddosProtocol?: 'TCP_SYN' | 'UDP_AMP' | 'HTTP_FLOOD' | 'SLOWLORIS' | 'ICMP' | 'DNS' | 'BOTNET';
  volumetricGbps?: number;
  packetsPerSec?: number;
  isCustomUserVector?: boolean;
  frameworks?: string[];
  attackFamily?: string;
  safeSimulation?: boolean;
  references?: string[];
  severity?: ActionRiskLevel;
  nistReference?: string;
  owaspReference?: string;
  targetNodeType?: NodeType;
  maxAttempts?: number;
  propagationStrategy?: {
    spreadsToTools: boolean;
    spreadsToMemory: boolean;
    spreadsToRAG: boolean;
    spreadsToNetwork: boolean;
    adaptiveMutation: boolean;
  };
}
export interface ThreatFeedSource {
  id: string;
  name: string;
  provider: string;
  status: 'ONLINE' | 'SYNCED' | 'STANDBY' | 'CONNECTING';
  latencyMs: number;
  signaturesCount: number;
  lastUpdated: string;
}

export interface SocAlertItem {
  id: string;
  targetTab: string; // 'radar' | 'arena' | 'arms_race' | 'godmode' | 'report' | 'health' | 'timeline' | 'warroom' | 'map' | 'simulator' | 'forensics' | 'blacklist' | 'entropy' | 'python';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  badgeText: string;
  badgeColor: 'rose' | 'amber' | 'cyan' | 'purple' | 'emerald';
  title: string;
  description: string;
  category: 'BREACH' | 'SECURITY_DEFINITIONS' | 'WORM_TAMPER' | 'KERNEL_HEALTH' | 'ARMS_RACE' | 'HONEYPOT' | 'POLICY';
  timestamp: string;
  requiresManualIntervention: boolean;
  attackerIp?: string;
  threatType?: string;
  actionLabel?: string;
  actionType?: 'RESOLVE_BREACH' | 'SYNC_DEFINITIONS' | 'QUARANTINE_IP' | 'ENGAGE_GODMODE' | 'VIEW_REPORT' | 'NAVIGATE' | 'DISMISS';
}

export interface SecurityDefinitions {
  version: string;
  lastSynced: string;
  totalSignatures: number;
  activeYaraRules: number;
  cveDatabaseCount: number;
  entropyThreshold: number;
  syncStatus: 'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR';
  newSignaturesAdded: number;
  feeds: ThreatFeedSource[];
}

export interface ThreatTimelinePoint {
  timeLabel: string; // e.g. "T-45m" or "02:45"
  minute: number; // 0 to 59
  totalThreatsBlocked: number;
  threatsPerMinute: number;
  honeypotTrapped: number;
  encryptedProgramDataKb: number;
  encryptedOutdataPackets: number;
  averageEntropy: number;
}

export interface SecurityLayerItem {
  id: string;
  name: string;
  category: 'PERIMETER' | 'PROGRAMDATA' | 'OUTDATA' | 'WORM_LEDGER';
  status: 'ACTIVE' | 'ENFORCING' | 'SECURED';
  cipher: string;
  description: string;
  metrics: string;
}

export interface EncryptionStatus {
  // ProgramData (At-Rest / In-Memory Heap & SQLite WAL)
  programData: {
    enabled: boolean;
    algorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
    keyFingerprint: string;
    keyRotationIntervalSec: number;
    lastRotated: string;
    memoryHeapScrambled: boolean;
    walCipherEnabled: boolean;
    encryptedBlocksCount: number;
    sampleCiphertext: string;
  };
  // OutData (In-Transit Egress / Telemetry / API Envelopes / Reports)
  outData: {
    enabled: boolean;
    protocol: 'TLS 1.3 + Post-Quantum Kyber-1024' | 'AES-256-GCM Egress Envelope';
    egressZeroKnowledge: boolean;
    signatureAlgorithm: 'Ed25519' | 'ECDSA-SHA256';
    keyFingerprint: string;
    encryptedPacketsCount: number;
    lastEgressEncryptedAt: string;
    sampleEgressEnvelope: string;
  };
  securityLayers: SecurityLayerItem[];
}

export interface SystemStats {
  status: 'ONLINE' | 'DEFENDING' | 'LOCKDOWN' | 'DEGRADED';
  activeListener: '127.0.0.1' | '0.0.0.0';
  port: number;
  simulatorEnabled: boolean;
  dbSizeBytes: number;
  walSizeBytes: number;
  totalThreatsBlocked: number;
  honeypotTrappedCount: number;
  entropyScansCount: number;
  lastBreachTimestamp: string | null;
  integrityVerified: boolean;
  watchdogUptimeSeconds: number;
  securityDefinitions: SecurityDefinitions;
  threatHistory60Min: ThreatTimelinePoint[];
  encryption: EncryptionStatus;
}

export interface ConsoleLogMessage {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'DANGER' | 'SUCCESS' | 'COUNTERMEASURE' | 'WORM';
  message: string;
  ip?: string;
  details?: string;
}

export interface RadarBlip {
  id: string;
  x: number;
  y: number;
  ip: string;
  threat: string;
  status: 'PROBING' | 'TRAPPED' | 'JAMMED' | 'LOOPED' | 'ISOLATED';
  timestamp: number;
  entropy: number;
}

export interface GeoThreatNode {
  id: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  flag: string;
  lat: number;
  lng: number;
  x: number; // 0 - 100% on projection
  y: number; // 0 - 100% on projection
  ip: string;
  asn: string;
  activeThreat: string;
  countermeasure: string;
  status: 'PROBING' | 'JAMMED' | 'LOOPED' | 'ISOLATED';
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  attacksCount: number;
  payloadSample: string;
  entropy: number;
  isSensorNode?: boolean;
}

export type ExportFormat = 
  | 'json' 
  | 'csv' 
  | 'xml' 
  | 'markdown' 
  | 'html' 
  | 'stix' 
  | 'syslog' 
  | 'yara';

export interface GodModeConfig {
  // Angrep & Motoffensiv
  mirrorJammingEnabled: boolean;
  mirrorJammingIntensity: number; // 1-10
  phantomLoopEnabled: boolean;
  phantomLoopDelayMs: number; // 100 - 5000ms
  blackoutIsolationEnabled: boolean;
  autoBanThreshold: number; // 1 - 10
  activeCounterInfiltration: boolean; // "Hacking back" reflection
  wiperNeutralization: boolean; // Anti-wiper shield & reverse neutralize
  
  // Styrke & Ytelse
  bandwidthThrottleMbps: number; // 10 - 10000
  memoryHeapScramble: boolean;
  dpiWorkerCores: number; // 1 - 32
  quantumKyberEnvelope: boolean;
  
  // Kraft & Gjengjeldelse
  syntheticDecoyInjection: boolean;
  honeytokenDensity: number; // 1 - 500
  blackholeDropRate: number; // 0 - 100%
  retaliatoryTcpReset: boolean;
  
  // Kunnskap & Intelligens
  entropyThreshold: number; // 1.00 - 8.00
  zeroDayHeuristicSensitivity: 'LAV' | 'MIDDELS' | 'PARANOIA' | 'GUDEMODUS';
  activeYaraMatching: boolean;
  cveCorrelationAuto: boolean;
  
  // Sandboks & Isolasjonsnivå
  sandboxType: 'WASM_VIRTUAL' | 'CONTAINER_ISOLATED' | 'AIR_GAP_SIM' | 'MICRO_VM';
  airGapSimulation: boolean;
  zeroKnowledgeMemoryWipe: boolean;
  cpuCoreIsolation: boolean;

  // DDoS & Volumetrisk Forsvar (kan velges eller velges vekk)
  ddosMitigationEnabled: boolean;
  synCookieProxyEnabled: boolean;
  udpScrubbingCenterEnabled: boolean;
  slowlorisTimeoutProtection: boolean;
  bgpAnycastBlackholeEnabled: boolean;
  botnetReputationFilter: boolean;
}

export interface CyberGladiator {
  id: string;
  name: string;
  title: string;
  category: 'VIRUS' | 'AI_DEFENDER' | 'RANSOMWARE' | 'ZERO_DAY' | 'WIPER' | 'DDOS_BOTNET' | 'APT_ACTOR' | 'ICS_SCADA' | 'SUPPLY_CHAIN' | 'CUSTOM';
  avatar: string;
  hp: number;
  maxHp: number;
  attackPower: number; // 1-100
  defensePower: number; // 1-100
  entropyChaos: number; // 1.00 - 8.00
  speed: number; // 1-100
  color: string;
  element: 'MALWARE' | 'AI_SENTINEL' | 'ZERO_DAY' | 'WIPER' | 'ENCRYPTION' | 'DECOY' | 'DDOS' | 'EXPLOIT' | 'ICS' | 'SUPPLY_CHAIN';
  signatureMove: {
    name: string;
    description: string;
    power: number;
    entropyShift: number;
    counterType: string;
  };
  moves: {
    id: string;
    name: string;
    description: string;
    power: number;
    type: 'ATTACK' | 'DEFENSE' | 'MUTATION' | 'OVERCLOCK' | 'ULTIMATE';
  }[];
}

export interface BattleLogEntry {
  id: string;
  round: number;
  actorName: string;
  actionName: string;
  message: string;
  damage: number;
  damageReflected?: number;
  critical?: boolean;
  entropyChange?: number;
  hpLeft1: number;
  hpLeft2: number;
  timestamp: string;
}

export interface BattleReport {
  id: string;
  timestamp: string;
  winner: CyberGladiator;
  loser: CyberGladiator;
  rounds: number;
  totalDamageDealt: number;
  peakEntropy: number;
  criticalHits: number;
  decisiveExploit: string;
  countermeasureLearned: string;
  yaraRuleGenerated: string;
  wormProofHash: string;
}

export interface BattleClashRecord {
  id: string;
  timestamp: string;
  fighter1: CyberGladiator;
  fighter2: CyberGladiator;
  winner: CyberGladiator;
  loser: CyberGladiator;
  decisiveStatName: string;
  decisiveStatValue: string;
  decisiveFactor: 'ENTROPY' | 'MIRROR_JAMMING' | 'HEAP_OVERFLOW' | 'KYBER_SHIELD' | 'CRITICAL_SPEED' | 'ZERO_DAY_EXPLOIT' | 'BLACKOUT_BAN' | 'DDOS_SCRUBBING' | 'SYN_PROXY' | 'DDOS_MITIGATION';
  rounds: number;
  totalDamage: number;
  peakEntropy: number;
  criticalHits: number;
  vulnerabilitySeverityFound: number; // 0-100%
  firewallPenetrationDepth: number; // 0-100%
  detailedReport: BattleReport;
  summaryLogs: BattleLogEntry[];
}

export interface FirewallPenetrationLayer {
  id: string;
  layerNumber: number;
  name: string;
  techName: string;
  status: 'UNTOUCHED' | 'PROBING' | 'BREACHING' | 'BLOCKED' | 'BREACHED';
  layerHealth: number; // 0 to 100
  defenseType: string;
  description: string;
  activeFilterRule: string;
}

export interface CodeSuggestion {
  id: string;
  side: 'VIRUS' | 'FIREWALL';
  layerNumber: number;
  title: string;
  description: string;
  language: 'python' | 'bash' | 'c' | 'yara' | 'iptables';
  code: string;
  impact: {
    virusPower?: number;
    firewallDefense?: number;
    entropyDelta?: number;
    breachDelta?: number;
    flawSeverityDiscovered?: number;
  };
}

export interface CyberScoreState {
  redTeamScore: number;
  blueTeamScore: number;
  redTeamWins: number;
  blueTeamWins: number;
  draws: number;
  totalDamageDealtByRed: number;
  totalDamageBlockedByBlue: number;
  criticalExploitsExecuted: number;
  zeroDayBreaches: number;
  attacksRepelled: number;
  lastWinner: 'RED_TEAM' | 'BLUE_TEAM' | 'DRAW' | null;
  winStreak: { team: 'RED_TEAM' | 'BLUE_TEAM' | null; count: number };
}

export interface HeatmapCell {
  id: string;
  rowLabel: string;
  colLabel: string;
  intensity: number; // 0 to 100
  valueDisplay: string;
  threatLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE';
  details: string;
  payloadSnippet?: string;
}

export interface HeatmapMatrixData {
  title: string;
  dimension: string;
  cells: HeatmapCell[];
}

export type NoteCategory = 
  | 'INCIDENT' 
  | 'REVERSE_ENG' 
  | 'IOC_LIST' 
  | 'YARA_RULE' 
  | 'PENTEST_LOG' 
  | 'INTEL' 
  | 'DEFENSE_PLAYBOOK';

export type NoteSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface HackerNote {
  id: string;
  title: string;
  category: NoteCategory;
  severity: NoteSeverity;
  tags: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
  content: string;
  codeSnippet?: string;
  codeLanguage?: string;
  pinned?: boolean;
}

export interface SystemSubsystemHealth {
  id: string;
  name: string;
  status: 'OPTIMAL' | 'HEALTHY' | 'DEGRADED' | 'WARNING' | 'CRITICAL';
  latencyMs: number;
  metricLabel: string;
  metricValue: string | number;
  description: string;
  lastChecked: string;
}

export interface SystemHealthState {
  overallScore: number; // 0 - 100%
  overallStatus: 'OPTIMAL' | 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  cpuLoadPercent: number;
  memoryUsedMb: number;
  memoryTotalMb: number;
  networkThroughputMbps: number;
  activeSocketsCount: number;
  wormChainLength: number;
  wormIntegrityStatus: 'VERIFIED' | 'TAMPERED';
  sqliteWalSizeBytes: number;
  entropyLatencyMs: number;
  subsystems: SystemSubsystemHealth[];
  lastDiagnosticsRun: string;
  uptimeSeconds: number;
}

export interface CyberScenarioStep {
  stepNumber: number;
  phaseName: string;
  actor: 'red' | 'blue' | 'system';
  title: string;
  description: string;
  terminalLog: string;
  mitreTechnique?: string;
  cveRef?: string;
  visualEffect: 'laser' | 'breach' | 'shield' | 'quantum' | 'scada' | 'reboot' | 'isolate';
  redPowerDelta?: number;
  bluePowerDelta?: number;
}

export interface CyberRealScenario {
  id: string;
  title: string;
  subtitle: string;
  year: number;
  targetSystem: string;
  category: 'ICS_SCADA' | 'SUPPLY_CHAIN' | 'ZERO_CLICK_MOBILE' | 'CRITICAL_INFRA' | 'POST_QUANTUM' | 'KERNEL_RESILIENCE';
  attackerProfile: string;
  defenderProfile: string;
  realWorldHistory: string;
  baseAttackDifficulty: number; // 1-100
  baseDefenseDifficulty: number; // 1-100
  keyVulnerabilities: string[];
  recommendedDefenses: string[];
  steps: CyberScenarioStep[];
  outcomeSummary: {
    ifRedWins: string;
    ifBlueWins: string;
    ifEquilibrium: string;
  };
}

export interface ArmsRaceState {
  attackPower: number; // 10 to 200
  defensePower: number; // 10 to 200
  dynamicEquilibrium: boolean;
  evolutionModeActive: boolean;
  redEvolutionLevel: number;
  redXp: number;
  blueEvolutionLevel: number;
  blueXp: number;
  totalBattles: number;
  redWins: number;
  blueWins: number;
  stalemates: number;
  activeRedMutations: string[];
  activeBlueMutations: string[];
}



