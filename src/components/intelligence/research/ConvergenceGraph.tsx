"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface Node extends d3.SimulationNodeDatum {
  id: string;
  domain: string;
  velocity: number;
  citations?: number;
  citationsTotal?: number;
  patentOverlap?: string;
  fundingOverlap?: string;
  semanticSimilarity?: string;
  confidence?: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  strength: number;
}

const DEFAULT_NODES: Node[] = [
  { id: "LLM Orchestration", domain: "AI", velocity: 0.85, citations: 1240, citationsTotal: 4500, patentOverlap: "High (85% across 14 assignees)", fundingOverlap: "$420M (6 programs, FY24-26)", semanticSimilarity: "0.92 cosine", confidence: "High" },
  { id: "Synthetic Biology", domain: "Bio", velocity: 0.45, citations: 850, citationsTotal: 2100, patentOverlap: "Medium (45% across 8 assignees)", fundingOverlap: "$150M (3 programs, FY24-25)", semanticSimilarity: "0.65 cosine", confidence: "Moderate" },
  { id: "Graphene Composites", domain: "Materials", velocity: 0.35, citations: 420, citationsTotal: 1800, patentOverlap: "Low (15% across 3 assignees)", fundingOverlap: "$80M (2 programs, FY25-26)", semanticSimilarity: "0.42 cosine", confidence: "Low" },
  { id: "Quantum Sensing", domain: "Quantum", velocity: 0.55, citations: 610, citationsTotal: 1500, patentOverlap: "Medium (60% across 5 assignees)", fundingOverlap: "$210M (4 programs, FY24-26)", semanticSimilarity: "0.78 cosine", confidence: "Moderate" },
  { id: "Hall Effect Thrusters", domain: "Propulsion", velocity: 0.25, citations: 210, citationsTotal: 900, patentOverlap: "Low (5% across 2 assignees)", fundingOverlap: "$40M (1 program, FY25)", semanticSimilarity: "0.30 cosine", confidence: "Low" },
  { id: "Autonomous Swarms", domain: "AI", velocity: 0.75, citations: 980, citationsTotal: 3200, patentOverlap: "High (78% across 11 assignees)", fundingOverlap: "$350M (5 programs, FY24-26)", semanticSimilarity: "0.88 cosine", confidence: "High" },
  { id: "Cryogenic Computing", domain: "Quantum", velocity: 0.40, citations: 320, citationsTotal: 1100, patentOverlap: "Low (20% across 4 assignees)", fundingOverlap: "$95M (2 programs, FY24-25)", semanticSimilarity: "0.55 cosine", confidence: "Moderate" },
  { id: "Point-of-Care Diagnostics", domain: "Bio", velocity: 0.65, citations: 1100, citationsTotal: 2900, patentOverlap: "High (70% across 9 assignees)", fundingOverlap: "$280M (4 programs, FY24-26)", semanticSimilarity: "0.82 cosine", confidence: "High" },
];

const DEFAULT_LINKS: Link[] = [
  { source: "LLM Orchestration", target: "Autonomous Swarms", strength: 0.8 },
  { source: "Synthetic Biology", target: "Graphene Composites", strength: 0.4 },
  { source: "Quantum Sensing", target: "Autonomous Swarms", strength: 0.2 },
  { source: "Cryogenic Computing", target: "Quantum Sensing", strength: 0.7 },
  { source: "Cryogenic Computing", target: "Hall Effect Thrusters", strength: 0.1 },
  { source: "LLM Orchestration", target: "Point-of-Care Diagnostics", strength: 0.3 },
  { source: "Synthetic Biology", target: "Point-of-Care Diagnostics", strength: 0.9 },
  { source: "Graphene Composites", target: "Cryogenic Computing", strength: 0.5 },
];

const DOMAIN_COLORS: Record<string, string> = {
  AI: "var(--accent-deep)",
  Bio: "#5B8C5A",
  Materials: "#8C7A5B",
  Quantum: "#5B6A8C",
  Propulsion: "#8C5B5B",
};

const DOMAIN_SWATCH_CLASSES: Record<string, string> = {
  AI: "bg-[var(--accent-deep)]",
  Bio: "bg-[#5B8C5A]",
  Materials: "bg-[#8C7A5B]",
  Quantum: "bg-[#5B6A8C]",
  Propulsion: "bg-[#8C5B5B]",
};

export function ConvergenceGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 760;
    const height = 400;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const container = svg.append("g");

    // Force simulation
    const simulation = d3.forceSimulation<Node>(DEFAULT_NODES)
      .force("link", d3.forceLink<Node, Link>(DEFAULT_LINKS).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(40));

    // Links
    const link = container.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(DEFAULT_LINKS)
      .enter().append("line")
      .attr("stroke", "var(--border-soft)")
      .attr("stroke-width", d => ((d as Link).strength || 0) * 4)
      .attr("stroke-opacity", 0.4);

    // Nodes
    const node = container.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(DEFAULT_NODES)
      .enter().append("g")
      .style("cursor", "pointer")
      .on("mouseenter", (e, d) => setHoveredNode(d.id))
      .on("mouseleave", () => setHoveredNode(null))
      .on("click", (e, d) => {
        setSelectedNode(d as Node);
      });

    // Node circles
    node.append("circle")
      .attr("r", d => 4 + d.velocity * 12)
      .attr("fill", d => DOMAIN_COLORS[d.domain] || "var(--ink-muted)")
      .attr("stroke", "var(--ink-primary)")
      .attr("stroke-width", 0.5)
      .attr("fill-opacity", 0.85);

    // Node labels
    node.append("text")
      .attr("dy", d => 12 + d.velocity * 12)
      .attr("text-anchor", "middle")
      .attr("font-family", "var(--font-mono)")
      .attr("font-size", "9px")
      .attr("fill", "var(--ink-secondary)")
      .text(d => d.id);

    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as Node).x!)
        .attr("y1", d => (d.source as Node).y!)
        .attr("x2", d => (d.target as Node).x!)
        .attr("y2", d => (d.target as Node).y!);

      node
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // Zooming
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 4])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });

    svg.call(zoom);

  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[var(--border-soft)] pb-4">
        <div className="space-y-1">
          <h3 className="text-[10px] uppercase tracking-[0.05em] font-semibold text-[var(--ink-secondary)]">
            Technology Convergence Network
          </h3>
          <p className="text-[9px] text-[var(--ink-muted)] font-mono">
            Node: Tech Intensity (Velocity) | Edge: Cross-Domain Citation Strength
          </p>
        </div>
        <div className="flex gap-4 text-[8px] font-mono uppercase tracking-tighter">
          {Object.entries(DOMAIN_COLORS).map(([domain]) => (
            <div key={domain} className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${DOMAIN_SWATCH_CLASSES[domain] || "bg-[var(--ink-muted)]"}`} />
              <span className="text-[var(--ink-tertiary)]">{domain}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="relative bg-[var(--ink-ghost)] rounded-sm overflow-hidden border border-[var(--border-soft)]">
        <svg 
          ref={svgRef} 
          width="100%" 
          height="400" 
          viewBox="0 0 760 400"
          className="w-full h-auto"
        />
        
        {hoveredNode && (
          <div className="absolute top-4 right-4 bg-[var(--background)] border border-[var(--border-soft)] p-3 shadow-sm font-mono text-[9px] animate-in fade-in slide-in-from-right-2">
            <div className="font-bold text-[var(--ink-primary)] mb-1 uppercase">{hoveredNode}</div>
            <div className="text-[var(--ink-muted)]">
              Velocity Index: {(DEFAULT_NODES.find(n => n.id === hoveredNode)?.velocity || 0).toFixed(2)}
            </div>
            <div className="text-[var(--ink-muted)]">
              Domain: {DEFAULT_NODES.find(n => n.id === hoveredNode)?.domain}
            </div>
          </div>
        )}
        {/* Side Panel (Evidence Drilldown) */}
        {selectedNode && (
          <div className="absolute top-0 right-0 h-full w-[300px] bg-[var(--background)] border-l border-[var(--border-subtle)] transition-transform duration-200 ease-in-out transform translate-x-0">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--ink-ghost)]">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-serif text-[14px] text-[var(--ink-primary)]">
                    Convergence Analysis
                  </h4>
                  <button 
                    onClick={() => setSelectedNode(null)}
                    className="text-[var(--ink-muted)] hover:text-[var(--ink-primary)] font-mono text-[10px]"
                  >
                    [CLOSE]
                  </button>
                </div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-tertiary)] flex items-center gap-2 mb-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${DOMAIN_SWATCH_CLASSES[selectedNode.domain] || "bg-[var(--ink-muted)]"}`} />
                  {selectedNode.id}
                </div>
                <div className="font-mono text-[8px] text-[var(--ink-muted)] uppercase tracking-wider">
                  Last Recomputed: MAR 2026 14:32 UTC
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 overflow-y-auto space-y-6 flex flex-col">
                <div>
                  <h5 className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink-tertiary)] mb-3">
                    Evidence Composition
                  </h5>
                  <div className="space-y-3 font-mono text-[10px] text-[var(--ink-primary)]">
                    <div className="flex flex-col gap-1 border-b border-dotted border-[var(--border-soft)] pb-2">
                      <span className="text-[var(--ink-secondary)]">Shared Citations</span>
                      <span>
                        {selectedNode.citations?.toLocaleString() || "N/A"}{" "}
                        <span className="text-[var(--ink-muted)]">
                          (of {selectedNode.citationsTotal?.toLocaleString() || "N/A"} total)
                        </span>
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 border-b border-dotted border-[var(--border-soft)] pb-2">
                      <span className="text-[var(--ink-secondary)]">Patent Co-assignment</span>
                      <span>{selectedNode.patentOverlap || "N/A"}</span>
                    </div>
                    <div className="flex flex-col gap-1 border-b border-dotted border-[var(--border-soft)] pb-2">
                      <span className="text-[var(--ink-secondary)]">Funding Overlap</span>
                      <span>{selectedNode.fundingOverlap || "N/A"}</span>
                    </div>
                    <div className="flex flex-col gap-1 pb-2">
                      <span className="text-[var(--ink-secondary)]">Semantic Similarity</span>
                      <span>{selectedNode.semanticSimilarity || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-6">
                  <h5 className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink-tertiary)] mb-3">
                    Convergence Confidence
                  </h5>
                  <div className="font-mono text-[10px] text-[var(--ink-primary)] p-3 bg-[var(--ink-ghost)] border border-[var(--border-subtle)]">
                    {selectedNode.confidence || "N/A"}
                  </div>
                </div>
              </div>
              
              {/* Footer Anchor */}
              <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--ink-ghost)]">
                <div className="font-mono text-[8px] text-[var(--ink-muted)]">
                  Scale: Low (&lt;0.4) | Moderate (0.4–0.7) | High (&gt;0.7)
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
