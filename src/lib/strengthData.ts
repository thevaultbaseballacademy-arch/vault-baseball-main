/**
 * VAULT™ Strength & Conditioning Data Library
 * 
 * All exercise prescriptions, set/rep schemes, and training methodology are
 * original VAULT™ content based on publicly available sports science principles
 * (NSCA, ACSM, CSCS guidelines). No copyrighted training programs are reproduced.
 * 
 * Evidence basis: National Strength & Conditioning Association (NSCA) guidelines,
 * American College of Sports Medicine (ACSM) position stands, and published
 * baseball/softball sport science literature.
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

export type SportType = "baseball" | "softball" | "both";
export type Position =
  | "pitcher" | "catcher" | "first_base" | "second_base"
  | "shortstop" | "third_base" | "outfield" | "utility"
  | "all";
export type SoftballPosition =
  | "pitcher" | "catcher" | "infield" | "outfield"
  | "dp_flex" | "utility" | "all";
export type TrainingPhase = "off_season" | "pre_season" | "in_season" | "post_season";
export type AgeGroup = "youth_12_14" | "hs_14_18" | "college_plus" | "all";
export type Difficulty = "beginner" | "intermediate" | "advanced";
export type WorkoutCategory = "strength" | "power" | "speed" | "agility" | "conditioning" | "mobility" | "arm_care";

export interface Exercise {
  id: string;
  name: string;
  category: WorkoutCategory;
  sets: string;
  reps: string;
  rest: string;
  tempo?: string;
  cues: string[];
  progressions: string[];
  regressions: string[];
  equipment: string[];
  primaryMuscles: string[];
  sportCarryover: string;
  ageNote?: string;
}

export interface WorkoutBlock {
  name: string;
  duration: string;
  exercises: Exercise[];
  blockNotes?: string;
}

export interface WorkoutSession {
  id: string;
  day: string;
  theme: string;
  focus: WorkoutCategory[];
  totalTime: string;
  blocks: WorkoutBlock[];
  coachingCue: string;
}

export interface TrainingProgram {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  sport: SportType;
  positions: Position[] | SoftballPosition[];
  phase: TrainingPhase;
  ageGroup: AgeGroup;
  difficulty: Difficulty;
  durationWeeks: number;
  sessionsPerWeek: number;
  primaryGoal: string;
  keyMetrics: string[];
  weeklyStructure: WorkoutSession[];
  progressionNotes: string;
  warningNotes?: string;
}

// ─── Exercise Library ───────────────────────────────────────────────────────────

export const EXERCISES: Record<string, Exercise> = {

  // ══════════════════════════════════════════════════
  // LOWER BODY STRENGTH
  // ══════════════════════════════════════════════════
  trap_bar_deadlift: {
    id: "trap_bar_deadlift",
    name: "Trap Bar Deadlift",
    category: "strength",
    sets: "4", reps: "4–5", rest: "3 min", tempo: "2-0-X-0",
    cues: [
      "Hinge at hips first — push the floor away",
      "Chest up, neutral spine throughout",
      "Drive knees out over toes",
      "Exhale forcefully at lockout"
    ],
    progressions: ["Sumo Deadlift", "Conventional Deadlift with chains"],
    regressions: ["Romanian Deadlift", "Kettlebell Deadlift"],
    equipment: ["Trap Bar", "Barbell Plates"],
    primaryMuscles: ["Glutes", "Hamstrings", "Erector Spinae", "Quads"],
    sportCarryover: "Primary ground force producer — directly correlates with exit velocity and throwing velocity",
  },
  back_squat: {
    id: "back_squat",
    name: "Back Squat",
    category: "strength",
    sets: "4", reps: "5", rest: "3 min", tempo: "3-1-X-0",
    cues: [
      "Bar rests on rear delts, not neck",
      "Brace core like taking a punch before descent",
      "Track knees over toes throughout",
      "Break parallel — hips below knee crease"
    ],
    progressions: ["Pause Squat", "Box Squat w/ bands", "Safety Bar Squat"],
    regressions: ["Goblet Squat", "Box Squat bodyweight", "Split Squat"],
    equipment: ["Barbell", "Squat Rack", "Barbell Plates"],
    primaryMuscles: ["Quads", "Glutes", "Hamstrings", "Core"],
    sportCarryover: "Hip extension power = rotational power. High squat strength = higher exit velocity ceiling",
    ageNote: "Youth athletes (12–14): use goblet squat regression until movement quality is established",
  },
  bulgarian_split_squat: {
    id: "bulgarian_split_squat",
    name: "Bulgarian Split Squat",
    category: "strength",
    sets: "3", reps: "8–10 each", rest: "90 sec", tempo: "3-0-1-0",
    cues: [
      "Rear foot elevated 12–15 inches — not too high",
      "Front foot far enough forward that shin stays vertical at bottom",
      "Drop straight down — don't dive forward",
      "Drive through heel of front foot"
    ],
    progressions: ["Barbell BSS", "BSS with pause", "1.5 rep BSS"],
    regressions: ["Reverse Lunge", "Step-up", "Bodyweight split squat"],
    equipment: ["Bench or Box", "Dumbbells or Barbell"],
    primaryMuscles: ["Quads", "Glutes", "Hip Flexors"],
    sportCarryover: "Unilateral leg strength = critical for rotational athletes who drive off one leg (pitchers, hitters)",
  },
  rdl: {
    id: "rdl",
    name: "Romanian Deadlift (RDL)",
    category: "strength",
    sets: "3", reps: "8", rest: "90 sec", tempo: "3-1-1-0",
    cues: [
      "Slight knee bend, never lock knees",
      "Bar stays in contact with legs throughout",
      "Feel the hamstring stretch — that's the target",
      "Hinge until you feel tight, then return"
    ],
    progressions: ["Single Leg RDL", "Banded RDL", "Deficit RDL"],
    regressions: ["Stiff leg deadlift with light load", "Hip hinge drill with dowel"],
    equipment: ["Barbell or Dumbbells"],
    primaryMuscles: ["Hamstrings", "Glutes", "Lower Back"],
    sportCarryover: "Hamstring strength is the #1 injury prevention metric in baseball. Also powers hip hinge in swing",
  },

  // ══════════════════════════════════════════════════
  // UPPER BODY STRENGTH
  // ══════════════════════════════════════════════════
  db_bench_press: {
    id: "db_bench_press",
    name: "Dumbbell Bench Press",
    category: "strength",
    sets: "3", reps: "8–10", rest: "90 sec", tempo: "3-0-1-0",
    cues: [
      "Retract and depress shoulder blades before pressing",
      "Dumbbells at 45° angle from torso — not flared wide",
      "Controlled descent — full range of motion",
      "Drive shoulder blades into bench at lockout"
    ],
    progressions: ["Incline DB Press", "Floor Press", "Barbell Bench"],
    regressions: ["Push-up Plus", "Push-up with shoulder blades focus"],
    equipment: ["Dumbbells", "Flat Bench"],
    primaryMuscles: ["Pectorals", "Anterior Deltoid", "Triceps"],
    sportCarryover: "Horizontal pushing strength balances the heavy pulling demands of throwing athletes",
  },
  db_row: {
    id: "db_row",
    name: "Dumbbell 3-Point Row",
    category: "strength",
    sets: "3", reps: "10–12 each", rest: "60 sec", tempo: "2-1-1-0",
    cues: [
      "Brace on bench — create stable base",
      "Drive elbow toward hip pocket — not up toward ear",
      "Squeeze lat at top for 1 second",
      "Don't rotate torso to get the weight up"
    ],
    progressions: ["Barbell Row", "Chest Supported Row", "Meadows Row"],
    regressions: ["Cable Row", "Band Pull Apart"],
    equipment: ["Dumbbell", "Bench"],
    primaryMuscles: ["Latissimus Dorsi", "Rhomboids", "Rear Delts", "Biceps"],
    sportCarryover: "Row strength = deceleration strength. Protects shoulder and elbow in follow-through phase",
  },
  landmine_press: {
    id: "landmine_press",
    name: "Landmine Press",
    category: "strength",
    sets: "3", reps: "10 each", rest: "75 sec", tempo: "2-0-1-0",
    cues: [
      "Staggered stance — contralateral foot forward",
      "Press in an arc — not straight up",
      "Shoulder blade protracts at end of press",
      "Core stays braced throughout"
    ],
    progressions: ["Half-Kneeling Landmine Press", "Rotational Landmine Press"],
    regressions: ["Cable Press", "Band Press"],
    equipment: ["Barbell", "Landmine Attachment or Corner"],
    primaryMuscles: ["Deltoid", "Serratus Anterior", "Triceps", "Core"],
    sportCarryover: "Shoulder-safe pressing. Trains the throwing shoulder in a natural arc. Excellent for pitchers",
    ageNote: "Preferred over overhead press for youth athletes and pitchers",
  },
  chin_up: {
    id: "chin_up",
    name: "Chin-up / Lat Pulldown",
    category: "strength",
    sets: "3", reps: "6–8", rest: "90 sec",
    cues: [
      "Depress shoulder blades before initiating pull",
      "Drive elbows down and back — not just bending arms",
      "Chin above bar — full range each rep",
      "Controlled descent — 3-second negative"
    ],
    progressions: ["Weighted Chin-up", "Close-Grip Pull-up", "L-Sit Pull-up"],
    regressions: ["Band-Assisted Chin-up", "Ring Row", "Inverted Row"],
    equipment: ["Pull-up Bar"],
    primaryMuscles: ["Latissimus Dorsi", "Biceps", "Mid-Traps", "Rhomboids"],
    sportCarryover: "Most important upper body pulling movement for throwing athletes. Lat strength = velocity and arm health",
  },

  // ══════════════════════════════════════════════════
  // POWER / EXPLOSIVENESS
  // ══════════════════════════════════════════════════
  broad_jump: {
    id: "broad_jump",
    name: "Broad Jump",
    category: "power",
    sets: "4", reps: "4", rest: "90 sec",
    cues: [
      "Load hips back before jumping — create tension",
      "Arms back on load, forward on launch",
      "Triple extension — ankle, knee, hip all extend simultaneously",
      "Land soft — absorb force through full lower body"
    ],
    progressions: ["Continuous Broad Jump", "Single Leg Broad Jump", "Weighted Vest Broad Jump"],
    regressions: ["Countermovement Jump", "Box Jump", "Squat Jump"],
    equipment: ["Open Floor Space"],
    primaryMuscles: ["Glutes", "Quads", "Hamstrings", "Calves"],
    sportCarryover: "Broad jump distance directly correlates with 60-yard dash time and hip extension power in hitters",
  },
  med_ball_rotational_throw: {
    id: "med_ball_rotational_throw",
    name: "Med Ball Rotational Scoop Throw",
    category: "power",
    sets: "4", reps: "5 each side", rest: "60 sec",
    cues: [
      "Load the hip on back leg — store energy",
      "Rotate hips FIRST — let arms follow",
      "Release at hip height with full hip extension",
      "Max intent every rep — this trains velocity, not endurance"
    ],
    progressions: ["Med Ball Rotational Slam", "Step-Through Throw", "Overhead MB Throw"],
    regressions: ["Standing Hip Turn", "Light Ball Rotation"],
    equipment: ["Medicine Ball (6–12 lbs)", "Wall or Partner"],
    primaryMuscles: ["Obliques", "Glutes", "Hip Flexors", "Lats"],
    sportCarryover: "Most sport-specific power transfer movement. Directly trains hip-to-shoulder sequencing for both swing and throw",
  },
  box_jump: {
    id: "box_jump",
    name: "Box Jump",
    category: "power",
    sets: "4", reps: "4", rest: "90 sec",
    cues: [
      "Step DOWN — don't jump down (joint impact risk)",
      "Full countermovement — swing arms up",
      "Land in athletic position — hips back, knees bent",
      "Reset fully between reps — this is NOT conditioning"
    ],
    progressions: ["Depth Jump", "Box Jump with lateral step", "Single Leg Box Jump"],
    regressions: ["Step-up", "Squat Jump to box", "Low-height box jump"],
    equipment: ["Plyo Box (18–30 inch)"],
    primaryMuscles: ["Quads", "Glutes", "Hamstrings", "Calves"],
    sportCarryover: "Reactive power — the ability to produce force quickly. Transfers to first-step quickness and hip drive",
    ageNote: "Youth: start at 12-inch box. Build height only when landing mechanics are perfect",
  },
  hang_clean: {
    id: "hang_clean",
    name: "Hang Power Clean",
    category: "power",
    sets: "4", reps: "3", rest: "2 min", tempo: "Explosive",
    cues: [
      "Push floor away, don't think pull",
      "Bar stays close to body throughout",
      "Triple extension — extend fully before catching",
      "Catch in quarter squat — absorb the load"
    ],
    progressions: ["Full Power Clean", "Clean from floor", "Clean and jerk"],
    regressions: ["Barbell High Pull", "Kettlebell Swing", "Jump Shrug"],
    equipment: ["Barbell", "Bumper Plates"],
    primaryMuscles: ["Glutes", "Hamstrings", "Traps", "Calves", "Core"],
    sportCarryover: "Triple extension mechanics are identical to drive phase of both the swing and the throw",
    ageNote: "Teach with technique bar or PVC pipe first. Not recommended for youth under 14 without proper coaching",
  },

  // ══════════════════════════════════════════════════
  // SPEED DEVELOPMENT
  // ══════════════════════════════════════════════════
  wall_drive: {
    id: "wall_drive",
    name: "Wall Drive — Acceleration Mechanics",
    category: "speed",
    sets: "4", reps: "8 drives each leg", rest: "60 sec",
    cues: [
      "Hands on wall at shoulder height — body at 45° lean",
      "Drive knee up and through — not kick forward",
      "Back leg extends FULLY — push the ground away",
      "Stay stiff through core — no hip sway"
    ],
    progressions: ["Resisted Sprint", "Wicket Drill", "A-March→A-Skip→A-Run"],
    regressions: ["Standing March", "Supine March"],
    equipment: ["Wall"],
    primaryMuscles: ["Hip Flexors", "Glutes", "Hamstrings"],
    sportCarryover: "Acceleration mechanics — the 0–20 yard phase of the 60-yard dash. Most important for baserunning",
  },
  flying_sprint: {
    id: "flying_sprint",
    name: "Flying Sprint (10-yard fly-in, 20-yard max)",
    category: "speed",
    sets: "5", reps: "1 per direction", rest: "3 min",
    cues: [
      "Build up over 10 yards — reach top speed before timing zone",
      "Upright posture at top speed — NOT forward lean",
      "Short, quick ground contact — don't 'push' the ground",
      "Arms drive the legs — tight, fast arm action"
    ],
    progressions: ["Resisted flying sprint", "Downhill sprint", "Flying 30"],
    regressions: ["Short acceleration (10yd)", "Sled push"],
    equipment: ["Open 40+ yards of space", "Cones"],
    primaryMuscles: ["Hamstrings", "Glutes", "Hip Flexors"],
    sportCarryover: "Top speed mechanics for center fielders and outfield gap tracking. Also develops max velocity for all positions",
  },
  sixty_yard_protocol: {
    id: "sixty_yard_protocol",
    name: "60-Yard Dash Training Protocol",
    category: "speed",
    sets: "3", reps: "1 full run", rest: "5 min",
    cues: [
      "First 20 yards: body at 45°, eyes on ground, drive hard",
      "20–40 yards: gradually rise, maintain drive",
      "40–60 yards: fully upright, relax and flow — tension kills speed",
      "Time all attempts and track progression weekly"
    ],
    progressions: ["Add weighted vest on acceleration portion", "Video analysis of every attempt"],
    regressions: ["20-yard sprint", "First-step drill from batting stance"],
    equipment: ["60 yards open field/track", "Stopwatch"],
    primaryMuscles: ["Full lower body", "Core"],
    sportCarryover: "The primary athletic metric for baseball/softball recruiting. Sub-6.8 for OF, sub-7.0 for IF",
  },
  first_step_quickness: {
    id: "first_step_quickness",
    name: "First-Step Quickness Drill — Reactive",
    category: "speed",
    sets: "4", reps: "6 reps", rest: "60 sec",
    cues: [
      "Start in athletic position — weight centered, knees bent",
      "React to coach's call or signal — don't anticipate",
      "First two steps drive into ground — no false steps",
      "Stay low through first 3 strides"
    ],
    progressions: ["Mirror Drill", "Ball Drop Reaction", "Visual Reaction Sprint"],
    regressions: ["Lateral shuffle drill", "Linear first step drill"],
    equipment: ["Cones", "Open space"],
    primaryMuscles: ["Quads", "Glutes", "Core"],
    sportCarryover: "First-step quickness is the #1 predictor of defensive range. Critical for all positions",
  },

  // ══════════════════════════════════════════════════
  // AGILITY
  // ══════════════════════════════════════════════════
  pro_agility: {
    id: "pro_agility",
    name: "Pro Agility (5-10-5) Shuttle",
    category: "agility",
    sets: "5", reps: "1 per direction", rest: "90 sec",
    cues: [
      "Start line hand touches the ground — athletic stance",
      "First step drives toward first cone — not shuffle step",
      "Plant outside foot hard at each turn — don't round",
      "Drive back to start at full speed last 5 yards"
    ],
    progressions: ["Timed 5-10-5", "5-10-5 with ball catch at each cone", "Weighted vest version"],
    regressions: ["3-cone drill", "T-test at walking pace for pattern"],
    equipment: ["3 cones", "Turf or track"],
    primaryMuscles: ["Glutes", "Quads", "Hip Adductors"],
    sportCarryover: "Change of direction — lateral range for middle infielders and outfielders",
  },
  t_drill: {
    id: "t_drill",
    name: "T-Drill",
    category: "agility",
    sets: "4", reps: "1 each direction", rest: "2 min",
    cues: [
      "Shuffle sideways — don't cross feet on lateral run",
      "Stay low throughout — never stand tall mid-drill",
      "Touch each cone base — teaches deceleration",
      "Backpedal to start — don't turn around"
    ],
    progressions: ["T-drill with reaction cue", "T-drill with ball"],
    regressions: ["Half-T drill", "Lateral shuffle between 2 cones"],
    equipment: ["4 cones"],
    primaryMuscles: ["Lateral hip rotators", "Quads", "Core"],
    sportCarryover: "Combines forward sprint, lateral shuffle, and backpedal — all movements used in outfield reads",
  },
  lateral_bound: {
    id: "lateral_bound",
    name: "Lateral Bound (Reactive Bound)",
    category: "agility",
    sets: "4", reps: "6 each direction", rest: "75 sec",
    cues: [
      "Stick the landing on one leg — balance for 2 seconds",
      "Load the hip before launching laterally",
      "Drive off outside leg — push the ground away",
      "Land soft, absorb through ankle-knee-hip"
    ],
    progressions: ["Continuous lateral bound", "Lateral bound with sprint"], 
    regressions: ["Lateral step to balance", "Low hurdle lateral step"],
    equipment: ["Open space", "Optional mini-hurdles"],
    primaryMuscles: ["Glutes", "Hip Abductors", "Quads", "Core"],
    sportCarryover: "Lateral power for diving plays, baserunning cuts, and defensive jumps",
  },
  cone_shuffle: {
    id: "cone_shuffle",
    name: "Cone Shuffle Drill — ILF Pattern",
    category: "agility",
    sets: "4", reps: "2 each direction", rest: "60 sec",
    cues: [
      "Stay in athletic position — hips low, never upright",
      "Quick feet — 1-2 step pattern between cones",
      "Eyes up — read and react",
      "Drive out of each change of direction aggressively"
    ],
    progressions: ["Add directional command from coach", "Increase cone distance"],
    regressions: ["3-cone basic pattern", "Walk-through of pattern"],
    equipment: ["6 cones"],
    primaryMuscles: ["Hip Flexors", "Glutes", "Quads"],
    sportCarryover: "Infield footwork patterns, catcher blocking position, baserunner reads",
  },

  // ══════════════════════════════════════════════════
  // CONDITIONING
  // ══════════════════════════════════════════════════
  baseball_interval: {
    id: "baseball_interval",
    name: "Baseball Interval Conditioning",
    category: "conditioning",
    sets: "8", reps: "20 sec max effort : 40 sec rest", rest: "As programmed",
    cues: [
      "TRUE max effort every interval — not 80%",
      "Use position-specific movements (sprint, shuffle, backpedal)",
      "Track distance per interval — look for consistency",
      "Stop if speed drops below 90% of first interval"
    ],
    progressions: ["12 rounds", "10 sec rest periods", "Resisted sprints"],
    regressions: ["6 rounds", "30 sec rest", "Stationary bike interval"],
    equipment: ["Field or track", "Timer"],
    primaryMuscles: ["Full body", "Cardiovascular system"],
    sportCarryover: "Baseball/softball is anaerobic — bursts of max effort with rest. This replicates game demands exactly",
  },
  sled_push: {
    id: "sled_push",
    name: "Heavy Sled Push",
    category: "conditioning",
    sets: "6", reps: "20 yards", rest: "90 sec",
    cues: [
      "Forward lean — body at 45° to sled",
      "Drive knees up and through — acceleration mechanics",
      "Short, powerful ground contacts — not shuffling",
      "Maintain pressure on handles throughout"
    ],
    progressions: ["Increase load", "20-yard sprint immediately after sled"],
    regressions: ["Light sled push (technique focus)", "Unloaded sled"],
    equipment: ["Sled", "Turf or track", "Weight plates"],
    primaryMuscles: ["Quads", "Glutes", "Calves", "Core"],
    sportCarryover: "Acceleration specific. Also builds sport-specific lower body conditioning without spinal load",
  },

  // ══════════════════════════════════════════════════
  // MOBILITY & MOVEMENT PREP
  // ══════════════════════════════════════════════════
  hip_90_90: {
    id: "hip_90_90",
    name: "Hip 90/90 Stretch",
    category: "mobility",
    sets: "2", reps: "60 sec each position", rest: "None",
    cues: [
      "Both legs at 90° — front shin perpendicular, rear shin parallel",
      "Sit tall — no rounding in low back",
      "Lean forward over front leg to increase stretch",
      "Hold tension — don't force it"
    ],
    progressions: ["Hip 90/90 with rotation", "Active 90/90 transitions"],
    regressions: ["Supine figure-four", "Pigeon pose"],
    equipment: ["Floor mat"],
    primaryMuscles: ["Hip External Rotators", "Hip Internal Rotators", "Glutes"],
    sportCarryover: "Hip mobility is the foundation of all rotational power. Limited hip IR = arm compensation = injury",
  },
  thoracic_rotation: {
    id: "thoracic_rotation",
    name: "Thoracic Rotation — Quadruped",
    category: "mobility",
    sets: "2", reps: "10 each direction", rest: "None",
    cues: [
      "Hand behind ear — don't pull on neck",
      "Rotate from mid-back — not lumbar",
      "Try to show ceiling with elbow at top of rotation",
      "Keep hips square throughout"
    ],
    progressions: ["Standing thoracic rotation", "T-spine rotation with reach"],
    regressions: ["Foam roller T-spine extension", "Book openings"],
    equipment: ["Floor mat"],
    primaryMuscles: ["Thoracic Erectors", "Rotator Cuff (stabilizing)", "Obliques"],
    sportCarryover: "T-spine mobility is the most common missing link for rotational athletes. Directly impacts pitch velocity and bat lag",
  },
  ankle_mobility: {
    id: "ankle_mobility",
    name: "Ankle Dorsiflexion Mobility Drill",
    category: "mobility",
    sets: "2", reps: "10 each side", rest: "None",
    cues: [
      "Lunge forward — push knee over pinky toe",
      "Keep heel down — that's the whole point",
      "Go as far forward as possible while heel stays flat",
      "Measure with ruler: heel-to-wall distance"
    ],
    progressions: ["Weighted ankle mobility", "Single leg squat for ankle mobility"],
    regressions: ["Seated ankle circles", "Calf foam roll before drill"],
    equipment: ["Wall", "Floor space"],
    primaryMuscles: ["Ankle Dorsiflexors", "Gastrocnemius", "Soleus"],
    sportCarryover: "Ankle mobility limits squat depth, landing mechanics, and acceleration. Poor ankle = compensated movement chain",
  },
  hip_flexor_stretch: {
    id: "hip_flexor_stretch",
    name: "Hip Flexor Stretch — Kneeling + Reach",
    category: "mobility",
    sets: "2", reps: "45 sec each side", rest: "None",
    cues: [
      "Squeeze glute of back leg hard before leaning forward",
      "Posterior pelvic tilt — tuck tailbone under",
      "Reach arm overhead on same side as back leg",
      "Feel it in front of hip of back leg"
    ],
    progressions: ["Active hip flexor stretch", "Kneeling hip flexor with rotation"],
    regressions: ["Standing hip flexor stretch", "Supine psoas stretch"],
    equipment: ["Floor mat", "Optional yoga block"],
    primaryMuscles: ["Iliopsoas", "Rectus Femoris"],
    sportCarryover: "Tight hip flexors inhibit glute activation — literally turning off your most powerful muscle. Critical for all athletes",
  },

  // ══════════════════════════════════════════════════
  // ARM CARE (Throwing Athletes)
  // ══════════════════════════════════════════════════
  band_external_rotation: {
    id: "band_external_rotation",
    name: "Band External Rotation (90/90)",
    category: "arm_care",
    sets: "3", reps: "15", rest: "30 sec",
    cues: [
      "Upper arm parallel to floor — shoulder at 90°",
      "Rotate forearm back — lead with hand, not elbow",
      "Controlled return — 2-second negative",
      "Band tension stays constant — don't let band pull you"
    ],
    progressions: ["Increase band resistance", "Prone Y on incline bench"],
    regressions: ["Side-lying ER with light dumbbell"],
    equipment: ["Resistance Band"],
    primaryMuscles: ["Infraspinatus", "Teres Minor (Rotator Cuff)"],
    sportCarryover: "The deceleration rotator cuff. The most important arm care exercise for every throwing athlete",
  },
  band_w: {
    id: "band_w",
    name: "Band W (Shoulder Stability Complex)",
    category: "arm_care",
    sets: "3", reps: "12", rest: "30 sec",
    cues: [
      "Arms form W shape — elbows bent at 90°",
      "Pull band apart while maintaining W",
      "Squeeze shoulder blades together at end",
      "Don't shrug — keep traps down"
    ],
    progressions: ["Prone W on incline bench", "Resistance band pull apart"],
    regressions: ["No band W with perfect form"],
    equipment: ["Resistance Band"],
    primaryMuscles: ["Rear Deltoid", "Lower Traps", "Rhomboids"],
    sportCarryover: "Scapular stability — the foundation of a healthy throwing shoulder. Does not replace medically directed rehab",
  },
  prone_y_t_w: {
    id: "prone_y_t_w",
    name: "Prone YTW",
    category: "arm_care",
    sets: "2", reps: "10 each position", rest: "30 sec",
    cues: [
      "Y: arms at 30° above head, thumbs up",
      "T: arms perpendicular, thumbs up",
      "W: elbows bent 90°, pull back",
      "Only go as high as you can without compensation"
    ],
    progressions: ["Prone YTW on incline bench with light weight", "Stability ball YTW"],
    regressions: ["Seated YTW (gravity assisted)"],
    equipment: ["Flat bench or floor mat", "Optional very light dumbbells (2–5 lbs)"],
    primaryMuscles: ["Lower Traps", "Middle Traps", "Serratus Anterior", "Rear Delts"],
    sportCarryover: "Lower and mid trap activation prevents shoulder impingement — very common in overhead throwers",
  },
};

// ─── Position-Specific Emphasis Notes ──────────────────────────────────────────

export const POSITION_PROFILES: Record<string, {
  displayName: string;
  primaryDemands: string[];
  keyStrengths: string[];
  keySpeed: string[];
  keyMobility: string[];
  recruitingMetrics: string[];
  trainingPriority: string;
  icon: string;
}> = {
  pitcher: {
    displayName: "Pitcher",
    primaryDemands: ["Arm velocity", "Arm durability", "Lower body drive", "Hip-shoulder separation"],
    keyStrengths: ["Trap Bar Deadlift", "Chin-ups", "Landmine Press", "Single-leg RDL"],
    keySpeed: ["Wall Drives", "Hip Hinge mechanics", "Explosive hip extension"],
    keyMobility: ["Hip 90/90", "Thoracic Rotation", "Ankle Mobility"],
    recruitingMetrics: ["Pitch velocity (mph)", "Spin rate (rpm)", "Command metrics"],
    trainingPriority: "Arm care + posterior chain strength + hip mobility = velocity AND health",
    icon: "⚾",
  },
  catcher: {
    displayName: "Catcher",
    primaryDemands: ["Explosive hip extension (pop time)", "Squatting endurance", "Upper body power", "Arm strength"],
    keyStrengths: ["Bulgarian Split Squat", "Back Squat", "DB Row", "Landmine Press"],
    keySpeed: ["First-Step Quickness", "Lateral bound", "Hip drive explosiveness"],
    keyMobility: ["Hip 90/90", "Ankle Mobility", "Hip Flexor Stretch"],
    recruitingMetrics: ["Pop time (sec)", "Exit velocity (mph)", "Throw velocity (mph)"],
    trainingPriority: "Hip mobility + glute strength = better pop time. Ankle mobility = deeper, sustainable squat position",
    icon: "🎯",
  },
  first_base: {
    displayName: "First Base",
    primaryDemands: ["Stretch reach (hip mobility)", "Short burst power", "Upper body strength", "Agility around bag"],
    keyStrengths: ["Back Squat", "DB Bench Press", "DB Row", "RDL"],
    keySpeed: ["First-step quickness", "Short acceleration"],
    keyMobility: ["Hip flexor", "Hip 90/90", "Hamstring flexibility"],
    recruitingMetrics: ["Exit velocity (mph)", "Sprint time (0-90 ft)", "Arm strength (mph)"],
    trainingPriority: "Balanced power development. Exit velocity is the primary metric for 1B recruiting",
    icon: "1️⃣",
  },
  second_base: {
    displayName: "Second Base",
    primaryDemands: ["Change of direction", "Quick release", "Lateral quickness", "Arm strength"],
    keyStrengths: ["Bulgarian Split Squat", "RDL", "Chin-ups", "DB Row"],
    keySpeed: ["Pro Agility", "First-Step Quickness", "Lateral Bound"],
    keyMobility: ["Thoracic rotation", "Hip 90/90", "Ankle Mobility"],
    recruitingMetrics: ["60-yard dash (sec)", "Exit velocity (mph)", "Arm velocity (mph)"],
    trainingPriority: "Lateral quickness and quick-twitch power. Range + athleticism = 2B recruiting profile",
    icon: "2️⃣",
  },
  shortstop: {
    displayName: "Shortstop",
    primaryDemands: ["Elite change of direction", "Arm strength", "Explosiveness in all directions", "Body control"],
    keyStrengths: ["Trap Bar Deadlift", "Bulgarian Split Squat", "Hang Clean", "Chin-ups"],
    keySpeed: ["60-Yard Protocol", "Pro Agility", "T-Drill", "Lateral Bound"],
    keyMobility: ["Full mobility circuit", "Hip 90/90", "Thoracic Rotation"],
    recruitingMetrics: ["60-yard dash (sec)", "Arm velocity (mph)", "Exit velocity (mph)"],
    trainingPriority: "The most athletic position. Speed + strength + mobility must all be elite. No weak links allowed",
    icon: "⚡",
  },
  third_base: {
    displayName: "Third Base",
    primaryDemands: ["Reaction time", "Upper body power", "Arm strength", "Lateral quickness"],
    keyStrengths: ["Trap Bar Deadlift", "DB Bench Press", "DB Row", "Back Squat"],
    keySpeed: ["First-Step Quickness", "Lateral Bound", "Pro Agility"],
    keyMobility: ["Thoracic Rotation", "Hip 90/90"],
    recruitingMetrics: ["Exit velocity (mph)", "Arm velocity (mph)", "60-yard dash (sec)"],
    trainingPriority: "Reaction + power. Hot corner players need maximum rotational power for both bat and arm",
    icon: "3️⃣",
  },
  outfield: {
    displayName: "Outfield",
    primaryDemands: ["Top-end speed", "First-step quickness to ball", "Arm strength and accuracy", "Power"],
    keyStrengths: ["Trap Bar Deadlift", "Back Squat", "Hang Clean", "Box Jump"],
    keySpeed: ["60-Yard Protocol", "Flying Sprint", "T-Drill", "First-Step Quickness"],
    keyMobility: ["Hip Flexor Stretch", "Hip 90/90", "Thoracic Rotation"],
    recruitingMetrics: ["60-yard dash (sec)", "Exit velocity (mph)", "Arm velocity (mph)"],
    trainingPriority: "Speed is the #1 outfield tool. A sub-6.8 time opens every door. Train speed FIRST, power second",
    icon: "🏃",
  },
  utility: {
    displayName: "Utility / Multi-Position",
    primaryDemands: ["Balanced athleticism", "Position versatility", "Physical durability"],
    keyStrengths: ["Trap Bar Deadlift", "Back Squat", "Chin-ups", "DB Row"],
    keySpeed: ["60-Yard Protocol", "Pro Agility", "First-Step Quickness"],
    keyMobility: ["Full mobility circuit"],
    recruitingMetrics: ["60-yard dash (sec)", "Exit velocity (mph)", "Multiple position proficiency"],
    trainingPriority: "No holes in athleticism. Utility value comes from being above average in all tools, not elite in one",
    icon: "🔄",
  },
};

export const SOFTBALL_POSITION_PROFILES: Record<string, typeof POSITION_PROFILES[string]> = {
  pitcher: {
    displayName: "Pitcher",
    primaryDemands: ["Pitch velocity", "Spin efficiency", "Hip drive", "Arm health"],
    keyStrengths: ["Single-leg RDL", "Chin-ups", "Landmine Press", "Hip hinge work"],
    keySpeed: ["Hip hinge mechanics", "Linear drive", "Lower body explosiveness"],
    keyMobility: ["Hip 90/90", "Hip Flexor Stretch", "Thoracic Rotation"],
    recruitingMetrics: ["Pitch velocity (mph)", "Spin rate (rpm)", "Command %"],
    trainingPriority: "Softball pitchers throw every game — longevity is the primary performance metric. Hip strength protects the arm",
    icon: "🥎",
  },
  catcher: {
    displayName: "Catcher",
    primaryDemands: ["Pop time", "Blocking athleticism", "Arm strength", "Leadership"],
    keyStrengths: ["Bulgarian Split Squat", "RDL", "Landmine Press"],
    keySpeed: ["First-Step Quickness", "Lateral bound"],
    keyMobility: ["Ankle Mobility", "Hip 90/90", "Hip Flexor Stretch"],
    recruitingMetrics: ["Pop time (sec)", "Exit velocity (mph)", "Throw velocity (mph)"],
    trainingPriority: "Ankle and hip mobility first — the squat position demands it. Glute strength second for explosive pop time",
    icon: "🎯",
  },
  infield: {
    displayName: "Infield",
    primaryDemands: ["Lateral quickness", "Quick release", "Reaction", "Arm accuracy"],
    keyStrengths: ["Bulgarian Split Squat", "Chin-ups", "RDL"],
    keySpeed: ["Pro Agility", "First-Step Quickness", "Lateral Bound"],
    keyMobility: ["Hip 90/90", "Thoracic Rotation"],
    recruitingMetrics: ["60-yard dash (sec)", "Exit velocity (mph)", "Arm velocity (mph)"],
    trainingPriority: "In softball, faster pitching means less reaction time. Lateral quickness training is even more critical than baseball",
    icon: "⚡",
  },
  outfield: {
    displayName: "Outfield",
    primaryDemands: ["Speed", "First step", "Arm strength", "Exit velocity"],
    keyStrengths: ["Trap Bar Deadlift", "Back Squat", "Box Jump"],
    keySpeed: ["60-Yard Protocol", "Flying Sprint", "T-Drill"],
    keyMobility: ["Hip Flexor Stretch", "Hip 90/90"],
    recruitingMetrics: ["60-yard dash (sec)", "Exit velocity (mph)", "Arm velocity (mph)"],
    trainingPriority: "Speed first. Softball outfields are smaller but the reaction windows are shorter. First-step + max speed = elite OF",
    icon: "🏃",
  },
  dp_flex: {
    displayName: "DP/Flex",
    primaryDemands: ["Pure offensive production", "Power hitting", "Exit velocity"],
    keyStrengths: ["Back Squat", "Trap Bar Deadlift", "Med Ball Rotational Throw"],
    keySpeed: ["Med Ball power transfer", "Hip extension explosiveness"],
    keyMobility: ["Hip 90/90", "Thoracic Rotation"],
    recruitingMetrics: ["Exit velocity (mph)", "Bat speed (mph)", "Slugging %"],
    trainingPriority: "Power production above all else. The DP role is about hitting — maximize exit velocity and bat speed",
    icon: "💥",
  },
  utility: {
    displayName: "Utility",
    primaryDemands: ["Positional versatility", "Balanced tools", "Durability"],
    keyStrengths: ["Full balanced program"],
    keySpeed: ["All speed metrics"],
    keyMobility: ["Full mobility circuit"],
    recruitingMetrics: ["All tools balanced"],
    trainingPriority: "No weakness is the job description. Coaches select utility players because they never hurt the team anywhere",
    icon: "🔄",
  },
};

// ─── Full Program Definitions ──────────────────────────────────────────────────

export const PROGRAMS: TrainingProgram[] = [
  {
    id: "off-season-velocity-builder",
    name: "Off-Season Velocity Builder",
    subtitle: "12-Week Max Development Phase",
    description: "The VAULT™ signature off-season program. Builds the physical foundation — posterior chain strength, rotational power, and top-end speed — that produces velocity gains on the mound and in the box.",
    sport: "both",
    positions: ["pitcher", "catcher", "first_base", "second_base", "shortstop", "third_base", "outfield", "utility"],
    phase: "off_season",
    ageGroup: "hs_14_18",
    difficulty: "intermediate",
    durationWeeks: 12,
    sessionsPerWeek: 4,
    primaryGoal: "Build max strength and power base to drive velocity gains",
    keyMetrics: ["Trap Bar Deadlift 1RM", "Broad Jump distance", "60-yard dash time"],
    progressionNotes: "Weeks 1–4: Base strength. Weeks 5–8: Power conversion. Weeks 9–12: Velocity expression. De-load in Week 4 and Week 8.",
    warningNotes: "This program is designed for athletes in their TRUE off-season with no throwing/hitting volume. Adjust arm care accordingly.",
    weeklyStructure: [
      {
        id: "day-1",
        day: "Monday",
        theme: "MAX STRENGTH — Lower Body",
        focus: ["strength", "power"],
        totalTime: "75 min",
        coachingCue: "Today you're building the engine. Every rep with max intent. This is where velocity comes from.",
        blocks: [
          {
            name: "Movement Prep",
            duration: "12 min",
            exercises: [
              EXERCISES.hip_90_90,
              EXERCISES.thoracic_rotation,
              EXERCISES.hip_flexor_stretch,
            ],
          },
          {
            name: "Power Primer",
            duration: "15 min",
            exercises: [EXERCISES.broad_jump],
          },
          {
            name: "Main Strength Block",
            duration: "40 min",
            exercises: [
              EXERCISES.trap_bar_deadlift,
              EXERCISES.bulgarian_split_squat,
              EXERCISES.rdl,
            ],
          },
          {
            name: "Arm Care Finish",
            duration: "10 min",
            exercises: [EXERCISES.band_external_rotation, EXERCISES.prone_y_t_w],
          },
        ],
      },
      {
        id: "day-2",
        day: "Tuesday",
        theme: "SPEED & AGILITY — Athletic Development",
        focus: ["speed", "agility", "conditioning"],
        totalTime: "60 min",
        coachingCue: "Speed is a skill. Every sprint is perfect technique or it doesn't count. Slow down to go fast.",
        blocks: [
          {
            name: "Movement Prep",
            duration: "15 min",
            exercises: [EXERCISES.ankle_mobility, EXERCISES.hip_flexor_stretch, EXERCISES.hip_90_90],
          },
          {
            name: "Acceleration Mechanics",
            duration: "15 min",
            exercises: [EXERCISES.wall_drive],
          },
          {
            name: "Speed Block",
            duration: "20 min",
            exercises: [EXERCISES.sixty_yard_protocol],
          },
          {
            name: "Agility Finish",
            duration: "15 min",
            exercises: [EXERCISES.pro_agility, EXERCISES.lateral_bound],
          },
        ],
      },
      {
        id: "day-3",
        day: "Thursday",
        theme: "MAX STRENGTH — Upper Body + Rotational Power",
        focus: ["strength", "power"],
        totalTime: "70 min",
        coachingCue: "Chin-ups and rows are arm health insurance. Every rep matters for your shoulder's future.",
        blocks: [
          {
            name: "Movement Prep",
            duration: "10 min",
            exercises: [EXERCISES.thoracic_rotation, EXERCISES.band_w],
          },
          {
            name: "Power Block",
            duration: "15 min",
            exercises: [EXERCISES.med_ball_rotational_throw],
          },
          {
            name: "Main Strength Block",
            duration: "35 min",
            exercises: [
              EXERCISES.chin_up,
              EXERCISES.landmine_press,
              EXERCISES.db_row,
              EXERCISES.db_bench_press,
            ],
          },
          {
            name: "Arm Care",
            duration: "12 min",
            exercises: [EXERCISES.band_external_rotation, EXERCISES.prone_y_t_w, EXERCISES.band_w],
          },
        ],
      },
      {
        id: "day-4",
        day: "Saturday",
        theme: "EXPLOSIVE POWER — Full Body",
        focus: ["power", "speed", "conditioning"],
        totalTime: "65 min",
        coachingCue: "The whole system fires today. Be fresh, be violent, be intentional.",
        blocks: [
          {
            name: "Movement Prep",
            duration: "12 min",
            exercises: [EXERCISES.hip_90_90, EXERCISES.thoracic_rotation],
          },
          {
            name: "Plyometric Block",
            duration: "18 min",
            exercises: [EXERCISES.box_jump, EXERCISES.broad_jump],
          },
          {
            name: "Olympic Lift Block",
            duration: "20 min",
            exercises: [EXERCISES.hang_clean],
          },
          {
            name: "Conditioning Finish",
            duration: "12 min",
            exercises: [EXERCISES.sled_push],
          },
        ],
      },
    ],
  },

  {
    id: "in-season-maintenance",
    name: "In-Season Performance Maintenance",
    subtitle: "Competition Phase — Stay Strong, Stay Fast",
    description: "Designed to maintain strength and power gains during the season without creating excess fatigue. 2-3 sessions/week, managed around game schedule.",
    sport: "both",
    positions: ["pitcher", "catcher", "first_base", "second_base", "shortstop", "third_base", "outfield", "utility"],
    phase: "in_season",
    ageGroup: "hs_14_18",
    difficulty: "intermediate",
    durationWeeks: 16,
    sessionsPerWeek: 2,
    primaryGoal: "Maintain off-season strength gains; reduce injury risk; recover between games",
    keyMetrics: ["RPE per session", "Jump height maintenance", "Sprint time maintenance"],
    progressionNotes: "Reduce volume 30% from off-season. Maintain intensity (load). Add rest days around doubleheaders.",
    warningNotes: "Do NOT train heavy the day before a game start. Pitchers: modify upper body on start days.",
    weeklyStructure: [
      {
        id: "inseason-1",
        day: "Non-Game Day",
        theme: "STRENGTH MAINTENANCE",
        focus: ["strength", "mobility"],
        totalTime: "45 min",
        coachingCue: "Maintain what you built. Minimum effective dose — quality over quantity.",
        blocks: [
          {
            name: "Movement Prep",
            duration: "8 min",
            exercises: [EXERCISES.hip_90_90, EXERCISES.thoracic_rotation],
          },
          {
            name: "Main Block",
            duration: "28 min",
            exercises: [
              { ...EXERCISES.trap_bar_deadlift, sets: "3", reps: "4" },
              { ...EXERCISES.chin_up, sets: "3", reps: "5-6" },
              { ...EXERCISES.db_row, sets: "2", reps: "10" },
            ],
          },
          {
            name: "Arm Care",
            duration: "10 min",
            exercises: [EXERCISES.band_external_rotation, EXERCISES.band_w],
          },
        ],
      },
      {
        id: "inseason-2",
        day: "Day After Game",
        theme: "RECOVERY & MOBILITY",
        focus: ["mobility", "conditioning"],
        totalTime: "35 min",
        coachingCue: "Active recovery accelerates the process. Light movement beats rest-only every time.",
        blocks: [
          {
            name: "Full Mobility Circuit",
            duration: "20 min",
            exercises: [
              EXERCISES.hip_90_90,
              EXERCISES.hip_flexor_stretch,
              EXERCISES.thoracic_rotation,
              EXERCISES.ankle_mobility,
            ],
          },
          {
            name: "Arm Care",
            duration: "15 min",
            exercises: [EXERCISES.band_external_rotation, EXERCISES.prone_y_t_w, EXERCISES.band_w],
          },
        ],
      },
    ],
  },

  {
    id: "youth-foundation",
    name: "Youth Athletic Foundation",
    subtitle: "Ages 12–14 — Movement Quality First",
    description: "The VAULT™ youth program builds movement patterns, not max load. Based on NSCA youth training guidelines. Focus: locomotion, body awareness, and joy of movement. No barbell Olympic lifts.",
    sport: "both",
    positions: ["pitcher", "catcher", "first_base", "second_base", "shortstop", "third_base", "outfield", "utility"],
    phase: "off_season",
    ageGroup: "youth_12_14",
    difficulty: "beginner",
    durationWeeks: 8,
    sessionsPerWeek: 3,
    primaryGoal: "Build movement quality, relative strength, and athletic confidence",
    keyMetrics: ["Broad jump distance", "10-yard sprint", "Chin-up reps"],
    progressionNotes: "Progress by mastering movement quality before adding load. Coach-supervised only. Fun is a performance metric.",
    warningNotes: "NSCA guidelines: No max-effort Olympic lifting for youth. Bodyweight and light dumbbell focus. Never train to failure with youth athletes.",
    weeklyStructure: [
      {
        id: "youth-1",
        day: "Day 1",
        theme: "MOVEMENT FOUNDATION",
        focus: ["strength", "agility"],
        totalTime: "45 min",
        coachingCue: "Perfect movement first. We earn the right to add weight later.",
        blocks: [
          {
            name: "Movement Games (Warm-Up)",
            duration: "10 min",
            blockNotes: "Tag variations, relay races — make it competitive and fun",
            exercises: [],
          },
          {
            name: "Movement Skills",
            duration: "20 min",
            exercises: [
              { ...EXERCISES.broad_jump, sets: "3", reps: "3" },
              { ...EXERCISES.wall_drive, sets: "3", reps: "6 each" },
              { ...EXERCISES.first_step_quickness, sets: "3", reps: "4" },
            ],
          },
          {
            name: "Bodyweight Strength",
            duration: "12 min",
            exercises: [
              { ...EXERCISES.bulgarian_split_squat, sets: "3", reps: "8 each", equipment: ["Bench (bodyweight only)"] },
              { ...EXERCISES.chin_up, sets: "3", reps: "3-5 (assisted ok)" },
            ],
          },
        ],
      },
      {
        id: "youth-2",
        day: "Day 2",
        theme: "SPEED & PLAY",
        focus: ["speed", "agility"],
        totalTime: "40 min",
        coachingCue: "Speed is a superpower. Learn how to use it.",
        blocks: [
          {
            name: "Speed Warm-Up",
            duration: "10 min",
            exercises: [EXERCISES.wall_drive],
          },
          {
            name: "Speed Skills",
            duration: "20 min",
            exercises: [
              EXERCISES.sixty_yard_protocol,
              EXERCISES.pro_agility,
              EXERCISES.lateral_bound,
            ],
          },
          {
            name: "Mobility Finish",
            duration: "10 min",
            exercises: [
              EXERCISES.hip_90_90,
              EXERCISES.hip_flexor_stretch,
            ],
          },
        ],
      },
    ],
  },

  {
    id: "pitcher-arm-health",
    name: "Pitcher Arm Health Protocol",
    subtitle: "Velocity + Durability Year-Round",
    description: "The complete pitcher strength system. Heavy emphasis on posterior chain (the true velocity chain), shoulder stability, and hip mobility. Built around the ASMI arm health research.",
    sport: "both",
    positions: ["pitcher"],
    phase: "off_season",
    ageGroup: "hs_14_18",
    difficulty: "intermediate",
    durationWeeks: 12,
    sessionsPerWeek: 4,
    primaryGoal: "Maximize arm velocity while protecting arm health",
    keyMetrics: ["Pitch velocity (mph)", "Trap Bar Deadlift 1RM", "Hip 90/90 mobility score"],
    progressionNotes: "Posterior chain strength is arm health. Every RDL, chin-up and external rotation rep is an investment in arm durability AND velocity.",
    warningNotes: "This is a supplement to throwing programs — not a replacement. Never throw heavy the day after a heavy strength session.",
    weeklyStructure: [
      {
        id: "pitcher-1",
        day: "Monday",
        theme: "POSTERIOR CHAIN + ARM CARE",
        focus: ["strength", "arm_care"],
        totalTime: "70 min",
        coachingCue: "Your legs and hips ARE your arm. Build them relentlessly.",
        blocks: [
          {
            name: "Movement Prep",
            duration: "12 min",
            exercises: [EXERCISES.hip_90_90, EXERCISES.thoracic_rotation, EXERCISES.ankle_mobility],
          },
          {
            name: "Strength Block",
            duration: "40 min",
            exercises: [
              EXERCISES.trap_bar_deadlift,
              EXERCISES.rdl,
              EXERCISES.bulgarian_split_squat,
              { ...EXERCISES.chin_up, sets: "4" },
            ],
          },
          {
            name: "Arm Care",
            duration: "18 min",
            exercises: [
              EXERCISES.band_external_rotation,
              EXERCISES.prone_y_t_w,
              EXERCISES.band_w,
            ],
          },
        ],
      },
      {
        id: "pitcher-2",
        day: "Wednesday",
        theme: "ROTATIONAL POWER + UPPER BODY",
        focus: ["power", "strength"],
        totalTime: "60 min",
        coachingCue: "Hip-to-shoulder sequence — hips first, always. Train the pattern, not just the muscle.",
        blocks: [
          {
            name: "Movement Prep",
            duration: "10 min",
            exercises: [EXERCISES.hip_flexor_stretch, EXERCISES.thoracic_rotation],
          },
          {
            name: "Power Block",
            duration: "15 min",
            exercises: [EXERCISES.med_ball_rotational_throw, EXERCISES.broad_jump],
          },
          {
            name: "Upper Body",
            duration: "28 min",
            exercises: [
              EXERCISES.landmine_press,
              EXERCISES.db_row,
              EXERCISES.db_bench_press,
            ],
          },
          {
            name: "Arm Care",
            duration: "10 min",
            exercises: [EXERCISES.band_external_rotation, EXERCISES.band_w],
          },
        ],
      },
    ],
  },

  {
    id: "speed-specialist",
    name: "Speed & Agility Specialist Program",
    subtitle: "60-Yard Dash Improvement Focus",
    description: "A pure speed development program for athletes targeting significant improvements in their 60-yard dash time. Combines acceleration mechanics, top-speed development, and change of direction.",
    sport: "both",
    positions: ["outfield", "shortstop", "second_base", "utility"],
    phase: "off_season",
    ageGroup: "hs_14_18",
    difficulty: "advanced",
    durationWeeks: 8,
    sessionsPerWeek: 3,
    primaryGoal: "Reduce 60-yard dash time by 0.2–0.4 seconds",
    keyMetrics: ["60-yard dash (sec)", "10-yard split", "Broad jump distance"],
    progressionNotes: "Never train speed when fatigued. Full rest between reps. Speed work is CNS-intensive — 72hrs min between speed sessions.",
    warningNotes: "Do NOT combine speed days with heavy lower body strength. Separate by 48 hours minimum.",
    weeklyStructure: [
      {
        id: "speed-1",
        day: "Day 1 — Acceleration",
        theme: "ACCELERATION MECHANICS",
        focus: ["speed"],
        totalTime: "55 min",
        coachingCue: "Acceleration is a skill, not just effort. Lean, push, don't run.",
        blocks: [
          {
            name: "Neural Warm-Up",
            duration: "15 min",
            exercises: [EXERCISES.ankle_mobility, EXERCISES.hip_flexor_stretch, EXERCISES.wall_drive],
          },
          {
            name: "Acceleration Block",
            duration: "30 min",
            exercises: [
              EXERCISES.wall_drive,
              { ...EXERCISES.sixty_yard_protocol, sets: "4", reps: "20-yard accelerations only" },
            ],
          },
          {
            name: "Power Finish",
            duration: "12 min",
            exercises: [EXERCISES.broad_jump, EXERCISES.box_jump],
          },
        ],
      },
      {
        id: "speed-2",
        day: "Day 2 — Agility",
        theme: "CHANGE OF DIRECTION",
        focus: ["agility", "speed"],
        totalTime: "50 min",
        coachingCue: "COD speed comes from deceleration, not just acceleration. Learn to stop to go fast.",
        blocks: [
          {
            name: "Warm-Up",
            duration: "12 min",
            exercises: [EXERCISES.hip_90_90, EXERCISES.ankle_mobility],
          },
          {
            name: "Agility Block",
            duration: "30 min",
            exercises: [
              EXERCISES.pro_agility,
              EXERCISES.t_drill,
              EXERCISES.lateral_bound,
              EXERCISES.cone_shuffle,
              EXERCISES.first_step_quickness,
            ],
          },
        ],
      },
      {
        id: "speed-3",
        day: "Day 3 — Max Velocity",
        theme: "TOP-END SPEED",
        focus: ["speed", "conditioning"],
        totalTime: "55 min",
        coachingCue: "Max velocity only happens when relaxed. Tension is the enemy of speed.",
        blocks: [
          {
            name: "Warm-Up",
            duration: "15 min",
            exercises: [EXERCISES.wall_drive, EXERCISES.ankle_mobility],
          },
          {
            name: "Max Velocity Block",
            duration: "30 min",
            exercises: [
              EXERCISES.flying_sprint,
              EXERCISES.sixty_yard_protocol,
            ],
          },
          {
            name: "Strength Finish",
            duration: "12 min",
            exercises: [EXERCISES.sled_push],
          },
        ],
      },
    ],
  },
];

// ─── Helper to get programs by filter ─────────────────────────────────────────

export function getPrograms(filters: {
  sport?: SportType;
  phase?: TrainingPhase;
  ageGroup?: AgeGroup;
  position?: string;
  difficulty?: Difficulty;
}): TrainingProgram[] {
  return PROGRAMS.filter(p => {
    if (filters.sport && p.sport !== "both" && p.sport !== filters.sport) return false;
    if (filters.phase && p.phase !== filters.phase) return false;
    if (filters.ageGroup && p.ageGroup !== "all" && p.ageGroup !== filters.ageGroup) return false;
    if (filters.position && !p.positions.includes(filters.position as any) && !p.positions.includes("all" as any)) return false;
    if (filters.difficulty && p.difficulty !== filters.difficulty) return false;
    return true;
  });
}

export const PHASE_LABELS: Record<TrainingPhase, string> = {
  off_season: "Off-Season",
  pre_season: "Pre-Season",
  in_season: "In-Season",
  post_season: "Post-Season",
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  beginner: "bg-green-500/10 text-green-600 border-green-500/20",
  intermediate: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  advanced: "bg-red-500/10 text-red-600 border-red-500/20",
};
