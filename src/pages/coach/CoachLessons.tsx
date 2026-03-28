import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Calendar, Video, FileText, Download } from "lucide-react";
import { format, isPast, isFuture } from "date-fns";
import { toast } from "sonner";

const CoachLessons = () => {
  const { data: user } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => { const { data } = await supabase.auth.getUser(); return data.user; },
  });

  const { data: lessons, isLoading } = useQuery({
    queryKey: ["coach-lessons", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("remote_lessons")
        .select("*")
        .eq("coach_user_id", user!.id)
        .order("scheduled_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: feedback } = useQuery({
    queryKey: ["coach-feedback", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_lesson_feedback")
        .select("lesson_id")
        .eq("coach_user_id", user!.id);
      if (error) throw error;
      return new Set((data || []).map((f) => f.lesson_id));
    },
  });

  const { data: athletes } = useQuery({
    queryKey: ["coach-athletes-names", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_assigned_athlete_profiles", { coach_id: user!.id });
      if (error) throw error;
      return new Map((data || []).map((a: any) => [a.user_id, a.display_name]));
    },
  });

  const upcoming = lessons?.filter((l) => isFuture(new Date(l.scheduled_at)) && l.status !== "cancelled") || [];
  const past = lessons?.filter((l) => isPast(new Date(l.scheduled_at)) || l.status === "completed") || [];
  const totalCompleted = lessons?.filter((l) => l.status === "completed").length || 0;

  const statusColor = (s: string) => {
    switch (s) {
      case "completed": return "default";
      case "confirmed": return "secondary";
      case "cancelled": return "destructive";
      default: return "outline";
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  const exportCSV = () => {
    if (!lessons?.length) { toast.error("No lessons to export"); return; }
    const header = "Date,Athlete,Status,Type\n";
    const rows = lessons.map((l) =>
      `"${format(new Date(l.scheduled_at), "yyyy-MM-dd HH:mm")}","${athletes?.get(l.athlete_user_id) || "Unknown"}","${l.status}","${(l as any).lesson_type || "live"}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Vault_LessonHistory_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Lesson history exported");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display tracking-wide">LESSON MANAGEMENT</h1>
          <p className="text-sm text-muted-foreground mt-1">{totalCompleted} lessons completed</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="w-4 h-4 mr-1" /> Export CSV
        </Button>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="history">History ({past.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-3 mt-4">
          {upcoming.length === 0 ? (
            <Card><CardContent className="py-12 text-center">
              <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No upcoming lessons</p>
            </CardContent></Card>
          ) : (
            upcoming.map((lesson) => (
              <Card key={lesson.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{athletes?.get(lesson.athlete_user_id) || "Athlete"}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(lesson.scheduled_at), "EEE, MMM d 'at' h:mm a")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {(lesson as any).lesson_type === "video_review" && <Video className="w-4 h-4 text-muted-foreground" />}
                    <Badge variant={statusColor(lesson.status)}>{lesson.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-3 mt-4">
          {past.slice(0, 50).map((lesson) => (
            <Card key={lesson.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{athletes?.get(lesson.athlete_user_id) || "Athlete"}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(lesson.scheduled_at), "MMM d, yyyy")}</p>
                </div>
                <div className="flex items-center gap-2">
                  {feedback?.has(lesson.id) && (
                    <Badge variant="outline" className="text-[10px]"><FileText className="w-3 h-3 mr-0.5" /> Notes</Badge>
                  )}
                  <Badge variant={statusColor(lesson.status)}>{lesson.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoachLessons;
