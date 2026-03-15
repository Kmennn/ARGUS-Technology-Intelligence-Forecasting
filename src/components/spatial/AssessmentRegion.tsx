"use client";

import { useState, useEffect } from "react";
import { RegionLayout } from "./regions/RegionLayout";
import { ConvergenceGraph } from "@/components/intelligence/research/ConvergenceGraph";
import { TechnologyDependencyMap } from "@/components/intelligence/analytics/TechnologyDependencyMap";
import { ActorIntelligence } from "@/components/intelligence/analytics/ActorIntelligence";
import { HorizonForecasting } from "@/components/intelligence/analytics/HorizonForecasting";
import { StepContext, WorkflowContinue } from "@/components/navigation/WorkflowPipeline";

interface SignalData {
  id: string;
  signal: string;
  impactDomains: string[];
  strategicNotes: string;
  confidence: number;
  volatility: string;
}

export function AssessmentRegion() {
  const [signals, setSignals] = useState<SignalData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSignals() {
      try {
        const res = await fetch("/api/intelligence");
        const data = await res.json();
        setSignals(data);
      } catch (err) {
        console.error("Failed to fetch intelligence signals", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSignals();
  }, []);

  return (
    <>
    <StepContext />
    <RegionLayout
      label="Strategic Assessment"
      title="Convergence & Collision"
      leadParagraph="Isolated data is noise. Strategic advantage emerges from synthesis. We track the intersections where separate disciplines collide, forming patterns that redefine constraints. Analysis is the discipline of recognizing these collisions before they become conventional wisdom."
    >
      <div className="max-w-[900px] mx-auto w-full space-y-16 pb-32">
        
        {/* Convergence Graph — Primary Surface */}
        <div className="pt-4 border-b border-[var(--border-soft)] pb-16">
           <div className="text-center space-y-4 mb-8">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
                Cross-Domain Network
              </span>
              <h3 className="font-serif text-2xl text-[var(--text-primary)]">Global Convergence Map</h3>
           </div>
          <ConvergenceGraph />
        </div>

        {/* Technology Dependency Map */}
        <div className="pt-8 border-b border-[var(--border-soft)] pb-16">
          <TechnologyDependencyMap />
        </div>

        {/* Technology Actor Intelligence */}
        <div className="pt-8 border-b border-[var(--border-soft)] pb-16">
          <ActorIntelligence />
        </div>

        {/* Strategic Timeline Forecasting */}
        <div className="pt-8 border-b border-[var(--border-soft)] pb-16">
          <HorizonForecasting />
        </div>

        {/* Sector Collision Insights */}
        <div className="space-y-8">
          <span
            className="font-mono text-xs uppercase tracking-[0.05em] font-semibold text-[var(--ink-tertiary)]"
          >
            {"// Active Sector Collisions"}
          </span>
          
          {loading ? (
            <div className="font-mono text-sm opacity-60 animate-pulse">Analyzing cross-domain impact...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {signals.map((sig) => (
                <div key={sig.id} className="p-8 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[var(--border-soft)] space-y-6">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-secondary)]">
                      {sig.id}
                    </span>
                    <span className={`font-mono text-[10px] uppercase tracking-widest px-2 py-1 rounded bg-[var(--text-primary)]/10 text-[var(--text-primary)]`}>
                      Confidence: {Math.round(sig.confidence * 100)}%
                    </span>
                  </div>
                  
                  <h4 className="font-serif text-xl text-[var(--text-primary)] leading-tight">{sig.signal}</h4>
                  
                  <div className="space-y-4 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                    <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">
                      {sig.strategicNotes}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {sig.impactDomains.map((domain, i) => (
                        <span key={i} className="text-[10px] font-mono border border-[var(--border-soft)] text-[var(--ink-muted)] px-2 py-1 rounded">
                          {domain}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Strategic Posture TextBlock */}
        <div className="space-y-6 pt-12 border-t border-[var(--border-soft)]">
          <span
            className="font-mono text-xs uppercase tracking-[0.05em] font-semibold text-[var(--ink-tertiary)]"
          >
            {"// Strategic Posture Guidance"}
          </span>
          <p className="text-[15px] leading-[1.75] max-w-[65ch] text-[var(--ink-secondary)]">
            Organizations typically react to capability demonstrations. We recommend reacting to the shifting economics of constraints. The collisions identified above suggest structural limitations are breaking down.
          </p>

          <div className="pt-6">
             <div className="p-6 border border-[var(--border-soft)] bg-amber-500/5 rounded-xl space-y-4">
                <span className="block font-mono text-[10px] uppercase tracking-[0.05em] font-semibold text-amber-500 mb-2">
                  Action Directive
                </span>
                <p className="text-[15px] leading-[1.75] text-[var(--text-primary)]">
                  Current posture: tracking convergence rate. Do not initiate capability migration based on isolated breakthroughs. Re-evaluate posture if Q2 data confirms hardware-agnostic stability across three or more domains.
                </p>
             </div>
          </div>
        </div>
      </div>

      <WorkflowContinue />
    </RegionLayout>
    </>
  );
}
