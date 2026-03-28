// Softball Assessment System
// Evaluates athletes across skill categories and recommends drills

import { SkillCategory } from "./drills";

export interface AssessmentCriteria {
  id: string;
  name: string;
  description: string;
  maxScore: number;
  category: SkillCategory;
}

export interface AssessmentResult {
  criteriaId: string;
  score: number;
  notes?: string;
}

export interface AssessmentRecommendation {
  area: string;
  level: 'strength' | 'needs_work' | 'critical';
  message: string;
  recommendedDrillIds: string[];
}

export interface AssessmentModule {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  criteria: AssessmentCriteria[];
  estimatedTime: string;
}

// Assessment modules by category
export const softballAssessments: AssessmentModule[] = [
  {
    id: "assess-hitting",
    name: "Hitting Assessment",
    description: "Comprehensive evaluation of swing mechanics, bat speed, barrel control, timing, and power.",
    category: "hitting",
    estimatedTime: "25 min",
    criteria: [
      { id: "hit-mechanics", name: "Swing Mechanics", description: "Quality of stance, load, stride, rotation, and follow-through.", maxScore: 10, category: "hitting" },
      { id: "hit-batspeed", name: "Bat Speed", description: "Speed of the bat through the hitting zone. Use a bat speed sensor or visual evaluation.", maxScore: 10, category: "hitting" },
      { id: "hit-barrel", name: "Barrel Control", description: "Ability to consistently barrel the ball to all fields.", maxScore: 10, category: "hitting" },
      { id: "hit-timing", name: "Timing & Rhythm", description: "Ability to adjust timing to different pitch speeds and movement.", maxScore: 10, category: "hitting" },
      { id: "hit-power", name: "Power / Exit Velocity", description: "Quality of contact and ability to drive the ball with authority.", maxScore: 10, category: "hitting" },
      { id: "hit-contact", name: "Contact Consistency", description: "Ability to make consistent hard contact across multiple reps.", maxScore: 10, category: "hitting" },
    ],
  },
  {
    id: "assess-fielding",
    name: "Fielding Assessment",
    description: "Evaluation of glove work, footwork, throwing accuracy, reaction time, and defensive IQ.",
    category: "fielding",
    estimatedTime: "20 min",
    criteria: [
      { id: "field-glove", name: "Glove Work", description: "Soft hands, proper funnel technique, clean picks.", maxScore: 10, category: "fielding" },
      { id: "field-footwork", name: "Footwork", description: "Proper positioning, approach angles, and foot-to-ball coordination.", maxScore: 10, category: "fielding" },
      { id: "field-throwing", name: "Throwing Mechanics", description: "Arm accuracy, arm strength, and transfer speed.", maxScore: 10, category: "fielding" },
      { id: "field-reaction", name: "Reaction Time", description: "First step quickness and ability to read the ball off the bat.", maxScore: 10, category: "fielding" },
      { id: "field-iq", name: "Defensive IQ", description: "Positioning, decision-making, and situational awareness.", maxScore: 10, category: "fielding" },
    ],
  },
  {
    id: "assess-baserunning",
    name: "Base Running Assessment",
    description: "Evaluation of speed, acceleration, sliding technique, and baserunning decisions.",
    category: "baserunning",
    estimatedTime: "15 min",
    criteria: [
      { id: "base-first-step", name: "First-Step Quickness", description: "Explosive first step out of the box and off the base.", maxScore: 10, category: "baserunning" },
      { id: "base-accel", name: "Acceleration", description: "Ability to reach top speed quickly.", maxScore: 10, category: "baserunning" },
      { id: "base-sliding", name: "Sliding Mechanics", description: "Proper slide technique including pop-up and hook slides.", maxScore: 10, category: "baserunning" },
      { id: "base-decisions", name: "Baserunning Decisions", description: "Reading situations, knowing when to advance, and awareness.", maxScore: 10, category: "baserunning" },
    ],
  },
  {
    id: "assess-pitching",
    name: "Pitching Assessment",
    description: "Comprehensive evaluation of windmill mechanics, pitch arsenal, command, and sequencing.",
    category: "pitching",
    estimatedTime: "30 min",
    criteria: [
      { id: "pitch-mechanics", name: "Pitching Mechanics", description: "Windmill arm circle, stride, drive, and follow-through.", maxScore: 10, category: "pitching" },
      { id: "pitch-spin", name: "Spin Development", description: "Ability to create intended spin on different pitch types.", maxScore: 10, category: "pitching" },
      { id: "pitch-command", name: "Pitch Command", description: "Ability to locate pitches to all quadrants of the zone.", maxScore: 10, category: "pitching" },
      { id: "pitch-fastball", name: "Fastball Quality", description: "Velocity, movement, and location of the fastball.", maxScore: 10, category: "pitching" },
      { id: "pitch-changeup", name: "Change-Up Quality", description: "Speed differential, arm speed deception, and movement.", maxScore: 10, category: "pitching" },
      { id: "pitch-breaking", name: "Breaking Pitches", description: "Quality of drop ball, rise ball, and/or curveball.", maxScore: 10, category: "pitching" },
      { id: "pitch-sequencing", name: "Pitch Sequencing", description: "Ability to set up hitters with strategic pitch selection.", maxScore: 10, category: "pitching" },
    ],
  },
];

// Generate recommendations based on assessment scores
export const generateRecommendations = (
  assessment: AssessmentModule,
  results: AssessmentResult[]
): AssessmentRecommendation[] => {
  const recommendations: AssessmentRecommendation[] = [];
  
  // Map criteria to drill recommendations
  const drillMapping: Record<string, string[]> = {
    // Hitting
    "hit-mechanics": ["h-001", "h-003"],
    "hit-batspeed": ["h-002", "h-004"],
    "hit-barrel": ["h-005", "h-001"],
    "hit-timing": ["h-003", "h-008"],
    "hit-power": ["h-006", "h-004"],
    "hit-contact": ["h-001", "h-005"],
    // Fielding
    "field-glove": ["f-001", "f-006"],
    "field-footwork": ["f-002"],
    "field-throwing": ["f-003"],
    "field-reaction": ["f-004"],
    "field-iq": ["f-005"],
    // Baserunning
    "base-first-step": ["b-001"],
    "base-accel": ["b-002"],
    "base-sliding": ["b-003"],
    "base-decisions": ["b-004", "b-005"],
    // Pitching
    "pitch-mechanics": ["p-001", "p-002", "p-003"],
    "pitch-spin": ["p-006", "p-007", "p-008"],
    "pitch-command": ["p-004"],
    "pitch-fastball": ["p-004", "p-010"],
    "pitch-changeup": ["p-005"],
    "pitch-breaking": ["p-006", "p-007", "p-008"],
    "pitch-sequencing": ["p-009"],
  };

  for (const result of results) {
    const criteria = assessment.criteria.find(c => c.id === result.criteriaId);
    if (!criteria) continue;

    const percentage = (result.score / criteria.maxScore) * 100;
    let level: AssessmentRecommendation['level'];
    let message: string;

    if (percentage >= 80) {
      level = 'strength';
      message = `${criteria.name} is a strength. Continue maintaining with targeted work.`;
    } else if (percentage >= 50) {
      level = 'needs_work';
      message = `${criteria.name} needs improvement. Focus on the recommended drills to develop this skill.`;
    } else {
      level = 'critical';
      message = `${criteria.name} is a priority area. Incorporate these drills into every practice session.`;
    }

    recommendations.push({
      area: criteria.name,
      level,
      message,
      recommendedDrillIds: drillMapping[result.criteriaId] || [],
    });
  }

  // Sort: critical first, then needs_work, then strength
  const order = { critical: 0, needs_work: 1, strength: 2 };
  recommendations.sort((a, b) => order[a.level] - order[b.level]);

  return recommendations;
};

// Calculate overall assessment score
export const calculateOverallScore = (
  assessment: AssessmentModule,
  results: AssessmentResult[]
): { score: number; maxScore: number; percentage: number } => {
  const totalMax = assessment.criteria.reduce((sum, c) => sum + c.maxScore, 0);
  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  return {
    score: totalScore,
    maxScore: totalMax,
    percentage: Math.round((totalScore / totalMax) * 100),
  };
};
