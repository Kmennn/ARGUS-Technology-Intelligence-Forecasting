'use client';

import { useEffect, useState } from 'react';

interface Signal {
  id: number;
  signal: string;
  technologyCluster: string;
  trl: number;
  confidence: number;
  volatility: number;
  priority: number;
  priorityScore: number;
  sourceType: string;
  trendDirection?: string;
}

const CLUSTER_ACCENT: Record<string, string> = {
  AI: '#6B8CAE',
  Autonomy: '#8B6BAE',
  Quantum: '#5A9AAE',
  Semiconductors: '#C4A35A',
  Communications: '#5A8A6A',
  Hypersonics: '#C4684B',
  Energy: '#B87D3A',
};

const TRL_LABEL: Record<number, string> = {
  1: 'TRL 1', 2: 'TRL 2', 3: 'TRL 3',
  4: 'TRL 4', 5: 'TRL 5', 6: 'TRL 6',
  7: 'TRL 7', 8: 'TRL 8', 9: 'TRL 9',
};

export default function SignalsPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [filtered, setFiltered] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [clusterFilter, setClusterFilter] = useState('ALL');

  useEffect(() => {
    fetch('/api/intelligence')
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.signals ?? [];
        const mappedList = list.map((item: any) => ({
          id: item.id,
          signal: item.signal || item.technology,
          technologyCluster: item.technologyCluster || item.cluster || 'Unknown',
          trl: item.trl || 1,
          confidence: item.confidence || 0,
          volatility: typeof item.volatility === 'number' ? item.volatility :
                      item.volatility === 'accelerating' ? 0.85 :
                      item.volatility === 'destabilizing' ? 0.95 :
                      item.volatility === 'stable' ? 0.35 : 0.5,
          priority: item.priority || 0,
          priorityScore: item.priorityScore ? Math.round(item.priorityScore * 100) : item.priority || 0,
          sourceType: item.sourceType || item.source_type || 'Unknown',
          trendDirection: item.trendDirection,
        }));
        setSignals(mappedList);
        setFiltered(mappedList);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = signals;
    if (clusterFilter !== 'ALL') {
      result = result.filter(s => s.technologyCluster === clusterFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.signal?.toLowerCase().includes(q) ||
        s.technologyCluster?.toLowerCase().includes(q) ||
        s.sourceType?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, clusterFilter, signals]);

  const clusters = ['ALL', ...Array.from(new Set(signals.map(s => s.technologyCluster).filter(Boolean)))];

  const bar = (value: number, color: string) => (
    <div className="flex items-center gap-2">
      <div className="w-16 rounded-full h-1.5" style={{ background: 'var(--border)' }}>
        <div
          className="h-1.5 rounded-full"
          style={{ width: `${Math.min(100, (value ?? 0) * 100)}%`, background: color }}
        />
      </div>
      <span className="text-xs" style={{ color: 'var(--ink-tertiary)' }}>{((value ?? 0) * 100).toFixed(0)}%</span>
    </div>
  );

  if (loading) return (
    <div className="p-8 text-center" style={{ color: 'var(--ink-tertiary)' }}>Loading signals...</div>
  );

  return (
    <div className="p-6 space-y-4 max-w-[1200px] mx-auto">
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <h1
          className="text-2xl font-bold"
          style={{ color: 'var(--ink-primary)', fontFamily: 'var(--font-serif, Georgia, serif)' }}
        >
          Signal Browser
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--ink-secondary)' }}>
          {filtered.length} of {signals.length} signals
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search technology, cluster, source..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="rounded px-3 py-2 text-sm w-72 focus:outline-none"
          style={{
            background: 'var(--background-muted)',
            border: '1px solid var(--border)',
            color: 'var(--ink-primary)',
          }}
        />
        <div className="flex gap-2 flex-wrap">
          {clusters.map(c => (
            <button
              key={c}
              onClick={() => setClusterFilter(c)}
              className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
              style={
                clusterFilter === c
                  ? { background: 'var(--accent)', color: '#fff' }
                  : { background: 'var(--background-muted)', color: 'var(--ink-tertiary)', border: '1px solid var(--border)' }
              }
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-sm" style={{ color: 'var(--ink-tertiary)' }}>
          No signals found. Run an ingestion cycle via <code style={{ opacity: 0.7 }}>/api/ingest</code> to populate data.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid var(--border)' }}>
          <table className="w-full text-sm">
            <thead
              className="uppercase text-xs"
              style={{ background: 'var(--background-muted)', color: 'var(--ink-tertiary)' }}
            >
              <tr>
                <th className="px-4 py-3 text-left">Technology</th>
                <th className="px-4 py-3 text-left">Cluster</th>
                <th className="px-4 py-3 text-left">TRL</th>
                <th className="px-4 py-3 text-left">Confidence</th>
                <th className="px-4 py-3 text-left">Velocity</th>
                <th className="px-4 py-3 text-left">Priority</th>
                <th className="px-4 py-3 text-left">Source</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr
                  key={s.id}
                  className="transition-colors"
                  style={{ borderBottom: '1px solid var(--border-soft)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--background-muted)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="px-4 py-3 font-medium max-w-xs truncate" style={{ color: 'var(--ink-primary)' }}>
                    {s.signal}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="font-medium text-sm"
                      style={{ color: CLUSTER_ACCENT[s.technologyCluster] ?? 'var(--ink-secondary)' }}
                    >
                      {s.technologyCluster}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--ink-secondary)', fontFamily: 'var(--font-mono, monospace)', fontSize: '12px' }}>
                    {TRL_LABEL[s.trl] ?? `TRL ${s.trl}`}
                  </td>
                  <td className="px-4 py-3">{bar(s.confidence, '#5A8A6A')}</td>
                  <td className="px-4 py-3">{bar(s.volatility, '#6B8CAE')}</td>
                  <td className="px-4 py-3">
                    <span
                      className="font-bold"
                      style={{
                        color: s.priorityScore >= 80 ? 'var(--accent-deep)' :
                               s.priorityScore >= 60 ? '#C4A35A' : 'var(--ink-tertiary)',
                      }}
                    >
                      {s.priorityScore}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-mono, monospace)' }}>
                    {s.sourceType}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
