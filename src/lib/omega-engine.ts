import {
  CausalShock,
  OmegaState,
  DoomsdayState,
  RegimeType,
  AlertLevel,
  CascadeAnalysis,
  CausalGraph,
} from "./types";

const PRESET_SHOCKS: CausalShock[] = [
  {
    id: "subsea_cable_cut",
    name: "SUBSEA CABLE SEVERANCE",
    severity: 0.25,
    category: "supply",
    description: "Trans-Pacific fiber optic backbone severed at Luzon Strait",
    physicalConstraint: "Signal propagation limit: 2/3c in fiber",
  },
  {
    id: "hbm_yield_failure",
    name: "HBM YIELD COLLAPSE",
    severity: 0.3,
    category: "compute",
    description: "SK Hynix HBM4 yield drops below 40% — DRAM thermal envelope exceeded",
    physicalConstraint: "Thermal density limit: 25W/cm² for 3D stacking",
  },
  {
    id: "taiwan_blockade",
    name: "TAIWAN STRAIT BLOCKADE",
    severity: 0.45,
    category: "geopolitical",
    description: "PLA naval exclusion zone — TSMC fab access denied",
    physicalConstraint: "EUV lithography: single-source dependency (ASML)",
  },
  {
    id: "grid_cascade",
    name: "GRID CASCADE FAILURE",
    severity: 0.35,
    category: "energy",
    description: "ERCOT grid destabilization — 4.2GW datacenter load shed",
    physicalConstraint: "Carnot efficiency floor: η < 0.65 at ambient >45°C",
  },
  {
    id: "coolant_shortage",
    name: "COOLANT SUPPLY DISRUPTION",
    severity: 0.2,
    category: "cooling",
    description: "3M Novec phase-out — no drop-in immersion coolant replacement",
    physicalConstraint: "Boiling point constraint: Tb must be 49-61°C for 2-phase",
  },
  {
    id: "rare_earth_embargo",
    name: "RARE EARTH EMBARGO",
    severity: 0.3,
    category: "supply",
    description: "China restricts Gallium/Germanium exports — III-V compound shortage",
    physicalConstraint: "Bandgap engineering requires Ga concentration >99.9999%",
  },
  {
    id: "solar_flare",
    name: "CARRINGTON-CLASS CME",
    severity: 0.55,
    category: "energy",
    description: "X45+ solar flare — geomagnetically induced currents in power grid",
    physicalConstraint: "GIC threshold: >100A/phase in HV transformers",
  },
];

export function getPresetShocks(): CausalShock[] {
  return PRESET_SHOCKS;
}

export function computeOmegaState(shocks: CausalShock[]): OmegaState {
  const totalSeverity = shocks.reduce((sum, s) => sum + s.severity, 0);
  const buffer = Math.max(0, Math.min(100, 100 - totalSeverity * 100));

  let status: OmegaState["status"] = "NOMINAL";
  if (buffer < 15) status = "OMEGA_BREACH";
  else if (buffer < 35) status = "CRITICAL";
  else if (buffer < 65) status = "ELEVATED";

  return {
    buffer,
    shocks,
    status,
    lastUpdate: Date.now(),
  };
}

export function getStatusColor(status: OmegaState["status"]): string {
  switch (status) {
    case "NOMINAL":
      return "var(--accent-green)";
    case "ELEVATED":
      return "var(--accent-amber)";
    case "CRITICAL":
      return "var(--accent-red)";
    case "OMEGA_BREACH":
      return "var(--accent-red)";
  }
}

export function getFragilityForCategory(
  shocks: CausalShock[],
  category: string
): number {
  const relevant = shocks.filter((s) => s.category === category);
  if (relevant.length === 0) return 0;
  return Math.min(1, relevant.reduce((sum, s) => sum + s.severity, 0));
}

// ─── Doomsday State ─────────────────────────────────────────────

export function computeDoomsdayState(
  shocks: CausalShock[],
  buffer: number
): DoomsdayState {
  const totalSeverity = shocks.reduce((sum, s) => sum + s.severity, 0);
  const fragilityIndex = Math.min(100, Math.max(0, totalSeverity * 50 + (100 - buffer) * 0.5));

  // Time to failure scales with buffer: 365d nominal → 3d at breach
  const timeToFailureDays = Math.max(3, Math.round(365 * (buffer / 100)));

  // Regime type from fragility thresholds
  let regimeType: RegimeType = "STABLE";
  if (fragilityIndex > 80) regimeType = "CRASH";
  else if (fragilityIndex > 60) regimeType = "PHASE_TRANSITION";
  else if (fragilityIndex > 40) regimeType = "MELT_UP";
  else if (fragilityIndex > 20) regimeType = "STAGNATION";

  // Dragon King detection
  const dragonKingDetected = fragilityIndex > 70;
  const dragonKingProbability = Math.min(1, Math.max(0, (fragilityIndex - 50) / 50));

  // LPPLS parameters (log-periodic power law singularity)
  const lpplsOscFreq = 6.36 + totalSeverity * 2.1;
  const lpplsTc = timeToFailureDays + Math.random() * 5; // critical time
  const singularityScore = fragilityIndex > 60 ? fragilityIndex / 100 : 0;

  return {
    timeToFailureDays,
    dragonKingDetected,
    dragonKingProbability,
    regimeType,
    fragilityIndex,
    lpplsOscFreq,
    lpplsTc,
    singularityScore,
  };
}

// ─── Alert Level ────────────────────────────────────────────────

export function computeAlertLevel(
  omegaStatus: OmegaState["status"],
  doomsday: DoomsdayState
): AlertLevel {
  if (
    omegaStatus === "OMEGA_BREACH" ||
    omegaStatus === "CRITICAL" ||
    doomsday.timeToFailureDays < 30
  ) {
    return "RED";
  }
  if (omegaStatus === "ELEVATED" || doomsday.fragilityIndex > 40) {
    return "AMBER";
  }
  return "GREEN";
}

// ─── Cascade Analysis ───────────────────────────────────────────

export function computeCascadeAnalysis(graph: CausalGraph): CascadeAnalysis {
  const nodes = graph.nodes;
  const edges = graph.edges;

  // Approximate λ_max via max weighted row sum of adjacency matrix
  const rowSums = new Map<string, number>();
  for (const node of nodes) {
    rowSums.set(node.id, 0);
  }
  for (const edge of edges) {
    if (!edge.isSevered) {
      rowSums.set(edge.source, (rowSums.get(edge.source) || 0) + edge.weight);
    }
  }
  const lambdaMax = Math.max(...Array.from(rowSums.values()), 0);

  // Degree centrality
  const degree = new Map<string, number>();
  for (const node of nodes) {
    degree.set(node.id, 0);
  }
  for (const edge of edges) {
    if (!edge.isSevered) {
      degree.set(edge.source, (degree.get(edge.source) || 0) + 1);
      degree.set(edge.target, (degree.get(edge.target) || 0) + 1);
    }
  }

  const maxDegree = Math.max(...Array.from(degree.values()), 1);
  const topCentralityNodes = [...degree.entries()]
    .map(([nodeId, deg]) => ({
      nodeId,
      label: nodes.find((n) => n.id === nodeId)?.shortLabel || nodeId,
      centrality: deg / maxDegree,
    }))
    .sort((a, b) => b.centrality - a.centrality)
    .slice(0, 3);

  const isStable = lambdaMax < 1.0;
  const dampingCoeff = isStable ? 1.0 - lambdaMax : 0;
  const forgettingRate = 0.05 + lambdaMax * 0.1;

  return {
    lambdaMax,
    isStable,
    topCentralityNodes,
    forgettingRate,
    dampingCoeff,
  };
}
