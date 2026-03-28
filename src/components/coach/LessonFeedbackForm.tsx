import { useState } from "react";
import { Send, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";

interface LessonFeedbackFormProps {
  lessonId: string;
  athleteUserId: string;
  athleteName: string;
  coachUserId: string;
  sportType?: string;
  onSubmitted?: () => void;
}

export const LessonFeedbackForm = ({
  lessonId, athleteUserId, athleteName, coachUserId, sportType = 'baseball', onSubmitted
}: LessonFeedbackFormProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [lessonFocus, setLessonFocus] = useState("");
  const [drills, setDrills] = useState<string[]>([""]);
  const [nextFocus, setNextFocus] = useState("");

  const addDrill = () => setDrills(prev => [...prev, ""]);
  const updateDrill = (i: number, val: string) => {
    setDrills(prev => prev.map((d, idx) => idx === i ? val : d));
  };
  const removeDrill = (i: number) => {
    setDrills(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    if (!strengths.trim() && !improvements.trim() && !lessonFocus.trim()) {
      toast({ title: "Please fill in at least one feedback field", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const filteredDrills = drills.filter(d => d.trim());
      
      // Insert feedback
      const { data: feedback, error } = await supabase
        .from("coach_lesson_feedback")
        .insert({
          lesson_id: lessonId,
          coach_user_id: coachUserId,
          athlete_user_id: athleteUserId,
          strengths_observed: strengths,
          areas_for_improvement: improvements,
          lesson_focus: lessonFocus,
          recommended_drills: filteredDrills,
          next_development_focus: nextFocus,
          sport_type: sportType,
        } as any)
        .select()
        .single();

      if (error) throw error;

      // Create homework items from drills
      if (filteredDrills.length > 0 && feedback) {
        const homeworkItems = filteredDrills.map((drill, i) => ({
          lesson_id: lessonId,
          feedback_id: feedback.id,
          athlete_user_id: athleteUserId,
          coach_user_id: coachUserId,
          title: drill,
          category: "drill",
          sort_order: i,
          due_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
        }));

        await supabase.from("player_homework").insert(homeworkItems);
      }

      // Add next focus as homework too
      if (nextFocus.trim() && feedback) {
        await supabase.from("player_homework").insert({
          lesson_id: lessonId,
          feedback_id: feedback.id,
          athlete_user_id: athleteUserId,
          coach_user_id: coachUserId,
          title: nextFocus,
          category: "focus",
          sort_order: filteredDrills.length,
          due_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
        });
      }

      // Send notification to athlete
      await supabase.from("notifications").insert({
        user_id: athleteUserId,
        type: "coach_feedback",
        title: "Lesson feedback received",
        message: `Your coach submitted feedback for your recent lesson. Check your development report.`,
        actor_id: coachUserId,
      });

      // Trigger AI analysis in background
      if (feedback) {
        generateAIAnalysis(feedback.id);
      }

      setSubmitted(true);
      toast({ title: "Feedback submitted!", description: `${athleteName} will be notified.` });
      onSubmitted?.();
    } catch (err) {
      console.error("Feedback submit error:", err);
      toast({ title: "Failed to submit feedback", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const generateAIAnalysis = async (feedbackId: string) => {
    setGeneratingAI(true);
    try {
      // Run AI analysis and intelligence hook in parallel
      await Promise.all([
        supabase.functions.invoke("generate-lesson-analysis", { body: { feedbackId } }),
        supabase.functions.invoke("post-lesson-intelligence", { body: { feedbackId } }),
      ]);
    } catch (err) {
      console.error("AI analysis/intelligence generation failed:", err);
    } finally {
      setGeneratingAI(false);
    }
  };

  if (submitted) {
    return (
      <Button variant="ghost" size="sm" disabled className="text-green-600">
        <CheckCircle2 className="w-4 h-4 mr-1" /> Feedback Sent
      </Button>
    );
  }

  return (
    <>
      <Button variant="vault" size="sm" onClick={() => setOpen(true)}>
        <Send className="w-4 h-4 mr-1" /> Submit Feedback
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              LESSON FEEDBACK — {athleteName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Lesson Focus</Label>
              <Input
                placeholder="e.g., Pitching mechanics, swing adjustments..."
                value={lessonFocus}
                onChange={e => setLessonFocus(e.target.value)}
              />
            </div>

            <div>
              <Label>Strengths Observed</Label>
              <Textarea
                placeholder="What did the player do well?"
                value={strengths}
                onChange={e => setStrengths(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label>Areas for Improvement</Label>
              <Textarea
                placeholder="What needs work?"
                value={improvements}
                onChange={e => setImprovements(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label>Recommended Drills</Label>
              <div className="space-y-2">
                {drills.map((drill, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder={`Drill ${i + 1}`}
                      value={drill}
                      onChange={e => updateDrill(i, e.target.value)}
                    />
                    {drills.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeDrill(i)}>✕</Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addDrill}>+ Add Drill</Button>
              </div>
            </div>

            <div>
              <Label>Next Development Focus</Label>
              <Input
                placeholder="What should the player work on before next lesson?"
                value={nextFocus}
                onChange={e => setNextFocus(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="vault" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Send className="w-4 h-4 mr-1" />}
              Submit Feedback
            </Button>
          </DialogFooter>

          {generatingAI && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <Sparkles className="w-4 h-4 animate-pulse text-primary" />
              Generating AI development analysis...
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
