import { 
  HORIZON_HISTORY, 
  computeMeanAbsoluteError, 
  isCalibrationDrifting,
  GOVERNANCE_ERROR_TOLERANCE,
  BASE_HORIZON_MONTHS 
} from "@/lib/horizonEngine";

export function PredictionOutcomeLedger() {
  const mae = computeMeanAbsoluteError(HORIZON_HISTORY);
  const isDrifting = isCalibrationDrifting(mae);

  return (
    <div className="border border-[var(--border-soft)] w-full font-mono text-sm tracking-tight flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 bg-[var(--background-alt)] border-b border-[var(--border-soft)] flex justify-between items-center">
        <span className="font-bold text-[var(--ink-primary)]">PREDICTION VS OUTCOME</span>
        <span className="text-[var(--ink-secondary)] text-xs">MODEL ACCURACY MEMORY</span>
      </div>

      {/* Table */}
      <div className="px-4 py-3">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-soft)] text-[var(--ink-secondary)] text-xs">
              <th className="py-2 font-normal w-1/4">Cycle</th>
              <th className="py-2 font-normal text-right w-1/4">Projected</th>
              <th className="py-2 font-normal text-right w-1/4">Actual</th>
              <th className="py-2 font-normal text-right w-1/4">Δ (Months)</th>
              <th className="py-2 font-normal text-right w-1/4">Error %</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {HORIZON_HISTORY.map((record) => {
              const delta = record.actualOutcome - record.projectedHorizon;
              const errorPercentage = (delta / BASE_HORIZON_MONTHS) * 100;
              const sign = delta > 0 ? "+" : "";

              return (
                <tr key={record.cycle} className="border-b border-[var(--border-soft)] last:border-0">
                  <td className="py-1.5 text-[var(--ink-primary)]">{record.cycle}</td>
                  <td className="py-1.5 text-[var(--ink-primary)] text-right">{record.projectedHorizon.toFixed(1)}</td>
                  <td className="py-1.5 text-[var(--ink-primary)] text-right">{record.actualOutcome.toFixed(1)}</td>
                  <td className="py-1.5 text-[var(--ink-primary)] text-right">{sign}{delta.toFixed(1)}</td>
                  <td className="py-1.5 text-[var(--ink-primary)] text-right">{sign}{errorPercentage.toFixed(1)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Audit Footnote */}
      <div className="px-4 py-3 bg-[var(--background-alt)] border-t border-[var(--border-soft)] flex flex-col gap-1">
        <div className="flex justify-between items-center tabular-nums">
          <span className="text-[var(--ink-secondary)]">Mean Absolute Error (MAE):</span>
          <span className="font-bold text-[var(--ink-primary)]">{(mae * 100).toFixed(1)}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[var(--ink-secondary)]">Calibration Status:</span>
          {isDrifting ? (
            <span className="font-bold text-[var(--ink-primary)]">Outside Governance Band ({(mae * 100).toFixed(1)}% &gt; {(GOVERNANCE_ERROR_TOLERANCE * 100).toFixed(0)}%)</span>
          ) : (
            <span className="font-bold text-[var(--ink-primary)]">Within Governance Band (≤{(GOVERNANCE_ERROR_TOLERANCE * 100).toFixed(0)}%)</span>
          )}
        </div>
        {isDrifting && (
          <div className="mt-2 text-xs font-mono text-[var(--ink-primary)] uppercase">
            Mandated Action: Controlled Recalibration — Q2 Issuance
          </div>
        )}
      </div>
    </div>
  );
}
