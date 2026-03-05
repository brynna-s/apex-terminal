import { describe, it, expect } from "vitest";
import { processCommand } from "@/lib/terminal-engine";
import { CausalShock } from "@/lib/types";

const NO_SHOCKS: CausalShock[] = [];
const ACTIVE_SHOCKS: CausalShock[] = [
  {
    id: "taiwan_blockade",
    name: "TAIWAN STRAIT BLOCKADE",
    severity: 0.45,
    category: "geopolitical",
    description: "PLA naval exclusion zone",
  },
];

describe("processCommand", () => {
  // ─── HELP ─────────────────────────────────────────────────────
  it("HELP returns help text", () => {
    const result = processCommand("HELP", NO_SHOCKS);
    expect(result.lines).toHaveLength(1);
    expect(result.lines[0].type).toBe("system");
    expect(result.lines[0].content).toContain("STRESS_TEST");
    expect(result.lines[0].content).toContain("COUNTERFACTUAL");
  });

  // ─── CLEAR ────────────────────────────────────────────────────
  it("CLEAR returns __CLEAR__ system line", () => {
    const result = processCommand("CLEAR", NO_SHOCKS);
    expect(result.lines[0].content).toBe("__CLEAR__");
  });

  // ─── STATUS (Pareto module) ───────────────────────────────────
  it("STATUS shows buffer, shock count, and system status", () => {
    const result = processCommand("STATUS", ACTIVE_SHOCKS);
    const content = result.lines.map((l) => l.content).join("\n");
    expect(content).toContain("Criticality Buffer");
    expect(content).toContain("Active Shocks: 1");
    expect(result.lines[0].module).toBe("pareto");
  });

  it("STATUS with no shocks reports NOMINAL and buffer 100.0%", () => {
    const result = processCommand("STATUS", NO_SHOCKS);
    const content = result.lines.map((l) => l.content).join("\n");
    expect(content).toContain("100.0%");
    expect(content).toContain("NOMINAL");
  });

  // ─── SHOCKS ───────────────────────────────────────────────────
  it("SHOCKS lists all available scenarios", () => {
    const result = processCommand("SHOCKS", NO_SHOCKS);
    const content = result.lines.map((l) => l.content).join("\n");
    expect(content).toContain("TAIWAN_BLOCKADE");
    expect(content).toContain("CARRINGTON_EVENT");
  });

  it("SHOCKS marks active shocks with [ACTIVE]", () => {
    const result = processCommand("SHOCKS", ACTIVE_SHOCKS);
    const activeLine = result.lines.find((l) => l.content.includes("TAIWAN_BLOCKADE"));
    expect(activeLine?.type).toBe("warning");
    expect(activeLine?.content).toContain("[ACTIVE]");
  });

  // ─── STRESS_TEST (Pareto) ─────────────────────────────────────
  it("STRESS_TEST:<valid> returns shock info and shockToAdd", () => {
    const result = processCommand("STRESS_TEST:TAIWAN_BLOCKADE", NO_SHOCKS);
    expect(result.shockToAdd).toBeDefined();
    expect(result.shockToAdd!.id).toBe("taiwan_blockade");
    expect(result.lines[0].module).toBe("pareto");
  });

  it("STRESS_TEST shows physical constraint when present", () => {
    const result = processCommand("STRESS_TEST:TAIWAN_BLOCKADE", NO_SHOCKS);
    const content = result.lines.map((l) => l.content).join("\n");
    expect(content).toContain("Physical Constraint");
  });

  it("STRESS_TEST:<already_active> returns warning", () => {
    const result = processCommand("STRESS_TEST:TAIWAN_BLOCKADE", ACTIVE_SHOCKS);
    expect(result.shockToAdd).toBeUndefined();
    expect(result.lines[0].type).toBe("warning");
  });

  it("STRESS_TEST:<unknown> returns error with available list", () => {
    const result = processCommand("STRESS_TEST:FAKE_SCENARIO", NO_SHOCKS);
    expect(result.lines[0].type).toBe("error");
    expect(result.lines[1].content).toContain("Available");
  });

  // ─── MITIGATE ─────────────────────────────────────────────────
  it("MITIGATE:<valid_id> returns shockToRemove", () => {
    const result = processCommand("MITIGATE:taiwan_blockade", ACTIVE_SHOCKS);
    expect(result.shockToRemove).toBe("taiwan_blockade");
    expect(result.lines[0].module).toBe("spirtes");
  });

  it("MITIGATE:<no_match> returns error", () => {
    const result = processCommand("MITIGATE:nonexistent", ACTIVE_SHOCKS);
    expect(result.lines[0].type).toBe("error");
  });

  // ─── DERIVE_ORIGIN (Spirtes) ──────────────────────────────────
  it("DERIVE_ORIGIN:<query> returns causal origin analysis", () => {
    const result = processCommand("DERIVE_ORIGIN:chip shortage", NO_SHOCKS);
    const content = result.lines.map((l) => l.content).join("\n");
    expect(content).toContain("SPIRTES");
    expect(content).toContain("causal origin");
    expect(result.lines[0].module).toBe("spirtes");
  });

  // ─── COUNTERFACTUAL (Pearl) ───────────────────────────────────
  it("COUNTERFACTUAL:<query> returns Pearl module output", () => {
    const result = processCommand("COUNTERFACTUAL:remove TSMC", NO_SHOCKS);
    const content = result.lines.map((l) => l.content).join("\n");
    expect(content).toContain("PEARL");
    expect(content).toContain("do(X)");
    expect(result.lines[0].module).toBe("pearl");
  });

  // ─── VERIFY (Tarski) ─────────────────────────────────────────
  it("VERIFY:<valid_statement> returns no violation", () => {
    const result = processCommand("VERIFY:supply chain is stable", NO_SHOCKS);
    const content = result.lines.map((l) => l.content).join("\n");
    expect(content).toContain("TARSKI");
    expect(content).toContain("No physical constraint violations");
  });

  it("VERIFY detects EXCEED as physical violation", () => {
    const result = processCommand("VERIFY:EXCEED speed of light", NO_SHOCKS);
    const hasError = result.lines.some((l) => l.type === "error");
    expect(hasError).toBe(true);
  });

  it("VERIFY detects INFINITE as physical violation", () => {
    const result = processCommand("VERIFY:INFINITE energy", NO_SHOCKS);
    const content = result.lines.map((l) => l.content).join("\n");
    expect(content).toContain("VIOLATION");
  });

  it("VERIFY detects PERPETUAL as physical violation", () => {
    const result = processCommand("VERIFY:PERPETUAL motion machine", NO_SHOCKS);
    const hasError = result.lines.some((l) => l.type === "error");
    expect(hasError).toBe(true);
  });

  it("VERIFY detects 100% EFFICIENCY as physical violation", () => {
    const result = processCommand("VERIFY:100% EFFICIENCY heat pump", NO_SHOCKS);
    const hasError = result.lines.some((l) => l.type === "error");
    expect(hasError).toBe(true);
  });

  // ─── Unknown command ──────────────────────────────────────────
  it("unknown command returns error with HELP hint", () => {
    const result = processCommand("FOOBAR", NO_SHOCKS);
    expect(result.lines[0].type).toBe("error");
    expect(result.lines[1].content).toContain("HELP");
  });

  // ─── Case insensitivity ───────────────────────────────────────
  it("commands are case-insensitive", () => {
    const result = processCommand("help", NO_SHOCKS);
    expect(result.lines[0].content).toContain("STRESS_TEST");
  });

  // ─── Line IDs ─────────────────────────────────────────────────
  it("all lines have IDs matching pattern line-N", () => {
    const result = processCommand("STATUS", ACTIVE_SHOCKS);
    for (const line of result.lines) {
      expect(line.id).toMatch(/^line-\d+$/);
    }
  });

  it("all lines have timestamps", () => {
    const result = processCommand("HELP", NO_SHOCKS);
    for (const line of result.lines) {
      expect(typeof line.timestamp).toBe("number");
    }
  });
});
