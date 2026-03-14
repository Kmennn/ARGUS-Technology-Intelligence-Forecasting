"use client";

import React from "react";

export function AllocationPressureIndex() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-[var(--ink-primary)] pb-2">
        <div>
          <h2 className="text-[12px] font-mono uppercase tracking-[0.05em] text-[var(--ink-primary)] font-semibold">
            Allocation Pressure Index (API)
          </h2>
          <div className="text-[10px] font-mono text-[var(--ink-secondary)] mt-1 tracking-widest">
            PORTFOLIO AGGREGATE
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="text-[24px] font-mono text-[var(--ink-primary)] leading-none">
            0.73
          </div>
          <div className="text-[9px] font-mono text-[var(--ink-secondary)] mt-1 tracking-widest mb-2">
            API VALUE
          </div>
          <div className="text-[9px] font-mono text-[var(--ink-primary)] font-semibold tracking-wide uppercase px-1.5 py-0.5 border border-[var(--border-strong)]">
            Trend: +0.08 since prior cycle
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[140px_1fr] gap-4 items-baseline">
        <span className="text-[10px] font-mono text-[var(--ink-tertiary)] uppercase tracking-wider">
          Threshold Limit
        </span>
        <span className="text-[10px] font-mono text-[var(--ink-primary)]">
          0.65
        </span>
        
        <span className="text-[10px] font-mono text-[var(--ink-tertiary)] uppercase tracking-wider">
          Current Status
        </span>
        <span className="text-[10px] font-mono text-[var(--ink-primary)] uppercase font-semibold">
          Above Reallocation Threshold
        </span>
      </div>

      <div className="pt-4">
        <div className="text-[9px] font-mono text-[var(--ink-tertiary)] uppercase tracking-wider mb-2 border-b border-[var(--border-soft)] pb-1">
          Index Derivation Factors
        </div>
        <table className="w-full text-left font-mono text-[10px]">
          <tbody>
            <tr className="border-b border-[var(--border-soft)]">
              <td className="py-2 text-[var(--ink-secondary)]">Variance Magnitude</td>
              <td className="py-2 text-[var(--ink-primary)] text-right">+0.24 (Exceeds tolerance)</td>
            </tr>
            <tr className="border-b border-[var(--border-soft)]">
              <td className="py-2 text-[var(--ink-secondary)]">Forecast Confidence</td>
              <td className="py-2 text-[var(--ink-primary)] text-right">Moderate Constraint</td>
            </tr>
            <tr className="border-b border-[var(--border-soft)]">
              <td className="py-2 text-[var(--ink-secondary)]">Domain Interdependency Weight</td>
              <td className="py-2 text-[var(--ink-primary)] text-right">0.85 (High cross-propagation)</td>
            </tr>
            <tr className="border-b border-[var(--border-soft)] border-none">
              <td className="py-2 text-[var(--ink-secondary)]">Time-to-Bottleneck Compression</td>
              <td className="py-2 text-[var(--ink-primary)] text-right">-14 Months</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
