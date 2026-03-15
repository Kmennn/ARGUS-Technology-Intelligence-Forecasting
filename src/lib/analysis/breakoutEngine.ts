/* ═══════════════════════════════════════════════════════════════ */
/*  Breakout Detection Engine — Server-side                          */
/*  Runs after each ingestion cycle                                  */
/* ═══════════════════════════════════════════════════════════════ */

import { getAllSignals, insertAlert, type DbSignal } from "@/lib/database/database";

interface BreakoutResult {
  alertType: string;
  technology: string;
  cluster: string;
  severity: "CRITICAL" | "WARNING" | "WATCH";
  confidence: number;
  metric: string;
  value: string;
}

/**
 * Run breakout detection algorithms on all signals.
 * Returns generated alerts.
 */
export function runBreakoutDetection(): BreakoutResult[] {
  const signals = getAllSignals();
  const results: BreakoutResult[] = [];

  for (const sig of signals) {
    const history = parseScoreHistory(sig.score_history);
    if (history.length < 3) continue;

    // Algorithm 1: Velocity Spike
    const velocitySpikeResult = detectVelocitySpike(sig, history);
    if (velocitySpikeResult) results.push(velocitySpikeResult);

    // Algorithm 2: Breakout Candidate
    const breakoutResult = detectBreakout(sig, history);
    if (breakoutResult) results.push(breakoutResult);

    // Algorithm 3: Momentum Acceleration
    const momentumResult = detectMomentumAcceleration(sig, history);
    if (momentumResult) results.push(momentumResult);
  }

  // Algorithm 4: Cluster Surge
  const clusterSurges = detectClusterSurge(signals);
  results.push(...clusterSurges);

  // Persist alerts to database
  for (const r of results) {
    insertAlert({
      alert_type: r.alertType,
      technology: r.technology,
      cluster: r.cluster,
      severity: r.severity,
      confidence: r.confidence,
      metric: r.metric,
      value: r.value,
      data: JSON.stringify(r),
    });
  }

  return results;
}

function parseScoreHistory(json: string): number[] {
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) {
      // Handle both { score: number } and raw number formats
      return parsed.map((item: number | { score: number }) =>
        typeof item === "number" ? item : (item.score ?? 0)
      );
    }
  } catch {
    // ignore
  }
  return [];
}

function detectVelocitySpike(sig: DbSignal, history: number[]): BreakoutResult | null {
  const diffs = history.slice(1).map((v, i) => v - history[i]);
  if (diffs.length < 2) return null;

  const avgDiff = diffs.reduce((s, v) => s + v, 0) / diffs.length;
  const recentDiff = diffs.slice(-2).reduce((s, v) => s + v, 0) / 2;

  if (avgDiff <= 0) return null;
  const ratio = recentDiff / avgDiff;

  if (ratio > 1.3) {
    return {
      alertType: "velocity_spike",
      technology: sig.technology,
      cluster: sig.cluster,
      severity: ratio > 1.8 ? "CRITICAL" : ratio > 1.5 ? "WARNING" : "WATCH",
      confidence: Math.min(0.95, sig.confidence + 0.1),
      metric: "Velocity Ratio",
      value: `${ratio.toFixed(2)}×`,
    };
  }
  return null;
}

function detectBreakout(sig: DbSignal, history: number[]): BreakoutResult | null {
  const diffs = history.slice(1).map((v, i) => v - history[i]);
  const recentVelocity = diffs.length >= 2
    ? diffs.slice(-2).reduce((s, v) => s + v, 0) / 2
    : diffs[diffs.length - 1] || 0;

  // Breakout: high velocity + high TRL + high priority
  if (recentVelocity > 0.05 && sig.trl >= 5 && sig.priority_score >= 80) {
    const breakoutScore = Math.round(recentVelocity * 100 * sig.trl);
    return {
      alertType: "breakout",
      technology: sig.technology,
      cluster: sig.cluster,
      severity: "CRITICAL",
      confidence: Math.min(0.95, sig.confidence),
      metric: "Breakout Score",
      value: String(breakoutScore),
    };
  }
  return null;
}

function detectMomentumAcceleration(sig: DbSignal, history: number[]): BreakoutResult | null {
  if (history.length < 5) return null;

  const diffs = history.slice(1).map((v, i) => v - history[i]);
  const firstHalf = diffs.slice(0, Math.floor(diffs.length / 2));
  const secondHalf = diffs.slice(Math.floor(diffs.length / 2));

  const avgFirst = firstHalf.reduce((s, v) => s + v, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((s, v) => s + v, 0) / secondHalf.length;

  if (avgFirst > 0 && avgSecond / avgFirst > 1.5) {
    return {
      alertType: "momentum_accel",
      technology: sig.technology,
      cluster: sig.cluster,
      severity: avgSecond / avgFirst > 2.0 ? "WARNING" : "WATCH",
      confidence: sig.confidence,
      metric: "Acceleration Ratio",
      value: `${(avgSecond / avgFirst).toFixed(2)}×`,
    };
  }
  return null;
}

function detectClusterSurge(signals: DbSignal[]): BreakoutResult[] {
  const clusterVelocities = new Map<string, number[]>();

  for (const sig of signals) {
    const history = parseScoreHistory(sig.score_history);
    if (history.length < 2) continue;

    const velocity = history[history.length - 1] - history[history.length - 2];
    const cluster = sig.cluster;

    if (!clusterVelocities.has(cluster)) clusterVelocities.set(cluster, []);
    clusterVelocities.get(cluster)!.push(velocity);
  }

  const results: BreakoutResult[] = [];
  for (const [cluster, velocities] of clusterVelocities) {
    const avgVel = velocities.reduce((s, v) => s + v, 0) / velocities.length;
    const fastCount = velocities.filter((v) => v > 0.05).length;
    const surgeRatio = fastCount / velocities.length;

    if (surgeRatio > 0.5 && avgVel > 0.04) {
      results.push({
        alertType: "cluster_surge",
        technology: `${cluster} Cluster`,
        cluster,
        severity: surgeRatio > 0.7 ? "WARNING" : "WATCH",
        confidence: 0.7,
        metric: "Cluster Heat",
        value: `${(surgeRatio * 100).toFixed(0)}% active`,
      });
    }
  }

  return results;
}
