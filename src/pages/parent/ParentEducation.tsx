import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BookOpen, GraduationCap, Star, TrendingUp, Shield,
  Brain, Users, Calendar, Trophy, CheckCircle2, ChevronRight,
  AlertTriangle, Info, ArrowRight, Zap, Heart, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const EDUCATION_MODULES = [
  {
    category: "Recruiting 101",
    icon: GraduationCap,
    color: "text-green-500",
    bg: "bg-green-500/10",
    modules: [
      {
        title: "The Recruiting Timeline Every Family Must Know",
        readTime: "6 min",
        keyPoints: [
          "NCAA D1/D2: coaches may NOT contact athletes before June 15 after sophomore year (10th grade). Any 'contact' before this is a secondary violation. Early verbal interest from coaches before this date is informal only.",
          "NCAA D3, NAIA, JUCO: No contact restrictions — coaches can reach out at any grade level.",
          "The EARLIEST realistic college scholarship decision: end of junior year (11th grade) for most athletes. Elite 5-tool prospects may commit earlier — but even then, programs want to see junior-year performance.",
          "NCAA Eligibility Center: Every athlete planning to play D1 or D2 must register at eligibilitycenter.org. This is not optional. Do it by the end of junior year at the latest.",
          "High school coaches' role: they write NCAA eligibility letters and interact with college coaches. Your relationship with the HS coaching staff matters for recruiting.",
          "The mistake most families make: targeting only D1. D2 programs often offer MORE scholarship money, BETTER playing time, and equivalent or better development. Research all options.",
        ],
        timeline: [
          { age: "12-14", label: "Build the foundation. Multi-sport. Focus on KPI development, not recruiting." },
          { age: "14-15", label: "Start attending showcases. Build a data package. Register with NCSA or similar." },
          { age: "15 (June 15)", label: "D1/D2 first contact window opens. Coaches may now email/call." },
          { age: "15-16", label: "Key showcase windows. College coaches actively recruiting this age range." },
          { age: "16-17", label: "Official visits can be scheduled. Most D1 commits happen at this age." },
          { age: "17", label: "National Letter of Intent (NLI) signing day. Early signing period: November." },
        ],
        link: "/recruiting",
        linkLabel: "Open Recruiting Hub",
      },
      {
        title: "What the 20-80 Scouting Scale Means for Your Athlete",
        readTime: "4 min",
        keyPoints: [
          "50 = MLB average tool. 60 = Above average (D1 starter). 70 = Plus-plus (high D1/draft prospect). 80 = Generational/elite.",
          "Grades are FUTURE-projected for youth athletes. A 14-year-old who grades 50 on exit velocity is above average for their age group — not necessarily a D1 prospect yet.",
          "Present grade vs. Future grade (ceiling): college coaches recruit ceiling in young athletes. A 14-year-old with a 55 present grade and visible tools that project to 65+ is more interesting than a 17-year-old stuck at 55.",
          "Grades change with development. They are not fixed. An athlete who trains consistently with quality coaching can move up significantly between ages 14-18.",
          "Position-specific: a 60 grade for an outfielder means something different than a 60 for a pitcher. The tools required at each position are weighted differently.",
          "Academic profile layers on top of athletic grade. A 60-grade athlete with a 3.8 GPA has more options than a 60-grade athlete with a 2.8 GPA.",
        ],
        link: "/prospect-grader",
        linkLabel: "Run Prospect Grade",
      },
    ],
  },
  {
    category: "Development Science",
    icon: TrendingUp,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    modules: [
      {
        title: "What Real Development Actually Looks Like",
        readTime: "5 min",
        keyPoints: [
          "Development is non-linear. Expect plateaus — 3-6 week stretches where the numbers don't move. This is the nervous system consolidating gains. It doesn't mean training isn't working.",
          "The critical development window: ages 13-16 for most athletes. This is when the speed of physical and neuromuscular adaptation is highest. Training consistency during these years has outsized long-term impact.",
          "Data tracks development — instinct doesn't. Exit velocity, pitch velocity, and 60-yard dash time are objective. Batting average and wins are context-dependent. Build a KPI tracking habit starting at 12-13.",
          "Multi-sport through 14 is backed by extensive research: lower injury rates, higher long-term performance, less burnout. The NSCA explicitly recommends multi-sport participation through age 14.",
          "Mental performance is trainable and tracks with physical development. Confidence, focus, and emotional control under pressure are learned skills — not personality traits.",
          "Sleep is the single most impactful recovery tool. Research shows athletes averaging less than 7 hours show 1.7× higher injury rates and measurable decline in reaction time and decision-making speed.",
        ],
        link: "/parent/progress",
        linkLabel: "View Progress Data",
      },
      {
        title: "How to Read Your Athlete's Development Data",
        readTime: "5 min",
        keyPoints: [
          "Exit velocity is the most predictive offensive metric at every level. Every 5 mph increase = approximately +.070 expected batting average and +.150 expected slugging percentage (Statcast data).",
          "Pitch velocity at the HS level: 3-5 mph of gain per full off-season training cycle is typical for athletes with quality mechanical coaching. More than 5 mph in a cycle is elite development. Less than 1 mph may indicate a mechanical or training methodology issue.",
          "60-yard dash: 0.2-0.4 second improvement is achievable in a focused 8-12 week speed block with mechanics-based training. Most athletes only get 0.0-0.1 seconds faster without deliberate speed mechanics coaching.",
          "Consistency score matters more than any single KPI. An athlete who trains consistently 5 days/week for 12 months will outperform a more talented athlete who trains 2 weeks on, 2 weeks off.",
          "Soreness and sleep data predict performance. Athletes with consistent 8+ hours of sleep and controlled soreness levels show better KPI improvement rates than those with chronic sleep deficits.",
          "Recruiting level benchmarks: D1 baseball exit velocity standard is 90+ mph. D2: 84-90. D3: 78-84. Softball D1: 78-86. D2: 72-80. These are 2026 standards — they shift upward 1-2 mph per 3-4 years.",
        ],
        link: "/parent/progress",
        linkLabel: "View Progress",
      },
    ],
  },
  {
    category: "Parent Role & Mindset",
    icon: Heart,
    color: "text-red-500",
    bg: "bg-red-500/10",
    modules: [
      {
        title: "How Parents Can Actually Help (And What Hurts)",
        readTime: "4 min",
        keyPoints: [
          "THE #1 THING that helps: Ask about process, not outcome. 'How did your at-bats feel today?' builds self-awareness. 'Did you go 3-for-4?' creates outcome fixation that kills performance psychology.",
          "Car ride rule: no immediate feedback after games or practices. Research shows unsolicited parental critique immediately post-performance is associated with anxiety, avoidance, and early dropout. The car ride is for pizza conversations.",
          "Sleep enforcement is parental responsibility. No coach can do it. 8-9 hours for youth athletes ages 12-18 is the NSCA and American Academy of Pediatrics recommendation. Late-night gaming and phone use undermine everything else.",
          "Nutrition support: parents control the kitchen. High-protein breakfasts, adequate hydration, quality pre-competition meals — these are within parental control and have real performance impact.",
          "The showcase/camp investment reality: NCSA data shows athletes with organized data packages (KPIs + video + academic profile) get 3.4× more responses from coaches than those without. The investment in data collection pays more than most camps.",
          "Mental performance support: talk about mistakes as learning events, not failures. Athletes who describe making mistakes to parents without fear of disappointment show significantly better performance under pressure in competition.",
        ],
        link: "/parent/wellness",
        linkLabel: "View Wellness Data",
      },
    ],
  },
  {
    category: "Arm Health & Safety",
    icon: Shield,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    modules: [
      {
        title: "Youth Arm Health: What Every Parent Must Know",
        readTime: "5 min",
        keyPoints: [
          "Tommy John surgery rates in youth athletes (under 20) have increased 500% since 1994. Average age of first TJ surgery has dropped from 26 to 17 (ASMI clinical data, published 2023).",
          "57% of youth TJ surgeries had NO single traumatic throw — it was cumulative overuse without adequate rest (Dr. James Andrews published data). The arm breaks from volume, not one bad throw.",
          "ASMI published pitch count limits: Ages 9-10: 50 pitches/game. Ages 11-12: 75. Ages 13-16: 95. Ages 17-18: 105. These are HARD limits from injury incidence research on 1,000+ youth pitchers.",
          "Rest requirements: After 41-60 pitches: 1 rest day minimum. After 61-80: 2 rest days. After 81+: 3+ rest days. 'Rest' = no throwing of any kind.",
          "Year-round baseball: the single strongest risk factor for youth arm injury. Multiple published studies show athletes who pitch year-round are 3.5× more likely to require surgery by age 20.",
          "If your athlete reports inner elbow pain during or after throwing: STOP THROWING IMMEDIATELY. Medial elbow pain is a UCL stress signal. Every throw through this pain increases injury probability.",
        ],
        link: "/workload",
        linkLabel: "View Workload Tracker",
      },
    ],
  },
];

const ParentEducation = () => {
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  return (
    <div className="p-6 lg:p-10 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-indigo-500" />
        </div>
        <div>
          <h1 className="text-2xl font-display text-foreground">Parent Education Center</h1>
          <p className="text-sm text-muted-foreground">Research-backed knowledge every baseball & softball family needs</p>
        </div>
        <Badge className="ml-auto bg-indigo-500/10 text-indigo-500 border-indigo-500/20 text-xs">
          <Brain className="w-3 h-3 mr-1" /> Research-Backed
        </Badge>
      </div>

      {/* State of Game CTA */}
      <Link to="/state-of-game">
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-4 hover:bg-primary/10 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-display text-foreground">Monthly: State of the Game™</p>
            <p className="text-xs text-muted-foreground">Current development science, recruiting standards, and where the game is heading. Updated monthly.</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
        </div>
      </Link>

      {/* Education Modules */}
      {EDUCATION_MODULES.map((category) => (
        <div key={category.category}>
          <div className={`flex items-center gap-2 mb-3`}>
            <div className={`w-7 h-7 rounded-lg ${category.bg} flex items-center justify-center`}>
              <category.icon className={`w-4 h-4 ${category.color}`} />
            </div>
            <h2 className="font-display text-foreground">{category.category}</h2>
          </div>
          <div className="space-y-3">
            {category.modules.map((mod) => {
              const key = `${category.category}-${mod.title}`;
              const isExpanded = expandedModule === key;
              return (
                <div key={key} className="bg-card border border-border rounded-2xl overflow-hidden">
                  <button
                    className="w-full p-4 flex items-start gap-3 hover:bg-secondary/30 transition-colors text-left"
                    onClick={() => setExpandedModule(isExpanded ? null : key)}
                  >
                    <div className={`w-8 h-8 rounded-lg ${category.bg} flex items-center justify-center shrink-0`}>
                      <category.icon className={`w-4 h-4 ${category.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-display text-sm text-foreground">{mod.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{mod.readTime} read · {mod.keyPoints.length} key points</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
                          <div className="space-y-2.5">
                            {mod.keyPoints.map((pt, i) => (
                              <div key={i} className="flex items-start gap-2.5">
                                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                <p className="text-sm text-foreground">{pt}</p>
                              </div>
                            ))}
                          </div>

                          {"timeline" in mod && Array.isArray(mod.timeline) && (
                            <div className="bg-secondary rounded-xl p-4 mt-2">
                              <p className="text-xs font-medium text-foreground uppercase tracking-wide mb-3">Recruiting Timeline</p>
                              <div className="space-y-2">
                                {mod.timeline.map((t, i) => (
                                  <div key={i} className="flex gap-3">
                                    <Badge variant="outline" className="text-xs shrink-0 w-14 justify-center">{t.age}</Badge>
                                    <p className="text-xs text-muted-foreground">{t.label}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <Link to={mod.link}>
                            <Button size="sm" variant="outline" className="text-xs gap-1.5 mt-1">
                              <ArrowRight className="w-3 h-3" /> {mod.linkLabel}
                            </Button>
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ParentEducation;
