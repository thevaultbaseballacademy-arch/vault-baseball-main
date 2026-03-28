import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Users, BarChart3, GraduationCap, Heart, Brain, Dumbbell,
  Star, Trophy, TrendingUp, Calendar, BookOpen, Shield,
  ChevronRight, UserPlus, CheckCircle2, AlertTriangle, Target,
  Zap, Moon, Activity, ArrowRight, Sparkles, MessageSquare,
  Loader2, Send, Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useParentPortal } from "@/hooks/useParentPortal";

const PARENT_EDUCATION = [
  {
    title: "Understanding the Recruiting Timeline",
    category: "Recruiting",
    icon: GraduationCap, color: "text-green-500", bg: "bg-green-500/10",
    summary: "D1 coaches can first contact athletes on June 15 after sophomore year. Starting 6-12 months earlier with verified stats and video is the single biggest family advantage.",
    keyPoints: [
      "D1 & D2: Coaches contact after June 15 of 10th grade",
      "D3/NAIA: No contact restrictions after 9th grade",
      "NCAA Eligibility Center: Register by end of junior year (critical)",
      "Video + data sheet = 3x more callbacks than video alone",
      "Showcase timing: 15-16 is the optimal age for impact events",
    ],
    link: "/recruiting",
    linkLabel: "Open Recruiting Hub",
  },
  {
    title: "What Development Actually Looks Like",
    category: "Development Science",
    icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10",
    summary: "Development is measurable — exit velocity, spin rate, sprint time. A 3 mph gain over a training block is real development. Published research shows the biggest gains happen ages 13-16.",
    keyPoints: [
      "Track KPIs consistently — data tells the story coaches want",
      "Critical physical development window: ages 13-16",
      "Consistency beats intensity at youth ages (NSCA guideline)",
      "Multi-sport through 14 = better long-term development outcomes",
      "Mental performance is trainable, not fixed",
    ],
    link: "/parent/progress",
    linkLabel: "View Progress",
  },
  {
    title: "Prospect Grades & The 20-80 Scale",
    category: "Recruiting Intel",
    icon: Star, color: "text-amber-500", bg: "bg-amber-500/10",
    summary: "Professional scouts use a 20-80 scale. 50 = MLB average. 60 = above average (D1 starter). 80 = generational. VAULT Prospect Grader shows exactly where your athlete stands.",
    keyPoints: [
      "50 grade = D1 baseline. 60 = scholarship-level D1.",
      "Grades are age-normalized — a 60 at 14 is different than at 17",
      "Present grade vs. Future grade (ceiling) — both matter for recruiting",
      "D1 coaches recruit ceilings, not current levels, for young athletes",
      "One below-average tool can be compensated; two is a barrier",
    ],
    link: "/prospect-grader",
    linkLabel: "Run Prospect Grade",
  },
  {
    title: "Sleep, Recovery & Performance — What Parents Control",
    category: "Athlete Health",
    icon: Moon, color: "text-indigo-500", bg: "bg-indigo-500/10",
    summary: "Athletes sleeping less than 7 hours show 1.7x higher injury rates and measurable velocity drops. This is the #1 thing parents can directly influence — more than any training decision.",
    keyPoints: [
      "Youth athletes need 8.5-9.5 hours (not 8) per Sports Medicine research",
      "Screens within 60 min of bed delay sleep onset by avg 47 minutes",
      "Sleep-deprived pitchers show 2x velocity inconsistency same-day",
      "Growth hormone peaks during deep sleep — when development happens",
      "Schedule: consistent bedtime > longer sleep on weekends",
    ],
    link: "/recovery-system",
    linkLabel: "View Recovery System",
  },
  {
    title: "Understanding Early Specialization Risk",
    category: "Youth Development",
    icon: Shield, color: "text-red-500", bg: "bg-red-500/10",
    summary: "A 2025 study of 1,200 athletes found those specializing before 14 had 2.1x higher UCL injury rate and 31% lower D1 roster probability than multi-sport athletes. The data is now definitive.",
    keyPoints: [
      "Specialize before 14: 2.1x higher Tommy John risk (Pediatric Orthopaedics 2025)",
      "68% of current D1 baseball players played 2+ sports at age 14",
      "Year-round baseball before 14 is not required — and may be harmful",
      "Fall showcases at 12-13 don't predict D1 outcomes",
      "Let them play other sports. The skills transfer.",
    ],
    link: "/game-intelligence",
    linkLabel: "Read Research Report",
  },
];

const QUICK_LINKS = [
  { label: "Progress & KPIs", href: "/parent/progress", icon: BarChart3, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Lessons", href: "/parent/lessons", icon: BookOpen, color: "text-purple-500", bg: "bg-purple-500/10" },
  { label: "Recruiting", href: "/parent/recruiting", icon: GraduationCap, color: "text-green-500", bg: "bg-green-500/10" },
  { label: "Wellness", href: "/parent/wellness", icon: Heart, color: "text-red-500", bg: "bg-red-500/10" },
  { label: "Training", href: "/parent/training", icon: Dumbbell, color: "text-amber-500", bg: "bg-amber-500/10" },
  { label: "Prospect Grader", href: "/prospect-grader", icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" },
  { label: "Recovery", href: "/recovery-system", icon: Moon, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { label: "Game Intelligence", href: "/game-intelligence", icon: Brain, color: "text-indigo-500", bg: "bg-indigo-500/10" },
];

const ParentHub = () => {
  const { activeLinks, pendingLinks, loading, linkAthlete, fetchAthleteData, athleteData } = useParentPortal();
  const [showLink, setShowLink] = useState(false);
  const [email, setEmail] = useState("");
  const [linking, setLinking] = useState(false);
  const [expandedEdu, setExpandedEdu] = useState<number | null>(null);

  useEffect(() => {
    activeLinks.forEach(link => {
      if (!athleteData[link.athlete_user_id]) fetchAthleteData(link.athlete_user_id);
    });
  }, [activeLinks]);

  const handleLink = async () => {
    if (!email.trim()) return;
    setLinking(true);
    try { await linkAthlete(email.trim()); setEmail(""); setShowLink(false); }
    finally { setLinking(false); }
  };

  return (
    <div className="p-5 lg:p-8 max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-display text-foreground">PARENT COMMAND CENTER</h1>
          <p className="text-sm text-muted-foreground mt-1">Complete visibility into your athlete's development journey</p>
        </div>
        <Dialog open={showLink} onOpenChange={setShowLink}>
          <DialogTrigger asChild>
            <Button size="sm"><UserPlus className="w-4 h-4 mr-2" /> Link Athlete</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">LINK YOUR ATHLETE</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">Enter your athlete's VAULT email address. They'll receive a confirmation request.</p>
              <div>
                <Label className="text-xs mb-1.5 block">Athlete's VAULT Email</Label>
                <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="athlete@example.com" type="email" />
              </div>
              <Button onClick={handleLink} disabled={linking || !email.trim()} className="w-full">
                {linking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                Send Link Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pending Links */}
      {pendingLinks.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <p className="text-xs font-medium text-amber-600 mb-1 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Pending Links</p>
          {pendingLinks.map(l => (
            <p key={l.id} className="text-xs text-muted-foreground">Link request sent — waiting for athlete to confirm.</p>
          ))}
        </div>
      )}

      {/* No Athletes */}
      {!loading && activeLinks.length === 0 && (
        <div className="text-center py-16 bg-card border border-border rounded-2xl">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="font-display text-xl text-foreground mb-2">Link Your First Athlete</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Enter your athlete's VAULT email to connect. Once linked, you'll have full visibility into their development, lessons, recruiting, and wellness.
          </p>
          <Button onClick={() => setShowLink(true)}><UserPlus className="w-4 h-4 mr-2" /> Link Athlete Now</Button>
        </div>
      )}

      {/* Athlete Cards */}
      {activeLinks.map(link => {
        const data = athleteData[link.athlete_user_id];
        if (!data) return (
          <div key={link.id} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-secondary animate-pulse" />
              <div className="space-y-2"><div className="h-4 bg-secondary rounded w-32 animate-pulse" /><div className="h-3 bg-secondary rounded w-24 animate-pulse" /></div>
            </div>
          </div>
        );
        const profile = data.profile;
        const dev = data.development_score;
        const kpis = (data.recent_kpis || []).slice(0, 4);
        const checkins = data.checkins || [];
        const latestCheckin = checkins[0];
        const recentLessons = (data.recent_lessons || []).slice(0, 2);
        const workload = data.workload || [];
        const hasOveruse = workload.some(w => w.overuse_flag);

        const statusColor = dev?.improvement_status === "improving" ? "text-green-500" :
          dev?.improvement_status === "regressing" ? "text-red-500" :
          dev?.improvement_status === "stalled" ? "text-amber-500" : "text-blue-500";

        const statusLabel = dev?.improvement_status === "improving" ? "Improving ↑" :
          dev?.improvement_status === "regressing" ? "Needs Attention" :
          dev?.improvement_status === "stalled" ? "Needs Attention" : "Steady →";

        return (
          <motion.div key={link.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl overflow-hidden">
            {/* Athlete Header */}
            <div className="p-5 border-b border-border">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-xl font-display text-primary">
                    {profile?.display_name?.[0] || "A"}
                  </div>
                  <div>
                    <h2 className="text-xl font-display text-foreground">{profile?.display_name || "Athlete"}</h2>
                    <p className="text-sm text-muted-foreground capitalize">
                      {profile?.position?.replace("_", " ")} · {profile?.sport_type === "softball" ? "Softball" : "Baseball"}
                      {profile?.graduation_year ? ` · Class of ${profile.graduation_year}` : ""}
                    </p>
                    {dev?.improvement_status && (
                      <span className={`text-xs font-medium ${statusColor}`}>{statusLabel}</span>
                    )}
                  </div>
                </div>
                {hasOveruse && (
                  <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                    <AlertTriangle className="w-3 h-3 mr-1" /> Workload Alert
                  </Badge>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 divide-x divide-border border-b border-border">
              {[
                { label: "Dev Score", value: dev?.overall_score ? `${dev.overall_score}` : "—", sub: "/100", color: "text-primary" },
                { label: "Consistency", value: dev?.training_consistency ? `${dev.training_consistency}%` : "—", sub: "compliance", color: "text-green-500" },
                { label: "Sleep (7d)", value: checkins.length > 0 ? (checkins.slice(0,7).filter(c => c.sleep_hours).reduce((s, c) => s + (c.sleep_hours || 0), 0) / Math.max(checkins.slice(0,7).filter(c => c.sleep_hours).length, 1)).toFixed(1) + "h" : "—", sub: "avg", color: "text-indigo-500" },
                { label: "Workload", value: hasOveruse ? "⚠ High" : "✓ OK", sub: "this week", color: hasOveruse ? "text-red-500" : "text-green-500" },
              ].map(s => (
                <div key={s.label} className="p-3 text-center">
                  <p className={`text-lg font-display ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            {/* KPIs */}
            {kpis.length > 0 && (
              <div className="p-4 border-b border-border">
                <p className="text-xs font-medium text-foreground uppercase tracking-wide mb-3">Recent KPIs</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {kpis.map((kpi, i) => (
                    <div key={i} className="bg-secondary rounded-lg p-2 text-center">
                      <p className="text-sm font-display text-foreground">{kpi.kpi_value}<span className="text-xs text-muted-foreground ml-0.5">{kpi.kpi_unit}</span></p>
                      <p className="text-[10px] text-muted-foreground truncate">{kpi.kpi_name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Lessons */}
            {recentLessons.length > 0 && (
              <div className="p-4 border-b border-border">
                <p className="text-xs font-medium text-foreground uppercase tracking-wide mb-3">Recent Lessons</p>
                <div className="space-y-2">
                  {recentLessons.map((lesson, i) => (
                    <div key={i} className="bg-secondary rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <p className="text-xs font-medium text-foreground">{lesson.lesson_focus || "Practice Session"}</p>
                        <p className="text-xs text-muted-foreground">{new Date(lesson.created_at).toLocaleDateString()}</p>
                      </div>
                      {lesson.ai_summary && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{lesson.ai_summary}</p>}
                      {lesson.strengths_observed && (
                        <div className="flex items-center gap-1 mt-1">
                          <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                          <p className="text-xs text-green-600 line-clamp-1">{lesson.strengths_observed}</p>
                        </div>
                      )}
                      {lesson.areas_for_improvement && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Target className="w-3 h-3 text-amber-500 shrink-0" />
                          <p className="text-xs text-amber-600 line-clamp-1">{lesson.areas_for_improvement}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation to sub-sections */}
            <div className="p-4 grid grid-cols-2 gap-2">
              <Link to={`/parent/progress?athlete=${link.athlete_user_id}`}>
                <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5" /> Full Progress
                </Button>
              </Link>
              <Link to={`/parent/recruiting?athlete=${link.athlete_user_id}`}>
                <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" /> Recruiting
                </Button>
              </Link>
              <Link to={`/parent/wellness?athlete=${link.athlete_user_id}`}>
                <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
                  <Heart className="w-3.5 h-3.5" /> Wellness
                </Button>
              </Link>
              <Link to={`/prospect-grader`}>
                <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
                  <Star className="w-3.5 h-3.5" /> Prospect Grade
                </Button>
              </Link>
            </div>
          </motion.div>
        );
      })}

      {/* Quick Links */}
      {activeLinks.length > 0 && (
        <div>
          <h2 className="font-display text-lg text-foreground mb-3">Quick Access</h2>
          <div className="grid grid-cols-4 gap-2">
            {QUICK_LINKS.map(ql => (
              <Link key={ql.href} to={ql.href}>
                <div className="bg-card border border-border rounded-xl p-3 text-center hover:border-primary/50 transition-colors">
                  <div className={`w-8 h-8 rounded-lg ${ql.bg} flex items-center justify-center mx-auto mb-1.5`}>
                    <ql.icon className={`w-4 h-4 ${ql.color}`} />
                  </div>
                  <p className="text-xs text-muted-foreground">{ql.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Parent Education */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-foreground">Parent Education Center</h2>
          <Badge className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 text-xs">
            <Brain className="w-3 h-3 mr-1" /> Research-Backed
          </Badge>
        </div>
        <div className="space-y-3">
          {PARENT_EDUCATION.map((edu, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-4 cursor-pointer hover:bg-secondary/30 transition-colors flex items-start gap-3"
                onClick={() => setExpandedEdu(expandedEdu === i ? null : i)}>
                <div className={`w-10 h-10 rounded-xl ${edu.bg} flex items-center justify-center shrink-0`}>
                  <edu.icon className={`w-5 h-5 ${edu.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-display text-sm text-foreground">{edu.title}</h3>
                    <Badge variant="outline" className="text-xs">{edu.category}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{edu.summary}</p>
                </div>
                <ChevronRight className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${expandedEdu === i ? "rotate-90" : ""}`} />
              </div>

              {expandedEdu === i && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="border-t border-border px-4 pb-4 pt-3 space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">{edu.summary}</p>
                  <div className="space-y-1.5">
                    {edu.keyPoints.map((pt, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-foreground">{pt}</p>
                      </div>
                    ))}
                  </div>
                  <Link to={edu.link}>
                    <Button size="sm" variant="outline" className="text-xs gap-1.5 mt-1">
                      <ArrowRight className="w-3 h-3" /> {edu.linkLabel}
                    </Button>
                  </Link>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParentHub;
