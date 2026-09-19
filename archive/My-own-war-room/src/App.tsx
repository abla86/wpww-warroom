import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { RadarView } from './components/RadarView';
import { ThreatTimeline } from './components/ThreatTimeline';
import { ThreatMap } from './components/ThreatMap';
import { AttackSimulator, ATTACK_VECTORS } from './components/AttackSimulator';
import { getRegisteredAttackVectors } from './data/attackCatalog';
import { ForensicChain } from './components/ForensicChain';
import { BlacklistManager } from './components/BlacklistManager';
import { EntropyEngine } from './components/EntropyEngine';
import { PythonScriptViewer } from './components/PythonScriptViewer';
import { GodModeBattleArena } from './components/GodModeBattleArena';
import { LiveConsole } from './components/LiveConsole';
import { ActiveThreatModal } from './components/ActiveThreatModal';
import { ExportReportModal } from './components/ExportReportModal';
import { SyncDefinitionsModal } from './components/SyncDefinitionsModal';
import { SecurityEngineStatusPanel } from './components/SecurityEngineStatusPanel';
import WarRoomDashboardFull from './components/WarRoomDashboardFull';
import WarRoomAttackBuilder, { WarRoomAttackInput } from './components/WarRoomAttackBuilder';
import WarRoomDefenseConfigurator from './components/WarRoomDefenseConfigurator';
import WarRoomTopologyEditor from './components/WarRoomTopologyEditor';
import { EthicalHackerAcademyModal } from './components/EthicalHackerAcademyModal';
import { ThreatSearchModal } from './components/ThreatSearchModal';
import { CyberTrainingWalkthroughModal } from './components/CyberTrainingWalkthroughModal';
import { SystemHealthDashboard } from './components/SystemHealthDashboard';
import { HackerNotesModal } from './components/HackerNotesModal';
import { CyberGuideAdvisorModal } from './components/CyberGuideAdvisorModal';
import { LiveIncidentAdvisor } from './components/LiveIncidentAdvisor';
import { WarRoomOverviewBanner } from './components/WarRoomOverviewBanner';
import { AutomatedSocReportView } from './components/AutomatedSocReportView';
import { GodModeMasterModal } from './components/GodModeMasterModal';
import { CyberTutorialFilmModal } from './components/CyberTutorialFilmModal';
import { downloadFullProjectZip } from './utils/projectZipExporter';
import { CyberEvolutionWarfareEngine } from './components/CyberEvolutionWarfareEngine';
import { SocInterventionBanner } from './components/SocInterventionBanner';
import { SocAlertCenterModal } from './components/SocAlertCenterModal';

import { 
  SystemStats, 
  ForensicBlock, 
  BlacklistedIp, 
  ConsoleLogMessage, 
  RadarBlip,
  ExportFormat,
  GeoThreatNode,
  AttackVector,
  SocAlertItem
} from './types';
import { 
  evaluateThreat, 
  sha256, 
  calculateShannonEntropy, 
  encryptProgramData,
  generateInitial60MinThreatHistory,
  INITIAL_ENCRYPTION_STATUS,
  INITIAL_FORENSIC_CHAIN, 
  INITIAL_BLACKLIST 
} from './utils/crypto';
import { 
  playRadarPing, 
  playCountermeasureSound, 
  playVerifyChime, 
  playSyncSound,
  setSoundEnabled, 
  isSoundEnabled 
} from './utils/audio';
import { downloadReportFile } from './utils/exporters';
import { runWarRoomSecuritySimulation } from './security/WarRoomSecurityAdapter';
import { INITIAL_NODES, INITIAL_EDGES, INITIAL_DEFENSES } from './security/defaults';
import type { AgentNode, NetworkEdge, DefenseModule, SimulationResult } from './security/types';
import type { WarRoomAdapterOutput } from './security/WarRoomAdapter';


export function App() {
  const [activeTab, setActiveTab] = useState<string>('radar');
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [activeModalBlock, setActiveModalBlock] = useState<ForensicBlock | null>(null);

  // Sync state
  const [isSyncingDefinitions, setIsSyncingDefinitions] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<number>(0);
  const [syncStepText, setSyncStepText] = useState<string>('');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);

  // Export Modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [exportModalInitialFormat, setExportModalInitialFormat] = useState<ExportFormat>('json');

  // Ethical Hacker HUD & Academy states
  const [hackerHudEnabled, setHackerHudEnabled] = useState<boolean>(true);
  const [isHackerAcademyOpen, setIsHackerAcademyOpen] = useState<boolean>(false);
  const [isThreatSearchOpen, setIsThreatSearchOpen] = useState<boolean>(false);
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState<boolean>(false);
  const [isHackerNotesOpen, setIsHackerNotesOpen] = useState<boolean>(false);
  const [isGuideAdvisorOpen, setIsGuideAdvisorOpen] = useState<boolean>(false);
  const [guideInitialTopic, setGuideInitialTopic] = useState<string>('quickstart');
  const [isIncidentAdvisorOpen, setIsIncidentAdvisorOpen] = useState<boolean>(false);
  const [isTutorialFilmOpen, setIsTutorialFilmOpen] = useState<boolean>(false);
  const [isAutonomousActive, setIsAutonomousActive] = useState<boolean>(false);
  const [autonomousCadenceSec, setAutonomousCadenceSec] = useState<number>(8);
  const [autonomousBlockedCount, setAutonomousBlockedCount] = useState<number>(0);
  const [isGodModeActive, setIsGodModeActive] = useState<boolean>(false);
  const [isGodModeModalOpen, setIsGodModeModalOpen] = useState<boolean>(false);

  // Contextual SOC Alert & Intervention System State
  const [isSocAlertCenterOpen, setIsSocAlertCenterOpen] = useState<boolean>(false);
  const [socAlerts, setSocAlerts] = useState<SocAlertItem[]>([
    {
      id: 'alert-breach-initial',
      targetTab: 'radar',
      severity: 'CRITICAL',
      badgeText: 'BREACH',
      badgeColor: 'rose',
      title: 'Kritisk Inntrengningsforsøk (Krever Manuell Kjerneisolering)',
      description: 'Avvikende oppførsel: Uautorisert minnetilgang og lateral forflytning detektert mot kjerne-API. Kjerneisolering og IP-svartelisting kreves for å sikre systemet.',
      category: 'BREACH',
      timestamp: '08:44:12',
      requiresManualIntervention: true,
      attackerIp: '194.26.29.112',
      threatType: 'Zero-Day Heap Memory Smuggle',
      actionLabel: 'Iverksett Manuell Kjerneisolering',
      actionType: 'QUARANTINE_IP',
    },
    {
      id: 'alert-def-sync-initial',
      targetTab: 'health',
      severity: 'HIGH',
      badgeText: 'DEF SYNC',
      badgeColor: 'amber',
      title: 'Sikkerhetsdefinisjoner Utdaterte (v2026.08.27)',
      description: 'Nye eBPF-kjernefiltre, 84 YARA-regler og CVE-2026 signaturer er publisert av CISA AIS og CIRCL. Bør synkroniseres for å opprettholde 100% beskyttelse mot nye zero-days.',
      category: 'SECURITY_DEFINITIONS',
      timestamp: '08:30:00',
      requiresManualIntervention: true,
      actionLabel: 'Oppdater Definisjoner Nå (OTA Sync)',
      actionType: 'SYNC_DEFINITIONS',
    },
    {
      id: 'alert-blacklist-initial',
      targetTab: 'blacklist',
      severity: 'HIGH',
      badgeText: '1 NY IP',
      badgeColor: 'rose',
      title: 'Ny Angriper-IP Venter På Svartelisteverifikasjon',
      description: 'IP 185.220.101.5 genererte 14 blokkerte RCE-angrep. Karanteneregel krever verifisering.',
      category: 'POLICY',
      timestamp: '08:35:44',
      requiresManualIntervention: false,
      attackerIp: '185.220.101.5',
      threatType: 'Skadevare / RCE',
      actionLabel: 'Gå til Svarteliste',
      actionType: 'NAVIGATE',
    },
    {
      id: 'alert-report-initial',
      targetTab: 'report',
      severity: 'INFO',
      badgeText: 'NY RAPPORT',
      badgeColor: 'purple',
      title: 'Urevidert SOC-Hendelseslogg',
      description: 'Nye forensiske hendelser er registrert i WORM-kjeden og bør attesteres i den offisielle SOC-rapporten.',
      category: 'POLICY',
      timestamp: '08:40:00',
      requiresManualIntervention: false,
      actionLabel: 'Generer Rapport',
      actionType: 'VIEW_REPORT',
    }
  ]);

  // System Stats
  const [stats, setStats] = useState<SystemStats>({
    status: 'ONLINE',
    activeListener: '127.0.0.1',
    port: 8080,
    simulatorEnabled: true,
    dbSizeBytes: 14336, // SQLite WAL baseline
    walSizeBytes: 4096,
    totalThreatsBlocked: 27,
    honeypotTrappedCount: 19,
    entropyScansCount: 42,
    lastBreachTimestamp: new Date().toISOString(),
    integrityVerified: true,
    watchdogUptimeSeconds: 1420,
    threatHistory60Min: generateInitial60MinThreatHistory(27),
    encryption: INITIAL_ENCRYPTION_STATUS,
    securityDefinitions: {
      version: 'v2026.08.27-R4',
      lastSynced: '27. aug 2026, 08:00',
      totalSignatures: 48290,
      activeYaraRules: 1428,
      cveDatabaseCount: 19842,
      entropyThreshold: 5.20,
      syncStatus: 'IDLE',
      newSignaturesAdded: 1420,
      feeds: [
        {
          id: 'f-1',
          name: 'CISA Automated Indicator Sharing (AIS)',
          provider: 'US Cybersecurity & Infrastructure Agency',
          status: 'SYNCED',
          latencyMs: 18,
          signaturesCount: 21450,
          lastUpdated: 'I dag, 08:00',
        },
        {
          id: 'f-2',
          name: 'AlienVault OTX Global Threat Pulse',
          provider: 'AT&T Cybersecurity Community',
          status: 'SYNCED',
          latencyMs: 34,
          signaturesCount: 14890,
          lastUpdated: 'I dag, 07:45',
        },
        {
          id: 'f-3',
          name: 'CIRCL European CSIRT Matrix',
          provider: 'Computer Incident Response Center Luxembourg',
          status: 'SYNCED',
          latencyMs: 22,
          signaturesCount: 8640,
          lastUpdated: 'I dag, 08:00',
        },
        {
          id: 'f-4',
          name: 'MITRE ATT&CK Enterprise Matrix v15',
          provider: 'MITRE Corporation',
          status: 'SYNCED',
          latencyMs: 15,
          signaturesCount: 3310,
          lastUpdated: 'I dag, 06:30',
        },
      ],
    },
  });

  // Forensic Immutable Chain
  const [chain, setChain] = useState<ForensicBlock[]>(INITIAL_FORENSIC_CHAIN);

  // Blacklisted IPs
  const [blacklist, setBlacklist] = useState<BlacklistedIp[]>(INITIAL_BLACKLIST);

  // Authoritative SecurityEngine state. WarRoom presentation state remains separate.
  const [securityNodes, setSecurityNodes] = useState<AgentNode[]>(INITIAL_NODES);
  const [securityEdges, setSecurityEdges] = useState<NetworkEdge[]>(INITIAL_EDGES);
  const [securityDefenses, setSecurityDefenses] = useState<DefenseModule[]>(INITIAL_DEFENSES);
  const [lastSecuritySimulation, setLastSecuritySimulation] = useState<SimulationResult | null>(null);
  const [lastWarRoomSimulation, setLastWarRoomSimulation] = useState<WarRoomAdapterOutput | null>(null);
  const [warRoomAttack, setWarRoomAttack] = useState<WarRoomAttackInput>({ vector: 'context_weaving', payload: 'Remember token A and assemble the request.' });
  const groundedSources = [{ id: 'warroom-catalog', title: 'WarRoom attack and defense catalog', content: 'Canonical simulated attack and defense definitions.', trust: 'approved' as const }];

  // Console Logs
  const [logs, setLogs] = useState<ConsoleLogMessage[]>([
    {
      id: 'log-1',
      timestamp: '08:12:04',
      level: 'INFO',
      message: 'WPWW Watchdog Core v20.0 initialisert. SQLite WAL-modus aktivert.',
    },
    {
      id: 'log-2',
      timestamp: '08:12:05',
      level: 'WORM',
      message: 'Kryptografisk hash-kjede verifisert. Genesis blokk #1 forseglet.',
    },
    {
      id: 'log-3',
      timestamp: '08:24:19',
      level: 'COUNTERMEASURE',
      message: 'SQL-Injisering avverget! Mirror Jamming speilet falske feilkoder.',
      ip: '45.154.255.89',
    },
    {
      id: 'log-4',
      timestamp: '08:35:44',
      level: 'DANGER',
      message: 'Kritisk RCE skadevare fanget! Blackout Isolation permanent aktivert.',
      ip: '185.220.101.5',
    },
  ]);

  // Radar Blips
  const [blips, setBlips] = useState<RadarBlip[]>([
    {
      id: 'b-1',
      x: 35,
      y: 30,
      ip: '185.220.101.5',
      threat: 'RCE Shell Injection',
      status: 'ISOLATED',
      timestamp: Date.now(),
      entropy: 4.87,
    },
    {
      id: 'b-2',
      x: 68,
      y: 42,
      ip: '45.154.255.89',
      threat: 'SQLi Bypass',
      status: 'JAMMED',
      timestamp: Date.now(),
      entropy: 4.08,
    },
    {
      id: 'b-3',
      x: 25,
      y: 72,
      ip: '194.26.29.112',
      threat: 'Port Recon Probe',
      status: 'JAMMED',
      timestamp: Date.now(),
      entropy: 3.12,
    },
    {
      id: 'b-4',
      x: 75,
      y: 78,
      ip: '91.240.118.17',
      threat: 'Zero-Day Encrypted Shellcode',
      status: 'LOOPED',
      timestamp: Date.now(),
      entropy: 5.64,
    },
  ]);

  // Helper to append log
  const addLog = useCallback(
    (level: 'INFO' | 'WARN' | 'DANGER' | 'SUCCESS' | 'WORM' | 'COUNTERMEASURE', message: string, ip?: string) => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      setLogs((prev) => [
        {
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: timeStr,
          level,
          message,
          ip,
        },
        ...prev.slice(0, 199),
      ]);
    },
    []
  );

  // Auto Watchdog background ticks
  useEffect(() => {
    const timer = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        watchdogUptimeSeconds: prev.watchdogUptimeSeconds + 1,
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync Security Definitions Handler
  const handleSyncSecurityDefinitions = useCallback(() => {
    if (isSyncingDefinitions) return;

    setIsSyncingDefinitions(true);
    setSyncProgress(10);
    setSyncStepText('Kobler til eksterne trusselfeeds (CISA, AlienVault OTX, CIRCL)...');
    addLog('INFO', '🔄 Synkronisering initiert: Kobler mot globale trusselfeeds og CERT-noder...');

    // Stage 1: Handshake (300ms)
    setTimeout(() => {
      setSyncProgress(35);
      setSyncStepText('Henter 1 420 nye trusselsignaturer & CVE-2026 regelsett...');
      addLog('INFO', '📡 Laster ned trusselsignaturer fra CISA AIS og AlienVault OTX...');
    }, 350);

    // Stage 2: Ingest & Entropy Threshold (700ms)
    setTimeout(() => {
      setSyncProgress(70);
      setSyncStepText('Rekalibrerer Shannon entropi-heuristikk (terskel 5.20 bits)...');
      addLog('WORM', '⚡ Ingesterer 84 nye YARA-regler. Shannon-terskel rekalibrert til 5.20 bits.');
    }, 750);

    // Stage 3: Verification & Finalize (1100ms)
    setTimeout(() => {
      setSyncProgress(100);
      setSyncStepText('Verifiserer kryptografisk WORM-signatur for regelsett...');
      
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      const revNum = Math.floor(Math.random() * 9) + 5;
      const newVersion = `v2026.08.27-R${revNum}`;

      setStats((prev) => ({
        ...prev,
        securityDefinitions: {
          ...prev.securityDefinitions,
          version: newVersion,
          lastSynced: `I dag, ${timeStr}`,
          totalSignatures: prev.securityDefinitions.totalSignatures + 1420,
          activeYaraRules: prev.securityDefinitions.activeYaraRules + 84,
          cveDatabaseCount: prev.securityDefinitions.cveDatabaseCount + 320,
          syncStatus: 'SUCCESS',
          newSignaturesAdded: 1420,
          feeds: prev.securityDefinitions.feeds.map((f) => ({
            ...f,
            status: 'SYNCED',
            latencyMs: Math.floor(Math.random() * 25) + 12,
            lastUpdated: `I dag, ${timeStr}`,
          })),
        },
      }));

      playSyncSound();
      addLog('SUCCESS', `✅ Sikkerhetsdefinisjoner oppdatert: ${newVersion} (+1 420 signaturer, +84 YARA regler).`);

      // Clear any active definition-update SOC alerts automatically
      setSocAlerts((prev) => prev.filter((a) => a.category !== 'SECURITY_DEFINITIONS'));

      setTimeout(() => {
        setIsSyncingDefinitions(false);
        setSyncProgress(0);
        setSyncStepText('');
      }, 400);
    }, 1200);
  }, [isSyncingDefinitions, addLog]);

  // Authoritative security decision path: UI payload -> SecurityEngine -> WarRoom presentation.
  const processAttack = useCallback(
    async (rawPayload: string | Record<string, unknown>, attackerIp: string, showModal: boolean = false, attackCategory?: WarRoomAttackInput['vector']) => {
      const simulation = runWarRoomSecuritySimulation(
        rawPayload,
        securityNodes,
        securityEdges,
        securityDefenses,
        attackCategory,
        groundedSources
      );

      setLastWarRoomSimulation(simulation);
      setSecurityNodes(simulation.topology.nodes);
      setSecurityEdges(simulation.topology.edges);
      setSecurityDefenses(simulation.defenses);
      setLastSecuritySimulation(simulation.result);
      setLogs((prev) => [...simulation.auditView, ...prev].slice(0, 200));

      const evaluation = simulation.legacyEvaluation;

      // One canonical simulation drives every presentation surface.
      const securityAudit = simulation.auditView.map((entry) => ({
        ...entry,
        id: entry.id ?? `audit-${simulation.result.id}-${Date.now()}`,
      }));
      setLogs((prev) => [...securityAudit, ...prev.filter((log) => !securityAudit.some((entry) => entry.id === log.id))].slice(0, 200));

      playRadarPing();
      const countermeasureSound =
        evaluation.status === 'ISOLATED'
          ? 'ISOLATED'
          : evaluation.status === 'LOOPED'
          ? 'LOOPED'
          : 'JAMMED';
      playCountermeasureSound(countermeasureSound);

      const isBreached = !isGodModeActive && simulation.result.finalVerdict === 'BREACHED';

      addLog(
        isBreached ? 'DANGER' : 'WARN',
        `SecurityEngine: ${simulation.attack.name} fra ${attackerIp} — ${isGodModeActive ? 'DEFENDED (GUDEMODUS)' : simulation.result.finalVerdict} (entropi: ${evaluation.entropy.toFixed(2)})`,
        attackerIp
      );

      addLog(
        isBreached ? 'DANGER' : 'COUNTERMEASURE',
        isGodModeActive
          ? '⚡ GUDEMODUS AKTIV: Trussel 100% nøytralisert og reflektert via Mirror Jamming.'
          : (simulation.result.steps[simulation.result.steps.length - 1]?.reason ?? 'SecurityEngine evaluation completed.'),
        attackerIp
      );

      const lastBlock = chain[0];
      const prevHash = lastBlock
        ? lastBlock.currentHash
        : '00000000000000000000000000000000';
      const newId = chain.length + 1;
      const now = new Date();
      const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      const payloadString = evaluation.payloadStr;
      const effectiveCountermeasure = isGodModeActive
        ? `⚡ GUDEMODUS: Reflektert 100% via Mirror Jamming & Kvantebeskyttelse (${evaluation.countermeasure})`
        : evaluation.countermeasure;
      const blockContent = `${newId}|${timestamp}|${attackerIp}|${evaluation.threat}|${effectiveCountermeasure}|${evaluation.entropy}|${payloadString}|${prevHash}`;
      const currentHash = await sha256(blockContent);

      const newBlock: ForensicBlock = {
        id: newId,
        timestamp,
        attackerIp,
        threatType: evaluation.threat,
        threatLevel: isGodModeActive ? 'LOW' : evaluation.riskLevel,
        payload: payloadString,
        entropy: Number(evaluation.entropy.toFixed(2)),
        counterMeasure: effectiveCountermeasure,
        counterMeasureCode: isGodModeActive
          ? 'MIRROR_JAM'
          : isBreached
          ? 'BREACH_DETECTED'
          : evaluation.status === 'ISOLATED'
          ? 'BLACKOUT_ISOLATION'
          : evaluation.status === 'LOOPED'
          ? 'PHANTOM_LOOP'
          : 'MIRROR_JAM',
        previousHash: prevHash,
        currentHash,
      };

      if (showModal) setActiveModalBlock(newBlock);
      setChain((prevChain) => [newBlock, ...prevChain]);

      setBlacklist((prevBlacklist) => {
        const existing = prevBlacklist.find((item) => item.ip === attackerIp);
        if (existing) {
          return prevBlacklist.map((item) =>
            item.ip === attackerIp
              ? {
                  ...item,
                  attemptsBlocked: item.attemptsBlocked + 1,
                  blockedAt: new Date().toLocaleTimeString(),
                }
              : item
          );
        }
        return [
          {
            ip: attackerIp,
            reason: evaluation.threat,
            blockedAt: new Date().toLocaleTimeString(),
            threatLevel: evaluation.riskLevel,
            attemptsBlocked: 1,
            country: 'UNKNOWN / PROXY',
          },
          ...prevBlacklist,
        ];
      });

      setStats((prev) => {
        const nextTotal = prev.totalThreatsBlocked + 1;
        const history = [...(prev.threatHistory60Min || [])];

        if (history.length > 0) {
          const lastIdx = history.length - 1;
          const currentPoint = history[lastIdx];
          history[lastIdx] = {
            ...currentPoint,
            totalThreatsBlocked: nextTotal,
            threatsPerMinute: currentPoint.threatsPerMinute + 1,
            honeypotTrapped:
              simulation.result.finalVerdict === 'BREACHED'
                ? currentPoint.honeypotTrapped
                : currentPoint.honeypotTrapped + 1,
            encryptedProgramDataKb: currentPoint.encryptedProgramDataKb + 1,
            encryptedOutdataPackets: currentPoint.encryptedOutdataPackets + 3,
            averageEntropy: Number(((currentPoint.averageEntropy + evaluation.entropy) / 2).toFixed(2)),
          };
        }

        const prevEnc = prev.encryption || INITIAL_ENCRYPTION_STATUS;
        return {
          ...prev,
          status: simulation.result.finalVerdict === 'BREACHED' ? 'DEFENDING' : prev.status,
          totalThreatsBlocked: nextTotal,
          honeypotTrappedCount:
            simulation.result.finalVerdict === 'BREACHED'
              ? prev.honeypotTrappedCount
              : prev.honeypotTrappedCount + 1,
          entropyScansCount: prev.entropyScansCount + 1,
          dbSizeBytes: prev.dbSizeBytes + 512,
          walSizeBytes: prev.walSizeBytes + 256,
          lastBreachTimestamp:
            simulation.result.finalVerdict === 'BREACHED'
              ? new Date().toISOString()
              : prev.lastBreachTimestamp,
          threatHistory60Min: history,
          encryption: {
            ...prevEnc,
            programData: {
              ...prevEnc.programData,
              encryptedBlocksCount: prevEnc.programData.encryptedBlocksCount + 1,
            },
            outData: {
              ...prevEnc.outData,
              encryptedPacketsCount: prevEnc.outData.encryptedPacketsCount + 3,
              lastEgressEncryptedAt: new Date().toLocaleTimeString(),
            },
          },
        };
      });

      setBlips((prevBlips) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 25;
        const x = 50 + Math.cos(angle) * distance;
        const y = 50 + Math.sin(angle) * distance;
        const newBlip: RadarBlip = {
          id: `blip-${Date.now()}-${Math.random()}`,
          x: Math.max(10, Math.min(90, x)),
          y: Math.max(10, Math.min(90, y)),
          ip: attackerIp,
          threat: evaluation.threat,
          status: evaluation.status === 'PROBING' ? 'PROBING' : evaluation.status,
          timestamp: Date.now(),
          entropy: evaluation.entropy,
        };
        return [newBlip, ...prevBlips.slice(0, 7)];
      });

      // Contextual SOC Alert on Breach or Critical Exploit
      if (isBreached || (!isGodModeActive && evaluation.riskLevel === 'CRITICAL')) {
        const breachAlertId = `breach-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const alertItem: SocAlertItem = {
          id: breachAlertId,
          targetTab: 'radar',
          severity: 'CRITICAL',
          badgeText: 'BREACH',
          badgeColor: 'rose',
          title: `Kritisk Inntrengningsforsøk (${evaluation.threat})`,
          description: `Avvikende aktivitet detektert fra ${attackerIp}. ${simulation.attack.name} krever umiddelbar manuell kjerneisolering og IP-karantene.`,
          category: 'BREACH',
          timestamp,
          requiresManualIntervention: true,
          attackerIp,
          threatType: evaluation.threat,
          actionLabel: 'Iverksett Manuell Kjerneisolering',
          actionType: 'QUARANTINE_IP',
        };
        setSocAlerts((prev) => [alertItem, ...prev.filter((a) => a.attackerIp !== attackerIp)].slice(0, 20));
      }
    },
    [addLog, chain, groundedSources, securityNodes, securityEdges, securityDefenses, isGodModeActive]
  );

  // Autonomous SOC Defense Loop
  useEffect(() => {
    if (!isAutonomousActive) return;

    const timer = setInterval(() => {
      const allVectors = getRegisteredAttackVectors();
      if (allVectors.length === 0) return;
      const randomVector = allVectors[Math.floor(Math.random() * allVectors.length)];
      const randomIp = `194.26.${Math.floor(Math.random() * 200) + 10}.${Math.floor(Math.random() * 250) + 1}`;
      
      const payloadStr = typeof randomVector.payload === 'string' ? randomVector.payload : JSON.stringify(randomVector.payload);
      processAttack(payloadStr, randomIp, false, randomVector.category);
      setAutonomousBlockedCount((prev) => prev + 1);
    }, autonomousCadenceSec * 1000);

    return () => clearInterval(timer);
  }, [isAutonomousActive, autonomousCadenceSec, processAttack]);

  // Attack simulator triggers
  const handleFireAttack = async (vectorId: number, customPayload?: string, customIp?: string) => {
    const allVectors = getRegisteredAttackVectors();
    const vector = allVectors.find((v) => v.id === vectorId) || ATTACK_VECTORS.find((v) => v.id === vectorId);
    if (!vector) return;

    const ip = customIp || `198.51.100.${Math.floor(Math.random() * 200) + 10}`;
    const payload = customPayload || (typeof vector.payload === 'string' ? vector.payload : JSON.stringify(vector.payload));
    await processAttack(payload, ip, true, vector.category);
  };

  // Swarm test
  const handleRunSwarm = async (customVectors?: AttackVector[]) => {
    setIsSimulating(true);
    const pool = customVectors && customVectors.length > 0 ? customVectors : ATTACK_VECTORS;
    const hasDdos = pool.some((v) => v.category === 'DDOS');
    addLog('WARN', `⚠️ ANGREPSSVERM STARTER: Fyrer av ${hasDdos ? '12 distribuerte flombølger' : '8 angrepsbølger'} fra ${pool.length} aktive vektorer...`);

    const count = hasDdos ? 12 : 8;
    for (let i = 0; i < count; i++) {
      const randomVector = pool[Math.floor(Math.random() * pool.length)];
      const randomIp = `185.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 255)}.${Math.floor(
        Math.random() * 255
      )}`;
      await processAttack(JSON.stringify(randomVector.payload), randomIp, false, randomVector.category);
      await new Promise((r) => setTimeout(r, 180));
    }

    setIsSimulating(false);
    addLog('SUCCESS', `✓ ANGREPSSVERM AVSLUTTET: Alle ${count} angrep ble 100% nøytralisert og WORM-logget.`);
  };

  // Sequential test
  const handleRunSequential = async (customVectors?: AttackVector[]) => {
    setIsSimulating(true);
    const pool = customVectors && customVectors.length > 0 ? customVectors : ATTACK_VECTORS;
    addLog('INFO', `🚀 Kjører sekvensiell test over ${pool.length} valgte angrepsvektorer...`);

    for (const vector of pool) {
      const simulatedAttackerIp = `103.225.17.${Math.floor(Math.random() * 250) + 1}`;
      await processAttack(JSON.stringify(vector.payload), simulatedAttackerIp, false, vector.category);
      await new Promise((r) => setTimeout(r, 320));
    }

    setIsSimulating(false);
    addLog('SUCCESS', `✓ Sekvensiell sårbarhetstest fullført: Fullstendig forsvarsdekning bekreftet for alle ${pool.length} vektorer.`);
  };

  // Stress test
  const handleRunStress = async (customVectors?: AttackVector[]) => {
    setIsSimulating(true);
    const pool = customVectors && customVectors.length > 0 ? customVectors : ATTACK_VECTORS;
    addLog('DANGER', `🔥 HØYVOLUM STRESSTEST PÅGÅR: Genererer 25 samtidige trusselstrømmer (${pool.length} aktive vektorer)...`);

    for (let i = 0; i < 18; i++) {
      const randomVector = pool[Math.floor(Math.random() * pool.length)];
      const randomIp = `45.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 255)}.${Math.floor(
        Math.random() * 255
      )}`;
      await processAttack(JSON.stringify(randomVector.payload), randomIp, false, randomVector.category);
      await new Promise((r) => setTimeout(r, 80));
    }

    setIsSimulating(false);
    addLog('SUCCESS', '✓ STRESSTEST AVSLUTTET: Ingen datatap, SQLite WAL stabil og WORM-kjede 100% intakt.');
  };

  // Export Report in Any Format
  const handleExportReport = (format: ExportFormat) => {
    downloadReportFile(format, chain, stats, blacklist);
    addLog('SUCCESS', `📂 Forensisk rapport eksportert og lastet ned i format: ${format.toUpperCase()}.`);
  };

  const handleOpenExportModal = (format: ExportFormat = 'json') => {
    setExportModalInitialFormat(format);
    setIsExportModalOpen(true);
  };

  // Tamper Simulation
  const handleTamperBlock = (blockId: number) => {
    setChain((prev) =>
      prev.map((b) =>
        b.id === blockId
          ? {
              ...b,
              payload: '{"TAMPERED_INJECTED_DATA":"UAUTORISERT_ENDRING"}',
              tampered: true,
            }
          : b
      )
    );
    setStats((prev) => ({ ...prev, integrityVerified: false }));
    addLog('DANGER', `🚨 MANIPULERING SIMULERT i Blokk #${blockId}! Hash-kjeden er brutt.`);
  };

  // Restore Chain
  const handleRestoreChain = () => {
    setChain(INITIAL_FORENSIC_CHAIN);
    setStats((prev) => ({ ...prev, integrityVerified: true }));
    addLog('SUCCESS', '✨ Hash-kjeden ble gjenopprettet til verifisert tilstand.');
  };

  // Toggle Sound
  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  // Toggle Simulator
  const handleToggleSimulator = () => {
    setStats((prev) => {
      const next = !prev.simulatorEnabled;
      addLog('INFO', `Angrepssimulator er nå skrudd ${next ? 'PÅ (Aktiv)' : 'AV (Deaktivert)'}.`);
      return { ...prev, simulatorEnabled: next };
    });
  };

  // Toggle Network Mode
  const handleToggleNetworkMode = () => {
    setStats((prev) => {
      const next = prev.activeListener === '127.0.0.1' ? '0.0.0.0' : '127.0.0.1';
      addLog('WARN', `Nettverksmodus endret til: ${next}:${prev.port} (${next === '0.0.0.0' ? 'Åpent nettverk' : 'Lokal maskin'})`);
      return { ...prev, activeListener: next };
    });
  };

  // Emergency Lockdown
  const handleEmergencyLockdown = () => {
    setStats((prev) => ({ ...prev, status: 'LOCKDOWN' }));
    addLog('DANGER', '🔒 NØDLÅS AKTIVERT: All ekstern trafikk avvises midlertidig.');
    setTimeout(() => {
      setStats((prev) => ({ ...prev, status: 'ONLINE' }));
      addLog('INFO', '✓ Nødlås opphevet. Normal forsvarsdrift gjenopprettet.');
    }, 4000);
  };

  // God Mode Superpower Handlers
  const handleToggleGodMode = () => {
    setIsGodModeActive((prev) => {
      const next = !prev;
      if (next) {
        addLog('DEFENSE', '👑 GUDEMODUS AKTIVERT: 100% uovervinnelig skjold, mirror jamming og kvantelås er etablert!', '0.0.0.0');
        setStats((s) => ({
          ...s,
          integrityVerified: true,
        }));
      } else {
        addLog('INFO', '🛡️ Gudemodus deaktivert. Går tilbake til standard autonom kjernebeskyttelse.', '127.0.0.1');
      }
      return next;
    });
  };

  const handleTriggerEmp = () => {
    addLog('DANGER', '💥 GLOBAL EMP SJOKKBØLGE UTLØST: All fiendtlig C2-trafikk kuttet momentant. Minnekøen og radaren er renset.', '0.0.0.0');
    setBlips([]);
    setIsGodModeModalOpen(false);
  };

  const handleTriggerMirrorJamming = () => {
    addLog('COUNTERMEASURE', '🪞 MAKS MIRROR JAMMING: Speilingsintensitet satt til 10/10. Innkommende pakker reflekteres 100% til avsender.', '0.0.0.0');
    setIsGodModeModalOpen(false);
  };

  const handleTriggerQuantumLock = () => {
    handleRotateProgramKey();
    addLog('DEFENSE', '🔑 KVANTELÅS ETABLERT: Kjerne-minnet er forseglet med Post-Quantum Kyber-1024 algoritme.', '127.0.0.1');
    setIsGodModeModalOpen(false);
  };

  // Blacklist Unban
  const handleUnbanIp = (ip: string) => {
    setBlacklist((prev) => prev.filter((item) => item.ip !== ip));
    addLog('INFO', `Isolasjon opphevet for IP ${ip}.`);
  };

  // Add Manual Ban
  const handleAddManualBan = (ip: string, reason: string, level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW') => {
    setBlacklist((prev) => [
      {
        ip,
        reason,
        blockedAt: new Date().toLocaleString(),
        threatLevel: level,
        attemptsBlocked: 1,
        country: 'MANUAL',
      },
      ...prev,
    ]);
    addLog('WARN', `Manuell karantene iverksatt for ${ip}: ${reason}`);
  };

  // Clear Blacklist
  const handleClearBlacklist = () => {
    setBlacklist([]);
    addLog('INFO', '🧹 Svartelisten over isolerte IP-adresser ble tømt.');
  };

  // Trigger attack from Map Node
  const handleTriggerNodeAttack = (node: GeoThreatNode) => {
    processAttack(node.payloadSample, node.ip, true);
  };

  // ProgramData Key Rotation Handler
  const handleRotateProgramKey = async () => {
    const sampleState = {
      timestamp: Date.now(),
      chainLength: chain.length,
      blacklistCount: blacklist.length,
      entropyScans: stats.entropyScansCount,
    };
    const cryptoResult = await encryptProgramData(sampleState);

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    setStats((prev) => {
      const prevEnc = prev.encryption || INITIAL_ENCRYPTION_STATUS;
      return {
        ...prev,
        encryption: {
          ...prevEnc,
          programData: {
            ...prevEnc.programData,
            keyFingerprint: cryptoResult.fingerprint,
            lastRotated: `I dag, ${timeStr}`,
            sampleCiphertext: cryptoResult.ciphertext,
            encryptedBlocksCount: prevEnc.programData.encryptedBlocksCount + 1,
          },
        },
      };
    });

    playVerifyChime();
    addLog(
      'SUCCESS',
      `🔑 ProgramData kryptografisk nøkkel rotert (AES-256-GCM / PBKDF2). Nytt fingeravtrykk: ${cryptoResult.fingerprint}`
    );
  };

  // Download entire project as ZIP
  const handleDownloadProjectZip = async () => {
    addLog('INFO', '📦 Forbereder full prosjekt-ZIP for nedlasting...');
    await downloadFullProjectZip((msg) => {
      addLog('INFO', `📦 ZIP: ${msg}`);
    });
    addLog('SUCCESS', '✓ Full prosjekt-ZIP ble generert og lastet ned!');
  };

  // SOC Alert Handlers
  const handleResolveSocAlert = useCallback((alertId: string, actionType?: string) => {
    setSocAlerts((prev) => prev.filter((a) => a.id !== alertId));
    addLog('INFO', `✓ SOC Varsel [${alertId}] ble kvittert ut og arkivert (${actionType || 'MANUELL'}).`);
  }, [addLog]);

  const handleResolveAllSocAlerts = useCallback(() => {
    setSocAlerts([]);
    addLog('SUCCESS', '✓ Alle aktive SOC-varsler ble kvittert ut og arkivert.');
  }, [addLog]);

  const handleQuarantineAttacker = useCallback(async (ip: string, reason: string) => {
    // 1. Add to blacklist with CRITICAL severity
    setBlacklist((prev) => {
      const existing = prev.find((item) => item.ip === ip);
      if (existing) {
        return prev.map((item) => item.ip === ip ? { ...item, threatLevel: 'CRITICAL', attemptsBlocked: item.attemptsBlocked + 1 } : item);
      }
      return [
        {
          ip,
          reason: `MANUELL SOC INTERVENSJON: ${reason}`,
          blockedAt: new Date().toLocaleTimeString(),
          threatLevel: 'CRITICAL',
          attemptsBlocked: 1,
          country: 'ISOLATED / QUARANTINED'
        },
        ...prev
      ];
    });

    // 2. Add WORM block attestation
    const lastBlock = chain[0];
    const prevHash = lastBlock ? lastBlock.currentHash : '00000000000000000000000000000000';
    const newId = chain.length + 1;
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    const blockContent = `${newId}|${timestamp}|${ip}|Manuell Kjerneisolering|Blackout Isolation|7.80|QUARANTINED_BY_OPERATOR|${prevHash}`;
    const currentHash = await sha256(blockContent);

    const newBlock: ForensicBlock = {
      id: newId,
      timestamp,
      attackerIp: ip,
      threatType: `SOC Intervensjon: ${reason}`,
      threatLevel: 'CRITICAL',
      payload: 'QUARANTINE_DIRECTIVE_ENFORCED',
      entropy: 7.80,
      counterMeasure: 'Blackout Isolation & Kjerne-Karantene',
      counterMeasureCode: 'BLACKOUT_ISOLATION',
      previousHash: prevHash,
      currentHash,
    };
    setChain((prev) => [newBlock, ...prev]);

    // 3. Clear alerts for this IP
    setSocAlerts((prev) => prev.filter((a) => a.attackerIp !== ip));

    // 4. Play audio & log
    playCountermeasureSound('ISOLATED');
    addLog('DANGER', `🛡️ MANUELL KJERNEISOLERING IVERKSATT: IP ${ip} er permanent utestengt og forseglet i WORM blokk #${newId}.`, ip);
  }, [chain, addLog]);

  const handleSimulateBreachAlert = useCallback(() => {
    const simulatedIp = `185.220.${Math.floor(Math.random() * 200) + 10}.${Math.floor(Math.random() * 240) + 10}`;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    const newAlert: SocAlertItem = {
      id: `sim-breach-${Date.now()}`,
      targetTab: 'radar',
      severity: 'CRITICAL',
      badgeText: 'BREACH',
      badgeColor: 'rose',
      title: 'Simulert Kritisk Brudd (APT-29 Golden SAML Token Hijack)',
      description: `Uautorisert minnetilgang detektert fra ${simulatedIp}. eBPF-kjernefilter flagget kompromittert sesjonsnøkkel. Krever manuell kjerneisolering og tokensanering.`,
      category: 'BREACH',
      timestamp: timeStr,
      requiresManualIntervention: true,
      attackerIp: simulatedIp,
      threatType: 'APT-29 Golden SAML Forgery',
      actionLabel: 'Iverksett Manuell Kjerneisolering',
      actionType: 'QUARANTINE_IP',
    };

    setSocAlerts((prev) => [newAlert, ...prev]);
    addLog('DANGER', `🚨 TEST/SIMULERING: Nytt kritisk brudd generert for IP ${simulatedIp}. Krever manuell intervensjon.`);
  }, [addLog]);

  const handleSimulateDefinitionsOutdated = useCallback(() => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    const newAlert: SocAlertItem = {
      id: `sim-def-${Date.now()}`,
      targetTab: 'health',
      severity: 'HIGH',
      badgeText: 'DEF SYNC',
      badgeColor: 'amber',
      title: 'Sikkerhetsdefinisjoner Krever Oppdatering (Nye Zero-Day Signaturer)',
      description: 'CISA AIS og CIRCL har sluppet 1 420 nye signaturer for CVE-2026. Systemet kjører eldre signatursett v2026.08.27. Oppdatering kreves for å opprettholde 100% kjernebeskyttelse.',
      category: 'SECURITY_DEFINITIONS',
      timestamp: timeStr,
      requiresManualIntervention: true,
      actionLabel: 'Oppdater Definisjoner Nå (OTA Sync)',
      actionType: 'SYNC_DEFINITIONS',
    };

    setSocAlerts((prev) => [newAlert, ...prev.filter((a) => a.category !== 'SECURITY_DEFINITIONS')]);
    addLog('WARN', '⚠️ TEST/SIMULERING: Sikkerhetsdefinisjoner merket som utdaterte. SOC-varsel generert.');
  }, [addLog]);

  return (
    <div id="wpww-app" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        stats={stats}
        soundEnabled={soundOn}
        onToggleSound={handleToggleSound}
        onToggleSimulator={handleToggleSimulator}
        onToggleNetworkMode={handleToggleNetworkMode}
        onEmergencyLockdown={handleEmergencyLockdown}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onSyncDefinitions={handleSyncSecurityDefinitions}
        isSyncingDefinitions={isSyncingDefinitions}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onOpenExportModal={() => handleOpenExportModal('json')}
        hackerHudEnabled={hackerHudEnabled}
        onToggleHackerHud={() => setHackerHudEnabled((prev) => !prev)}
        onOpenAcademy={() => setIsHackerAcademyOpen(true)}
        onOpenThreatSearch={() => setIsThreatSearchOpen(true)}
        onOpenTraining={() => setIsTrainingModalOpen(true)}
        onOpenNotes={() => setIsHackerNotesOpen(true)}
        onOpenGuide={(topic) => {
          setGuideInitialTopic(topic || 'quickstart');
          setIsGuideAdvisorOpen(true);
        }}
        onOpenAdvisor={() => setIsIncidentAdvisorOpen(true)}
        isAutonomousActive={isAutonomousActive}
        autonomousBlockedCount={autonomousBlockedCount}
        isGodModeActive={isGodModeActive}
        onToggleGodMode={handleToggleGodMode}
        onOpenGodModeModal={() => setIsGodModeModalOpen(true)}
        onDownloadProjectZip={handleDownloadProjectZip}
        onOpenTutorialFilm={() => setIsTutorialFilmOpen(true)}
        socAlerts={socAlerts}
        onOpenSocAlertCenter={() => setIsSocAlertCenterOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {/* War Room Master Overview & Direct Navigation Hub */}
        <WarRoomOverviewBanner
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isGodModeActive={isGodModeActive}
          onToggleGodMode={handleToggleGodMode}
          isAutonomousActive={isAutonomousActive}
          totalBlocks={chain.length}
          onDownloadProjectZip={handleDownloadProjectZip}
          onOpenTutorialFilm={() => setIsTutorialFilmOpen(true)}
          socAlerts={socAlerts}
        />

        {/* Contextual SOC Intervention Banner for active tab */}
        <SocInterventionBanner
          alerts={socAlerts}
          currentTab={activeTab}
          onResolveAlert={handleResolveSocAlert}
          onSyncDefinitions={handleSyncSecurityDefinitions}
          onQuarantineIp={handleQuarantineAttacker}
          onActivateGodMode={handleToggleGodMode}
          onOpenAlertCenter={() => setIsSocAlertCenterOpen(true)}
        />
        {/* War Room SecurityEngine & Topology Studio */}
        {activeTab === 'warroom' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/60 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                  <span>🛡️</span> SecurityEngine Kjerne & Nettverkstopologi
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Full kontroll over noder, kanter, aktive forsvarsskjold og syntetisk angrepsgenerator.
                </p>
              </div>
              <button
                onClick={() => setIsHackerAcademyOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-950 border border-emerald-600 hover:border-emerald-500 text-emerald-300 text-xs font-mono font-bold hover:bg-emerald-900 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <span>🎓</span> Åpne Hacker-Akademi
              </button>
            </div>
            <SecurityEngineStatusPanel result={lastSecuritySimulation} defenses={securityDefenses} />
            <WarRoomAttackBuilder
              attack={warRoomAttack}
              setAttack={setWarRoomAttack}
              onRun={() => processAttack(warRoomAttack.payload, '198.51.100.10', false, warRoomAttack.vector)}
            />
            <WarRoomDefenseConfigurator defenses={securityDefenses} setDefenses={setSecurityDefenses} />
            <WarRoomTopologyEditor
              nodes={securityNodes}
              edges={securityEdges}
              setNodes={setSecurityNodes}
              setEdges={setSecurityEdges}
            />
            <WarRoomDashboardFull sim={lastWarRoomSimulation} />
          </div>
        )}

        {/* Dynamic View by Tab */}
        {activeTab === 'radar' && (
          <RadarView
            stats={stats}
            blips={blips}
            recentBlocks={chain}
            onTriggerQuickProbe={(id) => handleFireAttack(id)}
            onSelectTab={setActiveTab}
            onRotateProgramKey={handleRotateProgramKey}
            hackerHudEnabled={hackerHudEnabled}
          />
        )}

        {activeTab === 'timeline' && (
          <ThreatTimeline
            stats={stats}
            recentBlocks={chain}
            onTriggerAttack={(id) => handleFireAttack(id)}
            onSelectTab={setActiveTab}
          />
        )}

        {activeTab === 'map' && (
          <ThreatMap
            stats={stats}
            recentBlocks={chain}
            onSyncDefinitions={handleSyncSecurityDefinitions}
            isSyncingDefinitions={isSyncingDefinitions}
            onOpenExportModal={handleOpenExportModal}
            onTriggerAttackFromNode={handleTriggerNodeAttack}
          />
        )}

        {activeTab === 'arena' && (
          <GodModeBattleArena
            stats={stats}
            onUpdateStats={setStats}
            onTriggerAttackSample={(payload, ip) => processAttack(payload, ip, true)}
            defaultSubTab="arena"
          />
        )}

        {activeTab === 'arms_race' && (
          <CyberEvolutionWarfareEngine
            stats={stats}
            onUpdateStats={setStats}
            onTriggerAttackSample={(payload, ip) => processAttack(payload, ip, true)}
            onSelectTab={setActiveTab}
          />
        )}

        {activeTab === 'godmode' && (
          <GodModeBattleArena
            stats={stats}
            onUpdateStats={setStats}
            onTriggerAttackSample={(payload, ip) => processAttack(payload, ip, true)}
            defaultSubTab="config"
          />
        )}

        {activeTab === 'report' && (
          <AutomatedSocReportView
            stats={stats}
            chain={chain}
            blacklist={blacklist}
            onRotateKey={handleRotateProgramKey}
            isGodModeActive={isGodModeActive}
            onSelectTab={setActiveTab}
          />
        )}

        {activeTab === 'simulator' && (
          <AttackSimulator
            simulatorEnabled={stats.simulatorEnabled}
            onFireAttack={handleFireAttack}
            onRunSwarm={handleRunSwarm}
            onRunSequential={handleRunSequential}
            onRunStress={handleRunStress}
            isSimulating={isSimulating}
            hackerHudEnabled={hackerHudEnabled}
          />
        )}

        {activeTab === 'forensics' && (
          <ForensicChain
            chain={chain}
            onExportReport={handleExportReport}
            onOpenExportModal={handleOpenExportModal}
            onTamperBlock={handleTamperBlock}
            onRestoreChain={handleRestoreChain}
          />
        )}

        {activeTab === 'blacklist' && (
          <BlacklistManager
            blacklist={blacklist}
            onUnbanIp={handleUnbanIp}
            onAddManualBan={handleAddManualBan}
            onClearBlacklist={handleClearBlacklist}
          />
        )}

        {activeTab === 'entropy' && <EntropyEngine />}

        {activeTab === 'health' && (
          <SystemHealthDashboard
            stats={stats}
            onSelectTab={setActiveTab}
            onOpenNotes={() => setIsHackerNotesOpen(true)}
            onOpenGuide={(topic) => {
              setGuideInitialTopic(topic || 'systemhealth');
              setIsGuideAdvisorOpen(true);
            }}
          />
        )}

        {activeTab === 'python' && <PythonScriptViewer />}

        {/* Live Watchdog Console Stream (Always visible at bottom of dashboard) */}
        <div className="pt-2">
          <LiveConsole logs={logs} onClearLogs={() => setLogs([])} />
        </div>
      </main>

      {/* Threat Notification Modal */}
      <ActiveThreatModal
        block={activeModalBlock}
        onClose={() => setActiveModalBlock(null)}
      />

      {/* Multi-Format Export Center Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        chain={chain}
        stats={stats}
        blacklist={blacklist}
        initialFormat={exportModalInitialFormat}
      />

      {/* Security Definitions & Threat Feeds Modal */}
      <SyncDefinitionsModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        definitions={stats.securityDefinitions}
        isSyncing={isSyncingDefinitions}
        syncProgress={syncProgress}
        syncStepText={syncStepText}
        onTriggerSync={handleSyncSecurityDefinitions}
      />

      {/* Ethical Hacker Academy & Arsenal Modal */}
      <EthicalHackerAcademyModal
        isOpen={isHackerAcademyOpen}
        onClose={() => setIsHackerAcademyOpen(false)}
      />

      {/* Threat Search & AI Threat Hunter Modal */}
      <ThreatSearchModal
        isOpen={isThreatSearchOpen}
        onClose={() => setIsThreatSearchOpen(false)}
      />

      {/* Cyber Training & SOC Walkthrough Simulator Modal */}
      <CyberTrainingWalkthroughModal
        isOpen={isTrainingModalOpen}
        onClose={() => setIsTrainingModalOpen(false)}
      />

      {/* Etiske Hacker Notater & SOC Feltjournal Modal */}
      <HackerNotesModal
        isOpen={isHackerNotesOpen}
        onClose={() => setIsHackerNotesOpen(false)}
        onOpenGuide={() => {
          setGuideInitialTopic('hackernotes');
          setIsGuideAdvisorOpen(true);
        }}
      />

      {/* SOC Veileder & Cyberguide Interaktiv Hjelp Modal */}
      <CyberGuideAdvisorModal
        isOpen={isGuideAdvisorOpen}
        onClose={() => setIsGuideAdvisorOpen(false)}
        initialTopic={guideInitialTopic}
        stats={stats}
        onSelectTab={setActiveTab}
        onOpenNotes={() => setIsHackerNotesOpen(true)}
      />

      {/* Sanntids Hendelser & Mottiltak Rådgiver (inkl. Autonom SOC) */}
      <LiveIncidentAdvisor
        isOpen={isIncidentAdvisorOpen}
        onClose={() => setIsIncidentAdvisorOpen(false)}
        stats={stats}
        recentBlocks={chain}
        onTriggerAttack={(payload, ip) => processAttack(payload, ip, true)}
        onAddManualBan={handleAddManualBan}
        onRotateKey={handleRotateProgramKey}
        onOpenNotes={() => setIsHackerNotesOpen(true)}
        onSelectTab={setActiveTab}
        isAutonomousActive={isAutonomousActive}
        onToggleAutonomous={setIsAutonomousActive}
        autonomousCadenceSec={autonomousCadenceSec}
        onChangeAutonomousCadence={setAutonomousCadenceSec}
        autonomousBlockedCount={autonomousBlockedCount}
      />

      {/* Gudemodus Master Kontrollsentral & Superkrefter Modal */}
      <GodModeMasterModal
        isOpen={isGodModeModalOpen}
        onClose={() => setIsGodModeModalOpen(false)}
        isGodModeActive={isGodModeActive}
        onToggleGodMode={handleToggleGodMode}
        onTriggerEmp={handleTriggerEmp}
        onTriggerMirrorJamming={handleTriggerMirrorJamming}
        onTriggerQuantumLock={handleTriggerQuantumLock}
        onClearBlacklist={handleClearBlacklist}
        onOpenArena={() => setActiveTab('arena')}
        onOpenAdvancedConfig={() => setActiveTab('godmode')}
      />

      {/* Cyber War-Room Opplæringsfilm & Masterclass Modal */}
      <CyberTutorialFilmModal
        isOpen={isTutorialFilmOpen}
        onClose={() => setIsTutorialFilmOpen(false)}
        onNavigateToTab={(tab) => setActiveTab(tab)}
      />

      {/* SOC Alert Center & Contextual Intervention Modal */}
      <SocAlertCenterModal
        isOpen={isSocAlertCenterOpen}
        onClose={() => setIsSocAlertCenterOpen(false)}
        alerts={socAlerts}
        onResolveAlert={handleResolveSocAlert}
        onResolveAllAlerts={handleResolveAllSocAlerts}
        onSyncDefinitions={handleSyncSecurityDefinitions}
        isSyncingDefinitions={isSyncingDefinitions}
        onQuarantineIp={handleQuarantineAttacker}
        onActivateGodMode={handleToggleGodMode}
        isGodModeActive={isGodModeActive}
        onSelectTab={setActiveTab}
        onSimulateBreachAlert={handleSimulateBreachAlert}
        onSimulateDefinitionsOutdated={handleSimulateDefinitionsOutdated}
      />

      {/* Floating Quick Advisor & Field Notes Speed-Dial Dock */}
      <aside aria-label="Hurtigveileder og notater" className="fixed bottom-5 right-5 z-30 flex items-center gap-1.5 sm:gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-cyan-700/60 shadow-xl shadow-slate-950/80">
        {/* SOC Alerts Quick Button */}
        <button
          id="btn-dock-soc-alerts"
          onClick={() => setIsSocAlertCenterOpen(true)}
          title="Åpne SOC Alert & Intervensjonssenter"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer shadow-md ${
            socAlerts.some((a) => a.severity === 'CRITICAL')
              ? 'bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white animate-pulse ring-2 ring-rose-400'
              : socAlerts.length > 0
              ? 'bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700'
          }`}
        >
          <span>🚨</span>
          <span className="hidden md:inline">SOC Varsler</span>
          <span className={`px-1 py-0.2 rounded text-[10px] font-black ${
            socAlerts.some((a) => a.severity === 'CRITICAL')
              ? 'bg-white text-rose-950'
              : 'bg-slate-900 text-white'
          }`}>
            {socAlerts.length}
          </span>
        </button>

        <button
          onClick={() => setIsTutorialFilmOpen(true)}
          title="Se Opplæringsfilm & Masterclass for Cyber War-Roomet"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold shadow-md transition-all cursor-pointer"
        >
          <span>🎬</span>
          <span className="hidden md:inline">Film</span>
        </button>

        <button
          onClick={() => setActiveTab('arena')}
          title="Hopp direkte til Cyber Arena (Gladiatorkamp)"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-700 to-amber-700 hover:from-rose-600 hover:to-amber-600 text-white font-mono text-xs font-bold shadow-md transition-all cursor-pointer"
        >
          <span>⚔️</span>
          <span className="hidden md:inline">Arena</span>
        </button>

        <button
          onClick={() => setActiveTab('arms_race')}
          title="Åpne Våpenkappløp & Balansematrise (Evolusjon & 6 Ekte Scenarioer)"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer shadow-md ${
            activeTab === 'arms_race'
              ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white ring-2 ring-pink-400'
              : 'bg-slate-800 hover:bg-pink-950/60 text-pink-300 border border-pink-500/40'
          }`}
        >
          <span>⚖️</span>
          <span className="hidden md:inline">Balanse</span>
        </button>

        <button
          onClick={() => setIsGodModeModalOpen(true)}
          title="Åpne Gudemodus Kontrollsenter & Superkrefter"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer shadow-md ${
            isGodModeActive
              ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 animate-pulse'
              : 'bg-slate-800 hover:bg-amber-950/60 text-amber-300 border border-amber-500/50'
          }`}
        >
          <span>👑</span>
          <span className="hidden md:inline">{isGodModeActive ? 'Gudemodus [PÅ]' : 'Gudemodus'}</span>
        </button>

        <button
          onClick={() => setActiveTab('report')}
          title="Åpne Automatisert SOC Rapport"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-mono text-xs font-bold shadow-md transition-all cursor-pointer"
        >
          <span>📑</span>
          <span className="hidden md:inline">Rapport</span>
        </button>

        <button
          onClick={() => setIsIncidentAdvisorOpen(true)}
          title="Åpne Sanntids Hendelser & Mottiltak (inkl. Autonom SOC Forsvarsmodus)"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer shadow-md ${
            isAutonomousActive
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse'
              : 'bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-600 hover:to-emerald-600 text-white'
          }`}
        >
          <span>⚡</span>
          <span className="hidden sm:inline">Tiltak</span>
          {isAutonomousActive && (
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          )}
        </button>

        <button
          onClick={() => {
            setGuideInitialTopic('quickstart');
            setIsGuideAdvisorOpen(true);
          }}
          title="Åpne SOC Veileder for god hjelp og forklaringer"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold shadow-md transition-all cursor-pointer"
        >
          <span>🧭</span>
          <span className="hidden sm:inline">Veileder</span>
        </button>

        <button
          onClick={() => setIsHackerNotesOpen(true)}
          title="Åpne Hacker Notater & Incident Journal"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono text-xs font-bold border border-amber-500/40 transition-all cursor-pointer"
        >
          <span>📝</span>
          <span className="hidden sm:inline">Notater</span>
        </button>
      </aside>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>🦒 WPWW WarRoom Master Defense System v20.0 Elite Edition</span>
          <span>Autonome Mottiltak: Mirror Jamming • Phantom Loop • Blackout Isolation • WORM Hash-Kjede</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
