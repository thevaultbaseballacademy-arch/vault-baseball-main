import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, Clock, CheckCircle2, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useCoachEarnings, useCoachBookings } from "@/hooks/useMarketplace";
import { format } from "date-fns";

interface Props {
  coachId: string;
}

const CoachEarningsDashboard = ({ coachId }: Props) => {
  const { data: earnings } = useCoachEarnings(coachId);
  const { data: bookings } = useCoachBookings(coachId);

  const totalEarned = earnings?.filter((e: any) => e.status !== "pending").reduce((sum: number, e: any) => sum + e.coach_amount_cents, 0) || 0;
  const pendingEarnings = earnings?.filter((e: any) => e.status === "pending").reduce((sum: number, e: any) => sum + e.coach_amount_cents, 0) || 0;
  const availableBalance = earnings?.filter((e: any) => e.status === "available").reduce((sum: number, e: any) => sum + e.coach_amount_cents, 0) || 0;
  const totalSessions = bookings?.filter((b: any) => b.status === "completed").length || 0;

  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-xs text-muted-foreground">Available</span>
          </div>
          <p className="text-2xl font-display text-foreground">{formatCents(availableBalance)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-yellow-600" />
            <span className="text-xs text-muted-foreground">Pending</span>
          </div>
          <p className="text-2xl font-display text-foreground">{formatCents(pendingEarnings)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            <span className="text-xs text-muted-foreground">Total Earned</span>
          </div>
          <p className="text-2xl font-display text-foreground">{formatCents(totalEarned)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-accent" />
            <span className="text-xs text-muted-foreground">Completed</span>
          </div>
          <p className="text-2xl font-display text-foreground">{totalSessions}</p>
        </div>
      </div>

      {/* Upcoming Bookings */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-display text-lg text-foreground">UPCOMING SESSIONS</h3>
        </div>
        <div className="divide-y divide-border">
          {bookings?.filter((b: any) => b.status !== "completed" && b.status !== "cancelled")
            .slice(0, 10)
            .map((booking: any) => (
              <div key={booking.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {booking.coach_services?.title || "Session"}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {booking.scheduled_at
                      ? format(new Date(booking.scheduled_at), "MMM d, yyyy 'at' h:mm a")
                      : "TBD"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-display text-foreground">
                    {formatCents(booking.coach_payout_cents)}
                  </span>
                  <Badge className={statusColors[booking.status] || "bg-secondary"}>
                    {booking.status}
                  </Badge>
                </div>
              </div>
            )) || (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No upcoming sessions
            </div>
          )}
        </div>
      </div>

      {/* Earnings History */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-display text-lg text-foreground">EARNINGS HISTORY</h3>
        </div>
        <div className="divide-y divide-border">
          {earnings?.slice(0, 20).map((earning: any) => (
            <div key={earning.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(earning.created_at), "MMM d, yyyy")}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  Total: {formatCents(earning.total_amount_cents)}
                </span>
                <span className="text-muted-foreground">
                  Fee: -{formatCents(earning.platform_fee_cents)}
                </span>
                <span className="font-medium text-foreground">
                  You: {formatCents(earning.coach_amount_cents)}
                </span>
                <Badge variant={earning.status === "available" ? "default" : "secondary"}>
                  {earning.status}
                </Badge>
              </div>
            </div>
          )) || (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No earnings yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoachEarningsDashboard;
