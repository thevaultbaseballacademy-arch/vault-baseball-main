import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  DollarSign, TrendingUp, CreditCard, Users, ShoppingCart,
  ArrowUpRight, ArrowDownRight, Calendar, Filter,
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { useState } from "react";

type TimeRange = "7d" | "30d" | "month" | "all";

export const OwnerRevenuePanel = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  const getDateRange = () => {
    const now = new Date();
    switch (timeRange) {
      case "7d":
        return { start: subDays(now, 7), end: now };
      case "30d":
        return { start: subDays(now, 30), end: now };
      case "month":
        return { start: startOfMonth(now), end: endOfMonth(now) };
      default:
        return null;
    }
  };

  // Revenue overview
  const { data: revenueData } = useQuery({
    queryKey: ["owner-revenue", timeRange],
    queryFn: async () => {
      const range = getDateRange();
      
      let purchasesQuery = supabase
        .from("user_purchases")
        .select("amount_cents, purchased_at, product_key")
        .eq("status", "completed");
      
      let earningsQuery = supabase
        .from("marketplace_earnings")
        .select("total_amount_cents, platform_fee_cents, coach_amount_cents, created_at");

      if (range) {
        purchasesQuery = purchasesQuery
          .gte("purchased_at", range.start.toISOString())
          .lte("purchased_at", range.end.toISOString());
        earningsQuery = earningsQuery
          .gte("created_at", range.start.toISOString())
          .lte("created_at", range.end.toISOString());
      }

      const [{ data: purchases }, { data: earnings }] = await Promise.all([
        purchasesQuery,
        earningsQuery,
      ]);

      const productRevenue = (purchases || []).reduce((acc, p) => acc + (p.amount_cents || 0), 0);
      const marketplaceTotal = (earnings || []).reduce((acc, e) => acc + (e.total_amount_cents || 0), 0);
      const platformFees = (earnings || []).reduce((acc, e) => acc + (e.platform_fee_cents || 0), 0);
      const coachPayouts = (earnings || []).reduce((acc, e) => acc + (e.coach_amount_cents || 0), 0);

      // Group purchases by product
      const byProduct: Record<string, number> = {};
      (purchases || []).forEach((p) => {
        const key = p.product_key || "unknown";
        byProduct[key] = (byProduct[key] || 0) + (p.amount_cents || 0);
      });

      return {
        productRevenue,
        marketplaceTotal,
        platformFees,
        coachPayouts,
        totalRevenue: productRevenue + platformFees,
        purchaseCount: purchases?.length || 0,
        byProduct,
      };
    },
  });

  // Coach payouts
  const { data: payoutData } = useQuery({
    queryKey: ["owner-payouts", timeRange],
    queryFn: async () => {
      const range = getDateRange();
      
      let query = supabase
        .from("coach_payouts")
        .select("amount_cents, status, processed_at");

      if (range) {
        query = query
          .gte("created_at", range.start.toISOString())
          .lte("created_at", range.end.toISOString());
      }

      const { data } = await query;

      const completed = (data || []).filter((p) => p.status === "completed");
      const pending = (data || []).filter((p) => p.status === "pending");

      return {
        completedAmount: completed.reduce((acc, p) => acc + (p.amount_cents || 0), 0),
        completedCount: completed.length,
        pendingAmount: pending.reduce((acc, p) => acc + (p.amount_cents || 0), 0),
        pendingCount: pending.length,
      };
    },
  });

  // Top products
  const topProducts = Object.entries(revenueData?.byProduct || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const formatCents = (cents: number) => `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display text-foreground">REVENUE & ANALYTICS</h1>
          <p className="text-sm text-muted-foreground">Track platform revenue and financial metrics</p>
        </div>
        
        {/* Time Range Filter */}
        <div className="flex items-center gap-2 bg-secondary rounded-xl p-1">
          {[
            { value: "7d", label: "7 Days" },
            { value: "30d", label: "30 Days" },
            { value: "month", label: "This Month" },
            { value: "all", label: "All Time" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value as TimeRange)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                timeRange === option.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-6 h-6 text-green-500" />
            <span className="text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">Total</span>
          </div>
          <p className="text-3xl font-display text-foreground">{formatCents(revenueData?.totalRevenue || 0)}</p>
          <p className="text-sm text-muted-foreground mt-1">Total Platform Revenue</p>
        </div>
        
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <ShoppingCart className="w-6 h-6 text-primary" />
            <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">{revenueData?.purchaseCount || 0} sales</span>
          </div>
          <p className="text-3xl font-display text-foreground">{formatCents(revenueData?.productRevenue || 0)}</p>
          <p className="text-sm text-muted-foreground mt-1">Product Sales</p>
        </div>
        
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-6 h-6 text-accent" />
          </div>
          <p className="text-3xl font-display text-foreground">{formatCents(revenueData?.platformFees || 0)}</p>
          <p className="text-sm text-muted-foreground mt-1">Marketplace Fees (30%)</p>
        </div>
        
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <CreditCard className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-3xl font-display text-foreground">{formatCents(payoutData?.completedAmount || 0)}</p>
          <p className="text-sm text-muted-foreground mt-1">Coach Payouts ({payoutData?.completedCount || 0})</p>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-display text-sm tracking-wider text-muted-foreground mb-4">TOP PRODUCTS</h3>
          <div className="space-y-3">
            {topProducts.length > 0 ? (
              topProducts.map(([product, amount], i) => (
                <div key={product} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                      {i + 1}
                    </span>
                    <span className="text-sm text-foreground capitalize">{product.replace(/-/g, " ")}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{formatCents(amount)}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No sales data available</p>
            )}
          </div>
        </div>

        {/* Payout Status */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-display text-sm tracking-wider text-muted-foreground mb-4">PAYOUT STATUS</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-xl border border-green-500/20">
              <div>
                <p className="text-sm text-green-500 font-medium">Completed Payouts</p>
                <p className="text-xs text-muted-foreground">{payoutData?.completedCount || 0} transfers</p>
              </div>
              <p className="text-xl font-display text-foreground">{formatCents(payoutData?.completedAmount || 0)}</p>
            </div>
            <div className="flex items-center justify-between p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
              <div>
                <p className="text-sm text-yellow-500 font-medium">Pending Payouts</p>
                <p className="text-xs text-muted-foreground">{payoutData?.pendingCount || 0} pending</p>
              </div>
              <p className="text-xl font-display text-foreground">{formatCents(payoutData?.pendingAmount || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Marketplace Split */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-display text-sm tracking-wider text-muted-foreground mb-4">MARKETPLACE REVENUE SPLIT</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-4 rounded-full bg-secondary overflow-hidden flex">
              <div 
                className="h-full bg-primary"
                style={{ width: `${((revenueData?.platformFees || 0) / (revenueData?.marketplaceTotal || 1)) * 100}%` }}
              />
              <div 
                className="h-full bg-accent"
                style={{ width: `${((revenueData?.coachPayouts || 0) / (revenueData?.marketplaceTotal || 1)) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Platform (30%): {formatCents(revenueData?.platformFees || 0)}</span>
              <span>Coaches (70%): {formatCents(revenueData?.coachPayouts || 0)}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-display text-foreground">{formatCents(revenueData?.marketplaceTotal || 0)}</p>
            <p className="text-xs text-muted-foreground">Marketplace Gross</p>
          </div>
        </div>
      </div>
    </div>
  );
};
