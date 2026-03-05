"use client";

import { useMemo } from "react";
import { useApexStore } from "@/stores/useApexStore";
import { computeAblationComparison } from "@/lib/ablation-engine";

export default function AblationPanel() {
  const {
    ablationMode,
    setAblationMode,
    ablatedNodeIds,
    ablatedEdgeIds,
    resetAblation,
    startAblationReplay,
    graphData,
  } = useApexStore();

  const comparison = useMemo(() => {
    if (ablatedNodeIds.length === 0 && ablatedEdgeIds.length === 0) return null;
    return computeAblationComparison(graphData, ablatedNodeIds, ablatedEdgeIds);
  }, [graphData, ablatedNodeIds, ablatedEdgeIds]);

  const hasSelections = ablatedNodeIds.length > 0 || ablatedEdgeIds.length > 0;

  return (
    <div className="mt-3 pt-3 border-t border-border space-y-2">
      <div className="font-[family-name:var(--font-michroma)] text-[9px] tracking-wider text-text-muted">
        ABLATION ANALYSIS
      </div>
      <button
        onClick={() => setAblationMode(!ablationMode)}
        className="w-full text-[9px] font-[family-name:var(--font-michroma)] tracking-wider px-3 py-2 rounded border transition-colors"
        style={{
          borderColor: ablationMode ? "#e040fb" : "var(--border)",
          color: ablationMode ? "#e040fb" : "var(--text-muted)",
          backgroundColor: ablationMode ? "rgba(224,64,251,0.08)" : "transparent",
        }}
      >
        {ablationMode ? "\u2316 ABLATION ACTIVE" : "\u2316 ENABLE ABLATION"}
      </button>

      {ablationMode && (
        <div className="text-[8px] font-mono p-2 border rounded bg-[rgba(224,64,251,0.05)]" style={{ borderColor: "rgba(224,64,251,0.2)", color: "rgba(224,64,251,0.8)" }}>
          Click nodes or edges to mark for ablation. Nodes auto-mark connected edges.
        </div>
      )}

      {hasSelections && (
        <>
          <div className="text-[9px] font-mono text-text-muted">
            Marked: <span style={{ color: "#e040fb" }}>{ablatedNodeIds.length}</span> node{ablatedNodeIds.length !== 1 ? "s" : ""},{" "}
            <span style={{ color: "#e040fb" }}>{ablatedEdgeIds.length}</span> edge{ablatedEdgeIds.length !== 1 ? "s" : ""}
          </div>

          {comparison && (
            <div className="p-2 rounded border border-border bg-surface-elevated space-y-1.5">
              <div className="font-[family-name:var(--font-michroma)] text-[8px] tracking-wider text-text-muted">
                BEFORE / AFTER
              </div>
              <MetricRow label="Nodes" before={comparison.before.nodeCount} after={comparison.after.nodeCount} delta={comparison.deltas.nodeCount} />
              <MetricRow label="Edges" before={comparison.before.edgeCount} after={comparison.after.edgeCount} delta={comparison.deltas.edgeCount} />
              <MetricRow label="Density" before={comparison.before.density} after={comparison.after.density} delta={comparison.deltas.density} precision={3} />
              <MetricRow label={"\u03BB_max"} before={comparison.before.lambdaMax} after={comparison.after.lambdaMax} delta={comparison.deltas.lambdaMax} invertColor />
              <div className="flex justify-between text-[8px] font-mono">
                <span className="text-text-muted">Stability</span>
                <span style={{ color: comparison.deltas.stability.includes("\u2192") ? "#ffab00" : comparison.after.isStable ? "#00e676" : "#ff1744" }}>
                  {comparison.deltas.stability}
                </span>
              </div>
              <MetricRow label="Mean \u03A9" before={comparison.before.meanOmega} after={comparison.after.meanOmega} delta={comparison.deltas.meanOmega} invertColor />
              <MetricRow label="Max \u03A9" before={comparison.before.maxOmega} after={comparison.after.maxOmega} delta={comparison.deltas.maxOmega} invertColor />
              <div className="flex justify-between text-[8px] font-mono">
                <span className="text-text-muted">Integrity</span>
                <span style={{ color: comparison.deltas.structuralIntegrityPct < -20 ? "#ff1744" : comparison.deltas.structuralIntegrityPct < -5 ? "#ffab00" : "#00e676" }}>
                  {comparison.deltas.structuralIntegrityPct > 0 ? "+" : ""}{comparison.deltas.structuralIntegrityPct.toFixed(1)}%
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={startAblationReplay}
              className="flex-1 text-[8px] font-[family-name:var(--font-michroma)] tracking-wider px-2 py-1.5 rounded border transition-colors"
              style={{
                borderColor: "rgba(224,64,251,0.4)",
                color: "#e040fb",
                backgroundColor: "rgba(224,64,251,0.08)",
              }}
            >
              APPLY TO REPLAY
            </button>
            <button
              onClick={resetAblation}
              className="text-[8px] font-mono px-2 py-1.5 rounded border border-border text-text-muted hover:text-accent-red transition-colors"
            >
              RESET
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function MetricRow({
  label,
  before,
  after,
  delta,
  precision = 2,
  invertColor = false,
}: {
  label: string;
  before: number;
  after: number;
  delta: number;
  precision?: number;
  invertColor?: boolean;
}) {
  // For inverted metrics (like lambda_max, omega), decrease is good (green)
  const isGood = invertColor ? delta < 0 : delta > 0;
  const isBad = invertColor ? delta > 0 : delta < 0;
  const deltaColor = delta === 0 ? "var(--text-muted)" : isGood ? "#00e676" : isBad ? "#ff1744" : "var(--text-muted)";

  return (
    <div className="flex justify-between text-[8px] font-mono">
      <span className="text-text-muted">{label}</span>
      <span>
        <span className="text-text-muted">{typeof before === "number" ? before.toFixed(precision) : before}</span>
        <span className="text-text-muted mx-1">{"\u2192"}</span>
        <span style={{ color: deltaColor }}>{typeof after === "number" ? after.toFixed(precision) : after}</span>
        <span className="ml-1" style={{ color: deltaColor }}>
          ({delta > 0 ? "+" : ""}{delta.toFixed(precision)})
        </span>
      </span>
    </div>
  );
}
