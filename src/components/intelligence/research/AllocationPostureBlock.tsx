"use client";

interface AllocationPostureBlockProps {
  posture: string;
  escalationTrigger: string;
  nextReview: string;
  confidence: string;
}

export function AllocationPostureBlock({
  posture,
  escalationTrigger,
  nextReview,
  confidence,
}: AllocationPostureBlockProps) {
  const rows = [
    { label: "Posture",             value: posture },
    { label: "Escalation Trigger",  value: escalationTrigger },
    { label: "Next Review",         value: nextReview },
    { label: "Confidence",          value: confidence },
  ];

  return (
    <div
      className="font-mono space-y-[8px]"
      style={{
        borderTop: "1px solid var(--border-soft)",
        paddingTop: "20px",
        marginTop: "20px",
      }}
    >
      <span
        className="block text-[10px] uppercase tracking-[0.05em] mb-4 font-semibold"
        style={{ color: "var(--ink-secondary)" }}
      >
        Allocation Posture
      </span>
      {rows.map(({ label, value }) => (
        <div
          key={label}
          className="grid text-[10px]"
          style={{ gridTemplateColumns: "150px 1fr" }}
        >
          <span style={{ color: "var(--ink-tertiary)", letterSpacing: "0.04em" }}>{label}</span>
          <span className="font-semibold" style={{ color: "var(--ink-primary)" }}>{value}</span>
        </div>
      ))}
    </div>
  );
}
