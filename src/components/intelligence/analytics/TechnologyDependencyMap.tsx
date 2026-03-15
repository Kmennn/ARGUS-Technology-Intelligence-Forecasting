"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

/* ────── Types ────── */
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

/* ────── Colors ────── */
const CLUSTER_COLORS: Record<string, string> = {
  Semiconductors: "#EC4899",
  AI: "#8B5CF6",
  Autonomy: "#F59E0B",
  Communications: "#10B981",
  Quantum: "#06B6D4",
  Hypersonics: "#EF4444",
  Energy: "#6366F1",
};

const CHAIN_STYLES: Record<string, { border: string; bg: string; text: string }> = {
  CRITICAL: { border: "border-red-500/30", bg: "bg-red-500/5", text: "text-red-500" },
  HIGH: { border: "border-amber-500/30", bg: "bg-amber-500/5", text: "text-amber-500" },
  MEDIUM: { border: "border-sky-500/20", bg: "bg-sky-500/5", text: "text-sky-500" },
  LOW: { border: "border-[var(--border-soft)]", bg: "bg-[rgba(255,255,255,0.02)]", text: "text-[var(--ink-muted)]" },
};

/* ────── Layout: compute positions for nodes ────── */
function computeLayout(nodes: DepNode[]) {
  const levels: Record<number, DepNode[]> = {};
  for (const n of nodes) {
    if (!levels[n.level]) levels[n.level] = [];
    levels[n.level].push(n);
  }

  const width = 900;
  const levelCount = Object.keys(levels).length;
  const levelSpacing = width / (levelCount + 1);
  const positions: Record<string, { x: number; y: number }> = {};

  for (const [lvl, lvlNodes] of Object.entries(levels)) {
    const x = (parseInt(lvl) + 1) * levelSpacing;
    const ySpacing = 360 / (lvlNodes.length + 1);
    lvlNodes.forEach((n, i) => {
      positions[n.id] = { x, y: (i + 1) * ySpacing };
    });
  }

  return positions;
}

/* ────── SVG Graph ────── */
function DependencyGraph({
  nodes,
  edges,
  highlightChain,
}: {
  nodes: DepNode[];
  edges: DepEdge[];
  highlightChain: string[] | null;
}) {
  const positions = useMemo(() => computeLayout(nodes), [nodes]);

  const isHighlighted = useCallback(
    (id: string) => !highlightChain || highlightChain.includes(id),
    [highlightChain]
  );

  const isEdgeHighlighted = useCallback(
    (from: string, to: string) =>
      !highlightChain ||
      (highlightChain.includes(from) && highlightChain.includes(to)),
    [highlightChain]
  );

  return (
    <svg width="100%" viewBox="0 0 900 360" className="overflow-visible">
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="var(--ink-muted)" opacity="0.5" />
        </marker>
        <marker id="arrowhead-hl" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#F59E0B" opacity="0.9" />
        </marker>
      </defs>

      {/* Edges */}
      {edges.map((edge, i) => {
        const from = positions[edge.from];
        const to = positions[edge.to];
        if (!from || !to) return null;

        const hl = isEdgeHighlighted(edge.from, edge.to);
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        const offset = (from.y - to.y) * 0.15;

        return (
          <g key={`edge-${i}`}>
            <path
              d={`M ${from.x} ${from.y} Q ${midX} ${midY + offset} ${to.x} ${to.y}`}
              fill="none"
              stroke={hl && highlightChain ? "#F59E0B" : "var(--ink-muted)"}
              strokeWidth={hl && highlightChain ? 2 : edge.strength * 1.5}
              strokeDasharray={edge.strength < 0.5 ? "4 4" : "none"}
              opacity={hl ? (highlightChain ? 0.9 : 0.25) : 0.08}
              markerEnd={hl && highlightChain ? "url(#arrowhead-hl)" : "url(#arrowhead)"}
              className="transition-all duration-500"
            />
            {/* Relation label on highlighted edges */}
            {hl && highlightChain && (
              <text
                x={midX}
                y={midY + offset - 6}
                textAnchor="middle"
                className="fill-[var(--ink-muted)]"
                style={{ fontSize: "8px", fontFamily: "monospace" }}
              >
                {edge.relation}
              </text>
            )}
          </g>
        );
      })}

      {/* Nodes */}
      {nodes.map((node) => {
        const pos = positions[node.id];
        if (!pos) return null;
        const color = CLUSTER_COLORS[node.cluster] || "#6B7280";
        const hl = isHighlighted(node.id);
        const hasSignal = !!node.signalRef;

        return (
          <g key={node.id} className="transition-all duration-500">
            {/* Node circle */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={hasSignal ? 18 : 14}
              fill={color}
              opacity={hl ? 0.9 : 0.12}
              className="transition-all duration-500"
            />
            {/* Inner dot for active signals */}
            {hasSignal && (
              <circle
                cx={pos.x}
                cy={pos.y}
                r={4}
                fill="white"
                opacity={hl ? 0.9 : 0.3}
              />
            )}
            {/* Label */}
            <text
              x={pos.x}
              y={pos.y + (hasSignal ? 28 : 24)}
              textAnchor="middle"
              className="transition-all duration-500"
              style={{
                fontSize: hasSignal ? "9px" : "8px",
                fontFamily: "monospace",
                fontWeight: hasSignal ? "bold" : "normal",
                fill: hl ? "var(--text-primary)" : "var(--ink-muted)",
                opacity: hl ? 1 : 0.4,
              }}
            >
              {node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ────── Main Component ────── */
export function TechnologyDependencyMap() {
  const [data, setData] = useState<DepData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChain, setActiveChain] = useState<string | null>(null);

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

  const selectedChainPath = useMemo(() => {
    if (!activeChain || !data) return null;
    const chain = data.chains.find((c) => c.id === activeChain);
    return chain?.path || null;
  }, [activeChain, data]);

  if (loading) {
    return <div className="font-mono text-sm opacity-60 animate-pulse">Loading dependency graph...</div>;
  }
  if (!data) return null;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
          Technology Relationships
        </span>
        <h3 className="font-serif text-2xl text-[var(--text-primary)]">Dependency Graph</h3>
        <p className="font-mono text-[11px] text-[var(--ink-tertiary)] max-w-[55ch] mx-auto">
          {data.nodes.length} technology nodes — {data.edges.length} dependency edges — {data.chains.length} strategic chains
        </p>
      </div>

      {/* Graph */}
      <div className="p-4 rounded-2xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.02)] overflow-x-auto">
        <DependencyGraph
          nodes={data.nodes}
          edges={data.edges}
          highlightChain={selectedChainPath}
        />

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 flex-wrap">
          {Object.entries(CLUSTER_COLORS).map(([name, color]) => (
            <div key={name} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--ink-muted)]">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Strategic Chains */}
      <div className="space-y-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
            Strategic Technology Chains
          </span>
          <p className="font-mono text-[11px] text-[var(--ink-tertiary)] mt-1">
            Click a chain to highlight its path in the graph above
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.chains.map((chain) => {
            const style = CHAIN_STYLES[chain.criticality] || CHAIN_STYLES.LOW;
            const isActive = activeChain === chain.id;

            return (
              <button
                key={chain.id}
                onClick={() => setActiveChain(isActive ? null : chain.id)}
                className={`
                  text-left p-5 rounded-xl border transition-all duration-300
                  ${style.border} ${style.bg}
                  ${isActive ? "ring-2 ring-amber-500/40 shadow-lg" : "hover:shadow-md"}
                `}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`font-mono text-[10px] font-bold uppercase tracking-widest ${style.text}`}>
                    {chain.criticality}
                  </span>
                  {isActive && (
                    <span className="text-[9px] font-mono uppercase tracking-widest text-amber-500 animate-pulse">
                      Active
                    </span>
                  )}
                </div>

                <h4 className="font-serif text-lg text-[var(--text-primary)] mb-2">{chain.name}</h4>
                <p className="text-[12px] leading-relaxed text-[var(--ink-secondary)] mb-4">{chain.description}</p>

                {/* Chain path visualization */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {chain.path.map((nodeId, i) => {
                    const node = data.nodes.find((n) => n.id === nodeId);
                    const color = CLUSTER_COLORS[node?.cluster || ""] || "#6B7280";
                    return (
                      <span key={nodeId} className="flex items-center gap-1.5">
                        <span
                          className="px-2 py-0.5 rounded text-[9px] font-mono font-bold text-white"
                          style={{ backgroundColor: color, opacity: 0.8 }}
                        >
                          {node?.label || nodeId}
                        </span>
                        {i < chain.path.length - 1 && (
                          <span className="text-[var(--ink-muted)] text-[10px]">→</span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Impact Analysis */}
      <div className="p-6 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-4">
        <span className="block font-mono text-[10px] uppercase tracking-[0.05em] font-semibold text-amber-500">
          Chain Analysis Insight
        </span>
        <p className="text-[14px] leading-[1.75] text-[var(--text-primary)]">
          The <strong>AI-Autonomy Pipeline</strong> is the highest-criticality chain. Semiconductor advances cascade through AI chips, neuromorphic processors, and edge inference to ultimately enable swarm warfare capabilities. A disruption at any node in this chain would delay the entire capability by 18-36 months. This chain should receive priority monitoring in your Assessment workflow.
        </p>
        <div className="flex items-center gap-6 text-[10px] font-mono text-[var(--ink-muted)] uppercase tracking-widest pt-2">
          <span>Chain length: 6 nodes</span>
          <span>Avg edge strength: 0.89</span>
          <span>Cascade time: ~4.5 years</span>
        </div>
      </div>
    </div>
  );
}
