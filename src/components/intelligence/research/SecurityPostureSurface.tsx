"use client";

import React from "react";

const POSTURE_DATA = [
  { label: "Deployment Mode", value: "Air-Gapped" },
  { label: "Data Residency", value: "Controlled (On-Prem)" },
  { label: "Model Inference", value: "Offline Capable" },
  { label: "External Dependencies", value: "None (No runtime API calls)" },
  { label: "Audit Logging", value: "Enabled (Immutable)" },
  { label: "Export Classification", value: "Restricted" },
];

export function SecurityPostureSurface() {
  return (
    <div className="pt-16 mt-16 border-t border-[var(--border-soft)]">
      <h3 className="text-[10px] uppercase tracking-[0.05em] font-semibold text-[var(--ink-secondary)] mb-6">
        System Security & Deployment Posture
      </h3>
      
      <div className="space-y-3">
        {POSTURE_DATA.map((item) => (
          <div key={item.label} className="grid grid-cols-[240px_1fr] items-baseline">
            <div className="font-mono text-[10px] text-[var(--ink-tertiary)]">
              {item.label}
            </div>
            <div className="font-mono text-[10px] text-[var(--ink-primary)]">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
