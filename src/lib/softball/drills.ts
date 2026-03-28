// Comprehensive Softball Drill Library
// Each drill includes coaching points, age ranges, and video support

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type SkillCategory = 'hitting' | 'fielding' | 'baserunning' | 'pitching';

export interface SoftballDrill {
  id: string;
  name: string;
  category: SkillCategory;
  subcategory: string;
  description: string;
  coachingPoints: string[];
  duration: string;
  equipment: string[];
  difficulty: DifficultyLevel;
  ageRange: string;
  videoUrl?: string;
  reps?: string;
}

export const softballDrillLibrary: SoftballDrill[] = [
  // ─── HITTING DRILLS ────────────────────────────────────────────
  {
    id: "h-001",
    name: "Tee Work: Contact Zone Mapping",
    category: "hitting",
    subcategory: "swing mechanics",
    description: "Hit off a tee at inside, middle, and outside contact points. Focus on barrel path and staying through the ball.",
    coachingPoints: [
      "Keep hands inside the ball on inside pitches",
      "Drive through the middle on center pitches",
      "Let the ball travel deeper on outside pitches",
      "Maintain balance through the swing"
    ],
    duration: "10 min",
    equipment: ["Bat", "Tee", "Softballs", "Net or Field"],
    difficulty: "beginner",
    ageRange: "8-18",
  },
  {
    id: "h-002",
    name: "Top Hand / Bottom Hand Isolation",
    category: "hitting",
    subcategory: "bat speed",
    description: "One-handed swings off a tee to build independent hand strength and barrel control.",
    coachingPoints: [
      "Top hand drives the barrel through the zone",
      "Bottom hand guides and controls the path",
      "Keep the barrel in the zone as long as possible",
      "Short, compact swings—don't overextend"
    ],
    duration: "8 min",
    equipment: ["Bat", "Tee", "Softballs"],
    difficulty: "intermediate",
    ageRange: "10-18",
  },
  {
    id: "h-003",
    name: "Front Toss Rhythm Drill",
    category: "hitting",
    subcategory: "timing and rhythm",
    description: "Coach front-tosses softballs at varying speeds to develop timing and rhythm adjustments.",
    coachingPoints: [
      "Load with the pitcher's hand—not before",
      "Stay back and let the ball travel",
      "Adjust stride timing to pitch speed",
      "Focus on hard contact, not distance"
    ],
    duration: "12 min",
    equipment: ["Bat", "Softballs", "L-Screen", "Partner"],
    difficulty: "beginner",
    ageRange: "8-18",
  },
  {
    id: "h-004",
    name: "Overload / Underload Bat Speed Training",
    category: "hitting",
    subcategory: "bat speed",
    description: "Alternate between a heavy training bat and a light speed bat to train fast-twitch muscle fibers.",
    coachingPoints: [
      "3 swings heavy, 3 swings light, 3 swings game bat",
      "Maintain proper mechanics with the heavy bat",
      "Maximize intent and speed with the light bat",
      "Track bat speed if available"
    ],
    duration: "10 min",
    equipment: ["Game Bat", "Heavy Training Bat", "Light Speed Bat", "Tee"],
    difficulty: "intermediate",
    ageRange: "12-18",
  },
  {
    id: "h-005",
    name: "Barrel Control Challenge",
    category: "hitting",
    subcategory: "barrel control",
    description: "Hit small targets on a net from a tee, working opposite field, pull side, and up the middle.",
    coachingPoints: [
      "Adjust hand path to hit directional targets",
      "Use inside-out swing for opposite field",
      "Pull the hands for pull-side targets",
      "Stay through the ball—don't steer it"
    ],
    duration: "10 min",
    equipment: ["Bat", "Tee", "Softballs", "Target Net"],
    difficulty: "intermediate",
    ageRange: "10-18",
  },
  {
    id: "h-006",
    name: "Power Drive Tee Work",
    category: "hitting",
    subcategory: "power development",
    description: "Focus on driving the ball with backspin and loft. Measure exit velocity between sets.",
    coachingPoints: [
      "Slight upward barrel path through contact",
      "Full hip rotation for power transfer",
      "Hit through the ball, not at it",
      "Track exit velocity for progress"
    ],
    duration: "12 min",
    equipment: ["Bat", "Tee", "Softballs", "Radar Gun (optional)"],
    difficulty: "advanced",
    ageRange: "13-18",
  },
  {
    id: "h-007",
    name: "Slap Hitting Progressions",
    category: "hitting",
    subcategory: "contact consistency",
    description: "Three-step slap progression: soft slap for placement, power slap for gap hits, and drag bunt.",
    coachingPoints: [
      "Start from the left side of the box",
      "First step is a crossover toward the pitcher",
      "Contact the ball out front while moving",
      "Direct the ball based on defensive positioning"
    ],
    duration: "15 min",
    equipment: ["Bat", "Softballs", "Pitching Machine or Partner"],
    difficulty: "intermediate",
    ageRange: "10-18",
  },
  {
    id: "h-008",
    name: "Rise Ball Tracking Drill",
    category: "hitting",
    subcategory: "timing and rhythm",
    description: "Front toss with rising trajectories to practice recognizing spin and adjusting swing plane.",
    coachingPoints: [
      "Recognize the spin early—it looks like backspin",
      "Stay on top of the ball with your barrel",
      "Don't chase pitches above the zone",
      "Shorten your swing for better contact"
    ],
    duration: "10 min",
    equipment: ["Bat", "Softballs", "Partner"],
    difficulty: "advanced",
    ageRange: "12-18",
  },

  // ─── FIELDING DRILLS ────────────────────────────────────────────
  {
    id: "f-001",
    name: "Rapid Fire Ground Balls",
    category: "fielding",
    subcategory: "glove work",
    description: "Quick-paced ground balls from short distance to develop soft hands and quick transfers.",
    coachingPoints: [
      "Stay low with your glove out front",
      "Funnel the ball to your throwing hand",
      "Quick transfer—don't pat the glove",
      "Work both forehand and backhand"
    ],
    duration: "8 min",
    equipment: ["Glove", "Softballs", "Partner"],
    difficulty: "beginner",
    ageRange: "8-18",
  },
  {
    id: "f-002",
    name: "Triangle Footwork Drill",
    category: "fielding",
    subcategory: "footwork",
    description: "Move to three points of a triangle fielding balls to develop range, footwork, and recovery.",
    coachingPoints: [
      "Push off with the inside foot",
      "Keep your center of gravity low",
      "Field through the ball, not beside it",
      "Reset quickly to the ready position"
    ],
    duration: "10 min",
    equipment: ["Glove", "Softballs", "Cones"],
    difficulty: "intermediate",
    ageRange: "10-18",
  },
  {
    id: "f-003",
    name: "Throwing Accuracy Challenge",
    category: "fielding",
    subcategory: "throwing mechanics",
    description: "Field ground balls and throw to targets at varying distances to build arm accuracy.",
    coachingPoints: [
      "Four-seam grip on every throw",
      "Point the glove-side shoulder at the target",
      "Follow through toward the target",
      "Throw through your partner, not to them"
    ],
    duration: "10 min",
    equipment: ["Glove", "Softballs", "Targets or Bases"],
    difficulty: "beginner",
    ageRange: "8-18",
  },
  {
    id: "f-004",
    name: "Reaction Ball Drill",
    category: "fielding",
    subcategory: "reaction time",
    description: "Use a reaction ball or partner-fed short hops to train quick glove reactions.",
    coachingPoints: [
      "Stay on the balls of your feet",
      "React to the bounce—don't guess",
      "Keep your hands soft and relaxed",
      "Work in short, intense bursts"
    ],
    duration: "6 min",
    equipment: ["Glove", "Reaction Ball or Softballs", "Partner"],
    difficulty: "intermediate",
    ageRange: "10-18",
  },
  {
    id: "f-005",
    name: "Situational Cutoff Drill",
    category: "fielding",
    subcategory: "defensive IQ",
    description: "Practice relay throws, cutoff positioning, and decision-making with runners on base.",
    coachingPoints: [
      "Cutoff aligns between the ball and the base",
      "Communicate loudly: 'Cut!' or 'Let it go!'",
      "Quick feet to turn and throw",
      "Know where the lead runner is going"
    ],
    duration: "15 min",
    equipment: ["Gloves", "Softballs", "Bases", "Multiple Players"],
    difficulty: "intermediate",
    ageRange: "10-18",
  },
  {
    id: "f-006",
    name: "Dive & Recovery Drill",
    category: "fielding",
    subcategory: "glove work",
    description: "Practice diving plays with quick recovery to throwing position. Start on grass/turf.",
    coachingPoints: [
      "Extend the glove fully on the dive",
      "Land on your chest—protect the ball",
      "Pop up to your knees for a quick throw",
      "Focus on control before speed"
    ],
    duration: "10 min",
    equipment: ["Glove", "Softballs", "Grass/Turf Surface"],
    difficulty: "advanced",
    ageRange: "12-18",
  },

  // ─── BASERUNNING DRILLS ──────────────────────────────────────────
  {
    id: "b-001",
    name: "Leadoff Explosion",
    category: "baserunning",
    subcategory: "first-step quickness",
    description: "Practice timing the pitcher's release and exploding off the base with maximum acceleration.",
    coachingPoints: [
      "Watch the pitcher's wrist—go on release",
      "First step is a crossover, not a jab step",
      "Stay low for the first 3-4 steps",
      "Pump the arms for maximum acceleration"
    ],
    duration: "8 min",
    equipment: ["Base", "Stopwatch"],
    difficulty: "beginner",
    ageRange: "8-18",
  },
  {
    id: "b-002",
    name: "Home-to-First Sprint Work",
    category: "baserunning",
    subcategory: "acceleration",
    description: "Timed sprints from the batter's box to first base with proper running mechanics.",
    coachingPoints: [
      "Drop the bat—don't throw it",
      "Run through the bag, not to it",
      "Look at the base, not the ball",
      "Drive the arms hard for the first 20 feet"
    ],
    duration: "10 min",
    equipment: ["Bases", "Stopwatch", "Bat"],
    difficulty: "beginner",
    ageRange: "8-18",
  },
  {
    id: "b-003",
    name: "Sliding Circuit",
    category: "baserunning",
    subcategory: "sliding mechanics",
    description: "Practice pop-up slides, hook slides, and headfirst slides in a progressive circuit.",
    coachingPoints: [
      "Start the slide 8-10 feet from the bag",
      "Tuck one leg under the other for figure-4 slide",
      "Keep your hands up to avoid jamming",
      "Pop up immediately for the next play"
    ],
    duration: "12 min",
    equipment: ["Bases", "Sliding Mat (optional)"],
    difficulty: "intermediate",
    ageRange: "10-18",
  },
  {
    id: "b-004",
    name: "Read & React Baserunning",
    category: "baserunning",
    subcategory: "base running decisions",
    description: "Live situations where runners must read the ball off the bat, read fielders, and decide to advance.",
    coachingPoints: [
      "Freeze on line drives, go on ground balls",
      "Read the outfielder's angle to the ball",
      "Round the bag aggressively but under control",
      "Always know where the ball is"
    ],
    duration: "15 min",
    equipment: ["Bases", "Softballs", "Multiple Players"],
    difficulty: "intermediate",
    ageRange: "10-18",
  },
  {
    id: "b-005",
    name: "Delayed Steal & Secondary Lead",
    category: "baserunning",
    subcategory: "acceleration",
    description: "Practice delayed steal timing and aggressive secondary leads after the pitch.",
    coachingPoints: [
      "Secondary lead starts as the pitch crosses the plate",
      "Delayed steal: wait for catcher's throw back to pitcher",
      "Read the middle infielders' positioning",
      "Commit fully once you go"
    ],
    duration: "10 min",
    equipment: ["Bases", "Catcher", "Pitcher"],
    difficulty: "advanced",
    ageRange: "12-18",
  },

  // ─── PITCHING DRILLS ────────────────────────────────────────────
  {
    id: "p-001",
    name: "K Position Wrist Snaps",
    category: "pitching",
    subcategory: "pitching mechanics",
    description: "Start at the K position (arm at 9 o'clock) and snap through to develop wrist snap strength and feel.",
    coachingPoints: [
      "Elbow stays close to the hip",
      "Snap aggressively through the release point",
      "Feel the ball roll off your fingertips",
      "Focus on spin direction, not velocity"
    ],
    duration: "5 min",
    equipment: ["Softball", "Target or Net"],
    difficulty: "beginner",
    ageRange: "8-18",
  },
  {
    id: "p-002",
    name: "Walk-Through Pitching",
    category: "pitching",
    subcategory: "pitching mechanics",
    description: "Full windmill motion with a walking approach to develop timing, rhythm, and body coordination.",
    coachingPoints: [
      "Start with a step forward with the stride foot",
      "Arm circle stays close to the body",
      "Drive off the back leg as the arm comes through",
      "Follow through past the hip"
    ],
    duration: "10 min",
    equipment: ["Softball", "Open Space"],
    difficulty: "beginner",
    ageRange: "8-18",
  },
  {
    id: "p-003",
    name: "Resistance Band Windmill",
    category: "pitching",
    subcategory: "pitching mechanics",
    description: "Perform the windmill motion against band resistance for arm speed and power development.",
    coachingPoints: [
      "Anchor the band behind you at hip height",
      "Drive through the full arm circle against resistance",
      "Focus on accelerating through the release point",
      "Do NOT sacrifice mechanics for speed"
    ],
    duration: "8 min",
    equipment: ["Resistance Band", "Anchor Point"],
    difficulty: "intermediate",
    ageRange: "12-18",
  },
  {
    id: "p-004",
    name: "Fastball Location Grid",
    category: "pitching",
    subcategory: "pitch command",
    description: "Pitch fastballs to a 4-quadrant target. Track strikes to each zone.",
    coachingPoints: [
      "Inside/outside adjustments come from the stride direction",
      "Up/down adjustments come from the release point",
      "Aim small, miss small",
      "Chart your accuracy: goal is 70%+ strikes"
    ],
    duration: "15 min",
    equipment: ["Softball", "Strike Zone Target", "Catcher"],
    difficulty: "intermediate",
    ageRange: "10-18",
  },
  {
    id: "p-005",
    name: "Change-Up Arm Speed Drill",
    category: "pitching",
    subcategory: "pitch development",
    description: "Throw change-ups focusing on maintaining arm speed while changing grip pressure.",
    coachingPoints: [
      "Same arm speed as the fastball—always",
      "Choke the ball deeper in the hand",
      "Let the grip do the work, not the arm",
      "The change should be 8-12 mph slower than the fastball"
    ],
    duration: "10 min",
    equipment: ["Softball", "Catcher/Net"],
    difficulty: "intermediate",
    ageRange: "10-18",
  },
  {
    id: "p-006",
    name: "Drop Ball Spin Development",
    category: "pitching",
    subcategory: "spin development",
    description: "Focus on creating tight topspin for a late-breaking drop ball.",
    coachingPoints: [
      "Snap over the top of the ball at release",
      "Fingers stay on top—wrist turns over",
      "Ball should have visible topspin",
      "Land the pitch in the bottom third of the zone"
    ],
    duration: "12 min",
    equipment: ["Softball", "Catcher", "Target"],
    difficulty: "intermediate",
    ageRange: "11-18",
  },
  {
    id: "p-007",
    name: "Rise Ball Backspin Focus",
    category: "pitching",
    subcategory: "spin development",
    description: "Develop the rise ball by creating maximum backspin with an upward release angle.",
    coachingPoints: [
      "Release the ball slightly earlier in the circle",
      "Fingers stay under the ball at release",
      "Wrist snaps upward through the ball",
      "The ball should appear to 'hop' as it crosses the plate"
    ],
    duration: "12 min",
    equipment: ["Softball", "Catcher", "Target"],
    difficulty: "advanced",
    ageRange: "13-18",
  },
  {
    id: "p-008",
    name: "Curveball Spin & Location",
    category: "pitching",
    subcategory: "spin development",
    description: "Develop lateral spin for a sweeping curveball with command to both sides of the plate.",
    coachingPoints: [
      "Spin the ball sideways at release",
      "Snap the wrist laterally—not over the top",
      "Start the pitch on one side, let it break to the other",
      "Command before velocity—locate first"
    ],
    duration: "12 min",
    equipment: ["Softball", "Catcher", "Target"],
    difficulty: "advanced",
    ageRange: "13-18",
  },
  {
    id: "p-009",
    name: "Pitch Sequencing Simulation",
    category: "pitching",
    subcategory: "pitch sequencing",
    description: "Simulate at-bats with planned pitch sequences. Coach calls pitches, pitcher executes.",
    coachingPoints: [
      "Set up the hitter with fastballs in and out",
      "Use the change-up after establishing the fastball",
      "Drop ball with two strikes—get the chase",
      "Never throw the same pitch to the same spot twice in a row"
    ],
    duration: "20 min",
    equipment: ["Softball", "Catcher", "Strike Zone Target"],
    difficulty: "advanced",
    ageRange: "12-18",
  },
  {
    id: "p-010",
    name: "Velocity Intent Throws",
    category: "pitching",
    subcategory: "pitching mechanics",
    description: "Max-effort pitches with radar tracking to push velocity ceiling. Limited volume.",
    coachingPoints: [
      "Full effort from the legs and core",
      "Aggressive arm speed through the release",
      "Only 10-15 pitches per session at max intent",
      "Track velocity and compare to baseline"
    ],
    duration: "8 min",
    equipment: ["Softball", "Catcher", "Radar Gun"],
    difficulty: "advanced",
    ageRange: "14-18",
    reps: "10-15 pitches",
  },
];

// Helper to get drills by category
export const getDrillsByCategory = (category: SkillCategory): SoftballDrill[] => {
  return softballDrillLibrary.filter(d => d.category === category);
};

// Helper to get drills by difficulty
export const getDrillsByDifficulty = (difficulty: DifficultyLevel): SoftballDrill[] => {
  return softballDrillLibrary.filter(d => d.difficulty === difficulty);
};

// Helper to get drills by subcategory
export const getDrillsBySubcategory = (subcategory: string): SoftballDrill[] => {
  return softballDrillLibrary.filter(d => d.subcategory === subcategory);
};

// Get all unique subcategories for a category
export const getSubcategories = (category: SkillCategory): string[] => {
  const subs = softballDrillLibrary
    .filter(d => d.category === category)
    .map(d => d.subcategory);
  return [...new Set(subs)];
};

// Get all skill categories
export const skillCategories: { id: SkillCategory; label: string; icon: string }[] = [
  { id: 'hitting', label: 'Hitting', icon: '🏏' },
  { id: 'fielding', label: 'Fielding', icon: '🧤' },
  { id: 'baserunning', label: 'Base Running', icon: '🏃‍♀️' },
  { id: 'pitching', label: 'Pitching', icon: '🥎' },
];
