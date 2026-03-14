import { 
  HorizonFactors, 
  computeHorizonShift, 
  computeNewHorizon, 
  computeEscalationStatus,
  EscalationResult
} from "./horizonEngine";
import { argusEvents } from "./eventBus";

export interface ScenarioInput {
  id: string;
  name: string;
  description: string;
  factorOverrides: Partial<HorizonFactors>;
  pressureDelta?: number; 
}

export interface ScenarioResult {
  scenarioId: string;
  name: string;
  description: string;
  horizon: number;
  pressure: number;
  escalation: EscalationResult;
  deltaHorizon: number; 
  deltaPressure: number;
}

/**
 * Runs a parallel future simulation based on the current system state.
 * Does not mutate the actual system state.
 */
export function simulateScenario(
  input: ScenarioInput,
  baseFactors: HorizonFactors,
  basePressure: number,
  previousPressure: number[]
): ScenarioResult {
  // Apply overrides to base factors
  const simulatedFactors: HorizonFactors = {
    ...baseFactors,
    ...input.factorOverrides
  };

  // Compute simulated horizon
  const simulatedShift = computeHorizonShift(simulatedFactors);
  const simulatedHorizon = computeNewHorizon(simulatedShift);
  
  // Compute simulated pressure
  const simulatedPressure = Math.max(0, Math.min(1, basePressure + (input.pressureDelta || 0)));
  
  // Compute resulting escalation
  const escalation = computeEscalationStatus(simulatedHorizon, simulatedPressure, previousPressure);
  
  // Compute baseline for delta calculations
  const baseShift = computeHorizonShift(baseFactors);
  const baseHorizon = computeNewHorizon(baseShift);
  
  const deltaHorizon = simulatedHorizon - baseHorizon;
  const deltaPressure = simulatedPressure - basePressure;

  argusEvents.emit("SCENARIO_RUN", {
    message: `[SIMULATION] Executed: ${input.name}`,
    metadata: { 
      horizon: simulatedHorizon.toFixed(1) + " mo", 
      pressure: simulatedPressure.toFixed(2),
      delta: deltaHorizon > 0 ? "+" + deltaHorizon.toFixed(1) + " mo" : deltaHorizon.toFixed(1) + " mo"
    }
  });

  return {
    scenarioId: input.id,
    name: input.name,
    description: input.description,
    horizon: simulatedHorizon,
    pressure: simulatedPressure,
    escalation,
    deltaHorizon,
    deltaPressure
  };
}

/**
 * Compares an array of scenario results, emitting a telemetry event.
 */
export function compareScenarios(scenarios: ScenarioResult[]) {
  if (scenarios.length === 0) return;
  
  const minHorizon = Math.min(...scenarios.map(s => s.horizon));
  const maxHorizon = Math.max(...scenarios.map(s => s.horizon));
  const divergence = maxHorizon - minHorizon;

  argusEvents.emit("SCENARIO_COMPARED", {
    message: `[DIVERGENCE] Maximum strategic divergence between scenarios: ${divergence.toFixed(1)} months`,
  });
}

// ─── MONTE CARLO PROBABILISTIC FORECASTING ──────────────────────────────────

/**
 * Seeded pseudo-random number generator (Mulberry32).
 * Deterministic: same seed always produces the same sequence.
 * This enables reproducible simulations for audit artifacts.
 */
function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Applies ±10% Gaussian-like noise to each factor using seeded randomness.
 * This models real-world signal uncertainty.
 */
function applyNoise(
  factors: HorizonFactors,
  rng: () => number,
  intensity: number = 0.2
): HorizonFactors {
  const jitter = (value: number) => {
    const noise = (rng() - 0.5) * intensity;
    return Math.max(0, Math.min(1, value * (1 + noise)));
  };

  return {
    varianceMagnitude: jitter(factors.varianceMagnitude),
    velocityDelta: jitter(factors.velocityDelta),
    dependencyExposure: jitter(factors.dependencyExposure),
    confidenceDrop: jitter(factors.confidenceDrop),
  };
}

/** Statistical summary of a Monte Carlo simulation batch. */
export interface MonteCarloSummary {
  mean: number;
  median: number;
  min: number;
  max: number;
  p10: number;
  p90: number;
  stdDev: number;
  runs: number;
  seed: number;
  /** Probability that horizon falls below the escalation threshold (6 months). */
  collapseRisk: number;
}

/**
 * Summarizes a distribution of horizon values from simulation runs.
 */
function summarize(values: number[], seed: number): MonteCarloSummary {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n;

  const COLLAPSE_THRESHOLD = 6; // months

  return {
    mean,
    median,
    min: sorted[0],
    max: sorted[n - 1],
    p10: sorted[Math.floor(n * 0.1)],
    p90: sorted[Math.floor(n * 0.9)],
    stdDev: Math.sqrt(variance),
    runs: n,
    seed,
    collapseRisk: sorted.filter(v => v <= COLLAPSE_THRESHOLD).length / n,
  };
}

/**
 * Runs a batched Monte Carlo simulation.
 *
 * @param baseFactors  The current system factor state.
 * @param overrides    Optional factor overrides (simulating a policy change).
 * @param runs         Number of simulation runs (default 200).
 * @param seed         Seed for reproducibility (default Date.now()).
 */
export function runMonteCarloSimulation(
  baseFactors: HorizonFactors,
  overrides: Partial<HorizonFactors> = {},
  runs: number = 200,
  seed: number = Date.now()
): MonteCarloSummary {
  const rng = mulberry32(seed);
  const mergedFactors: HorizonFactors = { ...baseFactors, ...overrides };
  const horizons: number[] = [];

  argusEvents.emit("SCENARIO_MONTE_CARLO_STARTED", {
    message: `[MONTE CARLO] Simulation initiated (${runs} runs, seed=${seed})`,
  });

  for (let i = 0; i < runs; i++) {
    const noisyFactors = applyNoise(mergedFactors, rng);
    const shift = computeHorizonShift(noisyFactors);
    const horizon = computeNewHorizon(shift);
    horizons.push(horizon);
  }

  const summary = summarize(horizons, seed);

  argusEvents.emit("SCENARIO_MONTE_CARLO_FINISHED", {
    message: `[MONTE CARLO] Completed: mean=${summary.mean.toFixed(1)} mo, range=${summary.min.toFixed(1)}–${summary.max.toFixed(1)} mo, P(collapse)=${(summary.collapseRisk * 100).toFixed(0)}%`,
  });

  return summary;
}
