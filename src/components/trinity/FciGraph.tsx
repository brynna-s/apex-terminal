"use client";

import { useMemo } from "react";
import { FCI_NODES, FCI_EDGES, getCategoryColor } from "@/lib/graph-data";
import { useApexStore } from "@/stores/useApexStore";

function layoutNodes(nodes: typeof FCI_NODES) {
  const w = 260;
  const h = 120;
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) * 0.3;

  return nodes.map((n, i) => {
    const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
    return {
      ...n,
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  });
}

export default function FciGraph() {
  const selectedNode = useApexStore((s) => s.selectedNode);
  const setSelectedNode = useApexStore((s) => s.setSelectedNode);
  const positioned = useMemo(() => layoutNodes(FCI_NODES), []);
  const posMap = useMemo(() => {
    const m: Record<string, { x: number; y: number }> = {};
    positioned.forEach((n) => { m[n.id] = { x: n.x, y: n.y }; });
    return m;
  }, [positioned]);

  const uncertainCount = FCI_EDGES.filter(
    (e) => e.type === "confounded"
  ).length;

  return (
    <div className="p-2 h-full flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <span className="font-[family-name:var(--font-michroma)] text-[9px] tracking-wider text-accent-red">
          FCI
        </span>
        <span className="text-[8px] text-text-muted font-mono">
          {FCI_NODES.length} nodes | Latent PAG
        </span>
      </div>
      <svg
        viewBox="0 0 260 120"
        className="flex-1 w-full"
        style={{ minHeight: 0 }}
      >
        {/* Edges */}
        {FCI_EDGES.map((edge) => {
          const src = posMap[edge.source];
          const tgt = posMap[edge.target];
          if (!src || !tgt) return null;
          const isConfounded = edge.type === "confounded";
          return (
            <g key={edge.id}>
              <line
                x1={src.x}
                y1={src.y}
                x2={tgt.x}
                y2={tgt.y}
                stroke={isConfounded ? "#ff1744" : "#ff6d00"}
                strokeWidth={0.5 + edge.weight}
                strokeOpacity={0.5}
                strokeDasharray={isConfounded ? "4,3" : undefined}
              />
              {isConfounded && (
                <text
                  x={(src.x + tgt.x) / 2}
                  y={(src.y + tgt.y) / 2 - 4}
                  textAnchor="middle"
                  fontSize={7}
                  fill="#ff1744"
                  fillOpacity={0.7}
                >
                  ?
                </text>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {positioned.map((node) => {
          const color = getCategoryColor(node.category);
          const isActive = selectedNode === node.id;
          return (
            <g
              key={node.id}
              style={{ cursor: "pointer" }}
              onClick={() => setSelectedNode(isActive ? null : node.id)}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={6}
                fill={isActive ? "#00e5ff" : node.isConfounded ? "#ff1744" : color}
                fillOpacity={isActive ? 0.35 : 0.2}
                stroke={isActive ? "#00e5ff" : node.isConfounded ? "#ff1744" : color}
                strokeWidth={isActive ? 2 : 1}
              />
              <text
                x={node.x}
                y={node.y + 0.5}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={4.5}
                fill={isActive ? "#00e5ff" : node.isConfounded ? "#ff9a9a" : color}
                fontFamily="monospace"
                fontWeight="bold"
              >
                {node.shortLabel}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="text-[8px] text-text-muted font-mono text-right">
        Uncertain Confounders: {uncertainCount}
      </div>
    </div>
  );
}
