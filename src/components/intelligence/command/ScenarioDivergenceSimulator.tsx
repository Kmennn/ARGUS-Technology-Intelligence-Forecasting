"use client";

import React from "react";

export function ScenarioDivergenceSimulator() {
  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--ink-primary)] pb-2 flex justify-between items-end">
        <div>
          <h2 className="text-[12px] font-mono uppercase tracking-[0.05em] text-[var(--ink-primary)] font-semibold">
            Scenario Divergence Simulator
          </h2>
          <div className="text-[10px] font-mono text-[var(--ink-secondary)] mt-1 tracking-widest">
            ACTION/INACTION DELTA
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 border border-[var(--border-strong)] divide-x divide-[var(--border-strong)]">
        <div className="p-4 bg-[var(--ink-ghost)]">
          <div className="text-[9px] font-mono uppercase tracking-wider text-[var(--ink-tertiary)] mb-1">
            Current Posture
          </div>
          <div className="text-[11px] font-mono font-bold text-[var(--ink-primary)] uppercase">
            Defensive Hold
          </div>
        </div>
        <div className="p-4">
          <div className="text-[9px] font-mono uppercase tracking-wider text-[var(--ink-tertiary)] mb-1">
            Alternative Action
          </div>
          <div className="text-[11px] font-mono font-bold text-[var(--ink-secondary)] uppercase">
            Escalation Now
          </div>
        </div>
      </div>

      <div className="pt-2">
        <div className="text-[9px] font-mono uppercase tracking-widest text-[var(--ink-tertiary)] mb-3 border-b border-[var(--border-soft)] pb-1">
          Projected Divergence (2Q Horizon)
        </div>
        <table className="w-full text-left font-mono text-[10px]">
          <tbody>
            <tr className="border-b border-[var(--border-soft)]">
              <td className="py-2 text-[var(--ink-secondary)]">Capital Efficiency Delta</td>
              <td className="py-2 text-[var(--ink-primary)] text-right font-semibold">
                +11% if escalated
              </td>
            </tr>
            <tr className="border-b border-[var(--border-soft)]">
              <td className="py-2 text-[var(--ink-secondary)]">Operational Risk Delta</td>
              <td className="py-2 text-[var(--ink-primary)] text-right font-semibold">
                +18% if escalation premature
              </td>
            </tr>
            <tr className="border-[var(--border-soft)] border-none">
              <td className="py-2 text-[var(--ink-tertiary)] uppercase tracking-wider">Recovery Cost</td>
              <td className="py-2 text-[var(--ink-primary)] text-right font-bold uppercase tracking-wider">
                +6 months if reallocation deferred
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
