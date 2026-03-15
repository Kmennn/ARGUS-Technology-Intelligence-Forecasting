/* ═══════════════════════════════════════════════════════════════ */
/*  Ingestion Pipeline Orchestrator                                  */
/*  Coordinates fetchers → signal extraction → database storage      */
/* ═══════════════════════════════════════════════════════════════ */

import {
  getUnprocessedSources,
  markSourceProcessed,
  upsertSignal,
  logIngestion,
  getAllSignals,
} from "@/lib/database/database";
import { generateSignalId } from "@/lib/ingestion/signalEngine";
import { extractSemanticSignals } from "@/lib/analysis/semanticSignalEngine";
import { validateRecord, isDuplicate } from "@/lib/validation/sourceTrust";
import { fetchArxivPapers } from "@/lib/ingestion/arxivFetcher";
import { fetchCrossRefPublications } from "@/lib/ingestion/crossrefFetcher";
import { fetchPatents } from "@/lib/ingestion/patentFetcher";
import { fetchNews } from "@/lib/ingestion/newsFetcher";
import { runBreakoutDetection } from "@/lib/analysis/breakoutEngine";

export interface IngestionResult {
  fetcher: string;
  fetched: number;
  stored: number;
  signalsCreated: number;
  signalsUpdated: number;
  durationMs: number;
  errors: string[];
}

/**
 * Run a single fetcher by name.
 */
async function runFetcher(name: string): Promise<{ fetched: number; stored: number }> {
  switch (name) {
    case "arxiv": return fetchArxivPapers(15);
    case "crossref": return fetchCrossRefPublications(5);
    case "patent": return fetchPatents(5);
    case "news": return fetchNews(10);
    default: return { fetched: 0, stored: 0 };
  }
}

/**
 * Process unprocessed raw sources → extract semantic signals → store.
 */
async function processRawSources(fetcher?: string): Promise<{ created: number; updated: number }> {
  const sources = getUnprocessedSources(fetcher);
  const existingSignals = getAllSignals();
  const existingTitles = existingSignals.map((s) => s.title);

  let created = 0;
  let updated = 0;

  for (const source of sources) {
    try {
      const raw = JSON.parse(source.raw_data);
      const title = raw.title || source.title || "";
      const abstract = raw.abstract || "";
      const sourceType = raw.sourceType || source.fetcher;
      const sourceUrl = raw.link || raw.doi ? `https://doi.org/${raw.doi}` : null;
      const published = raw.published ? new Date(raw.published) : undefined;

      // Validate
      const validation = validateRecord({
        title,
        abstract,
        sourceType,
        publishedDate: published,
      });

      if (!validation.valid) {
        markSourceProcessed(source.id);
        continue;
      }

      // Deduplicate
      if (isDuplicate(title, existingTitles, 0.7)) {
        markSourceProcessed(source.id);
        continue;
      }

      // Extract Semantic Signals via LLM (or fallback)
      const fullText = `${title}\n\n${abstract}`;
      const signals = await extractSemanticSignals(fullText);

      for (const sig of signals) {
        const signalId = generateSignalId(sig.technology, sourceUrl);
        const existing = existingSignals.find((s) => s.id === signalId);

        if (existing) {
          // Update existing signal: bump source count and confidence
          upsertSignal({
            id: signalId,
            confidence: Math.min(1.0, (existing.confidence + sig.confidence) / 2 + 0.05),
            source_count: existing.source_count + 1,
            last_updated: new Date().toISOString(),
          });
          updated++;
        } else {
          // Create new signal
          upsertSignal({
            id: signalId,
            technology: sig.technology,
            cluster: sig.cluster,
            title: title,
            summary: `Automated Semantic Extraction:\nNovelty Score: ${sig.novelty_score}\nRelated Domains: ${sig.related_domains.join(", ")}\n\nAbstract: ${abstract.substring(0, 300)}...`,
            priority_score: Math.round(sig.confidence * 100),
            trl: sig.trl,
            confidence: sig.confidence,
            velocity: 0,
            volatility: "emerging",
            score_history: JSON.stringify([{ year: new Date().toISOString().slice(0, 7), score: sig.confidence }]),
            priority_drivers: JSON.stringify([`Semantic detection (novelty: ${sig.novelty_score})`, `Domains: ${sig.related_domains.join(", ")}`]),
            impact_domains: JSON.stringify(sig.related_domains),
            source_type: sourceType,
            source_url: sourceUrl,
            source_count: 1,
            trend_direction: "rising",
          });
          existingTitles.push(title);
          created++;
        }
      }

      markSourceProcessed(source.id);
    } catch (err) {
      console.error(`Error processing source ${source.id}:`, err);
      markSourceProcessed(source.id);
    }
  }

  return { created, updated };
}

/**
 * Run a full ingestion cycle for a specific fetcher.
 */
export async function runIngestionCycle(fetcherName: string): Promise<IngestionResult> {
  const startTime = Date.now();
  const errors: string[] = [];

  // Step 1: Fetch raw data
  let fetchResult = { fetched: 0, stored: 0 };
  try {
    fetchResult = await runFetcher(fetcherName);
  } catch (err) {
    errors.push(`Fetch error: ${err}`);
  }

  // Step 2: Process raw sources → extract semantic signals
  let processResult = { created: 0, updated: 0 };
  try {
    processResult = await processRawSources(fetcherName === "news" ? undefined : fetcherName);
  } catch (err) {
    errors.push(`Process error: ${err}`);
  }

  // Step 3: Run breakout detection
  try {
    runBreakoutDetection();
  } catch (err) {
    errors.push(`Breakout detection error: ${err}`);
  }

  const durationMs = Date.now() - startTime;

  // Log ingestion
  logIngestion(
    fetcherName,
    fetchResult.fetched,
    processResult.created,
    processResult.updated,
    durationMs,
    errors.length > 0 ? errors.join("; ") : undefined
  );

  return {
    fetcher: fetcherName,
    fetched: fetchResult.fetched,
    stored: fetchResult.stored,
    signalsCreated: processResult.created,
    signalsUpdated: processResult.updated,
    durationMs,
    errors,
  };
}

/**
 * Run all fetchers in sequence.
 */
export async function runFullIngestion(): Promise<IngestionResult[]> {
  const fetchers = ["arxiv", "crossref", "patent", "news"];
  const results: IngestionResult[] = [];

  for (const name of fetchers) {
    const result = await runIngestionCycle(name);
    results.push(result);
  }

  return results;
}
