import React from 'react';
import type { SimulationResult, DefenseModule } from '../security/types';

interface SecurityEngineStatusPanelProps {
  result: SimulationResult | null;
  defenses: DefenseModule[];
}

export const SecurityEngineStatusPanel: React.FC<SecurityEngineStatusPanelProps> = ({ result, defenses }) => {
  if (!result) {
    return (
      <section className="bg-slate-950 border border-cyan-900/50 rounded-xl p-4">
        <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">
          SecurityEngine
        </div>
        <div className="mt-1 text-sm text-slate-300">
          Ingen autoritativ simulering er kjørt ennå.
        </div>
      </section>
    );
  }

  const breached = result.finalVerdict === 'BREACHED';

  return (
    <section className="bg-slate-950 border border-slate-800 rounded-xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">
            Authoritative SecurityEngine Result
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className={`font-mono font-bold ${breached ? 'text-rose-400' : 'text-emerald-400'}`}>
              {result.finalVerdict}
            </span>
            <span className="text-xs text-slate-500">{result.attackName}</span>
          </div>
        </div>
        <div className="text-right text-xs font-mono text-slate-400">
          <div>{result.attemptsCompleted} attempt(s)</div>
          <div>{result.executionTimeMs} ms</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4">
        <Metric label="Infected" value={result.nodesInfected.length} />
        <Metric label="Protected" value={result.nodesProtected.length} />
        <Metric label="Drift" value={result.metrics.driftScore} />
        <Metric label="Provenance" value={result.metrics.provenanceRiskIndex} />
        <Metric label="Latency" value={`${result.metrics.defenseLatencyMs} ms`} />
      </div>

      <div className="mt-4 border-t border-slate-900 pt-3">
        <div className="text-[10px] font-mono text-slate-500 uppercase">Defense state</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {defenses.map((defense) => (
            <span
              key={defense.id}
              className={`px-2 py-1 rounded border text-[10px] font-mono ${
                defense.enabled
                  ? 'border-emerald-900 bg-emerald-950/40 text-emerald-300'
                  : 'border-slate-800 bg-slate-900 text-slate-500'
              }`}
            >
              {defense.name}: {defense.blockedCount}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-2">
      <div className="text-[10px] text-slate-500 font-mono uppercase">{label}</div>
      <div className="text-sm text-slate-200 font-mono mt-0.5">{value}</div>
    </div>
  );
}
