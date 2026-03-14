"use client";

import React from "react";

export function SecondOrderImpactPanel() {
  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--ink-primary)] pb-2 flex justify-between items-end">
        <div>
          <h2 className="text-[12px] font-mono uppercase tracking-[0.05em] text-[var(--ink-primary)] font-semibold">
            Second-Order Impact Analysis
          </h2>
          <div className="text-[10px] font-mono text-[var(--ink-secondary)] mt-1 tracking-widest">
            CROSS-DOMAIN PROPAGATION
          </div>
        </div>
        <div className="text-right">
          <div className="text-[9px] font-mono text-[var(--ink-muted)]">
            DEPENDENCY GRAPH: ACTIVE
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[160px_1fr] gap-x-4 gap-y-6 items-start">
        <div className="text-[10px] font-mono text-[var(--ink-tertiary)] uppercase tracking-wider pt-1">
          Primary Domain
        </div>
        <div className="text-[10px] font-mono text-[var(--ink-primary)] pt-1">
          Research (Node: Solid-State LiDAR)
        </div>

        <div className="text-[10px] font-mono text-[var(--ink-tertiary)] uppercase tracking-wider pt-1">
          Dependent Programs
        </div>
        <ul className="text-[10px] font-mono text-[var(--ink-primary)] space-y-2 m-0 p-0 list-none pt-1">
          <li>- Autonomous Logistics (Program AL-07)</li>
          <li>- Hypersonic Mobility (Program HM-12)</li>
        </ul>

        <div className="text-[10px] font-mono text-[var(--ink-tertiary)] uppercase tracking-wider pt-1">
          Dependency Exposure
        </div>
        <ul className="text-[10px] font-mono text-[var(--ink-primary)] space-y-2 m-0 p-0 list-none pt-1 border-l-2 border-[var(--ink-secondary)] pl-3">
          <li>42% capability overlap (Thermal constraints)</li>
          <li>18% capability overlap (Latency instability)</li>
        </ul>

        <div className="text-[10px] font-mono text-[var(--ink-tertiary)] uppercase tracking-wider pt-1">
          Estimated Effect Window
        </div>
        <div className="text-[10px] font-mono text-[var(--ink-primary)] pt-1 font-semibold uppercase">
          2–3 quarters if bottleneck persists
        </div>
      </div>
    </div>
  );
}
