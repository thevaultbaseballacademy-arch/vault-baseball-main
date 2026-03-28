import { useQuery } from "@tanstack/react-query";
import { DollarSign, Users, TrendingUp, Activity, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const AdminMarketplacePanel = () => {
  const { data: allBookings } = useQuery({
    queryKey: ["admin-all-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_bookings")
        .select(`
          *,
          coaches:coach_id ( name ),
          coach_services:service_id ( title, service_type )
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });

  const { data: allEarnings } = useQuery({
    queryKey: ["admin-all-earnings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_earnings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;
      return data;
    },
  });

  const { data: activeCoaches } = useQuery({
    queryKey: ["admin-active-marketplace-coaches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_marketplace_profiles")
        .select("*, coaches:coach_id ( name, email, status )")
        .eq("is_marketplace_active", true);

      if (error) throw error;
      return data;
    },
  });

  const totalRevenue = allEarnings?.reduce((s: number, e: any) => s + e.total_amount_cents, 0) || 0;
  const platformFees = allEarnings?.reduce((s: number, e: any) => s + e.platform_fee_cents, 0) || 0;
  const coachPayouts = allEarnings?.reduce((s: number, e: any) => s + e.coach_amount_cents, 0) || 0;
  const totalBookings = allBookings?.length || 0;

  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-xs text-muted-foreground">Total Revenue</span>
          </div>
          <p className="text-2xl font-display text-foreground">{formatCents(totalRevenue)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            <span className="text-xs text-muted-foreground">Platform Fees (30%)</span>
          </div>
          <p className="text-2xl font-display text-foreground">{formatCents(platformFees)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-accent" />
            <span className="text-xs text-muted-foreground">Active Coaches</span>
          </div>
          <p className="text-2xl font-display text-foreground">{activeCoaches?.length || 0}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-accent" />
            <span className="text-xs text-muted-foreground">Total Bookings</span>
          </div>
          <p className="text-2xl font-display text-foreground">{totalBookings}</p>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-display text-lg text-foreground">RECENT MARKETPLACE ACTIVITY</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="text-left p-3 text-muted-foreground font-medium">Date</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Coach</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Service</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Amount</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Platform Fee</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allBookings?.slice(0, 20).map((b: any) => (
                <tr key={b.id}>
                  <td className="p-3 text-muted-foreground">
                    {format(new Date(b.created_at), "MMM d")}
                  </td>
                  <td className="p-3 text-foreground">{b.coaches?.name || "—"}</td>
                  <td className="p-3 text-foreground">{b.coach_services?.title || "—"}</td>
                  <td className="p-3 text-foreground">{formatCents(b.amount_cents)}</td>
                  <td className="p-3 text-green-600">{formatCents(b.platform_fee_cents)}</td>
                  <td className="p-3">
                    <Badge className={statusColors[b.status] || "bg-secondary"}>{b.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminMarketplacePanel;
