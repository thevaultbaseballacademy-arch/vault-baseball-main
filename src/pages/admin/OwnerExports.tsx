import { useState } from "react";
import { Download, Users, DollarSign, FileText, Shield, BarChart3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  generateOwnerUserListCSV,
  generateOwnerRevenueCSV,
  generateOwnerCoachEarningsCSV,
  generateAuditLogCSV,
  generatePlatformAnalyticsPDF,
} from "@/lib/downloadReports";

const OwnerExports = () => {
  const [gen, setGen] = useState<string | null>(null);

  const { data: user } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });

  const exportUserList = async () => {
    setGen("users");
    try {
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, email, sport_type, created_at").limit(1000);
      const { data: roles } = await supabase.from("user_roles").select("user_id, role").limit(1000);
      const roleMap = new Map<string, string>();
      (roles || []).forEach((r: any) => {
        const existing = roleMap.get(r.user_id);
        roleMap.set(r.user_id, existing ? `${existing}, ${r.role}` : r.role);
      });

      const rows = (profiles || []).map((p: any) => ({
        displayName: p.display_name || "—",
        email: p.email || "—",
        role: roleMap.get(p.user_id) || "athlete",
        sport: p.sport_type || "baseball",
        joinDate: p.created_at ? format(new Date(p.created_at), "yyyy-MM-dd") : "—",
        status: "Active",
      }));
      generateOwnerUserListCSV(rows);
      toast.success("User list exported");
    } catch { toast.error("Export failed"); }
    finally { setGen(null); }
  };

  const exportRevenue = async () => {
    setGen("revenue");
    try {
      const { data: purchases } = await supabase.from("user_purchases").select("product_key, amount_cents, purchased_at, user_id, status").order("purchased_at", { ascending: false }).limit(1000);
      const rows = (purchases || []).map((p: any) => ({
        period: p.purchased_at ? format(new Date(p.purchased_at), "yyyy-MM") : "—",
        product: p.product_key || "—",
        amount: p.amount_cents ? `$${(p.amount_cents / 100).toFixed(2)}` : "$0.00",
        customer: p.user_id?.substring(0, 8) || "—",
        date: p.purchased_at ? format(new Date(p.purchased_at), "yyyy-MM-dd") : "—",
      }));
      generateOwnerRevenueCSV(rows);
      toast.success("Revenue report exported");
    } catch { toast.error("Export failed"); }
    finally { setGen(null); }
  };

  const exportCoachEarnings = async () => {
    setGen("earnings");
    try {
      const { data: coaches } = await supabase.from("coaches").select("id, user_id, name, status").limit(100);
      const { data: payouts } = await supabase.from("coach_payouts").select("coach_id, amount_cents").limit(1000);
      const { data: lessons } = await supabase.from("remote_lessons").select("coach_user_id").eq("status", "completed").limit(1000);
      const { data: marketplace } = await supabase.from("coach_marketplace_profiles").select("coach_id, avg_rating").limit(100);

      const payoutMap = new Map<string, number>();
      (payouts || []).forEach((p: any) => {
        payoutMap.set(p.coach_id, (payoutMap.get(p.coach_id) || 0) + p.amount_cents);
      });

      const lessonCountMap = new Map<string, number>();
      (lessons || []).forEach((l: any) => {
        lessonCountMap.set(l.coach_user_id, (lessonCountMap.get(l.coach_user_id) || 0) + 1);
      });

      const ratingMap = new Map<string, number>();
      (marketplace || []).forEach((m: any) => {
        ratingMap.set(m.coach_id, m.avg_rating || 0);
      });

      const rows = (coaches || []).map((c: any) => ({
        coachName: c.name || "—",
        totalLessons: lessonCountMap.get(c.user_id) || 0,
        totalEarnings: `$${((payoutMap.get(c.id) || 0) / 100).toFixed(2)}`,
        avgRating: (ratingMap.get(c.id) || 0).toFixed(1),
        status: c.status || "Active",
      }));
      generateOwnerCoachEarningsCSV(rows);
      toast.success("Coach earnings exported");
    } catch { toast.error("Export failed"); }
    finally { setGen(null); }
  };

  const exportAuditLog = async () => {
    setGen("audit");
    try {
      const { data: logs } = await supabase.from("audit_logs").select("changed_at, changed_by, table_name, operation, new_data").order("changed_at", { ascending: false }).limit(1000);
      const rows = (logs || []).map((l: any) => ({
        timestamp: l.changed_at ? format(new Date(l.changed_at), "yyyy-MM-dd HH:mm:ss") : "—",
        user: l.changed_by?.substring(0, 8) || "System",
        table: l.table_name || "—",
        operation: l.operation || "—",
        details: l.new_data ? JSON.stringify(l.new_data).substring(0, 200) : "—",
      }));
      generateAuditLogCSV(rows);
      toast.success("Audit log exported");
    } catch { toast.error("Export failed"); }
    finally { setGen(null); }
  };

  const exportAnalytics = async () => {
    setGen("analytics");
    try {
      const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      const { count: totalAthletes } = await supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "athlete");
      const { count: totalCoaches } = await supabase.from("coaches").select("*", { count: "exact", head: true }).eq("status", "Active");
      const { count: totalParents } = await supabase.from("parent_athlete_links").select("*", { count: "exact", head: true }).eq("status", "active");
      const { count: totalLessons } = await supabase.from("remote_lessons").select("*", { count: "exact", head: true }).eq("status", "completed");
      const { data: revData } = await supabase.from("user_purchases").select("amount_cents").limit(1000);
      const totalRevenue = (revData || []).reduce((sum: number, r: any) => sum + (r.amount_cents || 0), 0);

      generatePlatformAnalyticsPDF({
        totalUsers: totalUsers || 0,
        totalAthletes: totalAthletes || 0,
        totalCoaches: totalCoaches || 0,
        totalParents: totalParents || 0,
        totalLessons: totalLessons || 0,
        totalRevenueCents: totalRevenue,
        avgReadiness: 0,
      });
      toast.success("Analytics report downloaded");
    } catch { toast.error("Export failed"); }
    finally { setGen(null); }
  };

  const exports = [
    { key: "users", title: "User List", desc: "All users with roles, sport, and join date", icon: Users, color: "text-primary", bg: "bg-primary/10", action: exportUserList, format: "CSV" },
    { key: "revenue", title: "Revenue Report", desc: "All purchases with amounts and dates", icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10", action: exportRevenue, format: "CSV" },
    { key: "earnings", title: "Coach Earnings", desc: "Coach lesson counts, payouts, and ratings", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", action: exportCoachEarnings, format: "CSV" },
    { key: "audit", title: "Audit Log", desc: "Platform activity and change history", icon: Shield, color: "text-amber-500", bg: "bg-amber-500/10", action: exportAuditLog, format: "CSV" },
    { key: "analytics", title: "Platform Analytics", desc: "Users, lessons, and revenue summary", icon: BarChart3, color: "text-purple-500", bg: "bg-purple-500/10", action: exportAnalytics, format: "PDF" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Download className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display tracking-wide">EXPORTS</h1>
          <p className="text-sm text-muted-foreground">Download platform data and reports</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {exports.map((e) => (
          <Card key={e.key}>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${e.bg} flex items-center justify-center`}>
                  <e.icon className={`w-5 h-5 ${e.color}`} />
                </div>
                <div>
                  <h3 className="font-display text-foreground text-sm">{e.title}</h3>
                  <p className="text-[11px] text-muted-foreground">{e.desc}</p>
                </div>
              </div>
              <Button onClick={e.action} disabled={gen === e.key} className="w-full" size="sm">
                {gen === e.key ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                ) : (
                  <><Download className="w-4 h-4 mr-2" /> Download {e.format}</>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OwnerExports;
