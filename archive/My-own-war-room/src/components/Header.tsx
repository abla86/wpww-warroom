import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  Wifi, 
  Globe, 
  Power, 
  Activity, 
  Lock, 
  Cpu,
  RefreshCw,
  Layers,
  MapPin,
  Sparkles,
  Radio,
  FileCode2,
  Terminal,
  KeyRound,
  Crown,
  Swords,
  TrendingUp,
  Lightbulb,
  GraduationCap,
  Search,
  Award,
  HeartPulse,
  BookOpen,
  FileText,
  Zap,
  Download,
  Film,
  Sliders,
  Scale
} from 'lucide-react';
import { SystemStats, SocAlertItem } from '../types';
import { HackerIntelTooltip } from './HackerIntelTooltip';

interface HeaderProps {
  stats: SystemStats;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onToggleSimulator: () => void;
  onToggleNetworkMode: () => void;
  onEmergencyLockdown: () => void;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onSyncDefinitions: () => void;
  isSyncingDefinitions: boolean;
  onOpenSyncModal: () => void;
  onOpenExportModal: () => void;
  hackerHudEnabled: boolean;
  onToggleHackerHud: () => void;
  onOpenAcademy: () => void;
  onOpenThreatSearch: () => void;
  onOpenTraining: () => void;
  onOpenNotes?: () => void;
  onOpenGuide?: (topic?: string) => void;
  onOpenAdvisor?: () => void;
  isAutonomousActive?: boolean;
  autonomousBlockedCount?: number;
  isGodModeActive?: boolean;
  onToggleGodMode?: () => void;
  onOpenGodModeModal?: () => void;
  onDownloadProjectZip?: () => void;
  onOpenTutorialFilm?: () => void;
  socAlerts?: SocAlertItem[];
  onOpenSocAlertCenter?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  soundEnabled,
  onToggleSound,
  onToggleSimulator,
  onToggleNetworkMode,
  onEmergencyLockdown,
  activeTab,
  onSelectTab,
  onSyncDefinitions,
  isSyncingDefinitions,
  onOpenSyncModal,
  onOpenExportModal,
  hackerHudEnabled,
  onToggleHackerHud,
  onOpenAcademy,
  onOpenThreatSearch,
  onOpenTraining,
  onOpenNotes,
  onOpenGuide,
  onOpenAdvisor,
  isAutonomousActive,
  autonomousBlockedCount,
  isGodModeActive,
  onToggleGodMode,
  onOpenGodModeModal,
  onDownloadProjectZip,
  onOpenTutorialFilm,
  socAlerts = [],
  onOpenSocAlertCenter,
}) => {
  const criticalAlertsCount = socAlerts.filter((a) => a.severity === 'CRITICAL').length;
  const totalAlertsCount = socAlerts.length;

  const tabs = [
    { id: 'radar', label: 'Tactical Radar & Live View', short: 'Radar', icon: Radio },
    { id: 'arena', label: 'Cyber Arena (Kamparena) ⚔️', short: 'Arena ⚔️', icon: Swords },
    { id: 'arms_race', label: 'Våpenkappløp & Balansematrise (Evolusjon) ⚖️', short: 'Våpenkappløp ⚖️', icon: Sliders },
    { id: 'godmode', label: 'Gudemodus & Overherredømme ⚡', short: 'Gudemodus ⚡', icon: Crown },
    { id: 'report', label: 'Automatisert SOC Rapport 📑', short: 'Rapport 📑', icon: FileText },
    { id: 'health', label: 'Systemhelse & Diagnostikk (eBPF & Kjerne)', short: 'Systemhelse 🩺', icon: HeartPulse },
    { id: 'timeline', label: 'Threat Timeline (Recharts Sanntid)', short: 'Timeline', icon: TrendingUp },
    { id: 'warroom', label: 'SecurityEngine Kjerne & Topologi', short: 'Topologi & Motor', icon: Terminal },
    { id: 'map', label: 'Globalt Trusselkart (Verden)', short: 'Trusselkart', icon: Globe },
    { id: 'simulator', label: 'Angrepssimulator (Matrise)', short: 'Simulator', icon: Activity },
    { id: 'forensics', label: 'Forensisk Hash-Kjede (WORM)', short: 'Hash-Kjede', icon: ShieldCheck },
    { id: 'blacklist', label: 'Svarteliste & Isolasjon', short: 'Svarteliste', icon: Lock },
    { id: 'entropy', label: 'Shannon Entropi-Motor', short: 'Entropi', icon: Cpu },
    { id: 'python', label: 'Python Kildekode (.py)', short: 'Python Fil', icon: FileCode2 },
  ];

  return (
    <header id="wpww-header" className="border-b border-cyan-900/60 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 text-slate-100">
      {/* Top Notification Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-slate-900/80 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
          <span className="font-mono text-emerald-400 font-semibold tracking-wider">
            WPWW DEFENSE SYSTEM // AUTONOM KJERNE AKTIV
          </span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <button
            onClick={onOpenSyncModal}
            className="text-slate-300 hover:text-cyan-300 transition-colors flex items-center gap-1.5 font-mono group cursor-pointer"
            title="Klikk for å se detaljer om sikkerhetsdefinisjoner og feeds"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span>Definisjoner: <strong className="text-cyan-300">{stats.securityDefinitions.version}</strong></span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
              {stats.securityDefinitions.totalSignatures.toLocaleString()} sig.
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <HackerIntelTooltip intelId="worm_integrity" showIndicator={hackerHudEnabled}>
            <div className="flex items-center gap-1.5 font-mono text-slate-400 cursor-help">
              {stats.integrityVerified ? (
                <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/60">
                  <ShieldCheck className="w-3.5 h-3.5" /> WORM Hash: Intakt
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-rose-400 bg-rose-950/50 px-2 py-0.5 rounded border border-rose-800/60 animate-pulse">
                  <ShieldAlert className="w-3.5 h-3.5" /> Hash Manipulert!
                </span>
              )}
            </div>
          </HackerIntelTooltip>

          {/* Contextual SOC Alert Center Trigger */}
          {onOpenSocAlertCenter && (
            <button
              id="btn-header-soc-alerts"
              onClick={onOpenSocAlertCenter}
              title="Åpne SOC Alert & Intervensjonssenter for sanntidsoversikt og manuell håndtering"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-xs font-bold transition-all cursor-pointer shadow-sm ${
                criticalAlertsCount > 0
                  ? 'bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 text-rose-200 border border-rose-500 shadow-rose-950/80 animate-pulse'
                  : totalAlertsCount > 0
                  ? 'bg-gradient-to-r from-amber-950 via-slate-900 to-slate-950 text-amber-300 border border-amber-600/80 hover:bg-amber-900/50 shadow-amber-950/40'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              <ShieldAlert className={`w-3.5 h-3.5 ${criticalAlertsCount > 0 ? 'text-rose-400' : totalAlertsCount > 0 ? 'text-amber-400' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">SOC VARSLER:</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
                criticalAlertsCount > 0
                  ? 'bg-rose-600 text-white animate-pulse'
                  : totalAlertsCount > 0
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {totalAlertsCount} {criticalAlertsCount > 0 ? 'PÅKREVD' : 'AKTIVE'}
              </span>
            </button>
          )}

          {/* Threat Search & AI Threat Hunter */}
          <button
            id="btn-open-threat-search"
            onClick={onOpenThreatSearch}
            title="Åpne Trussel-Søk og sanntids Gemini AI Threat Hunter"
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-950 to-slate-900 hover:from-purple-900 hover:to-slate-800 text-purple-300 px-2.5 py-1 rounded-md border border-purple-600/70 font-mono text-xs font-bold transition-all shadow-sm shadow-purple-950 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-purple-400" />
            <span>🔍 Trussel-Søk & AI</span>
          </button>

          {/* Interactive Walkthrough & Training */}
          <button
            id="btn-open-training"
            onClick={onOpenTraining}
            title="Åpne interaktiv SOC Walkthrough og Superhacker Treningsarena"
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-950 to-slate-900 hover:from-emerald-900 hover:to-slate-800 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-600/70 font-mono text-xs font-bold transition-all shadow-sm shadow-emerald-950 cursor-pointer"
          >
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>🎯 Walkthrough & Trening</span>
          </button>

          {/* Ethical Hacker Notes Modal Trigger */}
          {onOpenNotes && (
            <button
              id="btn-open-hacker-notes"
              onClick={onOpenNotes}
              title="Åpne Etiske Hacker Notater & SOC Feltjournal (YARA, IOC og Triage)"
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-950 to-slate-900 hover:from-amber-900 hover:to-slate-800 text-amber-300 px-2.5 py-1 rounded-md border border-amber-600/70 font-mono text-xs font-bold transition-all shadow-sm shadow-amber-950 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>📝 Notater</span>
            </button>
          )}

          {/* SOC Cyberguide & Veileder Trigger */}
          {onOpenGuide && (
            <button
              id="btn-open-cyber-guide"
              onClick={() => onOpenGuide('quickstart')}
              title="Åpne SOC Veileder & Cyberguide for pedagogisk hjelp og forklaringer"
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-cyan-950 to-blue-950 hover:from-cyan-900 hover:to-blue-900 text-cyan-200 px-2.5 py-1 rounded-md border border-cyan-500/80 font-mono text-xs font-bold transition-all shadow-sm shadow-cyan-950 cursor-pointer animate-pulse"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-300" />
              <span>🧭 Veileder</span>
            </button>
          )}

          {/* Live Incident & Countermeasures Copilot Trigger */}
          {onOpenAdvisor && (
            <button
              id="btn-open-incident-advisor"
              onClick={onOpenAdvisor}
              title="Åpne Sanntids Hendelser & Mottiltak Rådgiver (inkl. Autonom SOC Forsvarsmodus)"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-xs font-bold transition-all shadow-sm cursor-pointer ${
                isAutonomousActive
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500 shadow-emerald-950/50'
                  : 'bg-gradient-to-r from-purple-950 to-indigo-950 hover:from-purple-900 hover:to-indigo-900 text-purple-200 border border-purple-500/80 shadow-purple-950/50'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${isAutonomousActive ? 'text-emerald-400 animate-bounce' : 'text-amber-400'}`} />
              <span>⚡ Forslag & Tiltak</span>
              {isAutonomousActive && (
                <span className="text-[10px] px-1 py-0.2 bg-emerald-500 text-slate-950 font-black rounded-full">
                  AUTONOM
                </span>
              )}
            </button>
          )}

          {/* Quick Ethical Hacker Academy & HUD Trigger */}
          <button
            id="btn-open-hacker-academy"
            onClick={onOpenAcademy}
            title="Åpne Etisk Superhacker Akademi, verktøyoversikt og MITRE ATT&CK kart"
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-cyan-950 to-slate-900 hover:from-cyan-900 hover:to-slate-800 text-cyan-300 px-2.5 py-1 rounded-md border border-cyan-600/70 font-mono text-xs font-bold transition-all shadow-sm shadow-cyan-950 cursor-pointer"
          >
            <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
            <span>🎓 Akademi</span>
          </button>

          <button
            id="btn-toggle-hacker-hud"
            onClick={onToggleHackerHud}
            title="Slå på/av Etisk Hacker Intel HUD-indikatorer på knapper og kontroller"
            className={`inline-flex items-center gap-1 px-2 py-1 rounded border font-mono text-xs transition-all cursor-pointer ${
              hackerHudEnabled
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500 shadow-sm shadow-cyan-900'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Lightbulb className={`w-3.5 h-3.5 ${hackerHudEnabled ? 'text-cyan-400 animate-pulse' : ''}`} />
            <span>HUD: <strong>{hackerHudEnabled ? 'PÅ' : 'AV'}</strong></span>
          </button>

          <div className="flex items-center gap-1.5">
            {/* Tutorial Film Trigger */}
            {onOpenTutorialFilm && (
              <button
                id="btn-header-tutorial-film"
                onClick={onOpenTutorialFilm}
                title="Åpne Cyber War-Room Opplæringsfilm (Tutorial & Veiledning)"
                className="inline-flex items-center gap-1 bg-gradient-to-r from-cyan-950 to-blue-950 hover:from-cyan-900 hover:to-blue-900 text-cyan-300 px-2.5 py-1 rounded border border-cyan-600/80 font-mono text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Film className="w-3.5 h-3.5 text-cyan-400" />
                <span>Film 🎬</span>
              </button>
            )}

            {/* Download Full Project ZIP */}
            {onDownloadProjectZip && (
              <button
                id="btn-header-download-zip"
                onClick={onDownloadProjectZip}
                title="Last ned hele programmet som ZIP (full kildekode og produksjonsklar backend)"
                className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 px-2.5 py-1 rounded border border-amber-300 font-mono text-xs font-black transition-all shadow-md cursor-pointer hover:scale-105"
              >
                <Download className="w-3.5 h-3.5 text-slate-950" />
                <span>Last ned ZIP 💾</span>
              </button>
            )}

            {/* Quick Export Trigger */}
            <button
              id="btn-header-export"
              onClick={onOpenExportModal}
              title="Eksporter forensisk rapport i 8 ulike formater"
              className="inline-flex items-center gap-1 text-slate-300 hover:text-slate-100 bg-slate-900 hover:bg-slate-800 px-2 py-1 rounded border border-slate-700 font-mono text-xs transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Eksport</span>
            </button>

            <button
              id="btn-toggle-sound"
              onClick={onToggleSound}
              title={soundEnabled ? 'Slå av lyd' : 'Slå på lyd'}
              className="p-1.5 rounded hover:bg-slate-800/80 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              id="btn-emergency-lockdown"
              onClick={onEmergencyLockdown}
              className="inline-flex items-center gap-1 text-rose-300 hover:text-rose-100 bg-rose-950/40 hover:bg-rose-900/60 px-2 py-1 rounded border border-rose-800/60 font-mono text-xs transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-rose-400" /> Nødlås
            </button>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-600 via-teal-700 to-slate-900 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-950/50 border border-cyan-500/40">
            <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center font-bold text-lg text-cyan-400 font-mono">
              🦒
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight font-mono text-slate-100 flex items-center gap-2">
                WPWW WARROOM <span className="text-xs px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-mono">v20.0 ELITE</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block font-mono">
              Autonomt Forsvarsverk • Trusselkart • Honeypot • Shannon Entropi • WORM Hash-Kjede
            </p>
          </div>
        </div>

        {/* Global Controls, Arena, GodMode & Sync Security Definitions */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {/* Quick Arena Button */}
          <button
            id="btn-header-arena"
            onClick={() => onSelectTab('arena')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all cursor-pointer shadow-sm ${
              activeTab === 'arena'
                ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white border-rose-400 shadow-rose-950/60'
                : 'bg-slate-900 hover:bg-rose-950/50 border-rose-800/60 text-rose-300 hover:text-rose-100'
            }`}
            title="Gå direkte til Cyber Arena (Rød vs Blå gladiator-kamp)"
          >
            <Swords className="w-3.5 h-3.5 text-rose-400" />
            <span>Arena ⚔️</span>
          </button>

          {/* Master God Mode Button */}
          <button
            id="btn-header-godmode"
            onClick={onOpenGodModeModal || onToggleGodMode}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all shadow-md cursor-pointer ${
              isGodModeActive
                ? 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-slate-950 border-amber-300 shadow-amber-950 animate-pulse'
                : 'bg-slate-900 hover:bg-amber-950/40 border-amber-500/60 text-amber-300 hover:text-amber-100'
            }`}
            title="Gudemodus: Åpne overherredømme kontrollpanel og aktiver uovervinnelig beskyttelse"
          >
            <Crown className={`w-3.5 h-3.5 ${isGodModeActive ? 'text-slate-950' : 'text-amber-400'}`} />
            <span>GUDEMODUS: <strong className={isGodModeActive ? 'text-slate-950' : 'text-amber-300'}>{isGodModeActive ? 'PÅ ⚡' : 'AV'}</strong></span>
          </button>

          {/* Quick Report Button */}
          <button
            id="btn-header-report"
            onClick={() => onSelectTab('report')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all cursor-pointer shadow-sm ${
              activeTab === 'report'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 shadow-purple-950/60'
                : 'bg-slate-900 hover:bg-purple-950/50 border-purple-800/60 text-purple-300 hover:text-purple-100'
            }`}
            title="Se og generer full automatisert SOC-revisjonsrapport"
          >
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Rapport 📑</span>
          </button>

          {/* Sync Security Definitions Button */}
          <button
            id="btn-sync-security-definitions"
            onClick={onSyncDefinitions}
            disabled={isSyncingDefinitions}
            title="Hent oppdaterte trusselsignaturer, YARA-regler og CVE-databaser fra eksterne feeds"
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-mono font-semibold transition-all bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-950 hover:from-cyan-900 hover:to-slate-900 border-cyan-600/80 text-cyan-200 shadow-md shadow-cyan-950/50 disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncingDefinitions ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">{isSyncingDefinitions ? 'Synkroniserer...' : 'Sync Definisjoner'}</span>
            <span className="md:hidden">Sync</span>
          </button>

          {/* Network Switch */}
          <button
            id="btn-toggle-network"
            onClick={onToggleNetworkMode}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-mono transition-all bg-slate-900 hover:bg-slate-800 border-slate-700 hover:border-slate-600 text-slate-300"
            title="Bytt mellom Localhost (127.0.0.1) og Åpent Nettverk (0.0.0.0)"
          >
            {stats.activeListener === '127.0.0.1' ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                <span>Lytter: <strong className="text-cyan-300">127.0.0.1:{stats.port}</strong> (Lokal)</span>
              </>
            ) : (
              <>
                <Globe className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Lytter: <strong className="text-amber-300">0.0.0.0:{stats.port}</strong> (Åpent)</span>
              </>
            )}
          </button>

          {/* Simulator Toggle */}
          <button
            id="btn-toggle-simulator"
            onClick={onToggleSimulator}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-mono transition-all ${
              stats.simulatorEnabled
                ? 'bg-emerald-950/60 border-emerald-700/80 text-emerald-300 hover:bg-emerald-900/60 shadow-sm shadow-emerald-950'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Power className={`w-3.5 h-3.5 ${stats.simulatorEnabled ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span>Simulator: <strong className={stats.simulatorEnabled ? 'text-emerald-300' : 'text-slate-400'}>
              {stats.simulatorEnabled ? 'PÅ (Aktiv)' : 'AV (Deaktivert)'}
            </strong></span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 border-t border-slate-900 flex overflow-x-auto no-scrollbar gap-1 pt-1 pb-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const tabAlerts = (socAlerts || []).filter((a) => a.targetTab === tab.id);
          const hasCritical = tabAlerts.some((a) => a.severity === 'CRITICAL');
          const hasDefSync = tabAlerts.some((a) => a.category === 'SECURITY_DEFINITIONS');
          const primaryAlert = tabAlerts[0];

          return (
            <button
              key={tab.id}
              id={`tab-nav-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`px-3.5 py-2 rounded-t text-xs font-mono font-medium transition-all whitespace-nowrap border-b-2 flex items-center gap-1.5 relative ${
                isActive
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span className="hidden md:inline">{tab.label}</span>
              <span className="md:hidden">{tab.short}</span>

              {/* Contextual SOC Alert Badge */}
              {primaryAlert && (
                <span
                  title={`${primaryAlert.title} — ${primaryAlert.description}`}
                  className={`ml-1 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-tight shadow-sm ${
                    hasCritical
                      ? 'bg-rose-950 text-rose-200 border border-rose-600 shadow-rose-950/80 animate-pulse ring-1 ring-rose-500/50'
                      : hasDefSync
                      ? 'bg-amber-950 text-amber-200 border border-amber-600 shadow-amber-950/80'
                      : 'bg-cyan-950 text-cyan-200 border border-cyan-700'
                  }`}
                >
                  {hasCritical ? (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
                    </span>
                  ) : hasDefSync ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  )}
                  <span>{primaryAlert.badgeText}</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};

