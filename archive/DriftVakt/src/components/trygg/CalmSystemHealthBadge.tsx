import React from 'react';
import { ShieldCheck, Wifi, BatteryCharging, CheckCircle, Clock } from 'lucide-react';

interface CalmSystemHealthBadgeProps {
  isGatewayHealthy: boolean;
  residentName: string;
}

export const CalmSystemHealthBadge: React.FC<CalmSystemHealthBadgeProps> = ({
  isGatewayHealthy,
  residentName,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
      <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
        <div
          className={`h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
            isGatewayHealthy ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
          }`}
        >
          <ShieldCheck className="h-9 w-9" />
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h3 className="text-lg font-bold text-slate-900">
              {isGatewayHealthy ? 'Systemet fungerer som det skal' : 'DriftVakt følger opp systemet'}
            </h3>
            <span
              className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                isGatewayHealthy ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isGatewayHealthy ? 'Alt i orden' : 'Under utbedring av teknisk vakt'}
            </span>
          </div>

          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {isGatewayHealthy
              ? `Hjemmesentralen hos ${residentName} er tilkoblet og oppdatert. Trygghetsalarm og sensorer er 100% operative.`
              : `Kommunal IT (DriftVakt) utfører forebyggende vedlikehold på gatewayen. Pleiepersonell har iverksatt fysisk tilsyn.`}
          </p>

          {/* Calm Checklist items */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center space-x-2 text-slate-700 bg-slate-50 p-2 rounded-lg">
              <Wifi className="h-4 w-4 text-emerald-600" />
              <span>Nettverk: <strong>Stabil 4G & Fiber</strong></span>
            </div>
            <div className="flex items-center space-x-2 text-slate-700 bg-slate-50 p-2 rounded-lg">
              <BatteryCharging className="h-4 w-4 text-emerald-600" />
              <span>Batterier: <strong>Gode (ingen bytte)</strong></span>
            </div>
            <div className="flex items-center space-x-2 text-slate-700 bg-slate-50 p-2 rounded-lg">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span>DriftVakt: <strong>Aktiv 24/7</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
