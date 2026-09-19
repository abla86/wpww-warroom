import React, { useState } from 'react';
import { GatewayDevice, CloudSnapshot } from '../../types';
import { PredictiveSmartAlerts } from './PredictiveSmartAlerts';
import { FleetHealthMap } from './FleetHealthMap';
import { AutomatedBackupAndRestore } from './AutomatedBackupAndRestore';
import { Server, HardDrive, ShieldAlert, CheckCircle2, Clock, Wrench } from 'lucide-react';

interface DriftVaktViewProps {
  gateways: GatewayDevice[];
  snapshots: CloudSnapshot[];
  onRestoreGateway: (gatewayId: string) => void;
  onCreateSnapshot: (gatewayId: string) => void;
  onInitiateMigration: (gw: GatewayDevice) => void;
}

export const DriftVaktView: React.FC<DriftVaktViewProps> = ({
  gateways,
  snapshots,
  onRestoreGateway,
  onCreateSnapshot,
  onInitiateMigration,
}) => {
  const [selectedGateway, setSelectedGateway] = useState<GatewayDevice | null>(gateways[0] || null);

  const totalGateways = gateways.length;
  const criticalCount = gateways.filter((g) => g.status === 'critical').length;
  const warningCount = gateways.filter((g) => g.status === 'warning').length;
  const highWearCount = gateways.filter((g) => g.smart.wearPercentage > 75).length;

  return (
    <div className="space-y-6">
      {/* Top Banner introducing App 1 */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                APP 1: DRIFTVAKT
              </span>
              <span className="text-slate-400 text-xs font-medium">• Kommunal IT & Teknisk Driftsledelse</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1.5">
              Flåtestyring og Prediktiv Maskinvareovervåking
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl mt-1 leading-relaxed">
              Forhindrer systemkrasj i velferdsteknologien før de inntreffer. DriftVakt overvåker skriveslitasje på
              MicroSD/SSD-lagring, dataintegritet i Home Assistant-databaser og ruller ut automatiserte sky-snapshots
              til erstatningsenheter på få minutter.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 shrink-0">
            <div>
              <p className="text-[10px] uppercase font-mono text-slate-400">Total Flåte</p>
              <p className="text-lg font-bold text-white">1 428</p>
              <p className="text-[10px] text-emerald-400">gateways aktive</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-mono text-slate-400">SMART Slitasje</p>
              <p className="text-lg font-bold text-amber-400">{highWearCount} boliger</p>
              <p className="text-[10px] text-slate-400">&gt; 75% TBW forbrukt</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-mono text-slate-400">Kritiske Avvik</p>
              <p className="text-lg font-bold text-rose-400">{criticalCount} enhet</p>
              <p className="text-[10px] text-rose-300">Bolig 104 I/O-feil</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-mono text-slate-400">Sky-Snapshots</p>
              <p className="text-lg font-bold text-emerald-400">100%</p>
              <p className="text-[10px] text-slate-400">Siste: 14 min siden</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 1: Prediktiv feilvarsling (SMART & Skriveslitasje) */}
      <PredictiveSmartAlerts
        gateways={gateways}
        onSelectGateway={(gw) => setSelectedGateway(gw)}
        onInitiateMigration={(gw) => onInitiateMigration(gw)}
        onTriggerInstantSnapshot={(gw) => onCreateSnapshot(gw.id)}
      />

      {/* Feature 2: Sentralisert Helsekart & Tabell */}
      <FleetHealthMap
        gateways={gateways}
        selectedGateway={selectedGateway}
        onSelectGateway={(gw) => setSelectedGateway(gw)}
        onPrepareSnapshot={(gw) => {
          setSelectedGateway(gw);
          onCreateSnapshot(gw.id);
        }}
      />

      {/* Feature 3: Automatisert backup- og gjenopprettingsflyt */}
      <AutomatedBackupAndRestore
        snapshots={snapshots}
        gateways={gateways}
        onRestoreGateway={onRestoreGateway}
        onCreateSnapshot={onCreateSnapshot}
      />
    </div>
  );
};
