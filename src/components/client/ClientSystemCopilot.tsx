"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApexStore } from "@/stores/useApexStore";
import {
  processAction,
  processQuery,
  processNodeAnalysis,
  AthenaCopilotAction,
} from "@/lib/athena-copilot-engine";
import { CopilotMessage } from "@/lib/types";

const ACTIONS: { label: string; action: AthenaCopilotAction; color: string }[] = [
  { label: "DISCOVER ISR STRUCTURE", action: "DISCOVER_ISR_STRUCTURE", color: "var(--accent-cyan)" },
  { label: "VERIFY KILL CHAIN", action: "VERIFY_KILL_CHAIN", color: "var(--accent-amber)" },
  { label: "ASSESS EMBARGO RISK", action: "ASSESS_EMBARGO_RISK", color: "var(--accent-red)" },
];

function getRoleColor(role: CopilotMessage["role"]): string {
  switch (role) {
    case "system": return "var(--text-muted)";
    case "user": return "var(--accent-cyan)";
    case "assistant": return "var(--foreground)";
  }
}

function getRoleLabel(role: CopilotMessage["role"]): string {
  switch (role) {
    case "system": return "SYS";
    case "user": return "YOU";
    case "assistant": return "ATHENA";
  }
}

export default function ClientSystemCopilot() {
  const { copilotMessages, addCopilotMessage, graphData, selectedNode } = useApexStore();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastSelectedRef = useRef<string | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [copilotMessages]);

  // Inject node context message when selection changes
  useEffect(() => {
    if (selectedNode && selectedNode !== lastSelectedRef.current) {
      const node = graphData.nodes.find((n) => n.id === selectedNode);
      if (node) {
        addCopilotMessage({
          id: `sys-node-${Date.now()}`,
          role: "system",
          content: `NODE FOCUSED: ${node.label} (Ω ${node.omegaFragility.composite.toFixed(1)}) — ${node.domain} — ${node.globalConcentration} — ${node.replacementTime}`,
          timestamp: Date.now(),
        });
      }
    }
    lastSelectedRef.current = selectedNode;
  }, [selectedNode, graphData.nodes, addCopilotMessage]);

  const handleAction = (action: AthenaCopilotAction) => {
    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: action.replace(/_/g, " "),
      timestamp: Date.now(),
    };
    addCopilotMessage(userMsg);

    const responses = processAction(action, graphData);
    responses.forEach((msg) => addCopilotMessage(msg));
  };

  const handleAnalyzeNode = () => {
    if (!selectedNode) return;
    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: "ANALYZE NODE",
      timestamp: Date.now(),
    };
    addCopilotMessage(userMsg);

    const responses = processNodeAnalysis(selectedNode, graphData);
    responses.forEach((msg) => addCopilotMessage(msg));
  };

  const handleSubmit = () => {
    if (!input.trim()) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: Date.now(),
    };
    addCopilotMessage(userMsg);

    const responses = processQuery(input, graphData);
    responses.forEach((msg) => addCopilotMessage(msg));

    setInput("");
  };

  const selectedNodeData = selectedNode
    ? graphData.nodes.find((n) => n.id === selectedNode)
    : null;

  return (
    <aside className="flex flex-col w-80 border-r border-border bg-surface h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-surface-elevated">
        <div className="font-[family-name:var(--font-michroma)] text-[10px] tracking-[0.25em] text-accent-cyan">
          MISSION COPILOT
        </div>
        <div className="text-[9px] text-text-muted font-mono mt-0.5">
          ISR Analysis Interface
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-2 space-y-2"
      >
        <AnimatePresence>
          {copilotMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="text-[11px] font-mono leading-relaxed"
            >
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className="text-[9px] font-[family-name:var(--font-michroma)] tracking-wider"
                  style={{ color: getRoleColor(msg.role) }}
                >
                  {getRoleLabel(msg.role)}
                </span>
                {msg.module && (
                  <span className="text-[8px] text-text-muted tracking-wider uppercase">
                    [{msg.module}]
                  </span>
                )}
              </div>
              <div
                className="whitespace-pre-wrap pl-2 border-l border-border"
                style={{ color: getRoleColor(msg.role) }}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="px-3 py-2 border-t border-border flex flex-wrap gap-1.5">
        {ACTIONS.map((a) => (
          <button
            key={a.action}
            onClick={() => handleAction(a.action)}
            className="text-[9px] font-[family-name:var(--font-michroma)] tracking-wider px-2.5 py-1.5 rounded border transition-colors"
            style={{
              borderColor: `color-mix(in srgb, ${a.color} 40%, transparent)`,
              color: a.color,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `color-mix(in srgb, ${a.color} 10%, transparent)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            {a.label}
          </button>
        ))}
        {/* Analyze Node button */}
        {selectedNodeData && (
          <button
            onClick={handleAnalyzeNode}
            className="text-[9px] font-[family-name:var(--font-michroma)] tracking-wider px-2.5 py-1.5 rounded border transition-colors border-accent-cyan/40 text-accent-cyan hover:bg-accent-cyan/10"
          >
            ANALYZE NODE
          </button>
        )}
      </div>

      {/* Input */}
      <div className="px-3 py-2 border-t border-border">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="flex-1 bg-surface-elevated font-mono text-[11px] text-foreground outline-none px-2.5 py-1.5 rounded border border-border placeholder:text-text-muted focus:border-accent-cyan/50 transition-colors"
            placeholder="Ask about ISR ops, kill chain, ITAR..."
            spellCheck={false}
          />
          <button
            onClick={handleSubmit}
            className="text-[10px] text-accent-cyan font-mono px-2 py-1.5 hover:bg-accent-cyan/10 rounded transition-colors"
          >
            &gt;
          </button>
        </div>
      </div>
    </aside>
  );
}
