import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Star, MapPin, Clock, Video, FileText, Calendar,
  Users, MessageSquare, BookOpen, Repeat, Award, ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CoachBadges from "@/components/marketplace/CoachBadges";
import CertificationBadge from "@/components/certifications/CertificationBadge";
import { useCoachBadge } from "@/hooks/useCoachBadge";
import {
  useCoachProfile,
  useCoachServices,
  useCoachReviews,
  useCreateBooking,
  type CoachService,
} from "@/hooks/useMarketplace";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const SERVICE_TYPE_LABELS: Record<string, string> = {
  live_lesson: "Live Remote Lesson",
  video_analysis: "Video Analysis",
  development_plan: "Development Plan",
  membership: "Remote Training Membership",
};

const SERVICE_TYPE_ICONS: Record<string, any> = {
  live_lesson: Video,
  video_analysis: FileText,
  development_plan: BookOpen,
  membership: Repeat,
};

const CoachMarketplaceProfile = () => {
  const { coachId } = useParams<{ coachId: string }>();
  const navigate = useNavigate();
  const { data: coach, isLoading: coachLoading } = useCoachProfile(coachId || "");
  const { data: services } = useCoachServices(coachId || "");
  const { data: reviews } = useCoachReviews(coachId || "");
  const createBooking = useCreateBooking();

  const [bookingService, setBookingService] = useState<CoachService | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingOpen, setBookingOpen] = useState(false);

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`;

  const renderStars = (rating: number, size = "w-4 h-4") =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`${size} ${i < Math.round(rating) ? "fill-current text-yellow-500" : "text-muted"}`} />
    ));

  const handleBook = async () => {
    if (!bookingService || !bookingDate || !bookingTime) return;

    // Check authentication first
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const scheduledAt = new Date(`${bookingDate}T${bookingTime}`).toISOString();
    await createBooking.mutateAsync({
      coach_id: coachId!,
      service_id: bookingService.id,
      scheduled_at: scheduledAt,
      amount_cents: bookingService.price_cents,
      notes: bookingNotes,
    });
    setBookingOpen(false);
    setBookingService(null);
    setBookingDate("");
    setBookingTime("");
    setBookingNotes("");
  };

  if (coachLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-28 pb-16 container mx-auto px-4 max-w-5xl">
          <Skeleton className="h-10 w-40 mb-8" />
          <div className="flex gap-8">
            <Skeleton className="w-32 h-32" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!coach) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-28 pb-16 container mx-auto px-4 max-w-5xl text-center">
          <h2 className="text-2xl font-display text-foreground mb-4">Coach Not Found</h2>
          <Button variant="outline" onClick={() => navigate("/marketplace")}>Back to Marketplace</Button>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/marketplace")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column — Profile */}
            <div className="lg:col-span-2 space-y-6">
              {/* Coach Header Card */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border p-6 md:p-8">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Photo */}
                  <div className="w-28 h-28 bg-secondary flex items-center justify-center overflow-hidden shrink-0 mx-auto sm:mx-0">
                    {coach.photo_url ? (
                      <img src={coach.photo_url} alt={coach.coach_name || ""} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-display text-muted-foreground">{coach.coach_name?.charAt(0) || "C"}</span>
                    )}
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    {/* Name + Badges */}
                    <h1 className="text-3xl md:text-4xl font-display tracking-wide text-foreground mb-2">
                      {coach.coach_name}
                    </h1>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <CoachBadges
                        isCertified={coach.is_certified}
                        isBypassCertified={coach.is_bypass_certified}
                        isStaff={coach.is_staff}
                      />
                      <CertBadgeInline userId={coach.user_id} />
                    </div>

                    {coach.tagline && <p className="text-muted-foreground mb-3">{coach.tagline}</p>}

                    {/* Meta */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-muted-foreground mb-3">
                      {coach.location && (
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{coach.location}</span>
                      )}
                      {coach.years_experience && (
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{coach.years_experience}+ years</span>
                      )}
                      <span className="flex items-center gap-1"><Users className="w-4 h-4" />{coach.total_sessions} sessions</span>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
                      <div className="flex">{renderStars(coach.avg_rating, "w-5 h-5")}</div>
                      <span className="text-foreground font-medium">{Number(coach.avg_rating).toFixed(1)}</span>
                      <span className="text-muted-foreground">({coach.total_reviews} reviews)</span>
                    </div>

                    {/* Specialties */}
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      {coach.specialties?.map((s) => (
                        <Badge key={s} variant="secondary">{s}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Bio */}
              {coach.bio && (
                <div className="bg-card border border-border p-6">
                  <h2 className="font-display text-lg tracking-wide text-foreground mb-3">BIO</h2>
                  <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{coach.bio}</p>
                </div>
              )}

              {/* Playing & Coaching Experience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coach.playing_background && (
                  <div className="bg-card border border-border p-6">
                    <h2 className="font-display text-lg tracking-wide text-foreground mb-3">PLAYING EXPERIENCE</h2>
                    <p className="text-muted-foreground whitespace-pre-line text-sm leading-relaxed">{coach.playing_background}</p>
                  </div>
                )}
                {coach.coaching_background && (
                  <div className="bg-card border border-border p-6">
                    <h2 className="font-display text-lg tracking-wide text-foreground mb-3">COACHING EXPERIENCE</h2>
                    <p className="text-muted-foreground whitespace-pre-line text-sm leading-relaxed">{coach.coaching_background}</p>
                  </div>
                )}
              </div>

              {/* Platform Usage Disclaimer */}
              <div className="bg-destructive/5 border border-destructive/20 p-5">
                <h2 className="font-display text-sm tracking-wide text-destructive mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  PLATFORM USAGE AGREEMENT
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This coach is a verified member of the Vault Baseball coaching network. All sessions, lessons, video analyses, and coaching services must be conducted exclusively through the Vault Baseball platform. Coaches are contractually prohibited from soliciting, booking, or conducting sessions with Vault-connected athletes outside of this platform. A 70/30 revenue split (70% coach / 30% platform) applies to all services rendered. Any coach found operating outside of the platform with Vault athletes may be subject to immediate removal from the network and forfeiture of pending earnings. Athletes should only book and pay for sessions through this platform to ensure quality, accountability, and protection.
                </p>
              </div>

              {/* Services & Reviews Tabs */}
              <Tabs defaultValue="services" className="space-y-4">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="services">Available Services</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews ({coach.total_reviews})</TabsTrigger>
                </TabsList>

                <TabsContent value="services" className="space-y-3">
                  {services && services.length > 0 ? (
                    services.map((service) => {
                      const Icon = SERVICE_TYPE_ICONS[service.service_type] || Video;
                      return (
                        <motion.div
                          key={service.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-card border border-border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-secondary flex items-center justify-center shrink-0">
                              <Icon className="w-5 h-5 text-foreground" />
                            </div>
                            <div>
                              <h3 className="font-display text-foreground">{service.title}</h3>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 mb-1">
                                {SERVICE_TYPE_LABELS[service.service_type] || service.service_type}
                              </Badge>
                              {service.description && (
                                <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                              )}
                              {service.duration_minutes && (
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />{service.duration_minutes} minutes
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-display text-xl text-foreground">{formatPrice(service.price_cents)}</span>
                            <Button size="sm" onClick={() => { setBookingService(service); setBookingOpen(true); }}>
                              Book
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="w-10 h-10 mx-auto mb-3" />
                      <p>No services listed yet.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="reviews" className="space-y-3">
                  {reviews && reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.id} className="bg-card border border-border p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <span className="text-sm text-muted-foreground">{format(new Date(review.created_at), "MMM d, yyyy")}</span>
                        </div>
                        {review.review_text && <p className="text-foreground text-sm">{review.review_text}</p>}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="w-10 h-10 mx-auto mb-3" />
                      <p>No reviews yet.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Sidebar — Pricing & Booking */}
            <div className="space-y-4">
              {/* Pricing Card */}
              <div className="bg-card border border-border p-6 sticky top-28">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Starting at</p>
                <p className="text-4xl font-display text-foreground mb-1">{formatPrice(coach.hourly_rate_cents)}</p>
                <p className="text-sm text-muted-foreground mb-5">per session</p>

                <Dialog open={bookingOpen} onOpenChange={async (open) => {
                  if (open) {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) {
                      navigate("/auth");
                      return;
                    }
                  }
                  setBookingOpen(open);
                }}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="w-full mb-4">Book a Session</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="font-display text-xl tracking-wide">BOOK A SESSION</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">Service</label>
                        <Select
                          value={bookingService?.id || ""}
                          onValueChange={(val) => setBookingService(services?.find((s) => s.id === val) || null)}
                        >
                          <SelectTrigger><SelectValue placeholder="Select a service" /></SelectTrigger>
                          <SelectContent>
                            {services?.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.title} — {formatPrice(s.price_cents)}
                                {s.duration_minutes ? ` (${s.duration_minutes} min)` : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium text-foreground mb-1 block">Date</label>
                          <Input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-1 block">Time</label>
                          <Input type="time" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">Notes (optional)</label>
                        <Textarea placeholder="Any details for the coach..." value={bookingNotes} onChange={(e) => setBookingNotes(e.target.value)} rows={3} />
                      </div>
                      {bookingService && (
                        <div className="bg-secondary p-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Session fee</span>
                            <span className="text-foreground">{formatPrice(bookingService.price_cents)}</span>
                          </div>
                          <div className="flex justify-between text-sm font-medium pt-2 border-t border-border mt-2">
                            <span>Total</span>
                            <span>{formatPrice(bookingService.price_cents)}</span>
                          </div>
                        </div>
                      )}
                      {/* Booking disclaimer */}
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        By booking, you agree that all sessions are conducted through the Vault Baseball platform. Do not arrange sessions outside of this platform.
                      </p>
                      <Button className="w-full" disabled={!bookingService || !bookingDate || !bookingTime || createBooking.isPending} onClick={handleBook}>
                        {createBooking.isPending ? "Booking..." : "Confirm Booking"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Quick service list */}
                {services && services.length > 0 && (
                  <div className="border-t border-border pt-4 space-y-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Session Types</p>
                    {services.map((s) => (
                      <div key={s.id} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{SERVICE_TYPE_LABELS[s.service_type] || s.title}</span>
                        <span className="text-muted-foreground font-medium">{formatPrice(s.price_cents)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

// Inline badge component to avoid hooks-in-conditionals
const CertBadgeInline = ({ userId }: { userId?: string }) => {
  const { data: badge } = useCoachBadge(userId || null);
  if (!badge?.badge_level) return null;
  return <CertificationBadge badgeLevel={badge.badge_level} badgeName={badge.badge_name} compact />;
};

export default CoachMarketplaceProfile;
