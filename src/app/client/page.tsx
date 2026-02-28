"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useApexStore } from "@/stores/useApexStore";
import { ATHENA_GRAPH } from "@/lib/athena-graph-data";
import { MAIN_GRAPH } from "@/lib/graph-data";
import ClientHeaderBar from "@/components/client/ClientHeaderBar";
import ClientSystemCopilot from "@/components/client/ClientSystemCopilot";
import RiskPropagationFlow from "@/components/RiskPropagationFlow";
import ModulePanel from "@/components/ModulePanel";
import StructuralMetrics from "@/components/StructuralMetrics";
import CausalDAG2D from "@/components/CausalDAG2D";

// Dynamic import for 3D canvas (no SSR)
const CausalDAG3D = dynamic(() => import("@/components/CausalDAG3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-background">
      <div className="text-[10px] font-mono text-text-muted animate-pulse">
        INITIALIZING WEBGL_3D RENDERER...
      </div>
    </div>
  ),
});

export default function ClientPage() {
  const viewMode = useApexStore((s) => s.viewMode);
  const setGraphData = useApexStore((s) => s.setGraphData);
  const addCopilotMessage = useApexStore((s) => s.addCopilotMessage);
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    // Override store with Athena graph
    setGraphData(ATHENA_GRAPH);

    // Set init message for Athena copilot
    useApexStore.setState({
      copilotMessages: [
        {
          id: "athena-init-1",
          role: "system",
          content:
            "ATHENA DEFENSE SYSTEMS — ISR Supply Chain Analysis initialized. Mission Copilot active — 18 nodes across 6 defense domains. Type a query or use the action buttons below.",
          timestamp: Date.now(),
        },
      ],
      selectedNode: null,
      severedEdges: [],
      scissorsMode: false,
    });

    // Restore on unmount
    return () => {
      useApexStore.setState({
        graphData: MAIN_GRAPH,
        initialGraph: MAIN_GRAPH,
        copilotMessages: [
          {
            id: "init-1",
            role: "system",
            content:
              "APEX SYNTHETIC SCIENTIST v2.0 initialized. Spirtes Engine active — structure discovery ready. Type a query or use the action buttons below.",
            timestamp: Date.now(),
          },
        ],
        selectedNode: null,
        severedEdges: [],
        scissorsMode: false,
      });
    };
  }, [setGraphData, addCopilotMessage]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
      {/* Header with module tabs */}
      <ClientHeaderBar />

      {/* Main 3-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Mission Copilot */}
        <ClientSystemCopilot />

        {/* Center: DAG + Risk Cards + Metrics */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* DAG Canvas */}
          <div className="flex-1 relative min-h-0" style={{ contain: "strict" }}>
            <div className="absolute inset-0">
              {viewMode === "3d" ? <CausalDAG3D /> : <CausalDAG2D />}
            </div>
          </div>

          {/* Risk Propagation Flow */}
          <RiskPropagationFlow />

          {/* Structural Metrics Footer */}
          <StructuralMetrics />
        </div>

        {/* Right: Module Panel */}
        <ModulePanel />
      </div>
    </div>
  );
}
