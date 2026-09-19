import React, { useState, useEffect, useRef } from 'react';
import {
  Swords,
  Trophy,
  Crown,
  Shield,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Flame,
  Skull,
  Crosshair,
  Award,
  Terminal,
  Volume2,
  VolumeX,
  FastForward,
  Heart,
  Activity
} from 'lucide-react';
import { CyberGladiator, GodModeConfig } from '../types';

export interface CyberBattleRoyaleProps {
  gladiators: CyberGladiator[];
  config: GodModeConfig;
  onUpdateConfig?: (cfg: GodModeConfig) => void;
  onSelectFighterFor1v1?: (fighter: CyberGladiator) => void;
}

interface FighterInRing extends CyberGladiator {
  currentHp: number;
  kills: number;
  damageDealt: number;
  isAlive: boolean;
  currentTargetId: string | null;
  lastAction: string | null;
}

export const CyberBattleRoyaleAllFighters: React.FC<CyberBattleRoyaleProps> = ({
  gladiators,
  config,
  onUpdateConfig,
  onSelectFighterFor1v1,
}) => {
  // Initialize ring fighters with full health and fresh combat stats
  const [ringFighters, setRingFighters] = useState<FighterInRing[]>(() =>
    gladiators.map((g) => ({
      ...g,
      currentHp: g.maxHp || g.hp,
      kills: 0,
      damageDealt: 0,
      isAlive: true,
      currentTargetId: null,
      lastAction: 'Klar for kamp!',
    }))
  );

  const [combatRound, setCombatRound] = useState<number>(0);
  const [isBattleRunning, setIsBattleRunning] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(1000);
  const [battleFeed, setBattleFeed] = useState<string[]>([
    '⚔️ ARENA KLAR: Alle kjempere (virus, zero-days, SCADA ormer og AI-forsvarere) har entret ringen!',
  ]);
  const [champion, setChampion] = useState<FighterInRing | null>(null);
  const [godModeBlueTeam, setGodModeBlueTeam] = useState<boolean>(false);

  const feedEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll combat feed
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [battleFeed]);

  // Audio synthesizer for strikes & eliminations
  const playSound = (type: 'strike' | 'elimination' | 'victory') => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'strike') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'elimination') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'victory') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      }
    } catch {
      // Audio fallback
    }
  };

  // Perform 1 Round of Combat where every living fighter attacks a random living opponent
  const executeCombatRound = () => {
    setRingFighters((prevFighters) => {
      const livingFighters = prevFighters.filter((f) => f.isAlive);

      // Check if battle already concluded
      if (livingFighters.length <= 1) {
        if (livingFighters.length === 1 && !champion) {
          setChampion(livingFighters[0]);
          playSound('victory');
          setBattleFeed((prev) => [
            `👑 TURNERING AVSLUTTET! ${livingFighters[0].name} er DEN ULTIMATE MESTEREN av Cyber Arena!`,
            ...prev,
          ]);
        }
        setIsBattleRunning(false);
        return prevFighters;
      }

      const updated = prevFighters.map((f) => ({ ...f }));
      const newFeedEntries: string[] = [];
      const newRound = combatRound + 1;

      // Each living fighter gets a turn to act
      for (const attacker of updated) {
        if (!attacker.isAlive) continue;

        // Choose a target from other living fighters
        const validTargets = updated.filter((t) => t.isAlive && t.id !== attacker.id);
        if (validTargets.length === 0) break;

        const target = validTargets[Math.floor(Math.random() * validTargets.length)];
        attacker.currentTargetId = target.id;

        // Pick a move
        const move = attacker.moves[Math.floor(Math.random() * attacker.moves.length)];

        // Calculate damage
        const isBlueTeamDefender = attacker.category === 'AI_DEFENDER' || attacker.category === 'SANDBOX_DEFENSE';
        const isTargetBlueTeam = target.category === 'AI_DEFENDER' || target.category === 'SANDBOX_DEFENSE';

        let damage = Math.round((move.power * (attacker.attackPower / 80)) * (0.85 + Math.random() * 0.3));

        // If target is blue team and God Mode Blue is active, they take 0 damage and reflect!
        if (isTargetBlueTeam && godModeBlueTeam) {
          damage = 0;
          const reflectDamage = Math.round(move.power * 0.9);
          attacker.currentHp = Math.max(0, attacker.currentHp - reflectDamage);
          attacker.lastAction = `🪞 Speilet av ${target.name}! Tok ${reflectDamage} i retur!`;
          newFeedEntries.push(
            `🛡️ ${target.name} [GUDEMODUS] reflekterte angrepet til ${attacker.name} for ${reflectDamage} skade!`
          );
          if (attacker.currentHp <= 0) {
            attacker.isAlive = false;
            target.kills += 1;
            playSound('elimination');
            newFeedEntries.push(`💥 ${attacker.name} ble nøytralisert av sin egen reflekterte payload!`);
          }
          continue;
        }

        // Apply normal damage with defense mitigation
        const mitigatedDmg = Math.max(15, Math.round(damage * (1 - target.defensePower / 250)));
        target.currentHp = Math.max(0, target.currentHp - mitigatedDmg);
        attacker.damageDealt += mitigatedDmg;
        attacker.lastAction = `Brukte ${move.name} mot ${target.name} (-${mitigatedDmg} HP)`;

        newFeedEntries.push(
          `⚔️ ${attacker.name} brukte "${move.name}" mot ${target.name} for ${mitigatedDmg} skade!`
        );

        // Check if target was eliminated
        if (target.currentHp <= 0 && target.isAlive) {
          target.isAlive = false;
          target.currentHp = 0;
          attacker.kills += 1;
          playSound('elimination');
          newFeedEntries.push(`💀 ELIMINERT: ${target.name} ble slått ut av ${attacker.name}!`);
        }
      }

      setCombatRound(newRound);
      setBattleFeed((prev) => [...newFeedEntries, ...prev].slice(0, 100));
      playSound('strike');

      // Check remaining living fighters
      const remainingLiving = updated.filter((f) => f.isAlive);
      if (remainingLiving.length === 1) {
        setChampion(remainingLiving[0]);
        playSound('victory');
        setIsBattleRunning(false);
        setBattleFeed((prev) => [
          `🏆 VICTORY ROYALE! ${remainingLiving[0].name} sto imot alle fiender og vant turneringen!`,
          ...prev,
        ]);
      } else if (remainingLiving.length === 0) {
        setIsBattleRunning(false);
        setBattleFeed((prev) => ['⚠️ Uavgjort: Alle kjempere eliminerte hverandre samtidig!', ...prev]);
      }

      return updated;
    });
  };

  // Continuous Battle loop when auto-battle is active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBattleRunning && !champion) {
      interval = setInterval(() => {
        executeCombatRound();
      }, speedMs);
    }
    return () => clearInterval(interval);
  }, [isBattleRunning, speedMs, champion, combatRound, godModeBlueTeam]);

  // Reset arena
  const handleResetArena = () => {
    setIsBattleRunning(false);
    setChampion(null);
    setCombatRound(0);
    setRingFighters(
      gladiators.map((g) => ({
        ...g,
        currentHp: g.maxHp || g.hp,
        kills: 0,
        damageDealt: 0,
        isAlive: true,
        currentTargetId: null,
        lastAction: 'Klar for kamp!',
      }))
    );
    setBattleFeed([
      '🔄 ARENA NULLSTILT: Alle helsepoeng gjenopprettet. Klar for et nytt Battle Royale!',
    ]);
  };

  const livingCount = ringFighters.filter((f) => f.isAlive).length;

  return (
    <div className="space-y-6">
      {/* TOP ARENA COMMAND BAR */}
      <div className="bg-slate-950 border-2 border-rose-900/60 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">⚔️</span>
              <h2 className="text-lg font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
                Cyber Battle Royale: Alle Kjemper mot Alle
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-700 font-mono font-bold animate-pulse">
                {livingCount} av {ringFighters.length} I LIVE
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono mt-1">
              Her kastes samtlige virus, ormer, APT-grupper og Blue Team forsvarere inn i samme sirkel. Kun én overlever!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Run / Pause Battle Button */}
            {!champion ? (
              <button
                onClick={() => {
                  if (isBattleRunning) {
                    setIsBattleRunning(false);
                  } else {
                    setIsBattleRunning(true);
                  }
                }}
                className={`py-2 px-4 rounded-xl font-mono text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                  isBattleRunning
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white animate-pulse'
                }`}
              >
                {isBattleRunning ? (
                  <>
                    <Pause className="w-4 h-4" /> Pause Krig
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Start Battle Royale (Auto)
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleResetArena}
                className="py-2 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-mono text-xs font-bold flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <Trophy className="w-4 h-4" /> Start Ny Turnering
              </button>
            )}

            {/* Manual Step Round Button */}
            <button
              onClick={executeCombatRound}
              disabled={isBattleRunning || Boolean(champion)}
              className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs font-bold disabled:opacity-40 transition-colors cursor-pointer"
              title="Kjør én runde manuelt for å studere hvert enkelt angrep"
            >
              Neste Runde (Trinn)
            </button>

            {/* Speed Toggle */}
            <button
              onClick={() => setSpeedMs((prev) => (prev === 1000 ? 500 : prev === 500 ? 250 : 1000))}
              className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs flex items-center gap-1.5 cursor-pointer"
              title="Endre kamphastighet"
            >
              <FastForward className="w-3.5 h-3.5 text-cyan-400" />
              <span>{speedMs === 250 ? 'Lynhurtig (0.25s)' : speedMs === 500 ? 'Rask (0.5s)' : 'Normal (1s)'}</span>
            </button>

            {/* God Mode for Blue Team Defenders */}
            <button
              onClick={() => setGodModeBlueTeam((p) => !p)}
              className={`py-2 px-3 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                godModeBlueTeam
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-600/60'
              }`}
              title="Gi Blue Team forsvarerne Gudemodus (udødelighet + speiling) under kampen"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Blue Team Gudemodus: {godModeBlueTeam ? 'PÅ' : 'AV'}</span>
            </button>

            {/* Reset Button */}
            <button
              onClick={handleResetArena}
              className="py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-700 text-slate-400 hover:text-rose-300 font-mono text-xs cursor-pointer"
              title="Nullstill alle helser og tøm logger"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Champion Winner Banner */}
        {champion && (
          <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-amber-950/90 via-slate-900 to-yellow-950/90 border-2 border-amber-400 text-white flex flex-wrap items-center justify-between gap-4 animate-bounce shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{champion.avatar}</span>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-bold block">
                  👑 Vinner & Siste Overlevende Mester
                </span>
                <div className="text-lg font-bold font-mono text-white">
                  {champion.name} ({champion.title})
                </div>
                <div className="text-xs font-mono text-amber-200 mt-0.5">
                  Eliminerte {champion.kills} motstandere og påførte {champion.damageDealt} total skade i runde {combatRound}!
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onSelectFighterFor1v1 && (
                <button
                  onClick={() => onSelectFighterFor1v1(champion)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold cursor-pointer"
                >
                  Bruk i 1v1 Duell
                </button>
              )}
              <button
                onClick={handleResetArena}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 font-mono text-xs cursor-pointer"
              >
                Kjør Ny Kamp
              </button>
            </div>
          </div>
        )}
      </div>

      {/* GLADIATOR COMBATANTS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ringFighters.map((fighter) => {
          const hpPct = Math.max(0, Math.round((fighter.currentHp / (fighter.maxHp || fighter.hp)) * 100));
          const isBlueTeam = fighter.category === 'AI_DEFENDER' || fighter.category === 'SANDBOX_DEFENSE';

          return (
            <div
              key={fighter.id}
              className={`rounded-2xl border p-4 transition-all relative overflow-hidden ${
                !fighter.isAlive
                  ? 'bg-slate-950/50 border-slate-900 opacity-45 grayscale'
                  : isBlueTeam
                  ? 'bg-slate-950 border-cyan-800/80 shadow-lg shadow-cyan-950/40 hover:border-cyan-500'
                  : 'bg-slate-950 border-rose-900/60 shadow-lg shadow-rose-950/40 hover:border-rose-500'
              }`}
            >
              {/* Header Info */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl">{fighter.avatar}</span>
                  <div>
                    <div className="font-mono font-bold text-sm text-slate-100 flex items-center gap-1.5">
                      <span>{fighter.name}</span>
                      {isBlueTeam && godModeBlueTeam && fighter.isAlive && (
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 block truncate max-w-[150px]">
                      {fighter.title}
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      !fighter.isAlive
                        ? 'bg-slate-900 text-slate-500'
                        : isBlueTeam
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {fighter.isAlive ? fighter.category.replace('_', ' ') : '💀 UTE'}
                  </span>
                </div>
              </div>

              {/* HP Bar */}
              <div className="space-y-1 my-3">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-400" /> Helse:
                  </span>
                  <span className={`font-bold ${hpPct > 50 ? 'text-emerald-400' : hpPct > 25 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {fighter.currentHp} / {fighter.maxHp || fighter.hp} ({hpPct}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-300 ${
                      hpPct > 50
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                        : hpPct > 25
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                        : 'bg-gradient-to-r from-rose-600 to-red-500 animate-pulse'
                    }`}
                    style={{ width: `${hpPct}%` }}
                  />
                </div>
              </div>

              {/* Stats and Action */}
              <div className="text-[10px] font-mono text-slate-400 space-y-1.5 pt-1 border-t border-slate-900">
                <div className="flex justify-between">
                  <span>Eliminasjoner: <strong className="text-amber-300">{fighter.kills}</strong></span>
                  <span>Skade gitt: <strong className="text-white">{fighter.damageDealt}</strong></span>
                </div>

                <div className="bg-slate-900/90 p-1.5 rounded-lg border border-slate-800/80 text-[10px] text-slate-300 truncate">
                  <span className="text-slate-500 block text-[9px]">Siste handling:</span>
                  <span className="text-cyan-300">{fighter.lastAction}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* LIVE COMBAT LOG FEED */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl font-mono">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Direkte Kamp-Logg (Runde {combatRound})</span>
          </div>
          <span className="text-[11px] text-slate-400">
            {isBattleRunning ? '🟢 Kjempere i kontinuerlig utveksling...' : '⏸️ Venter på neste runde'}
          </span>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 text-xs">
          {battleFeed.map((entry, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-lg border ${
                entry.includes('💀') || entry.includes('ELIMINERT')
                  ? 'bg-rose-950/60 border-rose-800 text-rose-200 font-bold'
                  : entry.includes('👑') || entry.includes('VICTORY')
                  ? 'bg-amber-950/70 border-amber-500 text-amber-200 font-bold'
                  : entry.includes('🛡️') || entry.includes('GUDEMODUS')
                  ? 'bg-cyan-950/60 border-cyan-800 text-cyan-200'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-300'
              }`}
            >
              {entry}
            </div>
          ))}
          <div ref={feedEndRef} />
        </div>
      </div>
    </div>
  );
};
