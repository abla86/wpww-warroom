import React from 'react';
import {
  Radio,
  Swords,
  Crown,
  ShieldCheck,
  FileText,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Zap,
  Info,
  Film,
  Download,
  Sliders
} from 'lucide-react';
import { SocAlertItem } from '../types';

export interface WarRoomOverviewBannerProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  isGodModeActive: boolean;
  onToggleGodMode: () => void;
  isAutonomousActive: boolean;
  totalBlocks: number;
  onDownloadProjectZip?: () => void;
  onOpenTutorialFilm?: () => void;
  socAlerts?: SocAlertItem[];
}

export const WarRoomOverviewBanner: React.FC<WarRoomOverviewBannerProps> = ({
  activeTab,
  onSelectTab,
  isGodModeActive,
  onToggleGodMode,
  isAutonomousActive,
  totalBlocks,
  onDownloadProjectZip,
  onOpenTutorialFilm,
  socAlerts = [],
}) => {
  const [isExpanded, setIsExpanded] = React.useState<boolean>(true);

  const pillars = [
    {
      id: 'radar',
      title: '1. Radar & Sensorer',
      tag: 'Sanntidsovervåking',
      color: 'border-cyan-500/50 bg-cyan-950/20 text-cyan-300 hover:border-cyan-400',
      icon: Radio,
      desc: 'Fanger opp innkommende trafikk, måler Shannon-entropi og avslører skjulte angrep i sanntid.',
      actionLabel: 'Gå til Radar',
    },
    {
      id: 'arena',
      title: '2. Cyber Arena',
      tag: 'Kampsone (Rød vs Blå)',
      color: 'border-rose-500/50 bg-rose-950/20 text-rose-300 hover:border-rose-400',
      icon: Swords,
      desc: 'Her kjemper virus (Mirai, Pegasus, Stuxnet) mot forsvarere i en visuell ring for å teste styrke.',
      actionLabel: 'Gå til Arenaen',
    },
    {
      id: 'godmode',
      title: '3. Gudemodus',
      tag: 'Overherredømme & Skjold',
      color: 'border-amber-500/50 bg-amber-950/20 text-amber-300 hover:border-amber-400',
      icon: Crown,
      desc: 'Gjør systemet uovervinnelig: 100% blokkering, auto-speiling, EMP og kvantekryptert kjerne.',
      actionLabel: 'Styr Gudemodus',
    },
    {
      id: 'forensics',
      title: '4. Forensisk WORM',
      tag: 'Uforfalskelig Bevis',
      color: 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300 hover:border-emerald-400',
      icon: ShieldCheck,
      desc: 'Hvert eneste blokkert angrep forsegles med SHA-256 i en uforanderlig kryptografisk blokkjede.',
      actionLabel: 'Se WORM-Kjede',
    },
    {
      id: 'report',
      title: '5. Automatisert Rapport',
      tag: '1-Klikks SOC Revisjon',
      color: 'border-purple-500/50 bg-purple-950/20 text-purple-300 hover:border-purple-400',
      icon: FileText,
      desc: 'Genererer en offisiell hendelsesrapport til ledelse eller revisjon med grafer og samsvarskontroll.',
      actionLabel: 'Vis Rapport',
    },
    {
      id: 'arms_race',
      title: '6. Våpenkappløp & Balanse',
      tag: 'Evolusjon & Spaker ⚖️',
      color: 'border-pink-500/50 bg-pink-950/20 text-pink-300 hover:border-pink-400',
      icon: Sliders,
      desc: 'Skru opp/ned angrep og forsvar. Ingen vinner alltid. Spill 6 autentiske historiske cyberkrigs-scenarioer.',
      actionLabel: 'Styr Balansen',
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/90 backdrop-blur-md shadow-xl overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="px-4 py-3 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 text-white shadow-md shadow-cyan-950">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <span>SLIK FUNGERER WAR-ROOM // INTUITIV OVERSIKT</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700 font-mono">
                {totalBlocks} HENDELSER AVVERGET
              </span>
            </h2>
            <p className="text-xs text-slate-400 hidden sm:block">
              Alt henger sammen i fem klare faser: Overvåk med Radar, test i Arenaen, beskytt med Gudemodus, loggfør med WORM, og eksporter Rapport.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tutorial Film Button */}
          {onOpenTutorialFilm && (
            <button
              onClick={onOpenTutorialFilm}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-950 to-blue-950 hover:from-cyan-900 hover:to-blue-900 text-cyan-300 border border-cyan-600/80 font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="Se introduksjonsfilm og masterclass for Cyber War-Roomet"
            >
              <Film className="w-3.5 h-3.5 text-cyan-400" />
              <span>Opplæringsfilm 🎬</span>
            </button>
          )}

          {/* Download Entire Program as ZIP */}
          {onDownloadProjectZip && (
            <button
              onClick={onDownloadProjectZip}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-mono text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer hover:scale-105"
              title="Last ned hele programmet som ZIP med full kildekode og produksjonsklar backend"
            >
              <Download className="w-3.5 h-3.5 text-slate-950" />
              <span>Last ned programmet (ZIP) 💾</span>
            </button>
          )}

          {/* God mode status badge */}
          <button
            onClick={onToggleGodMode}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
              isGodModeActive
                ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-amber-950/50 animate-pulse'
                : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/50'
            }`}
            title="Klikk for å aktivere eller deaktivere Gudemodus"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>GUDEMODUS: <strong>{isGodModeActive ? 'PÅ (AKTIV)' : 'AV'}</strong></span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
            title={isExpanded ? 'Skjul oversikt' : 'Vis oversikt'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 6 Pillars Grid */}
      {isExpanded && (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 bg-slate-950/50">
          {pillars.map((pillar) => {
            const isCurrent = activeTab === pillar.id;
            const Icon = pillar.icon;
            const pillarAlerts = socAlerts.filter((a) => a.targetTab === pillar.id);
            const hasCrit = pillarAlerts.some((a) => a.severity === 'CRITICAL');
            const hasDef = pillarAlerts.some((a) => a.category === 'SECURITY_DEFINITIONS');
            const alertItem = pillarAlerts[0];

            return (
              <div
                key={pillar.id}
                className={`rounded-xl border p-3.5 flex flex-col justify-between transition-all group ${pillar.color} ${
                  isCurrent ? 'ring-2 ring-cyan-400/60 shadow-lg' : 'opacity-90 hover:opacity-100'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-slate-950/60 border border-slate-800 truncate">
                      {pillar.tag}
                    </span>

                    <div className="flex items-center gap-1 shrink-0">
                      {alertItem && (
                        <span
                          title={`${alertItem.title} — ${alertItem.description}`}
                          className={`text-[9px] font-mono font-black px-1.5 py-0.2 rounded-full border shadow-sm ${
                            hasCrit
                              ? 'bg-rose-950 text-rose-300 border-rose-600 animate-pulse'
                              : hasDef
                              ? 'bg-amber-950 text-amber-300 border-amber-600'
                              : 'bg-cyan-950 text-cyan-300 border-cyan-700'
                          }`}
                        >
                          {alertItem.badgeText}
                        </span>
                      )}
                      <Icon className="w-4 h-4 opacity-80 group-hover:scale-110 transition-transform" />
                    </div>
                  </div>

                  <h3 className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                    {pillar.title}
                  </h3>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>

                <button
                  onClick={() => onSelectTab(pillar.id)}
                  className={`mt-3 w-full py-1.5 px-2.5 rounded-lg text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-white text-slate-950 shadow'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60'
                  }`}
                >
                  <span>{isCurrent ? 'Aktiv Nå' : pillar.actionLabel}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
