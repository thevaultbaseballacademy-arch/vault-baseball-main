import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSport } from "@/contexts/SportContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Search, Calendar, Target, Activity } from "lucide-react";
import { format } from "date-fns";

const CoachAthletes = () => {
  const [search, setSearch] = useState("");
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);
  const { sport } = useSport();

  const { data: user } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });

  const { data: athletes, isLoading } = useQuery({
    queryKey: ["coach-athletes", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_assigned_athlete_profiles", {
        coach_id: user!.id,
      });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: recentLessons } = useQuery({
    queryKey: ["coach-athlete-lessons", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("remote_lessons")
        .select("athlete_user_id, scheduled_at, status")
        .eq("coach_user_id", user!.id)
        .order("scheduled_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: athleteKpis } = useQuery({
    queryKey: ["coach-athlete-kpis", user?.id, athletes],
    enabled: !!athletes && athletes.length > 0,
    queryFn: async () => {
      const ids = athletes!.map((a: any) => a.user_id);
      const { data, error } = await supabase
        .from("athlete_kpis")
        .select("user_id, kpi_name, kpi_value, kpi_category")
        .in("user_id", ids)
        .order("recorded_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: selectedDetail } = useQuery({
    queryKey: ["athlete-detail", selectedAthleteId],
    enabled: !!selectedAthleteId && !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_athlete_profile_for_coach", {
        coach_id: user!.id,
        athlete_id: selectedAthleteId!,
      });
      if (error) throw error;
      return data?.[0] || null;
    },
  });

  const getLastLesson = (athleteId: string) => {
    const lesson = recentLessons?.find((l) => l.athlete_user_id === athleteId && l.status === "completed");
    return lesson ? format(new Date(lesson.scheduled_at), "MMM d") : "—";
  };

  const getKpiSummary = (athleteId: string) => {
    const kpis = athleteKpis?.filter((k) => k.user_id === athleteId) || [];
    if (!kpis.length) return null;
    const categories = [...new Set(kpis.map((k) => k.kpi_category))];
    return categories.slice(0, 3);
  };

  const filtered = athletes?.filter((a: any) =>
    a.display_name?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (selectedAthleteId && selectedDetail) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedAthleteId(null)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to athletes
        </button>
        <div className="flex items-center gap-4">
          {selectedDetail.avatar_url ? (
            <img src={selectedDetail.avatar_url} className="w-16 h-16 rounded-full object-cover" alt="" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-2xl font-display text-muted-foreground">
              {selectedDetail.display_name?.[0] || "?"}
            </div>
          )}
          <div>
            <h2 className="text-xl font-display tracking-wide">{selectedDetail.display_name}</h2>
            <p className="text-sm text-muted-foreground">
              {selectedDetail.player_position || "No position"} • Class of {selectedDetail.graduation_year || "—"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Physical</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-1 text-muted-foreground">
              <p>Height: {selectedDetail.height_inches ? `${Math.floor(selectedDetail.height_inches / 12)}'${selectedDetail.height_inches % 12}"` : "—"}</p>
              <p>Weight: {selectedDetail.weight_lbs ? `${selectedDetail.weight_lbs} lbs` : "—"}</p>
              <p>Throws: {selectedDetail.throwing_arm || "—"}</p>
              <p>Bats: {selectedDetail.batting_side || "—"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Lesson History</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>Last lesson: {getLastLesson(selectedDetail.user_id)}</p>
              <p>Total: {recentLessons?.filter((l) => l.athlete_user_id === selectedDetail.user_id).length || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">KPI Categories</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-1">
              {getKpiSummary(selectedDetail.user_id)?.map((cat) => (
                <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>
              )) || <p className="text-sm text-muted-foreground">No KPIs recorded</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display tracking-wide">MY ATHLETES</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Showing {sport === "softball" ? "🥎 Softball" : "⚾ Baseball"} athletes assigned to you
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search athletes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No athletes assigned yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((athlete: any) => (
            <Card
              key={athlete.user_id}
              className="cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => setSelectedAthleteId(athlete.user_id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {athlete.avatar_url ? (
                    <img src={athlete.avatar_url} className="w-10 h-10 rounded-full object-cover" alt="" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-display text-muted-foreground">
                      {athlete.display_name?.[0] || "?"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{athlete.display_name}</p>
                    <p className="text-xs text-muted-foreground">{athlete.player_position || "No position"}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {getLastLesson(athlete.user_id)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {getKpiSummary(athlete.user_id)?.map((cat) => (
                    <Badge key={cat} variant="outline" className="text-[10px] px-1.5 py-0">{cat}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoachAthletes;
