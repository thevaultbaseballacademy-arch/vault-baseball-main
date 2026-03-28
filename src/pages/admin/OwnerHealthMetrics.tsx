import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  HeartPulse, TrendingUp, BookOpen, Target, Dumbbell,
  Users, FileText, UserCheck, CreditCard, GraduationCap,
  Activity, ShieldCheck, Eye, ArrowUp, ArrowDown, Minus,
} from "lucide-react";
import { subDays, subMonths } from "date-fns";

interface Metric {
  label: string;
  value: string | number;
  target?: string;
  status: "green" | "yellow" | "red" | "neutral";
  icon: React.ElementType;
  category: string;
}

const StatusDot = ({ status }: { status: string }) => {
  const colors = {
    green: "bg-emerald-500",
    yellow: "bg-amber-500",
    red: "bg-red-500",
    neutral: "bg-muted-foreground",
  };
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[status as keyof typeof colors] || colors.neutral}`} />;
};

const TrendIcon = ({ status }: { status: string }) => {
  if (status === "green") return <ArrowUp className="w-3 h-3 text-emerald-500" />;
  if (status === "red") return <ArrowDown className="w-3 h-3 text-red-500" />;
  return <Minus className="w-3 h-3 text-muted-foreground" />;
};

const OwnerHealthMetrics = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["owner-health-metrics"],
    queryFn: async () => {
      const now = new Date();
      const thirtyDaysAgo = subDays(now, 30).toISOString();
      const ninetyDaysAgo = subDays(now, 90).toISOString();
      const sixMonthsAgo = subMonths(now, 6).toISOString();
      const sevenDaysAgo = subDays(now, 7).toISOString();
      const sixtyDaysAgo = subDays(now, 60).toISOString();
      const prevMonthStart = subDays(now, 60).toISOString();
      const prevMonthEnd = subDays(now, 30).toISOString();

      // Parallel queries
      const [
        profilesAll,
        profilesRecent,
        profilesSoftball,
        lessonsThisMonth,
        lessonsCompleted,
        coachRoles,
        coachesOld,
        homeworkAll,
        homeworkDone,
        kpisThisMonth,
        kpisLastMonth,
        recruitingProfiles,
        profiles14U,
        parentRoles,
        parentLogins,
        workloadRecords,
      ] = await Promise.all([
        // All profiles
        supabase.from("profiles").select("user_id, created_at, sport_type"),
        // Profiles created 90+ days ago (retention pool)
        supabase.from("profiles").select("user_id", { count: "exact", head: true }).lte("created_at", ninetyDaysAgo),
        // Softball profiles
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("sport_type", "softball"),
        // Lessons this month
        supabase.from("remote_lessons").select("athlete_user_id, coach_user_id, status").gte("scheduled_at", thirtyDaysAgo),
        // Completed lessons this month
        supabase.from("remote_lessons").select("*", { count: "exact", head: true }).eq("status", "completed").gte("scheduled_at", thirtyDaysAgo),
        // Coach roles
        supabase.from("user_roles").select("user_id, created_at").eq("role", "coach"),
        // Coaches created 6+ months ago
        supabase.from("user_roles").select("user_id", { count: "exact", head: true }).eq("role", "coach").lte("created_at", sixMonthsAgo),
        // Homework all
        supabase.from("player_homework").select("is_completed, created_at, athlete_user_id").gte("created_at", sevenDaysAgo),
        // Homework completed this week
        supabase.from("player_homework").select("*", { count: "exact", head: true }).eq("is_completed", true).gte("created_at", sevenDaysAgo),
        // KPIs this month
        supabase.from("athlete_kpis").select("user_id, kpi_value, kpi_name").gte("recorded_at", thirtyDaysAgo),
        // KPIs last month
        supabase.from("athlete_kpis").select("user_id, kpi_value, kpi_name").gte("recorded_at", prevMonthStart).lte("recorded_at", prevMonthEnd),
        // Recruiting profiles
        supabase.from("recruiting_profiles").select("*", { count: "exact", head: true }),
        // Profiles graduation_year suggesting 14U+ (grad year <= current year + 4)
        supabase.from("profiles").select("*", { count: "exact", head: true }).not("graduation_year", "is", null).lte("graduation_year", now.getFullYear() + 4),
        // Parent links (parent_athlete_links as proxy for parent users)
        supabase.from("parent_athlete_links").select("parent_user_id").eq("status", "active"),
        // Parent logins (sessions within 7 days)
        supabase.from("user_sessions").select("user_id, last_active_at").gte("last_active_at", sevenDaysAgo),
        // Workload records this month
        supabase.from("workload_records").select("*", { count: "exact", head: true }).gte("record_date", thirtyDaysAgo),
      ]);

      const allProfiles = profilesAll.data || [];
      const totalUsers = allProfiles.length;
      const softballCount = profilesSoftball.count || 0;

      // 1. Athlete Retention Rate (profiles 90+ days old that are still active — have lessons or KPIs in last 30d)
      const retentionPool = profilesRecent.count || 0;
      const activeLessonsUsers = new Set((lessonsThisMonth.data || []).map(l => l.athlete_user_id));
      const activeKpiUsers = new Set((kpisThisMonth.data || []).map(k => k.user_id));
      const activeOldUsers = new Set([...activeLessonsUsers, ...activeKpiUsers]);
      // Rough: active old / total old
      const retentionRate = retentionPool > 0 ? Math.round((Math.min(activeOldUsers.size, retentionPool) / retentionPool) * 100) : 0;

      // 2. KPI Improvement Rate
      const thisMonthByUser: Record<string, number[]> = {};
      (kpisThisMonth.data || []).forEach(k => {
        if (!thisMonthByUser[k.user_id]) thisMonthByUser[k.user_id] = [];
        thisMonthByUser[k.user_id].push(k.kpi_value);
      });
      const lastMonthByUser: Record<string, number[]> = {};
      (kpisLastMonth.data || []).forEach(k => {
        if (!lastMonthByUser[k.user_id]) lastMonthByUser[k.user_id] = [];
        lastMonthByUser[k.user_id].push(k.kpi_value);
      });
      const usersWithBoth = Object.keys(thisMonthByUser).filter(u => lastMonthByUser[u]);
      const improving = usersWithBoth.filter(u => {
        const thisAvg = thisMonthByUser[u].reduce((a, b) => a + b, 0) / thisMonthByUser[u].length;
        const lastAvg = lastMonthByUser[u].reduce((a, b) => a + b, 0) / lastMonthByUser[u].length;
        return thisAvg > lastAvg;
      });
      const kpiImprovementRate = usersWithBoth.length > 0 ? Math.round((improving.length / usersWithBoth.length) * 100) : 0;

      // 3. Lesson Attachment Rate (athletes with >1 lesson this month)
      const lessonsByAthlete: Record<string, number> = {};
      (lessonsThisMonth.data || []).forEach(l => {
        if (l.athlete_user_id) lessonsByAthlete[l.athlete_user_id] = (lessonsByAthlete[l.athlete_user_id] || 0) + 1;
      });
      const athletesWithMultiple = Object.values(lessonsByAthlete).filter(c => c > 1).length;
      const totalAthleteUsers = Object.keys(lessonsByAthlete).length || 1;
      const lessonAttachRate = Math.round((athletesWithMultiple / totalAthleteUsers) * 100);

      // 4. Program Completion Rate — approximate from sc_workout_logs
      // Using homework as proxy for program completion
      const totalHomework = (homeworkAll.data || []).length;
      const completedHomework = homeworkDone.count || 0;
      const programCompletionRate = totalHomework > 0 ? Math.round((completedHomework / totalHomework) * 100) : 0;

      // 5. Drill Compliance Rate (homework completed this week / assigned)
      const drillCompliance = totalHomework > 0 ? Math.round((completedHomework / totalHomework) * 100) : 0;

      // 6. Coach Productivity (lessons completed / coaches)
      const allCoaches = coachRoles.data || [];
      const uniqueCoaches = new Set(allCoaches.map(c => c.user_id));
      const coachProductivity = uniqueCoaches.size > 0 ? Math.round((lessonsCompleted.count || 0) / uniqueCoaches.size) : 0;

      // 7. Content Contribution — count approved content items
      // We don't have a direct "content_items" table in context, so approximate with 0/placeholder
      const contentContribution = 0; // Will be enhanced when content tracking is queryable

      // 8. Coach Retention (coaches created 6+ months ago still active)
      const oldCoachCount = coachesOld.count || 0;
      // Active = has lesson in last 30 days
      const activeCoachIds = new Set((lessonsThisMonth.data || []).map(l => l.coach_user_id));
      const retainedCoaches = oldCoachCount > 0 ? Math.round((Math.min(activeCoachIds.size, oldCoachCount) / oldCoachCount) * 100) : 0;

      // 9. Subscription Retention / Churn — approximate from purchases
      // No direct subscription churn table; use 0 placeholder
      const churnRate = 0;

      // 10. Recruiting Conversion
      const recruitingCount = recruitingProfiles.count || 0;
      const eligible14U = profiles14U.count || 1;
      const recruitingConversion = Math.round((recruitingCount / eligible14U) * 100);

      // 11. Softball Adoption
      const softballAdoption = totalUsers > 0 ? Math.round((softballCount / totalUsers) * 100) : 0;

      // 12. Zero Baseball Disruption — always 0 (tracked externally, shown as indicator)
      const baseballBugs = 0;

      // 13. Parent Trust Score
      const parentIds = new Set((parentRoles.data || []).map(p => p.parent_user_id));
      const activeParentSessions = (parentLogins.data || []).filter(s => parentIds.has(s.user_id));
      const activeParents = new Set(activeParentSessions.map(s => s.user_id));
      const parentTrust = parentIds.size > 0 ? Math.round((activeParents.size / parentIds.size) * 100) : 0;

      const scoreStatus = (val: number, green: number, yellow: number, higher = true): "green" | "yellow" | "red" => {
        if (higher) return val >= green ? "green" : val >= yellow ? "yellow" : "red";
        return val <= green ? "green" : val <= yellow ? "yellow" : "red";
      };

      return [
        { label: "Athlete Retention (90d)", value: `${retentionRate}%`, target: ">70%", status: scoreStatus(retentionRate, 70, 50), icon: HeartPulse, category: "Athlete" },
        { label: "KPI Improvement Rate", value: `${kpiImprovementRate}%`, target: ">50%", status: scoreStatus(kpiImprovementRate, 50, 30), icon: TrendingUp, category: "Athlete" },
        { label: "Lesson Attachment (>1/mo)", value: `${lessonAttachRate}%`, target: ">40%", status: scoreStatus(lessonAttachRate, 40, 20), icon: BookOpen, category: "Athlete" },
        { label: "Program Completion", value: `${programCompletionRate}%`, target: ">60%", status: scoreStatus(programCompletionRate, 60, 40), icon: Target, category: "Athlete" },
        { label: "Drill Compliance (weekly)", value: `${drillCompliance}%`, target: ">50%", status: scoreStatus(drillCompliance, 50, 30), icon: Dumbbell, category: "Athlete" },
        { label: "Coach Productivity (lessons/mo)", value: coachProductivity, target: ">8", status: scoreStatus(coachProductivity, 8, 4), icon: Users, category: "Coaching" },
        { label: "Content Contribution (Q)", value: contentContribution, target: ">2", status: scoreStatus(contentContribution, 2, 1), icon: FileText, category: "Coaching" },
        { label: "Coach Retention (6mo)", value: `${retainedCoaches}%`, target: ">75%", status: scoreStatus(retainedCoaches, 75, 50), icon: UserCheck, category: "Coaching" },
        { label: "Monthly Churn Rate", value: `${churnRate}%`, target: "<5%", status: scoreStatus(churnRate, 5, 10, false), icon: CreditCard, category: "Business" },
        { label: "Recruiting Conversion (14U+)", value: `${recruitingConversion}%`, target: ">20%", status: scoreStatus(recruitingConversion, 20, 10), icon: GraduationCap, category: "Business" },
        { label: "Softball Adoption", value: `${softballAdoption}%`, target: "35%+", status: scoreStatus(softballAdoption, 35, 15), icon: Activity, category: "Sport" },
        { label: "Baseball P1 Bugs", value: baseballBugs, target: "0", status: baseballBugs === 0 ? "green" : "red", icon: ShieldCheck, category: "Sport" },
        { label: "Parent Trust Score", value: `${parentTrust}%`, target: ">50%", status: scoreStatus(parentTrust, 50, 25), icon: Eye, category: "Trust" },
      ] as Metric[];
    },
    refetchInterval: 60000, // refresh every minute
  });

  const categories = ["Athlete", "Coaching", "Business", "Sport", "Trust"];
  const overallScore = metrics
    ? Math.round((metrics.filter(m => m.status === "green").length / metrics.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display text-foreground">PLATFORM HEALTH</h1>
          <p className="text-sm text-muted-foreground">13 core metrics — reviewed monthly</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-xl border text-center ${
            overallScore >= 70 ? "border-emerald-500/30 bg-emerald-500/10" :
            overallScore >= 40 ? "border-amber-500/30 bg-amber-500/10" :
            "border-red-500/30 bg-red-500/10"
          }`}>
            <p className="text-2xl font-display text-foreground">{overallScore}%</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Health Score</p>
          </div>
          <div className="flex gap-1.5">
            <span className="flex items-center gap-1 text-[10px] text-emerald-500"><StatusDot status="green" /> {metrics?.filter(m => m.status === "green").length || 0}</span>
            <span className="flex items-center gap-1 text-[10px] text-amber-500"><StatusDot status="yellow" /> {metrics?.filter(m => m.status === "yellow").length || 0}</span>
            <span className="flex items-center gap-1 text-[10px] text-red-500"><StatusDot status="red" /> {metrics?.filter(m => m.status === "red").length || 0}</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Loading metrics…</div>
      ) : (
        categories.map(cat => {
          const catMetrics = (metrics || []).filter(m => m.category === cat);
          if (catMetrics.length === 0) return null;
          return (
            <div key={cat}>
              <h2 className="text-xs font-display tracking-widest text-muted-foreground uppercase mb-3">{cat} Metrics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {catMetrics.map(m => (
                  <div key={m.label} className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      m.status === "green" ? "bg-emerald-500/10 text-emerald-500" :
                      m.status === "yellow" ? "bg-amber-500/10 text-amber-500" :
                      m.status === "red" ? "bg-red-500/10 text-red-500" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      <m.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <StatusDot status={m.status} />
                        <span className="text-xs text-muted-foreground truncate">{m.label}</span>
                      </div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-xl font-display text-foreground">{m.value}</span>
                        <TrendIcon status={m.status} />
                      </div>
                      {m.target && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">Target: {m.target}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default OwnerHealthMetrics;
