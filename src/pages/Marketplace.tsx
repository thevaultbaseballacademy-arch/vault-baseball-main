import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Star, MapPin, Award, Clock, Filter, ChevronDown, Users, Video, FileText, Calendar, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useMarketplaceCoaches, type MarketplaceCoach } from "@/hooks/useMarketplace";
import { Skeleton } from "@/components/ui/skeleton";
import CoachBadges from "@/components/marketplace/CoachBadges";

const SPECIALTIES = ["Pitching", "Hitting", "Fielding", "Catching", "Strength", "Youth Development", "College Prep"];

const SERVICE_TYPE_ICONS: Record<string, any> = {
  live_lesson: Video,
  video_analysis: FileText,
  development_plan: Calendar,
  membership: Users,
};

const Marketplace = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: coaches, isLoading } = useMarketplaceCoaches({
    search: searchTerm,
    specialty: selectedSpecialty,
  });

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.round(rating) ? "fill-current text-yellow-500" : "text-muted"}`}
      />
    ));
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-16 bg-foreground text-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Badge variant="outline" className="mb-4 border-background/30 text-background/70 text-xs tracking-widest">
              VAULT CERTIFIED NETWORK
            </Badge>
            <h1 className="text-5xl md:text-7xl font-display mb-4">
              COACH MARKETPLACE
            </h1>
            <p className="text-lg text-background/60 max-w-2xl mx-auto mb-8">
              Connect with elite, Vault-certified coaches for remote training sessions.
              Every coach follows the Vault development system and philosophy.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by name, specialty, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg bg-background text-foreground border-0"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters + Results */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </Button>

            {selectedSpecialty && (
              <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setSelectedSpecialty("")}>
                {selectedSpecialty} ✕
              </Badge>
            )}

            <span className="text-sm text-muted-foreground ml-auto">
              {coaches?.length || 0} coaches available
            </span>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-8 p-4 bg-card border border-border rounded-xl"
            >
              <p className="text-sm font-medium text-foreground mb-3">Specialty</p>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map((s) => (
                  <Button
                    key={s}
                    variant={selectedSpecialty === s ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSpecialty(selectedSpecialty === s ? "" : s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Coach Cards */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-6">
                  <Skeleton className="w-20 h-20 rounded-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : coaches && coaches.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coaches.map((coach, index) => (
                <motion.div
                  key={coach.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={`/marketplace/coach/${coach.coach_id}`}>
                    <div className="bg-card border border-border rounded-xl p-6 hover:border-foreground/30 transition-all group h-full flex flex-col">
                      {/* Coach Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                          {coach.photo_url ? (
                            <img src={coach.photo_url} alt={coach.coach_name || ""} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl font-display text-muted-foreground">
                              {coach.coach_name?.charAt(0) || "C"}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-display text-foreground group-hover:text-accent transition-colors truncate">
                            {coach.coach_name || "Vault Coach"}
                          </h3>
                          {coach.tagline && (
                            <p className="text-sm text-muted-foreground truncate">{coach.tagline}</p>
                          )}
                          {coach.location && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              {coach.location}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex">{renderStars(coach.avg_rating)}</div>
                        <span className="text-sm text-muted-foreground">
                          {Number(coach.avg_rating).toFixed(1)} ({coach.total_reviews})
                        </span>
                      </div>

                      {/* Specialties */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {coach.specialties?.slice(0, 3).map((s) => (
                          <Badge key={s} variant="secondary" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                        {(coach.specialties?.length || 0) > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{coach.specialties!.length - 3}
                          </Badge>
                        )}
                      </div>

                      {/* Badges */}
                      <CoachBadges
                        isCertified={coach.is_certified}
                        isBypassCertified={coach.is_bypass_certified}
                        isStaff={coach.is_staff}
                        compact
                      />

                      {/* Footer */}
                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {coach.total_sessions > 0 && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {coach.total_sessions} sessions
                            </div>
                          )}
                        </div>
                        <span className="font-display text-lg text-foreground">
                          {formatPrice(coach.hourly_rate_cents)}/hr
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-display text-foreground mb-2">No Coaches Found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || selectedSpecialty
                  ? "Try adjusting your search or filters."
                  : "The marketplace is launching soon. Check back for certified coaches."}
              </p>
            </div>
          )}

          {/* Platform Disclaimer */}
          <div className="mt-12 bg-destructive/5 border border-destructive/20 rounded-xl p-6">
            <h3 className="font-display text-sm tracking-wide text-destructive mb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              PLATFORM POLICY
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              All coaching sessions booked through the Vault Baseball Marketplace must be conducted exclusively on this platform. Coaches are prohibited from soliciting or conducting sessions with Vault-connected athletes outside of the platform. A 70/30 revenue split applies to all services (70% coach / 30% platform). Athletes should only book and pay through Vault Baseball to ensure quality, accountability, and protection. Any violations may result in coach removal and forfeiture of earnings.
            </p>
          </div>

          {/* Become a Coach CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-foreground text-background rounded-xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div>
              <h3 className="text-2xl font-display mb-2">ARE YOU A COACH?</h3>
              <p className="text-background/60 max-w-md">
                Get Vault certified and join the marketplace. Earn income coaching athletes remotely through the Vault platform.
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/products/certified-coach">
                <Button variant="outline" className="border-background/30 text-background hover:bg-background/10">
                  Get Certified
                </Button>
              </Link>
              <Link to="/coach-register">
                <Button className="bg-background text-foreground hover:bg-background/90">
                  Apply Now
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Marketplace;
