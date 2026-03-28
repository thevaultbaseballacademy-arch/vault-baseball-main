import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Brain, TrendingUp, TrendingDown, AlertTriangle, Shield,
  Users, ChevronDown, ChevronUp, CheckCircle2, Target,
  BookOpen, Dumbbell, Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSport } from "@/contexts/SportContext";

interface Props {
  coachUserId: string;
}

interface AthleteOverview {
  athleteId: string;
  name: string;
  skills: any[];
  recentOutcome: any | null;
  recommendations: any[];
  injuryAlerts: any[];
}

const CoachRecommendationsPanel = ({ coachUserId }: Props) => {
  const { sport } = useSport();
  const [athletes, setAthletes] = useState<AthleteOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [coachUserId, sport]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: assignments } = await supabase
        .from("coach_athlete_assignments")
        .select("athlete_user_id")
        .eq("coach_user_id", coachUserId)
        .eq("is_active", true);

      if (!assignments?.length) { setLoading(false); return; }

      const athleteIds = assignments.map(a => a.athlete_user_id);
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name").in("user_id", athleteIds);
      const nameMap = new Map((profiles || []).map(p => [p.user_id, p.display_name || "Athlete"]));

      const results: AthleteOverview[] = [];

      await Promise.all(athleteIds.map(async (aid) => {
        const [skillsRes, recsRes, outcomeRes] = await Promise.all([
          supabase.from("skill_progression").select("*").eq("athlete_user_id", aid).eq("sport_type", sport),
          supabase.from("development_recommendations").select("*").eq("athlete_user_id", aid).eq("sport_type", sport).in("status", ["pending"]).order("created_at", { ascending: false }).limit(5),
          supabase.from("lesson_outcomes").select("*").eq("athlete_user_id", aid).eq("sport_type", sport).order("created_at", { ascending: false }).limit(1),
        ]);

        const recs = (recsRes.data as any[]) || [];
        results.push({
          athleteId: aid,
          name: nameMap.get(aid) || "Athlete",
          skills: (skillsRes.data as any[]) || [],
          recentOutcome: (outcomeRes.data as any[])?.[0] || null,
          recommendations: recs.filter(r => r.recommendation_type !== "injury_alert"),
          injuryAlerts: recs.filter(r => r.recommendation_type === "injury_alert"),
        });
      }));

      // Sort: injury alerts first, then by pending recommendations count
      results.sort((a, b) => {
        if (a.injuryAlerts.length !== b.injuryAlerts.length) return b.injuryAlerts.length - a.injuryAlerts.length;
        return b.recommendations.length - a.recommendations.length;
      });

      setAthletes(results);
    } catch (err) {
      console.error("Coach recommendations error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (recId: string) => {
    await supabase.from("development_recommendations").update({
      status: "approved",
      approved_by: coachUserId,
      resolved_at: new Date().toISOString(),
    } as any).eq("id", recId);
    loadData();
  };

  const handleDismiss = async (recId: string) => {
    await supabase.from("development_recommendations").update({
      status: "dismissed",
      resolved_at: new Date().toISOString(),
    } as any).eq("id", recId);
    loadData();
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-display text-foreground">Intelligence Recommendations</h2>
        </div>
        {[1, 2].map(i => <div key={i} className="h-20 bg-card border border-border rounded-2xl animate-pulse" />)}
      </div>
    );
  }

  const totalAlerts = athletes.reduce((s, a) => s + a.injuryAlerts.length, 0);
  const totalPending = athletes.reduce((s, a) => s + a.recommendations.length, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-accent" />
        <h2 className="text-lg font-display text-foreground">Intelligence Recommendations</h2>
        {totalAlerts > 0 && (
          <Badge variant="destructive" className="text-[10px] ml-auto">{totalAlerts} alert{totalAlerts > 1 ? "s" : ""}</Badge>
        )}
        {totalPending > 0 && totalAlerts === 0 && (
          <Badge variant="outline" className="text-[10px] ml-auto">{totalPending} pending</Badge>
        )}
      </div>

      {athletes.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-6 text-center">
          <Users className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No assigned athletes.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {athletes.filter(a => a.injuryAlerts.length > 0 || a.recommendations.length > 0 || a.skills.length > 0).map(athlete => {
            const isExpanded = expanded === athlete.athleteId;
            return (
              <div key={athlete.athleteId} className="bg-card border border-border rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpanded(isExpanded ? null : athlete.athleteId)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-sm font-display text-accent">
                    {athlete.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{athlete.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {athlete.skills.length} skills tracked · {athlete.recommendations.length} pending
                    </p>
                  </div>
                  {athlete.injuryAlerts.length > 0 && (
                    <Shield className="w-4 h-4 text-red-500" />
                  )}
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>

                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="px-4 pb-4 space-y-3 border-t border-border pt-3"
                  >
                    {/* Injury alerts */}
                    {athlete.injuryAlerts.map(alert => (
                      <div key={alert.id} className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 text-xs">
                        <Shield className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{alert.title}</p>
                          <p className="text-muted-foreground">{alert.reason}</p>
                        </div>
                        <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => handleDismiss(alert.id)}>
                          Acknowledge
                        </Button>
                      </div>
                    ))}

                    {/* Skill progression summary */}
                    {athlete.skills.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1.5">Skills</p>
                        <div className="grid grid-cols-2 gap-2">
                          {athlete.skills.slice(0, 6).map(s => (
                            <div key={s.skill_name} className="flex items-center gap-2 text-xs">
                              {s.trend === "improving" ? <TrendingUp className="w-3 h-3 text-green-500" /> :
                               s.trend === "declining" ? <TrendingDown className="w-3 h-3 text-red-500" /> :
                               <Clock className="w-3 h-3 text-muted-foreground" />}
                              <span className="text-foreground capitalize truncate">{s.skill_name.replace(/_/g, " ")}</span>
                              <span className="text-muted-foreground ml-auto">{s.current_score}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pending recommendations */}
                    {athlete.recommendations.map(rec => (
                      <div key={rec.id} className="flex items-start gap-2 p-3 rounded-xl bg-accent/5 border border-accent/10">
                        {rec.recommendation_type === "course" ? <BookOpen className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" /> :
                         <Dumbbell className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground">{rec.title}</p>
                          <p className="text-[10px] text-muted-foreground">{rec.reason}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-green-600" onClick={() => handleApprove(rec.id)}>
                            <CheckCircle2 className="w-3 h-3 mr-0.5" /> Approve
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-muted-foreground" onClick={() => handleDismiss(rec.id)}>
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    ))}

                    {athlete.recommendations.length === 0 && athlete.injuryAlerts.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-2">No pending recommendations</p>
                    )}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CoachRecommendationsPanel;
