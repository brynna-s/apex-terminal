import { describe, it, expect } from "vitest";
import { severEdgeAndSpawnConsequences } from "@/lib/intervention-engine";
import { makeNode, makeEdge, makeGraph } from "./fixtures/graph-fixtures";

function interventionGraph(domain = "EUV Lithography") {
  const nodes = [
    makeNode({ id: "A", category: "manufacturing", domain }),
    makeNode({ id: "B", category: "infrastructure", domain: "AI Compute" }),
    makeNode({ id: "C", category: "energy", domain: "Energy Grid" }),
  ];
  const edges = [
    makeEdge({ id: "e_AB", source: "A", target: "B", physicalMechanism: "constrains supply" }),
    makeEdge({ id: "e_BC", source: "B", target: "C" }),
  ];
  return makeGraph(nodes, edges);
}

describe("severEdgeAndSpawnConsequences", () => {
  it("marks the target edge as severed (do-calculus: sever incoming)", () => {
    const graph = interventionGraph();
    const result = severEdgeAndSpawnConsequences(graph, "e_AB");
    const severed = result.edges.find((e) => e.id === "e_AB");
    expect(severed?.isSevered).toBe(true);
  });

  it("spawns consequence nodes from domain template", () => {
    const graph = interventionGraph("EUV Lithography");
    const result = severEdgeAndSpawnConsequences(graph, "e_AB");
    const consequences = result.nodes.filter((n) => n.isConsequence);
    expect(consequences.length).toBe(2); // EUV has 2 templates
    expect(consequences[0].consequenceOf).toBe("e_AB");
  });

  it("consequence node IDs follow pattern consequence_N", () => {
    const graph = interventionGraph();
    const result = severEdgeAndSpawnConsequences(graph, "e_AB");
    const consequences = result.nodes.filter((n) => n.isConsequence);
    for (const c of consequences) {
      expect(c.id).toMatch(/^consequence_\d+$/);
    }
  });

  it("creates consequence edges pointing to the severed edge target", () => {
    const graph = interventionGraph();
    const result = severEdgeAndSpawnConsequences(graph, "e_AB");
    const cEdges = result.edges.filter((e) => e.isConsequenceEdge);
    expect(cEdges.length).toBe(2);
    for (const ce of cEdges) {
      expect(ce.target).toBe("B"); // target of severed edge
      expect(ce.weight).toBe(0.8);
    }
  });

  it("consequence edges have confidence 0.7", () => {
    const graph = interventionGraph();
    const result = severEdgeAndSpawnConsequences(graph, "e_AB");
    const cEdges = result.edges.filter((e) => e.isConsequenceEdge);
    for (const ce of cEdges) {
      expect(ce.confidence).toBe(0.7);
    }
  });

  it("uses default consequences for unknown domains", () => {
    const graph = interventionGraph("Unknown Domain");
    const result = severEdgeAndSpawnConsequences(graph, "e_AB");
    const consequences = result.nodes.filter((n) => n.isConsequence);
    expect(consequences.length).toBe(2); // default fallback has 2
    expect(consequences[0].label).toBe("Emergent Disruption Risk");
  });

  it("returns graph unchanged for non-existent edge ID", () => {
    const graph = interventionGraph();
    const result = severEdgeAndSpawnConsequences(graph, "nonexistent");
    expect(result.nodes).toEqual(graph.nodes);
    expect(result.edges).toEqual(graph.edges);
  });

  it("updates metadata node and edge counts", () => {
    const graph = interventionGraph();
    const result = severEdgeAndSpawnConsequences(graph, "e_AB");
    expect(result.metadata.totalNodes).toBe(graph.nodes.length + 2);
    expect(result.metadata.totalEdges).toBe(graph.edges.length + 2);
  });

  it("consequence nodes inherit source node domain", () => {
    const graph = interventionGraph("Rare Earth");
    const result = severEdgeAndSpawnConsequences(graph, "e_AB");
    const consequences = result.nodes.filter((n) => n.isConsequence);
    for (const c of consequences) {
      expect(c.domain).toBe("Rare Earth");
    }
  });

  it("consequence edge physicalMechanism references original mechanism", () => {
    const graph = interventionGraph();
    const result = severEdgeAndSpawnConsequences(graph, "e_AB");
    const cEdges = result.edges.filter((e) => e.isConsequenceEdge);
    for (const ce of cEdges) {
      expect(ce.physicalMechanism).toContain("constrains supply");
    }
  });
});
