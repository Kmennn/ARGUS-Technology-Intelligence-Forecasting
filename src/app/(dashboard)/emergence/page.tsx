'use client';

import { useEffect, useState } from 'react';

interface EmergingSignal {
  id?: number;
  technology: string;
  cluster?: string;
  early_signal_score: number;
  publication_growth: number;
  novelty_score: number;
  cross_domain_links: number;
  first_detected: string;
}

export default function EmergencePage() {
  const [signals, setSignals] = useState<EmergingSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/emergence')
      .then(r => r.json())
      .then(data => {
        setSignals(Array.isArray(data) ? data : data.signals ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load emergence data');
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="p-8 text-center" style={{ color: 'var(--ink-tertiary)' }}>
      Loading emergence signals...
    </div>
  );

  if (error) return (
    <div className="p-8 text-center" style={{ color: 'var(--accent)' }}>{error}</div>
  );

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <h1
          className="text-2xl font-bold"
          style={{ color: 'var(--ink-primary)', fontFamily: 'var(--font-serif, Georgia, serif)' }}
        >
          Early Emergence Detection
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--ink-secondary)' }}>
          Technologies detected 2–3 years before mainstream breakout
        </p>
      </div>

      {signals.length === 0 ? (
        <div className="text-center py-16 text-sm" style={{ color: 'var(--ink-tertiary)' }}>
          No emergence signals detected yet. Run an ingestion cycle to populate data.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {signals.map((s, idx) => (
            <div
              key={s.id || idx}
              className="rounded-lg p-5"
              style={{
                background: 'var(--background)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-base" style={{ color: 'var(--ink-primary)' }}>
                    {s.technology}
                  </h2>
                  <span
                    className="text-xs uppercase tracking-wider"
                    style={{ color: 'var(--ink-tertiary)', fontFamily: 'var(--font-mono, monospace)' }}
                  >
                    {s.cluster || 'Unknown Cluster'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold" style={{ color: 'var(--accent-deep)' }}>
                    {(s.early_signal_score * 100).toFixed(0)}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--ink-tertiary)' }}>
                    emergence score
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                {[
                  { label: 'pub. growth', value: `${(s.publication_growth * 100).toFixed(0)}%`, color: 'var(--accent-soft)' },
                  { label: 'vocab novelty', value: `${(s.novelty_score * 100).toFixed(0)}%`, color: '#6B8CAE' },
                  { label: 'cross-domain', value: s.cross_domain_links, color: '#C4A35A' },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="rounded p-2 text-center"
                    style={{ background: 'var(--background-muted)' }}
                  >
                    <div className="font-medium" style={{ color }}>{value}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--ink-tertiary)' }}>{label}</div>
                  </div>
                ))}
              </div>

              <div
                className="mt-3 pt-3 text-xs"
                style={{ color: 'var(--ink-muted)', borderTop: '1px solid var(--border-soft)' }}
              >
                Detected: {s.first_detected ? new Date(s.first_detected).toLocaleDateString() : 'Unknown'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
