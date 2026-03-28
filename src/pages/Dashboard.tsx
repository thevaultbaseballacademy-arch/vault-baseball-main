import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, TrendingUp, Calendar, Dumbbell, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LiveActivityFeed from "@/components/dashboard/LiveActivityFeed";
import SportAwareHeader from "@/components/dashboard/SportAwareHeader";
import WeeklyTipCard from "@/components/dashboard/WeeklyTipCard";
import TrialStatusBanner from "@/components/trial/TrialStatusBanner";
import CertificationDisclaimer from "@/components/legal/CertificationDisclaimer";
import UpcomingLessons from "@/components/dashboard/UpcomingLessons";
import SelectCoachWidget from "@/components/dashboard/SelectCoachWidget";
import CoachAssignmentRequests from "@/components/athlete/CoachAssignmentRequests";
import { PlayerHomeworkChecklist } from "@/components/dashboard/PlayerHomeworkChecklist";
import { LessonFeedbackReport } from "@/components/dashboard/LessonFeedbackReport";
import { AthleteDevScore } from "@/components/dashboard/AthleteDevScore";
import DevelopmentIntelligence from "@/components/intelligence/DevelopmentIntelligence";
import ActivationChecklist from "@/components/dashboard/ActivationChecklist";
import UpsellCards from "@/components/dashboard/UpsellCards";
import { useOnboardingActivation } from "@/hooks/useOnboardingActivation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";

interface CheckinData {
  checkin_date: string;
  mood: number | null;
  energy_level: number | null;
  sleep_hours: number | null;
  sleep_quality: number | null;
  soreness_level: number | null;
  stress_level: number | null;
  training_completed: boolean;
  training_intensity: number | null;
  training_duration_minutes: number | null;
}

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkins, setCheckins] = useState<CheckinData[]>([]);
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(14);
  const navigate = useNavigate();

  // Trigger onboarding activation when user first lands on dashboard
  useOnboardingActivation(user?.id);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        navigate("/auth");
      }
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchCheckins();
    }
  }, [user, timeRange]);

  const fetchCheckins = async () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeRange);

    try {
      const { data, error } = await supabase
        .from('athlete_checkins')
        .select('*')
        .gte('checkin_date', startDate.toISOString().split('T')[0])
        .order('checkin_date', { ascending: true });

      if (error) throw error;
      setCheckins(data || []);
    } catch (error) {
      console.error('Error fetching checkins:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const chartData = checkins.map((c) => ({
    date: formatDate(c.checkin_date),
    mood: c.mood,
    energy: c.energy_level,
    sleep: c.sleep_hours,
    sleepQuality: c.sleep_quality,
    soreness: c.soreness_level,
    stress: c.stress_level,
    trained: c.training_completed ? 1 : 0,
    intensity: c.training_intensity,
    duration: c.training_duration_minutes,
  }));

  const safeAvg = (arr: CheckinData[], key: keyof CheckinData) => {
    const valid = arr.filter(c => c[key] != null && typeof c[key] === "number");
    if (valid.length === 0) return "—";
    return (valid.reduce((sum, c) => sum + (c[key] as number), 0) / valid.length).toFixed(1);
  };

  const stats = {
    totalCheckins: checkins.length,
    trainingDays: checkins.filter((c) => c.training_completed).length,
    avgMood: safeAvg(checkins, "mood"),
    avgEnergy: safeAvg(checkins, "energy_level"),
    avgSleep: safeAvg(checkins, "sleep_hours"),
    totalMinutes: checkins.reduce((sum, c) => sum + (c.training_duration_minutes || 0), 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <TrialStatusBanner />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-7xl mb-4">
          <CertificationDisclaimer variant="compact" />
        </div>
        <div className="container mx-auto px-4 max-w-7xl">
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - 2 columns */}
            <div className="lg:col-span-2">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <SportAwareHeader 
                baseTitle="PROGRESS DASHBOARD" 
                subtitle="Track your training & wellness trends" 
              />
              <div className="flex gap-2">
                {([7, 14, 30] as const).map((days) => (
                  <Button
                    key={days}
                    variant={timeRange === days ? "vault" : "outline"}
                    size="sm"
                    onClick={() => setTimeRange(days)}
                  >
                    {days}D
                  </Button>
                ))}
              </div>
            </div>

            {/* Weekly Tip Card */}
            <WeeklyTipCard />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-accent" />
                  <span className="text-sm text-muted-foreground">Check-ins</span>
                </div>
                <p className="text-2xl font-display text-foreground">{stats.totalCheckins}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Dumbbell className="w-4 h-4 text-accent" />
                  <span className="text-sm text-muted-foreground">Training Days</span>
                </div>
                <p className="text-2xl font-display text-foreground">{stats.trainingDays}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-accent" />
                  <span className="text-sm text-muted-foreground">Avg Mood</span>
                </div>
                <p className="text-2xl font-display text-foreground">{stats.avgMood}/5</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  <span className="text-sm text-muted-foreground">Avg Energy</span>
                </div>
                <p className="text-2xl font-display text-foreground">{stats.avgEnergy}/5</p>
              </div>
            </div>

            {checkins.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-display text-foreground mb-2">No Check-in Data</h2>
                <p className="text-muted-foreground mb-6">
                  Start logging your daily check-ins to see your progress trends.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="vault" onClick={() => navigate("/checkin")}>
                    Log Your First Check-in
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/book-session")}>
                    Book a Lesson
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Mood & Energy Chart */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 className="text-xl font-display text-foreground mb-6">Mood & Energy Trends</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="date" 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis 
                          domain={[1, 5]} 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="mood"
                          stroke="hsl(var(--accent))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--accent))", strokeWidth: 0, r: 4 }}
                          name="Mood"
                        />
                        <Line
                          type="monotone"
                          dataKey="energy"
                          stroke="hsl(220 70% 50%)"
                          strokeWidth={2}
                          dot={{ fill: "hsl(220 70% 50%)", strokeWidth: 0, r: 4 }}
                          name="Energy"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-accent" />
                      <span className="text-sm text-muted-foreground">Mood</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(220 70% 50%)" }} />
                      <span className="text-sm text-muted-foreground">Energy</span>
                    </div>
                  </div>
                </div>

                {/* Sleep & Recovery Chart */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 className="text-xl font-display text-foreground mb-6">Sleep & Recovery</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="date" 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="sleep"
                          stroke="hsl(260 60% 50%)"
                          fill="hsl(260 60% 50% / 0.2)"
                          strokeWidth={2}
                          name="Sleep (hrs)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Training Activity */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 className="text-xl font-display text-foreground mb-6">Training Activity</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="date" 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar
                          dataKey="duration"
                          fill="hsl(var(--accent))"
                          radius={[4, 4, 0, 0]}
                          name="Duration (min)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Stress & Soreness */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 className="text-xl font-display text-foreground mb-6">Stress & Soreness</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="date" 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis 
                          domain={[1, 5]} 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="stress"
                          stroke="hsl(0 70% 50%)"
                          strokeWidth={2}
                          dot={{ fill: "hsl(0 70% 50%)", strokeWidth: 0, r: 4 }}
                          name="Stress"
                        />
                        <Line
                          type="monotone"
                          dataKey="soreness"
                          stroke="hsl(30 80% 50%)"
                          strokeWidth={2}
                          dot={{ fill: "hsl(30 80% 50%)", strokeWidth: 0, r: 4 }}
                          name="Soreness"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(0 70% 50%)" }} />
                      <span className="text-sm text-muted-foreground">Stress</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(30 80% 50%)" }} />
                      <span className="text-sm text-muted-foreground">Soreness</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
            </div>

            {/* Sidebar - Live Activity Feed */}
            <div className="lg:col-span-1 space-y-6">
              <div className="sticky top-24 space-y-6">
                {user && <ActivationChecklist userId={user.id} />}
                {user && <UpsellCards userId={user.id} />}
                {user && <DevelopmentIntelligence userId={user.id} />}
                {user && <AthleteDevScore userId={user.id} />}
                {user && <SelectCoachWidget userId={user.id} />}
                {user && <CoachAssignmentRequests userId={user.id} />}
                {user && <UpcomingLessons userId={user.id} />}
                {user && <PlayerHomeworkChecklist userId={user.id} />}
                {user && <LessonFeedbackReport userId={user.id} />}
                <LiveActivityFeed />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
