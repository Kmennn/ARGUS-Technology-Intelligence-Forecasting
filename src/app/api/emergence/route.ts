import { NextResponse } from "next/server";
import { getEmergingSignals } from "@/lib/database/database";

/**
 * GET /api/emergence?limit=20
 * Returns early technology emergence signals sorted by score.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const signals = getEmergingSignals(limit);

    return NextResponse.json({
      count: signals.length,
      signals: signals.map((s) => ({
        technology: s.technology,
        early_signal_score: s.early_signal_score,
        publication_growth: s.publication_growth,
        novelty_score: s.novelty_score,
        cross_domain_links: s.cross_domain_links,
        status: s.status,
        first_detected: s.first_detected,
        updated_at: s.updated_at,
      })),
    });
  } catch (error) {
    console.error("API error fetching emergence data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
