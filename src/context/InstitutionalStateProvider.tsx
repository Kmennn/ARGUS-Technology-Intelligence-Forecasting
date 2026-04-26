"use client";

import React, { createContext, useContext, useMemo } from "react";
import {
  HorizonFactors,
  EscalationResult,
  applyGovernanceMutation,
  computeHorizonShift,
  computeNewHorizon,
  computeEscalationStatus,
  ESCALATION_HISTORY,
  EscalationEvent,
} from "@/lib/horizonEngine";
import { useReviewRoom } from "@/components/simulation/ReviewRoomContext";
import { useSession } from "next-auth/react";
import { Role } from "@/lib/auth";

// ─── Engine Slice ─────────────────────────────────────────────────────────────
// Purely derived. Memoized. No side effects.
// Depends only on baseFactors + governance mutation booleans.

interface EngineState {
  baseFactors: HorizonFactors;
  appliedFactors: HorizonFactors;
  horizonShift: number;
  newHorizon: number;
  escalationResult: EscalationResult;
  currentPressure: number;
  previousPressure: number[];
}

const EngineContext = createContext<EngineState | null>(null);

// ─── Governance Slice ─────────────────────────────────────────────────────────
// Owns institutional memory. Eventually fetched from /api/governance.

interface GovernanceState {
  escalationHistory: EscalationEvent[];
  mutationType: "Penalty" | "Reward" | "None";
}

const GovernanceContext = createContext<GovernanceState | null>(null);

// ─── Constants ────────────────────────────────────────────────────────────────
// Static base factors. In production these would come from a configuration API.

const BASE_FACTORS: HorizonFactors = {
  varianceMagnitude: 0.5,
  velocityDelta: 0.8,
  dependencyExposure: 0.42,
  confidenceDrop: 0.12,
};

const CURRENT_PRESSURE = 0.73;
const PREVIOUS_PRESSURE = [0.70, 0.75];

// ─── Provider ─────────────────────────────────────────────────────────────────

export function InstitutionalStateProvider({ children }: { children: React.ReactNode }) {
  // Simulation slice is already its own isolated provider (ReviewRoomContext).
  // We only consume the TWO boolean signals that affect the engine.
  const { isExpired, isResolvedTimely, session } = useReviewRoom();
  const { data: sessionData } = useSession();
  const role = ((sessionData?.user as { role?: Role })?.role) || "Analyst";

  const [escalationHistory, setEscalationHistory] = React.useState<EscalationEvent[]>(ESCALATION_HISTORY);

  // 1. Hydrate institutional memory on mount
  React.useEffect(() => {
    fetch("/api/governance")
      .then((res) => {
        if (!res.ok) throw new Error("API Route missing or failed");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setEscalationHistory(data);
        }
      })
      .catch((err) => console.error("ARGUS: Governance hydration failed. Using static fallback.", err));
  }, []);

  // 2. Automate Institutional Appending (POST on session end)
  React.useEffect(() => {
    if (!session) return;
    if (!isExpired && !isResolvedTimely) return; // Session still active, math is pending

    // Idempotency check: Don't POST if this cycle is already in history
    if (escalationHistory.some(e => e.cycleId === session.cycleId)) {
      return;
    }

    // Isolate the mathematical delta of this specific event
    const preMutationFactors = applyGovernanceMutation(BASE_FACTORS, false, false);
    const preHorizon = computeNewHorizon(computeHorizonShift(preMutationFactors));

    const postMutationFactors = applyGovernanceMutation(BASE_FACTORS, isExpired, isResolvedTimely);
    const postHorizon = computeNewHorizon(computeHorizonShift(postMutationFactors));

    const mutationApplied = isResolvedTimely ? "Reward" : isExpired ? "Penalty" : "None";

    const newRecord: EscalationEvent = {
      eventId: `gov-${Date.now()}`,
      cycleId: session.cycleId,
      cycle: session.cycleId.replace(/-/g, " "),
      userId: "AUTH_PENDING", // To be hardened in RBAC phase
      role: "Admin",          // To be hardened in RBAC phase
      timestamp: new Date().toISOString(),
      projectedWithoutIntervention: Number(preHorizon.toFixed(1)),
      actualRecoveryTime: Number(postHorizon.toFixed(1)),
      governanceTrace: {
        decisionSubmitted: session.decisionSubmitted,
        timeRemainingAtSubmissionMs: session.timeRemainingAtSubmissionMs ?? 0,
        mutationApplied,
      }
    };

    // Optimistic memory update
    setEscalationHistory(prev => [...prev, newRecord]);

    // Async institutional append to backend
    fetch("/api/governance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-ARGUS-ROLE": role,
      },
      body: JSON.stringify(newRecord),
    }).catch(err => console.error("ARGUS: Critical failure in governance write.", err));

  }, [isExpired, isResolvedTimely, role, session, escalationHistory]);

  // ── Governance Slice ──
  // Mutation type is derived from the two simulation booleans.
  // This derivation is O(1) and does not depend on the timer tick.
  const mutationType: GovernanceState["mutationType"] = useMemo(() => {
    if (isResolvedTimely) return "Reward";
    if (isExpired) return "Penalty";
    return "None";
  }, [isExpired, isResolvedTimely]);

  const governanceState: GovernanceState = useMemo(() => ({
    escalationHistory,
    mutationType,
  }), [mutationType, escalationHistory]);

  // ── Engine Slice ──
  // Computed ONCE per mutation state change, NOT per timer tick.
  // isExpired / isResolvedTimely only flip once per session, so this
  // recomputes at most twice in the entire lifecycle of a review cycle.
  const engineState: EngineState = useMemo(() => {
    const appliedFactors = applyGovernanceMutation(BASE_FACTORS, isExpired, isResolvedTimely);
    const horizonShift = computeHorizonShift(appliedFactors);
    const newHorizon = computeNewHorizon(horizonShift);
    const escalationResult = computeEscalationStatus(newHorizon, CURRENT_PRESSURE, PREVIOUS_PRESSURE);

    return {
      baseFactors: BASE_FACTORS,
      appliedFactors,
      horizonShift,
      newHorizon,
      escalationResult,
      currentPressure: CURRENT_PRESSURE,
      previousPressure: PREVIOUS_PRESSURE,
    };
  }, [isExpired, isResolvedTimely]);

  return (
    <EngineContext.Provider value={engineState}>
      <GovernanceContext.Provider value={governanceState}>
        {children}
      </GovernanceContext.Provider>
    </EngineContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useEngine(): EngineState {
  const ctx = useContext(EngineContext);
  if (!ctx) throw new Error("ARGUS: useEngine must be used within InstitutionalStateProvider.");
  return ctx;
}

export function useGovernance(): GovernanceState {
  const ctx = useContext(GovernanceContext);
  if (!ctx) throw new Error("ARGUS: useGovernance must be used within InstitutionalStateProvider.");
  return ctx;
}
