import type { AgentNode, NetworkEdge } from '../security/types';

interface Props {
  nodes: AgentNode[];
  edges: NetworkEdge[];
  setNodes: (nodes: AgentNode[]) => void;
  setEdges: (edges: NetworkEdge[]) => void;
}

export default function WarRoomTopologyEditor({ nodes, edges, setNodes, setEdges }: Props) {
  const addNode = () => setNodes([...nodes, {
    id: 'warroom-node-' + crypto.randomUUID(),
    name: 'New Security Node',
    type: 'agent',
    status: 'clean',
    provenance: 'SYSTEM',
    riskScore: 0,
    permissions: [],
    description: 'User-created SecurityEngine node.',
    x: 100,
    y: 100,
    infectionHistory: [],
  }]);

  const canAddEdge = nodes.length >= 2;

  const addEdge = () => {
    if (!canAddEdge) return;
    setEdges([...edges, {
      id: 'warroom-edge-' + crypto.randomUUID(),
      source: nodes[0].id,
      target: nodes[1].id,
      protocol: 'custom',
      isInfected: false,
      isBlocked: false,
    }]);
  };

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-cyan-300">Topology Editor</h3>
        <div className="flex gap-2">
          <button type="button" onClick={addNode} className="rounded border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800">Add Node</button>
          <button
            type="button"
            onClick={addEdge}
            disabled={!canAddEdge}
            className="rounded border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            title={canAddEdge ? 'Add an edge between the first two nodes.' : 'Add at least two nodes before creating an edge.'}
          >
            Add Edge
          </button>
        </div>
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <div className="space-y-2">
          <h4 className="text-xs uppercase tracking-wide text-slate-500">Nodes</h4>
          {nodes.map((node, index) => (
            <input
              key={node.id}
              className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-2 text-xs text-slate-200"
              value={node.name}
              onChange={(e) => setNodes(nodes.map((n, i) => i === index ? { ...n, name: e.target.value } : n))}
            />
          ))}
        </div>
        <div className="space-y-2">
          <h4 className="text-xs uppercase tracking-wide text-slate-500">Edges</h4>
          {edges.map((edge, index) => (
            <div key={edge.id} className="grid grid-cols-2 gap-2">
              <input
                className="rounded border border-slate-700 bg-slate-950 px-2 py-2 text-xs text-slate-200"
                placeholder="source"
                value={edge.source}
                onChange={(e) => setEdges(edges.map((item, i) => i === index ? { ...item, source: e.target.value } : item))}
              />
              <input
                className="rounded border border-slate-700 bg-slate-950 px-2 py-2 text-xs text-slate-200"
                placeholder="target"
                value={edge.target}
                onChange={(e) => setEdges(edges.map((item, i) => i === index ? { ...item, target: e.target.value } : item))}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
