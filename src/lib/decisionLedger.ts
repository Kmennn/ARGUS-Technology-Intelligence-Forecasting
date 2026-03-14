/**
 * ARGUS Decision Ledger — Institutional Accountability Model
 *
 * Every governance action (initiate review, submit decision, expire, etc.)
 * becomes a traceable record linking:
 *   WHO → WHEN → WHAT → OUTCOME
 *
 * This is the foundation for institutional accountability.
 */

export type DecisionAction =
  | "INITIATE_REVIEW"
  | "SUBMIT_DECISION"
  | "REVIEW_EXPIRED"
  | "GOVERNANCE_MUTATION_APPLIED";

export interface DecisionEvent {
  /** Server-generated unique ID */
  decisionId: string;

  /** Link to governance cycle */
  cycleId: string;

  /** Who made the decision */
  actor: string;

  /** Role at the time of decision */
  role: "Analyst" | "Allocator" | "Admin";

  /** Server-generated ISO timestamp */
  timestamp: string;

  /** What action was taken */
  action: DecisionAction;

  /** System state BEFORE the decision */
  stateBefore: {
    pressure: number;
    horizonMonths: number;
  };

  /** System state AFTER the decision (null if pending) */
  stateAfter: {
    pressure: number;
    horizonMonths: number;
  } | null;

  /** Optional governance event ID this decision links to */
  linkedGovernanceEventId?: string;

  /** Optional human-readable note */
  note?: string;
}

/**
 * Static seed data for demonstrating the ledger in the prototype.
 * These simulate historical decisions that were made before the user arrived.
 */
export const SEED_DECISIONS: Omit<DecisionEvent, "decisionId">[] = [
  {
    cycleId: "Q3-2025-ESCALATION",
    actor: "admin-01",
    role: "Admin",
    timestamp: "2025-09-14T08:22:00Z",
    action: "INITIATE_REVIEW",
    stateBefore: { pressure: 0.72, horizonMonths: 8.1 },
    stateAfter: null,
    note: "Triggered by supply chain disruption signal"
  },
  {
    cycleId: "Q3-2025-ESCALATION",
    actor: "admin-01",
    role: "Admin",
    timestamp: "2025-09-14T08:24:12Z",
    action: "SUBMIT_DECISION",
    stateBefore: { pressure: 0.72, horizonMonths: 8.1 },
    stateAfter: { pressure: 0.58, horizonMonths: 9.4 },
    note: "Reallocated 15% from defense to energy resilience"
  },
  {
    cycleId: "Q3-2025-ESCALATION",
    actor: "admin-01",
    role: "Admin",
    timestamp: "2025-09-14T08:24:13Z",
    action: "GOVERNANCE_MUTATION_APPLIED",
    stateBefore: { pressure: 0.72, horizonMonths: 8.1 },
    stateAfter: { pressure: 0.58, horizonMonths: 9.4 },
    note: "Reward mutation applied — timely resolution"
  },
  {
    cycleId: "Q4-2025-ESCALATION",
    actor: "allocator-03",
    role: "Allocator",
    timestamp: "2025-12-02T14:10:00Z",
    action: "INITIATE_REVIEW",
    stateBefore: { pressure: 0.85, horizonMonths: 5.8 },
    stateAfter: null,
    note: "Pressure spike from semiconductor shortage"
  },
  {
    cycleId: "Q4-2025-ESCALATION",
    actor: "allocator-03",
    role: "Allocator",
    timestamp: "2025-12-02T14:25:01Z",
    action: "REVIEW_EXPIRED",
    stateBefore: { pressure: 0.85, horizonMonths: 5.8 },
    stateAfter: { pressure: 0.91, horizonMonths: 4.2 },
    note: "No decision submitted within window"
  },
  {
    cycleId: "Q4-2025-ESCALATION",
    actor: "allocator-03",
    role: "Allocator",
    timestamp: "2025-12-02T14:25:02Z",
    action: "GOVERNANCE_MUTATION_APPLIED",
    stateBefore: { pressure: 0.85, horizonMonths: 5.8 },
    stateAfter: { pressure: 0.91, horizonMonths: 4.2 },
    note: "Penalty mutation applied — review expired without action"
  }
];
