import { describe, it, expect } from "vitest";
import { mergeGraphs } from "@/lib/import/merge";
import { makeGraph, makeNode, makeEdge } from "../fixtures/graph-fixtures";

describe("mergeGraphs", () => {
  it("merges new nodes and edges into existing graph", () => {
    const existing = makeGraph(
      [makeNode({ id: "a" })],
      []
    );
    const incoming = {
      nodes: [makeNode({ id: "b" })],
      edges: [makeEdge({ id: "e1", source: "a", target: "b" })],
    };
    const { graph, result } = mergeGraphs(existing, incoming);
    expect(graph.nodes).toHaveLength(2);
    expect(graph.edges).toHaveLength(1);
    expect(result.addedNodes).toBe(1);
    expect(result.addedEdges).toBe(1);
  });

  it("skips duplicate nodes by ID", () => {
    const existing = makeGraph([makeNode({ id: "a" })], []);
    const incoming = {
      nodes: [makeNode({ id: "a" }), makeNode({ id: "b" })],
      edges: [],
    };
    const { graph, result } = mergeGraphs(existing, incoming);
    expect(graph.nodes).toHaveLength(2);
    expect(result.skippedNodes).toEqual(["a"]);
    expect(result.addedNodes).toBe(1);
  });

  it("skips duplicate edges by ID", () => {
    const existing = makeGraph(
      [makeNode({ id: "a" }), makeNode({ id: "b" })],
      [makeEdge({ id: "e1", source: "a", target: "b" })]
    );
    const incoming = {
      nodes: [],
      edges: [makeEdge({ id: "e1", source: "a", target: "b" })],
    };
    const { result } = mergeGraphs(existing, incoming);
    expect(result.skippedEdges).toEqual(["e1"]);
  });

  it("skips edges referencing non-existent nodes", () => {
    const existing = makeGraph([makeNode({ id: "a" })], []);
    const incoming = {
      nodes: [],
      edges: [makeEdge({ id: "e1", source: "a", target: "missing" })],
    };
    const { result } = mergeGraphs(existing, incoming);
    expect(result.skippedEdges).toEqual(["e1"]);
    expect(result.addedEdges).toBe(0);
  });

  it("updates metadata density formula: 2E / (N*(N-1))", () => {
    const existing = makeGraph(
      [makeNode({ id: "a" }), makeNode({ id: "b" })],
      [makeEdge({ id: "e1", source: "a", target: "b" })]
    );
    const incoming = {
      nodes: [makeNode({ id: "c" })],
      edges: [makeEdge({ id: "e2", source: "b", target: "c" })],
    };
    const { graph } = mergeGraphs(existing, incoming);
    // 3 nodes, 2 edges → density = 2*2/(3*2) = 0.667
    expect(graph.metadata.totalNodes).toBe(3);
    expect(graph.metadata.totalEdges).toBe(2);
    expect(graph.metadata.density).toBeCloseTo(0.667, 2);
  });

  it("resets verification status to UNVERIFIED when new nodes added", () => {
    const existing = makeGraph([makeNode({ id: "a" })], []);
    existing.metadata.verificationStatus = "VERIFIED";
    const incoming = {
      nodes: [makeNode({ id: "b" })],
      edges: [],
    };
    const { graph } = mergeGraphs(existing, incoming);
    expect(graph.metadata.verificationStatus).toBe("UNVERIFIED");
  });

  it("preserves verification status when no new nodes added", () => {
    const existing = makeGraph([makeNode({ id: "a" })], []);
    existing.metadata.verificationStatus = "VERIFIED";
    const incoming = { nodes: [makeNode({ id: "a" })], edges: [] }; // duplicate, will be skipped
    const { graph } = mergeGraphs(existing, incoming);
    expect(graph.metadata.verificationStatus).toBe("VERIFIED");
  });

  it("counts inconsistent edges and restricted nodes", () => {
    const existing = makeGraph([], []);
    const incoming = {
      nodes: [
        makeNode({ id: "a", isRestricted: true }),
        makeNode({ id: "b" }),
      ],
      edges: [
        makeEdge({ id: "e1", source: "a", target: "b", isInconsistent: true }),
      ],
    };
    const { graph } = mergeGraphs(existing, incoming);
    expect(graph.metadata.inconsistentEdges).toBe(1);
    expect(graph.metadata.restrictedNodes).toBe(1);
  });
});
