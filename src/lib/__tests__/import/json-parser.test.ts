import { describe, it, expect } from "vitest";
import { parseJSON } from "@/lib/import/parsers/json-parser";
import {
  GRAPH_OBJECT_JSON,
  NODE_ARRAY_JSON,
  EDGE_ARRAY_JSON,
  EMPTY_OBJECT_JSON,
  INVALID_JSON,
  PRIMITIVE_JSON,
} from "../fixtures/json-samples";

describe("parseJSON", () => {
  it("parses {nodes, edges} object shape", () => {
    const result = parseJSON(GRAPH_OBJECT_JSON);
    expect(result.format).toBe("json");
    expect(result.nodes).toHaveLength(2);
    expect(result.edges).toHaveLength(1);
    expect(result.nodes[0].id).toBe("n1");
    expect(result.edges[0].source).toBe("n1");
  });

  it("detects array of nodes (no source/target in first element)", () => {
    const result = parseJSON(NODE_ARRAY_JSON);
    expect(result.nodes).toHaveLength(2);
    expect(result.edges).toHaveLength(0);
    expect(result.warnings.some((w) => w.includes("array of nodes"))).toBe(true);
  });

  it("detects array of edges (source/target in first element)", () => {
    const result = parseJSON(EDGE_ARRAY_JSON);
    expect(result.nodes).toHaveLength(0);
    expect(result.edges).toHaveLength(2);
    expect(result.warnings.some((w) => w.includes("array of edges"))).toBe(true);
  });

  it("warns when object has no nodes or edges arrays", () => {
    const result = parseJSON(EMPTY_OBJECT_JSON);
    expect(result.nodes).toHaveLength(0);
    expect(result.edges).toHaveLength(0);
    expect(result.warnings.some((w) => w.includes("no 'nodes'"))).toBe(true);
  });

  it("returns warning for invalid JSON", () => {
    const result = parseJSON(INVALID_JSON);
    expect(result.nodes).toHaveLength(0);
    expect(result.edges).toHaveLength(0);
    expect(result.warnings.some((w) => w.includes("Invalid JSON"))).toBe(true);
  });

  it("handles primitive JSON values", () => {
    const result = parseJSON(PRIMITIVE_JSON);
    expect(result.warnings.some((w) => w.includes("Unexpected JSON structure"))).toBe(true);
  });

  it("handles empty arrays", () => {
    const result = parseJSON(JSON.stringify({ nodes: [], edges: [] }));
    expect(result.nodes).toHaveLength(0);
    expect(result.edges).toHaveLength(0);
  });

  it("preserves all node fields from JSON", () => {
    const json = JSON.stringify({
      nodes: [{ id: "n1", label: "Test", category: "energy", domain: "Grid", omegaFragility: { composite: 9.0 } }],
      edges: [],
    });
    const result = parseJSON(json);
    expect(result.nodes[0].omegaFragility?.composite).toBe(9.0);
  });
});
