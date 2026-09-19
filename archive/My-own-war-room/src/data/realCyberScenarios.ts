import { CyberRealScenario } from '../types';

export const REAL_CYBER_SCENARIOS: CyberRealScenario[] = [
  {
    id: 'stuxnet-natanz',
    title: 'Operasjon Stuxnet: Natanz SCADA Sentrifugesabotasje',
    subtitle: 'Verdens første cyberfysiske våpen — Angrep på Siemens S7-300 PLS',
    year: 2010,
    targetSystem: 'Siemens S7-300 PLS & Vacon/Fararo Paya Frekvensomformere (Air-Gapped)',
    category: 'ICS_SCADA',
    attackerProfile: 'Olympic Games (Statlig cyberallianse / Red Team Tier 5)',
    defenderProfile: 'Natanz Urananriking / Iransk Atomenergibyrå (Blue Team Air-Gapped)',
    realWorldHistory: 'Stuxnet krysset en air-gap via infiserte USB-pinner med 4 zero-days (bl.a. CVE-2010-2568 LNK-sårbarhet). Ormen reiste umerkelig gjennom Windows-nettverket inntil den fant Siemens Step7-programvare, overskrev kjerne-PLS-kode, og økte sentrifugerotasjonen til 1410 Hz (som rev rotorene i stykker) mens den forfalsket sensordataene til kontrollrommet slik at alt så normalt ut.',
    baseAttackDifficulty: 92,
    baseDefenseDifficulty: 65,
    keyVulnerabilities: [
      'CVE-2010-2568 (Windows Shell Shortcut LNK RCE)',
      'CVE-2010-2729 (Windows Print Spooler RCE)',
      'CVE-2010-3338 & CVE-2010-2743 (Privilege Escalation)',
      'Mangel på kryptografisk PLS-firmwaresignering i S7-300'
    ],
    recommendedDefenses: [
      'Fysisk hardware diode for enveis datastrøm (Data Diode)',
      'Akustisk og vibrasjonsbasert analog anomaliedeteksjon (uavhengig av PLS-telemetri)',
      'Kryptografisk WORM-integritetssjekk på PLS-blokker (DB1/DB89)',
      'Total deaktivering av AutoRun/LNK parser i isolerte soner'
    ],
    outcomeSummary: {
      ifRedWins: 'KRITISK SABOTASJE: Sentrifugenes rotasjonshastighet presses til 1410 Hz. Over 1000 sentrifuger ødelegges fysisk mens kontrollpanelet viser falsk normalverdi.',
      ifBlueWins: 'TOTAL NØYTRALISERING: Akustiske sensorer oppdager turtallsavvik. PLS-en frakobles øyeblikkelig, og USB-ormens LNK-eksploit blokkeres av minne-sandbox.',
      ifEquilibrium: 'BEGRENSET SKADE & ISOLASJON: Ormen sprer seg i administrative maskiner, men sanntids eBPF-monitorering fanger opp uautoriserte STEP 7-instruksjoner før sentrifugene skades.'
    },
    steps: [
      {
        stepNumber: 1,
        phaseName: 'Initial Infiltrasjon (Air-Gap Krysning)',
        actor: 'red',
        title: 'USB LNK Zero-Day Payload Aktivering',
        description: 'En intetanende tekniker plugger inn en infisert minnepinne i et air-gapped system. Windows Shell parser automatisk spesiallagde ikoner uten brukerklikk.',
        terminalLog: '[RED] INJECT USB_STORAGE -> Mount drive E:\\ -> Trigger CVE-2010-2568 (.lnk payload) -> System heap execute shellcode OK.',
        mitreTechnique: 'T1091 (Replication Through Removable Media)',
        cveRef: 'CVE-2010-2568',
        visualEffect: 'laser',
        redPowerDelta: 15,
        bluePowerDelta: -5
      },
      {
        stepNumber: 2,
        phaseName: 'Intern Rekognosering & Spredning',
        actor: 'red',
        title: 'Windows Print Spooler RPC & Peer-to-Peer RPC',
        description: 'Ormen benytter MS10-061 for å infisere andre maskiner i det lukkede nettverket, og oppretter et distribuert peer-to-peer kommunikasjonsnett.',
        terminalLog: '[RED] RPC_SWARM: Probing subnet 192.168.1.0/24 -> Target spoolsv.exe exploit MS10-061 -> Spreading payload payload.dll.',
        mitreTechnique: 'T1210 (Exploitation of Remote Services)',
        cveRef: 'CVE-2010-2729',
        visualEffect: 'breach',
        redPowerDelta: 20,
        bluePowerDelta: -10
      },
      {
        stepNumber: 3,
        phaseName: 'Siemens STEP 7 Identifisering',
        actor: 'red',
        title: 'Interception av s7otbxdx.dll og DLL-kapring',
        description: 'Stuxnet erstatter Siemens kommunikasjons-DLL slik at all trafikk mellom operatør-PC og PLS passerer gjennom ormens inspeksjonsmotor.',
        terminalLog: '[RED] HOOK: Hooking Step7 library s7otbxdx.dll -> Hijacked PLC comms -> Scanning for Profibus ID 0x0000 and 0x0001.',
        mitreTechnique: 'T1574 (Hijack Execution Flow)',
        cveRef: 'CWE-427',
        visualEffect: 'scada',
        redPowerDelta: 25,
        bluePowerDelta: -15
      },
      {
        stepNumber: 4,
        phaseName: 'Blue Team Forsvarsreaksjon',
        actor: 'blue',
        title: 'Akustisk Frekvenskontroll & Entropianalyse',
        description: 'Forsvarerne iverksetter uavhengig akustisk monitorering av rotorene og analyserer heksadesimal kodeendring i PLS-minnet.',
        terminalLog: '[BLUE] SENSOR_TRIGGER: Acoustic sensor detected micro-resonance at 1064 Hz. Shannon entropy on s7otbxdx.dll = 7.89 (SUSPICIOUS).',
        mitreTechnique: 'D3-SOH (System Output Hardening)',
        visualEffect: 'shield',
        redPowerDelta: -10,
        bluePowerDelta: 30
      },
      {
        stepNumber: 5,
        phaseName: 'Klimaks: Sabotasje vs Nødbrems',
        actor: 'system',
        title: 'Sentrifugeoverturtall vs Hardware Relé-Utkobling',
        description: 'Angriperen forsøker å låse frekvensomformerne på 1410 Hz mens den forfalsker normalverdi. Utfallet avgjøres av styrkeforholdet på spakene.',
        terminalLog: '[BATTLE] RED: Write DB89 block -> FORCE FREQ 1410 Hz. BLUE: Interlock breaker check -> Comparing mechanical acoustic sensor with PLC report.',
        visualEffect: 'reboot'
      }
    ]
  },
  {
    id: 'solarwinds-sunburst',
    title: 'SolarWinds Orion: Global Supply-Chain Infiltrasjon',
    subtitle: 'Når byggesystemet forvandles til spionverktøy — Golden SAML & Sunburst',
    year: 2020,
    targetSystem: 'SolarWinds Orion Platform DLL (SolarWinds.Orion.Core.BusinessLayer.dll)',
    category: 'SUPPLY_CHAIN',
    attackerProfile: 'APT29 / Cozy Bear (SVR - Utenlandsetterretningen til Russland)',
    defenderProfile: '18 000 Fortune 500 & Offentlige Virksomheter (Blue Team Global)',
    realWorldHistory: 'Angriperne brøt seg inn i SolarWinds programvarebyggemiljø og la inn bakdøren SUNBURST i kildekoden. Bakdøren lå i dvale i opptil to uker før den kontaktet kommando-og-kontroll-servere over kamuflerte DNS-forespørsler (DGA). Deretter stjal angriperne SAML-tokensertifikater (Golden SAML) for å logge seg direkte inn i Office 365 og skyressurser som hvilken som helst legitim bruker.',
    baseAttackDifficulty: 95,
    baseDefenseDifficulty: 70,
    keyVulnerabilities: [
      'CVE-2020-10148 (SolarWinds API Authentication Bypass)',
      'Kompromittert CI/CD byggepipeline (MSBuild injection)',
      'Ubeskyttet SAML Token Signing Key i ADFS-minne',
      'Svak overvåking av DNS CNAME tunneleringsdata'
    ],
    recommendedDefenses: [
      'Reproduserbare bygg med uavhengig binærdifferensiering (Reproducible Builds)',
      'eBPF kjerne-attestering for ethvert modullastet bibliotek',
      'Maskinvarebeskyttet HSM (Hardware Security Module) for SAML-sertifikater',
      'AI-basert DNS entropi-overvåking for DGA-oppdagelse'
    ],
    outcomeSummary: {
      ifRedWins: 'TOTAL SKYOVERTAKELSE: Sunburst aktiveres usynlig. Golden SAML gir uinnskrenket tilgang til skyinfrastruktur uten å trigge MFA eller passordvarsler.',
      ifBlueWins: 'AVSLØRT I BYGGEFASEN: eBPF WORM-integritetssjekk fanger opp at den kompilerte DLL-en avviker fra godkjent git-commit hash. Oppdateringen blokkeres før utrulling.',
      ifEquilibrium: 'BEGRENSET EXFILTRASJON: Bakdøren når testmiljøer, men DNS-anomalifilter oppdager subdomenetavvik (avsvmcloud.com) og isolerer verten.'
    },
    steps: [
      {
        stepNumber: 1,
        phaseName: 'Byggepipeline Kompromittering',
        actor: 'red',
        title: 'Solorigate MSBuild Kildekode-Injeksjon',
        description: 'Angriperen lurer seg inn i byggeserveren og injiserer en 4000-linjers bakdør direkte inn i Orion-prosjektfilen millisekunder før signering.',
        terminalLog: '[RED] INJECT CI/CD: Hooking MSBuild.exe -> Injecting InventoryManager.cs -> Legitimate Digicert code signing signature APPLIED.',
        mitreTechnique: 'T1195.002 (Compromise Software Supply Chain)',
        cveRef: 'CVE-2020-10148',
        visualEffect: 'laser',
        redPowerDelta: 20,
        bluePowerDelta: -10
      },
      {
        stepNumber: 2,
        phaseName: 'Sovende Dvale & Kamuflert C2',
        actor: 'red',
        title: 'DNS CNAME Tunnelering & DGA-kommunikasjon',
        description: 'Sunburst venter i 14 dager, for deretter å sende krypterte DNS-forespørsler maskert som vanlige OID-telemetridata.',
        terminalLog: '[RED] DORMANT TIMER: 14 days elapsed -> Generating DGA query -> 1c324af9.appsync-api.eu-west-1.avsvmcloud.com -> DNS TXT beacon.',
        mitreTechnique: 'T1071.004 (DNS Communication Channel)',
        visualEffect: 'breach',
        redPowerDelta: 15,
        bluePowerDelta: -5
      },
      {
        stepNumber: 3,
        phaseName: 'Golden SAML Identitetskapring',
        actor: 'red',
        title: 'Stjeling av Token-signeringsnøkler fra ADFS',
        description: 'Med minnetilgang eksporteres den hemmelige private nøkkelen til ADFS. Angriperen kan nå generere gyldige SAML-tokens for alle brukere i organisasjonen.',
        terminalLog: '[RED] MEMDUMP ADFS: Exporting Token-Signing Certificate Private Key -> Minting Golden SAML token for user: Admin@global.corp.',
        mitreTechnique: 'T1606.002 (Golden SAML Forge Web Credentials)',
        visualEffect: 'laser',
        redPowerDelta: 30,
        bluePowerDelta: -15
      },
      {
        stepNumber: 4,
        phaseName: 'Blue Team WORM Attestering',
        actor: 'blue',
        title: 'eBPF Binæranalyse & Entropiblokkering',
        description: 'Forsvarerne iverksetter dyp inspeksjon av DNS-trafikk og eBPF-verifisering av samtlige moduler som lastes inn i systemkjernen.',
        terminalLog: '[BLUE] EBPF_VERIFY: Module SolarWinds.Orion.Core.BusinessLayer.dll entropy variance detected (H=7.94). DNS filter matches high-frequency CNAME DGA pattern.',
        mitreTechnique: 'D3-DECT (Decoy & Deception Trap)',
        visualEffect: 'shield',
        redPowerDelta: -15,
        bluePowerDelta: 35
      },
      {
        stepNumber: 5,
        phaseName: 'Oppgjør: Sky-Infiltrasjon vs Karantene',
        actor: 'system',
        title: 'ADFS-tilgang vs Zero Trust Sertifikattilbakekalling',
        description: 'Styrkeforholdet avgjør om de falske SAML-tokensene aksepteres eller om Zero Trust-kjernefilteret ugyldiggjør rot-sertifikatet.',
        terminalLog: '[BATTLE] RED: Request Azure AD bearer with forged SAML. BLUE: Zero Trust conditional access evaluating tenant device health + token age verification.',
        visualEffect: 'reboot'
      }
    ]
  },
  {
    id: 'pegasus-forcedentry',
    title: 'Pegasus NSO: Zero-Click FORCEDENTRY Mot iOS',
    subtitle: 'Fullstendig overtagelse av smarttelefon uten et eneste klikk',
    year: 2021,
    targetSystem: 'Apple iOS iMessage / ImageIO JBIG2 Parser Sandbox',
    category: 'ZERO_CLICK_MOBILE',
    attackerProfile: 'NSO Group / Pegasus Operatør (Red Team Tier 5 Cyber Weapon)',
    defenderProfile: 'Apple Security Engineering & Architecture / SEAR (Blue Team Mobile)',
    realWorldHistory: 'FORCEDENTRY (CVE-2021-30860) er et av de mest teknisk sofistikerte angrepene i historien. En PDF forkledd som en GIF-fil ble sendt via iMessage. Ved parsing av JBIG2-komprimeringsdata utløste filen et integer overflow i heap-minnet. Angriperne brukte dette til å bygge en komplett virtuell datamaskin basert på 70 000 emulerte logiske porter inne i JBIG2-dekoderen, omgikk pointer-autentisering (PAC), slo av sandkassen, og installerte full spionvare.',
    baseAttackDifficulty: 98,
    baseDefenseDifficulty: 80,
    keyVulnerabilities: [
      'CVE-2021-30860 (CoreGraphics JBIG2 Integer Overflow)',
      'Automatisk forhåndsvisningsbehandling i iMessage uten brukergodkjenning',
      'Ufullstendig sandkasse-isolering av usikre C++ parsingbiblioteker'
    ],
    recommendedDefenses: [
      'BlastDoor isolert sandkasse skrevet i minnesikker Swift',
      'Minneisolering via Pointer Authentication Codes (ARM64e PAC)',
      'Lockdown Mode (Deaktivering av komplekse bilde- og skriftformat-parsere)',
      'Kjerne-integritetsbeskyttelse med Page Protection Layer (PPL)'
    ],
    outcomeSummary: {
      ifRedWins: 'ZERO-CLICK OVERTAKELSE: Mikrofon, kamera, GPS, Signal og WhatsApp avlyttes i sanntid. Ingen spor etterlates i systemloggene.',
      ifBlueWins: 'BLASTDOOR SANDKASSE STOPP: Den manipulerte JBIG2-strømmen krasjer isolert i BlastDoor-sandkassen. Systemkjernen berøres ikke, og meldingen slettes.',
      ifEquilibrium: 'DELVIS EKSPLOITERING, INGEN KJERNETILGANG: Heap-korrupsjonen lykkes i bilde-prosessen, men ARM64e PAC forhindrer vilkårlig kodekjøring i kjernen.'
    },
    steps: [
      {
        stepNumber: 1,
        phaseName: 'Silent iMessage Levering',
        actor: 'red',
        title: 'Spesialkonstruert .gif (Egentlig PDF med JBIG2)',
        description: 'En iMessage sendes til offerets telefonnummer. Telefonen begynner automatisk å dekode bildet for å generere et forhåndsvisningsikon.',
        terminalLog: '[RED] PUSH_SMS: Sending multipart iMessage payload -> Type: image/gif (True format: PDF/JBIG2 segment stream) -> Auto-render initiated.',
        mitreTechnique: 'T1456 (Drive-by Compromise / Zero-Click)',
        cveRef: 'CVE-2021-30860',
        visualEffect: 'laser',
        redPowerDelta: 25,
        bluePowerDelta: -5
      },
      {
        stepNumber: 2,
        phaseName: 'JBIG2 Minnekorrupsjon',
        actor: 'red',
        title: 'Integer Overflow & Konstruksjon av Virtuell Datamaskin',
        description: 'JBIG2-dekoderen utfører en logisk operasjon med en negativ teller, noe som åpner for vilkårlig lesing/skriving i prosessens minneområde.',
        terminalLog: '[RED] HEAP_OVERFLOW: JBIG2 bitmap decompression buffer underflow -> Synthesizing 70,000 logic gates inside decompression loop -> Turing-complete execution achieved.',
        mitreTechnique: 'T1068 (Exploitation for Privilege Escalation)',
        cveRef: 'CVE-2021-30860',
        visualEffect: 'breach',
        redPowerDelta: 30,
        bluePowerDelta: -15
      },
      {
        stepNumber: 3,
        phaseName: 'Sandkasse-Rømming & PAC Bypass',
        actor: 'red',
        title: 'Omgåelse av Apple Sandbox & Kjerne-Infiltrasjon',
        description: 'Den emulerte JBIG2-motoren overskriver minnepekerne og narrer systemet til å deaktivere sikkerhetsflaggene for app-sandkassen.',
        terminalLog: '[RED] SANDBOX_ESCAPE: Overwriting sandbox entitlement flags -> Calling mach_port_kobject -> Bypassing ARM PAC with forged instruction pointer.',
        mitreTechnique: 'T1055 (Process Injection)',
        visualEffect: 'laser',
        redPowerDelta: 20,
        bluePowerDelta: -10
      },
      {
        stepNumber: 4,
        phaseName: 'Blue Team BlastDoor & ASLR Forsvar',
        actor: 'blue',
        title: 'BlastDoor Swift Minnesikkerhet & Karantene',
        description: 'BlastDoor-tjenesten fanger opp unormal CPU-syklustetthet i bilde-dekoderen og isolerer prosessen før den kan kontakte kjerne-IPC.',
        terminalLog: '[BLUE] BLASTDOOR_GUARD: Caught SIGSEGV in detached Swift sandbox container. Memory write boundary violation at 0x7fff89ab1000. IPC terminated.',
        mitreTechnique: 'D3-IRA (Isolated Ring Allocation)',
        visualEffect: 'shield',
        redPowerDelta: -15,
        bluePowerDelta: 35
      },
      {
        stepNumber: 5,
        phaseName: 'Siste Slag: Full Spionvare vs Kjerne-Nedstenging',
        actor: 'system',
        title: 'Mikrofon/Kamera Aktivering vs System Memory Purge',
        description: 'Hvis angrepskraften overgår forsvaret, installeres spionvaren usynlig. Hvis forsvaret vinner, renskes minnet.',
        terminalLog: '[BATTLE] RED: Deploying payload to /private/var/mobile/Library/SMS. BLUE: Kernel Page Protection Layer (PPL) verifying code signatures on disk.',
        visualEffect: 'reboot'
      }
    ]
  },
  {
    id: 'blackenergy-powergrid',
    title: 'Industroyer / BlackEnergy: Sabotasje mot Strømnettet',
    subtitle: 'Når cyberangrep kutter strømmen til hundretusener av innbyggere',
    year: 2016,
    targetSystem: 'Høyspent Transformatorstasjoner & SCADA IEC-60870-5-104 / IEC 61850',
    category: 'CRITICAL_INFRA',
    attackerProfile: 'Sandworm Team / Unit 74455 (Russisk militær etterretning GRU)',
    defenderProfile: 'Ukrenergo / Europeisk Strømnettinfrastruktur (Blue Team Energi)',
    realWorldHistory: 'Industroyer (CrashOverride) er det første skadevareprogrammet spesialdesignet for å angripe elektriske transformatorstasjoner direkte via standardiserte telemetriprotokoller (IEC 60870-5-104, IEC 61850 og OPC DA). Angriperne sendte legitime, men ondsinnede "OPEN"-kommandoer til transformatorbrytere, tømte UPS-batteriene og slettet firmware på reléene slik at operatørene mistet kontrollen.',
    baseAttackDifficulty: 88,
    baseDefenseDifficulty: 68,
    keyVulnerabilities: [
      'Manglende autentisering i eldre IEC-60870-5-104 SCADA-protokoller',
      'Fjernadgangsløsninger (VPN) uten tvungen maskinvare-MFA',
      'Direkte nettverksruting mellom kontor-IT og industrielt OT-nettverk'
    ],
    recommendedDefenses: [
      'Autonome fysiske mikronett-skillebrytere med lokal kollisjonssperre',
      'Dyp pakkeinspeksjon (DPI) av IEC-protokoller for uvanlige kommandosekvenser',
      'Air-gapped optisk fiberkommunikasjon mellom transformatorer',
      'WORM-sikret telemetrilogging og manuell nødutkobling'
    ],
    outcomeSummary: {
      ifRedWins: 'BLACKOUT: Brytere åpnes samtidig på 30 transformatorstasjoner. Strømmen kuttes til 230 000 innbyggere midt på vinteren.',
      ifBlueWins: 'AVVERGET SABOTASJE: IEC-DPI-brannmuren gjenkjenner massesending av OPEN-kommandoer som et koordinert angrep og låser reléene i gjeldende stilling.',
      ifEquilibrium: 'KORTE UTKOBLINGER, RASK GJENOPPRETTING: To understasjoner kobles ut, men automatiske mikronett-reserveløsninger omdirigerer strømmen på under 45 sekunder.'
    },
    steps: [
      {
        stepNumber: 1,
        phaseName: 'Initial Inntrenging & Tilgang',
        actor: 'red',
        title: 'Spydfisking med Malisiøse Word-Makroer & VPN-Kapring',
        description: 'Tekniske operatører mottar en e-post med et angivelig strømnett-vedlegg. Makroen laster ned BlackEnergy 3-dropperen og stjeler VPN-sertifikater.',
        terminalLog: '[RED] PHISHING_VECTOR: Target operator station -> VBA Macro executes rundll32.exe -> BlackEnergy 3 backdoor establishes C2 over SSL.',
        mitreTechnique: 'T1566.001 (Spearphishing Attachment)',
        cveRef: 'CVE-2014-4114',
        visualEffect: 'laser',
        redPowerDelta: 20,
        bluePowerDelta: -5
      },
      {
        stepNumber: 2,
        phaseName: 'OT-Nettverkspenetrasjon',
        actor: 'red',
        title: 'Pivoting fra IT til OT & SCADA HMI Kartlegging',
        description: 'Angriperne beveger seg fra kontornivået over i kontrollsenterets SCADA-servere og kartlegger samtlige IEC-104 transformatoradresser.',
        terminalLog: '[RED] PIVOT OT: Dual-homed server bridge -> Enumerating RTUs on IEC-60870-5-104 (Port 2404) -> Identified 30 substation nodes.',
        mitreTechnique: 'T1046 (Network Service Discovery)',
        visualEffect: 'scada',
        redPowerDelta: 25,
        bluePowerDelta: -10
      },
      {
        stepNumber: 3,
        phaseName: 'Koordinert Bryter-Manipulering',
        actor: 'red',
        title: 'Utsendelse av Malisiøse OPEN-Kommandoer & Firmware Wipe',
        description: 'Industroyer sender en kaskade av kommandoer for å koble ut transformatorene og overskriver deretter reléenes firmware for å hindre manuell tilkobling.',
        terminalLog: '[RED] INDUSTROYER PROTOCOL: Sending APDU Type 45 (Single Command) -> Value: 0 (DEACTIVATE/OPEN) to all 30 IOA addresses concurrently.',
        mitreTechnique: 'T0855 (Unauthorized Command Message)',
        visualEffect: 'breach',
        redPowerDelta: 30,
        bluePowerDelta: -15
      },
      {
        stepNumber: 4,
        phaseName: 'Blue Team Mikronett Autonomi',
        actor: 'blue',
        title: 'SCADA DPI Brannmur & Fysisk Nødsperre',
        description: 'Det autonome forsvaret oppdager unormal frekvens av Type 45-kommandoer, kobler fra fjernstyringskanalen og aktiverer lokale synkronfasereleér.',
        terminalLog: '[BLUE] GRID_SHIELD: Rate-limit anomaly on port 2404 (>50 commands/sec). Engaging mechanical interlock on substation feeders. Manual override enforced.',
        mitreTechnique: 'D3-FA (Firmware Attestation)',
        visualEffect: 'shield',
        redPowerDelta: -20,
        bluePowerDelta: 35
      },
      {
        stepNumber: 5,
        phaseName: 'Klimaks: Strømkollaps vs Nettresiliens',
        actor: 'system',
        title: 'Regional Mørklegging vs Automatisk Øydrift',
        description: 'Styrkeforholdet avgjør om strømnettet kollapser inn i en ukontrollert blackout eller om øydrift stabiliserer forsyningen.',
        terminalLog: '[BATTLE] RED: Sending Wiper component to kill HMI displays. BLUE: Synchronous condenser and local gas turbine startup in island mode.',
        visualEffect: 'reboot'
      }
    ]
  },
  {
    id: 'post-quantum-break',
    title: 'Kvanteknekking: Shor\'s Algoritme mot RSA-4096',
    subtitle: 'Når fremtidens kvantedatamaskiner knekker dagens globale kryptografi',
    year: 2026,
    targetSystem: 'RSA-4096 / ECC P-384 Offentlige Nøkler (Global Internettkryptering)',
    category: 'POST_QUANTUM',
    attackerProfile: 'Kvantestatlig Superdatamaskin (Red Team Quantum-Tier)',
    defenderProfile: 'WPWW Post-Quantum Kyber-1024 & Dilithium (Blue Team Kvanteforsvar)',
    realWorldHistory: 'Konvensjonell asymmetrisk kryptografi (RSA og elliptisk kurve ECC) baserer seg på at det er matematisk ugjennomførbart for klassiske datamaskiner å faktorisere store primtall. Med en feiltolerant kvantedatamaskin med 4000+ logiske qubits kan Shor\'s algoritme knekke en RSA-4096 nøkkel på under 10 sekunder. Det eneste forsvaret er Post-Quantum Cryptography (PQC) basert på gittermatematikk (NIST FIPS 203 ML-KEM / Kyber).',
    baseAttackDifficulty: 97,
    baseDefenseDifficulty: 90,
    keyVulnerabilities: [
      'RSA-4096 primtallsfaktorisering sårbar for Shor\'s kvantealgoritme',
      'Gammel TLS 1.2 / 1.3 infrastruktur uten støtte for gitterbasert nøkkelutveksling',
      '"Harvest Now, Decrypt Later" — Angripere lagrer kryptert data i dag for å knekke den i fremtiden'
    ],
    recommendedDefenses: [
      'NIST FIPS 203 (ML-KEM / Kyber-1024) gitterbasert nøkkelkapsling',
      'NIST FIPS 204 (ML-DSA / Dilithium) kvantesikre digitale signaturer',
      'Hybrid nøkkelutveksling (X25519 kombinert med Kyber-768)',
      'Kvantemekanisk tilfeldighetsgenerator (QRNG)'
    ],
    outcomeSummary: {
      ifRedWins: 'TOTAL KRYPTOKNEKKING: RSA-4096 faktoriseres på 4.2 sekunder. Samtlige hemmelige banktransaksjoner, statshemmeligheter og passord dekrypteres i klartekst.',
      ifBlueWins: 'KVANTERESISTENT TRIUMF: Kyber-1024 gitterkryptografi avviser kvanteangrepet fullstendig. Shor\'s algoritme har ingen matematisk fordel mot gitterproblemet.',
      ifEquilibrium: 'HYBRID BESKYTTELSE: Eldre RSA-lag kompromitteres, men det indre Kyber-gitterlaget holder dataene hermetisk forseglet.'
    },
    steps: [
      {
        stepNumber: 1,
        phaseName: 'Kvantetilstand Forberedelse',
        actor: 'red',
        title: 'Superposisjon & Kvanteminne Initialisering',
        description: 'Kvantedatamaskinen kjøler ned 4096 logiske qubits til 15 millikelvin og forbereder kvantefourier-transformasjon (QFT).',
        terminalLog: '[RED] QUANTUM_INIT: 4096 logical qubits initialized at 15mK. Setting up quantum registers |ψ⟩ = 1/√N ∑ |x⟩|f(x)⟩.',
        mitreTechnique: 'T1600 (Weaken Encryption via Quantum Phase Estimation)',
        visualEffect: 'quantum',
        redPowerDelta: 30,
        bluePowerDelta: -10
      },
      {
        stepNumber: 2,
        phaseName: 'Shor\'s Faktorisering av RSA-Nøkkel',
        actor: 'red',
        title: 'Knekking av Modulus N i RSA-4096',
        description: 'Shor\'s algoritme finner perioden r til funksjonen f(x) = a^x mod N i polynomisk tid og beregner de to hemmelige primtallene p og q.',
        terminalLog: '[RED] SHORS_ALGORITHM: Period finding converged in 8,192 quantum cycles. Prime factors p and q discovered! Private key d extracted.',
        mitreTechnique: 'T1552 (Unsecured Credentials / Broken Asymmetric Crypto)',
        visualEffect: 'laser',
        redPowerDelta: 35,
        bluePowerDelta: -20
      },
      {
        stepNumber: 3,
        phaseName: 'Blue Team Kyber-1024 Barriere',
        actor: 'blue',
        title: 'Aktivering av Post-Quantum Gitterkryptografi',
        description: 'Forsvarssystemet oppdager angrepet og skifter øyeblikkelig nøkkelutveksling til NIST FIPS 203 ML-KEM (Kyber-1024 gittervektorer).',
        terminalLog: '[BLUE] POST_QUANTUM_SHIELD: Engaging Kyber-1024 lattice vector encapsulation. Learning-With-Errors (LWE) hardness dimension k=4. Quantum speedup = 0.',
        mitreTechnique: 'D3-CR (Cryptographic Rotation)',
        visualEffect: 'shield',
        redPowerDelta: -25,
        bluePowerDelta: 45
      },
      {
        stepNumber: 4,
        phaseName: 'Kvantekollisjonstest',
        actor: 'red',
        title: 'Grover\'s Algoritme mot AES-256 vs Entropi',
        description: 'Angriperen forsøker Grover\'s søkealgoritme mot AES-256 for å halvere nøkkelrommet, men AES-256 beholder 128-bit kvantesikkerhet.',
        terminalLog: '[RED] GROVERS_SEARCH: Applying Grover diffusion operator -> Effective security reduced from 256 to 128 bits. Time required still 1.07 × 10^22 years.',
        visualEffect: 'quantum',
        redPowerDelta: 10,
        bluePowerDelta: 20
      },
      {
        stepNumber: 5,
        phaseName: 'Klimaks: Dekryptering vs Gitterlås',
        actor: 'system',
        title: 'Klartekst Eksfiltrasjon vs Kvanteforseglet Hvelv',
        description: 'Resultatet avgjøres av balansen mellom angripers kvantekraft og forsvarerens post-kvanteprotokoller.',
        terminalLog: '[BATTLE] RED: Attempting to decrypt TLS payload stream. BLUE: Verifying Dilithium-5 digital signature on session master key.',
        visualEffect: 'reboot'
      }
    ]
  },
  {
    id: 'crowdstrike-kernel-resilience',
    title: 'CrowdStrike Falcon: Kjerne-Integritet & Global Resiliens',
    subtitle: 'Når en sikkerhetsoppdatering krasjer 8.5 millioner maskiner globalt',
    year: 2024,
    targetSystem: 'Windows Kernel Ring 0 Drivere (Channel 291 csagent.sys)',
    category: 'KERNEL_RESILIENCE',
    attackerProfile: 'Feilaktig Konfigurasjonsfil / Supply-Chain Valideringssvikt (Red Risk)',
    defenderProfile: 'eBPF Kjerne-Sandkasse & A/B Safe Boot Rollback (Blue Team Resiliens)',
    realWorldHistory: '19. juli 2024 sendte CrowdStrike ut en sensor-konfigurasjonsfil (Channel 291) til sin Falcon-kjerneagent. En out-of-bounds minnelesing i driveren csagent.sys førte til at 8,5 millioner datamaskiner verden over havnet i en uendelig "Blue Screen of Death" (BSOD) boot-loop. Angrepet demonstrerte at forsvarsverktøy i Ring 0 kan utgjøre en like stor trussel som fiendtlig malware hvis de ikke er formelt verifisert.',
    baseAttackDifficulty: 85,
    baseDefenseDifficulty: 85,
    keyVulnerabilities: [
      'Ubeskyttet Ring 0 kjernetilgang for tredjeparts sikkerhetsdrivere',
      'Manglende statisk minneverifisering av dynamiske konfigurasjonsfiler før lasting',
      'Utsendelse av oppdateringer globalt uten gradvis ring-utrulling (canary deployment)'
    ],
    recommendedDefenses: [
      'eBPF statisk verifikator som garanterer at programmer ikke krasjer kjernen',
      'Minnesikre kjerne-utvidelser skrevet i Rust',
      'Automatisk maskinvare-rollback ved gjentatte krasj under oppstart (A/B Boot)',
      'Flytting av sikkerhetsagenter fra Ring 0 (kjerne) til isolert Ring 3 (brukermodus)'
    ],
    outcomeSummary: {
      ifRedWins: 'GLOBAL SYSTEMLÅS: Millioner av maskiner havner i krasjløkke. Flyplasser, sykehus og banker lammes globalt.',
      ifBlueWins: 'VERIFIKATOREN REDDER DAGEN: eBPF-verifikatoren oppdager den ugyldige minnepekeren i filen før den lastes. Oppdateringen forkastes og systemet fortsetter stabilt.',
      ifEquilibrium: 'AUTOMATISK RECOVERY: Første krasj oppdages, og systemet ruller automatisk tilbake til siste kjente fungerende tilstand innen 30 sekunder.'
    },
    steps: [
      {
        stepNumber: 1,
        phaseName: 'Konfigurasjonspakking & Utrulling',
        actor: 'red',
        title: 'Utrulling av Channel 291 til Ring 0 Driver',
        description: 'Sikkerhetsleverandøren ruller ut en oppdatert regelpakke som inneholder 21 inndatafelter, mens parseren i driveren kun forventet 20.',
        terminalLog: '[RED] PUSH_UPDATE: Deploying C-00000291-00000000-00000032.sys -> Pushed to Ring 0 driver memory -> Out-of-bounds pointer loaded into register.',
        mitreTechnique: 'T1195.002 (Software Supply Chain Update Failure)',
        cveRef: 'CWE-125 (Out-of-bounds Read)',
        visualEffect: 'laser',
        redPowerDelta: 25,
        bluePowerDelta: -10
      },
      {
        stepNumber: 2,
        phaseName: 'Kjerneminne Page Fault (BSOD)',
        actor: 'red',
        title: 'Nullpeker-dereferering i csagent.sys',
        description: 'Driveren forsøker å lese minneadresse 0x9c (ugyldig minne) og kaster en fatal KERNEL_MODE_EXCEPTION_NOT_HANDLED.',
        terminalLog: '[RED] KERNEL_PANIC: BugCheck 0x50 (PAGE_FAULT_IN_NONPAGED_AREA) -> Faulting module csagent.sys at offset +0x45a1 -> System halt.',
        mitreTechnique: 'T1499 (Endpoint Denial of Service)',
        visualEffect: 'breach',
        redPowerDelta: 30,
        bluePowerDelta: -20
      },
      {
        stepNumber: 3,
        phaseName: 'Blue Team eBPF Statisk Verifikasjon',
        actor: 'blue',
        title: 'Verifikator avviser usikre minneinstruksjoner',
        description: 'Den moderne eBPF-arkitekturen simulerer samtlige grener i programmet før det tillates å kjøre, og fanger opp ugyldige pekere i forkant.',
        terminalLog: '[BLUE] EBPF_VERIFIER: Parsing Channel 291 bytecode -> Branch at insn 412 attempts unchecked memory dereference. REJECTED before kernel load.',
        mitreTechnique: 'D3-CSM (Continuous System Monitoring)',
        visualEffect: 'shield',
        redPowerDelta: -20,
        bluePowerDelta: 35
      },
      {
        stepNumber: 4,
        phaseName: 'Autonom A/B Boot Rollback',
        actor: 'blue',
        title: 'Snapshot Gjenoppretting & Trygg Modus',
        description: 'Hvis en krasj likevel inntreffer, detekterer maskinvareovervåkingen en mislykket oppstart og ruller automatisk tilbake til en uforanderlig WORM-tilstand.',
        terminalLog: '[BLUE] A/B_RECOVERY: Boot failure #1 detected. Triggering atomic rollback to Golden Kernel Image Snapshot #4102. System restored in 12.4s.',
        mitreTechnique: 'D3-BR (Backup & Recovery Engine)',
        visualEffect: 'isolate',
        redPowerDelta: -15,
        bluePowerDelta: 25
      },
      {
        stepNumber: 5,
        phaseName: 'Klimaks: Total Nedetid vs 100% Oppetid',
        actor: 'system',
        title: 'Manuell BitLocker-krise vs Selvreparerende Arkitektur',
        description: 'Styrkeforholdet avgjør om organisasjonen må taste BitLocker-nøkler manuelt på tusenvis av servere eller om systemet reparerer seg selv.',
        terminalLog: '[BATTLE] RED: Cascading reboot across fleet. BLUE: Self-healing resilient micro-kernel isolating faulty driver and continuing business operations.',
        visualEffect: 'reboot'
      }
    ]
  }
];
