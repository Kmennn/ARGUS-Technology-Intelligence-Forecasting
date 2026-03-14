"use client";

interface BottleneckPanelProps {
  bottleneck: string;
}

export function BottleneckPanel({ bottleneck }: BottleneckPanelProps) {
  return (
    <div
      className="font-mono space-y-[5px]"
      style={{
        borderLeft: "2px solid rgba(255,255,255,0.12)",
        paddingLeft: "10px",
      }}
    >
      <span
        className="block text-[10px] uppercase tracking-widest"
        style={{ color: "var(--text-muted)" }}
      >
        Primary Bottleneck
      </span>
      <p
        className="text-[11px] leading-snug"
        style={{ color: "var(--text-primary)", opacity: 0.82 }}
      >
        {bottleneck}
      </p>
    </div>
  );
}
