"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

/* ─────── Types ─────── */
interface DepNode {
  id: string;
  label: string;
  cluster: string;
  level: number;
  signalRef?: string;
}

interface DepEdge {
  from: string;
  to: string;
  relation: string;
  strength: number;
}

interface DepChain {
  id: string;
  name: string;
  description: string;
  path: string[];
  criticality: string;
}

interface DepData {
  nodes: DepNode[];
  edges: DepEdge[];
  chains: DepChain[];
}

interface CascadeNode {
  id: string;
  label: string;
  cluster: string;
  depth: number;         /* hops from shock origin */
  impactScore: number;   /* 0-1, decays with depth */
  relation: string;      /* how this node is affected */
  parentId: string;      /* which node caused this effect */
}

/* ─────── Pre-defined shock scenarios ─────── */
interface ShockScenario {
  id: string;
  title: string;
  description: string;
  originNode: string;
  shockType: "breakthrough" | "disruption" | "acceleration" | "collapse";
  magnitude: number; /* 0-1 */
}

const SHOCK_SCENARIOS: ShockScenario[] = [
  {
    id: "shock-1",
    title: "China GaN Semiconductor Breakthrough",
    description: "China achieves mass production of GaN-on-Diamond wafers, collapsing cost and lead time.",
    originNode: "gan-diamond",
    shockType: "breakthrough",
    magnitude: 0.9,
  },
  {
    id: "shock-2",
    title: "Quantum Computing Breakthrough",
    description: "Practical quantum key distribution scales to tactical systems via satellite constellation.",
    originNode: "qkd",
    shockType: "breakthrough",
    magnitude: 0.85,
  },
  {
    id: "shock-3",
    title: "Semiconductor Supply Chain Collapse",
    description: "Taiwan Strait crisis disrupts global semiconductor supply for 12+ months.",
    originNode: "semiconductors",
    shockType: "collapse",
    magnitude: 0.95,
  },
  {
    id: "shock-4",
    title: "Neuromorphic Chip Mass Deployment",
    description: "Intel Loihi 4 achieves 1000x efficiency gains, enabling edge AI on every soldier system.",
    originNode: "neuromorphic",
    shockType: "acceleration",
    magnitude: 0.88,
  },
  {
    id: "shock-5",
    title: "AmBC Stealth Network Detected",
    description: "Adversary deploys operational ambient backscatter communication network undetected for 6 months.",
    originNode: "ambc",
    shockType: "disruption",
    magnitude: 0.8,
  },
];

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

const SHOCK_TYPE_STYLES: Record<string, { label: string; color: string; bgClass: string }> = {
  breakthrough: { label: "BREAKTHROUGH", color: "#10B981", bgClass: "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" },
  disruption: { label: "DISRUPTION", color: "#EF4444", bgClass: "bg-red-500/10 border-red-500/30 text-red-500" },
  acceleration: { label: "ACCELERATION", color: "#F59E0B", bgClass: "bg-amber-500/10 border-amber-500/30 text-amber-500" },
  collapse: { label: "COLLAPSE", color: "#EF4444", bgClass: "bg-red-500/10 border-red-500/30 text-red-500" },
};

/* ─────── Propagation Engine ─────── */
function propagateShock(
  originId: string,
  magnitude: number,
  nodes: DepNode[],
  edges: DepEdge[]
): CascadeNode[] {
  const cascade: CascadeNode[] = [];
  const visited = new Set<string>();
  const queue: { id: string; depth: number; impact: number; parentId: string }[] = [
    { id: originId, depth: 0, impact: magnitude, parentId: "" },
  ];

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current.id)) continue;
    visited.add(current.id);

    const node = nodeMap.get(current.id);
    if (!node) continue;

    /* Find the edge relation for non-origin nodes */
    let relation = "origin";
    if (current.depth > 0) {
      const edge = edges.find(
        (e) => e.from === current.parentId && e.to === current.id
      );
      relation = edge?.relation || "cascades to";
    }

    cascade.push({
      id: node.id,
      label: node.label,
      cluster: node.cluster,
      depth: current.depth,
      impactScore: current.impact,
      relation,
      parentId: current.parentId,
    });

    /* Propagate outward through edges */
    const outEdges = edges.filter((e) => e.from === current.id && !visited.has(e.to));
    for (const edge of outEdges) {
      const decay = edge.strength * 0.85; /* impact decays by edge strength × 0.85 */
      const childImpact = current.impact * decay;
      if (childImpact > 0.05) {
        /* only propagate if impact remains meaningful */
        queue.push({
          id: edge.to,
          depth: current.depth + 1,
          impact: childImpact,
          parentId: current.id,
        });
      }
    }
  }

  return cascade;
}

/* ─────── Impact Badge ─────── */
function ImpactBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  let color = "text-[var(--ink-muted)]";
  let bg = "bg-[rgba(255,255,255,0.05)]";
  if (pct >= 70) { color = "text-red-500"; bg = "bg-red-500/10"; }
  else if (pct >= 40) { color = "text-amber-500"; bg = "bg-amber-500/10"; }
  else if (pct >= 20) { color = "text-sky-500"; bg = "bg-sky-500/10"; }

  return (
    <span className={`font-mono text-[11px] font-bold tabular-nums px-2 py-0.5 rounded ${color} ${bg}`}>
      {pct}%
    </span>
  );
}

/* ─────── Cascade Tree Visualization ─────── */
function CascadeTree({ cascade, nodes: _nodes }: { cascade: CascadeNode[]; nodes: DepNode[] }) {
  if (cascade.length === 0) return null;

  const maxDepth = Math.max(...cascade.map((c) => c.depth));
  const depthGroups: CascadeNode[][] = [];
  for (let d = 0; d <= maxDepth; d++) {
    depthGroups.push(cascade.filter((c) => c.depth === d));
  }

  const depthLabels = ["ORIGIN", "1ST ORDER", "2ND ORDER", "3RD ORDER", "4TH ORDER"];

  return (
    <div className="space-y-1">
      {depthGroups.map((group, depth) => (
        <div key={depth} className="flex items-stretch gap-3">
          {/* Depth label */}
          <div className="w-20 shrink-0 flex flex-col items-end justify-center pr-3 border-r border-[var(--border-soft)]">
            <span className="font-mono text-[8px] uppercase tracking-widest text-[var(--ink-muted)]">
              {depthLabels[depth] || `${depth}TH`}
            </span>
          </div>

          {/* Nodes at this depth */}
          <div className="flex-1 flex flex-wrap gap-2 py-2">
            {group.map((node) => {
              const color = CLUSTER_COLORS[node.cluster] || "#6B7280";
              return (
                <div
                  key={node.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-soft)] bg-[rgba(255,255,255,0.02)] transition-colors hover:bg-[rgba(255,255,255,0.04)]"
                >
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <div className="min-w-0">
                    <span className="font-mono text-[11px] font-bold text-[var(--text-primary)] block truncate">
                      {node.label}
                    </span>
                    {node.depth > 0 && (
                      <span className="font-mono text-[8px] text-[var(--ink-muted)] uppercase tracking-widest">
                        {node.relation} — from {cascade.find((c) => c.id === node.parentId)?.label || "origin"}
                      </span>
                    )}
                  </div>
                  <ImpactBadge score={node.impactScore} />
                </div>
              );
            })}

            {/* Connector arrow to next depth */}
            {depth < maxDepth && (
              <div className="flex items-center pl-2">
                <span className="text-[var(--ink-muted)] text-lg">→</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────── Impact Summary ─────── */
function ImpactSummary({ cascade, shockType }: { cascade: CascadeNode[]; shockType: string }) {
  const stats = useMemo(() => {
    const affected = cascade.length - 1; /* exclude origin */
    const avgImpact = cascade.slice(1).reduce((s, c) => s + c.impactScore, 0) / Math.max(affected, 1);
    const criticalNodes = cascade.filter((c) => c.impactScore >= 0.5 && c.depth > 0);
    const clusters = new Set(cascade.map((c) => c.cluster));
    const maxDepth = Math.max(...cascade.map((c) => c.depth));
    return { affected, avgImpact, criticalNodes, clusters: clusters.size, maxDepth };
  }, [cascade]);

  const isNegative = shockType === "collapse" || shockType === "disruption";

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {[
        { label: "Affected Nodes", value: stats.affected.toString(), sub: "technologies" },
        { label: "Cascade Depth", value: stats.maxDepth.toString(), sub: "propagation hops" },
        { label: "Domains Hit", value: stats.clusters.toString(), sub: "technology sectors" },
        { label: "Critical Impacts", value: stats.criticalNodes.length.toString(), sub: "≥50% impact" },
        {
          label: "Avg Impact",
          value: `${Math.round(stats.avgImpact * 100)}%`,
          sub: isNegative ? "degradation" : "improvement",
        },
      ].map((stat) => (
        <div key={stat.label} className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[var(--border-soft)] text-center">
          <span className={`block font-mono text-lg font-bold tabular-nums ${
            isNegative ? "text-red-500" : "text-emerald-500"
          }`}>
            {stat.value}
          </span>
          <span className="block font-mono text-[9px] uppercase tracking-widest text-[var(--text-primary)] mt-1">
            {stat.label}
          </span>
          <span className="block font-mono text-[8px] text-[var(--ink-muted)] mt-0.5">{stat.sub}</span>
        </div>
      ))}
    </div>
  );
}

/* ─────── Strategic Implications ─────── */
function StrategicImplications({ cascade, scenario }: { cascade: CascadeNode[]; scenario: ShockScenario }) {
  const implications = useMemo(() => {
    const results: string[] = [];
    const isNeg = scenario.shockType === "collapse" || scenario.shockType === "disruption";
    const verb = isNeg ? "degrades" : "accelerates";
    const verb2 = isNeg ? "delays" : "compresses";

    /* Group by cluster for analysis */
    const clusterImpacts: Record<string, CascadeNode[]> = {};
    for (const node of cascade) {
      if (node.depth === 0) continue;
      if (!clusterImpacts[node.cluster]) clusterImpacts[node.cluster] = [];
      clusterImpacts[node.cluster].push(node);
    }

    for (const [cluster, nodes] of Object.entries(clusterImpacts)) {
      const avgImpact = nodes.reduce((s, n) => s + n.impactScore, 0) / nodes.length;
      if (avgImpact > 0.3) {
        results.push(
          `${cluster} sector ${verb} — ${nodes.map((n) => n.label).join(", ")} affected at ${Math.round(avgImpact * 100)}% average impact`
        );
      }
    }

    /* Timeline compression */
    const criticals = cascade.filter((c) => c.impactScore >= 0.5 && c.depth > 0);
    if (criticals.length > 0) {
      const estimatedMonths = isNeg
        ? Math.round(criticals.length * 8)
        : Math.round(criticals.length * 6);
      results.push(
        `Critical capability timeline ${verb2} by approximately ${estimatedMonths} months across ${criticals.length} technology nodes`
      );
    }

    /* Chain disruption check */
    const maxDepth = Math.max(...cascade.map((c) => c.depth));
    if (maxDepth >= 3) {
      results.push(
        `${maxDepth}-order cascade detected — ${isNeg ? "systemic risk" : "strategic opportunity"} extends beyond immediate technology domain`
      );
    }

    return results;
  }, [cascade, scenario]);

  const isNeg = scenario.shockType === "collapse" || scenario.shockType === "disruption";

  return (
    <div className={`p-6 rounded-xl border space-y-4 ${
      isNeg ? "border-red-500/20 bg-red-500/5" : "border-emerald-500/20 bg-emerald-500/5"
    }`}>
      <span className={`block font-mono text-[10px] uppercase tracking-[0.05em] font-semibold ${
        isNeg ? "text-red-500" : "text-emerald-500"
      }`}>
        Strategic Implications — {scenario.title}
      </span>
      <ul className="space-y-3">
        {implications.map((imp, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${isNeg ? "bg-red-500" : "bg-emerald-500"}`} />
            <span className="text-[13px] leading-relaxed text-[var(--text-primary)]">{imp}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-4 text-[9px] font-mono text-[var(--ink-muted)] uppercase tracking-widest pt-2 border-t border-[var(--border-soft)]">
        <span>Shock magnitude: {Math.round(scenario.magnitude * 100)}%</span>
        <span>Origin: {scenario.originNode}</span>
        <span>Type: {scenario.shockType}</span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                             */
/* ════════════════════════════════════════════════════════════ */
export function TechnologyShockSimulator() {
  const [data, setData] = useState<DepData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeScenario, setActiveScenario] = useState<ShockScenario | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [cascade, setCascade] = useState<CascadeNode[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/dependencies");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch dependency data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const runSimulation = useCallback(
    (scenario: ShockScenario) => {
      if (!data) return;
      setActiveScenario(scenario);
      setIsSimulating(true);
      setCascade([]);

      /* Simulate a brief delay for dramatic effect */
      setTimeout(() => {
        const result = propagateShock(
          scenario.originNode,
          scenario.magnitude,
          data.nodes,
          data.edges
        );
        setCascade(result);
        setIsSimulating(false);
      }, 800);
    },
    [data]
  );

  const resetSimulation = useCallback(() => {
    setActiveScenario(null);
    setCascade([]);
    setIsSimulating(false);
  }, []);

  if (loading) {
    return <div className="font-mono text-sm opacity-60 animate-pulse">Loading shock simulator...</div>;
  }
  if (!data) return null;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
          Strategic Foresight Engine
        </span>
        <h3 className="font-serif text-2xl text-[var(--text-primary)]">Technology Shock Simulator</h3>
        <p className="font-mono text-[11px] text-[var(--ink-tertiary)] max-w-[55ch] mx-auto">
          Select a disruption scenario to propagate through the dependency graph and observe cascading impacts across technology domains
        </p>
      </div>

      {/* Scenario Selection */}
      <div className="space-y-4">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
          Shock Scenarios
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SHOCK_SCENARIOS.map((scenario) => {
            const typeStyle = SHOCK_TYPE_STYLES[scenario.shockType];
            const isActive = activeScenario?.id === scenario.id;
            return (
              <button
                key={scenario.id}
                onClick={() => runSimulation(scenario)}
                disabled={isSimulating}
                className={`
                  text-left p-5 rounded-xl border transition-all duration-300
                  ${isActive
                    ? "ring-2 ring-amber-500/40 border-amber-500/30 bg-amber-500/5 shadow-lg"
                    : "border-[var(--border-soft)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] hover:shadow-md"
                  }
                  ${isSimulating ? "opacity-50 cursor-wait" : "cursor-pointer"}
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-mono text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${typeStyle.bgClass}`}>
                    {typeStyle.label}
                  </span>
                  <span className="font-mono text-[9px] text-[var(--ink-muted)]">
                    Magnitude: {Math.round(scenario.magnitude * 100)}%
                  </span>
                </div>
                <h4 className="font-serif text-base text-[var(--text-primary)] mb-1">{scenario.title}</h4>
                <p className="text-[11px] leading-relaxed text-[var(--ink-secondary)]">{scenario.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Simulation Running Indicator */}
      {isSimulating && (
        <div className="text-center py-12 space-y-3">
          <div className="inline-block w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          <p className="font-mono text-[11px] text-amber-500 animate-pulse">
            Propagating shock through dependency graph...
          </p>
        </div>
      )}

      {/* Results */}
      {!isSimulating && cascade.length > 0 && activeScenario && (
        <div className="space-y-8 pt-4 border-t border-[var(--border-soft)]">
          {/* Result header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
                Simulation Results
              </span>
              <h4 className="font-serif text-lg text-[var(--text-primary)]">{activeScenario.title}</h4>
            </div>
            <button
              onClick={resetSimulation}
              className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)] border border-[var(--border-soft)] px-3 py-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors"
            >
              Reset Simulation
            </button>
          </div>

          {/* Impact Summary Stats */}
          <ImpactSummary cascade={cascade} shockType={activeScenario.shockType} />

          {/* Cascade Tree */}
          <div className="space-y-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
              Cascade Propagation
            </span>
            <div className="p-6 rounded-xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.02)]">
              <CascadeTree cascade={cascade} nodes={data.nodes} />
            </div>
          </div>

          {/* Strategic Implications */}
          <StrategicImplications cascade={cascade} scenario={activeScenario} />
        </div>
      )}
    </div>
  );
}
