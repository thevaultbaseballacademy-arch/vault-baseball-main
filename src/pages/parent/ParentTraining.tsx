import { useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams, Link } from "react-router-dom";
import {
  Dumbbell, CheckCircle2, ClipboardCheck, Flame,
  Target, Trophy
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useParentPortal } from "@/hooks/useParentPortal";

const ParentTraining = () => {
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
  const homework = data?.homework;
  const dev = data?.development_score;
  const checkins = data?.checkins || [];

  // Calculate streak from checkins
  let streak = 0;
  for (const c of checkins) {
    if (c.training_completed) streak++;
    else break;
  }

  const weeklyCompliance = homework && homework.assigned_this_week > 0
    ? Math.round((homework.completed_this_week / homework.assigned_this_week) * 100)
    : 0;
  const lifetimeRate = homework && homework.lifetime_assigned > 0
    ? Math.round((homework.lifetime_completed / homework.lifetime_assigned) * 100)
    : 0;

  if (!currentAthleteId) {
    return (
      <div className="p-6 lg:p-10 text-center py-20">
        <Dumbbell className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
        <p className="text-muted-foreground">Link an athlete to view training activity.</p>
        <Link to="/parent" className="text-primary text-sm hover:underline mt-2 inline-block">Go to My Athletes</Link>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
          <Dumbbell className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-display text-foreground">PROGRAM & DRILL ACTIVITY</h1>
          <p className="text-sm text-muted-foreground">{profile?.display_name}'s training accountability</p>
        </div>
      </div>

      {/* Accountability Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border rounded-2xl p-4 text-center">
          <ClipboardCheck className="w-5 h-5 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-display text-foreground">{homework?.completed_this_week || 0}/{homework?.assigned_this_week || 0}</p>
          <p className="text-xs text-muted-foreground">Drills This Week</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }}
          className="bg-card border border-border rounded-2xl p-4 text-center">
          <Flame className={`w-5 h-5 mx-auto mb-2 ${streak >= 3 ? 'text-orange-500' : 'text-muted-foreground'}`} />
          <p className="text-2xl font-display text-foreground">{streak}</p>
          <p className="text-xs text-muted-foreground">Day Streak</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-4 text-center">
          <Target className="w-5 h-5 mx-auto mb-2 text-green-500" />
          <p className="text-2xl font-display text-foreground">{dev?.lessons_attended || 0}/{(dev?.lessons_attended || 0) + (dev?.lessons_missed || 0)}</p>
          <p className="text-xs text-muted-foreground">Lessons Attended</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
          className="bg-card border border-border rounded-2xl p-4 text-center">
          <Trophy className="w-5 h-5 mx-auto mb-2 text-amber-500" />
          <p className="text-2xl font-display text-foreground">{lifetimeRate}%</p>
          <p className="text-xs text-muted-foreground">Lifetime Completion</p>
        </motion.div>
      </div>

      {/* Weekly Drill Compliance */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-display text-foreground mb-4 flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4 text-primary" /> Weekly Drill Compliance
        </h3>
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-muted-foreground">Completed vs Assigned</span>
          <span className="font-display text-foreground">{weeklyCompliance}%</span>
        </div>
        <Progress value={weeklyCompliance} className="h-3 mb-4" />
        <p className="text-xs text-muted-foreground">
          {weeklyCompliance >= 80 ? "🎯 Great compliance! Your athlete is staying on track with their assignments."
            : weeklyCompliance >= 50 ? "⚡ Decent effort. Encourage completing all assigned drills for maximum progress."
            : homework?.assigned_this_week === 0 ? "No drills assigned this week."
            : "⚠️ Low completion rate. Consistent drill work is key to development."}
        </p>
      </motion.div>

      {/* Streak & Activity Log */}
      {checkins.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-display text-foreground mb-4">Activity Streak</h3>
          <div className="flex gap-1 flex-wrap">
            {checkins.slice(0, 14).map((c, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${
                  c.training_completed
                    ? 'bg-green-500/20 text-green-500'
                    : 'bg-secondary text-muted-foreground'
                }`}
                title={`${new Date(c.checkin_date).toLocaleDateString()} — ${c.training_completed ? 'Trained' : 'Rest'}`}
              >
                {c.training_completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : '—'}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">Last 14 days • Green = training completed</p>
        </motion.div>
      )}
    </div>
  );
};

export default ParentTraining;
