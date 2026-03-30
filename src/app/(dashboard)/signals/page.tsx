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

const CLUSTER_COLORS: Record<string, string> = {
  AI: 'text-blue-400',
  Autonomy: 'text-purple-400',
  Quantum: 'text-cyan-400',
  Semiconductors: 'text-yellow-400',
  Communications: 'text-green-400',
  Hypersonics: 'text-red-400',
  Energy: 'text-orange-400',
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
    // Calling the correct endpoint, which is /api/intelligence in the codebase
    fetch('/api/intelligence')
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.signals ?? [];
        
        // Map backend properties to the frontend interface
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
          trendDirection: item.trendDirection
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
      <div className="w-16 bg-gray-700 rounded-full h-1.5" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
        <div
          className={`h-1.5 rounded-full ${color}`}
          style={{ width: `${Math.min(100, (value ?? 0) * 100)}%` }}
        />
      </div>
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>{((value ?? 0) * 100).toFixed(0)}%</span>
    </div>
  );

  if (loading) return (
    <div className="p-8 text-center" style={{ color: "var(--text-muted)" }}>Loading signals...</div>
  );

  return (
    <div className="p-6 space-y-4 max-w-[1200px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Signal Browser</h1>
        <p className="mt-1" style={{ color: "var(--text-muted)" }}>
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
          className="border rounded px-3 py-2 text-sm w-72 focus:outline-none focus:border-blue-500"
          style={{ backgroundColor: "rgba(254,249,237,0.02)", borderColor: "var(--border-strong)", color: "var(--text-primary)" }}
        />
        <div className="flex gap-2 flex-wrap">
          {clusters.map(c => (
            <button
              key={c}
              onClick={() => setClusterFilter(c)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                clusterFilter === c
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-700'
              }`}
              style={
                clusterFilter !== c ? { backgroundColor: "rgba(254,249,237,0.05)", color: "var(--text-muted)" } : {}
              }
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
          No signals found. Run an ingestion cycle via <code className="opacity-70">/api/ingest</code> to populate data.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--border-strong)" }}>
          <table className="w-full text-sm">
            <thead className="uppercase text-xs" style={{ backgroundColor: "rgba(254,249,237,0.05)", color: "var(--text-muted)" }}>
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
            <tbody className="divide-y border-[#c6aa76]/10">
              {filtered.map(s => (
                <tr key={s.id} className="bg-gray-900 hover:bg-gray-800 transition-colors">
                  <td className="px-4 py-3 text-white font-medium max-w-xs truncate">{s.signal}</td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${CLUSTER_COLORS[s.technologyCluster] ?? 'text-gray-400'}`}>
                      {s.technologyCluster}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {TRL_LABEL[s.trl] ?? `TRL ${s.trl}`}
                  </td>
                  <td className="px-4 py-3">{bar(s.confidence, 'bg-green-500')}</td>
                  <td className="px-4 py-3">{bar(s.volatility, 'bg-blue-500')}</td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${
                      s.priorityScore >= 80 ? 'text-red-400' :
                      s.priorityScore >= 60 ? 'text-yellow-400' : 'text-gray-400'
                    }`}>
                      {s.priorityScore}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{s.sourceType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
