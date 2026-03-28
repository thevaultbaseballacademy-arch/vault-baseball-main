import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, TrendingUp, Filter, ChevronDown, Users, Target, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface AthleteKPI {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  kpi_name: string;
  kpi_category: string;
  kpi_value: number;
  kpi_unit: string | null;
  recorded_at: string;
  goal_target: number | null;
  goal_progress: number | null;
}

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  value: number;
  unit: string | null;
  rank: number;
  change?: number;
  goal_target?: number | null;
  goal_progress?: number | null;
}

interface CategoryData {
  category: string;
  metrics: string[];
}

const MEDAL_COLORS = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];
const MEDAL_BG = ['bg-yellow-500/10', 'bg-gray-400/10', 'bg-amber-600/10'];

export const KPILeaderboards = ({ coachUserId }: { coachUserId: string }) => {
  const [loading, setLoading] = useState(true);
  const [athletes, setAthletes] = useState<AthleteKPI[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedMetric, setSelectedMetric] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchLeaderboardData();
  }, [coachUserId]);

  const fetchLeaderboardData = async () => {
    try {
      // Get assigned athletes for this coach
      const { data: assignments, error: assignError } = await supabase
        .from('coach_athlete_assignments')
        .select('athlete_user_id')
        .eq('coach_user_id', coachUserId)
        .eq('is_active', true)
        .eq('athlete_approved', true);

      if (assignError) throw assignError;

      const athleteIds = assignments?.map(a => a.athlete_user_id) || [];

      if (athleteIds.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch latest KPIs for assigned athletes
      const { data: kpis, error: kpiError } = await supabase
        .from('athlete_kpis')
        .select('user_id, kpi_name, kpi_category, kpi_value, kpi_unit, recorded_at')
        .in('user_id', athleteIds)
        .order('recorded_at', { ascending: false });

      if (kpiError) throw kpiError;

      // Fetch profiles for these athletes
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', athleteIds);

      if (profileError) throw profileError;

      // Fetch goals for these athletes
      const { data: goals, error: goalError } = await supabase
        .from('athlete_kpi_goals')
        .select('user_id, kpi_name, kpi_category, target_value, is_achieved')
        .in('user_id', athleteIds)
        .eq('is_achieved', false);

      if (goalError) throw goalError;

      // Build the combined data
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      const goalMap = new Map<string, { target: number }>();
      goals?.forEach(g => {
        goalMap.set(`${g.user_id}-${g.kpi_category}-${g.kpi_name}`, { target: g.target_value });
      });

      // Get unique categories and metrics
      const categoryMetrics = new Map<string, Set<string>>();
      kpis?.forEach(k => {
        if (!categoryMetrics.has(k.kpi_category)) {
          categoryMetrics.set(k.kpi_category, new Set());
        }
        categoryMetrics.get(k.kpi_category)?.add(k.kpi_name);
      });

      const categoriesData: CategoryData[] = Array.from(categoryMetrics.entries()).map(([cat, metrics]) => ({
        category: cat,
        metrics: Array.from(metrics)
      }));
      setCategories(categoriesData);

      // Get latest KPI value per athlete per metric
      const latestKPIs = new Map<string, AthleteKPI>();
      kpis?.forEach(k => {
        const key = `${k.user_id}-${k.kpi_category}-${k.kpi_name}`;
        if (!latestKPIs.has(key)) {
          const profile = profileMap.get(k.user_id);
          const goal = goalMap.get(key);
          latestKPIs.set(key, {
            user_id: k.user_id,
            display_name: profile?.display_name || 'Unknown',
            avatar_url: profile?.avatar_url || null,
            kpi_name: k.kpi_name,
            kpi_category: k.kpi_category,
            kpi_value: k.kpi_value,
            kpi_unit: k.kpi_unit,
            recorded_at: k.recorded_at,
            goal_target: goal?.target || null,
            goal_progress: goal?.target ? (k.kpi_value / goal.target) * 100 : null
          });
        }
      });

      setAthletes(Array.from(latestKPIs.values()));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load leaderboard data",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const getLeaderboard = (category: string, metric: string): LeaderboardEntry[] => {
    let filtered = athletes;

    if (category !== 'all') {
      filtered = filtered.filter(a => a.kpi_category === category);
    }
    if (metric !== 'all') {
      filtered = filtered.filter(a => a.kpi_name === metric);
    }

    // Group by metric and sort
    const metricGroups = new Map<string, AthleteKPI[]>();
    filtered.forEach(a => {
      const key = `${a.kpi_category}-${a.kpi_name}`;
      if (!metricGroups.has(key)) {
        metricGroups.set(key, []);
      }
      metricGroups.get(key)?.push(a);
    });

    // For each metric, rank athletes
    const allRanked: LeaderboardEntry[] = [];
    metricGroups.forEach(group => {
      // Sort descending (higher is better for most metrics)
      const sorted = [...group].sort((a, b) => b.kpi_value - a.kpi_value);
      sorted.forEach((athlete, index) => {
        allRanked.push({
          user_id: athlete.user_id,
          display_name: athlete.display_name,
          avatar_url: athlete.avatar_url,
          value: athlete.kpi_value,
          unit: athlete.kpi_unit,
          rank: index + 1,
          goal_target: athlete.goal_target,
          goal_progress: athlete.goal_progress
        });
      });
    });

    // If showing all metrics, sort by rank first, then by value
    return allRanked.sort((a, b) => a.rank - b.rank || b.value - a.value);
  };

  const getTopPerformers = (): { user_id: string; display_name: string; avatar_url: string | null; topRankCount: number }[] => {
    const rankCounts = new Map<string, { display_name: string; avatar_url: string | null; count: number }>();
    
    // Group by metric and count #1 ranks
    const metricGroups = new Map<string, AthleteKPI[]>();
    athletes.forEach(a => {
      const key = `${a.kpi_category}-${a.kpi_name}`;
      if (!metricGroups.has(key)) {
        metricGroups.set(key, []);
      }
      metricGroups.get(key)?.push(a);
    });

    metricGroups.forEach(group => {
      const sorted = [...group].sort((a, b) => b.kpi_value - a.kpi_value);
      if (sorted.length > 0) {
        const winner = sorted[0];
        const current = rankCounts.get(winner.user_id) || { display_name: winner.display_name, avatar_url: winner.avatar_url, count: 0 };
        rankCounts.set(winner.user_id, { ...current, count: current.count + 1 });
      }
    });

    return Array.from(rankCounts.entries())
      .map(([user_id, data]) => ({ user_id, ...data, topRankCount: data.count }))
      .sort((a, b) => b.topRankCount - a.topRankCount)
      .slice(0, 5);
  };

  const getMetricsForCategory = (category: string): string[] => {
    if (category === 'all') {
      return Array.from(new Set(athletes.map(a => a.kpi_name)));
    }
    return categories.find(c => c.category === category)?.metrics || [];
  };

  const availableMetrics = getMetricsForCategory(selectedCategory);
  const leaderboard = getLeaderboard(selectedCategory, selectedMetric);
  const topPerformers = getTopPerformers();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (athletes.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Trophy className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-display text-foreground mb-2">No KPI Data Yet</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Once your assigned athletes start logging their KPIs, you'll see leaderboard rankings here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Performers Summary */}
      <Card className="bg-gradient-to-br from-accent/5 to-transparent border-accent/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Flame className="w-5 h-5 text-accent" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {topPerformers.map((performer, idx) => (
              <motion.div
                key={performer.user_id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl ${idx === 0 ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-secondary'}`}
              >
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center overflow-hidden">
                  {performer.avatar_url ? (
                    <img src={performer.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-medium text-accent">
                      {performer.display_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{performer.display_name}</p>
                  <p className="text-xs text-muted-foreground">{performer.topRankCount} #1 rankings</p>
                </div>
                {idx === 0 && <Trophy className="w-4 h-4 text-yellow-500 ml-1" />}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v); setSelectedMetric('all'); }}>
          <SelectTrigger className="w-full sm:w-48 bg-card border-border">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => (
              <SelectItem key={c.category} value={c.category}>{c.category}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedMetric} onValueChange={setSelectedMetric}>
          <SelectTrigger className="w-full sm:w-48 bg-card border-border">
            <Target className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="All Metrics" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Metrics</SelectItem>
            {availableMetrics.map(m => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Leaderboard Tabs by Category */}
      <Tabs defaultValue="rankings" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="rankings">Rankings</TabsTrigger>
          <TabsTrigger value="goals">Goal Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="rankings" className="space-y-4">
          <Card className="bg-card border-border overflow-hidden">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="w-5 h-5 text-accent" />
                KPI Leaderboard
                <Badge variant="secondary" className="ml-2">{leaderboard.length} entries</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                <AnimatePresence>
                  {leaderboard.slice(0, 20).map((entry, idx) => (
                    <motion.div
                      key={`${entry.user_id}-${idx}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className={`flex items-center gap-4 p-4 ${entry.rank <= 3 ? MEDAL_BG[entry.rank - 1] : ''}`}
                    >
                      {/* Rank */}
                      <div className="w-8 flex-shrink-0">
                        {entry.rank <= 3 ? (
                          <Medal className={`w-6 h-6 ${MEDAL_COLORS[entry.rank - 1]}`} />
                        ) : (
                          <span className="text-lg font-display text-muted-foreground">#{entry.rank}</span>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {entry.avatar_url ? (
                          <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-medium text-accent">
                            {entry.display_name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Name & Value */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{entry.display_name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-display text-accent">{entry.value}</span>
                          {entry.unit && <span className="text-sm text-muted-foreground">{entry.unit}</span>}
                        </div>
                      </div>

                      {/* Goal Progress if exists */}
                      {entry.goal_progress !== null && (
                        <div className="hidden sm:flex flex-col items-end gap-1">
                          <span className="text-xs text-muted-foreground">Goal Progress</span>
                          <div className="flex items-center gap-2">
                            <Progress value={Math.min(entry.goal_progress, 100)} className="w-20 h-2" />
                            <span className="text-xs font-medium text-foreground">{entry.goal_progress.toFixed(0)}%</span>
                          </div>
                        </div>
                      )}

                      {/* Trend indicator */}
                      {entry.rank <= 3 && (
                        <TrendingUp className="w-4 h-4 text-green-500 flex-shrink-0" />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card className="bg-card border-border overflow-hidden">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5 text-accent" />
                Goal Progress Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {leaderboard
                  .filter(e => e.goal_progress !== null)
                  .sort((a, b) => (b.goal_progress || 0) - (a.goal_progress || 0))
                  .slice(0, 15)
                  .map((entry, idx) => (
                    <motion.div
                      key={`goal-${entry.user_id}-${idx}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="flex items-center gap-4 p-4"
                    >
                      <div className="w-8 flex-shrink-0">
                        <span className="text-lg font-display text-muted-foreground">#{idx + 1}</span>
                      </div>

                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {entry.avatar_url ? (
                          <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-medium text-accent">
                            {entry.display_name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{entry.display_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {entry.value} / {entry.goal_target} {entry.unit}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Progress 
                          value={Math.min(entry.goal_progress || 0, 100)} 
                          className="w-24 h-2" 
                        />
                        <span className={`text-sm font-medium ${(entry.goal_progress || 0) >= 100 ? 'text-green-500' : 'text-foreground'}`}>
                          {(entry.goal_progress || 0).toFixed(0)}%
                        </span>
                        {(entry.goal_progress || 0) >= 100 && (
                          <Trophy className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                {leaderboard.filter(e => e.goal_progress !== null).length === 0 && (
                  <div className="p-8 text-center">
                    <Target className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No athletes with active goals yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KPILeaderboards;
