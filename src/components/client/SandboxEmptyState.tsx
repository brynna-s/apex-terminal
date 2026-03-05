"use client";

import { useApexStore } from "@/stores/useApexStore";

export default function SandboxEmptyState() {
  const setImportModalOpen = useApexStore((s) => s.setImportModalOpen);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-8">
      {/* Header */}
      <div className="flex flex-col items-center gap-2">
        <div className="font-[family-name:var(--font-michroma)] text-[14px] tracking-[0.25em] text-text-muted">
          NO DATA LOADED
        </div>
        <div className="text-[10px] font-mono text-text-muted text-center max-w-md">
          Import a CSV, JSON, GraphML, or DOT file to begin analysis
        </div>
      </div>

      {/* Import button */}
      <button
        onClick={() => setImportModalOpen(true)}
        className="font-[family-name:var(--font-michroma)] text-[11px] tracking-[0.2em] text-accent-cyan border border-accent-cyan/40 rounded px-8 py-3 hover:bg-accent-cyan/10 transition-colors"
      >
        IMPORT DATA
      </button>

      {/* Format hints */}
      <div className="flex flex-col items-center gap-1 mt-2">
        <div className="text-[8px] font-mono text-text-muted tracking-wider">
          NODES: id, label, category, omega
        </div>
        <div className="text-[8px] font-mono text-text-muted tracking-wider">
          EDGES: source, target, weight, type
        </div>
      </div>
    </div>
  );
}
