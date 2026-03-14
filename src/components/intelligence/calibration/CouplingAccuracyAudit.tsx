import { 
  COUPLING_AUDIT_HISTORY,
  computeCurrentCouplingDrift,
  computeCouplingDriftTrend,
  COUPLING_DRIFT_THRESHOLD
} from "@/lib/horizonEngine";

export function CouplingAccuracyAudit() {
  const currentDrift = computeCurrentCouplingDrift(COUPLING_AUDIT_HISTORY);
  const trend = computeCouplingDriftTrend(COUPLING_AUDIT_HISTORY);
  const requiresReview = currentDrift > COUPLING_DRIFT_THRESHOLD;
  const trendSign = trend > 0 ? "+" : "";

  return (
    <div className="border border-[var(--border-soft)] w-full font-mono text-sm tracking-tight flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 bg-[var(--background-alt)] border-b border-[var(--border-soft)] flex justify-between items-center">
        <span className="font-bold text-[var(--ink-primary)]">TEMPORAL COUPLING ACCURACY</span>
        <span className="text-[var(--ink-secondary)] text-xs">CROSS-DOMAIN VALIDATION</span>
      </div>

      {/* Table */}
      <div className="px-4 py-3">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-soft)] text-[var(--ink-secondary)] text-xs">
              <th className="py-2 font-normal w-1/2">Cycle</th>
              <th className="py-2 font-normal text-right w-1/2">Coupling Drift Index</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {COUPLING_AUDIT_HISTORY.map((audit) => {
              return (
                <tr key={audit.cycle} className="border-b border-[var(--border-soft)] last:border-0">
                  <td className="py-1.5 text-[var(--ink-primary)]">{audit.cycle}</td>
                  <td className="py-1.5 text-[var(--ink-primary)] text-right">{audit.driftIndex.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Output Footnote */}
      <div className="px-4 py-3 bg-[var(--background-alt)] border-t border-[var(--border-soft)] flex flex-col gap-1">
        <div className="flex justify-between items-center tabular-nums">
          <span className="text-[var(--ink-secondary)]">Drift Trend:</span>
          <span className="font-bold text-[var(--ink-primary)]">{trendSign}{trend.toFixed(2)} over {Math.max(1, COUPLING_AUDIT_HISTORY.length - 1)} cycles</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[var(--ink-secondary)]">Governance Action:</span>
          {requiresReview ? (
            <span className="font-bold text-[var(--ink-primary)]">Review Required ({currentDrift.toFixed(2)} &gt; {COUPLING_DRIFT_THRESHOLD.toFixed(2)})</span>
          ) : (
            <span className="font-bold text-[var(--ink-primary)]">Maintain Matrix (&le;{COUPLING_DRIFT_THRESHOLD.toFixed(2)})</span>
          )}
        </div>
      </div>
    </div>
  );
}
