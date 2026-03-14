/**
 * TRL Assessment Data Contracts
 * Defines the structure for Technology Readiness Level data
 */

/** Evidence type at a TRL milestone */
export interface TRLEvidence {
  type: "paper" | "lab" | "field" | "operational";
  label: string;
}

/** A technology's TRL assessment */
export interface TRLAssessment {
  /** Technology identifier */
  technologyId: string;
  /** Technology display name */
  technologyName: string;
  /** Current assessed TRL (1-9) */
  currentTRL: number;
  /** Confidence range [min, max] */
  confidenceRange: [number, number];
  /** Evidence at specific TRL milestones */
  evidence: Record<number, TRLEvidence>;
  /** Assessment date (ISO string) */
  assessedAt?: string;
  /** Assessor identifier */
  assessedBy?: string;
}

/** TRL level descriptions */
export const TRL_DESCRIPTIONS: Record<number, string> = {
  1: "Basic principles observed",
  2: "Technology concept formulated",
  3: "Experimental proof of concept",
  4: "Technology validated in lab",
  5: "Technology validated in environment",
  6: "Prototype demonstrated",
  7: "System prototype demonstrated",
  8: "System complete and qualified",
  9: "Proven in operational environment",
};
