import { useState, useEffect } from "react";
import { Trophy, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface AthleteScore {
  user_id: string;
  display_name: string;
  overall_score: number;
  training_consistency: number;
  skill_development: number;
  work_ethic: number;
  homework_completed: number;
  homework_total: number;
  lessons_attended: number;
  weekly_focus: string | null;
}

const scoreColor = (score: number) => {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-yellow-500";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
};

const scoreBadge = (score: number) => {
  if (score >= 80) return "default" as const;
  if (score >= 60) return "secondary" as const;
  return "destructive" as const;
};

export const AthleteScoreOverview = ({ coachUserId }: { coachUserId: string }) => {
  const [athletes, setAthletes] = useState<AthleteScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!coachUserId) return;
    fetchScores();
  }, [coachUserId]);

  const fetchScores = async () => {
    try {
      // Get assigned athletes
      const { data: assignments } = await supabase
        .from("coach_athlete_assignments")
        .select("athlete_user_id")
        .eq("coach_user_id", coachUserId)
        .eq("is_active", true);

      if (!assignments || assignments.length === 0) {
        setLoading(false);
        return;
      }

      const athleteIds = assignments.map(a => a.athlete_user_id);

      // Get scores
      const { data: scores } = await supabase
        .from("athlete_development_scores")
        .select("*")
        .in("user_id", athleteIds);

      // Get names
      const { data: profiles } = await supabase
        .rpc("get_public_profiles_by_ids", { user_ids: athleteIds });

      const nameMap: Record<string, string> = {};
      (profiles || []).forEach((p: any) => {
        nameMap[p.user_id] = p.display_name || "Athlete";
      });

      const scoreMap: Record<string, any> = {};
      (scores || []).forEach(s => { scoreMap[s.user_id] = s; });

      const result: AthleteScore[] = athleteIds.map(id => {
        const s = scoreMap[id];
        return {
          user_id: id,
          display_name: nameMap[id] || "Athlete",
          overall_score: s?.overall_score ?? 0,
          training_consistency: s?.training_consistency ?? 0,
          skill_development: s?.skill_development ?? 0,
          work_ethic: s?.work_ethic ?? 0,
          homework_completed: s?.homework_completed ?? 0,
          homework_total: s?.homework_total ?? 0,
          lessons_attended: s?.lessons_attended ?? 0,
          weekly_focus: s?.weekly_focus,
        };
      });

      result.sort((a, b) => b.overall_score - a.overall_score);
      setAthletes(result);
    } catch (err) {
      console.error("Error fetching athlete scores:", err);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (athletes.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Trophy className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No athlete scores yet. Scores generate when athletes use the platform.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          ATHLETE DEVELOPMENT SCORES
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {athletes.map(a => {
          const isExpanded = expanded === a.user_id;
          return (
            <div key={a.user_id} className="border border-border rounded-lg overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
                onClick={() => setExpanded(isExpanded ? null : a.user_id)}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xl font-display ${scoreColor(a.overall_score)}`}>
                    {a.overall_score}
                  </span>
                  <span className="text-sm font-medium text-foreground">{a.display_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={scoreBadge(a.overall_score)}>
                    {a.homework_completed}/{a.homework_total} HW
                  </Badge>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 space-y-2">
                  <div className="space-y-1.5">
                    {[
                      { label: "Training", value: a.training_consistency },
                      { label: "Skill Dev", value: a.skill_development },
                      { label: "Work Ethic", value: a.work_ethic },
                    ].map(cat => (
                      <div key={cat.label} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-16">{cat.label}</span>
                        <Progress value={cat.value} className="h-1.5 flex-1" />
                        <span className={`text-xs font-display w-6 text-right ${scoreColor(cat.value)}`}>{cat.value}</span>
                      </div>
                    ))}
                  </div>
                  {a.weekly_focus && (
                    <p className="text-xs text-muted-foreground bg-muted/30 rounded p-2">
                      Focus: {a.weekly_focus}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {a.lessons_attended} lessons attended · {a.homework_completed}/{a.homework_total} homework done
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
