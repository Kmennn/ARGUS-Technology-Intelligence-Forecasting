"use client";

import { GlobalNav } from "@/components/navigation/GlobalNav";
import { ReviewRoomProvider } from "@/components/simulation/ReviewRoomContext";
import { ReviewRoomBanner } from "@/components/simulation/ReviewRoomBanner";
import { InstitutionalStateProvider } from "@/context/InstitutionalStateProvider";
import { CommandRegion } from "@/components/spatial/CommandRegion";
import { DecisionLedgerPanel } from "@/components/intelligence/command/DecisionLedgerPanel";
import { ActivityFeedPanel } from "@/components/intelligence/command/ActivityFeedPanel";
import { SystemNotificationStrip } from "@/components/intelligence/command/SystemNotificationStrip";
import { AuthProvider } from "@/context/AuthProvider";

export function AppShell({ children }: { children?: React.ReactNode }) {
  return (
    <AuthProvider>
    <ReviewRoomProvider>
    <InstitutionalStateProvider>
      <div className="min-h-screen flex flex-col" style={{ background: "var(--background)", color: "var(--text-primary)" }}>
        {/* Global Notifications */}
        <SystemNotificationStrip />

        {/* Header — Editorial Navigation */}
        <header className="sticky top-0 z-50 px-[5vw] py-4 bg-[var(--background)]">
          <GlobalNav />
        </header>

        {/* PHASE 7: Persistent Tension Banner */}
        <ReviewRoomBanner />

        {/* SOVEREIGN: Command Surface — always rendered above all domain routes */}
        <CommandRegion />

        {/* Main Content — Domain routes render below Command */}
        <main className="flex-1 pb-16">
          {children}
        </main>

        {/* Operational Telemetry (Live Feed) */}
        <div className="w-full bg-[var(--background)] border-t border-[var(--border-strong)] pt-8 pb-8 px-[5vw]">
          <div className="max-w-[1280px] mx-auto w-full">
            <ActivityFeedPanel />
          </div>
        </div>

        {/* Governance Ledger (Full width bottom zone) */}
        <div className="w-full bg-[var(--background)] border-t border-[var(--border-strong)] pt-8 pb-16 px-[5vw]">
          <div className="max-w-[1280px] mx-auto w-full">
            <DecisionLedgerPanel />
          </div>
        </div>

        {/* Architectural Footer */}
        <footer className="w-full px-[5vw] py-16 md:py-24" style={{ borderTop: "1px solid var(--border)", background: "rgba(254, 249, 237, 0.5)" }}>
          <div className="max-w-[1280px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 font-mono text-[11px] uppercase tracking-widest leading-loose" style={{ color: "var(--text-muted)" }}>
            {/* Column 1 */}
            <div className="flex flex-col gap-2">
              <a href="/research" className="hover:text-[var(--text-primary)] transition-colors">Research</a>
              <a href="/analysis" className="hover:text-[var(--text-primary)] transition-colors">Analysis</a>
              <a href="/signals" className="hover:text-[var(--text-primary)] transition-colors">Signals</a>
              <a href="/archive" className="hover:text-[var(--text-primary)] transition-colors">Archive</a>
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-2">
              <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Publications</a>
              <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Methodology</a>
              <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Institutional Notes</a>
            </div>

            {/* Column 3 */}
            <div className="flex flex-col gap-2">
              <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Legal</a>
              <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Accessibility</a>
              <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Contact</a>
            </div>

            {/* Column 4 */}
            <div className="flex flex-col gap-2 justify-end md:text-right">
              <span>© ARGUS Research Institute</span>
              <span>2026</span>
            </div>
          </div>
        </footer>
      </div>
    </InstitutionalStateProvider>
    </ReviewRoomProvider>
    </AuthProvider>
  );
}

