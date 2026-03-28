import { useState } from "react";
import { Calendar, Video, FileText, Clock, Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMyBookings, useSubmitReview, useUpdateBookingStatus } from "@/hooks/useMarketplace";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const AthleteBookingsPanel = () => {
  const { data: bookings, isLoading } = useMyBookings();
  const submitReview = useSubmitReview();
  const updateBooking = useUpdateBookingStatus();

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewBooking, setReviewBooking] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const formatCents = (cents: number) => `$${(cents / 100).toFixed(0)}`;

  const handleSubmitReview = async () => {
    if (!reviewBooking) return;
    await submitReview.mutateAsync({
      booking_id: reviewBooking.id,
      coach_id: reviewBooking.coach_id,
      rating,
      review_text: reviewText || undefined,
    });
    setReviewOpen(false);
    setReviewBooking(null);
    setRating(5);
    setReviewText("");
  };

  const upcoming = bookings?.filter((b: any) => b.status === "confirmed" || b.status === "pending") || [];
  const completed = bookings?.filter((b: any) => b.status === "completed") || [];
  const cancelled = bookings?.filter((b: any) => b.status === "cancelled") || [];

  const renderBooking = (booking: any, showReview = false) => (
    <div key={booking.id} className="bg-card border border-border rounded-xl p-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-display text-foreground">
              {booking.coach_services?.title || "Session"}
            </h4>
            <Badge className={statusColors[booking.status] || "bg-secondary"}>
              {booking.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Coach: {booking.coaches?.name || "—"}
          </p>
          {booking.scheduled_at && (
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(booking.scheduled_at), "MMM d, yyyy 'at' h:mm a")}
            </p>
          )}
          {booking.coach_services?.duration_minutes && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" />
              {booking.coach_services.duration_minutes} minutes
            </p>
          )}
          {booking.coach_notes && (
            <div className="mt-2 p-2 bg-secondary rounded text-sm">
              <span className="font-medium">Coach Notes:</span> {booking.coach_notes}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="font-display text-lg text-foreground">
            {formatCents(booking.amount_cents)}
          </span>
          {showReview && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setReviewBooking(booking);
                setReviewOpen(true);
              }}
            >
              <Star className="w-3 h-3 mr-1" />
              Review
            </Button>
          )}
          {booking.status === "pending" && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => updateBooking.mutate({ id: booking.id, status: "cancelled" })}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Upcoming */}
      <div>
        <h3 className="font-display text-lg text-foreground mb-4">UPCOMING SESSIONS</h3>
        {upcoming.length > 0 ? (
          <div className="space-y-3">{upcoming.map((b: any) => renderBooking(b))}</div>
        ) : (
          <p className="text-sm text-muted-foreground">No upcoming sessions.</p>
        )}
      </div>

      {/* Completed */}
      <div>
        <h3 className="font-display text-lg text-foreground mb-4">COMPLETED ({completed.length})</h3>
        {completed.length > 0 ? (
          <div className="space-y-3">{completed.map((b: any) => renderBooking(b, true))}</div>
        ) : (
          <p className="text-sm text-muted-foreground">No completed sessions yet.</p>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">LEAVE A REVIEW</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Rating</label>
              <div className="flex gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <button key={i} onClick={() => setRating(i + 1)}>
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        i < rating ? "fill-current text-yellow-500" : "text-muted"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Review (optional)</label>
              <Textarea
                placeholder="Share your experience..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleSubmitReview}
              disabled={submitReview.isPending}
            >
              {submitReview.isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AthleteBookingsPanel;
