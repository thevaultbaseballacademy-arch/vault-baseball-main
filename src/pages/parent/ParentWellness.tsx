import { useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams, Link } from "react-router-dom";
import {
  Activity, Zap, Moon, Heart, Frown, Shield,
  AlertTriangle, CheckCircle2, ThermometerSun
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useParentPortal } from "@/hooks/useParentPortal";

const moodEmojis = ["😞", "😕", "😐", "🙂", "😊"];

const ParentWellness = () => {
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
  const checkins = data?.checkins || [];
  const workload = data?.workload || [];
  const isPitcher = profile?.position?.toLowerCase().includes('pitcher') || profile?.position?.toLowerCase() === 'p';

  // Workload aggregation
  const weeklyPitches = workload.slice(0, 7).reduce((s, w) => s + (w.pitch_count || 0), 0);
  const latestWorkload = workload[0];
  const hasOveruseFlag = workload.some(w => w.overuse_flag);
  const latestOveruseAlert = workload.find(w => w.overuse_alert)?.overuse_alert;

  // Determine rest status
  const restStatus = hasOveruseFlag
    ? { label: "Rest Recommended", color: "text-red-500", bg: "bg-red-500/10", icon: AlertTriangle }
    : latestWorkload?.recovery_status === 'limited'
    ? { label: "Monitor", color: "text-amber-500", bg: "bg-amber-500/10", icon: ThermometerSun }
    : { label: "Good to Train", color: "text-green-500", bg: "bg-green-500/10", icon: CheckCircle2 };

  // Checkin stats
  const trainingDays = checkins.filter((c) => c.training_completed).length;
  const avgEnergy = checkins.length > 0
    ? Math.round(checkins.filter(c => c.energy_level).reduce((s, c) => s + (c.energy_level || 0), 0) / Math.max(checkins.filter(c => c.energy_level).length, 1))
    : 0;
  const avgMood = checkins.length > 0
    ? Math.round(checkins.filter(c => c.mood).reduce((s, c) => s + (c.mood || 0), 0) / Math.max(checkins.filter(c => c.mood).length, 1))
    : 0;
  const avgSleep = checkins.filter(c => c.sleep_hours).length > 0
    ? (checkins.filter(c => c.sleep_hours).reduce((s, c) => s + (c.sleep_hours || 0), 0) / checkins.filter(c => c.sleep_hours).length).toFixed(1)
    : null;
  const highSoreness = checkins.filter((c) => (c.soreness_level || 0) >= 4).length;

  if (!currentAthleteId) {
    return (
      <div className="p-6 lg:p-10 text-center py-20">
        <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
        <p className="text-muted-foreground">Link an athlete to view wellness & workload.</p>
        <Link to="/parent" className="text-primary text-sm hover:underline mt-2 inline-block">Go to My Athletes</Link>
      </div>
    );
  }

  const RestIcon = restStatus.icon;

  return (
    <div className="p-6 lg:p-10 max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center">
          <Activity className="w-6 h-6 text-rose-500" />
        </div>
        <div>
          <h1 className="text-2xl font-display text-foreground">WORKLOAD & HEALTH</h1>
          <p className="text-sm text-muted-foreground">{profile?.display_name}'s last 14 days</p>
        </div>
      </div>

      {/* Pitch Count Alert Banner (for pitchers) */}
      {isPitcher && weeklyPitches > 150 && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
          className={`flex items-start gap-3 p-4 rounded-xl border ${
            weeklyPitches > 200
              ? "bg-red-500/10 border-red-500/30"
              : "bg-amber-500/10 border-amber-500/30"
          }`}>
          <AlertTriangle className={`w-5 h-5 mt-0.5 ${weeklyPitches > 200 ? "text-red-500" : "text-amber-500"}`} />
          <div>
            <p className={`font-display ${weeklyPitches > 200 ? "text-red-500" : "text-amber-500"}`}>
              {weeklyPitches > 200
                ? `🔴 ${profile?.display_name} has exceeded their safe pitch count this week. No pitching recommended until rest is complete.`
                : `⚠️ ${profile?.display_name} is approaching their weekly pitch limit. Rest day recommended before next session.`}
            </p>
          </div>
        </motion.div>
      )}

      {/* Rest Status Banner */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-3 p-4 rounded-xl border ${restStatus.bg} border-transparent`}>
        <RestIcon className={`w-5 h-5 ${restStatus.color}`} />
        <div>
          <p className={`font-display ${restStatus.color}`}>{restStatus.label}</p>
          {latestOveruseAlert && <p className="text-xs text-muted-foreground mt-0.5">{latestOveruseAlert}</p>}
          {!latestOveruseAlert && !hasOveruseFlag && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {restStatus.label === "Good to Train"
                ? "No injury risk flags. Recovery looks healthy."
                : "Some recovery indicators need monitoring."}
            </p>
          )}
        </div>
      </motion.div>

      {/* Pitch Count (pitchers only) */}
      {isPitcher && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-primary" />
            <h3 className="font-display text-foreground">Pitch Count This Week</h3>
          </div>
          <div className="flex items-end gap-3 mb-2">
            <span className="text-4xl font-display text-foreground">{weeklyPitches}</span>
            <span className="text-sm text-muted-foreground mb-1">pitches</span>
          </div>
          <Progress value={Math.min(100, (weeklyPitches / 200) * 100)} className="h-3 mb-2" />
          <p className="text-xs text-muted-foreground">
            {weeklyPitches > 200 ? "⚠️ Above recommended safe threshold."
              : weeklyPitches > 150 ? "Approaching weekly limit. Monitor closely."
              : "Within safe range for age group."}
          </p>
        </motion.div>
      )}

      {/* Summary Cards */}
      {checkins.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={<Zap className="w-5 h-5 text-amber-500" />} value={`${avgEnergy}/5`} label="Avg Energy" />
            <StatCard icon={<span className="text-2xl">{avgMood > 0 ? moodEmojis[Math.min(avgMood - 1, 4)] : "—"}</span>} value={`${avgMood}/5`} label="Avg Mood" />
            <StatCard icon={<Moon className="w-5 h-5 text-indigo-400" />} value={avgSleep ? `${avgSleep}h` : "—"} label="Avg Sleep" />
            <StatCard
              icon={<Frown className={`w-5 h-5 ${highSoreness > 3 ? "text-red-500" : "text-muted-foreground"}`} />}
              value={`${highSoreness}`} label="High Soreness Days"
              alert={highSoreness > 3}
            />
          </div>

          {/* Daily Log */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-display text-foreground mb-4">Daily Check-ins</h3>
            <div className="space-y-2">
              {checkins.map((c, i) => (
                <motion.div key={c.checkin_date} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                  <span className="text-xs text-muted-foreground w-16 shrink-0">
                    {new Date(c.checkin_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <div className="flex items-center gap-2 flex-1">
                    {c.energy_level && (
                      <div className="flex gap-0.5" title={`Energy: ${c.energy_level}/5`}>
                        {[1, 2, 3, 4, 5].map(n => (
                          <div key={n} className={`w-1.5 h-3 rounded-sm ${n <= c.energy_level! ? 'bg-amber-500' : 'bg-border'}`} />
                        ))}
                      </div>
                    )}
                    {c.mood && <span className="text-sm">{moodEmojis[Math.min(c.mood - 1, 4)]}</span>}
                    {c.sleep_hours && <span className="text-[10px] text-muted-foreground">{c.sleep_hours}h💤</span>}
                    {c.soreness_level && c.soreness_level >= 4 && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-red-500/10 text-red-500 rounded">Sore</span>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    c.training_completed ? "bg-green-500/10 text-green-500" : "bg-secondary text-muted-foreground"
                  }`}>
                    {c.training_completed ? "Trained" : "Rest"}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}

      {checkins.length === 0 && workload.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Activity className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No wellness or workload data available yet.</p>
        </div>
      )}
    </div>
  );
};

function StatCard({ icon, value, label, alert }: { icon: React.ReactNode; value: string; label: string; alert?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className={`bg-card border rounded-2xl p-4 text-center ${alert ? 'border-red-500/30' : 'border-border'}`}>
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="text-2xl font-display text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </motion.div>
  );
}

export default ParentWellness;
