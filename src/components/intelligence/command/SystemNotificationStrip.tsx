"use client";

import React, { useEffect, useState } from "react";
import { argusEvents, ArgusEvent, ArgusEventPayload } from "@/lib/eventBus";

interface Notification {
  id: string;
  message: string;
  type: ArgusEvent;
}

export function SystemNotificationStrip() {
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null);

  useEffect(() => {
    const handleAlert = (event: ArgusEvent) => (payload?: ArgusEventPayload) => {
      const id = Date.now().toString();
      setActiveNotification({
        id,
        message: payload?.message || String(event),
        type: event
      });
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setActiveNotification(prev => prev?.id === id ? null : prev);
      }, 5000);
    };

    // Subscribing to high-priority events
    const unsub1 = argusEvents.subscribe("GOVERNANCE_MUTATION", handleAlert("GOVERNANCE_MUTATION"));
    const unsub2 = argusEvents.subscribe("SYSTEM_ALERT", handleAlert("SYSTEM_ALERT"));
    const unsub3 = argusEvents.subscribe("REVIEW_EXPIRED", handleAlert("REVIEW_EXPIRED"));

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, []);

  if (!activeNotification) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-[var(--background)] border border-red-500 text-red-600 px-6 py-2 shadow-2xl flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest">
        <span className="animate-pulse">⚠</span>
        {activeNotification.message}
      </div>
    </div>
  );
}
