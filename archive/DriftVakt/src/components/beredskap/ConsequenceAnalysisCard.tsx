import React from 'react';
import { CarePlanConsequence } from '../../types';
import { AlertOctagon, HeartPulse, User, Clock, Phone, ArrowRight, ShieldAlert, CheckCircle2, ChevronRight } from 'lucide-react';

interface ConsequenceAnalysisCardProps {
  carePlans: CarePlanConsequence[];
  selectedCarePlanId: string;
  onSelectCarePlan: (id: string) => void;
  onOpenChecklist: (cp: CarePlanConsequence) => void;
}

export const ConsequenceAnalysisCard: React.FC<ConsequenceAnalysisCardProps> = ({
  carePlans,
  selectedCarePlanId,
  onSelectCarePlan,
  onOpenChecklist,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
              <HeartPulse className="h-4 w-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900">
              Konsekvensanalyse: Teknisk Feil → Pleieplan
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Oversetter umiddelbart maskinvare- og sensorfeil til hva det konkret betyr for den enkelte bruker og pleieruta.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
            {carePlans.filter((c) => c.riskSeverity === 'kritisk').length} beboer med akutt pleierisiko
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {carePlans.map((cp) => {
          const isSelected = selectedCarePlanId === cp.id;
          const isCritical = cp.riskSeverity === 'kritisk';

          return (
            <div
              key={cp.id}
              onClick={() => onSelectCarePlan(cp.id)}
              className={`rounded-xl border p-4 cursor-pointer transition-all ${
                isCritical
                  ? isSelected
                    ? 'bg-rose-50/70 border-rose-400 ring-2 ring-rose-300 shadow-md'
                    : 'bg-rose-50/40 border-rose-300 hover:border-rose-400'
                  : isSelected
                  ? 'bg-amber-50/60 border-amber-400 ring-2 ring-amber-300 shadow-md'
                  : 'bg-amber-50/20 border-amber-200 hover:border-amber-300'
              }`}
            >
              {/* Header with Resident name and severity */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-bold text-slate-900">{cp.residentName}</span>
                    <span className="text-xs font-medium text-slate-500">({cp.residentAge} år)</span>
                  </div>
                  <p className="text-xs text-slate-600">{cp.roomOrUnit} • {cp.address}</p>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    isCritical ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                  }`}
                >
                  {isCritical ? 'AKUTT PLEIERISIKO' : 'MODERAT TILSYN'}
                </span>
              </div>

              {/* Technical failure banner */}
              <div className="mt-3 p-2.5 rounded-lg bg-white/90 border border-rose-200/80 text-xs">
                <div className="flex items-center justify-between font-bold text-rose-900">
                  <span className="flex items-center gap-1.5">
                    <AlertOctagon className="h-3.5 w-3.5 text-rose-600" />
                    {cp.failingComponent}
                  </span>
                  <span className="text-[11px] font-mono text-rose-700 font-normal">{cp.offlineSince}</span>
                </div>
                <p className="text-slate-600 mt-1 text-[11px]">{cp.failingReason}</p>
              </div>

              {/* Clinical Care Plan Translation */}
              <div className="mt-3 space-y-2 text-xs">
                <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/70">
                  <p className="text-[10px] font-mono uppercase font-bold text-slate-500">
                    Brukers diagnose & risikoprofil:
                  </p>
                  <p className="font-semibold text-slate-800 mt-0.5">{cp.carePlanDiagnosis}</p>
                </div>

                <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/70">
                  <p className="text-[10px] font-mono uppercase font-bold text-rose-600">
                    Konsekvens for pleie & sikkerhet:
                  </p>
                  <p className="text-slate-700 mt-0.5 font-medium leading-relaxed">{cp.consequenceSummary}</p>
                </div>

                <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-900">
                  <p className="text-[10px] font-mono uppercase font-bold text-teal-700">
                    Påkrevd operativt tiltak:
                  </p>
                  <p className="font-bold text-xs mt-0.5">{cp.recommendedCareAction}</p>
                  <p className="text-[11px] text-teal-800 mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Fast tilsynsintervall: <strong>{cp.supervisionInterval}</strong>
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 pt-2 border-t border-slate-200/80 flex items-center justify-between">
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Phone className="h-3 w-3 text-slate-400" />
                  <span>Ansvarlig pleier: {cp.primaryNurse}</span>
                </div>

                <button
                  id={`btn-open-checklist-${cp.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenChecklist(cp);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 font-bold text-xs flex items-center space-x-1 shadow-xs"
                >
                  <span>Åpne Brannslukningsmeny</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
