// Softball Development Tracks by Position
// Each track defines skill pathways, KPI benchmarks by age, drill progressions,
// assessment criteria, and intelligence engine rule mappings.

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'elite';
export type SoftballAgeGroup = '10U' | '12U' | '14U' | '16U' | '18U' | 'College';

export interface SkillPathwayStep {
  level: SkillLevel;
  label: string;
  description: string;
  skills: string[];
  typicalAgeRange: string;
}

export interface KPIBenchmark {
  kpiName: string;
  unit: string;
  category: string;
  benchmarks: Record<SoftballAgeGroup, { low: number; avg: number; good: number; elite: number }>;
  lowerIsBetter?: boolean;
}

export interface DrillProgression {
  phase: string;
  drillIds: string[];
  focusAreas: string[];
  weeksTypical: number;
}

export interface AssessmentArea {
  id: string;
  name: string;
  maxScore: number;
  drillMappings: string[];
}

export interface IntelligenceRuleRef {
  id: string;
  name: string;
  condition: string;
  action: string;
}

export interface PositionTrack {
  id: string;
  name: string;
  abbreviation: string;
  icon: string; // lucide icon name
  color: string;
  description: string;
  categories: string[];
  skillPathway: SkillPathwayStep[];
  kpiBenchmarks: KPIBenchmark[];
  drillProgressions: DrillProgression[];
  assessmentAreas: AssessmentArea[];
  intelligenceRules: IntelligenceRuleRef[];
}

// ─── PITCHER (FASTPITCH) ─────────────────────────────────────────────

const pitcherTrack: PositionTrack = {
  id: 'pitcher',
  name: 'Pitcher (Fastpitch)',
  abbreviation: 'P',
  icon: 'Target',
  color: '#a855f7',
  description: 'Complete windmill pitching development: mechanics, pitch arsenal, command, velocity, movement/spin, workload management, and pitch sequencing.',
  categories: ['Fastpitch Pitching', 'Hitting', 'Fielding', 'Strength & Conditioning', 'Mental Performance'],
  skillPathway: [
    {
      level: 'beginner', label: 'Foundation', description: 'Learn the windmill arm circle, proper stride mechanics, and basic fastball command.',
      skills: ['Stance & Setup', 'Arm Circle', 'Stride Mechanics', 'Wrist Snap', 'Fastball Grip', 'Balance'],
      typicalAgeRange: '8U–10U',
    },
    {
      level: 'intermediate', label: 'Arsenal Builder', description: 'Develop change-up and first breaking pitch. Build velocity and consistent command.',
      skills: ['Change-Up', 'Drop Ball', 'Pitch Command', 'Velocity Development', 'Pitch Charting', 'Game Awareness'],
      typicalAgeRange: '12U–14U',
    },
    {
      level: 'advanced', label: 'Dominant Pitcher', description: 'Full pitch arsenal with movement mastery. Advanced sequencing and situational pitching.',
      skills: ['Rise Ball', 'Curveball', 'Screwball', 'Pitch Sequencing', 'Hitter Setup', 'Situational Pitching'],
      typicalAgeRange: '16U–18U',
    },
    {
      level: 'elite', label: 'College Ready', description: 'Elite velocity, spin efficiency, and complete game management under pressure.',
      skills: ['Spin Efficiency', 'Velocity Peaks', 'Full Count Dominance', 'Scouting Adjustments', 'Recovery Management', 'Recruiting Readiness'],
      typicalAgeRange: 'College',
    },
  ],
  kpiBenchmarks: [
    {
      kpiName: 'pitch_speed', unit: 'mph', category: 'pitching',
      benchmarks: {
        '10U': { low: 32, avg: 38, good: 42, elite: 46 },
        '12U': { low: 38, avg: 44, good: 48, elite: 52 },
        '14U': { low: 43, avg: 50, good: 55, elite: 58 },
        '16U': { low: 50, avg: 56, good: 60, elite: 64 },
        '18U': { low: 56, avg: 61, good: 65, elite: 68 },
        'College': { low: 60, avg: 66, good: 70, elite: 72 },
      },
    },
    {
      kpiName: 'strike_percentage', unit: '%', category: 'pitching',
      benchmarks: {
        '10U': { low: 35, avg: 45, good: 55, elite: 65 },
        '12U': { low: 40, avg: 50, good: 60, elite: 70 },
        '14U': { low: 45, avg: 55, good: 65, elite: 75 },
        '16U': { low: 50, avg: 60, good: 70, elite: 78 },
        '18U': { low: 55, avg: 63, good: 72, elite: 80 },
        'College': { low: 58, avg: 65, good: 73, elite: 82 },
      },
    },
    {
      kpiName: 'spin_rate', unit: 'rpm', category: 'pitching',
      benchmarks: {
        '10U': { low: 400, avg: 600, good: 800, elite: 1000 },
        '12U': { low: 600, avg: 900, good: 1100, elite: 1300 },
        '14U': { low: 800, avg: 1100, good: 1400, elite: 1600 },
        '16U': { low: 1000, avg: 1300, good: 1600, elite: 1900 },
        '18U': { low: 1200, avg: 1500, good: 1800, elite: 2100 },
        'College': { low: 1400, avg: 1700, good: 2000, elite: 2300 },
      },
    },
  ],
  drillProgressions: [
    { phase: 'Phase 1: Mechanics Foundation', drillIds: ['p-001', 'p-002'], focusAreas: ['Stance & Setup', 'Arm Circle', 'Wrist Snap'], weeksTypical: 3 },
    { phase: 'Phase 2: Fastball Command', drillIds: ['p-004', 'p-010'], focusAreas: ['Location', 'Velocity', 'Consistency'], weeksTypical: 3 },
    { phase: 'Phase 3: Off-Speed Development', drillIds: ['p-005', 'p-006'], focusAreas: ['Change-Up', 'Drop Ball', 'Arm Speed Deception'], weeksTypical: 4 },
    { phase: 'Phase 4: Breaking Pitches', drillIds: ['p-007', 'p-008'], focusAreas: ['Rise Ball', 'Curveball', 'Spin Development'], weeksTypical: 4 },
    { phase: 'Phase 5: Game Mastery', drillIds: ['p-009', 'p-003'], focusAreas: ['Pitch Sequencing', 'Situational Pitching', 'Velocity Push'], weeksTypical: 4 },
  ],
  assessmentAreas: [
    { id: 'pitch-mechanics', name: 'Windmill Mechanics', maxScore: 10, drillMappings: ['p-001', 'p-002', 'p-003'] },
    { id: 'pitch-spin', name: 'Spin Development', maxScore: 10, drillMappings: ['p-006', 'p-007', 'p-008'] },
    { id: 'pitch-command', name: 'Pitch Command', maxScore: 10, drillMappings: ['p-004'] },
    { id: 'pitch-fastball', name: 'Fastball Quality', maxScore: 10, drillMappings: ['p-004', 'p-010'] },
    { id: 'pitch-changeup', name: 'Change-Up Quality', maxScore: 10, drillMappings: ['p-005'] },
    { id: 'pitch-breaking', name: 'Breaking Pitches', maxScore: 10, drillMappings: ['p-006', 'p-007', 'p-008'] },
    { id: 'pitch-sequencing', name: 'Pitch Sequencing', maxScore: 10, drillMappings: ['p-009'] },
  ],
  intelligenceRules: [
    { id: 'sb-pitch-velo-low', name: 'Low Velocity Alert', condition: 'pitch_speed < age_group_avg', action: 'assign_drill: p-003, p-010' },
    { id: 'sb-pitch-command-low', name: 'Command Below Threshold', condition: 'strike_percentage < 50%', action: 'assign_drill: p-004; flag_for_review' },
    { id: 'sb-pitch-overuse', name: 'Pitch Load Exceeded', condition: 'daily_pitches > threshold OR weekly_pitches > threshold', action: 'trigger_alert: rest_required' },
    { id: 'sb-pitch-mechanics-flag', name: 'Mechanics Risk Flag', condition: 'mechanics_flag IN (elbow_bend, closed_hip, hyperextended_stride)', action: 'trigger_alert: injury_risk; flag_for_review' },
    { id: 'sb-pitch-arsenal-gap', name: 'Missing Arsenal Pitch', condition: 'age >= 14U AND arsenal_count < 3', action: 'recommend_course: pitch-development' },
  ],
};

// ─── CATCHER ─────────────────────────────────────────────────────────

const catcherTrack: PositionTrack = {
  id: 'catcher',
  name: 'Catcher',
  abbreviation: 'C',
  icon: 'Shield',
  color: '#ec4899',
  description: 'Blocking, framing, pop time, game calling, pitcher management, and bunt coverage.',
  categories: ['Catching', 'Hitting', 'Throwing', 'Defensive IQ', 'Mental Performance'],
  skillPathway: [
    {
      level: 'beginner', label: 'Foundation', description: 'Learn receiving stance, basic blocking, and throwing fundamentals.',
      skills: ['Receiving Stance', 'Basic Blocking', 'Throwing to 2B', 'Gear Management', 'Framing Basics'],
      typicalAgeRange: '10U–12U',
    },
    {
      level: 'intermediate', label: 'Field General', description: 'Develop framing, pop time, and basic game calling.',
      skills: ['Advanced Framing', 'Pop Time Development', 'Bunt Coverage', 'Pitch Calling Basics', 'Blocking Lateral Pitches'],
      typicalAgeRange: '12U–14U',
    },
    {
      level: 'advanced', label: 'Elite Catcher', description: 'Master game management, pitcher relationships, and recruiting-level pop times.',
      skills: ['Game Calling', 'Pitcher Management', 'Snap Throws', 'Situational Blocking', 'Pick-off Plays'],
      typicalAgeRange: '16U–18U',
    },
    {
      level: 'elite', label: 'College Ready', description: 'Complete game management, staff leadership, and elite defensive metrics.',
      skills: ['Staff Management', 'Scouting Reports', 'Framing Metrics', 'Blocking Save Rate', 'Leadership'],
      typicalAgeRange: 'College',
    },
  ],
  kpiBenchmarks: [
    {
      kpiName: 'pop_time', unit: 'sec', category: 'catching', lowerIsBetter: true,
      benchmarks: {
        '10U': { low: 3.2, avg: 2.8, good: 2.5, elite: 2.2 },
        '12U': { low: 2.8, avg: 2.5, good: 2.2, elite: 2.0 },
        '14U': { low: 2.5, avg: 2.2, good: 2.0, elite: 1.8 },
        '16U': { low: 2.2, avg: 2.0, good: 1.8, elite: 1.7 },
        '18U': { low: 2.0, avg: 1.9, good: 1.7, elite: 1.6 },
        'College': { low: 1.9, avg: 1.8, good: 1.6, elite: 1.5 },
      },
    },
    {
      kpiName: 'throw_velocity', unit: 'mph', category: 'throwing',
      benchmarks: {
        '10U': { low: 35, avg: 40, good: 45, elite: 50 },
        '12U': { low: 40, avg: 46, good: 52, elite: 56 },
        '14U': { low: 46, avg: 52, good: 57, elite: 62 },
        '16U': { low: 50, avg: 56, good: 62, elite: 66 },
        '18U': { low: 54, avg: 60, good: 65, elite: 68 },
        'College': { low: 58, avg: 63, good: 67, elite: 70 },
      },
    },
    {
      kpiName: 'blocking_save_rate', unit: '%', category: 'catching',
      benchmarks: {
        '10U': { low: 50, avg: 60, good: 70, elite: 80 },
        '12U': { low: 55, avg: 65, good: 75, elite: 85 },
        '14U': { low: 60, avg: 72, good: 82, elite: 90 },
        '16U': { low: 65, avg: 75, good: 85, elite: 93 },
        '18U': { low: 70, avg: 80, good: 88, elite: 95 },
        'College': { low: 75, avg: 85, good: 92, elite: 97 },
      },
    },
  ],
  drillProgressions: [
    { phase: 'Phase 1: Receiving & Stance', drillIds: ['f-001', 'f-004'], focusAreas: ['Stance', 'Receiving', 'Framing'], weeksTypical: 3 },
    { phase: 'Phase 2: Blocking', drillIds: ['f-004', 'f-001'], focusAreas: ['Block Technique', 'Lateral Blocks', 'Recovery'], weeksTypical: 3 },
    { phase: 'Phase 3: Throwing', drillIds: ['f-003', 'f-002'], focusAreas: ['Pop Time', 'Transfer Speed', 'Accuracy'], weeksTypical: 3 },
    { phase: 'Phase 4: Game Calling', drillIds: ['f-005'], focusAreas: ['Pitch Selection', 'Hitter Tendencies', 'Communication'], weeksTypical: 3 },
  ],
  assessmentAreas: [
    { id: 'catch-blocking', name: 'Blocking', maxScore: 10, drillMappings: ['f-004', 'f-001'] },
    { id: 'catch-framing', name: 'Framing', maxScore: 10, drillMappings: ['f-001'] },
    { id: 'catch-pop-time', name: 'Pop Time', maxScore: 10, drillMappings: ['f-003', 'f-002'] },
    { id: 'catch-game-calling', name: 'Game Calling', maxScore: 10, drillMappings: ['f-005'] },
    { id: 'catch-bunt-coverage', name: 'Bunt Coverage', maxScore: 10, drillMappings: ['f-002', 'f-001'] },
  ],
  intelligenceRules: [
    { id: 'sb-catch-poptime-high', name: 'Pop Time Above Threshold', condition: 'pop_time > age_group_avg', action: 'assign_drill: throwing-transfer; flag_for_review' },
    { id: 'sb-catch-blocking-low', name: 'Blocking Rate Low', condition: 'blocking_save_rate < 65%', action: 'assign_drill: blocking-progression' },
  ],
};

// ─── INFIELD (2B/SS/3B/1B) ──────────────────────────────────────────

const infieldTrack: PositionTrack = {
  id: 'infield',
  name: 'Infield (2B/SS/3B/1B)',
  abbreviation: 'IF',
  icon: 'Diamond',
  color: '#f59e0b',
  description: 'Footwork, range, double play turns, bunt coverage, communication, and slap hit defense.',
  categories: ['Fielding', 'Hitting', 'Throwing', 'Defensive IQ', 'Base Running', 'Mental Performance'],
  skillPathway: [
    {
      level: 'beginner', label: 'Foundation', description: 'Ready position, ground ball approach, and basic throwing mechanics.',
      skills: ['Ready Position', 'Ground Ball Approach', 'Forehand/Backhand', 'Basic Throws', 'Fielding Through the Ball'],
      typicalAgeRange: '8U–10U',
    },
    {
      level: 'intermediate', label: 'Playmaker', description: 'Double play turns, range extension, and positional awareness.',
      skills: ['Double Play Feeds', 'Range Drills', 'Slow Roller Plays', 'Tag Plays', 'Communication'],
      typicalAgeRange: '12U–14U',
    },
    {
      level: 'advanced', label: 'Elite Infielder', description: 'Slap hit defense, advanced footwork, and game-speed reactions.',
      skills: ['Slap Defense', 'Dive & Recovery', 'Bare-Hand Plays', 'In-Between Hops', 'Pre-Pitch Reads'],
      typicalAgeRange: '16U–18U',
    },
    {
      level: 'elite', label: 'College Ready', description: 'Elite range, consistent arm accuracy, and leadership.',
      skills: ['Elite Lateral Range', 'Arm Accuracy Under Pressure', 'Defensive Leadership', 'Recruiting Showcase'],
      typicalAgeRange: 'College',
    },
  ],
  kpiBenchmarks: [
    {
      kpiName: 'throw_velocity', unit: 'mph', category: 'throwing',
      benchmarks: {
        '10U': { low: 33, avg: 38, good: 43, elite: 48 },
        '12U': { low: 38, avg: 44, good: 50, elite: 54 },
        '14U': { low: 44, avg: 50, good: 55, elite: 60 },
        '16U': { low: 48, avg: 54, good: 60, elite: 64 },
        '18U': { low: 52, avg: 58, good: 63, elite: 66 },
        'College': { low: 56, avg: 62, good: 66, elite: 70 },
      },
    },
    {
      kpiName: 'fielding_percentage', unit: '%', category: 'fielding',
      benchmarks: {
        '10U': { low: 70, avg: 78, good: 85, elite: 92 },
        '12U': { low: 75, avg: 82, good: 88, elite: 94 },
        '14U': { low: 80, avg: 87, good: 92, elite: 96 },
        '16U': { low: 85, avg: 90, good: 94, elite: 97 },
        '18U': { low: 88, avg: 92, good: 96, elite: 98 },
        'College': { low: 90, avg: 94, good: 97, elite: 99 },
      },
    },
  ],
  drillProgressions: [
    { phase: 'Phase 1: Ground Ball Fundamentals', drillIds: ['f-001', 'f-003'], focusAreas: ['Approach Angle', 'Soft Hands', 'Transfer'], weeksTypical: 3 },
    { phase: 'Phase 2: Footwork & Range', drillIds: ['f-002', 'f-004'], focusAreas: ['Lateral Movement', 'Crossover Steps', 'Recovery'], weeksTypical: 3 },
    { phase: 'Phase 3: Double Plays & Feeds', drillIds: ['f-005', 'f-002'], focusAreas: ['Feeds', 'Turns', 'Communication'], weeksTypical: 3 },
    { phase: 'Phase 4: Advanced Plays', drillIds: ['f-006', 'f-004'], focusAreas: ['Dive & Recovery', 'Bare-Hand', 'Slap Defense'], weeksTypical: 3 },
  ],
  assessmentAreas: [
    { id: 'if-glove', name: 'Glove Work', maxScore: 10, drillMappings: ['f-001', 'f-006'] },
    { id: 'if-footwork', name: 'Footwork', maxScore: 10, drillMappings: ['f-002'] },
    { id: 'if-throwing', name: 'Throwing Accuracy', maxScore: 10, drillMappings: ['f-003'] },
    { id: 'if-range', name: 'Range', maxScore: 10, drillMappings: ['f-002', 'f-004'] },
    { id: 'if-dp', name: 'Double Play Execution', maxScore: 10, drillMappings: ['f-005'] },
    { id: 'if-iq', name: 'Defensive IQ', maxScore: 10, drillMappings: ['f-005'] },
  ],
  intelligenceRules: [
    { id: 'sb-if-throw-low', name: 'Throw Velocity Below Average', condition: 'throw_velocity < age_group_avg', action: 'assign_drill: f-003; recommend_program: prog-defense' },
    { id: 'sb-if-fielding-low', name: 'Fielding Pct Below Threshold', condition: 'fielding_percentage < 85%', action: 'assign_drill: f-001, f-002' },
  ],
};

// ─── OUTFIELD (LF/CF/RF) ────────────────────────────────────────────

const outfieldTrack: PositionTrack = {
  id: 'outfield',
  name: 'Outfield (LF/CF/RF)',
  abbreviation: 'OF',
  icon: 'Circle',
  color: '#22c55e',
  description: 'First step, crow hop, relay throws, communication, and fence play.',
  categories: ['Fielding', 'Hitting', 'Throwing', 'Base Running', 'Defensive IQ', 'Mental Performance'],
  skillPathway: [
    {
      level: 'beginner', label: 'Foundation', description: 'Fly ball tracking, drop steps, and crow hop throwing.',
      skills: ['Drop Step', 'Fly Ball Tracking', 'Crow Hop Basics', 'Communication Calls', 'Ready Position'],
      typicalAgeRange: '8U–10U',
    },
    {
      level: 'intermediate', label: 'Route Runner', description: 'Efficient routes, relay accuracy, and gap coverage.',
      skills: ['Route Efficiency', 'Relay Throws', 'Gap Coverage', 'Fence Awareness', 'Backing Up Bases'],
      typicalAgeRange: '12U–14U',
    },
    {
      level: 'advanced', label: 'Elite Outfielder', description: 'Elite arm strength, diving catches, and game-reading ability.',
      skills: ['Diving Catches', 'Arm Strength', 'Pre-Pitch Positioning', 'Cutoff Communication', 'Fence Plays'],
      typicalAgeRange: '16U–18U',
    },
    {
      level: 'elite', label: 'College Ready', description: 'Plus arm, plus range, complete reads and instincts.',
      skills: ['Plus Arm', 'Plus Range', 'Game Instincts', 'Vocal Leadership', 'Recruiting Showcase'],
      typicalAgeRange: 'College',
    },
  ],
  kpiBenchmarks: [
    {
      kpiName: 'throw_velocity', unit: 'mph', category: 'throwing',
      benchmarks: {
        '10U': { low: 30, avg: 36, good: 42, elite: 48 },
        '12U': { low: 36, avg: 42, good: 48, elite: 54 },
        '14U': { low: 42, avg: 48, good: 54, elite: 60 },
        '16U': { low: 48, avg: 54, good: 60, elite: 65 },
        '18U': { low: 52, avg: 58, good: 64, elite: 68 },
        'College': { low: 56, avg: 62, good: 68, elite: 72 },
      },
    },
    {
      kpiName: 'first_step_time', unit: 'sec', category: 'speed', lowerIsBetter: true,
      benchmarks: {
        '10U': { low: 1.2, avg: 1.0, good: 0.85, elite: 0.75 },
        '12U': { low: 1.1, avg: 0.95, good: 0.8, elite: 0.7 },
        '14U': { low: 1.0, avg: 0.85, good: 0.75, elite: 0.65 },
        '16U': { low: 0.9, avg: 0.8, good: 0.7, elite: 0.6 },
        '18U': { low: 0.85, avg: 0.75, good: 0.65, elite: 0.55 },
        'College': { low: 0.8, avg: 0.7, good: 0.6, elite: 0.5 },
      },
    },
  ],
  drillProgressions: [
    { phase: 'Phase 1: Fly Ball Basics', drillIds: ['f-001', 'f-004'], focusAreas: ['Drop Step', 'Tracking', 'Communication'], weeksTypical: 3 },
    { phase: 'Phase 2: Routes & Crow Hop', drillIds: ['f-003', 'f-002'], focusAreas: ['Route Efficiency', 'Crow Hop Throws', 'Relay Accuracy'], weeksTypical: 3 },
    { phase: 'Phase 3: Game Situations', drillIds: ['f-005', 'f-006'], focusAreas: ['Fence Play', 'Diving Catches', 'Cutoff Decisions'], weeksTypical: 3 },
  ],
  assessmentAreas: [
    { id: 'of-first-step', name: 'First Step', maxScore: 10, drillMappings: ['f-004'] },
    { id: 'of-routes', name: 'Routes & Tracking', maxScore: 10, drillMappings: ['f-002'] },
    { id: 'of-arm', name: 'Arm Strength & Accuracy', maxScore: 10, drillMappings: ['f-003'] },
    { id: 'of-communication', name: 'Communication', maxScore: 10, drillMappings: ['f-005'] },
    { id: 'of-fence', name: 'Fence Play', maxScore: 10, drillMappings: ['f-006'] },
  ],
  intelligenceRules: [
    { id: 'sb-of-arm-low', name: 'Arm Strength Below Average', condition: 'throw_velocity < age_group_avg', action: 'assign_drill: f-003; recommend_program: prog-defense' },
  ],
};

// ─── HITTER ONLY ─────────────────────────────────────────────────────

const hitterTrack: PositionTrack = {
  id: 'hitter',
  name: 'Hitter Only',
  abbreviation: 'H',
  icon: 'Zap',
  color: '#f97316',
  description: 'All batting types: power, contact, slap, and combo. Auto-selects hitting style based on position/format.',
  categories: ['Hitting', 'Base Running', 'Strength & Conditioning', 'Mental Performance'],
  skillPathway: [
    {
      level: 'beginner', label: 'Foundation', description: 'Stance, load, stride, and contact fundamentals.',
      skills: ['Stance & Setup', 'Load Timing', 'Stride Mechanics', 'Contact Zone', 'Bat Path', 'Follow-Through'],
      typicalAgeRange: '8U–10U',
    },
    {
      level: 'intermediate', label: 'Contact Mastery', description: 'Barrel control, timing adjustments, and directional hitting.',
      skills: ['Barrel Control', 'Timing Adjustments', 'Opposite Field', 'Pull Hitting', 'Pitch Recognition', 'Two-Strike Approach'],
      typicalAgeRange: '12U–14U',
    },
    {
      level: 'advanced', label: 'Impact Hitter', description: 'Power development, slap mastery, and advanced at-bat strategies.',
      skills: ['Exit Velocity Training', 'Bat Speed Development', 'Slap Hitting', 'Power Slap', 'Drag Bunt', 'Count Leverage'],
      typicalAgeRange: '16U–18U',
    },
    {
      level: 'elite', label: 'College Ready', description: 'Elite bat speed, consistent hard contact, and game-plan execution.',
      skills: ['Elite Bat Speed', 'Barrel Precision', 'Advanced Pitch Recognition', 'At-Bat Quality', 'Recruiting Showcase'],
      typicalAgeRange: 'College',
    },
  ],
  kpiBenchmarks: [
    {
      kpiName: 'exit_velocity', unit: 'mph', category: 'hitting',
      benchmarks: {
        '10U': { low: 32, avg: 40, good: 48, elite: 55 },
        '12U': { low: 38, avg: 46, good: 54, elite: 62 },
        '14U': { low: 44, avg: 52, good: 60, elite: 68 },
        '16U': { low: 50, avg: 58, good: 66, elite: 74 },
        '18U': { low: 55, avg: 63, good: 70, elite: 78 },
        'College': { low: 60, avg: 68, good: 75, elite: 82 },
      },
    },
    {
      kpiName: 'bat_speed', unit: 'mph', category: 'hitting',
      benchmarks: {
        '10U': { low: 30, avg: 38, good: 44, elite: 50 },
        '12U': { low: 36, avg: 44, good: 50, elite: 56 },
        '14U': { low: 42, avg: 50, good: 56, elite: 62 },
        '16U': { low: 48, avg: 55, good: 62, elite: 68 },
        '18U': { low: 52, avg: 60, good: 66, elite: 72 },
        'College': { low: 56, avg: 64, good: 70, elite: 76 },
      },
    },
    {
      kpiName: 'home_to_first', unit: 'sec', category: 'speed', lowerIsBetter: true,
      benchmarks: {
        '10U': { low: 4.0, avg: 3.6, good: 3.2, elite: 2.9 },
        '12U': { low: 3.6, avg: 3.3, good: 3.0, elite: 2.7 },
        '14U': { low: 3.3, avg: 3.0, good: 2.8, elite: 2.6 },
        '16U': { low: 3.1, avg: 2.8, good: 2.6, elite: 2.5 },
        '18U': { low: 2.9, avg: 2.7, good: 2.5, elite: 2.4 },
        'College': { low: 2.8, avg: 2.6, good: 2.5, elite: 2.3 },
      },
    },
  ],
  drillProgressions: [
    { phase: 'Phase 1: Swing Foundation', drillIds: ['h-001', 'h-003'], focusAreas: ['Mechanics', 'Contact', 'Rhythm'], weeksTypical: 3 },
    { phase: 'Phase 2: Bat Speed & Power', drillIds: ['h-002', 'h-004', 'h-006'], focusAreas: ['Bat Speed', 'Exit Velocity', 'Intent'], weeksTypical: 3 },
    { phase: 'Phase 3: Barrel Control', drillIds: ['h-005', 'h-001'], focusAreas: ['Direction', 'Accuracy', 'Consistency'], weeksTypical: 3 },
    { phase: 'Phase 4: Slap & Situational', drillIds: ['h-007', 'h-008'], focusAreas: ['Slap Types', 'Rise Ball Timing', 'Game Situations'], weeksTypical: 3 },
  ],
  assessmentAreas: [
    { id: 'hit-mechanics', name: 'Swing Mechanics', maxScore: 10, drillMappings: ['h-001', 'h-003'] },
    { id: 'hit-batspeed', name: 'Bat Speed', maxScore: 10, drillMappings: ['h-002', 'h-004'] },
    { id: 'hit-barrel', name: 'Barrel Control', maxScore: 10, drillMappings: ['h-005', 'h-001'] },
    { id: 'hit-timing', name: 'Timing & Rhythm', maxScore: 10, drillMappings: ['h-003', 'h-008'] },
    { id: 'hit-power', name: 'Power / Exit Velocity', maxScore: 10, drillMappings: ['h-006', 'h-004'] },
    { id: 'hit-contact', name: 'Contact Consistency', maxScore: 10, drillMappings: ['h-001', 'h-005'] },
  ],
  intelligenceRules: [
    { id: 'sb-hit-batspeed-low', name: 'Bat Speed Below Threshold', condition: 'bat_speed < age_group_avg', action: 'assign_drill: h-002, h-004; recommend_program: prog-hitting' },
    { id: 'sb-hit-exitvelo-low', name: 'Exit Velocity Below Average', condition: 'exit_velocity < age_group_low', action: 'assign_drill: h-006; flag_for_review' },
  ],
};

// ─── MULTI-POSITION ──────────────────────────────────────────────────

const multiPositionTrack: PositionTrack = {
  id: 'multi-position',
  name: 'Multi-Position',
  abbreviation: 'UTIL',
  icon: 'Layers',
  color: '#6366f1',
  description: 'Combined development tracks for versatile athletes playing multiple positions. Merges assessments and drill assignments from selected positions.',
  categories: ['Hitting', 'Fielding', 'Throwing', 'Base Running', 'Defensive IQ', 'Strength & Conditioning', 'Mental Performance', 'Recruiting Readiness'],
  skillPathway: [
    {
      level: 'beginner', label: 'Foundation', description: 'Build foundational skills across hitting, fielding, and throwing.',
      skills: ['Hitting Fundamentals', 'Fielding Fundamentals', 'Throwing Mechanics', 'Base Running', 'Positional Awareness'],
      typicalAgeRange: '8U–10U',
    },
    {
      level: 'intermediate', label: 'Versatile Player', description: 'Develop competency at multiple positions while building hitting consistency.',
      skills: ['Position Rotation', 'Adaptable Footwork', 'Consistent Contact', 'Defensive Versatility', 'Communication'],
      typicalAgeRange: '12U–14U',
    },
    {
      level: 'advanced', label: 'Utility Star', description: 'Elite-level performance at 2+ positions with impact hitting.',
      skills: ['Primary Position Mastery', 'Secondary Position Proficiency', 'Impact Hitting', 'Leadership', 'Game IQ'],
      typicalAgeRange: '16U–18U',
    },
    {
      level: 'elite', label: 'College Ready', description: 'Plus versatility with showcase-ready metrics at multiple positions.',
      skills: ['Showcase Versatility', 'Position-Specific Metrics', 'Recruiting Profile', 'Mental Toughness'],
      typicalAgeRange: 'College',
    },
  ],
  kpiBenchmarks: [
    // Inherits from hitter + fielder benchmarks — uses exit_velocity, bat_speed, throw_velocity, home_to_first
    ...hitterTrack.kpiBenchmarks,
    ...infieldTrack.kpiBenchmarks.filter(b => b.kpiName !== 'throw_velocity'),
  ],
  drillProgressions: [
    { phase: 'Phase 1: All-Around Foundation', drillIds: ['h-001', 'f-001', 'b-002', 'f-003'], focusAreas: ['Hitting', 'Fielding', 'Running', 'Throwing'], weeksTypical: 4 },
    { phase: 'Phase 2: Position Specialization', drillIds: ['h-003', 'f-002', 'f-005', 'h-005'], focusAreas: ['Primary Position', 'Secondary Position', 'Hitting Consistency'], weeksTypical: 4 },
    { phase: 'Phase 3: Advanced Integration', drillIds: ['h-004', 'h-006', 'f-006', 'b-004'], focusAreas: ['Power Hitting', 'Advanced Defense', 'Game Situations'], weeksTypical: 4 },
  ],
  assessmentAreas: [
    ...hitterTrack.assessmentAreas.slice(0, 3),
    ...infieldTrack.assessmentAreas.slice(0, 3),
  ],
  intelligenceRules: [
    { id: 'sb-multi-weakest', name: 'Weakest Position Alert', condition: 'position_score_differential > 20%', action: 'flag_for_review; recommend targeted drills' },
  ],
};

// ─── DEVELOPMENT CATEGORIES ─────────────────────────────────────────

export interface DevelopmentCategory {
  id: string;
  name: string;
  description: string;
  applicablePositions: string[];
  ageRestriction?: string;
  formatRestriction?: 'fastpitch' | 'slowpitch';
}

export const developmentCategories: DevelopmentCategory[] = [
  { id: 'hitting', name: 'Hitting', description: 'Power, contact, and slap hitting — auto-selected by position/format', applicablePositions: ['pitcher', 'catcher', 'infield', 'outfield', 'hitter', 'multi-position'] },
  { id: 'fielding', name: 'Fielding', description: 'Position-specific defensive skills', applicablePositions: ['catcher', 'infield', 'outfield', 'multi-position'] },
  { id: 'throwing', name: 'Throwing', description: 'Mechanics, velocity, and accuracy', applicablePositions: ['pitcher', 'catcher', 'infield', 'outfield', 'multi-position'] },
  { id: 'base-running', name: 'Base Running', description: 'Reads, leads, stealing — fastpitch only', applicablePositions: ['infield', 'outfield', 'hitter', 'multi-position'], formatRestriction: 'fastpitch' },
  { id: 'fastpitch-pitching', name: 'Fastpitch Pitching', description: 'Windmill mechanics, arsenal, velocity, sequencing', applicablePositions: ['pitcher'] },
  { id: 'catching', name: 'Catching', description: 'Blocking, framing, pop time, game calling', applicablePositions: ['catcher'] },
  { id: 'defensive-iq', name: 'Defensive IQ', description: 'Situational awareness, communication, pre-pitch reads', applicablePositions: ['pitcher', 'catcher', 'infield', 'outfield', 'multi-position'] },
  { id: 'recruiting-readiness', name: 'Recruiting Readiness', description: 'Profile building, showcase prep, and college-ready metrics', applicablePositions: ['pitcher', 'catcher', 'infield', 'outfield', 'hitter', 'multi-position'], ageRestriction: '14U+' },
  { id: 'mental-performance', name: 'Mental Performance', description: 'Focus, composure, competitive mindset', applicablePositions: ['pitcher', 'catcher', 'infield', 'outfield', 'hitter', 'multi-position'] },
  { id: 'strength-conditioning', name: 'Strength & Conditioning', description: 'Position-appropriate strength, power, and conditioning', applicablePositions: ['pitcher', 'catcher', 'infield', 'outfield', 'hitter', 'multi-position'] },
];

// ─── FASTPITCH PITCHING SYSTEM ──────────────────────────────────────

export interface PitchingPhase {
  id: number;
  name: string;
  description: string;
  keyPoints: string[];
}

export const windmillPhases: PitchingPhase[] = [
  { id: 1, name: 'Stance & Setup', description: 'Grip, foot position on the rubber, ball position, and body alignment.', keyPoints: ['Grip pressure', 'Foot placement', 'Ball position', 'Balanced stance', 'Breathing'] },
  { id: 2, name: 'Windup', description: 'Repel → Rock → Kick sequence initiating the pitching motion.', keyPoints: ['Weight shift', 'Arm initiation', 'Hip engagement', 'Rhythm', 'Balance point'] },
  { id: 3, name: 'Top of Backswing (TOB)', description: 'Arm fully extended at the top of the circle — maximum potential energy.', keyPoints: ['Full arm extension', 'Shoulder alignment', 'Hip load', 'Eye-level focus', 'Timing'] },
  { id: 4, name: 'Stride Foot Contact (SFC)', description: 'Hip-to-shoulder sequence as stride foot lands — power transfer.', keyPoints: ['Hip-shoulder separation', 'Stride length', 'Foot direction', 'Power transfer', 'Arm acceleration'] },
  { id: 5, name: 'Release & Follow-Through', description: 'Finger pressure, wrist snap, and hip finish for velocity and movement.', keyPoints: ['Finger pressure', 'Wrist snap', 'Hip finish', 'Release point', 'Deceleration'] },
];

export interface PitchType {
  name: string;
  grips: string[];
  spinType: string;
  movement: string;
  typicalIntroAge: string;
}

export const fastpitchPitchLibrary: PitchType[] = [
  { name: 'Fastball (4-seam)', grips: ['4-seam standard'], spinType: 'Backspin', movement: 'Straight / slight rise', typicalIntroAge: '10U' },
  { name: 'Fastball (2-seam)', grips: ['2-seam standard'], spinType: 'Slight sidespin', movement: 'Run / sink', typicalIntroAge: '12U' },
  { name: 'Change-Up', grips: ['Circle change', 'Flip change', 'Stiff wrist'], spinType: 'Reduced backspin', movement: 'Down / fade', typicalIntroAge: '12U' },
  { name: 'Drop Ball', grips: ['Peel drop', 'Turnover drop'], spinType: 'Topspin', movement: 'Sharp downward break', typicalIntroAge: '12U' },
  { name: 'Rise Ball', grips: ['Bullet spin', 'Peel-up'], spinType: 'Strong backspin', movement: 'Upward hop', typicalIntroAge: '14U' },
  { name: 'Curveball', grips: ['Standard curve'], spinType: 'Lateral spin', movement: 'Sweeping lateral break', typicalIntroAge: '14U' },
  { name: 'Screwball', grips: ['Inside release'], spinType: 'Reverse lateral spin', movement: 'Arm-side break', typicalIntroAge: '16U' },
  { name: 'Drop Curve', grips: ['Combo grip'], spinType: 'Topspin + lateral', movement: 'Down and away', typicalIntroAge: '16U' },
  { name: 'Knuckleball', grips: ['Fingertip grip'], spinType: 'No spin', movement: 'Unpredictable', typicalIntroAge: '16U' },
];

export interface VelocityBenchmark {
  ageGroup: SoftballAgeGroup;
  low: number;
  high: number;
}

export const velocityBenchmarks: VelocityBenchmark[] = [
  { ageGroup: '10U', low: 35, high: 42 },
  { ageGroup: '12U', low: 40, high: 48 },
  { ageGroup: '14U', low: 45, high: 55 },
  { ageGroup: '16U', low: 52, high: 60 },
  { ageGroup: '18U', low: 58, high: 65 },
  { ageGroup: 'College', low: 62, high: 72 },
];

export interface PitchLoadRule {
  ageGroup: string;
  maxPerDay: number;
  maxPerWeek: number;
  restDayRule: string;
}

export const pitchLoadRules: PitchLoadRule[] = [
  { ageGroup: '10U–12U', maxPerDay: 50, maxPerWeek: 150, restDayRule: '1 rest day per 75 pitched' },
  { ageGroup: '14U', maxPerDay: 75, maxPerWeek: 200, restDayRule: '1 rest day per 100 pitched' },
  { ageGroup: '16U+', maxPerDay: 100, maxPerWeek: 250, restDayRule: '1 rest day per 125 pitched' },
];

export const injuryRiskFlags = [
  'Elbow bend at release',
  'Closed hip finish',
  'Hyperextended stride',
  'Short stride (< 80% of height)',
];

// ─── EXPORTS ─────────────────────────────────────────────────────────

export const softballPositionTracks: PositionTrack[] = [
  pitcherTrack,
  catcherTrack,
  infieldTrack,
  outfieldTrack,
  hitterTrack,
  multiPositionTrack,
];

export const getTrackById = (id: string): PositionTrack | undefined =>
  softballPositionTracks.find(t => t.id === id);

export const getTracksForCategory = (categoryId: string): PositionTrack[] =>
  softballPositionTracks.filter(t => t.categories.some(c => c.toLowerCase().replace(/\s+/g, '-') === categoryId));
