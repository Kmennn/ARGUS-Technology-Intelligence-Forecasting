/* ═══════════════════════════════════════════════════════════════ */
/*  News/RSS Fetcher — Defense, tech, and research news              */
/*  Parses RSS/Atom XML feeds                                        */
/* ═══════════════════════════════════════════════════════════════ */

import { insertRawSource } from "@/lib/database/database";

interface RssFeed {
  name: string;
  url: string;
  sourceType: string;
}

const RSS_FEEDS: RssFeed[] = [
  // Defense & strategic tech
  { name: "Defense News", url: "https://www.defensenews.com/arc/outboundfeeds/rss/?outputType=xml", sourceType: "defense-news" },
  { name: "Breaking Defense", url: "https://breakingdefense.com/feed/", sourceType: "defense-news" },
  // Technology
  { name: "IEEE Spectrum", url: "https://spectrum.ieee.org/feeds/feed.rss", sourceType: "ieee" },
  { name: "TechCrunch AI", url: "https://techcrunch.com/category/artificial-intelligence/feed/", sourceType: "tech-news" },
  // Research
  { name: "arXiv CS.AI", url: "https://rss.arxiv.org/rss/cs.AI", sourceType: "arxiv" },
  { name: "arXiv quant-ph", url: "https://rss.arxiv.org/rss/quant-ph", sourceType: "arxiv" },
];

interface RssItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
}

/**
 * Parse RSS/Atom XML into items.
 */
function parseRss(xml: string): RssItem[] {
  const items: RssItem[] = [];

  // Try RSS 2.0 <item> blocks
  const itemBlocks = xml.split(/<item[ >]/).slice(1);

  for (const block of itemBlocks) {
    const getTag = (tag: string): string => {
      // Handle CDATA
      const cdataMatch = block.match(new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, "i"));
      if (cdataMatch) return cdataMatch[1].trim();

      const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
      return match ? match[1].trim().replace(/<[^>]+>/g, "") : "";
    };

    const title = getTag("title");
    const description = getTag("description") || getTag("summary");
    const link = getTag("link") || getTag("guid");
    const pubDate = getTag("pubDate") || getTag("published") || getTag("dc:date");

    if (title && title.length > 5) {
      items.push({ title, description, link, pubDate });
    }
  }

  // Fallback: try Atom <entry> blocks
  if (items.length === 0) {
    const entryBlocks = xml.split(/<entry[ >]/).slice(1);
    for (const block of entryBlocks) {
      const getTag = (tag: string): string => {
        const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
        return match ? match[1].trim().replace(/<[^>]+>/g, "") : "";
      };
      const getLinkHref = (): string => {
        const match = block.match(/href="([^"]+)"/);
        return match ? match[1] : "";
      };

      const title = getTag("title");
      const summary = getTag("summary") || getTag("content");
      const link = getLinkHref();
      const pubDate = getTag("published") || getTag("updated");

      if (title && title.length > 5) {
        items.push({ title, description: summary, link, pubDate });
      }
    }
  }

  return items;
}

/**
 * Fetch news from all configured RSS feeds.
 */
export async function fetchNews(maxPerFeed = 15): Promise<{ fetched: number; stored: number }> {
  let totalFetched = 0;
  let totalStored = 0;

  for (const feed of RSS_FEEDS) {
    try {
      const response = await fetch(feed.url, {
        headers: { "User-Agent": "ARGUS/1.0" },
      });

      if (!response.ok) continue;

      const xml = await response.text();
      const items = parseRss(xml).slice(0, maxPerFeed);
      totalFetched += items.length;

      for (const item of items) {
        insertRawSource(
          "news",
          item.link,
          item.title,
          JSON.stringify({
            title: item.title,
            abstract: item.description,
            source: feed.name,
            sourceType: feed.sourceType,
            published: item.pubDate,
            link: item.link,
          })
        );
        totalStored++;
      }

      // Brief delay between feeds
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (err) {
      console.error(`RSS fetch failed for ${feed.name}:`, err);
    }
  }

  return { fetched: totalFetched, stored: totalStored };
}
