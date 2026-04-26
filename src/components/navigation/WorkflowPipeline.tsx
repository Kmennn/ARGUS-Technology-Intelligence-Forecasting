"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { hasPermission, Role } from "@/lib/auth";

interface PipelineStep {
  href: string;
  label: string;
  subtitle: string;
  requiredRole?: Role;
}

const PIPELINE: PipelineStep[] = [
  { href: "/intelligence", label: "Intelligence", subtitle: "Identify Emerging Signals" },
  { href: "/assessment", label: "Assessment", subtitle: "Evaluate Strategic Impact" },
  { href: "/capabilities", label: "Capability Impact", subtitle: "Assess Institutional Readiness" },
  { href: "/simulation", label: "Simulation", subtitle: "Test Future Outcomes", requiredRole: "Allocator" },
  { href: "/decisions", label: "Decisions", subtitle: "Execute Strategic Actions", requiredRole: "Allocator" },
];

function usePipelinePosition() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as { role?: Role } | undefined)?.role || "Analyst";

  const visibleSteps = PIPELINE.filter(
    (step) => !step.requiredRole || hasPermission(role, step.requiredRole)
  );

  const currentIndex = visibleSteps.findIndex((s) => pathname.startsWith(s.href));
  const currentStep = currentIndex >= 0 ? visibleSteps[currentIndex] : null;
  const nextStep = currentIndex >= 0 && currentIndex < visibleSteps.length - 1
    ? visibleSteps[currentIndex + 1]
    : null;
  const prevStep = currentIndex > 0 ? visibleSteps[currentIndex - 1] : null;

  return {
    currentStep,
    currentIndex,
    nextStep,
    prevStep,
    totalSteps: visibleSteps.length,
    stepNumber: currentIndex + 1,
  };
}


/**
 * StepContext — Rendered at the top of each page content area.
 * Shows: "STEP 2 OF 5 — Evaluate Strategic Impact"
 */
export function StepContext() {
  const { currentStep, stepNumber, totalSteps } = usePipelinePosition();

  if (!currentStep) return null;

  return (
    <div className="w-full">
      <div className="max-w-[900px] mx-auto px-6 pt-10 pb-6">
        <div className="flex items-center gap-4">
          {/* Step badge */}
          <div className="flex items-center gap-2.5">
            <span className="
              inline-flex items-center justify-center w-8 h-8 rounded-full
              bg-[var(--ink-primary)] text-[var(--bg-primary)]
              font-mono text-[11px] font-bold leading-none
            ">
              {stepNumber}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--ink-muted)]">
              Step {stepNumber} of {totalSteps}
            </span>
          </div>

          {/* Divider */}
          <div className="h-[1px] w-6 bg-[var(--border-soft)]" />

          {/* Subtitle */}
          <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--ink-secondary)] font-medium">
            {currentStep.subtitle}
          </span>
        </div>
      </div>
    </div>
  );
}


/**
 * WorkflowContinue — Rendered at the bottom of each page.
 * Shows a "Continue to Assessment →" button plus a back link.
 */
export function WorkflowContinue() {
  const { nextStep, prevStep } = usePipelinePosition();

  if (!nextStep && !prevStep) return null;

  return (
    <div className="w-full border-t border-[var(--border-soft)] mt-16">
      <div className="max-w-[900px] mx-auto px-6 py-12 flex items-center justify-between">
        {/* Back link */}
        {prevStep ? (
          <Link
            href={prevStep.href}
            className="
              group flex items-center gap-3
              font-mono text-[11px] uppercase tracking-[0.06em]
              text-[var(--ink-muted)] hover:text-[var(--ink-secondary)] transition-colors
            "
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:-translate-x-0.5">
              <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {prevStep.label}
          </Link>
        ) : (
          <div />
        )}

        {/* Continue button */}
        {nextStep && (
          <Link
            href={nextStep.href}
            className="
              group flex items-center gap-3 px-6 py-3 rounded-lg
              bg-[var(--ink-primary)] text-[var(--bg-primary)]
              font-mono text-[11px] uppercase tracking-[0.08em] font-bold
              hover:shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all duration-300
              hover:translate-y-[-1px]
            "
          >
            Continue to {nextStep.label}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:translate-x-0.5">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}
