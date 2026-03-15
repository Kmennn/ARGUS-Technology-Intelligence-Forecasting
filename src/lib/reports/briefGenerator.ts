/* ═══════════════════════════════════════════════════════════════ */
/*  Intelligence Brief Generator                                     */
/*  Automated weekly strategic intelligence reports                  */
/* ═══════════════════════════════════════════════════════════════ */

import { getAllSignals, getActiveAlerts, getRecentIngestionLogs } from "@/lib/database/database";

export interface StrategicBrief {
  title: string;
  generatedAt: string;
  period: string;
  summary: {
    totalSignals: number;
    newSignals: number;
    activeAlerts: number;
    criticalAlerts: number;
    clustersActive: number;
  };
  breakoutSignals: Array<{
    technology: string;
    cluster: string;
    velocity: string;
    priority: number;
    trl: number;
  }>;
  clusterActivity: Array<{
    cluster: string;
    signalCount: number;
    avgPriority: number;
    status: string;
  }>;
  timelineChanges: Array<{
    technology: string;
    change: string;
  }>;
  ingestionStats: {
    totalRuns: number;
    totalRecords: number;
    totalSignalsCreated: number;
  };
  recommendations: string[];
}

/**
 * Generate a strategic intelligence brief.
 */
export function generateBrief(): StrategicBrief {
  const signals = getAllSignals();
  const alerts = getActiveAlerts(100);
  const logs = getRecentIngestionLogs(50);
  const now = new Date();

  // Cluster analysis
  const clusterMap = new Map<string, { count: number; totalPriority: number }>();
  for (const sig of signals) {
    const entry = clusterMap.get(sig.cluster) || { count: 0, totalPriority: 0 };
    entry.count++;
    entry.totalPriority += sig.priority_score;
    clusterMap.set(sig.cluster, entry);
  }

  const clusterActivity = Array.from(clusterMap.entries())
    .map(([cluster, data]) => ({
      cluster,
      signalCount: data.count,
      avgPriority: Math.round(data.totalPriority / data.count),
      status: data.totalPriority / data.count > 80 ? "Hot" : data.totalPriority / data.count > 60 ? "Active" : "Monitoring",
    }))
    .sort((a, b) => b.avgPriority - a.avgPriority);

  // Breakout signals (top velocity/priority)
  const breakoutSignals = signals
    .filter((s) => s.priority_score >= 80 || s.velocity > 5)
    .sort((a, b) => b.priority_score - a.priority_score)
    .slice(0, 5)
    .map((s) => ({
      technology: s.technology,
      cluster: s.cluster,
      velocity: `${s.velocity > 0 ? "+" : ""}${s.velocity.toFixed(1)}/qtr`,
      priority: Math.round(s.priority_score),
      trl: s.trl,
    }));

  // Critical alerts
  const criticalAlerts = alerts.filter((a) => a.severity === "CRITICAL");

  // Ingestion stats
  const ingestionStats = {
    totalRuns: logs.length,
    totalRecords: logs.reduce((s, l) => s + l.records_found, 0),
    totalSignalsCreated: logs.reduce((s, l) => s + l.signals_created, 0),
  };

  // New signals (created in last 7 days)
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const newSignals = signals.filter((s) => new Date(s.created_at) >= weekAgo);

  // Recommendations
  const recommendations: string[] = [];
  if (criticalAlerts.length > 0) {
    recommendations.push(`${criticalAlerts.length} critical alert(s) require immediate analyst review.`);
  }
  const hotClusters = clusterActivity.filter((c) => c.status === "Hot");
  if (hotClusters.length > 0) {
    recommendations.push(`Focus attention on hot clusters: ${hotClusters.map((c) => c.cluster).join(", ")}.`);
  }
  const highTrlSignals = signals.filter((s) => s.trl >= 7 && s.priority_score >= 80);
  if (highTrlSignals.length > 0) {
    recommendations.push(`${highTrlSignals.length} signal(s) at TRL 7+ with high priority — monitor for near-term deployment.`);
  }
  if (recommendations.length === 0) {
    recommendations.push("No urgent actions required. Continue routine monitoring.");
  }

  return {
    title: "ARGUS Strategic Intelligence Brief",
    generatedAt: now.toISOString(),
    period: `Week ${getWeekNumber(now)} — ${now.getFullYear()}`,
    summary: {
      totalSignals: signals.length,
      newSignals: newSignals.length,
      activeAlerts: alerts.length,
      criticalAlerts: criticalAlerts.length,
      clustersActive: clusterMap.size,
    },
    breakoutSignals,
    clusterActivity,
    timelineChanges: [],  // Will be populated when timeline tracking is live
    ingestionStats,
    recommendations,
  };
}

/**
 * Format brief as Markdown for export.
 */
export function formatBriefAsMarkdown(brief: StrategicBrief): string {
  const lines: string[] = [];
  lines.push(`# ${brief.title}`);
  lines.push(`**${brief.period}** | Generated: ${new Date(brief.generatedAt).toLocaleString("en-GB")}`);
  lines.push("");

  lines.push("## Summary");
  lines.push(`| Metric | Value |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Total Signals | ${brief.summary.totalSignals} |`);
  lines.push(`| New This Week | ${brief.summary.newSignals} |`);
  lines.push(`| Active Alerts | ${brief.summary.activeAlerts} |`);
  lines.push(`| Critical | ${brief.summary.criticalAlerts} |`);
  lines.push(`| Clusters Active | ${brief.summary.clustersActive} |`);
  lines.push("");

  if (brief.breakoutSignals.length > 0) {
    lines.push("## Breakout Signals");
    for (const s of brief.breakoutSignals) {
      lines.push(`- **${s.technology}** [${s.cluster}] — Priority: ${s.priority}, TRL: ${s.trl}, Velocity: ${s.velocity}`);
    }
    lines.push("");
  }

  lines.push("## Cluster Activity");
  lines.push(`| Cluster | Signals | Avg Priority | Status |`);
  lines.push(`|---------|---------|--------------|--------|`);
  for (const c of brief.clusterActivity) {
    lines.push(`| ${c.cluster} | ${c.signalCount} | ${c.avgPriority} | ${c.status} |`);
  }
  lines.push("");

  lines.push("## Recommendations");
  for (const r of brief.recommendations) {
    lines.push(`- ${r}`);
  }

  return lines.join("\n");
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
