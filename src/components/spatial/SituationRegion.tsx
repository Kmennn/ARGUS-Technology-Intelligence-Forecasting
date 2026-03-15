"use client";

import { useState } from "react";
import { RegionLayout } from "./regions/RegionLayout";
import { TRLLadder } from "@/components/intelligence/research/TRLLadder";
import { EvidenceWeightBar } from "@/components/intelligence/research/EvidenceWeightBar";
import { DeviationBand } from "@/components/intelligence/research/DeviationBand";
import { BottleneckPanel } from "@/components/intelligence/research/BottleneckPanel";
import { ConvergenceGraph } from "@/components/intelligence/research/ConvergenceGraph";
import { WeakSignalPanel } from "@/components/intelligence/research/WeakSignalPanel";
import { SCurveEngine } from "@/components/intelligence/research/SCurveEngine";
import { SourceTransparencyStrip } from "@/components/intelligence/research/SourceTransparencyStrip";
import { IntelligencePipeline } from "@/components/intelligence/research/IntelligencePipeline";
import { SecurityPostureSurface } from "@/components/intelligence/research/SecurityPostureSurface";

type TabState = "summary" | "intelligence" | "trajectory";

export function SituationRegion() {
  const [activeTab, setActiveTab] = useState<TabState>("summary");

  return (
    <div className="space-y-0">
      <SourceTransparencyStrip />
      
      <RegionLayout
        label="Dossier 412.A"
        title="Advanced Synthetic Materials"
        leadParagraph="An evaluation of composite material maturation sequences converging with automated manufacturing scale-up patterns."
      >
        <div className="max-w-[900px] mx-auto w-full space-y-12 pb-24">

          {/* Tab Navigation */}
          <div className="flex items-center justify-center gap-4 border-b border-[var(--border-soft)] pb-6 mb-12">
            {[
              { id: "summary", label: "Executive Summary" },
              { id: "intelligence", label: "Intelligence & Signals" },
              { id: "trajectory", label: "Trajectory & Risk" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabState)}
                className={`
                  px-6 py-2 rounded-full font-mono text-[11px] uppercase tracking-widest transition-all
                  ${activeTab === tab.id 
                    ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' 
                    : 'bg-transparent text-[var(--ink-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)]'}
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: EXECUTIVE SUMMARY */}
          {activeTab === "summary" && (
            <div className="space-y-16 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-16">
                
                {/* Prose Summary */}
                <div className="space-y-10">
                  <div className="space-y-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.05em] font-semibold text-[var(--ink-tertiary)] flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-primary)] opacity-40"></span> Context
                    </span>
                    <p className="text-lg leading-[1.8] text-[var(--ink-secondary)]">
                      Emerging systems do not exist in isolation. They are embedded within research communities, funding cycles, supply chains, policy environments, and cultural narratives. To interpret them correctly, one must examine these layers together rather than independently.
                    </p>
                    <p className="text-lg leading-[1.8] text-[var(--ink-secondary)]">
                      The temptation in modern analysis is compression — to reduce complexity into dashboards, to distill uncertainty into confidence scores, to convert long arcs into immediate verdicts. We take a different approach. We privilege continuity over immediacy.
                    </p>
                  </div>

                  <div className="space-y-4">
                     <span className="font-mono text-[10px] uppercase tracking-[0.05em] font-semibold text-[var(--ink-tertiary)] flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-[#E5D7B7] opacity-60"></span> Maturity Assessment
                    </span>
                    <p className="text-lg leading-[1.8] text-[var(--ink-secondary)]">
                      The system has progressed from validated principles to laboratory-integrated components. Operational deployment remains constrained to controlled environments. Confidence is moderate, supported by 17 independent publications and cross-referenced simulation results. Absence of field validation limits advancement to TRL 5.
                    </p>
                  </div>
                </div>

                {/* Right Column Context */}
                <div className="space-y-10">
                  <TRLLadder
                    current={4}
                    prior={4}
                    projected={5}
                    projectedConditional={true}
                  />

                  <div className="p-6 rounded-[16px] border border-[var(--border-soft)] bg-[rgba(255,255,255,0.02)] space-y-4">
                    <span className="block font-mono text-[10px] uppercase tracking-widest text-[var(--ink-secondary)]">
                      Institutional Posture
                    </span>
                    <div className="text-[24px] font-serif italic text-[var(--text-primary)]">
                      Maintain Observation
                    </div>
                    <div className="text-sm text-[var(--ink-tertiary)] pt-2 border-t border-[rgba(255,255,255,0.06)]">
                      Escalation requires field validation in ≥1 adjacent domain before next cycle.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTELLIGENCE & SIGNALS */}
          {activeTab === "intelligence" && (
            <div className="space-y-16 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 <WeakSignalPanel />
                 <div className="space-y-12">
                   <div className="space-y-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.05em] font-semibold text-[var(--ink-tertiary)]">
                      Signal Annotation
                    </span>
                    <p className="text-md leading-[1.7] text-[var(--ink-secondary)] border-l-2 border-[#E5D7B7] pl-5 opacity-80">
                      The most consequential transformations often occur not within a single field, but at intersections. Filing velocity has increased 14% since Q3, exceeding the five-year baseline trend. If sustained, this acceleration would compress projected maturation timelines by approximately 12–18 months.
                    </p>
                   </div>
                   
                   <div className="pt-6 border-t border-[var(--border-soft)]">
                     <span className="block font-mono text-[10px] uppercase tracking-widest text-[var(--ink-secondary)] mb-6">
                       Evidence Composition
                     </span>
                     <EvidenceWeightBar
                        current={{ field: 55, simulation: 20, publication: 25 }}
                        prior={{ field: 35, simulation: 40, publication: 25 }}
                      />
                   </div>
                 </div>
              </div>

              <div className="pt-10">
                <IntelligencePipeline />
              </div>
            </div>
          )}

          {/* TAB 3: TRAJECTORY & RISK */}
          {activeTab === "trajectory" && (
            <div className="space-y-20 animate-fade-in">
              <SCurveEngine />
              
              <div className="pt-10 border-t border-[var(--border-soft)]">
                <DeviationBand
                  domainLabel="Forecast Deviation"
                  q1Variance={-6}
                  q2Min={-6}
                  q2Max={-2}
                  tolerance={12}
                />
              </div>

              <div className="pt-10 border-t border-[var(--border-soft)]">
                <ConvergenceGraph />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-[var(--border-soft)]">
                <BottleneckPanel
                  bottleneck="Field validation programs have not produced operationally representative data this cycle. No volume of simulation or publication satisfies TRL 5 advancement."
                />
                <SecurityPostureSurface />
              </div>

            </div>
          )}

        </div>
      </RegionLayout>
    </div>
  );
}

