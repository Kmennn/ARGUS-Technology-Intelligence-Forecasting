"use client";

import { RegionLayout } from "./regions/RegionLayout";
import { DomainRadar } from "@/components/intelligence/analytics/DomainRadar";
import { StepContext, WorkflowContinue } from "@/components/navigation/WorkflowPipeline";

export function CapabilitiesRegion() {
  return (
    <>
    <StepContext />
    <RegionLayout
      label="Capabilities"
      title="Constrained by reality."
      leadParagraph="A capability is only as real as the infrastructure required to sustain it. We evaluate readiness not by the peak performance of a prototype, but by the operational dependencies it introduces. The true limit of an emerging system is rarely its underlying technology; it is the friction of integration."
    >
      <div className="max-w-[760px] mx-auto w-full space-y-24 pb-32">
        
        {/* Domain Portfolio Surface */}
        <div className="pt-8 border-t border-[var(--border-soft)]">
          <DomainRadar />
        </div>
        
        <div className="space-y-6">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
            {/* // Environmental Friction */}
            {"// Environmental Friction"}
          </span>
          <p className="text-base leading-relaxed text-[var(--ink-primary)]">
            Laboratory environments mask friction. They provide unconstrained power, specialized cooling, and highly regulated bandwidth. Operational environments, by definition, enforce limits. True capability assessment measures the distance between these two states.
          </p>
          <p
            className="text-lg leading-relaxed"
            style={{ color: "var(--text-primary)" }}
          >
            When a demonstration performs flawlessly but fails in deployment, it is rarely a failure of the core technology. It is a failure to account for the dependencies of the surrounding ecosystem.
          </p>
        </div>

        <div className="space-y-6">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
            {/* // Infrastructure Risk */}
            {"// Infrastructure Risk"}
          </span>
          
          <div className="pt-6">
            <div
              className="font-mono text-[10px] mb-4 opacity-50"
              style={{ color: "var(--text-muted)" }}
            >
              ⚑ Forecast variance exceeded tolerance in prior cycle.
            </div>
            <span 
              className="block font-mono text-[10px] uppercase tracking-widest mb-2 text-[var(--ink-muted)]"
            >
              Maturity Constraint
            </span>
            {/* Maturity constraint language */}
            <p className="text-base leading-relaxed font-medium text-[var(--ink-primary)]">
              Current status: functionally constrained by thermal infrastructure requirements.
            </p>
            {/* Explicit bottleneck sentence */}
            <p
              className="text-lg leading-relaxed mt-4"
              style={{ color: "var(--text-primary)" }}
            >
              While edge inference speed has surpassed internal benchmarks, the heat dissipation limits of standard tactical enclosures have created an operational bottleneck. The hardware cannot currently be deployed outside of specialized, actively cooled data centers without risking catastrophic degradation.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
            {/* // Portfolio Exposure */}
            {"// Portfolio Exposure"}
          </span>
          <p
            className="text-lg leading-relaxed"
            style={{ color: "var(--text-primary)" }}
          >
            Infrastructure limitations rarely stay isolated. They propagate outward, forcing uncomfortable compromises on adjacent systems and delayed timelines across the portfolio.
          </p>

          <div className="pt-6">
            <span className="block font-mono text-[10px] uppercase tracking-widest mb-2 text-[var(--ink-primary)]">
              Dependency Impact
            </span>
            {/* Named dependent program */}
            <p className="text-base leading-relaxed text-[var(--ink-primary)]">
              This architectural friction directly threatens the deployment schedule of the Expeditionary Field Intelligence Program (EFIP). Until the thermal efficiency ratio improves by a factor of 3x, EFIP cannot integrate the advanced processing module without compromising core mobility and acoustic signature requirements.
            </p>
          </div>
        </div>

      </div>

      <div className="space-y-6 max-w-[760px] mx-auto w-full pb-32">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
          {/* // Forecast Revisions & Allocation Impact */}
          {"// Forecast Revisions & Allocation Impact"}
        </span>

        <div className="flex flex-col gap-12 pt-6">
          <div className="space-y-5">
            <div className="grid grid-cols-[120px_1fr] gap-x-6 gap-y-3">

              <span className="font-mono text-[10px] uppercase tracking-widest pt-1" style={{ color: "var(--text-muted)" }}>
                Forecast Issued
              </span>
              <p className="text-base leading-relaxed" style={{ color: "var(--text-primary)" }}>
                Q3 2025: Edge inference module projected deployment-ready in at least two operational environment types by Q1 2026. Assumed thermal constraint resolvable via passive cooling adaptation. Confidence at issuance: Moderate (±12% variance tolerance).
              </p>

              <span className="font-mono text-[10px] uppercase tracking-widest pt-1" style={{ color: "var(--text-muted)" }}>
                Observed
              </span>
              <p className="text-base leading-relaxed" style={{ color: "var(--text-primary)" }}>
                Deployment-ready in zero operational environment types. Passive cooling adaptation insufficient. Active cooling infrastructure required across all non-laboratory configurations.
              </p>

              <span className="font-mono text-[10px] uppercase tracking-widest pt-1" style={{ color: "var(--text-muted)" }}>
                Variance
              </span>
              <p className="text-base leading-relaxed font-medium" style={{ color: "var(--text-primary)" }}>
                −100% on deployment readiness outcome. Confidence tolerance breached.
              </p>

              <span className="font-mono text-[10px] uppercase tracking-widest pt-1" style={{ color: "var(--text-muted)" }}>
                Consequence
              </span>
              <p className="text-base leading-relaxed" style={{ color: "var(--text-primary)" }}>
                EFIP integration schedule frozen. Capital redirected to thermal infrastructure R&amp;D. Escalation locked until 3x thermal efficiency ratio demonstrated.
              </p>

              <span className="font-mono text-[10px] uppercase tracking-widest pt-1 text-[var(--ink-muted)]">
                Root Cause
              </span>
              <p className="text-sm leading-relaxed text-[var(--ink-primary)]">
                Deployment friction — thermal constraint severity in operational environments underestimated at issuance.
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
