import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Loader2, Zap, Dumbbell, Shuffle, Heart, Target,
  TrendingUp, TrendingDown, Minus, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TrialStatusBanner from "@/components/trial/TrialStatusBanner";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

interface PillarScore {
  pillar: string;
  fullName: string;
  score: number;
  trend: "up" | "down" | "stable";
  icon: any;
  color: string;
  bgColor: string;
  metrics: { name: string; value: string; change?: string }[];
}

const VaultDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkinData, setCheckinData] = useState<any[]>([]);
  const navigate = useNavigate();

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
      fetchCheckinData();
    }
  }, [user]);

  const fetchCheckinData = async () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    try {
      const { data, error } = await supabase
        .from('athlete_checkins')
        .select('*')
        .gte('checkin_date', startDate.toISOString().split('T')[0])
        .order('checkin_date', { ascending: true });

      if (error) throw error;
      setCheckinData(data || []);
    } catch (error) {
      console.error('Error fetching checkins:', error);
    }
  };

  // Calculate pillar scores based on check-in data
  const calculatePillarScores = (): PillarScore[] => {
    const recentCheckins = checkinData.slice(-14);
    
    // Velocity - based on training intensity and completion
    const velocityScore = recentCheckins.length > 0
      ? Math.min(100, (recentCheckins.filter(c => c.training_completed && c.training_intensity >= 7).length / recentCheckins.length) * 100 + 40)
      : 50;

    // Athleticism - based on training frequency and duration
    const athleticismScore = recentCheckins.length > 0
      ? Math.min(100, (recentCheckins.filter(c => c.training_completed).length / 14) * 100 + 20)
      : 40;

    // Utility - based on variety of training types (placeholder)
    const utilityScore = recentCheckins.length > 0
      ? Math.min(100, new Set(recentCheckins.map(c => c.training_type).filter(Boolean)).size * 15 + 30)
      : 45;

    // Longevity - based on recovery metrics (sleep, soreness, energy)
    const avgSleep = recentCheckins.length > 0
      ? recentCheckins.reduce((sum, c) => sum + (c.sleep_hours || 0), 0) / recentCheckins.filter(c => c.sleep_hours).length
      : 7;
    const avgSoreness = recentCheckins.length > 0
      ? recentCheckins.reduce((sum, c) => sum + (c.soreness_level || 3), 0) / recentCheckins.filter(c => c.soreness_level).length
      : 3;
    const longevityScore = Math.min(100, (avgSleep / 8) * 50 + ((5 - avgSoreness) / 4) * 50);

    // Transfer - based on consistency and training completion rate
    const transferScore = recentCheckins.length > 0
      ? Math.min(100, (recentCheckins.filter(c => c.training_completed).length / recentCheckins.length) * 80 + 20)
      : 35;

    return [
      {
        pillar: "V",
        fullName: "Velocity",
        score: Math.round(velocityScore),
        trend: velocityScore > 60 ? "up" : velocityScore < 40 ? "down" : "stable",
        icon: Zap,
        color: "text-red-500",
        bgColor: "bg-red-500/10",
        metrics: [
          { name: "High Intensity Sessions", value: `${recentCheckins.filter(c => c.training_intensity >= 7).length}`, change: "+2" },
          { name: "Avg Intensity", value: recentCheckins.length > 0 ? (recentCheckins.reduce((s, c) => s + (c.training_intensity || 0), 0) / recentCheckins.filter(c => c.training_intensity).length).toFixed(1) : "—" },
        ],
      },
      {
        pillar: "A",
        fullName: "Athleticism",
        score: Math.round(athleticismScore),
        trend: athleticismScore > 60 ? "up" : athleticismScore < 40 ? "down" : "stable",
        icon: Dumbbell,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        metrics: [
          { name: "Training Days", value: `${recentCheckins.filter(c => c.training_completed).length}/14` },
          { name: "Total Minutes", value: `${recentCheckins.reduce((s, c) => s + (c.training_duration_minutes || 0), 0)}` },
        ],
      },
      {
        pillar: "U",
        fullName: "Utility",
        score: Math.round(utilityScore),
        trend: "stable",
        icon: Shuffle,
        color: "text-green-500",
        bgColor: "bg-green-500/10",
        metrics: [
          { name: "Training Variety", value: `${new Set(recentCheckins.map(c => c.training_type).filter(Boolean)).size} types` },
          { name: "Skill Focus", value: "Multi-position" },
        ],
      },
      {
        pillar: "L",
        fullName: "Longevity",
        score: Math.round(longevityScore),
        trend: longevityScore > 70 ? "up" : longevityScore < 50 ? "down" : "stable",
        icon: Heart,
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
        metrics: [
          { name: "Avg Sleep", value: `${avgSleep.toFixed(1)} hrs` },
          { name: "Avg Soreness", value: `${avgSoreness.toFixed(1)}/5` },
        ],
      },
      {
        pillar: "T",
        fullName: "Transfer",
        score: Math.round(transferScore),
        trend: transferScore > 60 ? "up" : transferScore < 40 ? "down" : "stable",
        icon: Target,
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
        metrics: [
          { name: "Completion Rate", value: recentCheckins.length > 0 ? `${Math.round((recentCheckins.filter(c => c.training_completed).length / recentCheckins.length) * 100)}%` : "—" },
          { name: "Consistency", value: recentCheckins.length >= 10 ? "Good" : "Building" },
        ],
      },
    ];
  };

  const pillarScores = calculatePillarScores();
  const overallScore = Math.round(pillarScores.reduce((sum, p) => sum + p.score, 0) / 5);

  const radarData = pillarScores.map(p => ({
    pillar: p.pillar,
    score: p.score,
    fullMark: 100,
  }));

  const TrendIcon = ({ trend }: { trend: "up" | "down" | "stable" }) => {
    if (trend === "up") return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === "down") return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
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
        <div className="container mx-auto px-4 max-w-6xl">
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-display text-foreground mb-1">
                  VAULT™ DASHBOARD
                </h1>
                <p className="text-muted-foreground">Your performance across all five pillars</p>
              </div>
              <Link to="/checkin">
                <Button variant="vault">
                  Daily Check-in
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            {/* Overall Score & Radar */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="text-center mb-6">
                  <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">Overall VAULT™ Score</p>
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="hsl(var(--secondary))"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="hsl(var(--accent))"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${(overallScore / 100) * 352} 352`}
                      />
                    </svg>
                    <span className="absolute text-4xl font-display text-foreground">{overallScore}</span>
                  </div>
                  <p className="text-muted-foreground mt-2">
                    {overallScore >= 70 ? "Excellent" : overallScore >= 50 ? "Good Progress" : "Keep Building"}
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-secondary">
                    <p className="text-xs text-muted-foreground mb-1">Check-ins (30d)</p>
                    <p className="text-2xl font-display text-foreground">{checkinData.length}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary">
                    <p className="text-xs text-muted-foreground mb-1">Training Days</p>
                    <p className="text-2xl font-display text-foreground">
                      {checkinData.filter(c => c.training_completed).length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Radar Chart */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-lg font-display text-foreground mb-4">Pillar Balance</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis 
                        dataKey="pillar" 
                        tick={{ fill: "hsl(var(--foreground))", fontSize: 14, fontFamily: "var(--font-display)" }}
                      />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 100]} 
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                      />
                      <Radar
                        name="Score"
                        dataKey="score"
                        stroke="hsl(var(--accent))"
                        fill="hsl(var(--accent))"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Pillar Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {pillarScores.map((pillar, index) => {
                const Icon = pillar.icon;
                return (
                  <motion.div
                    key={pillar.pillar}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card border border-border rounded-2xl p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl ${pillar.bgColor} flex items-center justify-center`}>
                        <span className={`text-xl font-display ${pillar.color}`}>{pillar.pillar}</span>
                      </div>
                      <TrendIcon trend={pillar.trend} />
                    </div>
                    
                    <h3 className="text-sm font-medium text-foreground mb-1">{pillar.fullName}</h3>
                    
                    <div className="flex items-end gap-2 mb-3">
                      <span className="text-3xl font-display text-foreground">{pillar.score}</span>
                      <span className="text-sm text-muted-foreground mb-1">/100</span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-2 rounded-full bg-secondary overflow-hidden mb-4">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pillar.score}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className={`h-full rounded-full bg-gradient-to-r ${
                          pillar.pillar === "V" ? "from-red-500 to-orange-500" :
                          pillar.pillar === "A" ? "from-blue-500 to-cyan-500" :
                          pillar.pillar === "U" ? "from-green-500 to-emerald-500" :
                          pillar.pillar === "L" ? "from-amber-500 to-yellow-500" :
                          "from-purple-500 to-pink-500"
                        }`}
                      />
                    </div>

                    {/* Metrics */}
                    <div className="space-y-2">
                      {pillar.metrics.map((metric) => (
                        <div key={metric.name} className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{metric.name}</span>
                          <span className="text-foreground font-medium">{metric.value}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Call to Action */}
            {checkinData.length < 7 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 rounded-2xl p-6 text-center"
              >
                <h3 className="text-lg font-display text-foreground mb-2">Build Your VAULT™ Profile</h3>
                <p className="text-muted-foreground mb-4">
                  Complete daily check-ins to see accurate pillar scores. More data = better insights.
                </p>
                <Link to="/checkin">
                  <Button variant="vault">
                    Log Today's Check-in
                  </Button>
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VaultDashboard;
