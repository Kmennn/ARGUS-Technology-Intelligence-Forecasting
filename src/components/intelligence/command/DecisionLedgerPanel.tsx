"use client";

import React, { useEffect, useState } from "react";
import { DecisionEvent } from "@/lib/decisionLedger";

const ACTION_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  INITIATE_REVIEW: { label: "REVIEW INITIATED", color: "#c9a227", icon: "◈" },
  SUBMIT_DECISION: { label: "DECISION SUBMITTED", color: "#2d8a4e", icon: "✓" },
  REVIEW_EXPIRED: { label: "REVIEW EXPIRED", color: "#b33a3a", icon: "✕" },
  GOVERNANCE_MUTATION_APPLIED: { label: "MUTATION APPLIED", color: "#5a7d9a", icon: "⬡" },
};

export function DecisionLedgerPanel() {
  const [decisions, setDecisions] = useState<DecisionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchDecisions = () => {
      fetch("/api/decisions")
        .then((r) => r.json())
        .then((data) => {
          setDecisions(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };

    fetchDecisions();

    // Listen for custom event from ReviewRoomProvider
    window.addEventListener("argus-decision-logged", fetchDecisions);
    return () => window.removeEventListener("argus-decision-logged", fetchDecisions);
  }, []);

  const displayDecisions = expanded ? decisions : decisions.slice(-6);

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[11px] font-mono uppercase tracking-[0.15em] text-[var(--ink-primary)] font-bold">
            Decision Ledger
          </h2>
          <div className="text-[9px] font-mono text-[var(--ink-tertiary)] mt-0.5 uppercase tracking-widest">
            Institutional Accountability Timeline — {decisions.length} Records
          </div>
        </div>
        {decisions.length > 6 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[9px] font-mono uppercase tracking-widest text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] transition-colors border border-[var(--border-soft)] px-2 py-0.5"
          >
            {expanded ? "COLLAPSE" : `SHOW ALL (${decisions.length})`}
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-[10px] font-mono text-[var(--ink-muted)] uppercase tracking-widest animate-pulse">
          Loading institutional memory...
        </div>
      ) : decisions.length === 0 ? (
        <div className="text-[10px] font-mono text-[var(--ink-muted)] uppercase tracking-widest">
          No decisions recorded yet.
        </div>
      ) : (
        <div className="relative">
          {/* Timeline spine */}
          <div
            className="absolute left-[6px] top-2 bottom-2 w-px"
            style={{ background: "var(--border-soft)" }}
          />

          <div className="space-y-0">
            {displayDecisions.map((d, i) => {
              const meta = ACTION_LABELS[d.action] || {
                label: d.action,
                color: "#888",
                icon: "•",
              };
              const isFirst =
                i === 0 ||
                displayDecisions[i - 1]?.cycleId !== d.cycleId;

              return (
                <div key={d.decisionId} className="relative pl-6 pb-3 group">
                  {/* Timeline dot */}
                  <div
                    className="absolute left-0 top-1 w-[13px] h-[13px] rounded-full border-2 flex items-center justify-center text-[7px]"
                    style={{
                      borderColor: meta.color,
                      background: "var(--background)",
                      color: meta.color,
                    }}
                  >
                    {meta.icon}
                  </div>

                  {/* Cycle header (shown only on first event of a cycle) */}
                  {isFirst && (
                    <div className="text-[9px] font-mono font-bold text-[var(--ink-secondary)] uppercase tracking-widest mb-1">
                      {d.cycleId}
                    </div>
                  )}

                  {/* Event row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[9px] font-mono font-bold uppercase tracking-wider"
                          style={{ color: meta.color }}
                        >
                          {meta.label}
                        </span>
                        <span className="text-[8px] font-mono text-[var(--ink-muted)] uppercase">
                          by {d.actor} ({d.role})
                        </span>
                      </div>
                      {d.note && (
                        <div className="text-[9px] font-mono text-[var(--ink-tertiary)] mt-0.5 leading-relaxed">
                          {d.note}
                        </div>
                      )}
                    </div>

                    {/* State delta */}
                    <div className="flex-shrink-0 text-right">
                      <div className="text-[8px] font-mono text-[var(--ink-muted)]">
                        {formatTime(d.timestamp)}
                      </div>
                      {d.stateAfter && (
                        <div className="flex items-center gap-2 mt-0.5 justify-end">
                          <span className="text-[8px] font-mono text-[var(--ink-tertiary)]">
                            P: {d.stateBefore.pressure.toFixed(2)} →{" "}
                            <span
                              style={{
                                color:
                                  d.stateAfter.pressure < d.stateBefore.pressure
                                    ? "#2d8a4e"
                                    : "#b33a3a",
                              }}
                            >
                              {d.stateAfter.pressure.toFixed(2)}
                            </span>
                          </span>
                          <span className="text-[8px] font-mono text-[var(--ink-tertiary)]">
                            H: {d.stateBefore.horizonMonths.toFixed(1)} →{" "}
                            <span
                              style={{
                                color:
                                  d.stateAfter.horizonMonths >
                                  d.stateBefore.horizonMonths
                                    ? "#2d8a4e"
                                    : "#b33a3a",
                              }}
                            >
                              {d.stateAfter.horizonMonths.toFixed(1)}
                            </span>
                            mo
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
