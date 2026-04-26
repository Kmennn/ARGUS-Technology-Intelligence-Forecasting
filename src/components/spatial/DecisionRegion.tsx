"use client";

import React from "react";
import { RegionLayout } from "./regions/RegionLayout";
import { AllocationPressureIndex } from "@/components/intelligence/command/AllocationPressureIndex";
import { HorizonCompressionIndicator } from "@/components/intelligence/command/HorizonCompressionIndicator";
import { SecondOrderImpactPanel } from "@/components/intelligence/command/SecondOrderImpactPanel";
import { DecisionTraceLedger } from "@/components/intelligence/command/DecisionTraceLedger";
import { generateInstitutionalRecord, verifyExportRecord, ExportArtifact } from "@/lib/exportEngine";
import { useReviewRoom } from "@/components/simulation/ReviewRoomContext";
import { useEngine, useGovernance } from "@/context/InstitutionalStateProvider";
import { useSession } from "next-auth/react";
import { hasPermission, Role } from "@/lib/auth";
import { ENGINE_VERSION } from "@/lib/horizonEngine";
import { StepContext, WorkflowContinue } from "@/components/navigation/WorkflowPipeline";

export function DecisionRegion() {
  const { baseFactors, appliedFactors, horizonShift, newHorizon, escalationResult } = useEngine();
  const { session, timeRemainingMs, isSessionActive, isExpired, isResolvedTimely, initiateReview } = useReviewRoom();
  const { escalationHistory } = useGovernance();
  const { data: sessionData } = useSession();
  const role = ((sessionData?.user as { role?: Role })?.role) || "Analyst";
  
  const canAccessDecision = hasPermission(role, "Allocator");
  const canExport = hasPermission(role, "Admin");

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

  if (!canAccessDecision) {
    return (
      <RegionLayout
        label="Decision Room"
        title="Access Restricted"
        leadParagraph="Clearance level insufficient. ALLOCATOR or ADMIN clearance required to view strategic allocation indexes and institutional decision ledgers."
      >
        <div className="max-w-[900px] mx-auto w-full pb-32">
          <div className="font-mono text-xs uppercase tracking-widest text-[var(--status-error)] border border-[var(--status-error)]/30 bg-[var(--status-error)]/5 p-6 rounded text-center">
            Current Identity: {role}
          </div>
        </div>
      </RegionLayout>
    );
  }

  return (
    <>
    <StepContext />
    <RegionLayout
      label="Decision Room"
      title="Institutional Final Resolution"
      leadParagraph="Where assessment meets capability. This layer provides the final audit trail, allocation pressure indicators, and verifiable export mechanics for institutional actions."
    >
      <div className="max-w-[900px] mx-auto w-full space-y-16 pb-32">
        
        {/* Header & Export Status */}
        <div className="border border-[var(--ink-primary)] p-6 bg-[rgba(255,255,255,0.01)] rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-sm font-mono uppercase tracking-[0.1em] text-[var(--ink-primary)] font-bold">
              Strategic Decision Superiority Layer
            </h1>
            <div className="text-[10px] font-mono text-[var(--ink-tertiary)] mt-2 uppercase tracking-widest flex flex-wrap items-center gap-4">
              <span>System Live • MAR 2026 14:32 UTC</span>
              <span className="opacity-80">[{ENGINE_VERSION}]</span>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3 text-[10px] font-mono">
            {canExport ? (
              <>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleExport}
                    disabled={isExporting}
                    className={`px-3 py-1.5 border ${isExporting ? 'border-[var(--ink-muted)] text-[var(--ink-muted)]' : 'border-[var(--border-strong)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:border-[var(--ink-primary)]'} transition-colors inline-block`}
                  >
                    {isExporting ? "[SEALING RECORD...]" : "[EXPORT CRYPTOGRAPHIC RECORD]"}
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 border border-transparent text-[var(--ink-tertiary)] hover:text-[var(--ink-secondary)] transition-colors inline-block underline decoration-[var(--border-soft)] underline-offset-2"
                  >
                    [VERIFY ARTIFACT]
                  </button>
                </div>
                
                <input 
                  type="file" 
                  accept=".json" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleVerify}
                  aria-label="Verify export artifact"
                />
                
                <div className="h-4">
                  {verificationResult === "VALID" && <span className="text-[var(--status-success)] font-bold">VERIFIED AUTHENTIC</span>}
                  {verificationResult === "INVALID" && <span className="text-[var(--status-error)] font-bold">TAMPERED / INVALID</span>}
                </div>
              </>
            ) : (
              <span className="text-[var(--ink-muted)] uppercase tracking-widest">
                Export requires Admin clearance
              </span>
            )}
            
            {!isSessionActive && canExport && (
              <button 
                onClick={() => initiateReview("Q1-2026-ESCALATION", 15)}
                className="mt-2 px-3 py-1.5 border border-red-900/30 text-red-700 bg-red-50/50 hover:bg-red-100/50 transition-colors font-bold flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                INITIATE STRATEGIC REVIEW [LIVE]
              </button>
            )}
          </div>
        </div>

        {/* Indicators Row */}
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

        {/* Audit Ledger */}
        <div className="pt-8 border-t border-[var(--border-soft)]">
          <div className="mb-6">
            <span
              className="font-mono text-xs uppercase tracking-[0.05em] font-semibold text-[var(--ink-tertiary)]"
            >
              {"// Institutional Audit Ledger"}
            </span>
          </div>
          <DecisionTraceLedger escalationState={escalationResult} />
        </div>

      </div>

      <WorkflowContinue />
    </RegionLayout>
    </>
  );
}
