/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { parseGraphML } from "@/lib/import/parsers/graphml-parser";
import {
  SIMPLE_GRAPHML,
  GRAPHML_WITH_NUMERIC_DATA,
  GRAPHML_WITH_BOOLEANS,
  INVALID_GRAPHML,
  EMPTY_GRAPHML,
} from "../fixtures/graphml-samples";

describe("parseGraphML", () => {
  it("parses nodes and edges from simple GraphML", () => {
    const result = parseGraphML(SIMPLE_GRAPHML);
    expect(result.format).toBe("graphml");
    expect(result.nodes).toHaveLength(2);
    expect(result.edges).toHaveLength(1);
  });

  it("resolves key attributes to attr.name", () => {
    const result = parseGraphML(SIMPLE_GRAPHML);
    const n1 = result.nodes.find((n) => n.id === "n1");
    expect(n1).toBeDefined();
    expect(n1!.label).toBe("Alpha");
    expect(n1!.category).toBe("manufacturing");
  });

  it("coerces numeric data values", () => {
    const result = parseGraphML(GRAPHML_WITH_NUMERIC_DATA);
    expect(result.edges[0].weight).toBe(0.75);
    expect(result.edges[0].confidence).toBe(0.9);
  });

  it("coerces boolean data values", () => {
    const result = parseGraphML(GRAPHML_WITH_BOOLEANS);
    expect(result.nodes[0].isConfounded).toBe(true);
    expect(result.nodes[1].isConfounded).toBe(false);
  });

  it("reports parse errors for invalid XML", () => {
    const result = parseGraphML(INVALID_GRAPHML);
    expect(result.nodes).toHaveLength(0);
    expect(result.warnings.some((w) => w.includes("parse error") || w.includes("XML"))).toBe(true);
  });

  it("handles empty GraphML with no nodes/edges", () => {
    const result = parseGraphML(EMPTY_GRAPHML);
    expect(result.nodes).toHaveLength(0);
    expect(result.edges).toHaveLength(0);
  });
});
