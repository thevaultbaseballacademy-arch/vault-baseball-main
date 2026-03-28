import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2, Clock, Calendar } from "lucide-react";
import { toast } from "sonner";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const CoachSchedule = () => {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => { const { data } = await supabase.auth.getUser(); return data.user; },
  });

  const { data: availability, isLoading } = useQuery({
    queryKey: ["coach-availability", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_availability")
        .select("*")
        .eq("coach_user_id", user!.id)
        .order("day_of_week");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: bookings } = useQuery({
    queryKey: ["coach-bookings", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("session_bookings")
        .select("*")
        .eq("coach_user_id", user!.id)
        .gte("session_date", new Date().toISOString().split("T")[0])
        .order("session_date")
        .limit(20);
      if (error) throw error;
      return data || [];
    },
  });

  const toggleAvailability = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("coach_availability").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-availability"] });
      toast.success("Availability updated");
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display tracking-wide">MY SCHEDULE</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage availability and view bookings</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Weekly Availability</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {availability?.length === 0 ? (
            <p className="text-sm text-muted-foreground">No availability slots configured yet. Set up your schedule to start receiving bookings.</p>
          ) : (
            availability?.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium">{DAYS[slot.day_of_week]}</p>
                  <p className="text-xs text-muted-foreground">{slot.start_time} – {slot.end_time}</p>
                </div>
                <Switch
                  checked={slot.is_active}
                  onCheckedChange={(checked) => toggleAvailability.mutate({ id: slot.id, is_active: checked })}
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Upcoming Bookings</CardTitle></CardHeader>
        <CardContent>
          {!bookings?.length ? (
            <div className="py-8 text-center">
              <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No upcoming bookings</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{b.athlete_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.session_date} at {b.session_time} • {b.session_type?.replace(/_/g, " ")}
                    </p>
                  </div>
                  <Badge variant={b.status === "confirmed" ? "default" : "outline"}>{b.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CoachSchedule;
