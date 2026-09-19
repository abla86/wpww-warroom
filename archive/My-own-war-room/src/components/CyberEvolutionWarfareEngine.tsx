import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Swords,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Sparkles,
  Award,
  Terminal,
  Cpu,
  Layers,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Info,
  ExternalLink,
  Film,
  Crosshair,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Radio,
  RefreshCw,
  PlusCircle,
  Eye,
  Activity
} from 'lucide-react';
import { CyberRealScenario, CyberScenarioStep, ArmsRaceState, SystemStats } from '../types';
import { REAL_CYBER_SCENARIOS } from '../data/realCyberScenarios';

export interface CyberEvolutionWarfareEngineProps {
  stats: SystemStats;
  onUpdateStats?: React.Dispatch<React.SetStateAction<SystemStats>>;
  onTriggerAttackSample?: (payload: string, ip: string) => void;
  onSelectTab?: (tab: string) => void;
}

export const CyberEvolutionWarfareEngine: React.FC<CyberEvolutionWarfareEngineProps> = ({
  stats,
  onUpdateStats,
  onTriggerAttackSample,
  onSelectTab,
}) => {
  // Arms Race Core State
  const [armsRace, setArmsRace] = useState<ArmsRaceState>({
    attackPower: 100, // 10% to 200%
    defensePower: 100, // 10% to 200%
    dynamicEquilibrium: true,
    evolutionModeActive: true,
    redEvolutionLevel: 4,
    redXp: 350,
    blueEvolutionLevel: 4,
    blueXp: 380,
    totalBattles: 14,
    redWins: 7,
    blueWins: 7,
    stalemates: 0,
    activeRedMutations: [
      'Polymorf Shellcode Obfuskering',
      'AI-generert DGA Domene-Gjennomsøking',
      'Heap Spraying med ASLR Omgåelse'
    ],
    activeBlueMutations: [
      'eBPF Kjerne-Statisk Bytecode Verifikasjon',
      'Post-Quantum Kyber-1024 Nøkkelkapsling',
      'Zero Trust Maskinvare-Attestering (TPM 2.0)'
    ],
  });

  // Selected Scenario
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('stuxnet-natanz');
  const activeScenario: CyberRealScenario = useMemo(() => {
    return REAL_CYBER_SCENARIOS.find((s) => s.id === selectedScenarioId) || REAL_CYBER_SCENARIOS[0];
  }, [selectedScenarioId]);

  // Cinematic Film Player State
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlayingFilm, setIsPlayingFilm] = useState<boolean>(false);
  const [playbackSpeedMs, setPlaybackSpeedMs] = useState<number>(3500);
  const [showTheoreticalAnswer, setShowTheoreticalAnswer] = useState<boolean>(true);
  const [networkNodeCount, setNetworkNodeCount] = useState<number>(10);
  const [lastBattleOutcome, setLastBattleOutcome] = useState<{
    winner: 'red' | 'blue' | 'draw';
    margin: number;
    description: string;
    timestamp: string;
  } | null>(null);

  // Scalability custom attacker state
  const [customVectorInput, setCustomVectorInput] = useState<string>('');
  const [customVectorsList, setCustomVectorsList] = useState<string[]>([
    'BGP Hijacking & RPKI Forfalskning',
    'Hardware JTAG Glitch Angrep',
    'AI Deepfake Lyd-Autentiseringskapring'
  ]);

  // Auto-play timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate live odds for current scenario
  const odds = useMemo(() => {
    // Combine base difficulties with user's sliders
    const redEffective = (activeScenario.baseAttackDifficulty * 0.5) + (armsRace.attackPower * 0.5);
    const blueEffective = (activeScenario.baseDefenseDifficulty * 0.5) + (armsRace.defensePower * 0.5);

    const total = redEffective + blueEffective;
    const redPct = Math.round((redEffective / total) * 100);
    const bluePct = 100 - redPct;

    return { redPct, bluePct, redEffective, blueEffective };
  }, [activeScenario, armsRace.attackPower, armsRace.defensePower]);

  // Current Step
  const currentStep: CyberScenarioStep = activeScenario.steps[currentStepIndex] || activeScenario.steps[0];

  // Auto-play cinematic film loop
  useEffect(() => {
    if (isPlayingFilm) {
      timerRef.current = setTimeout(() => {
        if (currentStepIndex < activeScenario.steps.length - 1) {
          setCurrentStepIndex((prev) => prev + 1);
        } else {
          // Reached climax! Calculate outcome
          resolveBattleOutcome();
          setIsPlayingFilm(false);
        }
      }, playbackSpeedMs);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlayingFilm, currentStepIndex, activeScenario.steps.length, playbackSpeedMs]);

  // Reset step index when scenario changes
  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlayingFilm(false);
    setLastBattleOutcome(null);
  }, [selectedScenarioId]);

  // Resolve battle outcome and apply evolution
  const resolveBattleOutcome = () => {
    const diff = armsRace.attackPower - armsRace.defensePower;
    const threshold = 15;

    let winner: 'red' | 'blue' | 'draw' = 'draw';
    let outcomeText = '';

    if (diff > threshold) {
      winner = 'red';
      outcomeText = activeScenario.outcomeSummary.ifRedWins;
    } else if (diff < -threshold) {
      winner = 'blue';
      outcomeText = activeScenario.outcomeSummary.ifBlueWins;
    } else {
      winner = 'draw';
      outcomeText = activeScenario.outcomeSummary.ifEquilibrium;
    }

    const now = new Date().toLocaleTimeString('no-NO');

    setLastBattleOutcome({
      winner,
      margin: Math.abs(diff),
      description: outcomeText,
      timestamp: now,
    });

    // Evolution Engine: Evolve losing side, grant XP to winner
    setArmsRace((prev) => {
      let redXpGain = 25;
      let blueXpGain = 25;
      let newRedWins = prev.redWins;
      let newBlueWins = prev.blueWins;
      let newStalemates = prev.stalemates;

      let newAttackPower = prev.attackPower;
      let newDefensePower = prev.defensePower;

      if (winner === 'red') {
        redXpGain = 80;
        blueXpGain = 50; // Blue learns from breach!
        newRedWins += 1;
        // If dynamic equilibrium is enabled, boost Blue Team defense automatically
        if (prev.dynamicEquilibrium) {
          newDefensePower = Math.min(200, prev.defensePower + 10);
        }
      } else if (winner === 'blue') {
        blueXpGain = 80;
        redXpGain = 50; // Red mutates payload!
        newBlueWins += 1;
        // If dynamic equilibrium is enabled, boost Red Team attack power automatically
        if (prev.dynamicEquilibrium) {
          newAttackPower = Math.min(200, prev.attackPower + 10);
        }
      } else {
        newStalemates += 1;
        redXpGain = 50;
        blueXpGain = 50;
      }

      const updatedRedXp = prev.redXp + redXpGain;
      const updatedBlueXp = prev.blueXp + blueXpGain;

      const newRedLevel = Math.min(10, Math.floor(updatedRedXp / 200) + 1);
      const newBlueLevel = Math.min(10, Math.floor(updatedBlueXp / 200) + 1);

      return {
        ...prev,
        totalBattles: prev.totalBattles + 1,
        redWins: newRedWins,
        blueWins: newBlueWins,
        stalemates: newStalemates,
        redXp: updatedRedXp,
        blueXp: updatedBlueXp,
        redEvolutionLevel: newRedLevel,
        blueEvolutionLevel: newBlueLevel,
        attackPower: prev.dynamicEquilibrium ? newAttackPower : prev.attackPower,
        defensePower: prev.dynamicEquilibrium ? newDefensePower : prev.defensePower,
      };
    });
  };

  // Adjust sliders
  const handleAttackPowerChange = (val: number) => {
    setArmsRace((prev) => ({
      ...prev,
      attackPower: val,
      // If dynamic equilibrium is active and not manual override, adjust slightly
      defensePower: prev.dynamicEquilibrium ? Math.round((val + prev.defensePower) / 2) : prev.defensePower,
    }));
  };

  const handleDefensePowerChange = (val: number) => {
    setArmsRace((prev) => ({
      ...prev,
      defensePower: val,
      attackPower: prev.dynamicEquilibrium ? Math.round((val + prev.attackPower) / 2) : prev.attackPower,
    }));
  };

  // Preset calibrations
  const applyPreset = (preset: 'balanced' | 'godmode' | 'red_overpower' | 'blue_overpower') => {
    if (preset === 'balanced') {
      setArmsRace((prev) => ({ ...prev, attackPower: 100, defensePower: 100, dynamicEquilibrium: true }));
    } else if (preset === 'godmode') {
      setArmsRace((prev) => ({ ...prev, attackPower: 80, defensePower: 195, dynamicEquilibrium: false }));
    } else if (preset === 'red_overpower') {
      setArmsRace((prev) => ({ ...prev, attackPower: 185, defensePower: 65, dynamicEquilibrium: false }));
    } else if (preset === 'blue_overpower') {
      setArmsRace((prev) => ({ ...prev, attackPower: 60, defensePower: 175, dynamicEquilibrium: false }));
    }
  };

  // Add custom vector
  const handleAddCustomVector = () => {
    if (customVectorInput.trim()) {
      setCustomVectorsList((prev) => [customVectorInput.trim(), ...prev]);
      setCustomVectorInput('');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Core Philosophical & Scientific Cyber Truth Banner */}
      <div className="rounded-2xl border border-cyan-800/80 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-5 shadow-2xl overflow-hidden relative">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-gradient-to-br from-rose-600 via-amber-600 to-cyan-600 text-white shadow-lg">
              <Swords className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold font-mono text-white tracking-wide">
                  CYBER-VÅPENKAPPLØPET // DET EVIGE BALANSEFORHOLDET
                </h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700">
                  ARMS RACE & EVOLUTION MATRIX
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                Kan vi bryte oss inn i ethvert system? Kan vi stoppe alle angrep? Begge sider utvikler og muterer seg kontinuerlig.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTheoreticalAnswer(!showTheoreticalAnswer)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>{showTheoreticalAnswer ? 'Skjul Vitenskapelig Svar' : 'Les Vitenskapelig Svar'}</span>
              {showTheoreticalAnswer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Theoretical Answer Box */}
        {showTheoreticalAnswer && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-slate-300">
            <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-800/40 space-y-1.5">
              <div className="flex items-center gap-1.5 text-rose-300 font-bold">
                <Flame className="w-4 h-4 text-rose-400" />
                <span>1. Kan vi bryte oss inn i enhver data?</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                <strong>Ja og nei:</strong> I ethvert komplekst system som tillater inndata og kommunikasjon, finnes det teoretiske logiske eller fysiske sårbarheter (0-days, side-channel, sosial manipulering). Unntaket er en ekte <em>One-Time Pad (OTP)</em> og total fysisk separasjon (air-gap) uten mennesker til stede.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/40 space-y-1.5">
              <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>2. Kan vi stoppe alle angrep?</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                <strong>Kun med dynamisk tilpasning:</strong> Ingen statisk brannmur kan stoppe alle fremtidige angrep. Men med <em>eBPF WORM immutabilitet, Post-Quantum gitterkryptering og autonom sanntidsreaksjon</em>, kan systemet gjøre kostnaden for angriperen astronomisk høy og nøytralisere trusler før skade skjer.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>3. Våpenkappløpet & Balanse</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                <strong>Ingen vinner for alltid:</strong> Når forsvaret forbedres, muterer angriperne nye teknikker. Når et angrep lykkes, tetter forsvaret hullet og utvikler sterkere immunitet. Det er denne evolusjonen denne motoren simulerer i sanntid.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Dynamic Power Tuning Sliders & Equilibrium Engine */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
              STYRKE-KALIBRERING // SKRU OPP OG NED FORSVAR & ANGREP
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-slate-400">Hurtiginnstillinger:</span>
            <button
              onClick={() => applyPreset('balanced')}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-700 cursor-pointer"
            >
              ⚖️ Likevekt (50/50)
            </button>
            <button
              onClick={() => applyPreset('godmode')}
              className="px-2.5 py-1 rounded bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 text-[11px] font-mono border border-amber-700 cursor-pointer"
            >
              👑 Gudemodus (Forsvar 195%)
            </button>
            <button
              onClick={() => applyPreset('red_overpower')}
              className="px-2.5 py-1 rounded bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 text-[11px] font-mono border border-rose-700 cursor-pointer"
            >
              🔥 Red Team Dominans (185%)
            </button>
            <button
              onClick={() => applyPreset('blue_overpower')}
              className="px-2.5 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 text-[11px] font-mono border border-cyan-700 cursor-pointer"
            >
              🛡️ Blue Team Fort (175%)
            </button>
          </div>
        </div>

        {/* Dual Sliders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Red Team Attacker Slider */}
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-rose-600 text-white">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-mono font-bold text-rose-300">
                    RED TEAM ANGREPSKRAFT: {armsRace.attackPower}%
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Nivå {armsRace.redEvolutionLevel} • XP: {armsRace.redXp} • Seiere: {armsRace.redWins}
                  </p>
                </div>
              </div>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                armsRace.attackPower > 140 ? 'bg-rose-900 text-white animate-pulse' : 'bg-rose-950 text-rose-400 border border-rose-800'
              }`}>
                {armsRace.attackPower >= 150 ? 'STATLIG APT / SUPER-KI' : armsRace.attackPower >= 90 ? 'AVANSERT SYNDIKAT' : 'SKRIPTKIDDIE'}
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="200"
              value={armsRace.attackPower}
              onChange={(e) => handleAttackPowerChange(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />

            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>10% (Svakt)</span>
              <span>100% (Standard)</span>
              <span>200% (Uoppholdelig KI)</span>
            </div>

            {/* Active Red Mutations */}
            <div className="pt-2 border-t border-rose-900/40">
              <span className="text-[10px] font-mono text-rose-400 font-bold block mb-1.5">
                Muterte Angrepsvektorer (Aktivt Arsenal):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {armsRace.activeRedMutations.map((m, idx) => (
                  <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/80 border border-rose-700/60 text-rose-200">
                    ⚡ {m}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Blue Team Defender Slider */}
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-cyan-600 text-white">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-mono font-bold text-cyan-300">
                    BLUE TEAM FORSVARSSTYRKE: {armsRace.defensePower}%
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Nivå {armsRace.blueEvolutionLevel} • XP: {armsRace.blueXp} • Seiere: {armsRace.blueWins}
                  </p>
                </div>
              </div>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                armsRace.defensePower > 140 ? 'bg-cyan-900 text-white animate-pulse' : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
              }`}>
                {armsRace.defensePower >= 150 ? 'GUDEMODUS / KVANTE-SANDBOKS' : armsRace.defensePower >= 90 ? 'ZERO TRUST SOC' : 'ENKEL BRANNMUR'}
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="200"
              value={armsRace.defensePower}
              onChange={(e) => handleDefensePowerChange(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />

            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>10% (Åpen)</span>
              <span>100% (Standard)</span>
              <span>200% (Ugjennomtrengelig)</span>
            </div>

            {/* Active Blue Mutations */}
            <div className="pt-2 border-t border-cyan-900/40">
              <span className="text-[10px] font-mono text-cyan-400 font-bold block mb-1.5">
                Muterte Forsvarslag (Aktive Skjold):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {armsRace.activeBlueMutations.map((m, idx) => (
                  <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-700/60 text-cyan-200">
                    🛡️ {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Equilibrium & Scalability Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setArmsRace((prev) => ({ ...prev, dynamicEquilibrium: !prev.dynamicEquilibrium }))}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                armsRace.dynamicEquilibrium
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>DYNAMISK LIKEVEKT: <strong>{armsRace.dynamicEquilibrium ? 'PÅ (INGEN VINNER ALLTID)' : 'AV (MANUELL)'}</strong></span>
            </button>

            <span className="text-xs font-mono text-slate-400 hidden sm:inline">
              Total kamper simulert: <strong className="text-white">{armsRace.totalBattles}</strong>
            </span>
          </div>

          {/* Scalability Node Scale */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Skalerbarhet (Nettverksnoder):</span>
            {[1, 10, 50, 100].map((n) => (
              <button
                key={n}
                onClick={() => setNetworkNodeCount(n)}
                className={`px-2 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                  networkNodeCount === n
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {n} {n === 1 ? 'Node' : 'Noder'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Scenario Selector Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>📚</span> VELG ET AUTENTISK SCENARIO (HISTORISK & FREMTIDIG CYBERKRIG)
          </h2>
          <span className="text-xs font-mono text-slate-400">
            {REAL_CYBER_SCENARIOS.length} Ekte Scenarioer tilgjengelig
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {REAL_CYBER_SCENARIOS.map((sc) => {
            const isSelected = sc.id === selectedScenarioId;
            return (
              <button
                key={sc.id}
                onClick={() => setSelectedScenarioId(sc.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500 ring-1 ring-cyan-500 shadow-lg shadow-cyan-950/60'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                      {sc.year} • {sc.category}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {sc.steps.length} trinn
                    </span>
                  </div>
                  <h3 className="text-xs font-mono font-bold text-white leading-tight">
                    {sc.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {sc.subtitle}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Mål: {sc.targetSystem.slice(0, 24)}...</span>
                  <span className={`font-bold ${isSelected ? 'text-cyan-300' : 'text-slate-400'}`}>
                    {isSelected ? 'Valgt Nå ✓' : 'Velg →'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Cinematic Scenario Film Player & Interactive Battle Stage */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Scenario Header Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-1 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 text-xs font-mono">
                🎬 KINEMATISK FILM & SCENARIO-SPILLER
              </span>
              <h2 className="text-base font-mono font-bold text-white">
                {activeScenario.title}
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              {activeScenario.targetSystem} • Angriper: {activeScenario.attackerProfile}
            </p>
          </div>

          {/* Player Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                if (currentStepIndex > 0) setCurrentStepIndex(currentStepIndex - 1);
              }}
              disabled={currentStepIndex === 0}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700 disabled:opacity-40 cursor-pointer"
            >
              ◀ Forrige
            </button>

            <button
              onClick={() => setIsPlayingFilm(!isPlayingFilm)}
              className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                isPlayingFilm
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white'
              }`}
            >
              {isPlayingFilm ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlayingFilm ? 'Pause Film' : 'Spill Kinematisk Film 🎬'}</span>
            </button>

            <button
              onClick={() => {
                if (currentStepIndex < activeScenario.steps.length - 1) {
                  setCurrentStepIndex(currentStepIndex + 1);
                } else {
                  resolveBattleOutcome();
                }
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700 cursor-pointer"
            >
              Neste ▶
            </button>

            <button
              onClick={() => {
                setCurrentStepIndex(0);
                setIsPlayingFilm(false);
                setLastBattleOutcome(null);
              }}
              title="Start scenarioet på nytt"
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Clash Balance Bar */}
        <div className="bg-slate-900/60 px-5 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-rose-400 font-bold">Red Odds: {odds.redPct}%</span>
            <div className="w-32 sm:w-48 h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
              <div
                className="bg-gradient-to-r from-rose-500 to-amber-500 h-full transition-all duration-300"
                style={{ width: `${odds.redPct}%` }}
              />
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300"
                style={{ width: `${odds.bluePct}%` }}
              />
            </div>
            <span className="text-cyan-300 font-bold">Blue Odds: {odds.bluePct}%</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Trinn: <strong>{currentStepIndex + 1} av {activeScenario.steps.length}</strong></span>
            <span>Hastighet:</span>
            <select
              value={playbackSpeedMs}
              onChange={(e) => setPlaybackSpeedMs(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-slate-200 text-xs cursor-pointer"
            >
              <option value={5000}>Rolig (5s)</option>
              <option value={3500}>Normal (3.5s)</option>
              <option value={2000}>Rask (2s)</option>
            </select>
          </div>
        </div>

        {/* Cinematic Step Viewer */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Step Timeline Indicator */}
          <div className="grid grid-cols-5 gap-2">
            {activeScenario.steps.map((step, idx) => {
              const isDone = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentStepIndex(idx);
                    setIsPlayingFilm(false);
                  }}
                  className={`p-2 rounded-lg text-left transition-all cursor-pointer border ${
                    isCurrent
                      ? 'bg-slate-900 border-cyan-400 ring-1 ring-cyan-400 text-white'
                      : isDone
                      ? 'bg-slate-950 border-slate-700 text-slate-300'
                      : 'bg-slate-950/40 border-slate-800/60 text-slate-600'
                  }`}
                >
                  <span className="text-[10px] font-mono block text-slate-400">
                    Trinn {idx + 1}
                  </span>
                  <span className="text-xs font-mono font-bold truncate block">
                    {step.phaseName}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Step Content Stage */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase ${
                  currentStep.actor === 'red'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : currentStep.actor === 'blue'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  Aktør: {currentStep.actor.toUpperCase()}
                </span>
                <h3 className="text-sm sm:text-base font-mono font-bold text-white">
                  {currentStep.title}
                </h3>
              </div>

              {currentStep.mitreTechnique && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-amber-300">
                  MITRE: {currentStep.mitreTechnique}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {currentStep.description}
            </p>

            {/* Terminal Log Console */}
            <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 font-mono text-xs overflow-x-auto space-y-1 text-slate-200">
              <div className="flex items-center justify-between text-slate-500 border-b border-slate-800/60 pb-1.5 mb-1.5 text-[10px]">
                <span>TERMINAL TELEMETRI & KJERNE-LOGG</span>
                <span>EFFEKT: {currentStep.visualEffect.toUpperCase()}</span>
              </div>
              <div className="text-cyan-400">
                {currentStep.terminalLog}
              </div>
              {currentStep.cveRef && (
                <div className="text-rose-400 text-[11px] pt-1">
                  [CVE REFERANSE] {currentStep.cveRef}
                </div>
              )}
            </div>
          </div>

          {/* Battle Outcome Box (Shows when completed) */}
          {lastBattleOutcome && (
            <div className={`p-4 rounded-xl border space-y-2 transition-all ${
              lastBattleOutcome.winner === 'blue'
                ? 'bg-cyan-950/40 border-cyan-600 text-cyan-100'
                : lastBattleOutcome.winner === 'red'
                ? 'bg-rose-950/40 border-rose-600 text-rose-100'
                : 'bg-amber-950/40 border-amber-600 text-amber-100'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono font-bold text-sm">
                  {lastBattleOutcome.winner === 'blue' ? '🛡️ BLUE TEAM FORSVAR SEIRET' : lastBattleOutcome.winner === 'red' ? '🔥 RED TEAM INNBRUDD LYKTES' : '⚖️ UAVGJORT / KAMP I DYBDEN (STANDOFF)'}
                </div>
                <span className="text-xs font-mono opacity-75">{lastBattleOutcome.timestamp}</span>
              </div>
              <p className="text-xs font-sans leading-relaxed opacity-90">
                {lastBattleOutcome.description}
              </p>
              <div className="text-[11px] font-mono pt-1 text-slate-300">
                Evolusjon: Begge parter mottok erfaring (+XP). {armsRace.dynamicEquilibrium ? 'Dynamisk likevekt justerte automatisk balansen for neste trefning.' : 'Manuelle spaker forblir uendret.'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Scalability Hub & Custom Attacker/Defender Extension */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Custom Attack Vectors Hub */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 shadow-lg">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-rose-400" />
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              SKALERBARHET: LEGG TIL EGET SPESIALANGREP
            </h3>
          </div>
          <p className="text-[11px] text-slate-400">
            Systemet kan utvides i det uendelige. Skriv inn nye angrepsmetoder eller zero-days for å teste forsvaret.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={customVectorInput}
              onChange={(e) => setCustomVectorInput(e.target.value)}
              placeholder="F.eks. Rowhammer DRAM Bitflip eller Supply-Chain DLL..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-white placeholder:text-slate-500"
            />
            <button
              onClick={handleAddCustomVector}
              className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 text-white text-xs font-mono font-bold cursor-pointer transition-colors"
            >
              Legg Til
            </button>
          </div>

          <div className="space-y-1.5 pt-2">
            <span className="text-[10px] font-mono text-slate-400 block">
              Egendefinert & Utvidet Vektorliste:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {customVectorsList.map((v, idx) => (
                <span key={idx} className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200">
                  🎯 {v}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Real-world Learning & Evolution Statistics */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 shadow-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              EVOLUSJONSMATRISE & KAMPSTATISTIKK
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-base font-mono font-bold text-rose-400 block">{armsRace.redWins}</span>
              <span className="text-[10px] font-mono text-slate-400">Red Wins</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-base font-mono font-bold text-cyan-400 block">{armsRace.blueWins}</span>
              <span className="text-[10px] font-mono text-slate-400">Blue Wins</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-base font-mono font-bold text-amber-400 block">{armsRace.stalemates}</span>
              <span className="text-[10px] font-mono text-slate-400">Standoffs</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            Konklusjon for War-Room: Verken angriper eller forsvarer har evig overherredømme. Den virkelige kraften ligger i å overvåke med eBPF og WORM, mutere kontinuerlig, og aldri anta at noe system er 100% ugjennomtrengelig.
          </p>

          {onSelectTab && (
            <button
              onClick={() => onSelectTab('arena')}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-rose-700 via-amber-700 to-cyan-700 hover:opacity-90 text-white font-mono text-xs font-bold transition-all shadow cursor-pointer text-center"
            >
              Ta Kampen videre inn i Cyber Gladiatorkamp-Arenaen ⚔️
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
