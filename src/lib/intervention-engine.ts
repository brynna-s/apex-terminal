import {
  CausalGraph,
  CausalNode,
  CausalEdge,
  OmegaFragilityProfile,
} from "./types";

// ─── Consequence Templates by Domain ──────────────────────────────
const CONSEQUENCE_TEMPLATES: Record<string, { label: string; shortLabel: string; category: CausalNode["category"]; omega: OmegaFragilityProfile }[]> = {
  "EUV Lithography": [
    { label: "Supply Gap: TSMC", shortLabel: "SG-T", category: "manufacturing", omega: { composite: 8.5, substitutionFriction: 8.0, downstreamLoad: 9.0, cascadingVoltage: 8.5, existentialTailWeight: 8.2 } },
    { label: "Restructuring Risk: TSMC", shortLabel: "RR-T", category: "economic", omega: { composite: 7.8, substitutionFriction: 7.0, downstreamLoad: 8.5, cascadingVoltage: 7.8, existentialTailWeight: 7.5 } },
  ],
  "Undersea Cables": [
    { label: "Connectivity Collapse Risk", shortLabel: "CCR", category: "communications", omega: { composite: 9.0, substitutionFriction: 8.5, downstreamLoad: 9.2, cascadingVoltage: 9.0, existentialTailWeight: 8.8 } },
    { label: "Latency Cascade Event", shortLabel: "LCE", category: "communications", omega: { composite: 7.5, substitutionFriction: 7.0, downstreamLoad: 8.0, cascadingVoltage: 7.5, existentialTailWeight: 7.2 } },
  ],
  "Rare Earth": [
    { label: "Material Shortage Cascade", shortLabel: "MSC", category: "manufacturing", omega: { composite: 9.2, substitutionFriction: 9.0, downstreamLoad: 9.3, cascadingVoltage: 9.0, existentialTailWeight: 9.1 } },
    { label: "Geopolitical Escalation Risk", shortLabel: "GER", category: "geopolitical", omega: { composite: 8.0, substitutionFriction: 7.5, downstreamLoad: 8.5, cascadingVoltage: 8.0, existentialTailWeight: 7.8 } },
  ],
  "HVDC Power": [
    { label: "Grid Decoupling Risk", shortLabel: "GDR", category: "energy", omega: { composite: 8.8, substitutionFriction: 8.5, downstreamLoad: 9.0, cascadingVoltage: 8.8, existentialTailWeight: 8.5 } },
    { label: "Power Imbalance Cascade", shortLabel: "PIC", category: "energy", omega: { composite: 7.2, substitutionFriction: 7.0, downstreamLoad: 7.5, cascadingVoltage: 7.2, existentialTailWeight: 7.0 } },
  ],
  "AI Compute": [
    { label: "Compute Scarcity Shock", shortLabel: "CSS", category: "infrastructure", omega: { composite: 9.5, substitutionFriction: 9.2, downstreamLoad: 9.5, cascadingVoltage: 9.3, existentialTailWeight: 9.4 } },
    { label: "AI Capex Crunch", shortLabel: "ACC", category: "economic", omega: { composite: 8.2, substitutionFriction: 7.5, downstreamLoad: 8.8, cascadingVoltage: 8.0, existentialTailWeight: 8.0 } },
  ],
  "Fertilizer": [
    { label: "Food Security Crisis", shortLabel: "FSC", category: "agriculture", omega: { composite: 9.3, substitutionFriction: 9.0, downstreamLoad: 9.5, cascadingVoltage: 9.2, existentialTailWeight: 9.3 } },
    { label: "Agricultural Price Shock", shortLabel: "APS", category: "agriculture", omega: { composite: 7.8, substitutionFriction: 7.2, downstreamLoad: 8.0, cascadingVoltage: 7.5, existentialTailWeight: 7.8 } },
  ],
  "Data Centers": [
    { label: "Cloud Outage Cascade", shortLabel: "COC", category: "infrastructure", omega: { composite: 9.0, substitutionFriction: 8.5, downstreamLoad: 9.2, cascadingVoltage: 9.0, existentialTailWeight: 8.8 } },
    { label: "Thermal Limit Breach", shortLabel: "TLB", category: "infrastructure", omega: { composite: 7.5, substitutionFriction: 7.0, downstreamLoad: 7.8, cascadingVoltage: 7.5, existentialTailWeight: 7.2 } },
  ],
  "Dollar Funding": [
    { label: "Liquidity Freeze Event", shortLabel: "LFE", category: "finance", omega: { composite: 9.4, substitutionFriction: 8.8, downstreamLoad: 9.5, cascadingVoltage: 9.4, existentialTailWeight: 9.3 } },
    { label: "Credit Contagion Risk", shortLabel: "CCR-F", category: "finance", omega: { composite: 8.0, substitutionFriction: 7.5, downstreamLoad: 8.5, cascadingVoltage: 8.0, existentialTailWeight: 7.8 } },
  ],
  "Geopolitical": [
    { label: "Sanctions Escalation", shortLabel: "SE", category: "geopolitical", omega: { composite: 8.5, substitutionFriction: 7.5, downstreamLoad: 9.0, cascadingVoltage: 8.5, existentialTailWeight: 8.2 } },
    { label: "Trade Route Disruption", shortLabel: "TRD", category: "geopolitical", omega: { composite: 7.8, substitutionFriction: 7.0, downstreamLoad: 8.5, cascadingVoltage: 7.8, existentialTailWeight: 7.5 } },
  ],
  "Energy Grid": [
    { label: "Frequency Instability Event", shortLabel: "FIE", category: "energy", omega: { composite: 9.0, substitutionFriction: 8.5, downstreamLoad: 9.2, cascadingVoltage: 9.0, existentialTailWeight: 8.8 } },
    { label: "Blackout Cascade Risk", shortLabel: "BCR", category: "energy", omega: { composite: 8.5, substitutionFriction: 8.0, downstreamLoad: 9.0, cascadingVoltage: 8.5, existentialTailWeight: 8.2 } },
  ],
};

// Default fallback
const DEFAULT_CONSEQUENCES = [
  { label: "Emergent Disruption Risk", shortLabel: "EDR", category: "economic" as const, omega: { composite: 8.0, substitutionFriction: 7.5, downstreamLoad: 8.5, cascadingVoltage: 8.0, existentialTailWeight: 7.8 } },
  { label: "Cascade Amplification", shortLabel: "CA", category: "economic" as const, omega: { composite: 7.5, substitutionFriction: 7.0, downstreamLoad: 8.0, cascadingVoltage: 7.5, existentialTailWeight: 7.2 } },
];

let consequenceCounter = 0;

export function severEdgeAndSpawnConsequences(
  graph: CausalGraph,
  edgeId: string
): CausalGraph {
  const edge = graph.edges.find((e) => e.id === edgeId);
  if (!edge) return graph;

  const sourceNode = graph.nodes.find((n) => n.id === edge.source);
  const targetNode = graph.nodes.find((n) => n.id === edge.target);
  if (!sourceNode || !targetNode) return graph;

  // Mark edge as severed
  const updatedEdges: CausalEdge[] = graph.edges.map((e) =>
    e.id === edgeId ? { ...e, isSevered: true } : e
  );

  // Pick consequence templates from domain
  const domain = sourceNode.domain;
  const templates = CONSEQUENCE_TEMPLATES[domain] ?? DEFAULT_CONSEQUENCES;

  // Create consequence nodes
  const newNodes: CausalNode[] = templates.map((tmpl) => {
    consequenceCounter++;
    const id = `consequence_${consequenceCounter}`;
    return {
      id,
      label: tmpl.label,
      shortLabel: tmpl.shortLabel,
      category: tmpl.category,
      omegaFragility: tmpl.omega,
      globalConcentration: "Emergent — consequence of intervention",
      replacementTime: "Unknown",
      domain: sourceNode.domain,
      discoverySource: "merged" as const,
      isConfounded: false,
      isRestricted: false,
      isConsequence: true,
      consequenceOf: edgeId,
    };
  });

  // Create consequence edges from new nodes to the severed edge's target
  const newEdges: CausalEdge[] = newNodes.map((cNode) => ({
    id: `ce_${cNode.id}`,
    source: cNode.id,
    target: edge.target,
    weight: 0.8,
    lag: 0,
    type: "directed" as const,
    confidence: 0.7,
    isInconsistent: false,
    physicalMechanism: `emergent risk from severing ${edge.physicalMechanism}`,
    isConsequenceEdge: true,
  }));

  const allNodes = [...graph.nodes, ...newNodes];
  const allEdges = [...updatedEdges, ...newEdges];

  return {
    nodes: allNodes,
    edges: allEdges,
    metadata: {
      ...graph.metadata,
      totalNodes: allNodes.length,
      totalEdges: allEdges.length,
    },
  };
}
