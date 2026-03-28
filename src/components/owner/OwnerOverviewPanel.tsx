import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Crown, Users, DollarSign, TrendingUp, Activity, Zap,
  BarChart3, ShoppingCart, UserCheck, Award, Clock, AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

export const OwnerOverviewPanel = () => {
  // Platform-wide stats
  const { data: platformStats } = useQuery({
    queryKey: ["owner-platform-stats"],
    queryFn: async () => {
      const [
        { count: totalUsers },
        { count: totalCoaches },
        { count: activeTrials },
        { count: totalPurchases },
        { data: recentActivity },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("coaches").select("*", { count: "exact", head: true }).eq("status", "Active"),
        supabase.from("athlete_trials").select("*", { count: "exact", head: true }).eq("trial_active", true),
        supabase.from("user_purchases").select("*", { count: "exact", head: true }).eq("status", "completed"),
        supabase.from("activity_feed").select("*").order("created_at", { ascending: false }).limit(5),
      ]);

      return {
        totalUsers: totalUsers || 0,
        totalCoaches: totalCoaches || 0,
        activeTrials: activeTrials || 0,
        totalPurchases: totalPurchases || 0,
        recentActivity: recentActivity || [],
      };
    },
  });

  // Marketplace revenue
  const { data: marketplaceRevenue } = useQuery({
    queryKey: ["owner-marketplace-revenue"],
    queryFn: async () => {
      const { data } = await supabase
        .from("marketplace_earnings")
        .select("total_amount_cents, platform_fee_cents, coach_amount_cents");

      const totals = data?.reduce(
        (acc, e) => ({
          total: acc.total + (e.total_amount_cents || 0),
          platformFees: acc.platformFees + (e.platform_fee_cents || 0),
          coachPayouts: acc.coachPayouts + (e.coach_amount_cents || 0),
        }),
        { total: 0, platformFees: 0, coachPayouts: 0 }
      ) || { total: 0, platformFees: 0, coachPayouts: 0 };

      return totals;
    },
  });

  // User role distribution
  const { data: roleDistribution } = useQuery({
    queryKey: ["owner-role-distribution"],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role");
      const counts = { admin: 0, coach: 0, athlete: 0 };
      data?.forEach((r) => {
        if (r.role in counts) counts[r.role as keyof typeof counts]++;
      });
      return counts;
    },
  });

  // Certification stats
  const { data: certStats } = useQuery({
    queryKey: ["owner-cert-stats"],
    queryFn: async () => {
      const [
        { count: activeCerts },
        { count: expiringCerts },
      ] = await Promise.all([
        supabase.from("user_certifications").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("admin_certifications").select("*", { count: "exact", head: true }).eq("status", "Expiring"),
      ]);

      return {
        active: activeCerts || 0,
        expiring: expiringCerts || 0,
      };
    },
  });

  const formatCents = (cents: number) => `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center">
          <Crown className="w-7 h-7 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-display text-foreground tracking-wide">COMMAND CENTER</h1>
          <p className="text-muted-foreground">Full platform overview and management</p>
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-primary" />
            <span className="text-sm text-primary font-medium">Total Users</span>
          </div>
          <p className="text-3xl font-display text-foreground">{platformStats?.totalUsers.toLocaleString()}</p>
        </div>
        
        <div className="bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="w-5 h-5 text-accent" />
            <span className="text-sm text-accent font-medium">Active Coaches</span>
          </div>
          <p className="text-3xl font-display text-foreground">{platformStats?.totalCoaches}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            <span className="text-sm text-green-500 font-medium">Platform Revenue</span>
          </div>
          <p className="text-3xl font-display text-foreground">{formatCents(marketplaceRevenue?.platformFees || 0)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-blue-500 font-medium">Total Purchases</span>
          </div>
          <p className="text-3xl font-display text-foreground">{platformStats?.totalPurchases}</p>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role Distribution */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-display text-sm tracking-wider text-muted-foreground mb-4">ROLE DISTRIBUTION</h3>
          <div className="space-y-3">
            {[
              { role: "Admins", count: roleDistribution?.admin || 0, color: "bg-destructive" },
              { role: "Coaches", count: roleDistribution?.coach || 0, color: "bg-primary" },
              { role: "Athletes", count: roleDistribution?.athlete || 0, color: "bg-accent" },
            ].map((item) => (
              <div key={item.role} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm text-foreground">{item.role}</span>
                </div>
                <span className="text-sm font-medium text-foreground">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-display text-sm tracking-wider text-muted-foreground mb-4">CERTIFICATIONS</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-green-500" />
                <span className="text-sm text-foreground">Active</span>
              </div>
              <span className="text-sm font-medium text-green-500">{certStats?.active || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-foreground">Expiring Soon</span>
              </div>
              <span className="text-sm font-medium text-yellow-500">{certStats?.expiring || 0}</span>
            </div>
          </div>
        </div>

        {/* Active Trials */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-display text-sm tracking-wider text-muted-foreground mb-4">TRIAL STATUS</h3>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-display text-foreground">{platformStats?.activeTrials}</p>
              <p className="text-sm text-muted-foreground">Active 22M Trials</p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-display text-lg text-foreground mb-4">MARKETPLACE REVENUE BREAKDOWN</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-secondary/50 rounded-xl">
            <p className="text-2xl font-display text-foreground">{formatCents(marketplaceRevenue?.total || 0)}</p>
            <p className="text-sm text-muted-foreground mt-1">Gross Revenue</p>
          </div>
          <div className="text-center p-4 bg-green-500/10 rounded-xl border border-green-500/20">
            <p className="text-2xl font-display text-green-500">{formatCents(marketplaceRevenue?.platformFees || 0)}</p>
            <p className="text-sm text-muted-foreground mt-1">Platform Fees (30%)</p>
          </div>
          <div className="text-center p-4 bg-accent/10 rounded-xl border border-accent/20">
            <p className="text-2xl font-display text-accent">{formatCents(marketplaceRevenue?.coachPayouts || 0)}</p>
            <p className="text-sm text-muted-foreground mt-1">Coach Payouts (70%)</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-display text-sm tracking-wider text-foreground">RECENT ACTIVITY</h3>
        </div>
        <div className="divide-y divide-border">
          {platformStats?.recentActivity.map((activity: any) => (
            <div key={activity.id} className="p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Activity className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{activity.title}</p>
                <p className="text-xs text-muted-foreground">{activity.description}</p>
              </div>
              <p className="text-xs text-muted-foreground whitespace-nowrap">
                {format(new Date(activity.created_at), "MMM d, h:mm a")}
              </p>
            </div>
          ))}
          {(!platformStats?.recentActivity || platformStats.recentActivity.length === 0) && (
            <div className="p-8 text-center text-muted-foreground">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
