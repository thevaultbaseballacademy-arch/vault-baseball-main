import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft, Loader2, FileText, ClipboardList, Target,
  CheckCircle2, Calendar, User, Share2, Download
} from "lucide-react";
import { format } from "date-fns";

interface LessonWithDetails {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  notes: string | null;
  coach_notes: string | null;
  ai_recap: string | null;
  ai_homework: string | null;
  sport_type: string;
  coach_user_id: string;
  athlete_user_id: string;
}

interface FeedbackRecord {
  id: string;
  lesson_focus: string | null;
  strengths_observed: string | null;
  areas_for_improvement: string | null;
  recommended_drills: any;
  next_development_focus: string | null;
  ai_summary: string | null;
  sport_type: string;
}

interface HomeworkItem {
  id: string;
  title: string;
  category: string;
  is_completed: boolean;
  due_date: string | null;
}

const SoftballLessonNotes = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lessonId = searchParams.get("lesson");

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<LessonWithDetails[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<LessonWithDetails | null>(null);
  const [feedback, setFeedback] = useState<FeedbackRecord | null>(null);
  const [homework, setHomework] = useState<HomeworkItem[]>([]);
  const [coachName, setCoachName] = useState("");
  const [athleteName, setAthleteName] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      await loadLessons(session.user.id);
    };
    init();
  }, []);

  const loadLessons = async (userId: string) => {
    setLoading(true);
    // Fetch softball lessons where user is athlete or coach
    const { data } = await supabase
      .from("remote_lessons")
      .select("*")
      .eq("sport_type", "softball")
      .or(`athlete_user_id.eq.${userId},coach_user_id.eq.${userId}`)
      .eq("status", "completed")
      .order("scheduled_at", { ascending: false })
      .limit(20);

    const typedData = (data || []) as unknown as LessonWithDetails[];
    setLessons(typedData);

    // Auto-select if lessonId in URL
    if (lessonId && typedData.length > 0) {
      const found = typedData.find(l => l.id === lessonId);
      if (found) await selectLesson(found, userId);
    }
    setLoading(false);
  };

  const selectLesson = async (lesson: LessonWithDetails, userId?: string) => {
    setSelectedLesson(lesson);

    // Fetch coach name
    const { data: coachProfile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", lesson.coach_user_id)
      .single();
    setCoachName(coachProfile?.display_name || "Coach");

    // Fetch athlete name
    const { data: athleteProfile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", lesson.athlete_user_id)
      .single();
    setAthleteName(athleteProfile?.display_name || "Athlete");

    // Fetch feedback
    const { data: fb } = await supabase
      .from("coach_lesson_feedback")
      .select("*")
      .eq("lesson_id", lesson.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setFeedback(fb as unknown as FeedbackRecord | null);

    // Fetch homework
    const { data: hw } = await supabase
      .from("player_homework")
      .select("id, title, category, is_completed, due_date")
      .eq("lesson_id", lesson.id)
      .order("sort_order", { ascending: true });
    setHomework((hw || []) as HomeworkItem[]);
  };

  const toggleHomework = async (item: HomeworkItem) => {
    const newVal = !item.is_completed;
    await supabase
      .from("player_homework")
      .update({ is_completed: newVal, completed_at: newVal ? new Date().toISOString() : null } as any)
      .eq("id", item.id);
    setHomework(prev => prev.map(h => h.id === item.id ? { ...h, is_completed: newVal } : h));
  };

  const generateParentSummary = () => {
    if (!selectedLesson || !feedback) return "";
    const date = format(new Date(selectedLesson.scheduled_at), "MMMM d, yyyy");
    let summary = `VAULT SOFTBALL — LESSON SUMMARY\n`;
    summary += `Date: ${date}\n`;
    summary += `Athlete: ${athleteName}\n`;
    summary += `Coach: ${coachName}\n`;
    summary += `Duration: ${selectedLesson.duration_minutes} minutes\n\n`;

    if (feedback.lesson_focus) summary += `FOCUS: ${feedback.lesson_focus}\n\n`;
    if (feedback.strengths_observed) summary += `STRENGTHS:\n${feedback.strengths_observed}\n\n`;
    if (feedback.areas_for_improvement) summary += `AREAS TO IMPROVE:\n${feedback.areas_for_improvement}\n\n`;
    if (feedback.next_development_focus) summary += `NEXT FOCUS: ${feedback.next_development_focus}\n\n`;

    if (homework.length > 0) {
      summary += `HOMEWORK:\n`;
      homework.forEach(h => {
        summary += `${h.is_completed ? "✅" : "⬜"} ${h.title}\n`;
      });
    }

    return summary;
  };

  const copyParentSummary = () => {
    const text = generateParentSummary();
    navigator.clipboard.writeText(text);
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Button variant="ghost" size="sm" onClick={() => navigate("/softball")} className="text-muted-foreground mb-4">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Softball
            </Button>
            <p className="text-xs font-display tracking-[0.3em] text-muted-foreground mb-2">VAULT SOFTBALL</p>
            <h1 className="text-3xl md:text-4xl font-display tracking-tight text-foreground">
              LESSON NOTES & SUMMARIES
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Post-lesson recaps, homework tracking, and parent-friendly summaries for all completed softball sessions.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {/* Lesson List */}
              <div className="md:col-span-1 space-y-2">
                <h2 className="text-xs font-display tracking-[0.2em] text-muted-foreground mb-3">COMPLETED SESSIONS</h2>
                {lessons.length === 0 ? (
                  <Card className="border-border">
                    <CardContent className="py-8 text-center">
                      <p className="text-muted-foreground text-sm">No completed softball lessons yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  lessons.map(lesson => (
                    <button
                      key={lesson.id}
                      onClick={() => selectLesson(lesson, user?.id)}
                      className={`w-full border p-3 text-left transition-colors ${
                        selectedLesson?.id === lesson.id
                          ? "border-foreground bg-foreground/5"
                          : "border-border hover:border-foreground/20"
                      }`}
                    >
                      <p className="font-display text-xs text-foreground">
                        {format(new Date(lesson.scheduled_at), "MMM d, yyyy")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {lesson.duration_minutes} min · {lesson.ai_recap ? "Recap available" : "No recap"}
                      </p>
                    </button>
                  ))
                )}
              </div>

              {/* Detail Panel */}
              <div className="md:col-span-2 space-y-4">
                {!selectedLesson ? (
                  <Card className="border-border">
                    <CardContent className="py-16 text-center">
                      <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">Select a lesson to view notes and summaries.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Session header */}
                    <Card className="border-border">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-display text-sm text-foreground">
                              {format(new Date(selectedLesson.scheduled_at), "EEEE, MMMM d, yyyy")}
                            </p>
                            <p className="text-xs text-muted-foreground">{selectedLesson.duration_minutes} min · {coachName}</p>
                          </div>
                          <Badge variant="secondary" className="font-display text-[10px] tracking-wider">SOFTBALL</Badge>
                        </div>
                        {selectedLesson.coach_notes && (
                          <div className="mt-3 p-3 bg-muted/50 border border-border">
                            <p className="text-xs font-display tracking-[0.1em] text-muted-foreground mb-1">COACH NOTES</p>
                            <p className="text-sm text-foreground">{selectedLesson.coach_notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* AI Recap */}
                    {selectedLesson.ai_recap && (
                      <Card className="border-border">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xs font-display tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                            <Target className="w-4 h-4" /> AI LESSON RECAP
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-sm max-w-none text-foreground">
                          <ReactMarkdown>{selectedLesson.ai_recap}</ReactMarkdown>
                        </CardContent>
                      </Card>
                    )}

                    {/* AI Homework */}
                    {selectedLesson.ai_homework && (
                      <Card className="border-border">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xs font-display tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                            <ClipboardList className="w-4 h-4" /> AI HOMEWORK
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-sm max-w-none text-foreground">
                          <ReactMarkdown>{selectedLesson.ai_homework}</ReactMarkdown>
                        </CardContent>
                      </Card>
                    )}

                    {/* Coach Feedback */}
                    {feedback && (
                      <Card className="border-border">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xs font-display tracking-[0.2em] text-muted-foreground">
                            COACH FEEDBACK
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {feedback.lesson_focus && (
                            <div>
                              <p className="text-[10px] font-display tracking-wider text-muted-foreground">FOCUS</p>
                              <p className="text-sm text-foreground">{feedback.lesson_focus}</p>
                            </div>
                          )}
                          {feedback.strengths_observed && (
                            <div>
                              <p className="text-[10px] font-display tracking-wider text-muted-foreground">STRENGTHS</p>
                              <p className="text-sm text-foreground">{feedback.strengths_observed}</p>
                            </div>
                          )}
                          {feedback.areas_for_improvement && (
                            <div>
                              <p className="text-[10px] font-display tracking-wider text-muted-foreground">AREAS TO IMPROVE</p>
                              <p className="text-sm text-foreground">{feedback.areas_for_improvement}</p>
                            </div>
                          )}
                          {feedback.ai_summary && (
                            <div className="mt-3 p-3 bg-muted/50 border border-border">
                              <p className="text-[10px] font-display tracking-wider text-muted-foreground mb-1">AI ANALYSIS</p>
                              <div className="prose prose-sm max-w-none text-foreground">
                                <ReactMarkdown>{feedback.ai_summary}</ReactMarkdown>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Homework Checklist */}
                    {homework.length > 0 && (
                      <Card className="border-border">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xs font-display tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> HOMEWORK CHECKLIST
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {homework.map(item => (
                            <button
                              key={item.id}
                              onClick={() => toggleHomework(item)}
                              className={`w-full flex items-center gap-3 p-3 border transition-colors text-left ${
                                item.is_completed
                                  ? "border-foreground/20 bg-foreground/5"
                                  : "border-border hover:border-foreground/20"
                              }`}
                            >
                              <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${item.is_completed ? "text-foreground" : "text-muted-foreground/30"}`} />
                              <div className="flex-1">
                                <p className={`text-sm ${item.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                  {item.title}
                                </p>
                                <p className="text-[10px] text-muted-foreground font-display tracking-wider">{item.category.toUpperCase()}</p>
                              </div>
                            </button>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {/* Parent Summary */}
                    {feedback && (
                      <Card className="border-border">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xs font-display tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                            <Share2 className="w-4 h-4" /> PARENT SUMMARY
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-muted-foreground mb-3">
                            Copy a plain-text summary to share with parents via text or email.
                          </p>
                          <Button size="sm" variant="outline" onClick={copyParentSummary} className="font-display text-xs tracking-[0.1em]">
                            <Download className="w-3 h-3 mr-1" /> COPY PARENT SUMMARY
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default SoftballLessonNotes;
