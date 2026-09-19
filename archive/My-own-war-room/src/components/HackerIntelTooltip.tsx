import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Copy, 
  Check, 
  Terminal, 
  ExternalLink, 
  Sparkles, 
  Cpu, 
  HelpCircle,
  Lightbulb,
  Crosshair,
  Code2,
  FileCode,
  Flame,
  Bug
} from 'lucide-react';
import { HACKER_INTEL_CATALOG, HackerIntel } from '../data/hackerIntelCatalog';

interface HackerIntelTooltipProps {
  children: React.ReactNode;
  intelId?: string;
  customIntel?: Partial<HackerIntel>;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  delayMs?: number;
  className?: string;
  showIndicator?: boolean;
}

export const HackerIntelTooltip: React.FC<HackerIntelTooltipProps> = ({
  children,
  intelId,
  customIntel,
  position = 'auto',
  delayMs = 200,
  className = '',
  showIndicator = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; place: 'top' | 'bottom' }>({
    top: 0,
    left: 0,
    place: 'top',
  });

  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<any>(null);

  // Look up intelligence data
  const baseIntel = intelId ? HACKER_INTEL_CATALOG[intelId] : null;
  const intel: Partial<HackerIntel> | null = customIntel 
    ? { ...baseIntel, ...customIntel }
    : baseIntel;

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      calculatePosition();
      setIsVisible(true);
    }, delayMs);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
    setCopied(false);
  };

  const calculatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = 360;
    const tooltipHeight = 240;

    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;

    let place: 'top' | 'bottom' = 'top';
    if (position === 'bottom' || (position === 'auto' && spaceAbove < tooltipHeight && spaceBelow > spaceAbove)) {
      place = 'bottom';
    }

    // Horizontal centering relative to trigger
    let left = rect.left + rect.width / 2 - tooltipWidth / 2;

    // Viewport padding limits (min 12px, max window.innerWidth - tooltipWidth - 12px)
    if (left < 12) left = 12;
    if (left + tooltipWidth > window.innerWidth - 12) {
      left = window.innerWidth - tooltipWidth - 12;
    }

    const top = place === 'top' 
      ? rect.top - 8 
      : rect.bottom + 8;

    setCoords({ top, left, place });
  };

  const handleCopyCommand = (e: React.MouseEvent, cmd: string) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsVisible(false);
    };
    if (isVisible) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  if (!intel) {
    return <div className={className}>{children}</div>;
  }

  const isRedTeam = intel.category === 'RED_TEAM';
  const isCrypto = intel.category === 'CRYPTO';

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      className={`relative inline-flex items-center ${className}`}
    >
      {children}

      {/* Optional glowing micro-indicator indicating interactive intel */}
      {showIndicator && (
        <span 
          aria-hidden="true"
          className="absolute -top-1 -right-1 flex h-2 w-2 pointer-events-none"
          title="Etisk Hacker Intel tilgjengelig (Hold over)"
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500 border border-slate-900"></span>
        </span>
      )}

      {/* Floating HUD Tooltip Card */}
      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          style={{
            position: 'fixed',
            top: coords.place === 'top' ? undefined : coords.top,
            bottom: coords.place === 'top' ? window.innerHeight - coords.top : undefined,
            left: coords.left,
            zIndex: 9999,
          }}
          className="w-[360px] max-w-[94vw] bg-slate-950/95 backdrop-blur-md border border-cyan-500/40 rounded-xl p-3.5 shadow-2xl font-mono text-left animate-in fade-in zoom-in-95 duration-150 pointer-events-auto select-text"
        >
          {/* Glowing Top Cyber Line */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>

          {/* Header row: Badge, Category, Level, CVE */}
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold tracking-wider border ${
                intel.category === 'RED_TEAM'
                  ? 'bg-rose-950/80 text-rose-300 border-rose-800' 
                  : intel.category === 'MALWARE'
                  ? 'bg-red-950/80 text-red-300 border-red-700'
                  : intel.category === 'FIREWALL_DEFENSE'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                  : intel.category === 'CRYPTO'
                  ? 'bg-purple-950/80 text-purple-300 border-purple-800'
                  : intel.category === 'PROTOCOL'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                  : 'bg-cyan-950/80 text-cyan-300 border-cyan-800'
              }`}>
                {intel.category === 'RED_TEAM' && '🔴 RED TEAM'}
                {intel.category === 'MALWARE' && '☣️ VIRUS / MALWARE'}
                {intel.category === 'FIREWALL_DEFENSE' && '🛡️ MUR / FORSVAR'}
                {intel.category === 'CRYPTO' && '🔑 KRYPTO'}
                {intel.category === 'PROTOCOL' && '🌐 PROTOKOLL'}
                {intel.category === 'BLUE_TEAM' && '🔵 BLUE TEAM'}
                {intel.category === 'CONCEPT' && '💡 KONSEPT'}
              </span>

              {intel.level && (
                <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                  {intel.level}
                </span>
              )}

              {intel.cveOrRef && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
                  {intel.cveOrRef}
                </span>
              )}
            </div>

            {intel.mitreTactic && (
              <span className="text-[9px] text-amber-300/90 truncate max-w-[130px]" title={intel.mitreTactic}>
                {intel.mitreTactic}
              </span>
            )}
          </div>

          {/* Title & Core Concept */}
          <h4 className="text-xs font-bold text-slate-100 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{intel.title}</span>
          </h4>

          <p className="text-[11px] text-slate-300 leading-relaxed mb-2.5 font-sans">
            {intel.concept}
          </p>

          {/* Red Team Tactic (Hvordan angripere/etiske testere opererer) */}
          {intel.redTeamTactic && (
            <div className="mb-2 p-2 rounded bg-rose-950/30 border border-rose-900/40 text-[10px]">
              <div className="flex items-center gap-1 font-bold text-rose-300 mb-0.5">
                <Crosshair className="w-3 h-3 text-rose-400" />
                <span>Etisk Hacker / Pentesting Testmetode:</span>
              </div>
              <p className="text-slate-300 font-sans leading-snug">
                {intel.redTeamTactic}
              </p>
            </div>
          )}

          {/* Blue Team Defense (Mottiltak & Herding) */}
          {intel.blueTeamDefense && (
            <div className="mb-2 p-2 rounded bg-emerald-950/30 border border-emerald-900/40 text-[10px]">
              <div className="flex items-center gap-1 font-bold text-emerald-300 mb-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Forsvarsmekanisme (Blue Team):</span>
              </div>
              <p className="text-slate-300 font-sans leading-snug">
                {intel.blueTeamDefense}
              </p>
            </div>
          )}

          {/* Code Snippet if present (Komplett Kode for Murer, Virus og Forsvar) */}
          {intel.codeSnippet && (
            <div className="mb-2 p-2 rounded bg-slate-900 border border-slate-800 text-[10px]">
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-1 font-bold text-cyan-300">
                  <Code2 className="w-3 h-3 text-cyan-400" />
                  <span>{intel.codeSnippet.filename || 'Kode-snippet'}</span>
                  <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-slate-800 text-slate-400">
                    {intel.codeSnippet.language}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={(e) => handleCopyCommand(e, intel.codeSnippet!.code)}
                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[9px] flex items-center gap-1 transition-colors cursor-pointer"
                  title="Kopier hele koden"
                >
                  {copied ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                  <span>{copied ? 'Kopiert' : 'Kopier kode'}</span>
                </button>
              </div>
              {intel.codeSnippet.description && (
                <p className="text-[10px] text-slate-400 mb-1 font-sans">{intel.codeSnippet.description}</p>
              )}
              <div className="max-h-28 overflow-y-auto bg-slate-950 p-1.5 rounded border border-slate-800 font-mono text-[9px] text-emerald-300 leading-tight">
                <pre><code>{intel.codeSnippet.code}</code></pre>
              </div>
            </div>
          )}

          {/* Terminal Command Snippet with 1-click Copy */}
          {intel.terminalCommand && (
            <div className="mt-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <Terminal className="w-3 h-3 text-cyan-400" />
                  <span>Kommando: <strong>{intel.toolName || 'CLI'}</strong></span>
                </span>
                <button
                  type="button"
                  onClick={(e) => handleCopyCommand(e, intel.terminalCommand!)}
                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                  title="Kopier kommando til utklippstavlen"
                >
                  {copied ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                  <span>{copied ? 'Kopiert!' : 'Kopier'}</span>
                </button>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 p-1.5 rounded overflow-x-auto text-[10px] text-cyan-300 font-mono">
                <code>{intel.terminalCommand}</code>
              </div>
            </div>
          )}

          {/* Superhacker Pro-Tip */}
          {intel.proTip && (
            <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-start gap-1.5 text-[10px] text-amber-300/90 font-sans leading-snug">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-400 font-mono">Pro-Tip:</strong> {intel.proTip}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
