import { CausalGraph } from "./types";
import { computeCascadeAnalysis } from "./omega-engine";

export interface AblationMetrics {
  nodeCount: number;
  edgeCount: number;
  density: number;
  lambdaMax: number;
  isStable: boolean;
  meanOmega: number;
  maxOmega: number;
  affectedNodes: string[];
  structuralIntegrity: number; // 0-100
}

export interface AblationComparison {
  before: AblationMetrics;
  after: AblationMetrics;
  deltas: {
    nodeCount: number;
    edgeCount: number;
    density: number;
    lambdaMax: number;
    stability: string; // "STABLE→UNSTABLE", etc.
    meanOmega: number;
    maxOmega: number;
    structuralIntegrityPct: number;
  };
}

export function computeAblatedGraph(
  graph: CausalGraph,
  ablatedNodeIds: string[],
  ablatedEdgeIds: string[]
): CausalGraph {
  const nodeIdSet = new Set(ablatedNodeIds);
  const edgeIdSet = new Set(ablatedEdgeIds);

  const nodes = graph.nodes.filter((n) => !nodeIdSet.has(n.id));
  // Remove explicitly ablated edges + any edges connected to ablated nodes
  const edges = graph.edges.filter(
    (e) => !edgeIdSet.has(e.id) && !nodeIdSet.has(e.source) && !nodeIdSet.has(e.target)
  );

  const density = nodes.length > 1 ? edges.length / (nodes.length * (nodes.length - 1)) : 0;

  return {
    nodes,
    edges,
    metadata: {
      ...graph.metadata,
      totalNodes: nodes.length,
      totalEdges: edges.length,
      density,
    },
  };
}

function computeMetrics(graph: CausalGraph, ablatedNodeIds: string[]): AblationMetrics {
  const cascade = computeCascadeAnalysis(graph);
  const omegas = graph.nodes.map((n) => n.omegaFragility.composite);
  const meanOmega = omegas.length > 0 ? omegas.reduce((s, v) => s + v, 0) / omegas.length : 0;
  const maxOmega = omegas.length > 0 ? Math.max(...omegas) : 0;
  const density = graph.nodes.length > 1
    ? graph.edges.length / (graph.nodes.length * (graph.nodes.length - 1))
    : 0;

  // Structural integrity: ratio of remaining structure
  const integrity = graph.nodes.length > 0 ? 100 : 0;

  return {
    nodeCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    density,
    lambdaMax: cascade.lambdaMax,
    isStable: cascade.isStable,
    meanOmega: Math.round(meanOmega * 100) / 100,
    maxOmega: Math.round(maxOmega * 100) / 100,
    affectedNodes: ablatedNodeIds,
    structuralIntegrity: integrity,
  };
}

export function computeAblationComparison(
  graph: CausalGraph,
  ablatedNodeIds: string[],
  ablatedEdgeIds: string[]
): AblationComparison {
  const beforeMetrics = computeMetrics(graph, []);

  const ablatedGraph = computeAblatedGraph(graph, ablatedNodeIds, ablatedEdgeIds);
  const afterMetrics = computeMetrics(ablatedGraph, ablatedNodeIds);

  // Structural integrity delta: how much of the original graph remains
  const integrityPct = beforeMetrics.nodeCount > 0
    ? Math.round(((afterMetrics.nodeCount / beforeMetrics.nodeCount) * 100 - 100) * 100) / 100
    : 0;

  const stabilityBefore = beforeMetrics.isStable ? "STABLE" : "UNSTABLE";
  const stabilityAfter = afterMetrics.isStable ? "STABLE" : "UNSTABLE";
  const stabilityDelta = stabilityBefore === stabilityAfter
    ? stabilityAfter
    : `${stabilityBefore}\u2192${stabilityAfter}`;

  return {
    before: beforeMetrics,
    after: afterMetrics,
    deltas: {
      nodeCount: afterMetrics.nodeCount - beforeMetrics.nodeCount,
      edgeCount: afterMetrics.edgeCount - beforeMetrics.edgeCount,
      density: Math.round((afterMetrics.density - beforeMetrics.density) * 1000) / 1000,
      lambdaMax: Math.round((afterMetrics.lambdaMax - beforeMetrics.lambdaMax) * 100) / 100,
      stability: stabilityDelta,
      meanOmega: Math.round((afterMetrics.meanOmega - beforeMetrics.meanOmega) * 100) / 100,
      maxOmega: Math.round((afterMetrics.maxOmega - beforeMetrics.maxOmega) * 100) / 100,
      structuralIntegrityPct: integrityPct,
    },
  };
}
