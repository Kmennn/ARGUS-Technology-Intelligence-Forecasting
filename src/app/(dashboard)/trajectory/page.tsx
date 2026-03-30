'use client';

import { useEffect, useState } from 'react';

interface TimelineEntry {
  id: number;
  technology: string;
  cluster: string;
  current_trl: number;
  projected_trl: number;
  horizon_months: number;
  confidence: number;
  trend: string;
}

const CLUSTER_COLORS: Record<string, string> = {
  AI: 'bg-blue-500',
  Autonomy: 'bg-purple-500',
  Quantum: 'bg-cyan-500',
  Semiconductors: 'bg-yellow-500',
  Communications: 'bg-green-500',
  Hypersonics: 'bg-red-500',
  Energy: 'bg-orange-500',
};

export default function TrajectoryPage() {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/timelines')
      .then(r => r.json())
      .then(data => {
        setEntries(Array.isArray(data) ? data : data.timelines ?? data.entries ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="p-8 text-center text-gray-400">Loading trajectories...</div>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Technology Trajectories</h1>
        <p className="text-gray-400 mt-1">
          Projected maturity progressions across active technology clusters
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="space-y-4">
          <p className="text-gray-500 text-sm">
            No live timeline data yet — showing seed projections.
          </p>
          {[
            { technology: 'Large Language Models', cluster: 'AI', current_trl: 7, projected_trl: 9, horizon_months: 18, confidence: 0.82 },
            { technology: 'Solid-State LiDAR', cluster: 'Autonomy', current_trl: 6, projected_trl: 8, horizon_months: 24, confidence: 0.74 },
            { technology: 'Photonic Quantum Chips', cluster: 'Quantum', current_trl: 4, projected_trl: 6, horizon_months: 36, confidence: 0.61 },
            { technology: 'GaN Power Semiconductors', cluster: 'Semiconductors', current_trl: 8, projected_trl: 9, horizon_months: 12, confidence: 0.91 },
            { technology: 'Ambient Backscatter Comm', cluster: 'Communications', current_trl: 5, projected_trl: 7, horizon_months: 30, confidence: 0.68 },
          ].map((item, i) => (
            <TrajCard key={i} item={item} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((item, i) => <TrajCard key={i} item={item} />)}
        </div>
      )}
    </div>
  );
}

function TrajCard({ item }: { item: Partial<TimelineEntry> & { technology: string; cluster: string; current_trl: number; projected_trl: number; horizon_months: number; confidence: number } }) {
  const progress = ((item.current_trl ?? 1) / 9) * 100;
  const projectedProgress = ((item.projected_trl ?? 1) / 9) * 100;
  const clusterColor = CLUSTER_COLORS[item.cluster] ?? 'bg-gray-500';

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold">{item.technology}</h3>
          <span className="text-xs text-gray-500 uppercase tracking-wider">{item.cluster}</span>
        </div>
        <div className="text-right">
          <span className="text-gray-400 text-sm">
            TRL {item.current_trl} → <span className="text-white font-bold">TRL {item.projected_trl}</span>
          </span>
          <div className="text-xs text-gray-500 mt-0.5">{item.horizon_months}mo horizon</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-16">Current</span>
          <div className="flex-1 bg-gray-700 rounded-full h-2">
            <div className={`h-2 rounded-full ${clusterColor} opacity-50`}
              style={{ width: `${progress}%` }} />
          </div>
          <span className="w-8 text-right">{item.current_trl}/9</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-16">Projected</span>
          <div className="flex-1 bg-gray-700 rounded-full h-2">
            <div className={`h-2 rounded-full ${clusterColor}`}
              style={{ width: `${projectedProgress}%` }} />
          </div>
          <span className="w-8 text-right">{item.projected_trl}/9</span>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-600">
        Confidence: <span className="text-gray-400">{((item.confidence ?? 0) * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
}
