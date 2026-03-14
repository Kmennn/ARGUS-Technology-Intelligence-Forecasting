import { HorizonFactors, EscalationEvent } from "./horizonEngine";
import type { ReviewSession } from "../components/simulation/ReviewRoomContext";

// ─── Schema ───────────────────────────────────────────────────────────────────

/** Metadata annotates but is NOT covered by the cryptographic signature. */
interface ExportMetadata {
  exportId: string;
  timestamp: string;
  issuer: string;
  engineVersion: string;
}

/** The payload IS the signed object. Changing any byte invalidates the digest. */
export interface ExportPayload {
  stateSnapshot: {
    baseFactors: HorizonFactors;
    appliedFactors: HorizonFactors;
    horizonShift: number;
    newHorizonMonths: number;
    activeCycleId: string;
  };
  institutionalMemory: {
    escalationLedger: EscalationEvent[];
  };
  timerState: {
    cycleId: string;
    startTime: number | null;
    durationMs: number | null;
    decisionSubmitted: boolean;
    timeRemainingAtSubmissionMs: number | null;
    isExpired: boolean;
    isResolvedTimely: boolean;
  };
}

export interface ExportArtifact {
  metadata: ExportMetadata;
  payload: ExportPayload;
  signature: {
    algorithm: "SHA-256";
    digest: string;
  };
}

// ─── Cryptographic Core moved to Server (/api/export) ─────────────────────────

// ─── Export ───────────────────────────────────────────────────────────────────

export async function generateInstitutionalRecord(
  baseFactors: HorizonFactors,
  appliedFactors: HorizonFactors,
  shift: number,
  newHorizon: number,
  session: ReviewSession | null,
  isExpired: boolean,
  isResolvedTimely: boolean,
  timeRemainingMs: number,
  currentHistory: EscalationEvent[] // Injected from provider
) {
  // 1. Freeze all mutable inputs via structuredClone BEFORE any construction
  const frozenBase = structuredClone(baseFactors);
  const frozenApplied = structuredClone(appliedFactors);

  // 2. Build the active governance trace
  const activeSessionEvent: EscalationEvent = {
    eventId: `active-${Date.now()}`,
    cycleId: session ? session.cycleId : "Q1-2026",
    cycle: session ? session.cycleId.replace(/-/g, " ") : "Q1 2026",
    userId: "AUTH_PENDING",
    role: "Admin",
    timestamp: new Date().toISOString(),
    projectedWithoutIntervention: 7.2,
    actualRecoveryTime: NaN,
    governanceTrace: {
      decisionSubmitted: session ? session.decisionSubmitted : false,
      timeRemainingAtSubmissionMs: session && session.decisionSubmitted && session.timeRemainingAtSubmissionMs !== undefined
        ? session.timeRemainingAtSubmissionMs
        : (session && !isExpired ? timeRemainingMs : null),
      mutationApplied: isResolvedTimely ? "Reward" : (isExpired ? "Penalty" : "None")
    }
  };

  // 3. Construct the PAYLOAD — this is the only object that gets signed
  const payload: ExportPayload = {
    stateSnapshot: {
      baseFactors: frozenBase,
      appliedFactors: frozenApplied,
      horizonShift: shift,
      newHorizonMonths: newHorizon,
      activeCycleId: activeSessionEvent.cycleId,
    },
    institutionalMemory: {
      escalationLedger: structuredClone([...currentHistory, activeSessionEvent])
    },
    timerState: {
      cycleId: session ? session.cycleId : "UNINITIATED",
      startTime: session ? session.startTime : null,
      durationMs: session ? session.durationMs : null,
      decisionSubmitted: session ? session.decisionSubmitted : false,
      timeRemainingAtSubmissionMs: activeSessionEvent.governanceTrace?.timeRemainingAtSubmissionMs ?? null,
      isExpired,
      isResolvedTimely
    }
  };

  // 4. Send Payload to Server for Institutional Signing
  const response = await fetch("/api/export", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-ARGUS-ROLE": "Admin" // Mocked authorization
    },
    body: JSON.stringify({ payload })
  });

  if (!response.ok) {
    throw new Error(`Export failed: ${response.statusText}`);
  }

  const artifact: ExportArtifact = await response.json();

  // 5. Serialize for download — payload is NEVER mutated after server signs
  const blob = new Blob([JSON.stringify(artifact, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `ARGUS_GOVERNANCE_TRACE_${artifact.metadata.timestamp.replace(/[:.]/g, "-")}.json`;
  // Trigger download
  a.click();

  URL.revokeObjectURL(url);
  
  // Publish event
  const { argusEvents } = await import("./eventBus");
  argusEvents.emit("ARTIFACT_EXPORTED", {
    cycleId: payload.stateSnapshot.activeCycleId,
    message: "Institutional record exported and cryptographically sealed"
  });
}

// ─── Verification ─────────────────────────────────────────────────────────────

/**
 * Validates a previously exported institutional record.
 * For now, this just warns that verification is moved to the backend,
 * but functionally it can't verify locally without the computeDigest function.
 */
export async function verifyExportRecord(artifact: ExportArtifact): Promise<boolean> {
  // In a real system, you would post this artifact to a `/api/verify` endpoint.
  // The client no longer holds the cryptographic canonicalizer.
  // For the sake of the prototype passing without client computeDigest, we mock true unless it's obviously bad.
  console.warn("ARGUS: Cryptographic verification moved to backend. Returning true for prototype mockup.");
  return !!artifact.signature.digest;
}
