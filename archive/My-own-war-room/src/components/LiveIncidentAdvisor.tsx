import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Sparkles,
  Zap,
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Play,
  CheckCircle2,
  RefreshCw,
  Cpu,
  Terminal,
  Activity,
  ArrowRight,
  Flame,
  Radio,
  Sliders,
  Clock,
  X,
  ChevronRight,
  Lock,
  Layers,
  Bug,
  Info
} from 'lucide-react';
import { AttackVector, SystemStats, ForensicBlock } from '../types';
import { MASTER_ATTACK_CATALOG } from '../data/attackCatalog';

export interface LiveIncidentAdvisorProps {
  isOpen: boolean;
  onClose: () => void;
  stats: SystemStats;
  recentBlocks: ForensicBlock[];
  onTriggerAttack: (payload: Record<string, unknown> | string, attackerIp: string) => void;
  onAddManualBan?: (ip: string, reason: string, level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW') => void;
  onRotateKey?: () => void;
  onOpenNotes?: () => void;
  onSelectTab?: (tabId: string) => void;
  isAutonomousActive: boolean;
  onToggleAutonomous: (active: boolean) => void;
  autonomousCadenceSec: number;
  onChangeAutonomousCadence: (seconds: number) => void;
  autonomousBlockedCount: number;
}

interface IncidentProposal {
  id: string;
  vector: AttackVector;
  triggerReason: string;
  recommendedAction: string;
  actionType: 'MITIGATE' | 'ISOLATE' | 'ROTATE_KEY' | 'ASLR_SCRAMBLE' | 'HONEYPOT_LOCK' | 'NOTE_LOG';
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  sampleIp: string;
}

export const LiveIncidentAdvisor: React.FC<LiveIncidentAdvisorProps> = ({
  isOpen,
  onClose,
  stats,
  recentBlocks,
  onTriggerAttack,
  onAddManualBan,
  onRotateKey,
  onOpenNotes,
  onSelectTab,
  isAutonomousActive,
  onToggleAutonomous,
  autonomousCadenceSec,
  onChangeAutonomousCadence,
  autonomousBlockedCount,
}) => {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');
  const [executedActionIds, setExecutedActionIds] = useState<Set<string>>(new Set());
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);

  // Generate dynamic incident proposals based on current stats and blocks
  const proposals: IncidentProposal[] = useMemo(() => {
    const list: IncidentProposal[] = [];

    // Filter relevant high-value vectors (Trojans, Supply Chain, Zero-Day, RCE, DDoS)
    const trojans = MASTER_ATTACK_CATALOG.filter(
      (v) =>
        v.category === 'TROJAN' ||
        v.category === 'INFOSTEALER' ||
        v.category === 'SPYWARE' ||
        v.category === 'SUPPLY_CHAIN' ||
        v.category === 'RANSOMWARE' ||
        v.category === 'ZERO_DAY' ||
        v.category === 'DDOS'
    );

    // Dynamic checks
    // 1. Check if high entropy exists
    const hasHighEntropyAttack = recentBlocks.some((b) => b.entropy > 6.0);
    const pegasus = trojans.find((v) => v.name.includes('Pegasus') || v.name.includes('FORCEDENTRY'));
    if (pegasus) {
      list.push({
        id: 'prop-pegasus-entropy',
        vector: pegasus,
        triggerReason: hasHighEntropyAttack
          ? 'Høy Shannon-entropi ble nylig observert i nettverksstrømmen. Test kjerne-isolering mot zero-click minne-korrupsjon.'
          : 'Normal Shannon-entropi. Anbefalt proaktiv stresstest for å verifisere deteksjon av skjult grafikkdekoder-utnyttelse.',
        recommendedAction: 'Aktiver Phantom Loop og sett minne-ASLR på maksimal randomiseringsgrad.',
        actionType: 'ASLR_SCRAMBLE',
        urgency: 'CRITICAL',
        sampleIp: '185.220.101.44',
      });
    }

    // 2. Emotet Trojan
    const emotet = trojans.find((v) => v.name.includes('Emotet'));
    if (emotet) {
      list.push({
        id: 'prop-emotet-trojan',
        vector: emotet,
        triggerReason: 'Svchost.exe prosessinjeksjon og PowerShell-droppere utgjør den vanligste trojaner-vektoren i bedriftsmiljøer.',
        recommendedAction: 'Iverksett minneprosess-karantene og sjekk WORM-logg for uautoriserte subshells.',
        actionType: 'ISOLATE',
        urgency: 'CRITICAL',
        sampleIp: '91.240.118.52',
      });
    }

    // 3. XZ-Utils Supply Chain
    const xz = trojans.find((v) => v.name.includes('XZ-Utils'));
    if (xz) {
      list.push({
        id: 'prop-xz-supply-chain',
        vector: xz,
        triggerReason: 'Oppstrøms forsyningskjedesårbarheter (IFUNC-kapring) omgår tradisjonelle brannmurer dersom binærsignaturen er signert.',
        recommendedAction: 'Gjennomfør SHA-256 integritetsaudit på WORM-forensikkjeden for å oppdage uoverensstemmelser.',
        actionType: 'ROTATE_KEY',
        urgency: 'CRITICAL',
        sampleIp: '194.26.29.17',
      });
    }

    // 4. RedLine InfoStealer
    const redline = trojans.find((v) => v.name.includes('RedLine'));
    if (redline) {
      list.push({
        id: 'prop-redline-stealer',
        vector: redline,
        triggerReason: 'Forsøk på høsting av nettlesercookies, Discord-tokens og kryptolommebøker registrert i honeypot.',
        recommendedAction: 'Blokker C2 SOAP-endepunktet og loggfør IOC-adresser direkte til etisk hacker-journal.',
        actionType: 'NOTE_LOG',
        urgency: 'HIGH',
        sampleIp: '45.154.255.108',
      });
    }

    // 5. Mirai IoT Swarm
    const mirai = trojans.find((v) => v.name.includes('Mirai'));
    if (mirai) {
      list.push({
        id: 'prop-mirai-swarm',
        vector: mirai,
        triggerReason: 'Volumetrisk DDoS-sverm på 120 Gbps med spoofede UDP/GRE-pakker tester kjernens eBPF XDP-kapasitet.',
        recommendedAction: 'Aktiver automatisk BGP Anycast Scrubbing og SYN-Cookie proxy.',
        actionType: 'MITIGATE',
        urgency: 'HIGH',
        sampleIp: '103.152.220.89',
      });
    }

    // 6. NotPetya Wiper
    const notpetya = trojans.find((v) => v.name.includes('NotPetya'));
    if (notpetya) {
      list.push({
        id: 'prop-notpetya-wiper',
        vector: notpetya,
        triggerReason: 'Automatisk lateral bevegelse via SMB Port 445 med ønske om å slette Master Boot Record (MBR).',
        recommendedAction: 'Aktiver øyeblikkelig Canary Honeyfile-alarm og lås alle WORM-volumer.',
        actionType: 'HONEYPOT_LOCK',
        urgency: 'CRITICAL',
        sampleIp: '198.51.100.99',
      });
    }

    return list;
  }, [recentBlocks]);

  // Handle Action Execution
  const handleExecuteAction = useCallback(
    (prop: IncidentProposal) => {
      setExecutedActionIds((prev) => new Set(prev).add(prop.id));

      if (prop.actionType === 'ISOLATE' && onAddManualBan) {
        onAddManualBan(prop.sampleIp, `Mottiltak iverksatt mot ${prop.vector.name}`, prop.urgency);
        setLastActionMessage(`🔒 Karantene iverksatt for ${prop.sampleIp}! IP ble lagt til i svartelisten.`);
      } else if (prop.actionType === 'ROTATE_KEY' && onRotateKey) {
        onRotateKey();
        setLastActionMessage(`🔑 ProgramData-kryptonøkkel rotert! Ny SHA-256 forsegling aktiv.`);
      } else if (prop.actionType === 'NOTE_LOG' && onOpenNotes) {
        onOpenNotes();
        setLastActionMessage(`📝 Åpnet Hacker Notater for å dokumentere IOC-er for ${prop.vector.name}.`);
      } else {
        setLastActionMessage(`🛡️ Forsvarstiltak iverksatt for ${prop.vector.name}: ${prop.recommendedAction}`);
      }

      setTimeout(() => {
        setLastActionMessage(null);
      }, 5000);
    },
    [onAddManualBan, onRotateKey, onOpenNotes]
  );

  // Handle Attack Simulation
  const handleSimulateIncident = useCallback(
    (prop: IncidentProposal) => {
      onTriggerAttack(prop.vector.payload, prop.sampleIp);
      setLastActionMessage(`🎯 Hendelse simulert: ${prop.vector.name} fra ${prop.sampleIp}! Se forsvarsmuren i aksjon.`);
      setTimeout(() => {
        setLastActionMessage(null);
      }, 4000);
    },
    [onTriggerAttack]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-950 border border-purple-600/80 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-950/80 via-slate-950 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl text-white shadow-md shadow-purple-950">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Sanntids Hendelser & Mottiltak</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-700 font-mono font-bold">
                  SOC RÅDGIVER & COPILOT
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Kontinuerlige situasjonsforslag, anbefalte mottiltak og helautonom kampledelse mens du bruker WarRoom.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Autonomous Defense Mode Banner / Controller */}
        <div className="bg-slate-900/90 border-b border-slate-800 p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-3.5 h-3.5 rounded-full ${
                isAutonomousActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'
              }`}
            />
            <div>
              <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                <span>Autonome SOC Forsvarsmodus:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    isAutonomousActive
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {isAutonomousActive ? 'AKTIV (SYSTEMET FORSVARER AUTONOMT)' : 'PAUSET (MANUELL MODUS)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Når aktiv, genererer systemet fortløpende realistiske cyberangrep og iverksetter autonome mottiltak automatisk.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Cadence Selector */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs font-mono">
              <span className="text-[10px] text-slate-500 px-1">Intervall:</span>
              <button
                onClick={() => onChangeAutonomousCadence(15)}
                className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                  autonomousCadenceSec === 15
                    ? 'bg-purple-900/80 text-purple-200 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                15s (Rolig)
              </button>
              <button
                onClick={() => onChangeAutonomousCadence(8)}
                className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                  autonomousCadenceSec === 8
                    ? 'bg-purple-900/80 text-purple-200 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                8s (Normal)
              </button>
              <button
                onClick={() => onChangeAutonomousCadence(3)}
                className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                  autonomousCadenceSec === 3
                    ? 'bg-rose-900/80 text-rose-200 font-bold animate-pulse'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                3s (Stress)
              </button>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={() => onToggleAutonomous(!isAutonomousActive)}
              className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer ${
                isAutonomousActive
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
              }`}
            >
              {isAutonomousActive ? (
                <>
                  <span>Stopp Autonom Modus</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Autonomt Forsvar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Feedback Toast Notification */}
        {lastActionMessage && (
          <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-purple-950 border-b border-purple-600 px-4 py-2.5 flex items-center justify-between gap-3 text-xs font-mono text-purple-200 animate-fadeIn">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
              <span>{lastActionMessage}</span>
            </div>
            <span className="text-[10px] text-purple-400">Verifisert i kjerne</span>
          </div>
        )}

        {/* Stats summary bar */}
        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-4 text-slate-300">
            <span>
              Totalt avverget autonomt:{' '}
              <strong className="text-emerald-400">{autonomousBlockedCount}</strong>
            </span>
            <span className="text-slate-600">•</span>
            <span>
              Aktive forslag:{' '}
              <strong className="text-purple-300">{proposals.length}</strong>
            </span>
            <span className="text-slate-600">•</span>
            <span>
              Shannon-entropi terskel:{' '}
              <strong className="text-amber-300">{stats.entropyThreshold} bits</strong>
            </span>
          </div>

          <div className="text-[11px] text-slate-400">
            💡 Tips: Du kan både simulere hendelsen for å se krasjet eller iverksette mottiltaket umiddelbart.
          </div>
        </div>

        {/* Main Content List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-950">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Kontekstuelle Situasjonsforslag & Anbefalte Tiltak</span>
            <span className="text-[11px] text-purple-400">
              Inkluderer trojanere, zero-days, SCADA og volumetrisk flom
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {proposals.map((prop) => {
              const isExecuted = executedActionIds.has(prop.id);

              return (
                <div
                  key={prop.id}
                  className={`rounded-2xl border transition-all p-5 ${
                    isExecuted
                      ? 'bg-slate-900/40 border-slate-800'
                      : 'bg-slate-900/80 border-slate-800 hover:border-purple-600/70 shadow-lg'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Left: Info and Context */}
                    <div className="flex-1 space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                            prop.urgency === 'CRITICAL'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {prop.urgency}
                        </span>

                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {prop.vector.category}
                        </span>

                        {prop.vector.cve && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                            {prop.vector.cve}
                          </span>
                        )}

                        <span className="text-xs font-mono text-slate-500">
                          Kilde: {prop.sampleIp}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        {prop.vector.name}
                      </h3>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        <strong>Situasjonsbilde:</strong> {prop.triggerReason}
                      </p>

                      <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-900/50 flex items-start gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs font-mono font-bold text-purple-300">
                            Anbefalt Mottiltak:
                          </span>
                          <p className="text-xs text-slate-200 mt-0.5">
                            {prop.recommendedAction}
                          </p>
                        </div>
                      </div>

                      {/* Payload snippet preview */}
                      <details className="text-xs font-mono text-slate-400">
                        <summary className="cursor-pointer hover:text-purple-300 transition-colors">
                          Vis simulert kode/payload & signatur
                        </summary>
                        <pre className="mt-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-emerald-300 overflow-x-auto">
                          {JSON.stringify(prop.vector.payload, null, 2)}
                        </pre>
                      </details>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex lg:flex-col items-center gap-2.5 shrink-0">
                      {/* Action 1: Execute Countermeasure */}
                      <button
                        onClick={() => handleExecuteAction(prop)}
                        className={`w-full lg:w-44 px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                          isExecuted
                            ? 'bg-slate-800 text-emerald-300 border border-emerald-500/50'
                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white'
                        }`}
                      >
                        {isExecuted ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Tiltak Iverksatt</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5 text-amber-300" />
                            <span>Iverksett Tiltak</span>
                          </>
                        )}
                      </button>

                      {/* Action 2: Simulate Incident */}
                      <button
                        onClick={() => handleSimulateIncident(prop)}
                        className="w-full lg:w-44 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5 text-cyan-400 fill-current" />
                        <span>Simuler Angrep</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-purple-400" />
            <span>
              Alle handlinger loggføres deterministisk til SQLite WAL og SHA-256 WORM-kjeden.
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-bold transition-colors cursor-pointer"
          >
            Lukk Rådgiver
          </button>
        </div>
      </div>
    </div>
  );
};
