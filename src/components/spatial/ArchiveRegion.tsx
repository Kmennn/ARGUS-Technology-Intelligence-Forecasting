"use client";

import { useState } from "react";
import { RegionLayout } from "./regions/RegionLayout";

export function ArchiveRegion() {
  const [showProjectionDetail, setShowProjectionDetail] = useState(false);

  return (
    <RegionLayout
      label="Archive"
      title="The evolution of posture."
      leadParagraph="Intelligence without memory is just reporting. The value of an institution is not in its current assessment, but in its ability to document how and why that assessment evolved. We preserve prior postures, changed assumptions, and the specific triggers that forced revisions. This is the timeline of our understanding."
    >
      <div className="max-w-[760px] mx-auto w-full space-y-16 pb-32">
        
        <div className="space-y-6">
          <span
            className="font-mono text-xs uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            {"// Assumption Degradation"}
          </span>
          <p
            className="text-lg leading-relaxed"
            style={{ color: "var(--text-primary)" }}
          >
            Assumptions degrade. The models we use to evaluate readiness in Q1 often become obsolete by Q4 as fundamental constraints shift. Tracking this degradation is as important as tracking the technology itself.
          </p>
          <p
            className="text-lg leading-relaxed"
            style={{ color: "var(--text-primary)" }}
          >
            A static assessment implies false certainty. A recorded history of revisions proves that the observatory is actively calibrating against reality.
          </p>
        </div>

        <div className="space-y-6">
          <span
            className="font-mono text-xs uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            {"// Posture Ledger"}
          </span>

          <div className="flex flex-col gap-12 pt-6">
            
            {/* Timeline Item 1 - Current */}
            <div>
              <div className="flex justify-between items-baseline mb-4">
                <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--text-primary)" }}>
                  {"MAR 2026 // Q1 REVIEW"}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest font-medium" style={{ color: "var(--text-primary)" }}>
                  POSTURE: DEFENSIVE HOLD
                </span>
              </div>
              <p className="text-lg leading-relaxed font-medium mb-4" style={{ color: "var(--text-primary)" }}>
                Revised assumption: Thermal limits, not algorithmic efficiency, govern deployment viability.
              </p>
              <p className="text-lg leading-relaxed" style={{ color: "var(--text-primary)" }}>
                The introduction of the 7nm embedded TPU architecture invalidated our previous power-draw models. While compute density increased significantly, heat dissipation requirements surpassed the structural capacity of ruggedized field enclosures. Active deployment escalation is locked until the thermal efficiency ratio demonstrates a verifiable 3x improvement.
              </p>
            </div>

            {/* Divider */}
            <div className="w-full h-px" style={{ backgroundColor: "rgba(138,126,119,0.15)" }} />

            {/* Timeline Item 2 - Historical */}
            <div className="opacity-70">
              <div className="flex justify-between items-baseline mb-4">
                <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--text-primary)" }}>
                  {"OCT 2025 // Q4 REVIEW"}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                  POSTURE: ESCALATING
                </span>
              </div>
              <p className="text-lg leading-relaxed font-medium mb-4" style={{ color: "var(--text-primary)" }}>
                Prior assumption: Algorithmic optimization will enable localized inference on existing tactical networks.
              </p>
              <p className="text-lg leading-relaxed" style={{ color: "var(--text-primary)" }}>
                Initial baseline formalized. Cross-domain fusion was observed between sparse neural network design and edge routing protocols, indicating a high probability of un-tethered operational capability emerging within two funding cycles. Early capital allocation recommended.
              </p>
            </div>

            {/* Divider */}
            <div className="w-full h-px" style={{ backgroundColor: "rgba(138,126,119,0.15)" }} />

            {/* Timeline Item 3 - Historical */}
            <div className="opacity-50">
              <div className="flex justify-between items-baseline mb-4">
                <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--text-primary)" }}>
                  {"JUL 2025 // Q3 REVIEW"}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                  POSTURE: MONITORING
                </span>
              </div>
              <p className="text-lg leading-relaxed font-medium mb-4" style={{ color: "var(--text-primary)" }}>
                Initial assumption: Decentralized edge orchestration remains bound by basic consistency latency.
              </p>
              <p className="text-lg leading-relaxed" style={{ color: "var(--text-primary)" }}>
                First signals of asymmetric node stability detected in academic pre-prints. Technology classified as theoretical. Insufficient validation to warrant dedicated tracking resources.
              </p>
            </div>

          </div>
        </div>

        {/* Forecast Register */}
        <div className="space-y-6">
          <span
            className="font-mono text-xs uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            {"// Forecast Revisions & Allocation Impact"}
          </span>
          <p
            className="text-lg leading-relaxed"
            style={{ color: "var(--text-primary)" }}
          >
            Confidence is not permanent. It is issued with a declared tolerance and measured against outcome. When variance exceeds that tolerance, allocation decisions must follow. This register documents that loop.
          </p>

          <div className="flex flex-col gap-12 pt-6">

            {/* Forecast Entry 1 */}
            <div className="space-y-5">
              <div className="grid grid-cols-[120px_1fr] gap-x-6 gap-y-3">

                <span className="font-mono text-[10px] uppercase tracking-widest pt-1" style={{ color: "var(--text-muted)" }}>
                  Forecast Issued
                </span>
                <p className="text-base leading-relaxed" style={{ color: "var(--text-primary)" }}>
                  Q3 2025: Prototype validation projected by Q1 2026. Assumed procurement reference growth ≥10% QoQ. Confidence at issuance: Moderate (±12% variance tolerance).
                </p>

                <span className="font-mono text-[10px] uppercase tracking-widest pt-1" style={{ color: "var(--text-muted)" }}>
                  Observed
                </span>
                <p className="text-base leading-relaxed" style={{ color: "var(--text-primary)" }}>
                  Prototype validation delayed. Procurement reference growth +4% QoQ — below the ≥10% trigger threshold. Field validation programs did not initiate within the projected cycle.
                </p>

                <span className="font-mono text-[10px] uppercase tracking-widest pt-1" style={{ color: "var(--text-muted)" }}>
                  Variance
                </span>
                <p className="text-base leading-relaxed font-medium" style={{ color: "var(--text-primary)" }}>
                  −6% relative to projected procurement velocity. Confidence tolerance breached.
                </p>

                <span className="font-mono text-[10px] uppercase tracking-widest pt-1" style={{ color: "var(--text-muted)" }}>
                  Consequence
                </span>
                <p className="text-base leading-relaxed" style={{ color: "var(--text-primary)" }}>
                  Capital allocation reduced 18%. Escalation deferred to Q3 review cycle. Posture revised from Escalating to Defensive Hold, effective MAR 2026.
                </p>

                <span className="font-mono text-[10px] uppercase tracking-widest pt-1" style={{ color: "var(--text-muted)" }}>
                  Root Cause
                </span>
                <p className="text-base leading-relaxed" style={{ color: "var(--text-primary)" }}>
                  Indicator misweighting — simulation performance overweighted relative to deployment readiness.
                </p>

              </div>

            </div>

          </div>
        </div>

        {/* Portfolio Reliability — Q1 Systemic Review */}
        <div className="space-y-8 pt-8" style={{ borderTop: "1px solid var(--border-subtle, rgba(255,255,255,0.08))" }}>
          <span
            className="font-mono text-xs uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            {"// Portfolio Reliability — Q1 Systemic Review"}
          </span>

          {/* Diagnostic Strip */}
          <div className="space-y-6">

            {/* 1 — Reliability Fraction (Verdict) */}
            <div className="font-mono text-[11px]" style={{ color: "var(--text-muted)" }}>
              <span>Portfolio Reliability — Q1:</span>
              <span style={{ margin: "0 6px", color: "rgba(220, 80, 80, 0.75)" }}>0 / 4</span>
              <span>within tolerance</span>
            </div>

            {/* 2 — Variance Heat Strip (Evidence) */}
            <div className="space-y-1">
              {[
                { domain: "Research",     variance: "−6%",    label: "OUTSIDE BAND" },
                { domain: "Analysis",     variance: "−100%",  label: "OUTSIDE BAND" },
                { domain: "Signals",      variance: "+150%",  label: "OUTSIDE BAND" },
                { domain: "Capabilities", variance: "−100%",  label: "OUTSIDE BAND" },
              ].map(({ domain, variance, label }) => (
                <div
                  key={domain}
                  className="grid font-mono text-[11px] tracking-wide"
                  style={{ gridTemplateColumns: "120px 60px 1fr" }}
                >
                  <span style={{ color: "var(--text-muted)" }}>{domain}</span>
                  <span style={{ color: "rgba(220, 80, 80, 0.75)" }}>{variance}</span>
                  <span style={{ color: "var(--text-primary)", opacity: 0.55 }}>{label}</span>
                </div>
              ))}
            </div>

            {/* 3 — Bias Vector (Diagnosis) */}
            <div className="space-y-2">
              <span
                className="font-mono text-[10px] uppercase tracking-widest"
                style={{ color: "var(--text-muted)" }}
              >
                Dominant Bias Vector
              </span>
              <div className="flex items-center gap-3 font-mono text-[11px]" style={{ color: "var(--text-primary)" }}>
                <span style={{ color: "var(--text-muted)", letterSpacing: "0.08em" }}>
                  SIMULATION OVERWEIGHTING
                </span>
                <span style={{ color: "rgba(220, 80, 80, 0.55)", letterSpacing: "-0.05em" }}>
                  ██████████
                </span>
                <span style={{ color: "var(--text-muted)", opacity: 0.7 }}>4 / 4 domains</span>
              </div>
            </div>

          </div>

          {/* Divider before memo */}
          <div style={{ borderTop: "1px solid var(--border-subtle, rgba(255,255,255,0.05))" }} />

          <p
            className="text-lg leading-relaxed"
            style={{ color: "var(--text-primary)" }}
          >
            Four of four domains exceeded declared variance tolerance during the Q1 review cycle. Under a ±12% projection regime, simultaneous breach across independent domains is statistically unlikely. The pattern indicates shared methodological distortion rather than isolated domain volatility.
          </p>

          <p
            className="text-lg leading-relaxed"
            style={{ color: "var(--text-primary)" }}
          >
            Across domains, forecast issuance weighted controlled or simulated validation environments more heavily than operational field exposure. Publication velocity, laboratory latency modeling, and passive thermal assumptions were treated as maturity proxies beyond their evidentiary strength. This constitutes a systemic bias in the Q3 2025 issuance methodology.
          </p>

          <p
            className="text-lg leading-relaxed"
            style={{ color: "var(--text-primary)" }}
          >
            Methodology adjustment directive: increase weighting of field validation evidence in issuance models effective next cycle. Confidence will be considered restored upon publication of operationally representative validation data in at least two domains during the Q2 review. Until that condition is met, all allocation posture decisions derived from this cycle remain provisional.
          </p>

          {/* Issuance Model Adjustment Table */}
          <div className="space-y-5 pt-2">
            <span
              className="font-mono text-[10px] uppercase tracking-widest"
              style={{ color: "var(--text-muted)" }}
            >
              Issuance Model Adjustment — Effective Q2 2026
            </span>

            <div className="space-y-1">
              <span
                className="font-mono text-[10px] uppercase tracking-widest"
                style={{ color: "var(--text-muted)", opacity: 0.6 }}
              >
                Evidence Weighting Revision
              </span>

              <div
                className="font-mono text-[11px] leading-relaxed pt-2"
                style={{ color: "var(--text-primary)" }}
              >
                {[
                  { label: "Field Validation Evidence",  from: "0.35", to: "0.55", changed: true  },
                  { label: "Simulation Performance",     from: "0.40", to: "0.20", changed: true  },
                  { label: "Publication Velocity",       from: "0.25", to: "0.25", changed: false },
                ].map(({ label, from, to, changed }) => (
                  <div
                    key={label}
                    className="grid items-baseline"
                    style={{ gridTemplateColumns: "220px 60px 16px 60px", marginBottom: "6px" }}
                  >
                    <span style={{ color: "var(--text-muted)" }}>{label}</span>
                    <span style={{ color: changed ? "var(--text-primary)" : "var(--text-muted)", opacity: changed ? 1 : 0.5 }}>{from}</span>
                    <span style={{ color: "var(--text-muted)", opacity: 0.4, textAlign: "center" }}>→</span>
                    <span style={{ color: changed ? "var(--text-primary)" : "var(--text-muted)", opacity: changed ? 1 : 0.5 }}>{to}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="font-mono text-[11px] space-y-1 pt-1"
              style={{ borderTop: "1px solid var(--border-subtle, rgba(255,255,255,0.06))", paddingTop: "12px" }}
            >
              <div
                className="grid"
                style={{ gridTemplateColumns: "220px 1fr" }}
              >
                <span style={{ color: "var(--text-muted)" }}>Tolerance Band</span>
                <span style={{ color: "var(--text-muted)", opacity: 0.55 }}>±12% (unchanged)</span>
              </div>
              <div
                className="grid"
                style={{ gridTemplateColumns: "220px 1fr" }}
              >
                <span style={{ color: "var(--text-muted)" }}>Review Cadence</span>
                <span style={{ color: "var(--text-muted)", opacity: 0.55 }}>90D (unchanged)</span>
              </div>
            </div>
          </div>

          {/* Q2 Simulation Mode — Executive Strip */}
          <div className="space-y-6 pt-2">
            <span
              className="font-mono text-[10px] uppercase tracking-widest"
              style={{ color: "var(--text-muted)" }}
            >
              Q2 Issuance Projection — Simulation Mode
            </span>

            {/* 1 — Portfolio Direction Verdict */}
            <div className="space-y-1">
              <p
                className="font-mono text-[13px] font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Projected Reliability (Q2, Conditional): Improving but Fragile
              </p>
              <p
                className="font-mono text-[11px]"
                style={{ color: "var(--text-muted)" }}
              >
                Expected domains within tolerance: 1–2 of 4 (if field validation materializes)
              </p>
            </div>

            {/* 2 — Domain Status Snapshot */}
            <div className="space-y-1">
              {[
                { domain: "Research",     q1: "OUTSIDE", direction: "↗", label: "Narrowing",             structural: false },
                { domain: "Analysis",     q1: "OUTSIDE", direction: "↗", label: "Significant Narrowing", structural: false },
                { domain: "Signals",      q1: "OUTSIDE", direction: "→", label: "Structural Risk",        structural: true  },
                { domain: "Capabilities", q1: "OUTSIDE", direction: "↗", label: "Significant Narrowing", structural: false },
              ].map(({ domain, q1, direction, label, structural }) => (
                <div
                  key={domain}
                  className="grid font-mono text-[11px] items-baseline"
                  style={{ gridTemplateColumns: "120px 80px 16px 1fr" }}
                >
                  <span style={{ color: "var(--text-muted)" }}>{domain}</span>
                  <span style={{ color: "rgba(220, 80, 80, 0.65)", fontSize: "10px", letterSpacing: "0.06em" }}>{q1}</span>
                  <span style={{ color: structural ? "rgba(220, 80, 80, 0.55)" : "var(--text-primary)", opacity: structural ? 1 : 0.7 }}>{direction}</span>
                  <span style={{ color: structural ? "rgba(220, 80, 80, 0.7)" : "var(--text-primary)", opacity: structural ? 1 : 0.75 }}>{label}</span>
                </div>
              ))}
            </div>

            {/* 3 — Condition Trigger */}
            <div
              className="space-y-1 font-mono text-[11px] pt-1"
              style={{ borderTop: "1px solid var(--border-subtle, rgba(255,255,255,0.06))", paddingTop: "12px" }}
            >
              <div style={{ color: "var(--text-muted)", opacity: 0.8 }}>
                Condition for restoration: Operational field validation in ≥2 domains by Q2 review.
              </div>
              <div style={{ color: "var(--text-muted)", opacity: 0.5 }}>
                If not met: Reliability improvement unlikely.
              </div>
            </div>

            {/* Expandable: Model Projection Detail */}
            <div className="pt-1">
              <button
                onClick={() => setShowProjectionDetail(v => !v)}
                className="font-mono text-[10px] uppercase tracking-widest"
                style={{
                  color: "var(--text-muted)",
                  opacity: 0.45,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  letterSpacing: "0.08em",
                }}
              >
                {showProjectionDetail ? "Hide" : "View"} model projection detail
              </button>

              {showProjectionDetail && (
                <div
                  className="space-y-1 pt-4 font-mono text-[11px]"
                  style={{ color: "var(--text-primary)" }}
                >
                  <div
                    className="grid pb-2"
                    style={{
                      gridTemplateColumns: "120px 1fr 1fr",
                      borderBottom: "1px solid var(--border-subtle, rgba(255,255,255,0.06))",
                      marginBottom: "6px",
                    }}
                  >
                    <span style={{ color: "var(--text-muted)", opacity: 0.5 }} />
                    <span style={{ color: "var(--text-muted)", opacity: 0.5 }}>Q1 Range</span>
                    <span style={{ color: "var(--text-muted)", opacity: 0.5 }}>Q2 Projected Range</span>
                  </div>
                  {[
                    { domain: "Research",     q1: "−4% to −9%",     q2: "−2% to −6%"    },
                    { domain: "Analysis",     q1: "−70% to −130%",  q2: "−20% to −50%"  },
                    { domain: "Signals",      q1: "+100% to +200%", q2: "+60% to +120%" },
                    { domain: "Capabilities", q1: "−70% to −130%",  q2: "−20% to −50%"  },
                  ].map(({ domain, q1, q2 }) => (
                    <div
                      key={domain}
                      className="grid items-baseline"
                      style={{ gridTemplateColumns: "120px 1fr 1fr", marginBottom: "4px" }}
                    >
                      <span style={{ color: "var(--text-muted)", opacity: 0.7 }}>{domain}</span>
                      <span style={{ color: "var(--text-primary)", opacity: 0.45 }}>{q1}</span>
                      <span style={{ color: "var(--text-primary)", opacity: 0.7 }}>{q2}</span>
                    </div>
                  ))}
                  <div
                    className="grid items-baseline pt-2"
                    style={{
                      gridTemplateColumns: "120px 1fr 1fr",
                      borderTop: "1px solid var(--border-subtle, rgba(255,255,255,0.05))",
                      paddingTop: "6px",
                    }}
                  >
                    <span style={{ color: "var(--text-muted)", opacity: 0.7 }}>Within Tolerance</span>
                    <span style={{ color: "rgba(220, 80, 80, 0.6)" }}>0 / 4</span>
                    <span style={{ color: "var(--text-primary)", opacity: 0.7 }}>1–2 / 4 (conditional)</span>
                  </div>
                  <p
                    className="text-[10px] pt-3"
                    style={{ color: "var(--text-muted)", opacity: 0.45, lineHeight: 1.6 }}
                  >
                    Ranges derived from weight adjustment: simulation −50%, field validation +57%. Binary milestone domains improve through forecast accuracy, not outcome change.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </RegionLayout>
  );
}
