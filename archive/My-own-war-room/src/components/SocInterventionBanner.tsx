import React from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  RefreshCw, 
  Lock, 
  Crown, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { SocAlertItem } from '../types';

export interface SocInterventionBannerProps {
  alerts: SocAlertItem[];
  currentTab: string;
  onResolveAlert: (alertId: string, actionType?: string) => void;
  onSyncDefinitions: () => void;
  onQuarantineIp: (ip: string, reason: string) => void;
  onActivateGodMode: () => void;
  onOpenAlertCenter: () => void;
}

export const SocInterventionBanner: React.FC<SocInterventionBannerProps> = ({
  alerts,
  currentTab,
  onResolveAlert,
  onSyncDefinitions,
  onQuarantineIp,
  onActivateGodMode,
  onOpenAlertCenter,
}) => {
  // Filter alerts relevant for the current tab
  const relevantAlerts = alerts.filter(
    (a) => a.targetTab === currentTab || (currentTab === 'radar' && a.requiresManualIntervention)
  );

  if (relevantAlerts.length === 0) {
    return null;
  }

  // Prioritize critical alerts first
  const activeAlert = relevantAlerts[0];
  const isCritical = activeAlert.severity === 'CRITICAL';
  const isDefSync = activeAlert.category === 'SECURITY_DEFINITIONS';

  return (
    <div 
      id="soc-intervention-banner"
      className={`mb-4 rounded-xl border p-3.5 transition-all shadow-lg backdrop-blur-md ${
        isCritical
          ? 'bg-rose-950/40 border-rose-600/80 shadow-rose-950/40'
          : isDefSync
          ? 'bg-amber-950/30 border-amber-600/70 shadow-amber-950/30'
          : 'bg-cyan-950/30 border-cyan-600/70 shadow-cyan-950/30'
      }`}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Left Side: Warning Icon & Details */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`p-2 rounded-lg shrink-0 ${
            isCritical 
              ? 'bg-rose-900/60 text-rose-400 border border-rose-700/80 animate-pulse'
              : isDefSync
              ? 'bg-amber-900/60 text-amber-400 border border-amber-700/80'
              : 'bg-cyan-900/60 text-cyan-400 border border-cyan-700/80'
          }`}>
            {isCritical ? <ShieldAlert className="w-5 h-5" /> : isDefSync ? <RefreshCw className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded tracking-wider ${
                isCritical 
                  ? 'bg-rose-900 text-rose-200 border border-rose-600 animate-pulse'
                  : isDefSync
                  ? 'bg-amber-900 text-amber-200 border border-amber-600'
                  : 'bg-cyan-900 text-cyan-200 border border-cyan-600'
              }`}>
                {isCritical ? '🚨 KRITISK BREACH // MANUELL INTERVENSJON' : isDefSync ? '⚠️ DEFINISJONER UTDATERTE' : '⚡ SOC VARSEL'}
              </span>

              {activeAlert.attackerIp && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                  IP: <strong className="text-rose-400">{activeAlert.attackerIp}</strong>
                </span>
              )}

              {activeAlert.threatType && (
                <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                  [{activeAlert.threatType}]
                </span>
              )}

              <span className="text-[10px] font-mono text-slate-500">
                {activeAlert.timestamp}
              </span>
            </div>

            <h4 className="text-sm font-mono font-bold text-white flex items-center gap-1.5">
              <span>{activeAlert.title}</span>
            </h4>

            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              {activeAlert.description}
            </p>
          </div>
        </div>

        {/* Right Side: Quick Intervention Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
          {isDefSync ? (
            <button
              onClick={onSyncDefinitions}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-mono text-xs font-black shadow-md transition-all cursor-pointer hover:scale-105"
              title="Kjør øyeblikkelig OTA-oppdatering av sikkerhetsdefinisjoner"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Oppdater Definisjoner Nå (OTA Sync)</span>
            </button>
          ) : activeAlert.attackerIp ? (
            <button
              onClick={() => onQuarantineIp(activeAlert.attackerIp!, activeAlert.threatType || 'Manuell SOC Kjerneisolering')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-mono text-xs font-black shadow-md transition-all cursor-pointer hover:scale-105"
              title="Kutt all forbindelse, isoler IP i kjernebrannmur og forsegling i WORM-kjede"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Iverksett Manuell Kjerneisolering</span>
            </button>
          ) : null}

          {isCritical && (
            <button
              onClick={onActivateGodMode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/60 font-mono text-xs font-bold transition-all cursor-pointer"
              title="Aktiver uovervinnelig beskyttelse for å nøytralisere alle åpne trusler"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Nød-Gudemodus</span>
            </button>
          )}

          <button
            onClick={() => onResolveAlert(activeAlert.id, 'RESOLVE')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-mono text-xs transition-colors cursor-pointer"
            title="Kvitter ut og fjern varsel etter håndtering"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Kvitter ut</span>
          </button>

          {alerts.length > 1 && (
            <button
              onClick={onOpenAlertCenter}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-cyan-400 font-mono text-xs transition-colors cursor-pointer"
              title="Åpne fullt SOC Varslingssenter"
            >
              <span>+{alerts.length - 1} flere</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
