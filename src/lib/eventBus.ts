/**
 * ARGUS Event Bus — Situation Stream Architecture
 * 
 * In operational systems, components do not just react to state changes;
 * they react to semantic events. This bus allows subsystems to decouple
 * and broadcast/listen to critical moments in the system lifecycle.
 */

export type ArgusEvent =
  | "REVIEW_INITIATED"
  | "REVIEW_SUBMITTED"
  | "REVIEW_EXPIRED"
  | "DECISION_LOGGED"
  | "ARTIFACT_EXPORTED"
  | "GOVERNANCE_MUTATION"
  | "SYSTEM_ALERT"
  | "SCENARIO_CREATED"
  | "SCENARIO_RUN"
  | "SCENARIO_COMPARED"
  | "SCENARIO_MONTE_CARLO_STARTED"
  | "SCENARIO_MONTE_CARLO_FINISHED";

export interface ArgusEventPayload {
  cycleId?: string;
  actor?: string;
  role?: string;
  message?: string;
  metadata?: Record<string, unknown>;
}

export type ArgusEventListener = (payload?: ArgusEventPayload) => void;

class EventBus {
  private listeners: Record<string, ArgusEventListener[]> = {};

  /** Broadcast an event to all subscribers */
  emit(event: ArgusEvent, payload?: ArgusEventPayload) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach((listener) => {
      try {
        listener(payload);
      } catch (err) {
        console.error(`ARGUS EventBus Error [${event}]:`, err);
      }
    });

    // Also dispatch to window for cross-boundary or legacy listeners (like DecisionLedgerPanel)
    if (typeof window !== "undefined") {
      const customEvent = new CustomEvent(`argus-${event}`, { detail: payload });
      window.dispatchEvent(customEvent);
    }
  }

  /** Subscribe to an event */
  subscribe(event: ArgusEvent, listener: ArgusEventListener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);

    // Return an unsubscribe function
    return () => this.unsubscribe(event, listener);
  }

  /** Remove a subscription */
  unsubscribe(event: ArgusEvent, listener: ArgusEventListener) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((l) => l !== listener);
  }
}

// Export a singleton instance
export const argusEvents = new EventBus();
