import React, { useState } from 'react';
import { CloudSnapshot, GatewayDevice } from '../../types';
import { Cloud, ShieldCheck, Download, RefreshCw, Cpu, QrCode, CheckCircle2, Copy, Sparkles, HardDrive } from 'lucide-react';

interface AutomatedBackupAndRestoreProps {
  snapshots: CloudSnapshot[];
  gateways: GatewayDevice[];
  onRestoreGateway: (gatewayId: string) => void;
  onCreateSnapshot: (gatewayId: string) => void;
}

export const AutomatedBackupAndRestore: React.FC<AutomatedBackupAndRestoreProps> = ({
  snapshots,
  gateways,
  onRestoreGateway,
  onCreateSnapshot,
}) => {
  const [selectedSnapshot, setSelectedSnapshot] = useState<CloudSnapshot | null>(snapshots[0] || null);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionProgress, setProvisionProgress] = useState(0);
  const [provisionSuccess, setProvisionSuccess] = useState(false);
  const [targetGatewayId, setTargetGatewayId] = useState<string>(gateways[0]?.id || '');
  const [copiedKey, setCopiedKey] = useState(false);

  const handleStartRapidProvision = () => {
    if (!selectedSnapshot) return;
    setIsProvisioning(true);
    setProvisionProgress(15);
    setProvisionSuccess(false);

    const interval = setInterval(() => {
      setProvisionProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          setTimeout(() => {
            setIsProvisioning(false);
            setProvisionSuccess(true);
            onRestoreGateway(selectedSnapshot.gatewayId);
          }, 600);
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  const handleCopyToken = () => {
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Cloud className="h-4 w-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900">
              Automatisert Sky-Snapshot & 1-Klikks Erstatningsklargjøring
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Komplett gjenoppretting av Home Assistant, Zigbee coordinator-mesh og sensorprofiler på minutter.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onCreateSnapshot(targetGatewayId || gateways[0]?.id)}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors flex items-center space-x-1.5 shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Ta nytt sky-snapshot nå</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Snapshot repository list */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
            <span>Validerte sky-snapshots ({snapshots.length})</span>
            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
              AES-256 kryptert
            </span>
          </div>

          <div className="space-y-2.5">
            {snapshots.map((snap) => {
              const isSelected = selectedSnapshot?.id === snap.id;
              return (
                <div
                  key={snap.id}
                  onClick={() => {
                    setSelectedSnapshot(snap);
                    setProvisionSuccess(false);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50/60 border-emerald-400 ring-1 ring-emerald-300'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{snap.locationName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{snap.createdAt}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {snap.status}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {snap.includedModules.map((m, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200"
                      >
                        {m}
                      </span>
                    ))}
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Størrelse: {snap.sizeMB} MB</span>
                    <span className="truncate max-w-[140px]" title={snap.sha256}>
                      SHA: {snap.sha256.substring(0, 10)}...
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Rapid Provisioning Wizard for brand-new replacement device */}
        <div className="lg:col-span-7 bg-slate-900 text-white rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Cpu className="h-5 w-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">«Rykende Fersk Enhet» - Kloning & Provisjonering</h3>
                  <p className="text-[11px] text-slate-400">
                    Sett opp en ny erstatnings-gateway med industrigrad SSD på under 3 minutter.
                  </p>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-700">
                Zero-Touch Provisioning
              </span>
            </div>

            {selectedSnapshot ? (
              <div className="mt-4 space-y-4">
                <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 text-xs">
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span className="text-slate-400">Kilde-snapshot:</span>
                    <span className="font-bold text-white">{selectedSnapshot.locationName}</span>
                  </div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span className="text-slate-400">HA Kjerne:</span>
                    <span className="font-mono text-emerald-400">{selectedSnapshot.haVersion}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Inkludert sikkerhetsmesh:</span>
                    <span className="text-slate-200">Full Zigbee/Z-Wave radio-tilstand & database</span>
                  </div>
                </div>

                {/* Provisioning Visual Flow */}
                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <QrCode className="h-4 w-4 text-emerald-400" />
                      Provisioning Token & QR for Tekniker-nettbrett
                    </span>
                    <button
                      onClick={handleCopyToken}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      <span>{copiedKey ? 'Kopiert!' : 'Kopier nøkkel'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg shrink-0">
                      {/* Stylized QR placeholder */}
                      <div className="w-16 h-16 bg-slate-900 rounded grid grid-cols-4 gap-0.5 p-1">
                        <div className="bg-white col-span-2 row-span-2"></div>
                        <div className="bg-white"></div>
                        <div className="bg-white"></div>
                        <div className="bg-white"></div>
                        <div className="bg-white col-span-2 row-span-2"></div>
                      </div>
                    </div>

                    <div className="text-[11px] font-mono text-slate-300 space-y-1">
                      <p className="text-slate-400 font-sans">Koble ny gateway til strøm og nett:</p>
                      <p className="bg-slate-900 p-1.5 rounded border border-slate-800 text-emerald-400 truncate">
                        COMMUNE-ZTP://{selectedSnapshot.gatewayId}?token=sha256_{selectedSnapshot.sha256.substring(0, 16)}
                      </p>
                      <p className="text-slate-400 font-sans text-[10px]">
                        Hardware overtar automatisk IP og krypteringsnøkler. Ingen re-paring av sensorer nødvendig!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress bar when in progress */}
                {isProvisioning && (
                  <div className="p-3 bg-indigo-950/60 rounded-lg border border-indigo-700/60 text-xs">
                    <div className="flex justify-between mb-1.5 text-indigo-200 font-medium">
                      <span className="flex items-center gap-1.5">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                        Gjenoppretter Home Assistant til ny maskinvare...
                      </span>
                      <span>{provisionProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                        style={{ width: `${provisionProgress}%` }}
                      />
                    </div>
                    <div className="mt-2 text-[10px] text-slate-400 font-mono">
                      {provisionProgress < 40 && 'Formaterer NVMe SSD & oppretter ext4-partisjon...'}
                      {provisionProgress >= 40 && provisionProgress < 75 && 'Dekrypterer og ruller ut Home Assistant snapshot...'}
                      {provisionProgress >= 75 && 'Verifiserer Zigbee-nettverk & gjenoppretter sensorforbindelser...'}
                    </div>
                  </div>
                )}

                {provisionSuccess && (
                  <div className="p-3 bg-emerald-950/80 border border-emerald-600 rounded-lg text-xs text-emerald-200 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                      <div>
                        <p className="font-bold text-white">Gjenoppretting fullført på 2m 14s!</p>
                        <p className="text-[11px] text-emerald-300">
                          {selectedSnapshot.locationName} er nå online med 100% frisk SSD. Feilen er rettet i hele systemet.
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded bg-emerald-800 font-semibold text-[10px] text-white">
                      LIVE
                    </span>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <div className="mt-6 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Anbefalt: Migrer til NVMe SSD for å unngå framtidig MicroSD-slitasje
            </span>

            <button
              id="btn-run-provision"
              disabled={isProvisioning || !selectedSnapshot}
              onClick={handleStartRapidProvision}
              className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center space-x-2 shadow-sm transition-all ${
                isProvisioning
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold'
              }`}
            >
              <Sparkles className="h-4 w-4 text-slate-950" />
              <span>{isProvisioning ? 'Provisjonerer...' : 'Rull ut til erstatningsenhet'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
