"use client";

interface DeviationBandProps {
  domainLabel?: string;
  q1Variance: number;
  q2Min: number;
  q2Max: number;
  tolerance?: number;
}

const W = 240;
const H = 88;
const PAD = { top: 10, bottom: 18, left: 30, right: 10 };
const CW = W - PAD.left - PAD.right;
const CH = H - PAD.top - PAD.bottom;

export function DeviationBand({
  domainLabel = "Research",
  q1Variance,
  q2Min,
  q2Max,
  tolerance = 12,
}: DeviationBandProps) {
  const absMax = Math.max(
    Math.abs(q1Variance),
    Math.abs(q2Min),
    Math.abs(q2Max),
    tolerance
  ) * 1.4;

  const yPx = (v: number) =>
    PAD.top + CH / 2 - (v / absMax) * (CH / 2);

  const xQ0 = PAD.left + CW * 0.1;
  const xQ1 = PAD.left + CW * 0.5;
  const xQ2 = PAD.left + CW * 0.9;

  const yZero   = yPx(0);
  const yTop    = yPx(tolerance);
  const yBot    = yPx(-tolerance);
  const yQ1     = yPx(q1Variance);
  const yQ2Min  = yPx(Math.max(q2Min, q2Max));
  const yQ2Max  = yPx(Math.min(q2Min, q2Max));

  const q1Outside = Math.abs(q1Variance) > tolerance;

  return (
    <div className="font-mono space-y-2">
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] uppercase tracking-widest font-semibold"
          style={{ color: "var(--ink-secondary)" }}
        >
          Forecast Deviation — {domainLabel}
        </span>
        <span className="text-[9px]" style={{ color: "var(--ink-muted)" }}>
          ±{tolerance}% tolerance
        </span>
      </div>

      <svg width={W} height={H} style={{ overflow: "visible" }}>
        {/* Tolerance band fill */}
        <rect
          x={PAD.left}
          y={yTop}
          width={CW}
          height={yBot - yTop}
          fill="rgba(0,0,0,0.03)"
        />

        {/* Tolerance ceiling */}
        <line
          x1={PAD.left} x2={PAD.left + CW}
          y1={yTop} y2={yTop}
          stroke="#C9BFB7"
          strokeWidth={1.2}
          strokeDasharray="4 2"
        />

        {/* Tolerance floor */}
        <line
          x1={PAD.left} x2={PAD.left + CW}
          y1={yBot} y2={yBot}
          stroke="#C9BFB7"
          strokeWidth={1.2}
          strokeDasharray="4 2"
        />

        {/* Zero line */}
        <line
          x1={PAD.left} x2={PAD.left + CW}
          y1={yZero} y2={yZero}
          stroke="var(--border-soft)"
          strokeWidth={1}
        />

        {/* Y-axis labels */}
        <text x={PAD.left - 6} y={yTop + 3}  textAnchor="end" fontSize={7} fontWeight={500} fill="var(--ink-tertiary)">+{tolerance}%</text>
        <text x={PAD.left - 6} y={yZero + 3} textAnchor="end" fontSize={7} fontWeight={500} fill="var(--ink-tertiary)">0%</text>
        <text x={PAD.left - 6} y={yBot + 3}  textAnchor="end" fontSize={7} fontWeight={500} fill="var(--ink-tertiary)">−{tolerance}%</text>

        {/* Q1 actual — circle + label */}
        <circle
          cx={xQ1}
          cy={yQ1}
          r={4}
          fill={q1Outside ? "var(--accent-deep)" : "var(--ink-primary)"}
        />
        <text
          x={xQ1}
          y={yQ1 - 7}
          textAnchor="middle"
          fontSize={7}
          fill={q1Outside ? "rgba(180,40,40,0.65)" : "rgba(0,0,0,0.4)"}
        >
          {q1Variance > 0 ? "+" : ""}{q1Variance}%
        </text>

        {/* Q2 projected band */}
        <rect
          x={xQ2 - 7}
          y={Math.min(yQ2Min, yQ2Max)}
          width={14}
          height={Math.abs(yQ2Max - yQ2Min) || 2}
          fill="var(--accent-soft)"
          opacity={0.15}
          rx={2}
        />
        <rect
          x={xQ2 - 7}
          y={Math.min(yQ2Min, yQ2Max)}
          width={14}
          height={Math.abs(yQ2Max - yQ2Min) || 2}
          fill="none"
          stroke="var(--accent-soft)"
          strokeWidth={1}
          strokeDasharray="2 1"
          rx={2}
        />
        <text
          x={xQ2}
          y={Math.min(yQ2Min, yQ2Max) - 5}
          textAnchor="middle"
          fontSize={7}
          fontWeight={600}
          fill="var(--accent-deep)"
        >
          {q2Max > 0 ? "+" : ""}{q2Max}%
        </text>

        {/* X-axis labels */}
        <text x={xQ0} y={H - 2} textAnchor="middle" fontSize={7} fontWeight={500} fill="var(--ink-muted)">Q0</text>
        <text x={xQ1} y={H - 2} textAnchor="middle" fontSize={7} fontWeight={500} fill="var(--ink-muted)">Q1</text>
        <text x={xQ2} y={H - 2} textAnchor="middle" fontSize={7} fontWeight={500} fill="var(--ink-muted)">Q2 proj.</text>
      </svg>
    </div>
  );
}
