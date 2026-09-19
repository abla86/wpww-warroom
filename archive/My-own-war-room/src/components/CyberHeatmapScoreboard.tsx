import React, { useState } from 'react';
import {
  Activity,
  Flame,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Skull,
  Swords,
  Trophy,
  Zap,
  Layers,
  Sparkles,
  Info,
  RefreshCw,
  TrendingUp,
  Download,
  Terminal,
  Crosshair,
  BarChart3,
  Cpu,
  Radio
} from 'lucide-react';
import { CyberScoreState, HeatmapCell } from '../types';

interface CyberHeatmapScoreboardProps {
  scoreState: CyberScoreState;
  onResetScore?: () => void;
  onSimulateClash?: (winner: 'RED' | 'BLUE') => void;
}

export const INITIAL_SCORE_STATE: CyberScoreState = {
  redTeamScore: 2450,
  blueTeamScore: 2780,
  redTeamWins: 14,
  blueTeamWins: 16,
  draws: 2,
  totalDamageDealtByRed: 18450,
  totalDamageBlockedByBlue: 19820,
  criticalExploitsExecuted: 28,
  zeroDayBreaches: 9,
  attacksRepelled: 34,
  lastWinner: 'RED_TEAM',
  winStreak: { team: 'RED_TEAM', count: 2 },
};

export const CyberHeatmapScoreboard: React.FC<CyberHeatmapScoreboardProps> = ({
  scoreState,
  onResetScore,
  onSimulateClash,
}) => {
  const [activeHeatmapTab, setActiveHeatmapTab] = useState<'layers_vs_attacks' | 'ports_vs_time' | 'entropy_matrix'>('layers_vs_attacks');
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);

  // Heatmap 1: Brannmurs-Lag (4 lag) vs Angrepsvektorer (8 typer)
  const layerLabels = [
    'Lag 1: WAF & Pakkefilter',
    'Lag 2: Shannon Entropi & Heuristikk',
    'Lag 3: Minne Heap-Scrambler & Tarpit',
    'Lag 4: WORM-Kjerne & Kyber-Skjold',
  ];

  const attackLabels = [
    'SQL-Injisering (SQLi)',
    'WannaCry SMBv1 Orm',
    'Stuxnet ICS/PLS Sabotasje',
    'Mirai 100Gbps SYN-Flom',
    'Phantom Zero-Day RCE',
    'Buffer Heap Overflow',
    'SSRF Metadata Lekkasje',
    'XZ-Utils Forsyningskjede',
  ];

  // Intensitet (0-100) for Lag vs Angrep. Merk: Mur taper noen (høy varme rød), vinner noen (lav varme grønn)!
  const layerVsAttackMatrix: HeatmapCell[] = [
    // Layer 1
    { id: 'c-1-1', rowLabel: layerLabels[0], colLabel: attackLabels[0], intensity: 20, valueDisplay: '20% Penetrasjon', threatLevel: 'LOW', details: 'WAF blokkerer 80% av standard SQLi-forespørsler.', payloadSnippet: "' UNION SELECT 1,2,3--" },
    { id: 'c-1-2', rowLabel: layerLabels[0], colLabel: attackLabels[1], intensity: 45, valueDisplay: '45% Penetrasjon', threatLevel: 'MEDIUM', details: 'SMB-sonderinger treffer port 445; delvis filtrert av brannmur.', payloadSnippet: "SMB_COM_TRANSACTION2 0x32" },
    { id: 'c-1-3', rowLabel: layerLabels[0], colLabel: attackLabels[2], intensity: 30, valueDisplay: '30% Penetrasjon', threatLevel: 'LOW', details: 'SCADA S7 protokoll krever dyp L7 pakkeinspeksjon.', payloadSnippet: "s7otbxsx.dll hook" },
    { id: 'c-1-4', rowLabel: layerLabels[0], colLabel: attackLabels[3], intensity: 88, valueDisplay: '88% GJENNOMBRUDD', threatLevel: 'CRITICAL', details: 'Volumetrisk 100Gbps flom overbelaster WAF-pakkebufferne! RØDT LAG DOMINERER.', payloadSnippet: "14.8Mpps TCP SYN FLOOD" },
    { id: 'c-1-5', rowLabel: layerLabels[0], colLabel: attackLabels[4], intensity: 94, valueDisplay: '94% GJENNOMBRUDD', threatLevel: 'CRITICAL', details: 'Polymorfisk Zero-Day omgår WAF-signaturer med 100% obfuskering! VIRUS GÅR GJENNOM.', payloadSnippet: "0xEB049090...XOR_POLY" },
    { id: 'c-1-6', rowLabel: layerLabels[0], colLabel: attackLabels[5], intensity: 65, valueDisplay: '65% Penetrasjon', threatLevel: 'HIGH', details: 'ROP-kjede passerer gjennom HTTP-kroppen ukontrollert.', payloadSnippet: "\\x41\\x41\\x41\\x7f\\xff" },
    { id: 'c-1-7', rowLabel: layerLabels[0], colLabel: attackLabels[6], intensity: 75, valueDisplay: '75% Penetrasjon', threatLevel: 'HIGH', details: 'SSRF omgår ekstern brannmur via intern DNS-resolusjon (169.254.169.254).', payloadSnippet: "http://169.254.169.254/latest/meta-data" },
    { id: 'c-1-8', rowLabel: layerLabels[0], colLabel: attackLabels[7], intensity: 92, valueDisplay: '92% GJENNOMBRUDD', threatLevel: 'CRITICAL', details: 'Signert binærfil passerer rett gjennom WAF uten inspeksjon.', payloadSnippet: "liblzma.so.5.6.0 backdoor" },

    // Layer 2: Shannon Entropi
    { id: 'c-2-1', rowLabel: layerLabels[1], colLabel: attackLabels[0], intensity: 15, valueDisplay: '15% Penetrasjon', threatLevel: 'LOW', details: 'Lav entropi (2.4 bits): SQLi avskjæres i heuristisk parser.', payloadSnippet: "Normal tekst-entropi" },
    { id: 'c-2-2', rowLabel: layerLabels[1], colLabel: attackLabels[1], intensity: 35, valueDisplay: '35% Penetrasjon', threatLevel: 'MEDIUM', details: 'SMB-kryptering trigger middels entropi-alarm.', payloadSnippet: "MS17-010 buffer stream" },
    { id: 'c-2-3', rowLabel: layerLabels[1], colLabel: attackLabels[2], intensity: 78, valueDisplay: '78% GJENNOMBRUDD', threatLevel: 'HIGH', details: 'Stuxnet bruker legitim Siemens S7-struktur; slipper unna entropi-filteret!', payloadSnippet: "Simatic S7 DB1 frekvens-instruksjon" },
    { id: 'c-2-4', rowLabel: layerLabels[1], colLabel: attackLabels[3], intensity: 25, valueDisplay: '25% Penetrasjon', threatLevel: 'LOW', details: 'SYN-flom har uniform lav entropi; filtreres av Anycast BGP scrubbing.', payloadSnippet: "Repetitive SYN headers" },
    { id: 'c-2-5', rowLabel: layerLabels[1], colLabel: attackLabels[4], intensity: 82, valueDisplay: '82% GJENNOMBRUDD', threatLevel: 'CRITICAL', details: 'Maksimal Shannon entropi (7.92 bits)! Utløser alarm, men payload overvelder buffer.', payloadSnippet: "Compressed Shellcode spray" },
    { id: 'c-2-6', rowLabel: layerLabels[1], colLabel: attackLabels[5], intensity: 50, valueDisplay: '50% Penetrasjon', threatLevel: 'MEDIUM', details: 'NOP-sled har ekstremt lav entropi, flagges umiddelbart av heuristikk.', payloadSnippet: "0x90909090 repetisjon" },
    { id: 'c-2-7', rowLabel: layerLabels[1], colLabel: attackLabels[6], intensity: 10, valueDisplay: '10% Penetrasjon', threatLevel: 'SAFE', details: 'Intern URL har normal entropi, men blokkeres av egendefinert regex.', payloadSnippet: "URL schema validert" },
    { id: 'c-2-8', rowLabel: layerLabels[1], colLabel: attackLabels[7], intensity: 85, valueDisplay: '85% GJENNOMBRUDD', threatLevel: 'CRITICAL', details: 'Skjult i komprimert liblzma-arkiv; entropien kamuflert som legitim kompresjon.', payloadSnippet: "LZMA2 stream deception" },

    // Layer 3: Minne Heap-Scrambler & Tarpit
    { id: 'c-3-1', rowLabel: layerLabels[2], colLabel: attackLabels[0], intensity: 5, valueDisplay: '5% Penetrasjon', threatLevel: 'SAFE', details: 'SQLi når aldri minnekjernen, parameteriserte spørringer isolerer inndata.', payloadSnippet: "Prepared statement lock" },
    { id: 'c-3-2', rowLabel: layerLabels[2], colLabel: attackLabels[1], intensity: 10, valueDisplay: '10% Penetrasjon', threatLevel: 'SAFE', details: 'SMBv1-buffer allokert i isolert sandboks-tarpit, minneoverskriving avverget.', payloadSnippet: "Kernel Heap Guard aktiv" },
    { id: 'c-3-3', rowLabel: layerLabels[2], colLabel: attackLabels[2], intensity: 70, valueDisplay: '70% Penetrasjon', threatLevel: 'HIGH', details: 'Stuxnet manipulerer PLS-minneadresser direkte via DLL-hooking.', payloadSnippet: "DB1.DBD20 frekvens-override" },
    { id: 'c-3-4', rowLabel: layerLabels[2], colLabel: attackLabels[3], intensity: 12, valueDisplay: '12% Penetrasjon', threatLevel: 'SAFE', details: 'SYN-cookie minnehåndtering forhindrer utmatting av tilkoblingstråder.', payloadSnippet: "SYN Cookie table hash" },
    { id: 'c-3-5', rowLabel: layerLabels[2], colLabel: attackLabels[4], intensity: 65, valueDisplay: '65% Penetrasjon', threatLevel: 'HIGH', details: 'Avansert ROP bypasser ASLR og finner kode-gadgets i minnet! VIRUS FREMGANG.', payloadSnippet: "ROP Gadget: pop rax; ret;" },
    { id: 'c-3-6', rowLabel: layerLabels[2], colLabel: attackLabels[5], intensity: 40, valueDisplay: '40% Penetrasjon', threatLevel: 'MEDIUM', details: 'AES-GCM Heap-scrambler stokker minnepekere hvert 50. millisekund.', payloadSnippet: "Pointer randomization" },
    { id: 'c-3-7', rowLabel: layerLabels[2], colLabel: attackLabels[6], intensity: 15, valueDisplay: '15% Penetrasjon', threatLevel: 'LOW', details: 'Cloud IMDS-kall blokkeres av intern nettverks-namespace isolasjon.', payloadSnippet: "Network jail barrier" },
    { id: 'c-3-8', rowLabel: layerLabels[2], colLabel: attackLabels[7], intensity: 80, valueDisplay: '80% GJENNOMBRUDD', threatLevel: 'CRITICAL', details: 'ELF-symbolkapring hekter SSHD RSA-dekryptering direkte i kjerne-minnet!', payloadSnippet: "_get_cpuid symbol hijack" },

    // Layer 4: WORM-Kjerne & Kyber-Skjold
    { id: 'c-4-1', rowLabel: layerLabels[3], colLabel: attackLabels[0], intensity: 0, valueDisplay: '0% Penetrasjon', threatLevel: 'SAFE', details: 'Databaselogger forseglet i WORM SHA-256 kjede; fullstendig avverget.', payloadSnippet: "SHA-256 seal 0x8a9b" },
    { id: 'c-4-2', rowLabel: layerLabels[3], colLabel: attackLabels[1], intensity: 5, valueDisplay: '5% Penetrasjon', threatLevel: 'SAFE', details: 'Krypteringsforsøk mot fillager krasjer mot uforanderlig WORM-filsystem.', payloadSnippet: "WORM immutable lock" },
    { id: 'c-4-3', rowLabel: layerLabels[3], colLabel: attackLabels[2], intensity: 55, valueDisplay: '55% Penetrasjon', threatLevel: 'MEDIUM', details: 'Frekvensavvik logget, men PLS fysisk påvirket før kjerne-stans.', payloadSnippet: "Safety interlock trip" },
    { id: 'c-4-4', rowLabel: layerLabels[3], colLabel: attackLabels[3], intensity: 0, valueDisplay: '0% Penetrasjon', threatLevel: 'SAFE', details: 'Null-route blackhole sender all botnet-flom i digitalt sluk.', payloadSnippet: "Blackhole 0.0.0.0 route" },
    { id: 'c-4-5', rowLabel: layerLabels[3], colLabel: attackLabels[4], intensity: 58, valueDisplay: '58% Penetrasjon', threatLevel: 'HIGH', details: 'Zero-Day utløser unhandled exception, men etterlater kjerne-spor.', payloadSnippet: "Kernel panic trace" },
    { id: 'c-4-6', rowLabel: layerLabels[3], colLabel: attackLabels[5], intensity: 10, valueDisplay: '10% Penetrasjon', threatLevel: 'SAFE', details: 'Stack canary oppdaget korrupsjon og terminerte prosessen momentant.', payloadSnippet: "Stack smashing detected" },
    { id: 'c-4-7', rowLabel: layerLabels[3], colLabel: attackLabels[6], intensity: 5, valueDisplay: '5% Penetrasjon', threatLevel: 'SAFE', details: 'IAM rolle-autorisasjon avviste eksfiltrerte midlertidige nøkler.', payloadSnippet: "STS token invalidated" },
    { id: 'c-4-8', rowLabel: layerLabels[3], colLabel: attackLabels[7], intensity: 75, valueDisplay: '75% GJENNOMBRUDD', threatLevel: 'HIGH', details: 'Bakdør oppnår uautorisert SSH-rotaksess før WORM oppdager uvanlig nøkkel!', payloadSnippet: "Root session established" },
  ];

  // Heatmap 2: Nettverks-porter (6 porter) vs Tidsintervaller (6 punkter)
  const portLabels = ['Port 80/443 (HTTP/S)', 'Port 445 (SMBv1)', 'Port 22 (SSH)', 'Port 53 (DNS/C2)', 'Port 102 (S7 ICS)', 'Port 8080 (REST API)'];
  const timeLabels = ['T-50m', 'T-40m', 'T-30m', 'T-20m', 'T-10m', 'NÅ (Sanntid)'];

  const portVsTimeMatrix: HeatmapCell[] = [
    { id: 'p-1', rowLabel: portLabels[0], colLabel: timeLabels[0], intensity: 35, valueDisplay: '3.2k req/s', threatLevel: 'LOW', details: 'Normal webtrafikk med spredte XSS-sonderinger.' },
    { id: 'p-2', rowLabel: portLabels[0], colLabel: timeLabels[1], intensity: 45, valueDisplay: '4.8k req/s', threatLevel: 'MEDIUM', details: 'Økende trafikk med SQLi-mønstre mot /login.' },
    { id: 'p-3', rowLabel: portLabels[0], colLabel: timeLabels[2], intensity: 95, valueDisplay: '88k req/s', threatLevel: 'CRITICAL', details: 'Massiv HTTP/2 Rapid Reset flom! RØDT LAG angriper aggressivt.' },
    { id: 'p-4', rowLabel: portLabels[0], colLabel: timeLabels[3], intensity: 90, valueDisplay: '75k req/s', threatLevel: 'CRITICAL', details: 'Flommen fortsetter; WAF rate-limiting under tung belastning.' },
    { id: 'p-5', rowLabel: portLabels[0], colLabel: timeLabels[4], intensity: 40, valueDisplay: '4.1k req/s', threatLevel: 'MEDIUM', details: 'Flom avtatt; trafikk normaliseres.' },
    { id: 'p-6', rowLabel: portLabels[0], colLabel: timeLabels[5], intensity: 25, valueDisplay: '2.8k req/s', threatLevel: 'LOW', details: 'Normal baseline-trafikk.' },

    { id: 'p-7', rowLabel: portLabels[1], colLabel: timeLabels[0], intensity: 10, valueDisplay: '24 pps', threatLevel: 'SAFE', details: 'Lokal SMB-fildeling normal.' },
    { id: 'p-8', rowLabel: portLabels[1], colLabel: timeLabels[1], intensity: 75, valueDisplay: '1.2k pps', threatLevel: 'HIGH', details: 'WannaCry EternalBlue orm sprer seg over lokalnettet!' },
    { id: 'p-9', rowLabel: portLabels[1], colLabel: timeLabels[2], intensity: 88, valueDisplay: '2.4k pps', threatLevel: 'CRITICAL', details: 'Port 445 mettet med FEA buffer overflow pakker.' },
    { id: 'p-10', rowLabel: portLabels[1], colLabel: timeLabels[3], intensity: 60, valueDisplay: '800 pps', threatLevel: 'HIGH', details: 'eBPF XDP kjernefilter dropper 98% av innkommende pakker.' },
    { id: 'p-11', rowLabel: portLabels[1], colLabel: timeLabels[4], intensity: 15, valueDisplay: '45 pps', threatLevel: 'LOW', details: 'Angrepet slått tilbake av kjernebrannmuren.' },
    { id: 'p-12', rowLabel: portLabels[1], colLabel: timeLabels[5], intensity: 5, valueDisplay: '12 pps', threatLevel: 'SAFE', details: 'Port 445 stengt av White Hat admin.' },

    { id: 'p-13', rowLabel: portLabels[2], colLabel: timeLabels[0], intensity: 50, valueDisplay: '120 forsøk/s', threatLevel: 'MEDIUM', details: 'Brute-force angrep mot SSH root-innlogging.' },
    { id: 'p-14', rowLabel: portLabels[2], colLabel: timeLabels[1], intensity: 85, valueDisplay: 'XZ-Hook Aktiv', threatLevel: 'CRITICAL', details: 'XZ-Utils bakdør hekter RSA_public_decrypt!' },
    { id: 'p-15', rowLabel: portLabels[2], colLabel: timeLabels[2], intensity: 92, valueDisplay: 'RCE Oppnådd', threatLevel: 'CRITICAL', details: 'RØDT LAG oppnådde root-tilgang via modifisert liblzma!' },
    { id: 'p-16', rowLabel: portLabels[2], colLabel: timeLabels[3], intensity: 70, valueDisplay: 'Lateral bevegelse', threatLevel: 'HIGH', details: 'Angriper prøver å hoppe til andre servere.' },
    { id: 'p-17', rowLabel: portLabels[2], colLabel: timeLabels[4], intensity: 20, valueDisplay: 'Nøkkel rotert', threatLevel: 'LOW', details: 'Kompromittert bibliotek erstattet med rent arkiv.' },
    { id: 'p-18', rowLabel: portLabels[2], colLabel: timeLabels[5], intensity: 8, valueDisplay: '2 forsøk/s', threatLevel: 'SAFE', details: 'SSH sikret med Ed25519-nøkler og MFA.' },

    { id: 'p-19', rowLabel: portLabels[3], colLabel: timeLabels[0], intensity: 15, valueDisplay: 'Normal DNS', threatLevel: 'LOW', details: 'Standard domeneoppslag.' },
    { id: 'p-20', rowLabel: portLabels[3], colLabel: timeLabels[1], intensity: 65, valueDisplay: 'DGA Tunneling', threatLevel: 'HIGH', details: 'Subdomener med høy entropi brukt til C2-eksiltrering.' },
    { id: 'p-21', rowLabel: portLabels[3], colLabel: timeLabels[2], intensity: 80, valueDisplay: 'C2 Eksfiltrering', threatLevel: 'CRITICAL', details: 'RØDT LAG laster ned kommandofiler forkledd som DNS TXT-poster.' },
    { id: 'p-22', rowLabel: portLabels[3], colLabel: timeLabels[3], intensity: 45, valueDisplay: 'DNS Sinkhole', threatLevel: 'MEDIUM', details: 'DNS Sinkhole omdirigerer ondsinnede domener til 127.0.0.1.' },
    { id: 'p-23', rowLabel: portLabels[3], colLabel: timeLabels[4], intensity: 10, valueDisplay: 'Avverget', threatLevel: 'SAFE', details: 'C2-forbindelse brutt.' },
    { id: 'p-24', rowLabel: portLabels[3], colLabel: timeLabels[5], intensity: 5, valueDisplay: 'Sikret', threatLevel: 'SAFE', details: 'DNS over HTTPS (DoH) med streng domene-validering.' },

    { id: 'p-25', rowLabel: portLabels[4], colLabel: timeLabels[0], intensity: 10, valueDisplay: 'PLS Normal', threatLevel: 'SAFE', details: '1064 Hz stabil rotasjon.' },
    { id: 'p-26', rowLabel: portLabels[4], colLabel: timeLabels[1], intensity: 85, valueDisplay: 'Stuxnet Sabotasje', threatLevel: 'CRITICAL', details: 'Frekvens manipulert til 1410 Hz! RØDT LAG slår til mot industrielt anlegg.' },
    { id: 'p-27', rowLabel: portLabels[4], colLabel: timeLabels[2], intensity: 95, valueDisplay: 'Sentrifuge Overdrive', threatLevel: 'CRITICAL', details: 'Fysisk slitasje påført sentrifugene.' },
    { id: 'p-28', rowLabel: portLabels[4], colLabel: timeLabels[3], intensity: 60, valueDisplay: 'YARA Deteksjon', threatLevel: 'HIGH', details: 'Minneskanning avslører s7otbxsx.dll hook.' },
    { id: 'p-29', rowLabel: portLabels[4], colLabel: timeLabels[4], intensity: 20, valueDisplay: 'Frekvens gjenopprettet', threatLevel: 'LOW', details: 'Rotorhastighet tvangslåst til nominell 1064 Hz.' },
    { id: 'p-30', rowLabel: portLabels[4], colLabel: timeLabels[5], intensity: 5, valueDisplay: 'Normal', threatLevel: 'SAFE', details: 'Air-gap bryter aktivert.' },

    { id: 'p-31', rowLabel: portLabels[5], colLabel: timeLabels[0], intensity: 30, valueDisplay: '50 req/s', threatLevel: 'LOW', details: 'REST API driftsstatus OK.' },
    { id: 'p-32', rowLabel: portLabels[5], colLabel: timeLabels[1], intensity: 55, valueDisplay: 'BOLA / IDOR', threatLevel: 'MEDIUM', details: 'Angriper itererer bruker-IDer i URL.' },
    { id: 'p-33', rowLabel: portLabels[5], colLabel: timeLabels[2], intensity: 75, valueDisplay: 'Token Lekkasje', threatLevel: 'HIGH', details: 'Ubeskyttet endpoint /api/debug lekker JWT-tokens.' },
    { id: 'p-34', rowLabel: portLabels[5], colLabel: timeLabels[3], intensity: 65, valueDisplay: 'Rate Limit', threatLevel: 'HIGH', details: '429 Too Many Requests utløst.' },
    { id: 'p-35', rowLabel: portLabels[5], colLabel: timeLabels[4], intensity: 25, valueDisplay: 'API V2 Oppdatert', threatLevel: 'LOW', details: 'Rollebasert tilgangskontroll (RBAC) aktivert.' },
    { id: 'p-36', rowLabel: portLabels[5], colLabel: timeLabels[5], intensity: 10, valueDisplay: 'Normal', threatLevel: 'SAFE', details: 'MFA påkrevd på alle administrative kall.' },
  ];

  // Helper for thermal gradient colors
  const getCellColor = (intensity: number, threatLevel: string) => {
    if (threatLevel === 'CRITICAL' || intensity >= 80) {
      return 'bg-gradient-to-br from-rose-600 to-red-950 text-white border-rose-500 shadow-md shadow-rose-950/40 animate-pulse';
    }
    if (threatLevel === 'HIGH' || intensity >= 60) {
      return 'bg-gradient-to-br from-amber-600 to-orange-950 text-amber-100 border-amber-500 shadow-sm shadow-amber-950/30';
    }
    if (threatLevel === 'MEDIUM' || intensity >= 35) {
      return 'bg-gradient-to-br from-yellow-700/80 to-amber-950 text-yellow-100 border-yellow-600/70';
    }
    if (threatLevel === 'LOW' || intensity >= 15) {
      return 'bg-gradient-to-br from-cyan-900/60 to-slate-900 text-cyan-200 border-cyan-800/60';
    }
    return 'bg-slate-950/80 text-emerald-300 border-emerald-900/50';
  };

  // Score metrics
  const totalMatches = scoreState.redTeamWins + scoreState.blueTeamWins + scoreState.draws;
  const redWinPercent = totalMatches > 0 ? Math.round((scoreState.redTeamWins / totalMatches) * 100) : 48;
  const blueWinPercent = totalMatches > 0 ? Math.round((scoreState.blueTeamWins / totalMatches) * 100) : 52;

  return (
    <div id="wpww-cyber-heatmap-scoreboard" className="space-y-6 font-mono text-slate-100">
      
      {/* Top Banner: Real-Time Red vs Blue Scoreboard */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-600 to-cyan-600 text-white shadow-lg shadow-purple-950">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-wide text-slate-100">
                  Global Cyber Scoreboard & Balanse-Matrise
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 border border-purple-700 text-purple-300 font-bold">
                  LIVE SESJON
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Red Team (Virus / Angripere) kjemper mot Blue Team (Brannmur / Forsvarere). Begge sider kan vinne!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onResetScore && (
              <button
                onClick={onResetScore}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                title="Tilbakestill kampstatistikk"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Nullstill Score</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Dual-Score Card: RED TEAM vs BLUE TEAM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* RED TEAM SCORE CARD */}
          <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950 border border-rose-800/60 shadow-lg shadow-rose-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skull className="w-5 h-5 text-rose-400" />
                <span className="text-xs font-bold text-rose-300 tracking-wider">
                  RED TEAM // VIRUS & ANGRIPERE
                </span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700">
                {scoreState.redTeamWins} Seiere ({redWinPercent}%)
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl sm:text-4xl font-black text-rose-400 tracking-tight">
                  {scoreState.redTeamScore.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 ml-2 font-sans">Poeng</span>
              </div>
              <div className="text-right text-[11px] text-rose-300">
                <span>Skade påført: <strong>{scoreState.totalDamageDealtByRed.toLocaleString()} HP</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-rose-900/50 text-[11px]">
              <div className="p-2 rounded bg-slate-950/60 border border-rose-950">
                <span className="text-slate-400 block text-[10px]">Zero-Day Gjennombrudd:</span>
                <strong className="text-rose-300 text-sm">{scoreState.zeroDayBreaches} kjerne-breach</strong>
              </div>
              <div className="p-2 rounded bg-slate-950/60 border border-rose-950">
                <span className="text-slate-400 block text-[10px]">Kritiske Fulltreffere:</span>
                <strong className="text-amber-300 text-sm">{scoreState.criticalExploitsExecuted} exploits</strong>
              </div>
            </div>

            {onSimulateClash && (
              <button
                onClick={() => onSimulateClash('RED')}
                className="w-full py-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-rose-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-rose-400" />
                <span>Simuler Red Team Gjennombrudd (+150 pts)</span>
              </button>
            )}
          </div>

          {/* BLUE TEAM SCORE CARD */}
          <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 border border-cyan-800/60 shadow-lg shadow-cyan-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <span className="text-xs font-bold text-cyan-300 tracking-wider">
                  BLUE TEAM // BRANNMUR & FORSVARERE
                </span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
                {scoreState.blueTeamWins} Seiere ({blueWinPercent}%)
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl sm:text-4xl font-black text-cyan-400 tracking-tight">
                  {scoreState.blueTeamScore.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 ml-2 font-sans">Poeng</span>
              </div>
              <div className="text-right text-[11px] text-cyan-300">
                <span>Skade absorbert: <strong>{scoreState.totalDamageBlockedByBlue.toLocaleString()} HP</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-cyan-900/50 text-[11px]">
              <div className="p-2 rounded bg-slate-950/60 border border-cyan-950">
                <span className="text-slate-400 block text-[10px]">Trusler Nøytralisert:</span>
                <strong className="text-cyan-300 text-sm">{scoreState.attacksRepelled} angrep</strong>
              </div>
              <div className="p-2 rounded bg-slate-950/60 border border-cyan-950">
                <span className="text-slate-400 block text-[10px]">WORM Bevis Forseglet:</span>
                <strong className="text-emerald-300 text-sm">100% Intakt Kjede</strong>
              </div>
            </div>

            {onSimulateClash && (
              <button
                onClick={() => onSimulateClash('BLUE')}
                className="w-full py-2 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700 text-cyan-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>Simuler Blue Team Avverging (+150 pts)</span>
              </button>
            )}
          </div>

        </div>

        {/* Visual Power Balance Tug-of-War Gauge */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-rose-400 flex items-center gap-1">
              <Skull className="w-3.5 h-3.5" /> RED TEAM {redWinPercent}%
            </span>
            <span className="text-slate-400 font-normal">
              Dynamisk Maktbalanse (Tug-of-War)
            </span>
            <span className="text-cyan-400 flex items-center gap-1">
              BLUE TEAM {blueWinPercent}% <Shield className="w-3.5 h-3.5" />
            </span>
          </div>
          
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800 shadow-inner">
            <div
              className="bg-gradient-to-r from-rose-600 to-rose-500 h-full transition-all duration-500"
              style={{ width: `${redWinPercent}%` }}
            ></div>
            <div
              className="bg-gradient-to-r from-cyan-500 to-cyan-600 h-full transition-all duration-500"
              style={{ width: `${blueWinPercent}%` }}
            ></div>
          </div>
        </div>

      </div>

      {/* Heatmap Matrix Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4">
        
        {/* Heatmap Header & Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-950 border border-amber-700 text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Interaktivt Trussel- & Penetrasjons-Heatmap
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Visuell fargetemperatur: Rød/glødende indikerer at viruset bryter gjennom, grønn indikerer at muren holder.
              </p>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => { setActiveHeatmapTab('layers_vs_attacks'); setSelectedCell(null); }}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeHeatmapTab === 'layers_vs_attacks'
                  ? 'bg-amber-950 border border-amber-700 text-amber-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Brannmur vs Angrep (4x8)</span>
            </button>
            <button
              onClick={() => { setActiveHeatmapTab('ports_vs_time'); setSelectedCell(null); }}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeHeatmapTab === 'ports_vs_time'
                  ? 'bg-cyan-950 border border-cyan-700 text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Porter vs Tid (6x6)</span>
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <span className="font-bold text-slate-300">Penetrasjons-Skala:</span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-3 h-3 rounded bg-emerald-950 border border-emerald-700"></span> 0-15% Sikker Mur
            </span>
            <span className="flex items-center gap-1 text-cyan-300">
              <span className="w-3 h-3 rounded bg-cyan-950 border border-cyan-700"></span> 15-35% Lav Belastning
            </span>
            <span className="flex items-center gap-1 text-amber-300">
              <span className="w-3 h-3 rounded bg-amber-950 border border-amber-700"></span> 35-65% Moderat Sårbar
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-3 h-3 rounded bg-rose-950 border border-rose-600 animate-pulse"></span> 65-100% Virus Gjennombrudd
            </span>
          </div>
        </div>

        {/* MATRIX 1: BRANNMUR-LAG VS ANGREPSVEKTORER */}
        {activeHeatmapTab === 'layers_vs_attacks' && (
          <div className="overflow-x-auto space-y-2">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="p-2 text-left bg-slate-950 border border-slate-800 text-slate-400 font-bold uppercase text-[10px] w-48">
                    Brannmurs-Lag / Vektor
                  </th>
                  {attackLabels.map((att, idx) => (
                    <th key={idx} className="p-2 text-center bg-slate-950 border border-slate-800 text-slate-300 font-bold text-[10px] min-w-[110px]">
                      {att}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {layerLabels.map((layer, rowIdx) => {
                  const cellsInRow = layerVsAttackMatrix.slice(rowIdx * 8, rowIdx * 8 + 8);

                  return (
                    <tr key={rowIdx}>
                      <td className="p-2 bg-slate-950 border border-slate-800 font-bold text-slate-300 text-[11px]">
                        {layer}
                      </td>
                      {cellsInRow.map((cell) => {
                        const isSelected = selectedCell?.id === cell.id;
                        const cellColor = getCellColor(cell.intensity, cell.threatLevel);

                        return (
                          <td key={cell.id} className="p-1 border border-slate-800/80">
                            <button
                              onClick={() => setSelectedCell(cell)}
                              className={`w-full p-2.5 rounded-lg border text-center transition-all cursor-pointer font-mono flex flex-col items-center justify-center gap-0.5 ${cellColor} ${
                                isSelected ? 'ring-2 ring-white scale-105 z-10' : 'hover:scale-[1.03]'
                              }`}
                            >
                              <span className="text-[11px] font-black">{cell.intensity}%</span>
                              <span className="text-[9px] opacity-85 truncate max-w-full font-bold">
                                {cell.intensity >= 65 ? '💥 BREACH' : cell.intensity <= 15 ? '🛡️ SIKKER' : '⚠️ SÅRBAR'}
                              </span>
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* MATRIX 2: PORTER VS TID */}
        {activeHeatmapTab === 'ports_vs_time' && (
          <div className="overflow-x-auto space-y-2">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="p-2 text-left bg-slate-950 border border-slate-800 text-slate-400 font-bold uppercase text-[10px] w-48">
                    Nettverks-Port
                  </th>
                  {timeLabels.map((time, idx) => (
                    <th key={idx} className="p-2 text-center bg-slate-950 border border-slate-800 text-slate-300 font-bold text-[10px] min-w-[110px]">
                      {time}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {portLabels.map((port, rowIdx) => {
                  const cellsInRow = portVsTimeMatrix.slice(rowIdx * 6, rowIdx * 6 + 6);

                  return (
                    <tr key={rowIdx}>
                      <td className="p-2 bg-slate-950 border border-slate-800 font-bold text-slate-300 text-[11px]">
                        {port}
                      </td>
                      {cellsInRow.map((cell) => {
                        const isSelected = selectedCell?.id === cell.id;
                        const cellColor = getCellColor(cell.intensity, cell.threatLevel);

                        return (
                          <td key={cell.id} className="p-1 border border-slate-800/80">
                            <button
                              onClick={() => setSelectedCell(cell)}
                              className={`w-full p-2.5 rounded-lg border text-center transition-all cursor-pointer font-mono flex flex-col items-center justify-center gap-0.5 ${cellColor} ${
                                isSelected ? 'ring-2 ring-white scale-105 z-10' : 'hover:scale-[1.03]'
                              }`}
                            >
                              <span className="text-[11px] font-black">{cell.intensity}%</span>
                              <span className="text-[9px] opacity-85 truncate max-w-full">
                                {cell.valueDisplay}
                              </span>
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Interactive Cell Inspector Drawer */}
        {selectedCell && (
          <div className="p-4 rounded-xl bg-slate-950 border border-cyan-800/80 space-y-3 shadow-xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  selectedCell.threatLevel === 'CRITICAL'
                    ? 'bg-rose-950 text-rose-300 border-rose-800'
                    : selectedCell.threatLevel === 'HIGH'
                    ? 'bg-amber-950 text-amber-300 border-amber-800'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                }`}>
                  {selectedCell.threatLevel} ({selectedCell.intensity}% Penetrasjon)
                </span>
                <h4 className="text-xs font-bold text-slate-100 font-mono">
                  {selectedCell.rowLabel} ➔ {selectedCell.colLabel}
                </h4>
              </div>
              <button
                onClick={() => setSelectedCell(null)}
                className="text-xs text-slate-500 hover:text-slate-200 cursor-pointer"
              >
                ✕ Lukk Detaljer
              </button>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {selectedCell.details}
            </p>

            {selectedCell.payloadSnippet && (
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs font-mono">
                <span className="text-slate-500 text-[10px] block mb-0.5">Payload / Protokoll-Signatur:</span>
                <code className="text-emerald-400">{selectedCell.payloadSnippet}</code>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
