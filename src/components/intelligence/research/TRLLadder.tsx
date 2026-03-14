"use client";

interface TRLLadderProps {
  current: number;
  prior?: number;
  projected?: number;
  projectedConditional?: boolean;
}

export function TRLLadder({
  current,
  prior,
  projected,
  projectedConditional = true,
}: TRLLadderProps) {
  const levels = [9, 8, 7, 6, 5, 4, 3, 2, 1];

  return (
    <div className="font-mono">
      <span
        className="block text-[10px] uppercase tracking-widest mb-4 font-semibold"
        style={{ color: "var(--ink-secondary)" }}
      >
        TRL Assessment
      </span>

      <div className="space-y-[6px]">
        {levels.map((level) => {
          const isCurrent = level === current;
          const isProjected = projected !== undefined && level === projected && level !== current;
          const isPriorOnly = prior !== undefined && level === prior && prior !== current;

          return (
            <div key={level} className="flex items-center gap-[10px]">
              <span
                className="text-[9px] text-right font-medium"
                style={{
                  color: isCurrent ? "var(--ink-primary)" : "var(--ink-tertiary)",
                  opacity: isCurrent ? 1 : isProjected ? 0.7 : 0.4,
                  width: "12px",
                }}
              >
                {level}
              </span>

              <div className="relative" style={{ width: "110px", height: "7px" }}>
                {/* Track — Structural base */}
                <div
                  className="absolute inset-x-0 top-1/2 h-[1px]"
                  style={{ background: "#D8CEC5" }}
                />

                {/* Current level — full highlight */}
                {isCurrent && (
                  <div
                    className="absolute inset-0 rounded-[1px]"
                    style={{
                      background: "var(--ink-primary)",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
                    }}
                  />
                )}

                {/* Projected level — conditional outline */}
                {isProjected && (
                  <div
                    className="absolute inset-0 rounded-[1px]"
                    style={{
                      border: `1px ${projectedConditional ? "dashed" : "solid"} var(--ink-tertiary)`,
                      background: "rgba(255,255,255,0.4)"
                    }}
                  />
                )}

                {/* Prior marker — accent ghost mark */}
                {isPriorOnly && (
                  <div
                    className="absolute inset-x-0 top-1/2 h-[2px]"
                    style={{
                      background: "var(--accent-ghost)",
                      opacity: 0.8
                    }}
                  />
                )}

                {/* Historical fill (below current) */}
                {level < current && (
                  <div
                    className="absolute inset-x-0 top-[2px] bottom-[2px] opacity-10"
                    style={{ background: "var(--ink-tertiary)" }}
                  />
                )}
              </div>

              {/* Labels */}
              <div style={{ minWidth: "80px" }}>
                {isCurrent && (
                  <span
                    className="text-[8px] uppercase tracking-[0.08em] font-bold"
                    style={{ color: "var(--ink-primary)" }}
                  >
                    ▶ Current
                  </span>
                )}
                {isProjected && (
                  <span
                    className="text-[8px] uppercase tracking-[0.08em] font-medium"
                    style={{ color: "var(--ink-tertiary)" }}
                  >
                    {projectedConditional ? "╌ Conditional" : "╌ Projected"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-10 space-y-6">
        {/* A. Evidence Inputs */}
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-secondary)] font-semibold mb-3">
            TRL {current} — Derived From
          </div>
          <div className="font-mono text-[11px] text-[var(--ink-primary)] space-y-[4px]">
            <div className="flex justify-between items-baseline">
              <span>Patents</span>
              <span className="flex-1 mx-3 border-b border-dotted border-[var(--ink-muted)] opacity-30"></span>
              <span>27</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span>Publications</span>
              <span className="flex-1 mx-3 border-b border-dotted border-[var(--ink-muted)] opacity-30"></span>
              <span>12</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span>Procurement Mentions</span>
              <span className="flex-1 mx-3 border-b border-dotted border-[var(--ink-muted)] opacity-30"></span>
              <span>2</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span>Field Validation Records</span>
              <span className="flex-1 mx-3 border-b border-dotted border-[var(--ink-muted)] opacity-30"></span>
              <span>0</span>
            </div>
          </div>
        </div>

        {/* B. Model Weighting */}
        <div>
          <div className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink-tertiary)] font-semibold mb-2">
            Evidence Weighting
          </div>
          <div className="font-mono text-[10px] text-[var(--ink-muted)] space-y-[4px]">
            <div className="flex justify-between items-baseline">
              <span>Field Validation</span>
              <span className="flex-1 mx-3 border-b border-dotted border-[var(--ink-muted)] opacity-20"></span>
              <span>0.55</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span>Simulation Performance</span>
              <span className="flex-1 mx-3 border-b border-dotted border-[var(--ink-muted)] opacity-20"></span>
              <span>0.20</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span>Publication Velocity</span>
              <span className="flex-1 mx-3 border-b border-dotted border-[var(--ink-muted)] opacity-20"></span>
              <span>0.25</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
