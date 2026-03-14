import { 
  WEIGHT_OBSERVED_IMPACT,
  HORIZON_WEIGHTS,
  WEIGHT_DRIFT_THRESHOLD
} from "@/lib/horizonEngine";

export function WeightDriftMonitor() {
  const factors = [
    { name: "Variance", weight: HORIZON_WEIGHTS.variance, observed: WEIGHT_OBSERVED_IMPACT.variance },
    { name: "Velocity", weight: HORIZON_WEIGHTS.velocity, observed: WEIGHT_OBSERVED_IMPACT.velocity },
    { name: "Dependency", weight: HORIZON_WEIGHTS.dependency, observed: WEIGHT_OBSERVED_IMPACT.dependency },
    { name: "Decay", weight: HORIZON_WEIGHTS.confidenceDecay, observed: WEIGHT_OBSERVED_IMPACT.confidenceDecay }
  ];

  const maxDrift = Math.max(...factors.map(f => Math.abs(f.observed - f.weight)));
  const requiresRecalibration = maxDrift > WEIGHT_DRIFT_THRESHOLD;

  return (
    <div className="border border-[var(--border-soft)] w-full font-mono text-sm tracking-tight flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 bg-[var(--background-alt)] border-b border-[var(--border-soft)] flex justify-between items-center">
        <span className="font-bold text-[var(--ink-primary)]">WEIGHT DRIFT MONITOR</span>
        <span className="text-[var(--ink-secondary)] text-xs">FACTOR CALIBRATION TRACKER</span>
      </div>

      {/* Table */}
      <div className="px-4 py-3">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-soft)] text-[var(--ink-secondary)] text-xs">
              <th className="py-2 font-normal w-1/4">Factor</th>
              <th className="py-2 font-normal text-right w-1/4">Weight</th>
              <th className="py-2 font-normal text-right w-1/4">Observed Impact</th>
              <th className="py-2 font-normal text-right w-1/4">Drift</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {factors.map((factor) => {
              const drift = factor.observed - factor.weight;
              const sign = drift > 0 ? "+" : "";

              return (
                <tr key={factor.name} className="border-b border-[var(--border-soft)] last:border-0">
                  <td className="py-1.5 text-[var(--ink-primary)]">{factor.name}</td>
                  <td className="py-1.5 text-[var(--ink-primary)] text-right">{factor.weight.toFixed(2)}</td>
                  <td className="py-1.5 text-[var(--ink-primary)] text-right">{factor.observed.toFixed(2)}</td>
                  <td className="py-1.5 text-[var(--ink-primary)] text-right font-bold">{sign}{drift.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Output Footnote */}
      <div className="px-4 py-3 bg-[var(--background-alt)] border-t border-[var(--border-soft)] flex flex-col gap-1 tabular-nums">
        <div className="flex justify-between items-center">
          <span className="text-[var(--ink-secondary)]">Max Factor Drift:</span>
          <span className="font-bold text-[var(--ink-primary)]">{maxDrift.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[var(--ink-secondary)]">Governance Action:</span>
          {requiresRecalibration ? (
            <span className="font-bold text-[var(--ink-primary)]">Recalibrate ({maxDrift.toFixed(2)} &gt; {WEIGHT_DRIFT_THRESHOLD.toFixed(2)})</span>
          ) : (
            <span className="font-bold text-[var(--ink-primary)]">Maintain Weights (&le;{WEIGHT_DRIFT_THRESHOLD.toFixed(2)})</span>
          )}
        </div>
      </div>
    </div>
  );
}
