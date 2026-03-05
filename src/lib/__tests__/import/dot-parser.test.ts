import { describe, it, expect } from "vitest";
import { parseDOT } from "@/lib/import/parsers/dot-parser";
import {
  SIMPLE_DIGRAPH,
  DIGRAPH_WITH_NODE_DECLS,
  DIGRAPH_WITH_COMMENTS,
  DIGRAPH_IMPLICIT_NODES,
  UNDIRECTED_GRAPH,
  DIGRAPH_WITH_ATTRS,
  EMPTY_DOT,
  DIGRAPH_WITH_SUBGRAPH,
} from "../fixtures/dot-samples";

describe("parseDOT", () => {
  it("parses edges from simple digraph", () => {
    const result = parseDOT(SIMPLE_DIGRAPH);
    expect(result.format).toBe("dot");
    expect(result.edges).toHaveLength(2);
    expect(result.edges[0].source).toBe("A");
    expect(result.edges[0].target).toBe("B");
  });

  it("parses edge attributes (weight)", () => {
    const result = parseDOT(SIMPLE_DIGRAPH);
    expect(result.edges[0].weight).toBe(0.7);
  });

  it("parses explicit node declarations with attributes", () => {
    const result = parseDOT(DIGRAPH_WITH_NODE_DECLS);
    const nodeA = result.nodes.find((n) => n.id === "A");
    expect(nodeA).toBeDefined();
    expect(nodeA!.label).toBe("Alpha");
    expect(nodeA!.category).toBe("manufacturing");
  });

  it("strips single-line and multi-line comments", () => {
    const result = parseDOT(DIGRAPH_WITH_COMMENTS);
    expect(result.edges).toHaveLength(2);
    expect(result.edges[0].source).toBe("A");
  });

  it("creates implicit nodes for edge-referenced but undeclared nodes", () => {
    const result = parseDOT(DIGRAPH_IMPLICIT_NODES);
    expect(result.nodes).toHaveLength(3); // X, Y, Z all implicit
    const ids = result.nodes.map((n) => n.id).sort();
    expect(ids).toEqual(["X", "Y", "Z"]);
  });

  it("handles undirected graph syntax (--)", () => {
    const result = parseDOT(UNDIRECTED_GRAPH);
    expect(result.edges).toHaveLength(2);
  });

  it("generates edge IDs as source_target", () => {
    const result = parseDOT(DIGRAPH_IMPLICIT_NODES);
    expect(result.edges[0].id).toBe("X_Y");
  });

  it("returns warning for non-graph content", () => {
    const result = parseDOT(EMPTY_DOT);
    expect(result.nodes).toHaveLength(0);
    expect(result.edges).toHaveLength(0);
    expect(result.warnings.some((w) => w.includes("Could not find"))).toBe(true);
  });

  it("warns about subgraphs", () => {
    const result = parseDOT(DIGRAPH_WITH_SUBGRAPH);
    expect(result.warnings.some((w) => w.includes("Subgraphs"))).toBe(true);
  });

  it("skips graph-level and default attributes", () => {
    const result = parseDOT(DIGRAPH_WITH_ATTRS);
    // rankdir=LR and node [shape=box] should be skipped
    // Only explicit node A and edge A→B + implicit B
    expect(result.edges).toHaveLength(1);
    expect(result.edges[0].weight).toBe(0.9);
  });
});
