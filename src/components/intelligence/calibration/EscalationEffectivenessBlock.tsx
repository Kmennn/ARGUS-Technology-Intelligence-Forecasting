import React from "react";
import { EscalationEvent } from "@/lib/horizonEngine";
import { useReviewRoom } from "../../simulation/ReviewRoomContext";
import { useGovernance } from "@/context/InstitutionalStateProvider";

export function EscalationEffectivenessBlock() {
  const { isExpired, isResolvedTimely, session, timeRemainingMs } = useReviewRoom();
  const { escalationHistory } = useGovernance();

  // Hardened Audit: The current cycle exists in memory regardless of whether the review was initiated, active, or closed.
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

  // If the active session cycle is already historically written, don't duplicate it by appending activeSessionEvent
  const displayHistory = escalationHistory.some(e => e.cycleId === activeSessionEvent.cycleId) 
    ? escalationHistory 
    : [...escalationHistory, activeSessionEvent];

  return (
    <div className="border border-[var(--border-soft)] w-full font-mono text-sm tracking-tight flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 bg-[var(--background-alt)] border-b border-[var(--border-soft)] flex justify-between items-center">
        <span className="font-bold text-[var(--ink-primary)]">ESCALATION EFFECTIVENESS</span>
        <span className="text-[var(--ink-secondary)] text-xs">GOVERNANCE ROI</span>
      </div>

      {isExpired && session && (
        <div className="px-4 py-3 bg-red-900/5 border-b border-red-900/20 flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(220,38,38,0.03)_50%,transparent_75%)] bg-[length:4px_4px] pointer-events-none" />
          <div className="font-bold text-red-600 text-[10px] mb-1 uppercase tracking-widest relative z-10 flex items-center gap-2">
            <span className="w-1 h-1 bg-red-600 rounded-full animate-pulse"></span>
            Procedural Failure Detected ({session.cycleId})
          </div>
          <div className="flex justify-between items-center text-xs relative z-10">
            <span className="text-[var(--ink-secondary)]">Review Outcome:</span>
            <span className="font-bold text-red-600">Default Enforcement</span>
          </div>
          <div className="flex justify-between items-center text-xs relative z-10">
            <span className="text-[var(--ink-secondary)]">Human Decision:</span>
            <span className="font-bold text-red-600">None Submitted</span>
          </div>
          <div className="flex justify-between items-center text-xs relative z-10">
            <span className="text-[var(--ink-secondary)]">Recovery Cost:</span>
            <span className="font-bold text-red-600">+1.8 months additional compression</span>
          </div>
        </div>
      )}

      {isResolvedTimely && session && (
        <div className="px-4 py-3 bg-[var(--ink-primary)]/5 border-b border-[var(--ink-primary)]/20 flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(46,42,38,0.03)_50%,transparent_75%)] bg-[length:4px_4px] pointer-events-none" />
          <div className="font-bold text-[var(--ink-primary)] text-[10px] mb-1 uppercase tracking-widest relative z-10 flex items-center gap-2">
            <span className="w-1 h-1 bg-[var(--ink-primary)] rounded-full animate-pulse"></span>
            Timely Governance Acknowledged ({session.cycleId})
          </div>
          <div className="flex justify-between items-center text-xs relative z-10">
            <span className="text-[var(--ink-secondary)]">Review Outcome:</span>
            <span className="font-bold text-[var(--ink-primary)]">Strategic Recalibration Logged</span>
          </div>
          <div className="flex justify-between items-center text-xs relative z-10">
            <span className="text-[var(--ink-secondary)]">Human Decision:</span>
            <span className="font-bold text-[var(--ink-primary)]">Intervention Authorized</span>
          </div>
          <div className="flex justify-between items-center text-xs relative z-10">
            <span className="text-[var(--ink-secondary)]">Variance Mitigation:</span>
            <span className="font-bold text-[var(--ink-primary)]">-10% ungoverned drift projected</span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="px-4 py-3">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-soft)] text-[var(--ink-secondary)] text-xs">
              <th className="py-2 font-normal w-1/4">Cycle</th>
              <th className="py-2 font-normal text-right w-1/4">Projected (No Action)</th>
              <th className="py-2 font-normal text-right w-1/4">Observed Recovery</th>
              <th className="py-2 font-normal text-right w-1/4">Time Saved</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {displayHistory.map((event) => {
              const isPending = isNaN(event.actualRecoveryTime);
              const timeSaved = isPending ? 0 : event.projectedWithoutIntervention - event.actualRecoveryTime;
              const sign = timeSaved > 0 ? "+" : "";
              const effective = timeSaved > 0;

              return (
                <React.Fragment key={event.eventId}>
                  <tr className="border-b border-[var(--border-soft)]">
                    <td className="py-1.5 text-[var(--ink-primary)]">{event.cycle}</td>
                    <td className="py-1.5 text-[var(--ink-primary)] text-right">{event.projectedWithoutIntervention.toFixed(1)} months</td>
                    <td className="py-1.5 text-[var(--ink-primary)] text-right">{isPending ? "[PENDING]" : `${event.actualRecoveryTime.toFixed(1)} months`}</td>
                    <td className={`py-1.5 text-right font-bold ${isPending ? 'text-[var(--ink-secondary)]' : effective ? 'text-[var(--ink-primary)]' : 'text-[var(--ink-secondary)] line-through'}`}>
                      {isPending ? "TBD" : `${sign}${timeSaved.toFixed(1)} months`}
                    </td>
                  </tr>
                  {event.governanceTrace && (
                    <tr className="border-b border-[var(--border-strong)] bg-[var(--background)]">
                      {(() => {
                        const isUninitiated = isPending && !session;
                        const isTicking = isPending && !!session && !isExpired && !isResolvedTimely;
                        
                        let decisionText: string = event.governanceTrace.decisionSubmitted ? "SUBMITTED" : "NONE";
                        if (isUninitiated) decisionText = "BYPASSED (UNINITIATED)";
                        if (isTicking) decisionText = "PENDING (ACTIVE)";

                        let mutationText: string = event.governanceTrace.mutationApplied;
                        if (isUninitiated) mutationText = "NONE (UNGOVERNED VULNERABILITY)";
                        if (isTicking) mutationText = "AWAITING GOVERNANCE";

                        return (
                          <td colSpan={4} className="py-1.5 px-2 text-[9px] text-[var(--ink-tertiary)] uppercase tracking-widest pl-4">
                            ↳ [GOV_AUDIT] Decision: <span className="font-bold text-[var(--ink-secondary)]">{decisionText}</span> 
                            &nbsp; | &nbsp;Time Left: <span className="font-bold text-[var(--ink-secondary)]">{event.governanceTrace.timeRemainingAtSubmissionMs !== null ? (event.governanceTrace.timeRemainingAtSubmissionMs / 60000).toFixed(1) + "m" : "--"}</span> 
                            &nbsp; | &nbsp;Engine Mutation: <span className={
                              event.governanceTrace.mutationApplied === 'Penalty' ? 'text-red-700 font-bold' : 
                              event.governanceTrace.mutationApplied === 'Reward' ? 'text-[var(--ink-primary)] font-bold' : 
                              'font-bold text-[var(--ink-secondary)]'
                            }>{mutationText}</span>
                          </td>
                        );
                      })()}
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Aggregate Output */}
      <div className="px-4 py-3 bg-[var(--background-alt)] border-t border-[var(--border-soft)] flex justify-between items-center tabular-nums">
        <span className="text-[var(--ink-secondary)] text-xs">Escalation Win Rate:</span>
        <span className="font-bold text-[var(--ink-primary)]">
          {displayHistory.length > 0 
            ? ((displayHistory.filter(e => !isNaN(e.actualRecoveryTime) && e.projectedWithoutIntervention - e.actualRecoveryTime > 0).length / displayHistory.filter(e => !isNaN(e.actualRecoveryTime)).length) * 100).toFixed(0)
            : 0}%
        </span>
      </div>
    </div>
  );
}
