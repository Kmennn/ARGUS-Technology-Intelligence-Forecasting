"use client";

import React from "react";

// Fixed, governance-defined coupling coefficients
export const COUPLING_COEFFICIENTS: Record<string, Record<string, number>> = {
  Research: { Analysis: 0.35, Capabilities: 0.20, Signals: 0.15 },
  Analysis: { Capabilities: 0.25 },
  Signals: { Research: 0.10 },
};

// Types for matrix properties
interface CoupledDomain {
  name: string;
  compression: number;
}

interface TemporalCouplingMatrixProps {
  primaryDomain: string;
  primaryShift: number; // ΔH (Positive magnitude of shift, or negative representation. We'll expect negative for display)
}

export function TemporalCouplingMatrix({ primaryDomain, primaryShift }: TemporalCouplingMatrixProps) {
  // Extract applicable coefficients for the primary domain
  const coefficients = COUPLING_COEFFICIENTS[primaryDomain] || {};
  
  // Calculate downstream impact
  // Coupled ΔH = Primary ΔH × Coupling Coefficient
  // We compute absolute magnitudes for subtraction
  const shiftMagnitude = Math.abs(primaryShift);
  
  const downstreamImpacts: CoupledDomain[] = Object.entries(coefficients).map(([domain, coef]) => ({
    name: domain,
    compression: shiftMagnitude * coef
  }));

  // Calculate portfolio cumulative time loss
  // This is Primary Shift + Sum(Downstream Shifts)
  const totalDownstreamCompression = downstreamImpacts.reduce((sum, d) => sum + d.compression, 0);
  const portfolioTimeLoss = shiftMagnitude + totalDownstreamCompression;

  return (
    <div className="border-t-2 border-[var(--ink-primary)] pt-4 mt-8">
      <h2 className="text-[10px] font-mono uppercase tracking-[0.1em] font-bold text-[var(--ink-primary)] mb-4">
        Temporal Coupling Matrix
      </h2>
      
      <div className="space-y-6">
        {/* Primary Domain Identification */}
        <div className="grid grid-cols-[140px_1fr] items-baseline">
          <span className="text-[10px] font-mono text-[var(--ink-secondary)] uppercase tracking-wider">
            Primary Domain
          </span>
          <span className="text-[12px] font-mono text-[var(--ink-primary)] font-bold">
            {primaryDomain}
          </span>
          
          <span className="text-[10px] font-mono text-[var(--ink-secondary)] uppercase tracking-wider mt-1">
            ΔH (Primary)
          </span>
          <span className="text-[12px] font-mono text-[var(--ink-primary)] font-bold">
            -{shiftMagnitude.toFixed(1)} months
          </span>
        </div>

        {/* Downstream Impact List */}
        {downstreamImpacts.length > 0 && (
          <div className="pt-2 border-t border-[var(--border-soft)]">
            <div className="text-[9px] font-mono text-[var(--ink-tertiary)] uppercase tracking-widest mb-2">
              Downstream Impact
            </div>
            <table className="w-full text-left font-mono text-[10px]">
              <tbody>
                {downstreamImpacts.map((domain) => (
                  <tr key={domain.name} className="border-b border-[var(--border-soft)] last:border-0">
                    <td className="py-1.5 text-[var(--ink-primary)]">{domain.name}</td>
                    <td className="py-1.5 text-[var(--ink-primary)] font-bold text-right tabular-nums">
                      -{domain.compression.toFixed(1)} months
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Portfolio Cumulative Loss */}
        <div className="pt-3 border-t-2 border-[var(--ink-primary)] flex justify-between items-baseline">
          <span className="text-[10px] font-mono text-[var(--ink-primary)] uppercase tracking-wider font-bold">
            Portfolio Time Loss
          </span>
          <span className="text-[12px] font-mono text-[var(--ink-primary)] font-bold">
            -{portfolioTimeLoss.toFixed(1)} cumulative months
          </span>
        </div>
      </div>
    </div>
  );
}
