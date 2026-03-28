import { useState, useEffect } from "react";
import { ClipboardList, CheckCircle2, Circle, AlertTriangle, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface AthleteHomework {
  athlete_user_id: string;
  athlete_name: string;
  items: {
    id: string;
    title: string;
    category: string;
    is_completed: boolean;
    due_date: string | null;
  }[];
}

interface PendingFeedback {
  lesson_id: string;
  athlete_name: string;
  scheduled_at: string;
}

export const CoachDevelopmentReview = ({ coachUserId }: { coachUserId: string }) => {
  const [homeworkByAthlete, setHomeworkByAthlete] = useState<AthleteHomework[]>([]);
  const [pendingFeedback, setPendingFeedback] = useState<PendingFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!coachUserId) return;
    fetchData();
  }, [coachUserId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all homework assigned by this coach
      const { data: homework } = await supabase
        .from("player_homework")
        .select("id, title, category, is_completed, due_date, athlete_user_id, sort_order")
        .eq("coach_user_id", coachUserId)
        .order("sort_order", { ascending: true });

      if (homework && homework.length > 0) {
        // Get unique athlete IDs
        const athleteIds = [...new Set(homework.map(h => h.athlete_user_id))];
        
        // Fetch athlete names
        const { data: profiles } = await supabase
          .rpc("get_public_profiles_by_ids", { user_ids: athleteIds });

        const nameMap: Record<string, string> = {};
        (profiles || []).forEach((p: any) => {
          nameMap[p.user_id] = p.display_name || "Athlete";
        });

        // Group by athlete
        const grouped: Record<string, AthleteHomework> = {};
        homework.forEach(h => {
          if (!grouped[h.athlete_user_id]) {
            grouped[h.athlete_user_id] = {
              athlete_user_id: h.athlete_user_id,
              athlete_name: nameMap[h.athlete_user_id] || "Athlete",
              items: [],
            };
          }
          grouped[h.athlete_user_id].items.push({
            id: h.id,
            title: h.title,
            category: h.category || "drill",
            is_completed: h.is_completed || false,
            due_date: h.due_date,
          });
        });

        setHomeworkByAthlete(Object.values(grouped));
      }

      // Find lessons without feedback
      const { data: completedLessons } = await supabase
        .from("remote_lessons")
        .select("id, athlete_user_id, scheduled_at")
        .eq("coach_user_id", coachUserId)
        .eq("status", "completed")
        .order("scheduled_at", { ascending: false })
        .limit(20);

      if (completedLessons && completedLessons.length > 0) {
        const lessonIds = completedLessons.map(l => l.id);
        const { data: feedback } = await supabase
          .from("coach_lesson_feedback")
          .select("lesson_id")
          .eq("coach_user_id", coachUserId)
          .in("lesson_id", lessonIds);

        const feedbackLessonIds = new Set((feedback || []).map(f => f.lesson_id));
        const pending = completedLessons.filter(l => !feedbackLessonIds.has(l.id));

        if (pending.length > 0) {
          const athleteIds = [...new Set(pending.map(p => p.athlete_user_id))];
          const { data: profiles } = await supabase
            .rpc("get_public_profiles_by_ids", { user_ids: athleteIds });

          const nameMap: Record<string, string> = {};
          (profiles || []).forEach((p: any) => {
            nameMap[p.user_id] = p.display_name || "Athlete";
          });

          setPendingFeedback(pending.map(p => ({
            lesson_id: p.id,
            athlete_name: nameMap[p.athlete_user_id] || "Athlete",
            scheduled_at: p.scheduled_at,
          })));
        }
      }
    } catch (err) {
      console.error("Error fetching development data:", err);
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

  return (
    <div className="space-y-4">
      {/* Pending Feedback Alert */}
      {pendingFeedback.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
              Feedback Needed ({pendingFeedback.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {pendingFeedback.slice(0, 5).map(p => (
              <p key={p.lesson_id} className="text-sm text-foreground">
                {p.athlete_name} — {new Date(p.scheduled_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Athlete Homework Progress */}
      {homeworkByAthlete.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              ATHLETE HOMEWORK PROGRESS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {homeworkByAthlete.map(athlete => {
              const completed = athlete.items.filter(i => i.is_completed).length;
              const total = athlete.items.length;
              const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
              const isExpanded = expanded === athlete.athlete_user_id;

              return (
                <div key={athlete.athlete_user_id} className="border border-border rounded-lg overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
                    onClick={() => setExpanded(isExpanded ? null : athlete.athlete_user_id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-foreground">{athlete.athlete_name}</span>
                      <Badge variant={pct === 100 ? "default" : pct >= 50 ? "secondary" : "destructive"}>
                        {completed}/{total}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={pct} className="h-2 w-20" />
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-1">
                      {athlete.items.map(item => (
                        <div key={item.id} className="flex items-center gap-2 text-sm py-1">
                          {item.is_completed ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          )}
                          <span className={item.is_completed ? "text-muted-foreground line-through" : "text-foreground"}>
                            {item.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {homeworkByAthlete.length === 0 && pendingFeedback.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No homework assigned yet. Submit lesson feedback to create development plans.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
