import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, Users, FileCheck, Brain, TrendingUp, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OwnerOverview = () => {
  const navigate = useNavigate();

  const { data: userCount = 0 } = useQuery({
    queryKey: ["owner-user-count"],
    queryFn: async () => {
      const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: pendingContent = 0 } = useQuery({
    queryKey: ["owner-pending-content"],
    queryFn: async () => {
      const { count } = await supabase
        .from("content_submissions")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");
      return count || 0;
    },
  });

  const { data: activeRules = 0 } = useQuery({
    queryKey: ["owner-active-rules"],
    queryFn: async () => {
      const { count } = await supabase
        .from("intelligence_rules")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);
      return count || 0;
    },
  });

  const { data: recentLessons = 0 } = useQuery({
    queryKey: ["owner-recent-lessons"],
    queryFn: async () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
      const { count } = await supabase
        .from("remote_lessons")
        .select("*", { count: "exact", head: true })
        .gte("scheduled_at", thirtyDaysAgo);
      return count || 0;
    },
  });

  const { data: deniedAccess = 0 } = useQuery({
    queryKey: ["owner-denied-access"],
    queryFn: async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const { count } = await supabase
        .from("access_denied_logs")
        .select("*", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgo);
      return count || 0;
    },
  });

  const cards = [
    { label: "Total Users", value: userCount, icon: Users, route: "/admin/users", color: "text-blue-400" },
    { label: "Pending Approvals", value: pendingContent, icon: FileCheck, route: "/admin/content/queue", color: "text-amber-400" },
    { label: "Active Rules", value: activeRules, icon: Brain, route: "/admin/intelligence", color: "text-emerald-400" },
    { label: "Lessons (30d)", value: recentLessons, icon: Activity, route: "/admin/analytics", color: "text-purple-400" },
    { label: "Access Denials (7d)", value: deniedAccess, icon: TrendingUp, route: "/admin/audit", color: "text-destructive" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display text-foreground tracking-wide">VAULT OS</h1>
        <p className="text-sm text-muted-foreground">Platform command center</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map(({ label, value, icon: Icon, route, color }) => (
          <button
            key={label}
            onClick={() => navigate(route)}
            className="bg-card border border-border rounded-xl p-4 text-left hover:border-primary/30 transition-colors"
          >
            <Icon className={`w-5 h-5 ${color} mb-2`} />
            <p className="text-2xl font-display text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-display text-foreground mb-3">QUICK ACTIONS</h2>
          <div className="space-y-2">
            {[
              { label: "Review content queue", route: "/admin/content/queue" },
              { label: "Manage users & roles", route: "/admin/users" },
              { label: "View revenue dashboard", route: "/admin/revenue" },
              { label: "Check audit log", route: "/admin/audit" },
            ].map(({ label, route }) => (
              <button
                key={route}
                onClick={() => navigate(route)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                → {label}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-display text-foreground mb-3">SYSTEM STATUS</h2>
          <div className="space-y-3">
            {[
              { label: "Authentication", status: "Operational" },
              { label: "Database", status: "Operational" },
              { label: "Edge Functions", status: "Operational" },
              { label: "Intelligence Engine", status: `${activeRules} rules active` },
            ].map(({ label, status }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">{status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerOverview;
