// Softball Rules Engine
// Controls terminology, feature visibility, and age-group content filtering
// for fastpitch vs slowpitch athletes across all softball pages.

export type SoftballFormat = "fastpitch" | "slowpitch" | "both";
export type SoftballAgeGroup = "8U" | "10U" | "12U" | "14U" | "16U" | "18U" | "College" | "Adult";

// ─── TERMINOLOGY ──────────────────────────────────────────────────────
// Never use baseball terms in softball context.
export const softballTerms = {
  mound: "pitcher's circle",
  pitchingMotion: "windmill",
  trajectory: "arc",
  dh: "DP/Flex",
  designatedHitter: "DP/Flex",
} as const;

// Helper: replace any baseball term in a string with the softball equivalent
export const applySoftballTerminology = (text: string): string => {
  let result = text;
  result = result.replace(/\bmound\b/gi, softballTerms.mound);
  result = result.replace(/\bpitching motion\b/gi, softballTerms.pitchingMotion);
  result = result.replace(/\btrajectory\b/gi, softballTerms.trajectory);
  result = result.replace(/\bDH\b/g, softballTerms.dh);
  result = result.replace(/\bdesignated hitter\b/gi, softballTerms.designatedHitter);
  return result;
};

// ─── AGE GROUP CONFIG ─────────────────────────────────────────────────
export interface AgeGroupRules {
  label: string;
  pitchingDistance: string;
  windmillRequired: boolean;
  fullSlapHitting: boolean;
  fullStolenBaseRules: boolean;
  ruleset: string;
  notes: string;
}

export const ageGroupConfig: Record<SoftballAgeGroup, AgeGroupRules> = {
  "8U": {
    label: "8 & Under",
    pitchingDistance: "Coach pitch",
    windmillRequired: false,
    fullSlapHitting: false,
    fullStolenBaseRules: false,
    ruleset: "Modified coach pitch",
    notes: "Coach pitch context — no windmill requirements",
  },
  "10U": {
    label: "10 & Under",
    pitchingDistance: "35 ft",
    windmillRequired: true,
    fullSlapHitting: false,
    fullStolenBaseRules: false,
    ruleset: "Modified kid pitch",
    notes: "Beginning windmill, 35-ft distance",
  },
  "12U": {
    label: "12 & Under",
    pitchingDistance: "35 ft",
    windmillRequired: true,
    fullSlapHitting: false,
    fullStolenBaseRules: true,
    ruleset: "Standard youth",
    notes: "Full windmill, 35-ft distance",
  },
  "14U": {
    label: "14 & Under",
    pitchingDistance: "43 ft",
    windmillRequired: true,
    fullSlapHitting: true,
    fullStolenBaseRules: true,
    ruleset: "Full competitive",
    notes: "43-ft distance, full slap hitting, full stolen base rules",
  },
  "16U": {
    label: "16 & Under",
    pitchingDistance: "43 ft",
    windmillRequired: true,
    fullSlapHitting: true,
    fullStolenBaseRules: true,
    ruleset: "Full competitive",
    notes: "43-ft distance, full ruleset",
  },
  "18U": {
    label: "18 & Under",
    pitchingDistance: "43 ft",
    windmillRequired: true,
    fullSlapHitting: true,
    fullStolenBaseRules: true,
    ruleset: "Full competitive",
    notes: "43-ft distance, full ruleset",
  },
  "College": {
    label: "College",
    pitchingDistance: "43 ft",
    windmillRequired: true,
    fullSlapHitting: true,
    fullStolenBaseRules: true,
    ruleset: "NCAA / USA Softball",
    notes: "NCAA or USA Softball full ruleset",
  },
  "Adult": {
    label: "Adult",
    pitchingDistance: "43 ft (FP) / 50 ft (SP)",
    windmillRequired: true,
    fullSlapHitting: true,
    fullStolenBaseRules: true,
    ruleset: "USA Softball / ASA",
    notes: "Full ruleset",
  },
};

export const getAgeGroupRules = (ageGroup: string | null | undefined): AgeGroupRules => {
  return ageGroupConfig[(ageGroup as SoftballAgeGroup)] || ageGroupConfig["14U"];
};

// ─── FORMAT VISIBILITY ────────────────────────────────────────────────
// Determines which features are visible based on fastpitch vs slowpitch.

export interface FormatVisibility {
  // Fastpitch-only
  windmillMechanics: boolean;
  riseBallDropBallScrew: boolean;
  slapHitting: boolean;
  lookBackRule: boolean;
  stealingDrills: boolean;
  pitchingDistance43ft: boolean;
  // Slowpitch-only
  arcPitchReading: boolean;
  powerLaunchAngle: boolean;
  legalBatCertification: boolean;
  deepOutfieldPositioning: boolean;
  noStealNoBunt: boolean;
}

export const getFormatVisibility = (
  format: SoftballFormat | string | null | undefined,
  ageGroup?: string | null
): FormatVisibility => {
  const f = (format || "fastpitch") as SoftballFormat;
  const isFastpitch = f === "fastpitch" || f === "both";
  const isSlowpitch = f === "slowpitch" || f === "both";
  const rules = getAgeGroupRules(ageGroup);

  return {
    // Fastpitch-only (also gated by age group where relevant)
    windmillMechanics: isFastpitch && rules.windmillRequired,
    riseBallDropBallScrew: isFastpitch && rules.windmillRequired,
    slapHitting: isFastpitch && rules.fullSlapHitting,
    lookBackRule: isFastpitch,
    stealingDrills: isFastpitch && rules.fullStolenBaseRules,
    pitchingDistance43ft: isFastpitch && (ageGroup === "14U" || ageGroup === "16U" || ageGroup === "18U" || ageGroup === "College" || ageGroup === "Adult"),
    // Slowpitch-only
    arcPitchReading: isSlowpitch,
    powerLaunchAngle: isSlowpitch,
    legalBatCertification: isSlowpitch,
    deepOutfieldPositioning: isSlowpitch,
    noStealNoBunt: isSlowpitch,
  };
};

// ─── DRILL FILTERING ──────────────────────────────────────────────────
// Filter drills by format and age group

const fastpitchOnlyDrillIds = new Set([
  "p-001", "p-002", "p-003", "p-004", "p-005", "p-006", "p-007", "p-008", "p-009", "p-010",
  "h-007", // slap hitting
  "h-008", // rise ball tracking
  "b-005", // delayed steal
]);

const slowpitchOnlyDrillIds = new Set<string>([
  // No slowpitch-specific drills in the library yet — placeholder for future additions
]);

export const isDrillVisibleForFormat = (drillId: string, format: SoftballFormat | string | null | undefined): boolean => {
  const f = (format || "fastpitch") as SoftballFormat;
  if (f === "both") return true;
  if (f === "slowpitch" && fastpitchOnlyDrillIds.has(drillId)) return false;
  if (f === "fastpitch" && slowpitchOnlyDrillIds.has(drillId)) return false;
  return true;
};

export const isDrillVisibleForAge = (drillAgeRange: string, ageGroup: string | null | undefined): boolean => {
  if (!ageGroup) return true;
  const numericAge = parseInt(ageGroup.replace("U", ""), 10);
  if (isNaN(numericAge) || ageGroup === "College" || ageGroup === "Adult") return true;

  // Parse drill age range like "10-18" or "8-18"
  const parts = drillAgeRange.split("-").map(s => parseInt(s.trim(), 10));
  if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) return true;

  return numericAge >= parts[0] && numericAge <= parts[1];
};

// ─── PITCH TYPE FILTERING ─────────────────────────────────────────────
export const fastpitchPitchTypes = [
  "Fastball", "Change-Up", "Drop Ball", "Rise Ball", "Curveball", "Screwball",
];

export const slowpitchPitchTypes = [
  "Arc Pitch", // legal slowpitch delivery
];

export const getVisiblePitchTypes = (format: SoftballFormat | string | null | undefined): string[] => {
  const f = (format || "fastpitch") as SoftballFormat;
  if (f === "both") return [...fastpitchPitchTypes, ...slowpitchPitchTypes];
  if (f === "slowpitch") return slowpitchPitchTypes;
  return fastpitchPitchTypes;
};
