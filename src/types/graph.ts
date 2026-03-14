/**
 * Knowledge Graph Data Contracts
 * Formal graph structure for technology intelligence
 */

/** Node types in the knowledge graph */
/** Node types in the knowledge graph */
export type NodeType = 
  | "technology" 
  | "domain" 
  | "organization"
  | "material"
  | "capability"
  | "concept";

/** Edge relationship types */
export type EdgeType = 
  | "enables" 
  | "depends" 
  | "converges"
  | "prerequisite"
  | "enhancement"
  | "component"
  | "enabler"
  | "developer"
  | "collaborator"
  | "researcher";

/** A node in the knowledge graph */
export interface GraphNode {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Node category */
  type: NodeType;
  /** X position (for static layout) */
  x?: number;
  /** Y position (for static layout) */
  y?: number;
  /** TRL if applicable (for technology nodes) */
  trl?: number;
  /** Year first observed in sources */
  firstSeen?: number;
  /** Year of last update */
  lastUpdated?: number;
  /** Domain tags */
  domains?: string[];
  /** Operational status */
  status?: string;
  /** Strategic value (0-100) */
  value?: number;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/** An edge in the knowledge graph */
export interface GraphEdge {
  /** Unique identifier */
  id: string;
  /** Source node ID */
  source: string;
  /** Target node ID */
  target: string;
  /** Relationship type */
  type: EdgeType;
  /** Confidence in relationship (0-1) */
  confidence: number;
  /** Strength/Value of relationship (0-100) */
  value?: number;
  /** Source references for this relationship */
  evidence?: string[];
  /** Year relationship established */
  since?: number;
}

/** Complete graph data */
export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/** Relationship summary for a node */
export interface RelationshipSummary {
  nodeId: string;
  nodeLabel: string;
  enables: number;
  dependsOn: number;
  convergesWith: number;
  totalConnections: number;
  connectedDomains: string[];
  connectedOrganizations: string[];
}

/** Visual configuration for node types */
export const NODE_STYLES: Record<NodeType, { color: string; shape: string }> = {
  technology: { color: "#0ea5e9", shape: "circle" },
  domain: { color: "#64748b", shape: "hexagon" },
  organization: { color: "#0ea5e980", shape: "rect" },
  material: { color: "#a855f7", shape: "circle" },
  capability: { color: "#f43f5e", shape: "diamond" },
  concept: { color: "#10b981", shape: "diamond" },
};

/** Visual configuration for edge types */
export const EDGE_STYLES: Record<EdgeType, { stroke: string; dasharray: string }> = {
  enables: { stroke: "#0ea5e9", dasharray: "none" },
  depends: { stroke: "#64748b", dasharray: "4 2" },
  converges: { stroke: "#f59e0b", dasharray: "none" },
  prerequisite: { stroke: "#ef4444", dasharray: "none" },
  enhancement: { stroke: "#0ea5e9", dasharray: "2 2" },
  component: { stroke: "#64748b", dasharray: "1 1" },
  enabler: { stroke: "#22c55e", dasharray: "none" },
  developer: { stroke: "#8b5cf6", dasharray: "4 2" },
  collaborator: { stroke: "#8b5cf6", dasharray: "2 2" },
  researcher: { stroke: "#8b5cf6", dasharray: "1 2" },
};
