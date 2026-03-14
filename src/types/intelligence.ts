/**
 * Intelligence & Explainability Data Contracts
 * Defines structures for queries, explanations, and evidence
 */

/** Confidence level for claims */
export type ConfidenceLevel = "low" | "medium" | "high";

/** Evidence type */
export interface EvidenceSource {
  type: "paper" | "lab" | "field" | "patent" | "news" | "expert";
  label: string;
  count: number;
  icon: string;
}

/** A claim with supporting evidence */
export interface ExplanationData {
  /** The claim being made */
  claim: string;
  /** Confidence in the claim */
  confidence: ConfidenceLevel;
  /** Confidence as percentage (0-100) */
  confidenceScore: number;
  /** Evidence sources supporting the claim */
  evidence: EvidenceSource[];
  /** Reasoning bullets */
  reasoning: string[];
  /** When this explanation was generated */
  generatedAt?: string;
  /** Source system — identifies data provenance */
  source?: "static" | "graphrag" | "llm" | "ground_truth" | "inference";
}

/** Example query for the query panel */
export interface ExampleQuery {
  id: string;
  text: string;
  category: "maturity" | "convergence" | "trl" | "comparison";
}

/** Confidence level metadata */
export const CONFIDENCE_CONFIG: Record<ConfidenceLevel, { label: string; color: string; percentage: number }> = {
  low: { label: "Low", color: "#f59e0b", percentage: 33 },
  medium: { label: "Medium", color: "#0ea5e9", percentage: 66 },
  high: { label: "High", color: "#22c55e", percentage: 90 },
};

/** Evidence type icons */
export const EVIDENCE_ICONS: Record<string, string> = {
  paper: "📄",
  lab: "🔬",
  field: "📊",
  patent: "📜",
  news: "📰",
  expert: "👤",
};
