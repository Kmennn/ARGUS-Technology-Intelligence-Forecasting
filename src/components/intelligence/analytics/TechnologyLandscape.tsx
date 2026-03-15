"use client";

import { useMemo } from "react";

interface SignalData {
  id: string;
  signal: string;
  trl: number;
  priority: string;
  priorityScore: number;
  technologyCluster: string;
  trendDirection: string;
  sourceCount: number;
}

interface TechnologyLandscapeProps {
  signals: SignalData[];
}

const CLUSTER_CONFIG: Record<string, { color: string; description: string }> = {
  AI: { color: "#8B5CF6", description: "Machine learning, neural architectures, edge inference" },
  Quantum: { color: "#06B6D4", description: "Quantum computing, QKD, quantum sensing" },
  Hypersonics: { color: "#EF4444", description: "Hypersonic vehicles, materials, propulsion" },
  Autonomy: { color: "#F59E0B", description: "Autonomous systems, swarm robotics, UAS" },
  Communications: { color: "#10B981", description: "RF systems, stealth comms, spectrum" },
  Semiconductors: { color: "#EC4899", description: "Advanced materials, GaN, photonics" },
  Energy: { color: "#6366F1", description: "Fusion, batteries, power systems" },
};

const PRIORITY_URGENCY: Record<string, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

export function TechnologyLandscape({ signals }: TechnologyLandscapeProps) {
  const clusters = useMemo(() => {
    const grouped: Record<string, SignalData[]> = {};
    for (const sig of signals) {
      const cluster = sig.technologyCluster || "Other";
      if (!grouped[cluster]) grouped[cluster] = [];
      grouped[cluster].push(sig);
    }

    // Sort clusters by max priority score (hottest first)
    return Object.entries(grouped).sort((a, b) => {
      const maxA = Math.max(...a[1].map((s) => s.priorityScore));
      const maxB = Math.max(...b[1].map((s) => s.priorityScore));
      return maxB - maxA;
    });
  }, [signals]);

  const totalSignals = signals.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
          Strategic Technology Landscape
        </span>
        <h3 className="font-serif text-2xl text-[var(--text-primary)]">Signal Distribution Map</h3>
        <p className="font-mono text-[11px] text-[var(--ink-tertiary)] max-w-[50ch] mx-auto">
          {totalSignals} active signals across {clusters.length} technology domains
        </p>
      </div>

      {/* Cluster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clusters.map(([clusterName, clusterSignals]) => {
          const config = CLUSTER_CONFIG[clusterName] || { color: "#9CA3AF", description: "Unclassified" };
          const maxPriority = Math.max(...clusterSignals.map((s) => PRIORITY_URGENCY[s.priority] || 1));
          const avgScore = clusterSignals.reduce((s, sig) => s + sig.priorityScore, 0) / clusterSignals.length;
          const risingCount = clusterSignals.filter((s) => s.trendDirection === "rising").length;

          return (
            <div
              key={clusterName}
              className={`
                relative p-5 rounded-xl border transition-all duration-300
                hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:translate-y-[-1px]
                ${maxPriority >= 4
                  ? "border-red-500/30 bg-red-500/[0.03]"
                  : maxPriority >= 3
                    ? "border-amber-500/20 bg-amber-500/[0.02]"
                    : "border-[var(--border-soft)] bg-[rgba(255,255,255,0.02)]"
                }
              `}
            >
              {/* Cluster header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: config.color }}
                  />
                  <span className="font-mono text-[12px] font-bold uppercase tracking-widest text-[var(--text-primary)]">
                    {clusterName}
                  </span>
                </div>
                {risingCount > 0 && (
                  <span className="font-mono text-[9px] text-red-500 font-bold flex items-center gap-1">
                    ↑ {risingCount} rising
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-[10px] font-mono text-[var(--ink-tertiary)] mb-4 leading-relaxed">
                {config.description}
              </p>

              {/* Heat bar */}
              <div className="flex items-center gap-2 mb-4">
                <span className="font-mono text-[8px] uppercase tracking-widest text-[var(--ink-muted)] shrink-0">Heat</span>
                <div className="flex-1 h-1.5 rounded-full bg-[var(--border-soft)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${avgScore * 100}%`,
                      backgroundColor: config.color,
                      opacity: 0.8,
                    }}
                  />
                </div>
                <span className="font-mono text-[9px] font-bold text-[var(--ink-secondary)] tabular-nums">
                  {(avgScore * 100).toFixed(0)}
                </span>
              </div>

              {/* Signals list */}
              <div className="space-y-2">
                {clusterSignals
                  .sort((a, b) => b.priorityScore - a.priorityScore)
                  .map((sig) => (
                    <div key={sig.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`
                          w-1.5 h-1.5 rounded-full shrink-0
                          ${sig.priority === "CRITICAL" ? "bg-red-500" :
                          sig.priority === "HIGH" ? "bg-amber-500" :
                          sig.priority === "MEDIUM" ? "bg-sky-500" :
                          "bg-[var(--ink-muted)]"}
                        `} />
                        <span className="text-[10px] font-mono text-[var(--ink-secondary)] truncate">
                          {sig.signal}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-[var(--ink-muted)] tabular-nums shrink-0 ml-2">
                        TRL {sig.trl}
                      </span>
                    </div>
                  ))}
              </div>

              {/* Source summary */}
              <div className="mt-4 pt-3 border-t border-[rgba(0,0,0,0.05)] flex items-center justify-between">
                <span className="text-[9px] font-mono text-[var(--ink-muted)]">
                  {clusterSignals.length} signal{clusterSignals.length > 1 ? "s" : ""}
                </span>
                <span className="text-[9px] font-mono text-[var(--ink-muted)]">
                  {clusterSignals.reduce((s, sig) => s + sig.sourceCount, 0)} sources
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
