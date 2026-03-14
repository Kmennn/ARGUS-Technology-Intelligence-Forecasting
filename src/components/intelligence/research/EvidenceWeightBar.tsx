"use client";

interface WeightSet {
  field: number;
  simulation: number;
  publication: number;
}

interface EvidenceWeightBarProps {
  current: WeightSet;
  prior: WeightSet;
}

const SEGMENTS = [
  { key: "field" as const,       label: "Field Validation",    color: "var(--accent-deep)" },
  { key: "simulation" as const,  label: "Simulation",          color: "var(--accent-soft)" },
  { key: "publication" as const, label: "Publication Velocity", color: "#D8CEC5" },
];

function WeightBar({ weights, isPrior = false }: { weights: WeightSet; isPrior?: boolean }) {
  return (
    <div 
      className="flex w-full overflow-hidden rounded-[4px]" 
      style={{ 
        height: "8px", 
        border: "1px solid var(--border-soft)",
        background: "rgba(0,0,0,0.02)"
      }}
    >
      {SEGMENTS.map((seg) => (
        <div
          key={seg.key}
          style={{
            width: `${weights[seg.key]}%`,
            background: isPrior ? "var(--accent-ghost)" : seg.color,
            opacity: isPrior ? 0.6 : 1,
            transition: "width 1s ease-in-out"
          }}
        />
      ))}
    </div>
  );
}

export function EvidenceWeightBar({ current, prior }: EvidenceWeightBarProps) {
  return (
    <div className="font-mono space-y-3">
      <span
        className="text-[10px] uppercase tracking-widest font-semibold"
        style={{ color: "var(--ink-secondary)" }}
      >
        Evidence Composition
      </span>

      <div className="space-y-[6px]">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <WeightBar weights={current} />
          </div>
          <span className="text-[9px] w-4 font-bold" style={{ color: "var(--ink-primary)" }}>
            Q2
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <WeightBar weights={prior} isPrior={true} />
          </div>
          <span className="text-[9px] w-4 font-medium" style={{ color: "var(--ink-tertiary)" }}>
            Q1
          </span>
        </div>
      </div>

      <div className="space-y-[4px]">
        {SEGMENTS.map((seg) => {
          const curr = current[seg.key];
          const priorVal = prior[seg.key];
          const changed = curr !== priorVal;
          return (
            <div key={seg.key} className="flex items-baseline gap-2 text-[9px]">
              <span
                className="shrink-0 font-medium"
                style={{
                  color: "var(--ink-tertiary)",
                  width: "130px",
                }}
              >
                {seg.label}
              </span>
              <span className="font-semibold" style={{ color: "var(--ink-primary)" }}>{curr}%</span>
              {changed && (
                <span style={{ color: "var(--ink-muted)" }}>
                  {priorVal > curr ? "↓" : "↑"} from {priorVal}%
                </span>
              )}
              {!changed && (
                <span style={{ color: "var(--ink-muted)", opacity: 0.6 }}>unchanged</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
