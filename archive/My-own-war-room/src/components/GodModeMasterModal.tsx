import React from 'react';
import {
  Crown,
  Zap,
  Shield,
  ShieldAlert,
  ShieldCheck,
  X,
  Sparkles,
  RefreshCw,
  Lock,
  Swords,
  Radio,
  Flame,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sliders
} from 'lucide-react';

export interface GodModeMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  isGodModeActive: boolean;
  onToggleGodMode: () => void;
  onTriggerEmp: () => void;
  onTriggerMirrorJamming: () => void;
  onTriggerQuantumLock: () => void;
  onClearBlacklist: () => void;
  onOpenArena: () => void;
  onOpenAdvancedConfig: () => void;
}

export const GodModeMasterModal: React.FC<GodModeMasterModalProps> = ({
  isOpen,
  onClose,
  isGodModeActive,
  onToggleGodMode,
  onTriggerEmp,
  onTriggerMirrorJamming,
  onTriggerQuantumLock,
  onClearBlacklist,
  onOpenArena,
  onOpenAdvancedConfig,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-950 border-2 border-amber-500/80 rounded-2xl shadow-2xl shadow-amber-950/60 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Glowing Gold Banner Top */}
        <div className="p-5 bg-gradient-to-r from-amber-950 via-slate-950 to-amber-950 border-b border-amber-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 shadow-lg shadow-amber-950/80">
              <Crown className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-mono text-white tracking-wide">
                  GUDEMODUS KONTROLLSENTRAL
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 font-mono font-bold">
                  OVERHERREDØMME
                </span>
              </div>
              <p className="text-xs text-amber-200/80 font-mono mt-0.5">
                Total uovervinnelighet, instant mottiltak og gudelignende kjernebeskyttelse
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Activation Banner */}
          <div className={`p-4 rounded-xl border transition-all ${
            isGodModeActive 
              ? 'bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border-amber-500/80 shadow-lg shadow-amber-950/50' 
              : 'bg-slate-900/60 border-slate-800'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Hovedstatus for Gudemodus:
                </div>
                <div className="text-base font-bold text-white font-mono flex items-center gap-2">
                  <span>{isGodModeActive ? '⚡ GUDEMODUS ER AKTIVERT' : '🛡️ NORMAL FORSVARSMODUS'}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isGodModeActive
                    ? 'Alle innkommende angrep stoppes automatisk med 100% blockrate, reflekteres tilbake til kilden via Mirror Jamming, og kjerne-minnet er kvantelåst.'
                    : 'Systemet kjører vanlige sikkerhetsregler. Aktiver bryteren for å få ubegrenset makt og uovervinnelige skjold.'}
                </p>
              </div>

              <button
                onClick={onToggleGodMode}
                className={`px-5 py-3 rounded-xl font-mono text-xs font-bold transition-all shadow-lg cursor-pointer shrink-0 flex items-center gap-2 ${
                  isGodModeActive
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 hover:brightness-110 shadow-amber-950'
                    : 'bg-slate-800 hover:bg-amber-900/60 text-amber-300 border border-amber-500/60'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>{isGodModeActive ? 'SKRU AV GUDEMODUS' : 'AKTIVER GUDEMODUS'}</span>
              </button>
            </div>
          </div>

          {/* Simple Explanation (What is this?) */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-2 text-xs text-slate-300">
            <h3 className="font-mono font-bold text-slate-200 uppercase flex items-center gap-1.5">
              <span>💡 Hva betyr dette i praksis? (Helt enkelt forklart)</span>
            </h3>
            <p className="leading-relaxed">
              I et ekte forsvarssystem må man normalt balansere serverbelastning, falske positiver og responstid. 
              <strong> Gudemodus fjerner alle disse begrensningene:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 font-mono text-[11px]">
              <li><strong className="text-amber-300">Uovervinnelig Skjold:</strong> Ingen trojanere, ransomware eller zero-days slipper gjennom.</li>
              <li><strong className="text-amber-300">Mirror Jamming:</strong> Angriperen mottar sine egne ondsinnete pakker i retur.</li>
              <li><strong className="text-amber-300">Kvantekryptert WORM:</strong> Beviskjeden beskyttes mot kvante-datamaskiner.</li>
            </ul>
          </div>

          {/* 1-Click Superpowers Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Superkrefter du kan utløse nå (1-Klikk)</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Power 1: EMP Blast */}
              <button
                onClick={onTriggerEmp}
                className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 hover:border-amber-400 text-left transition-all group cursor-pointer shadow-sm"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono font-bold text-xs text-amber-300 flex items-center gap-1.5">
                    <span>💥</span> Global EMP Sjokkbølge
                  </span>
                  <Zap className="w-3.5 h-3.5 text-amber-400 group-hover:scale-125 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Kutter momentant alle aktive C2-forbindelser og tømmer angrepskøen.
                </p>
              </button>

              {/* Power 2: Mirror Jamming */}
              <button
                onClick={onTriggerMirrorJamming}
                className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 hover:border-amber-400 text-left transition-all group cursor-pointer shadow-sm"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono font-bold text-xs text-amber-300 flex items-center gap-1.5">
                    <span>🪞</span> Maks Mirror Jamming
                  </span>
                  <Radio className="w-3.5 h-3.5 text-amber-400 group-hover:scale-125 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Skrur speilingsintensiteten til 10/10 så angriperens egne servere lammes.
                </p>
              </button>

              {/* Power 3: Quantum Lock */}
              <button
                onClick={onTriggerQuantumLock}
                className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 hover:border-amber-400 text-left transition-all group cursor-pointer shadow-sm"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono font-bold text-xs text-amber-300 flex items-center gap-1.5">
                    <span>🔑</span> Kvantelås & Nøkkelrotasjon
                  </span>
                  <Lock className="w-3.5 h-3.5 text-amber-400 group-hover:scale-125 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Roterer AES-256 nøkler og forsegler minne-heapen med Kyber-1024.
                </p>
              </button>

              {/* Power 4: Clear Blacklist */}
              <button
                onClick={onClearBlacklist}
                className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-left transition-all group cursor-pointer shadow-sm"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono font-bold text-xs text-slate-200 flex items-center gap-1.5">
                    <span>🕊️</span> Global Amnesti (Rens Svarteliste)
                  </span>
                  <RefreshCw className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Frigjør alle blokkerte IP-adresser for å starte simuleringen på nytt.
                </p>
              </button>
            </div>
          </div>

          {/* Quick Links to Arena & Deep Config */}
          <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => {
                onClose();
                onOpenArena();
              }}
              className="px-4 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-700 text-xs font-mono font-bold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Swords className="w-3.5 h-3.5 text-rose-400" />
              <span>Gå til Cyber Arena (Kjemp Rød mot Blå)</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenAdvancedConfig();
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono font-bold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Avanserte Gudemodus-innstillinger</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
