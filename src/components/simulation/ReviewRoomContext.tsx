"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { DecisionAction } from "@/lib/decisionLedger";
import { useSession } from "next-auth/react";
import { Role } from "@/lib/auth";
import { argusEvents } from "@/lib/eventBus";

export interface ReviewSession {
  cycleId: string;
  startTime: number;
  durationMs: number;
  decisionSubmitted: boolean;
  timeRemainingAtSubmissionMs?: number;
}

interface ReviewContextValue {
  isSessionActive: boolean;
  isExpired: boolean;
  isResolvedTimely: boolean;
  timeRemainingMs: number;
  session: ReviewSession | null;
  initiateReview: (cycleId: string, durationMinutes?: number) => void;
  submitDecision: () => void;
}

const ReviewContext = createContext<ReviewContextValue | null>(null);

const STORAGE_KEY = "ARGUS_REVIEW_SESSION";

export function ReviewRoomProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<ReviewSession | null>(null);
  const [timeRemainingMs, setTimeRemainingMs] = useState<number>(0);
  const { data: sessionData } = useSession();
  const role = ((sessionData?.user as { role?: Role })?.role) || "Analyst";
  
  // Helper to log decisions to the server
  const logDecision = useCallback(async (
    action: DecisionAction,
    cycleId: string,
    stateBefore: { pressure: number; horizonMonths: number },
    stateAfter: { pressure: number; horizonMonths: number } | null,
    note?: string
  ) => {
    try {
      await fetch("/api/decisions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-ARGUS-ROLE": role,
        },
        body: JSON.stringify({
          cycleId,
          actor: "current-user",
          role,
          action,
          stateBefore,
          stateAfter,
          note,
        }),
      });
      // Force the ledger panel to refresh its fetch if it's mounted
      argusEvents.emit("DECISION_LOGGED", { cycleId, role, message: action });
      window.dispatchEvent(new Event("argus-decision-logged"));
    } catch (err) {
      console.error("ARGUS: Failed to log decision", err);
    }
  }, [role]);

  // Hydrate exact temporal state from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ReviewSession;
        setSession(parsed);
      } catch {
        console.error("ARGUS: Failed to parse review session memory.");
      }
    }
  }, []);

  // Deterministic tick engine
  useEffect(() => {
    if (!session) return;

    // Fixed math operation. Time is calculated against origin, never decremented iteratively.
    const computeRemaining = () => {
      const elapsed = Date.now() - session.startTime;
      return Math.max(0, session.durationMs - elapsed);
    };

    // Audit-Proofing: Freeze the time immutably if the decision was submitted.
    // It must survive a refresh without bleeding to 0 over the next 15 minutes.
    if (session.decisionSubmitted && session.timeRemainingAtSubmissionMs !== undefined) {
      setTimeRemainingMs(session.timeRemainingAtSubmissionMs);
      return; 
    }

    // Initial computation to avoid 1-second delay
    const initialRemaining = computeRemaining();
    setTimeRemainingMs(initialRemaining);
    
    // Check for expiration immediately on mount/update
    if (initialRemaining <= 0 && !session.decisionSubmitted) {
      // It expired. Log it if we haven't already (simplified for prototype: we just log it once here)
      // In a real app we'd need a flag to prevent double-logging on refresh.
    }

    // 1-second resolution for the UI observer
    const intervalId = setInterval(() => {
      const ms = computeRemaining();
      setTimeRemainingMs(ms);
      
      if (ms <= 0 && !session.decisionSubmitted) {
        // Emit formal event to bus
        argusEvents.emit("REVIEW_EXPIRED", {
          cycleId: session.cycleId,
          message: "Review window expired without action",
          metadata: { pressure: 0.85, horizonMonths: 4.8 }
        });
        argusEvents.emit("GOVERNANCE_MUTATION", {
          cycleId: session.cycleId,
          message: "Penalty applied due to expiration",
        });

        logDecision(
          "REVIEW_EXPIRED",
          session.cycleId,
          { pressure: 0.73, horizonMonths: 6.2 }, // Mock current state
          { pressure: 0.85, horizonMonths: 4.8 }, // Mock penalty state
          "Review window expired without action"
        );
        logDecision(
          "GOVERNANCE_MUTATION_APPLIED",
          session.cycleId,
          { pressure: 0.73, horizonMonths: 6.2 },
          { pressure: 0.85, horizonMonths: 4.8 },
          "Penalty applied due to expiration"
        );
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [logDecision, session]);

  const initiateReview = (cycleId: string, durationMinutes = 15) => {
    // Doctrine Restriction: Prevents resetting a clock for the current cycle
    if (session && session.cycleId === cycleId) {
      console.warn(`ARGUS: Review cycle ${cycleId} is already etched. Restart prohibited.`);
      return; 
    }

    const newSession: ReviewSession = {
      cycleId,
      startTime: Date.now(),
      durationMs: durationMinutes * 60 * 1000,
      decisionSubmitted: false,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
    setSession(newSession);
    
    // Broadcast standard event
    argusEvents.emit("REVIEW_INITIATED", {
      cycleId,
      message: "Strategic review manually initiated by Allocator"
    });

    // Log initialization to ledger
    logDecision(
      "INITIATE_REVIEW",
      cycleId,
      { pressure: 0.73, horizonMonths: 6.2 }, // Mock current state
      null,
      "Strategic review manually initiated by Allocator"
    );
  };

  const submitDecision = () => {
    if (!session) return;
    
    const elapsed = Date.now() - session.startTime;
    const frozenTimeRemaining = Math.max(0, session.durationMs - elapsed);

    // Freeze the specific moment of governance to permanently decouple from Date.now() bleed.
    const updatedSession: ReviewSession = { 
      ...session, 
      decisionSubmitted: true,
      timeRemainingAtSubmissionMs: frozenTimeRemaining
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSession));
    setSession(updatedSession);
    
    // Broadcast standard event
    argusEvents.emit("REVIEW_SUBMITTED", {
      cycleId: session.cycleId,
      message: "Decision securely submitted before deadline"
    });
    argusEvents.emit("GOVERNANCE_MUTATION", {
      cycleId: session.cycleId,
      message: "Reward mutation applied for timely resolution"
    });

    // Log submission to ledger
    logDecision(
      "SUBMIT_DECISION",
      session.cycleId,
      { pressure: 0.73, horizonMonths: 6.2 }, // Mock current state
      { pressure: 0.61, horizonMonths: 7.5 }, // Mock reward state
      "Decision securely submitted before deadline"
    );
    logDecision(
      "GOVERNANCE_MUTATION_APPLIED",
      session.cycleId,
      { pressure: 0.73, horizonMonths: 6.2 },
      { pressure: 0.61, horizonMonths: 7.5 },
      "Reward mutation applied for timely resolution"
    );
  };

  const isSessionActive = !!session && !session.decisionSubmitted;
  // If time hit zero and no action was taken -> expired.
  const isExpired = !!session && !session.decisionSubmitted && timeRemainingMs <= 0;
  
  // Immutably derive resolving timeliness from the frozen memory, not the ticking clock
  const resolvedTimeMs = session?.decisionSubmitted && session.timeRemainingAtSubmissionMs !== undefined 
    ? session.timeRemainingAtSubmissionMs 
    : timeRemainingMs;
    
  const isResolvedTimely = !!session && session.decisionSubmitted && resolvedTimeMs > 0;

  return (
    <ReviewContext.Provider
      value={{
        isSessionActive,
        isExpired,
        isResolvedTimely,
        timeRemainingMs,
        session,
        initiateReview,
        submitDecision,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
}

export function useReviewRoom() {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error("ARGUS: useReviewRoom must be used within the ReviewRoomProvider boundary.");
  }
  return context;
}
