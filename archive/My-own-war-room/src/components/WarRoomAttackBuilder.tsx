import type { AttackCategory } from '../security/types';

export interface WarRoomAttackInput {
  vector: AttackCategory;
  payload: string;
}

interface Props {
  attack: WarRoomAttackInput;
  setAttack: (attack: WarRoomAttackInput) => void;
  onRun?: () => void;
}

const vectors: AttackCategory[] = [
  'worm_propagation',
  'multi_attempt_hijack',
  'context_weaving',
  'tool_poisoning',
  'privilege_escalation',
  'rag_corruption',
  'evaluation_cheating',
];

export default function WarRoomAttackBuilder({ attack, setAttack, onRun }: Props) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <h3 className="text-sm font-semibold text-cyan-300">Attack Builder</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-[220px_1fr_auto]">
        <label className="text-xs text-slate-400">
          Vector
          <select
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-2 text-xs text-slate-200"
            value={attack.vector}
            onChange={(e) => setAttack({ ...attack, vector: e.target.value as AttackCategory })}
          >
            {vectors.map((vector) => <option key={vector} value={vector}>{vector}</option>)}
          </select>
        </label>
        <label className="text-xs text-slate-400">
          Payload
          <input
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-2 text-xs text-slate-200"
            value={attack.payload}
            onChange={(e) => setAttack({ ...attack, payload: e.target.value })}
          />
        </label>
        {onRun && (
          <button
            type="button"
            onClick={onRun}
            className="self-end rounded bg-cyan-700 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-600"
          >
            Run
          </button>
        )}
      </div>
      <p className="mt-2 text-[11px] text-slate-500">
        Vector selection maps directly to a supported SecurityEngine preset.
      </p>
    </section>
  );
}
