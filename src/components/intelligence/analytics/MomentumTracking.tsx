"use client";

import { useMemo } from "react";

interface ScorePoint {
  year: string;
  score: number;
}

interface SignalData {
  id: string;
  signal: string;
  priority: string;
  priorityScore: number;
  scoreHistory: ScorePoint[];
  technologyCluster: string;
  trendDirection: string;
}

interface SignalMomentumProps {
  signals: SignalData[];
}

/* Compute velocity: average quarterly score change */
function computeVelocity(history: ScorePoint[]): number {
  if (history.length < 2) return 0;
  const deltas: number[] = [];
  for (let i = 1; i < history.length; i++) {
    deltas.push(history[i].score - history[i - 1].score);
  }
  return deltas.reduce((s, d) => s + d, 0) / deltas.length;
}

/* Compute acceleration: change in velocity (recent vs. early) */
function computeAcceleration(history: ScorePoint[]): number {
  if (history.length < 4) return 0;
  const mid = Math.floor(history.length / 2);
  const earlyDeltas: number[] = [];
  const lateDeltas: number[] = [];
  for (let i = 1; i < mid; i++) earlyDeltas.push(history[i].score - history[i - 1].score);
  for (let i = mid; i < history.length; i++) lateDeltas.push(history[i].score - history[i - 1].score);
  const earlyAvg = earlyDeltas.reduce((s, d) => s + d, 0) / earlyDeltas.length;
  const lateAvg = lateDeltas.reduce((s, d) => s + d, 0) / lateDeltas.length;
  return lateAvg - earlyAvg;
}

const PRIORITY_DOT: Record<string, string> = {
  CRITICAL: "bg-red-500",
  HIGH: "bg-amber-500",
  MEDIUM: "bg-sky-500",
  LOW: "bg-[var(--ink-muted)]",
};

/* ────────────────────────────────────────────────────────── */
/*  Individual Signal Momentum Timeline (SVG sparkline)       */
/* ────────────────────────────────────────────────────────── */
function MomentumSparkline({ history, color }: { history: ScorePoint[]; color: string }) {
  const width = 200;
  const height = 40;
  const padding = 4;

  if (history.length < 2) return null;

  const minScore = Math.min(...history.map((h) => h.score));
  const maxScore = Math.max(...history.map((h) => h.score));
  const scoreRange = maxScore - minScore || 0.1;

  const points = history.map((h, i) => {
    const x = padding + (i / (history.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((h.score - minScore) / scoreRange) * (height - 2 * padding);
    return `${x},${y}`;
  });

  const areaPoints = [
    `${padding},${height - padding}`,
    ...points,
    `${width - padding},${height - padding}`,
  ].join(" ");

  return (
    <svg width={width} height={height} className="shrink-0">
      {/* Area fill */}
      <polygon
        points={areaPoints}
        fill={color}
        opacity={0.08}
      />
      {/* Line */}
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Current dot */}
      <circle
        cx={parseFloat(points[points.length - 1].split(",")[0])}
        cy={parseFloat(points[points.length - 1].split(",")[1])}
        r={3}
        fill={color}
      />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  Signal Momentum: per-signal timeline table                 */
/* ────────────────────────────────────────────────────────── */
export function SignalMomentum({ signals }: SignalMomentumProps) {
  const signalsWithMetrics = useMemo(() => {
    return signals
      .filter((s) => s.scoreHistory && s.scoreHistory.length >= 2)
      .map((s) => ({
        ...s,
        velocity: computeVelocity(s.scoreHistory),
        acceleration: computeAcceleration(s.scoreHistory),
        totalGain: s.scoreHistory[s.scoreHistory.length - 1].score - s.scoreHistory[0].score,
      }))
      .sort((a, b) => b.velocity - a.velocity);
  }, [signals]);

  const sparklineColors: Record<string, string> = {
    CRITICAL: "#EF4444",
    HIGH: "#F59E0B",
    MEDIUM: "#0EA5E9",
    LOW: "#6B7280",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
            Signal Momentum
          </span>
          <h3 className="font-serif text-xl text-[var(--text-primary)] mt-1">Score Trajectory — 2023 to Present</h3>
        </div>
        <div className="flex items-center gap-4 text-[9px] font-mono uppercase tracking-widest text-[var(--ink-muted)]">
          <span>Velocity = avg Δ/quarter</span>
          <span>Accel = recent vs. early</span>
        </div>
      </div>

      <div className="space-y-1">
        {signalsWithMetrics.map((sig) => (
          <div
            key={sig.id}
            className="grid items-center gap-4 px-4 py-3 rounded-lg hover:bg-[rgba(255,255,255,0.03)] transition-colors"
            style={{ gridTemplateColumns: "24px 1fr 200px 80px 80px 80px" }}
          >
            {/* Priority dot */}
            <span className={`w-2.5 h-2.5 rounded-full ${PRIORITY_DOT[sig.priority] || PRIORITY_DOT.LOW}`} />

            {/* Name */}
            <div className="min-w-0">
              <span className="text-[12px] font-mono text-[var(--text-primary)] truncate block">
                {sig.signal}
              </span>
              <span className="text-[9px] font-mono text-[var(--ink-muted)] uppercase tracking-widest">
                {sig.technologyCluster}
              </span>
            </div>

            {/* Sparkline */}
            <MomentumSparkline
              history={sig.scoreHistory}
              color={sparklineColors[sig.priority] || "#6B7280"}
            />

            {/* Velocity */}
            <div className="text-right">
              <span className={`font-mono text-[12px] font-bold tabular-nums ${
                sig.velocity > 0.05 ? "text-red-500" :
                sig.velocity > 0.02 ? "text-amber-500" :
                sig.velocity > 0 ? "text-sky-500" :
                "text-[var(--ink-muted)]"
              }`}>
                {sig.velocity > 0 ? "+" : ""}{(sig.velocity * 100).toFixed(1)}
              </span>
              <span className="block text-[8px] font-mono uppercase tracking-widest text-[var(--ink-muted)]">vel/qtr</span>
            </div>

            {/* Acceleration */}
            <div className="text-right">
              <span className={`font-mono text-[12px] font-bold tabular-nums ${
                sig.acceleration > 0.01 ? "text-red-500" :
                sig.acceleration > 0 ? "text-amber-500" :
                sig.acceleration < -0.01 ? "text-emerald-500" :
                "text-[var(--ink-muted)]"
              }`}>
                {sig.acceleration > 0 ? "+" : ""}{(sig.acceleration * 100).toFixed(2)}
              </span>
              <span className="block text-[8px] font-mono uppercase tracking-widest text-[var(--ink-muted)]">accel</span>
            </div>

            {/* Total gain */}
            <div className="text-right">
              <span className="font-mono text-[12px] font-bold text-[var(--text-primary)] tabular-nums">
                +{(sig.totalGain * 100).toFixed(0)}
              </span>
              <span className="block text-[8px] font-mono uppercase tracking-widest text-[var(--ink-muted)]">total Δ</span>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline labels */}
      <div className="flex items-center justify-between px-4 pt-2 border-t border-[var(--border-soft)]">
        <span className="text-[9px] font-mono text-[var(--ink-muted)]">
          {signalsWithMetrics[0]?.scoreHistory[0]?.year || "2023-Q1"}
        </span>
        <span className="text-[9px] font-mono text-[var(--ink-muted)]">
          {signalsWithMetrics[0]?.scoreHistory[signalsWithMetrics[0]?.scoreHistory.length - 1]?.year || "2026-Q1"}
        </span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  Cluster Momentum: aggregated domain velocity               */
/* ────────────────────────────────────────────────────────── */
interface ClusterMomentumProps {
  signals: SignalData[];
}

const CLUSTER_COLORS: Record<string, string> = {
  AI: "#8B5CF6",
  Quantum: "#06B6D4",
  Hypersonics: "#EF4444",
  Autonomy: "#F59E0B",
  Communications: "#10B981",
  Semiconductors: "#EC4899",
  Energy: "#6366F1",
};

export function ClusterMomentum({ signals }: ClusterMomentumProps) {
  const clusters = useMemo(() => {
    const grouped: Record<string, SignalData[]> = {};
    for (const sig of signals) {
      if (!sig.scoreHistory || sig.scoreHistory.length < 2) continue;
      const c = sig.technologyCluster || "Other";
      if (!grouped[c]) grouped[c] = [];
      grouped[c].push(sig);
    }

    return Object.entries(grouped)
      .map(([name, sigs]) => {
        const velocities = sigs.map((s) => computeVelocity(s.scoreHistory));
        const avgVelocity = velocities.reduce((s, v) => s + v, 0) / velocities.length;
        const accelerations = sigs.map((s) => computeAcceleration(s.scoreHistory));
        const avgAcceleration = accelerations.reduce((s, a) => s + a, 0) / accelerations.length;
        const avgScore = sigs.reduce((s, sig) => s + sig.priorityScore, 0) / sigs.length;
        const maxScore = Math.max(...sigs.map((s) => s.priorityScore));

        // Build aggregate history
        const historyLength = Math.min(...sigs.map((s) => s.scoreHistory.length));
        const aggregateHistory: ScorePoint[] = [];
        for (let i = 0; i < historyLength; i++) {
          const avgPoint = sigs.reduce((s, sig) => s + sig.scoreHistory[i].score, 0) / sigs.length;
          aggregateHistory.push({ year: sigs[0].scoreHistory[i].year, score: avgPoint });
        }

        return {
          name,
          signals: sigs,
          avgVelocity,
          avgAcceleration,
          avgScore,
          maxScore,
          aggregateHistory,
          color: CLUSTER_COLORS[name] || "#6B7280",
        };
      })
      .sort((a, b) => b.avgVelocity - a.avgVelocity);
  }, [signals]);

  const maxVelocity = Math.max(...clusters.map((c) => Math.abs(c.avgVelocity)), 0.01);

  return (
    <div className="space-y-6">
      <div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
          Cluster Momentum
        </span>
        <h3 className="font-serif text-xl text-[var(--text-primary)] mt-1">
          Which Technology Sectors Are Accelerating Fastest?
        </h3>
      </div>

      <div className="space-y-3">
        {clusters.map((cluster) => {
          const barWidth = (Math.abs(cluster.avgVelocity) / maxVelocity) * 100;
          const isAccelerating = cluster.avgAcceleration > 0.005;
          const isDecelerating = cluster.avgAcceleration < -0.005;

          return (
            <div
              key={cluster.name}
              className="p-5 rounded-xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
            >
              <div className="flex items-start justify-between gap-6 flex-wrap">
                {/* Left: name + metrics */}
                <div className="space-y-3 flex-1 min-w-[200px]">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cluster.color }} />
                    <span className="font-mono text-[13px] font-bold uppercase tracking-widest text-[var(--text-primary)]">
                      {cluster.name}
                    </span>
                    {isAccelerating && (
                      <span className="text-[9px] font-mono font-bold text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded uppercase">
                        Accelerating
                      </span>
                    )}
                    {isDecelerating && (
                      <span className="text-[9px] font-mono font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase">
                        Decelerating
                      </span>
                    )}
                    {!isAccelerating && !isDecelerating && (
                      <span className="text-[9px] font-mono text-[var(--ink-muted)] bg-[rgba(0,0,0,0.03)] px-2 py-0.5 rounded uppercase">
                        Steady
                      </span>
                    )}
                  </div>

                  {/* Velocity bar */}
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink-muted)] w-16 shrink-0">
                      Velocity
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-[var(--border-soft)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: cluster.color,
                          opacity: 0.7,
                        }}
                      />
                    </div>
                    <span className={`font-mono text-[12px] font-bold tabular-nums w-14 text-right ${
                      cluster.avgVelocity > 0.05 ? "text-red-500" :
                      cluster.avgVelocity > 0.02 ? "text-amber-500" :
                      "text-[var(--ink-muted)]"
                    }`}>
                      +{(cluster.avgVelocity * 100).toFixed(1)}
                    </span>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-4 text-[9px] font-mono text-[var(--ink-muted)] uppercase tracking-widest">
                    <span>{cluster.signals.length} signal{cluster.signals.length > 1 ? "s" : ""}</span>
                    <span>Score: {(cluster.avgScore * 100).toFixed(0)}</span>
                    <span>Peak: {(cluster.maxScore * 100).toFixed(0)}</span>
                    <span>Accel: {cluster.avgAcceleration > 0 ? "+" : ""}{(cluster.avgAcceleration * 100).toFixed(2)}</span>
                  </div>
                </div>

                {/* Right: aggregate sparkline */}
                <div className="shrink-0 flex flex-col items-end">
                  <MomentumSparkline history={cluster.aggregateHistory} color={cluster.color} />
                  <div className="flex items-center justify-between w-[200px] mt-1">
                    <span className="text-[8px] font-mono text-[var(--ink-muted)]">
                      {cluster.aggregateHistory[0]?.year}
                    </span>
                    <span className="text-[8px] font-mono text-[var(--ink-muted)]">
                      {cluster.aggregateHistory[cluster.aggregateHistory.length - 1]?.year}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
