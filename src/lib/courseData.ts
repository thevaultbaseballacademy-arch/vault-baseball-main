// Course content data structure
// In production, this would come from your database

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  thumbnailUrl?: string;
  isFree: boolean;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface CourseContent {
  courseId: string;
  modules: Module[];
}

// Sample course content with real training videos
// Replace these URLs with your actual training video URLs
export const courseContent: Record<string, CourseContent> = {
  "velocity-system": {
    courseId: "velocity-system",
    modules: [
      {
        id: "vs-week-1",
        title: "Week 1: Foundation",
        description: "Building the foundation for arm health and velocity",
        lessons: [
          {
            id: "vs-1-1",
            title: "Program Overview & Assessment",
            description: "Learn how to assess your current throwing mechanics and set baseline measurements.",
            duration: "12 min",
            videoUrl: "https://www.youtube.com/watch?v=example1",
            isFree: true,
          },
          {
            id: "vs-1-2",
            title: "Arm Care Routine",
            description: "Daily arm care exercises to prevent injury and promote recovery.",
            duration: "15 min",
            videoUrl: "https://www.youtube.com/watch?v=example2",
            isFree: true,
          },
          {
            id: "vs-1-3",
            title: "Long Toss Protocol",
            description: "Proper long toss technique and progressive distance training.",
            duration: "18 min",
            videoUrl: "https://www.youtube.com/watch?v=example3",
            isFree: false,
          },
          {
            id: "vs-1-4",
            title: "Weighted Ball Introduction",
            description: "Safe introduction to weighted ball training.",
            duration: "14 min",
            videoUrl: "https://www.youtube.com/watch?v=example4",
            isFree: false,
          },
        ],
      },
      {
        id: "vs-week-2",
        title: "Week 2: Mechanics",
        description: "Developing efficient throwing mechanics",
        lessons: [
          {
            id: "vs-2-1",
            title: "Hip-Shoulder Separation",
            description: "Maximizing rotational power through proper sequencing.",
            duration: "16 min",
            videoUrl: "https://www.youtube.com/watch?v=example5",
            isFree: false,
          },
          {
            id: "vs-2-2",
            title: "Arm Path Optimization",
            description: "Creating an efficient arm path for velocity and health.",
            duration: "14 min",
            videoUrl: "https://www.youtube.com/watch?v=example6",
            isFree: false,
          },
          {
            id: "vs-2-3",
            title: "Lead Leg Block",
            description: "Using the lead leg to transfer energy up the chain.",
            duration: "12 min",
            videoUrl: "https://www.youtube.com/watch?v=example7",
            isFree: false,
          },
          {
            id: "vs-2-4",
            title: "Drill Combinations",
            description: "Putting it all together with compound drills.",
            duration: "20 min",
            videoUrl: "https://www.youtube.com/watch?v=example8",
            isFree: false,
          },
        ],
      },
      {
        id: "vs-week-3",
        title: "Week 3: Intensity",
        description: "Building arm strength and throwing intensity",
        lessons: [
          {
            id: "vs-3-1",
            title: "Pulldown Training",
            description: "Max effort throwing for velocity development.",
            duration: "15 min",
            videoUrl: "https://www.youtube.com/watch?v=example9",
            isFree: false,
          },
          {
            id: "vs-3-2",
            title: "Plyo Ball Routines",
            description: "Advanced weighted ball drills for power development.",
            duration: "18 min",
            videoUrl: "https://www.youtube.com/watch?v=example10",
            isFree: false,
          },
          {
            id: "vs-3-3",
            title: "Recovery Protocols",
            description: "Managing workload and optimizing recovery.",
            duration: "10 min",
            videoUrl: "https://www.youtube.com/watch?v=example11",
            isFree: false,
          },
          {
            id: "vs-3-4",
            title: "Progress Assessment",
            description: "Measuring gains and planning next phase.",
            duration: "12 min",
            videoUrl: "https://www.youtube.com/watch?v=example12",
            isFree: false,
          },
        ],
      },
    ],
  },
  "strength-conditioning": {
    courseId: "strength-conditioning",
    modules: [
      {
        id: "sc-week-1",
        title: "Week 1: Assessment & Movement",
        description: "Establishing baseline strength and movement patterns",
        lessons: [
          {
            id: "sc-1-1",
            title: "Strength Assessment",
            description: "Testing your current strength levels across key lifts.",
            duration: "20 min",
            videoUrl: "https://www.youtube.com/watch?v=sc1",
            isFree: true,
          },
          {
            id: "sc-1-2",
            title: "Movement Screening",
            description: "Identifying mobility limitations and imbalances.",
            duration: "15 min",
            videoUrl: "https://www.youtube.com/watch?v=sc2",
            isFree: true,
          },
          {
            id: "sc-1-3",
            title: "Squat Fundamentals",
            description: "Building a strong squat pattern from the ground up.",
            duration: "18 min",
            videoUrl: "https://www.youtube.com/watch?v=sc3",
            isFree: false,
          },
          {
            id: "sc-1-4",
            title: "Hinge Mechanics",
            description: "Deadlift and RDL technique for power development.",
            duration: "16 min",
            videoUrl: "https://www.youtube.com/watch?v=sc4",
            isFree: false,
          },
        ],
      },
      {
        id: "sc-week-2",
        title: "Week 2: Power Development",
        description: "Building explosive power for the diamond",
        lessons: [
          {
            id: "sc-2-1",
            title: "Olympic Lift Progressions",
            description: "Clean and snatch variations for baseball athletes.",
            duration: "22 min",
            videoUrl: "https://www.youtube.com/watch?v=sc5",
            isFree: false,
          },
          {
            id: "sc-2-2",
            title: "Medicine Ball Training",
            description: "Rotational power development with med balls.",
            duration: "14 min",
            videoUrl: "https://www.youtube.com/watch?v=sc6",
            isFree: false,
          },
          {
            id: "sc-2-3",
            title: "Plyometric Foundations",
            description: "Jump training for explosive lower body power.",
            duration: "16 min",
            videoUrl: "https://www.youtube.com/watch?v=sc7",
            isFree: false,
          },
        ],
      },
    ],
  },
  "speed-agility": {
    courseId: "speed-agility",
    modules: [
      {
        id: "sa-week-1",
        title: "Week 1: Sprint Mechanics",
        description: "Developing elite linear speed",
        lessons: [
          {
            id: "sa-1-1",
            title: "Sprint Posture & Arm Action",
            description: "The fundamentals of efficient sprinting.",
            duration: "14 min",
            videoUrl: "https://www.youtube.com/watch?v=sa1",
            isFree: true,
          },
          {
            id: "sa-1-2",
            title: "First Step Quickness",
            description: "Explosive starts and acceleration mechanics.",
            duration: "12 min",
            videoUrl: "https://www.youtube.com/watch?v=sa2",
            isFree: true,
          },
          {
            id: "sa-1-3",
            title: "Base Running Speed",
            description: "Applying sprint mechanics to the bases.",
            duration: "16 min",
            videoUrl: "https://www.youtube.com/watch?v=sa3",
            isFree: false,
          },
        ],
      },
      {
        id: "sa-week-2",
        title: "Week 2: Change of Direction",
        description: "Multi-directional speed for defensive excellence",
        lessons: [
          {
            id: "sa-2-1",
            title: "Lateral Movement Patterns",
            description: "Efficient side-to-side movement for infielders.",
            duration: "15 min",
            videoUrl: "https://www.youtube.com/watch?v=sa4",
            isFree: false,
          },
          {
            id: "sa-2-2",
            title: "Drop Step & Crossover",
            description: "Outfield-specific movement skills.",
            duration: "14 min",
            videoUrl: "https://www.youtube.com/watch?v=sa5",
            isFree: false,
          },
        ],
      },
    ],
  },
  // NEW COURSES FROM VAULT PDFs
  "arm-health-workload": {
    courseId: "arm-health-workload",
    modules: [
      {
        id: "ah-intro",
        title: "Executive Overview",
        description: "Understanding arm health as a performance system, not a medical reaction",
        lessons: [
          {
            id: "ah-1-1",
            title: "Arm Health Philosophy",
            description: "VAULT™ manages total throwing stress by controlling volume, intent, and recovery.",
            duration: "10 min",
            videoUrl: "",
            isFree: true,
          },
          {
            id: "ah-1-2",
            title: "Key Performance Indicators",
            description: "Learn about Availability %, High-Intent Days, Recovery Compliance, and Velocity Stability.",
            duration: "12 min",
            videoUrl: "",
            isFree: true,
          },
        ],
      },
      {
        id: "ah-mobility",
        title: "Mobility & Activation",
        description: "Restore range of motion and prep stabilizers",
        lessons: [
          {
            id: "ah-2-1",
            title: "T-Spine Rotations & Shoulder CARs",
            description: "Mobility exercises to restore range of motion.",
            duration: "15 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ah-2-2",
            title: "Band ER & Serratus Wall Slides",
            description: "Activation exercises to prep stabilizers.",
            duration: "12 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "ah-strength",
        title: "Arm Strength & Tissue Resilience",
        description: "Build tissue resilience through targeted strength work",
        lessons: [
          {
            id: "ah-3-1",
            title: "DB ER, Rows & Landmine Press",
            description: "Strength exercises for tissue resilience.",
            duration: "18 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ah-3-2",
            title: "Eccentric Band ER & Reverse Throws",
            description: "Deceleration training to protect arm post-release.",
            duration: "15 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "ah-recovery",
        title: "Recovery Protocols",
        description: "Restore the nervous system and optimize recovery",
        lessons: [
          {
            id: "ah-4-1",
            title: "Breathing & Light Band Work",
            description: "Recovery techniques to restore the nervous system.",
            duration: "10 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ah-4-2",
            title: "Sleep Optimization for Athletes",
            description: "How sleep impacts arm health and performance.",
            duration: "12 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
    ],
  },
  "strength-power-system": {
    courseId: "strength-power-system",
    modules: [
      {
        id: "sp-foundation",
        title: "Force Category Foundations",
        description: "Understanding the key force categories for baseball performance",
        lessons: [
          {
            id: "sp-1-1",
            title: "Lower-Body Force Production",
            description: "Trap-bar deadlift, split squat, box squat for ground force production.",
            duration: "20 min",
            videoUrl: "",
            isFree: true,
          },
          {
            id: "sp-1-2",
            title: "Rotational Power Transfer",
            description: "Med-ball scoop toss, shot-put throw for hip-to-torso power.",
            duration: "18 min",
            videoUrl: "",
            isFree: true,
          },
        ],
      },
      {
        id: "sp-decel",
        title: "Deceleration & Stability",
        description: "Braking, tissue protection, and force transfer",
        lessons: [
          {
            id: "sp-2-1",
            title: "Depth Drops & Eccentric Split Squats",
            description: "Deceleration training for braking and tissue protection.",
            duration: "16 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "sp-2-2",
            title: "Pallof Press & Suitcase Carry",
            description: "Anti-rotation work for stability and force transfer.",
            duration: "14 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "sp-inseason",
        title: "In-Season Training Model",
        description: "Maintain force output while managing fatigue during the season",
        lessons: [
          {
            id: "sp-3-1",
            title: "In-Season Programming Principles",
            description: "1-2 lifts per week with submaximal, high intent loading.",
            duration: "15 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "sp-3-2",
            title: "Priority: Deceleration & Recovery",
            description: "Maintaining durability while avoiding max effort lifting.",
            duration: "12 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "sp-offseason",
        title: "Off-Season Training Model",
        description: "Build force capacity, power output, and structural resilience",
        lessons: [
          {
            id: "sp-4-1",
            title: "Off-Season Programming Principles",
            description: "3-4 lifts per week with progressive strength to power.",
            duration: "18 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "sp-4-2",
            title: "Rotational & Acceleration Work",
            description: "Building force production and movement quality.",
            duration: "20 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
    ],
  },
  "transfer-system": {
    courseId: "transfer-system",
    modules: [
      {
        id: "ts-intro",
        title: "Program Overview & Assessment",
        description: "Understanding the practice-to-game transfer gap and how to close it",
        lessons: [
          {
            id: "ts-1-1",
            title: "The Transfer Problem",
            description: "Why athletes dominate practice but underperform in games—and how to fix it.",
            duration: "12 min",
            videoUrl: "",
            isFree: true,
          },
          {
            id: "ts-1-2",
            title: "Transfer Rate Assessment",
            description: "Measure your current practice-to-game carryover rate and identify gaps.",
            duration: "15 min",
            videoUrl: "",
            isFree: true,
          },
          {
            id: "ts-1-3",
            title: "Setting Your Transfer Baseline",
            description: "Establish baseline metrics for tracking improvement over the 12-week program.",
            duration: "10 min",
            videoUrl: "",
            isFree: true,
          },
        ],
      },
      {
        id: "ts-decision",
        title: "Decision Training",
        description: "Train your brain to make better decisions faster under game-like pressure",
        lessons: [
          {
            id: "ts-2-1",
            title: "Perception-Action Coupling",
            description: "Learn to read cues and react in real-time instead of relying on rehearsed patterns.",
            duration: "18 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ts-2-2",
            title: "Pitch Recognition Drills",
            description: "Train your eyes and brain to identify pitch type, location, and timing faster.",
            duration: "20 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ts-2-3",
            title: "Situational Decision Framework",
            description: "Build mental models for common game situations so decisions become automatic.",
            duration: "16 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ts-2-4",
            title: "Time-Pressure Decision Drills",
            description: "Progressive drills that reduce decision time while maintaining accuracy.",
            duration: "14 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "ts-practice",
        title: "Game-Realistic Practice Design",
        description: "Design practices that mirror the chaos, timing, and demands of real competition",
        lessons: [
          {
            id: "ts-3-1",
            title: "Practice Design Principles",
            description: "The science behind why traditional practice doesn't transfer to games.",
            duration: "15 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ts-3-2",
            title: "Constraint-Led Drill Design",
            description: "Create drills that force adaptation and problem-solving instead of repetition.",
            duration: "20 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ts-3-3",
            title: "Randomized vs. Blocked Practice",
            description: "When to use random practice for transfer vs. blocked practice for skill acquisition.",
            duration: "16 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ts-3-4",
            title: "Weekly Practice Templates",
            description: "Ready-to-use practice templates for pitchers, hitters, and position players.",
            duration: "18 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ts-3-5",
            title: "Seasonal Practice Periodization",
            description: "Adjust practice design across off-season, pre-season, and in-season phases.",
            duration: "14 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "ts-competitive",
        title: "Competitive Execution",
        description: "Build the mental frameworks to perform under pressure when it matters most",
        lessons: [
          {
            id: "ts-4-1",
            title: "Pressure Inoculation Training",
            description: "Systematically expose athletes to increasing pressure to build resilience.",
            duration: "18 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ts-4-2",
            title: "Pre-Competition Routines",
            description: "Build consistent pre-game mental preparation that activates peak performance.",
            duration: "14 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ts-4-3",
            title: "In-Game Reset Protocol",
            description: "The 6-second reset technique for recovering from mistakes during competition.",
            duration: "12 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ts-4-4",
            title: "Clutch Performance Training",
            description: "Train the ability to elevate performance in high-leverage situations.",
            duration: "16 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "ts-drill-library",
        title: "60+ Game-Realistic Drill Library",
        description: "Complete drill library organized by position, skill, and transfer goal",
        lessons: [
          {
            id: "ts-5-1",
            title: "Hitting Transfer Drills (15 Drills)",
            description: "Game-speed hitting drills with randomized pitch sequences and situational context.",
            duration: "25 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ts-5-2",
            title: "Pitching Transfer Drills (15 Drills)",
            description: "Command drills with hitter simulation, count management, and pressure scenarios.",
            duration: "25 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ts-5-3",
            title: "Fielding Transfer Drills (15 Drills)",
            description: "Reaction-based fielding with game-speed reads, throws, and decision-making.",
            duration: "25 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ts-5-4",
            title: "Baserunning & Situational Drills (15 Drills)",
            description: "Live baserunning scenarios, reads off pitchers, and situational awareness drills.",
            duration: "20 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "ts-tracking",
        title: "Performance Tracking & Analytics",
        description: "Measure what matters—track practice-to-game transfer rates and identify gaps",
        lessons: [
          {
            id: "ts-6-1",
            title: "Transfer Rate Tracking System",
            description: "How to measure and track your practice-to-game transfer percentage.",
            duration: "14 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ts-6-2",
            title: "Video Analysis for Transfer",
            description: "Using video to identify mechanical differences between practice and game performance.",
            duration: "18 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ts-6-3",
            title: "Post-Game Self-Assessment",
            description: "Structured framework for evaluating transfer after every game.",
            duration: "12 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ts-6-4",
            title: "12-Week Progress Review",
            description: "Comprehensive review protocol and planning for continued improvement.",
            duration: "16 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
    ],
  },
  "organizational-development": {
    courseId: "organizational-development",
    modules: [
      {
        id: "od-intro",
        title: "Executive Introduction",
        description: "Understanding organizational alignment in baseball development",
        lessons: [
          {
            id: "od-1-1",
            title: "The Core Problem: Misalignment",
            description: "Why standards that vary by coach or team make development fragile.",
            duration: "12 min",
            videoUrl: "",
            isFree: true,
          },
          {
            id: "od-1-2",
            title: "The VAULT™ Five Pillars",
            description: "Velocity, Athleticism, Utility, Longevity, Transfer - the foundation of development.",
            duration: "15 min",
            videoUrl: "",
            isFree: true,
          },
        ],
      },
      {
        id: "od-alignment",
        title: "Organizational Alignment Model",
        description: "Creating consistency from leadership to athletes",
        lessons: [
          {
            id: "od-2-1",
            title: "The Alignment Hierarchy",
            description: "Ownership → Director of Player Development → Coaches → Athletes.",
            duration: "14 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "od-2-2",
            title: "Consistent Development Standards",
            description: "Ensuring athletes receive the same development regardless of team or age group.",
            duration: "16 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "od-decisions",
        title: "Decision-Making Framework",
        description: "The VAULT™ decision-making filter for organizational choices",
        lessons: [
          {
            id: "od-3-1",
            title: "The Three Filter Questions",
            description: "Does it align with the 5 pillars? Protect long-term development? Preserve system integrity?",
            duration: "10 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "od-3-2",
            title: "Applying the Filter in Practice",
            description: "Real-world examples of using the decision-making framework.",
            duration: "18 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
    ],
  },
  "pitcher-catcher-overlap": {
    courseId: "pitcher-catcher-overlap",
    modules: [
      {
        id: "pco-overview",
        title: "Policy Overview",
        description: "Managing dual-role athletes who pitch and catch",
        lessons: [
          {
            id: "pco-1-1",
            title: "Understanding Overlap Stress",
            description: "Why athletes who pitch and catch experience significantly higher throwing stress.",
            duration: "10 min",
            videoUrl: "",
            isFree: true,
          },
          {
            id: "pco-1-2",
            title: "Monitoring & Limiting Overlap",
            description: "How overlap is monitored, limited, and adjusted throughout the season.",
            duration: "12 min",
            videoUrl: "",
            isFree: true,
          },
        ],
      },
      {
        id: "pco-rules",
        title: "Non-Negotiable Rules",
        description: "The essential policies for protecting dual-role athletes",
        lessons: [
          {
            id: "pco-2-1",
            title: "Same-Game & Recovery Rules",
            description: "No pitching and catching in the same game. Mandatory recovery after catching → pitching.",
            duration: "14 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "pco-2-2",
            title: "Weekly Limits & Director Approval",
            description: "High-intent days capped per week. Director approval required for overlap.",
            duration: "12 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
    ],
  },
  "winning-athlete-mindset": {
    courseId: "winning-athlete-mindset",
    modules: [
      {
        id: "wam-intro",
        title: "Introduction & Program Goals",
        description: "Building elite confidence, mental toughness, and competitive resilience",
        lessons: [
          {
            id: "wam-1-1",
            title: "Program Overview",
            description: "A 10-week mental performance training system for elite competitors.",
            duration: "10 min",
            videoUrl: "",
            isFree: true,
          },
          {
            id: "wam-1-2",
            title: "Weekly Structure",
            description: "Mental lessons, daily tasks, journal prompts, and weekly challenges.",
            duration: "8 min",
            videoUrl: "",
            isFree: true,
          },
        ],
      },
      {
        id: "wam-week1",
        title: "Week 1: Identity & Purpose",
        description: "Athletes perform best when they understand who they are",
        lessons: [
          {
            id: "wam-2-1",
            title: "Define Who You Are",
            description: "Creating your Athlete Identity Statement and long-term vision.",
            duration: "15 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "wam-2-2",
            title: "Champion Discipline Challenge",
            description: "Complete 1 full day of 'no excuses' discipline checklist.",
            duration: "10 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "wam-week2",
        title: "Week 2: Confidence & Self-Talk",
        description: "True confidence comes from preparation, repetition, and intentional self-talk",
        lessons: [
          {
            id: "wam-3-1",
            title: "The Confidence Equation",
            description: "Confidence = Reps + Preparation + Belief. Self-talk controls performance.",
            duration: "14 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "wam-3-2",
            title: "Reframing Negative Thoughts",
            description: "Techniques for shifting internal language to elite patterns.",
            duration: "12 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "wam-weeks3-10",
        title: "Weeks 3-10: Advanced Mindset Training",
        description: "Focus, pressure, resilience, leadership, and championship habits",
        lessons: [
          {
            id: "wam-4-1",
            title: "Focus & Emotional Control",
            description: "Developing focus and emotional control under pressure.",
            duration: "16 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "wam-4-2",
            title: "Leadership & Champion Mindset",
            description: "Building leadership habits and a champion mindset.",
            duration: "18 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "wam-4-3",
            title: "Performance Consistency",
            description: "Improve performance consistency and pre-game readiness.",
            duration: "14 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
    ],
  },
  "elite-mental-performance": {
    courseId: "elite-mental-performance",
    modules: [
      {
        id: "emp-pillars",
        title: "Mental Performance Pillars",
        description: "The five core pillars of championship-level mental strength",
        lessons: [
          {
            id: "emp-1-1",
            title: "The Five Pillars Overview",
            description: "Confidence, Focus, Emotional Speed, Self-Talk, and Competitive Identity.",
            duration: "12 min",
            videoUrl: "",
            isFree: true,
          },
          {
            id: "emp-1-2",
            title: "Building Each Pillar",
            description: "How each pillar is built through repetition and proof.",
            duration: "15 min",
            videoUrl: "",
            isFree: true,
          },
        ],
      },
      {
        id: "emp-visualization",
        title: "Visualization & Self-Talk System",
        description: "5-minute daily routines and identity-based affirmations",
        lessons: [
          {
            id: "emp-2-1",
            title: "5-Minute Visualization Routine",
            description: "Daily visualization practice for pre-game mental preparation.",
            duration: "10 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "emp-2-2",
            title: "Identity-Based Affirmations",
            description: "Creating and using competitive self-talk: 'I attack, I compete, I finish.'",
            duration: "12 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "emp-2-3",
            title: "Confidence Anchors & Reset Words",
            description: "Pre-game visualization scripts and mental triggers.",
            duration: "14 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "emp-emotional",
        title: "Emotional Speed & Reset System",
        description: "Recovering fast from mistakes with structured routines",
        lessons: [
          {
            id: "emp-3-1",
            title: "The 6-Second Reset Routine",
            description: "Mistake → Breath → Reset → Refocus pattern for quick recovery.",
            duration: "10 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "emp-3-2",
            title: "Performance Breathing",
            description: "Box breath, 4-2-6 breath, and emotional neutrality training.",
            duration: "12 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "emp-10week",
        title: "10-Week Mindset Calendar",
        description: "Progressive mental performance training program",
        lessons: [
          {
            id: "emp-4-1",
            title: "Weeks 1-5: Foundation Building",
            description: "Confidence base, emotional speed, focus training, visualization, pressure work.",
            duration: "20 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "emp-4-2",
            title: "Weeks 6-10: Championship Performance",
            description: "Self-talk upgrade, competitive identity, mental toughness, consistency, testing.",
            duration: "22 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
    ],
  },
  "elite-speed-agility": {
    courseId: "elite-speed-agility",
    modules: [
      {
        id: "esa-warmup",
        title: "Warmup & Activation System",
        description: "Preparing the body for high-level speed work",
        lessons: [
          {
            id: "esa-1-1",
            title: "Dynamic Warmup Protocol",
            description: "A-Skips, B-Skips, linear mobility drills.",
            duration: "12 min",
            videoUrl: "",
            isFree: true,
          },
          {
            id: "esa-1-2",
            title: "Acceleration & Plyometric Prep",
            description: "Wall drive series, lean-fall sprints, pogo jumps, mini-hurdles.",
            duration: "15 min",
            videoUrl: "",
            isFree: true,
          },
        ],
      },
      {
        id: "esa-mechanics",
        title: "Sprint Mechanics",
        description: "Acceleration position and top-speed mechanics",
        lessons: [
          {
            id: "esa-2-1",
            title: "Acceleration Position",
            description: "45° forward lean, powerful knee punch technique.",
            duration: "14 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "esa-2-2",
            title: "Top-Speed Position",
            description: "Tall posture, front-side mechanics, relaxed upper body.",
            duration: "16 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "esa-12week",
        title: "12-Week Speed & Agility Calendar",
        description: "Progressive training from foundation to peak performance",
        lessons: [
          {
            id: "esa-3-1",
            title: "Weeks 1-4: Foundation Phase",
            description: "Acceleration foundation, stride projection, stride frequency, COD foundation.",
            duration: "18 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "esa-3-2",
            title: "Weeks 5-8: Development Phase",
            description: "Agility angles, reactive speed, sprint efficiency, explosive power.",
            duration: "20 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "esa-3-3",
            title: "Weeks 9-12: Peak Phase",
            description: "Sport-speed application, peak speed, max COD ability, testing week.",
            duration: "16 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "esa-drills",
        title: "Elite Drill Library",
        description: "Advanced drills for acceleration, agility, and reactive speed",
        lessons: [
          {
            id: "esa-4-1",
            title: "Acceleration Drills",
            description: "Wall drills, linear starts, hip projection techniques.",
            duration: "15 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "esa-4-2",
            title: "Agility & Reactive Drills",
            description: "Crossover steps, lateral transitions, mirror drills, reaction starts.",
            duration: "18 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
    ],
  },
  "elite-hitting-exit-velocity": {
    courseId: "elite-hitting-exit-velocity",
    modules: [
      {
        id: "ehev-warmup",
        title: "Warmup & Activation System",
        description: "Preparing for high-intent hitting work",
        lessons: [
          {
            id: "ehev-1-1",
            title: "Dynamic Warmup for Hitters",
            description: "Skips, hip mobility, med ball warmups.",
            duration: "12 min",
            videoUrl: "",
            isFree: true,
          },
          {
            id: "ehev-1-2",
            title: "Bat Speed & Rotational Prep",
            description: "Top-hand/bottom-hand work, bat path drills, mini-band rotations.",
            duration: "14 min",
            videoUrl: "",
            isFree: true,
          },
        ],
      },
      {
        id: "ehev-mechanics",
        title: "Advanced Swing Mechanics",
        description: "Hip-rotation sequence and elite barrel path",
        lessons: [
          {
            id: "ehev-2-1",
            title: "Hip-Rotation Sequence",
            description: "Lead hip fires first, torso and shoulders follow for maximum power.",
            duration: "16 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ehev-2-2",
            title: "Elite Barrel Path",
            description: "Smooth on-plane entry with slight upward attack angle.",
            duration: "18 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "ehev-12week",
        title: "12-Week Exit Velocity Calendar",
        description: "Progressive training from foundation to max EV",
        lessons: [
          {
            id: "ehev-3-1",
            title: "Weeks 1-4: Foundation Phase",
            description: "Posture & base, sequencing, barrel path, bat speed intro.",
            duration: "20 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ehev-3-2",
            title: "Weeks 5-8: Power Development Phase",
            description: "Rotation power, intent training, game-speed approach, gap-to-gap power.",
            duration: "22 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ehev-3-3",
            title: "Weeks 9-12: Peak Performance Phase",
            description: "Advanced barrel control, bat speed peak, max EV training, testing week.",
            duration: "18 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "ehev-drills",
        title: "Elite Hitting Drill Library",
        description: "Advanced drills for bat speed and exit velocity",
        lessons: [
          {
            id: "ehev-4-1",
            title: "Coil Load & Launch Sequence",
            description: "Building the foundation for explosive swings.",
            duration: "15 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ehev-4-2",
            title: "Overspeed & Overload Training",
            description: "Using bat speed tools to increase exit velocity.",
            duration: "18 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ehev-4-3",
            title: "Intent Training Sessions",
            description: "High intent tee and front toss for maximum power output.",
            duration: "16 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
    ],
  },
  // NEW PITCHING COURSES
  "pitching-velocity-8week": {
    courseId: "pitching-velocity-8week",
    modules: [
      {
        id: "pv-warmup",
        title: "Warmup & Activation System",
        description: "Prepare the body for safe, effective throwing",
        lessons: [
          {
            id: "pv-1-1",
            title: "Dynamic Warmup Protocol",
            description: "High knees, A-skips, leg swings for movement prep.",
            duration: "10 min",
            videoUrl: "",
            isFree: true,
          },
          {
            id: "pv-1-2",
            title: "Arm & Mobility Prep",
            description: "Band external rotations, T-Y-Ws, scap activations, thoracic rotations, hip openers.",
            duration: "12 min",
            videoUrl: "",
            isFree: true,
          },
        ],
      },
      {
        id: "pv-mechanics",
        title: "Mechanics Foundations",
        description: "Balance position and stride mechanics",
        lessons: [
          {
            id: "pv-2-1",
            title: "Balance Position",
            description: "Establishing proper posture and balance at the top of the delivery.",
            duration: "14 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "pv-2-2",
            title: "Stride Position",
            description: "Developing proper stride mechanics for power and direction.",
            duration: "16 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "pv-8week",
        title: "8-Week Velocity Calendar",
        description: "Progressive training from foundation to velocity testing",
        lessons: [
          {
            id: "pv-3-1",
            title: "Weeks 1-4: Foundation Phase",
            description: "Posture & balance, hip lead, separation, arm speed with plyo balls.",
            duration: "20 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "pv-3-2",
            title: "Weeks 5-8: Development Phase",
            description: "Recovery strength, mound blend, command + intent, velocity test.",
            duration: "18 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "pv-drills",
        title: "Drill Library",
        description: "Essential drills for pitching development",
        lessons: [
          {
            id: "pv-4-1",
            title: "Pivot Picks & Rocker Throws",
            description: "Trains arm-path efficiency and improves sequencing.",
            duration: "15 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "pv-4-2",
            title: "Step-Behind & Reverse Throws",
            description: "Develops momentum and builds arm deceleration.",
            duration: "14 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "pv-4-3",
            title: "Connection Ball Work",
            description: "Maintains alignment throughout the delivery.",
            duration: "12 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
    ],
  },
  "elite-pitching-12week": {
    courseId: "elite-pitching-12week",
    modules: [
      {
        id: "ep-warmup",
        title: "Elite Warmup & Activation System",
        description: "Advanced preparation for high-intent throwing",
        lessons: [
          {
            id: "ep-1-1",
            title: "Dynamic Warmup & Sprint Buildups",
            description: "A-skips, reverse skips, sprint buildups for explosive prep.",
            duration: "12 min",
            videoUrl: "",
            isFree: true,
          },
          {
            id: "ep-1-2",
            title: "Arm Activation & Hip Mobility",
            description: "Band ER/IR, scap loads, rebounders, 90/90 mobility, hip hike drills.",
            duration: "15 min",
            videoUrl: "",
            isFree: true,
          },
        ],
      },
      {
        id: "ep-mechanics",
        title: "Advanced Mechanics",
        description: "Hip-to-shoulder separation and elite arm path",
        lessons: [
          {
            id: "ep-2-1",
            title: "Hip-to-Shoulder Separation",
            description: "Hip lead, delayed trunk, stored energy release for maximum velocity.",
            duration: "18 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ep-2-2",
            title: "Elite Arm Path",
            description: "Smooth scap load, clean layback angle for efficient arm action.",
            duration: "16 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "ep-12week",
        title: "12-Week Velocity Calendar",
        description: "Progressive training from foundation to peak velocity",
        lessons: [
          {
            id: "ep-3-1",
            title: "Weeks 1-4: Foundation Phase",
            description: "Posture & balance, hip lead mastery, separation, arm speed.",
            duration: "22 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ep-3-2",
            title: "Weeks 5-8: Development Phase",
            description: "Lower half power, full delivery blend, command precision, velocity block.",
            duration: "24 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ep-3-3",
            title: "Weeks 9-12: Peak Phase",
            description: "Mound work, competitive bullpens, peak velocity, testing week.",
            duration: "20 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "ep-drills",
        title: "Elite Drill Library",
        description: "Advanced drills for velocity development",
        lessons: [
          {
            id: "ep-4-1",
            title: "Advanced Plyo Ball Progressions",
            description: "High-level plyo ball work for arm speed development.",
            duration: "18 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ep-4-2",
            title: "Heavy Med Ball Rotational Throws",
            description: "Building rotational power and hip-to-torso transfer.",
            duration: "16 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ep-4-3",
            title: "Competitive Bullpen Structure",
            description: "Game-like bullpen sessions with intent and approach training.",
            duration: "20 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "ep-strength",
        title: "Strength & Power Add-On",
        description: "Supporting strength work for pitchers",
        lessons: [
          {
            id: "ep-5-1",
            title: "Lower Half Power Development",
            description: "Force production patterns for explosive delivery.",
            duration: "18 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ep-5-2",
            title: "Recovery & Arm Care System",
            description: "Post-throw protocols and arm health maintenance.",
            duration: "14 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
    ],
  },
  // NEW CATCHER COURSES
  "youth-catcher-8week": {
    courseId: "youth-catcher-8week",
    modules: [
      {
        id: "yc-warmup",
        title: "Warmup & Activation System",
        description: "Prepare young catchers for skill work",
        lessons: [
          {
            id: "yc-1-1",
            title: "Dynamic Warmup for Catchers",
            description: "Hip mobility, deep squat holds, lateral steps.",
            duration: "10 min",
            videoUrl: "",
            isFree: true,
          },
          {
            id: "yc-1-2",
            title: "Receiving & Throwing Prep",
            description: "Tennis ball soft-hand drills, glove pocket work, band activation.",
            duration: "12 min",
            videoUrl: "",
            isFree: true,
          },
        ],
      },
      {
        id: "yc-receiving",
        title: "Receiving Foundations",
        description: "Building proper receiving mechanics",
        lessons: [
          {
            id: "yc-2-1",
            title: "Stance & Glove Position",
            description: "Low stance, quiet glove, hinge-loaded hips.",
            duration: "14 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "yc-2-2",
            title: "Soft Hands Development",
            description: "Tennis ball drills for quiet, efficient receiving.",
            duration: "12 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "yc-blocking",
        title: "Blocking Fundamentals",
        description: "Safe and effective blocking technique",
        lessons: [
          {
            id: "yc-3-1",
            title: "Knee-Replace Drill Progression",
            description: "Building proper blocking form with chest forward, knees down.",
            duration: "14 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "yc-3-2",
            title: "Angle Blocks",
            description: "Blocking pitches to both sides of the plate.",
            duration: "12 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "yc-footwork",
        title: "Footwork & Throwing",
        description: "Developing efficient transfers and throws",
        lessons: [
          {
            id: "yc-4-1",
            title: "Step-Replace Footwork",
            description: "Efficient foot transfer for quick throws.",
            duration: "14 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "yc-4-2",
            title: "Safe Throwing Mechanics",
            description: "Age-appropriate throwing technique from the crouch.",
            duration: "16 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
    ],
  },
  "elite-catcher-12week": {
    courseId: "elite-catcher-12week",
    modules: [
      {
        id: "ec-warmup",
        title: "Warmup & Activation System",
        description: "Prepare for elite-level catching work",
        lessons: [
          {
            id: "ec-1-1",
            title: "Dynamic Warmup for Catchers",
            description: "Hip mobility, deep squat holds, lateral steps for catcher-specific prep.",
            duration: "12 min",
            videoUrl: "",
            isFree: true,
          },
          {
            id: "ec-1-2",
            title: "Receiving, Blocking & Throwing Prep",
            description: "Glove pocket work, knee drops, chest angles, pivot throws, wrist flicks.",
            duration: "15 min",
            videoUrl: "",
            isFree: true,
          },
        ],
      },
      {
        id: "ec-mechanics",
        title: "Elite Catching Mechanics",
        description: "Professional-level receiving, blocking, and pop-time footwork",
        lessons: [
          {
            id: "ec-2-1",
            title: "Receiving Stance & Quiet Glove",
            description: "Low stance, quiet glove, hinge-loaded hips for elite presentation.",
            duration: "16 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ec-2-2",
            title: "Blocking Form",
            description: "Chest forward, knees down, glove protects for maximum coverage.",
            duration: "14 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ec-2-3",
            title: "Pop-Time Footwork",
            description: "Step → Replace → Throw pattern for efficient transfers.",
            duration: "18 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "ec-12week",
        title: "12-Week Catcher Calendar",
        description: "Progressive training from foundation to elite pop-time",
        lessons: [
          {
            id: "ec-3-1",
            title: "Weeks 1-4: Foundation Phase",
            description: "Receiving foundation, pocket control, blocking foundation, advanced blocks.",
            duration: "22 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ec-3-2",
            title: "Weeks 5-8: Development Phase",
            description: "Transfer speed, footwork speed, throwing mechanics, pop-time focus.",
            duration: "24 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ec-3-3",
            title: "Weeks 9-12: Peak Phase",
            description: "Multi-angle work, game-speed receiving, elite pop-time, testing week.",
            duration: "20 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "ec-drills",
        title: "Elite Drill Library",
        description: "Advanced drills for all catching skills",
        lessons: [
          {
            id: "ec-4-1",
            title: "Elite Framing Patterns",
            description: "Stick frames, quiet presentation, pocket stability.",
            duration: "16 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ec-4-2",
            title: "Reaction Blocking Drills",
            description: "Lateral reads and reaction blocks for game situations.",
            duration: "18 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ec-4-3",
            title: "Pop-Time Velocity Footwork",
            description: "High intent pop-time sessions with timed reps.",
            duration: "16 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "ec-strength",
        title: "Strength, Mobility & Durability",
        description: "Catcher-specific physical development",
        lessons: [
          {
            id: "ec-5-1",
            title: "Catcher-Specific Strength",
            description: "Trap bar deadlift, squat variations, core anti-rotation holds.",
            duration: "20 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ec-5-2",
            title: "Hip & Ankle Mobility",
            description: "Ankle mobility, hip internal/external rotation, T-spine rotation.",
            duration: "14 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
    ],
  },
  "vault-catcher-complete": {
    courseId: "vault-catcher-complete",
    modules: [
      {
        id: "vcc-intro",
        title: "Introduction & Testing",
        description: "Program overview and baseline testing protocol",
        lessons: [
          {
            id: "vcc-1-1",
            title: "Program Introduction",
            description: "Building complete, high-performance catchers with all components.",
            duration: "10 min",
            videoUrl: "",
            isFree: true,
          },
          {
            id: "vcc-1-2",
            title: "Week 0 Testing Protocol",
            description: "Pop time, receiving, blocking, mobility, and strength baseline tests.",
            duration: "18 min",
            videoUrl: "",
            isFree: true,
          },
        ],
      },
      {
        id: "vcc-weekly",
        title: "Weekly Training Structure",
        description: "4 core catcher days + 1 strength day per week",
        lessons: [
          {
            id: "vcc-2-1",
            title: "Day 1: Receiving & Framing",
            description: "Pocket control, quiet glove work, one-knee receiving mechanics.",
            duration: "20 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "vcc-2-2",
            title: "Day 2: Blocking & Lateral Mobility",
            description: "Drop-and-block, reaction blocks, lateral explosion.",
            duration: "18 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "vcc-2-3",
            title: "Day 3: Footwork, Transfer & Throwing",
            description: "Crouch-to-throw, transfer speed, throwing mechanics, velocity buildups.",
            duration: "22 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "vcc-2-4",
            title: "Day 4: Game-Calling & Situational IQ",
            description: "Pitch sequencing, reading hitters, leadership development.",
            duration: "16 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "vcc-2-5",
            title: "Day 5: Strength & Mobility",
            description: "Core, hips, lower-body power for catcher durability.",
            duration: "20 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "vcc-goals",
        title: "Program Goals & Outcomes",
        description: "Target improvements for elite catcher development",
        lessons: [
          {
            id: "vcc-3-1",
            title: "Pop Time & Throwing Velocity",
            description: "Target improvement: 0.15-0.30 seconds, increased crouch velocity.",
            duration: "14 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "vcc-3-2",
            title: "Receiving, Framing & Blocking",
            description: "Improve pocket stability, elite blocking technique, lateral reaction speed.",
            duration: "16 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "vcc-3-3",
            title: "Leadership & Game Management",
            description: "Develop game-calling IQ, pitch sequencing, and leadership.",
            duration: "12 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
    ],
  },
  "annual-development-calendar": {
    courseId: "annual-development-calendar",
    modules: [
      {
        id: "adc-overview",
        title: "Executive Overview",
        description: "Understanding the annual development calendar",
        lessons: [
          {
            id: "adc-1-1",
            title: "Calendar Purpose & Philosophy",
            description: "Aligns training priorities, workloads, and recovery across the entire year to prevent overuse and improve performance timing.",
            duration: "10 min",
            videoUrl: "",
            isFree: true,
          },
          {
            id: "adc-1-2",
            title: "Annual Development Phases Overview",
            description: "Post-Season Reset, Off-Season Build, Pre-Season Ramp, In-Season Compete, and Transition/Review.",
            duration: "12 min",
            videoUrl: "",
            isFree: true,
          },
        ],
      },
      {
        id: "adc-postseason",
        title: "Post-Season Reset Phase",
        description: "Recovery, mobility, and assessment (4-6 weeks)",
        lessons: [
          {
            id: "adc-2-1",
            title: "Post-Season Recovery Protocol",
            description: "Mobility, light strength, arm recovery. No velocity chasing occurs.",
            duration: "14 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "adc-2-2",
            title: "Post-Season KPIs",
            description: "ROM restored, soreness resolved, low load movement quality.",
            duration: "10 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "adc-offseason",
        title: "Off-Season Build Phase",
        description: "Strength, power, and arm capacity (8-12 weeks)",
        lessons: [
          {
            id: "adc-3-1",
            title: "Off-Season Training Structure",
            description: "3-4 strength sessions/week with progressive, structured intent throwing.",
            duration: "16 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "adc-3-2",
            title: "Off-Season KPIs",
            description: "Force gains, stable recovery, building the physical engine for the year.",
            duration: "12 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "adc-preseason",
        title: "Pre-Season Ramp Phase",
        description: "Velocity transfer and workload prep (6-8 weeks)",
        lessons: [
          {
            id: "adc-4-1",
            title: "Pre-Season Training Bridge",
            description: "Reduced volume, high intent strength. Zone 2-3 planned throwing.",
            duration: "14 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "adc-4-2",
            title: "Pre-Season KPIs",
            description: "Velocity stability, command development, competition readiness.",
            duration: "10 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "adc-inseason",
        title: "In-Season & Transition Phases",
        description: "Competition maintenance and review",
        lessons: [
          {
            id: "adc-5-1",
            title: "In-Season Competition Phase",
            description: "1-2 strength sessions/week, competition-based throwing. Availability % and fatigue control.",
            duration: "12 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "adc-5-2",
            title: "Transition & Review Phase",
            description: "Assessment, planning, light movement, optional catch play. Data review completed.",
            duration: "10 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
    ],
  },
  "infield-development": {
    courseId: "infield-development",
    modules: [
      {
        id: "inf-overview",
        title: "Executive Overview",
        description: "Understanding the VAULT™ Infield System",
        lessons: [
          {
            id: "inf-1-1",
            title: "Infield System Philosophy",
            description: "Develop adaptable defenders through movement efficiency, clean transfers, and reliable decision-making under pressure.",
            duration: "10 min",
            videoUrl: "",
            isFree: true,
          },
          {
            id: "inf-1-2",
            title: "Key Performance Indicators",
            description: "First-step reaction, throw accuracy %, routine play success, and availability %.",
            duration: "12 min",
            videoUrl: "",
            isFree: true,
          },
        ],
      },
      {
        id: "inf-footwork",
        title: "Footwork & Base Control",
        description: "First step, braking, and re-acceleration",
        lessons: [
          {
            id: "inf-2-1",
            title: "First-Step Explosion",
            description: "Explosive readiness and reaction training for infielders.",
            duration: "16 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "inf-2-2",
            title: "Braking & Re-Acceleration",
            description: "Deceleration control and quick direction changes.",
            duration: "14 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "inf-transfer",
        title: "Glove-to-Hand Transfer",
        description: "Clean exchange under speed",
        lessons: [
          {
            id: "inf-3-1",
            title: "Transfer Mechanics",
            description: "Quick, clean glove-to-hand exchange drills.",
            duration: "14 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "inf-3-2",
            title: "Transfer Under Pressure",
            description: "Maintaining clean transfers at game speed.",
            duration: "12 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "inf-throwing",
        title: "Throwing Efficiency",
        description: "Accuracy without arm abuse",
        lessons: [
          {
            id: "inf-4-1",
            title: "Arm Path & Accuracy",
            description: "Efficient throwing mechanics for reliability.",
            duration: "16 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "inf-4-2",
            title: "Range & Lateral Coverage",
            description: "Expanding defensive range with lateral efficiency.",
            duration: "14 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "inf-decisions",
        title: "Decision-Making",
        description: "Clock awareness and situational play",
        lessons: [
          {
            id: "inf-5-1",
            title: "Clock Awareness Training",
            description: "Reading the play and making quick decisions.",
            duration: "14 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "inf-5-2",
            title: "Routine Play Mastery",
            description: "Building trustworthiness through consistent execution.",
            duration: "12 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
    ],
  },
  "outfield-development": {
    courseId: "outfield-development",
    modules: [
      {
        id: "of-overview",
        title: "Executive Overview",
        description: "Understanding the VAULT™ Outfield System",
        lessons: [
          {
            id: "of-1-1",
            title: "Outfield System Philosophy",
            description: "Train athletes to move explosively, track efficiently, and throw intelligently. Speed with control.",
            duration: "10 min",
            videoUrl: "",
            isFree: true,
          },
          {
            id: "of-1-2",
            title: "Key Performance Indicators",
            description: "First-step time, route efficiency, throw accuracy, sprint capacity, and availability %.",
            duration: "12 min",
            videoUrl: "",
            isFree: true,
          },
        ],
      },
      {
        id: "of-reads",
        title: "First-Step & Reads",
        description: "Ball-off-bat recognition",
        lessons: [
          {
            id: "of-2-1",
            title: "Ball-Off-Bat Recognition",
            description: "Reading trajectory and making instant decisions.",
            duration: "14 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "of-2-2",
            title: "First-Step Explosion",
            description: "Explosive initial movement in the right direction.",
            duration: "12 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "of-routes",
        title: "Speed & Routes",
        description: "Angle efficiency and route optimization",
        lessons: [
          {
            id: "of-3-1",
            title: "Route Efficiency",
            description: "Taking optimal angles to maximize range.",
            duration: "16 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "of-3-2",
            title: "Sprint Capacity Training",
            description: "Building speed endurance for defensive range.",
            duration: "14 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "of-tracking",
        title: "Ball Tracking",
        description: "Late adjustment and catch technique",
        lessons: [
          {
            id: "of-4-1",
            title: "Late Adjustment Skills",
            description: "Making corrections while maintaining speed.",
            duration: "14 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "of-4-2",
            title: "Catch Technique & Body Control",
            description: "Secure catches at full speed.",
            duration: "12 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "of-throwing",
        title: "Throwing & Aggression Control",
        description: "Accuracy over arm strength, smart risk management",
        lessons: [
          {
            id: "of-5-1",
            title: "Throwing Alignment & Accuracy",
            description: "Damage prevention through accurate throws.",
            duration: "16 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "of-5-2",
            title: "Controlled Aggression",
            description: "Smart risk management and decision-making.",
            duration: "12 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
    ],
  },
  // ID ALIASES - map allCourses IDs to existing content
  "hitting-velocity-12week": {
    courseId: "hitting-velocity-12week",
    modules: [
      {
        id: "hv-warmup",
        title: "Warmup & Activation System",
        description: "Preparing for high-intent hitting work with dynamic movement prep",
        lessons: [
          { id: "hv-1-1", title: "Dynamic Warmup for Hitters", description: "Skips, hip mobility, thoracic rotation, med ball warmups to prime the kinetic chain.", duration: "12 min", videoUrl: "", isFree: true },
          { id: "hv-1-2", title: "Bat Speed & Rotational Prep", description: "Top-hand/bottom-hand work, bat path drills, mini-band rotations, overload/underload swings.", duration: "14 min", videoUrl: "", isFree: true },
        ],
      },
      {
        id: "hv-mechanics",
        title: "Advanced Swing Mechanics",
        description: "Hip-rotation sequence, barrel path, and connection through the zone",
        lessons: [
          { id: "hv-2-1", title: "Hip-Rotation Sequence", description: "Lead hip fires first, torso and shoulders follow. Based on research from Driveline and ASMI biomechanics labs.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "hv-2-2", title: "Elite Barrel Path", description: "Smooth on-plane entry with slight upward attack angle (8-15°). Matches MLB average launch angle for line drives.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "hv-2-3", title: "Connection & Posture", description: "Maintaining connection between hands and body through the zone. Front-side firmness for energy transfer.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "hv-2-4", title: "Adjustability & Pitch Coverage", description: "How elite hitters adjust barrel to pitch location while maintaining swing intent and bat speed.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "hv-foundation",
        title: "Weeks 1-4: Foundation Phase",
        description: "Building posture, sequencing, and consistent barrel path",
        lessons: [
          { id: "hv-3-1", title: "Week 1: Posture & Base Setup", description: "Athletic stance, weight distribution, bat angle. Establishing repeatable starting position.", duration: "20 min", videoUrl: "", isFree: false },
          { id: "hv-3-2", title: "Week 2: Sequencing & Load", description: "Proper load mechanics, stride timing, hip-shoulder separation initiation.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "hv-3-3", title: "Week 3: Barrel Path & Contact", description: "On-plane swing path, contact point optimization, staying through the ball.", duration: "20 min", videoUrl: "", isFree: false },
          { id: "hv-3-4", title: "Week 4: Bat Speed Introduction", description: "First intent-based sessions. Overload/underload protocol introduction.", duration: "18 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "hv-power",
        title: "Weeks 5-8: Power Development Phase",
        description: "Building rotational power and increasing intent progressively",
        lessons: [
          { id: "hv-4-1", title: "Week 5: Rotation Power", description: "Med ball scoop tosses, rotational slams. Building ground-force-to-barrel transfer.", duration: "22 min", videoUrl: "", isFree: false },
          { id: "hv-4-2", title: "Week 6: Intent Training", description: "High-intent tee work and front toss. Tracking exit velocity, pushing 90%+ effort.", duration: "20 min", videoUrl: "", isFree: false },
          { id: "hv-4-3", title: "Week 7: Game-Speed Approach", description: "Live BP with approach work. Situational hitting, count-based strategy.", duration: "22 min", videoUrl: "", isFree: false },
          { id: "hv-4-4", title: "Week 8: Gap-to-Gap Power", description: "Directional hitting at high intent. Line drive power to all fields.", duration: "18 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "hv-peak",
        title: "Weeks 9-12: Peak Performance Phase",
        description: "Maximum exit velocity training and competition preparation",
        lessons: [
          { id: "hv-5-1", title: "Week 9: Advanced Barrel Control", description: "Pitch-specific barrel adjustments at max intent. Inside/outside/elevated pitch plans.", duration: "20 min", videoUrl: "", isFree: false },
          { id: "hv-5-2", title: "Week 10: Bat Speed Peak", description: "Overload/underload contrast training. Pushing peak bat speed numbers.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "hv-5-3", title: "Week 11: Max EV Training", description: "Game-simulated high-intent sessions. Exit velocity tracking and competition.", duration: "22 min", videoUrl: "", isFree: false },
          { id: "hv-5-4", title: "Week 12: Testing & Assessment", description: "Final exit velocity testing, bat speed assessment, program review and next-phase planning.", duration: "16 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "hv-drills",
        title: "Elite Hitting Drill Library",
        description: "48 research-backed drills for bat speed and exit velocity development",
        lessons: [
          { id: "hv-6-1", title: "Coil Load & Launch Sequence Drills", description: "10 drills building explosive load-to-launch patterns used by MLB hitters.", duration: "20 min", videoUrl: "", isFree: false },
          { id: "hv-6-2", title: "Overload & Underload Training", description: "Contrast training protocol: heavy bat → light bat → game bat for neural adaptation.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "hv-6-3", title: "Intent Training Sessions", description: "High-intent tee, front toss, and BP protocols. Every swing with 90%+ effort.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "hv-6-4", title: "Ground Force & Connection Drills", description: "Drills emphasizing ground reaction force transfer through the kinetic chain.", duration: "18 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "hv-strength",
        title: "Hitter Strength & Power Add-On",
        description: "Supporting strength work designed specifically for hitters",
        lessons: [
          { id: "hv-7-1", title: "Lower Body Power for Hitters", description: "Trap bar deadlift, split squat, box squat—building the ground force engine.", duration: "20 min", videoUrl: "", isFree: false },
          { id: "hv-7-2", title: "Rotational Power Development", description: "Med ball scoop toss, shot-put throw, cable rotations for hip-to-torso power.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "hv-7-3", title: "Core & Anti-Rotation", description: "Pallof press, suitcase carry, dead bugs—stabilizing the torso for power transfer.", duration: "16 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },
  "elite-speed-agility-12week": {
    courseId: "elite-speed-agility-12week",
    modules: [
      {
        id: "esa12-warmup",
        title: "Warmup & Activation System",
        description: "CNS priming and movement prep for high-level speed work",
        lessons: [
          { id: "esa12-1-1", title: "Dynamic Warmup Protocol", description: "A-Skips, B-Skips, high knees, butt kicks, linear mobility drills. Research-based CNS activation.", duration: "12 min", videoUrl: "", isFree: true },
          { id: "esa12-1-2", title: "Acceleration & Plyometric Prep", description: "Wall drive series, lean-fall sprints, pogo jumps, mini-hurdles. Progressive activation.", duration: "15 min", videoUrl: "", isFree: true },
        ],
      },
      {
        id: "esa12-sprint",
        title: "Sprint Mechanics",
        description: "Acceleration position and top-speed mechanics for baseball athletes",
        lessons: [
          { id: "esa12-2-1", title: "Acceleration Position", description: "45° forward lean, powerful knee punch. First 10 yards determine stolen base success.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "esa12-2-2", title: "Top-Speed Position", description: "Tall posture, front-side mechanics, relaxed upper body. Maintaining speed through 60 yards.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "esa12-2-3", title: "Baseball-Specific Sprint Applications", description: "Home-to-first, stolen base jumps, tagging mechanics, rounding bases.", duration: "18 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "esa12-foundation",
        title: "Weeks 1-4: Foundation Phase",
        description: "Building sprint mechanics and foundational movement patterns",
        lessons: [
          { id: "esa12-3-1", title: "Week 1: Acceleration Foundation", description: "Wall drills, falling starts, 10-yard buildups. Teaching proper push angles.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "esa12-3-2", title: "Week 2: Stride Projection", description: "Hip projection, stride length optimization, arm action mechanics.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "esa12-3-3", title: "Week 3: Stride Frequency", description: "Quick feet drills, rhythm running, turnover development.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "esa12-3-4", title: "Week 4: COD Foundation", description: "Lateral shuffle, crossover step, deceleration basics.", duration: "16 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "esa12-development",
        title: "Weeks 5-8: Development Phase",
        description: "Building reactive speed and multi-directional movement",
        lessons: [
          { id: "esa12-4-1", title: "Week 5: Agility Angles", description: "45°, 90°, and 180° cuts. Teaching efficient body angles for direction change.", duration: "20 min", videoUrl: "", isFree: false },
          { id: "esa12-4-2", title: "Week 6: Reactive Speed", description: "Mirror drills, reaction ball, coach-cued direction changes.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "esa12-4-3", title: "Week 7: Sprint Efficiency", description: "Combining acceleration and top-speed mechanics for 60-yard improvement.", duration: "20 min", videoUrl: "", isFree: false },
          { id: "esa12-4-4", title: "Week 8: Explosive Power Integration", description: "Plyometric-to-sprint complexes. Depth jumps → 10-yard sprints.", duration: "18 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "esa12-peak",
        title: "Weeks 9-12: Peak Phase",
        description: "Sport-specific speed application and testing",
        lessons: [
          { id: "esa12-5-1", title: "Week 9: Sport-Speed Application", description: "Baseball-specific speed: leads, jumps, routes, defensive first-steps.", duration: "20 min", videoUrl: "", isFree: false },
          { id: "esa12-5-2", title: "Week 10: Peak Speed Training", description: "Fly sprints, contrast training, assisted sprints for max velocity.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "esa12-5-3", title: "Week 11: Max COD Ability", description: "Game-speed agility tests, pro agility, L-drill, 5-10-5 competition.", duration: "20 min", videoUrl: "", isFree: false },
          { id: "esa12-5-4", title: "Week 12: Testing Week", description: "60-yard dash, pro agility, vertical jump, broad jump. Full assessment.", duration: "16 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "esa12-drills",
        title: "Elite Drill Library",
        description: "50+ drills for acceleration, agility, and reactive speed",
        lessons: [
          { id: "esa12-6-1", title: "Acceleration Drills (15 Drills)", description: "Wall drives, linear starts, sled pushes, band-resisted sprints.", duration: "20 min", videoUrl: "", isFree: false },
          { id: "esa12-6-2", title: "Top-Speed Drills (10 Drills)", description: "Fly sprints, wicket runs, stride frequency ladders.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "esa12-6-3", title: "Agility & Reactive Drills (15 Drills)", description: "Crossover steps, lateral transitions, mirror drills, reaction starts.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "esa12-6-4", title: "Baseball-Specific Speed Drills (10 Drills)", description: "Lead mechanics, stolen base jumps, defensive first-step reactions.", duration: "16 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "esa12-strength",
        title: "Speed Strength Add-On",
        description: "Supporting strength work for speed development",
        lessons: [
          { id: "esa12-7-1", title: "Lower Body Power for Speed", description: "Trap bar deadlift, single-leg variations, hip thrust for horizontal force.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "esa12-7-2", title: "Plyometric Progressions", description: "Box jumps, depth jumps, bounding—building elastic power for sprinting.", duration: "16 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },
  "strength-conditioning-12week": {
    courseId: "strength-conditioning-12week",
    modules: [
      {
        id: "sc12-assess",
        title: "Assessment & Movement Screening",
        description: "Establish baseline strength, identify limitations, and set training targets",
        lessons: [
          { id: "sc12-1-1", title: "Strength Assessment Protocol", description: "Testing trap bar deadlift, front squat, bench press, pull-ups, and rotational power. Establishing 1RM estimates.", duration: "20 min", videoUrl: "", isFree: true },
          { id: "sc12-1-2", title: "Movement Screening", description: "FMS-based screening: overhead squat, hurdle step, inline lunge, shoulder mobility, active straight leg raise.", duration: "18 min", videoUrl: "", isFree: true },
          { id: "sc12-1-3", title: "Program Setup & Training Maxes", description: "Calculating training maxes, understanding RPE, setting up your training log.", duration: "14 min", videoUrl: "", isFree: true },
        ],
      },
      {
        id: "sc12-foundation",
        title: "Weeks 1-4: Foundation Phase",
        description: "Building movement quality, work capacity, and structural balance",
        lessons: [
          { id: "sc12-2-1", title: "Week 1: Squat & Hinge Foundations", description: "Goblet squat, RDL, hip hinge patterning. 3x8-10 at moderate loads.", duration: "22 min", videoUrl: "", isFree: false },
          { id: "sc12-2-2", title: "Week 2: Push/Pull Balance", description: "Bench press, DB row, overhead press, face pulls. Balanced upper body development.", duration: "20 min", videoUrl: "", isFree: false },
          { id: "sc12-2-3", title: "Week 3: Unilateral & Core", description: "Bulgarian split squat, single-arm DB press, Pallof press, suitcase carry.", duration: "22 min", videoUrl: "", isFree: false },
          { id: "sc12-2-4", title: "Week 4: Power Introduction", description: "Med ball slams, jump squats, explosive push-ups. Teaching rate of force development.", duration: "18 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "sc12-power",
        title: "Weeks 5-8: Power Development Phase",
        description: "Building explosive power, rotational strength, and sport-specific force",
        lessons: [
          { id: "sc12-3-1", title: "Week 5: Olympic Lift Progressions", description: "Hang clean, power clean from blocks. Teaching triple extension for explosive power.", duration: "24 min", videoUrl: "", isFree: false },
          { id: "sc12-3-2", title: "Week 6: Rotational Power", description: "Med ball scoop toss, rotational slam, cable rotation. Baseball-specific power patterns.", duration: "20 min", videoUrl: "", isFree: false },
          { id: "sc12-3-3", title: "Week 7: Plyometric Integration", description: "Depth jumps, bounding, lateral hops. Building reactive strength and elastic power.", duration: "22 min", videoUrl: "", isFree: false },
          { id: "sc12-3-4", title: "Week 8: Contrast Training", description: "Heavy strength → explosive movement pairings. Potentiation for max power output.", duration: "20 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "sc12-peak",
        title: "Weeks 9-12: Peak Performance Phase",
        description: "Maximizing force output, speed-strength, and competition preparation",
        lessons: [
          { id: "sc12-4-1", title: "Week 9: Max Strength Block", description: "Working up to 85-90% 1RM on compound lifts. Low rep, high intent.", duration: "22 min", videoUrl: "", isFree: false },
          { id: "sc12-4-2", title: "Week 10: Speed-Strength", description: "Submaximal loads at max velocity. 50-70% moved as fast as possible.", duration: "20 min", videoUrl: "", isFree: false },
          { id: "sc12-4-3", title: "Week 11: Competition Prep", description: "Reduced volume, maintained intensity. Peaking for performance testing.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "sc12-4-4", title: "Week 12: Testing & Assessment", description: "Re-test all baseline metrics. Program review and next-phase planning.", duration: "16 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "sc12-mobility",
        title: "Mobility & Recovery Protocols",
        description: "Daily movement flows and recovery strategies for baseball athletes",
        lessons: [
          { id: "sc12-5-1", title: "Pre-Training Mobility Flow", description: "Hip 90/90, T-spine rotation, ankle mobility, shoulder CARs. 10-minute daily protocol.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "sc12-5-2", title: "Post-Training Recovery", description: "Foam rolling, static stretching, breathing protocols for parasympathetic recovery.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "sc12-5-3", title: "Sleep & Nutrition for Performance", description: "Research-based sleep hygiene, protein timing, hydration strategies for baseball athletes.", duration: "16 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "sc12-drills",
        title: "Exercise Library (60+ Exercises)",
        description: "Complete exercise library with video demos and coaching cues",
        lessons: [
          { id: "sc12-6-1", title: "Lower Body Exercises", description: "Squat variations, deadlift variations, lunge patterns, hip thrust, step-ups.", duration: "20 min", videoUrl: "", isFree: false },
          { id: "sc12-6-2", title: "Upper Body Exercises", description: "Bench variations, row variations, overhead press, pull-ups, face pulls.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "sc12-6-3", title: "Power & Plyometric Exercises", description: "Olympic lifts, med ball throws, jumps, bounds, reactive drills.", duration: "20 min", videoUrl: "", isFree: false },
          { id: "sc12-6-4", title: "Core & Rotational Exercises", description: "Anti-rotation, anti-extension, rotational power, carry variations.", duration: "16 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },
  "elite-mindset-10week": {
    courseId: "elite-mindset-10week",
    modules: [
      {
        id: "em10-pillars",
        title: "Mental Performance Pillars",
        description: "The five core pillars of championship-level mental strength",
        lessons: [
          { id: "em10-1-1", title: "The Five Pillars Overview", description: "Confidence, Focus, Emotional Speed, Self-Talk, and Competitive Identity. Built through repetition and proof.", duration: "12 min", videoUrl: "", isFree: true },
          { id: "em10-1-2", title: "Mental Performance Assessment", description: "Evaluate your current mental game across all 5 pillars. Identify strengths and gaps.", duration: "15 min", videoUrl: "", isFree: true },
        ],
      },
      {
        id: "em10-week1",
        title: "Week 1: Identity & Purpose",
        description: "Athletes perform best when they understand who they are and why they compete",
        lessons: [
          { id: "em10-2-1", title: "Define Who You Are", description: "Create your Athlete Identity Statement. Based on research: identity drives behavior, behavior drives results.", duration: "15 min", videoUrl: "", isFree: false },
          { id: "em10-2-2", title: "Champion Discipline Challenge", description: "Complete 1 full day of 'no excuses' discipline checklist. Build the habit of elite standards.", duration: "10 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "em10-week2",
        title: "Week 2: Confidence & Self-Talk",
        description: "True confidence = Reps + Preparation + Belief. Self-talk controls performance.",
        lessons: [
          { id: "em10-3-1", title: "The Confidence Equation", description: "Confidence isn't born—it's built. Learn the preparation-based confidence system.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "em10-3-2", title: "Reframing Negative Thoughts", description: "Techniques for shifting internal language from fear-based to attack-based patterns.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "em10-week3",
        title: "Week 3: Focus & Attention Control",
        description: "Elite focus is a trainable skill, not a personality trait",
        lessons: [
          { id: "em10-4-1", title: "Selective Attention Training", description: "Training your brain to focus on what matters and ignore distractions. Narrowing and widening focus on command.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "em10-4-2", title: "Pre-Pitch Focus Routine", description: "Building a consistent mental routine before every pitch—hitting and pitching.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "em10-week4",
        title: "Week 4: Emotional Speed",
        description: "The ability to recover from mistakes faster than your opponent",
        lessons: [
          { id: "em10-5-1", title: "The 6-Second Reset Routine", description: "Mistake → Breath → Reset → Refocus. Based on sport psychology research on emotional recovery.", duration: "10 min", videoUrl: "", isFree: false },
          { id: "em10-5-2", title: "Performance Breathing", description: "Box breath (4-4-4-4), 4-2-6 breath for activation/calming. Train emotional neutrality.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "em10-week5",
        title: "Week 5: Visualization System",
        description: "5-minute daily visualization routines used by elite performers",
        lessons: [
          { id: "em10-6-1", title: "5-Minute Visualization Routine", description: "Daily pre-game visualization practice. See it, feel it, execute it.", duration: "10 min", videoUrl: "", isFree: false },
          { id: "em10-6-2", title: "Confidence Anchors & Reset Words", description: "Creating mental triggers that instantly activate your best performance state.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "em10-week67",
        title: "Weeks 6-7: Pressure & Resilience",
        description: "Systematic pressure inoculation and bounce-back training",
        lessons: [
          { id: "em10-7-1", title: "Pressure Inoculation Training", description: "Progressively expose yourself to increasing pressure to build tolerance and resilience.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "em10-7-2", title: "Adversity Response Protocol", description: "How to respond to failure, bad calls, errors. The 'next play' mentality system.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "em10-7-3", title: "Slump-Busting Framework", description: "Structured approach to breaking out of performance slumps using process focus.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "em10-week89",
        title: "Weeks 8-9: Leadership & Championship Habits",
        description: "Building team leadership and daily championship routines",
        lessons: [
          { id: "em10-8-1", title: "Leadership by Example", description: "How to lead without a title. Body language, energy, and effort as leadership tools.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "em10-8-2", title: "Championship Daily Routine", description: "Morning routine, pre-game routine, post-game review. Building consistency.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "em10-8-3", title: "Team Culture & Accountability", description: "Creating an environment where elite standards are the norm, not the exception.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "em10-week10",
        title: "Week 10: Integration & Testing",
        description: "Bringing all mental skills together for competition",
        lessons: [
          { id: "em10-9-1", title: "Mental Skills Integration", description: "Combining all 5 pillars into a seamless game-day mental performance system.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "em10-9-2", title: "Competition Mental Checklist", description: "Your personalized pre-game, in-game, and post-game mental performance checklist.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "em10-9-3", title: "Final Assessment & Maintenance Plan", description: "Re-assess all 5 pillars. Build your ongoing mental performance maintenance plan.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },
  "winning-mindset-10week": {
    courseId: "winning-mindset-10week",
    modules: [
      {
        id: "wm-intro",
        title: "Introduction & Program Goals",
        description: "Building elite confidence, mental toughness, and competitive resilience",
        lessons: [
          { id: "wm-1-1", title: "Program Overview", description: "A 10-week mental performance system for athletes who want to think, act, and perform like elite competitors.", duration: "10 min", videoUrl: "", isFree: true },
          { id: "wm-1-2", title: "Weekly Structure", description: "Mental lessons, daily tasks, journal prompts, and weekly challenges.", duration: "8 min", videoUrl: "", isFree: true },
        ],
      },
      {
        id: "wm-week1",
        title: "Week 1: Identity & Purpose",
        description: "Athletes perform best when they understand who they are",
        lessons: [
          { id: "wm-2-1", title: "Define Who You Are", description: "Creating your Athlete Identity Statement and long-term vision.", duration: "15 min", videoUrl: "", isFree: false },
          { id: "wm-2-2", title: "Champion Discipline Challenge", description: "Complete 1 full day of 'no excuses' discipline checklist.", duration: "10 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "wm-week2",
        title: "Week 2: Confidence Building",
        description: "Confidence = Reps + Preparation + Belief",
        lessons: [
          { id: "wm-3-1", title: "The Confidence Equation", description: "How preparation creates unshakeable confidence.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "wm-3-2", title: "Positive Self-Talk Rewiring", description: "Replace fear-based language with attack-based language.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "wm-week34",
        title: "Weeks 3-4: Focus & Emotional Control",
        description: "Developing focus and emotional control under pressure",
        lessons: [
          { id: "wm-4-1", title: "Selective Attention", description: "Training your brain to lock in on what matters.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "wm-4-2", title: "Emotional Speed Training", description: "Recovering from mistakes faster than anyone else.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "wm-4-3", title: "The Reset Routine", description: "6-second physical and mental reset after every play.", duration: "10 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "wm-week56",
        title: "Weeks 5-6: Visualization & Pressure",
        description: "Mental rehearsal and pressure inoculation",
        lessons: [
          { id: "wm-5-1", title: "5-Minute Visualization", description: "Daily visualization practice for pre-game preparation.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "wm-5-2", title: "Pressure Inoculation", description: "Systematically building tolerance to high-pressure situations.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "wm-week78",
        title: "Weeks 7-8: Resilience & Adversity",
        description: "Building mental toughness through adversity response training",
        lessons: [
          { id: "wm-6-1", title: "Adversity Response Protocol", description: "How champions respond to failure, bad calls, and adversity.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "wm-6-2", title: "Slump-Busting System", description: "Structured approach to breaking performance slumps.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "wm-week910",
        title: "Weeks 9-10: Leadership & Championship Habits",
        description: "Leading by example and building championship routines",
        lessons: [
          { id: "wm-7-1", title: "Leadership Without a Title", description: "Body language, energy, and effort as leadership tools.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "wm-7-2", title: "Championship Daily Routine", description: "Morning, pre-game, post-game routines for elite consistency.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "wm-7-3", title: "Performance Consistency System", description: "Bringing all mental skills together for daily excellence.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },
  // MISSING COURSES - Full content
  "youth-vertical-6week": {
    courseId: "youth-vertical-6week",
    modules: [
      {
        id: "yv-intro",
        title: "Program Introduction & Safety",
        description: "Age-appropriate plyometric training foundations for athletes ages 9-13",
        lessons: [
          { id: "yv-1-1", title: "Program Overview & Safety Rules", description: "Understanding plyometric training for young athletes. Landing mechanics are priority #1.", duration: "10 min", videoUrl: "", isFree: true },
          { id: "yv-1-2", title: "Landing Mechanics Assessment", description: "Teaching proper landing position: knees over toes, soft landings, absorbing force safely.", duration: "12 min", videoUrl: "", isFree: true },
        ],
      },
      {
        id: "yv-week12",
        title: "Weeks 1-2: Landing & Absorption",
        description: "Teaching the body to absorb force safely before producing force",
        lessons: [
          { id: "yv-2-1", title: "Snap Downs & Stick Landings", description: "Dropping from heights and sticking the landing. Building eccentric strength.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "yv-2-2", title: "Pogo Jumps & Mini-Hurdles", description: "Quick, low-amplitude jumps building ankle stiffness and ground contact efficiency.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "yv-2-3", title: "Box Step-Downs & Drop Landings", description: "Controlled eccentric loading from progressive heights (6-12 inches).", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "yv-week34",
        title: "Weeks 3-4: Takeoff & Power",
        description: "Building explosive takeoff mechanics and jump technique",
        lessons: [
          { id: "yv-3-1", title: "Arm Swing Loaders", description: "Teaching the arm swing as a power amplifier. Coordinating upper and lower body.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "yv-3-2", title: "Box Jumps (Introductory)", description: "Safe box jump technique starting at 12 inches. Focus on landing, not height.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "yv-3-3", title: "Broad Jumps & Bounding", description: "Horizontal power development through broad jumps and simple bounding patterns.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "yv-week56",
        title: "Weeks 5-6: Integration & Testing",
        description: "Combining skills and measuring improvement",
        lessons: [
          { id: "yv-4-1", title: "Jump Circuit Training", description: "Combining pogo jumps, box jumps, broad jumps, and vertical jumps in circuits.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "yv-4-2", title: "Reactive Jump Games", description: "Fun, competitive jump activities that build reactive ability in game-like settings.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "yv-4-3", title: "Testing Day & Progress Review", description: "Vertical jump test, broad jump test. Compare to baseline and celebrate progress.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },
  "elite-vertical-12week": {
    courseId: "elite-vertical-12week",
    modules: [
      {
        id: "ev-intro",
        title: "Program Introduction & Baseline Testing",
        description: "Establishing baseline metrics and understanding the training methodology",
        lessons: [
          { id: "ev-1-1", title: "Program Overview & Methodology", description: "French contrast, plyometric periodization, and force-velocity profiling for vertical jump development.", duration: "14 min", videoUrl: "", isFree: true },
          { id: "ev-1-2", title: "Baseline Testing Protocol", description: "Standing vertical, approach vertical, broad jump, drop jump reactive strength index.", duration: "16 min", videoUrl: "", isFree: true },
        ],
      },
      {
        id: "ev-foundation",
        title: "Weeks 1-4: Strength Foundation",
        description: "Building the force production base for explosive jump performance",
        lessons: [
          { id: "ev-2-1", title: "Week 1: Squat & Hinge Patterns", description: "Back squat, trap bar deadlift, RDL. Building max strength as the foundation.", duration: "20 min", videoUrl: "", isFree: false },
          { id: "ev-2-2", title: "Week 2: Unilateral Strength", description: "Bulgarian split squat, step-ups, single-leg RDL. Correcting asymmetries.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "ev-2-3", title: "Week 3: Plyometric Introduction", description: "Snap downs, pogo jumps, box jumps with emphasis on landing quality.", duration: "20 min", videoUrl: "", isFree: false },
          { id: "ev-2-4", title: "Week 4: Force Production Testing", description: "Mid-program strength check. Adjusting loads for the next phase.", duration: "16 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "ev-power",
        title: "Weeks 5-8: Power Development",
        description: "Converting strength into explosive power through contrast and complex training",
        lessons: [
          { id: "ev-3-1", title: "Week 5: French Contrast Method", description: "Heavy squat → jump squat → drop jump → assisted jump. Post-activation potentiation.", duration: "22 min", videoUrl: "", isFree: false },
          { id: "ev-3-2", title: "Week 6: Depth Jump Progressions", description: "Progressive depth jumps from 12-30 inches. Building reactive strength index.", duration: "20 min", videoUrl: "", isFree: false },
          { id: "ev-3-3", title: "Week 7: Approach Jump Training", description: "1-step, 2-step, and full approach jump technique. Sport-specific power application.", duration: "22 min", videoUrl: "", isFree: false },
          { id: "ev-3-4", title: "Week 8: Complex Training Circuits", description: "Strength-power complexes designed to maximize rate of force development.", duration: "20 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "ev-peak",
        title: "Weeks 9-12: Peak Phase",
        description: "Peaking vertical jump performance through reduced volume and max intent",
        lessons: [
          { id: "ev-4-1", title: "Week 9: Max Intent Plyometrics", description: "Low volume, maximum effort jumps. Every rep at 100% intent.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "ev-4-2", title: "Week 10: Sport-Specific Application", description: "Applying vertical power to baseball: explosive starts, stolen base jumps, defensive reactions.", duration: "20 min", videoUrl: "", isFree: false },
          { id: "ev-4-3", title: "Week 11: Taper & Potentiation", description: "Reducing volume, maintaining intensity. Preparing the body for peak output.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "ev-4-4", title: "Week 12: Final Testing & Review", description: "Re-test all baseline metrics. Compare gains. Plan maintenance or next cycle.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "ev-drills",
        title: "Elite Plyometric Drill Library",
        description: "42 progressive plyometric exercises with video demonstrations",
        lessons: [
          { id: "ev-5-1", title: "Landing & Absorption Drills", description: "Snap downs, altitude landings, eccentric box step-downs.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "ev-5-2", title: "Bilateral Jump Drills", description: "Box jumps, squat jumps, countermovement jumps, tuck jumps.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "ev-5-3", title: "Depth & Reactive Drills", description: "Depth jumps, depth drops to broad jump, reactive hurdle hops.", duration: "20 min", videoUrl: "", isFree: false },
          { id: "ev-5-4", title: "Single-Leg Power Drills", description: "Single-leg box jumps, bounding, single-leg depth drops.", duration: "16 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },
  "arm-care-complete": {
    courseId: "arm-care-complete",
    modules: [
      {
        id: "acc-intro",
        title: "Arm Care System Overview",
        description: "Why arm care is non-negotiable organizational policy, not optional extra work",
        lessons: [
          { id: "acc-1-1", title: "The Arm Care Philosophy", description: "68% of arm injuries are preventable. Arm care is performance work, not rehab. Based on ASMI research.", duration: "12 min", videoUrl: "", isFree: true },
          { id: "acc-1-2", title: "Workload Management Principles", description: "Acute:Chronic Workload Ratio (ACWR), pitch count guidelines, and intent-based volume management.", duration: "14 min", videoUrl: "", isFree: true },
        ],
      },
      {
        id: "acc-prethrow",
        title: "Pre-Throw Protocols",
        description: "Daily preparation routines to perform before any throwing activity",
        lessons: [
          { id: "acc-2-1", title: "Mobility Flow (10 min)", description: "T-spine rotations, shoulder CARs, hip 90/90, ankle mobility. Daily non-negotiable.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "acc-2-2", title: "Activation Series", description: "Band external rotations, serratus wall slides, scap push-ups, prone Y-T-W.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "acc-2-3", title: "Progressive Warmup Throwing", description: "Light catch → long toss → intent buildup. Never throw cold. Progressive intensity ramp.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "acc-postthrow",
        title: "Post-Throw Protocols",
        description: "Recovery routines to perform within 15 minutes of finishing throwing",
        lessons: [
          { id: "acc-3-1", title: "Immediate Post-Throw (0-15 min)", description: "Light band work, compression, breathing exercises. Parasympathetic activation.", duration: "10 min", videoUrl: "", isFree: false },
          { id: "acc-3-2", title: "Extended Recovery (Same Day)", description: "Foam rolling, gentle stretching, cold therapy guidelines, nutrition timing.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "acc-3-3", title: "Next-Day Recovery Protocol", description: "Light movement, blood flow work, arm care circuit. Assessing readiness for next throw.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "acc-workload",
        title: "Workload Tracking System",
        description: "How to monitor and manage throwing volume, intensity, and recovery",
        lessons: [
          { id: "acc-4-1", title: "Throw Counting & Intent Zones", description: "Zone 1 (recovery), Zone 2 (moderate), Zone 3 (high intent). Daily volume by zone.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "acc-4-2", title: "ACWR Monitoring", description: "Calculating and tracking Acute:Chronic Workload Ratio. Staying in the 0.8-1.3 sweet spot.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "acc-4-3", title: "Red Flag Recognition", description: "When to shut it down: soreness scales, velocity drops, mechanical changes that signal overuse.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "acc-strength",
        title: "Arm Strength & Tissue Resilience",
        description: "Building durable throwing arms through progressive loading",
        lessons: [
          { id: "acc-5-1", title: "Eccentric Arm Strengthening", description: "Eccentric ER, reverse throws, deceleration work. Building the brakes, not just the engine.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "acc-5-2", title: "Scapular Stabilization", description: "Scap push-ups, serratus activation, lower trap work. Shoulder blade as the platform.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "acc-5-3", title: "Rotator Cuff Strengthening", description: "ER/IR at multiple angles, prone external rotation, side-lying rotations.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "acc-5-4", title: "Elbow & Wrist Care", description: "Forearm pronation/supination, wrist curls, flexor mass care. Protecting the UCL.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "acc-return",
        title: "Return-to-Throw Guidelines",
        description: "Structured protocols for returning to throwing after rest or injury",
        lessons: [
          { id: "acc-6-1", title: "Post-Rest Ramp-Up Protocol", description: "After 7+ days off: progressive 14-day ramp back to full intensity.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "acc-6-2", title: "Post-Injury Return Framework", description: "Working with medical staff: phases, milestones, clearance criteria.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "acc-6-3", title: "Season-Long Arm Care Calendar", description: "Month-by-month arm care adjustments across off-season, pre-season, and in-season.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },
  "mobility-durability": {
    courseId: "mobility-durability",
    modules: [
      {
        id: "md-intro",
        title: "Mobility & Durability Overview",
        description: "Why mobility is the foundation of longevity in baseball",
        lessons: [
          { id: "md-1-1", title: "The Mobility-Performance Connection", description: "Research shows mobility limitations are the #1 predictor of injury in baseball athletes.", duration: "12 min", videoUrl: "", isFree: true },
          { id: "md-1-2", title: "Movement Assessment", description: "Self-assessment for hip, shoulder, T-spine, and ankle mobility. Identify your priority areas.", duration: "14 min", videoUrl: "", isFree: true },
        ],
      },
      {
        id: "md-hip",
        title: "Hip Mobility System",
        description: "Complete hip mobility for all baseball positions",
        lessons: [
          { id: "md-2-1", title: "Hip Internal/External Rotation", description: "90/90 progressions, hip CARs, pigeon variations. Essential for rotation and power.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "md-2-2", title: "Hip Flexor & Adductor Mobility", description: "Half-kneeling stretches, adductor rockbacks, active hip flexor work.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "md-2-3", title: "Catcher & Pitcher-Specific Hip Work", description: "Deep squat mobility for catchers, hip separation drills for pitchers.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "md-shoulder",
        title: "Shoulder Health System",
        description: "Maintaining shoulder range of motion and stability for throwers",
        lessons: [
          { id: "md-3-1", title: "Shoulder CARs & Passive Range", description: "Controlled articular rotations, sleeper stretches, cross-body stretching.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "md-3-2", title: "Scapular Mobility & Stability", description: "Scap CARs, wall slides, push-up plus, bear crawls.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "md-3-3", title: "Thrower's Shoulder Maintenance", description: "Managing GIRD (glenohumeral internal rotation deficit) common in throwers.", duration: "16 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "md-tspine",
        title: "Thoracic Spine Mobility",
        description: "T-spine rotation is essential for every movement in baseball",
        lessons: [
          { id: "md-4-1", title: "T-Spine Rotation Drills", description: "Open books, thread the needle, seated rotations. Building rotational capacity.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "md-4-2", title: "T-Spine Extension Work", description: "Foam roller extensions, cat-cow, wall angel progressions.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "md-ankle",
        title: "Ankle & Lower Leg",
        description: "Ankle mobility for squatting, sprinting, and defensive movement",
        lessons: [
          { id: "md-5-1", title: "Ankle Dorsiflexion Drills", description: "Wall ankle stretches, banded ankle mobs, half-kneeling ankle work.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "md-5-2", title: "Foot & Calf Complex", description: "Toe yoga, calf raises, arch strengthening. The foundation of all movement.", duration: "10 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "md-flows",
        title: "Daily Movement Flows",
        description: "10-15 minute daily routines for consistent mobility maintenance",
        lessons: [
          { id: "md-6-1", title: "Morning Movement Flow (10 min)", description: "Wake-up routine: cat-cow, hip CARs, T-spine rotation, shoulder CARs, ankle circles.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "md-6-2", title: "Pre-Training Flow (12 min)", description: "Position-specific mobility prep before strength, throwing, or skill work.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "md-6-3", title: "Recovery Day Flow (15 min)", description: "Extended mobility session for off-days. Full-body joint-by-joint approach.", duration: "16 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "md-recovery",
        title: "Recovery & Tissue Quality",
        description: "Self-massage, breathing, and sleep optimization",
        lessons: [
          { id: "md-7-1", title: "Foam Rolling & Self-Massage", description: "Evidence-based foam rolling protocols. What works and what's a waste of time.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "md-7-2", title: "Breathing for Recovery", description: "Diaphragmatic breathing, box breathing, 4-7-8 sleep protocol.", duration: "10 min", videoUrl: "", isFree: false },
          { id: "md-7-3", title: "Sleep Optimization for Athletes", description: "Sleep hygiene, blue light management, pre-sleep routine. 7-9 hours is non-negotiable.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "md-assess",
        title: "Self-Assessment & Maintenance",
        description: "Ongoing self-assessment tools for long-term mobility maintenance",
        lessons: [
          { id: "md-8-1", title: "Monthly Mobility Re-Assessment", description: "Re-test all baseline metrics. Identify new priority areas.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "md-8-2", title: "Building Your Personal Mobility Plan", description: "Create a customized daily mobility routine based on your assessment results.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },
  "competitive-execution": {
    courseId: "competitive-execution",
    modules: [
      {
        id: "ce-intro",
        title: "Competitive Execution Overview",
        description: "Why practice performance and game performance are different—and how to close the gap",
        lessons: [
          { id: "ce-1-1", title: "The Execution Gap", description: "Research shows 40-60% of trained skills fail to transfer to competition. Understanding why.", duration: "12 min", videoUrl: "", isFree: true },
          { id: "ce-1-2", title: "Transfer Rate Assessment", description: "Measure your current practice-to-game execution percentage across key skills.", duration: "14 min", videoUrl: "", isFree: true },
        ],
      },
      {
        id: "ce-intent",
        title: "Game-Speed Intent Training",
        description: "Every rep at game speed, game intensity, game consequences",
        lessons: [
          { id: "ce-2-1", title: "Intent-Based Practice Design", description: "Structuring practice so every rep carries game-level intent and consequence.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "ce-2-2", title: "Game-Speed Hitting Blocks", description: "Live BP with count sequences, situational approach, and outcome tracking.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "ce-2-3", title: "Competitive Pitching Sessions", description: "Bullpens with hitter simulation, count management, and location grading.", duration: "16 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "ce-pressure",
        title: "Pressure Simulation",
        description: "Creating game-like pressure in controlled training environments",
        lessons: [
          { id: "ce-3-1", title: "Pressure Drill Framework", description: "Adding consequences, time limits, audience, and competition to every drill.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "ce-3-2", title: "Clutch Situation Training", description: "2-out, runner on 3rd. Full count, 2 outs. Creating clutch reps daily.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "ce-3-3", title: "Team Competition Days", description: "Structured competition formats: King of the Diamond, Situational Wars.", duration: "18 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "ce-decision",
        title: "Decision-Making Under Pressure",
        description: "Training the brain to make better decisions faster in competition",
        lessons: [
          { id: "ce-4-1", title: "Perception-Action Coupling", description: "Read the cue → react in real-time. Reducing the gap between seeing and doing.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "ce-4-2", title: "Constraint-Led Decision Drills", description: "Manipulating rules, equipment, and environment to force better decisions.", duration: "18 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "ce-retest",
        title: "Retesting & Progress Tracking",
        description: "Measuring competitive execution improvement over time",
        lessons: [
          { id: "ce-5-1", title: "Bi-Weekly Execution Assessment", description: "Structured game-situation testing protocol. Track transfer rate improvement.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "ce-5-2", title: "Video Analysis for Transfer", description: "Comparing practice video to game video to identify mechanical differences.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "ce-5-3", title: "Post-Game Self-Assessment", description: "5-minute post-game review framework: what transferred, what didn't, what to adjust.", duration: "10 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "ce-compete",
        title: "Competition Prep Protocols",
        description: "Pre-game preparation that primes execution",
        lessons: [
          { id: "ce-6-1", title: "Pre-Game Physical Preparation", description: "Activation, mobility, throwing progression, batting practice structure.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "ce-6-2", title: "Pre-Game Mental Preparation", description: "Visualization, approach plan, emotional readiness check.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "ce-6-3", title: "In-Game Adjustment Framework", description: "How to adjust approach mid-game based on real-time feedback and results.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },
};

export const getCourseContent = (courseId: string): CourseContent | undefined => {
  return courseContent[courseId];
};

// ─── VAULT™ Deep Research Course Modules ──────────────────────────────────────
// All content is original, evidence-based, and drawn from publicly available
// sports science research. No copyrighted instructional content reproduced.

export const vaultResearchNotes = {
  hitting_biomechanics: {
    title: "VAULT™ Hitting Science Reference",
    disclaimer: "For educational use within VAULT™ platform. All content is original and based on published biomechanical research.",
    modules: [
      {
        concept: "Exit Velocity & Bat Speed Relationship",
        research_basis: "Published biomechanical studies (Journal of Sports Sciences, American Journal of Sports Medicine) consistently show bat-to-ball speed transfer efficiency is the primary driver of exit velocity. Bat speed at contact zone (not at load) is the actionable variable.",
        training_applications: [
          "Intent-based hitting: max-effort swings into net or off tee build bat speed more effectively than contact-focused reps",
          "Attack angle optimization: slight upward attack angle (8-15°) increases barrel-on-ball probability in the strike zone",
          "Hip-to-shoulder sequencing: hips should lead rotation; shoulder drag = power leak",
          "Ground force utilization: vertical force into ground on load → horizontal transfer at swing initiation",
        ],
        common_errors: [
          "Casting: arms extending too early, reduces barrel acceleration distance",
          "Spinning on back foot: reduces forward weight transfer and hip rotation speed",
          "Hitch with hands: delays attack to zone, limits adjustment capacity",
        ],
      },
      {
        concept: "Pitch Recognition & Cognitive Load",
        research_basis: "Research from UC San Diego Vision Center and MLB-commissioned studies show elite hitters make swing decisions at approximately 150ms post-release — before the ball reaches halfway to the plate. Decision is pattern recognition, not real-time tracking.",
        training_applications: [
          "Varied pitch exposure in practice (not just fastballs) — pattern library development",
          "Front toss and live BP with multiple pitch types to build recognition reps",
          "Slow down the film study: understanding pitcher tendencies builds anticipation",
          "Approach-based hitting: having a plan at the plate reduces cognitive load",
        ],
      },
    ],
  },
  pitching_biomechanics: {
    title: "VAULT™ Pitching Science Reference",
    disclaimer: "Educational reference only. All content original and based on published biomechanics literature.",
    modules: [
      {
        concept: "Velocity & Arm Health — The Trade-Off Model",
        research_basis: "Fleisig & Andrews (American Sports Medicine Institute) established that throwing velocity and injury risk are correlated — not because velocity causes injury, but because poor mechanics + high velocity do. Efficient mechanics can produce high velocity with acceptable stress levels.",
        key_principles: [
          "Hip-shoulder separation creates 'preloading' — the torso stores elastic energy that unwinds into the arm",
          "Lead leg block converts forward momentum into rotational energy — poor blocking = arm drag injury risk",
          "Late arm layback is protective if achieved through external rotation, not through trunk opening early",
          "Elbow height at foot strike: below shoulder = increased UCL stress",
        ],
        injury_prevention: [
          "Pitch counts are a proxy for workload, not a guarantee of safety — high-effort throws off a mound ≠ low-effort long toss throws",
          "Modern research supports long toss as arm conditioning, not just warm-up",
          "Weighted balls have evidence for velocity gains BUT require proper protocol — not recommended without coach supervision",
          "Fatigue is the primary mechanical breakdown risk factor — velocity drop = stop",
        ],
      },
      {
        concept: "Spin Rate & Pitch Movement",
        research_basis: "Since Statcast data became public (2015+), relationship between spin rate, spin axis, and pitch movement has been extensively documented. True spin (active spin) creates Magnus effect movement; gyrospin does not.",
        key_principles: [
          "Fastball: higher spin + backspin axis = 'rise' effect (ball falls less than expected)",
          "Curveball: topspin creates downward break; glove-side axis creates sweep",
          "Slider: combination of side spin and gyro spin — less Magnus, more defined late break",
          "Grip and finger pressure create spin efficiency — small grip changes = large movement changes",
        ],
      },
    ],
  },
  speed_athleticism: {
    title: "VAULT™ Speed & Athleticism Science Reference",
    modules: [
      {
        concept: "60-Yard Dash Training",
        research_basis: "Sprint biomechanics research establishes three distinct phases: acceleration (0-20yd), transition (20-40yd), and top speed (40-60yd). First-step explosive strength is the primary factor for 0-20yd; max velocity mechanics matter 20-60yd.",
        training_applications: [
          "Block starts and acceleration mechanics: positive shin angle, triple extension, low ground contact time",
          "Sprint posture: forward lean reduces as speed increases — do NOT overly lean at top speed",
          "Arm action: drives leg turnover — tight, fast arms = faster legs",
          "Strength training correlation: athletes with higher relative strength (to body weight) consistently run faster 60s",
        ],
      },
    ],
  },
};

// ─── SOFTBALL COURSE CONTENT ────────────────────────────────────────────────
// All content is original VAULT™ curriculum. Video URLs are structured for
// admin upload via the course video management system.

export const softballCourseContentMap: Record<string, CourseContent> = {
  "softball-hitting-complete": {
    courseId: "softball-hitting-complete",
    modules: [
      {
        id: "sfh-m1",
        title: "Module 1: Stance, Load & Timing",
        description: "The foundation of elite fastpitch hitting — everything starts before the pitch arrives",
        lessons: [
          { id: "sfh-1-1", title: "Athletic Stance & Weight Distribution", description: "Fastpitch requires a more upright stance than baseball due to pitch height. Feet shoulder-width, weight on balls of feet, slight knee bend. Research: NCAA D1 hitters average 55-45% weight distribution (back-front) at stance.", duration: "14 min", videoUrl: "", isFree: true },
          { id: "sfh-1-2", title: "Hip Load & Trigger Mechanism", description: "The hip load (inward turn of front hip) creates pre-torque in the rotational chain. Creates 15-20% more rotational force than a static stance. This is the single biggest mechanical difference between JV and varsity-level hitters.", duration: "16 min", videoUrl: "", isFree: true },
          { id: "sfh-1-3", title: "Timing Against Rise Ball, Drop, Change-Up", description: "Fastpitch pitch recognition window is ~0.35 seconds vs ~0.4 seconds in baseball. The rise ball (most common elite pitch) moves 4-8 inches late. Timing adjustment: start swing earlier, let ball travel longer.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "sfh-1-4", title: "Stride vs No-Stride Approaches", description: "Research shows elite fastpitch hitters use shorter strides (2-4 inches) or no stride at all to reduce timing variability against movement pitches. Heavy stride = timing vulnerability against the rise.", duration: "15 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "sfh-m2",
        title: "Module 2: The Swing — Path, Attack Angle & Contact",
        description: "Building a mechanically efficient swing for fastpitch conditions",
        lessons: [
          { id: "sfh-2-1", title: "Ideal Attack Angle for Fastpitch", description: "Published Trackman fastpitch data shows optimal attack angle is 0-8° for line drives against rise ball. Baseball optimal is 8-15°. The pitch trajectory is different — the swing must account for it.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "sfh-2-2", title: "Hip-Shoulder Separation in the Box", description: "Hip rotation initiates 40ms before shoulder rotation in elite hitters. This lag creates rotational whip. Drill: feel hips fully open before hands move forward. Video analysis of your swing split this.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "sfh-2-3", title: "Bat Path & Barrel Efficiency", description: "Barrel stays in the hitting zone longer = more margin for error. Short to the ball, long through it. Blast Motion data: elite fastpitch hitters have 8-12ms longer barrel-in-zone time than average.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "sfh-2-4", title: "Contact Point Positioning by Pitch Location", description: "Outside pitch: contact point moves back 2-4 inches, drive to opposite field. Inside pitch: contact point moves forward, pull-side power. Middle: contact at front hip for maximum power.", duration: "15 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "sfh-m3",
        title: "Module 3: Bat Speed Development",
        description: "Data-driven bat speed improvement — the #1 exit velocity driver",
        lessons: [
          { id: "sfh-3-1", title: "Overload/Underload Training for Bat Speed", description: "Research (DeRenne, University of Hawaii): alternating overload (34-35oz) and underload (25-27oz) training sessions increases bat speed 3-7mph over 8 weeks vs training with standard weight only. Protocol: 3 sets underload, 3 sets overload, 3 sets standard.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "sfh-3-2", title: "Intent-Based Hitting Sessions", description: "Max intent swings (trying to hit as hard as possible) activate fast-twitch fibers more effectively than contact-focused swings. NSCA research: 4-6 max-intent swings per set with full rest produces superior bat speed gains to high-rep, moderate-intent sets.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "sfh-3-3", title: "Rotational Strength Training for Hitters", description: "Med ball rotational throws, landmine rotations, and anti-rotation cable work directly improve bat speed. A 10% increase in rotational power = approximately 2-3mph bat speed increase. Position in strength program: after neurally fresh, not at end of session.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "sfh-3-4", title: "Tracking Bat Speed Progress — Blast Motion Integration", description: "Tracking bat speed weekly catches regressions early. Typical improvement trajectory: 2-3mph in first 4 weeks, plateau at week 6-8, breakthrough after mechanical integration. How to interpret your Blast Motion data.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "sfh-m4",
        title: "Module 4: Slap Hitting System",
        description: "Left-handed slap hitting — the most dangerous offensive weapon in fastpitch",
        lessons: [
          { id: "sfh-4-1", title: "Slap Fundamentals — Footwork & Timing", description: "The slap requires a running start from the left batter's box. Three footwork patterns: power slap (stay in box), running slap (exit box), and fake slap-drive. Each has specific tactical applications.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "sfh-4-2", title: "Contact Point & Direction Control", description: "Elite slappers redirect pitches to holes, not gaps. Wrist pronation late creates a cut/chop action. Down-plane contact = ground ball through infield. Targeting: shortstop-3B hole (65% of slap attempts) vs 3B-P hole (35%).", duration: "16 min", videoUrl: "", isFree: false },
          { id: "sfh-4-3", title: "Reading Infield Positioning & Defensive Adjustments", description: "Slap decision tree: Are infielders playing at normal depth? Crash right? Where is the gap? Elite slappers read pre-pitch positioning and have their target zone decided before the pitcher releases.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },

  "softball-pitching-elite": {
    courseId: "softball-pitching-elite",
    modules: [
      {
        id: "sfp-m1",
        title: "Module 1: Mechanics Foundation & Velocity",
        description: "The kinematic chain for fastpitch pitching — from ground to release",
        lessons: [
          { id: "sfp-1-1", title: "The Windmill Kinematic Chain", description: "Fastpitch velocity chain: push-off (ground force) → hip drive → torso rotation → shoulder internal rotation → wrist snap at release. ASMI research shows hip drive contributes ~38% of pitch velocity. Deficiency here cannot be compensated arm-side.", duration: "18 min", videoUrl: "", isFree: true },
          { id: "sfp-1-2", title: "Push-Off Mechanics & Ground Force", description: "The drive leg creates the primary power for the pitch. Force plate research shows elite D1 pitchers generate 1.5-2.0× body weight ground force at push-off. Drill progression: wall drives → band-resisted stride → full motion power focus.", duration: "16 min", videoUrl: "", isFree: true },
          { id: "sfp-1-3", title: "Hip-to-Shoulder Separation & Trunk Rotation", description: "The hip-shoulder separation in fastpitch is more compact than baseball but follows the same sequence. Hips open fully before the arm crosses the hip line. Restriction here: look for early trunk rotation (arm drags behind).", duration: "18 min", videoUrl: "", isFree: false },
          { id: "sfp-1-4", title: "Arm Circle Efficiency & Timing", description: "The arm circle must be synchronized with the stride, not independent. Common error: arm circle too fast = early release, arc on trajectory. Common error: arm circle too slow = late release, ball up. Perfect timing = K-position matches stride foot landing.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "sfp-1-5", title: "Wrist Snap & Release Point Optimization", description: "The wrist snap adds 3-5mph to pitch velocity and is the final velocity generator. Release must occur below the hip for legal pitch. Forearm internal rotation velocity at release: elite pitchers average 1800-2200 degrees/second (published biomechanical data).", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "sfp-m2",
        title: "Module 2: Pitch Arsenal — Rise, Drop, Change, Curve, Screwball",
        description: "Building a complete pitch arsenal backed by spin science",
        lessons: [
          { id: "sfp-2-1", title: "Rise Ball — Mechanics, Grip, Spin Efficiency", description: "The rise ball creates backspin that causes the ball to 'rise' relative to its expected trajectory. Rapsodo data: elite rise balls have 1800-2200 RPM with spin axis near 6 o'clock. Grip: seam contact with fingers crossing seam at perpendicular. The rise illusion increases at 58+ mph.", duration: "20 min", videoUrl: "", isFree: false },
          { id: "sfp-2-2", title: "Drop Ball — Peel Drop vs Rollover", description: "Two distinct drop ball mechanics: peel drop (topspin via finger roll at release, 1400-1800 RPM topspin) and rollover/turnover (pronation at release, more vertical movement). Peel drop is more consistent; turnover drops more dramatically but higher injury risk.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "sfp-2-3", title: "Change-Up — Circle Change vs Flip Change", description: "The change-up must look identical to the fastball for maximum deception. Velocity differential target: 10-15mph below fastball. Circle change (off-speed) or flip change (palm-down release). Key: same arm speed, different grip/hand position.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "sfp-2-4", title: "Curveball & Screwball — Advanced Movement Pitches", description: "Curveball breaks away from right-handed hitters (spins like a wrench tightening right). Screwball is the inverse (reverse curve) — most difficult pitch to learn, highest injury risk if mechanics are wrong. Teach curveball first. Both require mature shoulder stability.", duration: "18 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "sfp-m3",
        title: "Module 3: Command, Location & Game Strategy",
        description: "Pitching wins games, not just velocity — command and sequencing",
        lessons: [
          { id: "sfp-3-1", title: "Strike Zone Mapping & Location Targets", description: "Elite fastpitch pitchers throw 65-72% first-pitch strikes (USA Softball data). Location formula: rise up, drop down, off-speed in, fastball away. Changing eye levels forces hitters to process pitch height which takes an additional 40-60ms.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "sfp-3-2", title: "Pitch Sequencing — Setting Up Every At-Bat", description: "Every pitch should set up the next one. Classic sequences: rise/rise/drop (same tunnel, different finish), fastball in/change-up away (same release, different speed), drop/rise (vertical eye level change). Hitter tendencies dictate sequence adjustments.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "sfp-3-3", title: "High-Leverage Situations — 0-2, 3-2, 2-Out", description: "Pitch selection by count and situation. 0-2: waste pitch, then put-away off the plate. 3-2 with runners: fastball command is the highest-percentage pitch. 2 outs, no runners: expand the zone, work quickly.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },

  "softball-defense-complete": {
    courseId: "softball-defense-complete",
    modules: [
      {
        id: "sfd-m1",
        title: "Module 1: Infield Fundamentals",
        description: "Elite infield mechanics for the faster game of fastpitch",
        lessons: [
          { id: "sfd-1-1", title: "Ready Position & Pre-Pitch Movement", description: "Fastpitch infield reaction windows are 30-50ms shorter than baseball due to pitch speed and shorter distances. Pre-pitch movement (weight shift toward pitcher at release) reduces initial reaction time by 0.08-0.12 seconds. This is not optional at the higher levels.", duration: "14 min", videoUrl: "", isFree: true },
          { id: "sfd-1-2", title: "Fielding Groundballs — Angles, Footwork, Hands", description: "Approach angle: always create an angle to the ball, never catch stationary when possible. Fielding position: glove at ground level on approach, not last second. Soft hands = absorb the ball. Hard hands = ball bounces out. Glove-side forehand and backhand mechanics.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "sfd-1-3", title: "Double Play Mechanics — 4-6-3 & 6-4-3 Pivots", description: "The pivot at second base is the most dangerous defensive play in softball. Body positioning before the ball arrives. Drag step, inside pivot, and jump pivot mechanics. When to use each. Arm-side release: throw across body creates arm health risk.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "sfd-1-4", title: "Third Base — Charging Plays & Bare Hand", description: "Third base in fastpitch sees 40% more bunt/slow roller attempts than baseball due to slap hitting. The charge-and-bare-hand play requires: read off the bat, explosiveness to ball, bare-hand pick on the run, throw from a low position.", duration: "16 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "sfd-m2",
        title: "Module 2: Outfield & Catcher Defense",
        description: "Outfield reads, routes, and catcher blocking fundamentals",
        lessons: [
          { id: "sfd-2-1", title: "Outfield Jump & First Step Reading", description: "Outfield first step decision happens in 80ms of ball flight. Read: sound off bat (crack vs thud), launch angle (flat = line drive, steep = fly ball), spin. Drop-step vs crossover vs direct route — when and why each is correct.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "sfd-2-2", title: "Catcher Blocking Mechanics", description: "Blocking is not catching — it's stopping the ball. Drop to knees, tilt chest plate forward, tuck chin to chest, glove fills the 5-hole. Fastpitch drop balls bounce differently than baseball (bounce angle: 30-40° steeper than expected). Lateral blocking: direct body into the ball's path.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "sfd-2-3", title: "Catcher Pop Time — Transfer & Throw Mechanics", description: "Pop time (receive to throw landing at 2B) D1 standard: <1.70 seconds. Three pop time phases: receive (0.10s), transfer (0.20-0.35s), throw (1.25-1.40s). The transfer is the largest variance — footwork drills to reduce transfer time.", duration: "16 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },

  "softball-speed-baserunning": {
    courseId: "softball-speed-baserunning",
    modules: [
      {
        id: "sfsr-m1",
        title: "Module 1: Speed Development for Softball",
        description: "Shorter distances, faster decision-making — softball speed training",
        lessons: [
          { id: "sfsr-1-1", title: "Home-to-First Mechanics", description: "Home-to-first is the primary speed metric for softball recruiting. D1 target: sub-2.8 seconds (right-handed), sub-2.65 (left-handed). Phase 1 (0-45 ft): acceleration, 45° body angle. Phase 2 (45-90 ft): upright, max velocity. Run through the bag — don't slow down.", duration: "14 min", videoUrl: "", isFree: true },
          { id: "sfsr-1-2", title: "Stealing 2B & 3B — Lead Distance & Timing", description: "Softball lead rules: can only lead after the pitch crosses home plate. Primary lead distance: 12-15 feet. Read: pitch in the dirt = go. Steal decision: jump read off catcher's set position. Secondary lead reaction time: elite baserunners react in <0.40 seconds.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "sfsr-1-3", title: "Rounding Bases — Proper Arc & Angles", description: "Proper rounding angle reduces 90-foot split time by 0.3-0.5 seconds vs a hard right-angle turn. Banana approach: widen 5-7 feet before the bag, plant inside foot on corner of bag, lean into the next base.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },

  "softball-arm-health": {
    courseId: "softball-arm-health",
    modules: [
      {
        id: "sfah-m1",
        title: "Module 1: Softball Pitcher Arm Health",
        description: "Fastpitch pitchers throw more than any other position athlete — arm care is survival",
        lessons: [
          { id: "sfah-1-1", title: "Why Softball Arm Health Is Different", description: "Fastpitch pitchers can legally throw every game, every inning. Studies show D1 softball pitchers average 1,200-2,000+ pitches per week during peak season. Baseball pitchers: 100-150/week. The arm care system MUST reflect this. The wrist snap creates significant valgus stress at the elbow. UCI Hospital research: UCL injury in fastpitch pitchers is underdiagnosed.", duration: "18 min", videoUrl: "", isFree: true },
          { id: "sfah-1-2", title: "Post-Game Arm Care Protocol", description: "Required post-pitching protocol: (1) Ice wrist/forearm flexors 15 min within 30 min of last pitch. (2) Band external rotation 3×15. (3) Wrist flexor stretch 2×30 sec each direction. (4) Pronation/supination with light band 3×20. (5) Shoulder posterior capsule stretch (sleeper stretch) 2×30 sec.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "sfah-1-3", title: "Pitch Workload Limits by Age", description: "VAULT™ recommended pitch limits based on NFHS and sports medicine research: 10-12U max 200 pitches/week, 13-14U max 300/week, HS max 400/week with 2+ rest days. Tournament weekends: cap at 150 pitches/day, mandatory rest day after 100+ pitch day.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "sfah-1-4", title: "Warning Signs — When to Rest, When to Seek Care", description: "Red flags: velocity drop >3mph from baseline (rest immediately), pain during arm circle (stop pitching), pain on grip/wrist extension (possible UCL/flexor strain — see physician), elbow swelling (stop immediately). Yellow flags: forearm tightness, fatigue after <50 pitches, decreased spin rate.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },

  "softball-short-game": {
    courseId: "softball-short-game",
    modules: [
      {
        id: "sfsg-m1",
        title: "Module 1: Bunt & Short Game Mastery",
        description: "The short game is a science — fastpitch coaches count on it to manufacture runs",
        lessons: [
          { id: "sfsg-1-1", title: "Sacrifice Bunt Mechanics — Pivot & Square", description: "Two techniques: pivot (open stance, parallel) and square (full turn to pitcher). Pivot is faster to execute; square gives more bat control. Bat angle: 45° upward, top hand loose, meet ball above home plate for ground ball direction. Contact zone: front half of bat = better direction control.", duration: "14 min", videoUrl: "", isFree: true },
          { id: "sfsg-1-2", title: "Bunt for Hit — Left & Right Side", description: "Left side bunt: toward third base, read 3B pre-pitch position. Right side (push bunt): toward 1B-2B hole, catches 2B cheating. Push bunt contact point: back third of bat, slight push motion. Disguise: show bunt very late, ideally after pitcher's arm passes horizontal.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "sfsg-1-3", title: "Slap-Bunt Decision Making", description: "The fake slap → bunt is the most difficult play to defend in fastpitch. Athletic stance, load as if slapping, change hands grip late, soft contact. Corner infielders who crash on slap movement are vulnerable to the pull-back bunt.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },
};

// Merge softball courses into main courseContent map for CourseDetail page discovery
Object.assign(courseContent, softballCourseContentMap);
