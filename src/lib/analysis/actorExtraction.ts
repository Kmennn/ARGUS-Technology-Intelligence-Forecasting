export interface ExtractedActors {
  authors: string[];
  organizations: string[];
  country: string;
  technology: string;
  sourceType: string;
  sourceId: string;
}

export interface RawSourceMetadata {
  authors?: string[];
  assignees?: string[];
  organizations?: string[];
  country?: string;
  sourceType?: string;
  detectedTechnology?: string;
  [key: string]: unknown;
}

export function extractActors(rawSource: RawSourceMetadata, technology: string, sourceType: string, sourceUrl: string | null): ExtractedActors {
  let authors: string[] = [];
  let organizations: string[] = [];
  const country: string = rawSource.country || "Unknown";

  if (rawSource.authors && Array.isArray(rawSource.authors)) {
    authors = rawSource.authors;
    if (!rawSource.assignees) {
      organizations = rawSource.authors.map((a: string) => {
        const parts = a.split(",");
        return parts[parts.length - 1].trim();
      });
    }
  }

  if (rawSource.assignees && Array.isArray(rawSource.assignees)) {
    organizations = rawSource.assignees;
  }

  if (rawSource.organizations && Array.isArray(rawSource.organizations)) {
    organizations = rawSource.organizations;
  }

  // Deduplicate
  organizations = Array.from(new Set(organizations.map(o => String(o).substring(0, 100).trim()))).filter(Boolean).slice(0, 3);
  authors = Array.from(new Set(authors.map(a => String(a).substring(0, 50).trim()))).filter(Boolean).slice(0, 5);

  return {
    authors,
    organizations,
    country,
    technology,
    sourceType,
    sourceId: sourceUrl || "unknown"
  };
}
