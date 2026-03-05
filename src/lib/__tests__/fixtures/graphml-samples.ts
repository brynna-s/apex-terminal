// ─── GraphML Test Samples ────────────────────────────────────────

export const SIMPLE_GRAPHML = `<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphstruct.org/xmlns">
  <key id="d0" for="node" attr.name="label" attr.type="string"/>
  <key id="d1" for="node" attr.name="category" attr.type="string"/>
  <key id="d2" for="edge" attr.name="weight" attr.type="double"/>
  <graph id="G" edgedefault="directed">
    <node id="n1">
      <data key="d0">Alpha</data>
      <data key="d1">manufacturing</data>
    </node>
    <node id="n2">
      <data key="d0">Beta</data>
      <data key="d1">energy</data>
    </node>
    <edge id="e1" source="n1" target="n2">
      <data key="d2">0.8</data>
    </edge>
  </graph>
</graphml>`;

export const GRAPHML_WITH_NUMERIC_DATA = `<?xml version="1.0" encoding="UTF-8"?>
<graphml>
  <key id="w" for="edge" attr.name="weight" attr.type="double"/>
  <key id="c" for="edge" attr.name="confidence" attr.type="double"/>
  <graph edgedefault="directed">
    <node id="A"/>
    <node id="B"/>
    <edge source="A" target="B">
      <data key="w">0.75</data>
      <data key="c">0.9</data>
    </edge>
  </graph>
</graphml>`;

export const GRAPHML_WITH_BOOLEANS = `<?xml version="1.0" encoding="UTF-8"?>
<graphml>
  <key id="d0" for="node" attr.name="isConfounded" attr.type="boolean"/>
  <graph edgedefault="directed">
    <node id="n1">
      <data key="d0">true</data>
    </node>
    <node id="n2">
      <data key="d0">false</data>
    </node>
  </graph>
</graphml>`;

export const INVALID_GRAPHML = `<?xml version="1.0"?>
<graphml><unclosed>`;

export const EMPTY_GRAPHML = `<?xml version="1.0" encoding="UTF-8"?>
<graphml>
  <graph edgedefault="directed">
  </graph>
</graphml>`;
