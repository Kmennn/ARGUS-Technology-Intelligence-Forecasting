"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { hasPermission, Role } from "@/lib/auth";

interface WorkflowStep {
  href: string;
  label: string;
  shortLabel: string;
  requiredRole?: Role;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  { href: "/intelligence", label: "Intelligence", shortLabel: "INT" },
  { href: "/assessment", label: "Assessment", shortLabel: "ASM" },
  { href: "/capabilities", label: "Capability Impact", shortLabel: "CAP" },
  { href: "/simulation", label: "Simulation", shortLabel: "SIM", requiredRole: "Allocator" },
  { href: "/decisions", label: "Decisions", shortLabel: "DEC", requiredRole: "Allocator" },
];

export function WorkflowIndicator() {
  const pathname = usePathname();
  const { role } = useAuth();

  const visibleSteps = WORKFLOW_STEPS.filter(
    (step) => !step.requiredRole || hasPermission(role, step.requiredRole)
  );

  const activeIndex = visibleSteps.findIndex((step) => pathname.startsWith(step.href));

  return (
    <div className="w-full bg-[var(--background)] border-b border-[var(--border-soft)]">
      <div className="max-w-[1200px] mx-auto px-6 py-3 flex items-center justify-center gap-0">
        {visibleSteps.map((step, index) => {
          const isActive = pathname.startsWith(step.href);
          const isCompleted = activeIndex > -1 && index < activeIndex;
          const _isFuture = activeIndex > -1 && index > activeIndex;

          return (
            <div key={step.href} className="flex items-center">
              <Link
                href={step.href}
                className={`
                  group relative flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300
                  font-mono text-[10px] uppercase tracking-[0.08em]
                  ${isActive
                    ? "bg-[var(--ink-primary)] text-[var(--bg-primary)] font-bold shadow-[0_2px_12px_rgba(0,0,0,0.15)]"
                    : isCompleted
                      ? "text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[rgba(0,0,0,0.03)]"
                      : "text-[var(--ink-muted)] hover:text-[var(--ink-secondary)] hover:bg-[rgba(0,0,0,0.02)]"
                  }
                `}
              >
                {/* Step number indicator */}
                <span className={`
                  w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-bold leading-none
                  ${isActive
                    ? "bg-[var(--bg-primary)] text-[var(--ink-primary)]"
                    : isCompleted
                      ? "bg-[var(--ink-primary)] text-[var(--bg-primary)] opacity-60"
                      : "border border-current opacity-40"
                  }
                `}>
                  {isCompleted ? "✓" : index + 1}
                </span>

                {/* Full label on desktop, short on mobile */}
                <span className="hidden md:inline">{step.label}</span>
                <span className="md:hidden">{step.shortLabel}</span>
              </Link>

              {/* Connector arrow between steps */}
              {index < visibleSteps.length - 1 && (
                <div className={`
                  mx-1 flex items-center transition-opacity duration-300
                  ${isCompleted ? "opacity-50" : "opacity-20"}
                `}>
                  <div className={`w-6 h-[1px] ${isCompleted ? "bg-[var(--ink-secondary)]" : "bg-[var(--ink-muted)]"}`} />
                  <svg width="6" height="8" viewBox="0 0 6 8" fill="none" className={isCompleted ? "text-[var(--ink-secondary)]" : "text-[var(--ink-muted)]"}>
                    <path d="M1 1L5 4L1 7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
