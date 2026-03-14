"use client";

import { useState } from "react";

export function MaturityCurves() {
  const [hoveredCurve, setHoveredCurve] = useState<"s" | "hype" | null>(null);

  return (
    <div className="flex gap-6">
      {/* S-Curve */}
      <div
        className={`flex-1 panel-secondary ${hoveredCurve === "s" ? "border-accent/50" : ""}`}
        onMouseEnter={() => setHoveredCurve("s")}
        onMouseLeave={() => setHoveredCurve(null)}
        style={{ transition: "border-color 150ms ease-out" }}
      >
        <h3 className="text-label text-text-primary uppercase tracking-wider mb-4">
          Technical Maturity (S-Curve)
        </h3>
        <div className="relative h-40">
          {/* Y-axis */}
          <div className="absolute left-0 top-0 bottom-6 w-px bg-border" />
          <span className="absolute -left-1 top-0 text-[10px] text-text-muted -translate-x-full">
            Maturity
          </span>

          {/* X-axis */}
          <div className="absolute left-0 right-0 bottom-6 h-px bg-border" />
          <span className="absolute right-0 bottom-0 text-[10px] text-text-muted">
            Time →
          </span>

          {/* S-Curve shape */}
          <svg
            viewBox="0 0 200 100"
            className="absolute inset-0 w-full h-[calc(100%-1.5rem)]"
            preserveAspectRatio="none"
          >
            <path
              d="M 10 90 Q 30 90 50 85 Q 80 75 100 50 Q 120 25 140 15 Q 160 10 190 10"
              fill="none"
              className="stroke-accent"
              strokeWidth={hoveredCurve === "s" ? "3" : "2"}
              strokeLinecap="round"
              style={{ transition: "stroke-width 150ms ease-out" }}
            />
          </svg>

          {/* Phase labels */}
          <div
            className="absolute bottom-8 left-4 text-[9px] text-text-muted"
            style={{ opacity: hoveredCurve === "s" ? 1 : 0.7, transition: "opacity 150ms" }}
          >
            Emergence
          </div>
          <div
            className="absolute bottom-16 left-1/3 text-[9px] text-accent"
            style={{ opacity: hoveredCurve === "s" ? 1 : 0.7, transition: "opacity 150ms" }}
          >
            Growth
          </div>
          <div
            className="absolute top-2 right-8 text-[9px] text-text-muted"
            style={{ opacity: hoveredCurve === "s" ? 1 : 0.7, transition: "opacity 150ms" }}
          >
            Plateau
          </div>
        </div>
      </div>

      {/* Hype Cycle */}
      <div
        className={`flex-1 panel-secondary ${hoveredCurve === "hype" ? "border-signal/50" : ""}`}
        onMouseEnter={() => setHoveredCurve("hype")}
        onMouseLeave={() => setHoveredCurve(null)}
        style={{ transition: "border-color 150ms ease-out" }}
      >
        <h3 className="text-label text-text-primary uppercase tracking-wider mb-4">
          Social Expectation (Hype Cycle)
        </h3>
        <div className="relative h-40">
          {/* Y-axis */}
          <div className="absolute left-0 top-0 bottom-6 w-px bg-border" />
          <span className="absolute -left-1 top-0 text-[10px] text-text-muted -translate-x.full">
            Hype
          </span>

          {/* X-axis */}
          <div className="absolute left-0 right-0 bottom-6 h-px bg-border" />
          <span className="absolute right-0 bottom-0 text-[10px] text-text-muted">
            Time →
          </span>

          {/* Hype Cycle shape */}
          <svg
            viewBox="0 0 200 100"
            className="absolute inset-0 w-full h-[calc(100%-1.5rem)]"
            preserveAspectRatio="none"
          >
            <path
              d="M 10 85 Q 30 80 45 20 Q 55 5 65 20 Q 80 60 100 75 Q 130 85 160 60 Q 180 45 190 40"
              fill="none"
              className="stroke-signal"
              strokeWidth={hoveredCurve === "hype" ? "3" : "2"}
              strokeLinecap="round"
              style={{ transition: "stroke-width 150ms ease-out" }}
            />
          </svg>

          {/* Phase labels */}
          <div
            className="absolute top-4 left-10 text-[9px] text-signal"
            style={{ opacity: hoveredCurve === "hype" ? 1 : 0.7, transition: "opacity 150ms" }}
          >
            Peak
          </div>
          <div
            className="absolute bottom-10 left-1/3 text-[9px] text-text-muted"
            style={{ opacity: hoveredCurve === "hype" ? 1 : 0.7, transition: "opacity 150ms" }}
          >
            Trough
          </div>
          <div
            className="absolute top-8 right-4 text-[9px] text-text-muted"
            style={{ opacity: hoveredCurve === "hype" ? 1 : 0.7, transition: "opacity 150ms" }}
          >
            Plateau
          </div>
        </div>
      </div>
    </div>
  );
}
