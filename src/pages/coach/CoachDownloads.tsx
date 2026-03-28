import { useState } from "react";
import { Download, FileText, Users, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  generateDevelopmentReport,
  generateRosterReport,
  generateCoachLessonCSV,
} from "@/lib/downloadReports";

const CoachDownloads = () => {
  const [genRoster, setGenRoster] = useState(false);
  const [genCSV, setGenCSV] = useState(false);
  const [genAthleteId, setGenAthleteId] = useState<string | null>(null);

  const { data: user } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["coach-profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("display_name").eq("user_id", user!.id).single();
      return data;
    },
  });

  const { data: athletes } = useQuery({
    queryKey: ["coach-assigned-athletes-dl", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase.rpc("get_assigned_athlete_profiles", { coach_id: user!.id });
      return (data || []) as { user_id: string; display_name: string; player_position?: string }[];
    },
  });

  const { data: devScores } = useQuery({
    queryKey: ["coach-athlete-devscores", user?.id],
    enabled: !!user?.id && !!athletes?.length,
    queryFn: async () => {
      const ids = athletes!.map((a) => a.user_id);
      const { data } = await supabase.from("athlete_development_scores").select("*").in("user_id", ids);
      return new Map((data || []).map((d: any) => [d.user_id, d]));
    },
  });

  const { data: lessons } = useQuery({
    queryKey: ["coach-lessons-dl", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("remote_lessons")
        .select("*")
        .eq("coach_user_id", user!.id)
        .order("scheduled_at", { ascending: false })
        .limit(500);
      return data || [];
    },
  });

  const athleteNameMap = new Map((athletes || []).map((a) => [a.user_id, a.display_name]));

  const handleRosterReport = async () => {
    setGenRoster(true);
    try {
      const rows = (athletes || []).map((a) => {
        const dev = devScores?.get(a.user_id);
        const lastLesson = lessons?.find((l: any) => l.athlete_user_id === a.user_id);
        return {
          name: a.display_name,
          position: a.player_position,
          readinessScore: dev?.overall_score,
          complianceRate: dev?.homework_total > 0
            ? Math.round((dev.homework_completed / dev.homework_total) * 100)
            : undefined,
          lastLessonDate: lastLesson ? format(new Date(lastLesson.scheduled_at), "MMM d, yyyy") : undefined,
          topPriority: dev?.weekly_focus,
        };
      });
      generateRosterReport(profile?.display_name || "Coach", rows);
      toast.success("Roster report downloaded");
    } catch { toast.error("Failed to generate roster report"); }
    finally { setGenRoster(false); }
  };

  const handleLessonCSV = async () => {
    setGenCSV(true);
    try {
      const rows = (lessons || []).map((l: any) => ({
        date: format(new Date(l.scheduled_at), "yyyy-MM-dd HH:mm"),
        athlete: athleteNameMap.get(l.athlete_user_id) || "Unknown",
        status: l.status,
        type: l.lesson_type || "live",
        duration: l.duration_minutes ? `${l.duration_minutes}min` : "",
        outcome: l.status === "completed" ? "Completed" : "",
      }));
      generateCoachLessonCSV(profile?.display_name || "Coach", rows);
      toast.success("Lesson CSV exported");
    } catch { toast.error("Failed to export CSV"); }
    finally { setGenCSV(false); }
  };

  const handleAthleteReport = async (athleteId: string) => {
    setGenAthleteId(athleteId);
    try {
      const ath = athletes?.find((a) => a.user_id === athleteId);
      const dev = devScores?.get(athleteId);
      const { data: kpis } = await supabase.from("athlete_kpis").select("*").eq("user_id", athleteId).order("recorded_at", { ascending: false }).limit(50);

      generateDevelopmentReport({
        displayName: ath?.display_name,
        position: ath?.player_position,
        coachName: profile?.display_name,
        dev,
        kpis: kpis as any,
        lessonCount: lessons?.filter((l: any) => l.athlete_user_id === athleteId).length,
      });
      toast.success("Athlete report downloaded");
    } catch { toast.error("Failed to generate report"); }
    finally { setGenAthleteId(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Download className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display tracking-wide">COACH DOWNLOADS</h1>
          <p className="text-sm text-muted-foreground">Export reports and data for your athletes</p>
        </div>
      </div>

      {/* Bulk reports */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-foreground text-sm">Roster Report</h3>
                <p className="text-[11px] text-muted-foreground">All athletes: readiness, compliance, priorities</p>
              </div>
            </div>
            <Button onClick={handleRosterReport} disabled={genRoster || !athletes?.length} className="w-full" size="sm">
              {genRoster ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Download className="w-4 h-4 mr-2" /> Download PDF</>}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-display text-foreground text-sm">Lesson History</h3>
                <p className="text-[11px] text-muted-foreground">All lessons as CSV for spreadsheet analysis</p>
              </div>
            </div>
            <Button onClick={handleLessonCSV} disabled={genCSV || !lessons?.length} className="w-full" size="sm">
              {genCSV ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Exporting...</> : <><Download className="w-4 h-4 mr-2" /> Export CSV</>}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Per-athlete reports */}
      {athletes && athletes.length > 0 && (
        <>
          <h2 className="font-display text-lg text-foreground mt-4">ATHLETE REPORTS</h2>
          <div className="space-y-2">
            {athletes.map((a) => {
              const dev = devScores?.get(a.user_id);
              return (
                <Card key={a.user_id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-display text-primary">{a.display_name?.charAt(0)?.toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{a.display_name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          Score: {dev?.overall_score ?? "—"}/100 • {a.player_position || "—"}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAthleteReport(a.user_id)}
                      disabled={genAthleteId === a.user_id}
                    >
                      {genAthleteId === a.user_id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <><FileText className="w-3 h-3 mr-1" /> PDF</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default CoachDownloads;
