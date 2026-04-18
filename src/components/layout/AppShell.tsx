"use client";

import { SidebarNav } from "@/components/navigation/SidebarNav";
import { GlobalNav } from "@/components/navigation/GlobalNav";
import { ReviewRoomProvider } from "@/components/simulation/ReviewRoomContext";
import { ReviewRoomBanner } from "@/components/simulation/ReviewRoomBanner";
import { InstitutionalStateProvider } from "@/context/InstitutionalStateProvider";
import { CommandRegion } from "@/components/spatial/CommandRegion";
import { WorkflowIndicator } from "@/components/navigation/WorkflowIndicator";
import { DecisionLedgerPanel } from "@/components/intelligence/command/DecisionLedgerPanel";
import { ActivityFeedPanel } from "@/components/intelligence/command/ActivityFeedPanel";
import { SystemNotificationStrip } from "@/components/intelligence/command/SystemNotificationStrip";

export function AppShell({ children }: { children?: React.ReactNode }) {
  return (
    <ReviewRoomProvider>
    <InstitutionalStateProvider>
      <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
        {/* Persistent Side Navigation - Desktop only */}
        <SidebarNav />

        {/* Workspace Area - Offset for Sidebar on desktop */}
        <div className="lg:pl-[280px] flex flex-col min-h-screen">
          {/* Global Notifications */}
          <SystemNotificationStrip />

          {/* Top Utility Bar — Identity & Search */}
          <header className="sticky top-0 z-50 px-[5vw] py-4 bg-[var(--background)] border-b border-[var(--border-soft)]">
            <GlobalNav />
          </header>

        {/* PHASE 7: Persistent Tension Banner */}
        <ReviewRoomBanner />

        {/* SOVEREIGN: Command Surface — always rendered above all domain routes */}
        <CommandRegion />

        {/* Workflow Progress Indicator — shows analyst where they are in the pipeline */}
        <WorkflowIndicator />

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
        <footer className="w-full px-[5vw] py-16 md:py-24 border-t border-[var(--border)] bg-[rgba(254,249,237,0.5)]">
          <div className="max-w-[1280px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 font-mono text-[11px] uppercase tracking-widest leading-loose text-[var(--text-muted)]">
            {/* Column 1 */}
            <div className="flex flex-col gap-2">
              <a href="/intelligence" className="hover:text-[var(--text-primary)] transition-colors">Intelligence</a>
              <a href="/assessment" className="hover:text-[var(--text-primary)] transition-colors">Assessment</a>
              <a href="/capabilities" className="hover:text-[var(--text-primary)] transition-colors">Capability Impact</a>
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
    </div>
    </InstitutionalStateProvider>
    </ReviewRoomProvider>
  );
}

