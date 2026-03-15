"use client";

import { useState, useEffect, useCallback } from "react";

/* ─────── Types ─────── */
interface DepNode {
  id: string;
  label: string;
  cluster: string;
  level: number;
}

interface DepEdge {
  from: string;
  to: string;
  relation: string;
  strength: number;
}

interface DepData {
  nodes: DepNode[];
  edges: DepEdge[];
}

/* Monte Carlo result types */
interface NodeOutcome {
  id: string;
  label: string;
  cluster: string;
  meanImpact: number;
  medianImpact: number;
  p10: number;
  p90: number;
  hitRate: number; /* % of simulations where this node was affected (>5%) */
}

interface ClusterOutcome {
  cluster: string;
  meanImpact: number;
  hitRate: number;
  accelerationProb: number; /* % runs where cluster avg impact > 30% */
  stagnationProb: number;   /* % runs where cluster avg impact < 10% */
}

interface MonteCarloResult {
  scenario: string;
  runs: number;
  nodeOutcomes: NodeOutcome[];
  clusterOutcomes: ClusterOutcome[];
  cascadeDepthDistribution: number[]; /* index=depth, value=avg count of nodes at that depth */
  avgAffectedNodes: number;
  maxAffectedNodes: number;
  minAffectedNodes: number;
}

/* ─────── Scenarios ─────── */
interface MCScenario {
  id: string;
  title: string;
  description: string;
  originNode: string;
  baseMagnitude: number;
  magnitudeVariance: number; /* ±variance */
  edgeVariance: number;      /* ±variance on edge strengths */
  isNegative: boolean;
}

const MC_SCENARIOS: MCScenario[] = [
  {
    id: "mc-1",
    title: "Semiconductor Supply Disruption",
    description: "Taiwan Strait crisis disrupts chip supply. Varying severity and alternative supply chain activation.",
    originNode: "semiconductors",
    baseMagnitude: 0.9,
    magnitudeVariance: 0.15,
    edgeVariance: 0.2,
    isNegative: true,
  },
  {
    id: "mc-2",
    title: "AI Hardware Acceleration",
    description: "Neuromorphic chips achieve mass production. Varying adoption rates and integration timelines.",
    originNode: "neuromorphic",
    baseMagnitude: 0.85,
    magnitudeVariance: 0.2,
    edgeVariance: 0.15,
    isNegative: false,
  },
  {
    id: "mc-3",
    title: "Quantum Cryptography Maturation",
    description: "QKD becomes operationally viable. Varying deployment speed and infrastructure readiness.",
    originNode: "qkd",
    baseMagnitude: 0.8,
    magnitudeVariance: 0.25,
    edgeVariance: 0.2,
    isNegative: false,
  },
  {
    id: "mc-4",
    title: "Adversary Stealth Communications",
    description: "Ambient backscatter deployed covertly. Varying detection difficulty and network scale.",
    originNode: "ambc",
    baseMagnitude: 0.82,
    magnitudeVariance: 0.18,
    edgeVariance: 0.15,
    isNegative: true,
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

/* ─────── Random helpers ─────── */
function gaussianRandom(mean: number, stdDev: number): number {
  /* Box-Muller transform */
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stdDev;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/* ─────── Single BFS propagation run ─────── */
function singleRun(
  originId: string,
  magnitude: number,
  nodes: DepNode[],
  edges: DepEdge[],
  edgeVariance: number
): Map<string, { impact: number; depth: number }> {
  const results = new Map<string, { impact: number; depth: number }>();
  const visited = new Set<string>();
  const queue: { id: string; depth: number; impact: number }[] = [
    { id: originId, depth: 0, impact: magnitude },
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current.id)) continue;
    visited.add(current.id);

    results.set(current.id, { impact: current.impact, depth: current.depth });

    const outEdges = edges.filter((e) => e.from === current.id && !visited.has(e.to));
    for (const edge of outEdges) {
      /* Randomize edge strength */
      const variedStrength = clamp(
        gaussianRandom(edge.strength, edgeVariance),
        0.05,
        1.0
      );
      const decay = variedStrength * 0.85;
      const childImpact = current.impact * decay;
      if (childImpact > 0.05) {
        queue.push({ id: edge.to, depth: current.depth + 1, impact: childImpact });
      }
    }
  }

  return results;
}


/* ════════════════════════════════════════════════════════════ */
/*  VISUALIZATION COMPONENTS                                    */
/* ════════════════════════════════════════════════════════════ */

/* Probability bar with confidence interval */
function ProbabilityBar({ mean, p10, p90, color }: { mean: number; p10: number; p90: number; color: string }) {
  return (
    <div className="flex items-center gap-2 h-5">
      <div className="flex-1 relative h-2 rounded-full bg-[var(--border-soft)] overflow-visible">
        {/* Confidence interval (p10–p90) */}
        <div
          className="absolute h-2 rounded-full opacity-20"
          style={{
            left: `${p10 * 100}%`,
            width: `${(p90 - p10) * 100}%`,
            backgroundColor: color,
          }}
        />
        {/* Mean line */}
        <div
          className="absolute w-0.5 h-4 -top-1 rounded-full"
          style={{
            left: `${mean * 100}%`,
            backgroundColor: color,
          }}
        />
        {/* Mean fill */}
        <div
          className="absolute h-2 rounded-full opacity-60"
          style={{
            left: 0,
            width: `${mean * 100}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

/* Cluster probability cards */
function ClusterProbabilities({
  outcomes,
  isNegative,
}: {
  outcomes: ClusterOutcome[];
  isNegative: boolean;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {outcomes.map((cluster) => {
        const color = CLUSTER_COLORS[cluster.cluster] || "#6B7280";
        const impactPct = Math.round(cluster.meanImpact * 100);
        const hitPct = Math.round(cluster.hitRate * 100);
        const accelPct = Math.round(cluster.accelerationProb * 100);

        return (
          <div
            key={cluster.cluster}
            className="p-4 rounded-xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.02)]"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--text-primary)]">
                {cluster.cluster}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink-muted)]">
                  {isNegative ? "Degradation" : "Acceleration"} Probability
                </span>
                <span className={`font-mono text-[12px] font-bold tabular-nums ${
                  accelPct >= 60 ? (isNegative ? "text-red-500" : "text-emerald-500") :
                  accelPct >= 30 ? "text-amber-500" : "text-[var(--ink-muted)]"
                }`}>
                  {accelPct}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink-muted)]">
                  Mean Impact
                </span>
                <span className="font-mono text-[11px] font-bold tabular-nums text-[var(--text-primary)]">
                  {impactPct}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink-muted)]">
                  Hit Rate
                </span>
                <span className="font-mono text-[11px] tabular-nums text-[var(--ink-muted)]">
                  {hitPct}% of runs
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* Node impact table with confidence intervals */
function NodeImpactTable({
  outcomes,
  isNegative,
}: {
  outcomes: NodeOutcome[];
  isNegative: boolean;
}) {
  /* Only show nodes that were affected in >10% of runs */
  const significant = outcomes.filter((n) => n.hitRate > 0.1);

  return (
    <div className="space-y-1">
      {significant.map((node) => {
        const color = CLUSTER_COLORS[node.cluster] || "#6B7280";
        return (
          <div
            key={node.id}
            className="grid items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-[rgba(255,255,255,0.03)] transition-colors"
            style={{ gridTemplateColumns: "20px 1fr 200px 60px 60px 60px" }}
          >
            {/* Cluster dot */}
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />

            {/* Name */}
            <div className="min-w-0">
              <span className="text-[11px] font-mono text-[var(--text-primary)] truncate block font-bold">
                {node.label}
              </span>
              <span className="text-[8px] font-mono text-[var(--ink-muted)] uppercase tracking-widest">
                {node.cluster}
              </span>
            </div>

            {/* Probability bar */}
            <ProbabilityBar mean={node.meanImpact} p10={node.p10} p90={node.p90} color={color} />

            {/* Mean */}
            <div className="text-right">
              <span className={`font-mono text-[11px] font-bold tabular-nums ${
                node.meanImpact > 0.5 ? (isNegative ? "text-red-500" : "text-emerald-500") :
                node.meanImpact > 0.25 ? "text-amber-500" : "text-[var(--ink-muted)]"
              }`}>
                {Math.round(node.meanImpact * 100)}%
              </span>
              <span className="block text-[7px] font-mono text-[var(--ink-muted)] uppercase">mean</span>
            </div>

            {/* Confidence */}
            <div className="text-right">
              <span className="font-mono text-[10px] tabular-nums text-[var(--ink-muted)]">
                {Math.round(node.p10 * 100)}–{Math.round(node.p90 * 100)}
              </span>
              <span className="block text-[7px] font-mono text-[var(--ink-muted)] uppercase">p10–p90</span>
            </div>

            {/* Hit rate */}
            <div className="text-right">
              <span className="font-mono text-[10px] tabular-nums text-[var(--ink-muted)]">
                {Math.round(node.hitRate * 100)}%
              </span>
              <span className="block text-[7px] font-mono text-[var(--ink-muted)] uppercase">hit rate</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                              */
/* ════════════════════════════════════════════════════════════ */
export function MonteCarloSimulator() {
  const [data, setData] = useState<DepData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeScenario, setActiveScenario] = useState<MCScenario | null>(null);
  const [numRuns, setNumRuns] = useState(500);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<MonteCarloResult | null>(null);
  const [progress, setProgress] = useState(0);

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

  const executeSimulation = useCallback(
    (scenario: MCScenario) => {
      if (!data) return;
      setActiveScenario(scenario);
      setIsRunning(true);
      setResult(null);
      setProgress(0);

      /* Run in chunks using setTimeout to keep UI responsive and show progress */
      const batchSize = 50;
      let completed = 0;

      /* Accumulate all runs then compute final result */
      const allNodeResults: Map<string, { impacts: number[]; depths: number[] }> = new Map();
      for (const n of data.nodes) {
        allNodeResults.set(n.id, { impacts: [], depths: [] });
      }
      const totalAffectedPerRun: number[] = [];

      function runBatch() {
        const batchEnd = Math.min(completed + batchSize, numRuns);

        for (let run = completed; run < batchEnd; run++) {
          const mag = clamp(
            gaussianRandom(scenario.baseMagnitude, scenario.magnitudeVariance),
            0.1,
            1.0
          );
          const runResult = singleRun(scenario.originNode, mag, data!.nodes, data!.edges, scenario.edgeVariance);

          let affected = 0;
          for (const n of data!.nodes) {
            const r = runResult.get(n.id);
            if (r && r.impact > 0.05) {
              allNodeResults.get(n.id)!.impacts.push(r.impact);
              allNodeResults.get(n.id)!.depths.push(r.depth);
              if (r.depth > 0) affected++;
            }
          }
          totalAffectedPerRun.push(affected);
        }

        completed = batchEnd;
        setProgress(Math.round((completed / numRuns) * 100));

        if (completed < numRuns) {
          setTimeout(runBatch, 0);
        } else {
          /* Compile final results */
          const nodeMap = new Map(data!.nodes.map((n) => [n.id, n]));
          const nodeOutcomes: NodeOutcome[] = [];

          for (const [id, acc] of allNodeResults.entries()) {
            if (acc.impacts.length === 0) continue;
            const node = nodeMap.get(id);
            if (!node) continue;

            const sorted = [...acc.impacts].sort((a, b) => a - b);
            const mean = sorted.reduce((s, v) => s + v, 0) / sorted.length;
            const median = sorted[Math.floor(sorted.length / 2)];
            const p10 = sorted[Math.floor(sorted.length * 0.1)] || 0;
            const p90 = sorted[Math.floor(sorted.length * 0.9)] || 0;

            nodeOutcomes.push({
              id,
              label: node.label,
              cluster: node.cluster,
              meanImpact: mean,
              medianImpact: median,
              p10,
              p90,
              hitRate: acc.impacts.length / numRuns,
            });
          }
          nodeOutcomes.sort((a, b) => b.meanImpact - a.meanImpact);

          const clusterGroups: Record<string, NodeOutcome[]> = {};
          for (const no of nodeOutcomes) {
            if (!clusterGroups[no.cluster]) clusterGroups[no.cluster] = [];
            clusterGroups[no.cluster].push(no);
          }

          const clusterOutcomes: ClusterOutcome[] = Object.entries(clusterGroups).map(
            ([cluster, cnodes]) => {
              const meanImpact = cnodes.reduce((s, n) => s + n.meanImpact, 0) / cnodes.length;
              const hitRate = Math.max(...cnodes.map((n) => n.hitRate));
              const accelerationProb = cnodes.filter((n) => n.meanImpact > 0.3).length / cnodes.length;
              const stagnationProb = cnodes.filter((n) => n.meanImpact < 0.1).length / cnodes.length;
              return { cluster, meanImpact, hitRate, accelerationProb, stagnationProb };
            }
          );
          clusterOutcomes.sort((a, b) => b.meanImpact - a.meanImpact);

          setResult({
            scenario: scenario.title,
            runs: numRuns,
            nodeOutcomes,
            clusterOutcomes,
            cascadeDepthDistribution: [],
            avgAffectedNodes: totalAffectedPerRun.reduce((s, v) => s + v, 0) / totalAffectedPerRun.length,
            maxAffectedNodes: Math.max(...totalAffectedPerRun),
            minAffectedNodes: Math.min(...totalAffectedPerRun),
          });
          setIsRunning(false);
        }
      }

      setTimeout(runBatch, 100);
    },
    [data, numRuns]
  );

  if (loading) {
    return <div className="font-mono text-sm opacity-60 animate-pulse">Loading Monte Carlo engine...</div>;
  }
  if (!data) return null;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
          Probabilistic Foresight
        </span>
        <h3 className="font-serif text-2xl text-[var(--text-primary)]">Monte Carlo Strategic Simulation</h3>
        <p className="font-mono text-[11px] text-[var(--ink-tertiary)] max-w-[60ch] mx-auto">
          Runs {numRuns} simulations with randomized parameters — edge strengths, shock magnitude, adoption rates — to produce probability distributions of strategic outcomes
        </p>
      </div>

      {/* Run Count Selector */}
      <div className="flex items-center justify-center gap-4">
        <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink-muted)]">
          Simulation Runs
        </span>
        {[100, 250, 500, 1000].map((n) => (
          <button
            key={n}
            onClick={() => setNumRuns(n)}
            disabled={isRunning}
            className={`
              font-mono text-[11px] px-3 py-1.5 rounded-lg border transition-all
              ${numRuns === n
                ? "border-amber-500/40 bg-amber-500/10 text-amber-500 font-bold"
                : "border-[var(--border-soft)] text-[var(--ink-muted)] hover:bg-[rgba(255,255,255,0.03)]"
              }
              ${isRunning ? "opacity-50 cursor-wait" : ""}
            `}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Scenario Selection */}
      <div className="space-y-4">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
          Strategic Scenarios
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MC_SCENARIOS.map((scenario) => {
            const isActive = activeScenario?.id === scenario.id;
            return (
              <button
                key={scenario.id}
                onClick={() => executeSimulation(scenario)}
                disabled={isRunning}
                className={`
                  text-left p-5 rounded-xl border transition-all duration-300
                  ${isActive
                    ? "ring-2 ring-amber-500/40 border-amber-500/30 bg-amber-500/5 shadow-lg"
                    : "border-[var(--border-soft)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] hover:shadow-md"
                  }
                  ${isRunning ? "opacity-50 cursor-wait" : "cursor-pointer"}
                `}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`font-mono text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${
                    scenario.isNegative
                      ? "bg-red-500/10 border-red-500/30 text-red-500"
                      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                  }`}>
                    {scenario.isNegative ? "THREAT" : "OPPORTUNITY"}
                  </span>
                  <span className="font-mono text-[8px] text-[var(--ink-muted)]">
                    ±{Math.round(scenario.magnitudeVariance * 100)}% variance
                  </span>
                </div>
                <h4 className="font-serif text-sm text-[var(--text-primary)] mb-1">{scenario.title}</h4>
                <p className="text-[10px] leading-relaxed text-[var(--ink-secondary)]">{scenario.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress */}
      {isRunning && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-amber-500 animate-pulse">
              Running {numRuns} simulations...
            </span>
            <span className="font-mono text-[11px] font-bold tabular-nums text-amber-500">
              {progress}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--border-soft)] overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Results */}
      {!isRunning && result && activeScenario && (
        <div className="space-y-10 pt-6 border-t border-[var(--border-soft)]">
          {/* Result header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
                Simulation Complete
              </span>
              <h4 className="font-serif text-lg text-[var(--text-primary)]">{result.scenario}</h4>
            </div>
            <div className="flex items-center gap-4 text-[9px] font-mono text-[var(--ink-muted)] uppercase tracking-widest">
              <span>{result.runs} runs</span>
              <span>±{Math.round(activeScenario.edgeVariance * 100)}% edge variance</span>
              <span>±{Math.round(activeScenario.magnitudeVariance * 100)}% magnitude variance</span>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Avg Nodes Affected",
                value: result.avgAffectedNodes.toFixed(1),
                sub: `range: ${result.minAffectedNodes}–${result.maxAffectedNodes}`,
              },
              {
                label: "Sectors Impacted",
                value: result.clusterOutcomes.filter((c) => c.hitRate > 0.1).length.toString(),
                sub: `of ${result.clusterOutcomes.length} total`,
              },
              {
                label: "High-Impact Nodes",
                value: result.nodeOutcomes.filter((n) => n.meanImpact > 0.3 && n.hitRate > 0.5).length.toString(),
                sub: ">30% mean impact, >50% hit rate",
              },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[var(--border-soft)] text-center">
                <span className={`block font-mono text-xl font-bold tabular-nums ${
                  activeScenario.isNegative ? "text-red-500" : "text-emerald-500"
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

          {/* Cluster Probabilities */}
          <div className="space-y-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
                Sector-Level Probabilities
              </span>
              <p className="font-mono text-[10px] text-[var(--ink-tertiary)] mt-1">
                Probability that each technology sector experiences significant {activeScenario.isNegative ? "degradation" : "acceleration"}
              </p>
            </div>
            <ClusterProbabilities outcomes={result.clusterOutcomes} isNegative={activeScenario.isNegative} />
          </div>

          {/* Node Impact Table */}
          <div className="space-y-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
                Technology-Level Impact Distribution
              </span>
              <p className="font-mono text-[10px] text-[var(--ink-tertiary)] mt-1">
                Per-node mean impact with P10–P90 confidence intervals across {result.runs} runs
              </p>
            </div>
            <div className="p-4 rounded-xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.02)]">
              <NodeImpactTable outcomes={result.nodeOutcomes} isNegative={activeScenario.isNegative} />
            </div>
          </div>

          {/* Strategic Assessment */}
          <div className={`p-6 rounded-xl border space-y-4 ${
            activeScenario.isNegative
              ? "border-red-500/20 bg-red-500/5"
              : "border-emerald-500/20 bg-emerald-500/5"
          }`}>
            <span className={`block font-mono text-[10px] uppercase tracking-[0.05em] font-semibold ${
              activeScenario.isNegative ? "text-red-500" : "text-emerald-500"
            }`}>
              Probabilistic Strategic Assessment
            </span>
            <ul className="space-y-3">
              {result.clusterOutcomes
                .filter((c) => c.accelerationProb > 0.3)
                .map((c) => (
                  <li key={c.cluster} className="flex items-start gap-2">
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                      activeScenario.isNegative ? "bg-red-500" : "bg-emerald-500"
                    }`} />
                    <span className="text-[13px] leading-relaxed text-[var(--text-primary)]">
                      <strong>{c.cluster}</strong>: {Math.round(c.accelerationProb * 100)}% probability of significant{" "}
                      {activeScenario.isNegative ? "degradation" : "acceleration"} (mean impact: {Math.round(c.meanImpact * 100)}%)
                    </span>
                  </li>
                ))}
              <li className="flex items-start gap-2">
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                  activeScenario.isNegative ? "bg-red-500" : "bg-emerald-500"
                }`} />
                <span className="text-[13px] leading-relaxed text-[var(--text-primary)]">
                  Across {result.runs} simulations, an average of <strong>{result.avgAffectedNodes.toFixed(1)} technology nodes</strong> are
                  significantly affected (range: {result.minAffectedNodes}–{result.maxAffectedNodes})
                </span>
              </li>
            </ul>
            <div className="flex items-center gap-6 text-[9px] font-mono text-[var(--ink-muted)] uppercase tracking-widest pt-2 border-t border-[var(--border-soft)]">
              <span>Runs: {result.runs}</span>
              <span>Engine: BFS + Gaussian variance</span>
              <span>Decay: edge_strength × 0.85</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
