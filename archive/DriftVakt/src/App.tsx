/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppPerspective, GatewayDevice, CarePlanConsequence, IncidentReport, CloudSnapshot, RelativeActivityEvent } from './types';
import { initialGateways, initialCarePlans, initialIncidentReports, initialSnapshots, initialRelativeFeed } from './data/mockData';
import { Header } from './components/Header';
import { DriftVaktView } from './components/driftvakt/DriftVaktView';
import { BeredskapView } from './components/beredskap/BeredskapView';
import { TryggPaarorendeView } from './components/trygg/TryggPaarorendeView';
import { ScenarioSimulatorModal } from './components/ScenarioSimulatorModal';
import { ShieldCheck, HeartPulse, Server, Users, Info } from 'lucide-react';

export default function App() {
  const [currentPerspective, setCurrentPerspective] = useState<AppPerspective>('driftvakt');
  const [gateways, setGateways] = useState<GatewayDevice[]>(initialGateways);
  const [carePlans, setCarePlans] = useState<CarePlanConsequence[]>(initialCarePlans);
  const [incidents, setIncidents] = useState<IncidentReport[]>(initialIncidentReports);
  const [snapshots, setSnapshots] = useState<CloudSnapshot[]>(initialSnapshots);
  const [relativeFeed, setRelativeFeed] = useState<RelativeActivityEvent[]>(initialRelativeFeed);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [systemAlertBanner, setSystemAlertBanner] = useState<string | null>(null);

  // Active critical count across the fleet
  const activeCriticalAlertsCount = gateways.filter((g) => g.status === 'critical').length;
  const isGw104Healthy = gateways.find((g) => g.id === 'gw-104')?.status !== 'critical';

  // Handler: Restore/provision gateway from cloud snapshot to new hardware
  const handleRestoreGateway = (gatewayId: string) => {
    setGateways((prev) =>
      prev.map((gw) => {
        if (gw.id === gatewayId) {
          return {
            ...gw,
            status: 'optimal',
            smart: {
              ...gw.smart,
              wearPercentage: 3,
              storageType: 'NVMe SSD',
              expectedLifeRemainingDays: 2800,
              dbFragmentation: 4,
              iopsLoad: 42,
              temperatureC: 39,
            },
            recommendedAction: 'Optimal tilstand. Oppgradert til industriell NVMe SSD med kontinuerlig sky-synkronisering.',
            linkedSensors: gw.linkedSensors.map((s) => ({
              ...s,
              status: 'online',
              lastPing: 'Akkurat nå (Verifisert)',
            })),
          };
        }
        return gw;
      })
    );

    // Also update the care plan if it was linked
    setCarePlans((prev) =>
      prev.map((cp) => {
        if (cp.gatewayId === gatewayId) {
          return {
            ...cp,
            riskSeverity: 'moderat',
            consequenceSummary: 'Erstatningsgateway provisjonert med NVMe SSD. Alle sensorer er tilbake online. Normal fallovervåking gjenopprettet.',
            failingComponent: 'Ingen feil (System gjenopprettet)',
            failingReason: 'Maskinvare byttet og nyeste sky-snapshot rullet ut.',
            fallbackChecklist: cp.fallbackChecklist.map((c) => ({
              ...c,
              completed: true,
              completedAt: 'Nettopp',
              completedBy: 'DriftVakt Auto-Restore',
            })),
          };
        }
        return cp;
      })
    );

    // Add entry to incident log
    const restoredGw = gateways.find((g) => g.id === gatewayId);
    setIncidents((prev) => [
      {
        id: `inc-${Date.now()}`,
        timestamp: 'Akkurat nå',
        residentName: restoredGw?.residentName || 'Per Hansen',
        unit: restoredGw?.locationName || 'Bolig 104',
        issueType: 'Erstatningsnode med NVMe SSD klargjort og satt i drift',
        reportedBy: 'Kommunal IT / DriftVakt ZTP',
        status: 'Utbedret',
        details: 'Home Assistant snapshot rullet ut på under 3 minutter. Full Zigbee sensor-mesh gjenopprettet uten re-paring.',
      },
      ...prev,
    ]);

    setSystemAlertBanner('✓ Maskinvare gjenopprettet: Ny NVMe SSD installert og i drift for Bolig 104.');
    setTimeout(() => setSystemAlertBanner(null), 5000);
  };

  // Handler: Create instant snapshot
  const handleCreateSnapshot = (gatewayId: string) => {
    const targetGw = gateways.find((g) => g.id === gatewayId) || gateways[0];
    const newSnap: CloudSnapshot = {
      id: `snap-${Date.now()}`,
      gatewayId: targetGw.id,
      locationName: targetGw.locationName,
      createdAt: 'Nettopp (Manuell sikkerhetskopi)',
      sizeMB: targetGw.backupSizeMB || 450,
      haVersion: targetGw.haVersion,
      sha256: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
      includedModules: ['Zigbee-nettverk', 'Home Assistant DB', 'Kritiske Alarmer'],
      status: 'Validert',
    };

    setSnapshots((prev) => [newSnap, ...prev]);
    setSystemAlertBanner(`✓ Nytt sky-snapshot opprettet for ${targetGw.locationName}. Validert og kryptert.`);
    setTimeout(() => setSystemAlertBanner(null), 4000);
  };

  // Handler: Toggle checklist in Beredskap
  const handleToggleChecklistItem = (carePlanId: string, itemId: string) => {
    setCarePlans((prev) =>
      prev.map((cp) => {
        if (cp.id === carePlanId) {
          return {
            ...cp,
            fallbackChecklist: cp.fallbackChecklist.map((item) => {
              if (item.id === itemId) {
                const willComplete = !item.completed;
                return {
                  ...item,
                  completed: willComplete,
                  completedAt: willComplete ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
                  completedBy: willComplete ? 'Sykepleier Maria' : undefined,
                };
              }
              return item;
            }),
          };
        }
        return cp;
      })
    );
  };

  // Handler: Add incident from Beredskap
  const handleAddIncident = (newIncident: Omit<IncidentReport, 'id' | 'timestamp'>) => {
    const report: IncidentReport = {
      ...newIncident,
      id: `inc-${Date.now()}`,
      timestamp: `I dag kl. ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    };
    setIncidents((prev) => [report, ...prev]);
    setSystemAlertBanner(`✓ Hendelse loggført i vaktjournalen for ${report.residentName}.`);
    setTimeout(() => setSystemAlertBanner(null), 4000);
  };

  // Simulator scenarios
  const handleTriggerFailureScenario = () => {
    setGateways((prev) =>
      prev.map((g) => {
        if (g.id === 'gw-104') {
          return {
            ...g,
            status: 'critical',
            smart: {
              ...g.smart,
              wearPercentage: 97,
              storageType: 'MicroSD',
              expectedLifeRemainingDays: 4,
              iopsLoad: 420,
            },
            recommendedAction: 'MicroSD-kort i Bolig 104 er i ferd med å gå i skrivebeskyttet feilmodus. Umiddelbar migrasjon påkrevd!',
            linkedSensors: g.linkedSensors.map((s, idx) =>
              idx === 0 ? { ...s, status: 'offline', lastPing: 'Falt ut nettopp' } : s
            ),
          };
        }
        return g;
      })
    );

    setCarePlans((prev) =>
      prev.map((cp) => {
        if (cp.gatewayId === 'gw-104') {
          return {
            ...cp,
            riskSeverity: 'kritisk',
            failingComponent: 'Fall-radar (Soverom) & Gateway I/O-feil',
            offlineSince: 'Nettopp (Nettverksbrudd etter I/O heng)',
          };
        }
        return cp;
      })
    );

    setSystemAlertBanner('⚠️ Simulering: MicroSD-slitasje og fall-radar brudd utløst i Bolig 104.');
    setTimeout(() => setSystemAlertBanner(null), 6000);
  };

  const handleTriggerRecoveryScenario = () => {
    handleRestoreGateway('gw-104');
  };

  const handleTriggerMorningRoutine = () => {
    const newPulse: RelativeActivityEvent = {
      id: `rel-${Date.now()}`,
      timeStr: `Nettopp kl. ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      category: 'dag',
      iconType: 'coffee',
      message: 'Kjøkkenet og kaffetrakteren er i trygg bruk',
      detail: 'Det er registrert rolige, kjente hverdagsbevegelser i leiligheten. Ingen avvik.',
      status: 'normal',
    };
    setRelativeFeed((prev) => [newPulse, ...prev]);
    setSystemAlertBanner('✓ Ny hverdagsaktivitets-puls generert for pårørende uten kameraovervåking.');
    setTimeout(() => setSystemAlertBanner(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header with App Switcher and Simulator launch */}
      <Header
        currentPerspective={currentPerspective}
        onSelectPerspective={setCurrentPerspective}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        activeCriticalAlertsCount={activeCriticalAlertsCount}
      />

      {/* Ephemeral Alert Feedback banner */}
      {systemAlertBanner && (
        <div className="bg-slate-900 text-white px-4 py-2 text-xs text-center border-b border-slate-800 flex items-center justify-center space-x-2 animate-in fade-in">
          <Info className="h-4 w-4 text-emerald-400" />
          <span>{systemAlertBanner}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentPerspective === 'driftvakt' && (
          <DriftVaktView
            gateways={gateways}
            snapshots={snapshots}
            onRestoreGateway={handleRestoreGateway}
            onCreateSnapshot={handleCreateSnapshot}
            onInitiateMigration={(gw) => {
              handleCreateSnapshot(gw.id);
              handleRestoreGateway(gw.id);
            }}
          />
        )}

        {currentPerspective === 'beredskap' && (
          <BeredskapView
            carePlans={carePlans}
            incidents={incidents}
            onToggleChecklistItem={handleToggleChecklistItem}
            onAddIncident={handleAddIncident}
          />
        )}

        {currentPerspective === 'trygg' && (
          <TryggPaarorendeView
            feed={relativeFeed}
            residentName="Per Hansen"
            isGatewayHealthy={isGw104Healthy}
            onSendTestNotification={() => {
              setSystemAlertBanner('🔔 Testvarsel sendt via simulert APNS/FCM til pårørendes mobiltelefon.');
              setTimeout(() => setSystemAlertBanner(null), 4000);
            }}
          />
        )}
      </main>

      {/* Footer explaining the 3-app municipal ecosystem */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-slate-900">VelferdsVakt</span>
            <span>•</span>
            <span>Kommunalt velferdsteknologi-rammeverk</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-600">
            <span className="flex items-center gap-1">
              <Server className="h-3.5 w-3.5 text-indigo-600" />
              <strong>DriftVakt:</strong> SMART & Sky-Snapshots
            </span>
            <span className="flex items-center gap-1">
              <HeartPulse className="h-3.5 w-3.5 text-teal-600" />
              <strong>Beredskap & Rutine:</strong> Pleieplan & Fallback
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-sky-600" />
              <strong>TryggPårørende:</strong> Innsikt Uten Kamera
            </span>
          </div>
        </div>
      </footer>

      {/* Scenario Simulator Modal */}
      <ScenarioSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onTriggerFailureScenario={handleTriggerFailureScenario}
        onTriggerRecoveryScenario={handleTriggerRecoveryScenario}
        onTriggerMorningRoutineScenario={handleTriggerMorningRoutine}
      />
    </div>
  );
}
