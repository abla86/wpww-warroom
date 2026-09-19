import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  BarChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Activity,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Clock,
  Zap,
  Lock,
  Layers,
  Sparkles,
  RefreshCw,
  Terminal,
  SlidersHorizontal,
} from 'lucide-react';
import { SystemStats, ForensicBlock } from '../types';

interface ThreatTimelineProps {
  stats: SystemStats;
  recentBlocks?: ForensicBlock[];
  onTriggerAttack?: (vectorId: number) => void;
  onSelectTab?: (tabId: string) => void;
  onOpenLayersModal?: () => void;
}

type TimelineViewMode = 'frequency_rate' | 'cumulative' | 'honeypot_ratio' | 'entropy_curve';
type TimeRange = '15' | '30' | '60';

export const ThreatTimeline: React.FC<ThreatTimelineProps> = ({
  stats,
  recentBlocks = [],
  onTriggerAttack,
  onSelectTab,
  onOpenLayersModal,
}) => {
  const [viewMode, setViewMode] = useState<TimelineViewMode>('frequency_rate');
  const [timeRange, setTimeRange] = useState<TimeRange>('60');

  const history = stats.threatHistory60Min || [];
  const rangeCount = parseInt(timeRange, 10);
  const data = history.slice(-rangeCount);

  // Computed summary metrics
  const latestPoint = data[data.length - 1] || {
    totalThreatsBlocked: stats.totalThreatsBlocked,
    threatsPerMinute: 0,
    honeypotTrapped: stats.honeypotTrappedCount,
    encryptedProgramDataKb: 28,
    encryptedOutdataPackets: 84,
    averageEntropy: 4.8,
  };

  const firstPoint = data[0] || latestPoint;
  const blockedInPeriod = Math.max(0, stats.totalThreatsBlocked - firstPoint.totalThreatsBlocked);
  const maxThreatRate = Math.max(...data.map((d) => d.threatsPerMinute || 0), 1);
  const totalTrappedInPeriod = Math.max(0, latestPoint.honeypotTrapped - (firstPoint.honeypotTrapped || 0));
  const avgEntropyInPeriod = (
    data.reduce((acc, d) => acc + (d.averageEntropy || 0), 0) / (data.length || 1)
  ).toFixed(2);

  return (
    <div id="threat-timeline-container" className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xl relative overflow-hidden backdrop-blur-md">
      {/* Ambient Cyber Light */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-700 text-cyan-400">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h2 className="font-mono font-bold text-slate-100 text-base sm:text-lg uppercase tracking-wider flex items-center gap-2">
              Threat Timeline // Sanntids Angrepsfrekvens
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/80 text-emerald-300 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Recharts Live
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Visualiserer angrepsfrekvens per minutt, honeypot-fangstrater og kryptografisk status over tid basert på{' '}
            <code className="text-cyan-300 font-semibold bg-slate-950 px-1 py-0.5 rounded border border-slate-800">
              threatHistory60Min
            </code>
            .
          </p>
        </div>

        {/* View Controls & Filters */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Time Window Buttons */}
          <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center gap-1 text-xs font-mono">
            <span className="text-[10px] text-slate-500 px-1.5 uppercase">Tidsvindu:</span>
            <button
              id="timeline-range-15m"
              onClick={() => setTimeRange('15')}
              className={`px-2 py-1 rounded transition-colors ${
                timeRange === '15' ? 'bg-cyan-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              15m
            </button>
            <button
              id="timeline-range-30m"
              onClick={() => setTimeRange('30')}
              className={`px-2 py-1 rounded transition-colors ${
                timeRange === '30' ? 'bg-cyan-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              30m
            </button>
            <button
              id="timeline-range-60m"
              onClick={() => setTimeRange('60')}
              className={`px-2 py-1 rounded transition-colors ${
                timeRange === '60' ? 'bg-cyan-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              60m
            </button>
          </div>

          {/* Metric View Selectors */}
          <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center flex-wrap gap-1 text-xs font-mono">
            <button
              id="timeline-view-frequency"
              onClick={() => setViewMode('frequency_rate')}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === 'frequency_rate'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Angrep per minutt i sanntid"
            >
              Frekvens / min
            </button>
            <button
              id="timeline-view-cumulative"
              onClick={() => setViewMode('cumulative')}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === 'cumulative'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Akkumulert totalThreatsBlocked"
            >
              Akkumulert
            </button>
            <button
              id="timeline-view-honeypot"
              onClick={() => setViewMode('honeypot_ratio')}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === 'honeypot_ratio'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Honeypot-feller vs nøytralisering"
            >
              Honeypot vs Blokk
            </button>
            <button
              id="timeline-view-entropy"
              onClick={() => setViewMode('entropy_curve')}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === 'entropy_curve'
                  ? 'bg-purple-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Shannon Entropi-utvikling"
            >
              Entropi-Kurve
            </button>
          </div>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg font-mono">
          <div className="text-[10px] text-slate-400 uppercase flex items-center justify-between">
            <span>Angrepsrate Nå</span>
            <Activity className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            {latestPoint.threatsPerMinute}{' '}
            <span className="text-xs font-normal text-slate-400">angrep/min</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Maks: <span className="text-amber-300 font-semibold">{maxThreatRate}/min</span> siste {timeRange}m
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg font-mono">
          <div className="text-[10px] text-slate-400 uppercase flex items-center justify-between">
            <span>Total Blokkert</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {stats.totalThreatsBlocked}
          </div>
          <div className="text-[11px] text-emerald-500/90 mt-0.5">
            +{blockedInPeriod} i dette vinduet
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg font-mono">
          <div className="text-[10px] text-slate-400 uppercase flex items-center justify-between">
            <span>Honeypot Trapped</span>
            <Flame className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-300 mt-1">
            {stats.honeypotTrappedCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            +{totalTrappedInPeriod} ledet i felle
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg font-mono">
          <div className="text-[10px] text-slate-400 uppercase flex items-center justify-between">
            <span>Snitt Entropi</span>
            <Zap className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-300 mt-1">
            {avgEntropyInPeriod}{' '}
            <span className="text-xs font-normal text-slate-400">bits</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Terskel: <span className="text-rose-400 font-semibold">{stats.securityDefinitions.entropyThreshold.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Main Recharts Graph */}
      <div className="w-full h-72 sm:h-80 bg-slate-950/95 border border-slate-800 rounded-lg p-2.5 pt-4 relative">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'frequency_rate' ? (
            <ComposedChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorFreq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis
                dataKey="timeLabel"
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                interval={timeRange === '60' ? 5 : timeRange === '30' ? 2 : 1}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                domain={[0, 'auto']}
              />
              <Tooltip content={<TimelineTooltip />} />
              <Legend
                wrapperStyle={{ fontFamily: 'monospace', fontSize: 11, paddingTop: 6 }}
                formatter={(val) => <span className="text-slate-300">{val}</span>}
              />
              <Bar
                dataKey="threatsPerMinute"
                name="Angrepsfrekvens (per minutt)"
                fill="url(#colorFreq)"
                stroke="#f59e0b"
                radius={[4, 4, 0, 0]}
              />
              <Line
                type="monotone"
                dataKey="averageEntropy"
                name="Shannon Entropi"
                stroke="#a855f7"
                strokeWidth={2}
                dot={false}
              />
              <ReferenceLine
                y={2}
                label={{
                  value: 'Varslingsterskel: 2/min',
                  fill: '#f43f5e',
                  fontSize: 9,
                  fontFamily: 'monospace',
                }}
                stroke="#f43f5e"
                strokeDasharray="4 4"
              />
            </ComposedChart>
          ) : viewMode === 'cumulative' ? (
            <ComposedChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis
                dataKey="timeLabel"
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                interval={timeRange === '60' ? 5 : timeRange === '30' ? 2 : 1}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<TimelineTooltip />} />
              <Legend
                wrapperStyle={{ fontFamily: 'monospace', fontSize: 11, paddingTop: 6 }}
                formatter={(val) => <span className="text-slate-300">{val}</span>}
              />
              <Area
                type="monotone"
                dataKey="totalThreatsBlocked"
                name="Akkumulerte Trusler Blokkert"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorCumulative)"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="honeypotTrapped"
                name="Fanget i Honeypot"
                stroke="#06b6d4"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            </ComposedChart>
          ) : viewMode === 'honeypot_ratio' ? (
            <BarChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis
                dataKey="timeLabel"
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                interval={timeRange === '60' ? 5 : timeRange === '30' ? 2 : 1}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
              />
              <Tooltip content={<TimelineTooltip />} />
              <Legend
                wrapperStyle={{ fontFamily: 'monospace', fontSize: 11, paddingTop: 6 }}
                formatter={(val) => <span className="text-slate-300">{val}</span>}
              />
              <Bar dataKey="threatsPerMinute" name="Trusler per minutt" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              <Bar dataKey="honeypotTrapped" name="Honeypot Feller (Kumulativ)" fill="#06b6d4" radius={[3, 3, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis
                dataKey="timeLabel"
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                interval={timeRange === '60' ? 5 : timeRange === '30' ? 2 : 1}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                domain={[0, 8]}
              />
              <Tooltip content={<TimelineTooltip />} />
              <Legend
                wrapperStyle={{ fontFamily: 'monospace', fontSize: 11, paddingTop: 6 }}
                formatter={(val) => <span className="text-slate-300">{val}</span>}
              />
              <Line
                type="monotone"
                dataKey="averageEntropy"
                name="Shannon Entropi (Bits per byte)"
                stroke="#ec4899"
                strokeWidth={2.5}
                dot={{ r: 2, fill: '#ec4899' }}
                activeDot={{ r: 6, fill: '#ec4899', stroke: '#831843' }}
              />
              <ReferenceLine
                y={stats.securityDefinitions.entropyThreshold}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{
                  value: `Entropi-grense (${stats.securityDefinitions.entropyThreshold})`,
                  fill: '#ef4444',
                  fontSize: 10,
                  fontFamily: 'monospace',
                }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Sub-bar: Quick Probe Trigger Buttons directly updating the timeline */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Sanntids-test:
          </span>
          {onTriggerAttack && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                id="btn-timeline-test-oat"
                onClick={() => onTriggerAttack(1007)}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-500/50 transition-colors"
                title="Fyr av OAT-007 Credential Stuffing og se frekvensgrafen reagere"
              >
                OAT-007 Stuffing
              </button>
              <button
                id="btn-timeline-test-ai"
                onClick={() => onTriggerAttack(2001)}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500/50 transition-colors"
                title="Fyr av TIP: Task-in-Prompt og se frekvensgrafen reagere"
              >
                TIP AI-Injisering
              </button>
              <button
                id="btn-timeline-test-ddos"
                onClick={() => onTriggerAttack(21)}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 hover:border-rose-500/50 transition-colors"
                title="Fyr av DDoS Volumetrisk Flom og se frekvensgrafen reagere"
              >
                DDoS SYN-Flom
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {onSelectTab && (
            <button
              onClick={() => onSelectTab('simulator')}
              className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1"
            >
              Åpne Angrepssimulator →
            </button>
          )}
          {onOpenLayersModal && (
            <button
              onClick={onOpenLayersModal}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sikkerhetslag</span>
            </button>
          )}
        </div>
      </div>

      {/* Correlated Recent Threat Log Ticker */}
      {recentBlocks.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-900 bg-slate-950/60 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span className="flex items-center gap-1 text-slate-300 font-semibold">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              Siste hendelser plottet i tidslinjen:
            </span>
            <span className="text-[10px] text-slate-500">Live WORM Ledger</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {recentBlocks.slice(0, 3).map((block) => (
              <div
                key={`timeline-block-${block.id}`}
                className="p-2 rounded bg-slate-900/90 border border-slate-800 font-mono text-[11px] flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400 font-bold">#{block.id}</span>
                  <span className="text-slate-500 text-[10px]">{block.timestamp}</span>
                </div>
                <div className="text-slate-300 font-semibold truncate my-1">{block.threatType}</div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="text-rose-400">{block.attackerIp}</span>
                  <span className="text-emerald-400">{block.counterMeasureCode || 'NØYTRALISERT'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Custom High-Contrast Tooltip
const TimelineTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-slate-950 border border-cyan-700/80 rounded-lg p-3 shadow-2xl font-mono text-xs text-slate-200 min-w-[220px]">
      <div className="font-bold text-cyan-300 border-b border-slate-800 pb-1 mb-2 flex items-center justify-between">
        <span>Tidspunkt: {label}</span>
        <Clock className="w-3.5 h-3.5 text-slate-400" />
      </div>
      <div className="space-y-1.5">
        {payload.map((entry: any, idx: number) => (
          <div key={`tip-${idx}`} className="flex items-center justify-between gap-3">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-bold" style={{ color: entry.color }}>
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ThreatTimeline;
