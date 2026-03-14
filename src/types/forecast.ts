/**
 * Forecast/Maturity Curves Data Contracts
 * Defines the structure for S-Curve and Hype Cycle data
 */

/** A point on a maturity curve */
export interface CurvePoint {
  /** Time position (year string or 0-100 normalized) */
  time: string | number;
  /** Value at this point (0-100) */
  value: number;
  /** Optional phase annotation */
  phase?: string;
}

/** S-Curve phase markers */
export type SCurvePhase = "Emergence" | "Growth" | "Plateau";

/** Hype Cycle phase markers */
export type HypeCyclePhase = "Trigger" | "Peak" | "Trough" | "Slope" | "Plateau";

/** Maturity curve data bundle */
export interface MaturityCurveData {
  /** S-Curve data points */
  sCurve: CurvePoint[];
  /** Hype Cycle data points */
  hypeCycle: CurvePoint[];
  /** Technology this curve represents (optional) */
  technologyId?: string;
}
