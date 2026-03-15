"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════ */
/*  TYPES                                                          */
/* ═══════════════════════════════════════════════════════════════ */
interface Signal {
  id: string;
  signal: string;
  trl?: number;
  priorityScore?: number;
  technologyCluster?: string;
  volatility?: string;
  scoreHistory?: number[];
}

interface DepNode { id: string; label: string; trl: number; cluster: string }
interface DepEdge { source: string; target: string; strength: number }
interface DepData { nodes: DepNode[]; edges: DepEdge[] }

interface TimelineEntry {
  techId: string;
  technology: string;
  cluster: string;
  currentTRL: number;
  operationalReadiness: { year: number; uncertainty: number };
  deploymentProbability: number;
  adoptionSpeed: string;
  strategicWindow: string;
}

interface AlertItem {
  type: string;
  severity: "CRITICAL" | "WARNING" | "WATCH";
  signal: string;
  cluster: string;
  metric: string;
  value: string;
}

/* ═══════════════════════════════════════════════════════════════ */
/*  CONSTANTS                                                      */
/* ═══════════════════════════════════════════════════════════════ */
const CLUSTER_COLORS: Record<string, string> = {
  Semiconductors: "#EC4899",
  AI: "#8B5CF6",
  Autonomy: "#F59E0B",
  Communications: "#10B981",
  Quantum: "#06B6D4",
  Hypersonics: "#EF4444",
  Energy: "#6366F1",
};

/* ═══════════════════════════════════════════════════════════════ */
/*  BREAKOUT DETECTION (inline for command center)                  */
/* ═══════════════════════════════════════════════════════════════ */
function detectAlerts(signals: Signal[]): AlertItem[] {
  const alerts: AlertItem[] = [];
  for (const sig of signals) {
    const hist = sig.scoreHistory || [];
    if (hist.length < 4) continue;
    const cluster = sig.technologyCluster || "Unknown";

    // Velocity spike
    const allDiffs = hist.slice(1).map((v, i) => v - hist[i]);
    const avg = allDiffs.reduce((s, v) => s + v, 0) / allDiffs.length;
    const recent = allDiffs.slice(-2).reduce((s, v) => s + v, 0) / Math.min(allDiffs.length, 2);
    if (avg > 0 && recent / avg > 1.3) {
      const ratio = recent / avg;
      alerts.push({
        type: "VELOCITY SPIKE",
        severity: ratio > 1.8 ? "CRITICAL" : ratio > 1.5 ? "WARNING" : "WATCH",
        signal: sig.signal,
        cluster,
        metric: "Velocity Ratio",
        value: `${ratio.toFixed(2)}×`,
      });
    }

    // Breakout candidate
    const vel = allDiffs.slice(-2).reduce((s, v) => s + v, 0) / 2;
    if (vel > 7 && (sig.trl ?? 0) >= 5 && (sig.priorityScore ?? 0) >= 85) {
      alerts.push({
        type: "BREAKOUT",
        severity: "CRITICAL",
        signal: sig.signal,
        cluster,
        metric: "Breakout Score",
        value: `${Math.round(vel * (sig.trl ?? 1))}`,
      });
    }
  }
  return alerts.sort((a, b) => {
    const order = { CRITICAL: 0, WARNING: 1, WATCH: 2 };
    return order[a.severity] - order[b.severity];
  });
}

/* ═══════════════════════════════════════════════════════════════ */
/*  PANEL WRAPPER                                                   */
/* ═══════════════════════════════════════════════════════════════ */
function Panel({
  title,
  label,
  accentColor,
  children,
  className = "",
}: {
  title: string;
  label: string;
  accentColor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.015)] overflow-hidden ${className}`}>
      <div className="px-4 py-2.5 border-b border-[var(--border-soft)] bg-[rgba(255,255,255,0.02)] flex items-center gap-2">
        {accentColor && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />}
        <span className="font-mono text-[8px] uppercase tracking-widest text-[var(--ink-muted)]">{label}</span>
        <span className="font-mono text-[11px] font-bold text-[var(--text-primary)]">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  MINI SHOCK SIMULATOR                                            */
/* ═══════════════════════════════════════════════════════════════ */
function MiniShockSimulator({ deps }: { deps: DepData | null }) {
  const [originId, setOriginId] = useState<string | null>(null);
  const [cascade, setCascade] = useState<{ id: string; label: string; impact: number; order: number }[]>([]);

  const runCascade = useCallback(() => {
    if (!deps || !originId) return;
    const adj = new Map<string, { target: string; strength: number }[]>();
    for (const e of deps.edges) {
      if (!adj.has(e.source)) adj.set(e.source, []);
      adj.get(e.source)!.push({ target: e.target, strength: e.strength });
    }
    const visited = new Set<string>();
    const results: { id: string; label: string; impact: number; order: number }[] = [];
    const queue = [{ id: originId, impact: 90, order: 0 }];
    visited.add(originId);
    while (queue.length > 0) {
      const curr = queue.shift()!;
      const node = deps.nodes.find((n) => n.id === curr.id);
      if (node) results.push({ ...curr, label: node.label });
      for (const nb of adj.get(curr.id) || []) {
        if (visited.has(nb.target)) continue;
        const nextImpact = curr.impact * nb.strength * 0.85;
        if (nextImpact < 5) continue;
        visited.add(nb.target);
        queue.push({ id: nb.target, impact: nextImpact, order: curr.order + 1 });
      }
    }
    setCascade(results);
  }, [deps, originId]);

  if (!deps) return <div className="font-mono text-[10px] text-[var(--ink-muted)]">Loading dependencies...</div>;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-center flex-wrap">
        <select
          value={originId || ""}
          onChange={(e) => { setOriginId(e.target.value); setCascade([]); }}
          className="bg-[rgba(255,255,255,0.04)] border border-[var(--border-soft)] text-[var(--text-primary)] text-[10px] font-mono rounded-lg px-2 py-1.5 outline-none"
        >
          <option value="">Select shock origin...</option>
          {deps.nodes.map((n) => (
            <option key={n.id} value={n.id}>{n.label}</option>
          ))}
        </select>
        <button
          onClick={runCascade}
          disabled={!originId}
          className="font-mono text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-500 font-bold disabled:opacity-30 hover:bg-amber-500/20 transition-colors"
        >
          Propagate
        </button>
      </div>
      {cascade.length > 0 && (
        <div className="space-y-1 max-h-[200px] overflow-y-auto">
          {cascade.map((c) => (
            <div key={c.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[rgba(255,255,255,0.03)]">
              <span className="font-mono text-[8px] text-[var(--ink-muted)] w-4 shrink-0">L{c.order}</span>
              <div className="flex-1 h-1.5 rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-red-500 transition-all"
                  style={{ width: `${Math.min(c.impact, 100)}%` }}
                />
              </div>
              <span className="font-mono text-[9px] text-[var(--text-primary)] truncate max-w-[100px]">{c.label}</span>
              <span className="font-mono text-[9px] font-bold tabular-nums text-red-500 shrink-0">{c.impact.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  MAIN COMMAND CENTER                                             */
/* ═══════════════════════════════════════════════════════════════ */
export function StrategicCommandCenter() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [deps, setDeps] = useState<DepData | null>(null);
  const [timelines, setTimelines] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [clock, setClock] = useState(new Date());

  // Clock tick
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Data fetching
  useEffect(() => {
    async function load() {
      try {
        const [sigRes, depRes, tlRes] = await Promise.all([
          fetch("/api/intelligence"),
          fetch("/api/dependencies"),
          fetch("/api/timelines"),
        ]);
        setSignals(await sigRes.json());
        setDeps(await depRes.json());
        setTimelines(await tlRes.json());
      } catch (err) {
        console.error("Command center data fetch failed", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Computed
  const alerts = useMemo(() => detectAlerts(signals), [signals]);
  const criticalCount = alerts.filter((a) => a.severity === "CRITICAL").length;
  const highPrioritySignals = useMemo(
    () => signals.filter((s) => (s.priorityScore ?? 0) >= 80).sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0)),
    [signals]
  );
  const clusterStats = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of signals) {
      const c = s.technologyCluster || "Unknown";
      map.set(c, (map.get(c) || 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [signals]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
            Initializing Command Center...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">

      {/* ══════════ TELEMETRY BAR ══════════ */}
      <div className="sticky top-0 z-50 bg-[rgba(28,25,23,0.95)] backdrop-blur-xl border-b border-[var(--border-soft)]">
        <div className="max-w-[1600px] mx-auto px-4 py-2 flex items-center justify-between gap-3 flex-wrap">
          {/* Left — System Identity */}
          <div className="flex items-center gap-3">
            <Link href="/" className="font-serif text-lg tracking-[0.06em] text-amber-500 font-bold hover:opacity-80 transition-opacity">
              ARGUS
            </Link>
            <span className="font-mono text-[8px] uppercase tracking-widest text-[var(--ink-muted)] border-l border-[var(--border-soft)] pl-3">
              Strategic Command
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-mono text-[9px] text-emerald-500">ONLINE</span>
          </div>

          {/* Center — Stats */}
          <div className="flex items-center gap-4">
            {[
              { label: "Signals", value: signals.length, color: "text-[var(--text-primary)]" },
              { label: "Alerts", value: alerts.length, color: criticalCount > 0 ? "text-red-500" : "text-amber-500" },
              { label: "Critical", value: criticalCount, color: criticalCount > 0 ? "text-red-500 animate-pulse" : "text-[var(--ink-muted)]" },
              { label: "Clusters", value: clusterStats.length, color: "text-sky-400" },
              { label: "Horizons", value: timelines.length, color: "text-[var(--text-primary)]" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <span className={`block font-mono text-[13px] font-bold tabular-nums ${s.color}`}>{s.value}</span>
                <span className="block font-mono text-[7px] uppercase tracking-widest text-[var(--ink-muted)]">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Right — Clock + Links */}
          <div className="flex items-center gap-3">
            <Link href="/intelligence" className="font-mono text-[8px] uppercase tracking-widest text-[var(--ink-muted)] hover:text-amber-500 transition-colors">Full View</Link>
            <span className="font-mono text-[11px] tabular-nums text-[var(--ink-secondary)]">
              {clock.toLocaleTimeString("en-GB")}
            </span>
            <span className="font-mono text-[9px] text-[var(--ink-muted)]">
              {clock.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* Alert ribbon */}
        {criticalCount > 0 && (
          <div className="bg-red-500/10 border-t border-red-500/20 px-4 py-1.5">
            <div className="max-w-[1600px] mx-auto flex items-center gap-3 overflow-x-auto">
              <span className="font-mono text-[8px] uppercase tracking-widest text-red-500 font-bold shrink-0">⚠ ACTIVE ALERTS</span>
              {alerts.filter((a) => a.severity === "CRITICAL").slice(0, 4).map((a, i) => (
                <span key={i} className="font-mono text-[9px] text-red-400 shrink-0 border-l border-red-500/20 pl-3">
                  {a.type}: {a.signal}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ══════════ MAIN GRID ══════════ */}
      <div className="max-w-[1600px] mx-auto px-4 py-4 space-y-4">

        {/* ROW 1 — Signal Radar + Strategic Map */}
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">

          {/* LEFT — Signal Radar */}
          <div className="space-y-4">
            {/* Alert Feed */}
            <Panel title="Breakout Radar" label="Early Warning" accentColor="#EF4444">
              <div className="space-y-2 max-h-[240px] overflow-y-auto">
                {alerts.length === 0 && (
                  <span className="font-mono text-[10px] text-emerald-500">No active alerts — all clear</span>
                )}
                {alerts.slice(0, 8).map((a, i) => (
                  <div key={i} className="flex items-start gap-2 px-2 py-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                    <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                      a.severity === "CRITICAL" ? "bg-red-500 animate-pulse" :
                      a.severity === "WARNING" ? "bg-amber-500" :
                      "bg-sky-400"
                    }`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-mono text-[8px] font-bold uppercase ${
                          a.severity === "CRITICAL" ? "text-red-500" :
                          a.severity === "WARNING" ? "text-amber-500" :
                          "text-sky-400"
                        }`}>{a.severity}</span>
                        <span className="font-mono text-[8px] text-[var(--ink-muted)]">{a.type}</span>
                      </div>
                      <span className="block font-mono text-[10px] text-[var(--text-primary)] truncate">{a.signal}</span>
                      <span className="block font-mono text-[8px] text-[var(--ink-muted)]">{a.metric}: {a.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Priority Signals */}
            <Panel title="Priority Signals" label="Intelligence" accentColor="#F59E0B">
              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {highPrioritySignals.slice(0, 6).map((sig) => (
                  <div key={sig.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CLUSTER_COLORS[sig.technologyCluster || ""] || "#6B7280" }} />
                    <span className="font-mono text-[10px] text-[var(--text-primary)] flex-1 truncate">{sig.signal}</span>
                    <span className={`font-mono text-[10px] font-bold tabular-nums shrink-0 ${
                      (sig.priorityScore ?? 0) >= 90 ? "text-red-500" : "text-amber-500"
                    }`}>{sig.priorityScore}</span>
                    <span className="font-mono text-[8px] text-[var(--ink-muted)] shrink-0">TRL {sig.trl}</span>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Cluster Status */}
            <Panel title="Cluster Status" label="Domains" accentColor="#10B981">
              <div className="space-y-1.5">
                {clusterStats.map(([cluster, count]) => (
                  <div key={cluster} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CLUSTER_COLORS[cluster] || "#6B7280" }} />
                    <span className="font-mono text-[10px] text-[var(--text-primary)] flex-1">{cluster}</span>
                    <span className="font-mono text-[10px] font-bold tabular-nums text-[var(--ink-secondary)]">{count}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          {/* RIGHT — Strategic Map */}
          <div className="space-y-4">
            {/* Technology Horizon Timeline */}
            <Panel title="Technology Horizons" label="Timeline Forecasting" accentColor="#06B6D4">
              <div className="space-y-2">
                {timelines
                  .sort((a, b) => a.operationalReadiness.year - b.operationalReadiness.year)
                  .map((tech) => {
                    const color = CLUSTER_COLORS[tech.cluster] || "#6B7280";
                    const ready = tech.operationalReadiness.year;
                    const unc = tech.operationalReadiness.uncertainty;
                    const yearsAway = ready - 2026;
                    const barWidth = Math.max(10, Math.min(100, (1 - yearsAway / 10) * 100));
                    return (
                      <div key={tech.techId} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <span className="font-mono text-[10px] text-[var(--text-primary)] w-[140px] truncate shrink-0">{tech.technology}</span>
                        <div className="flex-1 h-2 rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden relative">
                          <div
                            className="h-full rounded-full opacity-60 transition-all"
                            style={{ width: `${barWidth}%`, backgroundColor: color }}
                          />
                          {/* Uncertainty band */}
                          <div
                            className="absolute top-0 h-full rounded-full opacity-20"
                            style={{
                              left: `${Math.max(0, barWidth - (unc / 10) * 100)}%`,
                              width: `${(unc * 2 / 10) * 100}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                        <span className="font-mono text-[10px] font-bold tabular-nums text-amber-500 w-12 shrink-0 text-right">{ready}</span>
                        <span className="font-mono text-[8px] text-[var(--ink-muted)] w-6 shrink-0">±{unc}</span>
                        <span className={`font-mono text-[10px] font-bold tabular-nums w-8 shrink-0 text-right ${
                          tech.deploymentProbability >= 0.8 ? "text-emerald-500" :
                          tech.deploymentProbability >= 0.6 ? "text-amber-500" :
                          "text-red-500"
                        }`}>{Math.round(tech.deploymentProbability * 100)}%</span>
                      </div>
                    );
                  })}
              </div>
            </Panel>

            {/* Dependency Network Summary */}
            <Panel title="Dependency Network" label="Technology Graph" accentColor="#EC4899">
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="p-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--border-soft)] text-center">
                  <span className="block font-mono text-sm font-bold tabular-nums text-[var(--text-primary)]">{deps?.nodes.length || 0}</span>
                  <span className="block font-mono text-[7px] uppercase tracking-widest text-[var(--ink-muted)]">Nodes</span>
                </div>
                <div className="p-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--border-soft)] text-center">
                  <span className="block font-mono text-sm font-bold tabular-nums text-[var(--text-primary)]">{deps?.edges.length || 0}</span>
                  <span className="block font-mono text-[7px] uppercase tracking-widest text-[var(--ink-muted)]">Edges</span>
                </div>
                <div className="p-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--border-soft)] text-center">
                  <span className="block font-mono text-sm font-bold tabular-nums text-[var(--text-primary)]">
                    {deps ? (deps.edges.reduce((s, e) => s + e.strength, 0) / deps.edges.length * 100).toFixed(0) : 0}%
                  </span>
                  <span className="block font-mono text-[7px] uppercase tracking-widest text-[var(--ink-muted)]">Avg Strength</span>
                </div>
              </div>
              {/* Top dependency pairs */}
              <div className="space-y-1">
                <span className="font-mono text-[8px] uppercase tracking-widest text-[var(--ink-muted)]">Strongest Dependencies</span>
                {deps?.edges
                  .sort((a, b) => b.strength - a.strength)
                  .slice(0, 5)
                  .map((edge, i) => {
                    const src = deps.nodes.find((n) => n.id === edge.source);
                    const tgt = deps.nodes.find((n) => n.id === edge.target);
                    return (
                      <div key={i} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[rgba(255,255,255,0.03)]">
                        <span className="font-mono text-[9px] text-[var(--text-primary)] truncate flex-1">
                          {src?.label || edge.source}
                        </span>
                        <span className="font-mono text-[8px] text-amber-500">→</span>
                        <span className="font-mono text-[9px] text-[var(--text-primary)] truncate flex-1">
                          {tgt?.label || edge.target}
                        </span>
                        <span className="font-mono text-[9px] font-bold tabular-nums text-amber-500 shrink-0">
                          {(edge.strength * 100).toFixed(0)}%
                        </span>
                      </div>
                    );
                  })}
              </div>
            </Panel>
          </div>
        </div>

        {/* ROW 2 — Simulation + Decision Ledger */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Simulation Engine */}
          <Panel title="Shock Propagation" label="Simulation Engine" accentColor="#EF4444">
            <MiniShockSimulator deps={deps} />
          </Panel>

          {/* Decision Ledger */}
          <Panel title="Institutional Actions" label="Decision Ledger" accentColor="#8B5CF6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="font-mono text-[9px] text-emerald-500 uppercase tracking-widest">Active Monitoring</span>
              </div>
              {[
                { action: "Semiconductor supply chain review", status: "IN PROGRESS", date: "12 Mar 2026", priority: "HIGH" },
                { action: "Neuromorphic chip assessment initiated", status: "PENDING", date: "10 Mar 2026", priority: "MEDIUM" },
                { action: "LiDAR defense integration approved", status: "APPROVED", date: "08 Mar 2026", priority: "CRITICAL" },
                { action: "Quantum comm risk evaluation", status: "REVIEW", date: "05 Mar 2026", priority: "HIGH" },
                { action: "6G standards monitoring mandate", status: "ACTIVE", date: "01 Mar 2026", priority: "MEDIUM" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    item.status === "APPROVED" ? "bg-emerald-500" :
                    item.status === "IN PROGRESS" ? "bg-amber-500 animate-pulse" :
                    item.status === "REVIEW" ? "bg-sky-400" :
                    "bg-[var(--ink-muted)]"
                  }`} />
                  <span className="font-mono text-[10px] text-[var(--text-primary)] flex-1 truncate">{item.action}</span>
                  <span className={`font-mono text-[7px] uppercase tracking-widest shrink-0 px-1.5 py-0.5 rounded border ${
                    item.priority === "CRITICAL" ? "border-red-500/30 text-red-500 bg-red-500/10" :
                    item.priority === "HIGH" ? "border-amber-500/30 text-amber-500 bg-amber-500/10" :
                    "border-[var(--border-soft)] text-[var(--ink-muted)]"
                  }`}>{item.priority}</span>
                  <span className="font-mono text-[8px] text-[var(--ink-muted)] shrink-0 w-16 text-right">{item.date}</span>
                </div>
              ))}
              <div className="pt-2 text-center">
                <Link href="/decisions" className="font-mono text-[9px] uppercase tracking-widest text-amber-500 hover:text-amber-400 transition-colors">
                  Open Full Ledger →
                </Link>
              </div>
            </div>
          </Panel>
        </div>

        {/* ROW 3 — Quick Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2 pb-4">
          {[
            { label: "Intelligence", href: "/intelligence", color: "#10B981", desc: "Signal Detection" },
            { label: "Assessment", href: "/assessment", color: "#06B6D4", desc: "Strategic Analysis" },
            { label: "Capabilities", href: "/capabilities", color: "#F59E0B", desc: "Readiness Check" },
            { label: "Simulation", href: "/simulation", color: "#EF4444", desc: "Future Modeling" },
            { label: "Decisions", href: "/decisions", color: "#8B5CF6", desc: "Governance" },
          ].map((nav) => (
            <Link
              key={nav.label}
              href={nav.href}
              className="p-3 rounded-xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] hover:border-amber-500/20 transition-all text-center group"
            >
              <div className="w-2 h-2 rounded-full mx-auto mb-2 transition-transform group-hover:scale-125" style={{ backgroundColor: nav.color }} />
              <span className="block font-mono text-[10px] font-bold text-[var(--text-primary)]">{nav.label}</span>
              <span className="block font-mono text-[8px] text-[var(--ink-muted)] mt-0.5">{nav.desc}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
