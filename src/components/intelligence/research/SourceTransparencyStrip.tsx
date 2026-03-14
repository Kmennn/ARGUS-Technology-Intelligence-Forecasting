"use client";

import React from "react";

interface AgencyStatus {
  id: string;
  status: "Active" | "Idle" | "Syncing";
  latency: string;
  count: string;
}

const AGENCIES: AgencyStatus[] = [
  { id: "OSINT-Core", status: "Active", latency: "12ms", count: "1.2M" },
  { id: "J-SIGINT", status: "Syncing", latency: "145ms", count: "420K" },
  { id: "GEOINT-V", status: "Active", latency: "8ms", count: "89K" },
  { id: "HUMINT-S", status: "Idle", latency: "--", count: "12K" },
];

export function SourceTransparencyStrip() {
  return (
    <div className="w-full bg-[var(--ink-ghost)] border-t border-b border-[var(--border-soft)] py-1.5 px-4 flex items-center justify-between overflow-hidden">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[8px] font-mono text-[var(--ink-primary)] uppercase font-bold tracking-tighter">
            Ingestion Engine Online
          </span>
        </div>

        <div className="h-3 w-px bg-[var(--border-soft)]" />

        <div className="flex gap-4 overflow-x-auto no-scrollbar">
          {AGENCIES.map((agency) => (
            <div key={agency.id} className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-[8px] font-mono text-[var(--ink-muted)] uppercase">
                {agency.id}:
              </span>
              <span className={`text-[8px] font-mono uppercase ${
                agency.status === "Active" ? "text-[var(--ink-primary)]" :
                agency.status === "Syncing" ? "text-blue-500" :
                "text-[var(--ink-muted)]"
              }`}>
                {agency.status}
              </span>
              <span className="text-[7px] font-mono text-[var(--ink-tertiary)] opacity-60">
                ({agency.latency})
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-mono text-[var(--ink-muted)] uppercase">
            Aggregate Evidence:
          </span>
          <span className="text-[8px] font-mono text-[var(--ink-primary)] font-bold">
            1.72M Events
          </span>
        </div>
        <div className="text-[8px] font-mono text-[var(--ink-tertiary)] uppercase flex items-center gap-1 bg-[var(--background)] px-1.5 py-0.5 border border-[var(--border-soft)] rounded-sm">
          <div className="w-1 h-1 rounded-full bg-[var(--accent-deep)]" />
          Air-Gapped Sync: Verified
        </div>
      </div>
    </div>
  );
}
