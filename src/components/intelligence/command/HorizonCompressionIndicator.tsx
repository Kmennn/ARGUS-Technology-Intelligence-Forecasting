"use client";

import React from "react";
import { ESCALATION_HORIZON_THRESHOLD } from "@/lib/horizonEngine";

export interface HorizonCompressionProps {
  factors: {
    varianceMagnitude: number;
    velocityDelta: number;
    dependencyExposure: number;
    confidenceDrop: number;
  };
  shift: number;
  newHorizon: number;
  isTriggered: { isEscalated: boolean; type: string };
}

export function HorizonCompressionIndicator({ factors, shift, newHorizon, isTriggered }: HorizonCompressionProps) {

  return (
    <div className="border-t border-[var(--ink-primary)] pt-4 mt-6">
      <h2 className="text-[10px] font-mono uppercase tracking-[0.05em] text-[var(--ink-tertiary)] mb-4">
        Escalation Window
      </h2>
      
      <div className="grid grid-cols-[140px_1fr] gap-y-2 items-baseline mb-4">
        <span className="text-[10px] font-mono text-[var(--ink-secondary)] uppercase tracking-wider">
          Remaining
        </span>
        <span className="text-[14px] font-mono text-[var(--ink-primary)] font-semibold">
          {newHorizon.toFixed(1)} months
        </span>
        
        <span className="text-[10px] font-mono text-[var(--ink-secondary)] uppercase tracking-wider">
          Threshold
        </span>
        <span className="text-[10px] font-mono text-[var(--ink-primary)]">
          {ESCALATION_HORIZON_THRESHOLD} months
        </span>
        
        <span className="text-[10px] font-mono text-[var(--ink-secondary)] uppercase tracking-wider">
          Status
        </span>
        <span className={`text-[10px] font-mono uppercase font-semibold text-[var(--ink-primary)]`}>
          {isTriggered.isEscalated ? `Escalated (${isTriggered.type})` : "Within Band"}
        </span>
      </div>

      <div className="pt-3 border-t border-[var(--border-soft)]">
        <table className="w-full text-left font-mono text-[10px]">
          <tbody>
            <tr>
              <td className="py-1 text-[var(--ink-tertiary)] uppercase tracking-wider">Horizon Shift (Since Q4)</td>
              <td className="py-1 text-[var(--ink-primary)] text-right">-{shift.toFixed(1)} months</td>
            </tr>
            <tr>
              <td className="py-1 text-[var(--ink-tertiary)] uppercase tracking-wider">Compression Driver</td>
              <td className="py-1 text-[var(--ink-primary)] text-right">Variance ({factors.varianceMagnitude.toFixed(2)}), Velocity ({factors.velocityDelta.toFixed(2)})</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
