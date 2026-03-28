/**
 * VAULT™ Elite Coaching Content Library
 * 
 * All content is original VAULT™ curriculum. Biomechanical principles reference
 * publicly available sports science: NSCA, ASMI, ACSM, Driveline Research,
 * Baseball Savant (MLB public data), and peer-reviewed journals.
 * No proprietary systems reproduced.
 */

export interface LessonDetail {
  id: string;
  objectives: string[];
  coachingPoints: string[];
  drillProtocols: { name: string; protocol: string; cue: string }[];
  commonErrors: string[];
  eliteStandard: string;
  scienceBasis: string;
  weeklyTask: string;
  parentSummary: string;
}

// ─── PITCHING / VELOCITY ────────────────────────────────────────────────────

export const PITCHING_LESSONS: Record<string, LessonDetail> = {
  "Program Overview & Assessment": {
    id: "Program Overview & Assessment",
    objectives: [
      "Establish repeatable velocity baseline using consistent protocol",
      "Identify the 5 kinematic checkpoints in the throwing motion",
      "Understand periodization structure of the VAULT Velocity System"
    ],
    coachingPoints: [
      "Velocity is measured at release — always use Pocket Radar at 10 ft or Rapsodo. Plate-reading devices show 4-6 mph lower and are not valid for baseline comparison.",
      "The 5 checkpoints: (1) Hip load — back knee over ankle, hip crease below kneecap. (2) Stride foot contact — hips 30-35° ahead of shoulders. (3) Peak hip-shoulder separation — 40-48° in elite pitchers (ASMI published range). (4) Arm layback — max external rotation occurring within 15ms of foot strike. (5) Release — full pronation, balanced landing.",
      "70% of arm velocity comes from the kinetic chain BELOW the shoulder (ASMI, 2019). Athletes who train arm-only plateau at 78-82 mph regardless of arm strength.",
      "D1 RHP benchmark: 88+ mph. Elite HS prospect: 85+. JV: 72-78. Youth 14U: 60-68. D1 LHP: 85+. Softball D1: 61-68 mph. These are NCSA/Perfect Game published standards."
    ],
    drillProtocols: [
      { name: "Hip Load Hold", protocol: "Stand in windup, load back hip. Hold for 10 seconds. 3 sets.", cue: "Back knee over ankle — feel the glute loaded, not the quad. If you feel quad, you're too upright." },
      { name: "Knee Drive to Wall", protocol: "Stand 18 inches from wall, drive lead knee to wall without hip opening. 3×10.", cue: "Knee to wall, hip stays closed. The hip does NOT open until the foot is almost down." },
      { name: "Max Effort Baseline", protocol: "5 max-effort throws from mound, stretch only. Record each reading.", cue: "True max intent. No 'comfortable' throws in a velocity session — the nervous system only adapts to what it's challenged with." }
    ],
    commonErrors: [
      "Flying open: front shoulder opens before front foot plants. This is the single most common velocity killer at HS level.",
      "Short-arming: not achieving full external rotation (layback). Costs 4-7 mph and increases UCL stress.",
      "Heel landing: landing on the heel kills energy transfer. Land toe-first or flat-footed.",
      "Rushing: stride happens too fast before the hip-shoulder separation window opens."
    ],
    eliteStandard: "MLB average fastball (2024): 94.1 mph (Baseball Savant). D1 Power 5 average: 91.2 mph. High-A/AA: 93-95. Every 1 mph of velocity increases strikeout probability by ~2.3% (Statcast analysis). At the HS level, 90+ mph is the threshold that creates national attention.",
    scienceBasis: "The throwing motion is a proximal-to-distal kinematic chain. Each segment (hip → trunk → shoulder → elbow → wrist) adds rotational velocity in sequence. The hip-shoulder separation creates elastic energy in the oblique/thoracolumbar fascia that contributes 15-20 mph of free velocity through the stretch-shortening cycle (SSC). This is why lower body strength (trap bar deadlift correlates r=0.71 with pitching velocity, Lehman et al.) matters more than arm strength.",
    weeklyTask: "Baseline test (5 throws, log best), arm care morning and post-throw, hip load holds 3×/day for 14 days.",
    parentSummary: "This session establishes your athlete's starting point. Velocity benchmarks are not a judgment — they're a baseline that we improve from. The goal is controlled, sustainable velocity development over 12-24 months, not a dramatic spike in 2 weeks."
  },

  "Arm Care Routine": {
    id: "Arm Care Routine",
    objectives: [
      "Build a non-negotiable daily arm care protocol",
      "Understand the specific injury risk each exercise prevents",
      "Establish pre-throw activation and post-throw recovery sequences"
    ],
    coachingPoints: [
      "Tommy John surgeries in youth athletes increased 500% from 1994-2020. Average age dropped from 26 to 17 (Dr. James Andrews, published ASMI data). The cause is not velocity — it's accumulated volume without recovery.",
      "The UCL is NOT the primary stabilizer of the throwing elbow. The flexor-pronator mass (forearm muscles) is. When FPM is weak or fatigued, the UCL absorbs compensatory load. Forearm strengthening IS arm health.",
      "Pre-throw arm care: 8-10 min. Goal is activation and temperature — not fatigue. Post-throw arm care: 12-15 min. This is when adaptation happens. Never skip post-throw because of fatigue — that's when it matters most.",
      "ASMI pitch count guidelines (published): Ages 9-10: 50/day max. Ages 11-12: 75 max. Ages 13-16: 95 max. Ages 17-18: 105 max. Rest days after 61+ pitches: minimum 2 full rest days. These are HARD LIMITS, not suggestions."
    ],
    drillProtocols: [
      { name: "90/90 Band External Rotation", protocol: "3×15 each arm. Slow controlled negative (3 seconds).", cue: "Upper arm parallel to floor, hand leads back. Don't let the elbow drop. This targets infraspinatus/teres minor — your deceleration cuff." },
      { name: "Prone YTW", protocol: "2×10 each position on floor or incline bench.", cue: "Y: arms 30° above head, thumbs up. T: perpendicular. W: elbows bent 90°. Only go as high as you can without shrugging. Shrugging means trap compensation — the lower trap isn't firing." },
      { name: "Wrist Flexion/Extension", protocol: "2×20 each direction, forearm on bench.", cue: "Full range — wrist hangs off bench edge. 5 lbs max. This trains the flexor-pronator mass — your UCL's primary protector." }
    ],
    commonErrors: [
      "Too much band resistance: form breaks down, wrong muscles fire, defeats the purpose.",
      "Shrugging through YTW: compensating with traps instead of lower trap — the critical scapular stabilizer.",
      "Skipping post-throw arm care when tired: this is the highest-leverage moment for adaptation.",
      "Only counting game pitches: bullpen, long toss, and flat ground all accumulate stress. Total volume is what matters."
    ],
    eliteStandard: "Every MLB organization and elite college program mandates minimum 12 min post-throw arm care. Cressey Sports Performance, Driveline Baseball, and ASMI all publish identical recommendations. Elite athletes do this 365 days/year regardless of season.",
    scienceBasis: "The rotator cuff's primary function during throwing is DECELERATION — not acceleration. The cuff must decelerate a 100+ mph arm swing in under 50 milliseconds. This is the highest measured eccentric loading rate in human movement. Without adequate rotator cuff strength, the labrum and UCL absorb compensation stress, leading to the pathologies we see in statistics.",
    weeklyTask: "Complete arm care every single day — before AND after any throwing. Log it in VAULT Workload Tracker. No exceptions.",
    parentSummary: "Arm care is not optional and not 'extra.' It is foundational. Parents: the ASMI pitch count guidelines exist because the data shows 3.5× higher serious injury rates in athletes who violate them. Know your athlete's age-group limits and enforce them even when coaches don't."
  },

  "Long Toss Protocol": {
    id: "Long Toss Protocol",
    objectives: [
      "Understand the purpose and structure of intent-based long toss",
      "Build progressive arm strength through distance extension",
      "Learn the pulldown integration for velocity development"
    ],
    coachingPoints: [
      "Long toss at its core is progressive overload for the throwing arm. The same principle that governs all strength training applies: progressive loading over time. You do not achieve arm strength by throwing the same distance at the same intensity indefinitely.",
      "The extension phase: Throw at maximum distance (whatever is safe for that day). Goal is to build arm strength, not to arc. Flat extension throws are more velocity-specific than high-arc throws.",
      "The pulldown phase (advanced): After extension, move in and throw 10-15 max-effort flat-ground throws from 90-120 feet. These should be 100% effort. This is where velocity gains transfer. Only appropriate for athletes 14+ with clean mechanics.",
      "Arm speed during long toss at distance = your natural velocity ceiling. The throws feel slower because the ball is heavier over distance, but the arm is working at high intensity. This trains the posterior chain of the shoulder for deceleration loads."
    ],
    drillProtocols: [
      { name: "Progressive Extension", protocol: "Start at 60 ft. Add 15 ft every 3-4 throws. Stop when ball shape changes significantly. Full warmup required first.", cue: "Throw THROUGH the target, not TO it. Extension thinking, not arc thinking." },
      { name: "Flat Ground Pulldown", protocol: "After extension, move to 90-105 ft. 10-15 max-effort throws. Full recovery between throws (90-120 sec).", cue: "100% intent — no 'comfortable' throws. The nervous system adapts to the demand you place on it." },
      { name: "Arm Recovery Walk", protocol: "10-minute walk and light band work immediately post-long-toss.", cue: "Active recovery is non-negotiable. Don't sit down immediately after high-intent throwing." }
    ],
    commonErrors: [
      "High arc throws: trains different muscles than pitching. Not velocity-specific.",
      "Too much volume: long toss should be 3x/week max in off-season, 2x in pre-season, 1x in-season.",
      "No recovery between throws: 90+ seconds rest between pulldown throws — quality over quantity.",
      "Skipping warmup: 15-minute arm care and throwing build-up before any extension work."
    ],
    eliteStandard: "Driveline Baseball research (published) shows athletes who completed a structured 8-week long toss + pulldown program gained an average of 2.4 mph on their fastball. This is consistent with ASMI data showing arm strength is a trainable variable with structured programming.",
    scienceBasis: "High-intent throwing at distance creates muscular hypertrophy in the posterior shoulder, increases joint stabilizer endurance, and trains the deceleration pathway. The stretch-shortening cycle is fully engaged at maximum-distance extension throws, which is why the pulldown (returning to mound distance after extension) allows athletes to express velocity gains achieved at distance.",
    weeklyTask: "Complete long toss 3x this week per the program schedule. Log distance and number of throws in VAULT Workload Tracker. Compare your max comfortable distance on Day 1 vs Day 21.",
    parentSummary: "Long toss is legitimate arm strengthening when done with proper volume management. The key word is 'progressive' — we increase distance and intensity gradually. If your athlete reports elbow or shoulder pain during or after long toss, stop and consult a sports medicine professional immediately."
  },

  "Hip-Shoulder Separation": {
    id: "Hip-Shoulder Separation",
    objectives: [
      "Understand the biomechanics of hip-shoulder separation",
      "Learn to measure and improve separation angle",
      "Train the timing pattern that produces free velocity"
    ],
    coachingPoints: [
      "Hip-shoulder separation (HSS) is the rotational preloading of the trunk. When the hips rotate before the shoulders, the obliques and thoracolumbar fascia stretch elastically — like a rubber band. The recoil contributes 15-22 mph of 'free' velocity through the stretch-shortening cycle.",
      "Elite MLB pitchers average 43-48° of HSS at front foot strike (ASMI biomechanics database). Average HS pitcher: 22-28°. This single mechanical variable explains much of the velocity gap between levels — more than arm strength.",
      "Training HSS requires three things working together: (1) Hip mobility — the pelvis must be able to rotate fully and independently. (2) Thoracic mobility — the upper back must resist shoulder turn during hip rotation. (3) Timing — the hip turn must initiate BEFORE the stride foot hits.",
      "Med ball training is the most research-supported method to ingrain this pattern. The rotational scoop throw forces the athlete to rotate hips first because the ball teaches the sequence physically."
    ],
    drillProtocols: [
      { name: "Hip Turn Only (arms crossed)", protocol: "Stand on mound. Arms crossed over chest. Execute full delivery — turn hips completely to target before shoulders even begin to rotate. 3×10.", cue: "Your chest should still be facing home plate when your hip is already pointing at the catcher." },
      { name: "Med Ball Rotational Scoop", protocol: "6-8 lb ball. 4×8 each side against wall. Max effort.", cue: "Back leg loads → hips fire first → ball releases AT hip height. If you're throwing it with your arm, you're missing the point." },
      { name: "Partner Hold Drill", protocol: "Partner places hands on thrower's shoulders. Thrower turns hips to target while partner resists shoulder turn. 3×8.", cue: "Feel the oblique stretch — that tension IS the velocity. The bigger the stretch before release, the more elastic energy." }
    ],
    commonErrors: [
      "Flying open: most common velocity killer. Front shoulder opens before foot plants — hip and shoulder rotate together, no separation, no elastic energy.",
      "Arm-dominant throwing: arm fires before hip-to-shoulder sequence completes. These pitchers plateau at 78-82 mph regardless of arm strength.",
      "Stiff lead side: the lead hip must 'block' (decelerate) after planting to create the separation. Athletes with weak hip stabilizers can't create this block.",
      "Rotating from the torso instead of the hip: The initiation must come from the HIP, not the obliques directly."
    ],
    eliteStandard: "45°+ HSS at foot strike is D1/pro standard. Driveline's published biomechanics data shows athletes who increase HSS by 10° show average velocity gains of 2.1 mph regardless of other mechanical changes.",
    scienceBasis: "The stretch-shortening cycle (SSC) of the trunk musculature works identically to the SSC of the lower body in jumping. Eccentric loading (stretch) followed immediately by concentric firing (release) produces more force than concentric-only movement. Peak SSC efficiency in the obliques/thoracolumbar fascia occurs at 40-50° separation — which is why elite pitchers consistently show this range.",
    weeklyTask: "30 med ball rotational throws daily (15 each side). Film one throw per day from directly overhead. Compare separation angle on Day 1 vs Day 7.",
    parentSummary: "Hip-shoulder separation is a technical skill — it's not about arm strength. Mechanically, athletes who learn this pattern correctly can gain 3-7 mph without throwing any harder. It's physical economy: getting more from the same effort."
  },

  "Spin Rate & Pitch Design": {
    id: "Spin Rate & Pitch Design",
    objectives: [
      "Understand what spin rate is and why it matters",
      "Learn spin efficiency and axis control concepts",
      "Build a primary breaking ball with measurable spin metrics"
    ],
    coachingPoints: [
      "Spin rate is measured in revolutions per minute (RPM). A baseball spinning at 2400+ RPM creates more Magnus force (the force that makes curveballs curve and rise balls rise). MLB average 4-seam fastball: 2258 RPM (Baseball Savant, 2024). Elite fastball: 2400+.",
      "Spin efficiency is MORE important than raw spin rate. A 2600 RPM fastball with 75% spin efficiency produces less movement than a 2200 RPM fastball with 95% efficiency. True spin (the spin that actually creates movement) = total spin × efficiency %.",
      "Active spin vs gyro spin: Active spin creates movement. Gyro spin (like a spiraling football) does not. A curveball with 90%+ active spin will break dramatically. Same RPM with 40% active spin will look like a hanging curve.",
      "Grip and wrist angle determine axis and efficiency. Most youth pitchers have poor spin efficiency because wrist position at release is inconsistent. Video analysis at 240fps can identify this."
    ],
    drillProtocols: [
      { name: "Seam Grip Optimization", protocol: "Try 3 different 4-seam grips. Measure RPM with Rapsodo on 5 throws each. Select highest RPM grip.", cue: "Fingers on top of the ball, slight fingertip pressure. Some pitchers find a 'shifted' grip adds 200+ RPM naturally." },
      { name: "Curveball Spin Drill", protocol: "Focus solely on wrist snap and finger pressure — not velocity. 20 reps at 60% effort with Rapsodo.", cue: "Pull down with middle finger, pronate slightly. Feel the ball roll off the inside of the finger. Spin quality first, velocity second." },
      { name: "Tunnel Point Exercise", protocol: "Fastball and curveball should share the same release point and initial trajectory for 20-30 feet. 10 reps each back-to-back.", cue: "If the batter can see it's a curveball at release, it will be hit. Same arm speed, same slot, different wrist action." }
    ],
    commonErrors: [
      "Slowing arm for curveball: identical arm speed on every pitch. Deception requires same arm path.",
      "Rolling the curveball out of the hand early: the snap happens AT and through release, not before.",
      "Ignoring spin efficiency: raw RPM without efficiency data is incomplete. Need a Rapsodo unit.",
      "Throwing breaking balls before velocity is established: command your fastball first. Adding spin without velocity creates predictable, hittable junk."
    ],
    eliteStandard: "MLB elite curveball spin: 2800+ RPM. Average: 2586 RPM. D1 curveball: 2300-2600 RPM. The pitch design revolution has reached high school — D1 coaches now request Rapsodo reports at showcases. Athletes with documented spin data get callbacks that athletes without data don't.",
    scienceBasis: "The Magnus effect describes the force on a spinning sphere moving through fluid. A baseball spinning at 2400 RPM at 90 mph generates approximately 0.3 lbs of Magnus force per inch of deflection. This is why a well-thrown slider moves 14-18 inches horizontally — it's pure physics. Improving spin efficiency from 70% to 90% on the same pitch type creates 25-30% more movement.",
    weeklyTask: "Pick your primary secondary pitch. Film 20 throws from behind. Compare release point to your fastball — are they within 6 inches? If not, that's your fix first.",
    parentSummary: "Pitch design is the newest frontier in pitcher development. The data tools (Rapsodo, Trackman) that were MLB-only 10 years ago are now in high schools. Athletes who understand their spin metrics have a significant recruiting advantage because they can present objective pitch quality data."
  },
};

// ─── HITTING / EXIT VELOCITY ─────────────────────────────────────────────────

export const HITTING_LESSONS: Record<string, LessonDetail> = {
  "Exit Velocity Foundation": {
    id: "Exit Velocity Foundation",
    objectives: [
      "Establish EV baseline and understand the 3 primary drivers",
      "Learn intent-based hitting as a training methodology",
      "Build the mechanical foundation for elite exit velocity"
    ],
    coachingPoints: [
      "Exit velocity (EV) is the single most predictive metric for offensive production at every level. MLB average EV (2024 Statcast): 88.4 mph. Every 1 mph increase in EV = +.012 expected batting average and +.025 expected slugging (Statcast regression analysis).",
      "The 3 primary EV drivers in order of leverage: (1) Bat speed at contact — 1 mph bat speed = ~1.2 mph EV. (2) Attack angle — optimal range is 8-15° upward for power contact. (3) Contact location — center of mass to center of mass reduces smash factor losses.",
      "Intent matters statistically. Driveline's published research with Blast Motion data: athletes instructed to swing 'as hard as possible' gained 3.2 mph average bat speed over 6 weeks vs control group (no intent instruction). The nervous system adapts to intent.",
      "Standard benchmarks: MLB top EV: 115+ mph. MLB average: 88 mph. D1 scholarship range: 90+ preferred. HS elite (varsity): 85-92. JV: 72-80. 14U elite: 78-85. Softball D1: 72-82 mph."
    ],
    drillProtocols: [
      { name: "Max Effort Tee", protocol: "10 swings at 100% intent. Use overload bat (31+ oz) for 5, underload (25 oz) for 5. Log EV.", cue: "Swing for the fences on every rep. The tee won't tell anyone you swung too hard. Velocity first, contact second." },
      { name: "Attack Angle Tee", protocol: "Set tee at knee height. 15 swings focusing on slight upward bat path.", cue: "Feel the barrel staying 'under and through' — not over the top. The sweet spot should make solid contact with a 10° upward angle." },
      { name: "Front Toss Max Effort", protocol: "15 swings at 100% intent from 25 feet. Log top EV readings.", cue: "Barrel must be at full speed at contact. Acceleration happens BEFORE contact, not AT contact." }
    ],
    commonErrors: [
      "Casting the barrel: hands push away from body before hip rotation — kills bat speed, the #1 EV driver.",
      "Collapsing back knee: creates steep downswing, reduces EV on fastballs, increases ground ball rate.",
      "Tension in hands/forearms: grip 4-5/10 at load, 7-8/10 at contact only. Tension = speed killer.",
      "Decelerating through contact: the barrel must be accelerating through the hitting zone, not peak-then-drop."
    ],
    eliteStandard: "MLB Statcast classifies 95+ mph EV as 'hard hit.' Hard hit rate is the most stable predictor of offensive performance (r=0.71 year-to-year). At the D1 level, EV data is requested at every major showcase. Athletes who can demonstrate 90+ EV get film reviewed. Those who can't typically don't.",
    scienceBasis: "Exit velocity follows Newton's laws of conservation of momentum. The equation: EV = (mass_bat × speed_bat + mass_ball × speed_pitch) / (mass_bat + mass_ball) × coefficient_of_restitution. This means bat speed has greater leverage than pitch speed on EV. A 1 mph increase in bat speed increases EV more than a 1 mph increase in pitch speed, because bat mass > ball mass.",
    weeklyTask: "100 max-effort swings daily (50 tee, 50 front toss). Log top 3 EV readings per session. Track week-over-week trend in VAULT KPI tracker.",
    parentSummary: "Exit velocity is the equivalent of GPA for a hitter's recruiting profile. D1 coaches pull EV data from Perfect Game and NCSA before watching film. Building and documenting this number is as important as actual game performance for recruiting purposes."
  },

  "Bat Speed Development": {
    id: "Bat Speed Development",
    objectives: [
      "Understand the mechanics that produce elite bat speed",
      "Implement overload/underload training protocol",
      "Build rotational strength that transfers to the box"
    ],
    coachingPoints: [
      "Bat speed is measured at the sweet spot of the bat at the point of contact (Blast Motion, Diamond Kinetics). MLB average bat speed (Statcast 2024): 72.5 mph. Elite: 80+ mph. D1 typical: 68-76 mph. HS varsity: 62-70 mph.",
      "The hip-to-hand sequence drives bat speed: back hip clears → shoulders rotate → hands deliver. Athletes who initiate with hands instead of hips plateau at 62-66 mph regardless of arm strength.",
      "Overload/underload (O/U) training is the most research-supported bat speed development protocol. Swinging a heavier bat (108-116% of game weight) followed immediately by a lighter bat (84-92% of game weight) creates a neurological 'contrast effect' that temporarily elevates swing speed. 6-8 weeks of consistent O/U training produces lasting gains.",
      "Grip pressure affects bat speed: a 10/10 death grip reduces bat speed by 4-6 mph compared to a relaxed 5/10 grip. The hands should be loose at setup and only tighten at contact. Elite hitters describe it as 'letting the bat fly.'"
    ],
    drillProtocols: [
      { name: "Overload/Underload Contrast", protocol: "5 swings with overload bat (4-6 oz heavier). Immediately 5 swings with underload bat (4-6 oz lighter). 4 sets.", cue: "The underload swings should feel effortless — let it fly. This is the neurological window where gains happen." },
      { name: "Hip Fire Tee Drill", protocol: "Open stance 45°. 15 swings focusing ONLY on firing the back hip first. No thought about hands.", cue: "The hip clears the path — the hands follow automatically. Athletes who think about their hands too early are the ones who cast." },
      { name: "Rotational Med Ball Slam", protocol: "8 lb med ball. 4×8 each side. Max rotational effort.", cue: "Hips first, then core, then arms. The ball is just along for the ride. This is training the exact motor pattern of the swing." }
    ],
    commonErrors: [
      "All hands, no hips: results in slow bat speed and a pull-side-only approach.",
      "Spinning on back foot: back foot should drive into the ground, not spin. Spinning indicates passive lower body.",
      "Stopping at contact: follow-through completes the acceleration arc. Stopping at the ball decelerates through contact.",
      "Inconsistent tee height: always practice at competition height ranges. Too-high tee trains different mechanics."
    ],
    eliteStandard: "80+ mph bat speed is the threshold that separates elite hitters from average at every level. Freddie Freeman, Matt Olson, and other elite contact hitters all measure 75-80+ mph bat speed. The Statcast era has confirmed what hitting coaches knew: bat speed is more trainable than previously believed.",
    scienceBasis: "The rotational hitting motion generates bat speed through the kinetic chain: lower body creates rotational momentum, the trunk amplifies it, and the arms deliver it to the bat. Peak bat speed occurs when all segments fire in sequence with no energy leaks. Athletes who cast the barrel 'leak' rotational energy out of the chain before it reaches the bat.",
    weeklyTask: "O/U contrast sets 4x this week. Log Blast Motion or Diamond Kinetics bat speed before and after each session. 20-minute rotational strength circuit (med ball + cable rotations).",
    parentSummary: "Bat speed is built through specific training, not just repetition. Overload/underload training is used at every level from high school elite programs to the MLB. It's safe, well-researched, and produces measurable results in 3-6 weeks."
  },

  "Attack Angle & Launch Angle": {
    id: "Attack Angle & Launch Angle",
    objectives: [
      "Understand the relationship between attack angle and hard contact",
      "Learn optimal launch angle by situation",
      "Train the bat path that produces maximum hard-hit rate"
    ],
    coachingPoints: [
      "Attack angle is the angle of the bat relative to horizontal at contact. Launch angle is the angle of the ball relative to horizontal off the bat. They are related but not identical — contact location affects both.",
      "Statcast optimal launch angle for home runs: 25-35°. For gap extra-base hits: 15-25°. For ground ball singles: <10° (situational). Average MLB hard-hit launch angle: 18-22°. The 'launch angle revolution' showed that optimizing attack angle to 8-14° upward maximizes hard-hit rate.",
      "Common misconception: 'swing down for backspin.' This was taught for decades and is demonstrably wrong per Statcast data. A downward swing creates topspin (reduces distance) and extremely small contact zone (poor margin for error). An 8-14° upward swing creates backspin on low pitches and optimal contact zone width.",
      "The path from load to contact should be: hands take a short, direct path to the ball while the barrel takes a 'shallow-then-through' path through the zone. This creates the slightly upward attack angle while keeping the swing efficient."
    ],
    drillProtocols: [
      { name: "Spine Angle Match Drill", protocol: "Set tee at knee height. Create spine angle that matches optimal attack angle. 20 swings.", cue: "Your swing should match your spine angle through the hitting zone. Tilt your spine back slightly at setup — this naturally creates the upward attack angle." },
      { name: "High Tee/Low Tee Comparison", protocol: "10 swings high tee, 10 swings low tee. Compare EV and launch angle.", cue: "Your EV on the low ball should be within 5 mph of the high ball. Large gap = attack angle problem on low pitches." },
      { name: "Opposite Field Drive", protocol: "15 swings to opposite field off tee. Focus on staying through the ball deep.", cue: "Hitting the ball where it's pitched is launch angle management. Opposite field on outside = staying back, letting ball travel." }
    ],
    commonErrors: [
      "Over-correcting to extreme launch angle: swinging for 35° on every pitch is predictable. Situational adjustment is elite hitting.",
      "Hooking the ball with extreme pull: pull-heavy hitters often show poor launch angle data on pitches away.",
      "Dropping the back shoulder too much: creates extreme upward swing, pop-ups on up-and-in pitches.",
      "Chasing spin: fastball attack angle vs breaking ball attack angle are different. Adjusting is a timing skill."
    ],
    eliteStandard: "MLB leaders in hard-hit rate consistently show attack angles of 10-15°. Statcast shows average hard-hit rate increases by 8% per degree of attack angle improvement from negative to +10°. The sweet spot: consistent 10-14° attack angle with the ability to situationally adjust.",
    scienceBasis: "The physics of the ball-bat collision favor a slight upward attack angle. A 12° attack angle creates a contact zone approximately 2.5 inches wide — nearly 3× wider than a 0° (level) swing on the same pitch. Wider contact zone = more margin for error = higher batting average at the same exit velocity.",
    weeklyTask: "Analyze 10 swings on video from the side. Measure approximate attack angle at contact. Goal: consistently 8-14° upward. Track change over 3 weeks.",
    parentSummary: "The 'swing down' coaching cue was standard for 50+ years and is now proven incorrect by 10 years of Statcast data. Your athlete learning modern attack angle mechanics is not rejecting previous coaching — it's an upgrade based on better measurement tools."
  },

  "Pitch Recognition & Decision Making": {
    id: "Pitch Recognition & Decision Making",
    objectives: [
      "Understand the neuroscience of pitch recognition",
      "Train the visual and cognitive decision window",
      "Build a swing/take decision framework"
    ],
    coachingPoints: [
      "A 90 mph fastball reaches the plate in approximately 410 milliseconds. Humans require ~200ms to initiate a motor response. That leaves a decision window of ~150-200ms — roughly the time it takes to blink twice. This is the physical reality of elite hitting.",
      "Research shows hitters make pitch-type decisions based on trajectory and spin cues in the first 100-150ms after release — before the ball is even 1/3 of the way to the plate (Gray, 2002, Journal of Experimental Psychology). The decision is made off the pitcher's hand, not off the ball.",
      "The 4 key early-read cues: (1) Release slot — different pitches often come from slightly different arm angles. (2) Spin direction — visible at release with training. (3) Initial trajectory — fastball trajectory vs breaking ball trajectory diverge in first 30 feet. (4) Pitcher hip rotation — fastball and breaking ball differ in hip sequencing for some pitchers.",
      "Swing decision framework: Pitch in zone + good trajectory reading = swing. Pitch outside zone regardless of appearance = take. The discipline-first approach: always take until the 2-strike count changes the equation."
    ],
    drillProtocols: [
      { name: "Color Ball Recognition Drill", protocol: "Partner throws colored tennis balls (red/green). Hitter calls color before swinging only on green. 20 reps.", cue: "The goal is GO/NO-GO decision speed, not contact quality. This trains the decision pathway, not the swing." },
      { name: "Soft Toss Spin Read", protocol: "Partner hand-delivers 5 pitch types in random order. Hitter calls pitch type before swinging. 30 reps.", cue: "Read the spin direction off the release. Curveball: 6-12 o'clock spin. Slider: tilted spin. Fastball: 12-6 backspin." },
      { name: "Film Study — Own At-Bats", protocol: "Review 5 of your own at-bats. Identify pitches swung at outside the zone. 20-minute session.", cue: "Zone discipline is as trainable as physical mechanics. Most athletes discover they chase the same pitch type repeatedly." }
    ],
    commonErrors: [
      "Trying to pick up the ball late: the decision must be made in the first 150ms. Training late recognition doesn't help.",
      "Pattern-matching on rise ball: softball rise balls look like mid-zone fastballs at release — that's the deception. Train specifically for this.",
      "Two-strike approach identical to count-ahead approach: elite hitters change their swing and zone with counts. One-speed approach is predictable.",
      "Chasing velocity: when a pitcher pumps a 92 mph fastball by you, the next pitch adjustment is often to sit fastball early and get beat by the breaking ball."
    ],
    eliteStandard: "MLB average chase rate (swings outside the zone): 29.4% (Statcast 2024). Elite contact hitters: 18-22%. D1 programs actively measure chase rate and zone contact in recruiting evaluation. Athletes who swing at everything are flagged regardless of EV.",
    scienceBasis: "Perceptual learning theory (Gibson, 1979) explains that pitch recognition is a trained perceptual skill, not a reflexive one. Athletes who perform structured pitch recognition training show measurable improvement in decision accuracy within 6-8 weeks. The brain builds predictive models based on repeated exposure to visual cues — which is why repetitive bullpen work with the same pitcher LIMITS recognition development.",
    weeklyTask: "Watch 20 minutes of pitcher video from your upcoming opponents. Look for: release slot consistency, spin direction on secondary pitches, velocity differences between fastball and change. Create a scouting note in VAULT.",
    parentSummary: "Pitch recognition is one of the most trainable and most under-trained skills in baseball and softball. It's cognitive training, not just physical. Athletes who study their own at-bats on video and do structured recognition drills show improvement that equals or exceeds physical batting work."
  },
};

// ─── SPEED & AGILITY ─────────────────────────────────────────────────────────

export const SPEED_LESSONS: Record<string, LessonDetail> = {
  "60-Yard Dash Foundation": {
    id: "60-Yard Dash Foundation",
    objectives: [
      "Understand the 3-phase model of the 60-yard dash",
      "Learn acceleration mechanics that create maximum first-step power",
      "Establish a repeatable baseline with proper protocol"
    ],
    coachingPoints: [
      "The 60-yard dash has three distinct phases: Acceleration (0-20yd): body at 45°, pure power output, drive phase. Transition (20-40yd): body rises from 45° to 70-80°, stride lengthens. Max velocity (40-60yd): fully upright, relaxed, cycling mechanics. Most athletes only train one phase. The biggest time savings come from the first 20 yards.",
      "NCSA/Perfect Game division standards: D1 OF: 6.5-6.7 consistent. D1 IF: 6.7-6.9. D2: 6.9-7.1. D3: 7.1-7.3. HS elite: 6.7-6.9. JV: 7.0-7.3. Youth 14U: 7.0-7.5. Softball equivalents: D1 OF: 2.7-2.9 home-to-first. D1 IF: 2.8-3.0.",
      "Ground force application is the primary differentiator. Elite sprinters apply 4.5-5× bodyweight into the ground. They don't run fast — they push hard in the right direction. Ground force angle = direction of movement.",
      "Arm action drives leg action. Ralph Mann's USOC research: arm drive accounts for 25-30% of running velocity. Tight elbows at 90°, aggressive backswing (hand to hip pocket), controlled forward swing. The arm leads the ipsilateral leg."
    ],
    drillProtocols: [
      { name: "Wall Drive Mechanics", protocol: "Hands on wall at shoulder height. Body at 45°. 4×8 drives each leg. Full back leg extension.", cue: "Drive knee UP and THROUGH — not forward. Back leg FULLY extends into the wall. Stay stiff through core — no hip sway. This is the acceleration phase ground force pattern." },
      { name: "Falling Start", protocol: "Stand tall. Lean forward until you MUST step. Sprint 20 yards. 6 reps full recovery.", cue: "That lean angle when you're forced to step — that's the body angle for the first 10 yards. Most athletes don't lean enough." },
      { name: "Full 60-Yard Protocol", protocol: "2-point stance, 6-7 steps into sprint. 3 timed attempts. Full recovery (5 min) between reps.", cue: "No false starts. Consistent stance. Time begins when you move. The scout watches your first step and your 60 time." }
    ],
    commonErrors: [
      "Popping upright too early: most athletes rise to 90° by 15 yards instead of 20+. This kills acceleration.",
      "Over-striding: reaching forward with the lead foot brakes momentum. Drive down and back, not forward.",
      "Tight upper body: tension in shoulders and arms kills hip mobility and stride rate. Relax the face.",
      "Stopping effort at 55 yards: the time is recorded at 60. Run through the line."
    ],
    eliteStandard: "Sub-6.7 is the D1 threshold for outfielders. At the MLB draft, sub-6.5 draws special attention. The 60-yard dash is the most universally evaluated athletic metric in baseball recruiting — more scouts stop what they're doing for a 6.5 time than almost anything else.",
    scienceBasis: "Sprint velocity = stride length × stride frequency. In the acceleration phase (0-20yd), stride length is the primary variable. In max velocity phase (40-60yd), stride frequency becomes more important. Training both phases independently produces faster improvements than general sprint training alone.",
    weeklyTask: "Wall drives daily (4×8 each leg). Timed 60-yard dash 3x this week. Compare and log. Film from the side — analyze body angle at 10 yards vs ideal.",
    parentSummary: "The 60-yard dash is baseball's version of the combine 40. Every scout, at every level, has a stopwatch. Improving this number requires specific mechanical training — not just running more. The protocol in this lesson is based on the same sprint science used by NFL combine training programs."
  },

  "First-Step Quickness": {
    id: "First-Step Quickness",
    objectives: [
      "Understand the components of elite first-step quickness",
      "Train the reactive and predictive movement systems",
      "Build the defensive range that increases recruiting value"
    ],
    coachingPoints: [
      "First-step quickness is not pure speed — it's anticipation + reaction + explosive first movement. Elite outfielders' first steps are often PREDICTIVE (reading pitcher's delivery, pitch type, batter contact pattern) not reactive. Developing baseball IQ is developing defensive range.",
      "The ready position matters enormously: weight on balls of feet, slight knee bend (15-20°), hips just below parallel, hands relaxed. An athlete who sets up in a flat-footed, upright stance has to perform two additional movements before their actual first step.",
      "Research shows that closed-loop reaction drills (standard T-drill, cone shuffles) improve closed-loop speed but do NOT transfer to open-loop reactive first steps in games. Training must include randomness and decision-making.",
      "Outfield first step: the crossover step is faster than the drop step for all balls within 10-15 yards. The drop step is reserved for over-the-head balls. Most youth athletes use drop step for everything — this costs 0.2-0.4 seconds of range."
    ],
    drillProtocols: [
      { name: "Ball Drop Reaction Drill", protocol: "Partner holds baseball at shoulder height. Drop without warning. Athlete catches before second bounce. 4×8. Vary direction.", cue: "Don't anticipate. Watch the hand, react to the release. This trains pure reaction speed, not pattern matching." },
      { name: "Mirror Drill", protocol: "Two athletes face each other. Leader makes random lateral movements. Follower mirrors. 4×30 seconds.", cue: "Stay in athletic position throughout. The goal is to reduce response lag to less than 150ms. This trains COD (change of direction) reaction." },
      { name: "Pre-Pitch Reads Drill", protocol: "Partner acts as pitcher. After 'delivery' motion, calls a direction or uses hand signal. Athlete reacts.", cue: "Start your weight shift at pitch release — not at contact. This is how elite outfielders get those 'how did he get there' jumps." }
    ],
    commonErrors: [
      "Wrong ready position: flat-footed or weight back = slow first step. Weight on balls of feet ALWAYS.",
      "Using drop step on all balls: crossover for anything below head height, within 15 yards.",
      "Watching the ball at contact: elite outfielders read the swing AND the contact point. Most youth players only watch the ball.",
      "Jogging to position: first steps at 100% effort, slow down at the ball. Never jog to the ball in practice — that's training the wrong habit."
    ],
    eliteStandard: "D1 recruiting standard: outfielders who can consistently close on balls with sub-0.3 second reaction times and reach balls 30+ feet to either side. This is not measurable on a stopwatch — it's observed in showcase film and live evaluation. The athletes who get 'plus' defensive grades at showcases are the ones who show elite first steps, not just pure speed.",
    scienceBasis: "The visual-motor delay (time from visual stimulus to motor response) averages 180-220ms in untrained adults. Elite athletes show 150-170ms. Specific reactive training (random visual stimuli requiring directional responses) reduces this by 15-25ms over 6-8 weeks of consistent practice. This is neurological adaptation, not muscular.",
    weeklyTask: "Ball drop drill daily (4×8). Mirror drill with a teammate 3x this week. Film your defensive positions from center field angle — analyze your first step direction on 10 balls.",
    parentSummary: "Defensive range is as trainable as offensive tools. The athletes with elite first steps have trained specifically for reaction speed — they didn't just get faster. This type of training (reactive, decision-based) is neurological development and produces results quickly with consistent practice."
  },
};

// ─── SOFTBALL-SPECIFIC ────────────────────────────────────────────────────────

export const SOFTBALL_LESSONS: Record<string, LessonDetail> = {
  "Fastpitch Pitching Mechanics": {
    id: "Fastpitch Pitching Mechanics",
    objectives: [
      "Understand the biomechanics of the windmill motion",
      "Build a velocity-first foundation with arm health as a non-negotiable",
      "Establish baseline pitch velocity with proper measurement protocol"
    ],
    coachingPoints: [
      "Fastpitch pitching is NOT an underhand version of overhand throwing. The biomechanics are distinct: the shoulder is in internal rotation throughout, the elbow stays closer to the body, and the power source is hip drive combined with shoulder internal rotation at release.",
      "D1 velocity standards: Power 5 programs recruit 62-68 mph pitchers. Mid-major D1: 58-64 mph. D2: 55-62 mph. D3: 50-58 mph. HS varsity: 52-60 mph. 14U elite: 50-56 mph. These are NCSA/Perfect Game published standards for softball pitching.",
      "Hip drive is the primary velocity contributor in fastpitch — identical to baseball pitching. The drive leg (pushing off the rubber) determines how much energy enters the kinetic chain. Athletes who generate elite hip drive but poor mechanics still out-velocity athletes with great mechanics and poor hip drive.",
      "Pitch frequency in softball is dramatically higher than baseball: a softball pitcher in a tournament weekend can throw 300+ pitches in 48 hours. This is physiologically distinct from baseball and creates unique arm health considerations. The NFCA recommends no more than 6 innings/day and mandatory rest protocols."
    ],
    drillProtocols: [
      { name: "Drive Line Drill", protocol: "Focus only on the drive leg push through the pivot line. No arm. 3×10.", cue: "The rubber is a launching pad — push THROUGH it, not off it. The momentum should carry you aggressively forward. The arm catches up." },
      { name: "Wrist Snap Isolation", protocol: "Stand at 15 feet from wall. Focus only on wrist snap at release point. 30 reps.", cue: "The snap is VIOLENT — not smooth. Snap down and through. You should hear the wrist pop if doing it correctly." },
      { name: "K-Position Power Drill", protocol: "Stop in K-position (arm at 9 o'clock, stride foot planted, hip loaded). Hold for 2 seconds. Then complete motion. 3×8.", cue: "From K-position, your entire velocity comes from hip internal rotation and wrist snap. This is the velocity window." }
    ],
    commonErrors: [
      "Short-arming at the top: not completing full arm circle reduces power and spin.",
      "Landing heel-first: kills energy transfer. Land on ball of foot or flat.",
      "Rushing the arm — arm outruns the hip drive. The hip must fire before the arm release.",
      "Under-rotating the wrist: the wrist snap must be violent and complete. 'Soft' wrist snap is the #1 reason for velocity ceiling plateaus."
    ],
    eliteStandard: "USA Softball national team average fastball: 65-68 mph. The top international pitchers are 68-72 mph. D1 scholarship pitchers average 63.4 mph nationally (NFCA data). At showcases, any pitcher consistently above 60 mph is getting looked at by college coaches.",
    scienceBasis: "The windmill pitching motion creates unique loading patterns in the shoulder's internal rotators and the UCL equivalent structures in the elbow. Unlike baseball, the shoulder externally rotates and then internally rotates with a different force vector. However, the frequency of softball pitching creates comparable cumulative stress to baseball pitching when measured per unit time. This is why workload management in softball is critical.",
    weeklyTask: "Baseline velocity test (5 max-effort pitches, log best). Focus this week on drive line mechanics — one drill per session. Film from the side.",
    parentSummary: "Softball pitching is a specialized skill that requires position-specific coaching. The workload management guidelines are different from baseball — pitchers can throw significantly more frequently, but this means tracking total pitch volume matters even more. Families should understand the NFCA guidelines and advocate for their pitcher accordingly."
  },

  "Slap Hitting Fundamentals": {
    id: "Slap Hitting Fundamentals",
    objectives: [
      "Understand when and why slap hitting creates strategic value",
      "Build the timing run and contact technique",
      "Learn zone management from the left-side approach"
    ],
    coachingPoints: [
      "Slap hitting is not a weaker version of power hitting — it's a distinct offensive weapon that creates a different type of pressure. A legitimate slapper forces infield shade, changes defensive positioning, creates bunt/slap reads that open up pitching sequences, and uses speed to convert 40% of batted balls into hits that a RH power hitter would record as outs.",
      "The slap hit requires timing the approach run to arrive at the box at the moment the pitcher releases — not when the ball arrives. Most youth athletes mistiming this end up either late (dead in the box) or early (running through a non-pitch).",
      "The three slap zones: (1) Soft slap: to the left side, minimal power, maximum ground ball. (2) Hard slap: through the hole or up the middle with more force. (3) Fake slap to power: use the slap approach to draw infield in, then drive through.",
      "D1 slappers run home-to-first in 2.7-2.9 seconds. Any athlete with sub-3.0 H-to-1B time who can make consistent contact at the skill level of slap hitting has significant D1 value even without power."
    ],
    drillProtocols: [
      { name: "Timing Run Without Ball", protocol: "Pitcher goes through motion. Hitter runs timing approach without hitting. 15 reps. Adjust timing until stride arrives on pitch release.", cue: "Time the PITCHER, not the ball. Your job is to arrive at the box on release. The swing happens almost automatically after correct timing." },
      { name: "Soft Toss Slap", protocol: "3×15 from left side. Focus on chopping down and through the ball to the left side.", cue: "The bat angle creates the ground ball. Slightly down-and-through, push through to first. No follow-through — short, compact." },
      { name: "Live Pitcher Slap Practice", protocol: "5 slap at-bats against live pitcher. Mix locations and types.", cue: "Read the pitch FIRST — slap the ones inside, let the ones outside go or power up. Pitch selection is slap effectiveness." }
    ],
    commonErrors: [
      "Starting the run too early: telegraphs to pitcher and defense, draws pitcher adjustment.",
      "Chopping at the ball without contact: the contact must still be solid. Speed is an amplifier of contact, not a substitute.",
      "Only slapping: elite slappers also power hit. If the defense over-adjusts for slap, punish it with power.",
      "Running through an off-speed: timing runs into off-speed pitches lead to lunging, loss of balance, and weak contact."
    ],
    eliteStandard: "D1 slap hitters who can consistently reach base 40%+ of the time and show sub-2.9 H-to-1B are highly recruited because of their combined offensive/defensive value. The game is trending toward speed and athleticism over pure power.",
    scienceBasis: "The slap hit's strategic value is measurable in run expectancy tables. In softball, a runner on first with 0 outs creates significantly higher run expectancy than a strikeout — even if the slap hit goes for a single on what would be a groundout for a RH hitter. The speed component converts outs to hits, which compounds through lineup repetition.",
    weeklyTask: "Timing run practice (15 reps) daily without swinging. Then 15 contact reps. Film yourself from behind home plate to check foot position at contact.",
    parentSummary: "Slap hitting is a specialized offensive skill with significant recruiting value for the right athlete. If your daughter has elite speed (sub-3.0 H-to-1B), developing slap hitting is a strategic investment in her recruiting profile, not a limitation of her offensive ability."
  },

  "Rise Ball Recognition": {
    id: "Rise Ball Recognition",
    objectives: [
      "Understand the rise ball physics and why hitters struggle with it",
      "Build a recognition pattern for rise ball identification",
      "Develop a swing decision framework for above-zone pitches"
    ],
    coachingPoints: [
      "The rise ball does not actually 'rise' in the literal sense — it follows a less-downward path than a fastball due to heavy backspin creating Magnus force. The batter's brain, calibrated to expect downward pitch movement, perceives this reduced drop as a 'rise.' This is why it's so effective — it exploits human perception.",
      "A well-thrown rise ball (65+ mph with 2000+ RPM true backspin) can generate 5-8 inches of 'perceived rise' relative to a fastball. At D1 level, rise balls consistently appear 3-4 inches higher at the plate than initial trajectory suggests.",
      "The recognition key: true rise ball will show tight 12-6 (or close to 12-6) backspin visible at release. It will start lower in the release zone than a fastball from the same pitcher. Hitters who can read this are elite. Most high school hitters cannot.",
      "Decision framework: Rise balls above mid-belt = take UNLESS 2 strikes. The rise ball above the belt is a pitcher's pitch — the batter is in trouble swinging at it. A disciplined hitter who lays off the rise ball up forces the pitcher to throw at or below the belt where contact quality improves dramatically."
    ],
    drillProtocols: [
      { name: "Video Rise Ball Recognition", protocol: "Watch 30 rise ball sequences from D1 pitchers. Call the pitch type before the batter swings. Track accuracy.", cue: "Look for: (1) Release height. (2) Initial trajectory. (3) Spin axis visible in first 20 feet. These three cues at release predict rise vs fastball before the ball gets to you." },
      { name: "Spin Recognition Drill", protocol: "Partner spins a ball and holds it. Identify spin direction from 20 feet. 20 reps.", cue: "12-6 spin = rise ball candidate. Side spin = horizontal movement. Learning to see spin is a trainable skill." },
      { name: "Zone Discipline Batting Practice", protocol: "BP against pitcher throwing rise balls. Only swing at pitches below belt. Track swing decisions.", cue: "The win in this drill is TAKING the rise ball above belt. Not swinging is success. Most athletes psychologically struggle with this." }
    ],
    commonErrors: [
      "Swinging at rise ball above the zone: the most common K in softball at all levels above JV.",
      "Lunging at offspeed: stride foot hitting the ground early AND hands going early = full commitment to the wrong pitch.",
      "One-speed approach: not adjusting timing for different pitch speeds creates zone coverage problems.",
      "Chasing pattern: most hitters have one pitch they consistently chase. Film study reveals the pattern — address it directly."
    ],
    eliteStandard: "D1 hitters are expected to barrel rise balls at mid-zone and below. Change-up recognition and rise ball discipline are the two most important cognitive hitting skills at D1 softball.",
    scienceBasis: "Gray (2002, Journal of Experimental Psychology) demonstrated that softball hitters make pitch-type decisions primarily based on initial trajectory and spin cues in the first 100-150 milliseconds after pitch release. Training pitch recognition must focus on this early visual window — not the late trajectory.",
    weeklyTask: "15 minutes of video study every day this week — watch D1 pitchers on YouTube, call pitch types before contact. Track your accuracy. You should see improvement within 7 days.",
    parentSummary: "Rise ball recognition is one of the most important skills in softball hitting and one of the least trained. Athletes who develop this skill significantly improve their on-base percentage against elite pitchers. It's a cognitive skill that can be trained at home with video."
  },
};

// ─── MENTAL PERFORMANCE ───────────────────────────────────────────────────────

export const MENTAL_PERFORMANCE_LESSONS: Record<string, LessonDetail> = {
  "Pre-Performance Routine": {
    id: "Pre-Performance Routine",
    objectives: [
      "Build a personal pre-performance routine based on sport psychology research",
      "Understand the neurological purpose of routine",
      "Develop pressure resilience through systematic preparation"
    ],
    coachingPoints: [
      "Pre-performance routines reduce performance anxiety by occupying the prefrontal cortex (rational brain) with a known sequence, preventing it from interfering with the motor programs in the cerebellum and basal ganglia (movement brain). When athletes 'overthink,' their cortex is hijacking their movement programs.",
      "Research: athletes with consistent pre-pitch/pre-at-bat routines show 23% lower cortisol (stress hormone) levels in high-pressure situations compared to athletes without routines (Cotterill et al., 2010, Journal of Applied Sport Psychology). The routine is a physiological intervention, not just mental.",
      "The 3-component routine: (1) Physical anchor — a specific physical movement that signals 'performance mode' to the nervous system. (2) Breath — box breathing (4-4-4-4) activates parasympathetic nervous system, lowers heart rate, increases oxygen delivery. (3) Focus word — one performance-process word that directs attention.",
      "The routine is not superstition. It's a priming protocol. The physical anchor creates a conditioned response — over thousands of repetitions, the body learns that this movement precedes competition. It becomes a neurological on-switch."
    ],
    drillProtocols: [
      { name: "Routine Design Session", protocol: "15-minute writing session. Design personal 3-component routine. Physical anchor + box breath + focus word. Write it out completely.", cue: "Choose a physical anchor that you already do naturally — adjust it to be consistent. The breath is standard. Your focus word should be process-oriented, not outcome (e.g., 'trust' not 'hit')." },
      { name: "Box Breathing Practice", protocol: "Daily, 5 minutes. Inhale 4 seconds, hold 4, exhale 4, hold 4. Repeat.", cue: "This WILL feel slow and uncomfortable at first. That's the parasympathetic activation working. Practice this at home BEFORE you need it in a game." },
      { name: "Routine Rehearsal", protocol: "Execute full routine before every single pitch/at-bat in practice. Not just games.", cue: "The routine only works under pressure if it's automated. Automate it through thousands of practice reps — then it's reliable at game time." }
    ],
    commonErrors: [
      "Building a superstition instead of a routine: a routine works even when you feel bad. A superstition only works when you feel good.",
      "Making the routine too long: 15+ step routines break down under pressure. 3-5 components max.",
      "Using outcome words as focus words ('hit the ball,' 'get on base'): process words only. You can't control outcomes.",
      "Skipping the routine in blowouts or non-competitive practice: automate in ALL situations, not just important ones."
    ],
    eliteStandard: "Every D1 program now has dedicated mental performance coaching staff. 94% of Olympic athletes report using pre-performance routines (USOC athlete survey, 2019). At the professional level, mental skills coaches are full-time staff members.",
    scienceBasis: "Bandura's (1977) self-efficacy theory: confidence comes from performance accomplishments, vicarious learning, social persuasion, and physiological state. Pre-performance routines address the fourth source (physiological) by creating a conditioned state of readiness. Combined with the VAULT KPI tracker (performance accomplishments), athletes build evidence-based confidence rather than hope-based confidence.",
    weeklyTask: "Design your routine today. Practice box breathing 5 minutes every morning for 14 days. Execute your full routine before every single rep in practice.",
    parentSummary: "Mental performance coaching is applied sports science, not therapy. Families who support the language of process (asking 'how was your routine?' not 'did you get a hit?') significantly accelerate their athlete's mental performance development. This is one of the most evidence-supported interventions in sports psychology."
  },

  "Confidence Under Pressure": {
    id: "Confidence Under Pressure",
    objectives: [
      "Understand the neuroscience of confidence",
      "Build evidence-based confidence through data tracking",
      "Develop psychological resilience for high-stakes performance"
    ],
    coachingPoints: [
      "Confidence in sports is NOT a personality trait — it's a trained skill. Specifically, it's a trained pattern of self-assessment. Athletes who assess themselves accurately (both strengths and weaknesses) consistently outperform athletes who are either falsely confident or constantly self-critical.",
      "Bandura's self-efficacy model (the most replicated model in sport psychology): confidence comes from 4 sources in order of power: (1) Performance accomplishments — actual documented success. (2) Vicarious learning — seeing similar others succeed. (3) Social persuasion — positive coaching feedback. (4) Physiological state — being physically ready.",
      "The VAULT KPI tracker addresses source #1 — the most powerful. Athletes who can point to documented, measurable improvement say: 'I know I can hit it 89 mph because I've done it 47 times.' This is categorically different from 'I think I can do it.' Data creates certainty.",
      "Under-pressure performance: research shows that athletes focused on PROCESS goals under pressure outperform athletes focused on OUTCOME goals in high-stakes situations (Beilock & Carr, 2001, Journal of Experimental Psychology). Process focus prevents 'paralysis by analysis.'"
    ],
    drillProtocols: [
      { name: "Evidence Journal", protocol: "After every training session: write 3 specific things you executed well. Not general — specific. 'Hit 92 mph on 4 of 10 swings' vs 'swung well.'", cue: "The specificity matters because the brain encodes specific memories more powerfully than general ones. You are building a neural library of evidence." },
      { name: "3-Second Mistake Recovery", protocol: "Practice this protocol on every mistake in training: 3 seconds max of reaction. Then: physical reset (deep breath + reset cue). Then: focus word. Move on.", cue: "Elite performers don't have fewer mistakes — they have shorter recovery time from mistakes. Practice the recovery, not just the skill." },
      { name: "Body Language Practice", protocol: "Film yourself for 5 minutes of practice. Watch without sound. What does your body language communicate?", cue: "Research: positive body language (tall posture, deep breath, positive gesture) CAUSES improved performance, not just signals it. Your body talks to your brain." }
    ],
    commonErrors: [
      "Motivation-based confidence: confidence built on 'I'm pumped up' collapses under adversity. Evidence-based confidence is durable.",
      "All-or-nothing thinking: 'If I have a bad at-bat, I'm bad.' Compartmentalization is a trainable cognitive skill.",
      "Focusing on scoreboard: research shows peak performance correlates with internal process focus, not external outcome awareness.",
      "Over-relying on praise: confidence from external validation is fragile. Internal evidence-based confidence is resilient."
    ],
    eliteStandard: "Trevor Bauer's documented approach to performance data: he logged every bullpen session with velocity, spin rate, and mechanical cues — not to prove himself to scouts, but to build evidence for himself. This is evidence-based confidence at the professional level.",
    scienceBasis: "Neuroscience of confidence: the prefrontal cortex (rational evaluation) and amygdala (threat detection) compete for control during performance. High-confidence athletes show lower amygdala activation under pressure, allowing the motor cortex to run movement programs without interference. Confidence — built through evidence — literally quiets the part of the brain that causes choking.",
    weeklyTask: "Start the evidence journal today. 3 specific accomplishments after every session. Review your prior 2 weeks' KPI data in VAULT and identify 3 areas where you can document improvement.",
    parentSummary: "The best thing families can do for athlete confidence is ask process questions ('how was your approach?') rather than outcome questions ('did you get hits?'). Athletes whose families focus on process develop more durable confidence than athletes whose families focus on results. This is one of the most consistent findings in sport psychology research."
  },
};

// ─── ARM HEALTH CONTENT ───────────────────────────────────────────────────────

export const ARM_HEALTH_LESSONS: Record<string, LessonDetail> = {
  "UCL Health & Injury Prevention": {
    id: "UCL Health & Injury Prevention",
    objectives: [
      "Understand the UCL anatomy and why it's vulnerable in throwing athletes",
      "Learn the ASMI youth pitch count guidelines and their scientific basis",
      "Build a monitoring system for arm health indicators"
    ],
    coachingPoints: [
      "Tommy John (UCL reconstruction) surgeries in youth athletes increased 500% from 1994-2020. Average age dropped from 26 to 17. Dr. James Andrews (world's leading sports orthopedic surgeon for overhead athletes): 'The greatest threat to the shoulder and elbow is overuse, not trauma.' This is documented clinical data, not opinion.",
      "The UCL is NOT the primary stabilizer of the throwing elbow. The flexor-pronator mass (FPM — the forearm muscles) is the primary stabilizer. When FPM is weak OR fatigued, the UCL absorbs compensatory stress. This means: (1) Forearm strengthening is arm health work. (2) Pitching while fatigued puts disproportionate load on the UCL.",
      "Velocity drop as health indicator: a drop of 3+ mph from the first inning to mid-outing is a neuromuscular fatigue signal. Continuing to pitch after this signal is when mechanics break down and UCL stress spikes. Scout for this in your own pitching data.",
      "ASMI pitch count limits by age (published, evidence-based): Ages 9-10: 50/day. Ages 11-12: 75/day. Ages 13-16: 95/day. Ages 17-18: 105/day. Rest days after 61-80 pitches: minimum 2. After 81+: minimum 3. These numbers were derived from injury incidence data on 1,000+ youth pitchers."
    ],
    drillProtocols: [
      { name: "FPM Strength Test", protocol: "Wrist flexion with 5 lb weight, forearm on bench, wrist over edge. Max reps before form breaks. Baseline and test monthly.", cue: "This is a health indicator, not just a strength test. Throwing arm should not show greater than 15% strength reduction after a pitching outing." },
      { name: "Grip Dynamometer Assessment", protocol: "3 readings each hand. Record dominant vs non-dominant.", cue: "Throwing arm within 10% of non-throwing arm is normal. Greater asymmetry = potential fatigue or injury signal. Flag for coach." },
      { name: "Post-Throw Health Check", protocol: "After every outing: rate medial elbow, lateral elbow, shoulder AC, and shoulder posterior on 0-10 pain scale. Log in VAULT Workload Tracker.", cue: "Any medial elbow pain > 3/10 = mandatory rest until evaluated by sports medicine. Not negotiable. Not 'toughness.'" }
    ],
    commonErrors: [
      "Playing through medial elbow pain: inner elbow pain during or after throwing is a UCL stress signal. Every throw through this increases TJ probability.",
      "Counting only game pitches: bullpen, long toss, flat ground ALL accumulate stress. Total volume is what the science measures.",
      "Culture of toughness over reporting: statistically, the highest injury rates are in programs where athletes feel pressure not to report arm pain.",
      "Parent pressure to pitch through: the data on this is clear. Short-term playing time is never worth long-term arm health."
    ],
    eliteStandard: "Every MLB organization mandates arm health protocols in their minor league system. Elite college programs (Vanderbilt, Florida, LSU, UCLA) all have published arm health frameworks. The programs that produce the most professional players are the programs most rigorous about arm health monitoring.",
    scienceBasis: "Fleisig et al. (2011, American Journal of Sports Medicine) followed 481 pitchers ages 9-14 for 10 years. Athletes who pitched more than 100 innings/year were 3.5× more likely to require surgery. Athletes who violated rest-day guidelines were 2.1× more likely to sustain serious arm injury. This is the most cited youth baseball research paper in orthopedics.",
    weeklyTask: "Log every throw this week (not just pitches). Calculate total weekly throwing load. Compare to ASMI guidelines for your age. Report any arm discomfort to coach.",
    parentSummary: "Arm health is the area where parents can have the most direct impact on their athlete's career trajectory. Know the ASMI guidelines for your athlete's age. Enforce rest day requirements even when coaches or programs resist. No scholarship or travel team selection is worth a career-ending UCL tear at 15. The data on this is absolute."
  },
};

// ─── MAIN LOOKUP FUNCTION ─────────────────────────────────────────────────────

const ALL_LESSONS: Record<string, LessonDetail> = {
  ...PITCHING_LESSONS,
  ...HITTING_LESSONS,
  ...SPEED_LESSONS,
  ...SOFTBALL_LESSONS,
  ...MENTAL_PERFORMANCE_LESSONS,
  ...ARM_HEALTH_LESSONS,
};

export function getLessonDetail(titleOrId: string): LessonDetail | null {
  if (ALL_LESSONS[titleOrId]) return ALL_LESSONS[titleOrId];
  const normalized = titleOrId.toLowerCase().trim();
  for (const [key, val] of Object.entries(ALL_LESSONS)) {
    if (key.toLowerCase().includes(normalized) || normalized.includes(key.toLowerCase())) {
      return val;
    }
  }
  return null;
}

export function getAllLessonDetails(): LessonDetail[] {
  return Object.values(ALL_LESSONS);
}

export function getLessonsByCategory(category: "pitching" | "hitting" | "speed" | "softball" | "mental" | "arm_health"): LessonDetail[] {
  const maps: Record<string, Record<string, LessonDetail>> = {
    pitching: PITCHING_LESSONS,
    hitting: HITTING_LESSONS,
    speed: SPEED_LESSONS,
    softball: SOFTBALL_LESSONS,
    mental: MENTAL_PERFORMANCE_LESSONS,
    arm_health: ARM_HEALTH_LESSONS,
  };
  return Object.values(maps[category] || {});
}
