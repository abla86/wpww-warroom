import React, { useState, useEffect, useRef } from 'react';
import {
  Crown,
  Flame,
  Zap,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Swords,
  Radio,
  Cpu,
  Database,
  Sliders,
  Sparkles,
  RefreshCw,
  Lock,
  Eye,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  Terminal,
  Award,
  HelpCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Crosshair,
  TrendingUp,
  Layers,
  Dna,
  Shuffle,
  X
} from 'lucide-react';
import {
  CyberGladiator,
  GodModeConfig,
  BattleLogEntry,
  BattleReport
} from '../types';
import { HackerIntelTooltip } from './HackerIntelTooltip';

interface CyberArenaVisualizerProps {
  fighter1: CyberGladiator;
  fighter2: CyberGladiator;
  setFighter1: (fighter: CyberGladiator) => void;
  setFighter2: (fighter: CyberGladiator) => void;
  gladiators: CyberGladiator[];
  config: GodModeConfig;
  setConfig: React.Dispatch<React.SetStateAction<GodModeConfig>>;
  battleState: 'IDLE' | 'FIGHTING' | 'PAUSED' | 'FINISHED';
  currentRound: number;
  turn: 1 | 2;
  battleLogs: BattleLogEntry[];
  isAutoBattle: boolean;
  setIsAutoBattle: (val: boolean) => void;
  autoSpeedMs: number;
  setAutoSpeedMs: (ms: number) => void;
  handleStartBattle: () => void;
  executeTurnAction: (moveIndex?: number) => void;
  lastActionAnimation: string | null;
  latestReport: BattleReport | null;
  onOpenReportModal: () => void;
  showLiveModding: boolean;
  setShowLiveModding: (val: boolean) => void;
}

export const CyberArenaVisualizer: React.FC<CyberArenaVisualizerProps> = ({
  fighter1,
  fighter2,
  setFighter1,
  setFighter2,
  gladiators,
  config,
  setConfig,
  battleState,
  currentRound,
  turn,
  battleLogs,
  isAutoBattle,
  setIsAutoBattle,
  autoSpeedMs,
  setAutoSpeedMs,
  handleStartBattle,
  executeTurnAction,
  lastActionAnimation,
  latestReport,
  onOpenReportModal,
  showLiveModding,
  setShowLiveModding,
}) => {
  // Help Modal / Codex State
  const [showCodex, setShowCodex] = useState<boolean>(false);
  const [codexTab, setCodexTab] = useState<'stats' | 'moves' | 'defenses' | 'formula' | 'matchups'>('stats');

  // Quick stat tooltip popover state (hover or click)
  const [activeStatTooltip, setActiveStatTooltip] = useState<string | null>(null);

  // Floating damage effect state
  const [floatingDamage, setFloatingDamage] = useState<{
    text: string;
    target: 'f1' | 'f2';
    type: 'crit' | 'hit' | 'reflect' | 'mutate' | 'scrubbed';
  } | null>(null);

  const battleLogEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll combat log
  useEffect(() => {
    battleLogEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [battleLogs]);

  // Trigger floating damage number when lastActionAnimation updates
  useEffect(() => {
    if (!lastActionAnimation || battleLogs.length === 0) return;
    const latest = battleLogs[battleLogs.length - 1];
    if (!latest) return;

    // Target is the defender of the turn
    const target = turn === 1 ? 'f2' : 'f1';
    let text = `-${latest.damage} HP`;
    let type: 'crit' | 'hit' | 'reflect' | 'mutate' | 'scrubbed' = 'hit';

    if (lastActionAnimation === 'CRITICAL') {
      text = `💥 KRITISK -${latest.damage}!`;
      type = 'crit';
    } else if (lastActionAnimation === 'REFLECT') {
      text = `🛡️ REFLEKTERT -${latest.damageReflected || 40}!`;
      type = 'reflect';
    } else if (lastActionAnimation === 'MUTATE') {
      text = `🧬 MUTASJON +0.4 ENTROPI`;
      type = 'mutate';
    } else if (latest.message.includes('Scrubbing')) {
      text = `🌊 BGP SCRUBBED -75%`;
      type = 'scrubbed';
    }

    setFloatingDamage({ text, target, type });
    const timer = setTimeout(() => {
      setFloatingDamage(null);
    }, 900);
    return () => clearTimeout(timer);
  }, [lastActionAnimation, battleLogs, turn]);

  // Calculate Momentum / Field Control percentage (0 to 100)
  const f1HpPercent = (fighter1.hp / fighter1.maxHp) * 100;
  const f2HpPercent = (fighter2.hp / fighter2.maxHp) * 100;
  const f1CombatRating = f1HpPercent * 0.6 + fighter1.attackPower * 0.2 + fighter1.speed * 0.2;
  const f2CombatRating = f2HpPercent * 0.6 + fighter2.attackPower * 0.2 + fighter2.speed * 0.2;
  const momentumF1 = Math.round((f1CombatRating / (f1CombatRating + f2CombatRating || 1)) * 100);

  // Latest battle clash breakdown data
  const latestLog = battleLogs[battleLogs.length - 1];

  // Quick preset matchup selector
  const applyPresetMatchup = (id1: string, id2: string) => {
    const f1 = gladiators.find((g) => g.id === id1) || gladiators[0];
    const f2 = gladiators.find((g) => g.id === id2) || gladiators[1];
    setFighter1({ ...f1, hp: f1.maxHp });
    setFighter2({ ...f2, hp: f2.maxHp });
  };

  const pickRandomMatchup = () => {
    const pool = [...gladiators];
    const idx1 = Math.floor(Math.random() * pool.length);
    const f1 = pool[idx1];
    pool.splice(idx1, 1);
    const idx2 = Math.floor(Math.random() * pool.length);
    const f2 = pool[idx2];
    setFighter1({ ...f1, hp: f1.maxHp });
    setFighter2({ ...f2, hp: f2.maxHp });
  };

  return (
    <div className="space-y-6">
      {/* TOP CONTROL & PRESET MATCHUPS BAR */}
      <div className="bg-slate-950/95 border border-slate-800 rounded-xl p-4 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-1.5 rounded-lg bg-amber-950/80 border border-amber-600/80 text-amber-400">
                <Swords className="w-5 h-5" />
              </span>
              <h2 className="font-mono font-bold text-slate-100 text-base sm:text-lg uppercase tracking-wider flex items-center gap-2">
                Holografisk Cyber-Arena // Gladiator Matrise
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950 border border-rose-700/80 text-rose-300 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                  Sanntids Kollisjon
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Følg kollisjoner med sanntids laserstråler, skadeberegninger og full innsikt i hvordan forsvarslag nøytraliserer angrep.
            </p>
          </div>

          {/* Action Buttons: Håndbok, Presets, Hurtigvalg */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowCodex(true)}
              className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-200 font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:border-cyan-400"
              title="Åpne taktisk forklaring av regler, formler, egenskaper og mottiltak"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>Taktisk Håndbok & Formler</span>
            </button>

            <button
              onClick={pickRandomMatchup}
              disabled={battleState === 'FIGHTING'}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Velg to tilfeldige gladiatorer til arenaringen"
            >
              <Shuffle className="w-3.5 h-3.5 text-purple-400" />
              <span>Tilfeldig Duell</span>
            </button>
          </div>
        </div>

        {/* Quick Matchup Presets Chips */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Legendariske Dueller:
          </span>
          <button
            onClick={() => applyPresetMatchup('virus-mirai-botnet', 'defender-anycast-scrubber')}
            disabled={battleState === 'FIGHTING'}
            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-rose-500/60 text-slate-300 hover:text-rose-300 transition-colors cursor-pointer disabled:opacity-50"
          >
            🌐 Mirai Botnet vs Anycast Citadel (DDoS-Flom)
          </button>
          <button
            onClick={() => applyPresetMatchup('virus-phantom-zeroday', 'defender-wpww-paladin')}
            disabled={battleState === 'FIGHTING'}
            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-purple-500/60 text-slate-300 hover:text-purple-300 transition-colors cursor-pointer disabled:opacity-50"
          >
            👻 Zero-Day vs WPWW Paladin (Polymorf Kaos)
          </button>
          <button
            onClick={() => applyPresetMatchup('virus-stuxnet-plc', 'defender-anycast-scrubber')}
            disabled={battleState === 'FIGHTING'}
            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/60 text-slate-300 hover:text-emerald-300 transition-colors cursor-pointer disabled:opacity-50"
          >
            ☢️ Stuxnet SCADA vs Forsvarer (Industriell Sabotasje)
          </button>
          <button
            onClick={() => applyPresetMatchup('virus-blackbyte-ransomware', 'defender-wpww-paladin')}
            disabled={battleState === 'FIGHTING'}
            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/60 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer disabled:opacity-50"
          >
            ☣️ Ransomware vs Paladin (Krypto-Lås)
          </button>
        </div>
      </div>

      {/* FIGHTER SELECTION DROPDOWNS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fighter 1 (Red Sector) */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-amber-400 font-bold uppercase flex items-center gap-1.5">
              <span>🔴 Kriger 1 (Rød Sektor — Angriper)</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
              {fighter1.category}
            </span>
          </div>
          <select
            value={fighter1.id}
            disabled={battleState === 'FIGHTING'}
            onChange={(e) => {
              const selected = gladiators.find((g) => g.id === e.target.value);
              if (selected) setFighter1({ ...selected, hp: selected.maxHp });
            }}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {gladiators.map((g) => (
              <option key={`f1-${g.id}`} value={g.id}>
                {g.avatar} {g.name} — HP: {g.maxHp} | Kraft: {g.attackPower} | Entropi: {g.entropyChaos}
              </option>
            ))}
          </select>
        </div>

        {/* Fighter 2 (Blue Sector) */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase flex items-center gap-1.5">
              <span>🔵 Kriger 2 (Blå Sektor — Forsvarer)</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
              {fighter2.category}
            </span>
          </div>
          <select
            value={fighter2.id}
            disabled={battleState === 'FIGHTING'}
            onChange={(e) => {
              const selected = gladiators.find((g) => g.id === e.target.value);
              if (selected) setFighter2({ ...selected, hp: selected.maxHp });
            }}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {gladiators.map((g) => (
              <option key={`f2-${g.id}`} value={g.id}>
                {g.avatar} {g.name} — HP: {g.maxHp} | Kraft: {g.attackPower} | Entropi: {g.entropyChaos}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* LIVE IN-BATTLE HOT-MODDING PANEL */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3 font-mono">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-200 uppercase">
              Sanntids Modifisering under Kamp // Hot-Modding
            </span>
            <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800 font-bold">
              LIVE JUSTERBART
            </span>
          </div>
          <button
            onClick={() => setShowLiveModding(!showLiveModding)}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
          >
            {showLiveModding ? 'Skjul Modifisering ▲' : 'Vis Modifisering ▼'}
          </button>
        </div>

        {showLiveModding && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 text-xs border-t border-slate-800/80">
            {/* Mod Fighter 1 (Red) */}
            <div className="bg-rose-950/20 p-3 rounded-lg border border-rose-900/40 space-y-2">
              <div className="flex justify-between font-bold text-rose-300 text-[11px]">
                <span>🔴 {fighter1.name} (Rød Sektor)</span>
                <span>HP: {fighter1.hp}/{fighter1.maxHp}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <div className="flex justify-between text-slate-400">
                    <span>Angrepskraft:</span>
                    <span className="font-bold text-rose-300">{fighter1.attackPower}</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="150"
                    value={fighter1.attackPower}
                    onChange={(e) => setFighter1({ ...fighter1, attackPower: parseInt(e.target.value) })}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-slate-400">
                    <span>Forsvarskraft:</span>
                    <span className="font-bold text-cyan-300">{fighter1.defensePower}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    value={fighter1.defensePower}
                    onChange={(e) => setFighter1({ ...fighter1, defensePower: parseInt(e.target.value) })}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-slate-400">
                    <span>Kaos-Entropi:</span>
                    <span className="font-bold text-purple-300">{fighter1.entropyChaos.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="8.0"
                    step="0.1"
                    value={fighter1.entropyChaos}
                    onChange={(e) => setFighter1({ ...fighter1, entropyChaos: parseFloat(e.target.value) })}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-slate-400">
                    <span>Fart (Hastighet):</span>
                    <span className="font-bold text-amber-300">{fighter1.speed}</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="120"
                    value={fighter1.speed}
                    onChange={(e) => setFighter1({ ...fighter1, speed: parseInt(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Mod Fighter 2 (Blue) */}
            <div className="bg-cyan-950/20 p-3 rounded-lg border border-cyan-900/40 space-y-2">
              <div className="flex justify-between font-bold text-cyan-300 text-[11px]">
                <span>🔵 {fighter2.name} (Blå Sektor)</span>
                <span>HP: {fighter2.hp}/{fighter2.maxHp}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <div className="flex justify-between text-slate-400">
                    <span>Angrepskraft:</span>
                    <span className="font-bold text-rose-300">{fighter2.attackPower}</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="150"
                    value={fighter2.attackPower}
                    onChange={(e) => setFighter2({ ...fighter2, attackPower: parseInt(e.target.value) })}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-slate-400">
                    <span>Forsvarskraft:</span>
                    <span className="font-bold text-cyan-300">{fighter2.defensePower}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    value={fighter2.defensePower}
                    onChange={(e) => setFighter2({ ...fighter2, defensePower: parseInt(e.target.value) })}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-slate-400">
                    <span>Kaos-Entropi:</span>
                    <span className="font-bold text-purple-300">{fighter2.entropyChaos.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="8.0"
                    step="0.1"
                    value={fighter2.entropyChaos}
                    onChange={(e) => setFighter2({ ...fighter2, entropyChaos: parseFloat(e.target.value) })}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-slate-400">
                    <span>Fart (Hastighet):</span>
                    <span className="font-bold text-amber-300">{fighter2.speed}</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="120"
                    value={fighter2.speed}
                    onChange={(e) => setFighter2({ ...fighter2, speed: parseInt(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ARENA MOMENTUM / DOMINATION TUG-OF-WAR BAR */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 shadow-lg font-mono">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <div className="flex items-center gap-1.5 font-bold text-rose-400">
            <span>🔴 {fighter1.name}</span>
            <span className="text-[10px] bg-rose-950 px-1.5 py-0.2 rounded border border-rose-800">
              {momentumF1}% dominans
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <TrendingUp className="w-3 h-3 text-amber-400" />
            <span>KAMP MOMENTUM & BANESTYRKE</span>
          </div>

          <div className="flex items-center gap-1.5 font-bold text-cyan-400">
            <span className="text-[10px] bg-cyan-950 px-1.5 py-0.2 rounded border border-cyan-800">
              {100 - momentumF1}% dominans
            </span>
            <span>🔵 {fighter2.name}</span>
          </div>
        </div>

        {/* Momentum Bar */}
        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex border border-slate-800 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-rose-600 via-amber-500 to-rose-500 rounded-l-full transition-all duration-500"
            style={{ width: `${momentumF1}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 rounded-r-full transition-all duration-500"
            style={{ width: `${100 - momentumF1}%` }}
          />
        </div>
      </div>

      {/* THE MAIN HOLOGRAPHIC CYBER ARENA STAGE */}
      <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-5 sm:p-7 shadow-2xl relative overflow-hidden backdrop-blur-md">
        {/* Holographic Radar Rings Backdrop */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
          <div className="w-[580px] h-[580px] rounded-full border border-cyan-500/20 animate-spin [animation-duration:45s]" />
          <div className="w-[420px] h-[420px] rounded-full border border-dashed border-amber-500/25 absolute animate-spin [animation-duration:30s] [animation-direction:reverse]" />
          <div className="w-[260px] h-[260px] rounded-full border border-rose-500/30 absolute" />
          <div className="w-[120px] h-[120px] rounded-full bg-cyan-500/5 absolute blur-xl" />
        </div>

        {/* Active Combat Scanline Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        {/* ENERGY BEAM ANIMATION EFFECT (Surges across when an attack lands) */}
        {lastActionAnimation && (
          <div
            className={`absolute top-1/2 -translate-y-1/2 h-4 z-25 pointer-events-none blur-sm transition-all duration-300 ${
              turn === 1
                ? 'left-[20%] right-[20%] bg-gradient-to-r from-rose-500 via-amber-300 to-rose-500 animate-pulse'
                : 'left-[20%] right-[20%] bg-gradient-to-r from-cyan-400 via-white to-blue-500 animate-pulse'
            }`}
          />
        )}

        {/* Floating Action Banner */}
        {lastActionAnimation && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-rose-500 text-slate-950 font-mono text-xs font-extrabold px-4 py-1.5 rounded-full shadow-lg animate-pulse uppercase tracking-wider flex items-center gap-1.5">
            {lastActionAnimation === 'CRITICAL' ? '🔥 KRITISK OVERCHARGE!' :
             lastActionAnimation === 'REFLECT' ? '🛡️ MIRROR JAMMING REFLEKSJON!' :
             lastActionAnimation === 'MUTATE' ? '🧬 POLYMORF METAMORFOSE!' : '💥 BUFFER-TREFF!'}
          </div>
        )}

        {/* GLADIATORS VS DUAL SECTOR STAGE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          {/* FIGHTER 1 CARD (RED SECTOR) */}
          <div
            className={`lg:col-span-5 p-5 rounded-2xl border transition-all relative overflow-hidden ${
              turn === 1 && battleState === 'FIGHTING'
                ? 'bg-rose-950/35 border-rose-500 shadow-xl shadow-rose-950/90 scale-[1.02]'
                : 'bg-slate-900/80 border-slate-800'
            }`}
          >
            {/* High Chaos Entropy Aura */}
            {fighter1.entropyChaos > 5.5 && (
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-purple-600/15 rounded-full blur-2xl pointer-events-none" />
            )}

            {/* Floating Damage Number */}
            {floatingDamage && floatingDamage.target === 'f1' && (
              <div className="absolute top-3 right-3 z-40 bg-rose-600 text-white font-mono font-extrabold text-xs px-2.5 py-1 rounded-full shadow-xl animate-bounce">
                {floatingDamage.text}
              </div>
            )}

            {/* Header info */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-4xl filter drop-shadow-md relative">
                  {fighter1.avatar}
                  {turn === 1 && battleState === 'FIGHTING' && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                    </span>
                  )}
                </span>
                <div>
                  <h2 className="font-mono font-bold text-base text-slate-100 flex items-center gap-1.5">
                    {fighter1.name}
                  </h2>
                  <p className="text-[11px] text-rose-300 font-mono">{fighter1.title}</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                Nivå {Math.round(fighter1.attackPower / 10)}
              </span>
            </div>

            {/* HP Bar */}
            <div className="space-y-1 my-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1">
                  Integritet / HP
                  <button
                    onClick={() => setActiveStatTooltip(activeStatTooltip === 'hp' ? null : 'hp')}
                    className="text-slate-500 hover:text-slate-300"
                    title="Hva betyr Integritet / HP?"
                  >
                    <HelpCircle className="w-3 h-3" />
                  </button>
                </span>
                <span className="font-bold text-slate-200">
                  {fighter1.hp} / {fighter1.maxHp}{' '}
                  <span className="text-[10px] text-slate-400">
                    ({Math.round((fighter1.hp / fighter1.maxHp) * 100)}%)
                  </span>
                </span>
              </div>
              <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    fighter1.hp / fighter1.maxHp > 0.5
                      ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                      : fighter1.hp / fighter1.maxHp > 0.2
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                      : 'bg-gradient-to-r from-rose-600 to-red-500 animate-pulse'
                  }`}
                  style={{ width: `${Math.max(0, (fighter1.hp / fighter1.maxHp) * 100)}%` }}
                />
              </div>
            </div>

            {/* Interactive Stats Badges with Help Tooltips */}
            <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[10px] my-3">
              <div
                onClick={() => setActiveStatTooltip(activeStatTooltip === 'kraft' ? null : 'kraft')}
                className="p-1.5 rounded bg-slate-950 border border-slate-800 hover:border-rose-500/50 cursor-pointer transition-colors"
                title="Klikk for forklaring av Kraft"
              >
                <div className="text-slate-400 flex items-center justify-center gap-0.5">
                  <span>Kraft</span>
                  <Info className="w-2.5 h-2.5 text-slate-500" />
                </div>
                <div className="text-rose-400 font-bold">{fighter1.attackPower}</div>
              </div>

              <div
                onClick={() => setActiveStatTooltip(activeStatTooltip === 'forsvar' ? null : 'forsvar')}
                className="p-1.5 rounded bg-slate-950 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-colors"
                title="Klikk for forklaring av Forsvar"
              >
                <div className="text-slate-400 flex items-center justify-center gap-0.5">
                  <span>Forsvar</span>
                  <Info className="w-2.5 h-2.5 text-slate-500" />
                </div>
                <div className="text-cyan-400 font-bold">{fighter1.defensePower}</div>
              </div>

              <div
                onClick={() => setActiveStatTooltip(activeStatTooltip === 'entropi' ? null : 'entropi')}
                className="p-1.5 rounded bg-slate-950 border border-slate-800 hover:border-purple-500/50 cursor-pointer transition-colors"
                title="Klikk for forklaring av Kaos-Entropi"
              >
                <div className="text-slate-400 flex items-center justify-center gap-0.5">
                  <span>Entropi</span>
                  <Info className="w-2.5 h-2.5 text-slate-500" />
                </div>
                <div className="text-purple-400 font-bold">{fighter1.entropyChaos.toFixed(2)}</div>
              </div>

              <div
                onClick={() => setActiveStatTooltip(activeStatTooltip === 'fart' ? null : 'fart')}
                className="p-1.5 rounded bg-slate-950 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-colors"
                title="Klikk for forklaring av Fart / Initiativ"
              >
                <div className="text-slate-400 flex items-center justify-center gap-0.5">
                  <span>Fart</span>
                  <Info className="w-2.5 h-2.5 text-slate-500" />
                </div>
                <div className="text-amber-400 font-bold">{fighter1.speed}</div>
              </div>
            </div>

            {/* In-Card Tooltip Popover if active */}
            {activeStatTooltip && (
              <div className="my-2 p-2.5 rounded-lg bg-slate-950 border border-cyan-800 text-[11px] font-mono text-slate-300 relative shadow-xl">
                <button
                  onClick={() => setActiveStatTooltip(null)}
                  className="absolute top-1.5 right-1.5 text-slate-500 hover:text-slate-200"
                >
                  <X className="w-3 h-3" />
                </button>
                {activeStatTooltip === 'kraft' && (
                  <div>
                    <span className="font-bold text-rose-400">⚔️ KRAFT (Angrepsstyrke):</span>
                    <p className="text-slate-400 mt-0.5">
                      Avgjør basisskaden for alle handlinger. Høy kraft gir massive angrep som kan overbelaste svake brannmurer.
                    </p>
                  </div>
                )}
                {activeStatTooltip === 'forsvar' && (
                  <div>
                    <span className="font-bold text-cyan-400">🛡️ FORSVAR (Panser & Brannmur):</span>
                    <p className="text-slate-400 mt-0.5">
                      Reduserer innkommende skade proporsjonalt: <code className="text-cyan-300">Skadereduksjon = (Forsvar / 100) × 40%</code>.
                    </p>
                  </div>
                )}
                {activeStatTooltip === 'entropi' && (
                  <div>
                    <span className="font-bold text-purple-400">🌀 KAOS-ENTROPI (Shannon Bits):</span>
                    <p className="text-slate-400 mt-0.5">
                      Måler uforutsigbarhet (1.00 til 8.00). Verdier over 5.2 gir <span className="text-purple-300 font-bold">+25% skadeøkning</span>, men trigger strenge Zero-Day heuristikker!
                    </p>
                  </div>
                )}
                {activeStatTooltip === 'fart' && (
                  <div>
                    <span className="font-bold text-amber-400">⚡ FART (Latens & Initiativ):</span>
                    <p className="text-slate-400 mt-0.5">
                      Den raskeste noden slår først per runde. Høy fart gir også økt sjanse for Kritiske Treff (+50% skade).
                    </p>
                  </div>
                )}
                {activeStatTooltip === 'hp' && (
                  <div>
                    <span className="font-bold text-emerald-400">💚 INTEGRITET / HP:</span>
                    <p className="text-slate-400 mt-0.5">
                      Kjernesystemets gjenværende helse. Når HP treffer 0, er noden kompromittert eller nøytralisert.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Move Selector (Fighter 1's turn) */}
            {battleState === 'FIGHTING' && turn === 1 && !isAutoBattle && (
              <div className="mt-3 pt-3 border-t border-slate-800">
                <span className="text-[11px] font-mono text-rose-300 font-semibold block mb-2 flex items-center justify-between">
                  <span>👉 Velg handling for {fighter1.name}:</span>
                  <span className="text-[10px] text-slate-400 font-normal">Klikk for å avfyre</span>
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {fighter1.moves.map((m, idx) => (
                    <button
                      key={m.id}
                      onClick={() => executeTurnAction(idx)}
                      className="p-2 rounded bg-rose-950/70 hover:bg-rose-900 border border-rose-700 text-left font-mono text-xs transition-colors cursor-pointer group"
                    >
                      <div className="font-bold text-rose-200 truncate group-hover:text-white flex items-center justify-between">
                        <span>{m.name}</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-slate-900 text-rose-400 border border-rose-800">
                          {m.type}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-300 mt-0.5 truncate">
                        {m.type === 'ULTIMATE' ? '⚡ Signatur (Maks skade)' : `${m.power} basisskade`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CENTER ARENA CONTROLS & VS LOGO */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center space-y-3 relative z-20">
            {/* Animated VS Badge */}
            <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-amber-500/60 flex items-center justify-center shadow-lg shadow-amber-950/50 relative group">
              <span className="font-mono font-extrabold text-lg text-amber-400 group-hover:scale-110 transition-transform">
                VS
              </span>
              <div className="absolute inset-0 rounded-full border border-amber-400/30 animate-ping pointer-events-none" />
            </div>

            {/* Round status banner */}
            <div className="text-center font-mono">
              <div className="text-[10px] text-slate-400 uppercase tracking-widest">
                {battleState === 'FIGHTING' ? `RUNDE ${currentRound}` : 'ARENA KLAR'}
              </div>
              <div className="text-xs font-bold text-amber-400 mt-0.5">
                {battleState === 'FIGHTING'
                  ? turn === 1
                    ? '🔴 Kriger 1 Angriper'
                    : '🔵 Kriger 2 Angriper'
                  : battleState === 'FINISHED'
                  ? '🏆 KAMP FULLFØRT'
                  : 'Venter på Start'}
              </div>
            </div>

            {/* Battle Flow Buttons */}
            {battleState === 'IDLE' || battleState === 'FINISHED' ? (
              <button
                onClick={handleStartBattle}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-cyan-500 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider shadow-xl hover:opacity-95 transition-all transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Cyber-Kamp</span>
              </button>
            ) : (
              <div className="w-full space-y-2">
                <button
                  onClick={() => setIsAutoBattle(!isAutoBattle)}
                  className={`w-full py-2 px-3 rounded-lg font-mono text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    isAutoBattle
                      ? 'bg-amber-950 border-amber-500 text-amber-300 animate-pulse'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {isAutoBattle ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isAutoBattle ? 'Stopp Auto-Kamp' : 'Autonom Kamp'}</span>
                </button>

                <button
                  onClick={handleStartBattle}
                  className="w-full py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 font-mono text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Omstart
                </button>

                {/* Speed Selector */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 bg-slate-900 p-1.5 rounded border border-slate-800">
                  <span>Fart:</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setAutoSpeedMs(1500)}
                      className={`px-1.5 py-0.5 rounded ${
                        autoSpeedMs === 1500 ? 'bg-cyan-900 text-cyan-300 font-bold' : 'hover:bg-slate-800'
                      }`}
                    >
                      1x
                    </button>
                    <button
                      onClick={() => setAutoSpeedMs(800)}
                      className={`px-1.5 py-0.5 rounded ${
                        autoSpeedMs === 800 ? 'bg-cyan-900 text-cyan-300 font-bold' : 'hover:bg-slate-800'
                      }`}
                    >
                      2x
                    </button>
                    <button
                      onClick={() => setAutoSpeedMs(300)}
                      className={`px-1.5 py-0.5 rounded ${
                        autoSpeedMs === 300 ? 'bg-cyan-900 text-cyan-300 font-bold' : 'hover:bg-slate-800'
                      }`}
                    >
                      Lyn
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FIGHTER 2 CARD (BLUE SECTOR) */}
          <div
            className={`lg:col-span-5 p-5 rounded-2xl border transition-all relative overflow-hidden ${
              turn === 2 && battleState === 'FIGHTING'
                ? 'bg-cyan-950/35 border-cyan-500 shadow-xl shadow-cyan-950/90 scale-[1.02]'
                : 'bg-slate-900/80 border-slate-800'
            }`}
          >
            {/* Defensive Kinetic Shield Dome Aura */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-600/15 rounded-full blur-2xl pointer-events-none" />

            {/* Floating Damage Number */}
            {floatingDamage && floatingDamage.target === 'f2' && (
              <div className="absolute top-3 left-3 z-40 bg-cyan-600 text-white font-mono font-extrabold text-xs px-2.5 py-1 rounded-full shadow-xl animate-bounce">
                {floatingDamage.text}
              </div>
            )}

            {/* Header info */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-4xl filter drop-shadow-md relative">
                  {fighter2.avatar}
                  {turn === 2 && battleState === 'FIGHTING' && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                    </span>
                  )}
                </span>
                <div>
                  <h2 className="font-mono font-bold text-base text-slate-100 flex items-center gap-1.5">
                    {fighter2.name}
                  </h2>
                  <p className="text-[11px] text-cyan-300 font-mono">{fighter2.title}</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                Nivå {Math.round(fighter2.attackPower / 10)}
              </span>
            </div>

            {/* HP Bar */}
            <div className="space-y-1 my-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1">
                  Integritet / HP
                  <button
                    onClick={() => setActiveStatTooltip(activeStatTooltip === 'hp' ? null : 'hp')}
                    className="text-slate-500 hover:text-slate-300"
                    title="Hva betyr Integritet / HP?"
                  >
                    <HelpCircle className="w-3 h-3" />
                  </button>
                </span>
                <span className="font-bold text-slate-200">
                  {fighter2.hp} / {fighter2.maxHp}{' '}
                  <span className="text-[10px] text-slate-400">
                    ({Math.round((fighter2.hp / fighter2.maxHp) * 100)}%)
                  </span>
                </span>
              </div>
              <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    fighter2.hp / fighter2.maxHp > 0.5
                      ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                      : fighter2.hp / fighter2.maxHp > 0.2
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                      : 'bg-gradient-to-r from-rose-600 to-red-500 animate-pulse'
                  }`}
                  style={{ width: `${Math.max(0, (fighter2.hp / fighter2.maxHp) * 100)}%` }}
                />
              </div>
            </div>

            {/* Interactive Stats Badges with Help Tooltips */}
            <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[10px] my-3">
              <div
                onClick={() => setActiveStatTooltip(activeStatTooltip === 'kraft' ? null : 'kraft')}
                className="p-1.5 rounded bg-slate-950 border border-slate-800 hover:border-rose-500/50 cursor-pointer transition-colors"
                title="Klikk for forklaring av Kraft"
              >
                <div className="text-slate-400 flex items-center justify-center gap-0.5">
                  <span>Kraft</span>
                  <Info className="w-2.5 h-2.5 text-slate-500" />
                </div>
                <div className="text-rose-400 font-bold">{fighter2.attackPower}</div>
              </div>

              <div
                onClick={() => setActiveStatTooltip(activeStatTooltip === 'forsvar' ? null : 'forsvar')}
                className="p-1.5 rounded bg-slate-950 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-colors"
                title="Klikk for forklaring av Forsvar"
              >
                <div className="text-slate-400 flex items-center justify-center gap-0.5">
                  <span>Forsvar</span>
                  <Info className="w-2.5 h-2.5 text-slate-500" />
                </div>
                <div className="text-cyan-400 font-bold">{fighter2.defensePower}</div>
              </div>

              <div
                onClick={() => setActiveStatTooltip(activeStatTooltip === 'entropi' ? null : 'entropi')}
                className="p-1.5 rounded bg-slate-950 border border-slate-800 hover:border-purple-500/50 cursor-pointer transition-colors"
                title="Klikk for forklaring av Kaos-Entropi"
              >
                <div className="text-slate-400 flex items-center justify-center gap-0.5">
                  <span>Entropi</span>
                  <Info className="w-2.5 h-2.5 text-slate-500" />
                </div>
                <div className="text-purple-400 font-bold">{fighter2.entropyChaos.toFixed(2)}</div>
              </div>

              <div
                onClick={() => setActiveStatTooltip(activeStatTooltip === 'fart' ? null : 'fart')}
                className="p-1.5 rounded bg-slate-950 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-colors"
                title="Klikk for forklaring av Fart / Initiativ"
              >
                <div className="text-slate-400 flex items-center justify-center gap-0.5">
                  <span>Fart</span>
                  <Info className="w-2.5 h-2.5 text-slate-500" />
                </div>
                <div className="text-amber-400 font-bold">{fighter2.speed}</div>
              </div>
            </div>

            {/* Move Selector (Fighter 2's turn) */}
            {battleState === 'FIGHTING' && turn === 2 && !isAutoBattle && (
              <div className="mt-3 pt-3 border-t border-slate-800">
                <span className="text-[11px] font-mono text-cyan-300 font-semibold block mb-2 flex items-center justify-between">
                  <span>👉 Velg handling for {fighter2.name}:</span>
                  <span className="text-[10px] text-slate-400 font-normal">Klikk for å avfyre</span>
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {fighter2.moves.map((m, idx) => (
                    <button
                      key={m.id}
                      onClick={() => executeTurnAction(idx)}
                      className="p-2 rounded bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-700 text-left font-mono text-xs transition-colors cursor-pointer group"
                    >
                      <div className="font-bold text-cyan-200 truncate group-hover:text-white flex items-center justify-between">
                        <span>{m.name}</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-slate-900 text-cyan-400 border border-cyan-800">
                          {m.type}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-300 mt-0.5 truncate">
                        {m.type === 'ULTIMATE' ? '⚡ Signatur (Maks skade)' : `${m.power} basisskade`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* REAL-TIME CLASH TELEMETRY & FORMULA BREAKDOWN BOX */}
        {latestLog && latestLog.actorName !== 'CYBER ARENA' && (
          <div className="mt-6 p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300 font-bold uppercase flex items-center gap-1.5">
                <Crosshair className="w-4 h-4 text-amber-400" />
                Siste Sammenstøt: Hva hendte i beregningen?
              </span>
              <span className="text-[10px] text-slate-500">Runde {latestLog.round} Telemetri</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
              <div>
                <span className="text-[10px] text-slate-400 block">Handling & Aktør</span>
                <strong className="text-slate-200 text-[11px] truncate block">{latestLog.actorName}</strong>
                <span className="text-[10px] text-amber-400">[{latestLog.actionName}]</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Skade Påført</span>
                <strong className="text-rose-400 text-sm">-{latestLog.damage} HP</strong>
                {latestLog.critical && <span className="text-[10px] text-amber-400 block">🔥 KRITISK TREFF!</span>}
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Mottiltak & Refleksjon</span>
                {latestLog.damageReflected && latestLog.damageReflected > 0 ? (
                  <strong className="text-cyan-300 text-[11px] block">
                    🛡️ {latestLog.damageReflected} HP reflektert!
                  </strong>
                ) : (
                  <span className="text-slate-500 text-[11px]">Ingen skade reflektert</span>
                )}
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Status i Sanntid</span>
                <span className="text-[11px] text-slate-300 leading-tight block">
                  {latestLog.message.split('!').slice(0, 2).join('!')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE GOD MODE DEFENSE SHIELDS HUD */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Aktive Forsvarslag (Gudemodus):
            </span>
            <HackerIntelTooltip intelId="mirror_jamming">
              <span
                className={`px-2 py-0.5 rounded border text-[10px] cursor-help ${
                  config.mirrorJammingEnabled
                    ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700'
                    : 'bg-slate-900 text-slate-500 border-slate-800 line-through'
                }`}
              >
                Mirror Jamming (Nivå {config.mirrorJammingIntensity})
              </span>
            </HackerIntelTooltip>
            <HackerIntelTooltip intelId="ebpf_xdp_wall">
              <span
                className={`px-2 py-0.5 rounded border text-[10px] cursor-help ${
                  config.ddosMitigationEnabled
                    ? 'bg-blue-950/80 text-blue-300 border-blue-700'
                    : 'bg-rose-950/80 text-rose-300 border-rose-700 animate-pulse'
                }`}
              >
                {config.ddosMitigationEnabled ? 'Anycast BGP Scrubbing' : 'DDoS DEAKTIVERT'}
              </span>
            </HackerIntelTooltip>
            <HackerIntelTooltip intelId="kyber_quantum">
              <span
                className={`px-2 py-0.5 rounded border text-[10px] cursor-help ${
                  config.quantumKyberEnvelope
                    ? 'bg-purple-950/80 text-purple-300 border-purple-700'
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
              >
                Kyber-1024 Barriere
              </span>
            </HackerIntelTooltip>
            <HackerIntelTooltip intelId="shannon_entropy">
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 cursor-help">
                Entropi-grense: {config.entropyThreshold.toFixed(2)} bits
              </span>
            </HackerIntelTooltip>
          </div>

          <button
            onClick={() => {
              setCodexTab('defenses');
              setShowCodex(true);
            }}
            className="text-cyan-400 hover:text-cyan-300 underline text-[11px] cursor-pointer"
          >
            Hva gjør disse forsvarslagene? →
          </button>
        </div>

        {/* LIVE COMBAT LOG COMMENTARY */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" /> Sanntids Kampkommentarer & Forensisk Logg
            </span>
            {latestReport && (
              <button
                onClick={onOpenReportModal}
                className="text-xs font-mono text-amber-400 hover:text-amber-300 underline flex items-center gap-1 cursor-pointer"
              >
                <Award className="w-3.5 h-3.5" /> Se Seiersrapport & YARA-Regel →
              </button>
            )}
          </div>

          <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 h-44 overflow-y-auto font-mono text-xs space-y-1.5 shadow-inner">
            {battleLogs.map((log) => (
              <div key={log.id} className="leading-relaxed flex items-start gap-2">
                <span className="text-slate-400 text-[10px] shrink-0">{log.timestamp}</span>
                <span className="text-slate-200">{log.message}</span>
              </div>
            ))}
            <div ref={battleLogEndRef} />
          </div>
        </div>
      </div>

      {/* COMPREHENSIVE TACTICAL CODEX & HELP MODAL */}
      {showCodex && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-mono">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-700 text-cyan-400">
                  <HelpCircle className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">
                    Taktisk Arena-Håndbok & Kodeks
                  </h3>
                  <p className="text-xs text-slate-400">
                    Full forklaring av egenskaper, handlingstyper, forsvarslag og matematiske formler.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCodex(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 p-2 bg-slate-950 border-b border-slate-800 text-xs overflow-x-auto">
              <button
                onClick={() => setCodexTab('stats')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  codexTab === 'stats'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                1. Egenskaper (Stats)
              </button>
              <button
                onClick={() => setCodexTab('moves')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  codexTab === 'moves'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2. Angrep & Forsvar (Moves)
              </button>
              <button
                onClick={() => setCodexTab('defenses')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  codexTab === 'defenses'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                3. Gudemodus Forsvarslag
              </button>
              <button
                onClick={() => setCodexTab('formula')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  codexTab === 'formula'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                4. Skadeformel & Logikk
              </button>
              <button
                onClick={() => setCodexTab('matchups')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  codexTab === 'matchups'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                5. Taktiske Råd & Matchups
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-300">
              {/* TAB 1: STATS */}
              {codexTab === 'stats' && (
                <div className="space-y-4">
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <h4 className="font-bold text-rose-400 text-sm flex items-center gap-1.5 mb-1">
                      <Swords className="w-4 h-4" /> Kraft (Attack Power, 1–150)
                    </h4>
                    <p>
                      Måler angrepsstyrken til noden. Hvert angrep multipliserer trekkets basisskade med angriperens kraft. Høy kraft er avgjørende for å bryte gjennom tunge brannmurer som Anycast Citadel eller WPWW Paladin.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <h4 className="font-bold text-cyan-400 text-sm flex items-center gap-1.5 mb-1">
                      <Shield className="w-4 h-4" /> Forsvar (Defense Power, 1–120)
                    </h4>
                    <p>
                      Representerer pakkefiltrering, brannmurtetthet og kjerneisolasjon. Forsvar reduserer all innkommende skade direkte:
                      <code className="block mt-1 text-cyan-300 bg-slate-900 p-1.5 rounded border border-slate-800">
                        Skadereduksjon = (Forsvarspoeng / 100) × 40% (Maks 48% basisabsorpsjon)
                      </code>
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <h4 className="font-bold text-purple-400 text-sm flex items-center gap-1.5 mb-1">
                      <Dna className="w-4 h-4" /> Kaos-Entropi (Shannon Entropy, 1.00–8.00 bits)
                    </h4>
                    <p>
                      Shannon-entropi måler uforutsigbarhet og krypteringstetthet i datastrømmen:
                    </p>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-slate-400">
                      <li>
                        <strong className="text-purple-300">&gt; 5.20 bits:</strong> Gir +25% skadebonus på grunn av uforutsigbar obfuskering, men trigger også Zero-Day heuristiske alarmer!
                      </li>
                      <li>
                        <strong className="text-emerald-300">&lt; 2.00 bits:</strong> Trygg, forutsigbar trafikk som typisk kjennetegner rensede systemer og AI-vakter.
                      </li>
                    </ul>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <h4 className="font-bold text-amber-400 text-sm flex items-center gap-1.5 mb-1">
                      <Zap className="w-4 h-4" /> Fart & Initiativ (Speed, 20–120)
                    </h4>
                    <p>
                      Avgjør hvilken node som tar det første trekket i kampen, samt sannsynligheten for Kritiske Treff:
                      <code className="block mt-1 text-amber-300 bg-slate-900 p-1.5 rounded border border-slate-800">
                        Kritisk sjanse = (Fart / 200) + (Entropi &gt; 6.0 ? 15% : 5%)
                      </code>
                      Kritiske treff påfører 1.5x basisskade!
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: MOVES */}
              {codexTab === 'moves' && (
                <div className="space-y-4">
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-bold text-[10px] border border-rose-800 uppercase">
                      ATTACK
                    </span>
                    <h4 className="font-bold text-slate-100 text-sm mt-1">Direkte Angrep & Infiltrasjon</h4>
                    <p className="text-slate-400 mt-0.5">
                      Standard angrep rettet mot åpne porter, HTTP-forespørsler eller SQL-grensesnitt. Skaden skaleres med angriperens kraft.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold text-[10px] border border-cyan-800 uppercase">
                      DEFENSE
                    </span>
                    <h4 className="font-bold text-slate-100 text-sm mt-1">Forsvar & Brannmurbeskyttelse</h4>
                    <p className="text-slate-400 mt-0.5">
                      Aktiverer rate-limiting, SYN-proxy eller lukker inaktive tilkoblinger. Dette minimerer motstanderens neste treff og kan trigge Mirror Jamming.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-bold text-[10px] border border-purple-800 uppercase">
                      MUTATION
                    </span>
                    <h4 className="font-bold text-slate-100 text-sm mt-1">Polymorf Metamorfose</h4>
                    <p className="text-slate-400 mt-0.5">
                      Endrer instruksjonsrekkefølgen og øker Kaos-Entropien (+0.40 bits per mutasjon). Gjør koden ugjenkjennelig for tradisjonelle signaturskannere.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-bold text-[10px] border border-amber-800 uppercase">
                      OVERCLOCK
                    </span>
                    <h4 className="font-bold text-slate-100 text-sm mt-1">Prosessorkjerne Akselerasjon</h4>
                    <p className="text-slate-400 mt-0.5">
                      Dedikerer flere CPU-arbeidstråder, scrambler minneheap eller gjenoppretter skadede systemsektorer.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span className="px-2 py-0.5 rounded bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 font-extrabold text-[10px] uppercase">
                      ULTIMATE
                    </span>
                    <h4 className="font-bold text-amber-300 text-sm mt-1">Signaturhandling (Maksimal Kraft)</h4>
                    <p className="text-slate-400 mt-0.5">
                      Gladiatorens mest dødelige angrep eller ugjennomtrengelige skjold (f.eks. 100 Gbps SYN-Flom, Global BGP Scrubbing, DoublePulsar Kernel Injection).
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: DEFENSES */}
              {codexTab === 'defenses' && (
                <div className="space-y-4">
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-cyan-900/40">
                    <h4 className="font-bold text-cyan-300 text-sm flex items-center gap-1.5 mb-1">
                      <Shield className="w-4 h-4" /> Mirror Jamming (Aktiv Speiling)
                    </h4>
                    <p>
                      Når en angriper prøver å trenge inn, reflekterer Mirror Jamming en prosentandel av skaden direkte tilbake til angriperen:
                      <code className="block mt-1 text-cyan-200 bg-slate-900 p-1.5 rounded border border-slate-800">
                        Reflektert Skade = Beregnet Skade × (Speilingsintensitet / 25)
                      </code>
                      Samtidig absorberes 25% av angrepet.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-blue-900/40">
                    <h4 className="font-bold text-blue-300 text-sm flex items-center gap-1.5 mb-1">
                      <Layers className="w-4 h-4" /> Anycast DDoS Scrubbing & SYN-Cookie
                    </h4>
                    <p>
                      Omdirigerer volumetrisk trafikk til globale renserier. Hvis slått på, reduseres DDoS-skade med opptil <strong>75%</strong>. Hvis slått AV, får angriperen en <strong>+85% skadeøkning</strong> fordi infrastrukturen oversvømmes!
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-purple-900/40">
                    <h4 className="font-bold text-purple-300 text-sm flex items-center gap-1.5 mb-1">
                      <Lock className="w-4 h-4" /> Kyber-1024 Post-Quantum Barriere
                    </h4>
                    <p>
                      Innkapsler all utgående og inngående trafikk i gitter-basert kvantesikker kryptering, som nøytraliserer matematiske dekrypteringsangrep.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <h4 className="font-bold text-emerald-300 text-sm flex items-center gap-1.5 mb-1">
                      <Cpu className="w-4 h-4" /> Memory Heap Scramble & Sandboks
                    </h4>
                    <p>
                      Gjør adresser i minnet uforutsigbare (ASLR på steroider), slik at buffer-overflows og shellcode ikke finner gyldige hopp-adresser.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 4: FORMULA */}
              {codexTab === 'formula' && (
                <div className="space-y-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono">
                    <h4 className="font-bold text-amber-400 text-sm mb-2">Den Fullstendige Kampskade-Formelen</h4>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2 text-[11px]">
                      <div>
                        <span className="text-slate-400">1. Basisskade = </span>
                        <span className="text-slate-200">Trekk-effekt (Move Power)</span>
                      </div>
                      <div>
                        <span className="text-slate-400">2. Kritisk Sjekk: </span>
                        <span className="text-amber-300">Hvis kritisk treff: Basisskade × 1.5</span>
                      </div>
                      <div>
                        <span className="text-slate-400">3. Entropi Multiplikator: </span>
                        <span className="text-purple-300">Hvis Entropi &gt; 5.2: × 1.25 (+25% kaos)</span>
                      </div>
                      <div>
                        <span className="text-slate-400">4. Forsvarsreduksjon: </span>
                        <span className="text-cyan-300">1 - ((Forsvarskraft / 100) × 0.4)</span>
                      </div>
                      <div>
                        <span className="text-slate-400">5. DDoS Filter: </span>
                        <span className="text-blue-300">
                          Hvis DDoS-angrep: × 0.35 (SYN-Cookie) × 0.5 (Scrubbing). Hvis AV: × 1.85!
                        </span>
                      </div>
                      <div className="pt-2 border-t border-slate-800 font-bold text-rose-400">
                        Netto Skade = Math.max(25, Beregnet Skade)
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: MATCHUPS */}
              {codexTab === 'matchups' && (
                <div className="space-y-3">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <h5 className="font-bold text-rose-400">Hvordan nøytralisere et Botnet (Mirai)?</h5>
                    <p className="text-slate-400 mt-1">
                      Sørg for at <strong className="text-blue-300">DDoS Mitigation</strong> og <strong className="text-blue-300">SYN-Cookie Proxy</strong> er påslått i Gudemodus-innstillingene. Anycast Scrubbing Citadel kutter skaden til et minimum.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <h5 className="font-bold text-purple-400">Hvordan stoppe Phantom Zero-Day?</h5>
                    <p className="text-slate-400 mt-1">
                      Zero-Day baserer seg på høy polymorf entropi (7.92 bits). Bruk <strong className="text-cyan-300">WPWW-Paladin</strong> eller <strong className="text-emerald-300">Neuro-Entropy AI</strong>, og sett entropi-terskelen lavt (f.eks. 5.20) for automatisk fellelegging.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <h5 className="font-bold text-amber-400">Hvordan knekke Stuxnet SCADA?</h5>
                    <p className="text-slate-400 mt-1">
                      Stuxnet manipulerer PLS-frekvenser. Bruk <strong className="text-cyan-300">Air-Gap Isolasjon</strong> og aktiver <strong className="text-rose-400">Mirror Jamming</strong> for å reflektere kompromitterte Modbus-pakker tilbake til kilden.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setShowCodex(false)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
              >
                Forstått, Lukk Håndbok
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CyberArenaVisualizer;
