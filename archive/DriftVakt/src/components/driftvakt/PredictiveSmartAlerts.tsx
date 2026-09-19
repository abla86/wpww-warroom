import React from 'react';
import { GatewayDevice } from '../../types';
import { AlertTriangle, HardDrive, Cpu, Database, Flame, Zap, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';

interface PredictiveSmartAlertsProps {
  gateways: GatewayDevice[];
  onSelectGateway: (gw: GatewayDevice) => void;
  onInitiateMigration: (gw: GatewayDevice) => void;
  onTriggerInstantSnapshot: (gw: GatewayDevice) => void;
}

export const PredictiveSmartAlerts: React.FC<PredictiveSmartAlertsProps> = ({
  gateways,
  onSelectGateway,
  onInitiateMigration,
  onTriggerInstantSnapshot,
}) => {
  // Filter gateways with wear > 70% or critical status
  const alertGateways = gateways.filter((g) => g.smart.wearPercentage >= 70 || g.status === 'critical');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900">
              Prediktiv Feilvarsling (SMART & Skriveslitasje)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Overvåker flash-minne NAND slitasje, TBW og SQLite databasefragmentering før hardwarekrasj inntreffer.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 font-semibold border border-rose-200">
            {alertGateways.length} enheter krever forebyggende tiltak
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {alertGateways.map((gw) => {
          const isCritical = gw.smart.wearPercentage >= 90;
          return (
            <div
              key={gw.id}
              className={`rounded-xl border p-4 transition-all ${
                isCritical
                  ? 'bg-rose-50/40 border-rose-300 ring-1 ring-rose-200'
                  : 'bg-amber-50/30 border-amber-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">{gw.locationName}</span>
                    <span className="text-xs text-slate-500 font-mono">({gw.gatewayCode})</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Beboer: <strong className="font-medium text-slate-800">{gw.residentName}</strong> ({gw.residentAge} år) • {gw.unitAddress}
                  </p>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    isCritical ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                  }`}
                >
                  {isCritical ? 'KRITISK SLITASJE' : 'ADVARSEL'}
                </span>
              </div>

              {/* Progress bar of wear */}
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 flex items-center gap-1 font-medium">
                    <HardDrive className="h-3.5 w-3.5 text-slate-500" />
                    Lagringsmedium: {gw.smart.storageType}
                  </span>
                  <span className={`font-bold ${isCritical ? 'text-rose-700' : 'text-amber-700'}`}>
                    {gw.smart.wearPercentage}% forbrukt levetid
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isCritical ? 'bg-rose-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(gw.smart.wearPercentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* SMART metrics grid */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200/60 text-xs">
                <div className="bg-white/80 p-2 rounded border border-slate-200/60">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Total Skrevet</span>
                  <span className="font-bold text-slate-800">{gw.smart.totalBytesWrittenTB} TB</span>
                  <span className="text-[10px] text-slate-400 block font-mono">({gw.smart.iopsLoad} IOPS)</span>
                </div>
                <div className="bg-white/80 p-2 rounded border border-slate-200/60">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Restlevetid Est.</span>
                  <span className={`font-bold ${isCritical ? 'text-rose-700' : 'text-amber-800'}`}>
                    ~{gw.smart.expectedLifeRemainingDays} dager
                  </span>
                  <span className="text-[10px] text-slate-400 block">før I/O blokkering</span>
                </div>
                <div className="bg-white/80 p-2 rounded border border-slate-200/60">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">DB Størrelse</span>
                  <span className="font-bold text-slate-800">{(gw.smart.dbSizeMB / 1024).toFixed(1)} GB</span>
                  <span className="text-[10px] text-amber-700 block font-mono">
                    {gw.smart.dbFragmentation}% frag
                  </span>
                </div>
              </div>

              {/* Warning diagnosis */}
              <div className="mt-3 p-2.5 rounded-lg bg-white/90 border border-slate-200 text-xs text-slate-700">
                <p className="font-medium text-slate-900">Teknisk anbefaling:</p>
                <p className="text-slate-600 mt-0.5">{gw.recommendedAction}</p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-2">
                <button
                  id={`btn-migrate-${gw.id}`}
                  onClick={() => onInitiateMigration(gw)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors inline-flex items-center space-x-1.5 shadow-xs"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                  <span>Start SSD-migrering</span>
                </button>

                <button
                  id={`btn-snapshot-${gw.id}`}
                  onClick={() => onTriggerInstantSnapshot(gw)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors inline-flex items-center space-x-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                  <span>Ta nødsnapshot i skyen</span>
                </button>

                <button
                  id={`btn-inspect-${gw.id}`}
                  onClick={() => onSelectGateway(gw)}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 ml-auto"
                >
                  Vis detaljer →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
