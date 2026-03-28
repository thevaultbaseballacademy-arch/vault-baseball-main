import { useState, useEffect } from "react";
import { Trophy, Dumbbell, Brain, ClipboardCheck, TrendingUp, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ScoreData {
  overall_score: number;
  training_consistency: number;
  skill_development: number;
  work_ethic: number;
  athletic_metrics: number;
  weekly_focus: string;
  lessons_attended: number;
  lessons_missed: number;
  homework_completed: number;
  homework_total: number;
  feedback_count: number;
}

const scoreColor = (score: number) => {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-yellow-500";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
};

const scoreBg = (score: number) => {
  if (score >= 80) return "from-green-500/20 to-green-600/5";
  if (score >= 60) return "from-yellow-500/20 to-yellow-600/5";
  if (score >= 40) return "from-orange-500/20 to-orange-600/5";
  return "from-red-500/20 to-red-600/5";
};

const scoreLabel = (score: number) => {
  if (score >= 80) return "Elite";
  if (score >= 60) return "Developing";
  if (score >= 40) return "Building";
  if (score > 0) return "Starting";
  return "No Data";
};

export const AthleteDevScore = ({ userId }: { userId: string }) => {
  const [score, setScore] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    if (!userId) return;
    fetchScore();
  }, [userId]);

  const fetchScore = async () => {
    // Try to get cached score first
    const { data } = await supabase
      .from("athlete_development_scores")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (data) {
      setScore({
        overall_score: data.overall_score,
        training_consistency: data.training_consistency,
        skill_development: data.skill_development,
        work_ethic: data.work_ethic,
        athletic_metrics: data.athletic_metrics,
        weekly_focus: data.weekly_focus || "General Development",
        lessons_attended: data.lessons_attended,
        lessons_missed: data.lessons_missed,
        homework_completed: data.homework_completed,
        homework_total: data.homework_total,
        feedback_count: data.feedback_count,
      });
    } else {
      // Calculate fresh
      await recalculate();
    }
    setLoading(false);
  };

  const recalculate = async () => {
    setRecalculating(true);
    try {
      const { data, error } = await supabase.rpc("calculate_athlete_development_score", {
        p_user_id: userId,
      });
      if (!error && data) {
        setScore(data as unknown as ScoreData);
      }
    } catch (err) {
      console.error("ADS calculation error:", err);
    }
    setRecalculating(false);
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

  const s = score || {
    overall_score: 0, training_consistency: 0, skill_development: 0,
    work_ethic: 0, athletic_metrics: 50, weekly_focus: "Book your first lesson",
    lessons_attended: 0, lessons_missed: 0, homework_completed: 0,
    homework_total: 0, feedback_count: 0,
  };

  const categories = [
    { label: "Training Consistency", value: s.training_consistency, icon: Dumbbell, detail: `${s.lessons_attended} attended` },
    { label: "Skill Development", value: s.skill_development, icon: Brain, detail: `${s.feedback_count} feedback` },
    { label: "Work Ethic", value: s.work_ethic, icon: ClipboardCheck, detail: `${s.homework_completed}/${s.homework_total} done` },
    { label: "Athletic Metrics", value: s.athletic_metrics, icon: TrendingUp, detail: "Baseline" },
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            VAULT ADS
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={recalculate}
            disabled={recalculating}
            className="h-7 px-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Score */}
        <div className={`rounded-xl bg-gradient-to-br ${scoreBg(s.overall_score)} p-4 text-center`}>
          <p className={`text-5xl font-display ${scoreColor(s.overall_score)}`}>
            {s.overall_score}
          </p>
          <Badge variant="secondary" className="mt-1">
            {scoreLabel(s.overall_score)}
          </Badge>
        </div>

        {/* Weekly Focus */}
        <div className="bg-muted/30 rounded-lg p-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Weekly Focus</p>
          <p className="text-sm font-medium text-foreground">{s.weekly_focus}</p>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <cat.icon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-foreground">{cat.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{cat.detail}</span>
                  <span className={`font-display text-sm ${scoreColor(cat.value)}`}>{cat.value}</span>
                </div>
              </div>
              <Progress value={cat.value} className="h-1.5" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
