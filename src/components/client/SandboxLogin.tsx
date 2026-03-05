"use client";

import { useState } from "react";
import { useApexStore } from "@/stores/useApexStore";

export default function SandboxLogin() {
  const setSandboxOrgName = useApexStore((s) => s.setSandboxOrgName);
  const [orgName, setOrgName] = useState("");
  const [operatorId, setOperatorId] = useState("");
  const [accessCode, setAccessCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSandboxOrgName(orgName.trim() || "SANDBOX");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-background">
      {/* Scanline overlay */}
      <div className="absolute inset-0 scanlines pointer-events-none" />

      <form
        onSubmit={handleSubmit}
        className="relative flex flex-col items-center gap-8 w-full max-w-md px-8"
      >
        {/* Branding */}
        <div className="flex flex-col items-center gap-1">
          <h1 className="font-[family-name:var(--font-michroma)] text-2xl tracking-[0.3em] text-foreground">
            APEX TERMINAL
          </h1>
          <div className="font-[family-name:var(--font-michroma)] text-[9px] tracking-[0.4em] text-text-muted">
            CAUSAL ANALYSIS SANDBOX
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-border" />

        {/* Inputs */}
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-[family-name:var(--font-michroma)] tracking-[0.2em] text-text-muted">
              ORGANIZATION
            </label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full bg-surface font-mono text-[12px] text-foreground outline-none px-3 py-2 rounded border border-border placeholder:text-text-muted focus:border-accent-cyan/50 transition-colors"
              placeholder="Enter company name"
              spellCheck={false}
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-[family-name:var(--font-michroma)] tracking-[0.2em] text-text-muted">
              OPERATOR ID
            </label>
            <input
              type="text"
              value={operatorId}
              onChange={(e) => setOperatorId(e.target.value)}
              className="w-full bg-surface font-mono text-[12px] text-foreground outline-none px-3 py-2 rounded border border-border placeholder:text-text-muted focus:border-accent-cyan/50 transition-colors"
              placeholder="Any identifier"
              spellCheck={false}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-[family-name:var(--font-michroma)] tracking-[0.2em] text-text-muted">
              ACCESS CODE
            </label>
            <input
              type="password"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="w-full bg-surface font-mono text-[12px] text-foreground outline-none px-3 py-2 rounded border border-border placeholder:text-text-muted focus:border-accent-cyan/50 transition-colors"
              placeholder="Any input accepted"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full font-[family-name:var(--font-michroma)] text-[11px] tracking-[0.2em] text-accent-cyan border border-accent-cyan/40 rounded px-6 py-3 hover:bg-accent-cyan/10 transition-colors"
        >
          INITIALIZE TERMINAL
        </button>

        {/* Footer hint */}
        <div className="text-[8px] font-mono text-text-muted tracking-wider text-center">
          SANDBOX MODE &mdash; NO DATA PERSISTED BETWEEN SESSIONS
        </div>
      </form>
    </div>
  );
}
