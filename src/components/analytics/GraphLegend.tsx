"use client";

import { useState } from "react";

export function GraphLegend() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      {/* Node Types */}
      <div>
        <h3 className="text-label text-text-primary uppercase tracking-wider mb-3">
          Node Types
        </h3>
        <div className="flex flex-col gap-2">
          <div
            className="flex items-center gap-3 p-1 -m-1 rounded cursor-pointer"
            onMouseEnter={() => setHoveredNode("tech")}
            onMouseLeave={() => setHoveredNode(null)}
            style={{
              backgroundColor: hoveredNode === "tech" ? "var(--state-hover-bg)" : "transparent",
              transition: "background-color 150ms ease-out",
            }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <circle
                cx="12"
                cy="12"
                r={hoveredNode === "tech" ? 9 : 8}
                className="fill-accent"
                style={{ transition: "r 150ms ease-out" }}
              />
            </svg>
            <span className="text-caption text-text-secondary">Technology</span>
          </div>
          <div
            className="flex items-center gap-3 p-1 -m-1 rounded cursor-pointer"
            onMouseEnter={() => setHoveredNode("domain")}
            onMouseLeave={() => setHoveredNode(null)}
            style={{
              backgroundColor: hoveredNode === "domain" ? "var(--state-hover-bg)" : "transparent",
              transition: "background-color 150ms ease-out",
            }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <polygon
                points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5"
                className="fill-text-muted"
                style={{
                  transform: hoveredNode === "domain" ? "scale(1.1)" : "scale(1)",
                  transformOrigin: "center",
                  transition: "transform 150ms ease-out",
                }}
              />
            </svg>
            <span className="text-caption text-text-secondary">Domain</span>
          </div>
          <div
            className="flex items-center gap-3 p-1 -m-1 rounded cursor-pointer"
            onMouseEnter={() => setHoveredNode("org")}
            onMouseLeave={() => setHoveredNode(null)}
            style={{
              backgroundColor: hoveredNode === "org" ? "var(--state-hover-bg)" : "transparent",
              transition: "background-color 150ms ease-out",
            }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <rect
                x="4"
                y="4"
                width="16"
                height="16"
                rx="2"
                className="fill-accent-muted"
                style={{
                  transform: hoveredNode === "org" ? "scale(1.1)" : "scale(1)",
                  transformOrigin: "center",
                  transition: "transform 150ms ease-out",
                }}
              />
            </svg>
            <span className="text-caption text-text-secondary">Organization</span>
          </div>
        </div>
      </div>

      {/* Edge Types */}
      <div>
        <h3 className="text-label text-text-primary uppercase tracking-wider mb-3">
          Relationships
        </h3>
        <div className="flex flex-col gap-2">
          <div
            className="flex items-center gap-3 p-1 -m-1 rounded cursor-pointer"
            onMouseEnter={() => setHoveredEdge("enables")}
            onMouseLeave={() => setHoveredEdge(null)}
            style={{
              backgroundColor: hoveredEdge === "enables" ? "var(--state-hover-bg)" : "transparent",
              transition: "background-color 150ms ease-out",
            }}
          >
            <svg viewBox="0 0 40 12" className="w-10 h-3">
              <line
                x1="0"
                y1="6"
                x2="30"
                y2="6"
                className="stroke-accent"
                strokeWidth={hoveredEdge === "enables" ? 3 : 2}
                style={{ transition: "stroke-width 150ms ease-out" }}
              />
              <polygon points="30,2 38,6 30,10" className="fill-accent" />
            </svg>
            <span className="text-caption text-text-secondary">Enables</span>
          </div>
          <div
            className="flex items-center gap-3 p-1 -m-1 rounded cursor-pointer"
            onMouseEnter={() => setHoveredEdge("depends")}
            onMouseLeave={() => setHoveredEdge(null)}
            style={{
              backgroundColor: hoveredEdge === "depends" ? "var(--state-hover-bg)" : "transparent",
              transition: "background-color 150ms ease-out",
            }}
          >
            <svg viewBox="0 0 40 12" className="w-10 h-3">
              <line
                x1="0"
                y1="6"
                x2="30"
                y2="6"
                className="stroke-text-muted"
                strokeWidth={hoveredEdge === "depends" ? 3 : 2}
                strokeDasharray="4 2"
                style={{ transition: "stroke-width 150ms ease-out" }}
              />
              <polygon points="30,2 38,6 30,10" className="fill-text-muted" />
            </svg>
            <span className="text-caption text-text-secondary">Depends On</span>
          </div>
          <div
            className="flex items-center gap-3 p-1 -m-1 rounded cursor-pointer"
            onMouseEnter={() => setHoveredEdge("converges")}
            onMouseLeave={() => setHoveredEdge(null)}
            style={{
              backgroundColor: hoveredEdge === "converges" ? "var(--state-hover-bg)" : "transparent",
              transition: "background-color 150ms ease-out",
            }}
          >
            <svg viewBox="0 0 40 12" className="w-10 h-3">
              <line
                x1="4"
                y1="4"
                x2="36"
                y2="4"
                className="stroke-signal"
                strokeWidth={hoveredEdge === "converges" ? 2 : 1.5}
                style={{ transition: "stroke-width 150ms ease-out" }}
              />
              <line
                x1="4"
                y1="8"
                x2="36"
                y2="8"
                className="stroke-signal"
                strokeWidth={hoveredEdge === "converges" ? 2 : 1.5}
                style={{ transition: "stroke-width 150ms ease-out" }}
              />
            </svg>
            <span className="text-caption text-text-secondary">Converges With</span>
          </div>
        </div>
      </div>

      {/* Hover Info Mock */}
      <div>
        <h3 className="text-label text-text-primary uppercase tracking-wider mb-3">
          Hover Detail
        </h3>
        <div
          className="rounded-panel border border-accent/50 bg-background-tertiary p-3 text-caption"
          style={{
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div className="font-medium text-text-primary">Quantum Computing</div>
          <div className="text-text-muted mt-1">Type: Technology</div>
          <div className="text-text-muted">TRL: 4</div>
          <div className="text-text-muted">Connections: 12</div>
          <div className="text-text-muted">Last Updated: —</div>
        </div>
      </div>
    </div>
  );
}
