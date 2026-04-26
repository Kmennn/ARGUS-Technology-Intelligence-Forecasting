"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { Role } from "@/lib/auth";
import { ENGINE_VERSION } from "@/lib/horizonEngine";
import { useReviewRoom } from "@/components/simulation/ReviewRoomContext";

export function CommandRegion() {
  const { data: sessionData } = useSession();
  const role = (sessionData?.user as { role?: Role } | undefined)?.role;
  const { session, isSessionActive } = useReviewRoom();
  const [currentTime, setCurrentTime] = React.useState("");

  React.useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase() +
        " " +
        now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) +
        " UTC"
      );
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full border-b border-[var(--border-strong)] bg-[var(--background)]">
      <div className="max-w-[1200px] mx-auto w-full px-6 py-4 flex justify-between items-center">
        
        {/* Left: Branding + Identity */}
        <div className="flex items-center gap-6">
          <h1 className="text-[14px] font-mono uppercase tracking-[0.1em] text-[var(--ink-primary)] font-bold">
            ARGUS <span className="text-[var(--ink-muted)] font-normal text-[12px]">Portfolio Intelligence</span>
          </h1>
          <div className="hidden md:flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest text-[var(--ink-muted)] border-l border-[var(--border-soft)] pl-6">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span>System Live</span>
          </div>
        </div>

        {/* Center: Active Session */}
        <div className="hidden lg:flex items-center gap-4">
          {isSessionActive && session && (
            <span className="text-amber-500 font-bold font-mono text-[10px] uppercase tracking-widest border border-amber-500/30 px-3 py-1.5 rounded animate-pulse flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              Active Review: {session.cycleId}
            </span>
          )}
        </div>

        {/* Right: Telemetry */}
        <div className="flex items-center gap-5 text-[9px] font-mono uppercase tracking-[0.08em] text-[var(--ink-muted)]">
          <span className="hidden sm:inline px-2.5 py-1 rounded border border-[var(--border-soft)] bg-[var(--background-muted)]">
            {role}
          </span>
          <span className="hidden md:inline">
            {currentTime}
          </span>
          <span className="text-[var(--ink-tertiary)] opacity-70">
            [{ENGINE_VERSION}]
          </span>
        </div>

      </div>
    </div>
  );
}
