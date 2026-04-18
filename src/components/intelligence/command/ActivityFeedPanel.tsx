"use client";

import React, { useEffect, useState } from "react";
import { argusEvents, ArgusEvent, ArgusEventPayload } from "@/lib/eventBus";

interface FeedItem {
  id: string;
  timestamp: Date;
  event: ArgusEvent;
  payload?: ArgusEventPayload;
}

const EVENT_STYLES: Record<string, string> = {
  REVIEW_INITIATED: "text-[#c9a227]",
  REVIEW_SUBMITTED: "text-[#2d8a4e]",
  REVIEW_EXPIRED: "text-[#b33a3a]",
  DECISION_LOGGED: "text-[var(--ink-secondary)]",
  ARTIFACT_EXPORTED: "text-[#5a7d9a]",
  GOVERNANCE_MUTATION: "text-[#8a2be2]",
  SYSTEM_ALERT: "text-[#ff4500]"
};

export function ActivityFeedPanel() {
  const [feed, setFeed] = useState<FeedItem[]>([]);

  useEffect(() => {
    const handleEvent = (event: ArgusEvent) => (payload?: ArgusEventPayload) => {
      setFeed(prev => {
        const newItem: FeedItem = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          timestamp: new Date(),
          event,
          payload
        };
        // Keep last 50 events
        return [newItem, ...prev].slice(0, 50);
      });
    };

    const subscriptions = [
      argusEvents.subscribe("REVIEW_INITIATED", handleEvent("REVIEW_INITIATED")),
      argusEvents.subscribe("REVIEW_SUBMITTED", handleEvent("REVIEW_SUBMITTED")),
      argusEvents.subscribe("REVIEW_EXPIRED", handleEvent("REVIEW_EXPIRED")),
      argusEvents.subscribe("DECISION_LOGGED", handleEvent("DECISION_LOGGED")),
      argusEvents.subscribe("ARTIFACT_EXPORTED", handleEvent("ARTIFACT_EXPORTED")),
      argusEvents.subscribe("GOVERNANCE_MUTATION", handleEvent("GOVERNANCE_MUTATION")),
      argusEvents.subscribe("SYSTEM_ALERT", handleEvent("SYSTEM_ALERT")),
    ];

    return () => {
      subscriptions.forEach(unsub => unsub());
    };
  }, []);

  const formatTime = (d: Date) => {
    return `[${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}]`;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[11px] font-mono uppercase tracking-[0.15em] text-[var(--ink-primary)] font-bold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Activity Feed
          </h2>
          <div className="text-[9px] font-mono text-[var(--ink-tertiary)] mt-0.5 uppercase tracking-widest pl-3.5">
            Real-time Operational Telemetry
          </div>
        </div>
      </div>

      <div className="bg-[var(--background-muted)] border border-[var(--border-soft)] h-48 overflow-y-auto p-4 font-mono text-[10px] space-y-2 text-[var(--ink-secondary)]">
        {feed.length === 0 ? (
          <div className="text-[var(--ink-muted)] italic flex items-center justify-center h-full">Awaiting system events...</div>
        ) : (
          feed.map(item => (
            <div key={item.id} className="flex items-start gap-4 border-b border-[var(--border-soft)] pb-2 last:border-0 last:pb-0">
              <span className="text-[var(--ink-tertiary)] shrink-0 mt-0.5">{formatTime(item.timestamp)}</span>
              <div className="flex flex-col">
                <span className={`${EVENT_STYLES[item.event] || "text-[var(--ink-secondary)]"} font-bold tracking-wider`}>
                  {item.event}
                </span>
                {item.payload?.message && (
                  <span className="text-[var(--ink-secondary)] mt-0.5">{item.payload.message}</span>
                )}
                {item.payload?.cycleId && (
                  <span className="text-[var(--ink-tertiary)] mt-0.5 text-[9px] uppercase">Cycle: {item.payload.cycleId}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
