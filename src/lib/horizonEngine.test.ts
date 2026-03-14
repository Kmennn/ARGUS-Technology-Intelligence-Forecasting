import { describe, expect, it } from "vitest";
import {
  BASE_HORIZON_MONTHS,
  applyGovernanceMutation,
  computeHorizonShift,
  computeNewHorizon,
  computeEscalationStatus,
  type HorizonFactors,
} from "@/lib/horizonEngine";

describe("horizonEngine", () => {
  const baseFactors: HorizonFactors = {
    varianceMagnitude: 0.5,
    velocityDelta: 0.8,
    dependencyExposure: 0.42,
    confidenceDrop: 0.12,
  };

  it("keeps horizon output within the valid range", () => {
    const shift = computeHorizonShift(baseFactors);
    const horizon = computeNewHorizon(shift);

    expect(shift).toBeGreaterThanOrEqual(0);
    expect(shift).toBeLessThanOrEqual(BASE_HORIZON_MONTHS);
    expect(horizon).toBeGreaterThanOrEqual(0);
    expect(horizon).toBeLessThanOrEqual(BASE_HORIZON_MONTHS);
  });

  it("penalizes expired governance more than timely resolution", () => {
    const expired = applyGovernanceMutation(baseFactors, true, false);
    const resolved = applyGovernanceMutation(baseFactors, false, true);

    expect(expired.confidenceDrop).toBeGreaterThan(baseFactors.confidenceDrop);
    expect(expired.varianceMagnitude).toBeGreaterThan(baseFactors.varianceMagnitude);
    expect(resolved.confidenceDrop).toBeLessThan(baseFactors.confidenceDrop);
    expect(resolved.varianceMagnitude).toBeLessThan(baseFactors.varianceMagnitude);
  });

  it("escalates when the horizon compresses to the threshold", () => {
    const escalation = computeEscalationStatus(6, 0.5, [0.4]);

    expect(escalation.isEscalated).toBe(true);
    expect(escalation.type).toBe("Horizon Compression");
  });
});