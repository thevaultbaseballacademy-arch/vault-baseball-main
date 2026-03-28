import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Activity, Target, Shield, AlertTriangle,
  TrendingUp, Zap, Heart, ChevronRight, Moon,
  Gauge, Calendar, Trophy, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useWorkloadManagement } from "@/hooks/useWorkloadManagement";
import { useWorkloadHealth } from "@/hooks/useWorkloadHealth";

const WorkloadDashboard = () => {
  const navigate = useNavigate();
  const {
    entries, weeklyStats, loading, getAlerts, tournaments,
  } = useWorkloadManagement();
  const { activeInjuries, armCareStreak } = useWorkloadHealth();

  const [ageGroup] = useState("14U");
  const [sportType] = useState("baseball");

  const alerts = getAlerts(ageGroup, sportType);
  const todayEntry = entries[0];

  const riskColors = {
    green: "border-green-500/20 bg-green-500/5",
    yellow: "border-amber-500/20 bg-amber-500/5",
    red: "border-destructive/20 bg-destructive/5",
  };
  const riskTextColors = {
    green: "text-green-600 dark:text-green-400",
    yellow: "text-amber-600 dark:text-amber-400",
    red: "text-destructive",
  };
  const riskIcons = {
    green: <Shield className="w-7 h-7" />,
    yellow: <Activity className="w-7 h-7" />,
    red: <AlertTriangle className="w-7 h-7" />,
  };
  const riskLabels = {
    green: "CLEAR TO TRAIN",
    yellow: "MONITOR",
    red: "REST RECOMMENDED",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-secondary animate-pulse rounded-sm" />)}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-display text-foreground mb-1">WORKLOAD & HEALTH</h1>
              <p className="text-muted-foreground">Protect your arm. Monitor your body. Train smarter.</p>
            </div>

            {/* Risk Status Banner */}
            <div className={`border p-6 ${riskColors[alerts.riskLevel]}`}>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 flex items-center justify-center ${riskTextColors[alerts.riskLevel]}`}>
                  {riskIcons[alerts.riskLevel]}
                </div>
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Status</p>
                  <p className={`text-2xl font-display ${riskTextColors[alerts.riskLevel]}`}>
                    {riskLabels[alerts.riskLevel]}
                  </p>
                  <div className="mt-1 space-y-0.5">
                    {alerts.messages.map((msg, i) => (
                      <p key={i} className="text-sm text-muted-foreground">{msg}</p>
                    ))}
                  </div>
                </div>
                {alerts.lockPitching && (
                  <div className="bg-destructive/10 border border-destructive/30 px-3 py-1.5">
                    <p className="text-xs font-display text-destructive">PITCHING LOCKED</p>
                  </div>
                )}
              </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MetricCard icon={<Target className="w-5 h-5 text-primary" />} value={weeklyStats.totalPitches} label="Weekly Pitches" />
              <MetricCard icon={<Zap className="w-5 h-5 text-amber-500" />} value={weeklyStats.totalThrows} label="Total Arm Events" />
              <MetricCard icon={<Gauge className="w-5 h-5 text-blue-500" />} value={weeklyStats.trainingLoadScore} label="Training Load" suffix="/100" />
              <MetricCard icon={<Heart className="w-5 h-5 text-green-500" />} value={weeklyStats.recoveryScore} label="Recovery Score" suffix="/100" />
            </div>

            {/* Recovery Breakdown */}
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="bg-card border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Avg Sleep</span>
                </div>
                <p className="text-2xl font-display text-foreground">{weeklyStats.avgSleep}h</p>
                <Progress
                  value={Math.min(100, (weeklyStats.avgSleep / 9) * 100)}
                  className="h-1.5 mt-2"
                />
              </div>
              <div className="bg-card border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-orange-500" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Avg Soreness</span>
                </div>
                <p className="text-2xl font-display text-foreground">{weeklyStats.avgSoreness}/5</p>
                <Progress
                  value={(weeklyStats.avgSoreness / 5) * 100}
                  className={`h-1.5 mt-2 ${weeklyStats.avgSoreness >= 4 ? "[&>div]:bg-destructive" : weeklyStats.avgSoreness >= 3 ? "[&>div]:bg-amber-500" : ""}`}
                />
              </div>
              <div className="bg-card border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Avg Readiness</span>
                </div>
                <p className="text-2xl font-display text-foreground">{weeklyStats.avgReadiness}/10</p>
                <Progress
                  value={(weeklyStats.avgReadiness / 10) * 100}
                  className="h-1.5 mt-2"
                />
              </div>
            </div>

            {/* Navigation Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <NavCard to="/workload/daily-log" icon={<BarChart3 className="w-7 h-7 text-primary" />} title="Daily Log" desc="Log today's workload" />
              <NavCard to="/workload/pitch-log" icon={<Target className="w-7 h-7 text-primary" />} title="Pitch Counter" desc="Detailed pitch tracking" />
              <NavCard to="/workload/tournament" icon={<Trophy className="w-7 h-7 text-amber-500" />} title="Tournament Mode" desc="Multi-game tracking" badge={tournaments.filter(t => t.is_active).length > 0 ? "ACTIVE" : undefined} />
              <NavCard to="/workload/arm-care" icon={<Heart className="w-7 h-7 text-green-500" />} title="Arm Care" desc={`${armCareStreak}-day streak`} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <NavCard to="/workload/injuries" icon={<AlertTriangle className="w-7 h-7 text-destructive" />} title="Injury Log" desc={`${activeInjuries.length} active`} />
              <Link to="/dashboard">
                <div className="bg-card border border-border p-6 hover:border-primary/30 transition-all group h-full">
                  <Calendar className="w-7 h-7 text-muted-foreground mb-3" />
                  <h3 className="font-display text-foreground mb-1">Full Dashboard</h3>
                  <p className="text-xs text-muted-foreground">View training calendar</p>
                  <ChevronRight className="w-4 h-4 text-muted-foreground mt-3 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            </div>

            {/* Recent Entries */}
            {entries.length > 0 && (
              <div className="bg-card border border-border p-6">
                <h3 className="font-display text-foreground mb-4">Recent Entries</h3>
                <div className="space-y-2">
                  {entries.slice(0, 7).map((e) => (
                    <div key={e.id} className="flex items-center gap-3 p-3 bg-secondary">
                      <span className="text-xs text-muted-foreground w-16 shrink-0">
                        {new Date(e.record_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {e.pitch_count ? <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary">{e.pitch_count} pitches</span> : null}
                        {e.training_minutes ? <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-500">{e.training_minutes}m training</span> : null}
                        {e.soreness_level && e.soreness_level >= 4 ? <span className="text-xs px-1.5 py-0.5 bg-destructive/10 text-destructive">Sore</span> : null}
                      </div>
                      <RecoveryBadge status={e.recovery_status} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const MetricCard = ({ icon, value, label, suffix }: { icon: React.ReactNode; value: number; label: string; suffix?: string }) => (
  <div className="bg-card border border-border p-4 text-center">
    <div className="flex justify-center mb-2">{icon}</div>
    <p className="text-2xl font-display text-foreground">{value}{suffix}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);

const NavCard = ({ to, icon, title, desc, badge }: { to: string; icon: React.ReactNode; title: string; desc: string; badge?: string }) => (
  <Link to={to}>
    <div className="bg-card border border-border p-6 hover:border-primary/30 transition-all group h-full relative">
      {badge && (
        <span className="absolute top-3 right-3 text-[10px] font-display px-2 py-0.5 bg-amber-500/10 text-amber-600 border border-amber-500/20">
          {badge}
        </span>
      )}
      <div className="mb-3">{icon}</div>
      <h3 className="font-display text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground">{desc}</p>
      <ChevronRight className="w-4 h-4 text-muted-foreground mt-3 group-hover:translate-x-1 transition" />
    </div>
  </Link>
);

const RecoveryBadge = ({ status }: { status: string | null }) => {
  if (!status) return null;
  const styles = {
    good: "bg-green-500/10 text-green-600",
    monitor: "bg-amber-500/10 text-amber-600",
    rest: "bg-destructive/10 text-destructive",
  }[status] || "bg-secondary text-muted-foreground";
  return <span className={`text-[10px] font-display px-2 py-0.5 capitalize ${styles}`}>{status}</span>;
};

export default WorkloadDashboard;
