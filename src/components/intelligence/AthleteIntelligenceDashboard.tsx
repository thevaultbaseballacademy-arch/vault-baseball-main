import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Minus, AlertTriangle,
  Target, Dumbbell, BookOpen, ChevronRight, Shield,
  CheckCircle2, XCircle, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useSport } from "@/contexts/SportContext";
import { Link } from "react-router-dom";

interface SkillProgression {
  skill_name: string;
  skill_category: string;
  current_score: number;
  previous_score: number;
  sessions_count: number;
  trend: string;
}

interface Recommendation {
  id: string;
  recommendation_type: string;
  title: string;
  reason: string;
  status: string;
  priority: string;
  created_at: string;
}

interface LessonOutcome {
  id: string;
  skill_category: string;
  strengths_noted: string[];
  weaknesses_noted: string[];
  drills_assigned: string[];
  injury_flags: string[];
  session_number: number;
  created_at: string;
}

interface Props {
  userId: string;
}

const trendIcon = {
  improving: { Icon: TrendingUp, cls: "text-green-500" },
  stable: { Icon: Minus, cls: "text-muted-foreground" },
  declining: { Icon: TrendingDown, cls: "text-red-500" },
};

const AthleteIntelligenceDashboard = ({ userId }: Props) => {
  const { sport } = useSport();
  const [skills, setSkills] = useState<SkillProgression[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [recentOutcome, setRecentOutcome] = useState<LessonOutcome | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [userId, sport]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [skillsRes, recsRes, outcomeRes] = await Promise.all([
        supabase.from("skill_progression").select("*").eq("athlete_user_id", userId).eq("sport_type", sport).order("current_score", { ascending: false }),
        supabase.from("development_recommendations").select("*").eq("athlete_user_id", userId).eq("sport_type", sport).in("status", ["pending", "approved"]).order("created_at", { ascending: false }).limit(10),
        supabase.from("lesson_outcomes").select("*").eq("athlete_user_id", userId).eq("sport_type", sport).order("created_at", { ascending: false }).limit(1),
      ]);
      setSkills((skillsRes.data as any[]) || []);
      setRecommendations((recsRes.data as any[]) || []);
      setRecentOutcome((outcomeRes.data as any[])?.[0] || null);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-card border border-border rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  const injuryAlerts = recommendations.filter(r => r.recommendation_type === "injury_alert");
  const courseRecs = recommendations.filter(r => r.recommendation_type === "course" || r.recommendation_type === "program");
  const drillRecs = recommendations.filter(r => r.recommendation_type === "drill");

  return (
    <div className="space-y-5">
      {/* Injury Alerts */}
      {injuryAlerts.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          {injuryAlerts.map(alert => (
            <div key={alert.id} className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
              <Shield className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">{alert.title}</p>
                <p className="text-xs text-muted-foreground">{alert.reason}</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Skill Progression */}
      {skills.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Skill Progression</p>
          <div className="space-y-3">
            {skills.map(skill => {
              const t = trendIcon[skill.trend as keyof typeof trendIcon] || trendIcon.stable;
              const delta = skill.current_score - skill.previous_score;
              return (
                <div key={skill.skill_name} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground capitalize">{skill.skill_name.replace(/_/g, " ")}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-display text-foreground">{skill.current_score}</span>
                        {delta !== 0 && (
                          <span className={`text-xs ${delta > 0 ? "text-green-500" : "text-red-500"}`}>
                            {delta > 0 ? "+" : ""}{delta}
                          </span>
                        )}
                        <t.Icon className={`w-3.5 h-3.5 ${t.cls}`} />
                      </div>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.current_score}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-accent rounded-full"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {skill.sessions_count} session{skill.sessions_count !== 1 ? "s" : ""} · {skill.skill_category}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Lesson Outcome */}
      {recentOutcome && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Latest Session</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Strengths</p>
              {recentOutcome.strengths_noted.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs py-0.5">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  <span className="text-foreground">{s}</span>
                </div>
              ))}
              {recentOutcome.strengths_noted.length === 0 && <p className="text-xs text-muted-foreground">—</p>}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Work On</p>
              {recentOutcome.weaknesses_noted.map((w, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs py-0.5">
                  <Target className="w-3 h-3 text-amber-500" />
                  <span className="text-foreground">{w}</span>
                </div>
              ))}
              {recentOutcome.weaknesses_noted.length === 0 && <p className="text-xs text-muted-foreground">—</p>}
            </div>
          </div>
          {recentOutcome.drills_assigned.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-1.5">Assigned Drills</p>
              <div className="flex flex-wrap gap-1.5">
                {recentOutcome.drills_assigned.map((d, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px]">
                    <Dumbbell className="w-2.5 h-2.5 mr-1" />{d}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recommended Courses & Programs */}
      {courseRecs.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Recommended for You</p>
          <div className="space-y-2">
            {courseRecs.map(rec => (
              <div key={rec.id} className="flex items-start gap-3 p-3 rounded-xl bg-accent/5 border border-accent/10">
                <BookOpen className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{rec.title}</p>
                  <p className="text-xs text-muted-foreground">{rec.reason}</p>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0">
                  {rec.status === "approved" ? "Approved" : "Pending"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {skills.length === 0 && !recentOutcome && recommendations.length === 0 && (
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <Target className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No lesson data yet. Complete a session to see your development insights.</p>
        </div>
      )}
    </div>
  );
};

export default AthleteIntelligenceDashboard;
