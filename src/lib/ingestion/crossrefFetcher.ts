/* ═══════════════════════════════════════════════════════════════ */
/*  CrossRef Fetcher — Academic publication search                   */
/*  Free API, no key required                                        */
/* ═══════════════════════════════════════════════════════════════ */

import { insertRawSource } from "@/lib/database/database";

const CROSSREF_API = "https://api.crossref.org/works";

const TECH_QUERIES = [
  "neuromorphic processor",
  "quantum key distribution",
  "solid-state lidar",
  "6G communication",
  "hypersonic propulsion",
  "GaN power amplifier",
  "autonomous swarm",
  "ambient backscatter",
  "post-quantum cryptography",
  "perovskite solar cell",
];

interface CrossRefItem {
  DOI: string;
  title: string[];
  abstract?: string;
  author?: Array<{ given?: string; family?: string }>;
  published?: { "date-parts"?: number[][] };
  "container-title"?: string[];
  "is-referenced-by-count"?: number;
}

/**
 * Fetch recent publications from CrossRef for ARGUS technology keywords.
 */
export async function fetchCrossRefPublications(maxPerQuery = 5): Promise<{ fetched: number; stored: number }> {
  let totalFetched = 0;
  let totalStored = 0;

  for (const query of TECH_QUERIES) {
    try {
      const params = new URLSearchParams({
        query: query,
        rows: String(maxPerQuery),
        sort: "published",
        order: "desc",
        filter: "type:journal-article",
        select: "DOI,title,abstract,author,published,container-title,is-referenced-by-count",
      });

      const response = await fetch(`${CROSSREF_API}?${params}`, {
        headers: { "User-Agent": "ARGUS/1.0 (mailto:research@argus.dev)" },
      });

      if (!response.ok) continue;

      const data = await response.json();
      const items: CrossRefItem[] = data?.message?.items || [];
      totalFetched += items.length;

      for (const item of items) {
        const title = item.title?.[0] || "";
        if (!title) continue;

        const authors = (item.author || [])
          .map((a) => [a.given, a.family].filter(Boolean).join(" "))
          .filter(Boolean);

        const dateParts = item.published?.["date-parts"]?.[0];
        const publishedDate = dateParts
          ? `${dateParts[0]}-${String(dateParts[1] || 1).padStart(2, "0")}-${String(dateParts[2] || 1).padStart(2, "0")}`
          : null;

        insertRawSource(
          "crossref",
          `https://doi.org/${item.DOI}`,
          title,
          JSON.stringify({
            title,
            abstract: item.abstract || "",
            authors,
            doi: item.DOI,
            journal: item["container-title"]?.[0] || "",
            published: publishedDate,
            citations: item["is-referenced-by-count"] || 0,
          })
        );
        totalStored++;
      }

      // Rate limiting: 1 second between requests (CrossRef polite pool)
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (err) {
      console.error(`CrossRef fetch failed for "${query}":`, err);
    }
  }

  return { fetched: totalFetched, stored: totalStored };
}
