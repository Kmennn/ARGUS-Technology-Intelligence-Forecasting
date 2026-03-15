/* ═══════════════════════════════════════════════════════════════ */
/*  Source Trust & Validation Layer                                  */
/*  Scores sources, detects duplicates, weights recency              */
/* ═══════════════════════════════════════════════════════════════ */

/** Source credibility scores by type */
export const SOURCE_CREDIBILITY: Record<string, number> = {
  "peer-reviewed": 0.95,
  "arxiv": 0.85,
  "crossref": 0.90,
  "patent": 0.85,
  "defense-news": 0.80,
  "ieee": 0.88,
  "tech-news": 0.70,
  "blog": 0.40,
  "press-release": 0.55,
  "unknown": 0.50,
};

/**
 * Calculate trust score for a source.
 */
export function calculateTrustScore(
  sourceType: string,
  publishedDate: Date,
  citationCount?: number
): number {
  const base = SOURCE_CREDIBILITY[sourceType] ?? SOURCE_CREDIBILITY.unknown;
  const daysSincePublished = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);

  // Recency multiplier: 1.0 within 7 days, decays to 0.5 at 180 days
  const recency = Math.max(0.5, 1 - (daysSincePublished / 360));

  // Citation boost
  const citations = citationCount ? Math.min(0.1, citationCount / 200) : 0;

  return Math.min(1.0, base * recency + citations);
}

/**
 * Simple fuzzy title matching for deduplication.
 * Normalizes and compares titles — returns similarity 0..1.
 */
export function titleSimilarity(a: string, b: string): number {
  const normalize = (s: string) =>
    s.toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const na = normalize(a);
  const nb = normalize(b);

  if (na === nb) return 1.0;

  // Jaccard similarity on word set
  const wordsA = new Set(na.split(" "));
  const wordsB = new Set(nb.split(" "));
  const intersection = new Set([...wordsA].filter((w) => wordsB.has(w)));
  const union = new Set([...wordsA, ...wordsB]);

  return union.size > 0 ? intersection.size / union.size : 0;
}

/**
 * Check if a title is a likely duplicate of any existing titles.
 */
export function isDuplicate(newTitle: string, existingTitles: string[], threshold = 0.75): boolean {
  for (const existing of existingTitles) {
    if (titleSimilarity(newTitle, existing) >= threshold) {
      return true;
    }
  }
  return false;
}

/**
 * Validate an ingested record before it becomes a signal.
 */
export function validateRecord(record: {
  title: string;
  abstract?: string;
  sourceType: string;
  publishedDate?: Date;
}): { valid: boolean; reason?: string; trustScore: number } {
  // Must have a title
  if (!record.title || record.title.trim().length < 10) {
    return { valid: false, reason: "Title too short or missing", trustScore: 0 };
  }

  // Must have meaningful content
  const contentLen = (record.title.length || 0) + (record.abstract?.length || 0);
  if (contentLen < 50) {
    return { valid: false, reason: "Insufficient content", trustScore: 0 };
  }

  const trustScore = calculateTrustScore(
    record.sourceType,
    record.publishedDate || new Date(),
  );

  // Reject very low trust
  if (trustScore < 0.3) {
    return { valid: false, reason: "Trust score too low", trustScore };
  }

  return { valid: true, trustScore };
}
