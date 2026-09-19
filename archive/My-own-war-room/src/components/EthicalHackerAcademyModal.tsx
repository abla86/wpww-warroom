import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  ShieldCheck, 
  ShieldAlert, 
  Crosshair, 
  BookOpen, 
  Copy, 
  Check, 
  Sparkles, 
  Layers, 
  KeyRound, 
  Flame, 
  Cpu, 
  AlertTriangle,
  Lightbulb,
  Code2,
  Bug,
  Shield,
  Search,
  Zap,
  Globe
} from 'lucide-react';
import { HACKER_INTEL_CATALOG, HackerIntel } from '../data/hackerIntelCatalog';

interface EthicalHackerAcademyModalProps {
  isOpen: boolean;
  onClose: () => void;
  hackerHudEnabled: boolean;
  onToggleHackerHud: () => void;
}

export const EthicalHackerAcademyModal: React.FC<EthicalHackerAcademyModalProps> = ({
  isOpen,
  onClose,
  hackerHudEnabled,
  onToggleHackerHud,
}) => {
  const [activeTab, setActiveTab] = useState<
    'principles' | 'firewalls' | 'malware' | 'attacks' | 'tools' | 'codelab' | 'cheatsheet'
  >('principles');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCmd(code);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const ethicalPrinciples = [
    {
      title: '1. Skriftlig Autorisasjon (Scope & RoE)',
      desc: 'En etisk hacker (White Hat) angriper ALDRI et system uten en skriftlig, signert avtale (Rules of Engagement). Uten forhåndsgodkjent tillatelse er all testing straffbar etter straffeloven.',
      badge: 'JUS & ETIKK',
      color: 'border-cyan-700 bg-cyan-950/40 text-cyan-300'
    },
    {
      title: '2. "Do No Harm" (Ingen Destruktivitet)',
      desc: 'Målet er aldri å slette data eller kræsje produksjonssystemer. Du beviser sårbarheten ("Proof of Concept"), men stopper umiddelbart før skade eller nedetid inntreffer.',
      badge: 'KJERNEPRINSIPP',
      color: 'border-emerald-700 bg-emerald-950/40 text-emerald-300'
    },
    {
      title: '3. Ansvarlig Rapportering (Coordinated Disclosure)',
      desc: 'Når du finner en sårbarhet, rapporteres den sikkert til systemeier eller via anerkjente Bug Bounty-programmer (f.eks. HackerOne/Bugcrowd) med grundig teknisk fiks-anbefaling.',
      badge: 'LEVERANSE',
      color: 'border-purple-700 bg-purple-950/40 text-purple-300'
    },
    {
      title: '4. Konfidensialitet & Databeskyttelse',
      desc: 'Data du oppdager under et pentestoppdrag (passord, kundeopplysninger, helsedata) forblir strengt konfidensielle og må aldri eksfiltreres eller lekkes.',
      badge: 'SIKKERHET',
      color: 'border-amber-700 bg-amber-950/40 text-amber-300'
    }
  ];

  // Defensive Firewalls & Shields
  const firewallEntries: HackerIntel[] = [
    HACKER_INTEL_CATALOG.ebpf_xdp_wall,
    HACKER_INTEL_CATALOG.waf_nextgen,
    HACKER_INTEL_CATALOG.zero_trust_mesh,
    HACKER_INTEL_CATALOG.mirror_jamming,
    HACKER_INTEL_CATALOG.blackout_protocol,
    HACKER_INTEL_CATALOG.worm_integrity,
  ].filter(Boolean);

  // Viruses & Malware
  const malwareEntries: HackerIntel[] = [
    HACKER_INTEL_CATALOG.stuxnet_plc,
    HACKER_INTEL_CATALOG.wannacry_smb,
    HACKER_INTEL_CATALOG.notpetya_wiper,
    HACKER_INTEL_CATALOG.mirai_botnet,
    HACKER_INTEL_CATALOG.xz_utils_backdoor,
    HACKER_INTEL_CATALOG.rootkit_ring0,
    HACKER_INTEL_CATALOG.polymorphic_engine,
  ].filter(Boolean);

  // Attacks & Exploits
  const attackEntries: HackerIntel[] = [
    HACKER_INTEL_CATALOG.buffer_overflow_rop,
    HACKER_INTEL_CATALOG.sql_injection,
    HACKER_INTEL_CATALOG.dns_tunneling_c2,
    HACKER_INTEL_CATALOG.arp_poisoning_mitm,
    HACKER_INTEL_CATALOG.privilege_escalation_suid,
    HACKER_INTEL_CATALOG.side_channel_spectre,
    HACKER_INTEL_CATALOG.active_directory_golden,
    HACKER_INTEL_CATALOG.prompt_injection_jailbreak,
    HACKER_INTEL_CATALOG.reverse_shell,
    HACKER_INTEL_CATALOG.zero_day_rce,
  ].filter(Boolean);

  // Tools Arsenal
  const toolsArsenal = [
    {
      name: 'Nmap (Network Mapper)',
      role: 'Rekognosering & Portskanning',
      cmd: 'nmap -sV -sC -T4 -p 1-65535 192.168.1.50',
      explanation: 'Kartlegger åpne porter, tjenesteversjoner og kjører innebygde sårbarhetsskript (NSE).'
    },
    {
      name: 'Wireshark / TShark',
      role: 'Dyp Pakkeanalyse & Trafikkovervåking',
      cmd: 'tshark -i eth0 -Y "http.request or dns" -T fields -e ip.src -e http.host',
      explanation: 'Avlytter og dekoder nettverkspakker for å finne ukryptert data, DNS-lekkasjer eller uvanlig trafikk.'
    },
    {
      name: 'Burp Suite',
      role: 'Web- & API-sikkerhetstesting',
      cmd: 'curl -x http://127.0.0.1:8080 -k -i https://target.internal/api',
      explanation: 'Sender all nettlesertrafikk gjennom en proxy for å fange opp og manipulere forespørsler og JSON-data.'
    },
    {
      name: 'SQLmap',
      role: 'Automatisert SQLi-revisjon',
      cmd: 'sqlmap -u "https://target.com/user?id=10" --risk=3 --level=3 --dbs',
      explanation: 'Tester inndatafelt for alle typer SQL-injisering og beviser sårbarheten ved å hente ut databasenavn.'
    },
    {
      name: 'Metasploit Framework',
      role: 'Exploit-validering & PoC',
      cmd: 'msfconsole -q -x "use exploit/multi/handler; set PAYLOAD generic/shell_reverse_tcp; run"',
      explanation: 'Stort bibliotek med verifiserte exploits for å validere at rapporterte sårbarheter faktisk kan utnyttes.'
    },
    {
      name: 'Hashcat / John the Ripper',
      role: 'Passordsikkerhet & Hash-knekking',
      cmd: 'hashcat -m 1000 -a 0 ntlm_hashes.txt rockyou.txt -r rules/best64.rule',
      explanation: 'Tester om passordpolicyen i organisasjonen holder mål ved å simulere ordbok- og regelbaserte angrep på hashede passord.'
    }
  ];

  // Complete Code Lab (Production-grade defensive code & rules)
  const codeLabSnippets = [
    {
      title: '1. eBPF XDP Kjerne-Brannmur (C-kode for 100Gbps linjehastighet)',
      lang: 'C (eBPF)',
      filename: 'xdp_ddos_shield.c',
      desc: 'Kjøres på nettverkskortets drivernivå og dropper uønskede pakker før operativsystemkjernen belastes.',
      code: `#include <linux/bpf.h>
#include <linux/if_ether.h>
#include <linux/ip.h>
#include <bpf/bpf_helpers.h>

SEC("xdp")
int xdp_firewall_drop(struct xdp_md *ctx) {
    void *data_end = (void *)(long)ctx->data_end;
    void *data = (void *)(long)ctx->data;
    struct ethhdr *eth = data;

    if ((void *)(eth + 1) > data_end) return XDP_PASS;
    if (eth->h_proto != __constant_htons(ETH_P_IP)) return XDP_PASS;

    struct iphdr *ip = (void *)(eth + 1);
    if ((void *)(ip + 1) > data_end) return XDP_PASS;

    // Sjekk om pakken kommer fra blokkert IP (f.eks. 198.51.100.42)
    if (ip->saddr == __constant_htonl(0xC633642A)) {
        return XDP_DROP; // KASTES UMIDDELBART PÅ DRIVERNIVÅ
    }
    return XDP_PASS;
}
char _license[] SEC("license") = "GPL";`
    },
    {
      title: '2. YARA Deteksjonsregel for Stuxnet & Ondsinnede LNK-filer',
      lang: 'YARA',
      filename: 'stuxnet_detector.yar',
      desc: 'Avslører sabotasjeblokker og sårbarhetsindikatorer i filsystemer og minnedumper.',
      code: `rule Stuxnet_S7_Manipulator {
  meta:
    description = "Detekterer Stuxnet PLC sabotasjeblokker og LNK sårbarheter"
    author = "WPWW Cyber Defense - SOC Team"
    reference = "CVE-2010-2568"
  strings:
    $s1 = "s7otbxsx.dll" ascii nocase
    $s2 = "Step7\\\\s7proj" ascii nocase
    $magic_lnk = { 4C 00 00 00 01 14 02 00 }
  condition:
    uint16(0) == 0x5A4D and (2 of ($s*)) or $magic_lnk at 0
}`
    },
    {
      title: '3. Suricata / Snort IPS Regel for SQL-injeksjon og WAF-Evasion',
      lang: 'Snort / Suricata',
      filename: 'sqli_ips.rules',
      desc: 'Aktiv dyp pakkeinspeksjon (DPI) som blokkerer UNION SELECT-angrep i sanntid.',
      code: `drop tcp any any -> $HOME_NET [80,443] (
  msg:"WPWW-IPS: Blokkerer mistenkelig SQLi UNION SELECT angrep";
  flow:to_server,established;
  content:"UNION",nocase;
  content:"SELECT",nocase,distance:1;
  pcre:"/(union.*select.*from)/Ui";
  classtype:web-application-attack;
  sid:1000942; rev:2;
)`
    },
    {
      title: '4. Python Autonom Honeypot & Sinkhole Sensor',
      lang: 'Python 3',
      filename: 'honeypot_daemon.py',
      desc: 'Fanger innloggingsforsøk og logger angriperens IP, port og rå-payload i JSON.',
      code: `import socket, json, datetime

def run_sinkhole(port=2222):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind(('0.0.0.0', port))
    s.listen(5)
    print(f"[*] Honeypot lytter på port {port}...")
    while True:
        conn, addr = s.accept()
        conn.send(b"SSH-2.0-OpenSSH_8.9p1 Ubuntu\\r\\n")
        data = conn.recv(1024)
        event = {
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "attacker_ip": addr[0],
            "captured_hex": data.hex()
        }
        print(f"[!] FANGEN I HONEYPOT: {json.dumps(event)}")
        conn.close()

if __name__ == '__main__':
    run_sinkhole()`
    },
    {
      title: '5. Nginx Next-Gen WAF Sikkerhetskonfigurasjon',
      lang: 'Nginx Conf',
      filename: 'nginx_waf.conf',
      desc: 'Herder webserveren med strenge CSP-headers, anti-sniffing og aggressiv rate-limiting.',
      code: `limit_req_zone $binary_remote_addr zone=waf_rate_limit:10m rate=15r/s;

server {
    listen 443 ssl http2;
    server_name defense.wpww.internal;

    # Strenge sikkerhetsheaders mot XSS og Clickjacking
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; object-src 'none';" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location /api/ {
        limit_req zone=waf_rate_limit burst=25 nodelay;
        proxy_pass http://127.0.0.1:3000;
    }
}`
    }
  ];

  const filterItems = (list: HackerIntel[]) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(item => 
      item.title.toLowerCase().includes(q) ||
      item.concept.toLowerCase().includes(q) ||
      item.redTeamTactic.toLowerCase().includes(q) ||
      item.blueTeamDefense.toLowerCase().includes(q) ||
      (item.cveOrRef && item.cveOrRef.toLowerCase().includes(q))
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-mono text-slate-100">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-700 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100 tracking-wide">
                  Etisk Superhacker Akademi, Murer & Arsenal
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                  WHITE HAT KUNNSKAPSBASE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Koder, cyber-murer, virus-analyser og verktøy som forvandler deg til en autorisert sikkerhetsekspert.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Toggle for HUD Tooltip Hints */}
            <button
              onClick={onToggleHackerHud}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                hackerHudEnabled 
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-sm shadow-cyan-950' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title="Slå på/av små glødende indikatorer på knapper som har etisk hacker-kunnskap"
            >
              <Lightbulb className={`w-3.5 h-3.5 ${hackerHudEnabled ? 'text-cyan-400' : ''}`} />
              <span>Intel HUD: {hackerHudEnabled ? 'PÅ' : 'AV'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-3 gap-1.5 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('principles')}
            className={`py-3 px-3 border-b-2 font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'principles'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> 1. Etikk & Lover
          </button>
          <button
            onClick={() => setActiveTab('firewalls')}
            className={`py-3 px-3 border-b-2 font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'firewalls'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4 text-cyan-400" /> 2. Murer & Forsvar
          </button>
          <button
            onClick={() => setActiveTab('malware')}
            className={`py-3 px-3 border-b-2 font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'malware'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bug className="w-4 h-4 text-red-400" /> 3. Virus & Skadevare
          </button>
          <button
            onClick={() => setActiveTab('attacks')}
            className={`py-3 px-3 border-b-2 font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'attacks'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crosshair className="w-4 h-4 text-rose-400" /> 4. Angrep & Exploits
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`py-3 px-3 border-b-2 font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'tools'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4 text-amber-400" /> 5. Verktøy-Arsenal
          </button>
          <button
            onClick={() => setActiveTab('codelab')}
            className={`py-3 px-3 border-b-2 font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'codelab'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4 text-purple-400" /> 6. Kodelaboratorium
          </button>
          <button
            onClick={() => setActiveTab('cheatsheet')}
            className={`py-3 px-3 border-b-2 font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'cheatsheet'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 text-yellow-400" /> 7. Hurtigkommandoer
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: ETISKE GRUNNREGLER */}
          {activeTab === 'principles' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-900/50 text-xs text-slate-300 font-sans leading-relaxed">
                <strong className="text-cyan-400 font-mono block mb-1">
                  Hva skiller en "Superhacker" fra en cyberkriminell?
                </strong>
                Ferdighetene og teknologiene er 100% de samme — det eneste som skiller en White Hat fra en Black Hat er 
                <strong> tillatelse, etikk og intensjon</strong>. En etisk hacker finner sårbarheter for å beskytte samfunnet, 
                styrke forsvarsverkene og lukke hullene før kriminelle rekker å utnytte dem.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {ethicalPrinciples.map((p) => (
                  <div key={p.title} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${p.color}`}>
                        {p.badge}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-100">{p.title}</h3>
                    <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 text-xs font-sans text-amber-200/90 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-mono text-amber-400 block mb-0.5">Lovlige treningsarenaer for etisk hacking:</strong>
                  Bruk anerkjente plattformer som <em>Hack The Box</em>, <em>TryHackMe</em>, <em>PortSwigger Web Security Academy</em> og 
                  vårt innebygde simulator-miljø i dette War-Room-dashbordet. Alt du tester her inne skjer i en trygg, isolert sandboks!
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MURER & FORSVAR */}
          {activeTab === 'firewalls' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-xs text-slate-400 font-sans">
                  Moderne forsvarsverk, cyber-murer og arkitekturer som stanser de mest avanserte trusselaktørene:
                </p>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Søk i murer..."
                    className="pl-8 pr-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 w-48"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {filterItems(firewallEntries).map((item) => (
                  <div key={item.id} className="p-4 rounded-xl bg-slate-950 border border-emerald-950/70 hover:border-emerald-600/50 transition-all space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        🛡️ MUR / FORSVAR
                      </span>
                      <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        {item.level}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-100">{item.title}</h3>
                    <p className="text-[11px] text-slate-300 font-sans leading-relaxed">{item.concept}</p>

                    <div className="p-2 rounded bg-emerald-950/30 border border-emerald-900/40 text-[10px]">
                      <strong className="text-emerald-300 block mb-0.5">Blue Team Implementering:</strong>
                      <p className="text-slate-300 font-sans leading-snug">{item.blueTeamDefense}</p>
                    </div>

                    {item.codeSnippet && (
                      <div className="bg-slate-900 rounded p-2 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-cyan-300">
                          <span className="font-bold flex items-center gap-1">
                            <Code2 className="w-3 h-3 text-cyan-400" />
                            {item.codeSnippet.filename}
                          </span>
                          <button
                            onClick={() => handleCopy(item.codeSnippet!.code)}
                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[9px] flex items-center gap-1 cursor-pointer"
                          >
                            {copiedCmd === item.codeSnippet.code ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                            <span>{copiedCmd === item.codeSnippet.code ? 'Kopiert' : 'Kopier kode'}</span>
                          </button>
                        </div>
                        <div className="max-h-20 overflow-y-auto font-mono text-[9px] text-emerald-400">
                          <pre><code>{item.codeSnippet.code}</code></pre>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: VIRUS & SKADEVARE */}
          {activeTab === 'malware' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-xs text-slate-400 font-sans">
                  Historiske og moderne trusler som definerte cyberkrigføring, og hvordan de analyseres og nøytraliseres:
                </p>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Søk i virus..."
                    className="pl-8 pr-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-rose-500 w-48"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {filterItems(malwareEntries).map((item) => (
                  <div key={item.id} className="p-4 rounded-xl bg-slate-950 border border-red-950/70 hover:border-red-600/50 transition-all space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                        ☣️ VIRUS / SKADEVARE
                      </span>
                      {item.cveOrRef && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                          {item.cveOrRef}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xs font-bold text-slate-100">{item.title}</h3>
                    <p className="text-[11px] text-slate-300 font-sans leading-relaxed">{item.concept}</p>

                    <div className="p-2 rounded bg-red-950/20 border border-red-900/30 text-[10px]">
                      <strong className="text-rose-300 block mb-0.5">Invasjonstaktikk & Spredning:</strong>
                      <p className="text-slate-300 font-sans leading-snug">{item.redTeamTactic}</p>
                    </div>

                    <div className="p-2 rounded bg-emerald-950/20 border border-emerald-900/30 text-[10px]">
                      <strong className="text-emerald-300 block mb-0.5">Mottiltak & Nøytralisering:</strong>
                      <p className="text-slate-300 font-sans leading-snug">{item.blueTeamDefense}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ANGREP & EXPLOITS */}
          {activeTab === 'attacks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-xs text-slate-400 font-sans">
                  Sentrale angrepsteknikker, minnesårbarheter og protokoller som enhver penetrasjonstester må forstå:
                </p>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Søk i angrep..."
                    className="pl-8 pr-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 w-48"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {filterItems(attackEntries).map((item) => (
                  <div key={item.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                        🔴 RED TEAM VEKTOR
                      </span>
                      {item.mitreTactic && (
                        <span className="text-[9px] text-amber-300/90 truncate max-w-[140px]">
                          {item.mitreTactic}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xs font-bold text-slate-100">{item.title}</h3>
                    <p className="text-[11px] text-slate-300 font-sans leading-relaxed">{item.concept}</p>

                    <div className="p-2 rounded bg-rose-950/20 border border-rose-900/30 text-[10px]">
                      <strong className="text-rose-300 block mb-0.5">Hvordan det testes (Etisk metode):</strong>
                      <p className="text-slate-300 font-sans leading-snug">{item.redTeamTactic}</p>
                    </div>

                    <div className="p-2 rounded bg-emerald-950/20 border border-emerald-900/30 text-[10px]">
                      <strong className="text-emerald-300 block mb-0.5">Slik tettes hullet:</strong>
                      <p className="text-slate-300 font-sans leading-snug">{item.blueTeamDefense}</p>
                    </div>

                    {item.terminalCommand && (
                      <div className="bg-slate-900 rounded p-1.5 border border-slate-800 flex items-center justify-between gap-2">
                        <code className="text-[10px] text-cyan-300 truncate">{item.terminalCommand}</code>
                        <button
                          onClick={() => handleCopy(item.terminalCommand!)}
                          className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9px] shrink-0 cursor-pointer"
                        >
                          {copiedCmd === item.terminalCommand ? 'Kopiert' : 'Kopier'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ARSENALET (VERKTØY) */}
          {activeTab === 'tools' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 font-sans">
                De seks verktøyene enhver profesjonell penetrasjonstester og etisk hacker har i verktøybeltet sitt (f.eks. på Kali Linux):
              </p>

              <div className="space-y-3 pt-1">
                {toolsArsenal.map((t) => (
                  <div key={t.name} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs font-bold text-cyan-300 font-mono">{t.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">
                        {t.role}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                      {t.explanation}
                    </p>

                    <div className="bg-slate-900 rounded-lg p-2 border border-slate-800 flex items-center justify-between gap-2">
                      <code className="text-[11px] text-emerald-400 font-mono overflow-x-auto">
                        {t.cmd}
                      </code>
                      <button
                        onClick={() => handleCopy(t.cmd)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                        title="Kopier kommando"
                      >
                        {copiedCmd === t.cmd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCmd === t.cmd ? 'Kopiert' : 'Kopier'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: KODELABORATORIUM (FULL KODE-SNIPPETS) */}
          {activeTab === 'codelab' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400 font-sans">
                Komplette, produksjonsklare sikkerhetskoder og forsvarsregler. Studer syntaksen eller kopier rett inn i prosjektene dine:
              </p>

              <div className="space-y-3">
                {codeLabSnippets.map((snippet) => (
                  <div key={snippet.filename} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-purple-400" />
                        <h4 className="text-xs font-bold text-slate-100">{snippet.title}</h4>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-mono">
                        {snippet.lang} • {snippet.filename}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 font-sans">{snippet.desc}</p>

                    <div className="bg-slate-900 rounded-lg p-3 border border-slate-800 relative">
                      <button
                        onClick={() => handleCopy(snippet.code)}
                        className="absolute right-3 top-3 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] flex items-center gap-1 cursor-pointer transition-colors shadow"
                      >
                        {copiedCmd === snippet.code ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCmd === snippet.code ? 'Kopiert' : 'Kopier kode'}</span>
                      </button>
                      <pre className="text-[11px] text-emerald-300 font-mono overflow-x-auto leading-relaxed pr-20">
                        <code>{snippet.code}</code>
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: HURTIGKOMMANDOER CHEATSHEET */}
          {activeTab === 'cheatsheet' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 font-sans">
                Praktiske terminal-kommandoer du kan kopiere og teste i ditt eget øvingsmiljø:
              </p>

              <div className="space-y-2.5">
                {[
                  {
                    title: '1. Rask portskann etter web- og databaseporter',
                    cmd: 'nmap -p 80,443,3000,3306,5432,8080 -T4 -sV 127.0.0.1',
                    desc: 'Finner raskt hvilke webservere og databaser som lytter.'
                  },
                  {
                    title: '2. Vis alle åpne nettverksprosesser lokalt (Linux/macOS)',
                    cmd: 'netstat -tuln -p   # eller ss -tulpn',
                    desc: 'Viser hvilke prosesser som lytter på hvilke porter.'
                  },
                  {
                    title: '3. Test HTTP-headers og WAF-respons med curl',
                    cmd: 'curl -I -X GET "http://localhost:8080" -H "User-Agent: Mozilla/5.0"',
                    desc: 'Sjekker sikkerhets-headers (CSP, HSTS, X-Frame-Options).'
                  },
                  {
                    title: '4. Beregn SHA-256 hash for filintegritet (WORM-test)',
                    cmd: 'sha256sum sensitive_log.sqlite',
                    desc: 'Garanterer at ingen byte har blitt manipulert.'
                  },
                  {
                    title: '5. Søk etter mistenkelige SQL-kommandoer i logger',
                    cmd: 'grep -E -i "union.*select|waitfor delay|sleep\\(" /var/log/nginx/access.log',
                    desc: 'Avslører pågående SQL-injiseringsforsøk i sanntid.'
                  },
                  {
                    title: '6. Nød-isolasjon med iptables (Blackout Protocol)',
                    cmd: 'iptables -P INPUT DROP && iptables -P OUTPUT DROP && iptables -F',
                    desc: 'Kutter all nettverkstrafikk ved et pågående datainnbrudd.'
                  }
                ].map((item) => (
                  <div key={item.title} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="text-xs font-bold text-slate-200">{item.title}</div>
                    <div className="text-[11px] text-slate-400 font-sans">{item.desc}</div>
                    <div className="bg-slate-900 rounded p-1.5 border border-slate-800 flex items-center justify-between gap-2">
                      <code className="text-[11px] text-cyan-300 font-mono truncate">{item.cmd}</code>
                      <button
                        onClick={() => handleCopy(item.cmd)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        {copiedCmd === item.cmd ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                        <span>{copiedCmd === item.cmd ? 'Kopiert' : 'Kopier'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Tips: Hold markøren over knapper og statistikk i War-Room for å få sanntids HUD-forklaringer!</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors cursor-pointer"
          >
            Lukk Akademi
          </button>
        </div>

      </div>
    </div>
  );
};
