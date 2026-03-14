"use client";

import { RegionLayout } from "./regions/RegionLayout";
import { ConvergenceGraph } from "@/components/intelligence/research/ConvergenceGraph";

export function AnalysisRegion() {
  return (
    <RegionLayout
      label="Analysis"
      title="Convergence Analysis"
      leadParagraph="Isolated data is noise. Strategic advantage emerges from synthesis. We track the intersections where separate disciplines collide, forming patterns that redefine constraints. Analysis is the discipline of recognizing these collisions before they become conventional wisdom."
    >
      <div className="max-w-[760px] mx-auto w-full space-y-12 pb-32">
        
        {/* Convergence Graph — Primary Surface */}
        <div className="pt-4">
          <ConvergenceGraph />
        </div>

        <div className="space-y-6">
          <span
            className="font-mono text-xs uppercase tracking-[0.05em] font-semibold"
            style={{ color: "var(--ink-tertiary)" }}
          >
            {"// Convergence"}
          </span>
          <div className="space-y-6">
            <p className="text-[15px] leading-[1.75] max-w-[65ch]" style={{ color: "var(--ink-secondary)" }}>
              Signals do not aggregate randomly. They cluster around bottlenecks. When multiple independent research vectors converge on a shared technical limitation, that limitation is preparing to break.
            </p>
            <p className="text-[15px] leading-[1.75] max-w-[65ch]" style={{ color: "var(--ink-secondary)" }}>
              Identifying this requires looking past the primary subject of a demonstration to examine the infrastructure enabling it. Often, the breakthrough is not the application itself, but the uncelebrated plumbing that made it possible.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <span
            className="font-mono text-xs uppercase tracking-[0.05em] font-semibold"
            style={{ color: "var(--ink-tertiary)" }}
          >
            {"// Sector Collision"}
          </span>
          
          <div className="pt-6 border-t border-[var(--border-soft)]">
            <div
              className="font-mono text-[10px] mb-4"
              style={{ color: "var(--ink-muted)" }}
            >
              ⚑ Forecast variance exceeded tolerance in prior cycle.
            </div>
            <span
              className="block font-mono text-[10px] uppercase tracking-[0.05em] font-semibold mb-2"
              style={{ color: "var(--ink-secondary)" }}
            >
              Pattern Assessment
            </span>
            <div
              className="font-mono text-[13px] mb-4 font-bold"
              style={{ color: "var(--ink-primary)" }}
            >
              Since Q4 review — cross-domain citations +28%, shared infrastructure dependencies identified.
            </div>
            
            <p className="text-[15px] leading-[1.75] max-w-[65ch]" style={{ color: "var(--ink-secondary)" }}>
              The isolation between distributed computing frameworks and advanced materials modeling is decoupling. We observe a 28% increase in cooperative publications since the previous assessment. 
            </p>
            
            <p className="text-[15px] leading-[1.75] max-w-[65ch] mt-4" style={{ color: "var(--ink-secondary)" }}>
              If this trajectory holds, the computational bottleneck constraint will functionally dissolve within 12 to 18 months, shifting the limitation entirely to power density.
            </p>
            
            <p className="text-[15px] leading-[1.75] max-w-[65ch] mt-4" style={{ color: "var(--ink-secondary)" }}>
              This collapse is beginning to register as a cascading dependency risk for legacy secure-enclave architectures, currently operating under the assumption of severe computational scarcity.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <span
            className="font-mono text-xs uppercase tracking-[0.05em] font-semibold"
            style={{ color: "var(--ink-tertiary)" }}
          >
            {"// Strategic Posture"}
          </span>
          <p className="text-[15px] leading-[1.75] max-w-[65ch]" style={{ color: "var(--ink-secondary)" }}>
            Organizations typically react to capability demonstrations. We recommend reacting to the shifting economics of constraints.
          </p>

          <div className="pt-6 border-t border-[var(--border-soft)]">
            <span
              className="block font-mono text-[10px] uppercase tracking-[0.05em] font-semibold mb-2"
              style={{ color: "var(--ink-primary)" }}
            >
              Action Directive
            </span>
            <p className="text-[15px] leading-[1.75] max-w-[65ch] font-medium" style={{ color: "var(--ink-primary)" }}>
              Current posture: tracking convergence rate. Do not initiate capability migration based on isolated breakthroughs. Re-evaluate posture if Q2 enterprise pilot data confirms hardware-agnostic stability across three or more test environments.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 max-w-[760px] mx-auto w-full pb-32">
        <span
          className="font-mono text-xs uppercase tracking-[0.05em] font-semibold"
          style={{ color: "var(--ink-tertiary)" }}
        >
          {"// Forecast Revisions & Allocation Impact"}
        </span>

        <div className="flex flex-col gap-12 pt-6">
          <div className="space-y-5">
            <div className="grid grid-cols-[150px_1fr] gap-x-6 gap-y-6">

              <span className="font-mono text-[10px] uppercase tracking-[0.05em] font-semibold pt-1" style={{ color: "var(--ink-muted)" }}>
                Forecast Issued
              </span>
              <p className="text-[14px] leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
                Q3 2025: Cross-domain convergence projected to generate shared infrastructure frameworks by Q1 2026. Assumed cooperative publication velocity ≥20% increase QoQ. Confidence at issuance: Moderate (±12% variance tolerance).
              </p>

              <span className="font-mono text-[10px] uppercase tracking-[0.05em] font-semibold pt-1" style={{ color: "var(--ink-muted)" }}>
                Observed
              </span>
              <p className="text-[14px] leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
                Cooperative publications increased +28% QoQ — above threshold. Cross-domain activity remained parallel, not integrated. No shared infrastructure framework emerged within the projected window.
              </p>

              <span className="font-mono text-[10px] uppercase tracking-[0.05em] font-semibold pt-1" style={{ color: "var(--ink-muted)" }}>
                Variance
              </span>
              <p className="text-[14px] leading-relaxed font-semibold italic" style={{ color: "var(--ink-primary)" }}>
                Infrastructure milestone: −100% against projection. 0 of 1 framework outputs achieved. Confidence tolerance breached.
              </p>

              <span className="font-mono text-[10px] uppercase tracking-[0.05em] font-semibold pt-1" style={{ color: "var(--ink-muted)" }}>
                Consequence
              </span>
              <p className="text-[14px] leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
                Capability migration posture held at tracking. Timeline extended one review cycle. Posture unchanged: convergence rate monitored, not acted upon.
              </p>

              <span className="font-mono text-[10px] uppercase tracking-[0.05em] font-semibold pt-1" style={{ color: "var(--ink-muted)" }}>
                Root Cause
              </span>
              <p className="text-[14px] leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
                Classification lag — publication convergence misread as infrastructure readiness signal.
              </p>

            </div>
          </div>
        </div>
      </div>

    </RegionLayout>
  );
}
