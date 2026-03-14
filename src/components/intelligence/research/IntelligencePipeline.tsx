"use client";

import { useState } from "react";

export function IntelligencePipeline() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-t border-[var(--border-soft)] pt-6 mt-10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.05em] font-medium w-full text-left text-[var(--ink-muted)] bg-transparent border-none cursor-pointer p-0"
      >
        <span className="w-4">{isOpen ? "[-]" : "[+]"}</span>
        <span>Methodology & Data Pipeline</span>
      </button>

      {isOpen && (
        <div className="pt-8 pb-4 space-y-12">
          
          {/* SYSTEM SNAPSHOT */}
          <div className="font-mono text-[10px] text-[var(--ink-muted)] mb-8">
            System Snapshot: MAR 2026 14:32 UTC
          </div>

          {/* SOURCE LAYER */}
          <div className="grid grid-cols-[140px_1fr] gap-6 items-start">
            <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-tertiary)] pt-1">
              Source Layer
            </div>
            <div className="space-y-4">
              {/* Patents */}
              <div className="grid grid-cols-[180px_150px_1fr] gap-4 font-mono text-[11px] items-baseline border-b border-[var(--border-subtle)] pb-3">
                <span className="text-[var(--ink-primary)]">Patents (Lens/EPO/WIPO)</span>
                <span className="text-[var(--ink-muted)]">24,510 INGESTED</span>
                <span className="text-[var(--ink-muted)] flex justify-between w-full max-w-[280px]">
                  <span>UPDATED: 2H AGO</span>
                  <span>TIER 1</span>
                </span>
              </div>
              
              {/* Scientific Literature */}
              <div className="grid grid-cols-[180px_150px_1fr] gap-4 font-mono text-[11px] items-baseline border-b border-[var(--border-subtle)] pb-3">
                <span className="text-[var(--ink-primary)]">Literature (arXiv/Crossref)</span>
                <span className="text-[var(--ink-muted)]">8,902 INGESTED</span>
                <span className="text-[var(--ink-muted)] flex justify-between w-full max-w-[280px]">
                  <span>UPDATED: 12M AGO</span>
                  <span>TIER 1</span>
                </span>
              </div>

              {/* Procurement Signals */}
              <div className="grid grid-cols-[180px_150px_1fr] gap-4 font-mono text-[11px] items-baseline border-b border-[var(--border-subtle)] pb-3">
                <span className="text-[var(--ink-primary)]">Procurement Signals</span>
                <span className="text-[var(--ink-muted)]">143 CONTRACTS</span>
                <span className="text-[var(--ink-muted)] flex justify-between w-full max-w-[280px]">
                  <span>UPDATED: 1D AGO</span>
                  <span>TIER 2</span>
                </span>
              </div>

              {/* VC & Capital Flows */}
              <div className="grid grid-cols-[180px_150px_1fr] gap-4 font-mono text-[11px] items-baseline pb-1">
                <span className="text-[var(--ink-primary)]">VC & Capital Flows</span>
                <span className="text-[var(--ink-muted)]">$1.4B TRACKED</span>
                <span className="text-[var(--ink-muted)] flex justify-between w-full max-w-[280px]">
                  <span>UPDATED: 4H AGO</span>
                  <span>TIER 3</span>
                </span>
              </div>
            </div>
          </div>

          <div className="ml-[140px] pl-6 border-l border-[var(--border-subtle)] h-6" />

          {/* PROCESSING LAYER */}
          <div className="grid grid-cols-[140px_1fr] gap-6 items-start">
            <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-tertiary)] pt-1">
              Processing Layer
            </div>
            <div>
              <div className="space-y-2 font-mono text-[11px]">
                <div className="text-[var(--ink-primary)]">Entity Extraction</div>
                <div className="text-[var(--ink-primary)]">Knowledge Graph Construction</div>
                <div className="text-[var(--ink-primary)]">Topic Modeling</div>
                <div className="text-[var(--ink-primary)]">Velocity Scoring</div>
                <div className="text-[var(--ink-primary)]">Logistic Maturity Modeling</div>
              </div>
              <div className="font-mono text-[10px] text-[var(--ink-muted)] mt-1">
                Model Governance: Human-in-the-loop validation enabled
              </div>
            </div>
          </div>

          <div className="ml-[140px] pl-6 border-l border-[var(--border-subtle)] h-6" />

          {/* OUTPUT LAYER */}
          <div className="grid grid-cols-[140px_1fr] gap-6 items-start">
            <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-tertiary)] pt-1">
              Output Layer
            </div>
            <div className="font-mono text-[11px] space-y-2 max-w-[300px]">
              <div className="grid grid-cols-[150px_1fr] gap-4">
                <span className="text-[var(--ink-muted)]">TRL Score:</span>
                <span className="text-[var(--ink-primary)]">4.0 (Conditional 5)</span>
              </div>
              <div className="grid grid-cols-[150px_1fr] gap-4">
                <span className="text-[var(--ink-muted)]">Convergence Prob.:</span>
                <span className="text-[var(--ink-primary)]">68.5%</span>
              </div>
              <div className="grid grid-cols-[150px_1fr] gap-4">
                <span className="text-[var(--ink-muted)]">Signal Strength:</span>
                <span className="text-[var(--ink-primary)]">0.64</span>
              </div>
              <div className="grid grid-cols-[150px_1fr] gap-4">
                <span className="text-[var(--ink-muted)]">Forecast Variance:</span>
                <span className="text-red-900/60 dark:text-red-400">−6.0%</span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
