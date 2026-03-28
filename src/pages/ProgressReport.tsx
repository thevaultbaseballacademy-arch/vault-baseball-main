import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp, ArrowRight, CheckCircle2, Shield, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface MetricEntry { week: number; value: number }

function ProgressChart({ data, label, unit, color }: { data: MetricEntry[]; label: string; unit: string; color: string }) {
  if (!data?.length) return null;

  const sorted = [...data].sort((a, b) => a.week - b.week);
  const values = sorted.map(p => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const height = 80;
  const width = 280;
  const maxWeek = Math.max(...sorted.map(p => p.week));

  const points = sorted.map(p => ({
    x: (p.week / maxWeek) * (width - 20) + 10,
    y: height - ((p.value - min) / range) * (height - 24) - 12,
    ...p,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const gain = last.value - first.value;
  const gainStr = gain >= 0 ? `+${gain.toFixed(unit === "sec" ? 2 : 0)}` : gain.toFixed(unit === "sec" ? 2 : 0);

  return (
    <div className="border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-display">{label}</h3>
        <div className="flex items-center gap-1 px-2 py-0.5 bg-foreground text-primary-foreground text-xs font-display">
          <TrendingUp className="w-3 h-3" />
          {gainStr} {unit}
        </div>
      </div>
      <div className="flex items-end gap-3 text-sm">
        <span className="text-muted-foreground">{first.value} {unit}</span>
        <ArrowRight className="w-3 h-3 text-muted-foreground" />
        <span className="font-medium text-foreground">{last.value} {unit}</span>
        <span className="text-[10px] text-muted-foreground ml-auto">{maxWeek} WEEKS</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height + 16}`} className="w-full h-24 overflow-visible">
        <line x1="10" y1={height} x2={width - 10} y2={height} stroke="hsl(var(--border))" strokeWidth="0.5" />
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill={color} />
            <text x={p.x} y={p.y - 9} textAnchor="middle" className="fill-foreground" fontSize="9" fontWeight="bold">{Number.isInteger(p.value) ? p.value : p.value.toFixed(2)}</text>
            <text x={p.x} y={height + 12} textAnchor="middle" className="fill-muted-foreground" fontSize="8">W{p.week}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

const ProgressReport = () => {
  const { token } = useParams<{ token: string }>();
  const [report, setReport] = useState<any>(null);
  const [athleteProfile, setAthleteProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      if (!token) { setError("Invalid report link"); setLoading(false); return; }

      // Try authenticated first, then anon
      const { data, error: fetchErr } = await supabase
        .from("athlete_progress_reports")
        .select("*")
        .eq("share_token", token)
        .eq("is_published", true)
        .maybeSingle();

      if (fetchErr || !data) {
        setError("Report not found or not yet published.");
        setLoading(false);
        return;
      }

      setReport(data);

      // Mark parent view
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        if (user.id === data.athlete_user_id) {
          await supabase.from("athlete_progress_reports").update({ athlete_viewed_at: new Date().toISOString() }).eq("id", data.id);
        } else {
          await supabase.from("athlete_progress_reports").update({ parent_viewed_at: new Date().toISOString() }).eq("id", data.id);
        }
      }

      // Get athlete profile
      const { data: profile } = await supabase.rpc("get_public_profile", { target_user_id: data.athlete_user_id });
      if (profile && profile.length > 0) setAthleteProfile(profile[0]);

      setLoading(false);
    };
    fetchReport();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-display text-foreground mb-2">Report Not Found</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
        <Footer />
      </div>
    );
  }

  const metrics = [
    { data: report.pitch_velocity, label: "Pitch Velocity", unit: "MPH", color: "hsl(var(--primary))" },
    { data: report.exit_velocity, label: "Exit Velocity", unit: "MPH", color: "#f97316" },
    { data: report.sprint_speed, label: "Sprint Speed (60yd)", unit: "sec", color: "#06b6d4" },
    { data: report.bat_speed, label: "Bat Speed", unit: "MPH", color: "#8b5cf6" },
    { data: report.pop_time, label: "Pop Time", unit: "sec", color: "#10b981" },
  ].filter(m => m.data && m.data.length > 0);

  const projections = report.ai_projections as any;
  const recommendations = report.ai_recommendations as string[] | null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Header */}
          <div className="text-center border-b border-border pb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-display tracking-[0.3em] text-muted-foreground">VAULT BASEBALL · COACH VERIFIED REPORT</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display text-foreground">{report.report_title}</h1>
            {report.report_period && <p className="text-sm text-muted-foreground mt-1">{report.report_period}</p>}
            {athleteProfile && (
              <p className="text-sm text-muted-foreground mt-2">
                Athlete: <span className="text-foreground font-medium">{athleteProfile.display_name}</span>
                {athleteProfile.player_position && <> · {athleteProfile.player_position}</>}
              </p>
            )}
          </div>

          {/* Performance Charts */}
          {metrics.length > 0 && (
            <div>
              <h2 className="text-xs font-display tracking-[0.2em] text-muted-foreground mb-4">PERFORMANCE TRACKING</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {metrics.map(m => (
                  <ProgressChart key={m.label} data={m.data} label={m.label} unit={m.unit} color={m.color} />
                ))}
              </div>
            </div>
          )}

          {/* Coach Observations */}
          <div className="space-y-4">
            <h2 className="text-xs font-display tracking-[0.2em] text-muted-foreground">COACH OBSERVATIONS</h2>
            {report.strengths_observed && (
              <div className="border border-border p-4">
                <h3 className="text-sm font-display text-primary mb-1">✓ STRENGTHS</h3>
                <p className="text-sm text-foreground whitespace-pre-line">{report.strengths_observed}</p>
              </div>
            )}
            {report.areas_of_improvement && (
              <div className="border border-border p-4">
                <h3 className="text-sm font-display text-accent-foreground mb-1">⚡ AREAS FOR GROWTH</h3>
                <p className="text-sm text-foreground whitespace-pre-line">{report.areas_of_improvement}</p>
              </div>
            )}
            {report.coach_notes && (
              <div className="border border-border p-4">
                <h3 className="text-sm font-display mb-1">NOTES</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{report.coach_notes}</p>
              </div>
            )}
          </div>

          {/* AI Analysis */}
          {report.ai_summary && (
            <div className="border border-primary/30 bg-primary/5 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h2 className="text-xs font-display tracking-[0.2em]">AI-VERIFIED DEVELOPMENT ANALYSIS</h2>
              </div>

              <p className="text-sm text-foreground whitespace-pre-line">{report.ai_summary}</p>

              {report.ai_accuracy_notes && (
                <div className="flex items-start gap-2 text-xs text-muted-foreground bg-card/50 p-3 border border-border">
                  <CheckCircle2 className="w-3 h-3 mt-0.5 text-primary shrink-0" />
                  <span>{report.ai_accuracy_notes}</span>
                </div>
              )}

              {projections && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-card border border-border p-3 text-center">
                    <span className="text-[10px] font-display tracking-wider text-muted-foreground block mb-1">VELOCITY CEILING</span>
                    <span className="text-sm font-medium">{projections.velocity_ceiling}</span>
                  </div>
                  <div className="bg-card border border-border p-3 text-center">
                    <span className="text-[10px] font-display tracking-wider text-muted-foreground block mb-1">TIMELINE</span>
                    <span className="text-sm font-medium">{projections.timeline}</span>
                  </div>
                  <div className="bg-card border border-border p-3 text-center">
                    <span className="text-[10px] font-display tracking-wider text-muted-foreground block mb-1">DEV TIER</span>
                    <span className="text-sm font-medium">{projections.development_tier}</span>
                  </div>
                </div>
              )}

              {recommendations && recommendations.length > 0 && (
                <div>
                  <h3 className="text-xs font-display tracking-wider text-muted-foreground mb-2">RECOMMENDATIONS</h3>
                  <ul className="space-y-1">
                    {recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <ArrowRight className="w-3 h-3 mt-0.5 text-primary shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="text-center border-t border-border pt-6">
            <p className="text-[10px] text-muted-foreground">
              This report was generated by a Vault Baseball coach with AI-assisted accuracy validation.
              <br />Metrics are verified against age-appropriate development benchmarks.
            </p>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default ProgressReport;
