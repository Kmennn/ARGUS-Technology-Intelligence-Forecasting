import { getAllSignals, getActiveAlerts, seedFromStaticData } from "@/lib/database/database";

/**
 * GET /api/signals/live
 * SSE endpoint for real-time signal and alert updates.
 * Clients connect and receive periodic updates.
 */
export async function GET() {
  // Ensure DB is seeded
  seedFromStaticData();

  const encoder = new TextEncoder();
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial snapshot
      const sendSnapshot = () => {
        try {
          const signals = getAllSignals();
          const alerts = getActiveAlerts(20);

          const event = {
            type: "snapshot",
            timestamp: new Date().toISOString(),
            signals: signals.slice(0, 20).map((s) => ({
              id: s.id,
              technology: s.technology,
              cluster: s.cluster,
              priorityScore: s.priority_score,
              trl: s.trl,
              confidence: s.confidence,
              velocity: s.velocity,
              trendDirection: s.trend_direction,
            })),
            alerts: alerts.map((a) => ({
              id: a.id,
              type: a.alert_type,
              technology: a.technology,
              severity: a.severity,
              confidence: a.confidence,
              metric: a.metric,
              value: a.value,
              createdAt: a.created_at,
            })),
            stats: {
              totalSignals: signals.length,
              criticalAlerts: alerts.filter((a) => a.severity === "CRITICAL").length,
              warningAlerts: alerts.filter((a) => a.severity === "WARNING").length,
              clusters: [...new Set(signals.map((s) => s.cluster))].length,
            },
          };

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          );
        } catch {
          // Ignore errors during stream
        }
      };

      // Send initial data
      sendSnapshot();

      // Send updates every 30 seconds
      intervalId = setInterval(sendSnapshot, 30000);
    },
    cancel() {
      if (intervalId) clearInterval(intervalId);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
