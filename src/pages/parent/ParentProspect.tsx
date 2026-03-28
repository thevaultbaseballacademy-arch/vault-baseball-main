import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star, TrendingUp, Target, ArrowRight, Trophy, Brain,
  ChevronRight, BarChart3, Zap, Users, Shield, Calendar,
  BookOpen, CheckCircle2, AlertTriangle, Info, Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useParentPortal } from "@/hooks/useParentPortal";
import { scaleLabel, classifyLevel, type SportType as GradeSportType } from "@/lib/prospectGrading";

const DIVISION_STANDARDS = [
  { level: "MLB / Pro", grade: 70, color: "text-green-500", bg: "bg-green-500/10", desc: "Top 0.5% nationally. Elite tools across the board." },
  { level: "D1 Scholarship", grade: 60, color: "text-blue-500", bg: "bg-blue-500/10", desc: "Above-average tools. Power 5 to mid-major range." },
  { level: "D2 / JUCO", grade: 50, color: "text-amber-500", bg: "bg-amber-500/10", desc: "Average tools. Strong program fit and academics." },
  { level: "D3 / NAIA", grade: 40, color: "text-orange-500", bg: "bg-orange-500/10", desc: "Developing tools. Academic programs + sport." },
  { level: "HS Varsity", grade: 35, color: "text-muted-foreground", bg: "bg-secondary", desc: "Ready to contribute at high school varsity level." },
];

const RECRUITING_EDUCATION = [
  {
    title: "When Do Coaches Start Looking?",
    content: "D1 coaches can first contact athletes on June 15 after sophomore year (NCAA rule). However, coaches begin evaluating athletes at showcases and camps as early as 13-14. The athletes who are 'ready' at 15-16 built their foundation at 13-14.",
    actionable: "Action: Build your KPI baseline NOW, even if your athlete is 12-13. Every VAULT™ data point is part of the story.",
    urgency: "medium"
  },
  {
    title: "What Coaches Actually Ask For",
    content: "In 2025, nearly every D1 coach requests: (1) Video — highlight + full game. (2) Verified measurables — exit velocity, pitch velocity, 60 time with measurement source. (3) Academic profile — GPA, test scores, intended major. (4) Character references from coaches.",
    actionable: "Action: Your athlete's VAULT™ profile generates a shareable recruiting link with all verified metrics. Use it.",
    urgency: "high"
  },
  {
    title: "The 20-80 Scale Explained Simply",
    content: "Professional scouts use a 20-80 scale: 50 = MLB average. 60 = above average (D1 starter level). 70 = plus-plus (top D1 / draft prospect). 80 = elite/generational. Your athlete's VAULT™ Prospect Grade is normalized by age — a 55 at 14 is different than a 55 at 17.",
    actionable: "Action: Run VAULT™ Prospect Grader to see current grades with age-normalized context.",
    urgency: "low"
  },
  {
    title: "Present Grade vs. Future Grade",
    content: "D1 coaches recruit future grades (ceiling), not present grades — especially for young athletes. A 14-year-old with a 45 grade and a steep development trajectory is more valuable than a 16-year-old with a 52 grade and flat trajectory. Development rate matters more than current level.",
    actionable: "Action: Consistent VAULT™ KPI logging creates the trajectory graph coaches want to see.",
    urgency: "medium"
  },
  {
    title: "The Showcase Strategy (What Most Families Get Wrong)",
    content: "Most families over-showcase (too many, too young) or under-showcase (no data ready). The optimal showcase window is 15-16 years old with verified data ready. Before 14: focus on development. Age 14-15: build data and video. Age 15-17: selective strategic showcases.",
    actionable: "Action: Don't pay for showcases until you have verified metrics to present. Data without context = opportunity lost.",
    urgency: "high"
  },
  {
    title: "Academic Profile: The Hidden Multiplier",
    content: "In 2025, 78% of college coaches ranked 'academic ability' in their top 3 criteria — up from 52% in 2019. Athletes with ≥3.5 GPA have access to a much larger pool of scholarship opportunities (academic scholarships stack with athletic aid). Academic D1 and D3 programs value academics as much as tools.",
    actionable: "Action: GPA and test scores are tracked in your athlete's VAULT™ profile. Keep them updated.",
    urgency: "high"
  }
];

const ParentProspect = () => {
  const [searchParams] = useSearchParams();
  const athleteId = searchParams.get("athlete");
  const { activeLinks, fetchAthleteData, athleteData } = useParentPortal();
  const [expandedEd, setExpandedEd] = useState<number | null>(null);

  const selectedLink = athleteId
    ? activeLinks.find(l => l.athlete_user_id === athleteId)
    : activeLinks[0];
  const currentAthleteId = selectedLink?.athlete_user_id;

  useEffect(() => {
    if (currentAthleteId && !athleteData[currentAthleteId]) fetchAthleteData(currentAthleteId);
  }, [currentAthleteId]);

  const data = currentAthleteId ? athleteData[currentAthleteId] : null;
  const profile = data?.profile;
  const kpis = data?.recent_kpis || [];
  const recruiting = data?.recruiting;

  // Estimate overall grade from KPIs
  const exitVelo = kpis.find(k => k.kpi_name.toLowerCase().includes("exit"))?.kpi_value;
  const pitchVelo = kpis.find(k => k.kpi_name.toLowerCase().includes("pitch") || k.kpi_name.toLowerCase().includes("velocity"))?.kpi_value;
  const sixtyYard = kpis.find(k => k.kpi_name.toLowerCase().includes("60") || k.kpi_name.toLowerCase().includes("sixty"))?.kpi_value;
  const hasData = exitVelo || pitchVelo || sixtyYard;

  if (!currentAthleteId) {
    return (
      <div className="p-6 lg:p-10 text-center py-20">
        <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
        <p className="text-muted-foreground">Link an athlete to view prospect information.</p>
        <Link to="/parent" className="text-primary text-sm hover:underline mt-2 inline-block">Go to My Athletes</Link>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
          <Star className="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-display text-foreground">
            {profile?.display_name || "Athlete"}'s Prospect Profile
          </h1>
          <p className="text-sm text-muted-foreground capitalize">
            {profile?.position?.replace("_", " ")} · {profile?.sport_type === "softball" ? "🥎 Softball" : "⚾ Baseball"}
            {profile?.graduation_year ? ` · Class of ${profile.graduation_year}` : ""}
          </p>
        </div>
      </div>

      {/* KPI Snapshot */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-display text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" /> Current Measurables
        </h2>
        {hasData ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {kpis.slice(0, 6).map((kpi, i) => {
              const isLower = kpi.kpi_name.toLowerCase().includes("60") || kpi.kpi_name.toLowerCase().includes("pop");
              return (
                <div key={i} className="bg-secondary rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{kpi.kpi_name}</p>
                  <p className="text-xl font-display text-foreground">{kpi.kpi_value}</p>
                  <p className="text-xs text-muted-foreground">{kpi.kpi_unit}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No KPI data logged yet.</p>
            <p className="text-xs mt-1">Your athlete needs to log metrics in VAULT™ for this section to populate.</p>
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <Link to="/prospect-grader" className="flex-1">
            <Button variant="vault" size="sm" className="w-full gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Run Full Prospect Grade
            </Button>
          </Link>
          <Link to="/parent/recruiting" className="flex-1">
            <Button variant="outline" size="sm" className="w-full gap-1.5">
              <ArrowRight className="w-3.5 h-3.5" /> Recruiting Status
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Division Standards Reference */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-display text-foreground mb-4 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" /> Division Standard Reference (20-80 Scale)
        </h2>
        <div className="space-y-2">
          {DIVISION_STANDARDS.map((std) => {
            const { label } = scaleLabel(std.grade);
            return (
              <div key={std.level} className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                <div className={`w-12 text-center shrink-0`}>
                  <p className={`text-lg font-display ${std.color}`}>{std.grade}</p>
                  <p className="text-[9px] text-muted-foreground">{label}</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{std.level}</p>
                  <p className="text-xs text-muted-foreground">{std.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-3 p-3 bg-secondary rounded-xl">
          <span className="font-medium text-foreground">Important context:</span> Grades are age-normalized — a 50 at age 14 means something very different than a 50 at age 17. D1 coaches recruit ceilings (future grade), especially for younger athletes. Development rate matters as much as current level.
        </p>
      </motion.div>

      {/* Recruiting Education */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-display text-foreground mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-green-500" /> Recruiting Education for Parents
        </h2>
        <div className="space-y-2">
          {RECRUITING_EDUCATION.map((item, i) => (
            <div key={i} className={`border border-border rounded-xl overflow-hidden ${expandedEd === i ? "border-primary/30" : ""}`}>
              <button
                className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors"
                onClick={() => setExpandedEd(expandedEd === i ? null : i)}
              >
                <div className="flex items-center gap-3">
                  <Badge className={`text-[10px] shrink-0 ${item.urgency === "high" ? "bg-red-500/10 text-red-500 border-0" : item.urgency === "medium" ? "bg-amber-500/10 text-amber-500 border-0" : "bg-blue-500/10 text-blue-500 border-0"}`}>
                    {item.urgency === "high" ? "Act Now" : item.urgency === "medium" ? "Plan Ahead" : "Know This"}
                  </Badge>
                  <span className="text-sm font-medium text-foreground">{item.title}</span>
                </div>
                <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expandedEd === i ? "rotate-90" : ""}`} />
              </button>
              {expandedEd === i && (
                <div className="px-4 pb-4 space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.content}</p>
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                    <p className="text-xs font-medium text-primary mb-0.5">Parent Action</p>
                    <p className="text-sm text-foreground">{item.actionable}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recruiting Profile Status */}
      {recruiting && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-display text-foreground mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-500" /> Recruiting Profile Status
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-secondary rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Commitment Status</p>
              <p className="text-sm font-medium text-foreground capitalize mt-1">{recruiting.commitment_status?.replace("_", " ") || "Uncommitted"}</p>
            </div>
            <div className="bg-secondary rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Division Target</p>
              <p className="text-sm font-medium text-foreground mt-1">{recruiting.division_target?.join(", ") || "Not set"}</p>
            </div>
            {recruiting.gpa && (
              <div className="bg-secondary rounded-xl p-3">
                <p className="text-xs text-muted-foreground">GPA</p>
                <p className="text-sm font-medium text-foreground mt-1">{recruiting.gpa}</p>
              </div>
            )}
            {recruiting.committed_school && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                <p className="text-xs text-green-600">Committed School</p>
                <p className="text-sm font-medium text-foreground mt-1">{recruiting.committed_school}</p>
              </div>
            )}
          </div>
          <Link to="/parent/recruiting">
            <Button variant="outline" size="sm" className="w-full gap-1.5">
              View Full Recruiting Details <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </motion.div>
      )}
    </div>
  );
};

export default ParentProspect;
