/* ═══════════════════════════════════════════════════════════════ */
/*  arXiv Fetcher — Queries arXiv Atom API                          */
/*  Categories: cs.AI, cs.RO, physics.optics, quant-ph, cs.CR      */
/* ═══════════════════════════════════════════════════════════════ */

import { insertRawSource } from "@/lib/database/database";

const ARXIV_API = "https://export.arxiv.org/api/query";

const CATEGORY_QUERIES = [
  { category: "cs.AI", keywords: "artificial intelligence OR neural network OR deep learning" },
  { category: "cs.RO", keywords: "autonomous vehicle OR swarm robotics OR lidar" },
  { category: "physics.optics", keywords: "solid-state lidar OR optical wireless" },
  { category: "quant-ph", keywords: "quantum computing OR quantum key distribution OR quantum sensing" },
  { category: "cs.CR", keywords: "post-quantum cryptography OR cybersecurity" },
  { category: "eess.SP", keywords: "6G OR terahertz OR backscatter communication" },
  { category: "cs.AI",        keywords: "large language model OR foundation model OR reinforcement learning" },
  { category: "cs.CV",        keywords: "computer vision OR object detection OR surveillance" },
  { category: "cs.CR",        keywords: "zero-day OR cyber defense OR adversarial attack" },
  { category: "physics.space-ph", keywords: "satellite OR space weather OR orbital debris" },
  { category: "physics.flu-dyn",  keywords: "hypersonic OR scramjet OR shockwave" },
  { category: "eess.SY",      keywords: "autonomous control OR drone swarm OR uav" },
  { category: "physics.app-ph",   keywords: "directed energy OR high-power laser OR microwave weapon" },
  { category: "cond-mat.mes-hall", keywords: "gallium nitride OR silicon carbide OR semiconductor" },
];

interface ArxivEntry {
  id: string;
  title: string;
  summary: string;
  authors: string[];
  published: string;
  category: string;
  link: string;
}

/**
 * Parse arXiv Atom XML response into entries.
 */
function parseAtomXml(xml: string): ArxivEntry[] {
  const entries: ArxivEntry[] = [];

  // Simple regex-based XML parsing (avoiding npm dependency)
  const entryBlocks = xml.split("<entry>").slice(1);

  for (const block of entryBlocks) {
    const getTag = (tag: string): string => {
      const match = block.match(new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, "s"));
      return match ? match[1].trim() : "";
    };

    const id = getTag("id");
    const title = getTag("title").replace(/\s+/g, " ");
    const summary = getTag("summary").replace(/\s+/g, " ");
    const published = getTag("published");

    // Extract authors
    const authorMatches = block.matchAll(/<author>\s*<name>(.*?)<\/name>/g);
    const authors = Array.from(authorMatches).map((m) => m[1].trim());

    // Extract primary category
    const catMatch = block.match(/category[^>]*term="([^"]+)"/);
    const category = catMatch ? catMatch[1] : "";

    // Extract link
    const linkMatch = block.match(/link[^>]*href="([^"]+)"[^>]*title="pdf"/);
    const link = linkMatch ? linkMatch[1] : id;

    if (title && summary) {
      entries.push({ id, title, summary, authors, published, category, link });
    }
  }

  return entries;
}

/**
 * Fetch recent papers from arXiv for ARGUS-relevant categories.
 */
export async function fetchArxivPapers(maxResults = 20): Promise<{ fetched: number; stored: number }> {
  let totalFetched = 0;
  let totalStored = 0;

  for (const query of CATEGORY_QUERIES) {
    try {
      const searchQuery = encodeURIComponent(`cat:${query.category} AND (${query.keywords})`);
      const url = `${ARXIV_API}?search_query=${searchQuery}&start=0&max_results=${maxResults}&sortBy=submittedDate&sortOrder=descending`;

      const response = await fetch(url);
      if (!response.ok) continue;

      const xml = await response.text();
      const entries = parseAtomXml(xml);
      totalFetched += entries.length;

      for (const entry of entries) {
        insertRawSource(
          "arxiv",
          entry.link,
          entry.title,
          JSON.stringify({
            title: entry.title,
            abstract: entry.summary,
            authors: entry.authors,
            published: entry.published,
            category: entry.category,
            arxivId: entry.id,
          })
        );
        totalStored++;
      }

      // Rate limiting: 3 second delay between arXiv requests
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } catch (err) {
      console.error(`arXiv fetch failed for ${query.category}:`, err);
    }
  }

  return { fetched: totalFetched, stored: totalStored };
}
