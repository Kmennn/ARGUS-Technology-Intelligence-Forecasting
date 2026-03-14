import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { SEED_DECISIONS, DecisionEvent } from "@/lib/decisionLedger";

const dataFilePath = path.join(process.cwd(), "data", "decisions.json");
let lastWriteTimestamp = 0;

async function getDecisionData(): Promise<DecisionEvent[]> {
  try {
    const fileContents = await fs.readFile(dataFilePath, "utf8");
    const data = JSON.parse(fileContents);
    return data.decisions || [];
  } catch {
    // Initialize with seed data on first access
    const seeded: DecisionEvent[] = SEED_DECISIONS.map((d) => ({
      ...d,
      decisionId: crypto.randomUUID(),
    }));
    // Persist the seed so subsequent reads are consistent
    try {
      await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
      await fs.writeFile(
        dataFilePath,
        JSON.stringify({ decisions: seeded }, null, 2),
        "utf8"
      );
    } catch {
      // Ignore write errors during init
    }
    return seeded;
  }
}

export async function GET() {
  const decisions = await getDecisionData();
  return NextResponse.json(decisions);
}

export async function POST(request: Request) {
  try {
    // Enforce role authorization
    const role = request.headers.get("X-ARGUS-ROLE");
    if (role !== "Allocator" && role !== "Admin") {
      return NextResponse.json(
        { error: "Unauthorized. Allocator or Admin role required for decision logging." },
        { status: 403 }
      );
    }

    // Rate limiting
    const now = Date.now();
    if (now - lastWriteTimestamp < 2000) {
      return NextResponse.json(
        { error: "Rate limited. Minimum 2 seconds between decision writes." },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Schema validation
    if (!body.cycleId || !body.action || !body.stateBefore || !body.actor || !body.role) {
      return NextResponse.json(
        { error: "Invalid decision payload. Missing required fields." },
        { status: 400 }
      );
    }

    const decisions = await getDecisionData();

    const serverDecisionId = crypto.randomUUID();

    decisions.push({
      ...body,
      decisionId: serverDecisionId,
      timestamp: new Date().toISOString(),
    });

    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    await fs.writeFile(
      dataFilePath,
      JSON.stringify({ decisions }, null, 2),
      "utf8"
    );

    lastWriteTimestamp = Date.now();

    return NextResponse.json(
      { success: true, decisionId: serverDecisionId, totalDecisions: decisions.length },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to write decision event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
