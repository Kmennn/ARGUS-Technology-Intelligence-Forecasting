import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getAllSignals, seedFromStaticData, getSignalCount } from "@/lib/database/database";

/**
 * GET /api/intelligence
 * Returns intelligence signals — from SQLite if available, falls back to static JSON.
 */
export async function GET() {
  try {
    // Seed database from static data if empty
    seedFromStaticData();

    const dbCount = getSignalCount();

    if (dbCount > 0) {
      // Read from SQLite database
      const signals = getAllSignals();

      // Transform to match existing frontend format
      const formatted = signals.map((s) => ({
        id: s.id,
        signal: s.technology,
        trl: s.trl,
        confidence: s.confidence,
        volatility: s.volatility,
        priority: s.priority_score >= 90 ? "CRITICAL" : s.priority_score >= 75 ? "HIGH" : s.priority_score >= 50 ? "MEDIUM" : "LOW",
        priorityScore: s.priority_score <= 1 ? s.priority_score : s.priority_score / 100,
        priorityDrivers: JSON.parse(s.priority_drivers || "[]"),
        scoreHistory: JSON.parse(s.score_history || "[]"),
        impactDomains: JSON.parse(s.impact_domains || "[]"),
        technologyCluster: s.cluster,
        strategicNotes: s.strategic_notes || s.summary || "",
        evidenceBase: s.evidence_base || "",
        bottlenecks: s.bottlenecks || "",
        lastUpdated: s.last_updated,
        sourceCount: s.source_count,
        trendDirection: s.trend_direction,
        sourceType: s.source_type,
      }));

      return NextResponse.json(formatted);
    }

    // Fallback: static JSON
    const dataPath = path.join(process.cwd(), "data", "intelligence.json");
    const fileContents = fs.readFileSync(dataPath, "utf8");
    const intelligenceData = JSON.parse(fileContents);
    return NextResponse.json(intelligenceData);
  } catch (error) {
    console.error("Failed to load intelligence data:", error);
    return NextResponse.json({ error: "Failed to load intelligence data" }, { status: 500 });
  }
}
