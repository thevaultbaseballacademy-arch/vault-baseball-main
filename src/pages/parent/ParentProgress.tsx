import { useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams, Link } from "react-router-dom";
import {
  BarChart3, TrendingUp, TrendingDown, Minus, AlertTriangle,
  Target, Activity, Dumbbell, Brain, CheckCircle2, ArrowUpRight
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useParentPortal } from "@/hooks/useParentPortal";

const statusLabels: Record<string, { label: string; icon: any; color: string; bg: string; explanation: string }> = {
  improving: { label: "Improving ↑", icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10", explanation: "Your athlete is making measurable progress across key areas." },
  stable: { label: "Stable →", icon: Minus, color: "text-blue-500", bg: "bg-blue-500/10", explanation: "Performance is steady. Consistent effort is maintaining current levels." },
  stalled: { label: "Needs Attention ⚠", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10", explanation: "Progress has paused. A conversation with the coach may help identify next steps." },
  regressing: { label: "Needs Attention ⚠", icon: TrendingDown, color: "text-red-500", bg: "bg-red-500/10", explanation: "Some metrics are trending down. Coach review is recommended." },
};

const ParentProgress = () => {
  const [searchParams] = useSearchParams();
  const athleteId = searchParams.get("athlete");
  const { activeLinks, fetchAthleteData, athleteData } = useParentPortal();

  const selectedLink = athleteId
    ? activeLinks.find((l) => l.athlete_user_id === athleteId)
    : activeLinks[0];
  const currentAthleteId = selectedLink?.athlete_user_id;

  useEffect(() => {
    if (currentAthleteId && !athleteData[currentAthleteId]) fetchAthleteData(currentAthleteId);
  }, [currentAthleteId]);

  const data = currentAthleteId ? athleteData[currentAthleteId] : null;
  const profile = data?.profile;
  const dev = data?.development_score;
  const kpis = data?.recent_kpis || [];
  const status = statusLabels[dev?.improvement_status || "stable"] || statusLabels.stable;
  const StatusIcon = status.icon;

  if (!currentAthleteId) {
    return (
      <div className="p-6 lg:p-10 text-center py-20">
        <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
        <p className="text-muted-foreground">Link an athlete first to view progress.</p>
        <Link to="/parent" className="text-primary text-sm hover:underline mt-2 inline-block">Go to My Athletes</Link>
      </div>
    );
  }

  // Group KPIs by name, get trend (latest 3 values per KPI)
  const kpiTrends: Record<string, { name: string; values: { value: number; date: string }[]; unit: string }> = {};
  for (const k of kpis) {
    if (!kpiTrends[k.kpi_name]) kpiTrends[k.kpi_name] = { name: k.kpi_name, values: [], unit: k.kpi_unit || "" };
    if (kpiTrends[k.kpi_name].values.length < 5) {
      kpiTrends[k.kpi_name].values.push({ value: k.kpi_value, date: k.recorded_at });
    }
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <BarChart3 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display text-foreground">{profile?.display_name || "Athlete"}'s Progress</h1>
          <p className="text-sm text-muted-foreground">{profile?.position} • {profile?.sport_type === "softball" ? "🥎 Softball" : "⚾ Baseball"}</p>
        </div>
      </div>

      {/* Status + Readiness */}
      {dev && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6 space-y-5">
          {/* Improvement Status Banner */}
          <div className={`flex items-start gap-3 p-4 rounded-xl ${status.bg}`}>
            <StatusIcon className={`w-5 h-5 mt-0.5 ${status.color}`} />
            <div>
              <p className={`font-display text-lg ${status.color}`}>{status.label}</p>
              <p className="text-sm text-muted-foreground mt-1">{status.explanation}</p>
            </div>
          </div>

          {/* Readiness Score */}
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="34" stroke="hsl(var(--border))" strokeWidth="6" fill="none" />
                <circle cx="40" cy="40" r="34" stroke="hsl(var(--primary))" strokeWidth="6" fill="none" strokeLinecap="round"
                  strokeDasharray={`${(dev.overall_score / 100) * 214} 214`} />
              </svg>
              <span className="absolute text-2xl font-display text-foreground">{dev.overall_score}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Readiness Score</p>
              <p className="text-xs text-muted-foreground">
                {dev.overall_score >= 80 ? "Excellent — your athlete is performing at a high level."
                  : dev.overall_score >= 60 ? "Good — solid progress with room to grow."
                  : dev.overall_score >= 40 ? "Building — consistent effort will drive improvement."
                  : "Early stage — every session counts. Stay encouraged!"}
              </p>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="space-y-3">
            <ScoreBar label="Training Consistency" value={dev.training_consistency} icon={<Activity className="w-3 h-3" />} />
            <ScoreBar label="Skill Development" value={dev.skill_development} icon={<Target className="w-3 h-3" />} />
            <ScoreBar label="Work Ethic" value={dev.work_ethic} icon={<Dumbbell className="w-3 h-3" />} />
          </div>

          {/* Top Strength + Priority */}
          <div className="grid sm:grid-cols-2 gap-3">
            {dev.strengths_summary && dev.strengths_summary[0] && (
              <div className="p-3 bg-green-500/5 border border-green-500/10 rounded-xl">
                <p className="text-xs text-green-500 flex items-center gap-1 mb-1"><CheckCircle2 className="w-3 h-3" /> Top Strength</p>
                <p className="text-sm font-medium text-foreground capitalize">{dev.strengths_summary[0]}</p>
              </div>
            )}
            {dev.top_priorities && dev.top_priorities[0] && (
              <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                <p className="text-xs text-amber-500 flex items-center gap-1 mb-1"><ArrowUpRight className="w-3 h-3" /> Priority Focus</p>
                <p className="text-sm font-medium text-foreground capitalize">{dev.top_priorities[0]}</p>
              </div>
            )}
          </div>

          {dev.weekly_focus && (
            <div className="p-3 bg-primary/5 rounded-xl">
              <p className="text-xs text-muted-foreground">This Week's Focus</p>
              <p className="text-sm text-foreground font-medium">{dev.weekly_focus}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* KPI Trend Charts */}
      {Object.keys(kpiTrends).length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-display text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" /> Performance Trends
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {Object.values(kpiTrends).slice(0, 6).map((kpi) => {
              const reversed = [...kpi.values].reverse();
              const max = Math.max(...reversed.map(v => v.value), 1);
              const min = Math.min(...reversed.map(v => v.value), 0);
              const range = max - min || 1;
              const latest = reversed[reversed.length - 1];
              const first = reversed[0];
              const improving = latest && first ? latest.value >= first.value : false;

              return (
                <div key={kpi.name} className="bg-secondary rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground capitalize">{kpi.name.replace(/_/g, ' ')}</p>
                    <p className={`text-xs font-medium ${improving ? 'text-green-500' : 'text-red-400'}`}>
                      {latest?.value}{kpi.unit ? ` ${kpi.unit}` : ''}
                    </p>
                  </div>
                  {/* Simple sparkline */}
                  <div className="flex items-end gap-1 h-10">
                    {reversed.map((v, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-sm ${improving ? 'bg-green-500/60' : 'bg-amber-500/60'}`}
                        style={{ height: `${Math.max(15, ((v.value - min) / range) * 100)}%` }}
                        title={`${v.value} ${kpi.unit}`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

function ScoreBar({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground flex items-center gap-1">{icon} {label}</span>
        <span className="text-foreground font-medium">{value}%</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );
}

export default ParentProgress;
