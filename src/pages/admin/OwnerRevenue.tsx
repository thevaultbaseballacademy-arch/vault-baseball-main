import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, TrendingUp, Download } from "lucide-react";
import { useState } from "react";

const OwnerRevenue = () => {
  const [period, setPeriod] = useState<"30" | "90" | "365">("30");

  const { data: purchases = [] } = useQuery({
    queryKey: ["owner-revenue", period],
    queryFn: async () => {
      const since = new Date(Date.now() - parseInt(period) * 86400000).toISOString();
      const { data } = await supabase
        .from("user_purchases")
        .select("product_key, amount_cents, purchased_at, status")
        .gte("purchased_at", since)
        .order("purchased_at", { ascending: false });
      return data || [];
    },
  });

  const { data: coachPayouts = [] } = useQuery({
    queryKey: ["owner-coach-payouts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("coach_payouts")
        .select("coach_id, amount_cents, status, created_at, coaches(name)")
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
  });

  const totalRevenue = purchases.reduce((sum, p) => sum + (p.amount_cents || 0), 0);
  const completedRevenue = purchases.filter(p => p.status === "completed").reduce((sum, p) => sum + (p.amount_cents || 0), 0);

  const productBreakdown = purchases.reduce((acc, p) => {
    const key = p.product_key || "unknown";
    acc[key] = (acc[key] || 0) + (p.amount_cents || 0);
    return acc;
  }, {} as Record<string, number>);

  const exportCSV = () => {
    const rows = [["Product", "Amount", "Status", "Date"]];
    purchases.forEach(p => {
      rows.push([p.product_key, ((p.amount_cents || 0) / 100).toFixed(2), p.status || "", p.purchased_at || ""]);
    });
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `revenue-${period}d.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display text-foreground">REVENUE</h1>
          <p className="text-sm text-muted-foreground">Financial overview</p>
        </div>
        <div className="flex items-center gap-2">
          {(["30", "90", "365"] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${period === p ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
            >
              {p === "30" ? "30D" : p === "90" ? "90D" : "1Y"}
            </button>
          ))}
          <button onClick={exportCSV} className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <DollarSign className="w-4 h-4 text-emerald-400 mb-1" />
          <p className="text-xl font-display text-foreground">${(totalRevenue / 100).toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total Revenue</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <TrendingUp className="w-4 h-4 text-blue-400 mb-1" />
          <p className="text-xl font-display text-foreground">${(completedRevenue / 100).toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xl font-display text-foreground">{purchases.length}</p>
          <p className="text-xs text-muted-foreground">Transactions</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xl font-display text-foreground">
            ${purchases.length > 0 ? ((totalRevenue / purchases.length / 100).toFixed(0)) : "0"}
          </p>
          <p className="text-xs text-muted-foreground">Avg Transaction</p>
        </div>
      </div>

      {/* Product breakdown */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-display text-foreground mb-3">REVENUE BY PRODUCT</h2>
        <div className="space-y-2">
          {Object.entries(productBreakdown)
            .sort((a, b) => b[1] - a[1])
            .map(([product, cents]) => (
              <div key={product} className="flex items-center justify-between py-1.5">
                <span className="text-sm text-muted-foreground truncate max-w-[200px]">{product}</span>
                <span className="text-sm font-medium text-foreground">${(cents / 100).toLocaleString()}</span>
              </div>
            ))}
          {Object.keys(productBreakdown).length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">No transactions in this period</p>
          )}
        </div>
      </div>

      {/* Coach earnings */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-display text-foreground mb-3">COACH EARNINGS</h2>
        <div className="space-y-2">
          {coachPayouts.map((p: any) => (
            <div key={p.coach_id + p.created_at} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
              <div>
                <p className="text-sm text-foreground">{p.coaches?.name || "Unknown Coach"}</p>
                <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">${(p.amount_cents / 100).toFixed(2)}</p>
                <p className={`text-xs ${p.status === "completed" ? "text-emerald-400" : "text-amber-400"}`}>{p.status}</p>
              </div>
            </div>
          ))}
          {coachPayouts.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">No payouts yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerRevenue;
