"use client";

import { RegionLayout } from "./regions/RegionLayout";

export function SignalsRegion() {
  return (
    <RegionLayout
      label="Signals"
      title="Volatility, at the edge."
      leadParagraph="The loudest signals are rarely the most important. By the time a technology reaches mainstream discourse, the critical transition has already occurred. True intelligence operates at the edge, where signals are faint, volatile, and deeply specialized. We monitor the friction points where initial theory collides with baseline reality."
    >
      <div className="max-w-[760px] mx-auto w-full space-y-16 pb-32">
        
        <div className="space-y-6">
          <span
            className="font-mono text-xs uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            {"// Observation Horizon"}
          </span>
          <p
            className="text-lg leading-relaxed"
            style={{ color: "var(--text-primary)" }}
          >
            Venture enthusiasm follows capital. Engineering enthusiasm follows capability. But long-term volatility often stems from infrastructure inadequacy. We focus our observation on the gap between what is demonstrated on stage and what can be sustained under load.
          </p>
          <p
            className="text-lg leading-relaxed"
            style={{ color: "var(--text-primary)" }}
          >
            A high volume of activity does not indicate maturity. Often, it indicates a gold rush into an area with unresolved structural flaws. We track the unglamorous metrics of failure.
          </p>
        </div>

        <div className="space-y-6">
          <span
            className="font-mono text-xs uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            {"// Edge Transition"}
          </span>
          
          <div className="pt-6">
            <div
              className="font-mono text-[10px] mb-4 opacity-50"
              style={{ color: "var(--text-muted)" }}
            >
              ⚑ Forecast variance exceeded tolerance in prior cycle.
            </div>
            <span
              className="block font-mono text-[10px] uppercase tracking-widest mb-2"
              style={{ color: "var(--text-muted)" }}
            >
              Volatility Index
            </span>
            {/* Since last review delta */}
            <div
              className="font-mono text-[13px] mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Since last review — edge deployment failure rate -12%, multi-node consistency latency +45ms.
            </div>
            
            {/* Volatility Qualifier */}
            <p
              className="text-lg leading-relaxed"
              style={{ color: "var(--text-primary)" }}
            >
              The state of decentralized edge orchestration is currently <span className="font-medium" style={{ color: "var(--text-primary)" }}>destabilizing</span>. While raw compute deployment success rates have improved, the latency overhead introduced by maintaining state consistency across asymmetric nodes remains an unsolved gating factor.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <span
            className="font-mono text-xs uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            {"// Inversion Point"}
          </span>
          <p
            className="text-lg leading-relaxed"
            style={{ color: "var(--text-primary)" }}
          >
            Transitions rarely occur on a smooth gradient. They occur when a specific, stubborn friction point is finally resolved, suddenly unlocking the accumulated potential of the adjacent systems.
          </p>

          <div className="pt-6">
            <span
              className="block font-mono text-[10px] uppercase tracking-widest mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Transition Condition
            </span>
            {/* One sentence on what would flip posture */}
            <p
              className="text-lg leading-relaxed"
              style={{ color: "var(--text-primary)" }}
            >
              Our defensive posture holds. A verified reduction in cross-node consistency latency below the 15ms threshold will trigger an immediate upgrade to active architectural prototyping.
            </p>
          </div>
        </div>

      </div>

      <div className="space-y-6 max-w-[760px] mx-auto w-full pb-32">
        <span
          className="font-mono text-xs uppercase tracking-widest"
          style={{ color: "var(--text-muted)" }}
        >
          {"// Forecast Revisions & Allocation Impact"}
        </span>

        <div className="flex flex-col gap-12 pt-6">
          <div className="space-y-5">
            <div className="grid grid-cols-[120px_1fr] gap-x-6 gap-y-3">

              <span className="font-mono text-[10px] uppercase tracking-widest pt-1" style={{ color: "var(--text-muted)" }}>
                Forecast Issued
              </span>
              <p className="text-base leading-relaxed" style={{ color: "var(--text-primary)" }}>
                Q3 2025: Cross-node consistency latency projected to stabilize below 30ms by Q1 2026. Assumed continued failure rate improvement ≥15% QoQ. Confidence at issuance: Moderate (±12% variance tolerance).
              </p>

              <span className="font-mono text-[10px] uppercase tracking-widest pt-1" style={{ color: "var(--text-muted)" }}>
                Observed
              </span>
              <p className="text-base leading-relaxed" style={{ color: "var(--text-primary)" }}>
                Latency increased +45ms against baseline — wrong direction from projection. Failure rate improved −12% QoQ, below the ≥15% threshold. Stability degraded under distributed load conditions not modeled at issuance.
              </p>

              <span className="font-mono text-[10px] uppercase tracking-widest pt-1" style={{ color: "var(--text-muted)" }}>
                Variance
              </span>
              <p className="text-base leading-relaxed font-medium" style={{ color: "var(--text-primary)" }}>
                Latency gating threshold: +150% above projection (observed ~75ms vs. projected ≤30ms). Confidence tolerance breached.
              </p>

              <span className="font-mono text-[10px] uppercase tracking-widest pt-1" style={{ color: "var(--text-muted)" }}>
                Consequence
              </span>
              <p className="text-base leading-relaxed" style={{ color: "var(--text-primary)" }}>
                Prototyping authorization withheld. Active architectural work deferred pending latency stabilization. Review cycle unchanged at 90D.
              </p>

              <span className="font-mono text-[10px] uppercase tracking-widest pt-1" style={{ color: "var(--text-muted)" }}>
                Root Cause
              </span>
              <p className="text-base leading-relaxed" style={{ color: "var(--text-primary)" }}>
                Model horizon error — latency trajectory extrapolated from controlled conditions, distributed field load unmodeled.
              </p>

            </div>
          </div>
        </div>
      </div>

    </RegionLayout>
  );
}
