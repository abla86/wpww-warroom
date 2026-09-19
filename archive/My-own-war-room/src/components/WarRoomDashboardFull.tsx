import type { WarRoomAdapterOutput } from '../security/WarRoomAdapter';

interface Props {
  sim: WarRoomAdapterOutput | null;
}

export default function WarRoomDashboardFull({ sim }: Props) {
  if (!sim) {
    return (
      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <h2 className="text-sm font-semibold text-cyan-300">SecurityEngine Integration</h2>
        <p className="mt-2 text-xs text-slate-500">No simulation result yet. Fire an attack to populate the authoritative engine output.</p>
      </section>
    );
  }

  const blocks = [
    ['Simulation Result', sim.result],
    ['Topology', sim.topology],
    ['Defenses', sim.defenses],
    ['Timeline', sim.timelineView],
    ['Audit Log', sim.auditView],
    ['Legacy Evaluation', sim.legacyEvaluation],
  ] as const;

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-cyan-300">SecurityEngine Integration</h2>
        <span className="font-mono text-xs text-slate-400">{sim.result.finalVerdict}</span>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {blocks.map(([title, value]) => (
          <div key={title} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</h3>
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words text-[11px] leading-5 text-slate-300">
              {JSON.stringify(value, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </section>
  );
}
