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
    <div className="p-8 text-center" style={{ color: "var(--text-muted)" }}>Loading emergence signals...</div>
  );

  if (error) return (
    <div className="p-8 text-center text-red-500">{error}</div>
  );

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Early Emergence Detection</h1>
        <p className="mt-1" style={{ color: "var(--text-muted)" }}>
          Technologies detected 2–3 years before mainstream breakout
        </p>
      </div>

      {signals.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
          No emergence signals detected yet. Run an ingestion cycle to populate data.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {signals.map((s, idx) => (
            <div
              key={s.id || idx}
              className="border rounded-lg p-5"
              style={{ 
                backgroundColor: "rgba(254,249,237,0.02)", 
                borderColor: "var(--border-strong)"
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>{s.technology}</h2>
                  <span className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    {s.cluster || 'Unknown Cluster'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold" style={{ color: "var(--signal-high)" }}>
                    {(s.early_signal_score * 100).toFixed(0)}
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>emergence score</div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
                <div className="rounded p-2 text-center" style={{ backgroundColor: "rgba(0,0,0,0.2)" }}>
                  <div className="font-medium" style={{ color: "var(--signal-medium)" }}>
                    {(s.publication_growth * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>pub. growth</div>
                </div>
                <div className="rounded p-2 text-center" style={{ backgroundColor: "rgba(0,0,0,0.2)" }}>
                  <div className="font-medium text-purple-400">
                    {(s.novelty_score * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>vocab novelty</div>
                </div>
                <div className="rounded p-2 text-center" style={{ backgroundColor: "rgba(0,0,0,0.2)" }}>
                  <div className="font-medium text-yellow-400">
                    {s.cross_domain_links}
                  </div>
                  <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>cross-domain links</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--border)] text-xs" style={{ color: "var(--text-muted)" }}>
                Detected: {s.first_detected ? new Date(s.first_detected).toLocaleDateString() : 'Unknown'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
