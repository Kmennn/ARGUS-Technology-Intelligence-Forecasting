"use client";

import { ReactNode } from "react";

interface RegionLayoutProps {
  label: string;
  title: string;
  leadParagraph?: string;
  children: ReactNode;
}

export function RegionLayout({ label, title, leadParagraph, children }: RegionLayoutProps) {
  return (
    <div className="w-full px-[5vw] py-[140px] min-h-screen">
      <div className="max-w-[1000px] mx-auto flex flex-col items-center">
        {/* Editorial Header Block */}
        <div className="text-center mb-[60px] flex flex-col items-center">
          {/* Mono Section Label */}
          <span 
            className="font-mono text-[11px] uppercase tracking-widest mb-2 block"
            style={{ color: "var(--text-muted)" }}
          >
            {label}
          </span>
          <span className="font-mono text-[10px] tracking-widest text-[#B3B3B3] flex items-center justify-between">
          <span>{"CYCLE: Q1 // ASSESSED: MAR 2026 // NEXT REVIEW: 90D"}</span>
        </span>
          <span
            className="font-mono text-[10px] uppercase tracking-widest mb-6 block opacity-40"
            style={{ color: "var(--text-muted)" }}
          >
            Forecast Confidence at Issuance: Moderate (±12% variance tolerance)
          </span>

          {/* Massive Serif Title */}
          <h1
            className="text-5xl md:text-[80px] font-normal leading-tight mb-8"
            style={{ fontFamily: "var(--font-serif)", color: "var(--text-primary)" }}
          >
            <i>{title}</i>
          </h1>
          
          {/* Editorial Lead Paragraph */}
          {leadParagraph && (
            <p 
              className="text-lg md:text-xl leading-relaxed max-w-[720px]" 
              style={{ color: "var(--text-secondary)" }}
            >
              {leadParagraph}
            </p>
          )}
        </div>

        {/* Content Structure (Vertical Flow) */}
        <div className="w-full animate-fade-in flex flex-col gap-[48px]">
          {children}
        </div>
      </div>
    </div>
  );
}
