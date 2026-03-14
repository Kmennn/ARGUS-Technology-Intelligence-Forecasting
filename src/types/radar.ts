/**
 * Technology Radar Data Contracts
 * Defines the structure for technologies displayed on the radar
 */

/** Maturity ring: 1 = near-term, 2 = mid-term, 3 = long-term */
export type MaturityRing = 1 | 2 | 3;

/** A technology positioned on the radar */
export interface RadarTechnology {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Maturity ring (1-3 years, 3-7 years, 7-15 years) */
  ring: MaturityRing;
  /** Angular position in degrees (0-360) */
  angle: number;
  /** Brief description */
  description?: string;
  /** Optional TRL if assessed */
  trl?: number;
}

/** Ring metadata for display */
export interface RingInfo {
  ring: MaturityRing;
  label: string;
  radius: number;
}

export const RING_CONFIG: Record<MaturityRing, RingInfo> = {
  1: { ring: 1, label: "1–3 years", radius: 60 },
  2: { ring: 2, label: "3–7 years", radius: 100 },
  3: { ring: 3, label: "7–15 years", radius: 140 },
};
