/* ═══════════════════════════════════════════════════════════════ */
/*  Ingestion Scheduler                                              */
/*  Background cron-based data fetching                              */
/*  NOTE: In serverless (Vercel etc), use /api/ingest manually       */
/*  or set up external cron triggers.                                */
/* ═══════════════════════════════════════════════════════════════ */

import cron from "node-cron";
import { runIngestionCycle } from "@/lib/ingestion/ingestionPipeline";
import { seedFromStaticData } from "@/lib/database/database";
import { updateMomentumScores } from "@/lib/analysis/momentumEngine";
import { runEmergenceDetection } from "@/lib/analysis/emergenceDetector";

let scheduled = false;

/**
 * Start the ingestion scheduler.
 * Safe to call multiple times — only starts once.
 */
export function startScheduler(): void {
  if (scheduled) return;
  scheduled = true;

  // Ensure database is initialized
  seedFromStaticData();

  console.log("[ARGUS Scheduler] Starting ingestion schedules...");

  // News feeds: every hour at minute 15
  cron.schedule("15 * * * *", async () => {
    console.log("[ARGUS Scheduler] Running news ingestion...");
    try {
      const result = await runIngestionCycle("news");
      console.log(`[ARGUS Scheduler] News: fetched=${result.fetched}, created=${result.signalsCreated}`);
    } catch (err) {
      console.error("[ARGUS Scheduler] News ingestion failed:", err);
    }
  });

  // Research feeds (arXiv + CrossRef): every 6 hours
  cron.schedule("0 */6 * * *", async () => {
    console.log("[ARGUS Scheduler] Running research ingestion...");
    try {
      const arxivResult = await runIngestionCycle("arxiv");
      console.log(`[ARGUS Scheduler] arXiv: fetched=${arxivResult.fetched}, created=${arxivResult.signalsCreated}`);

      const crossrefResult = await runIngestionCycle("crossref");
      console.log(`[ARGUS Scheduler] CrossRef: fetched=${crossrefResult.fetched}, created=${crossrefResult.signalsCreated}`);
    } catch (err) {
      console.error("[ARGUS Scheduler] Research ingestion failed:", err);
    }
  });

  // Patent data: daily at 03:00
  cron.schedule("0 3 * * *", async () => {
    console.log("[ARGUS Scheduler] Running patent ingestion...");
    try {
      const result = await runIngestionCycle("patent");
      console.log(`[ARGUS Scheduler] Patents: fetched=${result.fetched}, created=${result.signalsCreated}`);
    } catch (err) {
      console.error("[ARGUS Scheduler] Patent ingestion failed:", err);
    }
  });

  // Momentum Updates: daily at 02:00
  cron.schedule("0 2 * * *", async () => {
    console.log("[ARGUS Scheduler] Running momentum scoring updates...");
    try {
      await updateMomentumScores();
      console.log("[ARGUS Scheduler] Momentum scores updated.");
    } catch (err) {
      console.error("[ARGUS Scheduler] Momentum update failed:", err);
    }
  });

  // Emergence Detection: daily at 02:30 (after momentum recalculation)
  cron.schedule("30 2 * * *", () => {
    console.log("[ARGUS Scheduler] Running emergence detection...");
    try {
      const results = runEmergenceDetection();
      console.log(`[ARGUS Scheduler] Emergence: ${results.length} signals detected.`);
    } catch (err) {
      console.error("[ARGUS Scheduler] Emergence detection failed:", err);
    }
  });

  console.log("[ARGUS Scheduler] Schedules active:");
  console.log("  News:      every hour at :15");
  console.log("  Research:  every 6 hours at :00");
  console.log("  Patents:   daily at 03:00");
  console.log("  Momentum:  daily at 02:00");
  console.log("  Emergence: daily at 02:30");
}

/**
 * Check if scheduler is running.
 */
export function isSchedulerRunning(): boolean {
  return scheduled;
}
