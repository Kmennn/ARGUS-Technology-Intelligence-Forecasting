"use client";

import React from "react";

interface WeakSignal {
  id: string;
  domain: string;
  strength: number;
  diversity: number;
  velocityDelta: number;
  sourceDistribution: string;
  confidence: "Low" | "Moderate" | "High";
}

const WEAK_SIGNALS: WeakSignal[] = [
  {
    id: "Neuromorphic Edge Chips",
    domain: "AI/Hardware",
    strength: 0.82,
    diversity: 0.65,
    velocityDelta: 0.08,
    sourceDistribution: "PAT 75% | LIT 25%",
    confidence: "High",
  },
  {
    id: "Room-Temp Superconductors",
    domain: "Materials",
    strength: 0.45,
    diversity: 0.22,
    velocityDelta: -0.02,
    sourceDistribution: "LIT 80% | LAB 20%",
    confidence: "Low",
  },
  {
    id: "Solid-State LiDAR",
    domain: "Autonomy",
    strength: 0.68,
    diversity: 0.71,
    velocityDelta: 0.04,
    sourceDistribution: "PAT 45% | LIT 40% | VC 15%",
    confidence: "Moderate",
  },
  {
    id: "In-Situ Resource Utilization",
    domain: "Space",
    strength: 0.52,
    diversity: 0.35,
    velocityDelta: 0.01,
    sourceDistribution: "LIT 65% | PRC 35%",
    confidence: "Low",
  },
  {
    id: "Privacy-Preserving Synthetic Data",
    domain: "AI",
    strength: 0.91,
    diversity: 0.88,
    velocityDelta: 0.12,
    sourceDistribution: "LIT 50% | VC 50%",
    confidence: "High",
  },
];

export function WeakSignalPanel() {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.05em] font-semibold text-[var(--ink-secondary)]">
            Emerging Weak Signals
          </h3>
          <div className="text-[9px] font-mono text-[var(--ink-muted)] mt-1 uppercase tracking-wider">
            LAST RECOMPUTED: MAR 2026 14:32 UTC
          </div>
        </div>
        <span className="text-[9px] font-mono text-[var(--ink-muted)]">
          Δ QoQ &gt; 0 REQUIRED
        </span>
      </div>

      <div className="border border-[var(--border-soft)] rounded-sm overflow-hidden bg-[var(--background)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-soft)] bg-[var(--ink-ghost)]">
              <th className="px-2 py-2 text-[9px] font-mono uppercase text-[var(--ink-tertiary)] font-normal">Signal Identity</th>
              <th className="px-2 py-2 text-[9px] font-mono uppercase text-[var(--ink-tertiary)] font-normal border-l border-[var(--border-soft)]">Domain</th>
              <th className="px-2 py-2 text-[9px] font-mono uppercase text-[var(--ink-tertiary)] font-normal border-l border-[var(--border-soft)]">Strength</th>
              <th className="px-2 py-2 text-[9px] font-mono uppercase text-[var(--ink-tertiary)] font-normal border-l border-[var(--border-soft)]">Diversity</th>
              <th className="px-2 py-2 text-[9px] font-mono uppercase text-[var(--ink-tertiary)] font-normal border-l border-[var(--border-soft)]">Src Dist.</th>
              <th className="px-2 py-2 text-[9px] font-mono uppercase text-[var(--ink-tertiary)] font-normal border-l border-[var(--border-soft)]">Δ QoQ</th>
              <th className="px-2 py-2 text-[9px] font-mono uppercase text-[var(--ink-tertiary)] font-normal border-l border-[var(--border-soft)]">Conf.</th>
            </tr>
          </thead>
          <tbody>
            {WEAK_SIGNALS.map((signal) => (
              <tr 
                key={signal.id} 
                className="border-b border-[var(--border-soft)] last:border-0 hover:bg-[var(--ink-ghost)] transition-colors"
              >
                <td className="px-2 py-2">
                  <span className="text-[10px] font-mono text-[var(--ink-primary)] leading-tight">{signal.id}</span>
                </td>
                <td className="px-2 py-2 border-l border-[var(--border-soft)]">
                  <span className="text-[10px] text-[var(--ink-secondary)] font-mono">{signal.domain}</span>
                </td>
                <td className="px-2 py-2 border-l border-[var(--border-soft)]">
                  <span className="text-[10px] text-[var(--ink-primary)] font-mono">{signal.strength.toFixed(2)}</span>
                </td>
                <td className="px-2 py-2 border-l border-[var(--border-soft)]">
                  <span className="text-[10px] text-[var(--ink-primary)] font-mono">{signal.diversity.toFixed(2)}</span>
                </td>
                <td className="px-2 py-2 border-l border-[var(--border-soft)] whitespace-nowrap">
                  <span className="text-[9px] text-[var(--ink-secondary)] font-mono">{signal.sourceDistribution}</span>
                </td>
                <td className="px-2 py-2 border-l border-[var(--border-soft)]">
                  <span className="text-[10px] text-[var(--ink-primary)] font-mono">
                    {signal.velocityDelta > 0 ? "+" : ""}{signal.velocityDelta.toFixed(2)}
                  </span>
                </td>
                <td className="px-2 py-2 border-l border-[var(--border-soft)]">
                  <span className="text-[10px] text-[var(--ink-secondary)] font-mono uppercase">{signal.confidence}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="bg-[var(--background)] px-2 py-1.5 border-t border-[var(--border-soft)]">
          <span className="text-[8px] font-mono text-[var(--ink-tertiary)]">
            Scoring Scale: 0.0 (none) — 1.0 (maximum observed across portfolio)
          </span>
        </div>
      </div>
    </div>
  );
}
