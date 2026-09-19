import React, { useState } from 'react';
import { Bell, BellOff, ShieldAlert, Phone, Smartphone, CheckCircle2, Sparkles, Heart } from 'lucide-react';

interface SafetyValveAlertSettingsProps {
  residentName: string;
  onSendTestNotification: () => void;
}

export const SafetyValveAlertSettings: React.FC<SafetyValveAlertSettingsProps> = ({
  residentName,
  onSendTestNotification,
}) => {
  const [testSent, setTestSent] = useState(false);
  const [phoneDialed, setPhoneDialed] = useState(false);

  const handleTestClick = () => {
    setTestSent(true);
    onSendTestNotification();
    setTimeout(() => setTestSent(false), 4000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
              <Bell className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Sikkerhetsventil for Varsling
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Kun direkte varsler ved reelle, kritiske hendelser. Du skjermes for teknisk støy.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-100 text-sky-800">
            Push-varsling Aktiv
          </span>
        </div>
      </div>

      {/* Rules breakdown: What is alerted vs filtered */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
          <div className="flex items-center space-x-2 text-emerald-900 font-bold mb-2">
            <Bell className="h-4 w-4 text-emerald-600" />
            <span>Du blir varslet direkte ved:</span>
          </div>
          <ul className="space-y-1.5 text-slate-700">
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Trygghetsalarm fysisk utløst i boligen</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Verifisert fall eller nattvandring ut av bolig</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Uvanlig avvik over tid (f.eks. ingen aktivitet innen kl. 10:30)</span>
            </li>
          </ul>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center space-x-2 text-slate-800 font-bold mb-2">
            <BellOff className="h-4 w-4 text-slate-500" />
            <span>Skjermet (Håndteres av IT DriftVakt):</span>
          </div>
          <ul className="space-y-1.5 text-slate-600">
            <li className="flex items-center space-x-2">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
              <span>Tekniske oppdateringer og firmware-patcher</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
              <span>MicroSD skriveslitasje og bakgrunns-snapshots</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
              <span>Korte nettverksfall under 3 minutter</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          onClick={handleTestClick}
          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-sky-50 text-sky-800 border border-sky-300 hover:bg-sky-100 font-bold text-xs flex items-center justify-center space-x-2 transition-colors"
        >
          <Smartphone className="h-4 w-4 text-sky-600" />
          <span>{testSent ? '✓ Testvarsel sendt til telefon!' : 'Test alarmmottak på din mobil'}</span>
        </button>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={() => setPhoneDialed(true)}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-colors"
          >
            <Phone className="h-4 w-4" />
            <span>{phoneDialed ? 'Ringer opp...' : `Ring ${residentName.split(' ')[0]}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
