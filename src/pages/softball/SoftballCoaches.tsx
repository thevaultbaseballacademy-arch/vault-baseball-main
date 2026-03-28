import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { User, Star, ArrowRight, Loader2, MapPin, Award, Calendar } from "lucide-react";

interface SoftballCoach {
  id: string;
  user_id: string;
  name: string;
  email: string;
  bio: string | null;
  specialties: string[];
  years_experience: number | null;
  location: string | null;
  is_certified: boolean;
  role: string;
  avatar_url?: string | null;
}

const SoftballCoaches = () => {
  const navigate = useNavigate();
  const [coaches, setCoaches] = useState<SoftballCoach[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSoftballCoaches = async () => {
      setLoading(true);
      const { data: coachRecords } = await supabase
        .from("coaches")
        .select("id, user_id, name, email, bio, specialties, years_experience, location, is_certified, role")
        .eq("status", "Active")
        .not("user_id", "is", null);

      if (coachRecords) {
        const softballCoaches = coachRecords.filter(c => {
          const specs = (c.specialties || []).map((s: string) => s.toLowerCase());
          return specs.some((s: string) =>
            s.includes("softball") || s.includes("fastpitch") ||
            s.includes("windmill") || s.includes("slap")
          );
        });

        // Fetch avatar URLs from profiles
        const userIds = softballCoaches.map(c => c.user_id!);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, avatar_url")
          .in("user_id", userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p.avatar_url]) || []);

        setCoaches(softballCoaches.map(c => ({
          ...c,
          specialties: c.specialties || [],
          avatar_url: profileMap.get(c.user_id!) || null,
        })) as SoftballCoach[]);
      }
      setLoading(false);
    };

    fetchSoftballCoaches();
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <p className="text-xs font-display tracking-[0.3em] text-muted-foreground mb-2">VAULT SOFTBALL</p>
            <h1 className="text-3xl md:text-4xl font-display tracking-tight text-foreground">
              SOFTBALL COACHING STAFF
            </h1>
            <p className="text-muted-foreground mt-2 text-sm max-w-xl">
              Meet our certified softball development coaches — specialists in fastpitch mechanics, hitting, and position-specific training.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : coaches.length === 0 ? (
            <Card className="border-border">
              <CardContent className="py-16 text-center">
                <User className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No softball coaches are currently listed. Check back soon.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {coaches.map((coach, i) => (
                <motion.div
                  key={coach.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="border-border hover:border-foreground/20 transition-colors group">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-foreground/5 border border-border flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {coach.avatar_url ? (
                            <img src={coach.avatar_url} alt={coach.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-display text-lg text-foreground truncate">{coach.name}</h3>
                            {coach.is_certified && (
                              <Award className="w-4 h-4 text-foreground flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground font-display tracking-[0.1em] mb-2">
                            {coach.role === "VAULTHQ" ? "MASTER TRAINER" : "SOFTBALL COACH"}
                          </p>

                          {coach.bio && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{coach.bio}</p>
                          )}

                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {coach.specialties.slice(0, 4).map(spec => (
                              <Badge key={spec} variant="secondary" className="text-[10px] font-display tracking-wider">
                                {spec}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                            {coach.years_experience && (
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3" /> {coach.years_experience}+ yrs
                              </span>
                            )}
                            {coach.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {coach.location}
                              </span>
                            )}
                          </div>

                          <Button
                            size="sm"
                            className="font-display tracking-[0.1em] text-xs"
                            onClick={() => navigate("/softball/lessons/booking")}
                          >
                            <Calendar className="w-3 h-3 mr-1" /> BOOK SESSION
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default SoftballCoaches;
