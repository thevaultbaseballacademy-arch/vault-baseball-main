import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Users, BookOpen, Activity } from "lucide-react";

const OwnerAnalytics = () => {
  const { data: lessonStats } = useQuery({
    queryKey: ["owner-lesson-stats"],
    queryFn: async () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
      const [total, completed, cancelled] = await Promise.all([
        supabase.from("remote_lessons").select("*", { count: "exact", head: true }).gte("scheduled_at", thirtyDaysAgo),
        supabase.from("remote_lessons").select("*", { count: "exact", head: true }).eq("status", "completed").gte("scheduled_at", thirtyDaysAgo),
        supabase.from("remote_lessons").select("*", { count: "exact", head: true }).eq("status", "cancelled").gte("scheduled_at", thirtyDaysAgo),
      ]);
      return {
        total: total.count || 0,
        completed: completed.count || 0,
        cancelled: cancelled.count || 0,
        completionRate: total.count ? Math.round(((completed.count || 0) / total.count) * 100) : 0,
      };
    },
  });

  const { data: userStats } = useQuery({
    queryKey: ["owner-user-stats"],
    queryFn: async () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
      const [total, recent, coaches] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
        supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "coach"),
      ]);
      return { total: total.count || 0, newThisMonth: recent.count || 0, coaches: coaches.count || 0 };
    },
  });

  const { data: sportSplit } = useQuery({
    queryKey: ["owner-sport-split"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("sport_type");
      const counts = (data || []).reduce((acc, p) => {
        const sport = p.sport_type || "baseball";
        acc[sport] = (acc[sport] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      return counts;
    },
  });

  const { data: topCoaches = [] } = useQuery({
    queryKey: ["owner-top-coaches"],
    queryFn: async () => {
      const { data } = await supabase
        .from("remote_lessons")
        .select("coach_user_id")
        .eq("status", "completed");

      const counts = (data || []).reduce((acc, l) => {
        acc[l.coach_user_id] = (acc[l.coach_user_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);

      // Get names
      const ids = sorted.map(([id]) => id);
      if (ids.length === 0) return [];
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name").in("user_id", ids);

      return sorted.map(([id, count]) => ({
        name: profiles?.find(p => p.user_id === id)?.display_name || "Unknown",
        count,
      }));
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display text-foreground">ANALYTICS</h1>
        <p className="text-sm text-muted-foreground">Platform-wide metrics</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Users", value: userStats?.total || 0, icon: Users, color: "text-blue-400" },
          { label: "New (30d)", value: userStats?.newThisMonth || 0, icon: Users, color: "text-emerald-400" },
          { label: "Lessons (30d)", value: lessonStats?.total || 0, icon: Activity, color: "text-purple-400" },
          { label: "Completion Rate", value: `${lessonStats?.completionRate || 0}%`, icon: BarChart3, color: "text-amber-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4">
            <Icon className={`w-4 h-4 ${color} mb-1`} />
            <p className="text-xl font-display text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Sport split */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-display text-foreground mb-3">SPORT SPLIT</h2>
          <div className="space-y-3">
            {Object.entries(sportSplit || {}).map(([sport, count]) => {
              const total = Object.values(sportSplit || {}).reduce((a, b) => a + b, 0);
              const pct = total ? Math.round((count / total) * 100) : 0;
              return (
                <div key={sport}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-foreground capitalize">{sport}</span>
                    <span className="text-xs text-muted-foreground">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {Object.keys(sportSplit || {}).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No data</p>
            )}
          </div>
        </div>

        {/* Top coaches */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-display text-foreground mb-3">MOST ACTIVE COACHES</h2>
          <div className="space-y-2">
            {topCoaches.map((coach, i) => (
              <div key={coach.name} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                  <span className="text-sm text-foreground">{coach.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{coach.count} lessons</span>
              </div>
            ))}
            {topCoaches.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No lesson data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerAnalytics;
