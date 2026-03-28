import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, Plus, Trash2, Brain, Send, Copy, TrendingUp,
  CheckCircle2, ArrowRight, Sparkles
} from "lucide-react";

interface MetricEntry { week: number; value: number }

interface AthleteOption {
  user_id: string;
  display_name: string;
}

const METRIC_CONFIGS = [
  { key: "pitch_velocity", label: "Pitch Velocity", unit: "MPH", icon: "🔥" },
  { key: "exit_velocity", label: "Exit Velocity", unit: "MPH", icon: "💥" },
  { key: "sprint_speed", label: "Sprint Speed (60yd)", unit: "sec", icon: "⚡" },
  { key: "bat_speed", label: "Bat Speed", unit: "MPH", icon: "🏏" },
  { key: "pop_time", label: "Pop Time", unit: "sec", icon: "🎯" },
] as const;

type MetricKey = typeof METRIC_CONFIGS[number]["key"];

const AthleteProgressReportForm = () => {
  const { toast } = useToast();
  const [athletes, setAthletes] = useState<AthleteOption[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState("");
  const [reportTitle, setReportTitle] = useState("Weekly Progress Report");
  const [reportPeriod, setReportPeriod] = useState("");
  const [coachNotes, setCoachNotes] = useState("");
  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [metrics, setMetrics] = useState<Record<MetricKey, MetricEntry[]>>({
    pitch_velocity: [],
    exit_velocity: [],
    sprint_speed: [],
    bat_speed: [],
    pop_time: [],
  });
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [savedReportId, setSavedReportId] = useState<string | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  useEffect(() => {
    fetchAthletes();
    fetchReports();
  }, []);

  const fetchAthletes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Try to get assigned athletes first
    const { data } = await supabase
      .from("coach_athlete_assignments")
      .select("athlete_user_id")
      .eq("coach_user_id", user.id)
      .eq("is_active", true);

    let athleteIds: string[] = [];

    if (data && data.length > 0) {
      athleteIds = data.map(d => d.athlete_user_id);
    }

    if (athleteIds.length > 0) {
      // Fetch profiles for assigned athletes
      const { data: profiles } = await supabase.rpc("get_public_profiles_by_ids", {
        user_ids: athleteIds,
      });
      if (profiles) {
        setAthletes(profiles.map((p: any) => ({
          user_id: p.user_id,
          display_name: p.display_name || "Unknown Athlete",
        })));
      }
    } else {
      // Fallback: use the security-definer function to get assigned athlete profiles
      const { data: assignedProfiles } = await supabase.rpc("get_assigned_athlete_profiles", {
        coach_id: user.id,
      });

      if (assignedProfiles && assignedProfiles.length > 0) {
        setAthletes(assignedProfiles.map((p: any) => ({
          user_id: p.user_id,
          display_name: p.display_name || "Unknown Athlete",
        })));
      } else {
        // Final fallback: use search function to get some profiles
        const { data: searchResults } = await supabase.rpc("search_public_profiles", {
          search_term: "",
          result_limit: 50,
        });

        if (searchResults) {
          setAthletes(searchResults
            .filter((p: any) => p.user_id !== user.id)
            .map((p: any) => ({
              user_id: p.user_id,
              display_name: p.display_name || "Unknown Athlete",
            })));
        }
      }
    }
  };

  const fetchReports = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("athlete_progress_reports")
      .select("*")
      .eq("coach_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    setReports(data || []);
    setLoadingReports(false);
  };

  const addMetricEntry = (key: MetricKey) => {
    const current = metrics[key];
    const nextWeek = current.length > 0 ? Math.max(...current.map(m => m.week)) + 1 : 1;
    setMetrics(prev => ({
      ...prev,
      [key]: [...prev[key], { week: nextWeek, value: 0 }],
    }));
  };

  const updateMetricEntry = (key: MetricKey, index: number, field: "week" | "value", val: number) => {
    setMetrics(prev => ({
      ...prev,
      [key]: prev[key].map((entry, i) => i === index ? { ...entry, [field]: val } : entry),
    }));
  };

  const removeMetricEntry = (key: MetricKey, index: number) => {
    setMetrics(prev => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  };

  const handleSave = async (publish = false) => {
    if (!selectedAthlete) {
      toast({ title: "Select an athlete", variant: "destructive" });
      return;
    }

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const reportData: any = {
      coach_user_id: user.id,
      athlete_user_id: selectedAthlete,
      report_title: reportTitle,
      report_period: reportPeriod,
      pitch_velocity: JSON.parse(JSON.stringify(metrics.pitch_velocity)),
      exit_velocity: JSON.parse(JSON.stringify(metrics.exit_velocity)),
      sprint_speed: JSON.parse(JSON.stringify(metrics.sprint_speed)),
      bat_speed: JSON.parse(JSON.stringify(metrics.bat_speed)),
      pop_time: JSON.parse(JSON.stringify(metrics.pop_time)),
      coach_notes: coachNotes,
      strengths_observed: strengths,
      areas_of_improvement: improvements,
      is_published: publish,
      ...(publish ? { delivered_at: new Date().toISOString() } : {}),
      ...(aiAnalysis ? {
        ai_summary: aiAnalysis.summary,
        ai_accuracy_notes: aiAnalysis.accuracy_notes,
        ai_projections: aiAnalysis.projections,
        ai_recommendations: aiAnalysis.recommendations,
      } : {}),
    };

    let result;
    if (savedReportId) {
      result = await supabase
        .from("athlete_progress_reports")
        .update(reportData)
        .eq("id", savedReportId)
        .select()
        .single();
    } else {
      result = await supabase
        .from("athlete_progress_reports")
        .insert(reportData)
        .select()
        .single();
    }

    setSaving(false);

    if (result.error) {
      toast({ title: "Error saving report", description: result.error.message, variant: "destructive" });
    } else {
      setSavedReportId(result.data.id);
      setShareToken(result.data.share_token);
      toast({ title: publish ? "Report published & delivered!" : "Report saved as draft" });
      fetchReports();
    }
  };

  const handleAIAnalysis = async () => {
    const hasAnyMetrics = Object.values(metrics).some(arr => arr.length > 0);
    if (!hasAnyMetrics) {
      toast({ title: "Add at least one metric entry first", variant: "destructive" });
      return;
    }

    setAnalyzing(true);
    const athlete = athletes.find(a => a.user_id === selectedAthlete);

    try {
      const { data, error } = await supabase.functions.invoke("generate-progress-report", {
        body: {
          report_id: savedReportId,
          athlete_name: athlete?.display_name,
          metrics: {
            ...metrics,
            coach_notes: coachNotes,
            strengths_observed: strengths,
            areas_of_improvement: improvements,
          },
        },
      });

      if (error) throw error;
      setAiAnalysis(data.analysis);
      toast({ title: "AI analysis complete!", description: `Confidence: ${data.analysis.confidence_score}%` });
    } catch (err: any) {
      toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const copyShareLink = () => {
    if (shareToken) {
      const url = `${window.location.origin}/progress-report/${shareToken}`;
      navigator.clipboard.writeText(url);
      toast({ title: "Share link copied!" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Builder */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            CREATE ATHLETE PROGRESS REPORT
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Athlete Selection & Report Info */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-display tracking-wider text-muted-foreground mb-1 block">ATHLETE</label>
              <Select value={selectedAthlete} onValueChange={setSelectedAthlete}>
                <SelectTrigger><SelectValue placeholder="Select athlete" /></SelectTrigger>
                <SelectContent>
                  {athletes.map(a => (
                    <SelectItem key={a.user_id} value={a.user_id}>{a.display_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-display tracking-wider text-muted-foreground mb-1 block">REPORT TITLE</label>
              <Input value={reportTitle} onChange={e => setReportTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-display tracking-wider text-muted-foreground mb-1 block">PERIOD</label>
              <Input placeholder="e.g. Weeks 1-12" value={reportPeriod} onChange={e => setReportPeriod(e.target.value)} />
            </div>
          </div>

          {/* Metrics Entry */}
          <div className="space-y-4">
            <h3 className="text-sm font-display tracking-wider text-muted-foreground">PERFORMANCE METRICS</h3>
            {METRIC_CONFIGS.map(config => (
              <div key={config.key} className="border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-display">
                    {config.icon} {config.label} <span className="text-muted-foreground">({config.unit})</span>
                  </span>
                  <Button variant="outline" size="sm" onClick={() => addMetricEntry(config.key)}>
                    <Plus className="w-3 h-3 mr-1" /> Add Week
                  </Button>
                </div>
                {metrics[config.key].length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {metrics[config.key].map((entry, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <Input
                          type="number"
                          placeholder="Wk"
                          className="w-16 text-xs"
                          value={entry.week || ""}
                          onChange={e => updateMetricEntry(config.key, idx, "week", parseInt(e.target.value) || 0)}
                        />
                        <Input
                          type="number"
                          step="0.01"
                          placeholder={config.unit}
                          className="w-20 text-xs"
                          value={entry.value || ""}
                          onChange={e => updateMetricEntry(config.key, idx, "value", parseFloat(e.target.value) || 0)}
                        />
                        <Button variant="ghost" size="sm" onClick={() => removeMetricEntry(config.key, idx)} className="p-1 h-auto">
                          <Trash2 className="w-3 h-3 text-muted-foreground" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Coach Notes */}
          <div className="space-y-4">
            <h3 className="text-sm font-display tracking-wider text-muted-foreground">COACH OBSERVATIONS</h3>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Strengths Observed</label>
              <Textarea value={strengths} onChange={e => setStrengths(e.target.value)} placeholder="What is this athlete doing well..." rows={2} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Areas for Improvement</label>
              <Textarea value={improvements} onChange={e => setImprovements(e.target.value)} placeholder="Where this athlete can improve..." rows={2} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Additional Notes</label>
              <Textarea value={coachNotes} onChange={e => setCoachNotes(e.target.value)} placeholder="Any other observations for parents..." rows={2} />
            </div>
          </div>

          {/* AI Analysis Section */}
          <div className="border border-primary/30 bg-primary/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-display">AI-ASSISTED ANALYSIS</span>
              </div>
              <Button onClick={handleAIAnalysis} disabled={analyzing} size="sm" variant="outline">
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Brain className="w-4 h-4 mr-1" />}
                {analyzing ? "Analyzing..." : "Generate AI Insights"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              AI validates metric accuracy for the athlete's age, generates parent-friendly summaries, and provides development projections.
            </p>

            {aiAnalysis && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Data Confidence: {aiAnalysis.confidence_score}%</span>
                </div>

                <div>
                  <h4 className="text-xs font-display tracking-wider text-muted-foreground mb-1">PARENT SUMMARY</h4>
                  <p className="text-sm text-foreground whitespace-pre-line">{aiAnalysis.summary}</p>
                </div>

                <div>
                  <h4 className="text-xs font-display tracking-wider text-muted-foreground mb-1">ACCURACY NOTES</h4>
                  <p className="text-sm text-muted-foreground">{aiAnalysis.accuracy_notes}</p>
                </div>

                {aiAnalysis.projections && (
                  <div>
                    <h4 className="text-xs font-display tracking-wider text-muted-foreground mb-1">PROJECTIONS</h4>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-card border border-border p-2">
                        <span className="text-muted-foreground block">Velocity Ceiling</span>
                        <span className="font-medium">{aiAnalysis.projections.velocity_ceiling}</span>
                      </div>
                      <div className="bg-card border border-border p-2">
                        <span className="text-muted-foreground block">Timeline</span>
                        <span className="font-medium">{aiAnalysis.projections.timeline}</span>
                      </div>
                      <div className="bg-card border border-border p-2">
                        <span className="text-muted-foreground block">Tier</span>
                        <span className="font-medium">{aiAnalysis.projections.development_tier}</span>
                      </div>
                    </div>
                  </div>
                )}

                {aiAnalysis.recommendations?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-display tracking-wider text-muted-foreground mb-1">RECOMMENDATIONS</h4>
                    <ul className="space-y-1">
                      {aiAnalysis.recommendations.map((rec: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <ArrowRight className="w-3 h-3 mt-0.5 text-primary shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => handleSave(false)} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Save Draft
            </Button>
            <Button variant="vault" onClick={() => handleSave(true)} disabled={saving}>
              <Send className="w-4 h-4 mr-1" />
              Publish & Deliver to Athlete
            </Button>
            {shareToken && (
              <Button variant="outline" onClick={copyShareLink}>
                <Copy className="w-4 h-4 mr-1" />
                Copy Parent Share Link
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Previous Reports */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-display tracking-wider">PREVIOUS REPORTS</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingReports ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : reports.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No reports yet. Create your first one above.</p>
          ) : (
            <div className="space-y-2">
              {reports.map(report => (
                <div key={report.id} className="flex items-center justify-between border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">{report.report_title}</p>
                    <p className="text-xs text-muted-foreground">
                      {report.report_period} · {report.is_published ? "Published" : "Draft"} · {new Date(report.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {report.is_published && report.share_token && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/progress-report/${report.share_token}`);
                          toast({ title: "Link copied!" });
                        }}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    )}
                    <span className={`text-[10px] font-display px-2 py-0.5 ${report.is_published ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {report.is_published ? "LIVE" : "DRAFT"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AthleteProgressReportForm;
