"use client";

import { useState, useEffect } from "react";
import { RegionLayout } from "./regions/RegionLayout";
import { TRLLadder } from "@/components/intelligence/research/TRLLadder";
import { EvidenceWeightBar } from "@/components/intelligence/research/EvidenceWeightBar";
import { TechnologyLandscape } from "@/components/intelligence/analytics/TechnologyLandscape";
import { SignalMomentum, ClusterMomentum } from "@/components/intelligence/analytics/MomentumTracking";
import { BreakoutDetector } from "@/components/intelligence/analytics/BreakoutDetector";
import { StepContext, WorkflowContinue } from "@/components/navigation/WorkflowPipeline";

interface SignalData {
  id: string;
  signal: string;
  trl: number;
  confidence: number;
  volatility: string;
  priority: string;
  priorityScore: number;
  priorityDrivers: string[];
  impactDomains: string[];
  technologyCluster: string;
  strategicNotes: string;
  evidenceBase: string;
  sourceCount: number;
  trendDirection: string;
  lastUpdated: string;
  scoreHistory: { year: string; score: number }[];
}

const PRIORITY_STYLES: Record<string, string> = {
  CRITICAL: "bg-red-600 text-white border-red-700",
  HIGH: "bg-amber-500/90 text-white border-amber-600",
  MEDIUM: "bg-sky-500/80 text-white border-sky-600",
  LOW: "bg-[var(--ink-muted)]/20 text-[var(--ink-secondary)] border-[var(--border-soft)]",
};

const TREND_ICONS: Record<string, string> = {
  rising: "↑",
  flat: "→",
  declining: "↓",
};

export function IntelligenceRegion() {
  const [signals, setSignals] = useState<SignalData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSignals() {
      try {
        const res = await fetch("/api/intelligence");
        const data = await res.json();
        data.sort((a: SignalData, b: SignalData) => b.priorityScore - a.priorityScore);
        setSignals(data);
      } catch (err) {
        console.error("Failed to fetch intelligence signals", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSignals();
  }, []);

  const activeSignals = signals.length;
  const criticalCount = signals.filter((s) => s.priority === "CRITICAL").length;
  const highCount = signals.filter((s) => s.priority === "HIGH").length;
  const clusters = new Set(signals.map((s) => s.technologyCluster)).size;

  return (
    <>
      <StepContext />
      <RegionLayout
        label="Intelligence Intake"
        title="Signals at the Edge"
        leadParagraph="Detect and understand emerging research signals. The loudest signals are rarely the most important. We monitor the friction points where initial theory collides with baseline reality."
      >
        <div className="max-w-[900px] mx-auto w-full space-y-16 pb-16">

          {/* Signal Summary Dashboard */}
          {!loading && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="p-4 rounded-xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.02)] text-center">
                <div className="text-[26px] font-mono font-bold text-[var(--text-primary)] leading-none">{activeSignals}</div>
                <div className="text-[9px] font-mono uppercase tracking-widest text-[var(--ink-muted)] mt-2">Active Signals</div>
              </div>
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-center">
                <div className="text-[26px] font-mono font-bold text-red-500 leading-none">{criticalCount}</div>
                <div className="text-[9px] font-mono uppercase tracking-widest text-red-500/70 mt-2">Critical</div>
              </div>
              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-center">
                <div className="text-[26px] font-mono font-bold text-amber-500 leading-none">{highCount}</div>
                <div className="text-[9px] font-mono uppercase tracking-widest text-amber-500/70 mt-2">High Priority</div>
              </div>
              <div className="p-4 rounded-xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.02)] text-center">
                <div className="text-[26px] font-mono font-bold text-[var(--text-primary)] leading-none">{clusters}</div>
                <div className="text-[9px] font-mono uppercase tracking-widest text-[var(--ink-muted)] mt-2">Domains</div>
              </div>
              <div className="p-4 rounded-xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.02)] text-center">
                <div className="text-[26px] font-mono font-bold text-[var(--text-primary)] leading-none">
                  {signals.reduce((sum, s) => sum + s.sourceCount, 0)}
                </div>
                <div className="text-[9px] font-mono uppercase tracking-widest text-[var(--ink-muted)] mt-2">Sources</div>
              </div>
            </div>
          )}

          {/* Emerging Breakout Detection — Early Warning Radar */}
          {!loading && signals.length > 0 && (
            <div className="pt-8 border-t border-[var(--border-soft)]">
              <BreakoutDetector />
            </div>
          )}

          {/* Technology Landscape Map */}
          {!loading && signals.length > 0 && (
            <div className="pt-8 border-t border-[var(--border-soft)]">
              <TechnologyLandscape signals={signals} />
            </div>
          )}

          {/* Cluster Momentum */}
          {!loading && signals.length > 0 && (
            <div className="pt-8 border-t border-[var(--border-soft)]">
              <ClusterMomentum signals={signals} />
            </div>
          )}

          {/* Signal Momentum Timeline */}
          {!loading && signals.length > 0 && (
            <div className="pt-8 border-t border-[var(--border-soft)]">
              <SignalMomentum signals={signals} />
            </div>
          )}

          {/* Signals Feed */}
          {loading ? (
            <div className="font-mono text-sm opacity-60 animate-pulse">Synchronizing intelligence feeds...</div>
          ) : (
            <div className="space-y-20 pt-8 border-t border-[var(--border-soft)]">
              <div className="text-center space-y-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
                  Detailed Signal Analysis
                </span>
                <h3 className="font-serif text-2xl text-[var(--text-primary)]">Signal Intelligence Feed</h3>
              </div>

              {signals.map((sig) => (
                <div key={sig.id} className="space-y-8 pb-16 border-b border-[var(--border-soft)] last:border-0">
                  
                  {/* Header block with priority badge */}
                  <div>
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1.5 rounded font-mono text-[10px] uppercase tracking-widest font-bold border ${PRIORITY_STYLES[sig.priority] || PRIORITY_STYLES.LOW}`}>
                          {sig.priority}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
                          {sig.id}
                        </span>
                        <span className={`font-mono text-[13px] font-bold ${
                          sig.trendDirection === 'rising' ? 'text-red-500' :
                          sig.trendDirection === 'declining' ? 'text-emerald-500' :
                          'text-[var(--ink-muted)]'
                        }`}>
                          {TREND_ICONS[sig.trendDirection] || "→"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-[var(--ink-muted)] px-2 py-1 rounded border border-[var(--border-soft)]">
                          {sig.technologyCluster}
                        </span>
                        <span className={`px-3 py-1 rounded-full font-mono text-[10px] uppercase tracking-widest ${
                          sig.volatility === 'destabilizing' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                          sig.volatility === 'accelerating' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                          'bg-[var(--text-primary)]/5 text-[var(--text-primary)] border border-[var(--border-soft)]'
                        }`}>
                          {sig.volatility}
                        </span>
                      </div>
                    </div>

                    <h2 className="font-serif text-3xl text-[var(--text-primary)] mb-3">{sig.signal}</h2>
                    
                    {/* Priority score bar */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink-muted)] shrink-0">Score</span>
                      <div className="flex-1 h-1.5 rounded-full bg-[var(--border-soft)] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            sig.priorityScore >= 0.9 ? 'bg-red-500' :
                            sig.priorityScore >= 0.7 ? 'bg-amber-500' :
                            sig.priorityScore >= 0.5 ? 'bg-sky-500' :
                            'bg-[var(--ink-muted)]'
                          }`}
                          style={{ width: `${sig.priorityScore * 100}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] font-bold text-[var(--ink-secondary)] tabular-nums shrink-0">
                        {(sig.priorityScore * 100).toFixed(0)}
                      </span>
                    </div>

                    <p className="text-lg leading-relaxed text-[var(--ink-secondary)]">
                      {sig.strategicNotes}
                    </p>

                    {/* Priority Drivers — WHY this score */}
                    {sig.priorityDrivers && sig.priorityDrivers.length > 0 && (
                      <div className="mt-6 p-5 rounded-xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.02)]">
                        <span className="block font-mono text-[9px] uppercase tracking-widest text-[var(--ink-muted)] mb-3">
                          Priority Drivers — Why This Score
                        </span>
                        <ul className="space-y-2">
                          {sig.priorityDrivers.map((driver, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-[var(--ink-secondary)]">
                              <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                                sig.priority === 'CRITICAL' ? 'bg-red-500' :
                                sig.priority === 'HIGH' ? 'bg-amber-500' :
                                sig.priority === 'MEDIUM' ? 'bg-sky-500' :
                                'bg-[var(--ink-muted)]'
                              }`} />
                              {driver}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Meta row */}
                    <div className="flex items-center gap-4 mt-4 flex-wrap">
                      <span className="font-mono text-[10px] text-[var(--ink-muted)]">
                        {sig.sourceCount} sources
                      </span>
                      <span className="font-mono text-[10px] text-[var(--ink-muted)]">
                        Updated {sig.lastUpdated}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Left Column: TRL and Evidence */}
                    <div className="space-y-10">
                       <div className="space-y-4">
                          <span className="block font-mono text-[10px] uppercase tracking-widest text-[var(--ink-secondary)]">
                            Maturity Assessment (TRL {sig.trl})
                          </span>
                          <TRLLadder
                            current={sig.trl}
                            prior={Math.max(1, sig.trl - 1)}
                            projected={Math.min(9, sig.trl + 1)}
                            projectedConditional={sig.volatility !== 'stable'}
                          />
                       </div>
                       <div className="space-y-4">
                          <span className="block font-mono text-[10px] uppercase tracking-widest text-[var(--ink-secondary)]">
                            Evidence Composition
                          </span>
                          <EvidenceWeightBar
                            current={{ field: sig.confidence * 60, simulation: 20, publication: 20 }}
                            prior={{ field: (sig.confidence - 0.1) * 60, simulation: 20, publication: 20 }}
                          />
                          <p className="font-mono text-[11px] text-[var(--ink-muted)] mt-4 leading-relaxed">
                            {sig.evidenceBase}
                          </p>
                       </div>
                    </div>

                    {/* Right Column: Volatility & Domains */}
                    <div className="space-y-6 bg-[rgba(255,255,255,0.02)] border border-[var(--border-soft)] rounded-2xl p-6">
                       <div className="space-y-3">
                          <span className="block font-mono text-[10px] uppercase tracking-widest text-[var(--ink-secondary)]">
                            Volatility & Edge Transition
                          </span>
                          <div className="text-[28px] font-serif italic text-[var(--text-primary)] capitalize">
                            {sig.volatility}
                          </div>
                       </div>
                       <div className="pt-4 border-t border-[rgba(255,255,255,0.06)]">
                          <span className="block font-mono text-[10px] uppercase tracking-widest text-[var(--ink-secondary)] mb-3">
                            Impact Domains
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {sig.impactDomains.map((domain, i) => (
                              <span key={i} className="text-[10px] font-mono border border-[var(--border-soft)] text-[var(--ink-secondary)] px-2.5 py-1 rounded">
                                {domain}
                              </span>
                            ))}
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <WorkflowContinue />
      </RegionLayout>
    </>
  );
}
