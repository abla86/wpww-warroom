import React, { useState } from 'react';
import { CarePlanConsequence } from '../../types';
import { Flame, CheckCircle2, Circle, Phone, ShieldCheck, FileText, ArrowRight, UserCheck, AlertTriangle } from 'lucide-react';

interface DigitalFirefightingChecklistProps {
  carePlan: CarePlanConsequence;
  onToggleChecklistItem: (carePlanId: string, itemId: string) => void;
  onReportIncidentQuick: (carePlan: CarePlanConsequence) => void;
}

export const DigitalFirefightingChecklist: React.FC<DigitalFirefightingChecklistProps> = ({
  carePlan,
  onToggleChecklistItem,
  onReportIncidentQuick,
}) => {
  const [nurseName, setNurseName] = useState('Sykepleier Maria Lund');
  const [calledTech, setCalledTech] = useState(false);

  const completedCount = carePlan.fallbackChecklist.filter((c) => c.completed).length;
  const totalCount = carePlan.fallbackChecklist.length;
  const isAllComplete = completedCount === totalCount;

  return (
    <div className="bg-white rounded-xl border border-teal-200 shadow-sm p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-teal-100 text-teal-800 border border-teal-300">
              <Flame className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Digital Brannslukningsmeny (Fallback-rutiner)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Trinnvis beredskapsprotokoll for <strong className="text-slate-800">{carePlan.residentName}</strong> ({carePlan.roomOrUnit}).
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${
              isAllComplete
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}
          >
            {completedCount} av {totalCount} tiltak kvittert
          </span>
        </div>
      </div>

      {/* Checklist items */}
      <div className="mt-4 space-y-3">
        {carePlan.fallbackChecklist.map((item, index) => (
          <div
            key={item.id}
            onClick={() => onToggleChecklistItem(carePlan.id, item.id)}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
              item.completed
                ? 'bg-emerald-50/50 border-emerald-300 text-slate-700'
                : 'bg-slate-50 hover:bg-teal-50/40 border-slate-200 text-slate-900'
            }`}
          >
            <div className="mt-0.5">
              {item.completed ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-slate-400 shrink-0" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">Trinn {index + 1}</span>
                {item.completed && item.completedAt && (
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                    Kvittert kl. {item.completedAt} {item.completedBy ? `av ${item.completedBy}` : ''}
                  </span>
                )}
              </div>
              <p
                className={`text-xs mt-1 leading-relaxed font-medium ${
                  item.completed ? 'line-through text-slate-500' : 'text-slate-900'
                }`}
              >
                {item.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Rapid action bar for carers on shift */}
      <div className="mt-5 pt-4 border-t border-slate-100 bg-slate-50 -mx-5 -mb-5 p-5 rounded-b-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setCalledTech(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 border transition-all ${
                calledTech
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <Phone className="h-3.5 w-3.5 text-indigo-600" />
              <span>{calledTech ? 'Kommunal IT-vakt tilkalt (21 80 21 80)' : 'Ring Teknisk Vakt'}</span>
            </button>

            <button
              onClick={() => onReportIncidentQuick(carePlan)}
              className="px-3 py-1.5 rounded-lg bg-white text-teal-800 border border-teal-300 hover:bg-teal-50 text-xs font-bold flex items-center space-x-1.5"
            >
              <FileText className="h-3.5 w-3.5 text-teal-600" />
              <span>Loggfør avvik for skiftet</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <UserCheck className="h-4 w-4 text-emerald-600" />
            <span>Aktiv pleier: <strong>{nurseName}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
