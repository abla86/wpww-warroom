import React, { useState } from 'react';
import { IncidentReport } from '../../types';
import { ClipboardList, PlusCircle, CheckCircle, Clock, ShieldCheck, Send, AlertCircle } from 'lucide-react';

interface IncidentLogReportingProps {
  incidents: IncidentReport[];
  onAddIncident: (report: Omit<IncidentReport, 'id' | 'timestamp'>) => void;
}

export const IncidentLogReporting: React.FC<IncidentLogReportingProps> = ({
  incidents,
  onAddIncident,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [residentName, setResidentName] = useState('Per Hansen');
  const [unit, setUnit] = useState('Bolig 104');
  const [issueType, setIssueType] = useState('Teknisk feil på dørstyring meldt til leverandør');
  const [details, setDetails] = useState('');
  const [status, setStatus] = useState<IncidentReport['status']>('Sendt til leverandør');
  const [reporter, setReporter] = useState('Sykepleier Maria Lund');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueType) return;
    onAddIncident({
      residentName,
      unit,
      issueType,
      reportedBy: reporter,
      status,
      details: details || `Meldt fra Beredskap-app: ${issueType}. Registrert for å unngå dobbeltarbeid for kveldsvakt.`,
    });
    setDetails('');
    setShowForm(false);
  };

  const presetMessages = [
    'Teknisk feil på dørstyring meldt til leverandør',
    'Fall-radar offline – midlertidig 4G nødalarm utlevert',
    'Fysisk tilsyn gjennomført: bruker ivaretatt',
    'Lavt batteri på sengematte – bestilt service',
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
              <ClipboardList className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Felles Hendelseslogg for Drift & Vaktlag
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Sanntidslogg for pleiere og driftspersonell. Forhindrer unødvendige telefoner og dobbeltarbeid.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 font-bold text-xs flex items-center space-x-1.5 shadow-xs"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span>{showForm ? 'Avbryt registrering' : 'Ny driftsmelding'}</span>
        </button>
      </div>

      {/* Optional inline form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900">Registrer driftshendelse / feilmelding</h4>
            <span className="text-[11px] text-slate-500">Synkroniseres med teknisk vakt</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Beboer & Enhet</label>
              <input
                type="text"
                value={`${residentName} (${unit})`}
                onChange={(e) => setResidentName(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Status på tiltak</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as IncidentReport['status'])}
                className="w-full p-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="Sendt til leverandør">Sendt til leverandør</option>
                <option value="Teknisk vakt på vei">Teknisk vakt på vei</option>
                <option value="Midlertidig sikret">Midlertidig sikret (manuell rute)</option>
                <option value="Utbedret">Utbedret</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Hurtigvalg hendelse</label>
            <div className="flex flex-wrap gap-1.5">
              {presetMessages.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setIssueType(preset)}
                  className={`px-2 py-1 rounded text-[11px] border transition-colors ${
                    issueType === preset
                      ? 'bg-teal-100 text-teal-800 border-teal-300 font-semibold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Beskrivelse / Merknad til kolleger</label>
            <textarea
              rows={2}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="F.eks: 'Meldt til leverandør Doro kl. 14:30. Nattpatrulje trenger ikke ringe på nytt.'"
              className="w-full p-2 rounded-lg border border-slate-300 bg-white"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              Avbryt
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center space-x-1.5 shadow-xs"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Publiser i vaktloggen</span>
            </button>
          </div>
        </form>
      )}

      {/* Incident List */}
      <div className="space-y-2.5">
        {incidents.map((inc) => (
          <div
            key={inc.id}
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900">{inc.residentName} ({inc.unit})</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {inc.timestamp}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600 font-medium">{inc.reportedBy}</span>
              </div>
              <p className="font-semibold text-slate-800">{inc.issueType}</p>
              <p className="text-slate-600 text-[11px]">{inc.details}</p>
            </div>

            <div className="shrink-0 flex items-center space-x-2">
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                  inc.status === 'Utbedret'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : inc.status === 'Teknisk vakt på vei'
                    ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}
              >
                {inc.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
