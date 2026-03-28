// Development Intelligence Engine v2
// Rules-based recommendation system — the platform's core differentiator.
// Works automatically between lessons, turning data into personalized development.

import { SportType } from '@/lib/sportTypes';

// ─── Types ───────────────────────────────────────────────────────────────────

export type DevelopmentStatus = 'improving' | 'stable' | 'stalled' | 'regressing';
export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';
export type AlertType =
  | 'stalled' | 'regression' | 'missing_sessions' | 'ready_to_progress'
  | 'needs_review' | 'compliance_low' | 'overuse' | 'plateau'
  | 'mental_health' | 're_engagement' | 'parent_alert';

export type SoftballFormat = 'fastpitch' | 'slowpitch';
export type SeasonContext = 'in_season' | 'offseason' | 'preseason';

// ─── INPUT types ─────────────────────────────────────────────────────────────

export interface KPIDataPoint {
  name: string;
  category: string;
  value: number;
  unit: string;
  recordedAt: string;
  source?: string;
}

export interface AssessmentScore {
  category: string;
  criteriaId: string;
  criteriaName: string;
  score: number;
  maxScore: number;
  phase?: string; // for fastpitch pitching phases
}

export interface LessonOutcome {
  lessonId: string;
  date: string;
  weaknessTags: string[];
  strengthNotes: string[];
  coachId?: string;
}

export interface WorkloadRecord {
  date: string;
  throwingCount: number;
  pitchCount: number;
  trainingMinutes: number;
  lessonMinutes: number;
  drillSetsCompleted: number;
  recoveryStatus: 'full' | 'limited' | 'rest_day';
  sorenessLevel: number;
  sleepHours: number;
  readinessScore: number;
  overuseFlag: boolean;
}

export interface DrillAssignment {
  drillId: string;
  assignedAt: string;
  completedAt?: string;
  isCompleted: boolean;
  streak: number;
}

export interface ProgramAssignment {
  programId: string;
  progressPct: number;
  completionPct: number;
  startedAt: string;
}

export interface MentalPerformanceRecord {
  date: string;
  confidenceScore: number; // 1-10
  focusScore: number;
  pressureIndex: number;
}

export interface AthleteScores {
  readinessScore: number;
  consistencyScore: number;
  complianceScore: number;
  improvementStatus: DevelopmentStatus;
  overallScore: number;
}

export interface AthleteProfile {
  age?: number;
  ageGroup?: string;
  position?: string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  sportType: SportType;
  softballFormat?: SoftballFormat;
  statedGoals?: string[];
}

export interface TimeContext {
  season: SeasonContext;
  daysSinceLastLesson: number;
  currentDate: string;
}

export interface TrainingHistory {
  totalSessions: number;
  completedSessions: number;
  missedSessions: number;
  currentStreak: number;
  weeklyCompliancePct: number;
  trainingTypes: string[];
}

export interface CoachFeedbackInput {
  strengths: string[];
  weaknesses: string[];
  priorities: string[];
  mechanicalFocus: string[];
}

export interface IntelligenceInput {
  profile: AthleteProfile;
  assessments: AssessmentScore[];
  kpis: KPIDataPoint[];
  kpiHistory: KPIDataPoint[][]; // last N weeks
  training: TrainingHistory;
  coachFeedback?: CoachFeedbackInput;
  lessonOutcomes: LessonOutcome[];
  workload: WorkloadRecord[];
  drillAssignments: DrillAssignment[];
  programAssignments: ProgramAssignment[];
  mentalPerformance: MentalPerformanceRecord[];
  athleteScores?: AthleteScores;
  timeContext: TimeContext;
}

// ─── OUTPUT types ────────────────────────────────────────────────────────────

export interface StrengthItem {
  area: string;
  detail: string;
  score?: number;
}

export interface GapItem {
  area: string;
  detail: string;
  score?: number;
  priority: PriorityLevel;
  benchmarkValue?: number;
  currentValue?: number;
}

export interface DrillRecommendation {
  drillId: string;
  reason: string;
  priority: PriorityLevel;
}

export interface ProgramRecommendation {
  programId: string;
  reason: string;
}

export interface CourseRecommendation {
  courseId: string;
  reason: string;
  linkedWeakness: string;
}

export interface DayPlan {
  day: string;
  activities: string[];
  focusArea: string;
  isRestDay: boolean;
}

export interface WeeklyPlan {
  focusAreas: string[];
  drillAssignments: { drillId: string; sessionsPerWeek: number }[];
  kpiRetests: { name: string; targetDay: string }[];
  strengthSessions: number;
  notes: string;
  dailyPlan: DayPlan[];
}

export interface IntelligenceAlert {
  type: AlertType;
  title: string;
  message: string;
  severity: PriorityLevel;
  athleteId?: string;
  createdAt: string;
  notifyCoach?: boolean;
  notifyParent?: boolean;
}

export interface IntelligenceOutput {
  status: DevelopmentStatus;
  overallScore: number;
  strengths: StrengthItem[];
  gaps: GapItem[];
  priorities: string[];
  recommendedDrills: DrillRecommendation[];
  recommendedPrograms: ProgramRecommendation[];
  recommendedCourses: CourseRecommendation[];
  weeklyPlan: WeeklyPlan;
  alerts: IntelligenceAlert[];
}

// ─── Sport-Specific Thresholds ───────────────────────────────────────────────

interface KPIThreshold {
  name: string;
  category: string;
  beginner: { low: number; avg: number; good: number };
  intermediate: { low: number; avg: number; good: number };
  advanced: { low: number; avg: number; good: number };
  elite: { low: number; avg: number; good: number };
}

const baseballThresholds: KPIThreshold[] = [
  { name: 'exit_velocity', category: 'hitting', beginner: { low: 55, avg: 65, good: 75 }, intermediate: { low: 70, avg: 78, good: 85 }, advanced: { low: 80, avg: 88, good: 95 }, elite: { low: 90, avg: 95, good: 100 } },
  { name: 'bat_speed', category: 'hitting', beginner: { low: 45, avg: 55, good: 62 }, intermediate: { low: 58, avg: 65, good: 72 }, advanced: { low: 68, avg: 74, good: 80 }, elite: { low: 76, avg: 80, good: 85 } },
  { name: 'pitch_velocity', category: 'pitching', beginner: { low: 50, avg: 60, good: 70 }, intermediate: { low: 65, avg: 75, good: 82 }, advanced: { low: 78, avg: 85, good: 92 }, elite: { low: 88, avg: 92, good: 97 } },
  { name: 'spin_rate', category: 'pitching', beginner: { low: 1400, avg: 1800, good: 2100 }, intermediate: { low: 1800, avg: 2100, good: 2400 }, advanced: { low: 2100, avg: 2400, good: 2700 }, elite: { low: 2400, avg: 2700, good: 3000 } },
  { name: 'command_pct', category: 'pitching', beginner: { low: 40, avg: 50, good: 60 }, intermediate: { low: 50, avg: 60, good: 70 }, advanced: { low: 60, avg: 70, good: 80 }, elite: { low: 70, avg: 78, good: 85 } },
  { name: 'sixty_yard', category: 'speed', beginner: { low: 8.5, avg: 7.8, good: 7.2 }, intermediate: { low: 7.8, avg: 7.2, good: 6.8 }, advanced: { low: 7.2, avg: 6.8, good: 6.4 }, elite: { low: 6.8, avg: 6.5, good: 6.2 } },
  { name: 'pop_time', category: 'speed', beginner: { low: 2.5, avg: 2.2, good: 2.0 }, intermediate: { low: 2.2, avg: 2.0, good: 1.9 }, advanced: { low: 2.0, avg: 1.9, good: 1.8 }, elite: { low: 1.9, avg: 1.85, good: 1.75 } },
];

const softballThresholds: KPIThreshold[] = [
  { name: 'exit_velocity', category: 'hitting', beginner: { low: 40, avg: 50, good: 58 }, intermediate: { low: 52, avg: 60, good: 68 }, advanced: { low: 62, avg: 70, good: 78 }, elite: { low: 72, avg: 78, good: 85 } },
  { name: 'bat_speed', category: 'hitting', beginner: { low: 40, avg: 50, good: 58 }, intermediate: { low: 52, avg: 60, good: 66 }, advanced: { low: 60, avg: 68, good: 74 }, elite: { low: 68, avg: 74, good: 80 } },
  { name: 'pitch_speed', category: 'pitching', beginner: { low: 35, avg: 42, good: 50 }, intermediate: { low: 45, avg: 52, good: 58 }, advanced: { low: 55, avg: 62, good: 68 }, elite: { low: 62, avg: 68, good: 72 } },
  { name: 'spin_rate', category: 'pitching', beginner: { low: 800, avg: 1100, good: 1400 }, intermediate: { low: 1100, avg: 1400, good: 1700 }, advanced: { low: 1400, avg: 1700, good: 2000 }, elite: { low: 1700, avg: 2000, good: 2300 } },
  { name: 'home_to_first', category: 'speed', beginner: { low: 3.8, avg: 3.4, good: 3.0 }, intermediate: { low: 3.4, avg: 3.0, good: 2.8 }, advanced: { low: 3.0, avg: 2.8, good: 2.6 }, elite: { low: 2.8, avg: 2.6, good: 2.4 } },
  { name: 'throw_velocity', category: 'fielding', beginner: { low: 38, avg: 45, good: 52 }, intermediate: { low: 45, avg: 52, good: 58 }, advanced: { low: 52, avg: 58, good: 65 }, elite: { low: 58, avg: 65, good: 70 } },
  { name: 'steal_time', category: 'speed', beginner: { low: 3.5, avg: 3.0, good: 2.7 }, intermediate: { low: 3.0, avg: 2.7, good: 2.4 }, advanced: { low: 2.7, avg: 2.4, good: 2.2 }, elite: { low: 2.4, avg: 2.2, good: 2.0 } },
  { name: 'rise_ball_recognition', category: 'hitting', beginner: { low: 30, avg: 45, good: 55 }, intermediate: { low: 45, avg: 55, good: 65 }, advanced: { low: 55, avg: 65, good: 75 }, elite: { low: 65, avg: 75, good: 85 } },
  { name: 'pop_time', category: 'catching', beginner: { low: 2.4, avg: 2.1, good: 1.9 }, intermediate: { low: 2.1, avg: 1.9, good: 1.7 }, advanced: { low: 1.9, avg: 1.7, good: 1.5 }, elite: { low: 1.7, avg: 1.5, good: 1.3 } },
];

// ─── Drill Mapping ───────────────────────────────────────────────────────────

interface DrillMap { [key: string]: string[]; }

const baseballDrillMap: DrillMap = {
  'bat_speed': ['bat-speed-overload', 'bat-speed-underload', 'dry-swing-velo'],
  'exit_velocity': ['tee-exit-velo', 'front-toss-power', 'bp-game-velo'],
  'pitch_velocity': ['long-toss-progression', 'weighted-ball', 'mound-velo-work'],
  'command_pct': ['bullpen-command', 'target-work', 'pitch-location-drill'],
  'spin_rate': ['wrist-snap-drill', 'spin-efficiency-work'],
  'sixty_yard': ['sprint-mechanics', 'block-starts', 'acceleration-ladders'],
  'pop_time': ['receiving-transfer', 'footwork-throws', 'quick-release'],
  'hitting_general': ['tee-work', 'soft-toss', 'live-bp'],
  'fielding_general': ['ground-ball-work', 'fly-ball-reads', 'double-play-turns'],
};

const softballDrillMap: DrillMap = {
  'bat_speed': ['h-002', 'h-004', 'h-006'],
  'exit_velocity': ['h-001', 'h-006', 'h-003'],
  'pitch_speed': ['p-001', 'p-010', 'p-003'],
  'spin_rate': ['p-006', 'p-007', 'p-008'],
  'home_to_first': ['b-001', 'b-002'],
  'throw_velocity': ['f-003', 'f-006'],
  'steal_time': ['b-001', 'b-004'],
  'rise_ball_recognition': ['h-007', 'h-008'],
  'pop_time': ['f-008', 'f-009'],
  'hitting_general': ['h-001', 'h-003', 'h-005'],
  'fielding_general': ['f-001', 'f-002', 'f-004'],
  'baserunning_general': ['b-001', 'b-002', 'b-003'],
  'pitching_general': ['p-001', 'p-004', 'p-005'],
  'mental_general': ['mental-visualization', 'mental-breathing', 'mental-routine'],
};

// ─── Program Mapping ─────────────────────────────────────────────────────────

interface ProgramMap { [gap: string]: string; }

const baseballProgramMap: ProgramMap = {
  'hitting': 'hitting-power-program',
  'pitching': 'velocity-program',
  'speed': 'speed-agility-program',
  'fielding': 'defensive-development',
  'general': 'complete-player-program',
};

const softballProgramMap: ProgramMap = {
  'hitting': 'prog-hitting',
  'pitching': 'prog-pitching',
  'fielding': 'prog-defensive',
  'baserunning': 'prog-beginner',
  'general': 'prog-offseason',
};

// ─── Course Mapping (weakness → course) ──────────────────────────────────────

interface CourseMap { [weakness: string]: { courseId: string; label: string }; }

const baseballCourseMap: CourseMap = {
  'hitting': { courseId: 'hitting-mastery', label: 'Hitting Mastery' },
  'pitching': { courseId: 'velocity-system', label: 'Velocity System' },
  'fielding': { courseId: 'fielding-fundamentals', label: 'Fielding Fundamentals' },
};

const softballCourseMap: CourseMap = {
  'hitting': { courseId: 'softball-hitting', label: 'Softball Hitting' },
  'pitching': { courseId: 'fastpitch-pitching', label: 'Fastpitch Pitching Mechanics' },
  'fielding': { courseId: 'softball-fielding', label: 'Defensive Skills' },
  'rise_ball_recognition': { courseId: 'pitch-recognition', label: 'Pitch Recognition' },
  'mental': { courseId: 'mental-performance', label: 'Mental Performance' },
};

// ─── Workload Thresholds by age group ────────────────────────────────────────

interface WorkloadLimits {
  maxPitchesPerDay: number;
  maxPitchesPerWeek: number;
  maxTrainingMinPerWeek: number;
}

const pitchLimits: Record<string, WorkloadLimits> = {
  '10U': { maxPitchesPerDay: 50, maxPitchesPerWeek: 150, maxTrainingMinPerWeek: 300 },
  '12U': { maxPitchesPerDay: 50, maxPitchesPerWeek: 150, maxTrainingMinPerWeek: 360 },
  '14U': { maxPitchesPerDay: 75, maxPitchesPerWeek: 200, maxTrainingMinPerWeek: 420 },
  '16U': { maxPitchesPerDay: 100, maxPitchesPerWeek: 250, maxTrainingMinPerWeek: 480 },
  '18U': { maxPitchesPerDay: 100, maxPitchesPerWeek: 250, maxTrainingMinPerWeek: 540 },
  'College': { maxPitchesPerDay: 120, maxPitchesPerWeek: 300, maxTrainingMinPerWeek: 600 },
  'default': { maxPitchesPerDay: 75, maxPitchesPerWeek: 200, maxTrainingMinPerWeek: 420 },
};

const LOWER_IS_BETTER = ['sixty_yard', 'pop_time', 'home_to_first', 'steal_time'];

// ─── CORE ENGINE ─────────────────────────────────────────────────────────────

export function analyzeAthlete(input: IntelligenceInput): IntelligenceOutput {
  const {
    profile, assessments, kpis, kpiHistory, training, coachFeedback,
    lessonOutcomes, workload, drillAssignments, programAssignments,
    mentalPerformance, athleteScores, timeContext,
  } = input;

  const thresholds = profile.sportType === 'softball' ? softballThresholds : baseballThresholds;
  const drillMap = profile.sportType === 'softball' ? softballDrillMap : baseballDrillMap;
  const programMap = profile.sportType === 'softball' ? softballProgramMap : baseballProgramMap;
  const courseMap = profile.sportType === 'softball' ? softballCourseMap : baseballCourseMap;
  const limits = pitchLimits[profile.ageGroup || 'default'] || pitchLimits['default'];

  const strengths: StrengthItem[] = [];
  const gaps: GapItem[] = [];
  const alerts: IntelligenceAlert[] = [];
  const now = new Date().toISOString();

  // ── 1. Assessment analysis ─────────────────────────────────────
  for (const a of assessments) {
    const pct = (a.score / a.maxScore) * 100;
    if (pct >= 75) {
      strengths.push({ area: a.criteriaName, detail: `${a.category} — ${Math.round(pct)}%`, score: pct });
    } else if (pct < 50) {
      gaps.push({ area: a.criteriaName, detail: `${a.category} — ${Math.round(pct)}%`, score: pct, priority: pct < 30 ? 'critical' : 'high' });
    } else {
      gaps.push({ area: a.criteriaName, detail: `${a.category} — ${Math.round(pct)}%`, score: pct, priority: 'medium' });
    }
  }

  // ── 2. KPI vs benchmark analysis ───────────────────────────────
  const latestKPIs = getLatestKPIs(kpis);
  for (const kpi of latestKPIs) {
    const threshold = thresholds.find(t => t.name === kpi.name);
    if (!threshold) continue;
    const lvl = threshold[profile.experienceLevel] || threshold['intermediate'];
    const isLower = LOWER_IS_BETTER.includes(kpi.name);

    if (isLower) {
      if (kpi.value <= lvl.good) {
        strengths.push({ area: kpi.name.replace(/_/g, ' '), detail: `${kpi.value} ${kpi.unit} — above avg`, score: 85 });
      } else if (kpi.value >= lvl.low) {
        gaps.push({ area: kpi.name.replace(/_/g, ' '), detail: `${kpi.value} ${kpi.unit} — below threshold`, score: 30, priority: 'high', benchmarkValue: lvl.good, currentValue: kpi.value });
      }
    } else {
      if (kpi.value >= lvl.good) {
        strengths.push({ area: kpi.name.replace(/_/g, ' '), detail: `${kpi.value} ${kpi.unit} — above avg`, score: 85 });
      } else if (kpi.value <= lvl.low) {
        gaps.push({ area: kpi.name.replace(/_/g, ' '), detail: `${kpi.value} ${kpi.unit} — below threshold`, score: 30, priority: 'high', benchmarkValue: lvl.good, currentValue: kpi.value });
      }
    }
  }

  // ── 3. Lesson outcome pattern analysis (weakness streaks) ──────
  const weaknessFrequency = countWeaknessTags(lessonOutcomes);
  for (const [tag, count] of Object.entries(weaknessFrequency)) {
    if (count >= 3) {
      // Weakness in 3+ consecutive lessons → escalate
      gaps.push({ area: tag, detail: `Flagged in ${count} consecutive lessons`, priority: 'critical' });
      alerts.push({
        type: 'needs_review',
        title: `Recurring Weakness: ${tag}`,
        message: `"${tag}" has appeared in ${count} consecutive lessons. Escalating priority and flagging for coach review.`,
        severity: 'critical', createdAt: now, notifyCoach: true,
      });
    }
  }

  // ── 4. Workload / overuse analysis ─────────────────────────────
  const workloadAlerts = analyzeWorkload(workload, limits, profile, now);
  alerts.push(...workloadAlerts);
  const isAtWorkloadLimit = workloadAlerts.some(a => a.type === 'overuse');

  // ── 5. Mental performance analysis ─────────────────────────────
  const mentalAlerts = analyzeMentalPerformance(mentalPerformance, profile, now);
  alerts.push(...mentalAlerts);

  // ── 6. Training consistency ────────────────────────────────────
  if (training.weeklyCompliancePct < 50) {
    gaps.push({ area: 'Training Consistency', detail: `${training.weeklyCompliancePct}% weekly compliance`, score: training.weeklyCompliancePct, priority: 'critical' });
  } else if (training.weeklyCompliancePct >= 80) {
    strengths.push({ area: 'Training Consistency', detail: `${training.weeklyCompliancePct}% weekly compliance`, score: training.weeklyCompliancePct });
  }

  // Drill compliance check
  const drillCompliance = computeDrillCompliance(drillAssignments);
  if (drillCompliance < 40) {
    alerts.push({
      type: 'compliance_low',
      title: 'Low Drill Compliance',
      message: `Athlete completing only ${drillCompliance}% of assigned drills over the past 14 days.`,
      severity: 'high', createdAt: now, notifyCoach: true,
    });
  }

  // ── 7. Coach feedback overlay ──────────────────────────────────
  if (coachFeedback) {
    for (const s of coachFeedback.strengths) {
      if (!strengths.find(x => x.area.toLowerCase().includes(s.toLowerCase()))) {
        strengths.push({ area: s, detail: 'Identified by coach' });
      }
    }
    for (const w of coachFeedback.weaknesses) {
      if (!gaps.find(x => x.area.toLowerCase().includes(w.toLowerCase()))) {
        gaps.push({ area: w, detail: 'Flagged by coach', priority: 'high' });
      }
    }
  }

  // ── 8. Re-engagement check ─────────────────────────────────────
  if (timeContext.daysSinceLastLesson >= 21) {
    alerts.push({
      type: 're_engagement',
      title: 'No Recent Lessons',
      message: `${timeContext.daysSinceLastLesson} days since last lesson. Sending re-engagement notification.`,
      severity: 'medium', createdAt: now, notifyCoach: true,
      notifyParent: isYouthAthlete(profile),
    });
  }

  // Sort gaps by priority
  const priorityOrder: Record<PriorityLevel, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  gaps.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // ── 9. Top priorities (goal-weighted) ──────────────────────────
  const priorities = buildPriorities(gaps, coachFeedback, profile.statedGoals);

  // ── 10. Development status (with plateau detection) ────────────
  const status = determineDevelopmentStatus(kpiHistory, training, athleteScores);

  // Plateau & regression alerts
  const plateauKPIs = detectPlateaus(kpiHistory);
  for (const kpiName of plateauKPIs) {
    alerts.push({
      type: 'plateau',
      title: `${kpiName.replace(/_/g, ' ')} Plateaued`,
      message: `No change in ${kpiName.replace(/_/g, ' ')} across 3+ sessions. Escalating to different drill type.`,
      severity: 'high', createdAt: now, notifyCoach: true,
    });
  }

  if (status === 'regressing') {
    alerts.push({
      type: 'regression',
      title: 'Regression Detected',
      message: 'Key performance metrics are declining. Immediate coach review needed.',
      severity: 'critical', createdAt: now, notifyCoach: true,
      notifyParent: isYouthAthlete(profile),
    });
  }
  if (status === 'stalled') {
    alerts.push({
      type: 'stalled',
      title: 'Development Stalled',
      message: 'No KPI improvement detected in recent weeks. Coach review recommended.',
      severity: 'high', createdAt: now, notifyCoach: true,
    });
  }

  // ── 11. Drill recommendations (contextual rules enforced) ─────
  const recentDrillIds = getRecentDrillIds(drillAssignments, 3);
  const recommendedDrills = buildDrillRecommendations(
    gaps, drillMap, profile, isAtWorkloadLimit, recentDrillIds, timeContext
  );

  // ── 12. Program recommendations ───────────────────────────────
  const recommendedPrograms = buildProgramRecommendations(gaps, programMap, programAssignments, timeContext);

  // ── 13. Course recommendations ─────────────────────────────────
  const recommendedCourses = buildCourseRecommendations(gaps, courseMap, profile);

  // ── 14. Overall score ──────────────────────────────────────────
  const overallScore = computeOverallScore(assessments, training, status, athleteScores, mentalPerformance);

  // ── 15. Weekly focus plan ──────────────────────────────────────
  const weeklyPlan = generateWeeklyPlan(priorities, recommendedDrills, training, profile, timeContext, isAtWorkloadLimit);

  // ── 16. Additional contextual alerts ───────────────────────────
  if (training.missedSessions >= 3) {
    alerts.push({ type: 'missing_sessions', title: 'Missed Sessions', message: `${training.missedSessions} sessions missed recently.`, severity: 'medium', createdAt: now });
  }
  const criticalGaps = gaps.filter(g => g.priority === 'critical');
  if (criticalGaps.length >= 2) {
    alerts.push({ type: 'needs_review', title: 'Multiple Critical Gaps', message: `${criticalGaps.length} critical areas. Manual coach review recommended.`, severity: 'high', createdAt: now, notifyCoach: true });
  }
  if (gaps.length > 0 && gaps.every(g => g.priority === 'medium' || g.priority === 'low') && status === 'improving') {
    alerts.push({ type: 'ready_to_progress', title: 'Ready to Progress', message: 'Athlete showing consistent improvement, may be ready for advanced drills.', severity: 'low', createdAt: now });
  }

  return {
    status,
    overallScore,
    strengths: strengths.slice(0, 3),
    gaps: gaps.slice(0, 3),
    priorities,
    recommendedDrills: recommendedDrills.slice(0, 5),
    recommendedPrograms: recommendedPrograms.slice(0, 2),
    recommendedCourses: recommendedCourses.slice(0, 2),
    weeklyPlan,
    alerts,
  };
}

// ─── Helper functions ────────────────────────────────────────────────────────

function getLatestKPIs(kpis: KPIDataPoint[]): KPIDataPoint[] {
  const latest: Record<string, KPIDataPoint> = {};
  for (const k of kpis) {
    if (!latest[k.name] || k.recordedAt > latest[k.name].recordedAt) {
      latest[k.name] = k;
    }
  }
  return Object.values(latest);
}

function countWeaknessTags(outcomes: LessonOutcome[]): Record<string, number> {
  // Count consecutive appearances from the most recent lessons
  const sorted = [...outcomes].sort((a, b) => b.date.localeCompare(a.date));
  const freq: Record<string, number> = {};
  for (const o of sorted.slice(0, 10)) {
    for (const tag of o.weaknessTags) {
      freq[tag] = (freq[tag] || 0) + 1;
    }
  }
  return freq;
}

function analyzeWorkload(
  records: WorkloadRecord[], limits: WorkloadLimits,
  profile: AthleteProfile, now: string
): IntelligenceAlert[] {
  const alerts: IntelligenceAlert[] = [];
  if (records.length === 0) return alerts;

  // Daily check (most recent)
  const today = records[records.length - 1];
  if (today && today.pitchCount > limits.maxPitchesPerDay) {
    alerts.push({
      type: 'overuse', title: 'Daily Pitch Limit Exceeded',
      message: `${today.pitchCount} pitches today (limit: ${limits.maxPitchesPerDay}). Rest recommended.`,
      severity: 'critical', createdAt: now, notifyCoach: true,
      notifyParent: isYouthAthlete(profile),
    });
  }

  // Weekly check
  const last7 = records.slice(-7);
  const weeklyPitches = last7.reduce((s, r) => s + r.pitchCount, 0);
  if (weeklyPitches > limits.maxPitchesPerWeek) {
    alerts.push({
      type: 'overuse', title: 'Weekly Pitch Limit Exceeded',
      message: `${weeklyPitches} pitches this week (limit: ${limits.maxPitchesPerWeek}).`,
      severity: 'critical', createdAt: now, notifyCoach: true,
      notifyParent: isYouthAthlete(profile),
    });
  }

  // Weekly training volume
  const weeklyTraining = last7.reduce((s, r) => s + r.trainingMinutes, 0);
  if (weeklyTraining > limits.maxTrainingMinPerWeek) {
    alerts.push({
      type: 'overuse', title: 'Training Volume Warning',
      message: `${weeklyTraining} training minutes this week (limit: ${limits.maxTrainingMinPerWeek}).`,
      severity: 'high', createdAt: now, notifyCoach: true,
    });
  }

  // Soreness + readiness
  if (today && today.sorenessLevel >= 4) {
    alerts.push({
      type: 'overuse', title: 'High Soreness Reported',
      message: `Soreness level ${today.sorenessLevel}/5. Consider a rest day.`,
      severity: 'high', createdAt: now, notifyCoach: true,
    });
  }

  return alerts;
}

function analyzeMentalPerformance(
  records: MentalPerformanceRecord[], profile: AthleteProfile, now: string
): IntelligenceAlert[] {
  const alerts: IntelligenceAlert[] = [];
  if (records.length < 2) return alerts;

  // Confidence < 4 for 2+ consecutive weeks
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));
  const recent2 = sorted.slice(0, 2);
  if (recent2.every(r => r.confidenceScore < 4)) {
    alerts.push({
      type: 'mental_health', title: 'Low Confidence Pattern',
      message: 'Confidence score below 4 for 2+ consecutive weeks. Recommend mental performance session.',
      severity: 'high', createdAt: now, notifyCoach: true,
      notifyParent: isYouthAthlete(profile),
    });
  }

  return alerts;
}

function computeDrillCompliance(assignments: DrillAssignment[]): number {
  // Last 14 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 14);
  const recent = assignments.filter(a => new Date(a.assignedAt) >= cutoff);
  if (recent.length === 0) return 100;
  const completed = recent.filter(a => a.isCompleted).length;
  return Math.round((completed / recent.length) * 100);
}

function buildPriorities(
  gaps: GapItem[],
  coachFeedback: CoachFeedbackInput | undefined,
  statedGoals?: string[]
): string[] {
  const coachPriorities = coachFeedback?.priorities || [];
  const autoPriorities = gaps.slice(0, 3).map(g => g.area);

  // Weight toward stated goals
  if (statedGoals && statedGoals.length > 0) {
    const goalAligned = autoPriorities.filter(p =>
      statedGoals.some(g => p.toLowerCase().includes(g.toLowerCase()))
    );
    const nonAligned = autoPriorities.filter(p => !goalAligned.includes(p));
    const merged = [...goalAligned, ...nonAligned];
    if (coachPriorities.length > 0) {
      return [...coachPriorities.slice(0, 2), ...merged.filter(p => !coachPriorities.includes(p)).slice(0, 1)];
    }
    return merged.slice(0, 3);
  }

  if (coachPriorities.length > 0) {
    return [...coachPriorities.slice(0, 2), ...autoPriorities.filter(p => !coachPriorities.includes(p)).slice(0, 1)];
  }
  return autoPriorities;
}

function detectPlateaus(kpiHistory: KPIDataPoint[][]): string[] {
  if (kpiHistory.length < 3) return [];
  const plateaued: string[] = [];
  const recentSets = kpiHistory.slice(-3);
  const kpiNames = new Set(recentSets.flatMap(s => s.map(k => k.name)));

  for (const name of kpiNames) {
    const values = recentSets.map(s => s.find(k => k.name === name)?.value).filter(v => v !== undefined) as number[];
    if (values.length >= 3) {
      const range = Math.max(...values) - Math.min(...values);
      const avg = values.reduce((s, v) => s + v, 0) / values.length;
      // < 2% change = plateau
      if (avg > 0 && (range / avg) < 0.02) {
        plateaued.push(name);
      }
    }
  }
  return plateaued;
}

function determineDevelopmentStatus(
  kpiHistory: KPIDataPoint[][],
  training: TrainingHistory,
  athleteScores?: AthleteScores
): DevelopmentStatus {
  // If we have pre-computed status, use it
  if (athleteScores?.improvementStatus) return athleteScores.improvementStatus;

  if (kpiHistory.length < 2) return 'stable';
  const recent = kpiHistory[kpiHistory.length - 1] || [];
  const older = kpiHistory[0] || [];
  let improvements = 0;
  let regressions = 0;

  for (const recentKpi of recent) {
    const matchingOld = older.find(o => o.name === recentKpi.name);
    if (!matchingOld) continue;
    const isLower = LOWER_IS_BETTER.includes(recentKpi.name);
    if (isLower ? recentKpi.value < matchingOld.value : recentKpi.value > matchingOld.value) improvements++;
    if (isLower ? recentKpi.value > matchingOld.value : recentKpi.value < matchingOld.value) regressions++;
  }

  if (training.weeklyCompliancePct < 30) return 'stalled';
  if (regressions > improvements && regressions >= 2) return 'regressing';
  if (improvements > regressions && improvements >= 2) return 'improving';
  if (improvements === 0 && regressions === 0 && kpiHistory.length >= 4) return 'stalled';
  return 'stable';
}

function getRecentDrillIds(assignments: DrillAssignment[], sessions: number): string[] {
  return assignments
    .filter(a => a.isCompleted)
    .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''))
    .slice(0, sessions)
    .map(a => a.drillId);
}

function buildDrillRecommendations(
  gaps: GapItem[], drillMap: DrillMap, profile: AthleteProfile,
  atWorkloadLimit: boolean, recentDrillIds: string[], timeContext: TimeContext
): DrillRecommendation[] {
  const recs: DrillRecommendation[] = [];

  for (const gap of gaps.slice(0, 5)) {
    const kpiKey = gap.area.replace(/\s/g, '_').toLowerCase();
    const category = gap.detail.split(' — ')[0]?.toLowerCase() || '';
    const categoryKey = `${category}_general`;

    // RULE: Never recommend pitching drills at workload limit
    if (atWorkloadLimit && (kpiKey.includes('pitch') || category === 'pitching')) continue;

    // RULE: Never show fastpitch drills to slowpitch-only athletes
    if (profile.softballFormat === 'slowpitch' && kpiKey.includes('pitch_speed')) continue;

    const drills = drillMap[kpiKey] || drillMap[categoryKey] || [];
    for (const drillId of drills.slice(0, 2)) {
      // RULE: Never recommend same drill 3 consecutive sessions
      if (recentDrillIds.slice(0, 3).filter(id => id === drillId).length >= 2) continue;

      if (!recs.find(d => d.drillId === drillId)) {
        recs.push({ drillId, reason: `Improve ${gap.area}`, priority: gap.priority });
      }
    }
  }

  // RULE: In-season → prioritize maintenance; offseason → development
  if (timeContext.season === 'in_season') {
    recs.sort((a, b) => {
      const aMain = a.priority === 'critical' ? 0 : 1;
      const bMain = b.priority === 'critical' ? 0 : 1;
      return aMain - bMain;
    });
  }

  return recs.slice(0, 5);
}

function buildProgramRecommendations(
  gaps: GapItem[], programMap: ProgramMap,
  current: ProgramAssignment[], timeContext: TimeContext
): ProgramRecommendation[] {
  const recs: ProgramRecommendation[] = [];
  const activeProgIds = current.filter(p => p.completionPct < 100).map(p => p.programId);

  const gapCategories = [...new Set(gaps.slice(0, 3).map(g => {
    const cat = g.detail.split(' — ')[0]?.toLowerCase();
    return cat || 'general';
  }))];

  for (const cat of gapCategories) {
    const progId = programMap[cat] || programMap['general'];
    if (progId && !recs.find(p => p.programId === progId) && !activeProgIds.includes(progId)) {
      const reason = timeContext.season === 'offseason'
        ? `Offseason development: ${cat}`
        : `Address ${cat} development gaps`;
      recs.push({ programId: progId, reason });
    }
  }

  return recs.slice(0, 2);
}

function buildCourseRecommendations(
  gaps: GapItem[], courseMap: CourseMap, profile: AthleteProfile
): CourseRecommendation[] {
  const recs: CourseRecommendation[] = [];
  const seenCategories = new Set<string>();

  for (const gap of gaps.slice(0, 5)) {
    const kpiKey = gap.area.replace(/\s/g, '_').toLowerCase();
    const category = gap.detail.split(' — ')[0]?.toLowerCase() || '';

    // Try exact KPI match first, then category
    const match = courseMap[kpiKey] || courseMap[category];
    if (match && !seenCategories.has(match.courseId)) {
      seenCategories.add(match.courseId);
      recs.push({
        courseId: match.courseId,
        reason: `Linked to weakness: ${gap.area}`,
        linkedWeakness: gap.area,
      });
    }
  }

  return recs.slice(0, 2);
}

function computeOverallScore(
  assessments: AssessmentScore[], training: TrainingHistory,
  status: DevelopmentStatus, athleteScores?: AthleteScores,
  mentalPerformance?: MentalPerformanceRecord[]
): number {
  if (athleteScores?.overallScore) return athleteScores.overallScore;

  const assessmentAvg = assessments.length > 0
    ? assessments.reduce((s, a) => s + (a.score / a.maxScore) * 100, 0) / assessments.length
    : 50;
  const consistencyBonus = training.weeklyCompliancePct * 0.2;
  const mentalBonus = mentalPerformance && mentalPerformance.length > 0
    ? (mentalPerformance[mentalPerformance.length - 1].confidenceScore / 10) * 5
    : 0;
  const statusMod = status === 'improving' ? 10 : status === 'regressing' ? -5 : 0;

  return Math.round(Math.min(100, Math.max(0,
    assessmentAvg * 0.65 + consistencyBonus + mentalBonus + statusMod
  )));
}

function isYouthAthlete(profile: AthleteProfile): boolean {
  if (profile.age && profile.age < 16) return true;
  const youthGroups = ['10U', '12U', '14U'];
  return youthGroups.includes(profile.ageGroup || '');
}

// ─── Day-by-Day Weekly Plan ──────────────────────────────────────────────────

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function generateWeeklyPlan(
  priorities: string[], drills: DrillRecommendation[],
  training: TrainingHistory, profile: AthleteProfile,
  timeContext: TimeContext, atWorkloadLimit: boolean
): WeeklyPlan {
  const sessionsTarget = training.weeklyCompliancePct < 50 ? 2 : training.weeklyCompliancePct < 70 ? 3 : 4;

  // Build day-by-day plan
  const dailyPlan: DayPlan[] = DAYS.map((day, i) => {
    const isRestDay = i === 6 || (atWorkloadLimit && i >= 4);
    if (isRestDay) {
      return { day, activities: ['Active recovery', 'Stretching'], focusArea: 'Recovery', isRestDay: true };
    }

    const activities: string[] = [];
    const focusIdx = i % priorities.length;
    const focus = priorities[focusIdx] || 'General Development';

    if (i < sessionsTarget) {
      const drill = drills[i % drills.length];
      if (drill) activities.push(`Drill: ${drill.drillId}`);
    }

    if (i === 0 || i === 3) activities.push('Strength & Conditioning');
    if (i === 1 || i === 4) activities.push('Skill Work');
    if (i === 2) activities.push('Mental Performance');
    if (i === 5) activities.push('Game Simulation / Scrimmage');

    return { day, activities, focusArea: focus, isRestDay: false };
  });

  const notes = atWorkloadLimit
    ? 'Workload limits reached — extra rest days enforced. Focus on recovery and mental skills.'
    : timeContext.season === 'in_season'
    ? 'In-season: maintain performance, limit new skill work. Focus on game prep and recovery.'
    : timeContext.season === 'offseason'
    ? 'Offseason: push development intensity. Great time for new skills and strength gains.'
    : training.weeklyCompliancePct < 50
    ? 'Focus on showing up consistently. Keep workouts short and achievable.'
    : 'Push intensity on primary drills. Track KPI improvements at end of week.';

  return {
    focusAreas: priorities.slice(0, 3),
    drillAssignments: drills.slice(0, sessionsTarget + 1).map(d => ({
      drillId: d.drillId,
      sessionsPerWeek: d.priority === 'critical' ? 3 : 2,
    })),
    kpiRetests: priorities.slice(0, 2).map((p, i) => ({
      name: p,
      targetDay: i === 0 ? 'Friday' : 'Saturday',
    })),
    strengthSessions: sessionsTarget >= 3 ? 2 : 1,
    notes,
    dailyPlan,
  };
}

// ─── Build input from Supabase data ──────────────────────────────────────────

export function buildIntelligenceInput(
  sportType: SportType,
  checkins: any[],
  kpiRecords: any[],
  assessmentScores: AssessmentScore[],
  coachFeedback?: CoachFeedbackInput,
  profileData?: { age?: number; position?: string; ageGroup?: string; softballFormat?: SoftballFormat; statedGoals?: string[] },
  lessonFeedback?: any[],
  workloadRecords?: any[],
  drillAssignments?: any[],
  programAssignments?: any[],
  mentalRecords?: any[],
  athleteScores?: any,
): IntelligenceInput {
  const experienceLevel: AthleteProfile['experienceLevel'] =
    checkins.length > 100 ? 'elite' : checkins.length > 60 ? 'advanced' : checkins.length > 20 ? 'intermediate' : 'beginner';

  // Build KPI data points
  const kpis: KPIDataPoint[] = kpiRecords
    .sort((a: any, b: any) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())
    .slice(0, 100)
    .map((k: any) => ({
      name: k.kpi_name,
      category: k.kpi_category,
      value: k.kpi_value,
      unit: k.kpi_unit || '',
      recordedAt: k.recorded_at,
      source: k.source,
    }));

  // KPI history grouped by week
  const weekGroups: Record<string, KPIDataPoint[]> = {};
  for (const k of kpiRecords) {
    const week = k.recorded_at?.substring(0, 10) || 'unknown';
    if (!weekGroups[week]) weekGroups[week] = [];
    weekGroups[week].push({ name: k.kpi_name, category: k.kpi_category, value: k.kpi_value, unit: k.kpi_unit || '', recordedAt: k.recorded_at });
  }
  const kpiHistory = Object.values(weekGroups).slice(-6);

  // Training history
  const last30 = checkins.slice(-30);
  const completed = last30.filter((c: any) => c.training_completed);
  let streak = 0;
  for (let i = last30.length - 1; i >= 0; i--) {
    if (last30[i].training_completed) streak++;
    else break;
  }
  const training: TrainingHistory = {
    totalSessions: last30.length,
    completedSessions: completed.length,
    missedSessions: last30.length - completed.length,
    currentStreak: streak,
    weeklyCompliancePct: last30.length > 0 ? Math.round((completed.length / last30.length) * 100) : 0,
    trainingTypes: [...new Set(last30.map((c: any) => c.training_type).filter(Boolean))],
  };

  // Lesson outcomes
  const lessonOutcomes: LessonOutcome[] = (lessonFeedback || []).map((lf: any) => ({
    lessonId: lf.lesson_id || lf.id,
    date: lf.created_at || lf.submitted_at,
    weaknessTags: (lf.areas_for_improvement || '').split(',').map((s: string) => s.trim()).filter(Boolean),
    strengthNotes: (lf.strengths_observed || '').split(',').map((s: string) => s.trim()).filter(Boolean),
    coachId: lf.coach_user_id,
  }));

  // Workload
  const workload: WorkloadRecord[] = (workloadRecords || []).map((w: any) => ({
    date: w.record_date,
    throwingCount: w.throwing_count || 0,
    pitchCount: w.pitch_count || 0,
    trainingMinutes: w.training_minutes || 0,
    lessonMinutes: w.lesson_minutes || 0,
    drillSetsCompleted: w.drill_sets_completed || 0,
    recoveryStatus: w.recovery_status || 'full',
    sorenessLevel: w.soreness_level || 1,
    sleepHours: w.sleep_hours || 8,
    readinessScore: w.readiness_score || 0,
    overuseFlag: w.overuse_flag || false,
  }));

  // Drill assignments
  const drills: DrillAssignment[] = (drillAssignments || []).map((d: any) => ({
    drillId: d.drill_id || d.id,
    assignedAt: d.assigned_at || d.created_at,
    completedAt: d.completed_at,
    isCompleted: d.is_completed || false,
    streak: d.streak || 0,
  }));

  // Program assignments
  const programs: ProgramAssignment[] = (programAssignments || []).map((p: any) => ({
    programId: p.program_id || p.id,
    progressPct: p.progress_pct || 0,
    completionPct: p.completion_pct || 0,
    startedAt: p.started_at || p.created_at,
  }));

  // Mental performance
  const mental: MentalPerformanceRecord[] = (mentalRecords || []).map((m: any) => ({
    date: m.record_date || m.created_at,
    confidenceScore: m.confidence_score || 5,
    focusScore: m.focus_score || 5,
    pressureIndex: m.pressure_index || 5,
  }));

  // Time context
  const lastLessonDate = lessonOutcomes.length > 0
    ? lessonOutcomes.sort((a, b) => b.date.localeCompare(a.date))[0].date
    : null;
  const daysSinceLastLesson = lastLessonDate
    ? Math.floor((Date.now() - new Date(lastLessonDate).getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  // Determine season (simple heuristic: Apr–Sep = in-season, Oct–Feb = offseason, Mar = preseason)
  const month = new Date().getMonth();
  const season: SeasonContext = month >= 3 && month <= 8 ? 'in_season' : month === 2 ? 'preseason' : 'offseason';

  const scores: AthleteScores | undefined = athleteScores ? {
    readinessScore: athleteScores.readiness_score || 0,
    consistencyScore: athleteScores.consistency_score || 0,
    complianceScore: athleteScores.compliance_score || 0,
    improvementStatus: athleteScores.improvement_status as DevelopmentStatus || 'stable',
    overallScore: athleteScores.overall_score || 0,
  } : undefined;

  return {
    profile: {
      age: profileData?.age,
      ageGroup: profileData?.ageGroup,
      position: profileData?.position,
      experienceLevel,
      sportType,
      softballFormat: profileData?.softballFormat,
      statedGoals: profileData?.statedGoals,
    },
    assessments: assessmentScores,
    kpis,
    kpiHistory,
    training,
    coachFeedback,
    lessonOutcomes,
    workload,
    drillAssignments: drills,
    programAssignments: programs,
    mentalPerformance: mental,
    athleteScores: scores,
    timeContext: {
      season,
      daysSinceLastLesson,
      currentDate: new Date().toISOString(),
    },
  };
}
