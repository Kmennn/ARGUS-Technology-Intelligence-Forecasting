import { NextResponse } from "next/server";
import { runFullIngestion, runIngestionCycle } from "@/lib/ingestion/ingestionPipeline";
import { seedFromStaticData } from "@/lib/database/database";

/**
 * POST /api/ingest
 * Triggers a manual ingestion cycle.
 * Body: { fetcher?: "arxiv" | "crossref" | "patent" | "news" }
 * If no fetcher specified, runs all.
 */
export async function POST(request: Request) {
  try {
    // Ensure database is seeded with static data first
    const seedResult = seedFromStaticData();

    const body = await request.json().catch(() => ({}));
    const fetcherName = body?.fetcher;

    let results;
    if (fetcherName && ["arxiv", "crossref", "patent", "news"].includes(fetcherName)) {
      const result = await runIngestionCycle(fetcherName);
      results = [result];
    } else {
      results = await runFullIngestion();
    }

    return NextResponse.json({
      success: true,
      seeded: seedResult.seeded,
      results,
      summary: {
        totalFetched: results.reduce((s, r) => s + r.fetched, 0),
        totalSignalsCreated: results.reduce((s, r) => s + r.signalsCreated, 0),
        totalSignalsUpdated: results.reduce((s, r) => s + r.signalsUpdated, 0),
        totalDurationMs: results.reduce((s, r) => s + r.durationMs, 0),
        errors: results.flatMap((r) => r.errors),
      },
    });
  } catch (error) {
    console.error("Ingestion error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ingest
 * Returns ingestion status and capabilities.
 */
export async function GET() {
  return NextResponse.json({
    available_fetchers: ["arxiv", "crossref", "patent", "news"],
    usage: "POST with { fetcher: 'arxiv' } or empty body for all",
    schedule: {
      arxiv: "every 6 hours",
      crossref: "every 6 hours",
      patent: "daily",
      news: "hourly",
    },
  });
}
