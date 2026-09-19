import React, { useState, useEffect } from 'react';
import {
  X,
  Award,
  CheckCircle2,
  Terminal,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Code2,
  Zap,
  Play,
  Copy,
  Check,
  HelpCircle,
  Bug,
  Lock,
  Cpu,
  Binary
} from 'lucide-react';

interface CyberTrainingWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerSimulatorAttack?: (attackId: string) => void;
}

interface MissionStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  actionRequired: string;
  commandSnippet: string;
  verificationExpected: string;
}

interface Mission {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  category: 'SCADA_ICS' | 'RANSOMWARE' | 'ZERO_DAY' | 'DDOS' | 'FORENSICS';
  difficulty: 'REKRUTT' | 'AVANSERT' | 'EKSPERT' | 'SUPERHACKER';
  xpReward: number;
  briefing: string;
  cveRef: string;
  steps: MissionStep[];
}

export const CyberTrainingWalkthroughModal: React.FC<CyberTrainingWalkthroughModalProps> = ({
  isOpen,
  onClose,
  onTriggerSimulatorAttack,
}) => {
  const missions: Mission[] = [
    {
      id: 'mission-1-stuxnet',
      number: 1,
      title: 'Oppdrag 1: Nøytraliser Stuxnet PLS-Sabotasje',
      subtitle: 'Industrielt ICS/SCADA-forsvar og YARA-deteksjon',
      category: 'SCADA_ICS',
      difficulty: 'REKRUTT',
      xpReward: 250,
      briefing: 'En fremmed trusselaktør forsøker å manipulere sentrifugefrekvensene via modifiserte Step7 PLS-drivere (CVE-2010-2568). Din oppgave er å avskjære DLL-kallene og distribuere en YARA-deteksjonsregel.',
      cveRef: 'CVE-2010-2568',
      steps: [
        {
          id: 'm1-s1',
          stepNumber: 1,
          title: 'Trinn 1: Kartlegg mistenkelige PLS-forbindelser',
          description: 'Skann nettverkssegmentet for uautorisert trafikk mot Siemens S7-port 102.',
          actionRequired: 'Kjør nettverksskanning for å identifisere kilden til PLS-manipulasjonen.',
          commandSnippet: 'nmap -p 102 --script s7-info 192.168.1.100',
          verificationExpected: 'Port 102/tcp åpen: Siemens Simatic S7 med uautorisert DLL-referanse "s7otbxsx.dll" oppdaget.'
        },
        {
          id: 'm1-s2',
          stepNumber: 2,
          title: 'Trinn 2: Distribuer YARA Deteksjonsregel',
          description: 'Last inn SOC YARA-signaturen i minneskanneren for å nøytralisere sabotasje-payloaden.',
          actionRequired: 'Kompiler og aktiver YARA-regelen mot minnedumpen.',
          commandSnippet: 'yara -s rules/stuxnet_s7.yar /proc/scada_daemon/mem',
          verificationExpected: 'Treff: Stuxnet_S7_Manipulator i minneblokk 0x7FFF98A0. Prosess hengt og satt i karantene.'
        },
        {
          id: 'm1-s3',
          stepNumber: 3,
          title: 'Trinn 3: Gjenopprett Sikkerhetsbaseline',
          description: 'Lås frekvensregisteret til 1064 Hz nominell rotasjonshastighet og aktiver WORM-logging.',
          actionRequired: 'Forsegl tilstandsendringen i den uforanderlige SHA-256 revisjonsloggen.',
          commandSnippet: 'wpww-defense --seal-plc-baseline --rate 1064 --worm-commit',
          verificationExpected: 'Status: Sentrifugerotor stabilisert på 1064.0 Hz. Bevisblokk forseglet i WORM-kjeden.'
        }
      ]
    },
    {
      id: 'mission-2-wannacry',
      number: 2,
      title: 'Oppdrag 2: Stopp WannaCry EternalBlue SMB-Spredning',
      subtitle: 'Nettverksisolering og eBPF XDP Kjernebrannmur',
      category: 'RANSOMWARE',
      difficulty: 'AVANSERT',
      xpReward: 350,
      briefing: 'Ormen WannaCry sprer seg aggressivt over lokalnettet via sårbarheten i Microsoft SMBv1 (MS17-010). Du må blokkere port 445 på drivernivå med eBPF før filsystemet krypteres.',
      cveRef: 'CVE-2017-0144',
      steps: [
        {
          id: 'm2-s1',
          stepNumber: 1,
          title: 'Trinn 1: Identifiser innkommende SMBv1-probe',
          description: 'Analyser pakkestrømmen for å fange opp mistenkelige SMB_COM_TRANSACTION2 forespørsler.',
          actionRequired: 'Kjør dyp pakkeanalyse på grensesnitt eth0.',
          commandSnippet: 'tshark -i eth0 -f "tcp port 445" -Y "smb.cmd == 0x32" -c 10',
          verificationExpected: 'Fanget 10 illegitime SMBv1 FEA-pakker med buffer overflow payload fra 198.51.100.42.'
        },
        {
          id: 'm2-s2',
          stepNumber: 2,
          title: 'Trinn 2: Last inn eBPF XDP Dropp-Filter',
          description: 'Aktiver kjernebrannmuren for å droppe all innkommende port 445-trafikk på nettverkskortet før kjernen berøres.',
          actionRequired: 'Kompiler og last inn xdp_smb_shield.o på nettverksdriveren.',
          commandSnippet: 'ip link set dev eth0 xdpgeneric obj xdp_smb_shield.o sec xdp',
          verificationExpected: 'eBPF XDP program lastet suksessfullt. 14.8M pakker/sek droppet i maskinvaren.'
        },
        {
          id: 'm2-s3',
          stepNumber: 3,
          title: 'Trinn 3: Deaktiver SMBv1 Globalt',
          description: 'Fjern den sårbare protokollen permanent fra vertskonfigurasjonen.',
          actionRequired: 'Kjør PowerShell systemherdning.',
          commandSnippet: 'Disable-WindowsOptionalFeature -Online -FeatureName SMB1Protocol -NoRestart',
          verificationExpected: 'SMBv1 permanent deaktivert. Angrepsvektoren er stengt for evig tid.'
        }
      ]
    },
    {
      id: 'mission-3-entropy',
      number: 3,
      title: 'Oppdrag 3: Avslør Obfuskert Zero-Day via Shannon Entropi',
      subtitle: 'Matematisk informasjons-tetthet og heksadesimal analyse',
      category: 'ZERO_DAY',
      difficulty: 'EKSPERT',
      xpReward: 450,
      briefing: 'En avansert trusselaktør (APT) bruker XOR-obfuskert shellcode som omgår tradisjonelle signaturbaserte brannmurer. Bruk Shannon Entropi-motoren for å avsløre den unormale datatettheten.',
      cveRef: 'CWE-506 / MITRE T1027',
      steps: [
        {
          id: 'm3-s1',
          stepNumber: 1,
          title: 'Trinn 1: Mål Entropi på Ingress HTTP Payload',
          description: 'Send den mistenkelige payload-strengen gjennom Shannon Entropi-formelen H(X) = -Σ P(x) log₂ P(x).',
          actionRequired: 'Beregn matematisk informasjons-tetthet på inndata.',
          commandSnippet: 'wpww-entropy-calc --stream "x9f8a7b6c5d4e3f2_MUTATED_ZERO_DAY_PAYLOAD_STREAM"',
          verificationExpected: 'Målt Shannon Entropi: 6.84 bits/byte. (Signifikant over terskelverdien på 5.20).'
        },
        {
          id: 'm3-s2',
          stepNumber: 2,
          title: 'Trinn 2: Dekod Byte-Frekvensfordelingen',
          description: 'Undersøk histogrammet for flat byte-distribusjon typisk for kryptert eller komprimert skadevare.',
          actionRequired: 'Utfør frekvensanalyse på de 16 mest frekvente bytene.',
          commandSnippet: 'wpww-entropy-freq --input raw_payload.bin --top 16',
          verificationExpected: 'Jevn fordeling bekreftet: Høy grad av polymorfisk mutasjon påvist.'
        },
        {
          id: 'm3-s3',
          stepNumber: 3,
          title: 'Trinn 3: Utløs Autonom Karantene',
          description: 'Blokker avsenderens IP permanent i svartelisten og forhindre fremtidige forsøk.',
          actionRequired: 'Kjør karantene-isolering med HTTP 403 avvisning.',
          commandSnippet: 'wpww-blacklist --add-ip 203.0.113.88 --reason "Zero-Day Entropi Avvik (6.84)"',
          verificationExpected: 'IP 203.0.113.88 plassert i isolasjon. Null forbindelser tillates.'
        }
      ]
    },
    {
      id: 'mission-4-ddos',
      number: 4,
      title: 'Oppdrag 4: eBPF XDP Kjernebrannmur mot 100Gbps SYN-Flom',
      subtitle: 'Volumetrisk avverging og Mirror Jamming',
      category: 'DDOS',
      difficulty: 'EKSPERT',
      xpReward: 500,
      briefing: 'Et distribuert botnet flommer innloggingstjenesten med millioner av forfalskede TCP SYN-pakker. Ta i bruk Mirror Jamming for å reflektere angrepsbølgen tilbake mot kontrollnodene.',
      cveRef: 'CWE-400 / MITRE T1498',
      steps: [
        {
          id: 'm4-s1',
          stepNumber: 1,
          title: 'Trinn 1: Aktiver Anycast BGP Scrubbing',
          description: 'Omdiriger volumetric flom gjennom filtreringssentre for å absorbere rå båndbredde.',
          actionRequired: 'Kjør BGP annonsering av scrubbing-ruter.',
          commandSnippet: 'gobgp neighbor 192.0.2.1 adj-rib in add 198.51.100.0/24 community 65000:666',
          verificationExpected: 'BGP rute annonsert. 98.4% av volumetrisk flom rutes til vaskesenter.'
        },
        {
          id: 'm4-s2',
          stepNumber: 2,
          title: 'Trinn 2: Aktiver Mirror Jamming Nivå 3',
          description: 'Snu angriperens egne synkroniseringspakker tilbake for å overbelaste deres C2-servere.',
          actionRequired: 'Slå på speilingsmodulen i Gudemodus.',
          commandSnippet: 'wpww-defense --mirror-jamming on --intensity 3',
          verificationExpected: 'Mirror Jamming aktivert på nivå 3. Angriperens tilkoblingstabeller fylt opp.'
        }
      ]
    },
    {
      id: 'mission-5-worm',
      number: 5,
      title: 'Oppdrag 5: Forensisk WORM Kjederevisjon & Integritet',
      subtitle: 'Kryptografisk bevisføring med SHA-256 hash-kjeding',
      category: 'FORENSICS',
      difficulty: 'SUPERHACKER',
      xpReward: 600,
      briefing: 'En intern trusselaktør har forsøkt å slette loggoppføringer for å skjule et datainnbrudd. Din jobb er å kjøre den kryptografiske revisjonsmotoren og avsløre manipuleringen.',
      cveRef: 'ISO/IEC 27037 / WORM Compliance',
      steps: [
        {
          id: 'm5-s1',
          stepNumber: 1,
          title: 'Trinn 1: Kjør SHA-256 Integritetssjekk',
          description: 'Iterer gjennom alle bevisblokker og verifiser at hash(blokk_N) matcher previousHash(blokk_N+1).',
          actionRequired: 'Kjør kjederevisjonen i sanntid.',
          commandSnippet: 'wpww-worm-audit --verify-all --deep',
          verificationExpected: 'Verifisering fullført: 100% kryptografisk samsvar funnet på alle blokker.'
        },
        {
          id: 'm5-s2',
          stepNumber: 2,
          title: 'Trinn 2: Eksporter Juridisk Forensisk Rapport',
          description: 'Generer en rettsgyldig JSON- og CSV-rapport forsendet med SHA-256 signatur.',
          actionRequired: 'Eksporter WORM-revisjonsbevis til etterforskningsteamet.',
          commandSnippet: 'wpww-worm-export --format json --sign-with-kyber1024',
          verificationExpected: 'Rapport eksportert: forensic_audit_trail.json med digital Kyber-1024 signatur.'
        }
      ]
    }
  ];

  const [selectedMissionId, setSelectedMissionId] = useState<string>(missions[0].id);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [terminalOutput, setTerminalOutput] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('wpww_training_progress');
    if (saved) {
      try {
        setCompletedSteps(JSON.parse(saved));
      } catch (e) {
        console.error('Could not load training progress', e);
      }
    }
  }, []);

  const saveProgress = (updated: Record<string, boolean>) => {
    setCompletedSteps(updated);
    localStorage.setItem('wpww_training_progress', JSON.stringify(updated));
  };

  const currentMission = missions.find((m) => m.id === selectedMissionId) || missions[0];

  // Calculate total XP and User Rank
  const totalXp = missions.reduce((sum, mission) => {
    const allStepsDone = mission.steps.every((s) => completedSteps[s.id]);
    return allStepsDone ? sum + mission.xpReward : sum;
  }, 0);

  const getRank = (xp: number) => {
    if (xp >= 1500) return { title: 'Elite Cyber-Arkitekt (Superhacker)', badge: 'bg-purple-950 text-purple-300 border-purple-600', level: 5 };
    if (xp >= 1000) return { title: 'SOC Incident Commander', badge: 'bg-cyan-950 text-cyan-300 border-cyan-600', level: 4 };
    if (xp >= 600) return { title: 'White Hat Penetrasjonstester', badge: 'bg-emerald-950 text-emerald-300 border-emerald-600', level: 3 };
    if (xp >= 250) return { title: 'Sertifisert Trussel-Analytiker', badge: 'bg-amber-950 text-amber-300 border-amber-600', level: 2 };
    return { title: 'Junior SOC Rekrutt', badge: 'bg-slate-800 text-slate-300 border-slate-700', level: 1 };
  };

  const userRank = getRank(totalXp);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleExecuteStep = async (step: MissionStep) => {
    setIsExecuting(true);
    setTerminalOutput(`[WAR-ROOM TERMINAL] Starter eksekvering: "${step.commandSnippet}"...\n[KJERNE] Kobler til forsvarsmodul...`);

    await new Promise((r) => setTimeout(r, 700));

    setTerminalOutput(
      `[WAR-ROOM TERMINAL] $ ${step.commandSnippet}\n` +
      `[OK] Autorisert White Hat operasjon bekreftet.\n` +
      `[RESULTAT] ${step.verificationExpected}\n` +
      `[STATUS] Trinn fullført! XP tildelt.`
    );

    const updated = { ...completedSteps, [step.id]: true };
    saveProgress(updated);
    setIsExecuting(false);
  };

  const handleResetProgress = () => {
    if (confirm('Er du sikker på at du vil tilbakestille all treningsprogresjon?')) {
      saveProgress({});
      setTerminalOutput(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-mono text-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-slate-100 tracking-wide">
                  SOC Walkthrough & Superhacker Treningsarena
                </h2>
                <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${userRank.badge}`}>
                  GRAD: {userRank.title} (Nivå {userRank.level})
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-300 font-bold">
                  {totalXp} XP
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Trinn-for-trinn guidede oppdrag: Løs reelle cybersikkerhets-oppgaver, stopp virus og bygg uinntagelige murer.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetProgress}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer text-xs flex items-center gap-1"
              title="Tilbakestill all oppdragsprogresjon"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nullstill</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
          
          {/* Left Column: Mission Selector */}
          <div className="w-full md:w-72 border-r border-slate-800 bg-slate-950/60 p-3 space-y-2 overflow-y-auto shrink-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1 mb-2">
              Trenings-Oppdrag ({missions.length})
            </span>

            {missions.map((mission) => {
              const isSelected = mission.id === currentMission.id;
              const completedCount = mission.steps.filter((s) => completedSteps[s.id]).length;
              const isAllDone = completedCount === mission.steps.length;

              return (
                <button
                  key={mission.id}
                  onClick={() => {
                    setSelectedMissionId(mission.id);
                    setActiveStepIndex(0);
                    setTerminalOutput(null);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500 text-slate-100 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                      Oppdrag {mission.number}
                    </span>
                    {isAllDone ? (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> FULLFØRT
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-400 font-bold">
                        +{mission.xpReward} XP
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs font-bold text-slate-100 truncate">{mission.title}</h3>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>{mission.cveRef}</span>
                    <span>{completedCount}/{mission.steps.length} trinn</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-cyan-500 h-full transition-all"
                      style={{ width: `${(completedCount / mission.steps.length) * 100}%` }}
                    ></div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Mission Details, Steps & Interactive Execution */}
          <div className="flex-1 p-4 sm:p-5 space-y-4 overflow-y-auto">
            {/* Mission Briefing Card */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-cyan-400 font-mono">
                    MÅLOMRÅDE: {currentMission.category}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-300 font-mono">
                    {currentMission.cveRef}
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                  BELØNNING: +{currentMission.xpReward} XP
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-100 font-mono">{currentMission.title}</h3>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">{currentMission.briefing}</p>
            </div>

            {/* Steps Navigation Tabs */}
            <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1">
              {currentMission.steps.map((step, idx) => {
                const isStepDone = completedSteps[step.id];
                const isCurrent = idx === activeStepIndex;

                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveStepIndex(idx)}
                    className={`px-3 py-1.5 rounded-t-lg border-b-2 font-mono text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
                      isCurrent
                        ? 'border-cyan-400 text-cyan-300 bg-slate-900/50'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isStepDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-600 text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                    )}
                    <span>{step.title.split(':')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Step Workspace */}
            {(() => {
              const activeStep = currentMission.steps[activeStepIndex];
              const isStepDone = completedSteps[activeStep.id];

              return (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="text-xs font-bold text-slate-100 font-mono">
                        {activeStep.title}
                      </h4>
                      {isStepDone && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Trinn Verifisert
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 font-sans leading-relaxed">
                      {activeStep.description}
                    </p>

                    <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-900/40 text-xs font-sans text-slate-300">
                      <strong className="text-cyan-400 font-mono block mb-0.5">Operativ Handling:</strong>
                      {activeStep.actionRequired}
                    </div>

                    {/* Command Snippet & Execution Box */}
                    <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1 text-slate-300 font-bold">
                          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                          Terminal-Kommando
                        </span>
                        <button
                          onClick={() => handleCopy(activeStep.commandSnippet)}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {copiedCode === activeStep.commandSnippet ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedCode === activeStep.commandSnippet ? 'Kopiert' : 'Kopier'}</span>
                        </button>
                      </div>

                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
                        <code>{activeStep.commandSnippet}</code>
                      </div>

                      {/* Execute Step Button */}
                      <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
                        <span className="text-[11px] text-slate-400 font-sans">
                          Klikk for å kjøre i den sandkassede War-Room simulatoren:
                        </span>
                        <button
                          onClick={() => handleExecuteStep(activeStep)}
                          disabled={isExecuting}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-slate-950 font-bold font-mono text-xs flex items-center gap-2 shadow-md shadow-cyan-950 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isExecuting ? (
                            <>
                              <Zap className="w-4 h-4 animate-spin" />
                              <span>Eksekverer Forsvar...</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 fill-slate-950" />
                              <span>Kjør Forsvarssteg & Verifiser</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Interactive Terminal Output Simulator */}
                    {terminalOutput && (
                      <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 font-mono text-xs space-y-1">
                        <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1.5 border-b border-slate-900 pb-1">
                          <Terminal className="w-3 h-3 text-cyan-400" /> Sanntids SOC Terminal Output
                        </div>
                        <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">
                          {terminalOutput}
                        </pre>
                      </div>
                    )}

                    {/* Step Navigation Controls */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                        disabled={activeStepIndex === 0}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 disabled:opacity-30 cursor-pointer"
                      >
                        ← Forrige Trinn
                      </button>

                      <button
                        onClick={() => setActiveStepIndex((prev) => Math.min(currentMission.steps.length - 1, prev + 1))}
                        disabled={activeStepIndex === currentMission.steps.length - 1}
                        className="px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-xs font-mono text-cyan-300 disabled:opacity-30 cursor-pointer flex items-center gap-1"
                      >
                        <span>Neste Trinn</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })()}

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Treningsprogresjon lagres automatisk. Fullfør alle 5 oppdrag for å oppnå tittel "Elite Cyber-Arkitekt".</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors cursor-pointer"
          >
            Lukk Trening
          </button>
        </div>

      </div>
    </div>
  );
};
