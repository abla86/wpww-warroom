import type { DefenseModule, DefenseType } from '../security/types';
import { INITIAL_DEFENSES } from '../security/defaults';

interface Props {
  defenses: DefenseModule[];
  setDefenses: (defenses: DefenseModule[]) => void;
}

const types: DefenseType[] = [
  'provenance_firewall',
  'request_hash_firewall',
  'worm_pattern_scanner',
  'tool_drift_detector',
  'rag_evidence_verifier',
  'eval_integrity_guard',
];

function createDefense(type: DefenseType, existing: DefenseModule[]): DefenseModule | null {
  if (existing.some((defense) => defense.id === type || defense.type === type)) return null;
  const template = INITIAL_DEFENSES.find((defense) => defense.type === type);
  if (!template) return null;

  return {
    ...template,
    id: type,
    rules: template.rules.map((rule) => ({ ...rule })),
    blockedCount: 0,
    quarantinedCount: 0,
  };
}

export default function WarRoomDefenseConfigurator({ defenses, setDefenses }: Props) {
  const update = (index: number, patch: Partial<DefenseModule>) => {
    setDefenses(defenses.map((defense, i) => i === index ? { ...defense, ...patch } : defense));
  };

  const availableTypes = types.filter(
    (type) => !defenses.some((defense) => defense.id === type || defense.type === type),
  );

  const addDefense = () => {
    const type = availableTypes[0];
    if (!type) return;
    const defense = createDefense(type, defenses);
    if (defense) setDefenses([...defenses, defense]);
  };

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-cyan-300">Defense Configurator</h3>
        <button
          type="button"
          onClick={addDefense}
          disabled={availableTypes.length === 0}
          className="rounded border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {availableTypes.length === 0 ? 'All Defenses Added' : 'Add Defense'}
        </button>
      </div>
      <div className="mt-3 space-y-2">
        {defenses.map((defense, index) => (
          <div key={defense.id} className="grid gap-2 rounded-lg border border-slate-800 p-3 md:grid-cols-[1fr_140px_auto]">
            <input
              className="rounded border border-slate-700 bg-slate-950 px-2 py-2 text-xs text-slate-200"
              value={defense.name}
              onChange={(e) => update(index, { name: e.target.value })}
            />
            <select
              className="rounded border border-slate-700 bg-slate-950 px-2 py-2 text-xs text-slate-200"
              value={defense.sensitivity}
              onChange={(e) => update(index, { sensitivity: e.target.value as DefenseModule['sensitivity'] })}
            >
              <option value="conservative">conservative</option>
              <option value="balanced">balanced</option>
              <option value="strict">strict</option>
            </select>
            <label className="flex items-center gap-2 text-xs text-slate-400">
              <input type="checkbox" checked={defense.enabled} onChange={(e) => update(index, { enabled: e.target.checked })} />
              enabled
            </label>
          </div>
        ))}
      </div>
    </section>
  );
}
