import React from 'react';
import { AppPerspective } from '../types';
import { Server, HeartPulse, Users, ShieldAlert, Sparkles, Activity } from 'lucide-react';

interface HeaderProps {
  currentPerspective: AppPerspective;
  onSelectPerspective: (p: AppPerspective) => void;
  onOpenSimulator: () => void;
  activeCriticalAlertsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentPerspective,
  onSelectPerspective,
  onOpenSimulator,
  activeCriticalAlertsCount,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top utility row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-sm">
              <Activity className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-slate-900">VelferdsVakt</span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Kommunal Plattform
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Tredelt økosystem for trygg og forutsigbar velferdsteknologi
              </p>
            </div>
          </div>

          {/* Quick simulator trigger & municipal badge */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              id="open-simulator-btn"
              onClick={onOpenSimulator}
              className="inline-flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition-colors shadow-xs"
              title="Test hvordan hendelser forplanter seg mellom IT, hjemmetjeneste og pårørende"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span>Simuler driftsscenario</span>
              {activeCriticalAlertsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white animate-pulse">
                  {activeCriticalAlertsCount}
                </span>
              )}
            </button>

            <div className="hidden lg:flex items-center space-x-2 pl-3 border-l border-slate-200 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>1 428 aktive gateways</span>
            </div>
          </div>
        </div>

        {/* Perspective / App Switcher Tabs */}
        <div className="flex border-t border-slate-100 -mb-px space-x-1 sm:space-x-4 overflow-x-auto py-1">
          <button
            id="tab-driftvakt"
            onClick={() => onSelectPerspective('driftvakt')}
            className={`flex items-center space-x-2 py-3 px-3.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              currentPerspective === 'driftvakt'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Server className={`h-4 w-4 ${currentPerspective === 'driftvakt' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>App 1: DriftVakt</span>
            <span className="hidden md:inline text-xs font-normal text-slate-500">(IT & teknisk drift)</span>
            {activeCriticalAlertsCount > 0 && (
              <span className="px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-rose-100 text-rose-700">
                1 kritisk
              </span>
            )}
          </button>

          <button
            id="tab-beredskap"
            onClick={() => onSelectPerspective('beredskap')}
            className={`flex items-center space-x-2 py-3 px-3.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              currentPerspective === 'beredskap'
                ? 'border-teal-600 text-teal-700 bg-teal-50/40 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <HeartPulse className={`h-4 w-4 ${currentPerspective === 'beredskap' ? 'text-teal-600' : 'text-slate-400'}`} />
            <span>App 2: Beredskap & Rutine</span>
            <span className="hidden md:inline text-xs font-normal text-slate-500">(Hjemmetjenesten)</span>
            <span className="px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-amber-100 text-amber-800">
              1 tiltak
            </span>
          </button>

          <button
            id="tab-trygg"
            onClick={() => onSelectPerspective('trygg')}
            className={`flex items-center space-x-2 py-3 px-3.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              currentPerspective === 'trygg'
                ? 'border-sky-600 text-sky-700 bg-sky-50/40 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Users className={`h-4 w-4 ${currentPerspective === 'trygg' ? 'text-sky-600' : 'text-slate-400'}`} />
            <span>App 3: TryggPårørende</span>
            <span className="hidden md:inline text-xs font-normal text-slate-500">(Familie & pårørende)</span>
            <span className="px-1.5 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-100 text-emerald-800">
              Mor & Far
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
