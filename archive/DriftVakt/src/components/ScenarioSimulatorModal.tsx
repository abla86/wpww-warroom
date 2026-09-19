import React from 'react';
import { Sparkles, X, AlertTriangle, RefreshCw, Coffee, ShieldCheck, HeartPulse, Server, Users } from 'lucide-react';

interface ScenarioSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerFailureScenario: () => void;
  onTriggerRecoveryScenario: () => void;
  onTriggerMorningRoutineScenario: () => void;
}

export const ScenarioSimulatorModal: React.FC<ScenarioSimulatorModalProps> = ({
  isOpen,
  onClose,
  onTriggerFailureScenario,
  onTriggerRecoveryScenario,
  onTriggerMorningRoutineScenario,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-amber-500 text-slate-950">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Scenario- og Samhandlingssimulator</h3>
              <p className="text-xs text-slate-300">
                Se hvordan hendelser koordineres i sanntid på tvers av IT, helse og pårørende
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Velg et scenario under for å simulere en situasjon i kommunen. Observer hvordan data flyter mellom
            <strong> DriftVakt</strong> (maskinvare), <strong>Beredskap & Rutine</strong> (pleieplan) og
            <strong> TryggPårørende</strong> (skjerming av familie).
          </p>

          <div className="space-y-3">
            {/* Scenario 1 */}
            <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 transition-colors flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5 text-rose-800 font-bold">
                  <AlertTriangle className="h-4 w-4 text-rose-600" />
                  <span>Scenario 1: MicroSD I/O-heng og fall-sensor brudd</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Bolig 104 overskrider skrive-TBW (94% slitasje). DriftVakt varsler prediktivt. Beredskap & Rutine
                  får akutt pleiekonsekvens for Per Hansen.
                </p>
              </div>
              <button
                onClick={() => {
                  onTriggerFailureScenario();
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 shadow-xs"
              >
                Kjør feilscenario
              </button>
            </div>

            {/* Scenario 2 */}
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition-colors flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
                  <RefreshCw className="h-4 w-4 text-emerald-600" />
                  <span>Scenario 2: Sky-snapshot & Zero-Touch SSD-gjenoppretting</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  IT-teknikeren ruller ut sky-snapshot til en fersk NVMe-gateway på 2 minutter. Grønn status
                  gjenopprettes i hele økosystemet.
                </p>
              </div>
              <button
                onClick={() => {
                  onTriggerRecoveryScenario();
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 shadow-xs"
              >
                Gjenopprett system
              </button>
            </div>

            {/* Scenario 3 */}
            <div className="p-3.5 rounded-xl border border-sky-200 bg-sky-50/50 hover:bg-sky-50 transition-colors flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5 text-sky-800 font-bold">
                  <Coffee className="h-4 w-4 text-sky-600" />
                  <span>Scenario 3: Diskret morgenrytme-puls for pårørende</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Genererer en trygg, ikke-overvåkende statushendelse: «Per har laget kaffe og satt seg i lenestolen».
                  Trygghet uten kamera.
                </p>
              </div>
              <button
                onClick={() => {
                  onTriggerMorningRoutineScenario();
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shrink-0 shadow-xs"
              >
                Send aktivitetspuls
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-xs"
          >
            Lukk simulator
          </button>
        </div>
      </div>
    </div>
  );
};
