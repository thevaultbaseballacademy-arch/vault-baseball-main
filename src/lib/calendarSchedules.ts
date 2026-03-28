export type Position = "pitcher" | "catcher" | "infielder" | "outfielder" | "utility";
export type TrainingPhase = "off-season" | "pre-season" | "in-season";
export type Emphasis = "velocity" | "athleticism" | "skill" | "recovery" | "mental";
export type Intensity = "high" | "moderate" | "low";

export interface TrainingBlock {
  id: string;
  name: string;
  duration: string;
  emphasis: Emphasis;
  description: string;
  intensity: Intensity;
}

export interface DaySchedule {
  day: string;
  shortDay: string;
  primary: "velocity" | "athleticism" | "skill" | "recovery";
  theme: string;
  blocks: TrainingBlock[];
}

export const positions: { value: Position; label: string; description: string }[] = [
  { value: "pitcher", label: "Pitcher", description: "Arm care & velocity focus" },
  { value: "catcher", label: "Catcher", description: "Recovery & durability emphasis" },
  { value: "infielder", label: "Infielder", description: "Agility & quick transfers" },
  { value: "outfielder", label: "Outfielder", description: "Speed & arm strength" },
  { value: "utility", label: "Utility", description: "Balanced development" },
];

export const phases: { value: TrainingPhase; label: string; description: string }[] = [
  { value: "off-season", label: "Off-Season", description: "Build phase - max development" },
  { value: "pre-season", label: "Pre-Season", description: "Transfer phase - game prep" },
  { value: "in-season", label: "In-Season", description: "Maintain phase - compete" },
];

// Base schedules by phase
const offSeasonBase: DaySchedule[] = [
  {
    day: "Monday",
    shortDay: "Mon",
    primary: "velocity",
    theme: "Max Intent Day",
    blocks: [
      { id: "m1", name: "Dynamic Warm-up", duration: "15 min", emphasis: "athleticism", description: "Movement prep & activation", intensity: "moderate" },
      { id: "m2", name: "Throwing Program", duration: "30 min", emphasis: "velocity", description: "High-intent throws, building to max effort", intensity: "high" },
      { id: "m3", name: "Hitting - Exit Velo Focus", duration: "45 min", emphasis: "velocity", description: "Overload/underload, intent swings", intensity: "high" },
      { id: "m4", name: "Arm Care", duration: "15 min", emphasis: "recovery", description: "Band work, shoulder stability", intensity: "low" },
    ]
  },
  {
    day: "Tuesday",
    shortDay: "Tue",
    primary: "athleticism",
    theme: "Speed & Power Day",
    blocks: [
      { id: "t1", name: "Sprint Mechanics", duration: "20 min", emphasis: "athleticism", description: "Acceleration, top speed work", intensity: "high" },
      { id: "t2", name: "Plyometrics", duration: "25 min", emphasis: "athleticism", description: "Jump training, reactive power", intensity: "high" },
      { id: "t3", name: "Strength Training", duration: "45 min", emphasis: "athleticism", description: "Lower body power focus", intensity: "high" },
      { id: "t4", name: "Mobility Flow", duration: "15 min", emphasis: "recovery", description: "Hip, t-spine, ankle mobility", intensity: "low" },
    ]
  },
  {
    day: "Wednesday",
    shortDay: "Wed",
    primary: "skill",
    theme: "Skill Development Day",
    blocks: [
      { id: "w1", name: "Movement Prep", duration: "15 min", emphasis: "athleticism", description: "Light activation", intensity: "low" },
      { id: "w2", name: "Hitting Mechanics", duration: "45 min", emphasis: "skill", description: "Swing path, timing work", intensity: "moderate" },
      { id: "w3", name: "Defensive Skills", duration: "30 min", emphasis: "skill", description: "Position-specific work", intensity: "moderate" },
      { id: "w4", name: "Mental Performance", duration: "20 min", emphasis: "mental", description: "Visualization, focus training", intensity: "low" },
    ]
  },
  {
    day: "Thursday",
    shortDay: "Thu",
    primary: "velocity",
    theme: "Power Development Day",
    blocks: [
      { id: "th1", name: "Explosive Warm-up", duration: "15 min", emphasis: "athleticism", description: "CNS activation", intensity: "moderate" },
      { id: "th2", name: "Weighted Balls", duration: "30 min", emphasis: "velocity", description: "Velocity development protocol", intensity: "high" },
      { id: "th3", name: "Bat Speed Training", duration: "30 min", emphasis: "velocity", description: "Overload swings, speed work", intensity: "high" },
      { id: "th4", name: "Upper Body Strength", duration: "45 min", emphasis: "athleticism", description: "Push/pull strength focus", intensity: "high" },
    ]
  },
  {
    day: "Friday",
    shortDay: "Fri",
    primary: "athleticism",
    theme: "Athletic Development Day",
    blocks: [
      { id: "f1", name: "Agility Training", duration: "25 min", emphasis: "athleticism", description: "COD, reaction drills", intensity: "high" },
      { id: "f2", name: "Skill Work", duration: "30 min", emphasis: "skill", description: "Position-specific refinement", intensity: "moderate" },
      { id: "f3", name: "Conditioning", duration: "20 min", emphasis: "athleticism", description: "Sport-specific conditioning", intensity: "moderate" },
      { id: "f4", name: "Recovery Protocol", duration: "15 min", emphasis: "recovery", description: "Cool down, stretching", intensity: "low" },
    ]
  },
  {
    day: "Saturday",
    shortDay: "Sat",
    primary: "skill",
    theme: "Competitive Practice Day",
    blocks: [
      { id: "s1", name: "Team Warm-up", duration: "20 min", emphasis: "athleticism", description: "Group activation", intensity: "moderate" },
      { id: "s2", name: "Live At-Bats", duration: "45 min", emphasis: "skill", description: "Competitive reps, game scenarios", intensity: "high" },
      { id: "s3", name: "Situational Defense", duration: "30 min", emphasis: "skill", description: "Game-speed scenarios", intensity: "moderate" },
      { id: "s4", name: "Mental Debrief", duration: "15 min", emphasis: "mental", description: "Performance review", intensity: "low" },
    ]
  },
  {
    day: "Sunday",
    shortDay: "Sun",
    primary: "recovery",
    theme: "Active Recovery Day",
    blocks: [
      { id: "su1", name: "Light Movement", duration: "20 min", emphasis: "recovery", description: "Walk, light jog, dynamic stretch", intensity: "low" },
      { id: "su2", name: "Mobility Session", duration: "30 min", emphasis: "recovery", description: "Full body mobility flow", intensity: "low" },
      { id: "su3", name: "Mental Reset", duration: "20 min", emphasis: "mental", description: "Journaling, visualization", intensity: "low" },
      { id: "su4", name: "Optional Light Skill", duration: "30 min", emphasis: "skill", description: "Light catch, tee work (optional)", intensity: "low" },
    ]
  },
];

const preSeasonBase: DaySchedule[] = [
  {
    day: "Monday",
    shortDay: "Mon",
    primary: "velocity",
    theme: "Intent + Transfer Day",
    blocks: [
      { id: "m1", name: "Dynamic Warm-up", duration: "15 min", emphasis: "athleticism", description: "Game-prep activation", intensity: "moderate" },
      { id: "m2", name: "Throwing Program", duration: "25 min", emphasis: "velocity", description: "Maintain velocity, build endurance", intensity: "high" },
      { id: "m3", name: "Live BP", duration: "40 min", emphasis: "skill", description: "Quality at-bats, approach work", intensity: "moderate" },
      { id: "m4", name: "Arm Care", duration: "15 min", emphasis: "recovery", description: "Maintenance protocol", intensity: "low" },
    ]
  },
  {
    day: "Tuesday",
    shortDay: "Tue",
    primary: "athleticism",
    theme: "Athletic Maintenance Day",
    blocks: [
      { id: "t1", name: "Speed Work", duration: "20 min", emphasis: "athleticism", description: "Maintain speed, explosiveness", intensity: "high" },
      { id: "t2", name: "Defensive Practice", duration: "30 min", emphasis: "skill", description: "Game-situation fielding", intensity: "moderate" },
      { id: "t3", name: "Strength - Maintenance", duration: "35 min", emphasis: "athleticism", description: "Reduce volume, maintain gains", intensity: "moderate" },
      { id: "t4", name: "Mobility", duration: "15 min", emphasis: "recovery", description: "Hip, t-spine focus", intensity: "low" },
    ]
  },
  {
    day: "Wednesday",
    shortDay: "Wed",
    primary: "skill",
    theme: "Game Simulation Day",
    blocks: [
      { id: "w1", name: "Pre-Game Routine", duration: "15 min", emphasis: "athleticism", description: "Establish game-day routine", intensity: "low" },
      { id: "w2", name: "Intersquad Game", duration: "90 min", emphasis: "skill", description: "Full game simulation", intensity: "high" },
      { id: "w3", name: "Post-Game Recovery", duration: "20 min", emphasis: "recovery", description: "Cool down, arm care", intensity: "low" },
      { id: "w4", name: "Mental Review", duration: "15 min", emphasis: "mental", description: "Performance analysis", intensity: "low" },
    ]
  },
  {
    day: "Thursday",
    shortDay: "Thu",
    primary: "recovery",
    theme: "Active Recovery Day",
    blocks: [
      { id: "th1", name: "Light Movement", duration: "20 min", emphasis: "recovery", description: "Flush session", intensity: "low" },
      { id: "th2", name: "Video Study", duration: "30 min", emphasis: "skill", description: "Opponent scouting", intensity: "low" },
      { id: "th3", name: "Light Skill Work", duration: "25 min", emphasis: "skill", description: "Tee work, soft toss", intensity: "low" },
      { id: "th4", name: "Mobility Flow", duration: "20 min", emphasis: "recovery", description: "Full body recovery", intensity: "low" },
    ]
  },
  {
    day: "Friday",
    shortDay: "Fri",
    primary: "skill",
    theme: "Competition Prep Day",
    blocks: [
      { id: "f1", name: "Game Prep Warm-up", duration: "20 min", emphasis: "athleticism", description: "Pre-competition routine", intensity: "moderate" },
      { id: "f2", name: "BP - Quality Reps", duration: "30 min", emphasis: "skill", description: "Approach work, timing", intensity: "moderate" },
      { id: "f3", name: "Defensive Review", duration: "25 min", emphasis: "skill", description: "Game plan execution", intensity: "moderate" },
      { id: "f4", name: "Pre-Game Mental", duration: "15 min", emphasis: "mental", description: "Focus routine, breathing", intensity: "low" },
    ]
  },
  {
    day: "Saturday",
    shortDay: "Sat",
    primary: "skill",
    theme: "Scrimmage Day",
    blocks: [
      { id: "s1", name: "Early Work", duration: "20 min", emphasis: "skill", description: "Individual refinement", intensity: "low" },
      { id: "s2", name: "Team Warm-up", duration: "20 min", emphasis: "athleticism", description: "Pre-game preparation", intensity: "moderate" },
      { id: "s3", name: "Scrimmage Game", duration: "150 min", emphasis: "skill", description: "Game performance", intensity: "high" },
      { id: "s4", name: "Post-Game Recovery", duration: "20 min", emphasis: "recovery", description: "Cool down, arm care", intensity: "low" },
    ]
  },
  {
    day: "Sunday",
    shortDay: "Sun",
    primary: "recovery",
    theme: "Full Recovery Day",
    blocks: [
      { id: "su1", name: "Light Movement", duration: "20 min", emphasis: "recovery", description: "Active recovery", intensity: "low" },
      { id: "su2", name: "Mobility Session", duration: "30 min", emphasis: "recovery", description: "Full body mobility", intensity: "low" },
      { id: "su3", name: "Mental Prep", duration: "20 min", emphasis: "mental", description: "Week ahead visualization", intensity: "low" },
    ]
  },
];

const inSeasonBase: DaySchedule[] = [
  {
    day: "Monday",
    shortDay: "Mon",
    primary: "recovery",
    theme: "Recovery + Maintenance Day",
    blocks: [
      { id: "m1", name: "Flush Session", duration: "20 min", emphasis: "recovery", description: "Light movement, blood flow", intensity: "low" },
      { id: "m2", name: "Arm Care", duration: "20 min", emphasis: "recovery", description: "Band work, recovery throws", intensity: "low" },
      { id: "m3", name: "Light Hitting", duration: "25 min", emphasis: "skill", description: "Tee work, feel swings", intensity: "low" },
      { id: "m4", name: "Mobility Flow", duration: "20 min", emphasis: "recovery", description: "Full body recovery", intensity: "low" },
    ]
  },
  {
    day: "Tuesday",
    shortDay: "Tue",
    primary: "skill",
    theme: "Practice Day",
    blocks: [
      { id: "t1", name: "Early Work", duration: "20 min", emphasis: "skill", description: "Individual skill work", intensity: "low" },
      { id: "t2", name: "Team BP", duration: "30 min", emphasis: "skill", description: "Quality at-bats", intensity: "moderate" },
      { id: "t3", name: "Defensive Practice", duration: "30 min", emphasis: "skill", description: "Team defense, situations", intensity: "moderate" },
      { id: "t4", name: "Strength - Minimal", duration: "25 min", emphasis: "athleticism", description: "Maintenance lifts only", intensity: "moderate" },
    ]
  },
  {
    day: "Wednesday",
    shortDay: "Wed",
    primary: "skill",
    theme: "Game Day",
    blocks: [
      { id: "w1", name: "Early Work", duration: "15 min", emphasis: "skill", description: "Light individual work", intensity: "low" },
      { id: "w2", name: "Pre-Game BP/Infield", duration: "25 min", emphasis: "skill", description: "Game preparation", intensity: "moderate" },
      { id: "w3", name: "Competition", duration: "180 min", emphasis: "skill", description: "Game performance", intensity: "high" },
      { id: "w4", name: "Post-Game Recovery", duration: "15 min", emphasis: "recovery", description: "Cool down, arm care", intensity: "low" },
    ]
  },
  {
    day: "Thursday",
    shortDay: "Thu",
    primary: "recovery",
    theme: "Recovery Day",
    blocks: [
      { id: "th1", name: "Active Recovery", duration: "20 min", emphasis: "recovery", description: "Light movement", intensity: "low" },
      { id: "th2", name: "Video Review", duration: "25 min", emphasis: "skill", description: "Game film analysis", intensity: "low" },
      { id: "th3", name: "Mental Performance", duration: "20 min", emphasis: "mental", description: "Process work, adjustments", intensity: "low" },
      { id: "th4", name: "Mobility", duration: "20 min", emphasis: "recovery", description: "Full body stretch", intensity: "low" },
    ]
  },
  {
    day: "Friday",
    shortDay: "Fri",
    primary: "skill",
    theme: "Game Prep Day",
    blocks: [
      { id: "f1", name: "Early Work", duration: "15 min", emphasis: "skill", description: "Individual refinement", intensity: "low" },
      { id: "f2", name: "Light BP", duration: "25 min", emphasis: "skill", description: "Timing, approach", intensity: "moderate" },
      { id: "f3", name: "Game Plan Review", duration: "20 min", emphasis: "skill", description: "Opponent scouting", intensity: "low" },
      { id: "f4", name: "Pre-Game Mental", duration: "15 min", emphasis: "mental", description: "Focus routine", intensity: "low" },
    ]
  },
  {
    day: "Saturday",
    shortDay: "Sat",
    primary: "skill",
    theme: "Game Day",
    blocks: [
      { id: "s1", name: "Early Work", duration: "15 min", emphasis: "skill", description: "Light individual work", intensity: "low" },
      { id: "s2", name: "Pre-Game BP/Infield", duration: "25 min", emphasis: "skill", description: "Game preparation", intensity: "moderate" },
      { id: "s3", name: "Competition", duration: "180 min", emphasis: "skill", description: "Game performance", intensity: "high" },
      { id: "s4", name: "Post-Game Recovery", duration: "15 min", emphasis: "recovery", description: "Cool down, arm care", intensity: "low" },
    ]
  },
  {
    day: "Sunday",
    shortDay: "Sun",
    primary: "recovery",
    theme: "Full Recovery Day",
    blocks: [
      { id: "su1", name: "Light Movement", duration: "20 min", emphasis: "recovery", description: "Active recovery", intensity: "low" },
      { id: "su2", name: "Mobility Session", duration: "30 min", emphasis: "recovery", description: "Full body mobility", intensity: "low" },
      { id: "su3", name: "Mental Reset", duration: "20 min", emphasis: "mental", description: "Journaling, visualization", intensity: "low" },
    ]
  },
];

// Position-specific modifications
function applyPositionModifications(schedule: DaySchedule[], position: Position): DaySchedule[] {
  return schedule.map(day => {
    const modifiedBlocks = [...day.blocks];
    
    switch (position) {
      case "pitcher":
        // Add more arm care, reduce hitting volume, add pitching-specific work
        return {
          ...day,
          blocks: modifiedBlocks.map(block => {
            if (block.name.includes("Hitting") || block.name.includes("BP")) {
              return { ...block, duration: "20 min", description: block.description + " (reduced for pitchers)" };
            }
            if (block.name.includes("Arm Care")) {
              return { ...block, duration: "25 min", description: "Extended arm care protocol" };
            }
            if (block.name.includes("Throwing")) {
              return { ...block, name: "Pitching Program", duration: "40 min", description: "Bullpen work, velocity training" };
            }
            return block;
          })
        };
        
      case "catcher":
        // Add hip/knee recovery, receiving work, reduce sprint volume
        return {
          ...day,
          blocks: modifiedBlocks.map(block => {
            if (block.name.includes("Sprint") || block.name.includes("Speed")) {
              return { ...block, duration: "15 min", description: block.description + " (modified for catchers)" };
            }
            if (block.name.includes("Defensive") || block.name.includes("Defense")) {
              return { ...block, name: "Receiving & Blocking", duration: "35 min", description: "Receiving, blocking, pop-time work" };
            }
            if (block.name.includes("Mobility")) {
              return { ...block, duration: "25 min", description: "Hip & knee focus for catchers" };
            }
            return block;
          })
        };
        
      case "infielder":
        // Emphasize agility, quick hands, transfers
        return {
          ...day,
          blocks: modifiedBlocks.map(block => {
            if (block.name.includes("Agility")) {
              return { ...block, duration: "30 min", description: "Lateral quickness, first-step explosion" };
            }
            if (block.name.includes("Defensive") || block.name.includes("Defense")) {
              return { ...block, name: "Infield Defense", duration: "35 min", description: "Footwork, transfers, double plays" };
            }
            return block;
          })
        };
        
      case "outfielder":
        // Emphasize speed, routes, arm strength
        return {
          ...day,
          blocks: modifiedBlocks.map(block => {
            if (block.name.includes("Sprint") || block.name.includes("Speed")) {
              return { ...block, duration: "25 min", description: "Top speed, acceleration, routes" };
            }
            if (block.name.includes("Defensive") || block.name.includes("Defense")) {
              return { ...block, name: "Outfield Defense", duration: "35 min", description: "Routes, reads, throwing accuracy" };
            }
            if (block.name.includes("Throwing")) {
              return { ...block, name: "Long Toss Program", duration: "30 min", description: "Arm strength, carry development" };
            }
            return block;
          })
        };
        
      case "utility":
      default:
        return day;
    }
  });
}

export function getScheduleForSettings(position: Position, phase: TrainingPhase): DaySchedule[] {
  let baseSchedule: DaySchedule[];
  
  switch (phase) {
    case "off-season":
      baseSchedule = JSON.parse(JSON.stringify(offSeasonBase));
      break;
    case "pre-season":
      baseSchedule = JSON.parse(JSON.stringify(preSeasonBase));
      break;
    case "in-season":
      baseSchedule = JSON.parse(JSON.stringify(inSeasonBase));
      break;
    default:
      baseSchedule = JSON.parse(JSON.stringify(offSeasonBase));
  }
  
  return applyPositionModifications(baseSchedule, position);
}
