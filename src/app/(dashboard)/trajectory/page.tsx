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

const CLUSTER_ACCENT: Record<string, string> = {
  AI: '#6B8CAE',
  Autonomy: '#8B6BAE',
  Quantum: '#5A9AAE',
  Semiconductors: '#C4A35A',
  Communications: '#5A8A6A',
  Hypersonics: '#C4684B',
  Energy: '#B87D3A',
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
    <div className="p-8 text-center" style={{ color: 'var(--ink-tertiary)' }}>Loading trajectories...</div>
  );

  const SEED_DATA = [
    { technology: 'Large Language Models', cluster: 'AI', current_trl: 7, projected_trl: 9, horizon_months: 18, confidence: 0.82 },
    { technology: 'Solid-State LiDAR', cluster: 'Autonomy', current_trl: 6, projected_trl: 8, horizon_months: 24, confidence: 0.74 },
    { technology: 'Photonic Quantum Chips', cluster: 'Quantum', current_trl: 4, projected_trl: 6, horizon_months: 36, confidence: 0.61 },
    { technology: 'GaN Power Semiconductors', cluster: 'Semiconductors', current_trl: 8, projected_trl: 9, horizon_months: 12, confidence: 0.91 },
    { technology: 'Ambient Backscatter Comm', cluster: 'Communications', current_trl: 5, projected_trl: 7, horizon_months: 30, confidence: 0.68 },
  ];

  const displayData = entries.length > 0 ? entries : SEED_DATA;

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <h1
          className="text-2xl font-bold"
          style={{ color: 'var(--ink-primary)', fontFamily: 'var(--font-serif, Georgia, serif)' }}
        >
          Technology Trajectories
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--ink-secondary)' }}>
          Projected maturity progressions across active technology clusters
        </p>
      </div>

      {entries.length === 0 && (
        <p className="text-sm" style={{ color: 'var(--ink-tertiary)', fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Seed projections — live data will replace after next ingestion cycle
        </p>
      )}

      <div className="space-y-3">
        {displayData.map((item, i) => (
          <TrajCard key={i} item={item} />
        ))}
      </div>
    </div>
  );
}

function TrajCard({ item }: { item: Partial<TimelineEntry> & { technology: string; cluster: string; current_trl: number; projected_trl: number; horizon_months: number; confidence: number } }) {
  const progress = ((item.current_trl ?? 1) / 9) * 100;
  const projectedProgress = ((item.projected_trl ?? 1) / 9) * 100;
  const accent = CLUSTER_ACCENT[item.cluster] ?? 'var(--ink-tertiary)';

  return (
    <div
      className="rounded-lg p-5"
      style={{
        background: 'var(--background)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold" style={{ color: 'var(--ink-primary)' }}>{item.technology}</h3>
          <span
            className="text-xs uppercase tracking-wider"
            style={{ color: accent, fontFamily: 'var(--font-mono, monospace)' }}
          >
            {item.cluster}
          </span>
        </div>
        <div className="text-right">
          <span className="text-sm" style={{ color: 'var(--ink-secondary)' }}>
            TRL {item.current_trl} →{' '}
            <span className="font-bold" style={{ color: 'var(--ink-primary)' }}>TRL {item.projected_trl}</span>
          </span>
          <div className="text-xs mt-0.5" style={{ color: 'var(--ink-tertiary)' }}>
            {item.horizon_months}mo horizon
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--ink-tertiary)' }}>
          <span className="w-16">Current</span>
          <div className="flex-1 rounded-full h-2" style={{ background: 'var(--border)' }}>
            <div
              className="h-2 rounded-full"
              style={{ width: `${progress}%`, background: accent, opacity: 0.5 }}
            />
          </div>
          <span className="w-8 text-right">{item.current_trl}/9</span>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--ink-tertiary)' }}>
          <span className="w-16">Projected</span>
          <div className="flex-1 rounded-full h-2" style={{ background: 'var(--border)' }}>
            <div
              className="h-2 rounded-full"
              style={{ width: `${projectedProgress}%`, background: accent }}
            />
          </div>
          <span className="w-8 text-right">{item.projected_trl}/9</span>
        </div>
      </div>

      <div className="mt-3 text-xs" style={{ color: 'var(--ink-muted)' }}>
        Confidence: <span style={{ color: 'var(--ink-secondary)' }}>{((item.confidence ?? 0) * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
}
