import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, Plus, Link2, Clock, CheckCircle2, XCircle,
  ChevronRight, UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { useParentPortal } from "@/hooks/useParentPortal";

const ParentAthletes = () => {
  const { activeLinks, pendingLinks, loading, linkAthlete, fetchAthleteData, athleteData } = useParentPortal();
  const [showLink, setShowLink] = useState(false);
  const [email, setEmail] = useState("");
  const [linking, setLinking] = useState(false);

  // Fetch data for all active links
  useEffect(() => {
    activeLinks.forEach((link) => {
      if (!athleteData[link.athlete_user_id]) {
        fetchAthleteData(link.athlete_user_id);
      }
    });
  }, [activeLinks]);

  const handleLink = async () => {
    if (!email.trim()) return;
    setLinking(true);
    try {
      await linkAthlete(email.trim());
      setEmail("");
      setShowLink(false);
    } finally {
      setLinking(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-10 space-y-4">
        {[1, 2].map((i) => <div key={i} className="h-32 bg-secondary animate-pulse rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display text-foreground">MY ATHLETES</h1>
          <p className="text-muted-foreground text-sm mt-1">Monitor your athlete's development</p>
        </div>
        <Dialog open={showLink} onOpenChange={setShowLink}>
          <DialogTrigger asChild>
            <Button><UserPlus className="w-4 h-4 mr-2" /> Link Athlete</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Link to Your Athlete</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground mb-4">
              Enter your athlete's account email. They'll need to approve the connection before you can view their data.
            </p>
            <div className="space-y-4">
              <div>
                <Label>Athlete Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="athlete@example.com"
                />
              </div>
              <Button onClick={handleLink} disabled={linking || !email.trim()} className="w-full">
                {linking ? "Sending..." : "Send Link Request"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pending links */}
      {pendingLinks.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" /> Pending Approval
          </h3>
          <div className="space-y-2">
            {pendingLinks.map((link) => (
              <div key={link.id} className="bg-card border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Awaiting athlete approval</p>
                  <p className="text-xs text-muted-foreground">Link code: {link.link_code}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-500">Pending</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active athlete cards */}
      {activeLinks.length > 0 ? (
        <div className="space-y-4">
          {activeLinks.map((link) => {
            const data = athleteData[link.athlete_user_id];
            const profile = data?.profile;
            const devScore = data?.development_score;

            return (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Link to={`/parent/progress?athlete=${link.athlete_user_id}`}>
                  <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-xl shrink-0">
                        {profile?.avatar_url ? (
                          <img src={profile.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover" />
                        ) : (
                          <Users className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-lg text-foreground truncate">
                          {profile?.display_name || "Athlete"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {profile?.position || "—"} • Class of {profile?.graduation_year || "—"} • {profile?.sport_type === "softball" ? "🥎 Softball" : "⚾ Baseball"}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition shrink-0" />
                    </div>

                    {devScore && (
                      <div className="grid grid-cols-4 gap-3 mt-4">
                        <div className="bg-secondary rounded-xl p-3 text-center">
                          <p className="text-2xl font-display text-foreground">{devScore.overall_score}</p>
                          <p className="text-xs text-muted-foreground">Dev Score</p>
                        </div>
                        <div className="bg-secondary rounded-xl p-3 text-center">
                          <p className="text-2xl font-display text-foreground">{devScore.lessons_attended}</p>
                          <p className="text-xs text-muted-foreground">Lessons</p>
                        </div>
                        <div className="bg-secondary rounded-xl p-3 text-center">
                          <p className="text-2xl font-display text-foreground">
                            {devScore.homework_total > 0
                              ? Math.round((devScore.homework_completed / devScore.homework_total) * 100)
                              : 0}%
                          </p>
                          <p className="text-xs text-muted-foreground">Homework</p>
                        </div>
                        <div className="bg-secondary rounded-xl p-3 text-center">
                          <p className="text-2xl font-display text-foreground">{devScore.training_consistency}</p>
                          <p className="text-xs text-muted-foreground">Consistency</p>
                        </div>
                      </div>
                    )}

                    {devScore?.weekly_focus && (
                      <div className="mt-3 p-3 bg-primary/5 rounded-xl">
                        <p className="text-xs text-muted-foreground">This Week's Focus</p>
                        <p className="text-sm text-foreground font-medium">{devScore.weekly_focus}</p>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      ) : pendingLinks.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="font-display text-xl text-foreground mb-2">No Athletes Linked</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Connect to your athlete's account to see their development progress, lesson feedback, and more.
          </p>
          <Button onClick={() => setShowLink(true)}>
            <UserPlus className="w-4 h-4 mr-2" /> Link Your First Athlete
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default ParentAthletes;
