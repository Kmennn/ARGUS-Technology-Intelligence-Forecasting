"use client";

import React from "react";
import { useReviewRoom } from "./ReviewRoomContext";

/**
 * Format milliseconds into MM:SS tabular string
 */
function formatTime(ms: number) {
  if (ms <= 0) return "00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function ReviewRoomBanner() {
  const { isExpired, timeRemainingMs, session, submitDecision } = useReviewRoom();

  // If no session is active and it hasn't expired yet, do not render the banner.
  // Wait, if it IS expired, it should render "REVIEW WINDOW CLOSED".
  // isSessionActive is true if a session exists AND decision is NOT submitted.
  // isExpired means session exists, decision NOT submitted, AND time reached 0.
  if (!session || session.decisionSubmitted) return null;

  return (
    <div className="w-full bg-[var(--ink-primary)] text-[var(--background)] font-mono text-xs tracking-tight border-b border-[var(--border-strong)] z-50 relative">
      <div className="max-w-[1200px] mx-auto px-6 py-2 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* State Declaration */}
        <div className="flex items-center gap-6">
          {isExpired ? (
            <span className="font-bold uppercase tracking-widest text-red-400">
              REVIEW WINDOW CLOSED
            </span>
          ) : (
            <span className="font-bold uppercase tracking-widest text-[#E5E1DA]">
              REVIEW ROOM ACTIVE
            </span>
          )}
          
          <div className="flex items-center gap-2">
            <span className="text-[var(--ink-secondary)] opacity-70">TIME REMAINING:</span>
            <span className={`tabular-nums font-bold text-sm ${isExpired ? 'text-red-400' : 'text-white'}`}>
              {formatTime(timeRemainingMs)}
            </span>
          </div>
        </div>

        {/* Consequences and Action */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-[10px] uppercase tracking-wider hidden md:flex">
            <span className="opacity-70">PRESSURE: 0.81 (ESCALATED)</span>
            <span className="opacity-70">HORIZON: 5.8 MONTHS</span>
          </div>

          {isExpired ? (
            <span className="font-bold uppercase tracking-wide text-red-400 border border-red-400/50 px-3 py-1">
              DEFAULT ALLOCATION ENFORCED
            </span>
          ) : (
            <button 
              onClick={submitDecision}
              className="px-4 py-1.5 bg-[#E5E1DA] text-[var(--ink-primary)] font-bold uppercase tracking-wider hover:bg-white transition-colors"
            >
              Submit Decision
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
