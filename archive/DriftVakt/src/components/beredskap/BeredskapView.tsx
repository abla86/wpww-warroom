import React, { useState } from 'react';
import { CarePlanConsequence, IncidentReport } from '../../types';
import { ConsequenceAnalysisCard } from './ConsequenceAnalysisCard';
import { DigitalFirefightingChecklist } from './DigitalFirefightingChecklist';
import { IncidentLogReporting } from './IncidentLogReporting';
import { HeartPulse, Users, ShieldCheck, PhoneCall, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface BeredskapViewProps {
  carePlans: CarePlanConsequence[];
  incidents: IncidentReport[];
  onToggleChecklistItem: (carePlanId: string, itemId: string) => void;
  onAddIncident: (report: Omit<IncidentReport, 'id' | 'timestamp'>) => void;
}

export const BeredskapView: React.FC<BeredskapViewProps> = ({
  carePlans,
  incidents,
  onToggleChecklistItem,
  onAddIncident,
}) => {
  const [selectedCarePlanId, setSelectedCarePlanId] = useState<string>(carePlans[0]?.id || '');
  const selectedCarePlan = carePlans.find((c) => c.id === selectedCarePlanId) || carePlans[0];

  const handleReportIncidentQuick = (cp: CarePlanConsequence) => {
    onAddIncident({
      residentName: cp.residentName,
      unit: cp.roomOrUnit,
      issueType: `Teknisk feil rapportert: ${cp.failingComponent}`,
      reportedBy: 'Sykepleier Maria Lund',
      status: 'Teknisk vakt på vei',
      details: `Fallback-rutine igangsatt. Fysisk tilsyn gjennomført. Avvik registrert for vaktlaget.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner introducing App 2 */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-sm border border-teal-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                APP 2: BEREDSKAP & RUTINE
              </span>
              <span className="text-teal-200 text-xs font-medium">• For Hjemmetjenesten & Helsepersonell på Vakt</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1.5">
              Operativ Støtte & Klinisk Fallback ved Teknologisvikt
            </h1>
            <p className="text-xs sm:text-sm text-teal-100 max-w-3xl mt-1 leading-relaxed">
              Fjerner usikkerhet og stress når velferdsteknologi svikter. Kobler tekniske sensorfeil direkte til
              brukerens pleieplan og gir pleieren en trinnvis digital brannslukningsmeny for trygg og verdig omsorg.
            </p>
          </div>

          <div className="bg-teal-950/70 p-3.5 rounded-xl border border-teal-700/60 text-xs shrink-0 space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-teal-300 font-medium">Aktiv Vakt:</span>
              <span className="font-bold text-white">Sone Nord (Kveldsvakt)</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-teal-300 font-medium">Ansvarlig sykepleier:</span>
              <span className="font-medium text-white">Maria Lund (912 34 567)</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-teal-300 font-medium">Teknisk vakttelefon:</span>
              <span className="font-mono text-emerald-300 font-bold">21 80 21 80</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 1: Konsekvensanalyse ved feil (Teknisk feil -> Pleieplan) */}
      <ConsequenceAnalysisCard
        carePlans={carePlans}
        selectedCarePlanId={selectedCarePlanId}
        onSelectCarePlan={setSelectedCarePlanId}
        onOpenChecklist={(cp) => setSelectedCarePlanId(cp.id)}
      />

      {/* Feature 2: Digital brannslukningsmeny (Fallback-rutiner) */}
      {selectedCarePlan && (
        <DigitalFirefightingChecklist
          carePlan={selectedCarePlan}
          onToggleChecklistItem={onToggleChecklistItem}
          onReportIncidentQuick={handleReportIncidentQuick}
        />
      )}

      {/* Feature 3: Hendelseslogg for drift (Avverger dobbeltarbeid) */}
      <IncidentLogReporting
        incidents={incidents}
        onAddIncident={onAddIncident}
      />
    </div>
  );
};
