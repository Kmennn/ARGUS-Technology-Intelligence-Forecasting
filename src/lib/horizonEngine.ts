/**
 * PHASE 5: DETERMINISTIC HORIZON ENGINE
 * 
 * This module strictly computes temporal dominance metrics based on systemic ingestion data.
 * No heuristic overrides, qualitative flags, or human injection are permitted.
 * 
 * All outputs are procedural inevitabilities derived from the mathematical state of the system.
 */

// Institutional standard projection window
export const BASE_HORIZON_MONTHS = 12;
export const ENGINE_VERSION = "ARGUS-1.2";

// Weights fixed per issuance doctrine (Phase 5)
// Alteration requires governance review
export const HORIZON_WEIGHTS = {
  variance: 0.35,
  velocity: 0.30,
  dependency: 0.20,
  confidenceDecay: 0.15,
} as const;

/**
 * Mathematical proof of weight sum:
 * 0.35 + 0.30 + 0.20 + 0.15 = 1.00
 */

export interface HorizonFactors {
  /** |Observed - Projected| / Tolerance Band */
  varianceMagnitude: number; 
  /** Signal Velocity Δ normalized (0–1) */
  velocityDelta: number;     
  /** Cross-domain exposure % normalized (0–1) */
  dependencyExposure: number;
  /** Confidence drop since issuance cycle (0–1) */
  confidenceDrop: number;    
}

/**
 * Audit-hardening constraint: Clamps values between 0 and 1.
 */
function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/**
 * PHASE 7.2: GOVERNANCE MUTATION
 * Translates human action/inaction directly into institutional mathematical drift.
 * Purely mathematical, idempotent, and cycle-scoped. It derives from static base factors
 * and current session state, guaranteeing no infinite stacking on refresh.
 */
export function applyGovernanceMutation(
  factors: HorizonFactors, 
  isExpired: boolean, 
  isResolvedTimely: boolean
): HorizonFactors {
  
  if (isExpired) {
    return {
      ...factors,
      // Severe absolute penalty to institutional confidence for inaction
      confidenceDrop: clamp01(factors.confidenceDrop + 0.15), 
      // 15% relative compounding of variance due to ungoverned drift
      varianceMagnitude: clamp01(factors.varianceMagnitude * 1.15), 
    };
  }

  if (isResolvedTimely) {
    return {
      ...factors,
      // Institutional reward for decisive operational governance
      confidenceDrop: clamp01(factors.confidenceDrop - 0.05),
      // Mathematically stabilizing variance by 10%
      varianceMagnitude: clamp01(factors.varianceMagnitude * 0.90),
    };
  }

  // Active but unexpired review, or no review
  return factors;
}

/**
 * Computes non-linear impact of a single factor to better model real-world stress.
 * Uses a soft-exponential curve: low inputs stay gentle, high inputs accelerate.
 * Formula: weight × factor × (1 + factor²)
 *   factor=0.1 → multiplier ≈ 1.01 (nearly linear)
 *   factor=0.5 → multiplier = 1.25  (mild amplification)
 *   factor=0.9 → multiplier = 1.81  (strong amplification)
 */
export function nonlinearImpact(weight: number, factor: number): number {
  return weight * factor * (1 + factor * factor);
}

/**
 * Computes the deterministic horizon shift based on strict systemic factors.
 * @returns Shift in months (ΔH)
 */
export function computeHorizonShift(factors: HorizonFactors): number {
  const variance = clamp01(factors.varianceMagnitude);
  const velocity = clamp01(factors.velocityDelta);
  const dependency = clamp01(factors.dependencyExposure);
  const confidence = clamp01(factors.confidenceDrop);

  let shiftFactor = 
    nonlinearImpact(HORIZON_WEIGHTS.variance, variance) +
    nonlinearImpact(HORIZON_WEIGHTS.velocity, velocity) +
    nonlinearImpact(HORIZON_WEIGHTS.dependency, dependency) +
    nonlinearImpact(HORIZON_WEIGHTS.confidenceDecay, confidence);
    
  // Cascade amplification: simultaneous spikes across distinct risk vectors
  // exponentiably erode institutional resilience.
  if (variance > 0.6 && dependency > 0.6) {
    shiftFactor *= 1.25;
  }
    
  // Bounded shift factor must not exceed 1.00, protecting against future governance drift
  const boundedShiftFactor = Math.min(1, shiftFactor);
  
  // Shift is a fraction of the base horizon
  return BASE_HORIZON_MONTHS * boundedShiftFactor;
}

// Governance thresholds for escalation triggers
export const ESCALATION_HORIZON_THRESHOLD = 6;
export const ESCALATION_PRESSURE_THRESHOLD = 0.78;

/**
 * Returns the new compressed horizon in months (H₀ - ΔH).
 */
export function computeNewHorizon(shiftMonths: number): number {
  // Horizon cannot be logically negative, floor at 0
  return Math.max(0, BASE_HORIZON_MONTHS - shiftMonths);
}

export type EscalationType = "None" | "Horizon Compression" | "Sustained Pressure";

export interface EscalationResult {
  isEscalated: boolean;
  type: EscalationType;
}

/**
 * Evaluates binary escalation condition and returns the causal path.
 * 
 * Escalation Trigger:
 * - Horizon <= 6 months OR
 * - Allocation Pressure >= 0.78 for 2 consecutive cycles
 */
export function computeEscalationStatus(
  currentHorizon: number, 
  currentPressure: number, 
  previousPressure: number[]
): EscalationResult {
  const horizonTrigger = currentHorizon <= ESCALATION_HORIZON_THRESHOLD;
  
  // Checks if pressure exceeds threshold in current cycle AND the most recent prior cycle
  const sustainedPressure = 
    previousPressure.length >= 1 &&
    previousPressure[previousPressure.length - 1] >= ESCALATION_PRESSURE_THRESHOLD &&
    currentPressure >= ESCALATION_PRESSURE_THRESHOLD;
  
  if (horizonTrigger) {
    return { isEscalated: true, type: "Horizon Compression" };
  }
  
  if (sustainedPressure) {
    return { isEscalated: true, type: "Sustained Pressure" };
  }

  return { isEscalated: false, type: "None" };
}

/**
 * Computes downstream horizon based on temporal coupling.
 * Coupling is strictly additive compression. Domains only subtract time downstream.
 */
export function computeCoupledHorizon(
  domainHorizon: number, 
  coupledCompression: number
): number {
  return Math.max(0, domainHorizon - Math.abs(coupledCompression));
}

// ----------------------------------------------------------------------------
// PHASE 6: OUTCOME FEEDBACK & MODEL CALIBRATION LAYER
// 
// Structural self-measurement of prediction error, escalation effectiveness, 
// and model drift over time.
// ----------------------------------------------------------------------------

export const GOVERNANCE_ERROR_TOLERANCE = 0.12;
export const COUPLING_DRIFT_THRESHOLD = 0.40;
export const WEIGHT_DRIFT_THRESHOLD = 0.10;

// --- Data Structures ---

export interface HorizonRecord {
  cycle: string;
  projectedHorizon: number;
  actualOutcome: number;
}

export interface GovernanceTrace {
  decisionSubmitted: boolean;
  timeRemainingAtSubmissionMs: number | null;
  mutationApplied: "Penalty" | "Reward" | "None";
}

export interface EscalationEvent {
  eventId: string;
  cycleId: string;
  cycle: string;
  userId: string;
  role: string;
  timestamp: string;
  projectedWithoutIntervention: number;
  actualRecoveryTime: number;
  governanceTrace?: GovernanceTrace;
}

export interface CouplingAudit {
  cycle: string;
  driftIndex: number;
}

// --- Synthetic History Seeding ---
// Mimics a realistic institutional memory of model performance.

export const HORIZON_HISTORY: HorizonRecord[] = [
  {
    cycle: "Q3 2025",
    projectedHorizon: 9.2,
    actualOutcome: 6.8,  // major underestimation error
  },
  {
    cycle: "Q4 2025",
    projectedHorizon: 8.9,
    actualOutcome: 8.3,  // near alignment
  },
  {
    cycle: "Q1 2026",
    projectedHorizon: 5.8,
    actualOutcome: 7.6,  // moderate overestimation
  }
];

export const ESCALATION_HISTORY: EscalationEvent[] = [
  {
    eventId: "gov-fallback-001",
    cycleId: "Q3-2025",
    cycle: "Q3 2025",
    userId: "SYSTEM_SEED",
    role: "Admin",
    timestamp: "2025-07-15T10:00:00Z",
    projectedWithoutIntervention: 10.1,
    actualRecoveryTime: 8.7,  // saved 1.4 months
    governanceTrace: {
      decisionSubmitted: true,
      timeRemainingAtSubmissionMs: 4 * 60 * 1000,
      mutationApplied: "None"
    }
  },
  {
    eventId: "gov-fallback-002",
    cycleId: "Q4-2025",
    cycle: "Q4 2025",
    userId: "SYSTEM_SEED",
    role: "Admin",
    timestamp: "2025-10-15T10:00:00Z",
    projectedWithoutIntervention: 9.0,
    actualRecoveryTime: 9.2,  // escalation ineffective
    governanceTrace: {
      decisionSubmitted: false,
      timeRemainingAtSubmissionMs: 0,
      mutationApplied: "Penalty"
    }
  },
  {
    eventId: "gov-fallback-003",
    cycleId: "Q1-2026",
    cycle: "Q1 2026",
    userId: "SYSTEM_SEED",
    role: "Admin",
    timestamp: "2026-01-15T10:00:00Z",
    projectedWithoutIntervention: 6.8,
    actualRecoveryTime: 4.2,  // major save
    governanceTrace: {
      decisionSubmitted: true,
      timeRemainingAtSubmissionMs: 14 * 60 * 1000,
      mutationApplied: "Reward"
    }
  }
];

export const COUPLING_AUDIT_HISTORY: CouplingAudit[] = [
  { cycle: "Q3 2025", driftIndex: 0.31 },
  { cycle: "Q4 2025", driftIndex: 0.44 },
  { cycle: "Q1 2026", driftIndex: 0.65 }
];

export const WEIGHT_OBSERVED_IMPACT = {
  variance: 0.22,
  velocity: 0.41,
  dependency: 0.21,
  confidenceDecay: 0.16,
};

// --- Pure Calculation Functions ---

/**
 * Computes Mean Absolute Error (MAE) percentage for horizon predictions.
 * Error Rate = |Actual - Projected| / Base Horizon
 */
export function computeMeanAbsoluteError(records: HorizonRecord[]): number {
  if (records.length === 0) return 0;
  
  const totalErrorPercentage = records.reduce((sum, record) => {
    const absoluteError = Math.abs(record.actualOutcome - record.projectedHorizon);
    const errorPercentage = absoluteError / BASE_HORIZON_MONTHS;
    return sum + errorPercentage;
  }, 0);

  return totalErrorPercentage / records.length;
}

/**
 * Checks if the current MAE breaches governance tolerance.
 */
export function isCalibrationDrifting(mae: number): boolean {
  return mae > GOVERNANCE_ERROR_TOLERANCE;
}

/**
 * Returns the most recent coupling drift index.
 */
export function computeCurrentCouplingDrift(audits: CouplingAudit[]): number {
  if (audits.length === 0) return 0;
  return audits[audits.length - 1].driftIndex;
}

/**
 * Computes the temporal slope over the entire provided audit history.
 */
export function computeCouplingDriftTrend(audits: CouplingAudit[]): number {
  if (audits.length < 2) return 0;
  const first = audits[0].driftIndex;
  const last = audits[audits.length - 1].driftIndex;
  // Raw delta from start to finish
  return last - first;
}
