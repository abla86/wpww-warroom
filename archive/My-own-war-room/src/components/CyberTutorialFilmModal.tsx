import React, { useState, useEffect } from 'react';
import {
  Film,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  ShieldCheck,
  Radio,
  Swords,
  Crown,
  FileText,
  Download,
  Volume2,
  VolumeX,
  Award,
  CheckCircle2
} from 'lucide-react';
import { downloadFullProjectZip } from '../utils/projectZipExporter';

interface CyberTutorialFilmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: string) => void;
}

interface FilmScene {
  id: number;
  title: string;
  subtitle: string;
  durationSec: number;
  tabTarget?: string;
  badge: string;
  script: string[];
  visualHighlights: {
    icon: string;
    headline: string;
    details: string;
  }[];
  interactiveTip: string;
}

const FILM_SCENES: FilmScene[] = [
  {
    id: 1,
    title: 'Scene 1: Velkommen til WPWW Cyber War-Room',
    subtitle: 'Neste generasjons autonome forsvarsarkitektur',
    durationSec: 15,
    tabTarget: 'warroom',
    badge: 'ARKITEKTUR',
    script: [
      'Velkommen til WPWW Cyber War-Room — et helhetlig, produksjonsklart cybersikkerhetssystem.',
      'Dette systemet er bygget for å oppdage, nøytralisere og bevise cyberangrep i sanntid uten at data kan forfalskes.',
      'Her kobles radar, heuristisk analyse, gladiatorkamp og uforanderlig WORM-blokkjede sammen i en sømløs forsvarsborg.',
    ],
    visualHighlights: [
      { icon: '🛡️', headline: 'Fullstendig Forsvar', details: 'Beskytter lag 3 til 7 mot DDoS, Zero-Days og SCADA-sabotasje.' },
      { icon: '🔒', headline: 'WORM Forsegling', details: 'Hvert angrep hashes med SHA-256 for rettslig holdbar dokumentasjon.' },
      { icon: '⚡', headline: 'Autonom Reaksjon', details: 'Blokkerer trusler på under 2 millisekunder via eBPF- og WAF-regler.' },
    ],
    interactiveTip: 'Du kan når som helst trykke på "Last ned hele programmet som ZIP" for å kjøre alt 100% lokalt.',
  },
  {
    id: 2,
    title: 'Scene 2: Taktisk Radar & Innkommende Angrep',
    subtitle: 'Oppdager fiendtlige sonderinger og botnett i sanntid',
    durationSec: 18,
    tabTarget: 'radar',
    badge: 'SANNTIDSRADAR',
    script: [
      'Taktisk Radar overvåker portene døgnet rundt med kontinuerlig spektrumanalyse.',
      'Når en hacker skanner etter åpne porter eller sender en SQL-injisering, lyser radaren opp med fiendtlige blips.',
      'Systemet analyserer øyeblikkelig angriperens IP-adresse, opprinnelsesland og MITRE ATT&CK-taktikk.',
    ],
    visualHighlights: [
      { icon: '📡', headline: 'Sanntids Skann', details: 'Visualiserer angrepsvinkler med avstand og vinkel i polarkoordinater.' },
      { icon: '🚨', headline: 'Trusselnivåer', details: 'Klassifiserer alt fra milde sonderinger til kritiske ICS-trusler.' },
      { icon: '🌐', headline: 'Geo-IP Sporing', details: 'Isolerer infiserte nettverk og botnet-noder før de når applikasjonskjernen.' },
    ],
    interactiveTip: 'Prøv å trykke på "Simuler Angrep" i radaren for å se hvordan blippene dukker opp og fanges i sanntid.',
  },
  {
    id: 3,
    title: 'Scene 3: Matematisk Shannon-Entropi',
    subtitle: 'Hvordan fange ukjente zero-days uten faste signaturer',
    durationSec: 20,
    tabTarget: 'entropy',
    badge: 'ZERO-DAY HEURISTIKK',
    script: [
      'Vanlige antivirus leter etter kjente signaturer. Men hva med splitter nye, ukjente zero-day virus?',
      'WPWW benytter matematisk Shannon-entropi for å måle informasjonstettheten og uforutsigbarheten i rå binærstrøm.',
      'Når et virus pakkes med kryptering eller polymorfe shellcodes, skyter entropien over terskelen på 5.20 bits.',
      'Resultatet? Angrepet nøytraliseres umiddelbart, selv om ingen i verden har sett viruset før!',
    ],
    visualHighlights: [
      { icon: '📊', headline: 'Entropi-Spekter', details: 'Måler rå bytes fra 0 til 8 bits per tegn i sanntid.' },
      { icon: '🔬', headline: 'Polymorf Deteksjon', details: 'Avslører muterte ormer og krypterte ransomware-lastere.' },
      { icon: '🪤', headline: 'Tarpit Honeypot', details: 'Mistenkelige forespørsler omdirigeres til en sikker sandkassefelle.' },
    ],
    interactiveTip: 'I Entropi-motoren kan du skrive inn egne tekster for å se nøyaktig hvordan matematisk entropi beregnes.',
  },
  {
    id: 4,
    title: 'Scene 4: Gudemodus & Superkrefter',
    subtitle: 'Total overlegenhet over enhver fiendtlig trusselaktør',
    durationSec: 20,
    tabTarget: 'godmode',
    badge: 'GUDEMODUS',
    script: [
      'Trenger du å garantere null nedetid under et massivt cyberangrep?',
      'Gudemodus fjerner alle vanlige begrensninger: 100% blokkeringsrate, automatisk feilkorrigering og superkrefter.',
      'Med Mirror Jamming reflekteres angriperens pakker tilbake til deres egne servere, mens EMP-sjokkbølgen kutter fiendtlig C2-trafikk momentant.',
    ],
    visualHighlights: [
      { icon: '👑', headline: '100% Skjold', details: 'Full immunitet mot DDoS, SQLi, Buffer Overflow og Zero-Days.' },
      { icon: '🪞', headline: 'Mirror Jamming', details: 'Angriperen mottar sin egen destruktive payload i retur.' },
      { icon: '🔑', headline: 'Kvantelås', details: 'Roterer AES-256 nøkler og forsegler heap-minnet med Kyber-1024.' },
    ],
    interactiveTip: 'Trykk på kronen i hurtigdokken nede til høyre for å åpne Gudemodus Kontrollsentral.',
  },
  {
    id: 5,
    title: 'Scene 5: Cyber Arena & Battle Royale',
    subtitle: 'Rød mot Blå gladiatorkamp med live kodeforbedringer',
    durationSec: 22,
    tabTarget: 'arena',
    badge: 'CYBER ARENA',
    script: [
      'Den beste måten å teste forsvar på, er å la fiendtlige virus slåss mot våre AI-forsvarere i en lukket ring.',
      'I Cyber Arenaen kan du sette Stuxnet, Mirai og WannaCry opp mot WPWW Paladin og Kyber Sentinel i 1v1 dueller eller i Battle Royale hvor alle kjemper mot alle!',
      'Hver runde gir sanntidslogger, helsestolper og automatiske forslag til produksjonsklare YARA- og eBPF-regler.',
    ],
    visualHighlights: [
      { icon: '⚔️', headline: 'Gladiatorduell', details: 'Spesialangrep, kritiske treff og unike signaturtrekk.' },
      { icon: '🏆', headline: 'Battle Royale', details: 'Alle virus og forsvarere kjemper til kun én overlever.' },
      { icon: '📝', headline: 'YARA Regler', details: 'Genererer forsvarskode som kan lastes direkte inn i brannmuren.' },
    ],
    interactiveTip: 'Gå til "Arena ⚔️" i toppmenyen for å starte turneringen!',
  },
  {
    id: 6,
    title: 'Scene 6: Automatisert SOC Rapport & WORM Forensikk',
    subtitle: 'Uforfalskelige bevis og 1-klikks revisjonsdokumentasjon',
    durationSec: 18,
    tabTarget: 'report',
    badge: 'SOC REVISJON',
    script: [
      'Etter at angrepet er avverget, krever revisorer og ledelsen dokumentasjon.',
      'Automatisert SOC Rapport genererer en komplett rapport tilpasset EU NIS2-direktivet, ISO 27001 og GDPR.',
      'Alle hendelser er forseglet i en SHA-256 WORM-kjede. Du kan laste ned rapporten som printklar HTML, Markdown eller JSON med ett klikk!',
    ],
    visualHighlights: [
      { icon: '📑', headline: '1-Klikk Rapport', details: 'Genererer full revisjonsrapport på sekunder.' },
      { icon: '⚖️', headline: 'Rettslig Holdbart', details: 'WORM-kjeden beviser at loggene ikke har blitt manipulert.' },
      { icon: '💾', headline: 'ZIP Eksport', details: 'Last ned hele systemet og kjør det lokalt på din egen maskin.' },
    ],
    interactiveTip: 'Sjekk "Rapport 📑"-fanen for å se eller skrive ut din egen offisielle cybersikkerhetsrapport.',
  },
];

export const CyberTutorialFilmModal: React.FC<CyberTutorialFilmModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
}) => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progressSec, setProgressSec] = useState<number>(0);
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);

  const scene = FILM_SCENES[currentSceneIndex];

  // Auto-advancement timer for movie playback
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && isPlaying) {
      timer = setInterval(() => {
        setProgressSec((prev) => {
          if (prev + 1 >= scene.durationSec) {
            // Next scene
            if (currentSceneIndex + 1 < FILM_SCENES.length) {
              setCurrentSceneIndex((s) => s + 1);
              return 0;
            } else {
              setIsPlaying(false);
              return scene.durationSec;
            }
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, isPlaying, currentSceneIndex, scene.durationSec]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentSceneIndex + 1 < FILM_SCENES.length) {
      setCurrentSceneIndex((s) => s + 1);
      setProgressSec(0);
    }
  };

  const handlePrev = () => {
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex((s) => s - 1);
      setProgressSec(0);
    }
  };

  const handleJumpToScene = (idx: number) => {
    setCurrentSceneIndex(idx);
    setProgressSec(0);
  };

  const handleDownloadZip = async () => {
    setDownloadMsg('Forbereder ZIP...');
    const ok = await downloadFullProjectZip((msg) => setDownloadMsg(msg));
    setTimeout(() => setDownloadMsg(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-4xl bg-slate-950 border-2 border-cyan-500/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* FILM HEADER */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-mono font-bold text-white uppercase flex items-center gap-2">
                Cyber War-Room Masterclass: Opplæringsfilm & Veileder
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Scene {scene.id} av {FILM_SCENES.length} — {scene.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-mono text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer hover:brightness-110"
              title="Last ned hele prosjektet som en ferdig ZIP-fil"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Last ned ZIP</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PROGRESS BAR & SCENE SELECTOR */}
        <div className="bg-slate-950 px-4 py-2 border-b border-slate-900 flex items-center justify-between gap-2 overflow-x-auto text-xs font-mono">
          <div className="flex items-center gap-1.5">
            {FILM_SCENES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => handleJumpToScene(idx)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap ${
                  idx === currentSceneIndex
                    ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {idx + 1}. {s.badge}
              </button>
            ))}
          </div>

          <div className="text-slate-500 text-[11px] shrink-0">
            {progressSec}s / {scene.durationSec}s
          </div>
        </div>

        {/* FILM VIEWPORT / CANVAS */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          {/* Active Scene Hero Banner */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-xl space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono text-[10px] font-bold uppercase tracking-wider">
                {scene.badge}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Lyd & Visuell Demonstrasjon
              </span>
            </div>

            <h3 className="text-lg font-bold font-mono text-white">
              {scene.title}
            </h3>
            <p className="text-xs font-mono text-cyan-300">
              {scene.subtitle}
            </p>

            {/* Script Audio-Visual Narration Box */}
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800/80 space-y-2 text-xs font-mono text-slate-200 leading-relaxed">
              {scene.script.map((p, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">▶</span>
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {scene.visualHighlights.map((hl, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 hover:border-cyan-500/60 transition-colors"
              >
                <div className="text-2xl">{hl.icon}</div>
                <div className="text-xs font-bold font-mono text-slate-100">{hl.headline}</div>
                <p className="text-[11px] font-mono text-slate-400 leading-relaxed">{hl.details}</p>
              </div>
            ))}
          </div>

          {/* Interactive Pro Tip & Jump-to-feature */}
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-amber-200">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{scene.interactiveTip}</span>
            </div>

            {scene.tabTarget && onNavigateToTab && (
              <button
                onClick={() => {
                  onNavigateToTab(scene.tabTarget!);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer shadow"
              >
                <span>Prøv denne modulen nå</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* FILM CONTROLS FOOTER */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="py-2 px-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Pause' : 'Spill av'}</span>
            </button>

            <button
              onClick={() => setProgressSec(0)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              title="Start denne scenen på nytt"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handlePrev}
              disabled={currentSceneIndex === 0}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs disabled:opacity-40 flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Forrige Scene</span>
            </button>

            <button
              onClick={handleNext}
              disabled={currentSceneIndex === FILM_SCENES.length - 1}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs disabled:opacity-40 flex items-center gap-1 cursor-pointer"
            >
              <span className="hidden sm:inline">Neste Scene</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {downloadMsg && (
              <span className="text-xs font-mono text-amber-300 animate-pulse">{downloadMsg}</span>
            )}
            <button
              onClick={handleDownloadZip}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-mono text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
              title="Last ned hele prosjektet som en komplett ZIP"
            >
              <Download className="w-4 h-4" />
              <span>Last ned hele programmet (ZIP)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
