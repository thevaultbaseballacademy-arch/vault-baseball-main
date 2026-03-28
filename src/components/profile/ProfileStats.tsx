import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, Dumbbell, Moon, Zap, Brain } from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";

interface ProfileStatsProps {
  userId: string;
}

interface WeeklyStats {
  avgSleep: number;
  avgEnergy: number;
  avgMood: number;
  totalTrainingMinutes: number;
  checkinsCount: number;
  avgIntensity: number;
}

const ProfileStats = ({ userId }: ProfileStatsProps) => {
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const now = new Date();
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

        const { data: checkins, error } = await supabase
          .from('athlete_checkins')
          .select('*')
          .eq('user_id', userId)
          .gte('checkin_date', format(weekStart, 'yyyy-MM-dd'))
          .lte('checkin_date', format(weekEnd, 'yyyy-MM-dd'));

        if (error) throw error;

        if (!checkins || checkins.length === 0) {
          setStats(null);
          setLoading(false);
          return;
        }

        const avgSleep = checkins.reduce((sum, c) => sum + (Number(c.sleep_hours) || 0), 0) / checkins.length;
        const avgEnergy = checkins.reduce((sum, c) => sum + (c.energy_level || 0), 0) / checkins.length;
        const avgMood = checkins.reduce((sum, c) => sum + (c.mood || 0), 0) / checkins.length;
        const avgIntensity = checkins.filter(c => c.training_intensity).reduce((sum, c) => sum + (c.training_intensity || 0), 0) / (checkins.filter(c => c.training_intensity).length || 1);
        const totalTrainingMinutes = checkins.reduce((sum, c) => sum + (c.training_duration_minutes || 0), 0);

        setStats({
          avgSleep: Math.round(avgSleep * 10) / 10,
          avgEnergy: Math.round(avgEnergy * 10) / 10,
          avgMood: Math.round(avgMood * 10) / 10,
          avgIntensity: Math.round(avgIntensity * 10) / 10,
          totalTrainingMinutes,
          checkinsCount: checkins.length
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No stats available for this week yet.</p>
        </CardContent>
      </Card>
    );
  }

  const statCards = [
    {
      title: "Weekly Check-ins",
      value: stats.checkinsCount,
      unit: "days",
      icon: TrendingUp,
      color: "text-green-400"
    },
    {
      title: "Avg Sleep",
      value: stats.avgSleep,
      unit: "hours",
      icon: Moon,
      color: "text-blue-400"
    },
    {
      title: "Avg Energy",
      value: stats.avgEnergy,
      unit: "/ 10",
      icon: Zap,
      color: "text-yellow-400"
    },
    {
      title: "Avg Mood",
      value: stats.avgMood,
      unit: "/ 10",
      icon: Brain,
      color: "text-purple-400"
    },
    {
      title: "Training Time",
      value: stats.totalTrainingMinutes,
      unit: "mins",
      icon: Dumbbell,
      color: "text-red-400"
    },
    {
      title: "Avg Intensity",
      value: stats.avgIntensity,
      unit: "/ 10",
      icon: TrendingUp,
      color: "text-orange-400"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="border-border bg-card hover:bg-card/80 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">
                    {stat.value}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {stat.unit}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ProfileStats;
