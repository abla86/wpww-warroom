import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit3,
  Search,
  Tag,
  Pin,
  FileText,
  Code2,
  Copy,
  Check,
  Download,
  AlertCircle,
  FolderOpen,
  Filter,
  Save,
  BookOpen,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { HackerNote, NoteCategory, NoteSeverity } from '../types';

interface HackerNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGuide?: (topic?: string) => void;
}

const STORAGE_KEY = 'wpww_hacker_notes_v1';

const INITIAL_PRESET_NOTES: HackerNote[] = [
  {
    id: 'note-001',
    title: 'Incident Triage: Phantom-ZeroDay Polymorf Minne-Bypass',
    category: 'INCIDENT',
    severity: 'CRITICAL',
    tags: ['Zero-Day', 'ROP-Chain', 'ASLR', 'Polymorphic'],
    author: 'WPWW-Operator-01',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    pinned: true,
    content: `## Observasjon og Hendelsesforløp
Under simulering CLASH-001 oppdaget vi en ukjent polymorf shellcode med Shannon-entropi på 7.92 bits. Angriperen unngikk statiske signaturer ved å dynamisk rekombinere NOP-sleder og ROP-gadgets i minnet.

### Berørte Komponenter
- Heap Allokator (glibc ptmalloc)
- Port 443 Ingress Gateway
- WORM WAL Forsegling logget hendelsen under blokk #1842

### Konklusjon & Mottiltak
1. Hev Shannon-entropiterskelen fra 7.00 til 6.80 bits på Lag 2.
2. Aktiver 64-bit dynamisk base-offset ASLR og umiddelbar heap-karantene.`,
    codeLanguage: 'yara',
    codeSnippet: `rule Phantom_ZeroDay_Polymorphic {
  meta:
    description = "Oppdager polymorf shellcode med dynamiske ROP-gadgets"
    author = "WPWW SOC Forensics"
    severity = "CRITICAL"
  strings:
    $rop_pivot = { 58 C3 5F C3 }
    $execve_shell = { 31 C0 50 68 2F 2F 73 68 68 2F 62 69 6E 89 E3 }
  condition:
    uint16(0) == 0x5A4D or uint32(0) == 0x464C457F and
    ($rop_pivot and $execve_shell)
}`,
  },
  {
    id: 'note-002',
    title: 'eBPF XDP Kjerne-Filter for 100 Gbps SYN-Flom',
    category: 'DEFENSE_PLAYBOOK',
    severity: 'HIGH',
    tags: ['eBPF', 'XDP', 'DDoS', 'Mirai', 'Kernel'],
    author: 'NetOps-Sentinel',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    pinned: true,
    content: `## Bakgrunn for eBPF XDP Implementasjon
Standard iptables og conntrack kaster pakker for sent i nettverksstakken ved flommer over 10 millioner pps. Ved å kompilere et XDP-program direkte i nettverkskortets ringbuffer (NIC driver mode) kan vi droppe uautoriserte SYN-pakker på sub-mikrosekund nivå.

### Ytelsestall
- Før XDP: 1.2M pps (CPU mettet på 98%)
- Med eBPF XDP: 14.8M pps (CPU forbruk < 14%)`,
    codeLanguage: 'c',
    codeSnippet: `#include <linux/bpf.h>
#include <bpf/bpf_helpers.h>

SEC("xdp")
int xdp_syn_drop(struct xdp_md *ctx) {
    void *data = (void *)(long)ctx->data;
    void *data_end = (void *)(long)ctx->data_end;
    // Inspiser IP/TCP headers og dropp hvis SYN flagg uten ACK
    // Returner XDP_DROP for uønsket trafikk, XDP_PASS for legitime
    return XDP_PASS;
}
char _license[] SEC("license") = "GPL";`,
  },
  {
    id: 'note-003',
    title: 'Stuxnet PLS Memory Hook & Frekvensavvik IOCs',
    category: 'IOC_LIST',
    severity: 'HIGH',
    tags: ['SCADA', 'ICS', 'Stuxnet', 'Siemens', 'PLC'],
    author: 'OT-Security-Lead',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    pinned: false,
    content: `## Tekniske Indikatorer for Industriell Sabotasje
Angrep mot industrielt utstyr (Port 102 ISO-on-TCP) bruker man-in-the-middle manipulering av frekvensomformere. 

### Kritiske IOC-er:
- **Port:** TCP 102 (S7comm protokoll)
- **Funksjonskoder:** 0x04 (Read Var), 0x05 (Write Var til DB1)
- **Typisk avvik:** Frekvens svinger mellom 1410 Hz og 2 Hz over en 50-dagers periode uten operatør-kommando i SCADA HMI.`,
    codeLanguage: 'python',
    codeSnippet: `import socket

def inspect_s7_packet(payload):
    # Sjekk om pakken inneholder uautorisert Write Var til PLS DB-blokk
    if len(payload) > 10 and payload[0:2] == b'\\x03\\x00':
        print("[!] Advarsel: S7comm trafikk oppdaget på port 102")
        return True
    return False`,
  },
  {
    id: 'note-004',
    title: 'WannaCry Killswitch & EternalBlue SMB Patch Log',
    category: 'REVERSE_ENG',
    severity: 'MEDIUM',
    tags: ['EternalBlue', 'SMBv1', 'MS17-010', 'Ransomware'],
    author: 'Malware-Lab-Analyst',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    pinned: false,
    content: `## Analyse av SMBv1 Sårbarhet (MS17-010)
WannaCry benytter EternalBlue exploit-kjeden via SMBv1 buffer overflow.

### Verifisering av Deaktivering
1. Kjør PowerShell kommando for å verifisere at SMBv1 protokollen er permanent deaktivert på alle servere.
2. Blokker innkommende port 445 fra offentlige IP-subnett i brannmuren.`,
    codeLanguage: 'bash',
    codeSnippet: `# Sjekk SMBv1 status i Linux/Samba eller Windows
# Linux / Samba:
grep -i "min protocol = SMB2" /etc/samba/smb.conf || echo "Mangler SMB2 minimum!"

# Windows PowerShell:
# Get-SmbServerConfiguration | Select EnableSMB1Protocol`,
  },
];

const NOTE_TEMPLATES = [
  {
    label: 'Incident Triage Rapport',
    category: 'INCIDENT' as NoteCategory,
    severity: 'CRITICAL' as NoteSeverity,
    title: 'Incident Triage: [Trusselnavn]',
    content: `## Hendelsessammendrag
- **Tidspunkt:** ${new Date().toLocaleString()}
- **Trusselkilde:** 
- **Vektor:** 

### Observasjon og Analyse
Hva ble oppdaget i loggene, og hvilke forsvarslag reagerte?

### Umiddelbare Tiltak (Containment)
1. Isoler berørte IP-adresser i svartelisten.
2. Forsegl minne-dump i WORM-kjeden for forensisk bevis.`,
    codeSnippet: `# Skriv inn relevante YARA-regler eller iptables blokkering her`,
    codeLanguage: 'bash',
  },
  {
    label: 'YARA Deteksjonsregel Mal',
    category: 'YARA_RULE' as NoteCategory,
    severity: 'HIGH' as NoteSeverity,
    title: 'YARA: Deteksjon av [Payload-Signatur]',
    content: `## Bakgrunn for YARA-regelen
Beskriv hvilken skadevare eller polymorf egenskap denne regelen skal avdekke.`,
    codeSnippet: `rule Custom_Threat_Detection {
  meta:
    description = "Avdekker spesifikke heksadesimale mønstre"
    author = "SOC Analyst"
    date = "${new Date().toISOString().slice(0, 10)}"
  strings:
    $magic = { 4D 5A }
    $hex_string = { E8 ?? ?? ?? ?? 58 }
  condition:
    $magic at 0 and $hex_string
}`,
    codeLanguage: 'yara',
  },
  {
    label: 'IOC Sjekkliste Mal',
    category: 'IOC_LIST' as NoteCategory,
    severity: 'MEDIUM' as NoteSeverity,
    title: 'IOC Liste: [Kampanje/Trusselaktør]',
    content: `## Indikatorer på Kompromittering (IOCs)
- **Kjente Ondesinnede IP-adresser:**
  - 185.220.101.5 (Tor Exit Node)
  - 91.240.118.42 (C2 Server)

- **SHA-256 Hasher:**
  - e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855

- **Domener & Vertsnavn:**
  - update-kernel-sync.cc`,
    codeSnippet: `# Python skript for å sjekke loggfiler mot disse hashene:
import hashlib`,
    codeLanguage: 'python',
  },
];

export const HackerNotesModal: React.FC<HackerNotesModalProps> = ({
  isOpen,
  onClose,
  onOpenGuide,
}) => {
  const [notes, setNotes] = useState<HackerNote[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return INITIAL_PRESET_NOTES;
  });

  const [activeNoteId, setActiveNoteId] = useState<string>(notes[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Note Form State (for creating / editing)
  const [formTitle, setFormTitle] = useState<string>('');
  const [formCategory, setFormCategory] = useState<NoteCategory>('INCIDENT');
  const [formSeverity, setFormSeverity] = useState<NoteSeverity>('MEDIUM');
  const [formTags, setFormTags] = useState<string>('');
  const [formAuthor, setFormAuthor] = useState<string>('WPWW-Analyst');
  const [formContent, setFormContent] = useState<string>('');
  const [formCodeSnippet, setFormCodeSnippet] = useState<string>('');
  const [formCodeLanguage, setFormCodeLanguage] = useState<string>('python');

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {
      // ignore
    }
  }, [notes]);

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (n.codeSnippet && n.codeSnippet.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat = selectedCategory === 'ALL' || n.category === selectedCategory;
    const matchesSev = selectedSeverity === 'ALL' || n.severity === selectedSeverity;

    return matchesSearch && matchesCat && matchesSev;
  });

  // Start new note
  const handleStartNewNote = () => {
    setIsEditing(true);
    setFormTitle('Ny Sikkerhetsanalyse & Notat');
    setFormCategory('INCIDENT');
    setFormSeverity('MEDIUM');
    setFormTags('SOC, Triage, Logg');
    setFormAuthor('WPWW-Analyst');
    setFormContent('## Beskrivelse av observasjon\n\n- Detaljer:\n- Konklusjon:');
    setFormCodeSnippet('');
    setFormCodeLanguage('bash');
  };

  // Populate form for editing active note
  const handleEditActiveNote = () => {
    if (!activeNote) return;
    setIsEditing(true);
    setFormTitle(activeNote.title);
    setFormCategory(activeNote.category);
    setFormSeverity(activeNote.severity);
    setFormTags(activeNote.tags.join(', '));
    setFormAuthor(activeNote.author);
    setFormContent(activeNote.content);
    setFormCodeSnippet(activeNote.codeSnippet || '');
    setFormCodeLanguage(activeNote.codeLanguage || 'python');
  };

  // Save form
  const handleSaveNote = () => {
    if (!formTitle.trim()) return;

    const tagsArray = formTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const existingIndex = notes.findIndex((n) => n.id === activeNoteId);

    if (existingIndex >= 0 && activeNote) {
      // Update existing
      const updated: HackerNote = {
        ...activeNote,
        title: formTitle,
        category: formCategory,
        severity: formSeverity,
        tags: tagsArray,
        author: formAuthor || 'WPWW-Analyst',
        content: formContent,
        codeSnippet: formCodeSnippet.trim() ? formCodeSnippet : undefined,
        codeLanguage: formCodeLanguage,
        updatedAt: new Date().toISOString(),
      };

      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      setFeedbackMessage('Notat oppdatert!');
    } else {
      // Create new
      const newNote: HackerNote = {
        id: `note-${Date.now()}`,
        title: formTitle,
        category: formCategory,
        severity: formSeverity,
        tags: tagsArray,
        author: formAuthor || 'WPWW-Analyst',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        content: formContent,
        codeSnippet: formCodeSnippet.trim() ? formCodeSnippet : undefined,
        codeLanguage: formCodeLanguage,
        pinned: false,
      };

      setNotes((prev) => [newNote, ...prev]);
      setActiveNoteId(newNote.id);
      setFeedbackMessage('Nytt notat lagret!');
    }

    setIsEditing(false);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // Delete active note
  const handleDeleteNote = (id: string) => {
    if (notes.length <= 1) {
      alert('Du kan ikke slette det siste notatet.');
      return;
    }
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    setActiveNoteId(updated[0]?.id || '');
    setIsEditing(false);
    setFeedbackMessage('Notat slettet.');
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  // Toggle pin
  const handleTogglePin = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  };

  // Apply template
  const handleApplyTemplate = (tmpl: typeof NOTE_TEMPLATES[0]) => {
    setFormTitle(tmpl.title);
    setFormCategory(tmpl.category);
    setFormSeverity(tmpl.severity);
    setFormContent(tmpl.content);
    setFormCodeSnippet(tmpl.codeSnippet);
    setFormCodeLanguage(tmpl.codeLanguage);
  };

  // Copy code snippet
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Export all notes as JSON
  const handleExportAllJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(notes, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `wpww-hacker-notes-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // Export current note as Markdown
  const handleExportCurrentMarkdown = () => {
    if (!activeNote) return;
    const md = `# ${activeNote.title}
**Kategori:** ${activeNote.category} | **Alvorlighetsgrad:** ${activeNote.severity}
**Forfatter:** ${activeNote.author} | **Dato:** ${new Date(activeNote.createdAt).toLocaleString()}
**Tagger:** ${activeNote.tags.join(', ')}

---

${activeNote.content}

${
  activeNote.codeSnippet
    ? `\n\`\`\`${activeNote.codeLanguage || ''}\n${activeNote.codeSnippet}\n\`\`\`\n`
    : ''
}
`;
    const dataStr = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(md);
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `${activeNote.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-950 border border-cyan-800/80 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-950/80 border border-cyan-700/80 rounded-xl text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Etiske Hacker Notater & SOC Feltjournal</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                  {notes.length} notater lagret
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Dokumenter hendelser, reversering, YARA-regler og IOC-lister underveis i simuleringen.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenGuide && (
              <button
                onClick={() => onOpenGuide('hackernotes')}
                className="px-2.5 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Få veiledning om hvordan du fører hacker-notater og YARA-regler"
              >
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Veileder</span>
              </button>
            )}

            <button
              onClick={handleExportAllJSON}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Eksporter alle notater til en JSON-fil"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Eksport Alle</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Message */}
        {feedbackMessage && (
          <div className="bg-cyan-950/90 border-b border-cyan-700/80 px-4 py-2 text-xs font-mono text-cyan-300 flex items-center justify-between">
            <span>✨ {feedbackMessage}</span>
            <button onClick={() => setFeedbackMessage(null)} className="text-slate-400 hover:text-white">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Main Body (Split View: Sidebar + Detail/Editor) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Sidebar: Note List & Filters */}
          <div className="w-full md:w-80 border-r border-slate-800 flex flex-col bg-slate-950/50">
            {/* Search & New Button */}
            <div className="p-3 border-b border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Søk i notater & kode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-600 font-mono"
                  />
                </div>
                <button
                  onClick={handleStartNewNote}
                  className="px-2.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-mono text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer shrink-0"
                  title="Opprett et nytt notat"
                >
                  <Plus className="w-3.5 h-3.5" /> Nytt
                </button>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1 text-[10px] font-mono">
                {['ALL', 'INCIDENT', 'DEFENSE_PLAYBOOK', 'IOC_LIST', 'YARA_RULE', 'REVERSE_ENG'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                      selectedCategory === cat
                        ? 'bg-cyan-900 text-cyan-200 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat === 'ALL' ? 'Alle' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Note List Scrollable */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
              {filteredNotes.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 font-mono">
                  Ingen notater matcher filteret.
                </div>
              ) : (
                filteredNotes.map((note) => {
                  const isSelected = note.id === activeNoteId;

                  return (
                    <div
                      key={note.id}
                      onClick={() => {
                        setActiveNoteId(note.id);
                        setIsEditing(false);
                      }}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-600/80 shadow-md shadow-cyan-950/40'
                          : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="font-bold text-xs text-slate-200 line-clamp-1">
                          {note.title}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {note.pinned && <Pin className="w-3 h-3 text-cyan-400 fill-cyan-400" />}
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                              note.severity === 'CRITICAL'
                                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                : note.severity === 'HIGH'
                                ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {note.severity}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1 text-[10px] font-mono text-slate-400">
                        <span className="text-cyan-400">{note.category}</span>
                        <span>•</span>
                        <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {note.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] font-mono bg-slate-950 px-1.5 py-0.2 rounded text-slate-400 border border-slate-800"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Pane: View Mode or Edit Mode */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
            {isEditing ? (
              /* Note Edit Mode */
              <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-cyan-400 font-mono uppercase">
                    Rediger / Opprett Notat
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 font-mono text-xs cursor-pointer"
                    >
                      Avbryt
                    </button>
                    <button
                      onClick={handleSaveNote}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" /> Lagre Notat
                    </button>
                  </div>
                </div>

                {/* Templates Selector */}
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <div className="text-[11px] font-mono text-slate-400 mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Sett inn ferdig mal:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {NOTE_TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleApplyTemplate(tmpl)}
                        className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-850 border border-slate-700 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
                      >
                        {tmpl.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">Tittel</label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-cyan-600 focus:outline-none"
                      placeholder="Tittel på notatet..."
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">Forfatter</label>
                    <input
                      type="text"
                      value={formAuthor}
                      onChange={(e) => setFormAuthor(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-cyan-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">Kategori</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as NoteCategory)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-cyan-600 focus:outline-none"
                    >
                      <option value="INCIDENT">INCIDENT (Sikkerhetshendelse)</option>
                      <option value="DEFENSE_PLAYBOOK">DEFENSE_PLAYBOOK (Forsvarsplan)</option>
                      <option value="IOC_LIST">IOC_LIST (Tekniske Indikatorer)</option>
                      <option value="YARA_RULE">YARA_RULE (Deteksjonsregel)</option>
                      <option value="REVERSE_ENG">REVERSE_ENG (Reversering)</option>
                      <option value="PENTEST_LOG">PENTEST_LOG (Penetrasjonstest)</option>
                      <option value="INTEL">INTEL (Trusseletterretning)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">Alvorlighetsgrad</label>
                    <select
                      value={formSeverity}
                      onChange={(e) => setFormSeverity(e.target.value as NoteSeverity)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-cyan-600 focus:outline-none"
                    >
                      <option value="CRITICAL">CRITICAL (Kritisk)</option>
                      <option value="HIGH">HIGH (Høy)</option>
                      <option value="MEDIUM">MEDIUM (Middels)</option>
                      <option value="LOW">LOW (Lav)</option>
                      <option value="INFO">INFO (Opplysning)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">Tagger (komma-delt)</label>
                    <input
                      type="text"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      placeholder="eBPF, ZeroDay, Kernel"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-cyan-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Content Editor */}
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    Notatinnhold (Markdown støttet)
                  </label>
                  <textarea
                    rows={8}
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 font-mono focus:border-cyan-600 focus:outline-none"
                    placeholder="Skriv inn notater, observasjoner, tiltak..."
                  ></textarea>
                </div>

                {/* Code Snippet */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono text-slate-400">
                      Kodesnutt / YARA-regel (valgfritt)
                    </label>
                    <select
                      value={formCodeLanguage}
                      onChange={(e) => setFormCodeLanguage(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded text-[10px] text-cyan-400 font-mono px-2 py-0.5"
                    >
                      <option value="python">Python</option>
                      <option value="bash">Bash / Shell</option>
                      <option value="yara">YARA</option>
                      <option value="c">C / eBPF</option>
                      <option value="sql">SQL</option>
                      <option value="json">JSON</option>
                    </select>
                  </div>
                  <textarea
                    rows={6}
                    value={formCodeSnippet}
                    onChange={(e) => setFormCodeSnippet(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-xs text-emerald-300 font-mono focus:border-cyan-600 focus:outline-none"
                    placeholder="Lim inn kode, regler, scripts eller payload-data her..."
                  ></textarea>
                </div>
              </div>
            ) : activeNote ? (
              /* Note Read View */
              <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6">
                {/* Note Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                          activeNote.severity === 'CRITICAL'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : activeNote.severity === 'HIGH'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {activeNote.severity}
                      </span>
                      <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                        {activeNote.category}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Av {activeNote.author} • Oppdatert {new Date(activeNote.updatedAt).toLocaleString()}
                      </span>
                    </div>
                    <h1 className="text-xl font-bold text-white mt-2 tracking-wide">
                      {activeNote.title}
                    </h1>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePin(activeNote.id)}
                      className={`p-2 rounded-lg border font-mono text-xs transition-colors cursor-pointer ${
                        activeNote.pinned
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-600'
                          : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                      title={activeNote.pinned ? 'Fjern feste' : 'Fest notat øverst'}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleExportCurrentMarkdown}
                      className="p-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-300 transition-colors cursor-pointer"
                      title="Last ned dette notatet som Markdown (.md)"
                    >
                      <Download className="w-4 h-4 text-emerald-400" />
                    </button>
                    <button
                      onClick={handleEditActiveNote}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Rediger
                    </button>
                    <button
                      onClick={() => handleDeleteNote(activeNote.id)}
                      className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/80 text-rose-300 transition-colors cursor-pointer"
                      title="Slett notat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Tags */}
                {activeNote.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-slate-500" />
                    {activeNote.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-mono bg-slate-900 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Markdown Content Body */}
                <div className="prose prose-invert max-w-none text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-line bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
                  {activeNote.content}
                </div>

                {/* Attached Code Snippet */}
                {activeNote.codeSnippet && (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
                    <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                        <Code2 className="w-4 h-4" />
                        <span>Kodesnutt [{activeNote.codeLanguage?.toUpperCase() || 'KODE'}]</span>
                      </div>
                      <button
                        onClick={() => handleCopyCode(activeNote.codeSnippet || '')}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedCode ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Kopiert!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span>Kopier kode</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto bg-slate-950/70">
                      <code>{activeNote.codeSnippet}</code>
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-sm font-mono">
                Velg et notat fra listen til venstre, eller klikk "+ Nytt" for å starte.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
