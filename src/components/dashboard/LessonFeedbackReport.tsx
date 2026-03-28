import { useState, useEffect } from "react";
import { FileText, Sparkles, Dumbbell, Target, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import { formatDistanceToNow } from "date-fns";

interface FeedbackReport {
  id: string;
  lesson_focus: string | null;
  strengths_observed: string | null;
  areas_for_improvement: string | null;
  recommended_drills: string[];
  next_development_focus: string | null;
  ai_summary: string | null;
  ai_recommended_drills: string[] | null;
  ai_homework: string[] | null;
  submitted_at: string;
}

export const LessonFeedbackReport = ({ userId }: { userId: string }) => {
  const [reports, setReports] = useState<FeedbackReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetch = async () => {
      const { data, error } = await supabase
        .from("coach_lesson_feedback")
        .select("id, lesson_focus, strengths_observed, areas_for_improvement, recommended_drills, next_development_focus, ai_summary, ai_recommended_drills, ai_homework, submitted_at")
        .eq("athlete_user_id", userId)
        .order("submitted_at", { ascending: false })
        .limit(5);

      if (!error) setReports((data as any[]) || []);
      setLoading(false);
    };

    fetch();
  }, [userId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (reports.length === 0) return null;

  const latest = reports[0];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            LATEST LESSON REPORT
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(latest.submitted_at), { addSuffix: true })}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {latest.lesson_focus && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Focus</p>
            <p className="text-sm text-foreground">{latest.lesson_focus}</p>
          </div>
        )}

        {latest.strengths_observed && (
          <div>
            <p className="text-xs font-medium text-green-600 uppercase tracking-wider mb-1">✦ Strengths</p>
            <p className="text-sm text-foreground">{latest.strengths_observed}</p>
          </div>
        )}

        {latest.areas_for_improvement && (
          <div>
            <p className="text-xs font-medium text-amber-600 uppercase tracking-wider mb-1">◈ Areas to Improve</p>
            <p className="text-sm text-foreground">{latest.areas_for_improvement}</p>
          </div>
        )}

        {latest.recommended_drills && (latest.recommended_drills as string[]).length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
              <Dumbbell className="w-3 h-3" /> Assigned Drills
            </p>
            <ul className="space-y-1">
              {(latest.recommended_drills as string[]).map((d, i) => (
                <li key={i} className="text-sm text-foreground flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">{i + 1}</span>
                  {d}
                </li>
              ))}
            </ul>
          </div>
        )}

        {latest.next_development_focus && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
              <Target className="w-3 h-3" /> Next Focus
            </p>
            <p className="text-sm text-foreground">{latest.next_development_focus}</p>
          </div>
        )}

        {latest.ai_summary && (
          <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
            <p className="text-xs font-medium text-primary uppercase tracking-wider mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI Development Analysis
            </p>
            <div className="text-sm text-foreground prose prose-sm max-w-none">
              <ReactMarkdown>{latest.ai_summary}</ReactMarkdown>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
