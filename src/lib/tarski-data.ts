import { TarskiAxiom, ProofTrace } from "./types";

// ─── Axiom Library (Appendix C) ─────────────────────────────────

export const AXIOM_LIBRARY: TarskiAxiom[] = [
  // Level 0 — Physics (immutable, prune on violation)
  {
    id: "A-01",
    level: 0,
    name: "Temporal Priority",
    formalNotation: "∀e∈Edges, Lag(e) ≥ 0",
    description: "Effects cannot precede causes in the causal graph",
  },
  {
    id: "A-02",
    level: 0,
    name: "Conservation of Flow",
    formalNotation: "ΣInputs ≥ ΣOutputs + ΔStorage",
    description: "Mass/energy/information flow must satisfy conservation",
  },
  {
    id: "A-03",
    level: 0,
    name: "DAG Integrity",
    formalNotation: "∄ path v→⋯→v",
    description: "No directed cycles permitted in the causal structure",
  },
  {
    id: "A-04",
    level: 0,
    name: "Geospatial Speed Limits",
    formalNotation: "Distance(A,B)/Time(A→B) ≤ Vmax",
    description: "Causal influence limited by physical propagation speed",
  },
  {
    id: "A-05",
    level: 0,
    name: "Carnot Bound",
    formalNotation: "η ≤ 1 - T_cold/T_hot",
    description: "Thermodynamic efficiency ceiling for energy conversion",
  },
  {
    id: "A-06",
    level: 0,
    name: "Shannon Capacity",
    formalNotation: "C = B·log₂(1 + SNR)",
    description: "Information throughput bounded by channel capacity",
  },

  // Level 1 — Regulatory (red alert, manual override)
  {
    id: "R-01",
    level: 1,
    name: "Sanction Logic",
    formalNotation: "OFAC/EU SDN ∩ Counterparty ≠ ∅ → BLOCK",
    description: "Transactions involving sanctioned entities are prohibited",
  },
  {
    id: "R-02",
    level: 1,
    name: "Force Majeure",
    formalNotation: "FM_trigger → suspend(obligations)",
    description: "Force majeure events suspend contractual obligations",
  },
  {
    id: "R-03",
    level: 1,
    name: "Capital Adequacy",
    formalNotation: "SCR ≤ Own_Funds (Solvency II)",
    description: "Solvency capital requirement must not exceed own funds",
  },
  {
    id: "R-04",
    level: 1,
    name: "EUV Export Control",
    formalNotation: "EUV_export(NL) → requires(license)",
    description: "Dutch EUV lithography exports require government license",
  },

  // Level 2 — Heuristic (flagged as anomaly)
  {
    id: "H-01",
    level: 2,
    name: "Lead-Lag Reversal",
    formalNotation: "Lag(e_t) · Lag(e_{t-1}) < 0 → REGIME_SHIFT",
    description: "Historical lead-lag reversal signals regime shift candidate",
  },
  {
    id: "H-02",
    level: 2,
    name: "Capacity Saturation",
    formalNotation: "Utilization > 110% nameplate → ANOMALY",
    description: "Production exceeding rated capacity indicates data error or surge",
  },
];

// ─── Proof Traces (inconsistent edges from graph) ───────────────

export const PROOF_TRACES: ProofTrace[] = [
  {
    edgeId: "e15",
    violatedAxioms: ["A-01", "H-01"],
    verdict: "REJECTED",
    solverUsed: "Z3",
    checkTimeMs: 12.4,
  },
  {
    edgeId: "e29",
    violatedAxioms: ["A-02"],
    verdict: "FLAGGED",
    solverUsed: "cvc5",
    checkTimeMs: 8.7,
  },
];
