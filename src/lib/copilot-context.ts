import { CausalGraph, CausalNode, CausalEdge } from "./types";

interface ContextOptions {
  selectedNode: string | null;
  severedEdges: string[];
  shocks: { id: string; name: string; severity: number; category: string }[];
  interventionMode: boolean;
  interventionTarget: string | null;
  ablationMode?: boolean;
  ablatedNodeIds?: string[];
  ablatedEdgeIds?: string[];
}

const MAX_ADJACENCY_NODES = 30;

function serializeNode(n: CausalNode): string {
  return (
    `${n.label} [${n.id}] — domain:${n.domain} cat:${n.category} ` +
    `Ω:${n.omegaFragility.composite.toFixed(1)} ` +
    `(sub:${n.omegaFragility.substitutionFriction.toFixed(1)} ` +
    `load:${n.omegaFragility.downstreamLoad.toFixed(1)} ` +
    `casc:${n.omegaFragility.cascadingVoltage.toFixed(1)} ` +
    `tail:${n.omegaFragility.existentialTailWeight.toFixed(1)}) ` +
    `conc:"${n.globalConcentration}" repl:"${n.replacementTime}"` +
    (n.isConfounded ? " [CONFOUNDED]" : "") +
    (n.isRestricted ? " [TARSKI-RESTRICTED]" : "")
  );
}

function serializeEdge(e: CausalEdge, nodes: CausalNode[]): string {
  const src = nodes.find((n) => n.id === e.source);
  const tgt = nodes.find((n) => n.id === e.target);
  return (
    `${src?.shortLabel ?? e.source} → ${tgt?.shortLabel ?? e.target} ` +
    `[${e.id}] w:${e.weight.toFixed(2)} lag:${e.lag} type:${e.type} ` +
    `conf:${e.confidence.toFixed(2)} mech:"${e.physicalMechanism}"` +
    (e.isInconsistent ? " [INCONSISTENT]" : "") +
    (e.isSevered ? " [SEVERED]" : "")
  );
}

export function serializeGraphContext(
  graph: CausalGraph,
  opts: ContextOptions
): string {
  const lines: string[] = [];

  // Graph metadata
  lines.push("=== GRAPH METADATA ===");
  lines.push(
    `Nodes: ${graph.metadata.totalNodes} | Edges: ${graph.metadata.totalEdges} | ` +
      `Density: ${graph.metadata.density.toFixed(3)} | ` +
      `Verification: ${graph.metadata.verificationStatus} | ` +
      `Discovery: ${graph.metadata.constraintType}`
  );
  lines.push(
    `Inconsistent edges: ${graph.metadata.inconsistentEdges} | ` +
      `Restricted nodes: ${graph.metadata.restrictedNodes}`
  );

  // Selected node detail
  if (opts.selectedNode) {
    const node = graph.nodes.find((n) => n.id === opts.selectedNode);
    if (node) {
      lines.push("");
      lines.push("=== SELECTED NODE ===");
      lines.push(serializeNode(node));
      const inEdges = graph.edges.filter((e) => e.target === node.id);
      const outEdges = graph.edges.filter((e) => e.source === node.id);
      if (inEdges.length > 0) {
        lines.push(
          `Upstream (${inEdges.length}): ${inEdges.map((e) => graph.nodes.find((n) => n.id === e.source)?.shortLabel ?? e.source).join(", ")}`
        );
      }
      if (outEdges.length > 0) {
        lines.push(
          `Downstream (${outEdges.length}): ${outEdges.map((e) => graph.nodes.find((n) => n.id === e.target)?.shortLabel ?? e.target).join(", ")}`
        );
      }
    }
  }

  // Adjacency summary (truncated for large graphs)
  lines.push("");
  lines.push("=== NODES (by Ω-Fragility) ===");
  const sorted = [...graph.nodes].sort(
    (a, b) => b.omegaFragility.composite - a.omegaFragility.composite
  );

  // If graph is small enough, show all; otherwise show top-N + selected node's neighborhood
  let nodesToShow: CausalNode[];
  if (sorted.length <= MAX_ADJACENCY_NODES) {
    nodesToShow = sorted;
  } else {
    const topN = sorted.slice(0, 20);
    const neighborIds = new Set<string>();
    if (opts.selectedNode) {
      graph.edges.forEach((e) => {
        if (e.source === opts.selectedNode) neighborIds.add(e.target);
        if (e.target === opts.selectedNode) neighborIds.add(e.source);
      });
    }
    const neighbors = graph.nodes.filter(
      (n) => neighborIds.has(n.id) && !topN.find((t) => t.id === n.id)
    );
    nodesToShow = [...topN, ...neighbors];
    lines.push(
      `(Showing top 20 + selected neighborhood — ${sorted.length - nodesToShow.length} nodes omitted)`
    );
  }

  nodesToShow.forEach((n) => lines.push(serializeNode(n)));

  // Edges
  lines.push("");
  lines.push("=== EDGES ===");
  graph.edges.forEach((e) => lines.push(serializeEdge(e, graph.nodes)));

  // Severed edges
  if (opts.severedEdges.length > 0) {
    lines.push("");
    lines.push("=== SEVERED EDGES (Pearl link break) ===");
    opts.severedEdges.forEach((eid) => {
      const edge = graph.edges.find((e) => e.id === eid);
      if (edge) lines.push(serializeEdge(edge, graph.nodes));
      else lines.push(eid);
    });
  }

  // Active shocks
  if (opts.shocks.length > 0) {
    lines.push("");
    lines.push("=== ACTIVE SHOCKS ===");
    opts.shocks.forEach((s) =>
      lines.push(`${s.name} [${s.id}] severity:${s.severity} cat:${s.category}`)
    );
  }

  // Intervention
  if (opts.interventionMode) {
    lines.push("");
    lines.push("=== INTERVENTION MODE ACTIVE ===");
    if (opts.interventionTarget) {
      const tgt = graph.nodes.find((n) => n.id === opts.interventionTarget);
      lines.push(`Target: ${tgt?.label ?? opts.interventionTarget}`);
    } else {
      lines.push("No target selected yet.");
    }
  }

  // Ablation
  if (opts.ablationMode && ((opts.ablatedNodeIds?.length ?? 0) > 0 || (opts.ablatedEdgeIds?.length ?? 0) > 0)) {
    lines.push("");
    lines.push("=== ABLATION MODE ACTIVE ===");
    if (opts.ablatedNodeIds && opts.ablatedNodeIds.length > 0) {
      const ablatedLabels = opts.ablatedNodeIds.map((id) => {
        const node = graph.nodes.find((n) => n.id === id);
        return node ? `${node.label} [${id}]` : id;
      });
      lines.push(`Ablated nodes (${opts.ablatedNodeIds.length}): ${ablatedLabels.join(", ")}`);
    }
    if (opts.ablatedEdgeIds && opts.ablatedEdgeIds.length > 0) {
      lines.push(`Ablated edges (${opts.ablatedEdgeIds.length}): ${opts.ablatedEdgeIds.join(", ")}`);
    }
    // Post-ablation metrics
    const remainingNodes = graph.nodes.filter((n) => !opts.ablatedNodeIds?.includes(n.id));
    const remainingEdges = graph.edges.filter(
      (e) => !opts.ablatedEdgeIds?.includes(e.id) && !opts.ablatedNodeIds?.includes(e.source) && !opts.ablatedNodeIds?.includes(e.target)
    );
    lines.push(`Post-ablation: ${remainingNodes.length} nodes, ${remainingEdges.length} edges`);
  }

  return lines.join("\n");
}
