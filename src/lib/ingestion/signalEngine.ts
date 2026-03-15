/* ═══════════════════════════════════════════════════════════════ */
/*  ARGUS Signal Extraction Engine                                  */
/*  Converts raw ingested data into structured ARGUS signals        */
/* ═══════════════════════════════════════════════════════════════ */

/* ─── Technology Keyword Dictionary ─── */
const TECH_KEYWORDS: Record<string, { cluster: string; aliases: string[] }> = {
  // AI
  "neural network":        { cluster: "AI", aliases: ["deep learning", "neural net", "deep neural"] },
  "large language model":  { cluster: "AI", aliases: ["llm", "language model", "gpt", "transformer model"] },
  "reinforcement learning": { cluster: "AI", aliases: ["rl", "reward learning", "policy gradient"] },
  "computer vision":       { cluster: "AI", aliases: ["object detection", "image recognition", "visual perception"] },
  "generative ai":         { cluster: "AI", aliases: ["generative model", "diffusion model", "gen ai"] },
  "edge ai":               { cluster: "AI", aliases: ["on-device ai", "edge intelligence", "tinyml"] },

  // Autonomy
  "autonomous vehicle":    { cluster: "Autonomy", aliases: ["self-driving", "autonomous driving", "driverless"] },
  "swarm robotics":        { cluster: "Autonomy", aliases: ["drone swarm", "multi-robot", "swarm intelligence"] },
  "solid-state lidar":     { cluster: "Autonomy", aliases: ["lidar", "laser ranging", "3d scanning"] },
  "robotic autonomy":      { cluster: "Autonomy", aliases: ["autonomous robot", "unmanned system", "uas", "uav"] },

  // Semiconductors
  "neuromorphic processor": { cluster: "Semiconductors", aliases: ["neuromorphic chip", "spiking neural", "brain-inspired chip"] },
  "gan-on-diamond":        { cluster: "Semiconductors", aliases: ["gallium nitride", "gan rf", "gan power", "wide bandgap"] },
  "chiplet":               { cluster: "Semiconductors", aliases: ["chiplet architecture", "heterogeneous integration", "advanced packaging"] },
  "3nm":                   { cluster: "Semiconductors", aliases: ["2nm", "sub-5nm", "extreme ultraviolet", "euv lithography"] },

  // Communications
  "6g":                    { cluster: "Communications", aliases: ["sixth generation", "6g network", "terahertz communication"] },
  "ambient backscatter":   { cluster: "Communications", aliases: ["backscatter communication", "passive communication", "rf harvesting"] },
  "optical wireless":      { cluster: "Communications", aliases: ["free-space optical", "li-fi", "visible light communication"] },
  "satellite communication": { cluster: "Communications", aliases: ["satcom", "leo constellation", "starlink", "non-terrestrial network"] },

  // Quantum
  "quantum computing":     { cluster: "Quantum", aliases: ["qubit", "quantum processor", "quantum supremacy", "quantum advantage"] },
  "quantum key distribution": { cluster: "Quantum", aliases: ["qkd", "quantum encryption", "quantum cryptography"] },
  "quantum sensing":       { cluster: "Quantum", aliases: ["quantum sensor", "quantum magnetometer", "quantum radar"] },
  "post-quantum":          { cluster: "Quantum", aliases: ["post-quantum cryptography", "lattice-based cryptography", "pqc"] },

  // Hypersonics
  "hypersonic":            { cluster: "Hypersonics", aliases: ["hypersonic vehicle", "hypersonic missile", "scramjet", "mach 5+"] },
  "thermal protection":    { cluster: "Hypersonics", aliases: ["heat shield", "ablative material", "thermal barrier"] },
  "aerodynamic heating":   { cluster: "Hypersonics", aliases: ["hypersonic flow", "shock layer", "boundary layer transition"] },

  // Energy
  "solid-state battery":   { cluster: "Energy", aliases: ["solid electrolyte", "all-solid-state", "lithium metal battery"] },
  "perovskite solar":      { cluster: "Energy", aliases: ["perovskite photovoltaic", "tandem solar cell", "perovskite cell"] },
  "small modular reactor": { cluster: "Energy", aliases: ["smr", "micro reactor", "advanced reactor", "molten salt reactor"] },
  "hydrogen fuel cell":    { cluster: "Energy", aliases: ["green hydrogen", "proton exchange membrane", "pem fuel cell"] },
};

/* ─── TRL Language Signals ─── */
const TRL_INDICATORS: { pattern: RegExp; trl: number }[] = [
  { pattern: /\b(concept|theoretical|proposed|ideation)\b/i, trl: 1 },
  { pattern: /\b(formulation|research|feasibility study)\b/i, trl: 2 },
  { pattern: /\b(proof[- ]of[- ]concept|experimental|lab[- ]validated)\b/i, trl: 3 },
  { pattern: /\b(prototype|lab[- ]tested|breadboard|bench[- ]test)\b/i, trl: 4 },
  { pattern: /\b(simulated environment|relevant environment|pilot)\b/i, trl: 5 },
  { pattern: /\b(demonstrated|field[- ]test|operational environment)\b/i, trl: 6 },
  { pattern: /\b(system prototype|pre-production|integration test)\b/i, trl: 7 },
  { pattern: /\b(qualified|flight[- ]ready|mission[- ]qualified)\b/i, trl: 8 },
  { pattern: /\b(deployed|operational|production|in[- ]service|fielded)\b/i, trl: 9 },
];

/* ─── Source Trust Scores ─── */
const SOURCE_TRUST: Record<string, number> = {
  arxiv: 0.85,
  crossref: 0.90,
  patent: 0.85,
  news_major: 0.70,
  news_tech: 0.75,
  news_defense: 0.80,
  blog: 0.40,
  unknown: 0.50,
};

/* ═══════════════════════════════════════════════════════════════ */
/*  EXTRACTION FUNCTIONS                                            */
/* ═══════════════════════════════════════════════════════════════ */

export interface ExtractedSignal {
  technology: string;
  cluster: string;
  title: string;
  summary: string;
  trl: number;
  confidence: number;
  sourceType: string;
  sourceUrl: string | null;
}

/**
 * Detect technologies mentioned in text.
 * Returns array of { technology, cluster } matches.
 */
export function detectTechnologies(text: string): { technology: string; cluster: string }[] {
  const lower = text.toLowerCase();
  const matches: { technology: string; cluster: string }[] = [];
  const seenClusters = new Set<string>();

  for (const [tech, meta] of Object.entries(TECH_KEYWORDS)) {
    const allTerms = [tech, ...meta.aliases];
    for (const term of allTerms) {
      if (lower.includes(term.toLowerCase())) {
        // Avoid duplicate cluster hits from same text
        const key = `${tech}:${meta.cluster}`;
        if (!seenClusters.has(key)) {
          seenClusters.add(key);
          matches.push({ technology: tech, cluster: meta.cluster });
        }
        break;
      }
    }
  }

  return matches;
}

/**
 * Estimate TRL from text content using language signals.
 */
export function estimateTRL(text: string): number {
  let maxTrl = 1;
  for (const indicator of TRL_INDICATORS) {
    if (indicator.pattern.test(text)) {
      maxTrl = Math.max(maxTrl, indicator.trl);
    }
  }
  return maxTrl;
}

/**
 * Calculate confidence score for a source.
 */
export function calculateConfidence(sourceType: string, recencyDays: number, citationCount?: number): number {
  const baseTrust = SOURCE_TRUST[sourceType] ?? SOURCE_TRUST.unknown;

  // Recency decay: full value within 30 days, 50% at 180 days, floor at 0.3
  const recencyFactor = Math.max(0.3, 1 - (recencyDays / 365));

  // Citation boost (if available)
  const citationBoost = citationCount ? Math.min(0.1, citationCount / 500) : 0;

  return Math.min(1.0, baseTrust * recencyFactor + citationBoost);
}

/**
 * Extract ARGUS signals from a raw source document.
 */
export function extractSignals(
  title: string,
  abstract: string,
  sourceType: string,
  sourceUrl: string | null,
  publishedDate?: Date
): ExtractedSignal[] {
  const fullText = `${title} ${abstract}`;
  const techs = detectTechnologies(fullText);

  if (techs.length === 0) return [];

  const trl = estimateTRL(fullText);
  const recencyDays = publishedDate
    ? Math.max(0, (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24))
    : 30;
  const confidence = calculateConfidence(sourceType, recencyDays);

  return techs.map((tech) => ({
    technology: tech.technology,
    cluster: tech.cluster,
    title,
    summary: abstract.slice(0, 500),
    trl,
    confidence,
    sourceType,
    sourceUrl,
  }));
}

/**
 * Generate a deterministic signal ID from technology + source.
 */
export function generateSignalId(technology: string, sourceUrl: string | null): string {
  const base = `${technology}:${sourceUrl || "unknown"}`;
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    const chr = base.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return `sig-live-${Math.abs(hash).toString(36)}`;
}
