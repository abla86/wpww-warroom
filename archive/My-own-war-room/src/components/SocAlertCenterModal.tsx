import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  AlertTriangle, 
  RefreshCw, 
  Lock, 
  Crown, 
  CheckCircle2, 
  Activity, 
  Radio, 
  ExternalLink,
  Trash2,
  Sparkles,
  Sliders,
  FileText,
  HeartPulse
} from 'lucide-react';
import { SocAlertItem } from '../types';

export interface SocAlertCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: SocAlertItem[];
  onResolveAlert: (alertId: string, actionType?: string) => void;
  onResolveAllAlerts: () => void;
  onSyncDefinitions: () => void;
  isSyncingDefinitions: boolean;
  onQuarantineIp: (ip: string, reason: string) => void;
  onActivateGodMode: () => void;
  isGodModeActive: boolean;
  onSelectTab: (tabId: string) => void;
  onSimulateBreachAlert: () => void;
  onSimulateDefinitionsOutdated: () => void;
}

export const SocAlertCenterModal: React.FC<SocAlertCenterModalProps> = ({
  isOpen,
  onClose,
  alerts,
  onResolveAlert,
  onResolveAllAlerts,
  onSyncDefinitions,
  isSyncingDefinitions,
  onQuarantineIp,
  onActivateGodMode,
  isGodModeActive,
  onSelectTab,
  onSimulateBreachAlert,
  onSimulateDefinitionsOutdated,
}) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CRITICAL' | 'DEFINITIONS' | 'HEALTH'>('ALL');

  if (!isOpen) return null;

  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL').length;
  const defCount = alerts.filter((a) => a.category === 'SECURITY_DEFINITIONS').length;
  const filteredAlerts = alerts.filter((a) => {
    if (activeFilter === 'CRITICAL') return a.severity === 'CRITICAL' || a.requiresManualIntervention;
    if (activeFilter === 'DEFINITIONS') return a.category === 'SECURITY_DEFINITIONS';
    if (activeFilter === 'HEALTH') return a.targetTab === 'health' || a.category === 'KERNEL_HEALTH';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div 
        id="soc-alert-center-modal"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              criticalCount > 0 
                ? 'bg-rose-950 text-rose-400 border-rose-600/80 animate-pulse'
                : 'bg-cyan-950 text-cyan-400 border-cyan-700/80'
            }`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-base font-bold text-white tracking-wide">
                  SOC ALERT & INTERVENSJONS-SENTER
                </h3>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  criticalCount > 0 
                    ? 'bg-rose-950 text-rose-300 border border-rose-600 animate-pulse'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                }`}>
                  {alerts.length} AKTIVE VARSLER
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Kontekstuelle SOC-signaler på tvers av moduler // Sanntidshåndtering og manuell overstyring
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Lukk SOC Varslingssenter"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Telemetry Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-slate-950/40 border-b border-slate-800/80">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Kritiske Brudd</div>
            <div className="text-lg font-mono font-black text-rose-400 flex items-center gap-1.5 mt-0.5">
              <span>{criticalCount}</span>
              {criticalCount > 0 && <span className="text-[10px] text-rose-500 font-sans font-normal animate-pulse">Påkrevd</span>}
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Definisjoner</div>
            <div className="text-lg font-mono font-black text-amber-400 flex items-center gap-1.5 mt-0.5">
              <span>{defCount > 0 ? 'UTDATERT' : 'OPPDATERT'}</span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Gudemodus Skjold</div>
            <div className="text-lg font-mono font-black text-amber-300 flex items-center gap-1.5 mt-0.5">
              <span>{isGodModeActive ? 'AKTIVERT ⚡' : 'STANDBY'}</span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
            <div className="text-[10px] font-mono text-slate-400 uppercase">WORM Integritet</div>
            <div className="text-lg font-mono font-black text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <span>100% INTENDED</span>
            </div>
          </div>
        </div>

        {/* Filter Bar & Bulk Actions */}
        <div className="px-4 py-2.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 bg-slate-950/60">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                activeFilter === 'ALL'
                  ? 'bg-cyan-600 text-white font-bold shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Alle ({alerts.length})
            </button>
            <button
              onClick={() => setActiveFilter('CRITICAL')}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                activeFilter === 'CRITICAL'
                  ? 'bg-rose-600 text-white font-bold shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Kritiske Brudd ({criticalCount})
            </button>
            <button
              onClick={() => setActiveFilter('DEFINITIONS')}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                activeFilter === 'DEFINITIONS'
                  ? 'bg-amber-600 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Definisjoner ({defCount})
            </button>
            <button
              onClick={() => setActiveFilter('HEALTH')}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                activeFilter === 'HEALTH'
                  ? 'bg-purple-600 text-white font-bold shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Systemhelse
            </button>
          </div>

          <div className="flex items-center gap-2">
            {alerts.length > 0 && (
              <button
                onClick={onResolveAllAlerts}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-300 border border-slate-700 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Kvitter ut og lukk alle aktive varsler"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Kvitter ut alle</span>
              </button>
            )}
          </div>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-950/60 border border-emerald-700 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-mono text-sm font-bold text-white">
                Ingen aktive SOC-varsler i denne kategorien
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Alle sikkerhetsdefinisjoner er synkronisert, og ingen uavvergede inntrengningsforsøk krever manuell inngripen.
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isCrit = alert.severity === 'CRITICAL';
              const isDef = alert.category === 'SECURITY_DEFINITIONS';

              return (
                <div
                  key={alert.id}
                  className={`rounded-xl border p-3.5 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
                    isCrit
                      ? 'bg-rose-950/30 border-rose-600/70 shadow-sm'
                      : isDef
                      ? 'bg-amber-950/20 border-amber-600/60'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      isCrit 
                        ? 'bg-rose-900/60 text-rose-400 border border-rose-700'
                        : isDef
                        ? 'bg-amber-900/60 text-amber-400 border border-amber-700'
                        : 'bg-cyan-900/60 text-cyan-400 border border-cyan-700'
                    }`}>
                      {isCrit ? <ShieldAlert className="w-4 h-4" /> : isDef ? <RefreshCw className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.2 rounded ${
                          isCrit 
                            ? 'bg-rose-900 text-rose-200 border border-rose-600'
                            : isDef
                            ? 'bg-amber-900 text-amber-200 border border-amber-600'
                            : 'bg-cyan-900 text-cyan-200 border border-cyan-600'
                        }`}>
                          {alert.badgeText}
                        </span>

                        <button
                          onClick={() => {
                            onSelectTab(alert.targetTab);
                            onClose();
                          }}
                          className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-slate-700 flex items-center gap-1 cursor-pointer"
                          title="Naviger direkte til tilhørende fane"
                        >
                          <span>Fane: {alert.targetTab.toUpperCase()}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>

                        {alert.attackerIp && (
                          <span className="text-[10px] font-mono text-slate-300 px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800">
                            IP: <strong className="text-rose-400">{alert.attackerIp}</strong>
                          </span>
                        )}

                        <span className="text-[10px] font-mono text-slate-500">
                          {alert.timestamp}
                        </span>
                      </div>

                      <h4 className="text-xs font-mono font-bold text-white">
                        {alert.title}
                      </h4>

                      <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                        {alert.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                    {isDef ? (
                      <button
                        onClick={() => {
                          onSyncDefinitions();
                          onResolveAlert(alert.id, 'SYNC');
                        }}
                        disabled={isSyncingDefinitions}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncingDefinitions ? 'animate-spin' : ''}`} />
                        <span>OTA Sync Nå</span>
                      </button>
                    ) : alert.attackerIp ? (
                      <button
                        onClick={() => {
                          onQuarantineIp(alert.attackerIp!, alert.threatType || 'Manuell Kjerneisolering');
                          onResolveAlert(alert.id, 'QUARANTINE');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Kjerneisoler IP</span>
                      </button>
                    ) : null}

                    <button
                      onClick={() => onResolveAlert(alert.id, 'DISMISS')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-mono text-xs transition-colors cursor-pointer"
                      title="Fjern og kvitter ut varsel"
                    >
                      <span>Kvitter ut</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer: Simulation & Test Hub */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-slate-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Simulering & Test:</span>
            </span>

            <button
              onClick={onSimulateBreachAlert}
              className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-700/60 font-mono text-xs transition-colors cursor-pointer"
              title="Simuler et kritisk inntrengningsforsøk som krever manuell intervensjon"
            >
              + Simuler Nytt Kritisk Brudd
            </button>

            <button
              onClick={onSimulateDefinitionsOutdated}
              className="px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-700/60 font-mono text-xs transition-colors cursor-pointer"
              title="Sett sikkerhetsdefinisjoner til utdatert for å teste varselsystemet"
            >
              + Merk Definisjoner Utdaterte
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold transition-colors cursor-pointer"
          >
            Lukk
          </button>
        </div>
      </div>
    </div>
  );
};
