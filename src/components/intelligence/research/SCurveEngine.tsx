"use client";

import React from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  AreaChart,
  Area,
  Tooltip,
} from "recharts";

interface SCurvePoint {
  t: number;
  label: string;
  adoption: number;
  projection?: number;
}

const K = 100; // Saturation
const r = 0.5; // Growth rate
const t0 = 0;   // Midpoint

const generateData = (): SCurvePoint[] => {
  const data: SCurvePoint[] = [];
  for (let t = -6; t <= 10; t += 0.5) {
    const adoption = K / (1 + Math.exp(-r * (t - t0)));
    const isProjection = t > 2;
    
    data.push({
      t,
      label: `Q${Math.floor(t + 7)}`,
      adoption: isProjection ? 0 : adoption,
      projection: isProjection ? adoption : undefined,
    });
  }
  return data;
};

const DATA = generateData();

export function SCurveEngine() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-[10px] uppercase tracking-[0.05em] font-semibold text-[var(--ink-secondary)]">
            S-Curve Projection Engine
          </h3>
          <p className="text-[9px] text-[var(--ink-muted)] font-mono">
            Model: Logistic Growth | r=0.5 | K=1.0 | t0=2025.Q4
          </p>
        </div>
        <div className="text-right">
          <div className="text-[14px] font-bold text-[var(--ink-primary)]">6.4 Mo</div>
          <div className="text-[8px] uppercase font-mono text-[var(--ink-muted)]">To Inflection</div>
        </div>
      </div>

      <div className="w-full overflow-x-auto bg-[var(--ink-ghost)] rounded-sm border border-[var(--border-soft)] p-4">
        <AreaChart width={640} height={148} data={DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 2" stroke="var(--border-soft)" vertical={false} />
            <XAxis 
              dataKey="label" 
              hide 
            />
            <YAxis 
              domain={[0, 100]} 
              tick={{ fontSize: 8, fill: "var(--ink-muted)", fontFamily: "var(--font-mono)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "var(--background)", 
                border: "1px solid var(--border-soft)",
                fontSize: "9px",
                fontFamily: "var(--font-mono)",
                borderRadius: "2px"
              }}
            />
            <Area
              type="monotone"
              dataKey="adoption"
              stroke="var(--accent-deep)"
              fill="var(--accent-soft)"
              fillOpacity={0.2}
              strokeWidth={1.5}
              activeDot={{ r: 3, fill: "var(--accent-deep)" }}
            />
            <Area
              type="monotone"
              dataKey="projection"
              stroke="var(--accent-deep)"
              strokeDasharray="4 4"
              fill="var(--accent-ghost)"
              fillOpacity={0.1}
              strokeWidth={1}
            />
            <ReferenceLine x="Q8" stroke="var(--ink-tertiary)" strokeDasharray="3 3" label={{ position: 'top', value: 'INFLECTION', fill: 'var(--ink-tertiary)', fontSize: 7, fontFamily: 'var(--font-mono)' }} />
            <ReferenceLine y={DATA.find(d => d.label === "Q8")?.adoption} stroke="var(--border-soft)" strokeDasharray="2 2" />
        </AreaChart>
      </div>

      <div className="grid grid-cols-3 gap-4 text-[9px] font-mono">
        <div className="space-y-1">
          <span className="text-[var(--ink-muted)] uppercase">Current Inferred</span>
          <div className="text-[var(--ink-secondary)] font-bold">42.5% Saturation</div>
        </div>
        <div className="space-y-1 border-l border-[var(--border-soft)] pl-4">
          <span className="text-[var(--ink-muted)] uppercase">Growth Rate (r)</span>
          <div className="text-[var(--ink-secondary)] font-bold">0.52x Δ/Cycle</div>
        </div>
        <div className="space-y-1 border-l border-[var(--border-soft)] pl-4">
          <span className="text-[var(--ink-muted)] uppercase">Forecast Horizon</span>
          <div className="text-[var(--ink-secondary)] font-bold">+18 Mo (High Conf)</div>
        </div>
      </div>
    </div>
  );
}
