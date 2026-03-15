import { upsertActor, upsertMomentum, updateMomentumScore, getMomentumByConcept } from "@/lib/database/database";

/* ═══════════════════════════════════════════════════════════════ */
/*  Momentum Engine                                                */
/*  Extracts actors from raw ingestion data and computes regional  */
/*  innovation momentum.                                           */
/* ═══════════════════════════════════════════════════════════════ */

export interface ExtractedActor {
  organization: string;
  country: string;
}

/**
 * Heuristic mapping to infer country from organization/author strings.
 * In a production pipeline, this would connect to an entity resolution API or lookup table.
 */
const REGION_MAP: Record<string, string> = {
  "USA": "Americas",
  "United States": "Americas",
  "China": "Asia",
  "Japan": "Asia",
  "Germany": "Europe",
  "UK": "Europe",
  "United Kingdom": "Europe",
  "EU": "Europe",
  "South Korea": "Asia",
  "India": "Asia",
  "Israel": "Middle East",
  "Canada": "Americas",
};

function inferCountryFromText(text: string): string {
  const upper = text.toUpperCase();
  if (upper.includes("USA") || upper.includes("UNITED STATES") || upper.includes("CALIFORNIA") || upper.includes("MIT") || upper.includes("STANFORD") || upper.includes("GOOGLE") || upper.includes("IBM")) return "USA";
  if (upper.includes("CHINA") || upper.includes("TSINGHUA") || upper.includes("BEIJING") || upper.includes("TENCENT") || upper.includes("BAIDU")) return "China";
  if (upper.includes("JAPAN") || upper.includes("TOKYO") || upper.includes("SONY") || upper.includes("TOYOTA")) return "Japan";
  if (upper.includes("UK") || upper.includes("UNITED KINGDOM") || upper.includes("LONDON") || upper.includes("OXFORD") || upper.includes("CAMBRIDGE")) return "UK";
  if (upper.includes("GERMANY") || upper.includes("BERLIN") || upper.includes("MUNICH")) return "Germany";
  if (upper.includes("KOREA") || upper.includes("SEOUL") || upper.includes("SAMSUNG")) return "South Korea";
  if (upper.includes("INDIA") || upper.includes("DELHI") || upper.includes("BOMBAY") || upper.includes("BANGALORE") || upper.includes("IIT")) return "India";
  return "Unknown";
}

export interface RawMetadata {
  assignees?: unknown[];
  authors?: unknown[];
  author?: unknown;
  publisher?: unknown;
  [key: string]: unknown;
}

/**
 * Extracts normalized actor objects from unstructured source metadata.
 */
export function extractActorsFromRawData(sourceType: string, rawDataJson: RawMetadata): ExtractedActor[] {
  const actors: ExtractedActor[] = [];
  const maxExtract = 3; // Limit to top 3 actors per default to avoid noisy multi-author lists

  if (sourceType === "patent") {
    // rawDataJson has assignees array
    const assignees = rawDataJson.assignees || [];
    for (const org of assignees) {
      if (!org) continue;
      actors.push({
        organization: String(org).substring(0, 100).trim(),
        country: inferCountryFromText(String(org))
      });
      if (actors.length >= maxExtract) break;
    }
  } else if (sourceType === "arxiv" || sourceType === "crossref") {
    // Authors are provided. Sometimes affiliations aren't clean, so we treat author as org, or if there's a comma, take the last part.
    const authors = rawDataJson.authors || [];
    for (const author of authors) {
      if (!author) continue;
      const parts = String(author).split(",");
      const orgStr = parts.length > 1 ? parts[parts.length - 1].trim() : parts[0].trim();
      actors.push({
        organization: orgStr.substring(0, 50).trim(),
        country: inferCountryFromText(orgStr)
      });
      if (actors.length >= maxExtract) break;
    }
  } else {
    // Fallback: Check 'author', 'publisher'
    if (rawDataJson.author) {
      actors.push({
        organization: String(rawDataJson.author).substring(0, 50).trim(),
        country: inferCountryFromText(String(rawDataJson.author))
      });
    } else if (rawDataJson.publisher) {
        actors.push({
          organization: String(rawDataJson.publisher).substring(0, 50).trim(),
          country: inferCountryFromText(String(rawDataJson.publisher))
        });
    }
  }

  // Deduplicate array based on organization and country
  const unique = [];
  const seen = new Set();
  for (const a of actors) {
    const key = `${a.organization}|${a.country}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(a);
    }
  }

  return unique;
}

/**
 * Records actors, increments counts, and recalculates momentum for a technology.
 */
export function trackInnovationMomentum(
  conceptName: string, 
  sourceType: string, 
  rawDataJson: RawMetadata, 
  citations: number = 0,
  publishedDate?: Date
) {
  const timestamp = new Date().toISOString();
  const year = publishedDate ? publishedDate.getFullYear() : new Date().getFullYear();
  
  const extracted = extractActorsFromRawData(sourceType, rawDataJson);

  const isResearch = (sourceType === "arxiv" || sourceType === "crossref" || sourceType === "news");
  const isPatent = (sourceType === "patent");

  // Track each distinct actor globally
  for (const actor of extracted) {
    upsertActor({
      concept_name: conceptName,
      organization: actor.organization,
      country: actor.country,
      paper_count: isResearch ? 1 : 0,
      patent_count: isPatent ? 1 : 0,
      citations: citations,
      timestamp
    });

    // Determine broad region (Americas, Asia, Europe, etc)
    const normalizedCountry = actor.country || "Unknown";
    const region = REGION_MAP[normalizedCountry] || normalizedCountry;

    upsertMomentum({
      concept_name: conceptName,
      region,
      year,
      research_count: isResearch ? 1 : 0,
      patent_count: isPatent ? 1 : 0
    });
  }

  // Recalculate and update the momentum score for all regions on this concept
  recalculateMomentumScores(conceptName);
}

/**
 * Computes momentum formula based on counts.
 * Formula: 0.4 * research + 0.3 * patents + bonus for recent growth (not fully implemented yet, just base score)
 */
function recalculateMomentumScores(conceptName: string) {
  const activeMomentum = getMomentumByConcept(conceptName);
  
  for (const m of activeMomentum) {
    // 0.40 * research + 0.60 * patents (patents weighted heavier)
    const baseScore = (0.40 * m.research_count) + (0.60 * m.patent_count * 2.5); // Arbitrary weighting for simulation
    const finalScore = Math.min(100, Math.round(baseScore * 10) / 10);
    
    if (finalScore !== m.momentum_score) {
      updateMomentumScore(m.id, finalScore);
    }
  }
}
