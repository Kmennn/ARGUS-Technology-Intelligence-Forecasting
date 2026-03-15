/* ═══════════════════════════════════════════════════════════════ */
/*  PatentsView Fetcher — USPTO patent data                         */
/*  Free API, no key required                                        */
/* ═══════════════════════════════════════════════════════════════ */

import { insertRawSource } from "@/lib/database/database";

const PATENTS_API = "https://api.patentsview.org/patents/query";

const PATENT_QUERIES = [
  "neuromorphic chip",
  "solid-state lidar",
  "quantum key distribution",
  "6G antenna",
  "hypersonic vehicle",
  "gallium nitride amplifier",
  "autonomous drone swarm",
  "ambient backscatter",
  "post-quantum cryptography",
  "perovskite solar",
];

interface PatentResult {
  patent_number: string;
  patent_title: string;
  patent_abstract: string;
  patent_date: string;
  assignees?: Array<{ assignee_organization?: string }>;
  cpcs?: Array<{ cpc_group_id?: string }>;
}

/**
 * Fetch recent patents from PatentsView for ARGUS-relevant technologies.
 */
export async function fetchPatents(perQuery = 5): Promise<{ fetched: number; stored: number }> {
  let totalFetched = 0;
  let totalStored = 0;

  // Get date 2 years ago for filtering
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
  const dateFilter = twoYearsAgo.toISOString().split("T")[0];

  for (const query of PATENT_QUERIES) {
    try {
      const body = JSON.stringify({
        q: {
          _and: [
            { _text_any: { patent_abstract: query } },
            { _gte: { patent_date: dateFilter } },
          ],
        },
        f: ["patent_number", "patent_title", "patent_abstract", "patent_date",
            "assignees.assignee_organization", "cpcs.cpc_group_id"],
        o: { per_page: perQuery, page: 1 },
        s: [{ patent_date: "desc" }],
      });

      const response = await fetch(PATENTS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (!response.ok) continue;

      const data = await response.json();
      const patents: PatentResult[] = data?.patents || [];
      totalFetched += patents.length;

      for (const patent of patents) {
        if (!patent.patent_title) continue;

        const assignees = (patent.assignees || [])
          .map((a) => a.assignee_organization)
          .filter(Boolean);

        insertRawSource(
          "patent",
          `https://patents.google.com/patent/US${patent.patent_number}`,
          patent.patent_title,
          JSON.stringify({
            title: patent.patent_title,
            abstract: patent.patent_abstract || "",
            patentNumber: patent.patent_number,
            filingDate: patent.patent_date,
            assignees,
            cpcCodes: (patent.cpcs || []).map((c) => c.cpc_group_id).filter(Boolean),
          })
        );
        totalStored++;
      }

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch (err) {
      console.error(`PatentsView fetch failed for "${query}":`, err);
    }
  }

  return { fetched: totalFetched, stored: totalStored };
}
