import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, PlayCircle, Star, Zap, Target, Dumbbell, Wind, Brain, CheckCircle, Lock, Users, Calendar, Shield, Crosshair, TrendingUp, Sparkles, BookOpen, Heart, ArrowRight, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewThisWeekBadge from "@/components/ui/NewThisWeekBadge";
import { supabase } from "@/integrations/supabase/client";
import { useCourseEnrollments, useEnrollInCourse } from "@/hooks/useCourseEnrollment";
import { Link } from "react-router-dom";
import courseHitting from "@/assets/course-hitting.jpg";
import coursePitching from "@/assets/course-pitching.jpg";
import courseFielding from "@/assets/course-fielding.jpg";

// VAULT™ Pillar Definitions
const vaultPillars = [
  {
    id: "velocity",
    name: "Velocity",
    tagline: "Output Systems",
    description: "Develop athletes capable of producing and transferring force efficiently to maximize performance output.",
    icon: Zap,
    color: "from-red-500 to-orange-500",
    metrics: ["Exit Velocity", "Pitch Velocity", "Rotational Power"],
  },
  {
    id: "athleticism",
    name: "Athleticism",
    tagline: "Movement & Speed",
    description: "Build fast, strong, resilient athletes who move efficiently and stay durable.",
    icon: Wind,
    color: "from-blue-500 to-cyan-500",
    metrics: ["Sprint Times", "Vertical Jump", "COD Efficiency"],
  },
  {
    id: "utility",
    name: "Utility",
    tagline: "Position Systems",
    description: "Develop adaptable athletes capable of transferring skills across roles and game situations.",
    icon: Target,
    color: "from-green-500 to-emerald-500",
    metrics: ["Position Versatility", "Skill Transfer", "Baseball IQ"],
  },
  {
    id: "longevity",
    name: "Longevity",
    tagline: "Availability Systems",
    description: "Keep athletes healthy, available, and progressing over time.",
    icon: Heart,
    color: "from-purple-500 to-pink-500",
    metrics: ["Availability Rate", "Recovery Score", "Workload Balance"],
  },
  {
    id: "transfer",
    name: "Transfer",
    tagline: "Game Translation",
    description: "Ensure training adaptations appear in competition.",
    icon: Flame,
    color: "from-amber-500 to-yellow-500",
    metrics: ["Practice-Game Carryover", "Clutch Performance", "Consistency"],
  },
  {
    id: "mental",
    name: "Mental Performance",
    tagline: "Cross-Pillar System",
    description: "Championship mental performance is required weekly work—not optional extra.",
    icon: Brain,
    color: "from-indigo-500 to-violet-500",
    metrics: ["Emotional Speed", "Focus", "Competitive Identity"],
  },
];

// Courses organized by VAULT™ Pillar
export const allCourses = [
  // VELOCITY PILLAR - Hitting & Pitching Output
  {
    id: "hitting-velocity-12week",
    title: "Elite Hitting Exit Velocity Program",
    description: "12-week system designed to maximize exit velocity through intent-based training, ground force utilization, and rotational sequencing. Track metrics, push limits intelligently.",
    image: courseHitting,
    duration: "12 Weeks",
    modules: 10,
    lessons: 48,
    icon: Zap,
    tag: "Elite",
    pillar: "velocity",
    category: "hitting",
    level: "Advanced",
    sport_type: "baseball",
    metrics: ["Exit Velocity", "Bat Speed", "Attack Angle"],
    features: [
      "Intent-based hitting sessions",
      "Weekly exit velocity tracking",
      "Rotational power development",
      "Tee work progressions",
      "Coach guardrails included",
    ],
    instructor: "Vault Performance",
    students: 1340,
    isNew: true,
  },
  {
    id: "pitching-velocity-8week",
    title: "8-Week Pitching Velocity Program",
    description: "Develop safe, effective throwing mechanics, increase functional strength, improve arm-speed patterns, and build confidence. Learn sequencing, posture, timing, and intent.",
    image: coursePitching,
    duration: "8 Weeks",
    modules: 7,
    lessons: 36,
    icon: Zap,
    tag: "Foundation",
    pillar: "velocity",
    category: "pitching",
    level: "Intermediate",
    sport_type: "baseball",
    metrics: ["Pitch Velocity", "Hip Lead", "Arm Speed"],
    features: [
      "Pivot picks & rocker throws",
      "Step-behind throws for momentum",
      "Connection ball work",
      "Weekly velocity tracking",
      "Parent training guide included",
    ],
    instructor: "Vault Performance",
    students: 1240,
  },
  {
    id: "elite-pitching-12week",
    title: "Elite 12-Week Pitching Velocity",
    description: "Advanced arm speed + mechanics system for high-performance athletes seeking major velocity increases, improved command, advanced biomechanics, and rotational power.",
    image: coursePitching,
    duration: "12 Weeks",
    modules: 9,
    lessons: 52,
    icon: TrendingUp,
    tag: "Elite",
    pillar: "velocity",
    category: "pitching",
    level: "Advanced",
    sport_type: "baseball",
    metrics: ["Hip-Shoulder Separation", "Arm Path", "Peak Velocity"],
    features: [
      "Advanced plyo ball progressions",
      "Heavy med ball rotational throws",
      "Competitive bullpen structure",
      "Strength & power add-on",
      "Recovery & arm care system",
    ],
    instructor: "Vault Performance",
    students: 890,
  },

  // ATHLETICISM PILLAR - Speed & Power
  {
    id: "elite-speed-agility-12week",
    title: "Elite Speed & Agility Program",
    description: "12-week comprehensive movement system covering sprint mechanics, change of direction, and explosive power. The movement standard across the organization.",
    image: courseHitting,
    duration: "12 Weeks",
    modules: 10,
    lessons: 50,
    icon: Wind,
    tag: "Complete",
    pillar: "athleticism",
    category: "speed",
    level: "All Levels",
    sport_type: "both",
    metrics: ["60-Yard Dash", "Lateral Speed", "Vertical Jump"],
    features: [
      "Sprint mechanics diagrams",
      "Speed calendar structure",
      "COD metrics tracking",
      "Strength add-on included",
      "Mobility protocols",
    ],
    instructor: "Vault Performance",
    students: 1680,
  },
  {
    id: "youth-vertical-6week",
    title: "Youth Vertical Jump Program",
    description: "6-week age-appropriate plyometric training for ages 9-13. Develop explosive power, landing mechanics, and confidence with safe, progressive overload.",
    image: courseHitting,
    duration: "6 Weeks",
    modules: 6,
    lessons: 24,
    icon: Wind,
    tag: "Youth",
    pillar: "athleticism",
    category: "speed",
    level: "Beginner",
    sport_type: "both",
    metrics: ["Landing Mechanics", "Explosiveness", "Reactive Ability"],
    features: [
      "Snap downs & stick landings",
      "Pogo jumps & mini-hurdles",
      "Box jumps (safe introductory)",
      "Arm swing loaders",
      "Parent training guide",
    ],
    instructor: "Vault Performance",
    students: 560,
  },
  {
    id: "elite-vertical-12week",
    title: "Elite Vertical Jump Program",
    description: "12-week explosive power system engineered to maximize vertical output through plyometric progressions, strength phases, and movement efficiency training.",
    image: courseHitting,
    duration: "12 Weeks",
    modules: 8,
    lessons: 42,
    icon: TrendingUp,
    tag: "Elite",
    pillar: "athleticism",
    category: "speed",
    level: "Advanced",
    sport_type: "both",
    metrics: ["Depth Jumps", "Peak Power", "Approach Jump"],
    features: [
      "Elite plyometric library",
      "Strength & power components",
      "Depth jump progressions",
      "Mobility & recovery protocols",
      "Testing & tracking system",
    ],
    instructor: "Vault Performance",
    students: 720,
  },
  {
    id: "strength-conditioning-12week",
    title: "Vault Strength & Conditioning",
    description: "12-week baseball performance program focusing on explosive movement, rotational power, acceleration, deceleration control, and full body stability.",
    image: coursePitching,
    duration: "12 Weeks",
    modules: 12,
    lessons: 60,
    icon: Dumbbell,
    tag: "Complete",
    pillar: "athleticism",
    category: "strength",
    level: "All Levels",
    sport_type: "both",
    metrics: ["Lower Body Power", "Rotational Speed", "Durability"],
    features: [
      "Foundation phase (weeks 1-4)",
      "Power phase (weeks 5-8)",
      "Peak phase (weeks 9-12)",
      "Arm care & mobility routines",
      "Nutrition & recovery guidelines",
    ],
    instructor: "Eddie Mejia",
    students: 1540,
  },

  // UTILITY PILLAR - Position Systems
  {
    id: "youth-catcher-8week",
    title: "Youth Catcher Development",
    description: "Build foundational receiving, blocking, footwork, and throwing movements for ages 9-13. Learn proper body position, glove angles, soft hands, and safe throwing mechanics.",
    image: courseFielding,
    duration: "8 Weeks",
    modules: 7,
    lessons: 32,
    icon: Shield,
    tag: "Youth",
    pillar: "utility",
    category: "catching",
    level: "Beginner",
    sport_type: "baseball",
    metrics: ["Receiving", "Blocking", "Footwork"],
    features: [
      "Tennis ball soft-hand work",
      "Knee-replace drill progression",
      "Step-replace footwork",
      "Parent training guide",
      "Athlete tracking sheets",
    ],
    instructor: "Vault Performance",
    students: 654,
  },
  {
    id: "elite-catcher-12week",
    title: "Elite Catcher Development",
    description: "12-week receiving, blocking, and pop-time system for competitive athletes. Develop advanced receiving, throwing mechanics, footwork patterns, and professional-level durability.",
    image: courseFielding,
    duration: "12 Weeks",
    modules: 8,
    lessons: 48,
    icon: Crosshair,
    tag: "Elite",
    pillar: "utility",
    category: "catching",
    level: "Advanced",
    sport_type: "baseball",
    metrics: ["Pop-Time", "Framing", "Transfer Speed"],
    features: [
      "Elite framing patterns",
      "Reaction blocking drills",
      "Pop-time velocity footwork",
      "Throwing & arm care system",
      "Strength, mobility & durability",
    ],
    instructor: "Vault Performance",
    students: 480,
  },
  {
    id: "vault-catcher-complete",
    title: "Vault Complete Catcher Program",
    description: "The complete 12-week elite catcher development program. Build receiving, blocking, throwing velocity, footwork, pop time, leadership, game-calling, mobility, and durability.",
    image: courseFielding,
    duration: "12 Weeks",
    modules: 12,
    lessons: 60,
    icon: Shield,
    tag: "Complete",
    pillar: "utility",
    category: "catching",
    level: "All Levels",
    sport_type: "baseball",
    metrics: ["Pop-Time", "Game-Calling IQ", "Durability"],
    features: [
      "5-day weekly training structure",
      "Week 0 testing protocol",
      "Pop-time improvement: 0.15-0.30s",
      "Leadership development",
      "Catcher-specific strength & mobility",
    ],
    instructor: "Vault Performance",
    students: 720,
  },

  // LONGEVITY PILLAR - Availability Systems (cross-program integration)
  {
    id: "arm-health-workload",
    title: "Arm Health & Workload Management System",
    description: "VAULT™ manages total throwing stress by controlling volume, intent, and recovery. Arm health is treated as a performance system, not a medical reaction.",
    image: coursePitching,
    duration: "Ongoing",
    modules: 4,
    lessons: 8,
    icon: Heart,
    tag: "Flagship",
    pillar: "longevity",
    category: "recovery",
    level: "All Levels",
    sport_type: "both",
    metrics: ["Availability %", "High-Intent Days", "Velocity Stability"],
    features: [
      "Mobility & activation protocols",
      "Arm strength & tissue resilience",
      "Deceleration training",
      "Recovery & nervous system restoration",
      "KPI tracking dashboard",
    ],
    instructor: "Vault Performance",
    students: 2340,
    isNew: true, // New content added this week
  },
  {
    id: "arm-care-complete",
    title: "Complete Arm Care System",
    description: "Daily recovery flows, post-throw routines, and workload tracking to keep athletes healthy and available. This becomes non-negotiable organizational policy.",
    image: coursePitching,
    duration: "Ongoing",
    modules: 6,
    lessons: 30,
    icon: Heart,
    tag: "Essential",
    pillar: "longevity",
    category: "recovery",
    level: "All Levels",
    sport_type: "both",
    metrics: ["Throw Volume", "Recovery Score", "Availability %"],
    features: [
      "Daily arm care routines",
      "Post-throw protocols",
      "Workload tracking dashboard",
      "Injury prevention system",
      "Return-to-throw guidelines",
    ],
    instructor: "Vault Performance",
    students: 2100,
  },
  {
    id: "pitcher-catcher-overlap",
    title: "Pitcher/Catcher Overlap Policy",
    description: "Athletes who pitch and catch experience significantly higher throwing stress. This policy defines how overlap is monitored, limited, and adjusted.",
    image: courseFielding,
    duration: "Reference",
    modules: 2,
    lessons: 4,
    icon: Shield,
    tag: "Policy",
    pillar: "longevity",
    category: "recovery",
    level: "All Levels",
    sport_type: "both",
    metrics: ["Same-Game Rules", "Recovery Days", "High-Intent Caps"],
    features: [
      "No pitching + catching same game",
      "Mandatory recovery after catching → pitching",
      "High-intent days capped per week",
      "Director approval for overlap",
      "Non-negotiable protection rules",
    ],
    instructor: "Vault Performance",
    students: 890,
  },
  {
    id: "mobility-durability",
    title: "Mobility & Durability Protocol",
    description: "Comprehensive mobility and tissue resilience training pulled from all position programs. Hip, shoulder, and spine maintenance for long-term athlete health.",
    image: courseFielding,
    duration: "Ongoing",
    modules: 8,
    lessons: 40,
    icon: Shield,
    tag: "Essential",
    pillar: "longevity",
    category: "recovery",
    level: "All Levels",
    sport_type: "both",
    metrics: ["Hip Mobility", "Shoulder Health", "Spine Stability"],
    features: [
      "Position-specific mobility",
      "Daily movement flows",
      "Recovery day protocols",
      "Sleep & nutrition guidance",
      "Self-assessment tools",
    ],
    instructor: "Vault Performance",
    students: 1450,
  },

  // TRANSFER PILLAR - Game Translation
  {
    id: "transfer-system",
    title: "VAULT™ Transfer System",
    description: "12-week system to close the practice-to-game gap. 60+ game-realistic drills, decision training, competitive execution frameworks, and transfer rate analytics.",
    image: courseHitting,
    duration: "12 Weeks",
    modules: 6,
    lessons: 24,
    icon: Flame,
    tag: "Flagship",
    pillar: "transfer",
    category: "performance",
    level: "All Levels",
    sport_type: "baseball",
    metrics: ["Transfer Rate", "Decision Speed", "Clutch Performance"],
    features: [
      "60+ game-realistic drill library",
      "Decision training protocols",
      "Competitive execution frameworks",
      "Transfer rate analytics",
      "AI-powered practice design",
    ],
    instructor: "Vault Performance",
    students: 1450,
    isNew: true,
  },
  {
    id: "competitive-execution",
    title: "Competitive Execution System",
    description: "Practice → game carryover rules, competitive reps, pressure execution standards, and retesting protocols. Training that shows up when it matters.",
    image: courseHitting,
    duration: "8 Weeks",
    modules: 6,
    lessons: 28,
    icon: Flame,
    tag: "Performance",
    pillar: "transfer",
    category: "performance",
    level: "Intermediate",
    sport_type: "baseball",
    metrics: ["Practice-Game Carryover", "Clutch Rate", "Consistency"],
    features: [
      "Game-speed intent blocks",
      "Pressure simulations",
      "Decision-making drills",
      "Retesting weeks",
      "Competition prep protocols",
    ],
    instructor: "Vault Performance",
    students: 780,
  },

  // MENTAL PERFORMANCE - Cross-Pillar System
  {
    id: "elite-mindset-10week",
    title: "Elite Athlete Mindset Program",
    description: "10-week championship mental performance system building confidence, resilience, emotional control, focus, discipline, and competitive consistency through performance psychology.",
    image: courseHitting,
    duration: "10 Weeks",
    modules: 9,
    lessons: 45,
    icon: Brain,
    tag: "Required",
    pillar: "mental",
    category: "mindset",
    level: "All Levels",
    sport_type: "both",
    metrics: ["Emotional Speed", "Focus", "Competitive Identity"],
    features: [
      "5-minute visualization routine",
      "6-second reset routine",
      "Emotional speed training",
      "Championship habits",
      "Parent/coach support guide",
    ],
    instructor: "Vault Performance",
    students: 980,
  },
  {
    id: "winning-mindset-10week",
    title: "Winning Athlete Mindset",
    description: "10-week mental performance training to improve confidence, focus, resilience, discipline, leadership, and on-field consistency. Think, act, and perform like elite competitors.",
    image: courseHitting,
    duration: "10 Weeks",
    modules: 10,
    lessons: 50,
    icon: Sparkles,
    tag: "Leadership",
    pillar: "mental",
    category: "mindset",
    level: "All Levels",
    sport_type: "both",
    metrics: ["Identity", "Confidence", "Leadership"],
    features: [
      "Weekly mental lessons",
      "Daily action tasks",
      "Athlete journal prompts",
      "Weekly challenges",
      "Pre-game routines",
    ],
    instructor: "Vault Performance",
    students: 860,
  },

  // ORGANIZATIONAL - Leadership & Coaching
  {
    id: "organizational-development",
    title: "Organizational Development Manual",
    description: "The framework for building aligned, scalable baseball organizations. Solve the core problem of misalignment with clear standards, accountability, and longevity.",
    image: courseFielding,
    duration: "Reference",
    modules: 3,
    lessons: 6,
    icon: Users,
    tag: "Flagship",
    pillar: "transfer",
    category: "leadership",
    level: "Coach/Admin",
    sport_type: "both",
    metrics: ["Organizational Alignment", "System Integrity", "Long-Term Development"],
    features: [
      "The VAULT™ Five Pillars",
      "Organizational alignment model",
      "Decision-making filter",
      "Leadership hierarchy",
      "Consistent development standards",
    ],
    instructor: "Vault Performance",
    students: 340,
  },
  {
    id: "strength-power-system",
    title: "Strength & Power Development System",
    description: "Enhanced in-season and off-season strength models. Build force capacity, power output, and structural resilience with proper periodization.",
    image: coursePitching,
    duration: "12 Weeks",
    modules: 4,
    lessons: 8,
    icon: Dumbbell,
    tag: "Flagship",
    pillar: "athleticism",
    category: "strength",
    level: "All Levels",
    sport_type: "both",
    metrics: ["Jump Height", "Sprint Improvement", "Output Consistency"],
    features: [
      "Lower-body force production",
      "Rotational power transfer",
      "Deceleration & anti-rotation",
      "In-season maintenance model",
      "Off-season building model",
    ],
    instructor: "Vault Performance",
    students: 1120,
  },
  {
    id: "annual-development-calendar",
    title: "Annual Development Calendar",
    description: "Seasonal blueprint for long-term athlete development. Aligns training priorities, workloads, and recovery across the entire year to prevent overuse and improve performance timing.",
    image: courseFielding,
    duration: "Reference",
    modules: 5,
    lessons: 10,
    icon: Calendar,
    tag: "Flagship",
    pillar: "longevity",
    category: "planning",
    level: "Coach/Admin",
    sport_type: "both",
    metrics: ["Phase Alignment", "Workload Balance", "Recovery Compliance"],
    features: [
      "Post-Season Reset (4-6 weeks)",
      "Off-Season Build (8-12 weeks)",
      "Pre-Season Ramp (6-8 weeks)",
      "In-Season Compete (4-6 months)",
      "Transition & Review (2-4 weeks)",
    ],
    instructor: "Vault Performance",
    students: 680,
  },
  {
    id: "infield-development",
    title: "Infield Position Development System",
    description: "Develop adaptable defenders through movement efficiency, clean transfers, and reliable decision-making under pressure. Position labels follow movement mastery.",
    image: courseFielding,
    duration: "12 Weeks",
    modules: 5,
    lessons: 20,
    icon: Target,
    tag: "Flagship",
    pillar: "utility",
    category: "fielding",
    level: "All Levels",
    sport_type: "baseball",
    metrics: ["First-Step Reaction", "Throw Accuracy %", "Routine Play Success"],
    features: [
      "Footwork & base control",
      "Glove-to-hand transfer",
      "Throwing efficiency",
      "Range & lateral coverage",
      "Decision-making under pressure",
    ],
    instructor: "Vault Performance",
    students: 920,
  },
  {
    id: "outfield-development",
    title: "Outfield Position Development System",
    description: "Train athletes to move explosively, track efficiently, and throw intelligently. Speed is developed with control and smart risk management.",
    image: courseFielding,
    duration: "12 Weeks",
    modules: 5,
    lessons: 20,
    icon: Wind,
    tag: "Flagship",
    pillar: "utility",
    category: "fielding",
    level: "All Levels",
    sport_type: "baseball",
    metrics: ["First-Step Time", "Route Efficiency", "Throw Accuracy"],
    features: [
      "First-step & ball-off-bat reads",
      "Speed & route efficiency",
      "Ball tracking & late adjustment",
      "Throwing alignment & accuracy",
      "Aggression control",
    ],
    instructor: "Vault Performance",
    students: 840,
  },

  // ═══════════════════════════════════════════════════════════════
  // 🥎 SOFTBALL-SPECIFIC COURSE STACK
  // ═══════════════════════════════════════════════════════════════

  // 1️⃣ VAULT™ SOFTBALL ORGANIZATIONAL MANUAL
  {
    id: "softball-org-manual",
    title: "Softball Organizational Manual",
    description: "Pitcher-centric game model, short-game philosophy, lineup strategy (slap/power/speed mix), and pitcher workload dominance. The framework for building elite softball programs.",
    image: courseFielding,
    duration: "Reference",
    modules: 4,
    lessons: 12,
    icon: Users,
    tag: "Flagship",
    pillar: "transfer",
    category: "leadership",
    level: "Coach/Admin",
    sport_type: "softball",
    metrics: ["Pitcher Workload Model", "Lineup Strategy", "Game Model Alignment"],
    features: [
      "Pitcher-centric game model",
      "Short-game philosophy framework",
      "Lineup strategy: slap/power/speed mix",
      "Pitcher workload dominance model",
      "Organizational alignment standards",
    ],
    instructor: "Vault Performance",
    students: 180,
    isNew: true,
  },

  // 2️⃣ VAULT™ ELITE SOFTBALL HITTING SYSTEM
  {
    id: "softball-hitting-complete",
    title: "Elite Softball Hitting System",
    description: "Power, timing, adjustability, and game transfer. NFCA-aligned mechanics with 5-pillar hitting model, 4-phase drill progression, and advanced tracks for power, contact, and hybrid hitters.",
    image: courseHitting,
    duration: "10 Weeks",
    modules: 7,
    lessons: 48,
    icon: Zap,
    tag: "Flagship",
    pillar: "velocity",
    category: "hitting",
    level: "All Levels",
    sport_type: "softball",
    metrics: ["Hard Contact %", "Exit Velocity", "On-Time Contact Rate", "Quality Decision %"],
    features: [
      "5-pillar hitting model (Posture, Timing, Sequencing, Bat Speed, Transfer)",
      "Complete mechanics system (stance through finish)",
      "Power, contact, and hybrid hitter tracks",
      "4-phase drill progression: Patterning → Transfer",
      "Off-season, preseason, and in-season structure",
      "Primary and secondary KPI tracking",
      "NFCA-aligned target-based training",
    ],
    instructor: "Vault Performance",
    students: 720,
    isNew: true,
  },

  // 2.5️⃣ VAULT™ ELITE SOFTBALL SLAP SYSTEM
  {
    id: "softball-slap-system",
    title: "Elite Softball Slap System",
    description: "Speed, pressure, precision, and chaos creation. The triple-threat slapper: bunt, soft slap, hard slap. NFCA-aligned target-based slapping with game application rules and development stages.",
    image: courseHitting,
    duration: "8 Weeks",
    modules: 10,
    lessons: 52,
    icon: Sparkles,
    tag: "Signature",
    pillar: "velocity",
    category: "hitting",
    level: "All Levels",
    sport_type: "softball",
    metrics: ["Bunt Success %", "Soft Slap Target %", "Hard Slap Target %", "First-Base Time"],
    features: [
      "Triple-threat philosophy: bunt, soft slap, hard slap, slash",
      "Complete slap mechanics (stance through run-through)",
      "3 core slap types with placement targets",
      "Foundation → Development → Elite progression",
      "Elite 5-drill stack with read-and-react",
      "Game application decision rules",
      "Coach implementation guidelines",
      "VAULT™ 5-pillar integration",
    ],
    instructor: "Vault Performance",
    students: 480,
    isNew: true,
  },

  // 3️⃣ VAULT™ SOFTBALL PITCHING SYSTEM (MOST IMPORTANT)
  {
    id: "softball-pitching-elite",
    title: "Elite Windmill Pitching System",
    description: "The most important system in softball. Biomechanics-based windmill pitching across all 4 phases: Wind-Up, Stride, Acceleration, Follow-Through. Spin creation, velocity progression, and workload management.",
    image: coursePitching,
    duration: "12 Weeks",
    modules: 8,
    lessons: 56,
    icon: Target,
    tag: "Elite",
    pillar: "velocity",
    category: "pitching",
    level: "All Levels",
    sport_type: "softball",
    metrics: ["Pitch Velocity", "Spin Rate", "Command %", "Arsenal Depth"],
    features: [
      "4-phase mechanics (Wind-Up → Follow-Through)",
      "Spin creation: rise, drop, curve",
      "Command & location training",
      "Velocity progression protocols",
      "Workload management system",
      "Recovery protocols",
      "Shoulder stress management",
      "Underhand ≠ safe — arm health critical",
    ],
    instructor: "Vault Performance",
    students: 890,
    isNew: true,
  },

  // 4️⃣ VAULT™ SOFTBALL DEFENSIVE SYSTEM
  {
    id: "softball-defense-complete",
    title: "Softball Defensive System",
    description: "Softball-specific defensive training: faster reaction windows, shorter arm paths, quick-release throws for infield. Shorter reads and aggressive play for outfield.",
    image: courseFielding,
    duration: "8 Weeks",
    modules: 5,
    lessons: 30,
    icon: Shield,
    tag: "Complete",
    pillar: "utility",
    category: "fielding",
    level: "All Levels",
    sport_type: "softball",
    metrics: ["Reaction Time", "Throw Velocity", "Range Factor", "Fielding %"],
    features: [
      "Infield: faster reaction windows",
      "Infield: shorter arm paths",
      "Infield: quick-release throws",
      "Outfield: shorter reads & aggressive play",
      "Catching: framing, blocking, throws",
    ],
    instructor: "Vault Performance",
    students: 540,
    isNew: true,
  },

  // 5️⃣ VAULT™ SOFTBALL SPEED & BASERUNNING
  {
    id: "softball-speed-baserunning",
    title: "Softball Speed & Base Running System",
    description: "Softball = speed game. First-step explosion, aggressive turns, slide variations, and read-based baserunning. Maximize speed as a weapon on the bases.",
    image: courseHitting,
    duration: "6 Weeks",
    modules: 4,
    lessons: 20,
    icon: Wind,
    tag: "Essential",
    pillar: "athleticism",
    category: "speed",
    level: "All Levels",
    sport_type: "softball",
    metrics: ["Home-to-1st", "Steal Success %", "Slide Efficiency", "Decision Speed"],
    features: [
      "First-step explosion drills",
      "Aggressive turn mechanics",
      "Slide variations & technique",
      "Read-based baserunning decisions",
      "Speed as offensive weapon",
    ],
    instructor: "Vault Performance",
    students: 460,
    isNew: true,
  },

  // 6️⃣ VAULT™ SHORT GAME SYSTEM (SIGNATURE DIFFERENTIATOR)
  {
    id: "softball-short-game",
    title: "Softball Short Game System",
    description: "Where softball separates. Master bunting systems, push bunts, slap hitting, and situational offense. This is VAULT's signature softball differentiator.",
    image: courseHitting,
    duration: "6 Weeks",
    modules: 4,
    lessons: 24,
    icon: Sparkles,
    tag: "Signature",
    pillar: "transfer",
    category: "performance",
    level: "All Levels",
    sport_type: "softball",
    metrics: ["Bunt Success %", "Slap Accuracy", "Push Bunt Distance", "Situational Execution"],
    features: [
      "Bunting system mastery",
      "Push bunt techniques",
      "Slap hitting progressions",
      "Situational offense playbook",
      "Game-situation drills",
    ],
    instructor: "Vault Performance",
    students: 380,
    isNew: true,
  },

  // 7️⃣ VAULT™ SOFTBALL ARM HEALTH
  {
    id: "softball-arm-health",
    title: "Softball Arm Health System",
    description: "Softball pitchers throw WAY more frequently. Pitch volume tracking, pitcher + position overlap rules, tournament workload control, and recovery cycles. Underhand ≠ safe.",
    image: coursePitching,
    duration: "Ongoing",
    modules: 5,
    lessons: 20,
    icon: Heart,
    tag: "Critical",
    pillar: "longevity",
    category: "recovery",
    level: "All Levels",
    sport_type: "softball",
    metrics: ["Pitch Volume", "Recovery Score", "Availability %", "Shoulder Health"],
    features: [
      "Pitch volume tracking (CRITICAL)",
      "Pitcher + position overlap rules",
      "Tournament workload control",
      "Recovery cycle protocols",
      "Shoulder stress management",
    ],
    instructor: "Vault Performance",
    students: 560,
    isNew: true,
  },
];

interface CourseCardProps {
  course: typeof allCourses[0];
  index: number;
  isEnrolled: boolean;
  enrollment?: { id: string; progress_percent: number; status: string } | null;
  onEnroll: () => void;
  isEnrolling: boolean;
  isLoggedIn: boolean;
}

const CourseCard = ({ course, index, isEnrolled, enrollment, onEnroll, isEnrolling, isLoggedIn }: CourseCardProps) => {
  const Icon = course.icon;
  const [expanded, setExpanded] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-500 hover:shadow-xl"
    >
      {isEnrolled && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg">
            {enrollment?.status === "completed" ? "Completed" : "Enrolled"}
          </div>
        </div>
      )}

      {/* New This Week Badge */}
      {(course as any).isNew && !isEnrolled && (
        <NewThisWeekBadge variant="floating" forceShow={true} size="sm" className="!top-2 !left-2 !right-auto" />
      )}

      <div className="relative h-44 overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
        
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
            {course.tag}
          </span>
          <span className="px-3 py-1 rounded-full bg-background/90 text-foreground text-xs font-medium border border-border">
            {course.level}
          </span>
        </div>

        <div className="absolute bottom-4 right-4">
          <div className="w-10 h-10 rounded-xl bg-background/90 backdrop-blur-sm flex items-center justify-center border border-border">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>

      <div className="p-5">
        {isEnrolled && enrollment && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-primary">{enrollment.progress_percent}%</span>
            </div>
            <Progress value={enrollment.progress_percent} className="h-2" />
          </div>
        )}

        <div className="flex items-center gap-3 mb-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {course.duration}
          </span>
          <span>{course.modules} Modules</span>
          <span>{course.lessons} Lessons</span>
        </div>

        <h3 className="text-lg font-display text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {course.title}
        </h3>

        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {course.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {course.metrics.map((metric) => (
            <span 
              key={metric}
              className="px-2 py-0.5 rounded-md bg-secondary text-xs text-muted-foreground"
            >
              {metric}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 pb-3 border-b border-border">
          <span>{course.instructor}</span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {course.students.toLocaleString()}
          </span>
        </div>

        <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-40' : 'max-h-0'}`}>
          <ul className="space-y-1.5 mb-3">
            {course.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-primary hover:underline mb-3"
        >
          {expanded ? 'Show less' : 'Show features'}
        </button>

        <div className="flex gap-2">
          {!isLoggedIn ? (
            <Button variant="vault" size="sm" className="flex-1 bg-amber-500 hover:bg-amber-600 text-[#181818]" asChild>
              <Link to="/auth">
                <Lock className="w-3 h-3 mr-1" />
                Sign In to Enroll
              </Link>
            </Button>
          ) : isEnrolled ? (
            <Button variant="default" size="sm" className="flex-1" asChild>
              <Link to={`/course/${course.id}`}>
                <BookOpen className="w-3 h-3 mr-1" />
                Continue
              </Link>
            </Button>
          ) : (
            <Button 
              variant="default" 
              size="sm"
              className="flex-1"
              onClick={onEnroll}
              disabled={isEnrolling}
            >
              {isEnrolling ? "..." : "Enroll"}
            </Button>
          )}
          <Button variant="outline" size="icon" className="h-8 w-8">
            <PlayCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const CoursesPage = () => {
  const [activePillar, setActivePillar] = useState("all");
  const [activeSport, setActiveSport] = useState<"all" | "baseball" | "softball">("all");
  const [userId, setUserId] = useState<string | undefined>();
  
  const { data: enrollments = [] } = useCourseEnrollments(userId);
  const enrollMutation = useEnrollInCourse();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id);
    });
  }, []);

  const getEnrollment = (courseId: string) => {
    return enrollments.find(e => e.course_id === courseId);
  };

  const handleEnroll = (courseId: string) => {
    if (!userId) return;
    enrollMutation.mutate({ userId, courseId });
  };

  const sportFilteredCourses = activeSport === "all"
    ? allCourses
    : allCourses.filter(course => {
        const st = (course as any).sport_type;
        return st === activeSport || st === "both";
      });

  const filteredCourses = activePillar === "all" 
    ? sportFilteredCourses 
    : activePillar === "enrolled"
    ? sportFilteredCourses.filter(course => enrollments.some(e => e.course_id === course.id))
    : sportFilteredCourses.filter(course => course.pillar === activePillar);

  const enrolledCount = enrollments.length;
  const currentPillar = vaultPillars.find(p => p.id === activePillar);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="container mx-auto px-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="outline" className="mb-4">
              VAULT™ Training Systems
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bebas text-foreground mb-4">
              PILLAR-BASED <span className="text-primary">PROGRAMS</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              Premium execution layers built on the VAULT™ framework. Every program maps to a core pillar, 
              ensuring systematic development across your entire organization.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>{allCourses.length} Complete Programs</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4 text-primary" />
                <span>{allCourses.reduce((sum, c) => sum + c.students, 0).toLocaleString()}+ Athletes</span>
              </div>
              {userId && enrolledCount > 0 && (
                <div className="flex items-center gap-2 text-sm text-primary font-medium">
                  <BookOpen className="w-4 h-4" />
                  <span>{enrolledCount} Enrolled</span>
                </div>
              )}
            </div>
          </motion.div>
        </section>

        {/* Sport Filter */}
        <section className="container mx-auto px-4 mb-4">
          <div className="flex justify-center gap-2">
            {([
              { key: "all" as const, label: "All Sports" },
              { key: "baseball" as const, label: "⚾ Baseball" },
              { key: "softball" as const, label: "🥎 Softball" },
            ]).map(({ key, label }) => (
              <Button
                key={key}
                variant={activeSport === key ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSport(key)}
              >
                {label}
              </Button>
            ))}
          </div>
        </section>

        {/* Pillar Navigation */}
        <section className="container mx-auto px-4 mb-8">
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <Button
              variant={activePillar === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setActivePillar("all")}
            >
              All Programs
            </Button>
            {userId && (
              <Button
                variant={activePillar === "enrolled" ? "default" : "outline"}
                size="sm"
                onClick={() => setActivePillar("enrolled")}
                className="relative"
              >
                My Programs
                {enrolledCount > 0 && (
                  <span className="ml-1.5 bg-primary-foreground text-primary text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {enrolledCount}
                  </span>
                )}
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {vaultPillars.map((pillar) => {
              const Icon = pillar.icon;
              const count = sportFilteredCourses.filter(c => c.pillar === pillar.id).length;
              return (
                <button
                  key={pillar.id}
                  onClick={() => setActivePillar(pillar.id)}
                  className={`relative p-4 rounded-xl border transition-all duration-300 text-left ${
                    activePillar === pillar.id 
                      ? "border-primary bg-primary/10" 
                      : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${pillar.color} flex items-center justify-center mb-2`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="font-bebas text-foreground">{pillar.name}</div>
                  <div className="text-xs text-muted-foreground">{pillar.tagline}</div>
                  <Badge variant="secondary" className="absolute top-3 right-3 text-xs">
                    {count}
                  </Badge>
                </button>
              );
            })}
          </div>
        </section>

        {/* Current Pillar Description */}
        {currentPillar && (
          <section className="container mx-auto px-4 mb-8">
            <Card className={`bg-gradient-to-r ${currentPillar.color} border-0`}>
              <CardContent className="p-6 text-white">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    <currentPillar.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bebas mb-1">{currentPillar.name} → {currentPillar.tagline}</h2>
                    <p className="text-white/90 mb-3">{currentPillar.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {currentPillar.metrics.map((metric) => (
                        <Badge key={metric} className="bg-white/20 text-white border-white/30">
                          {metric}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Courses Grid */}
        <section className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredCourses.map((course, index) => {
              const enrollment = getEnrollment(course.id);
              return (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  index={index}
                  isEnrolled={!!enrollment}
                  enrollment={enrollment}
                  onEnroll={() => handleEnroll(course.id)}
                  isEnrolling={enrollMutation.isPending}
                  isLoggedIn={!!userId}
                />
              );
            })}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-16">
              {activePillar === "enrolled" ? (
                <div>
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">You haven't enrolled in any programs yet.</p>
                  <Button onClick={() => setActivePillar("all")}>Browse Programs</Button>
                </div>
              ) : (
                <p className="text-muted-foreground">No programs found in this pillar.</p>
              )}
            </div>
          )}
        </section>

        {/* Mental Performance Callout */}
        <section className="container mx-auto px-4 mt-16">
          <Card className="bg-gradient-to-r from-indigo-500 to-violet-500 border-0 overflow-hidden">
            <CardContent className="p-8 text-white relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 max-w-2xl">
                <Badge className="bg-white/20 text-white border-white/30 mb-4">
                  Cross-Pillar System
                </Badge>
                <h2 className="text-3xl font-bebas mb-3">
                  MENTAL PERFORMANCE IS <span className="text-yellow-300">NOT OPTIONAL</span>
                </h2>
                <p className="text-white/90 mb-4">
                  Mental performance becomes required weekly work—elevating VAULT™ beyond physical training. 
                  Championship mindset is the foundation every other pillar builds upon.
                </p>
                <Button 
                  variant="secondary" 
                  onClick={() => setActivePillar("mental")}
                  className="bg-white text-indigo-600 hover:bg-white/90"
                >
                  View Mental Programs
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Development Pathways Link */}
        <section className="container mx-auto px-4 mt-12">
          <div className="grid md:grid-cols-2 gap-6">
            <Link to="/pathway/youth" className="group">
              <Card className="bg-card hover:border-primary/30 transition-all duration-300 h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Star className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bebas text-xl text-foreground group-hover:text-primary transition-colors">Youth Pathway</h3>
                    <p className="text-sm text-muted-foreground">Ages 8-12 • Movement quality, coordination, and confidence</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            </Link>
            <Link to="/pathway/academy" className="group">
              <Card className="bg-card hover:border-primary/30 transition-all duration-300 h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bebas text-xl text-foreground group-hover:text-primary transition-colors">Academy Pathway</h3>
                    <p className="text-sm text-muted-foreground">Ages 13-18 • Strength, power, and measurable performance</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CoursesPage;
