"use client";

import { useState } from "react";
import type { TRLAssessment } from "@/types/trl";
import { TRL_DESCRIPTIONS } from "@/types/trl";

interface TRLProgressionProps {
  assessment: TRLAssessment;
}

const evidenceIcons: Record<string, string> = {
  paper: "📄",
  lab: "🔬",
  field: "📊",
  operational: "✓",
};

export function TRLProgression({ assessment }: TRLProgressionProps) {
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);
  const levels = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const { currentTRL, confidenceRange, evidence } = assessment;

  return (
    <div className="flex flex-col gap-4">
      {/* Progression Bar */}
      <div className="relative py-4">
        <div className="absolute top-1/2 left-3 right-3 h-1 -translate-y-1/2 bg-border rounded-full" />
        <div
          className="absolute top-1/2 left-3 h-1 -translate-y-1/2 bg-accent rounded-full"
          style={{ width: `calc(${((currentTRL - 1) / 8) * 100}% - 6px)` }}
        />
        <div
          className="absolute top-1/2 h-6 -translate-y-1/2 bg-accent/10 rounded pointer-events-none"
          style={{
            left: `calc(${((confidenceRange[0] - 1) / 8) * 100}%)`,
            width: `${((confidenceRange[1] - confidenceRange[0] + 1) / 8) * 100}%`,
          }}
        />

        <div className="relative flex justify-between px-1">
          {levels.map((level) => {
            const isCompleted = level < currentTRL;
            const isCurrent = level === currentTRL;
            const isPending = level > currentTRL;
            const isHovered = hoveredLevel === level;

            return (
              <div
                key={level}
                className="flex flex-col items-center relative"
                onMouseEnter={() => setHoveredLevel(level)}
                onMouseLeave={() => setHoveredLevel(null)}
              >
                <div
                  className={`
                    trl-step w-8 h-8 rounded-full flex items-center justify-center text-caption font-mono
                    ${isCurrent ? "bg-accent text-background-primary ring-4 ring-accent/30" : ""}
                    ${isCompleted ? "bg-accent/80 text-background-primary" : ""}
                    ${isPending ? "bg-background-tertiary text-text-muted border border-border" : ""}
                    ${isHovered ? "border-accent" : ""}
                  `}
                  style={{
                    transform: isHovered ? "scale(1.15)" : "scale(1)",
                    transition: "transform 150ms ease-out, border-color 150ms ease-out",
                  }}
                >
                  {level}
                </div>

                {isHovered && (
                  <div
                    className="tooltip tooltip-visible whitespace-nowrap"
                    style={{
                      bottom: "calc(100% + 12px)",
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                  >
                    <div className="font-medium text-text-primary">TRL {level}</div>
                    <div className="text-text-muted">{TRL_DESCRIPTIONS[level]}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Evidence markers */}
      <div className="relative flex justify-between px-2">
        {levels.map((level) => {
          const evidenceItem = evidence[level];
          const icon = evidenceItem ? evidenceIcons[evidenceItem.type] : null;
          const isHovered = hoveredLevel === level;
          return (
            <div key={level} className="w-8 flex justify-center">
              {icon && (
                <span
                  className="text-sm"
                  style={{
                    opacity: isHovered ? 1 : 0.6,
                    transform: isHovered ? "scale(1.2)" : "scale(1)",
                    transition: "opacity 150ms ease-out, transform 150ms ease-out",
                  }}
                  title={evidenceItem?.label}
                >
                  {icon}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-caption text-text-muted pt-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-accent" />
          <span>Current TRL</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-8 h-2 rounded bg-accent/10" />
          <span>Confidence Band</span>
        </div>
        <div className="flex items-center gap-2">
          <span>📄 🔬 📊 ✓</span>
          <span>Evidence Markers</span>
        </div>
      </div>
    </div>
  );
}
