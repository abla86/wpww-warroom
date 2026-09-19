import React, { useState } from 'react';
import { 
  Play, 
  Layers, 
  Zap, 
  Send, 
  Code2, 
  AlertTriangle, 
  Terminal, 
  ShieldAlert, 
  Flame,
  CheckSquare,
  Square,
  Sliders,
  Filter,
  Check,
  X,
  PlusCircle,
  Download,
  Upload,
  Search,
  BookOpen,
  Trash2,
  Cpu,
  Lock,
  Globe,
  Database,
  KeyRound
} from 'lucide-react';
import { AttackVector } from '../types';
import { calculateShannonEntropy } from '../utils/crypto';
import { 
  MASTER_ATTACK_CATALOG, 
  getRegisteredAttackVectors, 
  saveCustomAttackVector, 
  deleteCustomAttackVector,
  exportAttackCatalogJson,
  importAttackCatalogJson
} from '../data/attackCatalog';
import { HackerIntelTooltip } from './HackerIntelTooltip';

export const ATTACK_VECTORS: AttackVector[] = MASTER_ATTACK_CATALOG;

interface AttackSimulatorProps {
  simulatorEnabled: boolean;
  onFireAttack: (vectorId: number, customPayload?: string, customIp?: string) => Promise<void>;
  onRunSwarm: (selectedVectors?: AttackVector[]) => Promise<void>;
  onRunSequential: (selectedVectors?: AttackVector[]) => Promise<void>;
  onRunStress: (selectedVectors?: AttackVector[]) => Promise<void>;
  isSimulating: boolean;
  hackerHudEnabled?: boolean;
}

type FilterCategoryType = 
  | 'ALL' 
  | 'DDOS' 
  | 'RCE_ZERO' 
  | 'RANSOM_KERNEL' 
  | 'SUPPLY_CLOUD' 
  | 'AUTH_API' 
  | 'ICS_SCADA' 
  | 'AUTOMATED_ABUSE'
  | 'AI_SECURITY'
  | 'CUSTOM';

export const AttackSimulator: React.FC<AttackSimulatorProps> = ({
  simulatorEnabled,
  onFireAttack,
  onRunSwarm,
  onRunSequential,
  onRunStress,
  isSimulating,
  hackerHudEnabled = false,
}) => {
  // Master vector state with user extensions
  const [vectors, setVectors] = useState<AttackVector[]>(() => getRegisteredAttackVectors());

  // State for which attack vectors are selected / deselected ("velges eller velges vekk")
  const [selectedIds, setSelectedIds] = useState<Set<number>>(
    () => new Set(getRegisteredAttackVectors().map((v) => v.id))
  );

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<FilterCategoryType>('ALL');

  // Dedicated DDoS Generator State
  const [ddosType, setDdosType] = useState<'TCP_SYN' | 'UDP_AMP' | 'SLOWLORIS' | 'HTTP_FLOOD' | 'BOTNET'>('BOTNET');
  const [ddosGbps, setDdosGbps] = useState<number>(45);
  const [ddosBotCount, setDdosBotCount] = useState<number>(12500);
  const [ddosPps, setDdosPps] = useState<number>(180000);
  const [ddosStatusMsg, setDdosStatusMsg] = useState<string | null>(null);

  // Custom Payload & IP Scratchpad
  const [customPayload, setCustomPayload] = useState<string>("SELECT * FROM credentials WHERE '1'='1'");
  const [customIp, setCustomIp] = useState<string>('192.168.1.189');
  const [lastResponse, setLastResponse] = useState<string | null>(null);

  // Expandable Details Set
  const [expandedVectorIds, setExpandedVectorIds] = useState<Set<number>>(new Set());

  // Modal State for New Custom Vector
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newVectorName, setNewVectorName] = useState<string>('');
  const [newVectorCategory, setNewVectorCategory] = useState<AttackVector['category']>('ZERO_DAY');
  const [newVectorCve, setNewVectorCve] = useState<string>('CVE-2026-');
  const [newVectorMitre, setNewVectorMitre] = useState<string>('T1190');
  const [newVectorOwasp, setNewVectorOwasp] = useState<string>('A03:2021-Injection');
  const [newVectorRisk, setNewVectorRisk] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [newVectorProtocol, setNewVectorProtocol] = useState<string>('TCP / HTTP');
  const [newVectorDescription, setNewVectorDescription] = useState<string>('');
  const [newVectorPayload, setNewVectorPayload] = useState<string>('');
  const [newVectorCountermeasure, setNewVectorCountermeasure] = useState<string>('Mirror Jamming');
  const [newVectorMitigation, setNewVectorMitigation] = useState<string>('');

  // Modal State for JSON Import / Export
  const [isJsonModalOpen, setIsJsonModalOpen] = useState<boolean>(false);
  const [jsonText, setJsonText] = useState<string>('');
  const [jsonFeedback, setJsonFeedback] = useState<string | null>(null);

  const customEntropy = calculateShannonEntropy(customPayload);

  // Toggle single card expansion for mitigation and forensic details
  const toggleExpandVector = (id: number) => {
    setExpandedVectorIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Toggle individual vector selection
  const toggleVectorSelection = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Quick Selection Handlers
  const handleSelectAll = () => {
    setSelectedIds(new Set(vectors.map((v) => v.id)));
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleSelectOnlyDdos = () => {
    const ddosIds = vectors.filter((v) => v.category === 'DDOS' || v.category === 'DOS').map((v) => v.id);
    setSelectedIds(new Set(ddosIds));
  };

  const handleSelectRceZero = () => {
    const ids = vectors.filter((v) => v.category === 'RCE' || v.category === 'ZERO_DAY').map((v) => v.id);
    setSelectedIds(new Set(ids));
  };

  const handleSelectRansomKernel = () => {
    const ids = vectors.filter((v) => v.category === 'RANSOMWARE' || v.category === 'MEMORY_CORRUPTION' || v.category === 'PRIVILEGE_ESCALATION').map((v) => v.id);
    setSelectedIds(new Set(ids));
  };

  const handleSelectApiAuth = () => {
    const ids = vectors.filter((v) => v.category === 'AUTH_BYPASS' || v.category === 'API_GRAPHQL' || v.category === 'SQLI').map((v) => v.id);
    setSelectedIds(new Set(ids));
  };

  // Add Custom Vector Handler
  const handleSaveNewVector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVectorName.trim() || !newVectorPayload.trim()) return;

    const newId = Date.now();
    const created: AttackVector = {
      id: newId,
      name: newVectorName.trim(),
      category: newVectorCategory,
      cve: newVectorCve.trim() || 'CVE-PENDING',
      mitreId: newVectorMitre.trim() || 'T1059',
      owaspTag: newVectorOwasp.trim() || 'Custom Threat',
      riskLevel: newVectorRisk,
      protocol: newVectorProtocol.trim() || 'TCP/IP',
      year: new Date().getFullYear(),
      description: newVectorDescription.trim() || 'Egendefinert registrert angrepsvektor opprettet for utvidet testing.',
      payload: newVectorPayload.trim(),
      defaultCountermeasure: newVectorCountermeasure.trim() || 'Mirror Jamming & Phantom Loop',
      recommendedMitigation: newVectorMitigation.trim() || 'Streng mikrosegmentering og kontinuerlig integritetsvalidering.',
      enabled: true,
      isCustomUserVector: true,
    };

    const updated = saveCustomAttackVector(created);
    setVectors(updated);
    setSelectedIds((prev) => new Set([...prev, newId]));
    setIsAddModalOpen(false);

    // Reset form
    setNewVectorName('');
    setNewVectorDescription('');
    setNewVectorPayload('');
    setNewVectorMitigation('');
    setLastResponse(`Ny angrepsvektor "${created.name}" (#${created.id}) ble registrert og lagt til!`);
  };

  // Delete Custom Vector Handler
  const handleDeleteCustomVector = (id: number, name: string) => {
    if (!window.confirm(`Er du sikker på at du vil slette den egendefinerte vektoren "${name}"?`)) return;
    const updated = deleteCustomAttackVector(id);
    setVectors(updated);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // Filtered and Searched Vectors
  const displayedVectors = vectors.filter((v) => {
    // Search query check
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = v.name.toLowerCase().includes(q);
      const matchCve = v.cve?.toLowerCase().includes(q);
      const matchMitre = v.mitreId?.toLowerCase().includes(q);
      const matchProtocol = v.protocol?.toLowerCase().includes(q);
      const matchDesc = v.description.toLowerCase().includes(q);
      if (!matchName && !matchCve && !matchMitre && !matchProtocol && !matchDesc) {
        return false;
      }
    }

    // Category filter check
    if (filterCategory === 'ALL') return true;
    if (filterCategory === 'DDOS') return v.category === 'DDOS' || v.category === 'DOS';
    if (filterCategory === 'RCE_ZERO') return v.category === 'RCE' || v.category === 'ZERO_DAY';
    if (filterCategory === 'RANSOM_KERNEL') return v.category === 'RANSOMWARE' || v.category === 'MEMORY_CORRUPTION' || v.category === 'PRIVILEGE_ESCALATION';
    if (filterCategory === 'SUPPLY_CLOUD') return v.category === 'SUPPLY_CHAIN' || (v.owaspTag && v.owaspTag.includes('Server-Side Request Forgery'));
    if (filterCategory === 'AUTH_API') return v.category === 'AUTH_BYPASS' || v.category === 'API_GRAPHQL' || v.category === 'SQLI' || v.category === 'XSS';
    if (filterCategory === 'ICS_SCADA') return v.category === 'ICS_SCADA';
    if (filterCategory === 'AUTOMATED_ABUSE') return v.category === 'AUTOMATED_ABUSE' || v.category === 'CREDENTIAL_ATTACK';
    if (filterCategory === 'AI_SECURITY') return v.category === 'AI_SECURITY';
    if (filterCategory === 'CUSTOM') return v.isCustomUserVector === true;
    return true;
  });

  // Active pool of vectors that are selected
  const activeSelectedVectors = vectors.filter((v) => selectedIds.has(v.id));

  // Trigger dedicated DDoS generator
  const handleFireDDoSWave = async () => {
    if (!simulatorEnabled || isSimulating) return;

    let vectorId = 11; // default Mirai botnet
    if (ddosType === 'TCP_SYN') vectorId = 7;
    else if (ddosType === 'UDP_AMP') vectorId = 8;
    else if (ddosType === 'SLOWLORIS') vectorId = 9;
    else if (ddosType === 'HTTP_FLOOD') vectorId = 10;

    const payloadObj = {
      attack_type: ddosType,
      simulated_volume_gbps: ddosGbps,
      botnet_nodes_active: ddosBotCount,
      packets_per_sec: ddosPps,
      traffic_envelope: 'DISTRIBUTED_HIGH_VOLUME_BURST',
      timestamp: new Date().toISOString(),
    };

    const simulatedIp = `185.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 250) + 1}.80`;
    await onFireAttack(vectorId, JSON.stringify(payloadObj), simulatedIp);
    setDdosStatusMsg(`⚡ DDoS-bølge (${ddosGbps} Gbps / ${ddosBotCount.toLocaleString()} noder) ble avfyrt mot brannmuren! Mottiltak aktivert.`);
    setTimeout(() => setDdosStatusMsg(null), 6000);
  };

  const handleCustomFire = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPayload.trim()) return;
    await onFireAttack(7, customPayload, customIp);
    setLastResponse(`Egendefinert angrep sendt fra ${customIp}. Forsvaret reagerte umiddelbart!`);
  };

  // Open Export JSON
  const handleOpenExport = () => {
    setJsonText(exportAttackCatalogJson(vectors));
    setJsonFeedback(null);
    setIsJsonModalOpen(true);
  };

  // Import JSON Handler
  const handleExecuteImport = () => {
    if (!jsonText.trim()) return;
    const result = importAttackCatalogJson(jsonText);
    if (result.success) {
      const refreshed = getRegisteredAttackVectors();
      setVectors(refreshed);
      setSelectedIds(new Set(refreshed.map(v => v.id)));
      setJsonFeedback(`✓ Importerte ${result.count} nye angrepsvektorer!`);
      setTimeout(() => setIsJsonModalOpen(false), 2000);
    } else {
      setJsonFeedback(`❌ Feil ved import: ${result.error}`);
    }
  };

  const ddosCount = vectors.filter((v) => v.category === 'DDOS' || v.category === 'DOS').length;
  const customCount = vectors.filter((v) => v.isCustomUserVector).length;

  return (
    <div id="attack-simulator-container" className="space-y-6">
      {/* Simulator Status Banner */}
      {!simulatorEnabled && (
        <div className="p-4 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Angrepssimulatoren er for øyeblikket <strong>DEAKTIVERT (AV)</strong>. Slå den på i toppmenyen for å sende testprober.</span>
          </div>
        </div>
      )}

      {/* MASTER SELECTION & EXTENSION HEADER BAR */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950/40 border-2 border-rose-800/60 rounded-xl p-4 sm:p-5 shadow-xl space-y-3 font-mono">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-rose-400 animate-pulse" />
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                Universell Angrepskatalog // {vectors.length} Kjente & Registrerte Vektorer
              </h2>
              <p className="text-[11px] text-slate-400">
                Omfatter internasjonale CVE-sårbarheter, MITRE ATT&CK teknikker, OWASP Top 10 og volumetriske botnett. Velg eller velg vekk for tester.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 text-slate-300 font-bold">
              Valgt: <strong className="text-rose-400">{selectedIds.size}</strong> / {vectors.length} aktive
            </span>

            {/* Extension Buttons */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/40"
              title="Legg til og registrer en ny egendefinert angrepsvektor"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ny Vektor (Utvid)</span>
            </button>

            <button
              onClick={handleOpenExport}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-slate-100 text-xs transition-all flex items-center gap-1 cursor-pointer"
              title="Eksporter eller importer angrepskatalog i JSON"
            >
              <Download className="w-3 h-3 text-cyan-400" />
              <span>JSON Eksport/Import</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Hurtigvalg */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 pt-1">
          {/* Real-time Search input */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Søk CVE, MITRE, navn, protokoll (f.eks. Log4j, MS17-010, SYN, Modbus)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-rose-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-500 hover:text-slate-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Selection Buttons */}
          <div className="lg:col-span-8 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px] mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-cyan-400" /> Hurtigvalg:
            </span>
            <button
              onClick={handleSelectAll}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 hover:border-slate-500 font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <Check className="w-3 h-3 text-emerald-400" /> Alle ({vectors.length})
            </button>
            <button
              onClick={handleDeselectAll}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1"
            >
              <X className="w-3 h-3 text-rose-400" /> Ingen (0)
            </button>
            <button
              onClick={handleSelectOnlyDdos}
              className="px-2 py-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <Flame className="w-3 h-3 text-amber-400" /> Kun DDoS ({ddosCount})
            </button>
            <button
              onClick={handleSelectRceZero}
              className="px-2 py-1 rounded bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Zap className="w-3 h-3 text-purple-400" /> RCE & Zero-Day
            </button>
            <button
              onClick={handleSelectRansomKernel}
              className="px-2 py-1 rounded bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Lock className="w-3 h-3 text-red-400" /> Ransomware & Minne
            </button>
            <button
              onClick={handleSelectApiAuth}
              className="px-2 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 transition-colors cursor-pointer flex items-center gap-1"
            >
              <KeyRound className="w-3 h-3 text-cyan-400" /> API & Auth
            </button>
          </div>
        </div>

        {/* Filter Categories for Display */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1.5 rounded-lg border border-slate-800 text-[11px] pt-1">
          <button
            onClick={() => setFilterCategory('ALL')}
            className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
              filterCategory === 'ALL' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Alle Vektorer ({vectors.length})
          </button>
          <button
            onClick={() => setFilterCategory('DDOS')}
            className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
              filterCategory === 'DDOS' ? 'bg-rose-600 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            DDoS & Flom ({ddosCount})
          </button>
          <button
            onClick={() => setFilterCategory('RCE_ZERO')}
            className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
              filterCategory === 'RCE_ZERO' ? 'bg-purple-600 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            RCE & Zero-Day (Log4j, Spring, Shellshock)
          </button>
          <button
            onClick={() => setFilterCategory('RANSOM_KERNEL')}
            className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
              filterCategory === 'RANSOM_KERNEL' ? 'bg-red-600 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ransomware & Kjerne (WannaCry, EternalBlue, Heartbleed)
          </button>
          <button
            onClick={() => setFilterCategory('SUPPLY_CLOUD')}
            className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
              filterCategory === 'SUPPLY_CLOUD' ? 'bg-amber-600 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Supply Chain & Sky (SolarWinds, SSRF, NPM)
          </button>
          <button
            onClick={() => setFilterCategory('AUTH_API')}
            className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
              filterCategory === 'AUTH_API' ? 'bg-blue-600 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Auth & API (ZeroLogon, JWT, BOLA, GraphQL)
          </button>
          <button
            onClick={() => setFilterCategory('AUTOMATED_ABUSE')}
            className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
              filterCategory === 'AUTOMATED_ABUSE' ? 'bg-amber-600 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Automatiserte angrep / Brute Force / Stuffing
          </button>
          <button
            onClick={() => setFilterCategory('AI_SECURITY')}
            className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
              filterCategory === 'AI_SECURITY' ? 'bg-fuchsia-600 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            AI / TIP / MCP
          </button>
          <button
            onClick={() => setFilterCategory('ICS_SCADA')}
            className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
              filterCategory === 'ICS_SCADA' ? 'bg-emerald-600 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ICS/OT (Stuxnet PLC)
          </button>
          {customCount > 0 && (
            <button
              onClick={() => setFilterCategory('CUSTOM')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                filterCategory === 'CUSTOM' ? 'bg-teal-500 text-slate-950 font-bold shadow' : 'text-teal-300 hover:text-teal-100'
              }`}
            >
              Egendefinerte ({customCount})
            </button>
          )}
        </div>
      </div>

      {/* DEDICATED DDOS ATTACK GENERATOR & VOLUMETRIC BOTNET CONTROL */}
      <div className="bg-slate-950 border border-rose-900/60 rounded-xl p-4 sm:p-5 shadow-2xl relative overflow-hidden font-mono">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 relative z-10">
          <div>
            <h2 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-500" />
              Dedikert Distribuert DDoS-Generator & Botnett-Styring
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Simuler reelle massive distribuerte overbelastningsangrep for å teste motstandsdyktigheten i BGP Anycast-skrubbing og SYN-proxy.
            </p>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
            MULTI-GBPS SIMULATOR
          </span>
        </div>

        {/* DDoS Parameters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs pt-1">
          {/* Protocol Type */}
          <div>
            <label className="block text-slate-400 mb-1.5">Angrepsmetode / Protokoll:</label>
            <select
              value={ddosType}
              onChange={(e) => setDdosType(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs focus:outline-none focus:border-rose-500 cursor-pointer"
            >
              <option value="BOTNET">Mirai/Reaper IoT Multi-Vector Swarm (120 Gbps)</option>
              <option value="TCP_SYN">TCP SYN Flood (L4 Tilstandsutmattelse)</option>
              <option value="UDP_AMP">UDP DNS/NTP 50x Amplification Refleksjon</option>
              <option value="SLOWLORIS">Slowloris HTTP Header Starvation</option>
              <option value="HTTP_FLOOD">L7 HTTP GET/POST Applikasjonsflom</option>
            </select>
          </div>

          {/* Bandwidth Volume (Gbps) */}
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Båndbredde / Volum:</span>
              <strong className="text-rose-400 font-bold">{ddosGbps} Gbps</strong>
            </div>
            <input
              type="range"
              min="1"
              max="200"
              value={ddosGbps}
              onChange={(e) => setDdosGbps(parseInt(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>1 Gbps</span>
              <span>100 Gbps</span>
              <span>200 Gbps</span>
            </div>
          </div>

          {/* Active Botnet Nodes */}
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Infiserte Botnett-Noder:</span>
              <strong className="text-amber-400 font-bold">{ddosBotCount.toLocaleString()} noder</strong>
            </div>
            <input
              type="range"
              min="1000"
              max="100000"
              step="1000"
              value={ddosBotCount}
              onChange={(e) => setDdosBotCount(parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>1k</span>
              <span>50k</span>
              <span>100k noder</span>
            </div>
          </div>

          {/* Packet Rate (pps) */}
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Pakketakt (pps / rps):</span>
              <strong className="text-cyan-400 font-bold">{ddosPps.toLocaleString()} pps</strong>
            </div>
            <input
              type="range"
              min="5000"
              max="500000"
              step="5000"
              value={ddosPps}
              onChange={(e) => setDdosPps(parseInt(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>5k</span>
              <span>250k</span>
              <span>500k pps</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-slate-800/80">
          <div className="text-[11px] text-slate-400">
            Mottiltak som utløses ved test: <span className="text-cyan-300 font-bold">
              {ddosType === 'TCP_SYN' && 'SYN-Cookie Proxy + Aggressiv Half-Open Drop'}
              {ddosType === 'UDP_AMP' && 'BGP Anycast Scrubbing + UDP Rate-Limiting'}
              {ddosType === 'SLOWLORIS' && 'Aggressiv Keep-Alive Timeout + Connection Pool Scrub'}
              {ddosType === 'HTTP_FLOOD' && 'WAF Rate-Limiting + TLS Fingerprinting + JS Challenge'}
              {ddosType === 'BOTNET' && 'Global BGP Blackhole Routing + Autonom Botnett-Isolasjon'}
            </span>
          </div>

          <button
            id="btn-fire-ddos-wave"
            disabled={!simulatorEnabled || isSimulating}
            onClick={handleFireDDoSWave}
            className="py-2 px-5 rounded-lg bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-950 cursor-pointer"
          >
            <Flame className="w-4 h-4 text-slate-950" />
            <span>Avfyr Distribuert {ddosType.replace('_', ' ')} Flom NÅ</span>
          </button>
        </div>

        {ddosStatusMsg && (
          <div className="mt-2.5 p-2 rounded bg-rose-950/80 border border-rose-700 text-rose-200 text-xs font-mono">
            {ddosStatusMsg}
          </div>
        )}
      </div>

      {/* Advanced Attack Scenarios: Respekterer de valgte vektorene */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Avanserte Testscenarioer & Sverm-Orkestrator
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Kjører automatiske angrepsbølger basert på dine <strong>{activeSelectedVectors.length} valgte vektorer</strong>.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {/* Scenario 1: Swarm */}
          <HackerIntelTooltip
            customIntel={{
              title: 'Attacker Swarm (Distribuert Vektorsverm)',
              category: 'RED_TEAM',
              level: 'INTERMEDIATE',
              concept: 'Simulerer koordinert angrep fra et distribuert botnett med ulike samtidige angrepsvektorer.',
              redTeamTactic: 'Roterer mellom spoofede IP-er og blander L4 volumangrep med L7 webapplikasjons-prober for å overbelaste IDS-analysen.',
              blueTeamDefense: 'Automatisert rate-limiting, IP-reputasjonsfiltre og dynamisk honeypot-sinkholing av mistenkelige subnett.',
              toolName: 'Mirai / Custom Python Swarm',
              terminalCommand: 'python3 attack_swarm.py --targets 198.51.100.0/24 --threads 50',
              mitreTactic: 'TA0001 - Initial Access / TA0040 - Impact',
              proTip: 'Sverm-angrep avslører ofte flaskehalser i loggskriving (disk I/O) før selve nettverksbåndbredden mettes.'
            }}
            showIndicator={hackerHudEnabled}
            className="w-full"
          >
            <button
              id="btn-scenario-swarm"
              disabled={!simulatorEnabled || isSimulating || activeSelectedVectors.length === 0}
              onClick={() => onRunSwarm(activeSelectedVectors)}
              className="w-full p-3.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-amber-500/60 text-left transition-all group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" /> 1. Attacker Swarm
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  {activeSelectedVectors.length} aktive vektorer
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Sender en tilfeldig sverm av prober, CVE-utnyttelser og flom-angrep fra spoofede IP-adresser fra de {activeSelectedVectors.length} valgte vektorene.
              </p>
            </button>
          </HackerIntelTooltip>

          {/* Scenario 2: Sequential */}
          <HackerIntelTooltip
            customIntel={{
              title: 'Sekvensiell Penetrasjonstest (Eskalering)',
              category: 'RED_TEAM',
              level: 'ADVANCED',
              concept: 'Trinnvis test som simulerer en metodisk hacker som tester hver enkelt sårbarhet etter tur.',
              redTeamTactic: 'Følger metodikken fra PTES (Penetration Testing Execution Standard) for å kartlegge alle eksponerte flater.',
              blueTeamDefense: 'Korrelasjonsregler i SIEM som fanger opp at en enkelt kilde eller subnett utfører sekvensielle sonderinger.',
              toolName: 'Metasploit Pro / Burp Intruder',
              terminalCommand: 'msfconsole -r sequential_audit.rc',
              mitreTactic: 'TA0007 - Discovery & Lateral Movement',
              proTip: 'En tålmodig angriper sprer sonderingene utover dager ("low and slow") for å unngå terskelbaserte alarmer.'
            }}
            showIndicator={hackerHudEnabled}
            className="w-full"
          >
            <button
              id="btn-scenario-sequential"
              disabled={!simulatorEnabled || isSimulating || activeSelectedVectors.length === 0}
              onClick={() => onRunSequential(activeSelectedVectors)}
              className="w-full p-3.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-cyan-500/60 text-left transition-all group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> 2. Sekvensiell Eskalering
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Nivå 1 → {activeSelectedVectors.length}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Kjører en streng penetrasjonstest gjennom alle dine {activeSelectedVectors.length} valgte angrepsvektorer i rekkefølge.
              </p>
            </button>
          </HackerIntelTooltip>

          {/* Scenario 3: Stress */}
          <HackerIntelTooltip
            customIntel={{
              title: 'Entropi- & Flom-Stresstest',
              category: 'RED_TEAM',
              level: 'PRO',
              concept: 'Høyvolum stresstest for å verifisere at systemet ikke knekker eller slutter å logge under ekstrem belastning.',
              redTeamTactic: 'Genererer 18 samtidige trusselstrømmer med høy entropi for å fylle CPU-køer og minnebuffere.',
              blueTeamDefense: 'Asynkron SQLite WAL (Write-Ahead Logging), ring-buffere og kernel-level pakkeslipp (eBPF / XDP).',
              toolName: 'T-Rex / Scapy / Locust',
              terminalCommand: 'locust -f stress_test.py --headless -u 1000 -r 100',
              mitreTactic: 'T1499 - Endpoint Denial of Service',
              proTip: 'Fail-secure prinsippet: Hvis sikkerhetssystemet krasjer under last, må det stenge lukene – aldri åpne opp!'
            }}
            showIndicator={hackerHudEnabled}
            className="w-full"
          >
            <button
              id="btn-scenario-stress"
              disabled={!simulatorEnabled || isSimulating || activeSelectedVectors.length === 0}
              onClick={() => onRunStress(activeSelectedVectors)}
              className="w-full p-3.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-purple-500/60 text-left transition-all group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono font-bold text-purple-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" /> 3. Entropi- & Flom-Stresstest
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  Massiv Flom
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Fyrer 18 samtidige trusselstrømmer for å stressteste både Shannon Entropi og volumetrisk DDoS-filtrering.
              </p>
            </button>
          </HackerIntelTooltip>
        </div>

        {activeSelectedVectors.length === 0 && (
          <div className="mt-3 p-3 rounded-lg bg-amber-950/60 border border-amber-800 text-amber-300 text-xs font-mono flex items-center justify-between">
            <span>⚠️ Ingen angrepsvektorer er valgt. Vennligst velg minst én vektor ovenfor for å kjøre sverm- og stresstester.</span>
            <button
              onClick={handleSelectAll}
              className="px-2 py-1 bg-amber-500 text-slate-950 font-bold rounded hover:bg-amber-400 cursor-pointer"
            >
              Velg Alle Nå
            </button>
          </div>
        )}
      </div>

      {/* Complete Master Attack Matrix with Checkboxes, CVEs & Remediations */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-wider">
              Komplett Angrepsmatrise ({displayedVectors.length} Vektorer Vist / {vectors.length} Totalt)
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Klikk på avkrysningsboksen for å <strong>velge eller velge vekk</strong> en vektor
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {displayedVectors.map((vector) => {
            const isSelected = selectedIds.has(vector.id);
            const isDdos = vector.category === 'DDOS' || vector.category === 'DOS';
            const isExpanded = expandedVectorIds.has(vector.id);

            const riskBadge =
              vector.riskLevel === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border-rose-800' :
              vector.riskLevel === 'HIGH' ? 'bg-amber-950 text-amber-300 border-amber-800' :
              vector.riskLevel === 'MEDIUM' ? 'bg-purple-950 text-purple-300 border-purple-800' :
              'bg-cyan-950 text-cyan-300 border-cyan-800';

            return (
              <div
                key={vector.id}
                id={`vector-card-${vector.id}`}
                className={`rounded-lg p-3.5 flex flex-col justify-between transition-all border ${
                  isSelected
                    ? isDdos
                      ? 'bg-slate-900/95 border-rose-700/80 shadow-md shadow-rose-950/30'
                      : vector.isCustomUserVector
                      ? 'bg-slate-900/95 border-teal-600/80 shadow-md shadow-teal-950/20'
                      : 'bg-slate-900/90 border-slate-700'
                    : 'bg-slate-950/60 border-slate-850 opacity-60'
                }`}
              >
                <div>
                  {/* Card Header with Checkbox & Tags */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <button
                      onClick={() => toggleVectorSelection(vector.id)}
                      className="flex items-center gap-2 text-left cursor-pointer group flex-1"
                    >
                      <span className="text-rose-400 group-hover:scale-110 transition-transform flex-shrink-0">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600" />
                        )}
                      </span>
                      <span className={`text-xs font-mono font-bold leading-tight ${
                        isSelected ? 'text-slate-100' : 'text-slate-500 line-through'
                      }`}>
                        #{vector.id} {vector.name}
                      </span>
                    </button>

                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${riskBadge}`}>
                        {vector.riskLevel}
                      </span>
                      {vector.isCustomUserVector && (
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-teal-950 text-teal-300 border border-teal-800">
                          Egendefinert
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Badges: CVE, MITRE, Protocol, Year */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-2 font-mono text-[10px]">
                    {vector.cve && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300 font-bold">
                        {vector.cve}
                      </span>
                    )}
                    {vector.mitreId && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-purple-300">
                        MITRE {vector.mitreId}
                      </span>
                    )}
                    {vector.protocol && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                        {vector.protocol}
                      </span>
                    )}
                    {vector.year && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                        {vector.year}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 mb-2.5 leading-relaxed">
                    {vector.description}
                  </p>

                  {/* Volumetric Metrics if DDoS */}
                  {isDdos && (vector.volumetricGbps || vector.packetsPerSec) && (
                    <div className="grid grid-cols-2 gap-1.5 mb-2.5 text-[10px] font-mono bg-rose-950/30 border border-rose-900/40 p-2 rounded">
                      <div>
                        <span className="text-slate-400">Volum:</span>{' '}
                        <strong className="text-rose-300 font-bold">{vector.volumetricGbps} Gbps</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Pakketakt:</span>{' '}
                        <strong className="text-cyan-300 font-bold">{(vector.packetsPerSec || 0).toLocaleString()} pps</strong>
                      </div>
                    </div>
                  )}

                  {/* Payload preview */}
                  <div className="bg-slate-950 rounded p-2 border border-slate-800/80 mb-2">
                    <span className="text-[10px] text-slate-500 font-mono block">Payload testdata:</span>
                    <code className="text-[11px] text-cyan-300 font-mono block truncate">
                      {typeof vector.payload === 'string' ? vector.payload : JSON.stringify(vector.payload)}
                    </code>
                  </div>

                  {/* Default Countermeasure */}
                  <div className="text-[11px] font-mono text-slate-400 mb-2">
                    <span className="text-slate-500">Mottiltak:</span>{' '}
                    <span className="text-slate-300">{vector.defaultCountermeasure}</span>
                  </div>

                  {/* Expandable Details Toggle */}
                  {vector.recommendedMitigation && (
                    <div className="mb-2">
                      <button
                        onClick={() => toggleExpandVector(vector.id)}
                        className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>{isExpanded ? 'Skjul Anbefalt Sikring' : 'Vis Anbefalt Sikring & Remediering'}</span>
                      </button>

                      {isExpanded && (
                        <div className="mt-1.5 p-2 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                          <strong className="text-emerald-400 block">Anbefalt Forebygging:</strong>
                          <p className="text-slate-300 leading-snug">{vector.recommendedMitigation}</p>
                          {vector.owaspTag && (
                            <div className="text-[10px] text-slate-500 pt-1">
                              OWASP Kategori: <span className="text-slate-400">{vector.owaspTag}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Fire Button & Toggle Action */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60 mt-2">
                  <button
                    onClick={() => toggleVectorSelection(vector.id)}
                    className="text-[10px] font-mono px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                  >
                    {isSelected ? 'Velg vekk' : 'Velg'}
                  </button>

                  <HackerIntelTooltip
                    customIntel={{
                      title: `${vector.name} ${vector.cve ? `(${vector.cve})` : vector.mitreId ? `(${vector.mitreId})` : ''}`,
                      category: isDdos ? 'RED_TEAM' : 'RED_TEAM',
                      level: vector.severity === 'CRITICAL' ? 'PRO' : 'INTERMEDIATE',
                      concept: vector.description,
                      redTeamTactic: `Tester utnyttelse via ${vector.protocol || 'TCP/IP'}. Nyttelast: ${typeof vector.payload === 'string' ? vector.payload.slice(0, 60) : 'JSON payload'}.`,
                      blueTeamDefense: `Mottiltak: ${vector.defaultCountermeasure || 'Autonom isolasjon & signatur-matching'}.`,
                      mitreTactic: vector.mitreId ? `MITRE ATT&CK: ${vector.mitreId}` : undefined,
                      proTip: 'Etiske hackere sjekker alltid om angrepet trigger WAF/IDS-alarmer eller logges i SIEM.'
                    }}
                    showIndicator={hackerHudEnabled}
                    className="flex-1"
                  >
                    <button
                      id={`btn-fire-vector-${vector.id}`}
                      disabled={!simulatorEnabled || isSimulating}
                      onClick={() => onFireAttack(vector.id)}
                      className={`w-full py-1.5 px-3 rounded text-xs font-mono flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer ${
                        isDdos
                          ? 'bg-rose-950 hover:bg-rose-900/80 text-rose-300 border border-rose-800'
                          : 'bg-cyan-950 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800'
                      }`}
                    >
                      <Play className="w-3 h-3 group-hover:scale-110 transition-transform" />
                      <span>Avfyr #{vector.id}</span>
                    </button>
                  </HackerIntelTooltip>

                  {vector.isCustomUserVector && (
                    <button
                      onClick={() => handleDeleteCustomVector(vector.id, vector.name)}
                      className="p-1.5 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 cursor-pointer"
                      title="Slett denne egendefinerte vektoren"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Payload Injector & Shannon Calculator */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5">
        <h2 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-purple-400" />
          Egendefinert Payload-Injektor & Entropi-Kalkulator
        </h2>
        <p className="text-xs text-slate-400 font-mono mb-4">
          Skriv inn hvilken som helst egendefinert datastrøm, SQL-spørring eller skadevare-kode. Systemet beregner Shannon-entropi i sanntid og tester det autonome forsvaret.
        </p>

        <form onSubmit={handleCustomFire} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-3">
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Egendefinert Payload / Kode:
              </label>
              <textarea
                id="input-custom-payload"
                rows={3}
                value={customPayload}
                onChange={(e) => setCustomPayload(e.target.value)}
                placeholder="Skriv SQL, RCE shell, XSS eller mutert binærstreng..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 font-mono text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Simulert Angriper-IP:
                </label>
                <input
                  id="input-custom-ip"
                  type="text"
                  value={customIp}
                  onChange={(e) => setCustomIp(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-[11px] font-mono text-slate-400">Beregnet Shannon Entropi:</div>
                <div className="text-lg font-mono font-bold text-purple-400 flex items-center justify-between">
                  <span>{customEntropy.toFixed(2)}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                    customEntropy > 5.2 
                      ? 'bg-rose-950 text-rose-300 border-rose-800' 
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {customEntropy > 5.2 ? 'ZERO-DAY DETEKTERT' : 'Standard'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              id="btn-fire-custom-payload"
              type="submit"
              disabled={!simulatorEnabled || isSimulating || !customPayload.trim()}
              className="py-2 px-5 rounded-lg bg-purple-600 hover:bg-purple-500 text-slate-950 font-mono font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-950 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Avfyr Egendefinert Payload mot Honeypot</span>
            </button>

            {lastResponse && (
              <span className="text-xs font-mono text-emerald-400 truncate max-w-md">
                ✓ {lastResponse}
              </span>
            )}
          </div>
        </form>
      </div>

      {/* MODAL: OPPRETT NY EGENDEFINERT ANGREPSVEKTOR (UTVIDELSE) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border-2 border-emerald-600/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 font-mono max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-slate-100 text-sm uppercase">
                  Opprett & Registrer Ny Angrepsvektor (Utvidelse)
                </h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewVector} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Navn på Angrep / Sårbarhet *</label>
                  <input
                    type="text"
                    required
                    value={newVectorName}
                    onChange={(e) => setNewVectorName(e.target.value)}
                    placeholder="F.eks. OpenSSH RegreSSHion RCE"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Kategori</label>
                  <select
                    value={newVectorCategory}
                    onChange={(e) => setNewVectorCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="RCE">RCE (Remote Code Execution)</option>
                    <option value="ZERO_DAY">Zero-Day / Høy Entropi</option>
                    <option value="MEMORY_CORRUPTION">Minnekorrupsjon / Overflow</option>
                    <option value="RANSOMWARE">Ransomware / Cryptolocker</option>
                    <option value="AUTH_BYPASS">Autentiseringsomgåelse</option>
                    <option value="API_GRAPHQL">API / GraphQL Sårbarhet</option>
                    <option value="SUPPLY_CHAIN">Supply Chain & Bakdør</option>
                    <option value="PRIVILEGE_ESCALATION">Rettighetseskalering</option>
                    <option value="ICS_SCADA">ICS / SCADA Sabotasje</option>
                    <option value="DDOS">DDoS & Volumetrisk Flom</option>
                    <option value="SQLI">SQL-Injisering</option>
                    <option value="XSS">XSS / Klient-injeksjon</option>
                    <option value="AUTOMATED_ABUSE">Automatisert misbruk / OAT</option>
                    <option value="CREDENTIAL_ATTACK">Credential Attack / Brute Force / Stuffing</option>
                    <option value="AI_SECURITY">AI / LLM / TIP / MCP</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">CVE Referanse</label>
                  <input
                    type="text"
                    value={newVectorCve}
                    onChange={(e) => setNewVectorCve(e.target.value)}
                    placeholder="CVE-2024-6387"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">MITRE ATT&CK ID</label>
                  <input
                    type="text"
                    value={newVectorMitre}
                    onChange={(e) => setNewVectorMitre(e.target.value)}
                    placeholder="T1068"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Risikonivå</label>
                  <select
                    value={newVectorRisk}
                    onChange={(e) => setNewVectorRisk(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Protokoll / Vektor</label>
                  <input
                    type="text"
                    value={newVectorProtocol}
                    onChange={(e) => setNewVectorProtocol(e.target.value)}
                    placeholder="SSH Port 22 / Signal Race"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">OWASP / Klassifisering</label>
                  <input
                    type="text"
                    value={newVectorOwasp}
                    onChange={(e) => setNewVectorOwasp(e.target.value)}
                    placeholder="A06:2021-Vulnerable Components"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Beskrivelse</label>
                <textarea
                  rows={2}
                  value={newVectorDescription}
                  onChange={(e) => setNewVectorDescription(e.target.value)}
                  placeholder="Kort teknisk forklaring av hvordan trusselen opererer..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Test Payload (Signaturstreng / JSON) *</label>
                <textarea
                  rows={3}
                  required
                  value={newVectorPayload}
                  onChange={(e) => setNewVectorPayload(e.target.value)}
                  placeholder='F.eks. {"exploit": "ssh_sigalrm_race_condition", "glibc_target": "2.39"}'
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Default Mottiltak</label>
                  <input
                    type="text"
                    value={newVectorCountermeasure}
                    onChange={(e) => setNewVectorCountermeasure(e.target.value)}
                    placeholder="Blackout Isolation & Memory Scramble"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Anbefalt Sikring / Remediering</label>
                  <input
                    type="text"
                    value={newVectorMitigation}
                    onChange={(e) => setNewVectorMitigation(e.target.value)}
                    placeholder="Oppdater til versjon 9.8p1 og begrens LoginGraceTime."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold cursor-pointer"
                >
                  Lagre & Registrer Vektor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EKSPORT / IMPORT AV ANGREPSKATALOG I JSON */}
      {isJsonModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border-2 border-cyan-600/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-slate-100 text-sm uppercase">
                  JSON Angrepskatalog // Eksport & Import
                </h3>
              </div>
              <button 
                onClick={() => setIsJsonModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Kopier ut hele samlingen av registrerte CVE- og sårbarhetsvektorer, eller lim inn en ny testpakke for å utvide systemet.
            </p>

            <textarea
              rows={12}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-[11px] font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
            />

            {jsonFeedback && (
              <div className="p-2 rounded bg-slate-900 border border-cyan-800 text-xs font-mono text-cyan-200">
                {jsonFeedback}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(jsonText);
                  setJsonFeedback('✓ Kopiert til utklippstavlen!');
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs cursor-pointer"
              >
                Kopier til Utklippstavle
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsJsonModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                >
                  Lukk
                </button>
                <button
                  onClick={handleExecuteImport}
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs cursor-pointer flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Importer & Slå Sammen</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
