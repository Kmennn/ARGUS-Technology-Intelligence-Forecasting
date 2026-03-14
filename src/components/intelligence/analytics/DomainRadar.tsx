"use client";

import React from "react";

interface RadarNode {
  id: string;
  domain: string;
  trl: number;
  weight: number;
}

const DATA: RadarNode[] = [
  { id: "LLM-M", domain: "AI", trl: 4.2, weight: 0.8 },
  { id: "Q-Sens", domain: "Quantum", trl: 3.5, weight: 0.6 },
  { id: "Syn-Bio", domain: "Bio", trl: 5.1, weight: 0.4 },
  { id: "Gr-Comp", domain: "Materials", trl: 2.8, weight: 0.7 },
  { id: "P-Sat", domain: "Space", trl: 6.2, weight: 0.5 },
  { id: "Swarm-L", domain: "Autonomy", trl: 4.8, weight: 0.9 },
  { id: "N-Core", domain: "AI", trl: 2.1, weight: 0.3 },
  { id: "Cryo-C", domain: "Quantum", trl: 4.0, weight: 0.5 },
];

const DOMAINS = ["AI", "Quantum", "Bio", "Materials", "Space", "Autonomy"];
const RINGS = [2, 4, 6, 8, 9];

export function DomainRadar() {
  const size = 400;
  const center = size / 2;
  const radius = center - 40;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-[10px] uppercase tracking-[0.05em] font-semibold text-[var(--ink-secondary)]">
            Domain Maturity Radar
          </h3>
          <p className="text-[9px] text-[var(--ink-muted)] font-mono">
            Radial Mapping: TRL [Center to Rim] | Angular: Domain Sector
          </p>
        </div>
      </div>

      <div className="relative bg-[var(--ink-ghost)] rounded-sm border border-[var(--border-soft)] flex items-center justify-center p-8">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
          {/* Background Rings */}
          {RINGS.map((trl) => (
            <circle
              key={trl}
              cx={center}
              cy={center}
              r={(trl / 9) * radius}
              fill="none"
              stroke="var(--border-soft)"
              strokeWidth="0.5"
              strokeDasharray="2 2"
            />
          ))}

          {/* Domain Spoke Lines */}
          {DOMAINS.map((domain, i) => {
            const angle = (i * 2 * Math.PI) / DOMAINS.length - Math.PI / 2;
            const x2 = center + Math.cos(angle) * radius;
            const y2 = center + Math.sin(angle) * radius;
            return (
              <g key={domain}>
                <line
                  x1={center}
                  y1={center}
                  x2={x2}
                  y2={y2}
                  stroke="var(--border-soft)"
                  strokeWidth="0.5"
                />
                <text
                  x={center + Math.cos(angle) * (radius + 25)}
                  y={center + Math.sin(angle) * (radius + 25)}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  className="text-[8px] font-mono font-bold uppercase fill-[var(--ink-tertiary)]"
                >
                  {domain}
                </text>
              </g>
            );
          })}

          {/* TRL Labels */}
          {RINGS.map((trl) => (
            <text
              key={trl}
              x={center}
              y={center - (trl / 9) * radius - 4}
              textAnchor="middle"
              className="text-[7px] font-mono fill-[var(--ink-muted)]"
            >
              TRL {trl}
            </text>
          ))}

          {/* Data Nodes */}
          {DATA.map((node) => {
            const domainIndex = DOMAINS.indexOf(node.domain);
            const sliceAngle = (2 * Math.PI) / DOMAINS.length;
            const angle = domainIndex * sliceAngle - Math.PI / 2 + (Math.random() - 0.5) * 0.4;
            const dist = (node.trl / 9) * radius;
            const x = center + Math.cos(angle) * dist;
            const y = center + Math.sin(angle) * dist;

            return (
              <g key={node.id} className="group cursor-default">
                <circle
                  cx={x}
                  cy={y}
                  r={3 + node.weight * 5}
                  fill="var(--accent-deep)"
                  stroke="var(--background)"
                  strokeWidth="1"
                  className="opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <text
                  x={x}
                  y={y - (5 + node.weight * 5)}
                  textAnchor="middle"
                  className="text-[7px] font-mono fill-[var(--ink-muted)] opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {node.id}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1 text-[7px] font-mono text-[var(--ink-muted)] uppercase">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-deep)]" />
            <span>Active Program</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full border border-[var(--border-soft)]" />
            <span>Projected Horizon</span>
          </div>
        </div>
      </div>
    </div>
  );
}
