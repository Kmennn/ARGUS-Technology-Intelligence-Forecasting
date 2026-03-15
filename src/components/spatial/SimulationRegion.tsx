"use client";

import { RegionLayout } from "./regions/RegionLayout";
import { ScenarioLabPanel } from "@/components/intelligence/command/ScenarioLabPanel";
import { TechnologyShockSimulator } from "@/components/intelligence/analytics/TechnologyShockSimulator";
import { MonteCarloSimulator } from "@/components/intelligence/analytics/MonteCarloSimulator";
import { StepContext, WorkflowContinue } from "@/components/navigation/WorkflowPipeline";

export function SimulationRegion() {
  return (
    <>
    <StepContext />
    <RegionLayout
      label="Scenario Lab"
      title="Parallel Futures Engine"
      leadParagraph="Strategic environments do not follow single deterministic tracks. We utilize monte carlo modeling and parallel scenario processing to stress-test institutional readiness against multiple convergent futures simultaneously."
    >
      <div className="max-w-[900px] mx-auto w-full space-y-16 pb-32">
        
        {/* Context block */}
        <div className="space-y-6">
          <span
            className="font-mono text-xs uppercase tracking-[0.05em] font-semibold text-[var(--ink-tertiary)]"
          >
            {"// Simulation Parameters"}
          </span>
          <p className="text-[15px] leading-[1.75] max-w-[65ch] text-[var(--ink-secondary)]">
            The laboratory operates by isolating the current Horizon and Application Pressure Index (API) baseline, then introducing distinct variance profiles—from optimal capital reallocation to sudden threat escalations—to observe institutional breaking points before they manifest in reality.
          </p>
        </div>

        {/* Technology Shock Simulator */}
        <div className="pt-8 border-t border-[var(--border-soft)]">
          <TechnologyShockSimulator />
        </div>

        {/* Monte Carlo Strategic Simulation */}
        <div className="pt-8 border-t border-[var(--border-soft)]">
          <MonteCarloSimulator />
        </div>

        {/* The core scenario engine interface */}
        <div className="pt-8 border-t border-[var(--border-soft)]">
           <ScenarioLabPanel />
        </div>

      </div>

      <WorkflowContinue />
    </RegionLayout>
    </>
  );
}
