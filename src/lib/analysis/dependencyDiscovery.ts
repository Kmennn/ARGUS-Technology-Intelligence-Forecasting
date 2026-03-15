/* ═══════════════════════════════════════════════════════════════ */
/*  Dependency Discovery Engine                                      */
/*  Scans ingested research corpus for technology co-occurrences     */
/*  Builds weighted relationship graph automatically                 */
/* ═══════════════════════════════════════════════════════════════ */

import { getDb } from "@/lib/database/database";
import { detectTechnologies } from "@/lib/ingestion/signalEngine";

/* ─── Types ─── */
export interface DiscoveredEdge {
  from: string;
  to: string;
  strength: number;
  coOccurrences: number;
  relation: string;
  sources: string[];
  discoveredAt: string;
}

export interface DiscoveredNode {
  id: string;
  label: string;
  cluster: string;
  mentionCount: number;
}

export interface DiscoveryResult {
  nodes: DiscoveredNode[];
  edges: DiscoveredEdge[];
  corpusSize: number;
  discoveredAt: string;
}

/* ─── Co-occurrence Matrix ─── */
interface CoOccurrence {
  count: number;
  sources: Set<string>;
}

/**
 * Scan the raw_sources corpus and detect technology co-occurrences.
 * Returns discovered dependency relationships.
 */
export function discoverDependencies(minCoOccurrences = 2, minStrength = 0.3): DiscoveryResult {
  const db = getDb();

  // Load all raw sources (processed and unprocessed)
  const allSources = db.prepare(
    "SELECT id, title, raw_data, fetcher FROM raw_sources"
  ).all() as Array<{ id: number; title: string | null; raw_data: string; fetcher: string }>;

  // Also scan signals for their summaries and evidence
  const allSignals = db.prepare(
    "SELECT id, technology, cluster, title, summary, evidence_base FROM signals"
  ).all() as Array<{ id: string; technology: string; cluster: string; title: string; summary: string | null; evidence_base: string | null }>;

  // Track tech mentions per document and co-occurrences
  const techMentions = new Map<string, { cluster: string; count: number }>();
  const coOccurrenceMatrix = new Map<string, CoOccurrence>();
  let corpusSize = 0;

  // Process raw sources
  for (const source of allSources) {
    try {
      const raw = JSON.parse(source.raw_data);
      const text = `${raw.title || ""} ${raw.abstract || ""}`;
      if (text.trim().length < 20) continue;

      const techs = detectTechnologies(text);
      if (techs.length < 1) continue;
      corpusSize++;

      // Count mentions
      for (const tech of techs) {
        const existing = techMentions.get(tech.technology) || { cluster: tech.cluster, count: 0 };
        existing.count++;
        techMentions.set(tech.technology, existing);
      }

      // Record co-occurrences (pairwise)
      if (techs.length >= 2) {
        for (let i = 0; i < techs.length; i++) {
          for (let j = i + 1; j < techs.length; j++) {
            const pair = [techs[i].technology, techs[j].technology].sort();
            const key = `${pair[0]}||${pair[1]}`;
            const existing = coOccurrenceMatrix.get(key) || { count: 0, sources: new Set<string>() };
            existing.count++;
            existing.sources.add(source.fetcher);
            coOccurrenceMatrix.set(key, existing);
          }
        }
      }
    } catch {
      // skip invalid sources
    }
  }

  // Also process signal summaries
  for (const sig of allSignals) {
    const text = `${sig.title} ${sig.summary || ""} ${sig.evidence_base || ""}`;
    const techs = detectTechnologies(text);
    if (techs.length < 1) continue;
    corpusSize++;

    for (const tech of techs) {
      const existing = techMentions.get(tech.technology) || { cluster: tech.cluster, count: 0 };
      existing.count++;
      techMentions.set(tech.technology, existing);
    }

    if (techs.length >= 2) {
      for (let i = 0; i < techs.length; i++) {
        for (let j = i + 1; j < techs.length; j++) {
          const pair = [techs[i].technology, techs[j].technology].sort();
          const key = `${pair[0]}||${pair[1]}`;
          const existing = coOccurrenceMatrix.get(key) || { count: 0, sources: new Set<string>() };
          existing.count++;
          existing.sources.add("signal");
          coOccurrenceMatrix.set(key, existing);
        }
      }
    }
  }

  // Build discovered nodes
  const nodes: DiscoveredNode[] = Array.from(techMentions.entries())
    .map(([tech, data]) => ({
      id: techToId(tech),
      label: capitalizeWords(tech),
      cluster: data.cluster,
      mentionCount: data.count,
    }))
    .sort((a, b) => b.mentionCount - a.mentionCount);

  // Build discovered edges from co-occurrence
  const edges: DiscoveredEdge[] = [];

  for (const [key, data] of coOccurrenceMatrix) {
    if (data.count < minCoOccurrences) continue;

    const [techA, techB] = key.split("||");
    const mentionsA = techMentions.get(techA)?.count || 1;
    const mentionsB = techMentions.get(techB)?.count || 1;

    // Jaccard-like strength: co-occurrences / min(mentions_a, mentions_b)
    const strength = Math.min(0.95, data.count / Math.min(mentionsA, mentionsB));

    if (strength < minStrength) continue;

    // Infer relation direction: higher-mention tech → lower-mention tech
    const [from, to] = mentionsA >= mentionsB ? [techA, techB] : [techB, techA];

    edges.push({
      from: techToId(from),
      to: techToId(to),
      strength: Math.round(strength * 100) / 100,
      coOccurrences: data.count,
      relation: inferRelation(from, to, strength),
      sources: Array.from(data.sources),
      discoveredAt: new Date().toISOString(),
    });
  }

  // Sort by strength descending
  edges.sort((a, b) => b.strength - a.strength);

  return {
    nodes,
    edges,
    corpusSize,
    discoveredAt: new Date().toISOString(),
  };
}

/**
 * Merge discovered dependencies with static dependency data.
 */
export function mergeWithStatic(
  staticData: { nodes: Array<{ id: string; label: string; cluster: string; level?: number; signalRef?: string }>; edges: Array<{ from: string; to: string; relation: string; strength: number }>; chains: unknown[] },
  discovered: DiscoveryResult
): {
  nodes: Array<{ id: string; label: string; cluster: string; level?: number; signalRef?: string; source: string; mentionCount?: number }>;
  edges: Array<{ from: string; to: string; relation: string; strength: number; source: string; coOccurrences?: number }>;
  chains: unknown[];
  discoveryStats: { corpusSize: number; discoveredNodes: number; discoveredEdges: number; mergedAt: string };
} {
  const nodeMap = new Map<string, { id: string; label: string; cluster: string; level?: number; signalRef?: string; source: string; mentionCount?: number }>();
  const edgeMap = new Map<string, { from: string; to: string; relation: string; strength: number; source: string; coOccurrences?: number }>();

  // Add static nodes
  for (const node of staticData.nodes) {
    nodeMap.set(node.id, { ...node, source: "static" });
  }

  // Add discovered nodes (merge if exists)
  for (const node of discovered.nodes) {
    if (nodeMap.has(node.id)) {
      const existing = nodeMap.get(node.id)!;
      existing.source = "merged";
      existing.mentionCount = node.mentionCount;
    } else {
      nodeMap.set(node.id, { ...node, source: "discovered", mentionCount: node.mentionCount });
    }
  }

  // Add static edges
  for (const edge of staticData.edges) {
    const key = `${edge.from}→${edge.to}`;
    edgeMap.set(key, { ...edge, source: "static" });
  }

  // Add discovered edges (merge — use higher strength)
  for (const edge of discovered.edges) {
    const key = `${edge.from}→${edge.to}`;
    const reverseKey = `${edge.to}→${edge.from}`;

    if (edgeMap.has(key)) {
      const existing = edgeMap.get(key)!;
      existing.strength = Math.max(existing.strength, edge.strength);
      existing.source = "merged";
      existing.coOccurrences = edge.coOccurrences;
    } else if (edgeMap.has(reverseKey)) {
      const existing = edgeMap.get(reverseKey)!;
      existing.strength = Math.max(existing.strength, edge.strength);
      existing.source = "merged";
      existing.coOccurrences = edge.coOccurrences;
    } else {
      // Ensure both nodes exist before adding edge
      if (nodeMap.has(edge.from) && nodeMap.has(edge.to)) {
        edgeMap.set(key, {
          from: edge.from,
          to: edge.to,
          relation: edge.relation,
          strength: edge.strength,
          source: "discovered",
          coOccurrences: edge.coOccurrences,
        });
      }
    }
  }

  return {
    nodes: Array.from(nodeMap.values()),
    edges: Array.from(edgeMap.values()).sort((a, b) => b.strength - a.strength),
    chains: staticData.chains,
    discoveryStats: {
      corpusSize: discovered.corpusSize,
      discoveredNodes: discovered.nodes.length,
      discoveredEdges: discovered.edges.length,
      mergedAt: new Date().toISOString(),
    },
  };
}

/* ─── Helpers ─── */

function techToId(tech: string): string {
  return tech
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

function inferRelation(from: string, to: string, strength: number): string {
  if (strength > 0.8) return "strongly co-occurs";
  if (strength > 0.6) return "frequently co-occurs";
  if (strength > 0.4) return "relates to";
  return "occasionally co-occurs";
}
