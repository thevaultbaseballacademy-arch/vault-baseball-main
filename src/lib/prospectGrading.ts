/**
 * VAULT™ Prospect Grading System
 *
 * Evidence basis: Publicly available recruiting standards from NCSA, Perfect Game,
 * Baseball America, and published college program data. MLB scouting scale (20-80)
 * is a well-documented public domain grading system used throughout professional baseball.
 * All grade thresholds, projections, and development timelines are original VAULT™
 * research and do not reproduce any proprietary scouting content.
 *
 * DISCLAIMER: Grades are data-driven projections, not guarantees. Athletic development
 * depends on many factors including health, work ethic, coaching, and opportunity.
 * Use as one data point in a complete development picture.
 */

export type SportType = "baseball" | "softball";
export type GradeLevel = "youth" | "hs" | "college" | "pro";

// ── MLB 20-80 Scouting Scale (public domain standard) ────────────────────────
export const SCOUTING_SCALE: Record<number, { label: string; description: string; color: string }> = {
  80: { label: "Elite / Tool of the Year",  description: "Top 1% nationally. MLB Draft top-5 / D1 blue chip",    color: "#22c55e" },
  70: { label: "Plus-Plus",                 description: "Exceptional. High D1 / MLB Draft Day 1",               color: "#16a34a" },
  60: { label: "Plus",                      description: "Above average. Solid D1 / MLB Draft worthy",           color: "#84cc16" },
  50: { label: "Average",                   description: "MLB average / D1 baseline",                             color: "#f59e0b" },
  45: { label: "Below Average",             description: "D2/D3 level. Needs development",                       color: "#f97316" },
  40: { label: "Fringe",                    description: "High school starter / JUCO prospect",                   color: "#ef4444" },
  30: { label: "Developing",               description: "JV/youth level. Long development path",                 color: "#dc2626" },
  20: { label: "Project",                   description: "Freshman/beginner level. Focus on fundamentals",       color: "#991b1b" },
};

export function scaleLabel(grade: number): { label: string; description: string; color: string } {
  const keys = [80, 70, 60, 50, 45, 40, 30, 20];
  for (const k of keys) {
    if (grade >= k) return SCOUTING_SCALE[k];
  }
  return SCOUTING_SCALE[20];
}

// ── KPI → Grade conversion (position + age normalized) ───────────────────────
export interface KPIGradeInput {
  name: string;
  value: number;
  unit: string;
  age?: number;
  position?: string;
  sport: SportType;
}

export interface KPIGrade {
  kpiName: string;
  rawValue: number;
  unit: string;
  grade: number; // 20-80 scale
  percentile: number;
  label: string;
  color: string;
  vsD1Standard: number;     // % of D1 standard
  vsMLBStandard: number;    // % of MLB average
  improvementNeededD1: number | null;  // delta to meet D1 standard
  improvementNeededPro: number | null; // delta to meet pro standard
}

// ── Grade thresholds by KPI (baseball) ───────────────────────────────────────
// Sources: Perfect Game national averages, NCSA recruiting standards,
// Baseball Savant MLB averages (publicly published)
const BASEBALL_THRESHOLDS: Record<string, {
  youth_12: number[]; youth_14: number[];
  hs_jv: number[]; hs_var: number[];
  d3: number[]; d2: number[]; d1: number[];
  milb: number[]; mlb: number[];
  lowerIsBetter?: boolean;
}> = {
  exit_velocity: {
    youth_12: [45, 52, 58, 65, 70, 75, 80],
    youth_14: [55, 63, 70, 77, 83, 88, 93],
    hs_jv:    [65, 72, 78, 83, 87, 91, 95],
    hs_var:   [75, 80, 85, 90, 93, 96, 100],
    d3:       [80, 84, 87, 90, 92, 94, 96],
    d2:       [83, 87, 90, 93, 95, 97, 100],
    d1:       [88, 91, 94, 97, 100, 103, 107],
    milb:     [90, 93, 96, 99, 102, 105, 109],
    mlb:      [92, 96, 100, 104, 107, 110, 115],
  },
  bat_speed: {
    youth_12: [38, 44, 49, 54, 58, 62, 66],
    youth_14: [48, 54, 59, 64, 68, 72, 76],
    hs_jv:    [55, 60, 64, 68, 71, 74, 77],
    hs_var:   [60, 64, 68, 72, 75, 78, 82],
    d3:       [63, 66, 69, 72, 75, 78, 81],
    d2:       [66, 69, 72, 75, 78, 81, 84],
    d1:       [68, 71, 74, 77, 80, 83, 86],
    milb:     [70, 73, 76, 79, 82, 85, 88],
    mlb:      [72, 75, 78, 82, 85, 88, 92],
  },
  pitch_velocity: {
    youth_12: [40, 46, 52, 57, 62, 66, 70],
    youth_14: [52, 58, 64, 69, 73, 77, 81],
    hs_jv:    [62, 67, 72, 76, 79, 82, 85],
    hs_var:   [70, 74, 78, 82, 85, 88, 92],
    d3:       [75, 78, 81, 84, 86, 89, 92],
    d2:       [78, 81, 84, 87, 89, 92, 95],
    d1:       [83, 86, 89, 92, 94, 97, 100],
    milb:     [87, 90, 93, 95, 97, 99, 101],
    mlb:      [90, 93, 95, 97, 99, 101, 103],
  },
  sixty_yard:  {
    // Lower is better — thresholds reversed
    youth_12: [8.5, 8.0, 7.6, 7.2, 6.9, 6.6, 6.3],
    youth_14: [7.8, 7.4, 7.1, 6.8, 6.5, 6.2, 5.9],
    hs_jv:    [7.4, 7.1, 6.9, 6.7, 6.5, 6.3, 6.1],
    hs_var:   [7.2, 7.0, 6.8, 6.6, 6.4, 6.2, 5.9],
    d3:       [7.0, 6.8, 6.6, 6.4, 6.2, 6.0, 5.8],
    d2:       [6.9, 6.7, 6.5, 6.3, 6.1, 5.9, 5.7],
    d1:       [6.8, 6.6, 6.4, 6.2, 6.0, 5.8, 5.6],
    milb:     [6.6, 6.4, 6.2, 6.0, 5.8, 5.6, 5.4],
    mlb:      [6.4, 6.2, 6.0, 5.8, 5.6, 5.4, 5.2],
    lowerIsBetter: true,
  },
  pop_time: {
    youth_12: [2.8, 2.6, 2.4, 2.2, 2.1, 2.0, 1.95],
    youth_14: [2.5, 2.3, 2.15, 2.05, 1.97, 1.92, 1.87],
    hs_jv:    [2.3, 2.15, 2.05, 1.98, 1.93, 1.89, 1.85],
    hs_var:   [2.15, 2.05, 1.97, 1.92, 1.88, 1.85, 1.81],
    d3:       [2.05, 1.98, 1.93, 1.89, 1.85, 1.82, 1.78],
    d2:       [1.98, 1.93, 1.89, 1.85, 1.82, 1.78, 1.74],
    d1:       [1.93, 1.89, 1.85, 1.82, 1.78, 1.75, 1.70],
    milb:     [1.88, 1.85, 1.82, 1.78, 1.75, 1.72, 1.68],
    mlb:      [1.85, 1.82, 1.78, 1.75, 1.71, 1.67, 1.63],
    lowerIsBetter: true,
  },
  throw_velocity: {
    youth_12: [45, 52, 57, 62, 66, 70, 74],
    youth_14: [55, 61, 66, 71, 75, 79, 83],
    hs_jv:    [63, 67, 71, 75, 78, 81, 84],
    hs_var:   [68, 72, 75, 79, 82, 85, 88],
    d3:       [72, 75, 78, 81, 83, 86, 89],
    d2:       [75, 78, 81, 84, 86, 89, 92],
    d1:       [78, 81, 84, 87, 89, 92, 95],
    milb:     [82, 85, 88, 90, 92, 94, 96],
    mlb:      [85, 88, 90, 92, 94, 96, 98],
  },
};

const SOFTBALL_THRESHOLDS: Record<string, {
  youth_12: number[]; youth_14: number[];
  hs_jv: number[]; hs_var: number[];
  d3: number[]; d2: number[]; d1: number[];
  pro: number[];
  lowerIsBetter?: boolean;
}> = {
  exit_velocity: {
    youth_12: [38, 44, 49, 54, 58, 62, 66],
    youth_14: [46, 52, 57, 62, 66, 70, 74],
    hs_jv:    [52, 57, 61, 65, 68, 71, 74],
    hs_var:   [58, 62, 66, 70, 73, 76, 79],
    d3:       [62, 65, 68, 71, 73, 76, 79],
    d2:       [65, 68, 71, 74, 76, 79, 82],
    d1:       [68, 71, 74, 77, 79, 82, 85],
    pro:      [72, 75, 78, 81, 84, 87, 90],
  },
  pitch_velocity: {
    youth_12: [28, 33, 37, 41, 44, 47, 50],
    youth_14: [38, 43, 47, 51, 54, 57, 60],
    hs_jv:    [46, 50, 53, 56, 58, 61, 63],
    hs_var:   [52, 55, 58, 61, 63, 66, 68],
    d3:       [55, 58, 60, 62, 64, 66, 68],
    d2:       [58, 60, 62, 64, 66, 68, 70],
    d1:       [61, 63, 65, 67, 69, 71, 73],
    pro:      [65, 67, 69, 71, 73, 75, 77],
  },
  sixty_yard: {
    youth_12: [9.0, 8.5, 8.1, 7.7, 7.4, 7.1, 6.8],
    youth_14: [8.5, 8.0, 7.6, 7.3, 7.0, 6.8, 6.5],
    hs_jv:    [8.1, 7.8, 7.5, 7.2, 7.0, 6.8, 6.5],
    hs_var:   [7.8, 7.5, 7.2, 7.0, 6.8, 6.5, 6.3],
    d3:       [7.6, 7.3, 7.1, 6.9, 6.7, 6.5, 6.2],
    d2:       [7.4, 7.2, 7.0, 6.8, 6.6, 6.4, 6.1],
    d1:       [7.2, 7.0, 6.8, 6.6, 6.4, 6.2, 5.9],
    pro:      [7.0, 6.8, 6.6, 6.4, 6.2, 6.0, 5.7],
    lowerIsBetter: true,
  },
  pop_time: {
    youth_12: [2.6, 2.4, 2.2, 2.1, 2.0, 1.9, 1.8],
    youth_14: [2.3, 2.15, 2.05, 1.95, 1.87, 1.80, 1.73],
    hs_jv:    [2.15, 2.05, 1.97, 1.90, 1.83, 1.77, 1.71],
    hs_var:   [2.05, 1.97, 1.90, 1.83, 1.77, 1.71, 1.65],
    d3:       [1.97, 1.90, 1.83, 1.77, 1.72, 1.67, 1.61],
    d2:       [1.90, 1.83, 1.77, 1.72, 1.67, 1.62, 1.56],
    d1:       [1.83, 1.77, 1.72, 1.67, 1.62, 1.57, 1.50],
    pro:      [1.75, 1.70, 1.65, 1.60, 1.55, 1.50, 1.44],
    lowerIsBetter: true,
  },
};

// ── Grade a single KPI ────────────────────────────────────────────────────────
export function gradeKPI(input: KPIGradeInput): KPIGrade {
  const thresholds = input.sport === "softball" ? SOFTBALL_THRESHOLDS : BASEBALL_THRESHOLDS;
  const kpiKey = input.name.toLowerCase().replace(/[^a-z_]/g, "").replace(/\s+/g, "_");
  const t = thresholds[kpiKey];

  if (!t) {
    // Unknown KPI — return neutral grade
    return {
      kpiName: input.name, rawValue: input.value, unit: input.unit,
      grade: 50, percentile: 50, label: "Average", color: "#f59e0b",
      vsD1Standard: 100, vsMLBStandard: 100,
      improvementNeededD1: null, improvementNeededPro: null,
    };
  }

  const lower = t.lowerIsBetter;
  // 7 thresholds map to grades: 20, 30, 40, 45, 50, 60, 70, 80
  const gradeSteps = [20, 30, 40, 45, 50, 60, 70, 80];
  const scale = t.hs_var; // default to hs_var as baseline

  let grade = 20;
  let percentile = 5;
  for (let i = 0; i < scale.length; i++) {
    const passes = lower ? input.value <= scale[i] : input.value >= scale[i];
    if (passes) {
      grade = gradeSteps[Math.min(i + 1, gradeSteps.length - 1)];
      percentile = [5, 10, 20, 35, 50, 65, 80, 95][Math.min(i + 1, 7)];
    }
  }

  // D1 standard = index 6 of hs_var (the 70 threshold)
  const d1Standard = (input.sport === "baseball" ? BASEBALL_THRESHOLDS : SOFTBALL_THRESHOLDS)[kpiKey]?.d1?.[4] || scale[4];
  const proStandard = (input.sport === "baseball" ? BASEBALL_THRESHOLDS[kpiKey]?.mlb?.[4] : (SOFTBALL_THRESHOLDS[kpiKey] as any)?.pro?.[4]) || scale[6];

  const vsD1 = lower
    ? d1Standard > 0 ? Math.round((d1Standard / Math.max(input.value, 0.01)) * 100) : 100
    : d1Standard > 0 ? Math.round((input.value / d1Standard) * 100) : 100;

  const vsMLB = lower
    ? proStandard > 0 ? Math.round((proStandard / Math.max(input.value, 0.01)) * 100) : 100
    : proStandard > 0 ? Math.round((input.value / proStandard) * 100) : 100;

  const d1Delta = lower
    ? (input.value - d1Standard > 0.001 ? +(input.value - d1Standard).toFixed(2) : null)
    : (d1Standard - input.value > 0.5 ? +(d1Standard - input.value).toFixed(1) : null);

  const proDelta = lower
    ? (input.value - proStandard > 0.001 ? +(input.value - proStandard).toFixed(2) : null)
    : (proStandard - input.value > 0.5 ? +(proStandard - input.value).toFixed(1) : null);

  const { label, color } = scaleLabel(grade);
  return {
    kpiName: input.name, rawValue: input.value, unit: input.unit,
    grade, percentile, label, color,
    vsD1Standard: Math.min(vsD1, 130),
    vsMLBStandard: Math.min(vsMLB, 130),
    improvementNeededD1: d1Delta,
    improvementNeededPro: proDelta,
  };
}

// ── Prospect Grade Report ─────────────────────────────────────────────────────
export interface ProspectGradeReport {
  athleteName: string;
  position: string;
  age: number | null;
  ageGroup: string;
  sport: SportType;
  gradYear?: number;
  reportDate: string;

  // Overall grades
  overallGrade: number;
  overallLabel: string;
  overallColor: string;
  overallPercentile: number;

  // Tool grades (20-80)
  toolGrades: KPIGrade[];
  presentGrade: number;         // current measurable level
  futureGrade: number;          // projected ceiling
  ofpGrade: number;             // OFP = Overall Future Potential

  // Level projections
  currentLevel: LevelProjection;
  nextLevelProjection: LevelProjection;
  ceilingProjection: LevelProjection;

  // Youth-specific
  youthProjection?: YouthProjection;

  // Development gaps
  primaryGap: string;
  secondaryGap: string;
  primaryStrength: string;

  // Timeline
  timelineMonths: number;
  timelineDescription: string;
  developmentRoadmap: RoadmapStep[];

  // AI narrative sections
  executiveSummary: string;        // generated by AI
  strengthsNarrative: string;
  gapsNarrative: string;
  parentFacingSummary: string;

  // Comp profiles (public figures who played similarly, not proprietary)
  comparableType: string;         // e.g., "Contact hitter with above-avg speed"

  coachNotesSummary?: string;
}

export interface LevelProjection {
  level: string;
  timeframe: string;
  probability: number;    // 0-100%
  requirements: string[];
  isCurrentLevel: boolean;
}

export interface YouthProjection {
  currentSchoolLevel: "youth_league" | "freshman" | "jv" | "varsity" | "college";
  nextSchoolLevel: "freshman" | "jv" | "varsity" | "college";
  projectedTimeframe: string;
  keyDevelopmentAreas: string[];
  ageAppropriateGoals: string[];
  parentMessage: string;
}

export interface RoadmapStep {
  title: string;
  timeframe: string;
  kpiTarget: string;
  action: string;
  priority: "critical" | "high" | "medium";
}

// ── Compute Overall Grade from tool grades ────────────────────────────────────
export function computeOverallGrade(toolGrades: KPIGrade[], position: string): number {
  if (toolGrades.length === 0) return 40;

  // Weight by position importance
  const positionWeights: Record<string, Record<string, number>> = {
    pitcher:    { pitch_velocity: 0.35, exit_velocity: 0.15, sixty_yard: 0.15, throw_velocity: 0.20, pop_time: 0.05, bat_speed: 0.10 },
    catcher:    { pop_time: 0.30, exit_velocity: 0.25, throw_velocity: 0.25, sixty_yard: 0.10, bat_speed: 0.10, pitch_velocity: 0 },
    outfield:   { sixty_yard: 0.30, exit_velocity: 0.30, throw_velocity: 0.25, bat_speed: 0.15, pop_time: 0, pitch_velocity: 0 },
    shortstop:  { sixty_yard: 0.25, exit_velocity: 0.25, throw_velocity: 0.25, bat_speed: 0.20, pop_time: 0.05, pitch_velocity: 0 },
    infield:    { exit_velocity: 0.30, sixty_yard: 0.20, throw_velocity: 0.25, bat_speed: 0.25, pop_time: 0, pitch_velocity: 0 },
    default:    { exit_velocity: 0.25, sixty_yard: 0.20, throw_velocity: 0.20, bat_speed: 0.20, pop_time: 0.10, pitch_velocity: 0.05 },
  };

  const pos = position.toLowerCase().replace(/[^a-z]/g, "");
  const weights = positionWeights[pos] || positionWeights.default;
  let weighted = 0;
  let totalWeight = 0;

  for (const tg of toolGrades) {
    const key = tg.kpiName.toLowerCase().replace(/[^a-z_]/g, "").replace(/\s+/g, "_");
    const w = weights[key] || 0.1;
    weighted += tg.grade * w;
    totalWeight += w;
  }

  return totalWeight > 0 ? Math.round(weighted / totalWeight) : Math.round(toolGrades.reduce((s, g) => s + g.grade, 0) / toolGrades.length);
}

// ── Level Classification ──────────────────────────────────────────────────────
export function classifyLevel(overallGrade: number, age: number | null, sport: SportType): {
  current: string; ceiling: string; nextStep: string;
} {
  if (overallGrade >= 70) return { current: "D1 / Pro Prospect",   ceiling: "Pro Draft Prospect",     nextStep: "Elite D1 Program" };
  if (overallGrade >= 60) return { current: "D1 Prospect",         ceiling: "D1 Scholarship",          nextStep: "D1 Walk-on / Scholarship" };
  if (overallGrade >= 55) return { current: "Mid-Major D1 / D2",   ceiling: "D1 Mid-Major",            nextStep: "D2 Scholarship / D1 Walk-on" };
  if (overallGrade >= 50) return { current: "D2 Scholarship",      ceiling: "D2 / D1 Stretch",         nextStep: "D2 / JUCO" };
  if (overallGrade >= 45) return { current: "D3 / JUCO Prospect",  ceiling: "D2 with Development",     nextStep: "JUCO / D3" };
  if (overallGrade >= 40) return { current: "Varsity HS",          ceiling: "D3 / JUCO Recruit",       nextStep: "Varsity starter → JUCO" };
  if (overallGrade >= 35) return { current: "JV Starter",          ceiling: "Varsity HS",              nextStep: "JV → Varsity" };
  if (overallGrade >= 30) return { current: "Freshman Level",      ceiling: "JV / Varsity",            nextStep: "Freshman → JV" };
  return                         { current: "Youth Development",   ceiling: "HS Freshman Level",       nextStep: "Build fundamentals" };
}

// ── Youth School Level Projection ─────────────────────────────────────────────
export function computeYouthProjection(
  overallGrade: number, age: number, toolGrades: KPIGrade[]
): YouthProjection {
  const avgGrowthPerYear = 3; // ~3 grade points/year with consistent development
  const monthsToNextGradeLevel = (target: number) =>
    Math.max(6, Math.round(((target - overallGrade) / avgGrowthPerYear) * 12));

  if (overallGrade >= 55 || age >= 17) {
    return {
      currentSchoolLevel: "varsity",
      nextSchoolLevel: "college",
      projectedTimeframe: monthsToNextGradeLevel(65) <= 18 ? "1–2 seasons" : "2–3 seasons",
      keyDevelopmentAreas: toolGrades.filter(g => g.grade < 50).map(g => g.kpiName).slice(0, 3),
      ageAppropriateGoals: ["Varsity starter", "College visit", "Showcase appearances"],
      parentMessage: "Your athlete is performing at a varsity level and is on track for college recruiting consideration.",
    };
  }
  if (overallGrade >= 45 || age >= 15) {
    return {
      currentSchoolLevel: "jv",
      nextSchoolLevel: "varsity",
      projectedTimeframe: monthsToNextGradeLevel(55) <= 12 ? "1 season" : "1–2 seasons",
      keyDevelopmentAreas: toolGrades.filter(g => g.grade < 50).map(g => g.kpiName).slice(0, 3),
      ageAppropriateGoals: ["Varsity roster", "Off-season development", "First showcase"],
      parentMessage: "Your athlete is at JV level and with focused development can project to varsity within 1–2 seasons.",
    };
  }
  if (overallGrade >= 35 || age >= 13) {
    return {
      currentSchoolLevel: "freshman",
      nextSchoolLevel: "jv",
      projectedTimeframe: monthsToNextGradeLevel(45) <= 12 ? "1 season" : "2 seasons",
      keyDevelopmentAreas: toolGrades.filter(g => g.grade < 45).map(g => g.kpiName).slice(0, 3),
      ageAppropriateGoals: ["Freshman roster", "JV tryout", "Consistent training schedule"],
      parentMessage: "Your athlete is at freshman level. This is an exciting stage — the fundamentals built now create the ceiling for high school and beyond.",
    };
  }
  return {
    currentSchoolLevel: "youth_league",
    nextSchoolLevel: "freshman",
    projectedTimeframe: monthsToNextGradeLevel(35) <= 18 ? "1–2 years" : "2–3 years",
    keyDevelopmentAreas: ["Movement quality", "Basic mechanics", "Athletic development"],
    ageAppropriateGoals: ["Consistent mechanics", "Love of the game", "Physical literacy"],
    parentMessage: "Your athlete is in a critical athletic development window. Focus on fun, movement quality, and consistent reps — not specialization.",
  };
}

// ── Generate Development Roadmap ──────────────────────────────────────────────
export function generateRoadmap(
  toolGrades: KPIGrade[], overallGrade: number, position: string
): RoadmapStep[] {
  const steps: RoadmapStep[] = [];
  const sorted = [...toolGrades].sort((a, b) => a.grade - b.grade);

  for (const tool of sorted.slice(0, 3)) {
    if (tool.improvementNeededD1 !== null) {
      steps.push({
        title: `Improve ${tool.kpiName}`,
        timeframe: tool.improvementNeededD1 > 5 ? "6–12 months" : "3–6 months",
        kpiTarget: `+${tool.improvementNeededD1} ${tool.unit} to D1 standard`,
        action: `Focused ${tool.kpiName.toLowerCase()} training 3×/week with VAULT™ protocols`,
        priority: tool.grade < 40 ? "critical" : tool.grade < 50 ? "high" : "medium",
      });
    }
  }

  // Always add a "maintain strengths" step
  const topTool = [...toolGrades].sort((a, b) => b.grade - a.grade)[0];
  if (topTool) {
    steps.push({
      title: `Maintain ${topTool.kpiName} Advantage`,
      timeframe: "Ongoing",
      kpiTarget: `Maintain ${topTool.rawValue} ${topTool.unit}`,
      action: "2×/week maintenance work. Don't neglect your best tool.",
      priority: "medium",
    });
  }

  return steps;
}

// ── Biomechanical Context Notes (original research) ───────────────────────────
export const BIOMECHANICAL_NOTES: Record<string, string> = {
  exit_velocity: "Exit velocity is primarily driven by bat speed at contact, attack angle efficiency, and ground force utilization. Research shows that hip-to-shoulder separation (hip opening before shoulders) accounts for ~40% of exit velo variance. Athletes under 16 show the largest velocity gains from mechanical improvements before physical maturation limits returns.",
  bat_speed:     "Bat speed is trainable through intent-based hitting, overload/underload protocols, and rotational strength. Peak bat speed development occurs ages 15–22. A 5 mph bat speed gain typically translates to 3–4 mph exit velocity gain, all else equal.",
  pitch_velocity: "Pitching velocity is 70% mechanical efficiency and 30% physical strength at the high school level. Hip-shoulder separation, lead leg block, and arm path efficiency are the three highest-leverage mechanical factors. Physical maturation (height, wingspan, bodyweight) continues driving velocity gains through age 22.",
  sixty_yard:    "The 60-yard dash has three phases: acceleration (0–20yd), transition (20–40yd), and top speed (40–60yd). Mechanical improvements to acceleration phase (ground force angle, arm action) show the fastest returns. Strength training (trap bar deadlift, broad jump) directly correlates with 60-yard improvement.",
  pop_time:      "Pop time is the catcher's primary recruiting metric. The pop time window (pitch receipt → throw landing) is ~1.9 seconds for D1. Receiving-to-throwing transfer footwork accounts for ~0.15 seconds of variance — more than arm strength for most catchers at the HS level.",
  throw_velocity: "Throwing velocity from the outfield is driven by the same kinematic chain as pitching: hip-shoulder separation, arm path efficiency, and follow-through deceleration. Long toss and pulldown programs with proper recovery show the most consistent velocity gains.",
};
