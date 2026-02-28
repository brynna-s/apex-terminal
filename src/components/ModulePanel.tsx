"use client";

import { useMemo } from "react";
import { useApexStore } from "@/stores/useApexStore";
import { computeOmegaState } from "@/lib/omega-engine";
import { getDomainColor } from "@/lib/graph-data";
import TrinityPanel from "./TrinityPanel";
import InterventionControls from "./InterventionControls";
import NodeInspector from "./NodeInspector";

export default function ModulePanel() {
  const activeModule = useApexStore((s) => s.activeModule);

  return (
    <aside className="flex flex-col w-80 border-l border-border bg-surface h-full overflow-hidden">
      {/* Module Header */}
      <div className="px-4 py-3 border-b border-border bg-surface-elevated">
        <div className="font-[family-name:var(--font-michroma)] text-[10px] tracking-[0.25em] text-text-muted uppercase">
          {activeModule} Engine
        </div>
        <div className="text-[9px] text-text-muted font-mono mt-0.5">
          {activeModule === "spirtes" && "Structure Discovery \u2014 DCD / NOTEARS / PCMCI+ / FCI"}
          {activeModule === "tarski" && "Truth Verification \u2014 Physical Constraint Filter"}
          {activeModule === "pearl" && "Counterfactual Engine \u2014 do-Calculus"}
          {activeModule === "pareto" && "Criticality Warning \u2014 \u03A9-Fragility Assessment"}
        </div>
      </div>

      {/* Node Inspector (persistent across modules) */}
      <NodeInspector />

      {/* Module Content */}
      <div className="flex-1 overflow-y-auto">
        {activeModule === "spirtes" && <TrinityPanel />}

        {activeModule === "tarski" && (
          <div className="p-4 space-y-3">
            <TarskiPanel />
          </div>
        )}

        {activeModule === "pearl" && (
          <div className="p-4 space-y-3">
            <InterventionControls />
          </div>
        )}

        {activeModule === "pareto" && (
          <div className="p-4 space-y-3">
            <ParetoPanel />
          </div>
        )}
      </div>
    </aside>
  );
}

function TarskiPanel() {
  const graphData = useApexStore((s) => s.graphData);
  const truthFilter = useApexStore((s) => s.truthFilter);
  const setTruthFilter = useApexStore((s) => s.setTruthFilter);
  const setSelectedNode = useApexStore((s) => s.setSelectedNode);

  return (
    <>
      <div className="font-[family-name:var(--font-michroma)] text-[10px] tracking-wider text-accent-green">
        TRUTH FILTER
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => { setTruthFilter("raw"); setSelectedNode(null); }}
          className="text-[9px] font-mono px-3 py-1.5 rounded border transition-colors"
          style={{
            borderColor: truthFilter === "raw" ? "var(--accent-green)" : "var(--border)",
            color: truthFilter === "raw" ? "var(--accent-green)" : "var(--text-muted)",
            backgroundColor: truthFilter === "raw" ? "rgba(0,230,118,0.08)" : "transparent",
          }}
        >
          RAW
        </button>
        <button
          onClick={() => {
            setTruthFilter("verified");
            const firstRestricted = graphData.nodes.find((n) => n.isRestricted);
            if (firstRestricted) {
              setSelectedNode(firstRestricted.id);
            } else {
              const firstInconsistentEdge = graphData.edges.find((e) => e.isInconsistent);
              if (firstInconsistentEdge) setSelectedNode(firstInconsistentEdge.source);
            }
          }}
          className="text-[9px] font-mono px-3 py-1.5 rounded border transition-colors"
          style={{
            borderColor: truthFilter === "verified" ? "var(--accent-green)" : "var(--border)",
            color: truthFilter === "verified" ? "var(--accent-green)" : "var(--text-muted)",
            backgroundColor: truthFilter === "verified" ? "rgba(0,230,118,0.08)" : "transparent",
          }}
        >
          VERIFIED
        </button>
      </div>
      <div className="text-[9px] font-mono text-text-muted space-y-1 mt-2">
        <div>Inconsistent Edges: <span className="text-accent-red">{graphData.metadata.inconsistentEdges}</span></div>
        <div>Restricted Nodes: <span className="text-accent-amber">{graphData.metadata.restrictedNodes}</span></div>
        <div>Status: <span className="text-accent-green">{graphData.metadata.verificationStatus}</span></div>
      </div>
      {truthFilter === "verified" && (
        <div className="text-[9px] font-mono text-accent-red mt-2 p-2 border border-accent-red/30 rounded bg-accent-red/5">
          TARSKI FILTER ACTIVE — DETECTED: {graphData.metadata.inconsistentEdges} INCONSISTENT EDGES, {graphData.metadata.restrictedNodes} NODES RESTRICTED
        </div>
      )}
    </>
  );
}

function ParetoPanel() {
  const shocks = useApexStore((s) => s.shocks);
  const graphData = useApexStore((s) => s.graphData);
  const selectedNode = useApexStore((s) => s.selectedNode);
  const setSelectedNode = useApexStore((s) => s.setSelectedNode);
  const omegaState = useMemo(() => computeOmegaState(shocks), [shocks]);

  // Top nodes by Omega-Fragility
  const topNodes = useMemo(() => {
    return [...graphData.nodes]
      .sort((a, b) => b.omegaFragility.composite - a.omegaFragility.composite)
      .slice(0, 8);
  }, [graphData.nodes]);

  return (
    <>
      <div className="font-[family-name:var(--font-michroma)] text-[10px] tracking-wider text-accent-red">
        {"\u03A9"}-FRAGILITY ASSESSMENT
      </div>
      <div className="text-[9px] font-mono text-text-muted space-y-1">
        <div>Buffer: <span style={{ color: omegaState.status === "NOMINAL" ? "var(--accent-green)" : "var(--accent-red)" }}>{omegaState.buffer.toFixed(1)}%</span></div>
        <div>Status: <span className="text-accent-red">{omegaState.status}</span></div>
        <div>Active Shocks: {shocks.length}</div>
      </div>

      {/* Ω-Fragility Ranking */}
      <div className="mt-3">
        <div className="font-[family-name:var(--font-michroma)] text-[9px] tracking-wider text-text-muted mb-2">
          TOP {"\u03A9"}-CRITICAL NODES
        </div>
        <div className="space-y-1.5">
          {topNodes.map((node, i) => {
            const score = node.omegaFragility.composite;
            const domainColor = getDomainColor(node.domain);
            const scoreColor = score > 9 ? "#ff1744" : score >= 7 ? "#ffab00" : "#00e676";
            const isActive = selectedNode === node.id;
            return (
              <div
                key={node.id}
                className="text-[9px] font-mono p-1.5 border rounded flex items-center gap-2 cursor-pointer transition-colors"
                style={{
                  borderColor: isActive ? "var(--accent-cyan)" : `${scoreColor}30`,
                  backgroundColor: isActive ? "rgba(0,229,255,0.08)" : `${scoreColor}05`,
                }}
                onClick={() => setSelectedNode(isActive ? null : node.id)}
              >
                <span className="text-text-muted w-3">{i + 1}.</span>
                <span className="font-bold" style={{ color: scoreColor }}>
                  {score.toFixed(1)}
                </span>
                <span className="text-text-muted flex-1 truncate">{node.label}</span>
                <span
                  className="text-[7px] px-1 rounded"
                  style={{ color: domainColor, backgroundColor: `${domainColor}15` }}
                >
                  {node.domain}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {shocks.length > 0 && (
        <div className="space-y-1 mt-3">
          <div className="font-[family-name:var(--font-michroma)] text-[9px] tracking-wider text-text-muted mb-1">
            ACTIVE SHOCKS
          </div>
          {shocks.map((s) => (
            <div
              key={s.id}
              className="text-[9px] font-mono p-1.5 border border-accent-red/20 rounded bg-accent-red/5 text-accent-red"
            >
              {s.name} — SEV: {(s.severity * 100).toFixed(0)}%
            </div>
          ))}
        </div>
      )}
      {shocks.length === 0 && (
        <div className="text-[9px] font-mono text-text-muted italic mt-2">
          No active shocks. System nominal.
        </div>
      )}
    </>
  );
}
