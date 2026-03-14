"use client";

import React from "react";
import { EscalationResult } from "@/lib/horizonEngine";

interface DecisionTraceLedgerProps {
  escalationState?: EscalationResult;
}

export function DecisionTraceLedger({ escalationState }: DecisionTraceLedgerProps) {
  // If not provided by parent, default to unescalated for component isolation
  const isEscalated = escalationState?.isEscalated ?? false;
  const escalationType = escalationState?.type ?? "None";

  // Structural Mutation of Governance Posture
  const posture = isEscalated ? "Escalated Review" : "Defensive Hold";
  const NextReview = isEscalated ? "≤ 90 Days" : "JUN 2026";

  return (
    <div className={`space-y-4 border-2 p-5 ${isEscalated ? 'border-[var(--ink-primary)] bg-[var(--background-alt)]' : 'border-[var(--ink-primary)]'}`}>
      <div className="flex justify-between items-baseline border-b-2 border-[var(--ink-primary)] pb-3">
        <div className="text-[11px] font-mono uppercase tracking-[0.1em] font-bold text-[var(--ink-primary)]">
          Decision Trace Ledger
        </div>
        <div className="text-[9px] font-mono text-[var(--ink-secondary)]">
          REF: DTL-2026-Q1-04
        </div>
      </div>

      <div className="pt-2">
        <div className="text-[9px] font-mono uppercase tracking-widest text-[var(--ink-tertiary)] mb-1">
          Validated Posture
        </div>
        <div className="text-[15px] font-mono uppercase tracking-wider font-bold text-[var(--ink-primary)]">
          {posture}
        </div>
        <div className="text-[9px] font-mono text-[var(--ink-secondary)] mt-1 flex gap-4 uppercase tracking-widest">
          <span>Posture Set: MAR 2026</span>
          <span className="text-[var(--ink-primary)] font-semibold">
            {isEscalated ? `Mandatory Review Window: ${NextReview}` : `Next Mandatory Review: ${NextReview}`}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        <div>
          <div className="text-[9px] font-mono uppercase tracking-widest text-[var(--ink-tertiary)] mb-3 border-b border-[var(--border-strong)] pb-1">
            Derived From
          </div>
          <ul className="text-[10px] font-mono text-[var(--ink-primary)] space-y-2 m-0 p-0 list-none">
            {/* Structural insertion of escalation basis */}
            {isEscalated && (
              <li className="font-semibold">[!] Escalation Basis: {escalationType}</li>
            )}
            <li>[+] API: 0.73 (Threshold: 0.65)</li>
            <li>[+] 4/4 domains breached tolerance</li>
            <li>[+] Field validation absent in ≥2 domains</li>
            <li>[+] Cross-domain dependency exposure identified</li>
          </ul>
        </div>

        <div>
           <div className="text-[9px] font-mono uppercase tracking-widest text-[var(--ink-tertiary)] mb-3 border-b border-[var(--border-strong)] pb-1">
            Reversal Conditions
          </div>
          <ul className="text-[10px] font-mono text-[var(--ink-secondary)] space-y-2 m-0 p-0 list-none opacity-80">
            {/* Conditional structural requirement for reversal */}
            {isEscalated && (
              <li className="font-semibold text-[var(--ink-primary)]">[ ] Escalation trigger conditions remediated</li>
            )}
            <li>[ ] API &lt; 0.60</li>
            <li>[ ] ≥2 domains return to tolerance</li>
            <li>[ ] Field validation confirms stable yield</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
