"use client";

import { PredictionOutcomeLedger } from "@/components/intelligence/calibration/PredictionOutcomeLedger";
import { EscalationEffectivenessBlock } from "@/components/intelligence/calibration/EscalationEffectivenessBlock";
import { CouplingAccuracyAudit } from "@/components/intelligence/calibration/CouplingAccuracyAudit";
import { WeightDriftMonitor } from "@/components/intelligence/calibration/WeightDriftMonitor";
import { useSession } from "next-auth/react";
import { Role, hasPermission } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CalibrationPage() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: Role } | undefined)?.role;
  const router = useRouter();

  useEffect(() => {
    if (session && (!role || !hasPermission(role, "Admin"))) {
      router.replace("/research");
    }
  }, [role, router, session]);

  if (!session || !role || !hasPermission(role, "Admin")) {
    return (
      <div className="max-w-[760px] mx-auto w-full px-6 md:px-0 py-10">
        <div className="text-[11px] font-mono uppercase tracking-widest text-[var(--ink-tertiary)]">
          ACCESS DENIED — ADMIN CLEARANCE REQUIRED. REDIRECTING...
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-[760px] mx-auto w-full px-6 md:px-0 space-y-10 py-10">
      <div className="border-b-2 border-[var(--ink-primary)] pb-4">
        <h1 className="text-[16px] font-mono uppercase tracking-[0.1em] text-[var(--ink-primary)] font-bold">
          Model Outcome Calibration
        </h1>
        <div className="text-[9px] font-mono text-[var(--ink-tertiary)] mt-1 uppercase tracking-widest">
          Phase 6 — Independent Audit Surface
        </div>
      </div>
      
      <div className="space-y-6">
        <PredictionOutcomeLedger />
        <EscalationEffectivenessBlock />
        <div className="grid grid-cols-2 gap-6">
          <CouplingAccuracyAudit />
          <WeightDriftMonitor />
        </div>
      </div>
    </div>
  );
}
