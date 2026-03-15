import { NextResponse } from "next/server";
import { getMomentumAggregated, getTopOrganizations } from "@/lib/database/database";

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

    const aggregated = getMomentumAggregated(conceptName);
    const leaders = getTopOrganizations(conceptName);

    return NextResponse.json({
      technology: conceptName,
      regions: aggregated.map(r => ({ country: r.country, momentum: r.momentum })),
      organizations: leaders.map(l => ({ name: l.name, country: l.country, output_count: l.output_count }))
    });

  } catch (error) {
    console.error("API error fetching momentum data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
