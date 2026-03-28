// Softball-specific course data
// This module mirrors the baseball course structure but with softball-specific content

import { CourseContent } from "@/lib/courseData";

export const softballCourseContent: Record<string, CourseContent> = {
  // ═══════════════════════════════════════════════════════════════
  // 1️⃣ SOFTBALL ORGANIZATIONAL MANUAL
  // ═══════════════════════════════════════════════════════════════
  "softball-org-manual": {
    courseId: "softball-org-manual",
    modules: [
      // SECTION 1 — THE VAULT™ SOFTBALL PHILOSOPHY
      {
        id: "som-exec",
        title: "Executive Introduction",
        description: "Why softball organizations struggle — and how VAULT™ corrects it",
        lessons: [
          { id: "som-0-1", title: "The Alignment Problem", description: "Softball orgs don't struggle from lack of effort — they struggle from misalignment and misunderstanding of the game's demands.", duration: "10 min", videoUrl: "", isFree: true },
          { id: "som-0-2", title: "What VAULT™ Softball Solves", description: "How VAULT™ aligns coaches, protects athletes, builds sustainable performance, and scales without losing identity.", duration: "12 min", videoUrl: "", isFree: true },
          { id: "som-0-3", title: "The Pitcher-Dominated Reality", description: "Softball is a high-speed, pitcher-dominated game. Your system must reflect that reality.", duration: "8 min", videoUrl: "", isFree: true },
        ],
      },
      {
        id: "som-philosophy",
        title: "Section 1: The VAULT™ Softball Philosophy",
        description: "Development must be intentional, measurable, and sustainable",
        lessons: [
          { id: "som-1-1", title: "The Core Principle", description: "Development must be intentional, measurable, and sustainable. Every decision reflects this.", duration: "10 min", videoUrl: "", isFree: true },
          { id: "som-1-2", title: "What Makes Softball Different", description: "Pitching controls outcomes more heavily, reaction windows are shorter, offensive strategy includes short game and slapping, and pitchers throw more frequently.", duration: "14 min", videoUrl: "", isFree: true },
          { id: "som-1-3", title: "Faster Decisions, Higher Repetition", description: "Softball requires faster decisions, higher repetition, greater workload management, and more emphasis on skill transfer.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 2 — THE VAULT™ 5 PILLARS (SOFTBALL APPLICATION)
      {
        id: "som-pillars",
        title: "Section 2: The VAULT™ 5 Pillars — Softball Application",
        description: "The language of your organization: Velocity, Athleticism, Utility, Longevity, Transfer",
        lessons: [
          { id: "som-2-1", title: "Velocity Pillar", description: "Exit velocity (hitting), pitch velocity + spin (pitching), and throwing efficiency.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "som-2-2", title: "Athleticism Pillar", description: "Speed, first-step reaction, agility and deceleration.", duration: "10 min", videoUrl: "", isFree: false },
          { id: "som-2-3", title: "Utility Pillar", description: "Multi-position development, role adaptability, and defensive versatility.", duration: "10 min", videoUrl: "", isFree: false },
          { id: "som-2-4", title: "Longevity Pillar (CRITICAL)", description: "Pitch workload management, arm care systems, and recovery compliance — the most important pillar in softball.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "som-2-5", title: "Transfer Pillar", description: "Decision-making speed, game IQ, and pressure execution.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 3 — ORGANIZATIONAL STRUCTURE
      {
        id: "som-org-structure",
        title: "Section 3: Organizational Structure",
        description: "Roles, responsibilities, and non-negotiable rules",
        lessons: [
          { id: "som-3-1", title: "Ownership & Leadership", description: "Adopt VAULT™ as standard, enforce long-term development, protect athletes over outcomes.", duration: "10 min", videoUrl: "", isFree: false },
          { id: "som-3-2", title: "Director of Softball Development", description: "Manage pitcher workload across all teams, ensure system alignment, monitor KPIs and injury risk, oversee certifications.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "som-3-3", title: "Coach Responsibilities", description: "Execute VAULT™ daily, track workload and performance, follow system rules. NON-NEGOTIABLE: No coach overrides pitcher workload rules.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 4 — DEVELOPMENT PATHWAYS
      {
        id: "som-pathways",
        title: "Section 4: Development Pathways",
        description: "Youth → Academy → Elite progression with age-appropriate focus",
        lessons: [
          { id: "som-4-1", title: "Youth Pathway (Ages 8–12)", description: "Movement quality, basic mechanics, FUN + confidence. No heavy pitching volume, no specialization pressure.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "som-4-2", title: "Academy Pathway (Ages 13–17)", description: "Pitching mechanics, strength & power, skill refinement. Monitor pitcher usage closely, introduce structured workloads.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "som-4-3", title: "Elite Pathway (18+)", description: "Performance optimization, role clarity, recovery dominance. Elite softball is about availability + execution.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 5 — PITCHER-CENTRIC MODEL
      {
        id: "som-pitcher-model",
        title: "Section 5: Pitcher-Centric Model",
        description: "Softball organizations must be built around pitching — the core difference",
        lessons: [
          { id: "som-5-1", title: "Why Pitching Controls Everything", description: "Pitchers control pace, outcomes, and face the highest injury risk. Your org must reflect this.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "som-5-2", title: "Pitching Management Rules", description: "No consecutive high-intent days. Pitch count ≠ workload — track ALL throws. Tournament play must be monitored.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "som-5-3", title: "Organizational Pitching Requirements", description: "Every team must log pitching workload, follow VAULT™ Arm Health system, and report recovery status.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 6 — OFFENSIVE PHILOSOPHY
      {
        id: "som-offense",
        title: "Section 6: Offensive Philosophy",
        description: "Speed-driven, pressure-driven, situational. The goal is pressure and advancement.",
        lessons: [
          { id: "som-6-1", title: "Softball Offensive Identity", description: "Softball offense is speed-driven, pressure-driven, and situational. The goal is not hits — the goal is pressure and advancement.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "som-6-2", title: "Core Offensive Components", description: "Power hitting, slap hitting, bunting system, and situational execution working together.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 7 — DEFENSIVE PHILOSOPHY
      {
        id: "som-defense",
        title: "Section 7: Defensive Philosophy",
        description: "Fast, efficient, reliable defense with softball-specific adjustments",
        lessons: [
          { id: "som-7-1", title: "Infield Defensive Principles", description: "Quick release, decision speed, and accuracy. Softball infielders face shorter reaction windows.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "som-7-2", title: "Outfield Defensive Principles", description: "First-step reads, route efficiency, and throw alignment for softball outfielders.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 8 — STRENGTH & CONDITIONING
      {
        id: "som-strength",
        title: "Section 8: Strength & Conditioning",
        description: "Strength must enhance performance, not fatigue athletes",
        lessons: [
          { id: "som-8-1", title: "Strength for Softball", description: "Lower body force, rotational power, deceleration, and core stability — what matters for softball athletes.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "som-8-2", title: "The Performance Rule", description: "Strength must enhance performance, not fatigue athletes. Programming with purpose.", duration: "10 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 9 — ARM HEALTH & WORKLOAD
      {
        id: "som-armhealth",
        title: "Section 9: Arm Health & Workload System",
        description: "NON-NEGOTIABLE: If recovery declines → workload decreases",
        lessons: [
          { id: "som-9-1", title: "Required Tracking Standards", description: "Throw volume, intent level, and recovery compliance — every throw counts.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "som-9-2", title: "Red Flags & Response Protocol", description: "Loss of command, soreness, decreased velocity, fatigue patterns — how to identify and respond.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "som-9-3", title: "The Recovery Rule", description: "If recovery declines → workload decreases. No exceptions, no overrides.", duration: "10 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 10 — KPIs
      {
        id: "som-kpis",
        title: "Section 10: KPIs — Organizational Health",
        description: "Availability %, workload compliance, velocity stability, decision-making, injury incidence",
        lessons: [
          { id: "som-10-1", title: "Primary Softball KPIs", description: "Availability %, pitcher workload compliance, velocity stability, decision-making success, and injury incidence.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "som-10-2", title: "Tracking & Reporting Standards", description: "How to measure, track, and report organizational health metrics consistently.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 11 — COACH ALIGNMENT & CERTIFICATION
      {
        id: "som-certification",
        title: "Section 11: Coach Alignment & Certification",
        description: "Expired certification = restricted access. Non-compliance = removal.",
        lessons: [
          { id: "som-11-1", title: "Certification Requirements", description: "All coaches must complete VAULT™ Certification — Foundations, Performance, and position-specific levels.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "som-11-2", title: "Enforcement & Accountability", description: "Expired certification = restricted access. Non-compliance = removal from system. No exceptions.", duration: "10 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 12 — PARENT COMMUNICATION
      {
        id: "som-parents",
        title: "Section 12: Parent Communication",
        description: "Clear communication reduces conflict",
        lessons: [
          { id: "som-12-1", title: "Parent Education Framework", description: "Parents must understand: long-term development > short-term wins. Pitcher protection is critical. Workload rules are enforced.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "som-12-2", title: "Communication Systems", description: "Clear, consistent communication protocols that reduce conflict and build trust.", duration: "10 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 13 — SCALABILITY & GROWTH
      {
        id: "som-scale",
        title: "Section 13: Scalability & Growth",
        description: "Growth without systems creates failure. VAULT™ ensures controlled growth.",
        lessons: [
          { id: "som-13-1", title: "Multi-Team & Multi-Location Alignment", description: "VAULT™ allows multi-team alignment, multi-location growth, and consistent standards across your organization.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "som-13-2", title: "Controlled Growth Model", description: "Growth without systems creates failure. VAULT™ ensures controlled, sustainable growth.", duration: "10 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 14 — DECISION-MAKING MODEL + FINAL STATEMENT
      {
        id: "som-decisions",
        title: "Section 14: Decision-Making Model",
        description: "Every decision must align with the 5 pillars, protect athlete health, and maintain system integrity",
        lessons: [
          { id: "som-14-1", title: "The 3-Question Decision Filter", description: "Does it align with the 5 pillars? Does it protect long-term athlete health? Does it maintain system integrity? If not → it is rejected.", duration: "10 min", videoUrl: "", isFree: false },
          { id: "som-14-2", title: "Building Elite Softball Organizations", description: "Elite softball organizations are built on structure, discipline, and protection of athletes. VAULT™ delivers alignment, accountability, and sustainability.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 2️⃣ VAULT™ ELITE SOFTBALL HITTING SYSTEM
  //    Power, timing, adjustability, and game transfer
  // ═══════════════════════════════════════════════════════════════
  "softball-hitting-complete": {
    courseId: "softball-hitting-complete",
    modules: [
      // EXECUTIVE PHILOSOPHY
      {
        id: "shc-exec",
        title: "Executive Philosophy",
        description: "Elite softball hitting is built on timing control, efficient sequencing, barrel accuracy, and game transfer",
        lessons: [
          { id: "shc-0-1", title: "The VAULT™ Hitting Philosophy", description: "VAULT hitting does not chase pretty swings. It builds swings that are on time, repeatable, and dangerous.", duration: "10 min", videoUrl: "", isFree: true },
          { id: "shc-0-2", title: "NFCA-Aligned Foundations", description: "Timing, sequencing, contact-point consistency, and target-based intent — the research-backed approach to elite hitting.", duration: "12 min", videoUrl: "", isFree: true },
          { id: "shc-0-3", title: "The Individualized Swing", description: "The softball swing is a coordinated 3D motion with consistent core patterns but meaningful hitter-to-hitter variation.", duration: "10 min", videoUrl: "", isFree: true },
        ],
      },
      // SECTION 1 — VAULT HITTING MODEL (5 PILLARS)
      {
        id: "shc-model",
        title: "Section 1: The VAULT™ Hitting Model",
        description: "Five hitting pillars: Posture & Balance, Timing & Rhythm, Sequencing, Bat Speed & Adjustability, Approach & Transfer",
        lessons: [
          { id: "shc-1-1", title: "Pillar 1: Posture and Balance", description: "The hitter must own stable posture and a repeatable launch environment before any power work matters.", duration: "12 min", videoUrl: "", isFree: true },
          { id: "shc-1-2", title: "Pillar 2: Timing and Rhythm", description: "A hitter can own good mechanics and still fail if timing breaks down. Timing is a major driver of quality contact.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "shc-1-3", title: "Pillar 3: Sequencing", description: "Hips → core → shoulders → hands/barrel. The proximal-to-distal energy transfer sequence.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "shc-1-4", title: "Pillar 4: Bat Speed and Adjustability", description: "Bat speed matters, but only if it is connected to barrel control and decision-making.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "shc-1-5", title: "Pillar 5: Approach and Transfer", description: "The swing must survive different speeds, locations, counts, and game plans.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 2 — MECHANICS SYSTEM
      {
        id: "shc-mechanics",
        title: "Section 2: Mechanics System",
        description: "Stance, load, foot-down timing, sequencing, contact, and finish — the complete mechanical framework",
        lessons: [
          { id: "shc-2-1", title: "2.1 Stance and Setup", description: "Athletic base, quiet head, tension-free upper body, stacked spine, hands in launchable position, eyes level and calm.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "shc-2-2", title: "2.2 Load and Gather", description: "The load is a timing tool, not decoration. Create rhythm, collect force, preserve adjustability. Avoid drifting forward, over-coiling, or collapsing posture.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "shc-2-3", title: "2.3 Foot Down and Launch Timing", description: "Land under control, be on time to different pitch speeds, keep adjustability late. Variable-pace drill approach.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "shc-2-4", title: "2.4 Sequencing and Turn", description: "Hips initiate, torso follows, shoulders and hands deliver, barrel enters efficiently. Coordinated proximal-to-distal energy transfer.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "shc-2-5", title: "2.5 Contact and Direction", description: "Own contact point, match barrel path to pitch location, produce intended ball flight. NFCA 'Road Map' concept for ideal contact spot.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "shc-2-6", title: "2.6 Finish and Balance", description: "The finish is feedback — did the hitter stay through the ball? Did posture hold? Did the move stay athletic?", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 3 — ADVANCED HITTING CATEGORIES
      {
        id: "shc-tracks",
        title: "Section 3: Advanced Hitting Categories",
        description: "Power hitter track, contact/adjustability track, and hybrid track development",
        lessons: [
          { id: "shc-3-1", title: "A. Power Hitter Track", description: "Middle-order bats with strong rotational athletes. Emphasis: bat speed, rotational force, gap-to-gap damage, miss-hit management.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "shc-3-2", title: "B. Contact/Adjustability Track", description: "Top/middle lineup with high-contact athletes. Emphasis: timing windows, barrel accuracy, two-strike adjustability, opposite-field discipline.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "shc-3-3", title: "C. Hybrid Track", description: "Most advanced HS/college hitters. Emphasis: bat speed plus strike-zone control, targeted contact outcomes, count-based intent.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 4 — DRILL PROGRESSION MODEL
      {
        id: "shc-drills",
        title: "Section 4: Drill Progression Model",
        description: "4-phase progression: Patterning → Controlled Contact → Decision Training → Transfer",
        lessons: [
          { id: "shc-4-1", title: "Phase 1: Patterning", description: "Mirror work, PVC/short-bat sequencing, posture and load holds, dry swing timing reps.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "shc-4-2", title: "Phase 2: Controlled Contact", description: "Tee work by contact zone, front toss with timing variation, target hitting. NFCA target-based work for intent.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "shc-4-3", title: "Phase 3: Decision Training", description: "Fast/slow mix, inside/outside recognition, take/attack rounds, count-based rounds.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "shc-4-4", title: "Phase 4: Transfer", description: "Live BP, machine variance, game-speed situational rounds, pressure scoring.", duration: "18 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 5 — ELITE WEEKLY STRUCTURE
      {
        id: "shc-weekly",
        title: "Section 5: Elite Weekly Structure",
        description: "Off-season, preseason, and in-season programming for hitters",
        lessons: [
          { id: "shc-5-1", title: "Off-Season Structure", description: "3–4 exposures/week: 1 mechanics-heavy day, 1 sequencing/bat-speed day, 1 approach/decision day, 1 optional transfer day.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "shc-5-2", title: "Preseason Structure", description: "Reduce mechanical volume, increase timing and velocity exposure, more machine/live reps.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "shc-5-3", title: "In-Season Structure", description: "Maintain timing, preserve confidence, reduce total swing volume, emphasize game plan and adjustability.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 6 — HITTING KPIs
      {
        id: "shc-kpis",
        title: "Section 6: Hitting KPIs",
        description: "Primary and secondary KPIs for tracking hitting development",
        lessons: [
          { id: "shc-6-1", title: "Primary Hitting KPIs", description: "Hard contact %, quality swing decision %, on-time contact rate, exit velocity trend, line-drive rate, two-strike contact %, competitive round score.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "shc-6-2", title: "Secondary Hitting KPIs", description: "Contact-point consistency, chase rate in training, opposite-field execution, count-specific outcome rate.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "shc-6-3", title: "Using KPIs to Drive Development", description: "How to interpret KPI trends and adjust training programs based on data.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 2.5️⃣ VAULT™ ELITE SOFTBALL SLAP SYSTEM
  //    Speed, pressure, precision, and chaos creation
  // ═══════════════════════════════════════════════════════════════
  "softball-slap-system": {
    courseId: "softball-slap-system",
    modules: [
      // EXECUTIVE PHILOSOPHY
      {
        id: "sls-exec",
        title: "Executive Philosophy",
        description: "A great slapper is a triple threat: bunt, soft slap, power slap. Slapping is an offensive system.",
        lessons: [
          { id: "sls-0-1", title: "The Triple Threat Slapper", description: "A great slapper is not just fast. A great slapper can bunt, soft slap, and power slap — forcing the defense to defend all four weapons.", duration: "10 min", videoUrl: "", isFree: true },
          { id: "sls-0-2", title: "NFCA Slapping Framework", description: "NFCA's slapping instruction emphasizes target-based soft-slap and hard-slap work. USA Softball's rulebook defines legal slap actions.", duration: "12 min", videoUrl: "", isFree: true },
          { id: "sls-0-3", title: "Slapping as an Offensive System", description: "Slapping is not a trick. It is built on timing, footwork, placement, and pressure.", duration: "10 min", videoUrl: "", isFree: true },
        ],
      },
      // SECTION 1 — THE VAULT SLAP MODEL
      {
        id: "sls-model",
        title: "Section 1: The VAULT™ Slap Model",
        description: "The four offensive weapons: Bunt, Soft Slap, Hard Slap, Power Slash",
        lessons: [
          { id: "sls-1-1", title: "The Four Offensive Weapons", description: "Bunt, soft slap, hard slap, and power slash/full swing option. The slapper must force the defense to defend all four.", duration: "14 min", videoUrl: "", isFree: true },
          { id: "sls-1-2", title: "When Each Weapon Wins", description: "Understanding when to deploy each option based on defensive alignment, count, and game situation.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 2 — CORE SLAP MECHANICS
      {
        id: "sls-mechanics",
        title: "Section 2: Core Slap Mechanics",
        description: "Stance, preparatory step, footwork, barrel path, contact, and run-through",
        lessons: [
          { id: "sls-2-1", title: "2.1 Stance and Identity", description: "Setup that allows disguise, rhythm, movement into the box, and adjustability.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "sls-2-2", title: "2.2 Preparatory Step", description: "Create rhythm into movement, organize footwork early, establish timing to contact, preserve direction to first base.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "sls-2-3", title: "2.3 Footwork Pattern", description: "Efficient crossover/run start, stable visual control, body under control at contact, no wasted steps.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "sls-2-4", title: "2.4 Barrel Path", description: "Inside path, controlled top hand direction, ability to deaden or accelerate barrel intentionally. Working the knob to the inside of the ball.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "sls-2-5", title: "2.5 Contact Point", description: "Control where contact happens, how the body is moving at contact, and what type of ball is intended.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "sls-2-6", title: "2.6 Run-Through & First-Step Acceleration", description: "Accelerate through the box, recover posture immediately, force rushed defensive decisions. Speed pressure completes the slap.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 3 — THE THREE CORE SLAP TYPES
      {
        id: "sls-types",
        title: "Section 3: The Three Core Slap Types",
        description: "Soft slap, hard slap, and bunt/slash — mastering each weapon",
        lessons: [
          { id: "sls-3-1", title: "A. Soft Slap", description: "Beat the infield with placement and speed. Create topspin/one-hop pressure. Exploit corner or middle infield depth. Left side dribble, one-hop through 5–6 hole.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "sls-3-2", title: "B. Hard Slap", description: "Create firmer ground ball or low liner through windows. Punish defenses overplaying soft contact. NFCA hard-slap target work for line drives and backspin outcomes.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "sls-3-3", title: "C. Bunt/Slash", description: "Keep defenses honest, exploit over-shifts, create free bases. The bunt/slash as strategic weapon.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 4 — SLAPPER DEVELOPMENT STAGES
      {
        id: "sls-stages",
        title: "Section 4: Slapper Development Stages",
        description: "Foundation → Development → Elite progression",
        lessons: [
          { id: "sls-4-1", title: "Foundation Stage", description: "Rhythm, movement into the box, visual control, and footwork mastery.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "sls-4-2", title: "Development Stage", description: "Soft slap placement, bunt/slap choice, and timing against speed variation.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "sls-4-3", title: "Elite Stage", description: "Full triple-threat ownership, hard-slap command, count-based decision making, and defensive read exploitation.", duration: "16 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 5 — ELITE SLAP DRILL STACK
      {
        id: "sls-drills",
        title: "Section 5: Elite Slap Drill Stack",
        description: "Footwork, barrel pattern, target work, triple-threat, and read-and-react progressions",
        lessons: [
          { id: "sls-5-1", title: "1. Footwork Progression", description: "Walk-throughs, crossover timing, controlled run-through starts, stride pattern consistency.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "sls-5-2", title: "2. Barrel Pattern Progression", description: "Short-contact slaps, inside-ball path reps, soft-hand topspin work, hard-slap intent rounds.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "sls-5-3", title: "3. Target Work", description: "3B line dribble, 5–6 hole one-hop, middle-topspin pressure ball, outfield low liner. Target-based training sharpens intent.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "sls-5-4", title: "4. Triple-Threat Progression", description: "Bunt round, soft slap round, hard slap round, random cue round.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "sls-5-5", title: "5. Read-and-React Progression", description: "Corner in/back, middle pinched/normal, slap call by count, coach-held visual cue.", duration: "16 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 6 — WEEKLY ELITE SLAP STRUCTURE
      {
        id: "sls-weekly",
        title: "Section 6: Weekly Elite Slap Structure",
        description: "Off-season, preseason, and in-season programming for slappers",
        lessons: [
          { id: "sls-6-1", title: "Off-Season Structure", description: "3 skill exposures/week: 1 footwork day, 1 barrel/target day, 1 decision + pressure day.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "sls-6-2", title: "Preseason Structure", description: "Increase speed-of-play, randomize defensive looks, increase live reads.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "sls-6-3", title: "In-Season Structure", description: "Maintain timing and target ownership, reduce total volume, emphasize game planning.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 7 — SLAP KPIs
      {
        id: "sls-kpis",
        title: "Section 7: Slap KPIs",
        description: "Primary and secondary KPIs for tracking slap development",
        lessons: [
          { id: "sls-7-1", title: "Primary Slap KPIs", description: "Bunt success %, soft slap target hit %, hard slap target hit %, first-base time, on-base pressure rate, triple-threat execution score.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "sls-7-2", title: "Secondary Slap KPIs", description: "Contact-point consistency, topspin ground-ball %, defensive-read correct choice %, run-through efficiency.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 8 — GAME APPLICATION RULES
      {
        id: "sls-game",
        title: "Section 8: Game Application Rules",
        description: "When to soft slap, hard slap, bunt, or full swing — situational decision-making",
        lessons: [
          { id: "sls-8-1", title: "When to Soft Slap", description: "Corners deep/hesitant, left-side defender slow to charge, runner-pressure situations.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "sls-8-2", title: "When to Hard Slap", description: "Gap available, defense cheating soft, need to push ball through infield with pace.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "sls-8-3", title: "When to Bunt", description: "Corners back, free base opportunity, force rushed exchange.", duration: "10 min", videoUrl: "", isFree: false },
          { id: "sls-8-4", title: "When to Full Swing/Slash", description: "Defenders overcommit to slap look, hitter owns damage count, need bigger ball than pressure ball.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 9 — COACH IMPLEMENTATION RULES
      {
        id: "sls-coach",
        title: "Section 9: Coach Implementation Rules",
        description: "What coaches may and may not do within the VAULT™ slap system",
        lessons: [
          { id: "sls-9-1", title: "Coaches May", description: "Individualize footwork pattern, adjust target maps, sequence skill progressions by athlete type.", duration: "10 min", videoUrl: "", isFree: false },
          { id: "sls-9-2", title: "Coaches May NOT", description: "Skip triple-threat development, train slap as 'just get fast', ignore visual timing and pitch decision, reduce all reps to machine-only.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 10 — HOW THIS FITS IN VAULT™
      {
        id: "sls-integration",
        title: "Section 10: VAULT™ Integration",
        description: "How the slap system maps to the 5 VAULT™ pillars",
        lessons: [
          { id: "sls-10-1", title: "Slapping Across the 5 Pillars", description: "Velocity: bat speed, hard-slap output. Athleticism: first-step explosion, run-through speed. Utility: offensive versatility. Longevity: volume management. Transfer: decision speed, target execution.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 3️⃣ VAULT™ SOFTBALL PITCHING DEVELOPMENT SYSTEM
  //    Velocity • Command • Durability • Dominance
  // ═══════════════════════════════════════════════════════════════
  "softball-pitching-elite": {
    courseId: "softball-pitching-elite",
    modules: [
      // EXECUTIVE OVERVIEW
      {
        id: "spe-exec",
        title: "Executive Overview",
        description: "Why softball is a pitcher-dominated sport and how VAULT™ builds sustainable dominance",
        lessons: [
          { id: "spe-0-1", title: "The Pitcher-Dominated Reality", description: "Pitchers throw more frequently, control tempo and outcomes, and carry the highest injury risk. The goal is sustainable dominance.", duration: "10 min", videoUrl: "", isFree: true },
          { id: "spe-0-2", title: "Why Most Systems Fail", description: "Chasing velocity without managing workload, ignoring windmill biomechanics, overusing athletes in tournaments, treating arm care as optional.", duration: "12 min", videoUrl: "", isFree: true },
          { id: "spe-0-3", title: "The VAULT™ Pitching Integration", description: "Mechanics, Workload, Strength, Recovery, and Game Transfer — all five must work together.", duration: "10 min", videoUrl: "", isFree: true },
        ],
      },
      // SECTION 1 — THE VAULT™ PITCHING MODEL
      {
        id: "spe-model",
        title: "Section 1: The VAULT™ Pitching Model",
        description: "The 4 pillars of pitching performance: Mechanics, Velocity, Command & Spin, Workload & Recovery",
        lessons: [
          { id: "spe-1-1", title: "4 Pillars of Pitching Performance", description: "Mechanics, Velocity Development, Command & Spin, and Workload & Recovery — all four must progress together.", duration: "14 min", videoUrl: "", isFree: true },
          { id: "spe-1-2", title: "Integrated Development Philosophy", description: "Why isolating one pillar creates imbalance and how VAULT™ ensures synchronized progress.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 2 — BIOMECHANICS OF THE WINDMILL PITCH
      {
        id: "spe-biomechanics",
        title: "Section 2: Biomechanics of the Windmill Pitch",
        description: "The windmill pitch is a full-body explosive movement, not an arm action",
        lessons: [
          { id: "spe-2-1", title: "Phase 1: Wind-Up", description: "Controlled start and rhythm initiation. Establishing the tempo for the entire pitch.", duration: "14 min", videoUrl: "", isFree: true },
          { id: "spe-2-2", title: "Phase 2: Stride", description: "Linear force production and lower-body drive. Where power begins.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "spe-2-3", title: "Phase 3: Acceleration", description: "Hip-to-shoulder separation and arm whip mechanics. The velocity zone.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "spe-2-4", title: "Phase 4: Follow-Through", description: "Deceleration and energy dissipation. Protecting the arm through proper finish.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "spe-2-5", title: "The Ground-Up Principle", description: "Power starts from the ground — not the arm. Understanding the kinetic chain of the windmill.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 3 — MECHANICS SYSTEM (VAULT™ STANDARD)
      {
        id: "spe-mechanics",
        title: "Section 3: Mechanics System — VAULT™ Standard",
        description: "Lower body engine, hip rotation, arm path, release & finish",
        lessons: [
          { id: "spe-3-1", title: "Lower Body Engine", description: "Drive off back leg, strong stride direction, and stable landing position.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "spe-3-2", title: "Hip Rotation", description: "Early hip engagement and separation from upper body for maximum force transfer.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "spe-3-3", title: "Arm Path — Windmill Efficiency", description: "Smooth circular path with no forced acceleration. Natural whip for velocity.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "spe-3-4", title: "Release & Finish", description: "Consistent release point, controlled follow-through, and deceleration awareness.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "spe-3-5", title: "The Non-Negotiable Rule", description: "Mechanics must NEVER be sacrificed for velocity. This is the foundation of VAULT™ pitching.", duration: "10 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 4 — VELOCITY DEVELOPMENT SYSTEM
      {
        id: "spe-velocity",
        title: "Section 4: Velocity Development System",
        description: "Ground force, hip speed, sequencing, and arm speed — the velocity drivers",
        lessons: [
          { id: "spe-4-1", title: "Velocity Drivers", description: "Lower body strength, rotational speed, elastic energy, and timing — the four sources of velocity.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "spe-4-2", title: "Lower Body Strength for Velocity", description: "Force production from the legs that translates directly to pitch speed.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "spe-4-3", title: "Rotational Speed & Elastic Energy", description: "Hip speed and stretch-shortening cycle for explosive acceleration.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "spe-4-4", title: "Weekly Velocity Structure", description: "1–2 high-intent days with controlled progression and enforced recovery. No consecutive high-intent days.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "spe-4-5", title: "Velocity Assessment & Goal Setting", description: "Establishing current baseline and setting realistic velocity progression targets.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 5 — SPIN & COMMAND SYSTEM
      {
        id: "spe-spin-command",
        title: "Section 5: Spin & Command System",
        description: "Movement, location, deception — movement without command = ineffective",
        lessons: [
          { id: "spe-5-1", title: "Rise Ball Mechanics & Spin", description: "Steep backspin with proper wrist position and release angle for upward movement.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "spe-5-2", title: "Drop Ball Development", description: "Topspin mechanics — the most reliable out pitch in windmill pitching.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "spe-5-3", title: "Curveball & Screwball", description: "Lateral spin pitches for expanding the arsenal and creating deception.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "spe-5-4", title: "Change-Up Deception", description: "Arm speed deception with reduced velocity for timing disruption.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "spe-5-5", title: "Command Training: Target-Based", description: "Target-based throwing, zone control, and repeatable release for consistent location.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "spe-5-6", title: "Spin Development: Grip & Wrist", description: "Grip efficiency, wrist action, and finger pressure for maximum spin rate.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 6 — WORKLOAD MANAGEMENT SYSTEM (CRITICAL)
      {
        id: "spe-workload",
        title: "Section 6: Workload Management System",
        description: "CRITICAL — this is where most programs fail. Track everything, enforce recovery.",
        lessons: [
          { id: "spe-6-1", title: "What Must Be Tracked", description: "Game pitches, bullpen throws, warm-up throws, practice throws — ALL throwing counts.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "spe-6-2", title: "Workload Variables", description: "Volume, intent, and frequency — the three variables that determine arm stress.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "spe-6-3", title: "Tournament Workload Rules", description: "Limit total innings, enforce recovery windows, and monitor fatigue in multi-game weekends.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "spe-6-4", title: "The Non-Negotiable Recovery Rule", description: "If recovery declines → workload decreases. No exceptions. This rule protects careers.", duration: "10 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 7 — ARM HEALTH & DURABILITY SYSTEM
      {
        id: "spe-arm-health",
        title: "Section 7: Arm Health & Durability System",
        description: "Softball pitchers throw more frequently and experience high shoulder stress",
        lessons: [
          { id: "spe-7-1", title: "Daily Requirements", description: "Mobility, activation, and recovery protocols that must be completed every day.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "spe-7-2", title: "Weekly Requirements", description: "Strength training, deceleration work, and structured recovery protocols.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "spe-7-3", title: "Red Flags & Warning Signs", description: "Soreness, velocity drop, and command loss — recognizing problems before injury occurs.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "spe-7-4", title: "Pitcher–Position Overlap", description: "Managing workload when pitchers also play other positions between appearances.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 8 — STRENGTH & POWER FOR PITCHERS
      {
        id: "spe-strength",
        title: "Section 8: Strength & Power for Pitchers",
        description: "Lower-body force, core stability, rotational power, deceleration — strength protects the arm",
        lessons: [
          { id: "spe-8-1", title: "Lower-Body Force Production", description: "Split squats, single-leg work, and posterior chain development for ground force.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "spe-8-2", title: "Core Stability & Anti-Rotation", description: "Core stability exercises and anti-rotation work for trunk control through the windmill.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "spe-8-3", title: "Rotational Power Development", description: "Med ball throws and rotational exercises that transfer directly to pitching.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "spe-8-4", title: "Eccentric Loading & Deceleration", description: "Eccentric exercises to train the body to decelerate safely after release.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 9 — WEEKLY STRUCTURE (PITCHERS)
      {
        id: "spe-weekly",
        title: "Section 9: Weekly Structure for Pitchers",
        description: "Off-season, pre-season, and in-season programming for windmill pitchers",
        lessons: [
          { id: "spe-9-1", title: "Off-Season Structure", description: "3–4 throwing sessions, 2 high-intent days, strength priority. Building the foundation.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "spe-9-2", title: "Pre-Season Structure", description: "Increase intent, add live reps, reduce strength volume. Preparing for competition.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "spe-9-3", title: "In-Season Structure", description: "Maintain velocity, reduce volume, maximize recovery. Availability is the priority.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "spe-9-4", title: "Periodization for Pitchers", description: "Long-term planning across the annual calendar for peak performance.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 10 — KPIs (PITCHERS)
      {
        id: "spe-kpis",
        title: "Section 10: KPIs for Pitchers",
        description: "Velocity, Command %, Spin Efficiency, Availability %, Workload Compliance",
        lessons: [
          { id: "spe-10-1", title: "Primary KPIs", description: "Velocity (Performance), Command % (Control), Spin Efficiency (Movement), Availability % (Durability), Workload Compliance (Injury Prevention).", duration: "14 min", videoUrl: "", isFree: false },
          { id: "spe-10-2", title: "Secondary KPIs & Fatigue Markers", description: "Recovery compliance, fatigue markers, and pitch efficiency — tracking the full picture.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "spe-10-3", title: "Using KPIs for Development Decisions", description: "How to interpret KPI trends and adjust training based on data.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 11 — COACH IMPLEMENTATION RULES
      {
        id: "spe-coach-rules",
        title: "Section 11: Coach Implementation Rules",
        description: "What coaches may and may NOT do within the VAULT™ pitching system",
        lessons: [
          { id: "spe-11-1", title: "What Coaches May Do", description: "Adjust drills, modify intensity, and individualize within the system.", duration: "10 min", videoUrl: "", isFree: false },
          { id: "spe-11-2", title: "What Coaches May NOT Do", description: "Stack high-intent days, ignore workload tracking, chase velocity recklessly, or override recovery.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "spe-11-3", title: "System Compliance & Enforcement", description: "How compliance is monitored and what happens when rules are broken.", duration: "10 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 12 — MENTAL PERFORMANCE (PITCHERS)
      {
        id: "spe-mental",
        title: "Section 12: Mental Performance for Pitchers",
        description: "Confidence, emotional control, and reset ability under pressure",
        lessons: [
          { id: "spe-12-1", title: "Pitch-by-Pitch Reset", description: "The ability to release the previous pitch and focus entirely on the next one.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "spe-12-2", title: "Competitive Mindset", description: "Building the aggressive but controlled mentality of a dominant pitcher.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "spe-12-3", title: "Pressure Management", description: "Performing under high-pressure situations — full count, runners in scoring position, big games.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 13 — GAME TRANSFER
      {
        id: "spe-game-transfer",
        title: "Section 13: Game Transfer",
        description: "Pitching success = execution under pressure. Replicate game conditions in training.",
        lessons: [
          { id: "spe-13-1", title: "Live Hitter Sessions", description: "Facing live batters in practice to bridge the gap between bullpen and game.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "spe-13-2", title: "Situational Pitching", description: "Runner on third, two outs — training specific game scenarios with intent.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "spe-13-3", title: "Count-Based Decision Making", description: "Pitch selection and approach based on count, hitter tendencies, and game context.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "spe-13-4", title: "The VAULT™ Standard: Consistent Dominance", description: "The best pitchers don't just throw hard — they dominate consistently. Durable arms, elite velocity, command under pressure, long-term success.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 4️⃣ SOFTBALL DEFENSIVE SYSTEM
  // ═══════════════════════════════════════════════════════════════
  "softball-defense-complete": {
    courseId: "softball-defense-complete",
    modules: [
      {
        id: "sdc-infield",
        title: "Infield Play (Softball Adjustments)",
        description: "Faster reaction windows, shorter arm paths, more quick-release throws",
        lessons: [
          { id: "sdc-1-1", title: "Ready Position & Anticipation", description: "Athletic ready position adapted for shorter softball reaction windows.", duration: "12 min", videoUrl: "", isFree: true },
          { id: "sdc-1-2", title: "Short-Arm Throwing Mechanics", description: "Quick-release throws from all infield positions with accuracy.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "sdc-1-3", title: "Backhand & Forehand Plays", description: "Ranging left and right with clean transfers and accurate throws.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "sdc-1-4", title: "Double Play Turns", description: "Footwork and feeds for double plays from SS, 2B, and 3B.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "sdc-1-5", title: "Bunt Defense", description: "Reacting to bunts and slaps with aggressive defensive positioning.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "sdc-outfield",
        title: "Outfield Play",
        description: "Shorter reads, more aggressive play, faster decision-making",
        lessons: [
          { id: "sdc-2-1", title: "Ball-Off-Bat Reads", description: "First-step reactions for softball-specific fly balls and line drives.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "sdc-2-2", title: "Route Efficiency", description: "Taking efficient routes with shorter distances and faster decisions.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "sdc-2-3", title: "Aggressive Cutoff Play", description: "Strong, accurate throws to cutoff targets and relay positioning.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "sdc-catching",
        title: "Catching (Softball-Specific)",
        description: "Framing rise balls, blocking drop balls, and quick throws",
        lessons: [
          { id: "sdc-3-1", title: "Receiving & Framing Rise Balls", description: "Technique for receiving rise balls and maintaining strike calls.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "sdc-3-2", title: "Blocking Drop Balls & Low Pitches", description: "Keeping balls in front on drop curves and low-zone pitches.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "sdc-3-3", title: "Throwing to Bases", description: "Pop time, footwork, and accuracy on steal attempts.", duration: "16 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "sdc-positions",
        title: "Position-Specific Development",
        description: "Detailed work for each defensive position",
        lessons: [
          { id: "sdc-4-1", title: "Pitcher Fielding (PFP)", description: "Pitcher fielding practice — comebackers, bunts, and covering first.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "sdc-4-2", title: "First Base Play", description: "Scooping throws, footwork, and holding runners.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "sdc-4-3", title: "Third Base: The Hot Corner", description: "Reaction time, bunt coverage, and strong throws across the diamond.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "sdc-team",
        title: "Team Defense & Communication",
        description: "Coordinating defensive plays as a unit",
        lessons: [
          { id: "sdc-5-1", title: "Communication Systems", description: "Verbal and non-verbal communication protocols for the defense.", duration: "10 min", videoUrl: "", isFree: false },
          { id: "sdc-5-2", title: "Defensive Alignments & Shifts", description: "Positioning adjustments based on hitter tendencies and game situations.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 5️⃣ SOFTBALL SPEED & BASERUNNING
  // ═══════════════════════════════════════════════════════════════
  "softball-speed-baserunning": {
    courseId: "softball-speed-baserunning",
    modules: [
      {
        id: "ssb-speed",
        title: "First-Step Explosion",
        description: "Building explosive starts from batter's box and bases",
        lessons: [
          { id: "ssb-1-1", title: "First-Step Mechanics", description: "Explosive start techniques from the batter's box and the base.", duration: "14 min", videoUrl: "", isFree: true },
          { id: "ssb-1-2", title: "Acceleration Drills", description: "Building speed through the first 10-20 feet for home-to-first improvement.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "ssb-1-3", title: "Speed Training for Softball", description: "Sprint mechanics adapted for the softball field distances.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "ssb-turns",
        title: "Aggressive Turns",
        description: "Rounding bases with speed and efficiency",
        lessons: [
          { id: "ssb-2-1", title: "Rounding First Base", description: "Efficient turn mechanics for extra-base hit opportunities.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "ssb-2-2", title: "Second-to-Third Aggression", description: "Reading outfielders and making aggressive decisions on the basepaths.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "ssb-sliding",
        title: "Slide Variations",
        description: "Pop-up slides, hook slides, and headfirst technique",
        lessons: [
          { id: "ssb-3-1", title: "Pop-Up Slide Technique", description: "Clean pop-up slide execution for advancing on plays at the bag.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "ssb-3-2", title: "Hook Slide & Avoidance", description: "Using the hook slide to avoid tags and reach the base.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "ssb-3-3", title: "Headfirst vs. Feet-First Decisions", description: "When to use each slide type based on the play situation.", duration: "10 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "ssb-reads",
        title: "Read-Based Baserunning",
        description: "Making smart decisions on the bases",
        lessons: [
          { id: "ssb-4-1", title: "Reading the Pitcher & Catcher", description: "Timing pitcher delivery and reading catcher intent for steals.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "ssb-4-2", title: "Tag-Up Decisions", description: "Reading fly ball depth and outfielder arm strength for tag-ups.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "ssb-4-3", title: "Wild Pitch & Passed Ball Reads", description: "Advancing on misplayed pitches with smart aggression.", duration: "10 min", videoUrl: "", isFree: false },
          { id: "ssb-4-4", title: "Delayed Steal & Trick Plays", description: "Advanced baserunning tactics for experienced runners.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 6️⃣ SHORT GAME SYSTEM (SIGNATURE DIFFERENTIATOR)
  // ═══════════════════════════════════════════════════════════════
  "softball-short-game": {
    courseId: "softball-short-game",
    modules: [
      {
        id: "ssg-bunting",
        title: "Bunting System",
        description: "Sacrifice bunts, drag bunts, and squeeze play execution",
        lessons: [
          { id: "ssg-1-1", title: "Sacrifice Bunt Mechanics", description: "Proper stance, bat angle, and ball placement for sacrifice bunts.", duration: "12 min", videoUrl: "", isFree: true },
          { id: "ssg-1-2", title: "Drag Bunt Technique", description: "Running while bunting — timing, footwork, and bat control.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "ssg-1-3", title: "Squeeze Play Execution", description: "Timing the squeeze bunt with the runner from third.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "ssg-1-4", title: "Bunt Defense Recognition", description: "Reading defensive alignment and adjusting bunt placement.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "ssg-push",
        title: "Push Bunts",
        description: "The aggressive bunt — pushing the ball past the pitcher",
        lessons: [
          { id: "ssg-2-1", title: "Push Bunt Mechanics", description: "Firm hands and directional push for placing bunts past charging fielders.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "ssg-2-2", title: "Push Bunt Target Zones", description: "Identifying optimal target zones based on defensive positioning.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "ssg-2-3", title: "Speed-Based Push Bunt", description: "Using speed advantage to turn push bunts into base hits.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "ssg-slap",
        title: "Slap Hitting Integration",
        description: "Combining the slap with the short game for maximum pressure",
        lessons: [
          { id: "ssg-3-1", title: "Slap-Bunt Combo Reads", description: "Reading the defense and choosing between slap, bunt, or swing.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "ssg-3-2", title: "Hard Slap Through the Infield", description: "Driving the ball past drawn-in infielders with force.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "ssg-3-3", title: "Chop Slap Over the Pitcher", description: "Using a downward chop to create high bounces for infield hits.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "ssg-situational",
        title: "Situational Offense",
        description: "When to deploy each short-game weapon based on the game situation",
        lessons: [
          { id: "ssg-4-1", title: "Runner on First — Move Her Over", description: "Sacrifice bunt vs. slap bunt vs. hit-and-run decision tree.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "ssg-4-2", title: "Runner on Third — Score Her", description: "Squeeze, safety squeeze, and contact play options.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "ssg-4-3", title: "Rally Situations", description: "When to abandon the short game and go for big hits.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "ssg-4-4", title: "Short Game Practice Plans", description: "Structured practice templates for short game repetition.", duration: "18 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 7️⃣ SOFTBALL ARM HEALTH
  // ═══════════════════════════════════════════════════════════════
  "softball-arm-health": {
    courseId: "softball-arm-health",
    modules: [
      {
        id: "sah-volume",
        title: "Pitch Volume Tracking (CRITICAL)",
        description: "Monitoring pitch volume is the #1 injury prevention tool for softball pitchers",
        lessons: [
          { id: "sah-1-1", title: "Why Pitch Volume Matters", description: "Softball pitchers throw WAY more frequently than baseball pitchers. Understanding cumulative stress.", duration: "12 min", videoUrl: "", isFree: true },
          { id: "sah-1-2", title: "Daily & Weekly Pitch Limits", description: "Age-based pitch count guidelines: 50/day (10U-12U), 75/day (14U), 100/day (16U+).", duration: "14 min", videoUrl: "", isFree: true },
          { id: "sah-1-3", title: "Season-Long Volume Planning", description: "Mapping pitch volume across an entire season for sustainable performance.", duration: "16 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "sah-overlap",
        title: "Pitcher + Position Overlap Rules",
        description: "Managing athletes who pitch AND play other throwing positions",
        lessons: [
          { id: "sah-2-1", title: "Pitcher-Catcher Overlap Policy", description: "When pitchers also catch — mandatory rules and restrictions.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "sah-2-2", title: "Pitching + Shortstop/Third Base", description: "Managing total throw volume when pitchers play throwing-intensive positions.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "sah-2-3", title: "Multi-Position Athlete Plans", description: "Creating individualized workload plans for dual-role athletes.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "sah-tournament",
        title: "Tournament Workload Control",
        description: "Multi-game weekends are where most softball injuries happen",
        lessons: [
          { id: "sah-3-1", title: "Tournament Pitch Count Protocols", description: "Managing pitch volume across 3-5 games in a weekend.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "sah-3-2", title: "Between-Game Recovery", description: "Active recovery protocols between tournament games.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "sah-3-3", title: "Safe to Pitch Flag System", description: "Real-time pitcher availability tracking for coaches.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "sah-recovery",
        title: "Recovery Cycles",
        description: "Structured recovery for windmill pitchers",
        lessons: [
          { id: "sah-4-1", title: "Post-Game Arm Care Routine", description: "Immediate post-game recovery: ice, bands, stretching protocol.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "sah-4-2", title: "Between-Start Recovery", description: "What to do in the days between pitching appearances.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "sah-4-3", title: "Off-Season Arm Recovery Phase", description: "Structured rest and rebuilding phase after the season.", duration: "16 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "sah-shoulder",
        title: "Shoulder Health Maintenance",
        description: "Underhand ≠ safe — shoulder stress is near bodyweight force",
        lessons: [
          { id: "sah-5-1", title: "Windmill Shoulder Anatomy", description: "Understanding the forces on the shoulder during windmill pitching.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "sah-5-2", title: "Daily Shoulder Maintenance", description: "Band work, CARs, and mobility for daily shoulder health.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "sah-5-3", title: "Warning Signs & Red Flags", description: "Recognizing early signs of shoulder stress before injury occurs.", duration: "10 min", videoUrl: "", isFree: false },
          { id: "sah-5-4", title: "Injury Risk Flags", description: "Elbow bend at release, closed hip finish, hyperextended stride — automated detection.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },

  // Keep original courses for backward compatibility
  "fastpitch-pitching-system": {
    courseId: "fastpitch-pitching-system",
    modules: [
      {
        id: "fp-week-1",
        title: "Week 1: Fastpitch Foundations",
        description: "Building the foundation for windmill pitching mechanics",
        lessons: [
          { id: "fp-1-1", title: "Windmill Mechanics Overview", description: "Understanding the biomechanics of the windmill pitch and proper body alignment.", duration: "14 min", videoUrl: "", isFree: true },
          { id: "fp-1-2", title: "Stride & Drive Mechanics", description: "Developing a powerful stride with proper push-off and landing mechanics.", duration: "16 min", videoUrl: "", isFree: true },
          { id: "fp-1-3", title: "Wrist Snap & Release Point", description: "Mastering the wrist snap for maximum velocity and spin.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "fp-1-4", title: "Arm Circle Timing", description: "Coordinating the arm circle with lower body mechanics for power transfer.", duration: "15 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "fp-week-2",
        title: "Week 2: Pitch Arsenal Development",
        description: "Building a complete pitch repertoire",
        lessons: [
          { id: "fp-2-1", title: "Fastball Command", description: "Locating the fastball to all quadrants of the strike zone.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "fp-2-2", title: "Change-Up Development", description: "Developing an effective change-up with proper arm speed deception.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "fp-2-3", title: "Rise Ball Mechanics", description: "Mastering the rise ball with proper backspin and release angle.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "fp-2-4", title: "Drop Ball & Curve", description: "Developing breaking pitches with consistent spin and movement.", duration: "16 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "fp-week-3",
        title: "Week 3: Velocity & Durability",
        description: "Increasing pitch speed while maintaining arm health",
        lessons: [
          { id: "fp-3-1", title: "Velocity Development Drills", description: "Targeted drills to increase fastpitch velocity safely.", duration: "20 min", videoUrl: "", isFree: false },
          { id: "fp-3-2", title: "Arm Care for Pitchers", description: "Softball-specific arm care routine for windmill pitchers.", duration: "15 min", videoUrl: "", isFree: false },
          { id: "fp-3-3", title: "Game Situation Pitching", description: "Pitch sequencing and strategy for different counts and situations.", duration: "18 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },
  "softball-hitting-system": {
    courseId: "softball-hitting-system",
    modules: [
      {
        id: "sh-week-1",
        title: "Week 1: Hitting Foundations",
        description: "Building a repeatable, powerful softball swing",
        lessons: [
          { id: "sh-1-1", title: "Stance & Load Mechanics", description: "Setting up for success with proper stance width, weight distribution, and load timing.", duration: "14 min", videoUrl: "", isFree: true },
          { id: "sh-1-2", title: "Rotational vs. Linear Hitting", description: "Understanding swing plane options and when to use each approach.", duration: "16 min", videoUrl: "", isFree: true },
          { id: "sh-1-3", title: "Contact Point Zones", description: "Identifying optimal contact points for inside, middle, and outside pitches.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "sh-week-2",
        title: "Week 2: Advanced Hitting",
        description: "Developing power and situational hitting skills",
        lessons: [
          { id: "sh-2-1", title: "Slap Hitting Fundamentals", description: "Mastering the slap hit for speed-based offense and bunting for base hits.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "sh-2-2", title: "Power Hitting Development", description: "Generating backspin and lift for extra-base hits.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "sh-2-3", title: "Timing the Rise Ball", description: "Adjustments for handling rise balls, drop balls, and off-speed pitches.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },
  "softball-fielding-system": {
    courseId: "softball-fielding-system",
    modules: [
      {
        id: "sf-week-1",
        title: "Week 1: Infield Play",
        description: "Developing elite infield skills for softball",
        lessons: [
          { id: "sf-1-1", title: "Ready Position & First Step", description: "Athletic stance and explosive first-step reactions for infielders.", duration: "12 min", videoUrl: "", isFree: true },
          { id: "sf-1-2", title: "Backhand & Forehand Plays", description: "Technique for fielding balls to both sides with clean transfers.", duration: "15 min", videoUrl: "", isFree: false },
          { id: "sf-1-3", title: "Double Play Turns", description: "Footwork and feeds for turning double plays from all infield positions.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "sf-week-2",
        title: "Week 2: Outfield & Catching",
        description: "Position-specific defensive development",
        lessons: [
          { id: "sf-2-1", title: "Outfield Routes & Jumps", description: "Reading the ball off the bat and taking efficient routes.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "sf-2-2", title: "Catching: Framing & Blocking", description: "Softball-specific catching techniques including framing rise balls.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "sf-2-3", title: "Throwing from Position", description: "Quick transfers and accurate throws from every defensive position.", duration: "15 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },
  "softball-baserunning": {
    courseId: "softball-baserunning",
    modules: [
      {
        id: "sb-week-1",
        title: "Week 1: Speed & Stealing",
        description: "Developing elite baserunning skills for softball",
        lessons: [
          { id: "sb-1-1", title: "Leadoff & Timing", description: "Understanding softball leadoff rules and timing the pitcher's release.", duration: "12 min", videoUrl: "", isFree: true },
          { id: "sb-1-2", title: "Stealing Mechanics", description: "First step explosion and running form for stealing bases.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "sb-1-3", title: "Sliding Techniques", description: "Pop-up slides, hook slides, and headfirst decisions.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "sb-1-4", title: "Situational Baserunning", description: "Reading the defense, tagging up, and advancing on wild pitches.", duration: "16 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },
  "softball-strength-conditioning": {
    courseId: "softball-strength-conditioning",
    modules: [
      {
        id: "ssc-week-1",
        title: "Week 1: Softball-Specific Strength",
        description: "Building functional strength for softball athletes",
        lessons: [
          { id: "ssc-1-1", title: "Lower Body Power", description: "Squats, lunges, and plyometrics designed for softball movements.", duration: "20 min", videoUrl: "", isFree: true },
          { id: "ssc-1-2", title: "Rotational Power for Hitters", description: "Med ball and cable work for generating bat speed and exit velocity.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "ssc-1-3", title: "Pitching-Specific Conditioning", description: "Shoulder stability and core endurance for pitchers.", duration: "18 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },
};

// Softball course catalog for the Courses page
export const softballTrainingSystems = [
  {
    id: "fastpitch-pitching",
    pillar: "V",
    title: "Fastpitch Pitching System",
    description: "Master windmill mechanics, develop a complete pitch arsenal, and increase velocity through softball-specific training.",
    duration: "10 Weeks",
    modules: 3,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-500/10",
    textColor: "text-purple-500",
    metrics: ["Pitch Speed", "Spin Rate", "Rise Ball Velo", "Command %"],
    isNew: true,
    courseId: "fastpitch-pitching-system",
  },
  {
    id: "softball-hitting",
    pillar: "A",
    title: "Softball Hitting System",
    description: "Build a powerful, repeatable swing with slap hitting, power hitting, and timing adjustments for softball pitching.",
    duration: "8 Weeks",
    modules: 2,
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-500",
    metrics: ["Exit Velocity", "Bat Speed", "Slap Speed", "Contact Rate"],
    isNew: true,
    courseId: "softball-hitting-system",
  },
  {
    id: "softball-fielding",
    pillar: "U",
    title: "Softball Fielding System",
    description: "Elite defensive skills for every position including infield play, outfield routes, and catching techniques.",
    duration: "6 Weeks",
    modules: 2,
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500/10",
    textColor: "text-green-500",
    metrics: ["Throw Velocity", "Reaction Time", "Range Factor", "Fielding %"],
    isNew: true,
    courseId: "softball-fielding-system",
  },
];

export const softballAdditionalSystems = [
  {
    pillar: "L",
    title: "Softball Arm Health",
    description: "Windmill pitcher-specific arm care and shoulder stability",
    color: "text-purple-400",
  },
  {
    pillar: "T",
    title: "Baserunning System",
    description: "Speed, stealing, and situational baserunning for softball",
    color: "text-amber-400",
  },
  {
    pillar: "S",
    title: "Strength & Conditioning",
    description: "Softball-specific strength, power, and conditioning programs",
    color: "text-green-400",
  },
];
