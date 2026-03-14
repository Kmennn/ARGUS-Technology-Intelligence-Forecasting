"use client";

import React, { useState, useEffect } from "react";
import { useEngine } from "@/context/InstitutionalStateProvider";
import { ScenarioInput, ScenarioResult, simulateScenario, compareScenarios, runMonteCarloSimulation, MonteCarloSummary } from "@/lib/scenarioEngine";
import { argusEvents } from "@/lib/eventBus";

const SCENARIO_PRESETS: ScenarioInput[] = [
  {
    id: "scen-baseline",
    name: "Baseline Current Trajectory",
    description: "No intervention. Default mathematical drift.",
    factorOverrides: {},
    pressureDelta: 0
  },
  {
    id: "scen-A",
    name: "Scenario A: Reallocate Funding (+20%)",
    description: "Increases capital velocity, drops pressure.",
    factorOverrides: { varianceMagnitude: 0.10, velocityDelta: 0.85 },
    pressureDelta: -0.15
  },
  {
    id: "scen-B",
    name: "Scenario B: Threat Escalation Spike",
    description: "Sudden dependency exposure, high variance.",
    factorOverrides: { varianceMagnitude: 0.80, dependencyExposure: 0.90, confidenceDrop: 0.40 },
    pressureDelta: 0.25
  },
  {
    id: "scen-C",
    name: "Scenario C: De-risk Dependencies",
    description: "Sever cross-domain links. Slows velocity.",
    factorOverrides: { dependencyExposure: 0.10, velocityDelta: 0.20 },
    pressureDelta: 0.05
  }
];

export function ScenarioLabPanel() {
  const { appliedFactors, newHorizon } = useEngine();
  const [results, setResults] = useState<ScenarioResult[]>([]);
  const [mcSummary, setMcSummary] = useState<MonteCarloSummary | null>(null);
  
  const basePressure = 0.73;
  const previousPressure = [0.70, 0.72];

  useEffect(() => {
    argusEvents.emit("SCENARIO_CREATED", { message: "Scenario Lab Initialized" });
  }, []);

  const runSimulations = () => {
    const newResults = SCENARIO_PRESETS.map(preset => 
      simulateScenario(preset, appliedFactors, basePressure, previousPressure)
    );
    setResults(newResults);
    compareScenarios(newResults);
  };

  const runMonteCarlo = () => {
    const seed = 42;
    const summary = runMonteCarloSimulation(appliedFactors, {}, 200, seed);
    setMcSummary(summary);
  };

  const alternativeResults = results.filter(r => r.scenarioId !== "scen-baseline");

  return (
    <div className="space-y-6">

      {/* ── Deterministic Scenario Matrix ── */}
      <div className="space-y-4">
        <div className="border-b border-[var(--ink-primary)] pb-2 flex justify-between items-end">
          <div>
            <h2 className="text-[12px] font-mono uppercase tracking-[0.05em] text-[var(--ink-primary)] font-semibold flex items-center gap-2">
              Scenario Lab 
              {results.length > 0 && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>}
            </h2>
            <div className="text-[10px] font-mono text-[var(--ink-secondary)] mt-1 tracking-widest">
              PARALLEL FUTURES ENGINE
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={runMonteCarlo}
              className="px-3 py-1 bg-[var(--ink-ghost)] border border-[var(--border-strong)] text-[10px] uppercase font-mono tracking-wider hover:bg-[var(--border-strong)] transition-colors text-[var(--ink-secondary)] font-semibold"
            >
              Monte Carlo (200)
            </button>
            <button 
              onClick={runSimulations}
              className="px-3 py-1 bg-[var(--ink-ghost)] border border-[var(--border-strong)] text-[10px] uppercase font-mono tracking-wider hover:bg-[var(--border-strong)] transition-colors text-[var(--ink-primary)] font-semibold"
            >
              {results.length > 0 ? "Re-Run" : "Initialize Matrix"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 border border-[var(--border-strong)] divide-y divide-[var(--border-strong)]">
          
          {/* State Row */}
          <div className="p-3 bg-[var(--ink-ghost)] grid grid-cols-[2.5fr_1fr_1fr] items-center gap-4">
            <div>
              <div className="text-[9px] font-mono uppercase tracking-wider text-[var(--ink-tertiary)] mb-1">
                Current Base State
              </div>
            </div>
            <div className="text-right">
              <div className="text-[9px] font-mono uppercase tracking-wider text-[var(--ink-tertiary)] mb-1">
                Horizon
              </div>
              <div className="text-[12px] font-mono font-bold text-[var(--ink-primary)] uppercase">
                {newHorizon.toFixed(1)} mo
              </div>
            </div>
            <div className="text-right">
              <div className="text-[9px] font-mono uppercase tracking-wider text-[var(--ink-tertiary)] mb-1">
                API
              </div>
              <div className="text-[12px] font-mono font-bold text-[var(--ink-primary)] uppercase">
                {basePressure.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Results */}
          {results.length > 0 ? (
            alternativeResults.map(res => {
              const isFavorable = res.deltaHorizon > 0;
              return (
                <div key={res.scenarioId} className="p-4 grid grid-cols-[2.5fr_1fr_1fr] items-center gap-4 hover:bg-[var(--ink-ghost)] transition-colors cursor-default group">
                  <div>
                    <div className="text-[11px] font-mono font-bold text-[var(--ink-secondary)] group-hover:text-[var(--ink-primary)] uppercase transition-colors">
                      {res.name}
                    </div>
                    <div className="text-[9px] font-mono text-[var(--ink-tertiary)] mt-1 truncate">
                      {res.description}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-[13px] font-mono font-bold uppercase transition-colors ${isFavorable ? 'text-[var(--status-success)]' : 'text-[var(--status-error)]'}`}>
                      {res.horizon.toFixed(1)} mo
                    </div>
                    <div className="text-[9px] font-mono text-[var(--ink-tertiary)] uppercase mt-0.5">
                      {isFavorable ? '+' : ''}{res.deltaHorizon.toFixed(1)} mo
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="text-[11px] font-mono font-bold text-[var(--ink-secondary)] uppercase">
                      {res.pressure.toFixed(2)}
                    </div>
                    {res.escalation.isEscalated && (
                      <div className="text-[8px] mt-1 font-mono text-[#ff4500] uppercase border border-[#ff4500]/30 px-1">
                        {res.escalation.type} Triggered
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-8 py-12 text-center text-[10px] font-mono text-[var(--ink-tertiary)] uppercase tracking-wider opacity-60">
              Awaiting simulation trigger...
              <div className="mt-2 text-[9px] opacity-70">Computes n-dimensional parallel futures based on base factors</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Monte Carlo Probabilistic Distribution ── */}
      {mcSummary && (
        <div className="border border-[var(--border-strong)]">
          <div className="p-3 bg-[var(--ink-ghost)] border-b border-[var(--border-strong)] flex justify-between items-center">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--ink-primary)] font-semibold">
                Probabilistic Forecast
              </div>
              <div className="text-[9px] font-mono text-[var(--ink-tertiary)] uppercase tracking-wider mt-0.5">
                {mcSummary.runs} simulations · seed={mcSummary.seed}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[18px] font-mono font-bold text-[var(--ink-primary)] leading-none tabular-nums">
                {mcSummary.mean.toFixed(1)}
              </div>
              <div className="text-[9px] font-mono text-[var(--ink-tertiary)] uppercase tracking-wider mt-1">
                Expected Horizon (mo)
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 divide-x divide-[var(--border-strong)]">
            <div className="p-3 text-center">
              <div className="text-[9px] font-mono text-[var(--ink-tertiary)] uppercase tracking-wider mb-1">Worst (P10)</div>
              <div className="text-[13px] font-mono font-bold text-[var(--ink-secondary)] tabular-nums">{mcSummary.p10.toFixed(1)}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-[9px] font-mono text-[var(--ink-tertiary)] uppercase tracking-wider mb-1">Median</div>
              <div className="text-[13px] font-mono font-bold text-[var(--ink-primary)] tabular-nums">{mcSummary.median.toFixed(1)}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-[9px] font-mono text-[var(--ink-tertiary)] uppercase tracking-wider mb-1">Best (P90)</div>
              <div className="text-[13px] font-mono font-bold text-[var(--ink-secondary)] tabular-nums">{mcSummary.p90.toFixed(1)}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-[9px] font-mono text-[var(--ink-tertiary)] uppercase tracking-wider mb-1">Std Dev</div>
              <div className="text-[13px] font-mono font-bold text-[var(--ink-secondary)] tabular-nums">±{mcSummary.stdDev.toFixed(2)}</div>
            </div>
          </div>

          <div className="p-3 border-t border-[var(--border-strong)] flex justify-between items-center">
            <div className="text-[9px] font-mono text-[var(--ink-tertiary)] uppercase tracking-wider">
              Range: {mcSummary.min.toFixed(1)} – {mcSummary.max.toFixed(1)} months
            </div>
            <div className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 border ${mcSummary.collapseRisk > 0.3 ? 'text-[#ff4500] border-[#ff4500]/30' : 'text-[var(--ink-secondary)] border-[var(--border-strong)]'}`}>
              P(Collapse &lt; 6mo): {(mcSummary.collapseRisk * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
