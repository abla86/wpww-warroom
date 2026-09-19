import React, { useState } from 'react';
import { RelativeActivityEvent } from '../../types';
import { PrivacyActivityTimeline } from './PrivacyActivityTimeline';
import { CalmSystemHealthBadge } from './CalmSystemHealthBadge';
import { SafetyValveAlertSettings } from './SafetyValveAlertSettings';
import { Users, Heart, Phone, Sparkles, Bell, CheckCircle2 } from 'lucide-react';

interface TryggPaarorendeViewProps {
  feed: RelativeActivityEvent[];
  residentName: string;
  isGatewayHealthy: boolean;
  onSendTestNotification: () => void;
}

export const TryggPaarorendeView: React.FC<TryggPaarorendeViewProps> = ({
  feed,
  residentName,
  isGatewayHealthy,
  onSendTestNotification,
}) => {
  const [activeResident, setActiveResident] = useState<'per' | 'astrid'>('per');
  const [showNotificationToast, setShowNotificationToast] = useState(false);

  const handleTestAlert = () => {
    setShowNotificationToast(true);
    onSendTestNotification();
    setTimeout(() => {
      setShowNotificationToast(false);
    }, 4500);
  };

  const displayName = activeResident === 'per' ? 'Per Hansen' : 'Astrid Berg';
  const roleName = activeResident === 'per' ? 'Pappa' : 'Mamma';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Toast Notification Simulation */}
      {showNotificationToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-xl border border-slate-700 max-w-sm animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500 text-slate-950 font-bold">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">TryggPårørende Push-Varsel</p>
              <p className="text-sm font-bold text-white mt-0.5">Testvarsel: Forbindelse bekreftet</p>
              <p className="text-xs text-slate-300 mt-1">
                Din mobil er koblet til {roleName}s trygghetsløsning. Ved akutt alarm mottar du prioriterte push-varsler med lyd.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Banner introducing App 3 */}
      <div className="bg-gradient-to-r from-sky-900 to-slate-900 text-white rounded-2xl p-6 shadow-sm border border-sky-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                APP 3: TRYGGPÅRØRENDE
              </span>
              <span className="text-sky-200 text-xs font-medium">• For Familie & Pårørende</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1.5">
              Hverdagsro og Innsikt Uten Inngripende Overvåking
            </h1>
            <p className="text-xs sm:text-sm text-sky-100 max-w-2xl mt-1 leading-relaxed">
              Designet spesielt for voksne barn som vil vite at mor eller far har det trygt og godt. Ingen
              kameraer, ingen kompliserte smarthus-menyer – kun ro og trygghet.
            </p>
          </div>

          {/* Family member toggle */}
          <div className="bg-sky-950/80 p-1.5 rounded-xl border border-sky-700/60 flex items-center space-x-1 shrink-0">
            <button
              onClick={() => setActiveResident('per')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeResident === 'per' ? 'bg-sky-500 text-slate-950' : 'text-sky-200 hover:text-white'
              }`}
            >
              Pappa (Per)
            </button>
            <button
              onClick={() => setActiveResident('astrid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeResident === 'astrid' ? 'bg-sky-500 text-slate-950' : 'text-sky-200 hover:text-white'
              }`}
            >
              Mamma (Astrid)
            </button>
          </div>
        </div>
      </div>

      {/* Feature 2: Systemets Helsestatus (Beroligende indikator) */}
      <CalmSystemHealthBadge
        isGatewayHealthy={isGatewayHealthy}
        residentName={displayName}
      />

      {/* Feature 1: Aktivitetsindikator uten overvåking */}
      <PrivacyActivityTimeline
        feed={feed}
        residentName={displayName}
      />

      {/* Feature 3: Sikkerhetsventil for varsling */}
      <SafetyValveAlertSettings
        residentName={displayName}
        onSendTestNotification={handleTestAlert}
      />
    </div>
  );
};
