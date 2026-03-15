"use client";

import { useState, useEffect, useMemo } from "react";

/* ─────── Types ─────── */
interface Actor {
  id: string;
  name: string;
  type: "country" | "company" | "program";
  flag?: string;
  investmentLevel?: string;
  technologies: string[];
  country?: string;
  sector?: string;
  programs?: string[];
  budgetTier?: string;
}

interface TechActorEntry {
  leaders: string[];
  followers: string[];
  dominantOrgs: string[];
  patentVelocity: number;
  fundingBillions: number;
  competitiveIntensity: string;
}

interface ActorData {
  actors: Actor[];
  organizations: Actor[];
  technologyActorMap: Record<string, TechActorEntry>;
}

/* ─────── Human-readable labels ─────── */
const TECH_LABELS: Record<string, string> = {
  semiconductors: "Semiconductors",
  neuromorphic: "Neuromorphic Chips",
  lidar: "Solid-State LiDAR",
  "ai-chips": "AI Accelerator Chips",
  qkd: "Quantum Key Distribution",
  ambc: "Ambient Backscatter Comm",
  "gan-diamond": "GaN-on-Diamond RF",
  "hypersonic-mats": "Hypersonic Materials",
  "6g": "6G Communications",
  "solid-state-bat": "Solid-State Batteries",
};

const INTENSITY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  extreme: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/30" },
  high: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/30" },
  medium: { bg: "bg-sky-500/10", text: "text-sky-500", border: "border-sky-500/30" },
  low: { bg: "bg-[var(--ink-muted)]/10", text: "text-[var(--ink-muted)]", border: "border-[var(--border-soft)]" },
};

const INVESTMENT_STYLES: Record<string, string> = {
  dominant: "text-red-500 font-bold",
  "very-high": "text-amber-500 font-bold",
  significant: "text-sky-400",
  growing: "text-emerald-500",
  medium: "text-[var(--ink-secondary)]",
  low: "text-[var(--ink-muted)]",
};

/* ─────── Country Dominance Visualisation ─────── */
function DominanceBar({ leaders, followers, actors }: { leaders: string[]; followers: string[]; actors: Actor[] }) {
  const actorMap = new Map(actors.map((a) => [a.id, a]));
  return (
    <div className="space-y-2">
      <div className="space-y-1.5">
        <span className="font-mono text-[8px] uppercase tracking-widest text-[var(--ink-muted)]">Leaders</span>
        <div className="flex flex-wrap gap-1.5">
          {leaders.map((id) => {
            const actor = actorMap.get(id);
            if (!actor) return null;
            return (
              <span key={id} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono">
                <span>{actor.flag}</span>
                <span className="font-bold text-amber-500">{actor.name}</span>
              </span>
            );
          })}
        </div>
      </div>
      <div className="space-y-1.5">
        <span className="font-mono text-[8px] uppercase tracking-widest text-[var(--ink-muted)]">Followers</span>
        <div className="flex flex-wrap gap-1.5">
          {followers.map((id) => {
            const actor = actorMap.get(id);
            if (!actor) return null;
            return (
              <span key={id} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[rgba(255,255,255,0.04)] border border-[var(--border-soft)] text-[10px] font-mono">
                <span>{actor.flag}</span>
                <span className="text-[var(--ink-secondary)]">{actor.name}</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─────── Technology Actor Card ─────── */
function TechActorCard({
  techId,
  entry,
  actors,
  organizations,
}: {
  techId: string;
  entry: TechActorEntry;
  actors: Actor[];
  organizations: Actor[];
}) {
  const label = TECH_LABELS[techId] || techId;
  const intensity = INTENSITY_STYLES[entry.competitiveIntensity] || INTENSITY_STYLES.medium;
  const orgMap = new Map(organizations.map((o) => [o.id, o]));
  const actorMap = new Map(actors.map((a) => [a.id, a]));

  return (
    <div className="p-6 rounded-xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.02)] space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h4 className="font-serif text-base text-[var(--text-primary)]">{label}</h4>
        <span className={`font-mono text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded border ${intensity.bg} ${intensity.text} ${intensity.border}`}>
          {entry.competitiveIntensity} competition
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--border-soft)]">
          <span className="block font-mono text-lg font-bold tabular-nums text-[var(--text-primary)]">
            {entry.patentVelocity.toLocaleString()}
          </span>
          <span className="block font-mono text-[8px] uppercase tracking-widest text-[var(--ink-muted)] mt-1">
            Patents / Year
          </span>
        </div>
        <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--border-soft)]">
          <span className="block font-mono text-lg font-bold tabular-nums text-[var(--text-primary)]">
            ${entry.fundingBillions}B
          </span>
          <span className="block font-mono text-[8px] uppercase tracking-widest text-[var(--ink-muted)] mt-1">
            Global Funding
          </span>
        </div>
      </div>

      {/* Country dominance */}
      <DominanceBar leaders={entry.leaders} followers={entry.followers} actors={actors} />

      {/* Key organisations */}
      <div className="space-y-2">
        <span className="font-mono text-[8px] uppercase tracking-widest text-[var(--ink-muted)]">Key Organisations</span>
        <div className="space-y-1.5">
          {entry.dominantOrgs.map((orgId) => {
            const org = orgMap.get(orgId);
            if (!org) return null;
            const parentActor = org.country ? actorMap.get(org.country) : null;
            return (
              <div key={orgId} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs">{parentActor?.flag || "🏢"}</span>
                  <span className="font-mono text-[11px] font-bold text-[var(--text-primary)] truncate">
                    {org.name}
                  </span>
                  <span className={`font-mono text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded border border-[var(--border-soft)] ${
                    org.type === "program" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                    org.type === "company" ? "bg-sky-500/10 text-sky-400 border-sky-500/20" :
                    "bg-[rgba(255,255,255,0.05)] text-[var(--ink-muted)]"
                  }`}>
                    {org.type}
                  </span>
                </div>
                <span className={`font-mono text-[9px] uppercase tracking-widest shrink-0 ${INVESTMENT_STYLES[org.budgetTier || "medium"]}`}>
                  {org.budgetTier?.replace("-", " ")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─────── Global Actor Summary ─────── */
function GlobalActorSummary({ actors, techMap }: { actors: Actor[]; techMap: Record<string, TechActorEntry> }) {
  const countryStats = useMemo(() => {
    return actors.map((actor) => {
      let leadCount = 0;
      let followCount = 0;
      for (const entry of Object.values(techMap)) {
        if (entry.leaders.includes(actor.id)) leadCount++;
        if (entry.followers.includes(actor.id)) followCount++;
      }
      return { ...actor, leadCount, followCount, totalInvolvement: leadCount + followCount };
    }).sort((a, b) => b.leadCount - a.leadCount);
  }, [actors, techMap]);

  return (
    <div className="space-y-3">
      {countryStats.map((actor) => (
        <div key={actor.id} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[rgba(255,255,255,0.03)] transition-colors">
          <span className="text-xl">{actor.flag}</span>
          <div className="min-w-0 flex-1">
            <span className="block font-mono text-[11px] font-bold text-[var(--text-primary)]">{actor.name}</span>
            <span className="block font-mono text-[9px] text-[var(--ink-muted)]">
              {actor.technologies.length} technology areas
            </span>
          </div>
          {/* Lead/Follow bar */}
          <div className="flex items-center gap-1 shrink-0">
            <div className="flex h-2 rounded-full overflow-hidden w-24">
              <div
                className="bg-amber-500 rounded-l-full"
                style={{ width: `${(actor.leadCount / Object.keys(techMap).length) * 100}%` }}
              />
              <div
                className="bg-sky-500/40"
                style={{ width: `${(actor.followCount / Object.keys(techMap).length) * 100}%` }}
              />
            </div>
          </div>
          <div className="shrink-0 text-right">
            <span className="block font-mono text-[11px] font-bold tabular-nums text-amber-500">{actor.leadCount}</span>
            <span className="block font-mono text-[7px] uppercase text-[var(--ink-muted)]">LEAD</span>
          </div>
          <div className="shrink-0 text-right">
            <span className="block font-mono text-[11px] tabular-nums text-sky-400">{actor.followCount}</span>
            <span className="block font-mono text-[7px] uppercase text-[var(--ink-muted)]">FOLLOW</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                              */
/* ════════════════════════════════════════════════════════════ */
export function ActorIntelligence() {
  const [data, setData] = useState<ActorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTech, setSelectedTech] = useState<string | "ALL">("ALL");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/actors");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch actor data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const techIds = useMemo(() => {
    if (!data) return [];
    return Object.keys(data.technologyActorMap);
  }, [data]);

  const filteredTechs = useMemo(() => {
    if (!data) return [];
    if (selectedTech === "ALL") return Object.entries(data.technologyActorMap);
    return Object.entries(data.technologyActorMap).filter(([id]) => id === selectedTech);
  }, [data, selectedTech]);

  /* Compute global stats */
  const globalStats = useMemo(() => {
    if (!data) return { totalTechs: 0, totalActors: 0, totalOrgs: 0, totalPatents: 0, totalFunding: 0 };
    const map = data.technologyActorMap;
    const totalPatents = Object.values(map).reduce((s, t) => s + t.patentVelocity, 0);
    const totalFunding = Object.values(map).reduce((s, t) => s + t.fundingBillions, 0);
    return {
      totalTechs: Object.keys(map).length,
      totalActors: data.actors.length,
      totalOrgs: data.organizations.length,
      totalPatents,
      totalFunding,
    };
  }, [data]);

  if (loading) {
    return <div className="font-mono text-sm opacity-60 animate-pulse">Loading actor intelligence...</div>;
  }
  if (!data) return null;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
          Geopolitical Context
        </span>
        <h3 className="font-serif text-2xl text-[var(--text-primary)]">Technology Actor Intelligence</h3>
        <p className="font-mono text-[11px] text-[var(--ink-tertiary)] max-w-[60ch] mx-auto">
          Who is advancing each technology — countries, defence programs, corporations — mapped by leadership position, patent velocity, and funding levels
        </p>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Technologies", value: globalStats.totalTechs.toString(), color: "text-[var(--text-primary)]" },
          { label: "Countries", value: globalStats.totalActors.toString(), color: "text-amber-500" },
          { label: "Organisations", value: globalStats.totalOrgs.toString(), color: "text-sky-400" },
          { label: "Patents / Year", value: globalStats.totalPatents.toLocaleString(), color: "text-emerald-500" },
          { label: "Global Funding", value: `$${globalStats.totalFunding.toFixed(0)}B`, color: "text-[var(--text-primary)]" },
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

      {/* Country Dominance Overview */}
      <div className="space-y-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
            Country Technology Leadership
          </span>
          <p className="font-mono text-[10px] text-[var(--ink-tertiary)] mt-1">
            Number of technology domains where each country leads vs. follows
          </p>
        </div>
        <div className="p-4 rounded-xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.02)]">
          <GlobalActorSummary actors={data.actors} techMap={data.technologyActorMap} />
        </div>
      </div>

      {/* Technology Filter */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink-muted)]">
          Technology
        </span>
        <button
          onClick={() => setSelectedTech("ALL")}
          className={`font-mono text-[10px] px-3 py-1 rounded-lg border transition-all ${
            selectedTech === "ALL"
              ? "border-amber-500/40 bg-amber-500/10 text-amber-500 font-bold"
              : "border-[var(--border-soft)] text-[var(--ink-muted)] hover:bg-[rgba(255,255,255,0.03)]"
          }`}
        >
          ALL
        </button>
        {techIds.map((id) => (
          <button
            key={id}
            onClick={() => setSelectedTech(id)}
            className={`font-mono text-[10px] px-2.5 py-1 rounded-lg border transition-all ${
              selectedTech === id
                ? "border-amber-500/40 bg-amber-500/10 text-amber-500 font-bold"
                : "border-[var(--border-soft)] text-[var(--ink-muted)] hover:bg-[rgba(255,255,255,0.03)]"
            }`}
          >
            {TECH_LABELS[id] || id}
          </button>
        ))}
      </div>

      {/* Technology Actor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredTechs.map(([techId, entry]) => (
          <TechActorCard
            key={techId}
            techId={techId}
            entry={entry}
            actors={data.actors}
            organizations={data.organizations}
          />
        ))}
      </div>

      {/* Strategic Note */}
      <div className="p-5 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-3">
        <span className="block font-mono text-[10px] uppercase tracking-[0.05em] font-semibold text-amber-500">
          Strategic Intelligence Note
        </span>
        <p className="text-[13px] leading-relaxed text-[var(--text-primary)]">
          Actor intelligence reveals not just <em>what</em> technologies are emerging, but <em>who</em> is driving them. Technologies where adversaries lead and allies follow represent strategic vulnerability. Technologies where leadership is concentrated in a single actor represent supply-chain single points of failure. Monitor competitive intensity shifts quarterly.
        </p>
      </div>
    </div>
  );
}
