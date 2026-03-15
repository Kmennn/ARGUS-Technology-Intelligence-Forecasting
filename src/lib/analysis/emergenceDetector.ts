/**
 * src/lib/analysis/emergenceDetector.ts
 * Phase-23: Early Technology Emergence Detection
 *
 * Detects technologies 2-3 years before mainstream breakout by analyzing:
 *   1. Publication Acceleration  (growth curve of papers)
 *   2. Vocabulary Novelty        (TF-IDF novelty of technology terms)
 *   3. Cross-Domain Convergence  (new edges in dependency graph)
 *
 * Composite formula:
 *   early_signal_score =
 *     publication_acceleration * 0.4 +
 *     vocabulary_novelty      * 0.3 +
 *     cross_domain_links      * 0.3
 */

import {
  getAllTrackedTechnologies,
  getAllSignals,
  upsertEmergingSignal,
} from "@/lib/database/database";

/* ─── Types ─── */

interface YearlyCount {
  year: number;
  count: number;
}

interface EmergenceResult {
  technology: string;
  earlySignalScore: number;
  publicationGrowth: number;
  noveltyScore: number;
  crossDomainLinks: number;
}

/* ─── 1. Publication Acceleration ─── */

/**
 * Measures the exponential growth rate of publications for a technology.
 * Returns a normalized 0-1 score where:
 *   0.0 = flat or declining
 *   1.0 = explosive exponential growth
 */
function measurePublicationAcceleration(yearCounts: YearlyCount[]): number {
  if (yearCounts.length < 2) return 0;

  // Sort by year ascending
  const sorted = [...yearCounts].sort((a, b) => a.year - b.year);

  // Compute year-over-year growth rates
  const growthRates: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1].count;
    const curr = sorted[i].count;
    if (prev > 0) {
      growthRates.push((curr - prev) / prev);
    } else if (curr > 0) {
      growthRates.push(1.0); // Appeared from zero
    }
  }

  if (growthRates.length === 0) return 0;

  // Average growth rate, weight recent years more heavily
  let weightedSum = 0;
  let weightTotal = 0;
  for (let i = 0; i < growthRates.length; i++) {
    const weight = i + 1; // More recent = higher weight
    weightedSum += growthRates[i] * weight;
    weightTotal += weight;
  }

  const avgGrowth = weightedSum / weightTotal;

  // Normalize: >100% growth per year = 1.0, negative = 0.0
  return Math.max(0, Math.min(1, avgGrowth));
}

/* ─── 2. Vocabulary Novelty ─── */

/**
 * Measures how "novel" a technology term is relative to the existing signal corpus.
 * Uses a simplified TF-IDF-inspired approach:
 *   - Technologies with few total occurrences but recent appearance score higher
 *   - Technologies that suddenly appear in many papers score higher
 */
function measureVocabularyNovelty(
  technology: string,
  allSignals: Array<{ technology: string; created_at: string }>,
  totalTechCount: number
): number {
  const matchingSignals = allSignals.filter(
    (s) => s.technology.toLowerCase() === technology.toLowerCase()
  );

  if (matchingSignals.length === 0) return 0;

  // Term frequency: how often this tech appears relative to all techs
  const tf = matchingSignals.length / Math.max(1, allSignals.length);

  // Inverse document frequency: rarer techs score higher
  const idf = Math.log(Math.max(1, totalTechCount) / Math.max(1, matchingSignals.length));

  // Recency boost: high if most occurrences are recent (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const recentCount = matchingSignals.filter(
    (s) => new Date(s.created_at) >= sixMonthsAgo
  ).length;
  const recencyRatio = recentCount / matchingSignals.length;

  // Combine: high recency + moderate rarity = high novelty
  const rawNovelty = (tf * idf * 10) * (0.4 + 0.6 * recencyRatio);

  return Math.max(0, Math.min(1, rawNovelty));
}

/* ─── 3. Cross-Domain Convergence ─── */

/**
 * Counts the number of distinct technology clusters that a technology appears in.
 * Technologies spanning multiple clusters indicate cross-domain convergence.
 */
function measureCrossDomainLinks(
  technology: string,
  allSignals: Array<{ technology: string; cluster: string; impact_domains: string }>
): number {
  const matching = allSignals.filter(
    (s) => s.technology.toLowerCase() === technology.toLowerCase()
  );

  // Collect unique clusters
  const clusters = new Set<string>();
  const domains = new Set<string>();

  for (const sig of matching) {
    if (sig.cluster) clusters.add(sig.cluster);
    try {
      const parsed = JSON.parse(sig.impact_domains || "[]") as string[];
      for (const d of parsed) domains.add(d);
    } catch {
      // Ignore parse errors
    }
  }

  // Also check: does this technology name appear in OTHER signals' impact_domains?
  for (const sig of allSignals) {
    if (sig.technology.toLowerCase() === technology.toLowerCase()) continue;
    try {
      const parsed = JSON.parse(sig.impact_domains || "[]") as string[];
      if (parsed.some((d) => d.toLowerCase().includes(technology.toLowerCase().split(" ")[0]))) {
        clusters.add(sig.cluster);
      }
    } catch {
      // Ignore parse errors
    }
  }

  const totalLinks = clusters.size + domains.size;

  // Normalize: 5+ cross-domain links = 1.0
  return Math.min(1, totalLinks / 5);
}

/* ─── Main Emergence Detection ─── */

/**
 * Runs the full emergence detection scan.
 * Analyzes all tracked technologies and computes early_signal_score.
 * Results are stored via UPSERT into the emerging_signals table.
 */
export function runEmergenceDetection(): EmergenceResult[] {
  const trackedData = getAllTrackedTechnologies();
  const allSignalsRaw = getAllSignals();
  const results: EmergenceResult[] = [];

  // Time-window filter: only scan signals from the last 24 months
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - 24);
  const allSignals = allSignalsRaw.filter(
    (s) => new Date(s.created_at) >= cutoffDate
  );

  // Build per-technology yearly counts
  const techYearMap = new Map<string, YearlyCount[]>();
  for (const row of trackedData) {
    if (!techYearMap.has(row.technology)) {
      techYearMap.set(row.technology, []);
    }
    techYearMap.get(row.technology)!.push({
      year: row.year,
      count: row.research_count + row.patent_count,
    });
  }

  // Unique technologies across momentum + signals
  const allTechNames = new Set<string>();
  for (const t of trackedData) allTechNames.add(t.technology);
  for (const s of allSignals) allTechNames.add(s.technology);

  const totalTechCount = allTechNames.size;

  for (const technology of allTechNames) {
    const yearCounts = techYearMap.get(technology) || [];

    // 1. Publication Acceleration
    const publicationGrowth = measurePublicationAcceleration(yearCounts);

    // 2. Vocabulary Novelty
    const noveltyScore = measureVocabularyNovelty(technology, allSignals, totalTechCount);

    // 3. Cross-Domain Convergence
    const crossDomainLinkCount = measureCrossDomainLinks(technology, allSignals);

    // Composite score
    const earlySignalScore = Math.round(
      (publicationGrowth * 0.4 + noveltyScore * 0.3 + crossDomainLinkCount * 0.3) * 100
    ) / 100;

    // Only store if there's a meaningful signal
    if (earlySignalScore > 0.1) {
      upsertEmergingSignal({
        technology,
        early_signal_score: earlySignalScore,
        publication_growth: Math.round(publicationGrowth * 100) / 100,
        novelty_score: Math.round(noveltyScore * 100) / 100,
        cross_domain_links: Math.round(crossDomainLinkCount * 5), // Store as integer count
      });

      results.push({
        technology,
        earlySignalScore,
        publicationGrowth: Math.round(publicationGrowth * 100) / 100,
        noveltyScore: Math.round(noveltyScore * 100) / 100,
        crossDomainLinks: Math.round(crossDomainLinkCount * 5),
      });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.earlySignalScore - a.earlySignalScore);

  console.log(`[Emergence Detector] Analyzed ${allTechNames.size} technologies, found ${results.length} emerging signals.`);

  return results;
}
