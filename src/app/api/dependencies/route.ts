import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { discoverDependencies, mergeWithStatic } from "@/lib/analysis/dependencyDiscovery";
import { pruneGraph } from "@/lib/analysis/graphPruner";
import { seedFromStaticData, getSignalCount } from "@/lib/database/database";

/**
 * GET /api/dependencies
 * Returns dependency graph — merges static structure with auto-discovered relationships.
 * Query: ?mode=static (original only) | ?mode=discovered (discovered only) | default: merged
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "merged";

    // Load static dependency data
    const dataPath = path.join(process.cwd(), "data", "dependencies.json");
    const fileContents = fs.readFileSync(dataPath, "utf8");
    const staticData = JSON.parse(fileContents);

    if (mode === "static") {
      return NextResponse.json(staticData);
    }

    // Ensure database is seeded for discovery
    seedFromStaticData();

    const dbCount = getSignalCount();

    if (dbCount === 0 && mode !== "discovered") {
      // No data in DB yet — return static only
      return NextResponse.json(staticData);
    }

    // Run dependency discovery
    const discovered = discoverDependencies(2, 0.3);

    if (mode === "discovered") {
      return NextResponse.json({
        ...discovered,
        note: "These relationships were automatically discovered from the research corpus.",
      });
    }

    // Default: merge static + discovered, then prune
    const merged = mergeWithStatic(staticData, discovered);

    // Phase-24: Apply graph pruning to prevent hairball
    const pruned = pruneGraph(merged.nodes, merged.edges, {
      minCoOccurrences: 5,
      minStrength: 0.25,
      maxEdgesPerNode: 10,
      temporalDecayFactor: 0.95,
    });

    return NextResponse.json({
      nodes: pruned.nodes,
      edges: pruned.edges,
      chains: merged.chains,
      discoveryStats: merged.discoveryStats,
      pruningStats: pruned.stats,
    });
  } catch (error) {
    console.error("Failed to load dependency data:", error);
    return NextResponse.json({ error: "Failed to load dependency data" }, { status: 500 });
  }
}

