"use client";

import React from "react";
import { AllocationPressureIndex } from "../intelligence/command/AllocationPressureIndex";
import { HorizonCompressionIndicator } from "../intelligence/command/HorizonCompressionIndicator";
import { SecondOrderImpactPanel } from "../intelligence/command/SecondOrderImpactPanel";
import { DecisionTraceLedger } from "../intelligence/command/DecisionTraceLedger";
import { TemporalCouplingMatrix } from "../intelligence/command/TemporalCouplingMatrix";
import { ScenarioLabPanel } from "../intelligence/command/ScenarioLabPanel";
import { generateInstitutionalRecord, verifyExportRecord, ExportArtifact } from "@/lib/exportEngine";
import { useReviewRoom } from "../simulation/ReviewRoomContext";
import { useEngine, useGovernance } from "@/context/InstitutionalStateProvider";
import { useAuth } from "@/context/AuthProvider";
import { hasPermission } from "@/lib/auth";
import { ENGINE_VERSION } from "@/lib/horizonEngine";

export function CommandRegion() {
  // ── Consume centralized state (no local computation) ──
  const { baseFactors, appliedFactors, horizonShift, newHorizon, escalationResult } = useEngine();
  const { session, timeRemainingMs, isSessionActive, isExpired, isResolvedTimely, initiateReview } = useReviewRoom();
  const { escalationHistory } = useGovernance();
  const { role } = useAuth();
  const canAccessCommand = hasPermission(role, "Allocator");
  const canExport = hasPermission(role, "Admin");

  // ── Local UI state (export/verify actions only) ──
  const [isExporting, setIsExporting] = React.useState(false);
  const [verificationResult, setVerificationResult] = React.useState<"IDLE" | "VALID" | "INVALID">("IDLE");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await generateInstitutionalRecord(baseFactors, appliedFactors, horizonShift, newHorizon, session, isExpired, isResolvedTimely, timeRemainingMs, escalationHistory);
    } finally {
      setIsExporting(false);
    }
  };

  const handleVerify = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const artifact = JSON.parse(text) as ExportArtifact;
      const isValid = await verifyExportRecord(artifact);
      setVerificationResult(isValid ? "VALID" : "INVALID");
      setTimeout(() => setVerificationResult("IDLE"), 5000);
    } catch {
      setVerificationResult("INVALID");
      setTimeout(() => setVerificationResult("IDLE"), 5000);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!canAccessCommand) {
    return (
      <div className="w-full border-b border-[var(--border-strong)] pb-6 mb-12 bg-[var(--background)]">
        <div className="max-w-[760px] mx-auto w-full px-6 md:px-0 pt-10">
          <div className="border-b-2 border-[var(--border-soft)] pb-4">
            <h1 className="text-[13px] font-mono uppercase tracking-[0.1em] text-[var(--ink-secondary)]">
              Portfolio Command Surface
            </h1>
            <div className="text-[10px] font-mono text-[var(--ink-tertiary)] mt-2 uppercase tracking-widest">
              ACCESS RESTRICTED — ALLOCATOR CLEARANCE OR ABOVE REQUIRED
            </div>
            <div className="text-[9px] font-mono text-[var(--ink-muted)] mt-1">
              Current identity: {role}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full border-b border-[var(--border-strong)] pb-12 mb-12 bg-[var(--background)]">
      <div className="max-w-[760px] mx-auto w-full px-6 md:px-0 space-y-10 pt-10">
        
        {/* Header */}
        <div className="border-b-2 border-[var(--ink-primary)] pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-[16px] font-mono uppercase tracking-[0.1em] text-[var(--ink-primary)] font-bold">
              Portfolio Command Surface
            </h1>
            <div className="text-[9px] font-mono text-[var(--ink-tertiary)] mt-1 uppercase tracking-widest flex items-center gap-4">
              <span>Strategic Decision Superiority Layer</span>
              {!isSessionActive && canExport && (
                <button 
                  onClick={() => initiateReview("Q1-2026-ESCALATION", 15)}
                  className="px-2 py-0.5 border border-red-900/30 text-red-700 bg-red-50/50 hover:bg-red-100/50 transition-colors font-bold flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  INITIATE STRATEGIC REVIEW [LIVE]
                </button>
              )}
            </div>
          </div>
          <div className="text-[9px] font-mono text-[var(--ink-muted)] text-right uppercase tracking-[0.1em] flex flex-col items-end gap-2">
            <div>
              <div>System Live</div>
              <div>MAR 2026 14:32 UTC</div>
              <div className="text-[var(--ink-tertiary)] opacity-80 mt-1">[{ENGINE_VERSION}]</div>
            </div>
            
            {canExport && (
              <div className="flex flex-col items-end gap-1 mt-1">
                <button 
                  onClick={handleExport}
                  disabled={isExporting}
                  className={`px-2 py-0.5 border ${isExporting ? 'border-[var(--ink-muted)] text-[var(--ink-muted)]' : 'border-[var(--border-strong)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:border-[var(--ink-primary)]'} transition-colors inline-block`}
                >
                  {isExporting ? "[SEALING...]" : "[EXPORT RECORD]"}
                </button>
                
                <div className="flex items-center gap-2">
                  {verificationResult === "VALID" && <span className="text-emerald-500 font-bold">VERIFIED AUTHENTIC</span>}
                  {verificationResult === "INVALID" && <span className="text-red-500 font-bold">TAMPERED / INVALID</span>}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2 py-0.5 border border-transparent text-[var(--ink-tertiary)] hover:text-[var(--ink-secondary)] transition-colors inline-block underline decoration-[var(--border-soft)] underline-offset-2"
                  >
                    [VERIFY ARTIFACT]
                  </button>
                  <input 
                    type="file" 
                    accept=".json" 
                    title="Verify Export Artifact"
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleVerify}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Row: API & Impact */}
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-10">
          <div>
            <AllocationPressureIndex />
            <HorizonCompressionIndicator 
              factors={appliedFactors}
              shift={horizonShift}
              newHorizon={newHorizon}
              isTriggered={escalationResult}
            />
          </div>
          <div>
            <SecondOrderImpactPanel />
          </div>
        </div>

        {/* Bottom Row: Trace & Divergence */}
        <div className="grid grid-cols-1 gap-10 items-start pt-8 border-t border-[var(--border-soft)]">
          <div className="space-y-6">
            <DecisionTraceLedger escalationState={escalationResult} />
            <TemporalCouplingMatrix primaryDomain="Research" primaryShift={horizonShift} />
          </div>
          <ScenarioLabPanel />
        </div>

      </div>
    </div>
  );
}
