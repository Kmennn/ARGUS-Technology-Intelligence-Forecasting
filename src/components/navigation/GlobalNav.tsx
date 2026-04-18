"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";

export function GlobalNav() {
  const { role } = useAuth();

  return (
    <nav className="w-full">
      <div className="mx-auto max-w-[1500px] rounded-[18px] border border-[rgba(138,126,119,0.14)] bg-[rgba(254,249,237,0.92)] px-5 py-4 shadow-[0_18px_50px_rgba(120,84,68,0.08)] backdrop-blur-md md:hidden">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="[font-family:var(--font-serif)] text-[24px] leading-none tracking-[0.06em] text-[var(--ink-primary)] transition-opacity hover:opacity-80"
          >
            ARGUS
          </Link>
          
          <div className="flex items-center gap-3 text-[var(--ink-secondary)] max-w-[180px]">
            <label htmlFor="argus-search-mobile" className="shrink-0 opacity-80">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </label>
            <input
              id="argus-search-mobile"
              type="text"
              placeholder="Search archive..."
              className="w-full min-w-0 bg-transparent text-[14px] text-[var(--ink-secondary)] outline-none placeholder:text-[var(--ink-secondary)] placeholder:opacity-75"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto hidden max-w-[1500px] items-center rounded-[18px] border border-[rgba(138,126,119,0.14)] bg-[rgba(254,249,237,0.92)] px-5 py-4 shadow-[0_18px_50px_rgba(120,84,68,0.08)] backdrop-blur-md md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:px-6">
        <div className="flex min-w-0 items-center gap-3 pr-6 text-[var(--ink-secondary)]">
          <label htmlFor="argus-search-desktop" className="shrink-0 opacity-80">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </label>
          <input
            id="argus-search-desktop"
            type="text"
            placeholder="Search archive..."
            className="w-full min-w-0 bg-transparent text-[15px] text-[var(--ink-secondary)] outline-none placeholder:text-[var(--ink-secondary)] placeholder:opacity-75 xl:text-[16px]"
          />
        </div>

        <div className="flex items-center justify-center px-4">
          <Link
            href="/"
            className="[font-family:var(--font-serif)] text-[30px] leading-none tracking-[0.05em] text-[var(--ink-primary)] transition-opacity hover:opacity-80 xl:text-[38px]"
          >
            ARGUS
          </Link>
        </div>

        <div className="flex min-w-0 items-center justify-end gap-3 overflow-hidden whitespace-nowrap pl-4 xl:gap-5">
           <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-[10px] uppercase tracking-widest text-[var(--ink-tertiary)] font-mono">
               System Live // {role || "(unassigned)"}
             </span>
           </div>
        </div>
      </div>
    </nav>
  );
}
