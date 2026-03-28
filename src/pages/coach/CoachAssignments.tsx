import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, BookOpen, Search, Dumbbell, ListChecks } from "lucide-react";

const CoachAssignments = () => {
  const [search, setSearch] = useState("");

  const { data: user } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => { const { data } = await supabase.auth.getUser(); return data.user; },
  });

  const { data: athletes } = useQuery({
    queryKey: ["coach-athletes-assign", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_assigned_athlete_profiles", { coach_id: user!.id });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: homework, isLoading } = useQuery({
    queryKey: ["coach-homework", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("player_homework")
        .select("*")
        .eq("coach_user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
  });

  const getAthleteName = (id: string) =>
    athletes?.find((a: any) => a.user_id === id)?.display_name || "Athlete";

  const active = homework?.filter((h) => !h.is_completed) || [];
  const completed = homework?.filter((h) => h.is_completed) || [];

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display tracking-wide">DRILL & PROGRAM ASSIGNMENTS</h1>
        <p className="text-sm text-muted-foreground mt-1">Assign drills and track completion</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-display">{homework?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Total Assigned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-display">{completed.length}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-display">
              {homework?.length ? Math.round((completed.length / homework.length) * 100) : 0}%
            </p>
            <p className="text-xs text-muted-foreground">Completion Rate</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-3 mt-4">
          {active.length === 0 ? (
            <Card><CardContent className="py-12 text-center">
              <Dumbbell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No active assignments</p>
            </CardContent></Card>
          ) : (
            active.map((hw) => (
              <Card key={hw.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{hw.title}</p>
                      <p className="text-xs text-muted-foreground">{getAthleteName(hw.athlete_user_id)}</p>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  {hw.description && <p className="text-xs text-muted-foreground mt-2">{hw.description}</p>}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3 mt-4">
          {completed.map((hw) => (
            <Card key={hw.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{hw.title}</p>
                    <p className="text-xs text-muted-foreground">{getAthleteName(hw.athlete_user_id)}</p>
                  </div>
                  <Badge>Completed</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoachAssignments;
