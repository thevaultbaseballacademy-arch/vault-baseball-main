import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Loader2, AlertTriangle, Brain, ChevronDown, ChevronUp,
  Shield, Zap, Target, Star, Film, RefreshCw, Activity,
  TrendingUp, CircleDot, Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Analysis {
  id: string;
  video_url: string;
  video_type: string;
  status: string;
  ai_analysis: any;
  coach_notes: string | null;
  created_at: string;
}

interface VideoAnalysisPanelProps {
  userId: string;
}

const gradeColors: Record<string, string> = {
  "A+": "text-vault-longevity", A: "text-vault-longevity", "A-": "text-vault-longevity",
  "B+": "text-vault-athleticism", B: "text-vault-athleticism", "B-": "text-vault-athleticism",
  "C+": "text-vault-utility", C: "text-vault-utility", "C-": "text-vault-utility",
  D: "text-vault-velocity", F: "text-destructive",
};

const statusColors: Record<string, string> = {
  optimal: "bg-vault-longevity/10 text-vault-longevity border-vault-longevity/20",
  acceptable: "bg-vault-athleticism/10 text-vault-athleticism border-vault-athleticism/20",
  needs_work: "bg-vault-utility/10 text-vault-utility border-vault-utility/20",
  injury_risk: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusLabels: Record<string, string> = {
  optimal: "OPTIMAL",
  acceptable: "ACCEPTABLE",
  needs_work: "NEEDS WORK",
  injury_risk: "INJURY RISK",
};

const priorityColors: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive",
  important: "bg-vault-utility/10 text-vault-utility",
  minor: "bg-muted text-muted-foreground",
};

const efficiencyColors: Record<string, string> = {
  elite: "text-vault-longevity",
  advanced: "text-vault-athleticism",
  developing: "text-vault-utility",
  beginner: "text-muted-foreground",
};

const VideoAnalysisPanel = ({ userId }: VideoAnalysisPanelProps) => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [uploading, setUploading] = useState(false);
  const [videoType, setVideoType] = useState("pitching");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>("overview");
  const { toast } = useToast();

  const fetchAnalyses = useCallback(async () => {
    const { data } = await supabase
      .from("video_analyses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30);
    if (data) setAnalyses(data as Analysis[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchAnalyses(); }, [fetchAnalyses]);

  useEffect(() => {
    const processing = analyses.some((a) => a.status === "processing" || a.status === "pending");
    if (!processing) return;
    const interval = setInterval(fetchAnalyses, 5000);
    return () => clearInterval(interval);
  }, [analyses, fetchAnalyses]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 50MB per video.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("analysis-videos").upload(path, file, { contentType: file.type });
      if (uploadErr) throw uploadErr;
      const { data: urlData } = await supabase.storage.from("analysis-videos").createSignedUrl(path, 60 * 60 * 24 * 7);
      if (!urlData?.signedUrl) throw new Error("Failed to get video URL");
      const { data: record, error: insertErr } = await supabase
        .from("video_analyses")
        .insert({ user_id: userId, video_url: urlData.signedUrl, video_type: videoType })
        .select().single();
      if (insertErr) throw insertErr;
      const { error: fnErr } = await supabase.functions.invoke("analyze-video", { body: { analysisId: record.id } });
      if (fnErr) {
        toast({ title: "Analysis started", description: "Processing your video. Results will appear shortly." });
      } else {
        toast({ title: "Analysis complete", description: "Your biomechanics report is ready." });
      }
      await fetchAnalyses();
    } catch (err: any) {
      console.error("Upload error:", err);
      toast({ title: "Upload failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const retryAnalysis = async (analysisId: string) => {
    toast({ title: "Retrying analysis…" });
    await supabase.functions.invoke("analyze-video", { body: { analysisId } });
    await fetchAnalyses();
  };

  // Render biomechanics checkpoint cards
  const renderBiomechanicsData = (data: any[]) => {
    if (!data?.length) return null;
    return (
      <div className="space-y-3">
        <h4 className="text-[10px] font-display tracking-widest text-muted-foreground flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" /> BIOMECHANICAL CHECKPOINTS
        </h4>
        <div className="space-y-2">
          {data.map((item: any, i: number) => (
            <div key={i} className={`border p-3 ${statusColors[item.status] || "border-border"}`}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground">{item.checkpoint}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 font-display tracking-wider border ${statusColors[item.status] || ""}`}>
                    {statusLabels[item.status] || item.status}
                  </span>
                </div>
                <span className="text-sm font-display text-foreground">{item.measurement}</span>
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <Progress value={item.rating * 10} className="h-1.5 flex-1" />
                <span className={`text-xs font-display ${item.rating >= 8 ? "text-vault-longevity" : item.rating >= 6 ? "text-vault-utility" : "text-vault-velocity"}`}>
                  {item.rating}/10
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">{item.detail}</p>
              {item.status !== "optimal" && item.correction && (
                <p className="text-[11px] text-primary mt-1 border-t border-border/50 pt-1">
                  ↳ <span className="font-medium">Fix:</span> {item.correction}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render body angles diagram
  const renderBodyAngles = (angles: any[]) => {
    if (!angles?.length) return null;
    return (
      <div className="space-y-3">
        <h4 className="text-[10px] font-display tracking-widest text-muted-foreground flex items-center gap-1.5">
          <CircleDot className="w-3.5 h-3.5" /> JOINT ANGLES & MEASUREMENTS
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {angles.map((a: any, i: number) => {
            const isGood = a.assessment === "within_range";
            return (
              <div key={i} className={`border p-3 text-center ${isGood ? "border-vault-longevity/20 bg-vault-longevity/5" : "border-vault-velocity/20 bg-vault-velocity/5"}`}>
                <p className="text-[10px] text-muted-foreground capitalize">{a.joint.replace(/_/g, " ")}</p>
                <p className={`text-2xl font-display mt-1 ${isGood ? "text-vault-longevity" : "text-vault-velocity"}`}>
                  {a.angle_degrees}°
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Optimal: {a.optimal_range}</p>
                <span className={`inline-block text-[9px] px-1.5 py-0.5 mt-1 font-display tracking-wider ${isGood ? "bg-vault-longevity/10 text-vault-longevity" : "bg-vault-velocity/10 text-vault-velocity"}`}>
                  {a.assessment === "within_range" ? "IN RANGE" : a.assessment === "below" ? "BELOW" : "ABOVE"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Legacy mechanical breakdown
  const renderMechanicalBreakdown = (breakdown: Record<string, { rating: number; notes: string }>) => {
    if (!breakdown) return null;
    const entries = Object.entries(breakdown).filter(([, v]) => v && typeof v === "object" && "rating" in v);
    if (entries.length === 0) return null;
    return (
      <div className="space-y-3">
        <h4 className="text-[10px] font-display tracking-widest text-muted-foreground">PHASE-BY-PHASE BREAKDOWN</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {entries.map(([key, val]) => (
            <div key={key} className="bg-secondary/50 border border-border p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-foreground capitalize">{key.replace(/_/g, " ")}</span>
                <span className={`text-sm font-display ${val.rating >= 8 ? "text-vault-longevity" : val.rating >= 6 ? "text-vault-utility" : "text-vault-velocity"}`}>
                  {val.rating}/10
                </span>
              </div>
              <Progress value={val.rating * 10} className="h-1.5 mb-1" />
              <p className="text-[11px] text-muted-foreground">{val.notes}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAnalysis = (a: Analysis) => {
    const data = a.ai_analysis;
    if (!data) return null;
    const isExpanded = expandedId === a.id;
    const kineticScore = data.kinetic_chain_score;
    const efficiency = data.efficiency_rating;

    return (
      <div key={a.id} className="bg-card border border-border overflow-hidden">
        {/* Header */}
        <button
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary/30 transition-colors"
          onClick={() => { setExpandedId(isExpanded ? null : a.id); setActiveSection("overview"); }}
        >
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 flex flex-col items-center justify-center border border-border ${gradeColors[data.overall_grade] || "text-foreground"}`}>
              <span className="text-lg font-display leading-none">{data.overall_grade || "–"}</span>
              {kineticScore && <span className="text-[8px] text-muted-foreground">{kineticScore}%</span>}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground capitalize">{a.video_type} Motion Analysis</p>
                {efficiency && (
                  <span className={`text-[9px] font-display tracking-wider px-1.5 py-0.5 bg-secondary ${efficiencyColors[efficiency] || ""}`}>
                    {efficiency.toUpperCase()}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {a.coach_notes && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5">COACH REVIEWED</span>}
            {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </button>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="border-t border-border">
                {/* Video + summary header */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-b border-border">
                  {/* Video player */}
                  <div className="bg-foreground aspect-video relative">
                    <video src={a.video_url} controls playsInline className="w-full h-full object-contain" />
                    <span className="absolute top-2 left-2 bg-foreground/80 backdrop-blur-sm px-2 py-0.5 text-[10px] text-primary-foreground font-display tracking-widest">
                      ATHLETE VIDEO
                    </span>
                  </div>
                  {/* Summary panel */}
                  <div className="p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-display tracking-widest text-primary">VAULT MOTION ANALYSIS</span>
                      </div>
                      <p className="text-sm text-foreground mb-3">{data.summary}</p>

                      {/* Quick stats */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-center p-2 bg-secondary/50 border border-border">
                          <p className={`text-xl font-display ${gradeColors[data.overall_grade] || ""}`}>{data.overall_grade}</p>
                          <p className="text-[9px] text-muted-foreground">GRADE</p>
                        </div>
                        <div className="text-center p-2 bg-secondary/50 border border-border">
                          <p className="text-xl font-display text-foreground">{kineticScore || "–"}</p>
                          <p className="text-[9px] text-muted-foreground">CHAIN %</p>
                        </div>
                        <div className="text-center p-2 bg-secondary/50 border border-border">
                          <p className={`text-xl font-display capitalize ${efficiencyColors[efficiency] || ""}`}>
                            {efficiency ? efficiency.charAt(0).toUpperCase() : "–"}
                          </p>
                          <p className="text-[9px] text-muted-foreground">LEVEL</p>
                        </div>
                      </div>
                    </div>

                    {/* Pre-session focus */}
                    {data.pre_session_focus_areas?.length > 0 && (
                      <div className="bg-primary/5 border border-primary/10 p-3">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Target className="w-3 h-3 text-primary" />
                          <span className="text-[9px] font-display tracking-widest text-primary">PRE-SESSION FOCUS</span>
                        </div>
                        <ul className="space-y-0.5">
                          {data.pre_session_focus_areas.map((f: string, i: number) => (
                            <li key={i} className="text-[11px] text-foreground flex items-start gap-1.5">
                              <span className="text-primary font-display">{i + 1}.</span> {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section nav */}
                <div className="flex border-b border-border overflow-x-auto">
                  {[
                    { key: "overview", label: "STRENGTHS & IMPROVEMENTS" },
                    { key: "biomechanics", label: "BIOMECHANICS" },
                    { key: "angles", label: "JOINT ANGLES" },
                    { key: "risks", label: "RISK & POTENTIAL" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveSection(tab.key)}
                      className={`px-4 py-2.5 text-[10px] font-display tracking-widest whitespace-nowrap border-b-2 transition-colors ${
                        activeSection === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Section content */}
                <div className="p-4 space-y-4">
                  {activeSection === "overview" && (
                    <>
                      {data.strengths?.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-display tracking-widest text-muted-foreground mb-2">STRENGTHS</h4>
                          <div className="space-y-2">
                            {data.strengths.map((s: any, i: number) => (
                              <div key={i} className="flex items-start gap-2">
                                <Star className="w-3 h-3 text-vault-utility mt-0.5 shrink-0" />
                                <div>
                                  <span className="text-xs font-medium text-foreground">{s.area}</span>
                                  <span className="text-[10px] text-muted-foreground ml-1.5">{s.impact} impact</span>
                                  <p className="text-[11px] text-muted-foreground">{s.detail}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {data.areas_for_improvement?.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-display tracking-widest text-muted-foreground mb-2">AREAS TO IMPROVE</h4>
                          <div className="space-y-2">
                            {data.areas_for_improvement.map((item: any, i: number) => (
                              <div key={i} className="border border-border p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-[10px] px-1.5 py-0.5 font-medium ${priorityColors[item.priority] || ""}`}>
                                    {item.priority?.toUpperCase()}
                                  </span>
                                  <span className="text-xs font-medium text-foreground">{item.area}</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground">{item.detail}</p>
                                {item.drill_recommendation && (
                                  <p className="text-[11px] text-primary mt-1">💡 Drill: {item.drill_recommendation}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {renderMechanicalBreakdown(data.mechanical_breakdown)}
                    </>
                  )}

                  {activeSection === "biomechanics" && renderBiomechanicsData(data.biomechanics_data)}
                  {activeSection === "angles" && renderBodyAngles(data.body_angles)}

                  {activeSection === "risks" && (
                    <>
                      {data.injury_risk_flags?.length > 0 && (
                        <div className="bg-destructive/5 border border-destructive/10 p-3">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Shield className="w-3.5 h-3.5 text-destructive" />
                            <span className="text-[10px] font-display tracking-widest text-destructive">INJURY RISK FLAGS</span>
                          </div>
                          <ul className="space-y-1">
                            {data.injury_risk_flags.map((f: string, i: number) => (
                              <li key={i} className="text-xs text-foreground flex items-start gap-2">
                                <AlertTriangle className="w-3 h-3 text-destructive mt-0.5 shrink-0" /> {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {data.velocity_potential_notes && (
                        <div className="bg-vault-athleticism/5 border border-vault-athleticism/10 p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Zap className="w-3.5 h-3.5 text-vault-athleticism" />
                            <span className="text-[10px] font-display tracking-widest text-vault-athleticism">VELOCITY / POWER POTENTIAL</span>
                          </div>
                          <p className="text-xs text-foreground">{data.velocity_potential_notes}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Coach notes */}
                {a.coach_notes && (
                  <div className="border-t border-border p-4">
                    <div className="bg-primary/5 border border-primary/20 p-3">
                      <span className="text-[10px] font-display tracking-widest text-primary mb-1 block">COACH NOTES</span>
                      <p className="text-xs text-foreground">{a.coach_notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Progress tracking — show grade history
  const completedAnalyses = analyses.filter((a) => a.status === "completed" && a.ai_analysis);
  const gradeHistory = completedAnalyses.slice(0, 10).reverse();

  return (
    <div className="space-y-6">
      {/* Hero upload section */}
      <div className="bg-card border border-border p-6">
        <div className="flex items-center gap-2 mb-1">
          <Brain className="w-5 h-5 text-primary" />
          <span className="text-sm font-display tracking-widest text-foreground">VAULT AI MOTION ANALYSIS</span>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Professional-grade biomechanics analysis. Upload your video and receive a detailed mechanical report with joint angles, kinetic chain scoring, and actionable corrections — ready for your coaching session.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={videoType} onValueChange={setVideoType}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pitching">Pitching Analysis</SelectItem>
              <SelectItem value="hitting">Hitting Analysis</SelectItem>
              <SelectItem value="fielding">Fielding Analysis</SelectItem>
            </SelectContent>
          </Select>

          <label className="flex-1">
            <input type="file" accept="video/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            <Button variant="vault" className="w-full" disabled={uploading} asChild>
              <span>
                {uploading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing Mechanics…</>
                ) : (
                  <><Upload className="w-4 h-4 mr-2" /> Upload Video for Analysis</>
                )}
              </span>
            </Button>
          </label>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">
          MP4, MOV, WebM · Max 50MB · Best: single rep, side angle, well-lit environment
        </p>
      </div>

      {/* Progress tracking */}
      {gradeHistory.length >= 2 && (
        <div className="bg-card border border-border p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-display tracking-widest text-muted-foreground">ANALYSIS HISTORY</span>
          </div>
          <div className="flex items-end gap-1 h-16">
            {gradeHistory.map((a) => {
              const score = a.ai_analysis?.kinetic_chain_score || 50;
              return (
                <div key={a.id} className="flex-1 flex flex-col items-center gap-0.5">
                  <div
                    className="w-full bg-primary/20 transition-all"
                    style={{ height: `${Math.max(score * 0.6, 8)}px` }}
                  />
                  <span className="text-[8px] text-muted-foreground">
                    {new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Analyses list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : analyses.length === 0 ? (
        <div className="bg-card border border-border p-12 text-center">
          <Film className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-display mb-1">NO ANALYSES YET</p>
          <p className="text-muted-foreground text-xs">Upload your first video to receive a professional biomechanics report.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {analyses.map((a) => {
            if (a.status === "pending" || a.status === "processing") {
              return (
                <div key={a.id} className="bg-card border border-primary/20 p-4 flex items-center gap-3">
                  <div className="relative">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <Brain className="w-3 h-3 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground capitalize font-medium">{a.video_type} Motion Analysis</p>
                    <p className="text-[11px] text-muted-foreground">AI is analyzing biomechanics — estimating joint angles, kinetic chain, and movement patterns…</p>
                  </div>
                </div>
              );
            }
            if (a.status === "error") {
              return (
                <div key={a.id} className="bg-card border border-destructive/20 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    <div>
                      <p className="text-sm text-foreground capitalize">{a.video_type} Analysis</p>
                      <p className="text-[11px] text-destructive">Analysis failed — tap retry</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => retryAnalysis(a.id)}>
                    <RefreshCw className="w-3 h-3 mr-1" /> Retry
                  </Button>
                </div>
              );
            }
            return renderAnalysis(a);
          })}
        </div>
      )}
    </div>
  );
};

export default VideoAnalysisPanel;
