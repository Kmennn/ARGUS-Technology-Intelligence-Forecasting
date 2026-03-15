/* ═══════════════════════════════════════════════════════════════ */
/*  Graph Pruning Engine                                              */
/*  Phase-24: Prevents dependency graph from becoming a "hairball"    */
/*  Applies four pruning rules to keep the knowledge graph clean:     */
/*    1. Minimum co-occurrence threshold                              */
/*    2. Minimum strength threshold                                   */
/*    3. Edge limit per node (top-N only)                             */
/*    4. Temporal decay (monthly weight reduction)                     */
/* ═══════════════════════════════════════════════════════════════ */

export interface PrunableEdge {
  from: string;
  to: string;
  strength: number;
  coOccurrences?: number;
  source?: string;
  relation?: string;
  discoveredAt?: string;
}

export interface PrunableNode {
  id: string;
  label: string;
  cluster: string;
  mentionCount?: number;
  source?: string;
}

export interface PruningConfig {
  /** Remove edges with fewer than this many co-occurrences. Default: 5 */
  minCoOccurrences: number;
  /** Remove edges with strength below this value. Default: 0.25 */
  minStrength: number;
  /** Max edges kept per node (keeps strongest). Default: 10 */
  maxEdgesPerNode: number;
  /** Monthly decay factor applied to edge weights. Default: 0.95 */
  temporalDecayFactor: number;
}

export interface PruningResult {
  nodes: PrunableNode[];
  edges: PrunableEdge[];
  stats: {
    originalNodes: number;
    originalEdges: number;
    prunedNodes: number;
    prunedEdges: number;
    removedEdges: number;
    removedOrphans: number;
    decayApplied: boolean;
  };
}

const DEFAULT_CONFIG: PruningConfig = {
  minCoOccurrences: 5,
  minStrength: 0.25,
  maxEdgesPerNode: 10,
  temporalDecayFactor: 0.95,
};

/**
 * Main entry point: prunes a dependency graph using all four rules.
 * Returns cleaned graph + pruning statistics.
 */
export function pruneGraph(
  nodes: PrunableNode[],
  edges: PrunableEdge[],
  config: Partial<PruningConfig> = {}
): PruningResult {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  const originalNodes = nodes.length;
  const originalEdges = edges.length;

  let prunedEdges = [...edges];

  // Rule 1: Minimum co-occurrence threshold
  prunedEdges = applyMinCoOccurrence(prunedEdges, cfg.minCoOccurrences);

  // Rule 2: Temporal decay (before strength check)
  const decayApplied = applyTemporalDecay(prunedEdges, cfg.temporalDecayFactor);

  // Rule 3: Minimum strength threshold (after decay)
  prunedEdges = applyMinStrength(prunedEdges, cfg.minStrength);

  // Rule 4: Edge limit per node (keep top-N strongest)
  prunedEdges = applyEdgeLimitPerNode(prunedEdges, cfg.maxEdgesPerNode);

  // Remove orphan nodes (nodes with no remaining edges)
  const connectedNodeIds = new Set<string>();
  for (const edge of prunedEdges) {
    connectedNodeIds.add(edge.from);
    connectedNodeIds.add(edge.to);
  }

  // Keep nodes that either have edges OR are from static data (always preserved)
  const prunedNodes = nodes.filter(
    (n) => connectedNodeIds.has(n.id) || n.source === "static"
  );

  return {
    nodes: prunedNodes,
    edges: prunedEdges,
    stats: {
      originalNodes,
      originalEdges,
      prunedNodes: prunedNodes.length,
      prunedEdges: prunedEdges.length,
      removedEdges: originalEdges - prunedEdges.length,
      removedOrphans: originalNodes - prunedNodes.length,
      decayApplied,
    },
  };
}

/* ─── Rule 1: Minimum Co-occurrence ─── */

/**
 * Removes edges that appeared fewer than `minCount` times.
 * Static edges (no coOccurrences field) are always preserved.
 */
function applyMinCoOccurrence(edges: PrunableEdge[], minCount: number): PrunableEdge[] {
  return edges.filter((e) => {
    // Static edges without co-occurrence data are always kept
    if (e.coOccurrences === undefined || e.source === "static") return true;
    return e.coOccurrences >= minCount;
  });
}

/* ─── Rule 2: Temporal Decay ─── */

/**
 * Applies monthly decay to edge weights based on discoveredAt timestamp.
 * Edges lose `(1 - decayFactor)` strength per month since discovery.
 * Mutates edges in place for performance. Returns true if decay was applied.
 */
function applyTemporalDecay(edges: PrunableEdge[], decayFactor: number): boolean {
  const now = Date.now();
  let applied = false;

  for (const edge of edges) {
    if (!edge.discoveredAt || edge.source === "static") continue;

    const discoveredMs = new Date(edge.discoveredAt).getTime();
    if (isNaN(discoveredMs)) continue;

    const monthsElapsed = Math.max(0, (now - discoveredMs) / (30.44 * 24 * 60 * 60 * 1000));

    if (monthsElapsed > 0) {
      edge.strength = Math.round(edge.strength * Math.pow(decayFactor, monthsElapsed) * 1000) / 1000;
      applied = true;
    }
  }

  return applied;
}

/* ─── Rule 3: Minimum Strength ─── */

/**
 * Removes edges with strength below the threshold.
 */
function applyMinStrength(edges: PrunableEdge[], minStrength: number): PrunableEdge[] {
  return edges.filter((e) => e.strength >= minStrength);
}

/* ─── Rule 4: Edge Limit Per Node ─── */

/**
 * For each node, keeps only the top-N strongest edges.
 * This prevents hub nodes from dominating the graph.
 */
function applyEdgeLimitPerNode(edges: PrunableEdge[], maxEdges: number): PrunableEdge[] {
  // Count edges per node, keeping the strongest
  const nodeEdges = new Map<string, PrunableEdge[]>();

  for (const edge of edges) {
    if (!nodeEdges.has(edge.from)) nodeEdges.set(edge.from, []);
    if (!nodeEdges.has(edge.to)) nodeEdges.set(edge.to, []);
    nodeEdges.get(edge.from)!.push(edge);
    nodeEdges.get(edge.to)!.push(edge);
  }

  // For each node, mark which edges to keep (top-N by strength)
  const keptEdges = new Set<PrunableEdge>();

  for (const [, nodeEdgeList] of nodeEdges) {
    const sorted = [...nodeEdgeList].sort((a, b) => b.strength - a.strength);
    const toKeep = sorted.slice(0, maxEdges);
    for (const edge of toKeep) {
      keptEdges.add(edge);
    }
  }

  return [...keptEdges];
}
