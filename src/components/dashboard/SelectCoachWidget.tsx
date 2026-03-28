import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { UserCheck, Users, Loader2, Star, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CoachOption {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  specialties: string[] | null;
  tagline: string | null;
  avg_rating: number | null;
  total_sessions: number | null;
}

interface CurrentCoach {
  assignment_id: string;
  coach_user_id: string;
  display_name: string;
  avatar_url: string | null;
}

interface SelectCoachWidgetProps {
  userId: string;
}

const SelectCoachWidget = ({ userId }: SelectCoachWidgetProps) => {
  const [currentCoach, setCurrentCoach] = useState<CurrentCoach | null>(null);
  const [availableCoaches, setAvailableCoaches] = useState<CoachOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [confirmCoach, setConfirmCoach] = useState<CoachOption | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      // 1. Check current active assignment
      const { data: assignments, error: assignError } = await supabase
        .from("coach_athlete_assignments")
        .select("id, coach_user_id")
        .eq("athlete_user_id", userId)
        .eq("is_active", true)
        .eq("athlete_approved", true)
        .limit(1);

      if (assignError) throw assignError;

      if (assignments && assignments.length > 0) {
        const a = assignments[0];
        const { data: profile } = await supabase.rpc("get_public_profile", {
          target_user_id: a.coach_user_id,
        });
        const p = profile?.[0];
        setCurrentCoach({
          assignment_id: a.id,
          coach_user_id: a.coach_user_id,
          display_name: p?.display_name || "Your Coach",
          avatar_url: p?.avatar_url || null,
        });
      }

      // 2. Fetch available coaches (marketplace-active)
      const { data: coaches, error: coachError } = await supabase
        .from("coach_marketplace_profiles")
        .select("user_id, specialties, tagline, avg_rating, total_sessions, photo_url")
        .eq("is_marketplace_active", true);

      if (coachError) throw coachError;

      if (coaches && coaches.length > 0) {
        const coachUserIds = coaches.map((c) => c.user_id);
        const { data: profiles } = await supabase.rpc("get_public_profiles_by_ids", {
          user_ids: coachUserIds,
        });
        const profileMap = new Map(
          (profiles || []).map((p: any) => [p.user_id, p])
        );

        setAvailableCoaches(
          coaches.map((c) => {
            const p = profileMap.get(c.user_id);
            return {
              user_id: c.user_id,
              display_name: p?.display_name || "Coach",
              avatar_url: c.photo_url || p?.avatar_url || null,
              specialties: c.specialties,
              tagline: c.tagline,
              avg_rating: c.avg_rating,
              total_sessions: c.total_sessions,
            };
          })
        );
      }
    } catch (err) {
      console.error("Error fetching coach data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCoach = async (coach: CoachOption) => {
    setSelecting(true);
    try {
      // Deactivate any existing assignments for this athlete
      await supabase
        .from("coach_athlete_assignments")
        .update({ is_active: false })
        .eq("athlete_user_id", userId)
        .eq("is_active", true);

      // Create new assignment (athlete-initiated = auto-approved)
      const { error } = await supabase
        .from("coach_athlete_assignments")
        .insert({
          coach_user_id: coach.user_id,
          athlete_user_id: userId,
          athlete_approved: true,
          approved_at: new Date().toISOString(),
          is_active: true,
        });

      if (error) throw error;

      setCurrentCoach({
        assignment_id: "",
        coach_user_id: coach.user_id,
        display_name: coach.display_name,
        avatar_url: coach.avatar_url,
      });

      setConfirmCoach(null);
      setShowPicker(false);

      toast({
        title: "Coach Selected!",
        description: `You're now connected with ${coach.display_name}.`,
      });

      // Refresh to get the real assignment ID
      fetchData();
    } catch (err: any) {
      console.error("Error selecting coach:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to select coach. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSelecting(false);
    }
  };

  const handleRemoveCoach = async () => {
    if (!currentCoach) return;
    setSelecting(true);
    try {
      await supabase
        .from("coach_athlete_assignments")
        .update({ is_active: false })
        .eq("athlete_user_id", userId)
        .eq("is_active", true);

      setCurrentCoach(null);
      toast({ title: "Coach removed", description: "You can select a new coach anytime." });
    } catch (err) {
      console.error("Error removing coach:", err);
    } finally {
      setSelecting(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" />
            MY COACH
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentCoach ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={currentCoach.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-display">
                    {currentCoach.display_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {currentCoach.display_name}
                  </p>
                  <p className="text-xs text-muted-foreground">Your assigned coach</p>
                </div>
                <Badge className="bg-primary/10 text-primary text-[10px]">ACTIVE</Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => setShowPicker(true)}
                >
                  Switch Coach
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-destructive hover:text-destructive"
                  onClick={handleRemoveCoach}
                  disabled={selecting}
                >
                  <X className="w-3 h-3 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                No coach selected yet
              </p>
              <Button
                variant="vault"
                size="sm"
                onClick={() => setShowPicker(true)}
              >
                Choose Your Coach
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coach Picker Dialog */}
      <Dialog open={showPicker} onOpenChange={setShowPicker}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-display">SELECT YOUR COACH</DialogTitle>
            <DialogDescription>
              Choose a coach to guide your training journey.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-2 py-2">
            {availableCoaches.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">
                No coaches available right now.
              </p>
            ) : (
              availableCoaches.map((coach) => (
                <button
                  key={coach.user_id}
                  onClick={() => setConfirmCoach(coach)}
                  className={`w-full text-left p-3 rounded-xl border transition-colors ${
                    confirmCoach?.user_id === coach.user_id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40 bg-card"
                  } ${
                    currentCoach?.coach_user_id === coach.user_id
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }`}
                  disabled={currentCoach?.coach_user_id === coach.user_id}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={coach.avatar_url || undefined} />
                      <AvatarFallback className="bg-muted text-muted-foreground font-display">
                        {coach.display_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">
                        {coach.display_name}
                      </p>
                      {coach.tagline && (
                        <p className="text-xs text-muted-foreground truncate">
                          {coach.tagline}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {coach.avg_rating && coach.avg_rating > 0 && (
                          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            {coach.avg_rating.toFixed(1)}
                          </span>
                        )}
                        {coach.specialties && coach.specialties.length > 0 && (
                          <div className="flex gap-1">
                            {coach.specialties.slice(0, 2).map((s) => (
                              <Badge
                                key={s}
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0"
                              >
                                {s}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {currentCoach?.coach_user_id === coach.user_id && (
                      <Badge className="text-[10px]">Current</Badge>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
          {confirmCoach && (
            <DialogFooter>
              <Button
                variant="vault"
                onClick={() => handleSelectCoach(confirmCoach)}
                disabled={selecting}
                className="w-full"
              >
                {selecting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <UserCheck className="w-4 h-4 mr-2" />
                )}
                Confirm — {confirmCoach.display_name}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SelectCoachWidget;
