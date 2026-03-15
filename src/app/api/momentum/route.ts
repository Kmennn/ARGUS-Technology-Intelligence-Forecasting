import { NextResponse } from "next/server";
import { getMomentumByConcept, getActorsByConcept } from "@/lib/database/database";

/**
 * GET /api/momentum?concept=TechnologyName
 * Returns innovation momentum scoring by region and top organizations for a given technology concept.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const conceptName = searchParams.get("concept");

    if (!conceptName) {
      return NextResponse.json({ error: "Missing 'concept' query parameter" }, { status: 400 });
    }

    // 1. Fetch dynamic momentum scoring by region over time
    const momentumRecords = getMomentumByConcept(conceptName);

    // Grouping into recent heatmap
    const regionScores: Record<string, { momentum: number, papers: number, patents: number }> = {};
    for (const record of momentumRecords) {
      if (!regionScores[record.region]) {
        regionScores[record.region] = { momentum: 0, papers: 0, patents: 0 };
      }
      regionScores[record.region].momentum = Math.max(regionScores[record.region].momentum, record.momentum_score);
      regionScores[record.region].papers += record.research_count;
      regionScores[record.region].patents += record.patent_count;
    }

    // 2. Fetch top actors (organizations / universities)
    const actors = getActorsByConcept(conceptName);

    // Filter out unknown entities to keep signal high
    const topOrganizations = actors
      .filter(a => a.organization && a.organization !== "Unknown" && a.organization.length > 2)
      .slice(0, 5)
      .map(a => ({
        name: a.organization,
        country: a.country,
        output_count: a.paper_count + a.patent_count,
        citations: a.citations
      }));

    return NextResponse.json({
      concept: conceptName,
      regional_momentum: regionScores,
      leading_organizations: topOrganizations,
      historical_trend: momentumRecords.map(m => ({ year: m.year, region: m.region, score: m.momentum_score }))
    });

  } catch (error) {
    console.error("API error fetching momentum data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
