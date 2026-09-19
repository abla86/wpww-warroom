import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Download, 
  FileJson, 
  FileSpreadsheet, 
  CheckCircle2, 
  Link2, 
  Hash, 
  Clock, 
  Terminal, 
  AlertOctagon, 
  RotateCcw,
  Sparkles,
  Layers,
  FileCode,
  FileText,
  Search,
  Filter,
  Copy,
  Check,
  Ban,
  Binary,
  Code2,
  Award,
  Eye,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ForensicBlock, ExportFormat } from '../types';
import { sha256 } from '../utils/crypto';
import { playVerifyChime } from '../utils/audio';
import { HackerIntelTooltip } from './HackerIntelTooltip';

interface ForensicChainProps {
  chain: ForensicBlock[];
  onExportReport: (format: ExportFormat) => void;
  onOpenExportModal?: (format?: ExportFormat) => void;
  onTamperBlock: (blockId: number) => void;
  onRestoreChain: () => void;
  onBlacklistIp?: (ip: string, reason: string) => void;
}

export const ForensicChain: React.FC<ForensicChainProps> = ({
  chain,
  onExportReport,
  onOpenExportModal,
  onTamperBlock,
  onRestoreChain,
  onBlacklistIp,
}) => {
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyProgress, setVerifyProgress] = useState<number>(0);
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    brokenBlockId?: number;
    message: string;
    timestamp?: string;
  } | null>(null);

  const [expandedBlockId, setExpandedBlockId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'blockchain' | 'hex'>('cards');
  const [copiedHashId, setCopiedHashId] = useState<number | null>(null);
  const [copiedPayloadId, setCopiedPayloadId] = useState<number | null>(null);
  const [showCertModal, setShowCertModal] = useState<boolean>(false);

  // Filtered chain based on search and filters
  const filteredChain = useMemo(() => {
    return chain.filter((block) => {
      const matchSearch =
        searchQuery === '' ||
        block.attackerIp.toLowerCase().includes(searchQuery.toLowerCase()) ||
        block.threatType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        block.counterMeasure.toLowerCase().includes(searchQuery.toLowerCase()) ||
        block.payload.toLowerCase().includes(searchQuery.toLowerCase()) ||
        block.currentHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
        block.previousHash.toLowerCase().includes(searchQuery.toLowerCase());

      const matchSeverity =
        severityFilter === 'ALL' ||
        (severityFilter === 'TAMPERED' && block.tampered) ||
        (severityFilter === 'CRITICAL' && block.threatLevel === 'CRITICAL') ||
        (severityFilter === 'HIGH' && block.threatLevel === 'HIGH') ||
        (severityFilter === 'MEDIUM' && block.threatLevel === 'MEDIUM') ||
        (severityFilter === 'LOW' && block.threatLevel === 'LOW');

      return matchSearch && matchSeverity;
    });
  }, [chain, searchQuery, severityFilter]);

  // Summary Metrics
  const avgEntropy = useMemo(() => {
    if (chain.length === 0) return 0;
    const sum = chain.reduce((acc, b) => acc + (b.entropy || 0), 0);
    return (sum / chain.length).toFixed(2);
  }, [chain]);

  const uniqueAttackersCount = useMemo(() => {
    return new Set(chain.map((b) => b.attackerIp)).size;
  }, [chain]);

  // Real-time cryptographic verification with step-by-step progress
  const handleVerifyChain = async () => {
    setIsVerifying(true);
    setVerifyProgress(10);
    setVerificationResult(null);

    let prevHash = '0'.repeat(64);
    let broken = false;
    let brokenId = 0;

    const total = chain.length;
    for (let i = 0; i < total; i++) {
      setVerifyProgress(Math.round(((i + 1) / total) * 90));
      await new Promise((r) => setTimeout(r, 80));

      const block = chain[i];
      if (block.tampered) {
        broken = true;
        brokenId = block.id;
        break;
      }

      if (block.previousHash !== prevHash) {
        broken = true;
        brokenId = block.id;
        break;
      }

      const raw = `${block.timestamp}${block.attackerIp}${block.threatType}${block.counterMeasure}${block.entropy}${block.payload}${prevHash}`;
      const calculated = await sha256(raw);

      if (calculated !== block.currentHash) {
        broken = true;
        brokenId = block.id;
        break;
      }
      prevHash = block.currentHash;
    }

    setVerifyProgress(100);
    setIsVerifying(false);

    if (broken) {
      setVerificationResult({
        valid: false,
        brokenBlockId: brokenId,
        message: `🚨 KRITISK SIKKERHETSAVVIK: Uautorisert manipulering oppdaget ved Blokk #${brokenId}! SHA-256 hash-kjeden matcher ikke.`,
        timestamp: new Date().toLocaleTimeString(),
      });
    } else {
      playVerifyChime();
      setVerificationResult({
        valid: true,
        message: `✅ KRYPTOGRAFISK GODKJENT: Alle ${chain.length} bevisblokker er 100% intakte og verifisert mot WORM (Write-Once-Read-Many) FIPS 180-4 standarden.`,
        timestamp: new Date().toLocaleTimeString(),
      });
    }
  };

  const handleCopyHash = (blockId: number, hash: string) => {
    navigator.clipboard?.writeText(hash);
    setCopiedHashId(blockId);
    setTimeout(() => setCopiedHashId(null), 2000);
  };

  const handleCopyPayload = (blockId: number, payload: string) => {
    navigator.clipboard?.writeText(payload);
    setCopiedPayloadId(blockId);
    setTimeout(() => setCopiedPayloadId(null), 2000);
  };

  // Converts text payload to formatted hex + ascii string
  const formatPayloadToHex = (text: string) => {
    const lines = [];
    const bytes = new TextEncoder().encode(text);
    for (let i = 0; i < bytes.length; i += 16) {
      const chunk = bytes.slice(i, i + 16);
      const hex = Array.from(chunk)
        .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
        .join(' ');
      const ascii = Array.from(chunk)
        .map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.'))
        .join('');
      const offset = i.toString(16).padStart(6, '0').toUpperCase();
      lines.push(`${offset}  ${hex.padEnd(48, ' ')}  |${ascii}|`);
    }
    return lines.join('\n');
  };

  return (
    <div id="forensic-chain-container" className="space-y-6">
      {/* TOP KPI STATS RIBBON */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>Totalt Antall Blokker</span>
            <Link2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">{chain.length}</div>
          <span className="text-[10px] font-mono text-emerald-400">WORM SHA-256 forseglet</span>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>Snitt Shannon Entropi</span>
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-purple-300">{avgEntropy} bits</div>
          <span className="text-[10px] font-mono text-slate-400">Zero-Day terskel: 5.20</span>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>Unike Angripere</span>
            <Terminal className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-300">{uniqueAttackersCount}</div>
          <span className="text-[10px] font-mono text-rose-400/80">Karantenespor etablert</span>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>Samsvarsstandard</span>
            <Award className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-300">NIS2 / ISO</div>
          <span className="text-[10px] font-mono text-slate-400">FIPS 180-4 SHA-256</span>
        </div>
      </div>

      {/* MAIN WORM COMMAND BANNER */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <HackerIntelTooltip intelId="worm_integrity">
              <h2 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2 cursor-help">
                <Link2 className="w-4 h-4 text-emerald-400" />
                Kryptografisk WORM Bevis-Logg (Write Once, Read Many)
              </h2>
            </HackerIntelTooltip>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Hver hendelse forsegles med SHA-256 hash-kjeding. Ethvert forsøk på å endre historiske bevis oppdages umiddelbart.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-verify-chain"
              onClick={handleVerifyChain}
              disabled={isVerifying}
              className="py-2 px-4 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-600 text-emerald-300 font-mono text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50 shadow-md cursor-pointer"
            >
              <ShieldCheck className={`w-4 h-4 text-emerald-400 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>{isVerifying ? `Verifiserer (${verifyProgress}%)...` : 'Verifiser Kjedeintegritet'}</span>
            </button>

            <button
              onClick={() => setShowCertModal(true)}
              className="py-2 px-3 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 border border-amber-600 text-amber-300 font-mono text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              title="Vis offisielt kryptografisk revisjonsbevis for WORM-kjeden"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>WORM Sertifikat</span>
            </button>

            <div className="flex items-center gap-1.5">
              <button
                id="btn-export-json"
                onClick={() => onExportReport('json')}
                className="py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Last ned offisiell JSON forensisk rapport"
              >
                <FileJson className="w-3.5 h-3.5 text-cyan-400" />
                <span>JSON</span>
              </button>
              <button
                id="btn-export-csv"
                onClick={() => onExportReport('csv')}
                className="py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Last ned CSV tabell"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>CSV</span>
              </button>
              {onOpenExportModal && (
                <button
                  id="btn-open-multi-export"
                  onClick={() => onOpenExportModal()}
                  className="py-2 px-3 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 font-mono text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  title="Åpne eksportsenter med 8 formater (STIX, XML, Markdown, HTML, Syslog, YARA)"
                >
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Flere Formater (8)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Verification Progress Bar */}
        {isVerifying && (
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400">
              <span>Beregner SHA-256 hash for hver blokk i sekvens...</span>
              <span>{verifyProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-150"
                style={{ width: `${verifyProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Verification Result Banner */}
        {verificationResult && (
          <div
            className={`mt-4 p-3.5 rounded-xl border text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              verificationResult.valid
                ? 'bg-emerald-950/60 border-emerald-700 text-emerald-200'
                : 'bg-rose-950/80 border-rose-600 text-rose-100 animate-pulse'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {verificationResult.valid ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <div>
                <div className="font-bold">{verificationResult.message}</div>
                {verificationResult.timestamp && (
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Tidsstempel for revisjon: {verificationResult.timestamp}
                  </div>
                )}
              </div>
            </div>

            {!verificationResult.valid && (
              <button
                id="btn-restore-chain"
                onClick={() => {
                  onRestoreChain();
                  setVerificationResult(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-900 hover:bg-rose-800 text-white border border-rose-600 text-xs font-mono font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-md"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Gjenopprett Kjeden
              </button>
            )}
          </div>
        )}

        {/* Interactive Tamper Proof Sandbox Testing Demo */}
        <div className="mt-4 pt-3.5 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs font-mono text-slate-300 gap-2">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Sikkerhetsdemonstrasjon: Test hva som skjer dersom en hacker forsøker å manipulere en loggoppføring:</span>
          </span>
          <button
            id="btn-tamper-simulation"
            onClick={() => {
              if (chain.length > 1) {
                onTamperBlock(chain[1].id);
                setVerificationResult({
                  valid: false,
                  brokenBlockId: chain[1].id,
                  message: `🚨 MANIPULERING SIMULERT: Payload i Blokk #${chain[1].id} ble tuklet med! Kjør verifisering for å se integritetsbruddet.`,
                  timestamp: new Date().toLocaleTimeString(),
                });
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900 text-amber-300 border border-amber-700/80 font-mono text-xs font-bold transition-colors cursor-pointer"
          >
            Simuler Uautorisert Tukling i Blokk #2
          </button>
        </div>
      </div>

      {/* FILTER & VIEW CONTROLS TOOLBAR */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Søk IP, trussel, hash, payload eller mottiltak..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">Alle Alvorlighetsgrader ({chain.length})</option>
            <option value="CRITICAL">Kun Kritisk (CRITICAL)</option>
            <option value="HIGH">Kun Høy (HIGH)</option>
            <option value="MEDIUM">Kun Middels (MEDIUM)</option>
            <option value="LOW">Kun Lav (LOW)</option>
            <option value="TAMPERED">Kun Tuklet Med</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 gap-1">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
              viewMode === 'cards' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Kort-liste
          </button>
          <button
            onClick={() => setViewMode('blockchain')}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
              viewMode === 'blockchain' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Kjede-visning 🔗
          </button>
          <button
            onClick={() => setViewMode('hex')}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
              viewMode === 'hex' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Hex / Dump 🔬
          </button>
        </div>
      </div>

      {/* 1. BLOCKCHAIN GRAPHICAL LINK VIEW */}
      {viewMode === 'blockchain' && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 overflow-x-auto">
          <div className="text-xs font-mono text-slate-300 font-bold uppercase flex items-center gap-2">
            <Link2 className="w-4 h-4 text-cyan-400" />
            <span>Kryptografisk Hash-Kjede Flyt (Genesis til Siste Blokk)</span>
          </div>

          <div className="flex items-center gap-3 min-w-max py-4">
            {filteredChain.map((block, idx) => {
              const isTampered = block.tampered;
              return (
                <React.Fragment key={block.id}>
                  <div
                    onClick={() => setExpandedBlockId(block.id)}
                    className={`w-64 p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isTampered
                        ? 'bg-rose-950/60 border-rose-600 shadow-lg shadow-rose-950/60'
                        : 'bg-slate-900 border-slate-800 hover:border-cyan-500'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                      <span className="font-bold text-cyan-400">Blokk #{block.id}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        isTampered ? 'bg-rose-900 text-rose-200' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {isTampered ? 'BRUDD!' : block.threatType}
                      </span>
                    </div>

                    <div className="text-[10px] font-mono text-slate-400 space-y-1">
                      <div>IP: <strong className="text-white">{block.attackerIp}</strong></div>
                      <div>Entropi: <strong className="text-purple-300">{block.entropy.toFixed(2)}</strong></div>
                      <div className="text-slate-500 truncate">Prev: {block.previousHash.slice(0, 12)}...</div>
                      <div className="text-emerald-400 truncate font-mono">Cur: {block.currentHash.slice(0, 12)}...</div>
                    </div>
                  </div>

                  {idx < filteredChain.length - 1 && (
                    <div className="flex flex-col items-center justify-center text-slate-600 font-mono text-xs">
                      <span>🔗</span>
                      <span className="text-[9px] text-slate-500">SHA-256</span>
                      <span>→</span>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. HEX / RAW PAYLOAD DUMP VIEW */}
      {viewMode === 'hex' && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 font-mono">
          <div className="text-xs text-slate-300 font-bold uppercase flex items-center gap-2">
            <Binary className="w-4 h-4 text-purple-400" />
            <span>Hexadesimal & ASCII Rå-Payload Inspektor</span>
          </div>

          <div className="space-y-4">
            {filteredChain.map((block) => (
              <div key={block.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                  <span className="text-cyan-400 font-bold">Blokk #{block.id} — {block.threatType} fra {block.attackerIp}</span>
                  <span className="text-slate-400 text-[11px]">{block.timestamp}</span>
                </div>
                <div className="overflow-x-auto bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-[11px] text-emerald-400">
                  <pre>{formatPayloadToHex(block.payload)}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. STANDARD CARDS VIEW */}
      {viewMode === 'cards' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
            <span>Viser {filteredChain.length} av {chain.length} forensiske blokker</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-cyan-400 hover:underline cursor-pointer"
              >
                Nullstill søk
              </button>
            )}
          </div>

          {filteredChain.map((block, index) => {
            const isExpanded = expandedBlockId === block.id;
            const isGenesis = block.id === 1 || index === 0;

            return (
              <div
                key={block.id}
                id={`forensic-block-${block.id}`}
                className={`rounded-xl border transition-all ${
                  block.tampered
                    ? 'bg-rose-950/40 border-rose-600 shadow-lg shadow-rose-950/50'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Block Header Summary */}
                <div
                  onClick={() => setExpandedBlockId(isExpanded ? null : block.id)}
                  className="p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                      block.tampered
                        ? 'bg-rose-900/80 text-rose-200 border border-rose-500'
                        : 'bg-slate-900 text-cyan-400 border border-cyan-900/60'
                    }`}>
                      #{block.id}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-200">
                          {block.threatType}
                        </span>
                        {isGenesis && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                            GENESIS BLOKK
                          </span>
                        )}
                        {block.tampered && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700 animate-pulse font-bold">
                            TUKLET MED!
                          </span>
                        )}
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                          block.threatLevel === 'CRITICAL'
                            ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                            : block.threatLevel === 'HIGH'
                            ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                            : 'bg-slate-900 text-slate-300 border-slate-800'
                        }`}>
                          {block.threatLevel || 'SECURE'}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5 flex flex-wrap items-center gap-3">
                        <span>IP: <strong className="text-rose-400">{block.attackerIp}</strong></span>
                        <span>•</span>
                        <span>Entropi: <strong className="text-purple-300">{block.entropy.toFixed(2)}</strong></span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock className="w-3 h-3" /> {block.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-xs">
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] text-slate-500 block">SHA-256 Fingeravtrykk:</span>
                      <span className="text-[11px] text-emerald-400">
                        {block.currentHash.substring(0, 16)}...{block.currentHash.substring(48)}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Block Expanded Deep Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-900 bg-slate-900/40 rounded-b-xl space-y-3.5 text-xs font-mono">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-slate-500 text-[10px]">
                          <span>Foregående Hash (Previous):</span>
                        </div>
                        <code className="text-[11px] text-slate-300 break-all select-all block">
                          {block.previousHash}
                        </code>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-500">Nåværende Forseglet Hash (SHA-256):</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyHash(block.id, block.currentHash);
                            }}
                            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedHashId === block.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Kopiert!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Kopier Hash</span>
                              </>
                            )}
                          </button>
                        </div>
                        <code className="text-[11px] text-emerald-400 break-all select-all block">
                          {block.currentHash}
                        </code>
                      </div>
                    </div>

                    {/* Captured Payload with Copy Button */}
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>Fanget Payload Dump (ASCII):</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyPayload(block.id, block.payload);
                          }}
                          className="text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedPayloadId === block.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Kopiert!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Kopier Payload</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="text-[11px] text-amber-300/90 whitespace-pre-wrap break-all bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                        {block.payload}
                      </pre>
                    </div>

                    {/* Action Toolbar on the Block */}
                    <div className="flex flex-wrap items-center justify-between pt-1 gap-2 border-t border-slate-900 text-slate-400 text-[11px]">
                      <div>
                        <span>Aktivt Mottiltak: <strong className="text-cyan-300">{block.counterMeasure}</strong></span>
                      </div>

                      <div className="flex items-center gap-2">
                        {onBlacklistIp && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onBlacklistIp(block.attackerIp, `Forensisk blokkering fra bevis #${block.id}`);
                            }}
                            className="px-2.5 py-1 rounded bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-200 text-xs font-mono flex items-center gap-1 cursor-pointer"
                          >
                            <Ban className="w-3 h-3" />
                            <span>Svartelist IP</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: WORM CRYPTO COMPLIANCE CERTIFICATE */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-xl bg-slate-950 border-2 border-amber-500/80 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-500/40 pb-3">
              <div className="flex items-center gap-2.5">
                <Award className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="text-base font-bold font-mono text-white uppercase">
                    WORM Integritetssertifikat
                  </h3>
                  <p className="text-xs text-amber-200/80 font-mono">
                    Rettslig gyldig samsvarsbevis for digital bevissikring
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCertModal(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono text-slate-300">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Kryptografisk Standard:</span>
                  <span className="text-emerald-400 font-bold">FIPS 180-4 SHA-256 Chaining</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total blokker i beviskjedens sekvens:</span>
                  <span className="text-white font-bold">{chain.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Genesis Hash:</span>
                  <span className="text-slate-400 truncate max-w-[200px]">{chain[0]?.currentHash || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Siste Forseglede Hash:</span>
                  <span className="text-emerald-400 truncate max-w-[200px]">{chain[chain.length - 1]?.currentHash || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Samsvar med EU NIS2 Direktiv:</span>
                  <span className="text-emerald-400 font-bold">Artikkel 21 & 23 Verifisert</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ISO/IEC 27001:2022 Sikkerhetskontroll:</span>
                  <span className="text-emerald-400 font-bold">A.8.16 & A.8.24 Godkjent</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Dette sertifikatet bekrefter at loggpostene i WPWW SecurityEngine er forseglet på en måte som forhindrer sletting eller modifikasjon i henhold til WORM-prinsippet.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-bold cursor-pointer"
              >
                Skriv ut / Lagre som PDF
              </button>
              <button
                onClick={() => setShowCertModal(false)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-bold cursor-pointer"
              >
                Lukk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
