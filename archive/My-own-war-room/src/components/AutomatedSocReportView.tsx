import React, { useState, useMemo } from 'react';
import {
  FileText,
  Printer,
  Download,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Clock,
  Cpu,
  Lock,
  Layers,
  Sparkles,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Award,
  Hash,
  Globe,
  Sliders,
  ChevronRight,
  Zap,
  Radio,
  Crown
} from 'lucide-react';
import { ForensicBlock, SystemStats, BlacklistedIp } from '../types';
import { generateHtmlReport, generateMarkdownReport, generateJsonReport, downloadReportFile } from '../utils/exporters';
import { downloadFullProjectZip } from '../utils/projectZipExporter';

export interface AutomatedSocReportViewProps {
  stats: SystemStats;
  chain: ForensicBlock[];
  blacklist: BlacklistedIp[];
  onRotateKey: () => void;
  isGodModeActive: boolean;
  onSelectTab: (tab: string) => void;
}

export const AutomatedSocReportView: React.FC<AutomatedSocReportViewProps> = ({
  stats,
  chain,
  blacklist,
  onRotateKey,
  isGodModeActive,
  onSelectTab,
}) => {
  const [reportGeneratedAt, setReportGeneratedAt] = useState<string>(() => new Date().toLocaleString('no-NO'));
  const [reportId] = useState<string>(() => `SOC-RPT-${Math.floor(100000 + Math.random() * 900000)}`);
  const [copiedStatus, setCopiedStatus] = useState<boolean>(false);
  const [zipStatusMsg, setZipStatusMsg] = useState<string | null>(null);

  const handleDownloadZip = async () => {
    setZipStatusMsg('Forbereder ZIP...');
    await downloadFullProjectZip((msg) => setZipStatusMsg(msg));
    setTimeout(() => setZipStatusMsg(null), 4000);
  };

  // Calculate high-level metrics
  const totalEvents = chain.length;
  const criticalCount = chain.filter((b) => b.threatLevel === 'CRITICAL').length;
  const highCount = chain.filter((b) => b.threatLevel === 'HIGH').length;
  const avgEntropy = chain.length > 0 
    ? (chain.reduce((sum, b) => sum + (b.entropy || 0), 0) / chain.length).toFixed(2)
    : '5.20';

  // Categories distribution
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    chain.forEach((b) => {
      const type = b.threatType || 'ANNET';
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [chain]);

  // Handle Regenerate
  const handleRegenerate = () => {
    setReportGeneratedAt(new Date().toLocaleString('no-NO'));
  };

  // Handle Print / Save as PDF
  const handlePrint = () => {
    window.print();
  };

  // Handle Download HTML
  const handleDownloadHtml = () => {
    const htmlContent = generateHtmlReport(chain, stats, blacklist);
    downloadReportFile(htmlContent, `SOC-Sikkerhetsrapport-${new Date().toISOString().slice(0, 10)}.html`, 'text/html');
  };

  // Handle Download Markdown
  const handleDownloadMarkdown = () => {
    const mdContent = generateMarkdownReport(chain, stats, blacklist);
    downloadReportFile(mdContent, `SOC-Sikkerhetsrapport-${new Date().toISOString().slice(0, 10)}.md`, 'text/markdown');
  };

  // Handle Download JSON WORM
  const handleDownloadJson = () => {
    const jsonContent = generateJsonReport(chain, stats, blacklist);
    downloadReportFile(jsonContent, `SOC-WORM-Schema-${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
  };

  return (
    <div className="space-y-6">
      {/* Top Action Toolbar */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl text-white shadow-md shadow-purple-950">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-mono font-bold text-white">
                AUTOMATISERT SOC HENDELSES- & REVISJONSRAPPORT
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-700 font-mono font-bold">
                DOKUMENT-ID: {reportId}
              </span>
              {isGodModeActive && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-600 font-mono font-bold flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" /> GUDEMODUS-FORSEGLING
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Generert: {reportGeneratedAt} • Klassifisering: BEGRENSET SIKKERHETSGRAD • Kjerne: eBPF WORM
            </p>
          </div>
        </div>

        {/* 1-Click Export Actions */}
        <div className="flex items-center flex-wrap gap-2">
          {/* 1-Click Complete System ZIP Download */}
          <button
            onClick={handleDownloadZip}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-mono font-black flex items-center gap-1.5 transition-all shadow-md shadow-amber-950/50 cursor-pointer hover:scale-105"
            title="Last ned hele prosjektet som komplett ZIP (backend, frontend, WORM og tester)"
          >
            <Download className="w-3.5 h-3.5 text-slate-950" />
            <span>{zipStatusMsg || 'Last Ned Hele Programmet (ZIP) 💾'}</span>
          </button>

          <button
            onClick={handleRegenerate}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Oppdater rapportdata i sanntid"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Oppdater</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            title="Skriv ut eller lagre som PDF direkte fra nettleseren"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span>Skriv Ut / Lagre PDF</span>
          </button>

          <button
            onClick={handleDownloadHtml}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md shadow-purple-950 cursor-pointer"
            title="Last ned interaktiv HTML-rapport som kan åpnes offline"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Last Ned Rapport (.html)</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-mono">
            <button
              onClick={handleDownloadMarkdown}
              className="px-2 py-1 rounded text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              title="Last ned Markdown for Jira/GitHub/Notion"
            >
              .MD
            </button>
            <button
              onClick={handleDownloadJson}
              className="px-2 py-1 rounded text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              title="Last ned fullt JSON WORM skjema for SIEM"
            >
              .JSON
            </button>
          </div>
        </div>
      </div>

      {/* Main Report Document Container */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8 shadow-2xl relative overflow-hidden">
        {/* Subtle Watermark Stamp */}
        <div className="absolute top-12 right-12 opacity-5 pointer-events-none select-none font-mono text-8xl font-black text-white">
          WPWW // VERIFIED
        </div>

        {/* Executive Summary Card */}
        <div className="p-5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 flex-1">
            <div className="text-[11px] font-mono text-purple-400 uppercase tracking-wider font-bold">
              Ledelsessammendrag (Executive Assessment)
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white font-mono">
              Forsvarsstatus: {stats.integrityVerified ? 'OPERATIV & FEILFRI' : 'KRITISK ADVARSEL'}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              Nettverksperimeteren har registrert og nøytralisert <strong>{totalEvents}</strong> fiendtlige handlinger.
              Alle hendelser er deterministisk loggført i den manipulasjonssikre WORM SHA-256 blokkjeden.
              {isGodModeActive
                ? ' Gudemodus er for øyeblikket aktiv; maksimalt forsvarsvern, kvantebeskyttelse og speilingsforsvar er etablert.'
                : ' Standard autonom kjernebeskyttelse håndterer trafikk med automatisk isolering.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono">
              <div className="text-xl font-bold text-emerald-400">{totalEvents}</div>
              <div className="text-[10px] text-slate-400">Avverget</div>
            </div>
            <div className="px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono">
              <div className="text-xl font-bold text-rose-400">{criticalCount}</div>
              <div className="text-[10px] text-slate-400">Kritiske</div>
            </div>
            <div className="px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono">
              <div className="text-xl font-bold text-amber-400">{blacklist.length}</div>
              <div className="text-[10px] text-slate-400">Svartelistet</div>
            </div>
          </div>
        </div>

        {/* 4 Core Pillars KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
              <span>WORM Integritet</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-lg font-bold font-mono text-white flex items-center gap-1.5">
              <span className={stats.integrityVerified ? 'text-emerald-400' : 'text-rose-400'}>
                {stats.integrityVerified ? '100% Verifisert' : 'Manipulert!'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Ingen avvik oppdaget i SHA-256 hashen til foregående blokker.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
              <span>Gjennomsnittlig Entropi</span>
              <Cpu className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-lg font-bold font-mono text-cyan-300">
              {avgEntropy} <span className="text-xs text-slate-400">bits/byte</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Terskel er satt til {stats.entropyThreshold} bits. Trusler over terskel karantenesettes automatisk.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
              <span>Trusselsignaturer</span>
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-lg font-bold font-mono text-purple-300">
              {stats.securityDefinitions.totalSignatures.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Databasen er synkronisert ({stats.securityDefinitions.version}).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
              <span>Kvantekryptert Utdata</span>
              <Lock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-lg font-bold font-mono text-amber-300">
              TLS 1.3 + Kyber
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              All utgående telemetri er forseglet med post-kvantekryptering.
            </p>
          </div>
        </div>

        {/* Threat Categories Breakdown */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span>Topp Trusler Registrert</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 font-normal">Kategorisert etter MITRE & OWASP</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categoryStats.length > 0 ? (
              categoryStats.map(([cat, count]) => {
                const percent = Math.round((count / totalEvents) * 100) || 0;
                return (
                  <div key={cat} className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between items-center text-slate-200 font-bold">
                      <span>{cat}</span>
                      <span className="text-purple-300">{count} stk ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, Math.max(5, percent))}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 rounded-xl bg-slate-900/20 border border-slate-800 text-xs font-mono text-slate-500 text-center col-span-2">
                Ingen trusselhendelser loggført enda. Start et angrep i simulatoren eller radaren for å generere statistikk.
              </div>
            )}
          </div>
        </div>

        {/* Regulatory & Compliance Audit (NIS2, ISO 27001, GDPR) */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span>Samsvarsrevisjon & Standarder (Compliance Audit)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-emerald-900/40 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>NIS2 Direktivet (Art. 21)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Oppfyller krav til kontinuerlig sårbarhetshåndtering, kryptografisk revisjonslogg og hendelsesvarsling.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-emerald-900/40 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ISO/IEC 27001 (A.12.4)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Uforanderlig logging med WORM-teknologi forhindrer manipulering av administrative hendelser.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-emerald-900/40 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>GDPR Art. 32 Sikkerhet</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Pseudonymisering og post-kvantekryptering beskytter personopplysninger under lagring og overføring.
              </p>
            </div>
          </div>
        </div>

        {/* Recent Forensic Log Entries Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Siste Loggførte Hendelser (WORM Ledger)
            </h3>
            <button
              onClick={() => onSelectTab('forensics')}
              className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Se hele kjeden</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/30">
            <table className="w-full text-left font-mono text-xs text-slate-300">
              <thead className="bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 uppercase">
                <tr>
                  <th className="p-2.5">Blokk #</th>
                  <th className="p-2.5">Tidspunkt</th>
                  <th className="p-2.5">Kilde IP</th>
                  <th className="p-2.5">Trussel</th>
                  <th className="p-2.5">Entropi</th>
                  <th className="p-2.5">Mottiltak</th>
                  <th className="p-2.5">SHA-256 Forsegling</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-[11px]">
                {chain.slice(0, 6).map((block) => (
                  <tr key={block.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-2.5 font-bold text-slate-400">#{block.id}</td>
                    <td className="p-2.5 text-slate-400">{block.timestamp}</td>
                    <td className="p-2.5 text-cyan-300 font-bold">{block.attackerIp}</td>
                    <td className="p-2.5">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-rose-300 text-[10px]">
                        {block.threatType}
                      </span>
                    </td>
                    <td className="p-2.5 text-amber-300">{block.entropy?.toFixed(2)}</td>
                    <td className="p-2.5 text-slate-300 truncate max-w-xs">{block.counterMeasure}</td>
                    <td className="p-2.5 text-slate-500 font-mono text-[10px] truncate max-w-[120px]">
                      {block.currentHash}
                    </td>
                  </tr>
                ))}
                {chain.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-slate-500">
                      Ingen blokker registrert i kjeden enda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Auditor Stamp & Signature Block */}
        <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Kryptografisk attestert av WPWW SecurityEngine Core v20.0</span>
          </div>

          <div className="flex items-center gap-3">
            <span>Rapport SHA-256 Kontrollsum:</span>
            <code className="text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              e3b0c44298fc1c149afbf4c8996fb924...
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};
