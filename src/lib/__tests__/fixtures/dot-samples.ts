// ─── DOT Test Samples ────────────────────────────────────────────

export const SIMPLE_DIGRAPH = `digraph G {
  A -> B [weight=0.7, label="powers"];
  B -> C [weight=0.6];
}`;

export const DIGRAPH_WITH_NODE_DECLS = `digraph test {
  A [label="Alpha", category="manufacturing"];
  B [label="Beta", category="energy"];
  A -> B [weight=0.8];
}`;

export const DIGRAPH_WITH_COMMENTS = `// This is a comment
digraph G {
  /* Multi-line
     comment */
  A -> B;
  // Another comment
  B -> C;
}`;

export const DIGRAPH_IMPLICIT_NODES = `digraph G {
  X -> Y;
  Y -> Z;
}`;

export const UNDIRECTED_GRAPH = `graph G {
  A -- B;
  B -- C;
}`;

export const DIGRAPH_WITH_ATTRS = `digraph G {
  rankdir=LR;
  node [shape=box];
  A [label="Node A", weight=0.5];
  A -> B [weight=0.9, confidence=0.8];
}`;

export const EMPTY_DOT = `not a graph at all`;

export const DIGRAPH_WITH_SUBGRAPH = `digraph G {
  subgraph cluster_0 {
    A -> B;
  }
  C -> D;
}`;
