"use client";

import { useState, useEffect, useMemo } from "react";

/* ─────── Types ─────── */
interface ScorePoint {
  year: string;
  score: number;
}

interface SignalData {
  id: string;
  signal: string;
  trl: number;
  priorityScore: number;
  priority: string;
  technologyCluster: string;
  trendDirection: string;
  volatility: string;
  scoreHistory: ScorePoint[];
  sourceCount: number;
}

/* ─────── Alert Types ─────── */
type AlertSeverity = "CRITICAL" | "WARNING" | "WATCH";
type AlertType = "velocity_spike" | "momentum_acceleration" | "cluster_surge" | "breakout_candidate";

interface BreakoutAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  signalId: string;
  signalName: string;
  cluster: string;
  title: string;
  description: string;
  metric: string;
  metricValue: string;
  confidence: number; /* 0-1 */
  timestamp: string;
}

/* ─────── Detection Engine ─────── */
function computeVelocity(history: ScorePoint[]): number {
  if (history.length < 2) return 0;
  const deltas: number[] = [];
  for (let i = 1; i < history.length; i++) {
    deltas.push(history[i].score - history[i - 1].score);
  }
  return deltas.reduce((s, d) => s + d, 0) / deltas.length;
}

function computeRecentVelocity(history: ScorePoint[], periods: number = 2): number {
  if (history.length < periods + 1) return computeVelocity(history);
  const recent = history.slice(-periods - 1);
  const deltas: number[] = [];
  for (let i = 1; i < recent.length; i++) {
    deltas.push(recent[i].score - recent[i - 1].score);
  }
  return deltas.reduce((s, d) => s + d, 0) / deltas.length;
}

function computeAcceleration(history: ScorePoint[]): number {
  if (history.length < 4) return 0;
  const mid = Math.floor(history.length / 2);
  const earlyDeltas: number[] = [];
  for (let i = 1; i <= mid; i++) {
    earlyDeltas.push(history[i].score - history[i - 1].score);
  }
  const lateDeltas: number[] = [];
  for (let i = mid + 1; i < history.length; i++) {
    lateDeltas.push(history[i].score - history[i - 1].score);
  }
  const earlyAvg = earlyDeltas.reduce((s, d) => s + d, 0) / earlyDeltas.length;
  const lateAvg = lateDeltas.reduce((s, d) => s + d, 0) / lateDeltas.length;
  return lateAvg - earlyAvg;
}

function detectBreakouts(signals: SignalData[]): BreakoutAlert[] {
  const alerts: BreakoutAlert[] = [];
  const now = "2026-Q1";

  for (const signal of signals) {
    const velocity = computeVelocity(signal.scoreHistory);
    const recentVelocity = computeRecentVelocity(signal.scoreHistory, 2);
    const acceleration = computeAcceleration(signal.scoreHistory);
    const totalGain = signal.scoreHistory.length >= 2
      ? signal.scoreHistory[signal.scoreHistory.length - 1].score - signal.scoreHistory[0].score
      : 0;

    /* ── Detection 1: Velocity Spike ── */
    /* Recent velocity is significantly higher than average velocity */
    const velocityRatio = velocity > 0 ? recentVelocity / velocity : 0;
    if (velocityRatio > 1.3 && recentVelocity > 0.06) {
      const severity: AlertSeverity = velocityRatio > 1.8 ? "CRITICAL" : velocityRatio > 1.5 ? "WARNING" : "WATCH";
      alerts.push({
        id: `alert-vel-${signal.id}`,
        type: "velocity_spike",
        severity,
        signalId: signal.id,
        signalName: signal.signal,
        cluster: signal.technologyCluster,
        title: "Velocity Spike Detected",
        description: `Recent velocity is ${(velocityRatio * 100 - 100).toFixed(0)}% above historical average. Signal is accelerating faster than its established trajectory.`,
        metric: "Velocity Ratio",
        metricValue: `${velocityRatio.toFixed(2)}x`,
        confidence: Math.min(velocityRatio / 2.5, 0.98),
        timestamp: now,
      });
    }

    /* ── Detection 2: Momentum Acceleration ── */
    /* Positive acceleration = late-stage growth exceeds early-stage */
    if (acceleration > 0.02 && totalGain > 0.3) {
      const severity: AlertSeverity = acceleration > 0.05 ? "CRITICAL" : acceleration > 0.03 ? "WARNING" : "WATCH";
      alerts.push({
        id: `alert-accel-${signal.id}`,
        type: "momentum_acceleration",
        severity,
        signalId: signal.id,
        signalName: signal.signal,
        cluster: signal.technologyCluster,
        title: "Momentum Accelerating",
        description: `Growth rate is increasing — late-stage velocity exceeds early-stage by +${(acceleration * 100).toFixed(1)} points/quarter. Technology adoption curve may be entering exponential phase.`,
        metric: "Acceleration",
        metricValue: `+${(acceleration * 100).toFixed(1)}/qtr`,
        confidence: Math.min(acceleration / 0.08 + 0.3, 0.95),
        timestamp: now,
      });
    }

    /* ── Detection 3: Breakout Candidate ── */
    /* High velocity + high TRL + high priority = imminent capability */
    if (velocity > 0.07 && signal.trl >= 5 && signal.priorityScore >= 0.85) {
      alerts.push({
        id: `alert-break-${signal.id}`,
        type: "breakout_candidate",
        severity: "CRITICAL",
        signalId: signal.id,
        signalName: signal.signal,
        cluster: signal.technologyCluster,
        title: "Breakout Candidate",
        description: `Converging indicators: TRL ${signal.trl}, velocity +${(velocity * 100).toFixed(1)}/qtr, priority ${Math.round(signal.priorityScore * 100)}. Technology may reach deployment threshold within 12–18 months.`,
        metric: "Breakout Score",
        metricValue: `${Math.round((velocity * 100 + signal.trl * 5 + signal.priorityScore * 50) / 2)}`,
        confidence: 0.88,
        timestamp: now,
      });
    }
  }

  /* ── Detection 4: Cluster Surge ── */
  /* Aggregate cluster velocity above threshold */
  const clusterVelocities: Record<string, { totalVel: number; count: number; signals: string[] }> = {};
  for (const signal of signals) {
    const vel = computeVelocity(signal.scoreHistory);
    if (!clusterVelocities[signal.technologyCluster]) {
      clusterVelocities[signal.technologyCluster] = { totalVel: 0, count: 0, signals: [] };
    }
    clusterVelocities[signal.technologyCluster].totalVel += vel;
    clusterVelocities[signal.technologyCluster].count += 1;
    clusterVelocities[signal.technologyCluster].signals.push(signal.signal);
  }

  for (const [cluster, data] of Object.entries(clusterVelocities)) {
    const avgVel = data.totalVel / data.count;
    if (avgVel > 0.075 && data.count >= 1) {
      alerts.push({
        id: `alert-cluster-${cluster}`,
        type: "cluster_surge",
        severity: avgVel > 0.09 ? "CRITICAL" : "WARNING",
        signalId: "",
        signalName: data.signals.join(", "),
        cluster,
        title: `Cluster Surge — ${cluster}`,
        description: `${data.count} signal(s) in ${cluster} show collective average velocity of +${(avgVel * 100).toFixed(1)}/quarter. Domain-wide acceleration indicates systemic technology shift.`,
        metric: "Cluster Velocity",
        metricValue: `+${(avgVel * 100).toFixed(1)}/qtr`,
        confidence: Math.min(avgVel / 0.12 + 0.2, 0.95),
        timestamp: now,
      });
    }
  }

  /* Sort: CRITICAL first, then WARNING, then WATCH */
  const severityOrder: Record<AlertSeverity, number> = { CRITICAL: 0, WARNING: 1, WATCH: 2 };
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return alerts;
}

/* ─────── Colors ─────── */
const CLUSTER_COLORS: Record<string, string> = {
  Semiconductors: "#EC4899",
  AI: "#8B5CF6",
  Autonomy: "#F59E0B",
  Communications: "#10B981",
  Quantum: "#06B6D4",
  Hypersonics: "#EF4444",
  Energy: "#6366F1",
};

const SEVERITY_STYLES: Record<AlertSeverity, { border: string; bg: string; text: string; dot: string; pulse: string }> = {
  CRITICAL: {
    border: "border-red-500/40",
    bg: "bg-red-500/5",
    text: "text-red-500",
    dot: "bg-red-500",
    pulse: "animate-pulse",
  },
  WARNING: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
    text: "text-amber-500",
    dot: "bg-amber-500",
    pulse: "",
  },
  WATCH: {
    border: "border-sky-500/20",
    bg: "bg-sky-500/5",
    text: "text-sky-500",
    dot: "bg-sky-500",
    pulse: "",
  },
};

const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  velocity_spike: "VELOCITY SPIKE",
  momentum_acceleration: "MOMENTUM ACCEL",
  cluster_surge: "CLUSTER SURGE",
  breakout_candidate: "BREAKOUT",
};

/* ─────── Alert Card ─────── */
function AlertCard({ alert }: { alert: BreakoutAlert }) {
  const style = SEVERITY_STYLES[alert.severity];
  const clusterColor = CLUSTER_COLORS[alert.cluster] || "#6B7280";

  return (
    <div className={`p-5 rounded-xl border ${style.border} ${style.bg} space-y-3 transition-all hover:shadow-lg`}>
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${style.dot} ${style.pulse}`} />
          <span className={`font-mono text-[9px] font-bold uppercase tracking-widest ${style.text}`}>
            {alert.severity}
          </span>
          <span className="font-mono text-[8px] uppercase tracking-widest text-[var(--ink-muted)] ml-1">
            {ALERT_TYPE_LABELS[alert.type]}
          </span>
        </div>
        <span className="font-mono text-[8px] text-[var(--ink-muted)]">{alert.timestamp}</span>
      </div>

      {/* Title */}
      <h4 className="font-serif text-sm text-[var(--text-primary)]">{alert.title}</h4>

      {/* Signal info */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: clusterColor }} />
        <span className="font-mono text-[10px] font-bold text-[var(--text-primary)] truncate">
          {alert.signalName}
        </span>
        <span className="font-mono text-[8px] text-[var(--ink-muted)] uppercase tracking-widest shrink-0">
          {alert.cluster}
        </span>
      </div>

      {/* Description */}
      <p className="text-[11px] leading-relaxed text-[var(--ink-secondary)]">
        {alert.description}
      </p>

      {/* Metrics row */}
      <div className="flex items-center gap-4 pt-2 border-t border-[var(--border-soft)]">
        <div>
          <span className="block font-mono text-[8px] text-[var(--ink-muted)] uppercase tracking-widest">
            {alert.metric}
          </span>
          <span className={`block font-mono text-sm font-bold tabular-nums ${style.text}`}>
            {alert.metricValue}
          </span>
        </div>
        <div>
          <span className="block font-mono text-[8px] text-[var(--ink-muted)] uppercase tracking-widest">
            Confidence
          </span>
          <span className="block font-mono text-sm font-bold tabular-nums text-[var(--text-primary)]">
            {Math.round(alert.confidence * 100)}%
          </span>
        </div>
        {/* Confidence bar */}
        <div className="flex-1 h-1.5 rounded-full bg-[var(--border-soft)] overflow-hidden">
          <div
            className={`h-full rounded-full ${
              alert.confidence > 0.8 ? "bg-red-500" :
              alert.confidence > 0.5 ? "bg-amber-500" : "bg-sky-500"
            }`}
            style={{ width: `${alert.confidence * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─────── Summary Strip ─────── */
function AlertSummary({ alerts }: { alerts: BreakoutAlert[] }) {
  const stats = useMemo(() => {
    const critical = alerts.filter((a) => a.severity === "CRITICAL").length;
    const warning = alerts.filter((a) => a.severity === "WARNING").length;
    const watch = alerts.filter((a) => a.severity === "WATCH").length;
    const clusters = new Set(alerts.map((a) => a.cluster)).size;
    const types = new Set(alerts.map((a) => a.type)).size;
    return { critical, warning, watch, total: alerts.length, clusters, types };
  }, [alerts]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {[
        { label: "Total Alerts", value: stats.total.toString(), color: "text-[var(--text-primary)]" },
        { label: "Critical", value: stats.critical.toString(), color: stats.critical > 0 ? "text-red-500" : "text-[var(--ink-muted)]" },
        { label: "Warning", value: stats.warning.toString(), color: stats.warning > 0 ? "text-amber-500" : "text-[var(--ink-muted)]" },
        { label: "Watch", value: stats.watch.toString(), color: stats.watch > 0 ? "text-sky-500" : "text-[var(--ink-muted)]" },
        { label: "Clusters", value: stats.clusters.toString(), color: "text-[var(--text-primary)]" },
      ].map((stat) => (
        <div key={stat.label} className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[var(--border-soft)] text-center">
          <span className={`block font-mono text-lg font-bold tabular-nums ${stat.color}`}>
            {stat.value}
          </span>
          <span className="block font-mono text-[8px] uppercase tracking-widest text-[var(--ink-muted)] mt-1">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                              */
/* ════════════════════════════════════════════════════════════ */
export function BreakoutDetector() {
  const [signals, setSignals] = useState<SignalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AlertSeverity | "ALL">("ALL");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/intelligence");
        const json = await res.json();
        setSignals(json);
      } catch (err) {
        console.error("Failed to fetch intelligence data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const alerts = useMemo(() => detectBreakouts(signals), [signals]);

  const filteredAlerts = useMemo(() => {
    if (filter === "ALL") return alerts;
    return alerts.filter((a) => a.severity === filter);
  }, [alerts, filter]);

  if (loading) {
    return <div className="font-mono text-sm opacity-60 animate-pulse">Scanning for technology breakouts...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-red-500 font-bold">
            Early Warning System
          </span>
        </div>
        <h3 className="font-serif text-2xl text-[var(--text-primary)]">Emerging Breakout Detection</h3>
        <p className="font-mono text-[11px] text-[var(--ink-tertiary)] max-w-[55ch] mx-auto">
          Automated detection of velocity spikes, momentum acceleration, cluster surges, and breakout candidates across all monitored signals
        </p>
      </div>

      {/* Alert Summary */}
      <AlertSummary alerts={alerts} />

      {/* Filter */}
      <div className="flex items-center gap-2 justify-center">
        <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink-muted)]">
          Filter
        </span>
        {(["ALL", "CRITICAL", "WARNING", "WATCH"] as const).map((sev) => (
          <button
            key={sev}
            onClick={() => setFilter(sev)}
            className={`
              font-mono text-[10px] px-3 py-1 rounded-lg border transition-all
              ${filter === sev
                ? sev === "CRITICAL" ? "border-red-500/40 bg-red-500/10 text-red-500 font-bold" :
                  sev === "WARNING" ? "border-amber-500/40 bg-amber-500/10 text-amber-500 font-bold" :
                  sev === "WATCH" ? "border-sky-500/40 bg-sky-500/10 text-sky-500 font-bold" :
                  "border-amber-500/40 bg-amber-500/10 text-amber-500 font-bold"
                : "border-[var(--border-soft)] text-[var(--ink-muted)] hover:bg-[rgba(255,255,255,0.03)]"
              }
            `}
          >
            {sev}
          </button>
        ))}
      </div>

      {/* Alerts Grid */}
      {filteredAlerts.length === 0 ? (
        <div className="text-center py-12">
          <span className="font-mono text-[11px] text-[var(--ink-muted)]">
            No {filter !== "ALL" ? filter.toLowerCase() : ""} alerts detected
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}

      {/* Detection Methodology */}
      <div className="p-5 rounded-xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.02)] space-y-3">
        <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink-muted)]">
          Detection Algorithms
        </span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              name: "Velocity Spike",
              rule: "Recent velocity > 1.3× historical average",
              icon: "↗",
            },
            {
              name: "Momentum Accel",
              rule: "Late-stage Δ exceeds early-stage by >2pts/qtr",
              icon: "⚡",
            },
            {
              name: "Cluster Surge",
              rule: "Domain avg velocity > +7.5/quarter",
              icon: "🔥",
            },
            {
              name: "Breakout",
              rule: "Vel > 7 + TRL ≥ 5 + Priority ≥ 85",
              icon: "🚀",
            },
          ].map((algo) => (
            <div key={algo.name} className="space-y-1">
              <span className="text-base">{algo.icon}</span>
              <span className="block font-mono text-[10px] font-bold text-[var(--text-primary)]">
                {algo.name}
              </span>
              <span className="block font-mono text-[9px] text-[var(--ink-muted)] leading-relaxed">
                {algo.rule}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
