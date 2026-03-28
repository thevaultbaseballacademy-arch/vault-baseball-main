import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, ChevronDown, ChevronUp, MessageSquare, Save,
  Pin, Loader2, Eye, AlertTriangle, Star, Target,
  Shield, Zap, Activity, CircleDot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Analysis {
  id: string;
  user_id: string;
  video_url: string;
  video_type: string;
  status: string;
  ai_analysis: any;
  coach_notes: string | null;
  coach_user_id: string | null;
  created_at: string;
}

interface CoachAnalysisReviewProps {
  coachUserId: string;
  athleteUserId: string;
  athleteName?: string;
}

const statusColors: Record<string, string> = {
  optimal: "bg-vault-longevity/10 text-vault-longevity",
  acceptable: "bg-vault-athleticism/10 text-vault-athleticism",
  needs_work: "bg-vault-utility/10 text-vault-utility",
  injury_risk: "bg-destructive/10 text-destructive",
};

const gradeColors: Record<string, string> = {
  "A+": "text-vault-longevity", A: "text-vault-longevity", "A-": "text-vault-longevity",
  "B+": "text-vault-athleticism", B: "text-vault-athleticism", "B-": "text-vault-athleticism",
  "C+": "text-vault-utility", C: "text-vault-utility", "C-": "text-vault-utility",
  D: "text-vault-velocity", F: "text-destructive",
};

const CoachAnalysisReview = ({ coachUserId, athleteUserId, athleteName }: CoachAnalysisReviewProps) => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);
  const [keyPoints, setKeyPoints] = useState<Record<string, string[]>>({});
  const { toast } = useToast();

  const fetchAnalyses = useCallback(async () => {
    const { data } = await supabase
      .from("video_analyses")
      .select("*")
      .eq("user_id", athleteUserId)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setAnalyses(data as Analysis[]);
    setLoading(false);
  }, [athleteUserId]);

  useEffect(() => { fetchAnalyses(); }, [fetchAnalyses]);

  const saveCoachNotes = async (analysisId: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("video_analyses")
        .update({ coach_notes: noteText, coach_user_id: coachUserId })
        .eq("id", analysisId);
      if (error) throw error;
      toast({ title: "Notes saved", description: "Your coaching notes have been saved to this analysis." });
      setEditingNotes(null);
      await fetchAnalyses();
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleKeyPoint = (analysisId: string, point: string) => {
    setKeyPoints((prev) => {
      const current = prev[analysisId] || [];
      if (current.includes(point)) {
        return { ...prev, [analysisId]: current.filter((p) => p !== point) };
      }
      return { ...prev, [analysisId]: [...current, point] };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="bg-card border border-border p-8 text-center">
        <Brain className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-foreground font-display mb-1">NO ANALYSES AVAILABLE</p>
        <p className="text-muted-foreground text-xs">
          {athleteName || "This athlete"} hasn't uploaded any videos for analysis yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          <span className="text-xs font-display tracking-widest text-foreground">
            MOTION ANALYSES — {athleteName?.toUpperCase() || "ATHLETE"}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground">{analyses.length} analyses</span>
      </div>

      {analyses.map((a) => {
        const data = a.ai_analysis;
        if (!data) return null;
        const isExpanded = expandedId === a.id;
        const isEditing = editingNotes === a.id;
        const markedPoints = keyPoints[a.id] || [];

        return (
          <div key={a.id} className="bg-card border border-border overflow-hidden">
            <button
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary/30 transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : a.id)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 flex items-center justify-center border border-border ${gradeColors[data.overall_grade] || "text-foreground"}`}>
                  <span className="text-lg font-display">{data.overall_grade || "–"}</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground capitalize">{a.video_type} Analysis</p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    {data.kinetic_chain_score && ` · Chain: ${data.kinetic_chain_score}%`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {a.coach_notes && <span className="text-[10px] bg-vault-longevity/10 text-vault-longevity px-2 py-0.5">REVIEWED</span>}
                {markedPoints.length > 0 && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5">{markedPoints.length} KEY POINTS</span>}
                {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-border">
                    {/* Video + AI summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-b border-border">
                      <div className="bg-foreground aspect-video relative">
                        <video src={a.video_url} controls playsInline className="w-full h-full object-contain" />
                      </div>
                      <div className="p-4 space-y-3">
                        <p className="text-sm text-foreground">{data.summary}</p>

                        {/* Pre-session focus — clickable for key points */}
                        {data.pre_session_focus_areas?.length > 0 && (
                          <div className="bg-primary/5 border border-primary/10 p-3">
                            <span className="text-[9px] font-display tracking-widest text-primary mb-1 block">FOCUS AREAS — click to mark as key point</span>
                            {data.pre_session_focus_areas.map((f: string, i: number) => (
                              <button
                                key={i}
                                onClick={() => toggleKeyPoint(a.id, f)}
                                className={`w-full text-left text-[11px] py-1 px-2 flex items-center gap-1.5 transition-colors ${
                                  markedPoints.includes(f) ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary/50"
                                }`}
                              >
                                <Pin className={`w-3 h-3 shrink-0 ${markedPoints.includes(f) ? "text-primary" : "text-muted-foreground"}`} />
                                {f}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Injury flags for coach attention */}
                        {data.injury_risk_flags?.length > 0 && (
                          <div className="bg-destructive/5 border border-destructive/10 p-2">
                            <div className="flex items-center gap-1 mb-1">
                              <Shield className="w-3 h-3 text-destructive" />
                              <span className="text-[9px] font-display tracking-widest text-destructive">INJURY FLAGS</span>
                            </div>
                            {data.injury_risk_flags.map((f: string, i: number) => (
                              <p key={i} className="text-[11px] text-foreground flex gap-1.5">
                                <AlertTriangle className="w-3 h-3 text-destructive shrink-0 mt-0.5" /> {f}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Biomechanics checkpoints for coach */}
                    {data.biomechanics_data?.length > 0 && (
                      <div className="p-4 border-b border-border">
                        <h4 className="text-[10px] font-display tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5" /> BIOMECHANICAL CHECKPOINTS
                        </h4>
                        <div className="space-y-1.5">
                          {data.biomechanics_data.map((item: any, i: number) => (
                            <button
                              key={i}
                              onClick={() => toggleKeyPoint(a.id, `${item.checkpoint}: ${item.correction}`)}
                              className={`w-full text-left p-2 border flex items-center justify-between transition-colors ${
                                markedPoints.includes(`${item.checkpoint}: ${item.correction}`)
                                  ? "border-primary/30 bg-primary/5"
                                  : "border-border hover:bg-secondary/30"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className={`text-[9px] px-1 py-0.5 shrink-0 ${statusColors[item.status] || ""}`}>
                                  {item.status?.replace("_", " ").toUpperCase()}
                                </span>
                                <span className="text-xs text-foreground truncate">{item.checkpoint}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[11px] text-muted-foreground">{item.measurement}</span>
                                <span className={`text-xs font-display ${item.rating >= 8 ? "text-vault-longevity" : item.rating >= 6 ? "text-vault-utility" : "text-vault-velocity"}`}>
                                  {item.rating}/10
                                </span>
                                <Pin className={`w-3 h-3 ${markedPoints.includes(`${item.checkpoint}: ${item.correction}`) ? "text-primary" : "text-muted-foreground/30"}`} />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Coach notes section */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-primary" />
                          <span className="text-[10px] font-display tracking-widest text-muted-foreground">COACH NOTES</span>
                        </div>
                        {!isEditing && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[10px]"
                            onClick={() => { setEditingNotes(a.id); setNoteText(a.coach_notes || ""); }}
                          >
                            {a.coach_notes ? "Edit Notes" : "Add Notes"}
                          </Button>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="space-y-2">
                          {/* Auto-populate marked key points */}
                          {markedPoints.length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-[10px] h-7"
                              onClick={() => {
                                const pointsList = markedPoints.map((p, i) => `${i + 1}. ${p}`).join("\n");
                                setNoteText((prev) => prev ? `${prev}\n\nKey Points:\n${pointsList}` : `Key Points:\n${pointsList}`);
                              }}
                            >
                              <Pin className="w-3 h-3 mr-1" /> Insert {markedPoints.length} Key Points
                            </Button>
                          )}
                          <Textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Add coaching observations, session plan notes, or corrections to discuss during the live session..."
                            className="min-h-[120px] text-xs"
                          />
                          <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="sm" onClick={() => setEditingNotes(null)}>Cancel</Button>
                            <Button variant="vault" size="sm" disabled={saving} onClick={() => saveCoachNotes(a.id)}>
                              {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />}
                              Save Notes
                            </Button>
                          </div>
                        </div>
                      ) : a.coach_notes ? (
                        <div className="bg-primary/5 border border-primary/20 p-3">
                          <p className="text-xs text-foreground whitespace-pre-wrap">{a.coach_notes}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No notes yet. Add notes before the athlete's next session.</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default CoachAnalysisReview;
