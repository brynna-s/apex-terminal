// ─── JSON Test Samples ───────────────────────────────────────────

export const GRAPH_OBJECT_JSON = JSON.stringify({
  nodes: [
    { id: "n1", label: "Alpha", category: "manufacturing", domain: "EUV Lithography" },
    { id: "n2", label: "Beta", category: "energy", domain: "Energy Grid" },
  ],
  edges: [
    { id: "e1", source: "n1", target: "n2", weight: 0.8 },
  ],
});

export const NODE_ARRAY_JSON = JSON.stringify([
  { id: "n1", label: "Alpha", category: "manufacturing" },
  { id: "n2", label: "Beta", category: "energy" },
]);

export const EDGE_ARRAY_JSON = JSON.stringify([
  { source: "n1", target: "n2", weight: 0.8 },
  { source: "n2", target: "n3", weight: 0.6 },
]);

export const EMPTY_OBJECT_JSON = JSON.stringify({ foo: "bar" });

export const INVALID_JSON = "{ not valid json }}}";

export const PRIMITIVE_JSON = JSON.stringify(42);
