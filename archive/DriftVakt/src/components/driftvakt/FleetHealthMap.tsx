import React, { useState } from 'react';
import { GatewayDevice, DeviceHealthStatus } from '../../types';
import { MapPin, Search, Filter, ShieldCheck, AlertTriangle, XCircle, CheckCircle2, Wifi, Server, Database, Activity, HardDrive, RefreshCw } from 'lucide-react';

interface FleetHealthMapProps {
  gateways: GatewayDevice[];
  selectedGateway: GatewayDevice | null;
  onSelectGateway: (gw: GatewayDevice) => void;
  onPrepareSnapshot: (gw: GatewayDevice) => void;
}

export const FleetHealthMap: React.FC<FleetHealthMapProps> = ({
  gateways,
  selectedGateway,
  onSelectGateway,
  onPrepareSnapshot,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | DeviceHealthStatus>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'map' | 'table'>('map');

  const districts = Array.from(new Set(gateways.map((g) => g.district)));

  const filteredGateways = gateways.filter((gw) => {
    if (statusFilter !== 'all' && gw.status !== statusFilter) return false;
    if (districtFilter !== 'all' && gw.district !== districtFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        gw.locationName.toLowerCase().includes(q) ||
        gw.residentName.toLowerCase().includes(q) ||
        gw.gatewayCode.toLowerCase().includes(q) ||
        gw.ipAddress.includes(q);
      if (!match) return false;
    }
    return true;
  });

  const optimalCount = gateways.filter((g) => g.status === 'optimal').length;
  const warningCount = gateways.filter((g) => g.status === 'warning').length;
  const criticalCount = gateways.filter((g) => g.status === 'critical').length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 mb-6">
      {/* Header and status summary pills */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
              <Server className="h-4 w-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900">Sentralisert Helsekart & Flåteoversikt</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Sanntidsstatus på kommunens velferdsteknologiske noder og smarthus-gateways.
          </p>
        </div>

        {/* Status badges count */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setStatusFilter(statusFilter === 'optimal' ? 'all' : 'optimal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              statusFilter === 'optimal'
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Optimal: {optimalCount}</span>
          </button>

          <button
            onClick={() => setStatusFilter(statusFilter === 'warning' ? 'all' : 'warning')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              statusFilter === 'warning'
                ? 'bg-amber-600 text-white ring-2 ring-amber-300'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Advarsel: {warningCount}</span>
          </button>

          <button
            onClick={() => setStatusFilter(statusFilter === 'critical' ? 'all' : 'critical')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              statusFilter === 'critical'
                ? 'bg-rose-600 text-white ring-2 ring-rose-300'
                : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <XCircle className="h-3.5 w-3.5" />
            <span>Kritisk: {criticalCount}</span>
          </button>
        </div>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 my-4">
        <div className="relative w-full sm:w-72">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="fleet-search-input"
            type="text"
            placeholder="Søk bolig, beboer, IP eller kode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="text-xs py-1.5 px-3 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Alle bydeler / soner</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-100 text-xs">
            <button
              onClick={() => setActiveTab('map')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                activeTab === 'map' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Helsekart
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                activeTab === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Enhetsliste
            </button>
          </div>
        </div>
      </div>

      {/* Main visual view: either interactive visual schematic map or structured table */}
      {activeTab === 'map' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Schematic visual map representing municipal welfare residential zones */}
          <div className="lg:col-span-2 bg-slate-900 text-white rounded-xl p-5 relative overflow-hidden border border-slate-800 min-h-[380px] flex flex-col justify-between">
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                  Topologisk Kommunekart • Oslo / Viken Velferdsnettverk
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                MQTT / WireGuard Mesh Aktiv
              </span>
            </div>

            {/* Simulated map nodes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-6 z-10">
              {filteredGateways.map((gw) => {
                const isSelected = selectedGateway?.id === gw.id;
                let statusColor = 'bg-emerald-500 text-emerald-300 border-emerald-400/40 shadow-emerald-950/50';
                let iconColor = 'text-emerald-400';
                let badgeText = 'Optimal';

                if (gw.status === 'warning') {
                  statusColor = 'bg-amber-500 text-amber-300 border-amber-400/40 shadow-amber-950/50';
                  iconColor = 'text-amber-400';
                  badgeText = 'Varsel';
                } else if (gw.status === 'critical') {
                  statusColor = 'bg-rose-500 text-rose-300 border-rose-400/40 shadow-rose-950/50 animate-pulse';
                  iconColor = 'text-rose-400';
                  badgeText = 'Kritisk';
                }

                return (
                  <button
                    key={gw.id}
                    onClick={() => onSelectGateway(gw)}
                    className={`text-left p-3.5 rounded-xl border transition-all relative ${
                      isSelected
                        ? 'bg-slate-800 ring-2 ring-indigo-400 border-indigo-500 shadow-lg'
                        : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">{gw.district}</span>
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          gw.status === 'optimal'
                            ? 'bg-emerald-400 shadow-xs shadow-emerald-400'
                            : gw.status === 'warning'
                            ? 'bg-amber-400 shadow-xs shadow-amber-400'
                            : 'bg-rose-500 shadow-xs shadow-rose-500 animate-pulse'
                        }`}
                      />
                    </div>

                    <p className="text-sm font-bold text-white truncate">{gw.locationName}</p>
                    <p className="text-xs text-slate-300 truncate mt-0.5">{gw.residentName}</p>

                    <div className="mt-2.5 pt-2 border-t border-slate-700/70 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400">{gw.smart.storageType}</span>
                      <span className={iconColor}>{gw.smart.wearPercentage}% slitasje</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom status line */}
            <div className="flex items-center justify-between text-xs text-slate-400 z-10 pt-2 border-t border-slate-800">
              <span className="flex items-center gap-1.5">
                <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                99.98% Gateway Oppetid siste 30 dager
              </span>
              <span>Klikk på en enhet for telemetri & gjenoppretting</span>
            </div>

            {/* Background subtle mesh grid pattern */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />
          </div>

          {/* Detailed Gateway Inspector panel */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col justify-between">
            {selectedGateway ? (
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Valgt gateway</span>
                    <h3 className="text-base font-bold text-slate-900">{selectedGateway.locationName}</h3>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs font-bold rounded ${
                      selectedGateway.status === 'optimal'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedGateway.status === 'warning'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {selectedGateway.status.toUpperCase()}
                  </span>
                </div>

                {/* Gateway tech specs */}
                <div className="space-y-2 mt-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Beboer / Alder:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedGateway.residentName} ({selectedGateway.residentAge} år)
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Adresse:</span>
                    <span className="font-medium text-slate-700">{selectedGateway.unitAddress}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Lokal IP / Nett:</span>
                    <span className="font-mono text-slate-800">{selectedGateway.ipAddress}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">OS & Versjon:</span>
                    <span className="font-medium text-slate-800">{selectedGateway.haVersion}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Oppetid:</span>
                    <span className="font-medium text-slate-800">{selectedGateway.uptimeDays} sammenhengende dager</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Siste sky-snapshot:</span>
                    <span className="font-semibold text-indigo-700">{selectedGateway.lastBackupSnapshot}</span>
                  </div>
                </div>

                {/* Connected sensors health list */}
                <div className="mt-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Tilkoblede sensorer ({selectedGateway.linkedSensors.length})</span>
                    <span className="text-[10px] text-slate-500 font-normal">Zigbee / Z-Wave / BLE</span>
                  </h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {selectedGateway.linkedSensors.map((s, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg text-xs flex items-center justify-between border ${
                          s.status === 'offline'
                            ? 'bg-rose-50 border-rose-200 text-rose-800'
                            : s.status === 'warning'
                            ? 'bg-amber-50 border-amber-200 text-amber-800'
                            : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="font-semibold truncate">{s.name}</p>
                          <p className="text-[10px] text-slate-500">{s.lastPing}</p>
                        </div>
                        <div className="text-right whitespace-nowrap">
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                              s.status === 'offline'
                                ? 'bg-rose-600 text-white'
                                : s.status === 'warning'
                                ? 'bg-amber-500 text-white'
                                : 'bg-emerald-600 text-white'
                            }`}
                          >
                            {s.status}
                          </span>
                          <span className="block text-[10px] text-slate-500 mt-0.5">Batt: {s.batteryPct}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Direct Action */}
                <div className="mt-4 pt-3 border-t border-slate-200">
                  <button
                    id="btn-prepare-snapshot"
                    onClick={() => onPrepareSnapshot(selectedGateway)}
                    className="w-full py-2 px-3 rounded-lg bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2 shadow-xs"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Gjenopprett / Klargjør erstatningsenhet</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-64 text-slate-400">
                <Server className="h-8 w-8 mb-2 stroke-1" />
                <p className="text-xs">Velg en gateway fra kartet eller listen for å inspisere telemetri og backup-status.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Detailed Fleet Table */
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-800 uppercase font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Gateway & Beboer</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Bydel</th>
                <th className="py-2.5 px-3">Lagringsmedium</th>
                <th className="py-2.5 px-3">SMART Slitasje</th>
                <th className="py-2.5 px-3">Siste Snapshot</th>
                <th className="py-2.5 px-3 text-right">Handling</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredGateways.map((gw) => (
                <tr
                  key={gw.id}
                  onClick={() => onSelectGateway(gw)}
                  className={`cursor-pointer hover:bg-slate-50 transition-colors ${
                    selectedGateway?.id === gw.id ? 'bg-indigo-50/50' : ''
                  }`}
                >
                  <td className="py-2.5 px-3">
                    <p className="font-bold text-slate-900">{gw.locationName}</p>
                    <p className="text-[11px] text-slate-500">
                      {gw.residentName} • {gw.gatewayCode}
                    </p>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                        gw.status === 'optimal'
                          ? 'bg-emerald-100 text-emerald-800'
                          : gw.status === 'warning'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {gw.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">{gw.district}</td>
                  <td className="py-2.5 px-3 font-mono">{gw.smart.storageType}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            gw.smart.wearPercentage > 85
                              ? 'bg-rose-600'
                              : gw.smart.wearPercentage > 60
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${gw.smart.wearPercentage}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-[11px]">{gw.smart.wearPercentage}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{gw.lastBackupSnapshot}</td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPrepareSnapshot(gw);
                      }}
                      className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 border border-indigo-200"
                    >
                      Klargjør
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
