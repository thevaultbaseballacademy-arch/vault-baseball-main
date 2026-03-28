// Softball Training Programs
// Structured development plans composed of drills, schedules, and KPIs

import { SkillCategory } from "./drills";

export interface ProgramWeek {
  week: number;
  focus: string;
  drillIds: string[];
  kpiTargets?: Record<string, string>;
  notes?: string;
}

export interface TrainingProgram {
  id: string;
  name: string;
  description: string;
  category: SkillCategory | 'general';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  durationWeeks: number;
  sessionsPerWeek: number;
  targetAgeRange: string;
  goals: string[];
  weeks: ProgramWeek[];
  kpisTracked: string[];
}

export const softballPrograms: TrainingProgram[] = [
  {
    id: "prog-beginner",
    name: "Beginner Development Program",
    description: "A comprehensive introduction to softball fundamentals for new players. Builds a strong foundation across all skill areas.",
    category: "general",
    difficulty: "beginner",
    durationWeeks: 8,
    sessionsPerWeek: 3,
    targetAgeRange: "8-12",
    goals: [
      "Learn proper throwing and catching mechanics",
      "Develop a fundamentally sound swing",
      "Understand basic fielding positions and responsibilities",
      "Build confidence and love for the game",
    ],
    kpisTracked: ["exit_velocity", "throw_velocity", "home_to_first"],
    weeks: [
      { week: 1, focus: "Throwing & Catching Basics", drillIds: ["f-001", "f-003", "h-001"], notes: "Focus on proper grip and arm action" },
      { week: 2, focus: "Hitting Foundations", drillIds: ["h-001", "h-003", "b-002"], notes: "Tee work and front toss" },
      { week: 3, focus: "Fielding Ground Balls", drillIds: ["f-001", "f-002", "f-003"], notes: "Low position, funnel to center" },
      { week: 4, focus: "Base Running Basics", drillIds: ["b-001", "b-002", "b-003"], notes: "Running form and basic slides" },
      { week: 5, focus: "Hitting for Contact", drillIds: ["h-001", "h-003", "h-005"], notes: "Barrel control and directional hitting" },
      { week: 6, focus: "Defensive Positioning", drillIds: ["f-001", "f-002", "f-005"], notes: "Where to stand and where to throw" },
      { week: 7, focus: "Game Situations", drillIds: ["b-004", "f-005", "h-003"], notes: "Putting it all together" },
      { week: 8, focus: "Assessment & Review", drillIds: ["h-001", "f-001", "b-002"], kpiTargets: { "home_to_first": "Under 4.0 sec" }, notes: "Test progress and set goals" },
    ],
  },
  {
    id: "prog-hitting",
    name: "Hitting Development Program",
    description: "Intensive hitting program focused on building bat speed, barrel control, and game-ready timing.",
    category: "hitting",
    difficulty: "intermediate",
    durationWeeks: 6,
    sessionsPerWeek: 4,
    targetAgeRange: "10-16",
    goals: [
      "Increase bat speed by 3+ mph",
      "Improve barrel accuracy to 70%+ hard contact",
      "Develop slap hitting as a secondary skill",
      "Master timing adjustments for off-speed pitches",
    ],
    kpisTracked: ["exit_velocity", "bat_speed", "slap_speed"],
    weeks: [
      { week: 1, focus: "Swing Mechanics Rebuild", drillIds: ["h-001", "h-002", "h-003"], notes: "Strip it down to fundamentals" },
      { week: 2, focus: "Bat Speed Development", drillIds: ["h-004", "h-002", "h-006"], notes: "Overload/underload training" },
      { week: 3, focus: "Barrel Control & Direction", drillIds: ["h-005", "h-001", "h-007"], notes: "Target work and slap intro" },
      { week: 4, focus: "Timing & Pitch Recognition", drillIds: ["h-003", "h-008", "h-001"], notes: "Rise ball and off-speed work" },
      { week: 5, focus: "Power Development", drillIds: ["h-006", "h-004", "h-002"], kpiTargets: { "bat_speed": "+2 mph from baseline" }, notes: "Max intent hitting" },
      { week: 6, focus: "Live At-Bats & Assessment", drillIds: ["h-003", "h-008", "h-005"], kpiTargets: { "exit_velocity": "+3 mph from baseline" }, notes: "Simulated game at-bats" },
    ],
  },
  {
    id: "prog-pitching",
    name: "Pitching Development Program",
    description: "Structured fastpitch pitching program from mechanics to a complete arsenal with velocity development.",
    category: "pitching",
    difficulty: "intermediate",
    durationWeeks: 8,
    sessionsPerWeek: 4,
    targetAgeRange: "10-18",
    goals: [
      "Develop efficient windmill mechanics",
      "Add 2-3 mph to fastball velocity",
      "Develop at least 2 off-speed pitches",
      "Achieve 65%+ first-pitch strike rate",
    ],
    kpisTracked: ["pitch_speed", "spin_rate", "rise_ball_velo", "drop_ball_velo"],
    weeks: [
      { week: 1, focus: "Mechanics Foundation", drillIds: ["p-001", "p-002"], notes: "K position and walk-throughs only" },
      { week: 2, focus: "Fastball Command", drillIds: ["p-002", "p-004", "p-001"], notes: "Location before velocity" },
      { week: 3, focus: "Change-Up Introduction", drillIds: ["p-005", "p-004", "p-002"], notes: "Same arm speed, different grip" },
      { week: 4, focus: "Velocity Push", drillIds: ["p-003", "p-010", "p-004"], kpiTargets: { "pitch_speed": "+1 mph" }, notes: "Resistance training and max intent" },
      { week: 5, focus: "Drop Ball Development", drillIds: ["p-006", "p-004", "p-001"], notes: "Topspin and location" },
      { week: 6, focus: "Rise Ball Development", drillIds: ["p-007", "p-004", "p-006"], notes: "Backspin and elevation" },
      { week: 7, focus: "Curveball & Sequencing", drillIds: ["p-008", "p-009", "p-004"], notes: "Full arsenal integration" },
      { week: 8, focus: "Game Simulation & Assessment", drillIds: ["p-009", "p-010", "p-004"], kpiTargets: { "pitch_speed": "+2-3 mph from start" }, notes: "Simulated innings" },
    ],
  },
  {
    id: "prog-defense",
    name: "Defensive Development Program",
    description: "Complete defensive development covering infield, outfield, and position-specific skills.",
    category: "fielding",
    difficulty: "intermediate",
    durationWeeks: 6,
    sessionsPerWeek: 3,
    targetAgeRange: "10-16",
    goals: [
      "Improve first-step reaction time",
      "Develop consistent throwing accuracy",
      "Build defensive IQ for game situations",
      "Master position-specific skills",
    ],
    kpisTracked: ["throw_velocity", "reaction_time"],
    weeks: [
      { week: 1, focus: "Glove Work & Hands", drillIds: ["f-001", "f-004", "f-003"], notes: "Soft hands and clean transfers" },
      { week: 2, focus: "Footwork & Range", drillIds: ["f-002", "f-001", "f-004"], notes: "Triangle drill and lateral movement" },
      { week: 3, focus: "Throwing Accuracy", drillIds: ["f-003", "f-001", "f-002"], notes: "Four-seam grip and targets" },
      { week: 4, focus: "Advanced Plays", drillIds: ["f-006", "f-002", "f-004"], notes: "Diving, backhands, bare hands" },
      { week: 5, focus: "Situational Defense", drillIds: ["f-005", "f-003", "f-001"], notes: "Cutoffs, relays, and communication" },
      { week: 6, focus: "Live Defense & Assessment", drillIds: ["f-005", "f-004", "f-006"], kpiTargets: { "throw_velocity": "+2 mph" }, notes: "Game-speed situations" },
    ],
  },
  {
    id: "prog-offseason",
    name: "Off-Season Development Plan",
    description: "Comprehensive off-season training covering all skill areas with progressive intensity.",
    category: "general",
    difficulty: "advanced",
    durationWeeks: 10,
    sessionsPerWeek: 5,
    targetAgeRange: "13-18",
    goals: [
      "Maximize physical development window",
      "Build complete skill set across all areas",
      "Set measurable KPI targets for the season",
      "Develop mental toughness and work ethic",
    ],
    kpisTracked: ["exit_velocity", "bat_speed", "pitch_speed", "home_to_first", "throw_velocity"],
    weeks: [
      { week: 1, focus: "Baseline Testing", drillIds: ["h-001", "f-001", "b-002", "p-002"], notes: "Record all KPIs" },
      { week: 2, focus: "Mechanics Refinement", drillIds: ["h-001", "h-002", "f-001", "p-001", "p-002"], notes: "Fix habits before building intensity" },
      { week: 3, focus: "Speed & Explosiveness", drillIds: ["b-001", "b-002", "h-004", "f-004"], notes: "First-step and bat speed focus" },
      { week: 4, focus: "Hitting Intensity", drillIds: ["h-004", "h-006", "h-003", "h-008"], notes: "Push bat speed and exit velo" },
      { week: 5, focus: "Pitching Arsenal", drillIds: ["p-003", "p-005", "p-006", "p-007"], notes: "Add pitches and build velo" },
      { week: 6, focus: "Defensive Range", drillIds: ["f-002", "f-004", "f-006", "f-005"], notes: "Athleticism and range" },
      { week: 7, focus: "Power Phase", drillIds: ["h-006", "h-004", "p-010", "b-005"], notes: "Max intent everything" },
      { week: 8, focus: "Game Situations", drillIds: ["p-009", "f-005", "b-004", "h-008"], notes: "Competitive drills" },
      { week: 9, focus: "Peak & Test", drillIds: ["h-006", "p-010", "b-002", "f-003"], kpiTargets: { "exit_velocity": "+5 mph", "pitch_speed": "+3 mph" }, notes: "Re-test all KPIs" },
      { week: 10, focus: "Season Prep", drillIds: ["p-009", "h-003", "f-005", "b-004"], notes: "Transition to game-speed work" },
    ],
  },
];

// Get programs by category
export const getProgramsByCategory = (category: SkillCategory | 'general'): TrainingProgram[] => {
  return softballPrograms.filter(p => p.category === category);
};

// Get programs by difficulty
export const getProgramsByDifficulty = (difficulty: TrainingProgram['difficulty']): TrainingProgram[] => {
  return softballPrograms.filter(p => p.difficulty === difficulty);
};
