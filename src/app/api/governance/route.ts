import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { ESCALATION_HISTORY, EscalationEvent } from "@/lib/horizonEngine";

const dataFilePath = path.join(process.cwd(), "data", "governance.json");
let lastWriteTimestamp = 0;

async function getGovernanceData() {
  try {
    const fileContents = await fs.readFile(dataFilePath, "utf8");
    const data = JSON.parse(fileContents);
    return data.events || [];
  } catch (_error) {
    // If file doesn't exist or is invalid, use the baseline history
    return ESCALATION_HISTORY;
  }
}

export async function GET() {
  const events = await getGovernanceData();
  return NextResponse.json(events);
}

export async function POST(request: Request) {
  try {
    // Fix #3: Enforce role authorization on governance writes
    const role = request.headers.get("X-ARGUS-ROLE");
    if (role !== "Allocator" && role !== "Admin") {
      return NextResponse.json(
        { error: "Unauthorized. Allocator or Admin role required for governance writes." },
        { status: 403 }
      );
    }

    // Fix #4: Basic rate limiting (1 write per 5 seconds)
    const now = Date.now();
    if (now - lastWriteTimestamp < 5000) {
      return NextResponse.json(
        { error: "Rate limited. Minimum 5 seconds between governance writes." },
        { status: 429 }
      );
    }

    const body = await request.json();
    // 3. Lock the Schema: Validate required fields for institutional integrity
    if (!body.cycleId || !body.governanceTrace || typeof body.projectedWithoutIntervention !== 'number' || typeof body.actualRecoveryTime !== 'number') {
      return NextResponse.json(
        { error: "Invalid governance event payload. Missing required institutional fields." },
        { status: 400 }
      );
    }

    const events = await getGovernanceData();

    // 2. Generate eventId Server-Side
    const serverEventId = crypto.randomUUID();

    // 1. Enforce Append-Only Writes: Prevent cycle ID duplication in history
    if (events.some((e: EscalationEvent) => e.cycleId === body.cycleId)) {
      return NextResponse.json(
        { error: "Duplicate event. Cycle ID already exists in institutional memory." },
        { status: 409 }
      );
    }

    // Append (immutable)
    events.push({
      ...body,
      eventId: serverEventId,
      // Ensure server timestamp
      timestamp: new Date().toISOString()
    });

    // Ensure data directory exists
    try {
      await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    } catch (_e) {
      // Ignore directory exists error
    }

    // Write back
    // To prevent race conditions, a full lock is ideal, but for the prototype `fs.writeFile` is sufficient as it replaces atomically.
    await fs.writeFile(
      dataFilePath,
      JSON.stringify({ events }, null, 2),
      "utf8"
    );

    lastWriteTimestamp = Date.now();

    return NextResponse.json({ success: true, eventId: serverEventId, totalEvents: events.length }, { status: 201 });
  } catch (error) {
    console.error("Failed to write governance event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
