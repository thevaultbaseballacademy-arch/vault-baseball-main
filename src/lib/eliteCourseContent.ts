/**
 * VAULT™ Elite Course Content Library
 *
 * All lesson content is original VAULT™ curriculum based on:
 * - NSCA (National Strength & Conditioning Association) guidelines
 * - ASMI (American Sports Medicine Institute) published research
 * - ACSM (American College of Sports Medicine) position stands
 * - Published biomechanics literature (Journal of Strength & Conditioning Research,
 *   American Journal of Sports Medicine, Journal of Sports Sciences)
 * - Publicly documented methods from elite development organizations
 *
 * No proprietary coaching systems, registered trademarks, or copyrighted
 * training protocols from specific private organizations are reproduced.
 * All standards cited (velocity benchmarks, timing norms) are derived from
 * publicly available recruiting data (NCSA, Perfect Game public records,
 * Baseball Savant public data, published NCAA division standards).
 */

export interface LessonContent {
  id: string;
  deepDescription: string;
  keyPoints: string[];
  drills: { name: string; sets: string; reps: string; cue: string }[];
  coachingCues: string[];
  commonErrors: string[];
  scienceBacking: string;
  eliteStandard: string;
  weeklyTarget: string;
  parentNote?: string;
}

// ─── PITCHING / VELOCITY SYSTEM ────────────────────────────────────────────────

export const PITCHING_LESSONS: Record<string, LessonContent> = {
  "vs-1-1": {
    id: "vs-1-1",
    deepDescription: "Your velocity baseline is the most important number you'll collect this week. Not because it defines you — but because everything we do for the next 12 weeks is measured against it. Velocity is produced by a kinematic chain: ground → ankle → knee → hip → trunk → shoulder → elbow → wrist → fingers. Every link in that chain multiplies the output of the one before it. ASMI research shows elite pitchers generate 2.5× their bodyweight in ground reaction force at foot plant. That force travels up the chain, and by the time it reaches your fingertips, a tiny mechanical inefficiency anywhere in the chain costs you 2-5 mph.",
    keyPoints: [
      "Baseline protocol: 5 max-effort throws off a mound from the stretch. Record with Pocket Radar, Rapsodo, or reliable radar gun. Log your best reading — not average.",
      "The 5 mechanical checkpoints we'll train: (1) Back hip loaded at knee height. (2) Stride foot contact timing — hips must be ahead of shoulders. (3) Hip-shoulder separation of 35-45°. (4) Elbow height at foot strike — at or above shoulder line. (5) Balanced follow-through — finish over front knee.",
      "Published velocity benchmarks by level (Perfect Game/NCSA data): MLB: 93+ avg. AAA: 90-93. D1: 88-92. D2: 84-89. D3: 78-84. HS Varsity: 78-86. JV: 70-77. 14U elite: 68-73.",
      "Elite HS pitchers average 3-5 mph of velocity gain per full off-season training cycle. Mechanical improvements at 14-16 produce the fastest gains. After 20, gains are primarily physical (strength-based).",
    ],
    drills: [
      { name: "Hip Load Hold", sets: "3", reps: "10-sec hold each", cue: "Back knee tracks over ankle. Feel the glute of back leg loaded — like you're sitting on the back hip. This is your power storage position." },
      { name: "Knee-to-Knee Hip Turn", sets: "3", reps: "15 slow reps", cue: "Arms crossed over chest. Rotate ONLY the hips — back knee drives toward front knee. Shoulders stay square as long as possible." },
      { name: "Stride Line Walk", sets: "2", reps: "10 strides", cue: "Tape a line on the floor. Stride foot lands on or just inside the line. Landing too far off the line creates rotational inefficiency." },
    ],
    coachingCues: [
      "Ground into the rubber like you're pushing the earth away — velocity starts at your feet",
      "Load the hip, not just the leg — the glute creates the stored energy",
      "Hips first, always — if your shoulder opens before your foot plants, you're leaking velocity",
    ],
    commonErrors: [
      "Flying open: front shoulder opens before front foot plants. The single most common velocity killer at HS/youth level. Costs 3-7 mph and destroys command.",
      "Heel strike: landing on the heel kills ground force transfer. The stride foot must land toe-first or flat.",
      "Short arm action: not achieving full external rotation at layback. Velocity ceiling drops 4-6 mph without full ER.",
    ],
    scienceBacking: "Fleisig et al. (ASMI, 1995 and multiple follow-up studies) established the kinematic chain model for baseball throwing. The pelvis-to-thorax angular velocity (hip-shoulder separation mechanics) is the single strongest biomechanical predictor of ball velocity. Athletes with greater hip-shoulder separation produce significantly higher pelvis and trunk angular velocities, which directly drives elbow and hand speed.",
    eliteStandard: "D1 scholarship standard: 88+ RHP, 85+ LHP. Top 5% nationally (Pro Draft prospects): 95+. HS elite prospect: 85-90. JV/developing: 72-78.",
    weeklyTarget: "Complete baseline test. Log in VAULT KPI tracker. Film one side-view throw. Do hip load holds 3×/day.",
    parentNote: "Velocity is one tool in the complete athlete evaluation. Coaches recruit the complete athlete: velocity + command + makeup + academics. A 85 mph pitcher with elite command and a 3.8 GPA has more options than a 90 mph pitcher with poor command.",
  },

  "vs-1-2": {
    id: "vs-1-2",
    deepDescription: "Arm care is not optional maintenance — it's active performance training. The rotator cuff's primary job during throwing is deceleration, not acceleration. Your infraspinatus and teres minor must stop a 90+ mph arm swing in under 50 milliseconds. That is the highest recorded eccentric loading rate in sports biomechanics (Fleisig, ASMI). Without deliberate rotator cuff strength work, the labrum and UCL absorb that deceleration stress — and they're not designed for it. Dr. James Andrews' published data: 57% of youth Tommy John surgeries had no single traumatic event. It was cumulative stress without recovery. Your arm care routine IS your arm health insurance.",
    keyPoints: [
      "Pre-throw routine: 8-10 minutes. Purpose: raise tissue temperature, activate rotator cuff, improve glenohumeral mobility. NOT just a warmup — it's CNS and neuromuscular activation.",
      "Post-throw routine: 12-15 minutes. This is where adaptation happens. Muscle protein synthesis peaks post-exercise. The arm care work done here builds the structural durability that protects you.",
      "The 4 target structures: (1) Rotator cuff — infraspinatus, teres minor, subscapularis. (2) Flexor-pronator mass — the UCL's primary dynamic stabilizer. (3) Scapular stabilizers — lower/mid trapezius, serratus anterior. (4) Posterior shoulder — posterior capsule flexibility.",
      "Resistance band ER work: research (Reinold et al., 2004, American Journal of Sports Medicine) showed 3×15 external rotation at 90° abduction, performed consistently, reduces shoulder injury risk by 38% in overhead athletes.",
    ],
    drills: [
      { name: "Band External Rotation (90/90)", sets: "3", reps: "15 each arm", cue: "Upper arm parallel to floor, shoulder at 90°. Rotate forearm back slowly — 3-second eccentric. Never let the band pull you faster than controlled." },
      { name: "Prone YTW", sets: "2", reps: "10 each position", cue: "Face down on bench. Y: thumbs up, 30° above head. T: arms perpendicular. W: elbows at 90°. Only lift as high as you can WITHOUT shrugging." },
      { name: "Wrist Flexion/Extension", sets: "2", reps: "20 each direction", cue: "Forearm resting on bench, wrist hanging off edge. Full range. Light resistance. This targets the flexor-pronator mass — the UCL's guard." },
      { name: "Sleeper Stretch", sets: "2", reps: "30 seconds each side", cue: "Side-lying, arm at 90°. Use other hand to gently push throwing hand toward the floor. Feel posterior shoulder capsule stretch — never force it." },
    ],
    coachingCues: [
      "Never skip post-throw arm care when tired — that's when you need it most",
      "Shoulder blades must move independently — don't 'soldier up' through these exercises",
      "Any medial elbow pain (inner elbow) = stop immediately, see a sports medicine professional",
    ],
    commonErrors: [
      "Shrugging through YTW — compensating with upper traps instead of activating lower traps and rhomboids. The scapular stabilizers you need are lower, not upper.",
      "Too much resistance on bands — form breaks down at heavy resistance. 8-10 reps with good form beats 15 sloppy reps.",
      "Skipping the sleeper stretch — posterior capsule tightness is one of the top predictors of shoulder injury in overhead athletes.",
    ],
    scienceBacking: "Kibler et al. (2013, Journal of Shoulder and Elbow Surgery) established scapular dyskinesis (abnormal scapular movement) as a contributing factor in 67-100% of overhead athlete shoulder injuries. The serratus anterior and lower trapezius are the primary muscles responsible for scapular upward rotation — both targeted by the YTW routine.",
    eliteStandard: "D1 and professional programs prescribe arm care 365 days/year. Off-season: full routine daily. In-season: lighter version every day, full routine on rest days. There is no level of baseball or softball at which arm care becomes unnecessary.",
    weeklyTarget: "Complete arm care every single day this week — pre AND post any throwing. Log in VAULT workload tracker.",
    parentNote: "Arm care compliance is one of the first things college coaches ask about in evaluations. Athletes who demonstrate consistent arm care habits signal the maturity and self-discipline that programs want.",
  },

  "vs-2-1": {
    id: "vs-2-1",
    deepDescription: "Hip-shoulder separation is the rotational preloading of the trunk musculature. When the pelvis rotates before the thorax, the obliques and thoracolumbar fascia undergo elastic stretching — identical to stretching a rubber band. The recoil of this stored elastic energy, combined with the active muscle contraction that follows, produces rotational force that multiplies arm speed without additional arm effort. This is the highest-leverage velocity variable because it's essentially free energy from physics. ASMI data shows D1/pro pitchers average 43-48° of separation at front foot strike. Average high school pitcher: 22-28°. That 20° gap explains 4-8 mph of velocity difference independent of physical strength.",
    keyPoints: [
      "Peak hip-shoulder separation occurs at front foot strike — this is the moment that matters. Measure it: film from directly overhead. Draw a line across the hips and a line across the shoulders. The angle between them at foot contact is your separation number.",
      "To achieve separation you need 3 things working: (1) Hip mobility to allow early pelvis rotation. (2) Thoracic spine mobility to resist shoulder turn. (3) Timing — the hip turn must begin BEFORE the stride foot strikes the ground.",
      "The stretch-shortening cycle (SSC): When the trunk pre-loads into separation, the elastic energy stored is released in 10-20 milliseconds — faster than any voluntary muscle contraction. This is why athletes who 'throw hard' without separation plateau at 82-84 mph. The arm is working alone without the SSC boost.",
      "Med ball training is the most research-validated method to develop this motor pattern. The implement teaches the sequencing because throwing a 6-8 lb ball forces the body to use ground force and hip drive — you cannot arm-only a heavy med ball.",
    ],
    drills: [
      { name: "Hip Turn Only (no arm)", sets: "3", reps: "10", cue: "Arms crossed over chest. From loaded position: turn ONLY your hips to the target while your shoulders resist. Hold the separation moment for 2 seconds. Feel the oblique stretch." },
      { name: "Med Ball Rotational Scoop Throw (6-8 lbs)", sets: "4", reps: "8 each side", cue: "Load the back hip. Initiate by pushing the back foot into the ground. Hips turn — ball is just along for the ride. MAX intent. This teaches the sequence, not just the muscles." },
      { name: "Partner Hip Hold Drill", sets: "3", reps: "5", cue: "Partner places hands on your shoulders. You fire the hips while partner offers gentle resistance to shoulders. Exaggerates the feel of the separation moment." },
    ],
    coachingCues: [
      "Show your back hip to the target before your front shoulder opens — sequence is everything",
      "Quick hips, patient shoulders — the exact opposite of what most athletes naturally do",
      "The front shoulder is a door that stays closed until the last possible millisecond",
    ],
    commonErrors: [
      "Block rotation: hips and shoulders rotating together as one unit. No separation means no elastic energy storage. This is the primary velocity limiter at JV and below.",
      "Early front shoulder: opening before foot strike because the athlete is rushing. The brain wants to 'get to the release' — train the pause at separation.",
      "Stride foot pointing too far open: foot angle pointing toward home plate rather than toward first/third base closes the hip prematurely.",
    ],
    scienceBacking: "Stodden et al. (2001, Medicine & Science in Sports & Exercise) showed pelvis-thorax angular velocity (the rate at which the separation unwinds) is the single strongest predictor of ball velocity in skilled pitchers. Athletes with the highest pelvis-thorax angular velocities are not stronger — they have better elastic energy utilization through the SSC of the trunk musculature.",
    eliteStandard: "45°+ at foot strike = D1/Pro standard. 35-44° = solid HS Varsity. 20-30° = JV-level mechanics (room for major gains). Under 20° = fundamental pattern work needed before intensity loading.",
    weeklyTarget: "30 medicine ball rotational throws daily (15 each side). Film one throw per day from directly overhead and measure your separation angle on Day 1 vs Day 7.",
  },

  "vs-3-1": {
    id: "vs-3-1",
    deepDescription: "Pulldown training is the max-effort velocity expression phase of the VAULT Velocity System. After 2 weeks of mechanical foundation work (hip loading, separation, arm path) and 3 weeks of mechanics under moderate intent, your nervous system has been primed to express those patterns at maximum speed. The pulldown position (elevated mound or hill, throwing downhill at reduced distance of 60-90 feet) removes the need for stride mechanics and allows athletes to focus entirely on arm acceleration and release mechanics. Research from Driveline Baseball's published studies and similar populations shows an average of 3.2 mph velocity increase in controlled pulldown training blocks (4-6 weeks, 3×/week).",
    keyPoints: [
      "Pulldown position: elevated surface (mound, hill), throwing to flat ground at 60-90 feet. The downhill angle increases hip drive carryover to the arm and allows max-intent without mechanical breakdown from fatigue.",
      "Weighted ball protocol context: overload (heavy) balls build arm strength and late-deceleration capacity. Underload (light) balls train arm speed and fast-twitch fiber recruitment. Research: Fleisig et al., 2011, showed 6-7 oz balls are the safe overload threshold for HS athletes. Under-16 athletes: no overload balls without certified coach supervision.",
      "Intent is the training variable: the central nervous system responds to effort. Max-intent throws produce motor unit recruitment patterns that moderate-intent throws cannot replicate. This is why 'throwing easy to stay healthy' during an off-season velocity block is counterproductive.",
      "Recovery requirement: CNS recovery between max-intent sessions is 48-72 hours minimum. Three pulldown sessions per week with rest days between is the research-supported maximum volume for velocity gains without overuse.",
    ],
    drills: [
      { name: "Flat Ground Buildup (10→70%→90%→100%)", sets: "1", reps: "20 throws progressive", cue: "Don't skip the ramp-up. 5 throws at 50%, 5 at 70%, 5 at 90%, then 10 max-intent. The body needs this neuromuscular activation sequence." },
      { name: "Pulldown Series", sets: "3-4", reps: "5 max throws each set", cue: "From elevated position, 60-90 ft target. MAXIMUM intent every throw. Rest 90 seconds between throws. This is velocity training, not conditioning." },
      { name: "Velocity Check", sets: "1", reps: "3 fresh throws post-pulldown", cue: "Record velocity after 5-minute rest. Post-activation potentiation often shows higher readings here than pre-session. Log both." },
    ],
    coachingCues: [
      "Max effort every rep — this is not a time for 'just throwing'",
      "If your velocity drops more than 3 mph from throw 1 to throw 5, you're done for the day — don't push through CNS fatigue",
      "Post-session arm care is mandatory within 30 minutes of last throw",
    ],
    commonErrors: [
      "Continuing past CNS fatigue: velocity drops signal the nervous system is depleted. Training through this builds bad motor patterns, not velocity.",
      "Skipping the ramp-up: cold max-effort throws are the leading cause of sudden arm injuries.",
      "Using pulldowns for conditioning: these are CNS power sessions, not endurance work. Treat every throw like a max vertical jump.",
    ],
    scienceBacking: "Sale (1992, Medicine & Science in Sports & Exercise) established that maximum voluntary muscle contractions (MVC) produce significantly higher motor unit recruitment and fast-twitch fiber activation than sub-maximal contractions. This is the physiological basis for intent-based training — the nervous system must be trained at the intensity level you want it to perform at.",
    eliteStandard: "MLB/D1 pitchers use max-intent bullpens and pulldowns as their primary velocity maintenance tool in-season and primary velocity development tool in-season. This is not a youth-only development method — it's the method used at every level of the game.",
    weeklyTarget: "3 pulldown sessions (Tuesday/Thursday/Saturday). Max 5 throws per set, 3-4 sets. Log every velocity reading. Rest days = arm care only.",
  },
};

// ─── HITTING CONTENT ───────────────────────────────────────────────────────────

export const HITTING_LESSONS: Record<string, LessonContent> = {
  "hev-1-1": {
    id: "hev-1-1",
    deepDescription: "Exit velocity is the most consequential offensive metric at every level of baseball and softball. It's the product of two primary inputs: bat speed at contact and centering efficiency (how close to the barrel's sweet spot the ball is struck). Statcast data from 2015-2024 shows a direct relationship: every 5 mph increase in exit velocity corresponds to approximately +.070 expected batting average and +.150 expected slugging percentage. At the high school and travel level, exit velocity has become the single most requested data point from college coaches — above batting average, OPS, or any counting stat. A player hits .180 in a tough travel league and 95 mph exit velocity gets more callbacks than a .420 hitter from a weak schedule with 72 mph.",
    keyPoints: [
      "Exit velocity is primarily determined by bat speed (65%), contact quality (20%), and attack angle efficiency (15%). Bat speed is trained. Contact quality is learned. Attack angle is optimized.",
      "Bat speed and exit velocity relationship (Driveline Hitting data, published 2020): 1 mph bat speed increase = ~1.2 mph exit velocity increase. Target: 70+ mph bat speed for HS varsity level. D1 typical: 74-82 mph. MLB average: 76-80 mph.",
      "Intent matters more than technique for early development: research by Hitting Performance Lab showed athletes given 'swing as hard as possible' instructions increased bat speed 3.2 mph more over 6 weeks vs technique-focused group. The CNS responds to intent.",
      "Measurement standard: Rapsodo Hitting, HitTrax, or Blast Motion for bat speed. Consistent measurement protocol is more important than the device — same location, same tee height, same approach every session.",
    ],
    drills: [
      { name: "Max Effort Tee Series", sets: "3", reps: "10 swings", cue: "Every swing at 100% effort. This isn't BP — it's velocity training. Contact quality is irrelevant here. Train the nervous system to swing harder." },
      { name: "Overload/Underload Bat Training", sets: "2", reps: "10 each weight", cue: "Overload (heavier bat): builds strength at end-range. Underload (lighter): trains peak velocity and fast-twitch recruitment. Contrast within the same session." },
      { name: "Attack Angle Tee Work", sets: "2", reps: "15", cue: "Set tee at front knee height. Swing slightly upward through contact — barrel angle 8-15° up at contact. Feel the barrel 'under and through' the ball, not 'down to it.'" },
    ],
    coachingCues: [
      "The barrel wants to stay in the zone as long as possible — shallow in, long through",
      "Back hip drives through the ball — the hands follow the hip, not the other way",
      "Extension THROUGH contact — don't quit at the ball, accelerate through it",
    ],
    commonErrors: [
      "Casting the barrel: hands push away from the body before hip rotation. Reduces bat speed by 5-12 mph and creates poor contact angles.",
      "Tension in forearms at setup: grip pressure should be 4-5/10 at setup, 7-8 at contact only. Chronic grip tension pre-swing reduces bat speed by limiting wrist snap at contact.",
      "Collapsing the back knee downward: creates a downward swing attack angle, reducing hard-contact rate on fastballs significantly (Statcast data shows optimal attack angle for hard contact is +8° to +15° upward).",
    ],
    scienceBacking: "Fleisig et al. (2009) and subsequent Driveline/HitTrax research established the kinematic parameters of efficient hitting. Rotational power (measured by pelvis angular velocity) is the primary driver of bat speed, which directly drives exit velocity. Athletes who demonstrate higher ground force production (GRF) in their swing show higher bat speed independent of arm and forearm strength.",
    eliteStandard: "MLB average exit velocity (Statcast 2024): 88.4 mph. MLB 90th percentile: 98+ mph. D1 typical range: 88-96 mph. D2: 82-90. HS Varsity: 78-88. JV: 68-78. 14U elite: 72-80. Softball D1: 78-86. Softball HS Varsity: 68-78.",
    weeklyTarget: "100 max-effort swings daily (50 tee, 50 front toss). Log EV readings every session. Track your top 3 EV per session in VAULT KPI tracker.",
    parentNote: "Exit velocity development is the area where parental investment in tools (quality tee, hitting net, radar) pays the biggest dividends. 20 minutes of focused max-effort tee work daily is more valuable than 2 hours of casual batting practice.",
  },
};

// ─── SPEED & AGILITY CONTENT ───────────────────────────────────────────────────

export const SPEED_LESSONS: Record<string, LessonContent> = {
  "sa-1-1": {
    id: "sa-1-1",
    deepDescription: "The 60-yard dash is the primary athletic metric for baseball recruiting at every level above youth. It's simple, universal, and almost impossible to inflate. A 6.7 means 6.7 everywhere. The dash has three distinct phases with different training demands: Acceleration (0-20 yd): body angle 45°, pure force production. This phase determines your first 20 yards — where most baserunners and outfielders live. Transition (20-40 yd): body rises, stride frequency shifts. Max Velocity (40-60 yd): fully upright, stride length maximized, mechanics must be relaxed. Most athletes only train one phase. Elite programs train all three.",
    keyPoints: [
      "Ground force application is the primary determinant of acceleration. You don't 'run fast' — you push hard. Ralph Mann's USOC sprint research: elite sprinters apply 4-5× their bodyweight into the ground during acceleration. The angle of force application determines your direction of movement.",
      "Arm action drives leg turnover. Research confirms arm drive accounts for 25-30% of running velocity. Tight 90° angle, aggressive backward swing, elbows driving through — this is not optional form coaching. It's physics.",
      "Published 60-yard benchmarks (Perfect Game, NCSA): D1 OF standard: sub-6.7 consistently. D1 IF: sub-6.8. D2: 6.8-7.0. D3: 7.0-7.2. HS elite: 6.7-6.9. JV: 7.0-7.3. 14U elite: 7.0-7.4. Softball 60yd: D1 OF: sub-7.2. D1 IF: sub-7.4.",
      "Timing improvement rates: with focused sprint mechanics training, athletes at 7.0-7.3 typically show 0.2-0.4 second improvements in 8-12 week speed blocks. Improvements above this require physical maturation (strength, power) in addition to mechanics.",
    ],
    drills: [
      { name: "Wall Drive Drill", sets: "4", reps: "8 drives each leg", cue: "Hands on wall at shoulder height. Body at 45°. Drive the knee UP and THROUGH — not forward. Back leg extends FULLY at every rep. Core stays rigid." },
      { name: "Falling Start", sets: "6", reps: "20-yard sprint", cue: "Stand tall. Lean forward until gravity forces your first step — then ATTACK. That lean angle is your optimal acceleration body position." },
      { name: "A-March → A-Skip → A-Run Progression", sets: "2", reps: "20 yards each", cue: "March: exaggerated high knee, dorsiflexed foot, pawing action. Skip: same pattern with rhythm. Run: apply the pattern at speed. This teaches the sprint cycle mechanically." },
    ],
    coachingCues: [
      "Push the ground backward and downward — you move forward because of Newton's third law",
      "Drive the arm BACK aggressively — the forward swing happens automatically",
      "Stay long through the first 10 steps — don't stand up too early or you'll lose ground force",
    ],
    commonErrors: [
      "Bouncing vertically during acceleration: wasted energy going up instead of forward. The body should be rising gradually, not bouncing.",
      "Arms crossing the midline: elbows swinging across the body instead of front-to-back. Causes rotational energy loss and reduces stride frequency.",
      "Looking down: head position affects body angle. Eyes should be focused 10-15 yards ahead during acceleration.",
    ],
    scienceBacking: "Mann & Herman (1985) and Weyand et al. (2010) established that elite sprint performance is determined primarily by how much force the athlete can apply to the ground per unit of time (force application rate), not stride frequency alone. This explains why strength training (specifically trap bar deadlift and broad jump) directly improves sprint times — it improves force production capacity.",
    eliteStandard: "Sub-6.7 (60yd) opens every door in baseball recruiting. Sub-6.5 is elite/draft-worthy. In terms of home-to-first time (the in-game measurable): LHH sub-4.0 is elite. RHH sub-4.2 is above average.",
    weeklyTarget: "4 sprint sessions this week. 2 acceleration-focused (0-20yd), 2 full 60-yard timed. Log all times in VAULT KPI tracker.",
    parentNote: "Speed is the most developable physical tool for athletes ages 13-17. Strength training (specifically lower body) is the fastest path to speed improvement — not just sprinting more.",
  },
};

// ─── SOFTBALL CONTENT ─────────────────────────────────────────────────────────

export const SOFTBALL_LESSONS: Record<string, LessonContent> = {
  "sp-pitch-1": {
    id: "sp-pitch-1",
    deepDescription: "Softball pitching is a lower-body-driven skill. The windmill motion produces force from the ground up through the hip and leg drive, into the trunk rotation, and finally through the arm circle and wrist snap. The most common velocity ceiling in youth and high school softball pitchers is not their arm — it's insufficient lower body drive. Research published in the Journal of Sports Science and Medicine shows that softball pitchers at D1 level generate 2.1× bodyweight in vertical ground force, significantly higher than sub-elite pitchers. The lower body is your engine.",
    keyPoints: [
      "Published softball velocity benchmarks: D1 standard: 61-68 mph. D2: 58-64. D3: 54-60. HS Varsity: 52-60. JV/developing: 46-54. 14U elite: 50-58. 12U elite: 42-50.",
      "The drive leg (back leg for most pitchers) generates the primary push forward. The stride length in elite pitchers is 80-100% of their body height. Athletes with short strides lose significant power — the longer the stride, the more ground force is applied.",
      "Wrist snap adds 4-8 mph at the end of the pitch. But only if the rest of the chain is generating sufficient force first. Teaching wrist snap to a pitcher with poor hip drive is like adding a turbocharger to an engine with no fuel.",
      "Softball's workload reality: pitchers in softball face significantly higher pitch count demands than baseball pitchers. This makes arm care and recovery protocols even MORE critical in softball, not less.",
    ],
    drills: [
      { name: "Stride Length Measure", sets: "3", reps: "5 pitches each", cue: "Chalk-mark your landing spot. Measure the distance. Target: 85-100% of your body height. Short strides = power leak." },
      { name: "Bucket Drive Drill", sets: "3", reps: "10", cue: "Stand with back foot on low bucket or step. Exaggerate the push-off. Feel the drive leg fully extend before arm circle begins." },
      { name: "K-Position Hold", sets: "3", reps: "5 holds", cue: "At K-position (arm vertical, aligned with stride leg at 12 o'clock), pause. Check: hips are fully forward, front foot planted, weight transferring. This is your power transfer moment." },
    ],
    coachingCues: [
      "Push the ground, not the ball — velocity comes from your legs first",
      "Long stride, strong push — if your foot isn't landing near the front rubber edge, you're leaving mph on the field",
      "Hips forward before the arm comes through — pitchers who lead with the arm lose velocity",
    ],
    commonErrors: [
      "Arm circle too narrow: rushing the arm circle without full extension at 6 o'clock position. A tight circle reduces the velocity potential of the whip effect.",
      "Upper body tilt: leaning the trunk sideways instead of staying upright. Reduces drive leg push-off efficiency.",
      "Overstriding toe-first: landing toe-first AND overstriding creates instability at landing. Plant solidly on ball of foot at target stride length.",
    ],
    scienceBacking: "Werner et al. (2006, Journal of Shoulder and Elbow Surgery) analyzed softball pitching biomechanics and found that lower extremity drive velocity was the primary predictor of ball speed, with upper extremity mechanics serving as an amplifier of the ground-generated force. Athletes with greater hip forward velocity at ball release threw significantly faster.",
    eliteStandard: "Rise ball velocity D1 standard: 58+ mph with 15+ inches of vertical movement (Rapsodo). Change-up effectiveness: 8-12 mph differential from fastball. Command: 60%+ strike rate in game situations.",
    weeklyTarget: "Measure stride length every session this week. Film from the side. Post for coach review. Target: land at 85%+ of body height on every pitch by end of week.",
    parentNote: "Softball pitchers have the highest per-capita injury risk of any youth sport position due to pitch volume demands. Tracking pitch counts and enforcing rest days is parental responsibility as much as coaching responsibility.",
  },

  "sp-hit-1": {
    id: "sp-hit-1",
    deepDescription: "Softball hitting has unique mechanical demands compared to baseball — the shorter reaction time (60 mph pitch reaches the plate in 0.45 seconds vs baseball's 0.45 seconds at 90 mph, but the release point is 43 feet vs 60.5 feet) means the pitch recognition window is actually shorter in softball. The decision to swing must be made earlier. This creates a premium on pre-pitch routine, pitch recognition, and pitch-type planning. The physical mechanics of the swing are similar to baseball, but the timing demands require different cognitive training.",
    keyPoints: [
      "Reaction time benchmark: at 60 mph from 43 feet, the hitter has 0.43 seconds from release to contact. The decision window is the first 0.25 seconds. After that, the swing is committed. This is why count management and pitcher tendency research matters enormously in softball.",
      "Rise ball recognition is the elite skill that separates levels. The spin of the rise ball looks like a fastball for the first 2/3 of its flight. Hitters who can't recognize rise balls get dominated at D1. Practice: Rapsodo data + video film study of spin patterns.",
      "Exit velocity benchmarks for softball: D1: 78-86 mph. D2: 73-80. D3: 67-74. HS Varsity: 62-72. JV: 55-65. 14U elite: 62-70.",
      "Slapper vs traditional hitter: left-handed slapper adds running speed to offensive value. A .300 hitter who runs 2.6 home-to-first creates infield-hit value that pure EV stats don't capture. Both tools have elite recruiting value at different positions.",
    ],
    drills: [
      { name: "Rapid-Fire Front Toss", sets: "4", reps: "15", cue: "Reduce the reaction window intentionally. Shorter distance front toss forces faster decision-making. This trains the decision pathway, not just swing mechanics." },
      { name: "Spin Recognition Drill", sets: "3", reps: "10", cue: "Colored dot on ball. Identify dot color/position as quickly as possible during toss. Builds pitch recognition visual processing." },
      { name: "Walk-Up Timing Drill", sets: "3", reps: "8", cue: "Exaggerate the stride timing. Front foot down EARLY — let the hands stay back. The stride is a timing mechanism, not a power generator." },
    ],
    coachingCues: [
      "See the spin before you decide — your brain can recognize the pitch faster than you think, but only if you train it",
      "Front foot down early, hands back late — the stride and the hands are separate events",
      "Stay tall through the zone — don't collapse or dive at the ball",
    ],
    commonErrors: [
      "Lunging at offspeed: stride foot hitting the ground early AND hands going with it. Creates a full-body commitment that can't adjust.",
      "Swinging at the rise ball above the zone: rise ball recognition is trainable. Most hitters chase it because they're pattern-matching the spin — it looks like a fastball in the middle of the zone and then disappears.",
      "One-speed approach: not adjusting timing for different pitch speeds. Rise ball timing vs change-up timing requires mental flexibility.",
    ],
    scienceBacking: "Gray (2002, Journal of Experimental Psychology) demonstrated that baseball/softball hitters make pitch-type decisions primarily based on initial trajectory and spin cues in the first 100-150 milliseconds after pitch release — before the ball has traveled even 1/3 of the way to the plate. Training pitch recognition must therefore focus on this early visual window.",
    eliteStandard: "D1 hitters are expected to barrel rise balls at mid-zone and below. The change-up is the pitch most D1 pitchers use to get elite contact hitters out. Rise ball recognition + change-up patience = offensive survival at D1.",
    weeklyTarget: "50 swing reps against varied pitch types. 10 minutes of video study of your own at-bats looking for pitch recognition patterns.",
  },
};

// ─── MENTAL PERFORMANCE CONTENT ────────────────────────────────────────────────

export const MENTAL_PERFORMANCE_LESSONS: Record<string, LessonContent> = {
  "mp-1-1": {
    id: "mp-1-1",
    deepDescription: "Mental performance is the multiplier on physical tools. A pitcher with 88 mph and elite mental performance competes differently than one with 88 mph and poor mental performance. The good news: mental performance is trainable. It's a skill, not a trait. Research in applied sport psychology (Vealey, 2007; Hanton & Jones, 1999) consistently shows that mental skills training produces statistically significant improvements in performance, especially under pressure. The VAULT Mental Performance system is structured around the 5 performance pillars: Focus, Confidence, Emotional Control, Competitive Identity, and Process Orientation.",
    keyPoints: [
      "Pre-performance routines are the foundation. Research: athletes with consistent pre-pitch/pre-at-bat routines show 23% reduction in cortisol (stress hormone) spikes in high-pressure situations (Cotterill et al., 2010, Journal of Applied Sport Psychology).",
      "Confidence is built from evidence, not words. The brain responds to real accomplishment data. This is why the VAULT KPI tracker matters beyond just numbers — it builds confidence through documented evidence of improvement.",
      "Emotional speed vs emotional suppression: elite performers don't suppress negative emotions. They process them faster and return to performance state more quickly. The goal is recovery time after mistakes, not never making them.",
      "Visualization with physical response: mental rehearsal of successful performance at game intensity actually fires the same motor neurons as physical practice (Ranganathan et al., 2004, Neuropsychologia). Quality visualization is practice.",
    ],
    drills: [
      { name: "Pre-Performance Routine Design", sets: "Daily", reps: "5-7 min", cue: "Build a personal routine: breathing (box breath: 4-4-4-4), physical cue (specific gesture or movement), focus word or phrase. Repeat until it's automatic. The routine is your reset button." },
      { name: "Visualization Session", sets: "Daily", reps: "10 min", cue: "Specific scene: pick ONE at-bat or ONE inning. See it in first person, in real time, with full sensory detail — crowd, sounds, field smell. See yourself executing your process perfectly." },
      { name: "Mistake Recovery Protocol", sets: "Practice daily", reps: "Any mistake in practice", cue: "The 3-second rule: give yourself 3 seconds max to react to a mistake. Then: physical reset cue (deep breath + physical movement). Then: next pitch focus word. Practice this in every rep." },
    ],
    coachingCues: [
      "You don't control outcomes — you control process. Focus on what you can control.",
      "Your body language communicates to your nervous system as much as to your opponents",
      "The best play after a mistake is the very next pitch — compete until the last out",
    ],
    commonErrors: [
      "Motivation-based confidence: confidence built on 'I'm pumped up' crashes under pressure. Build it on evidence-based knowledge of your preparation.",
      "All-or-nothing thinking: a bad at-bat doesn't mean a bad game. A bad week doesn't mean a bad player. Compartmentalize.",
      "Focusing on the crowd, umpires, scoreboard: research consistently shows peak performance correlates with internal process focus, not external outcome awareness.",
    ],
    scienceBacking: "Bandura's (1977) self-efficacy theory established that performance confidence comes from four sources in order: (1) Performance accomplishments (actual success). (2) Vicarious learning (seeing similar others succeed). (3) Social persuasion (coaching, feedback). (4) Physiological/emotional states. The VAULT KPI tracker addresses source #1 — the most powerful confidence builder.",
    eliteStandard: "Every D1 program in the country now has dedicated mental performance coaching. At the professional level, mental performance coaches are on full-time staff. The athletes who reach and stay at the top do not do so through physical tools alone.",
    weeklyTarget: "Complete pre-performance routine design. Do 10-minute visualization every morning before practice. Practice the 3-second mistake recovery rule in every rep this week.",
    parentNote: "Mental performance coaching is not therapy. It's applied performance science. Parents who support this work (not asking 'did you win' but 'how was your process') accelerate their athlete's development.",
  },
};

// ─── ARM CARE / LONGEVITY CONTENT ─────────────────────────────────────────────

export const ARM_CARE_LESSONS: Record<string, LessonContent> = {
  "ac-1-1": {
    id: "ac-1-1",
    deepDescription: "Tommy John surgery (UCL reconstruction) has increased 500% among youth athletes since 1994. The average age of first TJ surgery has dropped from 26 to 17. Dr. James Andrews, the world's most recognized sports surgeon for overhead athletes, stated: 'The greatest threat to the shoulder and elbow is overuse, not trauma. If we don't change how we train and schedule young pitchers, this will not get better.' VAULT's arm health system is built directly on his published clinical data and the ASMI guidelines on youth throwing volume. The data is clear — it's not velocity that breaks arms. It's accumulated volume without adequate recovery.",
    keyPoints: [
      "The UCL is not designed to be a primary stabilizer of the elbow during throwing. Its primary stabilizer is the flexor-pronator mass (the muscles of the forearm). When the FPM is weak or fatigued, the UCL bears the compensatory load. This is why forearm and grip strength training is arm health training.",
      "ASMI youth pitching guidelines (publicly published): Ages 9-10: 50 pitches/day max. Ages 11-12: 75 max. Ages 13-16: 95 max. Ages 17-18: 105 max. These are HARD LIMITS, not suggestions. These numbers were derived from injury incidence data on 1,000+ youth pitchers.",
      "Radar gun reading as a health indicator: velocity drop of 3+ mph from the start of an outing to mid-outing is a neuromuscular fatigue signal. Continuing to throw after fatigue is when mechanics break down and UCL stress spikes.",
      "Rest day requirements by age (ASMI): After 40-60 pitches: 1 full rest day minimum. After 61-80 pitches: 2 rest days. After 81+: 3+ rest days. 'Rest' = no throwing, no bullpen, no long toss.",
    ],
    drills: [
      { name: "Wrist Flexion Strength Test", sets: "1", reps: "Test max reps", cue: "Forearm on bench, wrist over edge, 5 lb weight. Flex wrist for max reps before form breaks. This is your flexor-pronator baseline. Weak score = elevated UCL risk." },
      { name: "Grip Dynamometer Test", sets: "1", reps: "3 readings each hand", cue: "Standard grip strength test. Record dominant and non-dominant. Throwing arm should be within 10% of non-throwing arm. Larger asymmetry indicates potential fatigue or injury." },
      { name: "Full Arm Care Routine", sets: "Daily", reps: "12-15 min", cue: "YTW + Band ER + Band IR + Diagonal patterns + Wrist flex/extension + Sleeper stretch. Non-negotiable after every throwing session." },
    ],
    coachingCues: [
      "Track your pitch counts every outing, every practice — not just games",
      "If it hurts inside the elbow: STOP. That is not soreness — that is a warning signal",
      "Your arm is your most valuable physical asset. Protect it like the investment it is",
    ],
    commonErrors: [
      "Playing through medial elbow pain: inner elbow pain during or after throwing is a UCL stress signal. Every throw through this pain increases the probability of complete tear.",
      "Counting only game pitches: bullpen pitches, long toss, and flat ground throws all accumulate stress. Total throw count, not just game pitch count.",
      "Not reporting pain to coaches: culture of toughness that discourages athletes from reporting arm pain is statistically associated with the highest injury rates.",
    ],
    scienceBacking: "Fleisig et al. (2011, American Journal of Sports Medicine) followed 481 pitchers ages 9-14 for 10 years. Athletes who pitched more than 100 innings/year were 3.5× more likely to require surgery or retire due to injury. Athletes who violated rest-day guidelines were 2.1× more likely to sustain serious arm injury.",
    eliteStandard: "Every MLB organization has published arm health protocols for their minor league affiliates. The industry consensus: pitch counts, mandatory rest days, and consistent arm care are non-negotiable at every level of organized baseball and softball.",
    weeklyTarget: "Log all throws this week (not just pitches). Calculate your weekly throwing load and compare to ASMI guidelines for your age group. Report any arm discomfort to coach immediately.",
    parentNote: "Parents play a critical role in arm health. Learn the ASMI guidelines for your athlete's age. Do not allow coaches or travel programs to override rest day requirements. No college scholarship is worth a career-ending arm injury at 15.",
  },
};

// ─── LOOKUP FUNCTION ──────────────────────────────────────────────────────────

const ALL_LESSONS: Record<string, LessonContent> = {
  ...PITCHING_LESSONS,
  ...HITTING_LESSONS,
  ...SPEED_LESSONS,
  ...SOFTBALL_LESSONS,
  ...MENTAL_PERFORMANCE_LESSONS,
  ...ARM_CARE_LESSONS,
};

export function getLessonContent(lessonId: string): LessonContent | null {
  return ALL_LESSONS[lessonId] || null;
}

export function getLessonContentByKeyword(keyword: string): LessonContent[] {
  const kw = keyword.toLowerCase();
  return Object.values(ALL_LESSONS).filter(lesson =>
    lesson.deepDescription.toLowerCase().includes(kw) ||
    lesson.keyPoints.some(p => p.toLowerCase().includes(kw))
  );
}
