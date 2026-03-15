import { NextResponse } from "next/server";
import { generateBrief, formatBriefAsMarkdown } from "@/lib/reports/briefGenerator";
import { seedFromStaticData } from "@/lib/database/database";

/**
 * GET /api/reports/brief
 * Returns the latest strategic intelligence brief.
 * Query: ?format=markdown for Markdown format, default is JSON.
 */
export async function GET(request: Request) {
  try {
    seedFromStaticData();

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format");

    const brief = generateBrief();

    if (format === "markdown") {
      const md = formatBriefAsMarkdown(brief);
      return new Response(md, {
        headers: {
          "Content-Type": "text/markdown",
          "Content-Disposition": `attachment; filename="argus-brief-${brief.period.replace(/\s+/g, "-")}.md"`,
        },
      });
    }

    return NextResponse.json(brief);
  } catch (error) {
    console.error("Brief generation error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
