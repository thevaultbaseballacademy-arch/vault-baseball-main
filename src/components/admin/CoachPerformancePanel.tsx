import { useQuery } from "@tanstack/react-query";
import { Star, Video, DollarSign, Users, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface CoachPerformance {
  coach_id: string;
  name: string;
  email: string;
  is_marketplace_approved: boolean;
  total_sessions: number;
  total_revenue_cents: number;
  avg_rating: number;
  total_reviews: number;
}

const CoachPerformancePanel = () => {
  const { data: performanceData, isLoading } = useQuery({
    queryKey: ["admin-coach-performance"],
    queryFn: async () => {
      // Fetch coaches
      const { data: coaches, error: coachError } = await supabase
        .from("coaches")
        .select("id, name, email, is_marketplace_approved")
        .eq("is_marketplace_approved", true);

      if (coachError) throw coachError;

      // Fetch bookings for each coach
      const { data: bookings, error: bookingError } = await supabase
        .from("marketplace_bookings")
        .select("coach_id, amount_cents, status");

      if (bookingError) throw bookingError;

      // Fetch reviews
      const { data: reviews, error: reviewError } = await supabase
        .from("coach_reviews")
        .select("coach_id, rating");

      if (reviewError) throw reviewError;

      // Aggregate data
      const performanceMap: Record<string, CoachPerformance> = {};

      coaches?.forEach((coach) => {
        performanceMap[coach.id] = {
          coach_id: coach.id,
          name: coach.name,
          email: coach.email,
          is_marketplace_approved: coach.is_marketplace_approved,
          total_sessions: 0,
          total_revenue_cents: 0,
          avg_rating: 0,
          total_reviews: 0,
        };
      });

      bookings?.forEach((b) => {
        if (performanceMap[b.coach_id] && b.status === "completed") {
          performanceMap[b.coach_id].total_sessions += 1;
          performanceMap[b.coach_id].total_revenue_cents += b.amount_cents || 0;
        }
      });

      reviews?.forEach((r) => {
        if (performanceMap[r.coach_id]) {
          performanceMap[r.coach_id].total_reviews += 1;
          performanceMap[r.coach_id].avg_rating += r.rating;
        }
      });

      // Calculate averages
      Object.values(performanceMap).forEach((p) => {
        if (p.total_reviews > 0) {
          p.avg_rating = p.avg_rating / p.total_reviews;
        }
      });

      return Object.values(performanceMap).sort((a, b) => b.total_revenue_cents - a.total_revenue_cents);
    },
  });

  const formatCurrency = (cents: number) => `$${(cents / 100).toLocaleString()}`;

  const totals = performanceData?.reduce(
    (acc, c) => ({
      sessions: acc.sessions + c.total_sessions,
      revenue: acc.revenue + c.total_revenue_cents,
      reviews: acc.reviews + c.total_reviews,
    }),
    { sessions: 0, revenue: 0, reviews: 0 }
  ) || { sessions: 0, revenue: 0, reviews: 0 };

  const avgRating =
    performanceData && performanceData.length > 0
      ? performanceData.reduce((sum, c) => sum + c.avg_rating, 0) / performanceData.filter((c) => c.avg_rating > 0).length || 0
      : 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Video className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Total Sessions</span>
          </div>
          <p className="text-3xl font-display text-foreground">{totals.sessions}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-xs text-muted-foreground">Revenue Generated</span>
          </div>
          <p className="text-3xl font-display text-green-600">{formatCurrency(totals.revenue)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Total Reviews</span>
          </div>
          <p className="text-3xl font-display text-foreground">{totals.reviews}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-muted-foreground">Average Rating</span>
          </div>
          <p className="text-3xl font-display text-foreground">{avgRating.toFixed(1)}</p>
        </div>
      </div>

      {/* Performance Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Coach</TableHead>
              <TableHead className="text-right">Sessions</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-right">Reviews</TableHead>
              <TableHead className="text-right">Avg Rating</TableHead>
              <TableHead className="text-center">Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {performanceData?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No marketplace-approved coaches with performance data.
                </TableCell>
              </TableRow>
            ) : (
              performanceData?.map((coach, idx) => (
                <TableRow key={coach.coach_id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {idx < 3 && (
                        <Badge className="bg-yellow-100 text-yellow-800 text-[10px] px-1">
                          #{idx + 1}
                        </Badge>
                      )}
                      <div>
                        <p className="font-medium text-foreground">{coach.name}</p>
                        <p className="text-xs text-muted-foreground">{coach.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{coach.total_sessions}</TableCell>
                  <TableCell className="text-right font-medium text-green-600">
                    {formatCurrency(coach.total_revenue_cents)}
                  </TableCell>
                  <TableCell className="text-right">{coach.total_reviews}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                      <span>{coach.avg_rating > 0 ? coach.avg_rating.toFixed(1) : "—"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {coach.total_sessions >= 10 ? (
                      <TrendingUp className="w-4 h-4 text-green-600 mx-auto" />
                    ) : coach.total_sessions >= 3 ? (
                      <Minus className="w-4 h-4 text-muted-foreground mx-auto" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mx-auto" />
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CoachPerformancePanel;
