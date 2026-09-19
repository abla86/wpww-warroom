import React, { useState } from 'react';
import {
  X,
  BookOpen,
  HelpCircle,
  Activity,
  FileText,
  ShieldCheck,
  Swords,
  Search,
  Sparkles,
  ChevronRight,
  Lightbulb,
  CheckCircle2,
  Cpu,
  Lock,
  Compass,
  ArrowRight,
  Terminal,
  Zap,
  Radio
} from 'lucide-react';
import { SystemStats } from '../types';

interface CyberGuideAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
  stats?: SystemStats;
  onSelectTab?: (tabId: string) => void;
  onOpenNotes?: () => void;
}

interface GuideTopic {
  id: string;
  title: string;
  shortDesc: string;
  icon: React.ElementType;
  badge?: string;
  content: {
    summary: string;
    points: { heading: string; detail: string }[];
    codeExample?: string;
    codeLang?: string;
    actionLabel?: string;
    actionTab?: string;
  };
}

const GUIDE_TOPICS: GuideTopic[] = [
  {
    id: 'quickstart',
    title: 'Hurtigveileder: Hva er WPWW WarRoom?',
    shortDesc: 'Oversikt over systemets oppbygning, de viktigste skjermene og arbeidsflyten.',
    icon: Compass,
    badge: 'START HER',
    content: {
      summary:
        'WPWW WarRoom er et helhetlig, autonomt cyberforsvars- og kampsimulatorsenter. Systemet lar deg overvåke sanntidstrusler, simulere avanserte angrep, teste forsvarslag og dokumentere funn som en profesjonell etisk hacker.',
      points: [
        {
          heading: '1. Taktisk Radar & Live View',
          detail: 'Gir deg et 360-graders sanntidsbilde av innkommende pakker, oppdagede trusler og automatiske mottiltak.',
        },
        {
          heading: '2. De 4 Forsvarslagene (Defense-in-Depth)',
          detail: 'Trafikken filtreres trinnvis gjennom eBPF XDP (nettverk), Shannon Entropi (obfuskasjon), Minne-ASLR/Honeypot (applikasjon) og WORM Hash-Kjede (forensikk).',
        },
        {
          heading: '3. Red Team vs Blue Team Simulator',
          detail: 'La kjente cybertrusler (Mirai, Stuxnet, Ransomware, Zero-Days) kjempe mot forsvarsmuren. Se hvem som vinner, og lær av angrepsvektorene.',
        },
        {
          heading: '4. Systemhelse & Hacker Notater',
          detail: 'Følg CPU/minnebruk, kjør systemdiagnostikk, og logg hendelsesrapporter med kodesnutter og YARA-regler direkte i feltjournalen.',
        },
      ],
      actionLabel: 'Gå til Taktisk Radar',
      actionTab: 'radar',
    },
  },
  {
    id: 'systemhealth',
    title: 'Systemhelse & Diagnostikk Veileder',
    shortDesc: 'Slik forstår du telemetri, Shannon-entropi, eBPF og feilsøking.',
    icon: Activity,
    badge: 'SYSTEMHELSE',
    content: {
      summary:
        'Systemhelse-panelet overvåker 8 kritiske delsystemer for å sikre at ingen buffere mettes og at forsvaret reagerer på under 1 millisekund.',
      points: [
        {
          heading: 'Shannon Entropi (Normalt: 3.5 - 6.5 bits)',
          detail: 'Shannon-entropi måler uforutsigbarhet i data. Ren tekst og HTTP har lav entropi (~4 bits). Komprimert eller kryptert ondsinnet shellcode har svært høy entropi (7.20 - 8.00 bits). Verdier over 7.20 bits flagges automatisk som potensiell zero-day.',
        },
        {
          heading: 'eBPF XDP Ingress (Kjerne-nivå)',
          detail: 'eBPF tillater kjøring av sandkasseprogrammer direkte i Linux-kjernen. Ved 100 Gbps DDoS kaster XDP-filteret uønskede pakker før de bruker CPU-tid eller RAM-minne.',
        },
        {
          heading: 'WORM SHA-256 Integritet',
          detail: 'WORM (Write Once, Read Many) betyr at hver logghendelse forsegles med SHA-256 i en uforanderlig kjede. Selv om en hacker oppnår root-tilgang, kan de ikke manipulere eller slette tidligere logger.',
        },
        {
          heading: 'Hva gjør jeg ved feil eller advarsel?',
          detail: 'Klikk "Kjør Full Diagnostikk" for å kjøre en 5-trinns integritetssjekk, eller "Rens Buffere" for å frigjøre fragmentert minne. Hvis et delsystem viser WARNING, trykk "Selvreparer".',
        },
      ],
      codeLang: 'bash',
      codeExample: `# Hurtigsjekk av eBPF XDP filtre og entropi via terminal:
bpftool net show
cat /proc/sys/net/core/bpf_jit_enable # Skal returnere 1 for optimal ytelse`,
      actionLabel: 'Åpne Systemhelse-panel',
      actionTab: 'health',
    },
  },
  {
    id: 'hackernotes',
    title: 'Hacker Notater & Incident Journaling',
    shortDesc: 'Metodikk for å dokumentere hendelser, skrive YARA-regler og samle IOC-er.',
    icon: FileText,
    badge: 'NOTATER',
    content: {
      summary:
        'I en reell cyberkrise er nøyaktig dokumentasjon forskjellen på suksess og katastrofe. Hacker Notes lar deg opprette strukturerte incident-logger med ferdige maler.',
      points: [
        {
          heading: '1. Incident Triage',
          detail: 'Registrer tidspunkt, angrepsvektor, berørte systemer og umiddelbare isolasjonstiltak for å stoppe lateral forflytning.',
        },
        {
          heading: '2. YARA-regler for Deteksjon',
          detail: 'Når du oppdager en ukjent payload i simuleringen, skriv en YARA-regel som beskriver dens unike heksadesimale signatur ($rop_chain, $shellcode) så den fanges permanent.',
        },
        {
          heading: '3. IOC-lister (Indicators of Compromise)',
          detail: 'Loggfør mistenkelige IP-adresser, SHA-256 hash-verdier og C2-domener så de kan deles med nasjonale responsmiljøer (CSIRT / CERT).',
        },
        {
          heading: '4. Eksport og Deling',
          detail: 'Du kan når som helst eksportere et enkeltnotat som Markdown (.md) eller hele notatbasen som en sikkerhetskopi i JSON-format.',
        },
      ],
      codeLang: 'yara',
      codeExample: `rule Detect_Suspicious_ROP {
  strings:
    $pivot = { 58 C3 } // pop rax; ret
  condition:
    $pivot at 0x100
}`,
      actionLabel: 'Åpne Hacker Notes',
    },
  },
  {
    id: 'defenselayers',
    title: 'De 4 Forsvarslagene: Dypdykk i Beskyttelsen',
    shortDesc: 'Slik samarbeider nettverk, entropi, minne og WORM for å beskytte kjernen.',
    icon: ShieldCheck,
    badge: 'ARKITEKTUR',
    content: {
      summary:
        'WPWW WarRoom benytter flerlagsforsvar ("Defense-in-Depth"). Ingen enkeltkomponent bærer hele ansvaret for sikkerheten.',
      points: [
        {
          heading: 'Lag 1: Nettverksfilter & DDoS (eBPF XDP)',
          detail: 'Filtrerer råpakker før operativsystemets nettverksstakk. Stopper volumetriske flommer, syn-skanning og spoofede IP-adresser.',
        },
        {
          heading: 'Lag 2: Shannon Entropi & Pakkeinspeksjon (DPI)',
          detail: 'Analyserer innholdet i pakken. Normaliserer heksadesimale koder, oppdager SQL-injeksjon og flagger høy entropi.',
        },
        {
          heading: 'Lag 3: Applikasjonsskjold & Honeypot',
          detail: 'Aktiverer dynamisk 64-bit ASLR, isolerer ukjente prosesser i sandkasser og lokker angripere inn i syntetiske honeypots (porter 22, 445, 102).',
        },
        {
          heading: 'Lag 4: WORM Forensisk Sikkerhetskopi',
          detail: 'Forsegler hendelsesloggen med uforanderlige SHA-256 kjedeblokker. Sikrer beviskjede for rettslig oppfølging og gjenoppretting.',
        },
      ],
      actionLabel: 'Se Forsvarslag i Simulator',
      actionTab: 'simulator',
    },
  },
  {
    id: 'battledynamics',
    title: 'Red vs Blue Kampledelse & Balansert Arena',
    shortDesc: 'Forstå hvorfor brannmuren ikke alltid vinner, og hvordan du tester begge sider.',
    icon: Swords,
    badge: 'KAMPLEDELSE',
    content: {
      summary:
        'I den virkelige verden vinner angriperen hvis de finner én eneste sårbarhet, mens forsvareren må beskytte alt. Derfor har WPWW WarRoom en balansert kampledelse der både Red Team og Blue Team kan seire.',
      points: [
        {
          heading: 'Scenario 1: Balansert Kamp (50/50)',
          detail: 'Angriperens entropi, stealth og ROP-kjeder veies opp mot brannmurens prosessorkraft og speilingsgrad. Utfallet er dynamisk og uforutsigbart.',
        },
        {
          heading: 'Scenario 2: Red Team Seier (Viruset Vinner)',
          detail: 'Demonstrerer hva som skjer når et polymorft zero-day virus omgår ASLR, unngår signaturkontroll og bryter gjennom alle 4 lag til full root-tilgang.',
        },
        {
          heading: 'Scenario 3: Blue Team Seier (Brannmuren Forsvarer)',
          detail: 'Viser hvordan dyp pakkekontroll og WORM-lås isolerer trusselen i en sandkasse og nøytraliserer angrepet på lag 2 eller 3.',
        },
        {
          heading: 'Scenario 4: Gudemodus (100% Ugjennomtrengelig)',
          detail: 'Aktiverer teoretisk full autonom barriere hvor ingen angrep noensinne kan trenge forbi lag 1.',
        },
      ],
      actionLabel: 'Gå til Kamparenaen',
      actionTab: 'godmode',
    },
  },
];

const FAQ_ITEMS = [
  {
    q: 'Hva gjør jeg hvis jeg ser "Hash Manipulert!" i topplinjen?',
    a: 'Dette indikerer at en uautorisert endring ble forsøkt i loggfilen eller databasen. WORM-motoren oppdager dette umiddelbart fordi den nye SHA-256 hashen ikke stemmer med forrige blokk. Klikk på "Hash-Kjede" i toppmenyen for å inspisere nøyaktig hvilken blokk som ble forsøkt endret.',
  },
  {
    q: 'Hva er forskjellen på "Gudemodus" og vanlig simulering?',
    a: 'I Gudemodus er forsvarsmuren konfigurert til 100% ugjennomtrengelighet for demonstrasjonsformål. I vanlig og balansert modus kan avanserte virus som Phantom-ZeroDay eller Mirai-Swarm finne hull og vinne runden for å demonstrere sårbarheter.',
  },
  {
    q: 'Kan jeg eksportere alt jeg har gjort og laste det inn på en annen PC?',
    a: 'Ja! Klikk på "Eksport"-knappen øverst til høyre og velg "JSON Komplett Konfigurasjon". Filen inneholder alle forsvarsinnstillinger, kampscore og historikk. Du kan gjenopprette den når som helst via "Gjenopprett fra Fil".',
  },
  {
    q: 'Hvor lagres mine Hacker Notater?',
    a: 'Notatene lagres trygt i nettleserens lokale lager (localStorage). De forsvinner ikke når du oppdaterer siden. Du kan også laste dem ned som en backupfil (.json) eller Markdown (.md) direkte fra notatpanelet.',
  },
];

export const CyberGuideAdvisorModal: React.FC<CyberGuideAdvisorModalProps> = ({
  isOpen,
  onClose,
  initialTopic = 'quickstart',
  stats,
  onSelectTab,
  onOpenNotes,
}) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(initialTopic);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  if (!isOpen) return null;

  const currentTopic =
    GUIDE_TOPICS.find((t) => t.id === selectedTopicId) || GUIDE_TOPICS[0];

  const filteredTopics = GUIDE_TOPICS.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.shortDesc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFaqs = FAQ_ITEMS.filter(
    (f) =>
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-950 border border-cyan-700/80 rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl text-white shadow-md shadow-cyan-950">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>SOC Veileder & Cyberguide</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono font-bold">
                  INTERAKTIV HJELP
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Pedagogisk veiledning, forklaringer på norsk, beste praksis og spørsmål & svar.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Contextual Health Tip Banner */}
        {stats && (
          <div className="bg-cyan-950/40 border-b border-cyan-900/60 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-cyan-300">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>
                <strong>Sanntids Veileder-Råd:</strong> Systemstatus er{' '}
                <span className="text-emerald-400 font-bold">OPTIMAL</span>. Shannon-entropi er satt til{' '}
                <span className="text-amber-300">{stats.entropyThreshold} bits</span> med{' '}
                <span className="text-cyan-300">{stats.dpiWorkerCores} DPI kjerner</span> aktive.
              </span>
            </div>
            <div className="text-slate-400 text-[11px]">
              WORM Status: {stats.integrityVerified ? '✔️ Forseglet' : '⚠️ Advarsel'}
            </div>
          </div>
        )}

        {/* Main Content (Sidebar + Reader Pane) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Sidebar Topics */}
          <div className="w-full md:w-80 border-r border-slate-800 flex flex-col bg-slate-950/60">
            {/* Search Input */}
            <div className="p-3 border-b border-slate-800">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Søk i veilederen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-600 font-mono"
                />
              </div>
            </div>

            {/* Topic Navigation */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
              <div className="text-[10px] font-mono text-slate-500 uppercase px-2 py-1">
                Veiledningsmoduler
              </div>

              {filteredTopics.map((topic) => {
                const isSelected = topic.id === selectedTopicId;
                const IconComponent = topic.icon;

                return (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopicId(topic.id)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/50 border-cyan-600/90 shadow-md shadow-cyan-950/50'
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${
                        isSelected ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-200 truncate">
                          {topic.title}
                        </span>
                        {topic.badge && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400 shrink-0">
                            {topic.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                        {topic.shortDesc}
                      </p>
                    </div>
                  </button>
                );
              })}

              {/* FAQ Section Trigger in Sidebar */}
              <div className="pt-2">
                <div className="text-[10px] font-mono text-slate-500 uppercase px-2 py-1">
                  Vanlige Spørsmål
                </div>
                <button
                  onClick={() => setSelectedTopicId('faq')}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                    selectedTopicId === 'faq'
                      ? 'bg-cyan-950/50 border-cyan-600/90 shadow-md'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg shrink-0 ${
                      selectedTopicId === 'faq' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-200">Spørsmål & Svar (FAQ)</div>
                    <div className="text-[11px] text-slate-400">Ofte stilte spørsmål om drift</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Content View */}
          <div className="flex-1 flex flex-col overflow-y-auto p-6 bg-slate-950 space-y-6">
            {selectedTopicId === 'faq' ? (
              /* FAQ View */
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-cyan-400" />
                    Vanlige Spørsmål & Svar (FAQ)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Svar på vanlige problemstillinger og hendelser i WPWW WarRoom.
                  </p>
                </div>

                <div className="space-y-3">
                  {filteredFaqs.map((faq, idx) => {
                    const isOpen = expandedFaq === idx;

                    return (
                      <div
                        key={idx}
                        className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden transition-all"
                      >
                        <button
                          onClick={() => setExpandedFaq(isOpen ? null : idx)}
                          className="w-full p-3.5 text-left flex items-center justify-between gap-3 text-sm font-semibold text-slate-200 hover:text-cyan-300 transition-colors cursor-pointer"
                        >
                          <span>{faq.q}</span>
                          <ChevronRight
                            className={`w-4 h-4 text-slate-500 transition-transform ${
                              isOpen ? 'rotate-90 text-cyan-400' : ''
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-3.5 pb-3.5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3 bg-slate-950/40">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Selected Topic View */
              <div className="space-y-6">
                {/* Topic Header */}
                <div className="border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Veiledningsartikkel</span>
                  </div>
                  <h1 className="text-xl font-bold text-white mt-1 tracking-wide">
                    {currentTopic.title}
                  </h1>
                  <p className="text-sm text-slate-300 mt-2 leading-relaxed bg-cyan-950/30 p-3.5 rounded-xl border border-cyan-900/60">
                    {currentTopic.content.summary}
                  </p>
                </div>

                {/* Main Points */}
                <div className="space-y-4">
                  <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                    Sentrale Prinsipper & Veiledning
                  </h4>

                  <div className="grid grid-cols-1 gap-3.5">
                    {currentTopic.content.points.map((pt, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          <div>
                            <div className="text-sm font-bold text-slate-100">{pt.heading}</div>
                            <div className="text-xs text-slate-300 mt-1 leading-relaxed">
                              {pt.detail}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Code Example (if available) */}
                {currentTopic.content.codeExample && (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
                    <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-cyan-400">
                      <div className="flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Eksempelkode ({currentTopic.content.codeLang?.toUpperCase()})</span>
                      </div>
                    </div>
                    <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto bg-slate-950/70">
                      <code>{currentTopic.content.codeExample}</code>
                    </pre>
                  </div>
                )}

                {/* Direct Action Button */}
                {currentTopic.content.actionLabel && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="text-xs text-slate-400">
                      Klar til å teste i praksis?
                    </div>

                    {currentTopic.id === 'hackernotes' ? (
                      <button
                        onClick={() => {
                          onClose();
                          if (onOpenNotes) onOpenNotes();
                        }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
                      >
                        <span>{currentTopic.content.actionLabel}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (currentTopic.content.actionTab && onSelectTab) {
                            onSelectTab(currentTopic.content.actionTab);
                          }
                          onClose();
                        }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
                      >
                        <span>{currentTopic.content.actionLabel}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
