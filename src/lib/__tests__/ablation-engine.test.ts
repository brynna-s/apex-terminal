import { describe, it, expect } from "vitest";
import {
  computeAblatedGraph,
  computeAblationComparison,
} from "@/lib/ablation-engine";
import {
  linearGraph,
  unstableGraph,
  emptyGraph,
  makeNode,
  makeEdge,
  makeGraph,
} from "./fixtures/graph-fixtures";

// ─── computeAblatedGraph ────────────────────────────────────────

describe("computeAblatedGraph", () => {
  it("removes specified nodes", () => {
    const graph = linearGraph();
    const ablated = computeAblatedGraph(graph, ["A"], []);
    expect(ablated.nodes.find((n) => n.id === "A")).toBeUndefined();
    expect(ablated.nodes).toHaveLength(2);
  });

  it("cascade-removes edges connected to ablated nodes", () => {
    const graph = linearGraph();
    const ablated = computeAblatedGraph(graph, ["B"], []);
    // B is removed → edges A→B and B→C should both be gone
    expect(ablated.edges).toHaveLength(0);
  });

  it("removes specified edges directly", () => {
    const graph = linearGraph();
    const ablated = computeAblatedGraph(graph, [], ["e_AB"]);
    expect(ablated.edges.find((e) => e.id === "e_AB")).toBeUndefined();
    expect(ablated.edges).toHaveLength(1); // only e_BC remains
  });

  it("updates metadata counts", () => {
    const graph = linearGraph();
    const ablated = computeAblatedGraph(graph, ["A"], []);
    expect(ablated.metadata.totalNodes).toBe(2);
    expect(ablated.metadata.totalEdges).toBe(1); // only B→C
  });

  it("recalculates density after ablation", () => {
    const graph = linearGraph();
    const ablated = computeAblatedGraph(graph, ["A"], []);
    // 2 nodes, 1 edge → density = 1 / (2*1) = 0.5
    expect(ablated.metadata.density).toBeCloseTo(0.5, 5);
  });

  it("handles ablating all nodes → empty graph", () => {
    const graph = linearGraph();
    const ablated = computeAblatedGraph(graph, ["A", "B", "C"], []);
    expect(ablated.nodes).toHaveLength(0);
    expect(ablated.edges).toHaveLength(0);
    expect(ablated.metadata.density).toBe(0);
  });

  it("handles empty ablation lists (no-op)", () => {
    const graph = linearGraph();
    const ablated = computeAblatedGraph(graph, [], []);
    expect(ablated.nodes).toHaveLength(3);
    expect(ablated.edges).toHaveLength(2);
  });
});

// ─── computeAblationComparison ──────────────────────────────────

describe("computeAblationComparison", () => {
  it("computes before/after metrics with deltas", () => {
    const graph = linearGraph();
    const comparison = computeAblationComparison(graph, ["A"], []);
    expect(comparison.before.nodeCount).toBe(3);
    expect(comparison.after.nodeCount).toBe(2);
    expect(comparison.deltas.nodeCount).toBe(-1);
  });

  it("computes edge count delta correctly", () => {
    const graph = linearGraph();
    const comparison = computeAblationComparison(graph, ["B"], []);
    // Removing B removes both edges
    expect(comparison.before.edgeCount).toBe(2);
    expect(comparison.after.edgeCount).toBe(0);
    expect(comparison.deltas.edgeCount).toBe(-2);
  });

  it("detects stability transition STABLE→UNSTABLE when hub removed", () => {
    // Create a graph where removing a node changes stability
    const graph = unstableGraph();
    // lambdaMax for unstable > 1, after removing high-degree node A it should drop
    const comparison = computeAblationComparison(graph, ["A"], []);
    // After removing A: remaining edges B→C(0.5), B→D(0.4), C→D(0.3) → max row sum = 0.9 → stable
    expect(comparison.after.isStable).toBe(true);
    expect(comparison.before.isStable).toBe(false);
    expect(comparison.deltas.stability).toContain("→");
  });

  it("reports STABLE when no transition", () => {
    const graph = linearGraph();
    const comparison = computeAblationComparison(graph, [], ["e_AB"]);
    // Both before and after are stable
    expect(comparison.deltas.stability).toBe("STABLE");
  });

  it("computes structuralIntegrityPct as percentage change", () => {
    const graph = linearGraph();
    const comparison = computeAblationComparison(graph, ["A"], []);
    // 3→2 nodes: (2/3)*100 - 100 = -33.33
    expect(comparison.deltas.structuralIntegrityPct).toBeCloseTo(-33.33, 1);
  });

  it("computes mean and max omega deltas", () => {
    const graph = linearGraph();
    const comparison = computeAblationComparison(graph, ["A"], []);
    // Before and after should have omega values
    expect(typeof comparison.deltas.meanOmega).toBe("number");
    expect(typeof comparison.deltas.maxOmega).toBe("number");
  });

  it("handles empty graph comparison", () => {
    const graph = emptyGraph();
    const comparison = computeAblationComparison(graph, [], []);
    expect(comparison.before.nodeCount).toBe(0);
    expect(comparison.after.nodeCount).toBe(0);
    expect(comparison.deltas.structuralIntegrityPct).toBe(0);
  });
});
