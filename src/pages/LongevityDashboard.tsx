import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Heart, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Shield,
  Zap,
  Moon,
  AlertTriangle,
  CheckCircle2,
  Clock
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line
} from "recharts";

interface CheckinData {
  id: string;
  checkin_date: string;
  training_completed: boolean | null;
  training_intensity: number | null;
  training_duration_minutes: number | null;
  sleep_hours: number | null;
  sleep_quality: number | null;
  soreness_level: number | null;
  energy_level: number | null;
  stress_level: number | null;
  mood: number | null;
}

interface DailyMetrics {
  date: string;
  workload: number;
  recovery: number;
  availability: number;
  acuteLoad: number;
  chronicLoad: number;
}

const LongevityDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkins, setCheckins] = useState<CheckinData[]>([]);
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetrics[]>([]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      fetchCheckins(session.user.id);
    };
    getUser();
  }, [navigate]);

  const fetchCheckins = async (userId: string) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from("athlete_checkins")
      .select("*")
      .eq("user_id", userId)
      .gte("checkin_date", thirtyDaysAgo.toISOString().split("T")[0])
      .order("checkin_date", { ascending: true });

    if (!error && data) {
      setCheckins(data);
      calculateMetrics(data);
    }
    setLoading(false);
  };

  const calculateMetrics = (data: CheckinData[]) => {
    const metrics: DailyMetrics[] = [];
    
    data.forEach((checkin, index) => {
      // Workload = intensity * duration (normalized to 0-100)
      const intensity = checkin.training_intensity || 0;
      const duration = checkin.training_duration_minutes || 0;
      const rawWorkload = (intensity * duration) / 10; // Scale down
      const workload = Math.min(100, rawWorkload);

      // Recovery score (average of sleep quality, inverse soreness, energy)
      const sleepScore = (checkin.sleep_quality || 5) * 10;
      const sorenessScore = (10 - (checkin.soreness_level || 5)) * 10;
      const energyScore = (checkin.energy_level || 5) * 10;
      const stressScore = (10 - (checkin.stress_level || 5)) * 10;
      const recovery = Math.round((sleepScore + sorenessScore + energyScore + stressScore) / 4);

      // Availability (based on recovery and soreness thresholds)
      let availability = 100;
      if ((checkin.soreness_level || 0) >= 8) availability -= 40;
      else if ((checkin.soreness_level || 0) >= 6) availability -= 20;
      if ((checkin.sleep_quality || 10) <= 4) availability -= 20;
      if ((checkin.energy_level || 10) <= 3) availability -= 20;
      availability = Math.max(0, availability);

      // Acute/Chronic Load (simplified rolling averages)
      const last7Days = data.slice(Math.max(0, index - 6), index + 1);
      const last28Days = data.slice(Math.max(0, index - 27), index + 1);
      
      const acuteLoad = last7Days.reduce((sum, c) => {
        return sum + ((c.training_intensity || 0) * (c.training_duration_minutes || 0) / 10);
      }, 0) / last7Days.length;

      const chronicLoad = last28Days.reduce((sum, c) => {
        return sum + ((c.training_intensity || 0) * (c.training_duration_minutes || 0) / 10);
      }, 0) / last28Days.length;

      metrics.push({
        date: new Date(checkin.checkin_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        workload: Math.round(workload),
        recovery: Math.round(recovery),
        availability: Math.round(availability),
        acuteLoad: Math.round(acuteLoad),
        chronicLoad: Math.round(chronicLoad),
      });
    });

    setDailyMetrics(metrics);
  };

  // Current metrics (latest values)
  const currentMetrics = dailyMetrics[dailyMetrics.length - 1] || {
    workload: 0,
    recovery: 0,
    availability: 100,
    acuteLoad: 0,
    chronicLoad: 0,
  };

  // Weekly averages
  const last7Days = dailyMetrics.slice(-7);
  const weeklyAvg = {
    workload: Math.round(last7Days.reduce((sum, m) => sum + m.workload, 0) / (last7Days.length || 1)),
    recovery: Math.round(last7Days.reduce((sum, m) => sum + m.recovery, 0) / (last7Days.length || 1)),
    availability: Math.round(last7Days.reduce((sum, m) => sum + m.availability, 0) / (last7Days.length || 1)),
  };

  // Acute:Chronic Workload Ratio
  const acwr = currentMetrics.chronicLoad > 0 
    ? (currentMetrics.acuteLoad / currentMetrics.chronicLoad).toFixed(2) 
    : "1.00";
  const acwrValue = parseFloat(acwr);
  const acwrStatus = acwrValue < 0.8 ? "undertrained" : acwrValue > 1.5 ? "overreaching" : "optimal";

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous + 5) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (current < previous - 5) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getAvailabilityColor = (value: number) => {
    if (value >= 80) return "text-green-500";
    if (value >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getAvailabilityStatus = (value: number) => {
    if (value >= 80) return { label: "Full Go", color: "bg-green-500/10 text-green-500 border-green-500/20" };
    if (value >= 60) return { label: "Modified", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" };
    return { label: "Limited", color: "bg-red-500/10 text-red-500 border-red-500/20" };
  };

  const chartConfig = {
    workload: { label: "Workload", color: "hsl(var(--primary))" },
    recovery: { label: "Recovery", color: "hsl(142, 76%, 36%)" },
    availability: { label: "Availability", color: "hsl(45, 93%, 47%)" },
    acuteLoad: { label: "Acute Load", color: "hsl(var(--primary))" },
    chronicLoad: { label: "Chronic Load", color: "hsl(var(--muted-foreground))" },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const previousMetrics = dailyMetrics[dailyMetrics.length - 2];
  const availabilityStatus = getAvailabilityStatus(currentMetrics.availability);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-500/10">
              <Heart className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Longevity Dashboard</h1>
              <p className="text-muted-foreground">
                VAULT™ Pillar 4 — Availability & Recovery Systems
              </p>
            </div>
          </div>
        </div>

        {checkins.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">No Check-in Data</h2>
              <p className="text-muted-foreground mb-4">
                Complete daily check-ins to track your recovery and availability metrics.
              </p>
              <Button onClick={() => navigate("/checkin")}>
                Start Check-in
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Availability Status Banner */}
            <Card className="mb-6 border-2" style={{ borderColor: availabilityStatus.color.includes('green') ? 'hsl(142, 76%, 36%)' : availabilityStatus.color.includes('yellow') ? 'hsl(45, 93%, 47%)' : 'hsl(0, 84%, 60%)' }}>
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${availabilityStatus.color}`}>
                      {currentMetrics.availability >= 80 ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : currentMetrics.availability >= 60 ? (
                        <AlertTriangle className="h-6 w-6" />
                      ) : (
                        <Shield className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">
                        Today's Status: <span className={getAvailabilityColor(currentMetrics.availability)}>{availabilityStatus.label}</span>
                      </h2>
                      <p className="text-muted-foreground">
                        {currentMetrics.availability >= 80 
                          ? "All systems go. Full training available."
                          : currentMetrics.availability >= 60
                          ? "Some limitations. Consider modified workload."
                          : "Recovery focus recommended. Limit high-intensity work."}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-4xl font-bold ${getAvailabilityColor(currentMetrics.availability)}`}>
                      {currentMetrics.availability}%
                    </div>
                    <div className="text-sm text-muted-foreground">Availability</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics Grid */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Workload</span>
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{currentMetrics.workload}</span>
                    <span className="text-sm text-muted-foreground">/ 100</span>
                    {previousMetrics && getTrendIcon(currentMetrics.workload, previousMetrics.workload)}
                  </div>
                  <Progress value={currentMetrics.workload} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">7-day avg: {weeklyAvg.workload}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Recovery</span>
                    <Heart className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{currentMetrics.recovery}</span>
                    <span className="text-sm text-muted-foreground">/ 100</span>
                    {previousMetrics && getTrendIcon(currentMetrics.recovery, previousMetrics.recovery)}
                  </div>
                  <Progress value={currentMetrics.recovery} className="mt-2 [&>div]:bg-green-500" />
                  <p className="text-xs text-muted-foreground mt-2">7-day avg: {weeklyAvg.recovery}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">ACWR</span>
                    <Zap className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{acwr}</span>
                    <Badge variant="outline" className={
                      acwrStatus === "optimal" 
                        ? "border-green-500 text-green-500" 
                        : acwrStatus === "undertrained"
                        ? "border-blue-500 text-blue-500"
                        : "border-red-500 text-red-500"
                    }>
                      {acwrStatus}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Acute:Chronic Workload Ratio
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Sweet spot: 0.8 - 1.3
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Sleep Quality</span>
                    <Moon className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">
                      {checkins[checkins.length - 1]?.sleep_quality || 0}
                    </span>
                    <span className="text-sm text-muted-foreground">/ 10</span>
                  </div>
                  <Progress 
                    value={(checkins[checkins.length - 1]?.sleep_quality || 0) * 10} 
                    className="mt-2 [&>div]:bg-indigo-500" 
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {checkins[checkins.length - 1]?.sleep_hours || 0}h logged
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* Workload vs Recovery Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Workload vs Recovery Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[250px]">
                    <AreaChart data={dailyMetrics}>
                      <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area 
                        type="monotone" 
                        dataKey="workload" 
                        stroke="hsl(var(--primary))" 
                        fill="hsl(var(--primary))" 
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="recovery" 
                        stroke="hsl(142, 76%, 36%)" 
                        fill="hsl(142, 76%, 36%)" 
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Availability Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Availability Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[250px]">
                    <BarChart data={dailyMetrics}>
                      <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar 
                        dataKey="availability" 
                        fill="hsl(45, 93%, 47%)" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Acute vs Chronic Load */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg">Acute vs Chronic Load</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Managing the relationship between recent training (acute) and fitness base (chronic)
                </p>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[200px]">
                  <LineChart data={dailyMetrics}>
                    <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="acuteLoad" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="chronicLoad" 
                      stroke="hsl(var(--muted-foreground))" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Recovery Factors Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recovery Factors</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Latest check-in breakdown
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Sleep Quality</span>
                      <span className="text-sm font-medium">
                        {checkins[checkins.length - 1]?.sleep_quality || 0}/10
                      </span>
                    </div>
                    <Progress 
                      value={(checkins[checkins.length - 1]?.sleep_quality || 0) * 10} 
                      className="[&>div]:bg-indigo-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Energy Level</span>
                      <span className="text-sm font-medium">
                        {checkins[checkins.length - 1]?.energy_level || 0}/10
                      </span>
                    </div>
                    <Progress 
                      value={(checkins[checkins.length - 1]?.energy_level || 0) * 10}
                      className="[&>div]:bg-yellow-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Soreness (Low = Good)</span>
                      <span className="text-sm font-medium">
                        {checkins[checkins.length - 1]?.soreness_level || 0}/10
                      </span>
                    </div>
                    <Progress 
                      value={(checkins[checkins.length - 1]?.soreness_level || 0) * 10}
                      className="[&>div]:bg-red-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Stress (Low = Good)</span>
                      <span className="text-sm font-medium">
                        {checkins[checkins.length - 1]?.stress_level || 0}/10
                      </span>
                    </div>
                    <Progress 
                      value={(checkins[checkins.length - 1]?.stress_level || 0) * 10}
                      className="[&>div]:bg-orange-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default LongevityDashboard;
