import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Minus, Users, Activity, 
  Moon, Brain, Battery, AlertTriangle, Calendar, FileText, Download, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface AthleteProfile {
  user_id: string;
  display_name: string | null;
  email: string | null;
}

interface CheckinData {
  user_id: string;
  checkin_date: string;
  mood: number | null;
  energy_level: number | null;
  stress_level: number | null;
  sleep_quality: number | null;
  sleep_hours: number | null;
  training_completed: boolean | null;
  training_duration_minutes: number | null;
}

interface WeeklyStats {
  avgMood: number;
  avgEnergy: number;
  avgStress: number;
  avgSleep: number;
  totalCheckins: number;
  totalTrainingSessions: number;
  totalTrainingMinutes: number;
  activeAthletes: number;
  athletesImproved: number;
  athletesDeclined: number;
  athletesStable: number;
}

interface AthleteWeeklyData {
  athlete: AthleteProfile;
  thisWeek: { mood: number; energy: number; checkins: number };
  lastWeek: { mood: number; energy: number; checkins: number };
  trend: 'up' | 'down' | 'stable';
}

export function WeeklySummaryReport() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [athleteData, setAthleteData] = useState<AthleteWeeklyData[]>([]);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const fetchWeeklyData = async () => {
    setLoading(true);
    
    const today = new Date();
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - 7);
    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(today.getDate() - 14);

    try {
      const [athletesResult, checkinsResult] = await Promise.all([
        // Only select user_id and display_name - email is not needed for weekly summary display
        supabase.from('profiles').select('user_id, display_name'),
        supabase
          .from('athlete_checkins')
          .select('user_id, checkin_date, mood, energy_level, stress_level, sleep_quality, sleep_hours, training_completed, training_duration_minutes')
          .gte('checkin_date', lastWeekStart.toISOString().split('T')[0])
          .order('checkin_date', { ascending: true })
      ]);

      if (athletesResult.error || checkinsResult.error) {
        console.error('Error fetching data');
        setLoading(false);
        return;
      }

      const athletes = athletesResult.data as AthleteProfile[];
      const allCheckins = checkinsResult.data as CheckinData[];

      // Split into this week and last week
      const thisWeekCheckins = allCheckins.filter(c => 
        new Date(c.checkin_date) >= thisWeekStart
      );
      const lastWeekCheckins = allCheckins.filter(c => 
        new Date(c.checkin_date) >= lastWeekStart && new Date(c.checkin_date) < thisWeekStart
      );

      // Calculate overall stats for this week
      const validMoods = thisWeekCheckins.filter(c => c.mood !== null);
      const validEnergy = thisWeekCheckins.filter(c => c.energy_level !== null);
      const validStress = thisWeekCheckins.filter(c => c.stress_level !== null);
      const validSleep = thisWeekCheckins.filter(c => c.sleep_quality !== null);

      const avgMood = validMoods.length > 0 
        ? validMoods.reduce((sum, c) => sum + (c.mood || 0), 0) / validMoods.length 
        : 0;
      const avgEnergy = validEnergy.length > 0 
        ? validEnergy.reduce((sum, c) => sum + (c.energy_level || 0), 0) / validEnergy.length 
        : 0;
      const avgStress = validStress.length > 0 
        ? validStress.reduce((sum, c) => sum + (c.stress_level || 0), 0) / validStress.length 
        : 0;
      const avgSleep = validSleep.length > 0 
        ? validSleep.reduce((sum, c) => sum + (c.sleep_quality || 0), 0) / validSleep.length 
        : 0;

      const activeAthleteIds = new Set(thisWeekCheckins.map(c => c.user_id));
      const trainingSessions = thisWeekCheckins.filter(c => c.training_completed);
      const totalTrainingMinutes = trainingSessions.reduce((sum, c) => sum + (c.training_duration_minutes || 0), 0);

      // Calculate per-athlete trends
      let improved = 0, declined = 0, stable = 0;
      const athleteWeeklyData: AthleteWeeklyData[] = [];

      for (const athlete of athletes) {
        const thisWeekAthlete = thisWeekCheckins.filter(c => c.user_id === athlete.user_id);
        const lastWeekAthlete = lastWeekCheckins.filter(c => c.user_id === athlete.user_id);

        if (thisWeekAthlete.length === 0) continue;

        const thisWeekMood = thisWeekAthlete.filter(c => c.mood).reduce((sum, c) => sum + (c.mood || 0), 0) / (thisWeekAthlete.filter(c => c.mood).length || 1);
        const thisWeekEnergy = thisWeekAthlete.filter(c => c.energy_level).reduce((sum, c) => sum + (c.energy_level || 0), 0) / (thisWeekAthlete.filter(c => c.energy_level).length || 1);
        
        const lastWeekMood = lastWeekAthlete.length > 0 
          ? lastWeekAthlete.filter(c => c.mood).reduce((sum, c) => sum + (c.mood || 0), 0) / (lastWeekAthlete.filter(c => c.mood).length || 1)
          : thisWeekMood;
        const lastWeekEnergy = lastWeekAthlete.length > 0
          ? lastWeekAthlete.filter(c => c.energy_level).reduce((sum, c) => sum + (c.energy_level || 0), 0) / (lastWeekAthlete.filter(c => c.energy_level).length || 1)
          : thisWeekEnergy;

        const avgChange = ((thisWeekMood - lastWeekMood) + (thisWeekEnergy - lastWeekEnergy)) / 2;
        let trend: 'up' | 'down' | 'stable' = 'stable';
        
        if (avgChange > 0.3) {
          trend = 'up';
          improved++;
        } else if (avgChange < -0.3) {
          trend = 'down';
          declined++;
        } else {
          stable++;
        }

        athleteWeeklyData.push({
          athlete,
          thisWeek: { mood: thisWeekMood, energy: thisWeekEnergy, checkins: thisWeekAthlete.length },
          lastWeek: { mood: lastWeekMood, energy: lastWeekEnergy, checkins: lastWeekAthlete.length },
          trend
        });
      }

      // Sort by trend (declined first, then stable, then improved)
      athleteWeeklyData.sort((a, b) => {
        const order = { down: 0, stable: 1, up: 2 };
        return order[a.trend] - order[b.trend];
      });

      // Calculate daily averages for chart
      const dailyAverages: any[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayCheckins = thisWeekCheckins.filter(c => c.checkin_date === dateStr);
        
        const dayMood = dayCheckins.filter(c => c.mood).length > 0
          ? dayCheckins.filter(c => c.mood).reduce((sum, c) => sum + (c.mood || 0), 0) / dayCheckins.filter(c => c.mood).length
          : null;
        const dayEnergy = dayCheckins.filter(c => c.energy_level).length > 0
          ? dayCheckins.filter(c => c.energy_level).reduce((sum, c) => sum + (c.energy_level || 0), 0) / dayCheckins.filter(c => c.energy_level).length
          : null;

        dailyAverages.push({
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          mood: dayMood ? Number(dayMood.toFixed(1)) : 0,
          energy: dayEnergy ? Number(dayEnergy.toFixed(1)) : 0,
          checkins: dayCheckins.length
        });
      }

      setStats({
        avgMood,
        avgEnergy,
        avgStress,
        avgSleep,
        totalCheckins: thisWeekCheckins.length,
        totalTrainingSessions: trainingSessions.length,
        totalTrainingMinutes,
        activeAthletes: activeAthleteIds.size,
        athletesImproved: improved,
        athletesDeclined: declined,
        athletesStable: stable
      });

      setAthleteData(athleteWeeklyData);
      setDailyData(dailyAverages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching weekly data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchWeeklyData();
    }
  }, [open]);

  const exportToPDF = async () => {
    if (!reportRef.current || !stats) return;
    
    setExporting(true);
    try {
      // Dynamic imports to avoid build issues
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);
      
      const reportElement = reportRef.current;
      
      // Create canvas from the report element
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      
      // Add title
      pdf.setFontSize(20);
      pdf.text('Weekly Summary Report', pdfWidth / 2, 15, { align: 'center' });
      pdf.setFontSize(10);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pdfWidth / 2, 22, { align: 'center' });
      
      // Add the captured image
      const imgY = 30;
      const scaledHeight = imgHeight * ratio * 0.9;
      
      if (scaledHeight > pdfHeight - imgY - 10) {
        // Content is too tall, scale down more
        const adjustedRatio = (pdfHeight - imgY - 10) / imgHeight;
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * adjustedRatio, imgHeight * adjustedRatio);
      } else {
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio * 0.9, scaledHeight);
      }
      
      // Save the PDF
      const dateStr = new Date().toISOString().split('T')[0];
      pdf.save(`weekly-report-${dateStr}.pdf`);
      
      toast({
        title: 'PDF Exported',
        description: 'Weekly report has been downloaded.',
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: 'Export Failed',
        description: 'Unable to generate PDF. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setExporting(false);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const pieData = stats ? [
    { name: 'Improved', value: stats.athletesImproved },
    { name: 'Stable', value: stats.athletesStable },
    { name: 'Declined', value: stats.athletesDeclined },
  ].filter(d => d.value > 0) : [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          Weekly Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-2xl font-display flex items-center gap-2">
            <Calendar className="h-6 w-6 text-accent" />
            Weekly Summary Report
          </DialogTitle>
          {stats && !loading && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportToPDF}
              disabled={exporting}
              className="gap-2"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export PDF
            </Button>
          )}
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
          </div>
        ) : stats ? (
          <motion.div
            ref={reportRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 bg-background p-4 -m-4"
          >
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-secondary rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-accent" />
                  <span className="text-xs text-muted-foreground">Active Athletes</span>
                </div>
                <p className="text-2xl font-display text-foreground">{stats.activeAthletes}</p>
              </div>
              <div className="bg-secondary rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-accent" />
                  <span className="text-xs text-muted-foreground">Total Check-ins</span>
                </div>
                <p className="text-2xl font-display text-foreground">{stats.totalCheckins}</p>
              </div>
              <div className="bg-secondary rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-accent" />
                  <span className="text-xs text-muted-foreground">Training Sessions</span>
                </div>
                <p className="text-2xl font-display text-foreground">{stats.totalTrainingSessions}</p>
              </div>
              <div className="bg-secondary rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  <span className="text-xs text-muted-foreground">Training Hours</span>
                </div>
                <p className="text-2xl font-display text-foreground">
                  {Math.round(stats.totalTrainingMinutes / 60)}
                </p>
              </div>
            </div>

            {/* Wellness Averages */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="font-medium text-foreground mb-4">Team Wellness Averages</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-muted-foreground">Avg Mood</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={(stats.avgMood / 5) * 100} className="flex-1" />
                    <span className="text-sm font-medium">{stats.avgMood.toFixed(1)}/5</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Battery className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-muted-foreground">Avg Energy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={(stats.avgEnergy / 5) * 100} className="flex-1" />
                    <span className="text-sm font-medium">{stats.avgEnergy.toFixed(1)}/5</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-muted-foreground">Avg Stress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={(stats.avgStress / 5) * 100} className="flex-1" />
                    <span className="text-sm font-medium">{stats.avgStress.toFixed(1)}/5</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Moon className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-muted-foreground">Avg Sleep Quality</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={(stats.avgSleep / 5) * 100} className="flex-1" />
                    <span className="text-sm font-medium">{stats.avgSleep.toFixed(1)}/5</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Daily Trends Chart */}
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-medium text-foreground mb-4">Daily Wellness Trends</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <YAxis domain={[0, 5]} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="mood" fill="hsl(var(--accent))" name="Mood" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="energy" fill="hsl(220 70% 50%)" name="Energy" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Athlete Trends Pie Chart */}
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-medium text-foreground mb-4">Athlete Trends (vs Last Week)</h3>
                <div className="h-48 flex items-center justify-center">
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={
                                entry.name === 'Improved' ? 'hsl(142 76% 36%)' :
                                entry.name === 'Declined' ? 'hsl(0 84% 60%)' :
                                'hsl(var(--muted-foreground))'
                              } 
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted-foreground text-sm">No trend data available</p>
                  )}
                </div>
                <div className="flex justify-center gap-4 mt-2 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span>Improved ({stats.athletesImproved})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                    <span>Stable ({stats.athletesStable})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span>Declined ({stats.athletesDeclined})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Athletes Needing Attention */}
            {athleteData.filter(a => a.trend === 'down').length > 0 && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
                <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Athletes Needing Attention
                </h3>
                <div className="space-y-2">
                  {athleteData.filter(a => a.trend === 'down').map((data) => (
                    <div key={data.athlete.user_id} className="flex items-center justify-between bg-card rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-destructive">
                            {data.athlete.display_name?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {data.athlete.display_name || data.athlete.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {data.thisWeek.checkins} check-ins this week
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Mood</p>
                          <p className="text-foreground">
                            {data.thisWeek.mood.toFixed(1)} 
                            <span className="text-red-500 text-xs ml-1">
                              ({(data.thisWeek.mood - data.lastWeek.mood).toFixed(1)})
                            </span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Energy</p>
                          <p className="text-foreground">
                            {data.thisWeek.energy.toFixed(1)}
                            <span className="text-red-500 text-xs ml-1">
                              ({(data.thisWeek.energy - data.lastWeek.energy).toFixed(1)})
                            </span>
                          </p>
                        </div>
                        {getTrendIcon(data.trend)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Athletes Summary */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-medium text-foreground">All Athletes This Week</h3>
              </div>
              <div className="divide-y divide-border max-h-64 overflow-y-auto">
                {athleteData.map((data) => (
                  <div key={data.athlete.user_id} className="flex items-center justify-between p-3 hover:bg-secondary/50">
                    <div className="flex items-center gap-3">
                      {getTrendIcon(data.trend)}
                      <span className="text-sm text-foreground">
                        {data.athlete.display_name || data.athlete.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Mood: {data.thisWeek.mood.toFixed(1)}</span>
                      <span>Energy: {data.thisWeek.energy.toFixed(1)}</span>
                      <span>{data.thisWeek.checkins} check-ins</span>
                    </div>
                  </div>
                ))}
                {athleteData.length === 0 && (
                  <div className="p-6 text-center text-muted-foreground">
                    No athlete data for this week
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            Unable to load report data
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
