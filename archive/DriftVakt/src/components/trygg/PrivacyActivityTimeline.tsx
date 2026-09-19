import React from 'react';
import { RelativeActivityEvent } from '../../types';
import { Sun, Coffee, Footprints, Moon, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';

interface PrivacyActivityTimelineProps {
  feed: RelativeActivityEvent[];
  residentName: string;
}

export const PrivacyActivityTimeline: React.FC<PrivacyActivityTimelineProps> = ({ feed, residentName }) => {
  const getIcon = (type: RelativeActivityEvent['iconType']) => {
    switch (type) {
      case 'sun':
        return <Sun className="h-4 w-4 text-amber-500" />;
      case 'coffee':
        return <Coffee className="h-4 w-4 text-amber-700" />;
      case 'walk':
        return <Footprints className="h-4 w-4 text-sky-600" />;
      case 'moon':
        return <Moon className="h-4 w-4 text-indigo-600" />;
      case 'check':
      default:
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
      {/* Privacy guarantee banner */}
      <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-sky-50/70 border border-sky-200/60 mb-5">
        <ShieldCheck className="h-5 w-5 text-sky-600 shrink-0" />
        <div className="text-xs text-sky-900">
          <span className="font-bold">Aktivitetsindikator uten overvåking:</span> Ingen kameraer eller mikrofoner.
          Systemet analyserer kun diskrete bevegelses- og dørmønstre for å bekrefte trygg hverdagsrytme.
        </div>
      </div>

      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Hverdagsrytme for {residentName}</h3>
          <p className="text-xs text-slate-500">Oppdaterte og trygge rutine-observasjoner for i dag</p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Normal døgnrytme
        </span>
      </div>

      {/* Discrete chronological activity cards */}
      <div className="space-y-3">
        {feed.map((event) => (
          <div
            key={event.id}
            className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-start space-x-3.5"
          >
            <div className="p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs mt-0.5">
              {getIcon(event.iconType)}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-900">{event.message}</p>
                <span className="text-[11px] font-mono text-slate-500">{event.timeStr}</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{event.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Reassuring summary footer */}
      <div className="mt-5 p-3 rounded-xl bg-slate-100/70 text-xs text-slate-600 text-center flex items-center justify-center space-x-2">
        <Heart className="h-3.5 w-3.5 text-rose-500" />
        <span>Trygghet i hverdagen: Mor/far opprettholder sin vanlige døgnrytme i eget hjem.</span>
      </div>
    </div>
  );
};
