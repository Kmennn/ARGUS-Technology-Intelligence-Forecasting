"use client";

import { useState, useEffect, useMemo } from "react";

/* ─────── Types ─────── */
interface Milestone {
  year: number;
  phase: string;
  trl: number;
  status: "completed" | "in-progress" | "projected";
}

interface TechTimeline {
  techId: string;
  technology: string;
  cluster: string;
  currentTRL: number;
  milestones: Milestone[];
  operationalReadiness: { year: number; uncertainty: number };
  deploymentProbability: number;
  adoptionSpeed: "fast" | "moderate" | "slow";
  strategicWindow: string;
  constraints: string[];
  accelerators: string[];
}

/* ─────── Styles ─────── */
const CLUSTER_COLORS: Record<string, string> = {
  Semiconductors: "#EC4899",
  AI: "#8B5CF6",
  Autonomy: "#F59E0B",
  Communications: "#10B981",
  Quantum: "#06B6D4",
  Hypersonics: "#EF4444",
  Energy: "#6366F1",
};

const SPEED_STYLES: Record<string, { text: string; bg: string; border: string }> = {
  fast: { text: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  moderate: { text: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  slow: { text: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/30" },
};

const STATUS_DOT: Record<string, string> = {
  completed: "bg-emerald-500",
  "in-progress": "bg-amber-500 animate-pulse",
  projected: "bg-[var(--ink-muted)]",
};

/* ─────── Unified Timeline (Gantt-style) ─────── */
function UnifiedTimeline({ timelines }: { timelines: TechTimeline[] }) {
  const minYear = 2023;
  const maxYear = 2036;
  const span = maxYear - minYear;
  const currentYear = 2026;

  const sorted = useMemo(
    () => [...timelines].sort((a, b) => a.operationalReadiness.year - b.operationalReadiness.year),
    [timelines]
  );

  return (
    <div className="space-y-4">
      {/* Year axis */}
      <div className="flex items-end pl-[180px]">
        {Array.from({ length: span + 1 }, (_, i) => minYear + i).map((year) => (
          <div
            key={year}
            className="flex-1 text-center"
          >
            <span className={`font-mono text-[8px] tabular-nums ${
              year === currentYear ? "text-amber-500 font-bold" : "text-[var(--ink-muted)]"
            }`}>
              {year}
            </span>
          </div>
        ))}
      </div>

      {/* Rows */}
      {sorted.map((tech) => {
        const color = CLUSTER_COLORS[tech.cluster] || "#6B7280";
        const firstYear = Math.min(...tech.milestones.map((m) => m.year));
        const lastYear = Math.max(...tech.milestones.map((m) => m.year));
        const readyYear = tech.operationalReadiness.year;
        const uncLow = readyYear - tech.operationalReadiness.uncertainty;
        const uncHigh = readyYear + tech.operationalReadiness.uncertainty;

        return (
          <div key={tech.techId} className="flex items-center group">
            {/* Label */}
            <div className="w-[180px] shrink-0 pr-3">
              <span className="block font-mono text-[10px] font-bold text-[var(--text-primary)] truncate">
                {tech.technology}
              </span>
              <span className="block font-mono text-[8px] text-[var(--ink-muted)] uppercase tracking-widest">
                {tech.cluster} • TRL {tech.currentTRL}
              </span>
            </div>

            {/* Bar area */}
            <div className="flex-1 relative h-8">
              {/* Background grid lines */}
              {Array.from({ length: span + 1 }, (_, i) => (
                <div
                  key={i}
                  className={`absolute top-0 bottom-0 border-l ${
                    minYear + i === currentYear
                      ? "border-amber-500/30"
                      : "border-[var(--border-soft)]/30"
                  }`}
                  style={{ left: `${(i / span) * 100}%` }}
                />
              ))}

              {/* Uncertainty band */}
              <div
                className="absolute top-1 bottom-1 rounded opacity-10"
                style={{
                  left: `${((uncLow - minYear) / span) * 100}%`,
                  width: `${((uncHigh - uncLow) / span) * 100}%`,
                  backgroundColor: color,
                }}
              />

              {/* Progress bar */}
              <div
                className="absolute top-2 bottom-2 rounded-full opacity-40"
                style={{
                  left: `${((firstYear - minYear) / span) * 100}%`,
                  width: `${((lastYear - firstYear) / span) * 100}%`,
                  backgroundColor: color,
                }}
              />

              {/* Milestones */}
              {tech.milestones.map((m) => (
                <div
                  key={m.year}
                  className="absolute top-1/2 -translate-y-1/2 group/dot"
                  style={{ left: `${((m.year - minYear) / span) * 100}%` }}
                >
                  <div className={`w-2.5 h-2.5 rounded-full border-2 border-[var(--bg-deep)] ${STATUS_DOT[m.status]}`} />
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/dot:block z-10">
                    <div className="bg-[var(--bg-deep)] border border-[var(--border-soft)] rounded-lg px-3 py-2 text-center whitespace-nowrap shadow-xl">
                      <span className="block font-mono text-[9px] font-bold text-[var(--text-primary)]">{m.phase}</span>
                      <span className="block font-mono text-[8px] text-[var(--ink-muted)]">TRL {m.trl} • {m.year}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Operational readiness marker */}
              <div
                className="absolute top-0 bottom-0 flex flex-col items-center justify-center"
                style={{ left: `${((readyYear - minYear) / span) * 100}%` }}
              >
                <div className="w-0.5 h-full" style={{ backgroundColor: color }} />
              </div>
            </div>

            {/* Probability */}
            <div className="w-[60px] shrink-0 text-right pl-2">
              <span className={`font-mono text-[11px] font-bold tabular-nums ${
                tech.deploymentProbability >= 0.8 ? "text-emerald-500" :
                tech.deploymentProbability >= 0.6 ? "text-amber-500" :
                "text-red-500"
              }`}>
                {Math.round(tech.deploymentProbability * 100)}%
              </span>
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="flex items-center gap-4 pt-3 pl-[180px] flex-wrap">
        {[
          { label: "Completed", dot: "bg-emerald-500" },
          { label: "In Progress", dot: "bg-amber-500" },
          { label: "Projected", dot: "bg-[var(--ink-muted)]" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${item.dot}`} />
            <span className="font-mono text-[8px] uppercase tracking-widest text-[var(--ink-muted)]">{item.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-amber-500/30" />
          <span className="font-mono text-[8px] uppercase tracking-widest text-[var(--ink-muted)]">Current Year</span>
        </div>
      </div>
    </div>
  );
}

/* ─────── Individual Technology Card ─────── */
function TechTimelineCard({ tech }: { tech: TechTimeline }) {
  const color = CLUSTER_COLORS[tech.cluster] || "#6B7280";
  const speedStyle = SPEED_STYLES[tech.adoptionSpeed] || SPEED_STYLES.moderate;
  const readyYear = tech.operationalReadiness.year;
  const unc = tech.operationalReadiness.uncertainty;

  return (
    <div className="p-6 rounded-xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.02)] space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
          <h4 className="font-serif text-base text-[var(--text-primary)]">{tech.technology}</h4>
        </div>
        <span className={`font-mono text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded border ${speedStyle.bg} ${speedStyle.text} ${speedStyle.border}`}>
          {tech.adoptionSpeed} adoption
        </span>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--border-soft)] text-center">
          <span className="block font-mono text-lg font-bold tabular-nums text-[var(--text-primary)]">
            {readyYear}
          </span>
          <span className="block font-mono text-[7px] uppercase tracking-widest text-[var(--ink-muted)] mt-1">
            Operational
          </span>
          <span className="block font-mono text-[8px] text-[var(--ink-muted)]">
            ±{unc} years
          </span>
        </div>
        <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--border-soft)] text-center">
          <span className={`block font-mono text-lg font-bold tabular-nums ${
            tech.deploymentProbability >= 0.8 ? "text-emerald-500" :
            tech.deploymentProbability >= 0.6 ? "text-amber-500" :
            "text-red-500"
          }`}>
            {Math.round(tech.deploymentProbability * 100)}%
          </span>
          <span className="block font-mono text-[7px] uppercase tracking-widest text-[var(--ink-muted)] mt-1">
            Deploy Prob
          </span>
        </div>
        <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--border-soft)] text-center">
          <span className="block font-mono text-lg font-bold tabular-nums text-[var(--text-primary)]">
            TRL {tech.currentTRL}
          </span>
          <span className="block font-mono text-[7px] uppercase tracking-widest text-[var(--ink-muted)] mt-1">
            Current
          </span>
        </div>
      </div>

      {/* Milestone timeline */}
      <div className="space-y-2">
        <span className="font-mono text-[8px] uppercase tracking-widest text-[var(--ink-muted)]">
          Milestones
        </span>
        <div className="space-y-1">
          {tech.milestones.map((m) => (
            <div key={m.year} className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.03)] transition-colors">
              <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[m.status]}`} />
              <span className="font-mono text-[10px] font-bold tabular-nums text-[var(--ink-secondary)] w-8 shrink-0">
                {m.year}
              </span>
              <span className="font-mono text-[10px] text-[var(--text-primary)] flex-1 truncate">
                {m.phase}
              </span>
              <span className="font-mono text-[8px] text-[var(--ink-muted)] shrink-0">
                TRL {m.trl}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Strategic window */}
      <div className="pt-3 border-t border-[var(--border-soft)]">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[8px] uppercase tracking-widest text-[var(--ink-muted)]">
            Strategic Window
          </span>
          <span className="font-mono text-[11px] font-bold text-amber-500">{tech.strategicWindow}</span>
        </div>

        {/* Constraints & Accelerators */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <span className="font-mono text-[8px] uppercase tracking-widest text-red-500/70">Constraints</span>
            {tech.constraints.map((c) => (
              <div key={c} className="flex items-start gap-1.5">
                <span className="w-1 h-1 rounded-full bg-red-500 mt-1.5 shrink-0" />
                <span className="font-mono text-[9px] text-[var(--ink-secondary)] leading-relaxed">{c}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            <span className="font-mono text-[8px] uppercase tracking-widest text-emerald-500/70">Accelerators</span>
            {tech.accelerators.map((a) => (
              <div key={a} className="flex items-start gap-1.5">
                <span className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span className="font-mono text-[9px] text-[var(--ink-secondary)] leading-relaxed">{a}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                              */
/* ════════════════════════════════════════════════════════════ */
export function HorizonForecasting() {
  const [timelines, setTimelines] = useState<TechTimeline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/timelines");
        const json = await res.json();
        setTimelines(json);
      } catch (err) {
        console.error("Failed to fetch timelines", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  /* Summary stats */
  const stats = useMemo(() => {
    if (timelines.length === 0) return null;
    const nearTerm = timelines.filter((t) => t.operationalReadiness.year <= 2028);
    const midTerm = timelines.filter((t) => t.operationalReadiness.year > 2028 && t.operationalReadiness.year <= 2031);
    const longTerm = timelines.filter((t) => t.operationalReadiness.year > 2031);
    const avgProb = timelines.reduce((s, t) => s + t.deploymentProbability, 0) / timelines.length;
    const fastCount = timelines.filter((t) => t.adoptionSpeed === "fast").length;
    return { nearTerm: nearTerm.length, midTerm: midTerm.length, longTerm: longTerm.length, avgProb, fastCount };
  }, [timelines]);

  if (loading) {
    return <div className="font-mono text-sm opacity-60 animate-pulse">Generating technology horizon forecasts...</div>;
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
          Technology Horizons
        </span>
        <h3 className="font-serif text-2xl text-[var(--text-primary)]">Strategic Timeline Forecasting</h3>
        <p className="font-mono text-[11px] text-[var(--ink-tertiary)] max-w-[60ch] mx-auto">
          When will each technology reach operational readiness? Forecasts maturity timelines, deployment probability, and strategic windows based on TRL progression, adoption speed, and constraint analysis
        </p>
      </div>

      {/* Summary */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Technologies", value: timelines.length.toString(), color: "text-[var(--text-primary)]" },
            { label: "Near-Term (≤2028)", value: stats.nearTerm.toString(), color: stats.nearTerm > 0 ? "text-emerald-500" : "text-[var(--ink-muted)]" },
            { label: "Mid-Term (2029–31)", value: stats.midTerm.toString(), color: stats.midTerm > 0 ? "text-amber-500" : "text-[var(--ink-muted)]" },
            { label: "Long-Term (2032+)", value: stats.longTerm.toString(), color: stats.longTerm > 0 ? "text-sky-400" : "text-[var(--ink-muted)]" },
            { label: "Avg Deploy Prob", value: `${Math.round(stats.avgProb * 100)}%`, color: "text-[var(--text-primary)]" },
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
      )}

      {/* Unified Gantt-style Timeline */}
      <div className="space-y-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
            Technology Horizon Map
          </span>
          <p className="font-mono text-[10px] text-[var(--ink-tertiary)] mt-1">
            Projected milestones from research through operational deployment — sorted by operational readiness year
          </p>
        </div>
        <div className="p-6 rounded-xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.02)] overflow-x-auto">
          <UnifiedTimeline timelines={timelines} />
        </div>
      </div>

      {/* Individual Technology Cards */}
      <div className="space-y-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
            Detailed Technology Forecasts
          </span>
          <p className="font-mono text-[10px] text-[var(--ink-tertiary)] mt-1">
            Per-technology milestones, constraints, accelerators, and strategic windows
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {timelines
            .sort((a, b) => a.operationalReadiness.year - b.operationalReadiness.year)
            .map((tech) => (
              <TechTimelineCard key={tech.techId} tech={tech} />
            ))}
        </div>
      </div>

      {/* Strategic Timeline Summary */}
      <div className="p-6 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-4">
        <span className="block font-mono text-[10px] uppercase tracking-[0.05em] font-semibold text-amber-500">
          Strategic Timeline Assessment
        </span>
        <div className="space-y-3">
          {timelines
            .sort((a, b) => a.operationalReadiness.year - b.operationalReadiness.year)
            .map((tech) => (
              <div key={tech.techId} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span className="text-[13px] leading-relaxed text-[var(--text-primary)]">
                  <strong>{tech.operationalReadiness.year} ±{tech.operationalReadiness.uncertainty}</strong> — {tech.technology} ({Math.round(tech.deploymentProbability * 100)}% probability). {tech.adoptionSpeed === "fast" ? "Rapid adoption expected." : tech.adoptionSpeed === "moderate" ? "Moderate integration timeline." : "Extended development cycle anticipated."} Strategic window: {tech.strategicWindow}.
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
