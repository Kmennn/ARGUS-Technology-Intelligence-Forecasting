"use client";

import { useState } from "react";
import { RegionLayout } from "./regions/RegionLayout";
import { TRLLadder } from "@/components/intelligence/research/TRLLadder";
import { EvidenceWeightBar } from "@/components/intelligence/research/EvidenceWeightBar";
import { DeviationBand } from "@/components/intelligence/research/DeviationBand";
import { BottleneckPanel } from "@/components/intelligence/research/BottleneckPanel";
import { AllocationPostureBlock } from "@/components/intelligence/research/AllocationPostureBlock";
import { ConvergenceGraph } from "@/components/intelligence/research/ConvergenceGraph";
import { WeakSignalPanel } from "@/components/intelligence/research/WeakSignalPanel";
import { SCurveEngine } from "@/components/intelligence/research/SCurveEngine";
import { SourceTransparencyStrip } from "@/components/intelligence/research/SourceTransparencyStrip";
import { IntelligencePipeline } from "@/components/intelligence/research/IntelligencePipeline";
import { SecurityPostureSurface } from "@/components/intelligence/research/SecurityPostureSurface";

export function SituationRegion() {
  const [showContext, setShowContext] = useState(false);

  return (
    <div className="space-y-0">
      <SourceTransparencyStrip />
      
      <RegionLayout
      label="Research"
      title="TRL Command Console"
    >
      <div className="max-w-[760px] mx-auto w-full space-y-10">

        {/* Miss Marker + Forecast Confidence at Issuance — compact header row */}
         <div className="flex items-center gap-6">
          <div className="font-mono text-[10px] text-[var(--ink-muted)]">
            ⚑ Forecast variance exceeded tolerance in prior cycle.
          </div>
        </div>

        {/* Intelligence Console — Two Column */}
        <div
          className="grid gap-10 items-start grid-cols-[auto_1fr]"
        >
          {/* Left — TRL Ladder */}
          <div className="pt-1">
            <TRLLadder
              current={4}
              prior={4}
              projected={5}
              projectedConditional={true}
            />
          </div>

          {/* Right — Signal Panel */}
          <div className="space-y-6">

            {/* Signal Watch */}
            <div className="space-y-[6px]">
              <span className="block font-mono text-[10px] uppercase tracking-[0.05em] font-semibold text-[var(--ink-secondary)]">
                Signal Watch
              </span>
              <div className="font-mono text-[13px] text-[var(--text-primary)]">
                Since Q4 review — procurement references +2, patent velocity +14%.
              </div>
              <div className="font-mono text-[11px] text-[var(--ink-tertiary)]">
                Composite patent activity converging with procurement language. Field validation now governs TRL 5 advancement.
              </div>
            </div>

            {/* Evidence Composition */}
            <EvidenceWeightBar
              current={{ field: 55, simulation: 20, publication: 25 }}
              prior={{ field: 35, simulation: 40, publication: 25 }}
            />

            {/* Bottleneck */}
            <BottleneckPanel
              bottleneck="Field validation programs have not produced operationally representative data this cycle. No volume of simulation or publication satisfies TRL 5 advancement."
            />

            {/* Allocation Posture */}
            <AllocationPostureBlock
              posture="Maintain observation"
              escalationTrigger="Field validation in ≥1 domain"
              nextReview="Q2 2026"
              confidence="Moderate (±12%)"
            />
          </div>
        </div>

        {/* Intelligence Engine Core — Graphs & Signals */}
        <div className="pt-8 border-t border-[var(--border-soft)] space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <SCurveEngine />
            <WeakSignalPanel />
          </div>
          <ConvergenceGraph />
        </div>

        {/* Forecast Deviation Chart — full width */}
        <div className="pt-4 border-t border-[rgba(255,255,255,0.06)]">
          <DeviationBand
            domainLabel="Research"
            q1Variance={-6}
            q2Min={-6}
            q2Max={-2}
            tolerance={12}
          />
        </div>

        {/* Forecast Confidence at Issuance */}
        <div
          className="font-mono text-[10px] text-[var(--ink-muted)] border-t border-[var(--border-soft)] pt-6 mt-10"
        >
          Forecast Confidence at Issuance — Moderate (±12% variance tolerance) · 90D cadence
        </div>

        {/* Research Context Toggle */}
        <div className="pt-2">
          <button
            onClick={() => setShowContext((v) => !v)}
            className="font-mono text-[10px] uppercase tracking-[0.05em] font-medium text-[var(--ink-muted)] bg-transparent border-0 cursor-pointer p-0"
          >
            {showContext ? "Hide" : "View"} research context
          </button>

          {showContext && (
            <div className="space-y-8 pt-8">
              <div className="space-y-4">
                <span className="font-mono text-xs uppercase tracking-[0.05em] font-semibold text-[var(--ink-tertiary)]">
                  {"// Context"}
                </span>
                <div className="space-y-6">
                  <p className="text-[15px] leading-[1.75] max-w-[65ch] text-[var(--ink-secondary)]">
                    Emerging systems do not exist in isolation. They are embedded within research communities, funding cycles, supply chains, policy environments, and cultural narratives. To interpret them correctly, one must examine these layers together rather than independently.
                  </p>
                  <p className="text-[15px] leading-[1.75] max-w-[65ch] text-[var(--ink-secondary)]">
                    The temptation in modern analysis is compression — to reduce complexity into dashboards, to distill uncertainty into confidence scores, to convert long arcs into immediate verdicts. We take a different approach. We privilege continuity over immediacy.
                  </p>
                </div>
              </div>

              {/* Removed Prose Methodology block from Phase 1/2 here */}

              <div className="space-y-4">
                <span className="font-mono text-xs uppercase tracking-[0.05em] font-semibold text-[var(--ink-tertiary)]">
                  {"// Convergence"}
                </span>
                <p className="text-[15px] leading-[1.75] max-w-[65ch] text-[var(--ink-secondary)]">
                  The most consequential transformations often occur not within a single field, but at intersections. Filing velocity has increased 14% since Q3, exceeding the five-year baseline trend. If sustained, this acceleration would compress projected maturation timelines by approximately 12–18 months.
                </p>
              </div>

              <div className="space-y-4">
                <span className="font-mono text-xs uppercase tracking-[0.05em] font-semibold text-[var(--ink-tertiary)]">
                  {"// Maturity"}
                </span>
                <p className="text-[15px] leading-[1.75] max-w-[65ch] text-[var(--ink-secondary)]">
                  The system has progressed from validated principles to laboratory-integrated components. Operational deployment remains constrained to controlled environments. Confidence is moderate, supported by 17 independent publications and cross-referenced simulation results. Absence of field validation limits advancement to TRL 5.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Intelligence Pipeline Surface */}
        <IntelligencePipeline />

        {/* Security Posture Surface */}
        <SecurityPostureSurface />

      </div>
    </RegionLayout>
  </div>
  );
}
