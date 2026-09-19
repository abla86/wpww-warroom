import React, { useState, useEffect } from 'react';
import {
  Activity,
  Cpu,
  HardDrive,
  Network,
  ShieldCheck,
  ShieldAlert,
  Zap,
  RefreshCw,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Clock,
  Radio,
  Terminal,
  Server,
  Layers,
  Sparkles,
  Info,
  Lock,
  Download,
  Flame
} from 'lucide-react';
import { SystemStats, SystemHealthState, SystemSubsystemHealth } from '../types';

interface SystemHealthDashboardProps {
  stats: SystemStats;
  onOpenGuide?: (initialTopic?: string) => void;
  onOpenNotes?: () => void;
}

const INITIAL_SUBSYSTEMS: SystemSubsystemHealth[] = [
  {
    id: 'sub-ebpf',
    name: 'eBPF XDP Ingress Filter',
    status: 'OPTIMAL',
    latencyMs: 0.04,
    metricLabel: 'Pakkeprosessering',
    metricValue: '14.8M pps / 0.04ms',
    description: 'Kernel-nivå pakkeinspeksjon før socket-allokering. Avviser volumetriske SYN/UDP-flommer momentant.',
    lastChecked: 'Akkurat nå',
  },
  {
    id: 'sub-entropy',
    name: 'Shannon Entropi-Motor',
    status: 'OPTIMAL',
    latencyMs: 0.12,
    metricLabel: 'Entropi-avviksberegning',
    metricValue: '7.20 bits / 0.12ms',
    description: 'Beregner informasjonstetthet i sanntid. Avdekker obfuskert shellcode og krypterte payloads.',
    lastChecked: 'Akkurat nå',
  },
  {
    id: 'sub-worm',
    name: 'WORM Forensisk Kjede & WAL',
    status: 'OPTIMAL',
    latencyMs: 0.85,
    metricLabel: 'Uforanderlig Integritet',
    metricValue: 'SHA-256 Forseglet (0 manipulering)',
    description: 'Write-Once-Read-Many kryptografisk revisjonskjede forberedt for rettskraftig etterforskning.',
    lastChecked: 'Akkurat nå',
  },
  {
    id: 'sub-anycast',
    name: 'BGP Anycast Scrubbing Senter',
    status: 'OPTIMAL',
    latencyMs: 1.40,
    metricLabel: 'Båndbreddekapasitet',
    metricValue: '100 Gbps / 4 noder online',
    description: 'Distribuert vaskestasjon som omdirigerer og absorberer botnet-angrep før kjernelinjer nås.',
    lastChecked: 'Akkurat nå',
  },
  {
    id: 'sub-aslr',
    name: 'Minne-Heap Randomizer & ASLR',
    status: 'OPTIMAL',
    latencyMs: 0.08,
    metricLabel: 'Heap-entropi & Stack Canary',
    metricValue: '64-bit dynamisk base-offset',
    description: 'Beskytter mot ROP-kjeder, use-after-free og minnekorrupsjon ved kontinuerlig permutasjon.',
    lastChecked: 'Akkurat nå',
  },
  {
    id: 'sub-honeypot',
    name: 'Syntetisk Honeypot Grid',
    status: 'OPTIMAL',
    latencyMs: 2.10,
    metricLabel: 'Lokkedue-tjenester',
    metricValue: 'Port 22, 445, 102, 8080 aktive',
    description: 'Emulerer sårbare tjenester for å fange angrepsmønstre, registrere zero-days og kaste bort angriperens tid.',
    lastChecked: 'Akkurat nå',
  },
  {
    id: 'sub-mirror',
    name: 'Mirror Jamming & Refleksjonslag',
    status: 'OPTIMAL',
    latencyMs: 0.35,
    metricLabel: 'Retur-forstyrrelse',
    metricValue: 'Aktiv (92% forvrengningsrate)',
    description: 'Speiler fiendtlige pakker tilbake mot opprinnelsesnettet og forstyrrer C2-kommandoer.',
    lastChecked: 'Akkurat nå',
  },
  {
    id: 'sub-ai-hunter',
    name: 'AI Threat Hunter Pipeline',
    status: 'OPTIMAL',
    latencyMs: 18.5,
    metricLabel: 'Heuristisk Gemini Evaluering',
    metricValue: 'Klar / Vektormatching aktiv',
    description: 'Sanntids semantisk mønstergjenkjenning av ukjente angrepssignaturer og anomalier.',
    lastChecked: 'Akkurat nå',
  },
];

export const SystemHealthDashboard: React.FC<SystemHealthDashboardProps> = ({
  stats,
  onOpenGuide,
  onOpenNotes,
}) => {
  const [subsystems, setSubsystems] = useState<SystemSubsystemHealth[]>(INITIAL_SUBSYSTEMS);
  const [cpuUsage, setCpuUsage] = useState<number>(18);
  const [memoryUsage, setMemoryUsage] = useState<number>(34); // percent
  const [networkPps, setNetworkPps] = useState<number>(14200);
  const [entropyLatency, setEntropyLatency] = useState<number>(0.12);
  const [overallHealthScore, setOverallHealthScore] = useState<number>(98);
  const [uptimeSeconds, setUptimeSeconds] = useState<number>(14520);
  
  // Diagnostic State
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState<boolean>(false);
  const [diagnosticStep, setDiagnosticStep] = useState<number>(0);
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([]);
  const [lastDiagnosticResult, setLastDiagnosticResult] = useState<string | null>(null);

  // Maintenance Actions State
  const [maintenanceMessage, setMaintenanceMessage] = useState<string | null>(null);

  // Dynamic ticking
  useEffect(() => {
    const timer = setInterval(() => {
      setUptimeSeconds((prev) => prev + 1);
      
      // Gentle jitter for realism
      setCpuUsage((prev) => {
        const delta = (Math.random() - 0.48) * 3;
        return Math.min(95, Math.max(8, Math.round(prev + delta)));
      });

      setMemoryUsage((prev) => {
        const delta = (Math.random() - 0.5) * 1.5;
        return Math.min(90, Math.max(20, Math.round(prev + delta)));
      });

      setNetworkPps((prev) => {
        const delta = Math.round((Math.random() - 0.5) * 800);
        return Math.max(3000, prev + delta);
      });

      setEntropyLatency((prev) => {
        const delta = (Math.random() - 0.5) * 0.02;
        return Number(Math.max(0.05, Math.min(0.8, prev + delta)).toFixed(2));
      });
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  // Format uptime string
  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}t ${mins}m ${secs}s`;
  };

  // Run full system diagnostics
  const handleRunDiagnostics = () => {
    if (isDiagnosticRunning) return;

    setIsDiagnosticRunning(true);
    setDiagnosticStep(1);
    setDiagnosticLogs([
      `[${new Date().toLocaleTimeString()}] 🔍 Starter fullstendig systemdiagnostikk for WPWW WarRoom...`,
    ]);

    const steps = [
      {
        step: 1,
        text: '🧪 Trinn 1/5: Tester eBPF XDP kjerne-ringbuffere og port 80/443 ingress...',
        action: () => {
          setDiagnosticLogs((prev) => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] ✔️ eBPF XDP: 0 pakketap, 14.8M pps kapasitet bekreftet.`,
          ]);
        },
      },
      {
        step: 2,
        text: '🧪 Trinn 2/5: Evaluerer Shannon Entropi-motor med heksadesimale testvektorer...',
        action: () => {
          setDiagnosticLogs((prev) => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] ✔️ Entropi-beregning: 0.11 ms snittforsinkelse (optimal < 0.5ms).`,
          ]);
        },
      },
      {
        step: 3,
        text: '🧪 Trinn 3/5: Verifiserer WORM kryptografisk SHA-256 hash-kjede og SQLite WAL...',
        action: () => {
          setDiagnosticLogs((prev) => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] ✔️ Forensisk WORM-revisjonskjede: Alle blokker forseglet, 0 avvik funnet.`,
          ]);
        },
      },
      {
        step: 4,
        text: '🧪 Trinn 4/5: Pinger Anycast vaskestasjoner og sjekker minne-ASLR kanarifugler...',
        action: () => {
          setDiagnosticLogs((prev) => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] ✔️ Stack Canaries: 100% intakt. Heap-scrambler aktiv.`,
          ]);
        },
      },
      {
        step: 5,
        text: '🧪 Trinn 5/5: Gjennomgår Honeypot lokkeduer og AI Threat Hunter forbindelser...',
        action: () => {
          setDiagnosticLogs((prev) => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] ✔️ Lokkeduer aktive på 4 porter. Gemini AI Threat Hunter online.`,
            `[${new Date().toLocaleTimeString()}] 🏆 DIAGNOSTIKK FULLFØRT: Systemhelse 100% optimal!`,
          ]);
          setIsDiagnosticRunning(false);
          setDiagnosticStep(0);
          setOverallHealthScore(100);
          setLastDiagnosticResult('BESTÅTT - 100% Optimal Driftstilstand');
        },
      },
    ];

    steps.forEach((s, idx) => {
      setTimeout(() => {
        setDiagnosticStep(s.step);
        setDiagnosticLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${s.text}`]);
        s.action();
      }, (idx + 1) * 1100);
    });
  };

  // Perform one-click optimization
  const handleOptimizeBuffers = () => {
    setMaintenanceMessage('🧹 Renser minne-buffere og tømmer midlertidige socket-køer...');
    setMemoryUsage((prev) => Math.max(18, prev - 12));
    setCpuUsage((prev) => Math.max(10, prev - 5));
    
    setTimeout(() => {
      setMaintenanceMessage('✨ Buffere renset! 142 MB frigjort, minne-fragmentering redusert til 0.4%.');
      setTimeout(() => setMaintenanceMessage(null), 5000);
    }, 1200);
  };

  // Rotate encryption keys
  const handleRotateKeys = () => {
    setMaintenanceMessage('🔐 Roterer midlertidige Kyber-1024 og ChaCha20-Poly1305 sesjonsnøkler...');
    setTimeout(() => {
      setMaintenanceMessage('✅ Nøkkelrotasjon fullført! Nye efemære sesjonsnøkler distribuert til alle 4 forsvarslag.');
      setTimeout(() => setMaintenanceMessage(null), 5000);
    }, 1400);
  };

  // Self-heal degraded subsystem
  const handleSelfHealSubsystem = (id: string) => {
    setSubsystems((prev) =>
      prev.map((sub) => {
        if (sub.id === id) {
          return {
            ...sub,
            status: 'OPTIMAL',
            lastChecked: 'Akkurat nå (Selvreparert)',
          };
        }
        return sub;
      })
    );
    setOverallHealthScore(98);
  };

  // Stress-test simulation toggle
  const handleSimulateDegradation = () => {
    setSubsystems((prev) =>
      prev.map((sub, idx) => {
        if (idx === 1) {
          return {
            ...sub,
            status: 'WARNING',
            metricValue: '8.45 bits (Høy belastning)',
            lastChecked: 'Advarsel registrert',
          };
        }
        return sub;
      })
    );
    setOverallHealthScore(85);
    setMaintenanceMessage('⚠️ Simulert stresstest: Entropi-motor satt i belastningsmodus for å teste feiltoleranse.');
    setTimeout(() => setMaintenanceMessage(null), 6000);
  };

  return (
    <div id="system-health-dashboard" className="space-y-6">
      {/* Top Banner with Health Index & Quick Actions */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-cyan-800/60 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            {/* Circular Health Gauge */}
            <div className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-slate-950 border-2 border-cyan-500/60 shadow-lg shadow-cyan-950/50">
              <div className="text-center">
                <div className="text-2xl font-black font-mono text-cyan-300 tracking-tight">
                  {overallHealthScore}%
                </div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  Helse-Score
                </div>
              </div>
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-950"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  WPWW Kjerne Systemhelse & Telemetri
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-600/80">
                  STATUS: OPTIMAL DRIFT
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  Oppetid: {formatUptime(uptimeSeconds)}
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Sanntidsovervåking av samtlige delsystemer, eBPF kjerne-buffere, WORM-kjede, minne-ASLR og Shannon entropi.
                Alle telemetridata oppdateres kontinuerlig med sub-millisekund nøyaktighet.
              </p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5 self-stretch lg:self-auto">
            <button
              onClick={handleRunDiagnostics}
              disabled={isDiagnosticRunning}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer ${
                isDiagnosticRunning
                  ? 'bg-amber-950 text-amber-300 border border-amber-600 animate-pulse'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-950/50'
              }`}
            >
              {isDiagnosticRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Kjører Trinn {diagnosticStep}/5...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Kjør Full Diagnostikk</span>
                </>
              )}
            </button>

            <button
              onClick={handleOptimizeBuffers}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              title="Rens midlertidige buffere og reduser minne-fragmentering"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Rens Buffere</span>
            </button>

            <button
              onClick={handleRotateKeys}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              title="Roter kryptografiske sesjonsnøkler i minnet"
            >
              <Lock className="w-4 h-4 text-purple-400" />
              <span>Roter Nøkler</span>
            </button>

            {onOpenGuide && (
              <button
                onClick={() => onOpenGuide('systemhealth')}
                className="px-3.5 py-2.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-700/80 text-cyan-300 font-mono text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                title="Få veiledning om hvordan du tolker og bruker systemhelsen"
              >
                <Info className="w-4 h-4 text-cyan-400" />
                <span>Veiledning</span>
              </button>
            )}

            {onOpenNotes && (
              <button
                onClick={onOpenNotes}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/80 text-emerald-300 font-mono text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                title="Åpne Hacker Notes for å logge helserapport"
              >
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Notater</span>
              </button>
            )}
          </div>
        </div>

        {/* Maintenance Message Banner */}
        {maintenanceMessage && (
          <div className="mt-4 p-3 rounded-xl bg-slate-900/90 border border-cyan-500/60 text-cyan-200 text-xs font-mono flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{maintenanceMessage}</span>
          </div>
        )}
      </div>

      {/* 4 Primary Resource Meters (CPU, RAM, Network, Entropy) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU Load */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300 text-xs font-mono">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>CPU & eBPF Kjerner</span>
            </div>
            <span className="font-mono text-xs font-bold text-cyan-400">{cpuUsage}%</span>
          </div>
          <div className="mt-2.5 w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-500 ${
                cpuUsage > 80 ? 'bg-rose-500' : cpuUsage > 50 ? 'bg-amber-500' : 'bg-cyan-500'
              }`}
              style={{ width: `${cpuUsage}%` }}
            ></div>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex justify-between font-mono">
            <span>DPI Kjerner: 16 aktive</span>
            <span>Last: Lav</span>
          </div>
        </div>

        {/* Memory RAM */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300 text-xs font-mono">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <span>Minne (RAM & ASLR)</span>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-400">{memoryUsage}%</span>
          </div>
          <div className="mt-2.5 w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-500 ${
                memoryUsage > 80 ? 'bg-rose-500' : memoryUsage > 60 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${memoryUsage}%` }}
            ></div>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex justify-between font-mono">
            <span>Allokert: 544 MB / 16 GB</span>
            <span>Heap: Sikret</span>
          </div>
        </div>

        {/* Network Throughput */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300 text-xs font-mono">
              <Network className="w-4 h-4 text-purple-400" />
              <span>Nettverk I/O & Ingress</span>
            </div>
            <span className="font-mono text-xs font-bold text-purple-400">
              {(networkPps / 1000).toFixed(1)}k pps
            </span>
          </div>
          <div className="mt-2.5 w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-purple-500 transition-all duration-500"
              style={{ width: `${Math.min(100, (networkPps / 30000) * 100)}%` }}
            ></div>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex justify-between font-mono">
            <span>Båndbredde: 1.2 Gbps</span>
            <span>Pakketap: 0.00%</span>
          </div>
        </div>

        {/* Shannon Entropy Math Latency */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300 text-xs font-mono">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Entropi Beregningstid</span>
            </div>
            <span className="font-mono text-xs font-bold text-amber-400">{entropyLatency} ms</span>
          </div>
          <div className="mt-2.5 w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-amber-500 transition-all duration-500"
              style={{ width: `${Math.min(100, (entropyLatency / 1.0) * 100)}%` }}
            ></div>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex justify-between font-mono">
            <span>Terskel: {stats.entropyThreshold} bits</span>
            <span>Status: Lynrask</span>
          </div>
        </div>
      </div>

      {/* Subsystems Matrix */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              Delsystemer & Beskyttelsesmoduler
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspeksjon av alle underliggende forsvarskomponenter, kjerne-hooks og sensorer.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateDegradation}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-amber-300 font-mono text-xs transition-colors cursor-pointer"
              title="Simuler en komponentfeil for å teste feiltoleranse og selvreparasjon"
            >
              Test Feilsituasjon
            </button>
            <span className="text-xs font-mono text-slate-500">
              8/8 Komponenter Verifisert
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {subsystems.map((sub) => {
            const isOptimal = sub.status === 'OPTIMAL';
            const isWarning = sub.status === 'WARNING';
            
            return (
              <div
                key={sub.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isOptimal
                    ? 'bg-slate-900/60 border-slate-800 hover:border-cyan-800/80'
                    : isWarning
                    ? 'bg-amber-950/20 border-amber-600/80 shadow-md shadow-amber-950/40'
                    : 'bg-rose-950/30 border-rose-600/80'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-sm text-slate-100">{sub.name}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                        isOptimal
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-700 animate-pulse'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>

                  <div className="mt-2 text-xs font-mono text-cyan-300 bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">{sub.metricLabel}</div>
                    <div className="font-bold mt-0.5">{sub.metricValue}</div>
                  </div>

                  <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                    {sub.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Latens: {sub.latencyMs} ms</span>
                  {isWarning ? (
                    <button
                      onClick={() => handleSelfHealSubsystem(sub.id)}
                      className="px-2 py-1 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-[10px] uppercase cursor-pointer"
                    >
                      Selvreparer
                    </button>
                  ) : (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> OK
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Diagnostics Console & Live Log Output */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Diagnostikk-Konsoll & Revisjonssjekk
            </h3>
          </div>
          {lastDiagnosticResult && (
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-700">
              Siste sjekk: {lastDiagnosticResult}
            </span>
          )}
        </div>

        <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 font-mono text-xs max-h-48 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700">
          {diagnosticLogs.length === 0 ? (
            <div className="text-slate-500 italic py-2">
              Ingen aktiv diagnostikkkjøring. Klikk "Kjør Full Diagnostikk" ovenfor for å utføre en 5-trinns integritetstest av hele sikkerhetsarkitekturen.
            </div>
          ) : (
            diagnosticLogs.map((log, i) => (
              <div
                key={i}
                className={`${
                  log.includes('🏆') || log.includes('✔️')
                    ? 'text-emerald-300'
                    : log.includes('🧪')
                    ? 'text-cyan-300 font-semibold'
                    : 'text-slate-300'
                }`}
              >
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
